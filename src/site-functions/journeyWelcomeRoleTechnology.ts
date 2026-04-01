import { navigationResponse } from './helpers';

export default function journeyWelcomeRoleTechnology() {
  return navigationResponse({
    badge: 'MOBEUS CAREER',
    title: 'Qualification',
    subtitle: 'Step 2 of 3',
    generativeSubsections: [{
      id: 'welcome-role-technology',
      templateId: 'MultiSelectOptions',
      props: {
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
      },
    }],
  });
}
