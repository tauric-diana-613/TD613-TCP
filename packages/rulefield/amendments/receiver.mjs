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
import {enumerate,criticalPairs,finiteCA} from '../lab/multiway_lab.mjs';
import {buildOperatorDisclosure,renderOperatorDisclosure} from '../operator/disclosure.mjs';
import {detectPriorEntryCollisions} from './duplicate_gate.mjs';
import {proposedRuleGate} from '../rulefields/type_system.mjs';

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
/**
 * Source-free bounded experiment dispatcher; no eval or packet-defined callbacks.
 * A result attests ONLY the explicit deterministic toy model and finite bounds.
 */
export function runDeclaredFiniteExperiment(spec){
 requireOk(isObj(spec)&&string(spec.engine),'EXPERIMENT_ENGINE_UNDECLARED');
 const engine=spec.engine;
 const bound=(x,min,max,name)=>{requireOk(Number.isInteger(x)&&x>=min&&x<=max,'INVALID_EXPERIMENT_BOUND_'+name);return x;};
 if(engine==='FINITE_STRING_MULTIWAY'||engine==='FINITE_CRITICAL_PAIRS'){
   requireOk(Array.isArray(spec.rules)&&spec.rules.length>=1&&spec.rules.length<=8,'EXPERIMENT_RULE_COUNT_EXCEEDED');
   requireOk(typeof spec.initial==='string'&&/^[A-Z]{0,18}$/.test(spec.initial),'EXPERIMENT_INITIAL_INVALID');
   const depth=bound(spec.depth??2,0,4,'DEPTH');
   const maxLength=bound(spec.maxLength??18,1,18,'MAX_LENGTH');
   if(engine==='FINITE_STRING_MULTIWAY'){
    const maxPaths=bound(spec.maxPaths??500,2,1000,'MAX_PATHS');
    const out=enumerate(spec.initial,spec.rules,{depth,maxPaths,maxLength});
    const events=out.events.map(e=>({event_id:e.event_id,from:e.from,to:e.to,rule:e.rule,offset:e.offset,source_state:e.source_state,target_state:e.target_state}));
    return {engine,scope:'EXECUTED_LOCAL_FINITE_SOURCE_FREE_MODEL',initial:spec.initial,depth,
     event_count:events.length,event_digest:sha(JSON.stringify(events)),events_preview:events.slice(0,32),
     branch_pair_count:out.branchPairs.length,
     overlapping_branch_pair_count:out.branchPairs.filter(e=>e.redex_overlap).length,
     endpoint:out.endpoint,layer_counts:out.layerCounts,truncated:out.truncated,
     claim_ceiling:'BOUNDED_SYNTHETIC_ONLY',independent_replication:false,
     no_wolfram_kernel_claim:true,no_physical_inference:true};
   }
   const horizon=bound(spec.horizon??3,0,4,'HORIZON');
   const pairs=criticalPairs(spec.initial,spec.rules,{depth,horizon});
   return {engine,scope:'EXECUTED_LOCAL_FINITE_SOURCE_FREE_MODEL',initial:spec.initial,depth,horizon,
    critical_pair_count:pairs.length,pairs:pairs.slice(0,64),
    truncated_output:pairs.length>64,claim_ceiling:'BOUNDED_STRING_CRITICAL_PAIRS_ONLY',
    global_confluence_proven:false,independent_replication:false};
 }
 if(engine==='ELEMENTARY_CA'){
  const rule=bound(spec.rule,0,255,'CA_RULE');
  const width=bound(spec.width??41,5,61,'CA_WIDTH');
  const steps=bound(spec.steps??24,1,48,'CA_STEPS');
  const initial=spec.seed??null,perturb=spec.perturb??null;
  if(initial!==null)bound(initial,0,width-1,'CA_SEED');
  if(perturb!==null)bound(perturb,0,width-1,'CA_PERTURB');
  const out=finiteCA(rule,{width,steps,seed:initial,perturb,boundary:spec.boundary??'periodic'});
  return {engine,scope:'EXECUTED_LOCAL_FINITE_SOURCE_FREE_MODEL',rule,width,steps,boundary:out.boundary,
    rows:out.rows,spatial_binary_entropy_bits:out.spatial_binary_entropy_bits,
    perturbation_hamming_distance:out.perturbation_hamming_distance,
    claim_ceiling:'FINITE_SHANNON_AND_HAMMING_ONLY',proof_of_chaos:false,independent_replication:false};
 }
 fail('EXPERIMENT_ENGINE_NOT_IMPLEMENTED');
}
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
 const duplicateChecks=detectPriorEntryCollisions(packet.proposals,index);
 const dupById=new Map(duplicateChecks.map(x=>[x.proposal,x]));
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
  const typeGate=proposedRuleGate(item);
  if(typeGate.issues.length){
   deficiencies.push(...typeGate.issues);
   issues.push({proposal:item.id,kind:'RULEFIELD_RULE_TYPE_COLLAPSE',items:typeGate.issues,
    operator_resolution:'Separate a typed child rule from its parent field with state, guard, transition, observer and a new reviewable packet.'});
  }
  if(!string(controls.falsifier)||controls.falsifier.length<12)deficiencies.push('FALSIFIER_UNSPECIFIED');
  if(!string(controls.competent_null)||controls.competent_null.length<12)deficiencies.push('COMPETENT_NULL_UNSPECIFIED');
  if((evidence.source_refs||[]).length===0)deficiencies.push('SOURCE_NOT_REGISTERED');
  if(item.uncertainty?.claim_ceiling==='EMPIRICALLY_PROVEN'||item.uncertainty?.claim_ceiling==='SCIENTIFIC_LAW')deficiencies.push('CLAIM_PROMOTION_REQUIRES_INDEPENDENT_WITNESS');
  if(unresolved.length)issues.push({proposal:item.id,kind:'UNRESOLVED_REFERENCE',items:unresolved});
  if(deficiencies.length)issues.push({proposal:item.id,kind:'INCOMPLETE_RESEARCH_SPECIFICATION',items:deficiencies});
  const duplicates=dupById.get(item.id);
  if(duplicates?.matches.length)issues.push({proposal:item.id,kind:duplicates.status==='HELD_EXISTING_ENTRY_DUPLICATE'
   ?'EXISTING_RULEFIELD_ENTRY_DUPLICATE':'POSSIBLE_RULEFIELD_ENTRY_OVERLAP',items:duplicates.matches,
   operator_resolution:'Review the prior entry. Reuse it, distinguish an extension, or propose an explicitly anchored revision with a fresh dossier. No direct adoption.'});
  const readonlyAnchors=[...new Set(anchors.rules)].sort();
  const branchKey=packet.packet_id+':'+item.id;
  staged.push({
   branch_id:branchKey,kind:item.kind,hypothesis:item.hypothesis,label:item.label||item.id,
   anchors:{rules:readonlyAnchors,crossings:anchors.crossings,queue_ranks:anchors.queue_ranks},
   candidate_relations:item.relation?[{...item.relation,warrant:'PROPOSED_UNVERIFIED'}]:[],
   proposed_projection:item.projection||null, proposed_geometry:item.geometry||null,
   local_rewrite:item.nks?.local_rewrite||null,
   declared_finite_experiment:item.experiment?runDeclaredFiniteExperiment(item.experiment):{status:'NOT_REQUESTED',execution_credit:0},
   predicted_consequence:{prediction:item.prediction||'UNSPECIFIED',consequence:item.consequence||'UNSPECIFIED',observed:false},
   counterfactual_branches:[
    {branch:'PROPOSAL_SURVIVES_NULL',status:'UNEXECUTED',predicate:'independent matched null is outperformed'},
    {branch:'COMPETENT_NULL_TIE_OR_FAILURE',status:'UNEXECUTED',predicate:'strong null matches or defeats candidate'},
    {branch:'HISTORY_OR_WARRANT_UNRESOLVED',status:'UNEXECUTED',predicate:'unresolved references, custody or authorization'}
   ],
   controls:{falsifier:controls.falsifier||'UNSPECIFIED',competent_null:controls.competent_null||'UNSPECIFIED',negative_control:controls.negative_control||'UNSPECIFIED'},
   evidence:{...evidence,scientific_credit:0,external_origin_confirmed:false},
   diagnostic:{unresolved_references:unresolved,deficiencies,duplicates,type_admission:typeGate,requires_human_scientific_closure:true},
   scientific_state:typeGate.issues.length?'HELD_RULEFIELD_RULE_TYPE_COLLAPSE':duplicates?.status!=='NO_DUPLICATE_FOUND'?duplicates.status:'STAGED_RESEARCH_PROPOSAL_ONLY',
   never_merge_contradictions_automatically:true
  });
 }
 return {packet_id:packet.packet_id,packet_schema:PACKET_SCHEMA,baseline_matches:matches,
  status:!matches?'STALE_BASELINE_HELD':issues.some(x=>x.kind==='RULEFIELD_RULE_TYPE_COLLAPSE')?'HELD_RULEFIELD_RULE_TYPE_COLLAPSE':duplicateChecks.some(x=>x.status==='HELD_EXISTING_ENTRY_DUPLICATE')
   ?'HELD_EXISTING_ENTRY_DUPLICATE':duplicateChecks.some(x=>x.status==='HELD_POSSIBLE_ENTRY_OVERLAP')
   ?'HELD_POSSIBLE_ENTRY_OVERLAP':issues.length?'HELD_REVIEW_GAPS':'STAGED_FOR_REVIEW',
  duplicate_gate:{status:duplicateChecks.some(x=>x.matches.length)?'HELD_REVIEW_REQUIRED':'NO_COLLISION_DETECTED',
   checks:duplicateChecks, automatic_resolution:false, corpus_coverage:'EXACT_AND_LEXICAL_RULES_CROSSINGS_PRIORITY_AND_SAME_PACKET',
   semantic_equivalence_proven:false},
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
  interpretation:'Candidate branches remain proposed. Any declared finite lab model is executed only as a bounded source-free computational example; no independent empirical outcome, Wolfram kernel run, protected Flight or scientific novelty is thereby demonstrated.',
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
    '- **Finite experiment:** '+(p.declared_finite_experiment?.engine||'NOT_REQUESTED')+' / '+(p.declared_finite_experiment?.scope||'UNEXECUTED'),
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
 const disclosure=buildOperatorDisclosure(packet,receipt);
 if(write){
  mkdirSync(OUTBOX,{recursive:true});
  writeIfAbsent(join(OUTBOX,stem+'.review.json'),JSON.stringify(receipt,null,2)+'\n');
  writeIfAbsent(join(OUTBOX,stem+'.review.md'),markdownReceipt(receipt));
  writeIfAbsent(join(OUTBOX,stem+'.disclosure.json'),JSON.stringify(disclosure,null,2)+'\n');
  writeIfAbsent(join(OUTBOX,stem+'.disclosure.md'),renderOperatorDisclosure(disclosure));
 }
 return {name,disposition:receipt.disposition,review_stem:stem,disclosure_stem:stem,disclosure_sha256:disclosure.disclosure_sha256,
  human_decision_required:true,known_information_disclosed:true,canonical_integration_authority:false,
  proposal_count:receipt.as_source_free.proposal_count,issues:receipt.as_source_free.issues.length,mutated_registry:false};
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
