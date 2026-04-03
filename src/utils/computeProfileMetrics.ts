/**
 * Computes ProfileSheet summary metrics from raw `get_skill_progression` data.
 */

export interface SkillMapItem {
  category: string;
  current: number;
  market_avg: number;
  top10: number;
}

export interface SkillProgressionItem {
  name: string;
  current_level: number;
  target_level: number;
  is_featured?: boolean;
}

export interface LearningPathNode {
  id: string;
  label: string;
  status: "completed" | "in-progress" | "upcoming";
  x: number;
  y: number;
  milestones?: string[];
}

export interface LearningPathEdge {
  from: string;
  to: string;
}

export interface SkillData {
  role_title?: string;
  skill_map?: SkillMapItem[];
  skill_progression?: SkillProgressionItem[];
  learning_path_nodes?: LearningPathNode[];
  learning_path_edges?: LearningPathEdge[];
  /** Direct 0–100 from API when present (skips derivation from skill_map / progression). */
  skill_coverage?: number;
  /** When API nests market score inside skill payload. */
  market_relevance?: number;
  career_growth?: number;
}

export interface ProfileMetrics {
  targetRole: string | undefined;
  skillsToGo: number | undefined;
  estimatedTimeline: string | undefined;
  skillCoverage: number | undefined;
  marketRelevance: number | undefined;
  careerGrowth: number | undefined;
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((s, v) => s + v, 0) / values.length);
}

/** Normalize a scalar to 0–100 for gauges (handles 0–1 ratios and numeric strings). */
export function coercePercent0to100(v: unknown): number | undefined {
  if (v == null) return undefined;
  if (typeof v === "string") {
    const t = v.trim().replace(/%/g, "");
    if (!t) return undefined;
    const n = parseFloat(t);
    if (!Number.isFinite(n)) return undefined;
    return coercePercent0to100(n);
  }
  if (typeof v !== "number" || !Number.isFinite(v)) return undefined;
  if (v > 0 && v <= 1) return Math.round(v * 100);
  if (v > 1 && v <= 100) return Math.round(v);
  if (v > 100) return 100;
  if (v === 0) return 0;
  return undefined;
}

/**
 * Unwraps common MCP / HTTP envelopes so skill/market/career bodies are addressable
 * (`{ data: { ... } }`, `{ result: { ... } }`, chained `data.data`).
 */
function nonEmptySkillArray(v: unknown): boolean {
  return Array.isArray(v) && v.length > 0;
}

export function unwrapMcpToolRecord(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  let cur = raw as Record<string, unknown>;
  for (let depth = 0; depth < 8; depth++) {
    // Do not treat `skills: []` as terminal — get_market_relevance often ships an empty
    // `skills` array alongside nested `data`; trainco-v1 uses `data ?? result ?? obj`.
    const hasBody =
      nonEmptySkillArray(cur.skill_map) ||
      nonEmptySkillArray(cur.skill_progression) ||
      nonEmptySkillArray(cur.skills) ||
      cur.overall_score != null ||
      cur.market_relevance_score != null ||
      cur.key_insight != null ||
      (Array.isArray(cur.six_month_trend) && cur.six_month_trend.length > 0) ||
      cur.compensation_trajectory != null ||
      cur.career_growth_score != null ||
      cur.skill_coverage != null ||
      cur.coverage_score != null;

    if (hasBody) return cur;

    const next =
      (cur.data && typeof cur.data === "object" && !Array.isArray(cur.data) ? cur.data : null) ??
      (cur.result && typeof cur.result === "object" && !Array.isArray(cur.result) ? cur.result : null) ??
      (cur.payload && typeof cur.payload === "object" && !Array.isArray(cur.payload) ? cur.payload : null);
    if (!next) return cur;
    cur = next as Record<string, unknown>;
  }
  return cur;
}

/**
 * Profile metrics from `get_skill_progression` only (trainco-v1 parity).
 * Market / career **gauges** on ProfileSheet use dedicated tool caches + extract* helpers;
 * `marketRelevance` here is only for extractGaugeScores fallback (skill_map benchmark ~70).
 */
export function computeProfileMetrics(data: SkillData | null | undefined): ProfileMetrics {
  if (!data) {
    return {
      targetRole: undefined,
      skillsToGo: undefined,
      estimatedTimeline: undefined,
      skillCoverage: undefined,
      marketRelevance: undefined,
      careerGrowth: undefined,
    };
  }

  const { role_title, skill_map, skill_progression } = data;
  const directCoverage = coercePercent0to100(data.skill_coverage);

  const targetRole = role_title || undefined;

  let skillsToGo: number | undefined;
  let estimatedTimeline: string | undefined;
  let skillCoverage: number | undefined;

  if (skill_progression && skill_progression.length > 0) {
    const gaps = skill_progression.filter((s) => s.current_level < s.target_level);
    skillsToGo = gaps.length;

    const totalGap = gaps.reduce((sum, s) => sum + (s.target_level - s.current_level), 0);
    const months = Math.max(2, Math.ceil(totalGap * 1.5));
    estimatedTimeline = `~${months}-${months + 2} months`;

    skillCoverage = avg(
      skill_progression.map((s) =>
        s.target_level > 0 ? Math.min(100, (s.current_level / s.target_level) * 100) : 100
      )
    );
  }

  let marketRelevance: number | undefined;
  const careerGrowth: number | undefined = undefined;

  if (skill_map && skill_map.length > 0) {
    const aiEntry = skill_map.find((s) => s.category === "AI Engineering");
    if (aiEntry) {
      // v1: unconditional overwrite — AI Engineering row is the canonical gauge source.
      skillCoverage = aiEntry.current;
      marketRelevance = aiEntry.market_avg;
    } else {
      marketRelevance = avg(
        skill_map.map((s) =>
          s.market_avg > 0 ? Math.min(100, (s.current / s.market_avg) * 100) : 100
        )
      );
    }
  }

  if (directCoverage != null) {
    skillCoverage = directCoverage;
  }

  return { targetRole, skillsToGo, estimatedTimeline, skillCoverage, marketRelevance, careerGrowth };
}

export function mapRawSkillProgression(
  raw: Record<string, unknown> | null | undefined,
): SkillData | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const unwrapped = unwrapMcpToolRecord(raw) ?? raw;

  const roleTitle =
    typeof unwrapped.role_title === "string"
      ? unwrapped.role_title
      : typeof unwrapped.roleTitle === "string"
        ? unwrapped.roleTitle
        : undefined;

  const skillMap = Array.isArray(unwrapped.skill_map)
    ? (unwrapped.skill_map.map(mapSkillMapItem).filter(Boolean) as SkillMapItem[])
    : undefined;

  const progressionSource = unwrapped.skill_progression ?? unwrapped.skills;
  const skillProgression = Array.isArray(progressionSource)
    ? (progressionSource.map(mapSkillProgressionItem).filter(Boolean) as SkillProgressionItem[])
    : undefined;

  const learningPathNodes = Array.isArray(unwrapped.learning_path_nodes)
    ? (unwrapped.learning_path_nodes.map(mapLearningPathNode).filter(Boolean) as LearningPathNode[])
    : undefined;

  const learningPathEdges = Array.isArray(unwrapped.learning_path_edges)
    ? (unwrapped.learning_path_edges.map(mapLearningPathEdge).filter(Boolean) as LearningPathEdge[])
    : undefined;

  const skill_coverage = coercePercent0to100(
    unwrapped.skill_coverage ??
      unwrapped.coverage_score ??
      unwrapped.skill_coverage_score ??
      unwrapped.coverage_percent,
  );
  const market_relevance = coercePercent0to100(
    unwrapped.market_relevance ??
      unwrapped.market_relevance_score ??
      unwrapped.market_score,
  );
  const career_growth = coercePercent0to100(
    unwrapped.career_growth ?? unwrapped.career_growth_score ?? unwrapped.growth_score,
  );

  if (
    !roleTitle &&
    !skillMap?.length &&
    !skillProgression?.length &&
    skill_coverage == null &&
    market_relevance == null &&
    career_growth == null
  )
    return null;

  return {
    role_title: roleTitle,
    skill_map: skillMap,
    skill_progression: skillProgression,
    learning_path_nodes: learningPathNodes,
    learning_path_edges: learningPathEdges,
    skill_coverage,
    market_relevance,
    career_growth,
  };
}

export function extractGaugeScores(rawSkills: unknown): {
  skillCoverage?: number;
  marketRelevance?: number;
  careerGrowth?: number;
} {
  const flat = unwrapMcpToolRecord(rawSkills) ?? (rawSkills as Record<string, unknown> | null);
  const data = mapRawSkillProgression(flat);
  if (!data) return {};
  const metrics = computeProfileMetrics(data);
  return {
    skillCoverage: metrics.skillCoverage,
    marketRelevance: metrics.marketRelevance,
    careerGrowth: metrics.careerGrowth,
  };
}

function scoreKeysFromRecord(r: Record<string, unknown>): number | undefined {
  const nestedMetrics = r.metrics && typeof r.metrics === "object" ? (r.metrics as Record<string, unknown>) : null;
  return (
    coercePercent0to100(r.overall_score) ??
    coercePercent0to100(r.overallScore) ??
    coercePercent0to100(r.market_relevance_score) ??
    coercePercent0to100(r.marketRelevanceScore) ??
    coercePercent0to100(r.relevance_score) ??
    coercePercent0to100(r.score) ??
    coercePercent0to100(r.percentage) ??
    coercePercent0to100(nestedMetrics?.overall_score)
  );
}

/** trainco-v1 MarketRelevanceSheet: `unwrap(resolved)` then `data.overall_score`. */
export function extractMarketRelevancePercent(raw: unknown): number | undefined {
  const rec = unwrapMcpToolRecord(raw);
  if (!rec) return undefined;
  const fromTop = scoreKeysFromRecord(rec);
  if (fromTop != null) return fromTop;
  for (const key of ["data", "result", "payload", "market_relevance", "analysis"] as const) {
    const inner = rec[key];
    if (inner && typeof inner === "object" && !Array.isArray(inner)) {
      const p = scoreKeysFromRecord(inner as Record<string, unknown>);
      if (p != null) return p;
    }
  }
  return undefined;
}

function careerScoreFromRecord(r: Record<string, unknown>): number | undefined {
  const traj =
    r.compensation_trajectory && typeof r.compensation_trajectory === "object"
      ? (r.compensation_trajectory as Record<string, unknown>)
      : null;
  return (
    coercePercent0to100(traj?.market_percentile) ??
    coercePercent0to100(traj?.percentile) ??
    coercePercent0to100(r.market_percentile) ??
    coercePercent0to100(r.career_growth_score) ??
    coercePercent0to100(r.careerGrowthScore) ??
    coercePercent0to100(r.growth_score) ??
    coercePercent0to100(r.growth_index) ??
    coercePercent0to100(r.velocity_score) ??
    coercePercent0to100(r.percentile)
  );
}

/** trainco-v1 CareerGrowthSheet: `unwrap(resolved)` then `compensation_trajectory.market_percentile`. */
export function extractCareerGrowthPercent(raw: unknown): number | undefined {
  const rec = unwrapMcpToolRecord(raw);
  if (!rec) return undefined;
  const fromTop = careerScoreFromRecord(rec);
  if (fromTop != null) return fromTop;
  for (const key of ["data", "result", "payload"] as const) {
    const inner = rec[key];
    if (inner && typeof inner === "object" && !Array.isArray(inner)) {
      const p = careerScoreFromRecord(inner as Record<string, unknown>);
      if (p != null) return p;
    }
  }
  return undefined;
}

function mapSkillMapItem(item: unknown): SkillMapItem | null {
  if (!item || typeof item !== "object") return null;
  const o = item as Record<string, unknown>;
  if (typeof o.category !== "string") return null;
  return {
    category: o.category,
    current: Number(o.current) || 0,
    market_avg: Number(o.market_avg) || 0,
    top10: Number(o.top10) || 0,
  };
}

function mapSkillProgressionItem(item: unknown): SkillProgressionItem | null {
  if (!item || typeof item !== "object") return null;
  const o = item as Record<string, unknown>;
  const name =
    typeof o.name === "string"
      ? o.name
      : typeof o.skill === "string"
        ? o.skill
        : typeof o.skill_name === "string"
          ? o.skill_name
          : typeof o.label === "string"
            ? o.label
            : null;
  if (!name) return null;
  return {
    name,
    current_level: Number(o.current_level ?? o.currentLevel ?? o.level) || 0,
    target_level: Number(o.target_level ?? o.targetLevel ?? o.target) || 0,
    is_featured: !!o.is_featured,
  };
}

function mapLearningPathNode(item: unknown): LearningPathNode | null {
  if (!item || typeof item !== "object") return null;
  const o = item as Record<string, unknown>;
  if (typeof o.id !== "string" || typeof o.label !== "string") return null;
  const status = o.status as string;
  if (status !== "completed" && status !== "in-progress" && status !== "upcoming")
    return null;
  return {
    id: o.id,
    label: o.label,
    status,
    x: Number(o.x) || 0,
    y: Number(o.y) || 0,
    milestones: Array.isArray(o.milestones)
      ? o.milestones.filter((m): m is string => typeof m === "string")
      : undefined,
  };
}

function mapLearningPathEdge(item: unknown): LearningPathEdge | null {
  if (!item || typeof item !== "object") return null;
  const o = item as Record<string, unknown>;
  if (typeof o.from !== "string" || typeof o.to !== "string") return null;
  return { from: o.from, to: o.to };
}
