import { uiResponse } from './helpers';

export default function journeyWelcomeRoleGeneric() {
  return uiResponse({
    badge: 'MOBEUS CAREER',
    title: 'Qualification',
    subtitle: 'Step 2 of 3',
    type: 'MultiSelectOptions',
    bubbles: [
          { label: 'Leadership & Strategy' },
          { label: 'Marketing & Communications' },
          { label: 'Human Resources' },
          { label: 'Operations & Logistics' },
          { label: 'Something else' },
          { label: "I'm not sure" },
        ],
        showProgress: true,
        progressStep: 1,
        progressTotal: 3,
  });
}
