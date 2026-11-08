#!/usr/bin/env node
/**
 * P1/P2 research salvage, using the 2 Sept 13 + 25 individually indexed cards.
 * Retrieve original source objects by ID and seal the raw JSON and matched fields
 * with the one-time public RSA key. Plaintext never leaves the runner via logs or Git.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {PROVIDERS,providerUrl,parseArchiveEnvelope} from './wendbine-archive-provider-probe.mjs';

const HERE=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(HERE,'..');
const PUB=path.join(HERE,'20260922-one-time-rescue-public-key.pem');
export const SCHEMA='wendbine-p1p2-sealed-archive-capture/v0.1';
const sha256=x=>crypto.createHash('sha256').update(x).digest('hex');
const entries=s=>fs.readFileSync(path.join(ROOT,'01-MANIFESTS',s),'utf8').trim().split('\n').map(JSON.parse);
export function secondaryTargets(){
 const a=entries('public-reddit-delta-20260913-source-registry-v02.jsonl');
 const b=entries('public-reddit-account-card-source-registry-20260922-v05.jsonl');
 if(a.length!==2||b.length!==25)throw new Error('P1P2_SOURCE_COUNTS_CHANGED');
 const p0=new Set(entries('public-reddit-48h-source-registry-v01.jsonl').map(x=>x.source_id));
 const rows=[...a,...b].map((x,i)=>({source_id:x.source_id,canonical_url:x.canonical_url,
  source_group:i<2?'P1_SEPT13':'P2_LATER_CARD',
  observed_catalogue_day:x.public_date??null,
  previously_media_card:x.media_card===true}));
 if(rows.length!==27||new Set(rows.map(x=>x.source_id)).size!==27||
  rows.some(x=>p0.has(x.source_id)))throw new Error('P1P2_ID_COLLISION');
 for(const x of rows){
  const id=x.source_id.slice('reddit:t3_'.length);
  if(!/^reddit:t3_[a-z0-9]+$/.test(x.source_id)||!new URL(x.canonical_url).pathname.includes('/comments/'+id+'/'))
   throw new Error('P1P2_INVALID_URL_OR_ID');
 }
 return rows;
}
export function judgeSecondary(obj,target){
 const id=target.source_id.slice('reddit:t3_'.length);
 if(!obj||String(obj.id||'').replace(/^t3_/,'')!==id)return {state:'SOURCE_ID_MISMATCH'};
 if(String(obj.author||'').toLowerCase()!=='upset-ratio502')return {state:'AUTHOR_MISMATCH'};
 if(String(obj.subreddit||'').toLowerCase()!=='wendbine')return {state:'SUBREDDIT_MISMATCH'};
 if(typeof obj.title!=='string'||typeof obj.selftext!=='string')return {state:'SOURCE_FIELDS_MISSING'};
 const t=Number(obj.created_utc);
 if(!Number.isFinite(t)||t<=0)return {state:'TIMESTAMP_MISSING'};
 const day=new Date(t*1000).toISOString().slice(0,10);
 if(target.observed_catalogue_day&&day!==target.observed_catalogue_day)return {state:'PUBLICATION_DAY_CONFLICT'};
 const absent=obj.removed_by_category!=null||['[removed]','[deleted]'].includes(obj.selftext.trim());
 const media=target.previously_media_card||obj.is_video===true||obj.post_hint?.includes('video')||obj.is_self===false;
 const bodyState=absent?'SOURCE_BODY_REMOVED_OR_DELETED':!obj.selftext.length?(media?'VERIFIED_EMPTY_BODY_MEDIA_OR_LINK_POST':'EMPTY_TEXT_POST_BODY_UNVERIFIED'):'ARCHIVED_TEXT_BODY_PRESENT';
 return {state:'MATCHED_SOURCE_OBJECT',bodyState,source_day:day,media,
  title_sha256_utf8:sha256(Buffer.from(obj.title,'utf8')),title_utf8_bytes:Buffer.byteLength(obj.title,'utf8'),
  body_sha256_utf8:sha256(Buffer.from(obj.selftext,'utf8')),body_utf8_bytes:Buffer.byteLength(obj.selftext,'utf8')};
}
function seal(value,publicPem){
 const key=crypto.randomBytes(32),iv=crypto.randomBytes(12);
 const cipher=crypto.createCipheriv('aes-256-gcm',key,iv);cipher.setAAD(Buffer.from(SCHEMA,'utf8'));
 const compressed=zlib.gzipSync(Buffer.from(JSON.stringify(value),'utf8'));
 const ciphertext=Buffer.concat([cipher.update(compressed),cipher.final()]);
 const wrapped=crypto.publicEncrypt({key:publicPem,padding:crypto.constants.RSA_PKCS1_OAEP_PADDING,oaepHash:'sha256'},key);
 key.fill(0);
 return {schema:SCHEMA,crypto:'AES-256-GCM+RSA-OAEP-SHA256',compression:'gzip',
  public_key_sha256:sha256(Buffer.from(publicPem,'utf8')),
  iv_b64:iv.toString('base64'),tag_b64:cipher.getAuthTag().toString('base64'),
  sealed_key_b64:wrapped.toString('base64'),ciphertext_b64:ciphertext.toString('base64')};
}
export async function captureSecondary({targets=secondaryTargets(),fetchImpl=fetch,publicPem,outputPath,
 providers=PROVIDERS}={}){
 if(!publicPem||!outputPath||targets.length!==27)throw new Error('P1P2_KEY_OUTPUT_OR_ROSTER_MISMATCH');
 const diagnostics=[],batches=[],admitted=new Map();
 for(const provider of providers){
  let status=null;
  try{
   const response=await fetchImpl(providerUrl(provider,targets),{method:'GET',
    headers:{Accept:'application/json','User-Agent':'TD613-Wendbine-P1P2-Research/0.1'},
    redirect:'error',signal:AbortSignal.timeout(18000)});
   status=response?.status??null;
   if(!response?.ok)throw new Error('HTTP_'+status);
   const raw=Buffer.from(await response.arrayBuffer());
   if(raw.length>8*1024*1024)throw new Error('RESPONSE_TOO_LARGE');
   const objects=parseArchiveEnvelope(raw,provider);
   let matched=0;
   for(const target of targets){
    const id=target.source_id.slice('reddit:t3_'.length);
    const candidates=objects.map((x,i)=>({obj:x,index:i}))
      .filter(x=>String(x.obj?.id||'').replace(/^t3_/,'')===id);
    // Competing versions remain present in the raw private batch; do not auto-select.
    if(candidates.length!==1)continue;
    const {obj,index}=candidates[0],verdict=judgeSecondary(obj,target);
    if(verdict.state!=='MATCHED_SOURCE_OBJECT')continue;
    const existing=admitted.get(target.source_id)||[];
    existing.push({source_id:target.source_id,canonical_url:target.canonical_url,
     source_group:target.source_group,provider:provider.name,raw_object_index:index,
     source_title_exact:obj.title,source_body_exact:obj.selftext,
     source_created_utc:obj.created_utc,source_edited:obj.edited??null,
     archive_retrieved_on:obj.retrieved_on??null,post_hint:obj.post_hint??null,
     body_state:verdict.bodyState,media_or_link_post:verdict.media,
     title_sha256_utf8:verdict.title_sha256_utf8,body_sha256_utf8:verdict.body_sha256_utf8,
     title_utf8_bytes:verdict.title_utf8_bytes,body_utf8_bytes:verdict.body_utf8_bytes});
    admitted.set(target.source_id,existing);matched++;
   }
   batches.push({provider:provider.name,raw_sha256:sha256(raw),raw_bytes:raw.length,raw_b64:raw.toString('base64')});
   diagnostics.push({provider:provider.name,state:'RESPONSE_PARSED',http_status:status,objects:objects.length,matched});
   if(admitted.size===targets.length)break;
  }catch(e){diagnostics.push({provider:provider.name,state:'NOT_AVAILABLE_OR_UNRECOGNIZED',http_status:status,
    reason:String(e?.message||e).slice(0,120)});}
 }
 const records=targets.map(t=>({source_id:t.source_id,canonical_url:t.canonical_url,
  source_group:t.source_group,observed_catalogue_day:t.observed_catalogue_day,
  previously_media_card:t.previously_media_card,copies:admitted.get(t.source_id)||[]}));
 const count=records.filter(r=>r.copies.length>0).length;
 if(!count)return {complete:false,matched:0,targets:27,diagnostics,encrypted:false};
 const payload={schema:'wendbine-p1p2-private-raw-and-fields/v0.1',acquired_at:new Date().toISOString(),
  source_count:count,target_count:27,targets,records,batches,
  claim_ceiling:['ARCHIVED_SOURCE_COPY_NOT_FIRST_PUBLICATION_OR_LIVE_STATE',
   'EMPTY_SELF_TEXT_OF_MEDIA_POST_NOT_MEDIA_CONTENT',
   'THIRD_PARTY_TEXT_RETAINED_PRIVATE_RESEARCH_ONLY']};
 const sealed=seal(payload,publicPem);
 fs.mkdirSync(path.dirname(outputPath),{recursive:true,mode:0o700});
 fs.writeFileSync(outputPath,JSON.stringify(sealed)+'\n',{flag:'wx',mode:0o600});
 return {complete:count===27,matched:count,targets:27,diagnostics,encrypted:true,
  public_key_sha256:sealed.public_key_sha256,encrypted_bytes:fs.statSync(outputPath).size,
  public_receipts:records.map(r=>({source_id:r.source_id,canonical_url:r.canonical_url,
   source_group:r.source_group,previously_media_card:r.previously_media_card,
   state:r.copies.length?'ARCHIVE_SOURCE_FIELDS_FOUND':'NO_SOURCE_FIELDS_MATCHED',
   copies:r.copies.map(c=>({provider:c.provider,raw_object_index:c.raw_object_index,
    source_created_utc:c.source_created_utc,source_edited:c.source_edited,
    archive_retrieved_on:c.archive_retrieved_on,body_state:c.body_state,
    media_or_link_post:c.media_or_link_post,title_sha256_utf8:c.title_sha256_utf8,
    body_sha256_utf8:c.body_sha256_utf8,title_utf8_bytes:c.title_utf8_bytes,body_utf8_bytes:c.body_utf8_bytes}))}))};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const out=process.argv[2];if(!out)throw new Error('Usage: node wendbine-ci-secondary-sealed-rescue.mjs <encrypted-output>');
 const r=await captureSecondary({publicPem:fs.readFileSync(PUB,'utf8'),outputPath:out});
 // No third-party source body or title in public job logs.
 process.stdout.write(JSON.stringify(r)+'\n');
 if(!r.complete)process.exitCode=1;
}
