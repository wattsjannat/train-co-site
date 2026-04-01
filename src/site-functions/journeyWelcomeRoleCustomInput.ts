/**
 * Journey-welcome-role-custom-input — Custom role text input
 * Step ID: 6138-G | Tool ID: 4521-G
 */
export default function journeyWelcomeRoleCustomInput() {
  return {
    success: true,
    badge: 'MOBEUS CAREER',
    title: 'Qualification',
    subtitle: 'Step 2 of 3',
    generativeSubsections: [
      {
        id: 'welcome-role-custom-input',
        templateId: 'TextInput',
        props: {
          placeholder: 'Type role',
        },
      },
    ],
  };
}
