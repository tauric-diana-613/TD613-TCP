export const ADMISSIBLE_BILINEAR_PROBE_SCHEMA='td613.a15-r0.aperture-pedagogue-admissible-bilinear-probe-geometry/v0.1';

const EPS=1e-10;
const A3=Object.freeze([[1,1,0,0],[0,0,1,1],[1,0,1,0]].map(Object.freeze));
const N=Object.freeze([1,-1,-1,1]);
const G=Object.freeze([[1,1],[0,1]].map(Object.freeze));
const CANDIDATES=Object.freeze([
  Object.freeze({candidate_id:'Q_UNRESTRICTED_TRACE',probe_cost:1,h:Object.freeze([1,0,0,1])}),
  Object.freeze({candidate_id:'Q_ADMISSIBLE_GOOD',probe_cost:1,r:Object.freeze([1,0]),x:Object.freeze([1,0])}),
  Object.freeze({candidate_id:'Q_ADMISSIBLE_BLIND',probe_cost:1,r:Object.freeze([1,1]),x:Object.freeze([0,1])})
]);

const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const clone=v=>structuredClone(v);
const near=(a,b,t=EPS)=>Math.abs(a-b)<=t;
const canonical=x=>Object.is(x,-0)?0:x;
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
const norm=a=>Math.sqrt(dot(a,a));
const m2=h=>[[h[0],h[1]],[h[2],h[3]]];
const det2=M=>M[0][0]*M[1][1]-M[0][1]*M[1][0];
const inv2=M=>{const d=det2(M);if(near(d,0))throw new Error('matrix must be invertible');return [[M[1][1]/d,-M[0][1]/d],[-M[1][0]/d,M[0][0]/d]];};
const mv=(M,x)=>M.map(r=>dot(r,x));
const rm=(r,M)=>[r[0]*M[0][0]+r[1]*M[1][0],r[0]*M[0][1]+r[1]*M[1][1]];

function rank(A){
  const R=A.map(r=>r.map(Number));let pr=0;
  for(let c=0;c<(R[0]?.length??0)&&pr<R.length;c++){
    let k=pr;for(let i=pr+1;i<R.length;i++)if(Math.abs(R[i][c])>Math.abs(R[k][c]))k=i;
    if(Math.abs(R[k][c])<=EPS)continue;[R[pr],R[k]]=[R[k],R[pr]];const q=R[pr][c];
    for(let j=c;j<R[pr].length;j++)R[pr][j]/=q;
    for(let i=0;i<R.length;i++){if(i===pr)continue;const f=R[i][c];if(Math.abs(f)<=EPS)continue;for(let j=c;j<R[i].length;j++)R[i][j]-=f*R[pr][j];}
    pr++;
  }
  return pr;
}

export function bilinearRow(r,x){return freeze([r[0]*x[0],r[0]*x[1],r[1]*x[0],r[1]*x[1]].map(canonical));}
export function coefficientAudit(candidate){
  const supplied=Array.isArray(candidate.h)?candidate.h.map(Number):null;
  const factored=Array.isArray(candidate.r)&&Array.isArray(candidate.x)?bilinearRow(candidate.r,candidate.x):null;
  const h=supplied??factored;
  if(!h||h.length!==4||h.some(v=>!Number.isFinite(v)))throw new TypeError('candidate must define a finite four-coordinate functional or a bilinear factorization');
  const determinant=det2(m2(h));
  const nonzero=norm(h)>EPS;
  const factorization_matches=!supplied||!factored||supplied.every((v,i)=>near(v,factored[i]));
  const admissible=nonzero&&near(determinant,0)&&Boolean(factored)&&factorization_matches;
  return freeze({h,coefficient_matrix:m2(h),determinant,nonzero,factorization_present:Boolean(factored),factorization_matches,admissible_as_one_declared_bilinear_probe:admissible});
}

export function nullspaceSensitivity(h,n){return Math.abs(dot(h,n))/norm(h);}
export function candidateAudit(candidate,n){
  if(!Array.isArray(n)||n.length!==4)throw new TypeError('current null direction must have four coordinates');
  const c=coefficientAudit(candidate),s=nullspaceSensitivity(c.h,n),newRank=rank([...A3,c.h]);
  return freeze({...candidate,coefficient:c,nullspace_dot:dot(c.h,n),normalized_nullspace_sensitivity:s,rank_after_probe:newRank,contracts_current_nullspace:newRank>rank(A3)});
}

export function unrestrictedGreedySelector(candidates,currentNullDirection){
  const audits=candidates.map(c=>candidateAudit(c,currentNullDirection)).sort((a,b)=>b.normalized_nullspace_sensitivity-a.normalized_nullspace_sensitivity||a.candidate_id.localeCompare(b.candidate_id));
  return freeze({selected_candidate_id:audits[0].candidate_id,selection_surface:'UNRESTRICTED_LINEAR_FUNCTIONALS',audits});
}

export function admissibilityAwareSelector(input){
  for(const key of ['T_star','future_responses','synthetic_oracle','answer_key'])if(key in input)throw new Error('REJECT_ORACLE_LEAKAGE_IN_ADMISSIBLE_PROBE_SELECTION');
  if(!Array.isArray(input.candidates)||!Array.isArray(input.current_null_direction))throw new TypeError('candidates and current null direction required');
  const audits=input.candidates.map(c=>candidateAudit(c,input.current_null_direction)),eligible=audits.filter(a=>a.coefficient.admissible_as_one_declared_bilinear_probe).sort((a,b)=>b.normalized_nullspace_sensitivity-a.normalized_nullspace_sensitivity||a.candidate_id.localeCompare(b.candidate_id));
  if(!eligible.length)return freeze({status:'NO_ADMISSIBLE_BILINEAR_PROBE',selected_candidate_id:null,audits});
  return freeze({status:'ADMISSIBLE_BILINEAR_PROBE_SELECTED_AFTER_ACTION_SET_FILTER',selected_candidate_id:eligible[0].candidate_id,audits});
}

export function transformBilinearProbe(candidate,H=G){
  if(!candidate.r||!candidate.x)throw new Error('coordinate transform requires declared bilinear factorization');
  const Hi=inv2(H),rPrime=rm(candidate.r,Hi),xPrime=mv(H,candidate.x),hPrime=bilinearRow(rPrime,xPrime);
  return freeze({candidate_id:`${candidate.candidate_id}_COORDINATE_CLONE`,probe_cost:candidate.probe_cost,r:rPrime,x:xPrime,h:hPrime,audit:coefficientAudit({r:rPrime,x:xPrime,h:hPrime})});
}

export function buildAdmissibleBilinearProbeFixture(){return freeze({schema:ADMISSIBLE_BILINEAR_PROBE_SCHEMA,A3:clone(A3),current_null_direction:clone(N),coordinate_transform:clone(G),candidates:clone(CANDIDATES)});}

export function runAdmissibleBilinearProbeGeometryGauntlet(){
  const fixture=buildAdmissibleBilinearProbeFixture(),before=JSON.stringify(fixture),audits=fixture.candidates.map(c=>candidateAudit(c,fixture.current_null_direction)),byId=Object.fromEntries(audits.map(a=>[a.candidate_id,a]));
  const unrestricted=unrestrictedGreedySelector(fixture.candidates,fixture.current_null_direction),corrected=admissibilityAwareSelector({candidates:fixture.candidates,current_null_direction:fixture.current_null_direction});
  const transformedGood=transformBilinearProbe(fixture.candidates.find(c=>c.candidate_id==='Q_ADMISSIBLE_GOOD'),fixture.coordinate_transform);
  let leakRejected=false;try{admissibilityAwareSelector({candidates:fixture.candidates,current_null_direction:fixture.current_null_direction,T_star:[[2,1],[1,3]]});}catch(e){leakRejected=/REJECT_ORACLE/.test(String(e.message));}
  const criteria=freeze({
    A1_inherited_rank3_nullspace:rank(fixture.A3)===3&&fixture.A3.every(r=>near(dot(r,fixture.current_null_direction),0)),
    A2_trace_informative:near(byId.Q_UNRESTRICTED_TRACE.nullspace_dot,2)&&byId.Q_UNRESTRICTED_TRACE.rank_after_probe===4,
    A3_trace_inadmissible:near(byId.Q_UNRESTRICTED_TRACE.coefficient.determinant,1)&&!byId.Q_UNRESTRICTED_TRACE.coefficient.admissible_as_one_declared_bilinear_probe,
    A4_good_admissible_and_contracts:byId.Q_ADMISSIBLE_GOOD.coefficient.admissible_as_one_declared_bilinear_probe&&byId.Q_ADMISSIBLE_GOOD.rank_after_probe===4&&near(byId.Q_ADMISSIBLE_GOOD.normalized_nullspace_sensitivity,1),
    A5_blind_admissible_and_blind:byId.Q_ADMISSIBLE_BLIND.coefficient.admissible_as_one_declared_bilinear_probe&&byId.Q_ADMISSIBLE_BLIND.rank_after_probe===3&&near(byId.Q_ADMISSIBLE_BLIND.normalized_nullspace_sensitivity,0),
    A6_unrestricted_selector_cheats:unrestricted.selected_candidate_id==='Q_UNRESTRICTED_TRACE'&&near(byId.Q_UNRESTRICTED_TRACE.normalized_nullspace_sensitivity,Math.SQRT2),
    A7_corrected_selector_filters_before_ranking:corrected.selected_candidate_id==='Q_ADMISSIBLE_GOOD',
    A8_coordinate_clone_stays_bilinear:transformedGood.audit.admissible_as_one_declared_bilinear_probe&&near(transformedGood.audit.determinant,0),
    A9_oracle_leakage_rejected:leakRejected,
    A10_fixture_immutable:before===JSON.stringify(fixture)
  });
  const passed=Object.values(criteria).every(Boolean);
  return freeze({schema:ADMISSIBLE_BILINEAR_PROBE_SCHEMA,inherited_state:{A3:fixture.A3,rank:rank(fixture.A3),null_direction:fixture.current_null_direction},candidate_audits:audits,unrestricted_selector:unrestricted,admissibility_aware_selector:corrected,coordinate_equivalence_control:transformedGood,naming_criteria:criteria,naming_criteria_satisfied:passed,canonical_bounded_scientific_claim:passed?'AN_UNRESTRICTED_LINEAR_FUNCTIONAL_ON_VEC_T_CAN_RESOLVE_THE_CURRENT_OPERATOR_NULLSPACE_WHILE_REMAINING_INADMISSIBLE_AS_ANY_SINGLE_DECLARED_BILINEAR_INPUT_READOUT_PROBE_AND_MATCHED_ACTION_COUNT_ADMISSIBLE_BILINEAR_PROBES_CAN_DIFFER_IN_NULLSPACE_CONTRACTION_IN_THE_AUTHORED_FINITE_FIXTURE':null,next_learning_action:passed?'HELD_FOR_MULTI_PROBE_COMPOSITION_PREREGISTRATION_AFTER_WITNESS_RECEIPT':null,general_optimal_experiment_design_earned:false,canonical_operator_tomography_promotion_authority:false,operator_tomography_general_theorem_earned:false,blind_tomography_earned:false,physical_tomography_earned:false,path_category_earned:false,path_transport_earned:false,holonomy_earned:false,curvature_earned:false,berry_structure_earned:false,quantum_behavior_earned:false,proto_loom_earned:false,a16_reopened:false,live_ash_mutation:false,merge_authority:false,production_authority:false,vercel_authority:false});
}
