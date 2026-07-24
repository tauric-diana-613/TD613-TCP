export const ASH_DEMO_REGISTRY_VERSION = 'td613.ash.demo-registry/v0.1-a13';
export const ASH_DEMO_ASSET_EPOCH = '20260724-a13-release-v1';

const host = globalThis.window;
const doc = globalThis.document;
const byId = id => doc?.getElementById(id);
const PROFILE_ORDER = Object.freeze([
  'investigation',
  'political_campaign',
  'fundraiser',
  'research',
  'legal',
  'archive'
]);
const AIA_ROUTES = Object.freeze(['experimental', 'custodial', 'audit', 'implementation']);
const CHANNEL_GRAMMAR = Object.freeze(['glyph', 'motion', 'shape', 'language', 'inspection']);

const BASE_ENTRIES = Object.freeze({
  investigation:Object.freeze({ profile:'investigation', label:'Investigation', status:'PROMOTED', owner:'APEQ_PAIA', entry_workspace:'home' }),
  political_campaign:Object.freeze({ profile:'political_campaign', label:'Political Campaign', status:'PROMOTED', owner:'APEQ_PAIA', entry_workspace:'map' }),
  fundraiser:Object.freeze({ profile:'fundraiser', label:'Fundraiser', status:'PROMOTED', owner:'APEQ_PAIA', entry_workspace:'work' }),
  research:Object.freeze({ profile:'research', label:'Research Project', status:'PROMOTED', owner:'RESEARCH', entry_workspace:'map' }),
  legal:Object.freeze({ profile:'legal', label:'Legal Matter', status:'PROMOTED', owner:'LEGAL', entry_workspace:'home' }),
  archive:Object.freeze({ profile:'archive', label:'Archive', status:'RESERVED_FOR_A14', owner:'A14', entry_workspace:'map' })
});

const archiveManifest = Object.freeze({
  profile:'archive',
  label:'Archive',
  title:'Preserve lineage before granting access.',
  consequence:'The A14 seat is named without inventing an accession fixture, access copy, restriction, or transfer receipt.',
  stress_question:'Can the registry preserve a canonical place for Archive without presenting unfinished hydration as evidence?',
  entry_workspace:'map',
  task_spine:Object.freeze([]),
  active_workspaces:Object.freeze(['home','map','work','choir','capsule']),
  destination_copy:Object.freeze({
    home:'Archive orientation remains held until A14 authors the synthetic accession fixture.',
    map:'The future accession and provenance map has a named home but no fabricated records.',
    work:'No archive review queue is hydrated before A14.',
    choir:'No archive comparison pair is staged before A14.',
    capsule:'No access copy or transfer preparation is implied before A14.'
  }),
  keep_quiet:'No accession data, donor restriction, public derivative, embargo, custody root, or transfer receipt is fabricated.',
  claim_ceiling:'Registry seat only. No Archive fixture, access authority, release authority, or transfer authority.'
});

let ownersPromise = null;
let installed = false;
let reconciling = false;
let busyProfile = null;
let registryEntries = null;

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
  for (const profile of PROFILE_ORDER) {
    const spec = BASE_ENTRIES[profile];
    let option = select.querySelector(`option[value="${profile}"]`);
    if (!option) {
      option = doc.createElement('option');
      option.value = profile;
      select.append(option);
    }
    option.textContent = spec.status === 'RESERVED_FOR_A14' ? `${spec.label} · arrives in A14` : spec.label;
  }
  return select;
}

function legalManifest(fixture) {
  return Object.freeze({
    profile:'legal', label:'Legal Matter', title:'Separate deadline, evidence, privilege, and decision.',
    consequence:'Ash preserves deadlines, source gaps, privilege boundaries, competing explanations, and human review without offering legal advice.',
    stress_question:'Can the interface stage a synthetic matter without implying guilt, liability, merits, privilege waiver, or outcome?',
    entry_workspace:'home',
    task_spine:Object.freeze([
      Object.freeze({ label:'Verify the clock', detail:'Read the supplied deadline and preserve the service-method gap.', workspace:'home' }),
      Object.freeze({ label:'Preserve originals', detail:'Map filings, evidence, provenance gaps, privilege, and alternatives.', workspace:'map' }),
      Object.freeze({ label:'Prepare bounded work', detail:'Stage a filing or client update without moving privileged strategy.', workspace:'work' }),
      Object.freeze({ label:'Human-review route', detail:'Keep outcome, merits, liability, and waiver outside the claim ceiling.', workspace:'capsule' })
    ]),
    active_workspaces:Object.freeze(['home','map','work','choir','capsule']),
    destination_copy:Object.freeze({ home:'Read deadlines and the next preservation duty.', map:'Inspect parties, filings, evidence, privilege, alternatives, and routes.', work:'Prepare bounded human-reviewed legal work.', choir:'Compare routes without converting residue into merits or truth.', capsule:'Preserve continuity without performing a filing or disclosure.' }),
    keep_quiet:'Privileged strategy, client communications, witness contacts, provider output, release approval, and outcome prediction stay local or dormant.',
    claim_ceiling:fixture?.defaults?.research_notes || 'Synthetic training only; no legal advice, guilt, liability, merits, privilege waiver, or outcome prediction.'
  });
}

function normalizeEntry(base, fixture, manifest, hydrate, build) {
  const profile = base.profile;
  const missingness = fixture?.profile?.missingness || fixture?.missingness || [];
  const alternatives = fixture?.profile?.alternatives || fixture?.alternatives || [];
  const claimCeiling = fixture?.assay?.claim_ceiling || manifest?.claim_ceiling || 'Human review required.';
  return Object.freeze({
    ...base,
    promoted:base.status === 'PROMOTED',
    fixture,
    build,
    hydrate,
    pedagogy_manifest:manifest,
    workspace_scenes:Object.freeze([...(manifest?.active_workspaces || ['home','map','work','choir','capsule'])]),
    aia_routes:AIA_ROUTES,
    channel_grammar:CHANNEL_GRAMMAR,
    menu_home_mapping:Object.freeze({ home:'home', case_map:'map', work:'work', choir:'choir', capsule:'capsule' }),
    inspection_contract:Object.freeze({ exact_state_available:true, compulsory:false, source_bytes_exposed:false }),
    claim_ceiling:claimCeiling,
    missingness:Object.freeze([...(missingness || [])]),
    alternatives:Object.freeze([...(alternatives || [])]),
    deterministic_test_journey:`ash-a13-demo-registry:${profile}`,
    static_parity:true,
    reduced_motion_parity:true,
    automatic_consequential_action:false
  });
}

async function loadOwners() {
  if (ownersPromise) return ownersPromise;
  ownersPromise = Promise.all([
    import(`./ash-apeq-paia-profile-demos.js?v=${ASH_DEMO_ASSET_EPOCH}`),
    import(`./ash-research-demo-hydration.js?v=${ASH_DEMO_ASSET_EPOCH}`),
    import(`./ash-legal-profile-demo.js?v=${ASH_DEMO_ASSET_EPOCH}`),
    import(`./ash-demo-pedagogy-rehydration.js?v=${ASH_DEMO_ASSET_EPOCH}`)
  ]).then(([apeq, research, legal, pedagogy]) => {
    const manifests = pedagogy.ASH_DEMO_PEDAGOGY_MANIFESTS || {};
    const entries = {};
    for (const profile of ['investigation','political_campaign','fundraiser']) {
      const fixture = apeq.buildApeqPaiaProfileFixture(profile);
      entries[profile] = normalizeEntry(
        BASE_ENTRIES[profile], fixture, manifests[profile],
        () => apeq.hydrateApeqPaiaProfileDemo(profile),
        () => apeq.buildApeqPaiaProfileFixture(profile)
      );
    }
    const researchFixture = research.buildResearchFixture();
    entries.research = normalizeEntry(
      BASE_ENTRIES.research, researchFixture, manifests.research,
      () => research.hydrateResearchDemo(),
      () => research.buildResearchFixture()
    );
    const legalFixture = legal.buildLegalMatterDemoFixture();
    entries.legal = normalizeEntry(
      BASE_ENTRIES.legal, legalFixture, legalManifest(legalFixture),
      () => legal.hydrateLegalMatterDemo(),
      () => legal.buildLegalMatterDemoFixture()
    );
    entries.archive = Object.freeze({
      ...BASE_ENTRIES.archive,
      promoted:false,
      fixture:null,
      build:null,
      hydrate:null,
      pedagogy_manifest:archiveManifest,
      workspace_scenes:archiveManifest.active_workspaces,
      aia_routes:AIA_ROUTES,
      channel_grammar:CHANNEL_GRAMMAR,
      menu_home_mapping:Object.freeze({ home:'home', case_map:'map', work:'work', choir:'choir', capsule:'capsule' }),
      inspection_contract:Object.freeze({ exact_state_available:false, compulsory:false, source_bytes_exposed:false }),
      claim_ceiling:archiveManifest.claim_ceiling,
      missingness:Object.freeze(['Archive fixture intentionally absent until A14.']),
      alternatives:Object.freeze([]),
      deterministic_test_journey:'ash-a13-demo-registry:archive-held',
      static_parity:true,
      reduced_motion_parity:true,
      automatic_consequential_action:false
    });
    registryEntries = Object.freeze(entries);
    doc.documentElement.dataset.ashDemoRegistryOwners = 'APEQ_PAIA,RESEARCH,LEGAL,A14_RESERVED';
    host.dispatchEvent(new CustomEvent('td613:ash:demo-registry-ready', { detail:snapshot() }));
    scheduleReconcile();
    return registryEntries;
  });
  return ownersPromise;
}

function snapshot() {
  const source = registryEntries || BASE_ENTRIES;
  return Object.freeze({
    version:ASH_DEMO_REGISTRY_VERSION,
    asset_epoch:ASH_DEMO_ASSET_EPOCH,
    profiles:Object.freeze(PROFILE_ORDER.map(profile => Object.freeze({
      profile,
      label:source[profile].label,
      status:source[profile].status,
      promoted:source[profile].promoted ?? source[profile].status === 'PROMOTED',
      owner:source[profile].owner,
      claim_ceiling:source[profile].claim_ceiling || null
    }))),
    control_owner:'ASH_DEMO_REGISTRY',
    raw_content_transport:false,
    automatic_ash_action:false,
    release_authority:false,
    human_review_required:true
  });
}

function setControlState(button, entry) {
  const busy = busyProfile === entry?.profile;
  const ready = entry?.status === 'PROMOTED' && !busy;
  button.disabled = !ready;
  button.setAttribute('aria-disabled', String(!ready));
  button.setAttribute('aria-busy', String(busy));
  button.classList.toggle('demo-available', ready);
  button.classList.toggle('demo-unavailable', !ready);
  button.dataset.ashMethodDemoState = busy ? 'BUSY' : ready ? 'READY' : 'HELD';
  button.dataset.ashDemoRegistryOwner = ASH_DEMO_REGISTRY_VERSION;
  if (!entry) {
    button.textContent = 'Start a demo';
    button.title = 'Select one explicit workspace profile first.';
  } else if (entry.status === 'RESERVED_FOR_A14') {
    button.textContent = 'Archive demo arrives in A14';
    button.title = 'The canonical Archive registry seat is held until A14 authors and validates its synthetic fixture.';
  } else {
    button.textContent = busy ? `Opening ${entry.label}…` : `Open ${entry.label} demo`;
    button.title = `Hydrate the synthetic ${entry.label} fixture locally through the governed A13 registry.`;
  }
}

function reconcile() {
  if (reconciling) return false;
  reconciling = true;
  try {
    const select = ensureOptions();
    const button = byId('startDemo');
    const newCase = byId('newCase');
    const status = ensureStatus();
    if (!select || !button) return false;
    const profile = select.value;
    const entry = (registryEntries || BASE_ENTRIES)[profile] || null;
    setControlState(button, entry);
    if (newCase) {
      newCase.disabled = !profile;
      newCase.setAttribute('aria-disabled', String(!profile));
    }
    if (status && busyProfile == null) {
      if (!entry) status.innerHTML = '<strong>Select a profile first.</strong> Demo hydration remains held until the workspace context is explicit.';
      else if (entry.status === 'RESERVED_FOR_A14') status.innerHTML = '<strong>Archive is named but held.</strong> A14 will supply the synthetic accession, provenance, restriction, access-copy, and delayed-transfer fixture.';
      else status.innerHTML = `<strong>${entry.label} demo available.</strong> One governed registry owns selection and hydration; fixture authority remains with its bounded domain provider.`;
    }
    doc.documentElement.dataset.ashDemoRegistryProfile = profile || 'NONE';
    doc.documentElement.dataset.ashDemoRegistryState = entry?.status || 'NO_SELECTION';
    return true;
  } finally {
    reconciling = false;
  }
}

function scheduleReconcile() {
  host?.setTimeout?.(() => host.requestAnimationFrame?.(reconcile) || reconcile(), 0);
}

export async function hydrateAshDemo(profile) {
  const entries = await loadOwners();
  const entry = entries[profile];
  if (!entry) throw new Error(`No Ash demo registry entry exists for ${profile}.`);
  if (entry.status !== 'PROMOTED' || typeof entry.hydrate !== 'function') {
    ensureStatus().innerHTML = `<strong>${entry.label} remains held.</strong> ${entry.claim_ceiling}`;
    reconcile();
    return null;
  }
  busyProfile = profile;
  reconcile();
  try {
    const result = await entry.hydrate();
    host.dispatchEvent(new CustomEvent('td613:ash:demo-registry-hydrated', {
      detail:{ profile, status:result ? 'HYDRATED' : 'HELD', owner:entry.owner, automatic_ash_action:false }
    }));
    return result;
  } finally {
    busyProfile = null;
    scheduleReconcile();
  }
}

export async function buildAshDemoFixture(profile) {
  const entries = await loadOwners();
  const entry = entries[profile];
  return typeof entry?.build === 'function' ? entry.build() : null;
}

export function getAshDemoRegistrySnapshot() { return snapshot(); }
export async function getAshDemoRegistryEntries() { return loadOwners(); }

export function installAshDemoRegistry() {
  if (!host || !doc || installed) return false;
  const select = ensureOptions();
  const button = byId('startDemo');
  if (!select || !button) return false;
  installed = true;
  select.addEventListener('change', scheduleReconcile);
  host.addEventListener('click', event => {
    const target = event.target?.closest?.('#startDemo');
    if (!target) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const profile = select.value;
    hydrateAshDemo(profile).catch(error => {
      console.error(error);
      busyProfile = null;
      const status = ensureStatus();
      if (status) status.innerHTML = `<strong>Demo registry held.</strong> ${error.message}`;
      scheduleReconcile();
    });
  }, true);
  for (const type of ['case-opened','case-closed','profile-demo-hydrated','premium-ready','whole-instrument-refreshed']) {
    host.addEventListener(`td613:ash:${type}`, scheduleReconcile);
  }
  doc.documentElement.dataset.ashDemoRegistry = ASH_DEMO_REGISTRY_VERSION;
  doc.documentElement.dataset.ashDemoControlOwner = 'ASH_DEMO_REGISTRY';
  const api = Object.freeze({
    version:ASH_DEMO_REGISTRY_VERSION,
    asset_epoch:ASH_DEMO_ASSET_EPOCH,
    profiles:PROFILE_ORDER,
    snapshot:getAshDemoRegistrySnapshot,
    entries:getAshDemoRegistryEntries,
    hydrate:hydrateAshDemo,
    build:buildAshDemoFixture,
    reconcile,
    authority:Object.freeze({ custody_changed:false, raw_content_transport:false, automatic_action:false, release_authority:false, human_review_required:true })
  });
  host.__td613AshDemoRegistry = api;
  host.__td613AshProfileDemos = api;
  reconcile();
  loadOwners().catch(error => {
    console.error(error);
    doc.documentElement.dataset.ashDemoRegistryState = 'OWNER_LOAD_HELD';
  });
  return true;
}

if (host && doc) installAshDemoRegistry();
