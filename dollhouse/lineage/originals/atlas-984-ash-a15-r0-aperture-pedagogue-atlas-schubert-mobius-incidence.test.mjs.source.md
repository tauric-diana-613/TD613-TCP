import assert from 'node:assert/strict';
import {
  ATLAS_SCHUBERT_MOBIUS_INCIDENCE_CERTIFICATE as cert,
  ATLAS_SCHUBERT_MOBIUS_INCIDENCE_PARENT_RECEIPT,
  atlasSchubertMobiusCandidate,
  atlasSchubertMobiusRecursive,
  atlasSchubertPartitionContains,
  atlasSchubertPivotDisplacements,
  atlasSchubertPrefixGaps,
  atlasSchubertRectanglePartition,
  atlasSchubertSkewIsRookStrip,
} from '../app/dome-world/previews/a15-r0/atlas-schubert-mobius-incidence.js';

assert.equal(ATLAS_SCHUBERT_MOBIUS_INCIDENCE_PARENT_RECEIPT,'f083e506f2a16f1d98b3af9a9b963d65694efc47');
assert.equal(cert.parent_exact,true);
assert.equal(cert.formal_cells,42);
assert.equal(cert.ordered_composition_pairs,376467);
assert.equal(cert.ordered_comparable_pairs,113828);
assert.equal(cert.mobius_nonzero,9912);
assert.equal(cert.mobius_positive,4977);
assert.equal(cert.mobius_negative,4935);
assert.equal(cert.mobius_zero_comparable,103916);
assert.equal(cert.recursive_formula_failures,0);
assert.equal(cert.rank_identity_failures,0);
assert.equal(cert.partition_order_failures,0);
assert.equal(cert.rook_support_failures,0);
assert.equal(cert.cover_coefficient_failures,0);

assert.deepEqual(atlasSchubertRectanglePartition([2,0,1]),[2,0,0]);
assert.deepEqual(atlasSchubertRectanglePartition([0,1,1]),[2,1]);
assert.equal(atlasSchubertPartitionContains([0,1,1],[1,1,0]),true);
assert.deepEqual(atlasSchubertPrefixGaps([0,1,1],[1,1,0]),[1,1]);
assert.deepEqual(atlasSchubertPivotDisplacements([0,1,1],[1,1,0]),[1,1]);
assert.equal(atlasSchubertSkewIsRookStrip([0,1,1],[1,1,0]),true);
assert.equal(atlasSchubertMobiusCandidate([0,1,1],[1,1,0]),1);
assert.equal(atlasSchubertMobiusRecursive([0,1,1],[1,1,0]),1);

assert.equal(cert.anchor.d,7);
assert.equal(cert.anchor.k,3);
assert.equal(cert.anchor.labels,84);
assert.equal(cert.anchor.relations,2520);
assert.equal(cert.anchor.mobius_nonzero,377);
assert.equal(cert.anchor.mobius_positive,189);
assert.equal(cert.anchor.mobius_negative,188);
assert.equal(cert.anchor.passed,true);

for(const name of [
  'rank_two_nonzero',
  'column_collision_zero',
  'row_collision_zero',
  'rank_three_negative',
  'noncover_nonzero',
  'comparable_rank_two_zero',
])assert.equal(cert.hostile_controls[name],true);

assert.deepEqual(cert.laws.coefficient_range,[-1,0,1]);
assert.equal(cert.laws.basis_free_canonical_geometry_claimed,false);
assert.equal(cert.laws.causal_reversal_claimed,false);
assert.equal(cert.laws.physical_claimed,false);

for(const membrane of [
  'CLOSURE_POSET != MOBIUS_INCIDENCE_ALGEBRA',
  'MOBIUS_NONZERO != COVER_RELATION',
  'COMPARABILITY != MOBIUS_NONZERO',
  'RANK_DIFFERENCE != MOBIUS_MAGNITUDE',
  'MOBIUS_ZERO != UNTESTED_INTERVAL',
  'INCIDENCE_INVERSION != CAUSAL_REVERSAL',
  'FINITE_DISTRIBUTIVE_LATTICE_MODEL != BASIS_FREE_CANONICAL_GEOMETRY',
  'ORDER_ISOMORPHISM != FUNCTORIAL_EQUIVALENCE',
  'SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY',
])assert.equal(cert.membranes.includes(membrane),true);

assert.equal(cert.passed,true);
console.log('Ash A15-R0 Atlas Schubert Möbius incidence inversion canonical tests passed.');
