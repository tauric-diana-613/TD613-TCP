import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import {
 checkSalonCorpus,composeSalonPlan,refractSalonPlan,toyClockAssay,makePodiumTasks,SALON_SCHEMA,deriveSynthesisHeadline,
 scoreUnifiedSynthesisCandidates,hestenesJacobiSvd,computeMatrixSvdUnified,ANTI_BOILERPLATE_SUBTITLE_RE
} from '../app/encyclopedia/vixen-estate/synthesis-salon-engine.mjs';
import {createVixenPodium,PODIUM_SCHEMA} from '../app/encyclopedia/reference/vixen-podium.mjs';
import {mountVixenSynthesisSalon} from '../app/encyclopedia/vixen-estate/synthesis-salon.mjs';
const raw=await readFile(new URL('../app/encyclopedia/vix-cyb.html',import.meta.url),'utf8');
const match=raw.match(/id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/);
assert(match,'Original archive must remain available');
const corpus=JSON.parse(match[1]);
const input={
 work_ids:[corpus.works[0].work_id,corpus.works[12].work_id],
 source_ids:[corpus.works[0].linked_sources[0].source_file_id,corpus.works[12].linked_sources[0].source_file_id],
 track_id:corpus.giveback_tracks[0].id,protocol_id:corpus.instruments[0].instrument_id,
 route_order:'A_B',lag_ticks:35,question:'What fails when the independent source is never observed?'
};
const run=(intent,params)=>({schema:PODIUM_SCHEMA,intent,params});
test('32/53/8/21/6 source census and pre-existing eight human gates cannot be silently rewritten',()=>{
 const x=checkSalonCorpus(corpus);
 assert.deepEqual(x,{works:32,manifestations:53,human_gates:8,instruments:21,giveback_tracks:6,
  source_class:'HISTORICAL_METADATA',original_source_bodies:'UNAVAILABLE_IN_PUBLIC_SURFACE'});
 const tampered=structuredClone(corpus);tampered.human_gates[0].default_state='HYP_MERGED';
 assert.throws(()=>checkSalonCorpus(tampered),/HUMAN_GATE_PROMOTION_REFUSED/);
 const altered=structuredClone(corpus);altered.works[0].authorship='CERTIFIED_BY_MODEL';
 assert.throws(()=>checkSalonCorpus(altered),/VIXEN_AUTHORED_SOURCE_STATUS_MISSING/);
});
test('two Vixen performers and one documentary method produce a held falsifiable question',()=>{
 const r=composeSalonPlan(corpus,input);
 assert.equal(r.schema,SALON_SCHEMA);
 assert.equal(r.authority.experiment_b_flight,'HELD');
 assert.equal(r.authority.manifest_successor,'UNKNOWN');
 assert.equal(r.source_coordinates.length,2);
 assert.equal(r.source_coordinates[0].work_id,input.work_ids[0]);
 assert.equal(r.source_coordinates[1].work_id,input.work_ids[1]);
 assert.equal(r.source_coordinates[0].source_content_verified,false);
 assert.equal(r.source_coordinates[1].authorship,'UNRESOLVED');
 assert.equal(r.source_coordinates[0].declared_source_sha256,
  corpus.works[0].linked_sources[0].sha256);
 assert.equal(r.hypothesis_class,'FALSIFIABLE_PROPOSAL_NOT_EVIDENCE');
 assert.equal(r.comparative_measurements.length,4);
 assert(r.comparative_measurements.every(x=>x.observed_value===null));
 assert.deepEqual(r.comparative_measurements.map(x=>x.id),
  ['U_QUESTION','F_PROVENANCE','C_VERIFICATION','O_ROUTE']);
 assert.equal(r.cross_source_mechanisms.length,3);
 assert(r.cross_source_mechanisms.every(x=>x.source_class==='CONSTRUCTION'));
 assert.equal(r.documentary_protocol.execution_status,'DOCUMENTARY_PROTOCOL_NOT_EXECUTED');
 assert.deepEqual(r.experiment_b.arms.map(x=>x.id),
  ['ARM_0_TRANSPORT','ARM_1_ARCHIVAL','ARM_2A_MODULAR','ARM_2B_MATCHED_UNION']);
 assert.equal(r.experiment_b.empirical_acquisition_credit,0);
 assert.equal(r.human_gate_constraints.states[1],'UNADJUDICATED_PAIR');
});
test('source substitutions, foreign Opera identifiers, and duplicate Work selection fail closed',()=>{
 assert.throws(()=>composeSalonPlan(corpus,{...input,work_ids:[input.work_ids[0],input.work_ids[0]]}),/TWO_DISTINCT/);
 assert.throws(()=>composeSalonPlan(corpus,{...input,work_ids:[input.work_ids[0],'ECLIPSE-OMEGA']}),/WORK_ID_NOT_IN_VIXEN_CORPUS/);
 assert.throws(()=>composeSalonPlan(corpus,{...input,track_id:'IRRELEVANT'}),/GIVEBACK_TRACK_ID_REQUIRED/);
 assert.throws(()=>composeSalonPlan(corpus,{...input,protocol_id:'UNKNOWN'}),/RECORDED_PROTOCOL_REQUIRED/);
 assert.throws(()=>composeSalonPlan(corpus,{...input,source_ids:['emsrc_FAKE_WITH_UNKNOWN_HASH',input.source_ids[1]]}),/INVALID_SOURCE_IDENTITY/);
});
test('five-clock slider changes toy geometry causally without changing empirical or source status',()=>{
 const early=toyClockAssay({lag:0});
 const late=toyClockAssay({lag:120});
 assert.equal(early.clocks.length,5);
 assert.notDeepEqual(early.clocks.map(x=>x.tick),late.clocks.map(x=>x.tick));
 assert.equal(early.physical_time_equivalence,false);
 assert.equal(early.measured_clock_latency,false);
 assert.equal(late.claim,'SENSITIVITY_DEMONSTRATION_NOT_EMPIRICAL_DERIVATIVE');
});
test('refraction has same terminal Work and manifestation identities but distinct route memory',()=>{
 const x=refractSalonPlan(corpus,input);
 assert.equal(x.terminal_identity_stable,true);
 assert.equal(x.route_memory_non_equivalent,true);
 assert.notDeepEqual(x.original_route,x.refracted_route);
 assert.equal(x.hypothesis_surplus,'UNESTABLISHED');
 assert.equal(x.control_status,'INTERNAL_COUNTERFACTUAL_NOT_SECOND_MATERIALIZED_OPERA');
});
test('Podium tasks require separate operator record choice; never auto-invoke engines or crosswalk',()=>{
 const proposal=composeSalonPlan(corpus,input);
 const batch=makePodiumTasks(proposal);
 assert.equal(batch.tasks.some(x=>x.intent==='universal.get'),false);
 assert.equal(batch.tasks.some(x=>x.intent==='engine.invoke'),false);
 assert.equal(batch.operator_authority_not_encoded_in_json,true);
 const withReference=makePodiumTasks(proposal,{recordId:'G-101'});
 assert.equal(withReference.tasks.filter(x=>x.intent==='universal.get').length,1);
 assert.equal(withReference.tasks.at(-1).params.record_id,'G-101');
 assert.equal(withReference.tasks.at(-1).intent,'synthesis.propose');
 assert.throws(()=>makePodiumTasks({schema:'NOT_THE_SALON'}),/REJECT_NON_SALON_PLAN/);
});
test('machine Podium uses exactly the same Vixen kernel for Salon and Experiment B, holding promotion',async()=>{
 const mem={open:async()=>({state:'CENSUS_MATCHED'}),search:()=>[],getRecord:async()=>({}),
 related:()=>[],status:()=>({state:'UNOPENED'})};
 const conductor=createVixenPodium({corpus,membrane:mem});
 const candidate=await conductor.dispatch(run('vixen.salon.compose',input));
 assert.equal(candidate.status,'HELD');
 assert.equal(candidate.result.plan.schema,SALON_SCHEMA);
 assert.equal(candidate.result.plan.question,composeSalonPlan(corpus,input).question);
 const design=await conductor.dispatch(run('experiment_b.preregister',input));
 assert.equal(design.status,'HELD');
 assert.equal(design.result.experiment_b_flight,'HELD');
 assert.equal(design.result.counterfactual.route_memory_non_equivalent,true);
 assert.equal(design.result.prospective_measurements.length,4);
 assert(design.result.prospective_measurements.every(x=>x.observed_value===null));
 assert.equal(design.result.constructed_mechanisms.length,3);
 assert.equal(design.result.manifest_succession,'UNKNOWN');
 assert.equal(design.authority.empirical_replication_credit,0);
});
test('materialized Salon retains source selectors, research cart, rest, theory and typed receipt',async()=>{
 const dom=new JSDOM('<!doctype html><html><body><div id="vixenSynthesisSalon"></div></body></html>',
  {url:'https://example.test/'});
 const prevDoc=globalThis.document,prevWin=globalThis.window;
 try{
  globalThis.document=dom.window.document;
  globalThis.window=dom.window;
  const saved=new Set();
  dom.window.VIXEN_STUDY_TRAY={
   add:id=>saved.has(id)?false:(saved.add(id),true),
   list:()=>[...saved],has:id=>saved.has(id)
  };
  const app=mountVixenSynthesisSalon({corpus});
  const host=dom.window.document.getElementById('vixenSynthesisSalon');
  assert.equal(app.mounted,true);
  assert.equal(host.dataset.stageRole,'VIXEN_OPERA');
  assert.equal(host.querySelectorAll('.vs-source-card').length,2);
  assert.equal(host.querySelectorAll('.vs-clock-row').length,5);
  const click=piece=>{
   const b=[...host.querySelectorAll('button')].find(x=>x.textContent.includes(piece));
   assert(b,'Button not found: '+piece);b.click()
  };
  click('Place both Works');assert.equal(saved.size,2);
  click('Compose an unratified theory');assert.equal(app.phase(),'PROPOSED');
  assert.equal(host.querySelector('.vs-result').dataset.claimClass,'OPEN_FIELD_UNRATIFIED_QUESTION');
  assert.match(host.textContent,/Experiment B/);
  assert.equal(host.querySelectorAll('.vs-metric').length,4);
  assert.equal(host.querySelectorAll('.vs-metric-label').length,4);
  assert.match(host.textContent,/NOT MEASURED/);
  click('Refract the encounter');assert.match(host.textContent,/Internal refraction/);
  const before=app.getProposal().source_coordinates.map(x=>x.source_file_id);
  click('Rest without penalty');assert.equal(app.phase(),'REST');
  click('Resume this unfinished inquiry');assert.equal(app.phase(),'PROPOSED');
  assert.deepEqual(app.getProposal().source_coordinates.map(x=>x.source_file_id),before);
  const slider=host.querySelector('input.vs-slider');
  slider.value='110';slider.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
  assert.match(host.querySelector('.vs-slider-label').textContent,/110/);
  assert.equal(app.getProposal(),null,'A changed synthetic parameter invalidates the earlier proposal');
 }finally{
  if(prevDoc===undefined)delete globalThis.document;else globalThis.document=prevDoc;
  if(prevWin===undefined)delete globalThis.window;else globalThis.window=prevWin;
  dom.window.close()
 }
});
test('unified synthesis headline engine reacts deterministically across Podium, Salon, Bench & supplemental sources without human leak, boilerplate subtitle, or credit promotion',async()=>{
 const base=deriveSynthesisHeadline({corpus});
 assert.equal(base.regime,'BASELINE_ESTATE_SYNTHESIS');
 assert.equal(ANTI_BOILERPLATE_SUBTITLE_RE.test(base.patternSubtitle),false);
 assert.ok(typeof base.headerTagline==='string'&&base.headerTagline.length>5);
 assert.equal(base.provenance.selected_candidate_id,base.candidates[0].id);
 assert.equal(base.provenance.empirical_replication_credit,0);
 assert.equal(base.provenance.scientific_promotion_authority,false);
 assert.equal(base.provenance.human_closure_required,true);

 // Multi-criteria candidate scoring + Hestenes-Jacobi SVD verification
 const ranked=scoreUnifiedSynthesisCandidates(corpus,{lagTicks:36});
 assert.ok(ranked.candidates.length>=5);
 for(let i=1;i<ranked.candidates.length;i++){
  assert.ok(ranked.candidates[i-1].score>=ranked.candidates[i].score,'Candidates must be sorted descending by score');
 }
 assert.ok(ranked.fadt_profile.exact_descent_clusters.includes('C3'));
 assert.throws(()=>deriveSynthesisHeadline({corpus,customSubtitle:'THE ARCHITECTURE OF GENERIC BOILERPLATE.'}),/BOILERPLATE_SUBTITLE_REJECTED/);
 assert.throws(()=>deriveSynthesisHeadline({corpus,selectedCandidateId:'cand-nonexistent'}),/UNKNOWN_SYNTHESIS_CANDIDATE/);

 const chosen=deriveSynthesisHeadline({corpus,selectedCandidateId:'cand-quotient-holonomy'});
 assert.equal(chosen.provenance.selected_candidate_id,'cand-quotient-holonomy');
 assert.equal(chosen.provenance.operator_selected_candidate,true);
 assert.equal(chosen.patternSubtitle,'MULTI-CLOCK HOLONOMY · EXACT C3 DESCENT.');

 const rank1Svd=hestenesJacobiSvd([[1,2],[2,4]]);
 assert.equal(rank1Svd.rank,1);
 assert.equal(rank1Svd.condition_number,Infinity);
 const rank1Unified=computeMatrixSvdUnified([[1,2],[2,4]]);
 assert.equal(rank1Unified.classification,'RANK_DEFICIENT');
 assert.equal(rank1Unified.condition,Infinity);

 const plan=composeSalonPlan(corpus,input);
 const refr=refractSalonPlan(corpus,input);
 const salonH=deriveSynthesisHeadline({corpus,activePlan:plan});
 assert.equal(salonH.regime,'SALON_COMPOSED_SYNTHESIS');
 assert.notEqual(salonH.headerTagline,base.headerTagline);
 assert.notEqual(salonH.heroStatement,base.heroStatement);

 const refrH=deriveSynthesisHeadline({corpus,activePlan:plan,refraction:refr});
 assert.equal(refrH.regime,'SALON_REFRACTED_SYNTHESIS');
 assert.match(refrH.headerTagline,/Refracted/);

 const suppH=deriveSynthesisHeadline({corpus,supplementalSources:[{id:'SUP-1'},{id:'SUP-2'}]});
 assert.equal(suppH.regime,'SUPPLEMENTAL_CORPUS_SYNTHESIS');
 assert.equal(suppH.provenance.work_census,corpus.works.length+2);
 assert.equal(ANTI_BOILERPLATE_SUBTITLE_RE.test(suppH.patternSubtitle),false);
 assert.match(suppH.patternSubtitle,/WIDENED QUOTIENT SUPPORT/);

 const benchTombstone=deriveSynthesisHeadline({corpus,withdrawnCount:1});
 assert.equal(benchTombstone.regime,'TOMBSTONE_BOUNDED_SYNTHESIS');

 const mem={open:async()=>({state:'CENSUS_MATCHED'}),search:()=>[],getRecord:async()=>({}),
  related:()=>[],status:()=>({state:'UNOPENED'})};
 const conductor=createVixenPodium({corpus,membrane:mem});
 const d0=await conductor.dispatch(run('podium.describe',{}));
 assert.equal(d0.result.synthesis_headline.regime,'PODIUM_EVENT_SYNTHESIS');
 const c1=await conductor.dispatch(run('vixen.salon.compose',input));
 assert.equal(c1.result.synthesis_headline.regime,'SALON_COMPOSED_SYNTHESIS');
 const d1=await conductor.dispatch(run('podium.describe',{}));
 assert.equal(d1.result.synthesis_headline.regime,'SALON_COMPOSED_SYNTHESIS');

 for(const obj of [base,chosen,salonH,refrH,suppH,benchTombstone,d1.result.synthesis_headline]){
  const txt=JSON.stringify(obj);
  assert.equal(/Khona|Research Atelier|RESEARCH ATELIER|DERIVATIVE CLOCK CUSTODY/i.test(txt),false);
  assert.equal(/COMPARATIVE LINEAGE|METHOD V0\.1|relative to TD613|Em-side/i.test(txt),false);
  assert.equal(/\bTHE\s+ARCHITECTURE\s+OF\b/i.test(obj.patternSubtitle),false);
  assert(typeof obj.researchQuestionMeta==='string'&&obj.researchQuestionMeta.length>0);
  assert(typeof obj.researchQuestion==='string'&&obj.researchQuestion.length>20);
 }
 const dictated=deriveSynthesisHeadline({
  corpus,
  operatorQuestion:'How do SPSC ring-buffer memory barriers map onto multi-clock epistemic holds?',
  operatorMethod:'OPERATOR DICTATED · PODIUM INQUIRY · UNRATIFIED'
 });
 assert.equal(dictated.regime,'OPERATOR_DICTATED_SYNTHESIS');
 assert.equal(dictated.researchQuestionMeta,'OPERATOR DICTATED · PODIUM INQUIRY · UNRATIFIED');
 assert.match(dictated.researchQuestion,/SPSC ring-buffer/);
 assert.equal(dictated.provenance.operator_dictated_question,true);
 assert.equal(dictated.provenance.empirical_replication_credit,0);
 assert.equal(dictated.provenance.scientific_promotion_authority,false);

 const {
  synthesizeOutsidePerspectiveConjectures,
  computeSalonObservatoryDiagnostics
 }=await import('../app/encyclopedia/vixen-estate/synthesis-salon-engine.mjs');
 const conjectures=synthesizeOutsidePerspectiveConjectures(corpus,{lagTicks:36,limit:7});
 assert.equal(conjectures.length,7);
 for(const c of conjectures){
  assert.ok(Array.isArray(c.clusters)&&c.clusters.length>=1);
  assert.ok(typeof c.now_notice==='string'&&c.now_notice.length>10);
  assert.ok(typeof c.exact_falsifier==='string'&&c.exact_falsifier.length>10);
  assert.equal(c.claim_ceiling,'UNRATIFIED_OUTSIDE_PERSPECTIVE_CONJECTURE_NOT_EVIDENCE');
 }
 const diag=computeSalonObservatoryDiagnostics({
  clock_probe:{lag_ticks:36},
  measurement_operator:{matrix:[[1,0.25],[0,0.85]]}
 });
 assert.equal(diag.schema,'emstd613.vixen.salon-observatory-diagnostics/v1');
 assert.equal(diag.vernier_summary.non_commutative_witness,true);
 assert.equal(diag.mirror_111.projection_orthogonal_to_111,true);
 assert.equal(diag.xor_synergy.synergistic_emergence,true);
 assert.equal(diag.epistemic_ceiling.empirical_credit,0);
});
