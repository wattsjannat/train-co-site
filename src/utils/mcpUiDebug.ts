/**
 * Opt-in / dev logging for MCP tool payloads merged into the SPA (navigateToSection → cache → templates).
 * - Always on when `NODE_ENV === 'development'`.
 * - Or set `NEXT_PUBLIC_DEBUG_MCP_CACHE=1`, or in the browser console: `localStorage.setItem('DEBUG_MCP_CACHE','1')` then reload.
 * - WARN-level logs (phase starting with "WARN:") always fire regardless of flag.
 */

const LS_KEY = 'DEBUG_MCP_CACHE';

export function isMcpUiDebugEnabled(): boolean {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_DEBUG_MCP_CACHE === '1') {
    return true;
  }
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    return true;
  }
  if (typeof window !== 'undefined' && window.localStorage?.getItem(LS_KEY) === '1') {
    return true;
  }
  return false;
}

/** Summarize large objects for console (avoid megabyte dumps). */
function summarize(val: unknown, maxLen = 400): string {
  try {
    const s = typeof val === 'string' ? val : JSON.stringify(val);
    if (s.length <= maxLen) return s;
    return `${s.slice(0, maxLen)}… (${s.length} chars)`;
  } catch {
    return String(val);
  }
}

export function logMcpUiStore(
  phase: string,
  detail: Record<string, unknown> & { rawSample?: unknown },
): void {
  const isWarn = phase.startsWith('WARN:') || phase.startsWith('PARSE FAILED');
  if (!isWarn && !isMcpUiDebugEnabled()) return;
  const { rawSample, ...rest } = detail;
  const line: Record<string, unknown> = { ...rest };
  if (rawSample !== undefined) line.sample = summarize(rawSample);
  if (isWarn) {
    console.warn(`[trainco MCP→UI] ${phase}`, line);
  } else {
    console.info(`[trainco MCP→UI] ${phase}`, line);
  }
}

/**
 * Always-on log used for critical data-flow milestones (jobs/metrics arriving into cache).
 * Shows up in production without needing any flag.
 */
export function logMcpUiMilestone(
  phase: string,
  detail: Record<string, unknown> & { rawSample?: unknown },
): void {
  const { rawSample, ...rest } = detail;
  const line: Record<string, unknown> = { ...rest };
  if (rawSample !== undefined) line.sample = summarize(rawSample);
  console.log(`[trainco MCP→UI] ✦ ${phase}`, line);
}
