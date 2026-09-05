import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  MARROWLINE_FINDING_ORDER_PERMUTATION_STABILITY_ASSAY_SCHEMA,
  MARROWLINE_FINDING_ORDER_PERMUTATIONS,
  runMarrowlineFindingOrderPermutationStabilityAssay
} from '../scripts/marrowline-finding-order-permutation-stability-assay.mjs';

const report = runMarrowlineFindingOrderPermutationStabilityAssay();

assert.equal(report.schema, MARROWLINE_FINDING_ORDER_PERMUTATION_STABILITY_ASSAY_SCHEMA);
assert.equal(report.status, 'PASS');
assert.equal(report.assay_local_only, true);
assert.deepEqual(MARROWLINE_FINDING_ORDER_PERMUTATIONS.map(item => item.id), ['P_AB', 'P_BA']);
assert.deepEqual(report.permutations.P_AB.finding_rule_ids, ['EMAIL_IDENTIFIER', 'USER_DECLARED_PROTECTED_TERM']);
assert.deepEqual(report.permutations.P_BA.finding_rule_ids, ['USER_DECLARED_PROTECTED_TERM', 'EMAIL_IDENTIFIER']);
assert.notEqual(report.permutations.P_AB.source_packet.sha256, report.permutations.P_BA.source_packet.sha256);
assert.notEqual(report.permutations.P_AB.carry_case.sha256, report.permutations.P_BA.carry_case.sha256);

for (const id of ['P_AB', 'P_BA']) {
  const permutation = report.permutations[id];
  assert.deepEqual(permutation.matching_statuses, { A: 'PRESENT_TO_HUMAN', B: 'PRESENT_TO_HUMAN' });
  assert.deepEqual(permutation.mismatch_statuses, { A: 'HOLD', B: 'HOLD' });
  assert.equal(permutation.cross_bindings_rejected, true);
  assert.deepEqual(permutation.forbidden_transport_paths, []);
  assert.equal(permutation.release_authority, false);
  assert.equal(permutation.human_closure_required, true);
  assert.equal(permutation.local_binding_carried, false);
}

for (const label of ['A', 'B']) {
  assert.equal(report.per_rule[label].matching_status, 'PRESENT_TO_HUMAN');
  assert.equal(report.per_rule[label].mismatch_status, 'HOLD');
}

assert.equal(report.slot_zero.P_AB.rule_id, 'EMAIL_IDENTIFIER');
assert.equal(report.slot_zero.P_BA.rule_id, 'USER_DECLARED_PROTECTED_TERM');
assert.notEqual(report.slot_zero.P_AB.hosted_surface.sha256, report.slot_zero.P_BA.hosted_surface.sha256);
assert.equal(report.source_packets_order_distinguishable, true);
assert.equal(report.carry_cases_order_distinguishable, true);
assert.equal(report.hosted_projection_rule_invariant, true);
assert.equal(report.matching_envelope_rule_invariant, true);
assert.equal(report.mismatch_envelope_rule_invariant, true);
assert.equal(report.matching_decision_rule_invariant, true);
assert.equal(report.mismatch_decision_rule_invariant, true);
assert.equal(report.cross_bindings_rejected_both_permutations, true);
assert.equal(report.slot_zero_identity_changes_with_permutation, true);
assert.equal(report.hidden_permutation_state_carried, false);
assert.equal(report.browser_persistence_required, false);
assert.equal(report.authority.release_authority, false);
assert.equal(report.authority.human_closure_required, true);
assert.equal(report.authority.provider_call_performed, false);
assert.equal(report.authority.production_mutation, false);
assert.equal(report.claim_ceiling, 'bounded-two-finding-two-permutation-rule-bound-stability-only');

const hostedA = 'EMAIL_IDENTIFIER';
const hostedB = 'USER_DECLARED_PROTECTED_TERM';
assert.deepEqual(report.permutations.P_AB.hosted_by_rule[hostedA], report.permutations.P_BA.hosted_by_rule[hostedA]);
assert.deepEqual(report.permutations.P_AB.hosted_by_rule[hostedB], report.permutations.P_BA.hosted_by_rule[hostedB]);
assert.deepEqual(report.permutations.P_AB.matching_envelopes.A, report.permutations.P_BA.matching_envelopes.A);
assert.deepEqual(report.permutations.P_AB.matching_envelopes.B, report.permutations.P_BA.matching_envelopes.B);
assert.deepEqual(report.permutations.P_AB.mismatch_envelopes.A, report.permutations.P_BA.mismatch_envelopes.A);
assert.deepEqual(report.permutations.P_AB.mismatch_envelopes.B, report.permutations.P_BA.mismatch_envelopes.B);

const source = fs.readFileSync('scripts/marrowline-finding-order-permutation-stability-assay.mjs', 'utf8');
assert.match(source, /FINDING_ORDER_PERMUTATIONS/);
assert.match(source, /silently reordered findings/);
assert.match(source, /slot 0 was incorrectly treated as invariant finding identity/);
assert.match(source, /bounded-two-finding-two-permutation-rule-bound-stability-only/);
assert.doesNotMatch(source, /\.sort\([^\n]*portable_findings|portable_findings[^\n]*\.sort\(/,
  'Permutation assay may not prove stability by sorting the finding array.');
assert.doesNotMatch(source, /buildMarrowlinePocketHostedCarryCase\([^\n]*(slot|permutation|history|schedule|index)/i,
  'Position or permutation state may not enter the Carry Case compiler input.');
assert.doesNotMatch(source, /buildMarrowlineReturnEnvelope\([^\n]*(slot|index|permutation|history)/i,
  'Position or permutation state may not enter return-envelope compiler input.');

console.log('Marrowline finding-order permutation stability hostile contract: PASS');
