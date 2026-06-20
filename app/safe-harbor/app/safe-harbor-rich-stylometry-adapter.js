import {
  extractCadenceProfile,
  StylometricDeepMetrics
} from '../../engine/stylometry.js';

const KEYS = ['future_self', 'past_self', 'higher_self'];
const SCHEMA_VERSION = 'td613.safe-harbor.rich-stylometry/v1';

const NUMERIC_AXES = [
  'wordCount',
  'sentenceCount',
  'avgSentenceLength',
  'sentenceLengthSpread',
  'punctuationDensity',
  'contractionDensity',
  'lineBreakDensity',
  'repeatedBigramPressure',
  'recurrencePressure',
  'lexicalDispersion',
  'contentWordComplexity',
  'modifierDensity',
  'hedgeDensity',
  'abstractionPosture',
  'directness',
  'latinatePreference',
  'abbreviationDensity',
  'orthographicLooseness',
  'fragmentPressure',
  'conversationalPosture',
  'syntacticBranchingDepth',
  'structuralFriction',
  'lexicalEntropyScore',
  'characterEntropyBits',
  'tokenEntropyBits',
  'transitionVariance',
  'acousticWeight'
];

const PROFILE_DISTRIBUTIONS = [
  'punctuationMix',
  'surfaceMarkerProfile',
  'functionWordProfile',
  'wordLengthProfile',
  'charTrigramProfile'
];

function round(value, places = 4) {
  const num = Number(value || 0);
  return Number.isFinite(num) ? Number(num.toFixed(places)) : 0;
}

function cleanObject(value) {
  if (!value || typeof value !== 'object') return {};
  return JSON.parse(JSON.stringify(value));
}

function distributionDistance(a = {}, b = {}) {
  const keys = [...new Set([...Object.keys(a || {}), ...Object.keys(b || {})])];
  if (!keys.length) return 0;
  const sumA = keys.reduce((sum, key) => sum + Number(a[key] || 0), 0) || 1;
  const sumB = keys.reduce((sum, key) => sum + Number(b[key] || 0), 0) || 1;
  let js = 0;
  for (const key of keys) {
    const p = Number(a[key] || 0) / sumA;
    const q = Number(b[key] || 0) / sumB;
    const m = (p + q) / 2;
    if (p > 0) js += 0.5 * p * Math.log2(p / m);
    if (q > 0) js += 0.5 * q * Math.log2(q / m);
  }
  return round(Math.max(0, Math.min(1, Math.sqrt(js))), 4);
}

function topWeighted(profile = {}, max = 80) {
  return Object.fromEntries(
    Object.entries(profile || {})
      .filter(([, value]) => Number(value || 0) > 0)
      .sort((left, right) => Number(right[1] || 0) - Number(left[1] || 0))
      .slice(0, max)
      .map(([key, value]) => [key, round(value, 5)])
  );
}

function laneFingerprintSource(profile = {}) {
  return {
    registerMode: profile.registerMode || 'plain',
    numeric: Object.fromEntries(NUMERIC_AXES.map((axis) => [axis, round(profile[axis], 4)])),
    punctuationMix: cleanObject(profile.punctuationMix),
    wordLengthProfile: cleanObject(profile.wordLengthProfile),
    functionWords: topWeighted(profile.functionWordProfile, 24),
    charTrigrams: topWeighted(profile.charTrigramProfile, 32),
    surfaceMarkers: topWeighted(profile.surfaceMarkerProfile, 32)
  };
}

function compactFingerprintText(perLane = {}) {
  return KEYS
    .map((key) => {
      const lane = perLane[key] || {};
      const source = laneFingerprintSource(lane);
      return [
        key,
        source.registerMode,
        source.numeric.avgSentenceLength,
        source.numeric.sentenceLengthSpread,
        source.numeric.contentWordComplexity,
        source.numeric.abstractionPosture,
        source.numeric.directness,
        source.numeric.latinatePreference,
        source.numeric.orthographicLooseness,
        source.numeric.fragmentPressure,
        source.numeric.syntacticBranchingDepth,
        source.numeric.lexicalEntropyScore,
        source.numeric.transitionVariance,
        Object.entries(source.functionWords).slice(0, 10).map(([k, v]) => `${k}:${v}`).join(','),
        Object.entries(source.charTrigrams).slice(0, 10).map(([k, v]) => `${k}:${v}`).join(',')
      ].join(':');
    })
    .join('|');
}

function hash32(text = '') {
  let hash = 2166136261;
  for (const char of String(text || '')) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function pairDistance(left = {}, right = {}) {
  const numeric = Object.fromEntries(NUMERIC_AXES.map((axis) => [axis, round(Math.abs(Number(left[axis] || 0) - Number(right[axis] || 0)), 4)]));
  const distributions = Object.fromEntries(PROFILE_DISTRIBUTIONS.map((axis) => [axis, distributionDistance(left[axis] || {}, right[axis] || {})]));
  const registerShift = left.registerMode === right.registerMode ? 0 : 1;
  const numericMean = NUMERIC_AXES.reduce((sum, axis) => sum + Math.min(1, numeric[axis]), 0) / Math.max(NUMERIC_AXES.length, 1);
  const distributionMean = PROFILE_DISTRIBUTIONS.reduce((sum, axis) => sum + distributions[axis], 0) / Math.max(PROFILE_DISTRIBUTIONS.length, 1);
  return {
    numeric,
    distributions,
    registerShift,
    composite: round((numericMean * 0.45) + (distributionMean * 0.45) + (registerShift * 0.10), 4)
  };
}

function averageProfiles(perLane = {}) {
  const present = KEYS.map((key) => perLane[key]).filter(Boolean);
  const total = Math.max(present.length, 1);
  const numericMean = Object.fromEntries(NUMERIC_AXES.map((axis) => [axis, round(present.reduce((sum, lane) => sum + Number(lane[axis] || 0), 0) / total, 4)]));
  const registerModes = present.reduce((counts, lane) => {
    const key = lane.registerMode || 'plain';
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
  const dominantRegister = Object.entries(registerModes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'plain';
  return {
    laneCount: present.length,
    numericMean,
    dominantRegister,
    registerModes
  };
}

function classifyTraceability(perLane = {}, divergence = {}) {
  const avgWords = KEYS.reduce((sum, key) => sum + Number(perLane[key]?.wordCount || 0), 0) / Math.max(KEYS.length, 1);
  const entropy = KEYS.reduce((sum, key) => sum + Number(perLane[key]?.lexicalEntropyScore || 0), 0) / Math.max(KEYS.length, 1);
  const structure = KEYS.reduce((sum, key) => sum + Number(perLane[key]?.structuralFriction || 0), 0) / Math.max(KEYS.length, 1);
  const crossLane = Number(divergence.cross_lane_spread || 0);
  const score = round(Math.min(1, (Math.min(avgWords / 120, 1) * 0.24) + (entropy * 0.24) + (structure * 0.22) + (crossLane * 0.18) + 0.12), 4);
  const band = score >= 0.72 ? 'high' : score >= 0.48 ? 'medium' : 'low';
  return {
    score,
    band,
    note: 'Traceability score estimates packet-internal authorship signal density from rich stylometry only. It is a provenance-risk surface, not a real-world identity determination.'
  };
}

export function buildSafeHarborLaneProfile(laneKey = '', text = '', options = {}) {
  const profile = extractCadenceProfile(String(text || ''));
  const deep = StylometricDeepMetrics.analyze(String(text || ''));
  return Object.freeze({
    lane_key: laneKey,
    source_status: text ? 'text-observed' : 'empty',
    wordCount: profile.wordCount,
    sentenceCount: profile.sentenceCount,
    avgSentenceLength: profile.avgSentenceLength,
    sentenceLengthSpread: profile.sentenceLengthSpread,
    punctuationDensity: profile.punctuationDensity,
    punctuationMix: cleanObject(profile.punctuationMix),
    contractionDensity: profile.contractionDensity,
    lineBreakDensity: profile.lineBreakDensity,
    repeatedBigramPressure: profile.repeatedBigramPressure,
    recurrencePressure: profile.recurrencePressure,
    lexicalDispersion: profile.lexicalDispersion,
    contentWordComplexity: profile.contentWordComplexity,
    modifierDensity: profile.modifierDensity,
    hedgeDensity: profile.hedgeDensity,
    abstractionPosture: profile.abstractionPosture,
    directness: profile.directness,
    latinatePreference: profile.latinatePreference,
    abbreviationDensity: profile.abbreviationDensity,
    orthographicLooseness: profile.orthographicLooseness,
    fragmentPressure: profile.fragmentPressure,
    conversationalPosture: profile.conversationalPosture,
    registerMode: profile.registerMode,
    syntacticBranchingDepth: profile.syntacticBranchingDepth,
    structuralFriction: profile.structuralFriction,
    lexicalEntropyScore: profile.lexicalEntropyScore,
    characterEntropyBits: profile.characterEntropyBits,
    tokenEntropyBits: profile.tokenEntropyBits,
    transitionVariance: profile.transitionVariance,
    acousticWeight: profile.acousticWeight,
    deepMetrics: cleanObject(deep),
    surfaceMarkerProfile: cleanObject(profile.surfaceMarkerProfile),
    functionWordProfile: cleanObject(profile.functionWordProfile),
    wordLengthProfile: cleanObject(profile.wordLengthProfile),
    charTrigramProfile: options.compactCharTrigrams === false ? cleanObject(profile.charTrigramProfile) : topWeighted(profile.charTrigramProfile, Number(options.maxCharTrigrams || 120))
  });
}

export function buildSafeHarborRichDivergence(perLaneProfiles = {}) {
  const pairs = [
    ['future_self', 'past_self', 'F-P'],
    ['future_self', 'higher_self', 'F-H'],
    ['past_self', 'higher_self', 'P-H']
  ];
  const pairwise = {};
  for (const [a, b, label] of pairs) {
    pairwise[label] = pairDistance(perLaneProfiles[a] || {}, perLaneProfiles[b] || {});
  }
  const composites = Object.values(pairwise).map((item) => Number(item.composite || 0));
  const mean = composites.reduce((sum, value) => sum + value, 0) / Math.max(composites.length, 1);
  const max = Math.max(...composites, 0);
  const min = Math.min(...composites, 1);
  const strongest_pair = Object.entries(pairwise).sort((a, b) => a[1].composite - b[1].composite)[0] || null;
  const widest_pair = Object.entries(pairwise).sort((a, b) => b[1].composite - a[1].composite)[0] || null;
  return Object.freeze({
    schema_version: 'td613.safe-harbor.rich-divergence/v1',
    pairwise,
    cross_lane_stability: round(1 - mean, 4),
    cross_lane_spread: round(max - min, 4),
    strongest_pair: strongest_pair ? { pair: strongest_pair[0], distance: strongest_pair[1].composite } : null,
    widest_pair: widest_pair ? { pair: widest_pair[0], distance: widest_pair[1].composite } : null,
    compact: Object.entries(pairwise).map(([label, value]) => `${label}:${value.composite}`).join(' | ')
  });
}

export function buildSafeHarborRichStylometry(triadSegments = {}, options = {}) {
  const perLaneProfiles = Object.fromEntries(KEYS.map((key) => [key, buildSafeHarborLaneProfile(key, triadSegments[key] || '', options)]));
  const crossLaneDivergence = buildSafeHarborRichDivergence(perLaneProfiles);
  const triadProfile = averageProfiles(perLaneProfiles);
  const fingerprintSource = compactFingerprintText(perLaneProfiles);
  const richFingerprint = hash32(['td613.safe-harbor.rich-stylometry/v1', fingerprintSource].join('|'));
  return Object.freeze({
    schema_version: SCHEMA_VERSION,
    engine: {
      cadence_profile: 'app/engine/stylometry.extractCadenceProfile',
      deep_metrics: 'app/engine/stylometry.StylometricDeepMetrics',
      adapter: 'app/safe-harbor/app/safe-harbor-rich-stylometry-adapter.js'
    },
    per_lane_profiles: perLaneProfiles,
    triad_profile: triadProfile,
    cross_lane_divergence: crossLaneDivergence,
    traceability_surface: classifyTraceability(perLaneProfiles, crossLaneDivergence),
    rich_fingerprint: richFingerprint,
    fingerprint_source_schema: 'lane:register:numeric_axes:function_word_top10:char_trigram_top10',
    compatibility_note: 'Phase 1 evidence lane only. Legacy SHI derivation remains unchanged until a future explicit v3 derivation phase.'
  });
}

if (typeof window !== 'undefined') {
  window.TD613_SAFE_HARBOR_STYLOMETRY = Object.freeze({
    version: SCHEMA_VERSION,
    buildSafeHarborLaneProfile,
    buildSafeHarborRichDivergence,
    buildSafeHarborRichStylometry
  });
  window.dispatchEvent(new CustomEvent('td613:safe-harbor:rich-stylometry-ready', {
    detail: { version: SCHEMA_VERSION }
  }));
}
