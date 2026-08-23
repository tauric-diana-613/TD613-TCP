export const TASK_CONDITIONED_CALIBRATION_ECOLOGY_SCHEMA='td613.aia.task-conditioned-calibration-ecology-kernel-cover/v0.1';
export const TASK_CONDITIONED_CALIBRATION_ECOLOGY_SPEC_HEAD='c7f017d29f493df13c1c2ea50ed4a2978e3c179b';
export const MODULUS=31;

const TARGETS=Object.freeze([[1,7],[1,5],[1,13],[1,9]].map(row=>Object.freeze(row)));
const INPUTS=Object.freeze([[1,3],[1,7],[1,11],[1,19]].map(row=>Object.freeze(row)));
const H_ORACLE=Object.freeze([[3,5],[1,2]].map(row=>Object.freeze(row)));

function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}
function mod(v){return ((Number(v)%MODULUS)+MODULUS)%MODULUS;}
function inv(v){const a=mod(v);if(a===0)throw new Error('zero inverse');for(let k=1;k<MODULUS;k+=1)if(mod(a*k)===1)return k;throw new Error('inverse missing');}
function rowMatrix(r,m){return freeze(m[0].map((_,j)=>mod(r.reduce((s,x,i)=>s+x*m[i][j],0))));}
function rowVector(r,v){return mod(r.reduce((s,x,i)=>s+x*v[i],0));}
function det2(m){return mod(m[0][0]*m[1][1]-m[0][1]*m[1][0]);}
function normalize(r){const [a,b]=r.map(mod);if(a){const s=inv(a);return freeze([1,mod(b*s)]);}if(b)return freeze([0,1]);throw new Error('zero direction');}
function matrixVector4(m){return freeze([m[0][0],m[0][1],m[1][0],m[1][1]]);}
function vectorMatrix4(v){return freeze([[v[0],v[1]],[v[2],v[3]]]);}
function canonicalMatrix(m){const v=matrixVector4(m),first=v.find(x=>x!==0),s=inv(first);return vectorMatrix4(v.map(x=>mod(x*s)));}

function kernelRepresentative(readout){
 const [a,b]=readout.map(mod);
 if(b!==0)return freeze([1,mod(-a*inv(b))]);
 return freeze([0,1]);
}
function directionId(vector){const n=normalize(vector);return n[0]===0?'D_inf':`D_${n[1]}`;}
function makeState(vector){return freeze({id:directionId(vector),vector:normalize(vector)});}
function buildTaskEcology(targets=TARGETS){
 const reps=[];const seen=new Set();
 for(const target of targets){const rep=kernelRepresentative(target),key=JSON.stringify(rep);if(!seen.has(key)){seen.add(key);reps.push(makeState(rep));}}
 return freeze([freeze({id:'ZERO',vector:freeze([0,0])}),...reps]);
}
function partition(readout,ecology){
 const buckets=new Map();
 for(const state of ecology){const value=rowVector(readout,state.vector);if(!buckets.has(value))buckets.set(value,[]);buckets.get(value).push(state.id);}
 return freeze({memberships:freeze([...buckets.values()].map(ids=>freeze([...ids].sort())).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))))});
}
function zeroBucket(p){return p.memberships.find(bucket=>bucket.includes('ZERO'))??null;}
function decode(readoutPartition,ecology){
 const zb=zeroBucket(readoutPartition);if(!zb)return freeze({status:'KERNEL_DECODER_UNAVAILABLE_WITHOUT_ZERO_ANCHOR',recovered:null});
 const nz=zb.filter(id=>id!=='ZERO');if(nz.length===0)return freeze({status:'KERNEL_DIRECTION_NOT_REPRESENTED_IN_CALIBRATION_ECOLOGY',recovered:null,zero_bucket:zb});
 if(nz.length!==1)return freeze({status:'KERNEL_DECODER_AMBIGUOUS_ZERO_BUCKET',recovered:null,zero_bucket:zb});
 const state=ecology.find(s=>s.id===nz[0]);const [x,y]=state.vector;return freeze({status:'PROJECTIVE_READOUT_RECOVERED_FROM_ZERO_BUCKET',kernel_state_id:state.id,recovered:normalize([y,mod(-x)])});
}
function allDirections(){return freeze([...Array.from({length:31},(_,t)=>freeze([1,t])),freeze([0,1])]);}

function correspondenceRow(input,output){const [x,y]=input,[u,v]=output;return freeze([mod(-v*x),mod(u*x),mod(-v*y),mod(u*y)]);}
function rref(matrix){const w=matrix.map(row=>row.map(mod));const piv=[];let r=0;for(let c=0;c<4&&r<w.length;c+=1){let pr=r;while(pr<w.length&&w[pr][c]===0)pr+=1;if(pr===w.length)continue;[w[r],w[pr]]=[w[pr],w[r]];const s=inv(w[r][c]);for(let j=c;j<4;j+=1)w[r][j]=mod(w[r][j]*s);for(let rr=0;rr<w.length;rr+=1){if(rr===r)continue;const f=w[rr][c];if(!f)continue;for(let j=c;j<4;j+=1)w[rr][j]=mod(w[rr][j]-f*w[r][j]);}piv.push(c);r+=1;}return {w,piv};}
function nullspace(matrix){const {w,piv}=rref(matrix),free=[];for(let c=0;c<4;c+=1)if(!piv.includes(c))free.push(c);const basis=[];for(const fc of free){const v=[0,0,0,0];v[fc]=1;piv.forEach((pc,ri)=>v[pc]=mod(-w[ri][fc]));basis.push(freeze(v));}return freeze({rank:piv.length,dimension:basis.length,basis:freeze(basis)});}
function reconstruct(inputs,outputs){const ns=nullspace(inputs.map((input,i)=>correspondenceRow(input,outputs[i])));let m=null;if(ns.dimension===1){const candidate=vectorMatrix4(ns.basis[0]);if(det2(candidate)!==0)m=canonicalMatrix(candidate);}return freeze({rank:ns.rank,nullity:ns.dimension,recovered:m});}

export function runTaskConditionedCalibrationEcologyAssay(){
 const ecology=buildTaskEcology();const kernelStates=ecology.filter(s=>s.id!=='ZERO');
 const targetDecodes=TARGETS.map(target=>{const p=partition(target,ecology),d=decode(p,ecology);return freeze({target,partition:p,kernel_state_id:d.kernel_state_id,recovered:d.recovered,passes:JSON.stringify(d.recovered)===JSON.stringify(target)});});
 const distinctKernels=new Set(kernelStates.map(s=>JSON.stringify(s.vector))).size;
 const minimalCardinality=1+distinctKernels;

 const global=allDirections().map(direction=>{const d=decode(partition(direction,ecology),ecology);return freeze({direction,status:d.status,recovered:d.recovered,passes:d.recovered!==null&&JSON.stringify(d.recovered)===JSON.stringify(direction)});});
 const decodable=global.filter(x=>x.passes).length;

 const leaveOneOut=targetDecodes.map(item=>{
   const ablated=freeze(ecology.filter(s=>s.id!==item.kernel_state_id));
   const statuses=TARGETS.map(target=>{const d=decode(partition(target,ablated),ablated);return freeze({target,status:d.status,recovered:d.recovered});});
   const removedIndex=TARGETS.findIndex(target=>JSON.stringify(target)===JSON.stringify(item.target));
   const displacedFails=statuses[removedIndex].status==='KERNEL_DIRECTION_NOT_REPRESENTED_IN_CALIBRATION_ECOLOGY';
   const othersPass=statuses.every((status,index)=>index===removedIndex||JSON.stringify(status.recovered)===JSON.stringify(TARGETS[index]));
   return freeze({removed_kernel_state_id:item.kernel_state_id,target:item.target,statuses:freeze(statuses),displaced_target_fails:displacedFails,other_targets_remain_decodable:othersPass,passes:displacedFails&&othersPass});
 });

 const targetSorted=[...TARGETS].map(x=>[...x]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const displacedTarget=targetSorted[targetSorted.length-1];
 const displacedKernelId=directionId(kernelRepresentative(displacedTarget));
 const correctKernelIds=new Set(kernelStates.map(s=>s.id));
 const firstOutside=allDirections().map(makeState).find(state=>!correctKernelIds.has(state.id));
 const wrongEcology=freeze(ecology.filter(s=>s.id!==displacedKernelId).concat([firstOutside]));
 const wrongResults=TARGETS.map(target=>{const d=decode(partition(target,wrongEcology),wrongEcology);return freeze({target,status:d.status,recovered:d.recovered,passes:JSON.stringify(d.recovered)===JSON.stringify(target)});});

 const decodedTargets=targetDecodes.map(x=>x.recovered);const inverse=reconstruct(INPUTS.slice(0,3),decodedTargets.slice(0,3));
 const heldoutPrediction=inverse.recovered?normalize(rowMatrix(INPUTS[3],inverse.recovered)):null;
 const oracleCanonical=canonicalMatrix(H_ORACLE);const inversePass=inverse.rank===3&&inverse.nullity===1&&JSON.stringify(inverse.recovered)===JSON.stringify(oracleCanonical)&&JSON.stringify(heldoutPrediction)===JSON.stringify(decodedTargets[3]);

 const minimalityPass=ecology.length===minimalCardinality&&targetDecodes.every(x=>x.passes)&&leaveOneOut.every(x=>x.passes);
 const wrongPass=wrongEcology.length===ecology.length&&wrongResults.filter(x=>x.passes).length===3&&wrongResults.find(x=>JSON.stringify(x.target)===JSON.stringify(displacedTarget)).passes===false;
 const globalPass=decodable===distinctKernels&&decodable===4;
 const pass=distinctKernels===4&&ecology.length===5&&minimalityPass&&globalPass&&wrongPass&&inversePass;

 return freeze({
  schema:TASK_CONDITIONED_CALIBRATION_ECOLOGY_SCHEMA,spec_head:TASK_CONDITIONED_CALIBRATION_ECOLOGY_SPEC_HEAD,source_status:'DERIVATIONAL',arithmetic_domain:'F_31',decoder_class:'ZERO_BUCKET_KERNEL_DECODER',
  target_family:TARGETS,derived_kernel_states:freeze(kernelStates),task_ecology:ecology,distinct_target_kernel_count:distinctKernels,constructed_cardinality:ecology.length,decoder_class_lower_bound:minimalCardinality,
  target_decoding:freeze(targetDecodes),
  global_coverage:freeze({projective_direction_count:32,decodable_direction_count:decodable,undecodable_direction_count:32-decodable,coverage_fraction:'1/8',records:freeze(global)}),
  leave_one_kernel_out:freeze({records:freeze(leaveOneOut),all_pass:leaveOneOut.every(x=>x.passes)}),
  matched_size_wrong_ecology:freeze({displaced_target:freeze(displacedTarget),displaced_kernel_state_id:displacedKernelId,replacement_state:firstOutside,ecology:wrongEcology,results:freeze(wrongResults),passes:wrongPass}),
  partition_only_loop_reconstruction:freeze({...inverse,heldout_predicted:heldoutPrediction,heldout_decoded:decodedTargets[3],oracle_projective_match:JSON.stringify(inverse.recovered)===JSON.stringify(oracleCanonical),passes:inversePass}),
  findings:freeze({kernel_cover_ecology_is_cardinality_minimal_within_declared_decoder_class:minimalityPass,all_four_target_readouts_decode:targetDecodes.every(x=>x.passes),task_ecology_preserves_partition_only_projective_holonomy_tomography:inversePass,task_specialization_reduces_global_readout_coverage_to_one_eighth:globalPass,same_ecology_cardinality_does_not_guarantee_same_task_adequacy:wrongPass,assay_mechanism_validated:pass}),
  bounded_answer:pass?'FOR_THE_DECLARED_ZERO_BUCKET_DECODER_A_TASK_CONDITIONED_CALIBRATION_ECOLOGY_CONTAINING_ZERO_PLUS_ONE_REPRESENTATIVE_PER_DISTINCT_TARGET_KERNEL_IS_CARDINALITY_MINIMAL_FOR_THAT_TARGET_FAMILY_AND_PRESERVES_PARTITION_ONLY_PROJECTIVE_HOLONOMY_TOMOGRAPHY_WHILE_INTENTIONALLY_SACRIFICING_OUT_OF_TASK_READOUT_COVERAGE':'TASK_CONDITIONED_CALIBRATION_ECOLOGY_ASSAY_FAILED',
  research_label:pass?'TASK_CONDITIONED_TOMOGRAPHIC_ECOLOGY_DESIGN':'NOT_EARNED',
  claim_ceiling:freeze({minimality_within_declared_decoder_class:pass,universal_minimal_ecology:false,universal_ecological_optimality:false,physical_tomography:false,proto_loom:false,production_authority:false,vercel_authority:false}),
  promotion_authority:false,production_mutated:false,human_closure_required:true
 });
}
