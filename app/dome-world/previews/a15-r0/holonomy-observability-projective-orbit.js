export const HOLONOMY_OBSERVABILITY_ORBIT_SCHEMA = 'td613.aia.holonomy-observability-projective-orbit/v0.1';
export const HOLONOMY_OBSERVABILITY_ORBIT_SPEC_HEAD = '4fee38e59b2966c6bd1c8fa840fc8e2295e05a51';
export const MODULUS = 31;

const H = Object.freeze([[3,5],[1,2]].map(row=>Object.freeze(row)));
const I = Object.freeze([[1,0],[0,1]].map(row=>Object.freeze(row)));
const Q0 = Object.freeze([1,0]);
const K = Object.freeze([[2,1],[1,1]].map(row=>Object.freeze(row)));
const U = Object.freeze([[1,1],[0,1]].map(row=>Object.freeze(row)));
const Q_INV = Object.freeze([0,1]);
const CANDIDATES = Object.freeze([
  Object.freeze({candidate_id:'V_3_8',vector:Object.freeze([3,6]),x_claim:3,z_claim:8}),
  Object.freeze({candidate_id:'V_3_26',vector:Object.freeze([3,22]),x_claim:3,z_claim:26}),
  Object.freeze({candidate_id:'V_17_8',vector:Object.freeze([17,10]),x_claim:17,z_claim:8}),
  Object.freeze({candidate_id:'V_17_26',vector:Object.freeze([17,26]),x_claim:17,z_claim:26})
]);

function freeze(value) {
  if(value && typeof value==='object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
function mod(value){ return ((Number(value)%MODULUS)+MODULUS)%MODULUS; }
function scalarInverse(value){
  const a=mod(value);
  if(a===0) throw new Error('zero has no inverse');
  for(let k=1;k<MODULUS;k+=1) if(mod(a*k)===1) return k;
  throw new Error('inverse missing');
}
function rowMatrix(row,matrix){ return freeze(matrix[0].map((_,column)=>mod(row.reduce((sum,value,index)=>sum+value*matrix[index][column],0)))); }
function matrixMultiply(left,right){ return freeze(left.map(row=>right[0].map((_,column)=>mod(row.reduce((sum,value,index)=>sum+value*right[index][column],0))))); }
function matrixVector(matrix,vector){ return freeze(matrix.map(row=>mod(row.reduce((sum,value,index)=>sum+value*vector[index],0)))); }
function rowVector(row,vector){ return mod(row.reduce((sum,value,index)=>sum+value*vector[index],0)); }
function determinant2(matrix){ return mod(matrix[0][0]*matrix[1][1]-matrix[0][1]*matrix[1][0]); }
function inverse2(matrix){
  const det=determinant2(matrix);
  if(det===0) throw new Error('singular matrix');
  const scale=scalarInverse(det);
  return freeze([[mod(scale*matrix[1][1]),mod(-scale*matrix[0][1])],[mod(-scale*matrix[1][0]),mod(scale*matrix[0][0])]]);
}
function vectorEqual(a,b){ return JSON.stringify(a)===JSON.stringify(b); }

export function normalizeProjective(row){
  const [a,b]=row.map(mod);
  if(a===0) {
    if(b===0) throw new Error('zero covector has no projective direction');
    return freeze([0,1]);
  }
  const scale=scalarInverse(a);
  return freeze([1,mod(b*scale)]);
}

function partitionFor(row,candidates=CANDIDATES){
  const buckets=new Map();
  for(const candidate of candidates){
    const value=rowVector(row,candidate.vector);
    if(!buckets.has(value)) buckets.set(value,[]);
    buckets.get(value).push(candidate.candidate_id);
  }
  const labeled=[...buckets.entries()].map(([value,members])=>freeze({value,members:freeze([...members].sort())})).sort((a,b)=>a.value-b.value);
  const signature=[...labeled.map(bucket=>freeze([...bucket.members]))].sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
  return freeze({
    bucket_count:labeled.length,
    bucket_sizes:freeze(labeled.map(bucket=>bucket.members.length).sort((a,b)=>a-b)),
    labeled_buckets:freeze(labeled),
    membership_signature:freeze(signature)
  });
}
function partitionKey(partition){ return JSON.stringify(partition.membership_signature); }

function claimProfile(partition,candidates=CANDIDATES){
  const byId=Object.fromEntries(candidates.map(candidate=>[candidate.candidate_id,candidate]));
  const sufficient=claimKey=>partition.membership_signature.every(members=>new Set(members.map(member=>byId[member][claimKey])).size===1);
  return freeze({F_X:sufficient('x_claim'),F_Z:sufficient('z_claim')});
}

function enumerateProjectiveOrbit(Hmatrix,qStart){
  const records=[];
  const seen=new Map();
  let current=freeze([...qStart]);
  for(let k=0;k<=32;k+=1){
    const normalized=normalizeProjective(current);
    const key=JSON.stringify(normalized);
    if(seen.has(key)) return freeze({records:freeze(records),first_repeat_index:k,repeats_index:seen.get(key),repeated_direction:normalized});
    seen.set(key,k);
    const partition=partitionFor(current);
    records.push(freeze({
      k,
      raw_readout:current,
      projective_direction:normalized,
      partition,
      claim_profile:claimProfile(partition)
    }));
    current=rowMatrix(current,Hmatrix);
  }
  throw new Error('projective recurrence not found within P1(F31) bound');
}

function uniqueCount(records,keyFn){ return new Set(records.map(keyFn)).size; }
function transformCandidates(candidates,Kmatrix){ return freeze(candidates.map(candidate=>freeze({...candidate,vector:matrixVector(Kmatrix,candidate.vector)}))); }

export function runHolonomyObservabilityProjectiveOrbitAssay(){
  const orbit=enumerateProjectiveOrbit(H,Q0);
  const HInverse=inverse2(H);
  const projectiveOrbitLength=orbit.records.length;
  const uniquePartitions=uniqueCount(orbit.records,record=>partitionKey(record.partition));
  const uniqueProfiles=uniqueCount(orbit.records,record=>JSON.stringify(record.claim_profile));

  const partitionRecurrences=new Map();
  orbit.records.forEach(record=>{
    const key=partitionKey(record.partition);
    if(!partitionRecurrences.has(key)) partitionRecurrences.set(key,[]);
    partitionRecurrences.get(key).push(record.k);
  });
  const profileRecurrences=new Map();
  orbit.records.forEach(record=>{
    const key=JSON.stringify(record.claim_profile);
    if(!profileRecurrences.has(key)) profileRecurrences.set(key,[]);
    profileRecurrences.get(key).push(record.k);
  });

  const reverseChecks=orbit.records.map(record=>{
    const priorIndex=(record.k-1+projectiveOrbitLength)%projectiveOrbitLength;
    const reverseDirection=normalizeProjective(rowMatrix(record.raw_readout,HInverse));
    return freeze({k:record.k,expected_prior_index:priorIndex,reverse_direction:reverseDirection,passes:vectorEqual(reverseDirection,orbit.records[priorIndex].projective_direction)});
  });

  const flatOrbit=enumerateProjectiveOrbit(I,Q0);
  const invariantOrbit=enumerateProjectiveOrbit(U,Q_INV);

  const KInverse=inverse2(K);
  const gaugeH=matrixMultiply(K,matrixMultiply(H,KInverse));
  const gaugeQ0=rowMatrix(Q0,KInverse);
  const gaugeCandidates=transformCandidates(CANDIDATES,K);
  let gaugeCurrent=gaugeQ0;
  const gaugeRecords=[];
  let gaugeValuesPass=true;
  for(const record of orbit.records){
    const values=CANDIDATES.map((candidate,index)=>{
      const original=rowVector(record.raw_readout,candidate.vector);
      const gauge=rowVector(gaugeCurrent,gaugeCandidates[index].vector);
      if(original!==gauge) gaugeValuesPass=false;
      return gauge;
    });
    const partition=partitionFor(gaugeCurrent,gaugeCandidates);
    gaugeRecords.push(freeze({k:record.k,raw_readout:gaugeCurrent,observation_values:freeze(values),partition,claim_profile:claimProfile(partition,gaugeCandidates)}));
    gaugeCurrent=rowMatrix(gaugeCurrent,gaugeH);
  }
  const gaugeSequencePass=gaugeValuesPass&&gaugeRecords.every((record,index)=>
    partitionKey(record.partition)===partitionKey(orbit.records[index].partition)&&
    JSON.stringify(record.claim_profile)===JSON.stringify(orbit.records[index].claim_profile)
  );

  const profileSet=new Set(orbit.records.map(record=>JSON.stringify(record.claim_profile)));
  const allBooleanProfiles=['{"F_X":true,"F_Z":false}','{"F_X":false,"F_Z":true}','{"F_X":true,"F_Z":true}','{"F_X":false,"F_Z":false}'].every(profile=>profileSet.has(profile));
  const projectiveVsPartitionSeparated=projectiveOrbitLength>uniquePartitions;
  const pass=projectiveOrbitLength>1&&orbit.first_repeat_index===projectiveOrbitLength&&orbit.repeats_index===0&&
    reverseChecks.every(check=>check.passes)&&flatOrbit.records.length===1&&invariantOrbit.records.length===1&&
    gaugeSequencePass&&projectiveVsPartitionSeparated&&uniqueProfiles>1;

  return freeze({
    schema:HOLONOMY_OBSERVABILITY_ORBIT_SCHEMA,
    spec_head:HOLONOMY_OBSERVABILITY_ORBIT_SPEC_HEAD,
    source_status:'SIMULATED',
    arithmetic_domain:'F_31',
    inherited_loop:H,
    inherited_readout:Q0,
    projective_orbit:freeze({
      length:projectiveOrbitLength,
      first_repeat_index:orbit.first_repeat_index,
      repeats_index:orbit.repeats_index,
      repeated_direction:orbit.repeated_direction,
      records:orbit.records
    }),
    finite_candidate_partitions:freeze({
      unique_partition_count:uniquePartitions,
      recurrences:freeze([...partitionRecurrences.values()].map(indices=>freeze([...indices]))),
      projective_direction_count_exceeds_partition_count:projectiveVsPartitionSeparated
    }),
    claim_sufficiency_orbit:freeze({
      unique_claim_profile_count:uniqueProfiles,
      recurrences:freeze([...profileRecurrences.entries()].map(([profile,indices])=>freeze({profile:JSON.parse(profile),indices:freeze([...indices])}))),
      all_four_boolean_FX_FZ_profiles_visited:allBooleanProfiles
    }),
    reverse_control:freeze({H_inverse:HInverse,checks:freeze(reverseChecks),all_pass:reverseChecks.every(check=>check.passes)}),
    flat_control:freeze({orbit_length:flatOrbit.records.length,passes:flatOrbit.records.length===1}),
    invariant_readout_control:freeze({U,q_inv:Q_INV,orbit_length:invariantOrbit.records.length,passes:invariantOrbit.records.length===1}),
    gauge_control:freeze({K,K_inverse:KInverse,H_prime:gaugeH,q0_prime:gaugeQ0,records:freeze(gaugeRecords),observation_partition_and_claim_sequences_preserved:gaugeSequencePass}),
    findings:freeze({
      earned_loop_induces_nontrivial_projective_readout_orbit:projectiveOrbitLength>1,
      projectively_distinct_readouts_can_alias_to_same_finite_candidate_partition:projectiveVsPartitionSeparated,
      multiple_claim_sufficiency_regimes_occur_along_orbit:uniqueProfiles>1,
      all_four_boolean_two_claim_profiles_occur_in_this_frozen_candidate_family:allBooleanProfiles,
      reverse_action_traverses_orbit_backward:reverseChecks.every(check=>check.passes),
      flat_and_invariant_readout_nulls_have_trivial_orbits:flatOrbit.records.length===1&&invariantOrbit.records.length===1,
      gauge_clone_preserves_observation_partition_and_claim_sequences:gaugeSequencePass,
      assay_mechanism_validated:pass
    }),
    bounded_answer:pass
      ? 'EARNED_DISCRETE_LOOP_INDUCES_A_NONTRIVIAL_FINITE_PROJECTIVE_ORBIT_ON_LOCAL_READOUT_DIRECTIONS_AND_THE_ORBIT_TRAVERSES_MULTIPLE_CLAIM_RELATIVE_OBSERVABILITY_REGIMES_ON_THE_FROZEN_CANDIDATE_FAMILY'
      : 'HOLONOMY_OBSERVABILITY_PROJECTIVE_ORBIT_ASSAY_FAILED',
    claim_ceiling:freeze({
      discrete_projective_readout_orbit:pass,
      holonomy_group_order:false,
      gl2_element_order:false,
      physical_rotation:false,
      physical_holonomy:false,
      continuum_parallel_transport:false,
      information_geometric_tensor:false,
      berry_phase:false,
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
