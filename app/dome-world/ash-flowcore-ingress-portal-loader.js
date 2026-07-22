export const ASH_FLOWCORE_INGRESS_PORTAL_LOADER_VERSION = 'td613.ash.flowcore-ingress-portal-loader/v0.1-legacy-bypass';

const host = globalThis.window;
const doc = globalThis.document;
const params = new URLSearchParams(host?.location?.search || '');
const legacy = params.get('presentation') === 'legacy';

if (doc?.documentElement) {
  doc.documentElement.dataset.ashFlowcorePortalLoader = ASH_FLOWCORE_INGRESS_PORTAL_LOADER_VERSION;
  doc.documentElement.dataset.ashFlowcorePortalEligible = String(!legacy);
}

if (legacy) {
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
      doc.documentElement.dataset.ashFlowcorePortalLoaderHold = error.message;
    });
}
