/**
 * getWelcomeJourneyTool — Returns welcome journey tool data for Mobeus UIFramework
 *
 * This function provides all the data needed for the welcome journey tools,
 * including options, metadata, and component types. The Mobeus agent calls this
 * to get the UI data it needs to render the appropriate component.
 *
 * @param args.toolId - The tool ID to retrieve (e.g., "2194-A", "7483-A", etc.)
 * @param args.customIndustry - Optional: custom industry name for dynamic role generation (tool 4521-E)
 *
 * Registered as window.__siteFunctions.getWelcomeJourneyTool
 * The voice agent can call this via the callSiteFunction RPC.
 */

// ─── Tool Data Map ──────────────────────────────────────────────────────────

const TOOL_DATA_MAP: Record<string, any> = {
  // GREETING & EXPLORATION TOOLS
  '2194-A': {
    stepId: '3847-A',
    toolId: '2194-A',
    componentType: 'GlassmorphicOptions',
    options: "Yes, I'm ready|Not just yet|Tell me more",
    badge: 'MOBEUS CAREER',
    title: 'Welcome',
    subtitle: 'Getting started',
  },
  '2194-B': {
    stepId: '3847-B',
    toolId: '2194-B',
    componentType: 'GlassmorphicOptions',
    options: "How does TrAIn work?|How is TrAIn different?|Can I build skills on TrAIn?|Which jobs can I find on TrAIn?|How does TrAIn use my data?|Something else",
    badge: 'MOBEUS CAREER',
    title: 'Welcome',
    subtitle: 'About TrAIn',
  },

  // INDUSTRY QUALIFICATION TOOLS
  '7483-A': {
    stepId: '5921-A',
    toolId: '7483-A',
    componentType: 'MultiSelectOptions',
    options: "Technology|Finance|Healthcare|Construction|Something else|I'm not sure",
    badge: 'MOBEUS CAREER',
    title: 'Qualification',
    subtitle: 'Step 1 of 3',
    progress: { progressStep: 0, progressTotal: 3 },
  },
  '7483-B': {
    stepId: '5921-B',
    toolId: '7483-B',
    componentType: 'TextInput',
    placeholder: 'Type industry',
    badge: 'MOBEUS CAREER',
    title: 'Qualification',
    subtitle: 'Step 1 of 3',
  },
  '7483-C': {
    stepId: '5921-C',
    toolId: '7483-C',
    componentType: 'MultiSelectOptions',
    options: 'Solving a puzzle or problem|Creating something from scratch|Helping someone through a tough moment|Organising chaos into order|Learning something completely new|Leading a group',
    badge: 'MOBEUS CAREER',
    title: 'Exploration',
    subtitle: 'Tell us what you enjoy',
  },

  // ROLE QUALIFICATION TOOLS (BY INDUSTRY)
  '4521-A': {
    stepId: '6138-A',
    toolId: '4521-A',
    componentType: 'MultiSelectOptions',
    options: "Cybersecurity|Artificial Intelligence|Digital Transformation|Data Science|Something else|I'm not sure",
    badge: 'MOBEUS CAREER',
    title: 'Qualification',
    subtitle: 'Step 2 of 3',
    progress: { progressStep: 1, progressTotal: 3 },
  },
  '4521-B': {
    stepId: '6138-B',
    toolId: '4521-B',
    componentType: 'MultiSelectOptions',
    options: "Investment & Banking|Accounting & Audit|Risk & Compliance|Financial Planning|Something else|I'm not sure",
    badge: 'MOBEUS CAREER',
    title: 'Qualification',
    subtitle: 'Step 2 of 3',
    progress: { progressStep: 1, progressTotal: 3 },
  },
  '4521-C': {
    stepId: '6138-C',
    toolId: '4521-C',
    componentType: 'MultiSelectOptions',
    options: "Clinical (Doctor/Nurse)|Health Administration|Pharmacy|Medical Devices|Something else|I'm not sure",
    badge: 'MOBEUS CAREER',
    title: 'Qualification',
    subtitle: 'Step 2 of 3',
    progress: { progressStep: 1, progressTotal: 3 },
  },
  '4521-D': {
    stepId: '6138-D',
    toolId: '4521-D',
    componentType: 'MultiSelectOptions',
    options: "Civil & Structural Engineering|Architecture|Project Management|MEP Engineering|Something else|I'm not sure",
    badge: 'MOBEUS CAREER',
    title: 'Qualification',
    subtitle: 'Step 2 of 3',
    progress: { progressStep: 1, progressTotal: 3 },
  },
  '4521-F': {
    stepId: '6138-F',
    toolId: '4521-F',
    componentType: 'MultiSelectOptions',
    options: "Leadership & Strategy|Marketing & Communications|Human Resources|Operations & Logistics|Something else|I'm not sure",
    badge: 'MOBEUS CAREER',
    title: 'Qualification',
    subtitle: 'Step 2 of 3',
    progress: { progressStep: 1, progressTotal: 3 },
  },
  '4521-G': {
    stepId: '6138-G',
    toolId: '4521-G',
    componentType: 'TextInput',
    placeholder: 'Type role',
    badge: 'MOBEUS CAREER',
    title: 'Qualification',
    subtitle: 'Step 2 of 3',
  },

  // INTEREST EXPLORATION TOOLS (BY INDUSTRY)
  '4521-H': {
    stepId: '6138-H',
    toolId: '4521-H',
    componentType: 'MultiSelectOptions',
    options: "Solving complex logic puzzles|Finding patterns in data|Leading teams to launch products|Designing easy to use interfaces|Leading teams towards a goal|Something else|I'm not sure",
    badge: 'MOBEUS CAREER',
    title: 'Role Exploration',
    subtitle: 'What interests you?',
  },
  '4521-I': {
    stepId: '6138-I',
    toolId: '4521-I',
    componentType: 'MultiSelectOptions',
    options: "Managing and analysing data|Identifying risks and mitigations|Building client relationships|Strategising investments|Leading financial teams|Something else|I'm not sure",
    badge: 'MOBEUS CAREER',
    title: 'Role Exploration',
    subtitle: 'What interests you?',
  },
  '4521-J': {
    stepId: '6138-J',
    toolId: '4521-J',
    componentType: 'MultiSelectOptions',
    options: "Caring for people directly|Analysing patient data|Managing healthcare operations|Developing new treatments|Leading medical teams|Something else|I'm not sure",
    badge: 'MOBEUS CAREER',
    title: 'Role Exploration',
    subtitle: 'What interests you?',
  },
  '4521-K': {
    stepId: '6138-K',
    toolId: '4521-K',
    componentType: 'MultiSelectOptions',
    options: "Designing structures and spaces|Managing complex projects|Solving engineering challenges|Coordinating large teams|Working with innovative materials|Something else|I'm not sure",
    badge: 'MOBEUS CAREER',
    title: 'Role Exploration',
    subtitle: 'What interests you?',
  },

  // PRIORITY TOOLS
  '1657-A': {
    stepId: '8294-A',
    toolId: '1657-A',
    componentType: 'MultiSelectOptions',
    options: 'Searching and browsing listings|Experience and personality fit|Location|Know which skills are required|Take courses and earn certifications|Something else',
    badge: 'MOBEUS CAREER',
    title: 'Priorities',
    subtitle: 'Step 3 of 3',
    progress: { progressStep: 2, progressTotal: 3 },
  },
  '1657-B': {
    stepId: '8294-B',
    toolId: '1657-B',
    componentType: 'TextInput',
    placeholder: 'Type what matters most',
    badge: 'MOBEUS CAREER',
    title: 'Priorities',
    subtitle: 'Step 3 of 3',
  },

  // REGISTRATION TOOL
  '9183-A': {
    stepId: '2916-A',
    toolId: '9183-A',
    componentType: 'RegistrationForm',
    badge: 'MOBEUS CAREER',
    title: 'Registration',
    subtitle: 'Create your account',
  },
};

// ─── Dynamic Role Generation ────────────────────────────────────────────────

/**
 * Industry-specific role suggestions for dynamic generation
 */
const INDUSTRY_ROLE_MAP: Record<string, string[]> = {
  'renewable energy': ['Solar Energy Engineering', 'Wind Power Specialist', 'Energy Storage Solutions', 'Sustainability Consulting'],
  'gaming': ['Game Design', 'Game Development', 'Esports Management', 'Game Production'],
  'agriculture': ['Agricultural Engineering', 'Farm Management', 'Agricultural Research', 'Sustainable Farming'],
  'fashion': ['Fashion Design', 'Fashion Marketing', 'Retail Management', 'Textile Engineering'],
  'education': ['Curriculum Design', 'Educational Technology', 'School Administration', 'Student Counseling'],
  'hospitality': ['Hotel Management', 'Event Planning', 'Food & Beverage Management', 'Tourism Development'],
  'automotive': ['Automotive Engineering', 'Electric Vehicle Design', 'Manufacturing Operations', 'Automotive Sales'],
  'aerospace': ['Aerospace Engineering', 'Aircraft Design', 'Space Systems', 'Aviation Management'],
  'media': ['Content Creation', 'Digital Marketing', 'Video Production', 'Journalism'],
  'retail': ['Retail Management', 'E-commerce', 'Supply Chain', 'Customer Experience'],
  'logistics': ['Supply Chain Management', 'Warehouse Operations', 'Transportation Planning', 'Logistics Coordination'],
  'manufacturing': ['Production Management', 'Quality Control', 'Process Engineering', 'Industrial Design'],
  'real estate': ['Property Management', 'Real Estate Development', 'Commercial Leasing', 'Real Estate Investment'],
  'legal': ['Corporate Law', 'Litigation', 'Legal Consulting', 'Compliance Management'],
  'consulting': ['Management Consulting', 'Strategy Consulting', 'IT Consulting', 'Business Analysis'],
  'nonprofit': ['Program Management', 'Fundraising', 'Community Outreach', 'Grant Writing'],
  'government': ['Public Policy', 'Government Administration', 'Public Affairs', 'Regulatory Compliance'],
  'telecommunications': ['Network Engineering', 'Telecommunications Management', '5G Technology', 'Telecom Sales'],
  'insurance': ['Risk Assessment', 'Claims Management', 'Insurance Sales', 'Actuarial Science'],
  'pharmaceuticals': ['Drug Development', 'Clinical Research', 'Regulatory Affairs', 'Pharmaceutical Sales'],
};

/**
 * Generate 4 relevant roles for a custom industry
 */
function generateRolesForIndustry(industry: string): string[] {
  const normalizedIndustry = industry.toLowerCase().trim();
  
  // Check for exact or partial match in our map
  for (const [key, roles] of Object.entries(INDUSTRY_ROLE_MAP)) {
    if (normalizedIndustry.includes(key) || key.includes(normalizedIndustry)) {
      return roles;
    }
  }
  
  // Fallback: generate generic roles based on common patterns
  const industryName = industry.charAt(0).toUpperCase() + industry.slice(1);
  return [
    `${industryName} Specialist`,
    `${industryName} Management`,
    `${industryName} Consulting`,
    `${industryName} Operations`,
  ];
}

// ─── Main Function ──────────────────────────────────────────────────────────

export default function getWelcomeJourneyTool(args: {
  toolId: string;
  customIndustry?: string;
}): { success: boolean; data?: any; error?: string } {
  const { toolId, customIndustry } = args;

  // Validate toolId
  if (!toolId || typeof toolId !== 'string') {
    return {
      success: false,
      error: 'Missing or invalid toolId parameter',
    };
  }

  // Handle dynamic tool (4521-E) - custom industry roles
  if (toolId === '4521-E') {
    if (!customIndustry) {
      return {
        success: false,
        error: 'Missing customIndustry parameter for dynamic tool 4521-E',
      };
    }

    const generatedRoles = generateRolesForIndustry(customIndustry);
    const options = [...generatedRoles, 'Something else', "I'm not sure"].join('|');

    return {
      success: true,
      data: {
        stepId: '6138-E',
        toolId: '4521-E',
        componentType: 'MultiSelectOptions',
        options,
        badge: 'MOBEUS CAREER',
        title: 'Qualification',
        subtitle: 'Step 2 of 3',
        progress: { progressStep: 1, progressTotal: 3 },
        customIndustry, // Include for context
      },
    };
  }

  // Handle static tools
  const toolData = TOOL_DATA_MAP[toolId];
  
  if (!toolData) {
    return {
      success: false,
      error: `Unknown tool ID: ${toolId}`,
    };
  }

  return {
    success: true,
    data: toolData,
  };
}
