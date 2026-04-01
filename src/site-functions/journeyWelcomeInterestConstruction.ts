/**
 * Journey-welcome-interest-construction — Construction interests
 * Step ID: 6138-K | Tool ID: 4521-K
 */
export default function journeyWelcomeInterestConstruction() {
  return {
    success: true,
    badge: 'MOBEUS CAREER',
    title: 'Role Exploration',
    subtitle: 'What interests you?',
    generativeSubsections: [
      {
        id: 'welcome-interest-construction',
        templateId: 'MultiSelectOptions',
        props: {
          bubbles: [
            { label: 'Designing structures and spaces' },
            { label: 'Managing complex projects' },
            { label: 'Solving engineering challenges' },
            { label: 'Coordinating large teams' },
            { label: 'Working with innovative materials' },
            { label: 'Something else' },
            { label: "I'm not sure" },
          ],
        },
      },
    ],
  };
}
