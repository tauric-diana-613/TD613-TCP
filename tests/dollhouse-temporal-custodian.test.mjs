import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { auditTemporalLedgerNonRetroactivity, auditServiceJourneyChronology, runTemporalCustodianAudit } from '../app/engine/dollhouse-temporal-custodian.js';
const fixture = () => JSON.parse(readFileSync(new URL('./fixtures/dollhouse/bounded-orchestrator-case.json', import.meta.url))).temporal;
const copy = value => structuredClone(value);

test('valid local chronology and an exact retained baseline remain bounded declarations', () => {
  const input = fixture(), snapshot = copy(input), result = runTemporalCustodianAudit(input);
  assert.equal(result.verdict, 'PASS'); assert.equal(result.ledger_audit.baseline_compared, true);
  assert.equal(result.evidence_posture.baseline_authentication, 'UNVERIFIED');
  assert.equal(result.evidence_posture.provider_origin_authenticated, false);
  assert.equal(result.authority.execute, false); assert.equal(result.authority.human_closure_required, true);
  assert.deepEqual(input, snapshot); assert.ok(Object.isFrozen(result.journey_audit.evaluations));
});
test('missing audit material, baseline and ordered phase plan never receive PASS', () => {
  for (const input of [{}, null, [], { ...fixture(), ledger_entries: [] }, { ...fixture(), baseline_entries: null }, { ...fixture(), baseline_entries: [] }, { ...fixture(), required_phases: null }]) assert.equal(runTemporalCustodianAudit(input).verdict, 'HELD');
  const result = runTemporalCustodianAudit({ ...fixture(), baseline_entries: null });
  assert.ok(result.violations.some(item => item.type === 'BASELINE_REQUIRED'));
});
test('empty, missing and additional phases cannot satisfy declared route completeness', () => {
  for (const mutate of [input => { input.phases = {}; }, input => { delete input.phases.return; }, input => { input.phases.extra = { status: 'PASS', entry_id: 'FICTIONAL_3' }; }, input => { input.required_phases = ['origin']; }]) {
    const input = fixture(); mutate(input); assert.equal(runTemporalCustodianAudit(input).verdict, 'HELD');
  }
});
test('an early failure holds the route even without any preceding PASS', () => {
  const input = fixture(); input.phases.origin.status = 'FAIL'; input.phases.receiver.status = 'HELD'; input.phases.return.status = 'HELD';
  const result = runTemporalCustodianAudit(input);
  assert.equal(result.verdict, 'HELD'); assert.equal(result.journey_audit.veto_applied, false);
});
test('failed, held, unknown and unperformed downstream phases preserve whole-route veto', () => {
  for (const status of ['FAIL', 'HELD', 'UNKNOWN', 'NOT_RUN']) {
    const input = fixture(); input.phases.receiver.status = status;
    const result = runTemporalCustodianAudit(input);
    assert.equal(result.verdict, 'HELD'); assert.equal(result.journey_audit.veto_authority, 'LOCAL_PASS_PLUS_GLOBAL_ROUTE_REGRESSION');
    assert.equal(result.journey_audit.evaluations.receiver, status);
  }
});
test('phase ordering comes from the required plan rather than object insertion order', () => {
  const input = fixture(); input.phases.receiver.status = 'FAIL';
  input.phases = { return: input.phases.return, receiver: input.phases.receiver, origin: input.phases.origin };
  assert.equal(runTemporalCustodianAudit(input).journey_audit.veto_applied, true);
});
test('unparseable sequences and invalid calendar timestamps fail closed', () => {
  for (const [key, value] of [['t_sequence', 'nonsense'], ['t_sequence', 'SEQ_-2'], ['t_sequence', 'SEQ_01junk'], ['t_sequence', 'SEQ_00'], ['timestamp', 'not-a-time'], ['timestamp', '2026-02-30T20:00:01Z'], ['timestamp', '2026-10-08']]) {
    const input = fixture(); input.ledger_entries[1][key] = value;
    assert.equal(runTemporalCustodianAudit(input).verdict, 'HELD');
  }
});
test('duplicate historical identity rejects even when sequence and timestamps increase', () => {
  const input = fixture(); input.ledger_entries[1].entry_id = input.ledger_entries[0].entry_id;
  assert.equal(runTemporalCustodianAudit(input).verdict, 'HELD');
});
test('deleted, reordered or rewritten baseline prefixes fail without changing old observations', () => {
  for (const mutate of [input => { input.ledger_entries.shift(); }, input => { input.ledger_entries[0].observation = 'Later reconstruction imputed as earlier knowledge'; }, input => { input.baseline_entries = [copy(input.ledger_entries[1]), copy(input.ledger_entries[0])]; }]) {
    const input = fixture(); mutate(input);
    const result = runTemporalCustodianAudit(input); assert.equal(result.verdict, 'FAIL');
    assert.ok(result.violations.some(item => ['RETROACTIVE_HISTORICAL_MUTATION', 'HISTORICAL_PREFIX_CHANGED'].includes(item.type)));
  }
});
test('backward timestamps and repeated sequences fail in current or baseline material', () => {
  for (const baseline of [false, true]) {
    const input = fixture(); if (baseline) input.baseline_entries = copy(input.ledger_entries);
    const entries = baseline ? input.baseline_entries : input.ledger_entries;
    entries[1].timestamp = '2026-10-08T19:00:00Z'; entries[1].t_sequence = entries[0].t_sequence;
    const result = runTemporalCustodianAudit(input); assert.equal(result.verdict, 'FAIL');
    assert.ok(result.violations.some(item => item.type === 'TEMPORAL_MONOTONICITY_INVERSION'));
    assert.ok(result.violations.some(item => item.type === 'TEMPORAL_SEQUENCE_INVERSION'));
  }
});
test('new amendments append without rewriting core history or recorded amendments', () => {
  const input = fixture();
  input.ledger_entries[0].amendments = [{ amendment_type: 'RECLASSIFICATION', appended_at: '2026-10-08T20:01:00Z', appended_by: 'FICTIONAL_AUDITOR', note: 'Later evidence remains a later amendment.' }];
  assert.equal(runTemporalCustodianAudit(input).verdict, 'PASS');
  input.baseline_entries[0].amendments = copy(input.ledger_entries[0].amendments);
  input.ledger_entries[0].amendments[0].note = 'Changed historical amendment';
  assert.equal(runTemporalCustodianAudit(input).verdict, 'FAIL');
});
test('incomplete, unauthorized and backwards amendments remain invalid', () => {
  const amendment = { amendment_type: 'CORRECTION', appended_at: '2026-10-08T20:01:00Z', appended_by: 'FICTIONAL_AUDITOR', note: 'Fictional correction.' };
  for (const mutate of [a => { delete a.note; }, a => { a.amendment_type = 'REWRITE'; }, a => { a.appended_at = 'bad'; }, a => { a.appended_at = '2026-10-08T19:00:00Z'; }]) {
    const input = fixture(), value = copy(amendment); mutate(value); input.ledger_entries[0].amendments = [value];
    assert.notEqual(runTemporalCustodianAudit(input).verdict, 'PASS');
  }
});
test('phase evidence must refer to distinct ledger entries in planned order', () => {
  for (const id of ['ABSENT', 'FICTIONAL_1', 'FICTIONAL_3']) {
    const input = fixture(); input.phases.receiver.entry_id = id;
    assert.equal(runTemporalCustodianAudit(input).verdict, 'HELD');
  }
});
test('sparse inputs, accessors, hidden fields and oversized ledgers never execute through the adapter', () => {
  let reads = 0;
  const getter = fixture(); Object.defineProperty(getter, 'ledger_entries', { enumerable: true, get() { reads++; return []; } });
  const phaseGetter = fixture(); Object.defineProperty(phaseGetter.phases.origin, 'status', { enumerable: true, get() { reads++; return 'PASS'; } });
  const entryGetter = fixture(); Object.defineProperty(entryGetter.ledger_entries[0], 'timestamp', { enumerable: true, get() { reads++; return '2026-10-08T20:00:01Z'; } });
  const sparse = fixture(); delete sparse.ledger_entries[1];
  const hidden = fixture(); Object.defineProperty(hidden, 'release', { value: true });
  const oversized = fixture(); oversized.ledger_entries = Array.from({ length: 513 }, () => copy(oversized.ledger_entries[0]));
  for (const input of [getter, phaseGetter, entryGetter, sparse, hidden, oversized]) assert.equal(runTemporalCustodianAudit(input).verdict, 'HELD');
  assert.equal(reads, 0);
});
test('standalone shape inspection does not claim baseline verification or route completeness', () => {
  const input = fixture(), ledger = auditTemporalLedgerNonRetroactivity(input.ledger_entries);
  assert.equal(ledger.is_valid, true); assert.equal(ledger.baseline_compared, false);
  assert.equal(auditServiceJourneyChronology({}).verdict, 'HELD');
  assert.equal(auditServiceJourneyChronology(input.phases).verdict, 'HELD');
});
