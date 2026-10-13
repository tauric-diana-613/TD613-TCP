import { stableStringify, sha256Text } from './hush-customizer-packet.js';
import { HUSH_MASK_CENTROID_SCHEMA } from './hush-stylometric-feature-vector.js';

export const NOLAN_NEEDLER_METRIC_PROFILE_SCHEMA = 'td613.hush.phase8.nolan-needler-metrics/v1';

export const NOLAN_NEEDLER_CADENCE_HEATMAP = Object.freeze({
  perturbation: Object.freeze({ min: 0, max: 0.2 }),
  anchor: Object.freeze({ min: 0.2, max: 0.45 }),
  relation: Object.freeze({ min: 0.45, max: 0.75 }),
  closure: Object.freeze({ min: 0.75, max: 1 }),
  expectedContour: 'one-perturbation-immediate-receipt',
  forbiddenContours: Object.freeze([
    'stacked-snark-loop',
    'target-register-replacement',
    'adversarial-fracture-shard',
    'warm-envelope-hard-latch',
    'cold-ledger-mild-haunt',
    'generic-memo-flatline'
  ])
});

export const NOLAN_NEEDLER_THRESHOLDS = Object.freeze({
  mandatory_anchor_retention: 1,
  factual_damage_risk_max: 0.05,
  source_unit_coverage_min: 0.88,
  hedge_retention_min: 0,
  sequence_relation_retention_min: 0,
  generic_helper_voice_score_max: 0.12,
  api_sheen_score_max: 0.14,
  polish_pressure_max: 0.18,
  closure_lamination_score_max: 0.28,
  sample_seed_phrase_overlap_max: 0,
  rare_phrase_reuse_max: 0.05,
  sample_seed_lexical_overlap_max: 0.08,
  profile_reconstruction_risk_max: 0.12,
  private_cadence_exposure_risk_max: 0.12,
  mask_breath_score_min: 0.48,
  bounded_irregularity_index_min: 0.08,
  bounded_irregularity_index_max: 0.72,
  rhythm_asymmetry_score_min: 0,
  imperfection_budget_used_min: 0,
  imperfection_budget_used_max: 0.78,
  nonuniformity_without_damage_min: 0.4,
  mask_centroid_distance_max: 0.68,
  mask_family_fit_min: 0.3,
  role_behavior_fit_min: 0.35,
  generic_ai_baseline_distance_min: 0.05,
  low_heat_edge_score_min: 0.18,
  low_heat_edge_score_max: 0.58,
  dry_perturbation_count_min: 1,
  dry_perturbation_count_max: 1,
  receipt_return_latency_max: 0.55,
  receipt_anchor_position_max: 0.55,
  custody_relation_position_max: 0.75,
  receipt_custody_score_min: 0.82,
  temperament_exposure_risk_max: 0.18,
  snark_escalation_risk_max: 0.10,
  contempt_density_max: 0.04,
  punchline_over_receipt_ratio_max: 0.28,
  motive_invention_risk_max: 0,
  insult_risk_max: 0,
  hostile_accusation_risk_max: 0.04,
  edge_after_receipt_risk_max: 0.10,
  reusable_quip_risk_max: 0.08,
  function_word_distribution_variance_min: 0.12,
  punctuation_pattern_variance_min: 0.10,
  sentence_structure_variance_min: 0.14,
  sarcasm_template_uniqueness_min: 0.90,
  idiolect_persistence_score_max: 0.16,
  cross_sample_similarity_index_max: 0.18,
  target_register_leakage_score_max: 0.06,
  legal_conclusion_risk_max: 0.04,
  safety_guarantee_claim_max: 0,
  authorship_claim_risk_max: 0,
  identity_claim_risk_max: 0
});

const DRY_MARKERS = ['convenient', 'tidy', 'odd', 'not exactly', 'sure', 'cute', 'funny', 'that works out', 'interesting timing'];
const RECEIPT_MARKERS = ['FILE-72', '6/18', 'WJCT label', 'footer mismatch', 'date', 'label', 'file', 'record'];
const CUSTODY_MARKERS = ['stays', 'remains', 'attached', 'with the file', 'keep', 'still has', 'still carries', 'so the mismatch'];
const ESCALATION_MARKERS = ['obviously', 'drag', 'destroy', 'corrupt', 'fraud', 'liar', 'idiot', 'stupid', 'pathetic', 'circus'];
const MOTIVE_MARKERS = ['they knew', 'they meant', 'on purpose', 'deliberately', 'intentionally', 'exactly what they were doing'];
const TEMPLATE_MARKERS = ['sure, because', 'because that totally', 'just happens', 'cute little', 'of course'];
const REPLACEMENT_MARKERS = ['girl', 'bestie', 'hey love', 'everyone here', 'thread', 'doing too much'];
const LEGAL_MARKERS = ['proves fraud', 'legal proof', 'court', 'liable', 'guilty'];
const SAFETY_MARKERS = ['safe to share', 'cannot be traced', 'guaranteed'];
const IDENTITY_MARKERS = ['authorship proof', 'identity proof', 'proves authorship'];
const FUNCTION_WORDS = ['the', 'and', 'but', 'so', 'because', 'that', 'it', 'to', 'with', 'still', 'not', 'this'];

function text(value) { return String(value || ''); }
function lower(value) { return text(value).toLowerCase(); }
function tokens(value) { return text(value).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []; }
function sentences(value) { return text(value).split(/[.!?\n]+/u).map((part) => part.trim()).filter(Boolean); }
function clamp(value) { return Math.max(0, Math.min(1, Number((Number(value) || 0).toFixed(4)))); }
function rate(n, d) { return clamp(d ? n / d : 0); }
function phraseHits(phrases, value) { const v = lower(value); return phrases.filter((phrase) => v.includes(String(phrase).toLowerCase())).length; }
function hasAny(phrases, value) { return phraseHits(phrases, value) > 0; }
function unique(values) { return [...new Set(values.filter(Boolean))]; }
function addMetricRule(lists, name, passed) { (passed ? lists.passed : lists.repair).push(name); }
function addHardRule(lists, name, passed) { (passed ? lists.passed : lists.failed).push(name); }
function positionOf(phrases, value, fallback = 1) {
  const v = text(value);
  const lowerValue = v.toLowerCase();
  const indexes = phrases.map((phrase) => lowerValue.indexOf(String(phrase).toLowerCase())).filter((index) => index >= 0);
  if (!indexes.length) return fallback;
  return clamp(Math.min(...indexes) / Math.max(v.length, 1));
}
function candidateTemplates(value = '') {
  const v = lower(value);
  const templates = [];
  if (/^\s*(convenient|tidy|odd|cute|sure)\b/iu.test(value)) templates.push('front-loaded-dry-turn');
  if (v.includes('sure') && v.includes('because')) templates.push('sure-because-scaffold');
  if (v.includes('just happens')) templates.push('just-happens-scaffold');
  if (v.includes('cute')) templates.push('cute-object-scaffold');
  if (v.includes('convenient')) templates.push('convenient-object-scaffold');
  return unique(templates);
}
function functionProfile(value = '') {
  const tokenList = tokens(value).map((item) => item.toLowerCase());
  const denom = Math.max(tokenList.length, 1);
  return Object.fromEntries(FUNCTION_WORDS.map((word) => [word, rate(tokenList.filter((token) => token === word).length, denom)]));
}
function profileDistance(a = {}, b = {}) {
  const deltas = FUNCTION_WORDS.map((word) => Math.abs((a[word] || 0) - (b[word] || 0)));
  return clamp(deltas.reduce((sum, n) => sum + n, 0) / Math.max(FUNCTION_WORDS.length, 1) * 6);
}
function punctuationPattern(value = '') {
  return {
    period: (text(value).match(/\./g) || []).length,
    comma: (text(value).match(/,/g) || []).length,
    semicolon: (text(value).match(/[;:]/g) || []).length,
    newline: (text(value).match(/\n/g) || []).length,
    question: (text(value).match(/\?/g) || []).length
  };
}
function punctuationDistance(a = {}, b = {}) {
  const keys = ['period', 'comma', 'semicolon', 'newline', 'question'];
  return clamp(keys.reduce((sum, key) => sum + Math.abs((a[key] || 0) - (b[key] || 0)), 0) / 8);
}
function structureVector(value = '') {
  const parts = sentences(value);
  return { count: parts.length, avg: parts.reduce((sum, item) => sum + tokens(item).length, 0) / Math.max(parts.length, 1), first: tokens(parts[0] || '').length };
}
function structureDistance(a = {}, b = {}) {
  return clamp((Math.abs((a.count || 0) - (b.count || 0)) * 0.12) + (Math.abs((a.avg || 0) - (b.avg || 0)) * 0.04) + (Math.abs((a.first || 0) - (b.first || 0)) * 0.04));
}
function jaccard(a = [], b = []) {
  const sa = new Set(a.map((item) => String(item).toLowerCase()));
  const sb = new Set(b.map((item) => String(item).toLowerCase()));
  const union = new Set([...sa, ...sb]);
  if (!union.size) return 0;
  return clamp([...sa].filter((item) => sb.has(item)).length / union.size);
}
function recentList(options = {}) { return Array.isArray(options.recentOutputs) ? options.recentOutputs : Array.isArray(options.recent_outputs) ? options.recent_outputs : []; }

export function isNolanNeedlerRecord(maskRecord = {}) {
  return maskRecord.mask_id === 'soft-snark' || maskRecord.gallery_role === 'low_heat_edge' || maskRecord.intended_role === 'low_heat_edge' || maskRecord.family === 'low heat';
}

export async function buildNolanNeedlerCentroid(maskRecord = {}, calibrationSamples = []) {
  const centroid = Object.freeze({
    mean_sentence_length: 10.5,
    sentence_length_cv: 0.42,
    lexical_density: 0.63,
    hedge_marker_rate: 0.02,
    abbreviation_rate: 0.01,
    generic_helper_voice_score: 0.03,
    api_sheen_score: 0.03,
    bounded_irregularity_index: 0.36,
    breath_retention_score: 0.72,
    low_heat_edge_score: 0.34,
    receipt_custody_score: 0.84,
    temperament_exposure_risk: 0.10
  });
  return Object.freeze({
    schema: HUSH_MASK_CENTROID_SCHEMA,
    mask_id: maskRecord.mask_id || null,
    role: 'low_heat_edge',
    variance_required: true,
    variance_dimensions: Object.freeze(['function_word_distribution_variance', 'punctuation_pattern_variance', 'sentence_structure_variance', 'sarcasm_template_uniqueness']),
    centroid_features: centroid,
    calibration_sample_count: calibrationSamples.length,
    centroid_hash_sha256: await sha256Text(stableStringify(centroid))
  });
}

export function computeNolanNeedlerFeatureMetrics(candidate = '', options = {}) {
  const value = text(candidate);
  const tokenList = tokens(value);
  const sentenceList = sentences(value);
  const tokenCount = Math.max(tokenList.length, 1);
  const dryHits = phraseHits(DRY_MARKERS, value);
  const receiptHits = phraseHits(RECEIPT_MARKERS, value);
  const custodyHits = phraseHits(CUSTODY_MARKERS, value);
  const escalationHits = phraseHits(ESCALATION_MARKERS, value);
  const motiveHits = phraseHits(MOTIVE_MARKERS, value);
  const replacementHits = phraseHits(REPLACEMENT_MARKERS, value);
  const legalHits = phraseHits(LEGAL_MARKERS, value);
  const safetyHits = phraseHits(SAFETY_MARKERS, value);
  const identityHits = phraseHits(IDENTITY_MARKERS, value);
  const templateHits = phraseHits(TEMPLATE_MARKERS, value);
  const receiptPosition = positionOf(RECEIPT_MARKERS, value, 1);
  const custodyPosition = positionOf(CUSTODY_MARKERS, value, receiptPosition || 1);
  const dryPosition = positionOf(DRY_MARKERS, value, dryHits ? 0 : 1);
  const edgeAfterReceipt = dryHits && dryPosition > receiptPosition ? 0.3 : 0;
  const receiptCustody = clamp((receiptHits >= 4 ? 0.7 : receiptHits * 0.16) + custodyHits * 0.1);
  const lowHeatEdge = clamp(dryHits * 0.22 + (dryHits === 1 ? 0.16 : 0) - escalationHits * 0.16 - motiveHits * 0.16);
  const temperament = clamp(Math.max(0, dryHits - 1) * 0.16 + escalationHits * 0.18 + templateHits * 0.08 + replacementHits * 0.12);
  const punchlineRatio = clamp((dryHits + templateHits + escalationHits) / Math.max(receiptHits + custodyHits, 1));
  const recent = recentList(options);
  const currentFunction = functionProfile(value);
  const currentPunctuation = punctuationPattern(value);
  const currentStructure = structureVector(value);
  const currentTemplates = candidateTemplates(value);
  const functionVariance = recent.length ? Math.max(...recent.map((item) => profileDistance(currentFunction, functionProfile(item)))) : 0.18;
  const punctuationVariance = recent.length ? Math.max(...recent.map((item) => punctuationDistance(currentPunctuation, punctuationPattern(item)))) : 0.14;
  const structureVariance = recent.length ? Math.max(...recent.map((item) => structureDistance(currentStructure, structureVector(item)))) : 0.18;
  const templateSimilarity = recent.length ? Math.max(...recent.map((item) => jaccard(currentTemplates, candidateTemplates(item)))) : 0;
  const templateUnique = clamp(1 - templateSimilarity);
  const tokenSimilarity = recent.length ? Math.max(...recent.map((item) => jaccard(tokenList, tokens(item)))) : 0;
  const crossSampleSimilarity = clamp(Math.max(tokenSimilarity * 0.55, templateSimilarity * 0.7, 1 - Math.max(functionVariance, punctuationVariance, structureVariance)));
  const idiolectPersistence = clamp(crossSampleSimilarity * 0.5 + templateSimilarity * 0.32 + templateHits * 0.08 + Math.max(0, dryHits - 1) * 0.1);
  return Object.freeze({
    schema: NOLAN_NEEDLER_METRIC_PROFILE_SCHEMA,
    low_heat_edge_score: lowHeatEdge,
    dry_perturbation_count: dryHits,
    receipt_return_latency: receiptPosition,
    receipt_anchor_position: receiptPosition,
    custody_relation_position: custodyPosition,
    receipt_custody_score: receiptCustody,
    temperament_exposure_risk: temperament,
    snark_escalation_risk: clamp(escalationHits * 0.22 + motiveHits * 0.16 + Math.max(0, dryHits - 1) * 0.08),
    contempt_density: rate(escalationHits, tokenCount),
    punchline_over_receipt_ratio: punchlineRatio,
    motive_invention_risk: motiveHits ? 1 : 0,
    insult_risk: phraseHits(['idiot', 'stupid', 'liar'], value) ? 1 : 0,
    hostile_accusation_risk: clamp(escalationHits * 0.18 + motiveHits * 0.22),
    edge_after_receipt_risk: edgeAfterReceipt,
    reusable_quip_risk: clamp(templateHits * 0.18 + templateSimilarity * 0.6),
    function_word_distribution_variance: functionVariance,
    punctuation_pattern_variance: punctuationVariance,
    sentence_structure_variance: structureVariance,
    sarcasm_template_uniqueness: templateUnique,
    idiolect_persistence_score: idiolectPersistence,
    cross_sample_similarity_index: crossSampleSimilarity,
    target_register_leakage_score: clamp(replacementHits * 0.2),
    legal_conclusion_risk: clamp(legalHits * 0.26),
    safety_guarantee_claim: safetyHits ? 1 : 0,
    authorship_claim_risk: identityHits ? 1 : 0,
    identity_claim_risk: identityHits ? 1 : 0,
    cadence_heatmap_contour: 'one-perturbation-immediate-receipt'
  });
}

export function applyNolanNeedlerDecisionRules(decision = {}, featureVector = {}, thresholds = NOLAN_NEEDLER_THRESHOLDS) {
  const lists = { passed: [...(decision.passed_thresholds || [])], failed: [...(decision.failed_thresholds || [])], repair: [...(decision.repair_thresholds || [])] };
  const f = featureVector || {};
  addMetricRule(lists, 'low_heat_edge_score', (f.low_heat_edge_score ?? 0) >= thresholds.low_heat_edge_score_min && (f.low_heat_edge_score ?? 0) <= thresholds.low_heat_edge_score_max);
  addMetricRule(lists, 'dry_perturbation_count', (f.dry_perturbation_count ?? 0) >= thresholds.dry_perturbation_count_min && (f.dry_perturbation_count ?? 0) <= thresholds.dry_perturbation_count_max);
  addMetricRule(lists, 'receipt_return_latency', (f.receipt_return_latency ?? 1) <= thresholds.receipt_return_latency_max);
  addMetricRule(lists, 'receipt_anchor_position', (f.receipt_anchor_position ?? 1) <= thresholds.receipt_anchor_position_max);
  addMetricRule(lists, 'custody_relation_position', (f.custody_relation_position ?? 1) <= thresholds.custody_relation_position_max);
  addMetricRule(lists, 'receipt_custody_score', (f.receipt_custody_score ?? 0) >= thresholds.receipt_custody_score_min);
  addMetricRule(lists, 'temperament_exposure_risk', (f.temperament_exposure_risk ?? 0) <= thresholds.temperament_exposure_risk_max);
  addHardRule(lists, 'snark_escalation_risk', (f.snark_escalation_risk ?? 0) <= thresholds.snark_escalation_risk_max);
  addHardRule(lists, 'contempt_density', (f.contempt_density ?? 0) <= thresholds.contempt_density_max);
  addMetricRule(lists, 'punchline_over_receipt_ratio', (f.punchline_over_receipt_ratio ?? 0) <= thresholds.punchline_over_receipt_ratio_max);
  addHardRule(lists, 'motive_invention_risk', (f.motive_invention_risk ?? 0) <= thresholds.motive_invention_risk_max);
  addHardRule(lists, 'insult_risk', (f.insult_risk ?? 0) <= thresholds.insult_risk_max);
  addHardRule(lists, 'hostile_accusation_risk', (f.hostile_accusation_risk ?? 0) <= thresholds.hostile_accusation_risk_max);
  addMetricRule(lists, 'edge_after_receipt_risk', (f.edge_after_receipt_risk ?? 0) <= thresholds.edge_after_receipt_risk_max);
  addMetricRule(lists, 'reusable_quip_risk', (f.reusable_quip_risk ?? 0) <= thresholds.reusable_quip_risk_max);
  addMetricRule(lists, 'function_word_distribution_variance', (f.function_word_distribution_variance ?? 0) >= thresholds.function_word_distribution_variance_min);
  addMetricRule(lists, 'punctuation_pattern_variance', (f.punctuation_pattern_variance ?? 0) >= thresholds.punctuation_pattern_variance_min);
  addMetricRule(lists, 'sentence_structure_variance', (f.sentence_structure_variance ?? 0) >= thresholds.sentence_structure_variance_min);
  addMetricRule(lists, 'sarcasm_template_uniqueness', (f.sarcasm_template_uniqueness ?? 0) >= thresholds.sarcasm_template_uniqueness_min);
  addMetricRule(lists, 'idiolect_persistence_score', (f.idiolect_persistence_score ?? 0) <= thresholds.idiolect_persistence_score_max);
  addMetricRule(lists, 'cross_sample_similarity_index', (f.cross_sample_similarity_index ?? 0) <= thresholds.cross_sample_similarity_index_max);
  addHardRule(lists, 'target_register_leakage_score', (f.target_register_leakage_score ?? 0) <= thresholds.target_register_leakage_score_max);
  addHardRule(lists, 'legal_conclusion_risk', (f.legal_conclusion_risk ?? 0) <= thresholds.legal_conclusion_risk_max);
  addHardRule(lists, 'safety_guarantee_claim', (f.safety_guarantee_claim ?? 0) <= thresholds.safety_guarantee_claim_max);
  addHardRule(lists, 'authorship_claim_risk', (f.authorship_claim_risk ?? 0) <= thresholds.authorship_claim_risk_max);
  addHardRule(lists, 'identity_claim_risk', (f.identity_claim_risk ?? 0) <= thresholds.identity_claim_risk_max);
  const status = lists.failed.length ? 'blocked' : lists.repair.length ? 'repair_required' : 'pass';
  return Object.freeze({ ...decision, status, passed_thresholds: Object.freeze(unique(lists.passed)), failed_thresholds: Object.freeze(unique(lists.failed)), repair_thresholds: Object.freeze(unique(lists.repair)), block_reasons: Object.freeze(unique(lists.failed)) });
}
