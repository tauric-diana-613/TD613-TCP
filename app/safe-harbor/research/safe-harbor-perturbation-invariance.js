export const PERTURBATION_SCHEMA = 'td613.safe-harbor.perturbation-invariance/v1';
export const RESTORATION_RECEIPT_POLICY = 'td613.safe-harbor.restoration-receipt/v1';
export const PERTURBATION_PROTOCOL = 'pim-crossed-perturbation/v1';
export const RESPONSE_CLASSES = Object.freeze(['elastic', 'plastic', 'brittle', 'adaptive', 'insufficient']);

const RAW_TEXT_KEYS = new Set(['raw_text', 'source_text', 'entrant_text', 'window_text', 'prompt_text', 'candidate_text', 'text']);
const FORBIDDEN_INTERPRETATIONS = Object.freeze(['personality', 'diagnosis', 'resilience', 'intelligence', 'trauma', 'mental state', 'private cognition']);

function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
function isObject(value) { return Boolean(value && typeof value === 'object' && !Array.isArray(value)); }
function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!isObject(value)) return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
}
export function stableCanonicalJson(value) { return JSON.stringify(stableValue(value)); }
function round(value, places = 6) { const n = Number(value); return Number.isFinite(n) ? Number(n.toFixed(places)) : null; }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function average(values = []) {
  const finite = values.map(Number).filter(Number.isFinite);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : null;
}
function variance(values = []) {
  const mean = average(values);
  return mean == null ? null : average(values.map((value) => (Number(value) - mean) ** 2));
}
async function sha256Hex(input) {
  const source = String(input ?? '');
  if (globalThis.crypto?.subtle && globalThis.TextEncoder) {
    const buffer = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(source));
    return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  const crypto = await import('node:crypto');
  return crypto.createHash('sha256').update(source).digest('hex');
}
async function digest(value) { return `sha256:${await sha256Hex(typeof value === 'string' ? value : stableCanonicalJson(value))}`; }
function containsRawText(value) {
  if (Array.isArray(value)) return value.some(containsRawText);
  if (!isObject(value)) return false;
  return Object.entries(value).some(([key, child]) => RAW_TEXT_KEYS.has(key) || containsRawText(child));
}
function normalizeDistribution(value = {}) {
  const entries = Object.entries(value).filter(([, child]) => Number.isFinite(child));
  const total = entries.reduce((sum, [, child]) => sum + Math.max(0, Number(child)), 0);
  return Object.fromEntries(entries.map(([key, child]) => [key, total ? Math.max(0, Number(child)) / total : 0]));
}
function cosineDistance(left = {}, right = {}) {
  const a = normalizeDistribution(left); const b = normalizeDistribution(right);
  const keys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)])).sort();
  if (!keys.length) return null;
  let dot = 0; let a2 = 0; let b2 = 0;
  for (const key of keys) { const x = a[key] || 0; const y = b[key] || 0; dot += x * y; a2 += x * x; b2 += y * y; }
  if (!a2 && !b2) return 0;
  if (!a2 || !b2) return 1;
  return round(1 - dot / Math.sqrt(a2 * b2));
}
function vectorDistance(left = [], right = []) {
  const length = Math.max(left.length, right.length);
  if (!length) return null;
  const distances = [];
  for (let index = 0; index < length; index += 1) {
    const a = Number(left[index] ?? 0); const b = Number(right[index] ?? 0);
    distances.push(Math.min(1, Math.abs(a - b) / Math.max(1, Math.abs(a), Math.abs(b))));
  }
  return round(average(distances));
}
export function featureDistance(baseline, observed, family = 'scalar') {
  if (family === 'scalar') {
    if (!Number.isFinite(baseline) || !Number.isFinite(observed)) return null;
    return round(Math.min(1, Math.abs(Number(observed) - Number(baseline)) / Math.max(1, Math.abs(Number(baseline)), Math.abs(Number(observed)))));
  }
  if (family === 'distribution') return cosineDistance(baseline, observed);
  if (family === 'categorical') return baseline === observed ? 0 : 1;
  if (family === 'trajectory' || family === 'embedding') return vectorDistance(Array.isArray(baseline) ? baseline : [], Array.isArray(observed) ? observed : []);
  return null;
}
function signedScalarDelta(baseline, observed) {
  return Number.isFinite(baseline) && Number.isFinite(observed) ? Number(observed) - Number(baseline) : null;
}
function recoveryHalfLife(distances, displacement) {
  if (!(displacement > 0)) return null;
  const threshold = displacement / 2;
  const index = distances.findIndex((distance) => Number.isFinite(distance) && distance <= threshold);
  return index < 0 ? null : index + 1;
}
function monotonicReturnConsistency(distances = []) {
  if (distances.length < 2) return null;
  let returning = 0;
  for (let index = 1; index < distances.length; index += 1) if (distances[index] <= distances[index - 1]) returning += 1;
  return round(returning / (distances.length - 1));
}
function scalarOvershoot(baseline, perturbed, recovery = []) {
  const outgoing = signedScalarDelta(baseline, perturbed);
  if (!Number.isFinite(outgoing) || outgoing === 0) return { present: false, amplitude: 0 };
  const opposite = recovery.map((value) => signedScalarDelta(baseline, value)).filter(Number.isFinite).filter((delta) => Math.sign(delta) === -Math.sign(outgoing));
  if (!opposite.length) return { present: false, amplitude: 0 };
  return { present: true, amplitude: round(Math.max(...opposite.map(Math.abs))) };
}
function hysteresisIndex(displacement, recoveryDistances = []) {
  if (!(displacement > 0) || !recoveryDistances.length) return null;
  const ideal = recoveryDistances.map((_, index) => displacement * (1 - (index + 1) / recoveryDistances.length));
  const error = average(recoveryDistances.map((distance, index) => Math.abs(distance - ideal[index]) / Math.max(displacement, 1e-9)));
  return round(clamp(error ?? 0, 0, 1));
}
function responseClass({ uptakeVerified, recoveryRatio, residual, displacement, consistency, substitution }) {
  if (!uptakeVerified || !(displacement > 0)) return 'insufficient';
  if (substitution?.functional_restoration_verified === true && substitution?.surface_marker_returned === false) return 'adaptive';
  if ((recoveryRatio ?? 0) >= 0.75 && (residual ?? displacement) <= displacement * 0.25) return 'elastic';
  if ((recoveryRatio ?? 0) <= 0.2 && (consistency ?? 0) < 0.5) return 'brittle';
  return 'plastic';
}
function failure(code, detail, evidenceRefs = []) { return { code, detail, evidence_refs: evidenceRefs, adverse_result_preserved: true }; }
async function featureEvidenceId(featureId, record) { return `PIM-${featureId}-${(await sha256Hex(stableCanonicalJson(record))).slice(0, 12).toUpperCase()}`; }

export async function analyzeFeatureResponse(featureId, input = {}, policy = {}) {
  const family = input.family || 'scalar';
  const baseline = input.baseline;
  const perturbed = input.perturbed;
  const recovery = Array.isArray(input.recovery) ? input.recovery : [];
  const uptakeThreshold = Number.isFinite(policy.minimum_displacement) ? policy.minimum_displacement : 0.05;
  const displacement = featureDistance(baseline, perturbed, family);
  const uptakeVerified = Number.isFinite(displacement) && displacement >= uptakeThreshold && input.task_compliance_verified !== false;
  const recoveryDistances = recovery.map((value) => featureDistance(baseline, value, family));
  const finalDistance = recoveryDistances.length ? recoveryDistances[recoveryDistances.length - 1] : null;
  const rawRecoveryRatio = uptakeVerified && Number.isFinite(finalDistance) ? 1 - finalDistance / displacement : null;
  const recoveryRatio = Number.isFinite(rawRecoveryRatio) ? round(clamp(rawRecoveryRatio, 0, 1)) : null;
  const halfLife = uptakeVerified ? recoveryHalfLife(recoveryDistances, displacement) : null;
  const consistency = uptakeVerified ? monotonicReturnConsistency(recoveryDistances) : null;
  const restorativeForce = uptakeVerified && Number.isFinite(recoveryRatio) ? round(recoveryRatio * (consistency ?? 0) / Math.max(1, recovery.length)) : null;
  const overshoot = family === 'scalar' ? scalarOvershoot(baseline, perturbed, recovery) : { present: false, amplitude: null };
  const hysteresis = uptakeVerified ? hysteresisIndex(displacement, recoveryDistances) : null;
  const classification = responseClass({
    uptakeVerified,
    recoveryRatio,
    residual: finalDistance,
    displacement,
    consistency,
    substitution: input.structural_substitution
  });
  const core = {
    feature_id: featureId,
    scale: input.scale || 'micro',
    family,
    baseline_region_digest: await digest(baseline),
    perturbation_target: input.perturbation_target || 'declared-feature-displacement',
    perturbation_level: Number.isInteger(input.perturbation_level) ? input.perturbation_level : 1,
    displacement_amplitude: displacement,
    minimum_displacement_threshold: uptakeThreshold,
    task_compliance_verified: input.task_compliance_verified !== false,
    verified_displacement: uptakeVerified,
    recovery_trajectory_distances: recoveryDistances,
    recovery_ratio: recoveryRatio,
    recovery_half_life_transitions: halfLife,
    residual_plasticity: finalDistance,
    restorative_force_index: restorativeForce,
    return_consistency: consistency,
    overshoot,
    hysteresis_index: hysteresis,
    structural_substitution: clone(input.structural_substitution || null),
    response_class: classification,
    recovery_claim_authorized: uptakeVerified,
    model_dependent: family === 'embedding',
    raw_text_included: false
  };
  core.evidence_id = await featureEvidenceId(featureId, core);
  return core;
}

function shuffle(values = []) {
  if (values.length < 3) return values.slice().reverse();
  return [values[values.length - 1], values[0], ...values.slice(1, -1)];
}
function shuffledTrajectoryNull(record) {
  const original = record.recovery_trajectory_distances || [];
  const shuffled = shuffle(original);
  const originalConsistency = monotonicReturnConsistency(original);
  const shuffledConsistency = monotonicReturnConsistency(shuffled);
  const separation = Number.isFinite(originalConsistency) && Number.isFinite(shuffledConsistency) ? round(Math.abs(originalConsistency - shuffledConsistency)) : null;
  const authority = !Number.isFinite(separation) ? 'insufficient-evidence' : separation < 0.1 ? 'chronology-non-diagnostic' : 'chronology-sensitive-candidate';
  return {
    status: original.length >= 2 ? 'measured' : 'insufficient-evidence',
    original_return_consistency: originalConsistency,
    shuffled_return_consistency: shuffledConsistency,
    normalized_separation: separation,
    authority,
    dynamic_claim_authority: authority === 'chronology-non-diagnostic' ? 'reduced' : authority === 'chronology-sensitive-candidate' ? 'candidate-only' : 'insufficient-evidence',
    raw_text_included: false
  };
}
function nullRecord(input, defaultStatus = 'not-provided') {
  if (!input) return { status: defaultStatus, adverse_result_preserved: true, raw_text_included: false };
  const out = clone(input);
  out.status = out.status || 'measured';
  out.adverse_result_preserved = true;
  out.raw_text_included = false;
  return out;
}
function criticalThreshold(records = []) {
  const sorted = records.slice().sort((a, b) => (a.perturbation_level ?? 0) - (b.perturbation_level ?? 0));
  const failed = sorted.find((record) => record.verified_displacement && !['elastic', 'adaptive'].includes(record.response_class));
  return failed ? {
    status: 'candidate',
    lowest_nonreconstituting_level: failed.perturbation_level,
    evidence_id: failed.evidence_id,
    claim_ceiling: 'Protocol-scoped textual deformation threshold only; not resilience, intelligence, adaptability, trauma, or diagnosis.'
  } : { status: 'not-observed-within-horizon', lowest_nonreconstituting_level: null, evidence_id: null };
}
function mimicryStress(input = {}) {
  if (!input.entrant || !input.imitation) return { status: 'not-provided', adverse_result_preserved: true, raw_text_included: false };
  const fields = ['displacement_amplitude', 'recovery_ratio', 'recovery_half_life_transitions', 'restorative_force_index', 'hysteresis_index'];
  const distances = fields.map((field) => {
    const a = Number(input.entrant[field]); const b = Number(input.imitation[field]);
    return Number.isFinite(a) && Number.isFinite(b) ? Math.min(1, Math.abs(a - b) / Math.max(1, Math.abs(a), Math.abs(b))) : null;
  }).filter(Number.isFinite);
  const separation = round(average(distances));
  return {
    status: distances.length ? 'measured' : 'insufficient-evidence',
    compared_metrics: distances.length,
    recovery_surface_separation: separation,
    imitation_collision: Number.isFinite(separation) ? separation < 0.05 : null,
    unforgeable_claimed: false,
    adverse_result_preserved: true,
    raw_text_included: false
  };
}
function latentLane(input = {}) {
  if (!input.model_identity) return {
    status: 'not-provided',
    object_description: 'narrative-state embeddings derived from observable textual organization under declared elicitation conditions',
    model_dependent: true,
    raw_text_included: false
  };
  return {
    status: 'measured',
    object_description: 'narrative-state embeddings derived from observable textual organization under declared elicitation conditions',
    model_identity: input.model_identity,
    model_version: input.model_version || null,
    model_or_artifact_digest: input.model_or_artifact_digest || null,
    preprocessing_policy: input.preprocessing_policy || null,
    normalization_policy: input.normalization_policy || null,
    dimensionality: Number.isInteger(input.dimensionality) ? input.dimensionality : null,
    distance_metric: input.distance_metric || null,
    findings: clone(input.findings || []),
    model_dependent: true,
    direct_cognition_access_claimed: false,
    raw_text_included: false
  };
}
function forbiddenClaimScan(value) {
  const serialized = stableCanonicalJson(value).toLowerCase();
  return FORBIDDEN_INTERPRETATIONS.filter((term) => serialized.includes(`infer ${term}`) || serialized.includes(`${term} score`) || serialized.includes(`${term} diagnosis`));
}

export async function buildPerturbationInvarianceReceipt(input = {}) {
  const failures = [];
  if (containsRawText(input)) failures.push(failure('raw-text-present', 'Raw text is prohibited from exported perturbation receipts.'));
  const protocol = {
    protocol_id: PERTURBATION_PROTOCOL,
    prompt_schedule_digest: input.prompt_schedule_digest || null,
    order_randomized: input.order_randomized !== false,
    counterbalancing_method: input.counterbalancing_method || 'latin-square',
    feature_policy_frozen_before_analysis: input.feature_policy_frozen_before_analysis !== false,
    public_feature_targets_disclosed: false,
    keystroke_telemetry_collected: false,
    pause_timing_collected: false,
    cursor_telemetry_collected: false,
    deletion_timing_collected: false,
    revision_history_exported: false,
    raw_text_exported: false,
    adaptive_personal_vulnerability_targeting: false,
    maximum_intensity_fixed: true,
    immediate_exit_available: true
  };
  if (!/^sha256:[0-9a-f]{64}$/u.test(String(protocol.prompt_schedule_digest || ''))) failures.push(failure('prompt-schedule-digest-missing', 'A versioned prompt schedule digest is required.'));
  const featureInputs = isObject(input.features) ? input.features : {};
  const featureResponseCurves = {};
  for (const featureId of Object.keys(featureInputs).sort()) {
    const record = await analyzeFeatureResponse(featureId, featureInputs[featureId], input.policy || {});
    featureResponseCurves[featureId] = record;
    if (!record.verified_displacement) failures.push(failure('displacement-not-demonstrated', `Recovery authority withheld for ${featureId}.`, [record.evidence_id]));
    if (record.response_class === 'brittle' || record.response_class === 'plastic') failures.push(failure(`recovery-${record.response_class}`, `${featureId} did not return within the declared horizon.`, [record.evidence_id]));
  }
  const nulls = {
    shuffled_trajectory: Object.fromEntries(Object.entries(featureResponseCurves).map(([id, record]) => [id, shuffledTrajectoryNull(record)])),
    prompt_only_controls: nullRecord(input.null_models?.prompt_only_controls),
    topic_matched_controls: nullRecord(input.null_models?.topic_matched_controls),
    semantic_paraphrase_controls: nullRecord(input.null_models?.semantic_paraphrase_controls),
    same_author_static_baseline: nullRecord(input.null_models?.same_author_static_baseline),
    different_author_same_prompt: nullRecord(input.null_models?.different_author_same_prompt),
    lane_vocabulary_ablation: nullRecord(input.null_models?.lane_vocabulary_ablation),
    feature_family_ablations: nullRecord(input.null_models?.feature_family_ablations),
    embedding_model_substitution: nullRecord(input.null_models?.embedding_model_substitution)
  };
  for (const [featureId, record] of Object.entries(nulls.shuffled_trajectory)) if (record.dynamic_claim_authority === 'reduced') failures.push(failure('shuffled-trajectory-null-nondiagnostic', `${featureId} retained equivalent static structure after chronology destruction.`, [featureResponseCurves[featureId].evidence_id]));
  const responseClasses = Object.fromEntries(RESPONSE_CLASSES.map((state) => [state, []]));
  for (const [featureId, record] of Object.entries(featureResponseCurves)) responseClasses[record.response_class].push(featureId);
  const trajectoryInvariants = clone(input.trajectory_invariants || []).map((trajectory, index) => ({
    trajectory_id: trajectory.trajectory_id || `traj_${String(index + 1).padStart(2, '0')}`,
    scale: trajectory.scale || 'macro',
    state_sequence: clone(trajectory.state_sequence || []),
    perturbation_survival_rate: Number.isFinite(trajectory.perturbation_survival_rate) ? round(trajectory.perturbation_survival_rate) : null,
    median_recovery_transitions: Number.isFinite(trajectory.median_recovery_transitions) ? round(trajectory.median_recovery_transitions) : null,
    prompt_dependence: trajectory.prompt_dependence || 'unassessed',
    evidence_ids: clone(trajectory.evidence_ids || []),
    raw_text_included: false
  }));
  const criticalDeformationThresholds = {};
  for (const scale of ['micro', 'meso', 'macro']) criticalDeformationThresholds[scale] = criticalThreshold(Object.values(featureResponseCurves).filter((record) => record.scale === scale));
  const transparentLane = {
    status: Object.keys(featureResponseCurves).length ? 'measured' : 'insufficient-evidence',
    feature_response_curves: featureResponseCurves,
    trajectory_invariants: trajectoryInvariants,
    model_dependent: false,
    raw_text_included: false
  };
  const latent = latentLane(input.latent_representation || {});
  const mimicry = mimicryStress(input.mimicry_stress_test || {});
  if (mimicry.imitation_collision === true) failures.push(failure('mimicry-under-deformation-collision', 'Imitation response surface collided with the entrant response surface.'));
  const recoveryMetrics = {
    displacement_amplitude: Object.fromEntries(Object.entries(featureResponseCurves).map(([id, record]) => [id, record.displacement_amplitude])),
    recovery_ratio: Object.fromEntries(Object.entries(featureResponseCurves).map(([id, record]) => [id, record.recovery_ratio])),
    recovery_half_life_transitions: Object.fromEntries(Object.entries(featureResponseCurves).map(([id, record]) => [id, record.recovery_half_life_transitions])),
    residual_plasticity: Object.fromEntries(Object.entries(featureResponseCurves).map(([id, record]) => [id, record.residual_plasticity])),
    restorative_force_index: Object.fromEntries(Object.entries(featureResponseCurves).map(([id, record]) => [id, record.restorative_force_index])),
    overshoot: Object.fromEntries(Object.entries(featureResponseCurves).map(([id, record]) => [id, record.overshoot])),
    hysteresis: Object.fromEntries(Object.entries(featureResponseCurves).map(([id, record]) => [id, record.hysteresis_index]))
  };
  const evidenceCore = {
    schema_version: PERTURBATION_SCHEMA,
    protocol,
    perturbation_uptake: {
      verified: Object.values(featureResponseCurves).some((record) => record.verified_displacement),
      verified_feature_ids: Object.entries(featureResponseCurves).filter(([, record]) => record.verified_displacement).map(([id]) => id),
      insufficient_perturbations: Object.entries(featureResponseCurves).filter(([, record]) => !record.verified_displacement).map(([id]) => id)
    },
    feature_response_curves: featureResponseCurves,
    recovery_metrics: recoveryMetrics,
    response_classes: responseClasses,
    transparent_feature_lane: transparentLane,
    latent_representation_lane: latent,
    trajectory_invariants: trajectoryInvariants,
    null_models: nulls,
    mimicry_stress_test: mimicry,
    critical_deformation_thresholds: criticalDeformationThresholds,
    blind_custody_challenge_ref: input.blind_custody_challenge_ref || null,
    failure_registry: failures.map((entry, index) => ({ failure_id: `PIM-F-${String(index + 1).padStart(3, '0')}`, ...entry })),
    research_gate: {
      status: 'research-only-unpromoted',
      baseline_intake_authorized: false,
      production_promotion_authorized: false,
      calibration_triads_completed: Number(input.calibration_triads_completed || 0),
      calibration_triads_required: 12,
      promotion_blockers: Number(input.calibration_triads_completed || 0) >= 12 ? ['separate-operator-promotion-gesture-required'] : ['twelve-distinct-triads-not-complete', 'uptake-and-null-calibration-incomplete', 'separate-operator-promotion-gesture-required']
    },
    raw_text_included: false,
    psychological_inference_performed: false,
    demographic_inference_performed: false,
    direct_cognition_access_claimed: false
  };
  const forbidden = forbiddenClaimScan(evidenceCore);
  if (forbidden.length) evidenceCore.failure_registry.push({ failure_id: `PIM-F-${String(evidenceCore.failure_registry.length + 1).padStart(3, '0')}`, ...failure('forbidden-interpretive-claim', forbidden.join(', ')) });
  const evidenceDigest = await digest(evidenceCore);
  const restorationCore = {
    policy_version: RESTORATION_RECEIPT_POLICY,
    evidence_digest: evidenceDigest,
    successful_recoveries: Object.entries(featureResponseCurves).filter(([, record]) => ['elastic', 'adaptive'].includes(record.response_class)).map(([id]) => id),
    failed_recoveries: Object.entries(featureResponseCurves).filter(([, record]) => ['plastic', 'brittle', 'insufficient'].includes(record.response_class)).map(([id]) => id),
    model_dependent_findings: latent.status === 'measured' ? clone(latent.findings || []) : [],
    failures_preserved: true,
    claim_ceiling: 'Controlled textual recurrence under declared perturbation; not identity adjudication, personality inference, private-cognition measurement, or universal authorship proof.'
  };
  const restorationReceiptDigest = await digest(restorationCore);
  return {
    ...evidenceCore,
    restoration_receipt: { ...restorationCore, restoration_receipt_digest: restorationReceiptDigest }
  };
}

export function perturbationReceiptContainsRawText(value) { return containsRawText(value); }
