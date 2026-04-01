import { uiResponse } from './helpers';

/**
 * Journey-welcome-greeting — Welcome screen with initial options
 * Step ID: 3847-A | Tool ID: 2194-A
 */
export default function journeyWelcomeGreeting() {
  return uiResponse({
    badge: 'MOBEUS CAREER',
    title: 'Welcome',
    subtitle: 'Getting started',
    type: 'GlassmorphicOptions',
    bubbles: [
      { label: "Yes, I'm ready" },
      { label: "Not just yet" },
      { label: "Tell me more" },
    ],
  });
}
