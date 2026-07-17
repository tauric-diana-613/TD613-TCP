import {bytesToHex,canonicalJson,digestRecord,nowIso,uniqueStrings,withoutKeys} from './ash-stretch12-r02-common.js';

export const KEY_TOPOLOGY_SCHEMA='td613.ash.key-topology/v0.1';
export const KEY_TOPOLOGY_RECEIPT_SCHEMA='td613.ash.key-topology-receipt/v0.1';
export const CAPSULE_SCHEMA='td613.ash.encrypted-portable-capsule/v0.1';
export const CAPSULE_IMPORT_SCHEMA='td613.ash.capsule-import-receipt/v0.1';
export const CAPSULE_RETURN_SCHEMA='td613.ash.capsule-return-receipt/v0.1';
export const CAPSULE_RECALL_SCHEMA='td613.ash.capsule-recall/v0.1';
export const MIGRATION_DRY_RUN_SCHEMA='td613.ash.live-state-migration-dry-run/v0.1';
export const ROLLBACK_RECEIPT_SCHEMA='td613.ash.live-state-rollback-receipt/v0.1';
export const ORIGIN_MANIFEST_SCHEMA='td613.ash.origin-manifest/v0.2';

const encoder=new TextEncoder();
const decoder=new TextDecoder();
const MIN_PBKDF2_ITERATIONS=600_000;
const b64=bytes=>Buffer.from(bytes).toString('base64');
const unb64=value=>new Uint8Array(Buffer.from(value,'base64'));
function randomBytes(length,cryptoImpl=globalThis.crypto){const bytes=new Uint8Array(length);cryptoImpl.getRandomValues(bytes);return bytes;}
async function sha256Bytes(bytes,cryptoImpl=globalThis.crypto){return new Uint8Array(await cryptoImpl.subtle.digest('SHA-256',bytes));}
async function importAesKey(raw,usages,cryptoImpl=globalThis.crypto){return cryptoImpl.subtle.importKey('raw',raw,{name:'AES-GCM'},false,usages);}
async function deriveWrappingKey(passphrase,salt,iterations,cryptoImpl=globalThis.crypto){
  if(typeof passphrase!=='string'||passphrase.length<12)throw new Error('Passphrase must contain at least 12 characters.');
  if(!Number.isInteger(iterations)||iterations<MIN_PBKDF2_ITERATIONS)throw new Error(`PBKDF2 iterations must be at least ${MIN_PBKDF2_ITERATIONS}.`);
  const material=await cryptoImpl.subtle.importKey('raw',encoder.encode(passphrase),'PBKDF2',false,['deriveKey']);
  return cryptoImpl.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt,iterations},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
const aadForRecord=meta=>encoder.encode(canonicalJson(meta));
const topologySubject=value=>withoutKeys(value,['record_digest']);

export async function compileKeyTopology(input,options={}){
  const nodes=[...(input.nodes||[])].map(node=>({id:String(node.id||''),type:String(node.type||''),location_class:String(node.location_class||'UNRESOLVED'),case_scope:String(node.case_scope||input.case_id||''),exportable:node.exportable===true,hardware_backed:node.hardware_backed===true,secret_material_present:false}));
  const edges=[...(input.edges||[])].map(edge=>({from:String(edge.from||''),to:String(edge.to||''),relation:String(edge.relation||'')}));
  if(!nodes.length||nodes.some(node=>!node.id||!node.type))throw new TypeError('Key topology nodes require id and type.');
  const ids=new Set(nodes.map(node=>node.id));
  if(ids.size!==nodes.length)throw new Error('Key topology node IDs must be unique.');
  if(edges.some(edge=>!ids.has(edge.from)||!ids.has(edge.to)))throw new Error('Every topology edge must reference known key nodes.');
  const holds=[];const byId=Object.fromEntries(nodes.map(node=>[node.id,node]));
  for(const edge of edges){
    const from=byId[edge.from],to=byId[edge.to];
    if(edge.relation==='co-locates'&&from.location_class===to.location_class){
      const pair=new Set([from.type,to.type]);
      if(pair.has('ciphertext')&&(pair.has('passphrase')||pair.has('recovery_key')||pair.has('data_key')))holds.push(`DANGEROUS_COLOCATION:${from.id}:${to.id}`);
    }
    if(edge.relation==='exports'&&from.type==='data_key')holds.push(`EXPORTED_DATA_KEY:${from.id}`);
  }
  const caseDataKeys=nodes.filter(node=>node.type==='data_key');
  const caseScopes=new Set(caseDataKeys.map(node=>node.case_scope));
  if(caseDataKeys.length>1&&caseScopes.size>1&&new Set(caseDataKeys.map(node=>node.id)).size<caseDataKeys.length)holds.push('DATA_KEY_REUSED_ACROSS_CASES');
  for(const node of nodes){
    if(node.type==='recipient_private_key'&&node.location_class==='SENDER_MEDIA')holds.push(`RECIPIENT_PRIVATE_KEY_ON_SENDER_MEDIA:${node.id}`);
    if(node.type==='recovery_key'&&node.location_class===input.ciphertext_location_class)holds.push(`RECOVERY_KEY_COLOCATED:${node.id}`);
  }
  const topology={schema:KEY_TOPOLOGY_SCHEMA,schema_version:'0.1',record_id:input.record_id||`key-topology:${input.case_id}`,case_id:String(input.case_id||''),created_at:input.created_at||nowIso(options.now),source_status:String(input.source_status||'DERIVED'),nodes,edges,rotation_state:String(input.rotation_state||'CURRENT'),revocation_state:String(input.revocation_state||'NOT_REVOKED'),recovery_key_separated:!holds.some(item=>item.includes('RECOVERY_KEY')),dangerous_topology:uniqueStrings(holds),secret_material_persisted:false,missingness:uniqueStrings(input.missingness),uncertainty:uniqueStrings(input.uncertainty),claim_ceiling:'KEY_RELATIONSHIP_POSTURE_ONLY',operator_closure:String(input.operator_closure||'OPEN')};
  topology.record_digest=await digestRecord(KEY_TOPOLOGY_SCHEMA,topologySubject(topology),options.cryptoImpl);return Object.freeze(topology);
}

export async function verifyKeyTopology(topology,options={}){return Boolean(topology&&topology.schema===KEY_TOPOLOGY_SCHEMA&&topology.secret_material_persisted===false&&topology.record_digest===await digestRecord(KEY_TOPOLOGY_SCHEMA,topologySubject(topology),options.cryptoImpl));}

export async function compileKeyTopologyReceipt(topology,input={},options={}){
  if(!(await verifyKeyTopology(topology,options)))throw new Error('Verified key topology required.');
  const receipt={schema:KEY_TOPOLOGY_RECEIPT_SCHEMA,schema_version:'0.1',record_id:input.record_id||`key-topology-receipt:${topology.case_id}`,case_id:topology.case_id,created_at:input.created_at||nowIso(options.now),source_status:'DERIVED',topology_reference:topology.record_id,topology_digest:topology.record_digest,hold_state:topology.dangerous_topology.length?'HELD':'ELIGIBLE_FOR_CRYPTOGRAPHIC_PROCEDURE',holds:topology.dangerous_topology,missingness:topology.missingness,uncertainty:topology.uncertainty,claim_ceiling:'KEY_TOPOLOGY_VERIFICATION_ONLY',operator_closure:String(input.operator_closure||'OPEN')};
  receipt.record_digest=await digestRecord(KEY_TOPOLOGY_RECEIPT_SCHEMA,withoutKeys(receipt,['record_digest']),options.cryptoImpl);return Object.freeze(receipt);
}

function recordMetadata(caseId,record,index,context){return {case_id:caseId,record_id:String(record.record_id||`record:${index}`),record_class:String(record.record_class||'GENERIC'),sequence:index,database_version:String(context.database_version||'r02'),origin_root:String(context.origin_root||''),custody_root:String(context.custody_root||'')};}

export async function encryptPortableCapsule(input,options={}){
  const cryptoImpl=options.cryptoImpl||globalThis.crypto;const topology=input.key_topology;
  if(!(await verifyKeyTopology(topology,{cryptoImpl})))throw new Error('Verified key topology required.');
  if(topology.dangerous_topology.length)throw new Error(`Key topology held: ${topology.dangerous_topology.join(', ')}`);
  const records=[...(input.records||[])];if(!records.length)throw new TypeError('At least one record is required.');
  const dataKeyRaw=randomBytes(32,cryptoImpl);const dataKey=await importAesKey(dataKeyRaw,['encrypt','decrypt'],cryptoImpl);const encryptedRecords=[];const ivSet=new Set();
  for(let index=0;index<records.length;index+=1){
    const iv=randomBytes(12,cryptoImpl),ivText=b64(iv);if(ivSet.has(ivText))throw new Error('Record IV collision.');ivSet.add(ivText);
    const metadata=recordMetadata(input.case_id,records[index],index,input);const plaintext=encoder.encode(canonicalJson(records[index]));
    const ciphertext=new Uint8Array(await cryptoImpl.subtle.encrypt({name:'AES-GCM',iv,additionalData:aadForRecord(metadata),tagLength:128},dataKey,plaintext));
    encryptedRecords.push({metadata,iv:ivText,ciphertext:b64(ciphertext)});
  }
  const salt=randomBytes(16,cryptoImpl),wrapIv=randomBytes(12,cryptoImpl),iterations=input.pbkdf2_iterations||MIN_PBKDF2_ITERATIONS;
  const wrappingKey=await deriveWrappingKey(input.passphrase,salt,iterations,cryptoImpl);
  const wrapMetadata={case_id:String(input.case_id),key_topology_digest:topology.record_digest,origin_root:String(input.origin_root||''),custody_root:String(input.custody_root||''),algorithm:'AES-256-GCM'};
  const wrappedKey=new Uint8Array(await cryptoImpl.subtle.encrypt({name:'AES-GCM',iv:wrapIv,additionalData:aadForRecord(wrapMetadata),tagLength:128},wrappingKey,dataKeyRaw));
  const capsule={schema:CAPSULE_SCHEMA,schema_version:'0.1',record_id:input.record_id||`capsule:${input.case_id}:${Date.now()}`,case_id:String(input.case_id),created_at:input.created_at||nowIso(options.now),source_status:'DERIVED',origin_root:String(input.origin_root||''),custody_root:String(input.custody_root||''),key_topology_reference:topology.record_id,key_topology_digest:topology.record_digest,key_wrap:{algorithm:'AES-256-GCM',kdf:'PBKDF2-HMAC-SHA-256',iterations,salt:b64(salt),iv:b64(wrapIv),metadata:wrapMetadata,wrapped_key:b64(wrappedKey)},records:encryptedRecords,record_count:encryptedRecords.length,plaintext_persisted:false,passphrase_persisted:false,data_key_persisted:false,physical_erasure_claimed:false,endpoint_integrity_claimed:false,missingness:uniqueStrings(input.missingness),uncertainty:uniqueStrings(input.uncertainty),claim_ceiling:'AUTHENTICATED_ENCRYPTED_ENVELOPE_UNDER_DECLARED_KEY_TOPOLOGY',operator_closure:String(input.operator_closure||'OPEN')};
  capsule.record_digest=await digestRecord(CAPSULE_SCHEMA,withoutKeys(capsule,['record_digest']),cryptoImpl);dataKeyRaw.fill(0);return Object.freeze(capsule);
}

export async function verifyCapsuleDigest(capsule,options={}){
  if(!capsule||capsule.schema!==CAPSULE_SCHEMA||capsule.plaintext_persisted!==false||capsule.passphrase_persisted!==false||capsule.data_key_persisted!==false)return false;
  const ivs=capsule.records.map(record=>record.iv);if(new Set(ivs).size!==ivs.length)return false;
  return capsule.record_digest===await digestRecord(CAPSULE_SCHEMA,withoutKeys(capsule,['record_digest']),options.cryptoImpl);
}

export async function decryptPortableCapsule(capsule,passphrase,options={}){
  const cryptoImpl=options.cryptoImpl||globalThis.crypto;if(!(await verifyCapsuleDigest(capsule,{cryptoImpl})))throw new Error('Capsule digest or invariant verification failed.');
  const wrap=capsule.key_wrap,wrappingKey=await deriveWrappingKey(passphrase,unb64(wrap.salt),wrap.iterations,cryptoImpl);let dataKeyRaw;
  try{dataKeyRaw=new Uint8Array(await cryptoImpl.subtle.decrypt({name:'AES-GCM',iv:unb64(wrap.iv),additionalData:aadForRecord(wrap.metadata),tagLength:128},wrappingKey,unb64(wrap.wrapped_key)));}catch{throw new Error('CAPSULE_OPEN_HELD: wrong passphrase or wrapped-key tamper.');}
  const dataKey=await importAesKey(dataKeyRaw,['decrypt'],cryptoImpl);const records=[];
  try{for(const encrypted of capsule.records){const plaintext=await cryptoImpl.subtle.decrypt({name:'AES-GCM',iv:unb64(encrypted.iv),additionalData:aadForRecord(encrypted.metadata),tagLength:128},dataKey,unb64(encrypted.ciphertext));records.push(JSON.parse(decoder.decode(plaintext)));}}catch{throw new Error('CAPSULE_IMPORT_HELD: record ciphertext or authenticated metadata tamper.');}finally{dataKeyRaw.fill(0);}
  return records;
}

export async function compileMigrationDryRun(input,options={}){
  let capsule=null,roundTrip=null,status='HELD';const failures=[];
  try{capsule=await encryptPortableCapsule(input,options);roundTrip=await decryptPortableCapsule(capsule,input.passphrase,options);if(canonicalJson(roundTrip)!==canonicalJson(input.records))failures.push('ROUND_TRIP_MISMATCH');status=failures.length?'HELD':'DRY_RUN_VERIFIED';}catch(error){failures.push(error.message);}
  const receipt={schema:MIGRATION_DRY_RUN_SCHEMA,schema_version:'0.1',record_id:input.migration_id||`migration-dry-run:${input.case_id}`,case_id:String(input.case_id),created_at:input.created_at||nowIso(options.now),source_status:'DERIVED',status,input_record_count:(input.records||[]).length,verified_record_count:roundTrip?.length||0,capsule_digest:capsule?.record_digest||null,committed_to_live_store:false,rollback_required:false,partial_record_failure_hold:failures.length>0,failures,missingness:[],uncertainty:['JavaScript memory zeroization cannot be guaranteed'],claim_ceiling:'MIGRATION_DRY_RUN_ONLY',operator_closure:'OPEN'};
  receipt.record_digest=await digestRecord(MIGRATION_DRY_RUN_SCHEMA,withoutKeys(receipt,['record_digest']),options.cryptoImpl);return Object.freeze(receipt);
}

export async function compileRollbackReceipt(input,options={}){
  const receipt={schema:ROLLBACK_RECEIPT_SCHEMA,schema_version:'0.1',record_id:input.record_id||`rollback:${input.case_id}:${Date.now()}`,case_id:String(input.case_id),created_at:input.created_at||nowIso(options.now),source_status:'DERIVED',migration_reference:String(input.migration_reference||''),rollback_status:String(input.rollback_status||'NOT_REQUIRED'),restored_store_digest:input.restored_store_digest||null,plaintext_persistence_claimed:false,physical_erasure_claimed:false,missingness:uniqueStrings(input.missingness),uncertainty:uniqueStrings(input.uncertainty),claim_ceiling:'ROLLBACK_EVENT_ONLY',operator_closure:String(input.operator_closure||'OPEN')};
  receipt.record_digest=await digestRecord(ROLLBACK_RECEIPT_SCHEMA,withoutKeys(receipt,['record_digest']),options.cryptoImpl);return Object.freeze(receipt);
}

export async function compileCapsuleImportReceipt(capsule,input={},options={}){
  const digestValid=await verifyCapsuleDigest(capsule,options),holds=[];
  if(!digestValid)holds.push('CAPSULE_DIGEST_HELD');if(input.expected_origin_root&&capsule.origin_root!==input.expected_origin_root)holds.push('STALE_ORIGIN_HOLD');if(input.expected_custody_root&&capsule.custody_root!==input.expected_custody_root)holds.push('STALE_CUSTODY_HOLD');
  const receipt={schema:CAPSULE_IMPORT_SCHEMA,schema_version:'0.1',record_id:input.record_id||`capsule-import:${capsule.case_id}:${Date.now()}`,case_id:capsule.case_id,created_at:input.created_at||nowIso(options.now),source_status:'DERIVED',capsule_reference:capsule.record_id,capsule_digest:capsule.record_digest,status:holds.length?'HELD':'IMPORT_ELIGIBLE',holds,automatic_case_merge:false,missingness:[],uncertainty:['endpoint integrity remains outside capsule verification'],claim_ceiling:'CAPSULE_IMPORT_VERIFICATION_ONLY',operator_closure:'OPEN'};
  receipt.record_digest=await digestRecord(CAPSULE_IMPORT_SCHEMA,withoutKeys(receipt,['record_digest']),options.cryptoImpl);return Object.freeze(receipt);
}

export async function compileCapsuleReturnReceipt(input,options={}){
  const receipt={schema:CAPSULE_RETURN_SCHEMA,schema_version:'0.1',record_id:input.record_id||`capsule-return:${input.case_id}:${Date.now()}`,case_id:String(input.case_id),created_at:input.created_at||nowIso(options.now),source_status:'IMPORTED',release_reference:String(input.release_reference||''),return_object_digest:String(input.return_object_digest||''),quarantine_state:'QUARANTINED',reassay_required:true,automatic_case_merge:false,missingness:uniqueStrings(input.missingness),uncertainty:uniqueStrings(input.uncertainty),claim_ceiling:'UNTRUSTED_RETURN_ONLY',operator_closure:'OPEN'};
  receipt.record_digest=await digestRecord(CAPSULE_RETURN_SCHEMA,withoutKeys(receipt,['record_digest']),options.cryptoImpl);return Object.freeze(receipt);
}

export async function compileCapsuleRecall(input,options={}){
  const receipt={schema:CAPSULE_RECALL_SCHEMA,schema_version:'0.1',record_id:input.record_id||`capsule-recall:${input.case_id}:${Date.now()}`,case_id:String(input.case_id),created_at:input.created_at||nowIso(options.now),source_status:'DERIVED',release_reference:String(input.release_reference||''),recall_scope:uniqueStrings(input.recall_scope),revocation_issued:true,external_deletion_verified:false,recipient_compliance_unknown:true,missingness:uniqueStrings(input.missingness),uncertainty:uniqueStrings(['Recall cannot erase copies outside original custody',...(input.uncertainty||[])]),claim_ceiling:'RECALL_AND_REVOCATION_NOTICE_ONLY',operator_closure:String(input.operator_closure||'OPEN')};
  receipt.record_digest=await digestRecord(CAPSULE_RECALL_SCHEMA,withoutKeys(receipt,['record_digest']),options.cryptoImpl);return Object.freeze(receipt);
}

function hashPair(left,right,cryptoImpl){return sha256Bytes(Buffer.concat([Buffer.from(left),Buffer.from(right)]),cryptoImpl);}
export async function compileOriginManifest(input,options={}){
  const cryptoImpl=options.cryptoImpl||globalThis.crypto,assets=[];
  for(const asset of [...(input.assets||[])].sort((a,b)=>String(a.path).localeCompare(String(b.path)))){const bytes=typeof asset.content==='string'?encoder.encode(asset.content):new Uint8Array(asset.bytes||[]);assets.push({path:String(asset.path),byte_length:bytes.length,digest:`sha256:${bytesToHex(await sha256Bytes(bytes,cryptoImpl))}`});}
  if(!assets.length)throw new TypeError('Origin manifest requires assets.');
  let level=await Promise.all(assets.map(asset=>sha256Bytes(encoder.encode(`${asset.path}\n${asset.digest}`),cryptoImpl)));
  while(level.length>1){const next=[];for(let i=0;i<level.length;i+=2)next.push(await hashPair(level[i],level[i+1]||level[i],cryptoImpl));level=next;}
  const manifest={schema:ORIGIN_MANIFEST_SCHEMA,schema_version:'0.2',record_id:input.record_id||`origin:${input.release_id}`,case_id:String(input.case_id||''),release_id:String(input.release_id||''),created_at:input.created_at||nowIso(options.now),source_status:'DERIVED',exact_commit:String(input.exact_commit||''),runtime_version:String(input.runtime_version||''),dependency_lock_digest:String(input.dependency_lock_digest||''),assets,merkle_root:`sha256:${bytesToHex(level[0])}`,reproducibility_posture:String(input.reproducibility_posture||'CANDIDATE'),known_exceptions:uniqueStrings(input.known_exceptions),origin_verified:false,endpoint_integrity_claimed:false,missingness:uniqueStrings(input.missingness),uncertainty:uniqueStrings(input.uncertainty),claim_ceiling:'EXACT_ASSET_ORIGIN_ONLY',operator_closure:'OPEN'};
  manifest.record_digest=await digestRecord(ORIGIN_MANIFEST_SCHEMA,withoutKeys(manifest,['record_digest']),cryptoImpl);return Object.freeze(manifest);
}

export async function signOriginManifest(manifest,privateKey,options={}){const cryptoImpl=options.cryptoImpl||globalThis.crypto;const signature=await cryptoImpl.subtle.sign({name:'ECDSA',hash:'SHA-256'},privateKey,encoder.encode(manifest.record_digest));return {algorithm:'ECDSA-P256-SHA256',manifest_digest:manifest.record_digest,signature:b64(new Uint8Array(signature))};}
export async function verifyOriginSignature(manifest,signature,publicKey,options={}){const cryptoImpl=options.cryptoImpl||globalThis.crypto;if(signature?.manifest_digest!==manifest?.record_digest)return false;return cryptoImpl.subtle.verify({name:'ECDSA',hash:'SHA-256'},publicKey,unb64(signature.signature),encoder.encode(manifest.record_digest));}
