import { stableCanonicalJson } from './safe-harbor-stylometry-v3.js';

export const GEN3_MATURITY_ENGINE_VERSION = 'td613.safe-harbor.authorship-maturity-engine/v1';
export const GEN3_STABILITY_RECEIPT_VERSION = 'td613.safe-harbor.stability-receipt/v1';
export const GEN3_WINDOW_POLICY_VERSION = 'td613.safe-harbor.window-policy/v1';
export const GEN3_NULL_POLICY_VERSION = 'td613.safe-harbor.stage2-null-policy/v1';

const LANES = Object.freeze(['future_self', 'past_self', 'higher_self']);
const CHECKPOINTS = Object.freeze([120, 240, 360]);
const LOCAL_TARGET = 120;
const LOCAL_WINDOWS_REQUIRED = 3;
const FUNCTION_WORDS = Object.freeze([
  'a', 'an', 'and', 'as', 'at', 'be', 'because', 'but', 'by', 'for', 'from', 'if',
  'in', 'into', 'it', 'of', 'on', 'or', 'so', 'that', 'the', 'then', 'this', 'to',
  'was', 'we', 'were', 'when', 'which', 'with', 'yet', 'you'
]);
const CONNECTIVES = Object.freeze([
  'although', 'because', 'but', 'consequently', 'however', 'instead', 'meanwhile',
  'nevertheless', 'otherwise', 'so', 'therefore', 'though', 'thus', 'yet'
]);
const BOUNDARY_MARKERS = Object.freeze(['and', 'but', 'so', 'because', 'however', 'yet', 'then']);
const FAMILY_KEYS = Object.freeze({
  rhythm: Object.freeze([
    'avg_word_length_norm', 'word_length_sd_norm', 'sentence_length_mean_norm',
    'sentence_length_sd_norm', 'line_break_rate', 'short_sentence_rate', 'long_sentence_rate'
  ]),
  punctuation: Object.freeze([
    'comma_rate', 'semicolon_rate', 'colon_rate', 'dash_rate', 'question_rate',
    'exclamation_rate', 'parenthesis_rate'
  ]),
  function_words: Object.freeze(FUNCTION_WORDS.map((word) => `fw_${word}`)),
  discourse: Object.freeze([
    ...CONNECTIVES.map((word) => `cx_${word}`),
    'boundary_marker_rate', 'qualification_rate', 'contrast_rate', 'closure_rate'
  ]),
  lexical_shape: Object.freeze([
    'type_token_ratio', 'hapax_rate', 'digit_token_rate', 'long_word_rate'
  ])
});
const FAMILY_WEIGHTS = Object.freeze({
  rhythm: 0.25,
  punctuation: 0.2,
  function_words: 0.25,
  discourse: 0.2,
  lexical_shape: 0.1
});
const FORBIDDEN_INFERENCE_TERMS = Object.freeze([
  'personality', 'trauma', 'intelligence', 'resilience', 'mental state', 'diagnosis',
  'race', 'ethnicity', 'gender', 'sexuality', 'religion', 'political affiliation'
]);

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function clamp01(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function round(value, digits = 6) {
  if (!Number.isFinite(value)) return 0;
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}

function mean(values) {
  const finite = values.filter(Number.isFinite);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : 0;
}

function standardDeviation(values) {
  if (!values.length) return 0;
  const center = mean(values);
  return Math.sqrt(mean(values.map((value) => (value - center) ** 2)));
}

async function sha256Hex(input) {
  const source = String(input || '');
  if (globalThis.crypto?.subtle && globalThis.TextEncoder) {
    const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(source));
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  const crypto = await import('node:crypto');
  return crypto.createHash('sha256').update(source).digest('hex');
}

async function taggedDigest(value) {
  return `sha256:${await sha256Hex(typeof value === 'string' ? value : stableCanonicalJson(value))}`;
}

function normalizeText(text) {
  return String(text || '').replace(/\r\n?/gu, '\n');
}

function tokenValues(text) {
  return normalizeText(text).toLocaleLowerCase('en-US').match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) || [];
}

function sentenceFragments(text) {
  const source = normalizeText(text);
  const fragments = source.match(/[^.!?\n]+(?:[.!?]+|\n+|$)/gu) || [];
  return fragments
    .map((raw, index) => ({
      index,
      raw,
      tokens: tokenValues(raw),
      terminator: (raw.match(/[.!?]+(?=\s*$)/u) || [''])[0],
      line_breaks: (raw.match(/\n/gu) || []).length
    }))
    .filter((unit) => unit.tokens.length > 0);
}

function blockFromUnits(units, startIndex, targetWords) {
  const selected = [];
  let count = 0;
  let cursor = startIndex;
  while (cursor < units.length && count < targetWords) {
    selected.push(units[cursor]);
    count += units[cursor].tokens.length;
    cursor += 1;
  }
  return {
    units: selected,
    start_unit: startIndex,
    end_unit_exclusive: cursor,
    observed_words: count,
    target_words: targetWords,
    complete: count >= targetWords
  };
}

function cumulativeBlock(units, targetWords) {
  return blockFromUnits(units, 0, targetWords);
}

function localBlocks(units, targetWords = LOCAL_TARGET, required = LOCAL_WINDOWS_REQUIRED) {
  const blocks = [];
  let cursor = 0;
  while (cursor < units.length && blocks.length < required) {
    const block = blockFromUnits(units, cursor, targetWords);
    blocks.push(block);
    cursor = block.end_unit_exclusive;
  }
  while (blocks.length < required) {
    blocks.push({
      units: [],
      start_unit: cursor,
      end_unit_exclusive: cursor,
      observed_words: 0,
      target_words: targetWords,
      complete: false
    });
  }
  return blocks;
}

function flattenTokens(units) {
  return units.flatMap((unit) => unit.tokens);
}

function sourceForUnits(units) {
  return units.map((unit) => unit.raw).join('');
}

function promptTokenSet(promptText) {
  return new Set(tokenValues(promptText));
}

function ablatePromptTokens(tokens, promptSet) {
  if (!promptSet || promptSet.size === 0) return tokens.slice();
  return tokens.filter((token) => !promptSet.has(token));
}

function rate(count, denominator) {
  return denominator ? round(count / denominator) : 0;
}

function punctuationCount(source, pattern) {
  return (source.match(pattern) || []).length;
}

function countToken(tokens, token) {
  let count = 0;
  for (const value of tokens) if (value === token) count += 1;
  return count;
}

function featureVectorForUnits(units, promptSet = new Set()) {
  const source = sourceForUnits(units);
  const rawTokens = flattenTokens(units);
  const tokens = ablatePromptTokens(rawTokens, promptSet);
  const denominator = Math.max(rawTokens.length, 1);
  const lexicalDenominator = Math.max(tokens.length, 1);
  const sentenceLengths = units.map((unit) => unit.tokens.length);
  const wordLengths = tokens.map((token) => Array.from(token).length);
  const frequencies = new Map();
  for (const token of tokens) frequencies.set(token, (frequencies.get(token) || 0) + 1);
  const unique = frequencies.size;
  const hapax = Array.from(frequencies.values()).filter((count) => count === 1).length;
  const starts = units.map((unit) => unit.tokens[0]).filter(Boolean);
  const endTokens = units.map((unit) => unit.tokens[unit.tokens.length - 1]).filter(Boolean);
  const vector = {
    avg_word_length_norm: clamp01(mean(wordLengths) / 12),
    word_length_sd_norm: clamp01(standardDeviation(wordLengths) / 8),
    sentence_length_mean_norm: clamp01(mean(sentenceLengths) / 80),
    sentence_length_sd_norm: clamp01(standardDeviation(sentenceLengths) / 80),
    line_break_rate: clamp01(punctuationCount(source, /\n/gu) / denominator),
    short_sentence_rate: rate(sentenceLengths.filter((length) => length <= 8).length, sentenceLengths.length),
    long_sentence_rate: rate(sentenceLengths.filter((length) => length >= 30).length, sentenceLengths.length),
    comma_rate: clamp01(punctuationCount(source, /,/gu) / denominator),
    semicolon_rate: clamp01(punctuationCount(source, /;/gu) / denominator),
    colon_rate: clamp01(punctuationCount(source, /:/gu) / denominator),
    dash_rate: clamp01(punctuationCount(source, /[—–-]/gu) / denominator),
    question_rate: clamp01(punctuationCount(source, /\?/gu) / denominator),
    exclamation_rate: clamp01(punctuationCount(source, /!/gu) / denominator),
    parenthesis_rate: clamp01(punctuationCount(source, /[()]/gu) / denominator),
    boundary_marker_rate: rate(starts.filter((token) => BOUNDARY_MARKERS.includes(token)).length, starts.length),
    qualification_rate: rate(tokens.filter((token) => ['perhaps', 'may', 'might', 'could', 'likely', 'approximately'].includes(token)).length, lexicalDenominator),
    contrast_rate: rate(tokens.filter((token) => ['but', 'however', 'although', 'yet', 'instead', 'nevertheless'].includes(token)).length, lexicalDenominator),
    closure_rate: rate(endTokens.filter((token) => ['therefore', 'thus', 'finally', 'accordingly', 'return'].includes(token)).length, endTokens.length),
    type_token_ratio: rate(unique, lexicalDenominator),
    hapax_rate: rate(hapax, Math.max(unique, 1)),
    digit_token_rate: rate(tokens.filter((token) => /^\p{N}+$/u.test(token)).length, lexicalDenominator),
    long_word_rate: rate(wordLengths.filter((length) => length >= 9).length, lexicalDenominator)
  };
  for (const word of FUNCTION_WORDS) vector[`fw_${word}`] = rate(countToken(tokens, word), lexicalDenominator);
  for (const word of CONNECTIVES) vector[`cx_${word}`] = rate(countToken(tokens, word), lexicalDenominator);
  return {
    vector: Object.freeze(Object.fromEntries(Object.entries(vector).map(([key, value]) => [key, round(value)]))),
    observed_words: rawTokens.length,
    ablated_words: tokens.length,
    prompt_overlap_rate: rate(rawTokens.length - tokens.length, denominator),
    sentence_count: units.length,
    raw_text_included: false
  };
}

function familySimilarity(left, right, family) {
  const keys = FAMILY_KEYS[family] || [];
  if (!keys.length) return 0;
  const distance = mean(keys.map((key) => Math.min(1, Math.abs((left[key] || 0) - (right[key] || 0)))));
  return round(clamp01(1 - distance));
}

function allPairIndexes(length) {
  const pairs = [];
  for (let left = 0; left < length; left += 1) {
    for (let right = left + 1; right < length; right += 1) pairs.push([left, right]);
  }
  return pairs;
}

function aggregateSimilarities(vectors, family) {
  const pairs = allPairIndexes(vectors.length);
  return round(mean(pairs.map(([left, right]) => familySimilarity(vectors[left], vectors[right], family))));
}

function familyStatus(withinScore, crossScore, complete, promptDominated) {
  if (!complete) return 'insufficient-evidence';
  if (promptDominated) return 'prompt-dependent';
  if (withinScore >= 0.94 && crossScore >= 0.9) return 'recurrent-stable';
  if (withinScore >= 0.82 && crossScore >= 0.74) return 'context-responsive';
  return 'unstable';
}

function laneSufficiency(wordCount) {
  if (wordCount < 120) return 'insufficient';
  if (wordCount < 240) return 'provisional';
  if (wordCount < 360) return 'comparative';
  return 'stability-eligible';
}

function maturityState(lanes, familySummaries, promptDominated) {
  const states = LANES.map((lane) => lanes[lane].sufficiency_state);
  if (states.some((state) => state === 'insufficient')) return 'insufficient';
  if (states.some((state) => state === 'provisional')) return 'provisional';
  if (states.some((state) => state === 'comparative')) return 'comparative';
  if (promptDominated) return 'prompt-dominated';
  const stable = Object.values(familySummaries).filter((family) => family.status === 'recurrent-stable').length;
  const contextResponsive = Object.values(familySummaries).filter((family) => family.status === 'context-responsive').length;
  if (stable >= 2 && stable + contextResponsive >= 4) return 'mature-recurrent';
  if (stable + contextResponsive >= 3) return 'mature-context-responsive';
  return 'unstable-evidence';
}

function weightedScore(familySummaries, key) {
  let sum = 0;
  let weight = 0;
  for (const [family, summary] of Object.entries(familySummaries)) {
    const familyWeight = FAMILY_WEIGHTS[family] || 0;
    sum += (summary[key] || 0) * familyWeight;
    weight += familyWeight;
  }
  return round(weight ? sum / weight : 0);
}

function chronologyVector(windowVectors) {
  if (windowVectors.length < 2) return [];
  const keys = ['sentence_length_mean_norm', 'comma_rate', 'boundary_marker_rate', 'contrast_rate', 'type_token_ratio'];
  const transitions = [];
  for (let index = 1; index < windowVectors.length; index += 1) {
    for (const key of keys) transitions.push(round((windowVectors[index][key] || 0) - (windowVectors[index - 1][key] || 0)));
  }
  return transitions;
}

function vectorDistance(left, right) {
  const length = Math.max(left.length, right.length, 1);
  let sum = 0;
  for (let index = 0; index < length; index += 1) sum += Math.abs((left[index] || 0) - (right[index] || 0));
  return round(sum / length);
}

function chronologyNull(windowVectors) {
  const original = chronologyVector(windowVectors);
  const shuffledOrder = windowVectors.length >= 3 ? [windowVectors[2], windowVectors[0], windowVectors[1]] : windowVectors.slice().reverse();
  const shuffled = chronologyVector(shuffledOrder);
  const separation = vectorDistance(original, shuffled);
  return {
    policy_version: GEN3_NULL_POLICY_VERSION,
    original_transition_count: original.length,
    shuffled_transition_count: shuffled.length,
    normalized_separation: separation,
    authority: separation >= 0.08 ? 'chronology-sensitive-candidate' : 'chronology-non-diagnostic',
    rule: 'Equivalent or near-equivalent shuffled chronology reduces dynamic-signature authority.'
  };
}

function promptOnlyControl(laneVectors, promptTexts = {}) {
  const results = {};
  for (const lane of LANES) {
    const promptUnits = sentenceFragments(promptTexts[lane] || '');
    if (!promptUnits.length || !laneVectors[lane]) {
      results[lane] = { available: false, similarity: null };
      continue;
    }
    const promptVector = featureVectorForUnits(promptUnits, new Set()).vector;
    results[lane] = {
      available: true,
      similarity: familySimilarity(laneVectors[lane], promptVector, 'lexical_shape')
    };
  }
  const available = Object.values(results).filter((item) => item.available && Number.isFinite(item.similarity));
  const meanSimilarity = available.length ? round(mean(available.map((item) => item.similarity))) : null;
  return {
    lanes: results,
    mean_similarity: meanSimilarity,
    prompt_dominated: Number.isFinite(meanSimilarity) && meanSimilarity >= 0.94,
    authority: available.length === LANES.length ? 'measured' : 'insufficient-control'
  };
}

function forbiddenInferenceAudit(value) {
  const text = stableCanonicalJson(value).toLocaleLowerCase('en-US');
  const findings = FORBIDDEN_INFERENCE_TERMS.filter((term) => text.includes(term));
  return {
    status: findings.length ? 'review-required' : 'pass',
    findings,
    policy: 'Observable textual organization only; protected attributes, psychology, diagnosis, cognition, and identity adjudication remain outside authority.'
  };
}

async function evidenceId(prefix, value) {
  const digest = await sha256Hex(stableCanonicalJson(value));
  return `${prefix}-${digest.slice(0, 12).toUpperCase()}`;
}

async function describeBlock(lane, kind, ordinal, block, promptSet) {
  const features = featureVectorForUnits(block.units, promptSet);
  const digestPayload = {
    lane,
    kind,
    ordinal,
    start_unit: block.start_unit,
    end_unit_exclusive: block.end_unit_exclusive,
    target_words: block.target_words,
    observed_words: block.observed_words,
    complete: block.complete,
    feature_vector: features.vector,
    prompt_overlap_rate: features.prompt_overlap_rate,
    sentence_count: features.sentence_count
  };
  return {
    evidence_id: await evidenceId(`AE-${lane.toUpperCase()}-${kind.toUpperCase()}-${ordinal}`, digestPayload),
    ...digestPayload,
    ablated_words: features.ablated_words,
    raw_text_included: false,
    evidence_digest: await taggedDigest(digestPayload)
  };
}

async function buildLaneEvidence(lane, text, promptText) {
  const units = sentenceFragments(text);
  const promptSet = promptTokenSet(promptText);
  const checkpoints = {};
  for (const target of CHECKPOINTS) {
    checkpoints[String(target)] = await describeBlock(lane, 'checkpoint', target, cumulativeBlock(units, target), promptSet);
  }
  const local = [];
  const blocks = localBlocks(units);
  for (let index = 0; index < blocks.length; index += 1) {
    local.push(await describeBlock(lane, 'local', index + 1, blocks[index], promptSet));
  }
  const observedWords = flattenTokens(units).length;
  const completeVectors = local.filter((item) => item.complete).map((item) => item.feature_vector);
  const within = {};
  for (const family of Object.keys(FAMILY_KEYS)) {
    within[family] = {
      local_window_similarity: completeVectors.length >= 2 ? aggregateSimilarities(completeVectors, family) : null,
      complete_windows: completeVectors.length,
      status: completeVectors.length === LOCAL_WINDOWS_REQUIRED ? 'measured' : 'insufficient-evidence'
    };
  }
  return {
    lane,
    observed_words: observedWords,
    sufficiency_state: laneSufficiency(observedWords),
    sentence_count: units.length,
    checkpoint_snapshots: checkpoints,
    local_windows: local,
    within_lane_recurrence: within,
    prompt_overlap_rate: checkpoints['360'].prompt_overlap_rate,
    chronology_null: chronologyNull(completeVectors),
    raw_text_included: false
  };
}

function cp360Vector(laneEvidence) {
  return laneEvidence?.checkpoint_snapshots?.['360']?.feature_vector || null;
}

function antiSamenessAudit(lanes, familySummaries) {
  const vectors = LANES.map((lane) => cp360Vector(lanes[lane])).filter(Boolean);
  const exactDigests = vectors.map((vector) => stableCanonicalJson(vector));
  const exactDuplicate = exactDigests.length === LANES.length && new Set(exactDigests).size === 1;
  const crossWeighted = weightedScore(familySummaries, 'cross_lane_similarity');
  return {
    status: exactDuplicate || crossWeighted >= 0.995 ? 'review-required' : 'pass',
    exact_cross_lane_vector_duplicate: exactDuplicate,
    weighted_cross_lane_similarity: crossWeighted,
    rule: 'Near-perfect sameness across elicitation lanes is treated as a calibration concern, not stronger authorship proof.'
  };
}

function suppliedControlNulls(controlProfiles = {}, laneVectors = {}) {
  const results = {};
  for (const [controlId, control] of Object.entries(controlProfiles || {})) {
    const controlVector = control?.feature_vector || control?.vector || null;
    if (!controlVector) {
      results[controlId] = { status: 'insufficient-control', mean_similarity: null };
      continue;
    }
    const similarities = LANES.map((lane) => laneVectors[lane])
      .filter(Boolean)
      .map((vector) => mean(Object.keys(FAMILY_KEYS).map((family) => familySimilarity(vector, controlVector, family))));
    results[controlId] = {
      status: similarities.length ? 'measured' : 'insufficient-control',
      mean_similarity: similarities.length ? round(mean(similarities)) : null,
      control_class: control?.control_class || 'declared-control'
    };
  }
  return results;
}

export async function buildAuthorshipMaturityEvidence(segments = {}, options = {}) {
  const promptTexts = options.promptTexts || {};
  const lanes = {};
  for (const lane of LANES) lanes[lane] = await buildLaneEvidence(lane, segments[lane] || '', promptTexts[lane] || '');
  const laneVectors = Object.fromEntries(LANES.map((lane) => [lane, cp360Vector(lanes[lane])]));
  const completeCrossVectors = LANES.map((lane) => laneVectors[lane]).filter(Boolean);
  const meanPromptOverlap = round(mean(LANES.map((lane) => lanes[lane].prompt_overlap_rate || 0)));
  const promptControl = promptOnlyControl(laneVectors, promptTexts);
  const promptDominated = meanPromptOverlap >= 0.35 || promptControl.prompt_dominated;
  const families = {};
  for (const family of Object.keys(FAMILY_KEYS)) {
    const withinScores = LANES.map((lane) => lanes[lane].within_lane_recurrence[family].local_window_similarity).filter(Number.isFinite);
    const within = withinScores.length === LANES.length ? round(mean(withinScores)) : null;
    const cross = completeCrossVectors.length === LANES.length ? aggregateSimilarities(completeCrossVectors, family) : null;
    const complete = Number.isFinite(within) && Number.isFinite(cross);
    families[family] = {
      within_lane_similarity: within,
      cross_lane_similarity: cross,
      status: familyStatus(within || 0, cross || 0, complete, promptDominated && family === 'lexical_shape'),
      prompt_sensitivity: family === 'lexical_shape' ? 'high' : family === 'function_words' ? 'low' : 'moderate',
      keys: FAMILY_KEYS[family].slice()
    };
  }
  const maturity = maturityState(lanes, families, promptDominated);
  const blockers = [];
  for (const lane of LANES) {
    if (lanes[lane].sufficiency_state !== 'stability-eligible') blockers.push(`${lane}:${lanes[lane].sufficiency_state}`);
    if (lanes[lane].local_windows.filter((window) => window.complete).length < LOCAL_WINDOWS_REQUIRED) blockers.push(`${lane}:local-window-shortfall`);
  }
  if (promptDominated) blockers.push('prompt-dominated');
  if (Object.values(families).every((family) => family.status === 'unstable')) blockers.push('no-recurrent-feature-family');
  const chronology = Object.fromEntries(LANES.map((lane) => [lane, lanes[lane].chronology_null]));
  const suppliedNulls = suppliedControlNulls(options.controlProfiles || {}, laneVectors);
  const receiptCore = {
    schema_version: GEN3_STABILITY_RECEIPT_VERSION,
    engine_version: GEN3_MATURITY_ENGINE_VERSION,
    window_policy_version: GEN3_WINDOW_POLICY_VERSION,
    maturity_state: maturity,
    blockers,
    family_summaries: families,
    weighted_within_lane_recurrence: weightedScore(families, 'within_lane_similarity'),
    weighted_cross_lane_recurrence: weightedScore(families, 'cross_lane_similarity'),
    prompt_overlap_rate: meanPromptOverlap,
    prompt_control: promptControl,
    chronology_nulls: chronology,
    supplied_control_nulls: suppliedNulls,
    uncertainty: {
      statement: 'These measurements describe recurrence among observable textual structures under declared elicitation conditions. They do not adjudicate identity, ownership, cognition, or universal authorship.',
      model_dependent: false,
      raw_text_included: false
    }
  };
  const stabilityDigest = await taggedDigest(receiptCore);
  const receipt = {
    ...receiptCore,
    stability_digest: stabilityDigest,
    status: blockers.length ? 'bounded-with-blockers' : 'measured',
    identity_probability: null,
    raw_text_included: false
  };
  const evidence = {
    schema_version: 'td613.safe-harbor.authorship-maturity-evidence/v1',
    engine_version: GEN3_MATURITY_ENGINE_VERSION,
    window_policy: {
      schema_version: GEN3_WINDOW_POLICY_VERSION,
      sentence_aware: true,
      checkpoint_targets: CHECKPOINTS.slice(),
      local_target_words: LOCAL_TARGET,
      required_local_windows_per_lane: LOCAL_WINDOWS_REQUIRED,
      non_overlapping_local_windows: true,
      boundary_rule: 'Accumulate whole sentence units until the target is met or source is exhausted.'
    },
    lanes,
    family_summaries: families,
    prompt_conditioned_features: {
      mean_prompt_overlap_rate: meanPromptOverlap,
      prompt_control: promptControl,
      prompt_dominated: promptDominated,
      vocabulary_ablation_applied: true,
      prompt_text_exported: false
    },
    stability_receipt: receipt,
    anti_sameness_audit: antiSamenessAudit(lanes, families),
    forbidden_inference_audit: null,
    null_models: {
      chronology_destruction: chronology,
      prompt_only: promptControl,
      supplied_controls: suppliedNulls
    },
    raw_text_included: false
  };
  evidence.forbidden_inference_audit = forbiddenInferenceAudit({
    engine_version: evidence.engine_version,
    family_summaries: evidence.family_summaries,
    prompt_conditioned_features: evidence.prompt_conditioned_features,
    null_models: evidence.null_models
  });
  evidence.evidence_digest = await taggedDigest({ ...evidence, evidence_digest: undefined });
  return evidence;
}

export function applyAuthorshipMaturityEvidence(packet = {}, maturityEvidence = null) {
  if (!packet || typeof packet !== 'object' || !maturityEvidence) return packet;
  const out = clone(packet);
  out.authorship_evidence = out.authorship_evidence && typeof out.authorship_evidence === 'object'
    ? out.authorship_evidence
    : {};
  out.authorship_evidence.checkpoint_snapshots = Object.fromEntries(LANES.map((lane) => [
    lane,
    clone(maturityEvidence?.lanes?.[lane]?.checkpoint_snapshots || {})
  ]));
  out.authorship_evidence.within_lane_invariants = Object.fromEntries(LANES.map((lane) => [
    lane,
    clone(maturityEvidence?.lanes?.[lane]?.within_lane_recurrence || {})
  ]));
  out.authorship_evidence.cross_lane_invariants = clone(maturityEvidence.family_summaries || {});
  out.authorship_evidence.prompt_conditioned_features = clone(maturityEvidence.prompt_conditioned_features || {});
  out.authorship_evidence.stability_receipt = clone(maturityEvidence.stability_receipt || {});
  out.authorship_evidence.authorship_maturity = {
    schema_version: maturityEvidence.schema_version,
    engine_version: maturityEvidence.engine_version,
    window_policy: clone(maturityEvidence.window_policy),
    anti_sameness_audit: clone(maturityEvidence.anti_sameness_audit),
    forbidden_inference_audit: clone(maturityEvidence.forbidden_inference_audit),
    null_models: clone(maturityEvidence.null_models),
    evidence_digest: maturityEvidence.evidence_digest,
    raw_text_included: false
  };
  return out;
}

export function auditEntrantSwap(reportA = {}, reportB = {}) {
  const signatureA = stableCanonicalJson(reportA?.sections?.authorship_signature?.content || {});
  const signatureB = stableCanonicalJson(reportB?.sections?.authorship_signature?.content || {});
  const sameSignature = signatureA === signatureB && signatureA !== '{}';
  const evidenceA = stableCanonicalJson(reportA?.evidence_links || {});
  const evidenceB = stableCanonicalJson(reportB?.evidence_links || {});
  const sameEvidenceMap = evidenceA === evidenceB && evidenceA !== '{}';
  return {
    schema_version: 'td613.safe-harbor.entrant-swap-audit/v1',
    status: sameSignature || sameEvidenceMap ? 'review-required' : 'pass',
    same_authorship_signature: sameSignature,
    same_evidence_map: sameEvidenceMap,
    rule: 'A report that survives entrant substitution without material evidence-linked change loses interpretive authority.'
  };
}

export function maturityEngineContainsForbiddenClaim(value) {
  return forbiddenInferenceAudit(value).status !== 'pass';
}

export function maturityEngineContainsRawText(value) {
  const serialized = stableCanonicalJson(value);
  return /"(?:raw_text|source_text|entrant_text|window_text|prompt_text)"\s*:/u.test(serialized);
}
