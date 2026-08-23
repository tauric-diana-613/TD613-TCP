import test from 'node:test';
import assert from 'node:assert/strict';
import { runPathGroupoidDiscreteHolonomyAssay } from '../app/dome-world/previews/a15-r0/path-groupoid-discrete-holonomy-representation.js';

test('two based loops and their independently composed inverses obey path inversion', () => {
  const result=runPathGroupoidDiscreteHolonomyAssay();
  assert.deepEqual(result.loops.gamma1.operator,[[3,5],[1,2]]);
  assert.deepEqual(result.loops.gamma1.direct_inverse_operator,[[2,26],[30,3]]);
  assert.equal(result.loops.gamma1.inverse_law,true);
  assert.deepEqual(result.loops.gamma2.operator,[[3,26],[2,28]]);
  assert.deepEqual(result.loops.gamma2.direct_inverse_operator,[[28,5],[29,3]]);
  assert.equal(result.loops.gamma2.inverse_law,true);
});

test('literal path concatenation matches ordered loop-operator composition', () => {
  const result=runPathGroupoidDiscreteHolonomyAssay();
  assert.deepEqual(result.concatenation.direct_gamma1_then_gamma2,[[4,5],[3,4]]);
  assert.deepEqual(result.concatenation.expected_H2_H1,[[4,5],[3,4]]);
  assert.deepEqual(result.concatenation.direct_gamma2_then_gamma1,[[19,1],[7,20]]);
  assert.deepEqual(result.concatenation.expected_H1_H2,[[19,1],[7,20]]);
  assert.equal(result.concatenation.concatenation_law_pass,true);
  assert.equal(result.concatenation.ordered_products_distinct,true);
});

test('loop image contains an exact nonidentity commutator without quantum promotion', () => {
  const result=runPathGroupoidDiscreteHolonomyAssay();
  assert.deepEqual(result.commutator.operator,[[11,2],[30,14]]);
  assert.equal(result.commutator.identity,false);
  assert.equal(result.commutator.nonidentity,true);
  assert.equal(result.claims.noncommuting_discrete_loop_image_candidate,true);
  assert.equal(result.claims.quantum_noncommutativity,false);
  assert.equal(result.claims.quantum_behavior,false);
});

test('basepoint change is direct-path equal to conjugation', () => {
  const result=runPathGroupoidDiscreteHolonomyAssay();
  assert.deepEqual(result.basepoint_change.direct_operator,[[1,3],[1,4]]);
  assert.deepEqual(result.basepoint_change.conjugated_operator,[[1,3],[1,4]]);
  assert.equal(result.basepoint_change.conjugacy_pass,true);
});

test('gauge clone preserves loop and commutator conjugacy', () => {
  const result=runPathGroupoidDiscreteHolonomyAssay();
  assert.equal(result.gauge_clone.orientation_consistency_preserved,true);
  assert.equal(result.gauge_clone.loop_and_commutator_conjugacy_preserved,true);
});

test('order-blind control abstains because unordered loop multiset supports two products', () => {
  const result=runPathGroupoidDiscreteHolonomyAssay();
  assert.equal(result.hostile_order_blind_control.order_observed,false);
  assert.equal(result.hostile_order_blind_control.candidate_count,2);
  assert.equal(result.hostile_order_blind_control.unique_ordered_product_admitted,false);
  assert.notDeepEqual(result.hostile_order_blind_control.candidate_ordered_products[0],result.hostile_order_blind_control.candidate_ordered_products[1]);
  assert.equal(result.hostile_order_blind_control.classification,'ORDER_BLIND_LOOP_AGGREGATION_IS_INSUFFICIENT_FOR_PATH_REPRESENTATION');
});

test('bounded verdict earns discrete graph holonomy representation candidate while curvature stays undefined', () => {
  const result=runPathGroupoidDiscreteHolonomyAssay();
  assert.equal(result.findings.assay_mechanism_validated,true);
  assert.equal(result.bounded_answer,'DISCRETE_PATH_GROUPOID_HOLONOMY_REPRESENTATION_CANDIDATE_SURVIVES_IN_AUTHORED_F31_GRAPH_FIXTURE');
  assert.equal(result.claims.discrete_graph_holonomy_representation_candidate,true);
  assert.equal(result.curvature_firewall.curvature_defined,false);
  assert.equal(result.curvature_firewall.curvature_measured,false);
  assert.equal(result.claims.td613_general_holonomy,false);
  assert.equal(result.claims.physical_holonomy,false);
  assert.equal(result.claims.physical_connection,false);
  assert.equal(result.claims.physical_curvature,false);
  assert.equal(result.claims.berry_structure,false);
  assert.equal(result.claims.proto_loom,false);
  assert.equal(result.claims.production_authority,false);
  assert.equal(result.claims.vercel_authority,false);
});
