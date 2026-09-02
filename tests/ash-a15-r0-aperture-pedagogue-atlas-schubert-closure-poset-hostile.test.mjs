import assert from 'node:assert/strict';
import {atlasSchubertCellDimension} from '../app/dome-world/previews/a15-r0/atlas-schubert-graded-cell-decomposition.js';
import {
  ATLAS_SCHUBERT_CLOSURE_POSET_CERTIFICATE as cert,
  atlasSchubertClosureContains,
  atlasSchubertComparable,
  atlasSchubertCoverContains,
  atlasSchubertPivotClosureContains,
  atlasSchubertPivotPositions,
  atlasSchubertPivotWord,
} from '../app/dome-world/previews/a15-r0/atlas-schubert-closure-poset.js';

assert.throws(()=>atlasSchubertPivotWord([]),/nonempty/);
assert.throws(()=>atlasSchubertPivotWord([1,-1]),/nonnegative integer/);
assert.throws(()=>atlasSchubertClosureContains([1,0],[1,0,0]),/shape\/sum mismatch/);
assert.throws(()=>atlasSchubertClosureContains([1,0],[0,0]),/shape\/sum mismatch/);
assert.throws(()=>atlasSchubertCoverContains([0,1],[0,0]),/shape\/sum mismatch/);

const closedPoint=[1,0];
const openPoint=[0,1];
assert.deepEqual(atlasSchubertPivotPositions(closedPoint),[0]);
assert.deepEqual(atlasSchubertPivotPositions(openPoint),[1]);
assert.equal(atlasSchubertClosureContains(openPoint,closedPoint),true);
assert.equal(atlasSchubertPivotClosureContains(openPoint,closedPoint),true);
assert.equal(atlasSchubertClosureContains(closedPoint,openPoint),false);
assert.equal(atlasSchubertPivotClosureContains(closedPoint,openPoint),false);

const sameDimA=[0,2,0];
const sameDimB=[1,0,1];
assert.equal(atlasSchubertCellDimension(sameDimA,2),2);
assert.equal(atlasSchubertCellDimension(sameDimB,2),2);
assert.equal(atlasSchubertComparable(sameDimA,sameDimB),false);

const higherDim=[0,3,0];
const lowerDim=[2,0,1];
assert.equal(atlasSchubertCellDimension(higherDim,3),3);
assert.equal(atlasSchubertCellDimension(lowerDim,3),2);
assert.equal(atlasSchubertComparable(higherDim,lowerDim),false);

const coverLower=[1,0,1];
const coverUpper=[0,1,1];
assert.equal(atlasSchubertClosureContains(coverUpper,coverLower),true);
assert.equal(atlasSchubertCellDimension(coverUpper,2)-atlasSchubertCellDimension(coverLower,2),1);
assert.equal(atlasSchubertCoverContains(coverUpper,coverLower),true);
assert.equal(atlasSchubertCoverContains(coverLower,coverUpper),false);

const farLower=[2,0,0];
const farUpper=[0,0,2];
assert.equal(atlasSchubertClosureContains(farUpper,farLower),true);
assert.equal(atlasSchubertCellDimension(farUpper,2)-atlasSchubertCellDimension(farLower,2),4);
assert.equal(atlasSchubertCoverContains(farUpper,farLower),false);

assert.equal(cert.formal_profiles.d3k2.labels,6);
assert.equal(cert.formal_profiles.d3k2.relations,20);
assert.equal(cert.formal_profiles.d3k2.covers,6);
assert.equal(cert.formal_profiles.d3k3.labels,10);
assert.equal(cert.formal_profiles.d3k3.relations,50);
assert.equal(cert.formal_profiles.d3k3.covers,12);
assert.equal(cert.exhaustive_profiles.p2d4k3.points,1395);
assert.equal(cert.exhaustive_profiles.p2d4k3.closure_checks,27900);

assert.equal(cert.hostile_controls.orientation_reversal_rejected,true);
assert.equal(cert.hostile_controls.equal_dimension_incomparable,true);
assert.equal(cert.hostile_controls.unequal_dimension_incomparable,true);
assert.equal(cert.hostile_controls.comparable_noncover,true);
assert.equal(cert.membranes.includes('WEAK_COMPOSITION_LABEL != ATLAS_SUPPORT_STRATUM'),true);
assert.equal(cert.membranes.includes('FINITE_SCHUBERT_POSET != PHYSICAL_CAUSAL_ORDER'),true);
assert.equal(cert.membranes.includes('FORMAL_POSET != RUNTIME_SCHEDULER'),true);
assert.equal(cert.membranes.includes('FINITE_CONTROLS != ASYMPTOTIC_GEOMETRY'),true);
assert.equal(cert.passed,true);
console.log('Ash A15-R0 Atlas Schubert closure-poset correspondence hostile tests passed.');
