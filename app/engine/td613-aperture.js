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
    .toLowerCase()
    .replace(/\u2019/g, "'")
    .replace(/\u2018/g, "'")
    .replace(/\u2014/g, '-')
    .replace(/\u2013/g, '-');
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
