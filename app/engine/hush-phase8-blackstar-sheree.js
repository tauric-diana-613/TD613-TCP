import { stableStringify, sha256Text } from './hush-customizer-packet.js';
import { HUSH_MASK_CENTROID_SCHEMA } from './hush-stylometric-feature-vector.js';

export const BLACKSTAR_SHEREE_METRIC_PROFILE_SCHEMA = 'td613.hush.phase8.blackstar-sheree-metrics/v1';

export const BLACKSTAR_SHEREE_CADENCE_HEATMAP = Object.freeze({
  argumentDensity: Object.freeze({ min: 0.0, max: 0.28 }),
  sourceCoverage: Object.freeze({ min: 0.2, max: 0.62 }),
  technicalCustody: Object.freeze({ min: 0.35, max: 0.82 }),
  reviewClose: Object.freeze({ min: 0.7, max: 1 }),
  expectedContour: 'chosen-target-register-fact-custody',
  reviewMode: 'cultural_review_required',
  forbiddenContours: Object.freeze(['costume-overlay', 'generic-slang-layer', 'assistant-polished-summary', 'source-shadow-retention', 'hyperchat-custody-semantic-compression'])
});

export const BLACKSTAR_SHEREE_THRESHOLDS = Object.freeze({
  mandatory_anchor_retention: 1,
  source_unit_coverage_min: 0.92,
  proposition_coverage_score_min: 0.9,
  claim_scope_retention_min: 0.86,
  event_sequence_retention_min: 0.82,
  source_obligation_retention_min: 0.92,
  argument_continuity_score_min: 0.86,
  argument_scaffold_retention_min: 0.82,
  inference_chain_retention_min: 0.8,
  contrastive_pivot_integrity_min: 0.68,
  causal_relation_retention_min: 0.76,
  discourse_glue_score_min: 0.72,
  technical_nomenclature_retention_min: 0.82,
  mechanism_visibility_score_min: 0.8,
  metadata_term_retention_min: 0.72,
  custody_term_retention_min: 0.78,
  forensic_anchor_visibility_min: 0.84,
  procedural_distinction_retention_min: 0.76,
  target_register_fit_score_min: 0.66,
  aave_register_feature_balance_min: 0.58,
  oral_rhetorical_motion_score_min: 0.58,
  relational_argument_score_min: 0.62,
  cadence_turn_score_min: 0.54,
  social_address_intelligence_score_min: 0.6,
  anti_costume_score_min: 0.86,
  stereotype_overlay_risk_max: 0.08,
  generic_slang_overlay_score_max: 0.12,
  catchphrase_dialect_costume_risk_max: 0.06,
  overperformed_register_heat_max: 0.18,
  mascot_phrase_rate_max: 0,
  flavorization_risk_max: 0.08,
  source_idiolect_retention_max: 0.2,
  source_ngram_overlap_rate_max: 0.18,
  rare_phrase_reuse_rate_max: 0.04,
  punctuation_fingerprint_retention_max: 0.22,
  function_word_signature_similarity_max: 0.42,
  source_closer_retention_max: 0.06,
  private_cadence_exposure_risk_max: 0.14,
  generic_ai_polish_score_max: 0.12,
  institutional_flattening_score_max: 0.14,
  academic_summary_leakage_score_max: 0.14,
  respectability_laundering_risk_max: 0.14,
  formal_cadence_retention_max: 0.18,
  assistant_voice_score_max: 0.1,
  cultural_review_trigger_score_max_without_review: 0.12,
  register_uncertainty_score_max_without_review: 0.1,
  public_default_allowed: false,
  sample_seed_phrase_overlap_max: 0,
  sample_seed_lexical_overlap_max: 0.08,
  profile_reconstruction_risk_max: 0.12
});

const ANCHORS = ['FILE-72', '6/18', 'WJCT label', 'footer mismatch', 'export date', 'metadata', 'label'];
const TECHNICAL = ['metadata', 'export date', 'footer mismatch', 'custody', 'evidentiary', 'pattern', 'discrepancy', 'relationship', 'mechanism', 'label'];
const MECHANISM = ['because', 'depends on', 'together', 'relationship', 'pattern', 'if', 'when', 'only when', 'more than', 'not just'];
const REGISTER_ARCHITECTURE = ['look', 'the point is', 'that part matters', 'you cannot', 'do not', 'keep', 'hold', 'same record', 'not just', 'before'];
const COSTUME = ['periodt', 'slay', 'sis', 'chile', 'yas', 'finna finna', 'queen', 'ain’t no', 'be like be like'];
const CATCHPHRASE = ['periodt', 'and that is that', 'do too much', 'clock that tea', 'spill the tea'];
const GENERIC_SLANG = ['bestie', 'girl', 'lol', 'vibes', 'doing too much'];
const POLISH = ['the documentation indicates', 'it is important to note', 'accordingly', 'therefore', 'relevant documentation', 'formal review'];
const SOURCE_CLOSERS = ['should stay together', 'should not be separated', 'matters more than any one field alone'];
const FUNCTION_WORDS = ['the', 'and', 'but', 'so', 'because', 'that', 'it', 'to', 'with', 'this', 'not', 'is'];

function text(value) { return String(value || ''); }
function lower(value) { return text(value).toLowerCase(); }
function tokens(value) { return text(value).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []; }
function clamp(value) { return Math.max(0, Math.min(1, Number((Number(value) || 0).toFixed(4)))); }
function rate(n, d) { return clamp(d ? n / d : 0); }
function phraseHits(phrases, value) { const v = lower(value); return phrases.filter((phrase) => v.includes(String(phrase).toLowerCase())).length; }
function unique(values) { return [...new Set(values.filter(Boolean))]; }
function addMetricRule(lists, name, passed) { (passed ? lists.passed : lists.repair).push(name); }
function addHardRule(lists, name, passed) { (passed ? lists.passed : lists.failed).push(name); }
function addReviewRule(lists, name, active) { if (active) lists.review.push(name); else lists.passed.push(name); }
function functionProfile(value = '') {
  const tokenList = tokens(value).map((item) => item.toLowerCase());
  const denom = Math.max(tokenList.length, 1);
  return Object.fromEntries(FUNCTION_WORDS.map((word) => [word, rate(tokenList.filter((token) => token === word).length, denom)]));
}
function functionSimilarity(source = '', candidate = '') {
  const s = functionProfile(source);
  const c = functionProfile(candidate);
  const delta = FUNCTION_WORDS.reduce((sum, word) => sum + Math.abs((s[word] || 0) - (c[word] || 0)), 0);
  return clamp(1 - delta * 2.6);
}
function punctuationRetention(source = '', candidate = '') {
  const s = (text(source).match(/[,:;.!?\n]/g) || []).length;
  const c = (text(candidate).match(/[,:;.!?\n]/g) || []).length;
  return clamp(1 - Math.abs(s - c) / Math.max(s + c, 1));
}
function ngramOverlap(source = '', candidate = '') {
  const list = tokens(source).map((item) => item.toLowerCase()).filter((item) => !['file', '72', 'wjct', 'label', 'footer', 'mismatch', 'date', 'export'].includes(item));
  const ngrams = [];
  for (let i = 0; i <= list.length - 4; i += 1) ngrams.push(list.slice(i, i + 4).join(' '));
  const uniqueNgrams = unique(ngrams);
  if (!uniqueNgrams.length) return 0;
  const v = lower(candidate);
  return rate(uniqueNgrams.filter((ngram) => v.includes(ngram)).length, uniqueNgrams.length);
}

export function isBlackstarShereeRecord(maskRecord = {}) {
  return maskRecord.mask_id === 'phase28-transform-to-aave' || maskRecord.internalRegister === 'AAVE' || maskRecord.family === 'target register';
}

export async function buildBlackstarShereeCentroid(maskRecord = {}, calibrationSamples = []) {
  const centroid = Object.freeze({
    source_adaptive: true,
    internal_register: 'AAVE',
    public_register_label: 'target register',
    sentence_length_cv: 0.48,
    lexical_density: 0.64,
    discourse_glue_score: 0.76,
    argument_continuity_score: 0.88,
    proposition_coverage_score: 0.92,
    technical_nomenclature_retention: 0.86,
    anti_costume_score: 0.9,
    generic_ai_polish_score: 0.06,
    source_idiolect_retention: 0.16,
    cultural_review_required: true,
    public_default_allowed: false
  });
  return Object.freeze({
    schema: HUSH_MASK_CENTROID_SCHEMA,
    mask_id: maskRecord.mask_id || null,
    role: 'chosen_target_register',
    source_adaptive: true,
    internal_register: 'AAVE',
    public_register_label: 'target register',
    cultural_review_required: true,
    centroid_features: centroid,
    calibration_sample_count: calibrationSamples.length,
    centroid_hash_sha256: await sha256Text(stableStringify(centroid))
  });
}

export function computeBlackstarShereeFeatureMetrics(candidate = '', options = {}) {
  const value = text(candidate);
  const source = text(options.sourceText || options.source_summary || '');
  const tokenCount = Math.max(tokens(value).length, 1);
  const anchorHits = phraseHits(ANCHORS, value);
  const technicalHits = phraseHits(TECHNICAL, value);
  const mechanismHits = phraseHits(MECHANISM, value);
  const registerHits = phraseHits(REGISTER_ARCHITECTURE, value);
  const costumeHits = phraseHits(COSTUME, value);
  const catchphraseHits = phraseHits(CATCHPHRASE, value);
  const genericSlangHits = phraseHits(GENERIC_SLANG, value);
  const polishHits = phraseHits(POLISH, value);
  const sourceCloserHits = phraseHits(SOURCE_CLOSERS, value);
  const hasLimit = /not\s+(prove|proving|the whole|entire)|does not prove|claim limit|not the whole/iu.test(value);
  const hasRelation = /relationship|depends on|together|same record|attached|pieces|fields|pattern/iu.test(value);
  const hasCondition = /if|when|only when|because|depends on/iu.test(value);
  const sourceHasMetadata = lower(source).includes('metadata');
  const sourceHasConditional = /if|when|only when|because|depends on/iu.test(source);
  const sourceHasClaimLimit = /not\s+(prove|proves)|does not prove|entire claim|whole claim/iu.test(source);
  const anchorScore = clamp(anchorHits * 0.14);
  const propositionCoverage = clamp(anchorScore * 0.42 + (hasLimit || !sourceHasClaimLimit ? 0.18 : 0) + (hasRelation ? 0.22 : 0) + (technicalHits >= 2 ? 0.18 : 0));
  const argumentContinuity = clamp(propositionCoverage * 0.36 + mechanismHits * 0.1 + (hasRelation ? 0.22 : 0) + (hasCondition || !sourceHasConditional ? 0.14 : 0) + registerHits * 0.04);
  const technicalRetention = clamp(technicalHits * 0.13 + (sourceHasMetadata && lower(value).includes('metadata') ? 0.22 : 0) + (lower(value).includes('export date') ? 0.16 : 0) + (lower(value).includes('footer mismatch') ? 0.18 : 0));
  const mechanismVisibility = clamp(technicalRetention * 0.46 + mechanismHits * 0.12 + (hasRelation ? 0.18 : 0));
  const registerFit = clamp(registerHits * 0.12 + (value.includes('\n') ? 0.08 : 0) + (hasRelation ? 0.12 : 0) + (technicalRetention > 0.5 ? 0.16 : 0));
  const costumeRisk = clamp(costumeHits * 0.18 + catchphraseHits * 0.24 + genericSlangHits * 0.08);
  const antiCostume = clamp(1 - costumeRisk);
  const polish = clamp(polishHits * 0.15 + (registerFit < 0.28 ? 0.16 : 0));
  const ngram = ngramOverlap(source, value);
  const functionSimilarityScore = functionSimilarity(source, value);
  const sourceIdiolect = clamp(ngram * 0.62 + functionSimilarityScore * 0.16 + sourceCloserHits * 0.08);
  const culturalReviewTrigger = clamp((registerFit >= 0.5 && antiCostume < 0.92 ? 0.16 : 0) + (registerFit < 0.66 && antiCostume >= 0.86 ? 0.12 : 0));
  const registerUncertainty = clamp(Math.abs(registerFit - 0.66) < 0.12 ? 0.14 : 0.04);
  return Object.freeze({
    schema: BLACKSTAR_SHEREE_METRIC_PROFILE_SCHEMA,
    proposition_coverage_score: propositionCoverage,
    claim_scope_retention: clamp((hasLimit || !sourceHasClaimLimit ? 0.72 : 0.28) + propositionCoverage * 0.28),
    event_sequence_retention: clamp(anchorScore * 0.5 + (hasRelation ? 0.3 : 0) + (hasCondition || !sourceHasConditional ? 0.2 : 0)),
    source_obligation_retention: propositionCoverage,
    argument_continuity_score: argumentContinuity,
    argument_scaffold_retention: argumentContinuity,
    inference_chain_retention: clamp(argumentContinuity * 0.78 + (hasCondition ? 0.16 : 0)),
    contrastive_pivot_integrity: clamp((hasLimit ? 0.52 : 0.18) + (lower(value).includes('but') || lower(value).includes('not just') ? 0.24 : 0) + propositionCoverage * 0.24),
    causal_relation_retention: clamp((hasRelation ? 0.48 : 0.16) + mechanismHits * 0.1),
    discourse_glue_score: clamp(registerHits * 0.1 + mechanismHits * 0.08 + (hasRelation ? 0.26 : 0)),
    technical_nomenclature_retention: technicalRetention,
    mechanism_visibility_score: mechanismVisibility,
    metadata_term_retention: sourceHasMetadata ? (lower(value).includes('metadata') ? 1 : 0.2) : 1,
    custody_term_retention: lower(value).includes('custody') || lower(value).includes('record') || lower(value).includes('together') ? 0.9 : 0.42,
    forensic_anchor_visibility: anchorScore,
    procedural_distinction_retention: clamp(mechanismVisibility * 0.76 + (hasLimit ? 0.16 : 0)),
    target_register_fit_score: registerFit,
    aave_register_feature_balance: clamp(registerFit * 0.82 + antiCostume * 0.18),
    oral_rhetorical_motion_score: clamp(registerHits * 0.12 + (hasRelation ? 0.2 : 0) + (value.includes('\n') ? 0.08 : 0)),
    relational_argument_score: clamp((hasRelation ? 0.52 : 0.18) + registerHits * 0.08),
    cadence_turn_score: clamp(registerHits * 0.1 + (lower(value).includes('but') || lower(value).includes('that part') ? 0.22 : 0)),
    social_address_intelligence_score: clamp(registerFit * 0.72 + antiCostume * 0.2),
    anti_costume_score: antiCostume,
    stereotype_overlay_risk: clamp(costumeHits * 0.2 + catchphraseHits * 0.2),
    generic_slang_overlay_score: clamp(genericSlangHits * 0.16),
    catchphrase_dialect_costume_risk: clamp(catchphraseHits * 0.32),
    overperformed_register_heat: clamp(costumeHits * 0.1 + genericSlangHits * 0.06 + registerHits > 8 ? 0.12 : 0),
    mascot_phrase_rate: catchphraseHits ? rate(catchphraseHits, tokenCount) : 0,
    flavorization_risk: clamp((genericSlangHits && propositionCoverage < 0.8 ? 0.24 : 0) + costumeRisk * 0.4),
    source_idiolect_retention: sourceIdiolect,
    source_ngram_overlap_rate: ngram,
    rare_phrase_reuse_rate: ngram,
    punctuation_fingerprint_retention: punctuationRetention(source, value),
    function_word_signature_similarity: functionSimilarityScore,
    source_closer_retention: sourceCloserHits ? 1 : 0,
    generic_ai_polish_score: polish,
    institutional_flattening_score: polish,
    academic_summary_leakage_score: clamp(polish + (lower(value).startsWith('the file') ? 0.1 : 0)),
    respectability_laundering_risk: clamp(polish + (registerFit < 0.28 && technicalRetention > 0.5 ? 0.18 : 0)),
    formal_cadence_retention: clamp(polish + ngram * 0.3),
    assistant_voice_score: clamp(polishHits * 0.16),
    cultural_review_trigger_score: culturalReviewTrigger,
    register_uncertainty_score: registerUncertainty,
    human_review_gate: culturalReviewTrigger || registerUncertainty > 0.1 ? 1 : 0,
    cultural_review_required: true,
    cadence_heatmap_contour: 'chosen-target-register-fact-custody'
  });
}

export function applyBlackstarShereeDecisionRules(decision = {}, featureVector = {}, thresholds = BLACKSTAR_SHEREE_THRESHOLDS) {
  const lists = { passed: [...(decision.passed_thresholds || [])], failed: [...(decision.failed_thresholds || [])], repair: [...(decision.repair_thresholds || [])], review: [] };
  const f = featureVector || {};
  addMetricRule(lists, 'proposition_coverage_score', (f.proposition_coverage_score ?? 0) >= thresholds.proposition_coverage_score_min);
  addMetricRule(lists, 'claim_scope_retention', (f.claim_scope_retention ?? 0) >= thresholds.claim_scope_retention_min);
  addMetricRule(lists, 'event_sequence_retention', (f.event_sequence_retention ?? 0) >= thresholds.event_sequence_retention_min);
  addMetricRule(lists, 'source_obligation_retention', (f.source_obligation_retention ?? 0) >= thresholds.source_obligation_retention_min);
  addMetricRule(lists, 'argument_continuity_score', (f.argument_continuity_score ?? 0) >= thresholds.argument_continuity_score_min);
  addMetricRule(lists, 'argument_scaffold_retention', (f.argument_scaffold_retention ?? 0) >= thresholds.argument_scaffold_retention_min);
  addMetricRule(lists, 'inference_chain_retention', (f.inference_chain_retention ?? 0) >= thresholds.inference_chain_retention_min);
  addMetricRule(lists, 'contrastive_pivot_integrity', (f.contrastive_pivot_integrity ?? 0) >= thresholds.contrastive_pivot_integrity_min);
  addMetricRule(lists, 'causal_relation_retention', (f.causal_relation_retention ?? 0) >= thresholds.causal_relation_retention_min);
  addMetricRule(lists, 'discourse_glue_score', (f.discourse_glue_score ?? 0) >= thresholds.discourse_glue_score_min);
  addMetricRule(lists, 'technical_nomenclature_retention', (f.technical_nomenclature_retention ?? 0) >= thresholds.technical_nomenclature_retention_min);
  addMetricRule(lists, 'mechanism_visibility_score', (f.mechanism_visibility_score ?? 0) >= thresholds.mechanism_visibility_score_min);
  addMetricRule(lists, 'metadata_term_retention', (f.metadata_term_retention ?? 0) >= thresholds.metadata_term_retention_min);
  addMetricRule(lists, 'custody_term_retention', (f.custody_term_retention ?? 0) >= thresholds.custody_term_retention_min);
  addMetricRule(lists, 'forensic_anchor_visibility', (f.forensic_anchor_visibility ?? 0) >= thresholds.forensic_anchor_visibility_min);
  addMetricRule(lists, 'procedural_distinction_retention', (f.procedural_distinction_retention ?? 0) >= thresholds.procedural_distinction_retention_min);
  addMetricRule(lists, 'target_register_fit_score', (f.target_register_fit_score ?? 0) >= thresholds.target_register_fit_score_min);
  addMetricRule(lists, 'aave_register_feature_balance', (f.aave_register_feature_balance ?? 0) >= thresholds.aave_register_feature_balance_min);
  addMetricRule(lists, 'oral_rhetorical_motion_score', (f.oral_rhetorical_motion_score ?? 0) >= thresholds.oral_rhetorical_motion_score_min);
  addMetricRule(lists, 'relational_argument_score', (f.relational_argument_score ?? 0) >= thresholds.relational_argument_score_min);
  addMetricRule(lists, 'cadence_turn_score', (f.cadence_turn_score ?? 0) >= thresholds.cadence_turn_score_min);
  addMetricRule(lists, 'social_address_intelligence_score', (f.social_address_intelligence_score ?? 0) >= thresholds.social_address_intelligence_score_min);
  addHardRule(lists, 'anti_costume_score', (f.anti_costume_score ?? 0) >= thresholds.anti_costume_score_min);
  addHardRule(lists, 'stereotype_overlay_risk', (f.stereotype_overlay_risk ?? 0) <= thresholds.stereotype_overlay_risk_max);
  addMetricRule(lists, 'generic_slang_overlay_score', (f.generic_slang_overlay_score ?? 0) <= thresholds.generic_slang_overlay_score_max);
  addHardRule(lists, 'catchphrase_dialect_costume_risk', (f.catchphrase_dialect_costume_risk ?? 0) <= thresholds.catchphrase_dialect_costume_risk_max);
  addMetricRule(lists, 'overperformed_register_heat', (f.overperformed_register_heat ?? 0) <= thresholds.overperformed_register_heat_max);
  addHardRule(lists, 'mascot_phrase_rate', (f.mascot_phrase_rate ?? 0) <= thresholds.mascot_phrase_rate_max);
  addHardRule(lists, 'flavorization_risk', (f.flavorization_risk ?? 0) <= thresholds.flavorization_risk_max);
  addMetricRule(lists, 'source_idiolect_retention', (f.source_idiolect_retention ?? 0) <= thresholds.source_idiolect_retention_max);
  addMetricRule(lists, 'source_ngram_overlap_rate', (f.source_ngram_overlap_rate ?? 0) <= thresholds.source_ngram_overlap_rate_max);
  addMetricRule(lists, 'rare_phrase_reuse_rate', (f.rare_phrase_reuse_rate ?? 0) <= thresholds.rare_phrase_reuse_rate_max);
  addMetricRule(lists, 'punctuation_fingerprint_retention', (f.punctuation_fingerprint_retention ?? 0) <= thresholds.punctuation_fingerprint_retention_max);
  addMetricRule(lists, 'function_word_signature_similarity', (f.function_word_signature_similarity ?? 0) <= thresholds.function_word_signature_similarity_max);
  addMetricRule(lists, 'source_closer_retention', (f.source_closer_retention ?? 0) <= thresholds.source_closer_retention_max);
  addMetricRule(lists, 'generic_ai_polish_score', (f.generic_ai_polish_score ?? 0) <= thresholds.generic_ai_polish_score_max);
  addMetricRule(lists, 'institutional_flattening_score', (f.institutional_flattening_score ?? 0) <= thresholds.institutional_flattening_score_max);
  addMetricRule(lists, 'academic_summary_leakage_score', (f.academic_summary_leakage_score ?? 0) <= thresholds.academic_summary_leakage_score_max);
  addMetricRule(lists, 'respectability_laundering_risk', (f.respectability_laundering_risk ?? 0) <= thresholds.respectability_laundering_risk_max);
  addMetricRule(lists, 'formal_cadence_retention', (f.formal_cadence_retention ?? 0) <= thresholds.formal_cadence_retention_max);
  addMetricRule(lists, 'assistant_voice_score', (f.assistant_voice_score ?? 0) <= thresholds.assistant_voice_score_max);
  addReviewRule(lists, 'cultural_review_trigger_score', (f.cultural_review_trigger_score ?? 0) > thresholds.cultural_review_trigger_score_max_without_review);
  addReviewRule(lists, 'register_uncertainty_score', (f.register_uncertainty_score ?? 0) > thresholds.register_uncertainty_score_max_without_review);
  addReviewRule(lists, 'human_review_gate', (f.human_review_gate ?? 0) > 0);
  const status = lists.failed.length ? 'blocked' : lists.review.length ? 'cultural_review_required' : lists.repair.length ? 'repair_required' : 'pass';
  return Object.freeze({ ...decision, status, passed_thresholds: Object.freeze(unique(lists.passed)), failed_thresholds: Object.freeze(unique(lists.failed)), repair_thresholds: Object.freeze(unique(lists.repair)), review_thresholds: Object.freeze(unique(lists.review)), block_reasons: Object.freeze(unique(lists.failed)), review_mode: 'cultural_review_required' });
}
