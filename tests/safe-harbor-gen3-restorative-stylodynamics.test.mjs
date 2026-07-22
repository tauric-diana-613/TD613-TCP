import assert from 'node:assert/strict';

import {
  replayRestorativeStylodynamics,
  REQUIRED_NULLS,
  RESPONSE_CLASSES,
  restorativeContainsRawText,
  runRestorativeStylodynamics
} from '../app/safe-harbor/app/safe-harbor-gen3-restorative-stylodynamics.js';

const trajectories = [
  {
    feature_id: 'micro-comma-routing',
    scale: 'micro',
    family: 'punctuation-boundary',
    function_id: 'qualification-sequencing',
    perturbation_id: 'P1-formality',
    perturbation_level: 1,
    baseline: 0.2,
    perturbed: 0.8,
    recoveries: [0.6, 0.4, 0.25],
    normalization: 1,
    perturbation_complied: true
  },
  {
    feature_id: 'meso-contrast-return',
    scale: 'meso',
    family: 'rhetorical-transition',
    function_id: 'counterclaim-return',
    perturbation_id: 'P2-genre',
    perturbation_level: 2,
    baseline: 0.3,
    perturbed: 0.7,
    recoveries: [0.65, 0.6, 0.55],
    normalization: 1,
    perturbation_complied: true
  },
  {
    feature_id: 'macro-argument-topology',
    scale: 'macro',
    family: 'argument-topology',
    function_id: 'recursive-conclusion-return',
    perturbation_id: 'P3-register',
    perturbation_level: 3,
    baseline: 0.4,
    perturbed: 0.9,
    recoveries: [0.88, 0.87, 0.86],
    normalization: 1,
    perturbation_complied: true
  },
  {
    feature_id: 'meso-metaphor-marker',
    scale: 'meso',
    family: 'metaphor-transport',
    function_id: 'custodial-transition',
    perturbation_id: 'P1-formality',
    perturbation_level: 1,
    baseline: 0.2,
    perturbed: 0.7,
    recoveries: [0.5, 0.35, 0.3],
    normalization: 1,
    perturbation_complied: true
  },
  {
    feature_id: 'micro-overshoot',
    scale: 'micro',
    family: 'function-word-routing',
    function_id: 'boundary-return',
    perturbation_id: 'P1-formality',
    perturbation_level: 1,
    baseline: 0.5,
    perturbed: 0.8,
    recoveries: [0.6, 0.45],
    normalization: 1,
    perturbation_complied: true
  },
  {
    feature_id: 'micro-insufficient-displacement',
    scale: 'micro',
    family: 'lexical-shape',
    perturbation_id: 'P1-formality',
    perturbation_level: 1,
    baseline: 0.2,
    perturbed: 0.21,
    recoveries: [0.2],
    normalization: 1,
    perturbation_complied: true
  }
];

const structuralSubstitutions = [
  {
    original_feature_id: 'meso-metaphor-marker',
    substitute_feature_id: 'meso-explicit-custody-transition',
    function_id: 'custodial-transition',
    function_preserved: true,
    evidence_digest: 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
  }
];

function shiftedControl(label, shift = 0.05) {
  return {
    control_class: label,
    provenance: `unmistakably-synthetic-${label}`,
    trajectories: trajectories.slice(0, 3).map((record, index) => ({
      ...record,
      feature_id: `${label}-${index + 1}`,
      baseline: record.baseline + shift,
      perturbed: record.perturbed - shift,
      recoveries: record.recoveries.map((value) => value + (index % 2 ? shift : -shift))
    }))
  };
}

const latentLane = {
  model: {
    model_id: 'synthetic-narrative-state-encoder-v1',
    model_digest: 'sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    preprocessing: 'synthetic-observable-organization-only',
    normalization: 'unit-range',
    dimensionality: 4,
    distance_policy: 'normalized-l1'
  },
  baseline_embedding: [0.1, 0.2, 0.3, 0.4],
  perturbed_embedding: [0.8, 0.7, 0.6, 0.5],
  recovery_embeddings: [
    [0.6, 0.5, 0.45, 0.45],
    [0.3, 0.3, 0.35, 0.42],
    [0.15, 0.22, 0.31, 0.4]
  ]
};

const alternateLatent = {
  model: {
    model_id: 'synthetic-narrative-state-encoder-v2',
    model_digest: 'sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    preprocessing: 'synthetic-observable-organization-only',
    normalization: 'unit-range',
    dimensionality: 4,
    distance_policy: 'normalized-l1'
  },
  baseline_embedding: [0.1, 0.2, 0.3, 0.4],
  perturbed_embedding: [0.75, 0.68, 0.58, 0.52],
  recovery_embeddings: [
    [0.58, 0.48, 0.43, 0.46],
    [0.28, 0.29, 0.34, 0.41],
    [0.14, 0.21, 0.3, 0.4]
  ]
};

const input = {
  trajectories,
  structural_substitutions: structuralSubstitutions,
  latent_lane: latentLane,
  null_controls: {
    prompt_only: shiftedControl('prompt-only-control', 0.02),
    topic_matched: shiftedControl('topic-matched-control', 0.04),
    semantic_paraphrase: shiftedControl('semantic-paraphrase-control', 0.06),
    same_author_static: shiftedControl('same-author-static-baseline', 0.08),
    different_author_same_prompt: shiftedControl('different-author-same-prompt-control', 0.1),
    lane_vocabulary_ablation: shiftedControl('lane-vocabulary-ablation', 0.03),
    feature_family_ablation: shiftedControl('feature-family-ablation', 0.07),
    embedding_model_substitution: alternateLatent
  },
  imitation: {
    provenance: 'unmistakably-synthetic-imitation-under-deformation',
    trajectories: trajectories.map((record) => ({ ...record }))
  }
};

const options = {
  researchMode: true,
  explicitConsent: true,
  calibrationTriadCount: 0,
  createdAtUtc: '2026-07-22T21:30:00Z',
  perturbationTaxonomy: [
    { perturbation_id: 'P1-formality', class: 'style-register' },
    { perturbation_id: 'P2-genre', class: 'genre' },
    { perturbation_id: 'P3-register', class: 'register' }
  ],
  featurePolicy: {
    micro: ['punctuation', 'function-words'],
    meso: ['rhetorical-transition', 'metaphor'],
    macro: ['argument-topology']
  }
};

const resultA = await runRestorativeStylodynamics(input, options);
const resultB = await runRestorativeStylodynamics({
  imitation: input.imitation,
  null_controls: {
    feature_family_ablation: input.null_controls.feature_family_ablation,
    prompt_only: input.null_controls.prompt_only,
    embedding_model_substitution: input.null_controls.embedding_model_substitution,
    same_author_static: input.null_controls.same_author_static,
    semantic_paraphrase: input.null_controls.semantic_paraphrase,
    lane_vocabulary_ablation: input.null_controls.lane_vocabulary_ablation,
    topic_matched: input.null_controls.topic_matched,
    different_author_same_prompt: input.null_controls.different_author_same_prompt
  },
  latent_lane: input.latent_lane,
  structural_substitutions: input.structural_substitutions,
  trajectories: input.trajectories
}, {
  ...options,
  featurePolicy: {
    macro: ['argument-topology'],
    meso: ['rhetorical-transition', 'metaphor'],
    micro: ['punctuation', 'function-words']
  }
});

assert.equal(resultA.schema_version, 'td613.safe-harbor.restorative-stylodynamics/v1');
assert.equal(resultA.result_digest, resultB.result_digest, 'research receipt must survive input key reordering');
assert.equal(resultA.protocol.research_mode, true);
assert.equal(resultA.protocol.baseline_intake_mandatory, false);
assert.equal(resultA.protocol.explicit_consent_recorded, true);
assert.equal(resultA.protocol.private_vulnerability_targeting, false);
assert.equal(resultA.protocol.adaptive_emotional_pressure, false);
assert.equal(resultA.protocol.keystroke_telemetry_collected, false);
assert.equal(resultA.protocol.pause_timing_collected, false);
assert.equal(resultA.protocol.covert_behavioral_biometrics_collected, false);
assert.equal(resultA.protocol.raw_text_exported, false);
assert.equal(resultA.protocol.external_identity_data_consumed, false);
assert.match(resultA.precommitment.precommitment_digest, /^sha256:[0-9a-f]{64}$/u);
assert.match(resultA.precommitment.transparent_policy_digest, /^sha256:[0-9a-f]{64}$/u);
assert.match(resultA.precommitment.input_manifest_digest, /^sha256:[0-9a-f]{64}$/u);
assert.match(resultA.precommitment.model_contract_digest, /^sha256:[0-9a-f]{64}$/u);
assert.equal(resultA.precommitment.raw_text_exported, false);
assert.equal(resultA.precommitment.private_vulnerability_targeting, false);
assert.deepEqual(Object.keys(resultA.transparent_feature_lane.scales).sort(), ['macro', 'meso', 'micro']);
assert.equal(resultA.transparent_feature_lane.feature_trajectories.length, trajectories.length);
assert.ok(resultA.transparent_feature_lane.trajectory_invariants.length >= 2);
assert.equal(resultA.transparent_feature_lane.raw_text_included, false);

const byId = Object.fromEntries(resultA.transparent_feature_lane.feature_trajectories.map((record) => [record.feature_id, record]));
assert.equal(byId['micro-comma-routing'].response_class, 'elastic');
assert.equal(byId['meso-contrast-return'].response_class, 'plastic');
assert.equal(byId['macro-argument-topology'].response_class, 'brittle');
assert.equal(byId['meso-metaphor-marker'].response_class, 'adaptive');
assert.equal(byId['micro-insufficient-displacement'].response_class, 'insufficient-response');
assert.equal(byId['micro-insufficient-displacement'].metrics.displacement_verified, false);
assert.equal(byId['micro-insufficient-displacement'].metrics.recovery_claim_permitted, false);
assert.equal(byId['micro-insufficient-displacement'].metrics.recovery_half_life_prompt_transitions, null);
assert.equal(byId['micro-insufficient-displacement'].metrics.residual_plasticity, null);
assert.ok(byId['micro-comma-routing'].metrics.recovery_ratio >= 0.8);
assert.ok(byId['micro-comma-routing'].metrics.recovery_half_life_prompt_transitions >= 1);
assert.ok(byId['micro-comma-routing'].metrics.restorative_force_index > 0);
assert.ok(byId['micro-overshoot'].metrics.overshoot > 0);
assert.ok(byId['meso-contrast-return'].metrics.hysteresis >= 0);
assert.equal(byId['meso-metaphor-marker'].structural_substitution.function_preserved, true);
assert.ok(RESPONSE_CLASSES.every((responseClass) => Object.hasOwn(resultA.restoration_receipt.response_classes, responseClass)));
assert.equal(resultA.restoration_receipt.verified_displacement_feature_count, 5);
assert.equal(resultA.restoration_receipt.total_feature_count, 6);
assert.match(resultA.restoration_receipt.transparent_lane_digest, /^sha256:[0-9a-f]{64}$/u);
assert.match(resultA.restoration_receipt.latent_lane_digest, /^sha256:[0-9a-f]{64}$/u);
assert.match(resultA.restoration_receipt.restoration_receipt_digest, /^sha256:[0-9a-f]{64}$/u);
assert.equal(resultA.restoration_receipt.identity_probability, null);
assert.equal(resultA.restoration_receipt.psychological_inference_performed, false);
assert.equal(resultA.restoration_receipt.demographic_inference_performed, false);
assert.equal(resultA.restoration_receipt.cognitive_access_claimed, false);
assert.equal(resultA.restoration_receipt.literal_physical_force_claimed, false);
assert.equal(resultA.restoration_receipt.raw_text_included, false);
assert.ok(resultA.restoration_receipt.uncertainty.includes('do not establish cognition'));

assert.equal(resultA.latent_representation_lane.status, 'measured');
assert.equal(resultA.latent_representation_lane.model_dependent, true);
assert.equal(resultA.latent_representation_lane.description, 'Narrative-state embeddings derived from observable textual organization under declared elicitation conditions.');
assert.equal(resultA.latent_representation_lane.model_identity.model_digest, latentLane.model.model_digest);
assert.equal(resultA.latent_representation_lane.findings.recovery_claim_permitted, true);

assert.deepEqual(resultA.null_models.required, REQUIRED_NULLS);
assert.deepEqual(resultA.null_models.missing_or_insufficient, []);
for (const requiredNull of REQUIRED_NULLS) assert.ok(resultA.null_models.results[requiredNull], `missing null ${requiredNull}`);
assert.ok(['chronology-sensitive-candidate', 'chronology-non-diagnostic'].includes(resultA.null_models.results['chronology-destruction'].authority));
assert.ok(['candidate-only', 'reduced'].includes(resultA.null_models.results['chronology-destruction'].dynamic_signature_authority));
assert.equal(resultA.null_models.results['chronology-destruction'].chronology_claimed, false);
assert.equal(resultA.null_models.results['prompt-only-control'].status, 'measured');
assert.equal(resultA.null_models.results['topic-matched-control'].status, 'measured');
assert.equal(resultA.null_models.results['semantic-paraphrase-control'].status, 'measured');
assert.equal(resultA.null_models.results['same-author-static-baseline'].status, 'measured');
assert.equal(resultA.null_models.results['different-author-same-prompt-control'].status, 'measured');
assert.equal(resultA.null_models.results['lane-vocabulary-ablation'].status, 'measured');
assert.equal(resultA.null_models.results['feature-family-ablation'].status, 'measured');
assert.equal(resultA.null_models.results['embedding-model-substitution'].status, 'measured');
assert.ok(['model-robust-candidate', 'model-sensitive'].includes(resultA.null_models.results['embedding-model-substitution'].authority));
assert.equal(resultA.null_models.results['mimicry-under-deformation'].status, 'measured');
assert.equal(resultA.null_models.results['mimicry-under-deformation'].imitation_collision, true);
assert.equal(resultA.mimicry_under_deformation.imitation_collision, true);
assert.ok(resultA.failure_registry.some((failure) => failure.code === 'MIMICRY-UNDER-DEFORMATION-COLLISION'));
assert.ok(resultA.failure_registry.some((failure) => failure.code === 'FEATURE-DISPLACEMENT-NOT-DEMONSTRATED'));
assert.equal(resultA.critical_deformation_threshold.status, 'threshold-observed');
assert.equal(resultA.critical_deformation_threshold.critical_level, 2);

assert.equal(resultA.promotion_gate.state, 'CODE-COMPLETE-UNPROMOTED');
assert.equal(resultA.promotion_gate.calibration_triads_observed, 0);
assert.equal(resultA.promotion_gate.calibration_triads_required, 12);
assert.ok(resultA.promotion_gate.blockers.includes('calibration-triads-below-12'));
assert.equal(resultA.promotion_gate.production_deployment_authorized, false);
assert.equal(resultA.promotion_gate.baseline_intake_promotion_authorized, false);
assert.equal(resultA.promotion_gate.separate_promotion_pr_required, true);
assert.equal(restorativeContainsRawText(resultA), false);
assert.equal(JSON.stringify(resultA).includes('civil identity proved'), false);
assert.equal(JSON.stringify(resultA).includes('unforgeable'), true, 'the prohibited claim must remain visibly named inside the claim ceiling');

const replay = await replayRestorativeStylodynamics(resultA, input, options);
assert.equal(replay.status, 'pass');
assert.equal(replay.checks.precommitment_digest, true);
assert.equal(replay.checks.transparent_lane_digest, true);
assert.equal(replay.checks.latent_lane_digest, true);
assert.equal(replay.checks.restoration_receipt_digest, true);
assert.equal(replay.checks.result_digest, true);

const noDisplacementInput = {
  trajectories: [
    {
      feature_id: 'no-displacement-1',
      scale: 'micro',
      family: 'punctuation',
      baseline: 0.2,
      perturbed: 0.21,
      recoveries: [0.2]
    },
    {
      feature_id: 'no-displacement-2',
      scale: 'meso',
      family: 'transition',
      baseline: 0.4,
      perturbed: 0.41,
      recoveries: [0.4]
    }
  ]
};
const noDisplacement = await runRestorativeStylodynamics(noDisplacementInput, {
  researchMode: true,
  explicitConsent: true
});
assert.ok(noDisplacement.failure_registry.some((failure) => failure.code === 'NO-DEMONSTRATED-DISPLACEMENT'));
assert.equal(noDisplacement.restoration_receipt.verified_displacement_feature_count, 0);
assert.equal(noDisplacement.restoration_receipt.mean_recovery_ratio, null);
for (const record of noDisplacement.transparent_feature_lane.feature_trajectories) {
  assert.equal(record.metrics.recovery_claim_permitted, false);
  assert.equal(record.response_class, 'insufficient-response');
}
assert.ok(noDisplacement.promotion_gate.blockers.includes('no-demonstrated-displacement'));

const closedGate = await runRestorativeStylodynamics(input, {
  ...options,
  researchMode: false
});
assert.ok(closedGate.failure_registry.some((failure) => failure.code === 'RESEARCH-GATE-CLOSED'));
assert.ok(closedGate.promotion_gate.blockers.includes('research-gate-closed'));
assert.equal(closedGate.protocol.research_mode, false);
assert.equal(closedGate.promotion_gate.production_deployment_authorized, false);

const missingModelMetadata = await runRestorativeStylodynamics({
  ...input,
  latent_lane: {
    model: { model_id: 'incomplete' },
    baseline_embedding: [0.1, 0.2],
    perturbed_embedding: [0.8, 0.9],
    recovery_embeddings: [[0.2, 0.3]]
  }
}, options);
assert.equal(missingModelMetadata.latent_representation_lane.status, 'invalid-or-incomplete-model-contract');
assert.ok(missingModelMetadata.latent_representation_lane.missing_model_fields.includes('model_digest'));
assert.equal(missingModelMetadata.restoration_receipt.model_dependent_findings_present, false);

const sparseNulls = await runRestorativeStylodynamics({ trajectories: trajectories.slice(0, 2) }, options);
assert.ok(sparseNulls.null_models.missing_or_insufficient.includes('prompt-only-control'));
assert.ok(sparseNulls.promotion_gate.blockers.some((blocker) => blocker.startsWith('required-nulls-incomplete:')));
assert.equal(sparseNulls.promotion_gate.state, 'CODE-COMPLETE-UNPROMOTED');

console.log('safe-harbor-gen3-restorative-stylodynamics: ok');
