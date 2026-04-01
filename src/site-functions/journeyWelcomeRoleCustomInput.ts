import { uiResponse } from './helpers';

export default function journeyWelcomeRoleCustomInput() {
  return uiResponse({
    badge: 'MOBEUS CAREER',
    title: 'Qualification',
    subtitle: 'Step 2 of 3',
    type: 'TextInput',
    placeholder: 'Type role',
  });
}
