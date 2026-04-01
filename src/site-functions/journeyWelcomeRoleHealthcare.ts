import { uiResponse } from './helpers';

export default function journeyWelcomeRoleHealthcare() {
  return uiResponse({
    badge: 'MOBEUS CAREER',
    title: 'Qualification',
    subtitle: 'Step 2 of 3',
    type: 'MultiSelectOptions',
    bubbles: [
          { label: 'Clinical (Doctor/Nurse)' },
          { label: 'Health Administration' },
          { label: 'Pharmacy' },
          { label: 'Medical Devices' },
          { label: 'Something else' },
          { label: "I'm not sure" },
        ],
        showProgress: true,
        progressStep: 1,
        progressTotal: 3,
  });
}
