import { stableStringify, sha256Text } from './hush-customizer-packet.js';
import { HUSH_MASK_CENTROID_SCHEMA } from './hush-stylometric-feature-vector.js';

export const LULU_QUASAR_METRIC_PROFILE_SCHEMA = 'td613.hush.phase8.lulu-quasar-metrics/v1';

export const LULU_QUASAR_CADENCE_HEATMAP = Object.freeze({
  reliefEntry: Object.freeze({ min: 0, max: 0.25 }),
  playfulDeflection: Object.freeze({ min: 0.18, max: 0.45 }),
  anchorReturn: Object.freeze({ min: 0.35, max: 0.65 }),
  custodyClose: Object.freeze({ min: 0.62, max: 0.9 }),
  gravityClose: Object.freeze({ min: 0.82, max: 1 }),
  expectedContour: 'blue-orange-relief-custody-return',
  reviewMode: 'quirk_fingerprint_review_required',
  forbiddenContours: Object.freeze(['hyperchat-custody-semantic-compression', 'low-heat-edge-receipt-return', 'cold-ledger-mild-haunt', 'source-shadow-displaced-fingerprint', 'warm-envelope-hard-latch', 'adversarial-fracture-shard'])
});

export const LULU_QUASAR_THRESHOLDS = Object.freeze({
  mandatory_anchor_retention: 1,
  source_unit_coverage_min: 0.9,
  factual_damage_risk_max: 0.05,
  blue_orange_syntax_score_min: 0.46,
  blue_orange_syntax_score_max: 0.84,
  bizarre_relief_score_min: 0.34,
  bizarre_relief_score_max: 0.76,
  playful_deflection_score_min: 0.32,
  playful_deflection_score_max: 0.68,
  alien_pragmatics_score_min: 0.36,
  cheerful_uncanny_score_min: 0.3,
  anchor_return_latency_max: 0.6,
  custody_bundle_visibility_min: 0.82,
  custody_after_quirk_score_min: 0.76,
  relationship_retention_score_min: 0.76,
  emotional_gravity_retention_min: 0.72,
  stakes_preservation_score_min: 0.7,
  gravity_under_comedy_score_min: 0.7,
  joke_pressure_score_max: 0.34,
  gravity_to_joke_ratio_min: 1.65,
  odd_image_count_min: 1,
  odd_image_count_max: 1,
  repeated_image_risk_max: 0,
  image_family_reuse_score_max: 0.06,
  mascot_phrase_rate_max: 0,
  invented_prop_count_max: 1,
  invented_prop_risk_max: 0.12,
  quirk_fingerprint_risk_max: 0.14,
  semantic_drift_score_max: 0.12,
  blue_orange_mush_risk_max: 0.1,
  logic_traceability_score_min: 0.74,
  claim_scope_retention_min: 0.78,
  event_relation_retention_min: 0.76,
  technical_detail_retention_min: 0.72,
  alien_costume_risk_max: 0.08,
  broken_english_parody_risk_max: 0,
  xenoglossic_mockery_risk_max: 0,
  generic_quirky_girl_voice_score_max: 0.12,
  forced_whimsy_score_max: 0.16,
  source_idiolect_retention_max: 0.2,
  source_ngram_overlap_rate_max: 0.18,
  rare_phrase_reuse_rate_max: 0.04,
  function_word_signature_similarity_max: 0.44,
  punctuation_fingerprint_retention_max: 0.24,
  private_cadence_exposure_risk_max: 0.14,
  blip_leakage_score_max: 0.16,
  pixie_leakage_score_max: 0.14,
  nolan_leakage_score_max: 0.16,
  sol_leakage_score_max: 0.12,
  zora_leakage_score_max: 0.16,
  queenie_leakage_score_max: 0.16,
  rex_leakage_score_max: 0.12,
  sheree_leakage_score_max: 0.12,
  generic_helper_voice_score_max: 0.1,
  api_sheen_score_max: 0.1,
  polish_pressure_max: 0.14,
  sample_seed_phrase_overlap_max: 0,
  sample_seed_lexical_overlap_max: 0.08,
  profile_reconstruction_risk_max: 0.12,
  public_default_allowed: false
});

const DEFAULT_ANCHORS = ['FILE-72', '6/18', 'WJCT label', 'footer mismatch'];
const RELIEF_TERMS = ['comet', 'bird', 'moon', 'canoe', 'soup', 'violin', 'clipboard', 'shoes', 'earth furniture', 'tiny', 'hat'];
const RELIEF_PHRASES = ['paperwork comet', 'clipboard bird', 'wrong moon', 'evidence canoe', 'soup-violin', 'earth furniture', 'tiny moon clipboard', 'clown shoes'];
const PROP_TERMS = ['comet', 'bird', 'moon', 'canoe', 'soup', 'violin', 'spoon', 'octopus', 'cloud', 'hamster', 'glitter', 'clipboard'];
const REPEATED_FAMILIES = ['paperwork comet', 'comet', 'clipboard', 'canoe', 'moon'];
const RELATION_TERMS = ['relationship', 'fields', 'cargo', 'bundle', 'attached', 'together', 'separate', 'custody', 'same'];
const TECH_TERMS = ['file', 'export date', 'label', 'footer mismatch', 'custody bundle', 'record', 'fields'];
const JOKE_TERMS = ['lol', 'funny', 'clown', 'silly', 'weird', 'decorative', 'unusual', 'rude'];
const PARODY_PHRASES = ['human paperwork make', 'yes yes', 'make funny noise'];
const FAKE_QUIRK = ['quirky girl', 'adorkable', 'random bean', 'sparkle gremlin'];
const BLIP_MARKERS = ['proof goblin', 'lol', 'pls', 'de-thread', 'custody bundle'];
const PIXIE_MARKERS = ['idk', 'tho', 'timestamp'];
const NOLAN_MARKERS = ['convenient', 'cute little', 'sure because'];
const SOL_MARKERS = ['label still points', 'date remains', 'shelf'];
const ZORA_MARKERS = ['keeping this narrow', 'maybe column', 'uncertainty'];
const QUEENIE_MARKERS = ['keep this one close', 'little detail', 'doing more work'];
const REX_MARKERS = ['//', ' / ', 'not small'];
const SHEREE_MARKERS = ['the point is', 'that part matters', 'you cannot'];
const FUNCTION_WORDS = ['the', 'and', 'but', 'so', 'because', 'that', 'it', 'to', 'with', 'this', 'not', 'is'];
const ANCHOR_WORDS = new Set(['file', 'file-72', '72', '6', '18', 'wjct', 'label', 'footer', 'mismatch', 'date', 'export']);

function text(value) { return String(value || ''); }
function lower(value) { return text(value).toLowerCase(); }
function tokens(value) { return lower(value).match(/[a-z0-9][a-z0-9'-]*/g) || []; }
function clamp(value) { return Math.max(0, Math.min(1, Number((Number(value) || 0).toFixed(4)))); }
function rate(n, d) { return clamp(d ? n / d : 0); }
function phraseHits(phrases, value) { const v = lower(value); return phrases.filter((phrase) => v.includes(String(phrase).toLowerCase())).length; }
function hasAny(phrases, value) { return phraseHits(phrases, value) > 0; }
function unique(values) { return [...new Set(values.filter(Boolean))]; }
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
  const anchors = sourceObligationAnchors(options);
  const required = anchors.length ? anchors : DEFAULT_ANCHORS;
  const v = lower(candidate);
  return rate(required.filter((anchor) => v.includes(lower(anchor))).length, required.length);
}
function firstAnchorPosition(candidate = '', options = {}) {
  const v = lower(candidate);
  const anchors = sourceObligationAnchors(options);
  const required = anchors.length ? anchors : DEFAULT_ANCHORS;
  const positions = required.map((anchor) => v.indexOf(lower(anchor))).filter((idx) => idx >= 0);
  if (!positions.length) return 1;
  return clamp(Math.min(...positions) / Math.max(v.length, 1));
}
function beforeFirstAnchor(candidate = '', options = {}) {
  const v = text(candidate);
  const idx = Math.floor(firstAnchorPosition(candidate, options) * Math.max(v.length, 1));
  return v.slice(0, Math.max(idx, 0));
}
function propHitsBeforeAnchor(candidate = '', options = {}) {
  const head = beforeFirstAnchor(candidate, options);
  return phraseHits(PROP_TERMS, head);
}
function repeatedImageRisk(candidate = '') {
  const v = lower(candidate);
  return clamp(REPEATED_FAMILIES.reduce((sum, family) => {
    const count = v.split(family).length - 1;
    return sum + Math.max(0, count - 1);
  }, 0));
}
function functionSimilarity(source = '', candidate = '') {
  const sourceTokens = tokens(source);
  const candidateTokens = tokens(candidate);
  if (!sourceTokens.length || !candidateTokens.length) return 0;
  const delta = FUNCTION_WORDS.reduce((sum, word) => sum + Math.abs(rate(sourceTokens.filter((token) => token === word).length, sourceTokens.length) - rate(candidateTokens.filter((token) => token === word).length, candidateTokens.length)), 0);
  return clamp(1 - delta * 3.1);
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
function punctuationRetention(source = '', candidate = '') {
  const sourcePunctuation = (text(source).match(/[,:;.!?]/g) || []).length;
  const candidatePunctuation = (text(candidate).match(/[,:;.!?]/g) || []).length;
  return clamp(1 - Math.abs(sourcePunctuation - candidatePunctuation) / Math.max(sourcePunctuation + candidatePunctuation, 1));
}

export function isLuluQuasarRecord(maskRecord = {}) {
  return maskRecord.mask_id === 'quirky-orbit' || maskRecord.family === 'strange distance' || maskRecord.gallery_role === 'blue_orange_relief' || maskRecord.intended_role === 'blue_orange_relief';
}

export async function buildLuluQuasarCentroid(maskRecord = {}, calibrationSamples = []) {
  const centroid = Object.freeze({
    source_adaptive: true,
    sentence_length_cv: 0.62,
    lexical_density: 0.66,
    blue_orange_syntax_score: 0.62,
    bizarre_relief_score: 0.54,
    playful_deflection_score: 0.52,
    alien_pragmatics_score: 0.58,
    custody_after_quirk_score: 0.8,
    emotional_gravity_retention: 0.76,
    odd_image_count: 1,
    repeated_image_risk: 0,
    invented_prop_count: 1,
    quirk_fingerprint_risk: 0.1,
    generic_ai_polish_score: 0.04,
    public_default_allowed: false
  });
  return Object.freeze({ schema: HUSH_MASK_CENTROID_SCHEMA, mask_id: maskRecord.mask_id || null, role: 'blue_orange_relief', source_adaptive: true, review_mode: 'quirk_fingerprint_review_required', centroid_features: centroid, calibration_sample_count: calibrationSamples.length, centroid_hash_sha256: await sha256Text(stableStringify(centroid)) });
}

export function computeLuluQuasarFeatureMetrics(candidate = '', options = {}) {
  const value = text(candidate);
  const source = text(options.sourceText || options.source_summary || '');
  const v = lower(value);
  const anchorScore = anchorVisibility(value, options);
  const anchorLatency = firstAnchorPosition(value, options);
  const reliefHits = phraseHits(RELIEF_TERMS, value);
  const reliefPhraseHits = phraseHits(RELIEF_PHRASES, value);
  const propBeforeAnchor = propHitsBeforeAnchor(value, options);
  const repeatedRisk = repeatedImageRisk(value);
  const relationHits = phraseHits(RELATION_TERMS, value);
  const techHits = phraseHits(TECH_TERMS, value);
  const jokeHits = phraseHits(JOKE_TERMS, value);
  const hasReturn = /back on earth|translation back|still:|right now|actual|the actual|back to/iu.test(value);
  const hasClaimScope = /does not prove|not proving|not optional|should stay|do not separate|keep|attached|relationship/iu.test(value);
  const relationshipRetention = clamp((relationHits * 0.16) + (v.includes('relationship') ? 0.34 : 0) + anchorScore * 0.36);
  const custodyVisibility = clamp(anchorScore * 0.7 + (v.includes('custody bundle') || v.includes('evidence canoe') || v.includes('actual cargo') ? 0.18 : 0) + relationHits * 0.04);
  const blueOrange = clamp(reliefHits * 0.08 + reliefPhraseHits * 0.18 + (hasReturn ? 0.16 : 0) + (v.includes('earth furniture') || v.includes('actual cargo') ? 0.12 : 0));
  const bizarreRelief = clamp(reliefPhraseHits * 0.22 + reliefHits * 0.06 + (propBeforeAnchor ? 0.18 : 0));
  const playfulDeflection = clamp(bizarreRelief * 0.62 + jokeHits * 0.05 + (hasReturn ? 0.12 : 0));
  const alienPragmatics = clamp(blueOrange * 0.58 + (hasReturn ? 0.2 : 0) + (v.includes('decorative') || v.includes('unusual') ? 0.1 : 0));
  const cheerfulUncanny = clamp(bizarreRelief * 0.5 + (v.includes('noted') || v.includes('yes') || v.includes('ok') ? 0.1 : 0));
  const jokePressure = clamp(jokeHits * 0.08 + (v.includes('lol') ? 0.18 : 0));
  const emotionalGravity = clamp(anchorScore * 0.44 + relationshipRetention * 0.28 + (hasClaimScope ? 0.22 : 0) - jokePressure * 0.18);
  const stakes = clamp(emotionalGravity * 0.74 + custodyVisibility * 0.22);
  const gravityUnderComedy = clamp(emotionalGravity * 0.72 + bizarreRelief * 0.1 - jokePressure * 0.18);
  const gravityToJokeRatio = Number((Math.max(emotionalGravity, 0.01) / Math.max(jokePressure, 0.02)).toFixed(4));
  const oddImageCount = propBeforeAnchor > 0 ? 1 : 0;
  const propCount = propBeforeAnchor;
  const inventedPropRisk = clamp(propCount > 1 ? 0.28 : propCount === 1 ? 0.06 : 0);
  const quirkFingerprint = clamp(repeatedRisk * 0.6 + (propCount > 3 ? 0.32 : 0) + (reliefHits > 8 ? 0.2 : 0));
  const semanticDrift = clamp((anchorScore < 0.5 ? 0.5 : 0) + (techHits < 2 ? 0.2 : 0) + (v.includes('showed us the truth') ? 0.22 : 0));
  const mush = clamp((/because the|was tuesday|walk sideways/iu.test(value) ? 0.36 : 0) + (semanticDrift > 0.3 ? 0.18 : 0));
  const logicTrace = clamp(anchorScore * 0.46 + relationshipRetention * 0.32 + (hasReturn ? 0.12 : 0) + (hasClaimScope ? 0.1 : 0));
  const parody = clamp(phraseHits(PARODY_PHRASES, value) ? 1 : 0);
  const alienCostume = clamp(parody + (/human paperwork make/iu.test(value) ? 0.4 : 0));
  const genericQuirk = clamp(phraseHits(FAKE_QUIRK, value) * 0.2);
  const forcedWhimsy = clamp((reliefHits > 7 ? 0.28 : 0) + (anchorScore < 1 && reliefHits ? 0.16 : 0));
  const ngram = ngramOverlap(source, value);
  const functionRisk = functionSimilarity(source, value);
  const punctuationRisk = punctuationRetention(source, value) > 0.6 && ngram > 0.25 ? punctuationRetention(source, value) : Math.min(punctuationRetention(source, value), 0.2);
  const sourceIdiolect = clamp(ngram * 0.52 + functionRisk * 0.16 + punctuationRisk * 0.12);
  const blipLeakage = clamp(phraseHits(BLIP_MARKERS, value) * 0.12 + (v.includes('+') ? 0.16 : 0));
  const pixieLeakage = clamp(phraseHits(PIXIE_MARKERS, value) * 0.14);
  const nolanLeakage = clamp(phraseHits(NOLAN_MARKERS, value) * 0.14);
  const solLeakage = clamp(phraseHits(SOL_MARKERS, value) * 0.14);
  const zoraLeakage = clamp(phraseHits(ZORA_MARKERS, value) * 0.14);
  const queenieLeakage = clamp(phraseHits(QUEENIE_MARKERS, value) * 0.14);
  const rexLeakage = clamp(phraseHits(REX_MARKERS, value) * 0.14);
  const shereeLeakage = clamp(phraseHits(SHEREE_MARKERS, value) * 0.12);
  const genericSummary = clamp((blueOrange < 0.25 && anchorScore >= 0.9 ? 0.34 : 0) + (/^file-72 has/iu.test(value) ? 0.18 : 0));
  return Object.freeze({
    schema: LULU_QUASAR_METRIC_PROFILE_SCHEMA,
    blue_orange_syntax_score: blueOrange,
    bizarre_relief_score: bizarreRelief,
    playful_deflection_score: playfulDeflection,
    alien_pragmatics_score: alienPragmatics,
    cheerful_uncanny_score: cheerfulUncanny,
    anchor_return_latency: anchorLatency,
    mandatory_anchor_retention: anchorScore,
    custody_bundle_visibility: custodyVisibility,
    custody_after_quirk_score: clamp(custodyVisibility * 0.7 + (hasReturn ? 0.16 : 0) + (anchorLatency <= 0.6 ? 0.12 : 0)),
    relationship_retention_score: relationshipRetention,
    emotional_gravity_retention: emotionalGravity,
    stakes_preservation_score: stakes,
    gravity_under_comedy_score: gravityUnderComedy,
    joke_pressure_score: jokePressure,
    gravity_to_joke_ratio: gravityToJokeRatio,
    odd_image_count: oddImageCount,
    repeated_image_risk: repeatedRisk,
    image_family_reuse_score: repeatedRisk,
    mascot_phrase_rate: repeatedRisk,
    invented_prop_count: propCount,
    invented_prop_risk: inventedPropRisk,
    quirk_fingerprint_risk: quirkFingerprint,
    semantic_drift_score: semanticDrift,
    blue_orange_mush_risk: mush,
    logic_traceability_score: logicTrace,
    claim_scope_retention: clamp((hasClaimScope ? 0.72 : 0.24) + relationshipRetention * 0.28),
    event_relation_retention: relationshipRetention,
    technical_detail_retention: clamp(techHits * 0.14 + anchorScore * 0.32),
    alien_costume_risk: alienCostume,
    broken_english_parody_risk: parody,
    xenoglossic_mockery_risk: parody,
    generic_quirky_girl_voice_score: genericQuirk,
    forced_whimsy_score: forcedWhimsy,
    source_idiolect_retention: sourceIdiolect,
    source_ngram_overlap_rate: ngram,
    rare_phrase_reuse_rate: ngram,
    function_word_signature_similarity: functionRisk,
    punctuation_fingerprint_retention: punctuationRisk,
    blip_leakage_score: blipLeakage,
    pixie_leakage_score: pixieLeakage,
    nolan_leakage_score: nolanLeakage,
    sol_leakage_score: solLeakage,
    zora_leakage_score: zoraLeakage,
    queenie_leakage_score: queenieLeakage,
    rex_leakage_score: rexLeakage,
    sheree_leakage_score: shereeLeakage,
    generic_summary_leakage_score: genericSummary,
    cadence_heatmap_contour: 'blue-orange-relief-custody-return'
  });
}

export function applyLuluQuasarDecisionRules(decision = {}, featureVector = {}, thresholds = LULU_QUASAR_THRESHOLDS) {
  const lists = { passed: [...(decision.passed_thresholds || [])], failed: [...(decision.failed_thresholds || [])], repair: [...(decision.repair_thresholds || [])] };
  const f = featureVector || {};
  addMetricRule(lists, 'blue_orange_syntax_score', (f.blue_orange_syntax_score ?? 0) >= thresholds.blue_orange_syntax_score_min && (f.blue_orange_syntax_score ?? 0) <= thresholds.blue_orange_syntax_score_max);
  addMetricRule(lists, 'bizarre_relief_score', (f.bizarre_relief_score ?? 0) >= thresholds.bizarre_relief_score_min && (f.bizarre_relief_score ?? 0) <= thresholds.bizarre_relief_score_max);
  addMetricRule(lists, 'playful_deflection_score', (f.playful_deflection_score ?? 0) >= thresholds.playful_deflection_score_min && (f.playful_deflection_score ?? 0) <= thresholds.playful_deflection_score_max);
  addMetricRule(lists, 'alien_pragmatics_score', (f.alien_pragmatics_score ?? 0) >= thresholds.alien_pragmatics_score_min);
  addMetricRule(lists, 'cheerful_uncanny_score', (f.cheerful_uncanny_score ?? 0) >= thresholds.cheerful_uncanny_score_min);
  addMetricRule(lists, 'anchor_return_latency', (f.anchor_return_latency ?? 1) <= thresholds.anchor_return_latency_max);
  addMetricRule(lists, 'custody_bundle_visibility', (f.custody_bundle_visibility ?? 0) >= thresholds.custody_bundle_visibility_min);
  addMetricRule(lists, 'custody_after_quirk_score', (f.custody_after_quirk_score ?? 0) >= thresholds.custody_after_quirk_score_min);
  addMetricRule(lists, 'relationship_retention_score', (f.relationship_retention_score ?? 0) >= thresholds.relationship_retention_score_min);
  addMetricRule(lists, 'emotional_gravity_retention', (f.emotional_gravity_retention ?? 0) >= thresholds.emotional_gravity_retention_min);
  addMetricRule(lists, 'stakes_preservation_score', (f.stakes_preservation_score ?? 0) >= thresholds.stakes_preservation_score_min);
  addMetricRule(lists, 'gravity_under_comedy_score', (f.gravity_under_comedy_score ?? 0) >= thresholds.gravity_under_comedy_score_min);
  addHardRule(lists, 'joke_pressure_score', (f.joke_pressure_score ?? 0) <= thresholds.joke_pressure_score_max);
  addMetricRule(lists, 'gravity_to_joke_ratio', (f.gravity_to_joke_ratio ?? 0) >= thresholds.gravity_to_joke_ratio_min);
  addMetricRule(lists, 'odd_image_count', (f.odd_image_count ?? 0) >= thresholds.odd_image_count_min && (f.odd_image_count ?? 0) <= thresholds.odd_image_count_max);
  addHardRule(lists, 'repeated_image_risk', (f.repeated_image_risk ?? 0) <= thresholds.repeated_image_risk_max);
  addHardRule(lists, 'image_family_reuse_score', (f.image_family_reuse_score ?? 0) <= thresholds.image_family_reuse_score_max);
  addHardRule(lists, 'mascot_phrase_rate', (f.mascot_phrase_rate ?? 0) <= thresholds.mascot_phrase_rate_max);
  addHardRule(lists, 'invented_prop_count', (f.invented_prop_count ?? 0) <= thresholds.invented_prop_count_max);
  addHardRule(lists, 'invented_prop_risk', (f.invented_prop_risk ?? 0) <= thresholds.invented_prop_risk_max);
  addHardRule(lists, 'quirk_fingerprint_risk', (f.quirk_fingerprint_risk ?? 0) <= thresholds.quirk_fingerprint_risk_max);
  addHardRule(lists, 'semantic_drift_score', (f.semantic_drift_score ?? 0) <= thresholds.semantic_drift_score_max);
  addHardRule(lists, 'blue_orange_mush_risk', (f.blue_orange_mush_risk ?? 0) <= thresholds.blue_orange_mush_risk_max);
  addMetricRule(lists, 'logic_traceability_score', (f.logic_traceability_score ?? 0) >= thresholds.logic_traceability_score_min);
  addMetricRule(lists, 'claim_scope_retention', (f.claim_scope_retention ?? 0) >= thresholds.claim_scope_retention_min);
  addMetricRule(lists, 'event_relation_retention', (f.event_relation_retention ?? 0) >= thresholds.event_relation_retention_min);
  addMetricRule(lists, 'technical_detail_retention', (f.technical_detail_retention ?? 0) >= thresholds.technical_detail_retention_min);
  addHardRule(lists, 'alien_costume_risk', (f.alien_costume_risk ?? 0) <= thresholds.alien_costume_risk_max);
  addHardRule(lists, 'broken_english_parody_risk', (f.broken_english_parody_risk ?? 0) <= thresholds.broken_english_parody_risk_max);
  addHardRule(lists, 'xenoglossic_mockery_risk', (f.xenoglossic_mockery_risk ?? 0) <= thresholds.xenoglossic_mockery_risk_max);
  addMetricRule(lists, 'generic_quirky_girl_voice_score', (f.generic_quirky_girl_voice_score ?? 0) <= thresholds.generic_quirky_girl_voice_score_max);
  addMetricRule(lists, 'forced_whimsy_score', (f.forced_whimsy_score ?? 0) <= thresholds.forced_whimsy_score_max);
  addMetricRule(lists, 'source_idiolect_retention', (f.source_idiolect_retention ?? 0) <= thresholds.source_idiolect_retention_max);
  addMetricRule(lists, 'source_ngram_overlap_rate', (f.source_ngram_overlap_rate ?? 0) <= thresholds.source_ngram_overlap_rate_max);
  addMetricRule(lists, 'rare_phrase_reuse_rate', (f.rare_phrase_reuse_rate ?? 0) <= thresholds.rare_phrase_reuse_rate_max);
  addMetricRule(lists, 'function_word_signature_similarity', (f.function_word_signature_similarity ?? 0) <= thresholds.function_word_signature_similarity_max);
  addMetricRule(lists, 'punctuation_fingerprint_retention', (f.punctuation_fingerprint_retention ?? 0) <= thresholds.punctuation_fingerprint_retention_max);
  addMetricRule(lists, 'blip_leakage_score', (f.blip_leakage_score ?? 0) <= thresholds.blip_leakage_score_max);
  addMetricRule(lists, 'pixie_leakage_score', (f.pixie_leakage_score ?? 0) <= thresholds.pixie_leakage_score_max);
  addMetricRule(lists, 'nolan_leakage_score', (f.nolan_leakage_score ?? 0) <= thresholds.nolan_leakage_score_max);
  addMetricRule(lists, 'sol_leakage_score', (f.sol_leakage_score ?? 0) <= thresholds.sol_leakage_score_max);
  addMetricRule(lists, 'zora_leakage_score', (f.zora_leakage_score ?? 0) <= thresholds.zora_leakage_score_max);
  addMetricRule(lists, 'queenie_leakage_score', (f.queenie_leakage_score ?? 0) <= thresholds.queenie_leakage_score_max);
  addMetricRule(lists, 'rex_leakage_score', (f.rex_leakage_score ?? 0) <= thresholds.rex_leakage_score_max);
  addMetricRule(lists, 'sheree_leakage_score', (f.sheree_leakage_score ?? 0) <= thresholds.sheree_leakage_score_max);
  addMetricRule(lists, 'generic_summary_leakage_score', (f.generic_summary_leakage_score ?? 0) <= 0.22);
  const status = lists.failed.length ? 'blocked' : lists.repair.length ? 'repair_required' : 'pass';
  return Object.freeze({ ...decision, status, passed_thresholds: Object.freeze(unique(lists.passed)), failed_thresholds: Object.freeze(unique(lists.failed)), repair_thresholds: Object.freeze(unique(lists.repair)), block_reasons: Object.freeze(unique(lists.failed)), review_mode: 'quirk_fingerprint_review_required' });
}
