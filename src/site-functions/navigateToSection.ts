/**
 * Registered as window.__siteFunctions.navigateToSection (LiveKit callSiteFunction RPC).
 * Delegates to the live implementation installed by usePhaseFlow on
 * window.UIFrameworkSiteFunctions.navigateToSection once the talent UI is mounted.
 */

type NavigateImpl = (...args: unknown[]) => unknown;

export default function navigateToSection(args: unknown): ReturnType<NavigateImpl> {
  console.log('[navigateToSection STUB] Called with args:', args);
  console.log('[navigateToSection STUB] window.__siteFunctions keys:', Object.keys((window as any).__siteFunctions || {}));
  
  const impl = (
    window as unknown as { UIFrameworkSiteFunctions?: { navigateToSection?: NavigateImpl } }
  ).UIFrameworkSiteFunctions?.navigateToSection;

  console.log('[navigateToSection STUB] UIFrameworkSiteFunctions.navigateToSection exists?', typeof impl === 'function');

  if (typeof impl !== "function") {
    console.warn(
      "[navigateToSection STUB] No implementation yet — talent session (usePhaseFlow) not mounted.",
    );
    return false;
  }

  console.log('[navigateToSection STUB] Delegating to UIFrameworkSiteFunctions.navigateToSection');
  return impl(args);
}
