import * as core from './ash-demo-registry-core.js';

export * from './ash-demo-registry-core.js';

const host = globalThis.window;
const doc = globalThis.document;

const REQUIRED_REGISTRY_STATIC_MARKERS = Object.freeze([
  '20260726-a15-empirical-v1',
  'pedagogy_manifest',
  'workspace_scenes',
  'aia_routes',
  'channel_grammar',
  'menu_home_mapping',
  'inspection_contract',
  'claim_ceiling',
  'missingness',
  'alternatives',
  'deterministic_test_journey',
  'static_parity',
  'reduced_motion_parity',
  'automatic_consequential_action:false',
  'empirical_journey_version',
  'empirical_matrix_cells',
  "addEventListener('click',",
  '#startDemo',
  'stopImmediatePropagation()',
  "addEventListener('change',",
  'true)',
  'host.__td613AshProfileDemos = registryApi',
  'ashDemoCompatibilityOwner',
  "owner:'APEQ_PAIA'",
  "owner:'RESEARCH'",
  "owner:'LEGAL'",
  "owner:'ARCHIVE'",
  "control_owner:'ASH_DEMO_REGISTRY'",
  'hydrateResearchDemo',
  "legal:Object.freeze({ profile:'legal'",
  'hydrateLegalMatterDemo',
  'Legal Matter',
  'no legal advice',
  'legalManifest',
  'archiveManifest',
  'buildArchiveDemoFixture',
  'hydrateArchiveDemo',
  'empirical_matrix_cells:120',
  'import(`./ash-apeq-paia-profile-demos.js?v=${ASH_DEMO_ASSET_EPOCH}`)',
  'import(`./ash-research-demo-hydration.js?v=${ASH_DEMO_ASSET_EPOCH}`)',
  'import(`./ash-legal-profile-demo.js?v=${ASH_DEMO_ASSET_EPOCH}`)',
  'import(`./ash-archive-profile-demo.js?v=${ASH_DEMO_ASSET_EPOCH}`)',
  'import(`./ash-demo-pedagogy-rehydration.js?v=${ASH_DEMO_ASSET_EPOCH}`)',
  'import(`./ash-a15-empirical-profile-journeys.js?v=${ASH_DEMO_ASSET_EPOCH}`)',
  'installAshA15EmpiricalJourneys'
]);

const REQUIRED_A15_EMPIRICAL_OWNER_MARKERS = Object.freeze([
  'const empiricalOwner = import(`./ash-a15-empirical-profile-journeys.js?v=${ASH_DEMO_ASSET_EPOCH}`)',
  '.catch(error => Object.freeze({ module:null, error }))',
  'Promise.all([',
  'empiricalOwner',
  'registryEntries = Object.freeze(entries);',
  'const empirical = empiricalResult.module',
  'empiricalResult.module',
  'empiricalLoadHeld = Boolean(empiricalResult.error || !empirical)',
  'HELD_SUBORDINATE',
  'registry_available:true',
  'empirical_journey_version',
  'empirical_journey_status',
  'empirical_matrix_cells',
  'ash-a15-empirical-journey:${profile}',
  'return registryEntries'
]);

const coreSourceUrl = new URL('./ash-demo-registry-core.js', import.meta.url);

async function assertPreservedRegistryCore() {
  if (typeof process === 'undefined' || !process.versions?.node) return true;
  const { readFile } = await import('node:fs/promises');
  const source = await readFile(coreSourceUrl, 'utf8');
  for (const marker of REQUIRED_REGISTRY_STATIC_MARKERS) {
    if (!source.includes(marker)) throw new Error(`Ash demo registry historical owner law missing after reopen hardening: ${marker}`);
  }
  for (const marker of REQUIRED_A15_EMPIRICAL_OWNER_MARKERS) {
    if (!source.includes(marker)) throw new Error(`Ash demo registry A15 empirical owner law missing after reopen hardening: ${marker}`);
  }
  return true;
}

await assertPreservedRegistryCore();

if (host && doc) {
  host.addEventListener('td613:ash:demo-registry-hydrated', event => {
    const detail = event.detail || null;
    if (detail?.status !== 'HYDRATED' || detail?.automatic_ash_action !== false) return;
    if (doc.body) doc.body.dataset.ashCaseClosed = 'false';
  });
}

export const ASH_DEMO_REGISTRY_REOPEN_BOUNDARY = Object.freeze({
  owner:'ASH_DEMO_REGISTRY',
  event:'td613:ash:demo-registry-hydrated',
  admitted_status:'HYDRATED',
  automatic_ash_action:false,
  case_closed_after_hydration:false,
  authority_changed:false,
  human_closure_required:true
});
