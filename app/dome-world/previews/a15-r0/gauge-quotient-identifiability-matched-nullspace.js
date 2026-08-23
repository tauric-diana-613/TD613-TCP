import {
  conjugacyFingerprint,
  classifyPair,
  determinant2,
  rankMod
} from './gauge-blind-gl2-f31-holonomy-conjugacy.js';

export const GAUGE_QUOTIENT_IDENTIFIABILITY_SCHEMA = 'td613.ash.gauge-quotient-identifiability.matched-nullspace/v0.1';
export const GAUGE_QUOTIENT_SPEC_HEAD = 'fd62ca61c401576abaa88d8c0bcb808ba70d91d0';
export const MODULUS = 31;

const PROJECTION_ROWS = Object.freeze([
  Object.freeze([1,0,0,0]),
  Object.freeze([0,0,1,0]),
  Object.freeze([0,0,0,1])
]);

function freeze(value) {
  if(value && typeof value==='object' && !Object.isFrozen(value)) {
    for(const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

function familyFromObservedDiagonal({t11,t21,t22}) {
  return freeze(Array.from({length:MODULUS},(_,b)=>freeze([[t11,b],[t21,t22]].map(row=>Object.freeze(row)))));
}

function fingerprintKey(matrix) {
  const fp=conjugacyFingerprint(matrix);
  if(!fp.admitted) return 'OUTSIDE_GL2';
  return JSON.stringify(fp.fingerprint);
}

function partitionByFingerprint(family) {
  const groups=new Map();
  family.forEach((matrix,index)=>{
    const key=fingerprintKey(matrix);
    if(!groups.has(key)) groups.set(key,[]);
    groups.get(key).push(index);
  });
  return freeze([...groups.entries()].map(([key,indexes],classIndex)=>freeze({
    class_id:`C${classIndex+1}`,
    fingerprint:JSON.parse(key),
    member_indices:freeze(indexes),
    member_count:indexes.length
  })));
}

function positiveWitnesses(family) {
  const reference=family[0];
  return freeze(family.map((matrix,b)=>{
    if(b===0) return freeze({ b, reference:true, conjugate_to_reference:true, recovered_conjugator:null, coefficients_tested:0 });
    const result=classifyPair(reference,matrix);
    return freeze({
      b,
      reference:false,
      conjugate_to_reference:result.fingerprints_equal && result.invertible_conjugator_found && result.exact_conjugation_verified,
      recovered_conjugator:result.recovered_conjugator,
      coefficients_tested:result.coefficients_tested,
      complete_solution_family_materialized:result.complete_solution_family_materialized,
      search_terminated_on_witness:result.search_terminated_on_witness,
      oracle_conjugator_exposed_to_classifier:result.oracle_conjugator_exposed_to_classifier
    });
  }));
}

function compileArm(id,observed,{positive=false}={}) {
  const family=familyFromObservedDiagonal(observed);
  const invertibleFlags=family.map(matrix=>determinant2(matrix)!==0);
  const partition=partitionByFingerprint(family);
  const quotientIdentifiable=partition.length===1;
  const base={
    arm_id:id,
    projection_rows:PROJECTION_ROWS,
    projection_rank:rankMod(PROJECTION_ROWS),
    projection_nullity:4-rankMod(PROJECTION_ROWS),
    observed_coordinates:freeze({...observed}),
    unobserved_coordinate:'t12',
    compatible_family:family,
    compatible_matrix_count:family.length,
    all_compatible_matrices_invertible:invertibleFlags.every(Boolean),
    raw_operator_identifiable:family.length===1,
    conjugacy_partition:partition,
    conjugacy_class_count:partition.length,
    quotient_conjugacy_class_identifiable:quotientIdentifiable
  };
  if(positive) {
    const witnesses=positiveWitnesses(family);
    return freeze({
      ...base,
      reference_member_b:0,
      conjugacy_witnesses:witnesses,
      every_member_witnessed_conjugate_to_reference:witnesses.every(item=>item.conjugate_to_reference),
      classification:!base.raw_operator_identifiable && quotientIdentifiable && witnesses.every(item=>item.conjugate_to_reference)
        ? 'RAW_OPERATOR_UNIDENTIFIED_BUT_CONJUGACY_CLASS_IDENTIFIED'
        : 'POSITIVE_QUOTIENT_IDENTIFIABILITY_FAILED'
    });
  }
  const hostilePair=classifyPair(family[0],family[1]);
  return freeze({
    ...base,
    hostile_representatives:freeze({ b0:family[0], b1:family[1] }),
    hostile_representative_conjugacy:hostilePair,
    complete_nonconjugacy_search_exhausted:hostilePair.search_exhausted_without_witness===true,
    classification:!base.raw_operator_identifiable && !quotientIdentifiable && hostilePair.search_exhausted_without_witness && !hostilePair.invertible_conjugator_found
      ? 'RAW_OPERATOR_UNIDENTIFIED_AND_CONJUGACY_CLASS_UNIDENTIFIED'
      : 'HOSTILE_QUOTIENT_AMBIGUITY_FAILED'
  });
}

export function runGaugeQuotientIdentifiabilityMatchedNullspaceAssay() {
  const positive=compileArm('Q1_QUOTIENT_IDENTIFIABLE',{t11:2,t21:0,t22:5},{positive:true});
  const hostile=compileArm('Q2_QUOTIENT_UNIDENTIFIED',{t11:3,t21:0,t22:3});
  const matched=freeze({
    same_field_size:true,
    same_projection_rows:JSON.stringify(positive.projection_rows)===JSON.stringify(hostile.projection_rows),
    same_projection_rank:positive.projection_rank===hostile.projection_rank,
    same_projection_nullity:positive.projection_nullity===hostile.projection_nullity,
    same_compatible_matrix_count:positive.compatible_matrix_count===hostile.compatible_matrix_count,
    all_candidates_invertible:positive.all_compatible_matrices_invertible && hostile.all_compatible_matrices_invertible,
    same_unobserved_coordinate:positive.unobserved_coordinate===hostile.unobserved_coordinate
  });
  const pass=
    Object.values(matched).every(Boolean) &&
    positive.projection_rank===3 && positive.projection_nullity===1 && positive.compatible_matrix_count===31 &&
    !positive.raw_operator_identifiable && positive.conjugacy_class_count===1 && positive.quotient_conjugacy_class_identifiable &&
    positive.every_member_witnessed_conjugate_to_reference &&
    hostile.projection_rank===3 && hostile.projection_nullity===1 && hostile.compatible_matrix_count===31 &&
    !hostile.raw_operator_identifiable && hostile.conjugacy_class_count===2 && !hostile.quotient_conjugacy_class_identifiable &&
    hostile.complete_nonconjugacy_search_exhausted && !hostile.hostile_representative_conjugacy.invertible_conjugator_found;

  return freeze({
    schema:GAUGE_QUOTIENT_IDENTIFIABILITY_SCHEMA,
    spec_head:GAUGE_QUOTIENT_SPEC_HEAD,
    source_status:'SIMULATED',
    arithmetic_domain:'F_31',
    projection_aperture:freeze({ rows:PROJECTION_ROWS, rank:rankMod(PROJECTION_ROWS), nullity:4-rankMod(PROJECTION_ROWS), unobserved_coordinate:'t12' }),
    matched_budget:matched,
    arms:freeze({ positive, hostile }),
    findings:freeze({
      raw_operator_nonidentifiability_can_coexist_with_unique_conjugacy_class:positive.conjugacy_class_count===1 && !positive.raw_operator_identifiable,
      equal_raw_nullity_can_coexist_with_different_quotient_identifiability:positive.projection_nullity===hostile.projection_nullity && positive.quotient_conjugacy_class_identifiable!==hostile.quotient_conjugacy_class_identifiable,
      full_raw_reconstruction_not_necessary_for_declared_quotient_identifiability_in_authored_positive_family:pass,
      downstream_claim_must_be_constant_over_full_compatible_family:pass,
      assay_validated:pass
    }),
    bounded_answer:pass
      ? 'CONJUGACY_CLASS_CAN_BE_IDENTIFIABLE_WHILE_RAW_HOLONOMY_MATRIX_REMAINS_UNIDENTIFIED_IN_AUTHORED_GL2_F31_PROJECTION_FAMILY'
      : 'GAUGE_QUOTIENT_IDENTIFIABILITY_MATCHED_NULLSPACE_ASSAY_FAILED',
    candidate_research_rule:pass
      ? 'WITHHOLD_EVERY_DOWNSTREAM_QUANTITY_NOT_CONSTANT_ACROSS_THE_FULL_COMPATIBLE_FAMILY'
      : null,
    claim_ceiling:freeze({
      quotient_identifiability_candidate:pass,
      universal_quotient_inverse_problem_theorem:false,
      physical_gauge_redundancy:false,
      continuum_geometry:false,
      berry_structure:false,
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
