import { navigationResponse } from './helpers';

/**
 * Journey-welcome-industry — Industry selection
 * Step ID: 5921-A | Tool ID: 7483-A
 */
export default function journeyWelcomeIndustry() {
  return navigationResponse({
    badge: 'MOBEUS CAREER',
    title: 'Qualification',
    subtitle: 'Step 1 of 3',
    generativeSubsections: [
      {
        id: 'welcome-industry',
        templateId: 'MultiSelectOptions',
        props: {
          bubbles: [
            { label: 'Technology' },
            { label: 'Finance' },
            { label: 'Healthcare' },
            { label: 'Construction' },
            { label: 'Something else' },
            { label: "I'm not sure" },
          ],
          showProgress: true,
          progressStep: 0,
          progressTotal: 3,
        },
      },
    ],
  });
}
