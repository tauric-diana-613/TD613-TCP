/**
 * TD613 GA03 · Source-free remedies for two GA01 findings.
 *
 * 1. Unified *mediated API* revocation for fixture aliases in a single
 * synthetic cohort, enforcing fresh policy reads on every receiver call.
 * Previously persisted raw bytes and unmediated/legacy APIs remain outside
 * this guarantee; no physical erasure or external antirollback witness.
 *
 * 2. Truthful B91 reference -> TD613 native-intake projection, retaining
 * BOTH original and derived SHA-256 identities. It is NEVER byte-equivalence.
 *
 * NO real sources, crypto keys, sync, remote providers, private restoration.
 */
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {nativeProbe,openSyntheticReceiver} from './reciprocal-receiver-sourcefree-v01.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const fail=code=>{throw Object.assign(Error(code),{code})};
const need=(ok,code)=>{if(!ok)fail(code)};
const name='W_PUBLIC';
const aliases=Object.freeze({
  product:'FIXTURE-W-GA01',
  index:'FIXTURE-W-GA01-INDEX',
  receiver:'FIXTURE:W-GA01-ORIGINAL',
  catalog_id:name
});
const manifest=Object.freeze({schema:'td613.ga03.sourcefree-revocation-policy/v1',
 evidence_class:'SYNTHETIC_LOCAL_ONLY',cohort:name,aliases,
 real_sources_permitted:false,external_trust_anchor:false,global_erasure:false});
const manifestBytes=Buffer.from(JSON.stringify(manifest)+'\n');
function directory(p) {
 need(typeof p==='string'&&path.isAbsolute(p)&&fs.existsSync(p)&&
   fs.lstatSync(p).isDirectory()&&!fs.lstatSync(p).isSymbolicLink()&&
   fs.realpathSync(p)===p,'GA03_REAL_DIRECTORY_REQUIRED');
}
function fixedFile(p){
 need(fs.existsSync(p)&&fs.lstatSync(p).isFile()&&!fs.lstatSync(p).isSymbolicLink()&&
   fs.realpathSync(p)===p,'GA03_FILE_SUBSTITUTED');
 return fs.readFileSync(p);
}
const put=(p,content)=>{
 const fd=fs.openSync(p,'wx',0o600);
 try{fs.writeFileSync(fd,content);fs.fsyncSync(fd);}finally{fs.closeSync(fd);}
};
function flushDir(p){
 if(process.platform!=='win32'){const fd=fs.openSync(p,'r');try{fs.fsyncSync(fd)}finally{fs.closeSync(fd);}}
}
export function openSourceFreeCohortPolicy({root,create=false,retainedReceipt}={}){
 directory(root);
 const m=path.join(root,'COHORT.json'),revDir=path.join(root,'REVOCATIONS');
 if(create){
   need(fs.readdirSync(root).length===0,'GA03_EXCLUSIVE_FRESH_POLICY_ROOT');
   put(m,manifestBytes);fs.mkdirSync(revDir,{mode:0o700});flushDir(root);
 }else need(typeof retainedReceipt==='string'&&/^[a-f0-9]{64}$/.test(retainedReceipt),
   'GA03_INDEPENDENT_LOCAL_RECEIPT_REQUIRED');
 const seal=sha(manifestBytes);
 need(create||retainedReceipt===seal,'GA03_WRONG_POLICY_RECEIPT');
 const tomb=path.join(revDir,sha(Buffer.from(name))+'.json');
 const expectedTomb=Buffer.from(JSON.stringify({schema:'td613.ga03.revocation/v1',
  cohort:name,aliases_digest:sha(Buffer.from(JSON.stringify(aliases))),
  disposition:'ACCESS_DENIED_FOR_ALL_MEDIATED_ALIASES',source_free:true})+'\n');
 function safe(){
   directory(root);directory(revDir);
   need(fs.readdirSync(root).sort().join(',')==='COHORT.json,REVOCATIONS','GA03_POLICY_ROOT_DRIFT');
   need(fixedFile(m).equals(manifestBytes),'GA03_POLICY_MANIFEST_TAMPER');
   const entries=fs.readdirSync(revDir);
   need(entries.length<=1&&entries.every(x=>x===path.basename(tomb)),'GA03_UNEXPECTED_REVOCATION_RECORD');
   if(entries.length)need(fixedFile(tomb).equals(expectedTomb),'GA03_TOMBSTONE_TAMPER');
   return entries.length===1;
 }
 function assertAllowed(alias){
   need(Object.values(aliases).includes(alias),'GA03_UNREGISTERED_ALIAS_DENIED');
   need(!safe(),'GA03_COHORT_ACCESS_WITHDRAWN');
 }
 function withdraw(){
   if(safe())return {status:'ALREADY_WITHDRAWN',cohort:name};
   // Tombstone FIRST. Any interruption afterwards leaves mediated access closed.
   put(tomb,expectedTomb);flushDir(revDir);flushDir(root);
   need(safe(),'GA03_REVOCATION_NOT_DURABLE_ON_READBACK');
   return {status:'WITHDRAWN_MEDIATED_API',cohort:name,
     receipt:sha(expectedTomb),external_trust_anchor:false,physical_erasure:false};
 }
 function controlledReceiver({repoRoot,store,route,sourceId,recordReceipt}){
   need(route==='WENDBINE_ATELIER_TO_UNIVERSAL_ENCYCLOPEDIA'&&sourceId===aliases.receiver,
     'GA03_RECEIVER_ROUTE_OR_ALIAS_REFUSED');
   const raw=openSyntheticReceiver({repoRoot,store,route});
   const guard=()=>assertAllowed(aliases.receiver);
   return Object.freeze({
     retrieve(){guard();const x=raw.retrieve(sourceId,recordReceipt);guard();return x;},
     async execute(){guard();const x=await raw.execute(sourceId,recordReceipt);guard();return x;},
     search(term){guard();const x=raw.search(term);guard();return {...x,policy:'COHORT_PRECHECK',unmediated_original_api:'OUT_OF_SCOPE'};}
   });
 }
 function controlledProduct({productApi,productId,sourceId,sourceReceipt}){
   need(productId&&sourceId===aliases.product&&typeof sourceReceipt==='string','GA03_PRODUCT_BINDING');
   const guard=()=>assertAllowed(aliases.product);
   return Object.freeze({
     async readback(){guard();const x=await productApi.request({action:'readback',product_id:productId,source_id:sourceId,receipt:sourceReceipt});guard();return x;},
     async execute(operation,params={}){guard();const x=await productApi.request({action:'execute',product_id:productId,source_id:sourceId,receipt:sourceReceipt,operation,params});guard();return x;},
     async withdraw(){const prior=withdraw();try{await productApi.request({action:'withdraw',product_id:productId,source_id:sourceId,receipt:sourceReceipt})}catch(e){/* tombstone remains enforced */return {status:'MEDIATED_REVOKED_PRODUCT_FINALIZATION_HELD',cohort:name,error_code:e.code??'UNSPECIFIED',policy:prior}}return {status:'MEDIATED_REVOKED_PRODUCT_FINALIZED',policy:prior};}
   });
 }
 // The index must be opened with THIS predicate. Unmediated index readers
 // and copied raw files remain outside the mediated guarantee.
 const indexAllow=sourceId=>sourceId===aliases.index&&(()=>{try{assertAllowed(aliases.index);return true}catch{return false}})();
 safe();
 return Object.freeze({rootReceipt:seal,aliases,assertAllowed,withdraw,
   controlledReceiver,controlledProduct,indexAllow,
   state:()=>({cohort:name,withdrawn:safe(),physical_erasure:false,
     global_unmediated_revocation:'HELD',external_antirollback:'HELD'})});
}

const TD_ORIGINAL_SHA='f1224ae923f16c81e9e7b66373edaab8660e4c4d72ff510083f7215d563c3865';
/** A declared, source-grounded *derivative projection*: source != target. */
export function projectExactTDReferenceToNativeIntake(originalBytes){
 need(Buffer.isBuffer(originalBytes)&&sha(originalBytes)===TD_ORIGINAL_SHA,
   'GA03_TD_PINNED_ORIGINAL_REQUIRED');
 let reference;
 try{reference=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(originalBytes))}
 catch{fail('GA03_TD_ORIGINAL_FORMAT_INVALID')}
 need(reference.manifest?.schema==='td613.encyclopedia.reference/v1'&&
   reference.manifest.edition_source_commit==='synthetic-only'&&
   Array.isArray(reference.records)&&reference.records.length===2,
   'GA03_TD_SCHEMA_OR_COUNT_MISMATCH');
 const a=reference.records.find(x=>x.id==='R-FIXTURE-A');
 need(a?.visibility==='public'&&a.evidence_class==='SYNTHETIC'&&
   typeof a.record?.body==='string'&&Array.isArray(a.source_keys)&&a.source_keys.length>0,
   'GA03_TD_EXACT_RECORD_BINDING');
 const projected={schema:'td613.research-intake/v1',record_id:a.id,kind:'source_note',
   title:a.label,recorded_at:'2026-11-02T12:00:00Z',
   author:'source-free fixed reference projection',
   human_request_ref:'GA03_SOURCE_FREE_BRIDGE_NOT_HUMAN_ORIGINAL',
   visibility:'public',body:a.record.body,aliases:a.aliases,
   sources:a.source_keys.map(source_id=>({source_id,kind:'artifact',
     locator:'fixture://td613/edition-reference/R-FIXTURE-A',
     capture_status:'OPERATOR_SUPPLIED',sha256:TD_ORIGINAL_SHA})),
   evidence:{disposition:'SPECIFIED',
     earned_claim:'Projected fixed, invented TD613 reference fields only.',
     claim_ceiling:'Synthetic derived native-intake schema; not the original bytes or author.',
     missing_evidence:['external source origin','full original records and links','real source rights','scientific validation']}
 };
 const derivedBytes=Buffer.from(JSON.stringify(projected),'utf8');
 need(sha(derivedBytes)!==TD_ORIGINAL_SHA&&projected.record_id===a.id&&
   projected.title===a.label&&projected.body===a.record.body,
   'GA03_TD_PROJECTION_IDENTITY_CONFLICT');
 const lineage=Object.freeze({schema:'td613.ga03.typed-projection/v1',mapping:'TD_REFERENCE_RECORD_A_TO_NATIVE_INTAKE',
   original_schema:reference.manifest.schema,derived_schema:projected.schema,
   original_sha256:TD_ORIGINAL_SHA,derived_sha256:sha(derivedBytes),
   exact_original_bytes_retained:true,derived_from_record_id:a.id,
   field_equalities:['record_id','title_from_label','body_from_record.body'],
   transformation_is_byte_preserving:false,
   other_original_records_not_transferred:1,
   origin_and_scientific_parity:'HELD'});
 return {originalBytes:Buffer.from(originalBytes),derivedBytes,lineage,projected};
}
/** A pinned original->derivative link with a *real native function execution*. */
export async function executeSourceFreeTDProjection({repoRoot,originalBytes}={}){
 const projected=projectExactTDReferenceToNativeIntake(originalBytes);
 const r=await nativeProbe(repoRoot,'TD613_ENCYCLOPEDIA_TO_UNIVERSAL_ATELIER',projected.derivedBytes.toString('utf8'));
 need(r.result.source_id===projected.projected.record_id&&
   r.result.title===projected.projected.title,'GA03_TD_NATIVE_PROJECTION_MISMATCH');
 return {lineage:projected.lineage,native_operation:r.operation,native_result:r.result,
   original_sha256:projected.lineage.original_sha256,derived_sha256:projected.lineage.derived_sha256,
   claim_ceiling:'TWO_SCHEMA_DERIVATIVE_LINK_EXECUTED; SAME_ORIGINAL_BYTE_PARITY_NOT_EARNED'};
}
