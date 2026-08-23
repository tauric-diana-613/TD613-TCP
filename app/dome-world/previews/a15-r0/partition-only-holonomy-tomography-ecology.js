export const PARTITION_ONLY_HOLONOMY_TOMOGRAPHY_SCHEMA='td613.aia.partition-only-holonomy-tomography-ecology/v0.1';
export const PARTITION_ONLY_HOLONOMY_TOMOGRAPHY_SPEC_HEAD='5271b57d7138afaa3631dc561ce8882a50244bb7';
export const MODULUS=31;

const H=Object.freeze([[3,5],[1,2]].map(row=>Object.freeze(row)));
const INPUTS=Object.freeze([[1,3],[1,7],[1,11],[1,19]].map(row=>Object.freeze(row)));
const K=Object.freeze([[2,1],[1,1]].map(row=>Object.freeze(row)));
const SPARSE=Object.freeze([
 Object.freeze({id:'V_3_8',vector:Object.freeze([3,6])}),
 Object.freeze({id:'V_3_26',vector:Object.freeze([3,22])}),
 Object.freeze({id:'V_17_8',vector:Object.freeze([17,10])}),
 Object.freeze({id:'V_17_26',vector:Object.freeze([17,26])})
]);

function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}
function mod(v){return ((Number(v)%MODULUS)+MODULUS)%MODULUS;}
function inv(v){const a=mod(v);if(a===0)throw new Error('zero inverse');for(let k=1;k<MODULUS;k+=1)if(mod(a*k)===1)return k;throw new Error('inverse missing');}
function rowMatrix(r,m){return freeze(m[0].map((_,j)=>mod(r.reduce((s,v,i)=>s+v*m[i][j],0))));}
function matrixMultiply(a,b){return freeze(a.map(row=>b[0].map((_,j)=>mod(row.reduce((s,v,i)=>s+v*b[i][j],0)))));}
function matrixVector(m,v){return freeze(m.map(row=>mod(row.reduce((s,x,i)=>s+x*v[i],0))));}
function rowVector(r,v){return mod(r.reduce((s,x,i)=>s+x*v[i],0));}
function det2(m){return mod(m[0][0]*m[1][1]-m[0][1]*m[1][0]);}
function inv2(m){const s=inv(det2(m));return freeze([[mod(s*m[1][1]),mod(-s*m[0][1])],[mod(-s*m[1][0]),mod(s*m[0][0])]]);}
function normalize(r){const [a,b]=r.map(mod);if(a){const s=inv(a);return freeze([1,mod(b*s)]);}if(b)return freeze([0,1]);throw new Error('zero projective row');}
function matrixVector4(m){return freeze([m[0][0],m[0][1],m[1][0],m[1][1]]);}
function vectorMatrix4(v){return freeze([[v[0],v[1]],[v[2],v[3]]]);}
function canonicalMatrix(m){const v=matrixVector4(m);const first=v.find(x=>mod(x)!==0);const s=inv(first);return vectorMatrix4(v.map(x=>mod(x*s)));}
function matrixEqual(a,b){return JSON.stringify(a)===JSON.stringify(b);}

function projectiveDirections(){return freeze([...Array.from({length:31},(_,t)=>freeze([1,t])),freeze([0,1])]);}
function kernelEcology(){
 const states=[freeze({id:'ZERO',vector:freeze([0,0])})];
 for(let t=0;t<31;t+=1)states.push(freeze({id:`D_${t}`,vector:freeze([1,t])}));
 states.push(freeze({id:'D_inf',vector:freeze([0,1])}));
 return freeze(states);
}
function unlabeledPartition(readout,ecology){
 const buckets=new Map();
 for(const state of ecology){const value=rowVector(readout,state.vector);if(!buckets.has(value))buckets.set(value,[]);buckets.get(value).push(state.id);}
 const memberships=[...buckets.values()].map(ids=>freeze([...ids].sort())).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
 return freeze({memberships:freeze(memberships),scalar_labels_exposed:false});
}
function partitionKey(p){return JSON.stringify(p.memberships);}
function zeroBucket(partition){return partition.memberships.find(bucket=>bucket.includes('ZERO'))??null;}
function stateById(ecology,id){return ecology.find(state=>state.id===id);}
function decodeReadoutFromKernelPartition(partition,ecology){
 const zb=zeroBucket(partition);
 if(!zb)return freeze({status:'KERNEL_DECODER_UNAVAILABLE_WITHOUT_ZERO_ANCHOR',recovered:null});
 const nonzero=zb.filter(id=>id!=='ZERO');
 if(nonzero.length===0)return freeze({status:'KERNEL_DIRECTION_NOT_REPRESENTED_IN_CALIBRATION_ECOLOGY',recovered:null,zero_bucket:zb});
 if(nonzero.length!==1)return freeze({status:'KERNEL_DECODER_AMBIGUOUS_ZERO_BUCKET',recovered:null,zero_bucket:zb});
 const kernelState=stateById(ecology,nonzero[0]);
 const [x,y]=kernelState.vector;
 return freeze({status:'PROJECTIVE_READOUT_RECOVERED_FROM_ZERO_BUCKET',zero_bucket:zb,kernel_state_id:nonzero[0],kernel_vector:kernelState.vector,recovered:normalize([y,mod(-x)])});
}

function correspondenceRow(input,output){const [x,y]=input,[u,v]=output;return freeze([mod(-v*x),mod(u*x),mod(-v*y),mod(u*y)]);}
function rref(matrix){const w=matrix.map(row=>row.map(mod));const piv=[];let r=0;for(let c=0;c<w[0].length&&r<w.length;c+=1){let pr=r;while(pr<w.length&&w[pr][c]===0)pr+=1;if(pr===w.length)continue;[w[r],w[pr]]=[w[pr],w[r]];const s=inv(w[r][c]);for(let j=c;j<w[r].length;j+=1)w[r][j]=mod(w[r][j]*s);for(let rr=0;rr<w.length;rr+=1){if(rr===r)continue;const f=w[rr][c];if(!f)continue;for(let j=c;j<w[rr].length;j+=1)w[rr][j]=mod(w[rr][j]-f*w[r][j]);}piv.push(c);r+=1;}return {w,piv};}
function nullspace(matrix){const {w,piv}=rref(matrix),free=[];for(let c=0;c<4;c+=1)if(!piv.includes(c))free.push(c);const basis=[];for(const fc of free){const v=[0,0,0,0];v[fc]=1;piv.forEach((pc,ri)=>v[pc]=mod(-w[ri][fc]));basis.push(freeze(v));}return freeze({rank:piv.length,dimension:basis.length,basis:freeze(basis)});}
function reconstructProjective(inputs,outputs){const rows=inputs.map((input,i)=>correspondenceRow(input,outputs[i]));const ns=nullspace(rows);let matrix=null;if(ns.dimension===1){const m=vectorMatrix4(ns.basis[0]);if(det2(m)!==0)matrix=canonicalMatrix(m);}return freeze({constraint_rank:ns.rank,nullspace_dimension:ns.dimension,recovered:matrix});}

export function runPartitionOnlyHolonomyTomographyEcologyAssay(){
 const directions=projectiveDirections();const ecology=kernelEcology();const oracleOutputs=INPUTS.map(q=>normalize(rowMatrix(q,H)));
 const sparseDiagnostics=oracleOutputs.map(output=>{const target=unlabeledPartition(output,SPARSE);const aliases=directions.filter(direction=>partitionKey(unlabeledPartition(direction,SPARSE))===partitionKey(target));return freeze({target_direction:output,partition:target,compatible_projective_directions:freeze(aliases),compatible_direction_count:aliases.length});});

 const exhaustive=directions.map(direction=>{const partition=unlabeledPartition(direction,ecology);const decoded=decodeReadoutFromKernelPartition(partition,ecology);return freeze({direction,zero_bucket:zeroBucket(partition),decoded:decoded.recovered,passes:JSON.stringify(decoded.recovered)===JSON.stringify(direction)});});
 const exhaustivePass=exhaustive.length===32&&exhaustive.every(item=>item.passes&&item.zero_bucket.length===2);

 const postPartitions=oracleOutputs.map(output=>unlabeledPartition(output,ecology));
 const recoveredOutputs=postPartitions.map(partition=>decodeReadoutFromKernelPartition(partition,ecology).recovered);
 const primary=reconstructProjective(INPUTS.slice(0,3),recoveredOutputs.slice(0,3));
 const predictedFourth=primary.recovered?normalize(rowMatrix(INPUTS[3],primary.recovered)):null;
 const heldoutPass=JSON.stringify(predictedFourth)===JSON.stringify(recoveredOutputs[3]);
 const oracleMatch=primary.recovered?matrixEqual(primary.recovered,canonicalMatrix(H)):false;

 const noZero=freeze(ecology.filter(state=>state.id!=='ZERO'));
 const noZeroPartition=unlabeledPartition(oracleOutputs[0],noZero);
 const noZeroDecode=decodeReadoutFromKernelPartition(noZeroPartition,noZero);

 const ablations=directions.map(direction=>{
   const partition=unlabeledPartition(direction,ecology);const decoded=decodeReadoutFromKernelPartition(partition,ecology);const kernelId=decoded.kernel_state_id;
   const ablated=freeze(ecology.filter(state=>state.id!==kernelId));const ablatedPartition=unlabeledPartition(direction,ablated);const ablatedDecode=decodeReadoutFromKernelPartition(ablatedPartition,ablated);
   return freeze({direction,removed_state_id:kernelId,zero_bucket:zeroBucket(ablatedPartition),decoder_status:ablatedDecode.status,passes:JSON.stringify(zeroBucket(ablatedPartition))===JSON.stringify(['ZERO'])&&ablatedDecode.status==='KERNEL_DIRECTION_NOT_REPRESENTED_IN_CALIBRATION_ECOLOGY'});
 });
 const ablationPass=ablations.every(item=>item.passes);

 const KInverse=inv2(K),gaugeH=matrixMultiply(K,matrixMultiply(H,KInverse));const gaugeInputs=INPUTS.map(q=>rowMatrix(q,KInverse));
 const gaugeEcology=freeze(ecology.map(state=>freeze({id:state.id,vector:matrixVector(K,state.vector)})));
 let gaugePartitionPass=true;const gaugeRecovered=[];
 oracleOutputs.forEach((_,i)=>{
   const originalRaw=rowMatrix(INPUTS[i],H);const originalPartition=unlabeledPartition(originalRaw,ecology);
   const gaugeRaw=rowMatrix(gaugeInputs[i],gaugeH);const gaugePartition=unlabeledPartition(gaugeRaw,gaugeEcology);
   if(partitionKey(originalPartition)!==partitionKey(gaugePartition))gaugePartitionPass=false;
   gaugeRecovered.push(decodeReadoutFromKernelPartition(gaugePartition,gaugeEcology).recovered);
 });
 const gaugeExpected=INPUTS.map((q,i)=>normalize(rowMatrix(rowMatrix(q,H),KInverse)));
 const gaugeDecoderPass=JSON.stringify(gaugeRecovered)===JSON.stringify(gaugeExpected);

 const pass=sparseDiagnostics.some(item=>item.compatible_direction_count>1)&&exhaustivePass&&primary.constraint_rank===3&&primary.nullspace_dimension===1&&oracleMatch&&heldoutPass&&noZeroDecode.status==='KERNEL_DECODER_UNAVAILABLE_WITHOUT_ZERO_ANCHOR'&&ablationPass&&gaugePartitionPass&&gaugeDecoderPass;

 return freeze({
   schema:PARTITION_ONLY_HOLONOMY_TOMOGRAPHY_SCHEMA,spec_head:PARTITION_ONLY_HOLONOMY_TOMOGRAPHY_SPEC_HEAD,source_status:'SIMULATED',arithmetic_domain:'F_31',
   scalar_label_firewall:freeze({partition_decoder_receives_scalar_values:false,zero_state_identity_available:true}),
   sparse_ecology:freeze({state_count:SPARSE.length,diagnostics:freeze(sparseDiagnostics),underidentification_observed:sparseDiagnostics.some(item=>item.compatible_direction_count>1)}),
   calibration_ecology:freeze({state_count:ecology.length,zero_anchor:'ZERO',projective_direction_representative_count:32,exhaustive_direction_decoder:freeze(exhaustive),all_32_directions_recovered:exhaustivePass}),
   partition_only_post_loop_recovery:freeze({partitions:freeze(postPartitions),recovered_output_directions:freeze(recoveredOutputs),oracle_output_directions:freeze(oracleOutputs),all_match:JSON.stringify(recoveredOutputs)===JSON.stringify(oracleOutputs)}),
   projective_loop_inverse:freeze({inputs:INPUTS.slice(0,3),decoded_outputs:freeze(recoveredOutputs.slice(0,3)),...primary,oracle_projective_match:oracleMatch,heldout_q4:INPUTS[3],heldout_decoded_direction:recoveredOutputs[3],heldout_predicted_direction:predictedFourth,heldout_pass:heldoutPass}),
   ecology_ablations:freeze({without_zero:freeze({decoder_status:noZeroDecode.status}),missing_each_kernel_representative:freeze(ablations),all_missing_kernel_ablations_refuse:ablationPass}),
   gauge_control:freeze({K_for_verification_only:K,H_prime:gaugeH,partition_memberships_preserved:gaugePartitionPass,recovered_transformed_readout_directions:freeze(gaugeRecovered),expected_transformed_readout_directions:freeze(gaugeExpected),decoder_pass:gaugeDecoderPass}),
   findings:freeze({sparse_ecology_can_alias_many_projective_readout_directions:sparseDiagnostics.some(item=>item.compatible_direction_count>1),kernel_complete_ecology_recovers_all_32_projective_readout_directions_from_unlabeled_partitions:exhaustivePass,partition_only_readout_recovery_supports_projective_loop_reconstruction:oracleMatch&&heldoutPass,zero_anchor_and_kernel_direction_coverage_are_explicit_decoder_dependencies:noZeroDecode.status==='KERNEL_DECODER_UNAVAILABLE_WITHOUT_ZERO_ANCHOR'&&ablationPass,tomographic_identifiability_depends_on_observed_ecology_design_in_this_fixture:pass,assay_mechanism_validated:pass}),
   bounded_answer:pass?'IN_AUTHORED_F31_CALIBRATION_ECOLOGY_UNLABELED_PARTITION_MEMBERSHIP_WITH_A_ZERO_ANCHOR_AND_ONE_REPRESENTATIVE_OF_EACH_PROJECTIVE_STATE_DIRECTION_RECOVERS_PROJECTIVE_READOUT_DIRECTIONS_AND_THEREBY_SUPPORTS_RECONSTRUCTION_OF_THE_EARNED_DISCRETE_LOOP_CLASS_FROM_PARTITION_MOTION_ALONE':'PARTITION_ONLY_HOLONOMY_TOMOGRAPHY_ECOLOGY_ASSAY_FAILED',
   research_label:pass?'PARTITION_ONLY_PROJECTIVE_HOLONOMY_TOMOGRAPHY_VIA_CALIBRATION_ECOLOGY':'NOT_EARNED',
   claim_ceiling:freeze({partition_only_projective_holonomy_tomography_in_authored_calibration_ecology:pass,arbitrary_ecology_sufficiency:false,universal_ecological_optimality:false,physical_tomography:false,physical_holonomy:false,continuum_geometry:false,proto_loom:false,production_authority:false,vercel_authority:false}),
   promotion_authority:false,production_mutated:false,human_closure_required:true
 });
}
