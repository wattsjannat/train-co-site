/**
 * Helper utilities for site functions - Mobeus 2.0 Format
 * Returns pipe-delimited strings for Mobeus to parse
 */

/**
 * Standard response for site functions that return options as pipe-delimited strings.
 * Mobeus 2.0 expects this format for the Show LLM to parse.
 */
export function optionsResponse(options: string[]) {
  return {
    success: true,
    options: options.join('|')
  };
}

/**
 * Response for text input fields
 */
export function textInputResponse(placeholder: string) {
  return {
    success: true,
    placeholder
  };
}
