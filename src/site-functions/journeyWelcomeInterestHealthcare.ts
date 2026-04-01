import { optionsResponse, textInputResponse } from './helpers';

export default function journeyWelcomeInterestHealthcare() {
    return optionsResponse([
    "Caring for people directly",
    "Analysing patient data",
    "Managing healthcare operations",
    "Developing new treatments",
    "Leading medical teams",
    "Something else",
    "I"
  ]);
}
