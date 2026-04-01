/**
 * Journey-welcome-role-healthcare — Healthcare roles
 * Step ID: 6138-C | Tool ID: 4521-C
 */
export default function journeyWelcomeRoleHealthcare() {
  return {
    success: true,
    stepId: '6138-C',
    toolId: '4521-C',
    componentType: 'MultiSelectOptions',
    options: "Clinical (Doctor/Nurse)|Health Administration|Pharmacy|Medical Devices|Something else|I'm not sure",
    badge: 'MOBEUS CAREER',
    title: 'Qualification',
    subtitle: 'Step 2 of 3',
    progress: { progressStep: 1, progressTotal: 3 },
  };
}
