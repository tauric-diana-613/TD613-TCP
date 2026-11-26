import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {secondaryTargets,captureSecondary} from '../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-ci-secondary-sealed-rescue.mjs';
import {decryptSecondary,validateSecondaryPayload,restoreSecondary} from '../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-private-secondary-restore.mjs';
const targets=secondaryTargets(),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'wendbine-p1p2-restore-test-'));
const {privateKey,publicKey}=crypto.generateKeyPairSync('rsa',{modulusLength:2048,
 publicKeyEncoding:{type:'spki',format:'pem'},privateKeyEncoding:{type:'pkcs8',format:'pem'}});
const objects=targets.map((t,i)=>({id:t.source_id.slice('reddit:t3_'.length),author:'Upset-Ratio502',
 subreddit:'Wendbine',title:'Synthetic title',selftext:t.previously_media_card?'':'body ∴ '+i,
 created_utc:t.observed_catalogue_day?Date.parse(t.observed_catalogue_day+'T12:00:00Z')/1000:1789600000+i,
 is_self:!t.previously_media_card}));
try {
 const sealed=path.join(tmp,'sealed.json'),pem=path.join(tmp,'private.pem');
 fs.writeFileSync(pem,privateKey,{mode:0o600});
 await captureSecondary({targets,publicPem:publicKey,outputPath:sealed,
  fetchImpl:async()=>({status:200,ok:true,arrayBuffer:async()=>Buffer.from(JSON.stringify({data:objects}))})});
 const payload=decryptSecondary({sealedPath:sealed,privateKeyPath:pem});
 assert.equal(payload.records.length,27);
 const audit=validateSecondaryPayload(payload);
 assert.equal(audit.source_count,27);assert.equal(audit.verified_versions,27);
 assert.equal(audit.full_text_bodies,25);assert.equal(audit.media_empty_bodies,2);
 const corrupted=structuredClone(payload);corrupted.records[0].copies[0].source_body_exact='TAMPERED';
 assert.throws(()=>validateSecondaryPayload(corrupted),/SECONDARY_SOURCE_FIELDS_DIVERGE_FROM_RAW/);
 const dir=path.join(tmp,'restored');
 const receipt=restoreSecondary({sealedPath:sealed,privateKeyPath:pem,destination:dir});
 assert.equal(receipt.distinct_source_ids,27);assert.equal(receipt.full_text_bodies,25);
 assert.equal(receipt.media_empty_bodies,2);
 assert.equal(fs.readFileSync(path.join(dir,'p1p2-private-source-fields.jsonl'),'utf8').trim().split('\n').length,27);
 assert.throws(()=>restoreSecondary({sealedPath:sealed,privateKeyPath:pem,destination:dir}),/REFUSE_OVERWRITE_EXISTING_SECONDARY_RESTORE/);
} finally {fs.rmSync(tmp,{recursive:true,force:true});}
console.log('Wendbine 27-source encrypted restore and tamper rejection passed.');
