/**
 * 𝌋 Comparative field-study execution over two independently verified Vixen Work bodies.
 * Both browser probes are ADAPTED / DERIVED and do not impersonate original host code.
 * No public Wendbine source body or original author is admitted to the Vixen corpus.
 */
import {
 runSrcProjectiveRouting,deriveSrcQueryConditionedWeights,scoreSrcUntypicalDocument
} from './src-atelier-engines.mjs';

const WORK=/^emwork_[a-f0-9]{24}$/;
const SOURCE=/^emsrc_[a-f0-9]{24}$/;
const SHA=/^[a-f0-9]{64}$/i;
const need=(x,s)=>{if(!x)throw Error(s)};
const tokens=s=>[...new Set(String(s||'').toLowerCase().match(/[a-z][a-z0-9]{2,}/g)||[])];
const norm=s=>String(s||'').toLowerCase().replace(/[_\W]+/g,' ').replace(/\s+/g,' ').trim();
const hits=(q,s)=>{const set=new Set(tokens(s));return tokens(q).filter(t=>set.has(t)).length};
const sortedRank=rows=>rows.slice().sort((a,b)=>b.score-a.score||a.work_id.localeCompare(b.work_id));

export function validateFieldTrialCalibration(calibration){
 need(calibration?.schema==='td613.vixen.public-method-calibration-projection/v1'&&
  calibration.source_post_count===33&&calibration.full_post_bodies_copied===false&&
  calibration.not_a_vixen_work===true&&calibration.public_author_identity_inferred===false&&
  calibration.projection_class==='TD613_DERIVED_PUBLIC_CONCEPT_TERMS_NOT_ORIGINAL_AUTHOR_METHOD',
  'HELD_FIELD_TRIAL_CALIBRATION_AUTHORITY');
 need(Array.isArray(calibration.concept_labels)&&calibration.concept_labels.length===191&&
  new Set(calibration.concept_labels).size===191&&
  calibration.concept_labels.every(x=>typeof x==='string'&&x.length>0&&x.length<=120),
  'HELD_FIELD_TRIAL_UNREGISTERED_CONCEPT_LABELS');
 need(Array.isArray(calibration.public_cooccurrence_pairs)&&calibration.public_cooccurrence_pairs.length===143,
  'HELD_FIELD_TRIAL_UNREGISTERED_COOCCURRENCE');
 const names=new Set(calibration.concept_labels),seen=new Set();
 for(const pair of calibration.public_cooccurrence_pairs){
  need(names.has(pair.from)&&names.has(pair.to)&&pair.from!==pair.to&&
   Number.isInteger(pair.weight)&&pair.weight>=2&&pair.weight<=33,
   'HELD_FIELD_TRIAL_INVALID_COOCCURRENCE');
  const key=[pair.from,pair.to].sort().join('\u0000');
  need(!seen.has(key),'HELD_FIELD_TRIAL_DUPLICATE_PUBLIC_COCCURRENCE');seen.add(key);
 }
 return true;
}
export function validateFieldTrialDocuments(documents,query){
 need(Array.isArray(documents)&&documents.length===2&&
  documents.every(x=>WORK.test(x.work_id||'')&&SOURCE.test(x.source_file_id||'')&&
   SHA.test(x.verified_derivative_sha256||'')&&x.body_sha256_verified===true&&
   typeof x.body==='string'&&x.body.length>0&&x.body.length<=400000&&
   typeof x.title==='string'&&x.title.length<=500),
  'HELD_FIELD_TRIAL_VERIFIED_TWO_MANUSCRIPTS_REQUIRED');
 need(documents[0].work_id!==documents[1].work_id&&
  documents[0].source_file_id!==documents[1].source_file_id,
  'HELD_FIELD_TRIAL_DISTINCT_WORKS_REQUIRED');
 need(typeof query==='string'&&query.trim().length>=5&&query.length<=200,
  'HELD_FIELD_TRIAL_QUERY_BOUNDS');
 return true;
}
function derivedProfile(doc,query,calibration,{ablate=false,titleOnly=false}={}){
 const body=titleOnly?'':doc.body;
 const bodyNorm=norm(body);
 const matched=calibration.concept_labels.filter(label=>{
  const value=norm(label);
  return value.length>2&&(' '+bodyNorm+' ').includes(' '+value+' ');
 }).slice(0,64);
 const known=new Set(matched);
 const linked=ablate?0:calibration.public_cooccurrence_pairs.filter(p=>
  known.has(p.from)&&known.has(p.to)).length;
 return {work_id:doc.work_id,body_query_hits:hits(query,body),
  title_query_hits:hits(query,doc.title),source_concept_term_hits:matched.length,
  matched_public_concept_names:matched.slice(0,12),public_cooccurrence_overlap_pairs:linked,
  score:Number((5*hits(query,body)+2*hits(query,doc.title)+
   matched.length*.15+linked*.05).toFixed(4))};
}
/** Corresponds to TD613's registered host heuristic, not an original poster's algorithm. */
export function runLiveComparativeFieldProbes({documents,query,calibration}={}){
 validateFieldTrialDocuments(documents,query);validateFieldTrialCalibration(calibration);
 const question=query.trim();
 const normalizedQuery=/^Explore\s/i.test(question)?question:'Explore '+question;
 const conditioned=deriveSrcQueryConditionedWeights(normalizedQuery,'src_projective',null);
 const documentaryRows=sortedRank(documents.map(doc=>{
  const measure=scoreSrcUntypicalDocument(conditioned.analysis,{
   work_id:doc.work_id,title:doc.title,cluster:doc.cluster||''
  },doc.body);
  return {work_id:doc.work_id,score:measure.s_src_combined,
   projective_score:measure.s_src_proj,signature_score:measure.s_src_sig,
   matched_terms:measure.matched_tokens,
   query_match_type:measure.explore_match_type,
   evidence_class:'REAL_VERIFIED_VIXEN_DERIVATIVE_ADAPTED_BROWSER_SCORING'};
 }));
 const projective=runSrcProjectiveRouting(documents.map(d=>({
  record_id:d.work_id,title:d.title,body:d.body,created:d.created||null
 })),documents.map(d=>({
  record_id:d.work_id,title:d.title,body:d.body,created:d.created||null
 })));
 const relationRows=sortedRank(documents.map(doc=>derivedProfile(doc,question,calibration)));
 const relationTitleOnly=sortedRank(documents.map(doc=>
  derivedProfile(doc,question,calibration,{titleOnly:true})));
 const relationAblated=sortedRank(documents.map(doc=>
  derivedProfile(doc,question,calibration,{ablate:true})));
 const relationSensitivity=relationRows.map(item=>({
  work_id:item.work_id,
  body_effect:item.score-(relationTitleOnly.find(p=>p.work_id===item.work_id)?.score||0),
  topology_prior_effect:Number((item.score-
   (relationAblated.find(p=>p.work_id===item.work_id)?.score||0)).toFixed(4))
 }));
 return Object.freeze({
  schema:'td613.vixen.operator-led-comparative-probes/v1',
  state:'EXECUTED_DERIVED_BROWSER_METHODS_NO_ORIGINAL_NATIVE_HOST_CLAIM',
  source_works:documents.map(d=>({work_id:d.work_id,source_file_id:d.source_file_id,
   verified_derivative_sha256:d.verified_derivative_sha256,
   body_bytes_admitted_for_readonly_computation:true})),
  query:question,
  display_contract:'TWO_METHODS_SAME_DOCUMENTS_UNEQUAL_SCORE_SCALES_DO_NOT_COMPARE_RAW_SCORES',
  documentary:{method_class:'SRC_ADAPTED_BROWSER_METHOD_NOT_ORIGINAL_PYTHON',
   ranking:documentaryRows,
   projective_candidate_link_count:projective.candidate_link_count,
   source_cue_count:projective.cue_count,
   interpretation:'LEXICAL_DOCUMENTARY_CANDIDATES_NOT_CAUSAL_RELATIONS'},
  relational:{method_class:'TD613_DERIVED_PUBLIC_FIXTURE_PROFILE_NOT_ORIGINAL_PERSON_METHOD',
   ranking:relationRows,
   controls:{title_only:relationTitleOnly,public_cooccurrence_ablation:relationAblated,
    individual_effects:relationSensitivity},
   calibration_source_post_count:calibration.source_post_count,
   calibration_snapshot_id:calibration.snapshot_id,
   interpretation:'PUBLIC_CONCEPT_COOCCURRENCE_HEURISTIC_NOT_DOCUMENTARY_PROVENANCE'},
  method_parity:'HELD_UNPROVEN',
  private_reference_access:false,foreign_work_import_count:0,
  historical_causality_proven:false,scientific_credit:0,
  human_closure_required:true
 });
}
export function validateHumanComparativeJudgment({report,probes,documents}={}){
 need(probes?.schema==='td613.vixen.operator-led-comparative-probes/v1',
  'HELD_JUDGMENT_COMPUTATION_REQUIRED');
 need(report&&typeof report==='object'&&!Array.isArray(report),'HELD_JUDGMENT_TYPED_REPORT');
 need(['DOCUMENTARY','RELATIONAL','TIE','NEITHER'].includes(report.useful_method),
  'HELD_JUDGMENT_METHOD_CHOICE');
 need(['DOCUMENTARY','RELATIONAL','TIE','NEITHER'].includes(report.trustworthy_method),
  'HELD_JUDGMENT_TRUST_CHOICE');
 need(typeof report.rationale==='string'&&report.rationale.trim().length>=25&&
  report.rationale.length<=1600,'HELD_JUDGMENT_RATIONALE_REQUIRED');
 need(typeof report.contradiction==='string'&&report.contradiction.trim().length>=15&&
  report.contradiction.length<=1600,'HELD_JUDGMENT_ADVERSE_OBSERVATION_REQUIRED');
 need(typeof report.next_action==='string'&&report.next_action.trim().length>=15&&
  report.next_action.length<=1200,'HELD_JUDGMENT_NEXT_TASK_REQUIRED');
 need(Array.isArray(report.source_passages)&&report.source_passages.length===2,
  'HELD_JUDGMENT_TWO_LOCATABLE_PASSAGES');
 const provenance=report.source_passages.map((p,i)=>{
  const doc=documents[i];
  need(p.work_id===doc.work_id&&p.source_file_id===doc.source_file_id&&
   typeof p.excerpt==='string'&&p.excerpt.length>=12&&p.excerpt.length<=400,
   'HELD_JUDGMENT_PASSAGE_LOCATION_REQUIRED');
  const offset=doc.body.indexOf(p.excerpt);
  need(offset>=0,'HELD_JUDGMENT_PASSAGE_NOT_IN_VERIFIED_BODY');
  return {work_id:doc.work_id,source_file_id:doc.source_file_id,
   verified_derivative_sha256:doc.verified_derivative_sha256,
   local_utf16_offset:offset,exact_source_excerpt:p.excerpt,
   location_evidence:'BROWSER_MATCHED_EXACT_VERIFIED_DERIVATIVE_TEXT',
   reader_act:'OPERATOR_SELF_REPORT_UNVERIFIED'};
 });
 return Object.freeze({schema:'td613.vixen.operator-led-human-field-report/v1',
  judgment_source:'HUMAN_SUBMITTED_BROWSER_FORM_NO_SERVER_IDENTITY_ATTESTATION',
  useful_method:report.useful_method,trustworthy_method:report.trustworthy_method,
  rationale:report.rationale.trim(),contradiction:report.contradiction.trim(),
  next_action:report.next_action.trim(),passage_provenance:provenance,
  source_passage_exact_match_count:2,
  independent_external_witness:false,real_operator_clicks_reported_by_browser:true,
  external_timestamp_proven:false,authorship_adjudication:false,
  human_reports_not_automatically_scientific_evidence:true,
  science_credit:0,experiment_research_admission:false,composer_authority:false});
}
