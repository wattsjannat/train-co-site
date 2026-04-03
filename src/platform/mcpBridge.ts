import { saveVisitorSession, getVisitorSession, saveLearningCompleted, clearLearningCompleted } from "@/utils/visitorMemory";
import { loadIntoCache, readCache, type McpCache } from "@/platform/mcpCacheBridge";

const inFlight = new Set<string>();

/** Tools whose same-origin /api/invoke returned 405/404 (static export) — go direct. */
const skippedInvokeTools = new Set<string>();

// ─── Remote invoke fallback ────────────────────────────────────────────────────
// On Mobeus static deploys the same-origin /api/invoke/* returns 405 (no server).
// Falls back to train-v1.rapidprototype.ai/api/invoke/:toolName which has the same
// REST endpoint and sends CORS headers allowing *.mobeus.ai origins.
//
// Uses application/x-www-form-urlencoded so the browser sends NO OPTIONS preflight
// (JSON content-type triggers preflight; the infrastructure in front of the Express
// app blocks OPTIONS with 401 before Express can respond).
//
// Uses credentials: 'include' so the Mobeus session cookie is forwarded — the same
// cookie the Mobeus SDK uses when talking to train-v1 cross-origin — which satisfies
// the server's requireAppPassword middleware if APP_PASSWORD is set.
// Use || instead of ?? to handle empty strings from next.config.ts
const MCP_BASE = (
  (process.env.MCP_SERVER_URL || "https://train-v1.rapidprototype.ai/mcp").replace(/\/mcp\/?$/, "")
);

console.info(`[mcpBridge] remote invoke base: ${MCP_BASE}`);

async function invokeRemote(
  toolName: string,
  args: Record<string, unknown>,
): Promise<unknown> {
  const url = `${MCP_BASE}/api/invoke/${toolName}`;
  console.info(`[mcpBridge] invokeRemote → ${url}`, args);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
    credentials: "include",
  });
  if (!res.ok) throw new Error(`Remote invoke ${toolName} failed: ${res.status}`);
  return res.json();
}

// ─── invokeBridge ─────────────────────────────────────────────────────────────

async function invokeBridge(
  toolName: string,
  cacheKey: keyof McpCache,
  args: Record<string, unknown>,
  transform?: (data: unknown) => unknown,
): Promise<true | undefined> {
  // Fast path: same-origin route is known-unavailable, go straight to remote.
  if (skippedInvokeTools.has(toolName)) {
    try {
      const data = await invokeRemote(toolName, args);
      loadIntoCache(cacheKey, transform ? transform(data) : data);
      return true;
    } catch (err) {
      console.error(`[mcpBridge] remote invoke failed for ${toolName}:`, err);
      return undefined;
    }
  }

  try {
    const res = await fetch(`/api/invoke/${toolName}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });
    if (!res.ok) {
      if (res.status === 405 || res.status === 404) {
        skippedInvokeTools.add(toolName);
        console.warn(
          `[mcpBridge] ${toolName} → ${res.status}; static deploy — retrying via ${MCP_BASE}/api/invoke/${toolName}`,
        );
        try {
          const data = await invokeRemote(toolName, args);
          loadIntoCache(cacheKey, transform ? transform(data) : data);
          return true;
        } catch (err) {
          console.error(`[mcpBridge] remote fallback failed for ${toolName}:`, err);
          return undefined;
        }
      }
      console.error(`[mcpBridge] ${toolName} failed: ${res.status}`);
      return undefined;
    }
    const data = await res.json();
    loadIntoCache(cacheKey, transform ? transform(data) : data);
    return true;
  } catch (err) {
    console.error(`[mcpBridge] ${toolName} error:`, err);
    return undefined;
  }
}

/**
 * Unwraps the cached / API jobs value into a flat array of job records.
 */
export function resolveJobsArray(cache: unknown): unknown[] {
  if (Array.isArray(cache)) return cache;
  if (cache && typeof cache === "object") {
    const obj = cache as Record<string, unknown>;
    if (Array.isArray(obj.jobs)) return obj.jobs;

    const data = obj.data;
    if (data && typeof data === "object") {
      const d = data as Record<string, unknown>;
      if (Array.isArray(d.jobs)) return d.jobs;
      if (Array.isArray(d.results)) return d.results;
      const result = d.result;
      if (result && typeof result === "object") {
        const r = result as Record<string, unknown>;
        if (Array.isArray(r.jobs)) return r.jobs;
        if (Array.isArray(r.results)) return r.results;
        if (Array.isArray(r.data)) return r.data;
      }
    }

    const result = obj.result;
    if (result && typeof result === "object") {
      const r = result as Record<string, unknown>;
      if (Array.isArray(r.jobs)) return r.jobs;
      if (Array.isArray(r.results)) return r.results;
      if (Array.isArray(r.data)) return r.data;
    }

    if (Array.isArray(obj.results)) return obj.results;
    if (Array.isArray(obj.data)) return obj.data;
  }
  return [];
}

export async function fetchJobs(candidateId: string): Promise<true | undefined> {
  if (!candidateId?.trim()) return undefined;
  if (inFlight.has("jobs")) return undefined;
  inFlight.add("jobs");
  try {
    const sess = getVisitorSession();
    if (sess?.learningCompleted) {
      void fetch(`/api/learning/${candidateId.trim()}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }).catch(() => {});
      const res = await fetch(`/api/learning/${candidateId.trim()}/jobs/after?limit=6`);
      if (res.ok) {
        loadIntoCache("jobs", await res.json() as unknown);
        return true;
      }
    }
    return await invokeBridge("get_jobs_by_skills", "jobs", { candidate_id: candidateId.trim(), limit: 6 });
  } finally {
    inFlight.delete("jobs");
  }
}

export async function fetchSkills(roleId: string): Promise<true | undefined> {
  if (!roleId?.trim()) return undefined;
  if (inFlight.has("skills")) return undefined;
  inFlight.add("skills");
  try {
    const sess = getVisitorSession();
    if (sess?.candidateId) {
      const phase = sess.learningCompleted ? "after" : "before";
      const endpoint = `/api/learning/${sess.candidateId}/skills/${roleId.trim()}?phase=${phase}`;
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json() as unknown;
        loadIntoCache("skills", data);
        return true;
      }
    }
    return await invokeBridge("get_skill_progression", "skills", { role_id: roleId.trim() });
  } finally {
    inFlight.delete("skills");
  }
}

function unwrapCandidateResponse(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== "object") return {};
  const obj = payload as Record<string, unknown>;
  for (const key of ["data", "result"] as const) {
    const inner = obj[key];
    if (inner && typeof inner === "object" && !Array.isArray(inner)) {
      return inner as Record<string, unknown>;
    }
  }
  return obj;
}

/**
 * Optional client bridge when `/api/invoke/get_candidate` exists (local full stack).
 * On Mobeus/hosted sites there is no invoke route (405) — candidate data must come from
 * the agent’s MCP `get_candidate` tool merged into `navigateToSection` props; do not rely on this from the UI.
 */
export async function fetchCandidate(candidateId: string): Promise<true | undefined> {
  if (!candidateId?.trim()) return undefined;
  const cid = candidateId.trim();
  if (inFlight.has("candidate")) return undefined;
  inFlight.add("candidate");
  try {
    const ok = await invokeBridge(
      "get_candidate",
      "candidate",
      { candidate_id: cid },
      unwrapCandidateResponse,
    );
    if (ok) saveVisitorSession(cid);
    return ok;
  } finally {
    inFlight.delete("candidate");
  }
}

export async function fetchCareerGrowth(candidateId: string): Promise<true | undefined> {
  if (!candidateId?.trim()) return undefined;
  if (inFlight.has("careerGrowth")) return undefined;
  inFlight.add("careerGrowth");
  try {
    const sess = getVisitorSession();
    if (sess?.candidateId) {
      const phase = sess.learningCompleted ? "after" : "before";
      const endpoint = `/api/learning/${sess.candidateId}/career-growth?phase=${phase}`;
      const res = await fetch(endpoint);
      if (res.ok) {
        loadIntoCache("careerGrowth", await res.json() as unknown);
        return true;
      }
    }
    return await invokeBridge("get_career_growth", "careerGrowth", { candidate_id: candidateId.trim() });
  } finally {
    inFlight.delete("careerGrowth");
  }
}

export async function fetchMarketRelevance(candidateId: string): Promise<true | undefined> {
  if (!candidateId?.trim()) return undefined;
  if (inFlight.has("marketRelevance")) return undefined;
  inFlight.add("marketRelevance");
  try {
    const sess = getVisitorSession();
    if (sess?.candidateId) {
      const phase = sess.learningCompleted ? "after" : "before";
      const endpoint = `/api/learning/${sess.candidateId}/market-relevance?phase=${phase}`;
      const res = await fetch(endpoint);
      if (res.ok) {
        loadIntoCache("marketRelevance", await res.json() as unknown);
        return true;
      }
    }
    return await invokeBridge("get_market_relevance", "marketRelevance", { candidate_id: candidateId.trim() });
  } finally {
    inFlight.delete("marketRelevance");
  }
}

async function fetchJsonSafe(url: string): Promise<unknown> {
  try {
    const res = await fetch(url);
    return res.ok ? (await res.json() as unknown) : null;
  } catch {
    return null;
  }
}

async function swapOrFetch(
  cached: unknown,
  url: string,
  activeKey: keyof McpCache,
  afterKey: keyof McpCache,
): Promise<void> {
  const data = cached ?? await fetchJsonSafe(url);
  if (data) {
    loadIntoCache(activeKey, data);
    loadIntoCache(afterKey, data);
  }
}

export async function syncLearningState(candidateId: string): Promise<boolean> {
  if (!candidateId?.trim()) return false;

  try {
    const sess = getVisitorSession();
    if (!sess?.learningCompleted) {
      return false;
    }

    const res = await fetch(`/api/learning/${candidateId.trim()}/status`);
    if (!res.ok) {
      return false;
    }

    const data = await res.json() as { completed: boolean };
    
    if (!data.completed && sess.learningCompleted) {
      console.log("[mcpBridge] Backend state reset detected. Clearing localStorage learning flag.");
      clearLearningCompleted();
      // Do not refetch via client /api/invoke — agent repopulates cache via navigateToSection / tools.
      return true;
    }
    
    return false;
  } catch (err) {
    console.warn("[mcpBridge] syncLearningState failed:", err);
    return false;
  }
}

export async function prefetchAfterLearning(
  candidateId: string,
  roleId = "ai-engineer",
): Promise<void> {
  const cid = candidateId.trim();
  if (!cid) return;
  if (inFlight.has("prefetchAfter")) return;
  if (readCache().skillsAfter) return;
  inFlight.add("prefetchAfter");
  try {
    await Promise.allSettled([
      (async () => {
        const d = await fetchJsonSafe(`/api/learning/${cid}/skills/${roleId}/after`);
        if (d) loadIntoCache("skillsAfter", d);
      })(),
      (async () => {
        const d = await fetchJsonSafe(`/api/learning/${cid}/market-relevance/after`);
        if (d) loadIntoCache("marketRelevanceAfter", d);
      })(),
      (async () => {
        const d = await fetchJsonSafe(`/api/learning/${cid}/career-growth/after`);
        if (d) loadIntoCache("careerGrowthAfter", d);
      })(),
      (async () => {
        const d = await fetchJsonSafe(`/api/learning/${cid}/jobs/after?limit=6`);
        if (d) loadIntoCache("jobsAfter", d);
      })(),
    ]);
  } finally {
    inFlight.delete("prefetchAfter");
  }
}

export async function completeLearning(candidateId: string): Promise<true | undefined> {
  if (!candidateId?.trim()) return undefined;
  const cid = candidateId.trim();

  try {
    const flagRes = await fetch(`/api/learning/${cid}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!flagRes.ok) {
      console.error("[mcpBridge] completeLearning flag failed:", flagRes.status);
      return undefined;
    }

    const snapshot = readCache();
    await Promise.allSettled([
      swapOrFetch(snapshot.skillsAfter,          `/api/learning/${cid}/skills/ai-engineer/after`, "skills",          "skillsAfter"),
      swapOrFetch(snapshot.marketRelevanceAfter, `/api/learning/${cid}/market-relevance/after`,   "marketRelevance", "marketRelevanceAfter"),
      swapOrFetch(snapshot.careerGrowthAfter,    `/api/learning/${cid}/career-growth/after`,      "careerGrowth",    "careerGrowthAfter"),
      swapOrFetch(snapshot.jobsAfter,            `/api/learning/${cid}/jobs/after?limit=6`,       "jobs",            "jobsAfter"),
    ]);

    saveLearningCompleted();

    return true;
  } catch (err) {
    console.error("[mcpBridge] completeLearning error:", err);
    return undefined;
  }
}

export async function fetchJobApplicants(
  postingId: string,
  includeProfile = true,
): Promise<unknown> {
  try {
    const res = await fetch("/api/invoke/get_job_applicants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        posting_id: postingId,
        include_profile: includeProfile,
        limit: 100,
      }),
    });
    if (!res.ok) {
      console.error(`[mcpBridge] fetchJobApplicants failed:`, res.status);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error("[mcpBridge] fetchJobApplicants error:", err);
    return null;
  }
}

export function patchSiteFunctions() {
  const siteFns = (
    window as unknown as { UIFrameworkSiteFunctions?: Record<string, unknown> }
  ).UIFrameworkSiteFunctions;
  if (!siteFns) return;
  siteFns.fetchJobs = fetchJobs;
  siteFns.fetchSkills = fetchSkills;
  siteFns.fetchCandidate = fetchCandidate;
  siteFns.fetchCareerGrowth = fetchCareerGrowth;
  siteFns.fetchMarketRelevance = fetchMarketRelevance;
  siteFns.completeLearning = completeLearning;
  siteFns.syncLearningState = syncLearningState;
  siteFns.fetchJobApplicants = fetchJobApplicants;
}
