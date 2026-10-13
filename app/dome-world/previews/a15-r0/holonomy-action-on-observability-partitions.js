export const HOLONOMY_OBSERVABILITY_ACTION_SCHEMA = 'td613.aia.holonomy-action-on-observability-partitions/v0.1';
export const HOLONOMY_OBSERVABILITY_SPEC_HEAD = '387cd57a3a3633377c287a9faefa973b9d5ee818';
export const MODULUS = 31;

const H = Object.freeze([[3,5],[1,2]].map(row=>Object.freeze(row)));
const I = Object.freeze([[1,0],[0,1]].map(row=>Object.freeze(row)));
const Q = Object.freeze([1,0]);
const X_VALUES = Object.freeze([3,17]);
const Z_VALUES = Object.freeze([8,26]);
const K = Object.freeze([[2,1],[1,1]].map(row=>Object.freeze(row)));
const U = Object.freeze([[1,1],[0,1]].map(row=>Object.freeze(row)));
const Q_INV = Object.freeze([0,1]);

function freeze(value) {
  if(value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

function mod(value) { return ((Number(value)%MODULUS)+MODULUS)%MODULUS; }
function scalarInverse(value) {
  const a=mod(value);
  if(a===0) throw new Error('zero has no inverse in F_31');
  for(let candidate=1;candidate<MODULUS;candidate+=1) if(mod(a*candidate)===1) return candidate;
  throw new Error('nonzero field element lacked inverse');
}
function matrixEqual(left,right) { return JSON.stringify(left)===JSON.stringify(right); }
function vectorEqual(left,right) { return JSON.stringify(left)===JSON.stringify(right); }

function matrixMultiply(left,right) {
  return freeze(left.map(row=>right[0].map((_,column)=>mod(row.reduce((sum,value,index)=>sum+value*right[index][column],0)))));
}
function matrixVector(matrix,vector) {
  return freeze(matrix.map(row=>mod(row.reduce((sum,value,index)=>sum+value*vector[index],0))));
}
function rowMatrix(row,matrix) {
  return freeze(matrix[0].map((_,column)=>mod(row.reduce((sum,value,index)=>sum+value*matrix[index][column],0))));
}
function rowVector(row,vector) { return mod(row.reduce((sum,value,index)=>sum+value*vector[index],0)); }
function determinant2(matrix) { return mod(matrix[0][0]*matrix[1][1]-matrix[0][1]*matrix[1][0]); }
function inverse2(matrix) {
  const determinant=determinant2(matrix);
  if(determinant===0) throw new Error('singular matrix');
  const scale=scalarInverse(determinant);
  return freeze([
    [mod(scale*matrix[1][1]),mod(-scale*matrix[0][1])],
    [mod(-scale*matrix[1][0]),mod(scale*matrix[0][0])]
  ]);
}

function buildCandidateFamily() {
  const qH=rowMatrix(Q,H);
  if(qH[1]===0) throw new Error('confirmatory Cartesian state construction became singular');
  const inverseSecond=scalarInverse(qH[1]);
  const candidates=[];
  for(const x of X_VALUES) {
    for(const z of Z_VALUES) {
      const y=mod((z-qH[0]*x)*inverseSecond);
      const vector=freeze([x,y]);
      candidates.push(freeze({
        candidate_id:`V_${x}_${z}`,
        x_claim:x,
        z_claim:z,
        vector,
        preregistered_pre_value:x,
        preregistered_post_value:z
      }));
    }
  }
  const distinct=new Set(candidates.map(candidate=>JSON.stringify(candidate.vector))).size===candidates.length;
  if(!distinct) throw new Error('confirmatory Cartesian state family collided');
  return freeze(candidates);
}

function partition(candidates,observation) {
  const buckets=new Map();
  for(const candidate of candidates) {
    const value=observation(candidate);
    const key=String(value);
    if(!buckets.has(key)) buckets.set(key,[]);
    buckets.get(key).push(candidate.candidate_id);
  }
  const canonical=[...buckets.entries()]
    .map(([value,members])=>freeze({ value:Number(value), members:freeze([...members].sort()) }))
    .sort((a,b)=>a.value-b.value);
  return freeze({
    bucket_count:canonical.length,
    bucket_sizes:freeze(canonical.map(bucket=>bucket.members.length).sort((a,b)=>a-b)),
    buckets:freeze(canonical)
  });
}

function bucketMap(partitionReceipt) {
  const map=new Map();
  for(const bucket of partitionReceipt.buckets) for(const member of bucket.members) map.set(member,bucket.value);
  return map;
}
function partitionEqual(left,right) { return JSON.stringify(left.buckets)===JSON.stringify(right.buckets); }
function refines(finer,coarser) {
  const coarse=bucketMap(coarser);
  return finer.buckets.every(bucket=>new Set(bucket.members.map(member=>coarse.get(member))).size===1);
}

function claimSufficiency(candidates,partitionReceipt,claimKey) {
  const byId=Object.fromEntries(candidates.map(candidate=>[candidate.candidate_id,candidate]));
  let witness=null;
  for(const bucket of partitionReceipt.buckets) {
    const values=new Map();
    for(const member of bucket.members) {
      const value=byId[member][claimKey];
      if(!values.has(value)) values.set(value,[]);
      values.get(value).push(member);
    }
    if(values.size>1 && witness===null) {
      const entries=[...values.entries()];
      witness=freeze({
        shared_observation_value:bucket.value,
        candidate_a:entries[0][1][0],
        claim_a:entries[0][0],
        candidate_b:entries[1][1][0],
        claim_b:entries[1][0]
      });
    }
  }
  return freeze({
    claim_key:claimKey,
    sufficient:witness===null,
    collision_witness:witness
  });
}

function profile(candidates,partitionReceipt) {
  return freeze({
    F_X:claimSufficiency(candidates,partitionReceipt,'x_claim'),
    F_Z:claimSufficiency(candidates,partitionReceipt,'z_claim')
  });
}

function transformCandidates(candidates,matrix) {
  return freeze(candidates.map(candidate=>freeze({ ...candidate, vector:matrixVector(matrix,candidate.vector) })));
}

export function runHolonomyActionOnObservabilityPartitionsHoldout() {
  const candidates=buildCandidateFamily();
  const determinantH=determinant2(H);
  const HInverse=inverse2(H);
  const qH=rowMatrix(Q,H);

  const QPre=partition(candidates,candidate=>rowVector(Q,candidate.vector));
  const QPost=partition(candidates,candidate=>rowVector(qH,candidate.vector));
  const preProfile=profile(candidates,QPre);
  const postProfile=profile(candidates,QPost);

  const flatReadout=rowMatrix(Q,I);
  const flatPartition=partition(candidates,candidate=>rowVector(flatReadout,candidate.vector));
  const flatProfile=profile(candidates,flatPartition);

  const restoredReadout=rowMatrix(qH,HInverse);
  const restoredPartition=partition(candidates,candidate=>rowVector(restoredReadout,candidate.vector));
  const restoredProfile=profile(candidates,restoredPartition);

  const KInverse=inverse2(K);
  const gaugeH=matrixMultiply(K,matrixMultiply(H,KInverse));
  const gaugeQ=rowMatrix(Q,KInverse);
  const gaugeCandidates=transformCandidates(candidates,K);
  const gaugeQH=rowMatrix(gaugeQ,gaugeH);
  const gaugePre=partition(gaugeCandidates,candidate=>rowVector(gaugeQ,candidate.vector));
  const gaugePost=partition(gaugeCandidates,candidate=>rowVector(gaugeQH,candidate.vector));
  const gaugePreProfile=profile(gaugeCandidates,gaugePre);
  const gaugePostProfile=profile(gaugeCandidates,gaugePost);

  const invariantBefore=partition(candidates,candidate=>rowVector(Q_INV,candidate.vector));
  const qInvU=rowMatrix(Q_INV,U);
  const invariantAfter=partition(candidates,candidate=>rowVector(qInvU,candidate.vector));

  const positiveIncomparability=!refines(QPre,QPost)&&!refines(QPost,QPre);
  const matchedGranularity=QPre.bucket_count===2&&QPost.bucket_count===2&&
    JSON.stringify(QPre.bucket_sizes)===JSON.stringify([2,2])&&
    JSON.stringify(QPost.bucket_sizes)===JSON.stringify([2,2]);
  const profileRotation=
    preProfile.F_X.sufficient===true&&preProfile.F_Z.sufficient===false&&
    postProfile.F_X.sufficient===false&&postProfile.F_Z.sufficient===true;
  const flatPass=vectorEqual(flatReadout,Q)&&partitionEqual(flatPartition,QPre)&&
    JSON.stringify(flatProfile)===JSON.stringify(preProfile);
  const reversePass=vectorEqual(restoredReadout,Q)&&partitionEqual(restoredPartition,QPre)&&
    JSON.stringify(restoredProfile)===JSON.stringify(preProfile);
  const gaugeValuesPass=candidates.every((candidate,index)=>
    rowVector(gaugeQ,gaugeCandidates[index].vector)===rowVector(Q,candidate.vector)&&
    rowVector(gaugeQH,gaugeCandidates[index].vector)===rowVector(qH,candidate.vector)
  );
  const gaugePass=determinant2(K)!==0&&gaugeValuesPass&&partitionEqual(gaugePre,QPre)&&partitionEqual(gaugePost,QPost)&&
    JSON.stringify(gaugePreProfile)===JSON.stringify(preProfile)&&JSON.stringify(gaugePostProfile)===JSON.stringify(postProfile);
  const invariantPass=!matrixEqual(U,I)&&vectorEqual(qInvU,Q_INV)&&partitionEqual(invariantBefore,invariantAfter)&&invariantBefore.bucket_count>=2;
  const candidateValuesPass=candidates.every(candidate=>
    rowVector(Q,candidate.vector)===candidate.preregistered_pre_value&&
    rowVector(qH,candidate.vector)===candidate.preregistered_post_value
  );

  const pass=determinantH===1&&!matrixEqual(H,I)&&candidateValuesPass&&matchedGranularity&&positiveIncomparability&&profileRotation&&flatPass&&reversePass&&gaugePass&&invariantPass;

  return freeze({
    schema:HOLONOMY_OBSERVABILITY_ACTION_SCHEMA,
    spec_head:HOLONOMY_OBSERVABILITY_SPEC_HEAD,
    source_status:'SIMULATED',
    arithmetic_domain:'F_31',
    development_pilot:freeze({ status:'DEVELOPMENT_ONLY_OFF_REPO_PILOT_NOT_CONFIRMATORY', x_values:freeze([6,14]), z_values:freeze([7,20]) }),
    earned_loop:freeze({ H, determinant:determinantH, inverse:HInverse, nonidentity:!matrixEqual(H,I) }),
    local_readout:freeze({ q:Q, q_after_loop:qH, readout_changed:!vectorEqual(Q,qH) }),
    candidate_family:candidates,
    positive:freeze({
      pre_partition:QPre,
      post_partition:QPost,
      matched_granularity:matchedGranularity,
      partitions_incomparable:positiveIncomparability,
      pre_claim_profile:preProfile,
      post_claim_profile:postProfile,
      claim_sufficiency_profile_rotated:profileRotation
    }),
    flat_control:freeze({
      H:I,
      post_readout:flatReadout,
      post_partition:flatPartition,
      post_claim_profile:flatProfile,
      unchanged:flatPass
    }),
    reverse_control:freeze({
      H_inverse:HInverse,
      restored_readout:restoredReadout,
      restored_partition:restoredPartition,
      restored_claim_profile:restoredProfile,
      restored_exactly:reversePass
    }),
    gauge_control:freeze({
      K,
      K_inverse:KInverse,
      H_prime:gaugeH,
      q_prime:gaugeQ,
      qH_prime:gaugeQH,
      pre_partition:gaugePre,
      post_partition:gaugePost,
      values_preserved:gaugeValuesPass,
      claim_profiles_preserved:gaugePass
    }),
    invariant_readout_control:freeze({
      U,
      nontrivial_loop:!matrixEqual(U,I),
      q_inv:Q_INV,
      q_inv_after_loop:qInvU,
      partition_before:invariantBefore,
      partition_after:invariantAfter,
      unchanged:invariantPass,
      classification:invariantPass?'NONTRIVIAL_LOOP_WITH_INVARIANT_READOUT_LEAVES_THAT_OBSERVATION_PARTITION_UNCHANGED':'INVARIANT_READOUT_CONTROL_FAILED'
    }),
    findings:freeze({
      fixed_readout_partition_changes_under_earned_nontrivial_loop:!partitionEqual(QPre,QPost),
      changed_partition_rotates_preregistered_claim_sufficiency_profile:profileRotation,
      flat_loop_leaves_partition_unchanged:flatPass,
      reverse_loop_restores_original_partition:reversePass,
      coordinate_gauge_clone_preserves_observation_values_and_licenses:gaugePass,
      nontrivial_loop_need_not_change_every_readout:invariantPass,
      assay_mechanism_validated:pass
    }),
    bounded_answer:pass
      ? 'IN_AUTHORED_FINITE_GL2_F31_FIXTURE_A_NONTRIVIAL_RECONSTRUCTED_CLOSED_LOOP_TRANSPORT_CHANGES_THE_PARTITION_INDUCED_BY_A_FIXED_LOCAL_READOUT_FROM_ONE_CLAIM_SUFFICIENCY_DIRECTION_TO_AN_INCOMPARABLE_ONE_WHILE_FLAT_REVERSE_GAUGE_AND_INVARIANT_READOUT_CONTROLS_BEHAVE_AS_PREREGISTERED'
      : 'HOLONOMY_ACTION_ON_OBSERVABILITY_PARTITIONS_HOLDOUT_FAILED',
    research_label:pass?'DISCRETE_HOLONOMY_ACTION_ON_CLAIM_RELATIVE_OBSERVABILITY':'NOT_EARNED',
    claim_ceiling:freeze({
      discrete_finite_holonomy_action_on_observability_partition:pass,
      universal_td613_aia_holonomy_law:false,
      physical_holonomy:false,
      physical_tomography:false,
      continuum_bundle:false,
      continuum_connection:false,
      continuum_curvature:false,
      information_geometric_tensor:false,
      berry_phase:false,
      berry_curvature:false,
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
