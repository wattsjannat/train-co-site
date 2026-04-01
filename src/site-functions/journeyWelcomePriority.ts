/**
 * Journey-welcome-priority — Priority selection
 * Step ID: 8294-A | Tool ID: 1657-A
 */
export default function journeyWelcomePriority() {
  return {
    success: true,
    stepId: '8294-A',
    toolId: '1657-A',
    componentType: 'MultiSelectOptions',
    options: 'Searching and browsing listings|Experience and personality fit|Location|Know which skills are required|Take courses and earn certifications|Something else',
    badge: 'MOBEUS CAREER',
    title: 'Priorities',
    subtitle: 'Step 3 of 3',
    progress: { progressStep: 2, progressTotal: 3 },
  };
}
