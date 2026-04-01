import { uiResponse } from './helpers';

export default function journeyWelcomeInterestConstruction() {
  return uiResponse({
    badge: 'MOBEUS CAREER',
    title: 'Role Exploration',
    subtitle: 'What interests you?',
    type: 'MultiSelectOptions',
    bubbles: [
          { label: 'Designing structures and spaces' },
          { label: 'Managing complex projects' },
          { label: 'Solving engineering challenges' },
          { label: 'Coordinating large teams' },
          { label: 'Working with innovative materials' },
          { label: 'Something else' },
          { label: "I'm not sure" },
        ]
  });
}
