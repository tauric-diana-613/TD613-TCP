export const ASH_FLOWCORE_INGRESS_PORTAL_LOADER_VERSION = 'td613.ash.flowcore-ingress-portal-loader/v0.2-browser-aia-gate';

const host = globalThis.window;
const doc = globalThis.document;
const browser = Boolean(host && doc?.documentElement);
const params = new URLSearchParams(host?.location?.search || '');
const legacy = params.get('presentation') === 'legacy';
const eligible = browser && !legacy;

if (doc?.documentElement) {
  doc.documentElement.dataset.ashFlowcorePortalLoader = ASH_FLOWCORE_INGRESS_PORTAL_LOADER_VERSION;
  doc.documentElement.dataset.ashFlowcorePortalEligible = String(eligible);
}

if (!browser) {
  // Node, SSR, and static contract imports intentionally stop here: no dynamic portal import, DOM mutation, or error emission.
} else if (legacy) {
  host.__td613AshFlowcoreIngressPortalLoader = Object.freeze({
    version:ASH_FLOWCORE_INGRESS_PORTAL_LOADER_VERSION,
    eligible:false,
    reason:'EXPLICIT_LEGACY_PRESENTATION'
  });
} else {
  import('./ash-flowcore-ingress-portal.js?v=20260721-flowcore-live-field-v2')
    .then(module => {
      host.__td613AshFlowcoreIngressPortalLoader = Object.freeze({
        version:ASH_FLOWCORE_INGRESS_PORTAL_LOADER_VERSION,
        eligible:true,
        portal_version:module.ASH_FLOWCORE_INGRESS_PORTAL_VERSION
      });
      host.dispatchEvent(new CustomEvent('td613:ash:flowcore-portal-loader-ready', {
        detail:host.__td613AshFlowcoreIngressPortalLoader
      }));
    })
    .catch(error => {
      console.error('Ash Flow-Core ingress portal held:', error);
      if (doc?.documentElement) doc.documentElement.dataset.ashFlowcorePortalLoaderHold = error.message;
    });
}
