import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import {
  PROTECTED_DIMENSIONS,
  compileEndpointPostureReceipt,
  compilePortableAnisotropyReceipt,
  compileReaderEnsemble,
  compileRecoverabilityTensor,
  compileSemanticReconstructionAssay,
  computePhasonSusceptibility,
  evaluateEndpointPosture,
  verifyEndpointPostureReceipt,
  verifyPortableAnisotropyReceipt,
  verifyReaderEnsemble,
  verifyRecoverabilityTensor,
  verifySemanticReconstructionAssay
} from '../app/engine/ash-stretch12-portable-anisotropy.js';

const options = { cryptoImpl: webcrypto, TextEncoderImpl: TextEncoder };
const sha = character => `sha256:${character.repeat(64)}`;
const metric = (point, lower = point, upper = point) => ({ lower_bps: lower, point_bps: point, upper_bps: upper, status: point ? 'PARTIAL' : 'MISSING' });
const map = point => Object.fromEntries(PROTECTED_DIMENSIONS.map(dimension => [dimension, metric(point, Math.max(0, point - 200), Math.min(10000, point + 200))]));

assert.equal(evaluateEndpointPosture({ endpointState: 'PUBLIC_SECTOR_MANAGED', routeClass: 'PUBLIC_SECTOR_MANAGED_PROVIDER', providerAction: true }).decision, 'HARD_HOLD');
assert.equal(evaluateEndpointPosture({ endpointState: 'OFFLINE_LOCAL_ATTESTED', routeClass: 'OFFLINE_LOCAL_MODEL' }).decision, 'OFFLINE_LOCAL_ELIGIBLE');
assert.equal(evaluateEndpointPosture({ endpointState: 'PERSONAL_UNMANAGED_DECLARED', routeClass: 'OFFLINE_LOCAL_MODEL', providerAction: true }).decision, 'ROUTE_MISMATCH_HOLD');

const endpoint = await compileEndpointPostureReceipt({
  caseId: 'case-stretch12',
  endpointState: 'PERSONAL_UNMANAGED_DECLARED',
  routeClass: 'CONSUMER_CLOUD_PROVIDER',
  providerAction: true,
  evidence: ['operator declaration'],
  createdAt: '2026-07-17T20:00:00.000Z'
}, options);
assert.equal(endpoint.decision, 'BOUNDED_PACKET_REVIEW');
assert.equal(await verifyEndpointPostureReceipt(endpoint, options), true);

const ensemble = await compileReaderEnsemble({
  caseId: 'case-stretch12',
  createdAt: '2026-07-17T20:00:00.000Z',
  readers: [{ readerId: 'reader-structure-v1', readerClass: 'DETERMINISTIC_STRUCTURE_READER', version: 'v1', blindSpots: ['unknown external corpora'] }]
}, options);
assert.equal(await verifyReaderEnsemble(ensemble, options), true);
assert.equal(ensemble.universal_reader_claim, false);

const tensor = await compileRecoverabilityTensor({
  caseId: 'case-stretch12',
  createdAt: '2026-07-17T20:00:00.000Z',
  localReader: map(9000),
  externalReaders: [{ readerId: 'reader-structure-v1', readerClass: 'DETERMINISTIC_STRUCTURE_READER', dimensions: map(1200) }],
  variableCount: PROTECTED_DIMENSIONS.length,
  designRank: PROTECTED_DIMENSIONS.length,
  unknownReadersUnmeasured: false
}, options);
assert.equal(await verifyRecoverabilityTensor(tensor, options), true);
assert.equal(tensor.universal_score_emitted, false);
assert.ok(tensor.external_readers[0].anisotropy.identity.conservative_bps > 0);

const phason = computePhasonSusceptibility({ baseline: map(1000), perturbed: map(4000), perturbation_norm_bps: 200, epsilon_bps: 1 });
assert.equal(phason.state, 'PHASON_THRESHOLD_RESPONSE');

const assay = await compileSemanticReconstructionAssay({
  caseId: 'case-stretch12',
  createdAt: '2026-07-17T20:00:00.000Z',
  packetDigest: sha('a'),
  readerEnsembleReference: ensemble.ensemble_id,
  readerEnsembleDigest: ensemble.receipt_digest,
  recoverabilityTensorReference: tensor.tensor_id,
  tensor,
  endpointDecision: endpoint.decision,
  routeClass: endpoint.route_class,
  features: [{ featureId: 'rare-date-role', featureClass: 'RARE_COMBINATION', surprisalMillibits: 13000, recoveryDeltaBps: 800, protectedDimensions: ['identity', 'chronology'] }],
  phason: { baseline: map(1000), perturbed: map(1200), perturbation_norm_bps: 500, epsilon_bps: 1 },
  independentlyEstimatedMarginals: true,
  heldOutCount: 4,
  heldOutErrorBps: 1200,
  replicateCount: 5
}, options);
assert.equal(await verifySemanticReconstructionAssay(assay, options), true);
assert.equal(assay.recommendation, 'BOUNDED_PACKET_ELIGIBLE');
assert.ok(assay.cannot_establish.includes('universal anonymity'));

const portable = await compilePortableAnisotropyReceipt({
  caseId: 'case-stretch12',
  createdAt: '2026-07-17T20:00:00.000Z',
  originManifestReference: 'origin-manifest-1',
  originManifestDigest: sha('b'),
  endpointReceiptReference: endpoint.endpoint_receipt_id,
  endpointReceipt: endpoint,
  recoverabilityTensorReference: tensor.tensor_id,
  tensor,
  semanticAssayReference: assay.assay_id,
  assay,
  inboundRank: 12,
  outboundRank: 3
}, options);
assert.equal(await verifyPortableAnisotropyReceipt(portable, options), true);
assert.equal(portable.portable_anisotropy_demonstrated, true);
assert.equal(portable.capsule_is_provider_packet, false);
assert.equal(portable.flowcore_has_custody, false);
assert.equal(portable.universal_secrecy_claim, false);

const managed = await compileEndpointPostureReceipt({
  caseId: 'case-stretch12', endpointState: 'MANAGED_CONFIRMED', routeClass: 'MANAGED_ENTERPRISE_PROVIDER', providerAction: true
}, options);
const heldAssay = await compileSemanticReconstructionAssay({
  caseId: 'case-stretch12', packetDigest: sha('c'), readerEnsembleReference: ensemble.ensemble_id, readerEnsembleDigest: ensemble.receipt_digest,
  recoverabilityTensorReference: tensor.tensor_id, tensor, endpointDecision: managed.decision, routeClass: managed.route_class,
  heldOutErrorBps: 10000
}, options);
assert.equal(heldAssay.recommendation, 'KEEP_LOCAL');

console.log('ash-stretch12-portable-anisotropy.test.mjs passed');
