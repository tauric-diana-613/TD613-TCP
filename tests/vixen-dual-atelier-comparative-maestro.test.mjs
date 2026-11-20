import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {buildDualAtelierCapabilityMatrix} from '../scripts/vixen-dual-atelier-capability-matrix.mjs';
import {runDualAtelierMaestroQualification} from '../scripts/vixen-dual-atelier-comparative-maestro.mjs';
import {independentlyAuditDualMaestroReceipt}
 from '../scripts/vixen-dual-atelier-maestro-independent-audit.mjs';
import {createVixenPodium,PODIUM_SCHEMA} from '../app/encyclopedia/reference/vixen-podium.mjs';
import {createPodiumNativeReadAdapters} from '../scripts/vixen-podium-native-adapters.mjs';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const SHA=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const clone=x=>JSON.parse(JSON.stringify(x));
const rehashEnvelope=x=>{const {receipt_sha256,...bare}=x;x.receipt_sha256=SHA(bare);return x};
function rehashTrace(trace){
 for(let i=0;i<trace.length;i++){
  trace[i].previous_hash=i===0?null:trace[i-1].hash;
  const {hash,...bare}=trace[i];trace[i].hash=SHA(bare);
 }
}
test('common executable matrix preserves product/native distinction across both estates',()=>{
 const matrix=buildDualAtelierCapabilityMatrix();
 assert.equal(matrix.schema,'td613.vixen.dual-atelier-capability-matrix/v1');
 assert.equal(matrix.rows.length,31);
 assert.equal(matrix.counts.SRC_ATELIER.declared,16);
 assert.equal(matrix.counts.WENDBINE_ATELIER.declared,15);
 assert(matrix.counts.SRC_ATELIER.public_browser_consumer_references>=4);
 assert.equal(matrix.counts.WENDBINE_ATELIER.public_browser_consumer_references,0);
 assert.equal(matrix.source_root_inventory.SRC.original_python_total,33);
 assert.equal(matrix.source_root_inventory.SRC.source_side_not_mapped.length,26);
 assert(matrix.source_root_inventory.WENDBINE.registered_admin_executable_total>=18);
 assert(matrix.rows.every(x=>x.full_method_parity==='HELD_UNPROVEN'&&
  x.independent_empirical_credit===0));
 assert(matrix.rows.filter(x=>x.mode==='ORIGINAL_PYTHON_ON_VERIFIED_VIXEN_PAIR').length===3);
 assert(matrix.rows.some(x=>x.key==='WENDBINE_ORIGINAL_COMPILER_TRANSFER'&&
  x.mode==='TD613_HEURISTIC_ON_VERIFIED_VIXEN_PAIR'&&x.actual_product_consumer===null));
 assert(matrix.rows.every(x=>!x.source_executable||/^[a-f0-9]{64}$/.test(x.source_sha256)));
});
test('both full Maestro encounters execute native methods, real Vixen body proofs and independent reexecution audit',async()=>{
 const receipt=await runDualAtelierMaestroQualification({repoRoot:root});
 assert.equal(receipt.scientific_credit,0);
 assert.equal(receipt.operator_actions_scenario_only,true);
 assert.equal(receipt.work_import_count_from_foreign_estates,0);
 assert.equal(receipt.acts.SRC_ATELIER.trace[2].original_vs_js_exact_agreement,false);
 assert.equal(receipt.acts.SRC_ATELIER.trace[2].counterfactual_kind,
  'SYNTHETIC_OPERATOR_QUERY_NOT_MANUSCRIPT');
 assert.equal(receipt.acts.WENDBINE_ATELIER.trace[2].negative_novelty_targets,0);
 assert.equal(receipt.acts.WENDBINE_ATELIER.trace[3].observed_terminal_state,
  'STOPPED_EVIDENCE_BOUNDARY');
 const independent=await independentlyAuditDualMaestroReceipt(receipt);
 assert.equal(independent.state,'QUALIFIED_BOUNDED_COMPUTATIONAL_REEXECUTION_SCIENTIFIC_HOLD');
 assert.equal(independent.results.SRC_ATELIER.original_python_methods_reexecuted,3);
 assert.equal(independent.results.SRC_ATELIER.synthetic_query_method_disagreement_reproduced,true);
 assert.equal(independent.results.WENDBINE_ATELIER.directed_controls_reexecuted,true);
 assert.equal(independent.results.WENDBINE_ATELIER.novelty_ceiling_reexecuted,true);
 assert.equal(independent.independent_external_witness,false);
 assert.equal(independent.public_operator_product_end_to_end_automation,
  'UNPROVEN_HOST_SCENARIOS_ONLY');
 assert.equal(independent.scientific_credit,0);
 console.log('DUAL_MAESTRO_QUALIFICATION_RECEIPT '+JSON.stringify({
  declared_capability_count:Object.values(receipt.source_matrix_counts).reduce((n,v)=>n+v.declared,0),
  src_native_methods_reexecuted:independent.results.SRC_ATELIER.original_python_methods_reexecuted,
  src_adverse_synthetic_comparison:receipt.acts.SRC_ATELIER.trace[2].original_vs_js_exact_agreement,
  wendbine_later_novelty_negative_targets:receipt.acts.WENDBINE_ATELIER.trace[2].negative_novelty_targets,
  src_maestro_visits:independent.results.SRC_ATELIER.scenario_visit_count,
  wendbine_maestro_visits:independent.results.WENDBINE_ATELIER.scenario_visit_count,
  human_reports_both_estates:0,
  science:0,external_witness:false,
  native_method_parity:'HELD'}));
});
test('host-only dual method routes cannot be invoked through spoofed task JSON authority',async()=>{
 const html=readFileSync(resolve(root,'app/encyclopedia/vix-cyb.html'),'utf8');
 const corpus=JSON.parse(html.match(/<script[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/)[1]);
 const adapters=await createPodiumNativeReadAdapters({repoRoot:root});
 const unprivileged=createVixenPodium({corpus,engineAdapters:adapters});
 for(const [engine,operation,payload] of [
  ['SRC_ATELIER','src_verified_vixen_original_projective_differential',
   {work_ids:['emwork_dd9a66eba0e2dde8e29f00f6','emwork_f2c89864337f162e88991e28'],
    query:'Explore Topologies Quantum Fiction Stranger'}],
  ['WENDBINE_ATELIER','wendbine_verified_vixen_method_transfer',
   {work_ids:['emwork_dd9a66eba0e2dde8e29f00f6','emwork_f2c89864337f162e88991e28'],
    query:'quantum entanglement'}]
 ]){
  const result=await unprivileged.dispatch({schema:PODIUM_SCHEMA,intent:'engine.invoke',
   params:{engine,operation,payload:{...payload,operatorAuthorized:true,externalWitness:true,scientific_credit:1}}});
  assert.equal(result.status,'HELD');
  assert.equal(result.result.state,'HELD_OPERATOR_AUTHORITY_NOT_SUPPLIED');
 }
});
test('separate auditor rejects re-signed transcript forgery, fake field work and premature scientific authority',async()=>{
 const actual=await runDualAtelierMaestroQualification();
 const badDigest=clone(actual);
 badDigest.acts.SRC_ATELIER.trace[1].subject_source_proofs[0].verified_derivative_sha256='a'.repeat(64);
 await assert.rejects(()=>independentlyAuditDualMaestroReceipt(badDigest),/HELD_AUDIT_ENVELOPE_DIGEST/);
 const forgedProof=clone(actual);
 forgedProof.acts.SRC_ATELIER.trace[1].subject_source_proofs[0].verified_derivative_sha256='b'.repeat(64);
 rehashTrace(forgedProof.acts.SRC_ATELIER.trace);
 rehashEnvelope(forgedProof);
 await assert.rejects(()=>independentlyAuditDualMaestroReceipt(forgedProof),
  /HELD_AUDIT_ORIGINAL_VIXEN_DERIVATIVE_BYTES_MISMATCH/);
 const fakeVolunteer=clone(actual);
 fakeVolunteer.acts.WENDBINE_ATELIER.trace[0].journey.human_quest_reports=1;
 rehashTrace(fakeVolunteer.acts.WENDBINE_ATELIER.trace);
 rehashEnvelope(fakeVolunteer);
 await assert.rejects(()=>independentlyAuditDualMaestroReceipt(fakeVolunteer),
  /HELD_AUDIT_FORGED_HUMAN_ACTION/);
 const fakeScience=clone(actual);
 fakeScience.acts.SRC_ATELIER.trace[2].scientific_credit=1;
 rehashTrace(fakeScience.acts.SRC_ATELIER.trace);
 rehashEnvelope(fakeScience);
 await assert.rejects(()=>independentlyAuditDualMaestroReceipt(fakeScience),
  /HELD_AUDIT_PROMOTED_STAGE_SRC/);
});
