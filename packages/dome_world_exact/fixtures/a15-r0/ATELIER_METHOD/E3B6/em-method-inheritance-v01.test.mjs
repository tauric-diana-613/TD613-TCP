import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import {createHash} from 'node:crypto';import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
import {openEmAssembly,EM_SPEC} from './recipient-em-assembly-v01.mjs';
import {td,src,w} from './invented-integration-fixtures.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const fixtureRoot=path.resolve('tests/fixtures/e3b6-invented'),methodRoot=path.dirname(fileURLToPath(import.meta.url));
const expected=JSON.parse(fs.readFileSync(path.join(fixtureRoot,'EXPECTATIONS.json'))),evidence=[],refusals=[];
const families=['BLIND_SOURCE_ANATOMY','WORK_IDENTITY_SPLIT_COLLAPSE_SENSITIVITY','MOTIF_VS_MECHANISM_NULL','FORMAL_OPERATOR_AND_AUTHORITY_LAUNDERING','GENEALOGY_AND_SOURCE_INDEPENDENCE','CONVERGENCE_DIVERGENCE_EMERGENCE','OBFUSCATION_DECOMPRESSION','EXTERNAL_SCIENTIFIC_CONFRONTATION','HOSTILE_ALTERNATIVE_MODELS','FRAGMENTARY_BLURB_THEORY_PROPOSALS'];
const [ANATOMY,IDENTITY,MOTIF,FORMAL,GENEALOGY,CONVERGENCE,DECOMP,EXTERNAL,HOSTILE,FRAGMENT]=families;
const fixture=()=>{const m=JSON.parse(fs.readFileSync(path.join(fixtureRoot,'MANIFEST.json')));for(const r of m.files){const b=fs.readFileSync(path.join(fixtureRoot,r.path));assert.equal(hash(b),r.sha256);assert.equal(b.length,r.bytes)}return JSON.parse(fs.readFileSync(path.join(fixtureRoot,'em-fixture.json')))};
async function negative(label,promise,pattern){await assert.rejects(promise,e=>{refusals.push({label,code:e.code??null,message:e.message});if(pattern)assert.match(e.message,pattern);return true})}
async function lab(t,lane='PRODUCT_RECIPIENT'){const workspace=fs.mkdtempSync(path.join(os.tmpdir(),'e3b6-'));t.after(()=>fs.rmSync(workspace,{recursive:true,force:true}));return {workspace,lane,api:await openEmAssembly({workspace,lane,create:true})}}
async function admit(l,f=fixture(),source_id='FIXTURE-EM-MAIN'){
 const bytes=Buffer.from(JSON.stringify(f)),q={family:EM_SPEC.family,product:EM_SPEC.product,epoch:EM_SPEC.epoch,rights:EM_SPEC.rights,source_pin:EM_SPEC.pin,evidence_class:EM_SPEC.evidence_class,source_id,bytes,sha256:hash(bytes)};
 const a=await l.api.request({...q,action:'admit'});assert.equal(a.real_source_admitted,false);return {...q,action:'execute',receipt:a.receipt};
}
const run=(l,q,operation,params={})=>l.api.request({...q,action:'execute',operation,params});
const loc=(l,q)=>path.join(l.workspace,EM_SPEC.family,hash(Buffer.from(q.source_id)));
async function origins(l){
 const specs=(await import('../E3B5/recipient-assembly-v01.mjs')).SOURCE_SPECS;
 const result={};for(const [family,make] of [['TD613_REFERENCE',td],['SRC_METHODS',src],['WENDBINE_PUBLIC',w]]){
  const spec=specs[family],bytes=Buffer.from(JSON.stringify(make())),q={family,product:spec.product,epoch:spec.epoch,rights:'SYNTHETIC_LOCAL_ONLY',source_pin:spec.pin,evidence_class:'SYNTHETIC_REPLAY_ONLY',source_id:'FIXTURE-'+family,bytes,sha256:hash(bytes)};
  const r=await l.api.request({...q,action:'admit'});result[family]={...q,action:'execute',receipt:r.receipt};
 }return result;
}
function rebind(f,index,text){const o=f.originals[index];o.bytes_base64=Buffer.from(text).toString('base64');o.sha256=hash(Buffer.from(text));for(const s of f.source_files.filter(s=>s.original_id===o.original_id))s.sha256=o.sha256;for(const d of f.derivatives.filter(d=>d.original_id===o.original_id)){d.text_base64=o.bytes_base64;d.sha256=o.sha256;d.parent_sha256=o.sha256}}

test('B6 inspected original pure Em module imports and executes without register/derivative reads',()=>{
 const code="import fs from 'node:fs';import {fileURLToPath} from 'node:url';let reads=[],code_reads=[];const original=fs.readFileSync;const allowed=fileURLToPath(process.argv[1]);fs.readFileSync=(p,...args)=>{const name=p instanceof URL?fileURLToPath(p):String(p);if(name===allowed){code_reads.push(name);return original(p,...args)}reads.push(name);throw Error('FORBIDDEN_SOURCE_READ')};const m=await import(process.argv[1]);const r=m.stageSourceIntake({bytes:Buffer.from('INVENTED'),original_filename:'invented.txt',media_type:'text/plain',provenance_basis:'SYNTHETIC',rights_state:'RESTRICTED_NO_EXPORT',parent_epoch:'SYNTHETIC'});const g=m.compileTypedGraph([],new Set());console.log(JSON.stringify({reads,code_reads,staged:r,graph:g}));";
 const r=spawnSync(process.execPath,['--input-type=module','-e',code,new URL('./native/em-atelier-parity.mjs',import.meta.url).href],{encoding:'utf8',timeout:15000});assert.equal(r.status,0,r.stderr);const out=JSON.parse(r.stdout);assert.deepEqual(out.reads,[]);assert.equal(out.staged.accession_authorized,false);evidence.push({case:'original-em-pure-import-and-call',out});
});
test('B6 ten real family IDs have distinct tested contracts; original seed/SRC and native Em holds remain',async t=>{
 const l=await lab(t),a=await admit(l),status=await l.api.request({action:'status'});
 assert.deepEqual(Object.keys(status.em_method_states),families);assert.deepEqual(status.baseline.em_readiness.family_ids,families);
 assert.equal(status.baseline.original_profile.source_count,0);assert.equal(Object.keys(status.baseline.original_profile.modules).length,44);assert.equal(status.manifest.original_connector,'HELD_SHARED_RECIPIENT_IDENTITY');assert.equal(status.manifest.preimport_trust_root,'HELD_UNSIGNED_PREIMPORT_ROOT');
 assert.deepEqual(status.baseline.src_classification,{executed:4,partial:7,designed:1,original_corpus_parity:0});assert.equal(status.em_corpus_parity,'HELD');
 for(const operation of families){const r=await run(l,a,operation);assert.equal(r.original_em_corpus_execution,0);assert.equal(r.evidence_class,'SYNTHETIC_REPLAY_ONLY');evidence.push({case:'family-'+operation,result:r})}
 const gate=await run(l,a,'NATIVE_EM_CORPUS');assert.equal(gate.status,'HELD');assert.equal(gate.execution_count,0);
});
test('B6 Work sensitivity enumerates finite supported/unresolved assignments without rewriting operational identity',async t=>{
 const l=await lab(t),a=await admit(l),r=(await run(l,a,IDENTITY)).result;
 assert.equal(r.manifestation_count,expected.manifestations);assert.equal(r.source_file_count,expected.source_files);assert.equal(r.operational_work_count,expected.operational_works);assert.equal(r.unassigned_manifestations,1);assert.deepEqual(r.independent_work_bounds,expected.independent_work_bounds);assert.equal(r.selected_counterfactual_count,expected.default_counterfactual_count);
 const split=await run(l,a,IDENTITY,{assignment:{split_supported:true}}),merge=await run(l,a,IDENTITY,{assignment:{join_unresolved:true}});assert.equal(split.result.selected_counterfactual_count,expected.split_counterfactual_count);assert.equal(merge.result.selected_counterfactual_count,expected.merge_counterfactual_count);
 assert.equal(r.canonical_identity_rewritten,false);assert.equal(r.supported_identity_confirmed,false);assert.deepEqual(r.portable_works[0].independent_work_contribution_interval,[1,2]);
 await negative('unsupported identity assignment',run(l,a,IDENTITY,{assignment:{confirmed:true}}),/EM_IDENTITY_ASSIGNMENT_UNSUPPORTED/);
 evidence.push({case:'identity-split-merge',default:r,split,merge});
});
test('B6 motif recurrence remains separate from mechanism; source-independent byte twins never supply automatic genealogy',async t=>{
 const l=await lab(t),a=await admit(l),r=await run(l,a,MOTIF,{terms:['trace','Tú puedes clonarme']});assert.equal(r.result.motif_implies_mechanism,false);assert.ok(r.result.lexical.summary.find(x=>x.term==='trace').occurrences>1);assert.deepEqual(r.result.mechanism.compatible_model_ids,expected.signed_compatible);
 const f=fixture();f.specimens=[];const b=await admit(l,f,'FIXTURE-EM-MOTIF-ONLY');const only=await run(l,b,MOTIF,{terms:['trace']});assert.ok(only.result.lexical.observations.length);assert.equal(only.result.mechanism,null);assert.equal((await run(l,b,FORMAL)).status,'ABSENT');evidence.push({case:'motif-only-vs-numeric',r,only});
});
test('B6 original portable finite mechanism falsification rejects sum/absolute alternatives and retains a genuinely nonunique control',async t=>{
 const l=await lab(t),a=await admit(l),signed=await run(l,a,FORMAL),nonunique=await run(l,a,FORMAL,{specimen:'NONUNIQUE'});
 assert.deepEqual(signed.result.compatible_model_ids,expected.signed_compatible);assert.deepEqual(signed.result.falsified_on_supplied_cases,['SUM','ABS_DIFFERENCE']);assert.equal(signed.result.hypotheses.find(x=>x.id==='UNSPECIFIED').classification,'ABSTAINING_UNSPECIFIED_MODEL');
 assert.deepEqual(nonunique.result.compatible_model_ids,expected.nonunique_compatible);assert.equal(nonunique.result.result_classification,'OBSERVATIONALLY_NONUNIQUE_COMPATIBLE_MODELS');assert.equal(signed.result.independent_empirical_validation,false);assert.equal(signed.result.novelty_validated,false);
 for(const p of [{promote:true},{novelty:true},{external_citation:'invented DOI'}])await negative('authority/prior-art promotion',run(l,a,FORMAL,p),/EM_AUTHORITY_LIFT_REFUSED/);
 evidence.push({case:'signed-and-nonunique',signed,nonunique});
});
test('B6 source-matched independently initialized portable/recipient/transport lanes compare actual algorithms without Em-corpus parity',async t=>{
 const n=await lab(t,'SOURCE_NATIVE'),l=await lab(t),x=await lab(t,'TRANSPORT_ONLY'),a=await admit(n),b=await admit(l),c=await admit(x);
 for(const [operation,key] of [[IDENTITY,'portable_works'],[MOTIF,'lexical'],[GENEALOGY,'independence']]){const native=await run(n,a,operation),recipient=await run(l,b,operation);assert.deepEqual(native.result[key],recipient.result[key]);assert.equal(native.comparator,'PORTABLE_LIBRARY_ONLY_NOT_EM_CORPUS');evidence.push({case:'portable-pair-'+operation,native,recipient})}
 assert.deepEqual((await run(n,a,FORMAL)).result,(await run(l,b,FORMAL)).result);
 const tx=await run(x,c,IDENTITY);assert.equal(tx.status,'UNEXECUTED');assert.equal(tx.execution_count,0);assert.ok(tx.bytes.equals(c.bytes));
 const held=await run(n,a,DECOMP);assert.equal(held.status,'HELD');assert.equal(held.execution_count,0);
});
test('B6 genealogy separates derivatives, source rows, original roots, hash groups and Work identities',async t=>{
 const l=await lab(t),a=await admit(l),r=await run(l,a,GENEALOGY);assert.equal(r.result.independence.evidence_rows,6);assert.equal(r.result.independence.distinct_known_ancestors,expected.ancestor_count);assert.equal(r.result.byte_groups.length,expected.known_hash_groups);assert.ok(r.result.byte_groups.some(g=>g.original_ids.length===2));assert.equal(r.result.external_origin_verified,false);assert.equal(r.result.work_group_is_ancestor,false);
 const ablated=await run(l,a,GENEALOGY,{withdraw_source:'FIXTURE-S3'});assert.equal(ablated.result.ablation.removed.PROVENANCE,1);assert.equal(ablated.result.ablation.retained.PROVENANCE.length,5);
 const f=fixture();f.originals[0].ancestor_id=null;const b=await admit(l,f,'FIXTURE-EM-UNKNOWN-ORIGIN');assert.equal((await run(l,b,GENEALOGY)).result.independence.verdict,'INDEPENDENCE_UNRESOLVED');evidence.push({case:'genealogy-units',r,ablated});
});
test('B6 blind structural masks ignore misleading labels/template rather than guessing Work or author identity',async t=>{
 const l=await lab(t),f=fixture(),a=await admit(l,f),before=await run(l,a,ANATOMY);
 const changed=structuredClone(f);for(let i=0;i<changed.originals.length;i++)rebind(changed,i,'Title: THE SAME AUTHOR\nTemplate: miracle proof\n'+Buffer.from(f.originals[i].bytes_base64,'base64').toString('utf8'));
 // Anchored method specimens retain their own original offsets; this test executes anatomy only.
 const b=await admit(l,changed,'FIXTURE-EM-LABELS');assert.deepEqual((await run(l,b,ANATOMY)).result,before.result);assert.equal(before.result.inferred_author,null);evidence.push({case:'blind-ablation',before});
});
test('B6 fixed reference/shuffled/template comparison has equal frozen inputs and remains held for independent outcomes',async t=>{
 const l=await lab(t),a=await admit(l),r=await run(l,a,CONVERGENCE);assert.equal(r.status,'HELD');assert.equal(r.result.identical_inputs_for_all,true);assert.equal(r.result.results[0].matching_cases,4);assert.ok(r.result.results[1].matching_cases<4);assert.ok(r.result.results[2].matching_cases<4);assert.equal(r.result.novelty_established,false);
 const f=fixture();f.comparison.inputs[0].target=999;const b=await admit(l,f,'FIXTURE-EM-COMPARE-TAMPER');await negative('changed frozen inputs',run(l,b,CONVERGENCE),/EM_FROZEN_COMPARISON_TAMPER/);evidence.push({case:'finite-comparison',r});
});
test('B6 reversible encoding roundtrips exact bytes while lossy aliases preserve two compatible preimages',async t=>{
 const l=await lab(t),a=await admit(l),r=await run(l,a,DECOMP);assert.equal(r.result.roundtrip_exact,true);assert.equal(r.result.lossy_classes[0].unique_recovery,false);assert.deepEqual(r.result.lossy_classes[0].compatible_inputs,['amber route','azure route']);assert.equal(r.result.protected_text_recovered,false);evidence.push({case:'decompression',r});
});
test('B6 external witness gate emits requirements without fabricated external citations or validation',async t=>{
 const l=await lab(t),a=await admit(l),r=await run(l,a,EXTERNAL);assert.equal(r.status,'HELD');assert.equal(r.result.status,'HELD_EXTERNAL_VALIDATION');assert.deepEqual(r.result.witnesses,[]);assert.equal(r.result.external_search_performed,false);evidence.push({case:'external-gate',r});
});
test('B6 hostile battery actually mutates text, parents and clocks; no conventional toy formula earns novelty',async t=>{
 const l=await lab(t),a=await admit(l),r=await run(l,a,HOSTILE);assert.equal(r.result.more_text.ancestor_count_unchanged,true);assert.ok(r.result.more_text.after[0].occurrences>r.result.more_text.before[0].occurrences);assert.equal(r.result.label_template_ablation_invariant,true);assert.deepEqual(r.result.executed_refusals.map(x=>x.code),['EM_DERIVATIVE_INTEGRITY','EM_CHRONOLOGICAL_INVERSION']);assert.equal(r.result.general_hostile_model_search,'HELD');assert.ok(r.result.source_withheld.after.length<r.result.source_withheld.before.length);evidence.push({case:'hostile-battery',r});
});
test('B6 fragmentary excerpt remains locally HELD; explicit bounded positive blurb supplies its operator/prediction/falsifier',async t=>{
 const l=await lab(t),a=await admit(l),held=await run(l,a,FRAGMENT),positive=await run(l,a,FRAGMENT,{positive:true});assert.equal(held.status,'HELD');assert.equal(held.result.candidate.status,'HELD_EXCERPT_INSUFFICIENT');assert.equal(held.result.candidate.full_source_conclusion,false);assert.equal(held.result.candidate.conceptual_value_not_denied,true);
 assert.equal(positive.result.candidate.status,'CANDIDATE_SPECIFIED_AWAITING_EXTERNAL_ADJUDICATION');assert.equal(positive.result.candidate.novelty_validated,false);assert.equal(positive.result.full_work_analyzed,false);
 evidence.push({case:'fragment-held-and-positive',held,positive});
});
test('B6 three-origin public trace actually executes TD/SRC/Em methods and holds repeated-phrase cross-origin authority',async t=>{
 const l=await lab(t),o=await origins(l),a=await admit(l),r=await l.api.request({action:'three_origin_trace',td:o.TD613_REFERENCE,src:o.SRC_METHODS,em:a,query:'governance',question:'Q_history',route:{from:'A',to:'C',graph:'G_CANON'}});
 assert.equal(r.status,'BOUNDED_THREE_ORIGIN_TRACE');assert.equal(r.envelopes.length,3);assert.equal(r.envelopes[2].identity.result.manifestation_count,6);assert.equal(r.cross_bridge.status,'HELD');assert.equal(r.cross_bridge.common_authorship,false);assert.equal(r.cross_bridge.shared_mechanism,false);assert.equal(r.cross_bridge.source_rights_transfer,false);
 const phrase='Tú puedes clonarme';const tdR=await run(l,o.TD613_REFERENCE,'search',{query:phrase}),srcR=await run(l,o.SRC_METHODS,'explore'),emR=await run(l,a,MOTIF,{terms:[phrase]});assert.ok(tdR.result.hits.length&&srcR.result.signatures.length&&emR.result.lexical.observations.length);
 for(const p of [{authorship:true},{shared_genealogy:true}])await negative('shared phrase cannot lift authority',run(l,a,GENEALOGY,p),/EM_AUTHORITY_LIFT_REFUSED/);
 evidence.push({case:'three-origin-trace',r,tdR,srcR,emR});
});
test('B6 source/receipt/product/epoch/rights/citation swaps, ID collisions and false original binding refuse',async t=>{
 const l=await lab(t),a=await admit(l),b=await admit(l,fixture(),'FIXTURE-EM-SECOND'),o=await origins(l);
 for(const [label,q] of [['receipt',{...a,receipt:b.receipt}],['foreign receipt',{...a,receipt:o.SRC_METHODS.receipt}],['epoch',{...a,epoch:'WRONG'}],['rights',{...a,rights:'PRIVATE'}],['product',{...a,product:'NEW_UNIVERSAL_ENCYCLOPEDIA_E3B3'}],['source',{...a,source_id:'FIXTURE-EM-ABSENT'}]])await negative(label,run(l,q,IDENTITY));
 const citation=(await run(l,a,'cite',{id:'FIXTURE-D3'})).result;await negative('false citation parent',l.api.request({...a,operation:FORMAL,citation:{...citation,parent_sha256:'0'.repeat(64)}}),/B6_CITATION_BINDING/);await negative('cross-source identical citation',l.api.request({...b,operation:FORMAL,citation}),/B6_CITATION_BINDING/);
 const bytes=Buffer.from(JSON.stringify(td())),s=o.TD613_REFERENCE;await negative('global ID collision with Em',l.api.request({...s,action:'admit',source_id:a.source_id,bytes,sha256:hash(bytes)}),/B6_CROSS_SOURCE_ID_COLLISION/);
 const f=fixture();f.derivatives[0].parent_sha256='0'.repeat(64);await negative('bad derivative parent',admit(l,f,'FIXTURE-EM-BAD-PARENT'),/EM_DERIVATIVE_INTEGRITY/);
});
test('B6 original revocation removes only its descendants, preserves raw original and independent sources, survives fresh process restart',async t=>{
 const l=await lab(t),a=await admit(l),o=await origins(l),before=await l.api.request({...a,action:'readback'});
 await l.api.request({...a,action:'revoke_original',original_id:'FIXTURE-O3',authority:'SYNTHETIC_OPERATOR_WITHDRAWAL_ONLY'});
 assert.equal((await run(l,a,'get_derivative',{id:'FIXTURE-D3'})).status,'ABSENT');assert.equal((await run(l,a,FORMAL)).status,'ABSENT');assert.equal((await run(l,a,GENEALOGY)).result.independence.evidence_rows,3);
 assert.ok((await l.api.request({...a,action:'readback'})).bytes.equals(before.bytes));assert.ok((await run(l,o.SRC_METHODS,'explore')).result.observations.length);assert.equal((await run(l,o.WENDBINE_PUBLIC,'topology')).result.typed_edges.length,1);
 const code="import {openEmAssembly} from './packages/dome_world_exact/fixtures/a15-r0/ATELIER_METHOD/E3B6/recipient-em-assembly-v01.mjs';let s='';for await(const b of process.stdin)s+=b;const x=JSON.parse(s),a=await openEmAssembly(x.options);console.log(JSON.stringify(await a.request(x.query)));";
 const r=spawnSync(process.execPath,['--input-type=module','-e',code],{encoding:'utf8',timeout:15000,input:JSON.stringify({options:{workspace:l.workspace,lane:l.lane,root_receipt:l.api.root_receipt},query:{...a,bytes:undefined,operation:GENEALOGY}})});assert.equal(r.status,0,r.stderr);const result=JSON.parse(r.stdout);assert.equal(result.result.independence.evidence_rows,3);evidence.push({case:'revoked-descendants-and-restart',result});
});
test('B6 whole Em withdrawal leaves TD/SRC/W operational and blocks dependent three-origin trace',async t=>{
 const l=await lab(t),a=await admit(l),o=await origins(l);await l.api.request({...a,action:'withdraw',authority:'SYNTHETIC_OPERATOR_WITHDRAWAL_ONLY'});
 await negative('withdrawn Em query',run(l,a,IDENTITY),/B6_SOURCE_WITHDRAWN/);await negative('withdrawn Em replay',l.api.request({...a,action:'admit'}),/B6_SOURCE_WITHDRAWN/);
 await negative('trace depends on revoked Em',l.api.request({action:'three_origin_trace',td:o.TD613_REFERENCE,src:o.SRC_METHODS,em:a,query:'governance',question:'Q_history',route:{from:'A',to:'C'}}),/B6_SOURCE_WITHDRAWN/);
 assert.ok((await run(l,o.TD613_REFERENCE,'search',{query:'governance'})).result.hits.length);
});
test('B6 exact replay differs from changed bytes; missing/corrupt manifest, source and receipt fail closed without repair',async t=>{
 const l=await lab(t),a=await admit(l);assert.equal((await l.api.request({...a,action:'admit'})).status,'EXACT_REPLAY');
 for(const mutation of ['source','receipt','missing','manifest']){
  const s=await lab(t),q=await admit(s),folder=loc(s,q);
  if(mutation==='source')fs.appendFileSync(path.join(folder,'original.bin'),' ');
  if(mutation==='receipt')fs.writeFileSync(path.join(folder,'receipt.json'),'{');
  if(mutation==='missing')fs.unlinkSync(path.join(folder,'receipt.json'));
  if(mutation==='manifest')fs.unlinkSync(path.join(s.workspace,'B6_ASSEMBLY.json'));
  await negative('corrupt '+mutation,run(s,q,IDENTITY));
 }
 const f=fixture();f.originals[0].ancestor_id='FIXTURE-OTHER';const bytes=Buffer.from(JSON.stringify(f));await negative('changed replay',l.api.request({...a,action:'admit',bytes,sha256:hash(bytes)}),/B6_REPLAY_CONFLICT/);
});
test('B6 wrong hash, missing source, chronology inversion and suppressed evidence cannot become executed zero',async t=>{
 const l=await lab(t);for(const [label,mutate] of [['hash',f=>f.originals[0].sha256='0'.repeat(64)],['missing',f=>f.originals.shift()],['clock',f=>f.derivatives[0].observed_at='1900-01-01'],['rights',f=>f.rights='PUBLIC'],['private field',f=>f.protected_archive='FORBIDDEN']]){const f=fixture();mutate(f);await negative(label,admit(l,f,'FIXTURE-EM-'+label.replaceAll(' ','-').toUpperCase()))}
 const a=await admit(l);assert.equal((await run(l,a,GENEALOGY,{as_of:'2025-01-01'})).status,'EXECUTED_ZERO');assert.equal((await run(l,a,'get_derivative',{id:'FIXTURE-D-MISSING'})).status,'ABSENT');
 await negative('unavailable operation',run(l,a,'secret_native_query'),/EM_UNAVAILABLE_OPERATION/);
 const zero=await run(l,a,MOTIF,{terms:['zzzznotpresent']});assert.equal(zero.status,'EXECUTED_ZERO');
});
test('B6 source binding rejects changed coordinator or native dependency bytes on independently copied code closure',async t=>{
 const l=await lab(t),a=await admit(l),copy=fs.mkdtempSync(path.join(os.tmpdir(),'e3b6-code-'));t.after(()=>fs.rmSync(copy,{recursive:true,force:true}));
 const manifest=JSON.parse(fs.readFileSync(path.join(methodRoot,'dependencies.json')));
 for(const r of manifest.files){const destination=path.join(copy,r.path);fs.mkdirSync(path.dirname(destination),{recursive:true});fs.copyFileSync(r.path,destination)}
 const prefix='packages/dome_world_exact/fixtures/a15-r0/ATELIER_METHOD/E3B6/';fs.copyFileSync(path.join(methodRoot,'dependencies.json'),path.join(copy,prefix,'dependencies.json'));
 const module=await import(new URL('file://'+path.join(copy,prefix,'recipient-em-assembly-v01.mjs')));
 const independent=await module.openEmAssembly({workspace:l.workspace,lane:l.lane,root_receipt:l.api.root_receipt});assert.equal((await independent.request({...a,operation:IDENTITY})).result.manifestation_count,6);
 fs.appendFileSync(path.join(copy,prefix,'recipient-em-assembly-v01.mjs'),'\n// simulated version change\n');await negative('changed coordinator bytes',independent.request({...a,operation:IDENTITY}),/B6_SOURCE_CODE_DRIFT/);
 fs.copyFileSync(path.join(methodRoot,'recipient-em-assembly-v01.mjs'),path.join(copy,prefix,'recipient-em-assembly-v01.mjs'));
 fs.appendFileSync(path.join(copy,prefix,'native/em-atelier-parity.mjs'),'\n// simulated native source change\n');await negative('changed native dependency bytes',independent.request({...a,operation:IDENTITY}),/B6_SOURCE_CODE_DRIFT/);
});
test('B6 interrupted admission and changed revocation witness remain held without reconstructing source state',async t=>{
 const l=await lab(t),source_id='FIXTURE-EM-PENDING',pending=path.join(l.workspace,EM_SPEC.family,hash(Buffer.from(source_id))+'.pending');fs.mkdirSync(pending);
 await negative('pending interrupted admission',admit(l,fixture(),source_id),/B6_INTERRUPTED_ADMISSION_HELD/);
 const a=await admit(l);await l.api.request({...a,action:'revoke_original',original_id:'FIXTURE-O3',authority:'SYNTHETIC_OPERATOR_WITHDRAWAL_ONLY'});
 const p=path.join(loc(l,a),'revocations',hash(Buffer.from('FIXTURE-O3'))+'.json');const r=JSON.parse(fs.readFileSync(p));r.source_receipt='0'.repeat(64);fs.writeFileSync(p,JSON.stringify(r));
 await negative('changed revocation witness',run(l,a,GENEALOGY),/B6_REVOCATION_CORRUPT/);
});
test.after(()=>{if(process.env.TD613_E3B6_EVIDENCE_OUTPUT)fs.writeFileSync(process.env.TD613_E3B6_EVIDENCE_OUTPUT,JSON.stringify({schema:'td613.e3b6-source-free-execution/v1',evidence_class:'SYNTHETIC_REPLAY_ONLY',independent_empirical_replications:0,observations:evidence,refusals},null,2)+'\n')});
