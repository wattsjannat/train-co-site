import { optionsResponse, textInputResponse } from './helpers';

export default function journeyWelcomeRoleConstruction() {
    return optionsResponse([
    "Civil & Structural Engineering",
    "Architecture",
    "Project Management",
    "MEP Engineering",
    "Something else",
    "I"
  ]);
}
