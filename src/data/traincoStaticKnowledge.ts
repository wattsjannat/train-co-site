/**
 * Canonical static navigate payloads and tables aligned with trainco-v1 knowledge
 * (welcome, qualification, dashboard). Badge: trAIn CAREER.
 */

const BADGE = 'trAIn CAREER';

const ROLE_LABELS = {
  technology: ['Cybersecurity', 'Artificial Intelligence', 'Digital Transformation', 'Data Science'],
  finance: ['Investment & Banking', 'Accounting & Audit', 'Risk & Compliance', 'Financial Planning'],
  healthcare: ['Clinical (Doctor/Nurse)', 'Health Administration', 'Pharmacy', 'Medical Devices'],
  construction: ['Civil & Structural Engineering', 'Architecture', 'Project Management', 'MEP Engineering'],
  generic: [
    'Leadership & Strategy',
    'Marketing & Communications',
    'Human Resources',
    'Operations & Logistics',
  ],
} as const;

const INTEREST_LABELS = {
  technology: [
    'Solving complex logic puzzles',
    'Finding patterns in data',
    'Leading teams to launch products',
    'Designing easy to use interfaces',
    'Leading teams towards a goal',
  ],
  finance: [
    'Managing and analysing data',
    'Identifying risks and mitigations',
    'Building client relationships',
    'Strategising investments',
    'Leading financial teams',
  ],
  healthcare: [
    'Caring for people directly',
    'Analysing patient data',
    'Managing healthcare operations',
    'Developing new treatments',
    'Leading medical teams',
  ],
  construction: [
    'Designing structures and spaces',
    'Managing complex projects',
    'Solving engineering challenges',
    'Coordinating large teams',
    'Working with innovative materials',
  ],
  generic: [
    'Solving a puzzle or problem',
    'Creating something from scratch',
    'Helping someone through a tough moment',
    'Organising chaos into order',
    'Learning something completely new',
    'Leading a group',
  ],
} as const;

type IndustrySlug = keyof typeof ROLE_LABELS;

function labelsToBubbles(labels: readonly string[]) {
  return labels.map((label) => ({ label }));
}

function withSomethingElseNotSure(bubbles: { label: string }[]) {
  return [...bubbles, { label: 'Something else' }, { label: "I'm not sure" }];
}

function buildRoleMultiselect(slug: IndustrySlug) {
  const base = labelsToBubbles(ROLE_LABELS[slug]);
  return {
    badge: BADGE,
    title: 'Qualification',
    subtitle: 'Step 2 of 3',
    generativeSubsections: [
      {
        id: 'role',
        templateId: 'MultiSelectOptions',
        props: {
          bubbles: withSomethingElseNotSure(base),
          showProgress: true,
          progressStep: 1,
          progressTotal: 3,
        },
      },
    ],
  };
}

function buildInterestMultiselect(slug: IndustrySlug) {
  const base = labelsToBubbles(INTEREST_LABELS[slug]);
  return {
    badge: BADGE,
    title: 'Qualification',
    subtitle: 'Step 2 of 3',
    generativeSubsections: [
      {
        id: 'role-exploration',
        templateId: 'MultiSelectOptions',
        props: {
          bubbles: withSomethingElseNotSure(base),
          showProgress: true,
          progressStep: 1,
          progressTotal: 3,
        },
      },
    ],
  };
}

const WELCOME_GREETING = {
  badge: BADGE,
  title: 'Welcome',
  subtitle: 'Getting started',
  generativeSubsections: [
    {
      id: 'start',
      templateId: 'GlassmorphicOptions',
      props: {
        bubbles: [
          { label: "Yes, I'm ready" },
          { label: 'Not just yet' },
          { label: 'Tell me more' },
        ],
      },
    },
  ],
};

const WELCOME_TELL_ME_MORE = {
  badge: BADGE,
  title: 'Welcome',
  subtitle: 'About TrAIn',
  generativeSubsections: [
    {
      id: 'tell-me-more',
      templateId: 'GlassmorphicOptions',
      props: {
        bubbles: [
          { label: 'How does TrAIn work?' },
          { label: 'How is TrAIn different?' },
          { label: 'Can I build skills on TrAIn?' },
          { label: 'Which jobs can I find on TrAIn?' },
          { label: 'How does TrAIn use my data?' },
          { label: 'Something else' },
        ],
      },
    },
  ],
};

const QUALIFICATION_INDUSTRY = {
  badge: BADGE,
  title: 'Qualification',
  subtitle: 'Step 1 of 3',
  generativeSubsections: [
    {
      id: 'industry',
      templateId: 'MultiSelectOptions',
      props: {
        bubbles: [
          { label: 'Technology' },
          { label: 'Finance' },
          { label: 'Healthcare' },
          { label: 'Construction' },
          { label: 'Something else' },
          { label: "I'm not sure" },
        ],
        showProgress: true,
        progressStep: 0,
        progressTotal: 3,
      },
    },
  ],
};

const QUALIFICATION_INDUSTRY_TEXT = {
  badge: BADGE,
  title: 'Qualification',
  subtitle: 'Step 1 of 3',
  generativeSubsections: [
    {
      id: 'industry-text',
      templateId: 'TextInput',
      props: { placeholder: 'Type industry' },
    },
  ],
};

const QUALIFICATION_EXPLORATION = {
  badge: BADGE,
  title: 'Exploration',
  subtitle: 'Tell us what you enjoy',
  generativeSubsections: [
    {
      id: 'exploration',
      templateId: 'MultiSelectOptions',
      props: {
        bubbles: [
          { label: 'Solving a puzzle or problem' },
          { label: 'Creating something from scratch' },
          { label: 'Helping someone through a tough moment' },
          { label: 'Organising chaos into order' },
          { label: 'Learning something completely new' },
          { label: 'Leading a group' },
        ],
      },
    },
  ],
};

const QUALIFICATION_ROLE_CUSTOM_TEXT = {
  badge: BADGE,
  title: 'Qualification',
  subtitle: 'Step 2 of 3',
  generativeSubsections: [
    {
      id: 'role-custom',
      templateId: 'TextInput',
      props: { placeholder: 'Type role' },
    },
  ],
};

const QUALIFICATION_PRIORITY = {
  badge: BADGE,
  title: 'Priorities',
  subtitle: 'Step 3 of 3',
  generativeSubsections: [
    {
      id: 'priority',
      templateId: 'MultiSelectOptions',
      props: {
        bubbles: [
          { label: 'Searching and browsing listings' },
          { label: 'Experience and personality fit' },
          { label: 'Location' },
          { label: 'Know which skills are required' },
          { label: 'Take courses and earn certifications' },
          { label: 'Something else' },
        ],
        showProgress: true,
        progressStep: 2,
        progressTotal: 3,
      },
    },
  ],
};

const QUALIFICATION_PRIORITY_TEXT = {
  badge: BADGE,
  title: 'Priorities',
  subtitle: 'Step 3 of 3',
  generativeSubsections: [
    {
      id: 'priority-text',
      templateId: 'TextInput',
      props: { placeholder: 'Type what matters most' },
    },
  ],
};

const QUALIFICATION_REGISTRATION = {
  badge: BADGE,
  title: 'Registration',
  subtitle: 'Create your account',
  generativeSubsections: [{ id: 'registration', templateId: 'RegistrationForm', props: {} }],
};

const DASHBOARD_LANDING = {
  badge: BADGE,
  title: 'Dashboard',
  subtitle: 'Your Profile',
  generativeSubsections: [
    { id: 'dashboard', templateId: 'Dashboard', props: {} },
    { id: 'profile-home', templateId: 'ProfileSheet', props: { dashboardAnchor: true } },
  ],
};

const JOB_SEARCH_SHEET = {
  badge: BADGE,
  title: 'Job Center',
  subtitle: 'Find your next job here',
  generativeSubsections: [
    { id: 'dashboard', templateId: 'Dashboard', props: {} },
    { id: 'job-search', templateId: 'JobSearchSheet', props: {} },
  ],
};

const JOB_DETAIL_SHEET = {
  badge: BADGE,
  title: 'Job Detail',
  subtitle: '<title>',
  generativeSubsections: [
    { id: 'dashboard', templateId: 'Dashboard', props: {} },
    {
      id: 'job-detail',
      templateId: 'JobDetailSheet',
      props: {
        jobId: '<id>',
        title: '<title>',
        company: '<company>',
        fitCategory: 'good-fit|stretch|grow-into',
      },
    },
  ],
};

const ELIGIBILITY_SHEET = {
  badge: BADGE,
  title: 'Eligibility',
  subtitle: 'Am I eligible?',
  generativeSubsections: [
    { id: 'dashboard', templateId: 'Dashboard', props: {} },
    {
      id: 'eligibility',
      templateId: 'EligibilitySheet',
      props: {
        jobId: '<id>',
        jobTitle: '<title>',
        company: '<company>',
        matchScore: '<score>',
      },
    },
  ],
};

const CLOSE_GAP_SHEET = {
  badge: BADGE,
  title: 'Close the Gap',
  subtitle: 'Bridge your skill gaps',
  generativeSubsections: [
    { id: 'dashboard', templateId: 'Dashboard', props: {} },
    {
      id: 'close-gap',
      templateId: 'CloseGapSheet',
      props: { jobId: '<id>', jobTitle: '<title>', company: '<company>' },
    },
  ],
};

const JOB_APPLICATIONS_SHEET = {
  badge: BADGE,
  title: 'Applications',
  subtitle: 'Track your progress',
  generativeSubsections: [
    { id: 'dashboard', templateId: 'Dashboard', props: {} },
    { id: 'applications', templateId: 'JobApplicationsSheet', props: {} },
  ],
};

const SAVED_JOBS_STACK = {
  badge: BADGE,
  title: 'Saved Jobs',
  subtitle: 'Your shortlist',
  generativeSubsections: [
    { id: 'dashboard', templateId: 'Dashboard', props: {} },
    {
      id: 'saved-jobs',
      templateId: 'SavedJobsStack',
      props: {
        bubbles: [
          { label: 'View full posting', variant: 'default' },
          { label: 'Am I eligible?', variant: 'green', showArrow: true },
          { label: 'Find more jobs', variant: 'default' },
          { label: 'View all saved jobs', variant: 'default' },
        ],
      },
    },
  ],
};

const PAST_APPLICATIONS_SHEET = {
  badge: BADGE,
  title: 'Past Applications',
  subtitle: 'Previous outcomes',
  generativeSubsections: [
    { id: 'dashboard', templateId: 'Dashboard', props: {} },
    { id: 'past-apps', templateId: 'PastApplicationsSheet', props: {} },
  ],
};

const SKILLS_DETAIL = {
  badge: BADGE,
  title: 'Dashboard',
  subtitle: 'Your skills overview',
  generativeSubsections: [
    { id: 'dashboard', templateId: 'Dashboard', props: {} },
    {
      id: 'skills-detail',
      templateId: 'SkillsDetail',
      props: {
        bubbles: [
          { label: 'View Skill Coverage', variant: 'green', showArrow: true },
          { label: 'Recommend a Skill', variant: 'default' },
        ],
      },
    },
  ],
};

const SKILLS_DETAIL_WIDGET2 = {
  badge: BADGE,
  title: 'Dashboard',
  subtitle: 'Your skills overview',
  generativeSubsections: [
    {
      id: 'dashboard',
      templateId: 'Dashboard',
      props: {},
    },
    {
      id: 'skills-detail',
      templateId: 'SkillsDetail',
      props: { _triggerWidget: 2 },
      _update: true,
    },
  ],
};

const MARKET_RELEVANCE_DETAIL = {
  badge: BADGE,
  title: 'Dashboard',
  subtitle: 'Your market relevance',
  generativeSubsections: [
    { id: 'dashboard', templateId: 'Dashboard', props: {} },
    {
      id: 'market-relevance-detail',
      templateId: 'MarketRelevanceDetail',
      props: {
        bubbles: [
          { label: 'View Market Relevance', variant: 'green', showArrow: true },
          { label: 'Where to Invest Your Time', variant: 'default' },
        ],
      },
    },
  ],
};

const MARKET_RELEVANCE_DETAIL_WIDGET2 = {
  badge: BADGE,
  title: 'Dashboard',
  subtitle: 'Your market relevance',
  generativeSubsections: [
    { id: 'dashboard', templateId: 'Dashboard', props: {} },
    {
      id: 'market-relevance-detail',
      templateId: 'MarketRelevanceDetail',
      props: { _triggerWidget: 2 },
      _update: true,
    },
  ],
};

const CAREER_GROWTH_DETAIL = {
  badge: BADGE,
  title: 'Dashboard',
  subtitle: 'Your career growth',
  generativeSubsections: [
    { id: 'dashboard', templateId: 'Dashboard', props: {} },
    {
      id: 'career-growth-detail',
      templateId: 'CareerGrowthDetail',
      props: {
        bubbles: [
          { label: 'View Career Growth', variant: 'green', showArrow: true },
          { label: 'Compensation Trajectory', variant: 'default' },
        ],
      },
    },
  ],
};

const CAREER_GROWTH_DETAIL_WIDGET2 = {
  badge: BADGE,
  title: 'Dashboard',
  subtitle: 'Your career growth',
  generativeSubsections: [
    { id: 'dashboard', templateId: 'Dashboard', props: {} },
    {
      id: 'career-growth-detail',
      templateId: 'CareerGrowthDetail',
      props: { _triggerWidget: 2 },
      _update: true,
    },
  ],
};

const TARGET_ROLE_SHEET = {
  badge: BADGE,
  title: 'Target Role',
  subtitle: 'Your target role breakdown',
  generativeSubsections: [
    { id: 'dashboard', templateId: 'Dashboard', props: {} },
    { id: 'target-role', templateId: 'TargetRoleSheet', props: {} },
  ],
};

const MY_LEARNING_SHEET = {
  badge: BADGE,
  title: 'My Learning',
  subtitle: 'Your courses and lessons',
  generativeSubsections: [
    { id: 'dashboard', templateId: 'Dashboard', props: {} },
    { id: 'my-learning', templateId: 'MyLearningSheet', props: {} },
  ],
};

const JOB_QUICK_ACTIONS_TABLE = {
  description: 'Job quick-action signals: speech and next action (trainco_dashboard_tables).',
  rows: [
    {
      signal: 'user clicked: Apply Now',
      speech: 'Great choice! Your application is being submitted.',
      then: 'same_response_navigate_dashboard_landing',
    },
    {
      signal: 'user clicked: Start Learning',
      speech: 'Starting your course now. Good luck!',
      then: 'same_response_navigate_dashboard_landing',
    },
    {
      signal: 'user clicked: Add to Training',
      speech: 'Added to your training plan.',
      then: 'same_response_navigate_dashboard_landing',
    },
    {
      signal: 'user clicked: No Thanks',
      speech: 'No problem. Where would you like to go next?',
      then: 'same_response_navigate_dashboard_landing',
    },
    {
      signal: 'user clicked: Save for later',
      speech: 'Saved! You can find it in your saved jobs.',
      then: 'stay_on_current_view',
    },
  ],
  dashboard_landing_key: 'dashboard_landing',
};

const BACK_NAVIGATION_TABLE = {
  description: 'Back navigation: From → Navigate to (trainco_dashboard_tables).',
  rows: [
    { from: 'EligibilitySheet', navigateTo: 'JobDetailSheet' },
    { from: 'CloseGapSheet', navigateTo: 'EligibilitySheet' },
    { from: 'JobDetailSheet (from job browse)', navigateTo: 'JobSearchSheet' },
    { from: 'JobDetailSheet (from Saved Jobs / saved-*)', navigateTo: 'SavedJobsStack' },
    { from: 'JobSearchSheet', navigateTo: 'Dashboard (landing)' },
    { from: 'SavedJobsStack', navigateTo: 'Dashboard (landing)' },
    { from: 'PastApplicationsSheet', navigateTo: 'JobApplicationsSheet' },
    { from: 'JobApplicationsSheet', navigateTo: 'Dashboard (landing)' },
    {
      from: 'SkillCoverageSheet',
      navigateTo: 'SkillsDetail (if opened from SkillsDetail) or Dashboard (landing)',
    },
    { from: 'SkillsDetail', navigateTo: 'ProfileSheet' },
    { from: 'MarketRelevanceSheet', navigateTo: 'MarketRelevanceDetail' },
    { from: 'MarketRelevanceDetail', navigateTo: 'ProfileSheet' },
    { from: 'CareerGrowthSheet', navigateTo: 'CareerGrowthDetail' },
    { from: 'CareerGrowthDetail', navigateTo: 'ProfileSheet' },
    { from: 'ProfileSheet (non-anchor flows)', navigateTo: 'Dashboard (landing)' },
  ],
};

function buildKnowledge(): Record<string, unknown> {
  const k: Record<string, unknown> = {
    welcome_greeting: WELCOME_GREETING,
    welcome_tell_me_more: WELCOME_TELL_ME_MORE,
    qualification_industry: QUALIFICATION_INDUSTRY,
    qualification_industry_text_input: QUALIFICATION_INDUSTRY_TEXT,
    qualification_exploration: QUALIFICATION_EXPLORATION,
    qualification_role_custom_text_input: QUALIFICATION_ROLE_CUSTOM_TEXT,
    qualification_priority: QUALIFICATION_PRIORITY,
    qualification_priority_text_input: QUALIFICATION_PRIORITY_TEXT,
    qualification_registration: QUALIFICATION_REGISTRATION,
    dashboard_landing: DASHBOARD_LANDING,
    job_search_sheet: JOB_SEARCH_SHEET,
    job_detail_sheet: JOB_DETAIL_SHEET,
    eligibility_sheet: ELIGIBILITY_SHEET,
    close_gap_sheet: CLOSE_GAP_SHEET,
    job_applications_sheet: JOB_APPLICATIONS_SHEET,
    saved_jobs_stack: SAVED_JOBS_STACK,
    past_applications_sheet: PAST_APPLICATIONS_SHEET,
    skills_detail: SKILLS_DETAIL,
    skills_detail_widget2_update: SKILLS_DETAIL_WIDGET2,
    market_relevance_detail: MARKET_RELEVANCE_DETAIL,
    market_relevance_detail_widget2_update: MARKET_RELEVANCE_DETAIL_WIDGET2,
    career_growth_detail: CAREER_GROWTH_DETAIL,
    career_growth_detail_widget2_update: CAREER_GROWTH_DETAIL_WIDGET2,
    target_role_sheet: TARGET_ROLE_SHEET,
    my_learning_sheet: MY_LEARNING_SHEET,
    job_quick_actions_table: JOB_QUICK_ACTIONS_TABLE,
    back_navigation_table: BACK_NAVIGATION_TABLE,
  };

  (Object.keys(ROLE_LABELS) as IndustrySlug[]).forEach((slug) => {
    k[`role_multiselect_${slug}`] = buildRoleMultiselect(slug);
    k[`interest_multiselect_${slug}`] = buildInterestMultiselect(slug);
  });

  return k;
}

const KNOWLEDGE = buildKnowledge();

export const TRAINCO_KNOWLEDGE_KEYS = Object.keys(KNOWLEDGE).sort();

/** Keys that are full `navigateToSection` roots (not metadata-only tables). */
const NON_NAVIGABLE_KEYS = new Set(['job_quick_actions_table', 'back_navigation_table']);

export const NAVIGABLE_KNOWLEDGE_KEYS = TRAINCO_KNOWLEDGE_KEYS.filter((k) => !NON_NAVIGABLE_KEYS.has(k));

export function getTraincoKnowledgePayload(key: string): unknown | null {
  const normalized = key.trim().toLowerCase().replace(/-/g, '_');
  const payload = KNOWLEDGE[normalized];
  if (payload === undefined) return null;
  return JSON.parse(JSON.stringify(payload)) as unknown;
}
