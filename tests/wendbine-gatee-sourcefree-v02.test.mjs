import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {validateSourceFree,queryLocalPage,verifyReopenedJsonl} from '../scripts/wendbine-gatee-sourcefree-v02.mjs';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const b=s=>Buffer.from(s,'utf8');
const capid=c=>'wendbine:capture:'+sha([c.source_id,c.title_sha256_utf8,c.body_sha256_utf8,c.observed_at].join('\x1f')).slice(0,24);
const clone=v=>structuredClone(v);
const key=b('synthetic-local-only-key-not-for-release');

function fixture(n=2,{hashOnly=0}={}){
 const raw=[],posts=[],manifests=[],captures=[],rights=[],versions=[];
 for(let i=0;i<n;i++){
  const id='a'+String(i).padStart(4,'0'),source_id='reddit:t3_'+id;
  const text=i%2===0?'İ echo echo Δ':'Δ echo';
  const item={id,author:'Upset-Ratio502',subreddit:'Wendbine',title:'Wendbine #'+i,selftext:text,created_utc:1793640000+i,
    edited:false,retrieved_on:1793641000,is_self:true,permalink:'/r/Wendbine/comments/'+id+'/wendbine/'};
  raw.push(item);
  const url='https://www.reddit.com/r/Wendbine/comments/'+id+'/wendbine/';
  const p={source_id,canonical_url:url,source_created_utc:item.created_utc,source_edited:false,archive_retrieved_on:1793641000,
    title:item.title,selftext:item.selftext,body_state:'ARCHIVED_TEXT_BODY_PRESENT',media_or_link_post:false};
  posts.push(p);
  const mid='reddit:manifestation:'+id;
  const m={source_id,manifestation_id:mid,platform_account:'Upset-Ratio502',subreddit:'Wendbine',canonical_url:url,
    platform_title:i<hashOnly?null:item.title,platform_title_status:i<hashOnly?'TITLE_HASH_ONLY_PUBLIC_RESEARCH_PROJECTION':'EXACT_ARCHIVE_OBSERVED_TITLE',
    published_at:new Date(item.created_utc*1000).toISOString()};
  manifests.push(m);rights.push({manifestation_id:mid,decision:'PRIVATE_ONLY'});
  const c={source_id,manifestation_id:mid,observed_at:'2026-11-02T18:00:00Z',source_created_utc:item.created_utc,source_edited:false,
    archive_retrieved_on:1793641000,provider:'ARCTIC_SHIFT',title_sha256_utf8:sha(b(item.title)),body_sha256_utf8:sha(b(item.selftext)),
    body_utf8_bytes:b(item.selftext).length,body_state:p.body_state,bootstrap_receipt:null};
  c.capture_id=capid(c);captures.push(c);versions.push({capture_id:c.capture_id,manifestation_id:mid,observed_at:c.observed_at,
    title_sha256_utf8:c.title_sha256_utf8,body_sha256_utf8:c.body_sha256_utf8});
 }
 const rawbytes=b(JSON.stringify(raw)),batch={raw_b64:rawbytes.toString('base64'),raw_byte_length:rawbytes.length,raw_sha256:sha(rawbytes)};
 for(let i=0;i<n;i++){
  posts[i].archive_response_sha256=batch.raw_sha256;posts[i].archive_response_bytes=batch.raw_byte_length;posts[i].source_object_index=i;
  captures[i].archive_response_sha256=batch.raw_sha256;captures[i].archive_response_bytes=batch.raw_byte_length;captures[i].source_object_index=i;
 }
 return {payload:{schema:'wendbine-src-autosync/v0.1',provider:'ARCTIC_SHIFT',posts,raw_batches:[batch]},manifests,captures,rights,versions,
    snapshotId:'synthetic-epoch',sealId:'synthetic-seal',sealAuthenticated:true};
}
const validate=f=>validateSourceFree(f);
function search(records,kind,term,limit=50,cursor=null,allowSource=()=>true){return queryLocalPage({records,kind,term,limit,cursor,cursorKey:key,allowSource});}

test('GE-R01: all 27 hash-only title projections recover while exact-title tamper fails',()=>{
 const f=fixture(30,{hashOnly:27});const records=validate(f);
 assert.equal(records.length,30);
 assert.equal(f.manifests.filter(x=>x.platform_title===null).length,27);
 f.manifests[27].platform_title='WRONG';assert.throws(()=>validate(f),/SOURCE_HASH_OR_PUBLIC_FIELDS_MISMATCH/);
});
test('GE-R02: sealed response digest, byte length and ordinal each required',()=>{
 const f=fixture(),r=validate(f);assert.equal(r.length,2);
 for(const field of ['archive_response_sha256','archive_response_bytes','source_object_index']){
  const t=clone(f);t.captures[0][field]=field==='source_object_index'?1:field==='archive_response_bytes'?2:'a'.repeat(64);
  assert.throws(()=>validate(t),/RAW_BATCH_SEALED_POINTER_MISMATCH/);
 }
 const t=clone(f);t.payload.raw_batches.push({...t.payload.raw_batches[0],raw_sha256:'b'.repeat(64)});
 assert.throws(()=>validate(t),/RAW_BATCH_INTEGRITY|DUPLICATE_RAW_BATCH/);
});
test('GE-R03: reject replacement-decoded UTF8 even with matching batch digest',()=>{
 const f=fixture();const bytes=b(f.payload.raw_batches[0].raw_b64 ? Buffer.from(f.payload.raw_batches[0].raw_b64,'base64').toString('utf8'):'');
 const position=bytes.indexOf(b('İ'));assert.ok(position>=0);bytes[position]=0xff;
 const altered={raw_b64:bytes.toString('base64'),raw_byte_length:bytes.length,raw_sha256:sha(bytes)};
 f.payload.raw_batches=[altered];assert.throws(()=>validate(f),/RAW_BATCH_UTF8_OR_JSON_INVALID/);
});
test('GE-R04: reject edited clock, retrieved clock, media state and tie',()=>{
 const f=fixture();
 for(const field of ['source_edited','source_created_utc','archive_retrieved_on']){
  const t=clone(f);t.captures[0][field]=field==='source_edited'?true:0;
  assert.throws(()=>validate(t),/CAPTURE_CLOCK_OR_EDIT_STATE_MISMATCH/);
 }
 const m=clone(f);m.payload.posts[0].media_or_link_post=true;
 assert.throws(()=>validate(m),/BODY_OR_MEDIA_STATE_CONFLICT/);
 const t=clone(f);const c=clone(t.captures[0]);c.body_sha256_utf8='a'.repeat(64);c.capture_id=capid(c);t.captures.push(c);
 t.versions.push({capture_id:c.capture_id,manifestation_id:c.manifestation_id,observed_at:c.observed_at,title_sha256_utf8:c.title_sha256_utf8,body_sha256_utf8:c.body_sha256_utf8});
 assert.throws(()=>validate(t),/AMBIGUOUS_LATEST_CAPTURE_TIE/);
});
test('GE-R05: refuse absent or nonprivate rights and fail closed on untrusted seal',()=>{
 const f=fixture();const t=clone(f);t.rights=[];
 assert.throws(()=>validate(t),/INCOMPLETE_EPOCH_CARDINALITY/);
 f.rights[0].decision='PUBLIC_EXPORT_ALLOWED';assert.throws(()=>validate(f),/INVALID_OR_UNAUTHORIZED_RIGHTS/);
 const u=fixture();u.sealAuthenticated=false;assert.throws(()=>validate(u),/EXTERNAL_EPOCH_TRUST_ROOT_REQUIRED/);
});
test('GE-Q01: exact Unicode byte offsets preserve U+0130 and multibyte symbols',()=>{
 const records=validate(fixture());const r=search(records,'search','echo');
 assert.equal(r.total_matches,3);
 assert.deepEqual(r.results.slice(0,2).map(x=>x.start_utf8),[b('İ ').length,b('İ echo ').length]);
 assert.ok(r.results.every(x=>x.exact_slice==='echo' && x.end_utf8-x.start_utf8===4));
});
test('GE-Q02: no 100-source truncation, all occurrences and complete date enumeration',()=>{
 const r=validate(fixture(112));let cursor=null,found=0,loops=0;
 do{const page=search(r,'search','echo',7,cursor);found+=page.returned_count;cursor=page.next_cursor;loops++;assert.ok(loops<100);if(!cursor)assert.equal(page.exhausted,true);}while(cursor);
 assert.equal(found,168); // 56 even *2 + 56 odd *1
 let total=0;cursor=null;
 do{const page=search(r,'date','2026-11-02',9,cursor);total+=page.returned_count;cursor=page.next_cursor;}while(cursor);
 assert.equal(total,112);
});
test('GE-Q02 cursor rejects query changes and silent authorization gaps',()=>{
 const rows=validate(fixture(5));const p=search(rows,'search','echo',1);
 assert.ok(p.next_cursor);assert.throws(()=>search(rows,'search','Δ',1,p.next_cursor),/STALE_OR_CROSS_QUERY_CURSOR/);
 const restricted=search(rows,'search','echo',50,null,r=>r.source_id.endsWith('000'));
 assert.equal(restricted.rights_excluded,4);assert.equal(restricted.status,'EXECUTED_WITH_RIGHTS_GAPS');
});
test('GE-Q03: reopened local index must match independent anchor',()=>{
 const rows=validate(fixture());const bytes=b(rows.map(JSON.stringify).join('\n')+'\n');const anchor={bytes,expectedSha256:sha(bytes),expectedLength:bytes.length,
 expectedCount:2,snapshotId:'synthetic-epoch',sealId:'synthetic-seal'};
 assert.equal(verifyReopenedJsonl(anchor).length,2);
 const tampered=Buffer.from(bytes);tampered[10]^=1;assert.throws(()=>verifyReopenedJsonl({...anchor,bytes:tampered}),/INDEPENDENT_LOCAL_INDEX_ANCHOR_MISMATCH/);
 assert.throws(()=>verifyReopenedJsonl({...anchor,bytes:bytes.subarray(0,-1)}),/INDEPENDENT_LOCAL_INDEX_ANCHOR_MISMATCH/);
});
test('complete capture/version relation must match clock and hash',()=>{
 const f=fixture();f.versions[0].observed_at='2026-11-02T19:00:00Z';
 assert.throws(()=>validate(f),/CAPTURE_VERSION_CLOCK_OR_HASH_CONFLICT/);
});

test('GE-R02: raw permalink cannot silently rewrite canonical source binding',()=>{
 const f=fixture();const raw=JSON.parse(Buffer.from(f.payload.raw_batches[0].raw_b64,'base64').toString('utf8'));
 raw[0].permalink='/r/Wendbine/comments/a0000/altered-slug/';
 const bytes=b(JSON.stringify(raw)),hash=sha(bytes);
 f.payload.raw_batches[0]={raw_b64:bytes.toString('base64'),raw_byte_length:bytes.length,raw_sha256:hash};
 for(const x of f.payload.posts){x.archive_response_sha256=hash;x.archive_response_bytes=bytes.length;}
 for(const x of f.captures){x.archive_response_sha256=hash;x.archive_response_bytes=bytes.length;}
 assert.throws(()=>validate(f),/RAW_PERMALINK_PUBLIC_URL_MISMATCH/);
});
test('GE-R04: empty version registry never earns verified capture status',()=>{
 const f=fixture();f.versions=[];assert.throws(()=>validate(f),/INCOMPLETE_EPOCH_CARDINALITY/);
});
