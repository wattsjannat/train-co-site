/**
 * Early Site Functions Registration
 * This file is loaded directly in the HTML to ensure site functions are available
 * BEFORE the Mobeus SDK tries to call them.
 */

console.log('[Site Functions] Early registration starting...');

// Ensure the global object exists
if (typeof window !== 'undefined') {
  window.__siteFunctions = window.__siteFunctions || {};
  
  // Register navigateToSection proxy immediately
  window.__siteFunctions.navigateToSection = function(args) {
    console.log('[navigateToSection proxy] Called with args:', args);
    
    const { badge, title, subtitle, generativeSubsections } = args;
    
    // Call the real SDK function
    const nav = window.UIFrameworkSiteFunctions?.navigateToSection;
    
    if (typeof nav === 'function') {
      console.log('[navigateToSection proxy] Calling real SDK function');
      const result = nav(badge, title, subtitle, generativeSubsections);
      return { success: true, result };
    } else {
      console.error('[navigateToSection proxy] UIFrameworkSiteFunctions.navigateToSection not available yet');
      return { 
        success: false, 
        error: 'navigateToSection not available on UIFrameworkSiteFunctions' 
      };
    }
  };
  
  console.log('[Site Functions] navigateToSection proxy registered early');
}
