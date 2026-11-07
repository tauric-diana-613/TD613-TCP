/**
 * 𝌋 TD613 Rulefield Amendments / Kiki-Receiver v1.
 * Source-free, deterministic, no network, no execution of packet strings.
 * "Autosync" means inbox -> review receipts; never inbox -> canonical registry.
 * Node >= 20, ESM, standard library only.
 */
import {readFileSync,readdirSync,writeFileSync,mkdirSync,lstatSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {basename,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readRulefield,validateRulefield} from '../rulefield.mjs';

export const PACKET_SCHEMA='td613.rulefield.amendment-packet/v1';
export const REVIEW_SCHEMA='td613.rulefield.amendment-review/v1';
export const ROOT=fileURLToPath(new URL('./',import.meta.url));
export const INBOX=join(ROOT,'inbox'), OUTBOX=join(ROOT,'outbox');
const registryFile=fileURLToPath(new URL('../data/rulefield.v1.json',import.meta.url));
const sha=s=>createHash('sha256').update(s).digest('hex');
const fail=(code,message=code)=>{const e=new Error(message);e.code=code;throw e};
const requireOk=(ok,code)=>{if(!ok)fail(code)};
const isObj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const string=x=>typeof x==='string'&&x.trim().length>0;
const sourceList=['SOURCE_FREE_SYNTHETIC','PUBLIC_SOURCE_REPORTED','DOCUMENTARY_UNVERIFIED','OPERATOR_PROVIDED_THEORY','UNOBSERVED_HYPOTHESIS'];
const kinds=[
 'PROPOSE_RULE','PROPOSE_RELATION','PROPOSE_PROJECTION','PROPOSE_PREDICTION',
 'PROPOSE_GEOMETRY','PROPOSE_CONSEQUENCE','PROPOSE_ASSAY','RECORD_COUNTEREXAMPLE',
 'REQUEST_ALIAS_ADJUDICATION','REPAIR_INTEGRATION','PROPOSE_AMBIANCE_OBSERVER_ASSAY',
 'REFRACT_RULE','DOCUMENT_FAILED_ASSAY'
];
const lenses=[
 'NKS_LOCAL_REWRITE','MULTIWAY_HISTORY','PARANOID_REPARATIVE','CARO_INSTITUTIONAL_CORRIDOR',
 'BUTLER_ITERATIVE_CLASSIFICATION','SEDGWICK_UNFORCED_BRANCHED_READING',
 'COLLINS_DOTSON_MCKITTRICK_ACCESS','VIRILIO_FOUR_CLOCKS','AMBIANCE_OBSERVER_DIFFERENCE',
 'PHASONIC_RELATIONAL_GEOMETRY','BLACK_FEMINIST_DISTINCTION','GLISSANT_OPACITY',
 'INTEROPERABILITY_NONCONVERGENCE','COMPETENT_NULL_AND_FALSE_POSITIVE','UNCOMMANDED_NOVELTY'
];
export const receiverCapabilities=Object.freeze({schema:PACKET_SCHEMA,source_free:true,accepted_kinds:kinds,optional_lenses:lenses,
 flow:['ingest','verify baseline','type anchors','fork candidate branches','preserve falsifier/competent null','emit proposed projection+consequence','write review receipt'],
 automatic_actions:['SCAN_INBOX','WRITE_OUTBOX_RECEIPT'],
 forbidden_actions:['AUTO_APPLY_TO_REGISTRY','AUTO_RERANK','CHANGE_ORIGINAL_IPX','PROMOTE_PROOF','UNBLIND_PROTECTED_FLIGHT','MERGE','DEPLOY','NETWORK_FETCH','EXECUTE_PACKET_CODE'],
 caveat:'Source-free receiver, not scientific proof or a native instrument run.'});
export function registryDigest(){return sha(readFileSync(registryFile));}
export function packetTemplate({packet_id='RF-AP-20261107-001',author='Antigravity / Kenough',thread='NEW_THREAD_NOT_ADMITTED'}={}){
 requireOk(/^[A-Za-z0-9][A-Za-z0-9_-]{6,79}$/.test(packet_id),'INVALID_PACKET_ID');
 return {
  schema:PACKET_SCHEMA, packet_id,
  baseline:{registry_schema:'td613.rulefield.v1/rc1',registry_sha256:registryDigest(),queue_version:'70_APPEND_ONLY',flight:'HELD'},
  creator:{name:author,thread_ref:thread,role:'RESEARCH_RECEIVER',human_authorship:'RESERVED'},
  operator_authority:{reference:'SAC[X6ZNK5NO51]',scope:'SOURCE_FREE_PROSPECTIVE',auto_apply:false,auto_merge:false,auto_deploy:false,protected_flight:'HELD'},
  research_intent:'Explore a falsifiable alteration without auto-adopting any claim.',
  creative_invitations:['Let the branch surprise you','Keep two contradictory interpretations if warranted','Record a productive failure','Differentiate affective observations from source claims'],
  default_lenses:['NKS_LOCAL_REWRITE','MULTIWAY_HISTORY','PARANOID_REPARATIVE','COMPETENT_NULL_AND_FALSE_POSITIVE'],
  context:{historical_thread_excerpt:'',operator_request:'',source_notes:[],do_not_infer_unseen_sources:true},
  proposals:[{
   id:'AP01',kind:'PROPOSE_GEOMETRY',label:'A place to propose new situated geometry',
   anchors:{rules:['CBFE-RG-11'],crossings:['RF-X01'],queue_ranks:[4]},
   hypothesis:'Does the same public route cost conceal distinguishable consent and evidentiary histories under specified observation?',
   relation:{from:'CBFE-RG-11',to:'CBFE-RG-PATH-FIBER-01',type:'HYPOTHETICAL_WARRANTED_HISTORY_FIBER'},
   projection:{observer:'source-free observer',visible:['minimum_route_cost'],hidden:['route_history'],disclosure_boundary:'no private identities'},
   geometry:{objects:['typed hearing state','warranted path'],morphisms:['lawful admission','consented appeal'],metric:'finite path cost',equivalence:'public scalar equivalence',counterexample:'two histories with equal cost and different recorded route labels'},
   nks:{local_rewrite:'only admitted actions update a synthetic local state',branching:'enumerate every permitted action order',gluing:'retain nonjoinable histories as separate candidates'},
   prediction:'A scalar-only observer loses historical distinctions which a full-history baseline may retain.',
   consequence:'Do not claim novelty above information-matched full-history comparators.',
   controls:{falsifier:'The claimed new observable distinction disappears under an information-matched full-history null.',competent_null:'Independent full-history route enumeration with matched state, clocks, permissions and budget.',negative_control:'Swap cosmetic theme only; keep kernel inputs unchanged.'},
   evidence:{source_class:'SOURCE_FREE_SYNTHETIC',source_refs:['CBFE_DD02_COMPETENT_NULL_RESULT_V04.json'],observation_status:'HYPOTHESIS_NOT_NEWLY_OBSERVED',independent_replication:false},
   uncertainty:{claim_ceiling:'UNQUALIFIED_PROPOSAL',unresolved:['human observer effects','external validation']},
   artistic_notes:'No mirrors at the kiki: refract histories without inventing exteriority.'
  }]
 };
}
function validSimpleName(filename){
 requireOk(/^[A-Za-z0-9][A-Za-z0-9_.-]{0,119}\.json$/.test(filename)&&!filename.startsWith('.')&&!filename.includes('..'),'UNSAFE_PACKET_FILENAME');
 return filename;
}
function insideFile(folder,name){
 return join(folder,validSimpleName(basename(name)));
}
function getIndex(){const index=readRulefield();validateRulefield(index);return index;}
export function inspectPacket(packet,index=getIndex(),{strictBaseline=true}={}){
 requireOk(isObj(packet)&&packet.schema===PACKET_SCHEMA,'PACKET_SCHEMA_UNSUPPORTED');
 requireOk(string(packet.packet_id)&&/^[A-Za-z0-9][A-Za-z0-9_-]{6,79}$/.test(packet.packet_id),'INVALID_PACKET_ID');
 requireOk(isObj(packet.baseline)&&packet.baseline.registry_schema===index.schema,'MISSING_BASELINE');
 const expected=registryDigest(), matches=packet.baseline.registry_sha256===expected;
 if(strictBaseline)requireOk(matches,'STALE_REGISTRY_BASELINE');
 requireOk(isObj(packet.operator_authority),'MISSING_AUTHORITY_CONTRACT');
 const auth=packet.operator_authority;
 requireOk(auth.scope==='SOURCE_FREE_PROSPECTIVE'&&auth.auto_apply===false&&auth.auto_merge===false&&auth.auto_deploy===false&&auth.protected_flight==='HELD','AUTHORITY_ESCAPE_ATTEMPT');
 requireOk(Array.isArray(packet.proposals)&&packet.proposals.length>=1&&packet.proposals.length<=64,'BAD_PROPOSAL_COUNT');
 const knownRules=new Set(index.rules.map(x=>x.id));
 const knownCrossings=new Set(index.crossings.map(x=>x.id));
 const knownRanks=new Set(index.priority_queue.map(x=>x.rank));
 const proposalIds=new Set(),staged=[],issues=[];
 for(const item of packet.proposals){
  requireOk(isObj(item)&&string(item.id)&&/^[A-Z][A-Z0-9_-]{1,39}$/.test(item.id),'BAD_PROPOSAL_ID');
  requireOk(!proposalIds.has(item.id),'DUPLICATE_PROPOSAL_ID');proposalIds.add(item.id);
  requireOk(kinds.includes(item.kind),'UNSUPPORTED_AMENDMENT_OPERATION');
  requireOk(string(item.hypothesis)&&item.hypothesis.length>=20,'MISSING_HYPOTHESIS');
  requireOk(isObj(item.anchors),'MISSING_ANCHORS');
  const anchors={rules:item.anchors.rules??[],crossings:item.anchors.crossings??[],queue_ranks:item.anchors.queue_ranks??[]};
  for(const [k,a] of Object.entries(anchors))requireOk(Array.isArray(a)&&a.length<=40,'INVALID_ANCHOR_LIST_'+k);
  const unresolved=[];
  for(const ref of anchors.rules)if(!knownRules.has(ref))unresolved.push({kind:'RULE',token:ref});
  for(const ref of anchors.crossings)if(!knownCrossings.has(ref))unresolved.push({kind:'CROSSING',token:ref});
  for(const ref of anchors.queue_ranks)if(!knownRanks.has(ref))unresolved.push({kind:'PRIORITY',token:ref});
  requireOk(isObj(item.controls),'MISSING_CONTROLS');
  const controls=item.controls;
  const evidence=isObj(item.evidence)?item.evidence:{source_class:'UNOBSERVED_HYPOTHESIS',source_refs:[]};
  requireOk(sourceList.includes(evidence.source_class),'ILLEGAL_EVIDENCE_CLASS');
  requireOk(Array.isArray(evidence.source_refs||[])&&(evidence.source_refs||[]).length<=60,'INVALID_SOURCE_REFS');
  const deficiencies=[];
  if(!string(controls.falsifier)||controls.falsifier.length<12)deficiencies.push('FALSIFIER_UNSPECIFIED');
  if(!string(controls.competent_null)||controls.competent_null.length<12)deficiencies.push('COMPETENT_NULL_UNSPECIFIED');
  if((evidence.source_refs||[]).length===0)deficiencies.push('SOURCE_NOT_REGISTERED');
  if(item.uncertainty?.claim_ceiling==='EMPIRICALLY_PROVEN'||item.uncertainty?.claim_ceiling==='SCIENTIFIC_LAW')deficiencies.push('CLAIM_PROMOTION_REQUIRES_INDEPENDENT_WITNESS');
  if(unresolved.length)issues.push({proposal:item.id,kind:'UNRESOLVED_REFERENCE',items:unresolved});
  if(deficiencies.length)issues.push({proposal:item.id,kind:'INCOMPLETE_RESEARCH_SPECIFICATION',items:deficiencies});
  const readonlyAnchors=[...new Set(anchors.rules)].sort();
  const branchKey=packet.packet_id+':'+item.id;
  staged.push({
   branch_id:branchKey,kind:item.kind,hypothesis:item.hypothesis,label:item.label||item.id,
   anchors:{rules:readonlyAnchors,crossings:anchors.crossings,queue_ranks:anchors.queue_ranks},
   candidate_relations:item.relation?[{...item.relation,warrant:'PROPOSED_UNVERIFIED'}]:[],
   proposed_projection:item.projection||null, proposed_geometry:item.geometry||null,
   local_rewrite:item.nks?.local_rewrite||null,
   predicted_consequence:{prediction:item.prediction||'UNSPECIFIED',consequence:item.consequence||'UNSPECIFIED',observed:false},
   counterfactual_branches:[
    {branch:'PROPOSAL_SURVIVES_NULL',status:'UNEXECUTED',predicate:'independent matched null is outperformed'},
    {branch:'COMPETENT_NULL_TIE_OR_FAILURE',status:'UNEXECUTED',predicate:'strong null matches or defeats candidate'},
    {branch:'HISTORY_OR_WARRANT_UNRESOLVED',status:'UNEXECUTED',predicate:'unresolved references, custody or authorization'}
   ],
   controls:{falsifier:controls.falsifier||'UNSPECIFIED',competent_null:controls.competent_null||'UNSPECIFIED',negative_control:controls.negative_control||'UNSPECIFIED'},
   evidence:{...evidence,scientific_credit:0,external_origin_confirmed:false},
   diagnostic:{unresolved_references:unresolved,deficiencies,requires_human_scientific_closure:true},
   scientific_state:'STAGED_RESEARCH_PROPOSAL_ONLY',
   never_merge_contradictions_automatically:true
  });
 }
 return {packet_id:packet.packet_id,packet_schema:PACKET_SCHEMA,baseline_matches:matches,
  status:!matches?'STALE_BASELINE_HELD':issues.length?'HELD_REVIEW_GAPS':'STAGED_FOR_REVIEW',
  issues,proposals:staged,proposal_count:staged.length,release_authority:false,scientific_credit:0};
}
export function reviewPacket(packet,index=getIndex(),opts={}){
 const assessment=inspectPacket(packet,index,opts);
 const contentFingerprint=sha(JSON.stringify(packet));
 return {
  schema:REVIEW_SCHEMA,packet_id:packet.packet_id,packet_sha256:contentFingerprint,baseline_registry_sha256:packet.baseline.registry_sha256,
  receiver_version:'KIKI_RECEIVER_V1',disposition:assessment.status,
  as_source_free:assessment,operator_review_required:true,
  original_registry_mutated:false, historical_190_mutated:false, inherited_IPX_mutated:false,
  automatic_branch_merge:false,automatic_experiment_adoption:false,protected_experiment_b:'HELD',
  interpretation:'Candidate branch descriptions, not executed NKS transitions or observed empirical outcomes.',
  human_closure:'RESERVED'
 };
}
function markdownReceipt(receipt){
 const lines=[
  '# 𝌋 Rulefield amendment review — '+receipt.packet_id,'',
  '**Disposition:** '+receipt.disposition+' · **Scientific credit:** 0 · **Human closure:** RESERVED.',
  '**Packet digest:** \x60'+receipt.packet_sha256+'\x60','',
  '> This review is a source-free candidate plan. Nothing has merged into the Rulefield, modified historical evidence, or activated protected Flight.','',
  '## Proposed branch and consequence map',''
 ];
 for(const p of receipt.as_source_free.proposals){
   lines.push('### '+p.branch_id+' · '+p.kind,'',p.hypothesis,'',
    '- **Anchors:** '+[...p.anchors.rules,...p.anchors.crossings,...p.anchors.queue_ranks.map(x=>'Q'+String(x).padStart(2,'0'))].join(', '),
    '- **Falsifier:** '+p.controls.falsifier,
    '- **Competent comparison:** '+p.controls.competent_null,
    '- **Prediction:** '+p.predicted_consequence.prediction,
    '- **Consequence:** '+p.predicted_consequence.consequence,
    '- **Status:** '+p.scientific_state,'');
 }
 if(receipt.as_source_free.issues.length)lines.push('## Held deficiencies','',...receipt.as_source_free.issues.map(x=>'- '+x.proposal+': '+x.kind+' / '+JSON.stringify(x.items)));
 lines.push('','## Follow-up gates','','1. Operator selects candidates to pursue.','2. Resolve ambiguous source and alias references without auto-identification.','3. Preregister falsifiers and competent nulls.','4. Run a separate source-free assay; record any tie or failure.','5. Request separate authorized promotion only when independent evidence warrants.','','𝄐 Khona‌lit-po · Unmerged ⟐');
 return lines.join('\n')+'\n';
}
function writeIfAbsent(path,data){
 if(existsSync(path)){
  requireOk(readFileSync(path,'utf8')===data,'RECEIPT_NAME_COLLISION');
  return 'UNCHANGED_IDEMPOTENT';
 }
 writeFileSync(path,data,{flag:'wx',encoding:'utf8',mode:0o600});
 return 'CREATED';
}
function validatedInboxFiles(){
 mkdirSync(INBOX,{recursive:true});mkdirSync(OUTBOX,{recursive:true});
 const names=readdirSync(INBOX).filter(s=>s.endsWith('.json')).sort();
 for(const name of names){validSimpleName(name);requireOk(lstatSync(insideFile(INBOX,name)).isFile(),'NON_FILE_IN_INBOX');}
 return names;
}
export function intakeOne(name,{write=false}={}){
 validSimpleName(name);const path=insideFile(INBOX,name);
 requireOk(lstatSync(path).isFile(),'PACKET_NOT_REGULAR_FILE');
 requireOk(lstatSync(path).size<=256*1024,'PACKET_EXCEEDS_LOCAL_CAP');
 const packet=JSON.parse(readFileSync(path,'utf8'));
 const receipt=reviewPacket(packet);
 const stem=packet.packet_id+'--'+receipt.packet_sha256.slice(0,16);
 if(write){
  mkdirSync(OUTBOX,{recursive:true});
  writeIfAbsent(join(OUTBOX,stem+'.review.json'),JSON.stringify(receipt,null,2)+'\n');
  writeIfAbsent(join(OUTBOX,stem+'.review.md'),markdownReceipt(receipt));
 }
 return {name,disposition:receipt.disposition,review_stem:stem,proposal_count:receipt.as_source_free.proposal_count,issues:receipt.as_source_free.issues.length,mutated_registry:false};
}
export function syncInbox({write=true}={}){
 const names=validatedInboxFiles(),results=[];
 for(const name of names){
  try{results.push(intakeOne(name,{write}));}
  catch(e){results.push({name,status:'REJECTED',code:e.code||'INVALID_PACKET',message:e.message,mutated_registry:false});}
 }
 return {schema:'td613.rulefield.autosync/v1',mode:'INBOX_TO_REVIEW_ONLY',source_count:names.length,results,canonical_registry_unchanged:true,protected_flight:'HELD',human_closure:'RESERVED'};
}
export function initInbox(id='RF-AP-20261107-001'){
 const template=packetTemplate({packet_id:id});
 mkdirSync(INBOX,{recursive:true});const filename=id+'.json';
 writeIfAbsent(insideFile(INBOX,filename),JSON.stringify(template,null,2)+'\n');
 return {packet:filename,registry_sha256:template.baseline.registry_sha256,location:'packages/rulefield/amendments/inbox/',status:'TEMPLATE_CREATED_NOT_SUBMITTED'};
}
