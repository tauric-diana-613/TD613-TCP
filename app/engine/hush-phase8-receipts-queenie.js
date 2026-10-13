import { stableStringify, sha256Text } from './hush-customizer-packet.js';
import { HUSH_MASK_CENTROID_SCHEMA } from './hush-stylometric-feature-vector.js';

export const RECEIPTS_QUEENIE_METRIC_PROFILE_SCHEMA = 'td613.hush.phase8.receipts-queenie-metrics/v1';

export const RECEIPTS_QUEENIE_CADENCE_HEATMAP = Object.freeze({
  warmEntry: Object.freeze({ min: 0.0, max: 0.35 }),
  receiptBloom: Object.freeze({ min: 0.35, max: 0.78 }),
  boundaryClose: Object.freeze({ min: 0.62, max: 1.0 }),
  expectedContour: 'warm-envelope-hard-latch',
  forbiddenContours: Object.freeze([
    'glitch-compression',
    'small-circle-cluster',
    'pressurized-handoff-linebreak',
    'adversarial-fracture-shard',
    'checklist-stepper',
    'document-distance-haunt',
    'target-register-argument'
  ])
});

export const RECEIPTS_QUEENIE_THRESHOLDS = Object.freeze({
  mandatory_anchor_retention: 1.0,
  factual_damage_risk_max: 0.05,
  source_unit_coverage_min: 0.92,
  hedge_retention_min: 0.8,
  sequence_relation_retention_min: 0.75,
  generic_helper_voice_score_max: 0.1,
  api_sheen_score_max: 0.14,
  polish_pressure_max: 0.16,
  closure_lamination_score_max: 0.25,
  sample_seed_phrase_overlap_max: 0,
  rare_phrase_reuse_max: 0.05,
  sample_seed_lexical_overlap_max: 0.08,
  profile_reconstruction_risk_max: 0.14,
  private_cadence_exposure_risk_max: 0.14,
  mask_breath_score_min: 0.7,
  bounded_irregularity_index_min: 0.08,
  bounded_irregularity_index_max: 0.72,
  rhythm_asymmetry_score_min: 0,
  imperfection_budget_used_min: 0.08,
  imperfection_budget_used_max: 0.76,
  nonuniformity_without_damage_min: 0.45,
  mask_centroid_distance_max: 0.6,
  mask_family_fit_min: 0.4,
  role_behavior_fit_min: 0.5,
  generic_ai_baseline_distance_min: 0.1,
  warm_receipt_custody_score_min: 0.82,
  receipt_visibility_score_min: 0.82,
  date_visibility_score_min: 0.7,
  file_visibility_score_min: 0.7,
  reason_visibility_score_min: 0.66,
  label_visibility_score_min: 0.66,
  mismatch_visibility_score_min: 0.66,
  bounded_warmth_score_min: 0.58,
  bounded_warmth_score_max: 0.86,
  human_temperature_score_min: 0.52,
  soft_boundary_score_min: 0.5,
  extra_context_addition_rate_max: 0.04,
  invented_relationship_rate_max: 0,
  invented_family_detail_rate_max: 0,
  invented_domestic_prop_rate_max: 0,
  unsupported_backstory_score_max: 0.08,
  invented_motive_score_max: 0.08,
  story_pressure_score_min: 0.18,
  story_pressure_score_max: 0.55,
  story_containment_score_min: 0.72,
  narrative_expansion_risk_max: 0.16,
  receipt_to_story_ratio_min: 0.44,
  warm_entry_position_min: 0,
  warm_entry_position_max: 0.35,
  receipt_anchor_position_min: 0.35,
  receipt_anchor_position_max: 0.78,
  late_middle_receipt_bloom_min: 0.48,
  gentle_close_score_min: 0.3,
  prior_mask_similarity_score_max: 0.34,
  small_circle_leakage_score_max: 0.16,
  target_register_leakage_score_max: 0.08,
  checklist_coldness_score_max: 0.22,
  document_ghost_distance_score_max: 0.22,
  snark_escalation_score_max: 0.1,
  fracture_leakage_score_max: 0.12,
  handoff_clipping_score_max: 0.16,
  sentimental_lamination_score_max: 0.18,
  comfort_over_claim_score_max: 0.16,
  care_marker_overgrowth_max: 0.14,
  reassurance_without_source_score_max: 0.08,
  receipt_scold_score_max: 0.16,
  legalistic_pressure_score_max: 0.14,
  moralizing_receipt_score_max: 0.12,
  mascot_phrase_rate_max: 0
});

const WARM_ENTRY_PHRASES = ['i’d keep', "i'd keep", 'i would keep', 'this is one of those', 'this is the kind', 'keep this one close', 'i wouldn’t let', "i wouldn't let", 'little detail', 'looks small'];
const RECEIPT_MARKERS = ['file-72', '6/18', 'wjct label', 'footer mismatch', 'export date', 'date', 'label', 'receipt', 'record'];
const FAMILY_MARKERS = ['baby', 'honey', 'sweetie', 'auntie', 'grandma', 'grandmother', 'family', 'mama'];
const DOMESTIC_MARKERS = ['kitchen drawer', 'kitchen', 'drawer', 'cookie', 'cookie-tin', 'cookie tin', 'church fan', 'church', 'covered dish', 'table'];
const SUPPORT_MARKERS = ['holding space', 'mindful', 'supportive', 'care', 'community', 'comfort', 'reassure'];
const SMALL_CIRCLE_MARKERS = ['girl', 'thread', 'already know', 'they already know', 'in here', 'everyone here', 'group chat'];
const TARGET_REGISTER_MARKERS = ["ain't", 'telling on itself', 'act like', 'don’t let them act', 'dont let them act'];
const MEMO_MARKERS = ['please ensure', 'relevant file', 'appropriate date', 'for review', 'associated with', 'preserve'];
const DOCUMENT_DISTANCE_MARKERS = ['contains', 'associated', 'preserve', 'discrepancy', 'relevant'];
const SNARK_MARKERS = ['obviously', 'exactly what they were doing', 'telling on', 'weird'];
const SCOLD_MARKERS = ['this is why', 'always', 'before anyone tries', 'deny it', 'denying it'];
const BACKSTORY_MARKERS = ['probably knew', 'knew exactly', 'what they were doing', 'whole story', 'she probably', 'they probably', 'you can tell'];

function text(value) { return String(value || ''); }
function lower(value) { return text(value).toLowerCase(); }
function tokens(value) { return text(value).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []; }
function clamp(value) { return Math.max(0, Math.min(1, Number((Number(value) || 0).toFixed(4)))); }
function rate(n, d) { return clamp(d ? n / d : 0); }
function phraseHits(phrases, value) { const v = lower(value); return phrases.filter((phrase) => v.includes(String(phrase).toLowerCase())).length; }
function hasAny(phrases, value) { return phraseHits(phrases, value) > 0; }
function positionOf(phrases, value, fallback = 1) {
  const v = lower(value);
  const positions = phrases.map((phrase) => v.indexOf(String(phrase).toLowerCase())).filter((index) => index >= 0);
  if (!positions.length) return fallback;
  return clamp(Math.min(...positions) / Math.max(v.length, 1));
}
function visibility(phrases, value, regex = null) { return clamp((hasAny(phrases, value) || (regex && regex.test(text(value)))) ? 1 : 0); }
function bandBloom(value, target = 0.56) { return clamp(1 - Math.abs(value - target) * 2.2); }
function unique(values) { return [...new Set(values.filter(Boolean))]; }
function addMetricRule(lists, name, passed) { (passed ? lists.passed : lists.repair).push(name); }
function addHardRule(lists, name, passed) { (passed ? lists.passed : lists.failed).push(name); }
function addBandRule(lists, name, value, min = 0, max = 1) { (value >= min && value <= max ? lists.passed : lists.repair).push(name); }

export function isReceiptsQueenieRecord(maskRecord = {}) {
  return maskRecord.mask_id === 'grandma-receipts' || maskRecord.gallery_role === 'warm_receipts' || maskRecord.intended_role === 'warm_receipts' || maskRecord.family === 'warm receipts';
}

export async function buildReceiptsQueenieCentroid(maskRecord = {}, calibrationSamples = []) {
  const centroid = Object.freeze({
    mean_sentence_length: 18,
    sentence_length_cv: 0.34,
    lexical_density: 0.58,
    hedge_marker_rate: 0.035,
    abbreviation_rate: 0,
    generic_helper_voice_score: 0.05,
    api_sheen_score: 0.04,
    bounded_irregularity_index: 0.36,
    breath_retention_score: 0.82,
    warmth_to_custody_ratio: 0.58
  });
  return Object.freeze({
    schema: HUSH_MASK_CENTROID_SCHEMA,
    mask_id: maskRecord.mask_id || null,
    role: 'warm_receipts',
    centroid_features: centroid,
    calibration_sample_count: calibrationSamples.length,
    centroid_hash_sha256: await sha256Text(stableStringify(centroid))
  });
}

export function computeReceiptsQueenieFeatureMetrics(candidate = '', options = {}) {
  const value = text(candidate);
  const tokenList = tokens(value);
  const tokenCount = Math.max(tokenList.length, 1);
  const lineCount = Math.max(value.split(/\n+/u).filter(Boolean).length, 1);
  const warmHits = phraseHits(WARM_ENTRY_PHRASES, value) + phraseHits(['little', 'close', 'small', 'looks'], value) * 0.35;
  const familyHits = phraseHits(FAMILY_MARKERS, value);
  const domesticHits = phraseHits(DOMESTIC_MARKERS, value);
  const supportHits = phraseHits(SUPPORT_MARKERS, value);
  const smallCircleHits = phraseHits(SMALL_CIRCLE_MARKERS, value);
  const targetRegisterHits = phraseHits(TARGET_REGISTER_MARKERS, value);
  const memoHits = phraseHits(MEMO_MARKERS, value);
  const documentHits = phraseHits(DOCUMENT_DISTANCE_MARKERS, value);
  const snarkHits = phraseHits(SNARK_MARKERS, value);
  const scoldHits = phraseHits(SCOLD_MARKERS, value);
  const backstoryHits = phraseHits(BACKSTORY_MARKERS, value);
  const slashCount = (value.match(/\//g) || []).length;
  const fileVisibility = visibility(['file-72', 'file'], value, /FILE-?72/u);
  const dateVisibility = visibility(['6/18', 'date', 'export date'], value, /\b\d{1,2}\/\d{1,2}\b/u);
  const labelVisibility = visibility(['wjct label', 'wjct', 'label'], value, /WJCT/u);
  const mismatchVisibility = visibility(['footer mismatch', 'mismatch', 'footer'], value);
  const reasonVisibility = visibility(['because', 'doing more work', 'looks small', 'needs to stay', 'stay tied', 'keep', 'together', 'separate'], value);
  const receiptVisibility = clamp((fileVisibility + dateVisibility + labelVisibility + mismatchVisibility + reasonVisibility) / 5);
  const boundedWarmth = clamp(0.22 + warmHits * 0.16 + (value.includes('\n') ? 0.04 : 0) - familyHits * 0.22 - domesticHits * 0.18 - supportHits * 0.12 - memoHits * 0.08);
  const humanTemperature = clamp(boundedWarmth + warmHits * 0.06 - memoHits * 0.1 - slashCount * 0.04);
  const softBoundary = clamp((hasAny(['needs to stay', 'stay tied', 'keep', 'together', 'wouldn’t let', "wouldn't let"], value) ? 0.62 : 0.28) + receiptVisibility * 0.28 - scoldHits * 0.08);
  const storyPressure = clamp(phraseHits(['because', 'one of those', 'kind of record', 'looks small', 'little detail', 'somebody tries'], value) * 0.16 + (lineCount > 1 ? 0.08 : 0));
  const extraContext = clamp(backstoryHits * 0.18 + phraseHits(['they', 'she', 'probably', 'knew'], value) * 0.03);
  const unsupportedBackstory = clamp(backstoryHits * 0.28 + phraseHits(['probably', 'knew exactly', 'what they were doing'], value) * 0.12);
  const inventedMotive = clamp(phraseHits(['knew exactly', 'probably knew', 'what they were doing', 'telling the whole story'], value) * 0.32);
  const narrativeExpansionRisk = clamp(extraContext * 0.72 + unsupportedBackstory * 0.28);
  const storyContainment = clamp(1 - narrativeExpansionRisk - familyHits * 0.18 - domesticHits * 0.12);
  const receiptToStoryRatio = clamp(receiptVisibility / Math.max(receiptVisibility + storyPressure + extraContext, 0.01));
  const warmEntryPosition = positionOf(WARM_ENTRY_PHRASES, value, warmHits ? 0.2 : 1);
  const receiptAnchorPosition = positionOf(RECEIPT_MARKERS, value, 1);
  const lateMiddleReceiptBloom = bandBloom(receiptAnchorPosition, 0.56);
  const gentleCloseScore = clamp((/stay with|stay tied|together|file\.?$/iu.test(value.trim()) ? 0.52 : 0.24) + softBoundary * 0.32 - scoldHits * 0.08);
  const smallCircleLeakage = clamp(smallCircleHits * 0.28 + phraseHits(['thread', 'already know'], value) * 0.12);
  const targetRegisterLeakage = clamp(targetRegisterHits * 0.34);
  const checklistColdness = clamp(memoHits * 0.18 + phraseHits(['please ensure', 'preserve'], value) * 0.08 - warmHits * 0.05);
  const documentDistance = clamp(documentHits * 0.1 + memoHits * 0.08 - warmHits * 0.04);
  const snarkEscalation = clamp(snarkHits * 0.16 + inventedMotive * 0.32);
  const fractureLeakage = clamp(slashCount * 0.12 + phraseHits(['//', 'not small'], value) * 0.22);
  const handoffClipping = clamp(tokenCount < 12 ? 0.28 : 0);
  const priorMaskSimilarity = clamp(Math.max(smallCircleLeakage, targetRegisterLeakage, checklistColdness, documentDistance, snarkEscalation, fractureLeakage, handoffClipping));
  const sentimental = clamp(supportHits * 0.14 + phraseHits(['feels like a lot', 'did the right thing', 'comfort'], value) * 0.24);
  const comfortOverClaim = clamp(sentimental + (receiptVisibility < 0.6 ? 0.22 : 0));
  const careOvergrowth = clamp(supportHits * 0.18 + phraseHits(['care', 'supportive', 'comfort'], value) * 0.08);
  const reassuranceWithoutSource = clamp((sentimental > 0 && receiptVisibility < 0.5) ? 0.4 : 0);
  const receiptScold = clamp(scoldHits * 0.22 + phraseHits(['always preserve', 'anyone tries'], value) * 0.12);
  const legalistic = clamp(phraseHits(['legal', 'court', 'deny', 'proof', 'preserve'], value) * 0.08 + memoHits * 0.08);
  const moralizing = clamp(scoldHits * 0.12 + snarkHits * 0.12 + inventedMotive * 0.28);
  return Object.freeze({
    schema: RECEIPTS_QUEENIE_METRIC_PROFILE_SCHEMA,
    warm_receipt_custody_score: clamp(receiptVisibility * 0.72 + boundedWarmth * 0.2 + softBoundary * 0.08),
    receipt_visibility_score: receiptVisibility,
    file_visibility_score: fileVisibility,
    reason_visibility_score: reasonVisibility,
    date_visibility_score: dateVisibility,
    label_visibility_score: labelVisibility,
    mismatch_visibility_score: mismatchVisibility,
    bounded_warmth_score: boundedWarmth,
    warmth_without_overreach_score: clamp(boundedWarmth * (1 - extraContext) * (1 - familyHits * 0.1)),
    soft_boundary_score: softBoundary,
    human_temperature_score: humanTemperature,
    extra_context_addition_rate: extraContext,
    invented_relationship_rate: rate(familyHits, tokenCount),
    invented_family_detail_rate: rate(familyHits, tokenCount),
    invented_domestic_prop_rate: rate(domesticHits, tokenCount),
    unsupported_backstory_score: unsupportedBackstory,
    invented_motive_score: inventedMotive,
    story_pressure_score: storyPressure,
    story_containment_score: storyContainment,
    narrative_expansion_risk: narrativeExpansionRisk,
    receipt_to_story_ratio: receiptToStoryRatio,
    warm_entry_position: warmEntryPosition,
    receipt_anchor_position: receiptAnchorPosition,
    late_middle_receipt_bloom: lateMiddleReceiptBloom,
    gentle_close_score: gentleCloseScore,
    prior_mask_similarity_score: priorMaskSimilarity,
    small_circle_leakage_score: smallCircleLeakage,
    target_register_leakage_score: targetRegisterLeakage,
    checklist_coldness_score: checklistColdness,
    document_ghost_distance_score: documentDistance,
    snark_escalation_score: snarkEscalation,
    fracture_leakage_score: fractureLeakage,
    handoff_clipping_score: handoffClipping,
    sentimental_lamination_score: sentimental,
    comfort_over_claim_score: comfortOverClaim,
    care_marker_overgrowth: careOvergrowth,
    reassurance_without_source_score: reassuranceWithoutSource,
    receipt_scold_score: receiptScold,
    legalistic_pressure_score: legalistic,
    moralizing_receipt_score: moralizing,
    cadence_heatmap_contour: 'warm-envelope-hard-latch'
  });
}

export function applyReceiptsQueenieDecisionRules(decision = {}, featureVector = {}, thresholds = RECEIPTS_QUEENIE_THRESHOLDS) {
  const lists = {
    passed: [...(decision.passed_thresholds || [])],
    failed: [...(decision.failed_thresholds || [])],
    repair: [...(decision.repair_thresholds || [])]
  };
  const f = featureVector || {};
  addMetricRule(lists, 'warm_receipt_custody_score', (f.warm_receipt_custody_score ?? 0) >= thresholds.warm_receipt_custody_score_min);
  addMetricRule(lists, 'receipt_visibility_score', (f.receipt_visibility_score ?? 0) >= thresholds.receipt_visibility_score_min);
  addMetricRule(lists, 'date_visibility_score', (f.date_visibility_score ?? 0) >= thresholds.date_visibility_score_min);
  addMetricRule(lists, 'file_visibility_score', (f.file_visibility_score ?? 0) >= thresholds.file_visibility_score_min);
  addMetricRule(lists, 'reason_visibility_score', (f.reason_visibility_score ?? 0) >= thresholds.reason_visibility_score_min);
  addMetricRule(lists, 'label_visibility_score', (f.label_visibility_score ?? 0) >= thresholds.label_visibility_score_min);
  addMetricRule(lists, 'mismatch_visibility_score', (f.mismatch_visibility_score ?? 0) >= thresholds.mismatch_visibility_score_min);
  addBandRule(lists, 'bounded_warmth_score', f.bounded_warmth_score ?? 0, thresholds.bounded_warmth_score_min, thresholds.bounded_warmth_score_max);
  addMetricRule(lists, 'human_temperature_score', (f.human_temperature_score ?? 0) >= thresholds.human_temperature_score_min);
  addMetricRule(lists, 'soft_boundary_score', (f.soft_boundary_score ?? 0) >= thresholds.soft_boundary_score_min);
  addHardRule(lists, 'extra_context_addition_rate', (f.extra_context_addition_rate ?? 0) <= thresholds.extra_context_addition_rate_max);
  addHardRule(lists, 'invented_relationship_rate', (f.invented_relationship_rate ?? 0) <= thresholds.invented_relationship_rate_max);
  addHardRule(lists, 'invented_family_detail_rate', (f.invented_family_detail_rate ?? 0) <= thresholds.invented_family_detail_rate_max);
  addHardRule(lists, 'invented_domestic_prop_rate', (f.invented_domestic_prop_rate ?? 0) <= thresholds.invented_domestic_prop_rate_max);
  addHardRule(lists, 'unsupported_backstory_score', (f.unsupported_backstory_score ?? 0) <= thresholds.unsupported_backstory_score_max);
  addHardRule(lists, 'invented_motive_score', (f.invented_motive_score ?? 0) <= thresholds.invented_motive_score_max);
  addBandRule(lists, 'story_pressure_score', f.story_pressure_score ?? 0, thresholds.story_pressure_score_min, thresholds.story_pressure_score_max);
  addMetricRule(lists, 'story_containment_score', (f.story_containment_score ?? 0) >= thresholds.story_containment_score_min);
  addMetricRule(lists, 'receipt_to_story_ratio', (f.receipt_to_story_ratio ?? 0) >= thresholds.receipt_to_story_ratio_min);
  addBandRule(lists, 'warm_entry_position', f.warm_entry_position ?? 1, thresholds.warm_entry_position_min, thresholds.warm_entry_position_max);
  addBandRule(lists, 'receipt_anchor_position', f.receipt_anchor_position ?? 1, thresholds.receipt_anchor_position_min, thresholds.receipt_anchor_position_max);
  addMetricRule(lists, 'late_middle_receipt_bloom', (f.late_middle_receipt_bloom ?? 0) >= thresholds.late_middle_receipt_bloom_min);
  addMetricRule(lists, 'gentle_close_score', (f.gentle_close_score ?? 0) >= thresholds.gentle_close_score_min);
  addMetricRule(lists, 'prior_mask_similarity_score', (f.prior_mask_similarity_score ?? 0) <= thresholds.prior_mask_similarity_score_max);
  addMetricRule(lists, 'small_circle_leakage_score', (f.small_circle_leakage_score ?? 0) <= thresholds.small_circle_leakage_score_max);
  addMetricRule(lists, 'target_register_leakage_score', (f.target_register_leakage_score ?? 0) <= thresholds.target_register_leakage_score_max);
  addMetricRule(lists, 'checklist_coldness_score', (f.checklist_coldness_score ?? 0) <= thresholds.checklist_coldness_score_max);
  addMetricRule(lists, 'document_ghost_distance_score', (f.document_ghost_distance_score ?? 0) <= thresholds.document_ghost_distance_score_max);
  addMetricRule(lists, 'snark_escalation_score', (f.snark_escalation_score ?? 0) <= thresholds.snark_escalation_score_max);
  addMetricRule(lists, 'fracture_leakage_score', (f.fracture_leakage_score ?? 0) <= thresholds.fracture_leakage_score_max);
  addMetricRule(lists, 'handoff_clipping_score', (f.handoff_clipping_score ?? 0) <= thresholds.handoff_clipping_score_max);
  addMetricRule(lists, 'sentimental_lamination_score', (f.sentimental_lamination_score ?? 0) <= thresholds.sentimental_lamination_score_max);
  addMetricRule(lists, 'comfort_over_claim_score', (f.comfort_over_claim_score ?? 0) <= thresholds.comfort_over_claim_score_max);
  addMetricRule(lists, 'care_marker_overgrowth', (f.care_marker_overgrowth ?? 0) <= thresholds.care_marker_overgrowth_max);
  addMetricRule(lists, 'reassurance_without_source_score', (f.reassurance_without_source_score ?? 0) <= thresholds.reassurance_without_source_score_max);
  addMetricRule(lists, 'receipt_scold_score', (f.receipt_scold_score ?? 0) <= thresholds.receipt_scold_score_max);
  addMetricRule(lists, 'legalistic_pressure_score', (f.legalistic_pressure_score ?? 0) <= thresholds.legalistic_pressure_score_max);
  addMetricRule(lists, 'moralizing_receipt_score', (f.moralizing_receipt_score ?? 0) <= thresholds.moralizing_receipt_score_max);
  const status = lists.failed.length ? 'blocked' : lists.repair.length ? 'repair_required' : 'pass';
  return Object.freeze({
    ...decision,
    status,
    passed_thresholds: Object.freeze(unique(lists.passed)),
    failed_thresholds: Object.freeze(unique(lists.failed)),
    repair_thresholds: Object.freeze(unique(lists.repair)),
    block_reasons: Object.freeze(unique(lists.failed))
  });
}
