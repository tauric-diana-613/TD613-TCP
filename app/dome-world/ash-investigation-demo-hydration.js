import {
  compileCaseMap,
  compileRoomRules,
  compileRouteMemory
} from '../engine/ash-keep-core.js';

export const ASH_INVESTIGATION_DEMO_VERSION = 'td613.ash.investigation-demo/v0.1-glass-meridian';

const DB_NAME = 'td613-ash-keep';
const POINTER_KEY = 'td613.ash-keep.current-case';
const PROFILE = 'investigation';
const fixtureCache = new Map();
const byId = id => document.getElementById(id);
const join = values => (values || []).join(', ');
const lines = values => (values || []).join('\n');

const PARTS = Object.freeze({
  profile: '/dome-world/fixtures/ash-investigation-profile.json',
  rooms: '/dome-world/fixtures/ash-investigation-rooms.json',
  nodeParts: [1, 2, 3, 4].map(number => `/dome-world/fixtures/ash-investigation-nodes-${number}.json`),
  relationParts: [1, 2, 3].map(number => `/dome-world/fixtures/ash-investigation-relations-${number}.json`),
  rules: [
    '/dome-world/fixtures/ash-investigation-rule-llm.json',
    '/dome-world/fixtures/ash-investigation-rule-counsel.json',
    '/dome-world/fixtures/ash-investigation-rule-source.json',
    '/dome-world/fixtures/ash-investigation-rule-records.json',
    '/dome-world/fixtures/ash-investigation-rule-internal.json',
    '/dome-world/fixtures/ash-investigation-rule-capsule.json'
  ],
  disclosure: '/dome-world/fixtures/ash-investigation-disclosure.json',
  defaultsCore: '/dome-world/fixtures/ash-investigation-defaults-core.json',
  defaultsContinuity: '/dome-world/fixtures/ash-investigation-defaults-continuity.json'
});

const ROUTE_ENTRIES = Object.freeze([
  Object.freeze({
    entry_id: 'routeentry_investigation_review_01',
    draft_digest: `sha256:${'1'.repeat(64)}`,
    route_id: 'route_counsel_brief',
    purpose: 'preservation-brief-with-open-alternatives',
    recipient_class: 'authorized-reviewer',
    recorded_at: '2026-07-17T02:10:00Z',
    disclosed_opaque_references: ['node_scope_memo', 'node_claim_scores_changed', 'node_hypothesis_admin', 'node_hypothesis_unauthorized', 'node_gap_original'],
    recall_state: 'NOT_RECALLED'
  }),
  Object.freeze({
    entry_id: 'routeentry_investigation_model_01',
    draft_digest: `sha256:${'2'.repeat(64)}`,
    route_id: 'route_llm_analysis',
    purpose: 'compare-two-versions-without-full-map',
    recipient_class: 'configured-llm-provider',
    recorded_at: '2026-07-17T02:35:00Z',
    disclosed_opaque_references: ['node_claim_scores_changed', 'node_revision_uploaded', 'node_gap_audit', 'node_ai_packet'],
    recall_state: 'NOT_RECALLED'
  }),
  Object.freeze({
    entry_id: 'routeentry_investigation_followup_01',
    draft_digest: `sha256:${'3'.repeat(64)}`,
    route_id: 'route_source_followup',
    purpose: 'request-original-file-location',
    recipient_class: 'protected-source',
    recorded_at: '2026-07-17T02:55:00Z',
    disclosed_opaque_references: ['node_gap_original', 'node_gap_mobile', 'node_action_preserve'],
    recall_state: 'NOT_RECALLED'
  }),
  Object.freeze({
    entry_id: 'routeentry_investigation_records_01',
    draft_digest: `sha256:${'4'.repeat(64)}`,
    route_id: 'route_records_request',
    purpose: 'request-audit-log-and-original-workbook',
    recipient_class: 'records-custodian',
    recorded_at: '2026-07-17T03:20:00Z',
    disclosed_opaque_references: ['node_gap_original', 'node_gap_audit', 'node_access_window'],
    recall_state: 'NOT_RECALLED'
  })
]);

const BOUNDARIES = Object.freeze({
  observations: [Object.freeze({
    kind: 'SYNTHETIC_PROFILE_DEMO',
    real_people: false,
    real_organizations: false,
    real_documents: false,
    real_events: false,
    real_provider_execution: false,
    attribution_established: false,
    identity_established: false,
    prediction_authorized: false,
    automatic_action_authorized: false
  })],
  missingness: [
    'No original workbook is provided.',
    'No complete platform audit log is provided.',
    'No actual interview exists.',
    'No provider execution occurred.',
    'No real Capsule recipient or transport occurred.'
  ],
  alternatives: [
    'Administrative correction.',
    'Unapproved workbook change.',
    'Export or format conversion difference.',
    'Incomplete supplied chronology.',
    'Benign duplication in the chat and email exports.'
  ],
  openQuestions: [
    'What original artifact should become the verified custody root?',
    'Which exact references are necessary for the comparison route?',
    'What combination of role and chronology details increases linkage exposure?',
    'Which explanations remain supportable after originals are preserved?',
    'What should an authorized recipient be able to replay from the encrypted Capsule?'
  ]
});

async function fetchJson(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Investigation fixture part did not load: ${path}`);
  return response.json();
}

function uniqueIds(values, label) {
  const ids = values.map(value => value.id);
  if (new Set(ids).size !== ids.length) throw new Error(`Investigation ${label} IDs are not unique.`);
  return new Set(ids);
}

function validateFixture(fixture) {
  if (fixture.schema !== 'td613.ash.keep-demo/v0.2' || fixture.profile !== PROFILE) throw new Error('Investigation fixture identity drifted.');
  if (fixture.case.rooms.length !== 12 || fixture.case.nodes.length !== 56 || fixture.case.relationships.length !== 72) {
    throw new Error('Investigation fixture count contract drifted.');
  }
  if (fixture.room_rules.length !== 6 || fixture.route_memory.entries.length !== 4) throw new Error('Investigation route contract drifted.');
  const roomIds = uniqueIds(fixture.case.rooms, 'Room');
  const nodeIds = uniqueIds(fixture.case.nodes, 'object');
  const edgeIds = uniqueIds(fixture.case.relationships, 'relation');
  for (const node of fixture.case.nodes) if (!roomIds.has(node.room_id)) throw new Error(`Investigation object ${node.id} references an unknown Room.`);
  for (const edge of fixture.case.relationships) {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) throw new Error(`Investigation relation ${edge.id} references an unknown object.`);
  }
  for (const rule of fixture.room_rules) {
    for (const roomId of rule.allowed_room_ids) if (!roomIds.has(roomId)) throw new Error(`Investigation rule ${rule.route_id} references an unknown Room.`);
    for (const edgeId of rule.local_link_keys) if (!edgeIds.has(edgeId)) throw new Error(`Investigation rule ${rule.route_id} references an unknown local link.`);
  }
  for (const entry of fixture.route_memory.entries) {
    for (const reference of entry.disclosed_opaque_references) if (!nodeIds.has(reference)) throw new Error(`Investigation route ${entry.entry_id} references an unknown object.`);
  }
  return fixture;
}

async function loadFixture() {
  if (fixtureCache.has(PROFILE)) return fixtureCache.get(PROFILE);
  const [profile, rooms, disclosure, defaultsCore, defaultsContinuity, nodeParts, relationParts, rules] = await Promise.all([
    fetchJson(PARTS.profile),
    fetchJson(PARTS.rooms),
    fetchJson(PARTS.disclosure),
    fetchJson(PARTS.defaultsCore),
    fetchJson(PARTS.defaultsContinuity),
    Promise.all(PARTS.nodeParts.map(fetchJson)),
    Promise.all(PARTS.relationParts.map(fetchJson)),
    Promise.all(PARTS.rules.map(fetchJson))
  ]);
  const fixture = validateFixture({
    ...profile,
    ...disclosure,
    stress_targets: profile.stress_targets,
    workstreams: profile.workstreams,
    case: {
      rooms,
      nodes: nodeParts.flat(),
      relationships: relationParts.flat(),
      privateChronology: profile.privateChronology,
      intendedActions: profile.intendedActions
    },
    room_rules: rules,
    route_memory: {
      entries: ROUTE_ENTRIES,
      operator_declared_assumptions: [
        'The configured model does not need the protected-source alias, personal contact data, or the complete Case Map.',
        'The authorized reviewer needs open explanations and preservation gaps, but not local joining keys.',
        'The records office needs file and audit-log identifiers, but not interview strategy.',
        'The protected source does not need provider output or internal role-linkage analysis.'
      ],
      unknown: [
        'Whether the original workbook remains recoverable.',
        'Who used the unattributed access window.',
        'Whether version differences arose during administration, conversion, or another change.',
        'Whether the minimized packet still enables source linkage through combination.'
      ]
    },
    defaults: {
      ...defaultsCore,
      ...defaultsContinuity,
      protected_literals: ['protected source alias', 'personal contact', 'device identifier', 'full Case Map'],
      research_notes: 'Synthetic Investigation demo. Ash reports reconstruction exposure under declared routes; it does not establish attribution, identity, authorship, coordination, truth, surveillance, or future behavior.'
    },
    observations: BOUNDARIES.observations,
    missingness: BOUNDARIES.missingness,
    alternatives: BOUNDARIES.alternatives,
    open_questions: BOUNDARIES.openQuestions
  });
  fixtureCache.set(PROFILE, fixture);
  return fixture;
}

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function writeDemoRecords(caseMap, roomRules, routeMemory) {
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const transaction = db.transaction(['cases', 'roomRules', 'routeMemory'], 'readwrite');
    transaction.objectStore('cases').put(caseMap);
    transaction.objectStore('roomRules').put({ id: caseMap.case_id, value: roomRules });
    transaction.objectStore('routeMemory').put({ id: caseMap.case_id, value: routeMemory });
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
  db.close();
}

async function currentCaseRecord() {
  const caseId = localStorage.getItem(POINTER_KEY);
  if (!caseId) return null;
  const db = await openDb();
  const record = await new Promise((resolve, reject) => {
    const request = db.transaction('cases').objectStore('cases').get(caseId);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return record;
}

function setValue(id, value) {
  const element = byId(id);
  if (!element || value == null) return;
  element.value = String(value);
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

function applyDefaults(fixture) {
  const defaults = fixture.defaults;
  setValue('readerClass', defaults.reader_class);
  setValue('testRefs', join(defaults.test_refs));
  setValue('linkLeft', fixture.style_samples.left);
  setValue('linkRight', fixture.style_samples.right);
  setValue('routeId', defaults.route.id);
  setValue('routeRecipient', defaults.route.recipient_class);
  setValue('routePurpose', defaults.route.purpose);
  setValue('routeDigest', defaults.route.digest);
  setValue('routeRefs', join(defaults.route.refs));
  setValue('draftBody', defaults.draft.body || fixture.held_draft);
  setValue('draftRoute', defaults.draft.route);
  setValue('draftRecipient', defaults.draft.recipient_class);
  setValue('draftPurpose', defaults.draft.purpose);
  setValue('draftVersion', defaults.draft.version);
  setValue('draftRefs', join(defaults.draft.refs));
  setValue('providerTask', defaults.provider_task);
  setValue('protectedLiterals', join(defaults.protected_literals));
  setValue('saveQuestions', lines(defaults.save_questions));
  setValue('saveNext', lines(defaults.save_next));
  setValue('researchNotes', defaults.research_notes);
  for (const [key, value] of Object.entries(defaults.tradeoff || {})) {
    setValue(`${key}Value`, value);
    const readout = byId(`${key}Readout`);
    if (readout) readout.textContent = String(value);
  }
  document.documentElement.dataset.ashDemoProfile = PROFILE;
  document.documentElement.dataset.ashDemoId = fixture.demo_id;
}

async function waitForAsh() {
  if (window.__td613AshKeep?.refresh) return;
  await new Promise((resolve, reject) => {
    const started = performance.now();
    const timer = setInterval(() => {
      if (window.__td613AshKeep?.refresh) {
        clearInterval(timer);
        resolve();
      } else if (performance.now() - started > 30000) {
        clearInterval(timer);
        reject(new Error('Ash Keep did not reach Investigation demo readiness.'));
      }
    }, 50);
  });
}

function setStatus(message, held = false) {
  const status = byId('demoProfileStatus');
  if (status) status.innerHTML = `<strong>${held ? 'Investigation demo held.' : 'Investigation demo available.'}</strong> ${message}`;
}

function updateControls() {
  const select = byId('newProfile');
  const button = byId('startDemo');
  if (!select || !button || select.value !== PROFILE) return false;
  button.disabled = false;
  button.classList.add('demo-available');
  button.classList.remove('demo-unavailable');
  button.textContent = 'Start Investigation demo';
  button.title = 'Hydrate the synthetic Investigation workspace.';
  button.setAttribute('aria-disabled', 'false');
  setStatus('This loads synthetic custody, competing explanations, Route Memory, AI-sharing guidance, and Capsule continuity.');
  return true;
}

export async function hydrateInvestigationDemo() {
  const button = byId('startDemo');
  if (!button) return null;
  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  button.textContent = 'Hydrating Investigation…';
  setStatus('Compiling the synthetic Case Map, route boundaries, and remembered crossings locally.');
  try {
    await waitForAsh();
    const fixture = await loadFixture();
    const caseMap = await compileCaseMap({
      profile: PROFILE,
      title: fixture.title,
      rooms: fixture.case.rooms,
      nodes: fixture.case.nodes,
      relationships: fixture.case.relationships,
      privateChronology: fixture.case.privateChronology,
      intendedActions: fixture.case.intendedActions,
      sourceStatus: 'SIMULATED',
      evidenceBasis: ['synthetic Investigation fixture', 'operator-selected workspace profile'],
      observations: fixture.observations,
      missingness: fixture.missingness,
      alternatives: fixture.alternatives,
      openQuestions: fixture.open_questions,
      operatorNotes: [
        'demo_profile:investigation',
        `demo_id:${fixture.demo_id}`,
        ...fixture.stress_targets.map(value => `stress_target:${value}`)
      ]
    });
    const roomRules = await compileRoomRules({
      caseId: caseMap.case_id,
      rules: fixture.room_rules,
      sourceStatus: 'SIMULATED',
      evidenceBasis: ['synthetic Investigation route boundaries']
    });
    const routeMemory = await compileRouteMemory({
      caseId: caseMap.case_id,
      entries: fixture.route_memory.entries,
      operatorDeclaredAssumptions: fixture.route_memory.operator_declared_assumptions,
      unknown: fixture.route_memory.unknown,
      sourceStatus: 'SIMULATED',
      evidenceBasis: ['synthetic Investigation route history']
    });
    await writeDemoRecords(caseMap, roomRules, routeMemory);
    localStorage.setItem(POINTER_KEY, caseMap.case_id);
    await window.__td613AshKeep.refresh();
    applyDefaults(fixture);
    window.dispatchEvent(new CustomEvent('td613:ash:profile-demo-hydrated', { detail: {
      case_id: caseMap.case_id,
      case_map_digest: caseMap.case_map_digest,
      route_memory_digest: routeMemory.route_memory_digest,
      profile: PROFILE,
      demo_id: fixture.demo_id,
      room_count: caseMap.rooms.length,
      node_count: caseMap.nodes.length,
      relationship_count: caseMap.relationships.length,
      route_count: routeMemory.entries.length
    } }));
    setTimeout(() => window.__td613AshPremiumUI?.open?.('home'), 0);
    setStatus(`${caseMap.rooms.length} Rooms, ${caseMap.nodes.length} objects, ${caseMap.relationships.length} relations, and ${routeMemory.entries.length} remembered routes are now local.`);
    return { caseMap, roomRules, routeMemory };
  } catch (error) {
    setStatus(error.message, true);
    console.error(error);
    return null;
  } finally {
    button.removeAttribute('aria-busy');
    queueMicrotask(updateControls);
  }
}

async function rehydrateCurrentInvestigation() {
  try {
    const caseMap = await currentCaseRecord();
    if (caseMap?.profile !== PROFILE || !(caseMap.operator_notes || []).includes('demo_profile:investigation')) return;
    applyDefaults(await loadFixture());
  } catch (error) {
    console.error(error);
  }
}

export function installAshInvestigationDemo() {
  if (typeof document === 'undefined' || typeof window === 'undefined') return false;
  const select = byId('newProfile');
  const button = byId('startDemo');
  if (!select || !button) return false;
  select.addEventListener('change', () => queueMicrotask(updateControls));
  window.addEventListener('click', event => {
    const target = event.target?.closest?.('#startDemo');
    if (!target || select.value !== PROFILE) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    hydrateInvestigationDemo();
  }, true);
  for (const type of ['case-opened', 'core-ready', 'capsule-opened']) {
    window.addEventListener(`td613:ash:${type}`, rehydrateCurrentInvestigation);
  }
  document.documentElement.dataset.ashInvestigationDemo = ASH_INVESTIGATION_DEMO_VERSION;
  window.__td613AshInvestigationDemo = Object.freeze({
    version: ASH_INVESTIGATION_DEMO_VERSION,
    hydrate: hydrateInvestigationDemo,
    loadFixture,
    counts: Object.freeze({ rooms: 12, nodes: 56, relationships: 72, routes: 4 })
  });
  waitForAsh().then(rehydrateCurrentInvestigation).catch(console.error);
  queueMicrotask(updateControls);
  return true;
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  installAshInvestigationDemo();
}
