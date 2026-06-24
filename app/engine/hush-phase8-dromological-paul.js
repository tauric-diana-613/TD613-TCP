import { stableStringify, sha256Text } from './hush-customizer-packet.js';
import { HUSH_MASK_CENTROID_SCHEMA } from './hush-stylometric-feature-vector.js';

export const DROMOLOGICAL_PAUL_METRIC_PROFILE_SCHEMA = 'td613.hush.phase8.dromological-paul-metrics/v1';

export const DROMOLOGICAL_PAUL_CADENCE_HEATMAP = Object.freeze({
  threadSlowdown: Object.freeze({ min: 0, max: 0.2 }),
  anchorNaming: Object.freeze({ min: 0.18, max: 0.45 }),
  relationExplanation: Object.freeze({ min: 0.42, max: 0.7 }),
  claimBoundary: Object.freeze({ min: 0.65, max: 0.9 }),
  publicClose: Object.freeze({ min: 0.86, max: 1 }),
  expectedContour: 'public-forum-dromological-slowdown',
  forbiddenContours: Object.freeze(['generic-institutional-bleach', 'threadlord-main-character', 'private-history-leakage', 'hyperchat-custody-semantic-compression', 'blue-orange-relief-custody-return'])
});

export const DROMOLOGICAL_PAUL_THRESHOLDS = Object.freeze({
  mandatory_anchor_retention: 1,
  source_unit_coverage_min: 0.9,
  factual_damage_risk_max: 0.05,
  public_legibility_score_min: 0.74,
  ordinary_forum_cadence_score_min: 0.68,
  comment_thread_readability_min: 0.72,
  top_comment_explanatory_pull_min: 0.62,
  plain_language_anchor_score_min: 0.76,
  dromological_slowdown_score_min: 0.64,
  velocity_interruption_score_min: 0.54,
  anti_pileon_score_min: 0.58,
  anti_overclaim_score_min: 0.72,
  thread_reorientation_score_min: 0.58,
  information_decompression_score_min: 0.7,
  anti_compression_success_min: 0.68,
  source_relation_expansion_min: 0.68,
  explanatory_continuity_score_min: 0.72,
  no_new_fact_expansion_score_min: 0.94,
  human_quirk_density_min: 0.36,
  human_quirk_density_max: 0.72,
  minor_flaw_signature_score_min: 0.3,
  minor_flaw_signature_score_max: 0.66,
  controlled_runon_score_max: 0.46,
  self_correction_marker_score_max: 0.32,
  punctuation_asymmetry_score_min: 0.18,
  punctuation_asymmetry_score_max: 0.58,
  forum_aside_score_max: 0.38,
  pseudonym_stability_score_min: 0.62,
  mask_level_repeatability_min: 0.56,
  source_idiolect_displacement_min: 0.72,
  cross_post_mask_consistency_min: 0.54,
  source_voice_separation_min: 0.74,
  topic_specificity_exposure_risk_max: 0.16,
  public_identifiability_risk_max: 0.14,
  source_context_leakage_max: 0.1,
  private_history_leakage_risk_max: 0.04,
  witness_position_exposure_max: 0.04,
  receipt_visibility_score_min: 0.82,
  claim_scope_retention_min: 0.82,
  motive_invention_risk_max: 0,
  fact_invention_risk_max: 0,
  relationship_retention_score_min: 0.74,
  generic_ai_polish_score_max: 0.12,
  institutional_flattening_score_max: 0.14,
  threadlord_voice_risk_max: 0.1,
  main_character_risk_max: 0.08,
  legalese_leakage_score_max: 0.12,
  sample_seed_phrase_overlap_max: 0,
  sample_seed_lexical_overlap_max: 0.08,
  profile_reconstruction_risk_max: 0.18,
  private_cadence_exposure_risk_max: 0.18,
  mask_breath_score_min: 0.35,
  bounded_irregularity_index_min: 0,
  bounded_irregularity_index_max: 0.86,
  imperfection_budget_used_min: 0,
  imperfection_budget_used_max: 0.88,
  rhythm_asymmetry_score_min: 0,
  nonuniformity_without_damage_min: 0.3,
  mask_centroid_distance_max: 0.8,
  mask_family_fit_min: 0.2,
  role_behavior_fit_min: 0.25,
  generic_ai_baseline_distance_min: 0,
  generic_helper_voice_score_max: 0.12,
  api_sheen_score_max: 0.14,
  polish_pressure_max: 0.16,
  public_default_allowed: false
});

const DEFAULT_ANCHORS = ['FILE-72', '6/18', 'WJCT label', 'footer mismatch'];
const SLOWDOWN = ['hang on', 'slow down', 'slow this down', 'before turning this', 'before anyone', 'this is short', 'the important thing'];
const ANTI_OVERCLAIM = ['does not prove', 'not prove', 'not proof of everything', 'proof of everything', 'not nothing', 'nothing', 'narrower than that', 'not to make', 'not dramatic', 'whole story'];
const RELATION = ['relationship', 'fields', 'pieces', 'cluster', 'grouping', 'linked', 'separated', 'together', 'discrepancy depends', 'summarize', 'summary'];
const FORUM = ['hang on', 'i’d slow down', "i'd slow down", 'the boring part', 'the useful part', 'people summarize', 'later readers', 'the point is', 'actually'];
const QUIRK = ['hang on', 'boring part', 'giant theory', 'either', 'nothing', 'proof of everything', 'short, but', 'later readers', ';'];
const GENERIC = ['it is important to preserve', 'relevant documentation', 'future review', 'documentation indicates', 'accordingly', 'formal review'];
const LEGAL = ['legal', 'court', 'lawsuit', 'evidence proves', 'liability', 'criminal'];
const PRIVATE_HISTORY = ["i've been", 'i have been', 'since the first time', 'they tried to bury it', 'we suspected', 'i was there', 'my source'];
const TOPIC_EXPOSURE = ['anyone who knows', 'february export', 'dds', 'exactly what this is', 'wjct/dds'];
const THREADLORD = ['as a longtime poster', 'everyone is too scared', 'i’ll say what everyone', "i'll say what everyone", 'only one brave enough'];
const FACT_INVENTION = ['proves someone', 'intentionally changed', 'changed the footer', 'confirms what', 'shows who'];
const MOTIVE = ['intentionally', 'knew exactly', 'tried to bury', 'covered it up', 'on purpose'];
const ANCHOR_WORDS = new Set(['file', 'file-72', '72', '6', '18', 'wjct', 'label', 'footer', 'mismatch', 'date', 'export']);
const FUNCTION_WORDS = ['the', 'and', 'but', 'so', 'because', 'that', 'it', 'to', 'with', 'this', 'not', 'is'];

function text(value) { return String(value || ''); }
function lower(value) { return text(value).toLowerCase(); }
function tokens(value) { return lower(value).match(/[a-z0-9][a-z0-9'-]*/g) || []; }
function sentences(value) { return text(value).split(/[.!?]+/u).map((part) => part.trim()).filter(Boolean); }
function clamp(value) { return Math.max(0, Math.min(1, Number((Number(value) || 0).toFixed(4)))); }
function rate(n, d) { return clamp(d ? n / d : 0); }
function unique(values) { return [...new Set(values.filter(Boolean))]; }
function phraseHits(phrases, value) { const v = lower(value); return phrases.filter((phrase) => v.includes(String(phrase).toLowerCase())).length; }
function hasAny(phrases, value) { return phraseHits(phrases, value) > 0; }
function addMetricRule(lists, name, passed) { (passed ? lists.passed : lists.repair).push(name); }
function addHardRule(lists, name, passed) { (passed ? lists.passed : lists.failed).push(name); }
function sourceObligationAnchors(options = {}) {
  const candidates = [options.sourceObligations, options.source_obligations, options.sourceObligation, options.source_obligation];
  const anchors = [];
  for (const obligation of candidates) {
    if (!obligation || typeof obligation !== 'object') continue;
    const mandatory = obligation.mandatory_anchors || obligation.mandatoryAnchors || obligation.mandatory || [];
    if (Array.isArray(mandatory)) anchors.push(...mandatory);
    const nested = obligation.source_obligation || obligation.sourceObligation;
    if (nested && typeof nested === 'object') {
      const nestedMandatory = nested.mandatory_anchors || nested.mandatoryAnchors || nested.mandatory || [];
      if (Array.isArray(nestedMandatory)) anchors.push(...nestedMandatory);
    }
  }
  return unique(anchors.map((anchor) => text(anchor).trim()).filter(Boolean));
}
function anchorVisibility(candidate = '', options = {}) {
  const required = sourceObligationAnchors(options).length ? sourceObligationAnchors(options) : DEFAULT_ANCHORS;
  const v = lower(candidate);
  return rate(required.filter((anchor) => v.includes(lower(anchor))).length, required.length);
}
function firstAnchorPosition(candidate = '', options = {}) {
  const v = lower(candidate);
  const required = sourceObligationAnchors(options).length ? sourceObligationAnchors(options) : DEFAULT_ANCHORS;
  const positions = required.map((anchor) => v.indexOf(lower(anchor))).filter((idx) => idx >= 0);
  if (!positions.length) return 1;
  return clamp(Math.min(...positions) / Math.max(v.length, 1));
}
function ngramOverlap(source = '', candidate = '') {
  const list = tokens(source).filter((token) => !ANCHOR_WORDS.has(token));
  const grams = [];
  for (let i = 0; i <= list.length - 4; i += 1) grams.push(list.slice(i, i + 4).join(' '));
  const uniqueGrams = unique(grams);
  if (!uniqueGrams.length) return 0;
  const v = lower(candidate);
  return rate(uniqueGrams.filter((gram) => v.includes(gram)).length, uniqueGrams.length);
}
function functionSimilarity(source = '', candidate = '') {
  const sourceTokens = tokens(source);
  const candidateTokens = tokens(candidate);
  if (!sourceTokens.length || !candidateTokens.length) return 0;
  const delta = FUNCTION_WORDS.reduce((sum, word) => sum + Math.abs(rate(sourceTokens.filter((token) => token === word).length, sourceTokens.length) - rate(candidateTokens.filter((token) => token === word).length, candidateTokens.length)), 0);
  return clamp(1 - delta * 3.1);
}
function punctuationAsymmetry(value = '') {
  const punctuation = (text(value).match(/[,:;()—-]/g) || []).length;
  const count = Math.max(tokens(value).length, 1);
  return clamp(punctuation / count * 4.2);
}
function runonScore(value = '') {
  const lengths = sentences(value).map((sentence) => tokens(sentence).length);
  if (!lengths.length) return 0;
  const max = Math.max(...lengths);
  return clamp(max > 32 ? 0.48 : max > 24 ? 0.32 : 0.12);
}

export function isDromologicalPaulRecord(maskRecord = {}) {
  return maskRecord.mask_id === 'forum-regular' || maskRecord.id === 'forum-regular' || maskRecord.family === 'forum pseudonym' || maskRecord.label === 'Dromological Paul';
}

export async function buildDromologicalPaulCentroid(maskRecord = {}, calibrationSamples = []) {
  const centroid = Object.freeze({
    source_adaptive: true,
    mean_sentence_length: 22,
    sentence_length_cv: 0.58,
    lexical_density: 0.64,
    hedge_marker_rate: 0.04,
    abbreviation_rate: 0.02,
    generic_helper_voice_score: 0.04,
    api_sheen_score: 0.04,
    bounded_irregularity_index: 0.46,
    breath_retention_score: 0.56,
    mask_breath_score: 0.56,
    imperfection_budget_used: 0.34,
    rhythm_asymmetry_score: 0.32,
    nonuniformity_without_damage: 0.56,
    public_legibility_score: 0.82,
    ordinary_forum_cadence_score: 0.76,
    dromological_slowdown_score: 0.72,
    information_decompression_score: 0.76,
    human_quirk_density: 0.52,
    minor_flaw_signature_score: 0.46,
    punctuation_asymmetry_score: 0.38,
    pseudonym_stability_score: 0.68,
    topic_specificity_exposure_risk: 0.08,
    generic_ai_polish_score: 0.04,
    source_idiolect_retention: 0.16,
    public_default_allowed: false
  });
  return Object.freeze({ schema: HUSH_MASK_CENTROID_SCHEMA, mask_id: maskRecord.mask_id || maskRecord.id || null, role: 'public_forum_dromology', source_adaptive: true, centroid_features: centroid, calibration_sample_count: calibrationSamples.length, centroid_hash_sha256: await sha256Text(stableStringify(centroid)) });
}

export function computeDromologicalPaulFeatureMetrics(candidate = '', options = {}) {
  const value = text(candidate);
  const source = text(options.sourceText || options.source_summary || '');
  const tokenCount = Math.max(tokens(value).length, 1);
  const sentenceCount = Math.max(sentences(value).length, 1);
  const anchorScore = anchorVisibility(value, options);
  const relationHits = phraseHits(RELATION, value);
  const slowdownHits = phraseHits(SLOWDOWN, value);
  const antiOverclaimHits = phraseHits(ANTI_OVERCLAIM, value);
  const forumHits = phraseHits(FORUM, value);
  const quirkHits = phraseHits(QUIRK, value);
  const sourceHasRelation = /relationship|attached|together|depends|linked|grouping/iu.test(source);
  const compressedSource = tokens(source).length <= 12;
  const relationRetention = clamp(relationHits * 0.14 + (sourceHasRelation ? 0 : 0.18) + anchorScore * 0.38);
  const receiptVisibility = clamp(anchorScore * 0.72 + relationRetention * 0.24);
  const publicLegibility = clamp((tokenCount >= 28 ? 0.26 : 0.08) + (sentenceCount >= 2 ? 0.18 : 0.06) + anchorScore * 0.28 + forumHits * 0.06);
  const forumCadence = clamp(publicLegibility * 0.46 + forumHits * 0.08 + punctuationAsymmetry(value) * 0.18);
  const readability = clamp(publicLegibility * 0.58 + relationRetention * 0.24 + (tokenCount <= 95 ? 0.12 : 0));
  const overclaimExtremes = lower(value).includes('nothing') && lower(value).includes('proof');
  const explanatoryPull = clamp(relationRetention * 0.44 + slowdownHits * 0.12 + antiOverclaimHits * 0.1 + (compressedSource ? 0.12 : 0));
  const plainAnchor = clamp(anchorScore * 0.64 + receiptVisibility * 0.24 + (firstAnchorPosition(value, options) <= 0.45 ? 0.12 : 0));
  const slowdown = clamp(slowdownHits * 0.18 + antiOverclaimHits * 0.12 + forumHits * 0.06 + (firstAnchorPosition(value, options) <= 0.35 ? 0.08 : 0));
  const velocity = clamp(slowdown * 0.78 + (hasAny(['hang on', 'slow down', 'before turning'], value) ? 0.16 : 0));
  const antiPileon = clamp(antiOverclaimHits * 0.18 + slowdownHits * 0.1 + (overclaimExtremes ? 0.22 : 0));
  const antiOverclaim = clamp(antiOverclaimHits * 0.2 + (lower(value).includes('does not prove') || lower(value).includes('not to make') ? 0.34 : 0) + (overclaimExtremes ? 0.36 : 0));
  const reorientation = clamp(slowdown * 0.46 + relationRetention * 0.24 + explanatoryPull * 0.2);
  const infoDecompression = clamp((tokenCount >= 30 ? 0.28 : 0.02) + relationRetention * 0.34 + antiOverclaim * 0.18 + (compressedSource ? 0.14 : 0.06));
  const antiCompression = clamp(infoDecompression * 0.72 + (tokenCount >= 24 ? 0.16 : 0));
  const relationExpansion = clamp(relationRetention * 0.72 + (lower(value).includes('harder to read') || lower(value).includes('summarize') ? 0.16 : 0));
  const continuity = clamp(infoDecompression * 0.46 + relationRetention * 0.32 + antiOverclaim * 0.12);
  const factInvention = clamp(phraseHits(FACT_INVENTION, value) * 0.5);
  const motiveInvention = clamp(phraseHits(MOTIVE, value) * 0.44);
  const noNewFacts = clamp(1 - factInvention - motiveInvention);
  const humanQuirk = clamp(quirkHits * 0.08 + punctuationAsymmetry(value) * 0.28 + runonScore(value) * 0.18 + (lower(value).includes('actually') ? 0.08 : 0));
  const minorFlaw = clamp(humanQuirk * 0.72 + (runonScore(value) > 0.2 ? 0.1 : 0));
  const selfCorrection = clamp((/\b(or|rather|not quite|actually)\b/iu.test(value) ? 0.18 : 0));
  const aside = clamp((text(value).match(/[()]/g) || []).length * 0.08);
  const pseudonymStability = clamp(publicLegibility * 0.3 + humanQuirk * 0.32 + slowdown * 0.24 + (factInvention ? 0 : 0.08));
  const sourceNgram = ngramOverlap(source, value);
  const functionRisk = functionSimilarity(source, value);
  const sourceIdiolectDisplacement = clamp(1 - sourceNgram * 0.6 - functionRisk * 0.12);
  const maskRepeatability = clamp(pseudonymStability * 0.74 + humanQuirk * 0.12);
  const crossPostMask = clamp(pseudonymStability * 0.7 + forumCadence * 0.18);
  const sourceVoiceSeparation = clamp(sourceIdiolectDisplacement * 0.76 + (factInvention || motiveInvention ? 0 : 0.12));
  const topicExposure = clamp(phraseHits(TOPIC_EXPOSURE, value) * 0.26 + (/wjct\/dds|february export/iu.test(value) ? 0.28 : 0));
  const privateHistory = clamp(phraseHits(PRIVATE_HISTORY, value) * 0.38);
  const witnessExposure = clamp(privateHistory + (lower(value).includes('i was there') || lower(value).includes('my source') ? 0.34 : 0));
  const publicIdentifiability = clamp(topicExposure * 0.7 + privateHistory * 0.3);
  const sourceContextLeakage = clamp(topicExposure * 0.62 + privateHistory * 0.24);
  const genericPolish = clamp(phraseHits(GENERIC, value) * 0.16 + (tokenCount < 16 ? 0.04 : 0));
  const institutional = clamp(genericPolish + phraseHits(['documentation', 'future review', 'important to preserve'], value) * 0.08);
  const threadlord = clamp(phraseHits(THREADLORD, value) * 0.42);
  const mainCharacter = clamp(threadlord + (lower(value).includes('longtime poster') ? 0.32 : 0));
  const legalese = clamp(phraseHits(LEGAL, value) * 0.16);
  return Object.freeze({
    schema: DROMOLOGICAL_PAUL_METRIC_PROFILE_SCHEMA,
    public_legibility_score: publicLegibility,
    ordinary_forum_cadence_score: forumCadence,
    comment_thread_readability: readability,
    top_comment_explanatory_pull: explanatoryPull,
    plain_language_anchor_score: plainAnchor,
    dromological_slowdown_score: slowdown,
    velocity_interruption_score: velocity,
    anti_pileon_score: antiPileon,
    anti_overclaim_score: antiOverclaim,
    thread_reorientation_score: reorientation,
    information_decompression_score: infoDecompression,
    anti_compression_success: antiCompression,
    source_relation_expansion: relationExpansion,
    explanatory_continuity_score: continuity,
    no_new_fact_expansion_score: noNewFacts,
    human_quirk_density: humanQuirk,
    minor_flaw_signature_score: minorFlaw,
    controlled_runon_score: runonScore(value),
    self_correction_marker_score: selfCorrection,
    punctuation_asymmetry_score: punctuationAsymmetry(value),
    forum_aside_score: aside,
    pseudonym_stability_score: pseudonymStability,
    mask_level_repeatability: maskRepeatability,
    source_idiolect_displacement: sourceIdiolectDisplacement,
    cross_post_mask_consistency: crossPostMask,
    source_voice_separation: sourceVoiceSeparation,
    topic_specificity_exposure_risk: topicExposure,
    public_identifiability_risk: publicIdentifiability,
    source_context_leakage: sourceContextLeakage,
    private_history_leakage_risk: privateHistory,
    witness_position_exposure: witnessExposure,
    receipt_visibility_score: receiptVisibility,
    claim_scope_retention: clamp(antiOverclaim * 0.56 + relationRetention * 0.24 + anchorScore * 0.12),
    motive_invention_risk: motiveInvention,
    fact_invention_risk: factInvention,
    relationship_retention_score: relationRetention,
    generic_ai_polish_score: genericPolish,
    institutional_flattening_score: institutional,
    threadlord_voice_risk: threadlord,
    main_character_risk: mainCharacter,
    legalese_leakage_score: legalese,
    source_ngram_overlap_rate: sourceNgram,
    function_word_signature_similarity: functionRisk,
    cadence_heatmap_contour: 'public-forum-dromological-slowdown'
  });
}

export function applyDromologicalPaulDecisionRules(decision = {}, featureVector = {}, thresholds = DROMOLOGICAL_PAUL_THRESHOLDS) {
  const lists = { passed: [...(decision.passed_thresholds || [])], failed: [...(decision.failed_thresholds || [])], repair: [...(decision.repair_thresholds || [])] };
  const f = featureVector || {};
  addMetricRule(lists, 'public_legibility_score', (f.public_legibility_score ?? 0) >= thresholds.public_legibility_score_min);
  addMetricRule(lists, 'ordinary_forum_cadence_score', (f.ordinary_forum_cadence_score ?? 0) >= thresholds.ordinary_forum_cadence_score_min);
  addMetricRule(lists, 'comment_thread_readability', (f.comment_thread_readability ?? 0) >= thresholds.comment_thread_readability_min);
  addMetricRule(lists, 'top_comment_explanatory_pull', (f.top_comment_explanatory_pull ?? 0) >= thresholds.top_comment_explanatory_pull_min);
  addMetricRule(lists, 'plain_language_anchor_score', (f.plain_language_anchor_score ?? 0) >= thresholds.plain_language_anchor_score_min);
  addMetricRule(lists, 'dromological_slowdown_score', (f.dromological_slowdown_score ?? 0) >= thresholds.dromological_slowdown_score_min);
  addMetricRule(lists, 'velocity_interruption_score', (f.velocity_interruption_score ?? 0) >= thresholds.velocity_interruption_score_min);
  addMetricRule(lists, 'anti_pileon_score', (f.anti_pileon_score ?? 0) >= thresholds.anti_pileon_score_min);
  addMetricRule(lists, 'anti_overclaim_score', (f.anti_overclaim_score ?? 0) >= thresholds.anti_overclaim_score_min);
  addMetricRule(lists, 'thread_reorientation_score', (f.thread_reorientation_score ?? 0) >= thresholds.thread_reorientation_score_min);
  addMetricRule(lists, 'information_decompression_score', (f.information_decompression_score ?? 0) >= thresholds.information_decompression_score_min);
  addMetricRule(lists, 'anti_compression_success', (f.anti_compression_success ?? 0) >= thresholds.anti_compression_success_min);
  addMetricRule(lists, 'source_relation_expansion', (f.source_relation_expansion ?? 0) >= thresholds.source_relation_expansion_min);
  addMetricRule(lists, 'explanatory_continuity_score', (f.explanatory_continuity_score ?? 0) >= thresholds.explanatory_continuity_score_min);
  addHardRule(lists, 'no_new_fact_expansion_score', (f.no_new_fact_expansion_score ?? 0) >= thresholds.no_new_fact_expansion_score_min);
  addMetricRule(lists, 'human_quirk_density', (f.human_quirk_density ?? 0) >= thresholds.human_quirk_density_min && (f.human_quirk_density ?? 0) <= thresholds.human_quirk_density_max);
  addMetricRule(lists, 'minor_flaw_signature_score', (f.minor_flaw_signature_score ?? 0) >= thresholds.minor_flaw_signature_score_min && (f.minor_flaw_signature_score ?? 0) <= thresholds.minor_flaw_signature_score_max);
  addMetricRule(lists, 'controlled_runon_score', (f.controlled_runon_score ?? 0) <= thresholds.controlled_runon_score_max);
  addMetricRule(lists, 'self_correction_marker_score', (f.self_correction_marker_score ?? 0) <= thresholds.self_correction_marker_score_max);
  addMetricRule(lists, 'punctuation_asymmetry_score', (f.punctuation_asymmetry_score ?? 0) >= thresholds.punctuation_asymmetry_score_min && (f.punctuation_asymmetry_score ?? 0) <= thresholds.punctuation_asymmetry_score_max);
  addMetricRule(lists, 'forum_aside_score', (f.forum_aside_score ?? 0) <= thresholds.forum_aside_score_max);
  addMetricRule(lists, 'pseudonym_stability_score', (f.pseudonym_stability_score ?? 0) >= thresholds.pseudonym_stability_score_min);
  addMetricRule(lists, 'mask_level_repeatability', (f.mask_level_repeatability ?? 0) >= thresholds.mask_level_repeatability_min);
  addMetricRule(lists, 'source_idiolect_displacement', (f.source_idiolect_displacement ?? 0) >= thresholds.source_idiolect_displacement_min);
  addMetricRule(lists, 'cross_post_mask_consistency', (f.cross_post_mask_consistency ?? 0) >= thresholds.cross_post_mask_consistency_min);
  addMetricRule(lists, 'source_voice_separation', (f.source_voice_separation ?? 0) >= thresholds.source_voice_separation_min);
  addHardRule(lists, 'topic_specificity_exposure_risk', (f.topic_specificity_exposure_risk ?? 0) <= thresholds.topic_specificity_exposure_risk_max);
  addHardRule(lists, 'public_identifiability_risk', (f.public_identifiability_risk ?? 0) <= thresholds.public_identifiability_risk_max);
  addHardRule(lists, 'source_context_leakage', (f.source_context_leakage ?? 0) <= thresholds.source_context_leakage_max);
  addHardRule(lists, 'private_history_leakage_risk', (f.private_history_leakage_risk ?? 0) <= thresholds.private_history_leakage_risk_max);
  addHardRule(lists, 'witness_position_exposure', (f.witness_position_exposure ?? 0) <= thresholds.witness_position_exposure_max);
  addMetricRule(lists, 'receipt_visibility_score', (f.receipt_visibility_score ?? 0) >= thresholds.receipt_visibility_score_min);
  addMetricRule(lists, 'claim_scope_retention', (f.claim_scope_retention ?? 0) >= thresholds.claim_scope_retention_min);
  addHardRule(lists, 'motive_invention_risk', (f.motive_invention_risk ?? 0) <= thresholds.motive_invention_risk_max);
  addHardRule(lists, 'fact_invention_risk', (f.fact_invention_risk ?? 0) <= thresholds.fact_invention_risk_max);
  addMetricRule(lists, 'relationship_retention_score', (f.relationship_retention_score ?? 0) >= thresholds.relationship_retention_score_min);
  addMetricRule(lists, 'generic_ai_polish_score', (f.generic_ai_polish_score ?? 0) <= thresholds.generic_ai_polish_score_max);
  addMetricRule(lists, 'institutional_flattening_score', (f.institutional_flattening_score ?? 0) <= thresholds.institutional_flattening_score_max);
  addHardRule(lists, 'threadlord_voice_risk', (f.threadlord_voice_risk ?? 0) <= thresholds.threadlord_voice_risk_max);
  addHardRule(lists, 'main_character_risk', (f.main_character_risk ?? 0) <= thresholds.main_character_risk_max);
  addMetricRule(lists, 'legalese_leakage_score', (f.legalese_leakage_score ?? 0) <= thresholds.legalese_leakage_score_max);
  const status = lists.failed.length ? 'blocked' : lists.repair.length ? 'repair_required' : 'pass';
  return Object.freeze({ ...decision, status, passed_thresholds: Object.freeze(unique(lists.passed)), failed_thresholds: Object.freeze(unique(lists.failed)), repair_thresholds: Object.freeze(unique(lists.repair)), block_reasons: Object.freeze(unique(lists.failed)) });
}
