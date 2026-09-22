import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import crypto from 'node:crypto';
import {loadFoundationalTargets} from '../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-reddit-oauth-rescue.mjs';
import {loadVerifiedP0,exactSearch,DEFAULT_RECEIPT} from '../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-private-p0-source-query.mjs';
const publicManifest=JSON.parse(fs.readFileSync(DEFAULT_RECEIPT,'utf8'));
assert.equal(publicManifest.source_count,33);
assert.equal(publicManifest.records.length,33);
assert.equal(new Set(publicManifest.records.map(x=>x.source_id)).size,33);
assert.equal(publicManifest.raw_http_payload_sha256,'9657dd03c00a2285a4496b7f42a18075835d8e55110a0513ebd4af0e8f211a2c');
assert.equal(publicManifest.records.filter(x=>x.reddit_title_exact==='Wensbine').length,1);
const digest=s=>crypto.createHash('sha256').update(Buffer.from(s,'utf8')).digest('hex');
const roster=loadFoundationalTargets(), objects=roster.map((t,i)=>({
 id:t.source_id.slice('reddit:t3_'.length),author:'Upset-Ratio502',subreddit:'Wendbine',
 title:i===20?'Wensbine':'Wendbine',selftext:'Synthetic header '+i+' ∴\r\n  Exact provenance and authority  ⟐',
 created_utc:Date.parse(t.publication_day_as_catalogued+'T12:00:00Z')/1000
}));
const privateRows=objects.map(o=>({source_id:'reddit:t3_'+o.id,canonical_url:'https://www.reddit.com/r/Wendbine/comments/'+o.id+'/wendbine/',
 source_title_exact:o.title,source_body_exact:o.selftext,source_created_utc:o.created_utc,
 body_sha256_utf8:digest(o.selftext)}));
const raw=Buffer.from(JSON.stringify({data:objects}));
const manifest={schema:'wendbine-p0-archived-source-field-receipts/v0.6',source_count:33,raw_http_payload_sha256:digest(raw),
 raw_http_payload_bytes:raw.length,records:privateRows.map(x=>({source_id:x.source_id,canonical_url:x.canonical_url,
 reddit_title_exact:x.source_title_exact,title_sha256_utf8:digest(x.source_title_exact),
 body_sha256_utf8:digest(x.source_body_exact),body_utf8_bytes:Buffer.byteLength(x.source_body_exact,'utf8'),
 source_created_utc:x.source_created_utc}))};
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'wendbine-real-text-search-'));
try{
 const rawFile=path.join(tmp,'raw.json'),srcFile=path.join(tmp,'private.jsonl'),manifestFile=path.join(tmp,'receipt.json');
 fs.writeFileSync(rawFile,raw);fs.writeFileSync(srcFile,privateRows.map(x=>JSON.stringify(x)).join('\n')+'\n');fs.writeFileSync(manifestFile,JSON.stringify(manifest));
 const rows=loadVerifiedP0({privateJsonl:srcFile,rawResponse:rawFile,receiptPath:manifestFile});
 assert.equal(rows.length,33);
 assert.equal(exactSearch(rows,'provenance').length,33);
 assert.equal(exactSearch(rows,'Provenance',{caseSensitive:true}).length,0);
 const hit=exactSearch(rows,'Exact provenance')[0];
 assert.equal(hit.offset_utf8,Buffer.byteLength(rows[0].source_body_exact.slice(0,hit.offset_utf16),'utf8'));
 assert.equal(hit.status,'EXACT_PRIVATE_SOURCE_TEXT_MATCH_ARCHIVE_VERSION');
 fs.writeFileSync(srcFile,privateRows.map((x,i)=>JSON.stringify(i===0?{...x,source_body_exact:'TAMPER'}:x)).join('\n')+'\n');
 assert.throws(()=>loadVerifiedP0({privateJsonl:srcFile,rawResponse:rawFile,receiptPath:manifestFile}),/SOURCE_FIELDS_DIFFER_FROM_RAW/);
 fs.writeFileSync(srcFile,privateRows.map(x=>JSON.stringify(x)).join('\n')+'\n');fs.writeFileSync(rawFile,Buffer.from('tampered'));
 assert.throws(()=>loadVerifiedP0({privateJsonl:srcFile,rawResponse:rawFile,receiptPath:manifestFile}),/RAW_ARCHIVE_DIGEST_MISMATCH/);
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
console.log('Wendbine 33/33 actual archive receipt, full-field private exact search, unicode offset and tamper rejection passed.');
