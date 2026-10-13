import {
  P_HOLD,
  POSITIVE_EDGES,
  determinant2,
  matrixMultiply,
  observeOperator,
  probeRow,
  rankMod,
  reconstructEdge,
  runDiscreteTransportTomographyAssay
} from './discrete-transport-tomography-closed-loop.js';

export const HARDENED_TRANSPORT_TOMOGRAPHY_SCHEMA = 'td613.ash.discrete-transport-tomography.closed-loop-falsification.hardened/v0.1';
export const AMENDMENT_HEAD = 'b301ac9147b68a9ba8883bfec40391a0f5ac086b';
export const P_BLIND_HARD = Object.freeze([
  Object.freeze({ probe_id:'BH1', x:Object.freeze([0,1]), p:Object.freeze([0,1]) }),
  Object.freeze({ probe_id:'BH2', x:Object.freeze([0,1]), p:Object.freeze([1,0]) }),
  Object.freeze({ probe_id:'BH3', x:Object.freeze([0,1]), p:Object.freeze([1,1]) }),
  Object.freeze({ probe_id:'BH4', x:Object.freeze([1,0]), p:Object.freeze([2,1]) })
]);
export const HARD_NULL_VECTOR = Object.freeze([15,0,1,0]);
export const HARD_COMPATIBLE_AB = Object.freeze([
  Object.freeze([[1,1],[0,1]].map(row => Object.freeze(row))),
  Object.freeze([[16,1],[1,1]].map(row => Object.freeze(row)))
]);

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

function mod(value) { return ((value % 31) + 31) % 31; }
function equal(left,right) { return JSON.stringify(left) === JSON.stringify(right); }
function dot(left,right) { return mod(left.reduce((sum,value,index) => sum + value * right[index],0)); }

function hardBlindControl() {
  const rows = P_BLIND_HARD.map(probeRow);
  const heldoutRow = probeRow(P_HOLD);
  const rank = rankMod(rows);
  const nullAnnihilation = rows.map(row => dot(row,HARD_NULL_VECTOR));
  const heldoutNullDot = dot(heldoutRow,HARD_NULL_VECTOR);
  const blindReceipt = reconstructEdge('AB',POSITIVE_EDGES.AB,P_BLIND_HARD);
  const bc = reconstructEdge('BC',POSITIVE_EDGES.BC);
  const ca = reconstructEdge('CA',POSITIVE_EDGES.CA);

  const candidates = HARD_COMPATIBLE_AB.map((candidate,index) => {
    const primary = P_BLIND_HARD.map(probe => observeOperator(candidate,probe));
    const heldout = observeOperator(candidate,P_HOLD);
    const loop = matrixMultiply(ca.reconstructed_operator,matrixMultiply(bc.reconstructed_operator,candidate));
    return freeze({
      candidate_id:`HARD_AB_${index}`,
      operator:candidate,
      determinant:determinant2(candidate),
      invertible:determinant2(candidate)!==0,
      primary_observations:freeze(primary),
      heldout_observation:heldout,
      loop_operator:loop
    });
  });

  const primarySame = equal(candidates[0].primary_observations,candidates[1].primary_observations);
  const heldoutSame = candidates[0].heldout_observation === candidates[1].heldout_observation;
  const loopsDistinct = !equal(candidates[0].loop_operator,candidates[1].loop_operator);
  const allInvertible = candidates.every(candidate => candidate.invertible);
  const pass = rank === 3
    && nullAnnihilation.every(value => value === 0)
    && heldoutNullDot === 0
    && blindReceipt.unique_reconstruction === false
    && primarySame
    && heldoutSame
    && allInvertible
    && loopsDistinct;

  return freeze({
    schedule_id:'P_BLIND_HARD',
    coefficient_rows:freeze(rows),
    rank,
    nullity:4-rank,
    frozen_null_vector:HARD_NULL_VECTOR,
    row_null_dot_products:freeze(nullAnnihilation),
    heldout_row:heldoutRow,
    heldout_null_dot_product:heldoutNullDot,
    primary_inverse_receipt:blindReceipt,
    compatible_candidates:freeze(candidates),
    compatible_primary_observations_equal:primarySame,
    compatible_heldout_observations_equal:heldoutSame,
    compatible_loop_operators_distinct:loopsDistinct,
    loop_identifiability:pass ? 'UNIDENTIFIED' : 'CONTROL_FAILED',
    classification:pass
      ? 'CLOSED_LOOP_TRANSPORT_UNIDENTIFIED_AFTER_HELDOUT_BLIND_NULLSPACE_CONTROL'
      : 'HELDOUT_BLIND_NULLSPACE_CONTROL_FALSIFIED',
    control_pass:pass
  });
}

export function runHardenedDiscreteTransportTomographyAssay() {
  const development = runDiscreteTransportTomographyAssay();
  const hardenedBlind = hardBlindControl();
  const nonBlindPrerequisites = (
    development.findings.edgewise_scalar_projection_reconstruction_validated
    && development.findings.flat_gauge_generated_loop_recovers_identity
    && development.findings.nontrivial_reusable_loop_recovers_after_edgewise_reconstruction
    && development.findings.gauge_clone_conjugacy_consistent
    && development.findings.reversed_loop_matches_inverse
    && development.findings.history_dependence_can_falsify_reusable_transport_model
  );
  const pass = nonBlindPrerequisites && hardenedBlind.control_pass;

  return freeze({
    schema:HARDENED_TRANSPORT_TOMOGRAPHY_SCHEMA,
    parent_spec_head:development.spec_head,
    amendment_head:AMENDMENT_HEAD,
    arithmetic_domain:'F_31',
    legacy_blind_control:freeze({
      classification:'DEVELOPMENT_ONLY_HELDOUT_LEAKY_CONTROL',
      counted_in_final_scientific_verdict:false,
      legacy_result:development.blind_projection_control
    }),
    edgewise_transport_tomography:freeze({
      positive:development.positive,
      flat_null:development.flat_null,
      gauge_clone:development.gauge_clone,
      reversal:development.reversal,
      history_dependent_impostor:development.history_dependent_impostor
    }),
    hardened_blind_control:hardenedBlind,
    findings:freeze({
      non_blind_transport_prerequisites_pass:nonBlindPrerequisites,
      primary_projection_nullspace_persists_through_common_heldout_probe:hardenedBlind.control_pass,
      same_available_scalar_evidence_supports_distinct_loop_operators:hardenedBlind.control_pass,
      failure_to_identify_loop_residual_is_not_flatness:true,
      hardened_assay_mechanism_validated:pass
    }),
    bounded_answer:pass
      ? 'DISCRETE_HOLONOMY_TOMOGRAPHY_IS_IMPLEMENTABLE_AND_FALSIFIABLE_WITH_HELDOUT_PERSISTENT_NULLSPACE_CONTROL_IN_AUTHORED_FINITE_FIXTURE'
      : 'DISCRETE_HOLONOMY_TOMOGRAPHY_HARDENED_ASSAY_FAILED',
    claims:freeze({
      discrete_edge_transport_reconstruction_grammar:pass,
      discrete_closed_loop_reconstruction_grammar:pass,
      td613_general_holonomy_observed:false,
      physical_tomography:false,
      physical_parallel_transport:false,
      physical_connection:false,
      physical_curvature:false,
      physical_holonomy:false,
      berry_phase:false,
      berry_curvature:false,
      quantum_behavior:false,
      proto_loom:false,
      holonomy_loom_runtime:false,
      production_authority:false,
      vercel_authority:false
    }),
    promotion_authority:false,
    production_mutated:false,
    live_ash_binding:false,
    human_closure_required:true
  });
}
