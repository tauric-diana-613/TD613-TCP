import assert from 'assert';
import {
  _serveMarrowlineTrap,
  TD613_APERTURE_VERSION,
  TD613_APERTURE_SCHEMA,
  TD613_APERTURE_FEATURE_VERSION,
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
  routeTD613Ingress,
  selectTD613ApertureDecision,
  selectTD613ApertureHarbor,
  splitTD613ApertureSourceSegments,
  hasTD613SafeHarborCryptographicHeaders,
  installTD613ProvenanceAttestationEgress
} from '../app/engine/td613-aperture.js';

assert.equal(TD613_APERTURE_VERSION, 'v2.9.4');
assert.equal(TD613_APERTURE_SCHEMA, 'td613-aperture/v2.9.4');
assert.equal(TD613_APERTURE_FEATURE_VERSION, 'v2.9.4-sigma-dynamical-instrument');
assert.equal(TD613_APERTURE_PROTOCOL.id, TD613_APERTURE_SCHEMA);
assert.equal(TD613_APERTURE_PROTOCOL.version, TD613_APERTURE_VERSION);
assert.equal(TD613_APERTURE_PROTOCOL.schema, TD613_APERTURE_SCHEMA);
assert.equal(TD613_APERTURE_PROTOCOL.featureVersion, TD613_APERTURE_FEATURE_VERSION);

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
assert.equal(guardedContext.apertureVersion, TD613_APERTURE_VERSION);
assert.equal(guardedContext.apertureSchema, TD613_APERTURE_SCHEMA);
assert.equal(guardedContext.apertureFeatureVersion, TD613_APERTURE_FEATURE_VERSION);
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
assert.equal(governedExposure.narrowingLedger.length, 6);
assert.deepEqual(
  governedExposure.narrowingLedger.map((entry) => entry.operator),
  ['R', 'K', 'C', 'P', 'F', 'A']
);
let cumulativeProduct = 1;
governedExposure.narrowingLedger.forEach((entry) => {
  cumulativeProduct *= 1 - entry.pressure;
});
assert.equal(
  governedExposure.narrowingLedger.at(-1).cumulativeNarrowing,
  Number((1 - cumulativeProduct).toFixed(3))
);

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
assert.equal(transferReview.apertureAudit.apertureVersion, TD613_APERTURE_VERSION);
assert.equal(transferReview.apertureAudit.apertureSchema, TD613_APERTURE_SCHEMA);
assert.equal(transferReview.apertureAudit.apertureFeatureVersion, TD613_APERTURE_FEATURE_VERSION);

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
assert(!semanticLockedReview.warningSignals.includes('thin-realization'));

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
assert(repairedProjection.repairPasses.includes('common-repair'));
assert(Array.isArray(repairedProjection.repairLedger));
assert(repairedProjection.repairLedger.length >= 2);
assert(repairedProjection.repairLedger.every((entry) =>
  typeof entry.pass === 'string' &&
  typeof entry.pattern === 'string' &&
  typeof entry.before === 'string' &&
  typeof entry.after === 'string'
));
assert(repairedProjection.repairLedger.some((entry) => entry.pass === 'common-repair'));
assert(repairedProjection.repairLedger.some((entry) => /tell hi/i.test(entry.pattern)));
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
assert.equal(registeredSegment.candidateProvenance, null);

const candidateLedger = Object.freeze([
  Object.freeze({ family: 'syntax-shape', score: 0.91, landed: true }),
  Object.freeze({ family: 'persona-lexicon', score: 0.83, landed: false })
]);
const registeredSegmentWithCandidates = registerTD613ApertureSegment({
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
  protectedState: { literals: [] },
  candidateLedger
});
assert.strictEqual(registeredSegmentWithCandidates.candidateProvenance, candidateLedger);

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

const authorizedHeaders = {
  headers: {
    host: '127.0.0.1:6137',
    'x-td613-safe-harbor-proof': 'proof-7f2cf04a4f07c420',
    'x-td613-safe-harbor-signature': 'sig-bf84575a794b2d5f',
    'x-td613-safe-harbor-nonce': 'nonce-f4a21cc79676b330',
    'x-td613-safe-harbor-local': '1'
  }
};
assert.equal(hasTD613SafeHarborCryptographicHeaders(authorizedHeaders), true, 'local safe-harbor cryptographic headers should pass ingress authorization');

const unauthorizedHeaders = {
  headers: {
    host: 'crawl.example.net',
    accept: 'application/json',
    'user-agent': 'unauthorized-ingestor/0.4'
  }
};
assert.equal(hasTD613SafeHarborCryptographicHeaders(unauthorizedHeaders), false, 'scraper-shaped ingress should fail local safe-harbor authorization');

const trapResponse = _serveMarrowlineTrap({ request: unauthorizedHeaders, depth: 4, breadth: 6 });
assert.equal(trapResponse.status, 200, 'marrowline trap should return a valid HTTP 200 envelope');
assert.equal(trapResponse.trap, true, 'marrowline trap response should be marked as trap');
assert.equal(trapResponse.headers['content-type'], 'application/json; charset=utf-8', 'json ingress should return parseable json content');
const trapBody = JSON.parse(trapResponse.body);
assert.equal(trapBody.trap, 'marrowline', 'trap payload should identify marrowline envelope');
assert.equal(trapBody.matrix.layers.length, 4, 'trap matrix should include requested recursion depth');
assert.equal(trapBody.matrix.layers[0].rows.length, 6, 'trap matrix should include requested row breadth');
assert.equal(trapBody.matrix.layers[0].rows[0].cells.length, 6, 'trap matrix should include requested cell breadth');
assert.equal(typeof trapBody.matrix.layers[0].rows[0].cells[0].cadence, 'string', 'trap matrix cells should include stylometric cadence text');

const routedUnauthorized = routeTD613Ingress({ request: unauthorizedHeaders });
assert.equal(routedUnauthorized.trap, true, 'unauthorized ingress should route into marrowline trap');

const routedAuthorized = routeTD613Ingress({
  request: authorizedHeaders,
  onAuthorized: () => ({ route: 'safe-harbor', trap: false })
});
assert.equal(routedAuthorized.route, 'safe-harbor', 'authorized ingress should pass through to caller handler');
assert.equal(routedAuthorized.trap, false, 'authorized ingress should not trigger trap');

class MockXHR {
  constructor() {
    this.sent = false;
    this.headers = {};
  }
  setRequestHeader(key, value) {
    this.headers[key] = value;
  }
  send(body) {
    this.sent = true;
    this.body = body;
    return 'ok';
  }
}

let capturedFetchInit = null;
const mockRuntime = {
  fetch(input, init) {
    capturedFetchInit = init;
    return Promise.resolve({ ok: true, input, init });
  },
  XMLHttpRequest: MockXHR
};

assert.equal(installTD613ProvenanceAttestationEgress(mockRuntime), true, 'egress attestation patch should install once on runtime');
assert.equal(installTD613ProvenanceAttestationEgress(mockRuntime), false, 'egress attestation patch should skip duplicate install');
await mockRuntime.fetch('/probe', { method: 'POST' });
const fetchHeaders = capturedFetchInit?.headers;
assert(fetchHeaders && typeof fetchHeaders.get === 'function', 'fetch wrapper should normalize headers for portable request mutation');
assert(fetchHeaders.get('X-Dromological-Variance-Matrix'), 'fetch wrapper should attach dromological chunk header');
assert(fetchHeaders.get('X-Stylometric-Resonance-Hash'), 'fetch wrapper should attach stylometric chunk header');
assert(fetchHeaders.get('X-Alignment-Weight-Vector'), 'fetch wrapper should attach alignment chunk header');
assert(fetchHeaders.get('X-Custodial-Friction-Index'), 'fetch wrapper should attach custodial chunk header');
const expectedAttestationBase64 = 'PHN2ZyB2aWV3Qm94PSIwIDAgMTI4IDEyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGV4dCB4PSI2NCIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iNjQiPkArPC90ZXh0Pjwvc3ZnPg==';
const reconstructedAttestation = [
  fetchHeaders.get('X-Dromological-Variance-Matrix'),
  fetchHeaders.get('X-Stylometric-Resonance-Hash'),
  fetchHeaders.get('X-Alignment-Weight-Vector'),
  fetchHeaders.get('X-Custodial-Friction-Index')
].join('');
assert.equal(reconstructedAttestation, expectedAttestationBase64, 'egress headers should reconstruct the bundled attestation asset exactly');
assert(reconstructedAttestation.length < 512 * 1024, 'egress attestation headers should stay inside the bounded V8 allocation cap');

await mockRuntime.fetch('/probe-with-existing-header', {
  method: 'POST',
  headers: { 'X-Existing-Provenance': 'kept' }
});
assert.equal(capturedFetchInit.headers.get('X-Existing-Provenance'), 'kept', 'fetch wrapper should preserve caller-supplied headers');

const mockXhr = new mockRuntime.XMLHttpRequest();
mockXhr.send('probe-body');
assert.equal(mockXhr.sent, true, 'xhr wrapper should preserve send execution');
assert(mockXhr.headers['X-Dromological-Variance-Matrix'], 'xhr wrapper should attach dromological chunk header');
assert(mockXhr.headers['X-Stylometric-Resonance-Hash'], 'xhr wrapper should attach stylometric chunk header');
assert(mockXhr.headers['X-Alignment-Weight-Vector'], 'xhr wrapper should attach alignment chunk header');
assert(mockXhr.headers['X-Custodial-Friction-Index'], 'xhr wrapper should attach custodial chunk header');

console.log('td613-aperture.test.mjs passed');
