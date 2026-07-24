import './ash-demo-registry-preflight.js';
import { CASE_PROFILES } from '../engine/ash-keep-core.js';
import {
  ASH_APEQ_PAIA_PROFILE_DEMOS,
  buildApeqPaiaProfileFixture,
  hydrateApeqPaiaProfileDemo,
  rehydrateCurrentApeqPaiaDemo
} from './ash-apeq-paia-profile-demos.js';
import {
  ASH_LEGAL_DEMO_VERSION,
  buildLegalMatterDemoFixture,
  hydrateLegalMatterDemo,
  rehydrateLegalMatterDemo
} from './ash-legal-profile-demo.js';
import {
  ASH_RESEARCH_DEMO_VERSION,
  buildResearchFixture,
  hydrateResearchDemo
} from './ash-research-demo-hydration.js';
import { ASH_DEMO_PEDAGOGY_MANIFESTS } from './ash-demo-pedagogy-rehydration.js';

export const ASH_DEMO_REGISTRY_VERSION = 'td613.ash.unified-six-demo-registry/v0.1';
export const ASH_DEMO_REGISTRY_ASSET_EPOCH = '20260724-a13-release-v1';

const host = globalThis.window;
const doc = globalThis.document;
const byId = id => doc?.getElementById(id);
const CANONICAL_ORDER = Object.freeze(['investigation', 'political_campaign', 'fundraiser', 'research', 'legal', 'archive']);
const NON_PROMOTED = Object.freeze(['organizing', 'unpublished']);
const AIA_ROUTES = Object.freeze([
  Object.freeze({ id:'experimental', label:'Learn by doing', authority_changed:false }),
  Object.freeze({ id:'custodial', label:'Protect the source', authority_changed:false }),
  Object.freeze({ id:'audit', label:'Check the evidence', authority_changed:false }),
  Object.freeze({ id:'implementation', label:'Inspect the machinery', authority_changed:false })
]);
const CHANNEL_GRAMMAR = Object.freeze(['Glyph', 'Motion', 'Shape', 'Language', 'Inspection']);
const adapters = new Map();
let busyProfile = null;

function manifest(profile, fallback) {
  return ASH_DEMO_PEDAGOGY_MANIFESTS[profile] || Object.freeze(fallback);
}

function fixtureContract(profile) {
  if (ASH_APEQ_PAIA_PROFILE_DEMOS[profile]) {
    const fixture = buildApeqPaiaProfileFixture(profile);
    return Object.freeze({
      demo_id:fixture.profile.demo_id,
      claim_ceiling:fixture.assay.claim_ceiling,
      missingness:Object.freeze([...fixture.profile.missingness]),
      alternatives:Object.freeze([...fixture.profile.alternatives]),
      deterministic_journey:Object.freeze(['explicit profile selection', 'local synthetic hydration', 'workspace entry', 'human review', 'rest or return'])
    });
  }
  if (profile === 'research') {
    const fixture = buildResearchFixture();
    return Object.freeze({
      demo_id:fixture.profile.demo_id,
      claim_ceiling:fixture.assay.claim_ceiling,
      missingness:Object.freeze([...fixture.profile.missingness]),
      alternatives:Object.freeze([...fixture.profile.alternatives]),
      deterministic_journey:Object.freeze(['explicit profile selection', 'local synthetic hydration', 'method inspection', 'bounded review', 'rest or return'])
    });
  }
  if (profile === 'legal') {
    const fixture = buildLegalMatterDemoFixture();
    return Object.freeze({
      demo_id:fixture.demo_id,
      claim_ceiling:'SYNTHETIC_LEGAL_MATTER_ONLY__NO_LEGAL_ADVICE_LIABILITY_MERITS_PRIVILEGE_WAIVER_OR_OUTCOME_PREDICTION',
      missingness:Object.freeze(['No real client or lawyer is present.', 'No original filing, certified ledger, service affidavit, or court record is present.', 'No legal advice or merits determination occurred.']),
      alternatives:Object.freeze(['posting delay', 'service defect', 'incomplete record', 'administrative correction', 'unresolved chronology']),
      deterministic_journey:Object.freeze(['explicit profile selection', 'local synthetic hydration', 'deadline and source review', 'human-reviewed draft', 'rest or return'])
    });
  }
  return Object.freeze({
    demo_id:'demo_archive_harbor_memory_reserved_a14',
    claim_ceiling:'ARCHIVE_DEMO_RESERVED_FOR_A14__NO_ACCESS_RELEASE_RIGHTS_PROVENANCE_OR_DATE_FINDING',
    missingness:Object.freeze(['Archive fixture is intentionally absent until A14.', 'No collection, donor, rights, access, or transfer record has been created.']),
    alternatives:Object.freeze(['A14 fixture not yet admitted']),
    deterministic_journey:Object.freeze(['explicit profile selection', 'visible A14 hold', 'no hydration', 'return'])
  });
}

const LEGAL_MANIFEST = Object.freeze({
  profile:'legal',
  label:'Legal Matter',
  title:'Separate deadline, evidence, privilege, and human judgment.',
  consequence:'Ash preserves synthetic deadlines, filings, evidence gaps, privilege boundaries, alternatives, and routes without issuing legal advice.',
  stress_question:'Can the interface support bounded matter work without implying liability, merits, privilege waiver, or outcome?',
  entry_workspace:'work',
  active_workspaces:Object.freeze(['home','map','work','choir','capsule']),
  destination_copy:Object.freeze({
    home:'Read deadline posture, mandate, and next human-reviewed action.',
    map:'Inspect parties, filings, evidence, privilege boundaries, alternatives, and routes.',
    work:'Prepare bounded preservation and filing tasks without legal automation.',
    choir:'Compare bounded routes without converting residue into liability or truth.',
    capsule:'Inspect continuity posture; filing and handoff remain separately authorized.'
  }),
  task_spine:Object.freeze([
    Object.freeze({ label:'Verify clock', detail:'Check the synthetic deadline and unresolved service posture.', workspace:'home' }),
    Object.freeze({ label:'Preserve originals', detail:'Keep filings, ledger gaps, and client communications provenance-visible.', workspace:'map' }),
    Object.freeze({ label:'Separate privilege', detail:'Keep strategy and confidential joins local while drafting.', workspace:'work' }),
    Object.freeze({ label:'Human-review filing', detail:'No filing, advice, waiver, or outcome follows automatically.', workspace:'capsule' })
  ]),
  keep_quiet:'Real client data, provider generation, automatic filing, release approval, privilege conclusions, and outcome prediction remain dormant.',
  claim_ceiling:'No legal advice, liability, merits, privilege waiver, or outcome prediction.'
});

const ARCHIVE_MANIFEST = Object.freeze({
  profile:'archive',
  label:'Archive',
  title:'A14 fixture held at the registry boundary.',
  consequence:'The unified registry names Archive now so later hydration cannot invent a parallel control path.',
  stress_question:'Can the registry reserve a canonical demo without pretending its fixture, rights, or access posture already exists?',
  entry_workspace:'map',
  active_workspaces:Object.freeze(['home','map','work','choir','capsule']),
  destination_copy:Object.freeze({
    home:'A14 will state collection scope and preservation duty.',
    map:'A14 will map originals, derivatives, restrictions, dates, duplicates, and access copies.',
    work:'A14 will stage accession and access-review tasks.',
    choir:'A14 will compare version lineage without inventing provenance.',
    capsule:'A14 will distinguish preservation, access copy, embargo, and transfer preparation.'
  }),
  task_spine:Object.freeze([
    Object.freeze({ label:'Reserve architecture', detail:'Registry entry exists; fixture remains absent.', workspace:'home' }),
    Object.freeze({ label:'Hold hydration', detail:'No synthetic archive record is created in A13.', workspace:'map' }),
    Object.freeze({ label:'Name missingness', detail:'Rights, provenance, dates, and access posture remain unasserted.', workspace:'work' }),
    Object.freeze({ label:'Return', detail:'Operator may choose another profile without side effects.', workspace:'capsule' })
  ]),
  keep_quiet:'No archive records, donor restrictions, rights claims, access permissions, publication, or transport are inferred in A13.',
  claim_ceiling:'Registry reservation only; no archive claim or action.'
});

function registryEntry(profile, label, promotionState, available, sourceVersion, customManifest = null) {
  const contract = fixtureContract(profile);
  const pedagogy = customManifest || manifest(profile, {});
  return Object.freeze({
    profile,
    label,
    demo_id:contract.demo_id,
    promotion_state:promotionState,
    available,
    source_version:sourceVersion,
    profile_fixture:available ? 'REGISTERED_BUILDER' : 'HELD_FOR_A14',
    pedagogy_manifest:pedagogy,
    workspace_scenes:Object.freeze([...(pedagogy.active_workspaces || ['home','map','work','choir','capsule'])]),
    aia_route_views:AIA_ROUTES,
    channel_grammar:CHANNEL_GRAMMAR,
    menu_home_mapping:Object.freeze({ menu:'cross-cutting only', home:'profile priority and continuity', core_workspaces:'five principal tabs' }),
    inspection_contract:Object.freeze({ technical_state_available:true, technical_state_compulsory:false, source_content_exposed:false }),
    claim_ceiling:contract.claim_ceiling,
    missingness:contract.missingness,
    alternatives:contract.alternatives,
    deterministic_test_journey:contract.deterministic_journey,
    static_parity:true,
    reduced_motion_parity:true,
    automatic_consequential_ash_action:false,
    custody_authority_changed:false,
    release_authority_changed:false,
    human_gesture_required:true
  });
}

export const ASH_DEMO_REGISTRY = Object.freeze({
  investigation:registryEntry('investigation', 'Investigation', 'PROMOTED', true, ASH_APEQ_PAIA_PROFILE_DEMOS.investigation?.method_version || 'APEQ_PAIA'),
  political_campaign:registryEntry('political_campaign', 'Political Campaign', 'PROMOTED', true, ASH_APEQ_PAIA_PROFILE_DEMOS.political_campaign?.method_version || 'APEQ_PAIA'),
  fundraiser:registryEntry('fundraiser', 'Fundraiser', 'PROMOTED', true, ASH_APEQ_PAIA_PROFILE_DEMOS.fundraiser?.method_version || 'APEQ_PAIA'),
  research:registryEntry('research', 'Research Project', 'PROMOTED', true, ASH_RESEARCH_DEMO_VERSION),
  legal:registryEntry('legal', 'Legal Matter', 'PROMOTED', true, ASH_LEGAL_DEMO_VERSION, LEGAL_MANIFEST),
  archive:registryEntry('archive', 'Archive', 'RESERVED_FOR_A14', false, 'A14_PENDING', ARCHIVE_MANIFEST)
});

export const ASH_NON_PROMOTED_PROFILES = NON_PROMOTED;

for (const profile of ['investigation', 'political_campaign', 'fundraiser']) {
  adapters.set(profile, Object.freeze({
    build:() => buildApeqPaiaProfileFixture(profile),
    hydrate:() => hydrateApeqPaiaProfileDemo(profile),
    rehydrate:rehydrateCurrentApeqPaiaDemo
  }));
}
adapters.set('research', Object.freeze({ build:buildResearchFixture, hydrate:hydrateResearchDemo, rehydrate:null }));
adapters.set('legal', Object.freeze({ build:buildLegalMatterDemoFixture, hydrate:hydrateLegalMatterDemo, rehydrate:rehydrateLegalMatterDemo }));

function ensureStatus() {
  let status = byId('demoProfileStatus');
  if (status) return status;
  const actions = byId('startDemo')?.closest('.actions');
  if (!actions) return null;
  status = doc.createElement('p');
  status.id = 'demoProfileStatus';
  status.className = 'demo-profile-status';
  status.setAttribute('aria-live', 'polite');
  actions.insertAdjacentElement('afterend', status);
  return status;
}

function ensureOptions() {
  const select = byId('newProfile');
  if (!select) return null;
  if (!select.querySelector('option[value=""]')) {
    const blank = doc.createElement('option');
    blank.value = '';
    blank.textContent = 'Select a profile…';
    select.prepend(blank);
  }
  for (const profile of CANONICAL_ORDER) {
    const entry = ASH_DEMO_REGISTRY[profile];
    let option = select.querySelector(`option[value="${profile}"]`);
    if (!option) {
      option = doc.createElement('option');
      option.value = profile;
      select.append(option);
    }
    option.textContent = entry.label;
    option.dataset.ashDemoPromotion = entry.promotion_state;
  }
  return select;
}

function setButton(button, { disabled, busy = false, label, title, state }) {
  button.disabled = Boolean(disabled);
  button.setAttribute('aria-disabled', String(Boolean(disabled)));
  button.setAttribute('aria-busy', String(Boolean(busy)));
  button.classList.toggle('demo-available', !disabled);
  button.classList.toggle('demo-unavailable', disabled);
  button.textContent = label;
  button.title = title;
  button.dataset.ashDemoRegistryState = state;
  button.dataset.ashDemoControlOwner = 'UNIFIED_REGISTRY';
}

export function currentAshDemoRegistrySelection() {
  const profile = byId('newProfile')?.value || '';
  const entry = ASH_DEMO_REGISTRY[profile] || null;
  return Object.freeze({
    profile,
    entry,
    adapter_registered:adapters.has(profile),
    promoted:Boolean(entry?.promotion_state === 'PROMOTED'),
    available:Boolean(entry?.available && adapters.has(profile))
  });
}

export function reconcileAshDemoRegistry(reason = 'REGISTRY_RECONCILE') {
  if (!doc) return false;
  const select = ensureOptions();
  const button = byId('startDemo');
  const newCase = byId('newCase');
  const status = ensureStatus();
  if (!select || !button) return false;
  const profile = select.value;
  const entry = ASH_DEMO_REGISTRY[profile] || null;
  const adapterReady = adapters.has(profile);
  const busy = busyProfile === profile;

  if (busy && entry) {
    setButton(button, { disabled:true, busy:true, label:`Opening ${entry.label}…`, title:'Local synthetic hydration is in progress.', state:'BUSY' });
  } else if (entry?.available && adapterReady) {
    setButton(button, { disabled:false, label:`Open ${entry.label} demo`, title:`Hydrate the governed synthetic ${entry.label} fixture locally.`, state:'READY' });
  } else if (entry?.promotion_state === 'RESERVED_FOR_A14') {
    setButton(button, { disabled:true, label:'Archive demo arrives in A14', title:'A13 reserves one canonical registry entry without inventing the Archive fixture early.', state:'HELD_FOR_A14' });
  } else {
    setButton(button, { disabled:true, label:'Start a demo', title:profile ? 'This registered Ash profile is not a promoted demo.' : 'Select a profile first.', state:profile ? 'NON_PROMOTED_PROFILE' : 'HELD' });
  }

  if (newCase) {
    const blankCaseAllowed = Boolean(profile && Object.hasOwn(CASE_PROFILES, profile));
    newCase.disabled = !blankCaseAllowed;
    newCase.setAttribute('aria-disabled', String(!blankCaseAllowed));
  }

  if (status && !busy) {
    if (!profile) status.innerHTML = '<strong>Select a profile first.</strong> Demo hydration and blank-case creation remain held until context is explicit.';
    else if (entry?.available && adapterReady) status.innerHTML = `<strong>${entry.label} demo available.</strong> One registry owns the gesture; the existing fixture builder retains local hydration authority. No release, custody transfer, or automatic closure follows.`;
    else if (entry?.promotion_state === 'RESERVED_FOR_A14') status.innerHTML = '<strong>Archive is reserved, not fabricated.</strong> A14 will admit the synthetic collection fixture, rights posture, lineage, and access-review journey.';
    else status.innerHTML = `<strong>${CASE_PROFILES[profile] || profile} remains available as a blank Ash profile.</strong> It is not falsely presented as one of the six canonical demos.`;
  }

  doc.documentElement.dataset.ashDemoRegistrySelection = profile || 'NONE';
  doc.documentElement.dataset.ashDemoRegistryReason = reason;
  doc.documentElement.dataset.ashDemoRegistryAvailable = String(Boolean(entry?.available && adapterReady));
  return true;
}

export async function hydrateSelectedAshDemo() {
  const { profile, entry, available } = currentAshDemoRegistrySelection();
  if (!profile || !entry || !available || busyProfile) {
    reconcileAshDemoRegistry('HELD_GESTURE');
    return null;
  }
  const adapter = adapters.get(profile);
  busyProfile = profile;
  reconcileAshDemoRegistry('HYDRATION_BEGIN');
  try {
    const result = await adapter.hydrate();
    host?.dispatchEvent?.(new CustomEvent('td613:ash:demo-registry-hydrated', {
      detail:Object.freeze({
        schema:ASH_DEMO_REGISTRY_VERSION,
        profile,
        demo_id:entry.demo_id,
        result_present:Boolean(result),
        source_status:'CONSTRUCTED',
        automatic_consequential_ash_action:false,
        authority_changed:false,
        human_gesture_observed:true
      })
    }));
    return result;
  } finally {
    busyProfile = null;
    queueMicrotask(() => reconcileAshDemoRegistry('HYDRATION_SETTLED'));
    host?.setTimeout?.(() => reconcileAshDemoRegistry('HYDRATION_POSTPAINT'), 0);
  }
}

export function registerAshDemoAdapter(profile, adapter) {
  const entry = ASH_DEMO_REGISTRY[profile];
  if (!entry) throw new Error(`Cannot register an adapter outside the governed demo registry: ${profile}`);
  if (!adapter || typeof adapter.build !== 'function' || typeof adapter.hydrate !== 'function') throw new Error(`Demo adapter for ${profile} must provide build and hydrate functions.`);
  adapters.set(profile, Object.freeze({ build:adapter.build, hydrate:adapter.hydrate, rehydrate:adapter.rehydrate || null }));
  host?.setTimeout?.(() => reconcileAshDemoRegistry('ADAPTER_REGISTERED'), 0);
  return true;
}

export function installAshDemoRegistry() {
  if (!host || !doc || host.__td613AshDemoRegistry) return false;
  ensureOptions();
  for (const type of ['profile-demo-hydrated', 'case-opened', 'case-closed', 'aia3-readiness-changed']) {
    host.addEventListener(`td613:ash:${type}`, () => host.setTimeout(() => reconcileAshDemoRegistry(type.toUpperCase()), 0));
  }
  const api = Object.freeze({
    version:ASH_DEMO_REGISTRY_VERSION,
    asset_epoch:ASH_DEMO_REGISTRY_ASSET_EPOCH,
    canonical_order:CANONICAL_ORDER,
    entries:ASH_DEMO_REGISTRY,
    non_promoted_profiles:NON_PROMOTED,
    current:currentAshDemoRegistrySelection,
    reconcile:reconcileAshDemoRegistry,
    hydrateSelected:hydrateSelectedAshDemo,
    registerAdapter:registerAshDemoAdapter,
    control_owner:'UNIFIED_REGISTRY',
    automatic_consequential_ash_action:false,
    custody_authority_changed:false,
    release_authority_changed:false,
    human_gesture_required:true
  });
  host.__td613AshDemoRegistry = api;
  doc.documentElement.dataset.ashDemoRegistry = ASH_DEMO_REGISTRY_VERSION;
  doc.documentElement.dataset.ashDemoRegistryOwner = 'UNIFIED_REGISTRY';
  doc.documentElement.dataset.ashDemoRegistryCanonicalCount = String(CANONICAL_ORDER.length);
  doc.documentElement.dataset.ashDemoRegistryAdapterCount = String(adapters.size);
  reconcileAshDemoRegistry('INSTALL');
  host.setTimeout(() => reconcileAshDemoRegistry('LEGACY_LISTENER_SETTLED'), 0);
  return true;
}

if (host && doc) installAshDemoRegistry();
