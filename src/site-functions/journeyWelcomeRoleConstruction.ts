import { uiResponse } from './helpers';

export default function journeyWelcomeRoleConstruction() {
  return uiResponse({
    badge: 'MOBEUS CAREER',
    title: 'Qualification',
    subtitle: 'Step 2 of 3',
    type: 'MultiSelectOptions',
    bubbles: [
          { label: 'Civil & Structural Engineering' },
          { label: 'Architecture' },
          { label: 'Project Management' },
          { label: 'MEP Engineering' },
          { label: 'Something else' },
          { label: "I'm not sure" },
        ],
        showProgress: true,
        progressStep: 1,
        progressTotal: 3,
  });
}
