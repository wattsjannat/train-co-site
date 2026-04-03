import { resolveJobsArray } from "@/platform/mcpBridge";
import { coerceMatchScore, extractMatchScorePair } from "@/utils/scoredJobFields";

/**
 * Merges a scored job list item (`{ job: {...}, match_score }`) into a flat record
 * so UI + TellTele see scores on the same object as title/company.
 */
function normKey(s: string | undefined): string {
  return (s ?? "").replace(/\s+/g, " ").trim().toLowerCase();
}

export function lookupScoredJobFromCache(
  jobId: string | undefined,
  title: string | undefined,
  company: string | undefined,
  jobs: unknown,
): Record<string, unknown> | null {
  const arr = resolveJobsArray(jobs);
  const tNorm = normKey(title);
  const cNorm = normKey(company);

  for (const item of arr) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const inner =
      rec.job && typeof rec.job === "object"
        ? (rec.job as Record<string, unknown>)
        : rec;
    const id = (inner.job_id ?? inner.id ?? inner.jobId) as string | undefined;
    const matchesId =
      jobId != null &&
      id != null &&
      String(jobId).trim() === String(id).trim();
    const iTitle = normKey(inner.title as string | undefined);
    const iCompany = normKey((inner.company_name ?? inner.company) as string | undefined);
    const matchesTitle =
      tNorm.length > 0 && iTitle === tNorm && (!cNorm || iCompany === cNorm);
    if (!matchesId && !matchesTitle) continue;

    const innerRec = inner as Record<string, unknown>;
    const mergedFlat = { ...rec, ...innerRec } as Record<string, unknown>;
    const ms =
      extractMatchScorePair(rec, innerRec) ??
      extractMatchScorePair(mergedFlat, innerRec) ??
      extractMatchScorePair(mergedFlat, mergedFlat);
    return {
      ...innerRec,
      match_score: ms ?? coerceMatchScore(innerRec.match_score ?? innerRec.score),
      score: ms ?? coerceMatchScore(innerRec.score ?? innerRec.match_score),
      skill_gaps: rec.skill_gaps ?? innerRec.skill_gaps,
      fit_category: rec.fit_category ?? rec.fitCategory ?? innerRec.fit_category ?? innerRec.fitCategory,
    };
  }
  return null;
}

export function pickJobDescription(rec: Record<string, unknown> | null | undefined): string | undefined {
  if (!rec) return undefined;
  const d =
    (rec.description as string | undefined) ??
    (rec.role_description as string | undefined) ??
    (rec.full_description as string | undefined) ??
    (rec.posting_description as string | undefined) ??
    (rec.overview as string | undefined) ??
    (rec.job_description as string | undefined) ??
    (rec.content as string | undefined) ??
    (rec.body as string | undefined) ??
    (rec.job_summary as string | undefined) ??
    (rec.short_description as string | undefined) ??
    (rec.snippet as string | undefined) ??
    (rec.role_summary as string | undefined) ??
    (rec.text as string | undefined);
  if (typeof d === "string" && d.trim()) return d;
  const ai =
    (rec.ai_summary as string | undefined) ??
    (rec.aiSummary as string | undefined) ??
    (rec.summary as string | undefined);
  if (typeof ai === "string" && ai.trim()) return ai;
  return undefined;
}
