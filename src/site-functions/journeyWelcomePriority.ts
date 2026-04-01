import { navigationResponse } from './helpers';

export default function journeyWelcomePriority() {
  return navigationResponse({
    badge: 'MOBEUS CAREER',
    title: 'Priorities',
    subtitle: 'Step 3 of 3',
    generativeSubsections: [{
      id: 'welcome-priority',
      templateId: 'MultiSelectOptions',
      props: {
        bubbles: [
          { label: 'Searching and browsing listings' },
          { label: 'Experience and personality fit' },
          { label: 'Location' },
          { label: 'Know which skills are required' },
          { label: 'Take courses and earn certifications' },
          { label: 'Something else' },
        ],
        showProgress: true,
        progressStep: 2,
        progressTotal: 3,
      },
    }],
  });
}
