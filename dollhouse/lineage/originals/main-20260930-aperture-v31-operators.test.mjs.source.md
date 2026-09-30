import assert from 'node:assert/strict';
import { estimateReferenceLayers } from '../app/engine/aperture-v31-reference-layer.js';
import { estimateRegistryDynamics } from '../app/engine/aperture-v31-registry-dynamics.js';
import { estimateSharedLayerBurden } from '../app/engine/aperture-v31-shared-layer.js';
import { estimatePhasonSusceptibility } from '../app/engine/aperture-v31-phason-susceptibility.js';
import { compileSignedResidualLedger } from '../app/engine/aperture-v31-residual-ledger.js';

const reference = estimateReferenceLayers({ pairs: [
  { referenceStratum: 'top', variedStratum: 'bottom', deltaInput: 100, deltaOutput: 25 },
  { referenceStratum: 'bottom', variedStratum: 'top', deltaInput: 100, deltaOutput: 0 }
] });
assert.equal(reference.strata_merged, false);
assert.equal(reference.estimates[0].cross_response.numerator, 25);
assert.equal(reference.estimates[1].state, 'RESPONSE_PLATEAU');

const helical = estimateRegistryDynamics({ globalConfiguration: 'helical-demo', orientations: [10, 20, 30], localRegistries: [100, 120, 260], jumpThreshold: 100, commensurationMismatch: 50, commensurationThreshold: 100 });
assert.equal(helical.sequence_class, 'HELICAL');
assert.equal(helical.jump_count, 1);
assert.equal(helical.commensuration_state, 'NEAR_COMMENSURATE');
assert.equal(helical.symmetry_registry_equated, false);
const alternate = estimateRegistryDynamics({ globalConfiguration: 'alternate-demo', orientations: [10, -20, 30], localRegistries: [1, 2, 3] });
assert.equal(alternate.sequence_class, 'ALTERNATE');

const burden = estimateSharedLayerBurden({ sharedLayer: 'declared adapter', adjustments: [{ stratumId: 'a', adjustment: -100 }, { stratumId: 'b', adjustment: 100 }], normalizer: 100 });
assert.equal(burden.state, 'HIGH_COMPETING_DEMANDS');
assert.ok(burden.evidence_basis.includes('exact pairwise differences'));
assert.equal(burden.closure.status, 'OPEN');
assert.throws(() => estimateSharedLayerBurden({ sharedLayer: 'human', adjustments: [{ stratumId: 'a', adjustment: 0 }, { stratumId: 'b', adjustment: 1 }], normalizer: 1, humanAnalogyDeclared: true }), /explicit limits/);

const phason = estimatePhasonSusceptibility({ trials: [{ deltaCoordinate: 10, deltaObservation: 30 }, { deltaCoordinate: 10, deltaObservation: 40 }], shamResponse: 2, reversalDifference: 0, hysteresisThreshold: 1 });
assert.equal(phason.state, 'PHASON_DOMINANT_CANDIDATE');
assert.ok(phason.evidence_basis.includes('sham and reversal observations'));
assert.equal(phason.closure.status, 'OPEN');

const residual = compileSignedResidualLedger([
  { snapshotId: 'a', instrumentId: 'i', timeIndex: 0, replicate: 1, observed: 12, predicted: 10 },
  { snapshotId: 'b', instrumentId: 'i', timeIndex: 0, replicate: 2, observed: 8, predicted: 10 },
  { snapshotId: 'c', instrumentId: 'j', timeIndex: 1, replicate: 1, observed: 14, predicted: 10 },
  { snapshotId: 'd', instrumentId: 'j', timeIndex: 1, replicate: 2, observed: 6, predicted: 10 }
]);
assert.equal(residual.state, 'STRUCTURED_UNEXPLAINED');
assert.deepEqual(residual.entries.map(value => value.sign), ['POSITIVE', 'NEGATIVE', 'POSITIVE', 'NEGATIVE']);
assert.equal(residual.mean_residual.numerator, 0);
assert.equal(residual.opposed_residuals_cancelled, false);
console.log('aperture-v31-operators.test.mjs passed');
