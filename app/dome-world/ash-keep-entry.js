const PUBLIC_ROUTE = globalThis.document?.documentElement?.dataset?.ashPublicRoute || '/dome-world/ash-keep.html';
const READINESS_KEY = 'td613:ash-threshold:readiness:v0.1';

export const ASH_KEEP_ENTRY_VERSION = 'td613.ash-keep.entry/v0.2-canonical-redirect';

export function canonicalKeepRoute(storage = globalThis.sessionStorage) {
  return `${PUBLIC_ROUTE}${storage?.getItem?.(READINESS_KEY) ? '?arrival=cleared' : ''}`;
}

export function governDocument(source = '') {
  const html = String(source || '');
  if (!html.includes('ash-constitutional-composition')) throw new Error('Canonical Keep composition marker is missing.');
  if (!html.includes('/dome-world/ash-convergence.js')) throw new Error('Canonical convergence runtime is missing.');
  return html;
}

export function governCore(source = '') {
  const code = String(source || '');
  if (!code.includes('caseMapDigest: state.caseMap.case_map_digest')) throw new Error('Canonical Draft binding is missing.');
  if (code.includes('location.reload()')) throw new Error('Canonical core contains a forced reload.');
  return code;
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  document.documentElement.dataset.ashDeliveryState = 'canonical-redirect';
  window.location.replace(canonicalKeepRoute());
}
