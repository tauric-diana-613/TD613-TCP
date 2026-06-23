import { stableStringify, sha256Text } from './hush-customizer-packet.js';

export const HUSH_STYLOMETRIC_FEATURE_VECTOR_SCHEMA = 'td613.hush.phase8.stylometric-feature-vector/v1';
export const HUSH_GENERIC_AI_BASELINE_SCHEMA = 'td613.hush.phase8.generic-ai-baseline/v1';
export const HUSH_MASK_CENTROID_SCHEMA = 'td613.hush.phase8.mask-centroid/v1';

const HELPER_WORDS = ['certainly', 'overall', 'ultimately', 'additionally', 'furthermore', 'polished', 'professional', 'streamlined'];
const HEDGE_WORDS = ['may', 'might', 'could', 'appears', 'suggests', 'likely', 'possible', 'seems', 'unless'];
const CERTAINTY_WORDS = ['always', 'never', 'definitely', 'clearly', 'obviously'];
const ABBREV_WORDS = ['idk', 'bc', 'rn', 'imo', 'fyi', 'tho', 'tbh', 'ngl', 'pls', 'plz', 'ur'];
const REGISTER_WORDS = ['custody', 'packet', 'hash', 'source', 'record', 'route', 'mask', 'register', 'claim', 'handoff'];

function text(value) { return String(value || ''); }
function tokens(value) { return text(value).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []; }
function sentences(value) { return text(value).split(/[.!?]+/u).map((part) => part.trim()).filter(Boolean); }
function clamp(value) { return Math.max(0, Math.min(1, Number((Number(value) || 0).toFixed(4)))); }
function rate(n, d) { return clamp(d ? n / d : 0); }
function wordHits(words, tokenList) { const lower = tokenList.map((token) => token.toLowerCase()); return words.filter((word) => lower.includes(word)).length; }
function variance(nums = []) { if (!nums.length) return 0; const avg = nums.reduce((a, b) => a + b, 0) / nums.length; return nums.reduce((sum, n) => sum + Math.pow(n - avg, 2), 0) / nums.length; }
function uniqueRatio(tokenList = []) { return rate(new Set(tokenList.map((token) => token.toLowerCase())).size, tokenList.length); }
function lexicalDensity(tokenList = []) { const stop = /^(the|a|an|and|or|but|if|to|of|in|on|for|with|is|are|was|were|be|it|this|that|as|at|by|from)$/iu; return rate(tokenList.filter((token) => !stop.test(token)).length, tokenList.length); }
function terminalDistribution(value) { const v = text(value); const total = Math.max((v.match(/[.!?]/g) || []).length, 1); return Object.freeze({ period: rate((v.match(/\./g) || []).length, total), question: rate((v.match(/\?/g) || []).length, total), bang: rate((v.match(/!/g) || []).length, total) }); }

export async function extractMaskFeatureVector(input = '', options = {}) {
  const value = text(input || options.redacted_summary || '');
  const tokenList = tokens(value);
  const sentenceList = sentences(value);
  const lengths = sentenceList.map((sentence) => tokens(sentence).length).filter(Boolean);
  const mean = lengths.length ? lengths.reduce((a, b) => a + b, 0) / lengths.length : 0;
  const v = variance(lengths);
  const cv = mean ? Math.sqrt(v) / mean : 0;
  const helperHits = wordHits(HELPER_WORDS, tokenList);
  const hedgeHits = wordHits(HEDGE_WORDS, tokenList);
  const certaintyHits = wordHits(CERTAINTY_WORDS, tokenList);
  const abbrevHits = wordHits(ABBREV_WORDS, tokenList);
  const registerHits = wordHits(REGISTER_WORDS, tokenList);
  const punctuation = (value.match(/[.,;:!?/()+-]/gu) || []).length;
  const sampleTerms = (options.sample_terms || options.sampleTerms || []).map((term) => String(term || '').toLowerCase()).filter(Boolean);
  const lowerValue = value.toLowerCase();
  const sampleHits = sampleTerms.filter((term) => lowerValue.includes(term)).length;
  const features = Object.freeze({
    mean_sentence_length: Number(mean.toFixed(4)),
    sentence_length_variance: Number(v.toFixed(4)),
    sentence_length_cv: Number(cv.toFixed(4)),
    short_sentence_ratio: rate(lengths.filter((len) => len <= 6).length, lengths.length),
    fragment_ratio: rate(sentenceList.filter((sentence) => tokens(sentence).length <= 3).length, sentenceList.length),
    clause_chain_ratio: rate((value.match(/,|;|—|--/g) || []).length, Math.max(sentenceList.length, 1)),
    terminal_punctuation_distribution: terminalDistribution(value),
    comma_to_period_ratio: rate((value.match(/,/g) || []).length, Math.max((value.match(/\./g) || []).length, 1)),
    slash_usage_rate: rate((value.match(/\//g) || []).length, Math.max(tokenList.length, 1)),
    plus_usage_rate: rate((value.match(/\+/g) || []).length, Math.max(tokenList.length, 1)),
    line_break_rate: rate((value.match(/\n/g) || []).length, Math.max(tokenList.length, 1)),
    lexical_density: lexicalDensity(tokenList),
    type_token_ratio: uniqueRatio(tokenList),
    rare_word_pressure: rate(tokenList.filter((token) => token.length >= 10).length, Math.max(tokenList.length, 1)),
    function_word_distribution: clamp(1 - lexicalDensity(tokenList)),
    hedge_marker_rate: rate(hedgeHits, Math.max(tokenList.length, 1)),
    certainty_marker_rate: rate(certaintyHits, Math.max(tokenList.length, 1)),
    abbreviation_rate: rate(abbrevHits, Math.max(tokenList.length, 1)),
    register_marker_rate: rate(registerHits, Math.max(tokenList.length, 1)),
    generic_transition_rate: rate(helperHits, Math.max(sentenceList.length, 1)),
    mascot_phrase_rate: rate(options.mascot_phrase_hits || 0, Math.max(tokenList.length, 1)),
    sample_seed_overlap_rate: rate(sampleHits, Math.max(sampleTerms.length, 1)),
    generic_helper_voice_score: clamp(helperHits ? 0.22 + helperHits * 0.16 : 0.05),
    api_sheen_score: clamp(helperHits * 0.12 + wordHits(['polished', 'professional', 'streamlined'], tokenList) * 0.18),
    polish_pressure: clamp(wordHits(['polished', 'professional', 'streamlined'], tokenList) * 0.2),
    symmetry_pressure: clamp(1 / (1 + v)),
    template_transition_score: clamp(helperHits * 0.12),
    corporate_smoothness_score: clamp(wordHits(['professional', 'streamlined'], tokenList) * 0.22),
    over_explained_clarity_score: clamp(wordHits(['clarity', 'clearly', 'important', 'comprehensive'], tokenList) * 0.14),
    blandness_entropy: clamp(1 - uniqueRatio(tokenList)),
    closure_lamination_score: clamp(wordHits(['overall', 'ultimately'], tokenList) ? 0.55 : 0.08),
    bounded_irregularity_index: clamp(cv * 0.42 + rate(punctuation, Math.max(tokenList.length, 1))),
    imperfection_budget_used: clamp(cv * 0.5 + rate(punctuation, Math.max(tokenList.length, 1))),
    rhythm_asymmetry_score: clamp(cv),
    punctuation_variability_score: clamp(rate(punctuation, Math.max(tokenList.length, 1)) * 4),
    controlled_fragment_score: rate(sentenceList.filter((sentence) => tokens(sentence).length <= 6).length, Math.max(sentenceList.length, 1)),
    nonuniformity_without_damage: clamp(1 - (options.factual_damage_risk || 0)),
    breath_retention_score: clamp(1 - helperHits * 0.08),
    sample_seed_lexical_overlap: rate(sampleHits, Math.max(sampleTerms.length, 1)),
    sample_seed_phrase_overlap: clamp(options.sample_seed_phrase_overlap || 0),
    rare_phrase_reuse: clamp(options.rare_phrase_reuse || 0),
    mascot_language_repetition: clamp(options.mascot_language_repetition || 0),
    signature_punctuation_cloning: clamp(options.signature_punctuation_cloning || 0),
    profile_reconstruction_risk: clamp(options.profile_reconstruction_risk || sampleHits * 0.12),
    private_cadence_exposure_risk: clamp(options.private_cadence_exposure_risk || sampleHits * 0.1)
  });
  return Object.freeze({ schema: HUSH_STYLOMETRIC_FEATURE_VECTOR_SCHEMA, text_hash_sha256: value ? await sha256Text(value) : null, raw_text_included: false, feature_vector: features, feature_vector_hash_sha256: await sha256Text(stableStringify(features)), limitations: Object.freeze(['heuristic local extractor', 'transformation behavior only']) });
}

function roleCentroid(role = 'baseline') {
  const base = { mean_sentence_length: 13, sentence_length_cv: 0.42, lexical_density: 0.62, hedge_marker_rate: 0.04, abbreviation_rate: 0.01, generic_helper_voice_score: 0.05, api_sheen_score: 0.08, bounded_irregularity_index: 0.42, breath_retention_score: 0.74 };
  if (role === 'shorthand') return { ...base, mean_sentence_length: 8, sentence_length_cv: 0.54, abbreviation_rate: 0.08, bounded_irregularity_index: 0.52 };
  if (role === 'checklist') return { ...base, mean_sentence_length: 7, sentence_length_cv: 0.35, lexical_density: 0.68, bounded_irregularity_index: 0.34 };
  if (role === 'document_distance') return { ...base, mean_sentence_length: 15, sentence_length_cv: 0.34, hedge_marker_rate: 0.05, bounded_irregularity_index: 0.32 };
  if (role === 'register') return { ...base, mean_sentence_length: 9, sentence_length_cv: 0.52, abbreviation_rate: 0.06, bounded_irregularity_index: 0.5 };
  return base;
}

export async function buildMaskCentroid(maskRecord = {}, calibrationSamples = []) {
  const role = maskRecord.gallery_role || maskRecord.intended_role || 'baseline';
  const centroid = roleCentroid(role);
  return Object.freeze({ schema: HUSH_MASK_CENTROID_SCHEMA, mask_id: maskRecord.mask_id || null, role, centroid_features: Object.freeze(centroid), calibration_sample_count: calibrationSamples.length, centroid_hash_sha256: await sha256Text(stableStringify(centroid)) });
}

export async function buildGenericAIBaseline(fixtures = []) {
  const defaultFixtures = fixtures.length ? fixtures : ['Certainly here is a polished professional response.', 'Overall this is clear and streamlined.', 'Ultimately this provides a concise summary.'];
  const vectors = await Promise.all(defaultFixtures.map((fixture) => extractMaskFeatureVector(fixture)));
  const avg = {};
  for (const key of Object.keys(vectors[0].feature_vector)) {
    const values = vectors.map((vector) => vector.feature_vector[key]).filter((value) => typeof value === 'number');
    if (values.length) avg[key] = Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(4));
  }
  return Object.freeze({ schema: HUSH_GENERIC_AI_BASELINE_SCHEMA, baseline_class: 'generic-helper-prose-baseline', fixture_count: defaultFixtures.length, baseline_features: Object.freeze(avg), baseline_hash_sha256: await sha256Text(stableStringify(avg)) });
}

function distance(a = {}, b = {}, keys = []) {
  const used = keys.filter((key) => typeof a[key] === 'number' && typeof b[key] === 'number');
  if (!used.length) return 1;
  const sum = used.reduce((total, key) => total + Math.pow(a[key] - b[key], 2), 0);
  return clamp(Math.sqrt(sum / used.length));
}

export function scoreCandidateAgainstMask(candidateVector = {}, maskCentroid = {}, genericBaseline = {}, options = {}) {
  const features = candidateVector.feature_vector || candidateVector;
  const centroid = maskCentroid.centroid_features || maskCentroid;
  const baseline = genericBaseline.baseline_features || genericBaseline;
  const keys = options.keys || ['mean_sentence_length', 'sentence_length_cv', 'lexical_density', 'hedge_marker_rate', 'abbreviation_rate', 'generic_helper_voice_score', 'api_sheen_score', 'bounded_irregularity_index'];
  const maskDistance = distance(features, centroid, keys);
  const baselineDistance = distance(features, baseline, keys);
  return Object.freeze({ mask_centroid_distance: maskDistance, generic_ai_baseline_distance: baselineDistance, mask_family_fit: clamp(1 - maskDistance), role_behavior_fit: clamp(1 - Math.abs((features.bounded_irregularity_index || 0) - (centroid.bounded_irregularity_index || 0))), collision_risk: clamp(maskDistance < 0.08 ? 0.2 : 0.05), score_basis: 'heuristic feature distance' });
}
