/** B.5 research-only shell. Synthetic state never enters the original empty source register.
 * Khona‌lit-po · human source/scientific/release closure RESERVED.
 * Local receipts bind test bytes, not external origin or production authority.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createHash,randomUUID} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {initializeRecipient,reopenRecipient,recipientInterface,validateFixture,ROUTES} from '../E3B3/scripts/e3b3-authentic-chamber-v01.mjs';
import {sourceNative} from '../E3B3/scripts/e3b3-source-native-oracle-v01.mjs';
import {selectedSurface,mapTraversal,explore,syntheticRoleModel,SRC_FAMILIES,EPOCH as SRC_EPOCH,RIGHTS as SRC_RIGHTS} from '../E3B4/src/src-compositional-v01.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(here,'../../../../../..');
const originals=path.resolve(here,'../E3B3/originals'),seed=path.resolve(here,'../E3B3/seed');
const T='TD613_ENCYCLOPEDIA_TO_UNIVERSAL_ATELIER',W='WENDBINE_ATELIER_TO_UNIVERSAL_ENCYCLOPEDIA';
const rights='SYNTHETIC_LOCAL_ONLY',evidence='SYNTHETIC_REPLAY_ONLY';
const sha=x=>createHash('sha256').update(x).digest('hex');
const json=x=>Buffer.from(JSON.stringify(x)+'\n');
const fail=c=>{throw Object.assign(Error(c),{code:c})};
const need=(x,c)=>{if(!x)fail(c)};
export const SOURCE_SPECS=Object.freeze({
 TD613_REFERENCE:{product:'UNIVERSAL_ATELIER_B5_RESEARCH_SHELL',epoch:ROUTES[T].epoch,pin:ROUTES[T].sourceCommit,route:T},
 SRC_METHODS:{product:'UNIVERSAL_ATELIER_B5_RESEARCH_SHELL',epoch:SRC_EPOCH,pin:'4948a1c9c23b738d326b07cfc7d208604c305973'},
 WENDBINE_PUBLIC:{product:'NEW_UNIVERSAL_ENCYCLOPEDIA_E3B3',epoch:ROUTES[W].epoch,pin:ROUTES[W].sourceCommit,route:W}
});
const lanes=['SOURCE_NATIVE','PRODUCT_RECIPIENT','TRANSPORT_ONLY'];
function regular(p){need(fs.existsSync(p),'STATE_ABSENT');const s=fs.lstatSync(p);need(s.isFile()&&!s.isSymbolicLink()&&fs.realpathSync(p)===path.resolve(p),'SUBSTITUTED_STATE');return fs.readFileSync(p)}
function realDir(p){need(path.isAbsolute(p)&&fs.existsSync(p)&&fs.lstatSync(p).isDirectory()&&fs.realpathSync(p)===p,'REAL_ABSOLUTE_DIRECTORY_REQUIRED');return p}
function pins(){
 const manifest=JSON.parse(regular(path.join(here,'dependencies.json')));
 for(const row of manifest.files){const bytes=regular(path.join(repo,row.path));need(sha(bytes)===row.sha256,'DEPENDENCY_BYTES_DRIFT:'+row.path)}
 return sha(json(manifest));
}
function decodeRouting(f){
 need(f?.synthetic_only===true&&f.evidence_class===evidence&&Array.isArray(f.documents),'SRC_ROUTING_CONTRACT');
 return {...f,documents:f.documents.map(d=>({...d,body_bytes:Buffer.from(d.body_base64,'base64'),metadata_bytes:Buffer.from(d.metadata_base64,'base64')}))};
}
function checkSRC(f){
 const m=f?.methods;need(m?.schema==='td613.e3b4-src-invented-fixture/v1'&&m.synthetic_only===true&&m.epoch===SRC_EPOCH&&m.rights===SRC_RIGHTS,'SRC_METHOD_RIGHTS_OR_EPOCH');
 need(Object.keys(f).every(k=>['methods','routing'].includes(k))&&!['private_body','full_post_body','original_private_text','external_corpus','protected_archive'].some(k=>Object.hasOwn(m,k)),'SRC_PROHIBITED_CONTENT');
 need(Array.isArray(m.surfaces)&&Array.isArray(m.edges)&&Array.isArray(m.typed_edges),'SRC_METHOD_SHAPE');
 const ids=new Set(m.surfaces.map(s=>s.source_id));
 need(ids.size===m.surfaces.length&&m.surfaces.every(s=>s.evidence_class==='INVENTED_SOURCE_FREE'),'SRC_SURFACE_BINDING');
 const edgeIds=new Set();
 for(const e of [...m.edges,...m.typed_edges]){
  need(ids.has(e.source_id)&&e.evidence_class==='INVENTED_SOURCE_FREE'&&e.witness_id&&e.edge_id&&e.from&&e.to&&e.relation,'SRC_UNBOUND_EDGE');
  need(['G_CANON','G_READER'].includes(e.graph),'SRC_UNKNOWN_GRAPH');
  if(m.edges.includes(e)){need(!edgeIds.has(e.edge_id),'SRC_DUPLICATE_EDGE');edgeIds.add(e.edge_id)}
 }
 // Static validation only: transport admission executes zero research routines.
 const input=decodeRouting(f.routing),seen=new Set();
 for(const d of input.documents){
  need(/^zenodo:\d+$/.test(d.entity_id)&&!seen.has(d.entity_id)&&d.rights==='INVENTED_SOURCE_FREE','SRC_DOCUMENT_ID_OR_RIGHTS');seen.add(d.entity_id);
  const stem='03-DERIVATIVES/text/zenodo/zenodo-'+d.entity_id.slice(7);
  need(d.body_path===stem+'-file-0.md'&&d.metadata_path===stem+'-metadata.md'&&sha(d.body_bytes)===d.body_sha256&&sha(d.metadata_bytes)===d.metadata_sha256&&!d.graph,'SRC_DOCUMENT_BYTES_OR_PATH');
 }
}
function validate(family,f){const s=SOURCE_SPECS[family];need(s,'SOURCE_FAMILY_REQUIRED');if(s.route)validateFixture(s.route,f);else checkSRC(f)}
function b3Envelope(family,bytes){const spec=SOURCE_SPECS[family];return {evidence_class:'SYNTHETIC_SOURCE_FREE_FIXTURE',rights,epoch:spec.epoch,source_pin:spec.pin,source_id:'FIXTURE:'+spec.route,bytes,original:bytes.toString('utf8'),sha256:sha(bytes)}}

// A distinct original-Python lane: no JS recipient execution in this function.
function nativePython(input){
 const runner=path.resolve(here,'../E3B4/native/run-projective-routing-grammar-assay.py');
 need(sha(regular(runner))==='46064cf61399cd228141f4f51949d2840422fbc0737202258114a68a4b1cce43','NATIVE_PYTHON_PIN_DRIFT');
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'e3b5-native-'));
 try{
  const sources=input.documents.map(d=>{for(const [p,b] of [[d.body_path,d.body_bytes],[d.metadata_path,d.metadata_bytes]]){const out=path.join(temp,p);need(out.startsWith(temp+path.sep),'NATIVE_PATH_ESCAPE');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,b,{flag:'wx'})}return {source_id:d.entity_id,body_sha256:d.body_sha256,metadata_sha256:d.metadata_sha256}});
  const run=args=>{const r=spawnSync('python3',args,{encoding:'utf8',timeout:15000,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'}});need(!r.error&&r.status===0,'NATIVE_PYTHON_FAILED:'+r.stderr);return r.stdout};
  const command=['python3',runner,'--self-test','--root',temp],stdout=run(command.slice(1));
  const bridge="import sys,importlib.util,json; from pathlib import Path; sys.dont_write_bytecode=True; s=importlib.util.spec_from_file_location('e3b5_native',sys.argv[1]); m=importlib.util.module_from_spec(s); sys.modules[s.name]=m; s.loader.exec_module(m); d=m.load_documents(Path(sys.argv[2])); print(json.dumps({'explore':m.explore_observations(d),'signatures':m.signature_observations(d)},ensure_ascii=False))";
  const native=JSON.parse(run(['-c',bridge,runner,temp]));
  need(!fs.existsSync(path.join(temp,'04-RECEIPTS')),'NATIVE_UNEXPECTED_WRITE');
  for(const d of input.documents){need(sha(regular(path.join(temp,d.body_path)))===d.body_sha256&&sha(regular(path.join(temp,d.metadata_path)))===d.metadata_sha256,'NATIVE_CHANGED_INPUT')}
  return {native,command,stdout,sources,evidence_class:evidence,write_flag:false,historical_labels_are_not_authority:true};
 }finally{fs.rmSync(temp,{recursive:true,force:true})}
}

/** Initialize or reopen one lane. Caller retains root_receipt and every admission receipt outside this store. */
export async function openAssembly({workspace,lane='PRODUCT_RECIPIENT',create=false,root_receipt}={}){
 realDir(workspace);need(lanes.includes(lane),'EXECUTION_LANE_REQUIRED');const dependency_digest=pins();
 const manifestFile=path.join(workspace,'B5_ASSEMBLY.json');
 let tdHandle,weHandle,manifest;
 if(create){
  need(fs.readdirSync(workspace).length===0,'FRESH_WORKSPACE_REQUIRED');
  fs.mkdirSync(path.join(workspace,'ATELIER'));fs.mkdirSync(path.join(workspace,'ENCYCLOPEDIA'));fs.mkdirSync(path.join(workspace,'NAMESPACES'));
  tdHandle=await initializeRecipient({route:T,workspace:path.join(workspace,'ATELIER'),originalRoot:originals,seedRoot:seed});
  weHandle=await initializeRecipient({route:W,workspace:path.join(workspace,'ENCYCLOPEDIA'),originalRoot:originals});
  const profile=regular(path.join(tdHandle.folder,'ATELIER_PROFILE.json'));
  manifest={schema:'td613.e3b5-research-shell/v1',assembly_id:randomUUID(),lane,dependency_digest,profile_sha256:sha(profile),encyclopedia_profile_sha256:sha(regular(path.join(weHandle.folder,'CANDIDATE_PROFILE.json'))),source_count:0,source_admission_authority:false,scientific_promotion:false,historical_encyclopedia:false,original_seed_connector:'NO_SOURCES_ADMITTED',shell_is_original_seed_entry:false,authentic_shared_entry_status:'HELD_SHARED_RECIPIENT_IDENTITY'};
  fs.writeFileSync(manifestFile,json(manifest),{flag:'wx',mode:0o600});root_receipt=sha(regular(manifestFile));
 }else{
  need(typeof root_receipt==='string'&&sha(regular(manifestFile))===root_receipt,'ROOT_RECEIPT_REQUIRED_OR_MISMATCH');manifest=JSON.parse(regular(manifestFile));
  need(manifest.schema==='td613.e3b5-research-shell/v1'&&manifest.lane===lane&&manifest.dependency_digest===dependency_digest,'ASSEMBLY_VERSION_OR_LANE_DRIFT');
  tdHandle=await reopenRecipient({route:T,workspace:path.join(workspace,'ATELIER'),originalRoot:originals});
  weHandle=await reopenRecipient({route:W,workspace:path.join(workspace,'ENCYCLOPEDIA'),originalRoot:originals});
 }
 const safe=()=>{
  realDir(workspace);realDir(path.join(workspace,'NAMESPACES'));for(const family of Object.keys(SOURCE_SPECS)){const p=path.join(workspace,'NAMESPACES',family);if(fs.existsSync(p))realDir(p)}
  need(sha(regular(manifestFile))===root_receipt,'ROOT_STATE_DRIFT');need(pins()===manifest.dependency_digest,'DEPENDENCY_DRIFT');
  need(sha(regular(path.join(tdHandle.folder,'ATELIER_PROFILE.json')))===manifest.profile_sha256&&sha(regular(path.join(weHandle.folder,'CANDIDATE_PROFILE.json')))===manifest.encyclopedia_profile_sha256,'ORIGINAL_PROFILE_MUTATION');
 };
 const loc=(family,id)=>path.join(workspace,'NAMESPACES',family,sha(Buffer.from(id)));
 function read(q){
  safe();const spec=SOURCE_SPECS[q.family];need(spec,'SOURCE_FAMILY_REQUIRED');
  need(q.product===spec.product&&q.epoch===spec.epoch&&q.rights===rights,'ROUTE_EPOCH_RIGHTS_REFUSED');
  need(typeof q.source_id==='string'&&typeof q.receipt==='string','EXTERNAL_SOURCE_RECEIPT_REQUIRED');
  const dir=loc(q.family,q.source_id);need(fs.existsSync(dir),'SOURCE_ABSENT');realDir(dir);
  need(!fs.existsSync(path.join(dir,'WITHDRAWN')),'SOURCE_WITHDRAWN');
  const raw=regular(path.join(dir,'original.bin')),r=regular(path.join(dir,'receipt.json'));
  need(sha(r)===q.receipt,'EXTERNAL_SOURCE_RECEIPT_MISMATCH');const record=JSON.parse(r);
  need(record.assembly_id===manifest.assembly_id&&record.lane===lane&&record.family===q.family&&record.source_id===q.source_id&&record.epoch===q.epoch&&record.rights===rights&&record.source_pin===spec.pin&&record.product===spec.product&&record.original_sha256===sha(raw)&&record.byte_length===raw.length,'SOURCE_STATE_CORRUPT');
  const fixture=JSON.parse(raw.toString('utf8'));validate(q.family,fixture);return {dir,raw,record,fixture};
 }
 function b3(dir,family){return recipientInterface({... (family==='TD613_REFERENCE'?tdHandle:weHandle),folder:dir})}
 async function execute(q){
  const {dir,raw,record,fixture}=read(q);
  if(lane==='TRANSPORT_ONLY')return {status:'UNEXECUTED',execution_count:0,bytes:Buffer.from(raw),sha256:sha(raw),research_authority:false};
  const base={schema:'td613.e3b5-execution-envelope/v1',evidence_class:evidence,assembly_id:manifest.assembly_id,dependency_digest:manifest.dependency_digest,lane,product:q.product,family:q.family,source_id:q.source_id,epoch:q.epoch,rights,source_sha256:sha(raw),source_receipt:q.receipt,source_pin:record.source_pin,scientific_identity:false,real_source_rights:false,independent_empirical_replications:0};
  let result,execution_count=1,status='EXECUTED';const params=q.params||{};
  if(q.family==='SRC_METHODS'){
   if(q.operation==='surface')result=selectedSurface(params.question,{requested:params.requested??null,available:fixture.methods.surfaces.map(s=>s.surface)});
   else if(q.operation==='typed_route'){
    need(!params.promote_direct&&!params.genealogy&&!params.causation,'DIRECT_LIFT_REFUSED');need(['G_CANON','G_READER'].includes(params.graph??'G_CANON'),'UNKNOWN_GRAPH_SEMANTICS');
    result=mapTraversal(fixture.methods,params);if(!result.paths.length)status='EXECUTED_ZERO';
   }else if(q.operation==='compile_roles')result=syntheticRoleModel(fixture.methods);
   else if(q.operation==='explore'){
    result=lane==='SOURCE_NATIVE'?nativePython(decodeRouting(fixture.routing)):explore(decodeRouting(fixture.routing));
    const obs=lane==='SOURCE_NATIVE'?result.native.explore:result.observations;if(!obs.length)status='EXECUTED_ZERO';
   }else if(q.operation==='three_stratum')return {...base,status:'UNEXECUTED',execution_count:0,result:{family:'THREE_STRATUM_RECONSTRUCTION',result:'HELD_UNWITNESSED'}};
   else fail('UNAVAILABLE_OPERATION');
  }else{
   if(lane==='SOURCE_NATIVE')result=await sourceNative({route:SOURCE_SPECS[q.family].route,originalRoot:originals,fixture,operation:q.operation,params});
   else result=await b3(dir,q.family).execute(record.native_receipt,q.operation,params);
   if(result===null)status='ABSENT';else if((q.operation==='resolve'&&Array.isArray(result)&&!result.length))status='ABSENT';else if(result.total===0||result.typed_edges?.length===0||(Array.isArray(result)&&!result.length))status='EXECUTED_ZERO';
  }
  if(q.citation){need(q.family==='TD613_REFERENCE','CITATION_ROUTE_REFUSED');const expected=lane==='SOURCE_NATIVE'?await sourceNative({route:T,originalRoot:originals,fixture,operation:'cite',params:{id:q.citation.id}}):await b3(dir,q.family).execute(record.native_receipt,'cite',{id:q.citation.id});need(expected&&JSON.stringify(expected)===JSON.stringify(q.citation),'CITATION_BINDING_REFUSED');execution_count++}
  return {...base,status,execution_count,operation:q.operation,parameters_sha256:sha(json(params)),result_sha256:sha(json(result)),result};
 }
 async function request(q={}){
  safe();
  if(q.action==='status')return {manifest:{...manifest},root_receipt,original_profile:JSON.parse(regular(path.join(tdHandle.folder,'ATELIER_PROFILE.json'))),src_families:SRC_FAMILIES,src_classification:{executed:4,partial:7,designed:1,original_corpus_parity:0},em_readiness:{families:10,family_ids:JSON.parse(regular(path.join(seed,'atelier-method-v0.2-candidate.json'))).operator_families.EM_CONTRIBUTED,executed:0,status:'HELD_EM_AUTHORIZED_SOURCE_AND_IDENTITY_WITNESS'},six_arm_study:'UNEXECUTED'};
  if(q.action==='admit'){
   const s=SOURCE_SPECS[q.family];need(s&&q.product===s.product&&q.epoch===s.epoch&&q.source_pin===s.pin&&q.rights===rights&&q.evidence_class===evidence&&/^FIXTURE-[A-Z0-9_-]+$/.test(q.source_id||''),'SYNTHETIC_ADMISSION_ENVELOPE_REFUSED');
   need(Buffer.isBuffer(q.bytes)&&sha(q.bytes)===q.sha256,'INCOMING_BYTE_DIGEST_REFUSED');
   const f=JSON.parse(q.bytes.toString('utf8'));validate(q.family,f);
   const target=loc(q.family,q.source_id);
   for(const family of Object.keys(SOURCE_SPECS))if(family!==q.family)need(!fs.existsSync(loc(family,q.source_id)),'CROSS_NAMESPACE_SOURCE_ID_COLLISION');
   if(fs.existsSync(target)){
    need(q.receipt,'REPLAY_REQUIRES_RETAINED_RECEIPT');const previous=read({...q,receipt:q.receipt});need(previous.raw.equals(q.bytes),'REPLAY_CONFLICT');return {status:'EXACT_REPLAY',receipt:q.receipt};
   }
   fs.mkdirSync(path.dirname(target),{recursive:true});
   // Lock is retained on interruption; no silent state reconstruction.
   const lock=target+'.pending';need(!fs.existsSync(lock),'INTERRUPTED_ADMISSION_HELD');fs.mkdirSync(lock,{mode:0o700});
   const record={schema:'td613.e3b5-source-receipt/v1',assembly_id:manifest.assembly_id,lane,family:q.family,product:q.product,source_id:q.source_id,epoch:q.epoch,rights,source_pin:s.pin,original_sha256:q.sha256,byte_length:q.bytes.length,evidence_class:evidence,authorized_real_source:false,native_receipt:null};
   fs.writeFileSync(path.join(lock,'original.bin'),q.bytes,{flag:'wx',mode:0o600});
   if(s.route&&lane==='PRODUCT_RECIPIENT')record.native_receipt=b3(lock,q.family).admitSynthetic(b3Envelope(q.family,q.bytes)).receipt_sha256;
   // SRC uses the unchanged core staging contract, never a source-count update.
   if(q.family==='SRC_METHODS'&&lane==='PRODUCT_RECIPIENT'){const staged=tdHandle.stage({bytes:q.bytes,filename:'synthetic-src.json',source_provenance:'B5_INVENTED_ONLY',rights:'PUBLIC',epoch:q.epoch,authorization:false});need(staged.state==='STAGED_UNADMITTED'&&!staged.source_import_authorized,'NATIVE_STAGING_PROMOTED')}
   fs.writeFileSync(path.join(lock,'receipt.json'),json(record),{flag:'wx',mode:0o600});fs.renameSync(lock,target);
   return {status:'SYNTHETIC_TEST_STORED_NOT_REAL_SOURCE_ADMITTED',receipt:sha(regular(path.join(target,'receipt.json'))),source_id:q.source_id,source_sha256:q.sha256,source_count:0};
  }
  if(q.action==='execute'){
   if(!q.family||!q.source_id)return {status:'HELD',reason:'UNQUALIFIED_MIXED_SOURCE_QUERY',execution_count:0};
   return execute(q);
  }
  if(q.action==='readback'){const r=read(q);return {bytes:r.raw,source_sha256:sha(r.raw),source_id:q.source_id,evidence_class:evidence,independent_durable_custody_credit:false}}
  if(q.action==='withdraw'){const r=read(q);need(q.authority==='SYNTHETIC_OPERATOR_WITHDRAWAL_ONLY','WITHDRAWAL_AUTHORITY_REQUIRED');fs.writeFileSync(path.join(r.dir,'WITHDRAWN'),q.receipt+'\n',{flag:'wx'});return {status:'SYNTHETIC_SOURCE_WITHDRAWN'}}
  if(q.action==='trace'){
   need(lane==='PRODUCT_RECIPIENT'&&q.td?.family==='TD613_REFERENCE'&&q.src?.family==='SRC_METHODS','TRACE_TWO_DISTINCT_ORIGINS_REQUIRED');
   const td=await execute({...q.td,operation:'search',params:{query:q.query}});
   need(td.result.hits.length>0,'TRACE_TD_RECORD_ABSENT');const first=td.result.hits[0];
   const citation=await execute({...q.td,operation:'cite',params:{id:first.id},citation:first.citation});
   const surface=await execute({...q.src,operation:'surface',params:{question:q.question}});
   need(surface.result.chosen,'TRACE_SURFACE_ABSTENTION');
   const route=await execute({...q.src,operation:'typed_route',params:q.route});
   return {status:'BOUNDED_TWO_ORIGIN_TRACE',trace_id:sha(json([manifest.assembly_id,q.td.receipt,q.src.receipt,q.query,q.question,q.route])),envelopes:[{retrieval:td,citation},{surface,route}],cross_bridge:{status:'HELD',candidate:'CANDIDATE_ANALOGY',shared_genealogy:false,common_authorship:false,direct_graph_edge:false,scientific_equivalence:false,novel_result:false,empirical_exteriority:false},execution_count:td.execution_count+citation.execution_count+surface.execution_count+route.execution_count};
  }
  fail('UNAVAILABLE_ACTION');
 }
 safe();return Object.freeze({request,root_receipt});
}
