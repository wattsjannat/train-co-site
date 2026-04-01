/**
 * Journey-welcome-industry — Industry selection
 * Step ID: 5921-A | Tool ID: 7483-A
 */
export default function journeyWelcomeIndustry() {
  return {
    success: true,
    stepId: '5921-A',
    toolId: '7483-A',
    componentType: 'MultiSelectOptions',
    options: "Technology|Finance|Healthcare|Construction|Something else|I'm not sure",
    badge: 'MOBEUS CAREER',
    title: 'Qualification',
    subtitle: 'Step 1 of 3',
    progress: { progressStep: 0, progressTotal: 3 },
  };
}
