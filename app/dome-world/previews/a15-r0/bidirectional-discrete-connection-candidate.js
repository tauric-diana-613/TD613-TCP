import {
  P_FULL,
  P_HOLD,
  POSITIVE_EDGES,
  GAUGE_FRAMES,
  determinant2,
  inverse2,
  matrixMultiply,
  observeOperator
} from './discrete-transport-tomography-closed-loop.js';

export const BIDIRECTIONAL_CONNECTION_SCHEMA = 'td613.ash.bidirectional-discrete-connection-candidate/v0.1';
export const CONNECTION_SPEC_HEAD = '390aca23fb58da1a239676b80907e59ce3c5b423';

export const REVERSE_EDGES = Object.freeze({
  BA:Object.freeze([[1,30],[0,1]].map(row => Object.freeze(row))),
  CB:Object.freeze([[1,0],[30,1]].map(row => Object.freeze(row))),
  AC:Object.freeze([[1,29],[0,1]].map(row => Object.freeze(row)))
});
export const BAD_BA = Object.freeze([[1,29],[0,1]].map(row => Object.freeze(row)));

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}
const mod = value => ((value % 31) + 31) % 31;
const equal = (left,right) => JSON.stringify(left) === JSON.stringify(right);
const I = Object.freeze([[1,0],[0,1]].map(row => Object.freeze(row)));

function reconstructFromFullSchedule(edgeId, source, target, oracle) {
  const observations = P_FULL.map(probe => observeOperator(oracle,probe));
  const [t11,t12,t21,sum] = observations;
  const t22 = mod(sum - t11 - t12 - t21);
  const reconstructed = freeze([[t11,t12],[t21,t22]]);
  const heldoutObserved = observeOperator(oracle,P_HOLD);
  const heldoutPredicted = observeOperator(reconstructed,P_HOLD);
  return freeze({
    edge_id:edgeId,
    source_fiber:`V_${source}`,
    target_fiber:`V_${target}`,
    projection_schedule_id:'P_FULL',
    scalar_observations:freeze(observations),
    reconstructed_operator:reconstructed,
    determinant:determinant2(reconstructed),
    invertible:determinant2(reconstructed)!==0,
    heldout_observed:heldoutObserved,
    heldout_predicted:heldoutPredicted,
    heldout_residual:mod(heldoutPredicted-heldoutObserved),
    oracle_match:equal(reconstructed,oracle),
    oracle_consulted_by_inverse_solver:false
  });
}

function orientationPair(pairId, forwardReceipt, reverseReceipt) {
  const forwardInverse = inverse2(forwardReceipt.reconstructed_operator);
  const reverseMatches = equal(reverseReceipt.reconstructed_operator,forwardInverse);
  const leftRoundTrip = matrixMultiply(reverseReceipt.reconstructed_operator,forwardReceipt.reconstructed_operator);
  const rightRoundTrip = matrixMultiply(forwardReceipt.reconstructed_operator,reverseReceipt.reconstructed_operator);
  return freeze({
    pair_id:pairId,
    forward_edge:forwardReceipt.edge_id,
    reverse_edge:reverseReceipt.edge_id,
    forward_operator:forwardReceipt.reconstructed_operator,
    reverse_operator:reverseReceipt.reconstructed_operator,
    forward_inverse:forwardInverse,
    reverse_matches_forward_inverse:reverseMatches,
    forward_times_reverse:rightRoundTrip,
    reverse_times_forward:leftRoundTrip,
    left_round_trip_identity:equal(leftRoundTrip,I),
    right_round_trip_identity:equal(rightRoundTrip,I),
    both_heldout_validated:forwardReceipt.heldout_residual===0 && reverseReceipt.heldout_residual===0,
    orientation_consistent:reverseMatches && equal(leftRoundTrip,I) && equal(rightRoundTrip,I)
  });
}

function reconstructPositiveSix() {
  return freeze({
    AB:reconstructFromFullSchedule('AB','A','B',POSITIVE_EDGES.AB),
    BA:reconstructFromFullSchedule('BA','B','A',REVERSE_EDGES.BA),
    BC:reconstructFromFullSchedule('BC','B','C',POSITIVE_EDGES.BC),
    CB:reconstructFromFullSchedule('CB','C','B',REVERSE_EDGES.CB),
    CA:reconstructFromFullSchedule('CA','C','A',POSITIVE_EDGES.CA),
    AC:reconstructFromFullSchedule('AC','A','C',REVERSE_EDGES.AC)
  });
}

function gaugeTransform(matrix, sourceFrame, targetFrame) {
  return matrixMultiply(targetFrame,matrixMultiply(matrix,inverse2(sourceFrame)));
}

function reconstructGaugeSix() {
  const {A,B,C} = GAUGE_FRAMES;
  const oracle = freeze({
    AB:gaugeTransform(POSITIVE_EDGES.AB,A,B),
    BA:gaugeTransform(REVERSE_EDGES.BA,B,A),
    BC:gaugeTransform(POSITIVE_EDGES.BC,B,C),
    CB:gaugeTransform(REVERSE_EDGES.CB,C,B),
    CA:gaugeTransform(POSITIVE_EDGES.CA,C,A),
    AC:gaugeTransform(REVERSE_EDGES.AC,A,C)
  });
  return freeze({
    oracle,
    receipts:freeze({
      AB:reconstructFromFullSchedule('AB','A','B',oracle.AB),
      BA:reconstructFromFullSchedule('BA','B','A',oracle.BA),
      BC:reconstructFromFullSchedule('BC','B','C',oracle.BC),
      CB:reconstructFromFullSchedule('CB','C','B',oracle.CB),
      CA:reconstructFromFullSchedule('CA','C','A',oracle.CA),
      AC:reconstructFromFullSchedule('AC','A','C',oracle.AC)
    })
  });
}

function pairSet(receipts) {
  return freeze({
    AB_BA:orientationPair('AB/BA',receipts.AB,receipts.BA),
    BC_CB:orientationPair('BC/CB',receipts.BC,receipts.CB),
    CA_AC:orientationPair('CA/AC',receipts.CA,receipts.AC)
  });
}

function triangleLoops(receipts) {
  const forward = matrixMultiply(receipts.CA.reconstructed_operator,matrixMultiply(receipts.BC.reconstructed_operator,receipts.AB.reconstructed_operator));
  const reverse = matrixMultiply(receipts.BA.reconstructed_operator,matrixMultiply(receipts.CB.reconstructed_operator,receipts.AC.reconstructed_operator));
  const forwardInverse = inverse2(forward);
  return freeze({
    forward_loop_ABC:forward,
    reverse_loop_ACB:reverse,
    forward_loop_inverse:forwardInverse,
    reverse_equals_forward_inverse:equal(reverse,forwardInverse),
    forward_loop_identity:equal(forward,I),
    reverse_loop_identity:equal(reverse,I)
  });
}

export function runBidirectionalDiscreteConnectionCandidateAssay() {
  const positive = reconstructPositiveSix();
  const positivePairs = pairSet(positive);
  const positivePairArray = Object.values(positivePairs);
  const allSixReconstructed = Object.values(positive).every(receipt => receipt.oracle_match && receipt.invertible && receipt.heldout_residual===0);
  const positiveOrientationPass = positivePairArray.every(pair => pair.orientation_consistent && pair.both_heldout_validated);
  const loops = triangleLoops(positive);

  const badReceipts = freeze({ ...positive, BA:reconstructFromFullSchedule('BA','B','A',BAD_BA) });
  const badPair = orientationPair('AB/BA_BAD',badReceipts.AB,badReceipts.BA);
  const hostilePass = badReceipts.BA.oracle_match && badReceipts.BA.invertible && badReceipts.BA.heldout_residual===0 && badPair.orientation_consistent===false;

  const gauge = reconstructGaugeSix();
  const gaugePairs = pairSet(gauge.receipts);
  const gaugePairArray = Object.values(gaugePairs);
  const gaugeOrientationPass = gaugePairArray.every(pair => pair.orientation_consistent && pair.both_heldout_validated);
  const gaugeLoops = triangleLoops(gauge.receipts);
  const expectedGaugeForward = gaugeTransform(loops.forward_loop_ABC,GAUGE_FRAMES.A,GAUGE_FRAMES.A);
  const gaugeLoopPass = equal(gaugeLoops.forward_loop_ABC,expectedGaugeForward) && gaugeLoops.reverse_equals_forward_inverse;

  const localRoundTripsTrivial = positivePairArray.every(pair => pair.left_round_trip_identity && pair.right_round_trip_identity);
  const globalTriangleNontrivial = !loops.forward_loop_identity;
  const pass = allSixReconstructed && positiveOrientationPass && hostilePass && loops.reverse_equals_forward_inverse && gaugeOrientationPass && gaugeLoopPass && localRoundTripsTrivial && globalTriangleNontrivial;

  return freeze({
    schema:BIDIRECTIONAL_CONNECTION_SCHEMA,
    spec_head:CONNECTION_SPEC_HEAD,
    source_status:'SIMULATED',
    arithmetic_domain:'F_31',
    graph:freeze({ vertices:freeze(['A','B','C']), oriented_edges:freeze(['AB','BA','BC','CB','CA','AC']) }),
    positive:freeze({
      directed_edge_receipts:positive,
      orientation_pairs:positivePairs,
      triangle_loops:loops
    }),
    hostile_orientation_control:freeze({
      bad_edge_receipt:badReceipts.BA,
      pair_receipt:badPair,
      classification:hostilePass
        ? 'ORIENTATION_INCONSISTENT_EDGE_ASSIGNMENT_REJECTS_CONNECTION_CANDIDATE'
        : 'HOSTILE_ORIENTATION_CONTROL_FAILED'
    }),
    gauge_clone:freeze({
      directed_edge_receipts:gauge.receipts,
      orientation_pairs:gaugePairs,
      triangle_loops:gaugeLoops,
      expected_forward_loop_conjugate:expectedGaugeForward,
      orientation_consistency_preserved:gaugeOrientationPass,
      loop_conjugacy_preserved:gaugeLoopPass
    }),
    findings:freeze({
      all_six_orientations_independently_reconstructed:allSixReconstructed,
      all_positive_reverse_edges_match_independently_reconstructed_forward_inverses:positiveOrientationPass,
      hostile_reconstructible_reverse_edge_rejects_orientation_consistency:hostilePass,
      independently_reconstructed_reverse_triangle_equals_forward_inverse:loops.reverse_equals_forward_inverse,
      gauge_covariance_preserves_orientation_consistency:gaugeOrientationPass && gaugeLoopPass,
      local_edge_round_trip_triviality_coexists_with_nontrivial_triangle_loop:localRoundTripsTrivial && globalTriangleNontrivial,
      assay_mechanism_validated:pass
    }),
    bounded_answer:pass
      ? 'BIDIRECTIONAL_GL2_F31_GRAPH_CONNECTION_CANDIDATE_SURVIVES_IN_AUTHORED_SYNTHETIC_FIXTURE'
      : 'BIDIRECTIONAL_GRAPH_CONNECTION_CANDIDATE_FAILED',
    anti_equivalence:'EDGEWISE_RECONSTRUCTIBLE_AND_INVERTIBLE_NE_ORIENTATION_CONSISTENT_CONNECTION',
    claims:freeze({
      graph_connection_candidate:pass,
      physical_connection:false,
      differential_connection:false,
      physical_curvature:false,
      physical_holonomy:false,
      td613_general_connection:false,
      proto_loom:false,
      production_authority:false,
      vercel_authority:false
    }),
    promotion_authority:false,
    production_mutated:false,
    human_closure_required:true
  });
}
