import { uiResponse } from './helpers';

export default function journeyWelcomeRoleTechnology() {
  return uiResponse({
    badge: 'MOBEUS CAREER',
    title: 'Qualification',
    subtitle: 'Step 2 of 3',
    type: 'MultiSelectOptions',
    bubbles: [
      { label: 'Cybersecurity' },
      { label: 'Artificial Intelligence' },
      { label: 'Digital Transformation' },
      { label: 'Data Science' },
      { label: 'Something else' },
      { label: "I'm not sure" },
    ],
    showProgress: true,
    progressStep: 1,
    progressTotal: 3,
  });
}
