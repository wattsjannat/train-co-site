import { navigationResponse } from './helpers';

export default function journeyWelcomeRoleCustomInput() {
  return navigationResponse({
    badge: 'MOBEUS CAREER',
    title: 'Qualification',
    subtitle: 'Step 2 of 3',
    generativeSubsections: [{
      id: 'welcome-role-custom-input',
      templateId: 'TextInput',
      props: {
        placeholder: 'Type role',
      },
    }],
  });
}
