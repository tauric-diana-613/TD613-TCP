import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import {
  inspectLoomInstrumentReceiver, auditLoomInstrumentCompression,
  compileLoomInstrumentProfile, expandLoomInstrumentProfile,
  prepareLoomFireGate, inspectLoomFireGateWitness, runLoomLocalExecutionBenchmark
} from '../app/engine/loom-instrument-governance.js';
import { createLoomAiGovernance, createPortableLoomAiPacket } from '../app/dome-world/holonomy-loom/ai-handoff.js';

const sourceRevision = '9824dfa0f427c8b944ff5c7fdfd43719b2b41418';
const environment = { crypto: webcrypto };
async function portable() {
  const input = {
    task: 'Compare the fictional completion record and name missing downstream evidence.',
    documents: [{ id: 'selected', name: 'selected.log', text: '09:12 acknowledged. Downstream effect is unknown.' }],
    rules: ['Use only selected evidence; source provenance is separate from path provenance.']
  };
  input.governance = await createLoomAiGovernance(input, { withheldDocumentCount: 2 }, environment);
  return createPortableLoomAiPacket(input);
}
const stages = () => ({
  states: [
    { id: 'current', conditioning: { stage: 'ADMITTED', head: 'CURRENT', surface: 'same-visible-reply' }, support: ['REST', 'EXIT', 'EXPORT_CURRENT'] },
    { id: 'stale', conditioning: { stage: 'ADMITTED', head: 'STALE', surface: 'same-visible-reply' }, support: ['REST', 'EXIT', 'REPAIR_STALE'] }
  ],
  retain: ['surface']
});
const preparation = () => ({
  episode_id: 'fictional-acquisition-1', source_revision: sourceRevision,
  question: 'Can two declared routes resolve the same fictional completion event?',
  routes: [{ id: 'external-route', kind: 'EXTERNAL_MEASUREMENT' }, { id: 'local-route', kind: 'LOCAL_MACHINE' }],
  measurements: [
    { id: 'effect', route_id: 'external-route', observable: 'Independently recorded downstream completion state' },
    { id: 'recovery', route_id: 'local-route', observable: 'Local HELD-to-ADMITTED receipt' }
  ]
});
const witness = () => ({
  episode_id: 'fictional-acquisition-1', source_revision: sourceRevision,
  route_id: 'external-route', measurement_id: 'effect', evidence_class: 'EXTERNAL_OBSERVATION',
  observed_at: '2026-10-02T00:00:00.000Z', source_reference: 'unfetched:caller-declared-effect-ledger',
  observation: 'Caller declares that the fictional effect was recorded.'
});

test('installed receiver recomputation remains a local representation finding with no custody or execution lift', async () => {
  const packet = await portable();
  const result = await inspectLoomInstrumentReceiver(packet, environment);
  assert.equal(result.outcome, 'CONSISTENT_REPRESENTATION');
  assert.equal(result.assay.selected_input_binding, 'INDEPENDENTLY_RECOMPUTED');
  assert.equal(result.assay.portable_assurance, 'INDEPENDENTLY_RECONSTRUCTED');
  assert.equal(result.assay.destination_enforcement, 'UNVERIFIED');
  assert.equal(result.evidence_boundary.source_authenticated, false);
  assert.equal(result.evidence_boundary.loom_admission_verified, false);
  assert.equal(result.evidence_boundary.external_execution_verified, false);
  assert.equal(result.evidence_boundary.actions_executed, false);
  assert.equal(packet.governance.withheld_document_count, 2);
  assert.throws(() => { result.assay.destination_enforcement = 'VERIFIED'; }, TypeError);
  for (const mutate of [
    value => { value.task += ' silently changed'; },
    value => { value.documents[0].text += ' altered'; },
    value => { value.rules.push('new instruction'); },
    value => { value.portability_assurance.destination_enforcement = 'VERIFIED'; },
    value => { delete value.governance; },
    value => { delete value.portability_assurance; }
  ]) {
    const changed = structuredClone(packet); mutate(changed);
    const held = await inspectLoomInstrumentReceiver(changed, environment);
    assert.equal(held.outcome, 'HELD');
    assert.equal(held.assay.action_executed, false);
    assert.equal(held.evidence_boundary.loom_admission_verified, false);
  }
});

test('a jointly reconstructed packet can pass recomputation while origin authenticity remains unearned', async () => {
  const packet = await portable();
  const forgedTogether = { task: 'A different fictional task.', documents: packet.documents, rules: packet.rules };
  forgedTogether.governance = await createLoomAiGovernance(forgedTogether, { withheldDocumentCount: 0 }, environment);
  const result = await inspectLoomInstrumentReceiver(createPortableLoomAiPacket(forgedTogether), environment);
  assert.equal(result.outcome, 'CONSISTENT_REPRESENTATION');
  assert.equal(result.evidence_boundary.source_authenticated, false);
  assert.equal(result.evidence_boundary.source_revision_authenticated, false);
  assert.equal(result.evidence_boundary.independent_human_witness_verified, false);
});

test('receiver wrapper refuses accessor and non-JSON intake without evaluating a caller getter', async () => {
  let reads = 0;
  const packet = {};
  Object.defineProperty(packet, 'task', { enumerable: true, get() { reads += 1; return 'a fabricated task'; } });
  assert.equal((await inspectLoomInstrumentReceiver(packet, environment)).outcome, 'HELD');
  assert.equal((await inspectLoomInstrumentReceiver(null, environment)).outcome, 'HELD');
  assert.equal(reads, 0);
});

test('occupied-state compression retains equal-cardinality lawful-action gaps and restores exactness only with distinguishing coordinates', () => {
  const input = stages();
  const result = auditLoomInstrumentCompression(input);
  assert.equal(result.verdict, 'HOLD');
  assert.equal(result.finite_audit.occupied_fibre_count, 1);
  assert.deepEqual(result.finite_audit.fibres[0].union, ['EXIT', 'EXPORT_CURRENT', 'REPAIR_STALE', 'REST']);
  assert.deepEqual(result.finite_audit.fibres[0].intersection, ['EXIT', 'REST']);
  assert.deepEqual(result.finite_audit.fibres[0].irreducible_gap, ['EXPORT_CURRENT', 'REPAIR_STALE']);
  const preserving = auditLoomInstrumentCompression({ states: input.states, retain: ['stage', 'head'] });
  assert.equal(preserving.verdict, 'CONSISTENT_DECLARATIONS');
  assert.equal(preserving.finite_audit.occupied_fibre_count, 2);
  assert.equal(preserving.evidence_boundary.stage_admission_verified, false);
  assert.equal(preserving.evidence_boundary.actions_executed, false);
  assert.deepEqual(input, stages());
  assert.throws(() => { result.finite_audit.fibres[0].irreducible_gap.pop(); }, TypeError);
  assert.deepEqual(auditLoomInstrumentCompression({ states: [...input.states].reverse().map(state => ({ ...state, support: [...state.support].reverse() })), retain: input.retain }), result);
});

test('compression wrapper refuses absent occupied support and malformed conditioning instead of inventing a rule', () => {
  assert.throws(() => auditLoomInstrumentCompression({ states: [], retain: [] }), /occupied/);
  assert.throws(() => auditLoomInstrumentCompression({ states: Array(1), retain: [] }), /dense/);
  assert.throws(() => auditLoomInstrumentCompression({ states: stages().states, retain: ['undeclared'] }), /retained coordinate/);
  assert.throws(() => auditLoomInstrumentCompression({ states: [...stages().states, stages().states[0]], retain: ['surface'] }), /Duplicate/);
  assert.throws(() => auditLoomInstrumentCompression({ states: [{ id: 'missing-support', conditioning: { stage: 'HELD' } }], retain: [] }), /array/);
});

test('Quick and Deep carry the entire canonical governance and continuation payload identically', async () => {
  const selected = await portable();
  const canonical = {
    packet: selected,
    governance: { source_revision: sourceRevision, predecessor_ref: 'continuation-1', stage: 'CONTINUE', admitted: false },
    continuation: { prior_result: { request_id: 'continuation-2', answer: 'The second fictional result.', missing_information: ['external effect ledger'] } },
    claim_ceiling: ['local receiver recomputation only'],
    route_history: ['Loom', 'continuation-1', 'continuation-2'],
    evidence: auditLoomInstrumentCompression(stages())
  };
  const before = structuredClone(canonical);
  const quick = compileLoomInstrumentProfile(canonical, { profile: 'quick' });
  const deep = compileLoomInstrumentProfile(canonical, { profile: 'deep' });
  assert.equal(quick.reasoning_effort, 'low');
  assert.equal(deep.reasoning_effort, 'high');
  assert.equal(quick.payload, deep.payload);
  assert.deepEqual(expandLoomInstrumentProfile(quick), canonical);
  assert.deepEqual(expandLoomInstrumentProfile(deep), canonical);
  assert.deepEqual(canonical, before);
  assert.equal(expandLoomInstrumentProfile(quick).evidence.finite_audit.fibres[0].gap_size, 2);
  assert.equal(expandLoomInstrumentProfile(quick).packet.governance.withheld_document_count, 2);
  assert.equal(quick.evidence_boundary.actions_executed, false);
  assert.throws(() => { expandLoomInstrumentProfile(quick).governance.admitted = true; }, TypeError);
});

test('profile vocabulary escaping is reversible for literal codes, collision prefixes, Unicode, keys, and unrelated fields', () => {
  const terms = ['source provenance', 'path provenance', 'system boundary', 'observation boundary', 'data plane', 'control plane', 'observed state', 'estimated state', 'unknown state', 'recovery and revalidation'];
  const cases = ['', '~', '~~', '~sp', '~rr~unknown', '~~~source provenance', 'à 𝄐 e\u0301 " \\ \n', ...terms];
  for (const first of cases) for (const second of cases) {
    const canonical = { [first]: second, untouched: [null, true, 42, [], {}, { local_label: `${first}~${second}` }] };
    assert.deepEqual(expandLoomInstrumentProfile(compileLoomInstrumentProfile(canonical, { profile: 'quick' })), canonical);
  }
});

test('profiles require explicit supported choices and reject forged effort, authority, or payload metadata', () => {
  const canonical = { task: 'source provenance', governance: { execution_allowed: false } };
  for (const profile of [undefined, null, '', 'auto', 'toString', '__proto__']) {
    assert.throws(() => compileLoomInstrumentProfile(canonical, { profile }), TypeError);
  }
  const quick = compileLoomInstrumentProfile(canonical, { profile: 'quick' });
  for (const mutate of [
    value => { value.reasoning_effort = 'high'; },
    value => { value.presentation_density = 'expanded'; },
    value => { value.evidence_boundary.actions_executed = true; },
    value => { value.canonical_characters += 1; },
    value => { value.payload += '~unknown'; },
    value => { value.execution_allowed = true; },
    value => { value.claim_ceiling = []; }
  ]) {
    const changed = structuredClone(quick); mutate(changed);
    assert.throws(() => expandLoomInstrumentProfile(changed), TypeError);
  }
});

test('profile JSON boundary rejects silent loss, execution-shaped objects, cycles, and oversized work', () => {
  let getterReads = 0;
  const accessor = {}; Object.defineProperty(accessor, 'secret', { enumerable: true, get() { getterReads += 1; return 'must not be read'; } });
  const hidden = {}; Object.defineProperty(hidden, 'hidden', { value: true });
  const symbol = { [Symbol('hidden')]: true };
  const cyclic = {}; cyclic.self = cyclic;
  const extraArray = []; extraArray.extra = true;
  for (const invalid of [
    { value: undefined }, { value: NaN }, { value: Infinity }, { value: -0 },
    { value: 1n }, { value: () => true }, { value: new Date() },
    { value: Array(1) }, { value: extraArray }, { value: cyclic }, accessor, hidden, symbol,
    { value: 'x'.repeat(512001) }, { values: Array.from({ length: 20001 }, () => 1) }
  ]) assert.throws(() => compileLoomInstrumentProfile(invalid, { profile: 'quick' }), TypeError);
  assert.equal(getterReads, 0);
  const projection = compileLoomInstrumentProfile({}, { profile: 'quick' });
  assert.throws(() => expandLoomInstrumentProfile({ ...projection, payload: `{"x":"${'~rr'.repeat(30000)}"}`, canonical_characters: 1 }), TypeError);
});

test('a lawful tilde-heavy payload still expands when its reversible encoding is larger than its canonical JSON', () => {
  const canonical = { selected: '~'.repeat(300000), governance: { execution_allowed: false } };
  const projection = compileLoomInstrumentProfile(canonical, { profile: 'quick' });
  assert.ok(projection.payload.length > 512000);
  assert.deepEqual(expandLoomInstrumentProfile(projection), canonical);
});

test('Fire Gate plans remain PREPARED and execution-held even with owner/SHI-shaped references', () => {
  const input = preparation();
  input.shi_reference = 'owner:approved:SHI:execute-now';
  const plan = prepareLoomFireGate(input);
  assert.equal(plan.state, 'PREPARED');
  assert.equal(plan.execution_state, 'EXECUTION_HELD');
  assert.equal(plan.execution_capability, 'NOT_INSTALLED');
  assert.equal(plan.shi_reference_state, 'DECLARED_UNAUTHENTICATED');
  assert.equal(plan.source_revision_state, 'DECLARED_UNAUTHENTICATED');
  assert.equal(plan.evidence_boundary.actions_executed, false);
  assert.equal(plan.evidence_boundary.external_execution_verified, false);
  assert.equal(plan.evidence_boundary.authority_transferred, false);
  assert.ok(plan.missing_witnesses.includes('AUTHENTICATED_SHI_MEMBRANE'));
  input.measurements[0].observable = 'caller later changed this';
  assert.equal(plan.measurements[0].observable, 'Independently recorded downstream completion state');
  assert.throws(() => { plan.execution_state = 'ALLOWED'; }, TypeError);
  assert.throws(() => prepareLoomFireGate({ ...preparation(), execution_allowed: true }), /unsupported field/);
});

test('Fire Gate preparation requires real route/measurement identities without inferring undeclared measurements', () => {
  for (const invalid of [
    { ...preparation(), routes: [] },
    { ...preparation(), measurements: Array(1) },
    { ...preparation(), routes: [{ id: 'x', kind: 'OWNER_AUTHORIZED' }] },
    { ...preparation(), measurements: [{ id: 'x', route_id: 'unregistered', observable: 'completion' }] },
    { ...preparation(), routes: [...preparation().routes, preparation().routes[0]] },
    { ...preparation(), measurements: [...preparation().measurements, preparation().measurements[0]] }
  ]) assert.throws(() => prepareLoomFireGate(invalid), TypeError);
  const value = preparation();
  assert.deepEqual(prepareLoomFireGate({ ...value, routes: [...value.routes].reverse(), measurements: [...value.measurements].reverse() }), prepareLoomFireGate(value));
});

test('matching external witness declarations never acquire independent observation, source authentication, or execution authority', () => {
  const plan = prepareLoomFireGate(preparation());
  const supplied = witness();
  const result = inspectLoomFireGateWitness({ plan, witness: supplied });
  assert.equal(result.state, 'CONSISTENT_DECLARATIONS');
  assert.equal(result.execution_state, 'EXECUTION_HELD');
  assert.equal(result.witness_authentication, 'NOT_PERFORMED');
  assert.equal(result.independent_external_witness_verified, false);
  assert.equal(result.evidence_boundary.external_execution_verified, false);
  assert.equal(result.evidence_boundary.source_authenticated, false);
  assert.equal(result.evidence_boundary.independent_human_witness_verified, false);
  assert.equal(result.evidence_boundary.actions_executed, false);
  supplied.observation = 'changed outside the receipt';
  assert.equal(result.witness.observation, witness().observation);
  assert.throws(() => { result.witness.evidence_class = 'VERIFIED_EXTERNAL'; }, TypeError);
});

test('witness intake retains mismatched episode, revision, route, measurement, and evidence-class failures', () => {
  const plan = prepareLoomFireGate(preparation());
  for (const [change, reason] of [
    [{ episode_id: 'other-episode' }, 'EPISODE_MISMATCH'],
    [{ source_revision: 'a'.repeat(40) }, 'SOURCE_REVISION_MISMATCH'],
    [{ route_id: 'missing-route' }, 'ROUTE_NOT_IN_PLAN'],
    [{ measurement_id: 'missing-measurement' }, 'MEASUREMENT_NOT_IN_PLAN'],
    [{ route_id: 'local-route', evidence_class: 'LOCAL_MACHINE' }, 'MEASUREMENT_ROUTE_MISMATCH'],
    [{ evidence_class: 'LOCAL_MACHINE' }, 'EVIDENCE_CLASS_ROUTE_MISMATCH'],
    [{ observed_at: '2026-02-30T00:00:00.000Z' }, 'FIRE_GATE_INPUT_INVALID'],
    [{ external_execution_verified: true }, 'FIRE_GATE_INPUT_INVALID']
  ]) {
    const report = inspectLoomFireGateWitness({ plan, witness: { ...witness(), ...change } });
    assert.equal(report.state, 'HELD');
    assert.ok(report.reasons.includes(reason), `${reason}: ${JSON.stringify(report.reasons)}`);
    assert.equal(report.execution_state, 'EXECUTION_HELD');
  }
});

test('a forged plan, naked local benchmark, and executable witness intake cannot cross the external membrane', () => {
  const plan = prepareLoomFireGate(preparation());
  let getterReads = 0;
  const accessor = {}; Object.defineProperty(accessor, 'observation', { enumerable: true, get() { getterReads += 1; return 'foreign evidence'; } });
  const promoted = structuredClone(plan); promoted.execution_capability = 'OWNER_VERIFIED';
  for (const input of [
    { plan: promoted, witness: witness() },
    { plan, witness: runLoomLocalExecutionBenchmark({ sourceRevision }) },
    { plan, witness: accessor },
    { plan, witness: null }, null
  ]) {
    const result = inspectLoomFireGateWitness(input);
    assert.equal(result.state, 'HELD');
    assert.equal(result.execution_state, 'EXECUTION_HELD');
    assert.equal(result.independent_external_witness_verified, false);
  }
  assert.equal(getterReads, 0);
});

test('local benchmark executes existing close/refusal/fresh-instance/recovery/defeat receipts while preserving origin and claim ceilings', () => {
  const report = runLoomLocalExecutionBenchmark({ sourceRevision });
  assert.equal(report.outcome, 'BOUNDED_LOCAL_MACHINE_EXECUTION_WITNESSES_ACQUIRED');
  assert.equal(report.local_governor_calls_executed, true);
  assert.equal(report.instances, 3);
  assert.equal(report.synthetic_origin, true);
  assert.equal(report.episode_state, 'CANDIDATE');
  assert.equal(report.witness_acquired, true);
  for (const coordinate of ['product_mutated', 'live_loom_mutated', 'right_of_resignation_established', 'safe_return_established', 'return_promoted', 'human_replication_promoted', 'external_host_enforcement_promoted', 'empirical_exteriority_promoted']) {
    assert.equal(report[coordinate], false, coordinate);
  }
  assert.equal(report.fresh_instance_from_frozen_origin, true);
  assert.equal(report.first_session_state_used_to_construct_second, false);
  const exit = report.episodes.exit;
  assert.equal(exit.participation.outcome, 'ADMITTED');
  assert.equal(exit.participation.ordinal, 1);
  assert.equal(exit.close.outcome, 'CLOSED');
  assert.equal(exit.close.ordinal, 2);
  assert.equal(exit.closed_probe.outcome, 'HELD');
  assert.equal(exit.closed_probe.ordinal, 3);
  assert.deepEqual(exit.closed_probe.reasons, ['SESSION_CLOSED']);
  assert.equal(exit.fresh_continuation.outcome, 'ADMITTED');
  assert.equal(exit.fresh_continuation.ordinal, 1);
  const recovery = report.episodes.recovery;
  assert.equal(recovery.seeded_drift.outcome, 'HELD');
  assert.ok(recovery.seeded_drift.reasons.includes('CONTROL_PLANE_DRIFT'));
  assert.equal(recovery.recovery_receipt.recovered, true);
  assert.equal(recovery.recovered_state.status, 'ACTIVE');
  assert.equal(recovery.defeat_probe.outcome, 'HELD');
  assert.equal(report.origin_control_preserved, true);
  for (const event of [exit.participation, exit.close, exit.closed_probe, exit.fresh_continuation, recovery.seeded_drift, recovery.recovery_receipt, recovery.defeat_probe]) {
    assert.equal(event.source_revision, sourceRevision);
    assert.equal(event.action_executed, false);
    assert.equal(event.release_authority, false);
  }
  assert.equal(report.evidence_boundary.external_execution_verified, false);
  assert.equal(report.evidence_boundary.independent_human_witness_verified, false);
  assert.equal(report.evidence_boundary.source_revision_authenticated, false);
  assert.equal(report.evidence_boundary.actions_executed, false);
  assert.deepEqual(report.missing_witnesses, ['INDEPENDENT_HUMAN_EXECUTION', 'EXTERNAL_HOST_ENFORCEMENT']);
  assert.throws(() => { recovery.recovery_receipt.recovered = false; }, TypeError);
  assert.throws(() => runLoomLocalExecutionBenchmark({ sourceRevision: 'session-root:' + 'a'.repeat(64) }), /sourceRevision/);
  assert.throws(() => runLoomLocalExecutionBenchmark({ sourceRevision, createLoomPortableGovernor: 'fake' }), /unsupported field/);
});
