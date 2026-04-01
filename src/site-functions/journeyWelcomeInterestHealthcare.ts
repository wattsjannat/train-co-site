import { uiResponse } from './helpers';

export default function journeyWelcomeInterestHealthcare() {
  return uiResponse({
    badge: 'MOBEUS CAREER',
    title: 'Role Exploration',
    subtitle: 'What interests you?',
    type: 'MultiSelectOptions',
    bubbles: [
          { label: 'Caring for people directly' },
          { label: 'Analysing patient data' },
          { label: 'Managing healthcare operations' },
          { label: 'Developing new treatments' },
          { label: 'Leading medical teams' },
          { label: 'Something else' },
          { label: "I'm not sure" },
        ]
  });
}
