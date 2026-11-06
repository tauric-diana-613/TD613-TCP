#!/usr/bin/env node
/** Recover a privately encrypted P0 source artifact. The RSA private key must
 * never enter GitHub or logs. All source-text exports remain out of public Git.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {assertPrivateDestination} from './wendbine-originals-intake.mjs';
import {DEFAULT_RECEIPT,loadVerifiedP0} from './wendbine-private-p0-source-query.mjs';
const DIGEST=x=>crypto.createHash('sha256').update(x).digest('hex');
const HERE=path.dirname(fileURLToPath(import.meta.url));
const AAD='wendbine-p0-sealed-archive-capture/v0.1';
export function decryptSealedP0({sealedPath,privateKeyPath}){
 const sealed=JSON.parse(fs.readFileSync(sealedPath,'utf8'));
 if(sealed.schema!==AAD||sealed.crypto!=='AES-256-GCM+RSA-OAEP-SHA256'||sealed.compression!=='gzip'||sealed.aad_utf8!==AAD)
  throw new Error('SEALED_P0_ENVELOPE_MISMATCH');
 const key=crypto.privateDecrypt({
  key:fs.readFileSync(privateKeyPath,'utf8'),oaepHash:'sha256',
  padding:crypto.constants.RSA_PKCS1_OAEP_PADDING
 },Buffer.from(sealed.sealed_key_b64,'base64'));
 if(key.length!==32)throw new Error('DECRYPTED_SESSION_KEY_WRONG_LENGTH');
 const decipher=crypto.createDecipheriv('aes-256-gcm',key,Buffer.from(sealed.iv_b64,'base64'));
 decipher.setAAD(Buffer.from(AAD,'utf8'));decipher.setAuthTag(Buffer.from(sealed.tag_b64,'base64'));
 let bytes;
 try{bytes=Buffer.concat([decipher.update(Buffer.from(sealed.ciphertext_b64,'base64')),decipher.final()]);}
 finally{key.fill(0);}
 return JSON.parse(zlib.gunzipSync(bytes).toString('utf8'));
}
export function restoreVerifiedP0({sealedPath,privateKeyPath,destination,receiptPath=DEFAULT_RECEIPT}){
 const dir=assertPrivateDestination(destination);
 if(fs.existsSync(dir))throw new Error('REFUSE_OVERWRITE_EXISTING_PRIVATE_RESTORE');
 const payload=decryptSealedP0({sealedPath,privateKeyPath});
 const receipt=JSON.parse(fs.readFileSync(receiptPath,'utf8'));
 if(receipt.schema!=='wendbine-p0-archived-source-field-receipts/v0.6'||receipt.source_count!==33||receipt.records.length!==33)
  throw new Error('P0_PUBLIC_RECEIPTS_INVALID');
 const raw=Buffer.from(payload.raw_response_base64||'','base64');
 if(raw.length!==receipt.raw_http_payload_bytes||DIGEST(raw)!==receipt.raw_http_payload_sha256||
    raw.length!==payload.raw_response_bytes||DIGEST(raw)!==payload.raw_response_sha256)
  throw new Error('ENCRYPTED_P0_RAW_BYTES_DIFFER_FROM_RECEIPT');
 if(!Array.isArray(payload.originals)||payload.originals.length!==33)throw new Error('ENCRYPTED_P0_SOURCE_CARDINALITY_MISMATCH');
 // Validate entirety before committing a single private file.
 const rawObjects=JSON.parse(raw.toString('utf8'));
 const objects=Array.isArray(rawObjects)?rawObjects:rawObjects?.data;
 if(!Array.isArray(objects)||objects.length!==33)throw new Error('RAW_PROVIDER_OBJECT_COUNT_MISMATCH');
 const byId=new Map(objects.map(x=>[String(x.id||'').replace(/^t3_/,''),x]));
 if(byId.size!==33)throw new Error('DUPLICATED_RAW_SOURCE_ID');
 const seen=new Set();
 for(const s of payload.originals){
  const r=receipt.records.find(x=>x.source_id===s.source_id);
  if(!r||seen.has(s.source_id)||s.canonical_url!==r.canonical_url)throw new Error('UNKNOWN_OR_DUPLICATED_SOURCE_ID');
  seen.add(s.source_id);
  const obj=byId.get(s.source_id.slice('reddit:t3_'.length));
  if(!obj||String(obj.author).toLowerCase()!=='upset-ratio502'||String(obj.subreddit).toLowerCase()!=='wendbine')
   throw new Error('AUTHOR_OR_SUBREDDIT_MISMATCH');
  if(s.source_title_exact!==obj.title||s.source_body_exact!==obj.selftext||s.source_title_exact!==r.reddit_title_exact)
   throw new Error('EXACT_SOURCE_FIELDS_DIVERGE_FROM_RAW');
  if(DIGEST(Buffer.from(s.source_title_exact,'utf8'))!==r.title_sha256_utf8||
     DIGEST(Buffer.from(s.source_body_exact,'utf8'))!==r.body_sha256_utf8||
     Buffer.byteLength(s.source_body_exact,'utf8')!==r.body_utf8_bytes)throw new Error('SOURCE_FIELD_RECEIPT_DIGEST_MISMATCH');
  if(Number(obj.created_utc)!==r.source_created_utc)throw new Error('SOURCE_TIMESTAMP_MISMATCH');
 }
 fs.mkdirSync(dir,{recursive:true,mode:0o700});
 const src=path.join(dir,'p0-originals-private.jsonl'),rawPath=path.join(dir,'p0-raw-provider-private.json');
 fs.writeFileSync(src,payload.originals.map(x=>JSON.stringify(x)).join('\n')+'\n',{flag:'wx',mode:0o600});
 fs.writeFileSync(rawPath,raw,{flag:'wx',mode:0o600});
 // Audit the files read back from disk before announcing restore success.
 const audited=loadVerifiedP0({privateJsonl:src,rawResponse:rawPath,receiptPath});
 const summary={schema:'wendbine-p0-private-restore-receipt/v0.1',state:'ARCHIVED_SOURCE_FIELDS_PRIVATE_HASH_VERIFIED',
  source_count:audited.length,raw_response_sha256:DIGEST(raw),source_version_ceiling:'ARCHIVE_COPY_NOT_UNEDITED_FIRST_PUBLICATION_OR_LIVE_REDDIT',
  private_files:['p0-originals-private.jsonl','p0-raw-provider-private.json']};
 fs.writeFileSync(path.join(dir,'restore-receipt.json'),JSON.stringify(summary,null,2)+'\n',{flag:'wx',mode:0o600});
 return summary;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [sealedPath,privateKeyPath,destination]=process.argv.slice(2);
 if(!sealedPath||!privateKeyPath||!destination)
  throw new Error('Usage: node wendbine-private-p0-restore.mjs <p0-archive.sealed.json> <PRIVATE_RSA_KEY> <PRIVATE_DIR_OUTSIDE_REPO>');
 const restored=restoreVerifiedP0({sealedPath,privateKeyPath,destination});
 process.stdout.write(JSON.stringify(restored)+'\n');
}
