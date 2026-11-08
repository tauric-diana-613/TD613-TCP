/** 𝌋 Rulefield Operator Docket v1 — complete source-driven reporting, no authority. */
import {createHash} from 'node:crypto';
import {readFileSync,existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {readRulefield} from '../rulefield.mjs';
import {readSeed,buildQueue,fingerprints} from '../rulefields/engine.mjs';
const root=fileURLToPath(new URL('../../../',import.meta.url));
const hash=s=>createHash('sha256').update(s).digest('hex');
const req=(v,code)=>{if(!v)throw Object.assign(new Error(code),{code});};
const headings=[
 'Foundations and unresolved referents','Wild Field, observation and sources',
 'Cultural critique, agency and governance','Local dynamics and formal methods',
 'Prediction, refinement and human control','Intervention, harms and cellular examples',
 'Automata and dynamical complexity','Provenance, belonging and choice architecture'
];
const workstreams=[
 ['OD-01','Distinguish Rulefield, Rule and Priority','Retain distinct computational and epistemic types; prevent a research title from becoming an executable rule.'],
 ['OD-02','Preserve the eighty human expressions','Retain original wording exactly and mark academic labels as provisional agent-authored interpretations.'],
 ['OD-03','Stage eighty prospective research fields','Append proposals without promoting scientific novelty or deleting incompatible interpretations.'],
 ['OD-04','Preserve seventy ranked topics','Keep original Q01–Q70 and preview an append-only 150-position agenda; dry-run moves are never canonical adoption.'],
 ['OD-05','Retain duplicate HELD and source-recovery limits','Treat lexical matches as evidence for adjudication, not automatic semantic identity; require actually accessible source witnesses.'],
 ['OD-06','Adopt conversation-first review and nomenclature v1','Use content-bound, complete operator dockets in the chat, with real decision-message controls and full Markdown/JSON.'],
 ['OD-07','Defer the graphical workbench','Record visual scroll/search/reorder UI on the ROADMAP only; ship the underlying engine first.']
];
const problems=[
 ['SOURCE_WARRANT','The academic working labels have not individually been independently verified against external scholarly sources.'],
 ['REFERENTS','RF-008, RF-009, RF-010, RF-014 contain referents or terms requiring source-specific clarification.'],
 ['CLAIM_CEILINGS','RF-003, RF-034, RF-041, RF-065 and RF-079 need careful formal interpretation before any universal computation or physics assertion.'],
 ['OVERLAP','A bounded lexical duplicate scan cannot prove semantic novelty, and an overlap cannot prove equivalence.'],
 ['UNKNOWN_PATCH','There is no exact proposed future canonical integration diff in this docket.']
];
const esc=v=>String(v).replaceAll('|','\\|').replace(/\r?\n/g,' ⏎ ');
function revision(){
 try{const x=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',timeout:3000}).trim();if(/^[a-f0-9]{40}$/.test(x))return {sha:x,kind:'EXACT_GIT_HEAD'};}catch{}
 try{const x=JSON.parse(readFileSync(join(root,'RULEFIELD_HANDOFF_MANIFEST.json'),'utf8'));if(/^[a-f0-9]{40}$/.test(x.source_exact_git_head))return {sha:x.source_exact_git_head,kind:'HANDOFF_MANIFEST_CLAIM'};}catch{}
 return {sha:'NOT_VERIFIED',kind:'NO_REVISION_WITNESS'};
}
export function readNomenclature(){
 const r=JSON.parse(readFileSync(new URL('./contracts/NOMENCLATURE_V1.json',import.meta.url),'utf8'));
 req(r.schema==='td613.rulefield.nomenclature-lock/v1'&&r.state==='FROZEN_V1_COMPATIBILITY_CONTRACT','NOMENCLATURE_V1_INVALID');
 return r;
}
export function buildOperatorDocket({id='RF-OD-0001',index=readRulefield(),seed=readSeed(),rev=revision()}={}){
 req(/^RF-OD-\d{4}$/.test(id),'DOCKET_ID_INVALID');
 const lock=readNomenclature(),queue=buildQueue({index,seed}),finger=fingerprints();
 req(queue.historical_priority_count===70&&queue.proposed_rulefield_count===80,'RESEARCH_AGENDA_DRIFT');
 const fields=queue.rulefields.map((f,i)=>({
  id:f.id,proposed_rank:71+i,human_order:i+1,human_original_expression:f.original_expression,
  academic_working_title:f.proposed_academic_label,domain_class:f.domain_class,assay_family:f.assay_family,
  original_source:'CURRENT_CONVERSATION_OPERATOR_INPUT',scientific_claim_ceiling:f.scientific_claim_ceiling,
  duplicate_hold:f.duplicate_review,lexical_rule_leads:f.proposed_rule_associations,
  scholarly_title_verified:false,independent_empirical_credit:0,source_crawl_executed:false
 }));
 const groups=headings.map((title,i)=>({id:'RG-'+String(i+1).padStart(2,'0'),title,
  ids:fields.slice(i*10,i*10+10).map(x=>x.id),count:10}));
 const inherited=index.priority_queue.map(q=>({id:q.id,rank:q.rank,title:q.title,rule_links:q.rule_links}));
 const b={
  schema:'td613.rulefield.operator-docket/v1',id,edition:lock.edition,
  nomenclature_schema:lock.schema,source_revision:rev.sha,source_revision_witness:rev.kind,
  source_registry_sha256:finger.canonical_sha256,field_seed_sha256:finger.field_seed_sha256,
  disposition:'AWAITING_OPERATOR_REVIEW',scope:'PROVISIONAL_RESEARCH_STRUCTURE_ONLY',
  counts:{historical_priorities:70,proposed_rulefields:80,agenda_total:150,canonical_changes:0,
   possible_overlap_holds:queue.duplicate_hold_count},
  workstreams:workstreams.map(([id,title,consequence])=>({id,title,proposed_action:consequence,
   scientific_credit:'SOURCE_FREE_ENGINEERING_ONLY',approval_received:false})),
  reviewer_groups:groups,fields,inherited_priorities:inherited,
  unresolved_issues:problems.map(([id,description])=>({id,description,status:'OPEN'})),
  decision_options:lock.decisions.allow,
  authority:{operator_approval_recorded:false,canonical_registry_mutated:false,
   protected_flight:'HELD',scientific_closure:'RESERVED',merge_allowed:false,deploy_allowed:false},
  full_disclosure_note:'All 80 original expressions, all 80 academic working labels, 70 original priorities and all known source-free screening evidence retained.',
  unknowns:['Future patch effects remain unknown until an exact diff is made.','No verified human identity is established by a Markdown or JSON form.','No live independent academic/source retrieval is implied by the seed.']
 };
 return {...b,docket_sha256:hash(JSON.stringify(b))};
}
export function validateOperatorDocket(d){
 if(!d||d.schema!=='td613.rulefield.operator-docket/v1')return false;
 const {docket_sha256,...rest}=d;
 return docket_sha256===hash(JSON.stringify(rest))&&d.counts.agenda_total===150&&
  d.fields.length===80&&d.inherited_priorities.length===70&&d.reviewer_groups.length===8&&
  d.reviewer_groups.every(g=>g.count===10)&&new Set(d.reviewer_groups.flatMap(g=>g.ids)).size===80&&
  d.fields.every(f=>d.reviewer_groups.some(g=>g.ids.includes(f.id)))&&
  d.authority.canonical_registry_mutated===false&&d.authority.merge_allowed===false;
}
export function renderOperatorDocket(d){
 req(validateOperatorDocket(d),'DOCKET_INVALID');
 const L=['# 𝌋 Rulefield Operator Docket — '+d.id,'',
  '**Nomenclature:** '+d.nomenclature_schema+' · **Edition:** '+d.edition,
  '**SHA-256:** '+d.docket_sha256,
  '**Source revision:** '+d.source_revision+' ('+d.source_revision_witness+')',
  '**Status:** PENDING HUMAN RESEARCH REVIEW · **Protected Flight:** HELD','',
  '## LIGHT · Your decision, with substantive consequences','',
  '| Proposed change | What approval would mean |','|---|---|'];
 for(const w of d.workstreams)L.push('| '+w.id+' · '+esc(w.title)+' | '+esc(w.proposed_action)+' |');
 L.push('','**Invariants:** 70 historical ranks unchanged; 80 proposed fields are not executable rules; no canonical adoption or auto-merge.','',
 '## MEDIUM · Complete original operator submission, with working academic labels','');
 for(const g of d.reviewer_groups){
  L.push('### '+g.id+' · '+g.title,'','| ID · proposed rank | Academic working label | Verbatim operator submission | Duplicate posture |','|---|---|---|---|');
  for(const id of g.ids){
   const f=d.fields.find(q=>q.id===id);
   L.push('| '+f.id+' · '+f.proposed_rank+' | '+esc(f.academic_working_title)+' | '+esc(f.human_original_expression)+' | '+f.duplicate_hold.status+' |');
  }
  L.push('');
 }
 L.push('## HEAVY · The seventy unchanged original priority positions','',
 '| Rank | ID | Original title |','|---:|---|---|');
 for(const q of d.inherited_priorities)L.push('| '+q.rank+' | '+q.id+' | '+esc(q.title)+' |');
 L.push('','## Open evidence and interpretation issues','');
 for(const x of d.unresolved_issues)L.push('- **'+x.id+':** '+x.description);
 L.push('','## Evidentiary and authority boundaries','',
 '- Original Rulefield registry hash: '+d.source_registry_sha256,
 '- Original human field-seed hash: '+d.field_seed_sha256,
 '- No independent empirical novelty, source crawler execution, protected Flight or canonical adoption is established by this docket.',
 '- The complete structured audit appears in the companion .docket.json; the .chat.json provides all group items for lossless in-message review.',
 '','## Choose a human decision','',
 d.decision_options.map(x=>'**'+x+'**').join(' · '),
 '','A decision must name the docket ID, digest and selected workstreams/fields. It is a new human turn, not GitHub modification.',
 '','𝄐 Khona‌lit-po · Human scientific closure RESERVED ⟐');
 return L.join('\n')+'\n';
}
export function chatDocketPayload(d){
 req(validateOperatorDocket(d),'DOCKET_INVALID');
 return {schema:'td613.rulefield.in-chat-decision/v1',docket_id:d.id,docket_sha256:d.docket_sha256,
  source_revision:d.source_revision,operator_choice_required:true,
  groups:d.reviewer_groups.map(g=>({id:g.id,title:g.title,count:10,
   fields:g.ids.map(id=>{const f=d.fields.find(x=>x.id===id);return {id:f.id,rank:f.proposed_rank,
    original:f.human_original_expression,label:f.academic_working_title,duplicate_status:f.duplicate_hold.status};})})),
  workstreams:d.workstreams,unresolved_issues:d.unresolved_issues,
  inherited_priorities:d.inherited_priorities,
  options:d.decision_options.map(choice=>({
   id:choice,
   draft_message:'𝌋 OPERATOR DECISION | '+d.id+' | SHA256 '+d.docket_sha256+' | source '+d.source_revision+
    ' | '+choice+' | selected workstreams/fields: [HUMAN CHOOSES] | provisional research review only; no canonical mutation.'
  })),
  fields_visible:80,historical_priorities_visible:70,canonical_mutation:false};
}
export function stageDocket(d,{folder}={}){
 req(validateOperatorDocket(d),'DOCKET_INVALID');
 const out=folder||fileURLToPath(new URL('./dockets/outbox/',import.meta.url));
 const stem=d.id+'--'+d.docket_sha256.slice(0,16);
 const contents=[[stem+'.docket.md',renderOperatorDocket(d)],
  [stem+'.docket.json',JSON.stringify(d,null,2)+'\n'],
  [stem+'.chat.json',JSON.stringify(chatDocketPayload(d),null,2)+'\n']];
 mkdirSync(out,{recursive:true});
 for(const [name,data] of contents){
  const p=join(out,name);
  if(existsSync(p))req(readFileSync(p,'utf8')===data,'DOCKET_IMMUTABLE_NAME_COLLISION');
  else writeFileSync(p,data,{flag:'wx',mode:0o600});
 }
 return {id:d.id,sha256:d.docket_sha256,files:contents.map(([name,data])=>({path:join(out,name),sha256:hash(data),bytes:Buffer.byteLength(data)})),
  human_authorization_received:false,canonical_changed:false};
}