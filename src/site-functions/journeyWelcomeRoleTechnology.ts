import { optionsResponse, textInputResponse } from './helpers';

export default function journeyWelcomeRoleTechnology() {
    return optionsResponse([
    "Cybersecurity",
    "Artificial Intelligence",
    "Digital Transformation",
    "Data Science",
    "Something else",
    "I"
  ]);
}
