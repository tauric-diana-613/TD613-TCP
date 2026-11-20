#!/usr/bin/env node
/**
 * Separate two-estate audit oracle; does not trust the encounter's self-report.
 * Re-reads verified Work bytes, original method digests and re-executes both
 * research comparators. Independence is computational cross-check, NOT a
 * human, external-observation, or new empirical evidence witness.
 */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createPodiumNativeReadAdapters} from './vixen-podium-native-adapters.mjs';
import {loadOriginalPublicFixture} from './wendbine-proscenium-assay.mjs';
import {runNativeDirectedWalkFalsification} from './wendbine-directed-walk-falsification.mjs';
import {runNativeOpenWorldCeiling} from './wendbine-open-world-ceiling.mjs';
import {runNativeVixenWendbineTransfer} from './vixen-wendbine-method-transfer.mjs';
import {buildDualAtelierCapabilityMatrix} from './vixen-dual-atelier-capability-matrix.mjs';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const shaJson=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const shaBytes=x=>createHash('sha256').update(x).digest('hex');
const ensure=(v,c)=>{if(!v)throw Error(c)};
const WORKS=['emwork_dd9a66eba0e2dde8e29f00f6','emwork_f2c89864337f162e88991e28'];
function corpus(){
 const raw=readFileSync(resolve(ROOT,'app/encyclopedia/vix-cyb.html'),'utf8');
 const m=raw.match(/<script[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/);
 ensure(m,'HELD_AUDIT_NO_REGISTERED_CORPUS');
 const body=JSON.parse(m[1]);
 ensure(body.works.length===32&&body.works.reduce((n,w)=>n+(w.linked_sources||[]).length,0)===53,
  'HELD_AUDIT_CORPUS_DRIFT');
 return body;
}
const scriptDigest=path=>{
 ensure(typeof path==='string'&&(
  path.startsWith('packages/dome_world_exact/fixtures/a15-r0/SRC/99-ADMIN/')||
  path==='packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-compile.mjs'),
  'HELD_AUDIT_METHOD_PATH_OUTSIDE_APPROVED_SOURCE');
 return shaBytes(readFileSync(resolve(ROOT,path)));
};
const permittedStages=['SOURCE_AND_OPERATOR_SELECTION','NATIVE_VIXEN_WORK_WITNESSES',
 'CONTRADICTORY_NATIVE_COMPARATOR','HUMAN_ACTION_AND_HELD_RESEARCH'];
const wenStages=['SOURCE_AND_OPERATOR_SELECTION','SOURCE_COMPILER_AND_VERIFIED_VIXEN_TRANSFER',
 'ADVERSARIAL_NULL_AND_NOVELTY_CONTROL','HUMAN_ACTION_AND_EVIDENCE_BOUNDARY'];
function traceVerify(steps,stages,estate,cat){
 ensure(Array.isArray(steps)&&steps.length===4,'HELD_AUDIT_FOUR_TYPED_RESEARCH_STAGES_'+estate);
 let previous=null;
 for(let i=0;i<steps.length;i++){
  const x=steps[i],{hash,...body}=x;
  ensure(x.stage===stages[i],'HELD_AUDIT_STAGE_ORDER_'+estate);
  ensure(/^[a-f0-9]{64}$/.test(hash||'')&&hash===shaJson(body),'HELD_AUDIT_STAGE_DIGEST_'+estate);
  ensure(x.previous_hash===previous,'HELD_AUDIT_EXACT_PREFIX_CUSTODY_'+estate);
  ensure(x.scientific_credit===0&&x.independent_empirical_replication_credit===0&&
   x.original_method_full_equivalence==='HELD_UNPROVEN','HELD_AUDIT_PROMOTED_STAGE_'+estate);
  previous=hash;
 }
 const j=steps[0].journey;
 ensure(j.schema==='td613.vixen.comparative-maestro-journey/v1'&&j.role==='MAESTRO'&&
  j.path_source==='EXPLICIT_TEST_SCRIPT_SIMULATED_OPERATOR_CHOICES_NO_HUMAN_ACTION_CLAIM'&&
  j.visit_count===5&&j.opening_plus_visit_count===6&&j.turns.length===6,
  'HELD_AUDIT_FAKE_OR_INCOMPLETE_MAESTRO_JOURNEY_'+estate);
 ensure(j.operator_scenario.map(x=>x.choice_id).join('|')==='source|compare|countertest|question|source',
  'HELD_AUDIT_NO_ADVERSARIAL_BRANCH_'+estate);
 ensure(j.notes_opt_in===false&&j.human_quest_reports===0&&j.cart_mutations===0&&
  j.archival_source_modifications===0,'HELD_AUDIT_FORGED_HUMAN_ACTION_'+estate);
 const known=new Set(cat.works.map(w=>w.work_id));
 for(const t of j.turns){
  ensure(t.source_selection_not_execution===true,'HELD_AUDIT_SELECTION_PROMOTED_TO_READ_'+estate);
  ensure((t.observed_read_only_work_ids||[]).every(w=>known.has(w)),'HELD_AUDIT_FAKE_WORK_INSPECTION_'+estate);
  ensure(t.featured_work_id===null||known.has(t.featured_work_id),'HELD_AUDIT_UNREGISTERED_FEATURE_'+estate);
  ensure(t.selected_work_id===null||known.has(t.selected_work_id),'HELD_AUDIT_UNREGISTERED_SELECTION_'+estate);
  for(const q of t.optional_quests||[]){
   if(q.actor==='HUMAN')ensure(q.execution_status==='AWAITING_VOLUNTARY_VISITOR_REPORT',
    'HELD_AUDIT_HUMAN_REPORT_PRETENDED');
   if(q.actor==='AI')ensure(q.execution_status!=='INDEPENDENT_EMPIRICAL_OBSERVATION',
    'HELD_AUDIT_AI_QUEST_AS_REAL_EXPERIMENT');
  }
 }
 return {trace_hash:previous,scenario_visit_count:j.visit_count,
  read_only_catalogue_receipts:j.turns.reduce((n,t)=>n+(t.observed_read_only_work_ids||[]).length,0),
  human_reports:0,external_observation_credit:0};
}
async function actualProofs(proofs,cat){
 ensure(Array.isArray(proofs)&&proofs.length===2,'HELD_AUDIT_TWO_SOURCE_PROOFS');
 const reader=await import('../app/encyclopedia/vixen-estate/corpus-experiment-a.mjs');
 for(let i=0;i<proofs.length;i++){
  const p=proofs[i],w=cat.works.find(x=>x.work_id===WORKS[i]);
  ensure(p?.work_id===WORKS[i]&&
   w?.linked_sources?.some(s=>s.source_file_id===p.source_file_id&&s.sha256===p.declared_original_source_sha256),
   'HELD_AUDIT_WORK_OR_MANIFESTATION_MISMATCH');
  const idx=cat.works.findIndex(x=>x.work_id===p.work_id);
  const body=await reader.loadExperimentABodyBySourceId(p.source_file_id,{hintShard:reader.shardForWorkIndex(idx)});
  ensure(body?.source_file_id===p.source_file_id&&body.body_sha256_verified===true&&
   shaBytes(Buffer.from(body.text_body,'utf8'))===p.verified_derivative_sha256,
   'HELD_AUDIT_ORIGINAL_VIXEN_DERIVATIVE_BYTES_MISMATCH');
  ensure(p.derivative_bytes_rehashed===true&&p.authorship==='UNRESOLVED',
   'HELD_AUDIT_ORIGINAL_AUTHORITY_PROMOTION');
 }
 return proofs.map(p=>({work_id:p.work_id,derivative_sha256:p.verified_derivative_sha256,
  source_file_id:p.source_file_id}));
}
export async function independentlyAuditDualMaestroReceipt(receipt){
 ensure(receipt?.schema==='td613.vixen.dual-atelier-comparative-maestro/v1',
  'HELD_AUDIT_UNREGISTERED_RECEIPT');
 const {receipt_sha256,...envelope}=receipt;
 ensure(/^[a-f0-9]{64}$/.test(receipt_sha256||'')&&shaJson(envelope)===receipt_sha256,
  'HELD_AUDIT_ENVELOPE_DIGEST');
 ensure(receipt.scientific_credit===0&&receipt.no_external_witness===true&&
  receipt.independently_audited_external_research===false&&
  receipt.operator_actions_scenario_only===true&&receipt.work_import_count_from_foreign_estates===0&&
  receipt.human_closure_required===true,
  'HELD_AUDIT_EVIDENTIARY_OR_AUTHORITY_ESCALATION');
 ensure(JSON.stringify(receipt.reviewed_original_work_ids)===JSON.stringify(WORKS),
  'HELD_AUDIT_FOREIGN_WORK_IDS');
 const matrix=buildDualAtelierCapabilityMatrix();
 ensure(receipt.matrix_digest_sha256===shaJson(matrix)&&
  JSON.stringify(receipt.source_matrix_counts)===JSON.stringify(matrix.counts),
  'HELD_AUDIT_MATRIX_HEAD_OR_COVERAGE_DRIFT');
 const cat=corpus();
 const s=receipt.acts.SRC_ATELIER,w=receipt.acts.WENDBINE_ATELIER;
 ensure(s?.state==='COMPLETED_BOUNDED_ENCOUNTER_SCIENTIFIC_HOLD'&&
  w?.state==='COMPLETED_BOUNDED_ENCOUNTER_SCIENTIFIC_HOLD'&&
  s.full_original_method_equivalence==='HELD_UNPROVEN'&&
  w.full_original_method_equivalence==='HELD_UNPROVEN',
  'HELD_AUDIT_ASYMMETRIC_NATIVE_PARITY_PROMOTION');
 const src=traceVerify(s.trace,permittedStages,'SRC',cat);
 const wen=traceVerify(w.trace,wenStages,'WENDBINE',cat);
 await actualProofs(s.trace[1].subject_source_proofs,cat);
 await actualProofs(w.trace[1].subject_source_proofs,cat);
 const adapters=await createPodiumNativeReadAdapters({repoRoot:ROOT});
 const query='Explore Topologies Quantum Fiction Stranger';
 const [native,phase2,typed]=await Promise.all([
  adapters.SRC_ATELIER({operation:'src_verified_vixen_original_projective_differential',
   payload:{work_ids:WORKS,query}}),
  adapters.SRC_ATELIER({operation:'src_verified_vixen_original_phase2',
   payload:{work_ids:WORKS,query:'Explore contextual roles and source representation changes'}}),
  adapters.SRC_ATELIER({operation:'src_verified_vixen_original_typed_traversal',
   payload:{work_ids:WORKS,query:'Explore quantum entanglement'}})
 ]);
 const declared=s.trace[1].methods;
 ensure(declared.length===3&&declared.every(d=>d.executed_on_sha_verified_real_vixen_work===true&&
  d.source_sha256===scriptDigest(d.source_path)),'HELD_AUDIT_NATIVE_SRC_CODE_HASH');
 ensure(native.native_python_executed===true&&phase2.native_python_executed===true&&
  typed.native_python_executed===true,'HELD_AUDIT_NATIVE_SRC_EXECUTION_REPLAY');
 const rerun=native.original_native_differential,reported=s.trace[2];
 ensure(rerun.synthetic_query_probe.evidence_class==='SYNTHETIC_OPERATOR_QUERY_NOT_MANUSCRIPT'&&
  rerun.synthetic_query_probe.exact_agreement===false&&
  JSON.stringify(reported.original_python_candidates)===JSON.stringify(rerun.synthetic_query_probe.original_python)&&
  JSON.stringify(reported.adapted_javascript_candidates)===JSON.stringify(rerun.synthetic_query_probe.javascript)&&
  JSON.stringify(reported.source_body_comparison)===JSON.stringify(rerun.real_work_comparison),
  'HELD_AUDIT_SRC_COMPARATOR_DISAGREEMENT_NOT_REPRODUCED');
 ensure(s.trace[3].human_task_status==='PROPOSED_NOT_COMPLETED'&&
  s.trace[3].external_historical_witness===false,
  'HELD_AUDIT_SRC_FAKE_RESEARCH_COMPLETION');
 const [actualTransfer,actualWalk,actualOpen,fixture]=await Promise.all([
  runNativeVixenWendbineTransfer({repoRoot:ROOT,work_ids:WORKS,query:'quantum entanglement'}),
  runNativeDirectedWalkFalsification(),runNativeOpenWorldCeiling(),loadOriginalPublicFixture()
 ]);
 const compilerClaim=w.trace[1],control=w.trace[2],closing=w.trace[3];
 ensure(compilerClaim.source_sha256===scriptDigest(compilerClaim.registered_source_executable)&&
  actualTransfer.source_estate==='ORIGINAL_PUBLIC_WENDBINE_REGISTRY_SEPARATE'&&
  actualTransfer.public_source_bodies_admitted===0&&
  actualTransfer.native_algorithm_equivalence==='HELD_UNPROVEN',
  'HELD_AUDIT_WENDBINE_SRC_WORK_CROSSOVER');
 ensure(compilerClaim.separate_public_source_snapshot_id===actualWalk.snapshot_id,
  'HELD_AUDIT_WENDBINE_SOURCE_SNAPSHOT_MISMATCH');
 const d=actualWalk.diagnostics,o=actualOpen.summary;
 ensure(control.directed_graph_hits===d.graph_original_hits&&
  control.directed_concept_hits===d.concept_original_hits&&
  control.null_graph_hits===d.prior_label_graph_hits&&
  control.null_concept_hits===d.prior_label_concept_hits&&
  control.degree_preserving_rewire_concept_hits===d.concept_rewired_hits&&
  control.unknown_relative_to_prior_concepts===o.observed_unseen_from_prior_declared_concepts&&
  control.unrankable_by_prior_intersection===o.outside_this_directed_ranker_candidate_universe&&
  control.positive_novelty_targets===12&&control.negative_novelty_targets===0&&
  control.source_title_only_exact_hits===o.title_only_novel_literal_exact_hits,
  'HELD_AUDIT_WENDBINE_ADVERSE_CONTROL_NOT_REPRODUCED');
 const target=fixture.posts.find(x=>x.public_date==='2026-09-11');
 ensure(target?.source_id===closing.separate_public_target_source_id&&
  closing.observed_terminal_state==='STOPPED_EVIDENCE_BOUNDARY'&&
  closing.human_task_status==='PROPOSED_NOT_EXECUTED'&&
  closing.full_method_parity==='HELD_UNPROVEN'&&
  closing.baseline_hypothesis!==closing.revised_hypothesis,
  'HELD_AUDIT_WENDBINE_CUSTODY_OR_HYPOTHESIS_REWRITE');
 return {schema:'td613.vixen.comparative-maestro-separate-reexecution-audit/v1',
  state:'QUALIFIED_BOUNDED_COMPUTATIONAL_REEXECUTION_SCIENTIFIC_HOLD',
  audited_receipt_sha256:receipt_sha256,matrix_sha256:receipt.matrix_digest_sha256,
  results:{SRC_ATELIER:{...src,original_python_methods_reexecuted:3,
    synthetic_query_method_disagreement_reproduced:true,
    original_real_work_derivative_bytes_rehashed:true},
   WENDBINE_ATELIER:{...wen,original_fixture_compiler_reexecuted:true,
    directed_controls_reexecuted:true,novelty_ceiling_reexecuted:true,
    original_real_work_derivative_bytes_rehashed:true}},
  auditor_independence:'SEPARATE_CODE_MODULE_AND_REEXECUTION_SHARED_LOCAL_FIXTURES',
  independent_external_witness:false,independent_human_review:false,
  external_empirical_replication_credit:0,full_original_method_parity:'HELD',
  public_operator_product_end_to_end_automation:'UNPROVEN_HOST_SCENARIOS_ONLY',
  scientific_credit:0,release_authority:false,human_closure_required:true};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{if(process.argv.length!==2)throw Error('HELD_AUDIT_NO_ARGS');
  const {runDualAtelierMaestroQualification}=await import('./vixen-dual-atelier-comparative-maestro.mjs');
  const r=await runDualAtelierMaestroQualification();
  process.stdout.write(JSON.stringify(await independentlyAuditDualMaestroReceipt(r))+'\n');
 }catch(e){process.stderr.write(JSON.stringify({state:'HELD',reason:String(e?.stack||e)})+'\n');process.exitCode=2}
}
