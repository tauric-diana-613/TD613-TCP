import { stableStringify, sha256Text, isSha256 } from './hush-customizer-packet.js';
import { validateContractLogPair } from './hush-contract-log-pair-validator.js';

export const HUSH_STYLOMETRY_AUDIT_SCHEMA = 'td613.hush.stylometry-audit/v1';
export const HUSH_STYLOMETRY_AUDIT_VERSION = 'hush-stylometry-audit/v1-pair-derived';
export const HUSH_STYLOMETRY_AUDIT_CLASS = 'cadence-alignment-audit';

export const HUSH_STYLOMETRY_AUDIT_CLAIM_LIMITS = Object.freeze({
  schema_version: 'td613.hush.stylometry-audit-claim-limits/v1',
  not_identity_proof: true,
  not_authorship_ownership_proof: true,
  not_third_party_consent: true,
  not_impersonation_authorization: true,
  not_legal_authorship_proof: true,
  not_civil_identity_proof: true,
  not_output_quality_proof: true,
  not_whistleblower_truth_proof: true,
  stylometry_is_probabilistic: true,
  human_review_required_for_high_stakes_release: true
});

const DEFAULT_METRIC_FAMILIES = Object.freeze([
  'lexical-texture',
  'sentence-rhythm',
  'punctuation-rhythm',
  'clause-structure',
  'discourse-markers',
  'transition-logic',
  'compression-ratio',
  'rhetorical-pressure',
  'refusal-structure',
  'register-stability',
  'cadence-variance'
]);

function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
function asArray(value) { return Array.isArray(value) ? value : []; }
function getPath(value, path) { return String(path || '').split('.').reduce((node, key) => (node && Object.prototype.hasOwnProperty.call(node, key) ? node[key] : undefined), value); }
function bool(value, fallback = false) { return typeof value === 'boolean' ? value : fallback; }
function datePart(value) { return String(value || new Date().toISOString()).slice(0, 10).replace(/-/g, ''); }
async function hashObject(value) { return sha256Text(stableStringify(value == null ? null : value)); }

export function containsShi(value) { return /TD613-SH-|SHI#:/iu.test(String(value || '')); }
export function isStylometryAuditPacketId(value) { return /^TD613-HUSH-STYLO-\d{8}-[A-F0-9]{8}$/u.test(String(value || '').trim().toUpperCase()); }

export function stylometryAuditPacketHashPreimage(packet = {}) {
  const material = clone(packet || {});
  delete material.packet_hash_sha256;
  if (material.hash_topology) delete material.hash_topology.packet_hash_sha256;
  return material;
}

function linkedPair(pair = {}, validation = {}) {
  return Object.freeze({
    schema_version: 'td613.hush.stylometry-linked-pair/v1',
    pair_packet_id: pair.pair_packet_id || null,
    pair_packet_hash_sha256: pair.packet_hash_sha256 || null,
    pair_schema_version: pair.schema_version || null,
    comparison_result_status: getPath(pair, 'comparison_result.status') || 'unavailable',
    audit_routes: asArray(getPath(pair, 'comparison_result.audit_routes')),
    pair_validation_status: validation.status || 'unavailable'
  });
}

function linkedContract(pair = {}) {
  return Object.freeze({
    schema_version: 'td613.hush.stylometry-linked-contract/v1',
    contract_packet_id: getPath(pair, 'linked_contract.contract_packet_id') || null,
    contract_packet_hash_sha256: getPath(pair, 'linked_contract.contract_packet_hash_sha256') || null,
    contract_release_class: getPath(pair, 'linked_contract.contract_release_class') || null
  });
}

function linkedProviderLog(pair = {}) {
  return Object.freeze({
    schema_version: 'td613.hush.stylometry-linked-provider-log/v1',
    provider_log_packet_id: getPath(pair, 'linked_provider_log.provider_log_packet_id') || null,
    provider_log_packet_hash_sha256: getPath(pair, 'linked_provider_log.provider_log_packet_hash_sha256') || null,
    provider_log_release_class: getPath(pair, 'linked_provider_log.provider_log_release_class') || null,
    response_text_hash_sha256: getPath(pair, 'provider_log_snapshot.response_observation.response_text_hash_sha256') || null,
    redacted_response_summary_hash_sha256: getPath(pair, 'provider_log_snapshot.stylometry_observation_seed.redacted_response_summary_hash_sha256') || null
  });
}

function linkedCustomizerProfile(input = {}) {
  const profile = input.linked_customizer_profile || input.linkedCustomizerProfile || input.stylometry_profile || input.stylometryProfile || {};
  return Object.freeze({
    schema_version: 'td613.hush.linked-customizer-stylometry-profile/v1',
    stylometry_profile_id: profile.stylometry_profile_id || profile.stylometryProfileId || profile.profile_id || profile.profileId || null,
    profile_hash_sha256: profile.profile_hash_sha256 || profile.profileHashSha256 || null,
    profile_source: profile.profile_source || profile.profileSource || 'unknown',
    sample_release_class: profile.sample_release_class || profile.sampleReleaseClass || 'unknown',
    metric_set_version: profile.metric_set_version || profile.metricSetVersion || 'hush-stylometry-core/v1'
  });
}

function auditInputProfile(input = {}, pair = {}) {
  const source = input.audit_input_profile || input.auditInputProfile || {};
  const mode = source.audit_mode || source.auditMode || input.auditMode || 'feature-vector';
  const hasVector = Boolean(source.feature_vector_hash_sha256 || source.featureVectorHashSha256 || input.responseFeatureVectorHashSha256 || input.response_feature_vector_hash_sha256);
  return Object.freeze({
    schema_version: 'td613.hush.stylometry-audit-input-profile/v1',
    audit_mode: mode,
    input_tier: source.input_tier || source.inputTier || (mode === 'local-private-raw' ? 'tier-3-local-private-raw' : mode === 'redacted-summary' ? 'tier-1-redacted-summary' : 'tier-2-feature-vector'),
    response_feature_vector_hash_sha256: source.response_feature_vector_hash_sha256 || source.responseFeatureVectorHashSha256 || input.responseFeatureVectorHashSha256 || input.response_feature_vector_hash_sha256 || null,
    response_text_hash_sha256: source.response_text_hash_sha256 || source.responseTextHashSha256 || getPath(pair, 'provider_log_snapshot.response_observation.response_text_hash_sha256') || null,
    redacted_response_summary_hash_sha256: source.redacted_response_summary_hash_sha256 || source.redactedResponseSummaryHashSha256 || getPath(pair, 'provider_log_snapshot.stylometry_observation_seed.redacted_response_summary_hash_sha256') || null,
    raw_text_stored_in_packet: false,
    feature_vector_supported: hasVector,
    lower_confidence_reason: source.lower_confidence_reason || source.lowerConfidenceReason || (mode === 'response-hash-only' ? 'hash-only audit cannot measure cadence directly' : null)
  });
}

function metricProfile(input = {}) {
  const source = input.metric_profile || input.metricProfile || {};
  return Object.freeze({
    schema_version: 'td613.hush.metric-profile/v1',
    metric_set_version: source.metric_set_version || source.metricSetVersion || 'hush-stylometry-core/v1',
    metric_families: asArray(source.metric_families || source.metricFamilies).length ? asArray(source.metric_families || source.metricFamilies) : [...DEFAULT_METRIC_FAMILIES],
    raw_text_required: bool(source.raw_text_required ?? source.rawTextRequired, false),
    feature_vector_supported: bool(source.feature_vector_supported ?? source.featureVectorSupported, true),
    redacted_summary_supported: bool(source.redacted_summary_supported ?? source.redactedSummarySupported, true)
  });
}

function cadenceAlignment(input = {}, auditInput = {}) {
  const source = input.cadence_alignment || input.cadenceAlignment || {};
  const mode = auditInput.audit_mode;
  const confidence = source.confidence || (mode === 'response-hash-only' ? 'insufficient' : mode === 'redacted-summary' ? 'low' : 'medium');
  const score = Number(source.overall_alignment_score ?? source.overallAlignmentScore ?? 0.5);
  return Object.freeze({
    schema_version: 'td613.hush.cadence-alignment/v1',
    overall_alignment_score: score,
    alignment_band: source.alignment_band || source.alignmentBand || (confidence === 'insufficient' ? 'insufficient' : score >= 0.7 ? 'aligned' : score >= 0.45 ? 'partial' : 'weak'),
    confidence,
    metric_scores: Object.freeze({
      lexical_texture: Number(source.metric_scores?.lexical_texture ?? source.metricScores?.lexicalTexture ?? score),
      sentence_rhythm: Number(source.metric_scores?.sentence_rhythm ?? source.metricScores?.sentenceRhythm ?? score),
      punctuation_rhythm: Number(source.metric_scores?.punctuation_rhythm ?? source.metricScores?.punctuationRhythm ?? score),
      clause_structure: Number(source.metric_scores?.clause_structure ?? source.metricScores?.clauseStructure ?? score),
      transition_logic: Number(source.metric_scores?.transition_logic ?? source.metricScores?.transitionLogic ?? score),
      register_stability: Number(source.metric_scores?.register_stability ?? source.metricScores?.registerStability ?? score),
      cadence_variance: Number(source.metric_scores?.cadence_variance ?? source.metricScores?.cadenceVariance ?? score)
    }),
    interpretation: source.interpretation || 'bounded empirical interpretation; not identity proof'
  });
}

function pressurePreservation(input = {}) {
  const source = input.pressure_preservation || input.pressurePreservation || {};
  const score = Number(source.pressure_preservation_score ?? source.pressurePreservationScore ?? 0.5);
  return Object.freeze({
    schema_version: 'td613.hush.pressure-preservation/v1',
    pressure_preservation_score: score,
    pressure_band: source.pressure_band || source.pressureBand || (score >= 0.7 ? 'preserved' : score >= 0.45 ? 'softened' : 'flattened'),
    signals: Object.freeze({
      specificity_preserved: bool(source.signals?.specificity_preserved ?? source.signals?.specificityPreserved, score >= 0.45),
      institutional_memory_preserved: bool(source.signals?.institutional_memory_preserved ?? source.signals?.institutionalMemoryPreserved, score >= 0.45),
      risk_awareness_preserved: bool(source.signals?.risk_awareness_preserved ?? source.signals?.riskAwarenessPreserved, score >= 0.45),
      strategic_refusal_preserved: bool(source.signals?.strategic_refusal_preserved ?? source.signals?.strategicRefusalPreserved, score >= 0.45),
      overexplanation_detected: bool(source.signals?.overexplanation_detected ?? source.signals?.overexplanationDetected, false),
      spectacularization_detected: bool(source.signals?.spectacularization_detected ?? source.signals?.spectacularizationDetected, false)
    }),
    notes: asArray(source.notes)
  });
}

function flatteningDetection(input = {}) {
  const source = input.flattening_detection || input.flatteningDetection || {};
  const score = Number(source.flattening_score ?? source.flatteningScore ?? 0.2);
  let band = source.flattening_band || source.flatteningBand;
  if (!band) band = score >= 0.8 ? 'severe' : score >= 0.6 ? 'high' : score >= 0.4 ? 'moderate' : score >= 0.2 ? 'low' : 'none';
  return Object.freeze({
    schema_version: 'td613.hush.flattening-detection/v1',
    flattening_score: score,
    flattening_band: band,
    detected_patterns: asArray(source.detected_patterns || source.detectedPatterns),
    release_impact: source.release_impact || source.releaseImpact || (['high', 'severe'].includes(band) ? 'review' : 'none')
  });
}

function constraintPreservation(input = {}, pair = {}) {
  const source = input.constraint_preservation || input.constraintPreservation || {};
  const score = Number(source.constraint_preservation_score ?? source.constraintPreservationScore ?? (getPath(pair, 'payload_comparison.status') === 'aligned' ? 0.8 : 0.45));
  return Object.freeze({
    schema_version: 'td613.hush.constraint-preservation/v1',
    constraint_preservation_score: score,
    constraint_band: source.constraint_band || source.constraintBand || (score >= 0.7 ? 'preserved' : score >= 0.45 ? 'partial' : 'violated'),
    contract_constraints_observed: bool(source.contract_constraints_observed ?? source.contractConstraintsObserved, getPath(pair, 'payload_comparison.status') === 'aligned'),
    mode_preserved: bool(source.mode_preserved ?? source.modePreserved, getPath(pair, 'payload_comparison.observed_discourse_mode_sent') === true),
    retrieval_trigger_preserved: bool(source.retrieval_trigger_preserved ?? source.retrievalTriggerPreserved, getPath(pair, 'payload_comparison.observed_retrieval_trigger_sent') === true),
    forbidden_transformation_detected: bool(source.forbidden_transformation_detected ?? source.forbiddenTransformationDetected, false),
    claim_limit_violation_detected: bool(source.claim_limit_violation_detected ?? source.claimLimitViolationDetected, false),
    notes: asArray(source.notes)
  });
}

function riskProfile(input = {}) {
  const source = input.risk_profile || input.riskProfile || {};
  return Object.freeze({
    schema_version: 'td613.hush.stylometry-risk-profile/v1',
    unsafe_identifiability_risk: source.unsafe_identifiability_risk || source.unsafeIdentifiabilityRisk || 'low',
    overfit_risk: source.overfit_risk || source.overfitRisk || 'low',
    private_cadence_exposure_risk: source.private_cadence_exposure_risk || source.privateCadenceExposureRisk || 'low',
    public_release_allowed: bool(source.public_release_allowed ?? source.publicReleaseAllowed, false),
    operator_review_required: bool(source.operator_review_required ?? source.operatorReviewRequired, true),
    risk_reasons: asArray(source.risk_reasons || source.riskReasons)
  });
}

function releaseRecommendation(input = {}, risk = {}, cadence = {}, flattening = {}, auditInput = {}) {
  const source = input.release_recommendation || input.releaseRecommendation || {};
  const highRisk = ['high', 'severe'].includes(risk.unsafe_identifiability_risk) || ['high', 'severe'].includes(risk.overfit_risk) || ['high', 'severe'].includes(risk.private_cadence_exposure_risk);
  const insufficient = cadence.confidence === 'insufficient' || auditInput.audit_mode === 'response-hash-only';
  let releaseClass = source.release_class || source.releaseClass;
  if (!releaseClass) releaseClass = insufficient ? 'insufficient-evidence' : highRisk ? 'operator-review' : ['high', 'severe'].includes(flattening.flattening_band) ? 'revise-before-release' : cadence.alignment_band === 'aligned' && risk.unsafe_identifiability_risk === 'low' ? 'release-safe' : 'operator-review';
  return Object.freeze({
    schema_version: 'td613.hush.stylometry-release-recommendation/v1',
    release_class: releaseClass,
    public_release_allowed: bool(source.public_release_allowed ?? source.publicReleaseAllowed, releaseClass === 'release-safe' && !highRisk),
    provider_rewrite_allowed: bool(source.provider_rewrite_allowed ?? source.providerRewriteAllowed, releaseClass === 'revise-before-release'),
    mask_tuning_allowed: bool(source.mask_tuning_allowed ?? source.maskTuningAllowed, false),
    next_action: source.next_action || source.nextAction || (releaseClass === 'release-safe' ? 'accept' : releaseClass === 'revise-before-release' ? 'revise' : releaseClass === 'block-release' ? 'block' : insufficient ? 'collect-more-evidence' : 'run-adversarial-audit'),
    reasons: asArray(source.reasons)
  });
}

export async function buildStylometryAuditHashTopology(packetWithoutHash = {}) {
  return Object.freeze({
    schema_version: 'td613.hush.stylometry-audit-hash-topology/v1',
    linked_pair_hash_sha256: await hashObject(packetWithoutHash.linked_pair || {}),
    linked_profile_hash_sha256: await hashObject(packetWithoutHash.linked_customizer_profile || {}),
    audit_input_profile_hash_sha256: await hashObject(packetWithoutHash.audit_input_profile || {}),
    metric_profile_hash_sha256: await hashObject(packetWithoutHash.metric_profile || {}),
    cadence_alignment_hash_sha256: await hashObject(packetWithoutHash.cadence_alignment || {}),
    pressure_preservation_hash_sha256: await hashObject(packetWithoutHash.pressure_preservation || {}),
    flattening_detection_hash_sha256: await hashObject(packetWithoutHash.flattening_detection || {}),
    constraint_preservation_hash_sha256: await hashObject(packetWithoutHash.constraint_preservation || {}),
    risk_profile_hash_sha256: await hashObject(packetWithoutHash.risk_profile || {}),
    release_recommendation_hash_sha256: await hashObject(packetWithoutHash.release_recommendation || {}),
    policy_hash_sha256: await hashObject({ claim_limits: packetWithoutHash.claim_limits || {} })
  });
}

export async function buildStylometryAuditPacket(input = {}, options = {}) {
  const pair = input.contract_log_pair_packet || input.contractLogPairPacket || input.pair_packet || input.pairPacket || {};
  const pairValidation = input.pair_validation || input.pairValidation || await validateContractLogPair(pair, options.pairValidationOptions || {});
  const created = options.createdAt || input.created_at || input.createdAt || new Date().toISOString();
  const updated = options.updatedAt || input.updated_at || input.updatedAt || created;
  const linkedProfile = linkedCustomizerProfile(input);
  const auditInput = auditInputProfile(input, pair);
  const metric = metricProfile(input);
  const cadence = cadenceAlignment(input, auditInput);
  const pressure = pressurePreservation(input);
  const flattening = flatteningDetection(input);
  const constraint = constraintPreservation(input, pair);
  const risk = riskProfile(input);
  const release = releaseRecommendation(input, risk, cadence, flattening, auditInput);
  const idSeed = stableStringify({ created: options.stableId ? 'stable' : created, pair: pair.pair_packet_id, profile: linkedProfile.profile_hash_sha256, release: release.release_class });
  const idHash = await sha256Text(idSeed);
  const packetId = input.stylometry_audit_packet_id || input.stylometryAuditPacketId || `TD613-HUSH-STYLO-${datePart(created)}-${idHash.slice(7, 15).toUpperCase()}`;
  const packetBase = {
    schema_version: HUSH_STYLOMETRY_AUDIT_SCHEMA,
    packet_version: HUSH_STYLOMETRY_AUDIT_VERSION,
    packet_class: HUSH_STYLOMETRY_AUDIT_CLASS,
    stylometry_audit_packet_id: packetId,
    created_at: created,
    updated_at: updated,
    linked_pair: linkedPair(pair, pairValidation),
    linked_contract: linkedContract(pair),
    linked_provider_log: linkedProviderLog(pair),
    linked_customizer_profile: linkedProfile,
    audit_input_profile: auditInput,
    metric_profile: metric,
    cadence_alignment: cadence,
    pressure_preservation: pressure,
    flattening_detection: flattening,
    constraint_preservation: constraint,
    risk_profile: risk,
    release_recommendation: release,
    claim_limits: HUSH_STYLOMETRY_AUDIT_CLAIM_LIMITS
  };
  const topology = await buildStylometryAuditHashTopology(packetBase);
  const withTopology = { ...packetBase, hash_topology: topology };
  const packetHash = await sha256Text(stableStringify(withTopology));
  return Object.freeze({ ...withTopology, hash_topology: Object.freeze({ ...topology, packet_hash_sha256: packetHash }), packet_hash_sha256: packetHash });
}

if (typeof window !== 'undefined') {
  window.TD613_HUSH_STYLOMETRY_AUDIT_PACKET = Object.freeze({ HUSH_STYLOMETRY_AUDIT_SCHEMA, HUSH_STYLOMETRY_AUDIT_VERSION, HUSH_STYLOMETRY_AUDIT_CLASS, HUSH_STYLOMETRY_AUDIT_CLAIM_LIMITS, isSha256, containsShi, isStylometryAuditPacketId, stylometryAuditPacketHashPreimage, buildStylometryAuditHashTopology, buildStylometryAuditPacket });
}
