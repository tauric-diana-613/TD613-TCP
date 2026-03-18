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
  const distance =
    Math.abs((a.comma || 0) - (b.comma || 0)) +
    Math.abs((a.strong || 0) - (b.strong || 0)) +
    Math.abs((a.terminal || 0) - (b.terminal || 0)) +
    Math.abs((a.dash || 0) - (b.dash || 0));

  return round3(clamp01(distance / 2));
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
    lexicalDispersion: lexicalDispersion(text)
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
      ? {
          comma: round3(((profile.punctuationMix?.comma || 0) * (1 - cadenceBlend)) + ((source.punctuationMix.comma || 0) * cadenceBlend)),
          strong: round3(((profile.punctuationMix?.strong || 0) * (1 - cadenceBlend)) + ((source.punctuationMix.strong || 0) * cadenceBlend)),
          terminal: round3(((profile.punctuationMix?.terminal || 0) * (1 - cadenceBlend)) + ((source.punctuationMix.terminal || 0) * cadenceBlend)),
          dash: round3(((profile.punctuationMix?.dash || 0) * (1 - cadenceBlend)) + ((source.punctuationMix.dash || 0) * cadenceBlend))
        }
      : profile.punctuationMix,
    contractionDensity: contraction,
    lineBreakDensity: lineBreak,
    repeatedBigramPressure: bigram,
    recurrencePressure: recurrence,
    lexicalDispersion: lexical,
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
  const recurrenceDistance = clamp01(
    Math.abs(profileA.recurrencePressure - profileB.recurrencePressure)
  );

  const similarity = clamp01(
    (lexicalOverlap * 0.22) +
    ((1 - sentenceDistance) * 0.20) +
    ((1 - punctDistance) * 0.16) +
    ((1 - contractionDistance) * 0.12) +
    ((1 - lexicalDistance) * 0.14) +
    ((1 - recurrenceDistance) * 0.16)
  );

  const traceability = clamp01(
    ((1 - sentenceDistance) * 0.34) +
    ((1 - punctDistance) * 0.24) +
    ((1 - contractionDistance) * 0.18) +
    ((1 - recurrenceDistance) * 0.24)
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

export function transformText(text, mod) {
  let result = normalizeText(text);

  if (mod.sent > 0) {
    result = result.replace(/([.!?])\s+/g, ', and ');
  } else if (mod.sent < 0) {
    result = result.replace(/, and /g, '. ').replace(/, but /g, '. ');
  }

  if (mod.cont > 0) {
    result = result.replace(/\bdo not\b/gi, "don't").replace(/\bcannot\b/gi, "can't");
  } else if (mod.cont < 0) {
    result = result.replace(/\bdon't\b/gi, 'do not').replace(/\bcan't\b/gi, 'cannot');
  }

  if (mod.punc > 0) {
    result = result.replace(/\. /g, '; ');
    if (!/[!?-]$/.test(result)) {
      result += ' -';
    }
  } else if (mod.punc < 0) {
    result = result.replace(/[;:-]/g, '.').replace(/,+/g, '.');
  }

  return result;
}
