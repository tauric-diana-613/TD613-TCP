function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round3(value) {
  return Number(value.toFixed(3));
}

function round2(value) {
  return Number(value.toFixed(2));
}

function normalizeText(text = '') {
  return text
    .replace(/\u2019/g, "'")
    .replace(/\u2018/g, "'")
    .replace(/\u2014/g, '-')
    .replace(/\u2013/g, '-');
}

function stripTerminalPunctuation(text = '') {
  return text.replace(/[.!?]+$/g, '').trim();
}

function sentenceChunks(text = '') {
  return normalizeText(text)
    .replace(/\r\n/g, '\n')
    .split(/\n+/)
    .flatMap((line) => line.match(/[^.!?]+[.!?]?/g) || [])
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

function pickJoiner(targetProfile = {}, mod = {}) {
  const mix = targetProfile.punctuationMix || {};
  const functionWords = targetProfile.functionWordProfile || {};

  if ((mix.strong || 0) >= 0.18 && (mix.strong || 0) >= (mix.comma || 0)) {
    return '; ';
  }

  if ((mix.dash || 0) >= 0.14 && (mix.dash || 0) >= (mix.comma || 0)) {
    return ' - ';
  }

  if ((functionWords.but || 0) > (functionWords.and || 0) + 0.01) {
    return ', but ';
  }

  if ((mod.punc || 0) > 1) {
    return '; ';
  }

  return ', and ';
}

function mergeSentencePairs(text = '', targetProfile = {}, strength = 0.76, mod = {}) {
  let chunks = sentenceChunks(text);
  if (chunks.length < 2) {
    return text;
  }

  const currentAvg = avgSentenceLength(text);
  const targetAvg = targetProfile.avgSentenceLength || currentAvg;
  const delta = targetAvg - currentAvg;
  const desiredMerges = Math.min(
    chunks.length - 1,
    Math.max(0, Math.round((delta / 4) * Math.max(0.6, strength)))
  );

  if (desiredMerges <= 0) {
    return text;
  }

  const joiner = pickJoiner(targetProfile, mod);
  const merged = [];
  let index = 0;
  let merges = 0;

  while (index < chunks.length) {
    if (merges < desiredMerges && index < chunks.length - 1) {
      merged.push(`${stripTerminalPunctuation(chunks[index])}${joiner}${stripTerminalPunctuation(chunks[index + 1])}.`);
      index += 2;
      merges += 1;
      continue;
    }

    merged.push(chunks[index]);
    index += 1;
  }

  return merged.join(' ');
}

function splitLongSentences(text = '', targetProfile = {}, strength = 0.76) {
  const currentAvg = avgSentenceLength(text);
  const targetAvg = targetProfile.avgSentenceLength || currentAvg;
  const delta = currentAvg - targetAvg;
  const desiredSplits = Math.max(0, Math.round((delta / 4) * Math.max(0.6, strength)));

  if (desiredSplits <= 0) {
    return text;
  }

  let result = normalizeText(text);
  const patterns = [
    /;\s+/g,
    /\s-\s+/g,
    /,\s+(and|but|so|because|though|while|if|when|which|that)\s+/gi,
    /:\s+/g,
    /,\s+/g
  ];
  let splitsApplied = 0;

  for (const pattern of patterns) {
    result = result.replace(pattern, (match, connector) => {
      if (splitsApplied >= desiredSplits) {
        return match;
      }

      splitsApplied += 1;
      return connector ? `. ${connector} ` : '. ';
    });

    if (splitsApplied >= desiredSplits) {
      break;
    }
  }

  return result;
}

function applyLineBreakTexture(text = '', targetProfile = {}, strength = 0.76) {
  const current = lineBreakDensity(text);
  const target = targetProfile.lineBreakDensity || 0;

  if (target <= current + 0.04) {
    return target < current - 0.04 ? text.replace(/\n+/g, ' ') : text;
  }

  let remaining = Math.max(1, Math.round((target - current) * 4 * Math.max(0.6, strength)));
  return text.replace(/([.!?])\s+/g, (match, terminal) => {
    if (remaining <= 0) {
      return match;
    }

    remaining -= 1;
    return `${terminal}\n`;
  });
}

function applyContractionTexture(text = '', targetProfile = {}, mod = {}) {
  const target = targetProfile.contractionDensity ?? 0;
  const current = contractionDensity(text);
  const direction = target > current + 0.01
    ? 1
    : target < current - 0.01
      ? -1
      : Math.sign(mod.cont || 0);

  if (!direction) {
    return text;
  }

  if (direction > 0) {
    return text
      .replace(/\bdo not\b/gi, "don't")
      .replace(/\bdoes not\b/gi, "doesn't")
      .replace(/\bdid not\b/gi, "didn't")
      .replace(/\bcannot\b/gi, "can't")
      .replace(/\bI am\b/g, "I'm")
      .replace(/\bI have\b/gi, "I've")
      .replace(/\bI will\b/gi, "I'll")
      .replace(/\bI would\b/gi, "I'd")
      .replace(/\bwe are\b/gi, "we're")
      .replace(/\bthey are\b/gi, "they're")
      .replace(/\byou are\b/gi, "you're")
      .replace(/\bit is\b/gi, "it's")
      .replace(/\bthat is\b/gi, "that's");
  }

  return text
    .replace(/\bdon't\b/gi, 'do not')
    .replace(/\bdoesn't\b/gi, 'does not')
    .replace(/\bdidn't\b/gi, 'did not')
    .replace(/\bcan't\b/gi, 'cannot')
    .replace(/\bI'm\b/g, 'I am')
    .replace(/\bI've\b/gi, 'I have')
    .replace(/\bI'll\b/gi, 'I will')
    .replace(/\bI'd\b/gi, 'I would')
    .replace(/\bwe're\b/gi, 'we are')
    .replace(/\bthey're\b/gi, 'they are')
    .replace(/\byou're\b/gi, 'you are')
    .replace(/\bit's\b/gi, 'it is')
    .replace(/\bthat's\b/gi, 'that is');
}

function applyPunctuationTexture(text = '', targetProfile = {}, mod = {}) {
  let result = text;
  const mix = targetProfile.punctuationMix || {};

  if ((mix.strong || 0) >= 0.18 || (mod.punc || 0) > 1) {
    let swaps = Math.max(1, Math.round(((mix.strong || 0) + Math.max(0, mod.punc || 0) * 0.05) * 4));
    result = result.replace(/,\s+/g, (match) => {
      if (swaps <= 0) {
        return match;
      }

      swaps -= 1;
      return '; ';
    });
  } else if ((mix.strong || 0) <= 0.08 && (mod.punc || 0) < 0) {
    result = result.replace(/;\s+/g, '. ');
  }

  if ((mix.dash || 0) >= 0.14) {
    let dashSwap = 1;
    result = result.replace(/,\s+/g, (match) => {
      if (dashSwap <= 0) {
        return match;
      }

      dashSwap -= 1;
      return ' - ';
    });
  }

  return result;
}

export function tokenize(text) {
  return normalizeText(text).toLowerCase().match(/[a-z0-9']+/g) || [];
}

export function sentenceSplit(text) {
  return normalizeText(text)
    .split(/(?:[.!?]+\s+|\n+)/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function sentenceLengths(text) {
  return sentenceSplit(text)
    .map((sentence) => tokenize(sentence).length)
    .filter((count) => count > 0);
}

export function avgSentenceLength(text) {
  const lengths = sentenceLengths(text);
  if (!lengths.length) {
    return 0;
  }

  const words = lengths.reduce((sum, count) => sum + count, 0);
  return words / lengths.length;
}

export function sentenceLengthSpread(text) {
  const lengths = sentenceLengths(text);
  if (lengths.length <= 1) {
    return 0;
  }

  const mean = lengths.reduce((sum, count) => sum + count, 0) / lengths.length;
  const variance = lengths.reduce((sum, count) => sum + ((count - mean) ** 2), 0) / lengths.length;
  return round2(Math.sqrt(variance));
}

export function punctuationDensity(text) {
  const words = tokenize(text).length;
  const marks = (normalizeText(text).match(/[,:;.!?-]/g) || []).length;
  return round3(marks / Math.max(words, 1));
}

export function contractionDensity(text) {
  const words = tokenize(text);
  const contractions = words.filter((word) => word.includes("'")).length;
  return round3(contractions / Math.max(words.length, 1));
}

export function lineBreakDensity(text) {
  const sentences = sentenceSplit(text).length;
  const breaks = (normalizeText(text).match(/\n/g) || []).length;
  return round3(breaks / Math.max(sentences, 1));
}

export function punctuationMix(text) {
  const normalized = normalizeText(text);
  const comma = (normalized.match(/,/g) || []).length;
  const strong = (normalized.match(/[;:]/g) || []).length;
  const terminal = (normalized.match(/[.!?]/g) || []).length;
  const dash = (normalized.match(/(?:\s-\s|--)/g) || []).length;
  const total = comma + strong + terminal + dash;

  if (!total) {
    return {
      comma: 0,
      strong: 0,
      terminal: 0,
      dash: 0
    };
  }

  return {
    comma: round3(comma / total),
    strong: round3(strong / total),
    terminal: round3(terminal / total),
    dash: round3(dash / total)
  };
}

export function repeatedBigramPressure(text) {
  const words = tokenize(text);
  if (words.length < 2) {
    return 0;
  }

  const counts = new Map();
  for (let index = 0; index < words.length - 1; index += 1) {
    const bigram = `${words[index]} ${words[index + 1]}`;
    counts.set(bigram, (counts.get(bigram) || 0) + 1);
  }

  let repeated = 0;
  for (const count of counts.values()) {
    if (count > 1) {
      repeated += count - 1;
    }
  }

  return round3(repeated / Math.max(words.length - 1, 1));
}

export function recurrencePressure(text) {
  const punct = clamp01(punctuationDensity(text) / 0.35);
  const line = clamp01(lineBreakDensity(text) / 0.75);
  const bigram = clamp01(repeatedBigramPressure(text) / 0.18);
  return round3((punct + line + bigram) / 3);
}

export function lexicalDispersion(text) {
  const words = tokenize(text);
  if (!words.length) {
    return 0;
  }

  const uniqueRatio = new Set(words).size / words.length;
  const counts = {};
  words.forEach((word) => {
    counts[word] = (counts[word] || 0) + 1;
  });

  let repeated = 0;
  let singletons = 0;
  Object.values(counts).forEach((count) => {
    if (count === 1) {
      singletons += 1;
    } else {
      repeated += count - 1;
    }
  });

  const predictability = 1 - repeated / Math.max(words.length, 1);
  const novelty = singletons / Math.max(Object.keys(counts).length, 1);
  return round3((0.4 * uniqueRatio) + (0.3 * predictability) + (0.3 * novelty));
}

export function jaccard(a, b) {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = [...setA].filter((value) => setB.has(value)).length;
  const union = new Set([...setA, ...setB]).size || 1;
  return intersection / union;
}

function boundedDistance(a, b, scale) {
  return clamp01(Math.abs(a - b) / scale);
}

function punctuationMixDistance(a = {}, b = {}) {
  return distributionDistance(a, b, ['comma', 'strong', 'terminal', 'dash']);
}

const FUNCTION_WORDS = [
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'that', 'this', 'it',
  'to', 'of', 'in', 'on', 'for', 'with', 'as', 'is', 'are', 'was',
  'were', 'be', 'been', 'i', 'you', 'we', 'they', 'he', 'she',
  'my', 'your', 'our', 'their', 'not'
];

export function functionWordProfile(text = '') {
  const words = tokenize(text);
  const total = Math.max(words.length, 1);
  const counts = Object.fromEntries(FUNCTION_WORDS.map((word) => [word, 0]));

  for (const word of words) {
    if (Object.hasOwn(counts, word)) {
      counts[word] += 1;
    }
  }

  const profile = {};
  for (const word of FUNCTION_WORDS) {
    profile[word] = round3(counts[word] / total);
  }

  return profile;
}

function functionWordDistance(a = {}, b = {}) {
  return distributionDistance(a, b, FUNCTION_WORDS);
}

const WORD_LENGTH_BUCKETS = [
  { id: '1-2', max: 2 },
  { id: '3-4', max: 4 },
  { id: '5-6', max: 6 },
  { id: '7-8', max: 8 },
  { id: '9+', max: Infinity }
];

function distributionDistance(a = {}, b = {}, keys = null) {
  const keyset = keys || [...new Set([...Object.keys(a), ...Object.keys(b)])];
  if (!keyset.length) {
    return 0;
  }

  const sumA = keyset.reduce((sum, key) => sum + (a[key] || 0), 0) || 1;
  const sumB = keyset.reduce((sum, key) => sum + (b[key] || 0), 0) || 1;

  let js = 0;
  for (const key of keyset) {
    const p = (a[key] || 0) / sumA;
    const q = (b[key] || 0) / sumB;
    const m = (p + q) / 2;

    if (p > 0) {
      js += 0.5 * p * Math.log2(p / m);
    }
    if (q > 0) {
      js += 0.5 * q * Math.log2(q / m);
    }
  }

  return round3(clamp01(Math.sqrt(js)));
}

function blendDistribution(a = {}, b = {}, blend = 0, keys = null) {
  const keyset = keys || [...new Set([...Object.keys(a), ...Object.keys(b)])];
  const output = {};

  for (const key of keyset) {
    output[key] = round3(((a[key] || 0) * (1 - blend)) + ((b[key] || 0) * blend));
  }

  return output;
}

export function wordLengthProfile(text = '') {
  const words = tokenize(text);
  const total = Math.max(words.length, 1);
  const counts = Object.fromEntries(WORD_LENGTH_BUCKETS.map((bucket) => [bucket.id, 0]));

  for (const word of words) {
    const length = word.replace(/'/g, '').length;
    const bucket = WORD_LENGTH_BUCKETS.find((candidate) => length <= candidate.max);
    counts[bucket ? bucket.id : '9+'] += 1;
  }

  const profile = {};
  for (const bucket of WORD_LENGTH_BUCKETS) {
    profile[bucket.id] = round3(counts[bucket.id] / total);
  }

  return profile;
}

function wordLengthDistance(a = {}, b = {}) {
  return distributionDistance(
    a,
    b,
    WORD_LENGTH_BUCKETS.map((bucket) => bucket.id)
  );
}

export function charTrigramProfile(text = '') {
  const normalized = normalizeText(text)
    .toLowerCase()
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (normalized.length < 3) {
    return {};
  }

  const counts = {};
  let total = 0;
  for (let index = 0; index <= normalized.length - 3; index += 1) {
    const gram = normalized.slice(index, index + 3);
    counts[gram] = (counts[gram] || 0) + 1;
    total += 1;
  }

  const profile = {};
  Object.entries(counts).forEach(([gram, count]) => {
    profile[gram] = round3(count / Math.max(total, 1));
  });

  return profile;
}

function charTrigramDistance(a = {}, b = {}) {
  return distributionDistance(a, b);
}

function normalizeAxis(value, min, max) {
  return round3(clamp01((value - min) / Math.max(max - min, 1e-9)));
}

function heatmapLengthBucket(length) {
  if (length <= 6) {
    return 0;
  }
  if (length <= 12) {
    return 1;
  }
  if (length <= 20) {
    return 2;
  }
  return 3;
}

function heatmapPunctuationBucket(count) {
  if (count <= 0) {
    return 0;
  }
  if (count === 1) {
    return 1;
  }
  if (count === 2) {
    return 2;
  }
  return 3;
}

export function extractCadenceProfile(text = '') {
  const words = tokenize(text);
  const sentences = sentenceSplit(text);

  return {
    empty: words.length === 0,
    wordCount: words.length,
    sentenceCount: sentences.length,
    avgSentenceLength: round2(avgSentenceLength(text)),
    sentenceLengthSpread: sentenceLengthSpread(text),
    punctuationDensity: punctuationDensity(text),
    punctuationMix: punctuationMix(text),
    contractionDensity: contractionDensity(text),
    lineBreakDensity: lineBreakDensity(text),
    repeatedBigramPressure: repeatedBigramPressure(text),
    recurrencePressure: recurrencePressure(text),
    lexicalDispersion: lexicalDispersion(text),
    functionWordProfile: functionWordProfile(text),
    wordLengthProfile: wordLengthProfile(text),
    charTrigramProfile: charTrigramProfile(text)
  };
}

export function applyCadenceMod(profile, mod = {}) {
  if (!profile) {
    return extractCadenceProfile('');
  }

  mod = mod || {};

  const sentBias = Number(((mod.sent || 0) * 1.75).toFixed(2));
  const contractionBias = Number(((mod.cont || 0) * 0.028).toFixed(3));
  const punctuationBias = Number(((mod.punc || 0) * 0.022).toFixed(3));
  const lineBreakBias = Number(((mod.sent || 0) * 0.04).toFixed(3));
  const lexicalBias = Number((((mod.sent || 0) * 0.008) - ((mod.punc || 0) * 0.004)).toFixed(3));

  const avgSentence = round2(Math.max(1, profile.avgSentenceLength + sentBias));
  const spread = round2(Math.max(0, (profile.sentenceLengthSpread || 0) + Math.abs(sentBias * 0.62)));
  const punctuation = round3(clamp01(profile.punctuationDensity + punctuationBias));
  const contraction = round3(clamp01(profile.contractionDensity + contractionBias));
  const lineBreak = round3(clamp01(profile.lineBreakDensity + lineBreakBias));
  const lexical = round3(clamp01(profile.lexicalDispersion + lexicalBias));
  const recurrence = round3(
    (
      clamp01(punctuation / 0.35) +
      clamp01(lineBreak / 0.75) +
      clamp01(profile.repeatedBigramPressure / 0.18)
    ) / 3
  );

  return {
    ...profile,
    avgSentenceLength: avgSentence,
    sentenceLengthSpread: spread,
    punctuationDensity: punctuation,
    contractionDensity: contraction,
    lineBreakDensity: lineBreak,
    recurrencePressure: recurrence,
    lexicalDispersion: lexical,
    shellBias: {
      sent: mod.sent || 0,
      cont: mod.cont || 0,
      punc: mod.punc || 0
    }
  };
}

export function applyCadenceShell(profile, shell = {}) {
  if (!profile) {
    return extractCadenceProfile('');
  }

  if (!shell || shell.mode === 'native') {
    return applyCadenceMod(profile, {});
  }

  if (!shell.profile) {
    return applyCadenceMod(profile, shell.mod || {});
  }

  const source = shell.profile;
  const strength = clamp(Number(shell.strength ?? 0.76), 0, 1);
  const softBlend = clamp(strength * 0.58, 0, 1);
  const cadenceBlend = clamp(strength * 0.78, 0, 1);
  const recurrenceBlend = clamp(strength * 0.7, 0, 1);

  const avgSentence = round2(Math.max(
    1,
    (profile.avgSentenceLength * (1 - cadenceBlend)) + (source.avgSentenceLength * cadenceBlend)
  ));
  const spread = round2(Math.max(
    0,
    ((profile.sentenceLengthSpread || 0) * (1 - cadenceBlend)) + ((source.sentenceLengthSpread || 0) * cadenceBlend)
  ));
  const punctuation = round3(clamp01(
    (profile.punctuationDensity * (1 - cadenceBlend)) + (source.punctuationDensity * cadenceBlend)
  ));
  const contraction = round3(clamp01(
    (profile.contractionDensity * (1 - cadenceBlend)) + (source.contractionDensity * cadenceBlend)
  ));
  const lineBreak = round3(clamp01(
    (profile.lineBreakDensity * (1 - recurrenceBlend)) + (source.lineBreakDensity * recurrenceBlend)
  ));
  const bigram = round3(clamp01(
    (profile.repeatedBigramPressure * (1 - recurrenceBlend)) + (source.repeatedBigramPressure * recurrenceBlend)
  ));
  const lexical = round3(clamp01(
    (profile.lexicalDispersion * (1 - softBlend)) + (source.lexicalDispersion * softBlend)
  ));
  const recurrence = round3(
    (
      clamp01(punctuation / 0.35) +
      clamp01(lineBreak / 0.75) +
      clamp01(bigram / 0.18)
    ) / 3
  );

  return {
    ...profile,
    avgSentenceLength: avgSentence,
    sentenceLengthSpread: spread,
    punctuationDensity: punctuation,
    punctuationMix: source.punctuationMix
      ? blendDistribution(profile.punctuationMix, source.punctuationMix, cadenceBlend, ['comma', 'strong', 'terminal', 'dash'])
      : profile.punctuationMix,
    contractionDensity: contraction,
    lineBreakDensity: lineBreak,
    repeatedBigramPressure: bigram,
    recurrencePressure: recurrence,
    lexicalDispersion: lexical,
    functionWordProfile: source.functionWordProfile
      ? blendDistribution(profile.functionWordProfile, source.functionWordProfile, softBlend, FUNCTION_WORDS)
      : profile.functionWordProfile,
    wordLengthProfile: source.wordLengthProfile
      ? blendDistribution(
          profile.wordLengthProfile,
          source.wordLengthProfile,
          cadenceBlend,
          WORD_LENGTH_BUCKETS.map((bucket) => bucket.id)
        )
      : profile.wordLengthProfile,
    charTrigramProfile: source.charTrigramProfile
      ? blendDistribution(profile.charTrigramProfile, source.charTrigramProfile, softBlend)
      : profile.charTrigramProfile,
    shellBias: {
      mode: shell.mode,
      strength: round3(strength)
    }
  };
}

export function cadenceModFromProfile(profile) {
  if (!profile || profile.empty) {
    return { sent: 0, cont: 0, punc: 0 };
  }

  const sent = clamp(Math.round((profile.avgSentenceLength - 14) / 3), -3, 3);
  const cont = clamp(Math.round((profile.contractionDensity - 0.06) / 0.03), -3, 3);
  const punc = clamp(Math.round((profile.punctuationDensity - 0.11) / 0.025), -3, 3);

  return { sent, cont, punc };
}

function normalizeShellMod(shell = {}) {
  if (!shell || shell.mode === 'native') {
    return { sent: 0, cont: 0, punc: 0 };
  }

  const mod = shell.mod || cadenceModFromProfile(shell.profile || extractCadenceProfile(''));

  return {
    sent: clamp(Math.round(Number(mod.sent || 0)), -3, 3),
    cont: clamp(Math.round(Number(mod.cont || 0)), -3, 3),
    punc: clamp(Math.round(Number(mod.punc || 0)), -3, 3)
  };
}

export function applyCadenceToText(text = '', shell = {}) {
  const mod = normalizeShellMod(shell);
  const strength = clamp(Number(shell?.strength ?? (shell?.profile ? 0.82 : 0.68)), 0, 1);

  if (!text || ((!mod.sent && !mod.cont && !mod.punc) && !shell?.profile)) {
    return text;
  }

  return transformText(text, mod, {
    profile: shell?.profile || null,
    strength
  });
}

export function compareTexts(a, b, options = {}) {
  const wordsA = tokenize(a);
  const wordsB = tokenize(b);
  const profileA = options.profileA || extractCadenceProfile(a);
  const profileB = options.profileB || extractCadenceProfile(b);

  const lexicalOverlap = jaccard(wordsA, wordsB);
  const sentenceDistance = boundedDistance(profileA.avgSentenceLength, profileB.avgSentenceLength, 12);
  const punctDistance = boundedDistance(profileA.punctuationDensity, profileB.punctuationDensity, 0.35);
  const spreadDistance = boundedDistance(profileA.sentenceLengthSpread || 0, profileB.sentenceLengthSpread || 0, 14);
  const contractionDistance = boundedDistance(
    profileA.contractionDensity,
    profileB.contractionDensity,
    0.25
  );
  const lexicalDistance = boundedDistance(profileA.lexicalDispersion, profileB.lexicalDispersion, 0.4);
  const punctShapeDistance = punctuationMixDistance(profileA.punctuationMix, profileB.punctuationMix);
  const functionDistance = functionWordDistance(profileA.functionWordProfile, profileB.functionWordProfile);
  const wordLengthDistanceValue = wordLengthDistance(profileA.wordLengthProfile, profileB.wordLengthProfile);
  const charGramDistance = charTrigramDistance(profileA.charTrigramProfile, profileB.charTrigramProfile);
  const recurrenceDistance = clamp01(
    Math.abs(profileA.recurrencePressure - profileB.recurrencePressure)
  );
  const exactTextMatch = normalizeText(a).trim().length > 0 && normalizeText(a).trim() === normalizeText(b).trim();
  const exactProfileMatch =
    Math.abs((profileA.avgSentenceLength || 0) - (profileB.avgSentenceLength || 0)) < 0.001 &&
    Math.abs((profileA.sentenceLengthSpread || 0) - (profileB.sentenceLengthSpread || 0)) < 0.001 &&
    Math.abs((profileA.punctuationDensity || 0) - (profileB.punctuationDensity || 0)) < 0.001 &&
    Math.abs((profileA.contractionDensity || 0) - (profileB.contractionDensity || 0)) < 0.001 &&
    Math.abs((profileA.lineBreakDensity || 0) - (profileB.lineBreakDensity || 0)) < 0.001 &&
    Math.abs((profileA.repeatedBigramPressure || 0) - (profileB.repeatedBigramPressure || 0)) < 0.001 &&
    Math.abs((profileA.recurrencePressure || 0) - (profileB.recurrencePressure || 0)) < 0.001 &&
    functionDistance === 0 &&
    wordLengthDistanceValue === 0 &&
    charGramDistance === 0 &&
    Math.abs((profileA.lexicalDispersion || 0) - (profileB.lexicalDispersion || 0)) < 0.001 &&
    punctShapeDistance === 0;

  const similarity = exactTextMatch && exactProfileMatch
    ? 1
    : clamp01(
        (lexicalOverlap * 0.08) +
        ((1 - sentenceDistance) * 0.12) +
        ((1 - spreadDistance) * 0.08) +
        ((1 - punctDistance) * 0.08) +
        ((1 - punctShapeDistance) * 0.10) +
        ((1 - contractionDistance) * 0.08) +
        ((1 - functionDistance) * 0.16) +
        ((1 - wordLengthDistanceValue) * 0.08) +
        ((1 - charGramDistance) * 0.16) +
        ((1 - lexicalDistance) * 0.03) +
        ((1 - recurrenceDistance) * 0.03)
      );

  const traceability = exactProfileMatch
    ? 1
    : clamp01(
        ((1 - sentenceDistance) * 0.16) +
        ((1 - spreadDistance) * 0.12) +
        ((1 - punctDistance) * 0.10) +
        ((1 - punctShapeDistance) * 0.14) +
        ((1 - contractionDistance) * 0.12) +
        ((1 - functionDistance) * 0.18) +
        ((1 - wordLengthDistanceValue) * 0.08) +
        ((1 - charGramDistance) * 0.08) +
        ((1 - recurrenceDistance) * 0.02)
      );

  return {
    similarity: round3(similarity),
    traceability: round3(traceability),
    recurrencePressure: round3((profileA.recurrencePressure + profileB.recurrencePressure) / 2),
    sentenceDistance: round3(sentenceDistance),
    spreadDistance: round3(spreadDistance),
    punctDistance: round3(punctDistance),
    punctShapeDistance: round3(punctShapeDistance),
    contractionDistance: round3(contractionDistance),
    functionWordDistance: round3(functionDistance),
    wordLengthDistance: round3(wordLengthDistanceValue),
    charGramDistance: round3(charGramDistance),
    lexicalDistance: round3(lexicalDistance),
    recurrenceDistance: round3(recurrenceDistance),
    avgSentenceA: profileA.avgSentenceLength,
    avgSentenceB: profileB.avgSentenceLength,
    lexicalOverlap: round3(lexicalOverlap),
    profileA,
    profileB
  };
}

export function cadenceAxisVector(input) {
  const profile = typeof input === 'string' ? extractCadenceProfile(input) : input;

  return [
    {
      id: 'rhythm_mean',
      label: 'Rhythm mean',
      raw: round2(profile.avgSentenceLength || 0),
      normalized: normalizeAxis(profile.avgSentenceLength || 0, 4, 32)
    },
    {
      id: 'rhythm_spread',
      label: 'Rhythm spread',
      raw: round2(profile.sentenceLengthSpread || 0),
      normalized: normalizeAxis(profile.sentenceLengthSpread || 0, 0, 14)
    },
    {
      id: 'punctuation',
      label: 'Punctuation density',
      raw: round3(profile.punctuationDensity || 0),
      normalized: normalizeAxis(profile.punctuationDensity || 0, 0, 0.22)
    },
    {
      id: 'contractions',
      label: 'Contraction density',
      raw: round3(profile.contractionDensity || 0),
      normalized: normalizeAxis(profile.contractionDensity || 0, 0, 0.18)
    },
    {
      id: 'line_breaks',
      label: 'Line-break drag',
      raw: round3(profile.lineBreakDensity || 0),
      normalized: normalizeAxis(profile.lineBreakDensity || 0, 0, 0.75)
    },
    {
      id: 'recurrence',
      label: 'Recurrence pressure',
      raw: round3(profile.recurrencePressure || 0),
      normalized: normalizeAxis(profile.recurrencePressure || 0, 0, 1)
    },
    {
      id: 'lexical',
      label: 'Lexical dispersion',
      raw: round3(profile.lexicalDispersion || 0),
      normalized: normalizeAxis(profile.lexicalDispersion || 0, 0.35, 1)
    }
  ];
}

export function cadenceHeatmap(text = '') {
  const sentences = sentenceSplit(text);
  const rows = ['quiet-short', 'measured-mid', 'extended-long', 'drifting-wide'];
  const cols = ['mute', 'marked', 'charged', 'saturated'];
  const matrix = Array.from({ length: 4 }, () => Array(4).fill(0));

  if (!sentences.length) {
    return {
      rows,
      cols,
      matrix,
      trace: []
    };
  }

  const trace = sentences.map((sentence, index) => {
    const length = tokenize(sentence).length;
    const marks = (normalizeText(sentence).match(/[,:;.!?-]/g) || []).length;
    const row = heatmapLengthBucket(length);
    const col = heatmapPunctuationBucket(marks);
    matrix[row][col] += 1;

    return {
      index,
      length,
      punctuation: marks,
      row,
      col
    };
  });

  const normalizedMatrix = matrix.map((row) =>
    row.map((count) => round3(count / Math.max(sentences.length, 1)))
  );

  return {
    rows,
    cols,
    matrix: normalizedMatrix,
    trace
  };
}

export function buildCadenceSignature(text = '', profile = extractCadenceProfile(text)) {
  const axes = cadenceAxisVector(profile);
  const dominantAxes = [...axes]
    .sort((a, b) => b.normalized - a.normalized)
    .slice(0, 3)
    .map((axis) => axis.id);

  return {
    profile,
    axes,
    punctuationMix: profile.punctuationMix || punctuationMix(text),
    heatmap: cadenceHeatmap(text),
    dominantAxes
  };
}

export function transformText(text, mod = {}, options = {}) {
  let result = normalizeText(text);
  const strength = clamp(Number(options?.strength ?? 0.76), 0, 1);
  const baseProfile = extractCadenceProfile(result);
  const targetProfile = options?.profile
    ? applyCadenceShell(baseProfile, {
        mode: 'borrowed',
        profile: options.profile,
        strength
      })
    : applyCadenceMod(baseProfile, mod);

  if ((targetProfile.avgSentenceLength || baseProfile.avgSentenceLength) > baseProfile.avgSentenceLength + 1.4 || (mod.sent || 0) > 0) {
    result = mergeSentencePairs(result, targetProfile, strength, mod);
  } else if ((targetProfile.avgSentenceLength || baseProfile.avgSentenceLength) < baseProfile.avgSentenceLength - 1.4 || (mod.sent || 0) < 0) {
    result = splitLongSentences(result, targetProfile, strength);
  }

  result = applyContractionTexture(result, targetProfile, mod);
  result = applyPunctuationTexture(result, targetProfile, mod);
  result = applyLineBreakTexture(result, targetProfile, strength);

  if ((mod.punc || 0) < 0) {
    result = result.replace(/[;:]+/g, '.').replace(/,+/g, ',');
  }

  return result
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ ]{2,}/g, ' ')
    .trim();
}
