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

function replaceLimited(text = '', pattern, replacer, limit = 1) {
  if (limit <= 0) {
    return text;
  }

  let count = 0;
  return text.replace(pattern, (...args) => {
    if (count >= limit) {
      return args[0];
    }

    count += 1;
    return typeof replacer === 'function' ? replacer(...args) : replacer;
  });
}

function matchCase(source = '', replacement = '') {
  if (!source) {
    return replacement;
  }

  if (source === source.toUpperCase()) {
    return replacement.toUpperCase();
  }

  if (source.charAt(0) === source.charAt(0).toUpperCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }

  return replacement;
}

function escapeRegex(value = '') {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeSentenceStarts(text = '') {
  return text
    .replace(/(^|[.!?]\s+|\n+)([a-z])/g, (match, prefix, letter) => `${prefix}${letter.toUpperCase()}`)
    .replace(/\bi\b/g, 'I');
}

function indexToLetters(index = 0) {
  let value = index;
  let output = '';

  do {
    output = String.fromCharCode(97 + (value % 26)) + output;
    value = Math.floor(value / 26) - 1;
  } while (value >= 0);

  return output;
}

const PROTECTED_LITERAL_PATTERNS = [
  /\b(?:https?:\/\/|www\.)[^\s<>"']+/gi,
  /\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/gi,
  /\B[@#][A-Za-z0-9_][A-Za-z0-9_.:-]*/g,
  /\b(?:\d{1,2}:\d{2}(?:\s?[ap]m)?|\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})\b/gi,
  /"(?:[^"\\\n]|\\.){1,160}"/g,
  /\b(?:[A-Z]{2,}(?:[-_][A-Z0-9]+)*|[A-Za-z]+[A-Z][A-Za-z0-9_-]+)\b/g,
  /\b(?=\S*\d)[A-Za-z0-9:/._-]+\b/g
];

function protectTransferLiterals(text = '') {
  const literals = [];
  let output = text;

  const registerLiteral = (match) => {
    const placeholder = `zzprotlit${indexToLetters(literals.length)}zz`;
    literals.push({
      placeholder,
      value: match
    });
    return placeholder;
  };

  for (const pattern of PROTECTED_LITERAL_PATTERNS) {
    output = output.replace(pattern, registerLiteral);
  }

  return {
    text: output,
    literals
  };
}

function restoreProtectedLiterals(text = '', literals = []) {
  let output = text;
  for (const literal of literals) {
    output = output.replace(new RegExp(escapeRegex(literal.placeholder), 'g'), literal.value);
  }
  return output;
}

function protectedLiteralIntegrity(text = '', literals = []) {
  return literals.every((literal) => {
    const matches = text.match(new RegExp(escapeRegex(literal.placeholder), 'g')) || [];
    return matches.length === 1;
  });
}

function unresolvedProtectedLiteralCount(text = '') {
  return (text.match(/zzprotlit[a-z]+zz/gi) || []).length;
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
    Math.max(0, Math.round((delta / 3) * (0.8 + (strength * 0.45))))
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
  const desiredSplits = Math.max(0, Math.round((delta / 3) * (0.8 + (strength * 0.45))));

  if (desiredSplits <= 0) {
    return text;
  }

  let result = normalizeText(text);
  const patterns = [
    /;\s+/g,
    /\s-\s+/g,
    /,\s+(and|but|so|because|though|while|if|when|which|that)\s+/gi,
    /\s+(because|though|while|when|if)\s+/gi,
    /\s+(and|but|so)\s+(i|we|you|they|he|she)\b/gi,
    /\s+(and|but|so)\s+/gi,
    /:\s+/g,
    /,\s+/g
  ];
  let splitsApplied = 0;

  for (const pattern of patterns) {
    result = result.replace(pattern, (...args) => {
      const match = args[0];
      const captures = args.slice(1, -2);
      const connector = typeof captures[0] === 'string' ? captures[0] : '';
      const subject = typeof captures[1] === 'string' ? captures[1] : '';
      if (splitsApplied >= desiredSplits) {
        return match;
      }

      splitsApplied += 1;
      if (subject) {
        return `. ${connector} ${subject} `;
      }

      return connector ? `. ${connector} ` : '. ';
    });

    if (splitsApplied >= desiredSplits) {
      break;
    }
  }

  return result;
}

function applyClauseTexture(text = '', currentProfile = {}, targetProfile = {}, strength = 0.76, mod = {}) {
  const targetCount = desiredSentenceCount(currentProfile, targetProfile);
  const currentCount = currentProfile.sentenceCount || 0;
  const wantsShorter =
    (targetProfile.avgSentenceLength || 0) < ((currentProfile.avgSentenceLength || 0) - 1.2) ||
    targetCount > currentCount;
  const wantsLonger =
    (targetProfile.avgSentenceLength || 0) > ((currentProfile.avgSentenceLength || 0) + 1.2) ||
    targetCount < currentCount;
  let result = text;

  if (wantsShorter) {
    let remaining = Math.max(1, Math.round(Math.max(0.9, strength) * 2));
    result = result.replace(/,\s+(and|but|so|because|since|though|yet|as|when|while|once)\s+/gi, (match, connector) => {
      if (remaining <= 0) {
        return match;
      }

      remaining -= 1;
      return `. ${connector} `;
    });

    result = result.replace(/\b,?\s+(which|that)\s+is\b/gi, (match, pronoun) => {
      if (remaining <= 0) {
        return match;
      }

      remaining -= 1;
      return `. ${pronoun} is`;
    });

    return result;
  }

  if (wantsLonger) {
    return mergeSentencePairs(result, targetProfile, Math.min(1, strength + 0.04), mod);
  }

  return result;
}

function applyPhraseTexture(text = '', currentProfile = {}, targetProfile = {}, strength = 0.76) {
  let result = text;
  const wantsShorter =
    (targetProfile.avgSentenceLength || 0) < ((currentProfile.avgSentenceLength || 0) - 2.4);
  const wantsMoreContractions =
    (targetProfile.contractionDensity || 0) > ((currentProfile.contractionDensity || 0) + 0.012);
  const targetWords = targetProfile.functionWordProfile || {};
  const currentWords = functionWordProfile(result);
  const wantsWhenShift =
    (targetWords.when || 0) > ((currentWords.when || 0) + 0.002) ||
    (targetWords.once || 0) > ((currentWords.once || 0) + 0.002);
  const wantsThenShift = (targetWords.then || 0) > ((currentWords.then || 0) + 0.002);
  const wantsThatShift = (targetWords.that || 0) > ((currentWords.that || 0) + 0.002);

  if (wantsShorter || wantsWhenShift) {
    result = replaceLimited(result, /\bbecause every time\b/gi, (match) => matchCase(match, 'when'), 1);

    if (wantsWhenShift) {
      result = replaceLimited(result, /\bevery time\b/gi, (match) => matchCase(match, 'when'), 1);
      result = replaceLimited(result, /\bby the time\b/gi, (match) => matchCase(match, 'when'), 1);
    }
  }

  if (wantsShorter || wantsThenShift) {
    result = replaceLimited(result, /\band then\b/gi, (match) => matchCase(match, 'then'), 1);
  }

  if (wantsMoreContractions || wantsShorter || wantsThatShift) {
    result = replaceLimited(result, /\bwhich is\b/gi, (match) => matchCase(match, "that's"), 1);
  }

  return result;
}

function applyStanceTexture(text = '', targetProfile = {}, strength = 0.76, connectorProfile = null) {
  const targetWords = connectorProfile?.functionWordProfile || targetProfile.functionWordProfile || {};
  const currentWords = functionWordProfile(text);
  let result = text;

  const replacements = [
    { from: 'maybe', to: 'perhaps', key: 'perhaps', threshold: 0.0025, limit: 1 },
    { from: 'just', to: 'simply', key: 'simply', threshold: 0.0025, limit: 1 },
    { from: 'really', to: 'actually', key: 'actually', threshold: 0.0025, limit: 1 },
    { from: 'when', to: 'once', key: 'once', threshold: 0.0025, limit: 1 },
    { from: 'because', to: 'as', key: 'as', threshold: 0.003, limit: 1 }
  ];

  for (const replacement of replacements) {
    if ((targetWords[replacement.key] || 0) <= ((currentWords[replacement.key] || 0) + replacement.threshold)) {
      continue;
    }

    const pattern = new RegExp(`\\b${escapeRegex(replacement.from)}\\b`, 'gi');
    result = replaceLimited(
      result,
      pattern,
      (match) => matchCase(match, replacement.to),
      Math.max(1, Math.round(replacement.limit * Math.max(0.9, strength)))
    );
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
      .replace(/\bI was not\b/gi, "I wasn't")
      .replace(/\bdo not\b/gi, "don't")
      .replace(/\bdoes not\b/gi, "doesn't")
      .replace(/\bdid not\b/gi, "didn't")
      .replace(/\bwill not\b/gi, "won't")
      .replace(/\bcannot\b/gi, "can't")
      .replace(/\bwas not\b/gi, "wasn't")
      .replace(/\bare not\b/gi, "aren't")
      .replace(/\bI am\b/g, "I'm")
      .replace(/\bI have\b/gi, "I've")
      .replace(/\bI will\b/gi, "I'll")
      .replace(/\bI would\b/gi, "I'd")
      .replace(/\bwe are\b/gi, "we're")
      .replace(/\bwe will\b/gi, "we'll")
      .replace(/\bthey are\b/gi, "they're")
      .replace(/\bthey will\b/gi, "they'll")
      .replace(/\byou are\b/gi, "you're")
      .replace(/\byou will\b/gi, "you'll")
      .replace(/\bit is\b/gi, "it's")
      .replace(/\bthat is\b/gi, "that's");
  }

  return text
    .replace(/\bI wasn't\b/gi, 'I was not')
    .replace(/\bdon't\b/gi, 'do not')
    .replace(/\bdoesn't\b/gi, 'does not')
    .replace(/\bdidn't\b/gi, 'did not')
    .replace(/\bwon't\b/gi, 'will not')
    .replace(/\bcan't\b/gi, 'cannot')
    .replace(/\bwasn't\b/gi, 'was not')
    .replace(/\baren't\b/gi, 'are not')
    .replace(/\bI'm\b/g, 'I am')
    .replace(/\bI've\b/gi, 'I have')
    .replace(/\bI'll\b/gi, 'I will')
    .replace(/\bI'd\b/gi, 'I would')
    .replace(/\bwe're\b/gi, 'we are')
    .replace(/\bwe'll\b/gi, 'we will')
    .replace(/\bthey're\b/gi, 'they are')
    .replace(/\bthey'll\b/gi, 'they will')
    .replace(/\byou're\b/gi, 'you are')
    .replace(/\byou'll\b/gi, 'you will')
    .replace(/\bit's\b/gi, 'it is')
    .replace(/\bthat's\b/gi, 'that is');
}

function applyFunctionWordTexture(text = '', targetProfile = {}, strength = 0.76, connectorProfile = null) {
  const target = connectorProfile?.functionWordProfile || targetProfile.functionWordProfile || {};
  const current = functionWordProfile(text);
  let result = text;
  const limit = Math.max(1, Math.round(Math.max(0.9, strength) * 3));

  if ((target.but || 0) > (current.but || 0) + 0.006) {
    result = replaceLimited(result, /\band\b/gi, (match) => matchCase(match, 'but'), limit);
  } else if ((target.and || 0) > (current.and || 0) + 0.008) {
    result = replaceLimited(result, /\bbut\b/gi, (match) => matchCase(match, 'and'), limit);
  }

  if ((target.this || 0) > (current.this || 0) + 0.004) {
    result = replaceLimited(result, /\bthat\b/gi, (match) => matchCase(match, 'this'), 1);
  } else if ((target.that || 0) > (current.that || 0) + 0.004) {
    result = replaceLimited(result, /\bthis\b/gi, (match) => matchCase(match, 'that'), 1);
  }

  result = applyConnectorSynonymPack(result, { functionWordProfile: target }, strength);

  return result;
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
  'my', 'your', 'our', 'their', 'not',
  'because', 'since', 'though', 'yet', 'so', 'then',
  'when', 'while', 'once', 'also', 'only', 'still', 'just', 'simply',
  'really', 'actually', 'maybe', 'perhaps'
];

const CONNECTOR_SYNONYM_PACKS = [
  { words: ['because', 'since', 'as'], threshold: 0.003 },
  { words: ['but', 'though', 'yet'], threshold: 0.003 },
  { words: ['so', 'then'], threshold: 0.003 },
  { words: ['when', 'while', 'once'], threshold: 0.003 },
  { words: ['this', 'that'], threshold: 0.004 },
  { words: ['just', 'simply'], threshold: 0.0025 },
  { words: ['really', 'actually'], threshold: 0.0025 },
  { words: ['maybe', 'perhaps'], threshold: 0.0025 }
];

function dominantProfileWord(profile = {}, words = []) {
  return [...words]
    .sort((a, b) => (profile[b] || 0) - (profile[a] || 0))[0] || words[0];
}

function applyConnectorSynonymPack(text = '', targetProfile = {}, strength = 0.76) {
  const target = targetProfile.functionWordProfile || {};
  let result = text;
  let current = functionWordProfile(result);

  for (const pack of CONNECTOR_SYNONYM_PACKS) {
    const threshold = pack.threshold || 0.003;
    const targetWord = dominantProfileWord(target, pack.words);
    const targetValue = target[targetWord] || 0;

    if (targetValue <= threshold) {
      continue;
    }

    const donorWord = [...pack.words]
      .filter((word) => word !== targetWord)
      .sort((a, b) => (current[b] || 0) - (current[a] || 0))[0];
    const donorValue = donorWord ? (current[donorWord] || 0) : 0;
    const currentTargetValue = current[targetWord] || 0;

    if (!donorWord || donorValue <= 0 || currentTargetValue >= targetValue - (threshold / 2)) {
      continue;
    }

    const delta = targetValue - currentTargetValue;
    const limit = Math.max(1, Math.round(Math.max(1, strength * 2) * (delta > 0.02 ? 2 : 1)));
    const pattern = new RegExp(`\\b${escapeRegex(donorWord)}\\b`, 'gi');
    result = replaceLimited(result, pattern, (match) => matchCase(match, targetWord), limit);
    current = functionWordProfile(result);
  }

  return result;
}

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

function deriveRelativeCadenceMod(baseProfile = {}, targetProfile = {}, fallbackMod = {}) {
  const sentDelta = (targetProfile.avgSentenceLength || 0) - (baseProfile.avgSentenceLength || 0);
  const contractionDelta = (targetProfile.contractionDensity || 0) - (baseProfile.contractionDensity || 0);
  const punctuationDelta = (targetProfile.punctuationDensity || 0) - (baseProfile.punctuationDensity || 0);
  const lineBreakDelta = (targetProfile.lineBreakDensity || 0) - (baseProfile.lineBreakDensity || 0);

  const sent = Math.abs(sentDelta) >= 0.75
    ? clamp(Math.round(sentDelta / 2.4), -3, 3)
    : clamp(Math.round(Number(fallbackMod.sent || 0)), -3, 3);
  const cont = Math.abs(contractionDelta) >= 0.008
    ? clamp(Math.sign(contractionDelta) * Math.max(1, Math.round(Math.abs(contractionDelta) / 0.03)), -3, 3)
    : clamp(Math.round(Number(fallbackMod.cont || 0)), -3, 3);
  const puncSignal = Math.abs(punctuationDelta) >= 0.012
    ? punctuationDelta
    : lineBreakDelta;
  const punc = Math.abs(puncSignal) >= 0.01
    ? clamp(Math.sign(puncSignal) * Math.max(1, Math.round(Math.abs(puncSignal) / 0.03)), -3, 3)
    : clamp(Math.round(Number(fallbackMod.punc || 0)), -3, 3);

  return { sent, cont, punc };
}

function buildTransferTargetProfile(baseProfile = {}, shell = {}, fallbackMod = {}, strength = 0.76) {
  if (!shell?.profile) {
    return applyCadenceMod(baseProfile, fallbackMod);
  }

  const donor = shell.profile;
  const blend = clamp(0.44 + (strength * 0.42), 0, 0.9);
  const recurrenceBlend = clamp(0.38 + (strength * 0.34), 0, 0.86);

  return {
    ...applyCadenceShell(baseProfile, {
      mode: 'borrowed',
      profile: donor,
      strength
    }),
    avgSentenceLength: round2(
      (baseProfile.avgSentenceLength || 0) +
      (((donor.avgSentenceLength || baseProfile.avgSentenceLength || 0) - (baseProfile.avgSentenceLength || 0)) * blend)
    ),
    sentenceLengthSpread: round2(
      (baseProfile.sentenceLengthSpread || 0) +
      (((donor.sentenceLengthSpread || 0) - (baseProfile.sentenceLengthSpread || 0)) * blend)
    ),
    punctuationDensity: round3(clamp01(
      (baseProfile.punctuationDensity || 0) +
      (((donor.punctuationDensity || 0) - (baseProfile.punctuationDensity || 0)) * blend)
    )),
    punctuationMix: donor.punctuationMix
      ? blendDistribution(baseProfile.punctuationMix || {}, donor.punctuationMix, blend, ['comma', 'strong', 'terminal', 'dash'])
      : baseProfile.punctuationMix,
    contractionDensity: round3(clamp01(
      (baseProfile.contractionDensity || 0) +
      (((donor.contractionDensity || 0) - (baseProfile.contractionDensity || 0)) * blend)
    )),
    lineBreakDensity: round3(clamp01(
      (baseProfile.lineBreakDensity || 0) +
      (((donor.lineBreakDensity || 0) - (baseProfile.lineBreakDensity || 0)) * recurrenceBlend)
    )),
    repeatedBigramPressure: round3(clamp01(
      (baseProfile.repeatedBigramPressure || 0) +
      (((donor.repeatedBigramPressure || 0) - (baseProfile.repeatedBigramPressure || 0)) * recurrenceBlend)
    )),
    recurrencePressure: round3(clamp01(
      (baseProfile.recurrencePressure || 0) +
      (((donor.recurrencePressure || 0) - (baseProfile.recurrencePressure || 0)) * recurrenceBlend)
    )),
    functionWordProfile: donor.functionWordProfile
      ? blendDistribution(baseProfile.functionWordProfile || {}, donor.functionWordProfile, blend, FUNCTION_WORDS)
      : baseProfile.functionWordProfile
  };
}

function desiredSentenceCount(profile = {}, targetProfile = {}) {
  const wordCount = Math.max(profile.wordCount || 0, 1);
  const targetAvg = Math.max(1, targetProfile.avgSentenceLength || profile.avgSentenceLength || 1);
  return Math.max(1, Math.round(wordCount / targetAvg));
}

function profileDeltaToTarget(profile = {}, targetProfile = {}) {
  return {
    avgSentence: Math.abs((profile.avgSentenceLength || 0) - (targetProfile.avgSentenceLength || 0)),
    spread: Math.abs((profile.sentenceLengthSpread || 0) - (targetProfile.sentenceLengthSpread || 0)),
    sentenceCount: Math.abs((profile.sentenceCount || 0) - desiredSentenceCount(profile, targetProfile)),
    contraction: Math.abs((profile.contractionDensity || 0) - (targetProfile.contractionDensity || 0)),
    lineBreak: Math.abs((profile.lineBreakDensity || 0) - (targetProfile.lineBreakDensity || 0)),
    punctuation: Math.abs((profile.punctuationDensity || 0) - (targetProfile.punctuationDensity || 0)),
    punctuationShape: punctuationMixDistance(profile.punctuationMix || {}, targetProfile.punctuationMix || {}),
    functionWord: functionWordDistance(profile.functionWordProfile || {}, targetProfile.functionWordProfile || {})
  };
}

function profileDeltaScore(gap = {}) {
  return (
    (clamp01((gap.avgSentence || 0) / 10) * 0.22) +
    (clamp01((gap.sentenceCount || 0) / 4) * 0.16) +
    (clamp01((gap.spread || 0) / 8) * 0.12) +
    (clamp01((gap.contraction || 0) / 0.16) * 0.12) +
    (clamp01((gap.lineBreak || 0) / 0.4) * 0.12) +
    (clamp01(gap.functionWord || 0) * 0.14) +
    (clamp01((gap.punctuation || 0) / 0.16) * 0.06) +
    (clamp01(gap.punctuationShape || 0) * 0.06)
  );
}

function isMaterialCadenceGap(gap = {}) {
  return (gap.avgSentence || 0) >= 1 ||
    (gap.sentenceCount || 0) >= 1 ||
    (gap.contraction || 0) >= 0.014 ||
    (gap.lineBreak || 0) >= 0.05 ||
    (gap.functionWord || 0) >= 0.04 ||
    (gap.punctuationShape || 0) >= 0.05;
}

function collectChangedDimensions(sourceProfile = {}, outputProfile = {}) {
  const shifted = [];
  const compare = compareTexts('', '', {
    profileA: sourceProfile,
    profileB: outputProfile
  });

  if (Math.abs((outputProfile.avgSentenceLength || 0) - (sourceProfile.avgSentenceLength || 0)) >= 1) {
    shifted.push('sentence-mean');
  }
  if (Math.abs((outputProfile.sentenceCount || 0) - (sourceProfile.sentenceCount || 0)) >= 1) {
    shifted.push('sentence-count');
  }
  if (Math.abs((outputProfile.sentenceLengthSpread || 0) - (sourceProfile.sentenceLengthSpread || 0)) >= 1) {
    shifted.push('sentence-spread');
  }
  if (Math.abs((outputProfile.contractionDensity || 0) - (sourceProfile.contractionDensity || 0)) >= 0.012) {
    shifted.push('contraction-posture');
  }
  if (Math.abs((outputProfile.lineBreakDensity || 0) - (sourceProfile.lineBreakDensity || 0)) >= 0.045) {
    shifted.push('line-break-texture');
  }
  if ((compare.functionWordDistance || 0) >= 0.04) {
    shifted.push('connector-stance');
  }
  if (
    Math.abs((outputProfile.punctuationDensity || 0) - (sourceProfile.punctuationDensity || 0)) >= 0.018 ||
    (compare.punctShapeDistance || 0) >= 0.05
  ) {
    shifted.push('punctuation-shape');
  }

  return shifted;
}

function hasDuplicateSentenceChunks(text = '') {
  const seen = new Set();

  for (const chunk of sentenceChunks(text)) {
    const normalized = chunk
      .toLowerCase()
      .replace(/[^a-z0-9'\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (tokenize(normalized).length < 4) {
      continue;
    }

    if (seen.has(normalized)) {
      return true;
    }

    seen.add(normalized);
  }

  return false;
}

function hasRepeatedConnectorSequence(text = '') {
  return /(^|[;:.!?]\s+|\s)(and|but|though|yet|since|because|so|then|when|while|as)\s+\2\b/i.test(text);
}

function evaluateTransferQuality({
  sourceText = '',
  outputText = '',
  workingText = '',
  sourceProfile = {},
  targetGap = {},
  outputProfile = {},
  changedDimensions = [],
  protectedState = { literals: [] }
}) {
  const notes = [];
  const nonPunctuationDimensions = changedDimensions.filter((dimension) => dimension !== 'punctuation-shape');

  if (!protectedLiteralIntegrity(workingText, protectedState.literals || [])) {
    notes.push('Protected literals did not survive the rewrite intact.');
  }

  if (unresolvedProtectedLiteralCount(outputText) > 0) {
    notes.push('Protected placeholders leaked into the output.');
  }

  if (hasDuplicateSentenceChunks(outputText)) {
    notes.push('Transfer introduced a duplicated sentence chunk.');
  }

  if (hasRepeatedConnectorSequence(outputText)) {
    notes.push('Transfer introduced a repeated connector sequence.');
  }

  if (outputText.length > Math.ceil(sourceText.length * 1.28)) {
    notes.push('Transfer expanded past the bounded output ratio.');
  }

  if (!outputText.trim()) {
    notes.push('Transfer collapsed into an unreadable empty result.');
  }

  if (isMaterialCadenceGap(targetGap) && nonPunctuationDimensions.length < 2) {
    notes.push('Transfer stayed too close to punctuation-only drift.');
  }

  if (outputText === sourceText && isMaterialCadenceGap(targetGap)) {
    notes.push('Material target gap remained unresolved.');
  }

  return {
    qualityGatePassed: notes.length === 0,
    notes,
    nonPunctuationDimensions,
    changedDimensions
  };
}

function structuralShiftDimensions(baseProfile = {}, currentProfile = {}) {
  let shifts = 0;

  if (Math.abs((currentProfile.avgSentenceLength || 0) - (baseProfile.avgSentenceLength || 0)) >= 1.15) {
    shifts += 1;
  }

  if (Math.abs((currentProfile.sentenceCount || 0) - (baseProfile.sentenceCount || 0)) >= 1) {
    shifts += 1;
  }

  if (Math.abs((currentProfile.contractionDensity || 0) - (baseProfile.contractionDensity || 0)) >= 0.012) {
    shifts += 1;
  }

  if (Math.abs((currentProfile.lineBreakDensity || 0) - (baseProfile.lineBreakDensity || 0)) >= 0.045) {
    shifts += 1;
  }

  if (functionWordDistance(baseProfile.functionWordProfile || {}, currentProfile.functionWordProfile || {}) >= 0.04) {
    shifts += 1;
  }

  return shifts;
}

function shouldApplySentenceTexture(currentProfile = {}, targetProfile = {}, gap = {}, mod = {}) {
  if ((mod.sent || 0) !== 0) {
    return true;
  }

  return (gap.avgSentence || 0) >= 0.8 ||
    (gap.sentenceCount || 0) >= 1 ||
    (gap.spread || 0) >= 1;
}

function applySentenceTexture(text = '', currentProfile = {}, targetProfile = {}, strength = 0.76, mod = {}) {
  const targetCount = desiredSentenceCount(currentProfile, targetProfile);
  const currentCount = currentProfile.sentenceCount || 0;
  const targetAvg = targetProfile.avgSentenceLength || currentProfile.avgSentenceLength || 0;
  const currentAvg = currentProfile.avgSentenceLength || 0;
  const wantsLonger = targetAvg > currentAvg + 0.6 || targetCount < currentCount;
  const wantsShorter = targetAvg < currentAvg - 0.6 || targetCount > currentCount;

  if (wantsLonger) {
    return mergeSentencePairs(text, targetProfile, Math.min(1, strength + 0.08), mod);
  }

  if (wantsShorter) {
    return splitLongSentences(text, targetProfile, Math.min(1, strength + 0.08));
  }

  return text;
}

function finalizeTransformedText(text = '') {
  return normalizeSentenceStarts(text)
    .replace(/([;:.!?]\s+)(and|but|though|yet|since|because|so|then|when|while)\s+\2\b/gi, '$1$2')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ ]{2,}/g, ' ')
    .trim();
}

function forceStructuralShift(text = '', baseProfile = {}, targetProfile = {}, strength = 0.76, mod = {}, connectorProfile = null) {
  let result = text;
  const maxLength = Math.ceil(normalizeText(text).length * 1.28);
  const currentProfile = extractCadenceProfile(result);
  const targetCount = desiredSentenceCount(currentProfile, targetProfile);
  const wantsLonger = (targetProfile.avgSentenceLength || currentProfile.avgSentenceLength || 0) > (currentProfile.avgSentenceLength || 0) + 1;
  const wantsShorter = (targetProfile.avgSentenceLength || currentProfile.avgSentenceLength || 0) < (currentProfile.avgSentenceLength || 0) - 1;

  if ((wantsLonger || targetCount < (currentProfile.sentenceCount || 0)) && sentenceChunks(result).length > 1) {
    result = mergeSentencePairs(result, targetProfile, Math.min(1, strength + 0.2), {
      ...mod,
      sent: Math.max(1, Number(mod.sent || 0))
    });
  } else if (wantsShorter || targetCount > (currentProfile.sentenceCount || 0)) {
    result = splitLongSentences(result, targetProfile, Math.min(1, strength + 0.22));
  }

  result = applyPhraseTexture(result, baseProfile, targetProfile, Math.min(1, strength + 0.16));
  result = applyContractionTexture(result, targetProfile, {
    ...mod,
    cont: Number(mod.cont || 0) || Math.sign((targetProfile.contractionDensity || 0) - (currentProfile.contractionDensity || 0))
  });
  result = applyFunctionWordTexture(result, targetProfile, Math.min(1, strength + 0.18), connectorProfile);
  result = applyLineBreakTexture(result, targetProfile, Math.min(1, strength + 0.14));

  if (Math.abs((targetProfile.punctuationDensity || 0) - (baseProfile.punctuationDensity || 0)) > 0.02) {
    result = applyPunctuationTexture(result, targetProfile, mod);
  }

  if (result.length > maxLength) {
    return finalizeTransformedText(text);
  }

  return finalizeTransformedText(result);
}

export function buildCadenceTransfer(text = '', shell = {}, options = {}) {
  const sourceText = normalizeText(text);
  const sourceProfile = extractCadenceProfile(sourceText);
  const mod = normalizeShellMod(shell);
  const strength = clamp(Number(options?.strength ?? shell?.strength ?? (shell?.profile ? 0.82 : 0.68)), 0, 1);
  const debug = Boolean(options?.debug);

  if (!sourceText || ((!mod.sent && !mod.cont && !mod.punc) && !shell?.profile) || shell?.mode === 'native') {
    return {
      text: sourceText,
      sourceProfile,
      targetProfile: sourceProfile,
      outputProfile: sourceProfile,
      changedDimensions: [],
      protectedLiteralCount: 0,
      passesApplied: [],
      qualityGatePassed: true,
      notes: sourceText ? ['Native shell: no transfer applied.'] : ['No source text loaded.'],
      effectiveMod: mod
    };
  }

  const targetProfile = buildTransferTargetProfile(sourceProfile, shell, mod, strength);
  const effectiveMod = deriveRelativeCadenceMod(sourceProfile, targetProfile, mod);
  const targetGap = profileDeltaToTarget(sourceProfile, targetProfile);
  const protectedState = protectTransferLiterals(sourceText);
  const connectorProfile = shell?.profile || targetProfile;
  const maxLength = Math.ceil(sourceText.length * 1.28);
  const debugPasses = debug ? [] : null;
  let workingText = protectedState.text;
  let passesApplied = [];

  const previewText = (candidate) => finalizeTransformedText(
    restoreProtectedLiterals(candidate, protectedState.literals)
  );
  const previewProfile = (candidate) => extractCadenceProfile(previewText(candidate));
  const runPass = (name, fn) => {
    const nextValue = fn(workingText);
    if (nextValue !== workingText) {
      workingText = nextValue;
      passesApplied.push(name);
      if (debugPasses) {
        debugPasses.push({
          name,
          text: previewText(workingText)
        });
      }
    }
  };

  let currentProfile = sourceProfile;
  if (shouldApplySentenceTexture(currentProfile, targetProfile, targetGap, effectiveMod)) {
    runPass('sentence-structure', () =>
      applySentenceTexture(workingText, currentProfile, targetProfile, Math.min(1, strength + 0.08), effectiveMod)
    );
    currentProfile = previewProfile(workingText);
  }

  runPass('clause-join-split', () =>
    applyClauseTexture(workingText, currentProfile, targetProfile, Math.min(1, strength + 0.08), effectiveMod)
  );
  currentProfile = previewProfile(workingText);

  runPass('connector-stance-lexicon', () => {
    let nextValue = applyPhraseTexture(workingText, currentProfile, targetProfile, Math.min(1, strength + 0.12));
    nextValue = applyStanceTexture(nextValue, targetProfile, Math.min(1, strength + 0.12), connectorProfile);
    nextValue = applyFunctionWordTexture(nextValue, targetProfile, Math.min(1, strength + 0.16), connectorProfile);
    return nextValue;
  });
  currentProfile = previewProfile(workingText);

  let gap = profileDeltaToTarget(currentProfile, targetProfile);
  if (gap.contraction >= 0.012 || Math.abs(Number(effectiveMod.cont || 0)) > 0) {
    runPass('contraction-auxiliary', () => applyContractionTexture(workingText, targetProfile, effectiveMod));
    currentProfile = previewProfile(workingText);
    gap = profileDeltaToTarget(currentProfile, targetProfile);
  }

  if (gap.lineBreak >= 0.045) {
    runPass('line-break', () => applyLineBreakTexture(workingText, targetProfile, Math.min(1, strength + 0.08)));
    currentProfile = previewProfile(workingText);
    gap = profileDeltaToTarget(currentProfile, targetProfile);
  }

  if (
    gap.punctuation >= 0.018 ||
    gap.punctuationShape >= 0.05 ||
    Math.abs(Number(effectiveMod.punc || 0)) > 0
  ) {
    runPass('punctuation-finish', () => {
      let nextValue = applyPunctuationTexture(workingText, targetProfile, effectiveMod);
      if ((effectiveMod.punc || 0) < 0) {
        nextValue = nextValue.replace(/[;:]+/g, '.').replace(/,+/g, ',');
      }
      return nextValue;
    });
  }

  const finalizedWorking = finalizeTransformedText(workingText);
  if (finalizedWorking !== workingText) {
    passesApplied.push('cleanup-restore');
    workingText = finalizedWorking;
  }

  let outputText = previewText(workingText);
  let outputProfile = extractCadenceProfile(outputText);
  let changedDimensions = collectChangedDimensions(sourceProfile, outputProfile);
  let quality = evaluateTransferQuality({
    sourceText,
    outputText,
    workingText,
    sourceProfile,
    targetGap,
    outputProfile,
    changedDimensions,
    protectedState
  });
  const debugState = debug
    ? {
        primary: {
          text: outputText,
          changedDimensions: [...changedDimensions],
          qualityGatePassed: quality.qualityGatePassed,
          notes: [...quality.notes],
          passes: debugPasses ? [...debugPasses] : []
        },
        fallback: null
      }
    : null;

  if ((!quality.qualityGatePassed || (isMaterialCadenceGap(targetGap) && quality.nonPunctuationDimensions.length < 2))) {
    const forcedWorking = forceStructuralShift(
      workingText,
      sourceProfile,
      targetProfile,
      Math.min(1, strength + 0.18),
      effectiveMod,
      connectorProfile
    );

    if (forcedWorking !== workingText && forcedWorking.length <= maxLength) {
      workingText = forcedWorking;
      passesApplied.push('structural-fallback');
      outputText = previewText(workingText);
      outputProfile = extractCadenceProfile(outputText);
      changedDimensions = collectChangedDimensions(sourceProfile, outputProfile);
      quality = evaluateTransferQuality({
        sourceText,
        outputText,
        workingText,
        sourceProfile,
        targetGap,
        outputProfile,
        changedDimensions,
        protectedState
      });

      if (debugState) {
        debugState.fallback = {
          text: outputText,
          changedDimensions: [...changedDimensions],
          qualityGatePassed: quality.qualityGatePassed,
          notes: [...quality.notes]
        };
      }
    }
  }

  let finalText = outputText;
  let finalProfile = outputProfile;
  let qualityGatePassed = quality.qualityGatePassed;
  const notes = [...quality.notes];

  if (!quality.qualityGatePassed) {
    if (isMaterialCadenceGap(targetGap)) {
      finalText = sourceText;
      finalProfile = sourceProfile;
      changedDimensions = [];
      notes.push('Transfer fell back to the source text to preserve meaning and readability.');
    } else {
      notes.push('Source and target cadence were already close, so the transfer stayed subtle.');
    }
  } else if (!changedDimensions.length) {
    notes.push('Source and target cadence were already close, so the transfer stayed subtle.');
  } else {
    notes.push(`Shifted ${changedDimensions.join(', ')}.`);
  }

  if (protectedState.literals.length) {
    notes.push(`${protectedState.literals.length} protected literal${protectedState.literals.length === 1 ? '' : 's'} held fixed.`);
  }

  const result = {
    text: finalText,
    sourceProfile,
    targetProfile,
    outputProfile: finalProfile,
    changedDimensions,
    protectedLiteralCount: protectedState.literals.length,
    passesApplied: [...new Set(passesApplied)],
    qualityGatePassed,
    notes: [...new Set(notes)],
    effectiveMod
  };

  if (debugState) {
    result.debug = debugState;
  }

  return result;
}

export function applyCadenceToText(text = '', shell = {}) {
  return buildCadenceTransfer(text, shell).text;
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
  if (options?.profile) {
    return buildCadenceTransfer(text, {
      mode: 'borrowed',
      profile: options.profile,
      strength: options.strength ?? 0.76,
      mod
    }).text;
  }

  let result = normalizeText(text);
  const maxLength = Math.ceil(result.length * 1.28);
  const strength = clamp(Number(options?.strength ?? 0.76), 0, 1);
  const baseProfile = extractCadenceProfile(result);
  const connectorProfile = null;
  const transformStrength = strength;
  const targetProfile = applyCadenceMod(baseProfile, mod);
  const effectiveMod = mod;

  const targetGap = profileDeltaToTarget(baseProfile, targetProfile);
  const targetNeedsStructuralShift =
    targetGap.avgSentence >= 1 ||
    targetGap.sentenceCount >= 1 ||
    targetGap.contraction >= 0.014 ||
    targetGap.lineBreak >= 0.05 ||
    targetGap.functionWord >= 0.04;

  const maxPasses = 3;
  let bestResult = result;
  let bestScore = profileDeltaScore(targetGap);

  for (let pass = 0; pass < maxPasses; pass += 1) {
    const currentProfile = extractCadenceProfile(result);
    const gap = profileDeltaToTarget(currentProfile, targetProfile);

    if (profileDeltaScore(gap) <= 0.08) {
      break;
    }

    let nextResult = result;

    if (shouldApplySentenceTexture(currentProfile, targetProfile, gap, effectiveMod)) {
      nextResult = applySentenceTexture(nextResult, currentProfile, targetProfile, transformStrength, effectiveMod);
    }

    nextResult = applyPhraseTexture(nextResult, baseProfile, targetProfile, Math.min(1, transformStrength + 0.08));

    const afterSentence = extractCadenceProfile(nextResult);
    const afterSentenceGap = profileDeltaToTarget(afterSentence, targetProfile);
    if (afterSentenceGap.contraction >= 0.012 || Math.abs(Number(effectiveMod.cont || 0)) > 0) {
      nextResult = applyContractionTexture(nextResult, targetProfile, effectiveMod);
    }

    const afterContraction = extractCadenceProfile(nextResult);
    const afterContractionGap = profileDeltaToTarget(afterContraction, targetProfile);
    if (afterContractionGap.lineBreak >= 0.045) {
      nextResult = applyLineBreakTexture(nextResult, targetProfile, Math.min(1, transformStrength + 0.08));
    }

    const afterLineBreak = extractCadenceProfile(nextResult);
    const afterLineBreakGap = profileDeltaToTarget(afterLineBreak, targetProfile);
    if (afterLineBreakGap.functionWord >= 0.035) {
      nextResult = applyFunctionWordTexture(nextResult, targetProfile, Math.min(1, transformStrength + 0.1), connectorProfile);
    }

    const afterFunction = extractCadenceProfile(nextResult);
    const afterFunctionGap = profileDeltaToTarget(afterFunction, targetProfile);
    if (
      afterFunctionGap.punctuation >= 0.018 ||
      afterFunctionGap.punctuationShape >= 0.05 ||
      Math.abs(Number(effectiveMod.punc || 0)) > 0
    ) {
      nextResult = applyPunctuationTexture(nextResult, targetProfile, effectiveMod);
    }

    if ((effectiveMod.punc || 0) < 0) {
      nextResult = nextResult.replace(/[;:]+/g, '.').replace(/,+/g, ',');
    }

    nextResult = finalizeTransformedText(nextResult);
    if (nextResult.length > maxLength) {
      break;
    }
    if (nextResult === result) {
      break;
    }

    result = nextResult;
    const currentScore = profileDeltaScore(profileDeltaToTarget(extractCadenceProfile(result), targetProfile));
    if (currentScore < bestScore) {
      bestScore = currentScore;
      bestResult = result;
    }
  }

  result = bestResult;
  const finalProfile = extractCadenceProfile(result);
  if (targetNeedsStructuralShift && structuralShiftDimensions(baseProfile, finalProfile) < 2) {
    result = forceStructuralShift(result, baseProfile, targetProfile, transformStrength, effectiveMod, connectorProfile);
  }

  return finalizeTransformedText(result);
}
