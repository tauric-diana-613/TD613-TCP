/**
 * TD613 · Universal Atelier v0.2 candidate
 * Source-bound mechanism discrimination on frozen finite numeric specimens.
 *
 * An explicit source quotation can anchor a mathematical *interpretation*;
 * it cannot independently establish empirical control efficacy, universality,
 * intellectual priority, originality, authorship, or a unified theory.
 * No external network calls, eval, source mutation, or automatic source intake.
 */
import { createHash } from 'node:crypto';

const guard=(ok,why)=>{if(!ok)throw Error(why)};
const str=x=>typeof x==='string'&&x.trim().length>0;
const sha=x=>createHash('sha256').update(x).digest('hex');
const validSha=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const OPERATORS=Object.freeze(['DIFFERENCE','SUM','ABS_DIFFERENCE','IDENTITY_FIRST','CONSTANT','UNSPECIFIED']);
const PRIOR_ART=['UNASSESSED','SOURCE_ATTRIBUTES_CONVENTIONAL_FAMILY','INDEPENDENT_REVIEW_PENDING'];
const STATUS=['SOURCE_FORMULATION_PROPOSED','ANALYST_FORMALIZATION','NULL_ALTERNATIVE'];
const canon=value=>JSON.stringify(value);

export function bindExactSourceSpan({snapshot_id,source_file_id,source_locator,full_text,
  start_char,end_char,derivative_sha256,source_parent_sha256}){
 guard([snapshot_id,source_file_id,source_locator].every(str),'SOURCE_COORDINATES_REQUIRED');
 guard(typeof full_text==='string'&&Number.isInteger(start_char)&&Number.isInteger(end_char)
   &&start_char>=0&&end_char>start_char&&end_char<=full_text.length,'SOURCE_SPAN_INVALID');
 guard(validSha(derivative_sha256)&&validSha(source_parent_sha256),'SOURCE_CUSTODY_HASH_REQUIRED');
 guard(sha(full_text)===derivative_sha256,'SOURCE_TEXT_DIGEST_MISMATCH');
 const exact=full_text.slice(start_char,end_char);
 guard(exact.trim().length>=20,'SOURCE_SPAN_TOO_SHORT');
 return Object.freeze({snapshot_id,source_file_id,source_locator,start_char,end_char,
  source_span_utf8_sha256:sha(exact),derivative_sha256,source_parent_sha256,
  source_span_length:exact.length,source_text_in_packet:false,
  verification:'DERIVATIVE_BYTES_AND_EXACT_SPAN_VERIFIED',source_claim_truth:'NOT_ADJUDICATED'});
}

function validateAnchor(a,expectedSnapshot){
 guard(a?.verification==='DERIVATIVE_BYTES_AND_EXACT_SPAN_VERIFIED'&&
 a.snapshot_id===expectedSnapshot&&validSha(a.source_span_utf8_sha256)&&
 validSha(a.source_parent_sha256)&&validSha(a.derivative_sha256),'UNVERIFIED_SOURCE_ANCHOR');
 guard(Number.isInteger(a.start_char)&&Number.isInteger(a.end_char)&&
 a.end_char>a.start_char&&str(a.source_file_id)&&str(a.source_locator),'ANCHOR_COORDINATE_INVALID');
}
function validateHypothesis(h){
 guard(str(h.id)&&str(h.label)&&STATUS.includes(h.source_relation),'HYPOTHESIS_FIELDS_MISSING');
 guard(h.operator && OPERATORS.includes(h.operator.kind),'OPERATOR_UNSPECIFIED_KIND');
 guard(Array.isArray(h.input_fields)&&h.input_fields.every(str)&&
 h.input_fields.length>=1&&h.input_fields.length<=2,'OPERATOR_INPUT_FIELDS_INVALID');
 if(h.operator.kind==='CONSTANT')guard(finite(h.operator.value),'CONSTANT_NUMERIC_VALUE_REQUIRED');
 if(h.operator.kind!=='CONSTANT'&&h.operator.kind!=='UNSPECIFIED')
  guard(h.input_fields.length===(h.operator.kind==='IDENTITY_FIRST'?1:2),'OPERATOR_ARITY_MISMATCH');
 guard(Array.isArray(h.source_anchor_ids)&&h.source_anchor_ids.every(str),'HYPOTHESIS_EVIDENCE_REFS_REQUIRED');
 guard(str(h.prediction_scope)&&str(h.falsifier),'PREDICTION_FALSIFIER_REQUIRED');
 guard(PRIOR_ART.includes(h.prior_art_state),'PRIOR_ART_STATE_INVALID');
 guard(Array.isArray(h.prior_art_refs)&&h.prior_art_refs.every(str),'PRIOR_ART_REFS_INVALID');
 if(h.prior_art_state==='SOURCE_ATTRIBUTES_CONVENTIONAL_FAMILY')
  guard(h.prior_art_refs.length>0,'CONVENTIONAL_PRIOR_ART_UNSOURCED');
 if(h.source_relation==='SOURCE_FORMULATION_PROPOSED')
  guard(h.source_anchor_ids.length>0,'CLAIMED_SOURCE_FORMULATION_UNBOUND');
 if(h.source_relation==='NULL_ALTERNATIVE')
  guard(h.operator.kind==='UNSPECIFIED','NULL_HYPOTHESIS_MUST_ABSTAIN');
}
/** The common tool executes a finite, explicitly defined numerical operator. */
export function executeBoundedOperator(h,input){
 validateHypothesis(h);
 guard(input&&typeof input==='object'&&!Array.isArray(input),'INPUT_RECORD_REQUIRED');
 const vals=h.input_fields.map(k=>{guard(finite(input[k]),'INPUT_NOT_FINITE_OR_MISSING:'+k);return input[k]});
 const [x,y]=vals;let result;
 switch(h.operator.kind){
  case 'DIFFERENCE':result=x-y;break;
  case 'SUM':result=x+y;break;
  case 'ABS_DIFFERENCE':result=Math.abs(x-y);break;
  case 'IDENTITY_FIRST':result=x;break;
  case 'CONSTANT':result=h.operator.value;break;
  case 'UNSPECIFIED':return null;
  default:throw Error('UNKNOWN_OPERATOR');
 }
 guard(finite(result),'OPERATOR_RESULT_NOT_FINITE');
 return result;
}
/**
 * Candidate vs alternatives, with source anchoring and frozen specimen receipt.
 * A score measures consistency WITH SUPPLIED TEST CASES ONLY. A synthetic
 * equation example must not be counted as independent empirical observation.
 */
export function discriminateMechanisms({snapshot_id,anchors,hypotheses,cases,
  observation_origin,comparator_tolerance=1e-10,prior_art_search_receipt=null}){
 guard(str(snapshot_id)&&Array.isArray(anchors)&&anchors.length>0,'MECHANISM_SNAPSHOT_ANCHORS');
 guard(Array.isArray(hypotheses)&&hypotheses.length>=2&&hypotheses.length<=12,'COMPETING_MODELS_REQUIRED');
 guard(Array.isArray(cases)&&cases.length>=2&&cases.length<=200,'FROZEN_CASES_REQUIRED');
 guard(['SYNTHETIC_FORMULA_CONSISTENCY','EXTERNAL_EMPIRICAL_UNVERIFIED'].includes(observation_origin),
  'OBSERVATION_ORIGIN_UNCLASSIFIED');
 guard(finite(comparator_tolerance)&&comparator_tolerance>=0&&comparator_tolerance<=0.01,'TOLERANCE_INVALID');
 const bound=new Map();
 for(const a of anchors){
  validateAnchor(a,snapshot_id);
  const id=a.source_file_id+':'+a.start_char+':'+a.end_char;
  guard(!bound.has(id),'DUPLICATE_SOURCE_ANCHOR');bound.set(id,a);
 }
 const ids=new Set();
 for(const h of hypotheses){
  validateHypothesis(h);guard(!ids.has(h.id),'DUPLICATE_MODEL_ID');ids.add(h.id);
  for(const id of h.source_anchor_ids)guard(bound.has(id),'HYPOTHESIS_UNBOUND_SOURCE_REF');
 }
 guard(hypotheses.some(h=>h.operator.kind==='UNSPECIFIED'),'NULL_OR_UNSPECIFIED_COMPETITOR_REQUIRED');
 const casesSeen=new Set();
 for(const c of cases){
  guard(str(c.case_id)&&!casesSeen.has(c.case_id),'CASE_ID_DUPLICATE_OR_MISSING');casesSeen.add(c.case_id);
  guard(c.inputs&&typeof c.inputs==='object'&&!Array.isArray(c.inputs)&&finite(c.observed),
   'CASE_INPUT_OR_OBSERVATION_INVALID');
  guard(str(c.observation_basis),'OBSERVATION_BASIS_MISSING');
 }
 const rows=hypotheses.map(h=>{
  const predictions=cases.map(c=>{
   const y=executeBoundedOperator(h,c.inputs);
   return {case_id:c.case_id,predicted:y,observed:c.observed,
    discrepancy:y===null?null:Math.abs(y-c.observed),
    consistent:y===null?null:Math.abs(y-c.observed)<=comparator_tolerance};
  });
  const specified=predictions.filter(x=>x.predicted!==null);
  const fails=specified.filter(x=>!x.consistent).map(x=>x.case_id);
  return {id:h.id,source_relation:h.source_relation,operator_kind:h.operator.kind,
   prediction_scope:h.prediction_scope,falsifier:h.falsifier,
   source_anchor_ids:[...h.source_anchor_ids],prior_art_state:h.prior_art_state,
   prior_art_refs:[...h.prior_art_refs],specified_case_count:specified.length,
   matching_case_count:specified.filter(x=>x.consistent).length,
   contradiction_case_ids:fails,predictions,
   classification:specified.length===0?'ABSTAINING_UNSPECIFIED_MODEL':
    fails.length===0?'FINITE_CASE_CONSISTENT':'FINITE_CASE_CONTRADICTED'};
 });
 const compatible=rows.filter(x=>x.classification==='FINITE_CASE_CONSISTENT');
 const distinguishable=hypotheses.some((h,i)=>hypotheses.slice(i+1).some(other=>
  cases.some(c=>{const x=executeBoundedOperator(h,c.inputs),y=executeBoundedOperator(other,c.inputs);
   return x!==null&&y!==null&&Math.abs(x-y)>comparator_tolerance;})));
 const allAgainstObserved=rows.filter(x=>x.classification==='FINITE_CASE_CONTRADICTED').map(x=>x.id);
 const precedence=prior_art_search_receipt===null?'NO_INDEPENDENT_PRIOR_ART_SEARCH_WITNESSED':
  'UNVERIFIED_EXTERNAL_PRIOR_ART_RECEIPT_SUPPLIED_NOT_AUDITED';
 const classification=compatible.length>1?'OBSERVATIONALLY_NONUNIQUE_COMPATIBLE_MODELS':
  compatible.length===1?'ONE_FINITE_CASE_COMPATIBLE_MODEL_NO_GENERAL_PROOF':
   'NO_FINITE_CASE_COMPATIBLE_SPECIFIED_MODEL';
 return {schema:'td613.atelier-mechanism-discrimination/v0.2',snapshot_id,
  anchor_count:anchors.length,anchors:anchors.map(a=>({...a})),
  observation_origin,case_count:cases.length,
  test_cases_sha256:sha(canon(cases)),comparator_tolerance,
  hypotheses:rows,compatible_model_ids:compatible.map(x=>x.id),
  falsified_on_supplied_cases:allAgainstObserved,models_distinguishable_on_cases:distinguishable,
  result_classification:classification,
  prior_art_evaluation:precedence,independent_empirical_validation:false,
  universal_theory_validated:false,novelty_validated:false,
  human_adjudication_required:true,
  claim_ceiling:'SOURCE_ANCHORED_FINITE_FORMULA_DISCRIMINATION_ONLY_NOT_EMPIRICAL_CONTROL_OR_UNIFIED_THEORY'};
}


/**
 * Treat unconventional mathematical/literary language as a source-grounded
 * candidate research question. Do not force numerical evaluation where the
 * inspected span lacks typed operands and an executable operator.
 * Missingness is LOCAL TO THE EXCERPT, never a verdict on the entire work.
 */
export function stageFragmentaryTheory({snapshot_id,anchor,proposed_question,
  objects=[],variables=[],operator_specification=null,
  falsifier_specification=null,prediction_specification=null,
  known_reference_terms=[],operator_identity_witness=null}){
 validateAnchor(anchor,snapshot_id);
 guard(str(proposed_question)&&Array.isArray(objects)&&objects.every(str)&&
  Array.isArray(variables)&&variables.every(str),'THEORY_CANDIDATE_FIELDS');
 guard(Array.isArray(known_reference_terms)&&known_reference_terms.every(str),'REFERENCE_TERMS_INVALID');
 if(operator_specification!==null)guard(str(operator_specification),'OPERATOR_SPECIFICATION_INVALID');
 if(falsifier_specification!==null)guard(str(falsifier_specification),'FALSIFIER_SPECIFICATION_INVALID');
 if(prediction_specification!==null)guard(str(prediction_specification),'PREDICTION_SPECIFICATION_INVALID');
 const missing=[];
 if(!operator_specification)missing.push('TYPED_EXECUTABLE_OPERATOR_NOT_IN_ADMITTED_EXCERPT');
 if(!prediction_specification)missing.push('DISCRIMINATING_PREDICTION_NOT_IN_ADMITTED_EXCERPT');
 if(!falsifier_specification)missing.push('FALSIFIER_NOT_IN_ADMITTED_EXCERPT');
 if(!operator_identity_witness)missing.push('INDEPENDENT_OPERATOR_IDENTITY_WITNESS_NOT_SUPPLIED');
 const readiness=missing.length?'HELD_EXCERPT_INSUFFICIENT':'CANDIDATE_SPECIFIED_AWAITING_EXTERNAL_ADJUDICATION';
 return {
  schema:'td613.atelier-fragmentary-theory/v0.2',snapshot_id,
  source_ref:{source_file_id:anchor.source_file_id,source_locator:anchor.source_locator,
   start_char:anchor.start_char,end_char:anchor.end_char,
   source_span_utf8_sha256:anchor.source_span_utf8_sha256},
  proposed_question,objects:[...objects],variables:[...variables],known_reference_terms:[...known_reference_terms],
  formulation_supplied:!!operator_specification,prediction_supplied:!!prediction_specification,
  falsifier_supplied:!!falsifier_specification,
  operator_identity_witness_supplied:!!operator_identity_witness,
  missing_requirements:missing,status:readiness,
  alternatives:['LITERARY_OR_ONTOLOGICAL_METAPHOR','CONVENTIONAL_DISCIPLINARY_ANALOGY',
   'UNDEFINED_OPERATOR','POTENTIALLY_FORMALIZABLE_CANDIDATE'],
  excerpt_scope_only:true,full_source_conclusion:false,
  conceptual_value_not_denied:true,novelty_validated:false,
  theory_unification_validated:false,
  next_high_information_test:'READ_AND_MAP_THE_FULL_WORK; IDENTIFY_SOURCE_FORMAL_OPERATOR_FALSIFIER_AND_PRIOR_ART',
  claim_ceiling:'BOUNDED_FRAGMENT_CREATIVE_THEORY_CANDIDATE_NO_SCIENTIFIC_PROMOTION'
 };
}
