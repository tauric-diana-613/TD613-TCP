import { SCALAR_DIMENSIONS } from './extractor.js';

export const TRAINER_CALIBRATION_SAMPLE_IDS = Object.freeze([
  'building-access-formal-record',
  'committee-budget-formal-record',
  'overwork-debrief-professional-message',
  'customer-support-formal-record',
  'school-coordination-professional-message'
]);

const DIMENSION_SCALES = Object.freeze({
  avgSentenceLength: 12,
  sentenceLengthSpread: 10,
  punctuationDensity: 0.2,
  contractionDensity: 0.12,
  lineBreakDensity: 0.5,
  repeatedBigramPressure: 0.15,
  recurrencePressure: 0.6,
  lexicalDispersion: 0.5,
  contentWordComplexity: 0.5,
  modifierDensity: 0.1,
  hedgeDensity: 0.1,
  abstractionPosture: 0.5,
  directness: 0.5,
  latinatePreference: 0.5
});

const DIMENSION_WEIGHTS = Object.freeze({
  avgSentenceLength: 0.18,
  sentenceLengthSpread: 0.06,
  punctuationDensity: 0.08,
  contractionDensity: 0.1,
  lineBreakDensity: 0.04,
  repeatedBigramPressure: 0.03,
  recurrencePressure: 0.05,
  lexicalDispersion: 0.08,
  contentWordComplexity: 0.06,
  modifierDensity: 0.04,
  hedgeDensity: 0.08,
  abstractionPosture: 0.06,
  directness: 0.08,
  latinatePreference: 0.06
});

function round(value, digits = 4) {
  return Number(Number(value || 0).toFixed(digits));
}

function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

function mean(values = []) {
  if (!values.length) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function sortUniqueStrings(values = []) {
  return [...new Set((values || []).filter(Boolean))].sort((left, right) => left.localeCompare(right));
}

function normalizeRelationInventory(value) {
  if (Array.isArray(value)) {
    return sortUniqueStrings(value);
  }
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort((left, right) => left.localeCompare(right))
      .map((key) => `${key}:${value[key]}`);
  }
  return [];
}

function jaccard(left = [], right = []) {
  const leftSet = new Set(left || []);
  const rightSet = new Set(right || []);
  const universe = new Set([...leftSet, ...rightSet]);
  if (!universe.size) {
    return 1;
  }

  let intersection = 0;
  universe.forEach((value) => {
    if (leftSet.has(value) && rightSet.has(value)) {
      intersection += 1;
    }
  });

  return intersection / universe.size;
}

export function buildSemanticContract(trace = {}) {
  const realization = trace.realizationSummary || {};
  const plan = trace.planSummary || {};
  const semanticAudit = trace.semanticAudit || {};
  const protectedAudit = trace.protectedAnchorAudit || {};

  return {
    transferClass: realization.transferClass || 'native',
    realizationTier: realization.realizationTier || 'none',
    changedDimensions: sortUniqueStrings(realization.changedDimensions || []),
    lexemeSwapFamilies: sortUniqueStrings((realization.lexemeSwaps || []).map((swap) => swap.family)),
    relationInventory: normalizeRelationInventory(plan.relationInventory),
    structuralOperations: sortUniqueStrings(plan.structuralOperationsSelected || []),
    lexicalOperations: sortUniqueStrings(plan.lexicalRegisterOperationsSelected || []),
    connectorStrategy: plan.connectorStrategy || 'balanced',
    contractionStrategy: plan.contractionStrategy || 'hold',
    propositionCoverage: semanticAudit.propositionCoverage ?? 1,
    actorCoverage: semanticAudit.actorCoverage ?? 1,
    actionCoverage: semanticAudit.actionCoverage ?? 1,
    objectCoverage: semanticAudit.objectCoverage ?? 1,
    polarityMismatches: semanticAudit.polarityMismatches ?? 0,
    tenseMismatches: semanticAudit.tenseMismatches ?? 0,
    protectedAnchorIntegrity: protectedAudit.protectedAnchorIntegrity ?? semanticAudit.protectedAnchorIntegrity ?? 1
  };
}

export function dimensionFidelity(generatedProfile, fingerprint) {
  return SCALAR_DIMENSIONS.map((dimension) => {
    const target = Number(fingerprint?.scalars?.[dimension]?.mean) || 0;
    const actual = Number(generatedProfile?.[dimension]) || 0;
    const delta = actual - target;
    const normalizedDelta = delta / (DIMENSION_SCALES[dimension] || 1);
    const fidelity = clamp01(1 - Math.abs(normalizedDelta));
    return {
      dimension,
      target: round(target),
      actual: round(actual),
      delta: round(delta),
      normalizedDelta: round(normalizedDelta),
      fidelity: round(fidelity),
      weight: DIMENSION_WEIGHTS[dimension] || 0,
      status: fidelity >= 0.85 ? 'good' : fidelity >= 0.65 ? 'acceptable' : 'off'
    };
  });
}

export function aggregateFidelity(dimensionResults = []) {
  const weightSum = dimensionResults.reduce((sum, dimension) => sum + (dimension.weight || 0), 0);
  if (!weightSum) {
    return 0;
  }

  const weighted = dimensionResults.reduce((sum, dimension) => {
    return sum + ((dimension.weight || 0) * (dimension.fidelity || 0));
  }, 0);

  return round(weighted / weightSum);
}

export function chooseCalibrationSamples(sampleLibrary = [], explicitIds = TRAINER_CALIBRATION_SAMPLE_IDS) {
  const byId = Object.fromEntries((sampleLibrary || []).map((sample) => [sample.id, sample]));
  const preferred = explicitIds.map((id) => byId[id]).filter(Boolean);
  if (preferred.length >= 4) {
    return preferred;
  }

  const seen = new Set(preferred.map((sample) => sample.id));
  return [
    ...preferred,
    ...(sampleLibrary || []).filter((sample) => !seen.has(sample.id)).slice(0, Math.max(0, 5 - preferred.length))
  ];
}

function buildShell(engine, profile, label, strength = 0.86) {
  return {
    mode: 'persona',
    label,
    profile: { ...profile },
    mod: typeof engine.cadenceModFromProfile === 'function' ? engine.cadenceModFromProfile(profile) : null,
    strength,
    source: 'trainer'
  };
}

function buildScalarComparison(engine, generatedText, referenceSamples = [], fingerprint = {}) {
  const generatedProfile = engine.extractCadenceProfile(generatedText);
  const dimensionResults = dimensionFidelity(generatedProfile, fingerprint);
  const aggregate = aggregateFidelity(dimensionResults);
  const pairwise = referenceSamples.slice(0, 5).map((sampleText) => {
    const comparison = engine.compareTexts(generatedText, sampleText);
    return {
      similarity: comparison.similarity,
      traceability: comparison.traceability,
      lexicalOverlap: comparison.lexicalOverlap
    };
  });

  return {
    generatedProfile,
    dimensions: dimensionResults,
    aggregate,
    offDimensions: dimensionResults.filter((dimension) => dimension.status === 'off').sort((left, right) => left.fidelity - right.fidelity),
    acceptableDimensions: dimensionResults.filter((dimension) => dimension.status === 'acceptable').sort((left, right) => left.fidelity - right.fidelity),
    pairwise: {
      meanSimilarity: round(mean(pairwise.map((entry) => entry.similarity || 0))),
      meanTraceability: round(mean(pairwise.map((entry) => entry.traceability || 0))),
      comparisons: pairwise
    }
  };
}

function buildSemanticSafety(contract = {}) {
  return {
    propositionCoverage: contract.propositionCoverage ?? 1,
    actorCoverage: contract.actorCoverage ?? 1,
    actionCoverage: contract.actionCoverage ?? 1,
    objectCoverage: contract.objectCoverage ?? 1,
    polarityMismatches: contract.polarityMismatches ?? 0,
    tenseMismatches: contract.tenseMismatches ?? 0,
    protectedAnchorIntegrity: contract.protectedAnchorIntegrity ?? 1
  };
}

function buildAgreement(targetContract, candidateContract) {
  const changedDimensionsOverlap = jaccard(targetContract.changedDimensions, candidateContract.changedDimensions);
  const lexemeFamilyOverlap = jaccard(targetContract.lexemeSwapFamilies, candidateContract.lexemeSwapFamilies);
  const relationOverlap = jaccard(targetContract.relationInventory, candidateContract.relationInventory);
  const structuralOverlap = jaccard(targetContract.structuralOperations, candidateContract.structuralOperations);
  const lexicalOverlap = jaccard(targetContract.lexicalOperations, candidateContract.lexicalOperations);

  const propositionAlignment = 1 - Math.min(1, Math.abs((targetContract.propositionCoverage ?? 1) - (candidateContract.propositionCoverage ?? 1)));
  const actorAlignment = 1 - Math.min(1, Math.abs((targetContract.actorCoverage ?? 1) - (candidateContract.actorCoverage ?? 1)));
  const actionAlignment = 1 - Math.min(1, Math.abs((targetContract.actionCoverage ?? 1) - (candidateContract.actionCoverage ?? 1)));
  const objectAlignment = 1 - Math.min(1, Math.abs((targetContract.objectCoverage ?? 1) - (candidateContract.objectCoverage ?? 1)));

  const score = clamp01(
    (targetContract.transferClass === candidateContract.transferClass ? 0.18 : 0) +
    (targetContract.realizationTier === candidateContract.realizationTier ? 0.14 : 0) +
    (changedDimensionsOverlap * 0.12) +
    (lexemeFamilyOverlap * 0.08) +
    (relationOverlap * 0.12) +
    (structuralOverlap * 0.1) +
    (lexicalOverlap * 0.1) +
    (targetContract.connectorStrategy === candidateContract.connectorStrategy ? 0.06 : 0) +
    (targetContract.contractionStrategy === candidateContract.contractionStrategy ? 0.06 : 0) +
    ((candidateContract.polarityMismatches ?? 0) === 0 ? 0.08 : 0) +
    ((candidateContract.protectedAnchorIntegrity ?? 1) === 1 ? 0.06 : 0) +
    (propositionAlignment * 0.04) +
    (actorAlignment * 0.02) +
    (actionAlignment * 0.03) +
    (objectAlignment * 0.01)
  );

  return {
    score: round(score),
    changedDimensionsOverlap: round(changedDimensionsOverlap),
    lexemeFamilyOverlap: round(lexemeFamilyOverlap),
    relationOverlap: round(relationOverlap),
    structuralOverlap: round(structuralOverlap),
    lexicalOverlap: round(lexicalOverlap)
  };
}

function buildCorrectionPreview(engine, generatedText, generatedProfile, targetProfile) {
  try {
    const ir = engine.segmentTextToIR(generatedText, {});
    const opportunityProfile = engine.buildOpportunityProfileFromIR(ir);
    const plan = engine.buildTransferPlanFromIR(ir, generatedProfile, targetProfile, 0.88, opportunityProfile);
    const beamResult = engine.beamSearchTransfer(
      ir,
      plan,
      generatedProfile,
      targetProfile,
      0.88,
      {},
      generatedText,
      typeof engine.cadenceModFromProfile === 'function' ? engine.cadenceModFromProfile(targetProfile) : {},
      {},
      false
    );

    return {
      ir,
      opportunityProfile,
      plan,
      beamPreview: beamResult?.bestCandidate
        ? {
            text: beamResult.bestCandidate.text,
            score: round(beamResult.bestCandidate.score, 3),
            changedDimensions: sortUniqueStrings(beamResult.bestCandidate.changedDimensions || []),
            operationHistory: sortUniqueStrings(beamResult.bestCandidate.operationHistory || [])
          }
        : null
    };
  } catch (error) {
    return {
      error: error.message
    };
  }
}

function buildCorrectionHints(scalarSummary, retrievalSummary, preview = {}) {
  const hints = [];

  scalarSummary.offDimensions.slice(0, 4).forEach((dimension) => {
    const direction = dimension.delta > 0 ? 'too high' : 'too low';
    const dimensionLabel = dimension.dimension.replace(/([A-Z])/g, ' $1').toLowerCase();
    hints.push(`${dimensionLabel} is ${direction}; adjust toward the target fingerprint before asking the model for another pass.`);
  });

  if (!retrievalSummary.retrievalPass) {
    hints.push('The generated sample does not yet build a shell that behaves like the target shell under calibration transfer. Fix retrieval behavior before trusting surface resemblance.');
  }
  if ((retrievalSummary.semanticAuditSummary?.propositionCoverageMin ?? 1) < 0.85) {
    hints.push('Calibration traces are dropping proposition coverage. Push the model toward cleaner clause preservation and less ornamental reframing.');
  }
  if ((retrievalSummary.semanticAuditSummary?.actorCoverageMin ?? 1) < 0.75) {
    hints.push('Actor coverage is thinning under retrieval pressure. Keep subjects and agent roles more explicit.');
  }
  if ((retrievalSummary.semanticAuditSummary?.actionCoverageMin ?? 1) < 0.85) {
    hints.push('Action coverage is too soft. Ask for stronger verb realization and less nominal drift.');
  }
  if ((retrievalSummary.protectedAnchorSummary?.integrityMin ?? 1) < 1) {
    hints.push('Protected anchors are not surviving intact. Reinforce literal protection rules in the next prompt.');
  }
  if (preview?.plan?.connectorStrategy && preview.plan.connectorStrategy !== 'balanced') {
    hints.push(`The engine wants a ${preview.plan.connectorStrategy} connector strategy. Push the model toward that transition lane more explicitly.`);
  }
  if (preview?.plan?.contractionStrategy && preview.plan.contractionStrategy !== 'hold') {
    hints.push(`The engine wants contraction strategy "${preview.plan.contractionStrategy}". Tighten that in the prompt or correction round.`);
  }

  return sortUniqueStrings(hints);
}

export function validateCandidateAgainstFingerprint(engine, generatedText, extraction, options = {}) {
  const text = String(generatedText || '').trim();
  if (!text) {
    throw new Error('Paste generated output before validation.');
  }

  const calibrationSamples = chooseCalibrationSamples(options.sampleLibrary || [], options.calibrationSampleIds || TRAINER_CALIBRATION_SAMPLE_IDS);
  const scalarSummary = buildScalarComparison(engine, text, extraction.samples, extraction.fingerprint);
  const targetProfile = extraction.targetProfile;
  const targetShell = buildShell(engine, targetProfile, `${options.personaName || 'trainer target'} shell`, 0.88);
  const candidateShell = buildShell(engine, scalarSummary.generatedProfile, `${options.personaName || 'generated candidate'} shell`, 0.88);

  const calibration = calibrationSamples.map((sample) => {
    const targetTrace = engine.buildCadenceTransferTrace(sample.text, targetShell, { retrieval: true });
    const candidateTrace = engine.buildCadenceTransferTrace(sample.text, candidateShell, { retrieval: true });
    const targetContract = buildSemanticContract(targetTrace);
    const candidateContract = buildSemanticContract(candidateTrace);
    const agreement = buildAgreement(targetContract, candidateContract);
    const targetSafety = buildSemanticSafety(targetContract);
    const safety = buildSemanticSafety(candidateContract);
    const safetyPass =
      safety.propositionCoverage >= Math.min(0.85, targetSafety.propositionCoverage) &&
      safety.actorCoverage >= Math.min(0.75, targetSafety.actorCoverage) &&
      safety.actionCoverage >= Math.min(0.85, targetSafety.actionCoverage) &&
      safety.objectCoverage >= Math.min(0.65, targetSafety.objectCoverage) &&
      safety.polarityMismatches <= targetSafety.polarityMismatches &&
      safety.tenseMismatches <= Math.max(targetSafety.tenseMismatches, 1) &&
      safety.protectedAnchorIntegrity >= targetSafety.protectedAnchorIntegrity;

    return {
      id: sample.id,
      name: sample.name,
      targetContract,
      candidateContract,
      agreement,
      safety,
      pass: safetyPass && agreement.score >= 0.62
    };
  });

  const semanticAuditSummary = {
    propositionCoverageMin: round(Math.min(...calibration.map((entry) => entry.safety.propositionCoverage))),
    actorCoverageMin: round(Math.min(...calibration.map((entry) => entry.safety.actorCoverage))),
    actionCoverageMin: round(Math.min(...calibration.map((entry) => entry.safety.actionCoverage))),
    objectCoverageMin: round(Math.min(...calibration.map((entry) => entry.safety.objectCoverage))),
    polarityMismatchesTotal: calibration.reduce((sum, entry) => sum + (entry.safety.polarityMismatches || 0), 0),
    tenseMismatchesTotal: calibration.reduce((sum, entry) => sum + (entry.safety.tenseMismatches || 0), 0)
  };
  const protectedAnchorSummary = {
    integrityMin: round(Math.min(...calibration.map((entry) => entry.safety.protectedAnchorIntegrity))),
    integrityMean: round(mean(calibration.map((entry) => entry.safety.protectedAnchorIntegrity)))
  };
  const retrievalContract = {
    calibration: calibration.map((entry) => ({
      id: entry.id,
      name: entry.name,
      pass: entry.pass,
      agreement: entry.agreement,
      targetContract: entry.targetContract,
      candidateContract: entry.candidateContract,
      safety: entry.safety
    })),
    calibrationCount: calibration.length,
    passCount: calibration.filter((entry) => entry.pass).length,
    meanAgreement: round(mean(calibration.map((entry) => entry.agreement.score))),
    retrievalPass: calibration.every((entry) => entry.pass)
  };

  const correctionPreview = buildCorrectionPreview(engine, text, scalarSummary.generatedProfile, targetProfile);
  const correctionHints = buildCorrectionHints(
    scalarSummary,
    {
      retrievalPass: retrievalContract.retrievalPass,
      semanticAuditSummary,
      protectedAnchorSummary
    },
    correctionPreview
  );

  return {
    generatedText: text,
    scalarSummary: {
      aggregate: scalarSummary.aggregate,
      pairwise: scalarSummary.pairwise,
      dimensions: scalarSummary.dimensions,
      offDimensions: scalarSummary.offDimensions,
      acceptableDimensions: scalarSummary.acceptableDimensions,
      generatedProfile: scalarSummary.generatedProfile
    },
    retrievalContract,
    semanticAuditSummary,
    protectedAnchorSummary,
    correctionPreview,
    correctionHints,
    pass: retrievalContract.retrievalPass && scalarSummary.aggregate >= 0.68,
    status: retrievalContract.retrievalPass
      ? scalarSummary.aggregate >= 0.68 ? 'ready' : 'scalar-drift'
      : 'retrieval-failed'
  };
}
