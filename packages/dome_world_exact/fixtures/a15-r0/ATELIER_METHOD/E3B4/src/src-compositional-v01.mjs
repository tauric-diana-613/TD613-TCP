/**
 * TD613 E3-B.4 · SRC source-free compositional inheritance candidate.
 * Invented source fixtures ONLY. Never accesses source estates or performs SRC sync.
 * Original #1605 operators imported in separate paths; new recipient logic is
 * not presented as an independently implemented SRC research algorithm.
 * Human authority, final scientific and release closure RESERVED.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { METHOD, representationSufficiency, nonLiftPath, stageIntake, validateProfile, compileTypedProjections } from '../seed/atelier-core-v02.mjs';
import { resolveSourceEntity, polycompilationConservation, adjudicateConservationRegister, preregisterThreeStratum, independentEvidenceSupport } from '../seed/atelier-parity-operators-v02.mjs';
import { assemblePolycompiler, traceTypedCompilations, roleAblation } from '../seed/atelier-semantic-polycompiler-v02.mjs';
import { bindExactSourceSpan } from '../seed/atelier-mechanism-discrimination-v02.mjs';
import { lockProspectivePlan } from '../seed/atelier-prospective-controls-v02.mjs';

const sha=buf=>createHash('sha256').update(buf).digest('hex');
const reject=(code)=>{throw Object.assign(new Error(code),{code})};
const ok=(v,code)=>{if(!v)reject(code)};
const is=x=>typeof x==='string'&&x.length>0;
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const utf=x=>Buffer.from(JSON.stringify(x),'utf8');
const root=path.dirname(fileURLToPath(import.meta.url));
const SEED=path.resolve(root,'../seed');
// Git blobs are checked against the exact #1605 source identities. This is a
// local source-custody check, NOT a pre-import or external trust-root signature.
export const PINNED_SEED_BLOBS=Object.freeze({
 'atelier-core-v02.mjs':'48a8f0eaa224e9850897a91028dbb63ab25c70ad',
 'atelier-scaffold-v02.mjs':'c1e541cb84c37d105642535c52c12a45c674f1ff',
 'atelier-method-v0.2-candidate.json':'471048d73dac00f7b419b28d168f75567e89f150',
 'atelier-parity-operators-v02.mjs':'39ff91ae97a1064be33dbff210d1fb2a72116d81',
 'atelier-mechanism-discrimination-v02.mjs':'ed7866467ab030a56373fc92d4b87bbf9bab3c00',
 'atelier-prospective-controls-v02.mjs':'5e1a439e9c9abb94c1dac4d9320f9a3eb41d84ed',
 'atelier-semantic-polycompiler-v02.mjs':'b0b607dd19a5c655b42139ee53be3ae9c040a748'
});
export function checkPinnedSeedFiles(seedDir=SEED){
 for(const [filename,expected] of Object.entries(PINNED_SEED_BLOBS)){
  const pathname=path.join(seedDir,filename);ok(fs.existsSync(pathname)&&fs.statSync(pathname).isFile()&&!fs.lstatSync(pathname).isSymbolicLink(),'PINNED_SOURCE_FILE_MISSING');
  const raw=fs.readFileSync(pathname);const actual=createHash('sha1').update(Buffer.from('blob '+raw.length+'\0')).update(raw).digest('hex');
  ok(actual===expected,'SOURCE_PINNED_BLOB_MISMATCH:'+filename);
 }
 return {verified_files:7,source_identity:'EXACT_1605_GIT_BLOBS',preimport_authority_verified:false};
}
export const EPOCH='SRC-E3B4-INVENTED-20261102';
export const RIGHTS='INVENTED_SOURCE_FREE_PUBLIC_METADATA';
export const FIVE=['Q_place','Q_history','Q_bridge','Q_type','Q_reader'];
export const SURFACES=['CANON_MAP','CANON_AND_FIELD_ARCHITECTURE','PROVENANCE_REGISTRY','SR_CFIF','IDENTITY_REGISTRY','SIGNATURE_EXPLORE'];
export const SURFACE_MATRIX=Object.freeze({
 Q_place:{CANON_MAP:'SUFFICIENT',CANON_AND_FIELD_ARCHITECTURE:'SUFFICIENT',PROVENANCE_REGISTRY:'PARTIAL',SR_CFIF:'PARTIAL',IDENTITY_REGISTRY:'PARTIAL',SIGNATURE_EXPLORE:'INSUFFICIENT'},
 Q_history:{CANON_MAP:'INSUFFICIENT',CANON_AND_FIELD_ARCHITECTURE:'PARTIAL',PROVENANCE_REGISTRY:'SUFFICIENT',SR_CFIF:'INSUFFICIENT',IDENTITY_REGISTRY:'PARTIAL',SIGNATURE_EXPLORE:'INSUFFICIENT'},
 Q_bridge:{CANON_MAP:'PARTIAL',CANON_AND_FIELD_ARCHITECTURE:'PARTIAL',PROVENANCE_REGISTRY:'INSUFFICIENT',SR_CFIF:'SUFFICIENT',IDENTITY_REGISTRY:'INSUFFICIENT',SIGNATURE_EXPLORE:'INSUFFICIENT'},
 Q_type:{CANON_MAP:'PARTIAL',CANON_AND_FIELD_ARCHITECTURE:'SUFFICIENT',PROVENANCE_REGISTRY:'PARTIAL',SR_CFIF:'PARTIAL',IDENTITY_REGISTRY:'SUFFICIENT',SIGNATURE_EXPLORE:'INSUFFICIENT'},
 Q_reader:{CANON_MAP:'INSUFFICIENT',CANON_AND_FIELD_ARCHITECTURE:'INSUFFICIENT',PROVENANCE_REGISTRY:'INSUFFICIENT',SR_CFIF:'INSUFFICIENT',IDENTITY_REGISTRY:'INSUFFICIENT',SIGNATURE_EXPLORE:'SUFFICIENT'}
});
export const SRC_FAMILIES=Object.freeze([
 'SEALED_EPOCH_QUERY_AUTHORITY','QUERY_CONDITIONED_CANONICAL_SUFFICIENCY',
 'POLYCOMPILATION_CONSERVATION','MULTI_COORDINATE_NAVIGATION','TYPE_CONDITIONED_CROSS_SURFACE_IDENTITY',
 'DIACHRONIC_RECLASSIFICATION','TYPED_NON_LIFT_RELATION_COMPOSITION',
 'DEFERRED_SEMANTIC_ADDRESS_RESOLUTION','PROJECTIVE_ROUTING_HOSTILE_NULLS',
 'THREE_STRATUM_RECONSTRUCTION','COMPILER_PROJECTION_CONSERVATION','AUTHORITATIVE_CURRENT_VS_HISTORY'
]);
export const STATUS_LIMIT='SYNTHETIC_SOURCE_FREE_NO_SRC_CORPUS_FIDELITY_OR_SCIENTIFIC_PROMOTION';

// Synthetic receipt is supplied by an INDEPENDENT test fixture maker. This
// digest and test-only witness prove integrity within an invented experiment;
// they do not authenticate real-world rights or independent physical origin.
export function makeTestWitness({sourceId,bytes,epoch=EPOCH,nonce='FIXTURE-WITNESS-A'}) {
 ok(is(sourceId)&&Buffer.isBuffer(bytes)&&is(nonce),'FIXTURE_WITNESS_ARGS');
 return {schema:'td613.e3b4-test-witness/v1',source_id:sourceId,epoch,rights:RIGHTS,
  source_sha256:sha(bytes),nonce,witness_class:'SYNTHETIC_INDEPENDENT_TEST_PREP',
  proof:sha(utf([sourceId,epoch,RIGHTS,sha(bytes),nonce,'E3B4_SOURCE_FREE']))};
}
function checkWitness(w,sourceId,bytes,expectedEpoch){
 ok(w?.source_id===sourceId&&w?.epoch===expectedEpoch&&w?.rights===RIGHTS&&
 w?.witness_class==='SYNTHETIC_INDEPENDENT_TEST_PREP'&&w?.source_sha256===sha(bytes)&&is(w?.nonce),
 'SYNTHETIC_WITNESS_MISSING_OR_MISMATCH');
 ok(w.proof===sha(utf([sourceId,expectedEpoch,RIGHTS,sha(bytes),w.nonce,'E3B4_SOURCE_FREE'])),'SYNTHETIC_WITNESS_CORRUPT');
}
function safeDir(p){ok(path.isAbsolute(p),'ABSOLUTE_TEST_DIRECTORY_REQUIRED');let a=path.resolve(p);ok(!fs.existsSync(a),'TEST_TARGET_ALREADY_EXISTS');return a}
function validFixture(s){
 ok(s?.schema==='td613.e3b4-src-invented-fixture/v1'&&s.epoch===EPOCH&&s.rights===RIGHTS&&s.synthetic_only===true,'WRONG_EPOCH_RIGHTS_OR_SOURCE_CLASS');
 ok(Array.isArray(s.surfaces)&&Array.isArray(s.edges)&&Array.isArray(s.history)&&Array.isArray(s.routes)&&Array.isArray(s.formal_layers),'FIXTURE_SHAPE');
 ok(s.formal_layers.length===9&&new Set(s.formal_layers).size===9&&s.routes.length===8&&new Set(s.routes.map(x=>x.route_id)).size===8,'NINE_LAYERS_EIGHT_ROUTES');
 ok(s.surfaces.every(x=>SURFACES.includes(x.surface)&&x.evidence_class==='INVENTED_SOURCE_FREE'&&is(x.source_id)),'SURFACE_SOURCE_OR_RIGHTS');
 const prohibited=['private_body','full_post_body','original_private_text','external_corpus','protected_archive'];
 ok(!prohibited.some(x=>Object.hasOwn(s,x)),'FORBIDDEN_CONTENT_FIELD');
 for(const x of s.edges)ok(is(x.source_id)&&is(x.from)&&is(x.to)&&is(x.graph)&&is(x.relation)&&x.evidence_class==='INVENTED_SOURCE_FREE','EDGE_PROVENANCE_REQUIRED');
 return s;
}
export async function initializeEmptyChamber(dir,{id='SRC_E3B4',seedDir=SEED}={}){
 ok(/^[A-Z][A-Z0-9_]{2,63}$/.test(id),'ATELIER_ID_INVALID');
 checkPinnedSeedFiles(seedDir);
 const target=safeDir(dir);fs.mkdirSync(target,{recursive:true});
 // Initialize the authentic #1605 scaffold in a detached copied seed directory.
 const isolatedSeed=path.join(target,'SEED');fs.cpSync(seedDir,isolatedSeed,{recursive:true,errorOnExist:true});
 const {createEmptyAtelier}=await import(pathToFileURL(path.join(isolatedSeed,'atelier-scaffold-v02.mjs')).href);
 const realDest=path.join(target,id);
 const info=createEmptyAtelier(id,{display_name:'SRC E3-B.4 SYNTHETIC ONLY',destination:realDest,create:true});
 const profile=JSON.parse(fs.readFileSync(path.join(realDest,'ATELIER_PROFILE.json'),'utf8'));
 validateProfile(profile);
 ok(Object.keys(profile.modules).length===44&&profile.source_count===0&&
  Object.values(profile.modules).filter(x=>x.callable_available).length===1&&
  profile.claim_ceiling==='NO_SOURCES_NO_RESEARCH_RESULT','EMPTY_SEED_CONTRACT_FAILED');
 fs.mkdirSync(path.join(target,'E3B4_SYNTHETIC_CUSTODY'));
 return {root:target,atelier:realDest,id,profile,status:'EMPTY_NO_REAL_SOURCES',initialized_using:'EXACT_1605_SEED_IN_ISOLATED_COPY',shell:info};
}
export function stageSynthetic(chamber,{sourceId,fixture,receipt,expectedEpoch=EPOCH}){
 const dir=path.join(chamber.root,'E3B4_SYNTHETIC_CUSTODY');
 ok(is(sourceId)&&sourceId.startsWith('FIXTURE-SRC-'),'SOURCE_ID_SYNTHETIC_REQUIRED');
 const s=validFixture(fixture),bytes=utf(s);checkWitness(receipt,sourceId,bytes,expectedEpoch);
 const staged=stageIntake({bytes,filename:sourceId+'.json',source_provenance:'INVENTED_SRC_E3B4_NO_REAL_SOURCE',rights:'PUBLIC',epoch:expectedEpoch,authorization:false});
 ok(staged.state==='STAGED_UNADMITTED'&&!staged.source_import_authorized,'SOURCE_STAGE_PRECONDITION');
 const stem=sha(Buffer.from(sourceId)).slice(0,20);
 const original=path.join(dir,stem+'.json'),rpath=path.join(dir,stem+'.receipt.json');
 ok(!fs.existsSync(original)&&!fs.existsSync(rpath),'DUPLICATE_OR_REPLAY_SOURCE');
 fs.writeFileSync(original,bytes,{flag:'wx'});
 // Separate instrument receipt: test-only authority, never a production signature.
 fs.writeFileSync(rpath,JSON.stringify({source_id:sourceId,expected_epoch:expectedEpoch,source_sha256:sha(bytes),
  witness:receipt,staged_state:staged.state,synthetic_status:'SYNTHETIC_TEST_ONLY_NEVER_AUTHORIZED_SOURCE_ADMISSION',
  source_path:path.basename(original),closed:false},null,2)+'\n',{flag:'wx'});
 return {source_id:sourceId,staged_state:staged.state,synthetic_status:'SYNTHETIC_FIXTURE_ACCEPTED_BY_TEST_NAMESPACE',
  source_sha256:sha(bytes),real_profile_source_count:chamber.profile.source_count};
}
export function readSynthetic(chamber,sourceId){
 const dir=path.join(chamber.root,'E3B4_SYNTHETIC_CUSTODY');
 const stem=sha(Buffer.from(sourceId)).slice(0,20),rpath=path.join(dir,stem+'.receipt.json');
 ok(fs.existsSync(rpath),'SOURCE_NOT_ADMITTED_SYNTHETICALLY');
 let r;try{r=JSON.parse(fs.readFileSync(rpath,'utf8'));}catch{reject('RECEIPT_CORRUPT')}
 ok(r?.source_id===sourceId&&r?.expected_epoch===EPOCH&&r?.closed===false,'RECEIPT_REVOKED_OR_WRONG_EPOCH');
 const source=path.join(dir,stem+'.json');
 ok(r.source_path===path.basename(source)&&fs.existsSync(source),'SOURCE_ORIGINAL_MISSING');
 const bytes=fs.readFileSync(source);
 checkWitness(r.witness,sourceId,bytes,EPOCH);
 ok(r.source_sha256===sha(bytes)&&r.staged_state==='STAGED_UNADMITTED'&&r.synthetic_status==='SYNTHETIC_TEST_ONLY_NEVER_AUTHORIZED_SOURCE_ADMISSION','RECEIPT_INTEGRITY_FAILED');
 let fixture;try{fixture=JSON.parse(bytes.toString('utf8'));}catch{reject('ORIGINAL_BYTES_CORRUPT')}
 validFixture(fixture);return {fixture,receipt:r,bytes};
}
export function withdrawSynthetic(chamber,sourceId){
 const stem=sha(Buffer.from(sourceId)).slice(0,20),dir=path.join(chamber.root,'E3B4_SYNTHETIC_CUSTODY');
 const p=path.join(dir,stem+'.receipt.json');ok(fs.existsSync(p),'RECEIPT_ABSENT');
 const r=JSON.parse(fs.readFileSync(p,'utf8'));ok(!r.closed,'ALREADY_WITHDRAWN');r.closed=true;r.withdrawal='SYNTHETIC_WITNESS_WITHDRAWAL';
 fs.writeFileSync(p,JSON.stringify(r,null,2)+'\n');return {status:'SYNTHETIC_WITHDRAWN',source_id:sourceId};
}
export function reopenEmptyChamber(dir,{id='SRC_E3B4'}={}){
 const profile=JSON.parse(fs.readFileSync(path.join(dir,id,'ATELIER_PROFILE.json'),'utf8'));
 validateProfile(profile);ok(profile.source_count===0&&profile.current_findings.length===0,'REAL_PROFILE_POLLUTED');
 return {root:dir,atelier:path.join(dir,id),id,profile,status:'REOPENED_SOURCE_FREE_CANDIDATE'};
}
export function selectedSurface(q,{requested=null,available=SURFACES}={}){
 ok(FIVE.includes(q),'UNKNOWN_RESEARCH_QUESTION');
 const m=SURFACE_MATRIX[q];const usable=available.filter(s=>m[s]==='SUFFICIENT');
 if(requested!==null){ok(SURFACES.includes(requested),'UNREGISTERED_SURFACE');
  if(!available.includes(requested))return {question:q,requested,chosen:null,status:'ABSTAIN_SURFACE_NOT_ADMITTED',sufficiency:'UNOBSERVED',authority:'SYNTHETIC_QUESTION_CONDITIONED_SELECTION'};
  return {question:q,requested,chosen:m[requested]==='SUFFICIENT'?requested:null,
   status:m[requested]==='SUFFICIENT'?'SOURCE_FREE_SURFACE_SELECTED':'ABSTAIN_WRONG_AUTHORITY_SURFACE',
   sufficiency:m[requested],authority:'SYNTHETIC_QUESTION_CONDITIONED_SELECTION'};}
 return {question:q,chosen:usable[0]??null,alternatives:usable,status:usable.length?'SOURCE_FREE_SURFACE_SELECTED':'NO_SUFFICIENT_SURFACE',authority:'SYNTHETIC_QUESTION_CONDITIONED_SELECTION'};
}
export function nativeSufficiencyMatrix(){
 const qs=['Q_place','Q_history','Q_bridge','Q_type','Q_reader'];const sr=['CANON_MAP','CANON_AND_FIELD_ARCHITECTURE','PROVENANCE_REGISTRY','SR_CFIF','SIGNATURE_EXPLORE'];
 const cells={},refs={};for(const q of qs)for(const s of sr){cells[q+'::'+s]=SURFACE_MATRIX[q][s];refs[q+'::'+s]=['SOURCE_GROUNDED_SRC_2026_09_14_REST_SYNTHETIC_REPLAY'];}
 return representationSufficiency({questions:qs,surfaces:sr,cells,evidence_refs:refs});
}
export function mapTraversal(f,{from,to,graph='G_CANON',maxHops=4}){
 ok(is(from)&&is(to)&&Number.isInteger(maxHops)&&maxHops>=1&&maxHops<=5,'PATH_QUERY_INVALID');
 const sourceIds=new Set(f.surfaces.map(s=>s.source_id));
 const admissible=f.edges.filter(e=>e.graph===graph&&e.witness_id&&sourceIds.has(e.source_id)&&e.evidence_class==='INVENTED_SOURCE_FREE');
 const paths=[],walk=(at,used,nodes)=>{if(used.length>=maxHops)return;for(const e of admissible.filter(e=>e.from===at)){if(nodes.has(e.to))continue;const steps=[...used,e];if(e.to===to){paths.push({edges:steps.map(x=>x.edge_id),relations:steps.map(x=>x.relation),source_coordinates:steps.map(x=>x.source_id),hop_count:steps.length});}else walk(e.to,steps,new Set([...nodes,e.to]));}};
 walk(from,[],new Set([from]));return {from,to,graph,paths,status:paths.length?'WITNESSED_TYPED_PATH':'EXECUTED_ZERO_NO_PATH',
  direct_identity_admitted:false,direct_causation_admitted:false,direct_genealogy_admitted:false,
  geometry_measured:false};
}
const DISCRIMINANTS={OPERATOR:['operator_id','domain_binding','input_signature','output_signature'],FIELD_PROGRAM:['type','canonical_id','program_parent'],LINEAGE:['ancestor_id','lineage_rule'],TRANSLATION:['original_work_id','representation_role'],SIGNATURE:['exact_phrase','host_source_id']};
export function compareTypeIdentity(a,b){
 const t=a?.entity_type;ok(is(t),'ENTITY_TYPE_REQUIRED');
 if(!DISCRIMINANTS[t]||b?.entity_type!==t)return {status:'HELD_AMBIGUOUS_OR_DIFFERENT_TYPE',same_object_admitted:false};
 const keys=DISCRIMINANTS[t];const complete=keys.every(k=>is(a[k])&&is(b[k]));
 if(!complete)return {status:'HELD_MISSING_TYPE_DISCRIMINANT',required:keys,same_object_admitted:false};
 const same=keys.every(k=>a[k]===b[k]);return {status:same?'TYPE_LOCAL_SIGNATURE_MATCH':'TYPE_LOCAL_FALSE_TWIN',type_local_match:same,same_object_admitted:false,
  // matched signatures are shared occurrences, not cross-host scientific identity
  required:keys,scientific_identity_established:false};
}
export function diachronic(f,currentId){
 const entries=f.history.filter(x=>x.current_id===currentId);
 return {current_id:currentId,predecessors:entries.map(x=>x.previous_id),
  historical_types:entries.map(x=>x.from_type),current_types:[...new Set(entries.map(x=>x.to_type))],
  unique_origin_reconstructible:entries.length===1&&entries[0].ancestry_witness===true,
  status:entries.length?'HISTORICAL_PROVENANCE_ROWS_RETAINED_SYNTHETIC':'NO_HISTORICAL_WITNESS',
  present_placement_is_provenance_complete:false,unresolved_order:true};
}
export function explore(f,{destination,signature=null,nearMatch=false}={}){
 ok(is(destination),'PROJECTIVE_DESTINATION_REQUIRED');
 const routes=f.routes.filter(r=>r.explore_address===`Explore: ${destination}`);
 if(routes.length!==1)return {status:routes.length?'AMBIGUOUS_READER_ROUTE':'UNRESOLVED_READER_ROUTE',scientific_identity:false,host_identity:false};
 if(nearMatch)return {status:'NEAR_MATCH_REFUSED',scientific_identity:false,host_identity:false};
 if(signature!==null&&routes[0].signature!==signature)return {status:'SIGNATURE_MISMATCH',scientific_identity:false,host_identity:false};
 return {status:'SYNTHETIC_READER_ROUTE_RESOLVED',route_id:routes[0].route_id,coordinate:routes[0].coordinate,
  source_id:routes[0].source_id,scientific_identity:false,host_identity:false,decodes_hidden_authorship:false};
}
export function hostileProjectiveNulls(f){
 const exact=explore(f,{destination:'LA CARTOGRAFÍA DEL UMBRAL',signature:'Tú puedes clonarme, pero no tienes mis genes.'});
 const near=explore(f,{destination:'LA CARTOGRAFIA DEL UMBRAL'});
 const ambiguous=explore(f,{destination:'AMBIGUOUS HOST'});
 const template=explore(f,{destination:'TEMPLATE-ONLY'});
 return {exact,near,ambiguous,template,held_no_intent_inference:true,
  // This is not an independent SRC source replay or a free-form language model classifier.
  scientific_routing_fidelity:'HELD_NO_SOURCE_NATIVE_ORACLE'};
}
export function projectedCompilation(f){
 const roles=['LEXICON','HANDBOOK','CANON_MAP','DEPLOYMENT'];
 const ledger=Object.fromEntries(roles.map(role=>[role,f.claims.filter(x=>x.role===role).map(x=>({claim_id:x.claim_id,source_ids:[x.source_id],evidence_class:x.evidence_class}))]));
 const shared=['PRESERVED_RELATION'];
 const c=polycompilationConservation({epoch:f.epoch,source_rows:f.surfaces.map(x=>({source_id:x.source_id})),roles,
 shared_claim_ids:shared,role_claims:ledger});
 const losses=roles.map(role=>({role,omitted_claim_ids:f.claims.filter(x=>x.role!==role).map(x=>x.claim_id).filter((x,i,a)=>a.indexOf(x)===i)}));
 return {receipt:c,losses,role_count:roles.length,scientific_equivalence_established:false};
}
export function syntheticRoleModel(f){
 const roles=f.role_assertions,passes=f.compilation_passes;
 const m=assemblePolycompiler({snapshot_id:f.epoch,seal_id:'SYNTHETIC_SEAL_E3B4',compilation_passes:passes,role_assertions:roles});
 return {model:m,trace:traceTypedCompilations(m,{from:'A',to:'C',max_hops:3}),ablation:roleAblation(m,{target_id:'C',withdraw_assertion_ids:['r2']})};
}
export function threeStratumPlan(f){
 const p=preregisterThreeStratum({snapshot_id:f.epoch,epoch_seal:'SYNTHETIC_SEAL_E3B4',targets:['FROZEN_INVENTED_RELATION'],
  matched_budget:'ONE_TOKENIZED_WITNESS_PER_STRATUM_WITH_MISSING_CELL_PADDING',
  blind_seed_commitment:'SYNTHETIC_SEED_COMMITTED_BEFORE_TEST',
  control_specification:'MORE_TEXT_TEMPLATE_TOPIC_DENSITY_LABEL_LEAKAGE_CHRONOLOGY_LEAKAGE'});
 ok(p.subsets.length===7&&Object.values(p.statuses).every(x=>x==='NOT_EXECUTED'),'THREE_STRATUM_PRE_REG_INVALID');
 return {...p,experimental_SRC_result:'HELD_UNWITNESSED',synthetic_protocol_only:true};
}
export function runSRC(chamber,sourceId,{family,question,requestedSurface,currentId,from,to,graph,entityId,compareA,compareB,destination,signature}={}){
 ok(SRC_FAMILIES.includes(family),'FAMILY_NOT_DECLARED');
 const {fixture:f}=readSynthetic(chamber,sourceId);
 switch(family){
 case 'SEALED_EPOCH_QUERY_AUTHORITY':return {family,result:resolveSourceEntity({entity_id:entityId??'A',epoch:{snapshot_id:f.epoch,seal_id:'SYNTHETIC_SEAL_E3B4'},expected_epoch:{snapshot_id:f.epoch,seal_id:'SYNTHETIC_SEAL_E3B4'},resolver_rows:f.resolver_rows,captures:[],derivatives:[]}),scope:STATUS_LIMIT};
 case 'QUERY_CONDITIONED_CANONICAL_SUFFICIENCY':return {family,result:selectedSurface(question,{requested:requestedSurface,available:[...new Set(f.surfaces.map(x=>x.surface))]}),native_matrix:nativeSufficiencyMatrix(),scope:STATUS_LIMIT};
 case 'POLYCOMPILATION_CONSERVATION':return {family,result:syntheticRoleModel(f),scope:STATUS_LIMIT};
 case 'MULTI_COORDINATE_NAVIGATION':return {family,result:{formal_layers:f.formal_layers,experiential_routes:f.routes.map(x=>x.route_id),traversal:mapTraversal(f,{from:from??'A',to:to??'C',graph:graph??'G_CANON'})},scope:STATUS_LIMIT};
 case 'TYPE_CONDITIONED_CROSS_SURFACE_IDENTITY':return {family,result:compareTypeIdentity(compareA??f.identity[0],compareB??f.identity[1]),scope:STATUS_LIMIT};
 case 'DIACHRONIC_RECLASSIFICATION':return {family,result:diachronic(f,currentId??'CURRENT-HUB'),scope:STATUS_LIMIT};
 case 'TYPED_NON_LIFT_RELATION_COMPOSITION':{
  const [a,b]=f.typed_edges;const admitted=new Set(f.surfaces.map(x=>x.source_id));
  if(!a||!b||![a,b].every(x=>admitted.has(x.source_id)))return {family,result:{status:'HELD_UNBOUND_TYPED_EDGE',direct_relation_admitted:false},scope:STATUS_LIMIT};
  return {family,result:{non_lift:nonLiftSafe(a,b),path:mapTraversal(f,{from:'A',to:'C',graph:'G_CANON'})},scope:STATUS_LIMIT};}
 case 'DEFERRED_SEMANTIC_ADDRESS_RESOLUTION':return {family,result:explore(f,{destination:destination??'LA CARTOGRAFÍA DEL UMBRAL',signature:signature??'Tú puedes clonarme, pero no tienes mis genes.'}),scope:STATUS_LIMIT};
 case 'PROJECTIVE_ROUTING_HOSTILE_NULLS':return {family,result:hostileProjectiveNulls(f),scope:STATUS_LIMIT};
 case 'THREE_STRATUM_RECONSTRUCTION':return {family,result:threeStratumPlan(f),scope:STATUS_LIMIT};
 case 'COMPILER_PROJECTION_CONSERVATION':return {family,result:projectedCompilation(f),scope:STATUS_LIMIT};
 case 'AUTHORITATIVE_CURRENT_VS_HISTORY':return {family,result:{current:selectedSurface('Q_place'),history:selectedSurface('Q_history'),descent:diachronic(f,currentId??'CURRENT-HUB')},scope:STATUS_LIMIT};
 }
}
function nonLiftSafe(a,b){return nonLiftPath({first:a,second:b,proposed_direct:'SAME_CURRENT_OBJECT'});}

// Separate Em boundary witness: the modules are executable but no Em source
// material enters SRC. This earns only source-free operation smoke coverage.
export function unscoredAdjacentOperatorSmoke(){
 const exact='This invented synthetic sentence defines a bounded mathematical example without attributing authorship.';
 const digest=sha(Buffer.from(exact));
 const anchor=bindExactSourceSpan({snapshot_id:EPOCH,source_file_id:'FIXTURE-EM-NO-CORPUS',source_locator:'synthetic:1',
  full_text:exact,start_char:0,end_char:exact.length,derivative_sha256:digest,source_parent_sha256:digest});
 const plan=lockProspectivePlan({trial_id:'FIXTURE-SRC-ADJACENT-ONLY',snapshot_id:EPOCH,heldout_ids:['FROZEN_SYNTHETIC'],
  comparison_frame:'SYNTHETIC_MATCHED',controls:['C0','C1','C2','C3','C4']});
 const ancestry=independentEvidenceSupport([{evidence_id:'M1',source_id:'S1',ancestor_id:'SYNTHETIC-ROOT'},
  {evidence_id:'M2',source_id:'S2',ancestor_id:'SYNTHETIC-ROOT'}]);
 return {anchor,plan,ancestry,source_class:'SYNTHETIC_EM_ADJACENCY_NOT_EM_PARITY',em_admitted:false};
}