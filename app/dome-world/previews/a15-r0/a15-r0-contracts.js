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

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isPlainRecord(value) {
  if (Object.prototype.toString.call(value) !== PLAIN_OBJECT) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function assertJsonSafe(value, label = 'Value', seen = new WeakSet()) {
  if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) return;
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

function assertFalse(value, label) {
  assert(value === false, `${label} must remain false.`);
}

function assertTrue(value, label) {
  assert(value === true, `${label} must remain true.`);
}

function assertNoLiveExternalContent(value) {
  const serialized = JSON.stringify(value);
  assert(!/\b(?:https?|wss?|ftp):\/\//i.test(serialized), 'A15-R0 fixtures may not contain live external content.');
}

function assertAuthorityClosed(authority, label = 'Authority') {
  assertPlainRecord(authority, label);
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
  assert(fixture.schema === A15_R0_SCHEMAS.fixture, 'Unsupported governed task fixture schema.');
  assertOpaqueId(fixture.fixture_id, 'Fixture ID');
  assertOpaqueId(fixture.case_id, 'Case ID');
  assert(fixture.source_status === 'SIMULATED', 'The A15-R0 fixture must remain SIMULATED.');
  assert(fixture.sensor_id === 'simulated-fixture', 'The fixture sensor must remain simulated-fixture.');
  assert(fixture.authority_class === 'A2_DERIVATIONAL', 'The fixture authority class must remain A2_DERIVATIONAL.');
  assert(fixture.namespace?.codepoint === 'U+10D613', 'The TD613 codepoint changed.');
  assert(fixture.namespace?.surrogate_pair === '\\uDBF5\\uDE13', 'The TD613 surrogate pair changed.');
  assert(fixture.namespace?.meaning === 'TD613 = Tauric Diana 613', 'The TD613 namespace meaning changed.');
  assert(fixture.local_source?.raw_bytes_local === true, 'Synthetic raw-byte posture must remain local.');
  assertFalse(fixture.local_source?.raw_bytes_transport_authorized, 'Raw-byte transport authorization');
  assertFalse(fixture.local_source?.external_content, 'External content posture');
  assert(Array.isArray(fixture.rooms) && fixture.rooms.length >= 2, 'The fixture requires declared Rooms.');
  assert(Array.isArray(fixture.route_rules) && fixture.route_rules.length === 2, 'The fixture requires exactly two declared route rules.');
  assert(JSON.stringify(fixture.allowed_action_sequence) === JSON.stringify(A15_R0_ACTION_SEQUENCE), 'The governed action sequence changed.');
  assert(Array.isArray(fixture.claim_ceiling) && fixture.claim_ceiling.length > 0, 'The fixture requires a visible claim ceiling.');
  assertAuthorityClosed(fixture.authority, 'Fixture authority');
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

export function immutableCopy(value) {
  return Object.freeze(structuredClone(value));
}
