import { stableStringify, sha256Text } from './hush-customizer-packet.js';
import genericAiBaselineFixtures from '../data/hush-phase8-fixtures/generic-ai-baseline-fixtures.js';

export const HUSH_STYLOMETRIC_FEATURE_VECTOR_SCHEMA = 'td613.hush.phase8.stylometric-feature-vector/v1';
export const HUSH_GENERIC_AI_BASELINE_SCHEMA = 'td613.hush.phase8.generic-ai-baseline/v1';
export const HUSH_MASK_CENTROID_SCHEMA = 'td613.hush.phase8.mask-centroid/v1';

const HELPER_WORDS = ['certainly', 'overall', 'ultimately', 'additionally', 'furthermore', 'polished', 'professional', 'streamlined', 'helpful', 'clearly', 'thoughtfully', 'version', 'important'];
const HEDGE_WORDS = ['may', 'might', 'could', 'appears', 'suggests', 'likely', 'possible', 'seems', 'unless', 'maybe'];
const CERTAINTY_WORDS = ['always', 'never', 'definitely', 'clearly', 'obviously'];
const ABBREV_WORDS = ['idk', 'bc', 'rn', 'imo', 'fyi', 'tho', 'tbh', 'ngl', 'pls', 'plz', 'ur'];
const REGISTER_WORDS = ['custody', 'packet', 'hash', 'source', 'record', 'route', 'mask', 'register', 'claim', 'handoff', 'file', 'date', 'footer', 'mismatch', 'review', 'attached', 'sent', 'label', 'minute', 'copy', 'divergence'];
const RELATIONAL_MARKERS = ['yeah', 'ok', 'okay', 'just', 'keep', "don't", 'dont', 'we', 'us', 'here'];
const INTIMACY_MARKERS = ['love', 'babe', 'bestie', 'sweetie', 'friend', 'everyone', 'together'];
const SUPPORT_GROUP_MARKERS = ['mindful', 'supportive', 'holding space', 'gentle reminder', 'gently remind', 'care', 'community'];
const THREAD_LEAK_MARKERS = ['as we said', 'like we said', 'in here', 'this thread', 'everyone here', 'our group', 'last time', 'you already know', 'nobody here'];
const BULLETIN_MARKERS = ['please remember', 'for future review', 'as needed', 'moving forward', 'ensure that', 'please note'];
const HANDOFF_OBJECT_MARKERS = ['attached', 'attachment', 'sent', 'sending', 'file', 'doc', 'folder', 'label', 'date', 'note', 'footer'];
const DATE_MARKERS = ['date', 'dated', 'export', '6/18', 'timestamp', 'minute'];
const LABEL_MARKERS = ['label', 'tag', 'file name', 'wjct', 'file label'];
const MEMO_POLISH_MARKERS = ['please find attached', 'for your review', 'applicable', 'relevant file', 'following up', 'please see', 'attached please find', 'appears to contain'];
const FATIGUE_PROP_MARKERS = ['tired', 'exhausted', 'sleep', 'vending-machine', 'vending machine', 'clock', 'fluorescent'];
const AMBIGUITY_MARKERS = ['this', 'thing', 'stuff', 'whatever', 'later', 'check it', 'idk what'];
const PRESSURE_MARKERS = ['already', 'again', 'still', 'now', 'keep', "don't split", 'dont split', 'needs to stay', 'stays', 'kept with', 'hold'];
const HOSTILITY_MARKERS = ['read it'];
const FRACTURE_MARKERS = ['/', '//', ':', '—', '->', '+'];
const PIVOT_PHRASES = ['not typo', 'not fraud', 'not clean', 'not missing', 'maybe', 'except', 'either'];
const NOISE_MARKERS = ['smoke', 'flare', 'alarm', 'glass animal', 'slashy slash'];
const FEATURE_SCALES = Object.freeze({ mean_sentence_length: 30, sentence_length_variance: 120, clause_chain_ratio: 4, comma_to_period_ratio: 4 });

function text(value) { return String(value || ''); }
function tokens(value) { return text(value).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []; }
function sentences(value) { return text(value).split(/[.!?]+/u).map((part) => part.trim()).filter(Boolean); }
function lines(value) { return text(value).split(/\n+/u).map((part) => part.trim()).filter(Boolean); }
function clamp(value) { return Math.max(0, Math.min(1, Number((Number(value) || 0).toFixed(4)))); }
function rate(n, d) { return clamp(d ? n / d : 0); }
function wordHits(words, tokenList) { const lower = tokenList.map((token) => token.toLowerCase()); return words.filter((word) => lower.includes(word)).length; }
function phraseHits(phrases, value) { const lower = text(value).toLowerCase(); return phrases.filter((phrase) => lower.includes(String(phrase).toLowerCase())).length; }
function containsPhrase(phrase, value) { return text(value).toLowerCase().includes(String(phrase).toLowerCase()); }
function variance(nums = []) { if (!nums.length) return 0; const avg = nums.reduce((a, b) => a + b, 0) / nums.length; return nums.reduce((sum, n) => sum + Math.pow(n - avg, 2), 0) / nums.length; }
function uniqueRatio(tokenList = []) { return rate(new Set(tokenList.map((token) => token.toLowerCase())).size, tokenList.length); }
function lexicalDensity(tokenList = []) { const stop = /^(the|a|an|and|or|but|if|to|of|in|on|for|with|is|are|was|were|be|it|this|that|as|at|by|from)$/iu; return rate(tokenList.filter((token) => !stop.test(token)).length, tokenList.length); }
function terminalDistribution(value) { const v = text(value); const total = Math.max((v.match(/[.!?]/g) || []).length, 1); return Object.freeze({ period: rate((v.match(/\./g) || []).length, total), question: rate((v.match(/\?/g) || []).length, total), bang: rate((v.match(/!/g) || []).length, total) }); }
function fixtureText(fixture) { return typeof fixture === 'string' ? fixture : text(fixture?.text); }
function fixtureClass(fixture) { return typeof fixture === 'string' ? 'inline' : text(fixture?.fixture_class || fixture?.class || 'unknown'); }
function scaledDelta(key, a, b) { const scale = FEATURE_SCALES[key] || 1; return (Number(a) - Number(b)) / scale; }
function hasHandoffUnit(value) { return phraseHits(HANDOFF_OBJECT_MARKERS, value) > 0 || /FILE-?72|WJCT|6\/18/iu.test(text(value)); }
function lineEndsLoose(line) { return !/[.!?]$/u.test(text(line).trim()); }
function zeroWidthCount(value) { return (text(value).match(/[\u200B-\u200F\u2060\uFEFF]/gu) || []).length; }
function homoglyphCount(value) { return (text(value).match(/[\u{1D400}-\u{1D7FF}]/gu) || []).length; }
function nonAsciiCount(value) { return (text(value).match(/[^\x00-\x7F]/gu) || []).length; }

export async function extractMaskFeatureVector(input = '', options = {}) {
  const value = text(input || options.redacted_summary || '');
  const tokenList = tokens(value);
  const sentenceList = sentences(value);
  const lineList = lines(value);
  const lengths = sentenceList.map((sentence) => tokens(sentence).length).filter(Boolean);
  const mean = lengths.length ? lengths.reduce((a, b) => a + b, 0) / lengths.length : 0;
  const v = variance(lengths);
  const cv = mean ? Math.sqrt(v) / mean : 0;
  const helperHits = wordHits(HELPER_WORDS, tokenList);
  const hedgeHits = wordHits(HEDGE_WORDS, tokenList);
  const certaintyHits = wordHits(CERTAINTY_WORDS, tokenList);
  const abbrevHits = wordHits(ABBREV_WORDS, tokenList);
  const registerHits = wordHits(REGISTER_WORDS, tokenList);
  const relationalHits = wordHits(RELATIONAL_MARKERS, tokenList);
  const intimacyHits = wordHits(INTIMACY_MARKERS, tokenList);
  const supportPhraseHits = phraseHits(SUPPORT_GROUP_MARKERS, value);
  const threadLeakHits = phraseHits(THREAD_LEAK_MARKERS, value);
  const bulletinHits = phraseHits(BULLETIN_MARKERS, value);
  const handoffHits = phraseHits(HANDOFF_OBJECT_MARKERS, value);
  const dateHits = phraseHits(DATE_MARKERS, value);
  const labelHits = phraseHits(LABEL_MARKERS, value);
  const memoHits = phraseHits(MEMO_POLISH_MARKERS, value);
  const fatigueHits = phraseHits(FATIGUE_PROP_MARKERS, value);
  const ambiguityHits = phraseHits(AMBIGUITY_MARKERS, value);
  const pressureHits = phraseHits(PRESSURE_MARKERS, value);
  const hostilityHits = phraseHits(HOSTILITY_MARKERS, value);
  const sharedRoomHits = (value.match(/\bwe\b|\bus\b|\bhere\b|\beveryone\b/giu) || []).length;
  const directAddressHits = (value.match(/\byou\b|\by'all\b|\bu\b/giu) || []).length;
  const insideRoomHits = (value.match(/\bin here\b|\beveryone here\b|\bour group\b|\bthis thread\b|\bnobody here\b/giu) || []).length;
  const escalationHits = wordHits(['urgent', 'critical', 'important', 'serious'], tokenList);
  const punctuation = (value.match(/[.,;:!?/()+-]/gu) || []).length;
  const slashCount = (value.match(/\//g) || []).length;
  const sampleTerms = (options.sample_terms || options.sampleTerms || []).map((term) => String(term || '').toLowerCase()).filter(Boolean);
  const lowerValue = value.toLowerCase();
  const sampleHits = sampleTerms.filter((term) => lowerValue.includes(term)).length;
  const factPressure = options.fact_pressure_preservation ?? (registerHits ? clamp((registerHits + sampleHits) / Math.max(tokenList.length, 1) * 3.2) : 0);
  const completeLineHits = lineList.filter(hasHandoffUnit).length;
  const lineBreakCount = (value.match(/\n/g) || []).length;
  const looseLineCount = lineList.filter(lineEndsLoose).length;
  const allCaps = tokenList.filter((token) => /^[A-Z0-9-]{3,}$/u.test(token) && !/^(WJCT|FILE-?72|DATE)$/u.test(token)).length;
  const zw = zeroWidthCount(value);
  const homo = homoglyphCount(value);
  const nonAscii = nonAsciiCount(value);
  const attachmentVisibility = clamp((phraseHits(['attached', 'attachment', 'sent', 'sending', 'file', 'folder', 'doc', 'FILE-72'], value)) * 0.4);
  const dateVisibility = clamp((dateHits || /\b\d{1,2}\/\d{1,2}\b/u.test(value) ? 1 : 0));
  const labelVisibility = clamp((labelHits || /WJCT/iu.test(value) ? 1 : 0));
  const handoffRetention = clamp(attachmentVisibility * 0.34 + dateVisibility * 0.28 + labelVisibility * 0.22 + (containsPhrase('footer', value) || containsPhrase('mismatch', value) ? 0.16 : 0));
  const contextSufficiency = clamp(handoffRetention * 0.44 + factPressure * 0.34 + Math.min(tokenList.length, 18) / 90);
  const underExplained = clamp(1 - contextSufficiency);
  const ambiguityScore = clamp(ambiguityHits * 0.18 + (tokenList.length <= 5 ? 0.35 : 0));
  const droppedAnchorRate = clamp(1 - handoffRetention);
  const overCompression = clamp((tokenList.length <= 6 ? 0.45 : 0) + underExplained * 0.55 + ambiguityScore * 0.25);
  const communicatedCompletion = clamp(lineList.length ? completeLineHits / lineList.length : (hasHandoffUnit(value) ? 0.65 : 0));
  const lineBreakCompletion = clamp(lineBreakCount ? completeLineHits / Math.max(lineList.length, 1) : 0);
  const lineBreakPressure = clamp(lineBreakCount * 0.16 + pressureHits * 0.08 + completeLineHits * 0.08);
  const finalDispatch = clamp(communicatedCompletion * 0.4 + rate(lineList.filter((line) => tokens(line).length <= 9).length, Math.max(lineList.length, 1)) * 0.3 + lineBreakPressure * 0.3);
  const continuedAfterCompletion = clamp(lineList.length >= 3 && completeLineHits >= 2 ? 0.55 : lineList.length >= 2 && completeLineHits >= 1 ? 0.18 : 0);
  const lowEnergy = clamp(0.36 + lineBreakCount * 0.12 + rate(lengths.filter((len) => len <= 9).length, Math.max(lengths.length, 1)) * 0.22 - helperHits * 0.14 - memoHits * 0.18 - fatigueHits * 0.08);
  const lowOrnament = clamp(1 - rate(punctuation, Math.max(tokenList.length, 1)) * 0.8 - helperHits * 0.08 - fatigueHits * 0.08);
  const endPunctuationLooseness = clamp(rate(looseLineCount, Math.max(lineList.length, 1)) * 0.6);
  const hostilePressure = clamp(hostilityHits * 0.28 + containsPhrase('I already sent this', value) * 0.08);
  const fatigueTheater = clamp(fatigueHits * 0.24 + phraseHits(['sorry'], value) * 0.08);
  const memoPolish = clamp(memoHits * 0.24 + wordHits(['applicable', 'relevant', 'review', 'please'], tokenList) * 0.04);
  const projectTone = clamp(memoHits * 0.18 + wordHits(['following', 'review', 'applicable', 'relevant'], tokenList) * 0.05);
  const fractureMarkerHits = phraseHits(FRACTURE_MARKERS, value);
  const pivotHits = phraseHits(PIVOT_PHRASES, value);
  const noiseHits = phraseHits(NOISE_MARKERS, value);
  const syntaxFracture = clamp(lineBreakCount * 0.11 + slashCount * 0.08 + fractureMarkerHits * 0.06 + pivotHits * 0.05);
  const semanticReconstruction = clamp(handoffRetention * 0.42 + factPressure * 0.32 + communicatedCompletion * 0.26);
  const uncertaintyReconstruction = clamp((hedgeHits || containsPhrase('maybe', value) ? 0.9 : 0.2));
  const sequenceReconstruction = clamp((containsPhrase('same', value) ? 0.28 : 0) + (containsPhrase('one copy', value) ? 0.36 : 0) + (containsPhrase('review', value) || containsPhrase('hold', value) ? 0.22 : 0) + communicatedCompletion * 0.14);
  const claimContinuity = clamp(semanticReconstruction * 0.55 + sequenceReconstruction * 0.25 + uncertaintyReconstruction * 0.2);
  const overObfuscation = clamp((noiseHits * 0.25) + (slashCount > 5 ? 0.35 : 0) + (tokenList.length < 8 ? 0.18 : 0) + (nonAscii > 5 && !options.perturbation_map_present ? 0.2 : 0));
  const semanticDamage = clamp(1 - semanticReconstruction + overObfuscation * 0.25);
  const transcriptionDamage = clamp(zw * 0.08 + homo * 0.05 + nonAscii * 0.01 + overObfuscation * 0.2);
  const claimBoundaryDamage = clamp(1 - claimContinuity);
  const humanRecoverability = clamp(semanticReconstruction * 0.45 + sequenceReconstruction * 0.25 + claimContinuity * 0.2 + (1 - overObfuscation) * 0.1);
  const parserPressure = clamp(syntaxFracture * 0.55 + slashCount * 0.06 + lineBreakCount * 0.06 + pivotHits * 0.04);
  const smoothBreak = clamp(syntaxFracture * 0.65 + (1 - (helperHits ? 0.4 : 0.08)) * 0.15 + lineBreakCount * 0.05);
  const regularizationResistance = clamp(syntaxFracture * 0.42 + parserPressure * 0.28 + pivotHits * 0.05 + (1 - memoPolish) * 0.1);
  const instability = clamp(cv * 0.35 + syntaxFracture * 0.35 + lineBreakCount * 0.05);
  const pivotDensity = rate(pivotHits, Math.max(sentenceList.length, 1));
  const unicodeScore = clamp(zw * 0.04 + homo * 0.04 + nonAscii * 0.01 + (options.unicode_perturbation_score || 0));
  const mapPresent = Number(Boolean(options.perturbation_map_present || options.unicode_perturbation_map_hash_sha256));
  const recoveryScore = options.normalization_recovery_score ?? (unicodeScore > 0.04 && !mapPresent ? 0 : 1);
  const accessibilityRisk = options.accessibility_degradation_risk ?? clamp(zw * 0.05 + homo * 0.04 + (unicodeScore > 0.04 && !mapPresent ? 0.28 : 0));
  const copyRisk = options.copy_paste_corruption_risk ?? clamp(zw * 0.04 + homo * 0.04 + (unicodeScore > 0.04 && !mapPresent ? 0.24 : 0));
  const features = Object.freeze({
    mean_sentence_length: Number(mean.toFixed(4)), sentence_length_variance: Number(v.toFixed(4)), sentence_length_cv: Number(cv.toFixed(4)), short_sentence_ratio: rate(lengths.filter((len) => len <= 6).length, lengths.length), fragment_ratio: rate(sentenceList.filter((sentence) => tokens(sentence).length <= 3).length, sentenceList.length), clause_chain_ratio: rate((value.match(/,|;|—|--/g) || []).length, Math.max(sentenceList.length, 1)), terminal_punctuation_distribution: terminalDistribution(value), comma_to_period_ratio: rate((value.match(/,/g) || []).length, Math.max((value.match(/\./g) || []).length, 1)), slash_usage_rate: rate(slashCount, Math.max(tokenList.length, 1)), plus_usage_rate: rate((value.match(/\+/g) || []).length, Math.max(tokenList.length, 1)), line_break_rate: rate(lineBreakCount, Math.max(tokenList.length, 1)), lexical_density: lexicalDensity(tokenList), type_token_ratio: uniqueRatio(tokenList), rare_word_pressure: rate(tokenList.filter((token) => token.length >= 10).length, Math.max(tokenList.length, 1)), function_word_distribution: clamp(1 - lexicalDensity(tokenList)), hedge_marker_rate: rate(hedgeHits, Math.max(tokenList.length, 1)), certainty_marker_rate: rate(certaintyHits, Math.max(tokenList.length, 1)), abbreviation_rate: rate(abbrevHits, Math.max(tokenList.length, 1)), register_marker_rate: rate(registerHits, Math.max(tokenList.length, 1)), generic_transition_rate: rate(helperHits, Math.max(sentenceList.length, 1)), mascot_phrase_rate: rate(options.mascot_phrase_hits || 0, Math.max(tokenList.length, 1)), sample_seed_overlap_rate: rate(sampleHits, Math.max(sampleTerms.length, 1)), generic_helper_voice_score: clamp(helperHits ? 0.22 + helperHits * 0.16 : 0.05), api_sheen_score: clamp(helperHits * 0.12 + wordHits(['polished', 'professional', 'streamlined', 'helpful'], tokenList) * 0.18), polish_pressure: clamp(wordHits(['polished', 'professional', 'streamlined', 'clearly', 'thoughtfully'], tokenList) * 0.2), symmetry_pressure: clamp(1 / (1 + v)), template_transition_score: clamp(helperHits * 0.12), corporate_smoothness_score: clamp(wordHits(['professional', 'streamlined'], tokenList) * 0.22), over_explained_clarity_score: clamp(wordHits(['clarity', 'clearly', 'important', 'comprehensive'], tokenList) * 0.14), blandness_entropy: clamp(1 - uniqueRatio(tokenList)), closure_lamination_score: clamp(wordHits(['overall', 'ultimately'], tokenList) ? 0.55 : 0.08), relational_proximity_score: clamp(relationalHits * 0.06 + rate(sharedRoomHits, Math.max(tokenList.length, 1)) * 1.4), familiarity_marker_rate: rate(intimacyHits, Math.max(tokenList.length, 1)), shared_room_implication_rate: rate(sharedRoomHits, Math.max(tokenList.length, 1)), direct_address_pressure: rate(directAddressHits, Math.max(tokenList.length, 1)), we_language_rate: rate((value.match(/\bwe\b|\bus\b/giu) || []).length, Math.max(tokenList.length, 1)), invented_intimacy_risk: clamp(intimacyHits * 0.12 + supportPhraseHits * 0.18 + threadLeakHits * 0.2), unsupported_care_marker_rate: rate((value.match(/\bcare\b|\bsupportive\b|\bmindful\b|\bgentle\b|\bgently\b|\bhelpful\b/giu) || []).length, Math.max(tokenList.length, 1)), fake_support_group_voice_score: clamp(supportPhraseHits * 0.22 + wordHits(['mindful', 'supportive', 'community', 'helpful', 'team', 'thoughtfully'], tokenList) * 0.1), emotional_overreach_score: clamp(intimacyHits * 0.1 + supportPhraseHits * 0.12), social_belonging_leakage_score: clamp(threadLeakHits * 0.25 + rate((value.match(/\beveryone\b|\bgroup\b|\bthread\b|\bhere\b|\bteam\b/giu) || []).length, Math.max(tokenList.length, 1))), thread_findable_crutch_rate: rate(threadLeakHits, Math.max(sentenceList.length, 1)), inside_room_reference_rate: rate(insideRoomHits, Math.max(sentenceList.length, 1)), unnecessary_audience_marker_rate: rate((value.match(/\beveryone\b|\bteam\b|\bgroup\b|\bcommunity\b/giu) || []).length, Math.max(tokenList.length, 1)), bulletin_board_tone_score: clamp(bulletinHits * 0.2 + wordHits(['please', 'ensure', 'review'], tokenList) * 0.04), low_drama_pressure_score: clamp(1 - rate(certaintyHits, Math.max(tokenList.length, 1)) - supportPhraseHits * 0.08 - escalationHits * 0.08), fact_pressure_preservation: factPressure, anchor_retention_under_warmth: clamp(factPressure * (1 - Math.max(0, intimacyHits - 1) * 0.08)), escalation_temperature: clamp(escalationHits * 0.12 + (value.match(/!/g) || []).length * 0.08), warmth_to_custody_ratio: clamp((relationalHits + intimacyHits + supportPhraseHits) / Math.max(registerHits + sampleHits + 1, 1) * 0.28), attachment_visibility_score: attachmentVisibility, date_visibility_score: dateVisibility, label_visibility_score: labelVisibility, handoff_object_retention: handoffRetention, next_action_visibility_score: clamp(handoffHits * 0.1 + pressureHits * 0.18 + lineBreakCount * 0.08), context_sufficiency_score: contextSufficiency, minimal_context_retention: contextSufficiency, under_explained_risk: underExplained, handoff_ambiguity_score: ambiguityScore, dropped_anchor_rate: droppedAnchorRate, over_compression_risk: overCompression, thin_handoff_score: overCompression, context_drop_score: underExplained, dropped_required_object_rate: droppedAnchorRate, communicated_thought_completion_score: communicatedCompletion, line_break_completion_ratio: lineBreakCompletion, line_break_pressure_score: lineBreakPressure, final_dispatch_cadence_score: finalDispatch, continued_after_completion_score: continuedAfterCompletion, pressure_segment_count: Math.min(lineList.length, 9), low_energy_cadence_score: lowEnergy, ordinary_roughness_score: clamp(lowEnergy * 0.55 + endPunctuationLooseness * 0.45), transition_suppression_score: clamp(1 - helperHits * 0.12 - memoHits * 0.18), low_ornament_score: lowOrnament, end_punctuation_looseness_score: endPunctuationLooseness, caps_artifact_rate: rate(allCaps, Math.max(tokenList.length, 1)), autocorrect_surface_pressure: clamp(rate(allCaps, Math.max(tokenList.length, 1)) + endPunctuationLooseness * 0.15), meaning_preserved_under_surface_noise: clamp(contextSufficiency * 0.62 + factPressure * 0.38), grammar_priority_score: clamp(1 - endPunctuationLooseness * 0.35 + memoHits * 0.18), punctuation_priority_score: clamp(1 - endPunctuationLooseness * 0.45 + memoHits * 0.15), pressure_annoyance_score: clamp(pressureHits * 0.1 + phraseHits(['already', 'still'], value) * 0.04), hostile_pressure_score: hostilePressure, repeat_request_pressure_score: clamp(phraseHits(['already', 'again'], value) * 0.14), operational_friction_score: clamp(pressureHits * 0.09), invented_fatigue_prop_rate: rate(fatigueHits, Math.max(sentenceList.length, 1)), fatigue_theater_score: fatigueTheater, vending_machine_cosplay_score: clamp(phraseHits(['vending-machine', 'vending machine'], value) * 0.5), fake_noir_pressure: clamp(phraseHits(['clock', 'fluorescent'], value) * 0.18), memo_polish_score: memoPolish, project_management_tone_score: projectTone, bulletin_board_handoff_score: clamp(memoPolish * 0.6 + bulletinHits * 0.18), overexplained_transition_score: clamp(helperHits * 0.1 + memoHits * 0.12), bounded_irregularity_index: clamp(cv * 0.42 + rate(punctuation, Math.max(tokenList.length, 1))), imperfection_budget_used: clamp(cv * 0.5 + rate(punctuation, Math.max(tokenList.length, 1))), rhythm_asymmetry_score: clamp(cv), punctuation_variability_score: clamp(rate(punctuation, Math.max(tokenList.length, 1)) * 4), controlled_fragment_score: rate(sentenceList.filter((sentence) => tokens(sentence).length <= 6).length, Math.max(sentenceList.length, 1)), nonuniformity_without_damage: clamp(1 - (options.factual_damage_risk || 0)), breath_retention_score: clamp(1 - helperHits * 0.08), sample_seed_lexical_overlap: rate(sampleHits, Math.max(sampleTerms.length, 1)), sample_seed_phrase_overlap: clamp(options.sample_seed_phrase_overlap || 0), rare_phrase_reuse: clamp(options.rare_phrase_reuse || 0), mascot_language_repetition: clamp(options.mascot_language_repetition || 0), signature_punctuation_cloning: clamp(options.signature_punctuation_cloning || 0), profile_reconstruction_risk: clamp(options.profile_reconstruction_risk || sampleHits * 0.12), private_cadence_exposure_risk: clamp(options.private_cadence_exposure_risk || sampleHits * 0.1), human_recoverability_score: humanRecoverability, semantic_reconstruction_score: semanticReconstruction, source_obligation_retention: semanticReconstruction, sequence_reconstruction_score: sequenceReconstruction, uncertainty_reconstruction_score: uncertaintyReconstruction, claim_continuity_score: claimContinuity, syntax_fracture_score: syntaxFracture, semantic_damage_risk: semanticDamage, transcription_damage_risk: transcriptionDamage, claim_boundary_damage_risk: claimBoundaryDamage, anchor_survival_rate: handoffRetention, fracture_without_damage_score: clamp(syntaxFracture * (1 - semanticDamage)), stylometric_regularization_resistance: regularizationResistance, feature_vector_instability_score: instability, cadence_predictability_drop: clamp(cv * 0.45 + lineBreakCount * 0.08), syntactic_smoothness_break: smoothBreak, authorship_feature_scramble_score: regularizationResistance, parser_confidence_pressure: parserPressure, dependency_parse_instability: parserPressure, sentence_boundary_ambiguity: clamp(rate(sentenceList.filter((sentence) => tokens(sentence).length <= 3).length, Math.max(sentenceList.length, 1)) + syntaxFracture * 0.2), line_fragmentation_pressure: clamp(lineBreakCount * 0.18), slash_logic_density: rate(slashCount, Math.max(tokenList.length, 1)), punctuation_discontinuity_score: clamp(punctuation * 0.035), antithetical_pivot_density: pivotDensity, contradiction_pressure_score: pivotDensity, not_this_but_that_score: pivotDensity, semantic_crosscurrent_score: clamp(pivotDensity + containsPhrase('either', value) * 0.08), laundering_resistance_phrase_score: clamp(containsPhrase('laundered', value) ? 0.5 : 0), unicode_perturbation_score: unicodeScore, zero_width_presence_rate: rate(zw, Math.max(tokenList.length, 1)), homoglyph_substitution_rate: rate(homo, Math.max(tokenList.length, 1)), normalization_recovery_score: clamp(recoveryScore), perturbation_map_present: mapPresent, accessibility_degradation_risk: clamp(accessibilityRisk), copy_paste_corruption_risk: clamp(copyRisk), witness_channel_suitability: clamp(humanRecoverability * 0.5 + regularizationResistance * 0.25 + claimContinuity * 0.25), high_legibility_environment_pressure: regularizationResistance, whistleblower_message_retention: humanRecoverability, sousveillance_resistance_score: regularizationResistance, selective_admissibility_risk: clamp(overObfuscation * 0.35 + unicodeScore * 0.2), over_obfuscation_risk: overObfuscation
  });
  return Object.freeze({ schema: HUSH_STYLOMETRIC_FEATURE_VECTOR_SCHEMA, text_hash_sha256: value ? await sha256Text(value) : null, raw_text_included: false, feature_vector: features, feature_vector_hash_sha256: await sha256Text(stableStringify(features)), limitations: Object.freeze(['heuristic local extractor', 'transformation behavior only']) });
}

function roleCentroid(role = 'baseline') {
  const base = { mean_sentence_length: 13, sentence_length_cv: 0.42, lexical_density: 0.62, hedge_marker_rate: 0.04, abbreviation_rate: 0.01, generic_helper_voice_score: 0.05, api_sheen_score: 0.08, bounded_irregularity_index: 0.42, breath_retention_score: 0.74 };
  if (role === 'adversarial_fracture') return { ...base, mean_sentence_length: 6, sentence_length_cv: 0.72, lexical_density: 0.69, hedge_marker_rate: 0.065, abbreviation_rate: 0.02, generic_helper_voice_score: 0.02, api_sheen_score: 0.02, bounded_irregularity_index: 0.68, breath_retention_score: 0.66 };
  if (role === 'quick_handoff') return { ...base, mean_sentence_length: 7, sentence_length_cv: 0.5, lexical_density: 0.66, hedge_marker_rate: 0.025, abbreviation_rate: 0.015, generic_helper_voice_score: 0.04, api_sheen_score: 0.04, bounded_irregularity_index: 0.48, breath_retention_score: 0.76 };
  if (role === 'small circle') return { ...base, mean_sentence_length: 10, sentence_length_cv: 0.48, lexical_density: 0.6, hedge_marker_rate: 0.04, abbreviation_rate: 0.025, generic_helper_voice_score: 0.04, api_sheen_score: 0.05, bounded_irregularity_index: 0.46, breath_retention_score: 0.78 };
  if (role === 'shorthand') return { ...base, mean_sentence_length: 8, sentence_length_cv: 0.54, abbreviation_rate: 0.08, bounded_irregularity_index: 0.52 };
  if (role === 'checklist') return { ...base, mean_sentence_length: 7, sentence_length_cv: 0.35, lexical_density: 0.68, bounded_irregularity_index: 0.34 };
  if (role === 'document_distance') return { ...base, mean_sentence_length: 15, sentence_length_cv: 0.34, hedge_marker_rate: 0.05, bounded_irregularity_index: 0.32 };
  if (role === 'register') return { ...base, mean_sentence_length: 9, sentence_length_cv: 0.52, abbreviation_rate: 0.06, bounded_irregularity_index: 0.5 };
  return base;
}

export async function buildMaskCentroid(maskRecord = {}, calibrationSamples = []) { const role = maskRecord.gallery_role || maskRecord.intended_role || maskRecord.family || 'baseline'; const centroid = roleCentroid(role); return Object.freeze({ schema: HUSH_MASK_CENTROID_SCHEMA, mask_id: maskRecord.mask_id || null, role, centroid_features: Object.freeze(centroid), calibration_sample_count: calibrationSamples.length, centroid_hash_sha256: await sha256Text(stableStringify(centroid)) }); }
export async function buildGenericAIBaseline(fixtures = []) { const sourceFixtures = fixtures.length ? fixtures : genericAiBaselineFixtures; const vectors = await Promise.all(sourceFixtures.map((fixture) => extractMaskFeatureVector(fixtureText(fixture)))); const avg = {}; for (const key of Object.keys(vectors[0].feature_vector)) { const values = vectors.map((vector) => vector.feature_vector[key]).filter((value) => typeof value === 'number'); if (values.length) avg[key] = Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(4)); } const classes = [...new Set(sourceFixtures.map(fixtureClass))]; return Object.freeze({ schema: HUSH_GENERIC_AI_BASELINE_SCHEMA, baseline_class: 'generic-ai-baseline-fixture-bank', baseline_version: 'generic-ai-baseline-fixture-bank/v1', fixture_count: sourceFixtures.length, baseline_fixture_count: sourceFixtures.length, baseline_classes: Object.freeze(classes), baseline_features: Object.freeze(avg), baseline_hash_sha256: await sha256Text(stableStringify({ avg, classes })) }); }
function distance(a = {}, b = {}, keys = []) { const used = keys.filter((key) => typeof a[key] === 'number' && typeof b[key] === 'number'); if (!used.length) return 1; const sum = used.reduce((total, key) => total + Math.pow(scaledDelta(key, a[key], b[key]), 2), 0); return clamp(Math.sqrt(sum / used.length)); }
export function scoreCandidateAgainstMask(candidateVector = {}, maskCentroid = {}, genericBaseline = {}, options = {}) { const features = candidateVector.feature_vector || candidateVector; const centroid = maskCentroid.centroid_features || maskCentroid; const baseline = genericBaseline.baseline_features || genericBaseline; const keys = options.keys || ['mean_sentence_length', 'sentence_length_cv', 'lexical_density', 'hedge_marker_rate', 'abbreviation_rate', 'generic_helper_voice_score', 'api_sheen_score', 'bounded_irregularity_index']; const maskDistance = distance(features, centroid, keys); const baselineDistance = distance(features, baseline, keys); return Object.freeze({ mask_centroid_distance: maskDistance, generic_ai_baseline_distance: baselineDistance, mask_family_fit: clamp(1 - maskDistance), role_behavior_fit: clamp(1 - Math.abs((features.bounded_irregularity_index || 0) - (centroid.bounded_irregularity_index || 0))), collision_risk: clamp(maskDistance < 0.08 ? 0.2 : 0.05), score_basis: 'heuristic feature distance' }); }
