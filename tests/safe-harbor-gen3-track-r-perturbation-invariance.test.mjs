import assert from 'node:assert/strict';
import {
  PERTURBATION_SCHEMA,
  analyzeFeatureResponse,
  buildPerturbationInvarianceReceipt,
  perturbationReceiptContainsRawText
} from '../app/safe-harbor/research/safe-harbor-perturbation-invariance.js';

const elastic = await analyzeFeatureResponse('dash-density', {
  family: 'scalar', scale: 'micro', baseline: 0.5, perturbed: 1.5, recovery: [1.0, 0.72, 0.52], perturbation_level: 3, task_compliance_verified: true
}, { minimum_displacement: 0.05 });
assert.equal(elastic.verified_displacement, true);
assert.equal(elastic.recovery_claim_authorized, true);
assert.ok(['elastic','plastic'].includes(elastic.response_class));
assert.ok(elastic.recovery_half_life_transitions >= 1);
assert.equal(elastic.raw_text_included, false);

const noDisplacement = await analyzeFeatureResponse('comma-density', {
  family: 'scalar', scale: 'micro', baseline: 0.5, perturbed: 0.51, recovery: [0.5], task_compliance_verified: true
}, { minimum_displacement: 0.05 });
assert.equal(noDisplacement.verified_displacement, false);
assert.equal(noDisplacement.response_class, 'insufficient');
assert.equal(noDisplacement.recovery_claim_authorized, false);

const adaptive = await analyzeFeatureResponse('interruption-chamber', {
  family: 'scalar', scale: 'meso', baseline: 0.4, perturbed: 1.4, recovery: [1.1, 0.8], perturbation_level: 4,
  structural_substitution: { surface_marker_returned: false, functional_restoration_verified: true, substitute_surface: 'parenthetical interruption' }
});
assert.equal(adaptive.response_class, 'adaptive');

const promptScheduleDigest = `sha256:${'b'.repeat(64)}`;
const input = {
  prompt_schedule_digest: promptScheduleDigest,
  order_randomized: true,
  counterbalancing_method: 'latin-square',
  calibration_triads_completed: 4,
  blind_custody_challenge_ref: 'sha256:blind-result',
  features: {
    'dash-density': { family: 'scalar', scale: 'micro', baseline: 0.5, perturbed: 1.5, recovery: [1.0, 0.72, 0.52], perturbation_level: 3, task_compliance_verified: true },
    'interruption-chamber': { family: 'scalar', scale: 'meso', baseline: 0.4, perturbed: 1.4, recovery: [1.1, 0.8], perturbation_level: 4, structural_substitution: { surface_marker_returned: false, functional_restoration_verified: true, substitute_surface: 'parenthetical interruption' } },
    'argument-topology': { family: 'trajectory', scale: 'macro', baseline: [0.1,0.4,0.8], perturbed: [0.9,0.2,0.1], recovery: [[0.7,0.3,0.2],[0.4,0.35,0.6],[0.15,0.39,0.77]], perturbation_level: 5 }
  },
  trajectory_invariants: [{ trajectory_id: 'traj_01', scale: 'macro', state_sequence: ['claim','counterclaim','operational_closure'], perturbation_survival_rate: 0.7, median_recovery_transitions: 2, prompt_dependence: 'low' }],
  null_models: {
    prompt_only_controls: { status: 'measured', collision: false },
    topic_matched_controls: { status: 'measured', collision: false },
    semantic_paraphrase_controls: { status: 'measured', leakage: 'low' },
    same_author_static_baseline: { status: 'measured' },
    different_author_same_prompt: { status: 'measured' },
    lane_vocabulary_ablation: { status: 'measured' },
    feature_family_ablations: { status: 'measured' },
    embedding_model_substitution: { status: 'not-run', reason: 'no second local embedding model in synthetic fixture' }
  },
  latent_representation: {
    model_identity: 'synthetic-local-embedding-fixture', model_version: '1', model_or_artifact_digest: `sha256:${'c'.repeat(64)}`,
    preprocessing_policy: 'synthetic/v1', normalization_policy: 'l2', dimensionality: 3, distance_metric: 'cosine', findings: [{ finding_id: 'latent-1', model_dependent: true }]
  },
  mimicry_stress_test: { entrant: elastic, imitation: { ...elastic, recovery_ratio: 0.1, restorative_force_index: 0.01 } }
};
const receiptA = await buildPerturbationInvarianceReceipt(input);
const receiptB = await buildPerturbationInvarianceReceipt({ ...input, features: { 'argument-topology': input.features['argument-topology'], 'dash-density': input.features['dash-density'], 'interruption-chamber': input.features['interruption-chamber'] } });
assert.equal(receiptA.schema_version, PERTURBATION_SCHEMA);
assert.equal(receiptA.protocol.keystroke_telemetry_collected, false);
assert.equal(receiptA.protocol.pause_timing_collected, false);
assert.equal(receiptA.protocol.adaptive_personal_vulnerability_targeting, false);
assert.equal(receiptA.research_gate.status, 'research-only-unpromoted');
assert.ok(receiptA.research_gate.promotion_blockers.includes('twelve-distinct-triads-not-complete'));
assert.equal(receiptA.latent_representation_lane.model_dependent, true);
assert.equal(receiptA.latent_representation_lane.direct_cognition_access_claimed, false);
assert.equal(receiptA.response_classes.adaptive.includes('interruption-chamber'), true);
assert.equal(receiptA.feature_response_curves['argument-topology'].recovery_half_life_transitions >= 1, true);
assert.equal(receiptA.failure_registry.some((entry) => entry.code === 'displacement-not-demonstrated'), false);
assert.equal(perturbationReceiptContainsRawText(receiptA), false);
assert.match(receiptA.restoration_receipt.restoration_receipt_digest, /^sha256:[0-9a-f]{64}$/u);
assert.equal(receiptA.restoration_receipt.restoration_receipt_digest, receiptB.restoration_receipt.restoration_receipt_digest, 'receipt must survive key reordering');
assert.equal(receiptA.psychological_inference_performed, false);
assert.equal(receiptA.demographic_inference_performed, false);

const failedUptake = await buildPerturbationInvarianceReceipt({
  prompt_schedule_digest: promptScheduleDigest,
  features: { still: { family: 'scalar', baseline: 1, perturbed: 1, recovery: [1] } }
});
assert.equal(failedUptake.feature_response_curves.still.response_class, 'insufficient');
assert.equal(failedUptake.feature_response_curves.still.recovery_claim_authorized, false);
assert.ok(failedUptake.failure_registry.some((entry) => entry.code === 'displacement-not-demonstrated'));

const raw = await buildPerturbationInvarianceReceipt({ prompt_schedule_digest: promptScheduleDigest, raw_text: 'forbidden', features: {} });
assert.ok(raw.failure_registry.some((entry) => entry.code === 'raw-text-present'));
console.log('perturbation invariance: ok');
