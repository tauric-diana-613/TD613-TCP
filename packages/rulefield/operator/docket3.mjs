/** 𝌋 RF-OD-0003 complete scientific-method repair docket, review only.
 * Retains all source statements and prior priority coordinates without mutation.
 */
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {buildSemanticReview,validateSemanticReview} from '../rulefields/semantic_review.mjs';
import {pairedPriorityPreview,validatePairedPriority} from '../rulefields/paired_priority.mjs';
import {proposedTemporalPriority,readRevisionSeed} from '../rulefields/temporal_guardian.mjs';
const sha=s=>createHash('sha256').update(s).digest('hex');
const fail=x=>{throw Object.assign(new Error(x),{code:x})};
const root=fileURLToPath(new URL('../../../',import.meta.url));
const esc=x=>String(x??'').replaceAll('|','\\|').replace(/\r?\n/g,' ⏎ ');
function observedGitHead(){
 try{const x=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',timeout:4500}).trim();
 if(/^[a-f0-9]{40}$/.test(x))return x;}catch{}
 return 'UNVERIFIED_SOURCE_HEAD';
}
export function buildDocket3({head=observedGitHead(),as_of='2026-11-08T12:00:00Z'}={}){
 const review=buildSemanticReview(),plan=proposedTemporalPriority(),priority=pairedPriorityPreview({as_of,plan});
 const seed=readRevisionSeed();
 if(!validateSemanticReview(review)||!validatePairedPriority(priority)||seed.items.length!==86)fail('ROD0003_SOURCE_CONTRACT_DRIFT');
 const workstreams=[
  {id:'OD3-01',action:'Review 94 source-read candidate type decisions',status:'AWAITING_OPERATOR_REVIEW',note:'38 earlier agent readings remain separate; no in-place relabeling.'},
  {id:'OD3-02',action:'Retain 427 machine-only semantic holdings',status:'HELD',note:'Automated proposal labels lack individual source-critical interpretation.'},
  {id:'OD3-03',action:'Qualify paired-comparison measurement protocol',status:'SOURCE_FREE_SOFTWARE_QUALIFIED_ONLY',note:'Matched trials, strict chronology, 86-field correction and confidence assumptions require real source data.'},
  {id:'OD3-04',action:'Preserve historical priorities and dependency order',status:'PRESERVED',note:'70 unchanged ranks; six thermosocial fields precede RF-079; no canonization.'},
  {id:'OD3-05',action:'Retain separate epistemic and human authority',status:'HELD',note:'No external origin verification, no synthetic clinical diagnosis, no scientific closure.'}
 ];
 const rows=review.rows.map(x=>({id:x.id,lane:x.lane,original_statement:x.source_statement,
  first_pass_type:x.previous_triage_primary_role,second_pass_type:x.proposed_primary_role,
  review_level:x.semantic_review_level,interpretation:x.semantic_interpretation,
  discriminating_challenge:x.discriminating_challenge,
  role_bindings:x.role_bindings,additional_rulefield_view_proposed:x.additional_rulefield_view_proposed,
  type_changed:x.changed_from_preliminary_role,claim_credit:x.claim_credit_added,
  human_approved:x.human_ratified,authorized_for_execution:x.local_execution_authorized}));
 const body={schema:'td613.rulefield.operator-docket-3/v1',id:'RF-OD-0003',
  parent:'RF-OD-0002',historical_original:'RF-OD-0001',source_head:head,
  revision_status:'SOURCE_BOUND_PROPOSED_REPAIRS_AWAITING_HUMAN_REVIEW',
  original_historical_priority_count:70,original_historical_priorities:plan.historical,
  original_field_count:86,original_field_expressions:seed.items.map(x=>({id:x.id,original:x.original_expression,
   proposed_academic_title:x.revision_overlay?.revised_academic_working_label||x.proposed_academic_label})),
  semantic_source_digest:review.digest,paired_instrument_digest:priority.digest,
  total_registry_count:596,legacy_audited_before_this_round:37,semantic_review_count:559,
  agent_reviewed_total:132,auto_only:427,proposed_type_changes:review.totals.changed_during_second_pass,
  nonexclusive_role_views:review.totals.nonexclusive_new_research_role_views,
  roles:review.totals.by_proposed_primary_role,methodological_warnings:[
   'An agent-reviewed record is not independently scientifically adjudicated or human ratified.',
   'The purposively chosen 94 records cannot supply a population classification error rate.',
   'A source hash and prerregistration claim are not exteriority authentication.',
   'A finite paired difference is conditional on independent bounded samples and fixed comparison protocol.',
   'No actual matched empirical observations have been entered in this source-free run.',
   'OD-02 nomenclature ratification and canonical execution remain held.'
  ],workstreams,rows,preview:{as_of,rankable:priority.counts.qualified_internal,
   held:priority.counts.held,priority_moves:priority.counts.moves,original_70_frozen:true,
   thermodynamic_prerequisites:['RF-081','RF-082','RF-083','RF-084','RF-085','RF-086'],
   thermosocial_anchor:'RF-079',exteriority_verified:false},
  authority:{od02:'HELD',canonically_accepted:false,source_registry_mutated:false,
   protected_flight:'HELD',independent_empirical_claim:false,merge_allowed:false,
   human_scientific_closure:'RESERVED'},
  decisions:['APPROVE_AS_PROVISIONAL_RESEARCH_ONLY','REQUEST_SEMANTIC_REVISIONS',
   'REQUEST_COMPARATIVE_ASSAY_REDESIGN','HOLD','DECLINE'],
 };
 return {...body,digest:sha(JSON.stringify(body))};
}
export function validateDocket3(x){
 if(x?.schema!=='td613.rulefield.operator-docket-3/v1')return false;
 const {digest,...b}=x;
 return sha(JSON.stringify(b))===digest&&x.rows.length===559&&
  x.original_historical_priorities.length===70&&x.original_field_expressions.length===86&&
  x.agent_reviewed_total===132&&x.auto_only===427&&x.nonexclusive_role_views===14&&
  x.authority.od02==='HELD'&&x.authority.source_registry_mutated===false;
}
export function renderDocket3(d){
 if(!validateDocket3(d))fail('ROD3_INVALID');
 const lines=['# 𝌋 Rulefield Operator Docket · RF-OD-0003','',
 '**Standing:** '+d.revision_status,'**Exact source Git HEAD:** '+d.source_head,
 '**Docket digest SHA-256:** '+d.digest,
 '','## Decision streams (none adopted)','',
 '| ID | Action | Status | Reason |','|---|---|---|---|'];
 for(const x of d.workstreams)lines.push('| '+x.id+' | '+esc(x.action)+' | '+x.status+' | '+esc(x.note)+' |');
 lines.push('','## Actual source-level findings','',
  '- 596 original historical objects retained (37 assessed previously, 559 in residual ledger).',
  '- 38 prior source-read examples, 94 new agent-read records, 427 deterministic-only candidates.',
  '- 14 additional same-historical-object Rulefield role views (non-exclusive, no authority transfer).',
  '- '+d.proposed_type_changes+' proposed changes between the earlier lexical and current casebook primary types. No error rate inferred.',
  '- Zero canonically adopted local rules, zero independently authenticated empirical outcomes.',
  '- All 86 candidate Rulefields and the original 70 priorities remain proposal/source history, not evidence ranking.',
  '','## Methods and scientific limitations','');
 for(const s of d.methodological_warnings)lines.push('- '+s);
 lines.push('','## Every residual original statement and current role proposal','');
 for(const lane of [...new Set(d.rows.map(x=>x.lane))]){
  lines.push('','### '+lane,'','| ID | Source original expression | Previous type | Proposed type | Qualified role views | Evidence level | Reason and discriminant |',
   '|---|---|---|---|---|---|---|');
  for(const x of d.rows.filter(x=>x.lane===lane)){
   lines.push('| '+x.id+' | '+esc(x.original_statement)+' | '+x.first_pass_type+' | '+x.second_pass_type+
    ' | '+esc(x.role_bindings.map(v=>v.role+'@'+v.context).join('; '))+' | '+x.review_level+' | '+esc([x.interpretation,x.discriminating_challenge].filter(Boolean).join(' // '))+' |');
  }
 }
 lines.push('','## All 86 original user-authored Rulefield expressions','',
  '| Field | Original wording | Agent academic label — NOT ratified |','|---|---|---|');
 for(const f of d.original_field_expressions)lines.push('| '+f.id+' | '+esc(f.original)+' | '+esc(f.proposed_academic_title)+' |');
 lines.push('','## All 70 preserved historical priority coordinates','',
  '| Historical rank | ID | Original topic |','|---|---|---|');
 for(const p of d.original_historical_priorities)lines.push('| '+p.rank+' | '+p.id+' | '+esc(p.title)+' |');
 lines.push('','## Operator decisions, pending','',d.decisions.map(x=>'- '+x).join('\n'),
  '','**OD-02 HELD · 0 canonical changes · Protected Flight HELD · Human closure RESERVED**',
  '','𝄐 Khona‌lit-po · Source and role preserved; authority requires human review. ⟐');
 return lines.join('\n')+'\n';
}
export function chatDocket3(d){
 if(!validateDocket3(d))fail('ROD3_INVALID');
 const groups=[...new Set(d.rows.map(x=>x.lane))].map(lane=>({lane,
  total:d.rows.filter(x=>x.lane===lane).length,
  agent_read:d.rows.filter(x=>x.lane===lane&&x.review_level!=='DETERMINISTIC_TRIAGE_ONLY').length,
  items:d.rows.filter(x=>x.lane===lane).map(x=>({id:x.id,original:x.original_statement,
   proposed_type:x.second_pass_type,role_bindings:x.role_bindings,review_status:x.review_level,reason:x.interpretation,
   challenge:x.discriminating_challenge}))}));
 return {schema:'td613.rulefield.in-chat-docket-3/v1',id:d.id,digest:d.digest,
  source_head:d.source_head,workstreams:d.workstreams,groups,
  decisions:d.decisions.map(choice=>({choice,
   draft:'𝌋 OPERATOR DECISION RF-OD-0003 SHA256 '+d.digest+' HEAD '+d.source_head+' '+choice+
    ' selected [OPERATOR SPECIFIES]; this review does not merge, deploy, or authorize protected Flight.'})),
  source_complete:true,actual_git_action:false};
}
export function stageDocket3(d,{folder}={}){
 if(!validateDocket3(d))fail('ROD3_INVALID');
 const out=folder||fileURLToPath(new URL('./dockets/outbox/',import.meta.url));
 mkdirSync(out,{recursive:true});
 const basename=d.id+'--'+d.digest.slice(0,16);
 const files=[
  {name:basename+'.docket.md',content:renderDocket3(d)},
  {name:basename+'.docket.json',content:JSON.stringify(d,null,2)+'\n'},
  {name:basename+'.chat.json',content:JSON.stringify(chatDocket3(d),null,2)+'\n'}
 ];
 const staged=[];
 for(const f of files){
  const path=join(out,f.name);
  if(existsSync(path)){
   if(readFileSync(path,'utf8')!==f.content)fail('DOCKET3_EXISTING_FILE_DIGEST_CONFLICT');
  }else writeFileSync(path,f.content,{flag:'wx',mode:0o600});
  staged.push({path,name:f.name,sha256:sha(f.content),bytes:Buffer.byteLength(f.content)});
 }
 return {id:d.id,digest:d.digest,files:staged,human_approval:false,source_mutation:false};
}
