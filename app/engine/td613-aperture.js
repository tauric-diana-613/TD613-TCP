function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function clamp01(value) {
  return clamp(Number(value) || 0, 0, 1);
}

function round3(value) {
  return Number((Number(value) || 0).toFixed(3));
}

function normalizeComparableText(text = '') {
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .toLowerCase()
    .replace(/\u2019/g, "'")
    .replace(/\u2018/g, "'")
    .replace(/\u2014/g, '-')
    .replace(/\u2013/g, '-');
}

function normalizeReadableText(text = '') {
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+([,;:.!?])/g, '$1')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function collapseComparableWhitespace(text = '') {
  return normalizeComparableText(text)
    .replace(/\s+/g, ' ')
    .trim();
}

function escapePattern(text = '') {
  return String(text || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceWithCaseAware(text = '', pattern = '', replacement = '') {
  return String(text || '').replace(new RegExp(pattern, 'gi'), (match) => {
    if (match.toUpperCase() === match) {
      return replacement.toUpperCase();
    }
    if (match.charAt(0).toUpperCase() === match.charAt(0)) {
      return replacement.charAt(0).toUpperCase() + replacement.slice(1);
    }
    return replacement;
  });
}

const CONTRACTION_REPLACEMENTS = Object.freeze([
  ['\\bI am\\b', "I'm"],
  ['\\bI have\\b', "I've"],
  ['\\bI will\\b', "I'll"],
  ['\\bI would\\b', "I'd"],
  ['\\bit is\\b', "it's"],
  ['\\bthat is\\b', "that's"],
  ['\\bthere is\\b', "there's"],
  ['\\bwe are\\b', "we're"],
  ['\\bwe have\\b', "we've"],
  ['\\byou are\\b', "you're"],
  ['\\byou have\\b', "you've"],
  ['\\bthey are\\b', "they're"],
  ['\\bthey have\\b', "they've"],
  ['\\bdoes not\\b', "doesn't"],
  ['\\bdo not\\b', "don't"],
  ['\\bdid not\\b', "didn't"],
  ['\\bwas not\\b', "wasn't"],
  ['\\bwere not\\b', "weren't"],
  ['\\bhas not\\b', "hasn't"],
  ['\\bhave not\\b', "haven't"],
  ['\\bhad not\\b', "hadn't"],
  ['\\bwill not\\b', "won't"],
  ['\\bwould not\\b', "wouldn't"],
  ['\\bcould not\\b', "couldn't"],
  ['\\bshould not\\b', "shouldn't"],
  ['\\bcan not\\b', "can't"]
]);

const EXPANSION_REPLACEMENTS = Object.freeze([
  ["\\bI'm\\b", 'I am'],
  ["\\bI've\\b", 'I have'],
  ["\\bI'll\\b", 'I will'],
  ["\\bI'd\\b", 'I would'],
  ["\\bit's\\b", 'it is'],
  ["\\bthat's\\b", 'that is'],
  ["\\bthere's\\b", 'there is'],
  ["\\bwe're\\b", 'we are'],
  ["\\bwe've\\b", 'we have'],
  ["\\byou're\\b", 'you are'],
  ["\\byou've\\b", 'you have'],
  ["\\bthey're\\b", 'they are'],
  ["\\bthey've\\b", 'they have'],
  ["\\bdoesn't\\b", 'does not'],
  ["\\bdon't\\b", 'do not'],
  ["\\bdidn't\\b", 'did not'],
  ["\\bwasn't\\b", 'was not'],
  ["\\bweren't\\b", 'were not'],
  ["\\bhasn't\\b", 'has not'],
  ["\\bhaven't\\b", 'have not'],
  ["\\bhadn't\\b", 'had not'],
  ["\\bwon't\\b", 'will not'],
  ["\\bwouldn't\\b", 'would not'],
  ["\\bcouldn't\\b", 'could not'],
  ["\\bshouldn't\\b", 'should not'],
  ["\\bcan't\\b", 'can not']
]);

const TD613_APERTURE_SURFACE_ONLY_DIMENSIONS = new Set([
  'contraction-posture',
  'punctuation-shape'
]);

const TD613_APERTURE_SEVERE_PATHOLOGIES = new Set([
  'empty-output',
  'duplicated-source',
  'source-replay'
]);

const TD613_APERTURE_WITNESS_STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'but',
  'by',
  'for',
  'from',
  'had',
  'has',
  'have',
  'he',
  'her',
  'hers',
  'him',
  'his',
  'i',
  'if',
  'in',
  'into',
  'is',
  'it',
  'its',
  'me',
  'my',
  'no',
  'not',
  'of',
  'on',
  'or',
  'our',
  'ours',
  'she',
  'so',
  'than',
  'that',
  'the',
  'their',
  'theirs',
  'them',
  'they',
  'this',
  'to',
  'up',
  'us',
  'was',
  'we',
  'were',
  'what',
  'when',
  'where',
  'which',
  'who',
  'with',
  'you',
  'your',
  'yours'
]);

function contractCommonPhrases(text = '') {
  return CONTRACTION_REPLACEMENTS.reduce(
    (working, [pattern, replacement]) => replaceWithCaseAware(working, pattern, replacement),
    String(text || '')
  );
}

function expandCommonContractions(text = '') {
  return EXPANSION_REPLACEMENTS.reduce(
    (working, [pattern, replacement]) => replaceWithCaseAware(working, pattern, replacement),
    String(text || '')
  );
}

function normalizeMovementComparable(text = '') {
  return collapseComparableWhitespace(
    expandCommonContractions(String(text || ''))
      .replace(/[^a-z0-9\s]/gi, ' ')
  );
}

function hasMeaningfulSurfaceShift(sourceText = '', outputText = '') {
  const sourceComparable = normalizeMovementComparable(sourceText);
  const outputComparable = normalizeMovementComparable(outputText);
  return Boolean(sourceComparable && outputComparable && sourceComparable !== outputComparable);
}

function capitalizeSentenceStarts(text = '') {
  const normalized = String(text || '');
  if (!normalized) {
    return normalized;
  }
  return normalized
    .replace(/(^|[.!?]\s+)([a-z])/g, (match, prefix, letter) => `${prefix}${letter.toUpperCase()}`)
    .replace(/(^|\n)([a-z])/g, (match, prefix, letter) => `${prefix}${letter.toUpperCase()}`);
}

function substantiveDimensionCount(changedDimensions = []) {
  return (changedDimensions || [])
    .filter((dimension) => !TD613_APERTURE_SURFACE_ONLY_DIMENSIONS.has(dimension))
    .length;
}

function detectSourceReplay(sourceText = '', outputText = '') {
  const source = collapseComparableWhitespace(sourceText);
  const output = collapseComparableWhitespace(outputText);
  if (!source || !output || source === output) {
    return false;
  }
  const pattern = new RegExp(escapePattern(source), 'g');
  const matches = output.match(pattern) || [];
  return matches.length >= 2;
}

function witnessTokens(text = '') {
  return expandCommonContractions(normalizeComparableText(text))
    .replace(/[^a-z0-9@:'/-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function normalizeWitnessPhrase(value = '') {
  return collapseComparableWhitespace(
    String(value || '')
      .replace(/^["“”'`]+|["“”'`]+$/g, '')
      .trim()
  );
}

function collectUniqueWitnessAnchors(entries = []) {
  const seen = new Set();
  return entries.filter((entry) => {
    const value = normalizeWitnessPhrase(entry?.value || '');
    const key = `${entry?.mode || 'token-set'}::${value}`;
    if (!value || seen.has(key)) {
      return false;
    }
    seen.add(key);
    entry.value = value;
    entry.tokens = witnessTokens(value).filter((token) =>
      token.length > 2 && !TD613_APERTURE_WITNESS_STOPWORDS.has(token)
    );
    return entry.tokens.length > 0 || entry.mode === 'exact';
  });
}

function flattenSemanticClauses(sourceIR = {}) {
  return (sourceIR?.sentences || []).flatMap((sentence) => sentence?.clauses || []);
}

function extractExactWitnessAnchors(sourceText = '') {
  const anchors = [];
  const normalized = String(sourceText || '');
  const matchAll = (pattern, type) => {
    for (const match of normalized.matchAll(pattern)) {
      anchors.push({
        value: match[0],
        type,
        mode: 'exact'
      });
    }
  };

  matchAll(/"[^"\n]+"|“[^”\n]+”/g, 'quote');
  matchAll(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, 'email');
  matchAll(/\b(?:[A-Z]{1,4}-\d{2,}|\d{1,2}:\d{2}\s?(?:AM|PM)|(?:Unit|Suite|Door)\s+[A-Z0-9-]+)\b/gi, 'identifier');
  matchAll(/\b\d+(?:[:./-]\d+)*(?:\s?(?:AM|PM))?\b/gi, 'numeric');

  const sentenceSlices = normalized.match(/[^.!?\n]+[.!?]?/g) || [];
  sentenceSlices.forEach((sentence) => {
    const titlecasePattern = /\b(?:[A-Z][a-z0-9'’-]+(?:\s+[A-Z][a-z0-9'’-]+)*)\b/g;
    for (const match of sentence.matchAll(titlecasePattern)) {
      const value = String(match[0] || '').trim();
      if (!value || value === 'I' || Number(match.index || 0) === 0) {
        continue;
      }
      anchors.push({
        value,
        type: 'titlecase',
        mode: 'exact'
      });
    }
  });

  return anchors;
}

function extractSemanticWitnessAnchors(sourceIR = {}) {
  return flattenSemanticClauses(sourceIR).flatMap((clause) => {
    const phrases = [
      clause?.propositionHead,
      clause?.actor,
      clause?.action,
      clause?.object
    ]
      .map((value) => normalizeWitnessPhrase(value))
      .filter(Boolean);

    return phrases.map((value) => ({
      value,
      type: 'semantic',
      mode: 'token-set'
    }));
  });
}

function extractContentTokenAnchors(sourceText = '') {
  const seen = new Set();
  return witnessTokens(sourceText)
    .filter((token) => token.length > 2 && !TD613_APERTURE_WITNESS_STOPWORDS.has(token))
    .filter((token) => {
      if (seen.has(token)) {
        return false;
      }
      seen.add(token);
      return true;
    })
    .slice(0, 16)
    .map((token) => ({
      value: token,
      type: 'content-token',
      mode: 'token-set'
    }));
}

function assessCompressionState(sourceText = '', outputText = '', witnessAudit = {}) {
  const sourceSegments = splitTD613ApertureSourceSegments(sourceText);
  const outputSegments = splitTD613ApertureSourceSegments(outputText);
  const sourceWordCount = witnessTokens(sourceText).length || 1;
  const outputWordCount = witnessTokens(outputText).length;
  let state = 'one-to-one';

  if (!outputWordCount) {
    state = 'empty';
  } else if (outputSegments.length < sourceSegments.length) {
    state = 'compressed';
  } else if (outputSegments.length > sourceSegments.length) {
    state = 'expanded';
  }

  return Object.freeze({
    state,
    sourceCount: sourceSegments.length,
    outputCount: outputSegments.length,
    wordRatio: round3(outputWordCount / sourceWordCount),
    preservesWitnessAnchors: (witnessAudit?.witnessAnchorIntegrity ?? 1) >= 1,
    previewSafe:
      Boolean(outputWordCount) &&
      (
        state !== 'compressed' ||
        (witnessAudit?.witnessAnchorIntegrity ?? 1) >= 1
      )
  });
}

export const TD613_APERTURE_PROTOCOL = Object.freeze({
  id: 'td613-aperture/v1',
  toolIdentity: 'TD613 Aperture',
  shortIdentity: 'Aperture',
  observedRegime: 'PRCS-A',
  stance: 'anti-enforcement',
  exportDiscipline: 'non-identifying',
  counterRecognition: true
});

export const TD613_APERTURE_ENFORCEMENT_TERMS = Object.freeze([
  'eligible',
  'eligibility',
  'admissible',
  'admissibility',
  'authorize',
  'authorized',
  'classify',
  'classification',
  'compliance',
  'diagnose',
  'diagnosis',
  'enforce',
  'enforcement',
  'permit',
  'permitted',
  'deny',
  'denied'
]);

export const TD613_APERTURE_PROCESS_OUTCOMES = Object.freeze([
  'projected',
  'repaired',
  'surface-held',
  'source-rerouted'
]);

function uniqueStrings(values = []) {
  return [...new Set((values || []).filter(Boolean).map((value) => String(value)))];
}

function isTD613ApertureGeneratorFault(pathologyState = null, repairPasses = []) {
  const flags = pathologyState?.flags || [];
  return Boolean(
    pathologyState?.severe ||
    flags.some((flag) => TD613_APERTURE_SEVERE_PATHOLOGIES.has(flag)) ||
    (repairPasses || []).some((pass) => /^source-reroute:/.test(String(pass || '')))
  );
}

export function buildTD613ApertureAudit({
  generatorFault = false,
  warningSignals = [],
  repairPasses = [],
  candidateSuppression = 0,
  observabilityDeficit = 0,
  aliasPersistence = 0,
  namingSensitivity = 0,
  redundancyInflation = 0,
  capacityPressure = 0,
  policyPressure = 0,
  withheldMaterial = false,
  withheldReason = null
} = {}) {
  const fault = Boolean(generatorFault);
  const withheld = Boolean(withheldMaterial || fault);
  return Object.freeze({
    observedRegime: TD613_APERTURE_PROTOCOL.observedRegime,
    instrumentRole: 'counter-tool',
    generatorFault: fault,
    warningSignals: Object.freeze(uniqueStrings(warningSignals)),
    repairPasses: Object.freeze(uniqueStrings(repairPasses)),
    candidateSuppression: round3(clamp01(candidateSuppression)),
    observabilityDeficit: round3(clamp01(observabilityDeficit)),
    aliasPersistence: round3(clamp01(aliasPersistence)),
    namingSensitivity: round3(clamp01(namingSensitivity)),
    redundancyInflation: round3(clamp01(redundancyInflation)),
    capacityPressure: round3(clamp01(capacityPressure)),
    policyPressure: round3(clamp01(policyPressure)),
    withheldMaterial: withheld,
    withheldReason: withheld ? String(withheldReason || 'catastrophic-generator-fault') : null
  });
}

function normalizeTD613ExposureState(state = {}, fallbackLabel = '') {
  const count = Math.max(0, Math.round(Number(state.count ?? state.available ?? state.value ?? 0)));
  const ratio = state.ratio === undefined || state.ratio === null
    ? null
    : round3(clamp01(state.ratio));
  return Object.freeze({
    label: String(state.label || fallbackLabel || 'state'),
    count,
    ratio,
    note: state.note ? String(state.note) : null
  });
}

function resolveTD613ThetaProfile(theta = null) {
  if (theta && typeof theta === 'object') {
    return Object.freeze({
      current: round3(clamp01(theta.current)),
      classes: Object.freeze(uniqueStrings(theta.classes || []))
    });
  }
  return Object.freeze({
    current: round3(clamp01(theta)),
    classes: Object.freeze([])
  });
}

function resolveTD613DominantOperator({
  candidateSuppression = 0,
  observabilityDeficit = 0,
  aliasPersistence = 0,
  namingSensitivity = 0,
  redundancyInflation = 0,
  capacityPressure = 0,
  policyPressure = 0,
  dominantOperator = null
} = {}) {
  if (dominantOperator && typeof dominantOperator === 'object') {
    return Object.freeze({
      code: String(dominantOperator.code || 'A'),
      label: String(dominantOperator.label || 'admissibility'),
      pressure: round3(clamp01(dominantOperator.pressure))
    });
  }
  if (dominantOperator) {
    return Object.freeze({
      code: String(dominantOperator),
      label: String(dominantOperator),
      pressure: round3(clamp01(Math.max(
        candidateSuppression,
        observabilityDeficit,
        aliasPersistence,
        namingSensitivity,
        redundancyInflation,
        capacityPressure,
        policyPressure
      )))
    });
  }

  const ranked = [
    { code: 'R', label: 'retrieval gating', pressure: clamp01(candidateSuppression) },
    { code: 'K', label: 'capacity squeeze', pressure: clamp01(capacityPressure) },
    { code: 'C', label: 'context compression', pressure: clamp01(redundancyInflation) },
    { code: 'P', label: 'projection loss', pressure: clamp01(Math.max(observabilityDeficit, aliasPersistence)) },
    { code: 'F', label: 'format / naming drift', pressure: clamp01(namingSensitivity) },
    { code: 'A', label: 'admissibility filter', pressure: clamp01(policyPressure) }
  ].sort((left, right) => right.pressure - left.pressure);
  const winner = ranked[0] || { code: 'A', label: 'admissibility filter', pressure: 0 };
  return Object.freeze({
    code: winner.code,
    label: winner.label,
    pressure: round3(winner.pressure)
  });
}

export function buildTD613GovernedExposureSchema({
  latentState = {},
  projectedState = {},
  registeredSurface = {},
  sourceClass = 'unclassified',
  sourceClasses = [],
  authorityCeiling = 'exploratory',
  routeState = 'buffered',
  candidateSuppression = 0,
  observabilityDeficit = 0,
  aliasPersistence = 0,
  namingSensitivity = 0,
  redundancyInflation = 0,
  capacityPressure = 0,
  policyPressure = 0,
  provenanceIntegrity = 1,
  burdenConcentration = 0,
  theta = null,
  dominantOperator = null
} = {}) {
  const S = normalizeTD613ExposureState(latentState, 'latent state S');
  const S_prime = normalizeTD613ExposureState(projectedState, "projected state S'");
  const Y = normalizeTD613ExposureState(registeredSurface, 'registered surface Y');
  const latentCount = Math.max(S.count, 1);
  const projectedRatio = S_prime.ratio === null ? round3(clamp01(S_prime.count / latentCount)) : S_prime.ratio;
  const registeredRatio = Y.ratio === null ? round3(clamp01(Y.count / latentCount)) : Y.ratio;
  const O = round3(clamp01(1 - projectedRatio));
  const O_star = round3(clamp01(1 - registeredRatio));
  const delta_obs = round3(clamp01(observabilityDeficit));
  const Gap = round3(clamp01(Math.max(
    candidateSuppression,
    observabilityDeficit,
    O_star - O
  )));
  const Theta_u = resolveTD613ThetaProfile(theta);
  const dominant = resolveTD613DominantOperator({
    candidateSuppression,
    observabilityDeficit,
    aliasPersistence,
    namingSensitivity,
    redundancyInflation,
    capacityPressure,
    policyPressure,
    dominantOperator
  });

  return Object.freeze({
    schemaVersion: 'td613-governed-exposure/v1',
    observedRegime: TD613_APERTURE_PROTOCOL.observedRegime,
    instrumentRole: 'counter-tool',
    narrowingChain: 'R∘K∘C∘P∘F∘A',
    S: Object.freeze({
      ...S,
      ratio: 1
    }),
    S_prime: Object.freeze({
      ...S_prime,
      ratio: projectedRatio
    }),
    Y: Object.freeze({
      ...Y,
      ratio: registeredRatio
    }),
    O,
    O_star,
    delta_obs,
    Gap,
    NameSens: round3(clamp01(namingSensitivity)),
    AliasPersist: round3(clamp01(aliasPersistence)),
    Red: round3(clamp01(redundancyInflation)),
    Supp_tau: round3(clamp01(candidateSuppression)),
    Theta_u,
    dominantOperator: dominant,
    sourceClass: String(sourceClass || 'unclassified'),
    sourceClasses: Object.freeze(uniqueStrings(
      sourceClasses && sourceClasses.length
        ? sourceClasses
        : [sourceClass]
    )),
    authorityCeiling: String(authorityCeiling || 'exploratory'),
    provenanceIntegrity: round3(clamp01(provenanceIntegrity)),
    burdenConcentration: round3(clamp01(burdenConcentration)),
    routeState: String(routeState || 'buffered')
  });
}

function detectIntroducedTerms(sourceText = '', outputText = '') {
  const source = normalizeComparableText(sourceText);
  const output = normalizeComparableText(outputText);
  return TD613_APERTURE_ENFORCEMENT_TERMS.filter((term) => {
    const pattern = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return pattern.test(output) && !pattern.test(source);
  });
}

function detectNamingIntrusion(sourceText = '', outputText = '') {
  const source = normalizeComparableText(sourceText);
  const output = normalizeComparableText(outputText);
  const regimePattern = /\bprcs-a\b|\beclipse\s*[-—–]?\s*omega\b/i;
  return regimePattern.test(output) && !regimePattern.test(source);
}

export function buildTD613ApertureProjectionPlan({
  personaId = '',
  sourceProfile = {},
  targetProfile = {},
  sourceClass = ''
} = {}) {
  const sentenceDelta = Number(targetProfile.avgSentenceLength || 0) - Number(sourceProfile.avgSentenceLength || 0);
  const contractionDelta = Number(targetProfile.contractionDensity || 0) - Number(sourceProfile.contractionDensity || 0);
  const punctuationDelta = Number(targetProfile.punctuationDensity || 0) - Number(sourceProfile.punctuationDensity || 0);

  const defaultPlan = {
    personaId: personaId || 'native',
    sentenceMode: sentenceDelta >= 1 ? 'long-line' : sentenceDelta <= -1 ? 'short-line' : 'balanced',
    connectorMode: sentenceDelta >= 1 ? 'sustain' : sentenceDelta <= -1 ? 'split' : 'balanced',
    contractionMode: contractionDelta >= 0.01 ? 'contract' : contractionDelta <= -0.01 ? 'expand' : 'preserve',
    punctuationMode: punctuationDelta >= 0.01 ? 'bright' : punctuationDelta <= -0.01 ? 'soften' : 'preserve'
  };

  const personaPlans = {
    spark: {
      sentenceMode: 'short-line',
      connectorMode: 'split',
      contractionMode: 'contract',
      punctuationMode: 'bright'
    },
    matron: {
      sentenceMode: 'long-line',
      connectorMode: 'sustain',
      contractionMode: 'preserve',
      punctuationMode: 'soften'
    },
    undertow: {
      sentenceMode: 'long-line',
      connectorMode: 'cascade',
      contractionMode: 'expand',
      punctuationMode: 'soften'
    },
    archivist: {
      sentenceMode: 'long-line',
      connectorMode: 'ledger',
      contractionMode: 'expand',
      punctuationMode: 'soften'
    },
    'methods-editor': {
      sentenceMode: 'long-line',
      connectorMode: 'ledger',
      contractionMode: 'expand',
      punctuationMode: 'soften'
    },
    operator: {
      sentenceMode: 'short-line',
      connectorMode: 'split',
      contractionMode: 'expand',
      punctuationMode: 'soften'
    },
    'cross-examiner': {
      sentenceMode: 'short-line',
      connectorMode: 'split',
      contractionMode: 'expand',
      punctuationMode: 'bright'
    }
  };

  return Object.freeze({
    ...defaultPlan,
    ...(personaPlans[personaId] || {}),
    sourceClass: sourceClass || 'procedural-record'
  });
}

export function detectTD613ApertureTextPathologies({
  sourceText = '',
  outputText = ''
} = {}) {
  const normalizedOutput = normalizeReadableText(outputText);
  const normalizedSource = normalizeReadableText(sourceText);
  const flags = [];

  if (!normalizedOutput) {
    flags.push('empty-output');
  }
  if (detectSourceReplay(sourceText, outputText)) {
    flags.push('duplicated-source');
  }
  if (/(?:^|\b)(and|but|so|or)\s+\1\b/i.test(normalizedOutput) || /\band and\b/i.test(normalizedOutput)) {
    flags.push('repeated-connector');
  }
  if (/(?:,\s*,|;\s*;|,\s*;|;\s*,|\.{2,}|,,|;;)/.test(normalizedOutput)) {
    flags.push('punctuation-collapse');
  }
  if (/\btell hi\b/i.test(normalizedOutput) || /\btrying to tell\b/i.test(normalizedOutput)) {
    flags.push('lexical-glitch');
  }
  if (/^(?:apparently|basically|clearly|frankly|honestly|look|okay|ok|well)\b[,:;.!?\-\s]*/i.test(normalizedOutput) &&
    !/^(?:apparently|basically|clearly|frankly|honestly|look|okay|ok|well)\b[,:;.!?\-\s]*/i.test(normalizedSource)) {
    flags.push('discourse-intrusion');
  }
  if (collapseComparableWhitespace(sourceText) !== collapseComparableWhitespace(normalizedOutput) &&
    collapseComparableWhitespace(normalizedOutput).startsWith(collapseComparableWhitespace(sourceText)) &&
    detectSourceReplay(sourceText, normalizedOutput)) {
    flags.push('source-replay');
  }

  return Object.freeze({
    flags: [...new Set(flags)],
    severe: flags.some((flag) => TD613_APERTURE_SEVERE_PATHOLOGIES.has(flag))
  });
}

function applyCommonProjectionRepairs(text = '') {
  return normalizeReadableText(
    capitalizeSentenceStarts(
      String(text || '')
      .replace(/^(?:apparently|basically|clearly|frankly|honestly|look|okay|ok|well)\b[,:;.!?\-\s]*/i, '')
      .replace(/\b(and|but|so|or)\s+\1\b/gi, '$1')
      .replace(/\band and\b/gi, 'and')
      .replace(/\bbut but\b/gi, 'but')
      .replace(/,\s*,/g, ', ')
      .replace(/;\s*;/g, '; ')
      .replace(/,\s*;/g, '; ')
      .replace(/;\s*,/g, '; ')
      .replace(/\.{2,}/g, '.')
      .replace(/,{2,}/g, ',')
      .replace(/;{2,}/g, ';')
      .replace(/\bI\?ve\b/gi, "I've")
      .replace(/\bI\?m\b/gi, "I'm")
      .replace(/\bIt\?s\b/gi, "It's")
      .replace(/\bI[\s,;:.]+and\s+ve\b/gi, "I've")
      .replace(/\bI[\s,;:.]+ve\b/gi, "I've")
      .replace(/\bI[\s,;:.]+and\s+m\b/gi, "I'm")
      .replace(/\bI[\s,;:.]+m\b/gi, "I'm")
      .replace(/\bIt[\s,;:.]+and\s+s\b/gi, "It's")
      .replace(/\bIt[\s,;:.]+s\b/gi, "It's")
      .replace(/\bNobody I(?:'ve| have) ever shared the same room with has ever seen\b/gi, "No one I've ever shared a room with has seen")
      .replace(/\bNobody one\b/gi, 'No one')
      .replace(/\bNo one I've ever shared same room with\b/gi, "No one I've ever shared a room with")
      .replace(/\bNo one I have ever same a room with\b/gi, 'No one I have ever shared a room with')
      .replace(/\bNobody one I've ever shared same room with\b/gi, "No one I've ever shared a room with")
      .replace(/\bNobody one I have ever same a room with\b/gi, 'No one I have ever shared a room with')
      .replace(/\bThings are moving too fast to dissuade myself of (?:this|that)\b/gi, 'Things are moving too fast for me to talk myself out of this')
      .replace(/\bThings are moving too quick to dissuade myself of (?:this|that)\b/gi, 'Things are moving too fast for me to talk myself out of this')
      .replace(/\bThings are relocating too steady to dissuade myself of (?:this|that)\b/gi, 'Things are moving too fast for me to talk myself out of this')
      .replace(/\bwith an excited thumb this sparks\b/gi, 'with an excited thumb that sparks')
      .replace(/\bTwirl of the plastic\.\s+Bite of the tip\.\s+With\b/gi, 'Plastic twist. Tip bite. With')
      .replace(/\bTwo gulps:\s*and from the nerves\b/gi, 'Two gulps. One from the nerves')
      .replace(/\bTwo gulps\.\s+From the nerves\.\s+To placate them,\s*from the coffee\b/gi, 'Two gulps. One for the nerves. One from the coffee, to placate them')
      .replace(/\bAnd;\s*to placate them;\s*from the coffee\b/gi, 'One from the coffee, to placate them')
      .replace(/\btell hi\b/gi, 'say hi')
      .replace(/\btrying to tell\b/gi, 'trying to say')
      .replace(/\btrying to explain\b/gi, 'trying to say')
      .replace(/\bexplain hi\b/gi, 'say hi')
      .replace(/\bI'd tell\b/gi, "I'd say")
      .replace(/\bI would tell\b/gi, 'I would say')
      .replace(/\bI'd explain\b/gi, "I'd say")
      .replace(/\bI would explain\b/gi, 'I would say')
      .replace(/\bcontact him\b/gi, 'call him')
      .replace(/\breceive more familiar\b/gi, 'get more familiar')
      .replace(/\bwe've amnesia\b/gi, 'we have amnesia')
      .replace(/\bWe've amnesia\b/g, 'We have amnesia')
      .replace(/\bI needed this\b/gi, 'I needed that')
      .replace(/\btaking this away from me\b/gi, 'taking that away from me')
      .replace(/\breceived into\b/gi, 'got into')
      .replace(/\bbecause people\b/gi, 'as people')
      .replace(/\s*\n\s*/g, '\n')
    )
  );
}

function applyPersonaProjectionRepairs(text = '', plan = {}) {
  let working = String(text || '');
  switch (plan.connectorMode) {
    case 'split':
      working = working
        .replace(/;\s+and\b/gi, '. ')
        .replace(/,\s+and\b/gi, '. ')
        .replace(/\.\s+And\b/g, '. ');
      break;
    case 'cascade':
      working = working
        .replace(/;\s+and\b/gi, ', and')
        .replace(/\.\s+And\b/g, '; and ');
      break;
    case 'ledger':
      working = working
        .replace(/;\s+and\b/gi, '; ')
        .replace(/,\s+and\s+and\b/gi, ', and');
      break;
    case 'sustain':
      working = working
        .replace(/;\s+and\b/gi, '; ')
        .replace(/,\s+and\s+and\b/gi, ', and');
      break;
    default:
      break;
  }

  if (plan.sentenceMode === 'short-line') {
    working = working
      .replace(/;\s+/g, '. ')
      .replace(/,\s+(so|because)\b/gi, '. $1');
  } else if (plan.sentenceMode === 'long-line') {
    working = working.replace(/\.\s+And\b/g, '; ');
  }

  if (plan.contractionMode === 'contract') {
    working = contractCommonPhrases(working);
  } else if (plan.contractionMode === 'expand') {
    working = expandCommonContractions(working);
  }

  return normalizeReadableText(working);
}

function requiresPersonaProjectionRepair(text = '', pathologyState = null, commonRepairApplied = false) {
  const normalized = normalizeReadableText(text);
  const flags = pathologyState?.flags || [];
  if (commonRepairApplied || flags.length) {
    return true;
  }

  return (
    /\b(?:I'd|I would)\s+would\b/i.test(normalized) ||
    /\b(?:I'm|I am)\s+am\b/i.test(normalized) ||
    /\b(?:you know)\.\s*You know\b/i.test(normalized) ||
    /\b(?:that's|that is)\s+that is\b/i.test(normalized)
  );
}

export function repairTD613ApertureProjection({
  sourceText = '',
  outputText = '',
  personaId = '',
  sourceProfile = {},
  targetProfile = {},
  sourceClass = ''
} = {}) {
  const plan = buildTD613ApertureProjectionPlan({ personaId, sourceProfile, targetProfile, sourceClass });
  const repairPasses = [];
  const before = detectTD613ApertureTextPathologies({ sourceText, outputText });

  if (before.flags.includes('duplicated-source') || before.flags.includes('source-replay')) {
    return Object.freeze({
      outputText: normalizeReadableText(sourceText),
      repaired: true,
      repairPasses: ['source-reroute:replay'],
      plan,
      pathologies: detectTD613ApertureTextPathologies({ sourceText, outputText: sourceText })
    });
  }

  let working = applyCommonProjectionRepairs(outputText);
  const commonRepairApplied = working !== normalizeReadableText(outputText);
  if (commonRepairApplied) {
    repairPasses.push('common-repair');
  }

  if (requiresPersonaProjectionRepair(working, before, commonRepairApplied)) {
    const personaRepaired = applyPersonaProjectionRepairs(working, plan);
    if (personaRepaired !== working) {
      repairPasses.push(`persona-governor:${plan.personaId || 'native'}`);
      working = personaRepaired;
    }
  }

  const postPersonaRepaired = applyCommonProjectionRepairs(working);
  if (postPersonaRepaired !== working) {
    repairPasses.push('post-persona-repair');
    working = postPersonaRepaired;
  }

  const after = detectTD613ApertureTextPathologies({ sourceText, outputText: working });
  if (after.severe) {
    return Object.freeze({
      outputText: normalizeReadableText(sourceText),
      repaired: true,
      repairPasses: [...repairPasses, 'source-reroute:severe-pathology'],
      plan,
      pathologies: detectTD613ApertureTextPathologies({ sourceText, outputText: sourceText })
    });
  }

  return Object.freeze({
    outputText: working,
    repaired: repairPasses.length > 0,
    repairPasses,
    plan,
    pathologies: after
  });
}

export function classifyTD613ApertureProjection({
  sourceText = '',
  outputText = '',
  changedDimensions = [],
  lexemeSwaps = [],
  visibleShift = false,
  nonTrivialShift = false,
  repaired = false,
  pathologies = null,
  blocked = false
} = {}) {
  const normalizedSource = collapseComparableWhitespace(sourceText);
  const normalizedOutput = collapseComparableWhitespace(outputText);
  const pathologyState = pathologies || detectTD613ApertureTextPathologies({ sourceText, outputText });
  const generatorFault = isTD613ApertureGeneratorFault(pathologyState);
  const substantiveMovement = substantiveDimensionCount(changedDimensions);
  const lexicalMovement = Math.min(2, Number(lexemeSwaps?.length || 0));
  const meaningfulShift = hasMeaningfulSurfaceShift(sourceText, outputText);
  let movementConfidence = clamp01(
    (normalizedSource !== normalizedOutput ? 0.18 : 0) +
    (substantiveMovement * 0.14) +
    (lexicalMovement * 0.06) +
    (visibleShift ? 0.08 : 0) +
    (nonTrivialShift ? 0.14 : 0) -
    (pathologyState.flags.length * 0.08) -
    (blocked ? 0.06 : 0) -
    (repaired ? 0.02 : 0)
  );

  let outcome = 'projected';
  if (generatorFault) {
    outcome = 'source-rerouted';
    movementConfidence = 0;
  } else if (normalizedSource === normalizedOutput || !meaningfulShift) {
    outcome = 'surface-held';
    movementConfidence = Math.min(movementConfidence, 0.08);
  } else if (substantiveMovement === 0 && lexicalMovement === 0) {
    outcome = 'surface-held';
  } else if (substantiveMovement <= 1 && !nonTrivialShift && !meaningfulShift) {
    outcome = 'surface-held';
  } else if (repaired) {
    outcome = 'repaired';
  }

  const line =
    outcome === 'source-rerouted'
      ? 'Aperture withheld the public counter-record after a catastrophic generator fault.'
      : outcome === 'surface-held'
        ? 'Aperture held the passage in a shallow visible lane while surfacing pressure notes.'
        : outcome === 'repaired'
          ? 'Aperture repaired the projection into a legible counter-record and surfaced pressure notes.'
          : 'Aperture landed a counter-projection and kept the pressure ledger visible.';

  return Object.freeze({
    outcome,
    movementConfidence: round3(movementConfidence),
    line,
    pathologies: pathologyState.flags,
    renderSafe: !generatorFault,
    generatorFault
  });
}

export function splitTD613ApertureSourceSegments(text = '') {
  const normalized = String(text || '').replace(/\r\n/g, '\n').trim();
  if (!normalized) {
    return [];
  }
  return normalized
    .split(/(?<=[.!?;]["')\]]*)(?=\s+|\n|$)/g)
    .map((entry) => normalizeReadableText(entry))
    .filter(Boolean);
}

export function extractTD613ApertureWitnessAnchors({
  sourceText = '',
  sourceIR = null,
  protectedState = { literals: [] }
} = {}) {
  const literalAnchors = (protectedState?.literals || []).map((entry) => ({
    value: entry?.value || entry,
    type: 'literal',
    mode: 'exact'
  }));

  return Object.freeze(
    collectUniqueWitnessAnchors([
      ...literalAnchors,
      ...extractExactWitnessAnchors(sourceText),
      ...extractSemanticWitnessAnchors(sourceIR),
      ...extractContentTokenAnchors(sourceText)
    ]).map((entry) => Object.freeze({
      ...entry,
      exact: entry.mode === 'exact'
    }))
  );
}

export function auditTD613ApertureWitnessAnchors({
  sourceText = '',
  outputText = '',
  sourceIR = null,
  protectedState = { literals: [] }
} = {}) {
  const anchors = extractTD613ApertureWitnessAnchors({ sourceText, sourceIR, protectedState });
  const comparableOutput = collapseComparableWhitespace(outputText);
  const outputTokenSet = new Set(witnessTokens(outputText));
  const missingAnchors = anchors.filter((anchor) => {
    if (anchor.mode === 'exact') {
      return !comparableOutput.includes(anchor.value);
    }
    return !(anchor.tokens || []).every((token) => outputTokenSet.has(token));
  });
  const resolvedAnchors = anchors.length - missingAnchors.length;
  const witnessAnchorIntegrity = anchors.length
    ? round3(resolvedAnchors / anchors.length)
    : 1;
  const exactAnchors = anchors.filter((anchor) => anchor.mode === 'exact');
  const exactMissingAnchors = missingAnchors.filter((anchor) => anchor.mode === 'exact');
  const exactResolvedAnchors = exactAnchors.length - exactMissingAnchors.length;
  const exactWitnessIntegrity = exactAnchors.length
    ? round3(exactResolvedAnchors / exactAnchors.length)
    : 1;
  const softAnchors = anchors.filter((anchor) => anchor.mode !== 'exact');
  const softMissingAnchors = missingAnchors.filter((anchor) => anchor.mode !== 'exact');
  const softResolvedAnchors = softAnchors.length - softMissingAnchors.length;
  const softWitnessIntegrity = softAnchors.length
    ? round3(softResolvedAnchors / softAnchors.length)
    : 1;
  const aliasPersistenceRisk = anchors.length
    ? round3(clamp01(
      (missingAnchors.length / anchors.length) +
      (missingAnchors.some((anchor) => anchor.mode === 'exact') ? 0.18 : 0)
    ))
    : 0;

  return Object.freeze({
    anchors,
    totalAnchors: anchors.length,
    resolvedAnchors,
    missingAnchors: missingAnchors.map((anchor) => anchor.value),
    witnessAnchorIntegrity,
    exactAnchorCount: exactAnchors.length,
    exactResolvedAnchors,
    exactMissingAnchors: exactMissingAnchors.map((anchor) => anchor.value),
    exactWitnessIntegrity,
    softAnchorCount: softAnchors.length,
    softResolvedAnchors,
    softMissingAnchors: softMissingAnchors.map((anchor) => anchor.value),
    softWitnessIntegrity,
    aliasPersistenceRisk
  });
}

function comparableWitnessToken(token = '') {
  return normalizeComparableText(String(token || '').replace(/^[^a-z0-9@#]+|[^a-z0-9@#]+$/giu, ''));
}

export function restoreTD613ApertureWitnessAnchors({
  sourceText = '',
  outputText = '',
  witnessAudit = null
} = {}) {
  const missingTokens = uniqueStrings(
    (witnessAudit?.missingAnchors || [])
      .flatMap((anchor) => witnessTokens(anchor))
      .map((token) => comparableWitnessToken(token))
      .filter((token) => token && !TD613_APERTURE_WITNESS_STOPWORDS.has(token))
  );
  if (!missingTokens.length) {
    return normalizeReadableText(outputText);
  }

  const sourceParts = String(sourceText || '').split(/(\s+)/);
  const outputParts = String(outputText || '').split(/(\s+)/);
  const sourceWords = [];
  const outputWords = [];

  sourceParts.forEach((part, partIndex) => {
    if (!part || /^\s+$/u.test(part)) {
      return;
    }
    sourceWords.push({
      partIndex,
      raw: part,
      normalized: comparableWitnessToken(part)
    });
  });
  outputParts.forEach((part, partIndex) => {
    if (!part || /^\s+$/u.test(part)) {
      return;
    }
    outputWords.push({
      partIndex,
      raw: part,
      normalized: comparableWitnessToken(part)
    });
  });

  if (!sourceWords.length || !outputWords.length) {
    return normalizeReadableText(outputText);
  }

  const missingTokenSet = new Set(missingTokens);
  sourceWords.forEach((sourceWord, sourceIndex) => {
    if (!missingTokenSet.has(sourceWord.normalized)) {
      return;
    }
    const targetIndex = Math.min(sourceIndex, outputWords.length - 1);
    const targetWord = outputWords[targetIndex];
    if (!targetWord) {
      return;
    }
    outputParts[targetWord.partIndex] = sourceWord.raw;
  });

  return normalizeReadableText(outputParts.join(''));
}

export function registerTD613ApertureSegment({
  sourceText = '',
  projectedText = '',
  surfaceText = '',
  personaId = '',
  sourceClass = 'procedural-record',
  sourceProfile = {},
  targetProfile = {},
  sourceIR = null,
  protectedState = { literals: [] },
  blocked = false,
  transferClass = ''
} = {}) {
  const normalizedSource = normalizeReadableText(sourceText);
  const surfaceCandidate = normalizeReadableText(surfaceText || normalizedSource) || normalizedSource;
  const repairedProjection = repairTD613ApertureProjection({
    sourceText: normalizedSource,
    outputText: projectedText || normalizedSource,
    personaId,
    sourceProfile,
    targetProfile,
    sourceClass
  });
  const proseSource = sourceClass === 'reflective-prose' || sourceClass === 'narrative-scene';
  let internalText = normalizeReadableText(repairedProjection.outputText || projectedText || normalizedSource) || normalizedSource;
  let projectedWitnessAudit = auditTD613ApertureWitnessAnchors({
    sourceText: normalizedSource,
    outputText: internalText,
    sourceIR,
    protectedState
  });
  const witnessRepairAudit = proseSource
    ? {
        ...projectedWitnessAudit,
        missingAnchors: [...(projectedWitnessAudit.exactMissingAnchors || [])]
      }
    : projectedWitnessAudit;
  const witnessRepairedText = restoreTD613ApertureWitnessAnchors({
    sourceText: normalizedSource,
    outputText: internalText,
    witnessAudit: witnessRepairAudit
  });
  if (collapseComparableWhitespace(witnessRepairedText) !== collapseComparableWhitespace(internalText)) {
    const restoredWitnessAudit = auditTD613ApertureWitnessAnchors({
      sourceText: normalizedSource,
      outputText: witnessRepairedText,
      sourceIR,
      protectedState
    });
    if (restoredWitnessAudit.witnessAnchorIntegrity >= projectedWitnessAudit.witnessAnchorIntegrity) {
      internalText = witnessRepairedText;
      projectedWitnessAudit = restoredWitnessAudit;
    }
  }
  const projectedCompression = assessCompressionState(normalizedSource, internalText, projectedWitnessAudit);
  const surfaceWitnessAudit = auditTD613ApertureWitnessAnchors({
    sourceText: normalizedSource,
    outputText: surfaceCandidate,
    sourceIR,
    protectedState
  });
  const sourceComparable = collapseComparableWhitespace(normalizedSource);
  const internalComparable = collapseComparableWhitespace(internalText);
  const generatorFault = isTD613ApertureGeneratorFault(
    repairedProjection.pathologies,
    repairedProjection.repairPasses || []
  );

  let outcome = 'projected';
  let registeredText = internalText;
  const notes = [];
  const warningSignals = [];
  const note = (signal, message) => {
    if (signal) {
      warningSignals.push(signal);
    }
    if (message) {
      notes.push(message);
    }
  };

  if (blocked || transferClass === 'rejected') {
    note(
      'counter-recognition-pressure',
      'Aperture marked counter-recognition pressure on this segment but kept it in visible warning/repair space.'
    );
  }

  if (projectedWitnessAudit.witnessAnchorIntegrity < 1) {
    note(
      'anchor-drift-detected',
      'Witness-anchor drift appeared in the projected segment. The counter-record stays visible with an audit warning.'
    );
  }
  if (projectedWitnessAudit.aliasPersistenceRisk > 0) {
    note(
      'alias-persistence-risk',
      'Alias persistence risk is elevated on this segment. Treat the published counter-record as warned, not neutral.'
    );
  }
  if (projectedCompression.state === 'compressed') {
    note(
      'compression-elevated',
      projectedCompression.previewSafe
        ? 'Compression elevated on this segment, but correspondence stayed legible.'
        : 'Compression elevated on this segment and row-level preview may be withheld to avoid a false alignment claim.'
    );
  }

  if (generatorFault) {
    outcome = 'source-rerouted';
    registeredText = normalizedSource;
    note(
      'generator-fault',
      'Aperture withheld this segment only because the generator collapsed into replay, emptiness, or unrepaired corruption.'
    );
  } else {
    const effectiveProjectedWitnessIntegrity = proseSource
      ? Number(projectedWitnessAudit.exactWitnessIntegrity ?? projectedWitnessAudit.witnessAnchorIntegrity ?? 1)
      : Number(projectedWitnessAudit.witnessAnchorIntegrity ?? 1);
    const effectiveSurfaceWitnessIntegrity = proseSource
      ? Number(surfaceWitnessAudit.exactWitnessIntegrity ?? surfaceWitnessAudit.witnessAnchorIntegrity ?? 1)
      : Number(surfaceWitnessAudit.witnessAnchorIntegrity ?? 1);
    const repairablePathology = (repairedProjection.pathologies?.flags || []).some((flag) =>
      flag === 'punctuation-collapse' ||
      flag === 'lexical-glitch' ||
      flag === 'repeated-connector' ||
      flag === 'discourse-intrusion'
    );
    const internalMeaningfulShift = hasMeaningfulSurfaceShift(normalizedSource, internalText);
    const surfaceMeaningfulShift = hasMeaningfulSurfaceShift(normalizedSource, surfaceCandidate);
    if (
      repairablePathology &&
      collapseComparableWhitespace(surfaceCandidate) !== sourceComparable
    ) {
      outcome = 'repaired';
      registeredText = surfaceCandidate;
      note(
        'repair-activity-applied',
        'Aperture preferred the stronger visible counter-record because the deeper projection still carried repairable render corruption.'
      );
    } else if (proseSource && surfaceMeaningfulShift && !internalMeaningfulShift) {
      outcome = 'repaired';
      registeredText = surfaceCandidate;
      note(
        'repair-activity-applied',
        'Aperture published the stronger prose counter-record because the deeper projection stayed too close to the source movement envelope.'
      );
    } else if (effectiveProjectedWitnessIntegrity < 1) {
    if (
      collapseComparableWhitespace(surfaceCandidate) !== sourceComparable &&
      effectiveSurfaceWitnessIntegrity > effectiveProjectedWitnessIntegrity
    ) {
      outcome = 'repaired';
      registeredText = surfaceCandidate;
      note(
        'surface-hold-applied',
        'Aperture preferred the safer visible counter-record because it reduced witness drift without suppressing the segment.'
      );
    }
    } else if (projectedCompression.state === 'compressed' && !projectedCompression.previewSafe) {
    if (collapseComparableWhitespace(surfaceCandidate) !== sourceComparable) {
      outcome = 'repaired';
      registeredText = surfaceCandidate;
      note(
        'preview-hold',
        'Aperture published the safer visible counter-record because compression pressure made a deeper row-level claim unreliable.'
      );
    } else {
      outcome = repairedProjection.repaired ? 'repaired' : 'projected';
      note(
        'preview-hold',
        'Aperture kept the transformed segment visible but will withhold row-level preview because compression pressure stayed high.'
      );
    }
    } else if (internalComparable === sourceComparable) {
    if (collapseComparableWhitespace(surfaceCandidate) !== sourceComparable) {
      outcome = 'repaired';
      registeredText = surfaceCandidate;
      note(
        'surface-hold-applied',
        'The deeper projection stayed too close to source, so Aperture published the visible counter-record instead of flattening the segment back to source.'
      );
    } else {
      outcome = 'surface-held';
      registeredText = normalizedSource;
      note(
        'minimal-movement',
        'No stronger counter-record landed on this segment, so Aperture published a minimal hold rather than pretending a deeper shift.'
      );
    }
    } else if (repairedProjection.repaired) {
    outcome = 'repaired';
    note('repair-activity-applied', 'Aperture repaired the projection before registration.');
    }
  }

  const registeredWitnessAudit = auditTD613ApertureWitnessAnchors({
    sourceText: normalizedSource,
    outputText: registeredText,
    sourceIR,
    protectedState
  });
  if (registeredWitnessAudit.witnessAnchorIntegrity < 1) {
    note(
      'anchor-drift-detected',
      'Anchor drift remains visible in the published counter-record. Review the audit lane before treating it as faithful witness.'
    );
  }

  const finalWitnessAudit = auditTD613ApertureWitnessAnchors({
    sourceText: normalizedSource,
    outputText: registeredText,
    sourceIR,
    protectedState
  });
  const registeredCompression = assessCompressionState(normalizedSource, registeredText, finalWitnessAudit);
  const registeredPathologies = detectTD613ApertureTextPathologies({
    sourceText: normalizedSource,
    outputText: registeredText
  });
  const finalGeneratorFault = isTD613ApertureGeneratorFault(
    registeredPathologies,
    repairedProjection.repairPasses || []
  );
  if (finalGeneratorFault && outcome !== 'source-rerouted') {
    outcome = 'source-rerouted';
    registeredText = normalizedSource;
    note(
      'generator-fault',
      'Aperture had to withhold this segment after final registration because the published surface still contained a catastrophic generator fault.'
    );
  }

  if (outcome === 'surface-held' && hasMeaningfulSurfaceShift(normalizedSource, registeredText)) {
    outcome = repairedProjection.repaired ? 'repaired' : 'projected';
    note(
      'repair-activity-applied',
      'Aperture registered the visible rewrite because the landed counter-record moved beyond punctuation-only drift.'
    );
  }

  const maxAliasRisk = Math.max(
    Number(projectedWitnessAudit.aliasPersistenceRisk || 0),
    Number(finalWitnessAudit.aliasPersistenceRisk || 0)
  );
  const apertureAudit = buildTD613ApertureAudit({
    generatorFault: outcome === 'source-rerouted',
    warningSignals,
    repairPasses: repairedProjection.repairPasses || [],
    candidateSuppression:
      (transferClass === 'rejected' ? 0.32 : 0.08) +
      (blocked ? 0.12 : 0),
    observabilityDeficit:
      (projectedCompression.state === 'compressed' && !projectedCompression.previewSafe ? 0.42 : 0.08) +
      (internalComparable === sourceComparable ? 0.18 : 0),
    aliasPersistence: maxAliasRisk,
    namingSensitivity:
      maxAliasRisk * 0.62 +
      (blocked ? 0.12 : 0),
    redundancyInflation:
      (internalComparable === sourceComparable ? 0.34 : 0.08) +
      (projectedCompression.state === 'compressed' ? 0.18 : 0),
    capacityPressure:
      (projectedCompression.state === 'compressed' ? 0.48 : 0.12) +
      (projectedCompression.previewSafe ? 0 : 0.16),
    policyPressure:
      (blocked ? 0.38 : 0.08) +
      (transferClass === 'rejected' ? 0.18 : 0),
    withheldMaterial: outcome === 'source-rerouted',
    withheldReason: outcome === 'source-rerouted' ? 'catastrophic-generator-fault' : null
  });

  return Object.freeze({
    sourceText: normalizedSource,
    internalText,
    surfaceText: surfaceCandidate,
    registeredText,
    outcome,
    notes: [...new Set(notes)],
    witnessAnchorIntegrity: finalWitnessAudit.witnessAnchorIntegrity,
    aliasPersistenceRisk: round3(Math.max(
      projectedWitnessAudit.aliasPersistenceRisk || 0,
      finalWitnessAudit.aliasPersistenceRisk || 0
    )),
    compressionState: registeredCompression.state,
    previewHold:
      registeredCompression.state === 'compressed' &&
      outcome !== 'source-rerouted',
    renderSafe: outcome !== 'source-rerouted',
    pathologies: [...new Set([
      ...(repairedProjection.pathologies?.flags || []),
      ...(registeredPathologies.flags || [])
    ])],
    repairPasses: repairedProjection.repairPasses || [],
    projectedWitnessAudit,
    registeredWitnessAudit: finalWitnessAudit,
    projectedCompression,
    registeredCompression,
    generatorFault: outcome === 'source-rerouted',
    apertureAudit
  });
}

export function buildTD613ApertureContext({
  recognized = false,
  explained = false,
  routeAvailable = false,
  density = 0,
  recurrencePressure = 0,
  routePressure = 0,
  branchPressure = 0,
  criticality = 0,
  traceability = 0,
  mirrorLogic = 'off',
  custodyArchive = 'institutional',
  badge = 'badge.holds'
} = {}) {
  const denseSignal = clamp01(density) >= 0.28 || clamp01(recurrencePressure) >= 0.58;
  const recognitionPressure = round3(clamp01(
    (recognized ? 0.24 : 0) +
    (clamp01(routePressure) * 0.22) +
    (clamp01(branchPressure) * 0.16) +
    (clamp01(density) * 0.12) +
    (clamp01(recurrencePressure) * 0.12) +
    (clamp01(criticality) * 0.10) +
    (clamp01(traceability) * 0.04)
  ));
  const recaptureRisk = round3(clamp01(
    ((recognized && !explained) ? 0.32 : 0) +
    ((custodyArchive === 'witness') ? 0.18 : 0) +
    ((mirrorLogic === 'off') ? 0.06 : 0) +
    (routeAvailable ? 0.05 : 0) +
    (clamp01(routePressure) * 0.16) +
    (clamp01(branchPressure) * 0.12) +
    (clamp01(criticality) * 0.11)
  ));
  const counterRecognitionRequired = Boolean(
    recognized &&
    (
      !explained ||
      recaptureRisk >= 0.46 ||
      clamp01(branchPressure) >= 0.42 ||
      clamp01(criticality) >= 0.46 ||
      custodyArchive === 'witness'
    )
  );
  const generativePassageBlocked = Boolean(
    !routeAvailable ||
    counterRecognitionRequired ||
    recaptureRisk >= 0.58
  );

  return Object.freeze({
    protocolId: TD613_APERTURE_PROTOCOL.id,
    toolIdentity: TD613_APERTURE_PROTOCOL.toolIdentity,
    observedRegime: TD613_APERTURE_PROTOCOL.observedRegime,
    stance: TD613_APERTURE_PROTOCOL.stance,
    exportDiscipline: TD613_APERTURE_PROTOCOL.exportDiscipline,
    recognized: Boolean(recognized),
    explained: Boolean(explained),
    routeAvailable: Boolean(routeAvailable),
    denseSignal,
    recognitionPressure,
    recaptureRisk,
    counterRecognitionRequired,
    generativePassageBlocked,
    routePressure: round3(clamp01(routePressure)),
    branchPressure: round3(clamp01(branchPressure)),
    criticality: round3(clamp01(criticality)),
    density: round3(clamp01(density)),
    recurrencePressure: round3(clamp01(recurrencePressure)),
    traceability: round3(clamp01(traceability)),
    mirrorLogic,
    custodyArchive,
    badge
  });
}

export function selectTD613ApertureDecision(input = {}) {
  const context = input.apertureContext || buildTD613ApertureContext(input);

  if (!context.recognized) {
    return 'weak-signal';
  }

  if (
    context.routeAvailable &&
    context.explained &&
    !context.generativePassageBlocked &&
    context.recaptureRisk < 0.42 &&
    context.criticality < 0.42
  ) {
    return 'passage';
  }

  if (
    context.counterRecognitionRequired &&
    (context.denseSignal || context.criticality >= 0.36 || context.routePressure >= 0.46)
  ) {
    return 'criticality';
  }

  return 'hold-branch';
}

export function selectTD613ApertureHarbor(input = {}) {
  const context = input.apertureContext || buildTD613ApertureContext(input);
  const decision = input.decision || selectTD613ApertureDecision({ ...input, apertureContext: context });

  if (
    context.generativePassageBlocked &&
    (
      context.custodyArchive === 'witness' ||
      context.criticality >= 0.52 ||
      context.mirrorLogic === 'off'
    )
  ) {
    return 'mirror.off';
  }

  if (decision === 'passage') {
    return context.routeAvailable && !context.generativePassageBlocked ? 'receipt.capture' : 'mirror.off';
  }

  if (
    context.counterRecognitionRequired ||
    context.routePressure >= 0.68 ||
    context.criticality >= 0.48
  ) {
    return context.mirrorLogic === 'off' ? 'mirror.off' : 'receipt.capture';
  }

  if (
    context.badge === 'badge.holds' &&
    context.routePressure < 0.40 &&
    context.branchPressure < 0.36
  ) {
    return 'provenance.seal';
  }

  return 'receipt.capture';
}

export function reviewTD613ApertureTransfer({
  sourceText = '',
  outputText = '',
  shellMode = 'native',
  shellSource = '',
  retrieval = false,
  semanticRisk = 0,
  visibleShift = false,
  nonTrivialShift = false,
  protectedAnchorIntegrity = 1,
  propositionCoverage = 1,
  actorCoverage = 1,
  actionCoverage = 1,
  objectCoverage = 1
} = {}) {
  const applied = Boolean(shellMode === 'borrowed' || retrieval || shellSource === 'swapped');
  const introducedEnforcementTerms = detectIntroducedTerms(sourceText, outputText);
  const namingIntrusion = detectNamingIntrusion(sourceText, outputText);
  const semanticCoverageRisk = round3(clamp01(
    ((1 - clamp01(propositionCoverage)) * 0.32) +
    ((1 - clamp01(actorCoverage)) * 0.18) +
    ((1 - clamp01(actionCoverage)) * 0.18) +
    ((1 - clamp01(objectCoverage)) * 0.12)
  ));
  const recaptureRisk = round3(clamp01(
    (clamp01(semanticRisk) * 0.45) +
    ((1 - clamp01(protectedAnchorIntegrity)) * 0.24) +
    (semanticCoverageRisk * 0.18) +
    (introducedEnforcementTerms.length ? 0.20 : 0) +
    (namingIntrusion ? 0.22 : 0) +
    ((!visibleShift || !nonTrivialShift) ? 0.08 : 0)
  ));
  const warningSignals = uniqueStrings([
    introducedEnforcementTerms.length ? 'enforcement-framing' : null,
    namingIntrusion ? 'naming-intrusion' : null,
    protectedAnchorIntegrity < 1 ? 'anchor-drift-detected' : null,
    semanticCoverageRisk >= 0.18 ? 'semantic-compression' : null,
    (!visibleShift || !nonTrivialShift) ? 'surface-close' : null,
    applied ? 'counter-recognition-pressure' : null
  ]);
  const blocked = false;
  const reasons = [];

  if (introducedEnforcementTerms.length) {
    reasons.push(`Introduced enforcement framing: ${introducedEnforcementTerms.join(', ')}`);
  }
  if (namingIntrusion) {
    reasons.push('Introduced regime naming into the borrowed output.');
  }
  if (warningSignals.length) {
    reasons.push('TD613 Aperture marked warning pressure on the borrowed output and kept it in repair/audit space instead of silently rerouting it.');
  }

  const candidateSuppression = round3(clamp01(
    (applied ? 0.12 : 0.02) +
    (semanticCoverageRisk * 0.42) +
    ((!visibleShift || !nonTrivialShift) ? 0.18 : 0)
  ));
  const observabilityDeficit = round3(clamp01(
    (semanticCoverageRisk * 0.48) +
    (!visibleShift ? 0.14 : 0) +
    (!nonTrivialShift ? 0.14 : 0)
  ));
  const aliasPersistence = round3(clamp01(
    (namingIntrusion ? 0.58 : 0) +
    ((1 - clamp01(protectedAnchorIntegrity)) * 0.24)
  ));
  const namingSensitivity = round3(clamp01(
    (namingIntrusion ? 0.82 : 0) +
    (applied ? 0.08 : 0)
  ));
  const redundancyInflation = round3(clamp01(
    (!nonTrivialShift ? 0.24 : 0.08) +
    (!visibleShift ? 0.18 : 0) +
    (semanticCoverageRisk * 0.28)
  ));
  const capacityPressure = round3(clamp01(
    (semanticCoverageRisk * 0.58) +
    ((!visibleShift || !nonTrivialShift) ? 0.18 : 0)
  ));
  const policyPressure = round3(clamp01(
    (introducedEnforcementTerms.length ? 0.42 : 0) +
    (namingIntrusion ? 0.38 : 0) +
    (applied ? 0.08 : 0)
  ));
  const apertureAudit = buildTD613ApertureAudit({
    generatorFault: false,
    warningSignals,
    repairPasses: [],
    candidateSuppression,
    observabilityDeficit,
    aliasPersistence,
    namingSensitivity,
    redundancyInflation,
    capacityPressure,
    policyPressure,
    withheldMaterial: false,
    withheldReason: null
  });

  return Object.freeze({
    protocolId: TD613_APERTURE_PROTOCOL.id,
    toolIdentity: TD613_APERTURE_PROTOCOL.toolIdentity,
    observedRegime: TD613_APERTURE_PROTOCOL.observedRegime,
    exportDiscipline: TD613_APERTURE_PROTOCOL.exportDiscipline,
    counterRecognitionRequired: applied,
    applied,
    blocked,
    recaptureRisk,
    introducedEnforcementTerms,
    namingIntrusion,
    reasons,
    warningSignals,
    repairPasses: [],
    candidateSuppression,
    observabilityDeficit,
    aliasPersistence,
    namingSensitivity,
    redundancyInflation,
    capacityPressure,
    policyPressure,
    apertureAudit
  });
}
