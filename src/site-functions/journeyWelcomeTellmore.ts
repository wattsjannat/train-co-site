import { optionsResponse, textInputResponse } from './helpers';

/**
 * Journey-welcome-tellmore — Tell me more about TrAIn
 * Step ID: 3847-B | Tool ID: 2194-B
 */
export default function journeyWelcomeTellmore() {
    return optionsResponse([
    "How does TrAIn work?",
    "How is TrAIn different?",
    "Can I build skills on TrAIn?",
    "Which jobs can I find on TrAIn?",
    "How does TrAIn use my data?",
    "Something else"
  ]);
}
