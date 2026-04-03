'use client';
import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2 } from "lucide-react";
import { CardStack } from "@/components/ui/CardStack";
import { sendJobOpenedIntent, sendJobClosedIntent, sendCardsDismissedIntent } from "@/utils/teleIntent";
import { informTele } from "@/utils/teleUtils";
import { useSpeechFallbackNudge } from "@/hooks/useSpeechFallbackNudge";
import { navigateClientToDashboardLanding } from "@/utils/clientDashboardNavigate";
import { categorizeFit } from "@/utils/categorizeFit";
import { coerceMatchScore, extractMatchScorePair } from "@/utils/scoredJobFields";
import { lookupScoredJobFromCache, pickJobDescription } from "@/utils/jobCacheLookup";
import { useMcpCache } from "@/contexts/McpCacheContext";
import { logMcpUiMilestone } from "@/utils/mcpUiDebug";
import { resolveJobsArray } from "@/platform/mcpBridge";
import type { JobListing, BackendJobItem, FitCategory } from "@/types/flow";

/**
 * Sanitizes a string value for safe display:
 * - Strips newlines and backslashes
 * - Trims whitespace
 * - Truncates description to 120 chars at word boundary
 */
function sanitizeString(value: string | undefined | null, maxLength?: number): string | undefined {
  if (!value) return undefined;
  let s = value.replace(/[\r\n]+/g, " ").replace(/\\/g, "").trim();
  if (maxLength && s.length > maxLength) {
    s = s.slice(0, maxLength).replace(/\s+\S*$/, "") + "…";
  }
  return s || undefined;
}

/**
 * Maps raw get_jobs_by_skills items to the JobListing interface expected by CardStack.
 * All field mapping and sanitization is handled here so the AI only needs to pass the
 * raw backend array — no mapping or sanitization required in the prompt.
 *
 * Accepts both wrapped (`{ job: { id, title, … } }`) and flat (`{ id, title, … }`)
 * formats so the template is resilient to AI payload variations.
 */
function fmtSalaryRange(min?: number, max?: number): string | undefined {
  if (min == null || max == null) return undefined;
  const fmt = (v: number) => v.toLocaleString("en-US");
  return `${fmt(min)} – ${fmt(max)}`;
}

/** Maps one `get_jobs_by_skills` row (wrapped or flat) to {@link JobListing}. Exported for JobSearchSheet parity. */
export function mapBackendJob(item: BackendJobItem): JobListing | null {
  const j = item?.job ?? (item as unknown as BackendJobItem["job"]);
  const jr = j as BackendJobItem["job"] & Record<string, unknown>;
  const itemRec = item as unknown as Record<string, unknown>;

  const jobId = (jr.id ?? jr.job_id ?? itemRec.job_id ?? itemRec.id) as string | undefined;
  const jobTitle = (jr.title ?? itemRec.title) as string | undefined;
  if (!jobId || !jobTitle) return null;

  const mergedFlat = { ...itemRec, ...jr } as Record<string, unknown>;
  const matchScore =
    extractMatchScorePair(itemRec, jr) ??
    extractMatchScorePair(mergedFlat, jr) ??
    extractMatchScorePair(mergedFlat, mergedFlat);

  const fitRaw = item.fit_category ?? item.fitCategory ?? jr.fit_category ?? jr.fitCategory;
  const fitCategory: FitCategory | undefined =
    fitRaw === "good-fit" || fitRaw === "stretch" || fitRaw === "grow-into"
      ? fitRaw
      : matchScore != null
        ? categorizeFit(matchScore).category
        : undefined;

  const salaryRange =
    sanitizeString(j.salary_range) ?? fmtSalaryRange(j.salary_min, j.salary_max);

  const mergedForText = { ...itemRec, ...jr } as Record<string, unknown>;
  const longDesc =
    sanitizeString(pickJobDescription(mergedForText), 2000) ??
    sanitizeString(j.description, 2000) ??
    sanitizeString(typeof jr.ai_summary === "string" ? jr.ai_summary : undefined, 2000) ??
    sanitizeString(typeof jr.summary === "string" ? jr.summary : undefined, 2000);
  const cardBlurb = longDesc ? sanitizeString(longDesc.replace(/…$/, ""), 220) : undefined;
  const aiSummary =
    sanitizeString(typeof jr.ai_summary === "string" ? jr.ai_summary : undefined, 400) ??
    sanitizeString(typeof jr.summary === "string" ? jr.summary : undefined, 400) ??
    (cardBlurb ? sanitizeString(cardBlurb, 400) : undefined);

  const skillGaps =
    item.skill_gaps?.length && item.skill_gaps.every((g) => typeof g?.name === "string")
      ? item.skill_gaps.map((g) => g.name)
      : undefined;

  return {
    id: jobId,
    title: sanitizeString(jobTitle) ?? jobId,
    company: sanitizeString((jr.company ?? jr.company_name ?? itemRec.company_name ?? itemRec.company) as string | undefined) ?? "",
    location: sanitizeString((jr.location ?? itemRec.location) as string | undefined) ?? "",
    ...((jr.company_logo ?? itemRec.company_logo)
      ? { companyLogo: sanitizeString((jr.company_logo ?? itemRec.company_logo) as string) }
      : {}),
    ...(salaryRange ? { salaryRange: salaryRange } : {}),
    ...(cardBlurb ? { description: cardBlurb } : {}),
    ...(aiSummary ? { aiSummary } : {}),
    ...(j.required_skills?.length
      ? { tags: j.required_skills.map((s) => s.name).filter(Boolean) }
      : {}),
    ...(typeof jr.posted_at === "string" && jr.posted_at ? { postedAt: sanitizeString(jr.posted_at) } : {}),
    ...((jr.application_url ?? itemRec.application_url)
      ? { applicationUrl: sanitizeString((jr.application_url ?? itemRec.application_url) as string) }
      : {}),
    ...(matchScore != null ? { matchScore } : {}),
    ...(fitCategory ? { fitCategory } : {}),
    ...(skillGaps?.length ? { skillGaps } : {}),
  };
}

interface CardStackTemplateProps {
  /**
   * Raw items from get_jobs_by_skills — the AI passes these directly without mapping.
   * CardStackTemplate handles all field renaming and sanitization.
   */
  rawJobs?: BackendJobItem[];
  /** Already-mapped job listings (legacy / direct use). */
  jobs?: JobListing[];
  /** Job ID to visually highlight, set by the AI to draw attention to a specific role. */
  highlightedJobId?: string;
  /** Contextual label shown bottom-left (e.g. "Mobeus Career"). */
  footerLeft?: string;
  /** Contextual label shown bottom-right (e.g. "3 Matches Found"). */
  footerRight?: string;
}

export function enrichJobFromCache(job: JobListing, jobsCache: unknown): JobListing {
  const cached = lookupScoredJobFromCache(job.id, job.title, job.company, jobsCache);
  if (!cached) return job;

  const cachedRec = cached as Record<string, unknown>;
  const scoreRaw =
    coerceMatchScore(job.matchScore) ??
    coerceMatchScore(cached.match_score) ??
    coerceMatchScore(cached.score) ??
    coerceMatchScore(cached.match_percentage) ??
    extractMatchScorePair(cachedRec, cachedRec);

  const fitRaw =
    job.fitCategory ??
    (cached.fit_category as FitCategory | undefined) ??
    (cached.fitCategory as FitCategory | undefined) ??
    (scoreRaw != null ? categorizeFit(scoreRaw).category : undefined);

  const desc =
    job.description ??
    pickJobDescription(cached) ??
    (cached.description as string | undefined);

  return {
    ...job,
    location: job.location || (cached.location as string | undefined) || "",
    companyLogo: job.companyLogo ?? (cached.company_logo as string | undefined),
    salaryRange:
      job.salaryRange ??
      (cached.salary_range as string | undefined),
    description: desc ?? job.description,
    aiSummary:
      job.aiSummary ??
      (cached.ai_summary as string | undefined) ??
      (cached.aiSummary as string | undefined),
    matchScore: scoreRaw ?? job.matchScore,
    fitCategory: fitRaw ?? job.fitCategory,
  };
}

/**
 * Job discovery template — wraps the CardStack component.
 *
 * Persistent: stays visible until the AI calls navigateToSection with a new template.
 * No question bubble — TeleSpeechBubble in BaseLayout handles all speech display.
 *
 * Accepts either:
 *  - rawJobs: raw get_jobs_by_skills items → mapped and sanitized here
 *  - jobs: already-mapped JobListing array (legacy)
 *
 * After the cards render, sends a hidden high-priority instruction so the AI
 * speaks the tap/swipe instructions on its next response.
 *
 * Hybrid bottom sheet:
 *   - Card tap → opens CardStackJobPreviewSheet locally (Figma 6958:15709; not JobDetailSheet / browse flow)
 *   - Emits a canonical intent signal for opened job so the AI can acknowledge and explain
 *   - AI can optionally call navigateToSection with updated props to highlight a card
 */
export function CardStackTemplate({ rawJobs, jobs: jobsProp, highlightedJobId, footerLeft, footerRight }: CardStackTemplateProps) {
  const cache = useMcpCache();
  const resolvedJobs: JobListing[] = useMemo(() => {
    const slice = (rawJobs?.length ? rawJobs : jobsProp ?? []).slice(0, 3);
    const base: JobListing[] = slice
      .map((item) => mapBackendJob(item as BackendJobItem))
      .filter((j): j is JobListing => j != null);
    if (!cache.jobs || base.length === 0) return base;
    return base.map((j) => enrichJobFromCache(j, cache.jobs));
  }, [rawJobs, jobsProp, cache.jobs]);

  const isLoading = resolvedJobs.length === 0;
  const cacheJobLen = useMemo(() => resolveJobsArray(cache.jobs).length, [cache.jobs]);

  useEffect(() => {
    logMcpUiMilestone("CardStackTemplate render", {
      rawJobsLen: rawJobs?.length ?? 0,
      jobsPropLen: jobsProp?.length ?? 0,
      resolvedJobCount: resolvedJobs.length,
      isLoading,
      cacheJobsResolvedCount: cacheJobLen,
    });
  }, [rawJobs?.length, jobsProp?.length, resolvedJobs.length, isLoading, cacheJobLen]);

  // Recovery nudge: if CardStack mounts with no jobs, prompt the agent to fetch and deliver them.
  const nudgeSentRef = useRef(false);
  useEffect(() => {
    if (!isLoading || nudgeSentRef.current) return;
    const t = setTimeout(() => {
      if (nudgeSentRef.current) return;
      nudgeSentRef.current = true;
      informTele(
        "[SYSTEM] CardStack is on screen but has ZERO job cards. " +
        "The SPA is fetching job data automatically — do NOT call get_jobs_by_skills. " +
        "Do NOT call navigateToSection. Do NOT navigate to Dashboard. " +
        "Say a short line like 'Finding your best matches…' and wait — cards will appear automatically.",
      );
    }, 1200);
    return () => clearTimeout(t);
  }, [isLoading]);

  const [dismissed, setDismissed] = useState(false);
  const hasDismissedRef = useRef(false);

  const dismissAndSignalCards = useCallback(() => {
    if (hasDismissedRef.current) return;
    hasDismissedRef.current = true;
    setDismissed(true);
    void sendCardsDismissedIntent();
    navigateClientToDashboardLanding(false, { afterOnboardingCards: true });
  }, []);

  // Screen tap → navigate to Dashboard
  const handleBackdropTap = useCallback(() => {
    dismissAndSignalCards();
  }, [dismissAndSignalCards]);

  // All cards swiped → navigate to Dashboard (same signal as backdrop tap)
  const handleAllCardsSwiped = useCallback(() => {
    dismissAndSignalCards();
  }, [dismissAndSignalCards]);

  useSpeechFallbackNudge({
    enabled: !isLoading,
    requiredPhrases: ["tap each job to view more information"],
    instruction:
      "[SYSTEM] CardStack is visible. " +
      'If your immediately previous response did not speak the card instructions, your next response MUST say exactly: "Tap each job to view more information." "Swipe right to add a job to your shortlist." "Swipe left to dismiss." ' +
      "Do not call any new tool in that response.",
    delayMs: 1400,
  });

  const handleJobSelected = (job: JobListing) => {
    void sendJobOpenedIntent(job.title, job.company, {
      jobId: job.id,
      matchScore: job.matchScore,
    });
  };

  const handleJobClosed = (job: JobListing) => {
    void sendJobClosedIntent(job.title, job.company);
  };

  return (
    <div data-testid="card-stack-template" className="absolute inset-0 pointer-events-none">
      {/* Full-screen backdrop — tapping anywhere outside the cards proceeds to Dashboard */}
      {!isLoading && !dismissed && (
        <div
          data-testid="card-stack-backdrop"
          className="absolute inset-0 pointer-events-auto"
          onClick={handleBackdropTap}
        />
      )}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            data-testid="card-stack-template-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ paddingBottom: 96 }}
          >
            <Loader2 size={20} className="text-[var(--text-subtle)] animate-spin" />
          </motion.div>
        ) : (
          <motion.div
            key="stack"
            data-testid="card-stack-template-stack"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute pointer-events-auto"
            style={{ bottom: 88, left: 16, right: 16 }}
          >
            <CardStack
              jobs={resolvedJobs}
              highlightedJobId={highlightedJobId}
              onJobSelected={handleJobSelected}
              onJobClosed={handleJobClosed}
              onAllCardsSwiped={handleAllCardsSwiped}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
