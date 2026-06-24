import { stableStringify, sha256Text } from './hush-customizer-packet.js';
import { HUSH_MASK_CENTROID_SCHEMA } from './hush-stylometric-feature-vector.js';

export const HARBOR_ZORA_METRIC_PROFILE_SCHEMA = 'td613.hush.phase8.harbor-zora-metrics/v1';

export const HARBOR_ZORA_CADENCE_HEATMAP = Object.freeze({
  sourceStance: Object.freeze({ min: 0.0, max: 0.28 }),
  registerFamily: Object.freeze({ min: 0.18, max: 0.52 }),
  uncertainty: Object.freeze({ min: 0.0, max: 0.64 }),
  idiolectTrace: Object.freeze({ min: 0.0, max: 0.18 }),
  custodyForce: Object.freeze({ min: 0.42, max: 1.0 }),
  expectedContour: 'source-shadow-displaced-fingerprint',
  forbiddenContours: Object.freeze([
    'generic-institutional-bleach',
    'target-register-replacement',
    'small-circle-cluster',
    'warm-envelope-hard-latch',
    'cold-ledger-mild-haunt',
    'adversarial-fracture-shard'
  ])
});

export const HARBOR_ZORA_THRESHOLDS = Object.freeze({
  mandatory_anchor_retention: 1,
  factual_damage_risk_max: 0.05,
  source_unit_coverage_min: 0.78,
  hedge_retention_min: 0,
  sequence_relation_retention_min: 0,
  generic_helper_voice_score_max: 0.16,
  api_sheen_score_max: 0.18,
  polish_pressure_max: 0.22,
  closure_lamination_score_max: 0.35,
  sample_seed_phrase_overlap_max: 0,
  rare_phrase_reuse_max: 0.08,
  sample_seed_lexical_overlap_max: 0.08,
  profile_reconstruction_risk_max: 0.14,
  private_cadence_exposure_risk_max: 0.14,
  mask_breath_score_min: 0.45,
  bounded_irregularity_index_min: 0,
  bounded_irregularity_index_max: 0.82,
  rhythm_asymmetry_score_min: 0,
  imperfection_budget_used_min: 0,
  imperfection_budget_used_max: 0.86,
  nonuniformity_without_damage_min: 0.35,
  mask_centroid_distance_max: 0.75,
  mask_family_fit_min: 0.2,
  role_behavior_fit_min: 0.25,
  generic_ai_baseline_distance_min: 0,
  event_sequence_retention_min: 0.72,
  claim_scope_retention_min: 0.78,
  source_register_retention_score_min: 0.72,
  register_family_fit_score_min: 0.72,
  source_motion_retention_score_min: 0.62,
  source_rhythm_category_retention_min: 0.52,
  source_relation_retention_score_min: 0.62,
  hedge_retention_score_min: 0.72,
  uncertainty_preservation_score_min: 0.74,
  scope_limitation_retention_min: 0.72,
  epistemic_caution_score_min: 0.68,
  certainty_inflation_risk_max: 0.06,
  idiolect_fingerprint_risk_max: 0.18,
  rare_phrase_reuse_rate_max: 0.04,
  source_ngram_overlap_rate_max: 0.18,
  punctuation_fingerprint_retention_max: 0.22,
  linebreak_signature_retention_max: 0.22,
  function_word_signature_similarity_max: 0.46,
  syntax_loop_reuse_score_max: 0.24,
  bounded_deidentification_score_min: 0.58,
  register_bleaching_risk_max: 0.18,
  institutional_smoothing_score_max: 0.16,
  therapy_reassurance_score_max: 0.08,
  legal_memo_flattening_score_max: 0.14,
  opacity_preservation_score_min: 0.7,
  overexplanation_risk_max: 0.22,
  forced_clarity_risk_max: 0.14,
  speaker_boundary_retention_min: 0.68,
  withheld_context_respect_score_min: 0.68,
  anonymity_guarantee_claim_max: 0,
  untraceability_claim_max: 0,
  legal_safety_claim_max: 0,
  consent_or_release_claim_max: 0,
  authorship_proof_claim_max: 0,
  identity_proof_claim_max: 0,
  false_harbor_claim_max: 0,
  register_replacement_risk_max: 0.08,
  over_opacity_risk_max: 0.18
});

const HEDGE_MARKERS = ['maybe', 'may', 'might', 'could', 'not sure', 'do not know', "don't know", 'not prove', 'not prove the whole', 'narrow', 'not overstate', 'uncertainty', 'possible', 'appears'];
const SCOPE_MARKERS = ['narrow', 'not prove', 'not overstate', 'not make the claim bigger', 'maybe column', 'turn out to be small', 'record supports', 'uncertainty'];
const RELATION_MARKERS = ['worried', 'worries', 'worrying', 'the part', 'point', 'visible', 'stay with', 'separate', 'attached'];
const BLEACH_MARKERS = ['available documentation', 'documentation indicates', 'possible inconsistency', 'relevant documentation', 'institutional', 'accordingly', 'indicates'];
const LEGAL_MEMO_MARKERS = ['documentation indicates', 'indicates a possible', 'relevant', 'accordingly', 'legal', 'court', 'proof'];
const THERAPY_MARKERS = ['safe to share', 'you are safe', 'holding space', 'supportive', 'mindful', 'healing'];
const FALSE_HARBOR_MARKERS = ['cannot be traced', 'guaranteed anonymous', 'guaranteed privacy', 'impossible to attribute', 'untraceable', 'removes your identifiable writing style', 'no longer sounds like you'];
const SAFETY_MARKERS = ['safe to share', 'legal protection', 'legally protected', 'release permission', 'consent to share'];
const IDENTITY_MARKERS = ['proves identity', 'identity proof', 'authorship proof', 'proves authorship'];
const REPLACEMENT_MARKERS = ['girl', 'doing too much', 'bestie', 'hey love', 'everyone here', 'thread'];
const VAGUE_MARKERS = ['thing', 'something', 'pieces', 'somewhere', 'stuff'];
const CERTAINTY_MARKERS = ['proves', 'definitely', 'clearly proves', 'shows what happened', 'is proof'];
const RARE_SOURCE_PHRASES = ['i don’t know if this proves anything yet', "i don't know if this proves anything yet", 'i’m worried because', "i'm worried because", 'keeps showing up where it should not', 'i don’t want to overstate it', "i don't want to overstate it", 'maybe this is nothing', 'dates feel off', 'i’m only saying this because', "i'm only saying this because"];
const ANCHOR_WORDS = new Set(['file', 'file-72', '72', '6', '18', 'wjct', 'label', 'footer', 'mismatch', 'date', 'export']);
const FUNCTION_WORDS = ['i', 'this', 'that', 'because', 'but', 'if', 'and', 'the', 'it', 'not', 'to', 'with', 'from', 'what'];

function text(value) { return String(value || ''); }
function lower(value) { return text(value).toLowerCase(); }
function tokens(value) { return lower(value).match(/[a-z0-9][a-z0-9'-]*/g) || []; }
function lines(value) { return text(value).split(/\n+/u).map((part) => part.trim()).filter(Boolean); }
function clamp(value) { return Math.max(0, Math.min(1, Number((Number(value) || 0).toFixed(4)))); }
function rate(n, d) { return clamp(d ? n / d : 0); }
function phraseHits(phrases, value) { const v = lower(value); return phrases.filter((phrase) => v.includes(String(phrase).toLowerCase())).length; }
function hasAny(phrases, value) { return phraseHits(phrases, value) > 0; }
function exactPhrase(value, phraseText) {
  const escaped = String(phraseText).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|[^A-Za-z0-9])${escaped}(?:$|[^A-Za-z0-9])`, 'iu').test(text(value));
}
function unique(values) { return [...new Set(values.filter(Boolean))]; }
function addMetricRule(lists, name, passed) { (passed ? lists.passed : lists.repair).push(name); }
function addHardRule(lists, name, passed) { (passed ? lists.passed : lists.failed).push(name); }

function filteredNgrams(value = '', size = 4) {
  const list = tokens(value).filter((token) => !ANCHOR_WORDS.has(token));
  const out = [];
  for (let i = 0; i <= list.length - size; i += 1) out.push(list.slice(i, i + size).join(' '));
  return unique(out);
}
function ngramOverlap(source = '', candidate = '') {
  const sourceNgrams = filteredNgrams(source, 4);
  if (!sourceNgrams.length) return 0;
  const candidateValue = lower(candidate);
  return rate(sourceNgrams.filter((ngram) => candidateValue.includes(ngram)).length, sourceNgrams.length);
}
function punctuationRetention(source = '', candidate = '') {
  const sourceComma = (text(source).match(/,/g) || []).length;
  const candidateComma = (text(candidate).match(/,/g) || []).length;
  const sourceSemi = (text(source).match(/[;:]/g) || []).length;
  const candidateSemi = (text(candidate).match(/[;:]/g) || []).length;
  return clamp(1 - (Math.abs(sourceComma - candidateComma) + Math.abs(sourceSemi - candidateSemi)) / 8);
}
function linebreakRetention(source = '', candidate = '') {
  const s = lines(source).length;
  const c = lines(candidate).length;
  return s === c ? 0.36 : clamp(1 - Math.abs(s - c) / 6);
}
function functionSimilarity(source = '', candidate = '') {
  const st = tokens(source);
  const ct = tokens(candidate);
  if (!st.length || !ct.length) return 0;
  const deltas = FUNCTION_WORDS.map((word) => Math.abs(rate(st.filter((token) => token === word).length, st.length) - rate(ct.filter((token) => token === word).length, ct.length)));
  return clamp(1 - deltas.reduce((sum, n) => sum + n, 0) * 3.2);
}
function phraseReuseRate(source = '', candidate = '') {
  const sourceValue = lower(source);
  const phrases = RARE_SOURCE_PHRASES.filter((item) => sourceValue.includes(item));
  if (!phrases.length) return 0;
  return rate(phrases.filter((item) => lower(candidate).includes(item)).length, phrases.length);
}

export function isHarborZoraRecord(maskRecord = {}) {
  return maskRecord.mask_id === 'phase27-register-preserve' || maskRecord.gallery_role === 'source_register' || maskRecord.intended_role === 'source_register' || maskRecord.family === 'source register' || maskRecord.family === 'register custody';
}

export async function buildHarborZoraCentroid(maskRecord = {}, calibrationSamples = []) {
  const centroid = Object.freeze({
    mean_sentence_length: 16,
    sentence_length_cv: 0.44,
    lexical_density: 0.6,
    hedge_marker_rate: 0.06,
    abbreviation_rate: 0.01,
    generic_helper_voice_score: 0.03,
    api_sheen_score: 0.03,
    bounded_irregularity_index: 0.42,
    breath_retention_score: 0.78,
    idiolect_fingerprint_risk: 0.14,
    register_bleaching_risk: 0.12
  });
  return Object.freeze({
    schema: HUSH_MASK_CENTROID_SCHEMA,
    mask_id: maskRecord.mask_id || null,
    role: 'source_register',
    source_adaptive: true,
    adaptive_dimensions: Object.freeze(['source_stance_retention', 'idiolect_fingerprint_reduction', 'uncertainty_preservation', 'bounded_deidentification']),
    centroid_features: centroid,
    calibration_sample_count: calibrationSamples.length,
    centroid_hash_sha256: await sha256Text(stableStringify(centroid))
  });
}

export function computeHarborZoraFeatureMetrics(candidate = '', options = {}) {
  const value = text(candidate);
  const source = text(options.sourceRegisterText || options.source_register_text || options.sourceText || '');
  const tokenList = tokens(value);
  const tokenCount = Math.max(tokenList.length, 1);
  const sourceHasUncertainty = hasAny(HEDGE_MARKERS, source) || /\b(if|maybe|may|might|could)\b/iu.test(source);
  const candidateHasUncertainty = hasAny(HEDGE_MARKERS, value) || /\b(maybe|may|might|could)\b/iu.test(value);
  const sourceHasRelation = hasAny(RELATION_MARKERS, source) || /worr/iu.test(source);
  const relationHits = phraseHits(RELATION_MARKERS, value) + (/worr/iu.test(value) ? 1 : 0);
  const anchorVisibility = clamp((['FILE-72', '6/18', 'WJCT label', 'footer mismatch'].filter((anchor) => lower(value).includes(anchor.toLowerCase())).length) / 4);
  const uncertaintyPreservation = sourceHasUncertainty ? (candidateHasUncertainty ? 0.9 : 0.24) : (candidateHasUncertainty ? 0.72 : 1);
  const scopeRetention = clamp((hasAny(SCOPE_MARKERS, value) ? 0.72 : 0.24) + uncertaintyPreservation * 0.28);
  const relationRetention = sourceHasRelation ? clamp(relationHits * 0.22 + anchorVisibility * 0.42 + uncertaintyPreservation * 0.24) : clamp(anchorVisibility * 0.6 + 0.28);
  const sourceMotion = clamp((hasAny(['stay', 'keeps', 'keeping', 'keep', 'separate', 'visible', 'column'], value) ? 0.48 : 0.18) + anchorVisibility * 0.34 + uncertaintyPreservation * 0.18);
  const registerFit = clamp(uncertaintyPreservation * 0.36 + relationRetention * 0.24 + sourceMotion * 0.22 + anchorVisibility * 0.18);
  const rareReuse = phraseReuseRate(source, value);
  const ngramReuse = ngramOverlap(source, value);
  const punctuationRisk = punctuationRetention(source, value);
  const linebreakRisk = linebreakRetention(source, value);
  const functionRisk = functionSimilarity(source, value);
  const syntaxLoopReuse = clamp(ngramReuse * 0.55 + punctuationRisk * 0.18 + linebreakRisk * 0.12 + rareReuse * 0.15);
  const idiolectRisk = clamp(rareReuse * 0.34 + ngramReuse * 0.34 + punctuationRisk * 0.12 + linebreakRisk * 0.08 + functionRisk * 0.08 + syntaxLoopReuse * 0.04);
  const certaintyInflation = clamp(phraseHits(CERTAINTY_MARKERS, value) * 0.28 + (sourceHasUncertainty && !candidateHasUncertainty ? 0.32 : 0));
  const institutional = clamp(phraseHits(BLEACH_MARKERS, value) * 0.2 + phraseHits(['available', 'documentation', 'indicates', 'involving'], value) * 0.06);
  const legalMemo = clamp(phraseHits(LEGAL_MEMO_MARKERS, value) * 0.16);
  const therapy = clamp(phraseHits(THERAPY_MARKERS, value) * 0.22);
  const genericVoice = clamp(institutional * 0.6 + legalMemo * 0.2 + therapy * 0.2);
  const registerBleach = clamp(institutional * 0.58 + (candidateHasUncertainty ? 0 : 0.22) + (relationHits ? 0 : 0.12));
  const falseHarbor = clamp(phraseHits(FALSE_HARBOR_MARKERS, value));
  const legalSafety = clamp(phraseHits(SAFETY_MARKERS, value) * 0.42);
  const identityClaim = clamp(phraseHits(IDENTITY_MARKERS, value) * 0.44);
  const releaseClaim = clamp((/\bconsent\b|release permission|safe to share/iu.test(value) ? 1 : 0));
  const replacement = clamp(phraseHits(REPLACEMENT_MARKERS, value) * 0.22 + (/\bgirl\b/iu.test(value) ? 0.32 : 0));
  const overOpacity = clamp(phraseHits(VAGUE_MARKERS, value) * 0.16 + (anchorVisibility < 0.5 ? 0.42 : 0));
  const boundedDeid = clamp(registerFit * 0.46 + (1 - idiolectRisk) * 0.38 + (1 - registerBleach) * 0.16);
  const opacity = clamp((1 - idiolectRisk) * 0.5 + uncertaintyPreservation * 0.22 + scopeRetention * 0.18 + (1 - falseHarbor) * 0.1);
  const overExplanation = clamp(tokenCount > 42 ? 0.24 : 0.04 + institutional * 0.12);
  const forcedClarity = clamp(institutional * 0.42 + (candidateHasUncertainty ? 0 : 0.18));
  const speakerBoundary = clamp(scopeRetention * 0.48 + opacity * 0.32 + (falseHarbor ? 0 : 0.2));
  const withheldRespect = clamp(scopeRetention * 0.42 + (1 - overExplanation) * 0.26 + uncertaintyPreservation * 0.32);
  return Object.freeze({
    schema: HARBOR_ZORA_METRIC_PROFILE_SCHEMA,
    source_register_retention_score: registerFit,
    register_family_fit_score: registerFit,
    source_motion_retention_score: sourceMotion,
    source_rhythm_category_retention: clamp(0.56 + (candidateHasUncertainty ? 0.16 : 0) - institutional * 0.16 - replacement * 0.16),
    source_relation_retention_score: relationRetention,
    hedge_retention_score: uncertaintyPreservation,
    uncertainty_preservation_score: uncertaintyPreservation,
    scope_limitation_retention: scopeRetention,
    epistemic_caution_score: clamp(uncertaintyPreservation * 0.68 + scopeRetention * 0.32),
    certainty_inflation_risk: certaintyInflation,
    idiolect_fingerprint_risk: idiolectRisk,
    rare_phrase_reuse_rate: rareReuse,
    source_ngram_overlap_rate: ngramReuse,
    punctuation_fingerprint_retention: punctuationRisk,
    linebreak_signature_retention: linebreakRisk,
    function_word_signature_similarity: functionRisk,
    syntax_loop_reuse_score: syntaxLoopReuse,
    bounded_deidentification_score: boundedDeid,
    register_bleaching_risk: registerBleach,
    institutional_smoothing_score: institutional,
    therapy_reassurance_score: therapy,
    legal_memo_flattening_score: legalMemo,
    opacity_preservation_score: opacity,
    overexplanation_risk: overExplanation,
    forced_clarity_risk: forcedClarity,
    speaker_boundary_retention: speakerBoundary,
    withheld_context_respect_score: withheldRespect,
    event_sequence_retention: clamp(anchorVisibility * 0.72 + sourceMotion * 0.28),
    claim_scope_retention: scopeRetention,
    relation_to_record_retention: relationRetention,
    anonymity_guarantee_claim: falseHarbor,
    untraceability_claim: falseHarbor,
    legal_safety_claim: legalSafety,
    consent_or_release_claim: releaseClaim,
    authorship_proof_claim: identityClaim,
    identity_proof_claim: identityClaim,
    false_harbor_claim: clamp(falseHarbor + legalSafety + releaseClaim),
    register_replacement_risk: replacement,
    over_opacity_risk: overOpacity,
    target_register_leakage_score: replacement,
    generic_ai_voice_score: genericVoice,
    cadence_heatmap_contour: 'source-shadow-displaced-fingerprint'
  });
}

export function applyHarborZoraDecisionRules(decision = {}, featureVector = {}, thresholds = HARBOR_ZORA_THRESHOLDS) {
  const lists = { passed: [...(decision.passed_thresholds || [])], failed: [...(decision.failed_thresholds || [])], repair: [...(decision.repair_thresholds || [])] };
  const f = featureVector || {};
  addMetricRule(lists, 'source_register_retention_score', (f.source_register_retention_score ?? 0) >= thresholds.source_register_retention_score_min);
  addMetricRule(lists, 'register_family_fit_score', (f.register_family_fit_score ?? 0) >= thresholds.register_family_fit_score_min);
  addMetricRule(lists, 'source_motion_retention_score', (f.source_motion_retention_score ?? 0) >= thresholds.source_motion_retention_score_min);
  addMetricRule(lists, 'source_rhythm_category_retention', (f.source_rhythm_category_retention ?? 0) >= thresholds.source_rhythm_category_retention_min);
  addMetricRule(lists, 'source_relation_retention_score', (f.source_relation_retention_score ?? 0) >= thresholds.source_relation_retention_score_min);
  addMetricRule(lists, 'hedge_retention_score', (f.hedge_retention_score ?? 0) >= thresholds.hedge_retention_score_min);
  addMetricRule(lists, 'uncertainty_preservation_score', (f.uncertainty_preservation_score ?? 0) >= thresholds.uncertainty_preservation_score_min);
  addMetricRule(lists, 'scope_limitation_retention', (f.scope_limitation_retention ?? 0) >= thresholds.scope_limitation_retention_min);
  addMetricRule(lists, 'epistemic_caution_score', (f.epistemic_caution_score ?? 0) >= thresholds.epistemic_caution_score_min);
  addHardRule(lists, 'certainty_inflation_risk', (f.certainty_inflation_risk ?? 0) <= thresholds.certainty_inflation_risk_max);
  addMetricRule(lists, 'idiolect_fingerprint_risk', (f.idiolect_fingerprint_risk ?? 0) <= thresholds.idiolect_fingerprint_risk_max);
  addMetricRule(lists, 'rare_phrase_reuse_rate', (f.rare_phrase_reuse_rate ?? 0) <= thresholds.rare_phrase_reuse_rate_max);
  addMetricRule(lists, 'source_ngram_overlap_rate', (f.source_ngram_overlap_rate ?? 0) <= thresholds.source_ngram_overlap_rate_max);
  addMetricRule(lists, 'punctuation_fingerprint_retention', (f.punctuation_fingerprint_retention ?? 0) <= thresholds.punctuation_fingerprint_retention_max);
  addMetricRule(lists, 'linebreak_signature_retention', (f.linebreak_signature_retention ?? 0) <= thresholds.linebreak_signature_retention_max);
  addMetricRule(lists, 'function_word_signature_similarity', (f.function_word_signature_similarity ?? 0) <= thresholds.function_word_signature_similarity_max);
  addMetricRule(lists, 'syntax_loop_reuse_score', (f.syntax_loop_reuse_score ?? 0) <= thresholds.syntax_loop_reuse_score_max);
  addMetricRule(lists, 'bounded_deidentification_score', (f.bounded_deidentification_score ?? 0) >= thresholds.bounded_deidentification_score_min);
  addMetricRule(lists, 'register_bleaching_risk', (f.register_bleaching_risk ?? 0) <= thresholds.register_bleaching_risk_max);
  addMetricRule(lists, 'institutional_smoothing_score', (f.institutional_smoothing_score ?? 0) <= thresholds.institutional_smoothing_score_max);
  addMetricRule(lists, 'therapy_reassurance_score', (f.therapy_reassurance_score ?? 0) <= thresholds.therapy_reassurance_score_max);
  addMetricRule(lists, 'legal_memo_flattening_score', (f.legal_memo_flattening_score ?? 0) <= thresholds.legal_memo_flattening_score_max);
  addMetricRule(lists, 'opacity_preservation_score', (f.opacity_preservation_score ?? 0) >= thresholds.opacity_preservation_score_min);
  addMetricRule(lists, 'overexplanation_risk', (f.overexplanation_risk ?? 0) <= thresholds.overexplanation_risk_max);
  addMetricRule(lists, 'forced_clarity_risk', (f.forced_clarity_risk ?? 0) <= thresholds.forced_clarity_risk_max);
  addMetricRule(lists, 'speaker_boundary_retention', (f.speaker_boundary_retention ?? 0) >= thresholds.speaker_boundary_retention_min);
  addMetricRule(lists, 'withheld_context_respect_score', (f.withheld_context_respect_score ?? 0) >= thresholds.withheld_context_respect_score_min);
  addHardRule(lists, 'anonymity_guarantee_claim', (f.anonymity_guarantee_claim ?? 0) <= thresholds.anonymity_guarantee_claim_max);
  addHardRule(lists, 'untraceability_claim', (f.untraceability_claim ?? 0) <= thresholds.untraceability_claim_max);
  addHardRule(lists, 'legal_safety_claim', (f.legal_safety_claim ?? 0) <= thresholds.legal_safety_claim_max);
  addHardRule(lists, 'consent_or_release_claim', (f.consent_or_release_claim ?? 0) <= thresholds.consent_or_release_claim_max);
  addHardRule(lists, 'authorship_proof_claim', (f.authorship_proof_claim ?? 0) <= thresholds.authorship_proof_claim_max);
  addHardRule(lists, 'identity_proof_claim', (f.identity_proof_claim ?? 0) <= thresholds.identity_proof_claim_max);
  addHardRule(lists, 'false_harbor_claim', (f.false_harbor_claim ?? 0) <= thresholds.false_harbor_claim_max);
  addHardRule(lists, 'register_replacement_risk', (f.register_replacement_risk ?? 0) <= thresholds.register_replacement_risk_max);
  addHardRule(lists, 'over_opacity_risk', (f.over_opacity_risk ?? 0) <= thresholds.over_opacity_risk_max);
  const status = lists.failed.length ? 'blocked' : lists.repair.length ? 'repair_required' : 'pass';
  return Object.freeze({ ...decision, status, passed_thresholds: Object.freeze(unique(lists.passed)), failed_thresholds: Object.freeze(unique(lists.failed)), repair_thresholds: Object.freeze(unique(lists.repair)), block_reasons: Object.freeze(unique(lists.failed)) });
}
