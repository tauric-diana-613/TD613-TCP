/** Prospective test-only product boundary. Khona‌lit-po. Human closure RESERVED.
 * No real-source permit path, arbitrary input reader, network client or production grant.
 * Local hashes/receipts bind fixtures and software; external origin remains HELD.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash,randomUUID} from 'node:crypto';

export const SCHEMA='td613.universal-atelier-prospective/v0.1';
export const ATELIER='TD613_UNIVERSAL_ATELIER_B8_CANDIDATE';
export const ENCYCLOPEDIA='TD613_UNIVERSAL_ENCYCLOPEDIA_B8_CANDIDATE';
const here=path.dirname(fileURLToPath(import.meta.url)),repo=path.resolve(here,'../../../../../..');
const evidence='SYNTHETIC_REPLAY_ONLY',rights='SYNTHETIC_LOCAL_ONLY';
const classes=Object.freeze(['TD613_EDITION_1_4','SRC_ORIGINAL_PUBLICATION','SRC_DERIVATIVE_CAPTURE','WENDBINE_PUBLIC_METADATA','WENDBINE_PRIVATE_BODY','EM_ORIGINAL_FILE','EM_DERIVATIVE','EM_WORK_MANIFESTATION_IDENTITY','EXTERNAL_SCIENTIFIC_WITNESS']);
const modes=Object.freeze(['PRODUCT_RECIPIENT','SOURCE_NATIVE','TRANSPORT_ONLY']);
const sha=b=>createHash('sha256').update(b).digest('hex');
const pack=x=>Buffer.from(JSON.stringify(x)+'\n');
const clone=x=>structuredClone(x);
const fail=code=>{throw Object.assign(Error(code),{code})};
const need=(ok,code)=>{if(!ok)fail(code)};
function plain(x){return x&&Object.getPrototypeOf(x)===Object.prototype}
function keys(x,allowed){need(plain(x),'B8_PLAIN_REQUEST_REQUIRED');for(const [k,d] of Object.entries(Object.getOwnPropertyDescriptors(x))){need('value' in d&&!['__proto__','constructor','prototype'].includes(k),'B8_ACCESSOR_OR_PROTOTYPE_REFUSED');need(allowed.includes(k),'B8_UNEXPECTED_FIELD:'+k)}}
function directory(p){need(typeof p==='string'&&path.isAbsolute(p)&&fs.existsSync(p),'B8_DIRECTORY_REQUIRED');need(fs.lstatSync(p).isDirectory()&&fs.realpathSync(p)===p,'B8_SYMLINK_OR_SUBSTITUTED_DIRECTORY');return p}
function regular(p){need(fs.existsSync(p),'B8_MISSING_FILE');need(fs.lstatSync(p).isFile()&&fs.realpathSync(p)===p,'B8_SYMLINK_OR_SUBSTITUTED_FILE');return fs.readFileSync(p)}
function bind(){
 const raw=regular(path.join(here,'implementation-manifest.json')),m=JSON.parse(raw);
 need(m.schema==='td613.b8-finite-code-binding/v1'&&Array.isArray(m.files)&&m.files.length>0,'B8_IMPLEMENTATION_MANIFEST');
 const seen=new Set();
 for(const r of m.files){need(typeof r.path==='string'&&!seen.has(r.path)&&r.path.startsWith('packages/dome_world_exact/fixtures/a15-r0/ATELIER_METHOD/E3B')&&!r.path.split('/').includes('..'),'B8_CODE_ALLOWLIST');seen.add(r.path);need(sha(regular(path.join(repo,r.path)))===r.sha256,'B8_IMPLEMENTATION_DRIFT:'+r.path)}
 need(seen.has(path.relative(repo,fileURLToPath(import.meta.url))),'B8_ENTRY_NOT_BOUND');
 return sha(raw);
}
const loadedBinding=bind(); // Finite pinned software only, never a caller's source path.
const policy=JSON.parse(regular(path.join(here,'gate-policy.json')));
function denyPolicy(p){need(p?.schema==='td613.b8-test-only-deny-real-source/v0.1'&&p.execution_enabled===false&&p.grant_issuance_authorized===false&&p.real_sources_admitted===0&&p.runtime_enforcement_implemented===true&&p.named_sources_selected?.length===0&&p.execution_grants?.length===0&&p.source_classes?.length===9&&p.source_classes.every((c,i)=>c.class_id===classes[i]&&c.state==='HELD_NOT_ADMITTED'),'B8_REAL_SOURCE_POLICY_MUST_DENY')}
denyPolicy(policy);
const catalog=JSON.parse(regular(path.join(here,'fixture-catalog.json')));
need(catalog.schema==='td613.b8-finite-invented-catalog/v1','B8_CATALOG_SCHEMA');
const specs=Object.freeze({
 TD613_REFERENCE:{product:ATELIER,delegate_product:'UNIVERSAL_ATELIER_B5_RESEARCH_SHELL',epoch:'td613-reference-edition-1.4',pin:'50cc9d161f8f72c2d4b6ea33ece17ace88f35eff',operations:['search','get','cite','verify']},
 SRC_METHODS:{product:ATELIER,delegate_product:'UNIVERSAL_ATELIER_B5_RESEARCH_SHELL',epoch:'SRC-E3B4-INVENTED-20261102',pin:'4948a1c9c23b738d326b07cfc7d208604c305973',operations:['surface','typed_route','compile_roles','explore','three_stratum']},
 WENDBINE_PUBLIC:{product:ENCYCLOPEDIA,delegate_product:'NEW_UNIVERSAL_ENCYCLOPEDIA_E3B3',epoch:'wendbine-public-v0.1-synthetic',pin:'a8a619378f5a47137a8bd7d1765d47571f383e1e',operations:['lexical','semantic','recent','topology','resolve']},
 EM_METHODS_SYNTHETIC:{product:ATELIER,delegate_product:'UNIVERSAL_ATELIER_B5_RESEARCH_SHELL',epoch:'EM-B6-INVENTED-20261102',pin:'50c35cceb50f483c7c36a1497fed9de9377b89d9',operations:['get_derivative','cite','NATIVE_EM_CORPUS','BLIND_SOURCE_ANATOMY','WORK_IDENTITY_SPLIT_COLLAPSE_SENSITIVITY','MOTIF_VS_MECHANISM_NULL','FORMAL_OPERATOR_AND_AUTHORITY_LAUNDERING','GENEALOGY_AND_SOURCE_INDEPENDENCE','CONVERGENCE_DIVERGENCE_EMERGENCE','OBFUSCATION_DECOMPRESSION','EXTERNAL_SCIENTIFIC_CONFRONTATION','HOSTILE_ALTERNATIVE_MODELS','FRAGMENTARY_BLURB_THEORY_PROPOSALS']}
});
for(const f of catalog.fixtures){const b=Buffer.from(f.bytes_base64,'base64');need(specs[f.family]&&f.evidence_class===evidence&&b.length===f.byte_length&&sha(b)===f.sha256,'B8_CATALOG_BYTES')}
const denied=new Set(['admit','admitRealSource','unsealArchive','readProtectedSource','syncOriginalSRC','activateFlight','registerSource','importSource','generateGrant','authorize','readPrivateBody']);
const fields={
 status:['action'],describeFixtures:['action'],inspectAdmissionReadiness:['action'],
 stageSyntheticFixture:['action','product_id','fixture_id','source_id','bytes','sha256','epoch','rights','evidence_class','receipt'],
 execute:['action','product_id','source_id','receipt','operation','params','citation'],
 readback:['action','product_id','source_id','receipt'],withdraw:['action','product_id','source_id','receipt'],
 threeOriginTrace:['action','product_id','td','src','em','query','question','route']
};
function parameters(p){need(plain(p),'B8_PARAMETERS_OBJECT');const visit=x=>{if(Array.isArray(x)){x.forEach(visit);return}if(!plain(x))return;for(const [k,d]of Object.entries(Object.getOwnPropertyDescriptors(x))){need('value'in d&&!['path','root','filename','file','url','import','code','profile','authorization','approved','__proto__','prototype','constructor'].includes(k),'B8_PARAMETER_READER_OR_AUTHORITY_REFUSED');visit(d.value)}};visit(p)}

/** The only candidate public entry. Reopen requires caller-retained root identity. */
export async function openCandidateProduct(options={}){
 keys(options,['workspace','mode','create','root_receipt']);
 const {workspace,mode='PRODUCT_RECIPIENT',create=false}=options;
 need(modes.includes(mode),'B8_MODE_UNAVAILABLE');need(typeof create==='boolean','B8_CREATE_FLAG_TYPE');directory(workspace);
 need(bind()===loadedBinding,'B8_CODE_CHANGED_AFTER_IMPORT');
 const productFile=path.join(workspace,'PRODUCT.json'),fixtures=path.join(workspace,'SYNTHETIC_FIXTURES'),withdrawals=path.join(workspace,'WITHDRAWN_CATALOG');
 let m,root_receipt=options.root_receipt,engine,engineReceiptDigest;
 if(create){
  need(fs.readdirSync(workspace).length===0,'B8_FRESH_WORKSPACE_REQUIRED');
  m={schema:SCHEMA,product_id:ATELIER,encyclopedia_product_id:ENCYCLOPEDIA,instance_id:randomUUID(),mode,implementation:loadedBinding,historical_product:false,original_connector:'HELD_ORIGINAL_PRODUCT_ENTRY_ABSENT',source_count:0,policy:clone(policy)};
  fs.mkdirSync(fixtures,{mode:0o700});fs.mkdirSync(withdrawals,{mode:0o700});fs.writeFileSync(productFile,pack(m),{flag:'wx',mode:0o600});root_receipt=sha(regular(productFile));
 }else{
  need(typeof root_receipt==='string'&&sha(regular(productFile))===root_receipt,'B8_RETAINED_ROOT_RECEIPT');m=JSON.parse(regular(productFile));
 }
 function safe(){directory(workspace);directory(fixtures);directory(withdrawals);need(sha(regular(productFile))===root_receipt,'B8_PRODUCT_TAMPER');need(bind()===loadedBinding,'B8_CODE_CHANGED_AFTER_IMPORT');denyPolicy(m.policy);need(m.schema===SCHEMA&&m.product_id===ATELIER&&m.encyclopedia_product_id===ENCYCLOPEDIA&&m.mode===mode&&m.implementation===loadedBinding&&m.historical_product===false&&m.source_count===0&&JSON.stringify(m.policy)===JSON.stringify(policy),'B8_CONSTITUTION_OR_MODE_DRIFT')}
 async function implementation(initialize=false){
  safe();
  const dest=path.join(workspace,'ENGINE'),state=path.join(workspace,'ENGINE_RECEIPT.json');
  if(engine){need(sha(regular(state))===engineReceiptDigest,'B8_ENGINE_RECEIPT_TAMPER');return engine}
  if(!fs.existsSync(state)){need(initialize&&!fs.existsSync(dest),'B8_ENGINE_UNEXECUTED_OR_INTERRUPTED');fs.mkdirSync(dest,{mode:0o700})}
  else directory(dest);
  // This import follows the immutable stage/method guard. No original archive readers enter this closure.
  const {openEmAssembly}=await import('../E3B6/recipient-em-assembly-v01.mjs');
  if(fs.existsSync(state)){const r=JSON.parse(regular(state));need(r.instance_id===m.instance_id&&r.mode===mode,'B8_ENGINE_RECEIPT_BINDING');engine=await openEmAssembly({workspace:dest,lane:mode,root_receipt:r.receipt})}
  else{engine=await openEmAssembly({workspace:dest,lane:mode,create:true});fs.writeFileSync(state,pack({instance_id:m.instance_id,mode,receipt:engine.root_receipt}),{flag:'wx',mode:0o600})}
  engineReceiptDigest=sha(regular(state));return engine;
 }
 const loc=id=>path.join(fixtures,sha(Buffer.from(id)));
 const withdrawal=id=>path.join(withdrawals,sha(Buffer.from(id)));
 function entry(q){
  need(typeof q.source_id==='string'&&/^FIXTURE-[A-Z0-9_-]+$/.test(q.source_id),'B8_FIXTURE_SOURCE_ID');
  const folder=loc(q.source_id);directory(folder);need(!fs.existsSync(path.join(folder,'WITHDRAWN')),'B8_FIXTURE_WITHDRAWN');
  const raw=regular(path.join(folder,'receipt.json'));need(typeof q.receipt==='string'&&sha(raw)===q.receipt,'B8_RETAINED_FIXTURE_RECEIPT');
  const r=JSON.parse(raw),f=catalog.fixtures.find(x=>x.fixture_id===r.fixture_id),s=f&&specs[f.family];
  need(s&&q.product_id===s.product&&r.product_id===s.product&&r.instance_id===m.instance_id&&r.mode===mode&&r.source_id===q.source_id&&r.family===f.family&&r.sha256===f.sha256&&r.epoch===s.epoch&&r.rights===rights&&r.evidence_class===evidence&&r.real_source_admitted===false,'B8_FIXTURE_BINDING');
  need(!fs.existsSync(withdrawal(f.fixture_id)),'B8_FIXTURE_WITHDRAWN_CATALOG_SCOPE');
  return {folder,r,f,s};
 }
 const delegate=r=>({family:r.family,source_id:r.source_id,receipt:r.delegate_receipt,product:specs[r.family].delegate_product,epoch:r.epoch,rights});
 async function execute(q){
  const {r,s}=entry(q);
  if(!s.operations.includes(q.operation))return {status:'UNAVAILABLE',execution_count:0,operation:q.operation,reason:'B8_NO_IMPLEMENTED_PERMITTED_ROUTE',product_id:q.product_id,family:r.family,source_id:q.source_id,source_receipt:q.receipt,source_sha256:r.sha256,epoch:r.epoch,rights,evidence_class:evidence,declared:false,implemented:false,executed_with_synthetic:false,source_authorized:false,native_corpus_verified:false,scientifically_validated:false};
  parameters(q.params??{});
  if(q.citation)need(q.citation.product_id===q.product_id&&q.citation.source_id===q.source_id&&q.citation.source_receipt===q.receipt,'B8_CITATION_PRODUCT_OR_SOURCE');
  const api=await implementation(),result=await api.request({...delegate(r),action:'execute',operation:q.operation,params:q.params??{},...(q.citation?{citation:q.citation.native_citation}:{})});
  const out={schema:'td613.b8-candidate-execution/v1',product_id:q.product_id,historical_product:false,instance_id:m.instance_id,mode,family:r.family,source_id:r.source_id,source_receipt:q.receipt,source_sha256:r.sha256,epoch:r.epoch,rights,evidence_class:evidence,declared:true,implemented:!['three_stratum','NATIVE_EM_CORPUS'].includes(q.operation),executed_with_synthetic:result.execution_count>0,source_authorized:false,native_corpus_verified:false,scientifically_validated:false,independent_durable_custody_credit:false,independent_empirical_replications:0,delegate:result,status:result.status,execution_count:result.execution_count};
  if(q.operation==='cite'&&result.result)out.citation={product_id:q.product_id,source_id:q.source_id,source_receipt:q.receipt,native_citation:result.result};
  return out;
 }
 async function request(q={}){
  // Read only the action descriptor first: forbidden operations never inspect a supplied path/profile/bytes.
  need(plain(q),'B8_PLAIN_REQUEST_REQUIRED');const action=Object.getOwnPropertyDescriptor(q,'action');need(action&&'value'in action&&typeof action.value==='string','B8_ACTION_REQUIRED');
  if(denied.has(action.value))fail('B8_REAL_SOURCE_OPERATION_DISABLED');
  need(fields[action.value],'B8_ACTION_UNAVAILABLE');keys(q,fields[action.value]);safe();
  if(q.action==='inspectAdmissionReadiness')return {...clone(policy),runtime_enforcement_implemented:true,scope:'TEST_ONLY_PUBLIC_ENTRY',real_source_operations:'HARD_DISABLED_NO_PERMIT_PATH',external_custody:'HELD',production_privacy_security:'HELD'};
  if(q.action==='describeFixtures')return catalog.fixtures.map(({bytes_base64,...f})=>({...clone(f),product_id:specs[f.family].product,epoch:specs[f.family].epoch,rights}));
  if(q.action==='status'){
   const initialized=fs.existsSync(path.join(workspace,'ENGINE_RECEIPT.json'));
   const baseline=initialized?await(await implementation()).request({action:'status'}):null;
   return {constitution:clone(m),root_receipt,engine_status:initialized?'AVAILABLE_SYNTHETIC_ONLY':'UNEXECUTED',baseline,original_profile_sha256:baseline?baseline.baseline.manifest.profile_sha256:null,capability_coordinates:{declared:44,original_initial_callable:1,implemented_routes:clone(specs),executed_with_synthetic:'PER_EXECUTION_ENVELOPE_NOT_REGISTRY_PROMOTION',native_corpus_verified:false,source_authorized:false,scientifically_validated:false},src_classification:{executed:4,partial:7,designed:1,original_corpus_parity:0},em_classification:{bounded_executed:3,partial:6,designed:1,native_corpus_parity:'HELD'}};
  }
  if(q.action==='stageSyntheticFixture'){
   const f=catalog.fixtures.find(x=>x.fixture_id===q.fixture_id),s=f&&specs[f.family];
   need(s&&q.product_id===s.product&&q.epoch===s.epoch&&q.rights===rights&&q.evidence_class===evidence,'B8_SYNTHETIC_RIGHTS_PRODUCT_EPOCH');
   need(!fs.existsSync(withdrawal(f.fixture_id)),'B8_FIXTURE_WITHDRAWN_CATALOG_SCOPE');
   need(typeof q.source_id==='string'&&/^FIXTURE-[A-Z0-9_-]+$/.test(q.source_id)&&(f.family!=='EM_METHODS_SYNTHETIC'||q.source_id.startsWith('FIXTURE-EM-')),'B8_FIXTURE_SOURCE_ID');
   need(Buffer.isBuffer(q.bytes)&&q.bytes.length>0&&q.bytes.equals(Buffer.from(f.bytes_base64,'base64'))&&q.sha256===f.sha256&&sha(q.bytes)===f.sha256,'B8_ONLY_EXACT_CATALOG_BYTES');
   const target=loc(q.source_id);
   if(fs.existsSync(target)){const r=entry(q);need(r.r.fixture_id===q.fixture_id,'B8_CONFLICTING_FIXTURE_ID');await(await implementation()).request({...delegate(r.r),action:'readback'});return {status:'EXACT_REPLAY',receipt:q.receipt,real_source_admitted:false}}
   const pending=target+'.pending';need(!fs.existsSync(pending),'B8_INTERRUPTED_STAGING_HELD');fs.mkdirSync(pending,{mode:0o700});
   const result=await(await implementation(true)).request({action:'admit',family:f.family,product:s.delegate_product,epoch:s.epoch,rights,source_pin:s.pin,evidence_class:evidence,source_id:q.source_id,bytes:q.bytes,sha256:f.sha256});
   need(!fs.existsSync(withdrawal(f.fixture_id)),'B8_FIXTURE_WITHDRAWN_CATALOG_SCOPE');
   const record={schema:'td613.b8-synthetic-fixture-receipt/v1',instance_id:m.instance_id,mode,product_id:s.product,fixture_id:f.fixture_id,family:f.family,source_id:q.source_id,sha256:f.sha256,epoch:s.epoch,rights,evidence_class:evidence,delegate_receipt:result.receipt,real_source_admitted:false,scientific_authority:false};
   fs.writeFileSync(path.join(pending,'receipt.json'),pack(record),{flag:'wx',mode:0o600});fs.renameSync(pending,target);
   return {status:'STAGED_UNADMITTED',fixture_status:'SYNTHETIC_TEST_NAMESPACE_ONLY',receipt:sha(pack(record)),source_id:q.source_id,product_id:s.product,real_source_admitted:false,source_count:0,independent_durable_custody_credit:false};
  }
  if(q.action==='execute')return execute(q);
  if(q.action==='readback'){const {r}=entry(q);const out=await(await implementation()).request({...delegate(r),action:'readback'});need(sha(out.bytes)===r.sha256,'B8_READBACK_BYTES');return {status:'SYNTHETIC_READBACK',product_id:q.product_id,source_id:q.source_id,bytes:out.bytes,sha256:r.sha256,independent_durable_custody_credit:false}}
  if(q.action==='withdraw'){
   const {r,folder}=entry(q),record={instance_id:m.instance_id,fixture_id:r.fixture_id,source_id:r.source_id,source_receipt:q.receipt,scope:'EXPLICIT_CATALOG_ID_ALL_ALIASES_IN_THIS_INSTANCE',real_source_authority:false};
   // Revoke the declared catalog identity first; interruption cannot reopen an alias.
   fs.writeFileSync(withdrawal(r.fixture_id),pack(record),{flag:'wx',mode:0o600});
   await(await implementation()).request({...delegate(r),action:'withdraw',authority:'SYNTHETIC_OPERATOR_WITHDRAWAL_ONLY'});fs.writeFileSync(path.join(folder,'WITHDRAWN'),q.receipt,{flag:'wx',mode:0o600});
   return {status:'SYNTHETIC_FIXTURE_WITHDRAWN',real_source_count:0,catalog_fixture_id:r.fixture_id,withdrawal_receipt:sha(pack(record)),scope:record.scope};
  }
  if(q.action==='threeOriginTrace'){
   need(q.product_id===ATELIER&&mode==='PRODUCT_RECIPIENT','B8_TRACE_PRODUCT_MODE');
   const queries=[q.td,q.src,q.em];for(const a of queries)keys(a,['product_id','source_id','receipt']);
   const rows=queries.map(entry);need(rows.map(x=>x.r.family).join(',')==='TD613_REFERENCE,SRC_METHODS,EM_METHODS_SYNTHETIC','B8_TRACE_SOURCE_ORDER');
   need(new Set(rows.map(x=>x.r.source_id)).size===3,'B8_TRACE_DISTINCT_ORIGINS');parameters(q.route??{});
   const result=await(await implementation()).request({action:'three_origin_trace',td:delegate(rows[0].r),src:delegate(rows[1].r),em:delegate(rows[2].r),query:q.query,question:q.question,route:q.route});
   return {status:'BOUNDED_THREE_ORIGIN_TRACE',product_id:ATELIER,historical_product:false,evidence_class:evidence,source_envelopes:rows.map((x,i)=>({product_id:queries[i].product_id,family:x.r.family,source_id:x.r.source_id,receipt:queries[i].receipt,sha256:x.r.sha256,epoch:x.r.epoch,rights})),delegate:result,cross_bridge:{...result.cross_bridge,status:'HELD',scientifically_validated:false,real_source_admitted:false},execution_count:result.execution_count};
  }
 }
 safe();return Object.freeze({request,root_receipt});
}
