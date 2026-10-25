/**
 * EMSTD613 v0.2 candidate / controlled finite-algebra mechanism-discrimination
 * specimen on preserved Algedonic Systems Deep Research markdown.
 *
 * Reports exact source anchoring and a FORMULA-CONSISTENCY specimen only.
 * The article's claims about biological, institutional or AI systems are
 * NOT independently observed, validated or attributed by these calculations.
 */
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {emRegistry} from './em-native-parity-v02.mjs';
import {bindExactSourceSpan,discriminateMechanisms,stageFragmentaryTheory}
 from '../../ATELIER_METHOD/atelier-mechanism-discrimination-v02.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const guard=(x,why)=>{if(!x)throw Error(why)};
const digest=b=>createHash('sha256').update(b).digest('hex');
const SOURCE_ID='emsrc_b7e4e42924d33bdaf666a4f8';
const SNAPSHOT='EM_PR962_NATIVE_REGISTERED_CUSTODY';
const EXACT_START='The dynamics of this process can be formalized through classical control equations';
const EXACT_END='the *Measured Value*';

/** Bind a real native source excerpt via registered original + derivative hashes. */
export function algedonicControlEquationWitness(){
 const reg=emRegistry();
 const source=reg.source_rows.find(x=>x.source_file_id===SOURCE_ID);
 const derivative=reg.derivatives.find(x=>x.source_file_id===SOURCE_ID);
 guard(source&&derivative&&derivative.extraction_status==='EXTRACTED_NATIVE_TEXT','NATIVE_EQ_SOURCE_UNAVAILABLE');
 guard(derivative.parent_sha256===source.sha256,'NATIVE_EQ_PARENT_HASH_MISMATCH');
 const relative=derivative.derivative_relative_path;
 const p=path.resolve(ROOT,relative);
 guard(typeof relative==='string'&&p.startsWith(ROOT+path.sep),'NATIVE_EQ_PATH_ESCAPES_ARCHIVE');
 const bytes=fs.readFileSync(p);
 guard(digest(bytes)===derivative.derivative_sha256,'NATIVE_EQ_DERIVATIVE_HASH_MISMATCH');
 const text=bytes.toString('utf8');
 const begin=text.indexOf(EXACT_START);
 guard(begin>=0,'SOURCE_EQUATION_NOT_LOCATED');
 const endPoint=text.indexOf(EXACT_END,begin);
 guard(endPoint>begin&&endPoint-begin<500,'SOURCE_EQUATION_RELATION_AMBIGUOUS');
 const finish=endPoint+EXACT_END.length;
 const anchor=bindExactSourceSpan({
  snapshot_id:SNAPSHOT,source_file_id:SOURCE_ID,source_locator:relative,
  full_text:text,start_char:begin,end_char:finish,
  derivative_sha256:derivative.derivative_sha256,
  source_parent_sha256:source.sha256
 });
 return {anchor,source_id:SOURCE_ID,snapshot_id:SNAPSHOT,
  source_relation:'TEXT_DESCRIBES_ERROR_SETPOINT_MINUS_MEASURED',
  native_work_identity:'SAME_WORK_SUPPORTED_HUMAN_GATE',
  original_work_author_claim:'UNRESOLVED',
  source_not_reproduced:true};
}
const MODEL_FIELDS=['setpoint','measured'];
export function runNativeAlgedonicMechanismSpecimen(){
 const origin=algedonicControlEquationWitness();
 const id=origin.anchor.source_file_id+':'+origin.anchor.start_char+':'+origin.anchor.end_char;
 const ordinary=['source:Em_algedonic_classical_control_equations',
  'source:Em_cites_Ashby_Wiener_background_not_external_prior_art_review'];
 const hypotheses=[
  {id:'SOURCE_MINUS_INTERPRETATION',label:'Source-described signed error',
   source_relation:'SOURCE_FORMULATION_PROPOSED',operator:{kind:'DIFFERENCE'},
   input_fields:MODEL_FIELDS,source_anchor_ids:[id],
   prediction_scope:'FINITE_SYNTHETIC_ERROR_ARITHMETIC_ONLY',
   falsifier:'Signed examples inconsistent with setpoint minus measured',
   prior_art_state:'SOURCE_ATTRIBUTES_CONVENTIONAL_FAMILY',prior_art_refs:ordinary},
  {id:'ADDITIVE_FALSE_TWIN',label:'Additive alternative',source_relation:'ANALYST_FORMALIZATION',
   operator:{kind:'SUM'},input_fields:MODEL_FIELDS,source_anchor_ids:[],
   prediction_scope:'FINITE_SYNTHETIC_ERROR_ARITHMETIC_ONLY',
   falsifier:'Any distinct observed algebraic sum contradiction',
   prior_art_state:'UNASSESSED',prior_art_refs:[]},
  {id:'ABSOLUTE_ERROR_FALSE_TWIN',label:'Magnitude-only alternative',
   source_relation:'ANALYST_FORMALIZATION',operator:{kind:'ABS_DIFFERENCE'},
   input_fields:MODEL_FIELDS,source_anchor_ids:[],
   prediction_scope:'FINITE_SYNTHETIC_ERROR_ARITHMETIC_ONLY',
   falsifier:'Negative signed source error',
   prior_art_state:'UNASSESSED',prior_art_refs:[]},
  {id:'UNSPECIFIED_NULL',label:'Metaphor without an executable operator',
   source_relation:'NULL_ALTERNATIVE',operator:{kind:'UNSPECIFIED'},
   input_fields:MODEL_FIELDS,source_anchor_ids:[],
   prediction_scope:'NO_NUMERIC_PREDICTION',
   falsifier:'Evidence of a uniquely specified, source-bound executable operation',
   prior_art_state:'UNASSESSED',prior_art_refs:[]}
 ];
 const cases=[
  {case_id:'CASE_POSITIVE',inputs:{setpoint:10,measured:6},observed:4,
   observation_basis:'SYNTHETIC_FROM_SOURCE_DESCRIBED_ALGEBRA'},
  {case_id:'CASE_NEGATIVE',inputs:{setpoint:3,measured:7},observed:-4,
   observation_basis:'SYNTHETIC_FROM_SOURCE_DESCRIBED_ALGEBRA'},
  {case_id:'CASE_ZERO',inputs:{setpoint:5,measured:5},observed:0,
   observation_basis:'SYNTHETIC_FROM_SOURCE_DESCRIBED_ALGEBRA'},
  {case_id:'CASE_NEGATIVE_INPUTS',inputs:{setpoint:-2,measured:-5},observed:3,
   observation_basis:'SYNTHETIC_FROM_SOURCE_DESCRIBED_ALGEBRA'}
 ];
 const discriminated=discriminateMechanisms({
  snapshot_id:origin.snapshot_id,anchors:[origin.anchor],hypotheses,cases,
  observation_origin:'SYNTHETIC_FORMULA_CONSISTENCY'
 });
 return {schema:'td613.em-algedonic-mechanism-specimen/v0.2',origin,
  discrimination:discriminated,
  native_manifestations_identity_resolved:false,
  prior_art_external_check:'NOT_PERFORMED',
  empirical_control_benchmark:'NOT_PERFORMED',
  mathematical_novelty:'NOT_EARNED',
  article_generalized_claims:'NOT_EVALUATED',
  mechanism_theory_ceiling:'SOURCE_FORMULA_FINITE_ALGEBRA_ONLY',
  native_canonical_mechanism_ledger_modified:false
 };
}


/**
 * Source-located, intentionally non-executed research candidate from the
 * 1+1=3/oscillator manuscript. Only this short admitted excerpt is inspected.
 * No claim about the entire document's mathematical sophistication is made.
 */
export function runNativeOscillatorFragmentSpecimen(){
 const reg=emRegistry();
 const sourceId='emsrc_c01c49eb755108563b9e58c6';
 const native=reg.source_rows.find(x=>x.source_file_id===sourceId);
 const derived=reg.derivatives.find(x=>x.source_file_id===sourceId);
 guard(native&&derived&&derived.parent_sha256===native.sha256,'OSCILLATOR_NATIVE_SOURCE_UNBOUND');
 const full=path.resolve(ROOT,derived.derivative_relative_path);
 guard(full.startsWith(ROOT+path.sep),'OSCILLATOR_PATH_ESCAPE');
 const bytes=fs.readFileSync(full);
 guard(digest(bytes)===derived.derivative_sha256,'OSCILLATOR_SOURCE_HASH_MISMATCH');
 const text=bytes.toString('utf8');
 const phrase='The task at hand is to construct a deep, rigorous mathematical and cybernetic proof';
 const endPhrase='as the primary engine of self-referential systems.';
 const start=text.indexOf(phrase);const stop=text.indexOf(endPhrase,start);
 guard(start>=0&&stop>=start&&stop-start<400,'OSCILLATOR_EXCERPT_NOT_LOCATED');
 const anchor=bindExactSourceSpan({
  snapshot_id:SNAPSHOT,source_file_id:sourceId,source_locator:derived.derivative_relative_path,
  full_text:text,start_char:start,end_char:stop+endPhrase.length,
  derivative_sha256:derived.derivative_sha256,source_parent_sha256:native.sha256
 });
 const candidate=stageFragmentaryTheory({
  snapshot_id:SNAPSHOT,anchor,
  proposed_question:'Can the described oscillator be expressed as a falsifiable transformation rather than only an ontological analogy?',
  objects:['oscillator','self-referential system'],
  variables:[],operator_specification:null,
  prediction_specification:null,falsifier_specification:null,
  known_reference_terms:[]
 });
 return {schema:'td613.em-oscillator-excerpt-assay/v0.2',
  candidate,verified_source_span:anchor,
  full_work_analyzed:false,
  manuscript_is_mathematically_empty:'NOT_CLAIMED',
  archive_writes:0};
}
