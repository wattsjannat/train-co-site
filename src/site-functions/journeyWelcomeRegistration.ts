import { uiResponse } from './helpers';

export default function journeyWelcomeRegistration() {
  return uiResponse({
    badge: 'MOBEUS CAREER',
    title: 'Registration',
    subtitle: 'Create your account',
    type: 'RegistrationForm',
  });
}
