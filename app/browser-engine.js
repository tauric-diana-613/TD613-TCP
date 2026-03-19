(function () {
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function clamp01(value) {
    return clamp(value, 0, 1);
  }

  function round3(value) {
    return Number(value.toFixed(3));
  }

  function round2(value) {
    return Number(value.toFixed(2));
  }

  function harmonicMean(values = []) {
    const finite = values
      .map((value) => clamp01(Number(value) || 0))
      .filter((value) => value > 0);

    if (!finite.length) {
      return 0;
    }

    return finite.length / finite.reduce((sum, value) => sum + (1 / Math.max(value, 1e-6)), 0);
  }

  function arithmeticMean(values = []) {
    if (!values.length) {
      return 0;
    }

    return values.reduce((sum, value) => sum + clamp01(Number(value) || 0), 0) / values.length;
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
      result = result.replace(pattern, (match, connector, subject) => {
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
        .replace(/\bwill not\b/gi, "won't")
        .replace(/\bcannot\b/gi, "can't")
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
      .replace(/\bdon't\b/gi, 'do not')
      .replace(/\bdoesn't\b/gi, 'does not')
      .replace(/\bdidn't\b/gi, 'did not')
      .replace(/\bwon't\b/gi, 'will not')
      .replace(/\bcan't\b/gi, 'cannot')
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

  function tokenize(text) {
    return normalizeText(text).toLowerCase().match(/[a-z0-9']+/g) || [];
  }

  function sentenceSplit(text) {
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

  function avgSentenceLength(text) {
    const lengths = sentenceLengths(text);
    if (!lengths.length) {
      return 0;
    }

    const words = lengths.reduce((sum, count) => sum + count, 0);
    return words / lengths.length;
  }

  function sentenceLengthSpread(text) {
    const lengths = sentenceLengths(text);
    if (lengths.length <= 1) {
      return 0;
    }

    const mean = lengths.reduce((sum, count) => sum + count, 0) / lengths.length;
    const variance = lengths.reduce((sum, count) => sum + ((count - mean) ** 2), 0) / lengths.length;
    return round2(Math.sqrt(variance));
  }

  function punctuationDensity(text) {
    const words = tokenize(text).length;
    const marks = (normalizeText(text).match(/[,:;.!?-]/g) || []).length;
    return round3(marks / Math.max(words, 1));
  }

  function contractionDensity(text) {
    const words = tokenize(text);
    const contractions = words.filter((word) => word.includes("'")).length;
    return round3(contractions / Math.max(words.length, 1));
  }

  function lineBreakDensity(text) {
    const sentences = sentenceSplit(text).length;
    const breaks = (normalizeText(text).match(/\n/g) || []).length;
    return round3(breaks / Math.max(sentences, 1));
  }

  function punctuationMix(text) {
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

  function repeatedBigramPressure(text) {
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

  function recurrencePressure(text) {
    const punct = clamp01(punctuationDensity(text) / 0.35);
    const line = clamp01(lineBreakDensity(text) / 0.75);
    const bigram = clamp01(repeatedBigramPressure(text) / 0.18);
    return round3((punct + line + bigram) / 3);
  }

  function lexicalDispersion(text) {
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

  function jaccard(a, b) {
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
    'when', 'while', 'also', 'only', 'still', 'just', 'really', 'maybe'
  ];

  const CONNECTOR_SYNONYM_PACKS = [
    { words: ['because', 'since'], threshold: 0.003 },
    { words: ['but', 'though', 'yet'], threshold: 0.003 },
    { words: ['so', 'then'], threshold: 0.003 },
    { words: ['when', 'while'], threshold: 0.003 },
    { words: ['this', 'that'], threshold: 0.004 }
  ];

  function dominantProfileWord(profile = {}, words = []) {
    return words
      .slice()
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

      const donorWord = pack.words
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

  function functionWordProfile(text = '') {
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

  function wordLengthProfile(text = '') {
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

  function charTrigramProfile(text = '') {
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

  function extractCadenceProfile(text = '') {
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

  function applyCadenceMod(profile, mod = {}) {
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

  function applyCadenceShell(profile, shell = {}) {
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

  function cadenceModFromProfile(profile) {
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

  function forceStructuralShift(text = '', baseProfile = {}, targetProfile = {}, strength = 0.76, mod = {}, connectorProfile = null) {
    let result = text;
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

    result = applyContractionTexture(result, targetProfile, {
      ...mod,
      cont: Number(mod.cont || 0) || Math.sign((targetProfile.contractionDensity || 0) - (currentProfile.contractionDensity || 0))
    });
    result = applyFunctionWordTexture(result, targetProfile, Math.min(1, strength + 0.18), connectorProfile);
    result = applyLineBreakTexture(result, targetProfile, Math.min(1, strength + 0.14));

    if (Math.abs((targetProfile.punctuationDensity || 0) - (baseProfile.punctuationDensity || 0)) > 0.02) {
      result = applyPunctuationTexture(result, targetProfile, mod);
    }

    return finalizeTransformedText(result);
  }

  function applyCadenceToText(text = '', shell = {}) {
    const mod = normalizeShellMod(shell);
    const strength = clamp(Number((shell && shell.strength) ?? ((shell && shell.profile) ? 0.82 : 0.68)), 0, 1);

    if (!text || ((!mod.sent && !mod.cont && !mod.punc) && !(shell && shell.profile))) {
      return text;
    }

    return transformText(text, mod, {
      profile: (shell && shell.profile) || null,
      strength
    });
  }

  function compareTexts(a, b, options = {}) {
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
      avgSentenceA: profileA.avgSentenceLength,
      avgSentenceB: profileB.avgSentenceLength,
      spreadDistance: round3(spreadDistance),
      punctDistance: round3(punctDistance),
      contractionDistance: round3(contractionDistance),
      functionWordDistance: round3(functionDistance),
      wordLengthDistance: round3(wordLengthDistanceValue),
      charGramDistance: round3(charGramDistance),
      lexicalDistance: round3(lexicalDistance),
      recurrenceDistance: round3(recurrenceDistance),
      lexicalOverlap: round3(lexicalOverlap),
      punctShapeDistance: round3(punctShapeDistance),
      profileA,
      profileB
    };
  }

  function cadenceAxisVector(input) {
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

  function cadenceHeatmap(text = '') {
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

  function buildCadenceSignature(text = '', profile = extractCadenceProfile(text)) {
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

  function transformText(text, mod = {}, options = {}) {
    let result = normalizeText(text);
    const strength = clamp(Number((options && options.strength) ?? 0.76), 0, 1);
    const baseProfile = extractCadenceProfile(result);
    const connectorProfile = (options && options.profile) || null;
    const targetProfile = options && options.profile
      ? applyCadenceShell(baseProfile, {
          mode: 'borrowed',
          profile: options.profile,
          strength
        })
      : applyCadenceMod(baseProfile, mod);

    const targetGap = profileDeltaToTarget(baseProfile, targetProfile);
    const targetNeedsStructuralShift =
      targetGap.avgSentence >= 1 ||
      targetGap.sentenceCount >= 1 ||
      targetGap.contraction >= 0.014 ||
      targetGap.lineBreak >= 0.05 ||
      targetGap.functionWord >= 0.04;
    const maxPasses = options && options.profile ? 4 : 3;
    let bestResult = result;
    let bestScore = profileDeltaScore(targetGap);

    for (let pass = 0; pass < maxPasses; pass += 1) {
      const currentProfile = extractCadenceProfile(result);
      const gap = profileDeltaToTarget(currentProfile, targetProfile);

      if (profileDeltaScore(gap) <= 0.08) {
        break;
      }

      let nextResult = result;

      if (shouldApplySentenceTexture(currentProfile, targetProfile, gap, mod)) {
        nextResult = applySentenceTexture(nextResult, currentProfile, targetProfile, strength, mod);
      }

      const afterSentence = extractCadenceProfile(nextResult);
      const afterSentenceGap = profileDeltaToTarget(afterSentence, targetProfile);
      if (afterSentenceGap.contraction >= 0.012 || Math.abs(Number(mod.cont || 0)) > 0) {
        nextResult = applyContractionTexture(nextResult, targetProfile, mod);
      }

      const afterContraction = extractCadenceProfile(nextResult);
      const afterContractionGap = profileDeltaToTarget(afterContraction, targetProfile);
      if (afterContractionGap.lineBreak >= 0.045) {
        nextResult = applyLineBreakTexture(nextResult, targetProfile, Math.min(1, strength + 0.08));
      }

      const afterLineBreak = extractCadenceProfile(nextResult);
      const afterLineBreakGap = profileDeltaToTarget(afterLineBreak, targetProfile);
      if (afterLineBreakGap.functionWord >= 0.035) {
        nextResult = applyFunctionWordTexture(nextResult, targetProfile, Math.min(1, strength + 0.1), connectorProfile);
      }

      const afterFunction = extractCadenceProfile(nextResult);
      const afterFunctionGap = profileDeltaToTarget(afterFunction, targetProfile);
      if (
        afterFunctionGap.punctuation >= 0.018 ||
        afterFunctionGap.punctuationShape >= 0.05 ||
        Math.abs(Number(mod.punc || 0)) > 0
      ) {
        nextResult = applyPunctuationTexture(nextResult, targetProfile, mod);
      }

      if ((mod.punc || 0) < 0) {
        nextResult = nextResult.replace(/[;:]+/g, '.').replace(/,+/g, ',');
      }

      nextResult = finalizeTransformedText(nextResult);
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
      result = forceStructuralShift(result, baseProfile, targetProfile, strength, mod, connectorProfile);
    }

    return finalizeTransformedText(result);
  }

  function finalizeTransformedText(text = '') {
    return normalizeSentenceStarts(text)
      .replace(/([;:.!?]\s+)(and|but|though|yet|since|because|so|then|when|while)\s+\2\b/gi, '$1$2')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ ]{2,}/g, ' ')
      .trim();
  }

  function solveQuadratic(a, b, c) {
    if (a === 0) {
      throw new Error('a must be non-zero');
    }

    const discriminant = b * b - (4 * a * c);
    if (discriminant < 0) {
      return {
        roots: [],
        discriminant,
        unwanted: [],
        classification: 'complex'
      };
    }

    const sqrt = Math.sqrt(discriminant);
    const roots = [(-b + sqrt) / (2 * a), (-b - sqrt) / (2 * a)].sort((x, y) => x - y);
    const unwanted = roots.filter((root) => root < 0);

    return {
      roots,
      discriminant,
      unwanted,
      classification: unwanted.length ? 'candidate-discovery-branch' : 'resolved'
    };
  }

  function cadenceCoherence({
    sentenceDistance = 1,
    spreadDistance = 1,
    punctDistance = 1,
    punctShapeDistance = 1,
    contractionDistance = 1,
    functionWordDistance = 1,
    wordLengthDistance = 1,
    charGramDistance = 1,
    lexicalDistance = 1,
    recurrenceDistance = 1
  } = {}) {
    return round3(clamp01(
      ((1 - clamp01(sentenceDistance)) * 0.14) +
      ((1 - clamp01(spreadDistance)) * 0.08) +
      ((1 - clamp01(punctDistance)) * 0.10) +
      ((1 - clamp01(punctShapeDistance)) * 0.14) +
      ((1 - clamp01(contractionDistance)) * 0.10) +
      ((1 - clamp01(functionWordDistance)) * 0.18) +
      ((1 - clamp01(wordLengthDistance)) * 0.08) +
      ((1 - clamp01(charGramDistance)) * 0.14) +
      ((1 - clamp01(lexicalDistance)) * 0.02) +
      ((1 - clamp01(recurrenceDistance)) * 0.02)
    ));
  }

  function cadenceResonance({ similarity = 0, traceability = 0, coherence = null } = {}) {
    const harmonic = harmonicMean([similarity, traceability]);

    if (coherence == null) {
      return round3(clamp01(harmonic));
    }

    return round3(clamp01(
      (harmonic * 0.58) +
      (harmonicMean([similarity, traceability, coherence]) * 0.42)
    ));
  }

  function branchDynamics({
    similarity = 0,
    traceability = 0,
    lexicalOverlap = 0,
    coherence = null,
    functionWordDistance = 1,
    charGramDistance = 1,
    punctShapeDistance = 1
  } = {}) {
    const overlap = clamp01(lexicalOverlap);
    const coherenceTerm = clamp01(
      coherence == null
        ? arithmeticMean([
            1 - clamp01(functionWordDistance),
            1 - clamp01(charGramDistance),
            1 - clamp01(punctShapeDistance)
          ])
        : coherence
    );
    const stylometricSurplus = clamp01(clamp01(traceability) - overlap);
    const coherenceShadow = clamp01(coherenceTerm - overlap);
    const branchPressure = round3(clamp01(
      (stylometricSurplus * 0.68) +
      (coherenceShadow * 0.32)
    ));
    const beta = round3(1 + clamp01(similarity) + clamp01(traceability));
    const gamma = round3(0.42 - branchPressure);
    const quadratic = solveQuadratic(1, -beta, gamma);

    return {
      ...quadratic,
      lexicalOverlap: round3(overlap),
      coherence: round3(coherenceTerm),
      stylometricSurplus: round3(stylometricSurplus),
      branchPressure,
      beta,
      gamma,
      flag: quadratic.unwanted.length ? 1 : 0,
      classification: branchPressure >= 0.42 || quadratic.unwanted.length
        ? 'candidate-discovery-branch'
        : quadratic.classification
    };
  }

  function computeRoutePressure(similarityOrState, traceability = 0, branchFlag = 0, recurrence = 0) {
    if (typeof similarityOrState === 'object' && similarityOrState !== null) {
      const {
        similarity = 0,
        traceability: trace = 0,
        recurrencePressure = 0,
        branchPressure = 0,
        coherence = cadenceCoherence(similarityOrState),
        resonance = cadenceResonance({ similarity, traceability: trace, coherence })
      } = similarityOrState;

      return round3(clamp01(
        (clamp01(resonance) * 0.40) +
        (clamp01(coherence) * 0.26) +
        (clamp01(recurrencePressure) * 0.18) +
        (clamp01(branchPressure) * 0.16)
      ));
    }

    return round3(clamp01(
      (clamp01(similarityOrState) * 0.33) +
      (clamp01(traceability) * 0.27) +
      (clamp01(recurrence) * 0.22) +
      ((branchFlag ? 1 : 0) * 0.05)
    ));
  }

  function fieldPotential({
    routePressure = 0,
    resonance = 0,
    coherence = 0,
    branchPressure = 0,
    mirrorLogic = 'off',
    containment = 'on'
  } = {}) {
    const pressure = clamp01(routePressure);
    const mirrorTerm = mirrorLogic === 'on' ? 0.08 : 0;
    const containmentTerm = containment === 'on' ? 0.06 : -0.04;

    return round3(clamp01(
      (pressure * 0.46) +
      (clamp01(resonance) * 0.22) +
      (clamp01(coherence) * 0.12) +
      (clamp01(branchPressure) * 0.08) +
      mirrorTerm +
      containmentTerm
    ));
  }

  function waveStats({
    similarity = 0,
    traceability = 0,
    resonance = null,
    coherence = 0,
    branchPressure = 0,
    recurrencePressure = 0,
    fieldPotential: V = 0
  } = {}) {
    const phaseLock = clamp01(
      resonance == null
        ? cadenceResonance({ similarity, traceability, coherence })
        : resonance
    );
    const amplitude = round3(phaseLock);
    const waveNumber = round3(1 + (clamp01(recurrencePressure) * 2.2) + (clamp01(branchPressure) * 0.8));
    const density = round3(clamp01(
      (amplitude ** 2) * (0.26 + (0.44 * clamp01(V)) + (0.30 * clamp01(coherence)))
    ));
    const damping = round3(clamp01((1 - phaseLock) * (1 - clamp01(V))));

    return {
      amplitude,
      k: waveNumber,
      density,
      V: round3(clamp01(V)),
      coherence: round3(clamp01(coherence)),
      phaseLock: round3(phaseLock),
      damping
    };
  }

  function criticalityIndex({
    density = 0,
    routePressure = 0,
    branchPressure = 0,
    routeAvailable = false
  } = {}) {
    return round3(clamp01(
      (clamp01(density) * 0.46) +
      (clamp01(routePressure) * 0.28) +
      (clamp01(branchPressure) * 0.26) -
      (routeAvailable ? 0.24 : 0)
    ));
  }

  function custodyThreshold(custodialIntegrityOrState, custodialDrift, theta = 0.2) {
    if (typeof custodialIntegrityOrState === 'object' && custodialIntegrityOrState !== null) {
      const {
        routePressure = 0,
        density = 0,
        branchPressure = 0,
        resonance = 0,
        coherence = 0,
        criticality = 0,
        containment = 'on',
        mirrorLogic = 'off',
        badge = 'badge.holds',
        theta: thresholdInput = 0.2
      } = custodialIntegrityOrState;

      const badgeTerm =
        badge === 'badge.holds'
          ? 0.08
          : badge === 'badge.buffer'
            ? 0.05
            : 0.03;
      const integrity = round3(clamp01(
        0.22 +
        (clamp01(resonance) * 0.22) +
        (clamp01(coherence) * 0.18) +
        (containment === 'on' ? 0.12 : -0.03) +
        (mirrorLogic === 'on' ? 0.08 : 0) +
        badgeTerm +
        ((1 - clamp01(branchPressure)) * 0.10)
      ));
      const drift = round3(clamp01(
        0.12 +
        (clamp01(routePressure) * 0.28) +
        (clamp01(density) * 0.18) +
        (clamp01(branchPressure) * 0.16) +
        (clamp01(criticality) * 0.16) +
        (mirrorLogic === 'off' ? 0.07 : 0) +
        (containment === 'off' ? 0.05 : 0)
      ));
      const threshold = round3(thresholdInput);
      const delta = round3(integrity - drift);

      return {
        integrity,
        drift,
        delta,
        theta: threshold,
        archive: delta >= threshold ? 'institutional' : 'witness'
      };
    }

    const integrity = clamp01(custodialIntegrityOrState);
    const drift = clamp01(custodialDrift);
    const threshold = round3(theta);
    const delta = round3(integrity - drift);

    return {
      integrity,
      drift,
      delta,
      theta: threshold,
      archive: delta >= threshold ? 'institutional' : 'witness'
    };
  }

  function providerDecision({
    recognized,
    explained,
    routeAvailable,
    density = 0,
    recurrencePressure = 0
  }) {
    const denseSignal = clamp01(density) >= 0.28 || clamp01(recurrencePressure) >= 0.58;

    if (!recognized) {
      return 'weak-signal';
    }

    if (recognized && routeAvailable) {
      return 'passage';
    }

    if (recognized && !explained && !routeAvailable && denseSignal) {
      return 'criticality';
    }

    return 'hold-branch';
  }

  function nextBadge(current) {
    const badges = ['badge.holds', 'badge.branch', 'badge.buffer'];
    const idx = badges.indexOf(current);
    return badges[(idx + 1) % badges.length];
  }

  function badgeMeaning(badge) {
    switch (badge) {
      case 'badge.holds':
        return 'compact custody token active';
      case 'badge.branch':
        return 'awkward branch preserved';
      case 'badge.buffer':
        return 'stabilization before interpretation';
      default:
        return 'unknown badge';
    }
  }

  const HARBOR_LIBRARY = {
    'mirror.off': {
      mode_class: 'anti-reflective safe passage',
      trigger_condition: 'criticality rising while witness load is exposed',
      provenance_retention: 0.95,
      witness_load_effect: -0.18,
      coordination_overhead: 0.22,
      route_status_on_success: 'safe-passage achieved'
    },
    'receipt.capture': {
      mode_class: 'receipt-first stabilization',
      trigger_condition: 'recognition exceeds explanation but passage is not yet open',
      provenance_retention: 0.98,
      witness_load_effect: -0.09,
      coordination_overhead: 0.18,
      route_status_on_success: 'buffered'
    },
    'provenance.seal': {
      mode_class: 'chain-of-custody preservation',
      trigger_condition: 'low-pressure continuity with provenance preserved above floor',
      provenance_retention: 0.99,
      witness_load_effect: -0.05,
      coordination_overhead: 0.12,
      route_status_on_success: 'sealed'
    }
  };

  function estimateGroupSize({
    routePressure = 0,
    traceability = 0,
    criticality = 0,
    branchPressure = 0,
    custodyArchive = 'institutional'
  }) {
    const base = 1 + Math.round(
      (clamp01(routePressure) * 1.6) +
      (clamp01(traceability) * 0.7) +
      (clamp01(criticality) * 1.1) +
      (clamp01(branchPressure) * 0.8)
    );

    return Math.max(1, base + (custodyArchive === 'witness' ? 1 : 0));
  }

  function estimateSoloCostPerOperator({
    routePressure = 0,
    traceability = 0,
    criticality = 0,
    branchPressure = 0,
    custodyArchive = 'institutional'
  }) {
    const archivePenalty = custodyArchive === 'witness' ? 0.12 : 0.04;
    return round3(
      0.16 +
      (clamp01(routePressure) * 0.34) +
      (clamp01(traceability) * 0.18) +
      (clamp01(criticality) * 0.16) +
      (clamp01(branchPressure) * 0.12) +
      archivePenalty
    );
  }

  function chooseHarbor({
    routePressure = 0,
    branchPressure = 0,
    criticality = 0,
    badge = 'badge.holds',
    mirrorLogic = 'off',
    custodyArchive = 'institutional',
    decision = 'hold-branch',
    routeAvailable = false
  }) {
    const pressure = clamp01(routePressure);
    const branch = clamp01(branchPressure);
    const critical = clamp01(criticality);

    if ((custodyArchive === 'witness' || decision === 'criticality' || critical >= 0.6) && mirrorLogic === 'off') {
      return 'mirror.off';
    }

    if (decision === 'passage') {
      return routeAvailable ? 'receipt.capture' : 'mirror.off';
    }

    if (pressure >= 0.72 || critical >= 0.52) {
      return mirrorLogic === 'off' ? 'mirror.off' : 'receipt.capture';
    }

    if (branch >= 0.42 || pressure >= 0.46) {
      return 'receipt.capture';
    }

    if (badge === 'badge.holds') {
      return 'provenance.seal';
    }

    return 'receipt.capture';
  }

  function computeReuseGain(soloCost, sharedCost) {
    return round3(Math.max(0, soloCost - sharedCost));
  }

  function estimateWitnessLoad({
    routePressure = 0,
    traceability = 0,
    criticality = 0,
    branchPressure = 0,
    harborFunction,
    custodyArchive = 'institutional'
  }) {
    const harbor = HARBOR_LIBRARY[harborFunction];
    const archivePenalty = custodyArchive === 'witness' ? 0.14 : 0.02;
    const base =
      0.12 +
      (clamp01(routePressure) * 0.28) +
      (clamp01(traceability) * 0.14) +
      (clamp01(criticality) * 0.20) +
      (clamp01(branchPressure) * 0.14) +
      archivePenalty;

    return round3(clamp(base + ((harbor && harbor.witness_load_effect) || 0), 0, 2));
  }

  function buildLedgerRow({
    eventId,
    harborFunction,
    routePressure = 0,
    traceability = 0,
    branchPressure = 0,
    criticality = 0,
    density = 0,
    routeAvailable = false,
    custodyArchive = 'institutional',
    decision = 'hold-branch',
    operatorId = 'demo-operator',
    sourceClass = 'public membrane'
  }) {
    const harbor = HARBOR_LIBRARY[harborFunction];
    const groupSize = estimateGroupSize({
      routePressure,
      traceability,
      criticality,
      branchPressure,
      custodyArchive
    });
    const soloCostPerOperator = estimateSoloCostPerOperator({
      routePressure,
      traceability,
      criticality,
      branchPressure,
      custodyArchive
    });
    const soloCost = round3(groupSize * soloCostPerOperator);
    const sharedCost = round3(
      soloCostPerOperator + (harbor.coordination_overhead * Math.log2(groupSize + 1))
    );
    const witnessLoad = estimateWitnessLoad({
      routePressure,
      traceability,
      criticality,
      branchPressure,
      harborFunction,
      custodyArchive
    });
    const justiceDeficit = round3(
      clamp(
        0.10 +
        (clamp01(criticality) * 0.34) +
        (clamp01(branchPressure) * 0.22) +
        (clamp01(routePressure) * 0.18) +
        (custodyArchive === 'witness' ? 0.16 : 0.04),
        0,
        2
      )
    );
    const routeStatus =
      decision === 'passage'
        ? 'safe-passage achieved'
        : decision === 'criticality'
          ? 'buffered'
          : decision === 'hold-branch'
            ? 'buffered'
            : 'observing';
    const evidentiaryClass =
      custodyArchive === 'witness' || decision === 'criticality'
        ? 'receipt-bearing'
        : harborFunction === 'provenance.seal' || decision === 'passage'
          ? 'provenance-bearing'
          : 'exploratory';

    return {
      event_id: eventId,
      timestamp: new Date().toISOString(),
      operator_id: operatorId,
      witness_channel: custodyArchive === 'witness' ? 'inside-frame' : 'mixed',
      source_class: sourceClass,
      evidentiary_class: evidentiaryClass,
      harbor_function: harborFunction,
      group_size: groupSize,
      effective_archive: custodyArchive === 'witness' ? 'A_W' : 'A_I',
      solo_cost: soloCost,
      shared_cost: sharedCost,
      reuse_gain: computeReuseGain(soloCost, sharedCost),
      provenance_retention: harbor.provenance_retention,
      witness_load: witnessLoad,
      justice_deficit: justiceDeficit,
      route_status: routeStatus,
      route_available: routeAvailable,
      signal_density: round3(clamp01(density)),
      branch_pressure: round3(clamp01(branchPressure)),
      criticality_index: round3(clamp01(criticality)),
      receipt_hash: `sha256:${eventId}`
    };
  }

  window.TCP_ENGINE = {
    HARBOR_LIBRARY,
    compareTexts,
    extractCadenceProfile,
    functionWordProfile,
    wordLengthProfile,
    charTrigramProfile,
    applyCadenceMod,
    applyCadenceShell,
    applyCadenceToText,
    transformText,
    cadenceModFromProfile,
    cadenceAxisVector,
    cadenceHeatmap,
    buildCadenceSignature,
    solveQuadratic,
    cadenceCoherence,
    cadenceResonance,
    branchDynamics,
    fieldPotential,
    waveStats,
    custodyThreshold,
    criticalityIndex,
    routePressure: computeRoutePressure,
    computeRoutePressure,
    providerDecision,
    chooseHarbor,
    buildLedgerRow,
    nextBadge,
    badgeMeaning
  };
})();
