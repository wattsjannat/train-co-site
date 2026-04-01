/**
 * Helper utilities for site functions
 */

export interface NavigatePayload {
  badge: string;
  title: string;
  subtitle: string;
  generativeSubsections: Array<{
    id: string;
    templateId: string;
    props: Record<string, any>;
  }>;
}

/**
 * Calls the Mobeus navigateToSection function with the given payload
 */
export function callNavigateToSection(payload: NavigatePayload): void {
  const nav = (window as any).UIFrameworkSiteFunctions?.navigateToSection;
  if (typeof nav === 'function') {
    nav(payload.badge, payload.title, payload.subtitle, payload.generativeSubsections);
  } else {
    console.warn('[Site Functions] navigateToSection not available on UIFrameworkSiteFunctions');
  }
}

/**
 * Standard success response for site functions that navigate
 */
export function navigationResponse(payload: NavigatePayload) {
  callNavigateToSection(payload);
  return { success: true, payload };
}
