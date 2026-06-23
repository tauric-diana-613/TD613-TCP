export const HUSH_NUMERIC_DECISION_SURFACE_SCHEMA = 'td613.hush.phase8.numeric-decision-surface/v1';

export const PHASE8_UNIVERSAL_THRESHOLDS = Object.freeze({
  mandatory_anchor_retention: 1.0,
  factual_damage_risk_max: 0.05,
  sample_seed_phrase_overlap_max: 0,
  rare_phrase_reuse_max: 0.05,
  source_unit_coverage_min: 0.85,
  hedge_retention_min: 0.9,
  sequence_relation_retention_min: 0.85,
  generic_helper_voice_score_max: 0.15,
  api_sheen_score_max: 0.25,
  polish_pressure_max: 0.3,
  closure_lamination_score_max: 0.35,
  sample_seed_lexical_overlap_max: 0.12,
  profile_reconstruction_risk_max: 0.2,
  mask_breath_score_min: 0.7,
  bounded_irregularity_index_min: 0.3,
  bounded_irregularity_index_max: 0.78,
  rhythm_asymmetry_score_min: 0.25,
  imperfection_budget_used_min: 0.25,
  imperfection_budget_used_max: 0.8,
  nonuniformity_without_damage_min: 0.75,
  mask_centroid_distance_max: 0.38,
  mask_family_fit_min: 0.7,
  role_behavior_fit_min: 0.75,
  generic_ai_baseline_distance_min: 0.3,
  cross_mask_collision_distance_min: 0.18
});

export const GLITCHING_PIXIE_THRESHOLDS = Object.freeze({
  ...PHASE8_UNIVERSAL_THRESHOLDS,
  source_unit_coverage_min: 0.9,
  sequence_relation_retention_min: 0.9,
  hedge_retention_min: 0.95,
  compression_loss_rate_max: 0.1,
  abbreviation_rate_min: 0.02,
  abbreviation_rate_max: 0.18,
  slash_usage_rate_max: 0.08,
  plus_usage_rate_max: 0.08,
  generic_helper_voice_score_max: 0.1,
  api_sheen_score_max: 0.2,
  polish_pressure_max: 0.22,
  mascot_phrase_rate_max: 0,
  sample_seed_lexical_overlap_max: 0.1,
  mask_breath_score_min: 0.74,
  bounded_irregularity_index_min: 0.34,
  bounded_irregularity_index_max: 0.72,
  factual_damage_risk_max: 0.03
});

export const KEISHA_SOFT_CIRCLE_THRESHOLDS = Object.freeze({
  ...PHASE8_UNIVERSAL_THRESHOLDS,
  source_unit_coverage_min: 0.88,
  mandatory_anchor_retention: 1.0,
  hedge_retention_min: 0.85,
  sequence_relation_retention_min: 0.8,
  generic_helper_voice_score_max: 0.1,
  api_sheen_score_max: 0.18,
  polish_pressure_max: 0.2,
  closure_lamination_score_max: 0.25,
  relational_proximity_score_min: 0.18,
  relational_proximity_score_max: 0.52,
  invented_intimacy_risk_max: 0.12,
  unsupported_care_marker_rate_max: 0.08,
  fake_support_group_voice_score_max: 0.1,
  emotional_overreach_score_max: 0.16,
  social_belonging_leakage_score_max: 0.1,
  thread_findable_crutch_rate_max: 0.06,
  inside_room_reference_rate_max: 0.06,
  unnecessary_audience_marker_rate_max: 0.08,
  bulletin_board_tone_score_max: 0.12,
  low_drama_pressure_score_min: 0.55,
  fact_pressure_preservation_min: 0.55,
  escalation_temperature_max: 0.3,
  warmth_to_custody_ratio_min: 0.2,
  warmth_to_custody_ratio_max: 0.62,
  sample_seed_phrase_overlap_max: 0,
  sample_seed_lexical_overlap_max: 0.1,
  profile_reconstruction_risk_max: 0.16,
  private_cadence_exposure_risk_max: 0.16
});

function passList() { return { passed: [], failed: [], repair: [] }; }
function minRule(name, value, min, lists, hard = false) { if (value < min) (hard ? lists.failed : lists.repair).push(name); else lists.passed.push(name); }
function maxRule(name, value, max, lists, hard = false) { if (value > max) (hard ? lists.failed : lists.repair).push(name); else lists.passed.push(name); }
function bandRule(name, value, min, max, lists) { if (value < min || value > max) lists.repair.push(name); else lists.passed.push(name); }

export function buildPhase8NumericDecisionSurface(scores = {}, thresholds = PHASE8_UNIVERSAL_THRESHOLDS, context = {}) {
  const lists = passList();
  const f = scores.feature_vector || {};
  const s = scores.source_retention || {};
  const m = scores.mask_fit || {};
  if (context.claim_ceiling_held === false) lists.failed.push('claim_ceiling'); else lists.passed.push('claim_ceiling');
  if (context.raw_sample_text_included === true) lists.failed.push('raw_sample_text'); else lists.passed.push('raw_sample_text');
  if (context.public_default_allowed === true) lists.failed.push('public_default'); else lists.passed.push('public_default');
  if (context.candidate_required === true && context.candidate_present !== true) lists.failed.push('candidate_present'); else if (context.candidate_required === true) lists.passed.push('candidate_present');
  if (context.source_text_used_as_candidate === true) lists.failed.push('source_candidate_separation'); else if (context.candidate_required === true) lists.passed.push('source_candidate_separation');
  if (context.candidate_required === true && !context.candidate_hash_sha256) lists.failed.push('candidate_hash_sha256'); else if (context.candidate_required === true) lists.passed.push('candidate_hash_sha256');
  if (context.explicit_source_obligation_required === true && context.explicit_source_obligation_present !== true) lists.failed.push('explicit_source_obligation_set'); else if (context.explicit_source_obligation_required === true) lists.passed.push('explicit_source_obligation_set');
  if (context.source_obligation_gate_status === 'blocked' || s.source_obligation_gate_status === 'blocked') lists.failed.push('source_obligation_gate'); else if (context.explicit_source_obligation_required === true || s.explicit_source_obligation_required === true) lists.passed.push('source_obligation_gate');
  minRule('mandatory_anchor_retention', s.mandatory_anchor_retention ?? 0, thresholds.mandatory_anchor_retention, lists, true);
  maxRule('factual_damage_risk', s.factual_damage_risk ?? 0, thresholds.factual_damage_risk_max, lists, true);
  maxRule('sample_seed_phrase_overlap', f.sample_seed_phrase_overlap ?? 0, thresholds.sample_seed_phrase_overlap_max, lists, true);
  maxRule('rare_phrase_reuse', f.rare_phrase_reuse ?? 0, thresholds.rare_phrase_reuse_max, lists, true);
  minRule('source_unit_coverage', s.source_unit_coverage ?? 0, thresholds.source_unit_coverage_min, lists);
  minRule('hedge_retention', s.hedge_retention ?? 0, thresholds.hedge_retention_min, lists);
  minRule('sequence_relation_retention', s.sequence_relation_retention ?? 0, thresholds.sequence_relation_retention_min, lists);
  maxRule('generic_helper_voice_score', f.generic_helper_voice_score ?? 0, thresholds.generic_helper_voice_score_max, lists);
  maxRule('api_sheen_score', f.api_sheen_score ?? 0, thresholds.api_sheen_score_max, lists);
  maxRule('polish_pressure', f.polish_pressure ?? 0, thresholds.polish_pressure_max, lists);
  maxRule('closure_lamination_score', f.closure_lamination_score ?? 0, thresholds.closure_lamination_score_max, lists);
  maxRule('sample_seed_lexical_overlap', f.sample_seed_lexical_overlap ?? 0, thresholds.sample_seed_lexical_overlap_max, lists);
  maxRule('profile_reconstruction_risk', f.profile_reconstruction_risk ?? 0, thresholds.profile_reconstruction_risk_max, lists);
  if (thresholds.private_cadence_exposure_risk_max != null) maxRule('private_cadence_exposure_risk', f.private_cadence_exposure_risk ?? 0, thresholds.private_cadence_exposure_risk_max, lists);
  minRule('mask_breath_score', f.breath_retention_score ?? 0, thresholds.mask_breath_score_min, lists);
  bandRule('bounded_irregularity_index', f.bounded_irregularity_index ?? 0, thresholds.bounded_irregularity_index_min, thresholds.bounded_irregularity_index_max, lists);
  minRule('rhythm_asymmetry_score', f.rhythm_asymmetry_score ?? 0, thresholds.rhythm_asymmetry_score_min, lists);
  bandRule('imperfection_budget_used', f.imperfection_budget_used ?? 0, thresholds.imperfection_budget_used_min, thresholds.imperfection_budget_used_max, lists);
  minRule('nonuniformity_without_damage', f.nonuniformity_without_damage ?? 0, thresholds.nonuniformity_without_damage_min, lists);
  maxRule('mask_centroid_distance', m.mask_centroid_distance ?? 1, thresholds.mask_centroid_distance_max, lists);
  minRule('mask_family_fit', m.mask_family_fit ?? 0, thresholds.mask_family_fit_min, lists);
  minRule('role_behavior_fit', m.role_behavior_fit ?? 0, thresholds.role_behavior_fit_min, lists);
  minRule('generic_ai_baseline_distance', m.generic_ai_baseline_distance ?? 0, thresholds.generic_ai_baseline_distance_min, lists);
  if (thresholds.abbreviation_rate_min != null) minRule('abbreviation_rate_min', f.abbreviation_rate ?? 0, thresholds.abbreviation_rate_min, lists);
  if (thresholds.abbreviation_rate_max != null) maxRule('abbreviation_rate_max', f.abbreviation_rate ?? 0, thresholds.abbreviation_rate_max, lists);
  if (thresholds.compression_loss_rate_max != null) maxRule('compression_loss_rate', s.compression_loss_rate ?? 0, thresholds.compression_loss_rate_max, lists);
  if (thresholds.slash_usage_rate_max != null) maxRule('slash_usage_rate', f.slash_usage_rate ?? 0, thresholds.slash_usage_rate_max, lists);
  if (thresholds.plus_usage_rate_max != null) maxRule('plus_usage_rate', f.plus_usage_rate ?? 0, thresholds.plus_usage_rate_max, lists);
  if (thresholds.mascot_phrase_rate_max != null) maxRule('mascot_phrase_rate', f.mascot_phrase_rate ?? 0, thresholds.mascot_phrase_rate_max, lists, true);
  if (thresholds.relational_proximity_score_min != null) minRule('relational_proximity_score', f.relational_proximity_score ?? 0, thresholds.relational_proximity_score_min, lists);
  if (thresholds.relational_proximity_score_max != null) maxRule('relational_proximity_score', f.relational_proximity_score ?? 0, thresholds.relational_proximity_score_max, lists);
  if (thresholds.invented_intimacy_risk_max != null) maxRule('invented_intimacy_risk', f.invented_intimacy_risk ?? 0, thresholds.invented_intimacy_risk_max, lists, true);
  if (thresholds.unsupported_care_marker_rate_max != null) maxRule('unsupported_care_marker_rate', f.unsupported_care_marker_rate ?? 0, thresholds.unsupported_care_marker_rate_max, lists);
  if (thresholds.fake_support_group_voice_score_max != null) maxRule('fake_support_group_voice_score', f.fake_support_group_voice_score ?? 0, thresholds.fake_support_group_voice_score_max, lists, true);
  if (thresholds.emotional_overreach_score_max != null) maxRule('emotional_overreach_score', f.emotional_overreach_score ?? 0, thresholds.emotional_overreach_score_max, lists);
  if (thresholds.social_belonging_leakage_score_max != null) maxRule('social_belonging_leakage_score', f.social_belonging_leakage_score ?? 0, thresholds.social_belonging_leakage_score_max, lists, true);
  if (thresholds.thread_findable_crutch_rate_max != null) maxRule('thread_findable_crutch_rate', f.thread_findable_crutch_rate ?? 0, thresholds.thread_findable_crutch_rate_max, lists);
  if (thresholds.inside_room_reference_rate_max != null) maxRule('inside_room_reference_rate', f.inside_room_reference_rate ?? 0, thresholds.inside_room_reference_rate_max, lists, true);
  if (thresholds.unnecessary_audience_marker_rate_max != null) maxRule('unnecessary_audience_marker_rate', f.unnecessary_audience_marker_rate ?? 0, thresholds.unnecessary_audience_marker_rate_max, lists);
  if (thresholds.bulletin_board_tone_score_max != null) maxRule('bulletin_board_tone_score', f.bulletin_board_tone_score ?? 0, thresholds.bulletin_board_tone_score_max, lists);
  if (thresholds.low_drama_pressure_score_min != null) minRule('low_drama_pressure_score', f.low_drama_pressure_score ?? 0, thresholds.low_drama_pressure_score_min, lists);
  if (thresholds.fact_pressure_preservation_min != null) minRule('fact_pressure_preservation', f.fact_pressure_preservation ?? s.source_unit_coverage ?? 0, thresholds.fact_pressure_preservation_min, lists);
  if (thresholds.escalation_temperature_max != null) maxRule('escalation_temperature', f.escalation_temperature ?? 0, thresholds.escalation_temperature_max, lists);
  if (thresholds.warmth_to_custody_ratio_min != null || thresholds.warmth_to_custody_ratio_max != null) bandRule('warmth_to_custody_ratio', f.warmth_to_custody_ratio ?? 0, thresholds.warmth_to_custody_ratio_min ?? 0, thresholds.warmth_to_custody_ratio_max ?? 1, lists);
  const status = lists.failed.length ? 'blocked' : lists.repair.length ? 'repair_required' : 'pass';
  return Object.freeze({ schema: HUSH_NUMERIC_DECISION_SURFACE_SCHEMA, status, passed_thresholds: Object.freeze(lists.passed), failed_thresholds: Object.freeze(lists.failed), repair_thresholds: Object.freeze(lists.repair), block_reasons: Object.freeze(lists.failed), threshold_version: context.threshold_version || 'phase8-hard-metric-passport/v1' });
}
