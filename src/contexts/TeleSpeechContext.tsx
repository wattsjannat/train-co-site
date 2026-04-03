'use client';

/**
 * TeleSpeechContext — provides a singleton speech state for all components.
 * Adapted from trainco-v1 to read from the voice-session-store transcripts
 * instead of UIFramework DataReceived events.
 */

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useVoiceSessionStore } from "@/platform/stores/voice-session-store";

export interface TeleSpeechState {
  speech: string | null;
  isTalking: boolean;
  speechBubbleBottomPx: number | null;
}

export interface TeleSpeechContextValue extends TeleSpeechState {
  setSpeechBubbleBottomPx: (px: number | null) => void;
  getLastSpeechAt: () => number;
  speechDisplayOverride: string | null;
  setSpeechDisplayOverride: (value: string | null) => void;
}

const TeleSpeechContext = createContext<TeleSpeechContextValue>({
  speech: null,
  isTalking: false,
  speechBubbleBottomPx: null,
  setSpeechBubbleBottomPx: () => {},
  getLastSpeechAt: () => 0,
  speechDisplayOverride: null,
  setSpeechDisplayOverride: () => {},
});

/**
 * When the agent responds with structured JSON, the transcript text can look like:
 *   (a) Pure JSON:  `{ "speech": "Hello!", "action": "navigateWithKnowledgeKey", ... }`
 *   (b) Mixed:      `Hello! { "navigateWithKnowledgeKey": { "key": "welcome_greeting" } }`
 *
 * In both cases we want to return only the human-readable speech text.
 */
function extractSpeechText(raw: string): string {
  const trimmed = raw.trim();

  // Case (a): entire string is a JSON object — extract the "speech" field
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as Record<string, unknown>;
      if (typeof parsed.speech === 'string' && parsed.speech) return parsed.speech;
      for (const key of ['text', 'content', 'message']) {
        if (typeof parsed[key] === 'string' && (parsed[key] as string).length > 0) {
          return parsed[key] as string;
        }
      }
      // Entire response is JSON with no speech field — hide it (empty string shows nothing)
      return '';
    } catch {
      // Not valid JSON — fall through
    }
  }

  // Case (b): speech text followed by a JSON action block `Hello! { "action": ... }`
  // Find the first `{` where everything from there to end is valid JSON.
  const braceIdx = trimmed.indexOf('{');
  if (braceIdx > 0) {
    const jsonPart = trimmed.slice(braceIdx).trim();
    try {
      JSON.parse(jsonPart);
      return trimmed.slice(0, braceIdx).trim();
    } catch {
      // Not valid JSON — fall through
    }
  }

  // Case (c): bracketed or parenthesised action suffix — e.g.
  //   `Hello! [navigateWithKnowledgeKey: { "key": "..." }]`
  //   `Hello! (callSiteFunction navigateToSection {...})`
  // Strip any trailing `[...]` or `(...)` block that looks like a function/action call.
  const stripped = trimmed
    .replace(/\s*\[[\s\S]*\]\s*$/, '')   // strip trailing [...]
    .replace(/\s*\([\s\S]*\)\s*$/, '')   // strip trailing (...)
    .trim();
  if (stripped && stripped !== trimmed) return stripped;

  return raw;
}

export function TeleSpeechProvider({ children }: { children: ReactNode }) {
  const [speech, setSpeech] = useState<string | null>(null);
  const [isTalking, setIsTalking] = useState(false);
  const [speechBubbleBottomPx, setSpeechBubbleBottomPx] = useState<number | null>(null);
  const [speechDisplayOverride, setSpeechDisplayOverride] = useState<string | null>(null);
  const lastSpeechAtRef = useRef(0);
  /** While MultiSelect is interactive, block newer agent lines so the bubble cannot jump to the next step before Continue. */
  const multiSelectSpeechLockRef = useRef<"off" | "pending" | "frozen">("off");
  /** Agent transcript segment id allowed to keep updating (streaming) while frozen. */
  const multiSelectLockedSegmentIdRef = useRef<string | null>(null);
  /** Latest agent segment id when MultiSelect became interactive — stay pending until a *different* segment (industry line) arrives. */
  const multiSelectPendingBaselineSegmentIdRef = useRef<string | null>(null);
  const agentState = useVoiceSessionStore((s) => s.agentState);
  const transcripts = useVoiceSessionStore((s) => s.transcripts);

  const getLastSpeechAt = useCallback(() => lastSpeechAtRef.current, []);

  // Sync isTalking from agent state
  useEffect(() => {
    const talking = agentState === 'speaking';
    setIsTalking(talking);
    if (talking) {
      lastSpeechAtRef.current = Date.now();
    }
  }, [agentState]);

  useEffect(() => {
    const onLock = (e: Event) => {
      const locked = (e as CustomEvent<{ locked?: boolean }>).detail?.locked === true;
      if (!locked) {
        multiSelectSpeechLockRef.current = "off";
        multiSelectLockedSegmentIdRef.current = null;
        multiSelectPendingBaselineSegmentIdRef.current = null;
        return;
      }
      const agent = useVoiceSessionStore.getState().transcripts.filter((t) => t.isAgent);
      const last = agent[agent.length - 1];
      multiSelectPendingBaselineSegmentIdRef.current = last?.id ?? null;
      multiSelectSpeechLockRef.current = "pending";
      multiSelectLockedSegmentIdRef.current = null;
    };
    const onSubmitted = () => {
      multiSelectSpeechLockRef.current = "off";
      multiSelectLockedSegmentIdRef.current = null;
      multiSelectPendingBaselineSegmentIdRef.current = null;
    };
    window.addEventListener("multi-select-speech-lock", onLock);
    window.addEventListener("multi-select-submitted", onSubmitted);
    return () => {
      window.removeEventListener("multi-select-speech-lock", onLock);
      window.removeEventListener("multi-select-submitted", onSubmitted);
    };
  }, []);

  // Sync speech from transcripts (latest agent transcript)
  useEffect(() => {
    const agentTranscripts = transcripts.filter((t) => t.isAgent);
    if (agentTranscripts.length === 0) return;
    const latest = agentTranscripts[agentTranscripts.length - 1];
    if (!latest?.text) return;

    const mode = multiSelectSpeechLockRef.current;
    if (mode === "frozen") {
      if (multiSelectLockedSegmentIdRef.current === latest.id) {
        setSpeech(extractSpeechText(latest.text));
      }
      return;
    }
    if (mode === "pending") {
      const baseline = multiSelectPendingBaselineSegmentIdRef.current;
      if (baseline != null && latest.id === baseline) {
        setSpeech(extractSpeechText(latest.text));
        return;
      }
      setSpeech(extractSpeechText(latest.text));
      multiSelectSpeechLockRef.current = "frozen";
      multiSelectLockedSegmentIdRef.current = latest.id;
      multiSelectPendingBaselineSegmentIdRef.current = null;
      return;
    }
    setSpeech(extractSpeechText(latest.text));
  }, [transcripts]);

  // Listen to tele-navigate-section to clear stale speech
  useEffect(() => {
    const NAVIGATE_CLEAR_DELAY_MS = 8000;
    const DASHBOARD_JOURNEY_TEMPLATES = new Set([
      "Dashboard", "ProfileSheet", "JobSearchSheet", "JobDetailSheet",
      "EligibilitySheet", "CloseGapSheet", "JobApplicationsSheet", "PastApplicationsSheet",
      "SkillCoverageSheet", "SkillTestFlow", "MarketRelevanceSheet", "CareerGrowthSheet",
      "SkillsDetail", "MarketRelevanceDetail", "CareerGrowthDetail",
    ]);
    let clearTimer: ReturnType<typeof setTimeout> | null = null;

    const onNavigate = (e: Event) => {
      const detail = (e as CustomEvent<{ templateIds?: string[] }>).detail;
      const templateIds = detail?.templateIds ?? [];
      const isDashboardJourney = templateIds.some((id) => DASHBOARD_JOURNEY_TEMPLATES.has(id));
      if (!isDashboardJourney) return;

      const navigateAt = Date.now();
      if (clearTimer) clearTimeout(clearTimer);
      clearTimer = setTimeout(() => {
        if (lastSpeechAtRef.current > navigateAt - 5000) return;
        setSpeech(null);
        clearTimer = null;
      }, NAVIGATE_CLEAR_DELAY_MS);
    };

    window.addEventListener("tele-navigate-section", onNavigate);
    return () => {
      window.removeEventListener("tele-navigate-section", onNavigate);
      if (clearTimer) clearTimeout(clearTimer);
    };
  }, []);

  return (
    <TeleSpeechContext.Provider
      value={{
        speech,
        isTalking,
        speechBubbleBottomPx,
        setSpeechBubbleBottomPx,
        getLastSpeechAt,
        speechDisplayOverride,
        setSpeechDisplayOverride,
      }}
    >
      {children}
    </TeleSpeechContext.Provider>
  );
}

export function useTeleSpeechContext(): TeleSpeechContextValue {
  return useContext(TeleSpeechContext);
}
