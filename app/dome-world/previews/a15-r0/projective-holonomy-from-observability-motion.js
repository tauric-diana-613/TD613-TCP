export const PROJECTIVE_HOLONOMY_OBSERVABILITY_SCHEMA = 'td613.aia.projective-holonomy-from-observability-motion/v0.1';
export const PROJECTIVE_HOLONOMY_OBSERVABILITY_SPEC_HEAD = '0476aaf88fb3299f50c7f6d012d8eb580e4a4817';
export const MODULUS = 31;

const H_ORACLE=Object.freeze([[3,5],[1,2]].map(row=>Object.freeze(row)));
const INPUTS=Object.freeze([[1,3],[1,7],[1,11],[1,19]].map(row=>Object.freeze(row)));
const K=Object.freeze([[2,1],[1,1]].map(row=>Object.freeze(row)));
const SCALE_CLONE=7;

function freeze(value){if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
function mod(v){return ((Number(v)%MODULUS)+MODULUS)%MODULUS;}
function inv(v){const a=mod(v);if(a===0)throw new Error('zero inverse');for(let k=1;k<MODULUS;k+=1)if(mod(a*k)===1)return k;throw new Error('inverse missing');}
function rowMatrix(row,matrix){return freeze(matrix[0].map((_,j)=>mod(row.reduce((s,v,i)=>s+v*matrix[i][j],0))));}
function matrixMultiply(left,right){return freeze(left.map(row=>right[0].map((_,j)=>mod(row.reduce((s,v,i)=>s+v*right[i][j],0)))));}
function determinant2(matrix){return mod(matrix[0][0]*matrix[1][1]-matrix[0][1]*matrix[1][0]);}
function inverse2(matrix){const s=inv(determinant2(matrix));return freeze([[mod(s*matrix[1][1]),mod(-s*matrix[0][1])],[mod(-s*matrix[1][0]),mod(s*matrix[0][0])]]);}
function matrixEqual(a,b){return JSON.stringify(a)===JSON.stringify(b);}

export function normalizeProjective(row){
  const [a,b]=row.map(mod);
  if(a!==0){const s=inv(a);return freeze([1,mod(b*s)]);}
  if(b!==0)return freeze([0,1]);
  throw new Error('zero row has no projective direction');
}

function correspondenceRow(input,output){
  const [x,y]=input,[u,v]=output;
  return freeze([mod(-v*x),mod(u*x),mod(-v*y),mod(u*y)]);
}

function rrefWithPivots(matrix){
  const work=matrix.map(row=>row.map(mod));
  const pivots=[];let r=0;
  for(let c=0;c<work[0].length&&r<work.length;c+=1){
    let pivot=r;while(pivot<work.length&&work[pivot][c]===0)pivot+=1;
    if(pivot===work.length)continue;
    [work[r],work[pivot]]=[work[pivot],work[r]];
    const s=inv(work[r][c]);for(let j=c;j<work[r].length;j+=1)work[r][j]=mod(work[r][j]*s);
    for(let rr=0;rr<work.length;rr+=1){if(rr===r)continue;const f=work[rr][c];if(f===0)continue;for(let j=c;j<work[rr].length;j+=1)work[rr][j]=mod(work[rr][j]-f*work[r][j]);}
    pivots.push(c);r+=1;
  }
  return {rref:work,pivots};
}
function nullspace(matrix){
  const {rref,pivots}=rrefWithPivots(matrix);const n=matrix[0].length;const freeCols=[];
  for(let c=0;c<n;c+=1)if(!pivots.includes(c))freeCols.push(c);
  const basis=[];
  for(const free of freeCols){const v=Array(n).fill(0);v[free]=1;pivots.forEach((pc,ri)=>{v[pc]=mod(-rref[ri][free]);});basis.push(freeze(v));}
  return freeze({rank:pivots.length,dimension:basis.length,basis:freeze(basis)});
}
function vectorMatrix(v){return freeze([[v[0],v[1]],[v[2],v[3]]]);}
function matrixVector(m){return freeze([m[0][0],m[0][1],m[1][0],m[1][1]]);}
function canonicalProjectiveVector(v){
  const first=v.find(value=>mod(value)!==0);if(first===undefined)throw new Error('zero projective matrix');const s=inv(first);return freeze(v.map(value=>mod(value*s)));
}
function canonicalProjectiveMatrix(m){return vectorMatrix(canonicalProjectiveVector(matrixVector(m)));}
function projectivelyEqualMatrices(a,b){return matrixEqual(canonicalProjectiveMatrix(a),canonicalProjectiveMatrix(b));}
function linearCombination(basis,coeffs){const out=[0,0,0,0];basis.forEach((v,i)=>v.forEach((x,j)=>{out[j]=mod(out[j]+coeffs[i]*x);}));return out;}
function enumerateCoefficients(dimension){const out=[];function walk(prefix){if(prefix.length===dimension){out.push(prefix);return;}for(let k=0;k<MODULUS;k+=1)walk([...prefix,k]);}walk([]);return out;}
function correspondenceSatisfied(matrix,input,output){return JSON.stringify(normalizeProjective(rowMatrix(input,matrix)))===JSON.stringify(output);}

function solveCorrespondences(pairs){
  const constraints=pairs.map(pair=>correspondenceRow(pair.input,pair.output));
  const ns=nullspace(constraints);
  return freeze({constraints:freeze(constraints),constraint_rank:ns.rank,nullspace_dimension:ns.dimension,nullspace_basis:ns.basis});
}

function twoPairWitness(pairs,heldoutInputs){
  const solve=solveCorrespondences(pairs);const seen=new Set();const candidates=[];
  for(const coeffs of enumerateCoefficients(solve.nullspace_dimension)){
    const vector=linearCombination(solve.nullspace_basis,coeffs);
    if(vector.every(v=>v===0))continue;
    const matrix=vectorMatrix(vector);if(determinant2(matrix)===0)continue;
    const canonical=canonicalProjectiveMatrix(matrix);const key=JSON.stringify(canonical);if(seen.has(key))continue;seen.add(key);
    if(!pairs.every(pair=>correspondenceSatisfied(canonical,pair.input,pair.output)))continue;
    candidates.push(freeze({matrix:canonical,heldout_predictions:freeze(heldoutInputs.map(input=>normalizeProjective(rowMatrix(input,canonical))))}));
    if(candidates.length>=2&&JSON.stringify(candidates[0].heldout_predictions)!==JSON.stringify(candidates[1].heldout_predictions))break;
  }
  return freeze({...solve,materialized_distinct_projective_candidates:freeze(candidates),underidentified:candidates.length>=2&&JSON.stringify(candidates[0].heldout_predictions)!==JSON.stringify(candidates[1].heldout_predictions)});
}

function reconstructUniqueProjective(pairs){
  const solve=solveCorrespondences(pairs);
  let recovered=null;
  if(solve.nullspace_dimension===1){const matrix=vectorMatrix(solve.nullspace_basis[0]);if(determinant2(matrix)!==0)recovered=canonicalProjectiveMatrix(matrix);}
  return freeze({...solve,recovered_projective_matrix:recovered,recovered_invertible:recovered!==null});
}

export function runProjectiveHolonomyFromObservabilityMotionAssay(){
  const rawOutputs=INPUTS.map(input=>rowMatrix(input,H_ORACLE));
  const outputs=rawOutputs.map(normalizeProjective);
  const pairs=INPUTS.map((input,index)=>freeze({input,output:outputs[index]}));

  const two=twoPairWitness(pairs.slice(0,2),INPUTS.slice(2));
  const three=reconstructUniqueProjective(pairs.slice(0,3));
  const heldoutPrediction=three.recovered_projective_matrix?normalizeProjective(rowMatrix(INPUTS[3],three.recovered_projective_matrix)):null;
  const oracleCanonical=canonicalProjectiveMatrix(H_ORACLE);

  const [u,v]=outputs[3];
  const hostileOutput=u!==0?normalizeProjective([u,mod(v+1)]):normalizeProjective([mod(u+1),v]);
  const hostile=reconstructUniqueProjective([...pairs.slice(0,3),freeze({input:INPUTS[3],output:hostileOutput})]);

  const KInverse=inverse2(K);const gaugeH=matrixMultiply(K,matrixMultiply(H_ORACLE,KInverse));
  const gaugeInputs=INPUTS.map(input=>rowMatrix(input,KInverse));
  const gaugeOutputs=rawOutputs.map(output=>normalizeProjective(rowMatrix(output,KInverse)));
  const gaugePairs=gaugeInputs.map((input,index)=>freeze({input,output:gaugeOutputs[index]}));
  const gaugeThree=reconstructUniqueProjective(gaugePairs.slice(0,3));
  const gaugeHeldoutPrediction=gaugeThree.recovered_projective_matrix?normalizeProjective(rowMatrix(gaugeInputs[3],gaugeThree.recovered_projective_matrix)):null;
  const gaugeOracleCanonical=canonicalProjectiveMatrix(gaugeH);

  const scaledOracle=freeze(H_ORACLE.map(row=>freeze(row.map(value=>mod(SCALE_CLONE*value)))));
  const scaleOutputs=INPUTS.map(input=>normalizeProjective(rowMatrix(input,scaledOracle)));
  const scaleInvariant=JSON.stringify(scaleOutputs)===JSON.stringify(outputs);

  const pass=two.constraint_rank===2&&two.nullspace_dimension===2&&two.underidentified&&
    three.constraint_rank===3&&three.nullspace_dimension===1&&three.recovered_invertible&&projectivelyEqualMatrices(three.recovered_projective_matrix,H_ORACLE)&&
    JSON.stringify(heldoutPrediction)===JSON.stringify(outputs[3])&&
    hostile.constraint_rank===4&&hostile.nullspace_dimension===0&&hostile.recovered_projective_matrix===null&&JSON.stringify(hostileOutput)!==JSON.stringify(outputs[3])&&
    gaugeThree.constraint_rank===3&&gaugeThree.nullspace_dimension===1&&gaugeThree.recovered_invertible&&projectivelyEqualMatrices(gaugeThree.recovered_projective_matrix,gaugeH)&&
    JSON.stringify(gaugeHeldoutPrediction)===JSON.stringify(gaugeOutputs[3])&&scaleInvariant;

  return freeze({
    schema:PROJECTIVE_HOLONOMY_OBSERVABILITY_SCHEMA,
    spec_head:PROJECTIVE_HOLONOMY_OBSERVABILITY_SPEC_HEAD,
    source_status:'SIMULATED',arithmetic_domain:'F_31',
    solver_firewall:freeze({oracle_matrix_exposed_to_solver:false,gauge_matrix_exposed_to_solver:false,oracle_identity_used_to_select_solution:false}),
    preregistered_inputs:INPUTS,
    derived_outputs:freeze(outputs),
    two_correspondence_control:two,
    three_correspondence_reconstruction:freeze({...three,canonical_oracle_comparison_after_reconstruction:oracleCanonical,oracle_projective_match:three.recovered_projective_matrix?projectivelyEqualMatrices(three.recovered_projective_matrix,H_ORACLE):false}),
    heldout_fourth:freeze({input:INPUTS[3],observed:outputs[3],predicted:heldoutPrediction,passes:JSON.stringify(heldoutPrediction)===JSON.stringify(outputs[3])}),
    contradictory_fourth:freeze({hostile_output:hostileOutput,...hostile,classification:hostile.nullspace_dimension===0?'PROJECTIVE_LOOP_MODEL_DEFEATED_BY_INCONSISTENT_OBSERVABILITY_CORRESPONDENCE':'HOSTILE_CORRESPONDENCE_DID_NOT_DEFEAT_MODEL'}),
    gauge_control:freeze({K_for_verification_only:K,H_prime_oracle:gaugeH,inputs:gaugeInputs,outputs:gaugeOutputs,reconstruction:gaugeThree,canonical_oracle_comparison_after_reconstruction:gaugeOracleCanonical,heldout_predicted:gaugeHeldoutPrediction,passes:gaugeThree.recovered_projective_matrix?projectivelyEqualMatrices(gaugeThree.recovered_projective_matrix,gaugeH)&&JSON.stringify(gaugeHeldoutPrediction)===JSON.stringify(gaugeOutputs[3]):false}),
    scale_control:freeze({lambda:SCALE_CLONE,scaled_oracle:scaledOracle,outputs:scaleOutputs,all_projective_outputs_identical:scaleInvariant,absolute_GL2_scale_identified:false}),
    findings:freeze({
      two_correspondences_underidentify_projective_loop_class:two.underidentified,
      three_correspondences_reconstruct_one_projective_loop_class:three.nullspace_dimension===1&&three.recovered_invertible,
      heldout_fourth_direction_predicted:JSON.stringify(heldoutPrediction)===JSON.stringify(outputs[3]),
      inconsistent_fourth_direction_defeats_projective_loop_model:hostile.nullspace_dimension===0,
      gauge_clone_reconstructs_conjugate_projective_loop_class:gaugeThree.recovered_projective_matrix?projectivelyEqualMatrices(gaugeThree.recovered_projective_matrix,gaugeH):false,
      projective_only_observations_do_not_identify_GL2_scale:scaleInvariant,
      assay_mechanism_validated:pass
    }),
    bounded_answer:pass?'IN_AUTHORED_F31_FIXTURE_THREE_GENERIC_INPUT_OUTPUT_READOUT_DIRECTION_CORRESPONDENCES_RECONSTRUCT_THE_PROJECTIVE_CLASS_OF_AN_EARNED_DISCRETE_LOOP_WHILE_TWO_CORRESPONDENCES_REMAIN_UNDERIDENTIFIED_A_HELDOUT_FOURTH_DIRECTION_IS_PREDICTED_AND_AN_INCONSISTENT_FOURTH_CORRESPONDENCE_DEFEATS_THE_MODEL':'PROJECTIVE_HOLONOMY_FROM_OBSERVABILITY_MOTION_ASSAY_FAILED',
    research_label:pass?'PROJECTIVE_HOLONOMY_TOMOGRAPHY_FROM_OBSERVABILITY_MOTION':'NOT_EARNED',
    claim_ceiling:freeze({projective_holonomy_tomography_in_authored_F31_fixture:pass,absolute_GL2_scale:false,physical_holonomy:false,continuum_bundle:false,continuum_tomography:false,berry_structure:false,quantum_behavior:false,proto_loom:false,production_authority:false,vercel_authority:false}),
    promotion_authority:false,production_mutated:false,human_closure_required:true
  });
}
