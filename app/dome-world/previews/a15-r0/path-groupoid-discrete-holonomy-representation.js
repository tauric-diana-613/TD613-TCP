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
import { REVERSE_EDGES } from './bidirectional-discrete-connection-candidate.js';

export const PATH_GROUPOID_HOLONOMY_SCHEMA = 'td613.ash.path-groupoid-discrete-holonomy-representation/v0.1';
export const HOLONOMY_SPEC_HEAD = '559383ec511df1759f3257de2e2a0ddea8d8c86c';

const I = Object.freeze([[1,0],[0,1]].map(row => Object.freeze(row)));
const NEW_EDGES = Object.freeze({
  CD:Object.freeze([[1,0],[2,1]].map(row => Object.freeze(row))),
  DC:Object.freeze([[1,0],[29,1]].map(row => Object.freeze(row))),
  DA:Object.freeze([[1,1],[0,1]].map(row => Object.freeze(row))),
  AD:Object.freeze([[1,30],[0,1]].map(row => Object.freeze(row)))
});
export const EDGE_ORACLES = Object.freeze({
  AB:POSITIVE_EDGES.AB, BA:REVERSE_EDGES.BA,
  BC:POSITIVE_EDGES.BC, CB:REVERSE_EDGES.CB,
  CA:POSITIVE_EDGES.CA, AC:REVERSE_EDGES.AC,
  ...NEW_EDGES
});
export const LOOP_PATHS = Object.freeze({
  gamma1:Object.freeze(['AB','BC','CA']),
  gamma1_inverse:Object.freeze(['AC','CB','BA']),
  gamma2:Object.freeze(['AC','CD','DA']),
  gamma2_inverse:Object.freeze(['AD','DC','CA'])
});
export const EXTENDED_GAUGE_FRAMES = Object.freeze({
  ...GAUGE_FRAMES,
  D:Object.freeze([[2,1],[1,1]].map(row => Object.freeze(row)))
});

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}
const mod = value => ((value % 31) + 31) % 31;
const equal = (left,right) => JSON.stringify(left) === JSON.stringify(right);

function endpoints(edgeId) {
  return [edgeId[0],edgeId[1]];
}

function reconstructDirected(edgeId,oracle) {
  const [source,target] = endpoints(edgeId);
  const observations = P_FULL.map(probe => observeOperator(oracle,probe));
  const [t11,t12,t21,sum] = observations;
  const reconstructed = freeze([[t11,t12],[t21,mod(sum-t11-t12-t21)]]);
  const heldoutObserved = observeOperator(oracle,P_HOLD);
  const heldoutPredicted = observeOperator(reconstructed,P_HOLD);
  return freeze({
    edge_id:edgeId,
    source_fiber:`V_${source}`,
    target_fiber:`V_${target}`,
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

function reconstructAll(oracles=EDGE_ORACLES) {
  return freeze(Object.fromEntries(Object.entries(oracles).map(([edgeId,oracle]) => [edgeId,reconstructDirected(edgeId,oracle)])));
}

function pathTransport(edgePath,receipts) {
  let transport = I;
  for (const edgeId of edgePath) transport = matrixMultiply(receipts[edgeId].reconstructed_operator,transport);
  return transport;
}

function orientationPass(receipts) {
  const pairs=[['AB','BA'],['BC','CB'],['CA','AC'],['CD','DC'],['DA','AD']];
  return pairs.every(([forward,reverse]) => equal(receipts[reverse].reconstructed_operator,inverse2(receipts[forward].reconstructed_operator)));
}

function gaugeTransformEdge(edgeId,matrix,frames) {
  const [source,target]=endpoints(edgeId);
  return matrixMultiply(frames[target],matrixMultiply(matrix,inverse2(frames[source])));
}

function transformAll(oracles,frames) {
  return freeze(Object.fromEntries(Object.entries(oracles).map(([edgeId,matrix]) => [edgeId,gaugeTransformEdge(edgeId,matrix,frames)])));
}

function commutator(left,right) {
  return matrixMultiply(left,matrixMultiply(right,matrixMultiply(inverse2(left),inverse2(right))));
}

export function runPathGroupoidDiscreteHolonomyAssay() {
  const receipts=reconstructAll();
  const allEdgesPass=Object.values(receipts).every(r=>r.oracle_match&&r.invertible&&r.heldout_residual===0);
  const orientationsPass=orientationPass(receipts);

  const H1=pathTransport(LOOP_PATHS.gamma1,receipts);
  const H1invDirect=pathTransport(LOOP_PATHS.gamma1_inverse,receipts);
  const H2=pathTransport(LOOP_PATHS.gamma2,receipts);
  const H2invDirect=pathTransport(LOOP_PATHS.gamma2_inverse,receipts);
  const inverseLawPass=equal(H1invDirect,inverse2(H1))&&equal(H2invDirect,inverse2(H2));

  const gamma1ThenGamma2=freeze([...LOOP_PATHS.gamma1,...LOOP_PATHS.gamma2]);
  const gamma2ThenGamma1=freeze([...LOOP_PATHS.gamma2,...LOOP_PATHS.gamma1]);
  const direct12=pathTransport(gamma1ThenGamma2,receipts);
  const direct21=pathTransport(gamma2ThenGamma1,receipts);
  const product12=matrixMultiply(H2,H1);
  const product21=matrixMultiply(H1,H2);
  const concatenationPass=equal(direct12,product12)&&equal(direct21,product21);
  const noncommuting=!equal(product12,product21);

  const CbasedPath=freeze(['CA','AB','BC','CA','AC']);
  const directCbased=pathTransport(CbasedPath,receipts);
  const conjugatedCbased=matrixMultiply(receipts.AC.reconstructed_operator,matrixMultiply(H1,receipts.CA.reconstructed_operator));
  const basepointPass=equal(directCbased,conjugatedCbased);

  const gaugeOracles=transformAll(EDGE_ORACLES,EXTENDED_GAUGE_FRAMES);
  const gaugeReceipts=reconstructAll(gaugeOracles);
  const gaugeAllEdgesPass=Object.values(gaugeReceipts).every(r=>r.oracle_match&&r.invertible&&r.heldout_residual===0);
  const gaugeOrientationPass=orientationPass(gaugeReceipts);
  const H1g=pathTransport(LOOP_PATHS.gamma1,gaugeReceipts);
  const H2g=pathTransport(LOOP_PATHS.gamma2,gaugeReceipts);
  const H1Expected=matrixMultiply(EXTENDED_GAUGE_FRAMES.A,matrixMultiply(H1,inverse2(EXTENDED_GAUGE_FRAMES.A)));
  const H2Expected=matrixMultiply(EXTENDED_GAUGE_FRAMES.A,matrixMultiply(H2,inverse2(EXTENDED_GAUGE_FRAMES.A)));
  const comm=commutator(H1,H2);
  const commG=commutator(H1g,H2g);
  const commExpected=matrixMultiply(EXTENDED_GAUGE_FRAMES.A,matrixMultiply(comm,inverse2(EXTENDED_GAUGE_FRAMES.A)));
  const gaugePass=gaugeAllEdgesPass&&gaugeOrientationPass&&equal(H1g,H1Expected)&&equal(H2g,H2Expected)&&equal(commG,commExpected);

  const orderBlindCandidates=freeze([direct12,direct21]);
  const orderBlindPass=noncommuting&&!equal(orderBlindCandidates[0],orderBlindCandidates[1]);
  const mechanismPass=allEdgesPass&&orientationsPass&&inverseLawPass&&concatenationPass&&noncommuting&&basepointPass&&gaugePass&&orderBlindPass;

  return freeze({
    schema:PATH_GROUPOID_HOLONOMY_SCHEMA,
    spec_head:HOLONOMY_SPEC_HEAD,
    source_status:'SIMULATED',
    arithmetic_domain:'F_31',
    graph:freeze({ vertices:freeze(['A','B','C','D']), oriented_edges:freeze(Object.keys(EDGE_ORACLES)) }),
    directed_edge_receipts:receipts,
    loops:freeze({
      gamma1:freeze({ path:LOOP_PATHS.gamma1,operator:H1,inverse_path:LOOP_PATHS.gamma1_inverse,direct_inverse_operator:H1invDirect,inverse_law:equal(H1invDirect,inverse2(H1)) }),
      gamma2:freeze({ path:LOOP_PATHS.gamma2,operator:H2,inverse_path:LOOP_PATHS.gamma2_inverse,direct_inverse_operator:H2invDirect,inverse_law:equal(H2invDirect,inverse2(H2)) })
    }),
    concatenation:freeze({
      gamma1_then_gamma2_path:gamma1ThenGamma2,
      direct_gamma1_then_gamma2:direct12,
      expected_H2_H1:product12,
      gamma2_then_gamma1_path:gamma2ThenGamma1,
      direct_gamma2_then_gamma1:direct21,
      expected_H1_H2:product21,
      concatenation_law_pass:concatenationPass,
      ordered_products_distinct:noncommuting
    }),
    commutator:freeze({ operator:comm, identity:equal(comm,I), nonidentity:!equal(comm,I) }),
    basepoint_change:freeze({
      C_based_path:CbasedPath,
      direct_operator:directCbased,
      conjugated_operator:conjugatedCbased,
      conjugacy_pass:basepointPass
    }),
    gauge_clone:freeze({
      directed_edge_receipts:gaugeReceipts,
      H1:H1g,
      H2:H2g,
      expected_H1_conjugate:H1Expected,
      expected_H2_conjugate:H2Expected,
      commutator:commG,
      expected_commutator_conjugate:commExpected,
      orientation_consistency_preserved:gaugeOrientationPass,
      loop_and_commutator_conjugacy_preserved:gaugePass
    }),
    hostile_order_blind_control:freeze({
      observed_loop_multiset:freeze(['gamma1','gamma2']),
      order_observed:false,
      candidate_ordered_products:orderBlindCandidates,
      candidate_count:orderBlindCandidates.length,
      unique_ordered_product_admitted:false,
      classification:orderBlindPass
        ? 'ORDER_BLIND_LOOP_AGGREGATION_IS_INSUFFICIENT_FOR_PATH_REPRESENTATION'
        : 'ORDER_BLIND_CONTROL_FAILED'
    }),
    findings:freeze({
      all_directed_edges_independently_reconstructed_and_validated:allEdgesPass,
      bidirectional_orientation_law_preserved:orientationsPass,
      path_inversion_maps_to_operator_inversion:inverseLawPass,
      path_concatenation_maps_to_ordered_operator_composition:concatenationPass,
      basepoint_change_maps_to_conjugation:basepointPass,
      gauge_change_maps_to_basepoint_conjugation:gaugePass,
      loop_image_contains_noncommuting_elements:noncommuting,
      order_blind_aggregation_loses_loop_order_information:orderBlindPass,
      assay_mechanism_validated:mechanismPass
    }),
    bounded_answer:mechanismPass
      ? 'DISCRETE_PATH_GROUPOID_HOLONOMY_REPRESENTATION_CANDIDATE_SURVIVES_IN_AUTHORED_F31_GRAPH_FIXTURE'
      : 'DISCRETE_PATH_GROUPOID_HOLONOMY_REPRESENTATION_CANDIDATE_FAILED',
    curvature_firewall:freeze({
      two_cell_geometry_declared:false,
      area_assignment_declared:false,
      infinitesimal_loop_family_declared:false,
      mesh_refinement_declared:false,
      continuum_limit_declared:false,
      curvature_defined:false,
      curvature_measured:false
    }),
    claims:freeze({
      discrete_graph_holonomy_representation_candidate:mechanismPass,
      noncommuting_discrete_loop_image_candidate:mechanismPass&&noncommuting,
      td613_general_holonomy:false,
      physical_holonomy:false,
      physical_connection:false,
      physical_curvature:false,
      berry_structure:false,
      quantum_noncommutativity:false,
      quantum_behavior:false,
      proto_loom:false,
      production_authority:false,
      vercel_authority:false
    }),
    promotion_authority:false,
    production_mutated:false,
    human_closure_required:true
  });
}
