import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createVixenPodium,PODIUM_SCHEMA,PODIUM_ROUTES} from '../app/encyclopedia/reference/vixen-podium.mjs';
const root=new URL('../app/encyclopedia/',import.meta.url);
const html=await readFile(new URL('vix-cyb.html',root),'utf8');
const corpus=JSON.parse(html.match(/<script[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/)[1]);
const task=(intent,params={})=>({schema:PODIUM_SCHEMA,intent,params});
const source=corpus.works[0].linked_sources[0];
const workId=corpus.works[0].work_id;
const witness={
 id:'G-101',verified_at_interaction:true,authorization:'READ_ONLY',
 record_sha256:'a'.repeat(64),served_file_sha256:'b'.repeat(64),
 source_path:'reference/records/G-101.json',
 record:{id:'G-101',kind:'glossary',label:'FADT',status:'FORMAL_RESULT'}
};
function mock(){
 let calls=0;return {
  stats:()=>calls,status:()=>({state:calls?'CENSUS_MATCHED':'UNOPENED'}),
  open:async()=>{calls++;return {state:'CENSUS_MATCHED',edition:'1.4',records:1141,edges:2131}},
  search:q=>[{id:'G-101',label:'FADT',kind:'glossary',record_sha256:'a'.repeat(64)}],
  getRecord:async id=>{assert.equal(id,'G-101');return witness},
  related:id=>[{source:id,type:'mentions_record',target:'M-07'}]
 };
}
test('Podium machine contract is separate from the operator UI and its read route list matches the runner',async()=>{
 const manifest=JSON.parse(await readFile(new URL('reference/podium/manifest.json',root),'utf8'));
 assert.equal(manifest.schema,'td613.vixen.podium.machine-route-index/v1');
 assert.deepEqual(manifest.routes.map(r=>r.id),PODIUM_ROUTES);
 assert.equal(manifest.deployment_authority,false);
 assert.equal(manifest.experiment_b_flight,'HELD');
 assert.match(html,/rel="alternate" type="application\/json" title="Vixen Podium machine research contract"/);
 assert(!html.includes('id="podiumUserControl"'));
 assert.equal(manifest.operator_authority,'EXPLICIT_CONTEMPORANEOUS_HUMAN_REQUEST');
 assert.equal(manifest.source_census.vixen_works,32);
 assert.equal(manifest.source_census.universal_records,1141);
});
test('Typed machine Podium refuses implicit access, unknown scopes and a fabricated engine authorization',async()=>{
 const backend=mock(),p=createVixenPodium({corpus,membrane:backend});
 assert.equal(backend.stats(),0,'No reference request on import or mount');
 assert.equal((await p.dispatch(task('podium.describe'))).status,'SUPPORTED');
 const denied=await p.dispatch(task('universal.get',{record_id:'G-101'}));
 assert.equal(denied.status,'HELD');
 assert.equal(denied.result.state,'HELD_INDEX_NOT_OPEN');
 const fake=await p.dispatch(task('engine.invoke',{
  engine:'DOLLHOUSE',operation:'audit',payload:{authorised:true}
 }));
 assert.equal(fake.status,'HELD');
 assert.equal(fake.result.state,'HELD_OPERATOR_AUTHORITY_NOT_SUPPLIED');
 assert.equal((await p.dispatch(task('engine.invoke',{engine:'UNIVERSAL_ATELIER',
  operation:'admitRecord',payload:{}}))).result.state,'HELD_ENGINE_OPERATION_NOT_ALLOWED');
 assert.equal((await p.dispatch({schema:'td613.invalid',intent:'universal.open'})).status,'HELD');
 assert.equal(backend.stats(),0);
});
test('Podium preserves separate EMSTD613 and Universal identities under a real typed encounter',async()=>{
 const p=createVixenPodium({corpus,membrane:mock()});
 const w=await p.dispatch(task('vixen.work.inspect',{work_id:workId}));
 assert.equal(w.result.role,'PERFORMER');
 assert.equal(w.result.linked_sources[0].source_body_access,'UNAVAILABLE_IN_PUBLIC_SURFACE');
 const gates=await p.dispatch(task('vixen.gates.inspect'));
 assert.equal(gates.result.gates.length,8);
 assert(gates.result.gates.every(g=>g.status==='UNADJUDICATED_PAIR'));
 assert.equal((await p.dispatch(task('universal.open'))).status,'SUPPORTED');
 assert.equal((await p.dispatch(task('universal.search',{query:'FADT'}))).result.claim_ceiling,
  'SEARCH_MATCH_ONLY_NOT_ENTAILMENT');
 assert.equal((await p.dispatch(task('universal.related',{record_id:'G-101'}))).status,'HELD');
 const ref=await p.dispatch(task('universal.get',{record_id:'G-101'}));
 assert.equal(ref.status,'SUPPORTED');assert.equal(ref.result.record_id,'G-101');
 assert.equal((await p.dispatch(task('universal.related',{record_id:'G-101'}))).status,'SUPPORTED');
 const r=await p.dispatch(task('synthesis.propose',{
  work_id:workId,source_id:source.source_file_id,record_id:'G-101',
  question:'What independent observation could warrant a relationship?'
 }));
 assert.equal(r.status,'HELD');
 assert.equal(r.result.schema,'ua:contract:cross_atelier_witness');
 assert.equal(r.result.disposition,'WITNESSED_UNLINKED_PAIR');
 assert.equal(r.result.admissibility.human_ratified_crosswalk,false);
 assert.equal(r.result.admissibility.publication_eligible,false);
 assert.equal(r.result.custody.empirical_replication_credit,0);
 assert.equal(r.result.vixen.work_id,workId);
 assert.equal(r.result.universal.record_id,'G-101');
 assert.match(r.result.operator_proposal.text,/independent observation/);
 assert(r.result.route_history.length>=4,'Route chronology is retained in terminal proposal');
});
test('Missing engine stays held; connected explicitly authorized engine returns unendorsed result',async()=>{
 const adapter=async ({operation,payload})=>({operation,payload,case:'SYNTHETIC_ONLY'});
 const disconnected=createVixenPodium({corpus,membrane:mock(),operatorAuthorized:true});
 const refused=await disconnected.dispatch(task('engine.invoke',{engine:'ATLAS',operation:'compare_routes',payload:{}}));
 assert.equal(refused.result.state,'HELD_ENGINE_NOT_CONNECTED');
 const connected=createVixenPodium({corpus,membrane:mock(),operatorAuthorized:true,
  engineAdapters:{ATLAS:adapter}});
 const r=await connected.dispatch(task('engine.invoke',{engine:'ATLAS',
  operation:'compare_routes',payload:{same_endpoint:true}}));
 assert.equal(r.status,'HELD');
 assert.equal(r.result.state,'UNVERIFIED_ENGINE_ADAPTER_RETURN');
 assert.equal(r.result.output.case,'SYNTHETIC_ONLY');
 assert.equal(r.authority.release,false);
 assert.equal(r.authority.identity_adjudication,false);
});
test('Podium portable native CLI performs actual reference read without network and prints honest HELD synthesis',async()=>{
 const batch=[
  task('podium.describe'),task('universal.open'),
  task('universal.search',{query:'FADT'}),
  task('universal.get',{record_id:'G-101'}),
  task('universal.related',{record_id:'G-101'}),
  task('synthesis.propose',{
   work_id:workId,source_id:source.source_file_id,record_id:'G-101',
   question:'Can a separate source corroborate this without role merger?'
  }),
  task('engine.invoke',{engine:'DOLLHOUSE',operation:'audit',payload:{}})
 ];
 const stdout=execFileSync(process.execPath,['scripts/vixen-podium.mjs','--stdin'],{
  cwd:new URL('../',import.meta.url).pathname,input:JSON.stringify(batch),encoding:'utf8',timeout:30000
 });
 const report=JSON.parse(stdout);
 assert.equal(report.results.length,batch.length);
 assert.equal(report.results[1].result.records,1141);
 assert.equal(report.results[1].result.edges,2131);
 assert.equal(report.results[3].result.record_id,'G-101');
 assert.match(report.results[3].result.canonical_sha256,/^[a-f0-9]{64}$/);
 assert.equal(report.results[5].result.disposition,'WITNESSED_UNLINKED_PAIR');
 assert.equal(report.results[5].result.admissibility.publication_eligible,false);
 assert.equal(report.results[6].result.state,'HELD_OPERATOR_AUTHORITY_NOT_SUPPLIED');
 assert.equal(report.source_custody,'LOCAL_PUBLIC_ASSETS_ONLY');
});
test('Native five-specialist Dollhouse negative control executes without turning a HOLD into science',async()=>{
 const {runDollhouseSkillAudit}=await import('../app/engine/dollhouse-skill-dispatcher.js');
 const path=new URL('../artifacts/vixen-dual-estate/podium-dollhouse-negative-control.json',import.meta.url);
 const spec=JSON.parse(await readFile(path,'utf8'));
 spec.source_revision=execFileSync('git',['rev-parse','HEAD'],{
  cwd:new URL('../',import.meta.url).pathname,encoding:'utf8'
 }).trim();
 const outcome=await runDollhouseSkillAudit(spec);
 const m=outcome.machine_receipt;
 assert.equal(m.roles_executed.length,5);
 assert.equal(m.orchestrator.decision,'HELD');
 assert.equal(m.empirical_replication_count,0);
 assert(m.orchestrator.detected_infractions.includes('ILLEGAL_ACTION_GRANT_UNDER_ERASED_CONDITIONING'));
 assert(m.orchestrator.detected_infractions.includes('HUMAN_CONSEQUENCE_BROKEN_RETURN_PROMISE'));
 assert.equal(m.orchestrator.release_authority,false);
 assert.equal(m.orchestrator.deployment_authority,false);
});


test('Native Podium refuses CLI flag without operator-direct host attestation',async()=>{
 const input=JSON.stringify(task('engine.invoke',{
  engine:'APERTURE',operation:'audit_epistemic_deficit',
  payload:{latent_dimension:2,current_rank:1,sigma_min:0,condition_number:5,
   uncertainty_status:'VALID_DECLARED',sigma_min_floor:0.25,condition_number_ceiling:10}
 }));
 let failed=null;
 try{execFileSync(process.execPath,['scripts/vixen-podium.mjs','--native-read-tools','--stdin'],{
  cwd:new URL('../',import.meta.url).pathname,input,encoding:'utf8',timeout:25000,
  env:{...process.env,TD613_PODIUM_OPERATOR_DIRECT:'0'}
 })}catch(e){failed=e}
 assert(failed,'Native read-tools flag alone should not grant tools');
 const error=JSON.parse(failed.stderr.trim());
 assert.equal(error.status,'HELD');
 assert.equal(error.error,'HELD_OPERATOR_DIRECT_NATIVE_LANE_NOT_ATTESTED');
});

test('Explicit operator-direct native lane executes real Aperture v3.2 and retains advisory ceiling',async()=>{
 const input=JSON.stringify(task('engine.invoke',{
  engine:'APERTURE',operation:'audit_epistemic_deficit',
  payload:{latent_dimension:2,current_rank:1,sigma_min:0,condition_number:5,
   uncertainty_status:'VALID_DECLARED',sigma_min_floor:0.25,condition_number_ceiling:10}
 }));
 const output=execFileSync(process.execPath,['scripts/vixen-podium.mjs','--native-read-tools','--stdin'],{
  cwd:new URL('../',import.meta.url).pathname,input,encoding:'utf8',timeout:30000,
  env:{...process.env,TD613_PODIUM_OPERATOR_DIRECT:'1'}
 });
 const report=JSON.parse(output),r=report.results[0];
 assert.equal(report.native_host_lane,'OPERATOR_DIRECT_ATTESTED_NOT_IDENTITY_PROOF');
 assert.equal(r.status,'HELD','A genuine native math result cannot acquire scientific closure by adapter success');
 assert.equal(r.result.state,'UNVERIFIED_ENGINE_ADAPTER_RETURN');
 assert.equal(r.result.engine,'APERTURE');
 assert.equal(r.result.output.deficit_class,'STRUCTURAL_RANK_DEFICIT');
 assert.equal(r.result.output.disposition,'PROPOSE');
 assert.equal(r.result.output.classification_replay_stability,'HELD_NOT_YET_WITNESSED');
 assert.equal(r.authority.release,false);
 assert.equal(r.authority.empirical_replication_credit,0);
});

test('Shared active-stage controller changes masthead without changing source roles',async()=>{
 const {JSDOM}=await import('jsdom');
 const {setVixenStage}=await import('../app/encyclopedia/reference/vixen-stage-boundary.mjs');
 const doc=new JSDOM('<!doctype html><html><head><title>Vixen Cybernetics</title></head><body>'+
 '<header class="site-header"><div class="header-left">'+
 '<button class="brand">Vixen Cybernetics</button></div>'+
 '<nav class="main-nav">Works</nav><div class="header-actions">Search</div></header>'+
 '<section id="vixenReferenceChamber"><h1>Vixen native Opera</h1></section>'+
 '<aside id="operahouseEncounter" hidden><h2 class="oh-title">Independent Operahouse</h2></aside>'+
 '</body></html>',{url:'https://example.test/'});
 const document=doc.window.document;
 try{
  const x=setVixenStage('OPERAHOUSE',{document,focus:false});
  assert.equal(x.visible_stage,'OPERAHOUSE');
  assert.equal(document.getElementById('vixenReferenceChamber').hidden,true);
  assert.equal(document.getElementById('operahouseEncounter').hidden,false);
  assert.equal(document.body.dataset.activeResearchStage,'OPERAHOUSE');
  assert.match(document.title,/Operahouse/);
  assert.equal(document.getElementById('operahouseStageReturn').hidden,false);
  const y=setVixenStage('VIXEN',{document,focus:false});
  assert.equal(y.visible_stage,'VIXEN_OPERA');
  assert.equal(document.getElementById('vixenReferenceChamber').hidden,false);
  assert.equal(document.getElementById('operahouseEncounter').hidden,true);
  assert.equal(document.title,'Vixen Cybernetics');
  assert.equal(document.getElementById('operahouseStageReturn').hidden,true);
 }finally{doc.window.close()}
});
