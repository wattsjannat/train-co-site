/**
 * Early Site Functions Registration
 * This file is loaded directly in the HTML to ensure site functions are available
 * BEFORE the Mobeus SDK tries to call them.
 */

console.log('[Site Functions] Early registration starting...');

// Ensure the global object exists
if (typeof window !== 'undefined') {
  window.__siteFunctions = window.__siteFunctions || {};
  
  // Queue for pending navigateToSection calls (in case React hasn't mounted yet)
  const pendingCalls = [];
  let isReactReady = false;
  
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
      console.warn('[navigateToSection proxy] UIFrameworkSiteFunctions.navigateToSection not ready yet - queueing call');
      
      // Queue the call for when React mounts
      pendingCalls.push({ badge, title, subtitle, generativeSubsections });
      
      // Check every 100ms for up to 5 seconds
      let attempts = 0;
      const checkInterval = setInterval(() => {
        attempts++;
        const navNow = window.UIFrameworkSiteFunctions?.navigateToSection;
        
        if (typeof navNow === 'function') {
          console.log('[navigateToSection proxy] React ready - executing queued call');
          clearInterval(checkInterval);
          navNow(badge, title, subtitle, generativeSubsections);
          isReactReady = true;
        } else if (attempts >= 50) {
          console.error('[navigateToSection proxy] Timeout waiting for React - call lost');
          clearInterval(checkInterval);
        }
      }, 100);
      
      return { 
        success: true, 
        queued: true,
        message: 'Call queued - waiting for React to mount'
      };
    }
  };
  
  console.log('[Site Functions] navigateToSection proxy registered early');
}
