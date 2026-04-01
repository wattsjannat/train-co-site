/**
 * Journey-welcome-role-finance — Finance roles
 * Step ID: 6138-B | Tool ID: 4521-B
 */
export default function journeyWelcomeRoleFinance() {
  return {
    success: true,
    badge: 'MOBEUS CAREER',
    title: 'Qualification',
    subtitle: 'Step 2 of 3',
    generativeSubsections: [
      {
        id: 'welcome-role-finance',
        templateId: 'MultiSelectOptions',
        props: {
          bubbles: [
            { label: 'Investment & Banking' },
            { label: 'Accounting & Audit' },
            { label: 'Risk & Compliance' },
            { label: 'Financial Planning' },
            { label: 'Something else' },
            { label: "I'm not sure" },
          ],
          showProgress: true,
          progressStep: 1,
          progressTotal: 3,
        },
      },
    ],
  };
}
