/**
 * Site Functions Registration
 *
 * Registers all site functions on window.__siteFunctions so the voice agent
 * can invoke them via the callSiteFunction RPC.
 *
 * Scope: ONLY navigateToSection, navigateWithKnowledgeKey, setTheme (UI).
 * MCP tools (find_candidate, get_candidate) are NOT site functions — the agent
 * must call those on the MCP/native tool channel, never as call_site_function
 * names (would yield "Unknown site function").
 * get_jobs_by_skills, get_skill_progression, get_market_relevance, and
 * get_career_growth are fetched directly by the SPA via mcpBridge — the agent
 * must NOT call those tools.
 *
 * Convention:
 * - Each .ts file in src/site-functions/ (except register.ts, index.ts, types.ts)
 *   exports a default function
 * - The filename (camelCase) becomes the function name on window.__siteFunctions
 * - Functions receive (args: Record<string, any>) and return any
 *
 * Manifest:
 * - Each entry in `siteFunctionManifest` provides metadata alongside the function
 * - `description` is MANDATORY — used as the agent tool description
 * - `schema` is optional — JSON Schema for the function's parameters
 * - `defaults` is optional — default argument values when not provided by agent
 * - The discovery service extracts this manifest on deployment for validation
 */

import { NAVIGABLE_KNOWLEDGE_KEYS } from '@/data/traincoStaticKnowledge';

import navigateToSection from './navigateToSection';
import navigateWithKnowledgeKey from './navigateWithKnowledgeKey';
import setTheme from './setTheme';

// ─── Types ──────────────────────────────────────────────────────────────────

export type SiteFunctionEntry = {
  /** The function implementation */
  fn: (args: any) => any;
  /** MANDATORY: Agent-facing description of what this function does */
  description: string;
  /** Optional: JSON Schema describing the function's input parameters */
  schema?: Record<string, any>;
  /** Optional: Default values for parameters when not provided by the agent */
  defaults?: Record<string, any>;
};

// ─── Manifest ───────────────────────────────────────────────────────────────

/**
 * Site function manifest — the single source of truth for all registered functions.
 *
 * Each key is the camelCase function name that the agent will use to call it.
 * The discovery service reads this manifest on deployment to extract metadata
 * and validate schemas.
 *
 * Mobeus expects `site-functions/register.ts` at the **repo root** — that file
 * re-exports this module so the dashboard can discover registered tools.
 */
export const siteFunctionManifest: Record<string, SiteFunctionEntry> = {
  setTheme: {
    fn: setTheme,
    description:
      'Switch the website theme between light, dark, or system preference',
    schema: {
      type: 'object',
      properties: {
        theme: {
          type: 'string',
          enum: ['light', 'dark', 'system'],
          description: 'The theme to apply',
        },
      },
      required: ['theme'],
    },
    defaults: { theme: 'system' },
  },

  navigateToSection: {
    fn: navigateToSection,
    description:
      'Browser UI only (call_site_function). The HOST parses the whole tool argument with JSON.parse before the SPA runs — unescaped quotes/newlines inside nested MCP objects cause "could not parse arguments JSON" and no UI. For get_candidate result use ONLY the string prop rawCandidateJson (value = JSON.stringify of the full tool result). Do NOT pass rawJobsJson, rawSkillProgressionJson, rawMarketRelevanceJson, or rawCareerGrowthJson — the SPA fetches those automatically. NOT for find_candidate/get_candidate/MCP — call those as separate native/MCP tools, then merge results into this payload. ' +
      'navigateToSection (glass contract v2, English only). One root object: badge, title, subtitle, generativeSubsections — each subsection { id?, templateId, props, _update? }. ' +
      'Each call replaces the screen except Dashboard stacks with ProfileSheet, job sheets, learning sheets, etc.; welcome greeting uses GlassmorphicOptions alone (no Dashboard). ' +
      'On UI-transition turns: speak + this tool in the same response — never tool-only except Step 6 split allowed: CandidateSheet call_site_function first, then a follow-up turn may be speech-only with "connected successfully / details look correct?" only after that navigate ran. Prefer tool ordering so CandidateSheet runs before TTS plays those lines. Voice: keep lines short; when CardStack shows jobs, do not read job titles/companies/locations aloud — one or two sentences max. TeleSpeechBubble is persistent; questions are spoken, not passed as props. ' +
      'Qualification: advance only after TellTele — Glassmorphic: `user selected:`; MultiSelect: `user selected:` after Continue; TextInput: `user typed:` after submit. Client rejects navigation without that signal. At most **one** navigate tool per assistant message for the funnel — never chain steps in one response. ' +
      'Wait for user signals after: GlassmorphicOptions, MultiSelectOptions, TextInput, RegistrationForm, CandidateSheet, CardStack, SavedJobsStack. MultiSelectOptions: non-empty props.bubbles required — the site does not auto-fill labels; use navigateWithKnowledgeKey for canonical steps or copy bubbles verbatim; include props.progressStep (0/1/2) when hand-building so the client can enforce order. ' +
      '_update: true merges delta props into the matching id/templateId without full re-mount. Strict JSON (double quotes, no trailing commas, no comments); omit optional keys — never send null. ' +
      'Reserved: _sessionEstablished (see agent-knowledge execution rule 8; frontend may strip). ' +
      'Data: the SPA fetches jobs, skills, market relevance, and career growth automatically via its own bridge — do NOT call get_jobs_by_skills, get_skill_progression, get_market_relevance, or get_career_growth. Only find_candidate and get_candidate must be called by the agent. After find_candidate+get_candidate: call call_site_function CandidateSheet with rawCandidateJson (JSON.stringify of get_candidate result) — the SPA will hydrate jobs and metrics in the background; stopping after get_candidate leaves LoadingLinkedIn with no further RPCs. ' +
      'CandidateSheet: after find+get_candidate, call call_site_function CandidateSheet with rawCandidateJson only. Looks Good → call_site_function CardStack (empty job props — SPA populates automatically). Step 7 must call_site_function CardStack same turn as speech. Nested raw* objects break outer JSON. JobDetailSheet: jobId, title, company, fitCategory. SavedJobsStack: bubbles via navigateWithKnowledgeKey or speak-llm. ' +
      'Corrections: [TEMPLATE ERROR] → resend full payload with valid templateId; [CORRECTION NEEDED] → _update: true with delta only; [REMINDER] → include navigateToSection when the turn requires UI. ' +
      'Full journeys: public/prompts/speak-llm-system-prompt.md. Optional one-step static screens: navigateWithKnowledgeKey. CARDS DSL / GridView: public/prompts/show-llm-system-prompt.md.',
    schema: {
      type: 'object',
      description:
        'Matches glass-prompt.md payload schema: badge, title, subtitle, generativeSubsections',
      properties: {
        badge: { type: 'string', description: 'Context label (e.g. trAIn CAREER)' },
        title: { type: 'string', description: 'Main heading' },
        subtitle: { type: 'string', description: 'Subheading' },
        generativeSubsections: {
          type: 'array',
          description:
            'Screen sections; each call typically replaces content unless paired Dashboard + sheet per glass rules',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Stable section id for stacking / _update matching' },
              templateId: {
                type: 'string',
                description:
                  'Template: GlassmorphicOptions, MultiSelectOptions, TextInput, RegistrationForm, Dashboard, ProfileSheet, CardStack, SavedJobsStack, JobSearchSheet, JobDetailSheet, etc.',
              },
              props: { type: 'object', additionalProperties: true },
              _update: {
                type: 'boolean',
                description: 'If true, merge props into existing section with same id/templateId',
              },
            },
            required: ['templateId'],
          },
        },
      },
      required: ['badge', 'title', 'subtitle', 'generativeSubsections'],
    },
  },

  navigateWithKnowledgeKey: {
    fn: navigateWithKnowledgeKey,
    description:
      'Browser UI only (call_site_function). NOT for MCP data tools. ' +
      'One RPC: apply a canonical static screen from src/data/traincoStaticKnowledge.ts (welcome, qualification, dashboard shells, role multiselect by industry, etc.). Use instead of hand-writing navigateToSection JSON so templateIds and bubble labels match TellTele/voice (e.g. after `user selected: Yes, I\'m ready` use key `qualification_industry` — must be MultiSelectOptions, not GlassmorphicOptions). Do not use for metadata-only tables (job quick-actions / back-nav) — those are inline in speak-llm. Still speak in the same turn as glass rules require. ' +
      'MultiSelect: do not call the next qualification key until TellTele sends `user selected:` after Continue; repeated same key within ~2s is suppressed client-side — do not retry-spam. Qualification: **only one** navigateWithKnowledgeKey per user signal — never stack role + priority keys before Continue.',
    schema: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          enum: NAVIGABLE_KNOWLEDGE_KEYS,
          description: 'Navigable static key (full-screen roots only).',
        },
      },
      required: ['key'],
    },
  },
};

// ─── Window registration ────────────────────────────────────────────────────

// Extend window type
declare global {
  interface Window {
    __siteFunctions: Record<string, (args: any) => any>;
  }
}

/**
 * Register all site functions on window.__siteFunctions.
 * Call this once on app initialization (e.g., in VoiceSessionProvider or layout).
 *
 * Only the `fn` from each manifest entry is registered on the window —
 * metadata (description, schema, defaults) is used by the discovery service,
 * not at runtime.
 */
export function registerSiteFunctions() {
  if (typeof window === 'undefined') return;

  window.__siteFunctions ??= {};
  for (const [name, entry] of Object.entries(siteFunctionManifest)) {
    /** Do not overwrite an already-installed handler (e.g. live `navigateToSection` from usePhaseFlow). */
    if (window.__siteFunctions[name] !== undefined) continue;
    window.__siteFunctions[name] = entry.fn;
  }
}
