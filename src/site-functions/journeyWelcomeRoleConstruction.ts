import { navigationResponse } from './helpers';

export default function journeyWelcomeRoleConstruction() {
  return navigationResponse({
    badge: 'MOBEUS CAREER',
    title: 'Qualification',
    subtitle: 'Step 2 of 3',
    generativeSubsections: [{
      id: 'welcome-role-construction',
      templateId: 'MultiSelectOptions',
      props: {
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
      },
    }],
  });
}
