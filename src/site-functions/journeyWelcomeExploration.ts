import { optionsResponse, textInputResponse } from './helpers';

/**
 * Journey-welcome-exploration — Exploration path for unsure users
 * Step ID: 5921-C | Tool ID: 7483-C
 */
export default function journeyWelcomeExploration() {
    return optionsResponse([
    "Solving a puzzle or problem",
    "Creating something from scratch",
    "Helping someone through a tough moment",
    "Organising chaos into order",
    "Learning something completely new",
    "Leading a group"
  ]);
}
