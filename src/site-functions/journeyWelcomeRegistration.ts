import { navigationResponse } from './helpers';

export default function journeyWelcomeRegistration() {
  return navigationResponse({
    badge: 'MOBEUS CAREER',
    title: 'Registration',
    subtitle: 'Create your account',
    generativeSubsections: [{
      id: 'welcome-registration',
      templateId: 'RegistrationForm',
      props: {},
    }],
  });
}
