import { getTraincoKnowledgePayload } from '@/data/traincoStaticKnowledge';
import { informTele } from '@/utils/teleUtils';

/**
 * Throttle repeated `navigateWithKnowledgeKey` for **any** key within this window.
 * Uses a per-key timestamp map so that interleaved calls (industry → role → industry)
 * are all suppressed, not just consecutive same-key calls.
 */
const KNOWLEDGE_KEY_THROTTLE_MS = 2200;

/** ms between repeated "waiting for user" CORRECTION nudges (avoid spam under rapid RPC bursts). */
const WAITING_NUDGE_THROTTLE_MS = 2000;
let lastWaitingNudgeAt = 0;
const knowledgeKeyLastInvokedAt = new Map<string, number>();

/**
 * One RPC: load static navigate root by key and apply it via the live `navigateToSection`
 * on `window.__siteFunctions` (installed by usePhaseFlow). Use when the agent must not
 * rely on hand-built navigate JSON that might use the wrong templateId or labels.
 */
export default function navigateWithKnowledgeKey(args: Record<string, unknown>) {
  const key = typeof args?.key === 'string' ? args.key : '';
  if (!key.trim()) {
    return { success: false as const, error: 'missing_key' };
  }

  const payload = getTraincoKnowledgePayload(key);
  if (payload === null) {
    return { success: false as const, error: 'unknown_key', key };
  }

  const siteFns = (
    window as unknown as {
      __siteFunctions?: {
        navigateToSection?: (p: unknown) => unknown;
        isWaitingForUserInput?: () => boolean;
      };
    }
  ).__siteFunctions;

  const nav = siteFns?.navigateToSection;

  if (typeof nav !== 'function') {
    return { success: false as const, error: 'navigateToSection_not_ready', key };
  }

  // ── Throttle first (before the waiting gate) ────────────────────────────────
  // Duplicate same-key calls within KNOWLEDGE_KEY_THROTTLE_MS are silently
  // suppressed here so they never reach the gate and never emit a CORRECTION.
  const now = Date.now();
  const lastAt = knowledgeKeyLastInvokedAt.get(key) ?? 0;
  if (now - lastAt < KNOWLEDGE_KEY_THROTTLE_MS) {
    return { success: true as const, key, suppressed_duplicate: true as const };
  }
  knowledgeKeyLastInvokedAt.set(key, now);
  // Evict stale entries to avoid unbounded growth
  for (const [k, t] of knowledgeKeyLastInvokedAt) {
    if (now - t > KNOWLEDGE_KEY_THROTTLE_MS * 10) knowledgeKeyLastInvokedAt.delete(k);
  }

  // ── Waiting-for-user gate ────────────────────────────────────────────────────
  // If a template requiring user action is on screen AND the user hasn't committed
  // yet, block the navigation and nudge the agent (throttled to avoid spam).
  if (siteFns?.isWaitingForUserInput?.()) {
    const now2 = Date.now();
    if (now2 - lastWaitingNudgeAt >= WAITING_NUDGE_THROTTLE_MS) {
      lastWaitingNudgeAt = now2;
      informTele(
        '[CORRECTION] A screen is waiting for user input (MultiSelectOptions / GlassmorphicOptions / TextInput). ' +
          'Do NOT call navigateWithKnowledgeKey or navigateToSection until you receive `user selected:` or `user typed:` via TellTele. ' +
          `Attempted key: ${key}`,
      );
    }
    return { success: false as const, error: 'waiting_for_user_input', key };
  }

  const navResult = nav(payload);
  if (navResult === false) {
    return { success: false as const, error: 'navigate_rejected_or_invalid', key };
  }

  return { success: true as const, key };
}
