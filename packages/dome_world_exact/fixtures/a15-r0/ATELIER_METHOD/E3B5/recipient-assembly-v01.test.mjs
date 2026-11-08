import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
// All B.5 research assertions enter through this product API. Other imports supply fixture data only.
import {openAssembly,SOURCE_SPECS} from './recipient-assembly-v01.mjs';
import {inventedFixture,hash} from './invented-fixtures.mjs';
const observations=[],refusals=[];
async function rejects(promise,pattern){await assert.rejects(promise,error=>{refusals.push({ordinal:refusals.length+1,code:error.code??null,message:error.message});if(pattern)assert.match(error.message,pattern);return true})}
const ROOT=path.dirname(fileURLToPath(import.meta.url));
const P='UNIVERSAL_ATELIER_B5_RESEARCH_SHELL',E='NEW_UNIVERSAL_ENCYCLOPEDIA_E3B3';
const rights='SYNTHETIC_LOCAL_ONLY';
function td(){
 const records=[['A','Tú puedes clonarme, pero no tienes mis genes.','collapse governance topology'],['B','Second reference','other source']].map(([id,label,body],i)=>({id:'R-FIXTURE-'+id,kind:'evidence',label,aliases:['governance'],evidence_class:'SYNTHETIC',visibility:'public',record:{body},supplement:{},links:i?[]:[{type:'cites_source',target:'R-FIXTURE-B'}],source_keys:['FIXTURE-TD'],origin:{json_pointer:'fixture:/'+id}}));
 return {manifest:{schema:'td613.encyclopedia.reference/v1',edition_version:'1.4',edition_source_commit:'synthetic-only',canonical_payload_sha256:'synthetic-only',facets:{}},records,directory:records.map(r=>({id:r.id,record_sha256:hash(JSON.stringify(r).replace(/</g,'\\u003c')),html_line:1,html_anchor:'#record='+r.id}))};
}
function w(){
 const posts=['a','b'].map((x,i)=>({source_id:'reddit:t3_fixture'+x,snapshot_id:'B5-SYNTHETIC',community:'r/Wendbine',source_text_stored:false,real_person_identity_adjudicated:false,canonical_url:'https://www.reddit.com/r/Wendbine/comments/fixture_'+x,declared_concepts:i?['beta']:['topology','alpha'],normalized_summary:'Synthetic governance topology',public_date:'2026-09-1'+i,time_precision:'DAY',technical_header:'Synthetic '+x,source_flags:[]}));
 return {meta:{schema:'wendbine-public-corpus-snapshot/v0.1',snapshot_id:'B5-SYNTHETIC',coverage:{admitted_source_count:2},scope:{surface:'synthetic',community:'r/Wendbine',private_google_group_admitted:false},rights:{full_post_bodies_copied:false},authority:{}},posts,relations:[{source_id:posts[0].source_id,graph:'G_D',from:'alpha',to:'beta',relation:'DEPENDS_ON',evidence_class:'SOURCE_EXPLICIT_PROGRAM'}]};
}
function src(name='spanish_exact'){
 const dir=path.resolve('tests/fixtures/e3b41-invented',name,'03-DERIVATIVES/text/zenodo');
 const documents=fs.readdirSync(dir).filter(f=>/^zenodo-\d+-file-0.md$/.test(f)).sort().map(f=>{
  const id=f.match(/zenodo-(\d+)/)[1],meta='zenodo-'+id+'-metadata.md',body=fs.readFileSync(path.join(dir,f)),metadata=fs.readFileSync(path.join(dir,meta));
  return {entity_id:'zenodo:'+id,body_base64:body.toString('base64'),metadata_base64:metadata.toString('base64'),body_sha256:hash(body),metadata_sha256:hash(metadata),body_path:'03-DERIVATIVES/text/zenodo/'+f,metadata_path:'03-DERIVATIVES/text/zenodo/'+meta,rights:'INVENTED_SOURCE_FREE'};
 });
 return {methods:inventedFixture(),routing:{synthetic_only:true,evidence_class:'SYNTHETIC_REPLAY_ONLY',documents}};
}
const plain=x=>JSON.parse(JSON.stringify(x));
async function lab(t,lane='PRODUCT_RECIPIENT'){
 const workspace=fs.mkdtempSync(path.join(os.tmpdir(),'e3b5-assembly-'));t.after(()=>fs.rmSync(workspace,{recursive:true,force:true}));
 const api=await openAssembly({workspace,lane,create:true});return {workspace,api,lane};
}
async function admit(l,family,fixture,id='FIXTURE-'+family){
 const spec=SOURCE_SPECS[family],bytes=Buffer.from(JSON.stringify(fixture));
 const envelope={action:'admit',family,product:spec.product,source_id:id,epoch:spec.epoch,source_pin:spec.pin,rights,evidence_class:'SYNTHETIC_REPLAY_ONLY',bytes,sha256:hash(bytes)};
 const stored=await l.api.request(envelope);return {...envelope,action:'execute',receipt:stored.receipt};
}
const run=(l,q,operation,params={})=>l.api.request({...q,action:'execute',operation,params});
const read=(l,q)=>l.api.request({...q,action:'readback'});
const loc=(l,q)=>path.join(l.workspace,'NAMESPACES',q.family,hash(Buffer.from(q.source_id)));
function replaceBody(f,index,text){const d=f.routing.documents[index],b=Buffer.from(text);d.body_base64=b.toString('base64');d.body_sha256=hash(b)}
function projection(r){return r.map(({explore_observation_id,source_id,source_title,source_created,raw_token,normalized_token,machine_candidates,observation_status,human_disposition_required})=>({explore_observation_id,source_id,source_title,source_created,raw_token,normalized_token,machine_candidates,observation_status,human_disposition_required}))}

test('B5 single shell initializes original empty seed, preserves profile bytes and 44 statuses across fresh restart',async t=>{
 const l=await lab(t),initial=await l.api.request({action:'status'});
 const profile=initial.original_profile;
 assert.equal(profile.source_count,0);assert.equal(profile.scientific_promotion_authority,false);assert.equal(Object.keys(profile.modules).length,44);
 assert.equal(initial.manifest.shell_is_original_seed_entry,false);assert.equal(initial.manifest.original_seed_connector,'NO_SOURCES_ADMITTED');
 const a=await admit(l,'TD613_REFERENCE',td()),b=await admit(l,'SRC_METHODS',src());
 l.api=await openAssembly({workspace:l.workspace,lane:l.lane,root_receipt:l.api.root_receipt});
 assert.equal((await run(l,a,'search',{query:'topology'})).result.hits[0].id,'R-FIXTURE-A');
 assert.equal((await run(l,b,'surface',{question:'Q_history'})).result.chosen,'PROVENANCE_REGISTRY');
 assert.deepEqual((await l.api.request({action:'status'})).original_profile,profile);
 assert.ok((await read(l,a)).bytes.equals(a.bytes));assert.equal((await read(l,a)).independent_durable_custody_credit,false);
 observations.push({case:'assembly-restart',status:await l.api.request({action:'status'})});
});
test('B5 assembled TD native/recipient/transport lanes match weighted retrieval, each record citation, integrity and explicit relations',async t=>{
 const fixture=td(),n=await lab(t,'SOURCE_NATIVE'),p=await lab(t),x=await lab(t,'TRANSPORT_ONLY');
 const a=await admit(n,'TD613_REFERENCE',fixture),b=await admit(p,'TD613_REFERENCE',fixture),c=await admit(x,'TD613_REFERENCE',fixture);
 for(const [op,params] of [['search',{query:'governance'}],['get',{id:'R-FIXTURE-A'}],['cite',{id:'R-FIXTURE-A'}],['verify',{}],['neighbors',{id:'R-FIXTURE-A'}],['context',{id:'R-FIXTURE-A'}]]){
  const native=await run(n,a,op,params),recipient=await run(p,b,op,params);assert.deepEqual(plain(recipient.result),plain(native.result));
  if(op==='search')assert.ok(recipient.result.hits[0].score>0);
  observations.push({case:'td-native-recipient-'+op,native,recipient});
 }
 const transported=await run(x,c,'search',{query:'governance'});assert.equal(transported.status,'UNEXECUTED');assert.equal(transported.execution_count,0);assert.ok(transported.bytes.equals(c.bytes));
 assert.notEqual((await p.api.request({action:'status'})).manifest.assembly_id,(await n.api.request({action:'status'})).manifest.assembly_id);
});
test('B5 separate NEW Encyclopedia executes original Wendbine query/compiler in matched lanes and never routes through Atelier',async t=>{
 const fixture=w(),n=await lab(t,'SOURCE_NATIVE'),p=await lab(t),x=await lab(t,'TRANSPORT_ONLY');
 const a=await admit(n,'WENDBINE_PUBLIC',fixture),b=await admit(p,'WENDBINE_PUBLIC',fixture),c=await admit(x,'WENDBINE_PUBLIC',fixture);
 for(const [op,params] of [['lexical',{query:'topology'}],['semantic',{query:'topology'}],['topology',{}],['recent',{}],['resolve',{id:'reddit:t3_fixturea'}]]){const native=await run(n,a,op,params),recipient=await run(p,b,op,params);assert.deepEqual(plain(native.result),plain(recipient.result));observations.push({case:'wendbine-native-recipient-'+op,native,recipient})}
 assert.equal((await run(p,b,'topology')).result.typed_edges[0].source_id,'reddit:t3_fixturea');
 await rejects(run(p,{...b,product:P},'topology'),/ROUTE_EPOCH_RIGHTS_REFUSED/);
 assert.equal((await run(x,c,'topology')).execution_count,0);assert.equal((await p.api.request({action:'status'})).manifest.historical_encyclopedia,false);
});
test('B5 original Python vs assembled SRC recipient vs transport: all four frozen native grammar fixtures, raw Spanish and dates',async t=>{
 for(const name of ['native_plain_later','native_plain_preexisting','colon_variant_negative','spanish_exact']){
  const f=src(name),n=await lab(t,'SOURCE_NATIVE'),p=await lab(t),x=await lab(t,'TRANSPORT_ONLY');
  const a=await admit(n,'SRC_METHODS',f),b=await admit(p,'SRC_METHODS',f),c=await admit(x,'SRC_METHODS',f);
  const native=await run(n,a,'explore'),recipient=await run(p,b,'explore');
  assert.deepEqual(projection(recipient.result.observations),projection(native.result.native.explore));
  const keys=['signature_observation_id','normalized_signature','manifestation_count','observation_status','members','coordinate_class','coordinate_inference_permitted'];
  const sig=rows=>rows.map(r=>Object.fromEntries(keys.map(k=>[k,r[k]])));assert.deepEqual(sig(recipient.result.signatures),sig(native.result.native.signatures));
  assert.equal(recipient.result.grammar_class,'ORIGINAL_SRC_EXPLORE_SENTENCE');assert.equal(native.result.write_flag,false);
  if(name==='spanish_exact'){assert.match(Buffer.from(f.routing.documents[0].body_base64,'base64').toString(),/Tú puedes clonarme/);assert.equal(recipient.result.scientific_identity,false)}
  if(name==='colon_variant_negative')assert.equal(recipient.status,'EXECUTED_ZERO');
  const transport=await run(x,c,'explore');assert.equal(transport.execution_count,0);assert.equal(transport.status,'UNEXECUTED');
  observations.push({case:name,native,recipient,transport:{status:transport.status,sha256:transport.sha256,execution_count:0}});
 }
});
test('B5 public mixed research trace actually retrieves, cites, selects a surface and traverses two typed edges while cross bridge stays HELD',async t=>{
 const l=await lab(t),a=await admit(l,'TD613_REFERENCE',td()),b=await admit(l,'SRC_METHODS',src());
 const result=await l.api.request({action:'trace',td:a,src:b,query:'governance',question:'Q_history',route:{from:'A',to:'C',graph:'G_CANON'}});
 assert.equal(result.status,'BOUNDED_TWO_ORIGIN_TRACE');assert.equal(result.envelopes[0].citation.result.id,'R-FIXTURE-A');
 assert.equal(result.envelopes[1].surface.result.chosen,'PROVENANCE_REGISTRY');assert.deepEqual(result.envelopes[1].route.result.paths[0].edges,['edge-AB','edge-BC']);
 assert.equal(result.cross_bridge.status,'HELD');assert.equal(result.cross_bridge.candidate,'CANDIDATE_ANALOGY');assert.equal(result.cross_bridge.direct_graph_edge,false);assert.equal(result.cross_bridge.novel_result,false);
 assert.notEqual(result.envelopes[0].retrieval.source_sha256,result.envelopes[1].surface.source_sha256);assert.ok(result.execution_count>=4);observations.push({case:'two-origin-trace',result});
});
test('B5 lexical/signature false twins across sources refuse identity, genealogy and causation, unqualified mixed query abstains',async t=>{
 const l=await lab(t),a=await admit(l,'TD613_REFERENCE',td()),b=await admit(l,'SRC_METHODS',src());
 const tdResult=await run(l,a,'search',{query:'"Tú puedes clonarme"'}),srcResult=await run(l,b,'explore');
 assert.ok(tdResult.result.hits.length);assert.equal(srcResult.result.signatures[0].coordinate_inference_permitted,false);
 const held=await l.api.request({action:'execute',query:'Tú puedes clonarme'});assert.equal(held.status,'HELD');assert.equal(held.execution_count,0);
 for(const extra of [{promote_direct:true},{genealogy:true},{causation:true}])await rejects(run(l,b,'typed_route',{from:'A',to:'C',...extra}),/DIRECT_LIFT_REFUSED/);
});
test('B5 source/route/epoch/rights/receipt swaps and forged citation fail across namespaces and lanes',async t=>{
 const l=await lab(t),a=await admit(l,'TD613_REFERENCE',td()),b=await admit(l,'SRC_METHODS',src()),n=await lab(t,'SOURCE_NATIVE'),foreign=await admit(n,'TD613_REFERENCE',td());
 for(const altered of [{...a,family:'SRC_METHODS'},{...a,epoch:'wrong'},{...a,rights:'PUBLIC'},{...a,receipt:b.receipt},{...a,receipt:foreign.receipt},{...a,receipt:'0'.repeat(64)},{...a,source_id:b.source_id}])await rejects(run(l,altered,'search',{query:'governance'}));
 const citation=(await run(l,a,'cite',{id:'R-FIXTURE-A'})).result;
 await rejects(l.api.request({...a,operation:'get',params:{id:'R-FIXTURE-A'},citation:{...citation,record_sha256:'0'.repeat(64)}}),/CITATION_BINDING_REFUSED/);
 await rejects(l.api.request({...b,operation:'surface',params:{question:'Q_history'},citation}),/CITATION_ROUTE_REFUSED/);
 assert.equal((await l.api.request({...a,operation:'get',params:{id:'R-FIXTURE-A'},citation})).result.id,'R-FIXTURE-A');
});
test('B5 exact replay and multiple concurrent identities survive restart; global source ID collisions are refused',async t=>{
 const l=await lab(t),a=await admit(l,'TD613_REFERENCE',td(),'FIXTURE-SHARED'),f=td();f.records[0].label='different';f.directory[0].record_sha256=hash(JSON.stringify(f.records[0]));
 const b=await admit(l,'TD613_REFERENCE',f,'FIXTURE-TD-TWO');
 assert.equal((await l.api.request({...a,action:'admit'})).status,'EXACT_REPLAY');
 await rejects(admit(l,'SRC_METHODS',src(),'FIXTURE-SHARED'),/CROSS_NAMESPACE_SOURCE_ID_COLLISION/);
 l.api=await openAssembly({workspace:l.workspace,lane:l.lane,root_receipt:l.api.root_receipt});
 assert.notEqual((await run(l,a,'get',{id:'R-FIXTURE-A'})).result.label,(await run(l,b,'get',{id:'R-FIXTURE-A'})).result.label);
 await rejects(l.api.request({...a,action:'admit',bytes:b.bytes,sha256:b.sha256}),/REPLAY_CONFLICT/);
});
test('B5 withdrawal disables only its source and a dependent trace, retained SRC and Wendbine remain executable',async t=>{
 const l=await lab(t),a=await admit(l,'TD613_REFERENCE',td()),b=await admit(l,'SRC_METHODS',src()),c=await admit(l,'WENDBINE_PUBLIC',w());
 await l.api.request({...a,action:'withdraw',authority:'SYNTHETIC_OPERATOR_WITHDRAWAL_ONLY'});
 await rejects(run(l,a,'search',{query:'governance'}),/SOURCE_WITHDRAWN/);
 await rejects(l.api.request({action:'trace',td:a,src:b,query:'governance',question:'Q_history',route:{from:'A',to:'C'}}),/SOURCE_WITHDRAWN/);
 assert.ok((await run(l,b,'explore')).result.observations.length);assert.equal((await run(l,c,'topology')).result.typed_edges.length,1);
 await rejects(l.api.request({...a,action:'admit'}),/SOURCE_WITHDRAWN/);
});
test('B5 corrupt receipt/body, partial persisted state, source namespace injection and symlink substitution fail closed',async t=>{
 for(const mutation of ['receipt','body','missing','injection','symlink']){
  const l=await lab(t),a=await admit(l,'TD613_REFERENCE',td()),dir=loc(l,a);
  if(mutation==='receipt')fs.writeFileSync(path.join(dir,'receipt.json'),'{');
  if(mutation==='body')fs.appendFileSync(path.join(dir,'original.bin'),' ');
  if(mutation==='missing')fs.unlinkSync(path.join(dir,'receipt.json'));
  if(mutation==='injection'){const r=JSON.parse(fs.readFileSync(path.join(dir,'receipt.json')));r.family='SRC_METHODS';fs.writeFileSync(path.join(dir,'receipt.json'),JSON.stringify(r))}
  if(mutation==='symlink'){fs.renameSync(path.join(dir,'original.bin'),path.join(dir,'copy'));fs.symlinkSync(path.join(dir,'copy'),path.join(dir,'original.bin'))}
  await rejects(run(l,a,'search',{query:'governance'}));
  await rejects(l.api.request({...a,action:'admit'}));
 }
});
test('B5 interrupted pending admission refuses reconstruction; foreign root anchor and original profile mutation refuse reopening',async t=>{
 const l=await lab(t),id='FIXTURE-INTERRUPTED',base=path.join(l.workspace,'NAMESPACES','TD613_REFERENCE');fs.mkdirSync(base);fs.mkdirSync(path.join(base,hash(Buffer.from(id))+'.pending'));
 await rejects(admit(l,'TD613_REFERENCE',td(),id),/INTERRUPTED_ADMISSION_HELD/);
 await rejects(openAssembly({workspace:l.workspace,lane:l.lane,root_receipt:'0'.repeat(64)}),/ROOT_RECEIPT/);
 const profile=path.join(l.workspace,'ATELIER/UNIVERSAL_ATELIER_E3B3/ATELIER_PROFILE.json');fs.appendFileSync(profile,' ');
 await rejects(l.api.request({action:'status'}),/ORIGINAL_PROFILE_MUTATION/);
 await rejects(openAssembly({workspace:l.workspace,lane:l.lane,root_receipt:l.api.root_receipt}),/ORIGINAL_PROFILE_MUTATION/);
});
test('B5 unknown graph semantics, unadmitted source relations and private source rights never gain bridge credit',async t=>{
 for(const mutate of [f=>f.methods.edges[0].source_id='FOREIGN',f=>f.methods.edges[0].graph='G_GHOST',f=>f.routing.documents[0].rights='PRIVATE',f=>f.routing.documents[0].body_sha256='0'.repeat(64),f=>f.routing.documents[0].body_path='../elsewhere']){
  const l=await lab(t),f=src();mutate(f);await rejects(admit(l,'SRC_METHODS',f));
 }
 const l=await lab(t),f=w();f.relations[0].graph='G_FAKE';const a=await admit(l,'WENDBINE_PUBLIC',f);assert.deepEqual((await run(l,a,'topology')).result.unclassified_graphs,['G_FAKE']);
 const g=w();g.relations[0].source_id='unadmitted';const b=await admit(l,'WENDBINE_PUBLIC',g,'FIXTURE-W-BAD');await rejects(run(l,b,'topology'),/unadmitted/);
 const s=await admit(l,'SRC_METHODS',src());await rejects(run(l,s,'typed_route',{from:'A',to:'C',graph:'G_GHOST'}),/UNKNOWN_GRAPH_SEMANTICS/);
});
test('B5 zero, unexecuted, absent and held are distinguishable; unavailable operations refuse',async t=>{
 const l=await lab(t),a=await admit(l,'TD613_REFERENCE',td()),b=await admit(l,'SRC_METHODS',src());
 assert.equal((await run(l,a,'search',{query:'notpresentzzzz'})).status,'EXECUTED_ZERO');
 assert.equal((await run(l,a,'get',{id:'R-FIXTURE-NONE'})).status,'ABSENT');
 assert.equal((await run(l,b,'typed_route',{from:'A',to:'NONE'})).status,'EXECUTED_ZERO');
 assert.equal((await run(l,b,'three_stratum')).status,'UNEXECUTED');
 assert.equal((await l.api.request({action:'execute'})).status,'HELD');
 await rejects(run(l,b,'promote_theory'),/UNAVAILABLE_OPERATION/);
 const state=await l.api.request({action:'status'});assert.deepEqual(state.src_classification,{executed:4,partial:7,designed:1,original_corpus_parity:0});assert.equal(state.em_readiness.families,10);assert.equal(state.em_readiness.executed,0);assert.equal(state.six_arm_study,'UNEXECUTED');
});
test('B5 numeric punctuation, lexical ambiguity and unavailable history surface survive assembled native comparison',async t=>{
 const f=src('native_plain_later');replaceBody(f,0,'SR - Keep the trace. Preface. Explore 2 governance. Explore + governance.');
 f.routing.documents[1].metadata_base64=Buffer.from(JSON.stringify({created:'invalid',metadata:{title:'2 Governance'}})).toString('base64');f.routing.documents[1].metadata_sha256=hash(Buffer.from(f.routing.documents[1].metadata_base64,'base64'));
 const twin={...f.routing.documents[1],entity_id:'zenodo:3',body_path:'03-DERIVATIVES/text/zenodo/zenodo-3-file-0.md',metadata_path:'03-DERIVATIVES/text/zenodo/zenodo-3-metadata.md'};f.routing.documents.push(twin);
 f.methods.surfaces=f.methods.surfaces.filter(s=>s.surface!=='PROVENANCE_REGISTRY');f.methods.edges=[];f.methods.typed_edges=[];
 const n=await lab(t,'SOURCE_NATIVE'),p=await lab(t),a=await admit(n,'SRC_METHODS',f),b=await admit(p,'SRC_METHODS',f);
 const native=await run(n,a,'explore'),recipient=await run(p,b,'explore');assert.deepEqual(projection(recipient.result.observations),projection(native.result.native.explore));
 assert.deepEqual(recipient.result.observations.map(o=>o.raw_token),['+ governance','2 governance']);assert.equal(recipient.result.observations[0].machine_candidates.length,2);assert.equal(recipient.result.observations[0].observation_status,'UNRESOLVED_MACHINE');
 assert.equal((await run(p,b,'surface',{question:'Q_history'})).result.status,'NO_SUFFICIENT_SURFACE');
 observations.push({case:'numeric-unresolved-twins',native,recipient});
});
test('B5 separately spawned process reopens caller-bound source and distinguishes custody twins without inferred shared origin',async t=>{
 const l=await lab(t),a=await admit(l,'TD613_REFERENCE',td(),'FIXTURE-TWIN-ONE'),b=await admit(l,'TD613_REFERENCE',td(),'FIXTURE-TWIN-TWO');
 const one=await run(l,a,'search',{query:'governance'}),two=await run(l,b,'search',{query:'governance'});
 assert.equal(one.source_sha256,two.source_sha256);assert.notEqual(one.source_id,two.source_id);assert.notEqual(one.source_receipt,two.source_receipt);assert.equal(one.scientific_identity,false);
 const code="import {openAssembly} from './packages/dome_world_exact/fixtures/a15-r0/ATELIER_METHOD/E3B5/recipient-assembly-v01.mjs';let t='';for await(const b of process.stdin)t+=b;const x=JSON.parse(t),a=await openAssembly(x.options);console.log(JSON.stringify(await a.request(x.request)));";
 const child=spawnSync(process.execPath,['--input-type=module','-e',code],{encoding:'utf8',input:JSON.stringify({options:{workspace:l.workspace,lane:l.lane,root_receipt:l.api.root_receipt},request:{...a,bytes:undefined,operation:'search',params:{query:'governance'}}}),timeout:15000});
 assert.equal(child.status,0,child.stderr);assert.deepEqual(JSON.parse(child.stdout).result,plain(one.result));
 const noProvenance={...a};delete noProvenance.source_id;const held=await run(l,noProvenance,'search',{query:'governance'});assert.equal(held.status,'HELD');assert.equal(held.execution_count,0);
 observations.push({case:'custody-twins',one,two,restarted:JSON.parse(child.stdout)});
});
test('B5 assembled role compilation actually invokes pinned semantic engine and preserves mixed contextual status and non-lift',async t=>{
 const l=await lab(t),a=await admit(l,'SRC_METHODS',src());
 const result=await run(l,a,'compile_roles');
 assert.equal(result.result.model.role_count,2);assert.equal(result.result.trace.routes[0].hop_count,2);
 assert.equal(result.result.trace.routes[0].direct_relation_admitted,false);assert.equal(result.result.trace.routes[0].scientific_causality_admitted,false);
 assert.equal(result.result.model.passes[1].roles[0].adjudication_status,'CANDIDATE');
 const bad=src();bad.methods.role_assertions[0].atelier_snapshot_id='wrong';const b=await admit(l,'SRC_METHODS',bad,'FIXTURE-SRC-ROLE-BAD');
 await rejects(run(l,b,'compile_roles'),/ROLE_EPOCH_OR_SEAL_CONTRACT/);
 observations.push({case:'source-method-role-compilation',result});
});
test.after(()=>{if(process.env.TD613_E3B5_EVIDENCE_OUTPUT)fs.writeFileSync(process.env.TD613_E3B5_EVIDENCE_OUTPUT,JSON.stringify({schema:'td613.e3b5-executed-observations/v1',evidence_class:'SYNTHETIC_REPLAY_ONLY',empirical_replications:0,negative_control_refusals:refusals,observations},null,2)+'\n')});
