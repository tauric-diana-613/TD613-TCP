/** Versioned extension of the unchanged B.5 research shell. Synthetic fixtures only.
 * Khona‌lit-po · source admission, scientific and release closure RESERVED.
 */
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {randomUUID} from 'node:crypto';
import {openAssembly,SOURCE_SPECS} from '../E3B5/recipient-assembly-v01.mjs';
import {stageSourceIntake} from './native/em-atelier-parity.mjs';
import {hash,need,validateEm,activeView,executeMethod,FAMILIES,epoch} from './em-methods-v01.mjs';
import {portableOracle} from './em-portable-oracle-v01.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),repo=path.resolve(here,'../../../../../..');
const family='EM_METHODS_SYNTHETIC',product='UNIVERSAL_ATELIER_B5_RESEARCH_SHELL',pin='50c35cceb50f483c7c36a1497fed9de9377b89d9',rights='SYNTHETIC_LOCAL_ONLY',evidence='SYNTHETIC_REPLAY_ONLY';
export const EM_SPEC=Object.freeze({family,product,epoch,pin,rights,evidence_class:evidence});
const pack=x=>Buffer.from(JSON.stringify(x)+'\n');
function dir(p){need(path.isAbsolute(p)&&fs.existsSync(p)&&fs.lstatSync(p).isDirectory()&&fs.realpathSync(p)===p,'B6_REAL_DIRECTORY');return p}
function readFile(p){need(fs.existsSync(p),'B6_STATE_ABSENT');need(fs.lstatSync(p).isFile()&&fs.realpathSync(p)===p,'B6_SUBSTITUTED_FILE');return fs.readFileSync(p)}
function binding(){const bytes=readFile(path.join(here,'dependencies.json')),m=JSON.parse(bytes);for(const r of m.files)need(hash(readFile(path.join(repo,r.path)))===r.sha256,'B6_SOURCE_CODE_DRIFT:'+r.path);return hash(bytes)}
export async function openEmAssembly({workspace,lane='PRODUCT_RECIPIENT',create=false,root_receipt}={}){
 dir(workspace);need(['PRODUCT_RECIPIENT','SOURCE_NATIVE','TRANSPORT_ONLY'].includes(lane),'B6_LANE');const implementation=binding(),manifestPath=path.join(workspace,'B6_ASSEMBLY.json');let m,b5;
 if(create){need(!fs.readdirSync(workspace).length,'B6_FRESH_STATE_REQUIRED');fs.mkdirSync(path.join(workspace,'B5'));fs.mkdirSync(path.join(workspace,family));b5=await openAssembly({workspace:path.join(workspace,'B5'),lane,create:true});m={schema:'td613.e3b6-b5-extension/v1',assembly_id:randomUUID(),lane,b5_root_receipt:b5.root_receipt,implementation,source_admission_authority:false,original_connector:'HELD_SHARED_RECIPIENT_IDENTITY',em_native_corpus:'HELD_EM_NATIVE_CORPUS_PARITY',preimport_trust_root:'HELD_UNSIGNED_PREIMPORT_ROOT'};fs.writeFileSync(manifestPath,pack(m),{flag:'wx'});root_receipt=hash(readFile(manifestPath))}
 else{need(root_receipt&&hash(readFile(manifestPath))===root_receipt,'B6_ROOT_RECEIPT');m=JSON.parse(readFile(manifestPath));need(m.schema==='td613.e3b6-b5-extension/v1'&&m.lane===lane&&m.implementation===implementation,'B6_VERSION_DRIFT');b5=await openAssembly({workspace:path.join(workspace,'B5'),lane,root_receipt:m.b5_root_receipt})}
 const safe=async()=>{dir(workspace);dir(path.join(workspace,family));need(hash(readFile(manifestPath))===root_receipt&&binding()===m.implementation,'B6_MANIFEST_OR_IMPLEMENTATION_DRIFT');await b5.request({action:'status'})};
 const location=id=>path.join(workspace,family,hash(Buffer.from(id)));
 const route=q=>need(q.family===family&&q.product===product&&q.epoch===epoch&&q.rights===rights,'B6_ROUTE_EPOCH_RIGHTS');
 function collision(id,em){const stem=hash(Buffer.from(id));if(em){for(const f of Object.keys(SOURCE_SPECS))need(!fs.existsSync(path.join(workspace,'B5/NAMESPACES',f,stem)),'B6_CROSS_SOURCE_ID_COLLISION')}else need(!fs.existsSync(location(id)),'B6_CROSS_SOURCE_ID_COLLISION')}
 function read(q){
  route(q);need(q.source_id&&q.receipt,'B6_RETAINED_RECEIPT_REQUIRED');const folder=location(q.source_id);dir(folder);need(!fs.existsSync(path.join(folder,'WITHDRAWN')),'B6_SOURCE_WITHDRAWN');
  const meta=readFile(path.join(folder,'receipt.json'));need(hash(meta)===q.receipt,'B6_SOURCE_RECEIPT_MISMATCH');const record=JSON.parse(meta),bytes=readFile(path.join(folder,'original.bin'));
  need(record.assembly_id===m.assembly_id&&record.lane===lane&&record.family===family&&record.source_id===q.source_id&&record.product===product&&record.epoch===epoch&&record.rights===rights&&record.source_pin===pin&&record.sha256===hash(bytes)&&record.byte_length===bytes.length,'B6_SOURCE_STATE_CORRUPT');
  const fixture=validateEm(JSON.parse(bytes)),revocations=path.join(folder,'revocations');dir(revocations);const revoked=[];
  for(const name of fs.readdirSync(revocations)){const r=JSON.parse(readFile(path.join(revocations,name)));need(r.source_receipt===q.receipt&&r.source_id===q.source_id&&name===hash(Buffer.from(r.original_id))+'.json'&&fixture.originals.some(o=>o.original_id===r.original_id),'B6_REVOCATION_CORRUPT');revoked.push(r.original_id)}
  return {folder,fixture,bytes,revoked,revocations};
 }
 async function execute(q){
  const r=read(q),p=q.params??{};
  if(lane==='TRANSPORT_ONLY')return {status:'UNEXECUTED',execution_count:0,bytes:Buffer.from(r.bytes),sha256:hash(r.bytes),source_rights_granted:false};
  const base={schema:'td613.e3b6-execution/v1',assembly_id:m.assembly_id,implementation:m.implementation,family,product,epoch,rights,evidence_class:evidence,lane,source_id:q.source_id,source_receipt:q.receipt,source_sha256:hash(r.bytes),source_pin:pin,revoked_originals:r.revoked,original_em_corpus_execution:0,scientific_identity:false,scientific_promotion:false,independent_empirical_replications:0};
  if(q.operation==='NATIVE_EM_CORPUS')return {...base,status:'HELD',execution_count:0,result:{reason:'HELD_EM_NATIVE_CORPUS_PARITY'}};
  const f=activeView(r.fixture,r.revoked,p.as_of??null);let result,status='EXECUTED';
  if(q.operation==='get_derivative'){result=f.derivatives.find(d=>d.derivative_id===p.id)??null}
  else if(q.operation==='cite'){const d=f.derivatives.find(d=>d.derivative_id===p.id);result=d?{source_id:q.source_id,source_receipt:q.receipt,source_file_id:d.source_file_id,derivative_id:d.derivative_id,derivative_sha256:d.sha256,parent_sha256:d.parent_sha256,original_id:d.original_id,epoch}:null}
  else if(lane==='SOURCE_NATIVE')result=portableOracle(f,q.operation,p);
  else{
   const {as_of,...methodParams}=p;result=executeMethod(f,q.operation,methodParams);
  }
  if(result===null)status='ABSENT';else if(String(result.status??'').startsWith('HELD')||result.candidate?.status?.startsWith('HELD'))status='HELD';
  else if(!f.derivatives.length||result.lexical?.observations?.length===0)status='EXECUTED_ZERO';
  if(q.citation){const d=f.derivatives.find(d=>d.derivative_id===q.citation.derivative_id);const expected=d?{source_id:q.source_id,source_receipt:q.receipt,source_file_id:d.source_file_id,derivative_id:d.derivative_id,derivative_sha256:d.sha256,parent_sha256:d.parent_sha256,original_id:d.original_id,epoch}:null;need(expected&&JSON.stringify(q.citation)===JSON.stringify(expected),'B6_CITATION_BINDING')}
  return {...base,operation:q.operation,status,execution_count:result?.status==='HELD_NO_SOURCE_FREE_NATIVE_COMPARATOR'?0:1,comparator:lane==='SOURCE_NATIVE'?'PORTABLE_LIBRARY_ONLY_NOT_EM_CORPUS':null,result_sha256:hash(pack(result)),result};
 }
 async function request(q={}){
  await safe();
  if(q.action==='status')return {manifest:{...m},baseline:await b5.request({action:'status'}),em_method_states:FAMILIES,em_corpus_parity:'HELD',original_em_native_tests:'NOT_EVALUATED_PROTECTED_READS',six_arm:'UNEXECUTED',protected_flight:'HELD'};
  if(q.action==='three_origin_trace'){
   need(lane==='PRODUCT_RECIPIENT'&&q.em?.family===family&&new Set([q.td?.source_id,q.src?.source_id,q.em.source_id]).size===3,'B6_THREE_DISTINCT_SOURCES');
   read(q.em); // Reject an unavailable Em binding before starting the mixed trace.
   const pair=await b5.request({...q,action:'trace'}),identity=await execute({...q.em,operation:'WORK_IDENTITY_SPLIT_COLLAPSE_SENSITIVITY'}),motif=await execute({...q.em,operation:'MOTIF_VS_MECHANISM_NULL',params:{terms:['trace']}}),ancestry=await execute({...q.em,operation:'GENEALOGY_AND_SOURCE_INDEPENDENCE'});
   return {status:'BOUNDED_THREE_ORIGIN_TRACE',baseline_pair:pair,envelopes:[...pair.envelopes,{identity,motif,ancestry}],cross_bridge:{...pair.cross_bridge,status:'HELD',shared_mechanism:false,source_rights_transfer:false,independent_external_witness:false},execution_count:pair.execution_count+3};
  }
  if(q.family!==family){if(q.action==='admit'&&q.source_id)collision(q.source_id,false);return b5.request(q)}
  route(q);
  if(q.action==='admit'){
   need(/^FIXTURE-EM-[A-Z0-9_-]+$/.test(q.source_id??'')&&q.source_pin===pin&&q.evidence_class===evidence&&Buffer.isBuffer(q.bytes)&&hash(q.bytes)===q.sha256,'B6_SOURCE_ENVELOPE');collision(q.source_id,true);validateEm(JSON.parse(q.bytes));
   const target=location(q.source_id);if(fs.existsSync(target)){const r=read(q);need(r.bytes.equals(q.bytes),'B6_REPLAY_CONFLICT');return {status:'EXACT_REPLAY',receipt:q.receipt}}
   const pending=target+'.pending';need(!fs.existsSync(pending),'B6_INTERRUPTED_ADMISSION_HELD');fs.mkdirSync(pending);fs.mkdirSync(path.join(pending,'revocations'));
   const staged=lane==='PRODUCT_RECIPIENT'?stageSourceIntake({bytes:q.bytes,original_filename:'invented-em.json',media_type:'application/json',provenance_basis:'INVENTED_B6_NO_ORIGINAL_EM_SOURCE',rights_state:'RESTRICTED_NO_EXPORT',parent_epoch:epoch}):null;
   if(staged)need(staged.state==='STAGED_UNADMITTED'&&!staged.accession_authorized&&!staged.scientific_support_created,'B6_NATIVE_STAGING_PROMOTION');
   const r={schema:'td613.e3b6-synthetic-source/v1',assembly_id:m.assembly_id,lane,family,product,epoch,rights,source_id:q.source_id,source_pin:pin,sha256:q.sha256,byte_length:q.bytes.length,staged,evidence_class:evidence};
   fs.writeFileSync(path.join(pending,'original.bin'),q.bytes,{flag:'wx'});fs.writeFileSync(path.join(pending,'receipt.json'),pack(r),{flag:'wx'});fs.renameSync(pending,target);return {status:'SYNTHETIC_TEST_ONLY',receipt:hash(pack(r)),staged,real_source_admitted:false};
  }
  if(q.action==='execute')return execute(q);
  if(q.action==='readback'){const r=read(q);return {bytes:Buffer.from(r.bytes),sha256:hash(r.bytes),independent_durable_custody_credit:false}}
  if(q.action==='withdraw'){const r=read(q);need(q.authority==='SYNTHETIC_OPERATOR_WITHDRAWAL_ONLY','B6_WITHDRAWAL_AUTHORITY');fs.writeFileSync(path.join(r.folder,'WITHDRAWN'),q.receipt,{flag:'wx'});return {status:'SYNTHETIC_SOURCE_WITHDRAWN'}}
  if(q.action==='revoke_original'){const r=read(q);need(q.authority==='SYNTHETIC_OPERATOR_WITHDRAWAL_ONLY'&&r.fixture.originals.some(o=>o.original_id===q.original_id),'B6_ORIGINAL_REVOCATION_AUTHORITY');const record={source_receipt:q.receipt,source_id:q.source_id,original_id:q.original_id};fs.writeFileSync(path.join(r.revocations,hash(Buffer.from(q.original_id))+'.json'),pack(record),{flag:'wx'});return {status:'SYNTHETIC_ORIGINAL_AND_DESCENDANTS_REVOKED',receipt:hash(pack(record))}}
  need(false,'B6_UNAVAILABLE_ACTION');
 }
 await safe();return Object.freeze({request,root_receipt});
}
