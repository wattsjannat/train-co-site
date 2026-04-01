import { navigationResponse } from './helpers';

export default function journeyWelcomeInterestTechnology() {
  return navigationResponse({
    badge: 'MOBEUS CAREER',
    title: 'Role Exploration',
    subtitle: 'What interests you?',
    generativeSubsections: [{
      id: 'welcome-interest-technology',
      templateId: 'MultiSelectOptions',
      props: {
        bubbles: [
          { label: 'Solving complex logic puzzles' },
          { label: 'Finding patterns in data' },
          { label: 'Leading teams to launch products' },
          { label: 'Designing easy to use interfaces' },
          { label: 'Leading teams towards a goal' },
          { label: 'Something else' },
          { label: "I'm not sure" },
        ],
      },
    }],
  });
}
