import {
  conjugacyFingerprint,
  determinant2,
  rankMod,
  mod
} from './gauge-blind-gl2-f31-holonomy-conjugacy.js';

export const COMPATIBLE_FAMILY_CLAIM_CONSTANCY_SCHEMA = 'td613.pedagogue.compatible-family-claim-constancy/v0.1';
export const CLAIM_CONSTANCY_SPEC_HEAD = 'e8c54c2ac5653741d91f9c8a0da2aa0b18ee7dea';
export const MODULUS = 31;

const I = Object.freeze([[1,0],[0,1]].map(row=>Object.freeze(row)));

function freeze(value) {
  if(value && typeof value==='object' && !Object.isFrozen(value)) {
    for(const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}
function matrixEqual(left,right) { return JSON.stringify(left)===JSON.stringify(right); }
function stableKey(value) { return JSON.stringify(value); }

function shiftedRankFromIdentity(matrix) {
  return rankMod(matrix.map((row,i)=>row.map((value,j)=>mod(value-(i===j?1:0)))));
}

function claimLibrary() {
  return freeze([
    freeze({ id:'RAW_MATRIX', evaluate:matrix=>matrix }),
    freeze({ id:'TRACE', evaluate:matrix=>mod(matrix[0][0]+matrix[1][1]) }),
    freeze({ id:'DETERMINANT', evaluate:matrix=>determinant2(matrix) }),
    freeze({ id:'DISCRIMINANT', evaluate:matrix=>{
      const trace=mod(matrix[0][0]+matrix[1][1]);
      const determinant=determinant2(matrix);
      return mod(trace*trace-4*determinant);
    }}),
    freeze({ id:'CONJUGACY_FINGERPRINT', evaluate:matrix=>conjugacyFingerprint(matrix).fingerprint }),
    freeze({ id:'LOOP_IS_IDENTITY', evaluate:matrix=>matrixEqual(matrix,I) }),
    freeze({ id:'RANK_H_MINUS_I', evaluate:matrix=>shiftedRankFromIdentity(matrix) }),
    freeze({ id:'REPEATED_ROOT_TYPE', evaluate:matrix=>{
      const fp=conjugacyFingerprint(matrix);
      return fp.repeated_root_type ?? 'NOT_REPEATED_ROOT';
    }})
  ]);
}

function familyQ1() {
  return freeze(Array.from({length:MODULUS},(_,b)=>freeze([[2,b],[0,5]].map(row=>Object.freeze(row)))));
}
function familyQ2() {
  return freeze(Array.from({length:MODULUS},(_,b)=>freeze([[3,b],[0,3]].map(row=>Object.freeze(row)))));
}

export function evaluateClaimOverFamily(claim,family) {
  const values=[];
  let domainComplete=true;
  let domainError=null;
  for(let index=0;index<family.length;index+=1) {
    try {
      const value=claim.evaluate(family[index]);
      if(value===undefined) throw new Error('claim evaluator returned undefined');
      values.push(freeze({ candidate_index:index, value }));
    } catch(error) {
      domainComplete=false;
      domainError=freeze({ candidate_index:index, message:String(error?.message??error) });
      break;
    }
  }
  if(!domainComplete) {
    return freeze({
      claim_id:claim.id,
      domain_complete:false,
      domain_error:domainError,
      identified:false,
      classification:'CLAIM_DOMAIN_INCOMPLETE_OVER_COMPATIBLE_FAMILY',
      distinct_value_count:null,
      distinct_values:null,
      counterexample:null
    });
  }
  const distinct=[];
  const firstByKey=new Map();
  for(const item of values) {
    const key=stableKey(item.value);
    if(!firstByKey.has(key)) {
      firstByKey.set(key,item);
      distinct.push(item.value);
    }
  }
  const identified=distinct.length===1;
  let counterexample=null;
  if(!identified) {
    const first=values[0];
    const different=values.find(item=>stableKey(item.value)!==stableKey(first.value));
    counterexample=freeze({
      left_candidate_index:first.candidate_index,
      right_candidate_index:different.candidate_index,
      left_value:first.value,
      right_value:different.value
    });
  }
  return freeze({
    claim_id:claim.id,
    domain_complete:true,
    domain_error:null,
    identified,
    classification:identified ? 'IDENTIFIED_OVER_COMPATIBLE_FAMILY' : 'WITHHELD_NONCONSTANT_OVER_COMPATIBLE_FAMILY',
    distinct_value_count:distinct.length,
    distinct_values:freeze(distinct),
    counterexample
  });
}

function compileFamilyLedger(familyId,family) {
  const claims=Object.fromEntries(claimLibrary().map(claim=>[claim.id,evaluateClaimOverFamily(claim,family)]));
  return freeze({
    family_id:familyId,
    compatible_family_size:family.length,
    compatible_family:family,
    all_claims_total:Object.values(claims).every(item=>item.domain_complete),
    claims:freeze(claims),
    identified_claim_ids:freeze(Object.values(claims).filter(item=>item.identified).map(item=>item.claim_id)),
    withheld_claim_ids:freeze(Object.values(claims).filter(item=>!item.identified).map(item=>item.claim_id))
  });
}

export function runCompatibleFamilyClaimConstancyLedger() {
  const q1=compileFamilyLedger('Q1',familyQ1());
  const q2=compileFamilyLedger('Q2',familyQ2());
  const expectedQ1Identified=['TRACE','DETERMINANT','DISCRIMINANT','CONJUGACY_FINGERPRINT','LOOP_IS_IDENTITY','RANK_H_MINUS_I','REPEATED_ROOT_TYPE'];
  const expectedQ2Identified=['TRACE','DETERMINANT','DISCRIMINANT','LOOP_IS_IDENTITY','RANK_H_MINUS_I'];
  const pass=
    q1.all_claims_total && q2.all_claims_total &&
    q1.compatible_family_size===31 && q2.compatible_family_size===31 &&
    q1.claims.RAW_MATRIX.identified===false && q2.claims.RAW_MATRIX.identified===false &&
    JSON.stringify(q1.identified_claim_ids)===JSON.stringify(expectedQ1Identified) &&
    JSON.stringify(q2.identified_claim_ids)===JSON.stringify(expectedQ2Identified) &&
    q1.claims.CONJUGACY_FINGERPRINT.identified===true &&
    q2.claims.CONJUGACY_FINGERPRINT.identified===false && q2.claims.CONJUGACY_FINGERPRINT.counterexample!==null &&
    q2.claims.REPEATED_ROOT_TYPE.identified===false && q2.claims.REPEATED_ROOT_TYPE.counterexample!==null &&
    [q1,q2].every(ledger=>Object.values(ledger.claims).filter(item=>!item.identified).every(item=>item.counterexample!==null));

  return freeze({
    schema:COMPATIBLE_FAMILY_CLAIM_CONSTANCY_SCHEMA,
    spec_head:CLAIM_CONSTANCY_SPEC_HEAD,
    source_status:'SIMULATED',
    arithmetic_domain:'F_31',
    research_nickname:'CLAIM_DESCENT_LEDGER',
    naming_firewall:freeze({ sheaf_descent:false, stack_descent:false, categorical_descent:false, functorial_semantics:false }),
    claim_library_ids:freeze(claimLibrary().map(claim=>claim.id)),
    families:freeze({ Q1:q1, Q2:q2 }),
    findings:freeze({
      downstream_claim_identifiability_can_be_coarser_than_raw_state_identifiability:q1.claims.RAW_MATRIX.identified===false && q1.claims.CONJUGACY_FINGERPRINT.identified===true,
      coarser_claims_can_remain_identified_while_finer_quotient_claim_is_withheld:q2.claims.TRACE.identified && q2.claims.DETERMINANT.identified && !q2.claims.CONJUGACY_FINGERPRINT.identified,
      every_withheld_claim_has_explicit_counterexample:pass,
      ledger_validated:pass
    }),
    bounded_answer:pass
      ? 'DOWNSTREAM_CLAIM_IDENTIFIABILITY_CAN_BE_STRICTLY_COARSER_THAN_RAW_STATE_IDENTIFIABILITY_IN_AUTHORED_FINITE_COMPATIBLE_FAMILIES'
      : 'COMPATIBLE_FAMILY_CLAIM_CONSTANCY_LEDGER_FAILED',
    candidate_research_rule:pass
      ? 'WITHHOLD_ONLY_DOWNSTREAM_CLAIMS_THAT_VARY_ACROSS_THE_FULL_CURRENT_COMPATIBLE_FAMILY'
      : null,
    claim_ceiling:freeze({
      compatible_family_claim_constancy_instrument:pass,
      universal_admissibility_theorem:false,
      sheaf_structure:false,
      categorical_structure:false,
      physical_ontology:false,
      proto_loom:false,
      production_authority:false,
      vercel_authority:false
    }),
    promotion_authority:false,
    production_mutated:false,
    human_closure_required:true
  });
}
