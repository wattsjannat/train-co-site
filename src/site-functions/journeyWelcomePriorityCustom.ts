import { uiResponse } from './helpers';

export default function journeyWelcomePriorityCustom() {
  return uiResponse({
    badge: 'MOBEUS CAREER',
    title: 'Priorities',
    subtitle: 'Step 3 of 3',
    type: 'TextInput',
    placeholder: 'Type what matters most',
  });
}
