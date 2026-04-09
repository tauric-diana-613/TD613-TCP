import assert from 'assert';
import {
  TD613_APERTURE_PROTOCOL,
  buildTD613ApertureContext,
  buildTD613ApertureProjectionPlan,
  classifyTD613ApertureProjection,
  detectTD613ApertureTextPathologies,
  repairTD613ApertureProjection,
  reviewTD613ApertureTransfer,
  selectTD613ApertureDecision,
  selectTD613ApertureHarbor
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
assert.equal(transferReview.blocked, true);
assert(transferReview.introducedEnforcementTerms.includes('eligible'));
assert(transferReview.reasons.some((reason) => /recapture posture drift/i.test(reason)));

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
assert.equal(reroutedOutcome.outcome, 'source-rerouted');

console.log('td613-aperture.test.mjs passed');
