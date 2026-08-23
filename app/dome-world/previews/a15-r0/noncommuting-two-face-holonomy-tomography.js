export const NONCOMMUTING_TWO_FACE_SCHEMA = 'td613.ash.noncommuting-two-face-holonomy-tomography/v0.1';
export const NONCOMMUTING_TWO_FACE_SPEC_HEAD = '5a0abd4275f46b6265b0213a4ae3912e2af680e5';
export const MODULUS = 31;

const I = Object.freeze([[1,0],[0,1]].map(row=>Object.freeze(row)));
const PRIMARY_ROWS = Object.freeze([
  Object.freeze([1,0,0,0]),
  Object.freeze([0,1,0,0]),
  Object.freeze([0,0,1,0]),
  Object.freeze([1,1,1,1])
]);
const H_LEGACY = Object.freeze([2,4,1,2]);
const H_GUARD = Object.freeze([0,0,0,1]);

const FORWARD = Object.freeze({
  AB:Object.freeze([[1,2],[0,1]].map(row=>Object.freeze(row))),
  BC:Object.freeze([[1,0],[3,1]].map(row=>Object.freeze(row))),
  AD:Object.freeze([[2,0],[0,1]].map(row=>Object.freeze(row))),
  BE:Object.freeze([[1,1],[1,2]].map(row=>Object.freeze(row))),
  CF:Object.freeze([[1,4],[0,1]].map(row=>Object.freeze(row))),
  DE:Object.freeze([[1,0],[2,1]].map(row=>Object.freeze(row))),
  EF:Object.freeze([[3,1],[1,1]].map(row=>Object.freeze(row)))
});

const FRAMES = Object.freeze({
  A:Object.freeze([[1,1],[1,2]].map(row=>Object.freeze(row))),
  B:Object.freeze([[2,1],[1,1]].map(row=>Object.freeze(row))),
  C:Object.freeze([[1,2],[1,3]].map(row=>Object.freeze(row))),
  D:Object.freeze([[1,3],[2,1]].map(row=>Object.freeze(row))),
  E:Object.freeze([[2,3],[1,2]].map(row=>Object.freeze(row))),
  F:Object.freeze([[3,1],[2,1]].map(row=>Object.freeze(row)))
});

const CANONICAL_EDGES = Object.freeze([
  Object.freeze(['A','B']), Object.freeze(['B','C']), Object.freeze(['A','D']),
  Object.freeze(['B','E']), Object.freeze(['C','F']), Object.freeze(['D','E']),
  Object.freeze(['E','F'])
]);

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

export function mod(value) { return ((Number(value)%MODULUS)+MODULUS)%MODULUS; }
function scalarInverse(value) {
  const a=mod(value);
  if (a===0) throw new Error('zero has no inverse in F_31');
  for(let k=1;k<MODULUS;k+=1) if(mod(a*k)===1) return k;
  throw new Error('field inverse not found');
}
function matrixEqual(left,right) { return JSON.stringify(left)===JSON.stringify(right); }
function edgeId(source,target) { return `${source}${target}`; }
function matrixVector(matrix) { return freeze([matrix[0][0],matrix[0][1],matrix[1][0],matrix[1][1]].map(mod)); }
function vectorMatrix(vector) { return freeze([[mod(vector[0]),mod(vector[1])],[mod(vector[2]),mod(vector[3])]]); }

export function matrixMultiply(left,right) {
  return freeze(left.map(row=>right[0].map((_,column)=>mod(row.reduce((sum,value,index)=>sum+value*right[index][column],0)))));
}
export function determinant2(matrix) { return mod(matrix[0][0]*matrix[1][1]-matrix[0][1]*matrix[1][0]); }
export function inverse2(matrix) {
  const det=determinant2(matrix);
  if(det===0) throw new Error('singular matrix in F_31');
  const d=scalarInverse(det);
  return freeze([[mod(d*matrix[1][1]),mod(-d*matrix[0][1])],[mod(-d*matrix[1][0]),mod(d*matrix[0][0])]]);
}

export function rankMod(matrix) {
  const work=matrix.map(row=>row.map(mod));
  let rank=0;
  for(let col=0;col<work[0].length && rank<work.length;col+=1) {
    let pivot=rank;
    while(pivot<work.length && work[pivot][col]===0) pivot+=1;
    if(pivot===work.length) continue;
    [work[rank],work[pivot]]=[work[pivot],work[rank]];
    const inv=scalarInverse(work[rank][col]);
    for(let c=col;c<work[rank].length;c+=1) work[rank][c]=mod(work[rank][c]*inv);
    for(let r=0;r<work.length;r+=1) {
      if(r===rank) continue;
      const factor=work[r][col];
      if(factor===0) continue;
      for(let c=col;c<work[r].length;c+=1) work[r][c]=mod(work[r][c]-factor*work[rank][c]);
    }
    rank+=1;
  }
  return rank;
}

function solveUnique(rows,observations) {
  const n=rows[0].length;
  if(rankMod(rows)!==n) return null;
  const a=rows.map((row,index)=>[...row.map(mod),mod(observations[index])]);
  let r=0;
  for(let c=0;c<n;c+=1) {
    let pivot=r;
    while(pivot<a.length && a[pivot][c]===0) pivot+=1;
    if(pivot===a.length) return null;
    [a[r],a[pivot]]=[a[pivot],a[r]];
    const inv=scalarInverse(a[r][c]);
    for(let k=c;k<=n;k+=1) a[r][k]=mod(a[r][k]*inv);
    for(let rr=0;rr<a.length;rr+=1) {
      if(rr===r) continue;
      const factor=a[rr][c];
      for(let k=c;k<=n;k+=1) a[rr][k]=mod(a[rr][k]-factor*a[r][k]);
    }
    r+=1;
  }
  return freeze(a.slice(0,n).map(row=>row[n]));
}

function observeRow(matrix,row) {
  const vector=matrixVector(matrix);
  return mod(row.reduce((sum,value,index)=>sum+value*vector[index],0));
}

function reconstructDirectedEdge(source,target,oracle) {
  const observations=PRIMARY_ROWS.map(row=>observeRow(oracle,row));
  const solution=solveUnique(PRIMARY_ROWS,observations);
  const reconstructed=solution ? vectorMatrix(solution) : null;
  const legacyObserved=observeRow(oracle,H_LEGACY);
  const guardObserved=observeRow(oracle,H_GUARD);
  const legacyPredicted=reconstructed ? observeRow(reconstructed,H_LEGACY) : null;
  const guardPredicted=reconstructed ? observeRow(reconstructed,H_GUARD) : null;
  return freeze({
    edge_id:edgeId(source,target),
    source_vertex:source,
    target_vertex:target,
    primary_projection_rows:PRIMARY_ROWS,
    primary_scalar_observations:freeze(observations),
    projection_rank:rankMod(PRIMARY_ROWS),
    reconstructed_operator:reconstructed,
    determinant:reconstructed ? determinant2(reconstructed) : null,
    invertible:reconstructed ? determinant2(reconstructed)!==0 : false,
    legacy_validator_observed:legacyObserved,
    legacy_validator_predicted:legacyPredicted,
    legacy_validator_residual:legacyPredicted===null ? null : mod(legacyPredicted-legacyObserved),
    guard_validator_observed:guardObserved,
    guard_validator_predicted:guardPredicted,
    guard_validator_residual:guardPredicted===null ? null : mod(guardPredicted-guardObserved),
    oracle_match:reconstructed ? matrixEqual(reconstructed,oracle) : false,
    oracle_consulted_by_inverse_solver:false
  });
}

function directedOracleFamily(forward=FORWARD) {
  const out={};
  for(const [source,target] of CANONICAL_EDGES) {
    const id=edgeId(source,target);
    const reverseId=edgeId(target,source);
    out[id]=forward[id];
    out[reverseId]=inverse2(forward[id]);
  }
  return freeze(out);
}

function reconstructFamily(oracles) {
  const receipts={};
  for(const [id,oracle] of Object.entries(oracles)) receipts[id]=reconstructDirectedEdge(id[0],id[1],oracle);
  for(const [source,target] of CANONICAL_EDGES) {
    const id=edgeId(source,target), reverseId=edgeId(target,source);
    const forwardReceipt=receipts[id], reverseReceipt=receipts[reverseId];
    receipts[id]=freeze({ ...forwardReceipt, reverse_edge_id:reverseId, orientation_inverse_consistent:matrixEqual(reverseReceipt.reconstructed_operator,inverse2(forwardReceipt.reconstructed_operator)) });
    receipts[reverseId]=freeze({ ...reverseReceipt, reverse_edge_id:id, orientation_inverse_consistent:matrixEqual(forwardReceipt.reconstructed_operator,inverse2(reverseReceipt.reconstructed_operator)) });
  }
  return freeze(receipts);
}

function multiplyOrdered(...matrices) {
  return matrices.reduce((left,right)=>matrixMultiply(left,right));
}

function allEdgesAdmitted(receipts) {
  return Object.values(receipts).every(receipt=>
    receipt.projection_rank===4 && receipt.oracle_match && receipt.invertible &&
    receipt.legacy_validator_residual===0 && receipt.guard_validator_residual===0 &&
    receipt.orientation_inverse_consistent===true
  );
}

function surfaceFromReceipts(r) {
  if(!allEdgesAdmitted(r)) return freeze({ admitted:false, classification:'BIDIRECTIONAL_TRANSPORT_INCONSISTENT' });
  const left=multiplyOrdered(r.DA.reconstructed_operator,r.ED.reconstructed_operator,r.BE.reconstructed_operator,r.AB.reconstructed_operator);
  const rightB=multiplyOrdered(r.EB.reconstructed_operator,r.FE.reconstructed_operator,r.CF.reconstructed_operator,r.BC.reconstructed_operator);
  const rightA=multiplyOrdered(r.BA.reconstructed_operator,rightB,r.AB.reconstructed_operator);
  const outer=multiplyOrdered(r.DA.reconstructed_operator,r.ED.reconstructed_operator,r.FE.reconstructed_operator,r.CF.reconstructed_operator,r.BC.reconstructed_operator,r.AB.reconstructed_operator);
  const ordered=matrixMultiply(left,rightA);
  const wrongBase=matrixMultiply(left,rightB);
  const wrongOrder=matrixMultiply(rightA,left);
  const commute=matrixEqual(matrixMultiply(left,rightA),matrixMultiply(rightA,left));
  return freeze({
    admitted:true,
    left_face_loop_A:left,
    right_face_loop_B:rightB,
    right_face_loop_A:rightA,
    outer_boundary_loop_A:outer,
    face_loops_commute:commute,
    ordered_common_basepoint_product:ordered,
    outer_equals_ordered_common_basepoint_product:matrixEqual(outer,ordered),
    wrong_basepoint_product:wrongBase,
    wrong_basepoint_matches_outer:matrixEqual(wrongBase,outer),
    wrong_order_product:wrongOrder,
    wrong_order_matches_outer:matrixEqual(wrongOrder,outer),
    shared_edge_cancellation_ledger:freeze({
      expansion:'(DA ED BE AB)(BA EB FE CF BC AB)',
      inverse_pairs:freeze(['AB*BA=I','BE*EB=I']),
      reduction:'DA ED FE CF BC AB',
      exact_reduction_matches_outer:matrixEqual(outer,ordered)
    })
  });
}

function gaugeTransformOracles(oracles) {
  const out={};
  for(const [id,matrix] of Object.entries(oracles)) {
    const source=id[0], target=id[1];
    out[id]=multiplyOrdered(FRAMES[target],matrix,inverse2(FRAMES[source]));
  }
  return freeze(out);
}

export function runNoncommutingTwoFaceHolonomyTomographyHoldout() {
  const baseOracles=directedOracleFamily();
  const receipts=reconstructFamily(baseOracles);
  const surface=surfaceFromReceipts(receipts);

  const framesInvertible=Object.fromEntries(Object.entries(FRAMES).map(([id,matrix])=>[id,determinant2(matrix)!==0]));
  const gaugeReceipts=reconstructFamily(gaugeTransformOracles(baseOracles));
  const gaugeSurface=surfaceFromReceipts(gaugeReceipts);

  const leftGaugeExpected=multiplyOrdered(FRAMES.A,surface.left_face_loop_A,inverse2(FRAMES.A));
  const rightBGaugeExpected=multiplyOrdered(FRAMES.B,surface.right_face_loop_B,inverse2(FRAMES.B));
  const rightAGaugeExpected=multiplyOrdered(FRAMES.A,surface.right_face_loop_A,inverse2(FRAMES.A));
  const outerGaugeExpected=multiplyOrdered(FRAMES.A,surface.outer_boundary_loop_A,inverse2(FRAMES.A));

  const gaugeRelations=freeze({
    all_frames_invertible:Object.values(framesInvertible).every(Boolean),
    frame_invertibility:freeze(framesInvertible),
    left_face_conjugacy:matrixEqual(gaugeSurface.left_face_loop_A,leftGaugeExpected),
    right_face_B_conjugacy:matrixEqual(gaugeSurface.right_face_loop_B,rightBGaugeExpected),
    right_face_A_conjugacy:matrixEqual(gaugeSurface.right_face_loop_A,rightAGaugeExpected),
    outer_boundary_conjugacy:matrixEqual(gaugeSurface.outer_boundary_loop_A,outerGaugeExpected),
    transformed_surface_composition:gaugeSurface.outer_equals_ordered_common_basepoint_product
  });

  const pass=
    rankMod(PRIMARY_ROWS)===4 && allEdgesAdmitted(receipts) && surface.admitted &&
    surface.outer_equals_ordered_common_basepoint_product && !surface.face_loops_commute &&
    !surface.wrong_basepoint_matches_outer && !surface.wrong_order_matches_outer &&
    Object.values(gaugeRelations).filter(value=>typeof value==='boolean').every(Boolean);

  return freeze({
    schema:NONCOMMUTING_TWO_FACE_SCHEMA,
    spec_head:NONCOMMUTING_TWO_FACE_SPEC_HEAD,
    source_status:'SIMULATED',
    arithmetic_domain:'F_31',
    cell_complex:'TWO_ADJACENT_SQUARE_2_CELLS',
    contaminated_development_pilot_count:1,
    confirmatory_fixture_executed_after_preregistration:true,
    primary_projection_rank:rankMod(PRIMARY_ROWS),
    directed_edge_receipts:receipts,
    surface,
    gauge_clone:freeze({ directed_edge_receipts:gaugeReceipts, surface:gaugeSurface, relations:gaugeRelations }),
    findings:freeze({
      bidirectional_edge_tomography_and_orientation_consistency_pass:allEdgesAdmitted(receipts),
      local_face_holonomies_noncommute:!surface.face_loops_commute,
      common_basepoint_ordered_product_reconstructs_outer_boundary:surface.outer_equals_ordered_common_basepoint_product,
      wrong_basepoint_control_rejected:!surface.wrong_basepoint_matches_outer,
      wrong_order_control_rejected:!surface.wrong_order_matches_outer,
      gauge_clone_preserves_conjugacy_and_surface_composition:Object.values(gaugeRelations).filter(value=>typeof value==='boolean').every(Boolean),
      assay_mechanism_validated:pass
    }),
    bounded_answer:pass
      ? 'NONCOMMUTING_TWO_FACE_HOLONOMY_COMPOSITION_SURVIVES_TOMOGRAPHIC_RECONSTRUCTION_IN_AUTHORED_GL2_F31_CELL_COMPLEX'
      : 'NONCOMMUTING_TWO_FACE_HOLONOMY_TOMOGRAPHY_HOLDOUT_FAILED',
    claim_ceiling:freeze({
      discrete_noncommuting_face_holonomy_tomography_candidate:pass,
      additive_nonabelian_stokes_theorem:false,
      continuum_nonabelian_stokes_theorem:false,
      continuum_curvature_2_form:false,
      yang_mills_field:false,
      physical_gauge_field:false,
      berry_curvature:false,
      quantum_holonomy:false,
      td613_general_holonomy_law:false,
      proto_loom:false,
      production_authority:false,
      vercel_authority:false
    }),
    promotion_authority:false,
    production_mutated:false,
    human_closure_required:true
  });
}
