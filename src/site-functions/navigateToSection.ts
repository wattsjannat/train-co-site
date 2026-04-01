/**
 * navigateToSection - Proxy site function that calls the real UIFrameworkSiteFunctions.navigateToSection
 * 
 * This exists because Mobeus routes navigateToSection calls through site functions,
 * but the actual implementation is on UIFrameworkSiteFunctions (patched by usePhaseFlow).
 */
export default function navigateToSection(args: {
  badge: string;
  title: string;
  subtitle: string;
  generativeSubsections: Array<{
    id: string;
    templateId: string;
    props: Record<string, any>;
  }>;
}) {
  const { badge, title, subtitle, generativeSubsections } = args;
  
  // Call the real navigateToSection on UIFrameworkSiteFunctions
  const nav = (window as any).UIFrameworkSiteFunctions?.navigateToSection;
  
  if (typeof nav === 'function') {
    const result = nav(badge, title, subtitle, generativeSubsections);
    return { success: true, result };
  } else {
    console.error('[navigateToSection site function] UIFrameworkSiteFunctions.navigateToSection not available');
    return { 
      success: false, 
      error: 'navigateToSection not available on UIFrameworkSiteFunctions' 
    };
  }
}
