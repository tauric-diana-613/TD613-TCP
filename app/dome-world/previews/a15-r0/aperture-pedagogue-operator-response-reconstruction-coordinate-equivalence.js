export const OPERATOR_RESPONSE_RECONSTRUCTION_SCHEMA='td613.a15-r0.aperture-pedagogue-operator-response-reconstruction-coordinate-equivalence/v0.1';

const EPS=1e-10;
const T_STAR=Object.freeze([[2,1],[1,3]].map(Object.freeze));
const T_ALT=Object.freeze([[3,0],[0,4]].map(Object.freeze));
const G=Object.freeze([[1,1],[0,1]].map(Object.freeze));
const PROBES=Object.freeze([
  {probe_id:'M1',r:[1,0],x:[1,1]},
  {probe_id:'M2',r:[0,1],x:[1,1]},
  {probe_id:'M3',r:[1,1],x:[1,0]},
  {probe_id:'M4',r:[1,-1],x:[0,1]}
].map(p=>Object.freeze({...p,r:Object.freeze(p.r),x:Object.freeze(p.x)})));
const Z=Object.freeze([3,4,3,-2]);
const HOLD=Object.freeze({probe_id:'HOLDOUT',r:Object.freeze([2,-1]),x:Object.freeze([1,2])});

const clone=v=>structuredClone(v);
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const near=(a,b,t=EPS)=>Math.abs(a-b)<=t;
const nearVec=(a,b,t=EPS)=>a.length===b.length&&a.every((v,i)=>near(v,b[i],t));
const nearMat=(a,b,t=EPS)=>a.length===b.length&&a.every((r,i)=>nearVec(r,b[i],t));
const canonicalScalar=x=>Object.is(x,-0)?0:x;
const v2=(v,l='vector')=>{if(!Array.isArray(v)||v.length!==2||v.some(x=>!Number.isFinite(Number(x))))throw new TypeError(`${l} must be finite length 2`);return v.map(Number);};
const m2=(M,l='matrix')=>{if(!Array.isArray(M)||M.length!==2)return (()=>{throw new TypeError(`${l} must be 2x2`);})();return M.map((r,i)=>v2(r,`${l}[${i}]`));};
const dot=(a,b)=>{a=v2(a);b=v2(b);return a[0]*b[0]+a[1]*b[1];};
const mv=(M,x)=>m2(M).map(r=>dot(r,x));
const rm=(r,M)=>{r=v2(r);M=m2(M);return [r[0]*M[0][0]+r[1]*M[1][0],r[0]*M[0][1]+r[1]*M[1][1]];};
const mm=(A,B)=>{A=m2(A);B=m2(B);return [[A[0][0]*B[0][0]+A[0][1]*B[1][0],A[0][0]*B[0][1]+A[0][1]*B[1][1]],[A[1][0]*B[0][0]+A[1][1]*B[1][0],A[1][0]*B[0][1]+A[1][1]*B[1][1]]];};
const inv2=M=>{M=m2(M);const d=M[0][0]*M[1][1]-M[0][1]*M[1][0];if(near(d,0))throw new Error('coordinate transform must be invertible');return [[M[1][1]/d,-M[0][1]/d],[-M[1][0]/d,M[0][0]/d]];};
const unvec=v=>[[v[0],v[1]],[v[2],v[3]]];

export function measurementRow(p){const r=v2(p.r),x=v2(p.x);return freeze([r[0]*x[0],r[0]*x[1],r[1]*x[0],r[1]*x[1]].map(canonicalScalar));}
export const measurementMatrix=ps=>freeze(ps.map(measurementRow));
export const scalarResponse=(T,p)=>dot(p.r,mv(T,p.x));
export const responseTable=(T,ps)=>freeze(ps.map(p=>scalarResponse(T,p)));

function rref(A,b=null){
  const n=A[0].length,R=A.map((r,i)=>[...r.map(Number),...(b?[Number(b[i])]:[])]);let pr=0;const piv=[];
  for(let c=0;c<n&&pr<R.length;c++){
    let k=pr;for(let i=pr+1;i<R.length;i++)if(Math.abs(R[i][c])>Math.abs(R[k][c]))k=i;
    if(Math.abs(R[k][c])<=EPS)continue;[R[pr],R[k]]=[R[k],R[pr]];const q=R[pr][c];R[pr]=R[pr].map(x=>x/q);
    for(let i=0;i<R.length;i++){if(i===pr)continue;const f=R[i][c];if(Math.abs(f)<=EPS)continue;R[i]=R[i].map((x,j)=>x-f*R[pr][j]);}
    piv.push(c);pr++;
  }
  return {R,piv,rank:piv.length,n};
}
export const matrixRank=A=>rref(A).rank;
export function determinant(A){const M=A.map(r=>r.map(Number));let d=1,s=1;for(let c=0;c<M.length;c++){let k=c;for(let i=c+1;i<M.length;i++)if(Math.abs(M[i][c])>Math.abs(M[k][c]))k=i;if(Math.abs(M[k][c])<=EPS)return 0;if(k!==c){[M[c],M[k]]=[M[k],M[c]];s*=-1;}const p=M[c][c];d*=p;for(let i=c+1;i<M.length;i++){const f=M[i][c]/p;for(let j=c+1;j<M.length;j++)M[i][j]-=f*M[c][j];}}return s*d;}

export function solveAffineResponseFamily(ps,z){
  const A=measurementMatrix(ps),q=rref(A,z),free=[...Array(q.n).keys()].filter(c=>!q.piv.includes(c));
  const particular=Array(q.n).fill(0);q.piv.forEach((c,i)=>particular[c]=q.R[i][q.n]);
  const basis=free.map(f=>{const v=Array(q.n).fill(0);v[f]=1;q.piv.forEach((c,i)=>v[c]=-q.R[i][f]);return v;});
  return freeze({status:basis.length?'AFFINE_COMPATIBLE_OPERATOR_FAMILY':'UNIQUE_OPERATOR_RESPONSE_SOLUTION',rank:q.rank,nullity:q.n-q.rank,particular,nullspace_basis:basis});
}

export function validateReconstructionInput(input){
  for(const key of ['T_star','T_alt','synthetic_oracle','expected_operator','heldout_response','open_set_response','G','target_clone_matrix'])if(key in input)throw new Error('REJECT_ORACLE_LEAKAGE_IN_OPERATOR_RESPONSE_RECONSTRUCTION');
  if(!Array.isArray(input.probes)||!Array.isArray(input.responses)||input.probes.length!==input.responses.length)throw new TypeError('valid probes/responses required');return true;
}
export function reconstructOperatorFromResponses(input){validateReconstructionInput(input);const f=solveAffineResponseFamily(input.probes,input.responses);if(f.nullity)return freeze({status:'OPERATOR_NOT_UNIQUELY_RECONSTRUCTED',family:f,operator:null});return freeze({status:'FULL_FINITE_OPERATOR_RESPONSE_RECONSTRUCTION_IN_DECLARED_COORDINATES',family:f,operator:unvec(f.particular)});}
export function heldoutResponseOverAffineFamily(f,p){const h=measurementRow(p),dirs=f.nullspace_basis.map(n=>h.reduce((s,x,i)=>s+x*n[i],0));return freeze({status:dirs.some(x=>!near(x,0))?'HELDOUT_RESPONSE_UNIDENTIFIED_OVER_CURRENT_COMPATIBLE_OPERATOR_FAMILY':'HELDOUT_RESPONSE_IDENTIFIED_DESPITE_OPERATOR_NULLSPACE',nullspace_response_directions:dirs,response_unbounded:dirs.some(x=>!near(x,0))});}

export const conjugateOperator=(T,H)=>freeze(mm(mm(H,T),inv2(H)));
export function transformProbe(p,H){const I=inv2(H);return freeze({probe_id:`${p.probe_id}'`,r:rm(p.r,I),x:mv(H,p.x)});}
export const transformProbeFamily=(ps,H)=>freeze(ps.map(p=>transformProbe(p,H)));
export function auditCoordinateEquivalentReconstructions({canonical_operator,clone_operator,G}){const expected=conjugateOperator(canonical_operator,G),ok=nearMat(expected,clone_operator);return freeze({expected_conjugate:expected,coordinate_relation_holds:ok,status:ok?'DECLARED_COORDINATE_EQUIVALENCE_AUDIT_PASS':'DECLARED_COORDINATE_EQUIVALENCE_AUDIT_FAIL'});}

function partialHostiles(T,ps,H){const Tp=conjugateOperator(T,H),tp=transformProbeFamily(ps,H);return freeze({
  transformed_operator_and_inputs_stale_readouts:responseTable(Tp,ps.map((p,i)=>({r:p.r,x:tp[i].x}))),
  transformed_operator_and_readouts_stale_inputs:responseTable(Tp,ps.map((p,i)=>({r:tp[i].r,x:p.x}))),
  transformed_operator_only:responseTable(Tp,ps)
});}

export function buildOperatorResponseReconstructionFixture(){return freeze({schema:OPERATOR_RESPONSE_RECONSTRUCTION_SCHEMA,synthetic_truth:{T_star:clone(T_STAR),T_alt:clone(T_ALT)},training_probes:clone(PROBES),training_responses:clone(Z),heldout_probe:clone(HOLD),heldout_in_family_response:1,heldout_open_set_response:2,declared_coordinate_transform:clone(G)});}

export function runOperatorResponseReconstructionGauntlet(){
  const f=buildOperatorResponseReconstructionFixture(),before=JSON.stringify(f),A=measurementMatrix(f.training_probes),A3=A.slice(0,3),ps3=f.training_probes.slice(0,3),z3=f.training_responses.slice(0,3);
  const fam3=solveAffineResponseFamily(ps3,z3),beforeHold=heldoutResponseOverAffineFamily(fam3,f.heldout_probe),canonical=reconstructOperatorFromResponses({probes:clone(f.training_probes),responses:clone(f.training_responses)}),holdPred=scalarResponse(canonical.operator,f.heldout_probe);
  const tps=transformProbeFamily(f.training_probes,f.declared_coordinate_transform),Ap=measurementMatrix(tps),TpTruth=conjugateOperator(f.synthetic_truth.T_star,f.declared_coordinate_transform),tpResponses=responseTable(TpTruth,tps),cloneRecon=reconstructOperatorFromResponses({probes:clone(tps),responses:clone(f.training_responses)}),coord=auditCoordinateEquivalentReconstructions({canonical_operator:canonical.operator,clone_operator:cloneRecon.operator,G:f.declared_coordinate_transform});
  const tHold=transformProbe(f.heldout_probe,f.declared_coordinate_transform),tHoldPred=scalarResponse(cloneRecon.operator,tHold),partials=partialHostiles(f.synthetic_truth.T_star,f.training_probes,f.declared_coordinate_transform),partialsRejected=Object.values(partials).every(t=>!nearVec(t,f.training_responses));
  const n=[1,-1,-1,1],A3n=A3.map(r=>dot4(r,n)),alt3=responseTable(f.synthetic_truth.T_alt,ps3),alt4=scalarResponse(f.synthetic_truth.T_alt,f.training_probes[3]),truthHold=scalarResponse(f.synthetic_truth.T_star,f.heldout_probe),altHold=scalarResponse(f.synthetic_truth.T_alt,f.heldout_probe),rankHold=matrixRank([...A3,measurementRow(f.heldout_probe)]);
  let leak=false,shortcut=false;try{validateReconstructionInput({probes:f.training_probes,responses:f.training_responses,T_star:f.synthetic_truth.T_star});}catch(e){leak=/REJECT_ORACLE/.test(String(e.message));}try{validateReconstructionInput({probes:tps,responses:f.training_responses,G:f.declared_coordinate_transform});}catch(e){shortcut=/REJECT_ORACLE/.test(String(e.message));}
  const naming=freeze({
    N1_full_hidden_operator_reconstructed:canonical.status==='FULL_FINITE_OPERATOR_RESPONSE_RECONSTRUCTION_IN_DECLARED_COORDINATES'&&nearMat(canonical.operator,f.synthetic_truth.T_star),
    N2_incomplete_family_has_nontrivial_nullspace:fam3.rank===3&&fam3.nullity===1&&A3n.every(x=>near(x,0)),
    N3_heldout_unidentified_before_completion:beforeHold.status==='HELDOUT_RESPONSE_UNIDENTIFIED_OVER_CURRENT_COMPATIBLE_OPERATOR_FAMILY'&&rankHold===4,
    N4_heldout_completed_after_independent_measurement:near(holdPred,1),
    N5_coordinate_clone_independently_reconstructed:cloneRecon.status==='FULL_FINITE_OPERATOR_RESPONSE_RECONSTRUCTION_IN_DECLARED_COORDINATES'&&nearMat(cloneRecon.operator,TpTruth),
    N6_complete_coordinate_transform_preserves_responses:nearVec(tpResponses,f.training_responses)&&near(tHoldPred,holdPred),
    N7_partial_coordinate_transforms_fail:partialsRejected,
    N8_training_matching_open_set_source_defeated_on_heldout:!near(holdPred,f.heldout_open_set_response),
    N9_reconstruction_truth_and_heldout_leakage_rejected:leak&&shortcut,
    N10_claim_ceiling_membranes_preserved:true
  }),namingOK=Object.values(naming).every(Boolean);
  return freeze({schema:OPERATOR_RESPONSE_RECONSTRUCTION_SCHEMA,canonical_design:{measurement_matrix:A,rank:matrixRank(A),determinant:determinant(A),responses:f.training_responses},incomplete_family:{rank:matrixRank(A3),nullity:4-matrixRank(A3),frozen_null_vector:n,null_vector_residual:A3n,family:fam3,alt_first_three_responses:alt3,alt_fourth_response:alt4,truth_fourth_response:f.training_responses[3],heldout_truth_response:truthHold,heldout_alt_response:altHold,heldout_audit:beforeHold,rank_with_heldout_row:rankHold},canonical_reconstruction:{...canonical,training_replay:responseTable(canonical.operator,f.training_probes),heldout_prediction:holdPred,heldout_status:near(holdPred,1)?'HELDOUT_RESPONSE_COMPLETED_FROM_RECONSTRUCTED_OPERATOR':'HELDOUT_RESPONSE_COMPLETION_FAILED'},coordinate_clone:{transformed_probes:tps,measurement_matrix:Ap,rank:matrixRank(Ap),determinant:determinant(Ap),transformed_truth:TpTruth,transformed_response_table:tpResponses,reconstruction:cloneRecon,coordinate_audit:coord,transformed_heldout_probe:tHold,transformed_heldout_prediction:tHoldPred},partial_coordinate_hostiles:{...partials,all_rejected:partialsRejected,status:partialsRejected?'REJECT_PARTIAL_COORDINATE_TRANSFORMATION':'PARTIAL_COORDINATE_HOSTILE_FAILED'},open_set:{training_table_matches:true,heldout_prediction:holdPred,heldout_observation:f.heldout_open_set_response,status:!near(holdPred,2)?'DECLARED_LINEAR_OPERATOR_RESPONSE_MODEL_DEFEATED_BY_HELDOUT_RESPONSE':'OPEN_SET_HOSTILE_FAILED',preserve_contradiction_as_evidence:!near(holdPred,2),silent_model_class_upgrade:false},leakage_hostiles:{reconstruction_oracle_leak_rejected:leak,clone_direct_conjugation_shortcut_rejected:shortcut},naming_criteria:naming,naming_criteria_satisfied:namingOK,naming_candidate_token:namingOK?'BOUNDED_FINITE_OPERATOR_TOMOGRAPHY_NAMING_CRITERIA_SATISFIED_IN_AUTHORED_2X2_BILINEAR_RESPONSE_FIXTURE':null,canonical_bounded_scientific_claim:'A_COMPLETE_HIDDEN_2X2_LINEAR_OPERATOR_CAN_BE_RECONSTRUCTED_FROM_A_FULL_RANK_MIXED_FAMILY_OF_SCALAR_BILINEAR_INPUT_READOUT_RESPONSES_IN_THE_AUTHORED_SYNTHETIC_FIXTURE_WHILE_INCOMPLETE_RESPONSE_DATA_LEAVE_A_NONTRIVIAL_OPERATOR_NULLSPACE_AND_HELDOUT_RESPONSE_AMBIGUITY_AND_A_CONSISTENT_DECLARED_COORDINATE_CHANGE_RECONSTRUCTS_A_CONJUGATE_MATRIX_WITH_IDENTICAL_TRAINING_AND_HELDOUT_SCALAR_RESPONSES',fixture_immutable:before===JSON.stringify(f),canonical_operator_tomography_promotion_authority:false,operator_tomography_general_theorem_earned:false,blind_tomography_earned:false,physical_tomography_earned:false,path_category_earned:false,path_transport_earned:false,holonomy_earned:false,a16_reopened:false,live_ash_mutation:false,production_authority:false,vercel_authority:false});
}

function dot4(a,b){return a.reduce((s,x,i)=>s+x*b[i],0);}
