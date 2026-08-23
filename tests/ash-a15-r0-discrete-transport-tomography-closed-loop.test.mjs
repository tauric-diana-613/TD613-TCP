import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DISCRETE_TRANSPORT_TOMOGRAPHY_SCHEMA,
  P_FULL,
  P_BLIND,
  POSITIVE_EDGES,
  FLAT_EDGES,
  probeRow,
  rankMod,
  determinant2,
  inverse2,
  matrixMultiply,
  reconstructEdge,
  runDiscreteTransportTomographyAssay
} from '../app/dome-world/previews/a15-r0/discrete-transport-tomography-closed-loop.js';

test('projection schedules preserve preregistered rank boundary', () => {
  assert.equal(rankMod(P_FULL.map(probeRow)), 4);
  assert.equal(rankMod(P_BLIND.map(probeRow)), 3);
});

test('positive and flat authored edge matrices remain invertible', () => {
  for (const family of [POSITIVE_EDGES, FLAT_EDGES]) {
    for (const matrix of Object.values(family)) assert.notEqual(determinant2(matrix), 0);
  }
});

test('full-rank scalar projections reconstruct a declared edge without oracle solving', () => {
  const receipt = reconstructEdge('AB', POSITIVE_EDGES.AB, P_FULL);
  assert.equal(receipt.unique_reconstruction, true);
  assert.deepEqual(receipt.reconstructed_operator, [[1,1],[0,1]]);
  assert.equal(receipt.oracle_match, true);
  assert.equal(receipt.oracle_consulted_by_inverse_solver, false);
  assert.equal(receipt.heldout_residual, 0);
  assert.equal(receipt.deterministic_replay_match, true);
});

test('blind schedule refuses a unique edge reconstruction', () => {
  const receipt = reconstructEdge('AB', POSITIVE_EDGES.AB, P_BLIND);
  assert.equal(receipt.projection_rank, 3);
  assert.equal(receipt.projection_nullity, 1);
  assert.equal(receipt.unique_reconstruction, false);
  assert.equal(receipt.reconstructed_operator, null);
  assert.equal(receipt.heldout_predicted, null);
});

test('closed-loop assay passes flat, positive, gauge, reversal, blind, and history controls', () => {
  const result = runDiscreteTransportTomographyAssay();
  assert.equal(result.schema, DISCRETE_TRANSPORT_TOMOGRAPHY_SCHEMA);
  assert.equal(result.projection_geometry.full_rank_schedule.rank, 4);
  assert.equal(result.projection_geometry.blind_schedule.rank, 3);

  assert.deepEqual(result.positive.loop.loop_operator, [[3,5],[1,2]]);
  assert.equal(result.positive.loop.loop_is_identity, false);
  assert.equal(result.positive.loop.rank_loop_minus_identity, 2);
  assert.equal(result.positive.loop.determinant_mod_31, 1);

  assert.deepEqual(result.flat_null.loop.loop_operator, [[1,0],[0,1]]);
  assert.equal(result.flat_null.loop.loop_is_identity, true);
  assert.equal(result.flat_null.loop.rank_loop_minus_identity, 0);

  assert.equal(result.gauge_clone.conjugacy_consistent, true);
  assert.notDeepEqual(result.gauge_clone.loop.loop_operator, result.positive.loop.loop_operator);
  assert.deepEqual(result.gauge_clone.loop.loop_operator, [[1,3],[1,4]]);

  assert.equal(result.reversal.consistent, true);
  assert.deepEqual(result.reversal.reverse_loop, inverse2(result.positive.loop.loop_operator));

  assert.equal(result.blind_projection_control.blind_edge_receipt.unique_reconstruction, false);
  assert.equal(result.blind_projection_control.compatible_loop_operators_distinct, true);
  assert.equal(result.blind_projection_control.loop_identifiability, 'UNIDENTIFIED');
  assert.equal(result.blind_projection_control.classification, 'CLOSED_LOOP_TRANSPORT_UNIDENTIFIED_UNDER_PROJECTION_NULLSPACE');

  assert.equal(result.history_dependent_impostor.context_reconstructions_differ, true);
  assert.equal(result.history_dependent_impostor.reusable_transport_under_declared_context_free_edge_model, false);
  assert.equal(result.history_dependent_impostor.classification, 'HISTORY_DEPENDENT_EDGE_REJECTS_REUSABLE_TRANSPORT_MODEL');

  assert.equal(result.findings.assay_mechanism_validated, true);
  assert.equal(result.bounded_answer, 'DISCRETE_HOLONOMY_TOMOGRAPHY_IS_IMPLEMENTABLE_AND_FALSIFIABLE_IN_AUTHORED_FINITE_RESEARCH_FIXTURE');
});

test('claim ceiling keeps geometry, physics, runtime, and release authority closed', () => {
  const result = runDiscreteTransportTomographyAssay();
  assert.equal(result.claim_ceiling.td613_general_holonomy_observed, false);
  assert.equal(result.claim_ceiling.physical_tomography, false);
  assert.equal(result.claim_ceiling.physical_connection, false);
  assert.equal(result.claim_ceiling.physical_curvature, false);
  assert.equal(result.claim_ceiling.physical_holonomy, false);
  assert.equal(result.claim_ceiling.berry_phase, false);
  assert.equal(result.claim_ceiling.quantum_behavior, false);
  assert.equal(result.claim_ceiling.proto_loom_authority, false);
  assert.equal(result.claim_ceiling.holonomy_loom_runtime_authority, false);
  assert.equal(result.claim_ceiling.production_authority, false);
  assert.equal(result.claim_ceiling.vercel_authority, false);
  assert.equal(result.promotion_authority, false);
  assert.equal(result.production_mutated, false);
  assert.equal(result.live_ash_binding, false);
});

test('matrix composition convention remains left-acting along AB then BC then CA', () => {
  const composed = matrixMultiply(POSITIVE_EDGES.CA, matrixMultiply(POSITIVE_EDGES.BC, POSITIVE_EDGES.AB));
  assert.deepEqual(composed, [[3,5],[1,2]]);
});
