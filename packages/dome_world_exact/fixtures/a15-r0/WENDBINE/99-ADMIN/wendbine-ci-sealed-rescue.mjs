#!/usr/bin/env node
/**
 * Run ONLY on the authorized research PR's GitHub runner. Retrieve the
 * 33 immutable public P0 posts, validate the full returned source fields,
 * then upload only hybrid-encrypted bytes for private source custody.
 * The RSA private key is generated/stored outside GitHub and never logged.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import {loadFoundationalTargets} from './wendbine-reddit-oauth-rescue.mjs';
import {PROVIDERS,providerUrl,parseArchiveEnvelope,assessArchiveObject} from './wendbine-archive-provider-probe.mjs';

const HERE=path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_PUBLIC_KEY=path.join(HERE,'20260922-one-time-rescue-public-key.pem');
const digest=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const envelopeSchema='wendbine-p0-sealed-archive-capture/v0.1';
const AAD=Buffer.from(envelopeSchema,'utf8');
export const canonicalSourceCount=33;

export function verifyArchiveBatch(bytes,provider,targets=loadFoundationalTargets()){
 const objects=parseArchiveEnvelope(bytes,provider);
 if(targets.length!==canonicalSourceCount||new Set(targets.map(x=>x.source_id)).size!==targets.length)
  throw new Error('FOUNDATIONAL_ROSTER_MISMATCH');
 const accepted=[];
 for(const target of targets){
  const id=target.source_id.slice('reddit:t3_'.length);
  const matches=objects.filter(x=>String(x?.id||'').replace(/^t3_/,'')===id);
  if(matches.length!==1)throw new Error('MISSING_OR_AMBIGUOUS_SOURCE_'+id);
  const obj=matches[0],assessment=assessArchiveObject(obj,target,provider);
  if(assessment.state!=='ARCHIVED_TEXT_FIELDS_FOUND_LIVE_STATE_UNVERIFIED')
   throw new Error('SOURCE_VALIDATION_FAILED_'+id+'_'+assessment.state);
  accepted.push({source_id:target.source_id,canonical_url:target.canonical_url,
   author:obj.author,subreddit:obj.subreddit,source_title_exact:obj.title,
   source_body_exact:obj.selftext,archive_provider:provider.name,
   archive_retrieved_on:obj.retrieved_on??null,source_created_utc:obj.created_utc,
   source_edited:obj.edited??null,title_sha256_utf8:assessment.title_sha256_utf8,
   body_sha256_utf8:assessment.selftext_sha256_utf8,source_snapshot_version:'ARCHIVE_COPY_NOT_UNEDITED_FIRST_PUBLICATION'});
 }
 return accepted;
}
export function sealArchivePayload(plaintext,publicPem){
 const key=crypto.randomBytes(32),iv=crypto.randomBytes(12);
 const cipher=crypto.createCipheriv('aes-256-gcm',key,iv);cipher.setAAD(AAD);
 const packed=zlib.gzipSync(Buffer.from(JSON.stringify(plaintext),'utf8'));
 const ciphertext=Buffer.concat([cipher.update(packed),cipher.final()]);
 const sealedKey=crypto.publicEncrypt({key:publicPem,oaepHash:'sha256',padding:crypto.constants.RSA_PKCS1_OAEP_PADDING},key);
 key.fill(0);
 return {schema:envelopeSchema,crypto:'AES-256-GCM+RSA-OAEP-SHA256',compression:'gzip',
  public_key_sha256:digest(Buffer.from(publicPem,'utf8')),aad_utf8:AAD.toString('utf8'),
  iv_b64:iv.toString('base64'),tag_b64:cipher.getAuthTag().toString('base64'),
  sealed_key_b64:sealedKey.toString('base64'),ciphertext_b64:ciphertext.toString('base64'),
  unencrypted_body_exposed:false};
}
export async function captureAndSeal({fetchImpl=fetch,targets=loadFoundationalTargets(),publicPem,outputPath,
 providers=PROVIDERS}={}){
 if(!publicPem||!outputPath)throw new Error('PUBLIC_KEY_AND_OUTPUT_REQUIRED');
 if(!Array.isArray(targets)||targets.length!==canonicalSourceCount)throw new Error('P0_33_REQUIRED');
 const diagnostics=[];let winner=null;
 for(const provider of providers){
  let status=null;
  try{
   const response=await fetchImpl(providerUrl(provider,targets),{
    method:'GET',headers:{Accept:'application/json','User-Agent':'TD613-Wendbine-P0-Public-Archive-Research/0.1'},
    redirect:'error',signal:AbortSignal.timeout(16000)});
   status=response?.status??null;
   if(!response?.ok)throw new Error('HTTP_'+status);
   const raw=Buffer.from(await response.arrayBuffer());
   if(raw.length>8*1024*1024)throw new Error('SOURCE_RESPONSE_TOO_LARGE');
   const originals=verifyArchiveBatch(raw,provider,targets);
   winner={provider:provider.name,raw,originals,source_url:providerUrl(provider,targets)};
   diagnostics.push({provider:provider.name,state:'ALL_33_SOURCE_FIELDS_MATCHED',status});
   break;
  }catch(e){diagnostics.push({provider:provider.name,state:'NOT_ADMITTED',status,reason:String(e?.message||e).slice(0,140)});}
 }
 if(!winner)return {complete:false,source_count:0,providers:diagnostics,encrypted_output:false};
 const payload={schema:'wendbine-p0-private-raw-and-fields/v0.1',provider:winner.provider,
  source_endpoint:winner.source_url,acquired_at:new Date().toISOString(),
  raw_response_sha256:digest(winner.raw),raw_response_bytes:winner.raw.length,
  raw_response_base64:winner.raw.toString('base64'),
  originals:winner.originals,
  limits:['ARCHIVE_TEXT_FIELDS_NOT_CURRENT_LIVE_STATE','ARCHIVE_VERSION_NOT_UNEDITED_FIRST_PUBLICATION',
   'THIRD_PARTY_TEXT_PRIVATE_RESEARCH_ONLY_NO_PUBLIC_GITHUB_BODIES']};
 const sealed=sealArchivePayload(payload,publicPem);
 fs.mkdirSync(path.dirname(outputPath),{recursive:true,mode:0o700});
 fs.writeFileSync(outputPath,JSON.stringify(sealed)+'\n',{flag:'wx',mode:0o600});
 return {complete:true,source_count:winner.originals.length,providers:diagnostics,encrypted_output:true,
  public_key_sha256:sealed.public_key_sha256,raw_response_sha256:payload.raw_response_sha256,
  raw_response_bytes:payload.raw_response_bytes,encrypted_bytes:fs.statSync(outputPath).size};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const out=process.argv[2];
 if(!out)throw new Error('Usage: node wendbine-ci-sealed-rescue.mjs <encrypted-output-path>');
 const publicPem=fs.readFileSync(DEFAULT_PUBLIC_KEY,'utf8');
 const result=await captureAndSeal({publicPem,outputPath:out});
 // No source titles or bodies in stdout. An absent provider remains an honest hold.
 process.stdout.write(JSON.stringify(result)+'\n');
 if(!result.complete)process.exitCode=1;
}
