import { navigationResponse } from './helpers';

export default function journeyWelcomePriorityCustom() {
  return navigationResponse({
    badge: 'MOBEUS CAREER',
    title: 'Priorities',
    subtitle: 'Step 3 of 3',
    generativeSubsections: [{
      id: 'welcome-priority-custom',
      templateId: 'TextInput',
      props: {
        placeholder: 'Type what matters most',
      },
    }],
  });
}
