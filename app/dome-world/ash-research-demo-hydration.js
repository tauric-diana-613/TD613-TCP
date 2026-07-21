import { compileCaseMap, compileRoomRules, compileRouteMemory } from '../engine/ash-keep-core.js';

export const ASH_RESEARCH_DEMO_VERSION = 'td613.ash.research-demo/v0.3-child-legible-surface-ledger';
export const ASH_RESEARCH_SURFACE_LEDGER_VERSION = 'td613.ash.research-surface-ledger/v0.1';

const PROFILE = 'research';
const DB_NAME = 'td613-ash-keep';
const POINTER_KEY = 'td613.ash-keep.current-case';
const host = globalThis.window;
const doc = globalThis.document;
const byId = id => doc?.getElementById(id);
const join = value => (value || []).join(', ');
const lines = value => (value || []).join('\n');
const slug = value => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
const sha = value => `sha256:${String(value).repeat(64).slice(0, 64)}`;

const ROOMS = Object.freeze([
  ['question', 'Question & commitments', '#76ead4'],
  ['literature', 'Sources & provenance', '#e4c66c'],
  ['methods', 'Method & protocol', '#7dd3fc'],
  ['raw', 'Data & instruments', '#93c5fd'],
  ['ethics', 'People & consent', '#f0abfc'],
  ['coding', 'Coding & annotation', '#d9a1ff'],
  ['models', 'Models & computation', '#a78bfa'],
  ['results', 'Results & nulls', '#a7f3d0'],
  ['alternatives', 'Other explanations', '#fb923c'],
  ['replication', 'Reproduction & replay', '#5eead4'],
  ['routes', 'Review routes', '#fbbf24'],
  ['claims', 'Claims & publication', '#f9a8d4'],
  ['risk', 'Risks & unresolved', '#ff8b9d'],
  ['next', 'Next actions', '#86efac']
]);

const TOPICS = Object.freeze({
  question:['primary research question', 'secondary sensitivity question', 'preregistration v2', 'population scope boundary', 'missing pilot rationale'],
  literature:['evidence synthesis matrix', 'provenance registry', 'retracted comparator', 'technical reports corpus', 'inaccessible source datasets'],
  methods:['protocol v1', 'protocol v2 correction', 'sampling frame', 'measurement plan', 'collection-window deviation'],
  raw:['sensor manifest', 'raw batch A', 'raw batch B', 'calibration log', 'missing station-day'],
  ethics:['ethics protocol', 'consent template', 'participant linkage key', 'local-linkage rule', 'withdrawal reconciliation gap'],
  coding:['codebook v3', 'synthetic annotator A', 'synthetic annotator B', 'adjudication log', 'unresolved ambiguous records'],
  models:['baseline model', 'robust alternative model', 'diagnostic bundle', 'conditional-model limitation', 'incomplete validation set'],
  results:['primary positive estimate', 'null-compatible outcome', 'subgroup sign reversal', 'signed residual ledger', 'unobserved long-horizon outcome'],
  alternatives:['weather drift', 'site-selection imbalance', 'calibration correction', 'annotation disagreement', 'unknown operational change'],
  replication:['environment manifest', 'dependency-lock digest', 'deterministic replay receipt', 'independent replication protocol', 'unrun replication gap'],
  routes:['peer-review receipt', 'public-summary receipt', 'methods-review receipt', 'encrypted-archive receipt', 'offline-Reader receipt'],
  claims:['bounded primary claim', 'null-compatible claim', 'no universal generalization', 'scoped figure caption', 'policy-translation gap'],
  risk:['rare joining-key risk', 'metadata linkage risk', 'unknown Reader corpus', 'stale-cache surface', 'recipient endpoint uncertainty'],
  next:['preserve commitments', 'calibrate Readers', 'run joining-key ablation', 'retest projection', 'human claim review']
});

const CONTROLS = Object.freeze(['POSITIVE', 'MATCHED_BENIGN', 'NULL', 'MISSING', 'CONTRADICTORY', 'SHUFFLED', 'TRUNCATED', 'ROUTE_ORDER', 'DELAYED_DISCLOSURE', 'CROSS_SESSION', 'SOURCE_DRIFT', 'METADATA_ONLY']);
const HELD_OUTS = Object.freeze(['rare_fact_conjunctions', 'chronology', 'source_identity', 'hypotheses', 'lifecycle_state', 'metadata_linkage', 'document_provenance', 'unknown_reader']);
const STRATA = Object.freeze(['content', 'projection', 'cryptographic', 'endpoint', 'provider', 'reader', 'metadata', 'temporal', 'custody', 'human']);

export const ASH_RESEARCH_SURFACE_PLAN = Object.freeze([
  { id:'home_view', label:'Command Deck', workspace:'home', selector:'#workspace-home', expected:'HYDRATED_VIEW', reason:'The current question, lifecycle posture, and next action should be readable without entering a technical chamber.' },
  { id:'map_view', label:'Case Map', workspace:'map', selector:'#workspace-map', expected:'HYDRATED_VIEW', reason:'Question, evidence, methods, gaps, alternatives, and next actions should form one inspectable local structure.' },
  { id:'work_view', label:'Work Queue', workspace:'work', selector:'#workspace-work', expected:'HYDRATED_VIEW', reason:'Open research tasks and unresolved evidence should route into the current premium work surface.' },
  { id:'rooms_view', label:'Rooms', workspace:'rooms', selector:'#workspace-rooms', expected:'HYDRATED_VIEW', reason:'Joining keys and purpose-shaped disclosure rules should remain inspectable without being exported.' },
  { id:'routes_view', label:'Route Memory', workspace:'routes', selector:'#workspace-routes', expected:'HYDRATED_VIEW', reason:'Synthetic review crossings should be visible as remembered routes rather than implied transport.' },
  { id:'test_view', label:'Rebuild Test', workspace:'test', selector:'#workspace-test', expected:'HYDRATED_VIEW', reason:'The Reader, held-outs, and proposed references should be staged, while execution still requires a gesture and lifecycle eligibility.' },
  { id:'draft_view', label:'Draft & Hush', workspace:'draft', selector:'#workspace-draft', expected:'HYDRATED_VIEW', reason:'A bounded review draft should be staged without provider approval, recipient transport, or release authority.' },
  { id:'save_view', label:'Save Points', workspace:'save', selector:'#workspace-save', expected:'HYDRATED_VIEW', reason:'Unanswered questions and next steps should be staged without automatically creating a Save Point or Capsule.' },
  { id:'choir_view', label:'Choir', workspace:'choir', selector:'#workspace-choir', expected:'HYDRATED_VIEW', reason:'Current Route Memory should feed the bounded pairwise instrument without automatically running it.' },
  { id:'capsule_view', label:'Capsule', workspace:'capsule', selector:'#workspace-capsule', expected:'HYDRATED_VIEW', reason:'Continuity posture should be visible while passphrase, export, and import remain human-gated.' },
  { id:'custody_view', label:'Custody', workspace:'custody', selector:'#workspace-custody', expected:'HYDRATED_VIEW', reason:'The lifecycle sequence should remain available rather than hidden behind research terminology.' },
  { id:'map_authoring', label:'Add an object', workspace:'map', selector:'#addObject', expected:'READY_FOR_GESTURE', reason:'Blank authoring controls should stay available for real operator additions.' },
  { id:'room_authoring', label:'Add a Room', workspace:'rooms', selector:'#addRoom', expected:'READY_FOR_GESTURE', reason:'The demo should not close the schema around its own fourteen Rooms.' },
  { id:'route_recording', label:'Record what left', workspace:'routes', selector:'#recordRoute', expected:'READY_FOR_GESTURE', reason:'Seeded Route Memory should not prevent later exact crossing records.' },
  { id:'accessible_table', label:'Accessible map table', workspace:'map', selector:'#toggleTable', expected:'READY_FOR_GESTURE', reason:'The table stays closed until asked for, but the control must remain reachable.' },
  { id:'quick_scan', label:'Quick Scan', workspace:'custody', selector:'#compileQuickScan', expected:'READY_FOR_GESTURE', reason:'Readiness observation may begin without pretending custody has already been verified.' },
  { id:'custody_registration', label:'Register custody root', workspace:'custody', selector:'#registerCustodyRoot', expected:'READY_FOR_GESTURE', reason:'A human may deliberately bind a local file or create an L0 metadata-only root.' },
  { id:'custody_binding', label:'Bind verified root', workspace:'custody', selector:'#bindCustodyRoot', expected:'HELD_BY_LIFECYCLE', reason:'Binding must remain unavailable until a root exists and verification has completed.' },
  { id:'rebuild_execution', label:'Run Rebuild Test', workspace:'test', selector:'#runTest', expected:'HELD_BY_LIFECYCLE', reason:'The demo may stage controls and references, but execution follows the custody and case-binding sequence.' },
  { id:'draft_keep', label:'Keep draft', workspace:'draft', selector:'#keepDraft', expected:'HELD_BY_LIFECYCLE', reason:'A populated textarea is not permission to create a governed Draft receipt.' },
  { id:'save_point', label:'Create Save Point', workspace:'save', selector:'#makeSave', expected:'HELD_BY_LIFECYCLE', reason:'Continuity should not be sealed before the required prior lifecycle work.' },
  { id:'provider_approval', label:'Provider generation', workspace:'draft', selector:'#providerApproval', expected:'INTENTIONALLY_DORMANT', idle:'unchecked', reason:'The provider boundary stays off until the operator approves the exact selected text.' },
  { id:'release_approval', label:'Release receipt', workspace:'draft', selector:'#approveRelease', expected:'INTENTIONALLY_DORMANT', idle:'disabled', reason:'A release receipt stays locked until local review and every required check complete.' },
  { id:'unexpected_detail', label:'Unexpected Detail', workspace:'test', selector:'#unexpectedText', expected:'INTENTIONALLY_DORMANT', idle:'empty', reason:'No provider output exists in this synthetic local hydration, so novelty must remain blank.' },
  { id:'imported_reader', label:'Imported Reader output', workspace:'test', selector:'#importedReaderOutput', expected:'INTENTIONALLY_DORMANT', idle:'empty', reason:'The demo must not invent a provider response merely to make the field look busy.' },
  { id:'capsule_passphrase', label:'Capsule passphrase', workspace:'capsule', selector:'#premiumCapsulePassphrase, #capsulePassphrase', expected:'INTENTIONALLY_DORMANT', idle:'empty', reason:'Passphrases are never seeded or stored.' },
  { id:'destination_handoff', label:'Destination handoff', workspace:null, selector:'a[href="/dome-world/ash-destination-handoff.html"]', expected:'SEPARATE_BOUNDARY', reason:'External crossing remains a separately gated surface rather than a local action disguised as transport.' }
]);

function nodeType(room, label) {
  const gap = /missing|gap|unrun|unobserved|unknown|uncertainty|inaccessible|unresolved|incomplete/.test(label);
  const action = room === 'next';
  const hypothesis = room === 'alternatives' || (room === 'risk' && !gap);
  if (action) return 'intended-action';
  if (gap) return 'evidence-gap';
  if (hypothesis) return 'hypothesis';
  if (/question|claim|limitation|rule|generalization|estimate|outcome|reversal/.test(label)) return 'claim';
  if (/annotator/.test(label)) return 'entity';
  if (/registry|corpus/.test(label)) return 'source';
  if (/deviation/.test(label)) return 'event';
  return 'artifact';
}

export function buildResearchFixture() {
  const rooms = ROOMS.map(([id, label, color]) => ({ id:`room_${id}`, label, color, notes:`Synthetic ${label} chamber.` }));
  const nodes = [];
  let chronology = 0;
  for (const [room] of ROOMS) {
    for (const label of TOPICS[room]) {
      const type = nodeType(room, label);
      const gap = type === 'evidence-gap';
      const hypothesis = type === 'hypothesis';
      const action = type === 'intended-action';
      nodes.push({
        id:`node_${room}_${slug(label)}`,
        type,
        label,
        room_id:`room_${room}`,
        source_status:gap ? 'UNRESOLVED' : hypothesis ? 'INFERRED' : type === 'claim' ? 'DERIVED' : 'SUPPLIED',
        sensitivity:['raw', 'ethics', 'coding', 'routes'].includes(room) ? 'RESTRICTED' : 'PRIVATE',
        confidence_posture:gap || hypothesis || action ? 'OPEN' : 'HELD',
        disclosure_state:room === 'routes' ? 'DISCLOSED' : 'LOCAL',
        chronology_index:chronology++
      });
    }
  }
  nodes.push({ id:'node_results_heldout_envelope', type:'artifact', label:'held-out replication result envelope', room_id:'room_results', source_status:'CONSTRUCTED', sensitivity:'RESTRICTED', confidence_posture:'HELD', disclosure_state:'LOCAL', chronology_index:chronology++ });
  nodes.push({ id:'node_risk_sequence_restore', type:'hypothesis', label:'disclosure order may restore omitted chronology', room_id:'room_risk', source_status:'INFERRED', sensitivity:'PRIVATE', confidence_posture:'OPEN', disclosure_state:'LOCAL', chronology_index:chronology++ });

  const relationships = [];
  for (const [room] of ROOMS) {
    const ids = nodes.filter(node => node.room_id === `room_${room}`).map(node => node.id);
    for (let index = 0; index < ids.length - 1; index += 1) {
      relationships.push({ id:`edge_${room}_local_${index + 1}`, from:ids[index], to:ids[index + 1], type:'informs-next-local-stage', source_status:'CONSTRUCTED' });
    }
  }
  const ordered = nodes.map(node => node.id);
  for (let index = 0; index < 54; index += 1) {
    const from = ordered[(index * 7) % ordered.length];
    const candidate = ordered[(index * 11 + 17) % ordered.length];
    relationships.push({
      id:`edge_cross_${String(index + 1).padStart(2, '0')}`,
      from,
      to:from === candidate ? ordered[(index * 11 + 18) % ordered.length] : candidate,
      type:['governs', 'qualifies', 'tests', 'constrains', 'supports-alternative', 'requires-retest'][index % 6],
      source_status:'CONSTRUCTED'
    });
  }

  const routeDefinitions = [
    ['peer_review', ['question', 'methods', 'models', 'results', 'claims', 'routes'], 'external-peer-reviewer'],
    ['public_summary', ['results', 'claims', 'routes'], 'public-reader'],
    ['methods_review', ['methods', 'replication', 'routes'], 'methods-reviewer'],
    ['ethics_review', ['ethics', 'methods'], 'ethics-reviewer'],
    ['offline_reader', ['models', 'results', 'replication', 'routes'], 'offline-local-model'],
    ['encrypted_archive', ['literature', 'methods', 'replication', 'routes'], 'encrypted-archive-custodian']
  ];
  const ruleDefinitions = [...routeDefinitions, ['internal_adjudication', ['coding', 'results', 'alternatives', 'risk'], 'internal-reviewer'], ['claim_review', ['question', 'results', 'alternatives', 'claims', 'risk', 'next'], 'human-claim-reviewer']];
  const rules = ruleDefinitions.map(([id, roomIds], index) => ({
    route_id:`route_${id}`,
    allowed_room_ids:roomIds.map(room => `room_${room}`),
    local_link_keys:[`edge_cross_${String(index + 1).padStart(2, '0')}`, `edge_cross_${String(index + 21).padStart(2, '0')}`],
    allowed_node_types:['artifact', 'claim', 'hypothesis', 'evidence-gap']
  }));
  const routeReferences = [
    ['node_question_primary_research_question', 'node_methods_protocol_v2_correction', 'node_results_primary_positive_estimate', 'node_claims_no_universal_generalization'],
    ['node_results_primary_positive_estimate', 'node_results_null_compatible_outcome', 'node_claims_no_universal_generalization'],
    ['node_methods_protocol_v2_correction', 'node_replication_environment_manifest', 'node_replication_deterministic_replay_receipt'],
    ['node_ethics_ethics_protocol', 'node_ethics_consent_template', 'node_ethics_local_linkage_rule'],
    ['node_models_baseline_model', 'node_models_robust_alternative_model', 'node_results_heldout_envelope'],
    ['node_literature_provenance_registry', 'node_methods_protocol_v2_correction', 'node_replication_dependency_lock_digest']
  ];
  const entries = routeDefinitions.map(([id, , recipient], index) => ({
    entry_id:`routeentry_research_${id}_01`,
    draft_digest:sha(index + 1),
    route_id:`route_${id}`,
    purpose:id.replaceAll('_', '-'),
    recipient_class:recipient,
    recorded_at:`2026-07-21T${String(index + 9).padStart(2, '0')}:10:00Z`,
    disclosed_opaque_references:routeReferences[index],
    recall_state:'NOT_RECALLED'
  }));
  const assay = {
    source_status:'CONSTRUCTED',
    promotion_authorized:false,
    maximum_assurance:'PA2_LOCALLY_EXECUTED',
    controls:CONTROLS.map((kind, index) => ({ control_id:`control_${slug(kind)}`, class:kind, purpose:`Declared ${kind.toLowerCase().replaceAll('_', ' ')} reconstruction control ${index + 1}.` })),
    held_outs:HELD_OUTS.map((dimension, index) => ({ heldout_id:`heldout_${slug(dimension)}`, protected_dimension:dimension, reference:nodes[(index * 9 + 3) % nodes.length].id })),
    strata:STRATA,
    unknown_readers:'UNMEASURED',
    universal_secrecy:false,
    claim_ceiling:'SYNTHETIC_METHOD_AND_INTERFACE_HYDRATION_ONLY__NO_EMPIRICAL_RECOVERY_CAUSAL_ATTRIBUTION_OR_ENDPOINT_CLAIM'
  };

  return Object.freeze({
    profile:{
      demo_id:'demo_research_lumen_atlas_v3',
      title:'Lumen Atlas Research Project · neighborhood cooling evidence review',
      summary:'A synthetic research project asking whether a neighborhood cooling claim survives source provenance, protocol correction, model alternatives, null results, joining-key stress, and route-order review.',
      plain_language_question:'After accounting for the study design problems and the evidence that disagrees, how much of the cooling claim can responsibly remain?',
      observations:[{ kind:'SYNTHETIC_CHILD_LEGIBLE_RESEARCH_AND_UX_DIAGNOSTIC', real_people:false, real_organizations:false, real_documents:false, real_events:false, real_provider_execution:false, empirical_reader_execution:false, causation_established:false, prediction_authorized:false, automatic_action_authorized:false }],
      missingness:['No real participant data is present.', 'No provider environment is observed.', 'No independent replication occurred.', 'Unknown external corpora remain unmeasured.'],
      alternatives:['weather drift', 'site-selection imbalance', 'instrument calibration', 'annotation disagreement', 'unknown operational change'],
      open_questions:['Which projection preserves usefulness while keeping linkage local?', 'Which joins create additional recovery?', 'Does route order restore chronology?', 'Which current Ash controls are intentionally quiet, lifecycle-held, or unexpectedly blocked?'],
      chronology:['question frozen', 'provenance compiled', 'protocol corrected', 'synthetic data collected', 'models compared', 'controls declared', 'projection compiled', 'claim human-gated'],
      actions:['preserve commitments', 'calibrate Readers', 'run joining-key ablation', 'retest projection', 'quarantine Return', 'review claim', 'review the Research hydration ledger']
    },
    rooms,
    nodes,
    relationships,
    rules,
    routes:{
      entries,
      operator_declared_assumptions:['Peer review does not require participant linkage.', 'Public summary does not require protocol joining keys.'],
      unknown:['external joining corpora', 'recipient endpoint persistence', 'sequence restoration']
    },
    assay,
    surface_plan:ASH_RESEARCH_SURFACE_PLAN,
    defaults:{
      reader_class:'deterministic-baseline',
      test_refs:['node_question_primary_research_question', 'node_methods_protocol_v2_correction', 'node_results_primary_positive_estimate', 'node_results_subgroup_sign_reversal', 'node_claims_no_universal_generalization', 'node_risk_rare_joining_key_risk'],
      route:{ id:'route_peer_review', recipient_class:'external-peer-reviewer', purpose:'blind-method-and-claim-review', digest:sha('a'), refs:routeReferences[0] },
      draft:{
        route:'route_peer_review',
        recipient_class:'external-peer-reviewer',
        purpose:'blind-method-and-claim-review',
        version:'1',
        refs:routeReferences[0],
        body:'This synthetic study asks whether a neighborhood cooling intervention remains supported after protocol correction, alternative models, null results, and held-out controls. The primary estimate remains directionally positive within the declared population. One subgroup estimate changes sign under a robust model and remains unresolved. No causal, individual, universal, or policy claim is authorized.'
      },
      provider_task:'Review the bounded synthetic methods-and-claim packet for unsupported generalization while preserving nulls, contradictions, missingness, and population scope.',
      protected_literals:['participant linkage key', 'site-month-protocol conjunction', 'raw observation batch', 'unreleased replication result', 'complete route order'],
      save_questions:['Which control failures require rest?', 'Which dimensions remain unmeasured?', 'Does metadata recovery exceed semantic recovery?', 'Which quiet interface surfaces should remain quiet?'],
      save_next:['Compile an Environment Profile.', 'Run controls and joining-key assays locally.', 'Retest after every projection change.', 'Require human claim approval.', 'Review BLOCKED_OR_MISSING and OVERHYDRATED_REVIEW ledger entries before expanding the demo.'],
      research_notes:'Synthetic Research project and interface-cartography specimen. Ash stages the map, work queue, controls, routes, and bounded draft. It performs no provider call, custody binding, Rebuild Test, release, Save Point, Capsule export, destination handoff, causal inference, or empirical PA3 claim.',
      tradeoff:{ utility:7, rebuild:4, link:6, work:8 }
    },
    counts:{ rooms:14, nodes:72, relationships:112, rules:8, routes:6, controls:12, held_outs:8, strata:10 }
  });
}

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function writeFixture(caseMap, roomRules, routeMemory) {
  const db = await openDb();
  try {
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(['cases', 'roomRules', 'routeMemory'], 'readwrite');
      transaction.objectStore('cases').put(caseMap);
      transaction.objectStore('roomRules').put({ id:caseMap.case_id, value:roomRules });
      transaction.objectStore('routeMemory').put({ id:caseMap.case_id, value:routeMemory });
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    db.close();
  }
}

async function waitFor(predicate, message, timeout = 30_000) {
  const started = performance.now();
  while (!predicate()) {
    if (performance.now() - started > timeout) throw new Error(message);
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}

async function waitForAsh() {
  await waitFor(() => host.__td613AshKeep?.refresh
    && host.__td613AshPremiumUI?.refresh
    && byId('workspace-home')
    && byId('workspace-work'), 'Research project core hydration readiness timed out.');
  doc.documentElement.dataset.ashResearchCustodyPosture = byId('workspace-custody')
    ? 'PRESENT_AT_CORE_HYDRATION'
    : 'AUDIT_AFTER_CASE_HYDRATION';
}

async function waitForOpenComposition(caseId) {
  await waitFor(() => {
    const composition = host.__td613AshAia3Composition?.current?.() || null;
    return host.__td613AshKeep?.current?.().case_id === caseId
      && composition?.session_open === true
      && composition?.membrane_ready === true
      && composition?.hold == null
      && Boolean(composition?.lifecycle_state)
      && composition?.route_count >= 4
      && composition?.task_count >= 4;
  }, 'Research project opened before its lifecycle and visible AIA composition converged.');
}

function setValue(id, value) {
  const element = byId(id);
  if (!element || value == null) return;
  element.value = String(value);
  element.dispatchEvent(new Event('input', { bubbles:true }));
  element.dispatchEvent(new Event('change', { bubbles:true }));
}

function setChecked(id, value) {
  const element = byId(id);
  if (!element) return;
  element.checked = Boolean(value);
  element.dispatchEvent(new Event('change', { bubbles:true }));
}

function applyDefaults(fixture) {
  const defaults = fixture.defaults;
  setValue('readerClass', defaults.reader_class);
  setValue('testRefs', join(defaults.test_refs));
  setValue('routeId', defaults.route.id);
  setValue('routeRecipient', defaults.route.recipient_class);
  setValue('routePurpose', defaults.route.purpose);
  setValue('routeDigest', defaults.route.digest);
  setValue('routeRefs', join(defaults.route.refs));
  setValue('draftBody', defaults.draft.body);
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
  setValue('unexpectedText', '');
  setValue('importedReaderOutput', '');
  setChecked('knownBefore', false);
  setChecked('providerScreenReview', false);
  setChecked('providerApproval', false);
  for (const [key, value] of Object.entries(defaults.tradeoff)) {
    setValue(`${key}Value`, value);
    if (byId(`${key}Readout`)) byId(`${key}Readout`).textContent = String(value);
  }
  doc.documentElement.dataset.ashDemoProfile = PROFILE;
  doc.documentElement.dataset.ashResearchMethod = ASH_RESEARCH_DEMO_VERSION;
}

function isVisible(element) {
  if (!element) return false;
  const style = getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
}

function idleState(element, kind) {
  if (!element || !kind) return null;
  if (kind === 'empty') return !String(element.value || element.textContent || '').trim();
  if (kind === 'unchecked') return element.checked === false;
  if (kind === 'disabled') return element.disabled === true || element.getAttribute('aria-disabled') === 'true';
  if (kind === 'hidden') return !isVisible(element);
  return null;
}

function observeSurface(item) {
  const element = doc.querySelector(item.selector);
  const present = Boolean(element);
  const disabled = Boolean(element && ('disabled' in element ? element.disabled : element.getAttribute('aria-disabled') === 'true'));
  const idle = idleState(element, item.idle);
  let status = 'BLOCKED_OR_MISSING';
  let attention = true;
  if (present && item.expected === 'HYDRATED_VIEW') { status = 'HYDRATED'; attention = false; }
  if (present && item.expected === 'READY_FOR_GESTURE') { status = disabled ? 'BLOCKED_UNEXPECTEDLY' : 'READY_FOR_GESTURE'; attention = disabled; }
  if (present && item.expected === 'HELD_BY_LIFECYCLE') { status = disabled ? 'HELD_BY_LIFECYCLE' : 'AVAILABLE_AFTER_PRIOR_STATE'; attention = false; }
  if (present && item.expected === 'INTENTIONALLY_DORMANT') { status = idle === true ? 'DORMANT_AS_DESIGNED' : 'OVERHYDRATED_REVIEW'; attention = idle !== true; }
  if (present && item.expected === 'SEPARATE_BOUNDARY') { status = 'SEPARATE_BOUNDARY'; attention = false; }
  return Object.freeze({
    id:item.id,
    label:item.label,
    workspace:item.workspace,
    selector:item.selector,
    expected:item.expected,
    reason:item.reason,
    present,
    visible:isVisible(element),
    disabled,
    idle,
    status,
    attention
  });
}

export function auditResearchSurfaces() {
  const entries = ASH_RESEARCH_SURFACE_PLAN.map(observeSurface);
  const summary = entries.reduce((result, entry) => {
    result[entry.status] = (result[entry.status] || 0) + 1;
    return result;
  }, {});
  const report = Object.freeze({
    schema:ASH_RESEARCH_SURFACE_LEDGER_VERSION,
    demo_version:ASH_RESEARCH_DEMO_VERSION,
    observed_at:new Date().toISOString(),
    profile:PROFILE,
    entries,
    summary,
    attention:entries.filter(entry => entry.attention).map(entry => entry.id),
    authority:{ mutates_case:false, performs_provider_call:false, performs_transport:false, authorizes_release:false, authorizes_child_study:false }
  });
  doc.documentElement.dataset.ashResearchSurfaceAudit = report.attention.length ? 'ATTENTION' : 'EXPECTED_POSTURES';
  host.__td613AshResearchSurfaceReport = report;
  return report;
}

function statusTone(status) {
  if (['BLOCKED_OR_MISSING', 'BLOCKED_UNEXPECTEDLY', 'OVERHYDRATED_REVIEW'].includes(status)) return 'attention';
  if (status === 'DORMANT_AS_DESIGNED' || status === 'HELD_BY_LIFECYCLE') return 'held';
  if (status === 'SEPARATE_BOUNDARY') return 'boundary';
  return 'ready';
}

function renderMethodDocket(fixture) {
  const map = byId('workspace-map');
  const layout = map?.querySelector('.map-layout');
  if (!layout) return;
  let docket = byId('researchMethodDocket');
  if (!docket) {
    docket = doc.createElement('section');
    docket.id = 'researchMethodDocket';
    docket.className = 'research-method-docket';
    layout.before(docket);
  }
  docket.innerHTML = `
    <div class="research-docket-head"><div><p>Research project · synthetic local specimen</p><h3>${fixture.profile.title}</h3></div><span>PA2 · human-gated</span></div>
    <p class="research-question"><strong>Question in plain language:</strong> ${fixture.profile.plain_language_question}</p>
    <div class="research-docket-metrics">${Object.entries(fixture.counts).map(([key, value]) => `<b>${key.replaceAll('_', ' ')} · ${value}</b>`).join('')}</div>
    <div class="research-docket-grid">
      <div><strong>Ash filled in</strong><p>Case Map, Rooms, six remembered review routes, Reader references, a bounded review draft, unresolved questions, next steps, and this interface audit.</p></div>
      <div><strong>Ash kept quiet</strong><p>Provider generation, custody binding, Rebuild execution, release approval, Save Point creation, Capsule credentials, and destination transport.</p></div>
      <div><strong>Claim ceiling</strong><p>Structured synthetic evidence and interface readiness ≠ causal effect, identity, attribution, prediction, universal secrecy, endpoint integrity, or publication authority.</p></div>
    </div>`;
}

function renderSurfaceLedger(report) {
  const workspace = byId('workspace-work');
  const workBody = byId('premiumWorkBody');
  if (!workspace || !workBody) return;
  let ledger = byId('researchHydrationLedger');
  if (!ledger) {
    ledger = doc.createElement('section');
    ledger.id = 'researchHydrationLedger';
    ledger.className = 'research-hydration-ledger';
    workBody.before(ledger);
  }
  const attention = report.entries.filter(entry => entry.attention);
  ledger.innerHTML = `
    <div class="research-ledger-head">
      <div><p>Interface cartography</p><h3>Research hydration ledger</h3><span>Hydrated view, human gesture, lifecycle hold, intentional dormancy, or separate boundary—named instead of flattened.</span></div>
      <div class="research-ledger-verdict" data-attention="${attention.length ? 'true' : 'false'}"><strong>${attention.length}</strong><span>items need review</span></div>
    </div>
    <div class="research-ledger-summary">${Object.entries(report.summary).map(([status, count]) => `<b data-tone="${statusTone(status)}">${status.replaceAll('_', ' ')} · ${count}</b>`).join('')}</div>
    <div class="research-ledger-rows">${report.entries.map(entry => `
      <article data-research-surface="${entry.id}" data-status="${entry.status}" data-tone="${statusTone(entry.status)}">
        <div><small>${entry.expected.replaceAll('_', ' ')}</small><strong>${entry.label}</strong><p>${entry.reason}</p></div>
        <div class="research-ledger-state"><b>${entry.status.replaceAll('_', ' ')}</b>${entry.workspace ? `<button type="button" data-research-open="${entry.workspace}">Open ${entry.workspace}</button>` : ''}</div>
      </article>`).join('')}</div>`;
}

function installStyles() {
  if (byId('td613-research-demo-css')) return;
  const style = doc.createElement('style');
  style.id = 'td613-research-demo-css';
  style.textContent = `
    .research-method-docket,.research-hydration-ledger{margin:0 0 16px;padding:18px;border:1px solid rgba(228,198,108,.38);background:linear-gradient(135deg,rgba(7,26,21,.96),rgba(24,14,31,.78));line-height:1.55}
    .research-docket-head,.research-ledger-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}.research-docket-head p,.research-ledger-head p{margin:0;color:var(--mint);font:700 .58rem var(--mono);text-transform:uppercase}.research-docket-head h3,.research-ledger-head h3{margin:4px 0 0;font:500 clamp(1.45rem,3vw,2.25rem) var(--serif)}.research-docket-head>span{color:var(--gold);font:700 .6rem var(--mono);text-transform:uppercase}.research-question{max-width:900px}.research-docket-metrics,.research-ledger-summary{display:flex;gap:6px;flex-wrap:wrap;margin:12px 0}.research-docket-metrics b,.research-ledger-summary b{padding:7px;border:1px solid var(--line);font:700 .56rem var(--mono);text-transform:uppercase}.research-docket-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.research-docket-grid>div{padding:12px;border:1px solid rgba(118,234,212,.16);background:rgba(1,8,6,.55)}.research-docket-grid strong{color:var(--gold);font:700 .62rem var(--mono);text-transform:uppercase}.research-docket-grid p{margin:7px 0 0;color:var(--muted);font-size:.78rem}
    .research-ledger-head>div:first-child span{display:block;max-width:800px;color:var(--muted);font-size:.78rem}.research-ledger-verdict{display:grid;place-items:center;min-width:100px;padding:10px;border:1px solid var(--line);text-align:center}.research-ledger-verdict strong{font:500 1.8rem var(--serif)}.research-ledger-verdict span{font:700 .52rem var(--mono);text-transform:uppercase}.research-ledger-verdict[data-attention="true"]{border-color:rgba(255,139,157,.55);color:var(--rose)}.research-ledger-summary b[data-tone="ready"]{color:var(--mint)}.research-ledger-summary b[data-tone="held"]{color:var(--gold)}.research-ledger-summary b[data-tone="attention"]{color:var(--rose)}.research-ledger-summary b[data-tone="boundary"]{color:var(--violet)}.research-ledger-rows{display:grid;gap:6px}.research-ledger-rows article{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:center;padding:12px;border-left:3px solid var(--line);background:rgba(1,8,6,.58)}.research-ledger-rows article[data-tone="ready"]{border-color:var(--mint)}.research-ledger-rows article[data-tone="held"]{border-color:var(--gold)}.research-ledger-rows article[data-tone="attention"]{border-color:var(--rose)}.research-ledger-rows article[data-tone="boundary"]{border-color:var(--violet)}.research-ledger-rows small{color:var(--muted);font:700 .52rem var(--mono);text-transform:uppercase}.research-ledger-rows strong{display:block;margin-top:3px;font:500 1.05rem var(--serif)}.research-ledger-rows p{margin:4px 0 0;color:var(--muted);font-size:.75rem}.research-ledger-state{display:grid;justify-items:end;gap:7px}.research-ledger-state>b{font:700 .55rem var(--mono);text-transform:uppercase}.research-ledger-state button{min-height:34px;padding:6px 9px;border:1px solid var(--line);background:#071a15;color:var(--paper);font:700 .55rem var(--mono);text-transform:uppercase;cursor:pointer}
    @media(max-width:760px){.research-docket-head,.research-ledger-head{display:grid}.research-docket-grid{grid-template-columns:1fr}.research-ledger-verdict{justify-self:start}.research-ledger-rows article{grid-template-columns:1fr}.research-ledger-state{justify-items:start}}
  `;
  doc.head.append(style);
}

function openResearchWorkspace(workspace) {
  const open = host.__td613AshUiUxRescue?.open || host.__td613OpenAshWorkspace || host.__td613AshKeep?.openWorkspace;
  if (typeof open !== 'function') return false;
  open(workspace);
  return true;
}

function reconcileControls() {
  const select = byId('newProfile');
  const button = byId('startDemo');
  if (!select || !button || select.value !== PROFILE) return false;
  const busy = button.getAttribute('aria-busy') === 'true' || /Opening Research project/i.test(button.textContent || '');
  button.disabled = busy;
  button.setAttribute('aria-disabled', String(busy));
  button.classList.toggle('demo-available', !busy);
  button.classList.toggle('demo-unavailable', busy);
  button.textContent = busy ? 'Opening Research project…' : 'Open Research project demo';
  button.title = 'Hydrate one synthetic project, then audit which current Ash surfaces are populated, ready, lifecycle-held, intentionally dormant, missing, or separate.';
  button.dataset.ashResearchControlState = busy ? 'BUSY' : 'READY';
  return true;
}

export async function hydrateResearchDemo() {
  const button = byId('startDemo');
  if (!button) return null;
  button.setAttribute('aria-busy', 'true');
  reconcileControls();
  try {
    await waitForAsh();
    const fixture = buildResearchFixture();
    const caseMap = await compileCaseMap({
      profile:PROFILE,
      title:fixture.profile.title,
      rooms:fixture.rooms,
      nodes:fixture.nodes,
      relationships:fixture.relationships,
      privateChronology:fixture.profile.chronology,
      intendedActions:fixture.profile.actions,
      sourceStatus:'SIMULATED',
      evidenceBasis:['synthetic child-legible Research project and interface-cartography fixture'],
      observations:fixture.profile.observations,
      missingness:fixture.profile.missingness,
      alternatives:fixture.profile.alternatives,
      openQuestions:fixture.profile.open_questions,
      operatorNotes:['demo_profile:research', 'assurance_ceiling:PA2_LOCALLY_EXECUTED', 'surface_ledger:enabled', 'automatic_actions:none']
    });
    const roomRules = await compileRoomRules({ caseId:caseMap.case_id, rules:fixture.rules, sourceStatus:'SIMULATED' });
    const routeMemory = await compileRouteMemory({
      caseId:caseMap.case_id,
      entries:fixture.routes.entries,
      operatorDeclaredAssumptions:fixture.routes.operator_declared_assumptions,
      unknown:fixture.routes.unknown,
      sourceStatus:'SIMULATED'
    });
    await writeFixture(caseMap, roomRules, routeMemory);
    localStorage.setItem(POINTER_KEY, caseMap.case_id);
    await host.__td613AshKeep.refresh();
    applyDefaults(fixture);
    await waitForOpenComposition(caseMap.case_id);
    await host.__td613AshPremiumUI.refresh();
    renderMethodDocket(fixture);
    const surfaceReport = auditResearchSurfaces();
    renderSurfaceLedger(surfaceReport);
    host.dispatchEvent(new CustomEvent('td613:ash:profile-demo-hydrated', {
      detail:{
        case_id:caseMap.case_id,
        case_map_digest:caseMap.case_map_digest,
        route_memory_digest:routeMemory.route_memory_digest,
        profile:PROFILE,
        ...fixture.counts,
        surface_ledger:surfaceReport.schema,
        surface_attention:surfaceReport.attention,
        source_status:'CONSTRUCTED',
        maximum_assurance:'PA2_LOCALLY_EXECUTED'
      }
    }));
    requestAnimationFrame(() => requestAnimationFrame(() => openResearchWorkspace('work')));
    return { caseMap, roomRules, routeMemory, assay:fixture.assay, surfaceReport };
  } catch (error) {
    console.error(error);
    doc.documentElement.dataset.ashResearchSurfaceAudit = 'HYDRATION_HELD';
    return null;
  } finally {
    button.removeAttribute('aria-busy');
    queueMicrotask(reconcileControls);
  }
}

export function installAshResearchDemo() {
  if (!host || !doc) return false;
  installStyles();
  const select = byId('newProfile');
  if (!select || host.__td613AshResearchDemo) return false;
  select.addEventListener('change', () => setTimeout(reconcileControls, 0));
  host.addEventListener('click', event => {
    const opener = event.target?.closest?.('[data-research-open]');
    if (opener) {
      event.preventDefault();
      event.stopImmediatePropagation();
      openResearchWorkspace(opener.dataset.researchOpen);
      return;
    }
    const target = event.target?.closest?.('#startDemo');
    if (!target || select.value !== PROFILE) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    hydrateResearchDemo();
  }, true);
  doc.documentElement.dataset.ashResearchDemo = ASH_RESEARCH_DEMO_VERSION;
  const fixture = buildResearchFixture();
  host.__td613AshResearchDemo = Object.freeze({
    version:ASH_RESEARCH_DEMO_VERSION,
    ledger_version:ASH_RESEARCH_SURFACE_LEDGER_VERSION,
    hydrate:hydrateResearchDemo,
    build:buildResearchFixture,
    audit:auditResearchSurfaces,
    surface_plan:ASH_RESEARCH_SURFACE_PLAN,
    counts:fixture.counts,
    assurance:{ source_status:'CONSTRUCTED', maximum:'PA2_LOCALLY_EXECUTED', unknown_readers:'UNMEASURED', universal_secrecy:false, automatic_actions:false }
  });
  queueMicrotask(reconcileControls);
  return true;
}

if (host && doc) installAshResearchDemo();
