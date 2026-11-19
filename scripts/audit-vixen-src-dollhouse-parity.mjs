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
import {runDollhouseSkillAudit} from '../app/engine/dollhouse-skill-dispatcher.js';

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
const content=Object.fromEntries([js,podium,native,salon,search,conductor,testPath,
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
 ['VERIFIED_VIXEN_WORK_PAIR',null,'scoreSrcUntypicalDocument','src_verified_vixen_work_pair',null]
];
const matrix=srcModules.map(([capability,originalPyName,jsExport,podiumOperation,consumer])=>{
 const original_present=originalPyName?originalPy.includes(originalPyName):null;
 const js_export_present=jsExport?new RegExp('export (?:function|const) '+jsExport+'\\b').test(content[js]):null;
 const podium_operation_present=podiumOperation?
  content[podium].includes("operation==='"+podiumOperation+"'"):false;
 const native_host_present=podiumOperation?.startsWith('src_native_')?
  content[native].includes("operation==='"+podiumOperation+"'"):null;
 const consumer_wired=consumer?
  (consumer===salon?content[salon].includes(jsExport)||content[salon].includes('evaluateCorpusWithSrcEngines'):
   content[search].includes('srcEngines')||content[search].includes('deriveSrcQueryConditionedWeights')):null;
 const executed_by_specific_test=content[testPath].includes(podiumOperation);
 return{
  capability,original_python_reference:originalPyName?original+originalPyName:null,
  original_python_present:original_present,
  vixen_js_export:jsExport,js_export_present,
  podium_operation:podiumOperation,podium_operation_present,
  native_host_present,product_consumer:consumer,consumer_wired,
  tested_by_named_bridge_test:executed_by_specific_test,
  native_python_equivalence_witness:'UNPROVEN',
  original_python_executed_on_vixen_corpus:false,
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
 'Manifest's declared source-to-Vixen call paths must exist in the exact checkout');
const source_revision=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const originalAvailable=matrix.filter(x=>x.original_python_present===true).map(x=>x.capability);
const wired=matrix.filter(x=>x.podium_operation_present&&x.js_export_present===true).map(x=>x.capability);
const roles=['ATLAS','FADT','APERTURE'];
const audit=await runDollhouseSkillAudit({
 source_revision,task_scope:'VIXEN_SRC_METHOD_PARITY_AUDIT_ONLY',
 evidence_class:'SOURCE_CODE_AUDIT',
 evidence_references:[js,podium,native,salon,search,testPath],
 roles,include_orchestrator:true,
 domain_inputs:{
  ATLAS:{trajectoryA:{endpoint:'SRC_VIXEN_TRANSLATION',winding:0},
   trajectoryB:{endpoint:'SRC_VIXEN_TRANSLATION',winding:0}},
  FADT:{fiberRows:[
   {condition:'ORIGINAL_PYTHON_REFERENCE_PRESENT',support:originalAvailable},
   {condition:'VIXEN_JAVASCRIPT_AND_PODIUM_WIRED',support:wired}
  ],attempts_unconditioned_action:false},
  APERTURE:{
   // Abstract source-evidence rank assay. Column 2 intentionally has no
   // independent equivalence observations. It is NOT a measured physical probe.
   current_operator:[[matrix.length,0],[wired.length,0]],
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
const redpen={
 role:'APERTURE',basis:'EXACT_HEAD_STATIC_INVENTORY_PLUS_ABSTRACT_SENSITIVITY_ASSAY',
 machine_verdict:aperture.verdict,
 disposition:'HELD_NATIVE_METHOD_EQUIVALENCE_NOT_YET_WITNESSED',
 missing_observations:[
  'No complete original-Python-versus-Vixen-JavaScript paired test across all methods',
  'No full historical SRC research-journey realization on Vixen Work corpus',
  'No proof all public Vixen synthesis routes invoke original native Python',
  'Source archival builders and tests remain source-side tools, not product engines'
 ],
 correction:'Add method-specific inputs, differential outputs, caller receipts and adverse controls; keep foreign SRC source data outside Vixen.'
};
const receipt={
 schema:'td613.vixen.src-dollhouse-capability-parity/v1',
 target_pr:1730,source_revision,
 selection:roles,orchestrator_used:true,
 source_observation_class:'STATIC_CODE_AUDIT_PLUS_BOUNDED_DETERMINISTIC_DOMAIN_ASSAY',
 original_python_inventory,
 matrix,dollhouse:{
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
 aperture_redpen:redpen.disposition,full_native_parity:receipt.full_native_parity,
 artifact:out
},null,2));
