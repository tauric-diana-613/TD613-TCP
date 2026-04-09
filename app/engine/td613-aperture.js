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
  targetProfile = {}
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
    ...(personaPlans[personaId] || {})
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
      .replace(/\btell hi\b/gi, 'say hi')
      .replace(/\btrying to tell\b/gi, 'trying to say')
      .replace(/\btrying to explain\b/gi, 'trying to say')
      .replace(/\bexplain hi\b/gi, 'say hi')
      .replace(/\bcontact him\b/gi, 'call him')
      .replace(/\breceive more familiar\b/gi, 'get more familiar')
      .replace(/\bwe've amnesia\b/gi, 'we have amnesia')
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

export function repairTD613ApertureProjection({
  sourceText = '',
  outputText = '',
  personaId = '',
  sourceProfile = {},
  targetProfile = {}
} = {}) {
  const plan = buildTD613ApertureProjectionPlan({ personaId, sourceProfile, targetProfile });
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
  if (working !== normalizeReadableText(outputText)) {
    repairPasses.push('common-repair');
  }

  const personaRepaired = applyPersonaProjectionRepairs(working, plan);
  if (personaRepaired !== working) {
    repairPasses.push(`persona-governor:${plan.personaId || 'native'}`);
    working = personaRepaired;
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
  const substantiveMovement = substantiveDimensionCount(changedDimensions);
  const lexicalMovement = Math.min(2, Number(lexemeSwaps?.length || 0));
  let movementConfidence = clamp01(
    (normalizedSource !== normalizedOutput ? 0.18 : 0) +
    (substantiveMovement * 0.14) +
    (lexicalMovement * 0.06) +
    (visibleShift ? 0.08 : 0) +
    (nonTrivialShift ? 0.14 : 0) -
    (pathologyState.flags.length * 0.08) -
    (repaired ? 0.02 : 0)
  );

  let outcome = 'projected';
  if (blocked || normalizedSource === normalizedOutput || pathologyState.severe) {
    outcome = 'source-rerouted';
    movementConfidence = 0;
  } else if (substantiveMovement === 0 && lexicalMovement === 0) {
    outcome = 'surface-held';
  } else if (substantiveMovement <= 1 && !nonTrivialShift) {
    outcome = 'surface-held';
  } else if (repaired) {
    outcome = 'repaired';
  }

  const line =
    outcome === 'source-rerouted'
      ? 'Aperture routed the passage back to source to avoid recapture posture.'
      : outcome === 'surface-held'
        ? 'Aperture held the passage near source and only allowed surface-safe movement.'
        : outcome === 'repaired'
          ? 'Aperture repaired the projection into a safe counter-surface.'
          : 'Aperture landed a safe counter-projection.';

  return Object.freeze({
    outcome,
    movementConfidence: round3(movementConfidence),
    line,
    pathologies: pathologyState.flags,
    renderSafe: !pathologyState.severe
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
  const blocked = Boolean(applied && (introducedEnforcementTerms.length > 0 || namingIntrusion));
  const reasons = [];

  if (introducedEnforcementTerms.length) {
    reasons.push(`Introduced enforcement framing: ${introducedEnforcementTerms.join(', ')}`);
  }
  if (namingIntrusion) {
    reasons.push('Introduced regime naming into the borrowed output.');
  }
  if (blocked) {
    reasons.push('TD613 Aperture routed the borrowed output back to the source text to avoid recapture posture drift.');
  }

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
    reasons
  });
}
