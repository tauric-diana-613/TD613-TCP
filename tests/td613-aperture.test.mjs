import assert from 'assert';
import {
  TD613_APERTURE_PROTOCOL,
  auditTD613ApertureWitnessAnchors,
  buildTD613ApertureContext,
  buildTD613GovernedExposureSchema,
  buildTD613ApertureProjectionPlan,
  classifyTD613ApertureProjection,
  detectTD613ApertureTextPathologies,
  extractTD613ApertureWitnessAnchors,
  registerTD613ApertureSegment,
  repairTD613ApertureProjection,
  reviewTD613ApertureTransfer,
  selectTD613ApertureDecision,
  selectTD613ApertureHarbor,
  splitTD613ApertureSourceSegments
} from '../app/engine/td613-aperture.js';

const guardedContext = buildTD613ApertureContext({
  recognized: true,
  explained: false,
  routeAvailable: true,
  density: 0.34,
  recurrencePressure: 0.62,
  routePressure: 0.58,
  branchPressure: 0.44,
  criticality: 0.48,
  traceability: 0.81,
  mirrorLogic: 'off',
  custodyArchive: 'witness',
  badge: 'badge.holds'
});

assert.equal(guardedContext.protocolId, TD613_APERTURE_PROTOCOL.id);
assert.equal(guardedContext.observedRegime, 'PRCS-A');
assert.equal(guardedContext.toolIdentity, 'TD613 Aperture');
assert.equal(guardedContext.counterRecognitionRequired, true);
assert.equal(guardedContext.generativePassageBlocked, true);
assert(guardedContext.recaptureRisk >= 0.46);

const governedExposure = buildTD613GovernedExposureSchema({
  latentState: { label: 'latent witness field', count: 100 },
  projectedState: { label: 'projected witness field', count: 62 },
  registeredSurface: { label: 'registered surface', count: 41 },
  sourceClass: 'paired witness comparison',
  sourceClasses: ['paired witness comparison', 'cadence witness'],
  authorityCeiling: 'witness',
  routeState: 'hold-branch',
  candidateSuppression: 0.29,
  observabilityDeficit: 0.38,
  aliasPersistence: 0.16,
  namingSensitivity: 0.12,
  redundancyInflation: 0.21,
  capacityPressure: 0.34,
  policyPressure: 0.18,
  provenanceIntegrity: 0.83,
  burdenConcentration: 0.42,
  theta: { current: 0.4, classes: ['public', 'protected'] }
});
assert.equal(governedExposure.schemaVersion, 'td613-governed-exposure/v1');
assert.equal(governedExposure.S.count, 100);
assert.equal(governedExposure.S_prime.count, 62);
assert.equal(governedExposure.Y.count, 41);
assert.equal(governedExposure.sourceClass, 'paired witness comparison');
assert.equal(governedExposure.authorityCeiling, 'witness');
assert.equal(governedExposure.routeState, 'hold-branch');
assert.equal(governedExposure.Theta_u.current, 0.4);
assert.equal(governedExposure.dominantOperator.code, 'P');

assert.equal(
  selectTD613ApertureDecision({ apertureContext: guardedContext }),
  'criticality'
);
assert.equal(
  selectTD613ApertureHarbor({
    apertureContext: guardedContext,
    decision: 'criticality'
  }),
  'mirror.off'
);

const passageContext = buildTD613ApertureContext({
  recognized: true,
  explained: true,
  routeAvailable: true,
  density: 0.18,
  recurrencePressure: 0.22,
  routePressure: 0.34,
  branchPressure: 0.16,
  criticality: 0.18,
  traceability: 0.72,
  mirrorLogic: 'on',
  custodyArchive: 'institutional',
  badge: 'badge.holds'
});

assert.equal(passageContext.generativePassageBlocked, false);
assert.equal(
  selectTD613ApertureDecision({ apertureContext: passageContext }),
  'passage'
);
assert.equal(
  selectTD613ApertureHarbor({
    apertureContext: passageContext,
    decision: 'passage'
  }),
  'receipt.capture'
);

const transferReview = reviewTD613ApertureTransfer({
  sourceText: 'Need the charger by the side door. Knock twice if the light is out.',
  outputText: 'Need the charger by the side door. This request is eligible for enforcement review.',
  shellMode: 'borrowed',
  retrieval: true,
  semanticRisk: 0.18,
  visibleShift: true,
  nonTrivialShift: true,
  protectedAnchorIntegrity: 1,
  propositionCoverage: 1,
  actorCoverage: 1,
  actionCoverage: 1,
  objectCoverage: 1
});

assert.equal(transferReview.applied, true);
assert.equal(transferReview.blocked, false);
assert(transferReview.introducedEnforcementTerms.includes('eligible'));
assert(transferReview.reasons.some((reason) => /warning pressure/i.test(reason)));
assert(transferReview.warningSignals.includes('enforcement-framing'));
assert.equal(transferReview.apertureAudit.generatorFault, false);

const semanticLockedReview = reviewTD613ApertureTransfer({
  sourceText: 'I do not want the west door opened yet.',
  outputText: "I don't want the west door opened yet.",
  shellMode: 'borrowed',
  retrieval: true,
  semanticRisk: 0.12,
  semanticLockIntact: true,
  visibleShift: false,
  nonTrivialShift: false,
  protectedAnchorIntegrity: 1,
  propositionCoverage: 1,
  actorCoverage: 1,
  actionCoverage: 1,
  objectCoverage: 1
});
assert.equal(semanticLockedReview.semanticLockIntact, true);
assert.equal(semanticLockedReview.semanticCoverageRisk, 0);
assert.equal(semanticLockedReview.observabilityDeficit, 0);
assert.equal(semanticLockedReview.redundancyInflation, 0);
assert.equal(semanticLockedReview.capacityPressure, 0);
assert(!semanticLockedReview.warningSignals.includes('semantic-compression'));
assert(!semanticLockedReview.warningSignals.includes('surface-close'));

const sparkPlan = buildTD613ApertureProjectionPlan({
  personaId: 'spark',
  sourceProfile: { avgSentenceLength: 13, contractionDensity: 0.02, punctuationDensity: 0.08 },
  targetProfile: { avgSentenceLength: 7, contractionDensity: 0.08, punctuationDensity: 0.12 }
});
assert.equal(sparkPlan.connectorMode, 'split');
assert.equal(sparkPlan.contractionMode, 'contract');

const duplicatePathologies = detectTD613ApertureTextPathologies({
  sourceText: 'Need the charger by the side door.',
  outputText: 'Need the charger by the side door. Need the charger by the side door.'
});
assert(duplicatePathologies.flags.includes('duplicated-source'));
assert.equal(duplicatePathologies.severe, true);

const repairedProjection = repairTD613ApertureProjection({
  sourceText: 'I want to say hi to him.',
  outputText: 'I want to tell hi to him, and and call him.',
  personaId: 'matron',
  sourceProfile: { avgSentenceLength: 6, contractionDensity: 0.05, punctuationDensity: 0.08 },
  targetProfile: { avgSentenceLength: 10, contractionDensity: 0.05, punctuationDensity: 0.04 }
});
assert.equal(repairedProjection.repaired, true);
assert(!/\btell hi\b/i.test(repairedProjection.outputText));
assert(!/\band and\b/i.test(repairedProjection.outputText));

const segmentedSource = splitTD613ApertureSourceSegments('Case number CS-88412. The recovery email ends in @elmfield.net, which matched account records.');
assert.equal(segmentedSource.length, 2);
assert(segmentedSource[1].includes('@elmfield.net'));

const witnessAnchors = extractTD613ApertureWitnessAnchors({
  sourceText: 'Customer contacted support at 11:23 AM regarding account review.',
  sourceIR: {
    sentences: [{
      clauses: [{
        propositionHead: 'contacted support',
        actor: 'customer',
        action: 'contacted',
        object: 'account review'
      }]
    }]
  },
  protectedState: {
    literals: [{ value: '11:23 AM' }]
  }
});
assert(witnessAnchors.some((anchor) => anchor.value === '11:23 am'));
assert(witnessAnchors.some((anchor) => anchor.value === 'account review'));

const witnessAudit = auditTD613ApertureWitnessAnchors({
  sourceText: 'Customer contacted support regarding account review.',
  outputText: 'Customer contacted help regarding account check.',
  sourceIR: {
    sentences: [{
      clauses: [{
        propositionHead: 'contacted support',
        actor: 'customer',
        action: 'contacted',
        object: 'account review'
      }]
    }]
  }
});
assert(witnessAudit.missingAnchors.includes('support'));
assert(witnessAudit.aliasPersistenceRisk > 0);

const registeredSegment = registerTD613ApertureSegment({
  sourceText: 'Customer contacted support regarding account review.',
  projectedText: 'Customer contacted help regarding account check.',
  surfaceText: 'Customer contacted support regarding account review.',
  personaId: 'spark',
  sourceProfile: { avgSentenceLength: 8, contractionDensity: 0.02, punctuationDensity: 0.06 },
  targetProfile: { avgSentenceLength: 6, contractionDensity: 0.08, punctuationDensity: 0.08 },
  sourceIR: {
    sentences: [{
      clauses: [{
        propositionHead: 'contacted support',
        actor: 'customer',
        action: 'contacted',
        object: 'account review'
      }]
    }]
  },
  protectedState: { literals: [] }
});
assert.equal(registeredSegment.outcome, 'surface-held');
assert.equal(registeredSegment.registeredText, 'Customer contacted support regarding account review.');
assert.equal(registeredSegment.apertureAudit.generatorFault, false);
assert.equal(registeredSegment.witnessAnchorIntegrity, 1);

const projectedOutcome = classifyTD613ApertureProjection({
  sourceText: 'Keep doing what you are doing.',
  outputText: 'Keep doing what you are doing. Stay with it.',
  changedDimensions: ['sentence-count', 'connector-stance', 'directness'],
  lexemeSwaps: [],
  visibleShift: true,
  nonTrivialShift: true,
  repaired: false,
  pathologies: { flags: [], severe: false },
  blocked: false
});
assert.equal(projectedOutcome.outcome, 'projected');

const reroutedOutcome = classifyTD613ApertureProjection({
  sourceText: 'Keep doing what you are doing.',
  outputText: 'Keep doing what you are doing.',
  changedDimensions: [],
  lexemeSwaps: [],
  visibleShift: false,
  nonTrivialShift: false,
  repaired: false,
  pathologies: { flags: [], severe: false },
  blocked: true
});
assert.equal(reroutedOutcome.outcome, 'surface-held');
assert.equal(reroutedOutcome.generatorFault, false);

console.log('td613-aperture.test.mjs passed');
