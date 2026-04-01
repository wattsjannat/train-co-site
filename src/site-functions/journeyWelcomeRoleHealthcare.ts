import { optionsResponse, textInputResponse } from './helpers';

export default function journeyWelcomeRoleHealthcare() {
    return optionsResponse([
    "Clinical (Doctor/Nurse)",
    "Health Administration",
    "Pharmacy",
    "Medical Devices",
    "Something else",
    "I"
  ]);
}
