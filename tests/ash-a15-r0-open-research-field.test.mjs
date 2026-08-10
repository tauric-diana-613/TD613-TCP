import assert from 'node:assert/strict';
import fs from 'node:fs';
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

const html = fs.readFileSync('app/dome-world/previews/a15-r0/index.html', 'utf8');
const modelSource = fs.readFileSync('app/dome-world/previews/a15-r0/open-research-field.js', 'utf8');
const uiSource = fs.readFileSync('app/dome-world/previews/a15-r0/open-research-field-ui.js', 'utf8');
const schema = JSON.parse(fs.readFileSync('app/dome-world/schemas/a15-r0/open-research-field-v02.schema.json', 'utf8'));

assert.equal(A15_R0_OPEN_FIELD_SCHEMA, 'td613.ash.a15-r0.open-research-field/v0.2');
assert.equal(schema.$id, A15_R0_OPEN_FIELD_SCHEMA);
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

for (const marker of [
  'Open research field · noncanonical',
  'Competing hypotheses over one fixed substrate',
  'Mutual information under four observer models',
  'Anisotropy without fake Shannon capacity',
  'Rank is not leakage',
  'Joining-key synergy',
  'Admissibility-robust reconstructibility',
  'Falsification posture',
  'grants no production, deployment, or Golden Egg authority'
]) assert.ok(html.includes(marker), `Open field omitted visible marker: ${marker}`);

assert.match(html, /open-research-field\.css/);
assert.match(html, /open-research-field-ui\.js/);
assert.doesNotMatch(modelSource, /fetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|indexedDB|localStorage|sessionStorage|serviceWorker|caches\./);
assert.doesNotMatch(uiSource, /fetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|indexedDB|localStorage|sessionStorage|serviceWorker|caches\./);

console.log(JSON.stringify({
  ok: true,
  schema: 'td613.ash.a15-r0.open-research-field-test/v0.2',
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
  production_mutated: false,
  external_transmission: false,
  human_selection_required: true
}, null, 2));
