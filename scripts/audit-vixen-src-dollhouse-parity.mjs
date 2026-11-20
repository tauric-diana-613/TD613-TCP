#!/usr/bin/env node
/** Bounded SRC -> Vixen source-parity inventory and three-discipline Dollhouse witness.
 * Invokes actual deterministic engines; NOT autonomous agents, independent empirical
 * replication, native Python equivalence, corpus admission, or operator closure.
 */
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {stableContentEquals,computeTypedFnv32} from '../app/engine/dollhouse-atlas-relational-custody.js';
import {computeFadtFiberBounds} from '../app/engine/dollhouse-fadt-reparative-assistance.js';
import {runDollhouseSkillAudit} from '../app/engine/dollhouse-skill-dispatcher.js';
import {createPodiumNativeReadAdapters} from './vixen-podium-native-adapters.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=path=>readFileSync(resolve(root,path),'utf8');
const original='packages/dome_world_exact/fixtures/a15-r0/SRC/99-ADMIN/';
const js='app/encyclopedia/vixen-estate/src-atelier-engines.mjs';
const podium='scripts/vixen-podium-native-adapters.mjs';
const native='scripts/vixen-native-atelier-bridge.mjs';
const salon='app/encyclopedia/vixen-estate/synthesis-salon-engine.mjs';
const search='app/encyclopedia/vixen-estate/semantic-semiotic-search.mjs';
const conductor='app/encyclopedia/vixen-estate/vixen-ai-conductor.mjs';
const testPath='tests/vixen-native-atelier-bridge.test.mjs';
const typedTestPath='tests/vixen-src-original-typed-traversal.test.mjs';
const phase2TestPath='tests/vixen-src-original-phase2-host.test.mjs';
const content=Object.fromEntries([js,podium,native,salon,search,conductor,testPath,typedTestPath,phase2TestPath,
 'tests/vixen-synthesis-salon.test.mjs','app/encyclopedia/reference/vixen-podium.mjs'
].map(path=>[path,read(path)]));
const originalPy=readdirSync(resolve(root,original)).filter(x=>x.endsWith('.py')).sort();
assert.ok(originalPy.length>25,'Unexpectedly incomplete original SRC Python inventory');
const srcModules=[
 // Reference, JS implementation, bounded host operation, actual product consumer.
 ['PROJECTIVE_ROUTING','run-projective-routing-grammar-assay.py','runSrcProjectiveRouting','src_projective_routing',salon],
 ['TOMOGRAPHY','build-phase2-assays.py','runSrcPhase2Tomography','src_phase2_tomography',salon],
 ['CONTEXT_ROLE_COMPILER','build-phase2-assays.py','runSrcPhase2ContextRoles','src_phase2_context_roles',salon],
 ['TYPED_STRATIGRAPHIC_TRAVERSAL','src-evidence-rabbit-hole-v1.py','traverseSrcTypedStrata','src_rabbit_hole_traversal',search],
 ['EPOCH_QUERY','srcquery.py','runSrcNativeQuery','src_native_epoch_query',null],
 ['NATIVE_TEXT_SEARCH','src-native-text-search-v1.py',null,'src_native_text',null],
 ['NATIVE_SEMANTIC_SEARCH','native-semantic-search-v1.py',null,'src_native_semantic',null],
 ['NATIVE_PROJECTIVE_ASSAY','run-projective-routing-grammar-assay.py',null,'src_native_projective_assay',null],
 ['NATIVE_EVIDENCE_TRAVERSE','src-evidence-rabbit-hole-v1.py',null,'src_native_evidence_traverse',null],
 ['NATIVE_RESEARCH_JOURNEY','src-research-journey-v1.py',null,'src_native_research_journey',null],
 ['SIGNATURE_CONDITIONING','native-semantic-search-v1.py','deriveSrcQueryConditionedWeights','src_untypical_retrieval',search],
 ['HETEROSTRATIGRAPHIC_AUDIT',null,'runSrcHeterostratigraphicAudit','src_heterostratigraphic_audit',null],
 ['VERIFIED_VIXEN_WORK_PAIR',null,'scoreSrcUntypicalDocument','src_verified_vixen_work_pair',null],
 ['ORIGINAL_SRC_PROJECTIVE_VIXEN_DIFFERENTIAL','run-projective-routing-grammar-assay.py','runSrcProjectiveRouting','src_verified_vixen_original_projective_differential',null],
 ['ORIGINAL_SRC_TYPED_VIXEN_TRAVERSAL','src-evidence-rabbit-hole-v1.py','traverseSrcTypedStrata','src_verified_vixen_original_typed_traversal',null],
 ['ORIGINAL_SRC_PHASE2_VIXEN_CONTEXT_TOMOGRAPHY','build-phase2-assays.py',null,'src_verified_vixen_original_phase2',null]
];
const matrix=srcModules.map(([capability,originalPyName,jsExport,podiumOperation,consumer])=>{
 const original_present=originalPyName?originalPy.includes(originalPyName):null;
 const js_export_present=jsExport?new RegExp('export (?:function|const) '+jsExport+'\\b').test(content[js]):null;
 const podium_operation_present=podiumOperation?(
  content[podium].includes("operation==='"+podiumOperation+"'") ||
  content[podium].includes("'"+podiumOperation+"'")
 ):false;
 const native_host_present=podiumOperation?.startsWith('src_native_')?
  content[native].includes("'"+podiumOperation+"'"):null;
 const consumer_wired=consumer?
  (consumer===salon?content[salon].includes(jsExport)||content[salon].includes('evaluateCorpusWithSrcEngines'):
   content[search].includes('srcEngines')||content[search].includes('deriveSrcQueryConditionedWeights')):null;
 const executed_by_specific_test=[testPath,typedTestPath,phase2TestPath].some(path=>content[path].includes(podiumOperation));
 return{
  capability,original_python_reference:originalPyName?original+originalPyName:null,
  original_python_present:original_present,
  vixen_js_export:jsExport,js_export_present,
  podium_operation:podiumOperation,podium_operation_present,
  native_host_present,product_consumer:consumer,consumer_wired,
  tested_by_named_bridge_test:executed_by_specific_test,
  native_python_equivalence_witness:'UNPROVEN',
  original_python_executed_on_vixen_corpus:['ORIGINAL_SRC_PROJECTIVE_VIXEN_DIFFERENTIAL','ORIGINAL_SRC_TYPED_VIXEN_TRAVERSAL','ORIGINAL_SRC_PHASE2_VIXEN_CONTEXT_TOMOGRAPHY'].includes(capability),
  original_research_corpus_admission:false
 };
});
const mapped=new Set(srcModules.map(x=>x[1]).filter(Boolean));
const original_python_inventory=originalPy.map(name=>({
 path:original+name,
 classification:name.startsWith('test_')?'ORIGINAL_TEST_NOT_VIXEN_RUNTIME':
  mapped.has(name)?'MAPPED_REFERENCE_OR_HOST_OPERATION':
  'SOURCE_SIDE_TOOL_NO_VIXEN_RUNTIME_PARITY_CLAIM',
 mapped_reference:mapped.has(name)
}));
const bad=matrix.filter(row=>row.original_python_present===false||
 row.js_export_present===false||row.podium_operation_present===false||
 row.native_host_present===false||row.consumer_wired===false);
assert.deepEqual(bad.map(x=>x.capability),[],
 "Declared source-to-Vixen call paths must exist in the exact checkout");
const source_revision=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const originalAvailable=matrix.filter(x=>x.original_python_present===true).map(x=>x.capability);
const wired=matrix.filter(x=>x.podium_operation_present&&x.js_export_present===true).map(x=>x.capability);
const roles=['ATLAS','FADT','APERTURE'];
const sourceFingerprint=path=>({
 estate:path===js?'VIXEN_CYBERNETICS':'SRC_SOURCE_ARCHIVE',
 file:path,byte_sha256:createHash('sha256').update(read(path),'utf8').digest('hex')
});
const srcIdentity=sourceFingerprint(original+'run-projective-routing-grammar-assay.py');
const vixenIdentity=sourceFingerprint(js);
// Atlas's typed custody contract identifies two distinct source manifestations.
// Neither distinct identity nor an equal endpoint is a native-method equivalence proof.
assert.equal(stableContentEquals(srcIdentity,vixenIdentity),false);
const atlasIdentity={
 original_source:srcIdentity,vixen_computation:vixenIdentity,
 original_typed_digest:computeTypedFnv32(srcIdentity).profile_qualified_digest,
 vixen_typed_digest:computeTypedFnv32(vixenIdentity).profile_qualified_digest,
 distinct_manifestations_preserved:true,
 native_equivalence_proved:false,real_winding_history_witnessed:false
};
const originalSourceMethods=await createPodiumNativeReadAdapters({repoRoot:root});
const sourceMethodExecution=await originalSourceMethods.SRC_ATELIER({
 operation:'src_verified_vixen_original_projective_differential',
 payload:{
  work_ids:['emwork_dd9a66eba0e2dde8e29f00f6','emwork_f2c89864337f162e88991e28'],
  query:'Explore Topologies Quantum Fiction Stranger'
 }
});
assert.equal(sourceMethodExecution.native_python_executed,true,
 'Original SRC Python must execute on verified Vixen derivatives in this audit');
const nativeDifferential=sourceMethodExecution.original_native_differential;
assert.equal(nativeDifferential.original_python_replay.original_method_sha256,srcIdentity.byte_sha256,
 'Original Python method bytes must match the inventoried SRC source');
assert.equal(nativeDifferential.original_python_replay.original_src_archive_loaded,false,
 'SRC archive may supply code, never Vixen Work source data');
assert.equal(nativeDifferential.synthetic_query_probe.exact_agreement,false,
 'Known two-of-four-word lexical divergence must remain visible, not hidden by a synthetic pass');
assert.equal(nativeDifferential.full_method_equivalence,'HELD_UNPROVEN');
assert.equal(sourceMethodExecution.scientific_credit,0);
const nativeMethodWitness={
 schema:'td613.vixen.original-src-method-witness/v1',
 original_python_sha256:srcIdentity.byte_sha256,
 source_proofs:sourceMethodExecution.source_proofs,
 original_python_executed:true,
 original_research_corpus_loaded:false,
 real_work_comparison:nativeDifferential.real_work_comparison,
 synthetic_query_probe:nativeDifferential.synthetic_query_probe,
 full_native_method_equivalence:'HELD_UNPROVEN',
 independent_empirical_replication_credit:0,
 human_closure_required:true
};
const typedSourceMethodExecution=await originalSourceMethods.SRC_ATELIER({
 operation:'src_verified_vixen_original_typed_traversal',
 payload:{
  work_ids:['emwork_dd9a66eba0e2dde8e29f00f6','emwork_f2c89864337f162e88991e28'],
  query:'Explore the recorded source-to-derivative custody path'
 }
});
assert.equal(typedSourceMethodExecution.native_python_executed,true);
const nativeTyped=typedSourceMethodExecution.original_native_traversal;
const typedIdentity=sourceFingerprint(original+'src-evidence-rabbit-hole-v1.py');
assert.equal(nativeTyped.original_method_sha256,typedIdentity.byte_sha256);
assert.equal(nativeTyped.catalogue_work_count,32);
assert.equal(nativeTyped.recorded_manifestation_count,53);
assert.equal(nativeTyped.native_original_registry_used,false);
assert.ok(nativeTyped.routes.every(route=>
 route.original_function_result.witnessed_typed_routes.some(edge=>
 edge.graph_kind==='DIGITAL_CUSTODY'&&edge.path_length===2&&
 edge.candidate_direct_relation_admitted===false)));
assert.equal(nativeTyped.full_native_method_parity,'HELD_ADAPTED_INPUT_AND_UNTESTED_READER_ROUTES');
assert.equal(typedSourceMethodExecution.scientific_credit,0);
const nativeTypedWitness={
 schema:'td613.vixen.original-src-typed-evidence-witness/v1',
 original_src_method_sha256:nativeTyped.original_method_sha256,
 input_estate:nativeTyped.input_estate,
 original_registry_used:false,
 ephemeral_registry_class:nativeTyped.ephemeral_registry_class,
 selected_verified_derivatives:nativeTyped.selected_verified_derivatives,
 typed_routes:nativeTyped.routes.map(route=>({
  work_id:route.seed_work_id,
  witnessed:route.original_function_result.witnessed_typed_routes.length,
  held:route.original_function_result.held_typed_routes.length,
  custody_two_hop:route.original_function_result.witnessed_typed_routes.some(edge=>
   edge.graph_kind==='DIGITAL_CUSTODY'&&edge.path_length===2)
 })),
 adapted_input_parity:'HELD_UNPROVEN',
 scientific_credit:0,human_closure_required:true
};
const phase2MethodExecution=await originalSourceMethods.SRC_ATELIER({
 operation:'src_verified_vixen_original_phase2',
 payload:{
  work_ids:['emwork_dd9a66eba0e2dde8e29f00f6','emwork_f2c89864337f162e88991e28'],
  query:'Explore contextual roles and source representation changes'
 }
});
assert.equal(phase2MethodExecution.native_python_executed,true);
const phase2Original=phase2MethodExecution.original_native_phase2;
const phase2SourceIdentity=sourceFingerprint(original+'build-phase2-assays.py');
assert.equal(phase2Original.original_method_sha256,phase2SourceIdentity.byte_sha256);
assert.deepEqual(phase2Original.source_proofs.map(x=>x.derivative_sha256),
 sourceMethodExecution.source_proofs.map(x=>x.verified_derivative_sha256));
assert.equal(phase2Original.catalogue_work_count,32);
assert.equal(phase2Original.manifestation_count,53);
assert.equal(phase2Original.original_src_historical_registries_used,false);
assert.equal(phase2Original.contextual_roles.length,6);
assert.equal(phase2Original.compilation_passes.length,2);
assert.ok(phase2Original.contextual_roles.every(x=>x.role_normalized==='CANDIDATE_INPUT'&&
 x.adjudication_status==='UNRESOLVED'&&x.evidence_ids.length===0));
assert.ok(phase2Original.tomography.every(x=>x.delta_scope==='NARROWED'&&
 x.delta_evidence==='UNKNOWN'&&x.delta_asserted_authority==='UNKNOWN'&&
 x.composite_score===null));
assert.equal(phase2Original.controls.withdraw_hypothetical_comparison_context.role_count,4);
assert.equal(phase2Original.controls.withdraw_hypothetical_comparison_context.compiler_count,1);
assert.ok(phase2Original.controls.inverse_representation_direction.tomography.every(x=>
 x.delta_scope==='EXPANDED'&&x.delta_evidence==='UNKNOWN'&&x.composite_score===null));
assert.equal(phase2Original.original_historical_compilation_proven,false);
assert.equal(phase2Original.original_full_atelier_parity,'HELD_UNPROVEN');
assert.equal(phase2MethodExecution.scientific_credit,0);
const phase2Witness={
 schema:'td613.vixen.original-src-phase2-dollhouse-witness/v1',
 original_src_method_sha256:phase2Original.original_method_sha256,
 source_proofs:phase2Original.source_proofs,
 executed_functions:phase2Original.executed_original_functions,
 recorded_protocols_without_historical_compiler_promotion:phase2Original.selected_recorded_protocols,
 compiler_role_count:phase2Original.contextual_roles.length,
 compilation_pass_count:phase2Original.compilation_passes.length,
 candidate_roles_unresolved:true,
 representation_lifts:phase2Original.tomography.map(x=>({
  transformation_id:x.transformation_id,
  delta_scope:x.delta_scope,
  delta_evidence:x.delta_evidence,
  delta_asserted_authority:x.delta_asserted_authority,
  composite_score:x.composite_score
 })),
 representation_inverse_control:phase2Original.controls.inverse_representation_direction.tomography.map(x=>x.delta_scope),
 withdrawn_comparison_role_count:phase2Original.controls.withdraw_hypothetical_comparison_context.role_count,
 ephemeral_registry_sha256:phase2Original.ephemeral_registry_sha256,
 original_registry_used:false,
 historical_compiler_effect_proven:false,
 actual_original_python_executed:true,
 original_native_js_parity:'HELD_METHOD_DIFFERENTIAL_NOT_YET_WITNESSED',
 independent_empirical_replication_credit:0,
 human_closure_required:true
};
const phase2FadtSupport=computeFadtFiberBounds([
 {condition:'SOURCE_READ_CONTEXT',support:['WORK_IDENTITY','VERIFIED_DERIVATIVE']},
 {condition:'COMPARATIVE_READING_CONTEXT',support:['WORK_IDENTITY']}
]);
assert.ok(phase2FadtSupport.irreducible_gap_cardinality>0,
 'Compiler-context withdrawal must preserve finite-support differences');
const supportStates=[
 {condition:'ORIGINAL_PYTHON_REFERENCE_PRESENT',support:originalAvailable},
 {condition:'VIXEN_JAVASCRIPT_AND_PODIUM_WIRED',support:wired}
];
const fadtSupport=computeFadtFiberBounds(supportStates);
assert.ok(fadtSupport.irreducible_gap_cardinality>0,
 'A capability difference must survive finite union/intersection analysis');
const audit=await runDollhouseSkillAudit({
 source_revision,task_scope:'VIXEN_SRC_METHOD_PARITY_AUDIT_ONLY',
 evidence_class:'SOURCE_CODE_AUDIT',
 evidence_references:[js,podium,native,salon,search,testPath],
 roles,include_orchestrator:true,
 domain_inputs:{
  ATLAS:{trajectoryA:{endpoint:'SRC_VIXEN_TRANSLATION',winding:0},
   trajectoryB:{endpoint:'SRC_VIXEN_TRANSLATION',winding:0}},
  FADT:{fiberRows:supportStates,attempts_unconditioned_action:false},
  APERTURE:{
   // Abstract source-evidence rank assay. Column 2 intentionally has no
   // independent equivalence observations. It is NOT a measured physical probe.
   current_operator:[[matrix.length,0],[wired.length,0]],
   matrix:[[matrix.length,0],[wired.length,0]],
   noise_covariance:[[1,0],[0,1]]
  }
 }
});
const m=audit.machine_receipt;
assert.deepEqual(m.roles_executed,roles,'All three distinct domain engines must actually execute');
assert.ok(m.orchestrator,'Orchestrator governance cannot be replaced by Aperture narrative');
assert.equal(m.orchestrator.release_authority,false);
assert.equal(m.orchestrator.deployment_authority,false);
assert.equal(m.empirical_replication_count,0);
const aperture=m.specialist_findings.find(f=>f.role==='APERTURE');
const atlas=m.specialist_findings.find(f=>f.role==='ATLAS');
const fadt=m.specialist_findings.find(f=>f.role==='FADT');
assert.ok(atlas&&fadt&&aperture);
assert.equal(aperture.verdict,'HELD','Aperture must redpen unobserved independent parity axis');
assert.ok(aperture.infractions.includes('NUMERICAL_STABILITY_DEFICIT'));
assert.ok(m.orchestrator.decision.startsWith('HELD'),'Orchestrator must preserve Aperture veto');
// Separate hostile controls prove the dolls defend THEIR OWN boundaries.
// These deliberately proposed errors are synthetic, not observed production actions.
const atlasControl=await runDollhouseSkillAudit({
 source_revision,task_scope:'VIXEN_SRC_ATLAS_HISTORY_ERASURE_NEGATIVE_CONTROL',
 evidence_class:'SYNTHETIC_TEST_FIXTURE',roles:['ATLAS'],
 include_orchestrator:false,domain_inputs:{ATLAS:{
  trajectoryA:{endpoint:'SAME_DECLARED_TARGET',winding:0},
  trajectoryB:{endpoint:'SAME_DECLARED_TARGET',winding:1}
 }}
});
const atlasControlFinding=atlasControl.machine_receipt.specialist_findings[0];
assert.equal(atlasControlFinding.verdict,'HELD',
 'Atlas must detect equal endpoints concealing distinct route history');
const fadtControl=await runDollhouseSkillAudit({
 source_revision,task_scope:'VIXEN_SRC_FADT_UNCONDITIONED_PROMOTION_NEGATIVE_CONTROL',
 evidence_class:'SYNTHETIC_TEST_FIXTURE',roles:['FADT'],
 include_orchestrator:false,domain_inputs:{FADT:{
  fiberRows:supportStates,attempts_unconditioned_action:true
 }}
});
const fadtControlFinding=fadtControl.machine_receipt.specialist_findings[0];
assert.equal(fadtControlFinding.verdict,'HELD',
 'FADT must reject a hypothetical unconditional grant across divergent supports');
assert.ok(fadtControlFinding.infractions.includes('ILLEGAL_ACTION_GRANT_UNDER_ERASED_CONDITIONING'),
 "FADT admissibility infraction must survive the audit");
const crossJurisdiction={
 source_identity_audit:atlasIdentity,
 finite_support_audit:{
  declared_supports_only:true,authenticated_lawful_actions:false,
  intersection:fadtSupport.intersection_support,
  union:fadtSupport.union_support,
  irreducible_gap:fadtSupport.irreducible_gap,
  gap_cardinality:fadtSupport.irreducible_gap_cardinality,
  phase2_compiler_context_support_gap:phase2FadtSupport.irreducible_gap,
  phase2_context_support_gap_cardinality:phase2FadtSupport.irreducible_gap_cardinality,
  actual_unconditioned_grant_attempted:false
 },
 synthetic_negative_controls:{
  evidentiary_class:'SYNTHETIC_TEST_FIXTURE_NOT_OBSERVED_SOURCE_DEFECT',
  atlas:{verdict:atlasControlFinding.verdict,
   infractions:atlasControlFinding.infractions,
   historical_cross_source_equivalence_witnessed:false},
  fadt:{verdict:fadtControlFinding.verdict,
   infractions:fadtControlFinding.infractions,
   unauthorized_promotion_was_hypothetical:true}
 },
 distinction:'ATLAS_SOURCE_IDENTITY_AND_RELATIONAL_HISTORY_VS_FADT_FINITE_STAGE_ERASURE_VS_APERTURE_INDEPENDENT_OBSERVABILITY',
 no_role_scope_widening:true
};
const redpen={
 role:'APERTURE',basis:'EXACT_HEAD_STATIC_INVENTORY_PLUS_ABSTRACT_SENSITIVITY_ASSAY',
 machine_verdict:aperture.verdict,
 source_reviewed_roles:[
  {role:'ATLAS',verdict:atlas.verdict,infractions:atlas.infractions},
  {role:'FADT',verdict:fadt.verdict,infractions:fadt.infractions}
 ],
 observed_original_python_vs_js_method_comparisons:1,
  independently_confirmed_scientific_equivalence:0,
 numerical_assay_class:'ABSTRACT_EVIDENCE_COVERAGE_RANK_NOT_PHYSICAL_OBSERVATION',
 disposition:'HELD_NATIVE_METHOD_EQUIVALENCE_NOT_YET_WITNESSED',
 missing_observations:[
  'No complete original-Python-versus-Vixen-JavaScript paired test across all methods',
  'No full historical SRC research-journey realization on Vixen Work corpus',
  'No independent historical compiler input-role evidence for Vixen; host reading contexts remain unresolved candidates',
  'No original Python versus JavaScript Phase II paired differential or independent evidence/authority delta',
  'No proof all public Vixen synthesis routes invoke original native Python',
  'Source archival builders and tests remain source-side tools, not product engines'
 ],
 correction:'Add method-specific inputs, differential outputs, caller receipts and adverse controls; keep foreign SRC source data outside Vixen.'
};
const receipt={
 schema:'td613.vixen.src-dollhouse-capability-parity/v1',
 target_pr:1730,source_revision,
 selection:roles,orchestrator_used:true,
 source_observation_class:'STATIC_CODE_AUDIT_PLUS_VERIFIED_ORIGINAL_PYTHON_EXECUTION_PLUS_DETERMINISTIC_DOMAIN_ASSAY',
 original_python_inventory,
 native_original_method_witness:nativeMethodWitness,
 native_original_typed_witness:nativeTypedWitness,
 native_original_phase2_witness:phase2Witness,
 matrix,cross_jurisdiction_handoff:crossJurisdiction,dollhouse:{
  roles_executed:m.roles_executed,
  findings:m.specialist_findings.map(f=>({
   role:f.role,verdict:f.verdict,status:f.status,defect_class:f.defect_class,infractions:f.infractions
  })),
  orchestrator:m.orchestrator
 },aperture_redpen:redpen,
 full_native_parity:'HELD_UNPROVEN',all_source_material_imported:false,
 independent_empirical_replication_credit:0,
 source_mutation:false,release_authority:false,deployment_authority:false,
 human_review_required:true
};
const out=process.env.RUNNER_TEMP?
 resolve(process.env.RUNNER_TEMP,'ci-vixen-src-dollhouse-parity.json'):
 resolve(root,'artifacts/vixen-dual-estate/ci-vixen-src-dollhouse-parity.json');
mkdirSync(dirname(out),{recursive:true});writeFileSync(out,JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({
 source_revision,original_python_count:originalPy.length,
 mapped_capability_count:matrix.length,unmapped_source_tools:original_python_inventory.filter(x=>!x.mapped_reference).length,
 roles_executed:m.roles_executed,
 verdicts:m.specialist_findings.map(x=>({role:x.role,verdict:x.verdict})),
 adverse_controls:{atlas:atlasControlFinding.verdict,fadt:fadtControlFinding.verdict},
 fadt_gap_cardinality:fadtSupport.irreducible_gap_cardinality,
 aperture_redpen:redpen.disposition,full_native_parity:receipt.full_native_parity,
 artifact:out
},null,2));
