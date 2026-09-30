import assert from 'node:assert/strict';
import { compileControlledSource } from '../app/engine/aperture-v31-controlled-source.js';
import { compileInstrumentEnsemble } from '../app/engine/aperture-v31-instrument-ensemble.js';
import { compileSnapshotLattice } from '../app/engine/aperture-v31-snapshot-lattice.js';
import { estimateReferenceLayers } from '../app/engine/aperture-v31-reference-layer.js';
import { estimateRegistryDynamics } from '../app/engine/aperture-v31-registry-dynamics.js';
import { estimateSharedLayerBurden } from '../app/engine/aperture-v31-shared-layer.js';
import { estimatePhasonSusceptibility } from '../app/engine/aperture-v31-phason-susceptibility.js';
import { estimateTemporalRoute } from '../app/engine/aperture-v31-temporal-tomography.js';
import { compileSignedResidualLedger } from '../app/engine/aperture-v31-residual-ledger.js';
import { compileTomographyReceipt, verifyTomographyReceipt } from '../app/engine/aperture-v31-reconstruction.js';
import { replayTomographyReceipt, verifyTomographyReplay } from '../app/engine/aperture-v31-replay.js';

const SOURCE = `sha256:${'3'.repeat(64)}`;
const source = await compileControlledSource({ sourceId: 'atsrc_demo0123456789abcd', sourceReceiptReference: 'ashc_demo0123456789abcd', sourceCommitment: SOURCE });
const ensemble = await compileInstrumentEnsemble({ ensembleId: 'atens_demo0123456789abcd', instruments: [
  { instrumentId: 'a', version: '1', interventionDimensions: ['route', 'time'], projection: 'surface', environment: 'lab', operatorAuthorized: true },
  { instrumentId: 'b', version: '1', interventionDimensions: ['route', 'time'], projection: 'event', environment: 'lab', operatorAuthorized: true }
] });
const snapshots = [];
for (const instrumentId of ['a', 'b']) for (const timeIndex of [0, 1]) for (const replicate of [1, 2]) snapshots.push({ snapshotId: `${instrumentId}-${timeIndex}-${replicate}`, sourceCommitment: SOURCE, instrumentId, instrumentVersion: '1', timeIndex, replicate, condition: `${instrumentId}-${timeIndex}`, environment: 'lab', interventionValues: { route: instrumentId === 'a' ? 0 : 1, time: timeIndex }, observedValue: 100 + timeIndex * 10 + (instrumentId === 'b' ? 20 : 0), heldOut: instrumentId === 'b' && timeIndex === 1 && replicate === 2, benignControl: instrumentId === 'a' && timeIndex === 0 });
const lattice = await compileSnapshotLattice({ source, ensemble, snapshots, declaredVariableCount: 2, designRank: 2, latticeId: 'atlattice_demo0123456789' });
const residual = compileSignedResidualLedger(snapshots.map(value => ({ snapshotId: value.snapshotId, instrumentId: value.instrumentId, timeIndex: value.timeIndex, replicate: value.replicate, observed: value.observedValue, predicted: value.observedValue, heldOut: value.heldOut })));
const parts = {
  referenceLayers: estimateReferenceLayers({ pairs: [{ referenceStratum: 'a', variedStratum: 'b', deltaInput: 20, deltaOutput: 10 }] }),
  registryModel: estimateRegistryDynamics({ globalConfiguration: 'declared', orientations: [1, -1], localRegistries: [0, 10] }),
  sharedLayerRelaxation: estimateSharedLayerBurden({ sharedLayer: 'route adapter', adjustments: [{ stratumId: 'a', adjustment: 10 }, { stratumId: 'b', adjustment: 20 }], normalizer: 100 }),
  phasonSusceptibility: estimatePhasonSusceptibility({ trials: [{ deltaCoordinate: 10, deltaObservation: 5 }, { deltaCoordinate: 10, deltaObservation: 6 }], shamResponse: 2 }),
  temporalRouteObject: estimateTemporalRoute(lattice),
  residualLedger: residual
};
const receipt = await compileTomographyReceipt({ experimentId: 'atx_demo0123456789abcdef', source, ensemble, lattice, ...parts, heldoutValidation: { status: 'PASS', error: { numerator: 1, denominator: 10 }, target: { numerator: 1, denominator: 5 } }, alternativeModels: ['linear response', 'finite-state transition'], benignControls: ['no-op route'] }, { receiptId: 'attomo_demo0123456789abc', createdAt: '2026-07-13T03:00:00.000Z' });
assert.equal(receipt.status, 'TOMOGRAPHY_READY');
assert.equal(receipt.assurance_class, 'AT3_MULTI_TIME_TOMOGRAPHY');
assert.equal(receipt.automatic_ash_action, false);
assert.equal(receipt.derivative_authorized, false);
assert.deepEqual(receipt.evidence_basis, ['declared controlled source', 'snapshot lattice', 'held-out validation', 'signed residual ledger']);
assert.equal(receipt.closure.status, 'OPEN');
assert.equal(await verifyTomographyReceipt(receipt), true);

const replay = await replayTomographyReceipt(receipt, { replayId: 'atreplay_demo0123456789ab', createdAt: '2026-07-13T03:01:00.000Z' });
assert.equal(replay.status, 'REPLAY_VERIFIED');
assert.equal(replay.reconstruction_reexecuted, false);
assert.equal(replay.raw_source_restored, false);
assert.equal(await verifyTomographyReplay(replay), true);
const tampered = structuredClone(receipt); tampered.status = 'TOMOGRAPHY_READY_WITH_WARNINGS';
assert.equal((await replayTomographyReceipt(tampered)).status, 'REPLAY_HELD');

const noReplication = await compileSnapshotLattice({ source, ensemble, declaredVariableCount: 2, designRank: 1, snapshots: snapshots.slice(0, 2).map((value, index) => ({ ...value, snapshotId: `single-${index}`, instrumentId: index ? 'b' : 'a', replicate: 1, condition: `single-${index}`, heldOut: false })) });
const held = await compileTomographyReceipt({ experimentId: 'atx_held0123456789abcdef', source, ensemble, lattice: noReplication, ...parts, temporalRouteObject: estimateTemporalRoute(noReplication), heldoutValidation: { status: 'NOT_RUN' } });
assert.equal(held.status, 'ABSTAIN');
assert.equal(held.holds.includes('ABSTAIN_NO_REPLICATION'), true);
assert.equal(held.holds.includes('HOLD_INSUFFICIENT_COVERAGE'), true);
console.log('aperture-v31-reconstruction.test.mjs passed');
