import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {secondaryTargets,judgeSecondary,captureSecondary,SCHEMA} from '../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-ci-secondary-sealed-rescue.mjs';
const targets=secondaryTargets();
assert.equal(targets.length,27);
assert.equal(new Set(targets.map(x=>x.source_id)).size,27);
assert.equal(targets.filter(x=>x.source_group==='P1_SEPT13').length,2);
assert.equal(targets.filter(x=>x.previously_media_card).length,2);
const objFor=(t,i)=>({id:t.source_id.slice('reddit:t3_'.length),author:'Upset-Ratio502',
 subreddit:'Wendbine',created_utc:t.observed_catalogue_day?
 Date.parse(t.observed_catalogue_day+'T12:00:00Z')/1000:1789500000+i*100,
 title:'Synthetic '+i,selftext:t.previously_media_card?'':'Synthetic body ∴ '+i,
 is_self:!t.previously_media_card,edited:false});
const objects=targets.map(objFor);
assert.equal(judgeSecondary(objects[0],targets[0]).state,'MATCHED_SOURCE_OBJECT');
assert.equal(judgeSecondary(objects[0],targets[0]).bodyState,'ARCHIVED_TEXT_BODY_PRESENT');
const mediaIdx=targets.findIndex(t=>t.previously_media_card);
assert.equal(judgeSecondary(objects[mediaIdx],targets[mediaIdx]).bodyState,'VERIFIED_EMPTY_BODY_MEDIA_OR_LINK_POST');
assert.equal(judgeSecondary({...objects[0],author:'other'},targets[0]).state,'AUTHOR_MISMATCH');
assert.equal(judgeSecondary({...objects[0],selftext:'[deleted]'},targets[0]).bodyState,'SOURCE_BODY_REMOVED_OR_DELETED');
const bad={...objects[0],created_utc:Date.parse('2020-01-01')/1000};
assert.equal(judgeSecondary(bad,targets[0]).state,'PUBLICATION_DAY_CONFLICT');
const {privateKey,publicKey}=crypto.generateKeyPairSync('rsa',{modulusLength:2048,
 publicKeyEncoding:{type:'spki',format:'pem'},privateKeyEncoding:{type:'pkcs8',format:'pem'}});
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'wendbine-p1p2-test-'));
try{
 const outfile=path.join(tmp,'p1p2.sealed.json');
 const raw=Buffer.from(JSON.stringify({data:objects}));
 const response=async url=>({status:200,ok:true,arrayBuffer:async()=>raw});
 const r=await captureSecondary({fetchImpl:response,targets,publicPem:publicKey,outputPath:outfile});
 assert.equal(r.complete,true);
 assert.equal(r.matched,27);
 assert.equal(r.public_receipts.filter(x=>x.copies[0]?.body_state==='VERIFIED_EMPTY_BODY_MEDIA_OR_LINK_POST').length,2);
 assert.ok(!JSON.stringify(r).includes('Synthetic body'));
 const sealed=JSON.parse(fs.readFileSync(outfile,'utf8'));
 assert.equal(sealed.schema,SCHEMA);
 const key=crypto.privateDecrypt({key:privateKey,padding:crypto.constants.RSA_PKCS1_OAEP_PADDING,oaepHash:'sha256'},Buffer.from(sealed.sealed_key_b64,'base64'));
 const decipher=crypto.createDecipheriv('aes-256-gcm',key,Buffer.from(sealed.iv_b64,'base64'));
 decipher.setAAD(Buffer.from(SCHEMA));decipher.setAuthTag(Buffer.from(sealed.tag_b64,'base64'));
 const zlib=await import('node:zlib');
 const decoded=JSON.parse(zlib.gunzipSync(Buffer.concat([decipher.update(Buffer.from(sealed.ciphertext_b64,'base64')),decipher.final()])).toString('utf8'));
 assert.equal(decoded.records.length,27);
 assert.equal(decoded.records[0].copies[0].source_body_exact,objects[0].selftext);
 assert.ok(Buffer.from(decoded.batches[0].raw_b64,'base64').equals(raw));
 const hold=await captureSecondary({fetchImpl:async()=>({ok:false,status:403}),targets,publicPem:publicKey,outputPath:path.join(tmp,'no-out')});
 assert.equal(hold.complete,false);assert.equal(hold.matched,0);assert.equal(hold.encrypted,false);
 assert.ok(!fs.existsSync(path.join(tmp,'no-out')));
} finally {fs.rmSync(tmp,{recursive:true,force:true});}
console.log('Wendbine P1/P2 27-ID sealed salvage tests passed: exact fields, media-only, ciphertext, raw response, and held provider.');
