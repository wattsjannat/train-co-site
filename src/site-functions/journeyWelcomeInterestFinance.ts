import { navigationResponse } from './helpers';

export default function journeyWelcomeInterestFinance() {
  return navigationResponse({
    badge: 'MOBEUS CAREER',
    title: 'Role Exploration',
    subtitle: 'What interests you?',
    generativeSubsections: [{
      id: 'welcome-interest-finance',
      templateId: 'MultiSelectOptions',
      props: {
        bubbles: [
          { label: 'Managing and analysing data' },
          { label: 'Identifying risks and mitigations' },
          { label: 'Building client relationships' },
          { label: 'Strategising investments' },
          { label: 'Leading financial teams' },
          { label: 'Something else' },
          { label: "I'm not sure" },
        ],
      },
    }],
  });
}
