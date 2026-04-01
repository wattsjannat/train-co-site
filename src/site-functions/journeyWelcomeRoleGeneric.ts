import { navigationResponse } from './helpers';

export default function journeyWelcomeRoleGeneric() {
  return navigationResponse({
    badge: 'MOBEUS CAREER',
    title: 'Qualification',
    subtitle: 'Step 2 of 3',
    generativeSubsections: [{
      id: 'welcome-role-generic',
      templateId: 'MultiSelectOptions',
      props: {
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
      },
    }],
  });
}
