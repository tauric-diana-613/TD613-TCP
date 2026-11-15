import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile,mkdtemp,cp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createVixenPodium,PODIUM_SCHEMA,PODIUM_ROUTES} from '../app/encyclopedia/reference/vixen-podium.mjs';
const repoRoot=fileURLToPath(new URL('../',import.meta.url));
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
  cwd:repoRoot,input:JSON.stringify(batch),encoding:'utf8',timeout:30000
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
  cwd:repoRoot,encoding:'utf8'
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
  cwd:repoRoot,input,encoding:'utf8',timeout:25000,
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
  cwd:repoRoot,input,encoding:'utf8',timeout:30000,
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

test('Podium CLI stays read-only by default and persists synthesis state only with explicit --write-synthesis',async()=>{
 const defaultOut=JSON.parse(execFileSync(process.execPath,['scripts/vixen-podium.mjs','--stdin'],{
  cwd:repoRoot,
  input:JSON.stringify(task('podium.describe',{
   research_question:'When do non-commuting audio and hypervisor clocks require typed witnesses?'
  })),
  encoding:'utf8',
  timeout:30000
 }));
 assert.equal(defaultOut.persisted_synthesis_path,null);
 assert.match(defaultOut.results[0].result.synthesis_headline.researchQuestion,/non-commuting audio/);

 const sandbox=await mkdtemp(join(tmpdir(),'vixen-podium-synth-'));
 try{
  await cp(join(repoRoot,'app','encyclopedia'),join(sandbox,'app','encyclopedia'),{recursive:true});
  const writeOut=JSON.parse(execFileSync(process.execPath,[
   'scripts/vixen-podium.mjs','--root',sandbox,'--write-synthesis','--stdin'
  ],{
   cwd:repoRoot,
   input:JSON.stringify(task('vixen.salon.compose',{
    work_ids:[corpus.works[0].work_id,corpus.works[13].work_id],
    track_id:corpus.giveback_tracks[0].id,
    protocol_id:corpus.instruments[0].instrument_id,
    lag_ticks:48,route_order:'A_B',
    research_question:'What non-collapsing invariants couple SPSC audio rings to hypervisor algedonic interrupts?',
    method_label:'EM PODIUM SESSION · UNRATIFIED'
   })),
   encoding:'utf8',
   timeout:30000
  }));
  assert.equal(writeOut.persisted_synthesis_path,'vixen-estate/podium-synthesis.json');
  const persisted=JSON.parse(await readFile(join(sandbox,'app','encyclopedia','vixen-estate','podium-synthesis.json'),'utf8'));
  assert.equal(persisted.schema,'emstd613.vixen.podium-synthesis-state/v1');
  assert.equal(persisted.operator_method,'EM PODIUM SESSION · UNRATIFIED');
  assert.match(persisted.synthesis_headline.researchQuestion,/SPSC audio rings/);
  assert.equal(persisted.empirical_replication_credit,0);
  assert.equal(persisted.scientific_promotion_authority,false);
  assert.equal(persisted.release_authority,false);
  assert.ok(Array.isArray(persisted.synthesis_log)&&persisted.synthesis_log.length>=2);

  // Second synthesis update appends monotonically; --list-syntheses and --rollback revert cleanly
  const secondWrite=JSON.parse(execFileSync(process.execPath,[
   'scripts/vixen-podium.mjs','--root',sandbox,'--write-synthesis','--stdin'
  ],{
   cwd:repoRoot,
   input:JSON.stringify(task('synthesis.propose',{
    operator_directive:true,
    page_subtitle:'THE ARCHITECTURE OF NON-RETROACTIVE ROLLBACK.',
    inquiry_question:'Can Podium proposals append and roll back without erasing predecessor chains?'
   })),
   encoding:'utf8',
   timeout:30000
  }));
  const listOut=JSON.parse(execFileSync(process.execPath,[
   'scripts/vixen-podium.mjs','--root',sandbox,'--list-syntheses'
  ],{cwd:repoRoot,encoding:'utf8',timeout:30000}));
  assert.equal(listOut.active_entry_id,secondWrite.persisted_entry_id);
  assert.ok(listOut.count>=3);

  const rollbackOut=JSON.parse(execFileSync(process.execPath,[
   'scripts/vixen-podium.mjs','--root',sandbox,'--rollback','syn-0000-baseline'
  ],{cwd:repoRoot,encoding:'utf8',timeout:30000}));
  assert.equal(rollbackOut.status,'ROLLED_BACK');
  assert.equal(rollbackOut.restored_entry_id,'syn-0000-baseline');

  const postRollback=JSON.parse(await readFile(join(sandbox,'app','encyclopedia','vixen-estate','podium-synthesis.json'),'utf8'));
  assert.equal(postRollback.active_entry_id,'syn-0000-baseline');
  assert.equal(postRollback.synthesis_headline.patternSubtitle,'THE ARCHITECTURE OF NON-COLLAPSING PLANES.');
  assert.equal(postRollback.synthesis_log.length,listOut.count+1);
  assert.equal(postRollback.synthesis_log[postRollback.synthesis_log.length-1].kind,'ROLLBACK');
  assert.equal(postRollback.synthesis_log[postRollback.synthesis_log.length-1].predecessor_entry_id,secondWrite.persisted_entry_id);
 }finally{
  await rm(sandbox,{recursive:true,force:true});
 }
});

test('All 5 native Podium adapters execute boundedly, expressed directives auto-open, and session-zip builds PKZIP',async()=>{
 const {createVixenPodium,BOUNDED_ENGINE_OPERATIONS}=await import('../app/encyclopedia/reference/vixen-podium.mjs');
 const {createPodiumNativeReadAdapters}=await import('../scripts/vixen-podium-native-adapters.mjs');
 const {collectVixenSessionFiles,buildVixenSessionZipBytes,crc32Bytes}=await import('../app/encyclopedia/vixen-estate/session-zip.mjs');
 const html=await readFile(join(repoRoot,'app','encyclopedia','vix-cyb.html'),'utf8');
 const corpus=JSON.parse(html.match(/<script[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/)[1]);

 const adapters=await createPodiumNativeReadAdapters({repoRoot});
 for(const slot of ['APERTURE','ATLAS','DOLLHOUSE','RULEFIELD','UNIVERSAL_ATELIER']){
  assert.equal(typeof adapters[slot],'function','Expected connected adapter: '+slot);
  assert.ok(Array.isArray(BOUNDED_ENGINE_OPERATIONS[slot])&&BOUNDED_ENGINE_OPERATIONS[slot].length>=3);
 }

 const refDir=join(repoRoot,'app','encyclopedia','reference');
 const mem={
  state:'UNOPENED',
  async open(){this.state='CENSUS_MATCHED';return {state:'CENSUS_MATCHED'}},
  search:(q)=>q?[{id:'G-001',label:'Eclipse–Omega',family:'I'}]:[],
  async getRecord(id){return JSON.parse(await readFile(join(refDir,'records',id+'.json'),'utf8'))},
  related:()=>({outgoing:[],incoming:[]}),
  status:()=>({state:mem.state})
 };

 // Expressed operator directive auto-opens reference index; unauthorized caller stays HELD
 const unauth=createVixenPodium({corpus,membrane:mem,operatorAuthorized:false});
 const heldSearch=await unauth.dispatch({schema:'td613.vixen.podium.task/v1',intent:'universal.search',params:{query:'Eclipse'}});
 assert.equal(heldSearch.status,'HELD');
 assert.equal(heldSearch.result.state,'HELD_INDEX_NOT_OPEN');

 const autoDir=createVixenPodium({corpus,membrane:mem,operatorAuthorized:true,engineAdapters:adapters});
 const okSearch=await autoDir.dispatch({schema:'td613.vixen.podium.task/v1',intent:'universal.search',params:{query:'Eclipse',auto_open:true}});
 assert.notEqual(okSearch.result.state,'HELD_INDEX_NOT_OPEN');

 // Invoke all 5 engine slots safely
 const calls=[
  ['APERTURE','observatory_diagnostics',{clock_probe:{lag_ticks:36},measurement_operator:{matrix:[[1,0.25],[0,0.85]]}}],
  ['ATLAS','fadt_fiber_audit',{fiber_rows:[{state:'a',support:['S1','S2']},{state:'b',support:['S2','S3']}]}],
  ['DOLLHOUSE','fadt_reparative_packet',{fiber_rows:[{state:'a',support:['S1','S2']},{state:'b',support:['S2','S3']}]}],
  ['RULEFIELD','propose_rulefield',{work_ids:[corpus.works[0].work_id,corpus.works[1].work_id],track_id:corpus.giveback_tracks[0].id,protocol_id:corpus.instruments[0].instrument_id,lag_ticks:36}],
  ['UNIVERSAL_ATELIER','verify',{id:'G-001'}]
 ];
 for(const [engine,operation,payload] of calls){
  const r=await autoDir.dispatch({schema:'td613.vixen.podium.task/v1',intent:'engine.invoke',params:{engine,operation,payload}});
  assert.equal(r.result.state,'UNVERIFIED_ENGINE_ADAPTER_RETURN');
  assert.equal(r.result.scientific_credit,0);
 }

 // Verify pure-JS PKZIP archive builder & collector
 const mockFetch=async(url)=>{
  const u=new URL(url);
  const rel=u.pathname.replace(/^\//,'');
  const abs=join(repoRoot,'app',rel);
  try{
   const bytes=await readFile(abs);
   return {ok:true,arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)};
  }catch(_){return {ok:false};}
 };
 const collected=await collectVixenSessionFiles({
  baseHref:'http://127.0.0.1/encyclopedia/vix-cyb.html',
  fetcher:mockFetch,
  synthesisState:autoDir.synthesisState(),
  sessionMeta:{study_tray_work_ids:[corpus.works[0].work_id]}
 });
 const paths=collected.entries.map(e=>e.path);
 assert.ok(paths.includes('SESSION_START_HERE.md'));
 assert.ok(paths.includes('encyclopedia/vix-cyb.html'));
 assert.ok(paths.includes('encyclopedia/vix-cyb/llms.txt'));
 assert.ok(paths.includes('encyclopedia/vixen-estate/podium-synthesis.json'));
 assert.ok(paths.includes('encyclopedia/vixen-estate/session-state.json'));

 const zip=buildVixenSessionZipBytes(collected.entries);
 assert.equal(zip[0],0x50); // 'P'
 assert.equal(zip[1],0x4b); // 'K'
 assert.equal(zip[2],0x03);
 assert.equal(zip[3],0x04);
 assert.ok(crc32Bytes(zip)>0);
});
