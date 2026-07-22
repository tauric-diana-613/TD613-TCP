import { stableCanonicalJson } from './safe-harbor-stylometry-v3.js';

export const RESTORATIVE_SCHEMA = 'td613.safe-harbor.restorative-stylodynamics/v1';
export const RESTORATION_RECEIPT_SCHEMA = 'td613.safe-harbor.restoration-receipt/v1';
export const RESTORATIVE_PROTOCOL = 'td613.safe-harbor.perturbation-invariance-protocol/v1';
export const RESTORATIVE_PRECOMMITMENT = 'td613.safe-harbor.restorative-precommitment/v1';
export const RESPONSE_CLASSES = Object.freeze([
  'elastic',
  'plastic',
  'brittle',
  'adaptive',
  'insufficient-response'
]);
export const REQUIRED_NULLS = Object.freeze([
  'shuffled-trajectory-null',
  'prompt-only-control',
  'topic-matched-control',
  'semantic-paraphrase-control',
  'same-author-static-baseline',
  'different-author-same-prompt-control',
  'lane-vocabulary-ablation',
  'feature-family-ablation',
  'embedding-model-substitution',
  'chronology-destruction',
  'mimicry-under-deformation'
]);

const SCALES = Object.freeze(['micro', 'meso', 'macro']);
const DEFAULT_THRESHOLDS = Object.freeze({
  minimum_displacement: 0.08,
  elastic_recovery_ratio: 0.8,
  brittle_recovery_ratio: 0.2,
  maximum_elastic_residual: 0.2,
  adaptive_substitution_recovery: 0.5,
  chronology_equivalence_tolerance: 0.04,
  mimicry_collision_similarity: 0.95,
  recovered_within_horizon_ratio: 0.65,
  minimum_control_features: 2
});

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function isObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function clamp01(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function round(value, places = 6) {
  if (!Number.isFinite(value)) return 0;
  const scale = 10 ** places;
  return Math.round(value * scale) / scale;
}

function mean(values = []) {
  const finite = values.map(Number).filter(Number.isFinite);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : 0;
}

function median(values = []) {
  const finite = values.map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  if (!finite.length) return null;
  const middle = Math.floor(finite.length / 2);
  return finite.length % 2 ? finite[middle] : (finite[middle - 1] + finite[middle]) / 2;
}

async function sha256Hex(value) {
  const source = String(value || '');
  if (globalThis.crypto?.subtle && globalThis.TextEncoder) {
    const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(source));
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  const crypto = await import('node:crypto');
  return crypto.createHash('sha256').update(source).digest('hex');
}

async function taggedDigest(value) {
  return `sha256:${await sha256Hex(typeof value === 'string' ? value : stableCanonicalJson(value))}`;
}

function scalarDistance(left, right, normalization = 1) {
  const scale = Math.max(Math.abs(Number(normalization) || 1), 0.000001);
  return clamp01(Math.abs(Number(left || 0) - Number(right || 0)) / scale);
}

function vectorDistance(left = [], right = []) {
  const length = Math.max(left.length, right.length, 1);
  let sum = 0;
  for (let index = 0; index < length; index += 1) {
    const a = Number(left[index] || 0);
    const b = Number(right[index] || 0);
    const scale = Math.max(1, Math.abs(a), Math.abs(b));
    sum += Math.min(1, Math.abs(a - b) / scale);
  }
  return round(sum / length);
}

function signedDirection(baseline, perturbed) {
  const delta = Number(perturbed || 0) - Number(baseline || 0);
  return delta === 0 ? 0 : delta > 0 ? 1 : -1;
}

function firstHalfLife(residualDistances, displacement) {
  if (!displacement) return null;
  const threshold = displacement * 0.5;
  const index = residualDistances.findIndex((distance) => distance <= threshold);
  return index < 0 ? null : index + 1;
}

function restorativeForce(residualDistances, displacement) {
  if (!displacement || !residualDistances.length) return 0;
  let previous = displacement;
  let positiveReduction = 0;
  for (const residual of residualDistances) {
    positiveReduction += Math.max(0, previous - residual);
    previous = residual;
  }
  return round(positiveReduction / displacement);
}

function hysteresisIndex(residualDistances, displacement) {
  if (!displacement || !residualDistances.length) return 0;
  const normalized = residualDistances.map((distance) => clamp01(distance / displacement));
  const ideal = normalized.map((_, index) => Math.max(0, 1 - ((index + 1) / normalized.length)));
  return round(mean(normalized.map((value, index) => Math.abs(value - ideal[index]))));
}

function overshootIndex(baseline, perturbed, recoveries, displacement) {
  if (!displacement || !recoveries.length) return 0;
  const direction = signedDirection(baseline, perturbed);
  const finalDirection = signedDirection(baseline, recoveries[recoveries.length - 1]);
  if (!direction || !finalDirection || direction === finalDirection) return 0;
  return round(Math.abs(Number(recoveries[recoveries.length - 1]) - Number(baseline)) / displacement);
}

function substitutionForFeature(featureId, substitutions = []) {
  return substitutions.find((record) => record.original_feature_id === featureId) || null;
}

function classifyResponse(metrics, substitution, thresholds) {
  if (!metrics.displacement_verified) return 'insufficient-response';
  if (substitution?.function_preserved === true && metrics.recovery_ratio >= thresholds.adaptive_substitution_recovery) return 'adaptive';
  if (metrics.recovery_ratio >= thresholds.elastic_recovery_ratio && metrics.residual_plasticity <= thresholds.maximum_elastic_residual) return 'elastic';
  if (metrics.recovery_ratio <= thresholds.brittle_recovery_ratio && metrics.residual_plasticity >= (1 - thresholds.brittle_recovery_ratio)) return 'brittle';
  return 'plastic';
}

function trajectoryCore(record = {}, thresholds = DEFAULT_THRESHOLDS, substitutions = []) {
  const normalization = Number(record.normalization || 1);
  const baseline = Number(record.baseline || 0);
  const perturbed = Number(record.perturbed || 0);
  const recoveries = Array.isArray(record.recoveries) ? record.recoveries.map(Number) : [];
  const displacementAmplitude = scalarDistance(baseline, perturbed, normalization);
  const perturbationComplied = record.perturbation_complied !== false;
  const displacementVerified = perturbationComplied && displacementAmplitude >= thresholds.minimum_displacement;
  const residualDistances = recoveries.map((value) => scalarDistance(baseline, value, normalization));
  const lastResidual = residualDistances.length ? residualDistances[residualDistances.length - 1] : displacementAmplitude;
  const recoveryRatio = displacementVerified
    ? clamp01((displacementAmplitude - lastResidual) / Math.max(displacementAmplitude, 0.000001))
    : 0;
  const substitution = substitutionForFeature(record.feature_id, substitutions);
  const metrics = {
    displacement_amplitude: round(displacementAmplitude),
    displacement_verified: displacementVerified,
    perturbation_complied: perturbationComplied,
    recovery_ratio: round(recoveryRatio),
    recovery_half_life_prompt_transitions: displacementVerified ? firstHalfLife(residualDistances, displacementAmplitude) : null,
    residual_plasticity: displacementVerified ? round(lastResidual / Math.max(displacementAmplitude, 0.000001)) : null,
    restorative_force_index: displacementVerified ? restorativeForce(residualDistances, displacementAmplitude) : null,
    overshoot: displacementVerified ? overshootIndex(baseline, perturbed, recoveries, displacementAmplitude) : null,
    hysteresis: displacementVerified ? hysteresisIndex(residualDistances, displacementAmplitude) : null,
    recovery_claim_permitted: displacementVerified,
    recovery_observed_within_horizon: displacementVerified && recoveryRatio >= thresholds.recovered_within_horizon_ratio,
    recovery_transition_count: recoveries.length,
    normalized_residual_path: displacementVerified
      ? residualDistances.map((distance) => round(distance / Math.max(displacementAmplitude, 0.000001)))
      : []
  };
  return {
    feature_id: String(record.feature_id || ''),
    scale: SCALES.includes(record.scale) ? record.scale : 'micro',
    family: String(record.family || 'unclassified'),
    function_id: record.function_id || null,
    perturbation_id: record.perturbation_id || null,
    perturbation_level: Number.isFinite(Number(record.perturbation_level)) ? Number(record.perturbation_level) : 1,
    metrics,
    structural_substitution: substitution ? {
      substitute_feature_id: substitution.substitute_feature_id || null,
      function_id: substitution.function_id || record.function_id || null,
      function_preserved: substitution.function_preserved === true,
      evidence_digest: substitution.evidence_digest || null
    } : null,
    response_class: classifyResponse(metrics, substitution, thresholds),
    raw_text_included: false
  };
}

function profileVector(records = []) {
  const vector = [];
  for (const scale of SCALES) {
    const selected = records.filter((record) => record.scale === scale);
    vector.push(round(mean(selected.map((record) => record.metrics.displacement_amplitude))));
    vector.push(round(mean(selected.map((record) => record.metrics.recovery_ratio))));
    vector.push(round(mean(selected.map((record) => record.metrics.residual_plasticity).filter(Number.isFinite))));
    vector.push(round(mean(selected.map((record) => record.metrics.restorative_force_index).filter(Number.isFinite))));
    vector.push(round(mean(selected.map((record) => record.metrics.hysteresis).filter(Number.isFinite))));
  }
  return vector;
}

function summarizeScale(records, scale) {
  const selected = records.filter((record) => record.scale === scale);
  const verified = selected.filter((record) => record.metrics.displacement_verified);
  return {
    scale,
    feature_count: selected.length,
    verified_displacement_count: verified.length,
    mean_displacement_amplitude: round(mean(selected.map((record) => record.metrics.displacement_amplitude))),
    mean_recovery_ratio: verified.length ? round(mean(verified.map((record) => record.metrics.recovery_ratio))) : null,
    median_recovery_half_life_prompt_transitions: median(verified.map((record) => record.metrics.recovery_half_life_prompt_transitions).filter(Number.isFinite)),
    mean_residual_plasticity: verified.length ? round(mean(verified.map((record) => record.metrics.residual_plasticity).filter(Number.isFinite))) : null,
    mean_restorative_force_index: verified.length ? round(mean(verified.map((record) => record.metrics.restorative_force_index).filter(Number.isFinite))) : null,
    mean_overshoot: verified.length ? round(mean(verified.map((record) => record.metrics.overshoot).filter(Number.isFinite))) : null,
    mean_hysteresis: verified.length ? round(mean(verified.map((record) => record.metrics.hysteresis).filter(Number.isFinite))) : null,
    response_classes: Object.fromEntries(RESPONSE_CLASSES.map((responseClass) => [
      responseClass,
      selected.filter((record) => record.response_class === responseClass).length
    ])),
    raw_text_included: false
  };
}

function trajectoryInvariants(records = []) {
  const invariants = [];
  for (const record of records) {
    const substitutionPreserved = record.structural_substitution?.function_preserved === true;
    if (record.metrics.displacement_verified && (
      record.metrics.recovery_ratio >= 0.65
      || substitutionPreserved
    )) {
      invariants.push({
        invariant_id: `TRI-${record.feature_id}`,
        feature_id: record.feature_id,
        scale: record.scale,
        family: record.family,
        invariant_type: substitutionPreserved ? 'functional-invariant-through-substitution' : 'trajectory-return-invariant',
        recovery_ratio: record.metrics.recovery_ratio,
        function_id: record.function_id,
        response_class: record.response_class,
        raw_text_included: false
      });
    }
  }
  return invariants;
}

function chronologyNull(trajectories = [], thresholds = DEFAULT_THRESHOLDS, substitutions = []) {
  const reversedInputs = trajectories.map((record) => ({
    ...record,
    recoveries: Array.isArray(record.recoveries) ? record.recoveries.slice().reverse() : []
  }));
  const original = trajectories.map((record) => trajectoryCore(record, thresholds, substitutions));
  const reversed = reversedInputs.map((record) => trajectoryCore(record, thresholds, substitutions));
  const originalProfile = profileVector(original);
  const reversedProfile = profileVector(reversed);
  const separation = vectorDistance(originalProfile, reversedProfile);
  return {
    schema_version: 'td613.safe-harbor.restorative-chronology-null/v1',
    normalized_separation: separation,
    authority: separation <= thresholds.chronology_equivalence_tolerance
      ? 'chronology-non-diagnostic'
      : 'chronology-sensitive-candidate',
    dynamic_signature_authority: separation <= thresholds.chronology_equivalence_tolerance ? 'reduced' : 'candidate-only',
    chronology_claimed: false,
    adverse_result_preserved: true,
    raw_text_included: false
  };
}

function criticalDeformationThreshold(records = [], thresholds = DEFAULT_THRESHOLDS) {
  const levels = Array.from(new Set(records.map((record) => record.perturbation_level))).sort((a, b) => a - b);
  const levelResults = levels.map((level) => {
    const atLevel = records.filter((record) => record.perturbation_level === level && record.metrics.displacement_verified);
    const meanRecovery = atLevel.length ? round(mean(atLevel.map((record) => record.metrics.recovery_ratio))) : null;
    return {
      level,
      verified_feature_count: atLevel.length,
      mean_recovery_ratio: meanRecovery,
      recovered_within_horizon: Number.isFinite(meanRecovery) && meanRecovery >= thresholds.recovered_within_horizon_ratio
    };
  });
  const firstFailure = levelResults.find((level) => level.verified_feature_count > 0 && !level.recovered_within_horizon) || null;
  return {
    schema_version: 'td613.safe-harbor.critical-deformation-threshold/v1',
    levels: levelResults,
    critical_level: firstFailure?.level ?? null,
    status: firstFailure ? 'threshold-observed' : levelResults.length ? 'not-reached' : 'insufficient-evidence',
    claim: firstFailure
      ? 'First tested perturbation level at which mean verified recovery failed within the declared horizon.'
      : 'No critical threshold established within the tested field.',
    raw_text_included: false
  };
}

function controlProfile(control = {}, thresholds, substitutions) {
  const trajectories = Array.isArray(control.trajectories) ? control.trajectories : [];
  const records = trajectories.map((record) => trajectoryCore(record, thresholds, substitutions));
  return {
    status: records.length >= thresholds.minimum_control_features ? 'measured' : 'insufficient-control',
    feature_count: records.length,
    profile_vector: profileVector(records),
    response_classes: Object.fromEntries(RESPONSE_CLASSES.map((responseClass) => [
      responseClass,
      records.filter((record) => record.response_class === responseClass).length
    ])),
    raw_text_included: false
  };
}

function runNamedNulls(primaryRecords, input = {}, thresholds = DEFAULT_THRESHOLDS, substitutions = []) {
  const primaryProfile = profileVector(primaryRecords);
  const named = {
    'prompt-only-control': input.null_controls?.prompt_only,
    'topic-matched-control': input.null_controls?.topic_matched,
    'semantic-paraphrase-control': input.null_controls?.semantic_paraphrase,
    'same-author-static-baseline': input.null_controls?.same_author_static,
    'different-author-same-prompt-control': input.null_controls?.different_author_same_prompt,
    'lane-vocabulary-ablation': input.null_controls?.lane_vocabulary_ablation,
    'feature-family-ablation': input.null_controls?.feature_family_ablation
  };
  const results = {};
  for (const [name, control] of Object.entries(named)) {
    const profile = controlProfile(control || {}, thresholds, substitutions);
    results[name] = {
      ...profile,
      normalized_distance_from_primary: profile.status === 'measured' ? vectorDistance(primaryProfile, profile.profile_vector) : null,
      normalized_similarity_to_primary: profile.status === 'measured' ? round(1 - vectorDistance(primaryProfile, profile.profile_vector)) : null,
      control_class: control?.control_class || name,
      provenance: control?.provenance || 'not-provided',
      adverse_result_preserved: true
    };
  }
  return results;
}

function latentLane(input = {}) {
  const lane = input.latent_lane;
  if (!isObject(lane)) {
    return {
      status: 'not-provided',
      model_dependent: true,
      model_identity: null,
      findings: null,
      raw_text_included: false
    };
  }
  const model = lane.model || {};
  const required = ['model_id', 'model_digest', 'preprocessing', 'normalization', 'dimensionality', 'distance_policy'];
  const missing = required.filter((key) => model[key] == null || model[key] === '');
  const baseline = Array.isArray(lane.baseline_embedding) ? lane.baseline_embedding : [];
  const perturbed = Array.isArray(lane.perturbed_embedding) ? lane.perturbed_embedding : [];
  const recoveries = Array.isArray(lane.recovery_embeddings) ? lane.recovery_embeddings : [];
  const displacement = vectorDistance(baseline, perturbed);
  const residuals = recoveries.map((vector) => vectorDistance(baseline, vector));
  const lastResidual = residuals.length ? residuals[residuals.length - 1] : displacement;
  return {
    status: missing.length || !baseline.length || !perturbed.length ? 'invalid-or-incomplete-model-contract' : 'measured',
    model_dependent: true,
    description: 'Narrative-state embeddings derived from observable textual organization under declared elicitation conditions.',
    model_identity: clone(model),
    missing_model_fields: missing,
    findings: {
      displacement_amplitude: displacement,
      recovery_ratio: displacement ? round(clamp01((displacement - lastResidual) / displacement)) : 0,
      residual_path: residuals,
      recovery_claim_permitted: displacement >= DEFAULT_THRESHOLDS.minimum_displacement
    },
    raw_text_included: false
  };
}

function embeddingModelSubstitution(primaryLatent, alternate = {}) {
  if (primaryLatent.status !== 'measured' || !isObject(alternate) || !Array.isArray(alternate.baseline_embedding)) {
    return {
      status: 'not-provided-or-insufficient',
      model_dependent: true,
      normalized_result_distance: null,
      authority: 'unavailable',
      raw_text_included: false
    };
  }
  const alt = latentLane({ latent_lane: alternate });
  if (alt.status !== 'measured') {
    return {
      status: 'invalid-alternate-model-contract',
      model_dependent: true,
      normalized_result_distance: null,
      authority: 'unavailable',
      raw_text_included: false
    };
  }
  const primaryVector = [
    primaryLatent.findings.displacement_amplitude,
    primaryLatent.findings.recovery_ratio,
    ...primaryLatent.findings.residual_path
  ];
  const alternateVector = [
    alt.findings.displacement_amplitude,
    alt.findings.recovery_ratio,
    ...alt.findings.residual_path
  ];
  const distance = vectorDistance(primaryVector, alternateVector);
  return {
    status: 'measured',
    model_dependent: true,
    primary_model_digest: primaryLatent.model_identity.model_digest,
    alternate_model_digest: alt.model_identity.model_digest,
    normalized_result_distance: distance,
    authority: distance <= 0.08 ? 'model-robust-candidate' : 'model-sensitive',
    raw_text_included: false
  };
}

function mimicryUnderDeformation(primaryRecords, imitationInput = {}, thresholds = DEFAULT_THRESHOLDS, substitutions = []) {
  const imitationRecords = Array.isArray(imitationInput.trajectories)
    ? imitationInput.trajectories.map((record) => trajectoryCore(record, thresholds, substitutions))
    : [];
  if (!imitationRecords.length) {
    return {
      status: 'not-provided',
      normalized_similarity: null,
      imitation_collision: false,
      response_class_agreement: null,
      raw_text_included: false
    };
  }
  const primary = profileVector(primaryRecords);
  const imitation = profileVector(imitationRecords);
  const similarity = round(1 - vectorDistance(primary, imitation));
  const primaryClasses = primaryRecords.map((record) => record.response_class);
  const imitationClasses = imitationRecords.map((record) => record.response_class);
  const classAgreement = round(mean(primaryClasses.map((value, index) => value === imitationClasses[index] ? 1 : 0)));
  return {
    status: 'measured',
    normalized_similarity: similarity,
    imitation_collision: similarity >= thresholds.mimicry_collision_similarity,
    response_class_agreement: classAgreement,
    claim: 'A collision means the imitation reproduced the measured response profile under this protocol; it does not prove identity or universal authorship.',
    adverse_result_preserved: true,
    raw_text_included: false
  };
}

function noDisplacementFailure(records) {
  return records.every((record) => !record.metrics.displacement_verified);
}

export async function buildRestorativePrecommitment(input = {}, options = {}) {
  const thresholds = { ...DEFAULT_THRESHOLDS, ...(options.thresholds || {}) };
  const transparentPolicy = {
    scales: SCALES.slice(),
    normalization: options.normalizationPolicy || 'declared-per-feature-range',
    aggregation: options.aggregationPolicy || 'mean-by-scale-with-feature-level-preservation',
    missing_data_policy: options.missingDataPolicy || 'preserve-missing-and-withhold-derived-claim',
    thresholds,
    perturbation_taxonomy: clone(options.perturbationTaxonomy || []),
    feature_policy: clone(options.featurePolicy || {}),
    structural_substitution_policy: 'preserve-original-and-substitute-feature-identity-with-function-evidence'
  };
  const modelContract = input.latent_lane?.model || null;
  const inputManifest = {
    trajectory_feature_ids: (input.trajectories || []).map((record) => record.feature_id).sort(),
    perturbation_ids: Array.from(new Set((input.trajectories || []).map((record) => record.perturbation_id).filter(Boolean))).sort(),
    substitution_ids: (input.structural_substitutions || []).map((record) => `${record.original_feature_id}->${record.substitute_feature_id}`).sort(),
    null_controls_present: Object.keys(input.null_controls || {}).sort(),
    imitation_present: Boolean(input.imitation?.trajectories?.length),
    latent_lane_present: Boolean(input.latent_lane)
  };
  const core = {
    schema_version: RESTORATIVE_PRECOMMITMENT,
    protocol_version: RESTORATIVE_PROTOCOL,
    transparent_policy: transparentPolicy,
    transparent_policy_digest: await taggedDigest(transparentPolicy),
    input_manifest: inputManifest,
    input_manifest_digest: await taggedDigest(inputManifest),
    model_contract: modelContract ? clone(modelContract) : null,
    model_contract_digest: modelContract ? await taggedDigest(modelContract) : null,
    research_mode_required: true,
    explicit_consent_required: true,
    raw_text_exported: false,
    keystroke_telemetry_collected: false,
    pause_timing_collected: false,
    private_vulnerability_targeting: false,
    adaptive_emotional_pressure: false,
    created_at_utc: options.createdAtUtc || null
  };
  return { ...core, precommitment_digest: await taggedDigest(core) };
}

export async function runRestorativeStylodynamics(input = {}, options = {}) {
  const researchGate = options.researchMode === true && options.explicitConsent === true;
  const thresholds = { ...DEFAULT_THRESHOLDS, ...(options.thresholds || {}) };
  const precommitment = await buildRestorativePrecommitment(input, options);
  const substitutions = Array.isArray(input.structural_substitutions) ? clone(input.structural_substitutions) : [];
  const trajectories = Array.isArray(input.trajectories) ? input.trajectories : [];
  const featureRecords = trajectories.map((record) => trajectoryCore(record, thresholds, substitutions));
  const failures = [];
  if (!researchGate) failures.push({ code: 'RESEARCH-GATE-CLOSED', detail: 'Research mode and explicit consent are both required.' });
  if (!featureRecords.length) failures.push({ code: 'NO-TRAJECTORIES' });
  if (noDisplacementFailure(featureRecords)) failures.push({ code: 'NO-DEMONSTRATED-DISPLACEMENT', rule: 'No demonstrated displacement → no recoverability claim.' });
  for (const record of featureRecords) {
    if (!record.metrics.displacement_verified) failures.push({
      code: 'FEATURE-DISPLACEMENT-NOT-DEMONSTRATED',
      feature_id: record.feature_id,
      recovery_claim_withheld: true
    });
  }
  const scaleSummaries = Object.fromEntries(SCALES.map((scale) => [scale, summarizeScale(featureRecords, scale)]));
  const invariants = trajectoryInvariants(featureRecords);
  const chronology = chronologyNull(trajectories, thresholds, substitutions);
  if (chronology.dynamic_signature_authority === 'reduced') failures.push({
    code: 'CHRONOLOGY-NULL-NON-DIAGNOSTIC',
    authority_reduced: true
  });
  const namedNulls = runNamedNulls(featureRecords, input, thresholds, substitutions);
  const latent = latentLane(input);
  const modelSubstitution = embeddingModelSubstitution(latent, input.null_controls?.embedding_model_substitution);
  const mimicry = mimicryUnderDeformation(featureRecords, input.imitation || {}, thresholds, substitutions);
  if (mimicry.imitation_collision) failures.push({ code: 'MIMICRY-UNDER-DEFORMATION-COLLISION', authority_reduced: true });
  const criticalThreshold = criticalDeformationThreshold(featureRecords, thresholds);
  const verified = featureRecords.filter((record) => record.metrics.displacement_verified);
  const responseClasses = Object.fromEntries(RESPONSE_CLASSES.map((responseClass) => [
    responseClass,
    featureRecords.filter((record) => record.response_class === responseClass).length
  ]));
  const nullResults = {
    'shuffled-trajectory-null': chronology,
    ...namedNulls,
    'embedding-model-substitution': modelSubstitution,
    'chronology-destruction': chronology,
    'mimicry-under-deformation': mimicry
  };
  const missingNulls = REQUIRED_NULLS.filter((name) => {
    const result = nullResults[name];
    return !result || ['not-provided', 'not-provided-or-insufficient', 'insufficient-control'].includes(result.status);
  });
  const calibrationCount = Number(options.calibrationTriadCount || 0);
  const promotionBlockers = [];
  if (calibrationCount < 12) promotionBlockers.push('calibration-triads-below-12');
  if (missingNulls.length) promotionBlockers.push(`required-nulls-incomplete:${missingNulls.join(',')}`);
  if (!researchGate) promotionBlockers.push('research-gate-closed');
  if (failures.some((failure) => failure.code === 'NO-DEMONSTRATED-DISPLACEMENT')) promotionBlockers.push('no-demonstrated-displacement');
  const receiptCore = {
    schema_version: RESTORATION_RECEIPT_SCHEMA,
    protocol_version: RESTORATIVE_PROTOCOL,
    precommitment_digest: precommitment.precommitment_digest,
    transparent_lane_digest: await taggedDigest(featureRecords),
    latent_lane_digest: latent.status === 'measured' ? await taggedDigest(latent) : null,
    verified_displacement_feature_count: verified.length,
    total_feature_count: featureRecords.length,
    mean_displacement_amplitude: round(mean(featureRecords.map((record) => record.metrics.displacement_amplitude))),
    mean_recovery_ratio: verified.length ? round(mean(verified.map((record) => record.metrics.recovery_ratio))) : null,
    median_recovery_half_life_prompt_transitions: median(verified.map((record) => record.metrics.recovery_half_life_prompt_transitions).filter(Number.isFinite)),
    mean_residual_plasticity: verified.length ? round(mean(verified.map((record) => record.metrics.residual_plasticity).filter(Number.isFinite))) : null,
    mean_restorative_force_index: verified.length ? round(mean(verified.map((record) => record.metrics.restorative_force_index).filter(Number.isFinite))) : null,
    mean_overshoot: verified.length ? round(mean(verified.map((record) => record.metrics.overshoot).filter(Number.isFinite))) : null,
    mean_hysteresis: verified.length ? round(mean(verified.map((record) => record.metrics.hysteresis).filter(Number.isFinite))) : null,
    response_classes: responseClasses,
    trajectory_invariant_count: invariants.length,
    critical_deformation_threshold: criticalThreshold,
    chronology_authority: chronology.dynamic_signature_authority,
    mimicry_collision: mimicry.imitation_collision,
    model_dependent_findings_present: latent.status === 'measured',
    failures_preserved: true,
    identity_probability: null,
    psychological_inference_performed: false,
    demographic_inference_performed: false,
    cognitive_access_claimed: false,
    literal_physical_force_claimed: false,
    raw_text_included: false,
    uncertainty: 'Measurements describe observable textual-response trajectories under declared elicitation and perturbation conditions. They do not establish cognition, identity, ownership, personality, trauma, intelligence, resilience, or mental state.'
  };
  const resultCore = {
    schema_version: RESTORATIVE_SCHEMA,
    protocol: {
      protocol_version: RESTORATIVE_PROTOCOL,
      research_mode: researchGate,
      baseline_intake_mandatory: false,
      explicit_consent_recorded: options.explicitConsent === true,
      bounded_adversarial_research: true,
      private_vulnerability_targeting: false,
      adaptive_emotional_pressure: false,
      keystroke_telemetry_collected: false,
      pause_timing_collected: false,
      covert_behavioral_biometrics_collected: false,
      raw_text_exported: false,
      external_identity_data_consumed: false
    },
    precommitment,
    transparent_feature_lane: {
      description: 'Transparent measurements derived from observable textual organization under declared elicitation conditions.',
      scales: scaleSummaries,
      feature_trajectories: featureRecords,
      trajectory_invariants: invariants,
      structural_substitutions: substitutions.map((record) => ({ ...record, raw_text_included: false })),
      raw_text_included: false
    },
    latent_representation_lane: latent,
    null_models: {
      required: REQUIRED_NULLS.slice(),
      missing_or_insufficient: missingNulls,
      results: nullResults,
      adverse_results_preserved: true,
      raw_text_included: false
    },
    mimicry_under_deformation: mimicry,
    critical_deformation_threshold: criticalThreshold,
    failure_registry: failures,
    restoration_receipt: receiptCore,
    promotion_gate: {
      state: promotionBlockers.length ? 'CODE-COMPLETE-UNPROMOTED' : 'PROMOTION-ELIGIBLE-FOR-SEPARATE-PR',
      calibration_triads_observed: calibrationCount,
      calibration_triads_required: 12,
      blockers: promotionBlockers,
      production_deployment_authorized: false,
      baseline_intake_promotion_authorized: false,
      separate_promotion_pr_required: true
    },
    claim_ceiling: {
      supported: 'Packet-scoped measurement of demonstrated displacement, recovery, substitution, chronology sensitivity, and null-model behavior under this versioned protocol.',
      prohibited: [
        'civil or legal identity proof',
        'exclusive ownership proof',
        'universal authorship attribution',
        'third-party text adjudication',
        'direct access to cognition',
        'personality, trauma, intelligence, resilience, demographic, diagnostic, or mental-state inference',
        'unforgeable response signature'
      ]
    },
    raw_text_included: false
  };
  const receiptDigest = await taggedDigest(receiptCore);
  resultCore.restoration_receipt.restoration_receipt_digest = receiptDigest;
  return { ...resultCore, result_digest: await taggedDigest(resultCore) };
}

export async function replayRestorativeStylodynamics(result = {}, input = {}, options = {}) {
  const replayed = await runRestorativeStylodynamics(input, options);
  const checks = {
    precommitment_digest: replayed.precommitment.precommitment_digest === result?.precommitment?.precommitment_digest,
    transparent_lane_digest: replayed.restoration_receipt.transparent_lane_digest === result?.restoration_receipt?.transparent_lane_digest,
    latent_lane_digest: replayed.restoration_receipt.latent_lane_digest === result?.restoration_receipt?.latent_lane_digest,
    restoration_receipt_digest: replayed.restoration_receipt.restoration_receipt_digest === result?.restoration_receipt?.restoration_receipt_digest,
    result_digest: replayed.result_digest === result?.result_digest
  };
  return {
    schema_version: 'td613.safe-harbor.restorative-replay/v1',
    status: Object.values(checks).every(Boolean) ? 'pass' : 'hold',
    checks,
    raw_text_included: false
  };
}

export function restorativeContainsRawText(value = {}) {
  return /"(?:raw_text|source_text|entrant_text|window_text|prompt_text|text)"\s*:/u.test(stableCanonicalJson(value));
}
