import { optionsResponse } from './helpers';

/**
 * Journey-welcome-greeting — Welcome screen with initial options
 * Step ID: 3847-A | Tool ID: 2194-A
 */
export default function journeyWelcomeGreeting() {
  return optionsResponse([
    "Yes, I'm ready",
    "Not just yet",
    "Tell me more"
  ]);
}
