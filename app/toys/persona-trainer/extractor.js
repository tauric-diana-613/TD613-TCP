const SCALAR_DIMENSIONS = Object.freeze([
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
  'latinatePreference'
]);

const DISTRIBUTION_DIMENSIONS = Object.freeze([
  'functionWordProfile',
  'wordLengthProfile',
  'charTrigramProfile',
  'punctuationMix'
]);

function mean(values = []) {
  if (!values.length) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function stddev(values = []) {
  if (values.length < 2) {
    return 0;
  }
  const baseline = mean(values);
  const variance = values.reduce((sum, value) => sum + ((value - baseline) ** 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function percentile(sortedValues = [], point = 50) {
  if (!sortedValues.length) {
    return 0;
  }
  const index = (point / 100) * (sortedValues.length - 1);
  const low = Math.floor(index);
  const high = Math.ceil(index);
  if (low === high) {
    return sortedValues[low];
  }
  return sortedValues[low] + ((sortedValues[high] - sortedValues[low]) * (index - low));
}

function round(value, digits = 4) {
  return Number(Number(value || 0).toFixed(digits));
}

function distributionAverage(profiles = [], key) {
  const merged = {};
  let count = 0;

  profiles.forEach((profile) => {
    const dist = profile?.[key];
    if (!dist || typeof dist !== 'object') {
      return;
    }
    count += 1;
    Object.entries(dist).forEach(([entryKey, entryValue]) => {
      merged[entryKey] = (merged[entryKey] || 0) + (Number(entryValue) || 0);
    });
  });

  if (!count) {
    return {};
  }

  Object.keys(merged).forEach((entryKey) => {
    merged[entryKey] = round(merged[entryKey] / count, 6);
  });

  return merged;
}

function normalizeWhitespace(text = '') {
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/\u00A0/g, ' ')
    .trim();
}

export function splitCorpusSamples(rawText = '') {
  const normalized = normalizeWhitespace(rawText);
  if (!normalized) {
    return [];
  }

  return normalized
    .split(/\n\s*\n+/)
    .map((sample) => sample.trim())
    .filter(Boolean);
}

export function extractProfile(engine, text = '') {
  return engine.extractCadenceProfile(String(text || ''));
}

export function extractCorpusProfiles(engine, samples = []) {
  return samples
    .filter((sample) => typeof sample === 'string' && sample.trim())
    .map((sample) => extractProfile(engine, sample));
}

export function aggregateProfiles(profiles = []) {
  if (!profiles.length) {
    throw new Error('Cannot aggregate an empty profile set.');
  }

  const scalars = {};
  SCALAR_DIMENSIONS.forEach((dimension) => {
    const values = profiles.map((profile) => Number(profile?.[dimension]) || 0);
    const sorted = [...values].sort((left, right) => left - right);
    scalars[dimension] = {
      mean: round(mean(values)),
      stddev: round(stddev(values)),
      min: round(sorted[0] || 0),
      max: round(sorted[sorted.length - 1] || 0),
      p10: round(percentile(sorted, 10)),
      p50: round(percentile(sorted, 50)),
      p90: round(percentile(sorted, 90)),
      n: values.length
    };
  });

  const distributions = {};
  DISTRIBUTION_DIMENSIONS.forEach((dimension) => {
    distributions[dimension] = distributionAverage(profiles, dimension);
  });

  const registerVotes = profiles.reduce((acc, profile) => {
    const mode = profile?.registerMode || 'unknown';
    acc[mode] = (acc[mode] || 0) + 1;
    return acc;
  }, {});
  const registerMode = Object.entries(registerVotes).sort((left, right) => right[1] - left[1])[0]?.[0] || 'unknown';

  return {
    sampleCount: profiles.length,
    scalars,
    distributions,
    registerMode,
    registerVotes
  };
}

export function corpusSelfSimilarity(engine, samples = []) {
  const pool = samples.filter((sample) => sample.trim());
  if (pool.length < 2) {
    return {
      meanSimilarity: 1,
      meanTraceability: 1,
      pairs: 0
    };
  }

  let similaritySum = 0;
  let traceabilitySum = 0;
  let pairs = 0;

  for (let left = 0; left < pool.length; left += 1) {
    for (let right = left + 1; right < pool.length; right += 1) {
      const comparison = engine.compareTexts(pool[left], pool[right]);
      similaritySum += comparison.similarity || 0;
      traceabilitySum += comparison.traceability || 0;
      pairs += 1;
    }
  }

  return {
    meanSimilarity: round(similaritySum / pairs),
    meanTraceability: round(traceabilitySum / pairs),
    pairs
  };
}

export function fingerprintToProfile(fingerprint = {}) {
  const profile = {};

  SCALAR_DIMENSIONS.forEach((dimension) => {
    profile[dimension] = Number(fingerprint?.scalars?.[dimension]?.mean) || 0;
  });

  DISTRIBUTION_DIMENSIONS.forEach((dimension) => {
    profile[dimension] = { ...(fingerprint?.distributions?.[dimension] || {}) };
  });

  profile.registerMode = fingerprint?.registerMode || 'unknown';
  return profile;
}

export function buildCorpusExtraction(engine, rawCorpus = '') {
  const samples = Array.isArray(rawCorpus) ? rawCorpus.filter(Boolean) : splitCorpusSamples(rawCorpus);
  if (!samples.length) {
    throw new Error('Paste at least one reference sample before extraction.');
  }

  const profiles = extractCorpusProfiles(engine, samples);
  const fingerprint = aggregateProfiles(profiles);
  const selfSimilarity = corpusSelfSimilarity(engine, samples);
  const wordCounts = samples.map((sample) => sample.split(/\s+/).filter(Boolean).length);
  const sentenceCounts = samples.map((sample) => {
    const sentences = typeof engine.sentenceSplit === 'function'
      ? engine.sentenceSplit(sample)
      : sample.split(/[.!?]+/).map((chunk) => chunk.trim()).filter(Boolean);
    return sentences.length;
  });

  return {
    rawCorpus: Array.isArray(rawCorpus) ? samples.join('\n\n') : normalizeWhitespace(rawCorpus),
    samples,
    profiles,
    fingerprint,
    targetProfile: fingerprintToProfile(fingerprint),
    selfSimilarity,
    stats: {
      sampleCount: samples.length,
      totalWords: wordCounts.reduce((sum, value) => sum + value, 0),
      avgWordsPerSample: round(mean(wordCounts), 2),
      avgSentencesPerSample: round(mean(sentenceCounts), 2)
    }
  };
}

export {
  SCALAR_DIMENSIONS,
  DISTRIBUTION_DIMENSIONS
};
