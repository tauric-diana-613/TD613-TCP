import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  MULTI_PROBE_MATCHED_BUDGET_SCHEMA,
  runMultiProbeMatchedBudgetGauntlet
} from '../app/dome-world/previews/a15-r0/multi-probe-matched-budget.js';

const receipt = runMultiProbeMatchedBudgetGauntlet();

assert.equal(receipt.schema, MULTI_PROBE_MATCHED_BUDGET_SCHEMA);
assert.equal(receipt.source_status, 'SIMULATED');
assert.equal(receipt.authority_class, 'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional, true);
assert.deepEqual(receipt.candidate_family, ['RX', 'RY', 'RZ']);
assert.deepEqual(receipt.probe_family, ['P1', 'P2', 'P3']);
assert.deepEqual(receipt.candidate_probe_laws, {
  RX: { P1: 0.7, P2: 0.7, P3: 0.3 },
  RY: { P1: 0.7, P2: 0.3, P3: 0.7 },
  RZ: { P1: 0.3, P2: 0.7, P3: 0.7 }
});
assert.deepEqual(receipt.outside_probe_law, { P1: 0.7, P2: 0.95, P3: 0.95 });

assert.deepEqual(receipt.matched_budget, {
  total_observations_per_arm: 300,
  repetition_total: 300,
  diversity_total: 300,
  redundant_total: 300,
  matched_total_budget: true
});

assert.equal(receipt.criteria.role, 'FORMAL_DIAGNOSTIC');
assert.equal(receipt.criteria.alpha_family, 0.01);
assert.equal(receipt.criteria.repetition.candidate_probe_cells, 3);
assert.equal(receipt.criteria.repetition.alpha_cell, 0.0033333333333333335);
assert.equal(receipt.criteria.repetition.sample_size_per_probe, 300);
assert.equal(receipt.criteria.repetition.hoeffding_radius, 0.103254779188957);
assert.equal(receipt.criteria.multi_probe.candidate_probe_cells, 9);
assert.equal(receipt.criteria.multi_probe.alpha_cell, 0.0011111111111111111);
assert.equal(receipt.criteria.multi_probe.sample_size_per_probe, 100);
assert.equal(receipt.criteria.multi_probe.hoeffding_radius, 0.193591605498331);
assert.equal(receipt.criteria.criterion_predeclared, true);
assert.equal(receipt.criteria.budget_matched, true);
assert.equal(receipt.criteria.multiplicity_correction_explicit, true);
assert.equal(receipt.criteria.universal_optimality_claim, false);
assert.equal(receipt.criteria.empirical_validation_claim, false);

assert.deepEqual(receipt.duplicate_probe_ledger, {
  Q1: { duplicate_of: 'P1', measurement_law_distinct: false },
  Q2: { duplicate_of: 'P1', measurement_law_distinct: false },
  Q3: { duplicate_of: 'P1', measurement_law_distinct: false }
});

const admitted = receipt.experiments.admitted;
assert.deepEqual(admitted.repetition.surviving_adequacy_set, ['RX', 'RY']);
assert.equal(admitted.repetition.survivor_count, 2);
assert.equal(admitted.repetition.classification, 'MATCHED_BUDGET_REPETITION_REMAINS_PARTIALLY_IDENTIFIED');
assert.equal(admitted.repetition.open_set_rejection_earned, false);
assert.deepEqual(admitted.repetition.candidate_distances, {
  RX: { P1: 0 },
  RY: { P1: 0 },
  RZ: { P1: 0.4 }
});

assert.deepEqual(admitted.diversity.surviving_adequacy_set, ['RX']);
assert.equal(admitted.diversity.survivor_count, 1);
assert.equal(admitted.diversity.classification, 'MATCHED_BUDGET_PROBE_DIVERSITY_CONTRACTS_TO_SINGLETON');
assert.equal(admitted.diversity.point_identified_within_declared_probe_and_candidate_scope, true);
assert.equal(admitted.diversity.unconditional_truth_identification, false);
assert.deepEqual(admitted.diversity.candidate_distances, {
  RX: { P1: 0, P2: 0, P3: 0 },
  RY: { P1: 0, P2: 0.4, P3: 0.4 },
  RZ: { P1: 0.4, P2: 0, P3: 0.4 }
});

assert.deepEqual(admitted.redundant.surviving_adequacy_set, ['RX', 'RY']);
assert.equal(admitted.redundant.survivor_count, 2);
assert.equal(admitted.redundant.classification, 'REDUNDANT_PROBE_LABELS_DO_NOT_REPRODUCE_DIVERSITY_GAIN');

const outside = receipt.experiments.outside;
assert.equal(outside.repetition.oracle_truth, 'RU');
assert.equal(outside.repetition.oracle_truth_in_candidate_family, false);
assert.deepEqual(outside.repetition.surviving_adequacy_set, ['RX', 'RY']);
assert.equal(outside.repetition.open_set_rejection_earned, false);
assert.equal(outside.repetition.classification, 'REPETITION_ARM_FAILS_TO_EARN_OPEN_SET_REJECTION');

assert.deepEqual(outside.diversity.candidate_distances, {
  RX: { P1: 0, P2: 0.25, P3: 0.65 },
  RY: { P1: 0, P2: 0.65, P3: 0.25 },
  RZ: { P1: 0.4, P2: 0.25, P3: 0.25 }
});
assert.deepEqual(outside.diversity.surviving_adequacy_set, []);
assert.equal(outside.diversity.survivor_count, 0);
assert.equal(outside.diversity.open_set_rejection_earned, true);
assert.equal(outside.diversity.classification, 'MATCHED_BUDGET_PROBE_DIVERSITY_EARNS_OPEN_SET_REJECTION');
assert.equal(outside.diversity.selected_route, 'NONE');
assert.equal(outside.diversity.open_set_state, 'OPEN_SET_UNRESOLVED');
assert.equal(outside.diversity.truth_identified, false);
assert.equal(outside.diversity.all_candidate_cell_likelihoods_nonzero, true);

assert.deepEqual(outside.redundant.surviving_adequacy_set, ['RX', 'RY']);
assert.equal(outside.redundant.survivor_count, 2);
assert.equal(outside.redundant.open_set_rejection_earned, false);
assert.equal(outside.redundant.classification, 'REDUNDANT_MULTI_PROBE_CONTROL_FAILS_TO_EARN_OPEN_SET_REJECTION');

assert.deepEqual(receipt.gain_ledger.admitted, {
  repetition_survivor_count: 2,
  diversity_survivor_count: 1,
  redundant_survivor_count: 2
});
assert.deepEqual(receipt.gain_ledger.outside, {
  repetition_survivor_count: 2,
  diversity_survivor_count: 0,
  redundant_survivor_count: 2
});
assert.equal(receipt.gain_ledger.identifiability_gain_in_authored_fixture, true);
assert.equal(receipt.gain_ledger.open_set_rejection_gain_in_authored_fixture, true);
assert.equal(receipt.gain_ledger.raw_sample_count_gain, false);
assert.equal(receipt.gain_ledger.probe_label_count_sufficient, false);

for (const experiment of [admitted, outside]) {
  for (const arm of [experiment.repetition, experiment.diversity, experiment.redundant]) {
    assert.equal(arm.total_budget, 300);
    assert.equal(arm.all_candidate_cell_likelihoods_nonzero, true);
    assert.equal(arm.oracle_truth_exposed_to_decoder, false);
  }
}

assert.equal(receipt.gauntlet_status, 'MATCHED_BUDGET_PROBE_DIVERSITY_GRAMMAR_VALIDATED_IN_BOUNDED_SYNTHETIC_FIXTURE');
assert.equal(receipt.reusable_relation_status, 'RESEARCH_REFINEMENT_CANDIDATE_ONLY');
assert.match(receipt.reusable_relation, /matched observation budget/);
assert.match(receipt.reusable_relation, /nonredundant/);
assert.equal(receipt.next_learning_action, 'TEST_RELATIONAL_PROBE_RECONSTRUCTION_WITH_KNOWN_FORWARD_OPERATORS');
assert.equal(receipt.promotion_authority, false);
assert.equal(receipt.production_mutated, false);
assert.equal(receipt.live_ash_binding, false);
assert.equal(receipt.human_closure_required, true);
assert.equal(receipt.claims.universal_measurement_diversity_superiority, false);
assert.equal(receipt.claims.mutual_information_gain_live_systems, false);
assert.equal(receipt.claims.universal_sample_efficiency_gain, false);
assert.equal(receipt.claims.tomography, false);
assert.equal(receipt.claims.blind_tomography, false);
assert.equal(receipt.claims.connection, false);
assert.equal(receipt.claims.curvature, false);
assert.equal(receipt.claims.holonomy, false);
assert.equal(receipt.claims.berry_structure, false);
assert.equal(receipt.claims.quantum_behavior, false);
assert.equal(receipt.claims.proto_loom, false);
assert.equal(receipt.claims.production_authority, false);

const spec = fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/PEDAGOGUE_MULTI_PROBE_MATCHED_BUDGET_GAUNTLET_SPEC_V0_1.md', 'utf8');
assert.match(spec, /B_total = 300/);
assert.match(spec, /0\.103254779188957/);
assert.match(spec, /0\.193591605498331/);
assert.match(spec, /MATCHED_BUDGET_PROBE_DIVERSITY_CONTRACTS_TO_SINGLETON/);
assert.match(spec, /REDUNDANT_PROBE_LABELS_DO_NOT_REPRODUCE_DIVERSITY_GAIN/);
assert.match(spec, /MATCHED_BUDGET_PROBE_DIVERSITY_EARNS_OPEN_SET_REJECTION/);
assert.match(spec, /REDUNDANT_MULTI_PROBE_CONTROL_FAILS_TO_EARN_OPEN_SET_REJECTION/);
assert.match(spec, /O_i = F_i\(S\) \+ noise_i/);
assert.match(spec, /TEST_RELATIONAL_PROBE_RECONSTRUCTION_WITH_KNOWN_FORWARD_OPERATORS/);

console.log(JSON.stringify({
  ok: true,
  schema: receipt.schema,
  repetition_radius: receipt.criteria.repetition.hoeffding_radius,
  multi_probe_radius: receipt.criteria.multi_probe.hoeffding_radius,
  admitted_repetition: admitted.repetition.surviving_adequacy_set,
  admitted_diversity: admitted.diversity.surviving_adequacy_set,
  admitted_redundant: admitted.redundant.surviving_adequacy_set,
  outside_repetition: outside.repetition.surviving_adequacy_set,
  outside_diversity: outside.diversity.surviving_adequacy_set,
  outside_redundant: outside.redundant.surviving_adequacy_set,
  gain_ledger: receipt.gain_ledger,
  next_learning_action: receipt.next_learning_action,
  promotion_authority: receipt.promotion_authority
}, null, 2));
