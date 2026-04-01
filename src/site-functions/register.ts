/**
 * Site Functions Registration
 *
 * Registers all site functions on window.__siteFunctions so the voice agent
 * can invoke them via the callSiteFunction RPC.
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

import setTheme from './setTheme';
import getWelcomeJourneyTool from './getWelcomeJourneyTool';

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
  getWelcomeJourneyTool: {
    fn: getWelcomeJourneyTool,
    description:
      'Get welcome journey tool data for rendering UI components in the Mobeus career onboarding flow. Returns tool metadata including component type, options, badge, title, subtitle, and progress indicators. Supports 19 different tools across greeting, industry qualification, role selection, interest exploration, priorities, and registration steps.',
    schema: {
      type: 'object',
      properties: {
        toolId: {
          type: 'string',
          description: 'The tool ID to retrieve (e.g., "2194-A" for greeting, "7483-A" for industry, "4521-A" for tech roles, "9183-A" for registration)',
          enum: [
            '2194-A', '2194-B', // Greeting & Tell More
            '7483-A', '7483-B', '7483-C', // Industry
            '4521-A', '4521-B', '4521-C', '4521-D', '4521-E', '4521-F', '4521-G', // Roles
            '4521-H', '4521-I', '4521-J', '4521-K', // Interests
            '1657-A', '1657-B', // Priorities
            '9183-A' // Registration
          ],
        },
        customIndustry: {
          type: 'string',
          description: 'Optional: Custom industry name for dynamic role generation (required only for tool 4521-E)',
        },
      },
      required: ['toolId'],
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

  window.__siteFunctions = {};
  for (const [name, entry] of Object.entries(siteFunctionManifest)) {
    window.__siteFunctions[name] = entry.fn;
  }
}
