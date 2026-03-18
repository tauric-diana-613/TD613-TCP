function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function round3(value) {
  return Number(value.toFixed(3));
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

export function avgSentenceLength(text) {
  const sentences = sentenceSplit(text);
  if (!sentences.length) {
    return 0;
  }

  const words = sentences.reduce((count, sentence) => count + tokenize(sentence).length, 0);
  return words / sentences.length;
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

export function compareTexts(a, b) {
  const wordsA = tokenize(a);
  const wordsB = tokenize(b);
  const sentenceA = avgSentenceLength(a);
  const sentenceB = avgSentenceLength(b);
  const punctA = punctuationDensity(a);
  const punctB = punctuationDensity(b);
  const contractionA = contractionDensity(a);
  const contractionB = contractionDensity(b);
  const lexicalA = lexicalDispersion(a);
  const lexicalB = lexicalDispersion(b);
  const recurrenceA = recurrencePressure(a);
  const recurrenceB = recurrencePressure(b);

  const lexicalOverlap = jaccard(wordsA, wordsB);
  const sentenceDistance = boundedDistance(sentenceA, sentenceB, 12);
  const punctDistance = boundedDistance(punctA, punctB, 0.35);
  const contractionDistance = boundedDistance(contractionA, contractionB, 0.25);
  const lexicalDistance = boundedDistance(lexicalA, lexicalB, 0.4);
  const recurrenceDistance = clamp01(Math.abs(recurrenceA - recurrenceB));

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
    recurrencePressure: round3((recurrenceA + recurrenceB) / 2),
    sentenceDistance: round3(sentenceDistance),
    punctDistance: round3(punctDistance),
    contractionDistance: round3(contractionDistance),
    lexicalDistance: round3(lexicalDistance),
    recurrenceDistance: round3(recurrenceDistance),
    avgSentenceA: Number(sentenceA.toFixed(2)),
    avgSentenceB: Number(sentenceB.toFixed(2)),
    lexicalOverlap: round3(lexicalOverlap)
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
