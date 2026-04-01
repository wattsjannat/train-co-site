import { navigationResponse } from './helpers';

export default function journeyWelcomeInterestHealthcare() {
  return navigationResponse({
    badge: 'MOBEUS CAREER',
    title: 'Role Exploration',
    subtitle: 'What interests you?',
    generativeSubsections: [{
      id: 'welcome-interest-healthcare',
      templateId: 'MultiSelectOptions',
      props: {
        bubbles: [
          { label: 'Caring for people directly' },
          { label: 'Analysing patient data' },
          { label: 'Managing healthcare operations' },
          { label: 'Developing new treatments' },
          { label: 'Leading medical teams' },
          { label: 'Something else' },
          { label: "I'm not sure" },
        ],
      },
    }],
  });
}
