import { uiResponse } from './helpers';

export default function journeyWelcomeInterestTechnology() {
  return uiResponse({
    badge: 'MOBEUS CAREER',
    title: 'Role Exploration',
    subtitle: 'What interests you?',
    type: 'MultiSelectOptions',
    bubbles: [
          { label: 'Solving complex logic puzzles' },
          { label: 'Finding patterns in data' },
          { label: 'Leading teams to launch products' },
          { label: 'Designing easy to use interfaces' },
          { label: 'Leading teams towards a goal' },
          { label: 'Something else' },
          { label: "I'm not sure" },
        ]
  });
}
