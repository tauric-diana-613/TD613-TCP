import { stableCanonicalJson } from './safe-harbor-stylometry-v3.js';

export const GEN3_STAGE2_SCHEMA = 'td613.safe-harbor.authorship-maturity/v1';
export const WINDOW_POLICY_VERSION = 'td613.safe-harbor.sentence-aware-window-policy/v1';
export const FEATURE_POLICY_VERSION = 'td613.safe-harbor.recurrence-feature-policy/v1';
export const STABILITY_POLICY_VERSION = 'td613.safe-harbor.stability-policy/v1';

const LANES = Object.freeze(['future_self', 'past_self', 'higher_self']);
const CHECKPOINTS = Object.freeze([120, 240, 360]);
const LOCAL_WINDOW_TARGET = 120;
const FAMILY_ORDER = Object.freeze([
  'sentence_rhythm',
  'lexical_shape',
  'function_word_routing',
  'punctuation_boundary',
  'structural_transition'
]);
const FUNCTION_WORDS = Object.freeze([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'because', 'but', 'by', 'for', 'from',
  'had', 'has', 'have', 'he', 'her', 'him', 'his', 'i', 'if', 'in', 'into', 'is',
  'it', 'its', 'me', 'my', 'not', 'of', 'on', 'or', 'our', 'she', 'so', 'that',
  'the', 'their', 'them', 'they', 'this', 'to', 'we', 'were', 'what', 'when',
  'which', 'who', 'with', 'you', 'your'
]);
const FORBIDDEN_INTERPRETIVE_TERMS = Object.freeze([
  'proved identity',
  'proves identity',
  'unforgeable',
  'unique person',
  'psychological profile',
  'demographic inference',
  'mental state diagnosis'
]);

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function isObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function round(value, places = 4) {
  const number = Number(value);
  return Number.isFinite(number) ? Number(number.toFixed(places)) : 0;
}

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) || [];
}

function splitSentences(text) {
  const source = String(text || '').replace(/\r\n?/gu, '\n').trim();
  if (!source) return [];
  const matches = source.match(/[^.!?]+(?:[.!?]+|$)/gu) || [source];
  return matches.map((sentence) => sentence.trim()).filter(Boolean);
}

function countPunctuation(text) {
  const source = String(text || '');
  return {
    comma: (source.match(/,/gu) || []).length,
    semicolon: (source.match(/;/gu) || []).length,
    colon: (source.match(/:/gu) || []).length,
    dash: (source.match(/[—–-]/gu) || []).length,
    question: (source.match(/\?/gu) || []).length,
    exclamation: (source.match(/!/gu) || []).length,
    period: (source.match(/\./gu) || []).length,
    parenthesis: (source.match(/[()]/gu) || []).length
  };
}

function normalizeDistribution(entries = {}) {
  const total = Object.values(entries).reduce((sum, value) => sum + Number(value || 0), 0);
  if (!total) return Object.fromEntries(Object.keys(entries).sort().map((key) => [key, 0]));
  return Object.fromEntries(Object.keys(entries).sort().map((key) => [key, round(Number(entries[key] || 0) / total, 6)]));
}

function wordLengthProfile(tokens = []) {
  const bins = { short_1_3: 0, medium_4_6: 0, long_7_9: 0, extended_10_plus: 0 };
  for (const token of tokens) {
    if (token.length <= 3) bins.short_1_3 += 1;
    else if (token.length <= 6) bins.medium_4_6 += 1;
    else if (token.length <= 9) bins.long_7_9 += 1;
    else bins.extended_10_plus += 1;
  }
  return normalizeDistribution(bins);
}

function functionWordProfile(tokens = []) {
  const counts = Object.fromEntries(FUNCTION_WORDS.map((word) => [word, 0]));
  for (const token of tokens) if (Object.prototype.hasOwnProperty.call(counts, token)) counts[token] += 1;
  return normalizeDistribution(counts);
}

function terminalProfile(sentences = []) {
  const counts = { declarative: 0, interrogative: 0, exclamatory: 0, open: 0 };
  for (const sentence of sentences) {
    if (/\?+$/u.test(sentence)) counts.interrogative += 1;
    else if (/!+$/u.test(sentence)) counts.exclamatory += 1;
    else if (/\.+$/u.test(sentence)) counts.declarative += 1;
    else counts.open += 1;
  }
  return normalizeDistribution(counts);
}

function promptSet(value) {
  if (Array.isArray(value)) return new Set(value.map((item) => String(item).toLowerCase()).filter(Boolean));
  return new Set(tokenize(value));
}

function extractTransparentFeatures(text, promptVocabulary = []) {
  const sentences = splitSentences(text);
  const tokens = tokenize(text);
  const prompt = promptSet(promptVocabulary);
  const promptMatches = tokens.filter((token) => prompt.has(token)).length;
  const nonPromptTokens = tokens.filter((token) => !prompt.has(token));
  const punctuation = countPunctuation(text);
  const characters = String(text || '').length;
  const sentenceLengths = sentences.map((sentence) => tokenize(sentence).length).filter((count) => count > 0);
  const averageSentence = sentenceLengths.length
    ? sentenceLengths.reduce((sum, count) => sum + count, 0) / sentenceLengths.length
    : 0;
  const sentenceVariance = sentenceLengths.length
    ? sentenceLengths.reduce((sum, count) => sum + ((count - averageSentence) ** 2), 0) / sentenceLengths.length
    : 0;
  const averageWord = nonPromptTokens.length
    ? nonPromptTokens.reduce((sum, token) => sum + token.length, 0) / nonPromptTokens.length
    : 0;
  const functionWords = nonPromptTokens.filter((token) => FUNCTION_WORDS.includes(token)).length;
  const punctuationTotal = Object.values(punctuation).reduce((sum, count) => sum + count, 0);
  return {
    schema_version: 'td613.safe-harbor.transparent-window-features/v1',
    observed_word_count: tokens.length,
    non_prompt_word_count: nonPromptTokens.length,
    observed_sentence_count: sentences.length,
    scalar: {
      average_sentence_words: round(averageSentence),
      sentence_length_variance: round(sentenceVariance),
      average_non_prompt_word_chars: round(averageWord),
      function_word_density: round(nonPromptTokens.length ? functionWords / nonPromptTokens.length : 0),
      punctuation_density: round(characters ? punctuationTotal / characters : 0, 6),
      line_break_density: round(characters ? (String(text || '').match(/\n/gu) || []).length / characters : 0, 6)
    },
    distributions: {
      function_words: functionWordProfile(nonPromptTokens),
      word_lengths: wordLengthProfile(nonPromptTokens),
      punctuation: normalizeDistribution(punctuation),
      terminals: terminalProfile(sentences)
    },
    prompt_conditioning: {
      declared_prompt_vocabulary_size: prompt.size,
      observed_prompt_token_count: promptMatches,
      observed_prompt_token_share: round(tokens.length ? promptMatches / tokens.length : 0),
      prompt_vocabulary_excluded_from_authorship_features: true,
      lexical_content_ngram_features_exported: false
    },
    raw_text_included: false
  };
}

function cumulativeSlice(sentences, target) {
  const selected = [];
  let observed = 0;
  for (const sentence of sentences) {
    selected.push(sentence);
    observed += tokenize(sentence).length;
    if (observed >= target) break;
  }
  return { text: selected.join(' '), observed_words: observed, sentence_count: selected.length };
}

function localWindows(sentences, target = LOCAL_WINDOW_TARGET, limit = 3) {
  const windows = [];
  let current = [];
  let observed = 0;
  for (const sentence of sentences) {
    const sentenceWords = tokenize(sentence).length;
    current.push(sentence);
    observed += sentenceWords;
    if (observed >= target) {
      windows.push({ text: current.join(' '), observed_words: observed, sentence_count: current.length });
      current = [];
      observed = 0;
      if (windows.length >= limit) break;
    }
  }
  if (current.length && windows.length < limit) windows.push({ text: current.join(' '), observed_words: observed, sentence_count: current.length });
  return windows;
}

function scalarDistance(left, right) {
  const a = Number(left || 0);
  const b = Number(right || 0);
  const scale = Math.max(1, Math.abs(a), Math.abs(b));
  return round(Math.min(1, Math.abs(a - b) / scale), 6);
}

function cosineSimilarity(left = {}, right = {}) {
  const keys = Array.from(new Set([...Object.keys(left), ...Object.keys(right)])).sort();
  let dot = 0;
  let a2 = 0;
  let b2 = 0;
  for (const key of keys) {
    const a = Number(left[key] || 0);
    const b = Number(right[key] || 0);
    dot += a * b;
    a2 += a * a;
    b2 += b * b;
  }
  if (!a2 && !b2) return 1;
  if (!a2 || !b2) return 0;
  return round(dot / Math.sqrt(a2 * b2), 6);
}

function average(values = []) {
  const finite = values.map(Number).filter(Number.isFinite);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : 0;
}

function variance(values = []) {
  if (!values.length) return 0;
  const mean = average(values);
  return average(values.map((value) => (Number(value) - mean) ** 2));
}

function familySimilarity(left, right, family) {
  if (!left || !right) return null;
  if (family === 'sentence_rhythm') {
    return round(1 - average([
      scalarDistance(left.scalar.average_sentence_words, right.scalar.average_sentence_words),
      scalarDistance(left.scalar.sentence_length_variance, right.scalar.sentence_length_variance)
    ]), 6);
  }
  if (family === 'lexical_shape') {
    return round(average([
      1 - scalarDistance(left.scalar.average_non_prompt_word_chars, right.scalar.average_non_prompt_word_chars),
      cosineSimilarity(left.distributions.word_lengths, right.distributions.word_lengths)
    ]), 6);
  }
  if (family === 'function_word_routing') {
    return round(average([
      1 - scalarDistance(left.scalar.function_word_density, right.scalar.function_word_density),
      cosineSimilarity(left.distributions.function_words, right.distributions.function_words)
    ]), 6);
  }
  if (family === 'punctuation_boundary') {
    return round(average([
      1 - scalarDistance(left.scalar.punctuation_density, right.scalar.punctuation_density),
      cosineSimilarity(left.distributions.punctuation, right.distributions.punctuation),
      cosineSimilarity(left.distributions.terminals, right.distributions.terminals)
    ]), 6);
  }
  if (family === 'structural_transition') {
    return round(average([
      1 - scalarDistance(left.scalar.line_break_density, right.scalar.line_break_density),
      1 - scalarDistance(left.observed_sentence_count, right.observed_sentence_count)
    ]), 6);
  }
  return null;
}

function classifyRecurrence(scores = [], promptConditioned = false) {
  if (scores.length < 2) return { state: 'insufficient', score: null, dispersion: null };
  const score = round(average(scores), 6);
  const dispersion = round(variance(scores), 6);
  if (promptConditioned) return { state: 'prompt-conditioned', score, dispersion };
  if (score >= 0.84 && dispersion <= 0.02) return { state: 'stable', score, dispersion };
  if (score >= 0.68 && dispersion <= 0.06) return { state: 'context-responsive', score, dispersion };
  return { state: 'unstable', score, dispersion };
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

async function digest(value) {
  return `sha256:${await sha256Hex(typeof value === 'string' ? value : stableCanonicalJson(value))}`;
}

async function evidenceId(prefix, value) {
  const hex = await sha256Hex(stableCanonicalJson(value));
  return `${prefix}-${hex.slice(0, 16).toUpperCase()}`;
}

function windowMetadata(window, index, lane, kind, target) {
  return {
    window_id: `${lane}:${kind}:${index + 1}`,
    lane,
    kind,
    target_words: target,
    observed_words: window.observed_words,
    observed_sentences: window.sentence_count,
    sentence_aware: true,
    raw_text_included: false
  };
}

async function analyzeLane(lane, text, promptVocabulary) {
  const sentences = splitSentences(text);
  const checkpoints = [];
  for (const target of CHECKPOINTS) {
    const slice = cumulativeSlice(sentences, target);
    const features = extractTransparentFeatures(slice.text, promptVocabulary);
    const metadata = windowMetadata(slice, checkpoints.length, lane, 'cumulative', target);
    checkpoints.push({ ...metadata, feature_digest: await digest(features), features });
  }
  const locals = [];
  const localSlices = localWindows(sentences);
  for (let index = 0; index < localSlices.length; index += 1) {
    const slice = localSlices[index];
    const features = extractTransparentFeatures(slice.text, promptVocabulary);
    const metadata = windowMetadata(slice, index, lane, 'local', LOCAL_WINDOW_TARGET);
    locals.push({ ...metadata, feature_digest: await digest(features), features });
  }
  const families = {};
  for (const family of FAMILY_ORDER) {
    const scores = [];
    for (let index = 1; index < locals.length; index += 1) {
      const score = familySimilarity(locals[index - 1].features, locals[index].features, family);
      if (score != null) scores.push(score);
    }
    const promptShare = average(locals.map((window) => window.features.prompt_conditioning.observed_prompt_token_share));
    const promptConditioned = family === 'lexical_shape' && promptShare >= 0.25;
    const recurrence = classifyRecurrence(scores, promptConditioned);
    families[family] = {
      ...recurrence,
      evidence_id: await evidenceId('AEW', { lane, family, scores, promptShare }),
      pairwise_scores: scores,
      prompt_conditioned: promptConditioned,
      durable_invariant_eligible: recurrence.state === 'stable' || recurrence.state === 'context-responsive'
    };
  }
  return {
    lane,
    sentence_count: sentences.length,
    observed_words: tokenize(text).length,
    local_window_count: locals.length,
    local_window_target: LOCAL_WINDOW_TARGET,
    non_overlapping_local_windows: true,
    checkpoints,
    local_windows: locals,
    feature_families: families,
    raw_text_included: false
  };
}

function aggregateLane(laneAnalysis) {
  const windows = laneAnalysis.local_windows || [];
  if (!windows.length) return null;
  const aggregate = {
    scalar: {},
    distributions: {
      function_words: {},
      word_lengths: {},
      punctuation: {},
      terminals: {}
    },
    observed_sentence_count: round(average(windows.map((window) => window.features.observed_sentence_count)))
  };
  const scalarKeys = Object.keys(windows[0].features.scalar || {});
  for (const key of scalarKeys) aggregate.scalar[key] = round(average(windows.map((window) => window.features.scalar[key])), 6);
  for (const family of Object.keys(aggregate.distributions)) {
    const keys = Array.from(new Set(windows.flatMap((window) => Object.keys(window.features.distributions[family] || {})))).sort();
    aggregate.distributions[family] = Object.fromEntries(keys.map((key) => [
      key,
      round(average(windows.map((window) => window.features.distributions[family]?.[key] || 0)), 6)
    ]));
  }
  return aggregate;
}

async function buildCrossLaneInvariants(laneAnalyses) {
  const aggregates = Object.fromEntries(LANES.map((lane) => [lane, aggregateLane(laneAnalyses[lane])]));
  const pairs = [
    ['future_self', 'past_self'],
    ['future_self', 'higher_self'],
    ['past_self', 'higher_self']
  ];
  const families = {};
  for (const family of FAMILY_ORDER) {
    const scores = pairs.map(([left, right]) => familySimilarity(aggregates[left], aggregates[right], family)).filter((score) => score != null);
    const recurrence = classifyRecurrence(scores, false);
    families[family] = {
      ...recurrence,
      evidence_id: await evidenceId('AEC', { family, scores }),
      pairwise_scores: Object.fromEntries(pairs.map((pair, index) => [pair.join('__'), scores[index] ?? null])),
      durable_invariant_eligible: recurrence.state === 'stable' || recurrence.state === 'context-responsive'
    };
  }
  return {
    schema_version: 'td613.safe-harbor.cross-lane-invariants/v1',
    pair_order: pairs.map((pair) => pair.join('__')),
    feature_families: families,
    raw_text_included: false
  };
}

function promptConditioningRecord(laneAnalyses) {
  const lanes = {};
  for (const lane of LANES) {
    const windows = laneAnalyses[lane].local_windows || [];
    const shares = windows.map((window) => window.features.prompt_conditioning.observed_prompt_token_share);
    lanes[lane] = {
      mean_prompt_token_share: round(average(shares), 6),
      maximum_prompt_token_share: round(shares.length ? Math.max(...shares) : 0, 6),
      prompt_vocabulary_excluded_from_authorship_features: true,
      lexical_content_ngram_features_exported: false,
      classification: shares.some((share) => share >= 0.25) ? 'prompt-exposure-elevated' : 'prompt-exposure-bounded'
    };
  }
  return {
    schema_version: 'td613.safe-harbor.prompt-conditioned-features/v1',
    lanes,
    durable_claim_rule: 'Prompt vocabulary and content n-grams remain excluded from durable authorship invariants.',
    raw_text_included: false
  };
}

function maturityState(laneAnalyses, withinLane, crossLane) {
  const counts = LANES.map((lane) => laneAnalyses[lane].observed_words);
  if (counts.some((count) => count < 120)) return 'insufficient';
  if (counts.some((count) => count < 240)) return 'provisional';
  if (counts.some((count) => count < 360)) return 'comparative';
  const stableWithin = LANES.reduce((sum, lane) => sum + Object.values(withinLane[lane].feature_families).filter((item) => item.state === 'stable').length, 0);
  const stableCross = Object.values(crossLane.feature_families).filter((item) => item.state === 'stable').length;
  return stableWithin >= 3 && stableCross >= 1 ? 'mature' : 'comparative-with-instability';
}

function collectFamilyStates(withinLane, crossLane) {
  const stable = [];
  const contextResponsive = [];
  const unstable = [];
  const insufficient = [];
  const promptConditioned = [];
  for (const lane of LANES) {
    for (const [family, record] of Object.entries(withinLane[lane].feature_families)) {
      const label = `${lane}:${family}`;
      if (record.state === 'stable') stable.push(label);
      else if (record.state === 'context-responsive') contextResponsive.push(label);
      else if (record.state === 'prompt-conditioned') promptConditioned.push(label);
      else if (record.state === 'insufficient') insufficient.push(label);
      else unstable.push(label);
    }
  }
  for (const [family, record] of Object.entries(crossLane.feature_families)) {
    const label = `cross_lane:${family}`;
    if (record.state === 'stable') stable.push(label);
    else if (record.state === 'context-responsive') contextResponsive.push(label);
    else if (record.state === 'insufficient') insufficient.push(label);
    else unstable.push(label);
  }
  return { stable, contextResponsive, unstable, insufficient, promptConditioned };
}

function buildBoundedStatement(states, maturity) {
  if (maturity === 'insufficient') return 'The available text supports packet validity but not recurrence-based authorship maturity.';
  if (!states.stable.length && !states.contextResponsive.length) return 'The measured feature families did not establish a durable recurrence claim under this protocol.';
  return `Observable textual structures recurred across declared local windows and temporal lanes under ${STABILITY_POLICY_VERSION}; ${states.unstable.length} measured surfaces remained unstable and ${states.promptConditioned.length} remained prompt-conditioned.`;
}

function auditInterpretiveLanguage(statement) {
  const normalized = String(statement || '').toLowerCase();
  const violations = FORBIDDEN_INTERPRETIVE_TERMS.filter((term) => normalized.includes(term));
  return {
    schema_version: 'td613.safe-harbor.stage2-anti-flattery-audit/v1',
    forbidden_terms_reviewed: FORBIDDEN_INTERPRETIVE_TERMS.slice(),
    violations,
    status: violations.length ? 'fail' : 'pass'
  };
}

export async function buildStage2AuthorshipMaturity(packet = {}, context = {}) {
  const segments = context.segments || {};
  const promptVocabularyByLane = context.promptVocabularyByLane || {};
  const laneAnalyses = {};
  for (const lane of LANES) laneAnalyses[lane] = await analyzeLane(lane, segments[lane] || '', promptVocabularyByLane[lane] || []);
  const withinLane = Object.fromEntries(LANES.map((lane) => [lane, {
    schema_version: 'td613.safe-harbor.within-lane-invariants/v1',
    lane,
    feature_families: clone(laneAnalyses[lane].feature_families),
    local_window_ids: laneAnalyses[lane].local_windows.map((window) => window.window_id),
    raw_text_included: false
  }]));
  const crossLane = await buildCrossLaneInvariants(laneAnalyses);
  const promptConditioned = promptConditioningRecord(laneAnalyses);
  const maturity = maturityState(laneAnalyses, withinLane, crossLane);
  const states = collectFamilyStates(withinLane, crossLane);
  const blockers = [];
  if (maturity === 'insufficient') blockers.push('one-or-more-lanes-below-120-words');
  if (maturity === 'provisional') blockers.push('one-or-more-lanes-below-240-words');
  if (maturity === 'comparative') blockers.push('one-or-more-lanes-below-360-words');
  if (maturity === 'comparative-with-instability') blockers.push('stability-policy-not-met');
  if (states.promptConditioned.length) blockers.push('prompt-conditioned-feature-family-present');
  const boundedStatement = buildBoundedStatement(states, maturity);
  const antiFlattery = auditInterpretiveLanguage(boundedStatement);
  const receiptPreimage = {
    schema_version: 'td613.safe-harbor.stability-receipt/v1',
    policy_version: STABILITY_POLICY_VERSION,
    maturity_state: maturity,
    stable_feature_families: states.stable,
    context_responsive_feature_families: states.contextResponsive,
    unstable_feature_families: states.unstable,
    insufficient_feature_families: states.insufficient,
    prompt_conditioned_feature_families: states.promptConditioned,
    blockers,
    bounded_statement: boundedStatement,
    raw_text_included: false,
    identity_probability: null,
    psychological_inference_performed: false,
    demographic_inference_performed: false
  };
  const stabilityDigest = await digest(receiptPreimage);
  const antiSamenessDigest = await digest({
    lane_feature_states: Object.fromEntries(LANES.map((lane) => [lane, Object.fromEntries(Object.entries(withinLane[lane].feature_families).map(([family, record]) => [family, { state: record.state, score: record.score }]))])),
    cross_lane_feature_states: Object.fromEntries(Object.entries(crossLane.feature_families).map(([family, record]) => [family, { state: record.state, score: record.score }]))
  });
  return {
    schema_version: GEN3_STAGE2_SCHEMA,
    window_policy_version: WINDOW_POLICY_VERSION,
    feature_policy_version: FEATURE_POLICY_VERSION,
    stability_policy_version: STABILITY_POLICY_VERSION,
    lane_analyses: laneAnalyses,
    checkpoint_snapshots: Object.fromEntries(LANES.map((lane) => [lane, laneAnalyses[lane].checkpoints])),
    within_lane_invariants: withinLane,
    cross_lane_invariants: crossLane,
    prompt_conditioned_features: promptConditioned,
    stability_receipt: {
      ...receiptPreimage,
      status: maturity === 'mature' ? 'mature' : maturity,
      stability_digest: stabilityDigest,
      anti_sameness_digest: antiSamenessDigest,
      anti_flattery_audit: antiFlattery,
      evidence_traceability: {
        checkpoint_ids: LANES.flatMap((lane) => laneAnalyses[lane].checkpoints.map((checkpoint) => checkpoint.window_id)),
        local_window_ids: LANES.flatMap((lane) => laneAnalyses[lane].local_windows.map((window) => window.window_id)),
        feature_evidence_ids: [
          ...LANES.flatMap((lane) => Object.values(withinLane[lane].feature_families).map((record) => record.evidence_id)),
          ...Object.values(crossLane.feature_families).map((record) => record.evidence_id)
        ]
      }
    },
    bounded_interpretation: {
      statement: boundedStatement,
      uncertainty: blockers.length ? blockers.slice() : ['No protocol can elevate packet-internal recurrence into civil identity or universal authorship proof.'],
      supported_claim: 'Versioned recurrence of observable textual structures under declared elicitation conditions.',
      prohibited_claims: [
        'civil identity proof',
        'exclusive ownership proof',
        'universal authorship proof',
        'psychological inference',
        'demographic inference'
      ]
    },
    null_and_adversarial_posture: {
      prompt_vocabulary_ablation_applied: true,
      lexical_content_ngram_features_excluded: true,
      entrant_swap_audit_digest: antiSamenessDigest,
      chronology_claimed: false,
      external_identity_data_consumed: false,
      raw_text_exported: false
    },
    raw_text_included: false
  };
}

export async function applyGen3Stage2Prehash(packet = {}, context = {}) {
  if (!isObject(packet) || packet.schema_version !== 'td613.safe-harbor.packet/v1') return packet;
  const out = clone(packet);
  const stage2 = await buildStage2AuthorshipMaturity(out, context);
  out.authorship_evidence = isObject(out.authorship_evidence) ? out.authorship_evidence : {};
  out.authorship_evidence.checkpoint_snapshots = clone(stage2.checkpoint_snapshots);
  out.authorship_evidence.within_lane_invariants = clone(stage2.within_lane_invariants);
  out.authorship_evidence.cross_lane_invariants = clone(stage2.cross_lane_invariants);
  out.authorship_evidence.prompt_conditioned_features = clone(stage2.prompt_conditioned_features);
  out.authorship_evidence.stability_receipt = clone(stage2.stability_receipt);
  out.authorship_evidence.authorship_maturity = stage2;
  return out;
}

export function attachStage2InterpretiveReport(packet = {}) {
  if (!isObject(packet) || !isObject(packet.forensic_authorship?.gen3_report_contract)) return packet;
  const out = clone(packet);
  const report = out.forensic_authorship.gen3_report_contract;
  const maturity = out.authorship_evidence?.authorship_maturity;
  if (!isObject(maturity)) return out;
  const receipt = maturity.stability_receipt || {};
  const measured = receipt.status === 'mature' || receipt.status === 'comparative-with-instability' || receipt.status === 'comparative' || receipt.status === 'provisional';
  report.report_version = 'stage2-authorship-maturity/v1';
  report.sections.authorship_signature.status = measured ? 'measured-with-bounds' : 'insufficient';
  report.sections.authorship_signature.content = {
    statement: maturity.bounded_interpretation?.statement || null,
    maturity_state: receipt.maturity_state || receipt.status || 'unavailable',
    stability_digest: receipt.stability_digest || null,
    evidence_ids: receipt.evidence_traceability?.feature_evidence_ids || [],
    claim_ceiling: maturity.bounded_interpretation?.supported_claim || null
  };
  report.sections.temporal_lane_portraits.status = measured ? 'measured' : 'insufficient';
  report.sections.temporal_lane_portraits.content = Object.fromEntries(LANES.map((lane) => [lane, {
    observed_words: maturity.lane_analyses?.[lane]?.observed_words || 0,
    local_window_count: maturity.lane_analyses?.[lane]?.local_window_count || 0,
    stable_feature_families: Object.entries(maturity.within_lane_invariants?.[lane]?.feature_families || {}).filter(([, record]) => record.state === 'stable').map(([family]) => family),
    unstable_feature_families: Object.entries(maturity.within_lane_invariants?.[lane]?.feature_families || {}).filter(([, record]) => record.state === 'unstable').map(([family]) => family)
  }]));
  report.sections.productive_contradictions.status = measured ? 'measured' : 'insufficient';
  report.sections.productive_contradictions.content = {
    findings: Object.entries(maturity.cross_lane_invariants?.feature_families || {})
      .filter(([, record]) => record.state === 'context-responsive')
      .map(([family, record]) => ({ family, evidence_id: record.evidence_id, interpretation: 'The family varied across temporal lanes while remaining recurrent enough to retain bounded continuity.' }))
  };
  report.sections.evidentiary_fractures.content.fractures = receipt.blockers || [];
  report.sections.interpretive_salience.status = measured ? 'measured-with-uncertainty' : 'insufficient';
  report.sections.interpretive_salience.content = {
    strongest_invariant: receipt.stable_feature_families?.[0] || null,
    widest_lane_divergence: receipt.unstable_feature_families?.[0] || null,
    most_recurrent_surface_marker: null,
    strongest_productive_contradiction: report.sections.productive_contradictions.content.findings[0]?.family || null,
    strongest_blind_return: null,
    strongest_recovery_pattern: null,
    largest_uncertainty: receipt.blockers?.[0] || 'Packet-internal recurrence remains bounded by the declared protocol and sample.',
    unsupported_inference_blocked: 'Identity, ownership, personality, demographic, trauma, intelligence, resilience, and mental-state inferences remain outside the claim ceiling.'
  };
  report.interpretation_provenance.interpretation_version = 'stage2-authorship-maturity/v1';
  report.interpretation_provenance.raw_text_consumed = false;
  report.interpretation_provenance.external_identity_data_consumed = false;
  return out;
}

export function stage2ContainsRawText(packet = {}) {
  const maturity = packet?.authorship_evidence?.authorship_maturity;
  if (!isObject(maturity)) return false;
  return /"(?:raw_text|source_text|entrant_text|window_text|text)"\s*:/u.test(stableCanonicalJson(maturity));
}
