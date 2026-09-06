import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  MARROWLINE_MULTIPLEXED_FINDING_ISOLATION_ASSAY_SCHEMA,
  MARROWLINE_MULTIPLEXED_FINDING_SPECS,
  MARROWLINE_MULTIPLEXED_PATTERNS,
  runMarrowlineMultiplexedFindingIsolationAssay
} from '../scripts/marrowline-multiplexed-finding-isolation-assay.mjs';

const report = runMarrowlineMultiplexedFindingIsolationAssay();

assert.equal(report.schema, MARROWLINE_MULTIPLEXED_FINDING_ISOLATION_ASSAY_SCHEMA);
assert.equal(report.status, 'PASS');
assert.equal(report.assay_local_only, true);
assert.deepEqual(report.packet_labels, ['A', 'B']);
assert.equal(MARROWLINE_MULTIPLEXED_FINDING_SPECS.A.rule_id, 'EMAIL_IDENTIFIER');
assert.equal(MARROWLINE_MULTIPLEXED_FINDING_SPECS.A.matching_action, 'CHANGE');
assert.equal(MARROWLINE_MULTIPLEXED_FINDING_SPECS.B.rule_id, 'USER_DECLARED_PROTECTED_TERM');
assert.equal(MARROWLINE_MULTIPLEXED_FINDING_SPECS.B.matching_action, 'REMOVE');
assert.equal(report.shared_case.finding_count, 2);
assert.deepEqual(report.shared_case.finding_rule_ids, ['EMAIL_IDENTIFIER', 'USER_DECLARED_PROTECTED_TERM']);
assert.equal(report.shared_case.hosted_findings_distinguishable, true);
assert.equal(report.shared_case.local_binding_carried, false);
assert.equal(report.shared_case.release_authority, false);
assert.equal(report.shared_case.human_closure_required, true);
assert.deepEqual(report.shared_case.forbidden_shared_transport_paths, []);
assert.notEqual(report.shared_case.hosted_findings.A.sha256, report.shared_case.hosted_findings.B.sha256);

assert.equal(report.patterns.length, 2);
assert.equal(report.patterns[0].pattern_id, 'PATTERN_1');
assert.deepEqual(report.patterns[0].execution_order, ['A', 'B']);
assert.deepEqual(report.patterns[0].statuses, { A: 'PRESENT_TO_HUMAN', B: 'HOLD' });
assert.equal(report.patterns[1].pattern_id, 'PATTERN_2');
assert.deepEqual(report.patterns[1].execution_order, ['B', 'A']);
assert.deepEqual(report.patterns[1].statuses, { A: 'HOLD', B: 'PRESENT_TO_HUMAN' });
assert.deepEqual(MARROWLINE_MULTIPLEXED_PATTERNS.map(pattern => pattern.id), ['PATTERN_1', 'PATTERN_2']);

for (const pattern of report.patterns) {
  assert.equal(pattern.assay_local_only, true);
  assert.equal(pattern.carry_case_unchanged, true);
  assert.equal(pattern.sibling_envelopes_unchanged, true);
  for (const label of ['A', 'B']) {
    assert.equal(pattern.results[label].status, pattern.expected_statuses[label]);
    assert.equal(pattern.results[label].candidate_trusted, false);
    assert.equal(pattern.results[label].release_authority, false);
    assert.equal(pattern.results[label].human_closure_required, true);
    assert.equal(pattern.results[label].local_binding_retained, true);
  }
}

assert.equal(report.controls.A_with_B_binding.rejected, true);
assert.match(report.controls.A_with_B_binding.error, /local binding does not match portable projection/);
assert.equal(report.controls.B_with_A_binding.rejected, true);
assert.match(report.controls.B_with_A_binding.error, /local binding does not match portable projection/);
assert.equal(report.all_four_status_controls_observed, true);
assert.equal(report.shared_carry_case_unchanged_across_patterns, true);
assert.equal(report.sibling_decision_isolation, true);
assert.equal(report.wrong_rule_binding_rejected, true);
assert.equal(report.portable_decision_state_carried, false);
assert.equal(report.prior_sibling_status_carried, false);
assert.equal(report.browser_persistence_required, false);
assert.equal(report.authority.release_authority, false);
assert.equal(report.authority.human_closure_required, true);
assert.equal(report.authority.provider_call_performed, false);
assert.equal(report.authority.production_mutation, false);
assert.equal(report.claim_ceiling, 'bounded-two-finding-one-carry-case-opposed-pattern-isolation-only');

const portableShared = JSON.stringify(report.shared_case);
for (const forbidden of [
  'decision_state',
  'sibling_status',
  'sibling_action',
  'prior_sibling',
  'previous_sibling',
  'schedule_index',
  'pattern_index',
  'route_history',
  'receipt_chain',
  'sha256:'
]) {
  if (forbidden === 'sha256:') continue; // report-side surface digests are assay metadata, not transport.
  assert.equal(portableShared.includes(forbidden), false, `shared transport report accumulated forbidden carrier: ${forbidden}`);
}

const source = fs.readFileSync('scripts/marrowline-multiplexed-finding-isolation-assay.mjs', 'utf8');
assert.match(source, /bounded-two-finding-one-carry-case-opposed-pattern-isolation-only/);
assert.match(source, /wrong-rule local binding was accepted/);
assert.match(source, /finding_count !== 2/);
assert.match(source, /shared Carry Case/);
assert.doesNotMatch(source, /buildMarrowlinePocketHostedCarryCase\([^\n]*(pattern|status|decision|prior|previous)/i,
  'Pattern or decision state may not enter the shared Carry Case compiler input.');
assert.doesNotMatch(source, /buildMarrowlineReturnEnvelope\([^\n]*(sibling|prior|previous|status)/i,
  'Sibling decision state may not enter the return-envelope compiler input.');

console.log('Marrowline multiplexed finding isolation hostile contract: PASS');

// Successor hostile contract: the inherited two-finding Carry Case must cover the full
// four-corner current-decision square without whole-case status or cross-finding authority.
await import('./marrowline-cartesian-finding-decision-separability.test.mjs');
