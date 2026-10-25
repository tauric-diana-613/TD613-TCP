import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { DEFAULT_PARENT,createEmptyAtelier,preview }
 from '../packages/dome_world_exact/fixtures/a15-r0/ATELIER_METHOD/atelier-scaffold-v02.mjs';
import { assemblePolycompiler,traceTypedCompilations } from '../packages/dome_world_exact/fixtures/a15-r0/ATELIER_METHOD/atelier-semantic-polycompiler-v02.mjs';
import { METHOD,validateProfile,stageOrderAssay }
 from '../packages/dome_world_exact/fixtures/a15-r0/ATELIER_METHOD/atelier-core-v02.mjs';
import { compileSourceBoundTopology,makeHeldoutView,reconstructionControlBattery,
 polycompilationConservation,adjudicateConservationRegister,preregisterThreeStratum,
 nomenclatureOperatorCrosswalk,motifCandidateSieve,independentEvidenceSupport,scoreForeignDonorFourCell }
 from '../packages/dome_world_exact/fixtures/a15-r0/ATELIER_METHOD/atelier-parity-operators-v02.mjs';

const id='PARITY_SANDBOX_EMPTY';
const dest=path.join(DEFAULT_PARENT,id);
assert.equal(fs.existsSync(dest),false,'SANDBOX_PREEXISTS');
try{
 const peek=preview(id);
 assert.equal(peek.write_performed,false);
 assert.equal(peek.registered_module_count,44);
 assert.equal(peek.callable_module_count,1);
 assert.equal(fs.existsSync(dest),false);
 const created=createEmptyAtelier(id,{destination:dest,create:true,display_name:'Synthetic Independent Research Trial'});
 assert.equal(created.write_performed,true);
 assert.equal(fs.existsSync(path.join(dest,'01-MANIFESTS/EMPTY_STATE.json')),true);
 const profile=JSON.parse(fs.readFileSync(path.join(dest,'ATELIER_PROFILE.json'),'utf8'));
 assert.equal(validateProfile(profile).valid,true);
 assert.equal(profile.source_count,0);
 assert.equal(profile.work_count,0);
 assert.equal(profile.claim_ceiling,'NO_SOURCES_NO_RESEARCH_RESULT');
 assert.equal(Object.keys(profile.modules).length,44);
 assert.equal(profile.consent_and_contact.outbound_contact_authorized,false);
 assert.equal(profile.consent_and_contact.public_recognition_route_enabled,false);
 assert.throws(()=>createEmptyAtelier(id,{destination:dest,create:true}),/TARGET_ALREADY_EXISTS_NO_OVERWRITE/);
 // Synthetic sources are supplied in memory, never admitted into the empty chamber.
 const snapshot='CONTROLLED_TRIAL_EPISODE';
 const documents=[
  {source_id:'trial:A',snapshot_id:snapshot,declared_concepts:['theta','eta'],time_precision:'DAY'},
  {source_id:'trial:B',snapshot_id:snapshot,declared_concepts:['theta','omega'],time_precision:'DAY'},
  {source_id:'trial:C',snapshot_id:snapshot,declared_concepts:['eta','omega'],time_precision:'DAY'}
 ];
 const relations=[
  {source_id:'trial:A',graph:'G_D',from:'theta',relation:'DEPENDS_ON',to:'eta',evidence_class:'SOURCE_DECLARED'},
  {source_id:'trial:B',graph:'G_R',from:'theta',relation:'MAPS_TO',to:'omega',evidence_class:'SOURCE_DECLARED'}
 ];
 const top=compileSourceBoundTopology({snapshot_id:snapshot,source_rows:documents,relation_rows:relations});
 assert.equal(top.source_count,3);
 assert.equal(top.concept_count,3);
 assert.equal(top.typed_relation_count,2);
 assert.equal(top.cooccurrence_count,0);
 const view=makeHeldoutView({source_rows:documents,relation_rows:relations,target_id:'trial:B',snapshot_id:snapshot});
 const battery=reconstructionControlBattery({view,preregistration:{
  state:'PREREGISTERED_NOT_EXECUTED',target_ids:['trial:B'],controls:['C0','C1','C2','C3','C4']
 }});
 assert.equal(battery.C0.compiled.source_count,2);
 assert.equal(battery.C1.serial_order_credit,'NOT_IDENTIFIABLE_FROM_DAY_BUCKETS');
 assert.equal(battery.C3.compiled.typed_relation_count,0);
 assert.equal(battery.C4.state,'HELD_DECOY_NOT_PREREGISTERED');
 const cf=polycompilationConservation({
  epoch:snapshot,source_rows:documents,roles:['DEFINITION','OPERATIONS'],
  shared_claim_ids:['theta-contract'],role_claims:{
   DEFINITION:[{claim_id:'theta-contract',source_ids:['trial:A'],evidence_class:'SOURCE_DECLARATION'}],
   OPERATIONS:[{claim_id:'theta-contract',source_ids:['trial:B'],evidence_class:'RESEARCH_HYPOTHESIS'}]
  }
 });
 assert.equal(cf.invariants['theta-contract'].all_roles_supported,true);
 assert.match(cf.claim_ceiling,/NOT_AUTOMATICALLY_PROVED/);
 const motif=motifCandidateSieve({snapshot_id:snapshot,terms:['theta'],source_spans:[
  {source_id:'trial:A',source_locator:'in-memory:alpha',text:'theta can be described'},
  {source_id:'trial:B',source_locator:'in-memory:beta',text:'theta would be invoked'}]});
 assert.equal(motif.summary[0].source_span_count,2);
 const order=stageOrderAssay({
  operators:{A:x=>({...x,n:x.n+1}),B:x=>({...x,n:x.n*2})},
  inputs:[{n:1},{n:2}],register:x=>x.n,canonical_order:['A','B']});
 assert.equal(order.prefix_permutations,2);
 assert.ok(order.terminal_equivalence_classes>=1);
 const prior=nomenclatureOperatorCrosswalk({
  source_snapshot:snapshot,receiver_snapshot:'BASELINE',
  rows:[{id:'test',subject:'theta',proposed_term:'theta',source_locator:'trial:A',receiver_baseline_locator:'trial:B',
   proposes_better_name:false,proposes_better_operator:false,conventional_prior_refs:[],
   operator_delta_refs:[],alternative_explanation:'Same token, no operator established',
   claim_ceiling:'NO_DONOR_ORIGIN'}]});
 assert.equal(prior.counts.NEITHER,1);

 const contextual=assemblePolycompiler({
  snapshot_id:snapshot,seal_id:'SYNTHETIC_EPISODE',
  role_assertions:[
   {contextual_role_assertion_id:'a-context',subject_id:'trial:A',architecture_id:'trial:B',
    role_normalized:'DEFINES',source_status:'EXPLICIT_SOURCE',adjudication_status:'WITNESSED',
    evidence_ids:['trial:A'],interpretive_limit:'Source test only',
    atelier_snapshot_id:snapshot,seal_epoch_binding:'RESOLVE_MATCHED_CURRENT_SEAL'},
   {contextual_role_assertion_id:'b-context',subject_id:'trial:B',architecture_id:'trial:C',
    role_normalized:'EXTENDS',source_status:'ARCHIVE_INFERRED',adjudication_status:'CANDIDATE',
    evidence_ids:['trial:B'],interpretive_limit:'Candidate only',
    atelier_snapshot_id:snapshot,seal_epoch_binding:'RESOLVE_MATCHED_CURRENT_SEAL'}
  ],
  compilation_passes:[
   {compilation_pass_id:'Apass',build_target_id:'trial:B',atelier_snapshot_id:snapshot,
    seal_epoch_binding:'RESOLVE_MATCHED_CURRENT_SEAL',input_ids:['trial:A'],
    input_role_assertion_ids:['a-context'],contextual_role_count:1},
   {compilation_pass_id:'Bpass',build_target_id:'trial:C',atelier_snapshot_id:snapshot,
    seal_epoch_binding:'RESOLVE_MATCHED_CURRENT_SEAL',input_ids:['trial:B'],
    input_role_assertion_ids:['b-context'],contextual_role_count:1}
  ]
 });
 assert.equal(contextual.role_count,2);
 const route=traceTypedCompilations(contextual,{from:'trial:A',to:'trial:C'});
 assert.equal(route.routes.length,1);
 assert.equal(route.routes[0].direct_relation_admitted,false);
 assert.match(route.routes[0].path_ceiling,/CANDIDATE/);


 const plan={schema:'td613.atelier-foreign-donor-factorial/v0.2-candidate',
  id:'EMPTY_TRIAL_BLINDED',state:'PREREGISTERED_NOT_EXECUTED',matched_frame:'FIXED_SYNTHETIC_FRAME'};
 const contrasts=scoreForeignDonorFourCell({plan,observations:[
  {cell:'C00',score:0,witness_id:'synthetic-00',matched_frame:'FIXED_SYNTHETIC_FRAME',blinded:true},
  {cell:'C01',score:1,witness_id:'synthetic-01',matched_frame:'FIXED_SYNTHETIC_FRAME',blinded:true},
  {cell:'C10',score:1,witness_id:'synthetic-10',matched_frame:'FIXED_SYNTHETIC_FRAME',blinded:true},
  {cell:'C11',score:2,witness_id:'synthetic-11',matched_frame:'FIXED_SYNTHETIC_FRAME',blinded:true}
 ]});
 assert.equal(contrasts.contrasts.interaction,0);
 assert.equal(contrasts.source_transfer_authority,false);

 const typed=adjudicateConservationRegister({snapshot_id:snapshot,seal_id:'SYNTHETIC_EPISODE',rows:[
  {compiler_conservation_observation_id:'trial:conserve1',atelier_snapshot_id:snapshot,
    seal_epoch_binding:'RESOLVE_MATCHED_CURRENT_SEAL',input_id:'trial:A',output_id:'trial:B',
    compiler_or_transform_id:'trial:translator',
    adjudication_status:'CANDIDATE',evidence_ids:['trial:A','trial:B'],
    interpretive_limit:'No independently witnessed transformation',
    dimensions:{semantic_core:'UNKNOWN',scope:'UNKNOWN',causality:'UNKNOWN',falsifiers:'UNKNOWN',
      caveats:'UNKNOWN',variables:'UNKNOWN',universality:'UNKNOWN'}}
 ]});
 assert.equal(typed.observations[0].status,'CANDIDATE');
 const three=preregisterThreeStratum({snapshot_id:snapshot,epoch_seal:'SYNTHETIC_EPISODE',targets:['target'],
  matched_budget:'LOCKED',blind_seed_commitment:'COMMITTED',control_specification:'MATCHED_HOSTILE'});
 assert.equal(three.subsets.length,7);
 assert.ok(Object.values(three.statuses).every(s=>s==='NOT_EXECUTED'));
 const indep=independentEvidenceSupport([{evidence_id:'a',source_id:'trial:A',ancestor_id:'root'},
  {evidence_id:'b',source_id:'trial:B',ancestor_id:'root'}]);
 assert.equal(indep.distinct_known_ancestors,1);
 // All instrumentation is in-memory; the empty source register stays empty.
 assert.equal(fs.readFileSync(path.join(dest,'01-MANIFESTS/EMPTY_STATE.json'),'utf8').includes('"source_count": 0'),true);
 assert.equal(JSON.parse(fs.readFileSync(path.join(dest,'ATELIER_PROFILE.json'),'utf8')).current_findings.length,0);
 console.log('Independent empty Atelier integration: scaffold created only in disposable CI checkout; cross-family operations executed on in-memory source fixtures; 0 imported sources/works/findings; all advanced truth claims HELD.');
}finally{
 fs.rmSync(dest,{recursive:true,force:true});
}
assert.equal(fs.existsSync(dest),false,'SANDBOX_CLEANUP_FAILED');
