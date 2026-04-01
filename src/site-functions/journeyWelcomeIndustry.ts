import { optionsResponse } from './helpers';

/**
 * Journey-welcome-industry — Industry selection
 * Step ID: 5921-A | Tool ID: 7483-A
 */
export default function journeyWelcomeIndustry() {
  return optionsResponse([
    'Technology',
    'Finance',
    'Healthcare',
    'Construction',
    'Something else',
    "I'm not sure"
  ]);
}
