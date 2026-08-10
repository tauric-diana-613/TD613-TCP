import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  BOUNDED_TRANSFORMATION_ENVELOPE_SCHEMA,
  runBoundedTransformationEnvelope
} from '../app/dome-world/previews/a15-r0/bounded-transformation-envelope.js';
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

const hypothesisRegistry = buildOpenResearchHypothesisRegistry({ field, envelope });
const hypotheses = Object.fromEntries(hypothesisRegistry.hypotheses.map(item => [item.hypothesis_id, item]));
assert.equal(hypothesisRegistry.schema, OPEN_RESEARCH_HYPOTHESIS_REGISTRY_SCHEMA);
assert.equal(hypothesisRegistry.hypotheses.length, 8);
assert.equal(hypothesisRegistry.closed_by_counterexample.length, 4);
assert.equal(hypothesisRegistry.research_frontier.length, 3);
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
assert.equal(hypotheses.H_BOUNDED_ENVELOPE_PREVENTS_SELF_PROMOTION.status, 'SUPPORTED_BY_SYNTHETIC_CONTRACT');
assert.equal(hypotheses.H_JOINING_SYNERGY_GENERALIZES.status, 'OPEN_UNMEASURED');
assert.equal(hypotheses.H_INFORMATION_CURVATURE_GEOMETRIC.status, 'OPEN_UNMEASURED');
assert.equal(hypotheses.H_GOLDEN_EGG_BOUNDED_REGION.status, 'OPEN_RESEARCH_PROGRAM');
assert.deepEqual(hypothesisRegistry.research_frontier, [
  'H_JOINING_SYNERGY_GENERALIZES',
  'H_INFORMATION_CURVATURE_GEOMETRIC',
  'H_GOLDEN_EGG_BOUNDED_REGION'
]);

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
for (const source of [modelSource, envelopeSource, hypothesisSource, uiSource]) {
  assert.doesNotMatch(source, /fetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|indexedDB|localStorage|sessionStorage|serviceWorker|caches\./);
}

console.log(JSON.stringify({
  ok: true,
  schema: 'td613.ash.a15-r0.open-research-field-test/v0.4',
  observability_models: observability.models.length,
  null_content_bits: byId.NULL_CONTENT.mutual_information_bits,
  null_side_channel_bits: byId.NULL_WITH_SIDE_CHANNEL.mutual_information_bits,
  null_policy_worst_case_bits: observability.null_policy_worst_case_information_bits,
  rank1_information_bits: rankCases.RANK1_DISTINGUISHABLE_SCALAR.mutual_information_bits,
  rank3_information_bits: rankCases.RANK3_OBSERVER_INDEPENDENT.mutual_information_bits,
  joining_synergy_bits: joining.joining_synergy_proxy_bits,
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
  frontier: hypothesisRegistry.research_frontier.length,
  next_stage: hypothesisRegistry.next_stage,
  sequence_authority: hypothesisRegistry.sequence_authority,
  production_mutated: false,
  external_transmission: false,
  human_selection_required: true
}, null, 2));
