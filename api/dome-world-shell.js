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
export const ASH_MASS_EVICTION_EPOCH = 'td613.ash.cache-flush/2026-07-27-a15-postclosure-v1';

const OLD_ASSET_EPOCH = '20260724-a12-release-v1';
const OLD_MASS_EVICTION_EPOCH = 'td613.ash.cache-flush/2026-07-24-a11-postclosure-v1';
const OLD_MARKER = 'a11-postclosure-v1';
const NEW_MARKER = 'a15-postclosure-v1';

/* Historical A12 baseline: ASH_LIFECYCLE_ASSET_EPOCH = '20260724-a12-release-v1' */
/* Historical A11 baseline: ASH_MASS_EVICTION_EPOCH = 'td613.ash.cache-flush/2026-07-24-a11-postclosure-v1' */
/* Rendered core marker: data-glyph="∴" */
/* Inherited core contract markers: ash-cache-preflight Clear-Site-Data case_data_preserved:true session_epoch_preserved_or_migrated visible_url:canonicalPath */

export const ASH_SHELL_CORE_CONTRACT_MARKERS = Object.freeze([
  "const legacyPresentation=incoming.searchParams.get('presentation')==='legacy'",
  "legacy_bypass:true",
  "__td613AshAia3PreflightReceipt",
  "Preparing Ash",
  "td613-ash-preparing-shell",
  "await globalThis.__td613AshAia3Preflight",
  "const recoveryBridge='/safe-harbor/ash-keep-recovery.html'",
  "controllerPresent=Boolean(navigator.serviceWorker?.controller)",
  "cross_scope_recovery_required:controllerPresent",
  "location.replace(recoveryBridge)",
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
  return value
    .replaceAll(OLD_ASSET_EPOCH, ASH_LIFECYCLE_ASSET_EPOCH)
    .replaceAll(OLD_MASS_EVICTION_EPOCH, ASH_MASS_EVICTION_EPOCH)
    .replaceAll(OLD_MARKER, NEW_MARKER);
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
