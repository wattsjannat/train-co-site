/**
 * Site Functions Registration
 *
 * Registers all site functions on window.__siteFunctions so the voice agent
 * can invoke them via the callSiteFunction RPC.
 */

import setTheme from './setTheme';
import navigateToSection from './navigateToSection';
import journeyWelcomeGreeting from './journeyWelcomeGreeting';
import journeyWelcomeTellmore from './journeyWelcomeTellmore';
import journeyWelcomeIndustry from './journeyWelcomeIndustry';
import journeyWelcomeIndustryCustom from './journeyWelcomeIndustryCustom';
import journeyWelcomeExploration from './journeyWelcomeExploration';
import journeyWelcomeRoleTechnology from './journeyWelcomeRoleTechnology';
import journeyWelcomeRoleFinance from './journeyWelcomeRoleFinance';
import journeyWelcomeRoleHealthcare from './journeyWelcomeRoleHealthcare';
import journeyWelcomeRoleConstruction from './journeyWelcomeRoleConstruction';
import journeyWelcomeRoleCustomIndustry from './journeyWelcomeRoleCustomIndustry';
import journeyWelcomeRoleGeneric from './journeyWelcomeRoleGeneric';
import journeyWelcomeRoleCustomInput from './journeyWelcomeRoleCustomInput';
import journeyWelcomeInterestTechnology from './journeyWelcomeInterestTechnology';
import journeyWelcomeInterestFinance from './journeyWelcomeInterestFinance';
import journeyWelcomeInterestHealthcare from './journeyWelcomeInterestHealthcare';
import journeyWelcomeInterestConstruction from './journeyWelcomeInterestConstruction';
import journeyWelcomePriority from './journeyWelcomePriority';
import journeyWelcomePriorityCustom from './journeyWelcomePriorityCustom';
import journeyWelcomeRegistration from './journeyWelcomeRegistration';

// ─── Types ──────────────────────────────────────────────────────────────────

export type SiteFunctionEntry = {
  fn: (args: any) => any;
  description: string;
  schema?: Record<string, any>;
  defaults?: Record<string, any>;
};

// ─── Manifest ───────────────────────────────────────────────────────────────

export const siteFunctionManifest: Record<string, SiteFunctionEntry> = {
  setTheme: {
    fn: setTheme,
    description: 'Switch the website theme between light, dark, or system preference',
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
    description: 'Bridge function for Mobeus internal navigateToSection calls',
    schema: {
      type: 'object',
      properties: {
        badge: { type: 'string' },
        title: { type: 'string' },
        subtitle: { type: 'string' },
        generativeSubsections: { type: 'array' },
      },
    },
  },

  // Welcome Journey Tools
  journeyWelcomeGreeting: {
    fn: journeyWelcomeGreeting,
    description: 'Show welcome greeting with initial options (Yes I\'m ready, Not just yet, Tell me more)',
  },
  journeyWelcomeTellmore: {
    fn: journeyWelcomeTellmore,
    description: 'Show "Tell me more about TrAIn" options with 6 information topics',
  },
  journeyWelcomeIndustry: {
    fn: journeyWelcomeIndustry,
    description: 'Show industry selection (Technology, Finance, Healthcare, Construction, Something else, I\'m not sure)',
  },
  journeyWelcomeIndustryCustom: {
    fn: journeyWelcomeIndustryCustom,
    description: 'Show text input for custom industry name',
  },
  journeyWelcomeExploration: {
    fn: journeyWelcomeExploration,
    description: 'Show exploration options for users unsure about their industry',
  },
  journeyWelcomeRoleTechnology: {
    fn: journeyWelcomeRoleTechnology,
    description: 'Show technology role options (Cybersecurity, AI, Digital Transformation, Data Science)',
  },
  journeyWelcomeRoleFinance: {
    fn: journeyWelcomeRoleFinance,
    description: 'Show finance role options (Investment & Banking, Accounting, Risk & Compliance, Financial Planning)',
  },
  journeyWelcomeRoleHealthcare: {
    fn: journeyWelcomeRoleHealthcare,
    description: 'Show healthcare role options (Clinical, Health Administration, Pharmacy, Medical Devices)',
  },
  journeyWelcomeRoleConstruction: {
    fn: journeyWelcomeRoleConstruction,
    description: 'Show construction role options (Civil Engineering, Architecture, Project Management, MEP Engineering)',
  },
  journeyWelcomeRoleCustomIndustry: {
    fn: journeyWelcomeRoleCustomIndustry,
    description: 'Generate and show 4 relevant roles for a custom industry dynamically',
    schema: {
      type: 'object',
      properties: {
        customIndustry: {
          type: 'string',
          description: 'The custom industry name to generate roles for',
        },
      },
      required: ['customIndustry'],
    },
  },
  journeyWelcomeRoleGeneric: {
    fn: journeyWelcomeRoleGeneric,
    description: 'Show generic cross-industry role options (Leadership, Marketing, HR, Operations)',
  },
  journeyWelcomeRoleCustomInput: {
    fn: journeyWelcomeRoleCustomInput,
    description: 'Show text input for custom role name',
  },
  journeyWelcomeInterestTechnology: {
    fn: journeyWelcomeInterestTechnology,
    description: 'Show technology interest exploration options',
  },
  journeyWelcomeInterestFinance: {
    fn: journeyWelcomeInterestFinance,
    description: 'Show finance interest exploration options',
  },
  journeyWelcomeInterestHealthcare: {
    fn: journeyWelcomeInterestHealthcare,
    description: 'Show healthcare interest exploration options',
  },
  journeyWelcomeInterestConstruction: {
    fn: journeyWelcomeInterestConstruction,
    description: 'Show construction interest exploration options',
  },
  journeyWelcomePriority: {
    fn: journeyWelcomePriority,
    description: 'Show priority selection (Browsing listings, Experience fit, Location, Skills, Courses)',
  },
  journeyWelcomePriorityCustom: {
    fn: journeyWelcomePriorityCustom,
    description: 'Show text input for custom priority',
  },
  journeyWelcomeRegistration: {
    fn: journeyWelcomeRegistration,
    description: 'Show registration form with LinkedIn and Email options',
  },
};

// ─── Window registration ────────────────────────────────────────────────────

declare global {
  interface Window {
    __siteFunctions: Record<string, (args: any) => any>;
  }
}

export function registerSiteFunctions() {
  if (typeof window === 'undefined') return;

  // Preserve any early-registered functions (like navigateToSection proxy from inline script)
  window.__siteFunctions = window.__siteFunctions || {};
  
  for (const [name, entry] of Object.entries(siteFunctionManifest)) {
    window.__siteFunctions[name] = entry.fn;
  }
  
  console.log('[Site Functions] Registered', Object.keys(window.__siteFunctions).length, 'functions:', Object.keys(window.__siteFunctions));
}
