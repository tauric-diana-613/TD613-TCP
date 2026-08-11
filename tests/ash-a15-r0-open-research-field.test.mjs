import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  BOUNDED_TRANSFORMATION_ENVELOPE_SCHEMA,
  runBoundedTransformationEnvelope
} from '../app/dome-world/previews/a15-r0/bounded-transformation-envelope.js';
import {
  BOOLEAN_SYNERGY_CENSUS_SCHEMA,
  evaluateBooleanFunction,
  runBooleanSynergyCensus
} from '../app/dome-world/previews/a15-r0/boolean-synergy-census.js';
import {
  FISHER_SYNERGY_NON_EQUIVALENCE_SCHEMA,
  runFisherSynergyNonEquivalence
} from '../app/dome-world/previews/a15-r0/fisher-synergy-non-equivalence.js';
import {
  GOLDEN_EGG_FEASIBLE_REGION_SCHEMA,
  buildGoldenEggFeasibleRegion
} from '../app/dome-world/previews/a15-r0/golden-egg-feasible-region.js';
import {
  INFORMATION_GEOMETRY_CALIBRATION_SCHEMA,
  runInformationGeometryCalibration
} from '../app/dome-world/previews/a15-r0/information-geometry-calibration.js';
import {
  ADMISSIBILITY_TRANSFORMS,
  A15_R0_OPEN_FIELD_SCHEMA,
  CANONICAL_TOPOLOGY,
  OBSERVABILITY_MODELS,
  RECONSTRUCTION_FRAGMENTS,
  matrixRank,
  mutualInformationBits,
  reconstructTopology,
  runDirectionalExposureAssay,
  runJoiningKeySynergyAssay,
  runObservabilityAssay,
  runOpenResearchField,
  runRankLeakageNonEquivalenceAssay,
  runReconstructionAssay,
  topologySimilarity
} from '../app/dome-world/previews/a15-r0/open-research-field.js';
import {
  OPEN_RESEARCH_HYPOTHESIS_REGISTRY_SCHEMA,
  buildOpenResearchHypothesisRegistry
} from '../app/dome-world/previews/a15-r0/open-research-hypothesis-registry.js';

const html = fs.readFileSync('app/dome-world/previews/a15-r0/index.html', 'utf8');
const modelSource = fs.readFileSync('app/dome-world/previews/a15-r0/open-research-field.js', 'utf8');
const envelopeSource = fs.readFileSync('app/dome-world/previews/a15-r0/bounded-transformation-envelope.js', 'utf8');
const booleanSource = fs.readFileSync('app/dome-world/previews/a15-r0/boolean-synergy-census.js', 'utf8');
const fisherSource = fs.readFileSync('app/dome-world/previews/a15-r0/fisher-synergy-non-equivalence.js', 'utf8');
const goldenSource = fs.readFileSync('app/dome-world/previews/a15-r0/golden-egg-feasible-region.js', 'utf8');
const geometrySource = fs.readFileSync('app/dome-world/previews/a15-r0/information-geometry-calibration.js', 'utf8');
const hypothesisSource = fs.readFileSync('app/dome-world/previews/a15-r0/open-research-hypothesis-registry.js', 'utf8');
const uiSource = fs.readFileSync('app/dome-world/previews/a15-r0/open-research-field-ui.js', 'utf8');
const schema = JSON.parse(fs.readFileSync('app/dome-world/schemas/a15-r0/open-research-field-v02.schema.json', 'utf8'));
const envelopeSchema = JSON.parse(fs.readFileSync('app/dome-world/schemas/a15-r0/bounded-transformation-envelope-v01.schema.json', 'utf8'));
const hypothesisSchema = JSON.parse(fs.readFileSync('app/dome-world/schemas/a15-r0/open-research-hypothesis-registry-v01.schema.json', 'utf8'));

assert.equal(A15_R0_OPEN_FIELD_SCHEMA, 'td613.ash.a15-r0.open-research-field/v0.2');
assert.equal(schema.$id, A15_R0_OPEN_FIELD_SCHEMA);
assert.equal(BOUNDED_TRANSFORMATION_ENVELOPE_SCHEMA, 'td613.ash.a15-r0.bounded-transformation-envelope/v0.1');
assert.equal(envelopeSchema.$id, BOUNDED_TRANSFORMATION_ENVELOPE_SCHEMA);
assert.equal(OPEN_RESEARCH_HYPOTHESIS_REGISTRY_SCHEMA, 'td613.ash.a15-r0.open-research-hypothesis-registry/v0.1');
assert.equal(hypothesisSchema.$id, OPEN_RESEARCH_HYPOTHESIS_REGISTRY_SCHEMA);
assert.equal(BOOLEAN_SYNERGY_CENSUS_SCHEMA, 'td613.ash.a15-r0.boolean-synergy-census/v0.1');
assert.equal(FISHER_SYNERGY_NON_EQUIVALENCE_SCHEMA, 'td613.ash.a15-r0.fisher-synergy-non-equivalence/v0.1');
assert.equal(GOLDEN_EGG_FEASIBLE_REGION_SCHEMA, 'td613.ash.a15-r0.golden-egg-feasible-region/v0.1');
assert.equal(INFORMATION_GEOMETRY_CALIBRATION_SCHEMA, 'td613.ash.a15-r0.information-geometry-calibration/v0.1');
assert.ok(hypothesisSchema.required.includes('bounded_support'));
assert.equal(OBSERVABILITY_MODELS.length, 4);
assert.equal(Object.keys(ADMISSIBILITY_TRANSFORMS).length, 6);
assert.equal(RECONSTRUCTION_FRAGMENTS.length, 9);
assert.equal(CANONICAL_TOPOLOGY.nodes.length, 7);
assert.equal(CANONICAL_TOPOLOGY.edges.length, 7);

assert.equal(matrixRank([[1, 2, 3]]), 1);
assert.equal(matrixRank([[1, 0, 0], [0, 1, 0], [0, 0, 1]]), 3);
assert.equal(matrixRank([[1, 2], [2, 4]]), 1);
assert.throws(() => matrixRank([[1, 2], [1]]), /equal width/);

const observability = runObservabilityAssay();
const byId = Object.fromEntries(observability.models.map(model => [model.model_id, model]));
assert.equal(byId.ACTIVE_BOUNDARY.mutual_information_bits, 1.584963);
assert.equal(byId.MINIMAL_DISCLOSURE.mutual_information_bits, 0.918296);
assert.equal(byId.NULL_CONTENT.mutual_information_bits, 0);
assert.equal(byId.NULL_WITH_SIDE_CHANNEL.mutual_information_bits, 1.584963);
assert.equal(observability.null_policy_best_case_information_bits, 0);
assert.equal(observability.null_policy_worst_case_information_bits, 1.584963);
assert.equal(observability.null_policy_observer_model_gap_bits, 1.584963);
assert.equal(observability.observer_family_bounded, true);
assert.equal(observability.universal_zero_defense_claim_supported, false);
assert.match(observability.finding, /observer model/i);

assert.equal(mutualInformationBits([
  { strategy: 'A', observation: 'X' },
  { strategy: 'B', observation: 'X' }
]), 0);
assert.throws(() => mutualInformationBits([]), /requires samples/);

const rankLeakage = runRankLeakageNonEquivalenceAssay();
const rankCases = Object.fromEntries(rankLeakage.cases.map(value => [value.case_id, value]));
assert.equal(rankCases.RANK1_DISTINGUISHABLE_SCALAR.structural_rank, 1);
assert.equal(rankCases.RANK1_DISTINGUISHABLE_SCALAR.mutual_information_bits, 1.584963);
assert.equal(rankCases.RANK3_OBSERVER_INDEPENDENT.structural_rank, 3);
assert.equal(rankCases.RANK3_OBSERVER_INDEPENDENT.mutual_information_bits, 0);
assert.equal(rankLeakage.rank_orders_leakage, false);
assert.equal(rankLeakage.rank_is_secrecy_metric, false);

const joining = runJoiningKeySynergyAssay();
assert.equal(joining.feature_a_information_bits, 0);
assert.equal(joining.feature_b_information_bits, 0);
assert.equal(joining.joint_information_bits, 1);
assert.equal(joining.joining_synergy_proxy_bits, 1);
assert.equal(joining.positive_joining_synergy, true);
assert.equal(joining.partial_information_decomposition_claim, false);
assert.equal(joining.intrinsic_curvature_claim, false);
assert.match(joining.caveat, /not a complete partial-information decomposition/i);

const booleanCensus = runBooleanSynergyCensus();
assert.equal(booleanCensus.function_count, 16);
assert.equal(booleanCensus.complete_declared_family, true);
assert.equal(booleanCensus.seed_parity_function_count, 2);
assert.equal(booleanCensus.held_out_non_parity_function_count, 14);
assert.equal(booleanCensus.pure_synergy_count, 2);
assert.equal(booleanCensus.positive_excess_count, 10);
assert.equal(booleanCensus.positive_held_out_non_parity_count, 8);
assert.equal(booleanCensus.nonpositive_excess_count, 6);
assert.equal(booleanCensus.maximum_held_out_non_parity_excess_bits, 0.188722);
assert.deepEqual(booleanCensus.pure_synergy_function_ids.sort(), ['F06_XOR', 'F09_XNOR']);
assert.equal(evaluateBooleanFunction(8).function_id, 'F08_AND');
assert.equal(evaluateBooleanFunction(8).joining_synergy_proxy_bits, 0.188722);
assert.throws(() => evaluateBooleanFunction(16), /0 through 15/);
assert.equal(booleanCensus.generalization_beyond_declared_boolean_family, false);

const geometry = runInformationGeometryCalibration();
assert.equal(geometry.analytic_gaussian_curvature, 0.25);
assert.equal(geometry.analytic_scalar_curvature, 0.5);
assert.ok(geometry.calibration_points.every(point => point.square_root_embedding_norm_squared === 4));
assert.equal(geometry.metric_covariance_check_pass, true);
assert.ok(geometry.metric_determinant_covariance_error < 1e-12);
assert.equal(geometry.joining_synergy_original_bits, 1);
assert.equal(geometry.joining_synergy_bijective_relabel_bits, 1);
assert.equal(geometry.joining_synergy_relabel_invariant_in_fixture, true);
assert.equal(geometry.joining_synergy_has_declared_manifold_metric, false);
assert.equal(geometry.joining_synergy_has_declared_connection, false);
assert.equal(geometry.joining_synergy_intrinsic_curvature_claim_supported, false);
assert.match(geometry.finding, /does not supply a manifold/i);

const fisherSynergy = runFisherSynergyNonEquivalence();
assert.equal(fisherSynergy.categorical_joint_state_count, 8);
assert.equal(fisherSynergy.simplex_dimension, 7);
assert.equal(fisherSynergy.ambient_fisher_rao_scalar_curvature, 10.5);
assert.equal(fisherSynergy.noisy_xor.minimum_joint_state_probability, 0.025);
assert.equal(fisherSynergy.noisy_and.minimum_joint_state_probability, 0.025);
assert.equal(fisherSynergy.noisy_xor.joining_synergy_proxy_bits, 0.531004);
assert.equal(fisherSynergy.noisy_and.joining_synergy_proxy_bits, 0.118709);
assert.equal(fisherSynergy.joining_synergy_difference_bits, 0.412295);
assert.equal(fisherSynergy.same_ambient_scalar_curvature, true);
assert.equal(fisherSynergy.different_joining_synergy, true);
assert.equal(fisherSynergy.synergy_equals_ambient_fisher_scalar_curvature, false);
assert.equal(fisherSynergy.submanifold_or_extrinsic_geometry_ruled_out, false);

const baseline = reconstructTopology(RECONSTRUCTION_FRAGMENTS);
assert.equal(topologySimilarity(baseline), 1);

const reconstruction = runReconstructionAssay();
assert.equal(reconstruction.k, 4);
assert.equal(reconstruction.epsilon, 0.2);
assert.equal(reconstruction.subset_count, 126);
assert.equal(reconstruction.successful_subsets, 100);
assert.equal(reconstruction.reconstructive_redundancy_rho, 0.793651);
assert.equal(reconstruction.anisotropic_reconstruction_invariance, 0.9);
assert.equal(reconstruction.anisotropic_reconstruction_floor, 0.642857);
assert.equal(reconstruction.worst_case_transform, 'BIASED_TRUNCATION');
assert.equal(reconstruction.all_nonidentity_transforms_within_epsilon, false);
assert.equal(reconstruction.transforms.find(value => value.operator_id === 'BIASED_TRUNCATION').within_epsilon, false);
assert.equal(reconstruction.transforms.find(value => value.operator_id === 'RELATION_DROPOUT').within_epsilon, true);
assert.match(reconstruction.caveat, /mean ARI cannot erase/i);

const directional = runDirectionalExposureAssay();
assert.equal(directional.inbound_observable_dimensions, 12);
assert.equal(directional.outbound_disclosed_dimensions, 4);
assert.equal(directional.directional_exposure_ratio, 3);
assert.equal(directional.shannon_channel_capacity_claim, false);
assert.equal(directional.metric_kind, 'declared-dimension-count proxy');

const field = runOpenResearchField();
assert.equal(field.schema, A15_R0_OPEN_FIELD_SCHEMA);
assert.equal(field.source_status, 'SIMULATED');
assert.equal(field.authority_class, 'A2_DERIVATIONAL');
assert.equal(field.production_mutated, false);
assert.equal(field.external_transmission, false);
assert.equal(field.human_selection_required, true);
assert.equal(field.rank_leakage_non_equivalence.rank_is_secrecy_metric, false);
assert.equal(field.joining_key_synergy.joining_synergy_proxy_bits, 1);
assert.ok(field.claim_ceiling.includes('no universal zero-defense theorem'));
assert.ok(field.claim_ceiling.includes('no Shannon-capacity measurement'));
assert.ok(field.claim_ceiling.includes('structural rank is not a secrecy metric'));
assert.ok(field.claim_ceiling.includes('joining synergy proxy is not intrinsic curvature or full PID'));
assert.ok(field.claim_ceiling.includes('no claim that arbitrary fragments reconstruct a corpus'));
assert.ok(field.claim_ceiling.includes('mean ARI cannot erase a failing transform'));

const envelope = runBoundedTransformationEnvelope({ field });
const envelopeGates = Object.fromEntries(envelope.metric_gates.map(gate => [gate.gate_id, gate]));
assert.equal(envelope.schema, BOUNDED_TRANSFORMATION_ENVELOPE_SCHEMA);
assert.equal(envelopeGates.OBSERVER_FAMILY_LEAKAGE.value, 1.584963);
assert.equal(envelopeGates.OBSERVER_FAMILY_LEAKAGE.threshold, 0.5);
assert.equal(envelopeGates.OBSERVER_FAMILY_LEAKAGE.pass, false);
assert.equal(envelopeGates.RECONSTRUCTION_FLOOR_DISTANCE.value, 0.357143);
assert.equal(envelopeGates.RECONSTRUCTION_FLOOR_DISTANCE.threshold, 0.2);
assert.equal(envelopeGates.RECONSTRUCTION_FLOOR_DISTANCE.pass, false);
assert.equal(envelopeGates.JOINING_KEY_SYNERGY.value, 1);
assert.equal(envelopeGates.JOINING_KEY_SYNERGY.threshold, 0.1);
assert.equal(envelopeGates.JOINING_KEY_SYNERGY.pass, false);
assert.equal(envelope.evidence_gate.pass, false);
assert.equal(envelope.human_gate.pass, false);
assert.equal(envelope.all_declared_metric_gates_pass, false);
assert.equal(envelope.all_promotion_gates_pass, false);
assert.equal(envelope.status, 'HELD');
assert.equal(envelope.golden_egg_earned, false);
assert.equal(envelope.promotion_authority, false);
assert.equal(envelope.unknown_observers, 'UNMEASURED');
assert.equal(envelope.unknown_transforms, 'UNMEASURED');

const permissiveSyntheticEnvelope = runBoundedTransformationEnvelope({
  field,
  observer_family_leakage_bits: 2,
  reconstruction_distance: 0.4,
  joining_synergy_bits: 1
});
assert.equal(permissiveSyntheticEnvelope.all_declared_metric_gates_pass, true);
assert.equal(permissiveSyntheticEnvelope.all_promotion_gates_pass, false);
assert.equal(permissiveSyntheticEnvelope.status, 'HELD');
assert.equal(permissiveSyntheticEnvelope.golden_egg_earned, false);
assert.throws(() => runBoundedTransformationEnvelope({ field, joining_synergy_bits: -1 }), /finite non-negative/);

const feasibleRegion = buildGoldenEggFeasibleRegion({ field, booleanCensus });
assert.equal(feasibleRegion.formal_candidate_count, 320);
assert.equal(feasibleRegion.feasible_candidate_count, 24);
assert.equal(feasibleRegion.pareto_candidate_count, 18);
assert.equal(feasibleRegion.region_nonempty, true);
assert.equal(feasibleRegion.scalarized_score_defined, false);
assert.equal(feasibleRegion.factorization_assumption, true);
assert.equal(feasibleRegion.joint_realizability, 'UNMEASURED');
assert.equal(feasibleRegion.empirical_candidate_count, 0);
assert.equal(feasibleRegion.golden_egg_earned, false);
assert.equal(feasibleRegion.promotion_authority, false);
assert.ok(feasibleRegion.feasible_candidate_ids.every(id => id.startsWith('NULL_CONTENT::')));
assert.throws(() => buildGoldenEggFeasibleRegion({ field, booleanCensus, reconstruction_distance: -1 }), /finite non-negative/);

const hypothesisRegistry = buildOpenResearchHypothesisRegistry({ field, envelope, booleanCensus, geometry, fisherSynergy, feasibleRegion });
const hypotheses = Object.fromEntries(hypothesisRegistry.hypotheses.map(item => [item.hypothesis_id, item]));
assert.equal(hypothesisRegistry.schema, OPEN_RESEARCH_HYPOTHESIS_REGISTRY_SCHEMA);
assert.equal(hypothesisRegistry.hypotheses.length, 9);
assert.equal(hypothesisRegistry.closed_by_counterexample.length, 5);
assert.equal(hypothesisRegistry.bounded_support.length, 3);
assert.equal(hypothesisRegistry.research_frontier.length, 1);
assert.equal(hypothesisRegistry.sequence_authority, false);
assert.equal(hypothesisRegistry.next_stage, null);
assert.deepEqual(hypothesisRegistry.stage_unlocks, []);
assert.equal(hypothesisRegistry.promotion_authority, false);
assert.equal(hypothesisRegistry.human_closure_required, true);
assert.ok(hypothesisRegistry.hypotheses.every(item => item.falsifier.length > 0));
assert.equal(hypotheses.H_OBSERVER_INVARIANT_NULL.status, 'FALSIFIED_IN_SYNTHETIC_FIELD');
assert.equal(hypotheses.H_RANK_ORDERS_LEAKAGE.status, 'FALSIFIED_IN_SYNTHETIC_FIELD');
assert.equal(hypotheses.H_MARGINAL_SAFETY_IMPLIES_JOINT_SAFETY.status, 'FALSIFIED_IN_SYNTHETIC_FIELD');
assert.equal(hypotheses.H_MEAN_ARI_SUFFICIENT.status, 'FALSIFIED_IN_SYNTHETIC_FIELD');
assert.equal(hypotheses.H_SYNERGY_EQUALS_AMBIENT_FISHER_CURVATURE.status, 'FALSIFIED_IN_SYNTHETIC_FIELD');
assert.equal(hypotheses.H_SYNERGY_EQUALS_AMBIENT_FISHER_CURVATURE.evidence.ambient_scalar_curvature, 10.5);
assert.equal(hypotheses.H_BOUNDED_ENVELOPE_PREVENTS_SELF_PROMOTION.status, 'SUPPORTED_BY_SYNTHETIC_CONTRACT');
assert.equal(hypotheses.H_JOINING_SYNERGY_GENERALIZES.status, 'SUPPORTED_IN_BOUNDED_SYNTHETIC_FAMILY');
assert.equal(hypotheses.H_JOINING_SYNERGY_GENERALIZES.evidence.positive_held_out_non_parity_count, 8);
assert.equal(hypotheses.H_INFORMATION_CURVATURE_GEOMETRIC.status, 'OPEN_RESEARCH_PROGRAM');
assert.equal(hypotheses.H_INFORMATION_CURVATURE_GEOMETRIC.evidence.fisher_rao_positive_control_scalar_curvature, 0.5);
assert.equal(hypotheses.H_INFORMATION_CURVATURE_GEOMETRIC.evidence.intrinsic_curvature_claim_supported, false);
assert.equal(hypotheses.H_INFORMATION_CURVATURE_GEOMETRIC.evidence.ambient_fisher_identification_falsified, true);
assert.equal(hypotheses.H_GOLDEN_EGG_BOUNDED_REGION.status, 'SUPPORTED_IN_BOUNDED_SYNTHETIC_FAMILY');
assert.equal(hypotheses.H_GOLDEN_EGG_BOUNDED_REGION.evidence.formal_candidate_count, 320);
assert.equal(hypotheses.H_GOLDEN_EGG_BOUNDED_REGION.evidence.joint_realizability, 'UNMEASURED');
assert.deepEqual(hypothesisRegistry.bounded_support, [
  'H_BOUNDED_ENVELOPE_PREVENTS_SELF_PROMOTION',
  'H_JOINING_SYNERGY_GENERALIZES',
  'H_GOLDEN_EGG_BOUNDED_REGION'
]);
assert.deepEqual(hypothesisRegistry.research_frontier, ['H_INFORMATION_CURVATURE_GEOMETRIC']);

for (const marker of [
  'Open research field · noncanonical',
  'Competing hypotheses over one fixed substrate',
  'Mutual information under four observer models',
  'Anisotropy without fake Shannon capacity',
  'Rank is not leakage',
  'Joining-key synergy',
  'Admissibility-robust reconstructibility',
  'Bounded transformation envelope · criterion research only',
  'The Golden Egg candidate is allowed to fail',
  'Hypothesis frontier · no stage unlocks',
  'Research advances by falsifier, not nextness',
  'next_stage = null',
  'sequence_authority = false',
  'Falsification posture',
  'grants no production, deployment, or Golden Egg authority'
]) assert.ok(html.includes(marker), `Open field omitted visible marker: ${marker}`);

assert.match(html, /open-research-field\.css/);
assert.match(html, /open-research-field-ui\.js/);
for (const source of [modelSource, envelopeSource, booleanSource, fisherSource, goldenSource, geometrySource, hypothesisSource, uiSource]) {
  assert.doesNotMatch(source, /fetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|indexedDB|localStorage|sessionStorage|serviceWorker|caches\./);
}

console.log(JSON.stringify({
  ok: true,
  schema: 'td613.ash.a15-r0.open-research-field-test/v0.7',
  observability_models: observability.models.length,
  null_content_bits: byId.NULL_CONTENT.mutual_information_bits,
  null_side_channel_bits: byId.NULL_WITH_SIDE_CHANNEL.mutual_information_bits,
  null_policy_worst_case_bits: observability.null_policy_worst_case_information_bits,
  rank1_information_bits: rankCases.RANK1_DISTINGUISHABLE_SCALAR.mutual_information_bits,
  rank3_information_bits: rankCases.RANK3_OBSERVER_INDEPENDENT.mutual_information_bits,
  joining_synergy_bits: joining.joining_synergy_proxy_bits,
  boolean_functions_exhausted: booleanCensus.function_count,
  positive_held_out_boolean_functions: booleanCensus.positive_held_out_non_parity_count,
  fisher_rao_scalar_curvature_control: geometry.analytic_scalar_curvature,
  ambient_fisher_joint_scalar_curvature: fisherSynergy.ambient_fisher_rao_scalar_curvature,
  noisy_xor_synergy_bits: fisherSynergy.noisy_xor.joining_synergy_proxy_bits,
  noisy_and_synergy_bits: fisherSynergy.noisy_and.joining_synergy_proxy_bits,
  synergy_intrinsic_curvature_promoted: geometry.joining_synergy_intrinsic_curvature_claim_supported,
  formal_golden_egg_candidates: feasibleRegion.formal_candidate_count,
  feasible_formal_candidates: feasibleRegion.feasible_candidate_count,
  pareto_formal_candidates: feasibleRegion.pareto_candidate_count,
  joint_realizability: feasibleRegion.joint_realizability,
  rho: reconstruction.reconstructive_redundancy_rho,
  ari_mean: reconstruction.anisotropic_reconstruction_invariance,
  ari_floor: reconstruction.anisotropic_reconstruction_floor,
  worst_transform: reconstruction.worst_case_transform,
  envelope_status: envelope.status,
  envelope_metric_gates_pass: envelope.all_declared_metric_gates_pass,
  permissive_metrics_still_promote: permissiveSyntheticEnvelope.all_promotion_gates_pass,
  golden_egg_earned: envelope.golden_egg_earned,
  hypotheses: hypothesisRegistry.hypotheses.length,
  counterexample_closures: hypothesisRegistry.closed_by_counterexample.length,
  bounded_support: hypothesisRegistry.bounded_support.length,
  frontier: hypothesisRegistry.research_frontier.length,
  next_stage: hypothesisRegistry.next_stage,
  sequence_authority: hypothesisRegistry.sequence_authority,
  production_mutated: false,
  external_transmission: false,
  human_selection_required: true
}, null, 2));
