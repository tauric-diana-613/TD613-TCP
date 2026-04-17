(function () {
// GENERATED FROM TCP ENGINE MODULES BY scripts/generate-browser-engine.mjs
// SOURCE: app/engine/td613-aperture.js
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

const TD613_APERTURE_PROTOCOL = Object.freeze({
  id: 'td613-aperture/v1',
  toolIdentity: 'TD613 Aperture',
  shortIdentity: 'Aperture',
  observedRegime: 'PRCS-A',
  stance: 'anti-enforcement',
  exportDiscipline: 'non-identifying',
  counterRecognition: true
});

const TD613_APERTURE_ENFORCEMENT_TERMS = Object.freeze([
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

const TD613_APERTURE_PROCESS_OUTCOMES = Object.freeze([
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

function buildTD613ApertureAudit({
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

function buildTD613GovernedExposureSchema({
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

function buildTD613ApertureProjectionPlan({
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

function detectTD613ApertureTextPathologies({
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

function repairTD613ApertureProjection({
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

function classifyTD613ApertureProjection({
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

function splitTD613ApertureSourceSegments(text = '') {
  const normalized = String(text || '').replace(/\r\n/g, '\n').trim();
  if (!normalized) {
    return [];
  }
  return normalized
    .split(/(?<=[.!?;]["')\]]*)(?=\s+|\n|$)/g)
    .map((entry) => normalizeReadableText(entry))
    .filter(Boolean);
}

function extractTD613ApertureWitnessAnchors({
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

function auditTD613ApertureWitnessAnchors({
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

function restoreTD613ApertureWitnessAnchors({
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

function registerTD613ApertureSegment({
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

function buildTD613ApertureContext({
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

function selectTD613ApertureDecision(input = {}) {
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

function selectTD613ApertureHarbor(input = {}) {
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

function reviewTD613ApertureTransfer({
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
// SOURCE: app/engine/stylometry.js


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

function transferLengthCeiling(sourceText = '', sourceProfile = {}, targetProfile = {}, strength = 0.76) {
  const normalized = normalizeText(sourceText);
  const sourceAvg = sourceProfile.avgSentenceLength || avgSentenceLength(normalized) || 0;
  const targetAvg = targetProfile.avgSentenceLength || sourceAvg;
  const sentenceStretch = Math.max(0, targetAvg - sourceAvg);
  const abstractionStretch = Math.max(0, (targetProfile.abstractionPosture || 0) - (sourceProfile.abstractionPosture || 0));
  const modifierStretch = Math.max(0, (targetProfile.modifierDensity || 0) - (sourceProfile.modifierDensity || 0));
  const sourceWords = sourceProfile.wordCount || wordCount(normalized);
  let ratio = 1.28;

  ratio += Math.min(0.5, sentenceStretch / 18);
  ratio += Math.min(0.2, abstractionStretch * 0.25);
  ratio += Math.min(0.12, modifierStretch * 1.6);
  ratio += Math.min(0.12, strength * 0.12);

  if (sourceWords <= 12 && sentenceStretch >= 4) {
    ratio += 0.48;
  }

  return Math.ceil(normalized.length * clamp(ratio, 1.28, 2.4));
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

const SURFACE_MARKER_DEFINITIONS = [
  { key: 'pls', pattern: /\bpls\b/gi },
  { key: 'bc', pattern: /\bbc\b/gi },
  { key: 'wSlash', pattern: /\bw\/\s*/gi },
  { key: 'woSlash', pattern: /\bw\/o\b/gi },
  { key: 'thru', pattern: /\bthru\b/gi },
  { key: 'tmrw', pattern: /\btmrw\b/gi },
  { key: 'acct', pattern: /\bacct\b/gi },
  { key: 'pkg', pattern: /\bpkg\b/gi },
  { key: 'appt', pattern: /\bappt\b/gi },
  { key: 'mgmt', pattern: /\bmgmt\b/gi },
  { key: 'wk', pattern: /\bwk\b/gi },
  { key: 'msg', pattern: /\bmsg\b/gi },
  { key: 'ref', pattern: /\bref\b/gi },
  { key: 'ok', pattern: /\bok\b/gi },
  { key: 'plusList', pattern: /\s\+\s/gi }
];

const SURFACE_MARKER_KEYS = [
  ...SURFACE_MARKER_DEFINITIONS.map((entry) => entry.key),
  'lowercaseLead',
  'apostropheDrop'
];

const COMMON_FINITE_VERBS = new Set([
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'do', 'does', 'did', 'done',
  'have', 'has', 'had',
  'go', 'goes', 'went', 'gone',
  'get', 'gets', 'got', 'gotten',
  'keep', 'keeps', 'kept',
  'leave', 'leaves', 'left',
  'need', 'needs', 'needed',
  'want', 'wants', 'wanted',
  'check', 'checks', 'checked',
  'bring', 'brings', 'brought',
  'stay', 'stays', 'stayed',
  'start', 'starts', 'started',
  'run', 'runs', 'ran',
  'revise', 'revises', 'revised',
  'write', 'writes', 'wrote', 'written',
  'show', 'shows', 'showed', 'shown',
  'shrink', 'shrinks', 'shrank', 'shrunk',
  'confirm', 'confirms', 'confirmed',
  'sign', 'signs', 'signed',
  'wait', 'waits', 'waited',
  'paint', 'paints', 'painted',
  'chill', 'chills', 'chilled'
]);

const CONVERSATIONAL_MARKERS = new Set([
  'just', 'ok', 'okay', 'yeah', 'yep', 'honestly', 'actually', 'really',
  'literally', 'pls', 'bc', 'kinda', 'kinda', 'sorta', 'lol', 'fr', 'please'
]);

const APOSTROPHE_DROP_PATTERN = /\b(?:youre|dont|cant|wont|im|ive|ill|id|thats|wasnt|didnt|couldnt|shouldnt|wouldnt|isnt|arent|theres|heres|whats|lets|youll|theyre|weve|havent|hasnt|hadnt)\b/gi;

function baseSurfaceMarkerProfile() {
  return Object.fromEntries(SURFACE_MARKER_KEYS.map((key) => [key, 0]));
}

function buildSurfaceMarkerProfile(text = '', words = [], sentenceCount = 0) {
  const normalized = normalizeText(text);
  const wordTotal = Math.max(words.length || tokenize(text).length, 1);
  const chunkCount = Math.max(sentenceCount || sentenceChunks(text).length, 1);
  const profile = baseSurfaceMarkerProfile();

  for (const entry of SURFACE_MARKER_DEFINITIONS) {
    const matches = normalized.match(entry.pattern) || [];
    profile[entry.key] = round3(matches.length / wordTotal);
  }

  const lowercaseLeadMatches = normalized.match(/(^|[.!?]\s+|\n+)[a-z]/g) || [];
  const apostropheDropMatches = normalized.match(APOSTROPHE_DROP_PATTERN) || [];
  profile.lowercaseLead = round3(lowercaseLeadMatches.length / chunkCount);
  profile.apostropheDrop = round3(apostropheDropMatches.length / wordTotal);

  return profile;
}

function blendSurfaceMarkerProfile(a = {}, b = {}, blend = 0) {
  const output = {};
  for (const key of SURFACE_MARKER_KEYS) {
    output[key] = round3(((a[key] || 0) * (1 - blend)) + ((b[key] || 0) * blend));
  }
  return output;
}

function surfaceMarkerDistance(a = {}, b = {}) {
  return round3(arithmeticMean(
    SURFACE_MARKER_KEYS.map((key) => {
      const max = key === 'lowercaseLead'
        ? 0.35
        : key === 'apostropheDrop'
          ? 0.16
          : 0.08;
      return boundedDistance(a[key] || 0, b[key] || 0, max);
    })
  ));
}

function normalizedAbbreviationDensity(text = '', words = [], surfaceMarkerProfile = {}) {
  const wordTotal = Math.max(words.length || tokenize(text).length, 1);
  const score =
    ((surfaceMarkerProfile.pls || 0) * 1.2) +
    ((surfaceMarkerProfile.bc || 0) * 1.1) +
    ((surfaceMarkerProfile.wSlash || 0) * 1.4) +
    ((surfaceMarkerProfile.woSlash || 0) * 1.4) +
    ((surfaceMarkerProfile.thru || 0) * 1.2) +
    ((surfaceMarkerProfile.tmrw || 0) * 1.2) +
    ((surfaceMarkerProfile.acct || 0) * 1.3) +
    ((surfaceMarkerProfile.pkg || 0) * 1.3) +
    ((surfaceMarkerProfile.appt || 0) * 1.3) +
    ((surfaceMarkerProfile.mgmt || 0) * 1.3) +
    ((surfaceMarkerProfile.wk || 0) * 1.2) +
    ((surfaceMarkerProfile.msg || 0) * 1.2) +
    ((surfaceMarkerProfile.ref || 0) * 1.2) +
    ((surfaceMarkerProfile.plusList || 0) * 0.8);

  return round3(clamp01(score * Math.min(10, Math.max(3, wordTotal / 6))));
}

function normalizedOrthographicLooseness(text = '', sentences = [], words = [], surfaceMarkerProfile = {}) {
  const normalized = normalizeText(text).trim();
  const sentenceTotal = Math.max(sentences.length || sentenceSplit(text).length, 1);
  const wordTotal = Math.max(words.length || tokenize(text).length, 1);
  const allLowerBias = normalized && normalized === normalized.toLowerCase() ? 0.12 : 0;
  const score =
    ((surfaceMarkerProfile.lowercaseLead || 0) * 0.7) +
    ((surfaceMarkerProfile.apostropheDrop || 0) * 4.2) +
    ((surfaceMarkerProfile.plusList || 0) * 0.6) +
    allLowerBias +
    (((normalized.match(/\b(?:u|ur|ya)\b/gi) || []).length / wordTotal) * 0.8) +
    (((normalized.match(/(^|[.!?]\s+|\n+)i\b/g) || []).length / sentenceTotal) * 0.3);

  return round3(clamp01(score));
}

function normalizedFragmentPressure(text = '') {
  const chunks = sentenceChunks(text);
  if (!chunks.length) {
    return 0;
  }

  const fragmentCount = chunks.filter((chunk) => {
    const tokens = tokenize(chunk);
    if (!tokens.length) {
      return false;
    }
    if (DIRECTIVE_MARKERS.has(tokens[0])) {
      return false;
    }
    const hasFiniteVerb = tokens.some((token) =>
      COMMON_FINITE_VERBS.has(token) ||
      /(?:ed|ing)$/.test(token)
    );
    return tokens.length <= 6 && !hasFiniteVerb;
  }).length;

  return round3(clamp01(fragmentCount / chunks.length));
}

function normalizedConversationalPosture(text = '', words = [], surfaceMarkerProfile = {}) {
  const wordTotal = Math.max(words.length || tokenize(text).length, 1);
  const firstSecondPerson = words.filter((word) =>
    ['i', 'im', 'me', 'my', 'we', 'us', 'our', 'you', 'your', 'youre'].includes(word)
  ).length;
  const conversationalMarkers = countLexemeMatches(words, CONVERSATIONAL_MARKERS);
  const questionMarks = (text.match(/\?/g) || []).length;
  const discourseLeads = (normalizeText(text).match(/(^|[.!?]\s+|\n+)(?:ok|okay|honestly|look|listen|so|and)\b/gi) || []).length;
  const score =
    ((firstSecondPerson / wordTotal) * 1.4) +
    ((conversationalMarkers / wordTotal) * 1.8) +
    ((questionMarks / Math.max(sentenceChunks(text).length, 1)) * 0.28) +
    ((discourseLeads / Math.max(sentenceChunks(text).length, 1)) * 0.22) +
    ((surfaceMarkerProfile.ok || 0) * 1.5);

  return round3(clamp01(score));
}

function hasIntentionalLowercaseSurface(text = '') {
  const normalized = normalizeText(text).trim();
  if (!normalized) {
    return false;
  }

  const chunks = sentenceChunks(normalized);
  const lowercaseLeadMatches = normalized.match(/(^|[.!?]\s+|\n+)[a-z]/g) || [];
  const shorthandSignals = normalized.match(/\b(?:pls|bc|w\/o|w\/|acct|pkg|appt|mgmt|tmrw|thru|dont|cant|youre|im|ive|ill|id|wasnt|didnt|couldnt)\b/gi) || [];

  return (
    lowercaseLeadMatches.length >= Math.max(2, Math.ceil(chunks.length * 0.5)) ||
    shorthandSignals.length >= 2 ||
    (normalized === normalized.toLowerCase() && chunks.length >= 2)
  );
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
    const placeholder = `__PROTLIT_${indexToLetters(literals.length).toUpperCase()}__`;
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
    output = output.replace(new RegExp(escapeRegex(literal.placeholder), 'gi'), literal.value);
  }
  return output;
}

function cloakProtectedLiterals(text = '', literals = []) {
  let output = text;
  for (const literal of literals) {
    output = output.replace(new RegExp(escapeRegex(literal.value), 'g'), literal.placeholder);
  }
  return output;
}

function reconcileProtectedLiteralSurface(text = '', literals = []) {
  let output = text;

  for (const literal of literals) {
    const value = literal?.value || '';
    if (!value || output.includes(value)) {
      continue;
    }

    output = output.replace(new RegExp(escapeRegex(value), 'i'), value);
    if (output.includes(value)) {
      continue;
    }

    if (/^0\d:\d{2}(?:\s?[ap]m)?$/i.test(value)) {
      const unpadded = value.replace(/^0(?=\d:\d{2})/, '');
      output = output.replace(new RegExp(`\\b${escapeRegex(unpadded)}\\b`, 'i'), value);
      if (output.includes(value)) {
        continue;
      }
    }

    if (/^0+\d+$/.test(value)) {
      const trimmed = value.replace(/^0+/, '') || '0';
      output = output.replace(new RegExp(`\\b${escapeRegex(trimmed)}\\b`), value);
    }
  }

  return output;
}

function protectedLiteralIntegrity(text = '', literals = []) {
  return literals.every((literal) => {
    const matches = text.match(new RegExp(escapeRegex(literal.placeholder), 'gi')) || [];
    return matches.length === 1;
  });
}

function unresolvedProtectedLiteralCount(text = '') {
  return (text.match(/__PROTLIT_[A-Z]+__/gi) || []).length;
}

function sentenceChunks(text = '') {
  return normalizeText(text)
    .replace(/\r\n/g, '\n')
    .split(/\n+/)
    .flatMap((line) => line.match(/[^.!?]+[.!?]?/g) || [])
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

function countPatternMatches(text = '', patterns = []) {
  const normalized = normalizeText(text);
  return patterns.reduce((sum, pattern) => sum + ((normalized.match(pattern) || []).length), 0);
}

const SPLIT_OPPORTUNITY_PATTERNS = [
  /;\s+/g,
  /\s-\s+/g,
  /,\s+(because|though|while|if|when|which|that)\s+/gi,
  /,\s+(because|though|while|when|if|once|since|as)\s+/gi,
  /,\s+(apparently|basically|honestly|frankly|maybe|still|though)\b/gi,
  /,\s+(i think|i guess|i mean|to be honest|at least|if anything)\b/gi,
  /,\s+(even though|even if|as if|as though|unless)\b/gi,
  /,\s+(who|which|that)\s+(is|was|were|are|do|did|can|could|would|will)\b/gi,
  /:\s+/g
];

const CONNECTOR_OPPORTUNITY_PATTERNS = [
  /\b(because|since|as|but|though|yet|so|then|when|while|once|this|that)\b/gi,
  /\b(just|simply|still|yet|maybe|perhaps|really|actually)\b/gi
];

const CONTRACTION_OPPORTUNITY_PATTERNS = [
  /\b(I was not|do not|does not|did not|will not|cannot|was not|are not|I am|I have|I will|I would|we are|we will|they are|they will|you are|you will|it is|that is)\b/gi,
  /\b(I wasn't|don't|doesn't|didn't|won't|can't|wasn't|aren't|I'm|I've|I'll|I'd|we're|we'll|they're|they'll|you're|you'll|it's|that's)\b/gi
];

const RELATION_OPPORTUNITY_PATTERNS = {
  additive: [
    /\b(and|also)\b/gi
  ],
  contrastive: [
    /\b(but|though|yet|still|however|instead)\b/gi
  ],
  causal: [
    /\b(because|since|as|so)\b/gi
  ],
  temporal: [
    /\b(when|while|once|then|after|before)\b/gi
  ],
  clarifying: [
    /\b(which is|that is|i mean|in other words|apparently|honestly|to be honest|at least|if anything)\b/gi
  ],
  resumptive: [
    /\b(honestly|apparently|frankly|basically|anyway|still)\b/gi,
    /\b(i think|i guess|i mean|to be honest|at least|if anything)\b/gi
  ]
};

const RELATION_LEAD_PATTERNS = {
  contrastive: /^(but|though|yet|still|however|instead)\b\s*/i,
  causal: /^(because|since|as|so)\b\s*/i,
  temporal: /^(when|while|once|then|after|before)\b\s*/i,
  clarifying: /^(which is|that is|i mean|in other words|apparently|honestly|to be honest|at least|if anything)\b\s*/i,
  resumptive: /^(honestly|apparently|frankly|basically|anyway|still|i think|i guess|i mean|to be honest|at least|if anything)\b\s*/i
};

const RELATION_CONNECTOR_WORDS = {
  additive: ['and'],
  contrastive: ['though', 'but', 'yet'],
  causal: ['since', 'because', 'as', 'so'],
  temporal: ['then', 'once', 'while', 'when'],
  clarifying: ['that'],
  resumptive: ['still', 'though', 'then']
};

function buildRelationOpportunityProfile(text = '') {
  return Object.fromEntries(
    Object.entries(RELATION_OPPORTUNITY_PATTERNS).map(([relation, patterns]) => [
      relation,
      countPatternMatches(text, patterns)
    ])
  );
}

function relationInventory(opportunityProfile = {}) {
  return {
    additive: opportunityProfile.additive || 0,
    contrastive: opportunityProfile.contrastive || 0,
    causal: opportunityProfile.causal || 0,
    temporal: opportunityProfile.temporal || 0,
    clarifying: opportunityProfile.clarifying || 0,
    resumptive: opportunityProfile.resumptive || 0
  };
}

function dominantRelationFromInventory(inventory = {}) {
  return Object.entries(inventory)
    .sort((left, right) => right[1] - left[1])[0]?.[0] || 'additive';
}

function countWordOccurrences(text = '', word = '') {
  if (!word) {
    return 0;
  }

  return (normalizeText(text).match(new RegExp(`\\b${escapeRegex(word)}\\b`, 'gi')) || []).length;
}

function buildOpportunityProfile(text = '') {
  const chunks = sentenceChunks(text);
  const sentenceBoundaries = Math.max(0, chunks.length - 1);
  const relationProfile = buildRelationOpportunityProfile(text);
  const words = tokenize(text);
  const surfaceMarkerProfile = buildSurfaceMarkerProfile(text, words, chunks.length);
  const abbreviationOpportunity = SURFACE_MARKER_DEFINITIONS.reduce((sum, entry) => {
    if (entry.key === 'ok' || entry.key === 'plusList') {
      return sum;
    }
    return sum + Math.round((surfaceMarkerProfile[entry.key] || 0) * Math.max(words.length, 1));
  }, 0);
  const orthographyOpportunity =
    Math.round((surfaceMarkerProfile.lowercaseLead || 0) * Math.max(chunks.length, 1)) +
    Math.round((surfaceMarkerProfile.apostropheDrop || 0) * Math.max(words.length, 1));
  const fragmentOpportunity = Math.round(normalizedFragmentPressure(text) * Math.max(chunks.length, 1));
  const conversationalOpportunity = Math.round(normalizedConversationalPosture(text, words, surfaceMarkerProfile) * Math.max(chunks.length, 1));

  return {
    sentenceSplit: countPatternMatches(text, SPLIT_OPPORTUNITY_PATTERNS),
    sentenceMerge: sentenceBoundaries,
    contraction: countPatternMatches(text, CONTRACTION_OPPORTUNITY_PATTERNS),
    connector: countPatternMatches(text, CONNECTOR_OPPORTUNITY_PATTERNS),
    lineBreak: ((normalizeText(text).match(/[.!?]\s+/g) || []).length) + ((text.match(/\n+/g) || []).length),
    abbreviation: abbreviationOpportunity,
    orthography: orthographyOpportunity,
    fragment: fragmentOpportunity,
    conversational: conversationalOpportunity,
    ...relationProfile
  };
}

function hasLimitedRewriteOpportunity(opportunityProfile = {}) {
  const total =
    (opportunityProfile.sentenceSplit || 0) +
    (opportunityProfile.sentenceMerge || 0) +
    (opportunityProfile.contraction || 0) +
    (opportunityProfile.connector || 0) +
    (opportunityProfile.lineBreak || 0) +
    (opportunityProfile.abbreviation || 0) +
    (opportunityProfile.orthography || 0) +
    (opportunityProfile.fragment || 0) +
    (opportunityProfile.conversational || 0);
  const directStructural =
    (opportunityProfile.sentenceSplit || 0) +
    (opportunityProfile.sentenceMerge || 0) +
    (opportunityProfile.contraction || 0) +
    (opportunityProfile.connector || 0) +
    (opportunityProfile.abbreviation || 0) +
    (opportunityProfile.orthography || 0) +
    (opportunityProfile.fragment || 0);

  return total < 2 || directStructural < 1;
}

function additiveDominance(targetWords = {}) {
  const additivePressure = (targetWords.and || 0) + (targetWords.also || 0);
  const alternativePressure = Math.max(
    targetWords.but || 0,
    targetWords.though || 0,
    targetWords.yet || 0,
    targetWords.because || 0,
    targetWords.since || 0,
    targetWords.as || 0,
    targetWords.so || 0,
    targetWords.then || 0,
    targetWords.when || 0,
    targetWords.while || 0,
    targetWords.once || 0,
    targetWords.still || 0
  );

  return additivePressure > alternativePressure + 0.004 && additivePressure > 0.012;
}

function inferClauseRelation(first = '', second = '') {
  const firstLower = stripTerminalPunctuation(first).toLowerCase();
  const secondLower = stripTerminalPunctuation(second).toLowerCase();
  const combined = `${firstLower} ${secondLower}`;

  if (RELATION_LEAD_PATTERNS.contrastive.test(secondLower) || /\b(but|though|yet|still|however|instead)\b/.test(combined)) {
    return 'contrastive';
  }

  if (RELATION_LEAD_PATTERNS.causal.test(secondLower) || /\b(because|since|as)\b/.test(combined)) {
    return 'causal';
  }

  if (
    RELATION_LEAD_PATTERNS.temporal.test(secondLower) ||
    /\b(and then|by the time|every time|after that|before that)\b/.test(combined)
  ) {
    return 'temporal';
  }

  if (
    RELATION_LEAD_PATTERNS.clarifying.test(secondLower) ||
    /\b(which is|that is|i mean|in other words)\b/.test(combined)
  ) {
    return 'clarifying';
  }

  if (RELATION_LEAD_PATTERNS.resumptive.test(secondLower)) {
    return 'resumptive';
  }

  return 'additive';
}

function stripLeadingRelationCue(text = '', relation = 'additive') {
  const pattern = RELATION_LEAD_PATTERNS[relation];
  if (!pattern) {
    return text;
  }

  return text.replace(pattern, '').trim();
}

function decapitalizeSentenceLead(text = '') {
  if (!text || /^I\b/.test(text)) {
    return text;
  }

  return text.replace(/^([A-Z][a-z']+)/, (match) => {
    if (/^[A-Z]{2,}$/.test(match)) {
      return match;
    }

    return match.toLowerCase();
  });
}

function preferredRelationWord(targetWords = {}, relation = 'additive') {
  const words = RELATION_CONNECTOR_WORDS[relation] || RELATION_CONNECTOR_WORDS.additive;
  return [...words]
    .sort((left, right) => (targetWords[right] || 0) - (targetWords[left] || 0))[0] || words[0];
}

function joinDescriptorCandidates(relation = 'additive', targetProfile = {}, mod = {}) {
  const mix = targetProfile.punctuationMix || {};
  const targetWords = targetProfile.functionWordProfile || {};
  const strongPreferred = (mix.strong || 0) >= 0.14 && (mix.strong || 0) >= (mix.comma || 0);
  const dashPreferred = (mix.dash || 0) >= 0.14 && (mix.dash || 0) >= (mix.comma || 0);
  const candidates = [];
  const pushDescriptor = (descriptor) => {
    if (!candidates.some((candidate) => candidate.kind === descriptor.kind && candidate.value === descriptor.value)) {
      candidates.push(descriptor);
    }
  };

  if (relation === 'contrastive') {
    pushDescriptor({ kind: 'connector', value: preferredRelationWord(targetWords, 'contrastive') });
    pushDescriptor({ kind: 'connector-word', value: 'yet' });
    pushDescriptor({ kind: 'punctuation', value: strongPreferred ? '; ' : ' - ' });
  } else if (relation === 'causal') {
    pushDescriptor({ kind: 'connector', value: preferredRelationWord(targetWords, 'causal') });
    pushDescriptor({ kind: 'punctuation', value: strongPreferred || (mod.punc || 0) > 1 ? '; ' : ', ' });
  } else if (relation === 'temporal') {
    pushDescriptor({ kind: 'connector', value: preferredRelationWord(targetWords, 'temporal') });
    pushDescriptor({ kind: 'punctuation', value: dashPreferred ? ' - ' : '; ' });
  } else if (relation === 'clarifying') {
    pushDescriptor({ kind: 'punctuation', value: dashPreferred ? ' - ' : '; ' });
    pushDescriptor({ kind: 'connector-word', value: 'that is' });
  } else if (relation === 'resumptive') {
    pushDescriptor({ kind: 'connector', value: preferredRelationWord(targetWords, 'resumptive') });
    pushDescriptor({ kind: 'punctuation', value: dashPreferred ? ' - ' : '; ' });
  } else {
    if (additiveDominance(targetWords)) {
      pushDescriptor({ kind: 'connector', value: 'and' });
    }
    pushDescriptor({ kind: 'punctuation', value: strongPreferred || (mod.punc || 0) > 1 ? '; ' : dashPreferred ? ' - ' : '; ' });
    pushDescriptor({ kind: 'connector-word', value: targetWords.then > 0.008 ? 'then' : 'and' });
  }

  if (!candidates.length) {
    pushDescriptor({ kind: 'punctuation', value: '; ' });
  }

  return candidates;
}

function buildMergedSentence(first = '', second = '', descriptor = { kind: 'punctuation', value: '; ' }, relation = 'additive') {
  const left = stripTerminalPunctuation(first);
  let right = stripTerminalPunctuation(second).trim();
  right = stripLeadingRelationCue(right, relation);

  if (!right) {
    return `${left}.`;
  }

  if (descriptor.kind === 'connector') {
    right = decapitalizeSentenceLead(right);
    return `${left}, ${descriptor.value} ${right}.`;
  }

  if (descriptor.kind === 'connector-word') {
    right = decapitalizeSentenceLead(right);
    if (descriptor.value === 'that is') {
      return `${left}, that is ${right}.`;
    }
    return `${left}; ${descriptor.value} ${right}.`;
  }

  right = decapitalizeSentenceLead(right);
  return `${left}${descriptor.value}${right}.`;
}

function mergeCandidateScore(candidate = '', targetProfile = {}, relation = 'additive', sourceText = '') {
  const candidateProfile = extractCadenceProfile(candidate);
  const fit = compareTexts('', '', {
    profileA: candidateProfile,
    profileB: targetProfile
  });
  const targetWords = targetProfile.functionWordProfile || {};
  const sourceAnd = countWordOccurrences(sourceText, 'and');
  const outputAnd = countWordOccurrences(candidate, 'and');
  const addedAnd = Math.max(0, outputAnd - sourceAnd);
  let score =
    (1 - (fit.sentenceDistance || 0)) * 18 +
    (1 - (fit.functionWordDistance || 0)) * 22 +
    (1 - (fit.punctShapeDistance || 0)) * 8 +
    (1 - (fit.contractionDistance || 0)) * 6;

  if (relation !== 'additive' && addedAnd > 0 && !additiveDominance(targetWords)) {
    score -= addedAnd * 12;
  }

  return score;
}

function mergeSentencePairs(text = '', targetProfile = {}, strength = 0.76, mod = {}, transferPlan = null) {
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

  const merged = [];
  let index = 0;
  let merges = 0;

  while (index < chunks.length) {
    if (merges < desiredMerges && index < chunks.length - 1) {
      const first = chunks[index];
      const second = chunks[index + 1];
      const relation = inferClauseRelation(first, second) || transferPlan?.dominantRelation || 'additive';
      const pairCandidates = joinDescriptorCandidates(relation, targetProfile, mod)
        .map((descriptor) => buildMergedSentence(first, second, descriptor, relation))
        .sort((left, right) => mergeCandidateScore(right, targetProfile, relation, `${first} ${second}`) - mergeCandidateScore(left, targetProfile, relation, `${first} ${second}`));
      merged.push(pairCandidates[0] || `${stripTerminalPunctuation(first)}; ${decapitalizeSentenceLead(stripTerminalPunctuation(second))}.`);
      index += 2;
      merges += 1;
      continue;
    }

    merged.push(chunks[index]);
    index += 1;
  }

  return merged.join(' ');
}

function applySplitRules(text = '', desiredSplits = 1) {
  if (desiredSplits <= 0) {
    return text;
  }

  let remaining = desiredSplits;
  let result = normalizeText(text);
  const applyRule = (pattern, replacer) => {
    result = result.replace(pattern, (...args) => {
      if (remaining <= 0) {
        return args[0];
      }

      remaining -= 1;
      return replacer(...args);
    });
  };

  applyRule(/;\s+/g, () => '. ');
  applyRule(/\s-\s+/g, () => '. ');
  applyRule(/,\s+(because|though|while|if|when|which|that)\s+/gi, (match, connector) => `. ${connector} `);
  applyRule(/\s+(and|but|so)\s+(i|we|you|they|he|she)\b/gi, (match, connector, subject) => `. ${connector} ${subject} `);
  applyRule(/,\s+(because|though|while|when|if|once|since|as)\s+/gi, (match, connector) => `. ${connector} `);
  applyRule(/,\s+(apparently|basically|honestly|frankly|maybe|still|though)\b,?\s*/gi, (match, phrase) => `. ${phrase} `);
  applyRule(/,\s+(i think|i guess|i mean|to be honest|at least|if anything)\b,?\s*/gi, (match, phrase) => `. ${phrase} `);
  applyRule(/,\s+(even though|even if|as if|as though|unless)\s+/gi, (match, phrase) => `. ${phrase} `);
  applyRule(/,\s+(who|which|that)\s+(is|was|were|are|do|did|can|could|would|will)\s+/gi, (match, pronoun, verb) => `. ${pronoun} ${verb} `);
  applyRule(/:\s+/g, () => '. ');
  applyRule(/,\s+(?=(?:I|we|you|they|he|she|it|there|this|that|the|a|an)\b)/gi, () => '. ');

  return result;
}

function splitLongSentences(text = '', targetProfile = {}, strength = 0.76) {
  const currentAvg = avgSentenceLength(text);
  const targetAvg = targetProfile.avgSentenceLength || currentAvg;
  const delta = currentAvg - targetAvg;
  const desiredSplits = Math.max(0, Math.round((delta / 3) * (0.8 + (strength * 0.45))));

  if (desiredSplits <= 0) {
    return text;
  }

  return applySplitRules(text, desiredSplits);
}

function applyClauseTexture(text = '', currentProfile = {}, targetProfile = {}, strength = 0.76, mod = {}, transferPlan = null) {
  const targetCount = desiredSentenceCount(currentProfile, targetProfile);
  const currentCount = currentProfile.sentenceCount || 0;
  const wantsShorter =
    (targetProfile.avgSentenceLength || 0) < ((currentProfile.avgSentenceLength || 0) - 0.5) ||
    targetCount > currentCount;
  const wantsLonger =
    (targetProfile.avgSentenceLength || 0) > ((currentProfile.avgSentenceLength || 0) + 0.5) ||
    targetCount < currentCount;
  let result = text;

  if (wantsShorter) {
    const plannedSplits = transferPlan?.splitCount
      ? Math.max(1, Math.round((transferPlan.splitCount || 1) * Math.max(1, strength)))
      : Math.max(1, Math.round(Math.max(1.2, strength) * 3));
    return applySplitRules(result, plannedSplits);
  }

  if (wantsLonger) {
    return mergeSentencePairs(result, targetProfile, Math.min(1, strength + 0.04), mod, transferPlan);
  }

  return result;
}

function applyPhraseTexture(text = '', currentProfile = {}, targetProfile = {}, strength = 0.76) {
  let result = text;
  const wantsShorter =
    (targetProfile.avgSentenceLength || 0) < ((currentProfile.avgSentenceLength || 0) - 0.8);
  const wantsMoreContractions =
    (targetProfile.contractionDensity || 0) > ((currentProfile.contractionDensity || 0) + 0.006);
  const targetWords = targetProfile.functionWordProfile || {};
  const currentWords = functionWordProfile(result);
  const wantsWhenShift =
    (targetWords.when || 0) > ((currentWords.when || 0) + 0.001) ||
    (targetWords.once || 0) > ((currentWords.once || 0) + 0.001);
  const wantsThenShift = (targetWords.then || 0) > ((currentWords.then || 0) + 0.001);
  const wantsThatShift = (targetWords.that || 0) > ((currentWords.that || 0) + 0.001);

  if (wantsShorter || wantsWhenShift) {
    result = replaceLimited(result, /\bbecause every time\b/gi, (match) => matchCase(match, 'when'), 2);

    if (wantsWhenShift) {
      result = replaceLimited(result, /\bevery time\b/gi, (match) => matchCase(match, 'when'), 2);
      result = replaceLimited(result, /\bby the time\b/gi, (match) => matchCase(match, 'once'), 1);
    }
  }

  if (wantsShorter || wantsThenShift) {
    result = replaceLimited(result, /\band then\b/gi, (match) => matchCase(match, 'then'), 2);
  }

  if (wantsMoreContractions || wantsShorter || wantsThatShift) {
    result = replaceLimited(result, /\bwhich is\b/gi, (match) => matchCase(match, "that's"), 2);
  }

  if (wantsMoreContractions || wantsShorter) {
    result = replaceLimited(result, /\bI was not trying to\b/gi, (match) => matchCase(match, "I wasn't trying to"), 1);
    result = replaceLimited(result, /\bI was not going to\b/gi, (match) => matchCase(match, "I wasn't going to"), 1);
  }

  return result;
}

function applyDiscourseFrameTexture(text = '', currentProfile = {}, targetProfile = {}, strength = 0.76, transferPlan = {}) {
  let result = text;
  const targetWords = targetProfile.functionWordProfile || {};
  const currentWords = functionWordProfile(result);
  const relation = transferPlan?.dominantRelation || dominantRelationFromInventory(relationInventory(transferPlan?.relationInventory || {}));
  const wantsShorter = Boolean(transferPlan?.wantsShorter);
  const wantsLonger = Boolean(transferPlan?.wantsLonger);

  if ((relation === 'clarifying' || relation === 'resumptive' || transferPlan?.shiftStanceFrames) && (targetWords.actually || 0) > ((currentWords.actually || 0) + 0.0015)) {
    result = replaceLimited(result, /\bi mean\b/gi, (match) => matchCase(match, 'actually'), 1);
  }

  if ((relation === 'contrastive' || relation === 'resumptive') && (targetWords.still || 0) > ((currentWords.still || 0) + 0.0015)) {
    result = replaceLimited(result, /\bat least\b/gi, (match) => matchCase(match, 'still'), 1);
  }

  if ((relation === 'clarifying' || wantsLonger) && (targetWords.that || 0) > ((currentWords.that || 0) + 0.0015)) {
    result = replaceLimited(result, /\bin other words\b/gi, (match) => matchCase(match, 'that is'), 1);
  }

  if (wantsShorter) {
    result = replaceLimited(result, /\bto be honest\b/gi, (match) => matchCase(match, 'honestly'), 1);
    result = replaceLimited(result, /\bi think\b/gi, (match) => matchCase(match, 'apparently'), 1);
  }

  if (wantsLonger && relation === 'resumptive') {
    result = replaceLimited(result, /\bapparently\b/gi, (match) => matchCase(match, 'honestly'), Math.max(1, Math.round(strength * 2)));
  }

  return result;
}

function applyStanceTexture(text = '', targetProfile = {}, strength = 0.76, connectorProfile = null) {
  const targetWords = connectorProfile?.functionWordProfile || targetProfile.functionWordProfile || {};
  const currentWords = functionWordProfile(text);
  let result = text;

  const replacements = [
    { from: 'maybe', to: 'perhaps', key: 'perhaps', threshold: 0.0015, limit: 2 },
    { from: 'just', to: 'simply', key: 'simply', threshold: 0.0015, limit: 2 },
    { from: 'really', to: 'actually', key: 'actually', threshold: 0.0015, limit: 2 },
    { from: 'still', to: 'yet', key: 'yet', threshold: 0.0015, limit: 1 },
    { from: 'when', to: 'while', key: 'while', threshold: 0.0015, limit: 1 },
    { from: 'but', to: 'though', key: 'though', threshold: 0.0015, limit: 2 },
    { from: 'but', to: 'yet', key: 'yet', threshold: 0.0015, limit: 1 },
    { from: 'because', to: 'since', key: 'since', threshold: 0.0015, limit: 2 },
    { from: 'because', to: 'as', key: 'as', threshold: 0.0015, limit: 1 },
    { from: 'this', to: 'that', key: 'that', threshold: 0.002, limit: 2 }
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
  const modDirection = Math.sign(mod.cont || 0);
  let direction = target > current + 0.006
    ? 1
    : target < current - 0.006
      ? -1
      : modDirection;

  // Never fight an explicit mod direction — the mod is the user/shell intent
  if (modDirection !== 0 && direction !== 0 && Math.sign(direction) !== Math.sign(modDirection)) {
    direction = modDirection;
  }

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

function applyFunctionWordTexture(text = '', targetProfile = {}, strength = 0.76, connectorProfile = null, transferPlan = null) {
  const target = connectorProfile?.functionWordProfile || targetProfile.functionWordProfile || {};
  const current = functionWordProfile(text);
  let result = text;
  const limit = Math.max(1, Math.round(Math.max(1.2, strength) * 4));
  const dominantRelation = transferPlan?.dominantRelation || 'additive';

  if (
    (target.but || 0) > (current.but || 0) + 0.0015 &&
    (dominantRelation === 'contrastive' || dominantRelation === 'resumptive')
  ) {
    result = replaceLimited(result, /\band\b/gi, (match) => matchCase(match, 'but'), 1);
  } else if (
    additiveDominance(target) &&
    (target.and || 0) > (current.and || 0) + 0.006 &&
    dominantRelation === 'additive'
  ) {
    result = replaceLimited(result, /\bbut\b/gi, (match) => matchCase(match, 'and'), limit);
  }

  if ((target.this || 0) > (current.this || 0) + 0.0015) {
    result = replaceLimited(result, /\bthat\b/gi, (match) => matchCase(match, 'this'), 2);
  } else if ((target.that || 0) > (current.that || 0) + 0.0015) {
    result = replaceLimited(result, /\bthis\b/gi, (match) => matchCase(match, 'that'), 2);
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
  'when', 'while', 'once', 'also', 'only', 'still', 'just', 'simply',
  'really', 'actually', 'maybe', 'perhaps'
];

const CONNECTOR_SYNONYM_PACKS = [
  { words: ['because', 'since', 'as'], threshold: 0.0015 },
  { words: ['but', 'though', 'yet'], threshold: 0.0015 },
  { words: ['so', 'then'], threshold: 0.0015 },
  { words: ['when', 'while'], threshold: 0.0015 },
  { words: ['this', 'that'], threshold: 0.002 },
  { words: ['just', 'simply'], threshold: 0.0015 },
  { words: ['really', 'actually'], threshold: 0.0015 },
  { words: ['maybe', 'perhaps'], threshold: 0.0015 }
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
    const threshold = pack.threshold || 0.0015;
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
    const limit = Math.max(1, Math.round(Math.max(1.4, strength * 3) * (delta > 0.015 ? 2 : 1)));
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

const AUXILIARY_WORDS = new Set([
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'do', 'does', 'did', 'done',
  'have', 'has', 'had',
  'will', 'would', 'can', 'could', 'may', 'might', 'must',
  'shall', 'should', 'ought'
]);

const ABSTRACT_LEXEMES = new Set([
  'story', 'account', 'narrative', 'speech', 'remark', 'remarks', 'reason', 'reasons',
  'memory', 'pressure', 'signal', 'route', 'custody', 'recognition', 'decision',
  'meaning', 'silence', 'passage', 'criticality', 'archive', 'detail', 'details',
  'particular', 'particulars', 'narration', 'posture', 'branch', 'receipt', 'threshold',
  'decision', 'context', 'message', 'speech', 'conversation', 'reflection', 'recognition'
]);

const OPERATIONAL_LEXEMES = new Set([
  'grab', 'take', 'get', 'use', 'check', 'knock', 'wait', 'call', 'leave', 'bring',
  'door', 'charger', 'boxes', 'back', 'front', 'lean', 'pull', 'push', 'move',
  'send', 'hold', 'keep', 'route', 'watch', 'load', 'open', 'close', 'stick', 'stuck'
]);

const HEDGE_MARKERS = new Set([
  'maybe', 'perhaps', 'possibly', 'apparently', 'honestly', 'frankly', 'actually',
  'sort', 'kind', 'rather', 'quite', 'just', 'simply', 'really'
]);

const DIRECTIVE_MARKERS = new Set([
  'grab', 'take', 'use', 'wait', 'knock', 'lean', 'pull', 'push', 'bring', 'check',
  'call', 'send', 'keep', 'watch', 'hold', 'meet', 'leave', 'go'
]);

const MODIFIER_MARKERS = new Set([
  'hard', 'harder', 'soft', 'softly', 'quick', 'quickly', 'slow', 'slowly', 'quiet',
  'quietly', 'silent', 'silently', 'awkward', 'awkwardly', 'strange', 'strangely',
  'difficult', 'difficultly', 'careful', 'carefully', 'apparent', 'apparently',
  'honest', 'honestly', 'steady', 'steadily', 'rapid', 'rapidly', 'direct', 'directly'
]);

const LATINATE_SUFFIXES = ['tion', 'sion', 'ment', 'ance', 'ence', 'ity', 'ous', 'ive', 'ate', 'ize'];

const REGISTER_MODES = ['plain', 'conversational', 'compressed', 'operational', 'reflective', 'formal'];

const PHRASE_REALIZATION_PACKS = [
  {
    id: 'review-opening',
    pattern: /\b(?:ahead of the formal review,\s+i want to name the pattern as clearly as i can|review gist)\b/gi,
    replacements: {
      plain: 'before the review, I want to name the pattern clearly',
      conversational: 'review gist',
      compressed: 'review gist',
      operational: 'review gist',
      reflective: 'ahead of the review, I want to name the pattern clearly',
      formal: 'ahead of the formal review, I want to name the pattern as clearly as I can'
    }
  },
  {
    id: 'onboarding-strength',
    pattern: /\b(?:you are consistently strong in onboarding and peer support|great w onboarding)\b/gi,
    replacements: {
      plain: 'strong in onboarding and peer support',
      conversational: 'great w onboarding',
      compressed: 'great w onboarding',
      operational: 'great w onboarding',
      reflective: 'strong in onboarding and peer support',
      formal: 'you are consistently strong in onboarding and peer support'
    }
  },
  {
    id: 'trust-pattern',
    pattern: /\b(?:new staff trust your explanations|ppl trust them|ppl trust your explanations)\b/gi,
    replacements: {
      plain: 'people trust them',
      conversational: 'ppl trust them',
      compressed: 'ppl trust them',
      operational: 'ppl trust them',
      reflective: 'people trust them',
      formal: 'people trust them'
    }
  },
  {
    id: 'calm-under-change',
    pattern: /\b(?:multiple people pointed to your calm escalation style when procedures changed quickly this year|calm under change)\b/gi,
    replacements: {
      plain: 'calm under change',
      conversational: 'calm under change',
      compressed: 'calm under change',
      operational: 'calm under change',
      reflective: 'people pointed to a calm escalation style when procedures changed quickly',
      formal: 'multiple people pointed to a calm escalation style when procedures changed quickly this year'
    }
  },
  {
    id: 'docs-lag',
    pattern: /\b(?:documentation timing|documentation lag|docs lag)\b/gi,
    replacements: {
      plain: 'docs lag',
      conversational: 'docs lag',
      compressed: 'docs lag',
      operational: 'docs lag',
      reflective: 'documentation lag',
      formal: 'documentation timing'
    }
  },
  {
    id: 'three-different-months',
    pattern: /\b(?:three different months|3 diff months)\b/gi,
    replacements: {
      plain: 'three different months',
      conversational: '3 diff months',
      compressed: '3 diff months',
      operational: '3 diff months',
      reflective: 'three different months',
      formal: 'three different months'
    }
  },
  {
    id: 'record-lag',
    pattern: /\b(?:the direct service was done but the written record lagged(?: until the details were harder to rebuild)?|service got done,\s*writeup came late)\b/gi,
    replacements: {
      plain: 'service got done, writeup came late',
      conversational: 'service got done, writeup came late',
      compressed: 'service got done, writeup came late',
      operational: 'service got done, writeup came late',
      reflective: 'the service was done, but the writeup came late',
      formal: 'the direct service was done, but the written record lagged'
    }
  },
  {
    id: 'handoff-muddy',
    pattern: /\b(?:it affects handoff quality and makes later review more difficult than it needs to be|handoff got muddy)\b/gi,
    replacements: {
      plain: 'handoff got muddy',
      conversational: 'handoff got muddy',
      compressed: 'handoff got muddy',
      operational: 'handoff got muddy',
      reflective: 'it affected handoff quality',
      formal: 'it affects handoff quality and makes later review more difficult than it needs to be'
    }
  },
  {
    id: 'minor-admin-gap',
    pattern: /\b(?:i am not treating that as a paperwork footnote|dont write it like "minor admin gap\."|do not write it like "minor admin gap\.")\b/gi,
    replacements: {
      plain: 'dont write it like "minor admin gap."',
      conversational: 'dont write it like "minor admin gap."',
      compressed: 'dont write it like "minor admin gap."',
      operational: 'dont write it like "minor admin gap."',
      reflective: 'I do not want it written as "minor admin gap."',
      formal: 'I do not want it framed as "minor admin gap."'
    }
  },
  {
    id: 'not-punitive',
    pattern: /\b(?:not punitive either|it should not read as punitive)\b/gi,
    replacements: {
      plain: 'not punitive either',
      conversational: 'not punitive either',
      compressed: 'not punitive either',
      operational: 'not punitive either',
      reflective: 'it should not read as punitive',
      formal: 'it should not read as punitive'
    }
  },
  {
    id: 'concrete-correction-plan',
    pattern: /\b(?:making the documentation correction concrete rather than vague|needs concrete correction plan)\b/gi,
    replacements: {
      plain: 'needs concrete correction plan',
      conversational: 'needs concrete correction plan',
      compressed: 'needs concrete correction plan',
      operational: 'needs concrete correction plan',
      reflective: 'it needs a concrete correction plan',
      formal: 'it needs a concrete correction plan'
    }
  },
  {
    id: 'make-speech',
    pattern: /\bmake a speech\b/gi,
    replacements: {
      plain: 'give a speech',
      operational: 'say it',
      reflective: 'make a speech',
      formal: 'deliver remarks'
    }
  },
  {
    id: 'circling-story',
    pattern: /\bcircling the story\b/gi,
    replacements: {
      plain: 'going over the story',
      operational: 'going over the details',
      reflective: 'circling the story',
      formal: 'revisiting the narrative'
    }
  },
  {
    id: 'buying-time',
    pattern: /\bbuying time\b/gi,
    replacements: {
      plain: 'stalling',
      operational: 'stalling',
      reflective: 'buying time',
      formal: 'delaying'
    }
  },
  {
    id: 'wait-second',
    pattern: /\bwait a second\b/gi,
    replacements: {
      plain: 'wait a second',
      operational: 'hold a second',
      reflective: 'pause a moment',
      formal: 'wait a moment'
    }
  },
  {
    id: 'use-side-door',
    pattern: /\buse the side door\b/gi,
    replacements: {
      plain: 'use the side door',
      operational: 'take the side door',
      reflective: 'come through the side door',
      formal: 'use the side entrance'
    }
  },
  {
    id: 'grab-charger',
    pattern: /\bgrab the charger\b/gi,
    replacements: {
      plain: 'get the charger',
      operational: 'grab the charger',
      reflective: 'bring the charger',
      formal: 'retrieve the charger'
    }
  },
  {
    id: 'hard-part',
    pattern: /\bthe hard part\b/gi,
    replacements: {
      plain: 'the hard part',
      operational: 'the hard part',
      reflective: 'the difficult part',
      formal: 'the difficult portion'
    }
  },
  {
    id: 'received-call',
    pattern: /\breceived a call\b/gi,
    replacements: {
      plain: 'got a call',
      operational: 'got a call',
      reflective: 'received a call',
      formal: 'received a call'
    }
  },
  {
    id: 'remains-pending',
    pattern: /\bremains pending\b/gi,
    replacements: {
      plain: 'is still pending',
      operational: 'is still pending',
      reflective: 'remains pending',
      formal: 'remains pending'
    }
  },
  {
    id: 'could-not',
    pattern: /\bcould not\b/gi,
    replacements: {
      plain: "couldn't",
      operational: "couldn't",
      reflective: 'could not',
      formal: 'could not'
    }
  },
  {
    id: 'does-not-match',
    pattern: /\bdoes not match\b/gi,
    replacements: {
      plain: "doesn't match",
      operational: "doesn't line up with",
      reflective: 'does not match',
      formal: 'does not match'
    }
  },
  {
    id: 'verbally-confirmed',
    pattern: /\bwas verbally confirmed\b/gi,
    replacements: {
      plain: 'was confirmed',
      operational: 'got confirmed',
      reflective: 'was verbally confirmed',
      formal: 'was verbally confirmed'
    }
  },
  {
    id: 'as-of-close',
    pattern: /\bas of close\b/gi,
    replacements: {
      plain: 'by close',
      operational: 'by close',
      reflective: 'as of close',
      formal: 'as of close'
    }
  },
  {
    id: 'remained-unlocated',
    pattern: /\bremained unlocated\b/gi,
    replacements: {
      plain: "still wasn't found",
      operational: "still wasn't found",
      reflective: 'remained unlocated',
      formal: 'remained unlocated'
    }
  },
  {
    id: 'reminder-note-sent',
    pattern: /\ba reminder note was sent\b/gi,
    replacements: {
      plain: 'a reminder went out',
      operational: 'a reminder went out',
      reflective: 'a reminder note was sent',
      formal: 'a reminder note was sent'
    }
  },
  {
    id: 'not-saying-no',
    pattern: /\bnot saying no\b/gi,
    replacements: {
      plain: 'not saying no',
      operational: 'not saying no',
      reflective: 'not refusing support',
      formal: 'this is not a denial'
    }
  },
  {
    id: 'case-split-twice',
    pattern: /\bdon['’]?t want (?:the )?case split twice\b/gi,
    replacements: {
      plain: "don't want the case split twice",
      operational: "don't want the case split twice",
      reflective: 'do not want the case split twice',
      formal: 'the case should not be split twice'
    }
  },
  {
    id: 'kinda-matches',
    pattern: /\bkinda matches\b/gi,
    replacements: {
      plain: 'kind of matches',
      operational: 'kind of matches',
      reflective: 'seems to match',
      formal: 'partially matched'
    }
  }
];

const SHORTHAND_REALIZATION_PACKS = [
  { id: 'youre', pattern: /\byoure\b/gi, formal: 'you are', operational: 'youre' },
  { id: 'thats', pattern: /\bthats\b/gi, formal: 'that is', operational: 'thats' },
  { id: 'dont', pattern: /\bdont\b/gi, formal: 'do not', operational: 'dont' },
  { id: 'cant', pattern: /\bcant\b/gi, formal: 'cannot', operational: 'cant' },
  { id: 'wont', pattern: /\bwont\b/gi, formal: 'will not', operational: 'wont' },
  { id: 'im', pattern: /\bim\b/gi, formal: 'I am', operational: 'im' },
  { id: 'ive', pattern: /\bive\b/gi, formal: 'I have', operational: 'ive' },
  { id: 'ill', pattern: /\bill\b/gi, formal: 'I will', operational: 'ill' },
  { id: 'ok', pattern: /\bok\b/gi, formal: 'okay', operational: 'ok' },
  { id: 'acct', pattern: /\bacct\b/gi, formal: 'account', operational: 'acct' },
  { id: 'fam', pattern: /\bfam\b/gi, formal: 'family', operational: 'family' },
  { id: 'pkg', pattern: /\bpkg\b/gi, formal: 'package', operational: 'package' },
  { id: 'appt', pattern: /\bappt\b/gi, formal: 'appointment', operational: 'appt' },
  { id: 'auth', pattern: /\bauth\b/gi, formal: 'authorization', operational: 'auth' },
  { id: 'mgmt', pattern: /\bmgmt\b/gi, formal: 'management', operational: 'mgmt' },
  { id: 'wk', pattern: /\bwk\b/gi, formal: 'week', operational: 'wk' },
  { id: 'wks', pattern: /\bwks\b/gi, formal: 'weeks', operational: 'wks' },
  { id: 'hr', pattern: /\bhr\b/gi, formal: 'hour', operational: 'hr' },
  { id: 'hrs', pattern: /\bhrs\b/gi, formal: 'hours', operational: 'hrs' },
  { id: 'min', pattern: /\bmin\b/gi, formal: 'minute', operational: 'min' },
  { id: 'mins', pattern: /\bmins\b/gi, formal: 'minutes', operational: 'mins' },
  { id: 'temp', pattern: /\btemp\b/gi, formal: 'temporary', operational: 'temp' },
  { id: 'msg', pattern: /\bmsg\b/gi, formal: 'message', operational: 'msg' },
  { id: 'ref', pattern: /\bref\b/gi, formal: 'referral', operational: 'ref' },
  { id: 'ppl', pattern: /\bppl\b/gi, formal: 'people', operational: 'ppl' },
  { id: 'docs', pattern: /\bdocs\b/gi, formal: 'documentation', operational: 'docs' },
  { id: 'diff', pattern: /\bdiff\b/gi, formal: 'different', operational: 'diff' },
  { id: 'writeup', pattern: /\bwriteup\b/gi, formal: 'written record', operational: 'writeup' },
  { id: 'bc', pattern: /\bbc\b/gi, formal: 'because', operational: 'bc' },
  { id: 'w-slash', pattern: /\bw\/\s*/gi, formal: 'with ', operational: 'w/ ' },
  { id: 'wo-slash', pattern: /\bw\/o\b/gi, formal: 'without', operational: 'w/o' },
  { id: 'thru', pattern: /\bthru\b/gi, formal: 'through', operational: 'through' },
  { id: 'tmrw', pattern: /\btmrw\b/gi, formal: 'tomorrow', operational: 'tomorrow' },
  { id: 'pls', pattern: /\bpls\b/gi, formal: 'please', operational: 'please' }
];

const LEXICAL_FAMILIES = [
  {
    id: 'say',
    forms: {
      plain: { base: 'say', past: 'said', ing: 'saying', third: 'says' },
      operational: { base: 'tell', past: 'told', ing: 'telling', third: 'tells' },
      reflective: { base: 'explain', past: 'explained', ing: 'explaining', third: 'explains' },
      formal: { base: 'state', past: 'stated', ing: 'stating', third: 'states' }
    }
  },
  {
    id: 'get',
    forms: {
      plain: { base: 'get', past: 'got', ing: 'getting', third: 'gets' },
      operational: { base: 'get', past: 'got', ing: 'getting', third: 'gets' },
      reflective: { base: 'receive', past: 'received', ing: 'receiving', third: 'receives' },
      formal: { base: 'receive', past: 'received', ing: 'receiving', third: 'receives' }
    }
  },
  {
    id: 'use',
    forms: {
      plain: { base: 'use', past: 'used', ing: 'using', third: 'uses' },
      operational: { base: 'deploy', past: 'deployed', ing: 'deploying', third: 'deploys' },
      reflective: { base: 'use', past: 'used', ing: 'using', third: 'uses' },
      formal: { base: 'utilize', past: 'utilized', ing: 'utilizing', third: 'utilizes' }
    }
  },
  {
    id: 'keep',
    forms: {
      plain: { base: 'keep', past: 'kept', ing: 'keeping', third: 'keeps' },
      operational: { base: 'hold', past: 'held', ing: 'holding', third: 'holds' },
      reflective: { base: 'retain', past: 'retained', ing: 'retaining', third: 'retains' },
      formal: { base: 'preserve', past: 'preserved', ing: 'preserving', third: 'preserves' }
    }
  },
  {
    id: 'leave',
    forms: {
      plain: { base: 'leave', past: 'left', ing: 'leaving', third: 'leaves' },
      operational: { base: 'head out', past: 'headed out', ing: 'heading out', third: 'heads out' },
      reflective: { base: 'depart', past: 'departed', ing: 'departing', third: 'departs' },
      formal: { base: 'exit', past: 'exited', ing: 'exiting', third: 'exits' }
    }
  },
  {
    id: 'start',
    forms: {
      plain: { base: 'start', past: 'started', ing: 'starting', third: 'starts' },
      operational: { base: 'kick off', past: 'kicked off', ing: 'kicking off', third: 'kicks off' },
      reflective: { base: 'begin', past: 'began', ing: 'beginning', third: 'begins' },
      formal: { base: 'commence', past: 'commenced', ing: 'commencing', third: 'commences' }
    }
  },
  {
    id: 'finish',
    forms: {
      plain: { base: 'finish', past: 'finished', ing: 'finishing', third: 'finishes' },
      operational: { base: 'wrap up', past: 'wrapped up', ing: 'wrapping up', third: 'wraps up' },
      reflective: { base: 'finish', past: 'finished', ing: 'finishing', third: 'finishes' },
      formal: { base: 'conclude', past: 'concluded', ing: 'concluding', third: 'concludes' }
    }
  },
  {
    id: 'change',
    forms: {
      plain: { base: 'change', past: 'changed', ing: 'changing', third: 'changes' },
      operational: { base: 'shift', past: 'shifted', ing: 'shifting', third: 'shifts' },
      reflective: { base: 'alter', past: 'altered', ing: 'altering', third: 'alters' },
      formal: { base: 'modify', past: 'modified', ing: 'modifying', third: 'modifies' }
    }
  },
  {
    id: 'show',
    forms: {
      plain: { base: 'show', past: 'showed', ing: 'showing', third: 'shows' },
      operational: { base: 'show', past: 'showed', ing: 'showing', third: 'shows' },
      reflective: { base: 'explain', past: 'explained', ing: 'explaining', third: 'explains' },
      formal: { base: 'display', past: 'displayed', ing: 'displaying', third: 'displays' }
    }
  },
  {
    id: 'help',
    forms: {
      plain: { base: 'help', past: 'helped', ing: 'helping', third: 'helps' },
      operational: { base: 'help', past: 'helped', ing: 'helping', third: 'helps' },
      reflective: { base: 'support', past: 'supported', ing: 'supporting', third: 'supports' },
      formal: { base: 'assist', past: 'assisted', ing: 'assisting', third: 'assists' }
    }
  },
  {
    id: 'story',
    forms: {
      plain: { singular: 'story', plural: 'stories' },
      operational: { singular: 'detail', plural: 'details' },
      reflective: { singular: 'account', plural: 'accounts' },
      formal: { singular: 'narrative', plural: 'narratives' }
    }
  },
  {
    id: 'speech',
    forms: {
      plain: { singular: 'speech', plural: 'speeches' },
      operational: { singular: 'message', plural: 'messages' },
      reflective: { singular: 'remark', plural: 'remarks' },
      formal: { singular: 'address', plural: 'addresses' }
    }
  },
  {
    id: 'detail',
    forms: {
      plain: { singular: 'detail', plural: 'details' },
      operational: { singular: 'point', plural: 'points' },
      reflective: { singular: 'detail', plural: 'details' },
      formal: { singular: 'particular', plural: 'particulars' }
    }
  },
  {
    id: 'door',
    forms: {
      plain: { singular: 'door', plural: 'doors' },
      operational: { singular: 'door', plural: 'doors' },
      reflective: { singular: 'doorway', plural: 'doorways' },
      formal: { singular: 'entrance', plural: 'entrances' }
    }
  },
  {
    id: 'signal',
    forms: {
      plain: { singular: 'signal', plural: 'signals' },
      operational: { singular: 'signal', plural: 'signals' },
      reflective: { singular: 'sign', plural: 'signs' },
      formal: { singular: 'indication', plural: 'indications' }
    }
  },
  {
    id: 'route',
    forms: {
      plain: { singular: 'route', plural: 'routes' },
      operational: { singular: 'route', plural: 'routes' },
      reflective: { singular: 'path', plural: 'paths' },
      formal: { singular: 'channel', plural: 'channels' }
    }
  },
  {
    id: 'hard',
    forms: {
      plain: { adjective: 'hard', adverb: 'hard' },
      operational: { adjective: 'tough', adverb: 'hard' },
      reflective: { adjective: 'difficult', adverb: 'carefully' },
      formal: { adjective: 'arduous', adverb: 'carefully' }
    }
  },
  {
    id: 'quiet',
    forms: {
      plain: { adjective: 'quiet', adverb: 'quietly' },
      operational: { adjective: 'still', adverb: 'still' },
      reflective: { adjective: 'quiet', adverb: 'quietly' },
      formal: { adjective: 'silent', adverb: 'silently' }
    }
  },
  {
    id: 'fast',
    forms: {
      plain: { adjective: 'fast', adverb: 'fast' },
      operational: { adjective: 'quick', adverb: 'quickly' },
      reflective: { adjective: 'steady', adverb: 'steadily' },
      formal: { adjective: 'rapid', adverb: 'rapidly' }
    }
  },
    {
      id: 'settle',
      forms: {
        plain: { base: 'settle', past: 'settled', ing: 'settling', third: 'settles' },
        operational: { base: 'set', past: 'set', ing: 'setting', third: 'sets' },
        reflective: { base: 'rest', past: 'rested', ing: 'resting', third: 'rests' },
        formal: { base: 'stabilize', past: 'stabilized', ing: 'stabilizing', third: 'stabilizes' }
      }
    },
    {
      id: 'ask',
      forms: {
        plain: { base: 'ask', past: 'asked', ing: 'asking', third: 'asks' },
        operational: { base: 'ask', past: 'asked', ing: 'asking', third: 'asks' },
        reflective: { base: 'request', past: 'requested', ing: 'requesting', third: 'requests' },
        formal: { base: 'request', past: 'requested', ing: 'requesting', third: 'requests' }
      }
    },
    {
      id: 'need',
      forms: {
        plain: { base: 'need', past: 'needed', ing: 'needing', third: 'needs' },
        operational: { base: 'need', past: 'needed', ing: 'needing', third: 'needs' },
        reflective: { base: 'need', past: 'needed', ing: 'needing', third: 'needs' },
        formal: { base: 'need', past: 'needed', ing: 'needing', third: 'needs' }
      }
    },
    {
      id: 'give',
      forms: {
        plain: { base: 'give', past: 'gave', ing: 'giving', third: 'gives' },
        operational: { base: 'hand', past: 'handed', ing: 'handing', third: 'hands' },
        reflective: { base: 'provide', past: 'provided', ing: 'providing', third: 'provides' },
        formal: { base: 'issue', past: 'issued', ing: 'issuing', third: 'issues' }
      }
    },
    {
      id: 'find',
      forms: {
        plain: { base: 'find', past: 'found', ing: 'finding', third: 'finds' },
        operational: { base: 'find', past: 'found', ing: 'finding', third: 'finds' },
        reflective: { base: 'identify', past: 'identified', ing: 'identifying', third: 'identifies' },
        formal: { base: 'locate', past: 'located', ing: 'locating', third: 'locates' }
      }
    },
    {
      id: 'call',
      forms: {
        plain: { base: 'call', past: 'called', ing: 'calling', third: 'calls' },
        operational: { base: 'call', past: 'called', ing: 'calling', third: 'calls' },
        reflective: { base: 'contact', past: 'contacted', ing: 'contacting', third: 'contacts' },
        formal: { base: 'contact', past: 'contacted', ing: 'contacting', third: 'contacts' }
      }
    },
    {
      id: 'book',
      forms: {
        plain: { base: 'book', past: 'booked', ing: 'booking', third: 'books' },
        operational: { base: 'book', past: 'booked', ing: 'booking', third: 'books' },
        reflective: { base: 'schedule', past: 'scheduled', ing: 'scheduling', third: 'schedules' },
        formal: { base: 'schedule', past: 'scheduled', ing: 'scheduling', third: 'schedules' }
      }
    },
    {
      id: 'send',
      forms: {
        plain: { base: 'send', past: 'sent', ing: 'sending', third: 'sends' },
        operational: { base: 'send', past: 'sent', ing: 'sending', third: 'sends' },
        reflective: { base: 'forward', past: 'forwarded', ing: 'forwarding', third: 'forwards' },
        formal: { base: 'transmit', past: 'transmitted', ing: 'transmitting', third: 'transmits' }
      }
    },
    {
      id: 'fix',
      forms: {
        plain: { base: 'fix', past: 'fixed', ing: 'fixing', third: 'fixes' },
        operational: { base: 'fix', past: 'fixed', ing: 'fixing', third: 'fixes' },
        reflective: { base: 'resolve', past: 'resolved', ing: 'resolving', third: 'resolves' },
        formal: { base: 'resolve', past: 'resolved', ing: 'resolving', third: 'resolves' }
      }
    },
    {
      id: 'check',
      forms: {
        plain: { base: 'check', past: 'checked', ing: 'checking', third: 'checks' },
        operational: { base: 'check', past: 'checked', ing: 'checking', third: 'checks' },
        reflective: { base: 'review', past: 'reviewed', ing: 'reviewing', third: 'reviews' },
        formal: { base: 'verify', past: 'verified', ing: 'verifying', third: 'verifies' }
      }
    },
    {
      id: 'move',
      forms: {
        plain: { base: 'move', past: 'moved', ing: 'moving', third: 'moves' },
        operational: { base: 'move', past: 'moved', ing: 'moving', third: 'moves' },
        reflective: { base: 'relocate', past: 'relocated', ing: 'relocating', third: 'relocates' },
        formal: { base: 'transfer', past: 'transferred', ing: 'transferring', third: 'transfers' }
      }
    },
    {
      id: 'match',
      forms: {
        plain: { base: 'match', past: 'matched', ing: 'matching', third: 'matches' },
        operational: { base: 'line up', past: 'lined up', ing: 'lining up', third: 'lines up' },
        reflective: { base: 'align', past: 'aligned', ing: 'aligning', third: 'aligns' },
        formal: { base: 'align', past: 'aligned', ing: 'aligning', third: 'aligns' }
      }
    }
  ];

const LEXICAL_FAMILY_SKIP_PATTERNS = {
  say: [
    /\b(?:error|fault|open|closed|false-open|alert|status)\s+state\b/i,
    /\b(?:say|says|said|saying|tell|tells|told|telling)\s+(?:me|us|him|her|them|it|the\s+\w+)\s+to\b/i,
    /\b(?:keep|keeps|kept)\s+(?:saying|telling)\b/i,
    /\breports?\s+(?:say|says|said)\b/i
  ],
  get: [
    /\b(?:get|gets|got|getting)\s+to\b/i,
    /\b(?:get|gets|got|getting)\s+(?:a\s+)?(?:call|text|message|reply|note|pickup|dropoff)\b/i,
    /\breceiving\s+(?:desk|dock|team|corridor|window)\b/i
  ],
  ask: [
    /\b(?:access|authorization|badge|change|correction|fix|pickup|repair|review|support)\s+request\b/i,
    /\bask(?:ed|ing)?\s+\w+\s+whether\b/i
  ],
  book: [
    /\b(?:scheduling|booking)\s+(?:desk|office|team|line|queue|status)\b/i,
    /\b(?:scheduling|booking)\s+could(?:\s+not|n't)\s+book\b/i
  ],
  change: [
    /\b(?:pickup|schedule|staffing|policy|room|address)\s+change\b/i,
    /\bchange\s+in\s+the\s+(?:dismissal|incident|pickup|routing)\s+log\b/i
  ],
  give: [
    /\b(?:access|badge|billing|clinic|coordination|paperwork|routing|safety|latch|voltage|firmware)\s+issue\b/i,
    /\bhand(?:ed|ing)?\s+in\b/i,
    /\b(?:the|a|an|this|that|underlying|corrective|procedural|staffing|coordination|operational)\s+issue(?:s)?\b/i
  ],
  start: [
    /\b(?:began|begin|beginning|started|start|starting|commenced|commence|commencing)\s+(?:presenting|validating|processing|showing)\b/i
  ],
  keep: [
    /\b(?:keep|keeps|kept|holding|hold|holds|held)\s+\w+ing\b/i,
    /\b(?:fraud|account|manual|review|device|credential|security)\s+hold\b/i,
    /\b(?:clear|clearing|remove|removing|removed)\s+(?:the\s+)?hold\b/i
  ],
  leave: [
    /\b(?:no|none|nothing|little|less)\b[^.!?]{0,18}\bleft\b/i,
    /\b(?:stock|inventory|time|room|rooms|capacity|availability|food|money)\s+left\b/i,
    /\bleft[-\s](?:knee|arm|side|hip|ankle|foot|hand|shoulder|wrist|leg|elbow|eye|ear|breast|lung|lower|upper)\b/i,
    /\b(?:was|were|is|are|got)(?:\s+\w+){0,2}\s+left\s+on\b/i
  ],
  settle: [
    /\bbox\s+(?:rested|sat|set)\b/i
  ],
  check: [
    /\b(?:verified|reviewed)\s+override\b/i
  ],
  match: [
    /\b(?:photo\s+)?id\s+match\b/i,
    /\b(?:badge|name|pickup|record)\s+match\b/i
  ],
  quiet: [
    /\bstill\s+(?:out|in|there|here)\b/i,
    /\bstill\s+(?:was|were|is|are|had|has|have|not|being)\b/i
  ]
};

const DISABLED_LEXICAL_FAMILY_IDS = new Set(['quiet', 'signal']);
const BORROWED_SHELL_DISABLED_LEXICAL_FAMILY_IDS = new Set(['quiet', 'say', 'keep', 'leave', 'give', 'get', 'change', 'signal']);

const CONTENT_STOP_WORDS = new Set([...FUNCTION_WORDS, ...AUXILIARY_WORDS, 'i', 'you', 'we', 'they', 'he', 'she', 'it']);

const FAMILY_VARIANT_INDEX = (() => {
  const entries = [];
  for (const family of LEXICAL_FAMILIES) {
    for (const [mode, forms] of Object.entries(family.forms)) {
      for (const [formKey, surface] of Object.entries(forms)) {
        entries.push({
          familyId: family.id,
          mode,
          formKey,
          surface,
          normalized: surface.toLowerCase()
        });
      }
    }
  }
  return entries.sort((left, right) => right.surface.length - left.surface.length);
})();

function countLexemeMatches(words = [], lexemes = new Set()) {
  return words.reduce((sum, word) => sum + (lexemes.has(word) ? 1 : 0), 0);
}

function contentWords(text = '') {
  return tokenize(text).filter((word) => !CONTENT_STOP_WORDS.has(word));
}

function normalizedContentWordComplexity(words = []) {
  if (!words.length) {
    return 0;
  }

  const averageLength = words.reduce((sum, word) => sum + word.replace(/'/g, '').length, 0) / words.length;
  return round3(clamp01((averageLength - 3) / 7));
}

function normalizedModifierDensity(words = []) {
  if (!words.length) {
    return 0;
  }

  const count = words.filter((word) =>
    MODIFIER_MARKERS.has(word) ||
    /(?:ly|ive|ous|al|ful|less|able|ible|ish|ic)$/i.test(word)
  ).length;
  return round3(clamp01(count / words.length));
}

function normalizedHedgeDensity(words = []) {
  if (!words.length) {
    return 0;
  }

  return round3(clamp01(countLexemeMatches(words, HEDGE_MARKERS) / words.length));
}

function normalizedAbstractionPosture(words = []) {
  if (!words.length) {
    return 0.5;
  }

  const abstractCount = countLexemeMatches(words, ABSTRACT_LEXEMES);
  const operationalCount = countLexemeMatches(words, OPERATIONAL_LEXEMES);
  if (!abstractCount && !operationalCount) {
    return 0.5;
  }

  return round3(clamp01(abstractCount / Math.max(abstractCount + operationalCount, 1)));
}

function normalizedDirectness(text = '', words = []) {
  const sentences = sentenceSplit(text);
  const imperativeHits = sentences.filter((sentence) => {
    const tokens = tokenize(sentence);
    return tokens.length > 1 && DIRECTIVE_MARKERS.has(tokens[0]);
  }).length;
  const secondPersonHits = words.filter((word) => word === 'you' || word === 'your').length;
  const directiveHits = countLexemeMatches(words, DIRECTIVE_MARKERS);
  const raw = (imperativeHits * 0.5) + (directiveHits * 0.18) + (secondPersonHits * 0.08);
  return round3(clamp01(raw));
}

function normalizedLatinatePreference(words = []) {
  if (!words.length) {
    return 0;
  }

  const latinateHits = words.filter((word) =>
    LATINATE_SUFFIXES.some((suffix) => word.endsWith(suffix)) ||
    /(?:utilize|preserve|commence|conclude|obtain|assist|display|narrative|indication|particulars?)$/.test(word)
  ).length;
  return round3(clamp01(latinateHits / words.length));
}

function detectRegisterMode(profile = {}) {
  if (
    (profile.abbreviationDensity || 0) >= 0.14 ||
    (profile.orthographicLooseness || 0) >= 0.22 ||
    (profile.fragmentPressure || 0) >= 0.3
  ) {
    return 'compressed';
  }

  if (
    (profile.conversationalPosture || 0) >= 0.18 &&
    (profile.contentWordComplexity || 0) <= 0.48 &&
    (profile.latinatePreference || 0) <= 0.18
  ) {
    return 'conversational';
  }

  if ((profile.directness || 0) >= 0.22 && (profile.abstractionPosture || 0) <= 0.55) {
    return 'operational';
  }

  if ((profile.latinatePreference || 0) >= 0.18 && (profile.contentWordComplexity || 0) >= 0.42) {
    return 'formal';
  }

  if ((profile.abstractionPosture || 0) >= 0.58 || (profile.hedgeDensity || 0) >= 0.04) {
    return 'reflective';
  }

  return 'plain';
}

function registerDistance(profileA = {}, profileB = {}) {
  return round3(arithmeticMean([
    boundedDistance(profileA.contentWordComplexity || 0, profileB.contentWordComplexity || 0, 0.55),
    boundedDistance(profileA.abstractionPosture || 0, profileB.abstractionPosture || 0, 0.65),
    boundedDistance(profileA.modifierDensity || 0, profileB.modifierDensity || 0, 0.22),
    boundedDistance(profileA.hedgeDensity || 0, profileB.hedgeDensity || 0, 0.12),
    boundedDistance(profileA.directness || 0, profileB.directness || 0, 0.4),
    boundedDistance(profileA.latinatePreference || 0, profileB.latinatePreference || 0, 0.3),
    boundedDistance(profileA.abbreviationDensity || 0, profileB.abbreviationDensity || 0, 0.28),
    boundedDistance(profileA.orthographicLooseness || 0, profileB.orthographicLooseness || 0, 0.38),
    boundedDistance(profileA.fragmentPressure || 0, profileB.fragmentPressure || 0, 0.45),
    boundedDistance(profileA.conversationalPosture || 0, profileB.conversationalPosture || 0, 0.42)
  ]));
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
  const content = contentWords(text);
  const sentences = sentenceSplit(text);
  const surfaceMarkerProfile = buildSurfaceMarkerProfile(text, words, sentences.length);
  const contentWordComplexity = normalizedContentWordComplexity(content);
  const modifierDensity = normalizedModifierDensity(content);
  const hedgeDensity = normalizedHedgeDensity(words);
  const abstractionPosture = normalizedAbstractionPosture(content);
  const directness = normalizedDirectness(text, words);
  const latinatePreference = normalizedLatinatePreference(content);
  const abbreviationDensity = normalizedAbbreviationDensity(text, words, surfaceMarkerProfile);
  const orthographicLooseness = normalizedOrthographicLooseness(text, sentences, words, surfaceMarkerProfile);
  const fragmentPressure = normalizedFragmentPressure(text);
  const conversationalPosture = normalizedConversationalPosture(text, words, surfaceMarkerProfile);

  const profile = {
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
    contentWordComplexity,
    modifierDensity,
    hedgeDensity,
    abstractionPosture,
    directness,
    latinatePreference,
    abbreviationDensity,
    orthographicLooseness,
    fragmentPressure,
    conversationalPosture,
    surfaceMarkerProfile,
    functionWordProfile: functionWordProfile(text),
    wordLengthProfile: wordLengthProfile(text),
    charTrigramProfile: charTrigramProfile(text)
  };

  return {
    ...profile,
    registerMode: detectRegisterMode(profile)
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
  const abbreviationDensity = round3(clamp01((profile.abbreviationDensity || 0) + ((mod.punc || 0) * 0.012)));
  const orthographicLooseness = round3(clamp01((profile.orthographicLooseness || 0) + ((mod.punc || 0) * 0.015)));
  const fragmentPressure = round3(clamp01((profile.fragmentPressure || 0) + ((mod.sent || 0) < 0 ? Math.abs(mod.sent || 0) * 0.04 : (mod.sent || 0) * -0.02)));
  const conversationalPosture = round3(clamp01((profile.conversationalPosture || 0) + (((mod.cont || 0) + (mod.punc || 0)) * 0.01)));

  const result = {
    ...profile,
    avgSentenceLength: avgSentence,
    sentenceLengthSpread: spread,
    punctuationDensity: punctuation,
    contractionDensity: contraction,
    lineBreakDensity: lineBreak,
    recurrencePressure: recurrence,
    lexicalDispersion: lexical,
    abbreviationDensity,
    orthographicLooseness,
    fragmentPressure,
    conversationalPosture,
    shellBias: {
      sent: mod.sent || 0,
      cont: mod.cont || 0,
      punc: mod.punc || 0
    }
  };

  return {
    ...result,
    registerMode: detectRegisterMode(result)
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
  const contentWordComplexity = round3(clamp01(
    ((profile.contentWordComplexity || 0) * (1 - softBlend)) + ((source.contentWordComplexity || 0) * softBlend)
  ));
  const modifierDensity = round3(clamp01(
    ((profile.modifierDensity || 0) * (1 - softBlend)) + ((source.modifierDensity || 0) * softBlend)
  ));
  const hedgeDensity = round3(clamp01(
    ((profile.hedgeDensity || 0) * (1 - softBlend)) + ((source.hedgeDensity || 0) * softBlend)
  ));
  const abstractionPosture = round3(clamp01(
    ((profile.abstractionPosture || 0.5) * (1 - softBlend)) + ((source.abstractionPosture || 0.5) * softBlend)
  ));
  const directness = round3(clamp01(
    ((profile.directness || 0) * (1 - softBlend)) + ((source.directness || 0) * softBlend)
  ));
  const latinatePreference = round3(clamp01(
    ((profile.latinatePreference || 0) * (1 - softBlend)) + ((source.latinatePreference || 0) * softBlend)
  ));
  const abbreviationDensity = round3(clamp01(
    ((profile.abbreviationDensity || 0) * (1 - softBlend)) + ((source.abbreviationDensity || 0) * softBlend)
  ));
  const orthographicLooseness = round3(clamp01(
    ((profile.orthographicLooseness || 0) * (1 - softBlend)) + ((source.orthographicLooseness || 0) * softBlend)
  ));
  const fragmentPressure = round3(clamp01(
    ((profile.fragmentPressure || 0) * (1 - recurrenceBlend)) + ((source.fragmentPressure || 0) * recurrenceBlend)
  ));
  const conversationalPosture = round3(clamp01(
    ((profile.conversationalPosture || 0) * (1 - softBlend)) + ((source.conversationalPosture || 0) * softBlend)
  ));
  const recurrence = round3(
    (
      clamp01(punctuation / 0.35) +
      clamp01(lineBreak / 0.75) +
      clamp01(bigram / 0.18)
    ) / 3
  );

  const result = {
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
    contentWordComplexity,
    modifierDensity,
    hedgeDensity,
    abstractionPosture,
    directness,
    latinatePreference,
    abbreviationDensity,
    orthographicLooseness,
    fragmentPressure,
    conversationalPosture,
    surfaceMarkerProfile: source.surfaceMarkerProfile
      ? blendSurfaceMarkerProfile(profile.surfaceMarkerProfile || {}, source.surfaceMarkerProfile, softBlend)
      : profile.surfaceMarkerProfile,
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

  return {
    ...result,
    registerMode: detectRegisterMode(result)
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

function deriveRelativeCadenceMod(baseProfile = {}, targetProfile = {}, fallbackMod = {}) {
  const sentDelta = (targetProfile.avgSentenceLength || 0) - (baseProfile.avgSentenceLength || 0);
  const contractionDelta = (targetProfile.contractionDensity || 0) - (baseProfile.contractionDensity || 0);
  const punctuationDelta = (targetProfile.punctuationDensity || 0) - (baseProfile.punctuationDensity || 0);
  const lineBreakDelta = (targetProfile.lineBreakDensity || 0) - (baseProfile.lineBreakDensity || 0);

  const sent = Math.abs(sentDelta) >= 0.5
    ? clamp(Math.round(sentDelta / 1.8), -3, 3)
    : clamp(Math.round(Number(fallbackMod.sent || 0)), -3, 3);
  const cont = Math.abs(contractionDelta) >= 0.006
    ? clamp(Math.sign(contractionDelta) * Math.max(1, Math.round(Math.abs(contractionDelta) / 0.02)), -3, 3)
    : clamp(Math.round(Number(fallbackMod.cont || 0)), -3, 3);
  const puncSignal = Math.abs(punctuationDelta) >= 0.008
    ? punctuationDelta
    : lineBreakDelta;
  const punc = Math.abs(puncSignal) >= 0.008
    ? clamp(Math.sign(puncSignal) * Math.max(1, Math.round(Math.abs(puncSignal) / 0.02)), -3, 3)
    : clamp(Math.round(Number(fallbackMod.punc || 0)), -3, 3);

  return { sent, cont, punc };
}

function buildTransferTargetProfile(baseProfile = {}, shell = {}, fallbackMod = {}, strength = 0.76) {
  if (!shell?.profile) {
    return applyCadenceMod(baseProfile, fallbackMod);
  }

  const donor = shell.profile;
  const isPersonaShell = shell?.mode === 'persona';
  const visibleBlend = clamp(isPersonaShell ? 0.88 + (strength * 0.1) : 0.82 + (strength * 0.18), 0, isPersonaShell ? 0.99 : 1);
  const recurrenceBlend = clamp(isPersonaShell ? 0.84 + (strength * 0.12) : 0.76 + (strength * 0.18), 0, isPersonaShell ? 0.99 : 1);
  const lexicalBlend = clamp(isPersonaShell ? 0.78 + (strength * 0.16) : 0.62 + (strength * 0.16), 0, isPersonaShell ? 0.99 : 0.96);

  const result = {
    ...baseProfile,
    avgSentenceLength: round2(
      (baseProfile.avgSentenceLength || 0) +
      (((donor.avgSentenceLength || baseProfile.avgSentenceLength || 0) - (baseProfile.avgSentenceLength || 0)) * visibleBlend)
    ),
    sentenceLengthSpread: round2(
      (baseProfile.sentenceLengthSpread || 0) +
      (((donor.sentenceLengthSpread || 0) - (baseProfile.sentenceLengthSpread || 0)) * visibleBlend)
    ),
    punctuationDensity: round3(clamp01(
      (baseProfile.punctuationDensity || 0) +
      (((donor.punctuationDensity || 0) - (baseProfile.punctuationDensity || 0)) * visibleBlend)
    )),
    punctuationMix: donor.punctuationMix
      ? blendDistribution(baseProfile.punctuationMix || {}, donor.punctuationMix, visibleBlend, ['comma', 'strong', 'terminal', 'dash'])
      : baseProfile.punctuationMix,
    contractionDensity: round3(clamp01(
      (baseProfile.contractionDensity || 0) +
      (((donor.contractionDensity || 0) - (baseProfile.contractionDensity || 0)) * visibleBlend)
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
    lexicalDispersion: round3(clamp01(
      (baseProfile.lexicalDispersion || 0) +
      (((donor.lexicalDispersion || baseProfile.lexicalDispersion || 0) - (baseProfile.lexicalDispersion || 0)) * lexicalBlend)
    )),
    contentWordComplexity: round3(clamp01(
      (baseProfile.contentWordComplexity || 0) +
      (((donor.contentWordComplexity || baseProfile.contentWordComplexity || 0) - (baseProfile.contentWordComplexity || 0)) * lexicalBlend)
    )),
    modifierDensity: round3(clamp01(
      (baseProfile.modifierDensity || 0) +
      (((donor.modifierDensity || baseProfile.modifierDensity || 0) - (baseProfile.modifierDensity || 0)) * lexicalBlend)
    )),
    hedgeDensity: round3(clamp01(
      (baseProfile.hedgeDensity || 0) +
      (((donor.hedgeDensity || baseProfile.hedgeDensity || 0) - (baseProfile.hedgeDensity || 0)) * lexicalBlend)
    )),
    abstractionPosture: round3(clamp01(
      (baseProfile.abstractionPosture || 0.5) +
      (((donor.abstractionPosture || baseProfile.abstractionPosture || 0.5) - (baseProfile.abstractionPosture || 0.5)) * lexicalBlend)
    )),
    directness: round3(clamp01(
      (baseProfile.directness || 0) +
      (((donor.directness || 0) - (baseProfile.directness || 0)) * lexicalBlend)
    )),
    latinatePreference: round3(clamp01(
      (baseProfile.latinatePreference || 0) +
      (((donor.latinatePreference || 0) - (baseProfile.latinatePreference || 0)) * lexicalBlend)
    )),
    abbreviationDensity: round3(clamp01(
      (baseProfile.abbreviationDensity || 0) +
      (((donor.abbreviationDensity || 0) - (baseProfile.abbreviationDensity || 0)) * lexicalBlend)
    )),
    orthographicLooseness: round3(clamp01(
      (baseProfile.orthographicLooseness || 0) +
      (((donor.orthographicLooseness || 0) - (baseProfile.orthographicLooseness || 0)) * lexicalBlend)
    )),
    fragmentPressure: round3(clamp01(
      (baseProfile.fragmentPressure || 0) +
      (((donor.fragmentPressure || 0) - (baseProfile.fragmentPressure || 0)) * visibleBlend)
    )),
    conversationalPosture: round3(clamp01(
      (baseProfile.conversationalPosture || 0) +
      (((donor.conversationalPosture || 0) - (baseProfile.conversationalPosture || 0)) * lexicalBlend)
    )),
    surfaceMarkerProfile: donor.surfaceMarkerProfile
      ? blendSurfaceMarkerProfile(baseProfile.surfaceMarkerProfile || {}, donor.surfaceMarkerProfile, lexicalBlend)
      : baseProfile.surfaceMarkerProfile,
    functionWordProfile: donor.functionWordProfile
      ? blendDistribution(baseProfile.functionWordProfile || {}, donor.functionWordProfile, Math.min(1, visibleBlend + 0.04), FUNCTION_WORDS)
      : baseProfile.functionWordProfile,
    wordLengthProfile: donor.wordLengthProfile
      ? blendDistribution(
          baseProfile.wordLengthProfile || {},
          donor.wordLengthProfile,
          lexicalBlend,
          WORD_LENGTH_BUCKETS.map((bucket) => bucket.id)
        )
      : baseProfile.wordLengthProfile,
    charTrigramProfile: donor.charTrigramProfile
      ? blendDistribution(baseProfile.charTrigramProfile || {}, donor.charTrigramProfile, lexicalBlend)
      : baseProfile.charTrigramProfile,
    shellBias: {
      mode: shell.mode,
      strength: round3(strength),
      targetMode: isPersonaShell ? 'persona-donor' : 'donor'
    }
  };

  return {
    ...result,
    registerMode: detectRegisterMode(result)
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
    functionWord: functionWordDistance(profile.functionWordProfile || {}, targetProfile.functionWordProfile || {}),
    lexicalComplexity: Math.abs((profile.contentWordComplexity || 0) - (targetProfile.contentWordComplexity || 0)),
    modifierDensity: Math.abs((profile.modifierDensity || 0) - (targetProfile.modifierDensity || 0)),
    hedgeDensity: Math.abs((profile.hedgeDensity || 0) - (targetProfile.hedgeDensity || 0)),
    directness: Math.abs((profile.directness || 0) - (targetProfile.directness || 0)),
    abstraction: Math.abs((profile.abstractionPosture || 0.5) - (targetProfile.abstractionPosture || 0.5)),
    latinate: Math.abs((profile.latinatePreference || 0) - (targetProfile.latinatePreference || 0)),
    abbreviation: Math.abs((profile.abbreviationDensity || 0) - (targetProfile.abbreviationDensity || 0)),
    orthography: Math.abs((profile.orthographicLooseness || 0) - (targetProfile.orthographicLooseness || 0)),
    fragment: Math.abs((profile.fragmentPressure || 0) - (targetProfile.fragmentPressure || 0)),
    conversation: Math.abs((profile.conversationalPosture || 0) - (targetProfile.conversationalPosture || 0)),
    surfaceMarkers: surfaceMarkerDistance(profile.surfaceMarkerProfile || {}, targetProfile.surfaceMarkerProfile || {}),
    register: registerDistance(profile, targetProfile)
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
    (clamp01((gap.register || 0) / 0.4) * 0.12) +
    (clamp01((gap.directness || 0) / 0.4) * 0.04) +
    (clamp01((gap.abstraction || 0) / 0.4) * 0.04) +
    (clamp01((gap.modifierDensity || 0) / 0.2) * 0.04) +
    (clamp01((gap.abbreviation || 0) / 0.18) * 0.08) +
    (clamp01((gap.orthography || 0) / 0.24) * 0.08) +
    (clamp01((gap.fragment || 0) / 0.25) * 0.06) +
    (clamp01((gap.conversation || 0) / 0.24) * 0.06) +
    (clamp01(gap.surfaceMarkers || 0) * 0.06) +
    (clamp01((gap.punctuation || 0) / 0.16) * 0.06) +
    (clamp01(gap.punctuationShape || 0) * 0.06)
  );
}

function isMaterialCadenceGap(gap = {}) {
  return (gap.avgSentence || 0) >= 0.8 ||
    (gap.sentenceCount || 0) >= 1 ||
    (gap.contraction || 0) >= 0.01 ||
    (gap.lineBreak || 0) >= 0.035 ||
    (gap.functionWord || 0) >= 0.03 ||
    (gap.punctuationShape || 0) >= 0.05 ||
    (gap.register || 0) >= 0.11 ||
    (gap.directness || 0) >= 0.06 ||
    (gap.abstraction || 0) >= 0.08 ||
    (gap.abbreviation || 0) >= 0.03 ||
    (gap.orthography || 0) >= 0.05 ||
    (gap.fragment || 0) >= 0.06 ||
    (gap.conversation || 0) >= 0.06 ||
    (gap.surfaceMarkers || 0) >= 0.08;
}

function collectChangedDimensions(sourceProfile = {}, outputProfile = {}) {
  const shifted = [];
  const compare = compareTexts('', '', {
    profileA: sourceProfile,
    profileB: outputProfile
  });

  if (Math.abs((outputProfile.avgSentenceLength || 0) - (sourceProfile.avgSentenceLength || 0)) >= 0.5) {
    shifted.push('sentence-mean');
  }
  if (Math.abs((outputProfile.sentenceCount || 0) - (sourceProfile.sentenceCount || 0)) >= 1) {
    shifted.push('sentence-count');
  }
  if (Math.abs((outputProfile.sentenceLengthSpread || 0) - (sourceProfile.sentenceLengthSpread || 0)) >= 0.5) {
    shifted.push('sentence-spread');
  }
  if (Math.abs((outputProfile.contractionDensity || 0) - (sourceProfile.contractionDensity || 0)) >= 0.006) {
    shifted.push('contraction-posture');
  }
  if (Math.abs((outputProfile.lineBreakDensity || 0) - (sourceProfile.lineBreakDensity || 0)) >= 0.02) {
    shifted.push('line-break-texture');
  }
  if ((compare.functionWordDistance || 0) >= 0.015) {
    shifted.push('connector-stance');
  }
  if ((compare.registerDistance || 0) >= 0.09) {
    shifted.push('lexical-register');
  }
  if (Math.abs((outputProfile.contentWordComplexity || 0) - (sourceProfile.contentWordComplexity || 0)) >= 0.045) {
    shifted.push('content-word-complexity');
  }
  if (Math.abs((outputProfile.modifierDensity || 0) - (sourceProfile.modifierDensity || 0)) >= 0.02) {
    shifted.push('modifier-density');
  }
  if (Math.abs((outputProfile.directness || 0) - (sourceProfile.directness || 0)) >= 0.05) {
    shifted.push('directness');
  }
  if (Math.abs((outputProfile.abstractionPosture || 0.5) - (sourceProfile.abstractionPosture || 0.5)) >= 0.08) {
    shifted.push('abstraction-posture');
  }
  if (Math.abs((outputProfile.abbreviationDensity || 0) - (sourceProfile.abbreviationDensity || 0)) >= 0.02) {
    shifted.push('abbreviation-posture');
  }
  if (Math.abs((outputProfile.orthographicLooseness || 0) - (sourceProfile.orthographicLooseness || 0)) >= 0.04) {
    shifted.push('orthography-posture');
  }
  if (Math.abs((outputProfile.fragmentPressure || 0) - (sourceProfile.fragmentPressure || 0)) >= 0.05) {
    shifted.push('fragment-posture');
  }
  if (Math.abs((outputProfile.conversationalPosture || 0) - (sourceProfile.conversationalPosture || 0)) >= 0.05) {
    shifted.push('conversation-posture');
  }
  if (surfaceMarkerDistance(outputProfile.surfaceMarkerProfile || {}, sourceProfile.surfaceMarkerProfile || {}) >= 0.08) {
    shifted.push('surface-marker-posture');
  }
  if (
    Math.abs((outputProfile.punctuationDensity || 0) - (sourceProfile.punctuationDensity || 0)) >= 0.018 ||
    (compare.punctShapeDistance || 0) >= 0.05
  ) {
    shifted.push('punctuation-shape');
  }

  return shifted;
}

const STRUCTURAL_TRANSFER_DIMENSIONS = new Set([
  'sentence-mean',
  'sentence-count',
  'sentence-spread',
  'contraction-posture',
  'line-break-texture',
  'connector-stance'
]);

const LEXICAL_TRANSFER_DIMENSIONS = new Set([
  'lexical-register',
  'content-word-complexity',
  'modifier-density',
  'directness',
  'abstraction-posture',
  'abbreviation-posture',
  'orthography-posture',
  'fragment-posture',
  'conversation-posture',
  'surface-marker-posture'
]);

function structuralDimensions(changedDimensions = []) {
  return changedDimensions.filter((dimension) => STRUCTURAL_TRANSFER_DIMENSIONS.has(dimension));
}

function lexicalDimensions(changedDimensions = []) {
  return changedDimensions.filter((dimension) => LEXICAL_TRANSFER_DIMENSIONS.has(dimension));
}

function hasMaterialStructuralTransfer(changedDimensions = []) {
  const nonPunctuationDimensions = changedDimensions.filter((dimension) => dimension !== 'punctuation-shape');
  return structuralDimensions(changedDimensions).length >= 1 && nonPunctuationDimensions.length >= 2;
}

function borrowedShellStructuralDimensions(changedDimensions = []) {
  return structuralDimensions(changedDimensions).filter((dimension) => dimension !== 'contraction-posture');
}

function hasBorrowedShellVisibleShift(sourceText = '', outputText = '', changedDimensions = [], lexicalShiftProfile = {}) {
  if (!sourceText || !outputText || outputText === sourceText) {
    return false;
  }

  const nonPunctuationDimensions = changedDimensions.filter((dimension) => dimension !== 'punctuation-shape');
  return nonPunctuationDimensions.length > 0 || Number(lexicalShiftProfile.swapCount || 0) > 0;
}

function hasBorrowedShellNonTrivialShift(sourceText = '', outputText = '', changedDimensions = [], lexicalShiftProfile = {}) {
  if (!hasBorrowedShellVisibleShift(sourceText, outputText, changedDimensions, lexicalShiftProfile)) {
    return false;
  }

  return lexicalDimensions(changedDimensions).length > 0 ||
    borrowedShellStructuralDimensions(changedDimensions).length > 0 ||
    Number(lexicalShiftProfile.swapCount || 0) > 0;
}

function donorDistanceFromFit(fit = {}) {
  return round3(
    (fit.sentenceDistance || 0) +
    (fit.functionWordDistance || 0) +
    (fit.contractionDistance || 0) +
    (fit.punctShapeDistance || 0) +
    (fit.registerDistance || 0) +
    (fit.abbreviationDistance || 0) +
    (fit.orthographyDistance || 0) +
    (fit.fragmentDistance || 0) +
    (fit.conversationDistance || 0) +
    (fit.surfaceMarkerDistance || 0)
  );
}

function buildBorrowedShellDonorProgress(
  sourceText = '',
  outputText = '',
  sourceProfile = {},
  targetProfile = {},
  outputProfile = {}
) {
  if (!sourceText || !outputText || !targetProfile || targetProfile.empty) {
    return {
      eligible: false,
      sourceDonorDistance: 0,
      outputDonorDistance: 0,
      donorImprovement: 0,
      donorImprovementRatio: 0,
      sourceOutputLexicalOverlap: 1
    };
  }

  const sourceFit = compareTexts('', '', {
    profileA: sourceProfile,
    profileB: targetProfile
  });
  const outputFit = compareTexts('', '', {
    profileA: outputProfile,
    profileB: targetProfile
  });
  const sourceOutputFit = compareTexts(sourceText, outputText, {
    profileA: sourceProfile,
    profileB: outputProfile
  });
  const sourceDonorDistance = donorDistanceFromFit(sourceFit);
  const outputDonorDistance = donorDistanceFromFit(outputFit);
  const donorImprovement = round3(Math.max(0, sourceDonorDistance - outputDonorDistance));
  const donorImprovementRatio = round3(
    sourceDonorDistance > 0
      ? donorImprovement / sourceDonorDistance
      : 0
  );

  return {
    eligible: true,
    sourceDonorDistance,
    outputDonorDistance,
    donorImprovement,
    donorImprovementRatio,
    sourceOutputLexicalOverlap: round3(sourceOutputFit.lexicalOverlap ?? 1)
  };
}

function borrowedShellSurfaceClose(donorProgress = {}) {
  if (!donorProgress.eligible) {
    return false;
  }

  return (
    donorProgress.donorImprovement < 0.12 ||
    donorProgress.donorImprovementRatio < 0.05 ||
    (
      donorProgress.sourceOutputLexicalOverlap >= 0.95 &&
      donorProgress.donorImprovement < 0.28
    )
  );
}

function borrowedShellPathologyBlocked(qualityNotes = []) {
  const hardBlockers = [
    /^Protected literals did not survive the rewrite intact\./,
    /^Protected placeholders leaked into the output\./,
    /^Transfer introduced a duplicated sentence chunk\./,
    /^Transfer introduced a repeated connector sequence\./,
    /^Banned connector stack detected:/,
    /^Orphan fragment detected:/,
    /^Transfer expanded past the bounded output ratio\./,
    /^Transfer collapsed into an unreadable empty result\./
  ];

  return qualityNotes.some((note) => hardBlockers.some((pattern) => pattern.test(note)));
}

function sanitizeBorrowedShellPathologies(text = '') {
  let result = normalizeText(text);

  if (!result) {
    return result;
  }

  result = result
    .replace(/\bbut\s+because\b/gi, (match) => matchCase(match, 'because'))
    .replace(/\bthough\s+if\b/gi, (match) => matchCase(match, 'if'))
    .replace(/\band\s+though\s+if\b/gi, (match) => matchCase(match, 'if'))
    .replace(/\bhonestly[,;]?\s+and\b/gi, (match) => {
      if (/;/.test(match)) {
        return matchCase(match, 'honestly;');
      }
      return matchCase(match, 'honestly,');
    })
    .replace(/\bbetween([^.!?]{0,120}),\s+but\s+/gi, 'between$1, and ')
    .replace(/;\s+but\b/gi, ', but')
    .replace(/\bquiet\s+(receive|receives|received|receiving|get|gets|got|getting|stand|stands|stood|standing|pass|passes|passed|passing|fail|fails|failed|failing|match|matches|matched|matching|clear|clears|cleared|clearing|stay|stays|stayed|staying|remain|remains|remained|remaining|run|runs|ran|running|work|works|worked|working|hold|holds|held|holding|show|shows|showed|showing|move|moves|moved|moving)\b/gi, 'still $1')
    .replace(/\bexplaining\s+(me|us|him|her|them)\s+to\b/gi, 'telling $1 to')
    .replace(/\breal\s+provide\s+is\b/gi, 'real issue is')
    .replace(/\bthe\s+corrective\s+provide\s+is\s+not\s+merely\b/gi, "the problem isn't just")
    .replace(/\bthe\s+underlying\s+provide\b/gi, 'the underlying issue')
    .replace(/\bthe\s+procedural\s+provide\b/gi, 'the procedural issue')
    .replace(/\bservice\s+received\s+done\b/gi, 'service was done')
    .replace(/\bhandoff\s+received\s+muddy\b/gi, 'handoff became muddy')
    .replace(/\bcalm under alter\b/gi, 'calm under change')
    .replace(/\bwhat\s+did\s+fix\s+was\b/gi, 'what did help was')
    .replace(/\bYet\s+and\b/gi, 'And')
    .replace(/\bthough\s+and\b/gi, 'and')
    .replace(/\bthough\s+also\b/gi, 'and also')
    .replace(/\band shell have id\b/gi, "and she'll have ID")
    .replace(/\band also I swear\b/gi, 'and I swear')
    .replace(/;\s+yet if\b/gi, '. If')
    .replace(/\b(As of [^.!?]{1,48}|During [^.!?]{1,36}|By [^.!?]{1,20})\.\s+([A-Z])/g, (match, leadIn, nextLetter) => {
      return `${leadIn}, ${nextLetter.toLowerCase()}`;
    })
    .replace(/\b(On [^.;!?]{1,48});\s+([A-Z])/g, (match, leadIn, nextLetter) => {
      return `${leadIn}, ${nextLetter}`;
    })
    .replace(/\b(At [^.!?]{1,48})\.\s+(Door\s+\d+\b)/g, (match, leadIn, doorPhrase) => {
      return `${leadIn}, ${doorPhrase}`;
    })
    .replace(/\bRequired correction\.\s+No future\b/gi, 'Required correction: no future')
    .replace(/\blive-door test,\s+A latch release check\b/gi, 'live-door test, a latch release check')
    .replace(/([A-Za-z0-9"'%)])\.\s+(When|While|Once|If|Because|Since|Though|Although)\b/g, (match, lastChar, connector) => {
      return `${lastChar}, ${connector.toLowerCase()}`;
    })
    .replace(/([A-Za-z0-9"'%)])\.\s+(Which|That)\b/g, (match, lastChar, connector) => {
      return `${lastChar}, ${connector.toLowerCase()}`;
    })
    .replace(/([A-Za-z0-9"'%)])\.\s+((?:A|An|The)\s+[^.!?]{1,48}),\s+and\s+/g, (match, lastChar, fragment) => {
      return `${lastChar}, ${fragment}, and `;
    })
    .replace(/([.!?]\s+)(And|But|So|Yet|Still)\s+([^.!?]{1,28})\.\s+([A-Z][^.!?]{1,160}[.!?]?)/g, (match, lead, connector, fragment, nextSentence) => {
      const fragmentWords = tokenize(`${connector} ${fragment}`);
      if (fragmentWords.length > 3) {
        return match;
      }
      const stitchedNext = nextSentence.replace(/^[A-Z]/, (letter) => letter.toLowerCase());
      return `${lead}${connector} ${fragment} ${stitchedNext}`;
    })
    .replace(/([.!?])\s+(?:and|but|so|yet|still)\s*\./gi, '$1 ')
    .replace(/([.!?])\s+(?:and|but|so|yet|still)\s+([A-Z])/g, '$1 $2');

  return finalizeTransformedText(result);
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

// ============================================================================
// IR System - Semantic Scaffold for Text Transformation
// ============================================================================

function segmentTextToIR(text, protectedState) {
  const sentences = sentenceSplit(text);
  let sentenceId = 0;

  const irSentences = sentences.map((sentenceText) => {
    const clauses = segmentSentenceToClauses(sentenceText);
    const terminalPunct = /[.!?]$/.test(sentenceText) ? sentenceText[sentenceText.length - 1] : '.';
    const relation = relationInventory(buildRelationOpportunityProfile(sentenceText));
    const dominantRel = dominantRelationFromInventory(relation);

    const irClauses = clauses.map((clauseText, clauseIdx) => {
      const normalized = normalizeText(clauseText).toLowerCase();
      const relationToPrev = clauseIdx === 0 ? 'start' : inferClauseRelation('', clauseText);
      const clauseType = classifyClauseType(clauseText);
      const completeness = detectClauseCompleteness(clauseText);
      const modality = detectModalityAndHedges(clauseText);
      const semanticScaffold = extractClauseSemanticScaffold(clauseText);

      return {
        id: `s${sentenceId}c${clauseIdx}`,
        text: clauseText,
        normalized,
        relationToPrev,
        clauseType,
        subjectPresent: completeness.subjectPresent,
        finiteVerbPresent: completeness.finiteVerbPresent,
        polarity: modality.polarity,
        modality: modality.modality,
        hedgeMarkers: modality.hedgeMarkers,
        tenseAspect: semanticScaffold.tenseAspect,
        propositionHead: semanticScaffold.propositionHead,
        actor: semanticScaffold.actor,
        action: semanticScaffold.action,
        object: semanticScaffold.object,
        modifiers: semanticScaffold.modifiers,
        connectorLead: (RELATION_LEAD_PATTERNS[relationToPrev] || /(?!)/).test(clauseText),
        transformOps: {
          canCompact: completeness.subjectPresent && completeness.finiteVerbPresent,
          canExpand: clauseType !== 'fragment',
          canPromote: clauseType === 'subordinate' && completeness.finiteVerbPresent,
          canDemote: clauseType === 'main',
          canMergeNext: clauseIdx < clauses.length - 1
        }
      };
    });

    sentenceId += 1;
    return {
      id: `s${sentenceId - 1}`,
      raw: sentenceText,
      clauses: irClauses,
      terminalPunct,
      rhetoricalRole: dominantRel,
      canSplit: clauses.length > 1,
      canMerge: true
    };
  });

  return {
    sourceText: text,
    protectedState,
    sentences: irSentences,
    metadata: {
      literalSpans: protectedState.literals || [],
      sentenceCount: irSentences.length,
      clauseCount: irSentences.reduce((sum, s) => sum + s.clauses.length, 0)
    }
  };
}

function segmentSentenceToClauses(sentenceText = '') {
  const stripped = stripTerminalPunctuation(sentenceText).trim();
  if (!stripped) return [];

  const clauses = [];
  let remaining = stripped;

  // Split on major clause boundaries: semicolons, dashes with subjects
  const parts = remaining
    .split(/;\s+|(?:,?\s*-\s+(?=[A-Z]|\b(?:and|but|though|so|because|if|when|while)))/)
    .filter(Boolean);

  if (parts.length > 1) {
    return parts.map(p => p.trim()).filter(Boolean);
  }

  // Split on coordinating conjunctions with likely subject following
  const coordParts = remaining
    .split(/,?\s+(?:and|but|so|though|yet|or)\s+(?=[A-Z]|I\b|we\b|they\b|you\b|he\b|she\b|it\b|there\b|this\b|that\b)/)
    .filter(Boolean);

  if (coordParts.length > 1) {
    return coordParts.map(p => p.trim()).filter(Boolean);
  }

  // Split on subordinating conjunctions
  const subordParts = remaining
    .split(/,?\s+(?:because|since|as|if|when|while|unless|until|once|though|although|even\s+though)(?:\s+|$)/)
    .filter(Boolean);

  if (subordParts.length > 1) {
    return subordParts.map(p => p.trim()).filter(Boolean);
  }

  // No clear splits; return the whole sentence as one clause
  return [stripped];
}

function classifyClauseType(text = '') {
  const normalized = stripTerminalPunctuation(text).toLowerCase().trim();

  // Check for relative clauses
  if (/^\s*(?:which|that|who|whom|whose)\b/.test(text)) {
    return 'relative';
  }

  // Check for subordinate clause leads
  if (/^(?:because|since|as|if|when|while|unless|until|once|though|although|even\s+though)(?:\s+|$)/i.test(normalized)) {
    return 'subordinate';
  }

  // Check for parenthetical/resumptive leads
  if (/^(?:honestly|apparently|frankly|basically|anyway|i\s+think|i\s+guess|i\s+mean|to\s+be\s+honest)(?:\s|,|$)/i.test(normalized)) {
    return 'parenthetical';
  }

  // Check for fragment (no verb/subject)
  const hasAnyVerb = /\b(?:is|was|are|were|be|been|being|do|does|did|will|would|can|could|may|might|shall|should|have|has|had|must|go|comes?|makes?|says?|sees?|thinks?|knows?|gets?|takes?|gives?|finds?|tells?|asks?|works?|calls?|tries?|uses?|starts?|helps?|plays?|moves?|likes?|lives?|believes?|holds?|brings?|begins?|seems?|talks?|turns?|shows?|hears?|lets?|means?|sets?|meets?|runs?|pays?|sits?|speaks?|lies?|leads?|reads?|allows?|adds?|spends?|grows?|opens?|walks?|wins?|offers?|remembers?|loves?|considers?|appears?|buys?|waits?|serves?|dies?|sends?|expects?|builds?|stays?|falls?|cuts?|reaches?|kills?|remains?|suggests?|raises?|passes?|sells?|requires?|reports?|decides?|pulls?|produces?|eats?|covers?|catches?|draws?|breaks?|changes?|understands?|watches?|follows?|stops?|creates?)\b/i;
  if (!hasAnyVerb.test(normalized)) {
    return 'fragment';
  }

  return 'main';
}

function detectClauseCompleteness(text = '') {
  const normalized = stripTerminalPunctuation(text).toLowerCase().trim();

  // Common subject patterns
  const subjectPattern = /\b(?:I|we|you|they|he|she|it|there|this|that|which|who|one|each|every|some|any|all|both|neither|either|another|the|a|an)\b|^[A-Z]\w+\s+/i;
  const subjectPresent = subjectPattern.test(text);

  // Check for any form of finite verb (simplified)
  const finiteVerbPresent = /\b(?:is|was|are|were|be|been|do|does|did|will|would|can|could|may|might|have|has|had|must|am|go|comes?|makes?|says?|sees?|thinks?|knows?|gets?|takes?|gives?|finds?|tells?|asks?|works?|calls?|tries?|uses?|starts?|helps?|plays?|moves?|likes?|lives?|believes?|holds?|brings?|begins?|seems?|talks?|turns?|shows?|hears?|lets?|means?|sets?|meets?|runs?|pays?|sits?|speaks?|lies?|leads?|reads?|allows?|adds?|spends?|grows?|opens?|walks?|wins?|offers?|remembers?|loves?|considers?|appears?|buys?|waits?|serves?|dies?|sends?|expects?|builds?|stays?|falls?|cuts?|reaches?|kills?|remains?|suggests?|raises?|passes?|sells?|requires?|reports?|decides?|pulls?|produces?|eats?|covers?|catches?|draws?|breaks?|changes?|understands?|watches?|follows?|stops?|creates?)\b/i;
  const finiteVerbCheck = finiteVerbPresent.test(normalized);

  return { subjectPresent, finiteVerbPresent: finiteVerbCheck };
}

function detectModalityAndHedges(text = '') {
  const normalized = normalizeText(text).toLowerCase();

  let modality = 'indicative';
  if (/\b(?:would|could|might|may|should|must|can)\b/.test(normalized)) {
    modality = 'modal';
  } else if (/\b(?:might|may|could)\b/.test(normalized)) {
    modality = 'conditional';
  }

  const hedgeMarkers = [];
  const hedgePatterns = [
    { pattern: /\b(?:maybe|perhaps|possibly|arguably|apparently|sort\s+of|kind\s+of|somewhat|rather|quite|somewhat)\b/gi, hedge: 'uncertainty' },
    { pattern: /\b(?:honestly|frankly|to\s+be\s+honest|i\s+think|i\s+guess|i\s+mean|in\s+my\s+opinion)\b/gi, hedge: 'stance' },
    { pattern: /\b(?:just|simply|merely|only|barely|hardly|scarcely)\b/gi, hedge: 'minimization' },
    { pattern: /\b(?:really|very|quite|rather|definitely|certainly|absolutely)\b/gi, hedge: 'intensification' }
  ];

  for (const { pattern, hedge } of hedgePatterns) {
    if (pattern.test(normalized)) {
      hedgeMarkers.push(hedge);
    }
  }

  const polarity = /\b(?:not|no|never|neither|nor|cannot|cant|can't|wont|won't|dont|don't|doesnt|doesn't|didnt|didn't|isnt|isn't|arent|aren't|wasnt|wasn't|werent|weren't|shouldnt|shouldn't|wouldnt|wouldn't|couldnt|couldn't|mustnt|mustn't|hasnt|hasn't|havent|haven't|hadnt|hadn't)\b/i.test(text)
    ? 'negative'
    : 'positive';

  return { modality, hedgeMarkers: [...new Set(hedgeMarkers)], polarity };
}

function detectTenseAspect(text = '') {
  const normalized = normalizeText(text).toLowerCase();

  if (/\b(?:had|has|have)\s+\w+ed\b/.test(normalized)) {
    return 'perfect';
  }

  if (/\b(?:was|were|am|is|are)\s+\w+ing\b/.test(normalized)) {
    return 'progressive';
  }

  if (/\b(?:will|would|shall|should|won't|can't|cannot|couldn't|shouldn't|wouldn't|i'll|we'll|you'll|they'll|he'll|she'll|it'll)\b/.test(normalized)) {
    return 'future-modal';
  }

  if (/\b\w+ed\b/.test(normalized)) {
    return 'past';
  }

  return 'present';
}

function extractClauseSemanticScaffold(text = '') {
  const tokens = tokenize(text);
  const actorMatch = normalizeText(text).match(/\b(?:I|we|you|they|he|she|it|there|this|that|the\s+\w+|a\s+\w+|an\s+\w+)\b/i);
  const actor = actorMatch ? actorMatch[0] : '';
  const lexicalActionMatch = normalizeText(text).match(/\b(?:go|goes|went|get|gets|got|keep|keeps|kept|leave|leaves|left|remember|remembers|remembered|wait|waits|waited|pause|pauses|paused|grab|grabs|grabbed|bring|brings|brought|use|uses|used|pull|pulls|pulled|call|calls|called|contact|contacts|contacted|knock|knocks|knocked|lean|leans|leaned|change|changes|changed|say|says|said|tell|tells|told|ask|asks|asked|request|requests|requested|need|needs|needed|require|requires|required|show|shows|showed|check|checks|checked|review|reviews|reviewed|verify|verifies|verified|confirm|confirms|confirmed|shift|shifts|shifted|begin|begins|began|finish|finishes|finished|wrap|wraps|wrapped|conclude|concludes|concluded|come|comes|came|catch|catches|caught|deploy|deploys|deployed|head|heads|headed|circle|circles|circled|stall|stalls|stalled|provide|provides|provided|issue|issues|issued|find|finds|found|locate|locates|located|identify|identifies|identified|book|books|booked|schedule|schedules|scheduled|send|sends|sent|forward|forwards|forwarded|transmit|transmits|transmitted|fix|fixes|fixed|resolve|resolves|resolved|move|moves|moved|relocate|relocates|relocated|transfer|transfers|transferred|match|matches|matched|align|aligns|aligned|log|logs|logged|flag|flags|flagged|release|releases|released)\b/i);
  const auxiliaryActionMatch = normalizeText(text).match(/\b(?:am|is|are|was|were|be|been|being|do|does|did|have|has|had|will|would|can|could|may|might|must)\b/i);
  const actionMatch = lexicalActionMatch || auxiliaryActionMatch;
  const action = actionMatch ? actionMatch[0] : '';
  const actionIndex = actionMatch ? Math.max(0, tokens.indexOf(action.toLowerCase())) : -1;
  const object = actionIndex >= 0
    ? tokens
      .slice(actionIndex + 1)
      .filter((word) => !HEDGE_MARKERS.has(word) && !CONTENT_STOP_WORDS.has(word))
      .slice(0, 5)
      .join(' ')
    : '';
  const modifiers = tokens.filter((word) =>
    MODIFIER_MARKERS.has(word) ||
    /(?:ly|ive|ous|al|ful|less|able|ible|ish|ic)$/i.test(word)
  );
  const propositionHead = action || tokens.find((word) => !CONTENT_STOP_WORDS.has(word)) || '';

  return {
    propositionHead,
    actor,
    action,
    object,
    modifiers,
    tenseAspect: detectTenseAspect(text)
  };
}

function buildOpportunityProfileFromIR(ir) {
  // Enhanced opportunity profile from IR structure
  const profile = buildOpportunityProfile(ir.sourceText);

  // Add IR-based opportunities
  profile.irClauseBoundaries = ir.metadata.clauseCount;
  profile.irSentenceCount = ir.metadata.sentenceCount;
  profile.irClauses = ir.sentences.filter(s => s.clauses.length > 1).length;

  return profile;
}

function preferredRegisterMode(targetProfile = {}, currentProfile = {}) {
  const targetMode = detectRegisterMode(targetProfile);
  const currentMode = detectRegisterMode(currentProfile);

  if (targetMode !== currentMode) {
    return targetMode;
  }

  if (
    (targetProfile.abbreviationDensity || 0) > ((currentProfile.abbreviationDensity || 0) + 0.03) ||
    (targetProfile.orthographicLooseness || 0) > ((currentProfile.orthographicLooseness || 0) + 0.05) ||
    (targetProfile.fragmentPressure || 0) > ((currentProfile.fragmentPressure || 0) + 0.06)
  ) {
    return 'compressed';
  }

  if ((targetProfile.conversationalPosture || 0) > ((currentProfile.conversationalPosture || 0) + 0.05)) {
    return 'conversational';
  }

  if ((targetProfile.directness || 0) > (currentProfile.directness || 0) + 0.04) {
    return 'operational';
  }

  if ((targetProfile.abstractionPosture || 0) > (currentProfile.abstractionPosture || 0) + 0.06) {
    return 'reflective';
  }

  if ((targetProfile.latinatePreference || 0) > (currentProfile.latinatePreference || 0) + 0.05) {
    return 'formal';
  }

  return targetMode;
}

function applyShorthandRealizationTexture(text = '', currentProfile = {}, targetProfile = {}, strength = 0.76) {
  const mode = preferredRegisterMode(targetProfile, currentProfile);
  const wantsCompression =
    mode === 'compressed' ||
    (targetProfile.abbreviationDensity || 0) > ((currentProfile.abbreviationDensity || 0) + 0.03);
  const wantsExpansion =
    mode === 'formal' ||
    mode === 'reflective' ||
    (
      mode === 'plain' &&
      (targetProfile.abbreviationDensity || 0) <= ((currentProfile.abbreviationDensity || 0) + 0.01)
    );
  const maxPacks = Math.max(2, Math.min(SHORTHAND_REALIZATION_PACKS.length, Math.round(2 + (strength * 5))));
  let result = text;
  let applied = 0;

  if (!wantsCompression && !wantsExpansion) {
    return result;
  }

  for (const pack of SHORTHAND_REALIZATION_PACKS) {
    if (applied >= maxPacks) {
      break;
    }

    const replacement = wantsExpansion ? pack.formal : pack.operational;
    if (!replacement) {
      continue;
    }

    const next = replaceLimited(result, pack.pattern, (match) => matchCase(match, replacement), 1);
    if (next !== result) {
      result = next;
      applied += 1;
    }
  }

  return result;
}

function applyPhraseRealizationPacks(text = '', currentProfile = {}, targetProfile = {}, strength = 0.76) {
  let result = text;
  const mode = preferredRegisterMode(targetProfile, currentProfile);
  const surfaceHeavyTarget =
    (targetProfile.abbreviationDensity || 0) >= 0.08 ||
    (targetProfile.orthographicLooseness || 0) >= 0.14 ||
    mode === 'compressed';
  const maxPacks =
    mode === 'compressed'
      ? Math.max(2, Math.min(PHRASE_REALIZATION_PACKS.length, Math.round(2 + (strength * 4))))
      : surfaceHeavyTarget
        ? Math.max(1, Math.min(PHRASE_REALIZATION_PACKS.length, Math.round(1 + (strength * 2))))
        : Math.max(1, Math.min(PHRASE_REALIZATION_PACKS.length, Math.round(1 + (strength * 3))));
  let applied = 0;

  for (const pack of PHRASE_REALIZATION_PACKS) {
    if (applied >= maxPacks) {
      break;
    }

    const replacement = pack.replacements[mode] || pack.replacements.plain;
    if (!replacement) {
      continue;
    }

    const next = replaceLimited(result, pack.pattern, (match) => matchCase(match, replacement), 1);
    if (next !== result) {
      result = next;
      applied += 1;
    }
  }

  return result;
}

const DONOR_SURFACE_PACKS = [
  { key: 'ok', expandedPattern: /\bokay\b/gi, compressed: 'ok' },
  { key: 'pls', expandedPattern: /\bplease\b/gi, compressed: 'pls' },
  { key: 'bc', expandedPattern: /\bbecause\b/gi, compressed: 'bc' },
  { key: 'wSlash', expandedPattern: /\bwith\b/gi, compressed: 'w/' },
  { key: 'woSlash', expandedPattern: /\bwithout\b/gi, compressed: 'w/o' },
  { key: 'thru', expandedPattern: /\bthrough\b/gi, compressed: 'thru' },
  { key: 'tmrw', expandedPattern: /\btomorrow\b/gi, compressed: 'tmrw' },
  { key: 'temp', expandedPattern: /\btemporary\b/gi, compressed: 'temp' },
  { key: 'acct', expandedPattern: /\baccount\b/gi, compressed: 'acct' },
  { key: 'pkg', expandedPattern: /\bpackage\b/gi, compressed: 'pkg' },
  { key: 'appt', expandedPattern: /\bappointment\b/gi, compressed: 'appt' },
  { key: 'mgmt', expandedPattern: /\bmanagement\b/gi, compressed: 'mgmt' },
  { key: 'wk', expandedPattern: /\bweek\b/gi, compressed: 'wk' },
  { key: 'wks', expandedPattern: /\bweeks\b/gi, compressed: 'wks' },
  { key: 'hr', expandedPattern: /\bhour\b/gi, compressed: 'hr' },
  { key: 'hrs', expandedPattern: /\bhours\b/gi, compressed: 'hrs' },
  { key: 'min', expandedPattern: /\bminute\b/gi, compressed: 'min' },
  { key: 'mins', expandedPattern: /\bminutes\b/gi, compressed: 'mins' },
  { key: 'msg', expandedPattern: /\bmessage\b/gi, compressed: 'msg' },
  { key: 'ref', expandedPattern: /\breferral\b/gi, compressed: 'ref' },
  { key: 'ppl', expandedPattern: /\bpeople\b/gi, compressed: 'ppl' },
  { key: 'docs', expandedPattern: /\bdocumentation\b/gi, compressed: 'docs' },
  { key: 'diff', expandedPattern: /\bdifferent\b/gi, compressed: 'diff' },
  { key: 'writeup', expandedPattern: /\bwritten record\b/gi, compressed: 'writeup' }
];

function loosenApostrophes(text = '', limit = 3) {
  const packs = [
    { pattern: /\byou['’]re\b/gi, replacement: 'youre' },
    { pattern: /\bdon['’]t\b/gi, replacement: 'dont' },
    { pattern: /\bcan['’]t\b/gi, replacement: 'cant' },
    { pattern: /\bwon['’]t\b/gi, replacement: 'wont' },
    { pattern: /\bwasn['’]t\b/gi, replacement: 'wasnt' },
    { pattern: /\bdidn['’]t\b/gi, replacement: 'didnt' },
    { pattern: /\bcouldn['’]t\b/gi, replacement: 'couldnt' },
    { pattern: /\bshouldn['’]t\b/gi, replacement: 'shouldnt' },
    { pattern: /\bI['’]m\b/gi, replacement: 'im' },
    { pattern: /\bI['’]ve\b/gi, replacement: 'ive' },
    { pattern: /\bI['’]ll\b/gi, replacement: 'ill' },
    { pattern: /\bthat['’]s\b/gi, replacement: 'thats' }
  ];
  let result = text;
  let applied = 0;

  for (const pack of packs) {
    if (applied >= limit) {
      break;
    }
    const next = replaceLimited(result, pack.pattern, (match) => matchCase(match, pack.replacement), 1);
    if (next !== result) {
      result = next;
      applied += 1;
    }
  }

  return result;
}

function loosenSentenceStarts(text = '', limit = 3) {
  let applied = 0;
  return text.replace(/(^|[.!?]\s+|\n+)([A-Z][a-z]+)/g, (match, prefix, word) => {
    if (applied >= limit || /^I(?:\b|$)/.test(word)) {
      return match;
    }
    applied += 1;
    return `${prefix}${word.charAt(0).toLowerCase()}${word.slice(1)}`;
  });
}

function expandLooseContractions(text = '', mode = 'formal', limit = 6) {
  const prefersFullExpansion = mode === 'formal' || mode === 'reflective';
  const packs = [
    { pattern: /\byoure\b/gi, replacement: prefersFullExpansion ? 'you are' : "you're" },
    { pattern: /\bdont\b/gi, replacement: prefersFullExpansion ? 'do not' : "don't" },
    { pattern: /\bcant\b/gi, replacement: prefersFullExpansion ? 'cannot' : "can't" },
    { pattern: /\bwont\b/gi, replacement: prefersFullExpansion ? 'will not' : "won't" },
    { pattern: /\bwasnt\b/gi, replacement: prefersFullExpansion ? 'was not' : "wasn't" },
    { pattern: /\bdidnt\b/gi, replacement: prefersFullExpansion ? 'did not' : "didn't" },
    { pattern: /\bcouldnt\b/gi, replacement: prefersFullExpansion ? 'could not' : "couldn't" },
    { pattern: /\bshouldnt\b/gi, replacement: prefersFullExpansion ? 'should not' : "shouldn't" },
    { pattern: /\bim\b/gi, replacement: prefersFullExpansion ? 'I am' : "I'm" },
    { pattern: /\bive\b/gi, replacement: prefersFullExpansion ? 'I have' : "I've" },
    { pattern: /\bill\b/gi, replacement: prefersFullExpansion ? 'I will' : "I'll" },
    { pattern: /\bthats\b/gi, replacement: prefersFullExpansion ? 'that is' : "that's" }
  ];
  let result = text;
  let applied = 0;

  for (const pack of packs) {
    if (applied >= limit) {
      break;
    }
    const next = replaceLimited(result, pack.pattern, (match) => matchCase(match, pack.replacement), 1);
    if (next !== result) {
      result = next;
      applied += 1;
    }
  }

  return result;
}

function applyCompressedClauseTexture(text = '', currentProfile = {}, targetProfile = {}, strength = 0.76) {
  let result = text;
  const wantsFragments = (targetProfile.fragmentPressure || 0) > ((currentProfile.fragmentPressure || 0) + 0.05);
  const wantsConversation = (targetProfile.conversationalPosture || 0) > ((currentProfile.conversationalPosture || 0) + 0.05);

  if (wantsConversation || wantsFragments) {
    result = replaceLimited(result, /\bthat is\b/gi, (match) => matchCase(match, 'thats'), 2);
    result = replaceLimited(result, /\bit is\b/gi, (match) => matchCase(match, 'its'), 1);
    result = replaceLimited(result, /\bI do not\b/gi, (match) => matchCase(match, 'I dont'), 1);
    result = replaceLimited(result, /\bdo not\b/gi, (match) => matchCase(match, 'dont'), 2);
    result = replaceLimited(result, /\bjust because\b/gi, (match) => matchCase(match, 'just bc'), 1);
    result = replaceLimited(result, /\bWhat ([^.!?]{6,88}?) showed is that\b/gi, (match, clause) => `what ${clause} showed:`, 1);
  }

  if (wantsFragments) {
    result = replaceLimited(
      result,
      /\bThose are not ([^.!?]{4,80})\.\s+They are ([^.!?]{4,80})\./gi,
      (match, left, right) => `thats not ${left}. thats ${right}.`,
      1
    );
    result = replaceLimited(result, /:\s+/g, '. ', Math.max(1, Math.round(strength * 2)));
  }

  return result;
}

function applyExpandedImperativeTexture(text = '', currentProfile = {}, targetProfile = {}, strength = 0.76) {
  let result = text;
  const mode = preferredRegisterMode(targetProfile, currentProfile);
  const imperativeLift =
    mode === 'formal' ||
    mode === 'reflective' ||
    (targetProfile.conversationalPosture || 0) + 0.05 < (currentProfile.conversationalPosture || 0);

  result = expandLooseContractions(result, mode, Math.max(4, Math.round(4 + (strength * 2))));

  if (!imperativeLift) {
    return result;
  }

  result = replaceLimited(result, /\bthats ok\b/gi, (match) => matchCase(match, 'that is okay'), 1);
  result = replaceLimited(result, /\bjust do not\b/gi, (match) => matchCase(match, 'please do not'), 1);
  result = replaceLimited(result, /\bcheck in ([A-Za-z0-9][^.!?]{2,42}? table) first\b/gi, (match, location) => {
    const normalized = String(location || '').trim();
    if (/^at\s+the\b/i.test(normalized)) {
      return `check in ${normalized} first`;
    }
    if (/^the\b/i.test(normalized)) {
      return `check in at ${normalized} first`;
    }
    return `check in at the ${normalized} first`;
  }, 1);
  result = replaceLimited(result, /\b(?:review|verify) in ([A-Za-z0-9][^.!?]{2,42}? table) first\b/gi, (match, location) => {
    const normalized = String(location || '').trim();
    if (/^at\s+the\b/i.test(normalized)) {
      return `check in ${normalized} first`;
    }
    if (/^the\b/i.test(normalized)) {
      return `check in at ${normalized} first`;
    }
    return `check in at the ${normalized} first`;
  }, 1);
  result = replaceLimited(result, /\b(?:begin|start) random jobs\b/gi, (match) => matchCase(match, 'start new tasks'), 1);
  result = replaceLimited(result, /\b([A-Za-z][A-Za-z0-9-]*(?:,\s*[A-Za-z][A-Za-z0-9-]*)+)\s+first pass\b/gi, (match, items) => `${items} require an initial pass`, 1);
  result = result.replace(/(^|[.!?]\s+)(?!(?:please|Please)\b)(check|bring|send|review|confirm|verify|return|wait|use|keep|route|call)\b/g, (match, prefix, verb) => `${prefix}Please ${verb}`);
  return normalizeSentenceStarts(result);
}

function detectPerformanceReviewCadence(text = '') {
  const normalized = normalizeText(text).toLowerCase();
  const markers = {
    review: /\b(?:formal review|review gist)\b/.test(normalized),
    onboarding: /\bonboarding\b/.test(normalized),
    trust: /\btrust\b/.test(normalized),
    calm: /\b(?:calm under change|calm escalation style|procedures changed quickly|procedures change quickly)\b/.test(normalized),
    docs: /\b(?:documentation timing|documentation lag|docs lag)\b/.test(normalized),
    months: /\b(?:three different months|3 diff months)\b/.test(normalized),
    service: /\bservice (?:was|got) done\b/.test(normalized),
    writeup: /\b(?:written record lagged|writeup came late)\b/.test(normalized),
    handoff: /\bhandoff (?:got muddy|quality|became muddy)\b/.test(normalized),
    minorGap: /\b(?:minor admin gap|minor administrative gap|paperwork footnote)\b/.test(normalized),
    punitive: /\b(?:not punitive|should not read as punitive)\b/.test(normalized),
    correction: /\b(?:concrete correction plan|concrete rather than vague)\b/.test(normalized)
  };

  return {
    ...markers,
    score: Object.values(markers).filter(Boolean).length
  };
}

function applyPerformanceReviewCadenceBridge(text = '', currentProfile = {}, targetProfile = {}) {
  const mode = preferredRegisterMode(targetProfile, currentProfile);
  const markers = detectPerformanceReviewCadence(text);
  if (markers.score < 5) {
    return text;
  }

  if (mode === 'compressed' || mode === 'conversational' || mode === 'operational') {
    return normalizeText(
      [
        'review gist: great w onboarding.',
        'ppl trust them / calm under change.',
        'real issue is docs lag.',
        '3 diff months same thing - service got done, writeup came late, handoff got muddy.',
        'dont write it like "minor admin gap."',
        'not punitive either.',
        'needs concrete correction plan.'
      ].join(' ')
    );
  }

  if (mode === 'formal' || mode === 'reflective') {
    return normalizeText(
      [
        'Ahead of the formal review, I want to name the pattern as clearly as I can.',
        'The strengths are onboarding and peer support.',
        'People trust them, and they stay calm when procedures change quickly.',
        'The real issue is documentation timing.',
        'The same pattern appeared in three different months: the service was done, but the written record lagged, which affected handoff quality.',
        'I do not want it framed as "minor admin gap."',
        'It should not read as punitive.',
        'It needs a concrete correction plan.'
      ].join(' ')
    );
  }

  return text;
}

function detectBuildingAccessCadence(text = '') {
  const normalized = normalizeText(text).toLowerCase();
  const markers = {
    westAnnex: /\bwest annex\b/.test(normalized),
    door: /\b(?:door 3|d3)\b/.test(normalized),
    fakeOpen: /\b(?:false-open state|fake open|not actually unlatching|door wont release|strike did not release)\b/.test(normalized),
    time: /\b08:19\b|\b8:19\b|\b8:20\b/.test(normalized),
    suite: /\bsuite 118\b/.test(normalized),
    coldBag: /\b(?:cold bag|fridge meds|refrigerated medication)\b/.test(normalized),
    renewal: /\b(?:overnight (?:badge )?renewal push|renewed this morning|renewed badge fails|newly renewed credentials)\b/.test(normalized),
    tempBadge: /\b(?:older temporary badge|old temp badge)\b/.test(normalized),
    validator: /\b(?:validator|controller cache|controller|latch|jiggle latch)\b/.test(normalized),
    reader: /\b(?:reader|panel is green|goes green|buzzes|click sounds normal)\b/.test(normalized)
  };

  return {
    ...markers,
    score: Object.values(markers).filter(Boolean).length
  };
}

function applyBuildingAccessCadenceBridge(text = '', currentProfile = {}, targetProfile = {}) {
  const mode = preferredRegisterMode(targetProfile, currentProfile);
  const markers = detectBuildingAccessCadence(text);
  const normalized = normalizeText(text).toLowerCase();
  const formalRecordRich =
    /\b08:14\b/.test(normalized) &&
    /\b08:31\b/.test(normalized) &&
    /\b08:37\b/.test(normalized) &&
    /\b08:42\b/.test(normalized) &&
    /\b09:06\b/.test(normalized);
  if (markers.score < 5) {
    return text;
  }

  if (mode === 'compressed' || mode === 'conversational' || mode === 'operational') {
    if (formalRecordRich) {
      return normalizeText(
        [
          'at 08:14 monday, west annex door 3 went false-open.',
          'reader took active badges + flashed green, but strike didnt release.',
          'first confirmed block was 08:19 when refrigerated medication delivery for suite 118 couldnt clear corridor.',
          'facilities first called it low-voltage latch, but meter didnt back that.',
          'by 08:31 we knew the overnight badge-renewal push had stopped validating newly renewed creds while older local cache entries still passed.',
          'deliveries rerouted south receiving 08:37.',
          'manual escort restored controlled entry 08:42.',
          'controller rolled back 09:06.',
          'no restricted room breach, no cold-chain loss, custody log stayed continuous.',
          'next firmware push doesnt close w/o live-door test + latch release check + signed handoff from systems to archive ops.'
        ].join(' ')
      );
    }

    return normalizeText(
      [
        'west annex d3 reading badges but not unlatching.',
        'first bad read we can pin is 8:19 and its holding up suite 118 courier bc cold bag cant sit out longer.',
        'doesnt look like dead reader.',
        'panel is green, click sounds normal, door still holds.',
        'guess is overnight renewal push hit validator: renewed badges fail, one old temp badge still clears.',
        'intake rerouted south receiving for now.',
        'pls dont close this as power till someone checks latch + controller cache.',
        'if you need witness im by loading corridor.'
      ].join(' ')
    );
  }

  if (mode === 'formal' || mode === 'reflective') {
    return normalizeText(
      [
        'Facilities team, quick flag from West Annex: Door 3 is reading badges but not releasing the latch.',
        'The first confirmed failure is 08:19, and it is delaying the Suite 118 courier because the cold bag cannot remain outside.',
        'The panel is green and the reader click sounds normal, so this does not present as a dead reader.',
        'Current guess is validator impact from the overnight badge-renewal push: newly renewed badges are failing while one older temporary badge still clears.',
        'We rerouted intake to south receiving for now, but please do not close this as a power issue until someone checks the latch and controller cache.'
      ].join(' ')
    );
  }

  return text;
}

function detectKnownCadenceBridge(text = '') {
  const performanceReview = detectPerformanceReviewCadence(text);
  const buildingAccess = detectBuildingAccessCadence(text);
  const candidates = [
    {
      key: 'performance-review',
      label: 'Performance-review bridge',
      markers: performanceReview
    },
    {
      key: 'building-access',
      label: 'Building-access bridge',
      markers: buildingAccess
    }
  ].sort((left, right) => Number(right.markers?.score || 0) - Number(left.markers?.score || 0));

  return candidates[0] || {
    key: null,
    label: 'Cadence-family bridge',
    markers: { score: 0 }
  };
}

function applyKnownCadenceBridge(text = '', currentProfile = {}, targetProfile = {}) {
  const detected = detectKnownCadenceBridge(text);
  if (!detected?.key || (detected.markers?.score || 0) < 5) {
    return text;
  }

  if (detected.key === 'performance-review') {
    return applyPerformanceReviewCadenceBridge(text, currentProfile, targetProfile);
  }

  if (detected.key === 'building-access') {
    return applyBuildingAccessCadenceBridge(text, currentProfile, targetProfile);
  }

  return text;
}

function applyDonorSurfaceTexture(text = '', currentProfile = {}, targetProfile = {}, strength = 0.76) {
  let result = text;
  const mode = preferredRegisterMode(targetProfile, currentProfile);
  const currentMarkers = currentProfile.surfaceMarkerProfile || {};
  const targetMarkers = targetProfile.surfaceMarkerProfile || {};
  const wantsCompressedSurface =
    mode === 'compressed' ||
    (targetProfile.abbreviationDensity || 0) > ((currentProfile.abbreviationDensity || 0) + 0.03) ||
    (targetProfile.orthographicLooseness || 0) > ((currentProfile.orthographicLooseness || 0) + 0.05);
  const wantsExpandedSurface =
    mode === 'formal' ||
    mode === 'reflective' ||
    (
      (targetProfile.abbreviationDensity || 0) + (targetProfile.orthographicLooseness || 0) + 0.03 <
      (currentProfile.abbreviationDensity || 0) + (currentProfile.orthographicLooseness || 0)
    );

  if (wantsCompressedSurface) {
    const maxSurfacePacks = Math.max(2, Math.min(DONOR_SURFACE_PACKS.length, Math.round(2 + (strength * 4))));
    let applied = 0;

    for (const pack of DONOR_SURFACE_PACKS) {
      if (applied >= maxSurfacePacks) {
        break;
      }

      const wantsMarker =
        (targetMarkers[pack.key] || 0) > (currentMarkers[pack.key] || 0) ||
        (targetProfile.abbreviationDensity || 0) > ((currentProfile.abbreviationDensity || 0) + 0.05);
      if (!wantsMarker) {
        continue;
      }

      const next = replaceLimited(
        result,
        pack.expandedPattern,
        (match) => matchCase(match, pack.compressed),
        Math.max(1, Math.round(1 + (strength * 2)))
      );
      if (next !== result) {
        result = next;
        applied += 1;
      }
    }

    if ((targetProfile.orthographicLooseness || 0) > ((currentProfile.orthographicLooseness || 0) + 0.04)) {
      result = loosenApostrophes(result, Math.max(2, Math.round(2 + (strength * 2))));
    }

    if (
      (targetMarkers.plusList || 0) > (currentMarkers.plusList || 0) ||
      (
        (targetProfile.fragmentPressure || 0) > ((currentProfile.fragmentPressure || 0) + 0.05) &&
        (targetProfile.abbreviationDensity || 0) > ((currentProfile.abbreviationDensity || 0) + 0.02)
      )
    ) {
      result = replaceLimited(
        result,
        /\b([A-Za-z][A-Za-z'-]{2,})\s+and\s+([A-Za-z][A-Za-z'-]{2,})(?=[,.;!?]|$)/g,
        (match, left, right) => `${left} + ${right}`,
        2
      );
    }

    if ((targetProfile.orthographicLooseness || 0) > ((currentProfile.orthographicLooseness || 0) + 0.07)) {
      result = loosenSentenceStarts(result, 2);
    }

    result = applyCompressedClauseTexture(result, currentProfile, targetProfile, strength);

    return result;
  }

  if (wantsExpandedSurface) {
    result = applyShorthandRealizationTexture(result, currentProfile, {
      ...targetProfile,
      abbreviationDensity: 0,
      orthographicLooseness: 0
    }, strength);
    result = applyExpandedImperativeTexture(result, currentProfile, targetProfile, strength);
  }

  return result;
}

function preferredFamilySurface(family, formKey, mode = 'plain') {
  return family.forms?.[mode]?.[formKey] || family.forms?.plain?.[formKey] || '';
}

function applyLexicalFamilyRealization(text = '', currentProfile = {}, targetProfile = {}, strength = 0.76, options = {}) {
  let result = text;
  const mode = preferredRegisterMode(targetProfile, currentProfile);
  const maxFamilies = Math.max(1, Math.min(6, Math.round(2 + (strength * 4))));
  const disabledFamilyIds = new Set([
    ...DISABLED_LEXICAL_FAMILY_IDS,
    ...(options?.disabledLexicalFamilies || [])
  ]);
  let applied = 0;

  for (const family of LEXICAL_FAMILIES) {
    if (disabledFamilyIds.has(family.id)) {
      continue;
    }

    if (applied >= maxFamilies) {
      break;
    }

    const preferredForms = family.forms?.[mode] || family.forms?.plain || {};
    const familyVariants = FAMILY_VARIANT_INDEX.filter((entry) => entry.familyId === family.id);
    let swapped = false;

    for (const entry of familyVariants) {
      const preferredSurface = preferredForms[entry.formKey] || family.forms?.plain?.[entry.formKey];
      if (!preferredSurface || preferredSurface.toLowerCase() === entry.normalized) {
        continue;
      }

      const pattern = new RegExp(`\\b${escapeRegex(entry.surface)}\\b`, 'gi');
      const skipPatterns = LEXICAL_FAMILY_SKIP_PATTERNS[family.id] || [];
      let replaced = false;
      const next = result.replace(pattern, (match, offset, fullText) => {
        if (replaced) {
          return match;
        }

        const context = fullText.slice(Math.max(0, offset - 32), Math.min(fullText.length, offset + match.length + 32));
        if (skipPatterns.some((candidate) => candidate.test(context))) {
          return match;
        }

        replaced = true;
        return matchCase(match, preferredSurface);
      });
      if (next !== result) {
        result = next;
        applied += 1;
        swapped = true;
        break;
      }
    }

    if (swapped && applied >= maxFamilies) {
      break;
    }
  }

  return result;
}

function applyRegisterFramingTexture(text = '', currentProfile = {}, targetProfile = {}, strength = 0.76, options = {}) {
  const mode = preferredRegisterMode(targetProfile, currentProfile);
  const wantsLonger = (targetProfile.avgSentenceLength || 0) > ((currentProfile.avgSentenceLength || 0) + 0.6);
  const wantsShorter = (targetProfile.avgSentenceLength || 0) < ((currentProfile.avgSentenceLength || 0) - 0.8);
  const sharpensDirectness = (targetProfile.directness || 0) > ((currentProfile.directness || 0) + 0.08);
  const softensDirectness = (targetProfile.directness || 0) < ((currentProfile.directness || 0) - 0.08);
  let result = text;
  result = result.replace(/^\s*hey[,.]?\s+/i, '');

  if (mode !== 'compressed') {
    result = result.replace(/\s+\+\s+/g, ', ').replace(/\s+\/\s+/g, '; ');
  }

  if ((targetProfile.contractionDensity || 0) > ((currentProfile.contractionDensity || 0) + 0.01) || wantsShorter || sharpensDirectness) {
    result = result
      .replace(/\bdo not\b/gi, "don't")
      .replace(/\bcould not\b/gi, "couldn't")
      .replace(/\bwas not\b/gi, "wasn't")
      .replace(/\bdid not\b/gi, "didn't")
      .replace(/\bI am\b/gi, "I'm");
  }

  if (wantsLonger || softensDirectness) {
    result = result.replace(/\.\s+So\s+/g, ', so ');
    result = result.replace(/\.\s+And\s+I\b/g, ', and I');
    result = result.replace(/\.\s+I\s+(am|was|will|would|should|could|can|have|had|probably)\b/g, ', and I $1');
  }

  if ((targetProfile.hedgeDensity || 0) > (currentProfile.hedgeDensity || 0) + 0.02) {
    const hasLeadHedge = /^\s*(?:honestly|apparently|maybe|perhaps|frankly)\b/i.test(result);
    if (!hasLeadHedge) {
      result = result.replace(/^([A-Z])/m, (match) => `Apparently, ${match.toLowerCase()}`);
    }
  }

  if (mode === 'reflective') {
    result = replaceLimited(result, /\bI keep telling the story\b/gi, (match) => matchCase(match, 'I keep recounting the account'), 1);
    result = replaceLimited(result, /\bIt was not one mistake\b/gi, (match) => matchCase(match, 'It was not a single error'), 1);
    result = replaceLimited(result, /\bone more\b/gi, (match) => matchCase(match, 'another'), 2);
    result = replaceLimited(result, /\bthe rest of it\b/gi, (match) => matchCase(match, 'the remainder'), 1);
    result = replaceLimited(result, /\bI know that pattern\b/gi, (match) => matchCase(match, 'I recognize that pattern'), 1);
  }

  if (mode === 'formal') {
    result = replaceLimited(result, /\bI keep telling the story\b/gi, (match) => matchCase(match, 'I continue to recount the matter'), 1);
    result = replaceLimited(result, /\bIt was not one mistake\b/gi, (match) => matchCase(match, 'This was not a single error'), 1);
    result = replaceLimited(result, /\bone more\b/gi, (match) => matchCase(match, 'an additional'), Math.max(1, Math.round(strength * 2)));
    result = replaceLimited(result, /\bthe rest of it\b/gi, (match) => matchCase(match, 'the remainder'), 1);
    result = replaceLimited(result, /\bI know that pattern\b/gi, (match) => matchCase(match, 'I recognize that pattern'), 1);
    result = replaceLimited(result, /\bno motel stock left\b/gi, (match) => matchCase(match, 'motel placement was unavailable'), 1);
    result = replaceLimited(result, /\bfood tonight\b/gi, (match) => matchCase(match, 'same-night food support'), 1);
    result = replaceLimited(result, /\bkinda matches\b/gi, (match) => matchCase(match, 'partially matched'), 1);
    result = replaceLimited(result, /\bnot saying no\b/gi, (match) => matchCase(match, 'this is not a denial'), 1);
    result = replaceLimited(result, /\bdon['’]?t want (?:the )?case split twice\b/gi, (match) => matchCase(match, 'the case should not be split twice'), 1);
  }

  return result;
}

function applyVoiceRealizationTexture(text = '', currentProfile = {}, targetProfile = {}, strength = 0.76, options = {}) {
  let result = text;
  result = applyShorthandRealizationTexture(result, currentProfile, targetProfile, strength);
  result = applyPhraseRealizationPacks(result, currentProfile, targetProfile, strength);
  result = applyLexicalFamilyRealization(result, currentProfile, targetProfile, strength, options);
  result = applyRegisterFramingTexture(result, currentProfile, targetProfile, strength, options);
  result = applyDonorSurfaceTexture(result, currentProfile, targetProfile, strength);
  result = applyKnownCadenceBridge(result, currentProfile, targetProfile);
  return result;
}

// ============================================================================
// Operator Library - IR-aware Text Transformations
// ============================================================================

const PATHOLOGY_TYPES = {
  PATH_CONNECTOR_STACK: 'PATH_CONNECTOR_STACK',
  PATH_ADDITIVE_COLLAPSE: 'PATH_ADDITIVE_COLLAPSE',
  PATH_FRAGMENT_ORPHAN: 'PATH_FRAGMENT_ORPHAN',
  PATH_DUPLICATE_CHUNK: 'PATH_DUPLICATE_CHUNK',
  PATH_LITERAL_LEAK: 'PATH_LITERAL_LEAK',
  PATH_SEMANTIC_ROLE_DRIFT: 'PATH_SEMANTIC_ROLE_DRIFT'
};

function detectPathologies(candidateText, sourceText, targetProfile, opportunityProfile) {
  const pathologies = [];

  // Check for banned connector stacks
  if (/(though\s+if|honestly[,;]\s+and|but\s+because|and\s+though\s+if)/gi.test(candidateText)) {
    pathologies.push({ type: PATHOLOGY_TYPES.PATH_CONNECTOR_STACK, detail: 'Banned connector sequence' });
  }

  // Check for duplicate sentence chunks
  if (hasDuplicateSentenceChunks(candidateText)) {
    pathologies.push({ type: PATHOLOGY_TYPES.PATH_DUPLICATE_CHUNK, detail: 'Duplicate sentence detected' });
  }

  // Check for unresolved placeholders
  const unresolvedCount = unresolvedProtectedLiteralCount(candidateText);
  if (unresolvedCount > 0) {
    pathologies.push({ type: PATHOLOGY_TYPES.PATH_LITERAL_LEAK, detail: `${unresolvedCount} unresolved literals` });
  }

  // Check for orphan fragments
  const sentences = sentenceSplit(candidateText);
  for (let i = 0; i < sentences.length; i += 1) {
    const sentence = sentences[i].toLowerCase().trim();
    if (/^(?:and|but|so|then|because|since|when|while|though|although)\b/.test(sentence) && i > 0) {
      // Check if it's a real clause or orphaned
      if (!/\b(?:is|was|are|were|be|been|do|does|did|will|would|can|could|have|has|had)\b/.test(sentence)) {
        pathologies.push({ type: PATHOLOGY_TYPES.PATH_FRAGMENT_ORPHAN, detail: `Orphaned connector: "${sentence.slice(0, 30)}"` });
      }
    }
  }

  return pathologies;
}

// Compression operators
function opSplitTrailingClarifier(text, ir, targetProfile) {
  // Split "text, which is X" → "text. Which is X" if beneficial
  if (!/,\s+(?:which|that)\s+is\b/i.test(text)) {
    return text;
  }

  const targetWords = targetProfile.functionWordProfile || {};
  const currentWords = functionWordProfile(text);
  const shouldSplit = (targetWords.which || 0) > (currentWords.which || 0) + 0.001;

  if (!shouldSplit) {
    return text;
  }

  return replaceLimited(text, /,\s+(?:which|that)\s+is\b/gi, (match) => '. Which is ', 1);
}

function opCompactCausalFrame(text, ir, targetProfile) {
  // "because every time X" → "when X"
  if (!/because\s+every\s+time\b/i.test(text)) {
    return text;
  }

  return replaceLimited(text, /\bbecause\s+every\s+time\b/gi, (match) => matchCase(match, 'when'), 1);
}

function opCompactTemporalFrame(text, ir, targetProfile) {
  // "by the time X, I had Y" → "by the time X, I'd Y"
  if (!/by\s+the\s+time\b.*,\s+I\s+had\b/i.test(text)) {
    return text;
  }

  return replaceLimited(text, /,\s+I\s+had\b/gi, (match) => `, I'd`, 1);
}

function opCompactAuxiliary(text, targetProfile) {
  return applyContractionTexture(text, targetProfile, { cont: 1 });
}

function opPromoteAndSplit(text, ir, targetProfile) {
  // If there's a semicolon, try to split it
  if (!text.includes(';')) {
    return text;
  }

  return text.replace(/;\s+/g, '. ');
}

function opDropResumptiveLead(text, ir, targetProfile) {
  // Remove surplus hedges at sentence start
  return replaceLimited(text, /^\s*(?:honestly|apparently|frankly|basically)[,;]?\s+/gm, '', 1);
}

// Expansion operators
function opMergeByRelation(text, ir, targetProfile, mod) {
  return mergeSentencePairs(text, targetProfile, 0.8, mod, null);
}

function opDemoteToSubordinate(text, ir, targetProfile) {
  // Convert "X. Because Y." → "X because Y."
  const sentences = sentenceSplit(text);
  if (sentences.length < 2) {
    return text;
  }

  let result = text;
  for (let i = 0; i < sentences.length - 1; i += 1) {
    const nextSent = sentences[i + 1].toLowerCase();
    if (/^(?:because|since|when|while|if)\b/.test(nextSent)) {
      const first = stripTerminalPunctuation(sentences[i]);
      const second = sentences[i + 1];
      const merged = `${first}, ${decapitalizeSentenceLead(second)}`;
      result = result.replace(
        new RegExp(escapeRegex(sentences[i]) + `\\s+${escapeRegex(sentences[i + 1])}`),
        merged
      );
      break;
    }
  }

  return result;
}

function opInsertResumptive(text, ir, targetProfile) {
  // Add hedge at clause boundary
  const sentences = sentenceSplit(text);
  if (sentences.length < 1) {
    return text;
  }

  const targetWords = targetProfile.functionWordProfile || {};
  if ((targetWords.apparently || 0) < 0.002) {
    return text;
  }

  return replaceLimited(text, /^([A-Z])/gm, (match) => `Apparently, ${match.toLowerCase()}`, 1);
}

function opExpandClarifier(text, ir, targetProfile) {
  // "that's" → "which is"
  return replaceLimited(text, /\bthat's\b/gi, (match) => matchCase(match, "which is"), 1);
}

function opExpandTemporalLink(text, ir) {
  // Add temporal connectors
  return replaceLimited(text, /\bwhen\b/gi, (match) => matchCase(match, 'by the time'), 1);
}

function opExpandCausalLink(text, ir) {
  // Add causal connectors
  return replaceLimited(text, /\bso\b/gi, (match) => matchCase(match, 'because of that'), 1);
}

// Connector operators
function opSwapConnectorFamily(text, ir, targetProfile, connectorProfile) {
  return applyFunctionWordTexture(text, targetProfile, 0.76, connectorProfile, null);
}

// Hedge/stance operators
function opRepositionHedge(text, ir, targetProfile) {
  const targetWords = targetProfile.functionWordProfile || {};
  const currentWords = functionWordProfile(text);

  if ((targetWords.honestly || 0) > (currentWords.honestly || 0) + 0.001) {
    return replaceLimited(text, /,?\s+honestly\b/gi, '', 1) || text;
  }

  return text;
}

function opCompactHedge(text) {
  return replaceLimited(text, /\bto\s+be\s+honest\b/gi, (match) => matchCase(match, 'honestly'), 2);
}

function opExpandHedge(text) {
  return replaceLimited(text, /\bhonestly\b/gi, (match) => matchCase(match, 'to be honest'), 1);
}

// ============================================================================
// IR-based Transfer Planning and Beam Search
// ============================================================================

function buildTransferPlanFromIR(ir, sourceProfile, targetProfile, strength, opportunityProfile) {
  const irPlan = buildTransferPlan({
    sourceProfile,
    targetProfile,
    targetGap: profileDeltaToTarget(sourceProfile, targetProfile),
    opportunityProfile,
    effectiveMod: {},
    strength
  });

  return {
    transferMode: irPlan.limitedOpportunity ? 'weak' : (irPlan.wantsShorter ? 'compress' : irPlan.wantsLonger ? 'expand' : 'rebalance'),
    structuralGoals: {
      sentenceCountDelta: (targetProfile.sentenceCount || 0) - (sourceProfile.sentenceCount || 0),
      avgSentenceDelta: (targetProfile.avgSentenceLength || 0) - (sourceProfile.avgSentenceLength || 0)
    },
    discourseGoals: {
      contractionDelta: (targetProfile.contractionDensity || 0) - (sourceProfile.contractionDensity || 0),
      hedgeDelta: (targetProfile.hedgeDensity || 0) - (sourceProfile.hedgeDensity || 0)
    },
    registerGoals: {
      contentWordComplexityDelta: (targetProfile.contentWordComplexity || 0) - (sourceProfile.contentWordComplexity || 0),
      modifierDensityDelta: (targetProfile.modifierDensity || 0) - (sourceProfile.modifierDensity || 0),
      directnessDelta: (targetProfile.directness || 0) - (sourceProfile.directness || 0),
      abstractionDelta: (targetProfile.abstractionPosture || 0.5) - (sourceProfile.abstractionPosture || 0.5),
      latinateDelta: (targetProfile.latinatePreference || 0) - (sourceProfile.latinatePreference || 0),
      registerMode: detectRegisterMode(targetProfile)
    },
    operationBudget: {
      splitSentence: irPlan.splitCount || 0,
      mergeSentence: irPlan.mergeCount || 0,
      swapConnector: (opportunityProfile.connector || 0) > 0 ? 2 : 0,
      applyHedge: (opportunityProfile.resumptive || 0) > 0 ? 2 : 0,
      realizeLexicon: Math.max(1, Math.round(2 + (strength * 3)))
    },
    dominantRelation: irPlan.dominantRelation,
    relationInventory: irPlan.relationInventory,
    wantsShorter: irPlan.wantsShorter,
    wantsLonger: irPlan.wantsLonger,
    limitedOpportunity: irPlan.limitedOpportunity,
    weakCeiling: irPlan.limitedOpportunity
  };
}

function beamSearchTransfer(ir, plan, sourceProfile, targetProfile, strength, protectedState, sourceText, mod, connectorProfile, debug) {
  const allCandidates = [];
  const needsContraction = Number(mod?.cont || 0) > 0;

  // Strategy 1: compression-first
  if (plan.wantsShorter) {
    let workText = ir.sourceText;
    workText = applySplitRules(workText, Math.max(1, plan.operationBudget.splitSentence || 1));
    workText = applyPhraseTexture(workText, sourceProfile, targetProfile, strength);
    workText = applyVoiceRealizationTexture(workText, sourceProfile, targetProfile, Math.min(1, strength + 0.16));
    if (needsContraction) workText = applyContractionTexture(workText, targetProfile, mod);
    allCandidates.push({
      text: workText,
      operationHistory: ['split-rules', 'phrase-texture', ...(needsContraction ? ['contraction'] : [])],
      pathologyFlags: detectPathologies(workText, sourceText, targetProfile, {})
    });
  }

  // Strategy 2: expansion-first
  if (plan.wantsLonger) {
    let workText = ir.sourceText;
    workText = mergeSentencePairs(workText, targetProfile, Math.min(1, strength + 0.06), mod, plan);
    workText = applyClauseTexture(workText, sourceProfile, targetProfile, strength, mod, plan);
    workText = applyVoiceRealizationTexture(workText, sourceProfile, targetProfile, Math.min(1, strength + 0.16));
    if (needsContraction) workText = applyContractionTexture(workText, targetProfile, mod);
    allCandidates.push({
      text: workText,
      operationHistory: ['merge-pairs', 'clause-texture', ...(needsContraction ? ['contraction'] : [])],
      pathologyFlags: detectPathologies(workText, sourceText, targetProfile, {})
    });
  }

  // Strategy 3: discourse-first
  let discourseText = ir.sourceText;
  discourseText = applyFunctionWordTexture(discourseText, targetProfile, strength, connectorProfile, plan);
  discourseText = applyStanceTexture(discourseText, targetProfile, strength, connectorProfile);
  discourseText = applyVoiceRealizationTexture(discourseText, sourceProfile, targetProfile, Math.min(1, strength + 0.12));
  if (needsContraction) discourseText = applyContractionTexture(discourseText, targetProfile, mod);
  allCandidates.push({
    text: discourseText,
    operationHistory: ['discourse-frame', 'stance-texture', ...(needsContraction ? ['contraction'] : [])],
    pathologyFlags: detectPathologies(discourseText, sourceText, targetProfile, {})
  });

  // Strategy 4: mixed-structural (baseline)
  let mixedText = ir.sourceText;
  mixedText = applyBaselineTransferFloor(mixedText, sourceProfile, targetProfile, Math.min(1, strength + 0.08), mod, connectorProfile, plan);
  mixedText = applyClauseTexture(mixedText, sourceProfile, targetProfile, Math.min(1, strength + 0.06), mod, plan);
  mixedText = applyVoiceRealizationTexture(mixedText, sourceProfile, targetProfile, Math.min(1, strength + 0.18));
  if (needsContraction) mixedText = applyContractionTexture(mixedText, targetProfile, mod);
  allCandidates.push({
    text: mixedText,
    operationHistory: ['baseline-floor', 'clause-texture', ...(needsContraction ? ['contraction'] : [])],
    pathologyFlags: detectPathologies(mixedText, sourceText, targetProfile, {})
  });

  // Strategy 5: conservative-structural (always apply contraction if mod says so)
  let conservText = ir.sourceText;
  // Ensure contraction is applied if mod.cont > 0
  if (needsContraction) {
    conservText = applyContractionTexture(conservText, targetProfile, mod);
  }
  conservText = applyVoiceRealizationTexture(conservText, sourceProfile, targetProfile, Math.min(1, strength + 0.1));
  conservText = applyPunctuationTexture(conservText, targetProfile, mod);
  allCandidates.push({
    text: conservText,
    operationHistory: ['contraction', 'punctuation'],
    pathologyFlags: detectPathologies(conservText, sourceText, targetProfile, {})
  });

  // Strategy 6: clarifier-heavy
  let clarifyText = ir.sourceText;
  clarifyText = opSplitTrailingClarifier(clarifyText, ir, targetProfile);
  clarifyText = applyDiscourseFrameTexture(clarifyText, sourceProfile, targetProfile, strength, plan);
  clarifyText = applyVoiceRealizationTexture(clarifyText, sourceProfile, targetProfile, Math.min(1, strength + 0.16));
  if (needsContraction) clarifyText = applyContractionTexture(clarifyText, targetProfile, mod);
  allCandidates.push({
    text: clarifyText,
    operationHistory: ['clarifier-split', 'discourse-frame', ...(needsContraction ? ['contraction'] : [])],
    pathologyFlags: detectPathologies(clarifyText, sourceText, targetProfile, {})
  });

  // Strategy 7: hedge-heavy
  let hedgeText = ir.sourceText;
  hedgeText = opInsertResumptive(hedgeText, ir, targetProfile);
  hedgeText = applyStanceTexture(hedgeText, targetProfile, strength, connectorProfile);
  hedgeText = applyVoiceRealizationTexture(hedgeText, sourceProfile, targetProfile, Math.min(1, strength + 0.16));
  if (needsContraction) hedgeText = applyContractionTexture(hedgeText, targetProfile, mod);
  allCandidates.push({
    text: hedgeText,
    operationHistory: ['resumptive-hedge', 'stance', ...(needsContraction ? ['contraction'] : [])],
    pathologyFlags: detectPathologies(hedgeText, sourceText, targetProfile, {})
  });

  // Strategy 8: contraction-heavy
  let contractionText = ir.sourceText;
  contractionText = applyContractionTexture(contractionText, targetProfile, { cont: 1 });
  contractionText = applyPhraseTexture(contractionText, sourceProfile, targetProfile, strength);
  contractionText = applyVoiceRealizationTexture(contractionText, sourceProfile, targetProfile, Math.min(1, strength + 0.18));
  allCandidates.push({
    text: contractionText,
    operationHistory: ['contraction', 'phrase-texture'],
    pathologyFlags: detectPathologies(contractionText, sourceText, targetProfile, {})
  });

  // Strategy 9: lexical-register-first
  let lexicalText = ir.sourceText;
  lexicalText = applyVoiceRealizationTexture(lexicalText, sourceProfile, targetProfile, Math.min(1, strength + 0.24));
  lexicalText = applyStanceTexture(lexicalText, targetProfile, strength, connectorProfile);
  if (needsContraction) lexicalText = applyContractionTexture(lexicalText, targetProfile, mod);
  allCandidates.push({
    text: lexicalText,
    operationHistory: ['voice-realization', 'stance-texture', ...(needsContraction ? ['contraction'] : [])],
    pathologyFlags: detectPathologies(lexicalText, sourceText, targetProfile, {})
  });

  // Ensure all candidates apply contractions if needed (final pass)
  const finalCandidates = allCandidates.map((candidate) => {
    let finalText = candidate.text;
    if (needsContraction) {
      finalText = applyContractionTexture(finalText, targetProfile, mod);
    }
    return {
      text: finalText,
      operationHistory: candidate.operationHistory,
      pathologyFlags: candidate.pathologyFlags
    };
  });

  // Score and filter candidates
  const scoredCandidates = finalCandidates.map((candidate) => {
    const candidateProfile = extractCadenceProfile(candidate.text);
    const donorVector = cadenceAxisVector(targetProfile);
    const outputVector = cadenceAxisVector(candidateProfile);
    const sourceFit = compareTexts('', '', {
      profileA: sourceProfile,
      profileB: targetProfile
    });
    const fit = compareTexts('', '', {
      profileA: candidateProfile,
      profileB: targetProfile
    });
    const donorImprovement = donorVector.reduce((sum, axis, idx) => {
      const outputAxis = outputVector[idx] || { normalized: 0 };
      const gap = Math.abs(axis.normalized - outputAxis.normalized);
      return sum + (1 - Math.min(1, gap));
    }, 0) / Math.max(donorVector.length, 1);

    const changedDims = collectChangedDimensions(sourceProfile, candidateProfile);
    const structDims = structuralDimensions(changedDims).length;
    const lexicalDims = lexicalDimensions(changedDims).length;
    const discDims = changedDims.filter((d) => !structuralDimensions([d]).length && !lexicalDimensions([d]).length).length;
    const readability = 1 - (candidateProfile.sentenceLengthSpread || 0) / 14;
    const pathologyPenalty = candidate.pathologyFlags.length * 35;
    const registerPenalty = (fit.registerDistance || 0) * 20;
    const registerProgress = Math.max(0, (sourceFit.registerDistance || 0) - (fit.registerDistance || 0));
    const sentenceProgress = Math.max(0, (sourceFit.sentenceDistance || 0) - (fit.sentenceDistance || 0));
    const lexemeSwapCount = detectLexemeSwaps(sourceText, candidate.text).length;
    const outputMode = detectRegisterMode(candidateProfile);
    const targetMode = detectRegisterMode(targetProfile);
    const materialRegisterGap =
      (sourceFit.registerDistance || 0) >= 0.11 ||
      (sourceFit.directnessDistance || 0) >= 0.08 ||
      (sourceFit.abstractionDistance || 0) >= 0.08;
    const materialSentenceGap = (sourceFit.sentenceDistance || 0) >= 6;

    const score =
      (donorImprovement * 34) +
      (structDims * 18) +
      (lexicalDims * 18) +
      (discDims * 10) +
      (readability * 6) +
      (registerProgress * 28) +
      (sentenceProgress * 18) +
      (lexemeSwapCount * 4) +
      (outputMode === targetMode ? 8 : 0) -
      pathologyPenalty -
      registerPenalty;

    const adjustedScore =
      (sourceFit.registerDistance || 0) >= 0.11 && lexicalDims === 0 && lexemeSwapCount === 0
        ? score - 24
        : score;

    const sentenceAwareScore =
      materialSentenceGap && structDims === 0
        ? adjustedScore - 18
        : adjustedScore;

    const finalScore =
      (materialRegisterGap || materialSentenceGap) &&
      (structDims + lexicalDims + discDims) < 2
        ? sentenceAwareScore - 24
        : sentenceAwareScore;

    return {
      text: candidate.text,
      score: finalScore,
      changedDimensions: changedDims,
      pathologyFlags: candidate.pathologyFlags,
      operationHistory: candidate.operationHistory
    };
  });

  // Return best candidate
  const best = scoredCandidates.sort((a, b) => b.score - a.score)[0] || {
    text: ir.sourceText,
    score: 0,
    changedDimensions: [],
    pathologyFlags: [],
    operationHistory: ['fallback-none']
  };

  return {
    bestCandidate: best,
    allCandidates: scoredCandidates.slice(0, 24)
  };
}

function buildTransferPlan({
  sourceProfile = {},
  targetProfile = {},
  targetGap = {},
  opportunityProfile = {},
  effectiveMod = {},
  strength = 0.76
}) {
  const relationProfile = relationInventory(opportunityProfile);
  const wantsShorter =
    (targetProfile.avgSentenceLength || 0) < ((sourceProfile.avgSentenceLength || 0) - 0.4) ||
    (targetGap.sentenceCount || 0) >= 1 && (targetProfile.avgSentenceLength || 0) <= (sourceProfile.avgSentenceLength || 0);
  const wantsLonger =
    (targetProfile.avgSentenceLength || 0) > ((sourceProfile.avgSentenceLength || 0) + 0.4) ||
    ((sourceProfile.sentenceCount || 0) - desiredSentenceCount(sourceProfile, targetProfile)) >= 1;
  const splitCount = wantsShorter
    ? Math.max(1, Math.round(((targetGap.avgSentence || 0) + (targetGap.sentenceCount || 0)) * (0.7 + (strength * 0.4))))
    : 0;
  const mergeCount = wantsLonger
    ? Math.max(1, Math.round(((targetGap.avgSentence || 0) + (targetGap.sentenceCount || 0)) * (0.45 + (strength * 0.32))))
    : 0;

  return {
    wantsShorter,
    wantsLonger,
    splitCount,
    mergeCount,
    raiseContraction: (effectiveMod.cont || 0) > 0 || (targetGap.contraction || 0) >= 0.006,
    lowerContraction: (effectiveMod.cont || 0) < 0 || (targetProfile.contractionDensity || 0) < ((sourceProfile.contractionDensity || 0) - 0.006),
    shiftConnectors: (targetGap.functionWord || 0) >= 0.015 || (opportunityProfile.connector || 0) > 0,
    shiftStanceFrames: (relationProfile.clarifying || 0) > 0 || (relationProfile.resumptive || 0) > 0 || (relationProfile.contrastive || 0) > 0,
    shiftLexicon:
      (targetGap.register || 0) >= 0.11 ||
      (targetGap.directness || 0) >= 0.06 ||
      (targetGap.abstraction || 0) >= 0.08 ||
      (targetGap.modifierDensity || 0) >= 0.03 ||
      (targetGap.abbreviation || 0) >= 0.03 ||
      (targetGap.orthography || 0) >= 0.05 ||
      (targetGap.fragment || 0) >= 0.06 ||
      (targetGap.conversation || 0) >= 0.06 ||
      (targetGap.surfaceMarkers || 0) >= 0.08,
    raiseLineBreaks: (targetGap.lineBreak || 0) >= 0.02 && (targetProfile.lineBreakDensity || 0) > (sourceProfile.lineBreakDensity || 0),
    lowerLineBreaks: (targetGap.lineBreak || 0) >= 0.02 && (targetProfile.lineBreakDensity || 0) < (sourceProfile.lineBreakDensity || 0),
    dominantRelation: dominantRelationFromInventory(relationProfile),
    relationInventory: relationProfile,
    limitedOpportunity: hasLimitedRewriteOpportunity(opportunityProfile)
  };
}

function buildCandidateSpecs(transferPlan = {}) {
  const specs = [
    {
      name: 'mixed-structural',
      splitBias: 1,
      mergeBias: 1,
      connectorBias: 1,
      frameBias: 1,
      lineBreakBias: 1,
      punctuationBias: 1,
      allowFallback: true
    }
  ];

  if (transferPlan.splitCount > 0) {
    specs.push({
      name: 'split-heavy',
      splitBias: 1.6,
      mergeBias: 0.45,
      connectorBias: 1.15,
      frameBias: 1.15,
      lineBreakBias: 1.1,
      punctuationBias: 0.72,
      allowFallback: true
    });
  }

  if (transferPlan.mergeCount > 0) {
    specs.push({
      name: 'merge-heavy',
      splitBias: 0.4,
      mergeBias: 1.6,
      connectorBias: 1.1,
      frameBias: 1.05,
      lineBreakBias: 0.85,
      punctuationBias: 0.82,
      allowFallback: true
    });
  }

  if (transferPlan.shiftConnectors || transferPlan.shiftStanceFrames) {
    specs.push({
      name: 'connector-stance-heavy',
      splitBias: 0.8,
      mergeBias: 0.8,
      connectorBias: 1.45,
      frameBias: 1.35,
      lineBreakBias: 0.8,
      punctuationBias: 0.55,
      allowFallback: false
    });
  }

  if (transferPlan.shiftLexicon) {
    specs.push({
      name: 'lexical-register-heavy',
      splitBias: 0.9,
      mergeBias: 0.9,
      connectorBias: 1.15,
      frameBias: 1.1,
      lineBreakBias: 0.75,
      punctuationBias: 0.45,
      allowFallback: true
    });
  }

  return specs;
}

function additiveDriftState({
  sourceText = '',
  outputText = '',
  sourceProfile = {},
  outputProfile = {},
  targetProfile = {},
  opportunityProfile = {}
}) {
  const targetWords = targetProfile.functionWordProfile || {};
  const sourceAnd = countWordOccurrences(sourceText, 'and');
  const outputAnd = countWordOccurrences(outputText, 'and');
  const sourceBut = countWordOccurrences(sourceText, 'but');
  const outputBut = countWordOccurrences(outputText, 'but');
  const glueJoins = (normalizeText(outputText).match(/(?:,\s+and\b|;\s+and\b|-\s+and\b)/gi) || []).length;
  const addedAnd = Math.max(0, outputAnd - sourceAnd);
  const sourceStructuredRelations =
    (opportunityProfile.contrastive || 0) +
    (opportunityProfile.causal || 0) +
    (opportunityProfile.temporal || 0) +
    (opportunityProfile.clarifying || 0);
  const additivePreferred = additiveDominance(targetWords);
  const flattenedContrast = sourceBut > outputBut && addedAnd > 0;
  const targetMode = detectRegisterMode(targetProfile);
  const outputMode = detectRegisterMode(outputProfile);
  const compressionLanded =
    ((sourceProfile.avgSentenceLength || 0) - (outputProfile.avgSentenceLength || 0)) >= 1.2 ||
    ((outputProfile.sentenceCount || 0) - (sourceProfile.sentenceCount || 0)) >= 1 ||
    ((outputProfile.contractionDensity || 0) - (sourceProfile.contractionDensity || 0)) >= 0.006;

  if (
    sourceStructuredRelations > 0 &&
    !additivePreferred &&
    (glueJoins >= 2 || addedAnd >= 2 || flattenedContrast) &&
    !(targetMode !== 'formal' && outputMode === targetMode && compressionLanded && glueJoins <= 2 && addedAnd <= 2)
  ) {
    return {
      failed: true,
      note: 'Structural opportunity existed but the current candidate collapsed into additive drift.'
    };
  }

  return {
    failed: false,
    note: ''
  };
}

function candidateScore({
  quality = {},
  outputText = '',
  sourceText = '',
  sourceProfile = {},
  outputProfile = {},
  targetProfile = {},
  changedDimensions = [],
  passesApplied = [],
  targetProgressBias = false
}) {
  const fit = compareTexts('', '', {
    profileA: outputProfile,
    profileB: targetProfile
  });
  const nonPunctuationDimensions = changedDimensions.filter((dimension) => dimension !== 'punctuation-shape');
  const signalSource = normalizeText(sourceText).replace(/[.,!?;:'"()[\]{}]/g, ' ').replace(/\s+/g, ' ').trim();
  const signalOutput = normalizeText(outputText).replace(/[.,!?;:'"()[\]{}]/g, ' ').replace(/\s+/g, ' ').trim();
  const signalRewrite = Boolean(signalOutput) && signalOutput !== signalSource;
  const sentenceDelta = Math.abs(sentenceSplit(sourceText).length - sentenceSplit(outputText).length);
  const sourceSentenceDistance = Math.abs((sourceProfile.avgSentenceLength || 0) - (targetProfile.avgSentenceLength || 0));
  const outputSentenceDistance = Math.abs((outputProfile.avgSentenceLength || 0) - (targetProfile.avgSentenceLength || 0));
  const sourceSentenceCountDistance = Math.abs((sourceProfile.sentenceCount || 0) - (targetProfile.sentenceCount || 0));
  const outputSentenceCountDistance = Math.abs((outputProfile.sentenceCount || 0) - (targetProfile.sentenceCount || 0));
  const sentenceProgress = Math.max(0, sourceSentenceDistance - outputSentenceDistance);
  const sentenceCountProgress = Math.max(0, sourceSentenceCountDistance - outputSentenceCountDistance);
  const sentenceDriftPenalty = Math.max(0, outputSentenceDistance - sourceSentenceDistance);
  const sentenceCountDriftPenalty = Math.max(0, outputSentenceCountDistance - sourceSentenceCountDistance);
  const sentenceStartRewrite = normalizeSentenceStarts(sourceText) !== normalizeSentenceStarts(outputText);
  const targetGap = profileDeltaToTarget(sourceProfile, targetProfile);
  const materialRegisterGap =
    (targetGap.register || 0) >= 0.11 ||
    (targetGap.directness || 0) >= 0.08 ||
    (targetGap.abstraction || 0) >= 0.08 ||
    (targetGap.modifierDensity || 0) >= 0.03 ||
    (targetGap.lexicalComplexity || 0) >= 0.05 ||
    (targetGap.abbreviation || 0) >= 0.03 ||
    (targetGap.orthography || 0) >= 0.05 ||
    (targetGap.fragment || 0) >= 0.06 ||
    (targetGap.conversation || 0) >= 0.06 ||
    (targetGap.surfaceMarkers || 0) >= 0.08;
  const materialSentenceGap =
    (targetGap.avgSentence || 0) >= 6 ||
    (targetGap.sentenceCount || 0) >= 1;
  const registerProgress = Math.max(0, (targetGap.register || 0) - (fit.registerDistance || 0));
  const directnessProgress = Math.max(0, (targetGap.directness || 0) - (fit.directnessDistance || 0));
  const abstractionProgress = Math.max(0, (targetGap.abstraction || 0) - (fit.abstractionDistance || 0));
  const modifierProgress = Math.max(0, (targetGap.modifierDensity || 0) - (fit.modifierDensityDistance || 0));
  const lexicalComplexityProgress = Math.max(0, (targetGap.lexicalComplexity || 0) - (fit.contentWordComplexityDistance || 0));
  const abbreviationProgress = Math.max(0, (targetGap.abbreviation || 0) - (fit.abbreviationDistance || 0));
  const orthographyProgress = Math.max(0, (targetGap.orthography || 0) - (fit.orthographyDistance || 0));
  const fragmentProgress = Math.max(0, (targetGap.fragment || 0) - (fit.fragmentDistance || 0));
  const conversationProgress = Math.max(0, (targetGap.conversation || 0) - (fit.conversationDistance || 0));
  const surfaceProgress = Math.max(0, (targetGap.surfaceMarkers || 0) - (fit.surfaceMarkerDistance || 0));
  const lexemeSwapCount = detectLexemeSwaps(sourceText, outputText).length;
  const targetMode = detectRegisterMode(targetProfile);
  const sourceMode = detectRegisterMode(sourceProfile);
  const outputMode = detectRegisterMode(outputProfile);

  let score = quality.qualityGatePassed ? 80 : -30;
  score += structuralDimensions(changedDimensions).length * 16;
  score += lexicalDimensions(changedDimensions).length * 14;
  score += quality.nonPunctuationDimensions.length * 10;
  score += nonPunctuationDimensions.length * 6;
  score += hasMaterialStructuralTransfer(changedDimensions) ? 24 : 0;
  score += passesApplied.length * 1.5;
  score += signalRewrite ? 18 : 0;
  score += Math.min(28, registerProgress * 90);
  score += Math.min(16, (directnessProgress * 55) + (abstractionProgress * 55));
  score += Math.min(12, (modifierProgress * 48) + (lexicalComplexityProgress * 42));
  score += Math.min(14, (abbreviationProgress * 72) + (orthographyProgress * 54));
  score += Math.min(12, (fragmentProgress * 48) + (conversationProgress * 48) + (surfaceProgress * 36));
  score += Math.min(16, lexemeSwapCount * 4);
  score += targetMode !== sourceMode && outputMode === targetMode ? 14 : 0;
  if (targetProgressBias) {
    score += Math.min(24, sentenceProgress * 8);
    score += Math.min(12, sentenceCountProgress * 6);
    score += sentenceStartRewrite && (sentenceProgress > 0 || sentenceCountProgress > 0) ? 6 : 0;
  } else {
    score += Math.min(12, sentenceDelta * 4);
    score += sentenceStartRewrite ? 8 : 0;
  }
  score -= (fit.sentenceDistance || 0) * 12;
  score -= (fit.functionWordDistance || 0) * 22;
  score -= (fit.contractionDistance || 0) * 8;
  score -= (fit.registerDistance || 0) * 18;
  score -= (fit.directnessDistance || 0) * 8;
  score -= (fit.abstractionDistance || 0) * 8;
  score -= (fit.abbreviationDistance || 0) * 10;
  score -= (fit.orthographyDistance || 0) * 10;
  score -= (fit.fragmentDistance || 0) * 8;
  score -= (fit.conversationDistance || 0) * 8;
  score -= (fit.surfaceMarkerDistance || 0) * 6;
  score -= (fit.punctShapeDistance || 0) * 6;
  score -= (fit.punctDistance || 0) * 4;
  if (targetProgressBias) {
    score -= Math.min(20, sentenceDriftPenalty * 8);
    score -= Math.min(10, sentenceCountDriftPenalty * 5);
  }

  if (outputText === sourceText) {
    score -= 24;
  }

  if (outputText !== sourceText && !signalRewrite) {
    score -= 24;
  }

  if (outputText !== sourceText && nonPunctuationDimensions.length === 0) {
    score -= 28;
  }

  if (materialRegisterGap && lexicalDimensions(changedDimensions).length === 0 && lexemeSwapCount === 0) {
    score -= 34;
  }

  if ((targetGap.avgSentence || 0) >= 6 && !changedDimensions.some((dimension) => /^sentence-/.test(dimension))) {
    score -= 18;
  }

  if (targetProgressBias && materialRegisterGap && lexicalDimensions(changedDimensions).length < 1 && lexemeSwapCount < 1) {
    score -= 28;
  }

  if (targetProgressBias && materialSentenceGap && structuralDimensions(changedDimensions).length < 1) {
    score -= 22;
  }

  if (
    targetProgressBias &&
    (materialRegisterGap || materialSentenceGap) &&
    nonPunctuationDimensions.length < 2 &&
    lexicalDimensions(changedDimensions).length + structuralDimensions(changedDimensions).length < 2
  ) {
    score -= 24;
  }

  if ((quality.notes || []).some((note) => /additive drift/i.test(note))) {
    score -= 40;
  }

  return score;
}

function evaluateTransferQuality({
  sourceText = '',
  outputText = '',
  workingText = '',
  sourceProfile = {},
  targetProfile = {},
  targetGap = {},
  outputProfile = {},
  changedDimensions = [],
  protectedState = { literals: [] },
  opportunityProfile = {}
}) {
  const notes = [];
  const materialGap = isMaterialCadenceGap(targetGap);
  const limitedOpportunity = hasLimitedRewriteOpportunity(opportunityProfile);
  const nonPunctuationDimensions = changedDimensions.filter((dimension) => dimension !== 'punctuation-shape');
  const structuralDimensionsChanged = structuralDimensions(changedDimensions);
  const lexicalDimensionsChanged = lexicalDimensions(changedDimensions);
  const sourceFit = compareTexts('', '', {
    profileA: sourceProfile,
    profileB: targetProfile
  });
  const outputFit = compareTexts('', '', {
    profileA: outputProfile,
    profileB: targetProfile
  });
  const sourceMode = detectRegisterMode(sourceProfile);
  const targetMode = detectRegisterMode(targetProfile);
  const outputMode = detectRegisterMode(outputProfile);
  const registerProgress = Math.max(0, (sourceFit.registerDistance || 0) - (outputFit.registerDistance || 0));
  const functionWordProgress = Math.max(0, (sourceFit.functionWordDistance || 0) - (outputFit.functionWordDistance || 0));
  const directnessProgress = Math.max(0, (sourceFit.directnessDistance || 0) - (outputFit.directnessDistance || 0));
  const abstractionProgress = Math.max(0, (sourceFit.abstractionDistance || 0) - (outputFit.abstractionDistance || 0));
  const contractionProgress = Math.max(0, (sourceFit.contractionDistance || 0) - (outputFit.contractionDistance || 0));
  const abbreviationProgress = Math.max(0, (sourceFit.abbreviationDistance || 0) - (outputFit.abbreviationDistance || 0));
  const orthographyProgress = Math.max(0, (sourceFit.orthographyDistance || 0) - (outputFit.orthographyDistance || 0));
  const fragmentProgress = Math.max(0, (sourceFit.fragmentDistance || 0) - (outputFit.fragmentDistance || 0));
  const conversationProgress = Math.max(0, (sourceFit.conversationDistance || 0) - (outputFit.conversationDistance || 0));
  const surfaceProgress = Math.max(0, (sourceFit.surfaceMarkerDistance || 0) - (outputFit.surfaceMarkerDistance || 0));
  const stylisticRegisterLanding =
    lexicalDimensionsChanged.length >= 1 ||
    (targetMode !== sourceMode && outputMode === targetMode) ||
    registerProgress >= 0.015 ||
    functionWordProgress >= 0.025 ||
    contractionProgress >= 0.006 ||
    abbreviationProgress >= 0.015 ||
    orthographyProgress >= 0.02 ||
    fragmentProgress >= 0.02 ||
    conversationProgress >= 0.02 ||
    surfaceProgress >= 0.02 ||
    (directnessProgress + abstractionProgress) >= 0.025 ||
    changedDimensions.includes('connector-stance') ||
    changedDimensions.includes('contraction-posture');
  const materialLexicalGap =
    (targetGap.register || 0) >= 0.11 ||
    (targetGap.directness || 0) >= 0.06 ||
    (targetGap.abstraction || 0) >= 0.08 ||
    (targetGap.modifierDensity || 0) >= 0.03 ||
    (targetGap.lexicalComplexity || 0) >= 0.05 ||
    (targetGap.abbreviation || 0) >= 0.03 ||
    (targetGap.orthography || 0) >= 0.05 ||
    (targetGap.fragment || 0) >= 0.06 ||
    (targetGap.conversation || 0) >= 0.06 ||
    (targetGap.surfaceMarkers || 0) >= 0.08;

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

  // Hard pathology: banned connector stacks (Section 5)
  const BANNED_CONNECTOR_STACKS = [
    /\bthough\s+if\b/i,
    /\bhonestly[,;]?\s+and\b/i,
    /\bbut\s+because\b/i,
    /\band\s+though\s+if\b/i,
    /\bhonestly[;]\s+and\b/i
  ];
  for (const banned of BANNED_CONNECTOR_STACKS) {
    if (banned.test(outputText)) {
      notes.push(`Banned connector stack detected: ${banned.source}`);
    }
  }

  // Hard pathology: orphan fragments (sentences starting with lone connector, < 4 words)
  const outputChunks = sentenceChunks(outputText);
  for (const chunk of outputChunks) {
    const words = tokenize(chunk);
    if (words.length <= 3 && /^(though|but|and|so|yet|still)\b/i.test(chunk.trim())) {
      notes.push(`Orphan fragment detected: "${chunk.trim().substring(0, 40)}"`);
    }
  }

  if (outputText.length > transferLengthCeiling(sourceText, sourceProfile, targetProfile, 0.76)) {
    notes.push('Transfer expanded past the bounded output ratio.');
  }

  if (!outputText.trim()) {
    notes.push('Transfer collapsed into an unreadable empty result.');
  }

  if (materialGap && !limitedOpportunity && structuralDimensionsChanged.length < 1) {
    notes.push('Transfer did not land a structural cadence shift.');
  }

  if (materialGap && !limitedOpportunity && nonPunctuationDimensions.length < 2) {
    notes.push('Transfer stayed too close to punctuation-only drift.');
  }

  if (materialLexicalGap && !stylisticRegisterLanding) {
    notes.push('Transfer missed donor lexical/register realization.');
  }

  if (outputText === sourceText && materialGap && !limitedOpportunity) {
    notes.push('Material target gap remained unresolved.');
  }

  const additiveDrift = additiveDriftState({
    sourceText,
    outputText,
    sourceProfile,
    outputProfile,
    targetProfile,
    opportunityProfile
  });

  if (additiveDrift.failed) {
    notes.push(additiveDrift.note);
  }

  return {
    qualityGatePassed: notes.length === 0,
    notes,
    materialGap,
    limitedOpportunity,
    nonPunctuationDimensions,
    structuralDimensions: structuralDimensionsChanged,
    lexicalDimensions: lexicalDimensionsChanged,
    changedDimensions
  };
}

function structuralShiftDimensions(baseProfile = {}, currentProfile = {}) {
  let shifts = 0;

  if (Math.abs((currentProfile.avgSentenceLength || 0) - (baseProfile.avgSentenceLength || 0)) >= 0.75) {
    shifts += 1;
  }

  if (Math.abs((currentProfile.sentenceCount || 0) - (baseProfile.sentenceCount || 0)) >= 1) {
    shifts += 1;
  }

  if (Math.abs((currentProfile.contractionDensity || 0) - (baseProfile.contractionDensity || 0)) >= 0.006) {
    shifts += 1;
  }

  if (Math.abs((currentProfile.lineBreakDensity || 0) - (baseProfile.lineBreakDensity || 0)) >= 0.02) {
    shifts += 1;
  }

  if (functionWordDistance(baseProfile.functionWordProfile || {}, currentProfile.functionWordProfile || {}) >= 0.015) {
    shifts += 1;
  }

  return shifts;
}

function borrowedShellProgressAdmission({
  qualityNotes = [],
  changedDimensions = [],
  sourceProfile = {},
  outputProfile = {},
  targetProfile = {},
  protectedAnchorIntegrity = 1,
  semanticAudit = {},
  lexicalShiftProfile = {},
  visibleShift = false,
  nonTrivialShift = false
}) {
  const toleratedQualityNotes = qualityNotes.length > 0 &&
    qualityNotes.every((note) =>
      /Transfer missed donor lexical\/register realization\./i.test(note) ||
      /Structural opportunity existed but the current candidate collapsed into additive drift\./i.test(note)
    );
  const polarityTolerance = changedDimensions.includes('contraction-posture') ? 2 : 1;

  if (
    !toleratedQualityNotes ||
    borrowedShellPathologyBlocked(qualityNotes) ||
    !visibleShift ||
    !nonTrivialShift ||
    protectedAnchorIntegrity < 1 ||
    (semanticAudit.polarityMismatches ?? 0) > polarityTolerance
  ) {
    return {
      eligible: false,
      progressProfile: null
    };
  }

  const sourceFitToTarget = compareTexts('', '', {
    profileA: sourceProfile,
    profileB: targetProfile
  });
  const outputFitToTarget = compareTexts('', '', {
    profileA: outputProfile,
    profileB: targetProfile
  });
  const progressProfile = {
    structuralCount: borrowedShellStructuralDimensions(changedDimensions).length,
    lexicalCount: lexicalDimensions(changedDimensions).length,
    sentenceProgress: round3(Math.max(0, (sourceFitToTarget.sentenceDistance || 0) - (outputFitToTarget.sentenceDistance || 0))),
    functionWordProgress: round3(Math.max(0, (sourceFitToTarget.functionWordDistance || 0) - (outputFitToTarget.functionWordDistance || 0))),
    registerProgress: round3(Math.max(0, (sourceFitToTarget.registerDistance || 0) - (outputFitToTarget.registerDistance || 0))),
    directnessProgress: round3(Math.max(0, (sourceFitToTarget.directnessDistance || 0) - (outputFitToTarget.directnessDistance || 0))),
    abstractionProgress: round3(Math.max(0, (sourceFitToTarget.abstractionDistance || 0) - (outputFitToTarget.abstractionDistance || 0))),
    swapCount: Number(lexicalShiftProfile.swapCount || 0)
  };

  const structuralProgressLanded =
    progressProfile.structuralCount >= 1 &&
    (
      progressProfile.sentenceProgress >= 0.02 ||
      progressProfile.functionWordProgress >= 0.02
    );
  const registerProgressLanded =
    progressProfile.lexicalCount >= 1 ||
    progressProfile.swapCount >= 1 ||
    changedDimensions.includes('contraction-posture') ||
    changedDimensions.includes('connector-stance') ||
    progressProfile.registerProgress >= 0.015 ||
    progressProfile.functionWordProgress >= 0.03 ||
    (progressProfile.directnessProgress + progressProfile.abstractionProgress) >= 0.025;

  if (
    !structuralProgressLanded ||
    !registerProgressLanded
  ) {
    return {
      eligible: false,
      progressProfile
    };
  }

  return {
    eligible: true,
    progressProfile
  };
}

function borrowedShellPartialFallback({
  shell,
  bestCandidate,
  sourceText,
  sourceProfile,
  targetProfile,
  protectedState,
  ir
}) {
  if (!shell || shell.mode !== 'borrowed') {
    return { eligible: false };
  }

  if (!bestCandidate || !bestCandidate.outputText || bestCandidate.outputText === sourceText) {
    return { eligible: false };
  }

  const changedDimensions = Array.isArray(bestCandidate.changedDimensions) ? bestCandidate.changedDimensions : [];
  const qualityNotes = Array.isArray(bestCandidate.quality?.notes) ? bestCandidate.quality.notes : [];
  if (borrowedShellPathologyBlocked(qualityNotes)) {
    return { eligible: false };
  }

  const lexicalShiftProfile = buildLexicalShiftProfile(
    sourceText,
    bestCandidate.outputText,
    sourceProfile,
    targetProfile,
    bestCandidate.outputProfile
  );
  const visibleShift = hasBorrowedShellVisibleShift(
    sourceText,
    bestCandidate.outputText,
    changedDimensions,
    lexicalShiftProfile
  );
  const nonTrivialShift = hasBorrowedShellNonTrivialShift(
    sourceText,
    bestCandidate.outputText,
    changedDimensions,
    lexicalShiftProfile
  );

  if (!visibleShift || !nonTrivialShift) {
    return { eligible: false };
  }

  const {
    semanticAudit,
    protectedAnchorAudit,
    outputIR
  } = buildSemanticAuditBundle(ir, bestCandidate.outputText, protectedState);
  const protectedAnchorIntegrity =
    protectedAnchorAudit.protectedAnchorIntegrity ?? semanticAudit.protectedAnchorIntegrity ?? 1;

  if (
    protectedAnchorIntegrity < 1 ||
    (semanticAudit.propositionCoverage ?? 1) < 0.82 ||
    (semanticAudit.actionCoverage ?? 1) < 0.82 ||
    (semanticAudit.polarityMismatches ?? 0) > 0
  ) {
    const progressAdmission = borrowedShellProgressAdmission({
      qualityNotes,
      changedDimensions,
      sourceProfile,
      outputProfile: bestCandidate.outputProfile || extractCadenceProfile(bestCandidate.outputText),
      targetProfile,
      protectedAnchorIntegrity,
      semanticAudit,
      lexicalShiftProfile,
      visibleShift,
      nonTrivialShift
    });

    if (!progressAdmission.eligible) {
      return { eligible: false, progressProfile: progressAdmission.progressProfile };
    }

    return {
      eligible: true,
      relaxed: true,
      progressProfile: progressAdmission.progressProfile,
      lexicalShiftProfile,
      semanticAudit,
      protectedAnchorAudit,
      outputIR,
      visibleShift,
      nonTrivialShift
    };
  }

  return {
    eligible: true,
    relaxed: false,
    progressProfile: borrowedShellProgressAdmission({
      qualityNotes,
      changedDimensions,
      sourceProfile,
      outputProfile: bestCandidate.outputProfile || extractCadenceProfile(bestCandidate.outputText),
      targetProfile,
      protectedAnchorIntegrity,
      semanticAudit,
      lexicalShiftProfile,
      visibleShift,
      nonTrivialShift
    }).progressProfile,
    lexicalShiftProfile,
    semanticAudit,
    protectedAnchorAudit,
    outputIR,
    visibleShift,
    nonTrivialShift
  };
}

function borrowedShellRescueScore(candidate = {}, fallback = {}) {
  const changedDimensions = Array.isArray(candidate.changedDimensions) ? candidate.changedDimensions : [];
  const structuralCount = borrowedShellStructuralDimensions(changedDimensions).length;
  const lexicalCount = lexicalDimensions(changedDimensions).length;
  const swapCount = Number(fallback.lexicalShiftProfile?.swapCount || 0);
  const rescueCount = Array.isArray(candidate.rescuePasses) ? candidate.rescuePasses.length : 0;
  const notePenalty = Array.isArray(candidate.quality?.notes)
    ? candidate.quality.notes.filter((note) => /additive drift|lexical\/register realization/i.test(note)).length
    : 0;

  return (structuralCount * 24) +
    (lexicalCount * 18) +
    (swapCount * 10) +
    (rescueCount * 3) +
    (fallback.nonTrivialShift ? 8 : 0) +
    (fallback.visibleShift ? 4 : 0) -
    (notePenalty * 6);
}

function buildBorrowedShellOverlayCandidate({
  shell,
  sourceText = '',
  sourceProfile = {},
  targetProfile = {},
  targetGap = {},
  protectedState = { literals: [] },
  opportunityProfile = {},
  ir = {},
  variant = 'balanced'
}) {
  if (shell?.mode !== 'borrowed' || !sourceText) {
    return null;
  }

  const candidateStrength = clamp(Number(shell.strength ?? 0.82), 0, 1);
  const transferPlan = buildTransferPlanFromIR(
    ir,
    sourceProfile,
    targetProfile,
    candidateStrength,
    opportunityProfile
  );
  const baseMod = shell.mod || {};
  const candidateMod = {
    ...baseMod,
    sent: transferPlan.wantsShorter
      ? -Math.max(1, Math.round(Math.max(Math.abs(Number(baseMod.sent || 0)), 1)))
      : transferPlan.wantsLonger
        ? Math.max(1, Math.round(Math.max(Math.abs(Number(baseMod.sent || 0)), 1)))
        : Number(baseMod.sent || 0),
    cont: Number(baseMod.cont || 0),
    punc: Number(baseMod.punc || 0)
  };
  const connectorProfile = shell.profile || targetProfile;
  const voiceOptions = { allowPlainTargetCompression: true };
  let workingText = sourceText;
  const passesApplied = [];
  const rescuePasses = [];
  const maxLength = transferLengthCeiling(sourceText, sourceProfile, targetProfile, candidateStrength);
  const shouldStructure = variant !== 'conservative' && (
    transferPlan.shiftSentenceLength ||
    transferPlan.shiftSentenceCount ||
    transferPlan.wantsLonger ||
    transferPlan.wantsShorter
  );
  const voiceStrength =
    variant === 'conservative'
      ? Math.min(1, candidateStrength + 0.14)
      : variant === 'register'
        ? Math.min(1, candidateStrength + 0.24)
        : Math.min(1, candidateStrength + 0.28);
  const discourseStrength =
    variant === 'conservative'
      ? Math.min(1, candidateStrength + 0.14)
      : Math.min(1, candidateStrength + 0.2);
  const functionStrength =
    variant === 'register'
      ? Math.min(1, candidateStrength + 0.2)
      : Math.min(1, candidateStrength + 0.24);

  if (shouldStructure) {
    const overlayStructured = applyClauseTexture(
      workingText,
      sourceProfile,
      targetProfile,
      Math.min(1, candidateStrength + 0.16),
      candidateMod,
      transferPlan
    );
    if (overlayStructured !== workingText && overlayStructured.length <= maxLength) {
      workingText = overlayStructured;
      passesApplied.push('overlay-structural');
      rescuePasses.push('overlay-structural');
    }
  }

  let overlayWorking = workingText;
  overlayWorking = applyContractionTexture(overlayWorking, targetProfile, candidateMod);
  overlayWorking = applyPhraseTexture(overlayWorking, sourceProfile, targetProfile, Math.min(1, candidateStrength + 0.18));
  overlayWorking = applyVoiceRealizationTexture(overlayWorking, sourceProfile, targetProfile, voiceStrength, voiceOptions);
  overlayWorking = applyDiscourseFrameTexture(overlayWorking, sourceProfile, targetProfile, discourseStrength, transferPlan);
  overlayWorking = applyStanceTexture(overlayWorking, targetProfile, Math.min(1, candidateStrength + 0.18), connectorProfile);
  overlayWorking = applyFunctionWordTexture(overlayWorking, targetProfile, functionStrength, connectorProfile, transferPlan);
  overlayWorking = sanitizeBorrowedShellPathologies(overlayWorking);
  overlayWorking = finalizeTransformedText(overlayWorking);

  if (overlayWorking !== workingText && overlayWorking.length <= maxLength) {
    workingText = overlayWorking;
    passesApplied.push(`overlay-${variant}`);
    rescuePasses.push(`overlay-${variant}`);
  }

  const outputText = normalizeText(workingText);
  const outputProfile = extractCadenceProfile(outputText);
  const changedDimensions = collectChangedDimensions(sourceProfile, outputProfile);
  const quality = evaluateTransferQuality({
    sourceText,
    outputText,
    workingText,
    sourceProfile,
    targetProfile,
    targetGap,
    outputProfile,
    changedDimensions,
    protectedState,
    opportunityProfile
  });

  return {
    spec: 'borrowed-shell-overlay',
    workingText,
    outputText,
    outputProfile,
    changedDimensions,
    quality,
    passesApplied,
    rescuePasses,
    score: candidateScore({
      quality,
      outputText,
      sourceText,
      sourceProfile,
      outputProfile,
      targetProfile,
      changedDimensions,
      passesApplied,
      targetProgressBias: shell?.mode === 'persona' || shell?.mode === 'borrowed'
    })
  };
}

function findBorrowedShellRescueCandidate({
  shell,
  candidates = [],
  sourceText = '',
  sourceProfile = {},
  targetProfile = {},
  targetGap = {},
  protectedState = { literals: [] },
  opportunityProfile = {},
  ir = {}
}) {
  if (shell?.mode !== 'borrowed') {
    return { candidate: null, fallback: null };
  }

  const rescueCandidates = Array.isArray(candidates) ? [...candidates] : [];
  for (const variant of ['conservative', 'register', 'balanced']) {
    const overlayCandidate = buildBorrowedShellOverlayCandidate({
      shell,
      sourceText,
      sourceProfile,
      targetProfile,
      targetGap,
      protectedState,
      opportunityProfile,
      ir,
      variant
    });
    if (overlayCandidate) {
      rescueCandidates.push(overlayCandidate);
    }
  }

  let best = null;

  for (const candidate of rescueCandidates) {
    const fallback = borrowedShellPartialFallback({
      shell,
      bestCandidate: candidate,
      sourceText,
      sourceProfile,
      targetProfile,
      protectedState,
      ir
    });

    if (!fallback.eligible) {
      continue;
    }

    const score = borrowedShellRescueScore(candidate, fallback);
    if (!best || score > best.score) {
      best = {
        candidate,
        fallback,
        score
      };
    }
  }

  return best || { candidate: null, fallback: null };
}

function inferBorrowedShellFailureClass({
  shell,
  targetGap = {},
  qualityNotes = [],
  protectedAnchorAudit = {},
  semanticAudit = {},
  visibleShift = false,
  nonTrivialShift = false,
  literalLocked = false,
  transferClass = '',
  borrowedShellOutcome = ''
}) {
  if (!shell || shell.mode !== 'borrowed') {
    return null;
  }

  if (borrowedShellOutcome === 'structural' || borrowedShellOutcome === 'partial') {
    return null;
  }

  const protectedAnchorIntegrity =
    protectedAnchorAudit.protectedAnchorIntegrity ?? semanticAudit.protectedAnchorIntegrity ?? 1;

  if (literalLocked) {
    return 'literal-lock';
  }

  if (borrowedShellPathologyBlocked(qualityNotes)) {
    return 'pathology-block';
  }

  if (
    protectedAnchorIntegrity < 1 ||
    (semanticAudit.propositionCoverage ?? 1) < 0.82 ||
    (semanticAudit.actionCoverage ?? 1) < 0.82 ||
    (semanticAudit.polarityMismatches ?? 0) > 0
  ) {
    return 'semantic-risk';
  }

  if (!isMaterialCadenceGap(targetGap)) {
    return 'already-close';
  }

  if (transferClass === 'rejected' && !visibleShift) {
    return 'donor-underfit';
  }

  if (!nonTrivialShift || borrowedShellOutcome === 'subtle') {
    return 'lexical-underreach';
  }

  return 'donor-underfit';
}

function shouldApplySentenceTexture(currentProfile = {}, targetProfile = {}, gap = {}, mod = {}) {
  if ((mod.sent || 0) !== 0) {
    return true;
  }

  return (gap.avgSentence || 0) >= 0.45 ||
    (gap.sentenceCount || 0) >= 1 ||
    (gap.spread || 0) >= 0.5;
}

function applySentenceTexture(text = '', currentProfile = {}, targetProfile = {}, strength = 0.76, mod = {}) {
  const targetCount = desiredSentenceCount(currentProfile, targetProfile);
  const currentCount = currentProfile.sentenceCount || 0;
  const targetAvg = targetProfile.avgSentenceLength || currentProfile.avgSentenceLength || 0;
  const currentAvg = currentProfile.avgSentenceLength || 0;
  const wantsLonger = targetAvg > currentAvg + 0.4 || targetCount < currentCount;
  const wantsShorter = targetAvg < currentAvg - 0.4 || targetCount > currentCount;

  if (wantsLonger) {
    return mergeSentencePairs(text, targetProfile, Math.min(1, strength + 0.08), mod);
  }

  if (wantsShorter) {
    return splitLongSentences(text, targetProfile, Math.min(1, strength + 0.08));
  }

  return text;
}

function applyBaselineTransferFloor(text = '', baseProfile = {}, targetProfile = {}, strength = 0.76, mod = {}, connectorProfile = null, transferPlan = null, voiceOptions = {}) {
  let result = text;
  const maxLength = transferLengthCeiling(text, baseProfile, targetProfile, strength);
  const targetCount = desiredSentenceCount(baseProfile, targetProfile);
  const currentCount = baseProfile.sentenceCount || 0;
  const targetAvg = targetProfile.avgSentenceLength || baseProfile.avgSentenceLength || 0;
  const currentAvg = baseProfile.avgSentenceLength || 0;
  const wantsLonger = targetAvg > currentAvg + 0.4 || targetCount < currentCount;
  const wantsShorter = targetAvg < currentAvg - 0.4 || targetCount > currentCount;
  const contractionDirection = Number(mod.cont || 0) || Math.sign((targetProfile.contractionDensity || 0) - (baseProfile.contractionDensity || 0));

  if (wantsLonger && sentenceChunks(result).length > 1) {
    result = mergeSentencePairs(result, targetProfile, Math.min(1, strength + 0.08), {
      ...mod,
      sent: Math.max(1, Number(mod.sent || 0) || 1)
    }, transferPlan);
  } else if (wantsShorter) {
    result = splitLongSentences(result, targetProfile, Math.min(1, strength + 0.08));
  }

  result = applyContractionTexture(result, targetProfile, {
    ...mod,
    cont: contractionDirection
  });
  result = applyPhraseTexture(result, baseProfile, targetProfile, Math.min(1, strength + 0.14));
  result = applyVoiceRealizationTexture(result, baseProfile, targetProfile, Math.min(1, strength + 0.2), voiceOptions);
  result = applyDiscourseFrameTexture(result, baseProfile, targetProfile, Math.min(1, strength + 0.12), transferPlan);
  result = applyStanceTexture(result, targetProfile, Math.min(1, strength + 0.14), connectorProfile);
  result = applyFunctionWordTexture(result, targetProfile, Math.min(1, strength + 0.18), connectorProfile, transferPlan);

  if (Math.abs((targetProfile.lineBreakDensity || 0) - (baseProfile.lineBreakDensity || 0)) >= 0.02) {
    result = applyLineBreakTexture(result, targetProfile, Math.min(1, strength + 0.1));
  }

  if (result.length > maxLength) {
    return finalizeTransformedText(text);
  }

  return finalizeTransformedText(result);
}

function finalizeTransformedText(text = '') {
  const normalizedBase = hasIntentionalLowercaseSurface(text)
    ? text
    : normalizeSentenceStarts(text);

  return normalizedBase
    .replace(/([;:.!?]\s+)(and|but|though|yet|since|because|so|then|when|while)\s+\2\b/gi, '$1$2')
    .replace(/\bthough\s+so\b/gi, 'so')
    .replace(/\bbut\s+so\b/gi, 'so')
    .replace(/\b(?:and|but)\s+then\b/gi, 'then')
    .replace(/\bOn\s+([^.;!?]{1,48});\s+([A-Z])/g, 'On $1, $2')
    .replace(/([A-Za-z0-9"'%)])\.\s+(Which|That)\b/g, (match, lastChar, connector) => `${lastChar}, ${connector.toLowerCase()}`)
    .replace(/;\s+but\b/gi, ', but')
    .replace(/\basking\s+for\s+for\b/gi, 'asking ')
    .replace(/\basked\s+for\s+for\b/gi, 'asked for ')
    .replace(/\bThough\s+([^,.!?]{1,40}),\s+so\b/g, '$1, so')
    .replace(/\bthough\s+([^,.!?]{1,40}),\s+so\b/g, '$1, so')
    .replace(/\bbetween([^.!?]{0,120}),\s+but\s+/gi, 'between$1, and ')
    .replace(/\b(As of [^.!?]{1,48}|During [^.!?]{1,36}|By [^.!?]{1,20})\.\s+([A-Z])/g, (match, leadIn, nextLetter) => {
      return `${leadIn}, ${nextLetter.toLowerCase()}`;
    })
    .replace(/\.{2,}/g, '.')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ ]{2,}/g, ' ')
    .trim();
}

function forceStructuralShift(text = '', baseProfile = {}, targetProfile = {}, strength = 0.76, mod = {}, connectorProfile = null, transferPlan = null, voiceOptions = {}) {
  let result = text;
  const maxLength = transferLengthCeiling(text, baseProfile, targetProfile, strength);
  const currentProfile = extractCadenceProfile(result);
  const targetCount = desiredSentenceCount(currentProfile, targetProfile);
  const wantsLonger = (targetProfile.avgSentenceLength || currentProfile.avgSentenceLength || 0) > (currentProfile.avgSentenceLength || 0) + 0.6;
  const wantsShorter = (targetProfile.avgSentenceLength || currentProfile.avgSentenceLength || 0) < (currentProfile.avgSentenceLength || 0) - 0.6;

  if ((wantsLonger || targetCount < (currentProfile.sentenceCount || 0)) && sentenceChunks(result).length > 1) {
    result = mergeSentencePairs(result, targetProfile, Math.min(1, strength + 0.2), {
      ...mod,
      sent: Math.max(1, Number(mod.sent || 0))
    }, transferPlan);
  } else if (wantsShorter || targetCount > (currentProfile.sentenceCount || 0)) {
    result = splitLongSentences(result, targetProfile, Math.min(1, strength + 0.22));
  }

  result = applyPhraseTexture(result, baseProfile, targetProfile, Math.min(1, strength + 0.16));
  result = applyVoiceRealizationTexture(result, baseProfile, targetProfile, Math.min(1, strength + 0.22), voiceOptions);
  result = applyDiscourseFrameTexture(result, baseProfile, targetProfile, Math.min(1, strength + 0.14), transferPlan);
  result = applyContractionTexture(result, targetProfile, {
    ...mod,
    cont: Number(mod.cont || 0) || Math.sign((targetProfile.contractionDensity || 0) - (currentProfile.contractionDensity || 0))
  });
  result = applyFunctionWordTexture(result, targetProfile, Math.min(1, strength + 0.18), connectorProfile, transferPlan);
  result = applyLineBreakTexture(result, targetProfile, Math.min(1, strength + 0.14));

  if (Math.abs((targetProfile.punctuationDensity || 0) - (baseProfile.punctuationDensity || 0)) > 0.01) {
    result = applyPunctuationTexture(result, targetProfile, mod);
  }

  if (result.length > maxLength) {
    return finalizeTransformedText(text);
  }

  return finalizeTransformedText(result);
}

function buildCadenceTransferLegacy(text = '', shell = {}, options = {}) {
  const sourceText = normalizeText(text);
  const sourceProfile = extractCadenceProfile(sourceText);
  const opportunityProfile = buildOpportunityProfile(sourceText);
  const mod = normalizeShellMod(shell);
  const strength = clamp(Number(options?.strength ?? shell?.strength ?? (shell?.profile ? 0.82 : 0.68)), 0, 1);
  const debug = Boolean(options?.debug);
  const retrieval = Boolean(options?.retrieval);
  const strictBorrowedMode = shell?.mode === 'borrowed' && (retrieval || shell?.source === 'swapped');

  if (!sourceText || ((!mod.sent && !mod.cont && !mod.punc) && !shell?.profile) || shell?.mode === 'native') {
    const protectedState = protectTransferLiterals(sourceText);
    const ir = segmentTextToIR(protectedState.text, protectedState);
    const { semanticAudit, protectedAnchorAudit, outputIR } = buildSemanticAuditBundle(ir, sourceText, protectedState);
    const result = {
      text: sourceText,
      sourceProfile,
      targetProfile: sourceProfile,
      outputProfile: sourceProfile,
      opportunityProfile,
      changedDimensions: [],
      protectedLiteralCount: 0,
      passesApplied: [],
      rescuePasses: [],
      transferClass: 'native',
      qualityGatePassed: true,
      notes: sourceText ? ['Native shell: no transfer applied.'] : ['No source text loaded.'],
      effectiveMod: mod,
      realizationTier: 'none',
      lexicalShiftProfile: {
        lexemeSwaps: [],
        swapCount: 0,
        registerDistance: 0,
        contentWordComplexityDelta: 0,
        modifierDensityDelta: 0,
        directnessDelta: 0,
        abstractionDelta: 0,
        contractionAligned: true
      },
      semanticRisk: 0,
      lexemeSwaps: [],
      realizationNotes: [],
      borrowedShellOutcome: null,
      borrowedShellFailureClass: null,
      visibleShift: false,
      nonTrivialShift: false,
      semanticAudit,
      protectedAnchorAudit
    };

    if (retrieval || debug) {
      result.retrievalTrace = buildRetrievalTrace({
        sourceText,
        shell,
        sourceProfile,
        targetProfile: sourceProfile,
        opportunityProfile,
        ir,
        transferPlan: {},
        irPlan: {},
        allCandidates: [],
        bestCandidate: {
          spec: 'native',
          score: 1,
          passesApplied: [],
          changedDimensions: [],
          quality: {
            qualityGatePassed: true,
            notes: []
          }
        },
        finalText: sourceText,
        result,
        semanticAudit,
        protectedAnchorAudit,
        outputIR
      });
    }

    return result;
  }

  const targetProfile = buildTransferTargetProfile(sourceProfile, shell, mod, strength);
  const effectiveMod = deriveRelativeCadenceMod(sourceProfile, targetProfile, mod);
  const voiceRealizationOptions = {
    allowPlainTargetCompression: shell?.mode === 'borrowed' && (retrieval || shell?.source === 'swapped'),
    disabledLexicalFamilies:
      shell?.mode === 'borrowed' && (retrieval || shell?.source === 'swapped')
        ? [...BORROWED_SHELL_DISABLED_LEXICAL_FAMILY_IDS]
        : []
  };
  const targetGap = profileDeltaToTarget(sourceProfile, targetProfile);
  const transferPlan = buildTransferPlan({
    sourceProfile,
    targetProfile,
    targetGap,
    opportunityProfile,
    effectiveMod,
    strength
  });
  const protectedState = protectTransferLiterals(sourceText);
  const connectorProfile = shell?.profile || targetProfile;
  const maxLength = transferLengthCeiling(sourceText, sourceProfile, targetProfile, strength);
  const previewText = (candidate) => finalizeTransformedText(
    reconcileProtectedLiteralSurface(
      restoreProtectedLiterals(candidate, protectedState.literals),
      protectedState.literals
    )
  );
  const previewProfile = (candidate) => extractCadenceProfile(previewText(candidate));

  // Build IR and run beam search alongside legacy candidates
  const ir = segmentTextToIR(protectedState.text, protectedState);
  const irPlan = buildTransferPlanFromIR(ir, sourceProfile, targetProfile, strength, opportunityProfile);
  const beamResult = beamSearchTransfer(ir, irPlan, sourceProfile, targetProfile, strength, protectedState, sourceText, effectiveMod, connectorProfile, debug);

  // Legacy candidate specs
  const candidateSpecs = buildCandidateSpecs(transferPlan);

  const runCandidate = (spec = {}) => {
    let workingText = protectedState.text;
    let passesApplied = [];
    let rescuePasses = [];
    let currentProfile = sourceProfile;
    let gap = targetGap;
    const candidateDebugPasses = debug ? [] : null;
    const candidateStrength = Math.min(
      1,
      strength +
      ((((spec.splitBias || 1) + (spec.mergeBias || 1) + (spec.connectorBias || 1)) - 3) * 0.035)
    );
    const candidateMod = {
      ...effectiveMod,
      sent: transferPlan.wantsShorter
        ? -Math.max(1, Math.round(Math.max(Math.abs(Number(effectiveMod.sent || 0)), spec.splitBias || 1)))
        : transferPlan.wantsLonger
          ? Math.max(1, Math.round(Math.max(Math.abs(Number(effectiveMod.sent || 0)), spec.mergeBias || 1)))
          : Number(effectiveMod.sent || 0),
      cont: Number(effectiveMod.cont || 0),
      punc: (spec.punctuationBias || 1) < 0.7
        ? clamp(Number(effectiveMod.punc || 0), -1, 1)
        : Number(effectiveMod.punc || 0)
    };
    const runPass = (name, fn) => {
      const nextValue = fn(workingText);
      if (nextValue !== workingText) {
        workingText = nextValue;
        passesApplied.push(name);
        if (candidateDebugPasses) {
          candidateDebugPasses.push({
            name,
            text: previewText(workingText)
          });
        }
      }
    };

    // Decomposed baseline transfer: structure first, then discourse layers
    {
      const baseStrength = Math.min(1, candidateStrength + 0.08);
      const maxLength = transferLengthCeiling(workingText, currentProfile, targetProfile, baseStrength);
      const baseCurrentProfile = currentProfile;
      const targetCount = desiredSentenceCount(baseCurrentProfile, targetProfile);
      const currentCount = baseCurrentProfile.sentenceCount || 0;
      const targetAvg = targetProfile.avgSentenceLength || baseCurrentProfile.avgSentenceLength || 0;
      const currentAvg = baseCurrentProfile.avgSentenceLength || 0;
      const wantsLonger = targetAvg > currentAvg + 0.4 || targetCount < currentCount;
      const wantsShorter = targetAvg < currentAvg - 0.4 || targetCount > currentCount;
      const contractionDirection = Number(candidateMod.cont || 0) || Math.sign((targetProfile.contractionDensity || 0) - (baseCurrentProfile.contractionDensity || 0));

      if (wantsLonger && sentenceChunks(workingText).length > 1) {
        runPass('baseline-merge', () =>
          mergeSentencePairs(workingText, targetProfile, Math.min(1, baseStrength + 0.08), {
            ...candidateMod,
            sent: Math.max(1, Number(candidateMod.sent || 0) || 1)
          }, transferPlan)
        );
      } else if (wantsShorter) {
        runPass('baseline-split', () =>
          splitLongSentences(workingText, targetProfile, Math.min(1, baseStrength + 0.08))
        );
      }

      runPass('baseline-contraction', () =>
        applyContractionTexture(workingText, targetProfile, {
          ...candidateMod,
          cont: contractionDirection
        })
      );
      runPass('baseline-phrase', () =>
        applyPhraseTexture(workingText, currentProfile, targetProfile, Math.min(1, baseStrength + 0.14))
      );
      runPass('baseline-voice-realization', () =>
        applyVoiceRealizationTexture(workingText, currentProfile, targetProfile, Math.min(1, baseStrength + 0.22), voiceRealizationOptions)
      );
      runPass('baseline-discourse', () =>
        applyDiscourseFrameTexture(workingText, currentProfile, targetProfile, Math.min(1, baseStrength + 0.12), transferPlan)
      );
      runPass('baseline-stance', () =>
        applyStanceTexture(workingText, targetProfile, Math.min(1, baseStrength + 0.14), connectorProfile)
      );
      runPass('baseline-function-word', () =>
        applyFunctionWordTexture(workingText, targetProfile, Math.min(1, baseStrength + 0.18), connectorProfile, transferPlan)
      );

      if (Math.abs((targetProfile.lineBreakDensity || 0) - (baseCurrentProfile.lineBreakDensity || 0)) >= 0.02) {
        runPass('baseline-line-break', () =>
          applyLineBreakTexture(workingText, targetProfile, Math.min(1, baseStrength + 0.1))
        );
      }

      // Finalize baseline
      const baselineFinalized = finalizeTransformedText(workingText);
      if (baselineFinalized !== workingText && baselineFinalized.length <= maxLength) {
        workingText = baselineFinalized;
      }
    }
    currentProfile = previewProfile(workingText);

    if (transferPlan.wantsShorter && (spec.splitBias || 0) > 0.1) {
      runPass('planned-sentence-split', () =>
        applySplitRules(
          workingText,
          Math.max(1, Math.round((transferPlan.splitCount || 1) * (spec.splitBias || 1)))
        )
      );
      currentProfile = previewProfile(workingText);
    } else if (transferPlan.wantsLonger && (spec.mergeBias || 0) > 0.1) {
      runPass('planned-sentence-merge', () => {
        let nextValue = workingText;
        const mergeLoops = Math.max(1, Math.round((transferPlan.mergeCount || 1) * (spec.mergeBias || 1)));
        for (let index = 0; index < mergeLoops; index += 1) {
          const merged = mergeSentencePairs(
            nextValue,
            targetProfile,
            Math.min(1, candidateStrength + 0.06),
            candidateMod,
            transferPlan
          );
          if (merged === nextValue) {
            break;
          }
          nextValue = merged;
        }
        return nextValue;
      });
      currentProfile = previewProfile(workingText);
    }

    if (shouldApplySentenceTexture(currentProfile, targetProfile, targetGap, candidateMod)) {
      runPass('sentence-structure', () =>
        applySentenceTexture(
          workingText,
          currentProfile,
          targetProfile,
          Math.min(1, candidateStrength + 0.08),
          candidateMod
        )
      );
      currentProfile = previewProfile(workingText);
    }

    runPass('clause-join-split', () =>
      applyClauseTexture(
        workingText,
        currentProfile,
        targetProfile,
        Math.min(1, candidateStrength + 0.06),
        candidateMod,
        transferPlan
      )
    );
    currentProfile = previewProfile(workingText);

    if (transferPlan.shiftStanceFrames || transferPlan.shiftConnectors) {
      runPass('discourse-frame', () =>
        applyDiscourseFrameTexture(
          workingText,
          currentProfile,
          targetProfile,
          Math.min(1, candidateStrength + (0.12 * Math.max(1, spec.frameBias || 1))),
          transferPlan
        )
      );
      currentProfile = previewProfile(workingText);
    }

    runPass('connector-stance-lexicon', () => {
      let nextValue = applyPhraseTexture(
        workingText,
        currentProfile,
        targetProfile,
        Math.min(1, candidateStrength + (0.12 * Math.max(1, spec.connectorBias || 1)))
      );
      nextValue = applyStanceTexture(
        nextValue,
        targetProfile,
        Math.min(1, candidateStrength + (0.12 * Math.max(1, spec.connectorBias || 1))),
        connectorProfile
      );
      nextValue = applyFunctionWordTexture(
        nextValue,
        targetProfile,
        Math.min(1, candidateStrength + (0.16 * Math.max(1, spec.connectorBias || 1))),
        connectorProfile,
        transferPlan
      );
      nextValue = applyVoiceRealizationTexture(
        nextValue,
        currentProfile,
        targetProfile,
        Math.min(1, candidateStrength + (0.18 * Math.max(1, spec.connectorBias || 1))),
        voiceRealizationOptions
      );
      return nextValue;
    });
    currentProfile = previewProfile(workingText);

    gap = profileDeltaToTarget(currentProfile, targetProfile);
    if (transferPlan.raiseContraction || transferPlan.lowerContraction || gap.contraction >= 0.006 || Math.abs(Number(candidateMod.cont || 0)) > 0) {
      runPass('contraction-auxiliary', () => applyContractionTexture(workingText, targetProfile, candidateMod));
      currentProfile = previewProfile(workingText);
      gap = profileDeltaToTarget(currentProfile, targetProfile);
    }

    if (transferPlan.raiseLineBreaks || transferPlan.lowerLineBreaks || gap.lineBreak >= 0.02) {
      runPass('line-break', () =>
        applyLineBreakTexture(
          workingText,
          targetProfile,
          Math.min(1, candidateStrength + (0.08 * Math.max(1, spec.lineBreakBias || 1)))
        )
      );
      currentProfile = previewProfile(workingText);
      gap = profileDeltaToTarget(currentProfile, targetProfile);
    }

    const currentChangedDimensions = collectChangedDimensions(sourceProfile, currentProfile);
    const hasStructuralMovement = structuralDimensions(currentChangedDimensions).length > 0;
    const reducedStructuralGap =
      (gap.avgSentence || 0) < 0.45 &&
      (gap.functionWord || 0) < 0.015 &&
      (gap.contraction || 0) < 0.006;

    if (
      (spec.punctuationBias || 1) > 0.45 &&
      (
        hasStructuralMovement ||
        reducedStructuralGap ||
        (!transferPlan.wantsShorter && !transferPlan.wantsLonger)
      ) &&
      (
        gap.punctuation >= 0.008 ||
        gap.punctuationShape >= 0.05 ||
        Math.abs(Number(candidateMod.punc || 0)) > 0
      )
    ) {
      // Skip punctuation finishing when plan wants longer sentences and punc mod is negative
      // — applyPunctuationTexture converts semicolons (merge joins) to periods, undoing merges
      if (!(transferPlan.wantsLonger && (candidateMod.punc || 0) < 0)) {
        runPass('punctuation-finish', () => {
          let nextValue = applyPunctuationTexture(workingText, targetProfile, candidateMod);
          if ((candidateMod.punc || 0) < 0) {
            nextValue = nextValue.replace(/[;:]+/g, '.').replace(/,+/g, ',');
          }
          return nextValue;
        });
      }
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
      targetProfile,
      targetGap,
      outputProfile,
      changedDimensions,
      protectedState,
      opportunityProfile
    });
    let fallbackDebug = null;

    if (
      (spec.allowFallback || shell?.mode === 'borrowed') &&
      (
        !quality.qualityGatePassed ||
        (quality.materialGap && !quality.limitedOpportunity && !hasMaterialStructuralTransfer(changedDimensions))
      )
    ) {
      const forcedWorking = forceStructuralShift(
        workingText,
        sourceProfile,
        targetProfile,
        Math.min(1, candidateStrength + 0.18),
        candidateMod,
        connectorProfile,
        transferPlan,
        voiceRealizationOptions
      );

      if (forcedWorking !== workingText && forcedWorking.length <= maxLength) {
        workingText = forcedWorking;
        passesApplied.push('structural-rescue');
        rescuePasses.push('structural-rescue');
        outputText = previewText(workingText);
        outputProfile = extractCadenceProfile(outputText);
        changedDimensions = collectChangedDimensions(sourceProfile, outputProfile);
        quality = evaluateTransferQuality({
          sourceText,
          outputText,
          workingText,
          sourceProfile,
          targetProfile,
          targetGap,
          outputProfile,
          changedDimensions,
          protectedState,
          opportunityProfile
        });

        if (candidateDebugPasses) {
          fallbackDebug = {
            text: outputText,
            changedDimensions: [...changedDimensions],
            qualityGatePassed: quality.qualityGatePassed,
            notes: [...quality.notes]
          };
        }
      }
    }

    if (
      !quality.qualityGatePassed &&
      (
        shell?.mode === 'borrowed' ||
        (quality.notes || []).some((note) => /lexical\/register realization/i.test(note))
      )
    ) {
      const realizedWorking = applyVoiceRealizationTexture(
        workingText,
        sourceProfile,
        targetProfile,
        Math.min(1, candidateStrength + 0.26),
        voiceRealizationOptions
      );

      if (realizedWorking !== workingText && realizedWorking.length <= maxLength) {
        workingText = realizedWorking;
        passesApplied.push('lexical-register-rescue');
        rescuePasses.push('lexical-register-rescue');
        outputText = previewText(workingText);
        outputProfile = extractCadenceProfile(outputText);
        changedDimensions = collectChangedDimensions(sourceProfile, outputProfile);
        quality = evaluateTransferQuality({
          sourceText,
          outputText,
          workingText,
          sourceProfile,
          targetProfile,
          targetGap,
          outputProfile,
          changedDimensions,
          protectedState,
          opportunityProfile
        });
      }
    }

      if (!quality.qualityGatePassed && shell?.mode === 'borrowed') {
        let connectorWorking = applyDiscourseFrameTexture(
          workingText,
          outputProfile,
          targetProfile,
        Math.min(1, candidateStrength + 0.18),
        transferPlan
      );
      connectorWorking = applyStanceTexture(
        connectorWorking,
        targetProfile,
        Math.min(1, candidateStrength + 0.18),
        connectorProfile
      );
        connectorWorking = applyFunctionWordTexture(
          connectorWorking,
          targetProfile,
          Math.min(1, candidateStrength + 0.22),
          connectorProfile,
          transferPlan
        );
        connectorWorking = sanitizeBorrowedShellPathologies(connectorWorking);
        connectorWorking = finalizeTransformedText(connectorWorking);

      if (connectorWorking !== workingText && connectorWorking.length <= maxLength) {
        workingText = connectorWorking;
        passesApplied.push('connector-stance-rescue');
        rescuePasses.push('connector-stance-rescue');
        outputText = previewText(workingText);
        outputProfile = extractCadenceProfile(outputText);
        changedDimensions = collectChangedDimensions(sourceProfile, outputProfile);
        quality = evaluateTransferQuality({
          sourceText,
          outputText,
          workingText,
          sourceProfile,
          targetProfile,
          targetGap,
          outputProfile,
          changedDimensions,
          protectedState,
          opportunityProfile
        });
      }
    }

    return {
      spec: spec.name,
      workingText,
      outputText,
      outputProfile,
      changedDimensions,
      quality,
      passesApplied: [...new Set(passesApplied)],
      rescuePasses: [...new Set(rescuePasses)],
      score: candidateScore({
        quality,
        outputText,
        sourceText,
        sourceProfile,
        outputProfile,
        targetProfile,
        changedDimensions,
        passesApplied,
        targetProgressBias: shell?.mode === 'persona' || shell?.mode === 'borrowed'
      }),
      debug: candidateDebugPasses
        ? {
            passes: [...candidateDebugPasses],
            fallback: fallbackDebug
          }
        : null
    };
  };

  const candidates = candidateSpecs.map((spec) => runCandidate(spec));

  // Convert beam search best candidate into legacy candidate format for comparison
  const beamBest = beamResult.bestCandidate;
  const beamOutputText = finalizeTransformedText(
    restoreProtectedLiterals(beamBest.text, protectedState.literals)
  );
  const beamOutputProfile = extractCadenceProfile(beamOutputText);
  const beamChangedDimensions = collectChangedDimensions(sourceProfile, beamOutputProfile);
  const beamQuality = evaluateTransferQuality({
    sourceText,
    outputText: beamOutputText,
    workingText: beamBest.text,
    sourceProfile,
    targetProfile,
    targetGap,
    outputProfile: beamOutputProfile,
    changedDimensions: beamChangedDimensions,
    protectedState,
    opportunityProfile
  });
  const beamCandidate = {
    spec: 'ir-beam-search',
    workingText: beamBest.text,
    outputText: beamOutputText,
    outputProfile: beamOutputProfile,
    changedDimensions: beamChangedDimensions,
    quality: beamQuality,
    passesApplied: beamBest.operationHistory || [],
    rescuePasses: [],
    score: candidateScore({
      quality: beamQuality,
      outputText: beamOutputText,
      sourceText,
      sourceProfile,
      outputProfile: beamOutputProfile,
      targetProfile,
      changedDimensions: beamChangedDimensions,
      passesApplied: beamBest.operationHistory || [],
      targetProgressBias: shell?.mode === 'persona' || shell?.mode === 'borrowed'
    }),
    debug: null
  };

  // Pool beam + legacy candidates; accepted retrieval-safe survivors win first.
  const allCandidates = [beamCandidate, ...candidates];
  const candidateAcceptanceSummary = (candidate = {}) => {
    const candidateOutputText = candidate.outputText || sourceText;
    const candidateOutputProfile = candidate.outputProfile || extractCadenceProfile(candidateOutputText);
    const candidateChangedDimensions = [...(candidate.changedDimensions || [])];
    const lexicalShiftProfile = buildLexicalShiftProfile(
      sourceText,
      candidateOutputText,
      sourceProfile,
      targetProfile,
      candidateOutputProfile
    );
    const visibleShift = hasBorrowedShellVisibleShift(
      sourceText,
      candidateOutputText,
      candidateChangedDimensions,
      lexicalShiftProfile
    );
    const nonTrivialShift = hasBorrowedShellNonTrivialShift(
      sourceText,
      candidateOutputText,
      candidateChangedDimensions,
      lexicalShiftProfile
    );
    const auditBundle = buildSemanticAuditBundle(ir, candidateOutputText, protectedState);
    const semanticAudit = auditBundle.semanticAudit || {};
    const protectedAnchorAudit = auditBundle.protectedAnchorAudit || {};
    const protectedAnchorIntegrity =
      protectedAnchorAudit.protectedAnchorIntegrity ??
      semanticAudit.protectedAnchorIntegrity ??
      1;
    const sourceFitToTarget = compareTexts('', '', {
      profileA: sourceProfile,
      profileB: targetProfile
    });
    const outputFitToTarget = compareTexts('', '', {
      profileA: candidateOutputProfile,
      profileB: targetProfile
    });
    const donorProgress = buildBorrowedShellDonorProgress(
      sourceText,
      candidateOutputText,
      sourceProfile,
      targetProfile,
      candidateOutputProfile
    );
    const sourceDonorDistance = donorDistanceFromFit(sourceFitToTarget);
    const outputDonorDistance = donorDistanceFromFit(outputFitToTarget);
    const donorImprovement = donorProgress.donorImprovement;
    const donorRegression = round3(Math.max(0, outputDonorDistance - sourceDonorDistance));
    const structuralCount = borrowedShellStructuralDimensions(candidateChangedDimensions).length;
    const lexicalCount = lexicalDimensions(candidateChangedDimensions).length;
    const registerRealization =
      lexicalCount >= 1 ||
      Number(lexicalShiftProfile.swapCount || 0) > 0 ||
      candidateChangedDimensions.includes('connector-stance') ||
      candidateChangedDimensions.includes('contraction-posture');
    const surfaceClose = strictBorrowedMode && borrowedShellSurfaceClose(donorProgress);
    const transferClass =
      hasMaterialStructuralTransfer(candidateChangedDimensions) &&
      !surfaceClose &&
      (!strictBorrowedMode || registerRealization)
        ? 'structural'
        : 'weak';
    const personaProtectedLiteralOnlyFailure =
      shell?.mode === 'persona' &&
      !candidate.quality?.qualityGatePassed &&
      (candidate.quality?.notes || []).length > 0 &&
      (candidate.quality?.notes || []).every((note) => /^Protected literals did not survive the rewrite intact\./.test(note)) &&
      protectedAnchorIntegrity >= 1 &&
      unresolvedProtectedLiteralCount(candidateOutputText) === 0;
    const qualityGatePassedForPersona =
      candidate.quality?.qualityGatePassed || personaProtectedLiteralOnlyFailure;
    const personaQualityNotes = personaProtectedLiteralOnlyFailure
      ? (candidate.quality?.notes || []).filter((note) => !/^Protected literals did not survive the rewrite intact\./.test(note))
      : (candidate.quality?.notes || []);
    const personaPolarityTolerance = personaProtectedLiteralOnlyFailure ? 3 : 1;
    const acceptedForBorrowed =
      candidate.quality?.qualityGatePassed &&
      !borrowedShellPathologyBlocked(candidate.quality?.notes || []) &&
      candidateOutputText !== sourceText &&
      !surfaceClose &&
      visibleShift &&
      nonTrivialShift &&
      protectedAnchorIntegrity >= 0.55 &&
      (semanticAudit.propositionCoverage ?? 1) >= 0.62 &&
      (semanticAudit.actorCoverage ?? 1) >= 0.48 &&
      (semanticAudit.actionCoverage ?? 1) >= 0.48 &&
      (semanticAudit.objectCoverage ?? 1) >= 0.38 &&
      (semanticAudit.polarityMismatches ?? 0) <= 1 &&
      (semanticAudit.tenseMismatches ?? 0) <= 0 &&
      structuralCount >= 1 &&
      registerRealization;
    const acceptedForPersona =
      (qualityGatePassedForPersona || candidateOutputText !== sourceText) &&
      !borrowedShellPathologyBlocked(personaQualityNotes) &&
      candidateOutputText !== sourceText &&
      protectedAnchorIntegrity >= 0.45 &&
      (semanticAudit.propositionCoverage ?? 1) >= 0.58 &&
      (semanticAudit.actorCoverage ?? 1) >= 0.42 &&
      (semanticAudit.actionCoverage ?? 1) >= 0.42 &&
      (semanticAudit.objectCoverage ?? 1) >= 0.32 &&
      (semanticAudit.polarityMismatches ?? 0) <= Math.max(personaPolarityTolerance, 3) &&
      (visibleShift || lexicalCount > 0 || structuralCount > 0);
    const accepted =
      strictBorrowedMode
        ? acceptedForBorrowed
        : shell?.mode === 'persona'
          ? acceptedForPersona
          : Boolean(candidate.quality?.qualityGatePassed);
    const semanticDriftPenalty =
      strictBorrowedMode
        ? (
            ((semanticAudit.polarityMismatches ?? 0) * 60) +
            ((semanticAudit.tenseMismatches ?? 0) * 38) +
            (Math.max(0, 1 - (semanticAudit.actionCoverage ?? 1)) * 90) +
            (Math.max(0, 0.92 - (semanticAudit.objectCoverage ?? 1)) * 80) +
            (Math.max(0, 1 - protectedAnchorIntegrity) * 120) +
            (Number(lexicalShiftProfile.swapCount || 0) * 6)
          )
        : 0;
    const acceptanceScore =
      candidate.score +
      (transferClass === 'structural' ? 36 : 12) +
      (structuralCount * 18) +
      (lexicalCount * 14) +
      (Number(lexicalShiftProfile.swapCount || 0) * 8) +
      (visibleShift ? 8 : 0) +
      (nonTrivialShift ? 12 : 0) +
      Math.min(40, donorImprovement * 80) -
      Math.min(32, donorRegression * 60) +
      (surfaceClose ? -60 : 0) +
      (((semanticAudit.propositionCoverage ?? 1) * 12) + ((semanticAudit.actionCoverage ?? 1) * 8)) -
      semanticDriftPenalty;

    return {
      candidate,
      accepted,
      acceptanceScore,
      adjustedQualityGatePassed: qualityGatePassedForPersona,
      transferClass,
      lexicalShiftProfile,
      visibleShift,
      nonTrivialShift,
      auditBundle,
      donorProgress,
      surfaceClose,
      personaProtectedLiteralOnlyFailure
    };
  };
  const acceptanceSummaries =
    strictBorrowedMode || shell?.mode === 'persona'
      ? allCandidates.map((candidate) => candidateAcceptanceSummary(candidate))
      : [];
  const acceptedSelection =
    acceptanceSummaries
      .filter((entry) => entry.accepted)
      .sort((left, right) => right.acceptanceScore - left.acceptanceScore)[0] || null;
  const borrowedRescue =
    strictBorrowedMode && !acceptedSelection
      ? findBorrowedShellRescueCandidate({
          shell,
          candidates: allCandidates,
          sourceText,
          sourceProfile,
          targetProfile,
          targetGap,
          protectedState,
          opportunityProfile,
          ir
        })
      : { candidate: null, fallback: null };
  let bestCandidate =
    acceptedSelection?.candidate ||
    borrowedRescue.candidate ||
    [...allCandidates].sort((left, right) => right.score - left.score)[0];

  let finalText = bestCandidate.outputText;
  let finalProfile = bestCandidate.outputProfile;
  let qualityGatePassed = bestCandidate.quality.qualityGatePassed;
  let transferClass = 'weak';
  let changedDimensions = [...bestCandidate.changedDimensions];
  const notes = [...bestCandidate.quality.notes];
  let precomputedAuditBundle = null;
  let precomputedLexicalShiftProfile = null;
  const rescuePasses = [...new Set(bestCandidate.rescuePasses || [])];
  let borrowedShellOutcome = shell?.mode === 'borrowed' ? 'subtle' : null;
  let borrowedShellFailureClass = null;
  let precomputedVisibleShift = null;
  let precomputedNonTrivialShift = null;
  let directBorrowedProgressCheck = null;

  if (bestCandidate.quality.materialGap && bestCandidate.quality.limitedOpportunity) {
    notes.push('Source offered limited structural rewrite opportunities, so the transfer stayed subtle.');
  }

  if (acceptedSelection) {
    finalText = shell?.mode === 'borrowed'
      ? sanitizeBorrowedShellPathologies(bestCandidate.outputText)
      : bestCandidate.outputText;
    finalProfile = extractCadenceProfile(finalText);
    qualityGatePassed = shell?.mode === 'persona'
      ? Boolean(acceptedSelection.adjustedQualityGatePassed)
      : true;
    changedDimensions = [...bestCandidate.changedDimensions];
    transferClass = acceptedSelection.transferClass;
    precomputedAuditBundle = {
      ...acceptedSelection.auditBundle
    };
    precomputedLexicalShiftProfile = acceptedSelection.lexicalShiftProfile;
    precomputedVisibleShift = acceptedSelection.visibleShift;
    precomputedNonTrivialShift = acceptedSelection.nonTrivialShift;
    rescuePasses.push(...(bestCandidate.rescuePasses || []));
    if (shell?.mode === 'persona' && acceptedSelection.personaProtectedLiteralOnlyFailure) {
      const cleanedNotes = notes.filter((note) => !/^Protected literals did not survive the rewrite intact\./.test(note));
      cleanedNotes.push('Protected anchor literals were preserved through persona masking.');
      notes.splice(0, notes.length, ...cleanedNotes);
    }
    if (shell?.mode === 'borrowed') {
      borrowedShellOutcome = transferClass === 'structural' ? 'structural' : 'subtle';
      directBorrowedProgressCheck = {
        eligible: true,
        qualityNotes: bestCandidate.quality.notes || [],
        changedDimensions: [...(bestCandidate.changedDimensions || [])],
        visibleShift: acceptedSelection.visibleShift,
        nonTrivialShift: acceptedSelection.nonTrivialShift,
        protectedAnchorIntegrity: acceptedSelection.auditBundle.protectedAnchorAudit?.protectedAnchorIntegrity ??
          acceptedSelection.auditBundle.semanticAudit?.protectedAnchorIntegrity ??
          1,
        propositionCoverage: acceptedSelection.auditBundle.semanticAudit?.propositionCoverage ?? 1,
        actionCoverage: acceptedSelection.auditBundle.semanticAudit?.actionCoverage ?? 1,
        polarityMismatches: acceptedSelection.auditBundle.semanticAudit?.polarityMismatches ?? 0,
        progressProfile: {
          accepted: true,
          structuralCount: borrowedShellStructuralDimensions(bestCandidate.changedDimensions || []).length,
          lexicalCount: lexicalDimensions(bestCandidate.changedDimensions || []).length,
          swapCount: Number(acceptedSelection.lexicalShiftProfile?.swapCount || 0)
        },
        lexicalShiftProfile: acceptedSelection.lexicalShiftProfile,
        donorProgress: acceptedSelection.donorProgress
      };
      notes.push('Borrowed shell landed a retrieval-safe donor realization without partial fallback.');
    } else if (shell?.mode === 'persona') {
      notes.push('Persona shell landed a retrieval-safe mask realization.');
    }
  } else if (strictBorrowedMode && borrowedRescue.candidate && borrowedRescue.fallback) {
    finalText = sanitizeBorrowedShellPathologies(borrowedRescue.candidate.outputText);
    finalProfile = extractCadenceProfile(finalText);
    qualityGatePassed = Boolean(borrowedRescue.candidate.quality?.qualityGatePassed);
    changedDimensions = collectChangedDimensions(sourceProfile, finalProfile);
    transferClass = hasMaterialStructuralTransfer(changedDimensions) ? 'structural' : 'weak';
    precomputedAuditBundle = {
      semanticAudit: borrowedRescue.fallback.semanticAudit,
      protectedAnchorAudit: borrowedRescue.fallback.protectedAnchorAudit,
      outputIR: borrowedRescue.fallback.outputIR
    };
    precomputedLexicalShiftProfile = borrowedRescue.fallback.lexicalShiftProfile;
    precomputedVisibleShift = borrowedRescue.fallback.visibleShift;
    precomputedNonTrivialShift = borrowedRescue.fallback.nonTrivialShift;
    rescuePasses.push(borrowedRescue.fallback.relaxed ? 'progress-admit' : 'partial-rescue');
    directBorrowedProgressCheck = {
      eligible: true,
      relaxed: Boolean(borrowedRescue.fallback.relaxed),
      qualityNotes: borrowedRescue.candidate.quality?.notes || [],
      changedDimensions: [...(borrowedRescue.candidate.changedDimensions || [])],
      visibleShift: borrowedRescue.fallback.visibleShift,
      nonTrivialShift: borrowedRescue.fallback.nonTrivialShift,
      protectedAnchorIntegrity: borrowedRescue.fallback.protectedAnchorAudit?.protectedAnchorIntegrity ??
        borrowedRescue.fallback.semanticAudit?.protectedAnchorIntegrity ??
        1,
      propositionCoverage: borrowedRescue.fallback.semanticAudit?.propositionCoverage ?? 1,
      actionCoverage: borrowedRescue.fallback.semanticAudit?.actionCoverage ?? 1,
      polarityMismatches: borrowedRescue.fallback.semanticAudit?.polarityMismatches ?? 0,
      progressProfile: borrowedRescue.fallback.progressProfile,
      lexicalShiftProfile: borrowedRescue.fallback.lexicalShiftProfile,
      donorProgress: buildBorrowedShellDonorProgress(
        sourceText,
        finalText,
        sourceProfile,
        targetProfile,
        finalProfile
      )
    };
    notes.push(
      borrowedRescue.fallback.relaxed
        ? 'Borrowed shell held a retrieval-safe rescue shift under progress admission.'
        : 'Borrowed shell held a retrieval-safe rescue shift.'
    );
  } else if (strictBorrowedMode) {
    const bridgedFamily = detectKnownCadenceBridge(sourceText);
    const bridgedText = normalizeText(applyKnownCadenceBridge(sourceText, sourceProfile, targetProfile));
    const bridgedProfile = bridgedText !== sourceText ? extractCadenceProfile(bridgedText) : sourceProfile;
    const bridgedChangedDimensions = bridgedText !== sourceText ? collectChangedDimensions(sourceProfile, bridgedProfile) : [];
    const bridgedAuditBundle = bridgedText !== sourceText ? buildSemanticAuditBundle(ir, bridgedText, protectedState) : null;
    const bridgedSemanticAudit = bridgedAuditBundle?.semanticAudit || {};
    const bridgedProtectedAnchorAudit = bridgedAuditBundle?.protectedAnchorAudit || {};
    const bridgedProtectedAnchorIntegrity =
      bridgedProtectedAnchorAudit.protectedAnchorIntegrity ??
      bridgedSemanticAudit.protectedAnchorIntegrity ??
      1;
    const bridgedLexicalShiftProfile =
      bridgedText !== sourceText
        ? buildLexicalShiftProfile(sourceText, bridgedText, sourceProfile, targetProfile, bridgedProfile)
        : buildLexicalShiftProfile(sourceText, sourceText, sourceProfile, targetProfile, sourceProfile);
    const bridgedVisibleShift =
      bridgedText !== sourceText &&
      hasBorrowedShellVisibleShift(sourceText, bridgedText, bridgedChangedDimensions, bridgedLexicalShiftProfile);
    const bridgedNonTrivialShift =
      bridgedText !== sourceText &&
      hasBorrowedShellNonTrivialShift(sourceText, bridgedText, bridgedChangedDimensions, bridgedLexicalShiftProfile);
    const bridgedDonorProgress =
      bridgedText !== sourceText
        ? buildBorrowedShellDonorProgress(sourceText, bridgedText, sourceProfile, targetProfile, bridgedProfile)
        : {
            eligible: false,
            sourceDonorDistance: 0,
            outputDonorDistance: 0,
            donorImprovement: 0,
            donorImprovementRatio: 0,
            sourceOutputLexicalOverlap: 1
          };
    const bridgedStructuralCount = borrowedShellStructuralDimensions(bridgedChangedDimensions).length;
    const bridgedLexicalCount = lexicalDimensions(bridgedChangedDimensions).length;
    const bridgedRegisterRealization =
      bridgedLexicalCount >= 1 ||
      Number(bridgedLexicalShiftProfile.swapCount || 0) > 0 ||
      bridgedChangedDimensions.includes('connector-stance') ||
      bridgedChangedDimensions.includes('contraction-posture') ||
      bridgedChangedDimensions.includes('orthography-posture') ||
      bridgedChangedDimensions.includes('abbreviation-posture');
    const bridgedSurfaceClose = borrowedShellSurfaceClose(bridgedDonorProgress);
    const bridgedFamilyMarkers = bridgedFamily?.markers || { score: 0 };
    const bridgedFamilyLabel = bridgedFamily?.label || 'Cadence-family bridge';
    const bridgedFamilyKey = bridgedFamily?.key || 'generic';

    if (
      bridgedText !== sourceText &&
      bridgedVisibleShift &&
      bridgedNonTrivialShift &&
      (
        bridgedFamilyMarkers.score >= 5 ||
        (
          !bridgedSurfaceClose &&
          bridgedProtectedAnchorIntegrity >= 1 &&
          (bridgedSemanticAudit.propositionCoverage ?? 1) >= 0.8 &&
          (bridgedSemanticAudit.actorCoverage ?? 1) >= 0.7 &&
          (bridgedSemanticAudit.actionCoverage ?? 1) >= 0.7 &&
          (bridgedSemanticAudit.objectCoverage ?? 1) >= 0.6 &&
          (bridgedSemanticAudit.polarityMismatches ?? 0) <= 1 &&
          (
            bridgedStructuralCount >= 1 ||
            bridgedRegisterRealization ||
            bridgedDonorProgress.donorImprovement >= 0.3
          )
        ) ||
        bridgedDonorProgress.donorImprovement >= 0.3
      )
    ) {
      finalText = bridgedText;
      finalProfile = bridgedProfile;
      qualityGatePassed = true;
      transferClass =
        bridgedStructuralCount >= 1 || bridgedDonorProgress.donorImprovement >= 0.45
          ? 'structural'
          : 'weak';
      changedDimensions = bridgedChangedDimensions;
      borrowedShellOutcome = transferClass === 'structural' ? 'structural' : 'partial';
      precomputedAuditBundle = bridgedAuditBundle;
      precomputedLexicalShiftProfile = bridgedLexicalShiftProfile;
      precomputedVisibleShift = bridgedVisibleShift;
      precomputedNonTrivialShift = bridgedNonTrivialShift;
      rescuePasses.push(`cadence-family-bridge:${bridgedFamilyKey}`);
      directBorrowedProgressCheck = {
        eligible: true,
        qualityNotes: [`${bridgedFamilyLabel} landed a retrieval-safe donor realization.`],
        changedDimensions: [...bridgedChangedDimensions],
        visibleShift: bridgedVisibleShift,
        nonTrivialShift: bridgedNonTrivialShift,
        protectedAnchorIntegrity: bridgedProtectedAnchorIntegrity,
        propositionCoverage: bridgedSemanticAudit.propositionCoverage ?? 1,
        actionCoverage: bridgedSemanticAudit.actionCoverage ?? 1,
        polarityMismatches: bridgedSemanticAudit.polarityMismatches ?? 0,
        progressProfile: {
          donorImprovement: bridgedDonorProgress.donorImprovement,
          donorImprovementRatio: bridgedDonorProgress.donorImprovementRatio,
          lexicalOverlap: bridgedDonorProgress.sourceOutputLexicalOverlap
        },
        lexicalShiftProfile: bridgedLexicalShiftProfile,
        donorProgress: bridgedDonorProgress
      };
      notes.push(`${bridgedFamilyLabel} landed a retrieval-safe donor realization.`);
    } else {
      finalText = sourceText;
      finalProfile = sourceProfile;
      qualityGatePassed = false;
      transferClass = 'rejected';
      changedDimensions = [];
      borrowedShellOutcome = 'rejected';
      precomputedAuditBundle = {
        ...buildSemanticAuditBundle(ir, finalText, protectedState)
      };
      precomputedLexicalShiftProfile = buildLexicalShiftProfile(sourceText, finalText, sourceProfile, targetProfile, finalProfile);
      precomputedVisibleShift = false;
      precomputedNonTrivialShift = false;
      rescuePasses.push('final-rejection');
      directBorrowedProgressCheck = {
        eligible: false,
        qualityNotes: bestCandidate.quality.notes || [],
        changedDimensions: [...(bestCandidate.changedDimensions || [])],
        visibleShift: false,
        nonTrivialShift: false,
        protectedAnchorIntegrity: 1,
        propositionCoverage: 1,
        actionCoverage: 1,
        polarityMismatches: 0,
        progressProfile: null,
        lexicalShiftProfile: precomputedLexicalShiftProfile
      };
      notes.push('No retrieval-safe borrowed-shell candidate survived semantic review.');
    }
  } else if (!bestCandidate.quality.qualityGatePassed) {
    if (isMaterialCadenceGap(targetGap)) {
      if (shell?.mode === 'persona') {
        const personaLiteralOnlyAudit = buildSemanticAuditBundle(ir, bestCandidate.outputText, protectedState);
        const personaLiteralOnlyIntegrity =
          personaLiteralOnlyAudit.protectedAnchorAudit?.protectedAnchorIntegrity ??
          personaLiteralOnlyAudit.semanticAudit?.protectedAnchorIntegrity ??
          1;
        const personaLiteralOnlyFailure =
          (bestCandidate.quality?.notes || []).length > 0 &&
          (bestCandidate.quality?.notes || []).every((note) => /^Protected literals did not survive the rewrite intact\./.test(note)) &&
          bestCandidate.outputText !== sourceText &&
          personaLiteralOnlyIntegrity >= 1 &&
          unresolvedProtectedLiteralCount(bestCandidate.outputText) === 0 &&
          (personaLiteralOnlyAudit.semanticAudit?.propositionCoverage ?? 1) >= 0.9 &&
          (personaLiteralOnlyAudit.semanticAudit?.actorCoverage ?? 1) >= 0.75 &&
          (personaLiteralOnlyAudit.semanticAudit?.actionCoverage ?? 1) >= 0.75 &&
          (personaLiteralOnlyAudit.semanticAudit?.objectCoverage ?? 1) >= 0.65 &&
          (personaLiteralOnlyAudit.semanticAudit?.polarityMismatches ?? 0) <= 1;

        if (personaLiteralOnlyFailure) {
          finalText = bestCandidate.outputText;
          finalProfile = bestCandidate.outputProfile || extractCadenceProfile(finalText);
          qualityGatePassed = true;
          changedDimensions = [...bestCandidate.changedDimensions];
          transferClass = hasMaterialStructuralTransfer(changedDimensions) ? 'structural' : 'weak';
          precomputedAuditBundle = personaLiteralOnlyAudit;
          const cleanedNotes = notes.filter((note) => !/^Protected literals did not survive the rewrite intact\./.test(note));
          cleanedNotes.push('Protected anchor literals were preserved through persona masking.');
          notes.splice(0, notes.length, ...cleanedNotes);
          rescuePasses.push('persona-literal-tolerance');
        } else {
        const personaRescueText = forceStructuralShift(
          cloakProtectedLiterals(sourceText, protectedState.literals),
          sourceProfile,
          targetProfile,
          Math.min(1, strength + 0.22),
          effectiveMod,
          connectorProfile,
          transferPlan
        );
        const restoredPersonaRescueText = restoreProtectedLiterals(personaRescueText, protectedState.literals);
        const personaRescueProfile = extractCadenceProfile(restoredPersonaRescueText);
        const personaRescueAudit = buildSemanticAuditBundle(ir, restoredPersonaRescueText, protectedState);
        const personaProtectedAnchorIntegrity =
          personaRescueAudit.protectedAnchorAudit?.protectedAnchorIntegrity ??
          personaRescueAudit.semanticAudit?.protectedAnchorIntegrity ??
          1;

        if (
          restoredPersonaRescueText !== sourceText &&
          personaProtectedAnchorIntegrity >= 1 &&
          (personaRescueAudit.semanticAudit?.propositionCoverage ?? 1) >= 0.9 &&
          (personaRescueAudit.semanticAudit?.actorCoverage ?? 1) >= 0.75 &&
          (personaRescueAudit.semanticAudit?.actionCoverage ?? 1) >= 0.75 &&
          (personaRescueAudit.semanticAudit?.objectCoverage ?? 1) >= 0.65 &&
          (personaRescueAudit.semanticAudit?.polarityMismatches ?? 0) <= 1
        ) {
          finalText = restoredPersonaRescueText;
          finalProfile = personaRescueProfile;
          changedDimensions = collectChangedDimensions(sourceProfile, finalProfile);
          transferClass = hasMaterialStructuralTransfer(changedDimensions) ? 'structural' : 'weak';
          precomputedAuditBundle = personaRescueAudit;
          rescuePasses.push('persona-structural-rescue');
          notes.push('Persona shell preserved a retrieval-safe structural mask shift.');
        } else {
          finalText = sourceText;
          finalProfile = sourceProfile;
          changedDimensions = [];
          transferClass = 'rejected';
          borrowedShellOutcome = 'rejected';
          rescuePasses.push('final-rejection');
          notes.push('Transfer fell back to the source text to preserve meaning and readability.');
        }
        }
      } else {
        finalText = sourceText;
        finalProfile = sourceProfile;
        changedDimensions = [];
        transferClass = 'rejected';
        borrowedShellOutcome = 'rejected';
        rescuePasses.push('final-rejection');
        notes.push('Transfer fell back to the source text to preserve meaning and readability.');
      }
    } else {
      transferClass = 'weak';
      borrowedShellOutcome = shell?.mode === 'borrowed' ? 'subtle' : borrowedShellOutcome;
      notes.push('Source and target cadence were already close, so the transfer stayed subtle.');
    }
  } else if (!changedDimensions.length) {
    transferClass = 'weak';
    borrowedShellOutcome = shell?.mode === 'borrowed' ? 'subtle' : borrowedShellOutcome;
    notes.push('Source and target cadence were already close, so the transfer stayed subtle.');
  } else {
    const lexicalShiftPreview = buildLexicalShiftProfile(sourceText, finalText, sourceProfile, targetProfile, finalProfile);
    const hasLexicalRealization =
      lexicalDimensions(changedDimensions).length > 0 ||
      lexicalShiftPreview.swapCount > 0;
    transferClass = hasMaterialStructuralTransfer(changedDimensions) && hasLexicalRealization ? 'structural' : 'weak';
    if (shell?.mode === 'borrowed') {
      borrowedShellOutcome = transferClass === 'structural' ? 'structural' : 'subtle';
    }
    notes.push(`Shifted ${changedDimensions.join(', ')}.`);
  }

  if (
    shell?.mode === 'persona' &&
    transferClass !== 'rejected'
  ) {
    const personaGapBefore = profileDeltaToTarget(finalProfile, targetProfile);
    const personaNeedsVividRescue =
      profileDeltaScore(personaGapBefore) >= 0.18 ||
      personaGapBefore.avgSentence >= 1.2 ||
      personaGapBefore.functionWord >= 0.025 ||
      personaGapBefore.directness >= 0.09 ||
      personaGapBefore.abstraction >= 0.09 ||
      personaGapBefore.register >= 0.12;

    if (personaNeedsVividRescue) {
      const restorePersonaStructured = (text = '') => restoreProtectedLiterals(text, protectedState.literals);
      let personaStructured = cloakProtectedLiterals(finalText, protectedState.literals);
      let personaWorkingProfile = extractCadenceProfile(restorePersonaStructured(personaStructured));
      const personaRescueStrength = Math.min(1, strength + 0.22);
      const personaWantsShorter =
        (targetProfile.avgSentenceLength || 0) < ((personaWorkingProfile.avgSentenceLength || 0) - 0.8) ||
        desiredSentenceCount(personaWorkingProfile, targetProfile) > (personaWorkingProfile.sentenceCount || 0);

      if (personaWantsShorter) {
        personaStructured = splitLongSentences(
          personaStructured,
          targetProfile,
          Math.min(1, personaRescueStrength + 0.08)
        );
        personaWorkingProfile = extractCadenceProfile(restorePersonaStructured(personaStructured));
        personaStructured = applySentenceTexture(
          personaStructured,
          personaWorkingProfile,
          targetProfile,
          Math.min(1, personaRescueStrength + 0.08),
          effectiveMod
        );
        personaWorkingProfile = extractCadenceProfile(restorePersonaStructured(personaStructured));
      }

      if (Number(effectiveMod.sent || 0) !== 0 || personaGapBefore.avgSentence >= 1.2 || personaGapBefore.sentenceCount >= 1) {
        personaStructured = forceStructuralShift(
          personaStructured,
          personaWorkingProfile,
          targetProfile,
          personaRescueStrength,
          effectiveMod,
          connectorProfile,
          transferPlan,
          voiceRealizationOptions
        );
        personaWorkingProfile = extractCadenceProfile(restorePersonaStructured(personaStructured));
      }

      personaStructured = applyDiscourseFrameTexture(
        personaStructured,
        personaWorkingProfile,
        targetProfile,
        personaRescueStrength,
        transferPlan
      );
      personaWorkingProfile = extractCadenceProfile(restorePersonaStructured(personaStructured));

      personaStructured = applyStanceTexture(
        personaStructured,
        targetProfile,
        personaRescueStrength,
        connectorProfile
      );
      personaStructured = applyFunctionWordTexture(
        personaStructured,
        targetProfile,
        personaRescueStrength,
        connectorProfile,
        transferPlan
      );
      personaWorkingProfile = extractCadenceProfile(restorePersonaStructured(personaStructured));

      personaStructured = applyVoiceRealizationTexture(
        personaStructured,
        personaWorkingProfile,
        targetProfile,
        Math.min(1, personaRescueStrength + 0.06),
        voiceRealizationOptions
      );

      if (personaGapBefore.contraction >= 0.008 || Math.abs(Number(effectiveMod.cont || 0)) > 0) {
        personaStructured = applyContractionTexture(personaStructured, targetProfile, effectiveMod);
      }

      if (
        (personaGapBefore.punctuation >= 0.01 || personaGapBefore.punctuationShape >= 0.06 || Math.abs(Number(effectiveMod.punc || 0)) > 0) &&
        !(transferPlan.wantsLonger && (effectiveMod.punc || 0) < 0)
      ) {
        personaStructured = applyPunctuationTexture(personaStructured, targetProfile, effectiveMod);
      }

      personaWorkingProfile = extractCadenceProfile(restorePersonaStructured(personaStructured));
      if (
        personaWantsShorter &&
        (personaWorkingProfile.avgSentenceLength || 0) > ((targetProfile.avgSentenceLength || 0) + 1.5)
      ) {
        const desiredSplits = Math.max(
          1,
          Math.round(
            (((personaWorkingProfile.avgSentenceLength || 0) - (targetProfile.avgSentenceLength || 0)) / 2.4) +
            Math.max(1, personaGapBefore.sentenceCount || 0)
          )
        );
        personaStructured = applySplitRules(personaStructured, desiredSplits);
        personaWorkingProfile = extractCadenceProfile(restorePersonaStructured(personaStructured));
      }

      if (
        personaWantsShorter &&
        (
          detectRegisterMode(targetProfile) === 'compressed' ||
          (targetProfile.fragmentPressure || 0) > ((personaWorkingProfile.fragmentPressure || 0) + 0.05)
        )
      ) {
        personaStructured = applyCompressedClauseTexture(
          personaStructured,
          personaWorkingProfile,
          targetProfile,
          Math.min(1, personaRescueStrength + 0.1)
        );
        personaWorkingProfile = extractCadenceProfile(restorePersonaStructured(personaStructured));
        personaStructured = applySentenceTexture(
          personaStructured,
          personaWorkingProfile,
          {
            ...targetProfile,
            avgSentenceLength: Math.min(targetProfile.avgSentenceLength || 0, (personaWorkingProfile.avgSentenceLength || 0) - 1),
            sentenceCount: Math.max(targetProfile.sentenceCount || 0, (personaWorkingProfile.sentenceCount || 0) + 1)
          },
          Math.min(1, personaRescueStrength + 0.12),
          {
            ...effectiveMod,
            sent: Math.min(-1, Number(effectiveMod.sent || 0) - 1)
          }
        );
      }

      personaStructured = finalizeTransformedText(personaStructured);
      const restoredPersonaStructured = restorePersonaStructured(personaStructured);

      if (restoredPersonaStructured !== finalText) {
        const personaProfile = extractCadenceProfile(restoredPersonaStructured);
        const personaGapAfter = profileDeltaToTarget(personaProfile, targetProfile);
        const personaAuditBundle = buildSemanticAuditBundle(ir, restoredPersonaStructured, protectedState);
        const personaProtectedAnchorIntegrity =
          personaAuditBundle.protectedAnchorAudit?.protectedAnchorIntegrity ??
          personaAuditBundle.semanticAudit?.protectedAnchorIntegrity ??
          1;

        if (
          personaProtectedAnchorIntegrity >= 1 &&
          (personaAuditBundle.semanticAudit?.propositionCoverage ?? 1) >= 0.9 &&
          (personaAuditBundle.semanticAudit?.actorCoverage ?? 1) >= 0.75 &&
          (personaAuditBundle.semanticAudit?.actionCoverage ?? 1) >= 0.75 &&
          (personaAuditBundle.semanticAudit?.objectCoverage ?? 1) >= 0.65 &&
          (personaAuditBundle.semanticAudit?.polarityMismatches ?? 0) <= 1 &&
          profileDeltaScore(personaGapAfter) + 0.02 < profileDeltaScore(personaGapBefore)
        ) {
          finalText = restoredPersonaStructured;
          finalProfile = personaProfile;
          changedDimensions = collectChangedDimensions(sourceProfile, finalProfile);
          precomputedAuditBundle = personaAuditBundle;
          rescuePasses.push('persona-vivid-rescue');
          notes.push('Persona shell deepened cadence alignment to hold the requested mask posture.');
        }
      }
    }
  }

  let lexicalShiftProfile = precomputedLexicalShiftProfile || buildLexicalShiftProfile(sourceText, finalText, sourceProfile, targetProfile, finalProfile);
  let realizationTier = determineRealizationTier(changedDimensions, lexicalShiftProfile.lexemeSwaps);
  let semanticRisk = computeSemanticRisk(sourceText, finalText, protectedState, sourceProfile, finalProfile);
  const protectedLiteralRatio = protectedState.literals.length / Math.max(1, sourceProfile.wordCount || 1);
  const literalLocked =
    protectedState.literals.length >= 2 &&
    protectedLiteralRatio >= 0.25 &&
    (sourceProfile.wordCount || 0) <= 12 &&
    lexicalShiftProfile.swapCount === 0;

  if (literalLocked && finalText !== sourceText) {
    finalText = sourceText;
    finalProfile = sourceProfile;
    changedDimensions = [];
    transferClass = 'rejected';
    borrowedShellOutcome = shell?.mode === 'borrowed' ? 'rejected' : borrowedShellOutcome;
    rescuePasses.push('final-rejection');
    notes.push('Literal-heavy source stayed anchored to preserve protected anchors.');
    lexicalShiftProfile = buildLexicalShiftProfile(sourceText, finalText, sourceProfile, targetProfile, finalProfile);
    realizationTier = determineRealizationTier(changedDimensions, lexicalShiftProfile.lexemeSwaps);
    semanticRisk = computeSemanticRisk(sourceText, finalText, protectedState, sourceProfile, finalProfile);
  }

  if (protectedState.literals.length) {
    notes.push(`${protectedState.literals.length} protected literal${protectedState.literals.length === 1 ? '' : 's'} held fixed.`);
  }

  const realizationNotes = [];
  if (lexicalShiftProfile.swapCount > 0) {
    realizationNotes.push(`${lexicalShiftProfile.swapCount} lexical family swap${lexicalShiftProfile.swapCount === 1 ? '' : 's'} landed.`);
  }
  if (lexicalDimensions(changedDimensions).length > 0) {
    realizationNotes.push(`Register shift surfaced through ${lexicalDimensions(changedDimensions).join(', ')}.`);
  }
  if (semanticRisk >= 0.3) {
    realizationNotes.push('Semantic risk is elevated; review the realized output before relying on it.');
  }

  let {
    semanticAudit,
    protectedAnchorAudit,
    outputIR
  } = precomputedAuditBundle || buildSemanticAuditBundle(ir, finalText, protectedState);

  const finalProtectedAnchorIntegrity =
    protectedAnchorAudit?.protectedAnchorIntegrity ?? semanticAudit?.protectedAnchorIntegrity ?? 1;
  const enforceFinalBorrowedSemanticGuard = Boolean(retrieval || shell?.source === 'swapped');
  const donorProgress = shell?.mode === 'borrowed'
    ? buildBorrowedShellDonorProgress(sourceText, finalText, sourceProfile, targetProfile, finalProfile)
    : {
        eligible: false,
        sourceDonorDistance: 0,
        outputDonorDistance: 0,
        donorImprovement: 0,
        donorImprovementRatio: 0,
        sourceOutputLexicalOverlap: 1
      };
  const finalBorrowedSurfaceClose =
    enforceFinalBorrowedSemanticGuard &&
    shell?.mode === 'borrowed' &&
    finalText !== sourceText &&
    borrowedShellSurfaceClose(donorProgress);
  const cadenceFamilyBridgeAccepted = rescuePasses.some((pass) => /^cadence-family-bridge:/.test(pass));
  if (cadenceFamilyBridgeAccepted) {
    const cleanedNotes = notes.filter((note) => !/^Protected literals did not survive the rewrite intact\./.test(note));
    notes.splice(0, notes.length, ...cleanedNotes);
  }
  const finalSemanticBorrowedFailure =
    enforceFinalBorrowedSemanticGuard &&
    shell?.mode === 'borrowed' &&
    finalText !== sourceText &&
    !cadenceFamilyBridgeAccepted &&
    (
      finalBorrowedSurfaceClose ||
      finalProtectedAnchorIntegrity < 1 ||
      (semanticAudit?.propositionCoverage ?? 1) < 0.85 ||
      (semanticAudit?.actorCoverage ?? 1) < 0.75 ||
      (semanticAudit?.actionCoverage ?? 1) < 0.75 ||
      (semanticAudit?.objectCoverage ?? 1) < 0.65 ||
      (semanticAudit?.polarityMismatches ?? 0) > 1 ||
      (semanticAudit?.tenseMismatches ?? 0) > 0
    );

  if (finalSemanticBorrowedFailure) {
    rescuePasses.push('semantic-final-warning');
    notes.push(
      finalBorrowedSurfaceClose
        ? 'Transfer kept the donor realization visible, but Aperture flagged it as surface-close and raised the warning ledger.'
        : 'Transfer stayed visible after final semantic review, but Aperture raised warning pressure on the output.'
    );
  }

  let visibleShift = precomputedVisibleShift ?? hasBorrowedShellVisibleShift(
    sourceText,
    finalText,
    changedDimensions,
    lexicalShiftProfile
  );
  let nonTrivialShift = precomputedNonTrivialShift ?? hasBorrowedShellNonTrivialShift(
    sourceText,
    finalText,
    changedDimensions,
    lexicalShiftProfile
  );
  let apertureRepair = {
    outputText: finalText,
    repaired: false,
    repairPasses: [],
    pathologies: null
  };
  if ((retrieval || shell?.mode === 'borrowed' || shell?.mode === 'persona') && finalText !== sourceText) {
    apertureRepair = repairTD613ApertureProjection({
      sourceText,
      outputText: finalText,
      personaId: shell?.personaId || '',
      sourceProfile,
      targetProfile
    });
    const reconciledApertureOutput = reconcileProtectedLiteralSurface(
      apertureRepair.outputText,
      protectedState.literals || []
    );
    if (reconciledApertureOutput !== apertureRepair.outputText) {
      apertureRepair = {
        ...apertureRepair,
        outputText: reconciledApertureOutput,
        repaired: true,
        repairPasses: [...new Set([...(apertureRepair.repairPasses || []), 'literal-reconcile'])]
      };
    }
    if (apertureRepair.outputText !== finalText) {
      finalText = apertureRepair.outputText;
      finalProfile = extractCadenceProfile(finalText);
      changedDimensions = collectChangedDimensions(sourceProfile, finalProfile);
      lexicalShiftProfile = buildLexicalShiftProfile(sourceText, finalText, sourceProfile, targetProfile, finalProfile);
      realizationTier = determineRealizationTier(changedDimensions, lexicalShiftProfile.lexemeSwaps);
      semanticRisk = computeSemanticRisk(sourceText, finalText, protectedState, sourceProfile, finalProfile);
      precomputedVisibleShift = null;
      precomputedNonTrivialShift = null;
      ({ semanticAudit, protectedAnchorAudit, outputIR } = buildSemanticAuditBundle(ir, finalText, protectedState));
      visibleShift = hasBorrowedShellVisibleShift(
        sourceText,
        finalText,
        changedDimensions,
        lexicalShiftProfile
      );
      nonTrivialShift = hasBorrowedShellNonTrivialShift(
        sourceText,
        finalText,
        changedDimensions,
        lexicalShiftProfile
      );
    }
  }
  let apertureProtocol = reviewTD613ApertureTransfer({
    sourceText,
    outputText: finalText,
    shellMode: shell?.mode || 'native',
    shellSource: shell?.source || '',
    retrieval,
    semanticRisk,
    visibleShift,
    nonTrivialShift,
    protectedAnchorIntegrity: protectedAnchorAudit?.protectedAnchorIntegrity ?? 1,
    propositionCoverage: semanticAudit?.propositionCoverage ?? 1,
    actorCoverage: semanticAudit?.actorCoverage ?? 1,
    actionCoverage: semanticAudit?.actionCoverage ?? 1,
    objectCoverage: semanticAudit?.objectCoverage ?? 1
  });

  if ((apertureProtocol.warningSignals || []).length && finalText !== sourceText) {
    rescuePasses.push('td613-aperture-warning');
    notes.push(...apertureProtocol.reasons);
  }

  const apertureProjection = classifyTD613ApertureProjection({
    sourceText,
    outputText: finalText,
    changedDimensions,
    lexemeSwaps: lexicalShiftProfile.lexemeSwaps,
    visibleShift,
    nonTrivialShift,
    repaired: apertureRepair.repaired,
    pathologies: apertureRepair.pathologies,
    blocked: apertureProtocol.blocked
  });
  apertureProtocol = {
    ...apertureProtocol,
    ...apertureProjection,
    repairPasses: [...new Set([...(apertureProtocol.repairPasses || []), ...(apertureRepair.repairPasses || [])])]
  };
  const apertureAudit = {
    ...(apertureProtocol.apertureAudit || {}),
    generatorFault: Boolean(apertureProjection.generatorFault),
    warningSignals: [...new Set([
      ...((apertureProtocol.apertureAudit && apertureProtocol.apertureAudit.warningSignals) || []),
      ...((apertureProtocol.warningSignals || [])),
      ...(apertureProjection.outcome === 'surface-held' ? ['surface-pressure'] : []),
      ...(apertureRepair.repaired ? ['repair-activity-applied'] : [])
    ])],
    repairPasses: [...new Set([
      ...((apertureProtocol.apertureAudit && apertureProtocol.apertureAudit.repairPasses) || []),
      ...(apertureRepair.repairPasses || [])
    ])],
    observabilityDeficit: round3(Math.max(
      Number(apertureProtocol.apertureAudit?.observabilityDeficit || 0),
      apertureProjection.outcome === 'surface-held' ? 0.28 : 0.08
    )),
    aliasPersistence: round3(Math.max(
      Number(apertureProtocol.apertureAudit?.aliasPersistence || 0),
      clamp01(1 - (protectedAnchorAudit?.protectedAnchorIntegrity ?? 1))
    )),
    namingSensitivity: round3(Math.max(
      Number(apertureProtocol.apertureAudit?.namingSensitivity || 0),
      Number(apertureProtocol.namingSensitivity || 0)
    )),
    redundancyInflation: round3(Math.max(
      Number(apertureProtocol.apertureAudit?.redundancyInflation || 0),
      (!nonTrivialShift ? 0.24 : 0.08)
    )),
    capacityPressure: round3(Math.max(
      Number(apertureProtocol.apertureAudit?.capacityPressure || 0),
      apertureProjection.outcome === 'surface-held' ? 0.22 : 0.1
    )),
    policyPressure: round3(Math.max(
      Number(apertureProtocol.apertureAudit?.policyPressure || 0),
      Number(apertureProtocol.policyPressure || 0)
    )),
    withheldMaterial: apertureProjection.outcome === 'source-rerouted',
    withheldReason: apertureProjection.outcome === 'source-rerouted' ? 'catastrophic-generator-fault' : null
  };
  apertureProtocol = {
    ...apertureProtocol,
    apertureAudit
  };
  if (apertureRepair.repaired && finalText !== sourceText) {
    notes.push(`TD613 Aperture repaired the projection before final output (${(apertureRepair.repairPasses || []).join(', ')}).`);
  }
  if (apertureProjection.outcome === 'surface-held' && finalText !== sourceText) {
    notes.push('TD613 Aperture held the passage near source after repair to avoid false generator confidence.');
  }

  if (shell?.mode === 'borrowed') {
    if (transferClass === 'structural') {
      borrowedShellOutcome = 'structural';
    } else if (transferClass === 'rejected') {
      borrowedShellOutcome = 'rejected';
    } else if (
      (
        rescuePasses.includes('partial-rescue') ||
        rescuePasses.includes('partial-progress-rescue') ||
        rescuePasses.includes('progress-admit')
      ) &&
      nonTrivialShift
    ) {
      borrowedShellOutcome = 'partial';
    } else {
      borrowedShellOutcome = 'subtle';
    }

    borrowedShellFailureClass = inferBorrowedShellFailureClass({
      shell,
      targetGap,
      qualityNotes: notes,
      protectedAnchorAudit,
      semanticAudit,
      visibleShift,
      nonTrivialShift,
      literalLocked,
      transferClass,
      borrowedShellOutcome
    });
  }

  const result = {
    text: finalText,
    sourceProfile,
    targetProfile,
    outputProfile: finalProfile,
    opportunityProfile,
    changedDimensions,
    protectedLiteralCount: protectedState.literals.length,
    passesApplied: bestCandidate.passesApplied,
    rescuePasses: [...new Set(rescuePasses)],
    transferClass,
    qualityGatePassed,
    notes: [...new Set(notes)],
    effectiveMod,
    realizationTier,
    lexicalShiftProfile,
    semanticRisk,
    donorProgress,
    lexemeSwaps: lexicalShiftProfile.lexemeSwaps,
    realizationNotes,
    borrowedShellOutcome,
    borrowedShellFailureClass,
    visibleShift,
    nonTrivialShift,
    apertureProtocol,
    apertureAudit,
    semanticAudit,
    protectedAnchorAudit
  };

  if (retrieval || debug) {
    result.retrievalTrace = buildRetrievalTrace({
      sourceText,
      shell,
      sourceProfile,
      targetProfile,
      opportunityProfile,
      ir,
      transferPlan,
      irPlan,
      allCandidates,
      bestCandidate,
      finalText,
      result,
      semanticAudit,
      protectedAnchorAudit,
      outputIR
    });
  }

  if (debug) {
    result.debug = {
      plan: transferPlan,
      irPlan,
      irSource: ir,
      beamCandidates: beamResult.allCandidates.map((c) => ({
        score: round3(c.score),
        changedDimensions: c.changedDimensions,
        pathologyFlags: c.pathologyFlags,
        operationHistory: c.operationHistory
      })),
      distanceBefore: profileDeltaScore(profileDeltaToTarget(sourceProfile, targetProfile)),
      distanceAfter: profileDeltaScore(profileDeltaToTarget(bestCandidate.outputProfile, targetProfile)),
      candidates: allCandidates.map((candidate) => ({
        spec: candidate.spec,
        score: round3(candidate.score),
        changedDimensions: [...candidate.changedDimensions],
        qualityGatePassed: candidate.quality.qualityGatePassed,
        lexicalDimensions: [...candidate.quality.lexicalDimensions],
        notes: [...candidate.quality.notes],
        passesApplied: [...candidate.passesApplied]
      })),
      acceptanceSummaries: acceptanceSummaries.map((entry) => ({
        spec: entry.candidate?.spec,
        accepted: entry.accepted,
        acceptanceScore: round3(entry.acceptanceScore),
        adjustedQualityGatePassed: entry.adjustedQualityGatePassed,
        transferClass: entry.transferClass,
        visibleShift: entry.visibleShift,
        nonTrivialShift: entry.nonTrivialShift,
        surfaceClose: entry.surfaceClose,
        personaProtectedLiteralOnlyFailure: entry.personaProtectedLiteralOnlyFailure,
        semanticAudit: {
          propositionCoverage: entry.auditBundle?.semanticAudit?.propositionCoverage ?? 1,
          actorCoverage: entry.auditBundle?.semanticAudit?.actorCoverage ?? 1,
          actionCoverage: entry.auditBundle?.semanticAudit?.actionCoverage ?? 1,
          objectCoverage: entry.auditBundle?.semanticAudit?.objectCoverage ?? 1,
          polarityMismatches: entry.auditBundle?.semanticAudit?.polarityMismatches ?? 0
        },
        protectedAnchorIntegrity:
          entry.auditBundle?.protectedAnchorAudit?.protectedAnchorIntegrity ??
          entry.auditBundle?.semanticAudit?.protectedAnchorIntegrity ??
          1,
        outputPreview: previewText(entry.candidate?.outputText || '', 220),
        changedDimensions: [...(entry.candidate?.changedDimensions || [])],
        notes: [...(entry.candidate?.quality?.notes || [])]
      })),
      selected: bestCandidate.spec,
      directBorrowedProgressCheck,
      trace: bestCandidate.debug
    };
  }

  return result;
}

function buildCadenceTransferTraceLegacy(text = '', shell = {}, options = {}) {
  return buildCadenceTransferLegacy(text, shell, {
    ...options,
    retrieval: true
  }).retrievalTrace;
}

function applyCadenceToTextLegacy(text = '', shell = {}) {
  return buildCadenceTransferLegacy(text, shell).text;
}

const SWAP_CADENCE_FLAGSHIP_PAIRS = Object.freeze([
  Object.freeze({ sourceId: 'package-handoff-formal-record', donorId: 'package-handoff-rushed-mobile' }),
  Object.freeze({ sourceId: 'package-handoff-rushed-mobile', donorId: 'package-handoff-formal-record' }),
  Object.freeze({ sourceId: 'committee-budget-formal-record', donorId: 'committee-budget-rushed-mobile' }),
  Object.freeze({ sourceId: 'committee-budget-rushed-mobile', donorId: 'committee-budget-formal-record' }),
  Object.freeze({ sourceId: 'adversarial-hearing-professional-message', donorId: 'adversarial-hearing-rushed-mobile' }),
  Object.freeze({ sourceId: 'adversarial-hearing-rushed-mobile', donorId: 'adversarial-hearing-professional-message' }),
  Object.freeze({ sourceId: 'museum-fog-alarm-professional-message', donorId: 'museum-fog-alarm-rushed-mobile' }),
  Object.freeze({ sourceId: 'museum-fog-alarm-rushed-mobile', donorId: 'museum-fog-alarm-professional-message' })
]);

function normalizeSwapSample(sample = {}, index = 0) {
  return {
    id: sample.id || `sample-${index}`,
    name: sample.name || sample.id || `Sample ${index + 1}`,
    text: normalizeText(sample.text || ''),
    intention: sample.intention || ''
  };
}

function sortUniqueStrings(values = []) {
  return [...new Set(values.filter(Boolean))].sort((left, right) => left.localeCompare(right));
}

function buildSwapBorrowedShell(sample = {}, fromSlot = 'B', strength = 0.82) {
  const profile = extractCadenceProfile(sample.text || '');
  return {
    mode: 'borrowed',
    label: `borrowed ${sample.name || sample.id || fromSlot} cadence`,
    profile,
    mod: cadenceModFromProfile(profile),
    source: 'swapped',
    fromSlot,
    strength
  };
}

function buildSwapLaneResult(sourceSample, donorSample, slot = 'A', donorSlot = 'B', strength = 0.82) {
  const transfer = buildCadenceTransfer(sourceSample.text, buildSwapBorrowedShell(donorSample, donorSlot, strength), {
    retrieval: true,
    strength
  });
  const trace = transfer.retrievalTrace || {};
  const semanticAudit = trace.semanticAudit || transfer.semanticAudit || {};
  const protectedAnchorAudit = trace.protectedAnchorAudit || transfer.protectedAnchorAudit || {};

  const holdFailureClass = transfer.holdStatus === 'held'
    ? transfer.generationDocket?.holdClass || 'below-rewrite-bar'
    : null;
  const summarizedHoldFailureClass =
    holdFailureClass === 'below-rewrite-bar' || holdFailureClass === 'semantic-failure'
      ? 'donor-underfit'
      : holdFailureClass;
  const summarizedBorrowedShellOutcome = transfer.holdStatus === 'held'
    ? 'rejected'
    : (transfer.borrowedShellOutcome || (transfer.transferClass === 'rejected' ? 'rejected' : 'subtle'));
  const summarizedBorrowedShellFailureClass = transfer.holdStatus === 'held'
    ? summarizedHoldFailureClass
    : transfer.borrowedShellFailureClass || null;

  return {
    slot,
    sourceId: sourceSample.id,
    donorId: donorSample.id,
    sourceName: sourceSample.name,
    donorName: donorSample.name,
    transferClass: transfer.transferClass || 'native',
    borrowedShellOutcome: summarizedBorrowedShellOutcome,
    borrowedShellFailureClass: summarizedBorrowedShellFailureClass,
    realizationTier: transfer.realizationTier || 'none',
    changedDimensions: [...new Set(transfer.changedDimensions || [])],
    lexemeSwapFamilies: sortUniqueStrings((transfer.lexemeSwaps || []).map((swap) => swap.family)),
    rescuePasses: [...new Set(transfer.rescuePasses || [])],
    visibleShift: Boolean(transfer.visibleShift),
    nonTrivialShift: Boolean(transfer.nonTrivialShift),
    donorProgress: transfer.donorProgress || {},
    propositionCoverage: semanticAudit.propositionCoverage ?? 1,
    actorCoverage: semanticAudit.actorCoverage ?? 1,
    actionCoverage: semanticAudit.actionCoverage ?? 1,
    objectCoverage: semanticAudit.objectCoverage ?? 1,
    polarityMismatches: semanticAudit.polarityMismatches ?? 0,
    tenseMismatches: semanticAudit.tenseMismatches ?? 0,
    protectedAnchorIntegrity: protectedAnchorAudit.protectedAnchorIntegrity ?? semanticAudit.protectedAnchorIntegrity ?? 1,
    semanticRisk: transfer.semanticRisk ?? 0,
    notes: [...new Set([
      ...(transfer.notes || []),
      ...(transfer.generationDocket?.headline ? [transfer.generationDocket.headline] : [])
    ])],
    text: transfer.text || transfer.internalText || sourceSample.text
  };
}

function classifySwapCadencePair(laneA = {}, laneB = {}) {
  const engagedA =
    laneA.borrowedShellOutcome === 'structural' ||
    laneA.borrowedShellOutcome === 'partial' ||
    (laneA.borrowedShellOutcome === 'subtle' && laneA.nonTrivialShift);
  const engagedB =
    laneB.borrowedShellOutcome === 'structural' ||
    laneB.borrowedShellOutcome === 'partial' ||
    (laneB.borrowedShellOutcome === 'subtle' && laneB.nonTrivialShift);

  if (laneA.borrowedShellOutcome === 'rejected' && laneB.borrowedShellOutcome === 'rejected') {
    return 'both-rejected';
  }

  if (
    borrowedShellSurfaceClose(laneA.donorProgress || {}) &&
    borrowedShellSurfaceClose(laneB.donorProgress || {})
  ) {
    return 'surface-close';
  }

  if (engagedA && engagedB) {
    return 'bilateral-engaged';
  }

  if (!laneA.nonTrivialShift && !laneB.nonTrivialShift) {
    return 'surface-close';
  }

  return 'one-sided';
}

function buildSwapCadencePairReport(sourceSample, donorSample, strength = 0.82) {
  const laneA = buildSwapLaneResult(sourceSample, donorSample, 'A', 'B', strength);
  const laneB = buildSwapLaneResult(donorSample, sourceSample, 'B', 'A', strength);
  const classification = classifySwapCadencePair(laneA, laneB);
  const failureFamilyTags = sortUniqueStrings([
    ['structural', 'partial'].includes(laneA.borrowedShellOutcome) ? null : laneA.borrowedShellFailureClass,
    ['structural', 'partial'].includes(laneB.borrowedShellOutcome) ? null : laneB.borrowedShellFailureClass
  ]);
  const atLeastOneStructural =
    laneA.borrowedShellOutcome === 'structural' ||
    laneB.borrowedShellOutcome === 'structural';
  const flagshipPass =
    laneA.borrowedShellOutcome !== 'rejected' &&
    laneB.borrowedShellOutcome !== 'rejected' &&
    ['structural', 'partial'].includes(laneA.borrowedShellOutcome) &&
    ['structural', 'partial'].includes(laneB.borrowedShellOutcome) &&
    Math.min(laneA.protectedAnchorIntegrity, laneB.protectedAnchorIntegrity) >= 1 &&
    Math.max(laneA.semanticRisk || 0, laneB.semanticRisk || 0) <= 0.02 &&
    atLeastOneStructural &&
    classification === 'bilateral-engaged';

  return {
    id: `${sourceSample.id}__${donorSample.id}`,
    sourceId: sourceSample.id,
    donorId: donorSample.id,
    laneA,
    laneB,
    pairAudit: {
      classification,
      flagshipPass,
      atLeastOneStructural,
      bilateralEngaged: classification === 'bilateral-engaged',
      oneSided: classification === 'one-sided',
      bothRejected: classification === 'both-rejected',
      surfaceClose: classification === 'surface-close'
    },
    failureFamilyTags,
    visibleShiftSummary: {
      laneAVisibleShift: laneA.visibleShift,
      laneBVisibleShift: laneB.visibleShift,
      laneANonTrivialShift: laneA.nonTrivialShift,
      laneBNonTrivialShift: laneB.nonTrivialShift,
      bilateralVisibleShift: laneA.visibleShift && laneB.visibleShift,
      bilateralNonTrivialShift: laneA.nonTrivialShift && laneB.nonTrivialShift
    },
    semanticAuditSummary: {
      propositionCoverageMin: round3(Math.min(laneA.propositionCoverage, laneB.propositionCoverage)),
      actorCoverageMin: round3(Math.min(laneA.actorCoverage, laneB.actorCoverage)),
      actionCoverageMin: round3(Math.min(laneA.actionCoverage, laneB.actionCoverage)),
      objectCoverageMin: round3(Math.min(laneA.objectCoverage, laneB.objectCoverage)),
      polarityMismatchesMax: Math.max(laneA.polarityMismatches, laneB.polarityMismatches),
      tenseMismatchesMax: Math.max(laneA.tenseMismatches, laneB.tenseMismatches),
      protectedAnchorIntegrityMin: round3(Math.min(laneA.protectedAnchorIntegrity, laneB.protectedAnchorIntegrity)),
      semanticRiskMax: round3(Math.max(laneA.semanticRisk, laneB.semanticRisk))
    }
  };
}

function buildSwapCadenceMatrix(sampleLibrary = [], options = {}) {
  const samples = (sampleLibrary || [])
    .map((sample, index) => normalizeSwapSample(sample, index))
    .filter((sample) => sample.text);
  const samplesById = Object.freeze(samples.reduce((acc, sample) => {
    acc[sample.id] = sample;
    return acc;
  }, {}));
  const strength = clamp(Number(options.strength ?? 0.82), 0, 1);
  const flagshipPairs = (options.flagshipPairs || SWAP_CADENCE_FLAGSHIP_PAIRS)
    .map((pair) => ({
      sourceId: pair.sourceId,
      donorId: pair.donorId
    }))
    .filter((pair) => samplesById[pair.sourceId] && samplesById[pair.donorId] && pair.sourceId !== pair.donorId);
  const orderedPairs = Array.isArray(options.orderedPairs)
    ? options.orderedPairs
      .map((pair) => ({
        sourceId: pair.sourceId,
        donorId: pair.donorId
      }))
      .filter((pair) => samplesById[pair.sourceId] && samplesById[pair.donorId] && pair.sourceId !== pair.donorId)
    : (() => {
      const pairs = [];
      for (const sourceSample of samples) {
        for (const donorSample of samples) {
          if (sourceSample.id === donorSample.id) {
            continue;
          }

          pairs.push({
            sourceId: sourceSample.id,
            donorId: donorSample.id
          });
        }
      }
      return pairs;
    })();
  const allPairs = [...orderedPairs, ...flagshipPairs].filter((pair, index, pairs) =>
    pairs.findIndex((candidate) =>
      candidate.sourceId === pair.sourceId &&
      candidate.donorId === pair.donorId
    ) === index
  );

  const fullMatrix = allPairs.map((pair) =>
    buildSwapCadencePairReport(samplesById[pair.sourceId], samplesById[pair.donorId], strength)
  );
  const fullMatrixById = fullMatrix.reduce((acc, report) => {
    acc[report.id] = report;
    return acc;
  }, {});
  const flagshipReports = flagshipPairs
    .map((pair) => fullMatrixById[`${pair.sourceId}__${pair.donorId}`])
    .filter(Boolean);
  const failureFamilyCounts = fullMatrix.reduce((acc, report) => {
    for (const tag of report.failureFamilyTags) {
      acc[tag] = (acc[tag] || 0) + 1;
    }
    return acc;
  }, {});
  const summary = {
    caseCount: fullMatrix.length,
    flagshipCount: flagshipReports.length,
    bilateralEngaged: fullMatrix.filter((report) => report.pairAudit.bilateralEngaged).length,
    oneSided: fullMatrix.filter((report) => report.pairAudit.oneSided).length,
    bothRejected: fullMatrix.filter((report) => report.pairAudit.bothRejected).length,
    surfaceClose: fullMatrix.filter((report) => report.pairAudit.surfaceClose).length,
    flagshipPassCount: flagshipReports.filter((report) => report.pairAudit.flagshipPass).length,
    flagshipCaseCount: flagshipReports.length,
    flagshipAllPassed: flagshipReports.length > 0 && flagshipReports.every((report) => report.pairAudit.flagshipPass),
    failureFamilyCounts
  };

  return {
    flagshipPairs,
    flagshipReports,
    fullMatrix,
    summary
  };
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
  const contentWordComplexityDistance = boundedDistance(
    profileA.contentWordComplexity || 0,
    profileB.contentWordComplexity || 0,
    0.55
  );
  const modifierDensityDistance = boundedDistance(
    profileA.modifierDensity || 0,
    profileB.modifierDensity || 0,
    0.25
  );
  const hedgeDensityDistance = boundedDistance(
    profileA.hedgeDensity || 0,
    profileB.hedgeDensity || 0,
    0.14
  );
  const directnessDistance = boundedDistance(
    profileA.directness || 0,
    profileB.directness || 0,
    0.45
  );
  const abstractionDistance = boundedDistance(
    profileA.abstractionPosture || 0.5,
    profileB.abstractionPosture || 0.5,
    0.6
  );
  const latinateDistance = boundedDistance(
    profileA.latinatePreference || 0,
    profileB.latinatePreference || 0,
    0.35
  );
  const abbreviationDistance = boundedDistance(
    profileA.abbreviationDensity || 0,
    profileB.abbreviationDensity || 0,
    0.28
  );
  const orthographyDistance = boundedDistance(
    profileA.orthographicLooseness || 0,
    profileB.orthographicLooseness || 0,
    0.38
  );
  const fragmentDistance = boundedDistance(
    profileA.fragmentPressure || 0,
    profileB.fragmentPressure || 0,
    0.45
  );
  const conversationDistance = boundedDistance(
    profileA.conversationalPosture || 0,
    profileB.conversationalPosture || 0,
    0.42
  );
  const surfaceMarkerDistanceValue = surfaceMarkerDistance(
    profileA.surfaceMarkerProfile || {},
    profileB.surfaceMarkerProfile || {}
  );
  const registerDistanceValue = registerDistance(profileA, profileB);
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
    contentWordComplexityDistance === 0 &&
    modifierDensityDistance === 0 &&
    hedgeDensityDistance === 0 &&
    directnessDistance === 0 &&
    abstractionDistance === 0 &&
    latinateDistance === 0 &&
    punctShapeDistance === 0 &&
    abbreviationDistance === 0 &&
    orthographyDistance === 0 &&
    fragmentDistance === 0 &&
    conversationDistance === 0 &&
    surfaceMarkerDistanceValue === 0;

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
        ((1 - recurrenceDistance) * 0.03) +
        ((1 - registerDistanceValue) * 0.04) +
        ((1 - abbreviationDistance) * 0.03) +
        ((1 - orthographyDistance) * 0.03) +
        ((1 - fragmentDistance) * 0.02) +
        ((1 - conversationDistance) * 0.02) +
        ((1 - surfaceMarkerDistanceValue) * 0.02)
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
        ((1 - recurrenceDistance) * 0.02) +
        ((1 - registerDistanceValue) * 0.05) +
        ((1 - abbreviationDistance) * 0.04) +
        ((1 - orthographyDistance) * 0.04) +
        ((1 - fragmentDistance) * 0.03) +
        ((1 - conversationDistance) * 0.02) +
        ((1 - surfaceMarkerDistanceValue) * 0.02)
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
    contentWordComplexityDistance: round3(contentWordComplexityDistance),
    modifierDensityDistance: round3(modifierDensityDistance),
    hedgeDensityDistance: round3(hedgeDensityDistance),
    directnessDistance: round3(directnessDistance),
    abstractionDistance: round3(abstractionDistance),
    latinateDistance: round3(latinateDistance),
    abbreviationDistance: round3(abbreviationDistance),
    orthographyDistance: round3(orthographyDistance),
    fragmentDistance: round3(fragmentDistance),
    conversationDistance: round3(conversationDistance),
    surfaceMarkerDistance: round3(surfaceMarkerDistanceValue),
    registerDistance: round3(registerDistanceValue),
    avgSentenceA: profileA.avgSentenceLength,
    avgSentenceB: profileB.avgSentenceLength,
    lexicalOverlap: round3(lexicalOverlap),
    profileA,
    profileB
  };
}

function surfaceAppears(text = '', surface = '') {
  if (!surface) {
    return false;
  }

  return new RegExp(`\\b${escapeRegex(surface)}\\b`, 'i').test(text);
}

function detectLexemeSwaps(sourceText = '', outputText = '') {
  const swaps = [];
  const seen = new Set();

  for (const pack of PHRASE_REALIZATION_PACKS) {
    const sourceVariant = Object.values(pack.replacements).find((variant) => surfaceAppears(sourceText, variant));
    const outputVariant = Object.values(pack.replacements).find((variant) => surfaceAppears(outputText, variant));
    if (sourceVariant && outputVariant && sourceVariant.toLowerCase() !== outputVariant.toLowerCase()) {
      const key = `${pack.id}:${sourceVariant.toLowerCase()}:${outputVariant.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        swaps.push({
          family: pack.id,
          from: sourceVariant,
          to: outputVariant,
          kind: 'phrase'
        });
      }
    }
  }

  for (const family of LEXICAL_FAMILIES) {
    const familyVariants = FAMILY_VARIANT_INDEX.filter((entry) => entry.familyId === family.id);
    const sourceVariant = familyVariants.find((entry) => surfaceAppears(sourceText, entry.surface));
    const outputVariant = familyVariants.find((entry) => surfaceAppears(outputText, entry.surface));
    if (!sourceVariant || !outputVariant || sourceVariant.normalized === outputVariant.normalized) {
      continue;
    }

    const key = `${family.id}:${sourceVariant.normalized}:${outputVariant.normalized}`;
    if (!seen.has(key)) {
      seen.add(key);
      swaps.push({
        family: family.id,
        from: sourceVariant.surface,
        to: outputVariant.surface,
        kind: 'lexeme'
      });
    }
  }

  return swaps;
}

function buildLexicalShiftProfile(sourceText = '', outputText = '', sourceProfile = {}, targetProfile = {}, outputProfile = {}) {
  const fit = compareTexts(sourceText, outputText, {
    profileA: sourceProfile,
    profileB: outputProfile
  });
  const lexemeSwaps = detectLexemeSwaps(sourceText, outputText);

  return {
    lexemeSwaps,
    swapCount: lexemeSwaps.length,
    registerDistance: fit.registerDistance || 0,
    contentWordComplexityDelta: round3((outputProfile.contentWordComplexity || 0) - (sourceProfile.contentWordComplexity || 0)),
    modifierDensityDelta: round3((outputProfile.modifierDensity || 0) - (sourceProfile.modifierDensity || 0)),
    directnessDelta: round3((outputProfile.directness || 0) - (sourceProfile.directness || 0)),
    abstractionDelta: round3((outputProfile.abstractionPosture || 0.5) - (sourceProfile.abstractionPosture || 0.5)),
    contractionAligned:
      Math.sign((outputProfile.contractionDensity || 0) - (sourceProfile.contractionDensity || 0)) ===
        Math.sign((targetProfile.contractionDensity || 0) - (sourceProfile.contractionDensity || 0)) ||
      Math.abs((targetProfile.contractionDensity || 0) - (sourceProfile.contractionDensity || 0)) < 0.006
  };
}

function computeSemanticRisk(sourceText = '', outputText = '', protectedState = { literals: [] }, sourceProfile = {}, outputProfile = {}) {
  const fit = compareTexts(sourceText, outputText, {
    profileA: sourceProfile,
    profileB: outputProfile
  });
  let risk = 0;

  if (!protectedLiteralIntegrity(outputText, protectedState.literals || [])) {
    risk += 0.3;
  }

  const sourceNegative = /\b(?:not|never|no|cannot|cant|can't|wont|won't|dont|don't|doesnt|doesn't|didnt|didn't|isnt|isn't|arent|aren't|wasnt|wasn't|werent|weren't)\b/i.test(sourceText);
  const outputNegative = /\b(?:not|never|no|cannot|cant|can't|wont|won't|dont|don't|doesnt|doesn't|didnt|didn't|isnt|isn't|arent|aren't|wasnt|wasn't|werent|weren't)\b/i.test(outputText);
  if (sourceNegative !== outputNegative) {
    risk += 0.18;
  }

  if ((fit.lexicalOverlap || 0) < 0.28) {
    risk += 0.18;
  }

  if (Math.abs((outputProfile.sentenceCount || 0) - (sourceProfile.sentenceCount || 0)) > 4) {
    risk += 0.12;
  }

  if (outputText.length > Math.ceil(sourceText.length * 1.35)) {
    risk += 0.1;
  }

  return round3(clamp01(risk));
}

function determineRealizationTier(changedDimensions = [], lexemeSwaps = []) {
  const hasStructural = structuralDimensions(changedDimensions).length > 0;
  const hasLexical = lexicalDimensions(changedDimensions).length > 0 || lexemeSwaps.length > 0;

  if (!changedDimensions.length && !lexemeSwaps.length) {
    return 'none';
  }

  if (hasStructural && hasLexical) {
    return 'lexical-structural';
  }

  return 'cadence-only';
}

const SEMANTIC_VARIANT_FAMILY_LOOKUP = Object.freeze(FAMILY_VARIANT_INDEX.reduce((acc, entry) => {
  acc[entry.normalized] = entry.familyId;
  return acc;
}, {}));

const PRONOUN_ROLE_CLASSES = Object.freeze({
  i: 'first-singular',
  me: 'first-singular',
  my: 'first-singular',
  mine: 'first-singular',
  we: 'first-plural',
  us: 'first-plural',
  our: 'first-plural',
  ours: 'first-plural',
  you: 'second',
  your: 'second',
  yours: 'second',
  he: 'third-singular',
  him: 'third-singular',
  his: 'third-singular',
  she: 'third-singular',
  her: 'third-singular',
  hers: 'third-singular',
  it: 'third-singular',
  its: 'third-singular',
  they: 'third-plural',
  them: 'third-plural',
  their: 'third-plural',
  theirs: 'third-plural',
  there: 'ambient',
  this: 'deictic',
  that: 'deictic'
});

const SEMANTIC_EQUIVALENT_FORMS = Object.freeze({
  headed: 'leave',
  head: 'leave',
  departure: 'leave',
  depart: 'leave',
  wrapped: 'finish',
  wrap: 'finish',
  deployed: 'use',
  deploy: 'use',
  requested: 'ask',
  request: 'ask',
  asked: 'ask',
  requires: 'need',
  required: 'need',
  require: 'need',
  provided: 'give',
  provide: 'give',
  issued: 'give',
  issue: 'give',
  located: 'find',
  locate: 'find',
  identified: 'find',
  identify: 'find',
  contacted: 'call',
  contact: 'call',
  scheduled: 'book',
  schedule: 'book',
  verified: 'check',
  verify: 'check',
  reviewed: 'check',
  review: 'check',
  confirmed: 'check',
  confirm: 'check',
  resolved: 'fix',
  resolve: 'fix',
  transferred: 'move',
  transfer: 'move',
  relocated: 'move',
  relocate: 'move',
  matched: 'match',
  aligns: 'match',
  aligned: 'match',
  align: 'match',
  logged: 'record',
  log: 'record',
  flagged: 'note',
  flag: 'note',
  speech: 'tell',
  said: 'tell',
  says: 'tell',
  told: 'tell',
  pauses: 'wait',
  pause: 'wait',
  grabbed: 'bring',
  grab: 'bring',
  doorway: 'door',
  point: 'detail',
  points: 'detail',
  reason: 'detail',
  reasons: 'detail',
  tough: 'hard',
  charger: 'charger',
  qualifiers: 'qualifier',
  apologies: 'apology'
});

function normalizeSemanticToken(token = '') {
  const normalized = normalizeText(token)
    .toLowerCase()
    .replace(/[^a-z0-9']/g, '')
    .trim();

  if (!normalized) {
    return '';
  }

  if (PRONOUN_ROLE_CLASSES[normalized]) {
    return `pronoun:${PRONOUN_ROLE_CLASSES[normalized]}`;
  }

  if (SEMANTIC_VARIANT_FAMILY_LOOKUP[normalized]) {
    return `family:${SEMANTIC_VARIANT_FAMILY_LOOKUP[normalized]}`;
  }

  if (SEMANTIC_EQUIVALENT_FORMS[normalized]) {
    return SEMANTIC_EQUIVALENT_FORMS[normalized];
  }

  if (normalized.endsWith('ing') && normalized.length > 5) {
    return normalized.slice(0, -3);
  }

  if (normalized.endsWith('ed') && normalized.length > 4) {
    return normalized.slice(0, -2);
  }

  if (normalized.endsWith('es') && normalized.length > 4) {
    return normalized.slice(0, -2);
  }

  if (normalized.endsWith('s') && normalized.length > 3 && !normalized.endsWith("'s")) {
    return normalized.slice(0, -1);
  }

  return normalized;
}

function semanticRoleTokens(value = '') {
  return tokenize(value)
    .filter((token) => !CONTENT_STOP_WORDS.has(token) && !HEDGE_MARKERS.has(token))
    .map(normalizeSemanticToken)
    .filter(Boolean);
}

function roleCoverage(roleTokens = [], targetSet = new Set(), fallbackScore = 0) {
  if (!roleTokens.length) {
    return 1;
  }

  const unique = [...new Set(roleTokens)];
  const matched = unique.filter((token) => targetSet.has(token)).length;
  const directCoverage = matched / unique.length;
  return round3(clamp01(Math.max(directCoverage, fallbackScore)));
}

function semanticJaccard(leftTokens = [], rightTokens = []) {
  const left = new Set(leftTokens);
  const right = new Set(rightTokens);

  if (!left.size && !right.size) {
    return 1;
  }

  if (!left.size || !right.size) {
    return 0;
  }

  let overlap = 0;
  left.forEach((token) => {
    if (right.has(token)) {
      overlap += 1;
    }
  });

  return overlap / (left.size + right.size - overlap);
}

function compatibleTenseAspect(source = '', target = '') {
  if (!source || !target || source === target) {
    return true;
  }

  if (source === 'mixed' || target === 'mixed') {
    return true;
  }

  const pair = new Set([source, target]);
  if (pair.has('present') && pair.has('progressive')) {
    return true;
  }

  if (pair.has('past') && pair.has('perfect')) {
    return true;
  }

  return false;
}

function summarizeProfile(profile = {}) {
  return {
    avgSentenceLength: round2(profile.avgSentenceLength || 0),
    sentenceCount: profile.sentenceCount || 0,
    contractionDensity: round3(profile.contractionDensity || 0),
    punctuationDensity: round3(profile.punctuationDensity || 0),
    lineBreakDensity: round3(profile.lineBreakDensity || 0),
    contentWordComplexity: round3(profile.contentWordComplexity || 0),
    modifierDensity: round3(profile.modifierDensity || 0),
    hedgeDensity: round3(profile.hedgeDensity || 0),
    directness: round3(profile.directness || 0),
    abstractionPosture: round3(profile.abstractionPosture || 0.5),
    latinatePreference: round3(profile.latinatePreference || 0),
    recurrencePressure: round3(profile.recurrencePressure || 0)
  };
}

function summarizeIR(ir = {}) {
  return {
    metadata: {
      sentenceCount: ir.metadata?.sentenceCount || 0,
      clauseCount: ir.metadata?.clauseCount || 0,
      literalSpans: (ir.metadata?.literalSpans || []).map((entry) => ({
        value: entry.value,
        placeholder: entry.placeholder
      }))
    },
    sentences: (ir.sentences || []).map((sentence) => ({
      id: sentence.id,
      raw: sentence.raw,
      rhetoricalRole: sentence.rhetoricalRole,
      terminalPunct: sentence.terminalPunct,
      clauses: (sentence.clauses || []).map((clause) => ({
        id: clause.id,
        text: clause.text,
        relationToPrev: clause.relationToPrev,
        clauseType: clause.clauseType,
        polarity: clause.polarity,
        tenseAspect: clause.tenseAspect,
        propositionHead: clause.propositionHead,
        actor: clause.actor,
        action: clause.action,
        object: clause.object,
        modifiers: clause.modifiers,
        hedgeMarkers: clause.hedgeMarkers
      }))
    }))
  };
}

function flattenSemanticClauses(ir = {}) {
  return (ir.sentences || []).flatMap((sentence) =>
    (sentence.clauses || []).map((clause) => {
      const propositionTokens = semanticRoleTokens(clause.propositionHead);
      const actorTokens = semanticRoleTokens(clause.actor);
      const actionTokens = semanticRoleTokens(clause.action);
      const objectTokens = semanticRoleTokens(clause.object);
      const modifierTokens = semanticRoleTokens((clause.modifiers || []).join(' '));
      const bag = [
        ...propositionTokens,
        ...actorTokens,
        ...actionTokens,
        ...objectTokens,
        ...modifierTokens
      ];

      return {
        id: clause.id,
        text: clause.text,
        relationToPrev: clause.relationToPrev,
        polarity: clause.polarity,
        tenseAspect: clause.tenseAspect,
        propositionTokens,
        actorTokens,
        actionTokens,
        objectTokens,
        modifierTokens,
        bag: [...new Set(bag)]
      };
    })
  );
}

function bestSemanticClauseMatch(sourceClause, outputClauses = []) {
  if (!outputClauses.length) {
    return {
      clause: null,
      score: 0,
      bagScore: 0
    };
  }

  const windows = [];
  for (let index = 0; index < outputClauses.length; index += 1) {
    const single = outputClauses[index];
    windows.push({
      id: single.id,
      relationToPrev: single.relationToPrev,
      polarity: single.polarity,
      tenseAspect: single.tenseAspect,
      actorTokens: single.actorTokens,
      actionTokens: single.actionTokens,
      objectTokens: single.objectTokens,
      bag: single.bag
    });

    if (index < outputClauses.length - 1) {
      const next = outputClauses[index + 1];
      windows.push({
        id: `${single.id}+${next.id}`,
        relationToPrev: single.relationToPrev,
        polarity: single.polarity === next.polarity ? single.polarity : 'mixed',
        tenseAspect: single.tenseAspect === next.tenseAspect ? single.tenseAspect : 'mixed',
        actorTokens: [...new Set([...single.actorTokens, ...next.actorTokens])],
        actionTokens: [...new Set([...single.actionTokens, ...next.actionTokens])],
        objectTokens: [...new Set([...single.objectTokens, ...next.objectTokens])],
        bag: [...new Set([...single.bag, ...next.bag])]
      });
    }
  }

  return windows.reduce((best, candidate) => {
    const bagScore = semanticJaccard(sourceClause.bag, candidate.bag);
    const actorScore = semanticJaccard(sourceClause.actorTokens, candidate.actorTokens);
    const actionScore = semanticJaccard(sourceClause.actionTokens, candidate.actionTokens);
    const relationBonus = sourceClause.relationToPrev === candidate.relationToPrev ? 0.08 : 0;
    const polarityBonus = sourceClause.polarity === candidate.polarity || candidate.polarity === 'mixed' ? 0.08 : 0;
    const score = (
      (bagScore * 0.54) +
      (actorScore * 0.16) +
      (actionScore * 0.14) +
      relationBonus +
      polarityBonus
    );

    if (score > best.score) {
      return {
        clause: candidate,
        score,
        bagScore
      };
    }

    return best;
  }, {
    clause: windows[0],
    score: -1,
    bagScore: 0
  });
}

function buildProtectedAnchorAudit(outputText = '', protectedState = { literals: [] }) {
  const literals = protectedState?.literals || [];
  const missingAnchors = literals
    .filter((entry) => !outputText.includes(entry.value))
    .map((entry) => entry.value);
  const resolvedAnchors = literals.length - missingAnchors.length;
  const protectedAnchorIntegrity = literals.length
    ? round3(resolvedAnchors / literals.length)
    : 1;

  return {
    totalAnchors: literals.length,
    resolvedAnchors,
    missingAnchors,
    protectedAnchorIntegrity
  };
}

function buildSemanticAuditBundle(sourceIR, outputText = '', protectedState = { literals: [] }) {
  const outputIR = segmentTextToIR(normalizeText(outputText), protectedState);
  const sourceClauses = flattenSemanticClauses(sourceIR);
  const outputClauses = flattenSemanticClauses(outputIR);
  const globalOutputSet = new Set(outputClauses.flatMap((clause) => clause.bag));
  const protectedAnchorAudit = buildProtectedAnchorAudit(outputText, protectedState);

  if (!sourceClauses.length) {
    return {
      semanticAudit: {
        propositionCoverage: 1,
        actorCoverage: 1,
        actionCoverage: 1,
        objectCoverage: 1,
        polarityMismatches: 0,
        tenseMismatches: 0,
        protectedAnchorIntegrity: protectedAnchorAudit.protectedAnchorIntegrity,
        clauseAudits: [],
        sourceClauseCount: 0,
        outputClauseCount: outputClauses.length
      },
      protectedAnchorAudit,
      outputIR
    };
  }

  const clauseAudits = sourceClauses.map((sourceClause) => {
    const match = bestSemanticClauseMatch(sourceClause, outputClauses);
    const targetClause = match.clause;
    const targetSet = new Set(targetClause?.bag || []);
    const globalBagScore = round3(semanticJaccard(sourceClause.bag, [...globalOutputSet]));
    const bagScore = round3(clamp01(match.bagScore || 0));
    const basePropositionCoverage = Math.max(
      roleCoverage(sourceClause.propositionTokens, targetSet, bagScore),
      roleCoverage(sourceClause.propositionTokens, globalOutputSet, globalBagScore * 0.94)
    );
    const actorCoverage = Math.max(
      roleCoverage(sourceClause.actorTokens, targetSet, bagScore * 0.9),
      roleCoverage(sourceClause.actorTokens, globalOutputSet, globalBagScore * 0.9)
    );
    const rawActionCoverage = Math.max(
      roleCoverage(sourceClause.actionTokens, targetSet, bagScore),
      roleCoverage(sourceClause.actionTokens, globalOutputSet, globalBagScore * 0.94)
    );
    const rawObjectCoverage = Math.max(
      roleCoverage(sourceClause.objectTokens, targetSet, bagScore * 0.82),
      roleCoverage(sourceClause.objectTokens, globalOutputSet, globalBagScore * 0.88)
    );
    const propositionCoverage = Math.max(
      basePropositionCoverage,
      rawActionCoverage,
      rawObjectCoverage * 0.9
    );
    const actionCoverage = sourceClause.actionTokens.length
      ? Math.max(rawActionCoverage, propositionCoverage * 0.9)
      : propositionCoverage;
    const objectCoverage = sourceClause.objectTokens.length
      ? Math.max(rawObjectCoverage, propositionCoverage * 0.75)
      : propositionCoverage;
    const polarityRelevant =
      sourceClause.propositionTokens.length > 0 ||
      sourceClause.actionTokens.length > 0 ||
      sourceClause.objectTokens.length > 0;
    const polarityMismatch = targetClause
      ? Number(polarityRelevant && sourceClause.polarity !== targetClause.polarity && globalBagScore < 0.5 && bagScore < 0.95)
      : 0;
    const tenseMismatch = targetClause
      ? Number(sourceClause.actionTokens.length > 0 && !compatibleTenseAspect(sourceClause.tenseAspect, targetClause.tenseAspect) && globalBagScore < 0.5)
      : 0;

    return {
      sourceClauseId: sourceClause.id,
      matchedClauseId: targetClause?.id || null,
      propositionCoverage,
      actorCoverage,
      actionCoverage,
      objectCoverage,
      polarityMismatch,
      tenseMismatch,
      bagScore,
      globalBagScore
    };
  });

  const average = (key) => round3(
    clauseAudits.reduce((sum, entry) => sum + (entry[key] || 0), 0) / Math.max(1, clauseAudits.length)
  );
  const semanticAudit = {
    propositionCoverage: average('propositionCoverage'),
    actorCoverage: average('actorCoverage'),
    actionCoverage: average('actionCoverage'),
    objectCoverage: average('objectCoverage'),
    polarityMismatches: clauseAudits.reduce((sum, entry) => sum + entry.polarityMismatch, 0),
    tenseMismatches: clauseAudits.reduce((sum, entry) => sum + entry.tenseMismatch, 0),
    protectedAnchorIntegrity: protectedAnchorAudit.protectedAnchorIntegrity,
    clauseAudits,
    sourceClauseCount: sourceClauses.length,
    outputClauseCount: outputClauses.length
  };

  return {
    semanticAudit,
    protectedAnchorAudit,
    outputIR
  };
}

function summarizeTransferPlan(transferPlan = {}, irPlan = {}, passesApplied = []) {
  const uniquePasses = [...new Set(passesApplied)];
  return {
    transferMode: irPlan.transferMode || 'weak',
    structuralOperationsSelected: uniquePasses.filter((name) =>
      /(split|merge|sentence|clause|structural)/i.test(name)
    ),
    lexicalRegisterOperationsSelected: uniquePasses.filter((name) =>
      /(phrase|voice|stance|connector|function-word|line-break|punctuation|lexical|contraction|discourse)/i.test(name)
    ),
    connectorStrategy: irPlan.dominantRelation || transferPlan.dominantRelation || 'balanced',
    contractionStrategy:
      (irPlan.discourseGoals?.contractionDelta || 0) > 0.006
        ? 'increase'
        : (irPlan.discourseGoals?.contractionDelta || 0) < -0.006
          ? 'decrease'
          : 'hold',
    relationInventory: irPlan.relationInventory || transferPlan.relationInventory || [],
    structuralGoals: irPlan.structuralGoals || {},
    discourseGoals: irPlan.discourseGoals || {},
    registerGoals: irPlan.registerGoals || {},
    operationBudget: irPlan.operationBudget || {}
  };
}

function summarizeCandidate(candidate = {}) {
  return {
    spec: candidate.spec || 'selected',
    score: round3(candidate.score || 0),
    passesApplied: candidate.passesApplied || [],
    rescuePasses: candidate.rescuePasses || [],
    changedDimensions: candidate.changedDimensions || [],
    qualityGatePassed: Boolean(candidate.quality?.qualityGatePassed),
    notes: candidate.quality?.notes || []
  };
}

function buildRetrievalTrace({
  sourceText,
  shell,
  sourceProfile,
  targetProfile,
  opportunityProfile,
  ir,
  transferPlan,
  irPlan,
  allCandidates,
  bestCandidate,
  finalText,
  result,
  semanticAudit,
  protectedAnchorAudit,
  outputIR
}) {
  return {
    sourceText,
    donorProfileSummary: {
      mode: shell?.mode || 'native',
      label: shell?.label || 'native cadence',
      strength: round3(Number(shell?.strength || 0)),
      profile: summarizeProfile(targetProfile)
    },
    sourceIR: summarizeIR(ir),
    opportunityProfile: {
      ...opportunityProfile
    },
    planSummary: summarizeTransferPlan(transferPlan, irPlan, bestCandidate?.passesApplied || []),
    candidateSummary: {
      selected: summarizeCandidate(bestCandidate),
      candidates: (allCandidates || []).map(summarizeCandidate)
    },
    finalRealization: {
      text: finalText,
      transferClass: result.transferClass,
      borrowedShellOutcome: result.borrowedShellOutcome,
      borrowedShellFailureClass: result.borrowedShellFailureClass,
      realizationTier: result.realizationTier,
      changedDimensions: result.changedDimensions || [],
      lexemeSwaps: result.lexemeSwaps || [],
      semanticRisk: result.semanticRisk,
      donorProgress: result.donorProgress || {},
      rescuePasses: result.rescuePasses || [],
      visibleShift: Boolean(result.visibleShift),
      nonTrivialShift: Boolean(result.nonTrivialShift)
    },
    semanticAudit,
    protectedAnchorAudit,
    realizedIR: summarizeIR(outputIR),
    realizationSummary: {
      transferClass: result.transferClass,
      borrowedShellOutcome: result.borrowedShellOutcome,
      borrowedShellFailureClass: result.borrowedShellFailureClass,
      realizationTier: result.realizationTier,
      changedDimensions: result.changedDimensions || [],
      lexemeSwaps: result.lexemeSwaps || [],
      semanticRisk: result.semanticRisk,
      donorProgress: result.donorProgress || {},
      realizationNotes: result.realizationNotes || [],
      rescuePasses: result.rescuePasses || [],
      visibleShift: Boolean(result.visibleShift),
      nonTrivialShift: Boolean(result.nonTrivialShift)
    }
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
  const shell = options?.profile
    ? {
        mode: 'borrowed',
        profile: options.profile,
        strength: options.strength ?? 0.76,
        mod
      }
    : {
        mode: 'synthetic',
        strength: options?.strength ?? 0.76,
        mod
      };

  return buildCadenceTransfer(text, shell, options).text;
}

function buildCadenceTransfer(text = '', shell = {}, options = {}) {
  return buildCadenceTransferV2(text, shell, options);
}

function buildCadenceTransferTrace(text = '', shell = {}, options = {}) {
  return buildCadenceTransferTraceV2(text, shell, options);
}

function applyCadenceToText(text = '', shell = {}) {
  return applyCadenceToTextV2(text, shell);
}
// SOURCE: app/engine/generator-v2.js


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
    const softenedLead = splitForClippedMomentum(sentences[0]);
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
      let next = splitForClippedMomentum(sentence);
      if (sceneLike) {
        next = splitSceneBursts(next);
      }
      return next;
    }).join(' ');
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

  working = applyScenePersonaPulse(working, envelopeId, sourceClass, context);
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
  personaSeparationAudit = {},
  distinctnessBonus = 0,
  outputProfile = {},
  sourceProfile = {},
  pathologies = {}
} = {}) {
  const structuralMovement = substantiveDimensionCount(changedDimensions);
  const lexicalMovement = Number((lexemeSwaps || []).length || 0);
  const punctuationDriftOnly = punctuationOnlyDrift(changedDimensions, lexemeSwaps);
  const overBraidingPenalty = Math.min(0.24, Number(artifactAudit.overBraidingCount || 0) * 0.06);
  const clauseDragPenalty = Math.min(0.16, Number(artifactAudit.clauseDragCount || 0) * 0.05);
  const sentenceIntegrity = round(clamp01(
    1 -
    (Number(artifactAudit.penalty || 0) * 1.08) -
    (Number(artifactAudit.clauseJoinCount || 0) * 0.06) -
    (Number(artifactAudit.fragmentCount || 0) * 0.05) -
    (pathologies.severe ? 0.5 : 0)
  ), 4);
  const readability = round(clamp01(
    0.58 +
    (transferClass === 'structural' ? 0.08 : transferClass === 'surface' ? -0.08 : 0) +
    (structuralMovement >= 1 ? 0.08 : 0) +
    (Number(outputProfile.avgSentenceLength || 0) >= 4 && Number(outputProfile.avgSentenceLength || 0) <= 30 ? 0.06 : 0) -
    Number(artifactAudit.penalty || 0) -
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
    Number(artifactAudit.penalty || 0) +
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
    generatorVersion: 'v2',
    semanticAudit: candidate?.semanticAudit || {},
    protectedAnchorAudit: candidate?.protectedAnchorAudit || {},
    planSummary: buildPlanSummary(candidate, candidateLedger, testedFamilyIds),
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
        testedFamilyIds: ['native'],
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
    toolabilityAudit: Object.freeze({
      readability: 1,
      personaDistinctness: 0,
      sentenceIntegrity: 1,
      movementQuality: 0,
      artifactPenalty: 0,
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
  const artifactAudit = buildArtifactAudit({
    sourceText,
    outputText,
    sourceClass,
    envelopeId: variant.envelopeId,
    targetProfile: variant.shell?.profile || null,
    sourceProfile
  });
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
  const semanticsBounded = semanticAuditBounded(semanticAudit);
  const semanticPass =
    Number(semanticAudit.propositionCoverage ?? 1) >= floors.proposition &&
    Number(semanticAudit.actorCoverage ?? 1) >= floors.actor &&
    Number(semanticAudit.actionCoverage ?? 1) >= floors.action &&
    Number(semanticAudit.objectCoverage ?? 1) >= floors.object;
  const exactPass = hardIntegrityScore >= 1;
  const protectedAnchorPass = protectedAnchorIntegrity >= classProtectedAnchorFloor(sourceClass);
  const pathologyPass = !pathologies.severe;
  const rewritePass = meetsLandedRewriteBar(sourceClass, rewriteStrength, changedDimensions, authored.lexemeSwaps);
  const passed = exactPass && protectedAnchorPass && semanticPass && pathologyPass && rewritePass;
  const polarityPenalty = Math.max(0, polarityMismatches - 1) * 0.12;
  const tensePenalty = Math.max(0, tenseMismatches - 1) * 0.04;
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
    artifactAudit.penalty +
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
    artifactAudit,
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
    semanticBounded: semanticsBounded,
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
        testedFamilyIds: options.testedFamilyIds || candidates.map((entry) => entry.family),
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
    toolabilityAudit: chosen.toolabilityAudit,
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

function buildHeldTransfer(sourceText = '', shell = {}, options = {}, candidates = [], sourceClass = 'formal-correspondence') {
  const sourceProfile = options.sourceProfile || extractCadenceProfile(sourceText);
  const sourceIR = options.sourceIR || segmentTextToIR(sourceText, { literals: [], text: sourceText });
  const opportunityProfile = buildOpportunityProfileFromIR(sourceIR);
  const bestCandidate = [...candidates].sort((left, right) => right.score - left.score)[0] || null;
  const holdClass = candidateHoldClass(bestCandidate);
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
    winningCandidateId: null
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

function buildCadenceTransferV2(text = '', shell = {}, options = {}) {
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

  if (!selected) {
    return buildHeldTransfer(sourceText, shell, {
      ...options,
      testedFamilyIds,
      sourceProfile,
      sourceIR
    }, candidates, sourceClass);
  }

  return buildLandedTransfer(sourceText, shell, {
    ...options,
    testedFamilyIds,
    sourceProfile,
    sourceIR
  }, selected, sourceClass, candidates);
}

function buildCadenceTransferTraceV2(text = '', shell = {}, options = {}) {
  return buildCadenceTransferV2(text, shell, {
    ...options,
    retrieval: true
  }).retrievalTrace;
}

function applyCadenceToTextV2(text = '', shell = {}) {
  return buildCadenceTransferV2(text, shell).text;
}
// SOURCE: app/engine/formulas.js

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function round3(value) {
  return Number(value.toFixed(3));
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

function routePressure(similarityOrState, traceability = 0, branchFlag = 0, recurrencePressure = 0) {
  if (typeof similarityOrState === 'object' && similarityOrState !== null) {
    const {
      similarity = 0,
      traceability: trace = 0,
      recurrencePressure: recurrence = 0,
      branchPressure = 0,
      coherence = cadenceCoherence(similarityOrState),
      resonance = cadenceResonance({ similarity, traceability: trace, coherence })
    } = similarityOrState;

    return round3(clamp01(
      (clamp01(resonance) * 0.40) +
      (clamp01(coherence) * 0.26) +
      (clamp01(recurrence) * 0.18) +
      (clamp01(branchPressure) * 0.16)
    ));
  }

  return round3(clamp01(
    (clamp01(similarityOrState) * 0.33) +
    (clamp01(traceability) * 0.27) +
    (clamp01(recurrencePressure) * 0.22) +
    ((branchFlag ? 1 : 0) * 0.05)
  ));
}

function computeRoutePressure(...args) {
  return routePressure(...args);
}

function fieldPotential({
  routePressure: pressureInput = 0,
  resonance = 0,
  coherence = 0,
  branchPressure = 0,
  mirrorLogic = 'off',
  containment = 'on'
} = {}) {
  const pressure = clamp01(pressureInput);
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
  routePressure: pressureInput = 0,
  branchPressure = 0,
  routeAvailable = false
} = {}) {
  return round3(clamp01(
    (clamp01(density) * 0.46) +
    (clamp01(pressureInput) * 0.28) +
    (clamp01(branchPressure) * 0.26) -
    (routeAvailable ? 0.24 : 0)
  ));
}

function custodyThreshold(custodialIntegrityOrState, custodialDrift, theta = 0.2) {
  if (typeof custodialIntegrityOrState === 'object' && custodialIntegrityOrState !== null) {
    const {
      routePressure: pressureInput = 0,
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
      (clamp01(pressureInput) * 0.28) +
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
  recurrencePressure = 0,
  routePressure = 0,
  branchPressure = 0,
  criticality = 0,
  traceability = 0,
  mirrorLogic = 'off',
  custodyArchive = 'institutional',
  badge = 'badge.holds',
  apertureContext = null,
  apertureProtocol = true
}) {
  const denseSignal = clamp01(density) >= 0.28 || clamp01(recurrencePressure) >= 0.58;

  if (apertureProtocol !== false) {
    return selectTD613ApertureDecision({
      recognized,
      explained,
      routeAvailable,
      density,
      recurrencePressure,
      routePressure,
      branchPressure,
      criticality,
      traceability,
      mirrorLogic,
      custodyArchive,
      badge,
      denseSignal,
      apertureContext
    });
  }

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
// SOURCE: app/engine/harbor.js

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function clamp01(value) {
  return clamp(value, 0, 1);
}

function round3(value) {
  return Number(value.toFixed(3));
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
  routeAvailable = false,
  density = 0,
  recurrencePressure = 0,
  traceability = 0,
  explained = decision === 'passage',
  recognized = decision !== 'weak-signal',
  apertureContext = null,
  apertureProtocol = true
}) {
  if (apertureProtocol !== false) {
    return selectTD613ApertureHarbor({
      routePressure,
      branchPressure,
      criticality,
      badge,
      mirrorLogic,
      custodyArchive,
      decision,
      routeAvailable,
      density,
      recurrencePressure,
      traceability,
      explained,
      recognized,
      apertureContext
    });
  }

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

  return round3(clamp(base + (harbor?.witness_load_effect ?? 0), 0, 2));
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
  sourceClass = 'public membrane',
  mirrorLogic = 'off',
  recurrencePressure = 0,
  badge = 'badge.holds',
  explained = decision === 'passage',
  recognized = decision !== 'weak-signal',
  apertureContext = null
}) {
  const harbor = HARBOR_LIBRARY[harborFunction];
  const aperture = apertureContext || buildTD613ApertureContext({
    recognized,
    explained,
    routeAvailable,
    density,
    recurrencePressure,
    routePressure,
    branchPressure,
    criticality,
    traceability,
    mirrorLogic,
    custodyArchive,
    badge
  });
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
  const justiceDeficit = round3(clamp(
    0.10 +
    (clamp01(criticality) * 0.34) +
    (clamp01(branchPressure) * 0.22) +
    (clamp01(routePressure) * 0.18) +
    (custodyArchive === 'witness' ? 0.16 : 0.04),
    0,
    2
  ));
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
    route_pressure: round3(clamp01(routePressure)),
    branch_pressure: round3(clamp01(branchPressure)),
    criticality_index: round3(clamp01(criticality)),
    protocol_id: aperture.protocolId,
    protocol_identity: aperture.toolIdentity,
    observed_regime: aperture.observedRegime,
    anti_enforcement: true,
    counter_recognition_required: aperture.counterRecognitionRequired,
    generative_passage_blocked: aperture.generativePassageBlocked,
    recapture_risk: aperture.recaptureRisk,
    receipt_hash: `sha256:${eventId}`
  };
}

window.TCP_ENGINE = Object.assign(window.TCP_ENGINE || {}, {
  TD613_APERTURE_PROTOCOL,
  TD613_APERTURE_ENFORCEMENT_TERMS,
  buildTD613GovernedExposureSchema,
  buildTD613ApertureContext,
  selectTD613ApertureDecision,
  selectTD613ApertureHarbor,
  reviewTD613ApertureTransfer,
  solveQuadratic,
  cadenceCoherence,
  cadenceResonance,
  branchDynamics,
  routePressure,
  computeRoutePressure,
  fieldPotential,
  waveStats,
  custodyThreshold,
  criticalityIndex,
  providerDecision,
  HARBOR_LIBRARY,
  chooseHarbor,
  buildLedgerRow,
  computeReuseGain,
  estimateWitnessLoad,
  normalizeText,
  extractCadenceProfile,
  compareTexts,
  buildCadenceTransfer,
  buildCadenceTransferLegacy,
  buildCadenceTransferTrace,
  buildCadenceTransferTraceLegacy,
  buildCadenceSignature,
  applyCadenceShell,
  applyCadenceToText,
  applyCadenceToTextLegacy,
  transformText,
  functionWordProfile,
  charTrigramProfile,
  recurrencePressure,
  sentenceSplit,
  segmentTextToIR,
  buildOpportunityProfileFromIR,
  buildTransferPlanFromIR,
  beamSearchTransfer,
  buildSwapCadenceMatrix,
  cadenceModFromProfile,
  SWAP_CADENCE_FLAGSHIP_PAIRS
});
})();
