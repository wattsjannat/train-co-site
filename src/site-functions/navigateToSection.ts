/**
 * navigateToSection - Bridge function for Mobeus internal calls
 * 
 * Mobeus internally tries to call this as a site function.
 * This function receives the data and triggers the actual SDK navigateToSection.
 */
export default function navigateToSection(args: any) {
  console.log('[navigateToSection site function] Called with args:', args);
  
  // Extract the data
  const { badge, title, subtitle, generativeSubsections } = args;
  
  // Call the real SDK function
  const sdkNav = (window as any).UIFrameworkSiteFunctions?.navigateToSection;
  
  if (typeof sdkNav === 'function') {
    console.log('[navigateToSection site function] Calling SDK navigateToSection');
    const result = sdkNav(badge, title, subtitle, generativeSubsections);
    return { success: true, result };
  } else {
    console.error('[navigateToSection site function] SDK navigateToSection not available yet');
    return { success: false, error: 'SDK not ready' };
  }
}
