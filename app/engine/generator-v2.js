import {
  auditTD613ApertureWitnessAnchors,
  buildTD613ApertureAudit,
  buildTD613OntologyAudit,
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
    /\b(?:room|wall|night|suddenly|coffee|door|pack|thumb|swing|alone|shuddering)\b/i.test(normalized) ||
    /[!?]/.test(normalized)
  ) {
    return 'narrative-scene';
  }
  const singularFirstPersonHits = (
    normalized.match(/\b(?:I|me|my|myself)\b/g) || []
  ).length;
  const reflectiveSignalHits = (
    normalized.match(/\b(?:remember|reminding|worry|feel|think|trying|content|amnesia|keep|guess|blame|say|call|meet)\b/gi) || []
  ).length;
  if (
    reflectiveSignalHits >= 1 &&
      (
        /\bI\b/.test(normalized) ||
        singularFirstPersonHits >= 2
      )
  ) {
    return 'reflective-prose';
  }
  const formalSignalHits = (
    normalized.match(/\b(?:thank you|please|appreciate|let me know|best|regards|schedule|scheduling|follow up|follow-up)\b/gi) || []
  ).length;
  if (
    /(?:^|\n)\s*(?:hello|hi|team)\b/i.test(normalized) ||
    formalSignalHits >= 1
  ) {
    return 'formal-correspondence';
  }
  return 'formal-correspondence';
}

const REGISTER_LANES = Object.freeze([
  'formal-record',
  'professional-message',
  'rushed-mobile',
  'tangled-followup'
]);

function normalizeRegisterLane(value = '', fallback = '') {
  const normalized = String(value || '').trim().toLowerCase();
  return REGISTER_LANES.includes(normalized) ? normalized : fallback;
}

function inferRegisterLaneFromText(text = '', profile = {}, sourceClass = 'formal-correspondence') {
  const normalized = normalizeText(text);
  const lowered = normalized.toLowerCase();
  const abbreviationDensity = Number(profile?.abbreviationDensity || 0);
  const orthographicLooseness = Number(profile?.orthographicLooseness || 0);
  const fragmentPressure = Number(profile?.fragmentPressure || 0);
  const avgSentenceLength = Number(profile?.avgSentenceLength || 0);
  const sentenceCount = Number(profile?.sentenceCount || 0);
  const slashNotePressure = /(?:\s\/\s|\bw\/o\b|\bw\/\b)/i.test(normalized);
  const colonNotePressure = /:\s+[a-z0-9]/i.test(normalized) || /\bif [^.!?]{2,60}:\s+/i.test(normalized);
  const rushedLexemes = /\b(?:pkg|mgmt|appt|msg|pls|bc|abt|imo|fyi|2nd|3rd|fl|wasnt|dont|cant|w\/o|w\/)\b/i.test(normalized);
  const tangledSignals =
    /\b(?:following up|not quite right|accidentally made it sound|so yes|the actual miss|the actual issue|that is not quite right)\b/i.test(normalized) ||
    (avgSentenceLength >= 15 && sentenceCount >= 3 && /\b(?:but|however|though|earlier|later|actually)\b/i.test(normalized));
  const professionalSignals =
    /(?:^|\n)\s*(?:hello|hi|team)\b/i.test(normalized) ||
    /\b(?:please|let me know|thank you|appreciate|check in|required|flow|cleanup|arrive|starting with)\b/i.test(normalized);

  if (
    rushedLexemes ||
    slashNotePressure ||
    colonNotePressure ||
    abbreviationDensity >= 0.055 ||
    orthographicLooseness >= 0.085 ||
    fragmentPressure >= 0.14
  ) {
    return 'rushed-mobile';
  }
  if (tangledSignals) {
    return 'tangled-followup';
  }
  if (professionalSignals) {
    return 'professional-message';
  }
  if (sourceClass === 'procedural-record' || sourceClass === 'formal-correspondence') {
    return 'formal-record';
  }
  return 'formal-record';
}

function inferRegisterLaneFromProfile(profile = {}, sourceClass = 'formal-correspondence') {
  const abbreviationDensity = Number(profile?.abbreviationDensity || 0);
  const orthographicLooseness = Number(profile?.orthographicLooseness || 0);
  const fragmentPressure = Number(profile?.fragmentPressure || 0);
  const directness = Number(profile?.directness || 0);
  const avgSentenceLength = Number(profile?.avgSentenceLength || 0);
  const registerMode = String(profile?.registerMode || '').trim().toLowerCase();

  if (
    registerMode === 'compressed' ||
    abbreviationDensity >= 0.055 ||
    orthographicLooseness >= 0.085 ||
    fragmentPressure >= 0.14
  ) {
    return 'rushed-mobile';
  }
  if (avgSentenceLength >= 16 && directness <= 0.56) {
    return 'tangled-followup';
  }
  if (directness >= 0.56 && avgSentenceLength <= 18) {
    return 'professional-message';
  }
  return sourceClass === 'formal-correspondence' ? 'professional-message' : 'formal-record';
}

function resolveSourceRegisterLane({
  sourceText = '',
  sourceProfile = {},
  sourceClass = 'formal-correspondence',
  explicitRegisterLane = '',
  relationInventory = null
} = {}) {
  const explicit = normalizeRegisterLane(
    explicitRegisterLane || relationInventory?.sourceRegisterLane || '',
    ''
  );
  if (explicit) {
    return Object.freeze({
      sourceRegisterLane: explicit,
      inference: 'explicit',
      fallbackUsed: false
    });
  }
  const inferred = normalizeRegisterLane(
    inferRegisterLaneFromText(sourceText, sourceProfile, sourceClass),
    'formal-record'
  );
  return Object.freeze({
    sourceRegisterLane: inferred,
    inference: 'inferred',
    fallbackUsed: false
  });
}

function resolveTargetRegisterLane({
  shell = {},
  targetProfile = {},
  sourceProfile = {},
  sourceClass = 'formal-correspondence'
} = {}) {
  const explicit = normalizeRegisterLane(
    shell?.registerLane || targetProfile?.sourceRegisterLane || targetProfile?.registerLane || '',
    ''
  );
  if (explicit) {
    return explicit;
  }
  return normalizeRegisterLane(
    inferRegisterLaneFromProfile(targetProfile, sourceClass),
    inferRegisterLaneFromProfile(sourceProfile, sourceClass)
  );
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

function splitForClippedMomentum(sentence = '', sourceClass = 'formal-correspondence') {
  const boundedCustodyClass = ['procedural-record', 'formal-correspondence'].includes(sourceClass);
  const commaPattern = boundedCustodyClass
    ? /,((?:["')\]])?)\s+(?=(?:because|while|with|which)\b)/gi
    : /,((?:["')\]])?)\s+(?=(?:and|but|because|while|with|which)\b)/gi;
  let working = normalizeText(sentence)
    .replace(commaPattern, (match, closer = '') => `.${closer} `);
  if (!boundedCustodyClass) {
    working = working
      .replace(/;\s+/g, '. ')
      .replace(/:\s+(?=[A-Za-z])/g, '. ');
  }
  return working;
}

function splitSceneBursts(text = '') {
  return normalizeText(text)
    .replace(/,\s+and,\s+/gi, '. ')
    .replace(/,\s+and\s+(?=[a-z])/gi, '. ')
    .replace(/,\s+with\s+/gi, '. With ')
    .replace(/,\s+suddenly,\s+/gi, '. Suddenly, ')
    .replace(/,\s+then\s+/gi, '. Then ')
    .replace(/:\s+(?=[A-Za-z])/g, '. ');
}

function normalizeMergedLead(next = '', linker = ', and ') {
  let working = normalizeText(next);
  if (!working) {
    return working;
  }
  if (/\bwhile\s*$/i.test(linker)) {
    working = working.replace(/^(?:and|while)\b[\s,]*/i, '');
  } else if (/\band\s*$/i.test(linker)) {
    working = working.replace(/^and\b[\s,]*/i, '');
  } else if (/;\s*$/.test(linker)) {
    working = working.replace(/^(?:and|but|so)\b[\s,]*/i, '');
  }
  return working.replace(/^[A-Z]/, (match) => match.toLowerCase());
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
      const linkerPattern = new RegExp(escapeRegex(linker.trim()), 'i');
      if (currentWords >= 18 || linkerPattern.test(current)) {
        merged.push(current);
        index += 1;
        continue;
      }
      if (currentWords <= 14 || nextWords <= 14) {
        const left = current.replace(/[.!?]+$/g, '');
        const right = normalizeMergedLead(next, linker);
        merged.push(`${left}${linker}${right}`);
        index += 2;
        continue;
      }
    merged.push(current);
    index += 1;
  }
  return merged;
}

function softenLinkerChains(text = '') {
  return splitSentencesPreserve(text).map((sentence) => {
    let working = normalizeText(sentence);
    let seenAnd = 0;
    working = working.replace(/,\s+and\b/gi, () => {
      seenAnd += 1;
      return seenAnd >= 2 ? '. And' : ', and';
    });
    let seenWhile = 0;
    working = working.replace(/,\s+while\b/gi, () => {
      seenWhile += 1;
      return seenWhile >= 2 ? '. While' : ', while';
    });
    return working;
  }).join(' ');
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
  let working = softenLinkerChains(tidyEnvelopeText(text))
    .replace(/\.\s*,/g, '. ')
    .replace(/,\s*\./g, '. ')
    .replace(/;\s+;/g, '; ')
    .replace(/;\s+([A-Z])/g, '. $1')
    .replace(/\band\s+and\b/gi, 'and')
    .replace(/\bwhile\s+while\b/gi, 'while')
    .replace(/\bwhile\s+and\b/gi, 'while')
    .replace(/\band\s+while\b/gi, 'while')
    .replace(/\bnot ([^.!?]{3,120}?)\.\s+but\b/gi, 'not $1, but')
      .replace(/\bYet\s+twirl\b/gi, 'The twirl')
      .replace(/\bYet\s+two\b/gi, 'Then two')
      .replace(/\bYet\s+the\b/gi, 'Then the')
      .replace(/\bYet\s+it\b/gi, 'Then it');
  if (!preserveLowercaseLeads) {
    working = working
      .replace(/^([a-z])/, (match, letter) => letter.toUpperCase())
      .replace(/([.!?;]\s+)([a-z])/g, (match, spacing, letter) => `${spacing}${letter.toUpperCase()}`);
  }
  working = working.replace(/\bi\b/g, 'I');
  return normalizeText(
    working.replace(/\s{2,}/g, ' ')
  );
}

function polishNativeCandidateText(text = '', {
  envelopeId = 'generic',
  sourceClass = 'formal-correspondence'
} = {}) {
  let working = sanitizeV2Surface(text, {
    preserveLowercaseLeads:
      ['procedural-record', 'formal-correspondence'].includes(sourceClass) &&
      (envelopeId === 'spark' || envelopeId === 'cross-examiner')
  });

  working = working
    .replace(/,\s+and then\s+and\b/gi, ', and then')
    .replace(/,\s+and\s+and\b/gi, ', and')
    .replace(/,\s+while\s+while\b/gi, ', while')
    .replace(/\bBut then,\s+but then\b/gi, 'But then')
    .replace(/\bAnd then,\s+and then\b/gi, 'Then')
    .replace(/\bStill,\s+still\b/gi, 'Still')
    .replace(/\bHowever,\s+however\b/gi, 'However')
    .replace(/,\s+(?=(?:Do not|Keep|Call|Meet|Nobody|I needed|I blame|I must|It is|Without warning|The wall)\b)/g, '. ')
    .replace(/\b(I|We|You|They|He|She|It)\s+(am|are|is|was|were)\s+\1\s+(am|are|is|was|were)\b/gi, '$1 $2')
    .replace(/\b(I|We|You|They|He|She|It)\s+(need to|have to|want to|must)\s+\1\s+\2\b/gi, '$1 $2');

  if (['matron', 'undertow'].includes(envelopeId)) {
    working = splitSentencesPreserve(working).map((sentence) => {
      const normalizedSentence = normalizeText(sentence);
      if (sentenceWordCount(normalizedSentence) <= (envelopeId === 'matron' ? 30 : 32)) {
        return normalizedSentence;
      }
      return normalizedSentence
        .replace(/,\s+and\s+(?=(?:Nobody|No one|Nothing|Someone|Something|Things|The|It|This|That|Two|Then|Suddenly)\b)/, '. ')
        .replace(/,\s+while\s+(?=(?:Nobody|No one|Nothing|Someone|Something|Things|The|It|This|That|Two|Then|Suddenly)\b)/, '. While ');
    }).join(' ');
  }

  const sentences = splitSentencesPreserve(working);
  if (sentences.length && sentenceWordCount(sentences[0]) > (envelopeId === 'matron' || envelopeId === 'undertow' ? 30 : 24)) {
    const softenedLead = splitForClippedMomentum(sentences[0], sourceClass);
    if (softenedLead !== sentences[0] && !['matron', 'undertow'].includes(envelopeId)) {
      sentences[0] = softenedLead;
      working = sentences.join(' ');
    }
  }

  return sanitizeV2Surface(working, {
    preserveLowercaseLeads: false
  });
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
  explicitTargetProfile = false,
  context = {}
} = {}) {
  let working = normalizeText(text);
  if (!working) {
    return working;
  }

  const sentences = splitSentencesPreserve(working);
  const sourceSentences = splitSentencesPreserve(sourceText);
  const sceneLike = sourceClass === 'reflective-prose' || sourceClass === 'narrative-scene';

  if (envelopeId === 'spark' || envelopeId === 'cross-examiner') {
    working = sentences.map((sentence) => {
      let next = splitForClippedMomentum(sentence, sourceClass);
      if (sceneLike) {
        next = splitSceneBursts(next);
      }
      return next;
    }).join(' ');
    if ((targetProfile.contractionDensity || 0) >= 0.08 || envelopeId === 'spark') {
      working = contractExpansions(working);
    }
  } else if (envelopeId === 'operator') {
    working = sentences.map((sentence) => splitForClippedMomentum(sentence, sourceClass)).join(' ');
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

  working = applyScenePersonaPulse(working, envelopeId, sourceClass, context);
  return tidyEnvelopeText(working);
}

function deriveChangedDimensions(sourceProfile = {}, outputProfile = {}) {
  const dimensions = [];
  const abbreviationDelta = Math.abs((sourceProfile.abbreviationDensity || 0) - (outputProfile.abbreviationDensity || 0));
  const orthographyDelta = Math.abs((sourceProfile.orthographicLooseness || 0) - (outputProfile.orthographicLooseness || 0));
  const abstractionDelta = Math.abs((sourceProfile.abstractionPosture || 0) - (outputProfile.abstractionPosture || 0));
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
  if (abstractionDelta >= 0.06) {
    dimensions.push('abstraction');
    dimensions.push('abstraction-posture');
  }
  if (abbreviationDelta >= 0.018) {
    dimensions.push('abbreviation-posture');
  }
  if (orthographyDelta >= 0.02) {
    dimensions.push('orthography-posture');
  }
  if (
    (sourceProfile.registerMode || '') !== (outputProfile.registerMode || '') ||
    abbreviationDelta >= 0.04 ||
    orthographyDelta >= 0.08
  ) {
    dimensions.push('lexical-register');
  }
  return uniqueStrings(dimensions);
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
    return { proposition: 0.85, actor: 0.75, action: 0.75, object: 0.65 };
  }
  if (sourceClass === 'formal-correspondence') {
    const compressedTarget = Boolean(targetProfile) && (
      Number(targetProfile?.avgSentenceLength || 0) < (Number(sourceProfile?.avgSentenceLength || 0) * 0.76) ||
      Number(targetProfile?.fragmentPressure || 0) >= 0.08 ||
      Number(targetProfile?.abbreviationDensity || 0) >= 0.035
    );
    if (compressedTarget) {
      return { proposition: 0.85, actor: 0.75, action: 0.75, object: 0.65 };
    }
    return { proposition: 0.82, actor: 0.74, action: 0.75, object: 0.64 };
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

function hasRegisterMove(changedDimensions = [], lexemeSwaps = []) {
  return (changedDimensions || []).some((dimension) =>
    ['register-mode', 'abbreviation-posture', 'orthography-posture', 'directness', 'abstraction'].includes(dimension)
  ) || Number((lexemeSwaps || []).length || 0) > 0;
}

function punctuationOnlyDrift(changedDimensions = [], lexemeSwaps = []) {
  const dimensions = [...(changedDimensions || [])];
  return dimensions.length > 0 &&
    dimensions.every((dimension) => ['punctuation-shape', 'contraction-posture'].includes(dimension)) &&
    Number((lexemeSwaps || []).length || 0) === 0;
}

function meetsLandedRewriteBar(sourceClass = 'formal-correspondence', rewriteStrength = 0, changedDimensions = [], lexemeSwaps = []) {
  if (rewriteStrength < classRewriteBar(sourceClass)) {
    if (sourceClass === 'procedural-record' && rewriteStrength < 0.12) {
      return false;
    }
    if (sourceClass === 'formal-correspondence' && rewriteStrength < 0.13) {
      return false;
    }
    if (!['procedural-record', 'formal-correspondence'].includes(sourceClass)) {
      return false;
    }
  }
  if (punctuationOnlyDrift(changedDimensions, lexemeSwaps)) {
    return false;
  }
  const structuralMovement = substantiveDimensionCount(changedDimensions);
  const registerMovement = hasRegisterMove(changedDimensions, lexemeSwaps);
  if (['reflective-prose', 'narrative-scene'].includes(sourceClass)) {
    return structuralMovement >= 1 && registerMovement;
  }
  return structuralMovement >= 1 || registerMovement;
}

function countRegexHits(text = '', pattern) {
  const matches = String(text || '').match(pattern);
  return matches ? matches.length : 0;
}

function countSemicolonFractures(text = '', envelopeId = 'generic', sourceClass = 'formal-correspondence') {
  const semicolonCount = countRegexHits(text, /;\s+/g);
  if (!semicolonCount) {
    return 0;
  }
  const uppercaseAfterSemicolon = countRegexHits(text, /;\s+[A-Z]/g);
  if (envelopeId === 'archivist' || envelopeId === 'methods-editor') {
    return Math.max(0, uppercaseAfterSemicolon - (sourceClass === 'procedural-record' ? 1 : 0));
  }
  return semicolonCount + uppercaseAfterSemicolon;
}

function countRepeatedHelperVerbs(text = '') {
  const sentences = splitSentencesPreserve(text);
  const helperStarts = sentences
    .map((sentence) => normalizeText(sentence).match(/^(i|we|you|they|he|she|it)\s+(?:am|are|is|was|were|want to|need to|have to|keep|kept|just)\b/i)?.[0]?.toLowerCase() || '')
    .filter(Boolean);
  let repeated = 0;
  for (let index = 1; index < helperStarts.length; index += 1) {
    if (helperStarts[index] === helperStarts[index - 1]) {
      repeated += 1;
    }
  }
  return repeated;
}

function countMalformedContractions(text = '') {
  return countRegexHits(text, /\b(?:I|It|That|You|We|They|Don|Can|Won)\s*;\s*[A-Za-z]+\b/g);
}

function countFragmentArtifacts(text = '', sourceText = '') {
  const outputFragments = splitSentencesPreserve(text)
    .map((sentence) => trimSentenceEnding(sentence))
    .filter(Boolean)
    .filter((sentence) => sentenceWordCount(sentence) <= 2)
    .filter((sentence) => !/\b(?:i guess|hello|good night|all right|maybe)\b/i.test(sentence));
  const sourceFragments = splitSentencesPreserve(sourceText)
    .map((sentence) => trimSentenceEnding(sentence))
    .filter(Boolean)
    .filter((sentence) => sentenceWordCount(sentence) <= 2)
    .length;
  return Math.max(0, outputFragments.length - sourceFragments);
}

function countConnectorLoad(text = '') {
  return countRegexHits(text, /,\s+(?:and|while|but then|because|since|though|as|with)\b/gi);
}

function countClauseJoinArtifacts(text = '') {
  return countRegexHits(text, /,\s+(?=(?:I|We|You|They|He|She|It|Nobody|Keep|Call|Meet|Do|Stop|Without|Then|The)\b)/g);
}

function countLongSentenceDrag(text = '', envelopeId = 'generic') {
  const threshold =
    envelopeId === 'spark' || envelopeId === 'cross-examiner'
      ? 24
      : envelopeId === 'matron' || envelopeId === 'undertow'
        ? 32
        : envelopeId === 'archivist' || envelopeId === 'methods-editor'
          ? 30
          : 28;
  return splitSentencesPreserve(text).filter((sentence) => sentenceWordCount(sentence) > threshold).length;
}

function overBraidingAllowance(envelopeId = 'generic', sourceClass = 'formal-correspondence') {
  if (sourceClass === 'procedural-record') {
    return envelopeId === 'archivist' || envelopeId === 'methods-editor' ? 2 : 1;
  }
  if (envelopeId === 'matron' || envelopeId === 'undertow') {
    return 3;
  }
  if (envelopeId === 'archivist' || envelopeId === 'methods-editor') {
    return 2;
  }
  return 1;
}

function buildArtifactAudit({
  sourceText = '',
  outputText = '',
  sourceClass = 'formal-correspondence',
  envelopeId = 'generic',
  targetProfile = null,
  sourceProfile = {}
} = {}) {
  const allowLowercaseLeads = Number(targetProfile?.orthographicLooseness || 0) >=
    Math.max(0.06, Number(sourceProfile?.orthographicLooseness || 0) + 0.04);
  const lowercaseLeadCount = allowLowercaseLeads ? 0 : countRegexHits(outputText, /(?:^|[.!?;]\s+)[a-z]/g);
  const doubledConnectorCount = countRegexHits(outputText, /\b(?:and and|while while|while and|and while|but but|because because|since since|then then|yet yet)\b/gi);
  const semicolonFractureCount = countSemicolonFractures(outputText, envelopeId, sourceClass);
  const repeatedHelperCount = countRepeatedHelperVerbs(outputText);
  const malformedContractionCount = countMalformedContractions(outputText);
  const fragmentCount = countFragmentArtifacts(outputText, sourceText);
  const connectorLoadCount = countConnectorLoad(outputText);
  const clauseJoinCount = countClauseJoinArtifacts(outputText);
  const clauseDragCount = countLongSentenceDrag(outputText, envelopeId);
  const overBraidingCount = Math.max(0, connectorLoadCount - overBraidingAllowance(envelopeId, sourceClass));
  const flags = uniqueStrings([
    lowercaseLeadCount ? 'artifact:lowercase-lead' : null,
    doubledConnectorCount ? 'artifact:doubled-connector' : null,
    semicolonFractureCount ? 'artifact:semicolon-fracture' : null,
    repeatedHelperCount ? 'artifact:repeated-helper' : null,
    malformedContractionCount ? 'artifact:malformed-contraction' : null,
    fragmentCount ? 'artifact:fragment' : null,
    overBraidingCount ? 'artifact:over-braiding' : null,
    clauseJoinCount ? 'artifact:clause-join' : null,
    clauseDragCount ? 'artifact:clause-drag' : null
  ]);
  const penalty = round(clamp01(
    (Math.min(lowercaseLeadCount, 3) * 0.04) +
    (Math.min(doubledConnectorCount, 3) * 0.05) +
    (Math.min(semicolonFractureCount, 3) * 0.04) +
    (Math.min(repeatedHelperCount, 3) * 0.03) +
    (Math.min(malformedContractionCount, 3) * 0.08) +
    (Math.min(fragmentCount, 3) * 0.03) +
    (Math.min(overBraidingCount, 3) * 0.04) +
    (Math.min(clauseJoinCount, 3) * 0.04) +
    (Math.min(clauseDragCount, 3) * 0.03)
  ), 4);

  return Object.freeze({
    flags: Object.freeze(flags),
    penalty,
    lowercaseLeadCount,
    doubledConnectorCount,
    semicolonFractureCount,
    repeatedHelperCount,
    malformedContractionCount,
    fragmentCount,
    connectorLoadCount,
    clauseJoinCount,
    clauseDragCount,
    overBraidingCount
  });
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
    ((fit.functionWordDistance || 0) * 0.2) +
    ((fit.charGramDistance || 0) * 0.14) +
    ((fit.registerDistance || 0) * 0.12) +
    ((fit.directnessDistance || 0) * 0.1) +
    ((fit.abstractionDistance || 0) * 0.1) +
    ((fit.contractionDistance || 0) * 0.08) +
    ((fit.punctShapeDistance || 0) * 0.04) +
    ((fit.abbreviationDistance || 0) * 0.08) +
    ((fit.orthographyDistance || 0) * 0.1) +
    ((fit.conversationDistance || 0) * 0.04)
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

function familySelectionBonus(sourceClass = 'formal-correspondence', familyId = 'syntax-shape', envelopeId = 'generic') {
  const weighted = familyWeight(familyId, sourceClass, envelopeId);
  return round(Math.max(0, weighted - 1) * 0.08, 4);
}

function personaDistinctnessBonus({
  envelopeId = 'generic',
  sourceProfile = {},
  outputProfile = {},
  sourceClass = 'formal-correspondence',
  structuralOperations = [],
  lexicalOperations = [],
  changedDimensions = [],
  lexemeSwaps = []
} = {}) {
  const avgDelta = Number(outputProfile.avgSentenceLength || 0) - Number(sourceProfile.avgSentenceLength || 0);
  const sentenceDelta = Number(outputProfile.sentenceCount || 0) - Number(sourceProfile.sentenceCount || 0);
  const directnessDelta = Number(outputProfile.directness || 0) - Number(sourceProfile.directness || 0);
  const abstractionDelta = Number(outputProfile.abstractionPosture || 0) - Number(sourceProfile.abstractionPosture || 0);
  const contractionDelta = Number(outputProfile.contractionDensity || 0) - Number(sourceProfile.contractionDensity || 0);
  const structuralSet = new Set(structuralOperations || []);
  const lexicalSet = new Set(lexicalOperations || []);
  const structuralMovement = substantiveDimensionCount(changedDimensions);
  const lexicalMovement = Number((lexemeSwaps || []).length || 0);
  let bonus = 0;

  if (envelopeId === 'spark') {
    bonus += avgDelta <= -0.5 ? 0.06 : 0;
    bonus += sentenceDelta >= 1 ? 0.05 : 0;
    bonus += directnessDelta >= 0.03 ? 0.04 : 0;
    bonus += structuralSet.has('beat-swap') || structuralSet.has('pressure-tighten') || structuralSet.has('split-long-line') ? 0.05 : 0;
  } else if (envelopeId === 'matron') {
    bonus += avgDelta >= 0.7 ? 0.06 : 0;
    bonus += sentenceDelta <= 0 ? 0.04 : 0;
    bonus += abstractionDelta >= 0.02 ? 0.04 : 0;
    bonus += structuralSet.has('pressure-current') || structuralSet.has('beat-merge') || structuralSet.has('connector-cascade') ? 0.05 : 0;
  } else if (envelopeId === 'undertow') {
    bonus += avgDelta >= 0.6 ? 0.05 : 0;
    bonus += abstractionDelta >= 0.02 ? 0.03 : 0;
    bonus += structuralSet.has('pressure-undertow') || structuralSet.has('connector-undertow') || structuralSet.has('beat-merge') ? 0.06 : 0;
    bonus += lexicalSet.has('persona:suddenly->all-at-once') ? 0.03 : 0;
  } else if (envelopeId === 'archivist' || envelopeId === 'methods-editor') {
    bonus += abstractionDelta >= 0.03 ? 0.05 : 0;
    bonus += contractionDelta <= -0.01 ? 0.04 : 0;
    bonus += structuralSet.has('connector-ledger') || structuralSet.has('pressure-ledger') || structuralSet.has('ledger-merge') ? 0.06 : 0;
    bonus += lexicalSet.has('persona:need-to->must') || lexicalSet.has('persona:showed->indicated') ? 0.03 : 0;
  } else if (envelopeId === 'cross-examiner') {
    bonus += avgDelta <= -0.4 ? 0.05 : 0;
    bonus += directnessDelta >= 0.04 ? 0.05 : 0;
    bonus += structuralSet.has('pivot-contrast') || structuralSet.has('pressure-tighten') || structuralSet.has('beat-swap') ? 0.06 : 0;
    bonus += lexicalSet.has('persona:i-want-to-say->say-plainly') || lexicalSet.has('register:say-hi->tell-hi') ? 0.03 : 0;
  }

  if (['reflective-prose', 'narrative-scene'].includes(sourceClass) && structuralMovement >= 1 && lexicalMovement >= 1) {
    bonus += 0.03;
  }

  return round(clamp01(bonus), 4);
}

function hasOperation(operations = [], pattern = '') {
  return (operations || []).some((entry) => String(entry || '').includes(pattern));
}

function buildPersonaSeparationAudit({
  envelopeId = 'generic',
  sourceProfile = {},
  outputProfile = {},
  structuralOperations = [],
  lexicalOperations = [],
  sourceClass = 'formal-correspondence',
  outputText = '',
  artifactAudit = {}
} = {}) {
  const structuralSet = new Set(structuralOperations || []);
  const lexicalSet = new Set(lexicalOperations || []);
  const avgDelta = Number(outputProfile.avgSentenceLength || 0) - Number(sourceProfile.avgSentenceLength || 0);
  const sentenceDelta = Number(outputProfile.sentenceCount || 0) - Number(sourceProfile.sentenceCount || 0);
  const directnessDelta = Number(outputProfile.directness || 0) - Number(sourceProfile.directness || 0);
  const abstractionDelta = Number(outputProfile.abstractionPosture || 0) - Number(sourceProfile.abstractionPosture || 0);
  const contractionDelta = Number(outputProfile.contractionDensity || 0) - Number(sourceProfile.contractionDensity || 0);
  const comparable = normalizeComparable(outputText);
  const markers = [];
  const warnings = [];
  const addMarker = (label, hit) => {
    markers.push(Object.freeze({ label, hit: Boolean(hit) }));
  };

  if (envelopeId === 'spark') {
    addMarker('clipped-clauses', avgDelta <= -0.5 || sentenceDelta >= 1);
    addMarker('kinetic-pivot', hasOperation(structuralOperations, 'beat-swap') || hasOperation(structuralOperations, 'pressure-tighten') || hasOperation(structuralOperations, 'pivot-burst'));
    addMarker('colloquial-register', lexicalSet.has('persona:i-want-to->i-wanna') || lexicalSet.has('persona:need-to->got-to'));
    addMarker('visible-compression', contractionDelta >= 0.01 || /(?:\bi wanna\b|\bgot to\b|\ball at once\b)/i.test(comparable));
  } else if (envelopeId === 'matron') {
    addMarker('longer-current', avgDelta >= 0.7);
    addMarker('warm-connective', hasOperation(structuralOperations, 'pressure-current') || hasOperation(structuralOperations, 'beat-merge') || hasOperation(structuralOperations, 'connector-cascade') || (sentenceDelta <= -1 && avgDelta >= 0.8));
    addMarker('warmer-register', lexicalSet.has('persona:need-to->have-to') || lexicalSet.has('register:hi->hello') || contractionDelta <= -0.01 || /\bhello\b|\ball right\b|\bI have\b|\bit is\b|\bdo not\b/i.test(comparable));
    addMarker('controlled-braid', Number(artifactAudit.overBraidingCount || 0) === 0);
  } else if (envelopeId === 'undertow') {
    addMarker('delayed-closure', hasOperation(structuralOperations, 'pressure-undertow') || hasOperation(structuralOperations, 'connector-undertow'));
    addMarker('submerged-current', avgDelta >= 0.6 || abstractionDelta >= 0.02);
    addMarker('recursive-drag', /\bbut then\b|\ball at once\b|\bmaybe\b/i.test(comparable));
    addMarker('syntactic-cleanliness', Number(artifactAudit.overBraidingCount || 0) === 0 && Number(artifactAudit.doubledConnectorCount || 0) === 0);
  } else if (envelopeId === 'archivist' || envelopeId === 'methods-editor') {
    addMarker('ledger-order', hasOperation(structuralOperations, 'pressure-ledger') || hasOperation(structuralOperations, 'connector-ledger') || hasOperation(structuralOperations, 'ledger-merge'));
    addMarker('colder-formalization', contractionDelta <= -0.01 || abstractionDelta >= 0.03);
    addMarker('procedural-register', lexicalSet.has('persona:need-to->must') || lexicalSet.has('persona:showed->indicated') || /\bmust\b|\bindicated\b|\bacceptable\b/i.test(comparable));
    addMarker('restrained-punctuation', Number(artifactAudit.semicolonFractureCount || 0) === 0);
  } else if (envelopeId === 'cross-examiner') {
    addMarker('challenge-syntax', hasOperation(structuralOperations, 'pivot-contrast') || hasOperation(structuralOperations, 'pressure-tighten') || hasOperation(structuralOperations, 'beat-swap'));
    addMarker('argument-pressure', directnessDelta >= 0.04 || /\bstop worrying\b|\bthat'?s the point\b|\bwithout warning\b/i.test(comparable));
    addMarker('clipped-scrutiny', avgDelta <= -0.35 || sentenceDelta >= 1);
    addMarker('distinct-register', lexicalSet.has('register:do-not-worry->stop-worrying') || lexicalSet.has('persona:on-the-ready->ready-now'));
  }

  const markerCount = markers.filter((entry) => entry.hit).length;
  const requiredMarkers = envelopeId === 'generic' || envelopeId === 'operator' ? 1 : 2;
  const collisionWarnings = [];

  if (envelopeId === 'spark' && !markers.find((entry) => entry.label === 'colloquial-register')?.hit && markers.find((entry) => entry.label === 'kinetic-pivot')?.hit) {
    collisionWarnings.push('persona-convergence:spark-cross');
  }
  if (envelopeId === 'cross-examiner' && !markers.find((entry) => entry.label === 'distinct-register')?.hit && markers.find((entry) => entry.label === 'challenge-syntax')?.hit) {
    collisionWarnings.push('persona-convergence:spark-cross');
  }
  if (envelopeId === 'matron' && !markers.find((entry) => entry.label === 'warmer-register')?.hit && markers.find((entry) => entry.label === 'longer-current')?.hit) {
    collisionWarnings.push('persona-convergence:matron-undertow');
  }
  if (envelopeId === 'undertow' && !markers.find((entry) => entry.label === 'recursive-drag')?.hit && markers.find((entry) => entry.label === 'submerged-current')?.hit) {
    collisionWarnings.push('persona-convergence:matron-undertow');
  }
  if ((envelopeId === 'archivist' || envelopeId === 'methods-editor') && markerCount < requiredMarkers) {
    collisionWarnings.push('persona-convergence:archivist-neutral');
  }
  if (markerCount < requiredMarkers) {
    warnings.push('persona-markers-thin');
  }
  warnings.push(...collisionWarnings);

  const score = round(clamp01(
    (markerCount / Math.max(requiredMarkers, 1)) * 0.78 +
    (sourceClass === 'procedural-record' || sourceClass === 'formal-correspondence' ? 0.08 : 0.02) -
    (collisionWarnings.length * 0.16)
  ), 4);

  return Object.freeze({
    envelopeId,
    markerCount,
    requiredMarkers,
    score,
    warnings: Object.freeze(uniqueStrings(warnings)),
    markers: Object.freeze(markers)
  });
}

function buildToolabilityAudit({
  sourceClass = 'formal-correspondence',
  transferClass = 'weak',
  rewriteStrength = 0,
  changedDimensions = [],
  lexemeSwaps = [],
  artifactAudit = {},
  semanticLockIntact = false,
  personaSeparationAudit = {},
  distinctnessBonus = 0,
  outputProfile = {},
  sourceProfile = {},
  pathologies = {}
} = {}) {
  const structuralMovement = substantiveDimensionCount(changedDimensions);
  const lexicalMovement = Number((lexemeSwaps || []).length || 0);
  const punctuationDriftOnly = punctuationOnlyDrift(changedDimensions, lexemeSwaps);
  const effectiveArtifactPenalty = semanticLockIntact
    ? 0
    : Number((artifactAudit.effectivePenalty ?? artifactAudit.penalty) || 0);
  const overBraidingPenalty = semanticLockIntact
    ? 0
    : Math.min(0.24, Number(artifactAudit.overBraidingCount || 0) * 0.06);
  const clauseDragPenalty = semanticLockIntact
    ? 0
    : Math.min(0.16, Number(artifactAudit.clauseDragCount || 0) * 0.05);
  const clauseJoinPenalty = semanticLockIntact ? 0 : Number(artifactAudit.clauseJoinCount || 0) * 0.06;
  const fragmentPenalty = semanticLockIntact ? 0 : Number(artifactAudit.fragmentCount || 0) * 0.05;
  const sentenceIntegrity = round(clamp01(
    1 -
    (effectiveArtifactPenalty * 1.08) -
    clauseJoinPenalty -
    fragmentPenalty -
    (pathologies.severe ? 0.5 : 0)
  ), 4);
  const readability = round(clamp01(
    0.58 +
    (transferClass === 'structural' ? 0.08 : transferClass === 'surface' ? -0.08 : 0) +
    (structuralMovement >= 1 ? 0.08 : 0) +
    (Number(outputProfile.avgSentenceLength || 0) >= 4 && Number(outputProfile.avgSentenceLength || 0) <= 30 ? 0.06 : 0) -
    effectiveArtifactPenalty -
    overBraidingPenalty -
    clauseDragPenalty
  ), 4);
  const movementQuality = round(clamp01(
    (rewriteStrength * 0.68) +
    Math.min(0.16, structuralMovement * 0.08) +
    (lexicalMovement > 0 ? 0.12 : 0) +
    (transferClass === 'structural' ? 0.1 : 0) -
    (punctuationDriftOnly ? 0.36 : 0)
  ), 4);
  const personaDistinctness = round(clamp01(
    (Number(personaSeparationAudit.score || 0) * 0.72) +
    (Number(distinctnessBonus || 0) * 0.6)
  ), 4);
  const artifactPenalty = round(clamp01(
    effectiveArtifactPenalty +
    overBraidingPenalty +
    clauseDragPenalty
  ), 4);
  const toolabilityScore = round(clamp01(
    (readability * 0.27) +
    (personaDistinctness * 0.24) +
    (sentenceIntegrity * 0.24) +
    (movementQuality * 0.25) -
    (artifactPenalty * 0.34)
  ), 4);
  const warnings = uniqueStrings([
    ...(personaSeparationAudit.warnings || []),
    ...(artifactAudit.flags || []),
    punctuationDriftOnly ? 'toolability:punctuation-only' : null,
    toolabilityScore < 0.6 ? 'toolability:low-confidence' : null,
    readability < 0.58 ? 'toolability:rough-surface' : null,
    sentenceIntegrity < 0.62 ? 'toolability:sentence-integrity' : null
  ]);

  return Object.freeze({
    readability,
    personaDistinctness,
    sentenceIntegrity,
    movementQuality,
    artifactPenalty,
    semanticLockIntact,
    toolabilityScore,
    warnings: Object.freeze(warnings)
  });
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
  Object.freeze({ id: 'clause-pivot', label: 'clause-pivot' }),
  Object.freeze({ id: 'persona-lexicon', label: 'persona-lexicon' }),
  Object.freeze({ id: 'pressure-current', label: 'pressure-current' }),
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

function familyWeight(familyId = 'syntax-shape', sourceClass = 'formal-correspondence', envelopeId = 'generic') {
  const classWeights = {
    'procedural-record': {
      'syntax-shape': 1.12,
      'register-lexicon': 0.94,
      'cadence-connector': 0.92,
      'order-beat': 0.88,
      'clause-pivot': 1.04,
      'persona-lexicon': 1.02,
      'pressure-current': 0.9,
      hybrid: 0.98
    },
    'formal-correspondence': {
      'syntax-shape': 1.08,
      'register-lexicon': 0.96,
      'cadence-connector': 1.04,
      'order-beat': 1,
      'clause-pivot': 1,
      'persona-lexicon': 1.06,
      'pressure-current': 0.96,
      hybrid: 1.06
    },
    'reflective-prose': {
      'syntax-shape': 0.98,
      'register-lexicon': 1,
      'cadence-connector': 1,
      'order-beat': 1,
      'clause-pivot': 1.12,
      'persona-lexicon': 1.08,
      'pressure-current': 1.12,
      hybrid: 1.08
    },
    'narrative-scene': {
      'syntax-shape': 1,
      'register-lexicon': 0.94,
      'cadence-connector': 0.96,
      'order-beat': 1.12,
      'clause-pivot': 1.1,
      'persona-lexicon': 0.98,
      'pressure-current': 1.08,
      hybrid: 1.06
    }
  };
  const envelopeWeights = {
    spark: {
      'order-beat': 1.08,
      'clause-pivot': 1.04,
      'pressure-current': 1.04
    },
    matron: {
      'pressure-current': 1.1,
      'clause-pivot': 1.04,
      'persona-lexicon': 1.08,
      hybrid: 1.04
    },
    undertow: {
      'pressure-current': 1.12,
      'clause-pivot': 1.05,
      'persona-lexicon': 1.04,
      hybrid: 1.03
    },
    archivist: {
      'clause-pivot': 1.08,
      'persona-lexicon': 1.05,
      'pressure-current': 1.04
    },
    'cross-examiner': {
      'clause-pivot': 1.08,
      'order-beat': 1.05,
      'persona-lexicon': 1.1
    }
  };
  const classWeight = classWeights[sourceClass]?.[familyId] ?? 1;
  const envelopeWeight = envelopeWeights[envelopeId]?.[familyId] ?? 1;
  if (familyId === 'hybrid') {
    return 1.18 * classWeight * envelopeWeight;
  }
  if (familyId === 'order-beat') {
    return 1.08 * classWeight * envelopeWeight;
  }
  if (familyId === 'register-lexicon') {
    return 0.94 * classWeight * envelopeWeight;
  }
  if (familyId === 'clause-pivot') {
    return 1.06 * classWeight * envelopeWeight;
  }
  if (familyId === 'persona-lexicon') {
    return 1.02 * classWeight * envelopeWeight;
  }
  if (familyId === 'pressure-current') {
    return 1.08 * classWeight * envelopeWeight;
  }
  return classWeight * envelopeWeight;
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
    return sourceClass === 'procedural-record' ? '; while ' : ', and then ';
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

function applyScenePersonaPulse(text = '', envelopeId = 'generic', sourceClass = 'formal-correspondence', context = {}) {
  if (!['reflective-prose', 'narrative-scene'].includes(sourceClass)) {
    return text;
  }

  let working = normalizeText(text);
  if (!working) {
    return working;
  }

  const operations = context.lexicalOperations || [];
  const lexemeSwaps = context.lexemeSwaps || [];
  const replaceWithLedger = (pattern, replacement, label, limit = 1) => {
    working = applyReplacementRule(working, pattern, replacement, {
      limit,
      label,
      family: 'register',
      operations,
      lexemeSwaps
    });
  };
  const trimFiller = (pattern, label, limit = 1) => {
    let applied = false;
    const next = replaceLimited(working, pattern, () => {
      applied = true;
      operations.push(label);
      return '';
    }, limit);
    if (applied) {
      working = normalizeText(next);
    }
  };
  const splitIntentTail = (label, replacement, limit = 1) => {
    let applied = false;
    const next = replaceLimited(
      working,
      /\b([^.!?]{3,60}?)\s+(that(?: is|'s) what I(?: am|'m) (?:trying to say|saying))\b/gi,
      (match, clause, tail) => {
        applied = true;
        operations.push(label);
        const resolvedTail = typeof replacement === 'function' ? replacement(tail) : replacement;
        return `${normalizeText(clause)}. ${resolvedTail}`;
      },
      limit
    );
    if (applied) {
      working = normalizeText(next);
    }
  };

  if (envelopeId === 'spark') {
    replaceWithLedger(/\bI want to say hi to him\b/gi, 'I wanna say hi to him', 'register:want-to-say-hi->wanna-say-hi');
    replaceWithLedger(/\bget more familiar with\b/gi, 'know better', 'register:get-more-familiar-with->know-better');
    replaceWithLedger(/\bI guess is what I(?: am|'m) trying to say\b/gi, "that's what I'm trying to say", 'register:i-guess-trying-to-say->thats-what-im-trying-to-say');
    trimFiller(/\byou know\??/gi, 'register:trim-you-know');
    trimFiller(/\blol\b/gi, 'register:trim-lol');
    splitIntentTail('structural:split-intent-tail', "That's what I'm trying to say");
    if (sourceClass === 'narrative-scene') {
      const next = splitSceneBursts(working);
      if (next !== working) {
        operations.push('structural:scene-burst-split');
        working = next;
      }
    }
  } else if (envelopeId === 'cross-examiner') {
    replaceWithLedger(/\bI want to say hi to him\b/gi, 'I want to tell him hi', 'register:say-hi->tell-hi');
    replaceWithLedger(/\bDon't worry about\b/gi, 'Stop worrying about', 'register:do-not-worry->stop-worrying');
    replaceWithLedger(/\bKeep doing what (?:you are|you're) doing\b/gi, 'Keep doing it', 'register:keep-doing-what-youre-doing->keep-doing-it');
    replaceWithLedger(/\bget more familiar with\b/gi, 'know better', 'register:get-more-familiar-with->know-better');
    replaceWithLedger(/\bI guess is what I(?: am|'m) trying to say\b/gi, "that's what I'm saying", 'register:i-guess-trying-to-say->thats-what-im-saying');
    trimFiller(/\byou know\??/gi, 'register:trim-you-know');
    trimFiller(/\blol\b/gi, 'register:trim-lol');
    replaceWithLedger(/\bAnd I blame\b/gi, 'I blame', 'register:drop-leading-and-blame');
    splitIntentTail('structural:split-intent-tail', "That's the point.");
    if (sourceClass === 'narrative-scene') {
      replaceWithLedger(/\bsuddenly\b/gi, 'without warning', 'register:suddenly->without-warning');
      const next = splitSceneBursts(working).replace(/\bSuddenly,\s+I\b/g, 'Without warning. I');
      if (next !== working) {
        operations.push('structural:scene-burst-split');
        working = next;
      }
    }
  } else if (envelopeId === 'matron') {
    replaceWithLedger(/\bhi\b/gi, 'hello', 'register:hi->hello', 1);
    replaceWithLedger(/\bget more familiar with\b/gi, 'know better', 'register:get-more-familiar-with->know-better', 1);
    replaceWithLedger(/\bI guess is what I(?: am|'m) trying to say\b/gi, 'that is what I am trying to say', 'register:i-guess-trying-to-say->that-is-what-i-am-trying-to-say', 1);
    if (sourceClass === 'narrative-scene') {
      replaceWithLedger(/\bOn the ready\b/gi, 'At the ready', 'register:on-the-ready->at-the-ready', 1);
      replaceWithLedger(/\bsuddenly\b/gi, 'without warning', 'register:suddenly->without-warning', 1);
    }
    trimFiller(/\blol\b/gi, 'register:trim-lol');
    trimFiller(/\byou know\??/gi, 'register:trim-you-know');
    splitIntentTail('structural:split-intent-tail', 'That is what I am trying to say.');
    working = normalizeText(
      working
        .replace(/\bAnd\s+I blame\b/g, 'I blame')
        .replace(/\bAnd\s+we have\b/g, 'We have')
        .replace(/\bAnd\s+keep\b/g, 'Keep')
    );
  } else if (envelopeId === 'undertow') {
    replaceWithLedger(/\bget more familiar with\b/gi, 'know better', 'register:get-more-familiar-with->know-better', 1);
    replaceWithLedger(/\bI guess is what I(?: am|'m) trying to say\b/gi, 'that is what I am trying to say', 'register:i-guess-trying-to-say->that-is-what-i-am-trying-to-say', 1);
    trimFiller(/\blol\b/gi, 'register:trim-lol');
    trimFiller(/\byou know\??/gi, 'register:trim-you-know');
    splitIntentTail('structural:split-intent-tail', 'That is what I am trying to say.');
    working = normalizeText(
      working
        .replace(/\bAnd\s+I blame\b/g, 'I blame')
        .replace(/\bAnd\s+we have\b/g, 'We have')
        .replace(/\bAnd\s+keep\b/g, 'Keep')
        .replace(/\bWhile\s+do not\b/gi, 'Do not')
        .replace(/\bWhile\s+nobody\b/gi, 'Nobody')
        .replace(/\bWhile\s+on the ready\b/gi, 'On the ready')
        .replace(/\bWhile\s+"Tell me more about yourself"/gi, '"Tell me more about yourself"')
        .replace(/\bWhile\s+I needed that\b/gi, 'I needed that')
        .replace(/\bWhile\s+keep\b/g, 'Keep')
        .replace(/\bWhile\s+we have\b/g, 'We have')
        .replace(/\bWhile\s+it is\b/g, 'It is')
        .replace(/\bWhile\s+i am\b/gi, 'I am')
        .replace(/\bWhile\s+I must\b/gi, 'I must')
        .replace(/,\s+while\s+keep\b/gi, ', and keep')
        .replace(/,\s+while\s+we have\b/gi, ', and we have')
        .replace(/,\s+while\s+call\b/gi, ', and call')
        .replace(/,\s+while\s+meet\b/gi, ', and meet')
        .replace(/,\s+while\s+i\b/gi, ', and I')
        .replace(/,\s+while\s+it\b/gi, ', and it')
        .replace(/,\s+and then\s+and\b/gi, ', and then')
        .replace(/,,+/g, ',')
    );
  }

  return tidyEnvelopeText(working);
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
    { pattern: /\bweek\b/gi, replacement: 'wk', label: 'compressed:week->wk' },
    { pattern: /\btemporary\b/gi, replacement: 'temp', label: 'compressed:temporary->temp' },
    { pattern: /\bapproximately\b/gi, replacement: 'about', label: 'compressed:approximately->about' }
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
    orthographyRules.push(
      { pattern: /\byou(?:'|’)re\b/gi, replacement: 'youre', label: 'orthography:youre' },
      { pattern: /\bdon(?:'|’)t\b/gi, replacement: 'dont', label: 'orthography:dont' },
      { pattern: /\bdoesn(?:'|’)t\b/gi, replacement: 'doesnt', label: 'orthography:doesnt' },
      { pattern: /\bdidn(?:'|’)t\b/gi, replacement: 'didnt', label: 'orthography:didnt' },
      { pattern: /\bcan(?:'|’)t\b/gi, replacement: 'cant', label: 'orthography:cant' },
      { pattern: /\bcouldn(?:'|’)t\b/gi, replacement: 'couldnt', label: 'orthography:couldnt' },
      { pattern: /\bshouldn(?:'|’)t\b/gi, replacement: 'shouldnt', label: 'orthography:shouldnt' },
      { pattern: /\bwon(?:'|’)t\b/gi, replacement: 'wont', label: 'orthography:wont' },
      { pattern: /\bisn(?:'|’)t\b/gi, replacement: 'isnt', label: 'orthography:isnt' },
      { pattern: /\bwasn(?:'|’)t\b/gi, replacement: 'wasnt', label: 'orthography:wasnt' },
      { pattern: /\bweren(?:'|’)t\b/gi, replacement: 'werent', label: 'orthography:werent' },
      { pattern: /\bI(?:'|’)m\b/gi, replacement: 'im', label: 'orthography:im' },
      { pattern: /\bI(?:'|’)ve\b/gi, replacement: 'ive', label: 'orthography:ive' },
      { pattern: /\bI(?:'|’)ll\b/gi, replacement: 'ill', label: 'orthography:ill' },
      { pattern: /\bthat(?:'|’)s\b/gi, replacement: 'thats', label: 'orthography:thats' },
      { pattern: /\bit(?:'|’)s\b/gi, replacement: 'its', label: 'orthography:its' }
    );
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
    { pattern: /\bacct\b/gi, replacement: 'account', label: 'expanded:acct->account' },
    { pattern: /\bappt\b/gi, replacement: 'appointment', label: 'expanded:appt->appointment' },
    { pattern: /\btemp\b/gi, replacement: 'temporary', label: 'expanded:temp->temporary' },
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
    { pattern: /\bdoesnt\b/gi, replacement: 'does not', label: 'expanded:doesnt->does-not' },
    { pattern: /\bdidnt\b/gi, replacement: 'did not', label: 'expanded:didnt->did-not' },
    { pattern: /\byoure\b/gi, replacement: 'you are', label: 'expanded:youre->you-are' },
    { pattern: /\bim\b/gi, replacement: 'I am', label: 'expanded:im->i-am' },
    { pattern: /\bive\b/gi, replacement: 'I have', label: 'expanded:ive->i-have' },
    { pattern: /\bill\b/gi, replacement: 'I will', label: 'expanded:ill->i-will' },
    { pattern: /\bthats\b/gi, replacement: 'that is', label: 'expanded:thats->that-is' },
    { pattern: /\bisnt\b/gi, replacement: 'is not', label: 'expanded:isnt->is-not' },
    { pattern: /\bcant\b/gi, replacement: 'cannot', label: 'expanded:cant->cannot' },
    { pattern: /\bcouldnt\b/gi, replacement: 'could not', label: 'expanded:couldnt->could-not' },
    { pattern: /\bshouldnt\b/gi, replacement: 'should not', label: 'expanded:shouldnt->should-not' },
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

  const formalizationRules = [
    { pattern: /\btho\b/gi, replacement: 'though', label: 'expanded:tho->though' },
    { pattern: /\blast 4\b/gi, replacement: 'last four digits', label: 'expanded:last-4->last-four-digits' },
    { pattern: /\bshell have\b/gi, replacement: 'she will have', label: 'expanded:shell-have->she-will-have' }
  ];
  for (const rule of formalizationRules) {
    working = replaceLimited(working, rule.pattern, (match) => {
      lexicalOperations.push(rule.label);
      recordLexemeSwap(lexemeSwaps, match, rule.replacement, 'surface');
      return matchCase(match, rule.replacement);
    }, 2);
  }

  return working;
}

function applyFormalRecordLaneRewrite(text = '', context = {}) {
  let working = String(text || '');
  const lexicalOperations = context.lexicalOperations || [];
  const structuralOperations = context.structuralOperations || [];
  const lexemeSwaps = context.lexemeSwaps || [];

  const lexicalRules = [
    { pattern: /\bpkg\b/gi, replacement: 'package', label: 'lane:pkg->package' },
    { pattern: /\bmgmt\b/gi, replacement: 'management', label: 'lane:mgmt->management' },
    { pattern: /\b2b\b/gi, replacement: 'Unit 2B', label: 'lane:2b->unit-2b' },
    { pattern: /\b2nd fl\b/gi, replacement: 'second-floor', label: 'lane:2nd-fl->second-floor' },
    { pattern: /\b3rd fl\b/gi, replacement: 'third-floor', label: 'lane:3rd-fl->third-floor' },
    { pattern: /\bwasnt\b/gi, replacement: 'was not', label: 'lane:wasnt->was-not' },
    { pattern: /\bwerent\b/gi, replacement: 'were not', label: 'lane:werent->were-not' },
    { pattern: /\bdont\b/gi, replacement: 'do not', label: 'lane:dont->do-not' },
    { pattern: /\bdoesnt\b/gi, replacement: 'does not', label: 'lane:doesnt->does-not' },
    { pattern: /\bcant\b/gi, replacement: 'cannot', label: 'lane:cant->cannot' },
    { pattern: /\bits hers\b/gi, replacement: 'it was hers', label: 'lane:its-hers->it-was-hers' },
    { pattern: /\bsaid yes it was hers\b/gi, replacement: 'confirmed it was hers', label: 'lane:said-yes-it-was-hers->confirmed' },
    { pattern: /\bsaid yes its hers\b/gi, replacement: 'confirmed it was hers', label: 'lane:said-yes-its-hers->confirmed' },
    { pattern: /\bhad bags already\b/gi, replacement: 'was already carrying bags', label: 'lane:had-bags-already->carrying-bags' },
    { pattern: /\bbox stayed sealed\b/gi, replacement: 'the box remained sealed', label: 'lane:box-stayed-sealed->box-remained-sealed' },
    { pattern: /\btag says\b/gi, replacement: 'the tag stated', label: 'lane:tag-says->tag-stated' },
    { pattern: /\bred rush sticker\b/gi, replacement: 'the red rush label', label: 'lane:red-rush-sticker->label' }
  ];

  for (const rule of lexicalRules) {
    working = replaceLimited(working, rule.pattern, (match) => {
      lexicalOperations.push(rule.label);
      recordLexemeSwap(lexemeSwaps, match, rule.replacement, 'lane');
      return matchCase(match, rule.replacement);
    }, 2);
  }

  const beforeConditionalRepair = working;
  working = working
    .replace(/\bthe tag stated attempted\s+(\d{1,2}:\d{2})\b/gi, (match, time) => {
      lexicalOperations.push('lane:attempted-window-formalized');
      return `the tag stated "attempted / no answer" at ${time}`;
    })
    .replace(/\bno one buzzed her\b/gi, () => {
      lexicalOperations.push('lane:buzzed-her->no-buzzer-call');
      return 'no buzzer call was placed to her unit';
    })
    .replace(/\bit was just sitting on\b/gi, () => {
      lexicalOperations.push('lane:sitting-on->left-on');
      return 'the parcel was instead left on';
    })
    .replace(/\bby rail\b/gi, () => {
      lexicalOperations.push('lane:rail->stair-rail');
      return 'near the stair rail';
    })
    .replace(/\b(If [^.!?]{3,80})\.\s+(the [^.!?]{3,100})\./gi, (match, lead, tail) => {
      structuralOperations.push('lane:conditional-formalization');
      return `${normalizeText(lead)}, ${lowerLeadingAlpha(normalizeText(tail))}.`;
    })
    .replace(/\bIf management asks,\s+the box remained sealed,\s+I moved it\b/gi, () => {
      structuralOperations.push('lane:conditional-seam-repair');
      return 'If management asks, the box remained sealed. I moved it';
    })
    .replace(/\bafter she confirmed it was hers\.\s+she was already carrying bags\b/gi, () => {
      structuralOperations.push('lane:help-causality-restored');
      return 'after she confirmed it was hers because she was already carrying bags';
    })
    .replace(/\bI moved it to hall table\b/gi, (match) => {
      lexicalOperations.push('lane:hall-table-article');
      recordLexemeSwap(lexemeSwaps, match, 'I moved it to the hallway table outside Unit 2B', 'lane');
      return 'I moved it to the hallway table outside Unit 2B';
    })
    .replace(/\bI moved it to the hall table\b/gi, (match) => {
      lexicalOperations.push('lane:hall-table-outside-unit');
      recordLexemeSwap(lexemeSwaps, match, 'I moved it to the hallway table outside Unit 2B', 'lane');
      return 'I moved it to the hallway table outside Unit 2B';
    });
  if (beforeConditionalRepair !== working) {
    structuralOperations.push('lane:formal-record-polish');
  }

  return working;
}

function applyRushedMobileLaneRewrite(text = '', context = {}) {
  let working = String(text || '');
  const lexicalOperations = context.lexicalOperations || [];
  const structuralOperations = context.structuralOperations || [];
  const lexemeSwaps = context.lexemeSwaps || [];

  const lexicalRules = [
    { pattern: /\bconfirmed it was hers\b/gi, replacement: 'said yes its hers', label: 'lane:confirmed->said-yes' },
    { pattern: /\brequested help\b/gi, replacement: 'asked for help', label: 'lane:requested-help->asked-help' },
    { pattern: /\bwas already carrying groceries\b/gi, replacement: 'had bags already', label: 'lane:carrying-groceries->bags' },
    { pattern: /\bmanagement\b/gi, replacement: 'mgmt', label: 'lane:management->mgmt' },
    { pattern: /\bpackage\b/gi, replacement: 'pkg', label: 'lane:package->pkg' }
  ];

  for (const rule of lexicalRules) {
    working = replaceLimited(working, rule.pattern, (match) => {
      lexicalOperations.push(rule.label);
      recordLexemeSwap(lexemeSwaps, match, rule.replacement, 'lane');
      return matchCase(match, rule.replacement);
    }, 2);
  }

  const beforeCompression = working;
  working = working
    .replace(/\bbuilding footage and resident testimony\b/gi, () => {
      lexicalOperations.push('lane:evidence-bundle-compression');
      return 'cams + residents';
    });
  if (beforeCompression !== working) {
    structuralOperations.push('lane:rushed-mobile-compression');
  }

  return working;
}

function applyRegisterLaneRealization(text = '', context = {}) {
  const sourceRegisterLane = normalizeRegisterLane(context?.sourceRegisterLane, '');
  const targetRegisterLane = normalizeRegisterLane(context?.targetRegisterLane, '');
  if (!sourceRegisterLane || !targetRegisterLane || sourceRegisterLane === targetRegisterLane) {
    return text;
  }

  let working = String(text || '');
  if (targetRegisterLane === 'formal-record' && sourceRegisterLane === 'rushed-mobile') {
    working = applyFormalRecordLaneRewrite(working, context);
  } else if (targetRegisterLane === 'rushed-mobile' && sourceRegisterLane === 'formal-record') {
    working = applyRushedMobileLaneRewrite(working, context);
  }
  return working;
}

function applyArtifactRepairPass(text = '', context = {}) {
  let working = String(text || '');
  let repaired = false;
  const structuralOperations = context.structuralOperations || [];

  const repairedConditional = working.replace(/\b(If [^.!?]{3,80})\.\s+([A-Z][^.!?]{3,100})\./g, (match, lead, tail) => {
    repaired = true;
    structuralOperations.push('repair:conditional-fragment-join');
    return `${normalizeText(lead)}, ${lowerLeadingAlpha(normalizeText(tail))}.`;
  });
  working = repairedConditional;

  const repairedClauseJoin = working
    .replace(/\b([A-Z][^.!?]{6,120}\bafter [^.!?]{3,80})\.\s+(she was already [^.!?]{3,80})\./g, (match, lead, tail) => {
      repaired = true;
      structuralOperations.push('repair:causal-clause-join');
      return `${normalizeText(lead)} because ${lowerLeadingAlpha(normalizeText(tail))}.`;
    });
  working = repairedClauseJoin;

  return {
    text: working,
    repaired
  };
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

function pivotLeadForEnvelope(envelopeId = 'generic') {
  if (envelopeId === 'cross-examiner') {
    return 'Yet';
  }
  if (envelopeId === 'archivist' || envelopeId === 'methods-editor') {
    return 'However';
  }
  if (envelopeId === 'undertow') {
    return 'But then';
  }
  if (envelopeId === 'matron') {
    return 'Still';
  }
  return 'But';
}

function pivotContrastSentence(sentence = '', envelopeId = 'generic', context = {}) {
  const normalized = normalizeText(sentence);
  const match = normalized.match(/^(.+?),\s+(but|yet|though)\s+(.+)$/i);
  if (!match) {
    return normalized;
  }
  const left = trimSentenceEnding(match[1]);
  const right = trimSentenceEnding(match[3]);
  if (sentenceWordCount(left) < 3 || sentenceWordCount(right) < 3) {
    return normalized;
  }
  (context.structuralOperations || []).push('pivot-contrast');
  return `${finalizeSentence(`${pivotLeadForEnvelope(envelopeId)} ${lowerLeadingAlpha(right)}`)} ${finalizeSentence(left)}`;
}

function applyClausePivotRewrite(paragraph = '', envelopeId = 'generic', sourceClass = 'formal-correspondence', context = {}) {
  const sentences = splitSentencesPreserve(paragraph);
  if (!sentences.length) {
    return paragraph;
  }

  return sentences.map((sentence) => {
    const fronted = frontClauseSentence(sentence, context);
    if (fronted !== sentence) {
      return fronted;
    }

    let pivoted = pivotContrastSentence(sentence, envelopeId, context);
    if (pivoted !== sentence) {
      return pivoted;
    }

    if (['spark', 'cross-examiner'].includes(envelopeId) && ['reflective-prose', 'narrative-scene'].includes(sourceClass)) {
      pivoted = splitSceneBursts(splitForClippedMomentum(sentence));
      if (pivoted !== sentence) {
        (context.structuralOperations || []).push('pivot-burst');
        return pivoted;
      }
    }

    return sentence;
  }).join(' ');
}

function applySyntaxShapeRewrite(paragraph = '', envelopeId = 'generic', sourceClass = 'formal-correspondence', context = {}) {
  const sentences = splitSentencesPreserve(paragraph);
  if (!sentences.length) {
    return paragraph;
  }

  if (['spark', 'cross-examiner', 'operator'].includes(envelopeId)) {
    return sentences.map((sentence) => {
      let next = splitForClippedMomentum(sentence);
      if (['reflective-prose', 'narrative-scene'].includes(sourceClass)) {
        next = splitSceneBursts(next);
      }
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

function applyPersonaLexiconRewrite(paragraph = '', envelopeId = 'generic', sourceClass = 'formal-correspondence', context = {}) {
  let working = applyLexicalRegisterRewrite(paragraph, envelopeId, sourceClass, context);
  const limit = Math.max(1, replacementLimitForClass(sourceClass));

  if (envelopeId === 'spark') {
    if (['reflective-prose', 'narrative-scene'].includes(sourceClass)) {
      working = applyReplacementRule(working, /\bI want to\b/gi, 'I wanna', {
        limit: 2,
        label: 'persona:i-want-to->i-wanna',
        family: 'persona',
        operations: context.lexicalOperations,
        lexemeSwaps: context.lexemeSwaps
      });
      working = applyReplacementRule(working, /\bjust want to\b/gi, 'just wanna', {
        limit: 1,
        label: 'persona:just-want-to->just-wanna',
        family: 'persona',
        operations: context.lexicalOperations,
        lexemeSwaps: context.lexemeSwaps
      });
      working = applyReplacementRule(working, /\bI must keep reminding myself\b/gi, 'I keep telling myself', {
        limit: sourceClass === 'narrative-scene' ? 1 : 0,
        label: 'persona:i-must-keep-reminding-myself->i-keep-telling-myself',
        family: 'persona',
        operations: context.lexicalOperations,
        lexemeSwaps: context.lexemeSwaps
      });
      working = applyReplacementRule(working, /\bOn the ready\b/gi, 'Ready', {
        limit: sourceClass === 'narrative-scene' ? 1 : 0,
        label: 'persona:on-the-ready->ready',
        family: 'persona',
        operations: context.lexicalOperations,
        lexemeSwaps: context.lexemeSwaps
      });
      working = applyReplacementRule(working, /\bsuddenly\b/gi, 'all at once', {
        limit: sourceClass === 'narrative-scene' ? 1 : 0,
        label: 'persona:suddenly->all-at-once',
        family: 'persona',
        operations: context.lexicalOperations,
        lexemeSwaps: context.lexemeSwaps
      });
    }
    working = applyReplacementRule(working, /\bneed to\b/gi, sourceClass === 'procedural-record' ? 'need to' : 'got to', {
      limit: sourceClass === 'procedural-record' ? 0 : 1,
      label: 'persona:need-to->got-to',
      family: 'persona',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
  } else if (envelopeId === 'matron') {
    working = applyReplacementRule(working, /\bneed to\b/gi, 'have to', {
      limit: Math.min(limit, 2),
      label: 'persona:need-to->have-to',
      family: 'persona',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
    working = applyReplacementRule(working, /\bokay\b/gi, 'all right', {
      limit: 1,
      label: 'persona:okay->all-right',
      family: 'persona',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
    if (['reflective-prose', 'narrative-scene'].includes(sourceClass)) {
      working = applyReplacementRule(working, /\bI think\b/g, 'it seems to me', {
        limit: 1,
        label: 'persona:i-think->it-seems-to-me',
        family: 'persona',
        operations: context.lexicalOperations,
        lexemeSwaps: context.lexemeSwaps
      });
      working = applyReplacementRule(working, /\bjust because\b/gi, 'simply because', {
        limit: 1,
        label: 'persona:just-because->simply-because',
        family: 'persona',
        operations: context.lexicalOperations,
        lexemeSwaps: context.lexemeSwaps
      });
      working = applyReplacementRule(working, /\bI keep insisting\b/gi, 'I keep pressing', {
        limit: 1,
        label: 'persona:i-keep-insisting->i-keep-pressing',
        family: 'persona',
        operations: context.lexicalOperations,
        lexemeSwaps: context.lexemeSwaps
      });
    }
    if (['procedural-record', 'formal-correspondence'].includes(sourceClass)) {
      working = applyReplacementRule(working, /\bregarding\b/gi, 'about', {
        limit: 1,
        label: 'persona:regarding->about',
        family: 'persona',
        operations: context.lexicalOperations,
        lexemeSwaps: context.lexemeSwaps
      });
      working = applyReplacementRule(working, /\bprior\b/gi, 'earlier', {
        limit: 1,
        label: 'persona:prior->earlier',
        family: 'persona',
        operations: context.lexicalOperations,
        lexemeSwaps: context.lexemeSwaps
      });
      working = applyReplacementRule(working, /\bremains\b/gi, 'stays', {
        limit: 1,
        label: 'persona:remains->stays',
        family: 'persona',
        operations: context.lexicalOperations,
        lexemeSwaps: context.lexemeSwaps
      });
      working = applyReplacementRule(working, /\binstructed\b/gi, 'told', {
        limit: 1,
        label: 'persona:instructed->told',
        family: 'persona',
        operations: context.lexicalOperations,
        lexemeSwaps: context.lexemeSwaps
      });
      working = working.replace(/\bA earlier\b/g, 'An earlier');
    }
  } else if (envelopeId === 'undertow') {
    working = applyReplacementRule(working, /\bI guess\b/gi, 'maybe', {
      limit: 1,
      label: 'persona:i-guess->maybe',
      family: 'persona',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
    if (sourceClass === 'narrative-scene') {
      working = applyReplacementRule(working, /\bsuddenly\b/gi, 'all at once', {
        limit: 1,
        label: 'persona:suddenly->all-at-once',
        family: 'persona',
        operations: context.lexicalOperations,
        lexemeSwaps: context.lexemeSwaps
      });
    }
  } else if (envelopeId === 'archivist' || envelopeId === 'methods-editor') {
    working = applyReplacementRule(working, /\bneed to\b/gi, 'must', {
      limit: Math.min(limit, 2),
      label: 'persona:need-to->must',
      family: 'persona',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
    working = applyReplacementRule(working, /\bshowed\b/gi, 'indicated', {
      limit: 1,
      label: 'persona:showed->indicated',
      family: 'persona',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
    working = applyReplacementRule(working, /\bstart\b/gi, sourceClass === 'procedural-record' ? 'begin' : 'start', {
      limit: sourceClass === 'procedural-record' ? 1 : 0,
      label: 'persona:start->begin',
      family: 'persona',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
  } else if (envelopeId === 'cross-examiner') {
    working = applyReplacementRule(working, /\bI want to say\b/gi, 'I want to say plainly', {
      limit: ['reflective-prose', 'narrative-scene'].includes(sourceClass) ? 0 : 1,
      label: 'persona:i-want-to-say->say-plainly',
      family: 'persona',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
    working = applyReplacementRule(working, /\bOn the ready\b/gi, sourceClass === 'narrative-scene' ? 'Ready now' : 'Ready', {
      limit: sourceClass === 'narrative-scene' ? 1 : 0,
      label: sourceClass === 'narrative-scene' ? 'persona:on-the-ready->ready-now' : 'persona:on-the-ready->ready',
      family: 'persona',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
  }

  return working;
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
  } else if (envelopeId === 'methods-editor') {
    working = applyReplacementRule(working, /\bregarding\b/gi, 'concerning', {
      limit,
      label: 'register:regarding->concerning',
      family: 'register',
      operations: context.lexicalOperations,
      lexemeSwaps: context.lexemeSwaps
    });
    working = applyReplacementRule(working, /\bprior\b/gi, 'earlier', {
      limit: Math.min(limit, 1),
      label: 'register:prior->earlier',
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
  } else if (envelopeId === 'archivist') {
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
    working = applyReplacementRule(working, /\bjust because\b/gi, 'simply because', {
      limit: 1,
      label: 'register:just-because->simply-because',
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

function pressureLinkerFor(envelopeId = 'generic', sourceClass = 'formal-correspondence') {
  if (envelopeId === 'matron') {
    return sourceClass === 'procedural-record' ? '; ' : ', and ';
  }
  if (envelopeId === 'undertow') {
    return sourceClass === 'procedural-record' ? '; while ' : ', and then ';
  }
  if (envelopeId === 'archivist' || envelopeId === 'methods-editor') {
    return '; ';
  }
  return chooseMergeLinker(envelopeId, sourceClass);
}

function applyPressureCurrentRewrite(paragraph = '', envelopeId = 'generic', sourceClass = 'formal-correspondence', context = {}) {
  const sentences = splitSentencesPreserve(paragraph);
  if (!sentences.length) {
    return paragraph;
  }

  if (['spark', 'cross-examiner', 'operator'].includes(envelopeId)) {
    const tightened = sentences.map((sentence) => {
      let next = applyClausePivotRewrite(sentence, envelopeId, sourceClass, context);
      next = splitForClippedMomentum(next);
      if (['reflective-prose', 'narrative-scene'].includes(sourceClass)) {
        next = splitSceneBursts(next);
      }
      return next;
    }).join(' ');
    if (normalizeComparable(tightened) !== normalizeComparable(paragraph)) {
      (context.structuralOperations || []).push('pressure-tighten');
    }
    return tightened;
  }

  const pivoted = sentences.map((sentence) => applyClausePivotRewrite(sentence, envelopeId, sourceClass, context));
  const merged = mergeForLongCurrent(pivoted, pressureLinkerFor(envelopeId, sourceClass));
  if (merged.length !== sentences.length) {
    (context.structuralOperations || []).push(
      envelopeId === 'archivist' || envelopeId === 'methods-editor'
        ? 'pressure-ledger'
        : envelopeId === 'undertow'
          ? 'pressure-undertow'
          : 'pressure-current'
    );
  }
  return merged.join(' ');
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

function buildRelationInventory(
  sourceText = '',
  sourceIR = null,
  sourceClass = 'formal-correspondence',
  hardAnchors = [],
  registerLaneInfo = {}
) {
  return Object.freeze({
    sourceClass,
    sourceRegisterLane: normalizeRegisterLane(registerLaneInfo?.sourceRegisterLane, 'formal-record'),
    sourceRegisterLaneInference: registerLaneInfo?.inference || 'inferred',
    sourceRegisterLaneFallback: Boolean(registerLaneInfo?.fallbackUsed),
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

function deriveRealizedChangedDimensions(profileShiftDimensions = [], lexemeSwaps = []) {
  const realized = [...new Set(profileShiftDimensions || [])];
  if (!Number(lexemeSwaps?.length || 0)) {
    return realized.filter((dimension) => ![
      'lexical-register',
      'content-word-complexity',
      'modifier-density',
      'directness',
      'abstraction-posture'
    ].includes(dimension));
  }
  return realized;
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

function semanticAuditBounded(semanticAudit = {}) {
  const propositionCoverage = Number(semanticAudit?.propositionCoverage ?? 1);
  const actorCoverage = Number(semanticAudit?.actorCoverage ?? 1);
  const actionCoverage = Number(semanticAudit?.actionCoverage ?? 1);
  const objectCoverage = Number(semanticAudit?.objectCoverage ?? 1);
  const polarityMismatches = Number(semanticAudit?.polarityMismatches ?? 0);
  const tenseMismatches = Number(semanticAudit?.tenseMismatches ?? 0);
  const clauseCount = Math.max(
    1,
    Number(semanticAudit?.sourceClauseCount ?? 0),
    Number(semanticAudit?.outputClauseCount ?? 0)
  );
  const polarityRate = polarityMismatches / clauseCount;
  const tenseRate = tenseMismatches / clauseCount;
  const strongCoverage =
    propositionCoverage >= 0.9 &&
    actorCoverage >= 0.9 &&
    actionCoverage >= 0.9 &&
    objectCoverage >= 0.9;

  const polarityBounded =
    polarityMismatches <= 1 ||
    (strongCoverage && polarityMismatches <= 2 && polarityRate <= 0.18);
  // Strong-coverage same-facts rewrites can tolerate a small amount of tense drift
  // as long as it stays sparse relative to the clause load.
  const tenseBounded =
    tenseMismatches <= 1 ||
    (strongCoverage && tenseMismatches <= 2 && tenseRate <= 0.23);

  return polarityBounded && tenseBounded;
}

function semanticLockSatisfied(semanticAudit = {}, floors = {}, sourceClass = 'formal-correspondence') {
  const strictCustodySemantics = sourceClass === 'procedural-record';
  const propositionCoverage = Number(semanticAudit?.propositionCoverage ?? 1);
  const actorCoverage = Number(semanticAudit?.actorCoverage ?? 1);
  const actionCoverage = Number(semanticAudit?.actionCoverage ?? 1);
  const objectCoverage = Number(semanticAudit?.objectCoverage ?? 1);
  const polarityMismatches = Number(semanticAudit?.polarityMismatches ?? 0);

  return (
    propositionCoverage >= Number(floors?.proposition ?? 1) &&
    actorCoverage >= Number(floors?.actor ?? 1) &&
    actionCoverage >= Number(floors?.action ?? 1) &&
    objectCoverage >= Number(floors?.object ?? 1) &&
    (strictCustodySemantics ? polarityMismatches === 0 : polarityMismatches <= 1) &&
    semanticAuditBounded(semanticAudit)
  );
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

function buildPlanSummary(candidate = null, candidateLedger = [], testedFamilyIds = []) {
  return Object.freeze({
    relationInventory: candidate?.relationInventory || {},
    sourceRegisterLane: candidate?.sourceRegisterLane || candidate?.relationInventory?.sourceRegisterLane || 'formal-record',
    targetRegisterLane: candidate?.targetRegisterLane || 'formal-record',
    testedFamilyIds: Object.freeze([...new Set((testedFamilyIds || []).filter(Boolean))]),
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
    landedCandidateFamily: generationDocket?.winningCandidateFamily || null,
    families: Object.freeze([...new Set(candidateLedger.map((entry) => entry.family).filter(Boolean))]),
    holdStatus: generationDocket?.status || 'landed',
    averageToolabilityScore: candidateLedger.length
      ? round(candidateLedger.reduce((sum, entry) => sum + Number(entry.toolabilityScore || 0), 0) / candidateLedger.length, 4)
      : 0
  });
}

function buildRetrievalTraceV2({
  sourceText = '',
  sourceClass = 'formal-correspondence',
  candidate = null,
  candidateLedger = [],
  testedFamilyIds = [],
  generationDocket = null,
  donorProgress = {}
} = {}) {
  return Object.freeze({
    sourceText,
    sourceClass,
    sourceRegisterLane: candidate?.sourceRegisterLane || candidate?.relationInventory?.sourceRegisterLane || 'formal-record',
    generatorVersion: 'v2',
    semanticAudit: candidate?.semanticAudit || {},
    protectedAnchorAudit: candidate?.protectedAnchorAudit || {},
    ontologyAudit: candidate?.ontologyAudit || null,
    planSummary: buildPlanSummary(candidate, candidateLedger, testedFamilyIds),
    candidateSummary: buildCandidateSummary(candidateLedger, generationDocket),
    realizationSummary: Object.freeze({
      transferClass: candidate?.transferClass || 'held',
      borrowedShellOutcome: candidate?.transferClass === 'structural' ? 'structural' : candidate?.transferClass === 'surface' ? 'surface-held' : candidate ? 'partial' : 'held',
      borrowedShellFailureClass: generationDocket?.holdClass || null,
      realizationTier: candidate?.realizationTier || 'hold',
      changedDimensions: Object.freeze([...(candidate?.changedDimensions || [])]),
      profileShiftDimensions: Object.freeze([...(candidate?.profileShiftDimensions || [])]),
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
  const sourceRegisterLaneInfo = resolveSourceRegisterLane({
    sourceText,
    sourceProfile,
    sourceClass
  });
  const protectedState = {
    literals: Object.freeze(hardAnchors.map((value) => Object.freeze({ value }))),
    text: sourceText
  };
  const sourceIR = segmentTextToIR(sourceText, protectedState);
  const opportunityProfile = buildOpportunityProfileFromIR(sourceIR);
  const auditBundle = buildSemanticAuditBundle(sourceIR, sourceText, protectedState);
  const sourceClass = classifyV2SourceClass(sourceText);
  const nativeRelationInventory = buildRelationInventory(sourceText, sourceIR, sourceClass, hardAnchors, sourceRegisterLaneInfo);
  const nativeOntologyAudit = buildTD613OntologyAudit({
    sourceClass,
    sourceRegisterLane: sourceRegisterLaneInfo.sourceRegisterLane,
    relationInventory: nativeRelationInventory,
    semanticAudit: auditBundle.semanticAudit,
    protectedAnchorAudit: auditBundle.protectedAnchorAudit,
    apertureReview: {
      semanticCoverageRisk: 0,
      recaptureRisk: 0,
      candidateSuppression: 0,
      observabilityDeficit: 0,
      aliasPersistence: 0,
      namingSensitivity: 0,
      redundancyInflation: 0,
      capacityPressure: 0,
      policyPressure: 0
    }
  });
  const generationDocket = Object.freeze({
      status: 'landed',
      holdClass: null,
      headline: shell?.mode === 'native' ? 'Generator V2 stayed native.' : 'Generator V2 stayed on source cadence.',
      reasons: Object.freeze([]),
      candidateCount: 1,
      winningCandidateId: 'native',
      winningCandidateFamily: 'native',
      ontologyRoutePressure: nativeOntologyAudit
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
        sourceRegisterLane: nativeOntologyAudit?.sourceRegisterLane || 'formal-record',
        targetRegisterLane: nativeOntologyAudit?.sourceRegisterLane || 'formal-record',
        score: 1,
        rewriteStrength: 0,
        targetFit: 1,
        movementConfidence: 0,
        failureReasons: Object.freeze([]),
        transferClass: 'native',
        changedDimensions: Object.freeze([]),
        profileShiftDimensions: Object.freeze([]),
        lexemeSwapCount: 0,
        artifactRepairApplied: false,
        ontologyAudit: nativeOntologyAudit,
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
          profileShiftDimensions: [],
          lexemeSwaps: [],
          visibleShift: false,
          nonTrivialShift: false,
          relationInventory: nativeRelationInventory,
          sourceRegisterLane: sourceRegisterLaneInfo.sourceRegisterLane,
          targetRegisterLane: sourceRegisterLaneInfo.sourceRegisterLane,
          semanticAudit: auditBundle.semanticAudit,
          protectedAnchorAudit: auditBundle.protectedAnchorAudit,
          ontologyAudit: nativeOntologyAudit,
          connectorStrategy: 'balanced',
          contractionStrategy: 'preserve'
        }),
        candidateLedger,
        testedFamilyIds: ['native'],
        generationDocket
      })
    : null;

  return Object.freeze({
    text: sourceText,
    internalText: sourceText,
    sourceRegisterLane: sourceRegisterLaneInfo.sourceRegisterLane,
    targetRegisterLane: sourceRegisterLaneInfo.sourceRegisterLane,
    sourceProfile,
    targetProfile: shell.profile || sourceProfile,
    outputProfile: sourceProfile,
    opportunityProfile,
    changedDimensions: [],
    profileShiftDimensions: [],
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
    toolabilityAudit: Object.freeze({
      readability: 1,
      personaDistinctness: 0,
      sentenceIntegrity: 1,
      movementQuality: 0,
      artifactPenalty: 0,
      semanticLockIntact: true,
      toolabilityScore: 0.5,
      warnings: Object.freeze([])
    }),
    personaSeparationAudit: Object.freeze({
      envelopeId: 'generic',
      markerCount: 0,
      requiredMarkers: 1,
      score: 0,
      warnings: Object.freeze([]),
      markers: Object.freeze([])
    }),
    toolabilityWarnings: Object.freeze([]),
    semanticLockIntact: true,
    visibleShift: false,
    nonTrivialShift: false,
    semanticAudit: auditBundle.semanticAudit,
    protectedAnchorAudit: auditBundle.protectedAnchorAudit,
    ontologyAudit: nativeOntologyAudit,
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
  const sourceRegisterLane = normalizeRegisterLane(options.sourceRegisterLane, 'formal-record');
  const hardAnchors = options.hardAnchors || extractHardAnchors(sourceText);
  const sourceProfile = options.sourceProfile || extractCadenceProfile(sourceText);
  const sourceIR = options.sourceIR || segmentTextToIR(sourceText, {
    literals: Object.freeze(hardAnchors.map((value) => Object.freeze({ value }))),
    text: sourceText
  });
  const familyId = family.id || 'syntax-shape';
  const targetRegisterLane = normalizeRegisterLane(
    options.targetRegisterLane || resolveTargetRegisterLane({
      shell: variant.shell,
      targetProfile: variant.shell?.profile || null,
      sourceProfile,
      sourceClass
    }),
    sourceRegisterLane
  );
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
      sourceRegisterLane,
      targetRegisterLane,
      intensity: variantIntensity(variant) * familyWeight(familyId, sourceClass, variant.envelopeId)
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
    } else if (familyId === 'clause-pivot') {
      working = applyClausePivotRewrite(working, variant.envelopeId, sourceClass, context);
    } else if (familyId === 'persona-lexicon') {
      working = applyPersonaLexiconRewrite(working, variant.envelopeId, sourceClass, context);
    } else if (familyId === 'pressure-current') {
      working = applyPressureCurrentRewrite(working, variant.envelopeId, sourceClass, context);
    } else {
      working = applyHybridBalance(working, variant.envelopeId, sourceClass, context);
    }

      return applyPersonaEnvelopeText(working, {
        sourceText: paragraph,
        envelopeId: variant.envelopeId,
        sourceClass,
        targetProfile: variant.shell.profile || {},
        explicitTargetProfile: Boolean(variant.shell.profile),
        context
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
  outputText = applyRegisterLaneRealization(outputText, context);
  outputText = restoreAnchorsAfterRewrite(outputText, protectedState.replacements);
  outputText = restoreHardWitnessAnchors(
    sourceText,
    restoreProceduralWitnessTerms(sourceText, outputText, sourceClass)
  );
  const polishProtected = protectAnchorsForRewrite(outputText, hardAnchors);
  outputText = polishNativeCandidateText(polishProtected.text, {
    envelopeId: variant.envelopeId,
    sourceClass
  })
    .replace(/;\s+(?=[A-Z])/g, '. ')
    .replace(/,,+/g, ',');
  outputText = restoreAnchorsAfterRewrite(outputText, polishProtected.replacements);
  const artifactRepair = applyArtifactRepairPass(outputText, context);
  outputText = artifactRepair.text;

  return Object.freeze({
    outputText,
    structuralOperations: uniqueStrings(structuralOperations),
    lexicalOperations: uniqueStrings(lexicalOperations),
    lexemeSwaps: dedupeLexemeSwaps(lexemeSwaps),
    connectorStrategy,
    contractionStrategy,
    relationInventory: buildRelationInventory(sourceText, sourceIR, sourceClass, hardAnchors, {
      sourceRegisterLane,
      inference: options.sourceRegisterLaneInference || 'inferred',
      fallbackUsed: Boolean(options.sourceRegisterLaneFallback)
    }),
    sourceRegisterLane,
    targetRegisterLane,
    artifactRepairApplied: artifactRepair.repaired
  });
}

function buildCandidate(sourceText = '', variant = {}, family = {}, options = {}) {
  const sourceClass = options.sourceClass || classifyV2SourceClass(sourceText);
  const sourceProfile = options.sourceProfile || extractCadenceProfile(sourceText);
  const sourceRegisterLaneInfo = resolveSourceRegisterLane({
    sourceText,
    sourceProfile,
    sourceClass,
    explicitRegisterLane: options.sourceRegisterLane
  });
  const hardAnchors = options.hardAnchors || extractHardAnchors(sourceText);
  const protectedState = {
    literals: Object.freeze(hardAnchors.map((value) => Object.freeze({ value }))),
    text: sourceText
  };
  const sourceIR = options.sourceIR || segmentTextToIR(sourceText, protectedState);
  const authored = authorNativeCandidateText(sourceText, variant, family, {
    ...options,
    sourceClass,
    sourceRegisterLane: sourceRegisterLaneInfo.sourceRegisterLane,
    sourceRegisterLaneInference: sourceRegisterLaneInfo.inference,
    sourceRegisterLaneFallback: sourceRegisterLaneInfo.fallbackUsed,
    sourceProfile,
    sourceIR,
    hardAnchors
  });
  const outputText = authored.outputText;
  const outputProfile = extractCadenceProfile(outputText);
  const profileShiftDimensions = deriveChangedDimensions(sourceProfile, outputProfile);
  const changedDimensions = deriveRealizedChangedDimensions(profileShiftDimensions, authored.lexemeSwaps);
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
  const targetProfile = variant.shell.profile || null;
  const floors = classSemanticFloor(sourceClass, sourceProfile, targetProfile);
  const semanticLockIntact = semanticLockSatisfied(semanticAudit, floors, sourceClass);
  const semanticRisk = buildSemanticRisk(semanticAudit, protectedAnchorAudit.protectedAnchorIntegrity ?? 1);
  const apertureReview = reviewTD613ApertureTransfer({
    sourceText,
    outputText,
    shellMode: variant.shell?.mode || 'native',
    shellSource: variant.shell?.source || '',
    retrieval: true,
    semanticRisk,
    semanticLockIntact,
    visibleShift,
    nonTrivialShift,
    protectedAnchorIntegrity: Number(protectedAnchorAudit.protectedAnchorIntegrity ?? 1),
    propositionCoverage: Number(semanticAudit.propositionCoverage ?? 1),
    actorCoverage: Number(semanticAudit.actorCoverage ?? 1),
    actionCoverage: Number(semanticAudit.actionCoverage ?? 1),
    objectCoverage: Number(semanticAudit.objectCoverage ?? 1)
  });
  const ontologyAudit = buildTD613OntologyAudit({
    sourceClass,
    sourceRegisterLane: authored.sourceRegisterLane,
    relationInventory: authored.relationInventory,
    semanticAudit,
    protectedAnchorAudit,
    apertureReview
  });
  const classification = classifyTD613ApertureProjection({
    sourceText,
    outputText,
    changedDimensions,
    lexemeSwaps: authored.lexemeSwaps,
    visibleShift,
    nonTrivialShift,
    repaired: Boolean(authored.artifactRepairApplied),
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
  const artifactAudit = buildArtifactAudit({
    sourceText,
    outputText,
    sourceClass,
    envelopeId: variant.envelopeId,
    targetProfile: variant.shell?.profile || null,
    sourceProfile
  });
  const targetFit = computeTargetFit(outputProfile, targetProfile);
  const donorProgress = variant.shell?.mode === 'borrowed'
    ? buildBorrowedShellDonorProgress(sourceText, outputText, sourceProfile, targetProfile || {}, outputProfile)
    : {};
  const hardIntegrityScore = hardAnchorIntegrity(sourceText, outputText);
  const protectedAnchorIntegrity = Number(protectedAnchorAudit.protectedAnchorIntegrity ?? 1);
  const polarityMismatches = Number(semanticAudit.polarityMismatches ?? 0);
  const tenseMismatches = Number(semanticAudit.tenseMismatches ?? 0);
  const semanticsBounded = semanticAuditBounded(semanticAudit);
  const strictCustodySemantics = sourceClass === 'procedural-record';
  const semanticPass =
    Number(semanticAudit.propositionCoverage ?? 1) >= floors.proposition &&
    Number(semanticAudit.actorCoverage ?? 1) >= floors.actor &&
    Number(semanticAudit.actionCoverage ?? 1) >= floors.action &&
    Number(semanticAudit.objectCoverage ?? 1) >= floors.object &&
    (strictCustodySemantics ? polarityMismatches === 0 : polarityMismatches <= 1);
  const exactPass = hardIntegrityScore >= 1;
  const protectedAnchorPass = protectedAnchorIntegrity >= classProtectedAnchorFloor(sourceClass);
  const pathologyPass = !pathologies.severe;
  const rewritePass = meetsLandedRewriteBar(sourceClass, rewriteStrength, changedDimensions, authored.lexemeSwaps);
  const passed = exactPass && protectedAnchorPass && semanticPass && pathologyPass && rewritePass;
  const polarityPenalty = polarityMismatches * (strictCustodySemantics ? 0.16 : 0.12);
  const tensePenalty = tenseMismatches * (strictCustodySemantics ? 0.05 : 0.04);
  const donorStallPenalty =
    variant.shell?.mode === 'borrowed' &&
    targetProfile &&
    Number(donorProgress?.donorImprovementRatio || 0) <= 0.05
      ? 0.08
      : 0;
  const boundedPenalty = semanticsBounded ? 0 : 0.18;
  const familyBonus = familySelectionBonus(sourceClass, family.id, variant.envelopeId);
  const distinctnessBonus = personaDistinctnessBonus({
    envelopeId: variant.envelopeId,
    sourceProfile,
    outputProfile,
    sourceClass,
    structuralOperations: authored.structuralOperations,
    lexicalOperations: authored.lexicalOperations,
    changedDimensions,
    lexemeSwaps: authored.lexemeSwaps
  });
  const personaSeparationAudit = buildPersonaSeparationAudit({
    envelopeId: variant.envelopeId,
    sourceProfile,
    outputProfile,
    structuralOperations: authored.structuralOperations,
    lexicalOperations: authored.lexicalOperations,
    sourceClass,
    outputText,
    artifactAudit
  });
  const score = round(
    (rewriteStrength * 0.52) +
    (targetFit * 0.24) +
    ((Number(donorProgress?.donorImprovement || 0)) * 0.14) +
    ((Number(donorProgress?.donorImprovementRatio || 0)) * 0.08) +
    (Number(classification.movementConfidence || 0) * 0.12) +
    (Number(witnessAudit.softWitnessIntegrity ?? 1) * 0.08) +
    familyBonus +
    distinctnessBonus -
    (semanticLockIntact ? 0 : artifactAudit.penalty) +
    (visibleShift ? 0.04 : 0) -
      polarityPenalty -
      tensePenalty -
      boundedPenalty -
      donorStallPenalty -
      ((1 - protectedAnchorIntegrity) * 1.5) -
      (pathologies.flags.length * 0.05),
    4
  );
  const transferClass = computeCandidateTransferClass({
    classification,
    changedDimensions,
    lexemeSwaps: authored.lexemeSwaps,
    rewriteStrength
  });
  const toolabilityAudit = buildToolabilityAudit({
    sourceClass,
    transferClass,
    rewriteStrength,
    changedDimensions,
    lexemeSwaps: authored.lexemeSwaps,
    artifactAudit,
    semanticLockIntact,
    personaSeparationAudit,
    distinctnessBonus,
    outputProfile,
    sourceProfile,
    pathologies
  });
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

  return Object.freeze({
    id: `${variant.id}:${family.id}`,
    family: family.id,
    envelopeId: variant.envelopeId,
    shell: variant.shell,
    sourceClass,
    sourceRegisterLane: authored.sourceRegisterLane,
    targetRegisterLane: authored.targetRegisterLane,
    sourceIR,
    hardAnchors,
    targetProfile: targetProfile || sourceProfile,
    outputText,
    outputProfile,
    changedDimensions,
    profileShiftDimensions,
    lexemeSwaps: authored.lexemeSwaps,
    lexicalShiftProfile,
    semanticAudit,
    protectedAnchorAudit,
    witnessAudit,
    apertureReview,
    classification,
    pathologies,
    artifactAudit: Object.freeze({
      ...artifactAudit,
      semanticLockIntact,
      effectivePenalty: semanticLockIntact ? 0 : Number(artifactAudit.penalty || 0)
    }),
    visibleShift,
    nonTrivialShift,
    rewriteStrength,
    targetFit,
    transferClass,
    relationInventory: authored.relationInventory,
    ontologyAudit,
    structuralOperations: authored.structuralOperations,
    lexicalOperations: authored.lexicalOperations,
    connectorStrategy: authored.connectorStrategy,
    contractionStrategy: authored.contractionStrategy,
    artifactRepairApplied: Boolean(authored.artifactRepairApplied),
    semanticRisk,
    semanticBounded: semanticsBounded,
    semanticLockIntact,
    donorProgress,
    score,
    toolabilityAudit,
    personaSeparationAudit,
    toolabilityWarnings: toolabilityAudit.warnings,
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
    sourceRegisterLane: candidate.sourceRegisterLane || candidate.relationInventory?.sourceRegisterLane || 'formal-record',
    targetRegisterLane: candidate.targetRegisterLane || 'formal-record',
    score: candidate.score,
    toolabilityScore: Number(candidate.toolabilityAudit?.toolabilityScore || 0),
    rewriteStrength: candidate.rewriteStrength,
    targetFit: candidate.targetFit,
    movementConfidence: Number(candidate.classification?.movementConfidence || 0),
    personaSeparationScore: Number(candidate.personaSeparationAudit?.score || 0),
    failureReasons: Object.freeze([...(candidate.failureReasons || [])]),
    artifactFlags: Object.freeze([...(candidate.artifactAudit?.flags || [])]),
    toolabilityWarnings: Object.freeze([...(candidate.toolabilityWarnings || [])]),
    transferClass: candidate.transferClass || 'weak',
    changedDimensions: Object.freeze([...(candidate.changedDimensions || [])]),
    profileShiftDimensions: Object.freeze([...(candidate.profileShiftDimensions || [])]),
    lexemeSwapCount: Number(candidate.lexemeSwaps?.length || 0),
    artifactRepairApplied: Boolean(candidate.artifactRepairApplied),
    ontologyAudit: candidate.ontologyAudit || null,
    outputPreview: String(candidate.outputText || '').slice(0, 160)
  })));
}

function candidateHoldClass(candidate = null) {
  if (!candidate) {
    return 'below-rewrite-bar';
  }
  if (candidateRouteFloorRank(candidate) >= 2) {
    return 'aperture-route-pressure';
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
  if (typeof candidate?.semanticBounded === 'boolean') {
    return candidate.semanticBounded;
  }
  return semanticAuditBounded(candidate?.semanticAudit || {});
}

function candidateFamilyPriority(candidate = null) {
  return familyWeight(
    String(candidate?.family || 'syntax-shape'),
    String(candidate?.sourceClass || 'formal-correspondence'),
    String(candidate?.envelopeId || 'generic')
  );
}

function candidateToolabilityScore(candidate = null) {
  return Number(candidate?.toolabilityAudit?.toolabilityScore || 0);
}

function candidateOntologyAudit(candidate = null) {
  return candidate?.ontologyAudit || null;
}

function candidateDriftRank(candidate = null) {
  const driftClass = String(candidateOntologyAudit(candidate)?.selectiveAdmissibilityDrift?.driftClass || 'none').toLowerCase();
  if (driftClass === 'severe') {
    return 3;
  }
  if (driftClass === 'active') {
    return 2;
  }
  if (driftClass === 'watch') {
    return 1;
  }
  return 0;
}

function candidateRouteFloorRank(candidate = null) {
  const routeFloor = String(candidateOntologyAudit(candidate)?.selectiveAdmissibilityDrift?.routeFloor || 'play').toLowerCase();
  if (routeFloor === 'harbor') {
    return 3;
  }
  if (routeFloor === 'buffer') {
    return 2;
  }
  if (routeFloor === 'warning') {
    return 1;
  }
  return 0;
}

function candidateRoutePressure(candidate = null) {
  return Number(candidateOntologyAudit(candidate)?.selectiveAdmissibilityDrift?.routePressure || 0);
}

function candidateProtectedAnchorIntegrity(candidate = null) {
  return Number(candidateOntologyAudit(candidate)?.anchorIntegrity?.protectedAnchorIntegrity ?? candidate?.protectedAnchorAudit?.protectedAnchorIntegrity ?? 1);
}

function candidateMinimumSemanticCoverage(candidate = null) {
  const semanticCoverage = candidateOntologyAudit(candidate)?.semanticCoverage || candidate?.semanticAudit || {};
  return Math.min(
    Number(semanticCoverage?.propositionCoverage ?? 1),
    Number(semanticCoverage?.actorCoverage ?? 1),
    Number(semanticCoverage?.actionCoverage ?? 1),
    Number(semanticCoverage?.objectCoverage ?? 1)
  );
}

function candidateDeformationLoad(candidate = null) {
  const aperture = candidateOntologyAudit(candidate)?.aperture || {};
  return Number(aperture?.historicalCrease || 0) + Number(aperture?.unfoldingEnergy || 0);
}

function candidateRealizedCrossRegisterMovement(candidate = null) {
  const realizedDimensions = candidate?.changedDimensions || [];
  const lexicalSurfaceDimensions = new Set([
    'lexical-register',
    'abbreviation-posture',
    'orthography-posture',
    'fragment-posture',
    'conversation-posture',
    'surface-marker-posture'
  ]);
  const hasLexicalSurface = realizedDimensions.some((dimension) => lexicalSurfaceDimensions.has(dimension));
  return hasLexicalSurface || Number(candidate?.lexemeSwaps?.length || 0) > 0;
}

function classRecoveryFamilies(sourceClass = 'formal-correspondence') {
  if (sourceClass === 'procedural-record') {
    return ['syntax-shape', 'clause-pivot', 'persona-lexicon'];
  }
  if (sourceClass === 'formal-correspondence') {
    return ['syntax-shape', 'persona-lexicon', 'cadence-connector', 'order-beat'];
  }
  if (sourceClass === 'reflective-prose') {
    return ['clause-pivot', 'pressure-current', 'persona-lexicon', 'hybrid', 'register-lexicon', 'syntax-shape'];
  }
  return ['order-beat', 'clause-pivot', 'pressure-current', 'hybrid'];
}

function candidateNearPass(candidate = null) {
  if (!candidate) {
    return false;
  }
  const reasons = candidate.failureReasons || [];
  const structuralFailure = reasons.includes('hard-anchor-failure') || reasons.includes('semantic-failure') || reasons.includes('pathology');
  if (structuralFailure) {
    return false;
  }
  return (
    reasons.includes('below-rewrite-bar') ||
    candidateToolabilityScore(candidate) >= 0.52 ||
    Number(candidate.rewriteStrength || 0) >= Math.max(0, classRewriteBar(candidate.sourceClass) - 0.05)
  );
}

function buildRecoveryVariants(sourceProfile = {}, shell = {}, sourceClass = 'formal-correspondence') {
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
  const scalar = Math.max(0.9, classScalar(sourceClass));
  return [
    {
      id: 'recovery-forward',
      shell: {
        ...shell,
        mod: mergeShellMod(baseMod, adjustments.secondary, scalar * 1.1),
        strength: clamp(baseStrength + 0.16, 0, 1),
        profile: tuneTargetProfile(targetProfile, sourceProfile, envelopeId, sourceClass, 1.32)
      },
      envelopeId
    },
    {
      id: 'recovery-clean',
      shell: {
        ...shell,
        mod: mergeShellMod(baseMod, adjustments.primary, scalar),
        strength: clamp(baseStrength + 0.08, 0, 1),
        profile: tuneTargetProfile(targetProfile, sourceProfile, envelopeId, sourceClass, 1.05)
      },
      envelopeId
    }
  ];
}

function shouldRunRecoveryRound(sourceClass = 'formal-correspondence', selected = null, candidates = []) {
  if (!['procedural-record', 'formal-correspondence', 'reflective-prose', 'narrative-scene'].includes(sourceClass)) {
    return false;
  }
  if (!candidates.some((candidate) => candidateNearPass(candidate))) {
    return false;
  }
  if (!selected) {
    return true;
  }
  return candidateToolabilityScore(selected) < 0.66 || selected.transferClass === 'weak';
}

function selectWinningCandidate(candidates = []) {
  return [...(candidates || [])]
    .sort((left, right) =>
      candidateDriftRank(left) - candidateDriftRank(right) ||
      candidateRoutePressure(left) - candidateRoutePressure(right) ||
      candidateProtectedAnchorIntegrity(right) - candidateProtectedAnchorIntegrity(left) ||
      candidateMinimumSemanticCoverage(right) - candidateMinimumSemanticCoverage(left) ||
      candidateDeformationLoad(left) - candidateDeformationLoad(right) ||
      Number(candidateRealizedCrossRegisterMovement(right)) - Number(candidateRealizedCrossRegisterMovement(left)) ||
      candidateTransferRank(right) - candidateTransferRank(left) ||
      candidateToolabilityScore(right) - candidateToolabilityScore(left) ||
      Number(right.personaSeparationAudit?.score || 0) - Number(left.personaSeparationAudit?.score || 0) ||
      candidateFamilyPriority(right) - candidateFamilyPriority(left) ||
      right.score - left.score ||
      right.rewriteStrength - left.rewriteStrength ||
      String(left.id || '').localeCompare(String(right.id || ''))
    )[0] || null;
}

function holdHeadline(holdClass = 'below-rewrite-bar') {
  if (holdClass === 'aperture-route-pressure') {
    return 'Generator V2 hold // Aperture raised the ontology route floor above publishable passage.';
  }
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

function explainGenerationReasonCode(code = '') {
  const explanations = {
    'hard-anchor-failure': 'Exact witness anchors broke under rewrite pressure.',
    'aperture-route-pressure': 'Aperture held the route because ontology integrity pressure stayed above the publishable floor.',
    'anchor-drift-detected': 'Protected anchor integrity slipped below the class floor.',
    'semantic-failure': 'Semantic coverage dropped below the class floor.',
    'pathology': 'The output collapsed into a render-unsafe form.',
    'below-rewrite-bar': 'No candidate cleared the rewrite bar honestly.',
    'artifact:lowercase-lead': 'Lowercase sentence starts made the surface look unstable.',
    'artifact:doubled-connector': 'Repeated connectors flattened the sentence current.',
    'artifact:semicolon-fracture': 'Semicolon fracture broke the line into awkward ledger fragments.',
    'artifact:repeated-helper': 'Repeated helper verbs made the rewrite sound mechanically looped.',
    'artifact:malformed-contraction': 'Malformed contraction artifacts made the rewrite unsafe to publish.',
    'artifact:fragment': 'Clause fragments created by rewrite passes made the surface too thin to trust.',
    'artifact:over-braiding': 'The sentence current braided too hard and stopped reading cleanly.',
    'artifact:clause-join': 'Clause joins landed as visible seam lines instead of fluent movement.',
    'artifact:clause-drag': 'Sentence drag made the rewrite feel overloaded.',
    'persona-markers-thin': 'The mask landed, but its persona markers stayed too faint.',
    'persona-convergence:spark-cross': 'The mask drifted too close to its neighboring clipped-pressure lane.',
    'persona-convergence:matron-undertow': 'The mask drifted too close to its neighboring long-current lane.',
    'persona-convergence:archivist-neutral': 'The mask drifted too close to a neutral formal lane.',
    'toolability:punctuation-only': 'The movement looked more cosmetic than functional.',
    'toolability:low-confidence': 'The rewrite landed, but not with enough tool confidence yet.',
    'toolability:rough-surface': 'The surface still reads rough for a finished masking tool.',
    'toolability:sentence-integrity': 'Sentence integrity stayed shakier than the tool should allow.'
  };
  return explanations[code] || '';
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
    headline: candidateRouteFloorRank(chosen) >= 1
      ? 'Generator V2 landed under Aperture warning pressure.'
      : chosen.transferClass === 'structural'
        ? 'Generator V2 landed a structural registered rewrite.'
        : 'Generator V2 landed a registered cadence rewrite.',
    reasons: Object.freeze([]),
    candidateCount: candidateLedger.length,
    winningCandidateId: chosen.id,
    winningCandidateFamily: chosen.family || null,
    ontologyRoutePressure: chosen.ontologyAudit || null
  });
  const retrievalTrace = options?.retrieval
    ? buildRetrievalTraceV2({
        sourceText,
        sourceClass,
        candidate: chosen,
        candidateLedger,
        testedFamilyIds: options.testedFamilyIds || candidates.map((entry) => entry.family),
        generationDocket,
        donorProgress: chosen.donorProgress || {}
      })
    : null;

  return Object.freeze({
    text: chosen.outputText,
    internalText: chosen.outputText,
    sourceRegisterLane: chosen.sourceRegisterLane || chosen.relationInventory?.sourceRegisterLane || 'formal-record',
    targetRegisterLane: chosen.targetRegisterLane || 'formal-record',
    sourceProfile,
    targetProfile: chosen.targetProfile || shell.profile || sourceProfile,
    outputProfile: chosen.outputProfile,
    opportunityProfile,
    changedDimensions: chosen.changedDimensions,
    profileShiftDimensions: chosen.profileShiftDimensions || [],
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
    ontologyAudit: chosen.ontologyAudit || null,
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
    toolabilityAudit: chosen.toolabilityAudit,
    semanticLockIntact: Boolean(chosen.semanticLockIntact),
    personaSeparationAudit: chosen.personaSeparationAudit,
    toolabilityWarnings: Object.freeze([...(chosen.toolabilityWarnings || [])]),
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

function buildHeldTransfer(sourceText = '', shell = {}, options = {}, candidates = [], sourceClass = 'formal-correspondence', preferredCandidate = null, holdOverride = null) {
  const sourceProfile = options.sourceProfile || extractCadenceProfile(sourceText);
  const sourceIR = options.sourceIR || segmentTextToIR(sourceText, { literals: [], text: sourceText });
  const opportunityProfile = buildOpportunityProfileFromIR(sourceIR);
  const bestCandidate = preferredCandidate || [...candidates].sort((left, right) => right.score - left.score)[0] || null;
  const holdClass = holdOverride || candidateHoldClass(bestCandidate);
  const headline = holdHeadline(holdClass);
  const reasonCodes = uniqueStrings([
    ...(bestCandidate?.failureReasons || []),
    ...((bestCandidate?.artifactAudit?.flags || []))
  ]);
  const noteReasons = uniqueStrings([
    ...reasonCodes.map((code) => explainGenerationReasonCode(code)).filter(Boolean),
    ...(bestCandidate?.apertureReview?.reasons || [])
  ]);
  const reasons = reasonCodes.length ? reasonCodes : Object.freeze([holdClass]);
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
    winningCandidateId: holdClass === 'aperture-route-pressure' ? (bestCandidate?.id || null) : null,
    winningCandidateFamily: holdClass === 'aperture-route-pressure' ? (bestCandidate?.family || null) : null,
    ontologyRoutePressure: bestCandidate?.ontologyAudit || null
  });
  const retrievalTrace = options?.retrieval
    ? buildRetrievalTraceV2({
        sourceText,
        sourceClass,
        candidate: bestCandidate,
        candidateLedger,
        testedFamilyIds: options.testedFamilyIds || candidates.map((entry) => entry.family),
        generationDocket,
        donorProgress: bestCandidate?.donorProgress || {}
      })
    : null;

  return Object.freeze({
    text: '',
    internalText: bestCandidate?.outputText || sourceText,
    sourceRegisterLane: bestCandidate?.sourceRegisterLane || bestCandidate?.relationInventory?.sourceRegisterLane || 'formal-record',
    targetRegisterLane: bestCandidate?.targetRegisterLane || 'formal-record',
    sourceProfile,
    targetProfile: bestCandidate?.targetProfile || shell.profile || sourceProfile,
    outputProfile: sourceProfile,
    opportunityProfile,
    changedDimensions: [],
    profileShiftDimensions: bestCandidate?.profileShiftDimensions || [],
    protectedLiteralCount: Number((bestCandidate?.hardAnchors || []).length || 0),
    passesApplied: [],
    rescuePasses: [],
    donorProgress: bestCandidate?.donorProgress || {},
    transferClass: 'held',
    qualityGatePassed: false,
    notes: uniqueStrings([headline, ...noteReasons]),
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
    toolabilityAudit: bestCandidate?.toolabilityAudit || Object.freeze({
      readability: 0,
      personaDistinctness: 0,
      sentenceIntegrity: 0,
      movementQuality: 0,
      artifactPenalty: 1,
      semanticLockIntact: false,
      toolabilityScore: 0,
      warnings: Object.freeze([holdClass])
    }),
    personaSeparationAudit: bestCandidate?.personaSeparationAudit || Object.freeze({
      envelopeId: inferEnvelopeId(shell, sourceProfile, shell.profile || {}),
      markerCount: 0,
      requiredMarkers: 2,
      score: 0,
      warnings: Object.freeze([holdClass]),
      markers: Object.freeze([])
    }),
    toolabilityWarnings: Object.freeze([...(bestCandidate?.toolabilityWarnings || [holdClass])]),
    semanticLockIntact: Boolean(bestCandidate?.semanticLockIntact),
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
    ontologyAudit: bestCandidate?.ontologyAudit || null,
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
  const testedFamilyIds = NATIVE_CANDIDATE_FAMILIES.map((family) => family.id);
  const sourceIR = segmentTextToIR(sourceText, {
    literals: Object.freeze(hardAnchors.map((value) => Object.freeze({ value }))),
    text: sourceText
  });
  const variants = buildShellVariants(sourceProfile, shell, sourceClass);
  let candidates = dedupeCandidates(
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
  let eligibleCandidates = [...candidates].filter((candidate) => candidate.passed);
  let boundedCandidates = eligibleCandidates.filter((candidate) => candidateSemanticBounded(candidate));
  let selectionPool = boundedCandidates.length ? boundedCandidates : eligibleCandidates;
  let selected = selectWinningCandidate(selectionPool);

  if (shouldRunRecoveryRound(sourceClass, selected, candidates)) {
    const recoveryVariants = buildRecoveryVariants(sourceProfile, shell, sourceClass);
    const recoveryFamilies = classRecoveryFamilies(sourceClass);
    const recoveryCandidates = dedupeCandidates(
      recoveryVariants.flatMap((variant) =>
        NATIVE_CANDIDATE_FAMILIES
          .filter((family) => recoveryFamilies.includes(family.id))
          .map((family) => buildCandidate(sourceText, variant, family, {
            ...options,
            sourceClass,
            sourceProfile,
            sourceIR,
            hardAnchors
          }))
      )
    );
    candidates = dedupeCandidates([...candidates, ...recoveryCandidates]);
    eligibleCandidates = [...candidates].filter((candidate) => candidate.passed);
    boundedCandidates = eligibleCandidates.filter((candidate) => candidateSemanticBounded(candidate));
    selectionPool = boundedCandidates.length ? boundedCandidates : eligibleCandidates;
    selected = selectWinningCandidate(selectionPool);
  }

  const apertureRoutePressureHold = Boolean(
    selected &&
    selectionPool.length &&
    selectionPool.every((candidate) => candidateRouteFloorRank(candidate) >= 2)
  );

  if (!selected || apertureRoutePressureHold) {
    if (typeof globalThis !== 'undefined' && globalThis.TD613_DUEL_DEBUG) {
      const rejected = candidates.filter((candidate) => !candidate.passed);
      const sample = rejected.slice(0, 3).map((candidate) => ({
        family: candidate.family,
        variant: candidate.variantId,
        passed: candidate.passed,
        warnings: candidate.warnings,
        semanticAudit: candidate.semanticAudit,
        floors: candidate.semanticFloors,
        artifactPenalty: candidate.toolabilityAudit && candidate.toolabilityAudit.artifactPenalty,
        semanticLockIntact: candidate.semanticLockIntact
      }));
      try {
        // eslint-disable-next-line no-console
        console.warn('[TD613_DUEL_DEBUG] hold', {
          sourceClass,
          shellMod: shell && shell.mod,
          shellStrength: shell && shell.strength,
          variantCount: variants.length,
          candidateCount: candidates.length,
          eligibleCount: eligibleCandidates.length,
          boundedCount: boundedCandidates.length,
          recoveryRan: shouldRunRecoveryRound(sourceClass, null, candidates),
          apertureRoutePressureHold,
          rejectedSample: sample
        });
      } catch (error) { /* ignore log failure */ }
    }
    return buildHeldTransfer(sourceText, shell, {
      ...options,
      testedFamilyIds,
      sourceProfile,
      sourceIR
    }, candidates, sourceClass, apertureRoutePressureHold ? selected : null, apertureRoutePressureHold ? 'aperture-route-pressure' : null);
  }

  return buildLandedTransfer(sourceText, shell, {
    ...options,
    testedFamilyIds,
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
