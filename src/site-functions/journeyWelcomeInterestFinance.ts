/**
 * Journey-welcome-interest-finance — Finance interests
 * Step ID: 6138-I | Tool ID: 4521-I
 */
export default function journeyWelcomeInterestFinance() {
  return {
    success: true,
    badge: 'MOBEUS CAREER',
    title: 'Role Exploration',
    subtitle: 'What interests you?',
    generativeSubsections: [
      {
        id: 'welcome-interest-finance',
        templateId: 'MultiSelectOptions',
        props: {
          bubbles: [
            { label: 'Managing and analysing data' },
            { label: 'Identifying risks and mitigations' },
            { label: 'Building client relationships' },
            { label: 'Strategising investments' },
            { label: 'Leading financial teams' },
            { label: 'Something else' },
            { label: "I'm not sure" },
          ],
        },
      },
    ],
  };
}
