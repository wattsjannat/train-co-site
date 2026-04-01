import { optionsResponse, textInputResponse } from './helpers';

export default function journeyWelcomeRoleGeneric() {
    return optionsResponse([
    "Leadership & Strategy",
    "Marketing & Communications",
    "Human Resources",
    "Operations & Logistics",
    "Something else",
    "I"
  ]);
}
