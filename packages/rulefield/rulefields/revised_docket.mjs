/** 𝌋 RF-OD-0002: successor human decision docket, no canonical mutation. */
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {readRevisionSeed,proposedTemporalPriority} from './temporal_guardian.mjs';
import {buildTypedProjection,readTypeAssessment,readRoleMultiplicity} from './type_system.mjs';
const sha=s=>createHash('sha256').update(s).digest('hex');
const fail=x=>{throw Object.assign(new Error(x),{code:x})};
const esc=x=>String(x).replaceAll('|','\\|').replace(/\r?\n/g,' ⏎ ');
const root=fileURLToPath(new URL('../../../',import.meta.url));
function sourceRevision(){
 try{const s=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',timeout:4000}).trim();
  if(/^[0-9a-f]{40}$/.test(s))return {head:s,standing:'GIT_HEAD'};}catch{}
 return {head:'UNVERIFIED',standing:'NO_GIT_WITNESS'};
}
const workstreams=[
 ['OD-01','Rulefield, Rule, Assay, Model, Claim, Source; simultaneous roles','REVIEW', '26 reassessed source entries, 31 derivable child candidates, 11 retained operational rules, 14 protected domains and ten context-indexed multi-role fixtures.'],
 ['OD-02','Academic naming ratification','HELD_OPERATOR_WITHHELD_RATIFICATION','Original words retained; proposed academic names require additional human review. Rudolf Steiner spelling correction recorded separately.'],
 ['OD-03','Six newly staged thermodynamic/social research fields','REVIEW','RF-081…RF-086 append to 80 existing sources; never automatically become executable rules.'],
 ['OD-04','Temporal-Guardian source tomography and priority order','REVIEW','As-of admissibility precedes ranks; six new prerequisites appear before RF-079 in a 156-position preview. Original 70 ranks untouched.'],
 ['OD-05','Duplicate, role and rule admission HELD guards','REPAIR_IMPLEMENTED_REVIEW','Every proposed rule needs state, guard, transition, observer; dual role proposals require context separation and no implicit authority transfer.'],
 ['OD-06','Conversation-first decision and immutable dossier','REVIEW','Full source-derived in-chat decisions and human Markdown/JSON with a digest.'],
 ['OD-07','Standalone priority interface','ROADMAP_ONLY','Engine first; graphical priority workbench deferred.']
];
export function buildRevisionDocket({revision=sourceRevision()}={}){
 const seed=readRevisionSeed(),plan=proposedTemporalPriority({seed});
 const proj=buildTypedProjection(),audit=readTypeAssessment(),roles=readRoleMultiplicity();
 if(seed.items.length!==86||plan.agenda.length!==156||proj.objects.legacy.length!==596)fail('ROD2_SOURCE_DRIFT');
 const map=new Map(seed.items.map(x=>[x.id,x]));
 const fields=plan.proposed_rulefield_order.map((id,i)=>{
  const f=map.get(id),o=f?.revision_overlay||{};
  if(!f)fail('ROD2_MISSING_SOURCE_FIELD');
  return {id,rank:i+71,original_sequence:f.original_sequence,original_expression:f.original_expression,
   operator_corrected_expression:o.operator_corrected_expression||null,
   academic_working_title:o.revised_academic_working_label||f.proposed_academic_label,
   previously_proposed_title:f.proposed_academic_label,
   operative_formula:o.logical_operator||null,
   source_status:o.source_status||'NOT_INDEPENDENTLY_VERIFIED',
   review_status:'PROVISIONAL_UNRATIFIED_OD02',inherited_role:'RULEFIELD'};
 });
 const groups=Array.from({length:9},(_,i)=>({
  id:'RG-'+String(i+1).padStart(2,'0'),ids:fields.slice(i*10,i*10+10).map(x=>x.id)
 })).filter(x=>x.ids.length);
 const body={
  schema:'td613.rulefield.operator-docket-revision/v2',
  id:'RF-OD-0002',edition:'2.0.0',
  parent_id:'RF-OD-0001',
  parent_sha256:'214c7f501cc6687d14db82ae720e3a74569481156dd623b0513e8c08d67b7f41',
  operator_instruction:'REQUEST_REVISIONS',
  source_head:revision.head,source_witness:revision.standing,
  status:'AWAITING_OPERATOR_REVIEW_OF_REVISIONS',
  canonical_source_sha256:proj.source_registry_sha256,
  revised_seed_sha256:plan.source_fingerprints.revised_seed_sha256,
  proposed_type_projection_sha256:proj.projection_sha256,
  original_priorities:plan.historical.map(x=>({id:x.id,rank:x.rank,title:x.title})),
  fields,groups,
  workstreams:workstreams.map(([id,title,status,consequence])=>({id,title,status,consequence})),
  ontology:{
   role_nonidentity_without_disjointness:true,
   role_bindings:roles.examples,
   historical_retyping:audit.promote_rule_records_to_field_or_assay,
   child_candidates:audit.extract_rule_candidates_from_rulefields,
   protected_rules:audit.protect_as_existing_rules,
   protected_fields:audit.protect_as_research_fields,
   unexamined_legacy_ids:proj.unassessed_records,
   counts:{legacy:596,retyped:26,children:31,protected_rules:11,protected_fields:14,
    unexamined:proj.unassessed_records.length,multi_role_examples:roles.examples.length},
   fully_adjudicated:false
  },
  priorities:{source_proposal:plan.schema,prerequisites:plan.explicit_operator_dependency,
   staged_positions:156,original_seventy_unchanged:true,adoption_authorized:false,
   temporal_asof_before_ranking:true},
  scientific_limits:[
   'Role non-equivalence does not imply mutually exclusive objects.',
   'Holding a research-field role does not grant local execution or canonical approval.',
   'These typed perspectives do not change the source bytes or their historical identity.',
   'The revised six fields are proposals, not verified physical-social thermodynamic laws.',
   'No abstract human-agent simulation establishes a real-person clinical diagnosis.',
   'Future evidence cannot retroactively change what earlier observers knew.',
   'The 559 unexamined legacy objects are not certified executable rules.',
   'OD-02 academic title ratification remains withheld.'
  ],
  authority:{od02:'HELD',current_human_acceptance:false,canonical_source_mutated:false,
   protected_flight:'HELD',human_scientific_closure:'RESERVED',
   merge_allowed:false,deploy_allowed:false},
  decision_options:['APPROVE_PROVISIONAL_TYPED_ROLES','APPROVE_SELECTED_FOR_RESEARCH','REQUEST_FURTHER_REVISIONS','HOLD_SELECTED_PROPOSALS','DECLINE_TYPE_PROPOSAL']
 };
 return {...body,sha256:sha(JSON.stringify(body))};
}
export function validateRevisionDocket(d){
 if(!d||d.schema!=='td613.rulefield.operator-docket-revision/v2')return false;
 const {sha256,...b}=d;
 return sha(JSON.stringify(b))===sha256&&d.fields.length===86&&
  d.original_priorities.length===70&&d.groups.length===9&&
  new Set(d.groups.flatMap(g=>g.ids)).size===86&&
  d.ontology.counts.retyped===26&&d.ontology.counts.children===31&&
  d.ontology.counts.unexamined===559&&d.ontology.counts.multi_role_examples===10&&
  d.authority.od02==='HELD'&&d.authority.canonical_source_mutated===false;
}
export function renderRevisionDocket(d){
 if(!validateRevisionDocket(d))fail('INVALID_ROD2');
 const lines=['# 𝌋 Rulefield Operator Docket RF-OD-0002','',
  '**Status:** '+d.status+' · **Digest:** '+d.sha256,
  '**Source:** '+d.source_head+' ('+d.source_witness+')','',
  '## LIGHT — Actionable workstreams (all provisional)','',
  '| ID | Status | Actual change |','|---|---|---|'];
 for(const w of d.workstreams)lines.push('| '+w.id+' · '+esc(w.title)+' | '+w.status+' | '+esc(w.consequence)+' |');
 lines.push('','## MEDIUM — Ten qualified, simultaneous role views','',
  'Rulefield ≠ Rule defines unequal semantics, not disjoint extensions. One source object can host many qualified roles, without automatic authority transfer.','',
  '| Historical ID | Concurrent roles | Source-grounded reason |','|---|---|---|');
 for(const x of d.ontology.role_bindings)lines.push('| '+x.historical_id+' | '+x.role_bindings.map(r=>r.role).join(' + ')+' | '+esc(x.rationale)+' |');
 lines.push('','## Twenty-six source records with proposed revised types','',
  '| Record | Type hypothesis | Parent | Reason |','|---|---|---|---|');
 for(const x of d.ontology.historical_retyping)lines.push('| '+x.rule_id+' | '+x.proposed_kind+' | '+x.field_or_priority_anchor+' | '+esc(x.rationale)+' |');
 lines.push('','## Thirty-one prospective narrower rule or assay candidates','',
  '| Field | Proposed child | Condition | Test |','|---|---|---|---|');
 for(const x of d.ontology.child_candidates)lines.push('| '+x.rulefield_id+' | '+x.proposed_rule_title+' | '+esc(x.formal_specification)+' | '+esc(x.discriminating_test)+' |');
 lines.push('','## Eleven retained operational rules','',
  '| Rule ID | Reason |','|---|---|');
 for(const x of d.ontology.protected_rules)lines.push('| '+x.rule_id+' | '+esc(x.rationale)+' |');
 lines.push('','## Fourteen broad research fields retained','',
  '| Field ID | Reason |','|---|---|');
 for(const x of d.ontology.protected_fields)lines.push('| '+x.rulefield_id+' | '+esc(x.rationale)+' |');
 lines.push('','## Original human submission with academic working titles (all 86)','');
 for(const g of d.groups){
  lines.push('### '+g.id,'','| Proposed rank | ID | Working academic label (not approved) | Original human wording |','|---:|---|---|---|');
  for(const id of g.ids){
   const f=d.fields.find(x=>x.id===id);
   lines.push('| '+f.rank+' | '+id+' | '+esc(f.academic_working_title)+' | '+esc(f.original_expression)+' |');
  }
 }
 lines.push('','## HEAVY — All seventy frozen historical priority coordinates','',
  '| Rank | ID | Historical title |','|---:|---|---|');
 for(const h of d.original_priorities)lines.push('| '+h.rank+' | '+h.id+' | '+esc(h.title)+' |');
 lines.push('','## Limitations, authority and human decision','');
 for(const l of d.scientific_limits)lines.push('- '+l);
 lines.push('','**OD-02:** HELD · **Canonical mutation:** ZERO · **Experiment B:** HELD',
  '','Choices: '+d.decision_options.join(' · '),'',
  'Complete machine data includes 559 unadjudicated historical IDs and all role bindings. The in-chat decisions are scope-bound, not GitHub actions.',
  '','𝄐 Khona‌lit-po · Human closure RESERVED ⟐');
 return lines.join('\n')+'\n';
}
export function chatRevisionDocket(d){
 if(!validateRevisionDocket(d))fail('INVALID_ROD2');
 return {schema:'td613.rulefield.in-chat-revised-docket/v2',id:d.id,
  digest:d.sha256,source_head:d.source_head,workstreams:d.workstreams,
  groups:d.groups.map(g=>({...g,items:g.ids.map(id=>{
   const f=d.fields.find(x=>x.id===id);return {id,rank:f.rank,original:f.original_expression,label:f.academic_working_title};
  })})),
  roles:d.ontology.role_bindings,counts:d.ontology.counts,
  decisions:d.decision_options.map(choice=>({choice,
   draft:'𝌋 OPERATOR DECISION '+d.id+' SHA256 '+d.sha256+' '+choice+' selected [OPERATOR CHOOSES] no canonical merge or Flight'})),
  od02:'HELD',canonical_mutation:false};
}
export function stageRevisionDocket(d,{folder}={}){
 if(!validateRevisionDocket(d))fail('INVALID_ROD2');
 const dir=folder||fileURLToPath(new URL('../operator/dockets/outbox/',import.meta.url));
 const stem=d.id+'--'+d.sha256.slice(0,16);
 const files=[[stem+'.docket.md',renderRevisionDocket(d)],
  [stem+'.docket.json',JSON.stringify(d,null,2)+'\n'],
  [stem+'.chat.json',JSON.stringify(chatRevisionDocket(d),null,2)+'\n']];
 mkdirSync(dir,{recursive:true});
 for(const [name,content] of files){
  const p=join(dir,name);
  if(existsSync(p)){if(readFileSync(p,'utf8')!==content)fail('DUPLICATE_FILENAME_CONTENT_CONFLICT');}
  else writeFileSync(p,content,{flag:'wx',mode:0o600});
 }
 return {id:d.id,sha256:d.sha256,
  files:files.map(([name,s])=>({name,path:join(dir,name),hash:sha(s),bytes:Buffer.byteLength(s)})),
  operator_approval_recorded:false,canonical_mutated:false};
}
