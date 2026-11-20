/**
 * Browser-native *adaptation* of a SOURCE / MOTIF / HOSTILE CONTROL / HOLD
 * research exercise over existing Vixen Works. This does NOT run original
 * Python, independently acquire historical sources, or establish authorship.
 */
import {computeSha256HexAsync} from './corpus-experiment-a.mjs';

const WORK=/^emwork_[a-f0-9]{24}$/;
const SOURCE=/^emsrc_[a-f0-9]{24}$/;
const HEX=/^[a-f0-9]{64}$/;
const term=/\b[a-z][a-z0-9]{3,22}\b/gi;
const STOP=new Set(('about after again also been being both could each from have into just '+
 'like more most other over same some such than that their them then there these those '+
 'through under used using were what when where which while with would your this '+
 'here also even once upon does only very will shall into onto does has have').split(/\s+/));
const need=(value,code)=>{if(!value)throw Error(code)};
const digest=x=>computeSha256HexAsync(x);
const counts=text=>{
 const map=new Map();
 for(const m of text.matchAll(term)){
  const t=m[0].toLowerCase();
  if(!STOP.has(t))map.set(t,(map.get(t)||0)+1);
 }
 return map;
};
const sortedCandidate=(a,b)=>{
 const c=[...a.keys()].filter(x=>b.has(x)&&!/[0-9]/.test(x));
 c.sort((x,y)=>{
  const score=t=>10*Math.min(a.get(t),b.get(t))+Math.log(1+a.get(t)+b.get(t));
  return score(y)-score(x)||x.localeCompare(y);
 });
 return c;
};
const selectedExcerpt=(body,word)=>{
 const match=new RegExp('\\b'+word+'\\b','i').exec(body);
 need(match,'HELD_CHALLENGE_TERM_NOT_IN_SOURCE');
 const left=Math.max(0,match.index-85),right=Math.min(body.length,match.index+word.length+95);
 const text=body.slice(left,right).replace(/\s+/g,' ').trim();
 return {preview:text,excerpt_type:'AUTOMATED_SOURCE_WINDOW_NOT_USER_READING'};
};
const utf8Locator=async (doc,word)=>{
 const match=new RegExp('\\b'+word+'\\b','i').exec(doc.body);
 need(match,'HELD_CHALLENGE_SOURCE_CANDIDATE_MISSING');
 const prefix=doc.body.slice(0,match.index),raw=doc.body.slice(match.index,match.index+match[0].length);
 const bytes=new TextEncoder().encode(raw);
 return {work_id:doc.work_id,source_file_id:doc.source_file_id,
  verified_derivative_sha256:doc.verified_derivative_sha256,
  utf8_offset:new TextEncoder().encode(prefix).length,utf8_length:bytes.length,
  exact_span_sha256:await digest(bytes),span_validation:'CURRENT_VERIFIED_DERIVATIVE_ONLY'};
};
export function validateSourceChallengeCatalogue(corpus){
 need(corpus?.works?.length===32,'HELD_CHALLENGE_CATALOGUE_32_WORKS_REQUIRED');
 const ids=new Set(),manifestations=new Set();
 let gates=0,options=1;
 for(const w of corpus.works){
  need(WORK.test(w.work_id)&&!ids.has(w.work_id),'HELD_CHALLENGE_WORK_IDENTITY');
  ids.add(w.work_id);
  need(['SINGLETON_WORK_SURFACE','SAME_WORK_CONFIRMED','SAME_WORK_SUPPORTED'].includes(w.identity_status),
   'HELD_CHALLENGE_IDENTITY_STATE');
  const members=w.linked_sources;
  need(Array.isArray(members)&&members.length>0,'HELD_CHALLENGE_MANIFESTATIONS');
  for(const m of members){
   need(SOURCE.test(m.source_file_id)&&HEX.test(m.sha256)&&!manifestations.has(m.source_file_id),
    'HELD_CHALLENGE_SOURCE_REGISTRY');
   manifestations.add(m.source_file_id);
  }
  need(Array.isArray(w.contribution_interval)&&w.contribution_interval.length===2,
   'HELD_CHALLENGE_IDENTITY_INTERVAL');
  if(w.identity_status==='SAME_WORK_SUPPORTED'){
   need(w.human_gate_required===true&&members.length===2&&
    w.contribution_interval[0]===1&&w.contribution_interval[1]===2,
    'HELD_CHALLENGE_HUMAN_IDENTITY_GATE');
   gates++;options*=2;
  }else{
   need(w.human_gate_required===false&&w.contribution_interval.every(x=>x===1),
    'HELD_CHALLENGE_FIXED_IDENTITY_MISMATCH');
  }
 }
 need(manifestations.size===53&&gates===8&&options===256,'HELD_CHALLENGE_CORPUS_CENSUS');
 return {work_count:ids.size,manifestation_count:manifestations.size,
  human_gated_groups:gates,split_collapse_partitions:options,
  lower_independent_work_count:32,upper_independent_work_count:40,
  human_identity_resolution:'HELD_UNADJUDICATED'};
}
export async function validateSourceChallengeDocuments(documents,corpus){
 const census=validateSourceChallengeCatalogue(corpus);
 need(Array.isArray(documents)&&documents.length===2&&
  documents[0].work_id!==documents[1].work_id,'HELD_CHALLENGE_TWO_DISTINCT_WORKS');
 for(const d of documents){
  const registered=corpus.works.find(w=>w.work_id===d.work_id);
  need(registered&&registered.linked_sources.some(s=>s.source_file_id===d.source_file_id&&
   s.sha256===d.declared_original_source_sha256),'HELD_CHALLENGE_SOURCE_MANIFESTATION_NOT_REGISTERED');
  need(typeof d.body==='string'&&d.body.length>0&&d.body.length<=400000&&
   d.body_sha256_verified===true&&HEX.test(d.verified_derivative_sha256),
   'HELD_CHALLENGE_READABLE_DERIVATIVE_REQUIRED');
  need(await digest(d.body)===d.verified_derivative_sha256,
   'HELD_CHALLENGE_DERIVATIVE_BYTES_CHANGED');
 }
 return census;
}
export async function runBrowserSourceChallenge({documents,corpus,question}={}){
 need(typeof question==='string'&&question.trim().length>=8&&question.length<=240,
  'HELD_CHALLENGE_BOUNDED_RESEARCH_QUESTION');
 const census=await validateSourceChallengeDocuments(documents,corpus);
 const a=counts(documents[0].body),b=counts(documents[1].body);
 const shared=sortedCandidate(a,b),word=shared[0]||null;
 const probes=word?await Promise.all(documents.map(d=>utf8Locator(d,word))):[];
 const preview=word?documents.map(d=>selectedExcerpt(d.body,word)):[];
 const mask=word?documents[1].body.replace(new RegExp('\\b'+word+'\\b','gi'),' '):null;
 const before=word?b.get(word):0,after=word?counts(mask).get(word)||0:0;
 need(!word||(before>0&&after===0),'HELD_CHALLENGE_COUNTERFACTUAL_ABLATION_NOT_OBSERVED');
 const source_works=documents.map(d=>({work_id:d.work_id,source_file_id:d.source_file_id,
  declared_original_source_sha256:d.declared_original_source_sha256,
  verified_derivative_sha256:d.verified_derivative_sha256,
  source_original_bytes_present_in_browser:false}));
 return Object.freeze({
  schema:'td613.vixen.public-source-hostile-challenge/v1',
  regime:'BROWSER_DERIVED_LEXICAL_SOURCE_CONTROL_NOT_ORIGINAL_NATIVE_PYTHON',
  research_question:question.trim(),
  source_works,identity_census:census,
  source_derived_candidate:word,
  candidate_count:shared.length,
  source_repetition_count:word?[a.get(word),b.get(word)]:[0,0],
  exact_span_locators:probes,
  context_windows:preview,
  control:word?{kind:'EPHEMERAL_WITHDRAWAL_OF_ONE_BOUNDED_COMMON_WORD',
   source_two_occurrences_before:before,source_two_occurrences_after:after,
   ephemeral_source_two_sha256:await digest(mask),
   original_source_edited:false,matched_field_generic_control_performed:false,
   physical_causal_mechanism_falsified:false,
   result:'TOKEN_DEPENDENCE_OBSERVED_MECHANISM_HELD'}:
   {kind:'NO_SOURCE_SHARED_TERM_FOUND',original_source_edited:false,
    matched_field_generic_control_performed:false,
    physical_causal_mechanism_falsified:false,result:'NO_LEXICAL_CANDIDATE_EARNED'},
  decision:word?{
   initial:'EXACT_SPANS_FOUND_BOUNDED_MOTIF_CANDIDATE',
   after:'FRAGILE_LEXICAL_PAIR_MECHANISM_HELD',
   recommended_next_action:'Map exact entities, operators, conditions and predicted consequences in both original texts; test one field-generic rival and a falsifier.'}:
   {initial:'NO_BOUNDED_SHARED_TERM',after:'NO_RELATION_EARNED',
    recommended_next_action:'Choose another registered source pair or provide a locatable formal relation for independent review.'},
  original_native_method_executed_in_browser:false,
  source_term_is_a_motif_hypothesis_not_a_mechanism:true,
  eight_human_identity_gates_resolved:false,
  human_report_recorded:false,
  external_scientific_credit:0,
  original_authorial_intent_inferred:false,
  independently_observed_external_witness:false,
  scientific_claim_earned:false,
  human_closure_required:true
 });
}
export async function validateBrowserSourceChallengeReport({result,documents,corpus,report}={}){
 need(result?.schema==='td613.vixen.public-source-hostile-challenge/v1',
  'HELD_CHALLENGE_RUN_FIRST');
 need(report&&typeof report==='object','HELD_CHALLENGE_REPORT_OBJECT_REQUIRED');
 const options=['MOTIF_ONLY','STRUCTURAL_CANDIDATE_UNPROVEN','NO_RELATION_EARNED'];
 need(options.includes(report.judgment),'HELD_CHALLENGE_BOUNDED_OPERATOR_JUDGMENT');
 need(Array.isArray(report.passages)&&report.passages.length===2,
  'HELD_CHALLENGE_TWO_ORIGINAL_PASSAGES_REQUIRED');
 const source=await validateSourceChallengeDocuments(documents,corpus);
 need(source.human_gated_groups===8,'HELD_CHALLENGE_IDENTITY_GATES');
 const passages=[];
 for(let i=0;i<2;i++){
  const d=documents[i],p=report.passages[i];
  need(p?.work_id===d.work_id&&p.source_file_id===d.source_file_id&&
   typeof p.excerpt==='string'&&p.excerpt.length>=16&&p.excerpt.length<=500,
   'HELD_CHALLENGE_SOURCE_EXCERPT_REQUIRED');
  const offset=d.body.indexOf(p.excerpt);
  need(offset>=0,'HELD_CHALLENGE_EXCERPT_NOT_IN_VERIFIED_SOURCE');
  const raw=new TextEncoder().encode(d.body.slice(0,offset));
  passages.push({work_id:d.work_id,source_file_id:d.source_file_id,
   verified_derivative_sha256:d.verified_derivative_sha256,
   utf8_offset:raw.length,utf8_length:new TextEncoder().encode(p.excerpt).length,
   exact_excerpt:p.excerpt,reader_attestation:'LOCAL_VISITOR_FORM_UNINDEPENDENTLY_VERIFIED'});
 }
 const required=[
  ['entities','HELD_CHALLENGE_ENTITIES_REQUIRED'],
  ['operators','HELD_CHALLENGE_OPERATORS_REQUIRED'],
  ['boundary_conditions','HELD_CHALLENGE_BOUNDARY_REQUIRED'],
  ['predicted_consequences','HELD_CHALLENGE_PREDICTIONS_REQUIRED'],
  ['field_generic_rival','HELD_CHALLENGE_RIVAL_REQUIRED'],
  ['non_metaphorical_rule','HELD_CHALLENGE_NON_METAPHORICAL_RULE_REQUIRED'],
  ['disconfirming_observation','HELD_CHALLENGE_FALSIFIER_REQUIRED'],
  ['next_source_action','HELD_CHALLENGE_NEXT_ACTION_REQUIRED']
 ];
 const assessment={};
 for(const [key,err] of required){
  need(typeof report[key]==='string'&&report[key].trim().length>=20&&
   report[key].length<=1800,err);
  assessment[key]=report[key].trim();
 }
 return Object.freeze({
  schema:'td613.vixen.human-source-mechanism-review/v1',
  mode:'VOLUNTARY_LOCAL_VISITOR_FORM_UNVERIFIED_EXTERNAL_AUTHORITY',
  judgment:report.judgment,
  passage_provenance:passages,
  structural_mapping:assessment,
  original_source_verified_only_as_CURRENT_DERIVATIVE:true,
  semantic_and_formal_interpretation_independently_verified:false,
  structurally_complete_form_is_not_mechanism_proof:true,
  matched_field_generic_null_executed:false,
  original_native_python_executed_in_browser:false,
  scientific_credit:0,
  human_identity_gates_adjudicated:0,
  independent_external_witness:false,
  composer_publication_permission:false,
  human_closure_required:true
 });
}
