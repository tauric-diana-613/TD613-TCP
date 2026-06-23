import assert from 'node:assert/strict';
import { buildPhase8NumericDecisionSurface, PHASE8_UNIVERSAL_THRESHOLDS } from '../app/engine/hush-phase8-numeric-decision.js';

const passScores = {
  feature_vector: {
    generic_helper_voice_score: 0.03,
    api_sheen_score: 0.04,
    polish_pressure: 0.05,
    closure_lamination_score: 0.02,
    sample_seed_lexical_overlap: 0,
    sample_seed_phrase_overlap: 0,
    rare_phrase_reuse: 0,
    profile_reconstruction_risk: 0.01,
    breath_retention_score: 0.8,
    bounded_irregularity_index: 0.44,
    rhythm_asymmetry_score: 0.32,
    imperfection_budget_used: 0.42,
    nonuniformity_without_damage: 0.98
  },
  source_retention: {
    mandatory_anchor_retention: 1,
    source_unit_coverage: 0.95,
    hedge_retention: 0.95,
    sequence_relation_retention: 0.9,
    factual_damage_risk: 0.01,
    compression_loss_rate: 0.02
  },
  mask_fit: {
    mask_centroid_distance: 0.2,
    mask_family_fit: 0.8,
    role_behavior_fit: 0.84,
    generic_ai_baseline_distance: 0.45
  }
};

const pass = buildPhase8NumericDecisionSurface(passScores, PHASE8_UNIVERSAL_THRESHOLDS, { claim_ceiling_held: true, raw_sample_text_included: false, public_default_allowed: false });
assert.equal(pass.status, 'pass');
assert.ok(pass.passed_thresholds.includes('mandatory_anchor_retention'));

const repair = buildPhase8NumericDecisionSurface({ ...passScores, feature_vector: { ...passScores.feature_vector, api_sheen_score: 0.5 } }, PHASE8_UNIVERSAL_THRESHOLDS, { claim_ceiling_held: true, raw_sample_text_included: false, public_default_allowed: false });
assert.equal(repair.status, 'repair_required');
assert.ok(repair.repair_thresholds.includes('api_sheen_score'));

const blocked = buildPhase8NumericDecisionSurface({ ...passScores, source_retention: { ...passScores.source_retention, mandatory_anchor_retention: 0.5 } }, PHASE8_UNIVERSAL_THRESHOLDS, { claim_ceiling_held: true, raw_sample_text_included: false, public_default_allowed: false });
assert.equal(blocked.status, 'blocked');
assert.ok(blocked.failed_thresholds.includes('mandatory_anchor_retention'));

const blockedRelease = buildPhase8NumericDecisionSurface(passScores, PHASE8_UNIVERSAL_THRESHOLDS, { claim_ceiling_held: true, raw_sample_text_included: false, public_default_allowed: true });
assert.equal(blockedRelease.status, 'blocked');
assert.ok(blockedRelease.failed_thresholds.includes('public_default'));

console.log('hush-phase8-hard-metric-gate: ok');
