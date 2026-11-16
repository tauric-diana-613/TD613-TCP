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
 assert.equal(w.result.linked_sources[0].source_body_access,'EXPERIMENT_A_PREVIEW_AUTHORIZED');
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
 assert.equal(report.source_custody,'EXPERIMENT_A_PREVIEW_AUTHORIZED');
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

test('Machine Podium autonomously scores source-bound visual architecture, stops at Compose, and refuses user-synthesis mutation',async()=>{
 const one=createVixenPodium({corpus,membrane:mock()});
 const proposal={research_question:'Which meaning-preserving visual form best expresses the mathematical source?',
  source_changes:[{source_file_id:source.source_file_id,action:'EXCLUDE',reason:'Possible incomplete PDF; await forensic verification'}],
  visual_proposals:[{
   id:'NEW_GRAMMAR_OUTSIDE_EXISTING_CHARTS',
   title:'An open-ended source-bound representation',
   family:'OPERATOR_DEFINED_MATHEMATICAL_FORM',
   evidence:{source_ids:[source.source_file_id],locators:[{
    source_id:source.source_file_id,locator:'identified source coordinate',
    supports:'provisional mathematical representation (not body verification)'
   }]},
   mathematical_model:{observables:['bounded x(t)'],transformations:['T(x,t)'],
    assumptions:['constructed model'],falsifiers:['transform violates source equation']},
   data_mapping:{channels:[{observable:'bounded x(t)',
    visual_channel:'new source-conditioned spatial gesture',
    units:'normalized',interpretation:'illustrative model, not independent observation'}]},
   visual_grammar:{description:'New composition family outside preinstalled renderer catalogue',
    primitives:['new abstract geometric unit'],composition_rules:['meaning preserving transformation']},
   interaction_contract:{interaction_model:'bounded controls',reduced_motion_fallback:'static view',
    nonvisual_equivalent:'equation and source-bound table'},
   transition:{replaces_lab_id:'LAB_RC-09',rollback_form_id:'HOLONOMY',
    failure_modes:['source interpretation unsettled']},
   renderer_plan:{implementation_strategy:'separate reviewed renderer',
    validation_plan:'geometry, semantics and accessibility in exact-head Chromium'}
  }]};
 const scored=await one.dispatch(task('podium.score',proposal));
 assert.equal(scored.status,'SUPPORTED',JSON.stringify(scored.result).slice(0,600));
 assert.equal(scored.result.synthesis.selected.score>=0,true);
 assert.equal(scored.result.changes_count>=6,true);
 assert.match(scored.result.score_sha256,/^[0-9a-f]{64}$/);
 assert.equal(scored.result.source_census.source_changes[0].action,'EXCLUDE');
 assert.equal(scored.result.source_census.source_changes[0].current_state_mutated,false);
 assert.equal(scored.result.visuals.selected.id.length>0,true);
 assert.equal(scored.result.optical.B_prepaint_beat_diagnostics.pairs.length,3);
 assert.equal(scored.result.optical.additional_pipelines.carrier_count,39);
 assert.equal(scored.result.optical.D_viewport_DPR_sampling_clock.single_host_clock_required,true);
 assert.ok(scored.result.human_readable_score.includes('SOURCE-01'));
 assert.equal(scored.result.visuals.selected.id,'NEW_GRAMMAR_OUTSIDE_EXISTING_CHARTS');
 assert.equal(scored.result.visuals.selected.status,'CANDIDATE_READY_FOR_REVIEW');
 assert.equal(scored.result.visuals.selected.renderer_installed,false);
 assert.equal(scored.result.visuals.open_form_protocol.form_family_whitelist,null);
 assert.equal(scored.result.visuals.open_form_protocol.active_observatory_form_unchanged,true);
 assert.equal(scored.result.visuals.audition.eligible_count,1);
 assert.equal(scored.result.visuals.audition.candidates[0].id,'NEW_GRAMMAR_OUTSIDE_EXISTING_CHARTS');
 assert.match(scored.result.visuals.audition.candidates[0].standalone_html,/<!doctype html>/i);
 assert.match(scored.result.visuals.audition.gallery_html,/sandbox=""/);
 assert.equal(scored.result.visuals.audition.canonical_writes,0);
 assert.match(scored.result.human_readable_score,/Visual auditions/);
 assert.equal(scored.result.salon_optical_performance.coupled_pipeline_evidence.RGI14_opaline_ribs,39);
 assert.equal(scored.result.salon_optical_performance.coupled_pipeline_evidence.RGI13_room_mesh_carriers,39);
 assert.equal(scored.result.salon_optical_performance.coupled_pipeline_evidence.swarm_agents,39);
 assert.equal(scored.result.salon_optical_performance.four_macro_operators.B_beat_prepaint.pairs.length,3);
 assert.equal(scored.result.salon_optical_performance.stage_preview_binding.live_site_not_changed,true);
 const held=await one.dispatch(task('podium.compose',{...proposal,approved:true,publish:true}));
 assert.equal(held.status,'HELD');
 assert.equal(held.result.status,'HELD_AWAITING_HUMAN_COMPOSER');
 assert.equal(held.result.score_sha256,scored.result.score_sha256);
 assert.equal(held.result.canonical_commit,false);
 assert.equal(held.result.task_json_authentication,false);
 const edited=await one.dispatch(task('podium.compose',{...proposal,
  research_question:'Human edit: different research question for the score'}));
 assert.notEqual(edited.result.score_sha256,held.result.score_sha256);
 const defaultOut=JSON.parse(execFileSync(process.execPath,['scripts/vixen-podium.mjs','--stdin'],{
  cwd:repoRoot,input:JSON.stringify(task('podium.describe',{})),encoding:'utf8',timeout:30000
 }));
 assert.equal(defaultOut.persisted_synthesis_path,null);
 const sandbox=await mkdtemp(join(tmpdir(),'vixen-hitl-custody-'));
 try{
  await cp(join(repoRoot,'app','encyclopedia'),join(sandbox,'app','encyclopedia'),{recursive:true});
  const base=join(sandbox,'app','encyclopedia');
  const beforeState=await readFile(join(base,'vixen-estate','podium-synthesis.json'),'utf8');
  const beforeSite=await readFile(join(base,'vix-cyb.html'),'utf8');
  for(const flags of [['--write-synthesis','--stdin'],['--sync-html'],['--rollback','syn-0000-baseline']]){
   assert.throws(()=>execFileSync(process.execPath,['scripts/vixen-podium.mjs','--root',sandbox,...flags],
    {cwd:repoRoot,input:JSON.stringify(task('podium.describe',{approved:true})),
     encoding:'utf8',timeout:30000,env:{...process.env,TD613_PODIUM_OPERATOR_DIRECT:'1'},stdio:['pipe','pipe','pipe']}));
  }
  assert.equal(await readFile(join(base,'vixen-estate','podium-synthesis.json'),'utf8'),beforeState);
  assert.equal(await readFile(join(base,'vix-cyb.html'),'utf8'),beforeSite);
 }finally{await rm(sandbox,{recursive:true,force:true})}
 const candidates=JSON.parse(execFileSync(process.execPath,['scripts/vixen-podium.mjs','--score-candidates'],
  {cwd:repoRoot,encoding:'utf8',timeout:30000}));
 assert.ok(candidates.top_candidate);
 const bp=await one.dispatch(task('podium.describe',{pattern_subtitle:'THE ARCHITECTURE OF GENERIC TEMPLATES.'}));
 assert.equal(bp.status,'HELD');
 assert.equal(bp.result.state,'BOILERPLATE_SUBTITLE_REJECTED');
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


test('Vixen Podium wires SignalRupture Canon (SRC_ATELIER), heterostratigraphic audit, AIx conducting, and CLI fail-closed custody', async () => {
  const podiumMod=await import('../app/encyclopedia/reference/vixen-podium.mjs');
  const adaptersMod=await import('../scripts/vixen-podium-native-adapters.mjs');
  const searchMod=await import('../app/encyclopedia/vixen-estate/semantic-semiotic-search.mjs');
  const srcMod=await import('../app/encyclopedia/vixen-estate/src-atelier-engines.mjs');
  const {readFileSync}=await import('node:fs');
  const {execFileSync,spawnSync}=await import('node:child_process');
  const repoRoot=new URL('..',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1');
  const rawHtml=readFileSync(new URL('../app/encyclopedia/vix-cyb.html',import.meta.url),'utf8');
  const bundleMatch=rawHtml.match(/id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/);
  const corpus=JSON.parse(bundleMatch[1]);

  const engineAdapters=await adaptersMod.createPodiumNativeReadAdapters({repoRoot});
  assert.equal(typeof engineAdapters.SRC_ATELIER,'function');
  const semanticSearch=await searchMod.loadSemanticSemioticEngine();

  const podium=podiumMod.createVixenPodium({
    corpus,
    engineAdapters,
    semanticSearch,
    operatorAuthorized:true,
    membrane:{
      open:async()=>({state:'CENSUS_MATCHED',edition:'1.4',records:1141,edges:2131}),
      search:(q)=>q.includes('Aperture')?[{id:'UNIV-TEST-1',title:'Universal Stub'}]:[],
      getRecord:async()=>({}),
      related:()=>[],
      status:()=>({state:'OPENED'})
    }
  });

  const desc=await podium.dispatch({schema:podiumMod.PODIUM_SCHEMA,intent:'podium.describe',params:{}});
  assert.equal(desc.status,'SUPPORTED');
  assert.equal(desc.result.aix_conductor.canon_name,'SignalRupture Canon (SRC)');
  assert.ok(desc.result.aix_conductor.semantic_search_modes.includes('src_projective'));
  assert.equal(desc.result.aix_conductor.semantic_search_attached,true);

  const workInspect=await podium.dispatch({
    schema:podiumMod.PODIUM_SCHEMA,
    intent:'vixen.work.inspect',
    params:{work_id:corpus.works[0].work_id}
  });
  assert.equal(workInspect.status,'SUPPORTED');
  assert.equal(workInspect.result.src_heterostratigraphic_context.canon_name,'SignalRupture Canon (SRC)');
  assert.equal(workInspect.result.src_heterostratigraphic_context.composite_state_score,null);

  const caps=await podium.dispatch({schema:podiumMod.PODIUM_SCHEMA,intent:'engine.capabilities',params:{}});
  assert.equal(caps.result.adapters.SRC_ATELIER.connected,true);
  assert.ok(caps.result.adapters.SRC_ATELIER.allowed_operations.includes('src_projective_routing'));
  assert.ok(caps.result.adapters.SRC_ATELIER.allowed_operations.includes('src_phase2_tomography'));
  assert.ok(caps.result.adapters.SRC_ATELIER.allowed_operations.includes('src_untypical_retrieval'));
  assert.ok(caps.result.adapters.SRC_ATELIER.allowed_operations.includes('src_heterostratigraphic_audit'));
  assert.ok(caps.result.adapters.ATLAS.allowed_operations.includes('vixen_semantic_search'));

  const tomoOut=await podium.dispatch({
    schema:podiumMod.PODIUM_SCHEMA,
    intent:'engine.invoke',
    params:{
      engine:'SRC_ATELIER',
      operation:'src_phase2_tomography',
      payload:{
        lift_candidates:[{transformation_id:'lift-1',from_id:'raw',to_id:'TCC-01',claim_effects:{scope:'EXPANDED'}}]
      }
    }
  });
  assert.equal(tomoOut.status,'HELD');
  assert.equal(tomoOut.result.output.composite_score,null);
  assert.equal(tomoOut.result.output.empirical_replication_credit,0);

  const untypicalOut=await podium.dispatch({
    schema:podiumMod.PODIUM_SCHEMA,
    intent:'engine.invoke',
    params:{
      engine:'SRC_ATELIER',
      operation:'src_untypical_retrieval',
      payload:{
        query:'The street knows more than the office.',
        mode:'src_projective'
      }
    }
  });
  assert.equal(untypicalOut.status,'HELD');
  assert.equal(untypicalOut.result.output.src_conditioning.regime_id,'Q_reader');
  assert.equal(untypicalOut.result.output.contract,'EMSTD613_SUBJECT_ONLY_NO_FOREIGN_SRC_BODIES');
  assert.ok(untypicalOut.result.output.hits.length>=1);

  const heteroOut=await podium.dispatch({
    schema:podiumMod.PODIUM_SCHEMA,
    intent:'engine.invoke',
    params:{
      engine:'SRC_ATELIER',
      operation:'src_heterostratigraphic_audit',
      payload:{
        corpus,
        operator_question:'Tú puedes clonarme, pero no tienes mis genes.',
        candidate_envelope:{composite_state_score:0.99,global_truth:0.8}
      }
    }
  });
  assert.equal(heteroOut.status,'HELD');
  assert.equal(heteroOut.result.output.canon_name,'SignalRupture Canon (SRC)');
  assert.deepEqual(heteroOut.result.output.corpus_rooms,['FORMAL_SR','FICTIONAL_SR','GOVERNANCE_PROVENANCE_SR']);
  assert.deepEqual(heteroOut.result.output.authority_axes,['G','C','E','F','K']);
  assert.deepEqual(heteroOut.result.output.epistemic_state_axes,['E','V','R','P','L','A']);
  assert.equal(heteroOut.result.output.epistemic_non_implication.composite_state_score,null);
  assert.equal(heteroOut.result.output.tomography_composite_score,null);
  assert.equal(heteroOut.result.output.clone_genes_decoded,false);
  assert.equal(heteroOut.result.output.universalizer_guard.accepted,false);
  assert.ok(heteroOut.result.output.universalizer_guard.present_forbidden_fields.includes('composite_state_score'));

  // Direct SRC invariant unit assertions
  const univCheck=srcMod.rejectSrcUniversalizer({composite_state_score:0.5});
  assert.equal(univCheck.accepted,false);
  const relCheck=srcMod.classifySrcRelationContinuity({
    leftType:'operator',rightType:'signature',sharedSignature:true,multiHopPathOnly:true
  });
  assert.equal(relCheck.type_mismatch,true);
  assert.equal(relCheck.scientific_object_identity,'TYPE_MISMATCH');
  assert.equal(relCheck.clone_genes_decoded,false);
  assert.equal(relCheck.path_lifts_to_direct_edge,false);

  // Separated universal.search + EMSTD613 vixen_search lane
  const mergedSep=await podium.dispatch({
    schema:podiumMod.PODIUM_SCHEMA,
    intent:'universal.search',
    params:{query:'Aperture',include_vixen_search:true,mode:'src_projective',limit:4}
  });
  assert.equal(mergedSep.status,'SUPPORTED');
  assert.equal(mergedSep.result.hits[0].id,'UNIV-TEST-1');
  assert.equal(mergedSep.result.vixen_search.available,true);
  assert.equal(mergedSep.result.vixen_search.cross_opera_merged,false);
  assert.equal(mergedSep.result.vixen_search.estate,'EMSTD613');

  // Strict schema rejection on dispatch vs shorthand AIx conductor batch on conduct()
  const badDispatch=await podium.dispatch({search:'Aperture'});
  assert.equal(badDispatch.status,'HELD');
  assert.equal(badDispatch.result.state,'HELD_TASK_CONTRACT');

  const batch=await podium.conduct([
    {search:'Explore Aperture.',mode:'src_projective',limit:3},
    {src_heterostratigraphic:{operatorQuestion:'Where does path existence diverge from endpoint identity?'}},
    {propose_headline:{research_question:'Does heterostratigraphic stratification block composite scalar universalizers?',lag_ticks:36}}
  ]);
  assert.equal(batch.schema,'td613.vixen.podium.conduct-batch/v1');
  assert.equal(batch.canon_name,'SignalRupture Canon (SRC)');
  assert.equal(batch.step_count,3);
  assert.equal(batch.steps[0].status,'SUPPORTED');
  assert.equal(batch.steps[0].result.cross_opera_merged,false);
  assert.equal(batch.steps[1].status,'HELD');
  assert.equal(batch.steps[1].result.clone_genes_decoded,false);
  assert.equal(batch.empirical_replication_credit,0);
  assert.equal(batch.release_authority,false);
  assert.equal(batch.human_closure_required,true);

  // CLI --search & --src-audit fail closed without TD613_PODIUM_OPERATOR_DIRECT=1 and succeed with it
  const failCli=spawnSync(process.execPath,['scripts/vixen-podium.mjs','--native-read-tools','--search','Aperture'],{
    cwd:repoRoot,encoding:'utf8',env:{...process.env,TD613_PODIUM_OPERATOR_DIRECT:'0'}
  });
  assert.notEqual(failCli.status,0);
  assert.match(failCli.stderr,/HELD_OPERATOR_DIRECT_NATIVE_LANE_NOT_ATTESTED/);

  const okCliSearch=JSON.parse(execFileSync(
    process.execPath,
    ['scripts/vixen-podium.mjs','--native-read-tools','--search','Explore Aperture.','--mode','src_projective','--limit','4'],
    {cwd:repoRoot,encoding:'utf8',env:{...process.env,TD613_PODIUM_OPERATOR_DIRECT:'1'}}
  ));
  assert.equal(okCliSearch.schema,'td613.vixen.podium.cli-search/v1');
  assert.equal(okCliSearch.receipt.status,'SUPPORTED');
  assert.equal(okCliSearch.receipt.result.cross_opera_merged,false);
  assert.equal(okCliSearch.empirical_replication_credit,0);
  assert.equal(okCliSearch.human_closure_required,true);

  const okCliAudit=JSON.parse(execFileSync(
    process.execPath,
    ['scripts/vixen-podium.mjs','--native-read-tools','--src-audit','--question','Tú puedes clonarme, pero no tienes mis genes.'],
    {cwd:repoRoot,encoding:'utf8',env:{...process.env,TD613_PODIUM_OPERATOR_DIRECT:'1'}}
  ));
  assert.equal(okCliAudit.schema,'td613.vixen.podium.cli-src-audit/v1');
  assert.equal(okCliAudit.receipt.status,'HELD');
  assert.equal(okCliAudit.receipt.result.canon_name,'SignalRupture Canon (SRC)');
  assert.equal(okCliAudit.receipt.result.tomography_composite_score,null);
  assert.equal(okCliAudit.receipt.result.clone_genes_decoded,false);
});


test('Podium 16-route fusion research conductor validates, compares, and cites without execution authority',async()=>{
  const {SemanticSemioticSearchEngine}=await import('../app/encyclopedia/vixen-estate/semantic-semiotic-search.mjs');
  const raw=JSON.parse(await readFile(new URL('vixen-estate/semantic-semiotic-index.v1.json',root),'utf8'));
  const engine=new SemanticSemioticSearchEngine(raw);
  const podium=createVixenPodium({corpus,semanticSearch:engine,membrane:mock()});
  assert.equal(PODIUM_ROUTES.length,19);
  assert.equal((await podium.dispatch(task('podium.describe'))).result.aix_conductor.fusion_controls.finite_comparison_limit,6);
  const cap=await podium.dispatch(task('vixen.fusion.capabilities'));
  assert.equal(cap.status,'SUPPORTED');
  assert.equal(cap.result.connected,true);
  assert.ok(cap.result.profiles.NO_SEMIOTIC);
  const query='algedonic bypass viability';
  const got=await podium.dispatch(task('vixen.fusion.search',{
    query,profile:'NO_SEMIOTIC',mode:'hybrid',limit:8
  }));
  assert.equal(got.status,'SUPPORTED',JSON.stringify(got.result).slice(0,450));
  assert.equal(got.result.search.fusion_controls.channels.semiotic,false);
  assert.ok(got.result.search.hits.length>0);
  assert.ok(got.result.search.hits.every(h=>h.s_semi===0));
  assert.equal(got.authority.deployment,false);
  const cmp=await podium.dispatch(task('vixen.fusion.compare',{
    query,mode:'hybrid',profiles:['FULL_FUSION','NO_SEMANTIC','NO_SEMIOTIC'],limit:10
  }));
  assert.equal(cmp.status,'SUPPORTED',JSON.stringify(cmp.result).slice(0,500));
  assert.equal(cmp.result.comparisons.length,3);
  assert.ok(cmp.result.anchor_deltas.length>0);
  assert.equal(cmp.result.empirical_replication_credit,0);
  const id=got.result.search.hits[0].id;
  const explanation=await podium.dispatch(task('vixen.fusion.explain',{
    query,hit_id:id,mode:'hybrid',profile:'NO_SEMIOTIC',limit:8
  }));
  assert.equal(explanation.status,'SUPPORTED',JSON.stringify(explanation.result).slice(0,500));
  assert.equal(explanation.result.scoring.effective_contributions.semiotic,0);
  assert.equal(explanation.result.claim_ceiling,'SEARCH_EVIDENCE_ONLY_NOT_SEMANTIC_ENTAILMENT');
  const bounded=await podium.dispatch(task('vixen.fusion.compare',{
    query,profiles:['FULL_FUSION','NO_SEMIOTIC','NO_SEMANTIC','LEXICAL_ONLY','SRC_ONLY','SEMANTIC_ONLY','NO_SRC']
  }));
  assert.equal(bounded.status,'HELD');
  const noEngine=createVixenPodium({corpus,membrane:mock()});
  const refused=await noEngine.dispatch(task('vixen.fusion.search',{query}));
  assert.equal(refused.status,'HELD');
  assert.equal(refused.result.state,'HELD_FUSION_ENGINE_NOT_ATTACHED');
  assert.equal(refused.authority.release,false);
});
