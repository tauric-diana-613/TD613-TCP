import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import crypto from 'node:crypto';
import {loadFoundationalTargets} from '../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-reddit-oauth-rescue.mjs';
import {sealArchivePayload} from '../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-ci-sealed-rescue.mjs';
import {restoreVerifiedP0,decryptSealedP0} from '../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-private-p0-restore.mjs';
import {loadVerifiedP0,exactSearch} from '../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-private-p0-source-query.mjs';
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const roster=loadFoundationalTargets(),posts=roster.map((t,i)=>({id:t.source_id.slice('reddit:t3_'.length),author:'Upset-Ratio502',subreddit:'Wendbine',
 title:i===20?'Wensbine':'Wendbine',selftext:'Synthetic exact text '+i+' ∴\r\n  source-safe  ⟐',
 created_utc:Date.parse(t.publication_day_as_catalogued+'T12:00:00Z')/1000}));
const raw=Buffer.from(JSON.stringify({data:posts}));
const originals=roster.map((t,i)=>({source_id:t.source_id,canonical_url:t.canonical_url,
 source_title_exact:posts[i].title,source_body_exact:posts[i].selftext,source_created_utc:posts[i].created_utc,
 body_sha256_utf8:digest(Buffer.from(posts[i].selftext,'utf8'))}));
const manifest={schema:'wendbine-p0-archived-source-field-receipts/v0.6',source_count:33,raw_http_payload_sha256:digest(raw),
 raw_http_payload_bytes:raw.length,records:roster.map((t,i)=>({source_id:t.source_id,canonical_url:t.canonical_url,
 reddit_title_exact:posts[i].title,title_sha256_utf8:digest(Buffer.from(posts[i].title,'utf8')),
 body_sha256_utf8:digest(Buffer.from(posts[i].selftext,'utf8')),body_utf8_bytes:Buffer.byteLength(posts[i].selftext,'utf8'),
 source_created_utc:posts[i].created_utc}))};
const {publicKey,privateKey}=crypto.generateKeyPairSync('rsa',{modulusLength:2048});
const sealed=sealArchivePayload({schema:'wendbine-p0-private-raw-and-fields/v0.1',
 raw_response_base64:raw.toString('base64'),raw_response_sha256:digest(raw),raw_response_bytes:raw.length,
 originals},publicKey.export({format:'pem',type:'spki'}));
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'wendbine-private-restore-'));
try{
 const sealedFile=path.join(tmp,'sealed.json'),priv=path.join(tmp,'private.pem'),receipt=path.join(tmp,'receipt.json'),out=path.join(tmp,'verified-source');
 fs.writeFileSync(sealedFile,JSON.stringify(sealed));fs.writeFileSync(priv,privateKey.export({format:'pem',type:'pkcs8'}));
 fs.writeFileSync(receipt,JSON.stringify(manifest));
 assert.equal(decryptSealedP0({sealedPath:sealedFile,privateKeyPath:priv}).originals.length,33);
 const r=restoreVerifiedP0({sealedPath:sealedFile,privateKeyPath:priv,destination:out,receiptPath:receipt});
 assert.equal(r.source_count,33);
 const rows=loadVerifiedP0({privateJsonl:path.join(out,'p0-originals-private.jsonl'),
  rawResponse:path.join(out,'p0-raw-provider-private.json'),receiptPath:receipt});
 assert.equal(rows.length,33);
 assert.equal(exactSearch(rows,'source-safe').length,33);
 assert.equal(fs.statSync(path.join(out,'p0-originals-private.jsonl')).mode&0o777,0o600);
 assert.throws(()=>restoreVerifiedP0({sealedPath:sealedFile,privateKeyPath:priv,destination:out,receiptPath:receipt}),
  /REFUSE_OVERWRITE/);
 const altered=JSON.parse(fs.readFileSync(sealedFile,'utf8'));altered.ciphertext_b64=Buffer.from('altered').toString('base64');
 fs.writeFileSync(sealedFile,JSON.stringify(altered));
 assert.throws(()=>decryptSealedP0({sealedPath:sealedFile,privateKeyPath:priv}));
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
console.log('Wendbine encrypted real-source handoff restore, 33 hash checks, exact private query, and tamper refusal passed.');
