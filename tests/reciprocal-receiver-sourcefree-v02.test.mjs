import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { nativeProbe,openSyntheticReceiver,ROUTES } from '../scripts/reciprocal-receiver-sourcefree-v02.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const fixture=t=>{const store=fs.mkdtempSync(path.join(os.tmpdir(),'td613-reciprocal-'));t.after(()=>fs.rmSync(store,{recursive:true,force:true}));return store;};
function td(){return {schema:'td613.research-intake/v1',record_id:'R-SOURCE-FREE-001',kind:'source_note',title:'Original source Ω',recorded_at:'2026-11-02T12:00:00Z',author:'fixture',human_request_ref:'synthetic',visibility:'public',body:'A qualified test of a witness.',sources:[{source_id:'FIXTURE:PRIMARY',kind:'artifact',locator:'fixture:source',capture_status:'OPERATOR_SUPPLIED'}],evidence:{disposition:'SPECIFIED',earned_claim:'synthetic only',claim_ceiling:'No empirical inference',missing_evidence:[]}};}
function w(edge=true){const posts=['a','b'].map(x=>({source_id:'reddit:t3_'+x,snapshot_id:'SYN',community:'r/Wendbine',source_text_stored:false,real_person_identity_adjudicated:false,canonical_url:'https://www.reddit.com/r/Wendbine/comments/'+x,declared_concepts:['alpha','beta'],public_date:'2026-09-10',time_precision:'DAY',technical_header:'fixture '+x,source_flags:[]}));return {meta:{schema:'wendbine-public-corpus-snapshot/v0.1',snapshot_id:'SYN',coverage:{admitted_source_count:2},scope:{surface:'synthetic',community:'r/Wendbine',private_google_group_admitted:false},rights:{full_post_bodies_copied:false},authority:{}},posts,relations:edge?[{source_id:posts[0].source_id,graph:'G_D',from:'alpha',relation:'DEPENDS_ON',to:'beta',evidence_class:'SOURCE_EXPLICIT_PROGRAM'}]:[]};}
const make=(route,source_id,object)=>{const original=JSON.stringify(object);return {evidence_class:'SYNTHETIC_SOURCE_FREE_FIXTURE',source_pin:ROUTES[route].sourcePin,source_id,original,bytes:Buffer.from(original),sha256:sha(original),rights:'SYNTHETIC_LOCAL_ONLY'};};
const T='TD613_ENCYCLOPEDIA_TO_UNIVERSAL_ATELIER', W='WENDBINE_ATELIER_TO_UNIVERSAL_ENCYCLOPEDIA';
test('native source-free probes genuinely execute TD613 inspection and Wendbine graph compiler',async()=>{
 const a=await nativeProbe(root,T,JSON.stringify(td()));assert.equal(a.result.source_id,'R-SOURCE-FREE-001');
 const b=await nativeProbe(root,W,JSON.stringify(w()));assert.equal(b.result.typed_edges.length,1);
 const z=await nativeProbe(root,W,JSON.stringify(w(false)));assert.equal(z.result.typed_edges.length,0);
 const bad=w();bad.relations[0].source_id='reddit:t3_missing';await assert.rejects(nativeProbe(root,W,JSON.stringify(bad)),/NATIVE_WENDBINE_REFUSAL/);
});
test('both reciprocal routes produce independent receiver custody, restart, retrieval and native re-execution',async t=>{
 const store=fixture(t);for(const [route,o,needle] of [[T,td(),'qualified'],[W,w(),'DEPENDS_ON']]){
  const incoming=make(route,'FIXTURE:'+route,o),receiver=openSyntheticReceiver({repoRoot:root,store,route});
  const receipt=await receiver.admit(incoming);assert.equal(receipt.status,'RECEIVER_SOURCE_ADMITTED_SYNTHETIC');
  const again=openSyntheticReceiver({repoRoot:root,store,route});assert.equal((await again.admit(incoming)).status,'EXACT_REPLAY');
  assert.equal(again.retrieve(incoming.source_id,receipt.record_sha256).original,incoming.original);
  assert.deepEqual(again.search(needle).ids,[incoming.source_id]);
  assert.equal((await again.execute(incoming.source_id,receipt.record_sha256)).source_id,incoming.source_id);
 }
});
test('source pin, rights, original bytes and actual native schema refusals fail before receiver admission',async t=>{
 const store=fixture(t),r=openSyntheticReceiver({repoRoot:root,store,route:T}),incoming=make(T,'FIXTURE:A',td());
 await assert.rejects(r.admit({...incoming,source_pin:'0'.repeat(40)}),/SOURCE_FREE_OR_SOURCE_PIN_REQUIRED/);
 await assert.rejects(r.admit({...incoming,rights:'PRIVATE_SOURCE'}),/SOURCE_RIGHTS_NOT_ADMITTED/);
 await assert.rejects(r.admit({...incoming,bytes:Buffer.from('forgery')}),/ORIGINAL_BYTES_OR_FIXTURE_ID_MISMATCH/);
 await assert.rejects(r.admit({...incoming,source_id:'REAL-ARCHIVE'}),/ORIGINAL_BYTES_OR_FIXTURE_ID_MISMATCH/);
 const privateRecord=td();privateRecord.visibility='private';await assert.rejects(r.admit(make(T,'FIXTURE:PRIVATE',privateRecord)),/PRIVATE_SOURCE_NOT_AUTHORIZED/);
 const invalid=td();delete invalid.sources;await assert.rejects(r.admit(make(T,'FIXTURE:INVALID',invalid)),/NATIVE_TD613_REFUSAL/);
 assert.throws(()=>r.retrieve('FIXTURE:INVALID','0'.repeat(64)),/RECEIVER_SOURCE_ABSENT/);
});
test('duplicate identity, altered storage and native source drift never become successful query/operation',async t=>{
 const store=fixture(t),r=openSyntheticReceiver({repoRoot:root,store,route:T}),a=make(T,'FIXTURE:A',td());
 const receipt=await r.admit(a);const changed={...td(),body:'Different source content'};
 await assert.rejects(r.admit(make(T,'FIXTURE:A',changed)),/RECEIVER_REPLAY_CONFLICT/);
 const dir=path.join(store,sha(T)),file=path.join(dir,sha('FIXTURE:A')+'.json');const original=fs.readFileSync(file);
 const obj=JSON.parse(original);obj.original='TAMPER';fs.writeFileSync(file,JSON.stringify(obj));assert.throws(()=>r.retrieve('FIXTURE:A',receipt.record_sha256),/RECEIVER_RECORD_RECEIPT_MISMATCH/);
 fs.writeFileSync(file,original);
 const module=path.join(root,'scripts/encyclopedia-intake.cjs'),bytes=fs.readFileSync(module);
 try{fs.appendFileSync(module,'\n// source drift under source-free test\n');await assert.rejects(r.execute('FIXTURE:A',receipt.record_sha256),/PINNED_NATIVE_CODE_DRIFT/);}finally{fs.writeFileSync(module,bytes);}
});
test('one source cannot enter the wrong recipient; external store and symlink refusal',async t=>{
 const store=fixture(t),a=make(T,'FIXTURE:A',td()),wrecv=openSyntheticReceiver({repoRoot:root,store,route:W});
 await assert.rejects(wrecv.admit(a),/SOURCE_FREE_OR_SOURCE_PIN_REQUIRED/);
 assert.throws(()=>openSyntheticReceiver({repoRoot:root,store:root,route:T}),/INDEPENDENT_RECEIVER_STORE_REQUIRED/);
 const symlink=path.join(store,'link');fs.symlinkSync(store,symlink);
 assert.throws(()=>openSyntheticReceiver({repoRoot:root,store:symlink,route:T}),/ABSOLUTE_EXISTING_NONSYMLINK_DIR_REQUIRED/);
});

test('recipient requires an external admission receipt and refuses a coherent locally rewritten record',async t=>{
 const store=fixture(t),r=openSyntheticReceiver({repoRoot:root,store,route:T}),a=make(T,'FIXTURE:HOSTILE',td());
 const receipt=await r.admit(a);assert.throws(()=>r.retrieve(a.source_id),/INDEPENDENT_RECORD_RECEIPT_REQUIRED/);
 const file=path.join(store,sha(T),sha(a.source_id)+'.json'),record=JSON.parse(fs.readFileSync(file));
 record.original=JSON.stringify({...td(),body:'Coherent false revision'});record.original_sha256=sha(record.original);
 fs.writeFileSync(file,JSON.stringify(record)+'\n');
 assert.throws(()=>r.retrieve(a.source_id,receipt.record_sha256),/RECEIVER_RECORD_RECEIPT_MISMATCH/);
 await assert.rejects(r.execute(a.source_id,receipt.record_sha256),/RECEIVER_RECORD_RECEIPT_MISMATCH/);
});

test('source-matched native / recipient / transport-only lanes distinguish executable research from copied bytes',async t=>{
 const store=fixture(t);
 for(const [route,object] of [[T,td()],[W,w()]]){
  const source=make(route,'FIXTURE:COMPARE:'+route,object);
  const transport={raw_byte_sha256:sha(source.bytes),returned_bytes:Buffer.from(source.bytes),native_operations_executed:0};
  assert.equal(transport.raw_byte_sha256,source.sha256);
  const native=await nativeProbe(root,route,source.original);
  const receiver=openSyntheticReceiver({repoRoot:root,store,route});
  const admitted=await receiver.admit(source);
  const after=await receiver.execute(source.source_id,admitted.record_sha256);
  assert.deepEqual(after.result,native.result,'source-matched executed operation output');
  assert.notEqual(after.operation,undefined);
  assert.equal(transport.native_operations_executed,0,'transport is explicitly operation-free');
 }
});
test('source withdrawal changes the native bounded result without inventing interpretations',async()=>{
 const source=td(),two={...source,sources:[...source.sources,{source_id:'FIXTURE:ADDITIONAL',kind:'artifact',locator:'fixture:second',capture_status:'OPERATOR_SUPPLIED'}]};
 const tdBefore=await nativeProbe(root,T,JSON.stringify(two)),tdAfter=await nativeProbe(root,T,JSON.stringify(source));
 assert.equal(tdBefore.result.source_refs.length,2);assert.equal(tdAfter.result.source_refs.length,1);
 const wBefore=await nativeProbe(root,W,JSON.stringify(w(true))),wAfter=await nativeProbe(root,W,JSON.stringify(w(false)));
 assert.equal(wBefore.result.typed_edges.length,1);assert.equal(wAfter.result.typed_edges.length,0);
});

test('public Wendbine route rejects declared private bodies and injected copied body fields before admission',async t=>{
 const store=fixture(t),r=openSyntheticReceiver({repoRoot:root,store,route:W});
 const cases=[
  {name:'declared full bodies',mutate:v=>{v.meta.rights.full_post_bodies_copied=true;},code:/WENDBINE_PUBLIC_RIGHTS_REFUSED/},
  {name:'declared private group',mutate:v=>{v.meta.scope.private_google_group_admitted=true;},code:/WENDBINE_PUBLIC_RIGHTS_REFUSED/},
  {name:'missing affirmative public rights',mutate:v=>{delete v.meta.rights.full_post_bodies_copied;},code:/WENDBINE_PUBLIC_RIGHTS_REFUSED/},
  {name:'copied post body despite safe flags',mutate:v=>{v.posts[0].body='SYNTHETIC_SECRET_SENTINEL';},code:/WENDBINE_SOURCE_BODY_FIELD_REFUSED/},
  {name:'copied full_text despite safe flags',mutate:v=>{v.posts[0].full_text='SYNTHETIC_SECRET_SENTINEL';},code:/WENDBINE_SOURCE_BODY_FIELD_REFUSED/}
 ];
 for(const [i,{name,mutate,code}] of cases.entries()) {
  const v=w();mutate(v);const envelope=make(W,'FIXTURE:RIGHTS-ATTACK-'+i,v);
  await assert.rejects(nativeProbe(root,W,envelope.original),code,name);
  await assert.rejects(r.admit(envelope),code,name);
  assert.throws(()=>r.retrieve(envelope.source_id,'0'.repeat(64)),/RECEIVER_SOURCE_ABSENT/,name);
 }
 const permitted=make(W,'FIXTURE:PUBLIC-ALLOWED',w());
 const receipt=await r.admit(permitted);assert.equal(receipt.status,'RECEIVER_SOURCE_ADMITTED_SYNTHETIC');
 assert.equal((await r.execute(permitted.source_id,receipt.record_sha256)).result.typed_edges.length,1);
});
