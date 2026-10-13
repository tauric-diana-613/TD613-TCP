import { stableStringify, sha256Text } from './hush-customizer-packet.js';
import { buildHushPerMaskPacket, replayHushPerMaskPacketHashes } from './hush-per-mask-packet.js';
import { extractMaskFeatureVector, scoreCandidateAgainstMask } from './hush-stylometric-feature-vector.js';
import { extractSourceObligationSet, scoreSourceObligationRetention } from './hush-phase8-source-obligation.js';
import { buildPhase8NumericDecisionSurface } from './hush-phase8-numeric-decision.js';
import { buildStylometricPassport, buildPhase8OntologyBindings } from './hush-phase8-stylometric-passport.js';
import { buildCandidatePresenceGate, buildPhase8EntrypointAssertion } from './hush-phase8-candidate-presence-gate.js';
import { computeReceiptsQueenieFeatureMetrics, applyReceiptsQueenieDecisionRules } from './hush-phase8-receipts-queenie.js';
import { computeSolStratigraphixFeatureMetrics, applySolStratigraphixDecisionRules } from './hush-phase8-sol-stratigraphix.js';
import { computeHarborZoraFeatureMetrics, applyHarborZoraDecisionRules } from './hush-phase8-harbor-zora.js';
import { computeNolanNeedlerFeatureMetrics, applyNolanNeedlerDecisionRules } from './hush-phase8-nolan-needler.js';
import { computeBloopingBlipFeatureMetrics, applyBloopingBlipDecisionRules } from './hush-phase8-blooping-blip.js';
import { computeBlackstarShereeFeatureMetrics, applyBlackstarShereeDecisionRules } from './hush-phase8-blackstar-sheree.js';
import { computeLuluQuasarFeatureMetrics, applyLuluQuasarDecisionRules } from './hush-phase8-lulu-quasar.js';
import { computeDromologicalPaulFeatureMetrics, applyDromologicalPaulDecisionRules } from './hush-phase8-dromological-paul.js';
import { computeLuzIndexFeatureMetrics, applyLuzIndexDecisionRules } from './hush-phase8-luz-index.js';
import { calibrateBlackstarShereeMetrics } from './hush-phase8-sheree-calibration.js';
import { calibrateNolanNeedlerMetrics } from './hush-phase8-nolan-calibration.js';
import { calibrateSolMetrics } from './hush-phase8-qs-calibration-hotfix.js';

export const HUSH_PER_MASK_METRIC_WRAPPER_SCHEMA = 'td613.hush.phase8.metric-passport-wrapper/v1';
export const HUSH_UNICODE_PERTURBATION_ENVELOPE_SCHEMA = 'td613.hush.phase8.unicode-perturbation-envelope/v1';

function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
function asArray(value) { return Array.isArray(value) ? value : []; }
function unique(values) { return [...new Set(values.filter(Boolean))]; }
async function hashObject(value) { return sha256Text(stableStringify(value == null ? null : value)); }
function tokenUnits(value = '') { return Math.max((String(value || '').match(/[A-Za-z0-9]+/g) || []).length, 1); }
function boundedRate(count, units) { return Math.max(0, Math.min(1, Number((count / units).toFixed(4)))); }
function zeroWidthRate(value = '') { return boundedRate((String(value || '').match(/[\u200B-\u200F\u2060\uFEFF]/gu) || []).length, tokenUnits(value)); }
function homoglyphRate(value = '') { return boundedRate((String(value || '').match(/[\u{1D400}-\u{1D7FF}]/gu) || []).length, tokenUnits(value)); }

function metricPreimage(packet = {}) {
  const material = clone(packet || {});
  delete material.metric_packet_hash_sha256;
  if (material.metric_hash_replay) {
    material.metric_hash_replay.metric_packet_hash_sha256 = null;
    material.metric_hash_replay.status = 'not_run';
  }
  return material;
}

async function metricSectionHashes(packet = {}) {
  return Object.freeze({
    entrypoint_assertion_hash_sha256: await hashObject(packet.entrypoint_assertion || {}),
    base_packet_hash_sha256: await hashObject(packet.base_per_mask_packet || {}),
    stylometric_passport_hash_sha256: await hashObject(packet.stylometric_passport || {}),
    source_obligation_set_hash_sha256: await hashObject(packet.source_obligation_set || {}),
    candidate_presence_gate_hash_sha256: await hashObject(packet.candidate_presence_gate || {}),
    candidate_realization_vector_hash_sha256: await hashObject(packet.candidate_realization_vector || {}),
    unicode_perturbation_envelope_hash_sha256: await hashObject(packet.unicode_perturbation_envelope || null),
    numeric_decision_surface_hash_sha256: await hashObject(packet.numeric_decision_surface || {}),
    ontology_bindings_hash_sha256: await hashObject(packet.ontology_bindings || {})
  });
}

async function buildUnicodePerturbationEnvelope(candidate = '', options = {}) {
  const settings = options.unicodePerturbation || options.unicode_perturbation || options.unicode_perturbation_envelope || null;
  if (!settings) return null;
  const level = Number(settings.perturbation_level ?? settings.unicode_perturbation_level ?? 0);
  if (level <= 0) return null;
  const recovery = settings.normalized_recovery_text ?? settings.recovery_text ?? String(candidate || '').normalize('NFKC');
  const mapMaterial = settings.perturbation_map ?? settings.map ?? null;
  const mapHash = settings.unicode_perturbation_map_hash_sha256 || (mapMaterial ? await hashObject(mapMaterial) : null);
  const envelope = {
    schema: HUSH_UNICODE_PERTURBATION_ENVELOPE_SCHEMA,
    unicode_mode_explicit: settings.unicode_mode_explicit === true,
    perturbation_level: level,
    visible_candidate_hash_sha256: settings.visible_candidate_hash_sha256 || await sha256Text(String(candidate || '')),
    normalized_recovery_text_hash_sha256: settings.normalized_recovery_text_hash_sha256 || await sha256Text(String(recovery || '')),
    unicode_perturbation_map_hash_sha256: mapHash,
    zero_width_presence_rate: settings.zero_width_presence_rate ?? zeroWidthRate(candidate),
    homoglyph_substitution_rate: settings.homoglyph_substitution_rate ?? homoglyphRate(candidate),
    accessibility_warning: settings.accessibility_warning || 'operator review required',
    copy_paste_degradation_risk: settings.copy_paste_degradation_risk ?? (level >= 2 ? 0.18 : 0.08),
    normalization_recovery_score: settings.normalization_recovery_score ?? (mapHash ? 1 : 0),
    raw_candidate_included: false,
    raw_recovery_text_included: false,
    raw_perturbation_map_included: false
  };
  return Object.freeze({ ...envelope, envelope_hash_sha256: await hashObject(envelope) });
}

function unicodeMetrics(envelope = null) {
  if (!envelope) return {};
  return {
    unicode_perturbation_score: envelope.perturbation_level >= 2 ? 0.08 : 0.05,
    zero_width_presence_rate: envelope.zero_width_presence_rate,
    homoglyph_substitution_rate: envelope.homoglyph_substitution_rate,
    normalization_recovery_score: envelope.normalization_recovery_score,
    perturbation_map_present: envelope.unicode_perturbation_map_hash_sha256 ? 1 : 0,
    accessibility_degradation_risk: envelope.perturbation_level >= 2 ? 0.18 : 0.08,
    copy_paste_corruption_risk: envelope.copy_paste_degradation_risk
  };
}

function isSolPassport(passport = {}) { return passport.mask_id === 'library-ghost' && passport.role === 'document_distance'; }
function isHarborZoraPassport(passport = {}) { return passport.mask_id === 'phase27-register-preserve' && passport.role === 'source_register'; }
function isNolanNeedlerPassport(passport = {}) { return passport.mask_id === 'soft-snark' && passport.role === 'low_heat_edge'; }
function isBloopingBlipPassport(passport = {}) { return passport.mask_id === 'burner-minimal' && passport.role === 'hyperchat_custody'; }
function isBlackstarShereePassport(passport = {}) { return passport.mask_id === 'phase28-transform-to-aave' && passport.role === 'chosen_target_register'; }
function isLuluQuasarPassport(passport = {}) { return passport.mask_id === 'quirky-orbit' && passport.role === 'blue_orange_relief'; }
function isDromologicalPaulPassport(passport = {}) { return passport.mask_id === 'forum-regular' && passport.role === 'public_forum_dromology'; }
function isLuzIndexPassport(passport = {}) { return passport.mask_id === 'clipboard' && passport.role === 'custodial_index'; }

async function buildCandidateRealization(maskRef = {}, candidate = '', passport = {}, candidateGate = {}, options = {}) {
  const sourceText = options.sourceText || options.source_summary || maskRef.label || '';
  const sourceObligations = await extractSourceObligationSet(sourceText, options.sourceObligation || options.source_obligation || {});
  const candidateValue = candidateGate.candidate_present ? candidate : '';
  const extracted = await extractMaskFeatureVector(candidateValue, { ...(options.featureVector || options.feature_vector || {}), ...(options.feature_options || {}) });
  const queenieMetrics = passport.role === 'warm_receipts' ? computeReceiptsQueenieFeatureMetrics(candidateValue, { ...options, sourceText, sourceObligations }) : {};
  const solMetrics = isSolPassport(passport) ? calibrateSolMetrics(computeSolStratigraphixFeatureMetrics(candidateValue, { ...options, sourceText, sourceObligations }), candidateValue) : {};
  const zoraMetrics = isHarborZoraPassport(passport) ? computeHarborZoraFeatureMetrics(candidateValue, { ...options, sourceText, sourceObligations }) : {};
  const nolanMetrics = isNolanNeedlerPassport(passport) ? calibrateNolanNeedlerMetrics(computeNolanNeedlerFeatureMetrics(candidateValue, { ...options, sourceText, sourceObligations }), candidateValue, options) : {};
  const blipMetrics = isBloopingBlipPassport(passport) ? computeBloopingBlipFeatureMetrics(candidateValue, { ...options, sourceText, sourceObligations }) : {};
  const shereeMetrics = isBlackstarShereePassport(passport) ? calibrateBlackstarShereeMetrics(computeBlackstarShereeFeatureMetrics(candidateValue, { ...options, sourceText, sourceObligations })) : {};
  const luluMetrics = isLuluQuasarPassport(passport) ? computeLuluQuasarFeatureMetrics(candidateValue, { ...options, sourceText, sourceObligations }) : {};
  const paulMetrics = isDromologicalPaulPassport(passport) ? computeDromologicalPaulFeatureMetrics(candidateValue, { ...options, sourceText, sourceObligations }) : {};
  const luzMetrics = isLuzIndexPassport(passport) ? computeLuzIndexFeatureMetrics(candidateValue, { ...options, sourceText, sourceObligations }) : {};
  const mergedFeatures = Object.freeze({ ...extracted.feature_vector, ...queenieMetrics, ...solMetrics, ...zoraMetrics, ...nolanMetrics, ...blipMetrics, ...shereeMetrics, ...luluMetrics, ...paulMetrics, ...luzMetrics });
  const featureVector = Object.freeze({ ...extracted, feature_vector: mergedFeatures, feature_vector_hash_sha256: await sha256Text(stableStringify(mergedFeatures)) });
  const sourceRetention = scoreSourceObligationRetention(sourceObligations, candidateValue, options.sourceRetention || options.source_retention || {});
  const maskFit = scoreCandidateAgainstMask(featureVector, passport.mask_centroid, passport.generic_ai_baseline, options.maskFit || options.mask_fit || {});
  return Object.freeze({
    sourceObligations,
    realization: Object.freeze({
      schema: 'td613.hush.phase8.candidate-realization-vector/v1',
      candidate_hash_sha256: candidateGate.candidate_hash_sha256,
      raw_candidate_included: false,
      feature_vector: featureVector.feature_vector,
      feature_vector_hash_sha256: featureVector.feature_vector_hash_sha256,
      source_retention: sourceRetention,
      mask_fit: maskFit,
      generic_ai_distance: Object.freeze({ generic_ai_baseline_distance: maskFit.generic_ai_baseline_distance }),
      imperfection_profile: Object.freeze({ bounded_irregularity_index: featureVector.feature_vector.bounded_irregularity_index, imperfection_budget_used: featureVector.feature_vector.imperfection_budget_used, rhythm_asymmetry_score: featureVector.feature_vector.rhythm_asymmetry_score, nonuniformity_without_damage: featureVector.feature_vector.nonuniformity_without_damage }),
      sample_reuse_profile: Object.freeze({ sample_seed_lexical_overlap: featureVector.feature_vector.sample_seed_lexical_overlap, sample_seed_phrase_overlap: featureVector.feature_vector.sample_seed_phrase_overlap, rare_phrase_reuse: featureVector.feature_vector.rare_phrase_reuse, profile_reconstruction_risk: featureVector.feature_vector.profile_reconstruction_risk }),
      anti_slop_profile: Object.freeze({ generic_helper_voice_score: featureVector.feature_vector.generic_helper_voice_score, api_sheen_score: featureVector.feature_vector.api_sheen_score, polish_pressure: featureVector.feature_vector.polish_pressure, closure_lamination_score: featureVector.feature_vector.closure_lamination_score })
    })
  });
}

function finalStatus(basePacket = {}, decision = {}, gate = {}, entrypoint = {}) {
  if (entrypoint.status === 'blocked' || gate.status === 'blocked') return 'blocked';
  if (basePacket.packet_status === 'blocked' || decision.status === 'blocked') return 'blocked';
  if (basePacket.packet_status === 'repair_required' || decision.status === 'repair_required') return 'repair_required';
  if (decision.status === 'cultural_review_required') return 'cultural_review_required';
  return basePacket.packet_status || 'calibrated';
}

export async function buildHushPerMaskPacketWithMetricPassport(maskRef = {}, options = {}) {
  const basePacket = await buildHushPerMaskPacket(maskRef, options);
  const passport = await buildStylometricPassport(maskRef, options.passport || {});
  const sourceText = options.sourceText || options.source_summary || maskRef.label || '';
  const candidate = options.candidate ?? options.candidateText ?? '';
  const unicodeEnvelope = await buildUnicodePerturbationEnvelope(candidate, options);
  const candidateGate = await buildCandidatePresenceGate(candidate, sourceText, { candidate_required: options.candidate_required !== false, missing_candidate_status: options.missing_candidate_status || 'blocked' });
  const candidateParts = await buildCandidateRealization(maskRef, candidate, passport, candidateGate, { ...options, featureVector: { ...(options.featureVector || options.feature_vector || {}), ...unicodeMetrics(unicodeEnvelope) } });
  let decision = buildPhase8NumericDecisionSurface({ feature_vector: candidateParts.realization.feature_vector, source_retention: candidateParts.realization.source_retention, mask_fit: candidateParts.realization.mask_fit }, passport.tolerance_bands, {
    claim_ceiling_held: true,
    raw_sample_text_included: false,
    public_default_allowed: false,
    candidate_required: candidateGate.candidate_required,
    candidate_present: candidateGate.candidate_present,
    candidate_hash_sha256: candidateGate.candidate_hash_sha256,
    source_text_used_as_candidate: candidateGate.source_text_used_as_candidate,
    explicit_source_obligation_required: candidateParts.sourceObligations.explicit_source_obligation_required === true,
    explicit_source_obligation_present: candidateParts.sourceObligations.explicit_source_obligation_present === true,
    source_obligation_gate_status: candidateParts.sourceObligations.source_obligation_status || candidateParts.realization.source_retention.source_obligation_gate_status,
    threshold_version: passport.passport_tag
  });
  if (passport.role === 'warm_receipts') decision = applyReceiptsQueenieDecisionRules(decision, candidateParts.realization.feature_vector, passport.tolerance_bands);
  if (isSolPassport(passport)) decision = applySolStratigraphixDecisionRules(decision, candidateParts.realization.feature_vector, passport.tolerance_bands);
  if (isHarborZoraPassport(passport)) decision = applyHarborZoraDecisionRules(decision, candidateParts.realization.feature_vector, passport.tolerance_bands);
  if (isNolanNeedlerPassport(passport)) decision = applyNolanNeedlerDecisionRules(decision, candidateParts.realization.feature_vector, passport.tolerance_bands);
  if (isBloopingBlipPassport(passport)) decision = applyBloopingBlipDecisionRules(decision, candidateParts.realization.feature_vector, passport.tolerance_bands);
  if (isBlackstarShereePassport(passport)) decision = applyBlackstarShereeDecisionRules(decision, candidateParts.realization.feature_vector, passport.tolerance_bands);
  if (isLuluQuasarPassport(passport)) decision = applyLuluQuasarDecisionRules(decision, candidateParts.realization.feature_vector, passport.tolerance_bands);
  if (isDromologicalPaulPassport(passport)) decision = applyDromologicalPaulDecisionRules(decision, candidateParts.realization.feature_vector, passport.tolerance_bands);
  if (isLuzIndexPassport(passport)) decision = applyLuzIndexDecisionRules(decision, candidateParts.realization.feature_vector, passport.tolerance_bands);
  const ontology = buildPhase8OntologyBindings();
  const wrapper = {
    schema: HUSH_PER_MASK_METRIC_WRAPPER_SCHEMA,
    phase: 'PHASE_8_0C_GATE_HARDENING',
    mask_packet_id: basePacket.mask_packet_id,
    mask_id: basePacket.mask_id,
    entrypoint_assertion: null,
    base_per_mask_packet: basePacket,
    stylometric_passport: passport,
    source_obligation_set: candidateParts.sourceObligations,
    candidate_presence_gate: candidateGate,
    candidate_realization_vector: candidateParts.realization,
    unicode_perturbation_envelope: unicodeEnvelope,
    numeric_decision_surface: decision,
    ontology_bindings: ontology,
    packet_status: 'calibrated',
    public_default_allowed: false,
    raw_candidate_included: false,
    raw_sample_text_included: false,
    metric_hash_replay: null,
    metric_packet_hash_sha256: null
  };
  const entrypoint = buildPhase8EntrypointAssertion(wrapper);
  const withEntry = { ...wrapper, entrypoint_assertion: entrypoint, packet_status: finalStatus(basePacket, decision, candidateGate, entrypoint) };
  const replayShell = Object.freeze({ schema: 'td613.hush.phase8.metric-hash-replay/v1', metric_packet_hash_sha256: null, section_hashes: await metricSectionHashes(withEntry), hash_only_packet_blocked: true, status: 'not_run' });
  const withReplay = { ...withEntry, metric_hash_replay: replayShell };
  const hash = await hashObject(metricPreimage(withReplay));
  const replay = Object.freeze({ ...replayShell, metric_packet_hash_sha256: hash, status: 'passed' });
  return Object.freeze({ ...withEntry, metric_hash_replay: replay, metric_packet_hash_sha256: hash });
}

export async function replayHushPerMaskMetricPassportHashes(packet = {}) {
  const reasons = [];
  const baseReplay = packet.base_per_mask_packet ? await replayHushPerMaskPacketHashes(packet.base_per_mask_packet) : { status: 'failed', refusal_reasons: ['base per-mask packet missing'] };
  if (baseReplay.status !== 'passed') reasons.push(...asArray(baseReplay.refusal_reasons));
  const expectedSections = await metricSectionHashes(packet);
  const declared = packet.metric_hash_replay?.section_hashes || {};
  for (const [key, expected] of Object.entries(expectedSections)) if (declared[key] !== expected) reasons.push(`${key} mismatch`);
  const expected = await hashObject(metricPreimage(packet));
  if (packet.metric_packet_hash_sha256 !== expected) reasons.push('metric packet hash mismatch');
  if (packet.metric_hash_replay?.metric_packet_hash_sha256 !== expected) reasons.push('metric replay hash mismatch');
  if (packet.metric_packet_hash_sha256 && !packet.base_per_mask_packet && !packet.stylometric_passport) reasons.push('hash-only metric packet blocked');
  return Object.freeze({ schema: 'td613.hush.phase8.metric-hash-replay-result/v1', status: reasons.length ? 'failed' : 'passed', refusal_reasons: Object.freeze(unique(reasons)), expected_metric_packet_hash_sha256: expected, hash_only_packet_blocked: true });
}

if (typeof window !== 'undefined') window.TD613_HUSH_PHASE8_METRIC_PASSPORT = Object.freeze({ HUSH_PER_MASK_METRIC_WRAPPER_SCHEMA, HUSH_UNICODE_PERTURBATION_ENVELOPE_SCHEMA, buildHushPerMaskPacketWithMetricPassport, replayHushPerMaskMetricPassportHashes });
