import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  MARROWLINE_PACKET_POPULATION_STABILITY_ASSAY_SCHEMA,
  MARROWLINE_PACKET_POPULATIONS,
  runMarrowlinePacketPopulationStabilityAssay
} from '../scripts/marrowline-packet-population-stability-assay.mjs';

const report = runMarrowlinePacketPopulationStabilityAssay();

assert.equal(report.schema, MARROWLINE_PACKET_POPULATION_STABILITY_ASSAY_SCHEMA);
assert.equal(report.status, 'PASS');
assert.equal(report.assay_local_only, true);
assert.deepEqual(MARROWLINE_PACKET_POPULATIONS.map(item => item.id), ['P_A', 'P_B', 'P_AB']);

assert.deepEqual(report.populations.P_A.finding_rule_ids, ['EMAIL_IDENTIFIER']);
assert.deepEqual(report.populations.P_B.finding_rule_ids, ['USER_DECLARED_PROTECTED_TERM']);
assert.deepEqual(report.populations.P_AB.finding_rule_ids, ['EMAIL_IDENTIFIER', 'USER_DECLARED_PROTECTED_TERM']);
assert.equal(report.populations.P_A.finding_count, 1);
assert.equal(report.populations.P_B.finding_count, 1);
assert.equal(report.populations.P_AB.finding_count, 2);

assert.notEqual(report.populations.P_A.source_packet.sha256, report.populations.P_AB.source_packet.sha256);
assert.notEqual(report.populations.P_B.source_packet.sha256, report.populations.P_AB.source_packet.sha256);
assert.notEqual(report.populations.P_A.carry_case.sha256, report.populations.P_AB.carry_case.sha256);
assert.notEqual(report.populations.P_B.carry_case.sha256, report.populations.P_AB.carry_case.sha256);

assert.deepEqual(
  report.populations.P_A.hosted_by_rule.EMAIL_IDENTIFIER,
  report.populations.P_AB.hosted_by_rule.EMAIL_IDENTIFIER
);
assert.deepEqual(
  report.populations.P_B.hosted_by_rule.USER_DECLARED_PROTECTED_TERM,
  report.populations.P_AB.hosted_by_rule.USER_DECLARED_PROTECTED_TERM
);
assert.deepEqual(report.populations.P_A.matching_envelopes.A, report.populations.P_AB.matching_envelopes.A);
assert.deepEqual(report.populations.P_A.mismatch_envelopes.A, report.populations.P_AB.mismatch_envelopes.A);
assert.deepEqual(report.populations.P_B.matching_envelopes.B, report.populations.P_AB.matching_envelopes.B);
assert.deepEqual(report.populations.P_B.mismatch_envelopes.B, report.populations.P_AB.mismatch_envelopes.B);

assert.deepEqual(report.populations.P_A.matching_statuses, { A: 'PRESENT_TO_HUMAN' });
assert.deepEqual(report.populations.P_A.mismatch_statuses, { A: 'HOLD' });
assert.deepEqual(report.populations.P_B.matching_statuses, { B: 'PRESENT_TO_HUMAN' });
assert.deepEqual(report.populations.P_B.mismatch_statuses, { B: 'HOLD' });
assert.deepEqual(report.populations.P_AB.matching_statuses, { A: 'PRESENT_TO_HUMAN', B: 'PRESENT_TO_HUMAN' });
assert.deepEqual(report.populations.P_AB.mismatch_statuses, { A: 'HOLD', B: 'HOLD' });

assert.equal(report.populations.P_A.absent_sibling_rejected, true);
assert.equal(report.populations.P_B.absent_sibling_rejected, true);
assert.match(report.populations.P_A.absent_sibling_error, /not carried into Hosted AIA/);
assert.match(report.populations.P_B.absent_sibling_error, /not carried into Hosted AIA/);
assert.equal(report.populations.P_A.recovery.envelope_unchanged, true);
assert.equal(report.populations.P_A.recovery.result_unchanged, true);
assert.equal(report.populations.P_B.recovery.envelope_unchanged, true);
assert.equal(report.populations.P_B.recovery.result_unchanged, true);
assert.equal(report.populations.P_AB.cross_bindings_rejected, true);

for (const id of ['P_A', 'P_B', 'P_AB']) {
  const population = report.populations[id];
  assert.deepEqual(population.forbidden_transport_paths, []);
  assert.equal(population.release_authority, false);
  assert.equal(population.human_closure_required, true);
  assert.equal(population.local_binding_carried, false);
}

assert.equal(report.source_packets_population_distinguishable, true);
assert.equal(report.carry_cases_population_distinguishable, true);
assert.equal(report.hosted_projection_population_invariant, true);
assert.equal(report.matching_envelope_population_invariant, true);
assert.equal(report.mismatch_envelope_population_invariant, true);
assert.equal(report.matching_decision_population_invariant, true);
assert.equal(report.mismatch_decision_population_invariant, true);
assert.equal(report.absent_sibling_rejected, true);
assert.equal(report.absent_sibling_rejection_nonpoisoning, true);
assert.equal(report.cross_bindings_rejected_pair, true);
assert.equal(report.hidden_population_state_carried, false);
assert.equal(report.browser_persistence_required, false);
assert.equal(report.authority.release_authority, false);
assert.equal(report.authority.human_closure_required, true);
assert.equal(report.authority.provider_call_performed, false);
assert.equal(report.authority.production_mutation, false);
assert.equal(report.claim_ceiling, 'bounded-two-rule-singleton-pair-packet-population-stability-only');

const source = fs.readFileSync('scripts/marrowline-packet-population-stability-assay.mjs', 'utf8');
assert.match(source, /absent sibling was accepted into return construction/);
assert.match(source, /changed with sibling presence/);
assert.match(source, /poisoned lawful revalidation/);
assert.match(source, /bounded-two-rule-singleton-pair-packet-population-stability-only/);
assert.doesNotMatch(source, /buildMarrowlinePocketHostedCarryCase\([^\n]*(population|sibling|history|cardinality|removed)/i,
  'Population/history state may not enter Carry Case compiler input.');
assert.doesNotMatch(source, /buildMarrowlineReturnEnvelope\([^\n]*(population|sibling|history|cardinality|removed)/i,
  'Population/history state may not enter return-envelope compiler input.');

console.log('Marrowline packet-population stability hostile contract: PASS');
