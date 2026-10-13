import coreHandler, {
  DOME_WORLD_SHELL_VERSION,
  MARROWLINE_LAB_ROUTE,
  ASH_THRESHOLD_ROUTE,
  ASH_LIFECYCLE_SHELL_CONTRACT,
  ASH_KEEP_SHELL_VERSION,
  ASH_KEEP_JS_SHELL_VERSION,
  ASH_CACHE_TRANSITION_CONTRACT,
  ASH_CANONICAL_MEMBRANE_EPOCH,
  injectMarrowlineLabButton,
  injectAshLifecycleEntry,
  injectAshKeepLifecycle as injectCoreAshKeepLifecycle,
  bindAshDraftsToCaseMap,
  renderDomeWorldShell
} from '../lib/dome-world-shell-core.js';

export {
  DOME_WORLD_SHELL_VERSION,
  MARROWLINE_LAB_ROUTE,
  ASH_THRESHOLD_ROUTE,
  ASH_LIFECYCLE_SHELL_CONTRACT,
  ASH_KEEP_SHELL_VERSION,
  ASH_KEEP_JS_SHELL_VERSION,
  ASH_CACHE_TRANSITION_CONTRACT,
  ASH_CANONICAL_MEMBRANE_EPOCH,
  injectMarrowlineLabButton,
  injectAshLifecycleEntry,
  bindAshDraftsToCaseMap,
  renderDomeWorldShell
};

export const ASH_LIFECYCLE_ASSET_EPOCH = '20260727-a15-postclosure-v1';
export const ASH_LIFECYCLE_SOURCE_MODULE = '/dome-world/ash-lifecycle.js';
export const ASH_LIFECYCLE_MODULE = `${ASH_LIFECYCLE_SOURCE_MODULE}?v=${ASH_LIFECYCLE_ASSET_EPOCH}`;
export const ASH_WORKSPACE_BRIDGE_MODULE = '/dome-world/ash-workspace-bridge.js';
// Compatibility export only; operational mass eviction is retired.
export const ASH_MASS_EVICTION_EPOCH = 'RETIRED_SITE_EPOCH_AUTHORITY';

const OLD_ASSET_EPOCH = '20260724-a12-release-v1';

/* Historical A12 baseline: ASH_LIFECYCLE_ASSET_EPOCH = '20260724-a12-release-v1' */
/* Historical Ash eviction epochs remain in receipts only; they have no runtime authority. */
/* Rendered core marker: data-glyph="∴" */

export const ASH_SHELL_CORE_CONTRACT_MARKERS = Object.freeze([
  "const legacyPresentation=incoming.searchParams.get('presentation')==='legacy'",
  "legacy_bypass:legacyPresentation",
  "__td613AshAia3PreflightReceipt",
  "Promise.resolve(receipt)",
  "retired:true",
  "sitewide_epoch_authoritative:true",
  "RETIRED_SITE_EPOCH_AUTHORITY",
  "Preparing Ash",
  "td613-ash-preparing-shell",
  "await globalThis.__td613AshAia3Preflight",
  "if(location.pathname!==canonicalPath||location.search){history.replaceState(null,'',canonicalPath+location.hash)}",
  "ash-a7-a11-recompiler-core.js?v=${ASH_LIFECYCLE_ASSET_EPOCH}",
  "ash-a7-home-recompilation.js?v=${ASH_LIFECYCLE_ASSET_EPOCH}",
  "ash-a8-case-map-recompilation.js?v=${ASH_LIFECYCLE_ASSET_EPOCH}",
  "data-glyph=\"∴\"",
  "/dome-world/marrowline.html",
  "<span><b>11</b>stations</span>"
]);

function rewriteEpochs(value) {
  if (typeof value !== 'string') return value;
  return value.replaceAll(OLD_ASSET_EPOCH, ASH_LIFECYCLE_ASSET_EPOCH);
}

function rewriteHeaderValue(value) {
  if (Array.isArray(value)) return value.map(rewriteHeaderValue);
  return typeof value === 'string' ? rewriteEpochs(value) : value;
}

export function injectAshKeepLifecycle(source = '') {
  return rewriteEpochs(injectCoreAshKeepLifecycle(source));
}

export default function handler(req, res) {
  const headers = new Map();
  const proxy = {
    statusCode: 200,
    setHeader(name, value) {
      headers.set(String(name).toLowerCase(), { name, value });
    },
    end(body = '') {
      res.statusCode = proxy.statusCode;
      for (const { name, value } of headers.values()) res.setHeader(name, rewriteHeaderValue(value));
      if (typeof body === 'string') res.end(rewriteEpochs(body));
      else if (body instanceof Uint8Array) res.end(Buffer.from(rewriteEpochs(Buffer.from(body).toString('utf8'))));
      else res.end(body);
    }
  };
  return coreHandler(req, proxy);
}
