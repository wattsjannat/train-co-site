/** A single AI-driven section rendered by DynamicSectionLoader. */
export interface GenerativeSection {
  id: string;
  templateId: string;
  props: Record<string, unknown>;
}

/** Raw skill gap from the scoring service. */
export interface BackendSkillGap {
  name: string;
  required_level: string;
  current_level: string | null;
}

export type FitCategory = "good-fit" | "stretch" | "grow-into";

/** Raw job item as returned by the `get_jobs_by_skills` MCP tool. */
export interface BackendJobItem {
  job: {
    id?: string;
    title?: string;
    company?: string;
    company_name?: string;
    company_logo?: string;
    location?: string;
    salary_range?: string;
    salary_min?: number;
    salary_max?: number;
    description?: string;
    summary?: string;
    ai_summary?: string;
    posted_at?: string;
    application_url?: string;
    match_score?: number;
    score?: number;
    required_skills?: { name: string; level?: string }[];
  };
  match_score?: number;
  score?: number;
  fit_category?: FitCategory;
  fitCategory?: FitCategory;
  skill_gaps?: BackendSkillGap[];
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  salaryRange?: string;
  description?: string;
  tags?: string[];
  postedAt?: string;
  applicationUrl?: string;
  matchScore?: number;
  fitCategory?: FitCategory;
  aiSummary?: string;
  aiGapInsight?: string;
  skillGaps?: string[];
  fullPostingSummary?: string;
  dayInLifeVideoTitle?: string;
  dayInLifeVideoDuration?: string;
  dayInLifeVideoEpisode?: string;
}

declare global {
  interface Window {
    UIFrameworkSiteFunctions: Record<string, unknown>;
    UIFrameworkPreInitConfig: Record<string, unknown>;
    UIFRAMEWORK_AUTO_INIT: boolean;
    teleVolume?: {
      setVolume: (level: number) => void;
      adjustVolume: (delta: number) => void;
      getVolume: () => number;
    };
  }
}
