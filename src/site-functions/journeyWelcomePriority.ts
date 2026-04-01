import { optionsResponse, textInputResponse } from './helpers';

export default function journeyWelcomePriority() {
    return optionsResponse([
    "Searching and browsing listings",
    "Experience and personality fit",
    "Location",
    "Know which skills are required",
    "Take courses and earn certifications",
    "Something else"
  ]);
}
