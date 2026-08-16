import { containsSensitiveContext } from '../../ash-a15-empirical-profile-journeys.js';

export const A15_R0_SCHEMAS = Object.freeze({
  fixture: 'td613.ash.a15-r0.governed-task-fixture/v0.1',
  descriptor: 'td613.ash.a15-r0.projection-descriptor/v0.1',
  event: 'td613.ash.a15-r0.observable-event/v0.1',
  runReceipt: 'td613.ash.a15-r0.projection-run-receipt/v0.1',
  owner: 'td613.ash.a15-r0.interaction-owner-record/v0.1',
  rejection: 'td613.ash.a15-r0.operator-rejection-receipt/v0.1'
});

export const A15_R0_ACTION_SEQUENCE = Object.freeze([
  'ARRIVE',
  'BIND_REFERENCE',
  'FORM_RELATION',
  'COMPARE_ROUTE',
  'PRESERVE',
  'RETURN'
]);

export const A15_R0_AUTHORITY_FLAGS = Object.freeze({
  automatic_ash_action: false,
  raw_bytes_moved: false,
  external_send: false,
  stable_artifact_digest_exposed_to_flowcore: false,
  automatic_relation_binding: false,
  automatic_comparison: false,
  automatic_save: false,
  automatic_handoff: false,
  automatic_export: false,
  automatic_release: false,
  automatic_closure: false,
  release_authority_changed: false,
  destination_authority_changed: false,
  custody_silently_transferred: false
});

const PLAIN_OBJECT = '[object Object]';
const OPAQUE_ID = /^[a-z][a-z0-9_-]{2,127}$/;
const RFC3339_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const GOVERNED_FIXTURE_REQUIRED = Object.freeze([
  'schema',
  'fixture_id',
  'namespace',
  'source_status',
  'sensor_id',
  'authority_class',
  'case_id',
  'profile',
  'title',
  'created_at',
  'local_source',
  'question',
  'case_anchor',
  'rooms',
  'route_rules',
  'route_observations',
  'allowed_action_sequence',
  'action_times',
  'claim_ceiling',
  'authority'
]);
const FIXTURE_AUTHORITY_KEYS = Object.freeze([
  'automatic_ash_action',
  'automatic_relation_binding',
  'automatic_comparison',
  'automatic_save',
  'automatic_handoff',
  'automatic_export',
  'automatic_release',
  'automatic_closure',
  'human_review_required',
  'human_closure_required'
]);
const FIXTURE_NAMESPACE_KEYS = Object.freeze(['codepoint', 'surrogate_pair', 'meaning']);
const FIXTURE_LOCAL_SOURCE_KEYS = Object.freeze([
  'reference_id',
  'label',
  'posture',
  'raw_bytes_local',
  'raw_bytes_transport_authorized',
  'external_content'
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isPlainRecord(value) {
  if (Object.prototype.toString.call(value) !== PLAIN_OBJECT) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function assertJsonSafe(value, label = 'Value', seen = new WeakSet()) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
  if (typeof value === 'number') {
    assert(Number.isFinite(value), `${label} numbers must be finite.`);
    return;
  }
  if (Array.isArray(value)) {
    if (seen.has(value)) throw new Error(`${label} may not contain cycles.`);
    seen.add(value);
    value.forEach((entry, index) => assertJsonSafe(entry, `${label}[${index}]`, seen));
    seen.delete(value);
    return;
  }
  assert(isPlainRecord(value), `${label} must contain only JSON-safe plain records.`);
  if (seen.has(value)) throw new Error(`${label} may not contain cycles.`);
  seen.add(value);
  for (const [key, entry] of Object.entries(value)) assertJsonSafe(entry, `${label}.${key}`, seen);
  seen.delete(value);
}

function assertPlainRecord(value, label) {
  assert(isPlainRecord(value), `${label} must be a plain record.`);
  return value;
}

function assertString(value, label) {
  assert(typeof value === 'string' && value.length > 0, `${label} must be a non-empty string.`);
  return value;
}

function assertOpaqueId(value, label) {
  assertString(value, label);
  assert(OPAQUE_ID.test(value), `${label} must be an opaque identifier.`);
  return value;
}

function assertPattern(value, pattern, label) {
  assertString(value, label);
  assert(pattern.test(value), `${label} has an invalid namespace prefix.`);
  return value;
}

function assertDateTime(value, label) {
  assertString(value, label);
  assert(RFC3339_DATE_TIME.test(value) && Number.isFinite(Date.parse(value)), `${label} must be an RFC 3339 date-time.`);
  return value;
}

function assertFalse(value, label) {
  assert(value === false, `${label} must remain false.`);
}

function assertTrue(value, label) {
  assert(value === true, `${label} must remain true.`);
}

function assertRequiredFields(value, fields, label) {
  assertPlainRecord(value, label);
  for (const field of fields) assert(Object.hasOwn(value, field), `${label}.${field} is required.`);
}

function assertOnlyKeys(value, allowedKeys, label) {
  const allowed = new Set(allowedKeys);
  for (const key of Object.keys(value)) assert(allowed.has(key), `${label}.${key} is undeclared.`);
}

function assertNoLiveExternalContent(value) {
  const serialized = JSON.stringify(value);
  assert(!/\b(?:https?|wss?|ftp):\/\//i.test(serialized), 'A15-R0 fixtures may not contain live external content.');
}

function assertAuthorityClosed(authority, label = 'Authority', allowedKeys = null) {
  assertPlainRecord(authority, label);
  if (allowedKeys) assertOnlyKeys(authority, allowedKeys, label);
  for (const [key, expected] of Object.entries(A15_R0_AUTHORITY_FLAGS)) {
    if (Object.hasOwn(authority, key)) assert(authority[key] === expected, `${label}.${key} must remain ${expected}.`);
  }
  for (const key of [
    'automatic_ash_action',
    'automatic_relation_binding',
    'automatic_comparison',
    'automatic_save',
    'automatic_handoff',
    'automatic_export',
    'automatic_release',
    'automatic_closure'
  ]) assertFalse(authority[key], `${label}.${key}`);
}

export function validateGovernedTaskFixture(value) {
  const fixture = assertPlainRecord(value, 'Governed task fixture');
  assertJsonSafe(fixture, 'Governed task fixture');
  assertRequiredFields(fixture, GOVERNED_FIXTURE_REQUIRED, 'Governed task fixture');
  assertOnlyKeys(fixture, GOVERNED_FIXTURE_REQUIRED, 'Governed task fixture');
  assert(fixture.schema === A15_R0_SCHEMAS.fixture, 'Unsupported governed task fixture schema.');
  assertPattern(fixture.fixture_id, /^a15r0_fixture_/, 'Fixture ID');
  assertPattern(fixture.case_id, /^case_/, 'Case ID');
  assert(fixture.source_status === 'SIMULATED', 'The A15-R0 fixture must remain SIMULATED.');
  assert(fixture.sensor_id === 'simulated-fixture', 'The fixture sensor must remain simulated-fixture.');
  assert(fixture.authority_class === 'A2_DERIVATIONAL', 'The fixture authority class must remain A2_DERIVATIONAL.');
  assert(fixture.profile === 'research', 'The governed fixture profile must remain research.');
  assertString(fixture.title, 'Fixture title');
  assertDateTime(fixture.created_at, 'Fixture created_at');

  assertRequiredFields(fixture.namespace, FIXTURE_NAMESPACE_KEYS, 'Fixture namespace');
  assertOnlyKeys(fixture.namespace, FIXTURE_NAMESPACE_KEYS, 'Fixture namespace');
  assert(fixture.namespace.codepoint === 'U+10D613', 'The TD613 codepoint changed.');
  assert(fixture.namespace.surrogate_pair === '\\uDBF5\\uDE13', 'The TD613 surrogate pair changed.');
  assert(fixture.namespace.meaning === 'TD613 = Tauric Diana 613', 'The TD613 namespace meaning changed.');

  assertRequiredFields(fixture.local_source, FIXTURE_LOCAL_SOURCE_KEYS, 'Fixture local_source');
  assertOnlyKeys(fixture.local_source, FIXTURE_LOCAL_SOURCE_KEYS, 'Fixture local_source');
  assertString(fixture.local_source.reference_id, 'Fixture local_source.reference_id');
  assertString(fixture.local_source.label, 'Fixture local_source.label');
  assert(fixture.local_source.posture === 'DECLARED_REFERENCE_ONLY', 'Fixture local_source posture changed.');
  assert(fixture.local_source.raw_bytes_local === true, 'Synthetic raw-byte posture must remain local.');
  assertFalse(fixture.local_source.raw_bytes_transport_authorized, 'Raw-byte transport authorization');
  assertFalse(fixture.local_source.external_content, 'External content posture');

  for (const [label, record] of [['question', fixture.question], ['case_anchor', fixture.case_anchor]]) {
    assertPlainRecord(record, `Fixture ${label}`);
    assertString(record.node_id, `Fixture ${label}.node_id`);
    assertString(record.label, `Fixture ${label}.label`);
  }

  assert(Array.isArray(fixture.rooms) && fixture.rooms.length >= 2, 'The fixture requires declared Rooms.');
  fixture.rooms.forEach((room, index) => {
    assertPlainRecord(room, `Fixture rooms[${index}]`);
    assertString(room.id, `Fixture rooms[${index}].id`);
    assertString(room.label, `Fixture rooms[${index}].label`);
  });
  const roomIds = fixture.rooms.map(room => room.id);
  assert(new Set(roomIds).size === roomIds.length, 'Fixture Room IDs must be unique.');
  for (const requiredRoom of ['room_source', 'room_question']) {
    assert(roomIds.includes(requiredRoom), `Fixture must declare adapter-required Room ${requiredRoom}.`);
  }

  const fixtureNodes = new Map([
    [fixture.local_source.reference_id, { node_id: fixture.local_source.reference_id, type: 'source', room_id: 'room_source' }],
    [fixture.question.node_id, { node_id: fixture.question.node_id, type: 'claim', room_id: 'room_question' }],
    [fixture.case_anchor.node_id, { node_id: fixture.case_anchor.node_id, type: 'entity', room_id: 'room_source' }]
  ]);
  assert(fixtureNodes.size === 3, 'Fixture source, question, and case-anchor node IDs must be unique.');

  assert(Array.isArray(fixture.route_rules) && fixture.route_rules.length === 2, 'The fixture requires exactly two declared route rules.');
  fixture.route_rules.forEach((rule, index) => {
    assertPlainRecord(rule, `Fixture route_rules[${index}]`);
    assertString(rule.route_id, `Fixture route_rules[${index}].route_id`);
    assert(Array.isArray(rule.allowed_room_ids), `Fixture route_rules[${index}].allowed_room_ids must be an array.`);
    assert(Array.isArray(rule.local_link_keys), `Fixture route_rules[${index}].local_link_keys must be an array.`);
    assert(Array.isArray(rule.allowed_node_types), `Fixture route_rules[${index}].allowed_node_types must be an array.`);
    assertString(rule.time_posture, `Fixture route_rules[${index}].time_posture`);
    rule.allowed_room_ids.forEach((roomId, roomIndex) => {
      assertString(roomId, `Fixture route_rules[${index}].allowed_room_ids[${roomIndex}]`);
      assert(roomIds.includes(roomId), `Fixture route_rules[${index}] references undeclared Room ${roomId}.`);
    });
    rule.allowed_node_types.forEach((nodeType, typeIndex) => assertString(nodeType, `Fixture route_rules[${index}].allowed_node_types[${typeIndex}]`));
    rule.local_link_keys.forEach((nodeId, linkIndex) => {
      assertString(nodeId, `Fixture route_rules[${index}].local_link_keys[${linkIndex}]`);
      assert(fixtureNodes.has(nodeId), `Fixture route_rules[${index}] local link ${nodeId} is undeclared.`);
    });
  });
  const ruleById = new Map(fixture.route_rules.map(rule => [rule.route_id, rule]));
  assert(ruleById.size === 2 && ruleById.has('route_a') && ruleById.has('route_b'), 'Fixture route rules must uniquely declare route_a and route_b.');

  assertPlainRecord(fixture.route_observations, 'Fixture route_observations');
  for (const routeId of ['route_a', 'route_b']) {
    const observation = assertPlainRecord(fixture.route_observations[routeId], `Fixture route_observations.${routeId}`);
    assertString(observation.label, `Fixture route_observations.${routeId}.label`);
    assert(Array.isArray(observation.proposed_references), `Fixture route_observations.${routeId}.proposed_references must be an array.`);
    assert(Array.isArray(observation.missingness), `Fixture route_observations.${routeId}.missingness must be an array.`);
    const rule = ruleById.get(routeId);
    observation.proposed_references.forEach((referenceId, referenceIndex) => {
      assertString(referenceId, `Fixture route_observations.${routeId}.proposed_references[${referenceIndex}]`);
      const node = fixtureNodes.get(referenceId);
      assert(node, `Fixture route_observations.${routeId} references undeclared node ${referenceId}.`);
      assert(rule.allowed_room_ids.includes(node.room_id), `Fixture route_observations.${routeId} reference ${referenceId} violates declared Room rules.`);
      assert(rule.allowed_node_types.includes(node.type), `Fixture route_observations.${routeId} reference ${referenceId} violates declared node-type rules.`);
    });
  }

  assert(JSON.stringify(fixture.allowed_action_sequence) === JSON.stringify(A15_R0_ACTION_SEQUENCE), 'The governed action sequence changed.');
  assertPlainRecord(fixture.action_times, 'Fixture action_times');
  for (const actionId of [...A15_R0_ACTION_SEQUENCE, 'REST', 'RESET']) {
    assertDateTime(fixture.action_times[actionId], `Fixture action_times.${actionId}`);
  }

  assert(Array.isArray(fixture.claim_ceiling) && fixture.claim_ceiling.length > 0, 'The fixture requires a visible claim ceiling.');
  fixture.claim_ceiling.forEach((entry, index) => assertString(entry, `Fixture claim_ceiling[${index}]`));
  assertRequiredFields(fixture.authority, FIXTURE_AUTHORITY_KEYS, 'Fixture authority');
  assertAuthorityClosed(fixture.authority, 'Fixture authority', FIXTURE_AUTHORITY_KEYS);
  assertTrue(fixture.authority.human_review_required, 'Fixture human review');
  assertTrue(fixture.authority.human_closure_required, 'Fixture human closure');
  assertNoLiveExternalContent(fixture);
  assert(!containsSensitiveContext(fixture), 'Sensitive or opaque context is not allowed in the A15-R0 fixture.');
  return fixture;
}

export function validateProjectionDescriptor(value) {
  const descriptor = assertPlainRecord(value, 'Projection descriptor');
  assert(descriptor.schema === A15_R0_SCHEMAS.descriptor, 'Unsupported projection descriptor schema.');
  assert(['A15_CONTROL', 'MINIMAL_ASH', 'PROTO_LOOM'].includes(descriptor.projection_id), 'Unknown projection descriptor.');
  assertFalse(descriptor.canonical, 'Projection canonical posture');
  assertTrue(descriptor.preview_only, 'Projection preview posture');
  assertTrue(descriptor.disposable, 'Projection disposal posture');
  assertFalse(descriptor.production_cutover_authorized, 'Projection production cutover');
  assertFalse(descriptor.deployment_authorized, 'Projection deployment authorization');
  assertTrue(descriptor.human_selection_required, 'Projection human selection');
  assert(Array.isArray(descriptor.declared_controls), 'Projection controls must be an array.');
  assert(Array.isArray(descriptor.declared_world_answers), 'Projection world answers must be an array.');
  if (descriptor.implementation_status === 'NOT_IMPLEMENTED') {
    assert(descriptor.declared_controls.length === 0, 'Unimplemented projections may not expose active controls.');
  }
  return descriptor;
}

export function validateInteractionOwnerRecord(value) {
  const record = assertPlainRecord(value, 'Interaction owner record');
  assert(record.schema === A15_R0_SCHEMAS.owner, 'Unsupported interaction owner schema.');
  assertOpaqueId(record.control_id, 'Control ID');
  assertString(record.projection_owner, 'Projection owner');
  assertString(record.action_owner, 'Action owner');
  assert(record.event_phase === 'bubble', 'Ordinary A15-R0 interactions must remain bubble-phase.');
  assertTrue(record.delegated, 'Interaction delegation');
  assertFalse(record.competing_owner_detected, 'Competing owner posture');
  return record;
}

export function validateProjectionRunReceipt(value) {
  const receipt = assertPlainRecord(value, 'Projection run receipt');
  assert(receipt.schema === A15_R0_SCHEMAS.runReceipt, 'Unsupported projection run receipt schema.');
  for (const field of ['receipt_id', 'fixture_id', 'case_id', 'action_id']) assertString(receipt[field], field);
  assertPlainRecord(receipt.state_before, 'Receipt state_before');
  assertPlainRecord(receipt.state_after, 'Receipt state_after');
  assert(receipt.source_status === 'SIMULATED', 'Projection run receipts must remain SIMULATED.');
  assertString(receipt.sensor_id, 'Receipt sensor ID');
  assert(['A1_OBSERVATIONAL', 'A2_DERIVATIONAL'].includes(receipt.authority_class), 'Unsupported receipt authority class.');
  for (const field of ['observations', 'missingness', 'alternatives', 'open_questions']) assert(Array.isArray(receipt[field]), `${field} must be an array.`);
  assertAuthorityClosed(receipt.authority, 'Receipt authority');
  assertTrue(receipt.human_closure_required, 'Receipt human closure');
  return receipt;
}

export function validateObservableEvent(value) {
  const event = assertPlainRecord(value, 'Observable event');
  assert(event.schema === A15_R0_SCHEMAS.event, 'Unsupported observable event schema.');
  for (const field of ['event_id', 'run_id', 'projection_id', 'task_state_before', 'control_id', 'gesture', 'action_id', 'kernel_receipt_id', 'world_answer_id']) {
    assertString(event[field], `Observable event ${field}`);
  }
  assert(typeof event.control_visible === 'boolean', 'control_visible must be boolean.');
  assert(typeof event.control_enabled === 'boolean', 'control_enabled must be boolean.');
  assert(Number.isSafeInteger(event.action_to_consequence_distance) && event.action_to_consequence_distance >= 0, 'action_to_consequence_distance must be a non-negative safe integer.');
  assert(event.source_status === 'OBSERVED', 'Interface events must remain OBSERVED.');
  assert(event.authority_class === 'A1_OBSERVATIONAL', 'Interface events must remain A1_OBSERVATIONAL.');
  assert(Array.isArray(event.missingness), 'Observable event missingness must be an array.');
  return event;
}

export function validateOperatorRejectionReceipt(value) {
  const receipt = assertPlainRecord(value, 'Operator rejection receipt');
  assert(receipt.schema === A15_R0_SCHEMAS.rejection, 'Unsupported operator rejection receipt schema.');
  assert(receipt.a15_technical_production_closure === 'PASSED', 'A15 technical closure must remain PASSED.');
  assert(receipt.a15_operator_acceptance === 'FAILED', 'A15 operator acceptance must remain FAILED.');
  assert(receipt.current_a15_shell === 'WITNESS_NOT_ACCEPTED', 'The A15 shell must remain a non-accepted witness.');
  assert(receipt.a16 === 'HELD' && receipt.golden_egg === 'HELD', 'Future stages must remain held.');
  assertFalse(receipt.production_action, 'Operator rejection production action');
  assertFalse(receipt.deployment_action, 'Operator rejection deployment action');
  assertTrue(receipt.human_closure_required, 'Operator rejection human closure');
  return receipt;
}

export function deepFreeze(value, seen = new WeakSet()) {
  if (value === null || (typeof value !== 'object' && typeof value !== 'function')) return value;
  if (seen.has(value)) return value;
  seen.add(value);
  for (const key of Reflect.ownKeys(value)) deepFreeze(value[key], seen);
  return Object.freeze(value);
}

export function immutableCopy(value) {
  return deepFreeze(structuredClone(value));
}
