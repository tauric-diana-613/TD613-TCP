import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';
import {fileURLToPath,pathToFileURL} from 'node:url';import {createHash} from 'node:crypto';import {spawnSync} from 'node:child_process';
import {openCandidateProduct,ATELIER,ENCYCLOPEDIA} from '../E3B8/product-entry-v01.mjs';
import {REQUEST_LIMITS} from '../E3B8/request-data-v01.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),repo=path.resolve(here,'../../../../../..'),entry=path.resolve(here,'../E3B8');
// Native VM results have realm-local prototypes; compare their complete JSON value.
const equalValue=(actual,expected)=>assert.equal(JSON.stringify(actual),JSON.stringify(expected));
const sha=b=>createHash('sha256').update(b).digest('hex'),observations=[],refusals=[];
const catalog=JSON.parse(fs.readFileSync(path.join(entry,'fixture-catalog.json')));
const cases=[['TD_REFERENCE','search',{query:'governance'}],['SRC_SPANISH_EXACT','typed_route',{from:'A',to:'C',graph:'G_CANON'}],['W_PUBLIC','topology',{}],['EM_METHODS','WORK_IDENTITY_SPLIT_COLLAPSE_SENSITIVITY',{assignment:{split_supported:true}}]];
async function lab(t){const workspace=fs.mkdtempSync(path.join(os.tmpdir(),'b91-'));t.after(()=>fs.rmSync(workspace,{recursive:true,force:true}));return {workspace,api:await openCandidateProduct({workspace,create:true})}}
async function proposal(l,id,source_id){const f=catalog.fixtures.find(x=>x.fixture_id===id),d=(await l.api.request({action:'describeFixtures'})).find(x=>x.fixture_id===id);return {action:'stageSyntheticFixture',fixture_id:id,source_id:source_id??(id==='EM_METHODS'?'FIXTURE-EM-B91':'FIXTURE-'+id),product_id:d.product_id,epoch:d.epoch,rights:d.rights,evidence_class:d.evidence_class,sha256:f.sha256,bytes:Buffer.from(f.bytes_base64,'base64')}}
async function stage(l,id,source_id){const q=await proposal(l,id,source_id),r=await l.api.request(q);return {q,bound:{product_id:r.product_id,source_id:r.source_id,receipt:r.receipt},r}}
const execute=(l,a,operation='search',params={query:'governance'},extra={})=>l.api.request({action:'execute',...a.bound,operation,params,...extra});
async function refuse(label,p,pattern=/B91_|B8_/){await assert.rejects(p,e=>{assert.match(e.code??e.message,pattern);refusals.push({label,code:e.code??e.message});return true})}
const late=(object,key,hit)=>Object.defineProperty(object,key,{enumerable:true,configurable:true,get(){hit();throw Error('CALLER_GETTER_EXECUTED')}});
function envelope(r,a){assert.equal(r.product_id,a.bound.product_id);assert.equal(r.source_id,a.bound.source_id);if('source_receipt'in r)assert.equal(r.source_receipt,a.bound.receipt);assert.equal(r.source_authorized,false);assert.equal(r.scientifically_validated,false);assert.equal(r.independent_durable_custody_credit,false)}

test('B9 UNCHANGED: exact archived reproducer now retains F01 binding and stops at F02 typed refusal',t=>{
 const original=fs.readFileSync(path.join(here,'evidence/minimal-reproducer.mjs'));assert.equal(sha(original),'16282510387a92fdc0b24030a311321537233431a65b9136970222ea2cfa4a66');
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'b91-original-'));t.after(()=>fs.rmSync(temp,{recursive:true,force:true}));const script=path.join(temp,'minimal-reproducer.mjs');fs.writeFileSync(script,original);
 const r=spawnSync(process.execPath,[script,repo],{encoding:'utf8',timeout:20000});assert.equal(r.status,1);const f=JSON.parse(r.stdout);assert.equal(f.finding,'B9-F01');assert.equal(f.actual_product,f.expected_product);assert.equal(f.actual_receipt,f.expected_receipt);assert.equal(f.real_source_authority,false);assert.match(r.stderr,/B91_ACCESSOR_REFUSED/);
 observations.push({case:'unchanged-B9',script_sha256:sha(original),exit:r.status,stdout:r.stdout,stderr:r.stderr,interpretation:'Original script has no F02 catch; exit 1 is recorded, not relabeled as a successful original-script exit.'});
});
test('F02: array getter refused with zero getter invocations and zero state reads or delegation',async t=>{
 const l=await lab(t),a=await stage(l,'TD_REFERENCE');let getters=0,reads=0;const options=[];Object.defineProperty(options,'0',{enumerable:true,get(){getters++;return 0}});
 const original=fs.readFileSync;fs.readFileSync=(...args)=>{reads++;return original(...args)};
 try{await refuse('original array accessor',execute(l,a,'search',{query:'governance',options}),/B91_ACCESSOR_REFUSED/)}finally{fs.readFileSync=original}
 assert.equal(getters,0);assert.equal(reads,0);observations.push({case:'F02-rejected-before-state-or-delegate',getter_calls:getters,state_reads:reads});
});
for(const [id,operation,params]of cases)test('F01: pending execute owns complete request and parameters: '+id,async t=>{
 const l=await lab(t),a=await stage(l,id),expected=await execute(l,a,operation,structuredClone(params));
 let getters=0;const q={action:'execute',...a.bound,operation,params:structuredClone(params)},pending=l.api.request(q);
 q.action='admitRealSource';q.product_id=q.product_id===ATELIER?ENCYCLOPEDIA:ATELIER;q.source_id='FIXTURE-FOREIGN';q.receipt='UNVALIDATED_RECEIPT';q.operation='UNAVAILABLE';
 for(const k of Object.keys(q.params))late(q.params,k,()=>getters++);late(q,'params',()=>getters++);late(q,'citation',()=>getters++);
 const r=await pending;envelope(r,a);equalValue(r.delegate,expected.delegate);assert.equal(getters,0);observations.push({case:'pending-execute-'+id,expected_binding:a.bound,result:r,getter_calls:getters});
});
for(const [id]of cases)test('F01: staging owns mutable Buffer, identity and rights before suspension: '+id,async t=>{
 const l=await lab(t),q=await proposal(l,id),expected=Buffer.from(q.bytes),expectedID=q.source_id,expectedProduct=q.product_id;
 const pending=l.api.request(q);q.bytes.fill(0);q.source_id='FIXTURE-EM-FOREIGN';q.product_id='FORGED';q.sha256='0'.repeat(64);q.epoch='FORGED';q.rights='PUBLIC';q.evidence_class='REAL';q.fixture_id='FORGED';
 const r=await pending;assert.equal(r.source_id,expectedID);assert.equal(r.product_id,expectedProduct);assert.equal(r.independent_durable_custody_credit,false);
 const read=await l.api.request({action:'readback',source_id:r.source_id,product_id:r.product_id,receipt:r.receipt});assert.deepEqual(read.bytes,expected);assert.equal(read.sha256,sha(expected));observations.push({case:'pending-staging-'+id,expected_sha256:sha(expected),result:r,readback_sha256:read.sha256});
});
test('F01: readback and withdrawal keep original binding; unrelated source survives',async t=>{
 const l=await lab(t),a=await stage(l,'TD_REFERENCE'),b=await stage(l,'W_PUBLIC');let getters=0;
 const q={action:'readback',...a.bound},pending=l.api.request(q);for(const k of ['action','source_id','product_id','receipt'])late(q,k,()=>getters++);
 const r=await pending;assert.equal(r.source_id,a.bound.source_id);assert.equal(r.product_id,a.bound.product_id);assert.equal(r.sha256,a.q.sha256);assert.equal(r.independent_durable_custody_credit,false);
 const w={action:'withdraw',...a.bound},wp=l.api.request(w);Object.assign(w,b.bound);late(w,'receipt',()=>getters++);const wr=await wp;assert.equal(wr.catalog_fixture_id,'TD_REFERENCE');
 await refuse('original withdrawn',l.api.request({action:'readback',...a.bound}),/B8_FIXTURE_WITHDRAWN/);assert.equal((await l.api.request({action:'readback',...b.bound})).sha256,b.q.sha256);assert.equal(getters,0);observations.push({case:'readback-and-withdraw-binding',getter_calls:getters,withdrawal:wr});
});
test('F01: nested trace bindings, route and strings are snapshotted before pending execution',async t=>{
 const l=await lab(t),td=await stage(l,'TD_REFERENCE'),src=await stage(l,'SRC_SPANISH_EXACT'),em=await stage(l,'EM_METHODS');
 const q={action:'threeOriginTrace',product_id:ATELIER,td:{...td.bound},src:{...src.bound},em:{...em.bound},query:'governance',question:'Q_history',route:{from:'A',to:'C',graph:'G_CANON'}};
 const expected=await l.api.request(structuredClone(q)),pending=l.api.request(q);let getters=0;
 for(const field of ['td','src','em']){q[field].source_id='FIXTURE-FOREIGN';q[field].receipt='FORGED';late(q[field],'product_id',()=>getters++);late(q,field,()=>getters++)}late(q.route,'to',()=>getters++);q.query='ABSENT';q.question='ABSENT';
 const r=await pending;equalValue(r,expected);assert.equal(r.cross_bridge.status,'HELD');assert.equal(r.cross_bridge.real_source_admitted,false);assert.equal(getters,0);observations.push({case:'owned-three-origin-trace',result:r,getter_calls:getters});
});
for(const [id,record,op,params]of [['TD_REFERENCE','R-FIXTURE-A','search',{query:'governance'}],['EM_METHODS','FIXTURE-D3','FORMAL_OPERATOR_AND_AUTHORITY_LAUNDERING',{}]])test('F01: issued citation remains usable and owned across await: '+id,async t=>{
 const l=await lab(t),a=await stage(l,id),citation=(await execute(l,a,'cite',{id:record})).citation;
 assert.equal(Object.getPrototypeOf(citation.native_citation),Object.prototype);const expected=await execute(l,a,op,params,{citation:structuredClone(citation)});
 const q={action:'execute',...a.bound,operation:op,params:structuredClone(params),citation:structuredClone(citation)},pending=l.api.request(q);let getters=0;
 for(const k of Object.keys(q.citation.native_citation))late(q.citation.native_citation,k,()=>getters++);q.citation.source_id='FIXTURE-FOREIGN';q.citation.source_receipt='FORGED';late(q,'citation',()=>getters++);
 const r=await pending;equalValue(r.delegate,expected.delegate);envelope(r,a);assert.equal(getters,0);
 const falseCitation=structuredClone(citation);falseCitation.native_citation.id='FORGED';await refuse('false native citation '+id,execute(l,a,op,params,{citation:falseCitation}),/CITATION_BINDING/);
 observations.push({case:'owned-citation-'+id,getter_calls:getters,citation,result:r});
});
test('DESCRIPTORS: nested accessors, hidden and symbol keys, custom arrays and objects refuse without evaluation',async t=>{
 const l=await lab(t),a=await stage(l,'TD_REFERENCE');let getters=0;const hit=()=>{getters++;throw Error('GETTER')};
 const getter=[];Object.defineProperty(getter,'0',{enumerable:true,get:hit});
 const setter=[];Object.defineProperty(setter,'0',{enumerable:true,set:hit});
 const ownForEach=[1];Object.defineProperty(ownForEach,'forEach',{enumerable:true,get:hit});
 const hidden=[1];Object.defineProperty(hidden,'extra',{value:'hidden'});const symbol=[1];symbol[Symbol('hidden')]=1;
 const sparse=Array(2),extra=[1];extra.extra=1;const exotic=[1];Object.setPrototypeOf(exotic,null);
 const hiddenObject={};Object.defineProperty(hiddenObject,'hidden',{get:hit});const symbolObject={[Symbol('hidden')]:1};
 const cycle={};cycle.self=cycle;const pollution=JSON.parse('{"__proto__":{"approved":true}}');
 for(const [label,options]of Object.entries({getter,setter,ownForEach,hidden,symbol,sparse,extra,exotic,hiddenObject,symbolObject,cycle,pollution,date:new Date(),map:new Map(),nullPrototype:Object.create(null),typed:new Uint8Array([1]),nestedBuffer:Buffer.from('x')}))await refuse(label,execute(l,a,'search',{query:'governance',options}));
 for(const field of ['citation','params']){const q={action:'execute',...a.bound,operation:'search',params:{query:'governance'}};Object.defineProperty(q,field,{enumerable:true,get:hit});await refuse('top-'+field,l.api.request(q),/B91_ACCESSOR_REFUSED/)}
 const trace={action:'threeOriginTrace',product_id:ATELIER,td:{receipt:'x'},src:{},em:{},route:{}};Object.defineProperty(trace.td,'source_id',{enumerable:true,get:hit});await refuse('nested trace binding',l.api.request(trace),/B91_ACCESSOR_REFUSED/);
 assert.equal(getters,0);observations.push({case:'descriptor-negative-controls',getter_calls:getters});
});
test('BOUNDS: finite scalar, cycle, depth, node, key, array and string limits fail closed',async t=>{
 const l=await lab(t),a=await stage(l,'TD_REFERENCE');
 for(const value of [undefined,NaN,Infinity,-Infinity,-0,1n,Symbol('x'),()=>0])await refuse('unsupported scalar '+typeof value,execute(l,a,'search',{query:'governance',options:value}),/B91_/);
 let deep={};for(let i=0;i<REQUEST_LIMITS.maxDepth+1;i++)deep={child:deep};
 const wide=Object.fromEntries(Array.from({length:129},(_,i)=>['k'+i,0])),nodes=Array.from({length:100},()=>Array(100).fill(1));
 for(const [label,options,code]of [['depth',deep,'DEPTH'],['keys',wide,'OBJECT_KEY'],['array',Array(1025).fill(0),'ARRAY'],['huge sparse',Array(2**30),'ARRAY'],['nodes',nodes,'NODE'],['string','x'.repeat(65537),'STRING']])await refuse(label,execute(l,a,'search',{query:'governance',options}),new RegExp('B91_'+code+'_LIMIT'));
 const frozen=Object.freeze({action:'execute',...Object.freeze({...a.bound}),operation:'search',params:Object.freeze({query:'governance',options:Object.freeze([0,Object.freeze({tag:'finite'})])})});assert.equal((await l.api.request(frozen)).status,'EXECUTED');
 observations.push({case:'bounded-value-tree',limits:REQUEST_LIMITS,frozen_plain_data:'EXECUTED'});
});
test('NESTED PUBLIC FIELDS: accessors in citation ancestry, trace route and binding arrays never execute',async t=>{
 const l=await lab(t),a=await stage(l,'TD_REFERENCE'),citation=(await execute(l,a,'cite',{id:'R-FIXTURE-A'})).citation;let getters=0;
 function hostileArray(){const x=[];Object.defineProperty(x,'0',{enumerable:true,get(){getters++;throw Error('GETTER')}});return x}
 const c=structuredClone(citation);c.native_citation.source_ids=hostileArray();await refuse('citation ancestry accessor',execute(l,a,'search',{query:'governance'},{citation:c}),/B91_ACCESSOR_REFUSED/);
 for(const field of ['td','src','em','route']){const q={action:'threeOriginTrace',product_id:ATELIER,td:{...a.bound},src:{...a.bound},em:{...a.bound},route:{from:'A',to:'C'}};q[field].nested=[{options:hostileArray()}];await refuse('trace '+field,l.api.request(q),/B91_ACCESSOR_REFUSED/)}
 const q=await proposal(l,'W_PUBLIC');Object.defineProperty(q,'bytes',{enumerable:true,get(){getters++;throw Error('GETTER')}});await refuse('staging byte accessor',l.api.request(q),/B91_ACCESSOR_REFUSED/);
 assert.equal(getters,0);observations.push({case:'nested-public-fields',getter_calls:getters});
});
test('PENDING PAIR: simultaneous requests retain distinct source, method and receipt identities',async t=>{
 const l=await lab(t),td=await stage(l,'TD_REFERENCE'),em=await stage(l,'EM_METHODS');
 const one={action:'execute',...td.bound,operation:'get',params:{id:'R-FIXTURE-A'}},two={action:'execute',...em.bound,operation:'WORK_IDENTITY_SPLIT_COLLAPSE_SENSITIVITY',params:{assignment:{split_supported:true}}};
 const p=l.api.request(one),q=l.api.request(two);Object.assign(one,em.bound);one.params.id='R-FIXTURE-MISSING';Object.assign(two,td.bound);two.params.assignment.split_supported=false;
 const [a,b]=await Promise.all([p,q]);envelope(a,td);envelope(b,em);assert.equal(a.delegate.result.id,'R-FIXTURE-A');assert.equal(b.delegate.result.selected_counterfactual_count,5);observations.push({case:'pending-distinct-pair',td:a,em:b});
});
test('BUFFERS: oversized, shared, decorated and accessor-bearing byte buffers refuse before copying or staging',async t=>{
 const l=await lab(t),q=await proposal(l,'TD_REFERENCE');let getters=0;
 const extra=Buffer.from(q.bytes);extra.extra=true;const accessor=Buffer.from(q.bytes);Object.defineProperty(accessor,'source_path',{enumerable:true,get(){getters++;throw Error('GETTER')}});
 const shared=Buffer.from(new SharedArrayBuffer(q.bytes.length));const proto=Buffer.from(q.bytes);Object.setPrototypeOf(proto,Uint8Array.prototype);
 for(const [label,bytes]of [['oversized',Buffer.alloc(262145)],['shared',shared],['decorated',extra],['accessor',accessor],['prototype',proto],['typed',new Uint8Array(q.bytes)]])await refuse(label,l.api.request({...q,bytes}),/B91_/);
 assert.equal(getters,0);assert.equal(fs.existsSync(path.join(l.workspace,'ENGINE')),false);observations.push({case:'buffer-negative-controls',getter_calls:getters,engine_created:false});
});
test('PROXY: Node-recognized root, nested, array and Buffer proxies refuse with zero handler traps',async t=>{
 const l=await lab(t),a=await stage(l,'TD_REFERENCE');let traps=0;const handler=new Proxy({},{get(){traps++;throw Error('PROXY_TRAP')}});
 await refuse('proxy-root',l.api.request(new Proxy({action:'status'},handler)),/B91_PROXY_REFUSED/);
 for(const value of [{},[],Buffer.from('x')])await refuse('proxy-nested',execute(l,a,'search',{query:'governance',options:new Proxy(value,handler)}),/B91_PROXY_REFUSED/);
 const revoked=Proxy.revocable({},{});revoked.revoke();await refuse('revoked-proxy',execute(l,a,'search',{query:'governance',options:revoked.proxy}),/B91_PROXY_REFUSED/);assert.equal(traps,0);
 observations.push({case:'node-proxy-refusal',handler_traps:traps,security_ceiling:'Trusted Node intrinsics only; no OS or hostile same-process runtime isolation.'});
});
test('DENY FIRST: nine real classes and eleven forbidden actions never inspect supplied path, body or profile',async t=>{
 const l=await lab(t),classes=(await l.api.request({action:'inspectAdmissionReadiness'})).source_classes;let getters=0;
 const actions=['admit','admitRealSource','unsealArchive','readProtectedSource','syncOriginalSRC','activateFlight','registerSource','importSource','generateGrant','authorize','readPrivateBody'];
 for(const c of classes)for(const action of actions){const q={action,source_class:c.class_id};for(const k of ['source_path','bytes','profile'])late(q,k,()=>getters++);await refuse(c.class_id+':'+action,l.api.request(q),/B8_REAL_SOURCE_OPERATION_DISABLED/)}
 assert.equal(getters,0);assert.equal(fs.existsSync(path.join(l.workspace,'ENGINE')),false);observations.push({case:'all-real-classes-deny-first',classes:classes.length,actions:actions.length,getter_calls:getters,real_sources_admitted:0});
});
test('ENTRY: constructor and all otherwise read-only action structures reject accessors before evaluation',async t=>{
 let getters=0;const workspace=fs.mkdtempSync(path.join(os.tmpdir(),'b91-options-'));t.after(()=>fs.rmSync(workspace,{recursive:true,force:true}));const options={workspace,create:true};late(options,'mode',()=>getters++);await refuse('constructor-accessor',openCandidateProduct(options),/B91_ACCESSOR_REFUSED/);assert.deepEqual(fs.readdirSync(workspace),[]);
 const l=await lab(t);for(const action of ['status','describeFixtures','inspectAdmissionReadiness']){const q={action};late(q,'action',()=>getters++);await refuse(action,l.api.request(q),/B8_ACTION_REQUIRED/)}assert.equal(getters,0);
});
test('BINDING: new snapshot dependency is bound; old implementation checkpoints refuse without migration',async t=>{
 const l=await lab(t),file=path.join(l.workspace,'PRODUCT.json'),m=JSON.parse(fs.readFileSync(file));m.implementation='99bd06f1ccf71138f3546acac38d02c3c380fd31c2db4f1c0477936523fc3c92';const bytes=Buffer.from(JSON.stringify(m)+'\n');fs.writeFileSync(file,bytes);
 await refuse('historical binding not migrated',openCandidateProduct({workspace:l.workspace,root_receipt:sha(bytes)}),/B8_CONSTITUTION_OR_MODE_DRIFT/);assert.deepEqual(fs.readFileSync(file),bytes);
 const copy=fs.mkdtempSync(path.join(os.tmpdir(),'b91-binding-'));t.after(()=>fs.rmSync(copy,{recursive:true,force:true}));const manifest=JSON.parse(fs.readFileSync(path.join(entry,'implementation-manifest.json'))),prefix=path.relative(repo,entry);
 assert.equal(manifest.request_boundary_revision,'B91_OWNED_PLAIN_DATA_SNAPSHOT_V1');assert.equal(manifest.files.length,34);assert.equal(manifest.files.filter(f=>f.path.endsWith('/request-data-v01.mjs')).length,1);
 for(const f of manifest.files){const p=path.join(copy,f.path);fs.mkdirSync(path.dirname(p),{recursive:true});fs.copyFileSync(path.join(repo,f.path),p)}fs.copyFileSync(path.join(entry,'implementation-manifest.json'),path.join(copy,prefix,'implementation-manifest.json'));
 const module=await import(pathToFileURL(path.join(copy,prefix,'product-entry-v01.mjs'))),clean=await lab(t),api=await module.openCandidateProduct({workspace:clean.workspace,root_receipt:clean.api.root_receipt}),helper=path.join(copy,prefix,'request-data-v01.mjs'),original=fs.readFileSync(helper);
 fs.appendFileSync(helper,'\n// synthetic dependency drift\n');await refuse('helper drift',api.request({action:'status'}),/B8_IMPLEMENTATION_DRIFT/);fs.writeFileSync(helper,original);fs.unlinkSync(helper);await refuse('missing helper',api.request({action:'status'}),/B8_MISSING_FILE/);
 observations.push({case:'implementation-reconciliation',old_binding:m.implementation,new_binding:sha(fs.readFileSync(path.join(entry,'implementation-manifest.json'))),paths:manifest.files.length,checkpoint_migrated:false});
});
test.after(()=>{if(process.env.TD613_E3B91_EVIDENCE_OUTPUT)fs.writeFileSync(process.env.TD613_E3B91_EVIDENCE_OUTPUT,JSON.stringify({schema:'td613.b91-request-conformance/v1',evidence_class:'SYNTHETIC_REPLAY_ONLY',independent_empirical_replications:0,real_sources_admitted:0,observations,refusals})+'\n')});
