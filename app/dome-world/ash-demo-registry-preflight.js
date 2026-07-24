export const ASH_DEMO_REGISTRY_PREFLIGHT_VERSION = 'td613.ash.demo-registry-preflight/v0.1';

const host = globalThis.window;
const doc = globalThis.document;

function registry() {
  return host?.__td613AshDemoRegistry || null;
}

function reconcile() {
  queueMicrotask(() => registry()?.reconcile?.('EXPLICIT_PROFILE_SELECTION'));
}

function captureProfileChange(event) {
  if (event.target?.id !== 'newProfile') return;
  event.stopImmediatePropagation();
  reconcile();
}

function captureDemoGesture(event) {
  const control = event.target?.closest?.('#startDemo');
  if (!control) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  registry()?.hydrateSelected?.();
}

export function installAshDemoRegistryPreflight() {
  if (!host || !doc || host.__td613AshDemoRegistryPreflight) return false;
  host.__td613AshDemoRegistryOwnsControls = true;
  host.addEventListener('change', captureProfileChange, true);
  host.addEventListener('click', captureDemoGesture, true);
  doc.documentElement.dataset.ashDemoControlOwner = 'UNIFIED_REGISTRY';
  host.__td613AshDemoRegistryPreflight = Object.freeze({
    version:ASH_DEMO_REGISTRY_PREFLIGHT_VERSION,
    owner:'UNIFIED_REGISTRY',
    start_demo_listener_count:1,
    profile_change_listener_count:1,
    automatic_consequential_action:false,
    authority_changed:false,
    human_gesture_required:true
  });
  return true;
}

if (host && doc) installAshDemoRegistryPreflight();
