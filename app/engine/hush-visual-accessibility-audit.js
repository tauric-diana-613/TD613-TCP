export const HUSH_VISUAL_ACCESSIBILITY_AUDIT_VERSION = 'phase-31';

const includes = (text = '', needle = '') => String(text).includes(needle);

export function auditHushVisualAccessibility(input = {}) {
  const css = String(input.cssText || '');
  const mobile = String(input.mobileCssText || '');
  const html = String(input.htmlText || '');
  const js = String(input.jsText || '');
  const checks = {
    reducedMotionReady: includes(css, 'prefers-reduced-motion') || includes(mobile, 'prefers-reduced-motion'),
    tapTargetsReady: includes(css, 'min-height:44px') || includes(mobile, 'min-height:44px') || includes(css, 'min-height: 44px') || includes(mobile, 'min-height: 44px'),
    horizontalOverflowGuard: includes(css, 'overflow-x:hidden') || includes(mobile, 'overflow-x:hidden'),
    personaStoryClamp: includes(css, '-webkit-line-clamp') || includes(mobile, '-webkit-line-clamp'),
    interactiveStatePresent: includes(css, 'button') || includes(mobile, 'button'),
    routeStateVisible: includes(html, 'hushReadinessDashboard') || includes(js, 'hushRouteState')
  };
  const missing = Object.entries(checks).filter(([, value]) => !value).map(([key]) => key);
  return { version: HUSH_VISUAL_ACCESSIBILITY_AUDIT_VERSION, checks, missing, passed: missing.length === 0 };
}

export function summarizeHushVisualAccessibilityAudit(result = {}) {
  return { version: result.version || HUSH_VISUAL_ACCESSIBILITY_AUDIT_VERSION, passed: result.passed === true, missing: Array.isArray(result.missing) ? result.missing : [] };
}
