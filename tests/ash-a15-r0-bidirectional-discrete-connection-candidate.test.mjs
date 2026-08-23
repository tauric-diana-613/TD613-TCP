import test from 'node:test';
import assert from 'node:assert/strict';
import {
  REVERSE_EDGES,
  BAD_BA,
  runBidirectionalDiscreteConnectionCandidateAssay
} from '../app/dome-world/previews/a15-r0/bidirectional-discrete-connection-candidate.js';
import {
  POSITIVE_EDGES,
  inverse2
} from '../app/dome-world/previews/a15-r0/discrete-transport-tomography-closed-loop.js';

test('reverse-edge oracles are independently authored exact inverses in the positive fixture', () => {
  assert.deepEqual(REVERSE_EDGES.BA, inverse2(POSITIVE_EDGES.AB));
  assert.deepEqual(REVERSE_EDGES.CB, inverse2(POSITIVE_EDGES.BC));
  assert.deepEqual(REVERSE_EDGES.AC, inverse2(POSITIVE_EDGES.CA));
});

test('hostile BA oracle remains invertible but differs from AB inverse', () => {
  assert.notDeepEqual(BAD_BA, inverse2(POSITIVE_EDGES.AB));
});

test('all six positive orientations reconstruct independently and satisfy edge round trips', () => {
  const result = runBidirectionalDiscreteConnectionCandidateAssay();
  assert.equal(result.findings.all_six_orientations_independently_reconstructed,true);
  assert.equal(result.findings.all_positive_reverse_edges_match_independently_reconstructed_forward_inverses,true);
  for (const pair of Object.values(result.positive.orientation_pairs)) {
    assert.equal(pair.reverse_matches_forward_inverse,true);
    assert.equal(pair.left_round_trip_identity,true);
    assert.equal(pair.right_round_trip_identity,true);
    assert.equal(pair.both_heldout_validated,true);
  }
});

test('local round-trip identity coexists with nonidentity triangle loop', () => {
  const result = runBidirectionalDiscreteConnectionCandidateAssay();
  assert.deepEqual(result.positive.triangle_loops.forward_loop_ABC,[[3,5],[1,2]]);
  assert.equal(result.positive.triangle_loops.forward_loop_identity,false);
  assert.deepEqual(result.positive.triangle_loops.reverse_loop_ACB,[[2,26],[30,3]]);
  assert.equal(result.positive.triangle_loops.reverse_equals_forward_inverse,true);
  assert.equal(result.findings.local_edge_round_trip_triviality_coexists_with_nontrivial_triangle_loop,true);
});

test('individually reconstructible hostile reverse edge rejects connection consistency', () => {
  const result = runBidirectionalDiscreteConnectionCandidateAssay();
  assert.equal(result.hostile_orientation_control.bad_edge_receipt.oracle_match,true);
  assert.equal(result.hostile_orientation_control.bad_edge_receipt.invertible,true);
  assert.equal(result.hostile_orientation_control.bad_edge_receipt.heldout_residual,0);
  assert.equal(result.hostile_orientation_control.pair_receipt.orientation_consistent,false);
  assert.equal(result.hostile_orientation_control.classification,'ORIENTATION_INCONSISTENT_EDGE_ASSIGNMENT_REJECTS_CONNECTION_CANDIDATE');
});

test('gauge clone preserves orientation consistency and loop conjugacy', () => {
  const result = runBidirectionalDiscreteConnectionCandidateAssay();
  assert.equal(result.gauge_clone.orientation_consistency_preserved,true);
  assert.equal(result.gauge_clone.loop_conjugacy_preserved,true);
  assert.equal(result.gauge_clone.triangle_loops.reverse_equals_forward_inverse,true);
});

test('bounded verdict earns only finite graph-connection candidate', () => {
  const result = runBidirectionalDiscreteConnectionCandidateAssay();
  assert.equal(result.findings.assay_mechanism_validated,true);
  assert.equal(result.bounded_answer,'BIDIRECTIONAL_GL2_F31_GRAPH_CONNECTION_CANDIDATE_SURVIVES_IN_AUTHORED_SYNTHETIC_FIXTURE');
  assert.equal(result.claims.graph_connection_candidate,true);
  assert.equal(result.claims.physical_connection,false);
  assert.equal(result.claims.differential_connection,false);
  assert.equal(result.claims.physical_curvature,false);
  assert.equal(result.claims.physical_holonomy,false);
  assert.equal(result.claims.td613_general_connection,false);
  assert.equal(result.claims.proto_loom,false);
  assert.equal(result.claims.production_authority,false);
  assert.equal(result.claims.vercel_authority,false);
});
