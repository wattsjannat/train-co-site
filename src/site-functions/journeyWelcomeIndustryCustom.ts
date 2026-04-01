import { uiResponse } from './helpers';

/**
 * Journey-welcome-industry-custom — Custom industry text input
 * Step ID: 5921-B | Tool ID: 7483-B
 */
export default function journeyWelcomeIndustryCustom() {
  return uiResponse({
    badge: 'MOBEUS CAREER',
    title: 'Qualification',
    subtitle: 'Step 1 of 3',
    type: 'TextInput',
    placeholder: 'Type industry',
  });
}
