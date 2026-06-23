import { stableStringify, sha256Text } from './hush-customizer-packet.js';
import { buildHushPerMaskPacket, replayHushPerMaskPacketHashes } from './hush-per-mask-packet.js';
import { extractMaskFeatureVector, scoreCandidateAgainstMask } from './hush-stylometric-feature-vector.js';
import { extractSourceObligationSet, scoreSourceObligationRetention } from './hush-phase8-source-obligation.js';
import { buildPhase8NumericDecisionSurface } from './hush-phase8-numeric-decision.js';
import { buildStylometricPassport, buildPhase8OntologyBindings } from './hush-phase8-stylometric-passport.js';

export const HUSH_PER_MASK_METRIC_WRAPPER_SCHEMA = 'td613.hush.phase8.metric-passport-wrapper/v1';

function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
function asArray(value) { return Array.isArray(value) ? value : []; }
function unique(values) { return [...new Set(values.filter(Boolean))]; }
async function hashObject(value) { return sha256Text(stableStringify(value == null ? null : value)); }

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
    base_packet_hash_sha256: await hashObject(packet.base_per_mask_packet || {}),
    stylometric_passport_hash_sha256: await hashObject(packet.stylometric_passport || {}),
    source_obligation_set_hash_sha256: await hashObject(packet.source_obligation_set || {}),
    candidate_realization_vector_hash_sha256: await hashObject(packet.candidate_realization_vector || {}),
    numeric_decision_surface_hash_sha256: await hashObject(packet.numeric_decision_surface || {}),
    ontology_bindings_hash_sha256: await hashObject(packet.ontology_bindings || {})
  });
}

async function buildCandidateRealization(maskRef = {}, candidate = '', passport = {}, options = {}) {
  const sourceText = options.sourceText || options.source_summary || maskRef.label || '';
  const sourceObligations = await extractSourceObligationSet(sourceText, options.sourceObligation || options.source_obligation || {});
  const featureVector = await extractMaskFeatureVector(candidate || sourceText, options.featureVector || options.feature_vector || {});
  const sourceRetention = scoreSourceObligationRetention(sourceObligations, candidate || sourceText, options.sourceRetention || options.source_retention || {});
  const maskFit = scoreCandidateAgainstMask(featureVector, passport.mask_centroid, passport.generic_ai_baseline, options.maskFit || options.mask_fit || {});
  return Object.freeze({
    sourceObligations,
    realization: Object.freeze({
      schema: 'td613.hush.phase8.candidate-realization-vector/v1',
      candidate_hash_sha256: featureVector.text_hash_sha256,
      raw_candidate_included: false,
      feature_vector: featureVector.feature_vector,
      feature_vector_hash_sha256: featureVector.feature_vector_hash_sha256,
      source_retention: sourceRetention,
      mask_fit: maskFit,
      generic_ai_distance: Object.freeze({ generic_ai_baseline_distance: maskFit.generic_ai_baseline_distance }),
      imperfection_profile: Object.freeze({
        bounded_irregularity_index: featureVector.feature_vector.bounded_irregularity_index,
        imperfection_budget_used: featureVector.feature_vector.imperfection_budget_used,
        rhythm_asymmetry_score: featureVector.feature_vector.rhythm_asymmetry_score,
        nonuniformity_without_damage: featureVector.feature_vector.nonuniformity_without_damage
      }),
      sample_reuse_profile: Object.freeze({
        sample_seed_lexical_overlap: featureVector.feature_vector.sample_seed_lexical_overlap,
        sample_seed_phrase_overlap: featureVector.feature_vector.sample_seed_phrase_overlap,
        rare_phrase_reuse: featureVector.feature_vector.rare_phrase_reuse,
        profile_reconstruction_risk: featureVector.feature_vector.profile_reconstruction_risk
      }),
      anti_slop_profile: Object.freeze({
        generic_helper_voice_score: featureVector.feature_vector.generic_helper_voice_score,
        api_sheen_score: featureVector.feature_vector.api_sheen_score,
        polish_pressure: featureVector.feature_vector.polish_pressure,
        closure_lamination_score: featureVector.feature_vector.closure_lamination_score
      })
    })
  });
}

function finalStatus(basePacket = {}, decision = {}) {
  if (basePacket.packet_status === 'blocked' || decision.status === 'blocked') return 'blocked';
  if (basePacket.packet_status === 'repair_required' || decision.status === 'repair_required') return 'repair_required';
  return basePacket.packet_status || 'calibrated';
}

export async function buildHushPerMaskPacketWithMetricPassport(maskRef = {}, options = {}) {
  const basePacket = await buildHushPerMaskPacket(maskRef, options);
  const passport = await buildStylometricPassport(maskRef, options.passport || {});
  const candidateParts = await buildCandidateRealization(maskRef, options.candidate || options.candidateText || '', passport, options);
  const decision = buildPhase8NumericDecisionSurface({
    feature_vector: candidateParts.realization.feature_vector,
    source_retention: candidateParts.realization.source_retention,
    mask_fit: candidateParts.realization.mask_fit
  }, passport.tolerance_bands, {
    claim_ceiling_held: true,
    raw_sample_text_included: false,
    public_default_allowed: false,
    threshold_version: passport.passport_tag
  });
  const ontology = buildPhase8OntologyBindings();
  const wrapper = {
    schema: HUSH_PER_MASK_METRIC_WRAPPER_SCHEMA,
    phase: 'PHASE_8_0B_HARD_METRIC_PASSPORT',
    mask_packet_id: basePacket.mask_packet_id,
    mask_id: basePacket.mask_id,
    base_per_mask_packet: basePacket,
    stylometric_passport: passport,
    source_obligation_set: candidateParts.sourceObligations,
    candidate_realization_vector: candidateParts.realization,
    numeric_decision_surface: decision,
    ontology_bindings: ontology,
    packet_status: finalStatus(basePacket, decision),
    public_default_allowed: false,
    raw_candidate_included: false,
    raw_sample_text_included: false,
    metric_hash_replay: null,
    metric_packet_hash_sha256: null
  };
  const replayShell = Object.freeze({ schema: 'td613.hush.phase8.metric-hash-replay/v1', metric_packet_hash_sha256: null, section_hashes: await metricSectionHashes(wrapper), hash_only_packet_blocked: true, status: 'not_run' });
  const withReplay = { ...wrapper, metric_hash_replay: replayShell };
  const hash = await hashObject(metricPreimage(withReplay));
  const replay = Object.freeze({ ...replayShell, metric_packet_hash_sha256: hash, status: 'passed' });
  return Object.freeze({ ...wrapper, metric_hash_replay: replay, metric_packet_hash_sha256: hash });
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
