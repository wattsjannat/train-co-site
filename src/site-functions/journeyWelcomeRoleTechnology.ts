/**
 * Journey-welcome-role-technology — Technology roles
 * Step ID: 6138-A | Tool ID: 4521-A
 */
export default function journeyWelcomeRoleTechnology() {
  return {
    success: true,
    badge: 'MOBEUS CAREER',
    title: 'Qualification',
    subtitle: 'Step 2 of 3',
    generativeSubsections: [
      {
        id: 'welcome-role-technology',
        templateId: 'MultiSelectOptions',
        props: {
          bubbles: [
            { label: 'Cybersecurity' },
            { label: 'Artificial Intelligence' },
            { label: 'Digital Transformation' },
            { label: 'Data Science' },
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
