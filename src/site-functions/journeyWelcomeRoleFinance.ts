import { optionsResponse, textInputResponse } from './helpers';

export default function journeyWelcomeRoleFinance() {
    return optionsResponse([
    "Investment & Banking",
    "Accounting & Audit",
    "Risk & Compliance",
    "Financial Planning",
    "Something else",
    "I"
  ]);
}
