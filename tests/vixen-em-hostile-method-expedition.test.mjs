import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {runEmHostileHostProbe,runEmHostileMaestroQualification}
 from '../scripts/vixen-em-hostile-method-expedition.mjs';
import {auditEmHostileMaestroReceipt}
 from '../scripts/vixen-em-hostile-independent-audit.mjs';
import {prepareVixenEmNativeInput}
 from '../scripts/vixen-em-native-work-transfer.mjs';
import {createPodiumNativeReadAdapters} from '../scripts/vixen-podium-native-adapters.mjs';
import {buildVixenEmAtelierMatrix} from '../scripts/vixen-em-atelier-capability-matrix.mjs';
import {createVixenPodium,PODIUM_SCHEMA,BOUNDED_ENGINE_OPERATIONS}
 from '../app/encyclopedia/reference/vixen-podium.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const workIDs=['emwork_dd9a66eba0e2dde8e29f00f6','emwork_f2c89864337f162e88991e28'];
const h=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const clone=x=>structuredClone(x);
const rehearseEnvelope=x=>{const {receipt_sha256,...body}=x;x.receipt_sha256=h(body);return x};
function signAll(r){
 let prev=null;
 for(const stage of r.stages){
  stage.previous_sha256=prev;
  const {stage_sha256,...plain}=stage;
  stage.stage_sha256=h(plain);
  prev=stage.stage_sha256;
 }
 const {receipt_sha256:unused,...source}=r.probe;
 r.probe.receipt_sha256=h(source);
 r.source_probe_sha256=r.probe.receipt_sha256;
 return rehearseEnvelope(r);
}
function htmlCorpus(){
 const data=readFileSync(resolve(root,'app/encyclopedia/vix-cyb.html'),'utf8');
 return JSON.parse(data.match(/<script[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/)[1]);
}
test('EM host hostile expedition is named, source-locked and cannot inherit public original-method parity',()=>{
 const m=buildVixenEmAtelierMatrix();
 assert.equal(m.native_methods_with_named_podium_operations,6);
 assert(BOUNDED_ENGINE_OPERATIONS.EM_ATELIER.includes('em_hostile_method_expedition'));
 const row=m.rows.find(x=>x.operation==='em_hostile_method_expedition');
 assert(row);
 assert.equal(row.public_browser_executes_original_python,false);
 assert.equal(row.source_historical_author_authored_this_executable,false);
 assert.equal(row.full_native_method_equivalence,'HELD_UNPROVEN');
 assert.equal(row.verified_vixen_derivative_consumer,'scripts/vixen-em-native-work-transfer.mjs');
 assert.equal(m.human_determined_protocol_stages_verified_executed,0);
 assert.equal(m.scientific_credit,0);
});
test('real two-Work source claims drive a counterfactual hypothesis revision and native source refusal',async()=>{
 const output=await runEmHostileHostProbe({work_ids:workIDs});
 assert.equal(output.schema,'td613.vixen.em-hostile-host-probe/v1');
 assert.equal(output.source_refs.length,2);
 assert.equal(output.source_identity_partition_count,256);
 assert.deepEqual(output.source_identity_ambiguous_work_interval,[32,40]);
 assert.equal(output.source_identity_human_gates_unresolved,8);
 assert.equal(output.documentary_protocols_automatically_executed,0);
 assert.equal(output.scientific_credit,0);
 assert.equal(output.full_original_method_parity,'HELD_UNPROVEN');
 assert.equal(output.human_identity_gates_resolved,false);
 assert.equal(output.historical_dossier_archival_bytes_reverified_by_this_probe,false);
 assert(output.elected_motif,'Selected actual derivative pair must contain a bounded lexical candidate for this test fixture');
 assert.equal(output.native_firewall.baseline_source_verified_classification,'MOTIF_MATCH');
 assert.equal(output.native_firewall.synthetic_structural_form_classification,'STRUCTURAL_ANALOGY_CANDIDATE');
 assert.equal(output.native_firewall.synthetic_structural_fields_not_validated_against_text,true);
 assert.equal(output.native_firewall.original_method_mechanism_supported,false);
 assert.equal(output.native_firewall.source_digest_tamper_rejected,true);
 assert.equal(output.native_firewall.swapped_source_key_rejected,true);
 assert.equal(output.adversarial_control.ablated_sourceB_term_count,0);
 assert(output.adversarial_control.sourceB_token_withdrawal_actual_count>0);
 assert.equal(output.adversarial_control.changed_original_or_corpus_bytes,false);
 assert.equal(output.adversarial_control.field_generic_null_excluded,false);
 assert.notEqual(output.decision.initial,output.decision.after_adverse_control);
 assert.equal(output.decision.after_adverse_control,'FRAGILE_LEXICAL_PAIR_WITH_HELD_MECHANISM');
 assert.equal(output.decision.requires_human_source_annotation,true);
 assert.equal(output.receipt_sha256,h(Object.fromEntries(Object.entries(output).filter(([k])=>k!=='receipt_sha256'))));
 console.log('EM_HOSTILE_SOURCE_CONTROL '+JSON.stringify({
  exact_span_count:output.native_firewall.exact_source_locators.length,
  original_native_method:output.native_firewall.native_python_executed,
  motif_rank:output.native_firewall.baseline_source_verified_classification,
  synthetic_form_rank:output.native_firewall.synthetic_structural_form_classification,
  mechanism_supported:output.native_firewall.original_method_mechanism_supported,
  after_control:output.decision.after_adverse_control,
  identity_partitions:output.source_identity_partition_count,
  source_custody_claim:'LOCAL_VIXEN_DERIVATIVE',science:output.scientific_credit}));
});
test('five simulated Maestro choices are responsive to real host results; separate audit reruns native sources and rejects unsupported closure',async()=>{
 const receipt=await runEmHostileMaestroQualification({work_ids:workIDs});
 assert.equal(receipt.classification,'READONLY_HOST_SIMULATED_MAESTRO_CONDITIONAL_ON_REAL_SOURCE_EVIDENCE');
 assert.equal(receipt.maestro.simulation_stage_count,6);
 assert.equal(receipt.maestro.human_source_reports,0);
 assert.equal(receipt.maestro.participant_interview_or_human_clicks_witnessed,false);
 assert.deepEqual(receipt.stages.map(x=>x.kind),[
  'SOURCE_CUSTODY_AND_NATIVE_METHOD',
  'BOUNDED_MOTIF_FROM_VERIFIED_BYTES',
  'ADVERSARIAL_MOTIF_WITHDRAWAL',
  'EVIDENCE_RESPONSIVE_MAESTRO_CHOICE',
  'HUMAN_GATE_AND_SCIENTIFIC_REST'
 ]);
 assert.equal(receipt.stages[2].revised_hypothesis,receipt.probe.decision.after_adverse_control);
 assert.equal(receipt.stages[3].selected_next_task,receipt.probe.decision.resulting_action);
 assert.equal(receipt.stages[4].independent_exogenous_empirical_witness,false);
 const audit=await auditEmHostileMaestroReceipt(receipt);
 assert.equal(audit.state,'REEXECUTED_SOURCE_CUSTODY_AND_NATIVE_CONTROL_HUMAN_EVIDENCE_HELD');
 assert.equal(audit.two_real_derivative_bytes_rehashed,true);
 assert.equal(audit.source_motif_locators_reverified,2);
 assert.equal(audit.original_td613_native_firewall_reexecuted,true);
 assert.equal(audit.adversarial_term_withdrawal_recomputed,true);
 assert.equal(audit.exact_prefix_receipts_qualified,5);
 assert.equal(audit.actual_human_interactions,0);
 assert.equal(audit.scientific_credit,0);
 assert.equal(audit.original_method_parity,'HELD_UNPROVEN');
 console.log('EM_HOSTILE_MAESTRO_RECEIPT '+JSON.stringify({
  stages:receipt.stages.length,operator_scenario_steps:receipt.maestro.simulation_stage_count-1,
  native_firewall_reexecuted:audit.original_td613_native_firewall_reexecuted,
  exact_derivative_spans:audit.source_motif_locators_reverified,
  evidence_driven_revision:receipt.stages[2].revised_hypothesis,
  human_input_observed:0,external_replication:0,science:0}));
});
test('independent audit refuses re-signed invented human fieldwork, replaced source spans, manufactured native findings and scientific promotion',async()=>{
 const original=await runEmHostileMaestroQualification({work_ids:workIDs});
 const torn=clone(original);
 torn.stages[2].control.ablated_sourceB_term_count=2;
 await assert.rejects(()=>auditEmHostileMaestroReceipt(torn),/HELD_EM_AUDIT_ENVELOPE_DIGEST/);
 const fakeAblation=clone(original);
 fakeAblation.stages[2].control.sourceB_ephemeral_ablation_digest='e'.repeat(64);
 fakeAblation.probe.adversarial_control.sourceB_ephemeral_ablation_digest='e'.repeat(64);
 signAll(fakeAblation);
 await assert.rejects(()=>auditEmHostileMaestroReceipt(fakeAblation),/HELD_EM_AUDIT_ADVERSARIAL_ABLATION_FORGERY/);
 const fakeWitness=clone(original);
 fakeWitness.maestro.human_source_reports=1;
 rehearseEnvelope(fakeWitness);
 await assert.rejects(()=>auditEmHostileMaestroReceipt(fakeWitness),/HELD_EM_AUDIT_MAESTRO_HUMAN_PRETENSE/);
 const falseMechanism=clone(original);
 falseMechanism.probe.native_firewall.original_method_mechanism_supported=true;
 signAll(falseMechanism);
 await assert.rejects(()=>auditEmHostileMaestroReceipt(falseMechanism),/HELD_EM_AUDIT_FABRICATED_NATIVE_MECHANISM/);
 const fakeScience=clone(original);
 fakeScience.science=9;
 rehearseEnvelope(fakeScience);
 await assert.rejects(()=>auditEmHostileMaestroReceipt(fakeScience),/HELD_EM_AUDIT_CLAIM_OR_AUTHORITY_ESCALATED/);
});
test('unprivileged Podium cannot mint original Em host execution through forged operator or exogenous claims',async()=>{
 const adapters=await createPodiumNativeReadAdapters({repoRoot:root});
 const task={schema:PODIUM_SCHEMA,intent:'engine.invoke',
  params:{engine:'EM_ATELIER',operation:'em_hostile_method_expedition',
   payload:{work_ids:workIDs,operatorAuthorized:true,externalWitness:true,
    independentReplication:2,scientific_credit:100,human_gate_closed:true}}};
 const blocked=await createVixenPodium({corpus:htmlCorpus(),engineAdapters:adapters}).dispatch(task);
 assert.equal(blocked.status,'HELD');
 assert.equal(blocked.result.state,'HELD_OPERATOR_AUTHORITY_NOT_SUPPLIED');
 const authorized=await createVixenPodium({corpus:htmlCorpus(),engineAdapters:adapters,
  operatorAuthorized:true}).dispatch(task);
 assert.equal(authorized.status,'HELD');
 assert.equal(authorized.result.state,'UNVERIFIED_ENGINE_ADAPTER_RETURN');
 assert.equal(authorized.result.output.scientific_credit,0);
 assert.equal(authorized.result.output.human_identity_gates_resolved,false);
});
test('Python original firewall rejects a tampered first Work after malicious payload recomputation',async()=>{
 const packet=await prepareVixenEmNativeInput({work_ids:workIDs});
 const hostile=await runEmHostileHostProbe({work_ids:workIDs});
 const candidate={token:hostile.elected_motif,locators:hostile.native_firewall.exact_source_locators};
 const fake=clone(packet);
 fake.selected[0].body+=' altered source without authorized rehash';
 const binary=process.env.TD613_NATIVE_PYTHON||(process.platform==='win32'?'python':'python3');
 assert.throws(()=>execFileSync(binary,[resolve(root,'scripts/vixen-em-hostile-native-firewall.py')],{
  cwd:root,input:JSON.stringify({schema:'td613.vixen.em-hostile-python-input/v1',
   packet:fake,candidate}),encoding:'utf8',timeout:25000,
  env:{...process.env,PYTHONDONTWRITEBYTECODE:'1',PYTHONUTF8:'1'}}),/Command failed|status/);
});
