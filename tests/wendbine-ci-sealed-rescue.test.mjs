import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import {loadFoundationalTargets} from '../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-reddit-oauth-rescue.mjs';
import {PROVIDERS} from '../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-archive-provider-probe.mjs';
import {captureAndSeal,verifyArchiveBatch,sealArchivePayload} from '../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-ci-sealed-rescue.mjs';
const targets=loadFoundationalTargets();assert.equal(targets.length,33);
const posts=targets.map((t,i)=>({id:t.source_id.slice('reddit:t3_'.length),author:'Upset-Ratio502',subreddit:'Wendbine',
title:'Synthetic title '+i+' 𝌋',selftext:'Synthetic ∴ body '+i+'\r\n  trailing  ⟐',
created_utc:Date.parse(t.publication_day_as_catalogued+'T12:00:00Z')/1000,retrieved_on:Date.now()/1000}));
const bytes=Buffer.from(JSON.stringify(posts));
const originals=verifyArchiveBatch(bytes,PROVIDERS[0],targets);
assert.equal(originals.length,33);
assert.equal(originals[0].source_body_exact,posts[0].selftext);
assert.throws(()=>verifyArchiveBatch(Buffer.from(JSON.stringify(posts.slice(1))),PROVIDERS[0],targets),/MISSING_OR_AMBIGUOUS_SOURCE/);
assert.throws(()=>verifyArchiveBatch(Buffer.from(JSON.stringify([{...posts[0],author:'Other'},...posts.slice(1)])),PROVIDERS[0],targets),/SOURCE_VALIDATION_FAILED/);
const {publicKey,privateKey}=crypto.generateKeyPairSync('rsa',{modulusLength:2048});
const pub=publicKey.export({type:'spki',format:'pem'});
const sealed=sealArchivePayload({secret:'Exact source ∴ body'},pub);
assert.ok(!JSON.stringify(sealed).includes('Exact source'));
const unwrap=s=>{
 const key=crypto.privateDecrypt({key:privateKey,oaepHash:'sha256',padding:crypto.constants.RSA_PKCS1_OAEP_PADDING},Buffer.from(s.sealed_key_b64,'base64'));
 const d=crypto.createDecipheriv('aes-256-gcm',key,Buffer.from(s.iv_b64,'base64'));
 d.setAAD(Buffer.from(s.aad_utf8));d.setAuthTag(Buffer.from(s.tag_b64,'base64'));
 return JSON.parse(zlib.gunzipSync(Buffer.concat([d.update(Buffer.from(s.ciphertext_b64,'base64')),d.final()])));
};
assert.equal(unwrap(sealed).secret,'Exact source ∴ body');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'wendbine-ci-sealed-'));
try{
 const out=path.join(tmp,'locked.json');
 const result=await captureAndSeal({publicPem:pub,outputPath:out,targets,
  fetchImpl:async url=>({ok:true,status:200,arrayBuffer:async()=>bytes})});
 assert.equal(result.complete,true);
 assert.equal(result.source_count,33);
 assert.equal(result.public_receipts.length,33);
 assert.equal(result.public_receipts[0].body_sha256_utf8,originals[0].body_sha256_utf8);
 assert.ok(!JSON.stringify(result.public_receipts).includes(posts[0].selftext),'Public receipts must never include full bodies.');

 const obj=unwrap(JSON.parse(fs.readFileSync(out,'utf8')));
 assert.equal(obj.originals.length,33);
 assert.equal(obj.originals[0].source_title_exact,posts[0].title);
 assert.equal(obj.originals[0].source_body_exact,posts[0].selftext);
 assert.ok(Buffer.from(obj.raw_response_base64,'base64').equals(bytes));
 const tampered=JSON.parse(fs.readFileSync(out,'utf8'));
 tampered.ciphertext_b64=Buffer.from('modified').toString('base64');
 assert.throws(()=>unwrap(tampered));
 const missing=await captureAndSeal({publicPem:pub,outputPath:path.join(tmp,'missing.json'),targets,fetchImpl:async()=>({ok:false,status:403})});
 assert.equal(missing.complete,false);
 assert.equal(missing.source_count,0);
 assert.ok(!fs.existsSync(path.join(tmp,'missing.json')));
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
console.log('Wendbine 33-post source validation, private hybrid encryption, raw payload roundtrip and tamper refusal passed.');
