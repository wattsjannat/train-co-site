import { navigationResponse } from './helpers';

export default function journeyWelcomeInterestConstruction() {
  return navigationResponse({
    badge: 'MOBEUS CAREER',
    title: 'Role Exploration',
    subtitle: 'What interests you?',
    generativeSubsections: [{
      id: 'welcome-interest-construction',
      templateId: 'MultiSelectOptions',
      props: {
        bubbles: [
          { label: 'Designing structures and spaces' },
          { label: 'Managing complex projects' },
          { label: 'Solving engineering challenges' },
          { label: 'Coordinating large teams' },
          { label: 'Working with innovative materials' },
          { label: 'Something else' },
          { label: "I'm not sure" },
        ],
      },
    }],
  });
}
