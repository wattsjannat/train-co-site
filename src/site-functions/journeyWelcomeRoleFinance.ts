/**
 * Journey-welcome-role-finance — Finance roles
 * Step ID: 6138-B | Tool ID: 4521-B
 */
export default function journeyWelcomeRoleFinance() {
  return {
    success: true,
    stepId: '6138-B',
    toolId: '4521-B',
    componentType: 'MultiSelectOptions',
    options: "Investment & Banking|Accounting & Audit|Risk & Compliance|Financial Planning|Something else|I'm not sure",
    badge: 'MOBEUS CAREER',
    title: 'Qualification',
    subtitle: 'Step 2 of 3',
    progress: { progressStep: 1, progressTotal: 3 },
  };
}
