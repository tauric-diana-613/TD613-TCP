#!/usr/bin/env node
/**
 * Two FULL read-only host-side MAESTRO witness scenarios.
 * NO invented human choices: the operator path is a transparent simulation.
 * Actual programmatic Vixen catalogue reads, real Work derivative bytes,
 * original-source executables and adverse controls execute on the host.
 * "Independently audited" means a separately implemented audit oracle; NOT
 * external-source provenance, human observation or empirical replication.
 */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createVixenAiSession} from '../app/encyclopedia/vixen-estate/vixen-ai-session.mjs';
import {createVixenPodium,PODIUM_SCHEMA} from '../app/encyclopedia/reference/vixen-podium.mjs';
import {createPodiumNativeReadAdapters} from './vixen-podium-native-adapters.mjs';
import {loadOriginalPublicFixture} from './wendbine-proscenium-assay.mjs';
import {buildDualAtelierCapabilityMatrix} from './vixen-dual-atelier-capability-matrix.mjs';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const SHA=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const assert=(ok,code)=>{if(!ok)throw Error(code)};
const WORK_IDS=Object.freeze(['emwork_dd9a66eba0e2dde8e29f00f6','emwork_f2c89864337f162e88991e28']);
const SRCQ='Explore Topologies Quantum Fiction Stranger';
const WQ='quantum entanglement';
const hb=(path)=>createHash('sha256').update(readFileSync(resolve(ROOT,path))).digest('hex');
const html=()=>readFileSync(resolve(ROOT,'app/encyclopedia/vix-cyb.html'),'utf8');
function loadCorpus(){
 const s=html();const match=s.match(/<script[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/);
 assert(match,'HELD_COMPARATIVE_CORPUS_MISSING');
 const corpus=JSON.parse(match[1]);
 assert(corpus.works?.length===32&&corpus.works.reduce((n,w)=>n+(w.linked_sources||[]).length,0)===53,
  'HELD_COMPARATIVE_CORPUS_COUNTS');
 assert(WORK_IDS.every(id=>corpus.works.some(w=>w.work_id===id)),'HELD_COMPARATIVE_DISTINCT_WORKS_MISSING');
 return corpus;
}
function summarizedTurn(entry,stage){
 const t=entry?.result?.narrative;
 assert(entry?.status==='SUPPORTED'&&t?.role==='MAESTRO','HELD_COMPARATIVE_MAESTRO_TURN_REQUIRED');
 const reads=t.observed_reads||[];
 const observed=reads.filter(x=>x.status==='OBSERVED_READ_ONLY'&&x.intent==='vixen.work.inspect');
 assert(reads.every(x=>x.status==='OBSERVED_READ_ONLY'||x.status==='HELD'||x.status==='NOT_CONNECTED'||x.status==='NOT_REQUESTED'),
  'HELD_COMPARATIVE_UNVERIFIED_READ_STATUS');
 assert(t.provenance?.no_admitted_crosswalk===true&&
  t.selection_execution_boundary?.selection_is_not_read_receipt===true,
  'HELD_COMPARATIVE_SOURCE_SELECTION_PROMOTION');
 assert((t.quests||[]).some(x=>x.actor==='HUMAN'&&x.execution_status==='AWAITING_VOLUNTARY_VISITOR_REPORT'),
  'HELD_COMPARATIVE_HUMAN_QUEST_INVENTED_REPORT');
 return {stage,selected_work_id:t.selection_execution_boundary.selected_work_id,
  featured_work_id:t.selection_execution_boundary.featured_work_id,
  observed_read_only_work_ids:observed.map(x=>x.record?.work_id).filter(Boolean),
  inspection_status:t.selection_execution_boundary.inspection_status,
  retrieval_claim:t.provenance.full_index_fusion_used?'QUALIFIED_FUSION_READ':'UNQUALIFIED_OR_UNATTACHED_SEARCH_NOT_CREDITED',
  source_selection_not_execution:true,
  source_only_advice:t.narrative.evidence_boundary,
  optional_quests:t.quests.map(q=>({actor:q.actor,execution_status:q.execution_status,
   target_work_id:q.target_work_id,description:q.description.slice(0,450)})),
  consent_to_corpus_change:false};
}
async function journey(corpus,hostRead,estate){
 const sim=Object.freeze([
  {choice_id:'source',source_work_id:WORK_IDS[0],question:'Which original Vixen Work manifestation has verifiable source custody?'},
  {choice_id:'compare',source_work_id:WORK_IDS[1],question:'How do these two independently identified Vixen Works differ in source and inference?'},
  {choice_id:'countertest',source_work_id:WORK_IDS[0],question:estate==='SRC_ATELIER'
   ?'Original Python and JavaScript methods disagree on the synthetic four-token query: which real Work evidence would distinguish them?'
   :'The original directed graph loses to controls and all later targets contain novel labels: what would falsify the heuristic?'},
  {choice_id:'question',source_work_id:WORK_IDS[0],question:'What new independently witnessed evidence could adjudicate this disputed method?'},
  {choice_id:'source',source_work_id:WORK_IDS[1],question:'Return to verified manuscript coordinates, do not change the corpus or assume derivation.'}
 ]);
 const session=createVixenAiSession({corpus,hostRead,readCart:()=>[]});
 const opening=await session.start({role:'MAESTRO',goal:estate==='SRC_ATELIER'
  ?'Explore source identity and competing representational readings'
  :'Explore bounded source relations and the limits of novel concept inference'});
 assert(opening.status==='SUPPORTED'&&opening.result?.opening_turn?.role==='MAESTRO',
  'HELD_COMPARATIVE_MAESTRO_START');
 const turns=[{stage:'OPENING',selected_work_id:null,
  featured_work_id:opening.result.opening_turn.featured_work?.work_id??null,
  observed_read_only_work_ids:(opening.result.opening_turn.observed_reads||[])
   .filter(r=>r.status==='OBSERVED_READ_ONLY'&&r.intent==='vixen.work.inspect')
   .map(r=>r.record?.work_id).filter(Boolean),
  source_selection_not_execution:true,
  human_report_received:false}];
 for(const [index,params] of sim.entries()){
  const answer=await session.choose(params);
  turns.push(summarizedTurn(answer,'OPERATOR_SCENARIO_STEP_'+(index+1)));
 }
 const status=session.status();
 assert(status.status==='SUPPORTED'&&status.result?.history_length===sim.length,'HELD_COMPARATIVE_JOURNEY_LENGTH');
 assert(status.result.program_notes_permission==='NOT_REQUESTED','HELD_COMPARATIVE_NOTES_CONSENT');
 assert(status.result.quest_reports.length===0,'HELD_COMPARATIVE_VISITOR_REPORT_FORGED');
 const handoff=session.handoff();
 assert(handoff.status==='SUPPORTED','HELD_COMPARATIVE_HANDOFF_MISSING');
 const finish=session.finish();
 assert(finish.status==='SUPPORTED','HELD_COMPARATIVE_FINISH_MISSING');
 return {schema:'td613.vixen.comparative-maestro-journey/v1',
  path_source:'EXPLICIT_TEST_SCRIPT_SIMULATED_OPERATOR_CHOICES_NO_HUMAN_ACTION_CLAIM',
  role:'MAESTRO',visit_count:sim.length,opening_plus_visit_count:turns.length,
  turns,operator_scenario:sim.map(({choice_id,source_work_id,question})=>({
   choice_id,source_work_id,question_sha256:SHA(question)})),
  human_quest_reports:0,notes_opt_in:false,cart_mutations:0,
  archival_source_modifications:0,
  read_receipt_is_not_full_manuscript_access:true,
  subjective_research_journey_external_witness:false,
  human_closure_required:true};
}
async function requireEngine(podium,engine,operation,payload){
 const answer=await podium.dispatch({schema:PODIUM_SCHEMA,intent:'engine.invoke',
  params:{engine,operation,payload}});
 assert(answer.status==='HELD'&&answer.result?.state==='UNVERIFIED_ENGINE_ADAPTER_RETURN',
  'HELD_COMPARATIVE_HOST_AUTHORITY_OR_BOUNDED_NATIVE_EXECUTION_'+operation);
 const out=answer.result.output;
 assert(out&&out.scientific_credit===0,'HELD_COMPARATIVE_SCIENTIFIC_PROMOTION_'+operation);
 return out;
}
function witnesses(proofs){
 assert(proofs?.length===2&&WORK_IDS.every((w,i)=>proofs[i]?.work_id===w),
  'HELD_COMPARATIVE_WORK_PROOFS');
 for(const proof of proofs){
  assert(proof.derivative_bytes_rehashed===true&&/^[a-f0-9]{64}$/i.test(
   proof.verified_derivative_sha256||proof.derivative_sha256||''),
   'HELD_COMPARATIVE_WORK_DIGEST_UNVERIFIED');
 }
 return proofs.map(p=>({work_id:p.work_id,source_file_id:p.source_file_id,
  declared_original_source_sha256:p.declared_original_source_sha256??null,
  verified_derivative_sha256:p.verified_derivative_sha256||p.derivative_sha256,
  derivative_bytes_rehashed:true,authorship:p.authorship??'UNRESOLVED'}));
}
function checkpoint(previous,stage,data){
 const body={stage,previous_hash:previous?.hash||null,evidence_class:
  'REAL_SOURCE_BYTES_COMPUTED_PLUS_EXPLICIT_OPERATOR_SCENARIO',...data,
  original_method_full_equivalence:'HELD_UNPROVEN',scientific_credit:0,
  independent_empirical_replication_credit:0};
 return {...body,hash:SHA(body)};
}
export async function runDualAtelierMaestroQualification({repoRoot=ROOT}={}){
 assert(resolve(repoRoot)===ROOT,'HELD_COMPARATIVE_ONLY_REGISTERED_REPO');
 const corpus=loadCorpus(),matrix=buildDualAtelierCapabilityMatrix();
 const adapters=await createPodiumNativeReadAdapters({repoRoot:ROOT});
 const reader={status:()=>({state:'UNOPENED'}),open:async()=>({state:'HELD'}),
  search:()=>[],getRecord:async()=>null,related:()=>[]};
 const podium=createVixenPodium({corpus,membrane:reader,operatorAuthorized:true,
  engineAdapters:adapters});
 const hostRead=({intent,params})=>podium.dispatch({schema:PODIUM_SCHEMA,intent,params});
 const srcJourney=await journey(corpus,hostRead,'SRC_ATELIER');
 const srcProjective=await requireEngine(podium,'SRC_ATELIER',
  'src_verified_vixen_original_projective_differential',
  {work_ids:WORK_IDS,query:SRCQ});
 const srcPhase2=await requireEngine(podium,'SRC_ATELIER',
  'src_verified_vixen_original_phase2',
  {work_ids:WORK_IDS,query:'Explore contextual roles and source representation changes'});
 const srcTyped=await requireEngine(podium,'SRC_ATELIER',
  'src_verified_vixen_original_typed_traversal',
  {work_ids:WORK_IDS,query:'Explore quantum entanglement'});
 const differential=srcProjective.original_native_differential;
 assert(srcProjective.native_python_executed===true&&
  differential?.original_python_replay?.native_python_executed===true&&
  differential.synthetic_query_probe?.exact_agreement===false,
  'HELD_COMPARATIVE_SRC_ADVERSE_DIFFERENTIAL_NOT_OBSERVED');
 assert(srcPhase2.native_python_executed===true&&srcTyped.native_python_executed===true,
  'HELD_COMPARATIVE_SRC_ORIGINAL_NATIVE_WITNESS');
 const srcProofs=witnesses(srcProjective.source_proofs);
 assert(srcPhase2.source_proofs?.length===2&&srcTyped.source_proofs?.length===2,
  'HELD_COMPARATIVE_SRC_CROSS_METHOD_PROOF_MISSING');
 const origProjective='packages/dome_world_exact/fixtures/a15-r0/SRC/99-ADMIN/run-projective-routing-grammar-assay.py';
 const origPhase2='packages/dome_world_exact/fixtures/a15-r0/SRC/99-ADMIN/build-phase2-assays.py';
 const origTyped='packages/dome_world_exact/fixtures/a15-r0/SRC/99-ADMIN/src-evidence-rabbit-hole-v1.py';
 assert(differential.original_python_replay.original_method_sha256===hb(origProjective)&&
  srcPhase2.original_native_phase2?.original_method_sha256===hb(origPhase2)&&
  srcTyped.original_native_traversal?.original_method_sha256===hb(origTyped),
  'HELD_COMPARATIVE_SRC_ORIGINAL_METHOD_BYTES_DIFFER');
 const srcTrace=[
  checkpoint(null,'SOURCE_AND_OPERATOR_SELECTION',{subject_work_ids:WORK_IDS,journey:srcJourney}),
  checkpoint(null,'NATIVE_VIXEN_WORK_WITNESSES',{methods:[
   {method:'ORIGINAL_SRC_PROJECTIVE',source_path:origProjective,source_sha256:hb(origProjective),
    executed_on_sha_verified_real_vixen_work:true},
   {method:'ORIGINAL_SRC_PHASE2',source_path:origPhase2,source_sha256:hb(origPhase2),
    executed_on_sha_verified_real_vixen_work:true},
   {method:'ORIGINAL_SRC_TYPED_TRAVERSAL',source_path:origTyped,source_sha256:hb(origTyped),
    executed_on_sha_verified_real_vixen_work:true}
  ],subject_source_proofs:srcProofs,
   phase2_method_equivalence:srcPhase2.original_native_phase2.original_full_atelier_parity,
   typed_reader_method_parity:srcTyped.original_native_traversal.full_native_method_parity}),
  checkpoint(null,'CONTRADICTORY_NATIVE_COMPARATOR',{counterfactual_kind:'SYNTHETIC_OPERATOR_QUERY_NOT_MANUSCRIPT',
   synthetic_query_sha256:SHA(SRCQ),
   original_python_candidates:differential.synthetic_query_probe.original_python,
   adapted_javascript_candidates:differential.synthetic_query_probe.javascript,
   original_vs_js_exact_agreement:false,source_body_comparison:differential.real_work_comparison,
   alternative:'ORIGINAL_AND_ADAPTED_PROJECTIVE_ENGINES_HAVE_DIFFERENT_THRESHOLDS'}),
  checkpoint(null,'HUMAN_ACTION_AND_HELD_RESEARCH',{
   revised_hypothesis:'NATIVE_VS_ADAPTED_PROJECTIVE_ROUTE_DIFFERS_WITHOUT_ESTABLISHING_HISTORICAL_CAUSE',
   next_action:'Inspect the two actual Work spans under an independent reviewer and preregister a paired source-bound method differential before new claims',
   visitor_task_status:'PROPOSED_NOT_COMPLETED',external_historical_witness:false})
 ];
 for(let i=1;i<srcTrace.length;i++)srcTrace[i]=checkpoint(srcTrace[i-1],srcTrace[i].stage,
  Object.fromEntries(Object.entries(srcTrace[i]).filter(([k])=>!['stage','previous_hash','hash','evidence_class','original_method_full_equivalence','scientific_credit','independent_empirical_replication_credit'].includes(k))));
 const wJourney=await journey(corpus,hostRead,'WENDBINE_ATELIER');
 const wTransfer=await requireEngine(podium,'WENDBINE_ATELIER',
  'wendbine_verified_vixen_method_transfer',{work_ids:WORK_IDS,query:WQ});
 const wDirected=await requireEngine(podium,'WENDBINE_ATELIER','wendbine_public_directed_walk',{});
 const wOpen=await requireEngine(podium,'WENDBINE_ATELIER','wendbine_public_open_world_ceiling',{});
 const publicFixture=await loadOriginalPublicFixture();
 const target=publicFixture.posts.find(x=>x.public_date==='2026-09-11');
 assert(target,'HELD_COMPARATIVE_WENDBINE_REGISTERED_TARGET');
 const wStart=await requireEngine(podium,'WENDBINE_ATELIER','wendbine_maestro_research_step',
  {action:'start',target_source_id:target.source_id});
 const wStep1=await requireEngine(podium,'WENDBINE_ATELIER','wendbine_maestro_research_step',
  {action:'report',previous_receipt:wStart,observation:{kind:'CONTROL_MATCHED_BASELINE',
   note:'Retrospective controls tie or defeat the current derived method; this is a simulated research intervention.'}});
 const wStep2=await requireEngine(podium,'WENDBINE_ATELIER','wendbine_maestro_research_step',
  {action:'report',previous_receipt:wStep1,observation:{kind:'NO_NEW_EVIDENCE'}});
 const wm=wDirected.data?.diagnostics,wo=wOpen.data?.summary;
 assert(wTransfer.subject_work_count===2&&wTransfer.public_source_bodies_admitted===0,
  'HELD_COMPARATIVE_WENDBINE_FOREIGN_WORK_PROMOTION');
 assert(wDirected.data?.original_compiler_receipt?.original_compiler_executed===true&&
  wOpen.data?.original_compiler_receipt?.original_compiler_executed===true,
  'HELD_COMPARATIVE_WENDBINE_COMPILER_NOT_EXECUTED');
 assert(wm.graph_outperforms_all_available_controls===false&&
  wm.concept_outperforms_all_available_controls===false&&
  wo.observed_negative_novelty_targets===0,
  'HELD_COMPARATIVE_WENDBINE_CONTROL_NOT_ADVERSE');
 assert(wStep1.hypothesis==='GENERIC_VOCABULARY_OR_RETROSPECTIVE_LABEL_LEAKAGE'&&
  wStep2.state==='STOPPED_EVIDENCE_BOUNDARY',
  'HELD_COMPARATIVE_WENDBINE_MAESTRO_NOT_REVISED_AND_STOPPED');
 const wenCompiler='packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-compile.mjs';
 const wTrace=[
  checkpoint(null,'SOURCE_AND_OPERATOR_SELECTION',{subject_work_ids:WORK_IDS,journey:wJourney}),
  checkpoint(null,'SOURCE_COMPILER_AND_VERIFIED_VIXEN_TRANSFER',{
   registered_source_executable:wenCompiler,source_sha256:hb(wenCompiler),
   executed_original_fixture_compiler:true,original_public_person_authorship_not_inferred:true,
   subject_source_proofs:witnesses(wTransfer.subject_source_proofs),
   separate_public_source_snapshot_id:wDirected.data.snapshot_id,
   public_source_bodies_admitted:0,transfer_native_algorithm_equivalence:wTransfer.native_algorithm_equivalence}),
  checkpoint(null,'ADVERSARIAL_NULL_AND_NOVELTY_CONTROL',{
   controlled_source_population:'21_EARLIER_POSTS_12_LATER_TITLE_DISCLOSED_TARGETS',
   directed_graph_hits:wm.graph_original_hits,directed_concept_hits:wm.concept_original_hits,
   null_graph_hits:wm.prior_label_graph_hits,null_concept_hits:wm.prior_label_concept_hits,
   degree_preserving_rewire_concept_hits:wm.concept_rewired_hits,
   all_control_superiority:false,
   later_concept_occurrences:wo.later_declared_concept_occurrences,
   unknown_relative_to_prior_concepts:wo.observed_unseen_from_prior_declared_concepts,
   unrankable_by_prior_intersection:wo.outside_this_directed_ranker_candidate_universe,
   positive_novelty_targets:wo.observed_positive_novelty_targets,
   negative_novelty_targets:wo.observed_negative_novelty_targets,
   source_title_only_exact_hits:wo.title_only_novel_literal_exact_hits,
   synthetic_title_rotated_hits:wo.synthetic_rotated_title_exact_hits,
   hidden_future_source_predicted:false}),
  checkpoint(null,'HUMAN_ACTION_AND_EVIDENCE_BOUNDARY',{
   separate_public_target_source_id:target.source_id,
   actual_native_public_maestro_step_hashes:[wStart.receipt_sha256,wStep1.receipt_sha256,wStep2.receipt_sha256],
   baseline_hypothesis:wStart.hypothesis,revised_hypothesis:wStep1.hypothesis,
   observed_terminal_state:wStep2.state,next_action:
    'Collect independently witnessed future known-only and genuinely novel source cases under a predeclared capture and annotation plan',
   human_task_status:'PROPOSED_NOT_EXECUTED',full_method_parity:'HELD_UNPROVEN'})
 ];
 for(let i=1;i<wTrace.length;i++)wTrace[i]=checkpoint(wTrace[i-1],wTrace[i].stage,
  Object.fromEntries(Object.entries(wTrace[i]).filter(([k])=>!['stage','previous_hash','hash','evidence_class','original_method_full_equivalence','scientific_credit','independent_empirical_replication_credit'].includes(k))));
 const receipt={schema:'td613.vixen.dual-atelier-comparative-maestro/v1',
  classification:'EXECUTABLE_HOST_RESEARCH_SIMULATED_OPERATOR_PATH_EXTERNAL_EVIDENCE_NOT_ACQUIRED',
  matrix_digest_sha256:SHA(matrix),source_matrix_counts:matrix.counts,
  reviewed_original_work_ids:WORK_IDS,
  acts:{SRC_ATELIER:{state:'COMPLETED_BOUNDED_ENCOUNTER_SCIENTIFIC_HOLD',
   trace:srcTrace,full_original_method_equivalence:'HELD_UNPROVEN'},
   WENDBINE_ATELIER:{state:'COMPLETED_BOUNDED_ENCOUNTER_SCIENTIFIC_HOLD',
    trace:wTrace,full_original_method_equivalence:'HELD_UNPROVEN'}},
  native_source_ownership:'TD613_FIXTURE_PROGRAMS_ARE_NOT_AUTOMATICALLY_HISTORICAL_PUBLIC_AUTHOR_CODE',
  no_external_witness:true,independently_audited_external_research:false,
  audit_code_is_separate_from_experiment_runner:true,
  operator_actions_scenario_only:true,scientific_credit:0,
  work_import_count_from_foreign_estates:0,source_edition_custody_reserved:true,
  production_released:false,human_closure_required:true};
 return {...receipt,receipt_sha256:SHA(receipt)};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{if(process.argv.length!==2)throw Error('HELD_MAESTRO_SCENARIO_NO_UNTRUSTED_CLI_ARGS');
  process.stdout.write(JSON.stringify(await runDualAtelierMaestroQualification())+'\n');
 }catch(error){process.stderr.write(JSON.stringify({state:'HELD',reason:String(error?.stack||error)})+'\n');process.exitCode=2}
}
