import { stableCanonicalJson } from './safe-harbor-stylometry-v3.js';

export const BLIND_CUSTODY_SCHEMA = 'td613.safe-harbor.blind-custody-challenge/v1';
export const BLIND_CUSTODY_PROTOCOL = 'td613.safe-harbor.blind-custody-protocol/v1';
export const BLIND_CUSTODY_PROFILE_POLICY = 'td613.safe-harbor.blind-profile-policy/v1';
export const BLIND_CUSTODY_DISTANCE_POLICY = 'td613.safe-harbor.blind-distance-policy/v1';
export const BLIND_CUSTODY_OUTCOMES = Object.freeze([
  'SUPPORTED',
  'INCONCLUSIVE',
  'FAILED',
  'CONTAMINATED',
  'PROMPT-DOMINATED',
  'IMITATION-COLLISION'
]);
export const REQUIRED_CANDIDATE_CLASSES = Object.freeze([
  'genuine-holdout',
  'topic-matched-human-control',
  'semantic-paraphrase-control',
  'llm-style-imitation-control',
  'register-shifted-entrant-control',
  'different-author-same-prompt-control',
  'prompt-only-synthetic-control',
  'lane-or-genre-shift-control'
]);

const LANES = Object.freeze(['future_self', 'past_self', 'higher_self']);
const WINDOW_TARGET = 120;
const WINDOWS_PER_LANE = 3;
const FUNCTION_WORDS = Object.freeze([
  'a', 'an', 'and', 'as', 'at', 'be', 'because', 'but', 'by', 'for', 'from', 'if',
  'in', 'into', 'it', 'of', 'on', 'or', 'so', 'that', 'the', 'then', 'this', 'to',
  'was', 'we', 'were', 'when', 'which', 'with', 'yet', 'you'
]);
const DISCOURSE_WORDS = Object.freeze([
  'although', 'because', 'but', 'consequently', 'however', 'instead', 'meanwhile',
  'nevertheless', 'otherwise', 'therefore', 'though', 'thus', 'yet'
]);
const FAMILY_KEYS = Object.freeze({
  sentence_rhythm: Object.freeze([
    'sentence_length_mean', 'sentence_length_sd', 'short_sentence_rate', 'long_sentence_rate'
  ]),
  punctuation_boundary: Object.freeze([
    'comma_rate', 'semicolon_rate', 'colon_rate', 'dash_rate', 'question_rate',
    'exclamation_rate', 'parenthesis_rate', 'line_break_rate'
  ]),
  function_word_routing: Object.freeze(FUNCTION_WORDS.map((word) => `fw_${word}`)),
  structural_transition: Object.freeze([
    ...DISCOURSE_WORDS.map((word) => `cx_${word}`),
    'contrast_rate', 'qualification_rate', 'closure_rate'
  ]),
  lexical_shape: Object.freeze([
    'word_length_mean', 'word_length_sd', 'type_token_ratio', 'hapax_rate',
    'long_word_rate', 'digit_token_rate'
  ])
});
const DEFAULT_WEIGHTS = Object.freeze({
  sentence_rhythm: 0.24,
  punctuation_boundary: 0.2,
  function_word_routing: 0.24,
  structural_transition: 0.22,
  lexical_shape: 0.1
});
const DEFAULT_THRESHOLDS = Object.freeze({
  supported_max_rank: 2,
  supported_min_margin: 0.035,
  failed_min_rank: 5,
  prompt_leakage_rate: 0.35,
  imitation_collision_margin: 0.02,
  contamination_profile_distance: 0.000001
});

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function isObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function clamp01(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function round(value, places = 6) {
  if (!Number.isFinite(value)) return 0;
  const scale = 10 ** places;
  return Math.round(value * scale) / scale;
}

function mean(values = []) {
  const finite = values.map(Number).filter(Number.isFinite);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : 0;
}

function standardDeviation(values = []) {
  if (!values.length) return 0;
  const center = mean(values);
  return Math.sqrt(mean(values.map((value) => (value - center) ** 2)));
}

async function sha256Hex(value) {
  const source = String(value || '');
  if (globalThis.crypto?.subtle && globalThis.TextEncoder) {
    const bytes = new TextEncoder().encode(source);
    const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  const crypto = await import('node:crypto');
  return crypto.createHash('sha256').update(source).digest('hex');
}

async function taggedDigest(value) {
  return `sha256:${await sha256Hex(typeof value === 'string' ? value : stableCanonicalJson(value))}`;
}

function tokens(text) {
  return String(text || '').toLocaleLowerCase('en-US').match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) || [];
}

function sentences(text) {
  return (String(text || '').replace(/\r\n?/gu, '\n').match(/[^.!?\n]+(?:[.!?]+|\n+|$)/gu) || [])
    .map((raw, index) => ({ index, raw, tokens: tokens(raw) }))
    .filter((unit) => unit.tokens.length > 0);
}

function takeWindow(units, start, target = WINDOW_TARGET) {
  const selected = [];
  let cursor = start;
  let observed = 0;
  while (cursor < units.length && observed < target) {
    selected.push(units[cursor]);
    observed += units[cursor].tokens.length;
    cursor += 1;
  }
  return {
    units: selected,
    start_unit: start,
    end_unit_exclusive: cursor,
    target_words: target,
    observed_words: observed,
    complete: observed >= target
  };
}

function sourceForUnits(units) {
  return units.map((unit) => unit.raw).join('');
}

function countToken(values, token) {
  let total = 0;
  for (const value of values) if (value === token) total += 1;
  return total;
}

function punctuationCount(text, pattern) {
  return (String(text || '').match(pattern) || []).length;
}

function ratio(numerator, denominator) {
  return denominator ? round(numerator / denominator) : 0;
}

function promptSet(promptText = '') {
  return new Set(tokens(promptText));
}

function extractTransparentFeatures(text, promptText = '') {
  const source = String(text || '');
  const sentenceUnits = sentences(source);
  const rawTokens = sentenceUnits.flatMap((unit) => unit.tokens);
  const promptVocabulary = promptSet(promptText);
  const filtered = rawTokens.filter((token) => !promptVocabulary.has(token));
  const denominator = Math.max(rawTokens.length, 1);
  const lexicalDenominator = Math.max(filtered.length, 1);
  const sentenceLengths = sentenceUnits.map((unit) => unit.tokens.length);
  const wordLengths = filtered.map((token) => Array.from(token).length);
  const frequencies = new Map();
  for (const token of filtered) frequencies.set(token, (frequencies.get(token) || 0) + 1);
  const starts = sentenceUnits.map((unit) => unit.tokens[0]).filter(Boolean);
  const ends = sentenceUnits.map((unit) => unit.tokens[unit.tokens.length - 1]).filter(Boolean);
  const featureVector = {
    sentence_length_mean: clamp01(mean(sentenceLengths) / 80),
    sentence_length_sd: clamp01(standardDeviation(sentenceLengths) / 80),
    short_sentence_rate: ratio(sentenceLengths.filter((length) => length <= 8).length, sentenceLengths.length),
    long_sentence_rate: ratio(sentenceLengths.filter((length) => length >= 30).length, sentenceLengths.length),
    comma_rate: clamp01(punctuationCount(source, /,/gu) / denominator),
    semicolon_rate: clamp01(punctuationCount(source, /;/gu) / denominator),
    colon_rate: clamp01(punctuationCount(source, /:/gu) / denominator),
    dash_rate: clamp01(punctuationCount(source, /[—–-]/gu) / denominator),
    question_rate: clamp01(punctuationCount(source, /\?/gu) / denominator),
    exclamation_rate: clamp01(punctuationCount(source, /!/gu) / denominator),
    parenthesis_rate: clamp01(punctuationCount(source, /[()]/gu) / denominator),
    line_break_rate: clamp01(punctuationCount(source, /\n/gu) / denominator),
    contrast_rate: ratio(filtered.filter((token) => ['but', 'however', 'although', 'yet', 'instead', 'nevertheless'].includes(token)).length, lexicalDenominator),
    qualification_rate: ratio(filtered.filter((token) => ['perhaps', 'may', 'might', 'could', 'likely', 'approximately'].includes(token)).length, lexicalDenominator),
    closure_rate: ratio(ends.filter((token) => ['therefore', 'thus', 'finally', 'accordingly', 'return'].includes(token)).length, ends.length),
    word_length_mean: clamp01(mean(wordLengths) / 12),
    word_length_sd: clamp01(standardDeviation(wordLengths) / 8),
    type_token_ratio: ratio(frequencies.size, lexicalDenominator),
    hapax_rate: ratio(Array.from(frequencies.values()).filter((value) => value === 1).length, Math.max(frequencies.size, 1)),
    long_word_rate: ratio(wordLengths.filter((length) => length >= 9).length, lexicalDenominator),
    digit_token_rate: ratio(filtered.filter((token) => /^\p{N}+$/u.test(token)).length, lexicalDenominator)
  };
  for (const word of FUNCTION_WORDS) featureVector[`fw_${word}`] = ratio(countToken(filtered, word), lexicalDenominator);
  for (const word of DISCOURSE_WORDS) featureVector[`cx_${word}`] = ratio(countToken(filtered, word), lexicalDenominator);
  return {
    feature_vector: Object.fromEntries(Object.entries(featureVector).map(([key, value]) => [key, round(value)])),
    observed_words: rawTokens.length,
    ablated_words: filtered.length,
    prompt_overlap_rate: ratio(rawTokens.length - filtered.length, denominator),
    sentence_count: sentenceUnits.length,
    sentence_start_marker_rate: ratio(starts.filter((token) => DISCOURSE_WORDS.includes(token)).length, starts.length),
    raw_text_included: false
  };
}

function familyDistance(left, right, family) {
  const keys = FAMILY_KEYS[family] || [];
  if (!keys.length) return 1;
  return round(mean(keys.map((key) => Math.min(1, Math.abs(Number(left[key] || 0) - Number(right[key] || 0))))));
}

function weightedDistance(left, right, weights = DEFAULT_WEIGHTS) {
  let total = 0;
  let weightTotal = 0;
  const families = {};
  for (const family of Object.keys(FAMILY_KEYS)) {
    const distance = familyDistance(left, right, family);
    const weight = Number(weights[family] || 0);
    families[family] = distance;
    total += distance * weight;
    weightTotal += weight;
  }
  return {
    distance: round(weightTotal ? total / weightTotal : 1),
    family_distances: families
  };
}

function averageVector(vectors = []) {
  const keys = Array.from(new Set(vectors.flatMap((vector) => Object.keys(vector || {})))).sort();
  return Object.fromEntries(keys.map((key) => [key, round(mean(vectors.map((vector) => Number(vector?.[key] || 0))))]));
}

async function deterministicShuffle(items, seedDigest) {
  const decorated = [];
  for (let index = 0; index < items.length; index += 1) {
    decorated.push({
      item: items[index],
      key: await sha256Hex(`${seedDigest}:${index}:${items[index]?.candidate_id || items[index]?.window_id || ''}`)
    });
  }
  return decorated.sort((left, right) => left.key.localeCompare(right.key)).map((entry) => entry.item);
}

function exactCandidateClasses(candidates = []) {
  const classes = candidates.map((candidate) => candidate.control_class).sort();
  const required = REQUIRED_CANDIDATE_CLASSES.slice().sort();
  return classes.length === required.length && classes.every((value, index) => value === required[index]);
}

function findCandidate(candidates, controlClass) {
  return candidates.find((candidate) => candidate.control_class === controlClass) || null;
}

function publicCandidate(candidate, features, rank, distanceRecord) {
  return {
    blinded_candidate_id: candidate.blinded_candidate_id,
    control_class: candidate.control_class,
    provenance_class: candidate.provenance_class,
    rank,
    distance: distanceRecord.distance,
    family_distances: distanceRecord.family_distances,
    prompt_overlap_rate: features.prompt_overlap_rate,
    observed_words: features.observed_words,
    feature_digest: candidate.feature_digest,
    raw_text_included: false
  };
}

export async function buildNineWindowSource(segments = {}) {
  const windows = [];
  const failures = [];
  for (const lane of LANES) {
    const units = sentences(segments[lane] || '');
    let cursor = 0;
    for (let ordinal = 1; ordinal <= WINDOWS_PER_LANE; ordinal += 1) {
      const block = takeWindow(units, cursor, WINDOW_TARGET);
      cursor = block.end_unit_exclusive;
      const text = sourceForUnits(block.units);
      const windowCore = {
        window_id: `BCW-${lane.toUpperCase()}-${ordinal}`,
        lane,
        ordinal,
        start_unit: block.start_unit,
        end_unit_exclusive: block.end_unit_exclusive,
        target_words: WINDOW_TARGET,
        observed_words: block.observed_words,
        complete: block.complete,
        source_checksum: await taggedDigest(text),
        raw_text_included: false
      };
      windows.push({ ...windowCore, _sealed_text: text });
      if (!block.complete) failures.push({
        code: 'SOURCE-WINDOW-INCOMPLETE',
        window_id: windowCore.window_id,
        observed_words: block.observed_words,
        target_words: WINDOW_TARGET
      });
    }
  }
  return {
    schema_version: 'td613.safe-harbor.blind-source-windows/v1',
    window_policy: {
      sentence_aware: true,
      lanes: LANES.slice(),
      windows_per_lane: WINDOWS_PER_LANE,
      target_words: WINDOW_TARGET,
      required_window_count: 9,
      non_overlapping_within_lane: true
    },
    windows,
    failures
  };
}

export async function selectDeterministicHoldout(sourceWindows, options = {}) {
  const windows = sourceWindows?.windows || [];
  const nonce = String(options.selectionNonce || '');
  const packetHash = String(options.packetHash || '');
  const nonceDigest = await taggedDigest(nonce);
  const eligible = windows.filter((window) => window.complete).map((window) => window.window_id).sort();
  const selectionMaterial = {
    protocol_version: BLIND_CUSTODY_PROTOCOL,
    packet_hash: packetHash,
    selection_nonce_digest: nonceDigest,
    eligible_window_ids: eligible
  };
  const selectionDigest = await taggedDigest(selectionMaterial);
  const numeric = Number.parseInt(selectionDigest.slice(-12), 16);
  const selectedId = eligible.length ? eligible[numeric % eligible.length] : null;
  const selected = windows.find((window) => window.window_id === selectedId) || null;
  return {
    schema_version: 'td613.safe-harbor.blind-holdout-selection/v1',
    selection_nonce_digest: nonceDigest,
    selection_material_digest: selectionDigest,
    eligible_window_count: eligible.length,
    selected_window_id: selectedId,
    holdout_checksum: selected?.source_checksum || null,
    deterministic: true,
    selected_before_profile_construction: true,
    raw_text_included: false
  };
}

export async function freezeBlindProfile(sourceWindows, selection, options = {}) {
  const windows = sourceWindows?.windows || [];
  const visible = windows.filter((window) => window.complete && window.window_id !== selection.selected_window_id);
  const featurePolicy = {
    schema_version: BLIND_CUSTODY_PROFILE_POLICY,
    feature_families: Object.fromEntries(Object.entries(FAMILY_KEYS).map(([family, keys]) => [family, keys.slice()])),
    prompt_vocabulary_ablation: true,
    lexical_content_ngrams_excluded: true,
    raw_text_exported: false
  };
  const weights = { ...DEFAULT_WEIGHTS, ...(options.weights || {}) };
  const thresholds = { ...DEFAULT_THRESHOLDS, ...(options.thresholds || {}) };
  const distancePolicy = {
    schema_version: BLIND_CUSTODY_DISTANCE_POLICY,
    metric: 'weighted-normalized-feature-family-l1',
    missing_feature_policy: 'zero-fill-with-visible-failure-record',
    tie_policy: 'blinded-candidate-id-ascending',
    nearest_impostor_classes: REQUIRED_CANDIDATE_CLASSES.filter((value) => value !== 'genuine-holdout')
  };
  const visibleRecords = [];
  for (const window of visible) {
    const features = extractTransparentFeatures(window._sealed_text, options.promptTextsByLane?.[window.lane] || '');
    visibleRecords.push({
      window_id: window.window_id,
      feature_vector: features.feature_vector,
      prompt_overlap_rate: features.prompt_overlap_rate,
      feature_digest: await taggedDigest(features.feature_vector),
      raw_text_included: false
    });
  }
  const profileVector = averageVector(visibleRecords.map((record) => record.feature_vector));
  const profileCore = {
    schema_version: 'td613.safe-harbor.blind-frozen-profile/v1',
    visible_window_ids: visibleRecords.map((record) => record.window_id).sort(),
    visible_window_feature_digests: Object.fromEntries(visibleRecords.map((record) => [record.window_id, record.feature_digest])),
    profile_vector: profileVector,
    feature_policy: featurePolicy,
    weights,
    thresholds,
    distance_policy: distancePolicy,
    raw_text_included: false
  };
  return {
    ...profileCore,
    frozen_profile_digest: await taggedDigest(profileCore),
    feature_policy_digest: await taggedDigest(featurePolicy),
    weights_digest: await taggedDigest(weights),
    thresholds_digest: await taggedDigest(thresholds),
    distance_policy_digest: await taggedDigest(distancePolicy)
  };
}

export async function buildBlindPrecommitment(sourceWindows, selection, frozenProfile, options = {}) {
  const core = {
    schema_version: 'td613.safe-harbor.blind-precommitment/v1',
    protocol_version: BLIND_CUSTODY_PROTOCOL,
    source_window_policy_digest: await taggedDigest(sourceWindows.window_policy),
    source_window_checksums: Object.fromEntries(sourceWindows.windows.map((window) => [window.window_id, window.source_checksum])),
    selection_nonce_digest: selection.selection_nonce_digest,
    selection_material_digest: selection.selection_material_digest,
    selected_window_id_commitment: await taggedDigest(selection.selected_window_id || ''),
    holdout_checksum: selection.holdout_checksum,
    frozen_profile_digest: frozenProfile.frozen_profile_digest,
    feature_policy_digest: frozenProfile.feature_policy_digest,
    weights_digest: frozenProfile.weights_digest,
    thresholds_digest: frozenProfile.thresholds_digest,
    distance_policy_digest: frozenProfile.distance_policy_digest,
    candidate_count: 8,
    required_candidate_classes: REQUIRED_CANDIDATE_CLASSES.slice(),
    profile_frozen_before_reveal: true,
    post_reveal_profile_mutation_forbidden: true,
    raw_text_included: false,
    created_at_utc: options.createdAtUtc || null
  };
  return { ...core, precommitment_digest: await taggedDigest(core) };
}

async function normalizeCandidates(candidates = [], seedDigest, promptTextsByClass = {}) {
  const prepared = [];
  for (const candidate of candidates) {
    const text = String(candidate.text || '');
    const features = extractTransparentFeatures(text, promptTextsByClass[candidate.control_class] || '');
    const core = {
      candidate_id: String(candidate.candidate_id || ''),
      control_class: String(candidate.control_class || ''),
      provenance_class: String(candidate.provenance_class || 'declared-synthetic-or-consented-control'),
      source_checksum: await taggedDigest(text),
      feature_digest: await taggedDigest(features.feature_vector),
      raw_text_included: false
    };
    prepared.push({ ...core, _features: features, _text: text });
  }
  const shuffled = await deterministicShuffle(prepared, seedDigest);
  return shuffled.map((candidate, index) => ({
    ...candidate,
    blinded_candidate_id: `BCC-${String(index + 1).padStart(2, '0')}`
  }));
}

function classifyOutcome(context) {
  if (context.contaminated) return 'CONTAMINATED';
  if (context.promptDominated) return 'PROMPT-DOMINATED';
  if (context.imitationCollision) return 'IMITATION-COLLISION';
  if (context.genuineRank <= context.thresholds.supported_max_rank && context.separationMargin >= context.thresholds.supported_min_margin) return 'SUPPORTED';
  if (context.genuineRank >= context.thresholds.failed_min_rank) return 'FAILED';
  return 'INCONCLUSIVE';
}

export async function runBlindCustodyChallenge(input = {}, options = {}) {
  const researchGate = options.researchMode === true && options.explicitConsent === true;
  const sourceWindows = await buildNineWindowSource(input.segments || {});
  const selection = await selectDeterministicHoldout(sourceWindows, {
    selectionNonce: options.selectionNonce,
    packetHash: options.packetHash
  });
  const frozenProfile = await freezeBlindProfile(sourceWindows, selection, options);
  const precommitment = await buildBlindPrecommitment(sourceWindows, selection, frozenProfile, options);
  const holdout = sourceWindows.windows.find((window) => window.window_id === selection.selected_window_id) || null;
  const candidateInput = Array.isArray(input.candidates) ? clone(input.candidates) : [];
  const genuine = findCandidate(candidateInput, 'genuine-holdout');
  if (genuine && holdout) genuine.text = holdout._sealed_text;
  const candidates = await normalizeCandidates(candidateInput, precommitment.precommitment_digest, options.promptTextsByClass || {});
  const failures = [...sourceWindows.failures];
  if (!researchGate) failures.push({ code: 'RESEARCH-GATE-CLOSED', detail: 'Research mode and explicit consent are both required.' });
  if (sourceWindows.windows.length !== 9) failures.push({ code: 'SOURCE-WINDOW-COUNT', observed: sourceWindows.windows.length, required: 9 });
  if (!selection.selected_window_id) failures.push({ code: 'NO-ELIGIBLE-HOLDOUT' });
  if (!exactCandidateClasses(candidates)) failures.push({ code: 'CANDIDATE-CONTROL-CLASSES', required: REQUIRED_CANDIDATE_CLASSES.slice() });
  if (candidates.length !== 8) failures.push({ code: 'CANDIDATE-COUNT', observed: candidates.length, required: 8 });
  const genuineCandidate = findCandidate(candidates, 'genuine-holdout');
  const contaminationReasons = [];
  if (!genuineCandidate || genuineCandidate.source_checksum !== selection.holdout_checksum) contaminationReasons.push('genuine-holdout-checksum-mismatch');
  if (options.postFreezeProfileDigest && options.postFreezeProfileDigest !== frozenProfile.frozen_profile_digest) contaminationReasons.push('post-freeze-profile-mutation');
  if (options.postFreezeFeaturePolicyDigest && options.postFreezeFeaturePolicyDigest !== frozenProfile.feature_policy_digest) contaminationReasons.push('post-freeze-feature-policy-mutation');
  if (contaminationReasons.length) failures.push(...contaminationReasons.map((reason) => ({ code: 'CONTAMINATION', reason })));

  const scored = candidates.map((candidate) => ({
    candidate,
    distanceRecord: weightedDistance(frozenProfile.profile_vector, candidate._features.feature_vector, frozenProfile.weights)
  })).sort((left, right) => (
    left.distanceRecord.distance - right.distanceRecord.distance
    || left.candidate.blinded_candidate_id.localeCompare(right.candidate.blinded_candidate_id)
  ));
  const publicScores = scored.map((entry, index) => publicCandidate(entry.candidate, entry.candidate._features, index + 1, entry.distanceRecord));
  const genuineScore = publicScores.find((candidate) => candidate.control_class === 'genuine-holdout') || null;
  const impostors = publicScores.filter((candidate) => candidate.control_class !== 'genuine-holdout');
  const nearestImpostor = impostors[0] || null;
  const imitation = publicScores.find((candidate) => candidate.control_class === 'llm-style-imitation-control') || null;
  const genuineRank = genuineScore?.rank || 99;
  const separationMargin = genuineScore && nearestImpostor ? round(nearestImpostor.distance - genuineScore.distance) : 0;
  const promptLeakage = round(mean(publicScores.map((candidate) => candidate.prompt_overlap_rate)));
  const promptDominated = promptLeakage >= frozenProfile.thresholds.prompt_leakage_rate;
  const imitationCollision = Boolean(genuineScore && imitation && (
    imitation.rank < genuineScore.rank
    || Math.abs(imitation.distance - genuineScore.distance) <= frozenProfile.thresholds.imitation_collision_margin
  ));
  const contaminated = contaminationReasons.length > 0 || !researchGate || failures.some((failure) => ['CANDIDATE-CONTROL-CLASSES', 'CANDIDATE-COUNT', 'NO-ELIGIBLE-HOLDOUT'].includes(failure.code));
  const outcome = classifyOutcome({
    contaminated,
    promptDominated,
    imitationCollision,
    genuineRank,
    separationMargin,
    thresholds: frozenProfile.thresholds
  });
  const resultCore = {
    schema_version: BLIND_CUSTODY_SCHEMA,
    protocol: {
      protocol_version: BLIND_CUSTODY_PROTOCOL,
      research_mode: researchGate,
      baseline_intake_mandatory: false,
      explicit_consent_recorded: options.explicitConsent === true,
      holdout_selected_before_profile: true,
      profile_frozen_before_reveal: true,
      candidate_order_blinded: true,
      adverse_results_preserved: true,
      raw_text_exported: false,
      keystroke_telemetry_collected: false,
      pause_timing_collected: false,
      external_identity_data_consumed: false
    },
    source_window_policy: sourceWindows.window_policy,
    source_window_checksums: Object.fromEntries(sourceWindows.windows.map((window) => [window.window_id, window.source_checksum])),
    selection,
    precommitment,
    frozen_profile: frozenProfile,
    blinded_candidates: publicScores,
    results: {
      outcome,
      genuine_holdout_rank: genuineScore?.rank || null,
      genuine_holdout_distance: genuineScore?.distance ?? null,
      nearest_impostor_blinded_id: nearestImpostor?.blinded_candidate_id || null,
      nearest_impostor_class: nearestImpostor?.control_class || null,
      nearest_impostor_distance: nearestImpostor?.distance ?? null,
      separation_margin: separationMargin,
      prompt_and_topic_leakage_rate: promptLeakage,
      imitation_collision: imitationCollision,
      contamination_reasons: contaminationReasons,
      all_outcomes_permitted: BLIND_CUSTODY_OUTCOMES.slice(),
      claim_ceiling: 'Packet-scoped blinded recurrence evidence only; not civil identity, exclusive ownership, universal authorship, or third-party text adjudication.'
    },
    failure_registry: failures,
    replay: {
      deterministic_selection: true,
      deterministic_candidate_order: true,
      deterministic_profile: true,
      precommitment_digest: precommitment.precommitment_digest,
      frozen_profile_digest: frozenProfile.frozen_profile_digest,
      holdout_checksum: selection.holdout_checksum,
      replay_status: 'ready'
    },
    presentation_authority: {
      svg_status: outcome,
      authority_reduced: outcome !== 'SUPPORTED',
      reduction_reason: outcome === 'IMITATION-COLLISION'
        ? 'AI IMITATION COLLISION: PRESENT'
        : outcome === 'PROMPT-DOMINATED'
          ? 'PROMPT DOMINANCE: PRESENT'
          : outcome === 'CONTAMINATED'
            ? 'CHALLENGE CONTAMINATION: PRESENT'
            : outcome === 'FAILED'
              ? 'BLIND RETURN: FAILED'
              : outcome === 'INCONCLUSIVE'
                ? 'BLIND RETURN: INCONCLUSIVE'
                : null,
      renderer_may_suppress_adverse_result: false
    },
    raw_text_included: false
  };
  const digestInput = clone(resultCore);
  const challengeDigest = await taggedDigest(digestInput);
  return { ...resultCore, result_digest: challengeDigest };
}

export async function replayBlindCustodyChallenge(challenge = {}, input = {}, options = {}) {
  const replayed = await runBlindCustodyChallenge(input, options);
  const checks = {
    selection_material_digest: replayed.selection.selection_material_digest === challenge?.selection?.selection_material_digest,
    selected_window_id: replayed.selection.selected_window_id === challenge?.selection?.selected_window_id,
    holdout_checksum: replayed.selection.holdout_checksum === challenge?.selection?.holdout_checksum,
    precommitment_digest: replayed.precommitment.precommitment_digest === challenge?.precommitment?.precommitment_digest,
    frozen_profile_digest: replayed.frozen_profile.frozen_profile_digest === challenge?.frozen_profile?.frozen_profile_digest,
    result_digest: replayed.result_digest === challenge?.result_digest
  };
  return {
    schema_version: 'td613.safe-harbor.blind-custody-replay/v1',
    status: Object.values(checks).every(Boolean) ? 'pass' : 'hold',
    checks,
    replayed_outcome: replayed.results.outcome,
    original_outcome: challenge?.results?.outcome || null,
    raw_text_included: false
  };
}

export function blindCustodyContainsRawText(value = {}) {
  const serialized = stableCanonicalJson(value);
  return /"(?:raw_text|source_text|entrant_text|window_text|prompt_text|text)"\s*:/u.test(serialized);
}
