import assert from 'node:assert/strict';
import {
  ATLAS_SCHUBERT_CLOSURE_POSET_CERTIFICATE as cert,
  ATLAS_SCHUBERT_CLOSURE_POSET_PARENT_RECEIPT,
  atlasSchubertClosureContains,
  atlasSchubertComparable,
  atlasSchubertCoverContains,
  atlasSchubertPivotClosureContains,
  atlasSchubertPivotPositions,
  atlasSchubertPivotWord,
} from '../app/dome-world/previews/a15-r0/atlas-schubert-closure-poset.js';

assert.equal(ATLAS_SCHUBERT_CLOSURE_POSET_PARENT_RECEIPT,'d19d4f8d48c10df624f9c0574aeee9c687cfb4af');
assert.equal(cert.parent_exact,true);
assert.equal(cert.formal_cells,42);
assert.equal(cert.ordered_composition_pair_controls,376467);
assert.equal(cert.ordered_closure_incidences,113828);
assert.equal(cert.upward_cover_incidences,3829);
assert.equal(cert.pivot_order_failures,0);
assert.equal(cert.cover_failures,0);
assert.equal(cert.exhaustive_cells,28);
assert.equal(cert.independent_reverse_rref_points,3210);
assert.equal(cert.independent_rank_incidence_checks,44517);
assert.equal(cert.independent_rank_incidence_failures,0);
assert.equal(cert.independent_count_failures,0);

assert.deepEqual(atlasSchubertPivotWord([2,0,1]),[1,1,0,0,1]);
assert.deepEqual(atlasSchubertPivotPositions([2,0,1]),[0,1,4]);
assert.equal(atlasSchubertClosureContains([0,1],[1,0]),true);
assert.equal(atlasSchubertClosureContains([1,0],[0,1]),false);
assert.equal(atlasSchubertPivotClosureContains([0,1],[1,0]),true);
assert.equal(atlasSchubertComparable([0,2,0],[1,0,1]),false);
assert.equal(atlasSchubertCoverContains([0,1,1],[1,0,1]),true);
assert.equal(atlasSchubertCoverContains([0,0,2],[2,0,0]),false);

assert.equal(cert.anchor.d,7);
assert.equal(cert.anchor.k,3);
assert.equal(cert.anchor.labels,84);
assert.equal(cert.anchor.rank,18);
assert.equal(cert.anchor.relations,2520);
assert.equal(cert.anchor.covers,168);
assert.equal(cert.anchor.passed,true);

assert.equal(cert.hostile_controls.orientation_reversal_rejected,true);
assert.equal(cert.hostile_controls.equal_dimension_incomparable,true);
assert.equal(cert.hostile_controls.unequal_dimension_incomparable,true);
assert.equal(cert.hostile_controls.comparable_noncover,true);

for(const membrane of [
  'CELL_DECOMPOSITION != BRUHAT_CLOSURE_ORDER',
  'CELL_DIMENSION_EQUALITY != BRUHAT_COMPARABILITY',
  'CELL_DIMENSION_INEQUALITY != BRUHAT_COMPARABILITY',
  'BRUHAT_COMPARABILITY != COVER_RELATION',
  'FIXED_FLAG_CLOSURE_POSET != BASIS_FREE_CANONICAL_GEOMETRY',
  'ORDER_ISOMORPHISM != FUNCTORIAL_EQUIVALENCE',
])assert.equal(cert.membranes.includes(membrane),true);

assert.equal(cert.laws.fixed_flag_closure_poset_correspondence,true);
assert.equal(cert.laws.basis_free_canonical_geometry_claimed,false);
assert.equal(cert.laws.functorial_equivalence_claimed,false);
assert.equal(cert.laws.physical_causal_order_claimed,false);
assert.equal(cert.passed,true);
console.log('Ash A15-R0 Atlas Schubert closure-poset correspondence canonical tests passed.');
