import assert from 'assert';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';
import {
  buildCadenceTransfer,
  buildCadenceTransferTrace,
  buildOpportunityProfileFromIR,
  buildTransferPlanFromIR,
  beamSearchTransfer,
  extractCadenceProfile,
  segmentTextToIR,
  sentenceSplit
} from '../app/engine/stylometry.js';
import {
  CANONICAL_TRANSFER_CASES,
  buildBorrowedShell
} from './canonical-transfer-cases.mjs';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const browserEngineUrl = `${pathToFileURL(path.join(repoRoot, 'app', 'browser-engine.js')).href}?t=${Date.now()}`;

globalThis.window = {};
await import(browserEngineUrl);

const browserEngine = globalThis.window.TCP_ENGINE || {};

assert.equal(typeof browserEngine.buildCadenceTransfer, 'function', 'Browser engine exposes buildCadenceTransfer');
assert.equal(typeof browserEngine.buildCadenceTransferTrace, 'function', 'Browser engine exposes buildCadenceTransferTrace');
assert.equal(typeof browserEngine.sentenceSplit, 'function', 'Browser engine exposes sentenceSplit');
assert.equal(typeof browserEngine.segmentTextToIR, 'function', 'Browser engine exposes segmentTextToIR');
assert.equal(typeof browserEngine.buildOpportunityProfileFromIR, 'function', 'Browser engine exposes buildOpportunityProfileFromIR');
assert.equal(typeof browserEngine.buildTransferPlanFromIR, 'function', 'Browser engine exposes buildTransferPlanFromIR');
assert.equal(typeof browserEngine.beamSearchTransfer, 'function', 'Browser engine exposes beamSearchTransfer');

for (const testCase of CANONICAL_TRANSFER_CASES) {
  const shell = buildBorrowedShell(extractCadenceProfile, testCase);
  const nodeResult = buildCadenceTransfer(testCase.sourceText, shell, { retrieval: true });
  const browserResult = browserEngine.buildCadenceTransfer(testCase.sourceText, shell, { retrieval: true });
  const nodeTrace = buildCadenceTransferTrace(testCase.sourceText, shell);
  const browserTrace = browserEngine.buildCadenceTransferTrace(testCase.sourceText, shell);

  assert.equal(browserResult.text, nodeResult.text, `${testCase.id}: browser text matches Node`);
  assert.equal(browserResult.transferClass, nodeResult.transferClass, `${testCase.id}: transferClass matches`);
  assert.equal(browserResult.realizationTier, nodeResult.realizationTier, `${testCase.id}: realizationTier matches`);
  assert.deepEqual(browserResult.changedDimensions, nodeResult.changedDimensions, `${testCase.id}: changedDimensions match`);
  assert.deepEqual(browserResult.semanticAudit, nodeResult.semanticAudit, `${testCase.id}: semanticAudit matches`);
  assert.deepEqual(browserResult.protectedAnchorAudit, nodeResult.protectedAnchorAudit, `${testCase.id}: protectedAnchorAudit matches`);
  assert.deepEqual(browserTrace.planSummary, nodeTrace.planSummary, `${testCase.id}: planSummary matches`);
  assert.deepEqual(browserTrace.semanticAudit, nodeTrace.semanticAudit, `${testCase.id}: trace semanticAudit matches`);
  assert.deepEqual(browserTrace.protectedAnchorAudit, nodeTrace.protectedAnchorAudit, `${testCase.id}: trace protectedAnchorAudit matches`);
}

const paritySample = CANONICAL_TRANSFER_CASES[0];
const parityShell = buildBorrowedShell(extractCadenceProfile, paritySample);
const nodeIR = segmentTextToIR(paritySample.sourceText, { literals: [], text: paritySample.sourceText });
const browserIR = browserEngine.segmentTextToIR(paritySample.sourceText, { literals: [], text: paritySample.sourceText });
const nodeOpportunity = buildOpportunityProfileFromIR(nodeIR);
const browserOpportunity = browserEngine.buildOpportunityProfileFromIR(browserIR);
const sourceProfile = extractCadenceProfile(paritySample.sourceText);
const targetProfile = extractCadenceProfile(paritySample.donorText);
const nodePlan = buildTransferPlanFromIR(nodeIR, sourceProfile, targetProfile, paritySample.strength, nodeOpportunity);
const browserPlan = browserEngine.buildTransferPlanFromIR(browserIR, sourceProfile, targetProfile, paritySample.strength, browserOpportunity);

assert.deepEqual(browserEngine.sentenceSplit(paritySample.sourceText), sentenceSplit(paritySample.sourceText), 'sentenceSplit parity holds');
assert.deepEqual(browserIR.metadata, nodeIR.metadata, 'segmentTextToIR metadata parity holds');
assert.deepEqual(browserOpportunity, nodeOpportunity, 'buildOpportunityProfileFromIR parity holds');
assert.deepEqual(browserPlan, nodePlan, 'buildTransferPlanFromIR parity holds');

const nodeBeam = beamSearchTransfer(nodeIR, nodePlan, sourceProfile, targetProfile, paritySample.strength, { literals: [], text: paritySample.sourceText }, paritySample.sourceText, {}, parityShell.profile, false);
const browserBeam = browserEngine.beamSearchTransfer(browserIR, browserPlan, sourceProfile, targetProfile, paritySample.strength, { literals: [], text: paritySample.sourceText }, paritySample.sourceText, {}, parityShell.profile, false);

assert.equal(browserBeam.bestCandidate.text, nodeBeam.bestCandidate.text, 'beamSearchTransfer best candidate text parity holds');
assert.deepEqual(browserBeam.bestCandidate.changedDimensions, nodeBeam.bestCandidate.changedDimensions, 'beamSearchTransfer changedDimensions parity holds');

console.log('browser-parity.test.mjs passed');
