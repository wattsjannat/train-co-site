/**
 * Journey-welcome-priority-custom — Custom priority text input
 * Step ID: 8294-B | Tool ID: 1657-B
 */
export default function journeyWelcomePriorityCustom() {
  return {
    success: true,
    badge: 'MOBEUS CAREER',
    title: 'Priorities',
    subtitle: 'Step 3 of 3',
    generativeSubsections: [
      {
        id: 'welcome-priority-custom',
        templateId: 'TextInput',
        props: {
          placeholder: 'Type what matters most',
        },
      },
    ],
  };
}
