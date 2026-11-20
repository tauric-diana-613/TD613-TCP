/**
 * Read-only, host-authorized Maestro research descent witness.
 *
 * Vixen Work identities are the only source inputs. The SRC executable is
 * imported as method code, not as a source archive. Human/source/role authority
 * and the three Dollhouse jurisdictions are never inferred from a route score.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createVixenPodium,PODIUM_SCHEMA} from '../app/encyclopedia/reference/vixen-podium.mjs';
import {createPodiumNativeReadAdapters} from './vixen-podium-native-adapters.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const task=(intent,params={})=>({schema:PODIUM_SCHEMA,intent,params});
const sha256=v=>createHash('sha256').update(v).digest('hex');
const workIds=['emwork_dd9a66eba0e2dde8e29f00f6','emwork_f2c89864337f162e88991e28'];
// This deliberately unavailable independent reference index cannot be
// substituted by a synthetic full-index result.
const unmountedReference={
 open:async()=>({state:'HELD'}),search:()=>[],getRecord:async()=>null,
 related:()=>[],status:()=>({state:'UNOPENED'})
};

async function witness(){
 const htmlPath=resolve(root,'app/encyclopedia/vix-cyb.html');
 const bytes=readFileSync(htmlPath);
 const before=sha256(bytes);
 const m=bytes.toString('utf8').match(/<script[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/);
 assert.ok(m,'The original 32-Work Vixen catalogue must be available');
 const corpus=JSON.parse(m[1]);
 assert.equal(corpus.works.length,32);
 assert.equal(corpus.instruments.length,21);
 const manifestations=corpus.works.reduce((n,w)=>n+(w.linked_sources?.length||0),0);
 assert.equal(manifestations,53);
 for(const id of workIds)assert.ok(corpus.works.some(w=>w.work_id===id),'Selected original Work absent');
 const revision=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
 assert.match(revision,/^[a-f0-9]{40}$/);
 const engines=await createPodiumNativeReadAdapters({repoRoot:root});
 const request=query=>task('engine.invoke',{
  engine:'SRC_ATELIER',
  operation:'src_verified_vixen_original_projective_differential',
  payload:{work_ids:workIds,query}
 });
 const deniedHost=createVixenPodium({
  corpus,membrane:unmountedReference,engineAdapters:engines,
  operatorAuthorized:false,sourceRevision:revision
 });
 const denied=await deniedHost.dispatch(request('Explore Topologies Quantum Fiction Stranger'));
 assert.equal(denied.status,'HELD');
 assert.equal(denied.result.state,'HELD_OPERATOR_AUTHORITY_NOT_SUPPLIED');
 const podium=createVixenPodium({
  corpus,membrane:unmountedReference,engineAdapters:engines,
  operatorAuthorized:true,sourceRevision:revision
 });
 const start=await podium.dispatch(task('vixen.ai.start',{
  role:'MAESTRO',goal:'Explore the difference between source evidence and computational analogy'
 }));
 assert.equal(start.status,'SUPPORTED');
 assert.equal(start.result.role,'MAESTRO');
 assert.ok(start.result.opening_turn,'A live narrative opening is required');
 assert.equal((await podium.dispatch(task('vixen.ai.start',{role:'COMPOSER'}))).status,'HELD',
  'Role is immutable during this research session');
 const path=[
  {choice_id:'compare',source_work_id:workIds[0],
   question:'What source-specific reading distinguishes two research areas?'},
  {choice_id:'countertest',source_work_id:workIds[1],
   question:'What independent observation could defeat a claimed derivation?'},
  {choice_id:'source',source_work_id:workIds[1],
   question:'Return to an original manuscript instead of treating matching words as proof'},
  {choice_id:'context',source_work_id:workIds[0],
   question:'Which recorded manifestation and custody route actually supports the contrast?'},
  {choice_id:'source',source_work_id:workIds[0],
   question:'Revisit the first source after the contextual descent and identify what changed'}
 ];
 const turns=[start.result.opening_turn],route=[],phase2Hops=[];
 for(const next of path){
  const out=await podium.dispatch(task('vixen.ai.choose',next));
  assert.equal(out.status,'SUPPORTED','Chosen route must really execute: '+next.choice_id);
  assert.equal(out.result.step.source_work_id,next.source_work_id);
  assert.equal(out.result.narrative.choice_id,next.choice_id);
  assert.equal(out.result.step.evidence_class,'USER_CHOSEN_ROUTE_NOT_INDEPENDENT_OBSERVATION');
  route.push(out.result.step);
  turns.push(out.result.narrative);
  // On the visitor's context choice and later return, invoke ORIGINAL SRC Python
  // through the authorized host. This is separate from the catalogue read above.
  const contextTurn=next.choice_id==='context';
  const revisitTurn=next.choice_id==='source'&&phase2Hops.length>0;
  if(contextTurn||revisitTurn){
   const question=contextTurn
    ?'Explore recorded identities and proposed contextual reading roles'
    :'Explore whether revisiting the Work changes its documentary evidence';
   const executed=await podium.dispatch(task('engine.invoke',{
    engine:'SRC_ATELIER',
    operation:'src_verified_vixen_original_phase2',
    payload:{work_ids:workIds,query:question}
   }));
   assert.equal(executed.status,'HELD');
   assert.equal(executed.result.state,'UNVERIFIED_ENGINE_ADAPTER_RETURN');
   const phase2=executed.result.output;
   assert.equal(phase2.native_python_executed,true);
   assert.deepEqual(phase2.source_proofs.map(x=>x.work_id),workIds);
   const original=phase2.original_native_phase2;
   assert.equal(original.original_src_historical_registries_used,false);
   assert.equal(original.original_historical_compilation_proven,false);
   assert.equal(original.contextual_roles.length,6);
   assert.equal(original.compilation_passes.length,2);
   assert.ok(original.contextual_roles.every(x=>
    x.role_normalized==='CANDIDATE_INPUT'&&x.adjudication_status==='UNRESOLVED'));
   assert.ok(original.tomography.every(x=>
    x.delta_evidence==='UNKNOWN'&&x.delta_asserted_authority==='UNKNOWN'&&x.composite_score===null));
   assert.equal(original.controls.withdraw_hypothetical_comparison_context.role_count,4);
   assert.equal(original.controls.withdraw_hypothetical_comparison_context.compiler_count,1);
   assert.equal(phase2.scientific_credit,0);
   if(revisitTurn){
    assert.equal(phase2Hops.length,1,'A source return must refer to one earlier context witness');
    assert.deepEqual(original.source_proofs,phase2Hops[0].source_proofs);
    assert.deepEqual(original.ephemeral_registry_sha256,phase2Hops[0].ephemeral_registry_sha256);
   }
   phase2Hops.push({
    step:out.result.step.sequence,
    visitor_selected_work_id:next.source_work_id,
    path:next.choice_id,
    proposed_question:question,
    observed_catalogue_reads:(out.result.narrative.observed_reads||[])
     .filter(r=>r.status==='OBSERVED_READ_ONLY')
     .map(r=>({intent:r.intent,work_id:r.record?.work_id||null})),
    source_proofs:original.source_proofs,
    original_phase2_sha256:original.original_method_sha256,
    ephemeral_registry_sha256:original.ephemeral_registry_sha256,
    original_functions:original.executed_original_functions,
    original_context_role_count:original.contextual_roles.length,
    original_compilation_pass_count:original.compilation_passes.length,
    tomography_observations:original.tomography.map(t=>({
     transformation_id:t.transformation_id,delta_scope:t.delta_scope,
     delta_evidence:t.delta_evidence,delta_asserted_authority:t.delta_asserted_authority,
     composite_score:t.composite_score
    })),
    context_withdrawal_control:original.controls.withdraw_hypothetical_comparison_context.compiler_count,
    historical_compiler_proven:false,
    inferred_cross_work_scholarly_relation:false,
    user_question_is_source_evidence:false,
    next_action:contextTurn
     ?'Revisit the selected Work and compare the original source coordinates'
     :'Seek external historical compiler or representation evidence before claiming lineage'
   });
  }
 }
 assert.equal(phase2Hops.length,2,'Context and return both require actual original Python execution');
 assert.equal(phase2Hops[0].path,'context');
 assert.equal(phase2Hops[1].path,'source');
 assert.equal(phase2Hops[0].original_phase2_sha256,phase2Hops[1].original_phase2_sha256);
 const alignments=route.map((step,i)=>{
  const boundary=turns[i+1].selection_execution_boundary;
  assert.equal(boundary.selected_work_id,step.source_work_id,
   'Visitor selection must remain explicitly identified across the research turn');
  const actual=[...new Set((turns[i+1].observed_reads||[])
   .filter(r=>r.status==='OBSERVED_READ_ONLY'&&r.intent==='vixen.work.inspect'&&r.record?.work_id)
   .map(r=>r.record.work_id))];
  assert.deepEqual(boundary.observed_work_ids,actual,
   'A declared selection cannot fabricate an observed read');
  assert.equal(boundary.selection_is_not_read_receipt,true);
  assert.equal(boundary.read_is_not_lineage_proof,true);
  assert.equal(boundary.catalogue_inspection_is_not_full_manuscript_read,true);
  return {step:step.sequence,node_id:step.node_id,selected_work_id:step.source_work_id,
   featured_work_id:boundary.featured_work_id,observed_work_ids:actual,
   inspection_status:boundary.inspection_status,
   proposed_connection_proved:false};
 });
 assert.ok(alignments.some(x=>x.observed_work_ids.length),
  'At least one research step must contain a real read');
 const sourceReads=[];
 for(const turn of turns){
  assert.equal(turn.role,'MAESTRO');
  assert.equal(turn.provenance.no_admitted_crosswalk,true);
  assert.equal(turn.provenance.empirical_replication_credit,0);
  assert.equal(turn.provenance.full_index_fusion_used,false,
   'An unmounted independent index never earns semantic-semiotic fusion credit');
  assert.ok(turn.source_candidates.every(x=>corpus.works.some(w=>w.work_id===x.work_id)));
  assert.ok(turn.quests.some(x=>x.actor==='HUMAN'&&x.optional===true));
  for(const read of turn.observed_reads||[])
   if(read.status==='OBSERVED_READ_ONLY'&&read.intent==='vixen.work.inspect'){
    assert.ok(corpus.works.some(w=>w.work_id===read.record?.work_id));
    sourceReads.push({work_id:read.record.work_id,
     status:read.status,claim_ceiling:read.claim_ceiling});
   }
 }
 assert.ok(sourceReads.length>=2,'Several real Vixen source records must be inspected');
 const query='Explore Topologies Quantum Fiction Stranger';
 const result=await podium.dispatch(request(query));
 assert.equal(result.status,'HELD',
  'Even a successful engine call is returned for human assessment, never self-endorsed');
 assert.equal(result.result.state,'UNVERIFIED_ENGINE_ADAPTER_RETURN');
 const computational=result.result.output;
 assert.equal(computational.native_python_executed,true);
 assert.deepEqual(computational.source_proofs.map(x=>x.work_id),workIds);
 assert.ok(computational.source_proofs.every(x=>
  x.derivative_bytes_rehashed&&/^[a-f0-9]{64}$/.test(x.verified_derivative_sha256)));
 const differential=computational.original_native_differential;
 assert.equal(differential.original_python_replay.native_python_executed,true);
 assert.equal(differential.original_python_replay.original_src_archive_loaded,false);
 assert.equal(differential.synthetic_query_probe.evidence_class,
  'SYNTHETIC_OPERATOR_QUERY_NOT_MANUSCRIPT');
 assert.equal(differential.synthetic_query_probe.exact_agreement,false,
  'The known lexical differential remains a deliberately observable disagreement');
 assert.equal(differential.full_method_equivalence,'HELD_UNPROVEN');
 assert.equal(computational.scientific_credit,0);
 assert.equal(computational.authorship_promotion,false);
 const typedResult=await podium.dispatch(task('engine.invoke',{
  engine:'SRC_ATELIER',
  operation:'src_verified_vixen_original_typed_traversal',
  payload:{work_ids:workIds,query:'Explore the recorded Vixen manifestation custody route'}
 }));
 assert.equal(typedResult.status,'HELD');
 assert.equal(typedResult.result.state,'UNVERIFIED_ENGINE_ADAPTER_RETURN');
 const typed=typedResult.result.output;
 assert.equal(typed.native_python_executed,true);
 assert.deepEqual(typed.source_proofs,computational.source_proofs,
  'Reader routes and projective assay must operate on the same verified Work derivatives');
 const typedOriginal=typed.original_native_traversal;
 assert.equal(typedOriginal.native_original_registry_used,false);
 assert.equal(typedOriginal.catalogue_work_count,32);
 assert.equal(typedOriginal.recorded_manifestation_count,53);
 assert.ok(typedOriginal.routes.every(route=>
  route.original_function_result.witnessed_typed_routes.some(edge=>
   edge.graph_kind==='DIGITAL_CUSTODY'&&edge.path_length===2&&
   edge.candidate_direct_relation_admitted===false)));
 assert.equal(typedOriginal.full_native_method_parity,'HELD_ADAPTED_INPUT_AND_UNTESTED_READER_ROUTES');
 assert.equal(typedOriginal.query_influenced_typed_traversal,false);
 assert.equal(typed.scientific_credit,0);
 const handoff=await podium.dispatch(task('vixen.ai.handoff'));
 assert.equal(handoff.status,'SUPPORTED');
 assert.equal(handoff.result.role,'MAESTRO');
 assert.equal(handoff.result.route_history.length,5);
 assert.equal(handoff.result.selection_execution_boundary.selected_work_id,
  alignments.at(-1).selected_work_id);
 assert.deepEqual(handoff.result.selection_execution_boundary.observed_work_ids,
  alignments.at(-1).observed_work_ids);
 assert.equal(handoff.result.program_notes_permission,'NOT_REQUESTED');
 assert.equal(handoff.result.human_approval_for_corpus_mutation,false);
 const archive=await podium.dispatch(task('vixen.ai.archive'));
 assert.equal(archive.status,'SUPPORTED');
 assert.equal(archive.result.original_corpus_modified,false);
 assert.equal(archive.result.release_authority,false);
 assert.equal(archive.result.storyline.length,6);
 assert.equal(sha256(readFileSync(htmlPath)),before,'Every original Vixen catalogue byte must remain unchanged');
 const receipt={
  schema:'td613.vixen.maestro-source-bound-native-journey-witness/v1',
  source_revision:revision,
  estate:'VIXEN_CYBERNETICS',
  research_role:'MAESTRO',route_kind:'BOUNDED_MULTI_STEP_DESCENT',
  route_memory_not_empirical_causality:true,
  role_switch_attempt:'HELD',
  steps:route.map(x=>({sequence:x.sequence,node_id:x.node_id,source_work_id:x.source_work_id,
   evidence_class:x.evidence_class})),
  source_reads:sourceReads,
  route_selected_vs_inspected:alignments,
  original_works:workIds,
  method_execution:{
   original_src_python_executed:true,
   original_method_sha256:differential.original_python_replay.original_method_sha256,
   original_source_research_corpus_loaded:false,
   actual_body_comparison:differential.real_work_comparison,
   synthetic_probe:differential.synthetic_query_probe,
   full_native_equivalence:'HELD_UNPROVEN',
   engine_output_automatically_endorsed:false
  },
  typed_method_execution:{
   original_src_python_executed:true,
   original_method_sha256:typedOriginal.original_method_sha256,
   vixen_recorded_manifestations:typedOriginal.recorded_manifestation_count,
   original_src_registries_used:false,
   ephemeral_registry_class:typedOriginal.ephemeral_registry_class,
   source_proofs:typed.source_proofs,
   typed_paths:typedOriginal.routes.map(r=>({
    work_id:r.seed_work_id,
    witnessed:r.original_function_result.witnessed_typed_routes.length,
    held:r.original_function_result.held_typed_routes.length,
    two_hop_custody_not_scholarly_relation:true
   })),
   typed_query_as_document_content:false,
   full_native_parity:'HELD_ADAPTED_INPUT_AND_UNTESTED_READER_ROUTES',
   engine_output_automatically_endorsed:false
  },
  source_context_return_phase2:{
   schema:'td613.vixen.maestro-phase2-context-return-witness/v1',
   engine_exec_at_visitor_transition:true,
   original_python_context_and_return_hops:phase2Hops,
   matched_source_provenance_on_return:true,
   any_new_historical_compiler_evidence:false,
   adapted_reader_contexts_not_historical_compilers:true,
   scientific_promotion:false
  },
  no_full_index_fusion_claim:true,
  vixen_catalogue_sha256_before:before,
  vixen_catalogue_sha256_after:sha256(readFileSync(htmlPath)),
  no_corpus_writes:true,
  no_source_admission:true,
  no_atelier_authorship_transfer:true,
  no_silent_program_notes:true,
  human_closure_reserved:true,
  preview_release_authority:false
 };
 const location=resolve(process.env.RUNNER_TEMP||tmpdir(),
  'ci-vixen-maestro-native-journey.json');
 writeFileSync(location,JSON.stringify(receipt,null,2)+'\n','utf8');
 console.log(JSON.stringify({status:'PASSED',source_revision:revision,
  steps:route.length,verified_source_reads:sourceReads.length,
  original_python_executed:true,synthetic_divergence_observed:true,
  receipt_path:location}));
}
witness().catch(error=>{console.error('HELD_MAESTRO_NATIVE_JOURNEY',error.stack||String(error));process.exitCode=1;});
