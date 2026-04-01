/**
 * Helper utilities for site functions - Mobeus 2.0 Format
 */

export interface BubbleOption {
  label: string;
  value?: string;
  variant?: 'default' | 'green';
  showArrow?: boolean;
}

/**
 * Standard response for site functions that return UI data.
 * Returns structured data that Show LLM can render directly.
 */
export function uiResponse(data: {
  badge: string;
  title: string;
  subtitle: string;
  type: 'GlassmorphicOptions' | 'MultiSelectOptions' | 'TextInput' | 'RegistrationForm';
  bubbles?: BubbleOption[];
  placeholder?: string;
  showProgress?: boolean;
  progressStep?: number;
  progressTotal?: number;
}) {
  return {
    success: true,
    ...data
  };
}
