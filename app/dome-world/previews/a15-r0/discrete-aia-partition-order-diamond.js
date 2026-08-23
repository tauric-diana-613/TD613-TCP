import { conjugacyFingerprint, determinant2, mod } from './gauge-blind-gl2-f31-holonomy-conjugacy.js';

export const DISCRETE_AIA_DIAMOND_SCHEMA = 'td613.aia.discrete-partition-order-diamond/v0.1';
export const DISCRETE_AIA_DIAMOND_SPEC_HEAD = '2d97d4a5683fd586309761e99f3d75e67e4b28de';

const PROBES = Object.freeze([
  Object.freeze({ probe_id:'Q_D', evaluate:matrix=>mod(matrix[1][1]) }),
  Object.freeze({ probe_id:'Q_B', evaluate:matrix=>mod(matrix[0][1]) }),
  Object.freeze({ probe_id:'Q_PAIR', evaluate:matrix=>mod(matrix[0][1]+matrix[1][1]) }),
  Object.freeze({ probe_id:'Q_BLIND', evaluate:matrix=>mod(matrix[0][0]) })
]);

const CLAIMS = Object.freeze([
  Object.freeze({ claim_id:'F_D', evaluate:matrix=>conjugacyFingerprint(matrix).fingerprint }),
  Object.freeze({ claim_id:'F_B', evaluate:matrix=>mod(matrix[0][1]) }),
  Object.freeze({ claim_id:'F_RAW', evaluate:matrix=>matrix })
]);

function freeze(value) {
  if(value && typeof value==='object' && !Object.isFrozen(value)) {
    for(const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}
function stableKey(value) { return JSON.stringify(value); }

function universe() {
  const out=[];
  for(const d of [11,18]) for(const b of [4,9]) {
    const matrix=freeze([[2,b],[0,d]].map(row=>Object.freeze(row)));
    out.push(freeze({ candidate_id:`B${b}_D${d}`, b, d, matrix }));
  }
  return freeze(out);
}

function partition(items,evaluate) {
  const groups=new Map();
  for(const item of items) {
    const value=evaluate(item.matrix);
    const key=stableKey(value);
    if(!groups.has(key)) groups.set(key,{ value, members:[] });
    groups.get(key).members.push(item.candidate_id);
  }
  return freeze([...groups.values()].map((group,index)=>freeze({
    block_id:`B${index+1}`,
    value:group.value,
    member_ids:freeze([...group.members]),
    member_count:group.members.length
  })));
}

function blockIndex(partitionBlocks) {
  const index={};
  for(const block of partitionBlocks) for(const id of block.member_ids) index[id]=block.block_id;
  return index;
}

function refines(fine,coarse) {
  const coarseIndex=blockIndex(coarse);
  for(const block of fine) {
    const coarseBlocks=new Set(block.member_ids.map(id=>coarseIndex[id]));
    if(coarseBlocks.size!==1) return false;
  }
  return true;
}

function collisionWitness(measurementPartition,claimPartition,candidates) {
  const claimIndex=blockIndex(claimPartition);
  for(const block of measurementPartition) {
    for(let i=0;i<block.member_ids.length;i+=1) {
      for(let j=i+1;j<block.member_ids.length;j+=1) {
        const left=block.member_ids[i], right=block.member_ids[j];
        if(claimIndex[left]!==claimIndex[right]) {
          const leftCandidate=candidates.find(item=>item.candidate_id===left);
          const rightCandidate=candidates.find(item=>item.candidate_id===right);
          return freeze({
            left_candidate_id:left,
            right_candidate_id:right,
            shared_measurement_block:block.block_id,
            shared_measurement_value:block.value,
            left_claim_block:claimIndex[left],
            right_claim_block:claimIndex[right],
            left_matrix:leftCandidate.matrix,
            right_matrix:rightCandidate.matrix
          });
        }
      }
    }
  }
  return null;
}

function cardinalityProfile(partitionBlocks) {
  const sizes=partitionBlocks.map(block=>block.member_count).sort((a,b)=>a-b);
  return freeze({
    scalar_measurement_count:1,
    outcome_count:partitionBlocks.length,
    bucket_size_multiset:freeze(sizes),
    minimum_bucket_size:Math.min(...sizes),
    maximum_bucket_size:Math.max(...sizes)
  });
}

export function runDiscreteAIAPartitionOrderDiamondHoldout() {
  const candidates=universe();
  const probePartitions=Object.fromEntries(PROBES.map(probe=>[probe.probe_id,partition(candidates,probe.evaluate)]));
  const claimPartitions=Object.fromEntries(CLAIMS.map(claim=>[claim.claim_id,partition(candidates,claim.evaluate)]));

  const refinementMatrix={};
  for(const left of PROBES) {
    refinementMatrix[left.probe_id]={};
    for(const right of PROBES) refinementMatrix[left.probe_id][right.probe_id]=refines(probePartitions[left.probe_id],probePartitions[right.probe_id]);
  }

  const sufficiencyMatrix={};
  const witnessLedger={};
  for(const probe of PROBES) {
    sufficiencyMatrix[probe.probe_id]={};
    witnessLedger[probe.probe_id]={};
    for(const claim of CLAIMS) {
      const sufficient=refines(probePartitions[probe.probe_id],claimPartitions[claim.claim_id]);
      sufficiencyMatrix[probe.probe_id][claim.claim_id]=sufficient;
      witnessLedger[probe.probe_id][claim.claim_id]=sufficient ? null : collisionWitness(probePartitions[probe.probe_id],claimPartitions[claim.claim_id],candidates);
    }
  }

  const profiles=Object.fromEntries(PROBES.map(probe=>[probe.probe_id,cardinalityProfile(probePartitions[probe.probe_id])]));
  const middleMatched=
    profiles.Q_D.scalar_measurement_count===profiles.Q_B.scalar_measurement_count &&
    profiles.Q_D.outcome_count===profiles.Q_B.outcome_count &&
    stableKey(profiles.Q_D.bucket_size_multiset)===stableKey(profiles.Q_B.bucket_size_multiset) &&
    profiles.Q_D.minimum_bucket_size===profiles.Q_B.minimum_bucket_size &&
    profiles.Q_D.maximum_bucket_size===profiles.Q_B.maximum_bucket_size;
  const middleIncomparable=!refinementMatrix.Q_D.Q_B && !refinementMatrix.Q_B.Q_D;
  const diamond=
    refinementMatrix.Q_PAIR.Q_D && refinementMatrix.Q_PAIR.Q_B &&
    refinementMatrix.Q_D.Q_BLIND && refinementMatrix.Q_B.Q_BLIND &&
    middleIncomparable;
  const expectedIncidence=
    !sufficiencyMatrix.Q_BLIND.F_D && !sufficiencyMatrix.Q_BLIND.F_B && !sufficiencyMatrix.Q_BLIND.F_RAW &&
    sufficiencyMatrix.Q_D.F_D && !sufficiencyMatrix.Q_D.F_B && !sufficiencyMatrix.Q_D.F_RAW &&
    !sufficiencyMatrix.Q_B.F_D && sufficiencyMatrix.Q_B.F_B && !sufficiencyMatrix.Q_B.F_RAW &&
    sufficiencyMatrix.Q_PAIR.F_D && sufficiencyMatrix.Q_PAIR.F_B && sufficiencyMatrix.Q_PAIR.F_RAW;
  const everyWithheldHasWitness=PROBES.every(probe=>CLAIMS.every(claim=>
    sufficiencyMatrix[probe.probe_id][claim.claim_id] || witnessLedger[probe.probe_id][claim.claim_id]!==null
  ));
  const rawSums=probePartitions.Q_PAIR.map(block=>block.value).sort((a,b)=>a-b);
  const candidatePass=
    candidates.length===4 && candidates.every(candidate=>determinant2(candidate.matrix)!==0) &&
    new Set(rawSums).size===4 && claimPartitions.F_D.length===2 && claimPartitions.F_B.length===2 && claimPartitions.F_RAW.length===4;
  const anisotropyCertificate=freeze({
    probe_pair:freeze(['Q_D','Q_B']),
    matched_scalar_cost:middleMatched,
    matched_outcome_count:profiles.Q_D.outcome_count===profiles.Q_B.outcome_count,
    matched_bucket_size_multiset:stableKey(profiles.Q_D.bucket_size_multiset)===stableKey(profiles.Q_B.bucket_size_multiset),
    partitions_incomparable:middleIncomparable,
    first_only_claim:'F_D',
    second_only_claim:'F_B',
    crossed_claim_sufficiency:sufficiencyMatrix.Q_D.F_D&&!sufficiencyMatrix.Q_B.F_D&&!sufficiencyMatrix.Q_D.F_B&&sufficiencyMatrix.Q_B.F_B,
    certified:middleMatched&&middleIncomparable&&sufficiencyMatrix.Q_D.F_D&&!sufficiencyMatrix.Q_B.F_D&&!sufficiencyMatrix.Q_D.F_B&&sufficiencyMatrix.Q_B.F_B
  });
  const pass=candidatePass&&diamond&&expectedIncidence&&everyWithheldHasWitness&&anisotropyCertificate.certified;

  return freeze({
    schema:DISCRETE_AIA_DIAMOND_SCHEMA,
    spec_head:DISCRETE_AIA_DIAMOND_SPEC_HEAD,
    source_status:'SIMULATED',
    arithmetic_domain:'F_31',
    candidate_universe:candidates,
    probe_partitions:freeze(probePartitions),
    claim_partitions:freeze(claimPartitions),
    cardinality_profiles:freeze(profiles),
    refinement_order:freeze({
      definition:'q1 >= q2 iff Pi_q1 refines Pi_q2 on the frozen candidate universe',
      matrix:freeze(refinementMatrix),
      diamond_present:diamond,
      middle_probes_incomparable:middleIncomparable
    }),
    claim_sufficiency_incidence:freeze({ matrix:freeze(sufficiencyMatrix), collision_witnesses:freeze(witnessLedger), every_withheld_cell_has_witness:everyWithheldHasWitness }),
    claim_relative_anisotropy_certificate:anisotropyCertificate,
    findings:freeze({
      discrete_partition_order_is_not_total:middleIncomparable,
      matched_cardinality_profile_does_not_determine_claim_adequacy:middleMatched&&anisotropyCertificate.crossed_claim_sufficiency,
      fine_probe_above_both_middle_directions:refinementMatrix.Q_PAIR.Q_D&&refinementMatrix.Q_PAIR.Q_B,
      blind_probe_below_both_middle_directions:refinementMatrix.Q_D.Q_BLIND&&refinementMatrix.Q_B.Q_BLIND,
      holdout_validated:pass
    }),
    bounded_answer:pass
      ? 'DISCRETE_AIA_PARTITION_ORDER_CONTAINS_MATCHED_COST_INCOMPARABLE_OBSERVATION_DIRECTIONS_IN_AUTHORED_HOLDOUT'
      : 'DISCRETE_AIA_PARTITION_ORDER_DIAMOND_HOLDOUT_FAILED',
    aia_candidate_formalization:pass
      ? 'A_DISCRETE_ANISOTROPIC_INFORMATION_ARCHITECTURE_CAN_BE_REPRESENTED_BY_A_NON_TOTAL_REFINEMENT_ORDER_OVER_OBSERVATION_PARTITIONS_TOGETHER_WITH_A_CLAIM_SUFFICIENCY_INCIDENCE_RELATION'
      : null,
    anti_scalar_relation:pass ? 'CARDINALITY_PROFILE_DOES_NOT_TOTAL_ORDER_CLAIM_ADEQUACY' : null,
    claim_ceiling:freeze({
      td613_general_aia_theorem:false,
      physical_anisotropy:false,
      tensor_anisotropy:false,
      fisher_geometry:false,
      continuum_information_geometry:false,
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
