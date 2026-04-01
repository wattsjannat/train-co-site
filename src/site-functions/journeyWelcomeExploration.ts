/**
 * Journey-welcome-exploration — Exploration path for unsure users
 * Step ID: 5921-C | Tool ID: 7483-C
 */
export default function journeyWelcomeExploration() {
  return {
    success: true,
    badge: 'MOBEUS CAREER',
    title: 'Exploration',
    subtitle: 'Tell us what you enjoy',
    generativeSubsections: [
      {
        id: 'welcome-exploration',
        templateId: 'MultiSelectOptions',
        props: {
          bubbles: [
            { label: 'Solving a puzzle or problem' },
            { label: 'Creating something from scratch' },
            { label: 'Helping someone through a tough moment' },
            { label: 'Organising chaos into order' },
            { label: 'Learning something completely new' },
            { label: 'Leading a group' },
          ],
        },
      },
    ],
  };
}
