import assert from 'node:assert/strict';
import { compileControlledSource, auditSourceInvariance, verifyControlledSource } from '../app/engine/aperture-v31-controlled-source.js';
import { compileInstrumentEnsemble, verifyInstrumentEnsemble } from '../app/engine/aperture-v31-instrument-ensemble.js';
import { compileSnapshotLattice, verifySnapshotLattice } from '../app/engine/aperture-v31-snapshot-lattice.js';

const SOURCE = `sha256:${'1'.repeat(64)}`;
const source = await compileControlledSource({ sourceId: 'atsrc_0123456789abcdef0123', sourceReceiptReference: 'ashc_0123456789abcdef0123', sourceCommitment: SOURCE });
assert.equal(source.raw_source_present, false);
assert.equal(source.claim_ceiling, undefined);
assert.equal(await verifyControlledSource(source), true);
assert.equal(auditSourceInvariance(source, [SOURCE, SOURCE]).status, 'SOURCE_HELD');
assert.equal(auditSourceInvariance(source, [SOURCE, null]).status, 'SOURCE_UNVERIFIABLE');
assert.equal(auditSourceInvariance(source, [SOURCE, `sha256:${'2'.repeat(64)}`]).status, 'SOURCE_DRIFT_DETECTED');

const ensemble = await compileInstrumentEnsemble({
  ensembleId: 'atens_0123456789abcdef0123',
  instruments: [
    { instrumentId: 'route-a', version: '1', interventionDimensions: ['route', 'time'], projection: 'observable surface', controlledVariables: ['source'], uncontrolledVariables: ['latency'], environment: 'lab-a', operatorAuthorized: true },
    { instrumentId: 'route-b', version: '1', interventionDimensions: ['route', 'time'], projection: 'registered event', controlledVariables: ['source'], uncontrolledVariables: ['retrieval'], environment: 'lab-a', operatorAuthorized: true }
  ]
});
assert.equal(ensemble.instrument_count, 2);
assert.equal(ensemble.fixed_for_run, true);
assert.equal(await verifyInstrumentEnsemble(ensemble), true);
await assert.rejects(compileInstrumentEnsemble({ instruments: [{ instrumentId: 'only', version: '1', projection: 'x', environment: 'e' }] }), /at least two/);

const snapshots = [];
for (const instrumentId of ['route-a', 'route-b']) {
  for (const timeIndex of [0, 1]) {
    for (const replicate of [1, 2]) {
      snapshots.push({
        snapshotId: `atsnap_${instrumentId}_${timeIndex}_${replicate}`,
        sourceCommitment: SOURCE,
        instrumentId,
        instrumentVersion: '1',
        timeIndex,
        replicate,
        condition: timeIndex ? 'varied' : 'baseline',
        environment: 'lab-a',
        interventionValues: { route: instrumentId === 'route-a' ? 0 : 1, time: timeIndex },
        observedValue: (instrumentId === 'route-a' ? 100 : 140) + timeIndex * 20 + replicate,
        heldOut: instrumentId === 'route-b' && timeIndex === 1 && replicate === 2,
        benignControl: instrumentId === 'route-a' && timeIndex === 0
      });
    }
  }
}
snapshots.push({ snapshotId: 'atsnap_missing_declared', sourceCommitment: SOURCE, instrumentId: 'route-a', instrumentVersion: '1', timeIndex: 2, replicate: 1, condition: 'missing', environment: 'lab-a', state: 'MISSING_OUTPUT', missingness: ['retrieval absent'] });
snapshots.push({ snapshotId: 'atsnap_null_declared', sourceCommitment: SOURCE, instrumentId: 'route-b', instrumentVersion: '1', timeIndex: 2, replicate: 1, condition: 'null', environment: 'lab-a', state: 'NULL_RESULT', registeredEvent: 'tested effect absent' });
const lattice = await compileSnapshotLattice({ source, ensemble, snapshots, declaredVariableCount: 2, designRank: 2, latticeId: 'atlattice_0123456789abcdef0123' });
assert.equal(lattice.coverage.state, 'COVERAGE_BOUNDED_COMPLETE');
assert.deepEqual(lattice.coverage.gamma, { numerator: 2, denominator: 2, decimal_display: '1.000000' });
assert.equal(lattice.replication_present, true);
assert.equal(lattice.missing_count, 1);
assert.equal(lattice.null_result_count, 1);
assert.equal(lattice.interpolation_performed, false);
assert.equal(await verifySnapshotLattice(lattice), true);
const tampered = structuredClone(lattice); tampered.entries[0].observed_value += 1;
assert.equal(await verifySnapshotLattice(tampered), false);
await assert.rejects(compileSnapshotLattice({ source, ensemble, declaredVariableCount: 1, designRank: 1, snapshots: [{ snapshotId: 'bad', sourceCommitment: SOURCE, instrumentId: 'unknown', instrumentVersion: '1', timeIndex: 0, replicate: 1, condition: 'x', environment: 'e', observedValue: 1 }] }), /unknown instrument/);

globalThis.__V31_FIXTURE__ = { source, ensemble, lattice };
console.log('aperture-v31-source-lattice.test.mjs passed');
