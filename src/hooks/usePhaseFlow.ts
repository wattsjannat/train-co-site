'use client';

import { useState, useCallback, useEffect, useRef } from "react";
import type { GenerativeSection } from "@/types/flow";
import { informTele, teleAcknowledge } from "@/utils/teleUtils";
import { getVisitorSession, saveVisitorSession } from "@/utils/visitorMemory";
import { categorizeFit } from "@/utils/categorizeFit";
import { extractMatchScorePair } from "@/utils/scoredJobFields";
import { pickJobDescription } from "@/utils/jobCacheLookup";
import { generateAiSummary, generateAiGapInsight } from "@/utils/jobInsights";
import type { SkillRef, SkillGapRef } from "@/utils/jobInsights";
import { resolveJobsArray, patchSiteFunctions, fetchJobs, fetchSkills, fetchCareerGrowth, fetchMarketRelevance } from "@/platform/mcpBridge";
import { readCache, loadIntoCache as loadIntoCacheBridge } from "@/platform/mcpCacheBridge";
import { useTeleSpeech } from "@/hooks/useTeleSpeech";
import { EVENT_NAVIGATE_POP_JOB_BROWSE } from "@/utils/teleUtils";
import { registerSiteFunctions } from "@/site-functions/register";
import { useVoiceSessionStore } from "@/platform/stores/voice-session-store";
import { teleState } from "@/platform/teleState";
import { logMcpUiStore, logMcpUiMilestone } from "@/utils/mcpUiDebug";

const INITIAL_SECTIONS: GenerativeSection[] = [
  { id: "welcome", templateId: "WelcomeLanding", props: {} },
];

const WAIT_FOR_USER_TEMPLATES = new Set([
  "GlassmorphicOptions",
  "MultiSelectOptions",
  "TextInput",
  "RegistrationForm",
  "CardStack",
  "SavedJobsStack",
  "Dashboard",
  "CandidateSheet",
  "JobCandidateView",
]);

function shouldDisableNewResponse(sections: GenerativeSection[]): boolean {
  return sections.some((s) => WAIT_FOR_USER_TEMPLATES.has(s.templateId));
}

/** Suppress duplicate `call_site_function` navigate payloads within a short window (agent double-RPC). */
const NAVIGATE_DEDUPE_MS = 1800;

function navigatePayloadFingerprint(sections: GenerativeSection[]): string {
  try {
    return JSON.stringify(
      sections.map((s) => {
        const p = (s.props ?? {}) as Record<string, unknown>;
        const upd = (s as { _update?: boolean })._update === true;
        const base: Record<string, unknown> = {
          id: s.id,
          templateId: s.templateId,
          _update: upd,
          progressStep: p.progressStep,
          bubbleLabels: Array.isArray(p.bubbles)
            ? (p.bubbles as { label?: string }[]).map((b) => b.label)
            : undefined,
        };
        /** CandidateSheet retries often add *Json strings in a second RPC — old fingerprint deduped them away. */
        if (s.templateId === "CandidateSheet") {
          base.candidateId = p.candidateId;
          const len = (k: string) => (typeof p[k] === "string" ? (p[k] as string).length : 0);
          base.rawBlobLens =
            len("rawCandidateJson") +
            len("rawSkillProgressionJson") +
            len("rawMarketRelevanceJson") +
            len("rawCareerGrowthJson");
        }
        return base;
      }),
    );
  } catch {
    return "navigate-fp-fallback";
  }
}

function getActiveMultiSelectFingerprint(sections: GenerativeSection[]): string | null {
  for (let i = sections.length - 1; i >= 0; i--) {
    const s = sections[i];
    if (s.templateId !== "MultiSelectOptions") continue;
    const id = typeof s.id === "string" ? s.id : "";
    const step = s.props?.progressStep;
    if (typeof step === "number") return `${id}\0step:${step}`;
    const bubbles = s.props?.bubbles;
    if (Array.isArray(bubbles) && bubbles.length > 0) {
      const keys = bubbles
        .map((b) =>
          b && typeof b === "object" && b !== null && "label" in b
            ? String((b as { label: unknown }).label)
            : "",
        )
        .join("|");
      return `${id}\0bubbles:${keys}`;
    }
    return `${id}\0default`;
  }
  return null;
}

/** Topmost MultiSelect `props.progressStep` (0=industry, 1=role, 2=priority in canonical payloads). */
function getTopMultiSelectProgressStep(sections: GenerativeSection[]): number | null {
  for (let i = sections.length - 1; i >= 0; i--) {
    const s = sections[i];
    if (s.templateId !== "MultiSelectOptions") continue;
    const step = s.props?.progressStep;
    if (typeof step === "number") return step;
  }
  return null;
}

function getActiveGlassmorphicKey(sections: GenerativeSection[]): string | null {
  for (let i = sections.length - 1; i >= 0; i--) {
    const s = sections[i];
    if (s.templateId !== "GlassmorphicOptions") continue;
    const id = typeof s.id === "string" ? s.id : "";
    return `glass:${id}`;
  }
  return null;
}

function getTopGlassmorphicKeyFromIncoming(sections: GenerativeSection[]): string | null {
  for (let i = sections.length - 1; i >= 0; i--) {
    const s = sections[i];
    if (s.templateId !== "GlassmorphicOptions") continue;
    const id = typeof s.id === "string" ? s.id : "";
    return `glass:${id}`;
  }
  return null;
}

function getActiveTextInputKey(sections: GenerativeSection[]): string | null {
  for (let i = sections.length - 1; i >= 0; i--) {
    const s = sections[i];
    if (s.templateId !== "TextInput") continue;
    const id = typeof s.id === "string" ? s.id : "";
    return `text:${id}`;
  }
  return null;
}

function getTopTextInputKeyFromIncoming(sections: GenerativeSection[]): string | null {
  for (let i = sections.length - 1; i >= 0; i--) {
    const s = sections[i];
    if (s.templateId !== "TextInput") continue;
    const id = typeof s.id === "string" ? s.id : "";
    return `text:${id}`;
  }
  return null;
}

type UpdatableSection = GenerativeSection & { _update?: boolean };

const RESERVED_SECTION_KEYS = new Set([
  "id",
  "templateId",
  "props",
  "generativeSubsections",
  "value",
  "_update",
  "_sessionEstablished",
]);

function asObject(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function unwrapValuePayload(value: unknown): unknown {
  let current = value;
  for (let i = 0; i < 3; i++) {
    const obj = asObject(current);
    if (!obj) break;
    const inner = asObject(obj.value);
    if (!inner) break;
    const hasTopLevelSectionShape =
      "generativeSubsections" in obj || "templateId" in obj || "id" in obj;
    if (hasTopLevelSectionShape) break;
    current = inner;
  }
  return current;
}

function normalizeSection(raw: unknown, index: number): UpdatableSection | null {
  const obj = asObject(raw);
  if (!obj || typeof obj.templateId !== "string" || !obj.templateId.trim()) {
    return null;
  }

  const propsObj = asObject(obj.props) ?? {};
  const rootProps = Object.fromEntries(
    Object.entries(obj).filter(([key]) => !RESERVED_SECTION_KEYS.has(key))
  );

  return {
    id:
      typeof obj.id === "string" && obj.id.trim()
        ? obj.id
        : `${obj.templateId}-${Date.now()}-${index}`,
    templateId: obj.templateId,
    props: {
      ...rootProps,
      ...propsObj,
    },
    _update: obj._update === true,
  };
}

function extractIncomingSections(value: unknown): UpdatableSection[] {
  const unwrapped = unwrapValuePayload(value);

  if (Array.isArray(unwrapped)) {
    return unwrapped
      .map((entry, index) => normalizeSection(entry, index))
      .filter((s): s is UpdatableSection => !!s);
  }

  const obj = asObject(unwrapped);
  if (!obj) return [];

  if (Array.isArray(obj.generativeSubsections)) {
    return obj.generativeSubsections
      .map((entry, index) => normalizeSection(entry, index))
      .filter((s): s is UpdatableSection => !!s);
  }

  const single = normalizeSection(obj, 0);
  return single ? [single] : [];
}

function consumeSessionEstablished(sections: UpdatableSection[]): void {
  for (const section of sections) {
    const raw = section.props._sessionEstablished;
    if (raw && typeof raw === "object") {
      const { candidateId } = raw as { candidateId?: string };
      if (typeof candidateId === "string") {
        saveVisitorSession(candidateId);
      }
    }
    delete section.props._sessionEstablished;
  }
}

function normalizeNavigateToSectionPayload(args: unknown[]): unknown {
  if (args.length === 0) return null;
  if (args.length === 1) return args[0];

  const [badge, title, subtitle, generativeSubsections] = args;
  return {
    ...(typeof badge === "string" ? { badge } : {}),
    ...(typeof title === "string" ? { title } : {}),
    ...(typeof subtitle === "string" ? { subtitle } : {}),
    ...(generativeSubsections !== undefined ? { generativeSubsections } : {}),
  };
}

function mergeSection(base: GenerativeSection, incoming: UpdatableSection): GenerativeSection {
  return {
    id: incoming.id || base.id,
    templateId: incoming.templateId || base.templateId,
    props: {
      ...base.props,
      ...incoming.props,
    },
  };
}

function applyIncomingSections(
  prev: GenerativeSection[],
  incoming: UpdatableSection[]
): GenerativeSection[] {
  if (incoming.length === 0) return prev;

  const hasFullReplaceSection = incoming.some((s) => !s._update);
  const next = hasFullReplaceSection ? [] : [...prev];

  const findMatchIndex = (target: UpdatableSection): number => {
    if (target.id) {
      const byId = next.findIndex((s) => s.id === target.id);
      if (byId !== -1) return byId;
    }
    return next.findIndex((s) => s.templateId === target.templateId);
  };

  for (const section of incoming) {
    const matchInPrev = prev.find(
      (s) => s.id === section.id || s.templateId === section.templateId
    );

    if (section._update) {
      const matchIndex = findMatchIndex(section);
      if (matchIndex !== -1) {
        next[matchIndex] = mergeSection(next[matchIndex], section);
      } else if (matchInPrev) {
        next.push(mergeSection(matchInPrev, section));
      } else {
        next.push({
          id: section.id,
          templateId: section.templateId,
          props: section.props,
        });
      }
      continue;
    }

    if (matchInPrev) {
      next.push(mergeSection(matchInPrev, section));
    } else {
      next.push({
        id: section.id,
        templateId: section.templateId,
        props: section.props,
      });
    }
  }

  return next;
}

function sliceToJobBrowseAnchor(sections: GenerativeSection[]): GenerativeSection[] {
  const n = sections.length;
  if (n === 0) return sections;

  const top = sections[n - 1].templateId;
  if (top !== "JobDetailSheet" && top !== "EligibilitySheet") {
    return sections;
  }

  for (let i = n - 2; i >= 0; i--) {
    const tid = sections[i].templateId;
    if (tid === "JobSearchSheet" || tid === "SavedJobsStack") {
      return sections.slice(0, i + 1);
    }
  }
  return sections;
}

const TEMPLATES_NEEDING_JOBS = new Set([
  "CardStack",
  "CardStackJobPreviewSheet",
  "JobSearchSheet",
  "JobDetailSheet",
  /** Step 6 may pass `rawJobsJson` while CandidateSheet is visible — hydrate jobs cache for Step 7 CardStack without blocking on a second tool round-trip. */
  "CandidateSheet",
]);
const TEMPLATES_NEEDING_SKILLS = new Set(["ProfileSheet", "SkillCoverageSheet", "SkillsDetail", "SkillTestFlow", "TargetRoleSheet"]);
const TEMPLATES_NEEDING_CANDIDATE = new Set(["CandidateSheet", "ProfileSheet"]);
const TEMPLATES_NEEDING_CAREER_GROWTH = new Set([
  "CareerGrowthDetail",
  "CareerGrowthSheet",
  "ProfileSheet",
]);
const TEMPLATES_NEEDING_MARKET_RELEVANCE = new Set([
  "MarketRelevanceDetail",
  "MarketRelevanceSheet",
  "ProfileSheet",
]);

const DASHBOARD_COMPANION_TEMPLATES = new Set([
  "GlassmorphicOptions", "ProfileSheet", "SkillCoverageSheet",
  "JobSearchSheet", "JobDetailSheet", "EligibilitySheet",
  "CloseGapSheet", "JobApplicationsSheet", "PastApplicationsSheet",
  "SkillsDetail", "SkillTestFlow", "MarketRelevanceDetail", "CareerGrowthDetail",
  "MarketRelevanceSheet", "CareerGrowthSheet",
  "TargetRoleSheet", "MyLearningSheet",
  "SavedJobsStack",
]);

function buildJobLookupProps(props: Record<string, unknown>) {
  return { jobId: props.jobId, title: props.jobTitle, company: props.company };
}

/**
 * Agent may pass `rawJobsJson` / `raw_jobs_json` — a single JSON string (e.g. output of JSON.stringify
 * on the tool's `jobs` array or full tool object) so nested quotes in job descriptions do not break
 * `call_site_function` argument parsing when the model hand-rolls outer JSON.
 */
function expandRawJobsJsonIntoProps(props: Record<string, unknown>): void {
  const raw = props.rawJobsJson ?? props.raw_jobs_json;
  if (typeof raw !== "string" || !raw.trim()) return;
  try {
    let parsed = JSON.parse(raw.trim()) as unknown;
    parsed = normalizeToolPayload(parsed);
    delete props.rawJobsJson;
    delete props.raw_jobs_json;
    if (parsed == null) return;
    if (Array.isArray(parsed)) {
      props.rawJobs = parsed;
      logMcpUiStore("expandRawJobsJson → rawJobs[]", { length: parsed.length });
      return;
    }
    if (typeof parsed === "object") {
      const o = parsed as Record<string, unknown>;
      if (Array.isArray(o.jobs)) {
        props.rawJobs = o.jobs;
        logMcpUiStore("expandRawJobsJson → rawJobs from .jobs", { length: o.jobs.length });
        return;
      }
      props.rawJobs = o as Record<string, unknown>;
      logMcpUiStore("expandRawJobsJson → rawJobs object (non-array)", { rawSample: o });
    }
  } catch (e) {
    logMcpUiStore("expandRawJobsJson PARSE FAILED (rawJobsJson kept on props)", {
      error: e instanceof Error ? e.message : String(e),
    });
  }
}

/**
 * Safe JSON-string transport for large payload props that often break outer
 * call_site_function JSON when pasted as nested objects.
 */
function expandRawJsonPropIntoProps(
  props: Record<string, unknown>,
  sourceKey: string,
  targetKey: string,
): void {
  const raw = props[sourceKey];
  if (typeof raw !== "string" || !raw.trim()) return;
  try {
    const parsed = JSON.parse(raw.trim()) as unknown;
    delete props[sourceKey];
    props[targetKey] = parsed;
    logMcpUiStore(`expandRawJson ${sourceKey} → ${targetKey}`, {
      type: typeof parsed,
      isArray: Array.isArray(parsed),
      topKeys: parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? Object.keys(parsed as object).slice(0, 12)
        : undefined,
    });
  } catch (e) {
    logMcpUiStore(`PARSE FAILED: ${sourceKey} (kept on props, will not reach ${targetKey})`, {
      error: e instanceof Error ? e.message : String(e),
      rawSample: raw,
    });
  }
}

function parseMaybeJsonString(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return value;
  try {
    const once = JSON.parse(trimmed) as unknown;
    if (typeof once === "string") {
      try { return JSON.parse(once) as unknown; } catch { return once; }
    }
    return once;
  } catch {
    return value;
  }
}

/** Unwrap MCP text envelopes like `{ type: "text", text: "<json>" }`. */
function normalizeToolPayload(payload: unknown): unknown {
  const first = parseMaybeJsonString(payload);
  if (!first || typeof first !== "object" || Array.isArray(first)) return first;
  const obj = first as Record<string, unknown>;
  if (obj.type === "text" && typeof obj.text === "string") {
    return parseMaybeJsonString(obj.text);
  }
  return first;
}

function unwrapCandidate(cache: unknown): Record<string, unknown> | null {
  if (!cache || typeof cache !== "object") return null;
  const obj = cache as Record<string, unknown>;
  if (obj.name || obj.experience || obj.education) return obj;
  for (const key of ["data", "result"] as const) {
    const inner = obj[key];
    if (inner && typeof inner === "object") {
      const rec = inner as Record<string, unknown>;
      if (rec.name || rec.experience || rec.education) return rec;
    }
  }
  return obj;
}

function deriveCandidateTitle(cd: Record<string, unknown>): string | undefined {
  const exp = cd.experience;
  if (Array.isArray(exp) && exp.length > 0) {
    const entries = exp as Record<string, unknown>[];
    const current = entries.find((e) => e.is_current === true);
    if (current) return (current.title ?? current.role) as string | undefined;
    return (entries[0].title ?? entries[0].role) as string | undefined;
  }
  const prefs = cd.jobPreferences ?? cd.job_preferences;
  if (Array.isArray(prefs) && prefs.length > 0 && typeof prefs[0] === "string") {
    return prefs[0];
  }
  return undefined;
}

/** Fills CandidateSheet / ProfileSheet props from an unwrapped candidate record (MCP `get_candidate` body or cache). */
function mergeUnwrappedCandidateIntoProps(
  props: Record<string, unknown>,
  cd: Record<string, unknown>,
  templateId: string,
): Record<string, unknown> {
  const prefer = templateId === "ProfileSheet";
  const next = { ...props };
  const candidateName = (cd.name ?? cd.full_name ?? cd.display_name) as string | undefined;
  if (candidateName && (prefer || !next.name)) next.name = candidateName;
  const candidateTitle = (cd.title as string | undefined) ?? deriveCandidateTitle(cd);
  if (candidateTitle && (prefer || !next.title)) next.title = candidateTitle;
  if (cd.avatarUrl && (prefer || !next.avatarUrl)) next.avatarUrl = cd.avatarUrl as string;
  if (cd.avatar_url && (prefer || !next.avatarUrl)) next.avatarUrl = cd.avatar_url as string;
  if (!next.experience && cd.experience) next.experience = cd.experience;
  if (!next.education && cd.education) next.education = cd.education;
  return next;
}

function formatSalaryRange(rec: Record<string, unknown>): string | undefined {
  const min = rec.salary_min ?? rec.salaryMin;
  const max = rec.salary_max ?? rec.salaryMax;
  if (min != null && max != null) {
    const fmt = (v: unknown) => Number(v).toLocaleString("en-US");
    return `${fmt(min)} – ${fmt(max)}`;
  }
  return (rec.salaryRange ?? rec.salary_range) as string | undefined;
}

function extractJobProps(rec: Record<string, unknown>): Record<string, unknown> {
  const inner =
    rec.job && typeof rec.job === "object"
      ? (rec.job as Record<string, unknown>)
      : rec;

  const id = (inner.job_id ?? inner.id ?? inner.jobId) as string | undefined;
  const mergedForDesc = { ...inner, ...rec } as Record<string, unknown>;
  const matchScore = extractMatchScorePair(rec, inner as Record<string, unknown>);
  const fitCategory =
    (inner.fitCategory ??
    inner.fit_category ??
    rec.fitCategory ??
    rec.fit_category ??
    (matchScore != null ? categorizeFit(matchScore).category : undefined)) as string | undefined;

  const requiredSkills = (inner.required_skills ?? inner.requiredSkills ?? []) as SkillRef[];
  const recommendedSkills = (inner.recommended_skills ?? inner.recommendedSkills ?? []) as SkillRef[];
  const skillGaps = (rec.skill_gaps ?? rec.skillGaps ?? inner.skill_gaps ?? inner.skillGaps ?? []) as SkillGapRef[];

  let aiSummary = (inner.aiSummary ?? inner.ai_summary) as string | undefined;
  let aiGapInsight = (inner.aiGapInsight ?? inner.ai_gap_insight ?? inner.gap_insight) as string | undefined;

  if (!aiSummary && fitCategory && (requiredSkills.length > 0 || skillGaps.length > 0)) {
    aiSummary = generateAiSummary(
      fitCategory as "good-fit" | "stretch" | "grow-into",
      requiredSkills,
      recommendedSkills,
      skillGaps,
    );
  }
  if (aiGapInsight === undefined && fitCategory && skillGaps.length > 0) {
    aiGapInsight = generateAiGapInsight(skillGaps, fitCategory as "good-fit" | "stretch" | "grow-into");
  }

  return {
    id,
    jobId: id,
    title: inner.title,
    company: inner.company_name ?? inner.company,
    location: inner.location,
    salaryRange: formatSalaryRange(inner),
    description: pickJobDescription(mergedForDesc) ?? (inner.description as string | undefined),
    matchScore,
    fitCategory,
    requiredSkills,
    recommendedSkills,
    skillGaps,
    aiSummary,
    aiGapInsight,
    postedAt: (inner.postedAt ?? inner.posted_at ?? "") as string,
  };
}

function lookupJobFromCache(
  props: Record<string, unknown>,
  cache: unknown,
): Record<string, unknown> | null {
  const arr = resolveJobsArray(cache);
  const jobId = props.jobId as string | undefined;
  const title = (props.title as string | undefined)?.toLowerCase();
  const company = (props.company as string | undefined)?.toLowerCase();

  if (jobId) {
    for (const item of arr) {
      if (!item || typeof item !== "object") continue;
      const rec = item as Record<string, unknown>;
      const inner =
        rec.job && typeof rec.job === "object"
          ? (rec.job as Record<string, unknown>)
          : rec;
      if ((inner.id ?? inner.job_id ?? inner.jobId) === jobId) return extractJobProps(rec);
    }
  }

  if (title) {
    for (const item of arr) {
      if (!item || typeof item !== "object") continue;
      const rec = item as Record<string, unknown>;
      const inner =
        rec.job && typeof rec.job === "object"
          ? (rec.job as Record<string, unknown>)
          : rec;
      const iTitle = (inner.title as string | undefined)?.toLowerCase();
      const iCompany = ((inner.company_name ?? inner.company) as string | undefined)?.toLowerCase();
      if (iTitle === title && (!company || iCompany === company)) {
        return extractJobProps(rec);
      }
    }
  }

  return null;
}

const NAVIGATE_DRIFT_TIMEOUT_MS = 15000;

export function usePhaseFlow() {
  const [generativeSubsections, setGenerativeSections] =
    useState<GenerativeSection[]>(INITIAL_SECTIONS);
  const lastParseNudgeAtRef = useRef(0);
  const lastNavigateAtRef = useRef(0);
  const lastAppliedNavigateFingerprintRef = useRef<string | null>(null);
  const lastAppliedNavigateAtRef = useRef(0);
  const driftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sectionsRef = useRef<GenerativeSection[]>(INITIAL_SECTIONS);
  const multiSelectSubmittedRef = useRef(false);
  const multiSelectStepKeyRef = useRef<string | null>(null);
  /** Set when user taps Continue on MultiSelect — must match `prevProgressStep` to allow leaving that step (blocks agent advance on STT alone). */
  const multiSelectContinueStepRef = useRef<number | null>(null);
  /** Limits repeat `[CORRECTION]` spam when the agent retries navigate without Continue. */
  const lastMultiSelectCorrectionAtRef = useRef(0);
  /** One-shot Step 1 kick when voice connects on WelcomeLanding. */
  const sessionGreetingKickSentRef = useRef(false);
  const glassmorphicCommittedRef = useRef(false);
  const glassmorphicStepKeyRef = useRef<string | null>(null);
  const textInputCommittedRef = useRef(false);
  const textInputStepKeyRef = useRef<string | null>(null);
  /** True after `linkedin-continue` until CandidateSheet is applied (LinkedIn demo must show LoadingLinkedIn first). */
  const linkedInConnectPendingRef = useRef(false);

  const navigateToSection = useCallback(
    (...args: unknown[]): boolean | { disableNewResponseCreation: boolean } => {
      try {
        const data = normalizeNavigateToSectionPayload(args);
        if (data == null) return false;
        const parsed =
          typeof data === "object" && data !== null
            ? data
            : JSON.parse(data as string);
        const incoming = extractIncomingSections(parsed);
        if (incoming.length === 0) return false;

        if (incoming.some((s) => s.templateId === "RegistrationForm")) {
          linkedInConnectPendingRef.current = false;
        }

        if (driftTimerRef.current) {
          clearTimeout(driftTimerRef.current);
          driftTimerRef.current = null;
        }

        lastNavigateAtRef.current = Date.now();

        consumeSessionEstablished(incoming);

        const payloadFingerprint = navigatePayloadFingerprint(incoming);
        const dedupeNow = Date.now();
        if (
          payloadFingerprint === lastAppliedNavigateFingerprintRef.current &&
          dedupeNow - lastAppliedNavigateAtRef.current < NAVIGATE_DEDUPE_MS
        ) {
          return true;
        }

        const prevHasCandidateSheet = sectionsRef.current.some(
          (s) => s.templateId === "CandidateSheet",
        );
        const incomingHasDashboard = incoming.some(
          (s) => s.templateId === "Dashboard",
        );
        const incomingHasCardStack = incoming.some(
          (s) => s.templateId === "CardStack",
        );
        if (
          prevHasCandidateSheet &&
          incomingHasDashboard &&
          !incomingHasCardStack
        ) {
          informTele(
            "[CORRECTION] On 'Looks Good' you MUST show CardStack first. Never go directly to Dashboard. " +
              "Call navigateToSection with CardStack now. Same response: speak the job-count lines and call navigateToSection with " +
              '{"badge":"MOBEUS CAREER","title":"Job Matches","subtitle":"Top recommendations","generativeSubsections":[{"id":"jobs","templateId":"CardStack","props":{}}]}.',
          );
          return { disableNewResponseCreation: true };
        }

        const prevHasCardStack = sectionsRef.current.some((s) => s.templateId === "CardStack");
        const prevHasJobSearch = sectionsRef.current.some((s) => s.templateId === "JobSearchSheet");
        const incomingHasJobDetail = incoming.some((s) => s.templateId === "JobDetailSheet");
        if (incomingHasJobDetail && prevHasCardStack && !prevHasJobSearch) {
          for (let i = incoming.length - 1; i >= 0; i--) {
            if (incoming[i].templateId === "JobDetailSheet") incoming.splice(i, 1);
          }
          if (incoming.length === 0) {
            informTele(
              "[SYSTEM] CardStack onboarding: the job preview sheet is already on screen. " +
                "Do NOT open JobDetailSheet. Acknowledge in one sentence only — no navigateToSection, no navigateWithKnowledgeKey job_detail_sheet, no get_career_growth for that purpose.",
            );
            return { disableNewResponseCreation: true };
          }
        }

        const incomingHasJobSearch = incoming.some((s) => s.templateId === "JobSearchSheet");
        if (incomingHasJobSearch && prevHasCardStack && !prevHasJobSearch) {
          for (let i = incoming.length - 1; i >= 0; i--) {
            if (incoming[i].templateId === "JobSearchSheet") incoming.splice(i, 1);
          }
          if (incoming.length === 0) {
            informTele(
              "[SYSTEM] CardStack onboarding is active. Do NOT show JobSearchSheet during onboarding. " +
                "The CardStack is already visible. Stay on CardStack until 'user tapped: cards'.",
            );
            return { disableNewResponseCreation: true };
          }
        }

        for (let i = incoming.length - 1; i >= 0; i--) {
          const sec = incoming[i];
          if (sec.templateId === "GlassmorphicOptions" && sec.id === "begin-cta") {
            incoming.splice(i, 1);
          }
        }

        for (const s of incoming) {
          logMcpUiMilestone("navigateToSection incoming section", {
            templateId: s.templateId,
            subsectionId: s.id,
            isUpdate: (s as { _update?: boolean })._update === true,
            propKeys: s.props && typeof s.props === "object"
              ? Object.keys(s.props as object)
              : [],
            hasRawJobsJson: !!(s.props as Record<string, unknown>)?.rawJobsJson,
            hasRawJobs: !!(s.props as Record<string, unknown>)?.rawJobs,
            hasJobs: !!(s.props as Record<string, unknown>)?.jobs,
            hasRawSkillProgressionJson: !!(s.props as Record<string, unknown>)?.rawSkillProgressionJson,
            hasRawMarketRelevanceJson: !!(s.props as Record<string, unknown>)?.rawMarketRelevanceJson,
            hasRawCareerGrowthJson: !!(s.props as Record<string, unknown>)?.rawCareerGrowthJson,
          });
          let cache = readCache();
          if (TEMPLATES_NEEDING_JOBS.has(s.templateId)) {
            expandRawJobsJsonIntoProps(s.props as Record<string, unknown>);
          }
          expandRawJsonPropIntoProps(s.props as Record<string, unknown>, "rawCandidateJson", "rawCandidate");
          expandRawJsonPropIntoProps(s.props as Record<string, unknown>, "raw_candidate_json", "rawCandidate");
          expandRawJsonPropIntoProps(s.props as Record<string, unknown>, "rawSkillProgressionJson", "rawSkillProgression");
          expandRawJsonPropIntoProps(s.props as Record<string, unknown>, "raw_skill_progression_json", "rawSkillProgression");
          expandRawJsonPropIntoProps(s.props as Record<string, unknown>, "rawMarketRelevanceJson", "rawMarketRelevance");
          expandRawJsonPropIntoProps(s.props as Record<string, unknown>, "raw_market_relevance_json", "rawMarketRelevance");
          expandRawJsonPropIntoProps(s.props as Record<string, unknown>, "rawCareerGrowthJson", "rawCareerGrowth");
          expandRawJsonPropIntoProps(s.props as Record<string, unknown>, "raw_career_growth_json", "rawCareerGrowth");

          if (s.props?.rawSkillProgression) {
            const normalizedRawSkills = normalizeToolPayload(s.props.rawSkillProgression);
            const merged = {
              ...(cache.skills as Record<string, unknown> | null),
              ...(normalizedRawSkills as Record<string, unknown>),
            };
            loadIntoCacheBridge("skills", merged);
            logMcpUiMilestone("cache.skills ← navigate props", {
              templateId: s.templateId,
              subsectionId: s.id,
              keys: merged && typeof merged === "object" ? Object.keys(merged as object).slice(0, 24) : [],
              rawSample: merged,
            });
            s.props = { ...s.props, rawSkillProgression: merged };
            cache = readCache();
          }
          if (s.props?.rawCareerGrowth) {
            const normalizedRawCareer = normalizeToolPayload(s.props.rawCareerGrowth);
            loadIntoCacheBridge("careerGrowth", normalizedRawCareer);
            logMcpUiMilestone("cache.careerGrowth ← navigate props", {
              templateId: s.templateId,
              subsectionId: s.id,
              rawSample: normalizedRawCareer,
            });
            s.props = { ...s.props, rawCareerGrowth: normalizedRawCareer };
            cache = readCache();
          }
          if (s.props?.rawMarketRelevance) {
            const normalizedRawMarket = normalizeToolPayload(s.props.rawMarketRelevance);
            loadIntoCacheBridge("marketRelevance", normalizedRawMarket);
            logMcpUiMilestone("cache.marketRelevance ← navigate props", {
              templateId: s.templateId,
              subsectionId: s.id,
              rawSample: normalizedRawMarket,
            });
            s.props = { ...s.props, rawMarketRelevance: normalizedRawMarket };
            cache = readCache();
          }

          if (TEMPLATES_NEEDING_SKILLS.has(s.templateId) && !s.props?.rawSkillProgression && cache.skills) {
            s.props = { ...s.props, rawSkillProgression: cache.skills };
          } else if (TEMPLATES_NEEDING_SKILLS.has(s.templateId) && !cache.skills) {
            void fetchSkills("ai-engineer");
          }
          if (TEMPLATES_NEEDING_JOBS.has(s.templateId) && s.props?.rawJobs != null) {
            const rj = s.props.rawJobs;
            if (Array.isArray(rj)) {
              loadIntoCacheBridge("jobs", { jobs: rj });
              logMcpUiMilestone("cache.jobs ← navigate props (array)", {
                templateId: s.templateId, subsectionId: s.id, count: rj.length,
              });
            } else if (typeof rj === "object") {
              loadIntoCacheBridge("jobs", rj);
              const arr = resolveJobsArray(rj);
              logMcpUiMilestone("cache.jobs ← navigate props (object)", {
                templateId: s.templateId, subsectionId: s.id, resolvedCount: arr.length, rawSample: rj,
              });
              if (arr.length) {
                s.props = { ...s.props, rawJobs: arr };
              } else {
                const next = { ...(s.props as Record<string, unknown>) };
                delete next.rawJobs;
                s.props = next;
                logMcpUiStore("cache.jobs ← navigate props — resolveJobsArray returned 0, rawJobs removed", {
                  templateId: s.templateId, subsectionId: s.id, rawSample: rj,
                });
              }
            }
            cache = readCache();
          }
          if (TEMPLATES_NEEDING_JOBS.has(s.templateId) && !s.props?.rawJobs && !s.props?.jobs) {
            if (cache.jobs) {
              const jobsArr = resolveJobsArray(cache.jobs);
              if (jobsArr.length > 0) {
                const normalized = jobsArr.map((item) =>
                  item && typeof item === "object"
                    ? extractJobProps(item as Record<string, unknown>)
                    : item,
                );
                const injected = s.templateId === "CardStack" ? normalized.slice(0, 3) : normalized;
                s.props = { ...s.props, jobs: injected };
                logMcpUiMilestone("jobs injected from cache → props", {
                  templateId: s.templateId, subsectionId: s.id, count: injected.length,
                });
              } else {
                logMcpUiStore("WARN: cache.jobs exists but resolveJobsArray returned 0", {
                  templateId: s.templateId, subsectionId: s.id, rawSample: cache.jobs,
                });
              }
            } else {
              logMcpUiStore("WARN: no jobs in cache and no rawJobs/jobs in props — fetching directly", {
                templateId: s.templateId, subsectionId: s.id,
              });
              const sess = getVisitorSession();
              if (sess) void fetchJobs(sess.candidateId);
            }
          }
          if (TEMPLATES_NEEDING_CANDIDATE.has(s.templateId)) {
            const rawCand = s.props?.rawCandidate ?? s.props?.raw_candidate;
            if (rawCand != null) {
              const normalizedRawCandidate = normalizeToolPayload(rawCand);
              loadIntoCacheBridge("candidate", normalizedRawCandidate);
              logMcpUiMilestone("cache.candidate ← navigate props", {
                templateId: s.templateId,
                subsectionId: s.id,
                rawSample: normalizedRawCandidate,
              });
              const cd = unwrapCandidate(normalizedRawCandidate);
              if (cd) {
                s.props = mergeUnwrappedCandidateIntoProps(
                  s.props as Record<string, unknown>,
                  cd,
                  s.templateId,
                );
              }
              const stripped = { ...(s.props as Record<string, unknown>) };
              delete stripped.rawCandidate;
              delete stripped.raw_candidate;
              s.props = stripped;
              cache = readCache();
            }
            if (cache.candidate) {
              const cd = unwrapCandidate(cache.candidate);
              if (cd) {
                s.props = mergeUnwrappedCandidateIntoProps(
                  s.props as Record<string, unknown>,
                  cd,
                  s.templateId,
                );
              }
            }
          }

          if (TEMPLATES_NEEDING_CAREER_GROWTH.has(s.templateId)) {
            if (cache.careerGrowth && !s.props?.rawCareerGrowth) {
              s.props = { ...s.props, rawCareerGrowth: cache.careerGrowth };
              logMcpUiStore("rawCareerGrowth injected from cache → props", {
                templateId: s.templateId, subsectionId: s.id, rawSample: cache.careerGrowth,
              });
            } else if (!cache.careerGrowth) {
              logMcpUiStore("WARN: cache.careerGrowth empty — fetching directly", {
                templateId: s.templateId, subsectionId: s.id,
              });
              const sess = getVisitorSession();
              if (sess) void fetchCareerGrowth(sess.candidateId);
            }
          }
          if (TEMPLATES_NEEDING_MARKET_RELEVANCE.has(s.templateId)) {
            if (cache.marketRelevance && !s.props?.rawMarketRelevance) {
              s.props = { ...s.props, rawMarketRelevance: cache.marketRelevance };
              logMcpUiStore("rawMarketRelevance injected from cache → props", {
                templateId: s.templateId, subsectionId: s.id, rawSample: cache.marketRelevance,
              });
            } else if (!cache.marketRelevance) {
              logMcpUiStore("WARN: cache.marketRelevance empty — fetching directly", {
                templateId: s.templateId, subsectionId: s.id,
              });
              const sess = getVisitorSession();
              if (sess) void fetchMarketRelevance(sess.candidateId);
            }
          }

          if (s.templateId === "JobDetailSheet" && (s.props?.jobId || s.props?.title) && cache.jobs) {
            const match = lookupJobFromCache(s.props, cache.jobs);
            if (match) {
              const defaults: Record<string, unknown> = {};
              for (const [key, val] of Object.entries(match)) {
                if (val != null && !s.props[key]) defaults[key] = val;
              }
              if (Object.keys(defaults).length > 0) {
                s.props = { ...defaults, ...s.props };
              }
            }
          }

          if (s.templateId === "EligibilitySheet" && (s.props?.jobId || s.props?.jobTitle) && cache.jobs) {
            const match = lookupJobFromCache(buildJobLookupProps(s.props), cache.jobs);
            if (match) {
              if (!s.props.matchScore && match.matchScore != null) s.props = { ...s.props, matchScore: match.matchScore };
              if (!s.props.requiredSkills && match.requiredSkills) s.props = { ...s.props, requiredSkills: match.requiredSkills };
              if (!s.props.recommendedSkills && match.recommendedSkills) s.props = { ...s.props, recommendedSkills: match.recommendedSkills };
              if (!s.props.skillGaps && match.skillGaps) s.props = { ...s.props, skillGaps: match.skillGaps };
              if (!s.props.description && match.description) s.props = { ...s.props, description: match.description };
              if (!s.props.fitCategory && match.fitCategory) s.props = { ...s.props, fitCategory: match.fitCategory };
            }
          }

          if (s.templateId === "CloseGapSheet" && (s.props?.jobId || s.props?.jobTitle) && cache.jobs) {
            const match = lookupJobFromCache(buildJobLookupProps(s.props), cache.jobs);
            if (match) {
              if (!s.props.skillGaps && match.skillGaps) s.props = { ...s.props, skillGaps: match.skillGaps };
              if (!s.props.matchScore && match.matchScore != null) s.props = { ...s.props, matchScore: match.matchScore };
            }
          }

          if (s.templateId === "ProfileSheet" && !s.props?.name) {
            s.props = { ...s.props, name: "Your profile" };
          }
        }

        const hasDashboard = incoming.some((s) => s.templateId === "Dashboard");
        const hasOptions = incoming.some((s) => DASHBOARD_COMPANION_TEMPLATES.has(s.templateId));

        if (hasDashboard && !hasOptions) {
          const cache = readCache();
          incoming.push({
            id: "profile-home",
            templateId: "ProfileSheet",
            props: { dashboardAnchor: true },
          });
          const last = incoming[incoming.length - 1];
          if (last.templateId === "ProfileSheet" && TEMPLATES_NEEDING_SKILLS.has(last.templateId)) {
            if (!last.props?.rawSkillProgression && cache.skills) {
              last.props = { ...last.props, rawSkillProgression: cache.skills };
            }
          }
          if (last.templateId === "ProfileSheet" && TEMPLATES_NEEDING_MARKET_RELEVANCE.has(last.templateId)) {
            if (!last.props?.rawMarketRelevance && cache.marketRelevance) {
              last.props = { ...last.props, rawMarketRelevance: cache.marketRelevance };
            }
          }
          if (last.templateId === "ProfileSheet" && TEMPLATES_NEEDING_CAREER_GROWTH.has(last.templateId)) {
            if (!last.props?.rawCareerGrowth && cache.careerGrowth) {
              last.props = { ...last.props, rawCareerGrowth: cache.careerGrowth };
            }
          }
          if (last.templateId === "ProfileSheet" && TEMPLATES_NEEDING_CANDIDATE.has(last.templateId)) {
            if (cache.candidate) {
              const cd = unwrapCandidate(cache.candidate);
              if (cd) {
                last.props = mergeUnwrappedCandidateIntoProps(
                  last.props as Record<string, unknown>,
                  cd,
                  last.templateId,
                );
              }
            }
          }
          if (last.templateId === "ProfileSheet" && !last.props?.name) {
            last.props = { ...last.props, name: "Your profile" };
          }
          logMcpUiMilestone("Dashboard profile-home props (after cache inject)", {
            hasRawSkillProgression: !!last.props?.rawSkillProgression,
            hasRawMarketRelevance: !!last.props?.rawMarketRelevance,
            hasRawCareerGrowth: !!last.props?.rawCareerGrowth,
            name: last.props?.name,
            cacheState: {
              hasSkills: !!cache.skills,
              hasMarketRelevance: !!cache.marketRelevance,
              hasCareerGrowth: !!cache.careerGrowth,
              hasJobs: !!cache.jobs,
              hasCandidate: !!cache.candidate,
            },
          });
        }

        const hasBeginCta = incoming.some(
          (s) => s.templateId === "GlassmorphicOptions" && s.id === "begin-cta",
        );
        if (hasBeginCta && !hasDashboard) {
          incoming.unshift({
            id: "dashboard",
            templateId: "Dashboard",
            props: {},
          });
        }

        // Use a synchronous snapshot so back-to-back navigateToSection RPCs in the same tick
        // still see the previous navigation (e.g. Role MultiSelect) before the guard runs.
        // Previously sectionsRef was only updated inside setState, so the second call could
        // skip the MultiSelect guard and replace the screen with Priority/Registration.
        const prevSnapshot = sectionsRef.current;

        const prevHadLoadingLinkedIn = prevSnapshot.some(
          (s) => s.templateId === "LoadingLinkedIn",
        );
        const incomingHasCandidateSheet = incoming.some(
          (s) => s.templateId === "CandidateSheet",
        );
        const incomingHasLoadingLinkedIn = incoming.some(
          (s) => s.templateId === "LoadingLinkedIn",
        );
        if (
          linkedInConnectPendingRef.current &&
          incomingHasCandidateSheet &&
          !prevHadLoadingLinkedIn &&
          !incomingHasLoadingLinkedIn
        ) {
          informTele(
            "[SYSTEM] LinkedIn path: CandidateSheet arrived but LoadingLinkedIn was not the previous top section " +
              "(intermediate navigate or race). Applying CandidateSheet anyway so the user is not stuck on the spinner. " +
              "Prefer: show LoadingLinkedIn first, then tools, then CandidateSheet — do not replace LoadingLinkedIn with Dashboard-only payloads before review.",
          );
          /* Do not return — hosts often report RPC success even when we used to block here, leaving the UI frozen. */
        }
        const incomingHasCardStackForLinkedIn = incoming.some(
          (s) => s.templateId === "CardStack",
        );
        const incomingHasDashboardForLinkedIn = incoming.some(
          (s) => s.templateId === "Dashboard",
        );
        if (
          linkedInConnectPendingRef.current &&
          !incomingHasCandidateSheet &&
          (incomingHasCardStackForLinkedIn || incomingHasDashboardForLinkedIn)
        ) {
          informTele(
            "[CORRECTION] LinkedIn onboarding is incomplete. " +
              "Do NOT navigate to CardStack or Dashboard before CandidateSheet. " +
              "After LoadingLinkedIn + tools, call navigateToSection with CandidateSheet first (include rawCandidate/session props).",
          );
          return { disableNewResponseCreation: true };
        }

        let consumedMultiSelectContinue = false;

        const prevHasMultiSelect = prevSnapshot.some(
          (s) => s.templateId === "MultiSelectOptions",
        );
        const prevMultiFp = getActiveMultiSelectFingerprint(prevSnapshot);
        const incomingReplacesAll = incoming.some((s) => !s._update);
        const incomingMultiFp = getActiveMultiSelectFingerprint(
          incoming as GenerativeSection[],
        );
        // Role → Priority → Registration are all MultiSelectOptions; the old guard only checked
        // "incoming includes MultiSelect", so swapping steps without Continue incorrectly passed.
        const incomingKeepsSameMultiStep =
          incomingMultiFp != null &&
          prevMultiFp != null &&
          incomingMultiFp === prevMultiFp;
        const prevProgressStep = getTopMultiSelectProgressStep(prevSnapshot);
        const incomingProgressStep = getTopMultiSelectProgressStep(
          incoming as GenerativeSection[],
        );
        const incomingHasMultiSelect = incoming.some((s) => s.templateId === "MultiSelectOptions");

        // Guard: never jump to MultiSelectOptions (qualification) while WelcomeLanding is still
        // the active screen. The agent MUST call welcome_greeting (GlassmorphicOptions) first.
        const prevHasWelcomeLanding = prevSnapshot.some((s) => s.templateId === "WelcomeLanding");
        if (prevHasWelcomeLanding && incomingReplacesAll && incomingHasMultiSelect) {
          const nowCorr = Date.now();
          if (nowCorr - lastMultiSelectCorrectionAtRef.current >= 2600) {
            lastMultiSelectCorrectionAtRef.current = nowCorr;
            informTele(
              "[CORRECTION] WelcomeLanding is still active. You MUST call navigateWithKnowledgeKey " +
                "with key='welcome_greeting' FIRST to show the greeting bubbles before any qualification step. " +
                "Do NOT call qualification_industry, role, or any MultiSelectOptions key until the user selects from the welcome screen.",
            );
          }
          return false;
        }

        // Hard gate (belt-and-suspenders): if any MultiSelectOptions is on screen AND the user
        // has not yet tapped Continue (multiSelectContinueStepRef is null), reject every full-replace
        // navigation that would put a different MultiSelectOptions on screen.
        // This catches both navigateWithKnowledgeKey and direct navigateToSection calls.
        if (
          prevHasMultiSelect &&
          multiSelectContinueStepRef.current === null &&
          incomingReplacesAll &&
          incomingHasMultiSelect &&
          !incomingKeepsSameMultiStep
        ) {
          const nowHard = Date.now();
          if (nowHard - lastMultiSelectCorrectionAtRef.current >= 2600) {
            lastMultiSelectCorrectionAtRef.current = nowHard;
            informTele(
              "[CORRECTION] MultiSelectOptions is active and waiting for the user to tap Continue. " +
                "Do NOT navigate to a different qualification step before the user selects. " +
                "Wait for `user selected: <comma-separated selections>` via TellTele.",
            );
          }
          return false;
        }

        if (prevHasMultiSelect && incomingReplacesAll) {
          const emitMultiCorrection = (body: string) => {
            const nowCorr = Date.now();
            if (nowCorr - lastMultiSelectCorrectionAtRef.current >= 2600) {
              lastMultiSelectCorrectionAtRef.current = nowCorr;
              informTele(body);
            }
          };

          if (incomingKeepsSameMultiStep) {
            emitMultiCorrection(
              "[CORRECTION] MultiSelectOptions: the user has not tapped Continue yet. " +
                "Do NOT re-send the same screen — a full replace clears their chip selections. " +
                'Wait for `user selected: <comma-separated selections>` via TellTele.',
            );
            return false;
          }

          const advancing =
            typeof prevProgressStep === "number" &&
            typeof incomingProgressStep === "number" &&
            incomingProgressStep > prevProgressStep;

          const continueTokenMatches =
            typeof prevProgressStep === "number"
              ? multiSelectContinueStepRef.current === prevProgressStep
              : multiSelectContinueStepRef.current !== null;

          if (advancing) {
            if (!continueTokenMatches) {
              const stepHint =
                typeof prevProgressStep === "number" && typeof incomingProgressStep === "number"
                  ? ` UI is still on qualification progressStep ${prevProgressStep} (0=industry, 1=role, 2=priority); you attempted ${incomingProgressStep}.`
                  : "";
              emitMultiCorrection(
                "[CORRECTION] MultiSelectOptions: advance only after the user taps Continue (or voice continue/done). " +
                  "Chip picks and raw STT alone do **not** count — wait for TellTele `user selected: <comma-separated selections>`." +
                  stepHint +
                  " Do not call the next `navigateWithKnowledgeKey` until that line arrives.",
              );
              return false;
            }
            consumedMultiSelectContinue = true;
          } else if (incomingHasMultiSelect) {
            emitMultiCorrection(
              "[CORRECTION] MultiSelectOptions: cannot jump to a different multi-select without Continue on the current step. " +
                'Wait for `user selected: <comma-separated selections>` via TellTele.',
            );
            return false;
          } else {
            if (!continueTokenMatches) {
              emitMultiCorrection(
                "[CORRECTION] MultiSelectOptions: leave this step only after Continue — wait for `user selected: <comma-separated selections>` via TellTele before Registration or the next template.",
              );
              return false;
            }
            consumedMultiSelectContinue = true;
          }
        }

        const prevHasGlass = prevSnapshot.some(
          (s) => s.templateId === "GlassmorphicOptions",
        );
        const prevGlassKey = getActiveGlassmorphicKey(prevSnapshot);
        const incomingGlassKey = getTopGlassmorphicKeyFromIncoming(incoming);
        const incomingKeepsSameGlassStep =
          incomingGlassKey != null &&
          prevGlassKey != null &&
          incomingGlassKey === prevGlassKey;
        if (prevHasGlass && incomingReplacesAll && !glassmorphicCommittedRef.current) {
          if (incomingKeepsSameGlassStep) {
            informTele(
              "[CORRECTION] GlassmorphicOptions: the user has not chosen a bubble yet. " +
                "Do NOT re-send the same screen. " +
                'Wait for `user selected: <label>` via TellTele (tap or matching voice).',
            );
          } else {
            informTele(
              "[CORRECTION] GlassmorphicOptions is still active — the user has not finished this step. " +
                'Wait for `user selected: <label>` (tap or spoken match) before any navigation or next step.',
            );
          }
          return false;
        }

        const prevHasTextInput = prevSnapshot.some(
          (s) => s.templateId === "TextInput",
        );
        const prevTextKey = getActiveTextInputKey(prevSnapshot);
        const incomingTextKey = getTopTextInputKeyFromIncoming(incoming);
        const incomingKeepsSameTextStep =
          incomingTextKey != null &&
          prevTextKey != null &&
          incomingTextKey === prevTextKey;
        if (prevHasTextInput && incomingReplacesAll && !textInputCommittedRef.current) {
          if (incomingKeepsSameTextStep) {
            informTele(
              "[CORRECTION] TextInput: the user has not submitted yet. " +
                "Do NOT re-send the same screen. " +
                'Wait for `user typed: <value>` via TellTele after they tap the arrow or press Enter.',
            );
          } else {
            informTele(
              "[CORRECTION] TextInput is still active — wait for `user typed: <value>` (submit) before navigating away.",
            );
          }
          return false;
        }

        const incomingNeedsWait = incoming.some((s) =>
          WAIT_FOR_USER_TEMPLATES.has(s.templateId),
        );

        if (incoming.some((s) => s.templateId === "GlassmorphicOptions")) {
          informTele(
            "[SYSTEM HARD STOP] GlassmorphicOptions is now on screen. " +
              "Do NOT generate any more speech, audio, or tool calls. " +
              "Wait ONLY for `user selected:` from TellTele before your next response.",
          );
        }

        if (
          incomingHasMultiSelect &&
          !(prevHasMultiSelect && incomingKeepsSameMultiStep)
        ) {
          informTele(
            "[SYSTEM HARD STOP] MultiSelectOptions is now on screen. " +
              "Do NOT generate any more speech, audio, or tool calls (including navigateToSection / navigateWithKnowledgeKey). " +
              "Bubble or voice chip picks alone do NOT advance the journey. " +
              "Wait ONLY until the user taps Continue (or voice continue/done) and you receive " +
              "`user selected: <comma-separated selections>` via TellTele before your next response.",
          );
        }

        if (incoming.some((s) => s.templateId === "TextInput")) {
          informTele(
            "[SYSTEM HARD STOP] TextInput is now on screen. " +
              "Do NOT generate any more speech, audio, or tool calls. " +
              "Wait ONLY for `user typed: <value>` from TellTele before your next response.",
          );
        }

        const nextSections = applyIncomingSections(prevSnapshot, incoming);

        if (consumedMultiSelectContinue) {
          multiSelectContinueStepRef.current = null;
        }

        const fp = getActiveMultiSelectFingerprint(nextSections);
        if (fp == null) {
          multiSelectStepKeyRef.current = null;
        } else if (multiSelectStepKeyRef.current !== fp) {
          multiSelectStepKeyRef.current = fp;
          multiSelectSubmittedRef.current = false;
          multiSelectContinueStepRef.current = null;
        }

        const gk = getActiveGlassmorphicKey(nextSections);
        if (gk == null) {
          glassmorphicStepKeyRef.current = null;
        } else if (glassmorphicStepKeyRef.current !== gk) {
          glassmorphicStepKeyRef.current = gk;
          glassmorphicCommittedRef.current = false;
        }

        const tk = getActiveTextInputKey(nextSections);
        if (tk == null) {
          textInputStepKeyRef.current = null;
        } else if (textInputStepKeyRef.current !== tk) {
          textInputStepKeyRef.current = tk;
          textInputCommittedRef.current = false;
        }

        sectionsRef.current = nextSections;
        setGenerativeSections(nextSections);

        lastAppliedNavigateFingerprintRef.current = payloadFingerprint;
        lastAppliedNavigateAtRef.current = dedupeNow;

        if (linkedInConnectPendingRef.current && nextSections.some((s) => s.templateId === "CandidateSheet")) {
          linkedInConnectPendingRef.current = false;
        }

        try {
          const ids = nextSections.map((s) => s.templateId);
          window.dispatchEvent(
            new CustomEvent("tele-navigate-section", { detail: { templateIds: ids } })
          );
        } catch {}

        return incomingNeedsWait || shouldDisableNewResponse(nextSections)
          ? { disableNewResponseCreation: true }
          : true;
      } catch {
        const now = Date.now();
        if (now - lastParseNudgeAtRef.current > 1200) {
          lastParseNudgeAtRef.current = now;
          informTele(
            "[CORRECTION NEEDED] navigateToSection payload was invalid JSON. " +
              "Retry immediately with valid JSON (double quotes, no trailing commas, closed strings, closed braces). " +
              "Include root keys badge/title/subtitle/generativeSubsections and valid subsection objects."
          );
        }
      }

      return false;
    },
    []
  );

  /** Timer ref for the deferred Step-1 kick (cleared on unmount or early video-track trigger). */
  const kickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const KICK_MSG =
      "[SYSTEM] Voice session just connected. Do ONLY these two things now — nothing else: " +
      "(1) Speak a short welcome greeting. " +
      "(2) Call navigateWithKnowledgeKey with key='welcome_greeting' to show the Yes/No bubbles. " +
      "Do NOT call qualification_industry, role, priority, or any other key. " +
      "HARD STOP — wait for `user selected:` via TellTele before your next action.";

    /**
     * Schedule (or re-schedule) the kick after `delayMs`.
     * Calling this a second time with a shorter delay cancels the previous timer.
     */
    const scheduleKick = (delayMs: number) => {
      if (sessionGreetingKickSentRef.current) return;
      if (kickTimerRef.current !== null) clearTimeout(kickTimerRef.current);
      kickTimerRef.current = setTimeout(() => {
        kickTimerRef.current = null;
        if (sessionGreetingKickSentRef.current) return;
        const top = sectionsRef.current[sectionsRef.current.length - 1];
        if (top?.templateId !== "WelcomeLanding") return;
        const { kickAgentTurn } = useVoiceSessionStore.getState();
        sessionGreetingKickSentRef.current = true;
        void kickAgentTurn(KICK_MSG);

        // Self-healing recovery: if the agent fails to call welcome_greeting within
        // 8 s (speaks but never shows the options), apply it directly from the SPA.
        setTimeout(() => {
          const currentTop = sectionsRef.current[sectionsRef.current.length - 1];
          if (currentTop?.templateId !== "WelcomeLanding") return; // already navigated
          const nav = (
            window as unknown as {
              __siteFunctions?: { navigateWithKnowledgeKey?: (a: Record<string, unknown>) => unknown };
            }
          ).__siteFunctions?.navigateWithKnowledgeKey;
          if (typeof nav === "function") nav({ key: "welcome_greeting" });
        }, 8000);
      }, delayMs);
    };

    /**
     * Called when the room becomes ready. Schedules a 2-second fallback kick so
     * Step 1 always fires even if the avatar video track never arrives.
     */
    const onRoomReady = () => {
      if (sessionGreetingKickSentRef.current) return;
      const top = sectionsRef.current[sectionsRef.current.length - 1];
      if (top?.templateId !== "WelcomeLanding") return;
      const { room } = useVoiceSessionStore.getState();
      if (!room?.localParticipant) return;
      // Schedule a 2-second fallback — avatar video track may shorten this below.
      scheduleKick(2000);
    };

    // Fire when room connects.
    window.addEventListener("tele-connection-changed", onRoomReady);

    // Subscribe to the store: (a) catch room ready, (b) shorten the timer when
    // the avatar video track arrives so Step 1 starts right after the avatar appears.
    const unsubStore = useVoiceSessionStore.subscribe((state) => {
      if (state.room?.localParticipant) onRoomReady();
      // Avatar video track received → shorten the kick delay to 600 ms so
      // the avatar has just enough time to render before the agent speaks.
      if (state.avatarVideoTrack && !sessionGreetingKickSentRef.current) {
        scheduleKick(600);
      }
    });

    // Run immediately in case everything is already set (e.g. hot-reload).
    onRoomReady();
    if (useVoiceSessionStore.getState().avatarVideoTrack) scheduleKick(600);

    return () => {
      window.removeEventListener("tele-connection-changed", onRoomReady);
      unsubStore();
      if (kickTimerRef.current !== null) {
        clearTimeout(kickTimerRef.current);
        kickTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    registerSiteFunctions();

    const w = window as unknown as {
      UIFrameworkSiteFunctions?: Record<string, unknown>;
      __siteFunctions?: Record<string, unknown>;
    };

    w.UIFrameworkSiteFunctions ??= {};
    w.UIFrameworkSiteFunctions.navigateToSection = navigateToSection;

    w.__siteFunctions ??= {};
    w.__siteFunctions.navigateToSection = navigateToSection;

    // Lightweight gate consumed by navigateWithKnowledgeKey before it calls navigateToSection.
    // Each template is only "waiting" until the user commits (taps Continue / selects / submits).
    // Reading refs is synchronous so this is race-free even under rapid RPC bursts.
    w.__siteFunctions.isWaitingForUserInput = () =>
      sectionsRef.current.some((s) => {
        switch (s.templateId) {
          // MultiSelectOptions: waiting until Continue is tapped (multiSelectContinueStepRef set)
          case "MultiSelectOptions":
            return multiSelectContinueStepRef.current === null;
          // GlassmorphicOptions: waiting until a bubble is tapped (glassmorphicCommittedRef set)
          case "GlassmorphicOptions":
            return !glassmorphicCommittedRef.current;
          // TextInput: waiting until the user submits (textInputCommittedRef set)
          case "TextInput":
            return !textInputCommittedRef.current;
          // RegistrationForm: always block — form submission navigates away automatically
          case "RegistrationForm":
            return true;
          default:
            return false;
        }
      });

    patchSiteFunctions();
  }, [navigateToSection]);

  useEffect(() => {
    const handler = (ev: Event) => {
      const detail = (ev as CustomEvent<{ progressStep?: number }>).detail;
      const fromDetail = typeof detail?.progressStep === "number" ? detail.progressStep : null;
      const fromSections = getTopMultiSelectProgressStep(sectionsRef.current);
      const step =
        fromDetail ??
        (typeof fromSections === "number" ? fromSections : 0);
      multiSelectContinueStepRef.current = step;
      multiSelectSubmittedRef.current = true;
    };
    window.addEventListener("multi-select-submitted", handler);
    return () => window.removeEventListener("multi-select-submitted", handler);
  }, []);

  useEffect(() => {
    const onUserSelection = () => {
      if (sectionsRef.current.some((s) => s.templateId === "GlassmorphicOptions")) {
        glassmorphicCommittedRef.current = true;
      }
    };
    window.addEventListener("user-selection", onUserSelection);
    return () => window.removeEventListener("user-selection", onUserSelection);
  }, []);

  useEffect(() => {
    const onTextSubmitted = () => {
      if (sectionsRef.current.some((s) => s.templateId === "TextInput")) {
        textInputCommittedRef.current = true;
      }
    };
    window.addEventListener("text-input-submitted", onTextSubmitted);
    return () => window.removeEventListener("text-input-submitted", onTextSubmitted);
  }, []);

  const loadingLinkedInEnteredAtRef = useRef<number | null>(null);

  useEffect(() => {
    const handler = () => {
      linkedInConnectPendingRef.current = true;
      loadingLinkedInEnteredAtRef.current = Date.now();
      setGenerativeSections([
        {
          id: "loading-linkedin",
          templateId: "LoadingLinkedIn",
          props: { message: "Connecting with LinkedIn\u2026" },
        },
      ]);
      sectionsRef.current = [
        {
          id: "loading-linkedin",
          templateId: "LoadingLinkedIn",
          props: { message: "Connecting with LinkedIn\u2026" },
        },
      ];
    };
    window.addEventListener("linkedin-continue", handler);
    return () => window.removeEventListener("linkedin-continue", handler);
  }, []);

  const LINKEDIN_TOOLS_MIN_MS = 2500;
  const { speech } = useTeleSpeech();
  const linkedInSuccessNudgeFiredRef = useRef(false);
  useEffect(() => {
    const active = generativeSubsections[generativeSubsections.length - 1];
    if (active?.templateId !== "LoadingLinkedIn") {
      linkedInSuccessNudgeFiredRef.current = false;
      loadingLinkedInEnteredAtRef.current = null;
      return;
    }
    let enteredAt = loadingLinkedInEnteredAtRef.current;
    if (enteredAt == null) {
      loadingLinkedInEnteredAtRef.current = Date.now();
      enteredAt = loadingLinkedInEnteredAtRef.current;
    }
    const elapsed = Date.now() - enteredAt;
    if (elapsed < LINKEDIN_TOOLS_MIN_MS) return;

    const text = (speech ?? "").toLowerCase();
    const hasSuccessPhrase =
      text.includes("connected successfully") ||
      text.includes("has been connected") ||
      text.includes("profile is linked") ||
      text.includes("connection is complete") ||
      text.includes("successfully connected") ||
      text.includes("connection was successful");
    if (!hasSuccessPhrase || linkedInSuccessNudgeFiredRef.current) return;

    linkedInSuccessNudgeFiredRef.current = true;
    const timer = setTimeout(() => {
      teleAcknowledge(
        "[CORRECTION] You said the connection was successful. Call navigateToSection with CandidateSheet NOW. Do NOT speak again. Just call the tool.",
      );
    }, 500);
    return () => clearTimeout(timer);
  }, [generativeSubsections, speech]);

  useEffect(() => {
    const onThinkingStart = (event: Event) => {
      const detail = (event as CustomEvent<{ skipNavigateDrift?: boolean }>).detail;
      if (detail?.skipNavigateDrift) return;

      if (driftTimerRef.current) clearTimeout(driftTimerRef.current);
      const stampBefore = lastNavigateAtRef.current;
      driftTimerRef.current = setTimeout(() => {
        if (lastNavigateAtRef.current === stampBefore) {
          teleAcknowledge(
            "[SYSTEM CORRECTION] You spoke but FORGOT to call navigateToSection. " +
              "Trigger ONLY the missing part: call navigateToSection NOW with the payload for this step. " +
              "Do NOT speak again. Do NOT list or read options. Do NOT repeat what you already said. Just call the tool.",
          );
        }
      }, NAVIGATE_DRIFT_TIMEOUT_MS);
    };

    window.addEventListener("teleThinkingStart", onThinkingStart);
    return () => {
      window.removeEventListener("teleThinkingStart", onThinkingStart);
      if (driftTimerRef.current) clearTimeout(driftTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const onPopJobBrowse = () => {
      setGenerativeSections((prev) => {
        const next = sliceToJobBrowseAnchor(prev);
        if (next.length === prev.length) return prev;
        sectionsRef.current = next;
        return next;
      });
    };
    window.addEventListener(EVENT_NAVIGATE_POP_JOB_BROWSE, onPopJobBrowse);
    return () => window.removeEventListener(EVENT_NAVIGATE_POP_JOB_BROWSE, onPopJobBrowse);
  }, []);

  const wasConnectedRef = useRef(false);
  useEffect(() => {
    const onConnectionChange = (e: Event) => {
      const connected = (e as CustomEvent<{ connected: boolean }>).detail.connected;
      if (!connected && wasConnectedRef.current) {
        linkedInConnectPendingRef.current = false;
        multiSelectSubmittedRef.current = false;
        multiSelectContinueStepRef.current = null;
        multiSelectStepKeyRef.current = null;
        sessionGreetingKickSentRef.current = false;
        glassmorphicCommittedRef.current = false;
        glassmorphicStepKeyRef.current = null;
        textInputCommittedRef.current = false;
        textInputStepKeyRef.current = null;
        setGenerativeSections(INITIAL_SECTIONS);
        sectionsRef.current = INITIAL_SECTIONS;
      }
      wasConnectedRef.current = connected;
    };
    window.addEventListener("tele-connection-changed", onConnectionChange);
    return () =>
      window.removeEventListener("tele-connection-changed", onConnectionChange);
  }, []);

  return { generativeSubsections };
}
