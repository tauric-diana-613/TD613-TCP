import { stableStringify, sha256Text } from './hush-customizer-packet.js';
import { HUSH_MASK_CENTROID_SCHEMA } from './hush-stylometric-feature-vector.js';

export const BLOOPING_BLIP_METRIC_PROFILE_SCHEMA = 'td613.hush.phase8.blooping-blip-metrics/v1';

export const BLOOPING_BLIP_CADENCE_HEATMAP = Object.freeze({
  chatDistortion: Object.freeze({ min: 0.0, max: 0.2 }),
  technicalTerm: Object.freeze({ min: 0.2, max: 0.45 }),
  sourceAnchors: Object.freeze({ min: 0.45, max: 0.75 }),
  gravityClose: Object.freeze({ min: 0.75, max: 1 }),
  expectedContour: 'hyperchat-custody-semantic-compression',
  forbiddenContours: Object.freeze(['glitch-compression-only', 'generic-youth-overlay', 'brainrot-without-custody', 'academic-cadence-untransformed', 'one-perturbation-immediate-receipt', 'source-shadow-displaced-fingerprint'])
});

export const BLOOPING_BLIP_THRESHOLDS = Object.freeze({
  mandatory_anchor_retention: 1,
  source_unit_coverage_min: 0.88,
  factual_damage_risk_max: 0.05,
  rare_phrase_reuse_max: 0.05,
  closure_lamination_score_max: 0.28,
  mask_breath_score_min: 0.45,
  bounded_irregularity_index_min: 0,
  bounded_irregularity_index_max: 0.82,
  rhythm_asymmetry_score_min: 0,
  imperfection_budget_used_min: 0,
  imperfection_budget_used_max: 0.86,
  nonuniformity_without_damage_min: 0.35,
  mask_centroid_distance_max: 0.85,
  mask_family_fit_min: 0.2,
  role_behavior_fit_min: 0.25,
  generic_ai_baseline_distance_min: 0,
  hyperchat_distortion_score_min: 0.42,
  hyperchat_distortion_score_max: 0.92,
  casual_syntax_intensity_min: 0.3,
  future_slang_density_min: 0.08,
  future_slang_density_max: 0.6,
  stream_consciousness_score_min: 0.1,
  stream_consciousness_score_max: 0.7,
  grammar_collapse_without_damage_min: 0.68,
  technical_nomenclature_retention_min: 0.72,
  high_register_concept_retention_min: 0.72,
  epistemic_term_retention_min: 0.68,
  semiotic_term_retention_min: 0.6,
  custody_term_retention_min: 0.76,
  conceptual_skeleton_retention_min: 0.76,
  emotional_gravity_retention_min: 0.68,
  stakes_preservation_score_min: 0.68,
  joke_pressure_score_max: 0.32,
  gravity_to_joke_ratio_min: 1.8,
  seriousness_under_casual_surface_min: 0.68,
  custody_bundle_visibility_min: 0.76,
  anchor_density_per_token_min: 0.06,
  event_relation_retention_min: 0.72,
  claim_scope_retention_min: 0.68,
  fake_chatspeak_overlay_score_max: 0.14,
  meme_slop_score_max: 0.22,
  brainrot_without_custody_score_max: 0.08,
  generic_ai_skeleton_score_max: 0.1,
  forced_youth_register_risk_max: 0.08,
  source_idiolect_retention_max: 0.34,
  academic_cadence_retention_max: 0.28,
  private_cadence_exposure_risk_max: 0.14,
  function_word_signature_similarity_max: 0.78,
  punctuation_fingerprint_retention_max: 0.78,
  source_ngram_overlap_rate_max: 0.18,
  pixie_leakage_score_max: 0.22,
  zora_leakage_score_max: 0.18,
  rex_leakage_score_max: 0.16,
  queenie_leakage_score_max: 0.14,
  cryo_leakage_score_max: 0.14,
  nolan_leakage_score_max: 0.14,
  sol_leakage_score_max: 0.12,
  generic_helper_voice_score_max: 0.08,
  api_sheen_score_max: 0.1,
  polish_pressure_max: 0.12,
  sample_seed_phrase_overlap_max: 0,
  sample_seed_lexical_overlap_max: 0.08,
  profile_reconstruction_risk_max: 0.12,
  public_default_allowed: false
});

const CASUAL_MARKERS = ['ok', 'lol', 'ngl', 'idk', 'pls', 'like', 'tho', 'basically', 'yeah', 'combo', 'bundle', 'soup'];
const FUTURE_SLANG_MARKERS = ['proof goblin', 'load-bearing', 'object-cluster', 'doing numbers', 'de-threaded', 'smoothed into soup', 'custody constellation', 'record-world', 'combo'];
const TECHNICAL_MARKERS = ['epistemic', 'semiotic', 'custody', 'bundle', 'source obligation', 'register', 'metadata', 'admissibility', 'variance', 'anchor', 'evidentiary', 'conceptual', 'claim'];
const EPISTEMIC_MARKERS = ['epistemic', 'not proof', 'not final-proof', 'not saying', 'narrower', 'may', 'if', 'not whether', 'scope'];
const SEMIOTIC_MARKERS = ['semiotic', 'payload', 'meaning', 'conceptual', 'load-bearing', 'object-cluster'];
const CUSTODY_MARKERS = ['custody', 'bundle', 'keep', 'together', 'de-threaded', 'attached', 'constellation', 'object-cluster'];
const ANCHOR_MARKERS = ['FILE-72', '6/18', '6-18', 'WJCT label', 'footer mismatch', 'export date'];
const JOKE_MARKERS = ['lol', 'lmao', 'goblin', 'yeet', 'silly', 'vibes', 'weird little', 'omg'];
const BRAINROT_MARKERS = ['skibidi', 'rizz', 'bussin', 'periodt', 'slayyy', 'yeet', 'fr', 'goblin stuff'];
const FAKE_CHAT_MARKERS = ['hey bestie', 'bestie', 'periodt', 'slay', 'accordingly lol', 'should be preserved accordingly'];
const GENERIC_MARKERS = ['should be preserved accordingly', 'clear and concise', 'professional', 'relevant', 'overall', 'it is important'];
const ACADEMIC_MARKERS = ['the epistemic issue concerns', 'conclusively proves', 'the important point is', 'formed by', 'should not be separated', 'contains'];
const PIXIE_MARKERS = ['idk timestamp', 'mismatch still visible', 'still visible tho'];
const REGISTER_REPLACEMENT_MARKERS = ['girl', 'hey love', 'everyone here', 'doing too much'];
const SOL_MARKERS = ['remains', 'points to', 'where it was placed'];
const QUEENIE_MARKERS = ['keep this one close', 'doing more work than it looks like'];
const REX_MARKERS = ['//', 'not typo', 'not clean-error'];
const CRYO_MARKERS = ['attached', 'sent', 'label too'];
const NOLAN_MARKERS = ['convenient', 'tidy', 'odd little'];
const FUNCTION_WORDS = ['the', 'and', 'but', 'so', 'because', 'that', 'it', 'to', 'with', 'this', 'not', 'is'];

function text(value) { return String(value || ''); }
function lower(value) { return text(value).toLowerCase(); }
function tokens(value) { return text(value).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []; }
function sentences(value) { return text(value).split(/[.!?\n:]+/u).map((part) => part.trim()).filter(Boolean); }
function clamp(value) { return Math.max(0, Math.min(1, Number((Number(value) || 0).toFixed(4)))); }
function rate(n, d) { return clamp(d ? n / d : 0); }
function phraseHits(phrases, value) { const v = lower(value); return phrases.filter((phrase) => v.includes(String(phrase).toLowerCase())).length; }
function unique(values) { return [...new Set(values.filter(Boolean))]; }
function addMetricRule(lists, name, passed) { (passed ? lists.passed : lists.repair).push(name); }
function addHardRule(lists, name, passed) { (passed ? lists.passed : lists.failed).push(name); }
function functionProfile(value = '') {
  const tokenList = tokens(value).map((item) => item.toLowerCase());
  const denom = Math.max(tokenList.length, 1);
  return Object.fromEntries(FUNCTION_WORDS.map((word) => [word, rate(tokenList.filter((token) => token === word).length, denom)]));
}
function functionSimilarity(source = '', candidate = '') {
  const s = functionProfile(source);
  const c = functionProfile(candidate);
  const delta = FUNCTION_WORDS.reduce((sum, word) => sum + Math.abs((s[word] || 0) - (c[word] || 0)), 0);
  return clamp(1 - delta * 2.8);
}
function punctuationRetention(source = '', candidate = '') {
  const s = (text(source).match(/[,:;.!?\n]/g) || []).length;
  const c = (text(candidate).match(/[,:;.!?\n]/g) || []).length;
  return clamp(1 - Math.abs(s - c) / Math.max(s + c, 1));
}
function ngramOverlap(source = '', candidate = '') {
  const list = tokens(source).map((item) => item.toLowerCase()).filter((item) => !['file', '72', 'wjct', 'label', 'footer', 'mismatch', 'custody'].includes(item));
  const ngrams = [];
  for (let i = 0; i <= list.length - 4; i += 1) ngrams.push(list.slice(i, i + 4).join(' '));
  const uniqueNgrams = unique(ngrams);
  if (!uniqueNgrams.length) return 0;
  const v = lower(candidate);
  return rate(uniqueNgrams.filter((ngram) => v.includes(ngram)).length, uniqueNgrams.length);
}

export function isBloopingBlipRecord(maskRecord = {}) {
  return maskRecord.mask_id === 'burner-minimal' || maskRecord.gallery_role === 'hyperchat_custody' || maskRecord.intended_role === 'hyperchat_custody' || maskRecord.family === 'low signature';
}

export async function buildBloopingBlipCentroid(maskRecord = {}, calibrationSamples = []) {
  const centroid = Object.freeze({
    mean_sentence_length: 10.5,
    sentence_length_cv: 0.72,
    lexical_density: 0.68,
    hedge_marker_rate: 0.04,
    abbreviation_rate: 0.16,
    generic_helper_voice_score: 0.02,
    api_sheen_score: 0.02,
    bounded_irregularity_index: 0.7,
    breath_retention_score: 0.54,
    hyperchat_distortion_score: 0.74,
    technical_nomenclature_retention: 0.84,
    emotional_gravity_retention: 0.76,
    grammar_collapse_without_damage: 0.78
  });
  return Object.freeze({ schema: HUSH_MASK_CENTROID_SCHEMA, mask_id: maskRecord.mask_id || null, role: 'hyperchat_custody', centroid_features: centroid, calibration_sample_count: calibrationSamples.length, centroid_hash_sha256: await sha256Text(stableStringify(centroid)) });
}

export function computeBloopingBlipFeatureMetrics(candidate = '', options = {}) {
  const value = text(candidate);
  const source = text(options.sourceText || options.source_summary || '');
  const tokenList = tokens(value);
  const tokenCount = Math.max(tokenList.length, 1);
  const sentenceCount = Math.max(sentences(value).length, 1);
  const casualHits = phraseHits(CASUAL_MARKERS, value);
  const futureHits = phraseHits(FUTURE_SLANG_MARKERS, value);
  const technicalHits = phraseHits(TECHNICAL_MARKERS, value);
  const epistemicHits = phraseHits(EPISTEMIC_MARKERS, value);
  const semioticHits = phraseHits(SEMIOTIC_MARKERS, value);
  const custodyHits = phraseHits(CUSTODY_MARKERS, value);
  const anchorHits = phraseHits(ANCHOR_MARKERS, value);
  const jokeHits = phraseHits(JOKE_MARKERS, value);
  const brainrotHits = phraseHits(BRAINROT_MARKERS, value);
  const fakeChatHits = phraseHits(FAKE_CHAT_MARKERS, value);
  const genericHits = phraseHits(GENERIC_MARKERS, value);
  const academicHits = phraseHits(ACADEMIC_MARKERS, value);
  const sourceRequiresEpistemic = phraseHits(EPISTEMIC_MARKERS, source) || lower(source).includes('epistemic issue');
  const sourceRequiresSemiotic = phraseHits(SEMIOTIC_MARKERS, source);
  const sourceRequiresCustody = phraseHits(CUSTODY_MARKERS, source) || lower(source).includes('custody bundle');
  const anchorDensity = rate(anchorHits, tokenCount);
  const custodyBundleVisibility = clamp(anchorHits * 0.12 + custodyHits * 0.16 + (lower(value).includes('custody bundle') ? 0.22 : 0));
  const technicalRetention = clamp(technicalHits * 0.13 + (sourceRequiresEpistemic && epistemicHits ? 0.18 : 0) + (sourceRequiresSemiotic && semioticHits ? 0.16 : 0) + (sourceRequiresCustody && custodyHits ? 0.18 : 0));
  const conceptualSkeleton = clamp(technicalRetention * 0.42 + custodyBundleVisibility * 0.36 + (epistemicHits ? 0.12 : 0) + (anchorHits >= 4 ? 0.1 : 0));
  const jokePressure = clamp(jokeHits * 0.08 + brainrotHits * 0.12);
  const gravity = clamp(custodyBundleVisibility * 0.42 + technicalRetention * 0.28 + (lower(value).includes('not final-proof') || lower(value).includes('not “proof') || lower(value).includes('not "proof') ? 0.16 : 0) + (jokePressure < 0.25 ? 0.14 : 0));
  const hyperchat = clamp(casualHits * 0.08 + futureHits * 0.14 + (value.includes('\n') ? 0.12 : 0) + (value.includes('+') || value.includes('/') ? 0.08 : 0) + (technicalRetention > 0.5 ? 0.1 : 0));
  const casualSyntax = clamp(casualHits * 0.09 + (text(value).match(/\n/g) || []).length * 0.05 + (/[a-z]/u.test(value[0] || '') ? 0.08 : 0));
  const stream = clamp(sentenceCount > 2 ? 0.28 : 0.12 + (text(value).match(/\n/g) || []).length * 0.08 + (lower(value).includes('like') ? 0.12 : 0));
  const grammarNoDamage = clamp(hyperchat * 0.34 + custodyBundleVisibility * 0.42 + technicalRetention * 0.24);
  const fakeOverlay = clamp(fakeChatHits * 0.22 + (fakeChatHits && genericHits ? 0.18 : 0));
  const memeSlop = clamp(brainrotHits * 0.15 + Math.max(0, jokePressure - custodyBundleVisibility) * 0.44);
  const brainrotNoCustody = clamp(brainrotHits * 0.2 + (custodyBundleVisibility < 0.4 && jokeHits ? 0.5 : 0));
  const genericSkeleton = clamp(genericHits * 0.16 + fakeOverlay * 0.24);
  const youthRisk = clamp(phraseHits(['skibidi', 'rizz', 'bussin', 'periodt', 'slayyy'], value) * 0.3 + fakeChatHits * 0.08);
  const academicCadence = clamp(academicHits * 0.18 + (hyperchat < 0.4 ? 0.18 : 0));
  return Object.freeze({
    schema: BLOOPING_BLIP_METRIC_PROFILE_SCHEMA,
    hyperchat_distortion_score: hyperchat,
    casual_syntax_intensity: casualSyntax,
    future_slang_density: clamp(futureHits * 0.16 + casualHits * 0.025),
    stream_consciousness_score: stream,
    grammar_collapse_without_damage: grammarNoDamage,
    technical_nomenclature_retention: technicalRetention,
    high_register_concept_retention: conceptualSkeleton,
    epistemic_term_retention: sourceRequiresEpistemic ? clamp(epistemicHits * 0.38 + (lower(value).includes('not proof') || lower(value).includes('not final-proof') ? 0.28 : 0)) : 1,
    semiotic_term_retention: sourceRequiresSemiotic ? clamp(semioticHits * 0.4 + technicalRetention * 0.24) : 1,
    custody_term_retention: sourceRequiresCustody ? clamp(custodyHits * 0.24 + custodyBundleVisibility * 0.42) : custodyBundleVisibility,
    conceptual_skeleton_retention: conceptualSkeleton,
    emotional_gravity_retention: gravity,
    stakes_preservation_score: gravity,
    joke_pressure_score: jokePressure,
    gravity_to_joke_ratio: jokePressure ? Math.min(10, Number((gravity / jokePressure).toFixed(2))) : 10,
    seriousness_under_casual_surface: gravity,
    custody_bundle_visibility: custodyBundleVisibility,
    anchor_density_per_token: anchorDensity,
    event_relation_retention: clamp(custodyBundleVisibility * 0.66 + conceptualSkeleton * 0.34),
    claim_scope_retention: clamp((epistemicHits ? 0.56 : 0.2) + (lower(value).includes('not') ? 0.22 : 0) + conceptualSkeleton * 0.22),
    fake_chatspeak_overlay_score: fakeOverlay,
    meme_slop_score: memeSlop,
    brainrot_without_custody_score: brainrotNoCustody,
    generic_ai_skeleton_score: genericSkeleton,
    forced_youth_register_risk: youthRisk,
    source_idiolect_retention: clamp(ngramOverlap(source, value) * 0.6 + functionSimilarity(source, value) * 0.16),
    academic_cadence_retention: academicCadence,
    function_word_signature_similarity: functionSimilarity(source, value),
    punctuation_fingerprint_retention: punctuationRetention(source, value),
    source_ngram_overlap_rate: ngramOverlap(source, value),
    pixie_leakage_score: clamp(phraseHits(PIXIE_MARKERS, value) * 0.28 + (technicalRetention < 0.5 && lower(value).includes('idk') ? 0.18 : 0)),
    zora_leakage_score: clamp(phraseHits(['i’m keeping this narrow', 'uncertainty should stay'], value) * 0.18),
    rex_leakage_score: clamp(phraseHits(REX_MARKERS, value) * 0.18),
    queenie_leakage_score: clamp(phraseHits(QUEENIE_MARKERS, value) * 0.2),
    cryo_leakage_score: clamp(phraseHits(CRYO_MARKERS, value) * 0.16),
    nolan_leakage_score: clamp(phraseHits(NOLAN_MARKERS, value) * 0.18),
    sol_leakage_score: clamp(phraseHits(SOL_MARKERS, value) * 0.16),
    target_register_leakage_score: clamp(phraseHits(REGISTER_REPLACEMENT_MARKERS, value) * 0.18),
    under_preservation_risk: custodyBundleVisibility < 0.4 ? 1 : 0,
    cadence_heatmap_contour: 'hyperchat-custody-semantic-compression'
  });
}

export function applyBloopingBlipDecisionRules(decision = {}, featureVector = {}, thresholds = BLOOPING_BLIP_THRESHOLDS) {
  const lists = { passed: [...(decision.passed_thresholds || [])], failed: [...(decision.failed_thresholds || [])], repair: [...(decision.repair_thresholds || [])] };
  const f = featureVector || {};
  addMetricRule(lists, 'hyperchat_distortion_score', (f.hyperchat_distortion_score ?? 0) >= thresholds.hyperchat_distortion_score_min && (f.hyperchat_distortion_score ?? 0) <= thresholds.hyperchat_distortion_score_max);
  addMetricRule(lists, 'casual_syntax_intensity', (f.casual_syntax_intensity ?? 0) >= thresholds.casual_syntax_intensity_min);
  addMetricRule(lists, 'future_slang_density', (f.future_slang_density ?? 0) >= thresholds.future_slang_density_min && (f.future_slang_density ?? 0) <= thresholds.future_slang_density_max);
  addMetricRule(lists, 'stream_consciousness_score', (f.stream_consciousness_score ?? 0) >= thresholds.stream_consciousness_score_min && (f.stream_consciousness_score ?? 0) <= thresholds.stream_consciousness_score_max);
  addMetricRule(lists, 'grammar_collapse_without_damage', (f.grammar_collapse_without_damage ?? 0) >= thresholds.grammar_collapse_without_damage_min);
  addMetricRule(lists, 'technical_nomenclature_retention', (f.technical_nomenclature_retention ?? 0) >= thresholds.technical_nomenclature_retention_min);
  addMetricRule(lists, 'high_register_concept_retention', (f.high_register_concept_retention ?? 0) >= thresholds.high_register_concept_retention_min);
  addMetricRule(lists, 'epistemic_term_retention', (f.epistemic_term_retention ?? 0) >= thresholds.epistemic_term_retention_min);
  addMetricRule(lists, 'semiotic_term_retention', (f.semiotic_term_retention ?? 0) >= thresholds.semiotic_term_retention_min);
  addMetricRule(lists, 'custody_term_retention', (f.custody_term_retention ?? 0) >= thresholds.custody_term_retention_min);
  addMetricRule(lists, 'conceptual_skeleton_retention', (f.conceptual_skeleton_retention ?? 0) >= thresholds.conceptual_skeleton_retention_min);
  addMetricRule(lists, 'emotional_gravity_retention', (f.emotional_gravity_retention ?? 0) >= thresholds.emotional_gravity_retention_min);
  addMetricRule(lists, 'stakes_preservation_score', (f.stakes_preservation_score ?? 0) >= thresholds.stakes_preservation_score_min);
  addHardRule(lists, 'joke_pressure_score', (f.joke_pressure_score ?? 0) <= thresholds.joke_pressure_score_max);
  addMetricRule(lists, 'gravity_to_joke_ratio', (f.gravity_to_joke_ratio ?? 0) >= thresholds.gravity_to_joke_ratio_min);
  addMetricRule(lists, 'seriousness_under_casual_surface', (f.seriousness_under_casual_surface ?? 0) >= thresholds.seriousness_under_casual_surface_min);
  addMetricRule(lists, 'custody_bundle_visibility', (f.custody_bundle_visibility ?? 0) >= thresholds.custody_bundle_visibility_min);
  addMetricRule(lists, 'anchor_density_per_token', (f.anchor_density_per_token ?? 0) >= thresholds.anchor_density_per_token_min);
  addMetricRule(lists, 'event_relation_retention', (f.event_relation_retention ?? 0) >= thresholds.event_relation_retention_min);
  addMetricRule(lists, 'claim_scope_retention', (f.claim_scope_retention ?? 0) >= thresholds.claim_scope_retention_min);
  addMetricRule(lists, 'fake_chatspeak_overlay_score', (f.fake_chatspeak_overlay_score ?? 0) <= thresholds.fake_chatspeak_overlay_score_max);
  addMetricRule(lists, 'meme_slop_score', (f.meme_slop_score ?? 0) <= thresholds.meme_slop_score_max);
  addHardRule(lists, 'brainrot_without_custody_score', (f.brainrot_without_custody_score ?? 0) <= thresholds.brainrot_without_custody_score_max);
  addMetricRule(lists, 'generic_ai_skeleton_score', (f.generic_ai_skeleton_score ?? 0) <= thresholds.generic_ai_skeleton_score_max);
  addHardRule(lists, 'forced_youth_register_risk', (f.forced_youth_register_risk ?? 0) <= thresholds.forced_youth_register_risk_max);
  addMetricRule(lists, 'source_idiolect_retention', (f.source_idiolect_retention ?? 0) <= thresholds.source_idiolect_retention_max);
  addMetricRule(lists, 'academic_cadence_retention', (f.academic_cadence_retention ?? 0) <= thresholds.academic_cadence_retention_max);
  addMetricRule(lists, 'function_word_signature_similarity', (f.function_word_signature_similarity ?? 0) <= thresholds.function_word_signature_similarity_max);
  addMetricRule(lists, 'punctuation_fingerprint_retention', (f.punctuation_fingerprint_retention ?? 0) <= thresholds.punctuation_fingerprint_retention_max);
  addMetricRule(lists, 'source_ngram_overlap_rate', (f.source_ngram_overlap_rate ?? 0) <= thresholds.source_ngram_overlap_rate_max);
  addMetricRule(lists, 'pixie_leakage_score', (f.pixie_leakage_score ?? 0) <= thresholds.pixie_leakage_score_max);
  addMetricRule(lists, 'zora_leakage_score', (f.zora_leakage_score ?? 0) <= thresholds.zora_leakage_score_max);
  addMetricRule(lists, 'rex_leakage_score', (f.rex_leakage_score ?? 0) <= thresholds.rex_leakage_score_max);
  addMetricRule(lists, 'queenie_leakage_score', (f.queenie_leakage_score ?? 0) <= thresholds.queenie_leakage_score_max);
  addMetricRule(lists, 'cryo_leakage_score', (f.cryo_leakage_score ?? 0) <= thresholds.cryo_leakage_score_max);
  addMetricRule(lists, 'nolan_leakage_score', (f.nolan_leakage_score ?? 0) <= thresholds.nolan_leakage_score_max);
  addMetricRule(lists, 'sol_leakage_score', (f.sol_leakage_score ?? 0) <= thresholds.sol_leakage_score_max);
  addHardRule(lists, 'target_register_leakage_score', (f.target_register_leakage_score ?? 0) <= 0.08);
  addHardRule(lists, 'under_preservation_risk', (f.under_preservation_risk ?? 0) <= 0);
  const status = lists.failed.length ? 'blocked' : lists.repair.length ? 'repair_required' : 'pass';
  return Object.freeze({ ...decision, status, passed_thresholds: Object.freeze(unique(lists.passed)), failed_thresholds: Object.freeze(unique(lists.failed)), repair_thresholds: Object.freeze(unique(lists.repair)), block_reasons: Object.freeze(unique(lists.failed)) });
}
