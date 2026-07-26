import {
  ASH_A15_REGISTRY_VERSION,
  ASH_A15_ASSET_EPOCH,
  ASH_A15_PROFILES,
  ASH_A15_WORKSPACES,
  ASH_A15_AIA_ROUTES,
  compileA15StressMatrix,
  verifyA15StressMatrix
} from './ash-a15-profile-route-stress.js?v=20260726-a15-release-v1';

export const ASH_A15_REGISTRY_CONVERGENCE_VERSION = 'td613.ash.a15-registry-convergence/v0.1';

const host = globalThis.window;
const doc = globalThis.document;
let installed = false;
let baseRegistry = null;
let registryApi = null;

function patchVisibleIdentity() {
  if (!doc?.documentElement) return false;
  doc.documentElement.dataset.ashDemoRegistry = ASH_A15_REGISTRY_VERSION;
  doc.documentElement.dataset.ashDemoCompatibilityOwner = ASH_A15_REGISTRY_VERSION;
  doc.documentElement.dataset.ashA15RegistryConvergence = ASH_A15_REGISTRY_CONVERGENCE_VERSION;
  const button = doc.getElementById('startDemo');
  if (button) button.dataset.ashDemoRegistryOwner = ASH_A15_REGISTRY_VERSION;
  return true;
}

function snapshot() {
  const current = baseRegistry?.snapshot?.() || null;
  return Object.freeze({
    ...(current || {}),
    version:ASH_A15_REGISTRY_VERSION,
    asset_epoch:ASH_A15_ASSET_EPOCH,
    stress_matrix:Object.freeze({
      profiles:ASH_A15_PROFILES.length,
      workspaces:ASH_A15_WORKSPACES.length,
      routes:ASH_A15_AIA_ROUTES.length,
      journeys:120,
      receipt:verifyA15StressMatrix(compileA15StressMatrix('same-action'))
    }),
    control_owner:'ASH_DEMO_REGISTRY',
    raw_content_transport:false,
    automatic_ash_action:false,
    release_authority:false,
    human_review_required:true
  });
}

function reconcile(...args) {
  const result = baseRegistry?.reconcile?.(...args);
  patchVisibleIdentity();
  return result;
}

function install() {
  if (!host || installed) return false;
  baseRegistry = host.__td613AshDemoRegistry;
  if (!baseRegistry?.snapshot) return false;
  registryApi = Object.freeze({
    ...baseRegistry,
    version:ASH_A15_REGISTRY_VERSION,
    asset_epoch:ASH_A15_ASSET_EPOCH,
    convergence_version:ASH_A15_REGISTRY_CONVERGENCE_VERSION,
    snapshot,
    reconcile,
    stress_matrix:compileA15StressMatrix,
    verify_stress_matrix:verifyA15StressMatrix,
    authority:Object.freeze({ custody_changed:false, source_bytes_moved:false, release_authority:false, automatic_action:false, human_review_required:true })
  });
  host.__td613AshDemoRegistry = registryApi;
  host.__td613AshProfileDemos = registryApi;
  patchVisibleIdentity();
  installed = true;
  host.dispatchEvent(new CustomEvent('td613:ash:a15-registry-converged', { detail:snapshot() }));
  return true;
}

function scheduleInstall() {
  queueMicrotask(() => {
    if (install()) return;
    host?.addEventListener?.('td613:ash:demo-registry-ready', () => install(), { once:true });
  });
}

if (host) {
  for (const type of ['td613:ash:demo-registry-ready','td613:ash:demo-registry-hydrated','td613:ash:profile-demo-hydrated']) {
    host.addEventListener(type, () => queueMicrotask(() => {
      if (!installed) install();
      else patchVisibleIdentity();
    }));
  }
  doc?.addEventListener?.('change', event => {
    if (event.target?.id === 'newProfile') queueMicrotask(() => patchVisibleIdentity());
  }, true);
  scheduleInstall();
}
