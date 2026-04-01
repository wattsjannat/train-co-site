/**
 * Journey-welcome-role-construction — Construction roles
 * Step ID: 6138-D | Tool ID: 4521-D
 */
export default function journeyWelcomeRoleConstruction() {
  return {
    success: true,
    badge: 'MOBEUS CAREER',
    title: 'Qualification',
    subtitle: 'Step 2 of 3',
    generativeSubsections: [
      {
        id: 'welcome-role-construction',
        templateId: 'MultiSelectOptions',
        props: {
          bubbles: [
            { label: 'Civil & Structural Engineering' },
            { label: 'Architecture' },
            { label: 'Project Management' },
            { label: 'MEP Engineering' },
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
