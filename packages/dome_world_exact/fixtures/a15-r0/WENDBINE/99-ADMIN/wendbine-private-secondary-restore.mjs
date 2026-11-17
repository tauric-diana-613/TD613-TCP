#!/usr/bin/env node
/** Decrypt and independently revalidate private archive copies of the P1/P2 27-ID cohort. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {assertPrivateDestination} from './wendbine-originals-intake.mjs';
import {secondaryTargets,judgeSecondary,SCHEMA} from './wendbine-ci-secondary-sealed-rescue.mjs';
import {PROVIDERS,parseArchiveEnvelope} from './wendbine-archive-provider-probe.mjs';
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');

export function decryptSecondary({sealedPath,privateKeyPath}){
 const sealed=JSON.parse(fs.readFileSync(sealedPath,'utf8'));
 if(sealed.schema!==SCHEMA||sealed.crypto!=='AES-256-GCM+RSA-OAEP-SHA256'||sealed.compression!=='gzip')
  throw new Error('UNEXPECTED_SECONDARY_ENVELOPE');
 const key=crypto.privateDecrypt({key:fs.readFileSync(privateKeyPath),padding:crypto.constants.RSA_PKCS1_OAEP_PADDING,oaepHash:'sha256'},
  Buffer.from(sealed.sealed_key_b64,'base64'));
 if(key.length!==32)throw new Error('BAD_SESSION_KEY_LENGTH');
 const dec=crypto.createDecipheriv('aes-256-gcm',key,Buffer.from(sealed.iv_b64,'base64'));
 dec.setAAD(Buffer.from(SCHEMA,'utf8'));dec.setAuthTag(Buffer.from(sealed.tag_b64,'base64'));
 let payload;
 try{payload=Buffer.concat([dec.update(Buffer.from(sealed.ciphertext_b64,'base64')),dec.final()]);}
 finally{key.fill(0);}
 return JSON.parse(zlib.gunzipSync(payload).toString('utf8'));
}
export function validateSecondaryPayload(payload,targets=secondaryTargets()){
 if(payload.schema!=='wendbine-p1p2-private-raw-and-fields/v0.1'||payload.target_count!==27||
  payload.records?.length!==27||!Array.isArray(payload.batches))throw new Error('SECONDARY_PAYLOAD_SHAPE_MISMATCH');
 const expected=new Map(targets.map(x=>[x.source_id,x]));
 const batches=new Map();
 for(const batch of payload.batches){
  const provider=PROVIDERS.find(p=>p.name===batch.provider);
  if(!provider||batches.has(provider.name))throw new Error('UNKNOWN_OR_DUPLICATE_ARCHIVE_PROVIDER');
  const raw=Buffer.from(batch.raw_b64,'base64');
  if(raw.length!==batch.raw_bytes||sha(raw)!==batch.raw_sha256)throw new Error('SECONDARY_RAW_HASH_MISMATCH');
  const objects=parseArchiveEnvelope(raw,provider);
  batches.set(provider.name,{raw,objects});
 }
 const seen=new Set(),verified=[];
 for(const r of payload.records){
  const target=expected.get(r.source_id);
  if(!target||seen.has(r.source_id)||target.canonical_url!==r.canonical_url)throw new Error('SECONDARY_SOURCE_ID_OR_URL_MISMATCH');
  seen.add(r.source_id);
  if(!Array.isArray(r.copies))throw new Error('SECONDARY_COPIES_ABSENT');
  for(const c of r.copies){
   const b=batches.get(c.provider);
   if(!b||!Number.isInteger(c.raw_object_index))throw new Error('SECONDARY_UNBOUND_ARCHIVE_COPY');
   const obj=b.objects[c.raw_object_index],v=judgeSecondary(obj,target);
   if(v.state!=='MATCHED_SOURCE_OBJECT'||c.source_title_exact!==obj.title||
     c.source_body_exact!==obj.selftext||c.title_sha256_utf8!==v.title_sha256_utf8||
     c.body_sha256_utf8!==v.body_sha256_utf8||c.body_state!==v.bodyState||
     c.title_utf8_bytes!==v.title_utf8_bytes||c.body_utf8_bytes!==v.body_utf8_bytes)
     throw new Error('SECONDARY_SOURCE_FIELDS_DIVERGE_FROM_RAW');
   verified.push({source_id:r.source_id,canonical_url:r.canonical_url,source_group:r.source_group,
    source_title_exact:obj.title,source_body_exact:obj.selftext,
    title_sha256_utf8:v.title_sha256_utf8,body_sha256_utf8:v.body_sha256_utf8,
    source_created_utc:obj.created_utc,source_edited:obj.edited??null,
    archive_retrieved_on:obj.retrieved_on??null,archive_provider:c.provider,
    body_state:c.body_state,media_or_link_post:c.media_or_link_post,
    original_text_state:'PRIVATE_ARCHIVE_COPY_RAW_AND_FIELDS_VERIFIED_FIRST_PUBLICATION_UNBOUND'});
  }
 }
 if(seen.size!==27||new Set(verified.map(x=>x.source_id)).size!==payload.source_count)
  throw new Error('SECONDARY_COVERAGE_NOT_RECONCILED');
 return {target_count:27,source_count:payload.source_count,verified_versions:verified.length,
  full_text_bodies:verified.filter(x=>x.body_state==='ARCHIVED_TEXT_BODY_PRESENT').length,
  media_empty_bodies:verified.filter(x=>x.body_state==='VERIFIED_EMPTY_BODY_MEDIA_OR_LINK_POST').length,
  held_body_fields:verified.filter(x=>!['ARCHIVED_TEXT_BODY_PRESENT','VERIFIED_EMPTY_BODY_MEDIA_OR_LINK_POST'].includes(x.body_state)).length,
  records:verified,batches};
}
export function restoreSecondary({sealedPath,privateKeyPath,destination}){
 const dir=assertPrivateDestination(destination);
 if(fs.existsSync(dir))throw new Error('REFUSE_OVERWRITE_EXISTING_SECONDARY_RESTORE');
 const audited=validateSecondaryPayload(decryptSecondary({sealedPath,privateKeyPath}));
 fs.mkdirSync(dir,{recursive:true,mode:0o700});
 const saved=[];
 for(const [provider,batch] of audited.batches){
  const name='raw-'+provider.toLowerCase()+'.json';
  fs.writeFileSync(path.join(dir,name),batch.raw,{flag:'wx',mode:0o600});
  saved.push({provider,name,sha256:sha(batch.raw),bytes:batch.raw.length});
 }
 fs.writeFileSync(path.join(dir,'p1p2-private-source-fields.jsonl'),
  audited.records.map(x=>JSON.stringify(x)).join('\n')+'\n',{flag:'wx',mode:0o600});
 const r={schema:'wendbine-p1p2-private-source-restore/v0.1',
  state:'ARCHIVED_SOURCE_FIELDS_PRIVATE_RAW_AND_HASH_VERIFIED',
  target_count:27,distinct_source_ids:audited.source_count,verified_versions:audited.verified_versions,
  full_text_bodies:audited.full_text_bodies,media_empty_bodies:audited.media_empty_bodies,
  held_body_fields:audited.held_body_fields,raw_batches:saved,
  source_versions:'ARCHIVE_COPIES_NOT_PROVEN_FIRST_PUBLICATION_OR_LIVE_REDDIT'};
 fs.writeFileSync(path.join(dir,'restore-receipt.json'),JSON.stringify(r,null,2)+'\n',{flag:'wx',mode:0o600});
 return r;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [sealedPath,privateKeyPath,destination]=process.argv.slice(2);
 if(!sealedPath||!privateKeyPath||!destination)throw new Error('Usage: node wendbine-private-secondary-restore.mjs <sealed.json> <private.pem> <out-of-repo-directory>');
 process.stdout.write(JSON.stringify(restoreSecondary({sealedPath,privateKeyPath,destination}))+'\n');
}
