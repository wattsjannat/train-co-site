/**
 * Journey-welcome-registration — Registration form
 * Step ID: 2916-A | Tool ID: 9183-A
 */
export default function journeyWelcomeRegistration() {
  return {
    success: true,
    badge: 'MOBEUS CAREER',
    title: 'Registration',
    subtitle: 'Create your account',
    generativeSubsections: [
      {
        id: 'welcome-registration',
        templateId: 'RegistrationForm',
        props: {},
      },
    ],
  };
}
