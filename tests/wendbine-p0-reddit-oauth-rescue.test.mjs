import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadFoundationalTargets, sourceEndpoint, parseRedditPostBytes, acquireP0 } from '../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-reddit-oauth-rescue.mjs';
import { assertPrivateDestination, sha256Utf8 } from '../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-originals-intake.mjs';

const p0=loadFoundationalTargets();
assert.equal(p0.length,33);
assert.equal(new Set(p0.map(r=>r.source_id)).size,33);
assert.equal(p0.filter(r=>r.publication_day_as_catalogued==='2026-09-10').length,21);
assert.equal(p0.filter(r=>r.publication_day_as_catalogued==='2026-09-11').length,12);
const target=p0[0],id=target.source_id.slice('reddit:t3_'.length);
assert.equal(sourceEndpoint(id),'https://oauth.reddit.com/comments/'+id+'.json?limit=0&raw_json=1');
const sourceText='exact source ∴\r\n  whitespace preserved  \nFinal  ';
const mockPost={
 id,name:'t3_'+id,author:'Upset-Ratio502',subreddit:'Wendbine',
 permalink:'/r/Wendbine/comments/'+id+'/source-title/',
 title:'Original header ✧ with diacritics',selftext:sourceText,
 is_self:true,created_utc:1789038000,edited:false,removed_by_category:null
};
const bytes=Buffer.from(JSON.stringify([{kind:'Listing',data:{children:[{kind:'t3',data:mockPost}]}},{kind:'Listing',data:{children:[]}}]));
const parsed=parseRedditPostBytes(bytes,target,'USER_ATTESTED_AUTHORIZED_COPY','2026-09-22T12:00:00Z');
assert.equal(parsed.source.selftext,sourceText);
assert.equal(parsed.source.title,mockPost.title);
assert.equal(parsed.source_title_sha256,sha256Utf8(mockPost.title));
assert.equal(parsed.source_body_sha256,sha256Utf8(sourceText));
assert.equal(parsed.raw_byte_length,bytes.byteLength);
assert.throws(()=>parseRedditPostBytes(Buffer.from('{"error":403}'),target,'AUTHOR_PERMISSION','2026-09-22T12:00:00Z'),/POST_OBJECT_MISSING/);
for(const [field,value,reason] of [['author','other_account','POST_AUTHOR_MISMATCH'],['subreddit','OtherSub','POST_SUBREDDIT_MISMATCH'],['id','bogus','POST_ID_MISMATCH'],['permalink','/r/other/comments/bogus/','POST_PERMALINK_MISMATCH']]){
 const altered={...mockPost,[field]:value};
 const alteredBytes=Buffer.from(JSON.stringify([{data:{children:[{data:altered}]}}]));
 assert.throws(()=>parseRedditPostBytes(alteredBytes,target,'AUTHOR_PERMISSION','2026-09-22T12:00:00Z'),new RegExp(reason));
}
assert.throws(()=>parseRedditPostBytes(Buffer.from(JSON.stringify([{data:{children:[{data:{...mockPost,selftext:'[removed]'}}]}}])),target,'AUTHOR_PERMISSION','2026-09-22T12:00:00Z'),/POST_REMOVED/);

const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'wendbine-p0-oauth-test-'));
try{
 const symlink=path.join(tmp,'repo-link');
 const actualRepo=path.resolve('.');
 fs.symlinkSync(actualRepo,symlink,'dir');
 assert.throws(()=>assertPrivateDestination(path.join(symlink,'private-originals')),/PRIVATE_ORIGINALS_DESTINATION_MUST_BE_OUTSIDE_REPOSITORY/);
 const dest=path.join(tmp,'captured');
 assert.ok(assertPrivateDestination(dest).startsWith(tmp));
 let seen=[];
 const successFetch=async (url,options)=>{
  seen.push({url,auth:options.headers.Authorization});
  return {status:200,ok:true,arrayBuffer:async()=>bytes};
 };
 const r=await acquireP0({token:'synthetic-test-token',rightsBasis:'USER_ATTESTED_AUTHORIZED_COPY',destination:dest,targets:[target],fetchImpl:successFetch,waitImpl:async()=>{},delayMs:1000});
 assert.equal(r.target_count,1);
 assert.equal(r.success_count,1);
 assert.equal(r.failed_or_held_count,0);
 assert.equal(r.reconciled,true);
 assert.equal(r.complete,true);
 assert.equal(seen.length,1);
 assert.equal(seen[0].url,sourceEndpoint(id));
 const raw=fs.readFileSync(path.join(dest,'raw-'+id+'.json'));
 assert.ok(raw.equals(bytes),'The private raw JSON payload must retain exact response body bytes.');
 const original=JSON.parse(fs.readFileSync(path.join(dest,'source-'+id+'.json'),'utf8'));
 assert.equal(original.title,mockPost.title);
 assert.equal(original.selftext,sourceText);
 assert.equal(r.records[0].exact_selftext_sha256_utf8,sha256Utf8(sourceText));
 assert.throws(()=>assertPrivateDestination(actualRepo),/PRIVATE_ORIGINALS_DESTINATION_MUST_BE_OUTSIDE_REPOSITORY/);
 await assert.rejects(()=>acquireP0({token:'x',rightsBasis:'AUTHOR_PERMISSION',destination:dest,targets:[target],fetchImpl:successFetch}),/REFUSE_OVERWRITE_EXISTING_CAPTURE_DIR/);
 const holdDest=path.join(tmp,'denied');
 let attempts=0;
 const denied=await acquireP0({token:'synthetic-test-token',rightsBasis:'AUTHOR_PERMISSION',destination:holdDest,targets:[target,p0[1],p0[2]],fetchImpl:async()=>{attempts++;return {status:403,ok:false}},waitImpl:async()=>{},delayMs:1000});
 assert.equal(attempts,1,'403 must not trigger retries or continued source probing.');
 assert.equal(denied.failed_or_held_count,3);
 assert.equal(denied.success_count,0);
 assert.equal(denied.reconciled,true);
 assert.equal(denied.complete,false);
 assert.equal(denied.failures[1].state,'NOT_ATTEMPTED_AFTER_AUTH_OR_RATE_LIMIT_HOLD');
 await assert.rejects(()=>acquireP0({token:'',rightsBasis:'AUTHOR_PERMISSION',destination:path.join(tmp,'missing'),targets:[target]}),/REDDIT_OAUTH_TOKEN_REQUIRED/);
 await assert.rejects(()=>acquireP0({token:'x',rightsBasis:null,destination:path.join(tmp,'missing'),targets:[target]}),/EXPLICIT_RIGHTS_BASIS_REQUIRED/);
} finally {fs.rmSync(tmp,{recursive:true,force:true});}
console.log('Wendbine P0 OAuth source capture: 33-target roster, exact Unicode/whitespace/raw-byte custody, account validation, symlink guard, and 403 fail-closed tests passed.');
