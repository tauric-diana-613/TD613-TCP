import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {openCandidate,originalNative,ROUTES,NATIVE_PINS} from '../scripts/reciprocal-native-inheritance-candidate-v01.mjs';
const sha=x=>createHash('sha256').update(x).digest('hex');
const here=path.dirname(fileURLToPath(import.meta.url)),nativeRoot=path.resolve(here,'../scripts');
const T='TD613_ENCYCLOPEDIA_TO_UNIVERSAL_ATELIER',W='WENDBINE_ATELIER_TO_UNIVERSAL_ENCYCLOPEDIA';
const scratch=t=>{const p=fs.mkdtempSync(path.join(os.tmpdir(),'e3b2-independent-'));t.after(()=>fs.rmSync(p,{recursive:true,force:true}));return p};
function td(){
 const mk=(id,label,body,links=[])=>({id,label,kind:'evidence',family:'Synthetic',status:'SOURCE_STAGED',evidence_class:'SYNTHETIC',claim_ceiling:'No research claim',aliases:[],record:{body},supplement:{},links,source_keys:[],origin:{json_pointer:'fixture:/'+id}});
 const records=[mk('R-FIXTURE-X','Topology witness','alpha beta witness',[{type:'cites_source',target:'R-FIXTURE-Y'}]),mk('R-FIXTURE-Y','Other proof','gamma delta',[])];
 const directory=records.map(r=>({id:r.id,record_sha256:sha(JSON.stringify(r).replace(/</g,'\\u003c')),html_line:1,html_anchor:'#record='+r.id}));
 return {manifest:{schema:'td613.encyclopedia.reference/v1',edition_version:'1.4',edition_source_commit:'synthetic source-free',canonical_payload_sha256:'synthetic-only',facets:{kind:{}}},records,directory};
}
function w(edge=true){const posts=['a','b'].map((x,i)=>({source_id:'reddit:t3_fixture'+x,snapshot_id:'SYN',community:'r/Wendbine',source_text_stored:false,real_person_identity_adjudicated:false,canonical_url:'https://www.reddit.com/r/Wendbine/comments/fixture_'+x,declared_concepts:i?['beta']:['alpha','topology'],normalized_summary:i?'A second synthetic entry':'Explicit dependency witness',public_date:i?'2026-09-11':'2026-09-10',time_precision:'DAY',technical_header:i?'Independent witness':'Topology dependency',source_flags:[]}));return {meta:{schema:'wendbine-public-corpus-snapshot/v0.1',snapshot_id:'SYN',coverage:{admitted_source_count:2},scope:{surface:'synthetic',community:'r/Wendbine',private_google_group_admitted:false},rights:{full_post_bodies_copied:false},authority:{}},posts,relations:edge?[{source_id:posts[0].source_id,graph:'G_D',from:'alpha',relation:'DEPENDS_ON',to:'beta',evidence_class:'SOURCE_EXPLICIT_PROGRAM'}]:[]};}
const envelope=(route,payload)=>{const original=JSON.stringify(payload),bytes=Buffer.from(original);return {source_id:'FIXTURE:'+route,source_pin:ROUTES[route].pin,epoch:ROUTES[route].epoch,evidence_class:'SYNTHETIC_SOURCE_FREE_FIXTURE',rights:'SYNTHETIC_LOCAL_ONLY',original,bytes,original_sha256:sha(bytes)}};
async function setup(t,route,payload){const store=scratch(t),r=openCandidate({route,store,nativeRoot}),e=envelope(route,payload),a=r.admit(e);return {r,e,a,store}};
test('frozen original functions retain verified SHA-256 and bytes',()=>{for(const x of Object.values(NATIVE_PINS)){assert.equal(sha(fs.readFileSync(path.join(nativeRoot,x.file))),x.sha256)}});
test('recipients independently initialize EMPTY before separate synthetic admission',async t=>{
 const s=scratch(t),r=openCandidate({route:T,store:s,nativeRoot});assert.equal(r.state().empty,true);const a=r.admit(envelope(T,td()));assert.equal(a.status,'ADMITTED_SYNTHETIC');assert.equal(r.state().empty,false);assert.deepEqual(r.readback(a.receipt_sha256),td());assert.equal(r.originalBytes(a.receipt_sha256).toString('utf8'),envelope(T,td()).original);
 const wstore=scratch(t),other=openCandidate({route:W,store:wstore,nativeRoot});assert.equal(other.state().empty,true);
});
test('TD native vs portable recipient search/get/cite/neighbors/context/verify with original ranking and source-specific original bytes',async t=>{
 const obj=td(),{r,a,store,e}=await setup(t,T,obj),restart=openCandidate({route:T,store,nativeRoot});
 const cases=[['search',{query:'topology'}],['get',{id:'R-FIXTURE-X'}],['cite',{id:'R-FIXTURE-X'}],['neighbors',{id:'R-FIXTURE-X'}],['context',{id:'R-FIXTURE-X'}],['verify',{}]];
 for(const [op,args] of cases){const n=await originalNative(nativeRoot,T,obj,op,args),v=await restart.run(a.receipt_sha256,op,args);assert.equal(JSON.stringify(v),JSON.stringify(n),op)}
 assert.equal((await restart.run(a.receipt_sha256,'search',{query:'topology'})).hits[0].id,'R-FIXTURE-X');
 assert.equal((await restart.run(a.receipt_sha256,'get',{id:'R-FIXTURE-X'})).record.body,'alpha beta witness');
 assert.equal((await restart.run(a.receipt_sha256,'cite',{id:'R-FIXTURE-X'})).record_sha256,obj.directory[0].record_sha256);
 assert.equal((await restart.run(a.receipt_sha256,'verify')).mismatches.length,0);
 assert.equal(restart.admit(e).status,'EXACT_REPLAY');
 assert.equal(sha(restart.originalBytes(a.receipt_sha256)),e.original_sha256);
 const transport={raw_sha256:sha(e.bytes),native_executions:0};assert.equal(transport.raw_sha256,e.original_sha256);assert.equal(transport.native_executions,0);
});
test('TD citation integrity, absent source, wrong epoch, missing receipt and false twin refuse or return zero',async t=>{
 const store=scratch(t),r=openCandidate({route:T,store,nativeRoot}),p=td(),e=envelope(T,p);
 assert.throws(()=>r.admit({...e,epoch:'edition-0'}),/SOURCE_EPOCH_RIGHTS_OR_BYTES_REFUSED/);
 assert.throws(()=>r.admit({...e,rights:'PRIVATE'}),/SOURCE_EPOCH_RIGHTS_OR_BYTES_REFUSED/);
 assert.throws(()=>r.admit({...e,bytes:Buffer.from('tamper')}),/SOURCE_EPOCH_RIGHTS_OR_BYTES_REFUSED/);
 const corrupt=td();corrupt.directory[0].record_sha256='0'.repeat(64);assert.throws(()=>r.admit(envelope(T,corrupt)),/TD613_RECORD_HASH_REFUSED/);
 const a=r.admit(e);await assert.rejects(r.run(undefined,'search',{query:'topology'}),/INDEPENDENT_RECEIPT_REQUIRED/);
 assert.equal((await r.run(a.receipt_sha256,'search',{query:'phantom-unrelated'})).hits.length,0);
 assert.equal(await r.run(a.receipt_sha256,'get',{id:'R-FIXTURE-MISSING'}),null);
 await assert.rejects(r.run(a.receipt_sha256,'unreal-operation'),/NATIVE_OPERATION_UNSUPPORTED/);
 assert.throws(()=>r.admit(envelope(T,{...p,records:[p.records[0]]})),/TD613_EDITION_OR_RECORDS_REFUSED/);
});
test('Wendbine native vs recipient lexical semantic recent resolve topology, genuine zero and date precision',async t=>{
 for(const edge of [true,false]){const obj=w(edge),{r,a,store,e}=await setup(t,W,obj),restart=openCandidate({route:W,store,nativeRoot});
 for(const [op,args] of [['lexical',{query:'topology'}],['semantic',{query:'topology'}],['recent',{options:{sourceOnly:true}}],['resolve',{id:'reddit:t3_fixturea'}],['topology',{}]]){
  assert.deepEqual(await restart.run(a.receipt_sha256,op,args),await originalNative(nativeRoot,W,obj,op,args),op);
 }
 const out=await restart.run(a.receipt_sha256,'topology');assert.equal(out.typed_edges.length,edge?1:0);
 assert.equal((await restart.run(a.receipt_sha256,'lexical',{query:'unrepresentedphantomtoken'})).length,0);
 assert.equal((await restart.run(a.receipt_sha256,'recent')).at(0).date,'2026-09-11');
 assert.equal((await restart.run(a.receipt_sha256,'recent')).at(0).time_precision,'DAY');
 assert.equal(restart.admit(e).status,'EXACT_REPLAY');
 assert.equal(sha(restart.originalBytes(a.receipt_sha256)),e.original_sha256);
 }});
test('Wendbine source rights, source identity, source epoch and contradictory metadata refused',async t=>{
 const store=scratch(t),r=openCandidate({route:W,store,nativeRoot});
 for(const mutate of [v=>v.meta.rights.full_post_bodies_copied=true,v=>v.meta.scope.private_google_group_admitted=true,v=>v.meta.scope.surface='private Google group',v=>v.posts[0].body='SYNTHETIC_PRIVATE_SENTINEL',v=>v.posts[0].source_text_stored=true,v=>v.posts[0].time_precision='HOUR',v=>v.posts[0].source_id='reddit:t3_real',v=>v.meta.coverage.admitted_source_count=5]){
  const p=w();mutate(p);assert.throws(()=>r.admit(envelope(W,p)),/WENDBINE_PUBLIC_RIGHTS_OR_EPOCH_REFUSED|WENDBINE_PUBLIC_ROW_REFUSED|WENDBINE_COVERAGE_MISMATCH/);
 }
 const e=envelope(W,w());assert.throws(()=>r.admit({...e,source_pin:'0'.repeat(40)}),/SOURCE_EPOCH_RIGHTS_OR_BYTES_REFUSED/);
 const a=r.admit(e);assert.throws(()=>r.admit(envelope(W,w(false))),/REPLAY_CONFLICT/);
 await assert.rejects(r.run(a.receipt_sha256,'tdsearch'),/NATIVE_OPERATION_UNSUPPORTED/);
});
test('tampered original bytes and coherent recipient mutation fail against independent receipt',async t=>{
 const {r,a,store}=await setup(t,T,td());const state=path.join(store,sha(T)+'.json');const bytes=fs.readFileSync(state);
 fs.writeFileSync(state,Buffer.from('evil'));await assert.rejects(r.run(a.receipt_sha256,'search',{query:'topology'}),/INDEPENDENT_RECEIPT_MISMATCH/);
 fs.writeFileSync(state,bytes);const obj=JSON.parse(bytes);obj.original=JSON.stringify(td()).replace('alpha beta','alpha OMEGA');obj.original_sha256=sha(obj.original);fs.writeFileSync(state,JSON.stringify(obj)+'\n');await assert.rejects(r.run(a.receipt_sha256,'search',{query:'topology'}),/INDEPENDENT_RECEIPT_MISMATCH/);
});
test('source witness withdrawal AFTER admission invalidates readback and all source operations, not just next input',async t=>{
 const {r,a,store}=await setup(t,W,w());const restart=openCandidate({route:W,store,nativeRoot});
 assert.equal((await restart.run(a.receipt_sha256,'topology')).typed_edges.length,1);
 assert.throws(()=>restart.withdraw(a.receipt_sha256,'NOT_AUTHORITY'),/WITHDRAWAL_WITNESS_REQUIRED/);
 assert.equal(restart.withdraw(a.receipt_sha256,'SYNTHETIC_OPERATOR_WITHDRAWAL_ONLY').status,'SYNTHETIC_SOURCE_WITHDRAWN');
 await assert.rejects(restart.run(a.receipt_sha256,'topology'),/SYNTHETIC_SOURCE_WITHDRAWN/);
 assert.throws(()=>restart.readback(a.receipt_sha256),/SYNTHETIC_SOURCE_WITHDRAWN/);
 const newReader=openCandidate({route:W,store,nativeRoot});assert.equal(newReader.state().withdrawn,true);assert.throws(()=>newReader.admit(envelope(W,w())),/WITHDRAWN_NO_READMISSION/);
});
test('original native code drift and unsupported recipient operation fail closed',async t=>{
 const {r,a}=await setup(t,T,td()),f=path.join(nativeRoot,'encyclopedia-native-reference-runtime.js'),bytes=fs.readFileSync(f);
 try{fs.appendFileSync(f,'\n//synthetic test drift');await assert.rejects(r.run(a.receipt_sha256,'search',{query:'topology'}),/ORIGINAL_NATIVE_CODE_DRIFT/)}finally{fs.writeFileSync(f,bytes)}
 await assert.rejects(r.run(a.receipt_sha256,'promote_to_scientific_theorem'),/NATIVE_OPERATION_UNSUPPORTED/);
});

test('syntactically admitted unknown graph family remains unclassified; no semantic invention',async t=>{
 const x=w();x.relations[0].graph='G_FAKE';const {r,a}=await setup(t,W,x);
 const result=await r.run(a.receipt_sha256,'topology');assert.equal(result.typed_edges[0].graph,'G_FAKE');
 assert.deepEqual(result.unclassified_graphs,['G_FAKE']);assert.equal(Object.hasOwn(result.documented_graph_semantics,'G_FAKE'),false);
});