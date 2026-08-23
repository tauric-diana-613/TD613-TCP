import { conjugacyFingerprint, determinant2, mod } from './gauge-blind-gl2-f31-holonomy-conjugacy.js';

export const CLAIM_SUFFICIENCY_FACTORIZATION_SCHEMA = 'td613.pedagogue.claim-sufficiency-partition-factorization/v0.1';
export const CLAIM_SUFFICIENCY_SPEC_HEAD = '24f4b46794170f8b40feccd4e525f1f74a156f7e';

function freeze(value) {
  if(value && typeof value==='object' && !Object.isFrozen(value)) {
    for(const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}
function stableKey(value) { return JSON.stringify(value); }

function holdoutUniverse() {
  const out=[];
  for(const d of [5,7]) for(const b of [0,1]) {
    const matrix=freeze([[2,b],[0,d]].map(row=>Object.freeze(row)));
    out.push(freeze({ candidate_id:`B${b}_D${d}`, b, d, matrix, claim_value:conjugacyFingerprint(matrix).fingerprint }));
  }
  return freeze(out);
}

function partitionBy(items,keyFn) {
  const groups=new Map();
  for(const item of items) {
    const value=keyFn(item);
    const key=stableKey(value);
    if(!groups.has(key)) groups.set(key,{ value, members:[] });
    groups.get(key).members.push(item);
  }
  return freeze([...groups.values()].map((group,index)=>freeze({
    block_id:`B${index+1}`,
    value:group.value,
    member_ids:freeze(group.members.map(item=>item.candidate_id)),
    member_count:group.members.length
  })));
}

function buildClaimClassIndex(claimPartition) {
  const out={};
  for(const block of claimPartition) for(const id of block.member_ids) out[id]=block.block_id;
  return out;
}

function analyzeMeasurement({measurementId,evaluate},candidates,claimPartition) {
  const measurementPartition=partitionBy(candidates,candidate=>evaluate(candidate.matrix));
  const claimClassByCandidate=buildClaimClassIndex(claimPartition);
  const blockAnalysis=measurementPartition.map(block=>{
    const claimClasses=[...new Set(block.member_ids.map(id=>claimClassByCandidate[id]))];
    return freeze({
      measurement_block_id:block.block_id,
      outcome:block.value,
      member_ids:block.member_ids,
      member_count:block.member_count,
      claim_class_ids:freeze(claimClasses),
      claim_pure:claimClasses.length===1
    });
  });
  const allPure=blockAnalysis.every(block=>block.claim_pure);
  const factorMap={};
  let factorizationVerified=false;
  let collisionWitness=null;
  if(allPure) {
    for(const block of blockAnalysis) {
      const member=candidates.find(candidate=>candidate.candidate_id===block.member_ids[0]);
      factorMap[String(block.outcome)]=member.claim_value;
    }
    factorizationVerified=candidates.every(candidate=>stableKey(factorMap[String(evaluate(candidate.matrix))])===stableKey(candidate.claim_value));
  } else {
    for(const block of blockAnalysis) {
      if(block.claim_pure) continue;
      const members=block.member_ids.map(id=>candidates.find(candidate=>candidate.candidate_id===id));
      outer: for(let i=0;i<members.length;i+=1) {
        for(let j=i+1;j<members.length;j+=1) {
          if(stableKey(members[i].claim_value)!==stableKey(members[j].claim_value)) {
            collisionWitness=freeze({
              left_candidate_id:members[i].candidate_id,
              right_candidate_id:members[j].candidate_id,
              shared_measurement_value:evaluate(members[i].matrix),
              left_claim_value:members[i].claim_value,
              right_claim_value:members[j].claim_value
            });
            break outer;
          }
        }
      }
      if(collisionWitness) break;
    }
  }
  const bucketSizes=measurementPartition.map(block=>block.member_count).sort((a,b)=>a-b);
  return freeze({
    measurement_id:measurementId,
    scalar_observation_count:1,
    outcome_values:freeze(measurementPartition.map(block=>block.value).sort((a,b)=>a-b)),
    measurement_partition:measurementPartition,
    bucket_size_multiset:freeze(bucketSizes),
    all_buckets_claim_pure:allPure,
    partition_refines_claim_partition:allPure,
    factorization_exists:allPure && factorizationVerified,
    factor_map_g:allPure ? freeze(factorMap) : null,
    factorization_verified_on_every_candidate:allPure && factorizationVerified,
    collision_witness:collisionWitness
  });
}

function theoremCertificate() {
  return freeze({
    theorem_id:'FINITE_CLAIM_SUFFICIENCY_IFF_MEASUREMENT_PARTITION_REFINES_CLAIM_PARTITION_IFF_CLAIM_FACTORS_THROUGH_MEASUREMENT',
    domain:'FINITE_NONEMPTY_COMPATIBLE_SET_WITH_TOTAL_TARGET_CLAIM_AND_TOTAL_MEASUREMENT',
    implications:freeze({
      bucket_purity_to_factorization:freeze({
        construction:'for y in q(C), define g(y)=f(c) for any c with q(c)=y',
        well_defined_reason:'bucket purity makes f constant on q^-1(y)',
        conclusion:'g(q(c))=f(c) for every c in C'
      }),
      factorization_to_bucket_purity:freeze({
        premise:'q(c1)=q(c2)',
        chain:'f(c1)=g(q(c1))=g(q(c2))=f(c2)',
        conclusion:'f constant on every measurement fiber'
      }),
      bucket_purity_to_partition_refinement:'each q-fiber is contained in exactly one f-fiber',
      partition_refinement_to_bucket_purity:'containment of every q-block in an f-block makes f constant on each q-block',
      factor_map_uniqueness:'on q(C), every y has a nonempty fiber and any factor map must equal the common f-value on that fiber'
    }),
    finite_sampling_required:false,
    probabilistic_assumptions_required:false,
    category_theory_required:false
  });
}

export function runClaimSufficiencyPartitionFactorizationAssay() {
  const candidates=holdoutUniverse();
  const claimPartition=partitionBy(candidates,candidate=>candidate.claim_value);
  const aligned=analyzeMeasurement({measurementId:'Q_ALIGNED',evaluate:matrix=>mod(matrix[1][1])},candidates,claimPartition);
  const transverse=analyzeMeasurement({measurementId:'Q_TRANSVERSE',evaluate:matrix=>mod(matrix[0][1])},candidates,claimPartition);
  const matched=freeze({
    same_scalar_budget:aligned.scalar_observation_count===transverse.scalar_observation_count,
    same_outcome_count:aligned.outcome_values.length===transverse.outcome_values.length,
    same_bucket_size_multiset:stableKey(aligned.bucket_size_multiset)===stableKey(transverse.bucket_size_multiset)
  });
  const candidatePass=
    candidates.length===4 && candidates.every(candidate=>determinant2(candidate.matrix)!==0) &&
    claimPartition.length===2 && claimPartition.every(block=>block.member_count===2);
  const pass=
    candidatePass && Object.values(matched).every(Boolean) &&
    aligned.partition_refines_claim_partition && aligned.factorization_exists && aligned.factorization_verified_on_every_candidate &&
    !transverse.partition_refines_claim_partition && !transverse.factorization_exists && transverse.collision_witness!==null;

  return freeze({
    schema:CLAIM_SUFFICIENCY_FACTORIZATION_SCHEMA,
    spec_head:CLAIM_SUFFICIENCY_SPEC_HEAD,
    source_status:'SYMBOLIC_THEOREM_PLUS_SIMULATED_HOLDOUT',
    arithmetic_domain:'F_31',
    theorem_certificate:theoremCertificate(),
    holdout:freeze({
      candidate_count:candidates.length,
      candidates,
      target_claim_id:'CONJUGACY_FINGERPRINT',
      target_claim_partition:claimPartition,
      matched_measurement_geometry:matched,
      measurements:freeze({ aligned, transverse })
    }),
    findings:freeze({
      claim_sufficiency_equivalent_to_partition_refinement_and_factorization:pass,
      matched_bucket_cardinalities_can_have_different_claim_sufficiency:Object.values(matched).every(Boolean)&&aligned.factorization_exists&&!transverse.factorization_exists,
      claim_relative_partition_alignment_matters_beyond_bucket_cardinality:pass,
      assay_validated:pass
    }),
    bounded_answer:pass
      ? 'FINITE_CLAIM_SUFFICIENCY_IFF_MEASUREMENT_PARTITION_REFINES_CLAIM_PARTITION_IFF_CLAIM_FACTORS_THROUGH_MEASUREMENT'
      : 'CLAIM_SUFFICIENCY_PARTITION_FACTORIZATION_ASSAY_FAILED',
    matched_holdout_relation:pass
      ? 'IDENTICAL_MEASUREMENT_BUCKET_CARDINALITIES_CAN_HAVE_DIFFERENT_CLAIM_SUFFICIENCY_BECAUSE_PARTITION_ALIGNMENT_DIFFERS'
      : null,
    discrete_aia_candidate_relation:pass
      ? 'CLAIM_RELATIVE_ANISOTROPY_SAME_MEASUREMENT_GRANULARITY_DIFFERENT_PARTITION_ALIGNMENT_DIFFERENT_EPISTEMIC_ADEQUACY'
      : null,
    claim_ceiling:freeze({
      probabilistic_sufficiency:false,
      minimal_sufficient_statistic_theorem:false,
      shannon_information_optimality:false,
      fisher_information_geometry:false,
      physical_anisotropy:false,
      continuum_geometry:false,
      sheaf_structure:false,
      category_theory_structure:false,
      proto_loom:false,
      production_authority:false,
      vercel_authority:false
    }),
    promotion_authority:false,
    production_mutated:false,
    human_closure_required:true
  });
}
