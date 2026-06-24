import { stableStringify, sha256Text } from './hush-customizer-packet.js';
import { HUSH_MASK_CENTROID_SCHEMA } from './hush-stylometric-feature-vector.js';

export const LUZ_INDEX_METRIC_PROFILE_SCHEMA = 'td613.hush.phase8.luz-index-metrics/v1';

export const LUZ_INDEX_CADENCE_HEATMAP = Object.freeze({
  indexFrame: Object.freeze({ min: 0, max: 0.15 }),
  numberedAnchors: Object.freeze({ min: 0.15, max: 0.6 }),
  relationNote: Object.freeze({ min: 0.55, max: 0.82 }),
  handoffClose: Object.freeze({ min: 0.78, max: 1 }),
  expectedContour: 'custodial-index-tender-itemization',
  forbiddenContours: Object.freeze(['mechanical-checklist-flatness', 'project-manager-action-items', 'false-completion-stamp', 'generic-institutional-bleach'])
});

export const LUZ_INDEX_THRESHOLDS = Object.freeze({
  mandatory_anchor_retention: 1,
  source_unit_coverage_min: 0.92,
  factual_damage_risk_max: 0.05,
  index_integrity_score_min: 0.82,
  numbered_anchor_clarity_min: 0.82,
  item_boundary_stability_min: 0.78,
  index_label_specificity_min: 0.76,
  sectional_handoff_coherence_min: 0.74,
  specificity_retention_min: 0.84,
  receipt_visibility_score_min: 0.84,
  source_obligation_retention_min: 0.92,
  relationship_retention_score_min: 0.8,
  bundle_integrity_score_min: 0.82,
  custody_unit_coherence_min: 0.8,
  do_not_separate_signal_min: 0.68,
  cross_item_dependency_score_min: 0.72,
  sequence_retention_score_min: 0.76,
  chronology_retention_score_min: 0.72,
  sequence_drift_score_max: 0.12,
  ordering_damage_risk_max: 0.08,
  care_restoration_score_min: 0.42,
  sensitive_context_acknowledgment_min: 0.28,
  witness_burden_reduction_score_min: 0.34,
  nonmechanical_handoff_score_min: 0.58,
  mechanical_coldness_risk_max: 0.18,
  generic_project_manager_voice_max: 0.1,
  action_item_slop_score_max: 0.1,
  clipboard_flatness_score_max: 0.16,
  bureaucratic_bleach_score_max: 0.12,
  false_completeness_risk_max: 0,
  premature_closure_score_max: 0.06,
  claim_scope_retention_min: 0.82,
  uncertainty_retention_score_min: 0.58,
  source_idiolect_retention_max: 0.2,
  source_ngram_overlap_rate_max: 0.18,
  private_cadence_exposure_risk_max: 0.14,
  format_dominance_score_min: 0.78,
  source_voice_displacement_min: 0.72,
  sample_seed_phrase_overlap_max: 0,
  sample_seed_lexical_overlap_max: 0.08,
  profile_reconstruction_risk_max: 0.12,
  private_cadence_exposure_risk_max: 0.14,
  mask_breath_score_min: 0.2,
  bounded_irregularity_index_min: 0,
  bounded_irregularity_index_max: 0.88,
  imperfection_budget_used_min: 0,
  imperfection_budget_used_max: 0.9,
  rhythm_asymmetry_score_min: 0,
  nonuniformity_without_damage_min: 0.2,
  mask_centroid_distance_max: 0.82,
  mask_family_fit_min: 0.2,
  role_behavior_fit_min: 0.25,
  generic_ai_baseline_distance_min: 0,
  generic_helper_voice_score_max: 0.12,
  api_sheen_score_max: 0.14,
  polish_pressure_max: 0.16,
  public_default_allowed: false
});

const DEFAULT_ANCHORS = ['FILE-72', '6/18', 'WJCT label', 'footer mismatch'];
const RELATION = ['relationship', 'depends', 'together', 'bundle', 'grouping', 'custody unit', 'linked', 'connection', 'not any single item', 'do not split', 'do not separate', 'keep all four'];
const CARE = ['next reader', 'care note', 'handoff note', 'nobody has to reconstruct', 'later', 'carry forward', 'handoff'];
const INDEX_FRAME = ['index', 'bundle', 'custody unit', 'handoff note', 'care note'];
const FALSE_COMPLETE = ['complete', 'resolved', 'all set', 'done', 'final', 'case closed'];
const MANAGER = ['action items', 'review documentation', 'determine next steps', 'follow up as needed', 'as needed'];
const VAGUE = ['file issue', 'date issue', 'label issue', 'review documentation', 'determine next steps'];
const UNCERTAINTY = ['open', 'not resolved', 'not complete', 'carry forward', 'preserve', 'keep'];
const ANCHOR_WORDS = new Set(['file', 'file-72', '72', '6', '18', 'wjct', 'label', 'footer', 'mismatch', 'date', 'export']);

function text(value) { return String(value || ''); }
function lower(value) { return text(value).toLowerCase(); }
function tokens(value) { return lower(value).match(/[a-z0-9][a-z0-9'-]*/g) || []; }
function clamp(value) { return Math.max(0, Math.min(1, Number((Number(value) || 0).toFixed(4)))); }
function rate(n, d) { return clamp(d ? n / d : 0); }
function unique(values) { return [...new Set(values.filter(Boolean))]; }
function phraseHits(phrases, value) { const v = lower(value); return phrases.filter((phrase) => v.includes(String(phrase).toLowerCase())).length; }
function addMetricRule(lists, name, passed) { (passed ? lists.passed : lists.repair).push(name); }
function addHardRule(lists, name, passed) { (passed ? lists.passed : lists.failed).push(name); }
function numberedCount(value = '') { return (text(value).match(/^\s*\d+[.)]\s+/gm) || []).length; }
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
function ngramOverlap(source = '', candidate = '') {
  const sourceTokens = tokens(source).filter((token) => !ANCHOR_WORDS.has(token));
  const grams = [];
  for (let i = 0; i <= sourceTokens.length - 4; i += 1) grams.push(sourceTokens.slice(i, i + 4).join(' '));
  const uniqueGrams = unique(grams);
  if (!uniqueGrams.length) return 0;
  const v = lower(candidate);
  return rate(uniqueGrams.filter((gram) => v.includes(gram)).length, uniqueGrams.length);
}
function sourceHasSequence(source = '') { return /first|then|after|before|when|sequence|chronolog/iu.test(source); }
function hasSourceSyntaxLeak(source = '', candidate = '') {
  const sourceNorm = lower(source).replace(/\s+/g, ' ').trim();
  const candNorm = lower(candidate).replace(/\s+/g, ' ').trim();
  return sourceNorm && candNorm && candNorm.includes(sourceNorm.slice(0, Math.min(55, sourceNorm.length)));
}

export function isLuzIndexRecord(maskRecord = {}) {
  return maskRecord.mask_id === 'clipboard' || maskRecord.id === 'clipboard' || maskRecord.label === 'Luz of the Index' || maskRecord.family === 'custodial index' || maskRecord.family === 'checklist';
}

export async function buildLuzIndexCentroid(maskRecord = {}, calibrationSamples = []) {
  const centroid = Object.freeze({
    source_adaptive: true,
    mean_sentence_length: 9.5,
    sentence_length_cv: 0.42,
    lexical_density: 0.7,
    generic_helper_voice_score: 0.04,
    api_sheen_score: 0.04,
    bounded_irregularity_index: 0.32,
    index_integrity_score: 0.88,
    numbered_anchor_clarity: 0.86,
    relationship_retention_score: 0.82,
    care_restoration_score: 0.5,
    mechanical_coldness_risk: 0.08,
    false_completeness_risk: 0,
    format_dominance_score: 0.86,
    public_default_allowed: false
  });
  return Object.freeze({ schema: HUSH_MASK_CENTROID_SCHEMA, mask_id: maskRecord.mask_id || maskRecord.id || null, role: 'custodial_index', source_adaptive: true, centroid_features: centroid, calibration_sample_count: calibrationSamples.length, centroid_hash_sha256: await sha256Text(stableStringify(centroid)) });
}

export function computeLuzIndexFeatureMetrics(candidate = '', options = {}) {
  const value = text(candidate);
  const source = text(options.sourceText || options.source_summary || '');
  const anchorScore = anchorVisibility(value, options);
  const nCount = numberedCount(value);
  const tokCount = Math.max(tokens(value).length, 1);
  const relationHits = phraseHits(RELATION, value);
  const careHits = phraseHits(CARE, value);
  const frameHits = phraseHits(INDEX_FRAME, value);
  const falseHits = phraseHits(FALSE_COMPLETE, value);
  const managerHits = phraseHits(MANAGER, value);
  const vagueHits = phraseHits(VAGUE, value);
  const uncertaintyHits = phraseHits(UNCERTAINTY, value);
  const hasHandoff = /handoff note|care note|keep all|relationship|grouping|custody unit|do not split|do not separate/iu.test(value);
  const overIndex = nCount > 6;
  const sourceSequence = sourceHasSequence(source);
  const relation = clamp(relationHits * 0.14 + (hasHandoff ? 0.28 : 0) + anchorScore * 0.38);
  const care = clamp(careHits * 0.16 + (lower(value).includes('next reader') ? 0.16 : 0) + (lower(value).includes('nobody has to reconstruct') ? 0.24 : 0) + (hasHandoff ? 0.08 : 0));
  const formatDominance = clamp((nCount >= 4 ? 0.5 : nCount * 0.1) + frameHits * 0.1 + (tokCount < 110 ? 0.08 : 0));
  const numberedClarity = clamp(nCount >= 4 ? 0.86 : nCount >= 3 ? 0.62 : nCount * 0.12);
  const specificity = clamp(anchorScore * 0.82 + (vagueHits ? -0.2 : 0) + (nCount >= 4 ? 0.08 : 0));
  const receipt = clamp(anchorScore * 0.74 + numberedClarity * 0.18);
  const indexIntegrity = clamp(formatDominance * 0.38 + numberedClarity * 0.3 + relation * 0.18 + (frameHits ? 0.1 : 0));
  const boundary = clamp(nCount >= 4 ? 0.82 : nCount >= 3 ? 0.58 : 0.18);
  const handoff = clamp(relation * 0.48 + care * 0.24 + (hasHandoff ? 0.18 : 0));
  const bundle = clamp(anchorScore * 0.4 + relation * 0.48 + (lower(value).includes('bundle') || lower(value).includes('custody unit') ? 0.12 : 0));
  const custody = clamp(bundle * 0.58 + handoff * 0.28 + receipt * 0.12);
  const separateSignal = clamp(phraseHits(['do not split', 'do not separate', 'keep all four together', 'keep this as one bundle', 'keep all four', 'keep linked'], value) * 0.24 + relation * 0.46);
  const dependency = clamp(relation * 0.66 + (lower(value).includes('depends') ? 0.18 : 0));
  const sequenceRetention = clamp(sourceSequence ? (lower(value).includes('before') || lower(value).includes('then') || lower(value).includes('after') ? 0.84 : 0.64) : 0.82);
  const chronology = clamp(sequenceRetention * 0.92);
  const sequenceDrift = clamp(sourceSequence && !(lower(value).includes('before') || lower(value).includes('then') || lower(value).includes('after')) ? 0.18 : 0.02);
  const orderDamage = clamp(sequenceDrift * 0.7);
  const mechanicalColdness = clamp((nCount >= 4 && !hasHandoff ? 0.34 : 0.04) + (care < 0.2 ? 0.08 : 0) + (tokCount < 22 ? 0.14 : 0));
  const projectManager = clamp(managerHits * 0.3);
  const actionSlop = clamp(managerHits * 0.22 + (lower(value).includes('action items') ? 0.4 : 0));
  const flatness = clamp((nCount >= 4 && !hasHandoff ? 0.28 : 0.04) + (relation < 0.4 ? 0.14 : 0) + (overIndex ? 0.12 : 0));
  const bleach = clamp(projectManager * 0.6 + phraseHits(['review documentation', 'determine next steps'], value) * 0.12);
  const falseCompletion = clamp(falseHits * 0.5);
  const premature = clamp(falseHits ? 0.5 : 0.02);
  const claimScope = clamp((falseHits ? 0.32 : 0.82) + (uncertaintyHits ? 0.08 : 0));
  const uncertainty = clamp((uncertaintyHits ? 0.72 : 0.6) - falseCompletion * 0.4);
  const sourceNgram = ngramOverlap(source, value);
  const sourceLeak = hasSourceSyntaxLeak(source, value) ? 0.52 : 0.08;
  const sourceVoiceDisplacement = clamp(1 - sourceNgram * 0.7 - sourceLeak * 0.3 + formatDominance * 0.18);
  const idiolectRetention = clamp(sourceNgram * 0.6 + sourceLeak * 0.24);
  return Object.freeze({
    schema: LUZ_INDEX_METRIC_PROFILE_SCHEMA,
    index_integrity_score: indexIntegrity,
    numbered_anchor_clarity: numberedClarity,
    item_boundary_stability: boundary,
    index_label_specificity: specificity,
    sectional_handoff_coherence: handoff,
    specificity_retention: specificity,
    receipt_visibility_score: receipt,
    source_obligation_retention: anchorScore,
    relationship_retention_score: relation,
    bundle_integrity_score: bundle,
    custody_unit_coherence: custody,
    do_not_separate_signal: separateSignal,
    cross_item_dependency_score: dependency,
    sequence_retention_score: sequenceRetention,
    chronology_retention_score: chronology,
    sequence_drift_score: sequenceDrift,
    ordering_damage_risk: orderDamage,
    care_restoration_score: care,
    sensitive_context_acknowledgment: clamp(careHits * 0.14 + (lower(value).includes('next reader') ? 0.16 : 0)),
    witness_burden_reduction_score: clamp(lower(value).includes('reconstruct') ? 0.72 : care * 0.58),
    nonmechanical_handoff_score: clamp(handoff * 0.58 + care * 0.26 + (mechanicalColdness < 0.18 ? 0.08 : 0)),
    mechanical_coldness_risk: mechanicalColdness,
    generic_project_manager_voice: projectManager,
    action_item_slop_score: actionSlop,
    clipboard_flatness_score: flatness,
    bureaucratic_bleach_score: bleach,
    false_completeness_risk: falseCompletion,
    premature_closure_score: premature,
    claim_scope_retention: claimScope,
    uncertainty_retention_score: uncertainty,
    source_idiolect_retention: idiolectRetention,
    source_ngram_overlap_rate: sourceNgram,
    format_dominance_score: formatDominance,
    source_voice_displacement: sourceVoiceDisplacement,
    over_indexing_risk: clamp(overIndex ? 0.34 : 0),
    cadence_heatmap_contour: 'custodial-index-tender-itemization'
  });
}

export function applyLuzIndexDecisionRules(decision = {}, featureVector = {}, thresholds = LUZ_INDEX_THRESHOLDS) {
  const lists = { passed: [...(decision.passed_thresholds || [])], failed: [...(decision.failed_thresholds || [])], repair: [...(decision.repair_thresholds || [])] };
  const f = featureVector || {};
  addMetricRule(lists, 'index_integrity_score', (f.index_integrity_score ?? 0) >= thresholds.index_integrity_score_min);
  addMetricRule(lists, 'numbered_anchor_clarity', (f.numbered_anchor_clarity ?? 0) >= thresholds.numbered_anchor_clarity_min);
  addMetricRule(lists, 'item_boundary_stability', (f.item_boundary_stability ?? 0) >= thresholds.item_boundary_stability_min);
  addMetricRule(lists, 'index_label_specificity', (f.index_label_specificity ?? 0) >= thresholds.index_label_specificity_min);
  addMetricRule(lists, 'sectional_handoff_coherence', (f.sectional_handoff_coherence ?? 0) >= thresholds.sectional_handoff_coherence_min);
  addMetricRule(lists, 'specificity_retention', (f.specificity_retention ?? 0) >= thresholds.specificity_retention_min);
  addMetricRule(lists, 'receipt_visibility_score', (f.receipt_visibility_score ?? 0) >= thresholds.receipt_visibility_score_min);
  addMetricRule(lists, 'source_obligation_retention', (f.source_obligation_retention ?? 0) >= thresholds.source_obligation_retention_min);
  addMetricRule(lists, 'relationship_retention_score', (f.relationship_retention_score ?? 0) >= thresholds.relationship_retention_score_min);
  addMetricRule(lists, 'bundle_integrity_score', (f.bundle_integrity_score ?? 0) >= thresholds.bundle_integrity_score_min);
  addMetricRule(lists, 'custody_unit_coherence', (f.custody_unit_coherence ?? 0) >= thresholds.custody_unit_coherence_min);
  addMetricRule(lists, 'do_not_separate_signal', (f.do_not_separate_signal ?? 0) >= thresholds.do_not_separate_signal_min);
  addMetricRule(lists, 'cross_item_dependency_score', (f.cross_item_dependency_score ?? 0) >= thresholds.cross_item_dependency_score_min);
  addMetricRule(lists, 'sequence_retention_score', (f.sequence_retention_score ?? 0) >= thresholds.sequence_retention_score_min);
  addMetricRule(lists, 'chronology_retention_score', (f.chronology_retention_score ?? 0) >= thresholds.chronology_retention_score_min);
  addMetricRule(lists, 'sequence_drift_score', (f.sequence_drift_score ?? 0) <= thresholds.sequence_drift_score_max);
  addMetricRule(lists, 'ordering_damage_risk', (f.ordering_damage_risk ?? 0) <= thresholds.ordering_damage_risk_max);
  addMetricRule(lists, 'care_restoration_score', (f.care_restoration_score ?? 0) >= thresholds.care_restoration_score_min);
  addMetricRule(lists, 'sensitive_context_acknowledgment', (f.sensitive_context_acknowledgment ?? 0) >= thresholds.sensitive_context_acknowledgment_min);
  addMetricRule(lists, 'witness_burden_reduction_score', (f.witness_burden_reduction_score ?? 0) >= thresholds.witness_burden_reduction_score_min);
  addMetricRule(lists, 'nonmechanical_handoff_score', (f.nonmechanical_handoff_score ?? 0) >= thresholds.nonmechanical_handoff_score_min);
  addMetricRule(lists, 'mechanical_coldness_risk', (f.mechanical_coldness_risk ?? 0) <= thresholds.mechanical_coldness_risk_max);
  addHardRule(lists, 'generic_project_manager_voice', (f.generic_project_manager_voice ?? 0) <= thresholds.generic_project_manager_voice_max);
  addHardRule(lists, 'action_item_slop_score', (f.action_item_slop_score ?? 0) <= thresholds.action_item_slop_score_max);
  addMetricRule(lists, 'clipboard_flatness_score', (f.clipboard_flatness_score ?? 0) <= thresholds.clipboard_flatness_score_max);
  addMetricRule(lists, 'bureaucratic_bleach_score', (f.bureaucratic_bleach_score ?? 0) <= thresholds.bureaucratic_bleach_score_max);
  addHardRule(lists, 'false_completeness_risk', (f.false_completeness_risk ?? 0) <= thresholds.false_completeness_risk_max);
  addMetricRule(lists, 'premature_closure_score', (f.premature_closure_score ?? 0) <= thresholds.premature_closure_score_max);
  addMetricRule(lists, 'claim_scope_retention', (f.claim_scope_retention ?? 0) >= thresholds.claim_scope_retention_min);
  addMetricRule(lists, 'uncertainty_retention_score', (f.uncertainty_retention_score ?? 0) >= thresholds.uncertainty_retention_score_min);
  addMetricRule(lists, 'source_idiolect_retention', (f.source_idiolect_retention ?? 0) <= thresholds.source_idiolect_retention_max);
  addMetricRule(lists, 'source_ngram_overlap_rate', (f.source_ngram_overlap_rate ?? 0) <= thresholds.source_ngram_overlap_rate_max);
  addMetricRule(lists, 'format_dominance_score', (f.format_dominance_score ?? 0) >= thresholds.format_dominance_score_min);
  addMetricRule(lists, 'source_voice_displacement', (f.source_voice_displacement ?? 0) >= thresholds.source_voice_displacement_min);
  if ((f.over_indexing_risk ?? 0) > 0.2) lists.repair.push('over_indexing_risk'); else lists.passed.push('over_indexing_risk');
  const status = lists.failed.length ? 'blocked' : lists.repair.length ? 'repair_required' : 'pass';
  return Object.freeze({ ...decision, status, passed_thresholds: Object.freeze(unique(lists.passed)), failed_thresholds: Object.freeze(unique(lists.failed)), repair_thresholds: Object.freeze(unique(lists.repair)), block_reasons: Object.freeze(unique(lists.failed)) });
}
