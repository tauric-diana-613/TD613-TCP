import { runCompatibleFamilyClaimConstancyLedger } from './compatible-family-claim-constancy.js';
import { conjugacyFingerprint, determinant2, rankMod, mod } from './gauge-blind-gl2-f31-holonomy-conjugacy.js';

export const COMPATIBLE_SET_REFINEMENT_SCHEMA = 'td613.pedagogue.compatible-set-refinement-monotonicity/v0.1';
export const REFINEMENT_SPEC_HEAD = 'd2e7e68d59760828c15fbf95ef2948db7c8436ff';
export const MODULUS = 31;

const I = Object.freeze([[1,0],[0,1]].map(row=>Object.freeze(row)));

function freeze(value) {
  if(value && typeof value==='object' && !Object.isFrozen(value)) {
    for(const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}
function stableKey(value) { return JSON.stringify(value); }
function matrixEqual(left,right) { return stableKey(left)===stableKey(right); }

function familyC0() {
  return freeze(Array.from({length:MODULUS},(_,b)=>freeze([[3,b],[0,3]].map(row=>Object.freeze(row)))));
}

function claimLibrary() {
  return freeze([
    freeze({ id:'RAW_MATRIX', evaluate:matrix=>matrix }),
    freeze({ id:'TRACE', evaluate:matrix=>mod(matrix[0][0]+matrix[1][1]) }),
    freeze({ id:'DETERMINANT', evaluate:matrix=>determinant2(matrix) }),
    freeze({ id:'DISCRIMINANT', evaluate:matrix=>{
      const t=mod(matrix[0][0]+matrix[1][1]);
      const d=determinant2(matrix);
      return mod(t*t-4*d);
    }}),
    freeze({ id:'CONJUGACY_FINGERPRINT', evaluate:matrix=>conjugacyFingerprint(matrix).fingerprint }),
    freeze({ id:'LOOP_IS_IDENTITY', evaluate:matrix=>matrixEqual(matrix,I) }),
    freeze({ id:'RANK_H_MINUS_I', evaluate:matrix=>rankMod(matrix.map((row,i)=>row.map((value,j)=>mod(value-(i===j?1:0))))) }),
    freeze({ id:'REPEATED_ROOT_TYPE', evaluate:matrix=>conjugacyFingerprint(matrix).repeated_root_type ?? 'NOT_REPEATED_ROOT' })
  ]);
}

function compileLedger(family) {
  const claims={};
  for(const claim of claimLibrary()) {
    const values=family.map(claim.evaluate);
    const distinct=[];
    const keys=new Set();
    values.forEach(value=>{
      const key=stableKey(value);
      if(!keys.has(key)) { keys.add(key); distinct.push(value); }
    });
    claims[claim.id]=freeze({
      identified:distinct.length===1,
      distinct_values:freeze(distinct)
    });
  }
  return freeze({
    compatible_count:family.length,
    claims:freeze(claims),
    identified_claim_ids:freeze(Object.entries(claims).filter(([,value])=>value.identified).map(([id])=>id)),
    withheld_claim_ids:freeze(Object.entries(claims).filter(([,value])=>!value.identified).map(([id])=>id))
  });
}

function validatePureRefinement(parent,child) {
  const parentKeys=new Set(parent.map(stableKey));
  const subset=child.every(candidate=>parentKeys.has(stableKey(candidate)));
  if(!subset) return freeze({ admitted:false, classification:'MODEL_OR_CLAIM_MUTATION_OUTSIDE_REFINEMENT_THEOREM', nonempty:child.length>0, subset:false });
  if(child.length===0) return freeze({ admitted:false, classification:'COMPATIBLE_SET_EMPTY_MODEL_OR_EVIDENCE_CONTRADICTION', nonempty:false, subset:true });
  return freeze({ admitted:true, classification:'PURE_NONEMPTY_COMPATIBLE_SET_REFINEMENT', nonempty:true, subset:true });
}

function preservedClaims(parentLedger,childLedger) {
  const out={};
  for(const claimId of parentLedger.identified_claim_ids) {
    const parent=parentLedger.claims[claimId];
    const child=childLedger.claims[claimId];
    out[claimId]=freeze({
      remained_identified:child.identified,
      same_value:child.identified && stableKey(parent.distinct_values[0])===stableKey(child.distinct_values[0])
    });
  }
  return freeze(out);
}

export function runCompatibleSetRefinementMonotonicityAssay() {
  const C0=familyC0();
  const C1=freeze(C0.filter(matrix=>matrix[0][1]!==0));
  const C2=freeze(C0.filter(matrix=>matrix[0][1]===1));
  const CEmpty=freeze(C0.filter(matrix=>matrix[0][1]===31));
  const COutside=freeze([freeze([[4,0],[0,4]].map(row=>Object.freeze(row)))]);

  const parentReference=runCompatibleFamilyClaimConstancyLedger().families.Q2;
  const L0=compileLedger(C0);
  const L1=compileLedger(C1);
  const L2=compileLedger(C2);

  const parentSemanticsMatch=
    JSON.stringify(L0.identified_claim_ids)===JSON.stringify(parentReference.identified_claim_ids) &&
    JSON.stringify(L0.withheld_claim_ids)===JSON.stringify(parentReference.withheld_claim_ids);

  const R1=validatePureRefinement(C0,C1);
  const R2=validatePureRefinement(C1,C2);
  const REmpty=validatePureRefinement(C0,CEmpty);
  const ROutside=validatePureRefinement(C0,COutside);

  const preserve01=preservedClaims(L0,L1);
  const preserve12=preservedClaims(L1,L2);
  const allPreserved01=Object.values(preserve01).every(item=>item.remained_identified&&item.same_value);
  const allPreserved12=Object.values(preserve12).every(item=>item.remained_identified&&item.same_value);

  const proof=freeze({
    theorem_id:'IDENTIFIED_CLAIM_PRESERVATION_UNDER_NONEMPTY_COMPATIBLE_SET_REFINEMENT',
    assumptions:freeze(['C1 subseteq C0','C1 nonempty','f total on C0','f fixed','f(c)=v for every c in C0']),
    derivation:freeze([
      'take arbitrary c in C1',
      'subset assumption gives c in C0',
      'constancy on C0 gives f(c)=v',
      'therefore every c in C1 has f(c)=v'
    ]),
    conclusion:'f remains constant on C1 with the same value',
    finite_sampling_required:false,
    converse_claimed:false,
    empty_set_excluded:true
  });

  const pass=
    parentSemanticsMatch && R1.admitted && R2.admitted && allPreserved01 && allPreserved12 &&
    L1.compatible_count===30 && L1.claims.RAW_MATRIX.identified===false &&
    L1.claims.CONJUGACY_FINGERPRINT.identified===true && L1.claims.REPEATED_ROOT_TYPE.identified===true &&
    L1.claims.REPEATED_ROOT_TYPE.distinct_values[0]==='NONTRIVIAL_JORDAN_REPEATED_ROOT' &&
    L2.compatible_count===1 && Object.values(L2.claims).every(claim=>claim.identified) &&
    REmpty.classification==='COMPATIBLE_SET_EMPTY_MODEL_OR_EVIDENCE_CONTRADICTION' &&
    ROutside.classification==='MODEL_OR_CLAIM_MUTATION_OUTSIDE_REFINEMENT_THEOREM';

  return freeze({
    schema:COMPATIBLE_SET_REFINEMENT_SCHEMA,
    spec_head:REFINEMENT_SPEC_HEAD,
    source_status:'SYMBOLIC_THEOREM_PLUS_SIMULATED_FIXTURE',
    theorem_certificate:proof,
    parent_claim_semantics_match:parentSemanticsMatch,
    sequence:freeze({
      C0:freeze({ family_size:C0.length, ledger:L0 }),
      R1:freeze({ predicate:'b != 0', validation:R1, family_size:C1.length, ledger:L1, preserved_from_parent:preserve01 }),
      R2:freeze({ predicate:'b = 1', validation:R2, family_size:C2.length, ledger:L2, preserved_from_parent:preserve12 }),
      R_empty:freeze({ predicate:'b = 31 in canonical 0..30 representation', validation:REmpty, claim_licenses_emitted:0 }),
      R_outside:freeze({ predicate:'replace family with [[4,0],[0,4]]', validation:ROutside })
    }),
    findings:freeze({
      identified_claims_preserved_under_nonempty_pure_refinement:allPreserved01&&allPreserved12,
      withheld_claims_can_become_identified_before_raw_state_is_identified:L0.claims.CONJUGACY_FINGERPRINT.identified===false && L1.claims.CONJUGACY_FINGERPRINT.identified===true && L1.claims.RAW_MATRIX.identified===false,
      singleton_refinement_identifies_raw_state:L2.claims.RAW_MATRIX.identified===true,
      empty_compatible_set_emits_no_claim_license:REmpty.admitted===false,
      model_mutation_rejected_as_refinement:ROutside.admitted===false,
      assay_validated:pass
    }),
    bounded_answer:pass
      ? 'CLAIM_LICENSES_CAN_GROW_MONOTONICALLY_UNDER_PURE_COMPATIBLE_SET_SHRINKAGE_WHILE_RAW_STATE_REMAINS_UNIDENTIFIED'
      : 'COMPATIBLE_SET_REFINEMENT_MONOTONICITY_ASSAY_FAILED',
    claim_ceiling:freeze({
      set_theoretic_refinement_preservation_theorem:pass,
      empirical_knowledge_monotonicity:false,
      bayesian_convergence:false,
      causal_identification:false,
      sheaf_structure:false,
      production_governance:false,
      proto_loom:false,
      vercel_authority:false
    }),
    promotion_authority:false,
    production_mutated:false,
    human_closure_required:true
  });
}
