import { navigationResponse } from './helpers';

/**
 * Journey-welcome-role-custom-industry — Dynamic roles for custom industry
 * Step ID: 6138-E | Tool ID: 4521-E
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
};

function generateRolesForIndustry(industry: string): string[] {
  const normalizedIndustry = industry.toLowerCase().trim();
  
  for (const [key, roles] of Object.entries(INDUSTRY_ROLE_MAP)) {
    if (normalizedIndustry.includes(key) || key.includes(normalizedIndustry)) {
      return roles;
    }
  }
  
  const industryName = industry.charAt(0).toUpperCase() + industry.slice(1);
  return [
    `${industryName} Specialist`,
    `${industryName} Management`,
    `${industryName} Consulting`,
    `${industryName} Operations`,
  ];
}

export default function journeyWelcomeRoleCustomIndustry(args: { customIndustry: string }) {
  const { customIndustry } = args;
  
  if (!customIndustry) {
    return {
      success: false,
      error: 'Missing customIndustry parameter',
    };
  }

  const generatedRoles = generateRolesForIndustry(customIndustry);

  return navigationResponse({
    badge: 'MOBEUS CAREER',
    title: 'Qualification',
    subtitle: 'Step 2 of 3',
    generativeSubsections: [{
      id: 'welcome-role-custom-industry',
      templateId: 'MultiSelectOptions',
      props: {
        bubbles: [
          ...generatedRoles.map(role => ({ label: role })),
          { label: 'Something else' },
          { label: "I'm not sure" },
        ],
        showProgress: true,
        progressStep: 1,
        progressTotal: 3,
      },
    }],
  });
}
