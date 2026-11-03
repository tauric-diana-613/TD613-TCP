/** Invented Em-method contracts. Original corpus adapters are deliberately absent.
 * Source-provided interpretations remain interpretations; human closure RESERVED.
 */
import {createHash} from 'node:crypto';
import {resolveWorkManifestations,motifCandidateSieve,independentEvidenceSupport} from '../E3B4/seed/atelier-parity-operators-v02.mjs';
import {bindExactSourceSpan,discriminateMechanisms,stageFragmentaryTheory} from '../E3B4/seed/atelier-mechanism-discrimination-v02.mjs';
import {compileTypedGraph,withdrawSource,makeBlurbHypothesis} from './native/em-atelier-parity.mjs';
export const hash=b=>createHash('sha256').update(b).digest('hex');
export const epoch='EM-B6-INVENTED-20261102';
export const need=(v,c)=>{if(!v)throw Object.assign(Error(c),{code:c})};
export const FAMILIES=Object.freeze({
 BLIND_SOURCE_ANATOMY:'PARTIAL',WORK_IDENTITY_SPLIT_COLLAPSE_SENSITIVITY:'EXECUTED_SYNTHETIC',
 MOTIF_VS_MECHANISM_NULL:'EXECUTED_SYNTHETIC',FORMAL_OPERATOR_AND_AUTHORITY_LAUNDERING:'PARTIAL',
 GENEALOGY_AND_SOURCE_INDEPENDENCE:'EXECUTED_SYNTHETIC',CONVERGENCE_DIVERGENCE_EMERGENCE:'PARTIAL',
 OBFUSCATION_DECOMPRESSION:'PARTIAL',EXTERNAL_SCIENTIFIC_CONFRONTATION:'DESIGNED',
 HOSTILE_ALTERNATIVE_MODELS:'PARTIAL',FRAGMENTARY_BLURB_THEORY_PROPOSALS:'PARTIAL'
});
const id=x=>typeof x==='string'&&/^FIXTURE-[A-Z0-9_-]+$/.test(x);
const unique=(rows,key)=>new Set(rows.map(r=>r[key])).size===rows.length;
const bytes=s=>{need(typeof s==='string','BASE64_REQUIRED');const b=Buffer.from(s,'base64');need(b.toString('base64')===s,'NONCANONICAL_BYTES');return b};
export function validateEm(f){
 need(f?.schema==='td613.e3b6-invented-em/v1'&&f.epoch===epoch&&f.rights==='SYNTHETIC_LOCAL_ONLY'&&f.evidence_class==='SYNTHETIC_REPLAY_ONLY','EM_RIGHTS_EPOCH_CLASS');
 const allowed=['schema','epoch','rights','evidence_class','originals','source_files','derivatives','works','manifestations','optional_identity_links','specimens','fragment','comparison','decompression'];
 need(Object.keys(f).every(k=>allowed.includes(k)),'EM_UNEXPECTED_FIELD');
 for(const [key,pk] of [['originals','original_id'],['source_files','source_file_id'],['derivatives','derivative_id'],['works','work_id'],['manifestations','manifestation_id']])need(Array.isArray(f[key])&&f[key].length<=24&&unique(f[key],pk)&&f[key].every(r=>id(r[pk])),'EM_ID_OR_CARDINALITY:'+key);
 const originals=new Map(f.originals.map(o=>[o.original_id,o])),sources=new Map(f.source_files.map(s=>[s.source_file_id,s])),works=new Set(f.works.map(w=>w.work_id));
 for(const o of f.originals){need(hash(bytes(o.bytes_base64))===o.sha256&&o.synthetic_origin===true&&(o.ancestor_id===null||id(o.ancestor_id)),'EM_ORIGINAL_INTEGRITY');need(Number.isFinite(Date.parse(o.published_at))&&Number.isFinite(Date.parse(o.observed_at))&&Date.parse(o.observed_at)>=Date.parse(o.published_at),'EM_ORIGINAL_CLOCK')}
 for(const s of f.source_files)need(originals.has(s.original_id)&&s.sha256===originals.get(s.original_id).sha256,'EM_SOURCE_PARENT');
 for(const d of f.derivatives){const s=sources.get(d.source_file_id),o=originals.get(d.original_id);need(s&&o&&s.original_id===d.original_id&&d.parent_sha256===o.sha256&&hash(bytes(d.text_base64))===d.sha256,'EM_DERIVATIVE_INTEGRITY');need(Number.isFinite(Date.parse(d.observed_at))&&Date.parse(d.observed_at)>=Date.parse(o.observed_at),'EM_CHRONOLOGICAL_INVERSION')}
 need(unique(f.derivatives,'source_file_id'),'EM_DUPLICATE_DERIVATIVE');
 for(const m of f.manifestations)need(sources.has(m.source_file_id)&&(m.work_id===null||works.has(m.work_id))&&['SAME_WORK_SUPPORTED','SAME_WORK_CONFIRMED','SINGLETON_WORK_SURFACE','UNRESOLVED'].includes(m.identity_status),'EM_MANIFESTATION_BINDING');
 for(const w of f.works){const rows=f.manifestations.filter(m=>m.work_id===w.work_id);need(rows.length&&Array.isArray(w.manifestation_source_file_ids)&&JSON.stringify([...w.manifestation_source_file_ids].sort())===JSON.stringify(rows.map(m=>m.source_file_id).sort()),'EM_WORK_MEMBERSHIP')}
 need(Array.isArray(f.optional_identity_links)&&f.optional_identity_links.length<=8,'EM_IDENTITY_BOUNDS');
 const mids=new Set(f.manifestations.map(m=>m.manifestation_id));for(const link of f.optional_identity_links)need(mids.has(link.from)&&mids.has(link.to)&&['SUPPORTED','UNRESOLVED'].includes(link.status),'EM_OPTIONAL_IDENTITY_LINK');
 need(Array.isArray(f.specimens)&&f.specimens.length<=4,'EM_SPECIMEN_BOUNDS');
 return f;
}
export function activeView(f,revoked=[],asOf=null){
 if(asOf!==null)need(Number.isFinite(Date.parse(asOf)),'EM_AS_OF_CLOCK');
 const originals=f.originals.filter(o=>!revoked.includes(o.original_id)&&(!asOf||Date.parse(o.observed_at)<=Date.parse(asOf))),oids=new Set(originals.map(o=>o.original_id));
 const derivatives=f.derivatives.filter(d=>oids.has(d.original_id)&&(!asOf||Date.parse(d.observed_at)<=Date.parse(asOf))),sids=new Set(derivatives.map(d=>d.source_file_id));
 const source_files=f.source_files.filter(s=>sids.has(s.source_file_id)),manifestations=f.manifestations.filter(m=>sids.has(m.source_file_id)),mids=new Set(manifestations.map(m=>m.manifestation_id));
 const works=f.works.map(w=>({...w,manifestation_source_file_ids:w.manifestation_source_file_ids.filter(s=>sids.has(s))})).filter(w=>w.manifestation_source_file_ids.length);
 return {...f,originals,source_files,derivatives,manifestations,works,optional_identity_links:f.optional_identity_links.filter(l=>mids.has(l.from)&&mids.has(l.to)),original_operational_work_count:f.works.length};
}
export function portableWorks(f){return f.works.map(w=>resolveWorkManifestations({work_id:w.work_id,works:f.works,manifestations:f.manifestations,source_rows:f.source_files,epoch}))}
function partitions(f,enabled){
 const parent=new Map(f.manifestations.map(m=>[m.manifestation_id,m.manifestation_id]));const find=x=>parent.get(x)===x?x:find(parent.get(x));const join=(a,b)=>parent.set(find(b),find(a));
 for(const w of f.works){const rows=f.manifestations.filter(m=>m.work_id===w.work_id&&m.identity_status==='SAME_WORK_CONFIRMED');for(const m of rows.slice(1))join(rows[0].manifestation_id,m.manifestation_id)}
 for(const link of enabled)join(link.from,link.to);
 return [...new Set([...parent.keys()].map(find))].map(root=>[...parent.keys()].filter(k=>find(k)===root));
}
export function identitySensitivity(f,options={}){
 need(Object.keys(options).every(k=>['split_supported','join_unresolved'].includes(k))&&Object.values(options).every(v=>typeof v==='boolean'),'EM_IDENTITY_ASSIGNMENT_UNSUPPORTED');
 const all=[];for(let mask=0;mask<2**f.optional_identity_links.length;mask++)all.push(partitions(f,f.optional_identity_links.filter((_,i)=>mask&(1<<i))));
 const counts=[...new Set(all.map(p=>p.length))].sort((a,b)=>a-b);
 const selected=f.optional_identity_links.filter(l=>l.status==='SUPPORTED'?!options.split_supported:options.join_unresolved===true);
 return {source_file_count:f.source_files.length,manifestation_count:f.manifestations.length,original_object_count:f.originals.length,derivative_count:f.derivatives.length,operational_work_count:f.works.length,original_operational_work_count:f.original_operational_work_count??f.works.length,unassigned_manifestations:f.manifestations.filter(m=>m.work_id===null).length,independent_work_bounds:counts.length?[counts[0],counts.at(-1)]:[0,0],admissible_counts:counts,admissible_assignments:all,selected_counterfactual:partitions(f,selected),selected_counterfactual_count:partitions(f,selected).length,portable_works:portableWorks(f),canonical_identity_rewritten:false,supported_identity_confirmed:false,claim_ceiling:'FINITE_DECLARED_IDENTITY_LINKS_ONLY_NOT_ORIGINAL_EM_WORK_COUNT'};
}
export function spans(f){return f.derivatives.map(d=>({source_id:d.source_file_id,source_locator:d.derivative_id,text:bytes(d.text_base64).toString('utf8'),work_id:f.manifestations.find(m=>m.source_file_id===d.source_file_id)?.work_id??null,work_identity_status:f.manifestations.find(m=>m.source_file_id===d.source_file_id)?.identity_status??'UNRESOLVED'}))}
export function motifs(f,terms){return motifCandidateSieve({snapshot_id:epoch,source_spans:spans(f),terms})}
export function genealogy(f){
 const original=new Map(f.originals.map(o=>[o.original_id,o]));
 const rows=f.derivatives.map(d=>({evidence_id:d.derivative_id,source_id:d.source_file_id,ancestor_id:original.get(d.original_id).ancestor_id}));
 const edges=f.derivatives.map(d=>({edge_id:d.derivative_id,from:d.derivative_id,to:d.original_id,projection:'PROVENANCE',relation:'DERIVED_FROM_SYNTHETIC_ORIGINAL',evidence_class:'ARCHIVE_OBSERVED',source_refs:[d.source_file_id],claim_ceiling:'SYNTHETIC_DECLARED_ANCESTRY_ONLY',authority_state:'RESEARCH_ONLY'}));
 return {independence:independentEvidenceSupport(rows),graphs:compileTypedGraph(edges,new Set(f.source_files.map(s=>s.source_file_id))),byte_groups:[...new Set(f.originals.map(o=>o.sha256))].map(sha256=>({sha256,original_ids:f.originals.filter(o=>o.sha256===sha256).map(o=>o.original_id)})),external_origin_verified:false,work_group_is_ancestor:false};
}
export function anchoredSpecimen(f,name='SIGNED'){
 const s=f.specimens.find(s=>s.specimen_id===name);if(!s)return null;
 const d=f.derivatives.find(d=>d.derivative_id===s.derivative_id);if(!d)return null;
 const anchor=bindExactSourceSpan({snapshot_id:epoch,source_file_id:d.source_file_id,source_locator:d.derivative_id,full_text:bytes(d.text_base64).toString('utf8'),start_char:s.start_char,end_char:s.end_char,derivative_sha256:d.sha256,source_parent_sha256:d.parent_sha256});
 const anchorId=anchor.source_file_id+':'+anchor.start_char+':'+anchor.end_char;
 const kinds=['DIFFERENCE','SUM','ABS_DIFFERENCE','UNSPECIFIED'];
 const hypotheses=kinds.map(kind=>({id:kind,label:kind,source_relation:kind==='DIFFERENCE'?'SOURCE_FORMULATION_PROPOSED':kind==='UNSPECIFIED'?'NULL_ALTERNATIVE':'ANALYST_FORMALIZATION',operator:{kind},input_fields:['target','seen'],source_anchor_ids:kind==='DIFFERENCE'?[anchorId]:[],prediction_scope:'INVENTED_FINITE_CASES_ONLY',falsifier:'A frozen supplied case contradicts this numeric prediction',prior_art_state:'UNASSESSED',prior_art_refs:[]}));
 return {snapshot_id:epoch,anchors:[anchor],hypotheses,cases:s.cases,observation_origin:'SYNTHETIC_FORMULA_CONSISTENCY'};
}
export function mechanism(f,name){const spec=anchoredSpecimen(f,name);return spec?discriminateMechanisms(spec):null}
function anatomy(f){return {masks:spans(f).map((s,i)=>{const text=s.text.split('\n').filter(l=>!/^# |^(Title|Author|Template):/.test(l)).join('\n');return {mask:'BLIND-'+(i+1),headings:(text.match(/^## /gm)||[]).length,paragraphs:text.split(/\n\s*\n/).filter(x=>x.trim()).length,numeric_definition:/\bscore\s*=\s*target\s*-\s*seen\b/.test(text),literal_token_count:(text.match(/[\p{L}\p{N}]+/gu)||[]).length}}),inferred_author:null,inferred_work:null,scope:'STRUCTURAL_MASK_ONLY_NO_AUTONOMOUS_ANATOMY_OR_MECHANISM'} }
function comparison(f){
 const c=f.comparison;need(c&&c.question==='FINITE_SIGNED_PREDICTION'&&c.target_withheld===true&&JSON.stringify(c.controls)===JSON.stringify(['REFERENCE','SHUFFLED','TEMPLATE']),'EM_COMPARISON_CONTRACT');
 need(hash(JSON.stringify(c.inputs))===c.input_sha256&&Array.isArray(c.observed)&&c.inputs.length===c.observed.length&&c.inputs.length>=2,'EM_FROZEN_COMPARISON_TAMPER');
 const reference=c.inputs.map(x=>x.target-x.seen),shuffled=[...reference].reverse(),template=c.inputs.map(()=>0);
 return {question:c.question,input_sha256:c.input_sha256,identical_inputs_for_all:true,output_count:c.inputs.length,results:[['REFERENCE',reference],['SHUFFLED',shuffled],['TEMPLATE',template]].map(([control,predictions])=>({control,predictions,matching_cases:predictions.filter((p,i)=>p===c.observed[i]).length})),status:'HELD_NO_INDEPENDENT_OUTCOME_WITNESS',finite_descriptor_comparison_only:true,novelty_established:false};
}
function decompression(f){
 need(Array.isArray(f.decompression)&&f.decompression.every(x=>typeof x==='string'),'EM_DECOMPRESSION_INPUT');
 const originals=f.decompression,reversible=originals.map(s=>Buffer.from(s).toString('base64')),decoded=reversible.map(s=>Buffer.from(s,'base64').toString('utf8'));
 const aliases=originals.map(s=>s.split(' ').at(-1));
 return {reversible,roundtrip_exact:decoded.every((s,i)=>s===originals[i]),lossy_classes:[...new Set(aliases)].map(alias=>({alias,compatible_inputs:originals.filter((_,i)=>aliases[i]===alias),unique_recovery:aliases.filter(x=>x===alias).length===1})),protected_text_recovered:false,claim_ceiling:'INVENTED_TRANSFORMS_ONLY_NOT_SEMANTIC_DEOBFUSCATION'};
}
function fragment(f,positive){
 const derivativeId=positive?f.specimens.find(s=>s.specimen_id==='SIGNED')?.derivative_id:f.fragment.derivative_id;
 const d=f.derivatives.find(d=>d.derivative_id===derivativeId);if(!d)return null;
 const text=bytes(d.text_base64).toString('utf8'),anchor=bindExactSourceSpan({snapshot_id:epoch,source_file_id:d.source_file_id,source_locator:d.derivative_id,full_text:text,start_char:0,end_char:text.length,derivative_sha256:d.sha256,source_parent_sha256:d.parent_sha256});
 if(positive)need(text.includes('score = target - seen')&&text.includes('target=1')&&text.includes('seen=4')&&text.includes('-3')&&text.includes('different'),'EM_POSITIVE_BLURB_UNGROUNDED');
 return {native_proposal:makeBlurbHypothesis({finding_id:'FIXTURE-BLURB',source_file_id:d.source_file_id,span_or_locator:d.derivative_id,proposition:'An invented passage proposes a bounded relation.',snapshot_or_epoch:epoch}),candidate:stageFragmentaryTheory({snapshot_id:epoch,anchor,proposed_question:'Can this invented passage support a bounded typed prediction?',objects:['score'],variables:positive?['target','seen']:[],operator_specification:positive?'score = target - seen':null,prediction_specification:positive?'At target=1 and seen=4 the score is -3':null,falsifier_specification:positive?'An observed score different from -3 on this supplied case':null,known_reference_terms:[],operator_identity_witness:positive?'SYNTHETIC_DECLARATION_NOT_EXTERNAL_WITNESS':null}),full_work_analyzed:false};
}
export function executeMethod(f,operation,p={}){
 need(FAMILIES[operation],'EM_UNAVAILABLE_OPERATION');
 need(!p.promote&&!p.authorship&&!p.shared_genealogy&&!p.novelty&&!p.external_citation,'EM_AUTHORITY_LIFT_REFUSED');
 switch(operation){
 case 'WORK_IDENTITY_SPLIT_COLLAPSE_SENSITIVITY':return identitySensitivity(f,p.assignment??{});
 case 'MOTIF_VS_MECHANISM_NULL':return {lexical:motifs(f,p.terms??['trace']),mechanism:mechanism(f,p.specimen??'SIGNED'),motif_implies_mechanism:false};
 case 'FORMAL_OPERATOR_AND_AUTHORITY_LAUNDERING':return mechanism(f,p.specimen??'SIGNED');
 case 'GENEALOGY_AND_SOURCE_INDEPENDENCE':{const g=genealogy(f);return {...g,ablation:p.withdraw_source?withdrawSource(g.graphs,p.withdraw_source):null}}
 case 'BLIND_SOURCE_ANATOMY':return anatomy(f);
 case 'CONVERGENCE_DIVERGENCE_EMERGENCE':return comparison(f);
 case 'OBFUSCATION_DECOMPRESSION':return decompression(f);
 case 'EXTERNAL_SCIENTIFIC_CONFRONTATION':return {status:'HELD_EXTERNAL_VALIDATION',required_witness_schema:{origin_id:'EXOGENOUS',claim_id:'EXACT',episode_id:'IMMUTABLE',observed_at:'TIMESTAMP',custody:'INDEPENDENT',method:'REPRODUCIBLE',falsifier:'EXPLICIT'},witnesses:[],external_search_performed:false};
 case 'FRAGMENTARY_BLURB_THEORY_PROPOSALS':return fragment(f,p.positive===true);
 case 'HOSTILE_ALTERNATIVE_MODELS':{
  const repeated={...f,derivatives:[...f.derivatives,...f.derivatives.map(d=>({...d,derivative_id:d.derivative_id+'-MORE'}))]};
  const template={...f,derivatives:f.derivatives.map(d=>({...d,text_base64:Buffer.from('Title: SAME IDENTITY\nTemplate: alleged mechanism\n'+bytes(d.text_base64).toString('utf8')).toString('base64')}))};
  const {original_operational_work_count:ignored,...raw}=f;
  const shuffled=structuredClone(raw),inverted=structuredClone(raw),refusals=[];
  if(shuffled.derivatives.length&&shuffled.originals.length>1){shuffled.derivatives[0].original_id=shuffled.originals.find(o=>o.original_id!==shuffled.derivatives[0].original_id).original_id;try{validateEm(shuffled)}catch(e){refusals.push({control:'SHUFFLED_GENEALOGY',code:e.code})}}
  if(inverted.derivatives.length){inverted.derivatives[0].observed_at='1900-01-01';try{validateEm(inverted)}catch(e){refusals.push({control:'CHRONOLOGICAL_INVERSION',code:e.code})}}
  const ablated=f.originals.length?activeView(f,[f.originals[0].original_id]):f;
  return {motif_only_null:motifs(f,['trace']),more_text:{before:motifs(f,['trace']).summary,after:motifs(repeated,['trace']).summary,ancestor_count_unchanged:genealogy(f).independence.distinct_known_ancestors===genealogy(repeated).independence.distinct_known_ancestors},label_template_ablation_invariant:JSON.stringify(anatomy(f))===JSON.stringify(anatomy(template)),executed_refusals:refusals,mechanism_nonunique:mechanism(f,'NONUNIQUE'),prior_art:'CONVENTIONAL_FINITE_DIFFERENCE_NO_EXTERNAL_NOVELTY_SEARCH',source_withheld:{before:f.derivatives.map(d=>d.derivative_id),after:ablated.derivatives.map(d=>d.derivative_id),operation:'STRUCTURAL_ABLATION_ONLY'},general_hostile_model_search:'HELD'};
 }
 }
}
