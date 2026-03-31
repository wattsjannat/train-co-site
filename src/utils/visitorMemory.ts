const STORAGE_KEY = "trainco_visitor_session";

/**
 * Captured at module load time. True only if a session existed when the app started
 * (returning visitor). False for first-time users who complete onboarding mid-session.
 */
export const HAD_SESSION_AT_APP_START = (() => {
  try {
    return !!localStorage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
})();

export interface VisitorSession {
  candidateId: string;
  /** Set by saveLearningCompleted() when user completes learning. Resets on new login. */
  learningCompleted?: boolean;
}

export function saveVisitorSession(candidateId: string): void {
  try {
    // Always create a fresh session without learningCompleted flag
    // Each login starts at pre-learning state (73%)
    // User can complete learning within session via saveLearningCompleted()
    const session: VisitorSession = { candidateId };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    window.dispatchEvent(new CustomEvent("visitor-session-changed"));
  } catch {
    // localStorage may be unavailable (private browsing, quota exceeded)
  }
}

/**
 * Marks the current candidate's learning path as completed in localStorage.
 * Persists within the current session (until next login) so fetch functions
 * load post-learning data (82%) after the user completes the course.
 */
export function saveLearningCompleted(): void {
  try {
    const existing = getVisitorSession();
    if (!existing?.candidateId) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, learningCompleted: true }));
  } catch {
    // localStorage may be unavailable
  }
}

/**
 * Clears the learning completed flag for the current candidate.
 * Useful for testing or resetting the learning state to "before learning".
 */
export function clearLearningCompleted(): void {
  try {
    const existing = getVisitorSession();
    if (!existing?.candidateId) return;
    const { learningCompleted, ...rest } = existing;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  } catch {
    // localStorage may be unavailable
  }
}

export function getVisitorSession(): VisitorSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<VisitorSession>;
    if (!data.candidateId) return null;
    return { candidateId: data.candidateId, learningCompleted: data.learningCompleted };
  } catch {
    return null;
  }
}

// ── Developer utilities ────────────────────────────────────────────────────────
// Expose these functions globally for testing and debugging in the browser console

if (typeof window !== "undefined") {
  (window as any).resetLearningState = () => {
    clearLearningCompleted();
    console.log("✅ Learning state reset. Reload the page to see 'before learning' data.");
  };
}
