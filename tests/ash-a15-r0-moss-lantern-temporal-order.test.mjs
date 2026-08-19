import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildIdentifiabilityFrontierRegistry } from '../app/dome-world/previews/a15-r0/identifiability-frontier-registry.js';
import { runWeddingIdentifiabilityAssay } from '../app/dome-world/previews/a15-r0/wedding-identifiability-assay.js';
import { runMossLanternReferenceIdentifiabilityAssay } from '../app/dome-world/previews/a15-r0/moss-lantern-reference-identifiability.js';
import {
  MOSS_LANTERN_COMMUTING_NULL_OPERATORS,
  MOSS_LANTERN_ORDER_SENSITIVE_OPERATORS,
  MOSS_LANTERN_TEMPORAL_OBSERVATION_BUDGET,
  MOSS_LANTERN_TEMPORAL_OPERATIONS,
  MOSS_LANTERN_TEMPORAL_ORDER_SCHEMA,
  buildMossLanternTemporalRoutes,
  forwardMossLanternTemporalWitness,
  runMossLanternTemporalOrderAssay
} from '../app/dome-world/previews/a15-r0/moss-lantern-temporal-order-assay.js';
import {
  MOSS_LANTERN_TEMPORAL_ORDER_FRONTIER_SCHEMA,
  buildMossLanternTemporalOrderFrontier
} from '../app/dome-world/previews/a15-r0/moss-lantern-temporal-order-frontier.js';

const fixture = JSON.parse(fs.readFileSync('tests/fixtures/pedagogue/ash-tomography-calibration-phantom-v01.json', 'utf8'));
const source = fs.readFileSync('app/dome-world/previews/a15-r0/moss-lantern-temporal-order-assay.js', 'utf8');
const spec = fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/ASH_KEEP_A15_R0_MOSS_LANTERN_ML3_SPEC_V0_1.md', 'utf8');

assert.equal(MOSS_LANTERN_TEMPORAL_ORDER_SCHEMA, 'td613.ash.a15-r0.moss-lantern-temporal-order/v0.1');
assert.equal(MOSS_LANTERN_TEMPORAL_OBSERVATION_BUDGET, 2);
assert.deepEqual([...MOSS_LANTERN_TEMPORAL_OPERATIONS], ['custody-hold', 'projection-observe', 'rest', 'prepare-return']);

const routes = buildMossLanternTemporalRoutes();
assert.equal(routes.length, 24);
assert.equal(new Set(routes.map(route => route.route_id)).size, 24);
assert.ok(routes.every(route => route.open_boundary === 'open-practice-case'));
assert.ok(routes.every(route => route.terminal_action === 'return'));
assert.ok(routes.every(route => route.endpoint === 'returned-practice-capsule'));
assert.ok(routes.every(route => route.operation_order.length === 4));
assert.ok(routes.every(route => new Set(route.operation_order).size === 4));
assert.ok(routes.every(route => JSON.stringify(route.operation_multiset) === JSON.stringify(routes[0].operation_multiset)));

const positiveSignatures = routes.map(route => forwardMossLanternTemporalWitness(route, MOSS_LANTERN_ORDER_SENSITIVE_OPERATORS));
const nullSignatures = routes.map(route => forwardMossLanternTemporalWitness(route, MOSS_LANTERN_COMMUTING_NULL_OPERATORS));
assert.equal(new Set(positiveSignatures.map(signature => signature.join(':'))).size, 24);
assert.equal(new Set(nullSignatures.map(signature => signature.join(':'))).size, 1);
assert.deepEqual(nullSignatures[0], [24, 2]);

assert.throws(() => runMossLanternTemporalOrderAssay({}), /canonical Moss Lantern/i);
assert.throws(() => runMossLanternTemporalOrderAssay(fixture, { noise_rate: 1 }), /\[0, 1\)/);
assert.throws(() => runMossLanternTemporalOrderAssay(fixture, { trials_per_route: 0 }), /positive integer/i);

const assay = runMossLanternTemporalOrderAssay(fixture);
const replay = runMossLanternTemporalOrderAssay(fixture);
assert.deepEqual(replay, assay, 'ML3 must be exactly replayable under the declared seed.');
assert.equal(assay.schema, MOSS_LANTERN_TEMPORAL_ORDER_SCHEMA);
assert.equal(assay.source_status, 'SIMULATED');
assert.equal(assay.authority_class, 'A2_DERIVATIONAL');
assert.equal(assay.manifestly_fictional, true);
assert.equal(assay.latent_route_count, 24);
assert.equal(assay.witness_space, 'Z_31^2_CLASSICAL_FINITE_STATE');
assert.deepEqual([...assay.start_vector], [1, 2]);
assert.equal(assay.observation_budget, 2);
assert.equal(assay.noise_model.kind, 'SEEDED_MODULAR_COORDINATE_JITTER');
assert.equal(assay.noise_model.jitter_probability, 0.10);
assert.equal(assay.noise_model.trials_per_route, 64);
assert.equal(assay.noise_model.seed, 613);

assert.equal(assay.positive_control.unique_signature_count, 24);
assert.equal(assay.positive_control.exact_unique_recovery_rate, 1);
assert.equal(assay.positive_control.mean_candidate_set_size, 1);
assert.equal(assay.positive_control.maximum_candidate_set_size, 1);
assert.equal(assay.positive_control.noisy_exact_recovery_rate, 0.953125);
assert.equal(assay.positive_control.ambiguous_decode_rate, 0.020833);
assert.equal(assay.positive_control.wrong_unique_decode_rate, 0.026042);
assert.equal(assay.positive_control.pairwise_noncommuting_pair_count, 6);
assert.equal(assay.positive_control.pairwise_commuting_pair_count, 0);

assert.equal(assay.commuting_null.unique_signature_count, 1);
assert.equal(assay.commuting_null.exact_unique_recovery_rate, 0);
assert.equal(assay.commuting_null.mean_candidate_set_size, 24);
assert.equal(assay.commuting_null.maximum_candidate_set_size, 24);
assert.equal(assay.commuting_null.noisy_exact_recovery_rate, 0);
assert.equal(assay.commuting_null.ambiguous_decode_rate, 1);
assert.equal(assay.commuting_null.wrong_unique_decode_rate, 0);
assert.equal(assay.commuting_null.pairwise_noncommuting_pair_count, 0);
assert.equal(assay.commuting_null.pairwise_commuting_pair_count, 6);

assert.equal(assay.order_blind_aggregate_null.candidate_set_size, 24);
assert.equal(assay.order_blind_aggregate_null.unique_order_recovery_possible, false);
assert.equal(assay.controls.same_operation_multiset, true);
assert.equal(assay.controls.same_endpoint, true);
assert.equal(assay.controls.same_operation_count, true);
assert.equal(assay.controls.same_open_boundary, true);
assert.equal(assay.controls.same_terminal_action, true);
assert.equal(assay.controls.observer_firewall.observer_receives_route_labels, false);
assert.equal(assay.controls.observer_firewall.observer_receives_absolute_timestamps, false);
assert.equal(assay.controls.observer_firewall.observer_receives_transition_timestamps, false);
assert.equal(assay.controls.observer_firewall.observer_receives_hidden_intermediate_states, false);
assert.equal(assay.controls.observer_firewall.full_route_memory_used, false);
assert.equal(assay.controls.observer_firewall.levenshtein_distance_used, false);
assert.equal(assay.controls.observer_firewall.observation_budget_coordinates, 2);

assert.equal(assay.findings.order_sensitive_process_separates_all_permutations, true);
assert.equal(assay.findings.commuting_null_erases_order, true);
assert.equal(assay.findings.order_blind_aggregate_erases_order, true);
assert.equal(assay.findings.noisy_reconstruction_above_calibration_threshold, true);
assert.equal(assay.findings.assay_mechanism_validated, true);
assert.equal(assay.hypothesis_status.H_MOSS_LANTERN_TEMPORAL_ORDER_ASSAY, 'SUPPORTED_IN_BOUNDED_SYNTHETIC_TEMPORAL_FIXTURE');
assert.equal(assay.hypothesis_status.H_TD613_TEMPORAL_ORDER_IDENTIFIABILITY, 'OPEN_UNMEASURED');
assert.equal(assay.research_transfer_relation, 'ORDER_IS_PART_OF_PROCESS_STATE');
assert.equal(assay.internal_synthetic_witness_eligible, true);
assert.equal(assay.classical_finite_operator_claim, true);
assert.equal(assay.quantum_noncommutativity_claim, false);
assert.equal(assay.physical_noncommutativity_claim, false);
assert.equal(assay.connection_declared, false);
assert.equal(assay.curvature_claim, false);
assert.equal(assay.holonomy_claim, false);
assert.equal(assay.quantum_behavior_claim, false);
assert.equal(assay.physical_realization_claim, false);
assert.equal(assay.promotion_authority, false);
assert.equal(assay.production_mutated, false);
assert.equal(assay.live_ash_binding, false);
assert.equal(assay.proto_loom_implementation, false);
assert.equal(assay.external_transmission, false);
assert.equal(assay.human_closure_required, true);
assert.equal(assay.observation_aperture.authority_effect, 'NONE');
assert.equal(assay.observation_aperture.practice_mode, true);
assert.match(assay.claim_ceiling, /does not establish quantum temporal tomography/i);
assert.doesNotMatch(source, /Math\.random/);
assert.doesNotMatch(source, /flowcore-pedagogue-route-memory/);
assert.match(spec, /full route-memory comparator as its observer/i);
assert.match(spec, /classical algebra/i);
assert.match(spec, /H_TD613_TEMPORAL_ORDER_IDENTIFIABILITY = OPEN_UNMEASURED/);

const baseFrontier = buildIdentifiabilityFrontierRegistry({
  wedding: runWeddingIdentifiabilityAssay(),
  moss: runMossLanternReferenceIdentifiabilityAssay(fixture)
});
const temporalFrontier = buildMossLanternTemporalOrderFrontier({ baseFrontier, temporal: assay });
assert.equal(temporalFrontier.schema, MOSS_LANTERN_TEMPORAL_ORDER_FRONTIER_SCHEMA);
assert.deepEqual(temporalFrontier.bounded_support, [
  'H_WEDDING_ASSAY_MECHANISM_VALID',
  'H_MOSS_LANTERN_NONREPETITION_REFERENCE_ASSAY',
  'H_MOSS_LANTERN_TEMPORAL_ORDER_ASSAY'
]);
assert.deepEqual(temporalFrontier.closed_by_counterexample, ['H_PHI_SPECIFIC_ANTI_ALIASING_ADVANTAGE']);
assert.deepEqual(temporalFrontier.research_frontier, [
  'H_TRIPLE_IDENTIFIABILITY_SYNERGY',
  'H_TD613_PHI_ANTI_ALIASING',
  'H_TD613_TEMPORAL_ORDER_IDENTIFIABILITY'
]);
assert.equal(temporalFrontier.extension_hypotheses[0].status, 'SUPPORTED_IN_BOUNDED_SYNTHETIC_TEMPORAL_FIXTURE');
assert.equal(temporalFrontier.extension_hypotheses[1].status, 'OPEN_UNMEASURED');
assert.equal(temporalFrontier.sequence_authority, false);
assert.equal(temporalFrontier.next_stage, null);
assert.deepEqual(temporalFrontier.stage_unlocks, []);
assert.equal(temporalFrontier.promotion_authority, false);
assert.equal(temporalFrontier.production_mutated, false);
assert.equal(temporalFrontier.external_transmission, false);
assert.equal(temporalFrontier.human_closure_required, true);

console.log(JSON.stringify({
  ok: true,
  schema: assay.schema,
  latent_route_count: assay.latent_route_count,
  observation_budget: assay.observation_budget,
  positive_unique_signature_count: assay.positive_control.unique_signature_count,
  positive_noisy_exact_recovery_rate: assay.positive_control.noisy_exact_recovery_rate,
  positive_ambiguous_decode_rate: assay.positive_control.ambiguous_decode_rate,
  positive_wrong_unique_decode_rate: assay.positive_control.wrong_unique_decode_rate,
  positive_pairwise_noncommuting_pair_count: assay.positive_control.pairwise_noncommuting_pair_count,
  null_unique_signature_count: assay.commuting_null.unique_signature_count,
  null_mean_candidate_set_size: assay.commuting_null.mean_candidate_set_size,
  null_ambiguous_decode_rate: assay.commuting_null.ambiguous_decode_rate,
  order_blind_candidate_set_size: assay.order_blind_aggregate_null.candidate_set_size,
  temporal_assay_status: assay.hypothesis_status.H_MOSS_LANTERN_TEMPORAL_ORDER_ASSAY,
  td613_temporal_status: assay.hypothesis_status.H_TD613_TEMPORAL_ORDER_IDENTIFIABILITY,
  research_transfer_relation: assay.research_transfer_relation,
  promotion_authority: assay.promotion_authority
}, null, 2));
