import {
  auditTD613ApertureWitnessAnchors,
  buildTD613ApertureAudit,
  classifyTD613ApertureProjection,
  detectTD613ApertureTextPathologies,
  repairTD613ApertureProjection,
  reviewTD613ApertureTransfer
} from './td613-aperture.js';
import {
  buildCadenceTransferLegacy,
  cadenceModFromProfile,
  compareTexts,
  extractCadenceProfile,
  segmentTextToIR,
  sentenceSplit
} from './stylometry.js';

function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value || 0)));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value || 0)));
}

function round(value, digits = 4) {
  return Number(Number(value || 0).toFixed(digits));
}

function normalizeText(text = '') {
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/\u00A0/g, ' ')
    .replace(/\u2019/g, "'")
    .replace(/\u2018/g, "'")
    .replace(/\u2014/g, '-')
    .replace(/\u2013/g, '-')
    .trim();
}

function normalizeComparable(text = '') {
  return normalizeText(text)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeMovementComparable(text = '') {
  return normalizeComparable(text)
    .replace(/\bi'm\b/g, 'i am')
    .replace(/\bi've\b/g, 'i have')
    .replace(/\bit's\b/g, 'it is')
    .replace(/\bthat's\b/g, 'that is')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function uniqueStrings(values = []) {
  return [...new Set((values || []).filter(Boolean))];
}

function extractHardAnchors(text = '') {
  const normalized = normalizeText(text);
  const anchors = new Set();
  const quoted = normalized.match(/"[^"\n]{1,120}"/g) || [];
  quoted.forEach((entry) => anchors.add(entry));
  const clockTimes = normalized.match(/\b\d{1,2}:\d{2}\s?(?:AM|PM)\b/gi) || [];
  clockTimes.forEach((entry) => anchors.add(entry));
  const ids = normalized.match(/\b[A-Z]{1,6}-\d{1,6}[A-Z]?\b/g) || [];
  ids.forEach((entry) => anchors.add(entry));
  const suiteLike = normalized.match(/\b(?:Door|Unit|Suite)\s+[A-Z0-9-]+\b/g) || [];
  suiteLike.forEach((entry) => anchors.add(entry));
  const sentenceBrands = sentenceSplit(normalized)
    .flatMap((sentence) => {
      const trimmed = normalizeText(sentence);
      const withoutLead = trimmed.replace(/^[A-Z][a-z0-9'’-]*[,:;]?\s+/, '');
      return withoutLead.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}\b/g) || [];
    })
    .map((entry) => normalizeText(entry))
    .filter((entry) => entry && !/^(?:I|The|A|An|It|This|That|On|At|In|When|While|And|But)$/.test(entry));
  sentenceBrands.forEach((entry) => anchors.add(entry));
  return [...anchors];
}

function hardAnchorIntegrity(sourceText = '', outputText = '') {
  const anchors = extractHardAnchors(sourceText);
  if (!anchors.length) {
    return 1;
  }
  const comparableOutput = normalizeComparable(outputText);
  const resolved = anchors.filter((anchor) => comparableOutput.includes(normalizeComparable(anchor))).length;
  return round(resolved / anchors.length, 4);
}

function classifyV2SourceClass(text = '') {
  const normalized = normalizeText(text);
  if (!normalized) {
    return 'procedural-record';
  }
  const proceduralTokenHits = (
    normalized.match(/\b(?:account|support|ticket|request|controller|firmware|badge|custody|fraud hold|case number|override|archive operations)\b/gi) || []
  ).length;
  if (
    /\b(?:Door|Unit|Suite)\s+[A-Z0-9-]+\b/.test(normalized) ||
    /\b\d{1,2}:\d{2}\s?(?:AM|PM)\b/i.test(normalized) ||
    proceduralTokenHits >= 2
  ) {
    return 'procedural-record';
  }
  if (
    /\b(?:hello|hi|thanks|thank you|please|appreciate|let me know|best,|regards|team|schedule|follow up|follow-up)\b/i.test(normalized)
  ) {
    return 'formal-correspondence';
  }
  if (
    /\b(?:room|wall|night|suddenly|coffee|door|pack|thumb|swing|alone|shuddering)\b/i.test(normalized) ||
    /[!?]/.test(normalized)
  ) {
    return 'narrative-scene';
  }
  if (
    /\b(?:I|me|my|myself)\b/.test(normalized) &&
    /\b(?:remember|reminding|worry|feel|think|trying|content|amnesia|keep)\b/i.test(normalized)
  ) {
    return 'reflective-prose';
  }
  return 'formal-correspondence';
}

function inferEnvelopeId(shell = {}, sourceProfile = {}, targetProfile = {}) {
  const personaId = String(shell?.personaId || '').trim().toLowerCase();
  if (personaId) {
    return personaId;
  }
  const label = String(shell?.label || '').trim().toLowerCase();
  if (label.includes('spark')) {
    return 'spark';
  }
  if (label.includes('matron')) {
    return 'matron';
  }
  if (label.includes('undertow')) {
    return 'undertow';
  }
  if (label.includes('archiv')) {
    return 'archivist';
  }
  if (label.includes('cross')) {
    return 'cross-examiner';
  }
  if (label.includes('operator')) {
    return 'operator';
  }
  if (label.includes('method')) {
    return 'methods-editor';
  }
  if ((targetProfile.abbreviationDensity || 0) >= 0.08 || (targetProfile.fragmentPressure || 0) >= 0.14) {
    return 'spark';
  }
  if ((targetProfile.avgSentenceLength || 0) >= (sourceProfile.avgSentenceLength || 0) + 3.5) {
    return (targetProfile.directness || 0) <= (sourceProfile.directness || 0)
      ? 'matron'
      : 'archivist';
  }
  if ((targetProfile.directness || 0) >= (sourceProfile.directness || 0) + 0.12) {
    return 'cross-examiner';
  }
  return 'generic';
}

const ENVELOPE_ADJUSTMENTS = Object.freeze({
  spark: Object.freeze({
    primary: Object.freeze({ sent: -2, cont: 2, punc: 2 }),
    secondary: Object.freeze({ sent: -3, cont: 2, punc: 3 }),
    conservative: Object.freeze({ sent: -1, cont: 1, punc: 1 })
  }),
  matron: Object.freeze({
    primary: Object.freeze({ sent: 2, cont: -1, punc: -1 }),
    secondary: Object.freeze({ sent: 3, cont: 0, punc: -2 }),
    conservative: Object.freeze({ sent: 1, cont: 0, punc: -1 })
  }),
  undertow: Object.freeze({
    primary: Object.freeze({ sent: 2, cont: 0, punc: -1 }),
    secondary: Object.freeze({ sent: 3, cont: 0, punc: -1 }),
    conservative: Object.freeze({ sent: 1, cont: 0, punc: 0 })
  }),
  archivist: Object.freeze({
    primary: Object.freeze({ sent: 2, cont: -2, punc: -1 }),
    secondary: Object.freeze({ sent: 3, cont: -2, punc: -1 }),
    conservative: Object.freeze({ sent: 1, cont: -1, punc: 0 })
  }),
  'cross-examiner': Object.freeze({
    primary: Object.freeze({ sent: -2, cont: -1, punc: 2 }),
    secondary: Object.freeze({ sent: -3, cont: -1, punc: 3 }),
    conservative: Object.freeze({ sent: -1, cont: -1, punc: 1 })
  }),
  operator: Object.freeze({
    primary: Object.freeze({ sent: -1, cont: -1, punc: -1 }),
    secondary: Object.freeze({ sent: -2, cont: -1, punc: -1 }),
    conservative: Object.freeze({ sent: -1, cont: 0, punc: -1 })
  }),
  'methods-editor': Object.freeze({
    primary: Object.freeze({ sent: 2, cont: -2, punc: -1 }),
    secondary: Object.freeze({ sent: 3, cont: -3, punc: -2 }),
    conservative: Object.freeze({ sent: 1, cont: -1, punc: -1 })
  }),
  generic: Object.freeze({
    primary: Object.freeze({ sent: 0, cont: 0, punc: 0 }),
    secondary: Object.freeze({ sent: 1, cont: 0, punc: 0 }),
    conservative: Object.freeze({ sent: 0, cont: 0, punc: 0 })
  })
});

function classScalar(sourceClass = 'formal-correspondence') {
  if (sourceClass === 'procedural-record') {
    return 0.62;
  }
  if (sourceClass === 'formal-correspondence') {
    return 0.8;
  }
  if (sourceClass === 'reflective-prose') {
    return 1.05;
  }
  if (sourceClass === 'narrative-scene') {
    return 1.12;
  }
  return 0.85;
}

function mergeShellMod(baseMod = {}, adjustment = {}, scalar = 1) {
  return {
    sent: clamp(Math.round(Number(baseMod.sent || 0) + (Number(adjustment.sent || 0) * scalar)), -3, 3),
    cont: clamp(Math.round(Number(baseMod.cont || 0) + (Number(adjustment.cont || 0) * scalar)), -3, 3),
    punc: clamp(Math.round(Number(baseMod.punc || 0) + (Number(adjustment.punc || 0) * scalar)), -3, 3)
  };
}

function cloneProfile(profile = {}) {
  return profile ? JSON.parse(JSON.stringify(profile)) : null;
}

function tuneTargetProfile(profile = {}, sourceProfile = {}, envelopeId = 'generic', sourceClass = 'formal-correspondence', intensity = 1) {
  if (!profile || !Object.keys(profile).length) {
    return null;
  }
  const tuned = { ...cloneProfile(profile) };
  const classWeight = classScalar(sourceClass) * intensity;

  if (envelopeId === 'spark' || envelopeId === 'cross-examiner' || envelopeId === 'operator') {
    tuned.avgSentenceLength = Math.max(2, round(
      (profile.avgSentenceLength || sourceProfile.avgSentenceLength || 10) - (1.6 * classWeight),
      2
    ));
    tuned.punctuationDensity = clamp01(round(
      (profile.punctuationDensity || 0) + (0.012 * classWeight),
      4
    ));
    tuned.contractionDensity = clamp01(round(
      (profile.contractionDensity || 0) + (0.018 * classWeight),
      4
    ));
    tuned.directness = clamp01(round(
      (profile.directness || 0) + (0.05 * classWeight),
      4
    ));
  } else if (envelopeId === 'matron' || envelopeId === 'undertow' || envelopeId === 'archivist' || envelopeId === 'methods-editor') {
    tuned.avgSentenceLength = round(
      (profile.avgSentenceLength || sourceProfile.avgSentenceLength || 10) + (1.8 * classWeight),
      2
    );
    tuned.punctuationDensity = clamp01(round(
      Math.max(0, (profile.punctuationDensity || 0) - (0.008 * classWeight)),
      4
    ));
    tuned.contractionDensity = clamp01(round(
      Math.max(0, (profile.contractionDensity || 0) - (0.012 * classWeight)),
      4
    ));
    tuned.abstractionPosture = clamp01(round(
      (profile.abstractionPosture || 0) + (0.03 * classWeight),
      4
    ));
  }

  return tuned;
}

function splitSentencesPreserve(text = '') {
  return normalizeText(text)
    .split(/(?<=[.!?]["')\]]*)(?=\s+|\n|$)/g)
    .map((entry) => normalizeText(entry))
    .filter(Boolean);
}

function contractExpansions(text = '') {
  return normalizeText(text)
    .replace(/\bI am\b/g, "I'm")
    .replace(/\bI have\b/g, "I've")
    .replace(/\bI will\b/g, "I'll")
    .replace(/\bdo not\b/gi, "don't")
    .replace(/\bdoes not\b/gi, "doesn't")
    .replace(/\bdid not\b/gi, "didn't")
    .replace(/\bit is\b/gi, "it's")
    .replace(/\bthat is\b/gi, "that's")
    .replace(/\bthere is\b/gi, "there's")
    .replace(/\bwe are\b/gi, "we're")
    .replace(/\byou are\b/gi, "you're")
    .replace(/\bthey are\b/gi, "they're")
    .replace(/\bcan not\b/gi, "can't")
    .replace(/\bwill not\b/gi, "won't");
}

function expandContractions(text = '') {
  return normalizeText(text)
    .replace(/\bI'm\b/g, 'I am')
    .replace(/\bI've\b/g, 'I have')
    .replace(/\bI'll\b/g, 'I will')
    .replace(/\bdon't\b/gi, 'do not')
    .replace(/\bdoesn't\b/gi, 'does not')
    .replace(/\bdidn't\b/gi, 'did not')
    .replace(/\bit's\b/gi, 'it is')
    .replace(/\bthat's\b/gi, 'that is')
    .replace(/\bthere's\b/gi, 'there is')
    .replace(/\bwe're\b/gi, 'we are')
    .replace(/\byou're\b/gi, 'you are')
    .replace(/\bthey're\b/gi, 'they are')
    .replace(/\bcan't\b/gi, 'can not')
    .replace(/\bwon't\b/gi, 'will not');
}

function sentenceWordCount(sentence = '') {
  return normalizeText(sentence)
    .replace(/[^a-z0-9' ]+/gi, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .length;
}

function splitForClippedMomentum(sentence = '') {
  return normalizeText(sentence)
    .replace(/,\s+(?=(?:and|but|because|while|with|which)\b)/gi, '. ')
    .replace(/;\s+/g, '. ')
    .replace(/:\s+(?=[A-Z])/g, '. ');
}

function mergeForLongCurrent(sentences = [], linker = ', and ') {
  if (sentences.length < 2) {
    return sentences;
  }
  const merged = [];
  let index = 0;
  while (index < sentences.length) {
    const current = normalizeText(sentences[index]);
    const next = normalizeText(sentences[index + 1] || '');
    if (!next) {
      merged.push(current);
      index += 1;
      continue;
    }
    const currentWords = sentenceWordCount(current);
    const nextWords = sentenceWordCount(next);
    if (currentWords <= 14 || nextWords <= 14) {
      const left = current.replace(/[.!?]+$/g, '');
      const right = next.replace(/^[A-Z]/, (match) => match.toLowerCase());
      merged.push(`${left}${linker}${right}`);
      index += 2;
      continue;
    }
    merged.push(current);
    index += 1;
  }
  return merged;
}

function tidyEnvelopeText(text = '') {
  return normalizeText(
    String(text || '')
      .replace(/\s+([,;:.!?])/g, '$1')
      .replace(/,\s*;/g, ';')
      .replace(/;\s*,/g, ';')
      .replace(/;\s*\./g, '.')
      .replace(/,\s*\./g, '.')
      .replace(/\.{2,}/g, '.')
      .replace(/!{2,}/g, '!')
      .replace(/\?{2,}/g, '?')
  );
}

function sanitizeV2Surface(text = '') {
  return normalizeText(
    tidyEnvelopeText(text)
      .replace(/\.\s*,/g, '. ')
      .replace(/,\s*\./g, '. ')
      .replace(/;\s+;/g, '; ')
      .replace(/\bYet\s+twirl\b/gi, 'The twirl')
      .replace(/\bYet\s+two\b/gi, 'Then two')
      .replace(/\bYet\s+the\b/gi, 'Then the')
      .replace(/\bYet\s+it\b/gi, 'Then it')
      .replace(/([.!?]\s+)([a-z])/g, (match, spacing, letter) => `${spacing}${letter.toUpperCase()}`)
      .replace(/\s{2,}/g, ' ')
  );
}

const PROCEDURAL_ALIAS_GUARDS = Object.freeze([
  Object.freeze({
    canonical: 'support',
    aliases: [/\bhelp\b/gi]
  }),
  Object.freeze({
    canonical: 'account',
    aliases: [/\bstory\b/gi, /\bpoint\b/gi]
  }),
  Object.freeze({
    canonical: 'review',
    aliases: [/\bcheck\b/gi]
  })
]);

function restoreProceduralWitnessTerms(sourceText = '', outputText = '', sourceClass = 'formal-correspondence') {
  if (!['procedural-record', 'formal-correspondence'].includes(sourceClass)) {
    return outputText;
  }
  const sourceLower = normalizeComparable(sourceText);
  let working = String(outputText || '');
  PROCEDURAL_ALIAS_GUARDS.forEach((rule) => {
    if (!sourceLower.includes(rule.canonical)) {
      return;
    }
    const canonicalPattern = new RegExp(`\\b${rule.canonical}\\b`, 'gi');
    const requiredCount = (sourceLower.match(canonicalPattern) || []).length;
    let outputCount = (normalizeComparable(working).match(canonicalPattern) || []).length;
    if (outputCount >= requiredCount) {
      return;
    }
    for (const alias of rule.aliases) {
      while (outputCount < requiredCount && alias.test(working)) {
        alias.lastIndex = 0;
        working = working.replace(alias, rule.canonical);
        outputCount += 1;
      }
      alias.lastIndex = 0;
      if (outputCount >= requiredCount) {
        break;
      }
    }
  });
  return working;
}

function restoreHardWitnessAnchors(sourceText = '', outputText = '') {
  let working = String(outputText || '');
  for (const match of String(sourceText || '').matchAll(/\bDoor\s+([A-Z0-9-]+)\b/gi)) {
    const suffix = String(match[1] || '').trim();
    if (!suffix) {
      continue;
    }
    const canonical = `Door ${suffix}`;
    const shorthand = new RegExp(`\\bd\\s*${suffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (!new RegExp(`\\bDoor\\s+${suffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(working) && shorthand.test(working)) {
      working = working.replace(shorthand, canonical);
    }
  }
  return working;
}

function applyPersonaEnvelopeText(text = '', {
  sourceText = '',
  envelopeId = 'generic',
  sourceClass = 'formal-correspondence',
  targetProfile = {},
  explicitTargetProfile = false
} = {}) {
  let working = normalizeText(text);
  if (!working) {
    return working;
  }

  const sentences = splitSentencesPreserve(working);
  const sourceSentences = splitSentencesPreserve(sourceText);
  const sceneLike = sourceClass === 'reflective-prose' || sourceClass === 'narrative-scene';

  if (envelopeId === 'spark' || envelopeId === 'cross-examiner' || envelopeId === 'operator') {
    working = sentences.map((sentence) => splitForClippedMomentum(sentence)).join(' ');
    if ((targetProfile.contractionDensity || 0) >= 0.08 || envelopeId === 'spark') {
      working = contractExpansions(working);
    }
  } else if (envelopeId === 'matron') {
    const merged = mergeForLongCurrent(sentences, sceneLike ? ', and ' : '; ');
    working = expandContractions(merged.join(' '));
  } else if (envelopeId === 'undertow') {
    const merged = mergeForLongCurrent(sentences, sceneLike ? ', while ' : '; and ');
    working = merged.join(' ');
    if ((targetProfile.contractionDensity || 0) < 0.06) {
      working = expandContractions(working);
    }
  } else if (envelopeId === 'archivist' || envelopeId === 'methods-editor') {
    const merged = mergeForLongCurrent(sentences, '; ');
    working = expandContractions(merged.join(' ')).replace(/!/g, '.');
  } else {
    if (!explicitTargetProfile) {
      return tidyEnvelopeText(working);
    }
    if ((targetProfile.contractionDensity || 0) >= 0.08 && sourceSentences.length >= 2) {
      working = contractExpansions(working);
    } else if ((targetProfile.contractionDensity || 0) <= 0.04) {
      working = expandContractions(working);
    }
  }

  return tidyEnvelopeText(working);
}

function deriveChangedDimensions(sourceProfile = {}, outputProfile = {}) {
  const dimensions = [];
  if (Math.abs((sourceProfile.avgSentenceLength || 0) - (outputProfile.avgSentenceLength || 0)) >= 1) {
    dimensions.push('sentence-mean');
  }
  if (Math.abs((sourceProfile.sentenceCount || 0) - (outputProfile.sentenceCount || 0)) >= 1) {
    dimensions.push('sentence-count');
  }
  if (Math.abs((sourceProfile.sentenceLengthSpread || 0) - (outputProfile.sentenceLengthSpread || 0)) >= 1.4) {
    dimensions.push('sentence-spread');
  }
  if (Math.abs((sourceProfile.contractionDensity || 0) - (outputProfile.contractionDensity || 0)) >= 0.012) {
    dimensions.push('contraction-posture');
  }
  if (Math.abs((sourceProfile.lineBreakDensity || 0) - (outputProfile.lineBreakDensity || 0)) >= 0.03) {
    dimensions.push('line-break-texture');
  }
  if (Math.abs((sourceProfile.punctuationDensity || 0) - (outputProfile.punctuationDensity || 0)) >= 0.012) {
    dimensions.push('punctuation-shape');
  }
  if ((sourceProfile.registerMode || '') !== (outputProfile.registerMode || '')) {
    dimensions.push('register-mode');
  }
  if (Math.abs((sourceProfile.directness || 0) - (outputProfile.directness || 0)) >= 0.06) {
    dimensions.push('directness');
  }
  if (Math.abs((sourceProfile.abstractionPosture || 0) - (outputProfile.abstractionPosture || 0)) >= 0.06) {
    dimensions.push('abstraction');
  }
  if (Math.abs((sourceProfile.abbreviationDensity || 0) - (outputProfile.abbreviationDensity || 0)) >= 0.018) {
    dimensions.push('abbreviation-posture');
  }
  if (Math.abs((sourceProfile.orthographicLooseness || 0) - (outputProfile.orthographicLooseness || 0)) >= 0.02) {
    dimensions.push('orthography-posture');
  }
  return dimensions;
}

function substantiveDimensionCount(changedDimensions = []) {
  return (changedDimensions || []).filter((dimension) =>
    !['punctuation-shape', 'contraction-posture'].includes(dimension)
  ).length;
}

function deriveRealizationTier(changedDimensions = [], lexemeSwaps = []) {
  const substantive = substantiveDimensionCount(changedDimensions);
  const lexical = Number((lexemeSwaps || []).length || 0);
  if (substantive >= 2 && lexical > 0) {
    return 'lexical-structural';
  }
  if (substantive >= 2) {
    return 'structural';
  }
  if (substantive >= 1 || lexical > 0) {
    return 'partial';
  }
  return 'none';
}

function classSemanticFloor(sourceClass = 'formal-correspondence', sourceProfile = {}, targetProfile = null) {
  if (sourceClass === 'procedural-record') {
    return { proposition: 0.78, actor: 0.75, action: 0.75, object: 0.68 };
  }
  if (sourceClass === 'formal-correspondence') {
    const compressedTarget = Boolean(targetProfile) && (
      Number(targetProfile?.avgSentenceLength || 0) < (Number(sourceProfile?.avgSentenceLength || 0) * 0.76) ||
      Number(targetProfile?.fragmentPressure || 0) >= 0.08 ||
      Number(targetProfile?.abbreviationDensity || 0) >= 0.035
    );
    if (compressedTarget) {
      return { proposition: 0.84, actor: 0.62, action: 0.72, object: 0.6 };
    }
    return { proposition: 0.8, actor: 0.7, action: 0.74, object: 0.62 };
  }
  if (sourceClass === 'reflective-prose') {
    return { proposition: 0.72, actor: 0.64, action: 0.64, object: 0.56 };
  }
  return { proposition: 0.7, actor: 0.62, action: 0.62, object: 0.54 };
}

function classWitnessFloor(sourceClass = 'formal-correspondence') {
  if (sourceClass === 'procedural-record') {
    return 1;
  }
  if (sourceClass === 'formal-correspondence') {
    return 0.94;
  }
  if (sourceClass === 'reflective-prose') {
    return 0.72;
  }
  return 0.68;
}

function classProtectedAnchorFloor(sourceClass = 'formal-correspondence') {
  if (sourceClass === 'procedural-record') {
    return 0.98;
  }
  if (sourceClass === 'formal-correspondence') {
    return 0.95;
  }
  if (sourceClass === 'reflective-prose') {
    return 0.86;
  }
  return 0.84;
}

function classRewriteBar(sourceClass = 'formal-correspondence') {
  if (sourceClass === 'procedural-record') {
    return 0.14;
  }
  if (sourceClass === 'formal-correspondence') {
    return 0.16;
  }
  if (sourceClass === 'reflective-prose') {
    return 0.2;
  }
  return 0.22;
}

function computeRewriteStrength(sourceText = '', outputText = '', sourceProfile = {}, outputProfile = {}, changedDimensions = [], lexemeSwaps = []) {
  const comparableShift = normalizeMovementComparable(sourceText) !== normalizeMovementComparable(outputText);
  const fit = compareTexts(sourceText, outputText, {
    profileA: sourceProfile,
    profileB: outputProfile
  });
  const structural = substantiveDimensionCount(changedDimensions);
  const lexical = Math.min(2, Number((lexemeSwaps || []).length || 0));
  return round(clamp01(
    (comparableShift ? 0.12 : 0) +
    (structural * 0.18) +
    (lexical * 0.08) +
    ((fit.functionWordDistance || 0) * 0.24) +
    ((fit.charGramDistance || 0) * 0.18) +
    ((fit.registerDistance || 0) * 0.16) +
    ((fit.directnessDistance || 0) * 0.12) +
    ((fit.abstractionDistance || 0) * 0.12)
  ), 4);
}

function computeTargetFit(outputProfile = {}, targetProfile = null) {
  if (!targetProfile) {
    return 0.5;
  }
  const fit = compareTexts('', '', {
    profileA: outputProfile,
    profileB: targetProfile
  });
  const distance =
    (fit.sentenceDistance || 0) +
    (fit.functionWordDistance || 0) +
    (fit.contractionDistance || 0) +
    (fit.punctShapeDistance || 0) +
    (fit.registerDistance || 0) +
    (fit.directnessDistance || 0) +
    (fit.abstractionDistance || 0);
  return round(clamp01(1 - (distance / 3.4)), 4);
}

function buildShellVariants(sourceProfile = {}, shell = {}, sourceClass = 'formal-correspondence') {
  const targetProfile = shell?.profile || null;
  const envelopeId = inferEnvelopeId(shell, sourceProfile, targetProfile || {});
  const adjustments = ENVELOPE_ADJUSTMENTS[envelopeId] || ENVELOPE_ADJUSTMENTS.generic;
  const baseMod = shell?.mod
    ? {
        sent: clamp(Math.round(Number(shell.mod.sent || 0)), -3, 3),
        cont: clamp(Math.round(Number(shell.mod.cont || 0)), -3, 3),
        punc: clamp(Math.round(Number(shell.mod.punc || 0)), -3, 3)
      }
    : cadenceModFromProfile(targetProfile || sourceProfile);
  const baseStrength = clamp(Number(shell?.strength ?? (shell?.profile ? 0.84 : 0.72)), 0, 1);
  const scalar = classScalar(sourceClass);
  const variants = [
    {
      id: 'base',
      shell: {
        ...shell,
        mod: baseMod,
        strength: baseStrength,
        profile: targetProfile ? cloneProfile(targetProfile) : null
      },
      envelopeId
    },
    {
      id: 'amplified',
      shell: {
        ...shell,
        mod: mergeShellMod(baseMod, adjustments.primary, scalar),
        strength: clamp(baseStrength + (sourceClass === 'procedural-record' ? 0.04 : 0.08), 0, 1),
        profile: tuneTargetProfile(targetProfile, sourceProfile, envelopeId, sourceClass, 1)
      },
      envelopeId
    },
    {
      id: 'contrast',
      shell: {
        ...shell,
        mod: mergeShellMod(baseMod, adjustments.secondary, scalar),
        strength: clamp(baseStrength + (sourceClass === 'procedural-record' ? 0.08 : 0.14), 0, 1),
        profile: tuneTargetProfile(targetProfile, sourceProfile, envelopeId, sourceClass, 1.18)
      },
      envelopeId
    },
    {
      id: 'conservative',
      shell: {
        ...shell,
        mod: mergeShellMod(baseMod, adjustments.conservative, Math.max(0.5, scalar * 0.8)),
        strength: clamp(baseStrength - 0.08, 0.28, 1),
        profile: tuneTargetProfile(targetProfile, sourceProfile, envelopeId, sourceClass, 0.78)
      },
      envelopeId
    }
  ];

  return variants.filter((entry, index, array) => {
    const key = JSON.stringify({
      mod: entry.shell.mod,
      strength: entry.shell.strength,
      envelopeId: entry.envelopeId,
      avgSentenceLength: round(entry.shell.profile?.avgSentenceLength || 0, 3),
      contractionDensity: round(entry.shell.profile?.contractionDensity || 0, 3),
      punctuationDensity: round(entry.shell.profile?.punctuationDensity || 0, 3)
    });
    return array.findIndex((candidate) => {
      const candidateKey = JSON.stringify({
        mod: candidate.shell.mod,
        strength: candidate.shell.strength,
        envelopeId: candidate.envelopeId,
        avgSentenceLength: round(candidate.shell.profile?.avgSentenceLength || 0, 3),
        contractionDensity: round(candidate.shell.profile?.contractionDensity || 0, 3),
        punctuationDensity: round(candidate.shell.profile?.punctuationDensity || 0, 3)
      });
      return candidateKey === key;
    }) === index;
  });
}

function buildCandidate(sourceText = '', variant = {}, options = {}) {
  const sourceClass = options.sourceClass || classifyV2SourceClass(sourceText);
  const sourceProfile = options.sourceProfile || extractCadenceProfile(sourceText);
  const sourceIR = segmentTextToIR(sourceText, { literals: [], text: sourceText });
  const hardAnchors = extractHardAnchors(sourceText);
  const legacyResult = buildCadenceTransferLegacy(sourceText, variant.shell, {
    ...options,
    retrieval: true
  });
  const legacyOutput = normalizeText(legacyResult.text || sourceText);
  const envelopeOutput = applyPersonaEnvelopeText(legacyOutput, {
    sourceText,
    envelopeId: variant.envelopeId,
    sourceClass,
    targetProfile: variant.shell.profile || legacyResult.targetProfile || {},
    explicitTargetProfile: Boolean(variant.shell.profile)
  });
  const restoredOutput = restoreHardWitnessAnchors(
    sourceText,
    restoreProceduralWitnessTerms(sourceText, envelopeOutput || legacyOutput, sourceClass)
  );
  const repaired = repairTD613ApertureProjection({
    sourceText,
    outputText: restoredOutput || legacyOutput,
    personaId: String(variant.shell.personaId || ''),
    sourceProfile,
    targetProfile: variant.shell.profile || legacyResult.targetProfile || {},
    sourceClass
  });
  const outputText = sanitizeV2Surface(repaired.outputText || legacyOutput);
  const outputProfile = extractCadenceProfile(outputText);
  const changedDimensions = deriveChangedDimensions(sourceProfile, outputProfile);
  const lexemeSwaps = [...(legacyResult.lexemeSwaps || [])];
  const witnessAudit = auditTD613ApertureWitnessAnchors({
    sourceText,
    outputText,
    sourceIR,
    protectedState: { literals: [], text: sourceText }
  });
  const legacyProtectedAnchorAudit = legacyResult.protectedAnchorAudit || {};
  const hardMissingAnchors = hardAnchors.filter((anchor) =>
    !normalizeComparable(outputText).includes(normalizeComparable(anchor))
  );
  const derivedProtectedAnchorIntegrity = hardAnchors.length
    ? round((hardAnchors.length - hardMissingAnchors.length) / hardAnchors.length, 4)
    : 1;
  const semanticAudit = {
    ...(legacyResult.semanticAudit || {}),
    protectedAnchorIntegrity: Number(
      legacyResult.semanticAudit?.protectedAnchorIntegrity ?? derivedProtectedAnchorIntegrity
    )
  };
  const protectedAnchorAudit = hardAnchors.length
    ? {
        totalAnchors: hardAnchors.length,
        resolvedAnchors: hardAnchors.length - hardMissingAnchors.length,
        missingAnchors: hardMissingAnchors,
        protectedAnchorIntegrity: derivedProtectedAnchorIntegrity
      }
    : {
        totalAnchors: 0,
        resolvedAnchors: 0,
        missingAnchors: [],
        protectedAnchorIntegrity: derivedProtectedAnchorIntegrity
      };
  const pathologies = detectTD613ApertureTextPathologies({
    sourceText,
    outputText
  });
  const visibleShift = normalizeComparable(sourceText) !== normalizeComparable(outputText);
  const nonTrivialShift =
    substantiveDimensionCount(changedDimensions) > 0 ||
    lexemeSwaps.length > 0 ||
    normalizeMovementComparable(sourceText) !== normalizeMovementComparable(outputText);
  const apertureReview = reviewTD613ApertureTransfer({
    sourceText,
    outputText,
    shellMode: variant.shell?.mode || 'native',
    shellSource: variant.shell?.source || '',
    retrieval: true,
    semanticRisk: Number(legacyResult.semanticRisk || 0),
    visibleShift,
    nonTrivialShift,
    protectedAnchorIntegrity: Number(protectedAnchorAudit.protectedAnchorIntegrity ?? 1),
    propositionCoverage: Number(semanticAudit.propositionCoverage ?? 1),
    actorCoverage: Number(semanticAudit.actorCoverage ?? 1),
    actionCoverage: Number(semanticAudit.actionCoverage ?? 1),
    objectCoverage: Number(semanticAudit.objectCoverage ?? 1)
  });
  const classification = classifyTD613ApertureProjection({
    sourceText,
    outputText,
    changedDimensions,
    lexemeSwaps,
    visibleShift,
    nonTrivialShift,
    repaired: Boolean(repaired.repaired),
    pathologies,
    blocked: false
  });
  const rewriteStrength = computeRewriteStrength(
    sourceText,
    outputText,
    sourceProfile,
    outputProfile,
    changedDimensions,
    lexemeSwaps
  );
  const targetFit = computeTargetFit(outputProfile, variant.shell.profile || legacyResult.targetProfile || null);
  const floors = classSemanticFloor(
    sourceClass,
    sourceProfile,
    variant.shell.profile || legacyResult.targetProfile || null
  );
  const hardIntegrityScore = hardAnchorIntegrity(sourceText, outputText);
  const protectedAnchorIntegrity = Number(protectedAnchorAudit.protectedAnchorIntegrity ?? 1);
  const semanticPass =
    Number(semanticAudit.propositionCoverage ?? 1) >= floors.proposition &&
    Number(semanticAudit.actorCoverage ?? 1) >= floors.actor &&
    Number(semanticAudit.actionCoverage ?? 1) >= floors.action &&
    Number(semanticAudit.objectCoverage ?? 1) >= floors.object;
  const exactPass = hardIntegrityScore >= 1;
  const protectedAnchorPass = protectedAnchorIntegrity >= classProtectedAnchorFloor(sourceClass);
  const pathologyPass = !pathologies.severe;
  const rewritePass = rewriteStrength >= classRewriteBar(sourceClass);
  const passed = exactPass && protectedAnchorPass && semanticPass && pathologyPass && rewritePass;
  const score = round(
    (rewriteStrength * 0.56) +
    (targetFit * 0.32) +
    (Number(classification.movementConfidence || 0) * 0.12) -
    ((1 - protectedAnchorIntegrity) * 1.3) -
    (pathologies.flags.length * 0.04),
    4
  );

  const failureReasons = uniqueStrings([
    !exactPass ? 'hard-anchor-failure' : null,
    !protectedAnchorPass ? 'anchor-drift-detected' : null,
    !semanticPass ? 'semantic-failure' : null,
    !pathologyPass ? 'pathology' : null,
    !rewritePass ? 'below-rewrite-bar' : null
  ]);

  return Object.freeze({
    id: variant.id,
    envelopeId: variant.envelopeId,
    shell: variant.shell,
    legacyResult,
    outputText,
    outputProfile,
    changedDimensions,
    lexemeSwaps,
    semanticAudit,
    protectedAnchorAudit,
    witnessAudit,
    apertureReview,
    classification,
    repaired,
    pathologies,
    visibleShift,
    nonTrivialShift,
    rewriteStrength,
    targetFit,
    score,
    passed,
    failureReasons
  });
}

function buildCandidateLedger(candidates = [], landedId = null) {
  return Object.freeze(candidates.map((candidate) => Object.freeze({
    id: candidate.id,
    envelopeId: candidate.envelopeId,
    status: candidate.passed ? (candidate.id === landedId ? 'selected' : 'eligible') : 'held',
    score: candidate.score,
    rewriteStrength: candidate.rewriteStrength,
    targetFit: candidate.targetFit,
    movementConfidence: Number(candidate.classification?.movementConfidence || 0),
    failureReasons: Object.freeze([...(candidate.failureReasons || [])]),
    transferClass: candidate.legacyResult?.transferClass || 'native',
    outputPreview: candidate.outputText.slice(0, 160)
  })));
}

function candidateHoldClass(candidate = null) {
  if (!candidate) {
    return 'below-rewrite-bar';
  }
  if ((candidate.failureReasons || []).includes('pathology')) {
    return 'pathology';
  }
  if ((candidate.failureReasons || []).includes('hard-anchor-failure')) {
    return 'hard-anchor-failure';
  }
  if ((candidate.failureReasons || []).includes('semantic-failure')) {
    return 'semantic-failure';
  }
  return 'below-rewrite-bar';
}

function holdHeadline(holdClass = 'below-rewrite-bar') {
  if (holdClass === 'hard-anchor-failure') {
    return 'Generator V2 hold // exact witness anchors broke under rewrite pressure.';
  }
  if (holdClass === 'semantic-failure') {
    return 'Generator V2 hold // semantic coverage dropped below the class floor.';
  }
  if (holdClass === 'pathology') {
    return 'Generator V2 hold // output collapsed into a render-unsafe form.';
  }
  return 'Generator V2 hold // no candidate cleared the rewrite bar honestly.';
}

function buildLandedTransfer(sourceText = '', shell = {}, options = {}, candidate = null, sourceClass = 'formal-correspondence', candidates = []) {
  const sourceProfile = extractCadenceProfile(sourceText);
  const chosen = candidate || buildCandidate(sourceText, {
    id: 'native',
    envelopeId: inferEnvelopeId(shell, sourceProfile, shell.profile || {}),
    shell
  }, { ...options, sourceClass });
  const legacy = chosen.legacyResult || buildCadenceTransferLegacy(sourceText, shell, options);
  const candidateLedger = buildCandidateLedger(candidates.length ? candidates : [chosen], chosen.id);
  const substantiveMovement = substantiveDimensionCount(chosen.changedDimensions);
  const lexicalMovement = Number((chosen.lexemeSwaps || []).length || 0);
  const transferClass =
    chosen.classification?.outcome === 'surface-held'
      ? 'surface'
      : (
          substantiveMovement >= 2 ||
          (substantiveMovement >= 1 && lexicalMovement > 0) ||
          chosen.rewriteStrength >= 0.5
        )
        ? 'structural'
        : 'weak';
  const realizationTier = deriveRealizationTier(chosen.changedDimensions, chosen.lexemeSwaps);
  const warningSignals = uniqueStrings([
    ...((chosen.apertureReview && chosen.apertureReview.warningSignals) || []),
    ...((chosen.classification && chosen.classification.pathologies) || [])
  ]);
  const repairPasses = uniqueStrings([
    ...((chosen.repaired && chosen.repaired.repairPasses) || []),
    ...((chosen.apertureReview && chosen.apertureReview.repairPasses) || [])
  ]);
  const apertureAudit = buildTD613ApertureAudit({
    generatorFault: false,
    warningSignals,
    repairPasses,
    candidateSuppression: chosen.apertureReview?.candidateSuppression ?? 0,
    observabilityDeficit: chosen.apertureReview?.observabilityDeficit ?? 0,
    aliasPersistence: chosen.apertureReview?.aliasPersistence ?? 0,
    namingSensitivity: chosen.apertureReview?.namingSensitivity ?? 0,
    redundancyInflation: chosen.apertureReview?.redundancyInflation ?? 0,
    capacityPressure: chosen.apertureReview?.capacityPressure ?? 0,
    policyPressure: chosen.apertureReview?.policyPressure ?? 0,
    withheldMaterial: false,
    withheldReason: null
  });
  const generationDocket = Object.freeze({
    status: 'landed',
    holdClass: null,
    headline: 'Generator V2 landed a registered rewrite.',
    reasons: Object.freeze([]),
    candidateCount: candidateLedger.length,
    winningCandidateId: chosen.id
  });
  const retrievalTrace = Object.freeze({
    ...((legacy.retrievalTrace || {})),
    generatorVersion: 'v2',
    sourceClass,
    candidateLedger,
    generationDocket,
    winningCandidateId: chosen.id
  });

  return Object.freeze({
    ...legacy,
    text: chosen.outputText,
    internalText: chosen.outputText,
    sourceProfile,
    targetProfile: legacy.targetProfile || shell.profile || sourceProfile,
    outputProfile: chosen.outputProfile,
    changedDimensions: chosen.changedDimensions,
    lexemeSwaps: chosen.lexemeSwaps,
    passesApplied: uniqueStrings([
      ...(legacy.passesApplied || []),
      `v2-envelope:${chosen.envelopeId || 'generic'}`,
      `v2-candidate:${chosen.id || 'base'}`,
      'v2-registration'
    ]),
    rescuePasses: uniqueStrings([
      ...(legacy.rescuePasses || []),
      ...repairPasses
    ]),
    donorProgress: legacy.donorProgress || {},
    transferClass,
    qualityGatePassed: true,
    notes: uniqueStrings([
      ...(legacy.notes || []),
      ...(chosen.apertureReview?.reasons || []),
      generationDocket.headline
    ]),
    realizationTier,
    semanticRisk: Number(legacy.semanticRisk || 0),
    semanticAudit: chosen.semanticAudit,
    protectedAnchorAudit: chosen.protectedAnchorAudit,
    visibleShift: chosen.visibleShift,
    nonTrivialShift: chosen.nonTrivialShift,
    borrowedShellOutcome:
      transferClass === 'structural'
        ? 'structural'
        : chosen.classification?.outcome === 'surface-held'
          ? 'surface-held'
          : 'partial',
    borrowedShellFailureClass: null,
    apertureAudit,
    apertureProtocol: Object.freeze({
      ...((chosen.apertureReview || {})),
      outcome: chosen.classification?.outcome || 'projected',
      line: chosen.classification?.line || 'Generator V2 landed a registered rewrite.',
      apertureAudit
    }),
    retrievalTrace,
    generatorVersion: 'v2',
    generationDocket,
    candidateLedger,
    holdStatus: 'landed'
  });
}

function buildHeldTransfer(sourceText = '', shell = {}, options = {}, candidates = [], sourceClass = 'formal-correspondence') {
  const sourceProfile = extractCadenceProfile(sourceText);
  const bestCandidate = [...candidates].sort((left, right) => right.score - left.score)[0] || null;
  const holdClass = candidateHoldClass(bestCandidate);
  const headline = holdHeadline(holdClass);
  const reasons = uniqueStrings([
    ...(bestCandidate?.apertureReview?.reasons || []),
    ...(bestCandidate?.failureReasons || [])
  ]);
  const candidateLedger = buildCandidateLedger(candidates, null);
  const apertureAudit = buildTD613ApertureAudit({
    generatorFault: holdClass === 'pathology',
    warningSignals: uniqueStrings([
      ...((bestCandidate?.apertureReview && bestCandidate.apertureReview.warningSignals) || []),
      holdClass
    ]),
    repairPasses: uniqueStrings([
      ...((bestCandidate?.repaired && bestCandidate.repaired.repairPasses) || [])
    ]),
    candidateSuppression: bestCandidate?.apertureReview?.candidateSuppression ?? 0.12,
    observabilityDeficit: bestCandidate?.apertureReview?.observabilityDeficit ?? 0.18,
    aliasPersistence: bestCandidate?.apertureReview?.aliasPersistence ?? 0,
    namingSensitivity: bestCandidate?.apertureReview?.namingSensitivity ?? 0,
    redundancyInflation: bestCandidate?.apertureReview?.redundancyInflation ?? 0.2,
    capacityPressure: bestCandidate?.apertureReview?.capacityPressure ?? 0.24,
    policyPressure: bestCandidate?.apertureReview?.policyPressure ?? 0,
    withheldMaterial: true,
    withheldReason: holdClass
  });
  const generationDocket = Object.freeze({
    status: 'held',
    holdClass,
    headline,
    reasons: Object.freeze(reasons),
    candidateCount: candidateLedger.length,
    winningCandidateId: null
  });
  const retrievalTrace = Object.freeze({
    ...((bestCandidate?.legacyResult && bestCandidate.legacyResult.retrievalTrace) || {}),
    sourceText,
    sourceClass,
    generatorVersion: 'v2',
    candidateLedger,
    generationDocket,
    winningCandidateId: null
  });

  return Object.freeze({
    text: '',
    internalText: bestCandidate?.outputText || sourceText,
    sourceProfile,
    targetProfile: shell.profile || sourceProfile,
    outputProfile: sourceProfile,
    opportunityProfile: bestCandidate?.legacyResult?.opportunityProfile || {},
    changedDimensions: [],
    protectedLiteralCount: Number(bestCandidate?.legacyResult?.protectedLiteralCount || 0),
    passesApplied: [],
    rescuePasses: uniqueStrings([
      ...((bestCandidate?.repaired && bestCandidate.repaired.repairPasses) || [])
    ]),
    donorProgress: bestCandidate?.legacyResult?.donorProgress || {},
    transferClass: 'held',
    qualityGatePassed: false,
    notes: uniqueStrings([headline, ...reasons]),
    effectiveMod: shell.mod || cadenceModFromProfile(shell.profile || sourceProfile),
    realizationTier: 'hold',
    lexicalShiftProfile: bestCandidate?.legacyResult?.lexicalShiftProfile || {
      lexemeSwaps: [],
      swapCount: 0,
      registerDistance: 0,
      contentWordComplexityDelta: 0,
      modifierDensityDelta: 0,
      directnessDelta: 0,
      abstractionDelta: 0,
      contractionAligned: true
    },
    semanticRisk: Number(bestCandidate?.legacyResult?.semanticRisk || 0),
    lexemeSwaps: [],
    realizationNotes: uniqueStrings([
      ...(bestCandidate?.legacyResult?.realizationNotes || []),
      holdClass
    ]),
    borrowedShellOutcome: 'held',
    borrowedShellFailureClass: holdClass,
    visibleShift: false,
    nonTrivialShift: false,
    semanticAudit: bestCandidate?.semanticAudit || {
      propositionCoverage: 1,
      actorCoverage: 1,
      actionCoverage: 1,
      objectCoverage: 1,
      polarityMismatches: 0,
      tenseMismatches: 0,
      protectedAnchorIntegrity: 1
    },
    protectedAnchorAudit: bestCandidate?.protectedAnchorAudit || {
      totalAnchors: 0,
      resolvedAnchors: 0,
      missingAnchors: [],
      protectedAnchorIntegrity: 1
    },
    apertureAudit,
    apertureProtocol: Object.freeze({
      outcome: 'generator-hold',
      line: headline,
      apertureAudit
    }),
    retrievalTrace,
    generatorVersion: 'v2',
    generationDocket,
    candidateLedger,
    holdStatus: 'held'
  });
}

export function buildCadenceTransferV2(text = '', shell = {}, options = {}) {
  const sourceText = normalizeText(text);
  if (
    !sourceText ||
    shell?.mode === 'native' ||
    shell?.mode === 'synthetic' ||
    ((!shell?.mod?.sent && !shell?.mod?.cont && !shell?.mod?.punc) && !shell?.profile)
  ) {
    const result = buildCadenceTransferLegacy(text, shell, options);
    const generationDocket = Object.freeze({
      status: 'landed',
      holdClass: null,
      headline: shell?.mode === 'native' ? 'Generator V2 stayed native.' : 'Generator V2 stayed on source cadence.',
      reasons: Object.freeze([]),
      candidateCount: 1,
      winningCandidateId: 'native'
    });
    return Object.freeze({
      ...result,
      generatorVersion: 'v2',
      generationDocket,
      candidateLedger: Object.freeze([
        Object.freeze({
          id: 'native',
          envelopeId: 'generic',
          status: 'selected',
          score: 1,
          rewriteStrength: 0,
          targetFit: 1,
          movementConfidence: 0,
          failureReasons: Object.freeze([]),
          transferClass: result.transferClass || 'native',
          outputPreview: String(result.text || '').slice(0, 160)
        })
      ]),
      holdStatus: 'landed',
      retrievalTrace: options?.retrieval || result.retrievalTrace
        ? Object.freeze({
            ...(result.retrievalTrace || {}),
            generatorVersion: 'v2',
            generationDocket
          })
        : result.retrievalTrace
    });
  }

  const sourceClass = classifyV2SourceClass(sourceText);
  const sourceProfile = extractCadenceProfile(sourceText);
  const variants = buildShellVariants(sourceProfile, shell, sourceClass);
  const candidates = variants.map((variant) => buildCandidate(sourceText, variant, {
    ...options,
    sourceClass,
    sourceProfile
  }));
  const selected = [...candidates]
    .filter((candidate) => candidate.passed)
    .sort((left, right) => right.score - left.score || right.rewriteStrength - left.rewriteStrength)[0] || null;

  if (!selected) {
    return buildHeldTransfer(sourceText, shell, options, candidates, sourceClass);
  }

  return buildLandedTransfer(sourceText, shell, options, selected, sourceClass, candidates);
}

export function buildCadenceTransferTraceV2(text = '', shell = {}, options = {}) {
  return buildCadenceTransferV2(text, shell, {
    ...options,
    retrieval: true
  }).retrievalTrace;
}

export function applyCadenceToTextV2(text = '', shell = {}) {
  return buildCadenceTransferV2(text, shell).text;
}
