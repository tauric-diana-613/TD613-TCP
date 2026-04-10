import {
  auditTD613ApertureWitnessAnchors,
  buildTD613ApertureAudit,
  classifyTD613ApertureProjection,
  detectTD613ApertureTextPathologies,
  reviewTD613ApertureTransfer
} from './td613-aperture.js';
import {
  buildBorrowedShellDonorProgress,
  buildSemanticAuditBundle,
  buildOpportunityProfileFromIR,
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

function escapeRegex(value = '') {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractHardAnchors(text = '') {
  const normalized = normalizeText(text);
  const anchors = new Set();
  const quoted = normalized.match(/"[^"\n]{1,120}"/g) || [];
  quoted.forEach((entry) => anchors.add(entry));
  const clockTimes = normalized.match(/\b\d{1,2}:\d{2}(?:\s?(?:AM|PM))?\b/gi) || [];
  clockTimes.forEach((entry) => anchors.add(entry));
  const ids = normalized.match(/\b[A-Z]{1,6}-\d{1,6}[A-Z]?\b/g) || [];
  ids.forEach((entry) => anchors.add(entry));
  const emails = normalized.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi) || [];
  emails.forEach((entry) => anchors.add(entry));
  const suiteLike = normalized.match(/\b(?:Door|Unit|Suite)\s+[A-Z0-9-]+\b/g) || [];
  suiteLike.forEach((entry) => anchors.add(entry));
  const honorificNames = normalized.match(/\b(?:Mr|Ms|Mrs|Dr|Prof)\.\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g) || [];
  honorificNames.forEach((entry) => anchors.add(entry));
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
    .replace(/,((?:["')\]])?)\s+(?=(?:and|but|because|while|with|which)\b)/gi, (match, closer = '') => `.${closer} `)
    .replace(/;\s+/g, '. ')
    .replace(/:\s+(?=[A-Za-z])/g, '. ');
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

function sanitizeV2Surface(text = '', { preserveLowercaseLeads = false } = {}) {
  let working = tidyEnvelopeText(text)
    .replace(/\.\s*,/g, '. ')
    .replace(/,\s*\./g, '. ')
    .replace(/;\s+;/g, '; ')
    .replace(/\bnot ([^.!?]{3,120}?)\.\s+but\b/gi, 'not $1, but')
    .replace(/\bYet\s+twirl\b/gi, 'The twirl')
    .replace(/\bYet\s+two\b/gi, 'Then two')
    .replace(/\bYet\s+the\b/gi, 'Then the')
    .replace(/\bYet\s+it\b/gi, 'Then it');
  if (!preserveLowercaseLeads) {
    working = working.replace(/([.!?]\s+)([a-z])/g, (match, spacing, letter) => `${spacing}${letter.toUpperCase()}`);
  }
  return normalizeText(
    working.replace(/\s{2,}/g, ' ')
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

  if (envelopeId === 'spark' || envelopeId === 'cross-examiner') {
    working = sentences.map((sentence) => splitForClippedMomentum(sentence)).join(' ');
    if ((targetProfile.contractionDensity || 0) >= 0.08 || envelopeId === 'spark') {
      working = contractExpansions(working);
    }
  } else if (envelopeId === 'operator') {
    working = sentences.map((sentence) => splitForClippedMomentum(sentence)).join(' ');
    working = expandContractions(working)
      .replace(/!/g, '.')
      .replace(/,\s+and\b/gi, '; ')
      .replace(/\.\s+And\b/g, '. ');
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
    ((fit.abbreviationDistance || 0) * 0.9) +
    ((fit.orthographyDistance || 0) * 0.9) +
    ((fit.fragmentDistance || 0) * 0.5) +
    ((fit.conversationDistance || 0) * 0.5) +
    ((fit.surfaceMarkerDistance || 0) * 0.7) +
    (fit.registerDistance || 0) +
    (fit.directnessDistance || 0) +
    (fit.abstractionDistance || 0);
  return round(clamp01(1 - (distance / 5.8)), 4);
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

const NATIVE_CANDIDATE_FAMILIES = Object.freeze([
  Object.freeze({ id: 'syntax-shape', label: 'syntax-shape' }),
  Object.freeze({ id: 'register-lexicon', label: 'register-lexicon' }),
  Object.freeze({ id: 'cadence-connector', label: 'cadence-connector' }),
  Object.freeze({ id: 'order-beat', label: 'order-beat' }),
  Object.freeze({ id: 'hybrid', label: 'hybrid' })
]);

function splitParagraphs(text = '') {
  return normalizeText(text)
    .split(/\n{2,}/)
    .map((entry) => normalizeText(entry))
    .filter(Boolean);
}

function joinParagraphs(paragraphs = []) {
  return (paragraphs || [])
    .map((entry) => normalizeText(entry))
    .filter(Boolean)
    .join('\n\n');
}

function protectAnchorsForRewrite(text = '', anchors = []) {
  let working = String(text || '');
  const replacements = [];
  [...(anchors || [])]
    .map((anchor) => String(anchor || '').trim())
    .filter(Boolean)
    .sort((left, right) => right.length - left.length)
    .forEach((anchor) => {
      const pattern = new RegExp(escapeRegex(anchor), 'g');
      if (!pattern.test(working)) {
        return;
      }
      const token = `__TD613ANCHOR_${replacements.length}__`;
      working = working.replace(pattern, token);
      replacements.push(Object.freeze({ token, value: anchor }));
    });

  return Object.freeze({
    text: working,
    replacements: Object.freeze(replacements)
  });
}

function restoreAnchorsAfterRewrite(text = '', replacements = []) {
  let working = String(text || '');
  for (const replacement of replacements || []) {
    if (!replacement?.token) {
      continue;
    }
    working = working.replace(new RegExp(escapeRegex(replacement.token), 'g'), replacement.value || '');
  }
  return working;
}

function lowerLeadingAlpha(text = '') {
  return String(text || '').replace(/^[A-Z](?=[a-z])/g, (match) => match.toLowerCase());
}

function trimSentenceEnding(text = '') {
  return normalizeText(text).replace(/[.!?]+$/g, '').trim();
}

function finalizeSentence(text = '', punctuation = '.') {
  const trimmed = trimSentenceEnding(text);
  return trimmed ? `${trimmed}${punctuation}` : '';
}

function replaceLimited(text = '', pattern, replacer, limit = 1) {
  if (limit <= 0) {
    return text;
  }

  let count = 0;
  return String(text || '').replace(pattern, (...args) => {
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

function variantIntensity(variant = {}) {
  if (variant?.id === 'contrast') {
    return 1.22;
  }
  if (variant?.id === 'amplified') {
    return 1.08;
  }
  if (variant?.id === 'conservative') {
    return 0.84;
  }
  return 1;
}

function familyWeight(familyId = 'syntax-shape') {
  if (familyId === 'hybrid') {
    return 1.18;
  }
  if (familyId === 'order-beat') {
    return 1.08;
  }
  if (familyId === 'register-lexicon') {
    return 0.94;
  }
  return 1;
}

function replacementLimitForClass(sourceClass = 'formal-correspondence') {
  if (sourceClass === 'procedural-record') {
    return 1;
  }
  if (sourceClass === 'formal-correspondence') {
    return 2;
  }
  return 3;
}

function connectorStrategyFor(envelopeId = 'generic', sourceClass = 'formal-correspondence', familyId = 'syntax-shape') {
  if (familyId === 'order-beat') {
    return 'front';
  }
  if (envelopeId === 'spark') {
    return 'split';
  }
  if (envelopeId === 'cross-examiner') {
    return 'cross';
  }
  if (envelopeId === 'operator') {
    return 'balanced';
  }
  if (envelopeId === 'matron') {
    return 'cascade';
  }
  if (envelopeId === 'undertow') {
    return 'undertow';
  }
  if (envelopeId === 'archivist' || envelopeId === 'methods-editor') {
    return 'ledger';
  }
  if (sourceClass === 'procedural-record') {
    return 'balanced';
  }
  return familyId === 'cadence-connector' ? 'shift' : 'balanced';
}

function contractionStrategyFor(envelopeId = 'generic', targetProfile = null, sourceProfile = {}, sourceClass = 'formal-correspondence', familyId = 'syntax-shape') {
  if (envelopeId === 'matron' || envelopeId === 'archivist' || envelopeId === 'methods-editor') {
    return 'expand';
  }
  if (envelopeId === 'spark' || envelopeId === 'cross-examiner') {
    return 'contract';
  }
  if (envelopeId === 'operator') {
    return 'preserve';
  }
  if (envelopeId === 'undertow') {
    return sourceClass === 'procedural-record'
      ? 'preserve'
      : ((targetProfile?.contractionDensity || 0) <= (sourceProfile?.contractionDensity || 0) ? 'expand' : 'contract');
  }
  if (Number(targetProfile?.contractionDensity || 0) >= Number(sourceProfile?.contractionDensity || 0) + 0.01) {
    return 'contract';
  }
  if (Number(targetProfile?.contractionDensity || 0) <= Number(sourceProfile?.contractionDensity || 0) - 0.01) {
    return 'expand';
  }
  if (familyId === 'register-lexicon' && sourceClass !== 'procedural-record') {
    return 'contract';
  }
  return 'preserve';
}

function chooseMergeLinker(envelopeId = 'generic', sourceClass = 'formal-correspondence') {
  if (envelopeId === 'matron') {
    return sourceClass === 'procedural-record' ? '; ' : ', and ';
  }
  if (envelopeId === 'undertow') {
    return sourceClass === 'procedural-record' ? '; while ' : ', while ';
  }
  if (envelopeId === 'archivist' || envelopeId === 'methods-editor') {
    return '; ';
  }
  if (envelopeId === 'spark' || envelopeId === 'cross-examiner') {
    return '. ';
  }
  if (envelopeId === 'operator') {
    return '; ';
  }
  return sourceClass === 'procedural-record' ? '; ' : ', and ';
}

function recordLexemeSwap(swaps = [], from = '', to = '', family = 'register') {
  const source = normalizeText(from);
  const target = normalizeText(to);
  if (!source || !target || normalizeComparable(source) === normalizeComparable(target)) {
    return;
  }
  swaps.push(Object.freeze({
    from: source,
    to: target,
    family
  }));
}

function applyReplacementRule(text = '', pattern, replacement = '', context = {}) {
  let applied = false;
  const next = replaceLimited(
    text,
    pattern,
    (match) => {
      applied = true;
      const finalReplacement = matchCase(match, replacement);
      if (context.label) {
        (context.operations || []).push(context.label);
      }
      recordLexemeSwap(context.lexemeSwaps || [], match, finalReplacement, context.family || 'register');
      return finalReplacement;
    },
    context.limit ?? 1
  );
  return applied ? next : text;
}

function applyContractionStrategyText(text = '', strategy = 'preserve', context = {}) {
  let working = String(text || '');
  if (strategy === 'contract') {
    const next = contractExpansions(working);
    if (next !== working) {
      (context.lexicalOperations || []).push('contraction:contract');
      working = next;
    }
  } else if (strategy === 'expand') {
    const next = expandContractions(working);
    if (next !== working) {
      (context.lexicalOperations || []).push('contraction:expand');
      working = next;
    }
  }
  return working;
}

function wantsCompressedSurface(targetProfile = {}, sourceProfile = {}) {
  return Number(targetProfile?.abbreviationDensity || 0) > (Number(sourceProfile?.abbreviationDensity || 0) + 0.03) ||
    Number(targetProfile?.orthographicLooseness || 0) > (Number(sourceProfile?.orthographicLooseness || 0) + 0.04);
}

function wantsExpandedSurface(targetProfile = {}, sourceProfile = {}) {
  const targetMode = String(targetProfile?.registerMode || '').trim().toLowerCase();
  return Number(targetProfile?.abbreviationDensity || 0) + Number(targetProfile?.orthographicLooseness || 0) + 0.03 <
      (Number(sourceProfile?.abbreviationDensity || 0) + Number(sourceProfile?.orthographicLooseness || 0)) ||
    Number(targetProfile?.orthographicLooseness || 0) + 0.04 < Number(sourceProfile?.orthographicLooseness || 0) ||
    ['formal', 'reflective'].includes(targetMode);
}

function loosenSentenceStartsV2(text = '', limit = 2) {
  let applied = 0;
  return String(text || '').replace(/(^|[.!?]\s+|\n+)([A-Z][a-z]+)/g, (match, prefix, word) => {
    if (applied >= limit || /^I(?:\b|$)/.test(word)) {
      return match;
    }
    applied += 1;
    return `${prefix}${word.charAt(0).toLowerCase()}${word.slice(1)}`;
  });
}

function applyCompressedSurfaceRewrite(text = '', targetProfile = {}, sourceProfile = {}, context = {}) {
  if (!wantsCompressedSurface(targetProfile, sourceProfile)) {
    return text;
  }

  let working = String(text || '');
  const lexicalOperations = context.lexicalOperations || [];
  const lexemeSwaps = context.lexemeSwaps || [];
  const abbreviationLimit = Number(targetProfile?.abbreviationDensity || 0) >= 0.11 ? 4 : 2;
  const orthographyHeavy =
    Number(targetProfile?.orthographicLooseness || 0) >= Math.max(0.06, Number(sourceProfile?.orthographicLooseness || 0) + 0.04);

  const abbreviationRules = [
    { pattern: /\bplease\b/gi, replacement: 'pls', label: 'compressed:please->pls' },
    { pattern: /\bbecause\b/gi, replacement: 'bc', label: 'compressed:because->bc' },
    { pattern: /\bokay\b/gi, replacement: 'ok', label: 'compressed:okay->ok' },
    { pattern: /\bdocumentation timing\b/gi, replacement: 'docs lag', label: 'compressed:documentation-timing->docs-lag' },
    { pattern: /\bdocumentation\b/gi, replacement: 'docs', label: 'compressed:documentation->docs' },
    { pattern: /\bpeople\b/gi, replacement: 'ppl', label: 'compressed:people->ppl' },
    { pattern: /\bdifferent\b/gi, replacement: 'diff', label: 'compressed:different->diff' },
    { pattern: /\bwritten record\b/gi, replacement: 'writeup', label: 'compressed:written-record->writeup' },
    { pattern: /\bmanagement\b/gi, replacement: 'mgmt', label: 'compressed:management->mgmt' },
    { pattern: /\baccount\b/gi, replacement: 'acct', label: 'compressed:account->acct' },
    { pattern: /\bpackage\b/gi, replacement: 'pkg', label: 'compressed:package->pkg' },
    { pattern: /\bappointment\b/gi, replacement: 'appt', label: 'compressed:appointment->appt' },
    { pattern: /\bmessage\b/gi, replacement: 'msg', label: 'compressed:message->msg' },
    { pattern: /\bweek\b/gi, replacement: 'wk', label: 'compressed:week->wk' }
  ];

  for (const rule of abbreviationRules) {
    const next = replaceLimited(working, rule.pattern, (match) => {
      lexicalOperations.push(rule.label);
      recordLexemeSwap(lexemeSwaps, match, rule.replacement, 'surface');
      return rule.replacement;
    }, abbreviationLimit);
    working = next;
  }

  if (orthographyHeavy) {
    const orthographyRules = [
      { pattern: /\byou['’]re\b/gi, replacement: 'youre', label: 'orthography:youre' },
      { pattern: /\bdon['’]t\b/gi, replacement: 'dont', label: 'orthography:dont' },
      { pattern: /\bcan['’]t\b/gi, replacement: 'cant', label: 'orthography:cant' },
      { pattern: /\bwon['’]t\b/gi, replacement: 'wont', label: 'orthography:wont' },
      { pattern: /\bI['’]m\b/gi, replacement: 'im', label: 'orthography:im' },
      { pattern: /\bI['’]ve\b/gi, replacement: 'ive', label: 'orthography:ive' },
      { pattern: /\bI['’]ll\b/gi, replacement: 'ill', label: 'orthography:ill' },
      { pattern: /\bthat['’]s\b/gi, replacement: 'thats', label: 'orthography:thats' },
      { pattern: /\bit['’]s\b/gi, replacement: 'its', label: 'orthography:its' }
    ];
    const orthographyLimit = Number(targetProfile?.orthographicLooseness || 0) >= 0.4 ? 6 : (Number(targetProfile?.orthographicLooseness || 0) >= 0.09 ? 4 : 2);
    for (const rule of orthographyRules) {
      const next = replaceLimited(working, rule.pattern, (match) => {
        lexicalOperations.push(rule.label);
        recordLexemeSwap(lexemeSwaps, match, rule.replacement, 'surface');
        return rule.replacement;
      }, orthographyLimit);
      working = next;
    }
    const lowercaseLeadLimit = Number(targetProfile?.orthographicLooseness || 0) >= 0.6 ? 6 : (Number(targetProfile?.orthographicLooseness || 0) >= 0.2 ? 4 : 2);
    const lowered = loosenSentenceStartsV2(working, lowercaseLeadLimit);
    if (lowered !== working) {
      lexicalOperations.push('orthography:lowercase-lead');
      working = lowered;
    }
  }

  return working;
}

function applyExpandedSurfaceRewrite(text = '', targetProfile = {}, sourceProfile = {}, context = {}) {
  if (!wantsExpandedSurface(targetProfile, sourceProfile)) {
    return text;
  }

  let working = String(text || '');
  const lexicalOperations = context.lexicalOperations || [];
  const lexemeSwaps = context.lexemeSwaps || [];
  const limit = Number(sourceProfile?.orthographicLooseness || 0) >= 0.4 ? 6 : 3;
  const expansionRules = [
    { pattern: /\bpls\b/gi, replacement: 'please', label: 'expanded:pls->please' },
    { pattern: /\bbc\b/gi, replacement: 'because', label: 'expanded:bc->because' },
    { pattern: /\bdocs lag\b/gi, replacement: 'documentation timing', label: 'expanded:docs-lag->documentation-timing' },
    { pattern: /\bppl\b/gi, replacement: 'people', label: 'expanded:ppl->people' },
    { pattern: /\bdocs\b/gi, replacement: 'documentation', label: 'expanded:docs->documentation' },
    { pattern: /\bdiff\b/gi, replacement: 'different', label: 'expanded:diff->different' },
    { pattern: /\bwriteup\b/gi, replacement: 'written record', label: 'expanded:writeup->written-record' },
    { pattern: /\bmsg\b/gi, replacement: 'message', label: 'expanded:msg->message' },
    { pattern: /\bwks\b/gi, replacement: 'weeks', label: 'expanded:wks->weeks' },
    { pattern: /\bwk\b/gi, replacement: 'week', label: 'expanded:wk->week' }
  ];

  for (const rule of expansionRules) {
    working = replaceLimited(working, rule.pattern, (match) => {
      lexicalOperations.push(rule.label);
      recordLexemeSwap(lexemeSwaps, match, rule.replacement, 'surface');
      return matchCase(match, rule.replacement);
    }, limit);
  }

  working = replaceLimited(working, /\bw\/o\b/gi, (match) => {
    lexicalOperations.push('expanded:w/o->without');
    recordLexemeSwap(lexemeSwaps, match, 'without', 'surface');
    return matchCase(match, 'without');
  }, 2);
  working = replaceLimited(working, /\bw\/\b/gi, (match) => {
    lexicalOperations.push('expanded:w/->with');
    recordLexemeSwap(lexemeSwaps, match, 'with', 'surface');
    return matchCase(match, 'with');
  }, 2);
  working = replaceLimited(working, /\bw\b(?=\s+[A-Za-z])/g, (match) => {
    lexicalOperations.push('expanded:w->with');
    recordLexemeSwap(lexemeSwaps, match, 'with', 'surface');
    return 'with';
  }, 2);

  const contractionRules = [
    { pattern: /\bdont\b/gi, replacement: 'do not', label: 'expanded:dont->do-not' },
    { pattern: /\byoure\b/gi, replacement: 'you are', label: 'expanded:youre->you-are' },
    { pattern: /\bim\b/gi, replacement: 'I am', label: 'expanded:im->i-am' },
    { pattern: /\bive\b/gi, replacement: 'I have', label: 'expanded:ive->i-have' },
    { pattern: /\bill\b/gi, replacement: 'I will', label: 'expanded:ill->i-will' },
    { pattern: /\bthats\b/gi, replacement: 'that is', label: 'expanded:thats->that-is' },
    { pattern: /\bits\b/gi, replacement: 'it is', label: 'expanded:its->it-is' },
    { pattern: /\bcant\b/gi, replacement: 'cannot', label: 'expanded:cant->cannot' },
    { pattern: /\bwont\b/gi, replacement: 'will not', label: 'expanded:wont->will-not' }
  ];

  for (const rule of contractionRules) {
    working = replaceLimited(working, rule.pattern, (match) => {
      lexicalOperations.push(rule.label);
      recordLexemeSwap(lexemeSwaps, match, rule.replacement, 'surface');
      return matchCase(match, rule.replacement);
    }, limit);
  }

  const unlisted = working
    .replace(/\s*\/\s*/g, '. ')
    .replace(/:\s+/g, '. ');
  if (unlisted !== working) {
    lexicalOperations.push('expanded:slash-list->sentences');
    working = unlisted;
  }

  if (context.sourceClass === 'procedural-record') {
    const proceduralRules = [
      { pattern: /\bwest annex d3\b/gi, replacement: 'West Annex Door 3', label: 'expanded:west-annex-d3->door-3' },
      { pattern: /\bd3\b/gi, replacement: 'Door 3', label: 'expanded:d3->door-3' },
      { pattern: /\bfake open\b/gi, replacement: 'not actually unlatching', label: 'expanded:fake-open->unlatching' },
      { pattern: /\bgreen \+ buzzes\b/gi, replacement: 'green and buzzing', label: 'expanded:green-plus-buzzes->green-and-buzzing' },
      { pattern: /\bfridge meds\b/gi, replacement: 'cold bag', label: 'expanded:fridge-meds->cold-bag' },
      { pattern: /\bold temp badge\b/gi, replacement: 'older temporary badge', label: 'expanded:old-temp-badge->older-temporary-badge' },
      { pattern: /\btemp badge\b/gi, replacement: 'temporary badge', label: 'expanded:temp-badge->temporary-badge' },
      { pattern: /\bnot power i do not think\b/gi, replacement: 'I do not think it is power', label: 'expanded:not-power->i-do-not-think-it-is-power' },
      { pattern: /\bjiggle latch again\b/gi, replacement: 'physically check the latch again', label: 'expanded:jiggle-latch->physically-check-latch' }
    ];

    for (const rule of proceduralRules) {
      working = replaceLimited(working, rule.pattern, (match) => {
        lexicalOperations.push(rule.label);
        recordLexemeSwap(lexemeSwaps, match, rule.replacement, 'surface');
        return rule.replacement;
      }, 2);
    }
  }

  return working;
}

function frontClauseSentence(sentence = '', context = {}) {
  const normalized = normalizeText(sentence);
  const patterns = [
    { regex: /^(.+?)\s+because\s+(.+)$/i, label: 'front-because', lead: 'Because' },
    { regex: /^(.+?)\s+while\s+(.+)$/i, label: 'front-while', lead: 'While' },
    { regex: /^(.+?)\s+if\s+(.+)$/i, label: 'front-if', lead: 'If' },
    { regex: /^(.+?)\s+when\s+(.+)$/i, label: 'front-when', lead: 'When' },
    { regex: /^(.+?)\s+although\s+(.+)$/i, label: 'front-although', lead: 'Although' }
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern.regex);
    if (!match) {
      continue;
    }
    const left = trimSentenceEnding(match[1]);
    const right = trimSentenceEnding(match[2]);
    if (sentenceWordCount(left) < 3 || sentenceWordCount(right) < 3) {
      continue;
    }
    (context.structuralOperations || []).push(pattern.label);
    return finalizeSentence(`${pattern.lead} ${lowerLeadingAlpha(right)}, ${lowerLeadingAlpha(left)}`);
  }

  return normalized;
}

function applySyntaxShapeRewrite(paragraph = '', envelopeId = 'generic', sourceClass = 'formal-correspondence', context = {}) {
  const sentences = splitSentencesPreserve(paragraph);
  if (!sentences.length) {
    return paragraph;
  }

  if (['spark', 'cross-examiner', 'operator'].includes(envelopeId)) {
    return sentences.map((sentence) => {
      const next = splitForClippedMomentum(sentence);
      if (next !== sentence) {
        (context.structuralOperations || []).push('split-long-line');
      }
      return next;
    }).join(' ');
  }

  if (['matron', 'undertow', 'archivist', 'methods-editor'].includes(envelopeId)) {
    const merged = mergeForLongCurrent(sentences, chooseMergeLinker(envelopeId, sourceClass));
    if (merged.length !== sentences.length) {
      (context.structuralOperations || []).push(envelopeId === 'archivist' || envelopeId === 'methods-editor' ? 'ledger-merge' : 'merge-short-beats');
    }
    return merged.join(' ');
  }

  return sentences.map((sentence) => frontClauseSentence(sentence, context)).join(' ');
}

function applyLexicalRegisterRewrite(paragraph = '', envelopeId = 'generic', sourceClass = 'formal-correspondence', context = {}) {
  let working = String(paragraph || '');
  const limit = replacementLimitForClass(sourceClass);
  const compressedTarget = wantsCompressedSurface(context.targetProfile || {}, context.sourceProfile || {});

  if (envelopeId === 'spark' || envelopeId === 'operator') {
    working = applyReplacementRule(working, /\bperhaps\b/gi, 'maybe', {
      limit,
      label: 'register:perhaps->maybe',
      family: 'register',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
    working = working.replace(/\b(?:honestly|really|literally)\b[,\s]*/i, (match) => {
      (context.lexicalOperations || []).push('register:trim-filler');
      recordLexemeSwap(context.lexemeSwaps || [], match.trim(), '', 'register');
      return '';
    });
    if (envelopeId === 'operator') {
      working = applyReplacementRule(working, /\bjust\b/gi, 'only', {
        limit: 1,
        label: 'register:just->only',
        family: 'register',
        operations: context.lexicalOperations,
        lexemeSwaps: context.lexemeSwaps
      });
    }
  } else if (envelopeId === 'cross-examiner') {
    working = applyReplacementRule(working, /\bmaybe\b/gi, 'perhaps', {
      limit,
      label: 'register:maybe->perhaps',
      family: 'register',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
  } else if (envelopeId === 'archivist' || envelopeId === 'methods-editor') {
    working = applyReplacementRule(working, /\bokay\b/gi, 'acceptable', {
      limit,
      label: 'register:okay->acceptable',
      family: 'register',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
    working = applyReplacementRule(working, /\bhi\b/gi, 'hello', {
      limit: sourceClass === 'procedural-record' ? 0 : 1,
      label: 'register:hi->hello',
      family: 'register',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
  } else if (envelopeId === 'matron') {
    working = applyReplacementRule(working, /\bmaybe\b/gi, 'perhaps', {
      limit: 1,
      label: 'register:maybe->perhaps',
      family: 'register',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
  }

  if (compressedTarget && sourceClass !== 'procedural-record') {
    const compressedRules = [
      { pattern: /\bI want to\b/gi, replacement: 'need to', label: 'register:i-want-to->need-to' },
      { pattern: /\bI do not want to\b/gi, replacement: "I don't want to", label: 'register:i-do-not-want-to->i-dont-want-to' },
      { pattern: /\bwe still have\b/gi, replacement: 'still have', label: 'register:we-still-have->still-have' },
      { pattern: /\btemporary\b/gi, replacement: 'temp', label: 'register:temporary->temp' },
      { pattern: /\bapproximately\b/gi, replacement: 'about', label: 'register:approximately->about' },
      { pattern: /\bthose are not\b/gi, replacement: 'not', label: 'register:those-are-not->not' }
    ];
    for (const rule of compressedRules) {
      working = applyReplacementRule(working, rule.pattern, rule.replacement, {
        limit,
        label: rule.label,
        family: 'register',
        operations: context.lexicalOperations,
        lexemeSwaps: context.lexemeSwaps
      });
    }
    const clauseCompression = working
      .replace(/\bwhat ([^.!?]{6,120}?) showed is that\b/gi, (match, subject) => {
        (context.structuralOperations || []).push('register:what-showed-colon');
        return `what ${subject} showed:`;
      })
      .replace(/\bwhich is technically true\b/gi, 'technically true')
      .replace(/\bthey are\s+([a-z][^.!?]{2,80}[.!?])/gi, (match, remainder) => {
        (context.lexicalOperations || []).push('register:drop-they-are');
        return matchCase(remainder, remainder);
      });
    if (clauseCompression !== working) {
      (context.lexicalOperations || []).push('register:compressed-clause');
      working = clauseCompression;
    }
  }

  if (compressedTarget && sourceClass === 'procedural-record') {
    const proceduralCompressionRules = [
      { pattern: /\bapproximately\b/gi, replacement: 'about', label: 'register:approximately->about' },
      { pattern: /\blocated\b/gi, replacement: 'found', label: 'register:located->found' },
      { pattern: /\brequested\b/gi, replacement: 'asked for', label: 'register:requested->asked-for' },
      { pattern: /\bremained\b/gi, replacement: 'stayed', label: 'register:remained->stayed' }
    ];
    for (const rule of proceduralCompressionRules) {
      working = applyReplacementRule(working, rule.pattern, rule.replacement, {
        limit: 1,
        label: rule.label,
        family: 'register',
        operations: context.lexicalOperations,
        lexemeSwaps: context.lexemeSwaps
      });
    }
  }

  if (sourceClass !== 'procedural-record') {
    working = applyReplacementRule(working, /\bBy the time\b/gi, 'When', {
      limit: 1,
      label: 'register:by-the-time->when',
      family: 'register',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
    working = applyReplacementRule(working, /\bwhich is apparently what I do\b/gi, "that's what I do", {
      limit: 1,
      label: 'register:which-is-apparently-what-i-do->that-is-what-i-do',
      family: 'register',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
  }

  return working;
}

function applyConnectorRewrite(paragraph = '', envelopeId = 'generic', sourceClass = 'formal-correspondence', context = {}) {
  let working = String(paragraph || '');
  const limit = replacementLimitForClass(sourceClass);
  const strategy = context.connectorStrategy || 'balanced';

  if (strategy === 'split' || strategy === 'cross') {
    const next = working
      .replace(/,((?:["')\]])?)\s+(?=(?:and|but|because|while|which)\b)/gi, (match, closer = '') => `.${closer} `)
      .replace(/;\s+/g, '. ');
    if (next !== working) {
      (context.structuralOperations || []).push('connector-split');
      working = next;
    }
  }

  if (strategy === 'cascade') {
    const merged = mergeForLongCurrent(splitSentencesPreserve(working), chooseMergeLinker(envelopeId, sourceClass)).join(' ');
    if (merged !== working) {
      (context.structuralOperations || []).push('connector-cascade');
      working = merged;
    }
  }

  if (strategy === 'undertow') {
    const merged = mergeForLongCurrent(splitSentencesPreserve(working), chooseMergeLinker(envelopeId, sourceClass)).join(' ');
    if (merged !== working) {
      (context.structuralOperations || []).push('connector-undertow');
      working = merged;
    }
  }

  if (strategy === 'ledger') {
    const next = working
      .replace(/,\s+and\b/gi, '; ')
      .replace(/\.\s+And\b/g, '; ');
    if (next !== working) {
      (context.structuralOperations || []).push('connector-ledger');
      working = next;
    }
  }

  if (strategy === 'split') {
    working = applyReplacementRule(working, /\bbecause\b/gi, sourceClass === 'procedural-record' ? 'because' : 'since', {
      limit,
      label: 'connector:because->since',
      family: 'connector',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
  } else if (strategy === 'shift') {
    working = applyReplacementRule(working, /\bbecause\b/gi, 'since', {
      limit: 1,
      label: 'connector:because->since',
      family: 'connector',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
    working = applyReplacementRule(working, /\bbut\b/gi, 'though', {
      limit: 1,
      label: 'connector:but->though',
      family: 'connector',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
    working = applyReplacementRule(working, /\bso\b/gi, 'then', {
      limit: 1,
      label: 'connector:so->then',
      family: 'connector',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
  } else if (strategy === 'cross') {
    working = applyReplacementRule(working, /\bbut\b/gi, 'yet', {
      limit,
      label: 'connector:but->yet',
      family: 'connector',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
  } else if (strategy === 'ledger') {
    working = applyReplacementRule(working, /\bbecause\b/gi, 'as', {
      limit,
      label: 'connector:because->as',
      family: 'connector',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
  } else if (strategy === 'undertow') {
    working = applyReplacementRule(working, /\bbut\b/gi, 'but then', {
      limit: 1,
      label: 'connector:but->but-then',
      family: 'connector',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
  }

  return working;
}

function applyOrderBeatRewrite(paragraph = '', envelopeId = 'generic', sourceClass = 'formal-correspondence', context = {}) {
  const sentences = splitSentencesPreserve(paragraph);
  if (!sentences.length) {
    return paragraph;
  }

  let workingSentences = sentences.map((sentence) => frontClauseSentence(sentence, context));
  if (workingSentences.length >= 2 && ['spark', 'cross-examiner'].includes(envelopeId)) {
    const first = sentenceWordCount(workingSentences[0]);
    const second = sentenceWordCount(workingSentences[1]);
    if (first > 12 && second <= 8) {
      workingSentences = [workingSentences[1], workingSentences[0], ...workingSentences.slice(2)];
      (context.structuralOperations || []).push('beat-swap');
    }
  } else if (workingSentences.length >= 2 && ['matron', 'undertow'].includes(envelopeId) && sourceClass !== 'procedural-record') {
    const merged = mergeForLongCurrent(workingSentences, chooseMergeLinker(envelopeId, sourceClass));
    if (merged.length !== workingSentences.length) {
      workingSentences = merged;
      (context.structuralOperations || []).push('beat-merge');
    }
  }

  return workingSentences.join(' ');
}

function applyHybridBalance(paragraph = '', envelopeId = 'generic', sourceClass = 'formal-correspondence', context = {}) {
  let working = applySyntaxShapeRewrite(paragraph, envelopeId, sourceClass, context);
  working = applyConnectorRewrite(working, envelopeId, sourceClass, context);
  working = applyOrderBeatRewrite(working, envelopeId, sourceClass, context);
  return applyLexicalRegisterRewrite(working, envelopeId, sourceClass, context);
}

function dedupeLexemeSwaps(swaps = []) {
  const seen = new Set();
  return Object.freeze((swaps || []).filter((swap) => {
    const key = `${normalizeComparable(swap?.from || '')}::${normalizeComparable(swap?.to || '')}::${swap?.family || 'register'}`;
    if (!swap?.from || !swap?.to || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  }));
}

function buildRelationInventory(sourceText = '', sourceIR = null, sourceClass = 'formal-correspondence', hardAnchors = []) {
  return Object.freeze({
    sourceClass,
    paragraphCount: splitParagraphs(sourceText).length || 1,
    sentenceCount: Number(sourceIR?.metadata?.sentenceCount || splitSentencesPreserve(sourceText).length || 0),
    clauseCount: Number(sourceIR?.metadata?.clauseCount || 0),
    exactAnchorCount: Number((hardAnchors || []).length || 0)
  });
}

function buildNativeLexicalShiftProfile(sourceText = '', outputText = '', sourceProfile = {}, targetProfile = null, outputProfile = {}, lexemeSwaps = []) {
  const fit = compareTexts(sourceText, outputText, {
    profileA: sourceProfile,
    profileB: outputProfile
  });

  return Object.freeze({
    lexemeSwaps: Object.freeze([...(lexemeSwaps || [])]),
    swapCount: Number((lexemeSwaps || []).length || 0),
    registerDistance: round(fit.registerDistance || 0, 4),
    contentWordComplexityDelta: round((outputProfile.contentWordComplexity || 0) - (sourceProfile.contentWordComplexity || 0), 4),
    modifierDensityDelta: round((outputProfile.modifierDensity || 0) - (sourceProfile.modifierDensity || 0), 4),
    directnessDelta: round((outputProfile.directness || 0) - (sourceProfile.directness || 0), 4),
    abstractionDelta: round((outputProfile.abstractionPosture || 0) - (sourceProfile.abstractionPosture || 0), 4),
    contractionAligned: Math.abs((outputProfile.contractionDensity || 0) - Number(targetProfile?.contractionDensity ?? outputProfile.contractionDensity ?? 0)) <= 0.03
  });
}

function buildSemanticRisk(semanticAudit = {}, protectedAnchorIntegrity = 1) {
  return round(clamp01(
    ((1 - Number(semanticAudit?.propositionCoverage ?? 1)) * 0.34) +
    ((1 - Number(semanticAudit?.actorCoverage ?? 1)) * 0.16) +
    ((1 - Number(semanticAudit?.actionCoverage ?? 1)) * 0.2) +
    ((1 - Number(semanticAudit?.objectCoverage ?? 1)) * 0.12) +
    ((1 - Number(protectedAnchorIntegrity ?? 1)) * 0.18)
  ), 4);
}

function computeCandidateTransferClass(candidate = {}) {
  if (candidate.classification?.outcome === 'surface-held') {
    return 'surface';
  }
  const substantiveMovement = substantiveDimensionCount(candidate.changedDimensions || []);
  const lexicalMovement = Number((candidate.lexemeSwaps || []).length || 0);
  if (
    substantiveMovement >= 2 ||
    (substantiveMovement >= 1 && lexicalMovement > 0) ||
    Number(candidate.rewriteStrength || 0) >= 0.5
  ) {
    return 'structural';
  }
  return 'weak';
}

function buildPlanSummary(candidate = null) {
  return Object.freeze({
    relationInventory: candidate?.relationInventory || {},
    structuralOperationsSelected: Object.freeze([...(candidate?.structuralOperations || [])]),
    lexicalRegisterOperationsSelected: Object.freeze([...(candidate?.lexicalOperations || [])]),
    connectorStrategy: candidate?.connectorStrategy || 'balanced',
    contractionStrategy: candidate?.contractionStrategy || 'preserve'
  });
}

function buildCandidateSummary(candidateLedger = [], generationDocket = null) {
  return Object.freeze({
    candidateCount: candidateLedger.length,
    landedCandidateId: generationDocket?.winningCandidateId || null,
    families: Object.freeze([...new Set(candidateLedger.map((entry) => entry.family).filter(Boolean))]),
    holdStatus: generationDocket?.status || 'landed'
  });
}

function buildRetrievalTraceV2({
  sourceText = '',
  sourceClass = 'formal-correspondence',
  candidate = null,
  candidateLedger = [],
  generationDocket = null,
  donorProgress = {}
} = {}) {
  return Object.freeze({
    sourceText,
    sourceClass,
    generatorVersion: 'v2',
    semanticAudit: candidate?.semanticAudit || {},
    protectedAnchorAudit: candidate?.protectedAnchorAudit || {},
    planSummary: buildPlanSummary(candidate),
    candidateSummary: buildCandidateSummary(candidateLedger, generationDocket),
    realizationSummary: Object.freeze({
      transferClass: candidate?.transferClass || 'held',
      borrowedShellOutcome: candidate?.transferClass === 'structural' ? 'structural' : candidate?.transferClass === 'surface' ? 'surface-held' : candidate ? 'partial' : 'held',
      borrowedShellFailureClass: generationDocket?.holdClass || null,
      realizationTier: candidate?.realizationTier || 'hold',
      changedDimensions: Object.freeze([...(candidate?.changedDimensions || [])]),
      lexemeSwaps: Object.freeze([...(candidate?.lexemeSwaps || [])]),
      visibleShift: Boolean(candidate?.visibleShift),
      nonTrivialShift: Boolean(candidate?.nonTrivialShift)
    }),
    donorProgress: donorProgress || {},
    candidateLedger,
    generationDocket,
    winningCandidateId: generationDocket?.winningCandidateId || null
  });
}

function buildNativePassThroughTransfer(text = '', shell = {}, options = {}) {
  const sourceText = normalizeText(text);
  const sourceProfile = extractCadenceProfile(sourceText);
  const hardAnchors = extractHardAnchors(sourceText);
  const protectedState = {
    literals: Object.freeze(hardAnchors.map((value) => Object.freeze({ value }))),
    text: sourceText
  };
  const sourceIR = segmentTextToIR(sourceText, protectedState);
  const opportunityProfile = buildOpportunityProfileFromIR(sourceIR);
  const auditBundle = buildSemanticAuditBundle(sourceIR, sourceText, protectedState);
  const sourceClass = classifyV2SourceClass(sourceText);
  const generationDocket = Object.freeze({
    status: 'landed',
    holdClass: null,
    headline: shell?.mode === 'native' ? 'Generator V2 stayed native.' : 'Generator V2 stayed on source cadence.',
    reasons: Object.freeze([]),
    candidateCount: 1,
    winningCandidateId: 'native'
  });
  const apertureAudit = buildTD613ApertureAudit({
    generatorFault: false,
    warningSignals: [],
    repairPasses: [],
    candidateSuppression: 0,
    observabilityDeficit: 0,
    aliasPersistence: 0,
    namingSensitivity: 0,
    redundancyInflation: 0,
    capacityPressure: 0,
    policyPressure: 0,
    withheldMaterial: false,
    withheldReason: null
  });
  const candidateLedger = Object.freeze([
    Object.freeze({
      id: 'native',
      family: 'native',
      envelopeId: 'generic',
      status: 'selected',
      score: 1,
      rewriteStrength: 0,
      targetFit: 1,
      movementConfidence: 0,
      failureReasons: Object.freeze([]),
      transferClass: 'native',
      outputPreview: sourceText.slice(0, 160)
    })
  ]);
  const retrievalTrace = options?.retrieval
    ? buildRetrievalTraceV2({
        sourceText,
        sourceClass,
        candidate: Object.freeze({
          transferClass: 'native',
          realizationTier: 'none',
          changedDimensions: [],
          lexemeSwaps: [],
          visibleShift: false,
          nonTrivialShift: false,
          relationInventory: buildRelationInventory(sourceText, sourceIR, sourceClass, hardAnchors),
          semanticAudit: auditBundle.semanticAudit,
          protectedAnchorAudit: auditBundle.protectedAnchorAudit,
          connectorStrategy: 'balanced',
          contractionStrategy: 'preserve'
        }),
        candidateLedger,
        generationDocket
      })
    : null;

  return Object.freeze({
    text: sourceText,
    internalText: sourceText,
    sourceProfile,
    targetProfile: shell.profile || sourceProfile,
    outputProfile: sourceProfile,
    opportunityProfile,
    changedDimensions: [],
    protectedLiteralCount: hardAnchors.length,
    passesApplied: [],
    rescuePasses: [],
    donorProgress: {},
    transferClass: 'native',
    qualityGatePassed: true,
    notes: Object.freeze([generationDocket.headline]),
    effectiveMod: shell.mod || cadenceModFromProfile(shell.profile || sourceProfile),
    realizationTier: 'none',
    lexicalShiftProfile: Object.freeze({
      lexemeSwaps: Object.freeze([]),
      swapCount: 0,
      registerDistance: 0,
      contentWordComplexityDelta: 0,
      modifierDensityDelta: 0,
      directnessDelta: 0,
      abstractionDelta: 0,
      contractionAligned: true
    }),
    semanticRisk: 0,
    lexemeSwaps: Object.freeze([]),
    realizationNotes: Object.freeze([]),
    borrowedShellOutcome: null,
    borrowedShellFailureClass: null,
    visibleShift: false,
    nonTrivialShift: false,
    semanticAudit: auditBundle.semanticAudit,
    protectedAnchorAudit: auditBundle.protectedAnchorAudit,
    apertureAudit,
    apertureProtocol: Object.freeze({
      outcome: 'projected',
      line: generationDocket.headline,
      apertureAudit
    }),
    retrievalTrace,
    generatorVersion: 'v2',
    generationDocket,
    candidateLedger,
    holdStatus: 'landed'
  });
}

function authorNativeCandidateText(sourceText = '', variant = {}, family = {}, options = {}) {
  const sourceClass = options.sourceClass || classifyV2SourceClass(sourceText);
  const hardAnchors = options.hardAnchors || extractHardAnchors(sourceText);
  const sourceProfile = options.sourceProfile || extractCadenceProfile(sourceText);
  const sourceIR = options.sourceIR || segmentTextToIR(sourceText, {
    literals: Object.freeze(hardAnchors.map((value) => Object.freeze({ value }))),
    text: sourceText
  });
  const familyId = family.id || 'syntax-shape';
  const connectorStrategy = connectorStrategyFor(variant.envelopeId, sourceClass, familyId);
  const contractionStrategy = contractionStrategyFor(
    variant.envelopeId,
    variant.shell?.profile || null,
    sourceProfile,
    sourceClass,
    familyId
  );
  const protectedState = protectAnchorsForRewrite(sourceText, hardAnchors);
  const paragraphs = splitParagraphs(protectedState.text);
  const structuralOperations = [];
  const lexicalOperations = [];
  const lexemeSwaps = [];
  const context = {
    structuralOperations,
    lexicalOperations,
    lexemeSwaps,
    connectorStrategy,
    contractionStrategy,
    targetProfile: variant.shell?.profile || null,
    sourceProfile,
    sourceClass,
    intensity: variantIntensity(variant) * familyWeight(familyId)
  };

  const rewrittenParagraphs = paragraphs.map((paragraph) => {
    let working = paragraph;

    if (familyId === 'syntax-shape') {
      working = applySyntaxShapeRewrite(working, variant.envelopeId, sourceClass, context);
    } else if (familyId === 'register-lexicon') {
      working = applyLexicalRegisterRewrite(working, variant.envelopeId, sourceClass, context);
    } else if (familyId === 'cadence-connector') {
      working = applyConnectorRewrite(working, variant.envelopeId, sourceClass, context);
    } else if (familyId === 'order-beat') {
      working = applyOrderBeatRewrite(working, variant.envelopeId, sourceClass, context);
    } else {
      working = applyHybridBalance(working, variant.envelopeId, sourceClass, context);
    }

    return applyPersonaEnvelopeText(working, {
      sourceText: paragraph,
      envelopeId: variant.envelopeId,
      sourceClass,
      targetProfile: variant.shell.profile || {},
      explicitTargetProfile: Boolean(variant.shell.profile)
    });
  });

  let outputText = joinParagraphs(rewrittenParagraphs);
  outputText = applyContractionStrategyText(outputText, contractionStrategy, context);
  outputText = applyCompressedSurfaceRewrite(
    outputText,
    context.targetProfile,
    sourceProfile,
    context
  );
  outputText = applyExpandedSurfaceRewrite(
    outputText,
    context.targetProfile,
    sourceProfile,
    context
  );
  outputText = restoreAnchorsAfterRewrite(outputText, protectedState.replacements);
  outputText = restoreHardWitnessAnchors(
    sourceText,
    restoreProceduralWitnessTerms(sourceText, outputText, sourceClass)
  );
  outputText = sanitizeV2Surface(outputText, {
    preserveLowercaseLeads: Number(context.targetProfile?.orthographicLooseness || 0) >=
      Math.max(0.06, Number(sourceProfile?.orthographicLooseness || 0) + 0.04)
  });

  return Object.freeze({
    outputText,
    structuralOperations: uniqueStrings(structuralOperations),
    lexicalOperations: uniqueStrings(lexicalOperations),
    lexemeSwaps: dedupeLexemeSwaps(lexemeSwaps),
    connectorStrategy,
    contractionStrategy,
    relationInventory: buildRelationInventory(sourceText, sourceIR, sourceClass, hardAnchors)
  });
}

function buildCandidate(sourceText = '', variant = {}, family = {}, options = {}) {
  const sourceClass = options.sourceClass || classifyV2SourceClass(sourceText);
  const sourceProfile = options.sourceProfile || extractCadenceProfile(sourceText);
  const hardAnchors = options.hardAnchors || extractHardAnchors(sourceText);
  const protectedState = {
    literals: Object.freeze(hardAnchors.map((value) => Object.freeze({ value }))),
    text: sourceText
  };
  const sourceIR = options.sourceIR || segmentTextToIR(sourceText, protectedState);
  const authored = authorNativeCandidateText(sourceText, variant, family, {
    ...options,
    sourceClass,
    sourceProfile,
    sourceIR,
    hardAnchors
  });
  const outputText = authored.outputText;
  const outputProfile = extractCadenceProfile(outputText);
  const changedDimensions = deriveChangedDimensions(sourceProfile, outputProfile);
  const semanticBundle = buildSemanticAuditBundle(sourceIR, outputText, protectedState);
  const semanticAudit = semanticBundle.semanticAudit || {};
  const protectedAnchorAudit = semanticBundle.protectedAnchorAudit || {};
  const witnessAudit = auditTD613ApertureWitnessAnchors({
    sourceText,
    outputText,
    sourceIR,
    protectedState
  });
  const pathologies = detectTD613ApertureTextPathologies({
    sourceText,
    outputText
  });
  const visibleShift = normalizeComparable(sourceText) !== normalizeComparable(outputText);
  const nonTrivialShift =
    substantiveDimensionCount(changedDimensions) > 0 ||
    authored.lexemeSwaps.length > 0 ||
    normalizeMovementComparable(sourceText) !== normalizeMovementComparable(outputText);
  const semanticRisk = buildSemanticRisk(semanticAudit, protectedAnchorAudit.protectedAnchorIntegrity ?? 1);
  const apertureReview = reviewTD613ApertureTransfer({
    sourceText,
    outputText,
    shellMode: variant.shell?.mode || 'native',
    shellSource: variant.shell?.source || '',
    retrieval: true,
    semanticRisk,
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
    lexemeSwaps: authored.lexemeSwaps,
    visibleShift,
    nonTrivialShift,
    repaired: false,
    pathologies,
    blocked: false
  });
  const rewriteStrength = computeRewriteStrength(
    sourceText,
    outputText,
    sourceProfile,
    outputProfile,
    changedDimensions,
    authored.lexemeSwaps
  );
  const targetProfile = variant.shell.profile || null;
  const targetFit = computeTargetFit(outputProfile, targetProfile);
  const donorProgress = variant.shell?.mode === 'borrowed'
    ? buildBorrowedShellDonorProgress(sourceText, outputText, sourceProfile, targetProfile || {}, outputProfile)
    : {};
  const floors = classSemanticFloor(sourceClass, sourceProfile, targetProfile);
  const hardIntegrityScore = hardAnchorIntegrity(sourceText, outputText);
  const protectedAnchorIntegrity = Number(protectedAnchorAudit.protectedAnchorIntegrity ?? 1);
  const polarityMismatches = Number(semanticAudit.polarityMismatches ?? 0);
  const tenseMismatches = Number(semanticAudit.tenseMismatches ?? 0);
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
  const polarityPenalty = Math.max(0, polarityMismatches - 1) * 0.12;
  const tensePenalty = Math.max(0, tenseMismatches - 1) * 0.04;
  const donorStallPenalty =
    variant.shell?.mode === 'borrowed' &&
    targetProfile &&
    Number(donorProgress?.donorImprovementRatio || 0) <= 0.05
      ? 0.08
      : 0;
  const score = round(
    (rewriteStrength * 0.52) +
    (targetFit * 0.24) +
    ((Number(donorProgress?.donorImprovement || 0)) * 0.14) +
    ((Number(donorProgress?.donorImprovementRatio || 0)) * 0.08) +
    (Number(classification.movementConfidence || 0) * 0.12) +
    (Number(witnessAudit.softWitnessIntegrity ?? 1) * 0.08) +
    (visibleShift ? 0.04 : 0) -
    polarityPenalty -
    tensePenalty -
    donorStallPenalty -
    ((1 - protectedAnchorIntegrity) * 1.5) -
    (pathologies.flags.length * 0.05),
    4
  );
  const failureReasons = uniqueStrings([
    !exactPass ? 'hard-anchor-failure' : null,
    !protectedAnchorPass ? 'anchor-drift-detected' : null,
    !semanticPass ? 'semantic-failure' : null,
    !pathologyPass ? 'pathology' : null,
    !rewritePass ? 'below-rewrite-bar' : null
  ]);
  const lexicalShiftProfile = buildNativeLexicalShiftProfile(
    sourceText,
    outputText,
    sourceProfile,
    targetProfile,
    outputProfile,
    authored.lexemeSwaps
  );
  const transferClass = computeCandidateTransferClass({
    classification,
    changedDimensions,
    lexemeSwaps: authored.lexemeSwaps,
    rewriteStrength
  });

  return Object.freeze({
    id: `${variant.id}:${family.id}`,
    family: family.id,
    envelopeId: variant.envelopeId,
    shell: variant.shell,
    sourceClass,
    sourceIR,
    hardAnchors,
    targetProfile: targetProfile || sourceProfile,
    outputText,
    outputProfile,
    changedDimensions,
    lexemeSwaps: authored.lexemeSwaps,
    lexicalShiftProfile,
    semanticAudit,
    protectedAnchorAudit,
    witnessAudit,
    apertureReview,
    classification,
    pathologies,
    visibleShift,
    nonTrivialShift,
    rewriteStrength,
    targetFit,
    transferClass,
    relationInventory: authored.relationInventory,
    structuralOperations: authored.structuralOperations,
    lexicalOperations: authored.lexicalOperations,
    connectorStrategy: authored.connectorStrategy,
    contractionStrategy: authored.contractionStrategy,
    semanticRisk,
    donorProgress,
    score,
    passed,
    failureReasons,
    realizationTier: deriveRealizationTier(changedDimensions, authored.lexemeSwaps)
  });
}

function dedupeCandidates(candidates = []) {
  const seen = new Set();
  return (candidates || []).filter((candidate) => {
    const key = normalizeComparable(candidate?.outputText || '');
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function buildCandidateLedger(candidates = [], landedId = null) {
  return Object.freeze((candidates || []).map((candidate) => Object.freeze({
    id: candidate.id,
    family: candidate.family,
    envelopeId: candidate.envelopeId,
    status: candidate.passed ? (candidate.id === landedId ? 'selected' : 'eligible') : 'held',
    score: candidate.score,
    rewriteStrength: candidate.rewriteStrength,
    targetFit: candidate.targetFit,
    movementConfidence: Number(candidate.classification?.movementConfidence || 0),
    failureReasons: Object.freeze([...(candidate.failureReasons || [])]),
    transferClass: candidate.transferClass || 'weak',
    outputPreview: String(candidate.outputText || '').slice(0, 160)
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

function candidateTransferRank(candidate = null) {
  const transferClass = String(candidate?.transferClass || '').toLowerCase();
  if (transferClass === 'structural') {
    return 2;
  }
  if (transferClass === 'surface') {
    return 1;
  }
  return 0;
}

function candidateSemanticBounded(candidate = null) {
  return (
    Number(candidate?.semanticAudit?.polarityMismatches ?? 0) <= 1 &&
    Number(candidate?.semanticAudit?.tenseMismatches ?? 0) <= 1
  );
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
  const sourceProfile = options.sourceProfile || extractCadenceProfile(sourceText);
  const sourceIR = options.sourceIR || segmentTextToIR(sourceText, { literals: [], text: sourceText });
  const opportunityProfile = buildOpportunityProfileFromIR(sourceIR);
  const chosen = candidate;
  const candidateLedger = buildCandidateLedger(candidates.length ? candidates : [chosen], chosen.id);
  const warningSignals = uniqueStrings([
    ...((chosen.apertureReview && chosen.apertureReview.warningSignals) || []),
    ...((chosen.classification && chosen.classification.pathologies) || [])
  ]);
  const candidateSuppression = candidateLedger.length > 1
    ? round((candidateLedger.filter((entry) => entry.status === 'held').length / candidateLedger.length), 4)
    : 0;
  const apertureAudit = buildTD613ApertureAudit({
    generatorFault: false,
    warningSignals,
    repairPasses: [],
    candidateSuppression: Math.max(candidateSuppression, chosen.apertureReview?.candidateSuppression ?? 0),
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
    headline: chosen.transferClass === 'structural'
      ? 'Generator V2 landed a structural registered rewrite.'
      : 'Generator V2 landed a registered cadence rewrite.',
    reasons: Object.freeze([]),
    candidateCount: candidateLedger.length,
    winningCandidateId: chosen.id
  });
  const retrievalTrace = options?.retrieval
    ? buildRetrievalTraceV2({
        sourceText,
        sourceClass,
        candidate: chosen,
        candidateLedger,
        generationDocket,
        donorProgress: chosen.donorProgress || {}
      })
    : null;

  return Object.freeze({
    text: chosen.outputText,
    internalText: chosen.outputText,
    sourceProfile,
    targetProfile: chosen.targetProfile || shell.profile || sourceProfile,
    outputProfile: chosen.outputProfile,
    opportunityProfile,
    changedDimensions: chosen.changedDimensions,
    lexemeSwaps: Object.freeze([...(chosen.lexemeSwaps || [])]),
    passesApplied: uniqueStrings([
      `v2-family:${chosen.family || 'syntax-shape'}`,
      `v2-envelope:${chosen.envelopeId || 'generic'}`,
      `v2-candidate:${chosen.id || 'candidate'}`,
      'v2-registration'
    ]),
    protectedLiteralCount: Number((chosen.hardAnchors || []).length || 0),
    rescuePasses: [],
    donorProgress: chosen.donorProgress || {},
    transferClass: chosen.transferClass,
    qualityGatePassed: true,
    notes: uniqueStrings([
      generationDocket.headline,
      ...(chosen.apertureReview?.reasons || []),
    ]),
    effectiveMod: shell.mod || cadenceModFromProfile(shell.profile || sourceProfile),
    realizationTier: chosen.realizationTier,
    semanticRisk: chosen.semanticRisk,
    semanticAudit: chosen.semanticAudit,
    protectedAnchorAudit: chosen.protectedAnchorAudit,
    visibleShift: chosen.visibleShift,
    nonTrivialShift: chosen.nonTrivialShift,
    lexicalShiftProfile: chosen.lexicalShiftProfile,
    realizationNotes: uniqueStrings([
      ...(chosen.structuralOperations || []).map((entry) => `structural:${entry}`),
      ...(chosen.lexicalOperations || []).map((entry) => `lexical:${entry}`)
    ]),
    borrowedShellOutcome:
      chosen.transferClass === 'structural'
        ? 'structural'
        : chosen.classification?.outcome === 'surface-held'
          ? 'surface-held'
          : 'partial',
    borrowedShellFailureClass: null,
    apertureAudit,
    apertureProtocol: Object.freeze({
      ...((chosen.apertureReview || {})),
      outcome: chosen.classification?.outcome || 'projected',
      line: chosen.classification?.line || generationDocket.headline,
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
  const sourceProfile = options.sourceProfile || extractCadenceProfile(sourceText);
  const sourceIR = options.sourceIR || segmentTextToIR(sourceText, { literals: [], text: sourceText });
  const opportunityProfile = buildOpportunityProfileFromIR(sourceIR);
  const bestCandidate = [...candidates].sort((left, right) => right.score - left.score)[0] || null;
  const holdClass = candidateHoldClass(bestCandidate);
  const headline = holdHeadline(holdClass);
  const reasons = uniqueStrings([
    ...(bestCandidate?.apertureReview?.reasons || []),
    ...(bestCandidate?.failureReasons || [])
  ]);
  const candidateLedger = buildCandidateLedger(candidates, null);
  const candidateSuppression = candidateLedger.length
    ? round(candidateLedger.filter((entry) => entry.status === 'held').length / candidateLedger.length, 4)
    : 1;
  const apertureAudit = buildTD613ApertureAudit({
    generatorFault: holdClass === 'pathology',
    warningSignals: uniqueStrings([
      ...((bestCandidate?.apertureReview && bestCandidate.apertureReview.warningSignals) || []),
      holdClass
    ]),
    repairPasses: [],
    candidateSuppression: Math.max(candidateSuppression, bestCandidate?.apertureReview?.candidateSuppression ?? 0.12),
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
  const retrievalTrace = options?.retrieval
    ? buildRetrievalTraceV2({
        sourceText,
        sourceClass,
        candidate: bestCandidate,
        candidateLedger,
        generationDocket,
        donorProgress: bestCandidate?.donorProgress || {}
      })
    : null;

  return Object.freeze({
    text: '',
    internalText: bestCandidate?.outputText || sourceText,
    sourceProfile,
    targetProfile: bestCandidate?.targetProfile || shell.profile || sourceProfile,
    outputProfile: sourceProfile,
    opportunityProfile,
    changedDimensions: [],
    protectedLiteralCount: Number((bestCandidate?.hardAnchors || []).length || 0),
    passesApplied: [],
    rescuePasses: [],
    donorProgress: bestCandidate?.donorProgress || {},
    transferClass: 'held',
    qualityGatePassed: false,
    notes: uniqueStrings([headline, ...reasons]),
    effectiveMod: shell.mod || cadenceModFromProfile(shell.profile || sourceProfile),
    realizationTier: 'hold',
    lexicalShiftProfile: bestCandidate?.lexicalShiftProfile || {
      lexemeSwaps: [],
      swapCount: 0,
      registerDistance: 0,
      contentWordComplexityDelta: 0,
      modifierDensityDelta: 0,
      directnessDelta: 0,
      abstractionDelta: 0,
      contractionAligned: true
    },
    semanticRisk: Number(bestCandidate?.semanticRisk || 0),
    lexemeSwaps: [],
    realizationNotes: uniqueStrings([
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
    ((!shell?.mod?.sent && !shell?.mod?.cont && !shell?.mod?.punc) && !shell?.profile)
  ) {
    return buildNativePassThroughTransfer(sourceText, shell, options);
  }

  const sourceClass = classifyV2SourceClass(sourceText);
  const sourceProfile = extractCadenceProfile(sourceText);
  const hardAnchors = extractHardAnchors(sourceText);
  const sourceIR = segmentTextToIR(sourceText, {
    literals: Object.freeze(hardAnchors.map((value) => Object.freeze({ value }))),
    text: sourceText
  });
  const variants = buildShellVariants(sourceProfile, shell, sourceClass);
  const candidates = dedupeCandidates(
    variants.flatMap((variant) =>
      NATIVE_CANDIDATE_FAMILIES.map((family) => buildCandidate(sourceText, variant, family, {
        ...options,
        sourceClass,
        sourceProfile,
        sourceIR,
        hardAnchors
      }))
    )
  );
  const eligibleCandidates = [...candidates].filter((candidate) => candidate.passed);
  const boundedCandidates = eligibleCandidates.filter((candidate) => candidateSemanticBounded(candidate));
  const selectionPool = boundedCandidates.length ? boundedCandidates : eligibleCandidates;
  const selected = [...selectionPool]
    .sort((left, right) =>
      candidateTransferRank(right) - candidateTransferRank(left) ||
      right.score - left.score ||
      right.rewriteStrength - left.rewriteStrength
    )[0] || null;

  if (!selected) {
    return buildHeldTransfer(sourceText, shell, {
      ...options,
      sourceProfile,
      sourceIR
    }, candidates, sourceClass);
  }

  return buildLandedTransfer(sourceText, shell, {
    ...options,
    sourceProfile,
    sourceIR
  }, selected, sourceClass, candidates);
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
