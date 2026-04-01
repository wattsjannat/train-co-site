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
 * Standard success response for site functions that return navigation data.
 * The agent should call navigateToSection with this payload.
 */
export function navigationResponse(payload: NavigatePayload) {
  return { 
    success: true, 
    ...payload  // Return badge, title, subtitle, generativeSubsections directly
  };
}
