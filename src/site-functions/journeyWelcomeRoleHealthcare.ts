/**
 * Journey-welcome-role-healthcare — Healthcare roles
 * Step ID: 6138-C | Tool ID: 4521-C
 */
export default function journeyWelcomeRoleHealthcare() {
  return {
    success: true,
    badge: 'MOBEUS CAREER',
    title: 'Qualification',
    subtitle: 'Step 2 of 3',
    generativeSubsections: [
      {
        id: 'welcome-role-healthcare',
        templateId: 'MultiSelectOptions',
        props: {
          bubbles: [
            { label: 'Clinical (Doctor/Nurse)' },
            { label: 'Health Administration' },
            { label: 'Pharmacy' },
            { label: 'Medical Devices' },
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
