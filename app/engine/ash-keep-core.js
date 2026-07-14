import { canonicalDigest } from '../dome-world/ash/canonical-json.js';
import { clone, freeze, integer, randomId, ratio, text } from './aperture-v31-core.js';

export const ASH_KEEP_VERSION = 'v1.0-alpha';
export const CASE_MAP_SCHEMA = 'td613.ash.case-map/v0.1';
export const ROOM_RULES_SCHEMA = 'td613.ash.room-rules/v0.1';
export const ROUTE_MEMORY_SCHEMA = 'td613.ash.route-memory/v0.1';
export const READER_PROFILE_SCHEMA = 'td613.aperture.reader-profile/v0.1';
export const REBUILD_TEST_SCHEMA = 'td613.aperture.rebuild-test/v0.1';
export const REBUILD_REPLAY_SCHEMA = 'td613.aperture.rebuild-replay/v0.1';
export const LINK_CHECK_SCHEMA = 'td613.hush.link-check/v0.1';
export const UNEXPECTED_DETAIL_SCHEMA = 'td613.ash.unexpected-detail/v0.1';

export const CASE_PROFILES = Object.freeze({
  investigation: 'Case Map',
  research: 'Research Map',
  legal: 'Matter Map',
  archive: 'Archive Map',
  organizing: 'Organizing Map',
  unpublished: 'Work Map'
});

export const NODE_TYPES = Object.freeze(['entity', 'artifact', 'event', 'claim', 'hypothesis', 'evidence-gap', 'source', 'intended-action']);
export const READER_CLASSES = Object.freeze(['deterministic-baseline', 'ash-v06-quick-scan', 'local-hush', 'imported-provider-output', 'synthetic-external-provider']);
export const OBSERVATION_STATES = Object.freeze(['OBSERVED', 'NULL', 'REJECTED', 'MISSING', 'CONTRADICTORY', 'UNCAPTURED', 'ENCODER_REQUIRED', 'UNRESOLVED']);
export const EXPOSURE_DIMENSIONS = Object.freeze(['nodes', 'relationships', 'room_bridges', 'source_style_linkage', 'chronology', 'hypothesis_structure', 'next_actions']);

const DOMAINS = Object.freeze({
  caseMap: 'TD613:ASH-KEEP:CASE-MAP:v1',
  roomRules: 'TD613:ASH-KEEP:ROOM-RULES:v1',
  routeMemory: 'TD613:ASH-KEEP:ROUTE-MEMORY:v1',
  reader: 'TD613:ASH-KEEP:READER:v1',
  rebuild: 'TD613:ASH-KEEP:REBUILD:v1',
  replay: 'TD613:ASH-KEEP:REBUILD-REPLAY:v1',
  link: 'TD613:ASH-KEEP:LINK-CHECK:v1',
  unexpected: 'TD613:ASH-KEEP:UNEXPECTED-DETAIL:v1'
});

const SHA256 = /^sha256:[0-9a-f]{64}$/;
const OPAQUE_ID = /^[a-z][a-z0-9_]{2,127}$/;

function unique(values = []) {
  return [...new Set(values.map(value => String(value).trim()).filter(Boolean))];
}

function requireId(value, label) {
  const output = text(value, label);
  if (!OPAQUE_ID.test(output)) throw new Error(`${label} must be an opaque identifier.`);
  return output;
}

function requireDigest(value, label) {
  const output = String(value || '');
  if (!SHA256.test(output)) throw new Error(`${label} must be SHA-256.`);
  return output;
}

function now(value) {
  return value || new Date().toISOString();
}

function without(value, field) {
  const output = clone(value);
  delete output[field];
  return output;
}

async function sealRecord(domain, value, field, options) {
  value[field] = await canonicalDigest(domain, without(value, field), options);
  return freeze(value);
}

async function verifyRecord(domain, value, field, schema, options) {
  if (!value || value.schema !== schema || !SHA256.test(String(value[field] || ''))) return false;
  return value[field] === await canonicalDigest(domain, without(value, field), options);
}

function evidenceRecord(input = {}) {
  return {
    source_status: String(input.sourceStatus || 'SUPPLIED').toUpperCase(),
    evidence_basis: unique(input.evidenceBasis || []),
    observations: clone(input.observations || []),
    missingness: unique(input.missingness || []),
    alternatives: unique(input.alternatives || []),
    open_questions: unique(input.openQuestions || []),
    operator_notes: unique(input.operatorNotes || []),
    closure: { required: true, status: input.closureStatus || 'OPEN' }
  };
}

function normalizeNode(node, roomIds, index) {
  const id = requireId(node?.id, `Node ${index} ID`);
  const type = String(node?.type || 'claim');
  if (!NODE_TYPES.includes(type)) throw new Error(`Unsupported node type: ${type}`);
  const roomId = requireId(node?.room_id, `Node ${id} room ID`);
  if (!roomIds.has(roomId)) throw new Error(`Node ${id} references an unknown room.`);
  return {
    id,
    type,
    label: text(node?.label, `Node ${id} label`),
    notes: String(node?.notes || ''),
    room_id: roomId,
    sensitivity: String(node?.sensitivity || 'PRIVATE').toUpperCase(),
    source_status: String(node?.source_status || 'SUPPLIED').toUpperCase(),
    confidence_posture: String(node?.confidence_posture || 'OPEN').toUpperCase(),
    custody_reference: node?.custody_reference ? String(node.custody_reference) : null,
    disclosure_state: String(node?.disclosure_state || 'LOCAL').toUpperCase(),
    chronology_index: integer(node?.chronology_index ?? index, `Node ${id} chronology index`, { min: 0 })
  };
}

function normalizeRelationship(edge, nodeIds, index) {
  const id = requireId(edge?.id, `Relationship ${index} ID`);
  const from = requireId(edge?.from, `Relationship ${id} from`);
  const to = requireId(edge?.to, `Relationship ${id} to`);
  if (!nodeIds.has(from) || !nodeIds.has(to)) throw new Error(`Relationship ${id} references an unknown node.`);
  return {
    id,
    from,
    to,
    type: text(edge?.type, `Relationship ${id} type`),
    room_id: edge?.room_id ? requireId(edge.room_id, `Relationship ${id} room ID`) : null,
    sensitivity: String(edge?.sensitivity || 'PRIVATE').toUpperCase(),
    source_status: String(edge?.source_status || 'SUPPLIED').toUpperCase(),
    confidence_posture: String(edge?.confidence_posture || 'OPEN').toUpperCase(),
    custody_reference: edge?.custody_reference ? String(edge.custody_reference) : null,
    disclosure_state: String(edge?.disclosure_state || 'LOCAL').toUpperCase()
  };
}

export async function compileCaseMap(input = {}, options = {}) {
  if (!Object.hasOwn(CASE_PROFILES, input.profile)) throw new Error('Unsupported Ash Keep profile.');
  const rooms = (input.rooms || []).map((room, index) => ({
    id: requireId(room?.id, `Room ${index} ID`),
    label: text(room?.label, `Room ${index} label`),
    color: String(room?.color || '#76ead4'),
    notes: String(room?.notes || '')
  }));
  if (!rooms.length) throw new Error('A Case Map requires at least one Room.');
  const roomIds = new Set(rooms.map(room => room.id));
  if (roomIds.size !== rooms.length) throw new Error('Room IDs must be unique.');
  const nodes = (input.nodes || []).map((node, index) => normalizeNode(node, roomIds, index));
  const nodeIds = new Set(nodes.map(node => node.id));
  if (nodeIds.size !== nodes.length) throw new Error('Node IDs must be unique.');
  const relationships = (input.relationships || []).map((edge, index) => normalizeRelationship(edge, nodeIds, index));
  if (new Set(relationships.map(edge => edge.id)).size !== relationships.length) throw new Error('Relationship IDs must be unique.');
  const record = {
    schema: CASE_MAP_SCHEMA,
    version: ASH_KEEP_VERSION,
    case_id: input.caseId || randomId('case_', options.cryptoImpl || globalThis.crypto),
    profile: input.profile,
    object_label: CASE_PROFILES[input.profile],
    title: text(input.title, 'Case title'),
    created_at: now(input.createdAt),
    updated_at: now(input.updatedAt || input.createdAt),
    custody_reference: input.custodyReference ? String(input.custodyReference) : null,
    tamper_state: String(input.tamperState || 'CLEAR').toUpperCase(),
    rooms,
    nodes,
    relationships,
    private_chronology: (input.privateChronology || []).map(String),
    intended_actions: unique(input.intendedActions || []),
    ...evidenceRecord(input),
    case_map_digest: null
  };
  return sealRecord(DOMAINS.caseMap, record, 'case_map_digest', options);
}

export const verifyCaseMap = (value, options = {}) => verifyRecord(DOMAINS.caseMap, value, 'case_map_digest', CASE_MAP_SCHEMA, options);

export async function compileRoomRules(input = {}, options = {}) {
  const rules = (input.rules || []).map((rule, index) => ({
    route_id: requireId(rule?.route_id, `Room Rule ${index} route ID`),
    allowed_room_ids: unique(rule?.allowed_room_ids || []).map(id => requireId(id, 'Allowed Room ID')),
    local_link_keys: unique(rule?.local_link_keys || []).map(id => requireId(id, 'Local link key')),
    allowed_node_types: unique(rule?.allowed_node_types || []),
    time_posture: String(rule?.time_posture || 'OPERATOR_CHOSEN').toUpperCase()
  }));
  const record = {
    schema: ROOM_RULES_SCHEMA,
    case_id: requireId(input.caseId, 'Case ID'),
    created_at: now(input.createdAt),
    rules,
    timing_shield: {
      local_drafting: input.timingShield?.local_drafting !== false,
      batching_available: input.timingShield?.batching_available !== false,
      timestamp_minimization_available: input.timingShield?.timestamp_minimization_available !== false,
      cover_traffic: false,
      chronology_falsification: false,
      silent_urgent_delay: false
    },
    ...evidenceRecord(input),
    rules_digest: null
  };
  return sealRecord(DOMAINS.roomRules, record, 'rules_digest', options);
}

export const verifyRoomRules = (value, options = {}) => verifyRecord(DOMAINS.roomRules, value, 'rules_digest', ROOM_RULES_SCHEMA, options);

export async function compileRouteMemory(input = {}, options = {}) {
  const entries = (input.entries || []).map((entry, index) => ({
    entry_id: entry?.entry_id || randomId('route_', options.cryptoImpl || globalThis.crypto),
    draft_digest: requireDigest(entry?.draft_digest, `Route entry ${index} draft digest`),
    route_id: requireId(entry?.route_id, `Route entry ${index} route ID`),
    purpose: text(entry?.purpose, `Route entry ${index} purpose`),
    recipient_class: text(entry?.recipient_class, `Route entry ${index} recipient class`),
    recorded_at: now(entry?.recorded_at),
    time_posture: String(entry?.time_posture || 'LOCAL_CLOCK').toUpperCase(),
    disclosed_opaque_references: unique(entry?.disclosed_opaque_references || []).map(id => requireId(id, 'Disclosed reference')),
    hush_receipt_reference: entry?.hush_receipt_reference ? String(entry.hush_receipt_reference) : null,
    recall_state: String(entry?.recall_state || 'NOT_RECALLED').toUpperCase(),
    record_class: 'WHAT_ACTUALLY_LEFT'
  }));
  const record = {
    schema: ROUTE_MEMORY_SCHEMA,
    case_id: requireId(input.caseId, 'Case ID'),
    created_at: now(input.createdAt),
    entries,
    controlled_test_recovery: clone(input.controlledTestRecovery || []),
    operator_declared_assumptions: unique(input.operatorDeclaredAssumptions || []),
    unknown: unique(input.unknown || []),
    ...evidenceRecord(input),
    route_memory_digest: null
  };
  return sealRecord(DOMAINS.routeMemory, record, 'route_memory_digest', options);
}

export const verifyRouteMemory = (value, options = {}) => verifyRecord(DOMAINS.routeMemory, value, 'route_memory_digest', ROUTE_MEMORY_SCHEMA, options);

export async function compileReaderProfile(input = {}, options = {}) {
  if (!READER_CLASSES.includes(input.readerClass)) throw new Error('Unsupported Reader class.');
  const record = {
    schema: READER_PROFILE_SCHEMA,
    reader_id: input.readerId || randomId('reader_', options.cryptoImpl || globalThis.crypto),
    label: text(input.label, 'Reader label'),
    reader_class: input.readerClass,
    version: String(input.version || '1'),
    source_status: String(input.sourceStatus || (input.readerClass.startsWith('synthetic') ? 'SIMULATED' : 'SUPPLIED')).toUpperCase(),
    repeat_count: integer(input.repeatCount ?? 1, 'Reader repeat count', { min: 1, max: 1000 }),
    seeded: Boolean(input.seeded),
    provider_receipt_reference: input.providerReceiptReference ? String(input.providerReceiptReference) : null,
    ...evidenceRecord(input),
    reader_digest: null
  };
  return sealRecord(DOMAINS.reader, record, 'reader_digest', options);
}

export const verifyReaderProfile = (value, options = {}) => verifyRecord(DOMAINS.reader, value, 'reader_digest', READER_PROFILE_SCHEMA, options);

function recoveredSet(value, field) {
  return new Set(unique(value?.[field] || []));
}

function vectorFor(caseMap, recovered) {
  const nodeIds = recoveredSet(recovered, 'node_ids');
  const relationshipIds = recoveredSet(recovered, 'relationship_ids');
  const nodeById = new Map(caseMap.nodes.map(node => [node.id, node]));
  const recoveredEdges = caseMap.relationships.filter(edge => relationshipIds.has(edge.id));
  const roomBridges = recoveredEdges.filter(edge => nodeById.get(edge.from)?.room_id !== nodeById.get(edge.to)?.room_id).length;
  const typeCount = type => [...nodeIds].filter(id => nodeById.get(id)?.type === type).length;
  const denominator = value => Math.max(1, value);
  const bridgeTotal = caseMap.relationships.filter(edge => nodeById.get(edge.from)?.room_id !== nodeById.get(edge.to)?.room_id).length;
  return {
    nodes: ratio(nodeIds.size, denominator(caseMap.nodes.length)),
    relationships: ratio(recoveredEdges.length, denominator(caseMap.relationships.length)),
    room_bridges: ratio(roomBridges, denominator(bridgeTotal)),
    source_style_linkage: ratio(integer(recovered?.source_style_linkage ?? 0, 'Source/style linkage', { min: 0, max: 1000 }), 1000),
    chronology: ratio(integer(recovered?.chronology ?? 0, 'Chronology recovery', { min: 0, max: 1000 }), 1000),
    hypothesis_structure: ratio(typeCount('hypothesis'), denominator(caseMap.nodes.filter(node => node.type === 'hypothesis').length)),
    next_actions: ratio(typeCount('intended-action'), denominator(caseMap.nodes.filter(node => node.type === 'intended-action').length))
  };
}

function deltaVector(before, after) {
  return Object.fromEntries(EXPOSURE_DIMENSIONS.map(dimension => {
    const left = before[dimension];
    const right = after[dimension];
    return [dimension, {
      numerator: right.numerator * left.denominator - left.numerator * right.denominator,
      denominator: right.denominator * left.denominator,
      direction: right.numerator * left.denominator > left.numerator * right.denominator ? 'INCREASE' : right.numerator * left.denominator < left.numerator * right.denominator ? 'DECREASE' : 'UNCHANGED'
    }];
  }));
}

export function runDeterministicReader({ caseMap, routeMemory, proposedReferences = [] }) {
  const beforeNodes = new Set(routeMemory.entries.flatMap(entry => entry.disclosed_opaque_references));
  const afterNodes = new Set([...beforeNodes, ...proposedReferences]);
  const inferEdges = set => caseMap.relationships.filter(edge => set.has(edge.from) && set.has(edge.to)).map(edge => edge.id);
  const chronology = set => {
    const selected = caseMap.nodes.filter(node => set.has(node.id));
    return selected.length < 2 ? 0 : Math.min(1000, Math.round((selected.length / Math.max(1, caseMap.nodes.length)) * 1000));
  };
  return {
    before: { node_ids: [...beforeNodes], relationship_ids: inferEdges(beforeNodes), chronology: chronology(beforeNodes), source_style_linkage: 0 },
    after: { node_ids: [...afterNodes], relationship_ids: inferEdges(afterNodes), chronology: chronology(afterNodes), source_style_linkage: 0 }
  };
}

export async function compileRebuildTest(input = {}, options = {}) {
  if (!input.caseMap || input.caseMap.schema !== CASE_MAP_SCHEMA) throw new Error('Rebuild Test requires a Case Map.');
  if (!input.reader || input.reader.schema !== READER_PROFILE_SCHEMA) throw new Error('Rebuild Test requires a Reader profile.');
  const trials = (input.trials || []).map((trial, index) => {
    const state = String(trial?.state || 'OBSERVED').toUpperCase();
    if (!OBSERVATION_STATES.includes(state)) throw new Error(`Unsupported observation state: ${state}`);
    const before = vectorFor(input.caseMap, trial?.before || {});
    const after = vectorFor(input.caseMap, trial?.after || {});
    return {
      trial_id: trial?.trial_id || `trial_${index + 1}`,
      seed: integer(trial?.seed ?? index + 1, `Trial ${index} seed`, { min: 0 }),
      state,
      benign_control: Boolean(trial?.benign_control),
      held_out: Boolean(trial?.held_out),
      before,
      after,
      change: deltaVector(before, after),
      recovered_opaque_references: unique(trial?.after?.node_ids || []),
      observations: clone(trial?.observations || []),
      missingness: unique(trial?.missingness || [])
    };
  });
  if (!trials.length) throw new Error('A Rebuild Test requires at least one trial.');
  const observed = trials.filter(trial => trial.state === 'OBSERVED');
  const calibration = {
    preregistered_fixture: Boolean(input.calibration?.preregisteredFixture),
    repeated_trials: observed.length >= 2,
    benign_control: trials.some(trial => trial.benign_control),
    held_out: trials.some(trial => trial.held_out),
    source_drift_check: Boolean(input.calibration?.sourceDriftCheck),
    alternative_reader: Boolean(input.calibration?.alternativeReader),
    exact_thresholds: clone(input.calibration?.exactThresholds || {})
  };
  const calibrated = Object.values(calibration).slice(0, 6).every(Boolean) && Object.keys(calibration.exact_thresholds).length > 0;
  const record = {
    schema: REBUILD_TEST_SCHEMA,
    test_id: input.testId || randomId('rebuild_', options.cryptoImpl || globalThis.crypto),
    case_id: input.caseMap.case_id,
    case_map_digest: input.caseMap.case_map_digest,
    route_memory_reference: input.routeMemory?.route_memory_digest || null,
    reader: { reader_id: input.reader.reader_id, reader_class: input.reader.reader_class, reader_digest: input.reader.reader_digest },
    created_at: now(input.createdAt),
    mode: input.reader.reader_class === 'ash-v06-quick-scan' ? 'QUICK_SCAN' : 'REBUILD_TEST',
    source_drift_state: String(input.sourceDriftState || 'SOURCE_HELD').toUpperCase(),
    trials,
    signed_residue: clone(input.signedResidue || []),
    calibration,
    calibration_state: calibrated ? 'CALIBRATED_FOR_NAMED_FIXTURE' : 'NOT_ENOUGH_TEST_DATA',
    exposure_bands_active: calibrated,
    review_state: calibrated ? 'OPERATOR_REVIEW_REQUIRED' : 'OBSERVATIONS_AVAILABLE',
    automatic_hold: false,
    frequencies_are_named_reader_results: true,
    real_surveillance_probability: null,
    provider_acquisition_route: 'UNKNOWN',
    ...evidenceRecord(input),
    test_digest: null
  };
  return sealRecord(DOMAINS.rebuild, record, 'test_digest', options);
}

export const verifyRebuildTest = (value, options = {}) => verifyRecord(DOMAINS.rebuild, value, 'test_digest', REBUILD_TEST_SCHEMA, options);

export async function replayRebuildTest(value, input = {}, options = {}) {
  const verified = await verifyRebuildTest(value, options);
  const record = {
    schema: REBUILD_REPLAY_SCHEMA,
    replay_id: input.replayId || randomId('replay_', options.cryptoImpl || globalThis.crypto),
    created_at: now(input.createdAt),
    source_test_id: value?.test_id || null,
    source_test_digest: value?.test_digest || null,
    status: verified ? 'REPLAY_VERIFIED' : 'REPLAY_HELD',
    custody_state_restored: verified,
    graph_content_restored: false,
    reconstruction_reexecuted: false,
    observations: verified ? ['Receipt digest verified.'] : ['Receipt digest verification failed.'],
    missingness: [],
    alternatives: [],
    open_questions: verified ? [] : ['Which field changed after the test was sealed?'],
    closure: { required: true, status: 'OPEN' },
    replay_digest: null
  };
  return sealRecord(DOMAINS.replay, record, 'replay_digest', options);
}

export const verifyRebuildReplay = (value, options = {}) => verifyRecord(DOMAINS.replay, value, 'replay_digest', REBUILD_REPLAY_SCHEMA, options);

function trigrams(value) {
  const cleaned = String(value || '').toLocaleLowerCase().replace(/\s+/g, ' ').trim();
  const output = new Set();
  for (let index = 0; index <= cleaned.length - 3; index += 1) output.add(cleaned.slice(index, index + 3));
  return output;
}

export async function compileLinkCheck(input = {}, options = {}) {
  const left = trigrams(input.leftText);
  const right = trigrams(input.rightText);
  const shared = [...left].filter(value => right.has(value));
  const union = new Set([...left, ...right]);
  const record = {
    schema: LINK_CHECK_SCHEMA,
    check_id: input.checkId || randomId('link_', options.cryptoImpl || globalThis.crypto),
    created_at: now(input.createdAt),
    source_status: 'DERIVED',
    comparison_basis: 'browser-local character trigrams',
    shared_feature_count: shared.length,
    union_feature_count: union.size,
    linkability_vector: ratio(shared.length, Math.max(1, union.size)),
    result: union.size < 12 ? 'INSUFFICIENT_COMPARISON_TEXT' : 'COMPARISON_AVAILABLE',
    observations: shared.slice(0, 24),
    missingness: union.size < 12 ? ['comparison text length'] : [],
    alternatives: ['common language', 'shared genre', 'shared template', 'shared editor'],
    open_questions: [],
    operator_notes: [],
    closure: { required: true, status: 'OPEN' },
    check_digest: null
  };
  return sealRecord(DOMAINS.link, record, 'check_digest', options);
}

export const verifyLinkCheck = (value, options = {}) => verifyRecord(DOMAINS.link, value, 'check_digest', LINK_CHECK_SCHEMA, options);

export async function compileUnexpectedDetail(input = {}, options = {}) {
  const record = {
    schema: UNEXPECTED_DETAIL_SCHEMA,
    event_id: input.eventId || randomId('detail_', options.cryptoImpl || globalThis.crypto),
    case_id: requireId(input.caseId, 'Case ID'),
    created_at: now(input.createdAt),
    provider_receipt_reference: input.providerReceiptReference ? String(input.providerReceiptReference) : null,
    detail: text(input.detail, 'Unexpected detail'),
    detail_digest: await canonicalDigest('TD613:ASH-KEEP:UNEXPECTED-DETAIL-CONTENT:v1', { detail: text(input.detail, 'Unexpected detail') }, options),
    known_before_output: Boolean(input.knownBeforeOutput),
    later_corroboration: clone(input.laterCorroboration || null),
    acquisition_route: 'UNKNOWN',
    actor_attribution: null,
    ...evidenceRecord({ ...input, sourceStatus: 'OBSERVED' }),
    event_digest: null
  };
  return sealRecord(DOMAINS.unexpected, record, 'event_digest', options);
}

export const verifyUnexpectedDetail = (value, options = {}) => verifyRecord(DOMAINS.unexpected, value, 'event_digest', UNEXPECTED_DETAIL_SCHEMA, options);
