/**
 * Normalizes match / fit scores from get_jobs_by_skills and related payloads.
 * Handles 0–1 ratios, 0–100 integers, strings, and alternate field names.
 */

const MATCH_KEYS = [
  "match_score",
  "score",
  "match_percentage",
  "matchPercent",
  "match_percent",
  "overall_score",
  "overall_match_score",
  "fit_score",
  "matchScore",
  "percentage",
  /** Common alternate names from scoring / ATS integrations */
  "relevance_score",
  "skill_match_score",
  "skill_match",
  "compatibility_score",
  "match_quality",
  "match_quality_score",
  "fit_score_percent",
  "job_match_score",
  "percent_match",
] as const;

export function coerceMatchScore(raw: unknown): number | undefined {
  if (raw == null || raw === "") return undefined;
  const s = String(raw).replace(/%/g, "").trim();
  const n = typeof raw === "number" ? raw : parseFloat(s);
  if (Number.isNaN(n) || n < 0) return undefined;
  let v = n;
  if (v > 0 && v <= 1) v = v * 100;
  if (v > 100) v = 100;
  return Math.round(v);
}

function firstDefinedScore(
  item: Record<string, unknown>,
  inner: Record<string, unknown>,
): number | undefined {
  for (const k of MATCH_KEYS) {
    const v = coerceMatchScore(item[k] ?? inner[k]);
    if (v != null) return v;
  }
  return undefined;
}

/** Nested blobs some APIs use for match % (wrapper + job body). */
function scoreFromNestedObjects(obj: Record<string, unknown>): number | undefined {
  const nestedKeys = ["scoring", "match_details", "metrics", "match", "result", "data"] as const;
  for (const nk of nestedKeys) {
    const v = obj[nk];
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const r = v as Record<string, unknown>;
      const n = firstDefinedScore(r, r);
      if (n != null) return n;
    }
  }
  return undefined;
}

/** Prefer parent `item` first — scored APIs often put match_score on the wrapper object. */
export function extractMatchScorePair(
  item: Record<string, unknown>,
  inner: Record<string, unknown>,
): number | undefined {
  return (
    firstDefinedScore(item, inner) ??
    scoreFromNestedObjects(item) ??
    scoreFromNestedObjects(inner)
  );
}
