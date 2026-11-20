import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {buildVixenEmAtelierMatrix} from '../scripts/vixen-em-atelier-capability-matrix.mjs';
import {prepareVixenEmNativeInput,executeVixenEmOriginalControlPacket,
 runVixenEmNativeWorkQualification} from '../scripts/vixen-em-native-work-transfer.mjs';
import {createVixenPodium,PODIUM_SCHEMA,BOUNDED_ENGINE_OPERATIONS}
 from '../app/encyclopedia/reference/vixen-podium.mjs';
import {createPodiumNativeReadAdapters} from '../scripts/vixen-podium-native-adapters.mjs';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const work_ids=['emwork_dd9a66eba0e2dde8e29f00f6','emwork_f2c89864337f162e88991e28'];
const clone=x=>structuredClone(x);
function corpus(){
 const s=readFileSync(resolve(ROOT,'app/encyclopedia/vix-cyb.html'),'utf8');
 const m=s.match(/<script[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/);
 assert(m);
 return JSON.parse(m[1]);
}
test('EM source protocol matrix refuses historical estate into Vixen and identifies all four conditional native paths',()=>{
 const m=buildVixenEmAtelierMatrix();
 assert.equal(m.schema,'td613.vixen.em-proscenium-method-custody/v1');
 assert.equal(m.vixen_documented_performer_source_identity.works,32);
 assert.equal(m.vixen_documented_performer_source_identity.manifestations,53);
 assert.equal(m.vixen_documented_performer_source_identity.gated_supported_identity_groups,8);
 assert.equal(m.native_methods_with_named_podium_operations,6);
 assert.equal(m.historical_archive_github_read_observation.historical_external_bytes_reverified_by_this_local_run,false);
 assert.equal(m.original_historical_author_programs_authenticated,0);
 assert.equal(m.public_vixen_em_browser_native_method_consumer,false);
 assert.equal(m.human_determined_protocol_stages_verified_executed,0);
 assert.equal(m.full_original_method_parity,'HELD');
 assert.equal(m.restored_identity_github_blob_verified,true);
 assert.equal(m.original_firewall_github_blob_verified,true);
 assert.equal(m.rows.filter(x=>x.real_execution_grade==='HOST_ONLY_REAL_VERIFIED_VIXEN_PAIR_EXECUTED').length,2);
 assert(m.rows.every(r=>r.external_empirical_credit===0));
});
test('original TD613 Em motif firewall and identity sensitivity execute on two real Vixen bytes without granting motif or mechanism',async()=>{
 const packet=await prepareVixenEmNativeInput({work_ids});
 assert.equal(packet.catalogue.length,32);
 assert.equal(packet.selected.length,2);
 assert(packet.selected.every(s=>createHash('sha256').update(s.body,'utf8').digest('hex')===s.verified_derivative_sha256));
 const result=executeVixenEmOriginalControlPacket(packet);
 assert.equal(result.original_control_python_executed,true);
 assert.equal(result.human_gated_work_count,8);
 assert.equal(result.identity_sensitivity.partition_count,256);
 assert.equal(result.identity_sensitivity.work_count_lower,32);
 assert.equal(result.identity_sensitivity.work_count_upper,40);
 assert.equal(result.identity_sensitivity.threshold_classification,'IDENTITY_SENSITIVE_OR_EVIDENCE_UNRESOLVED');
 assert.equal(result.source_span_witnesses.length,2);
 assert(result.source_span_witnesses.every(x=>x.original_firewall_returned==='MOTIF_MATCH'&&
  x.source_digest_mutation_rejected===true&&x.exact_source_locator_not_operator_citation===true));
 assert.equal(result.motif_match_is_not_proven_motif,true);
 assert.equal(result.motif_is_not_mechanism,true);
 assert.equal(result.comparative_lineage_proven,false);
 assert.equal(result.original_em_author_intent_inferred,false);
 assert.equal(result.original_source_registry_bytes_authenticated_by_this_program,false);
 assert.equal(result.human_identity_gates_resolved,false);
 assert.equal(result.scientific_credit,0);
 assert.equal(result.full_native_method_equivalence,'HELD_UNPROVEN');
 assert.equal(result.source_span_witnesses[0].work_id,work_ids[0]);
 const rerun=await runVixenEmNativeWorkQualification({work_ids});
 assert.deepEqual(result,rerun,'Independent invocation must be deterministic on identical source bytes');
 console.log('EM_VIXEN_NATIVE_SOURCE_CONTROLS '+JSON.stringify({
  works:result.vixen_work_count,manifestations:result.vixen_manifestation_count,
  gates:result.human_gated_work_count,identity_partitions:result.identity_sensitivity.partition_count,
  original_native_control_executed:result.original_control_python_executed,
  verified_source_spans:result.source_span_witnesses.length,
  independent_historical_evidence:0,scientific_credit:0,method_parity:'HELD'
 }));
});
test('EM native intake rejects fabricated source bytes and identity changes even with structurally valid Work IDs',async()=>{
 const packet=await prepareVixenEmNativeInput({work_ids});
 const altered=clone(packet);
 altered.selected[0].body+=' tamper';
 assert.throws(()=>executeVixenEmOriginalControlPacket(altered),
  /HELD_EM_ORIGINAL_NATIVE_CONTROL_EXECUTION/);
 const spoof=clone(packet);
 spoof.selected[0].source_file_id=spoof.selected[1].source_file_id;
 assert.throws(()=>executeVixenEmOriginalControlPacket(spoof),
  /HELD_EM_ORIGINAL_NATIVE_CONTROL_EXECUTION/);
 const deniedGate=clone(packet);
 const index=deniedGate.catalogue.findIndex(x=>x.human_gate_required);
 assert(index>=0);
 deniedGate.catalogue[index].human_gate_required=false;
 assert.throws(()=>executeVixenEmOriginalControlPacket(deniedGate),
  /HELD_EM_ORIGINAL_NATIVE_CONTROL_EXECUTION/);
 const fabricated=clone(packet);
 fabricated.catalogue[1].original_sources[packet.selected[0].source_file_id]='0'.repeat(64);
 assert.throws(()=>executeVixenEmOriginalControlPacket(fabricated),
  /HELD_EM_ORIGINAL_NATIVE_CONTROL_EXECUTION/);
 await assert.rejects(()=>prepareVixenEmNativeInput({work_ids:[work_ids[0],'emwork_000000000000000000000000']}),
  /HELD_EM_FOREIGN_WORK/);
});
test('EM Podium authorization is host-derived and an unauthorized payload cannot release the historical archive',async()=>{
 const c=corpus(),adapters=await createPodiumNativeReadAdapters({repoRoot:ROOT});
 assert(BOUNDED_ENGINE_OPERATIONS.EM_ATELIER.includes('em_verified_vixen_native_span_identity'));
 const task={schema:PODIUM_SCHEMA,intent:'engine.invoke',
  params:{engine:'EM_ATELIER',operation:'em_verified_vixen_native_span_identity',
   payload:{work_ids,operatorAuthorized:true,scientific_credit:99,
    approved_human_gate:true,release_production:true}}};
 const denied=await createVixenPodium({corpus:c,engineAdapters:adapters,operatorAuthorized:false}).dispatch(task);
 assert.equal(denied.status,'HELD');
 assert.equal(denied.result.state,'HELD_OPERATOR_AUTHORITY_NOT_SUPPLIED');
 const allowed=await createVixenPodium({corpus:c,engineAdapters:adapters,operatorAuthorized:true}).dispatch(task);
 assert.equal(allowed.status,'HELD');
 assert.equal(allowed.result.state,'UNVERIFIED_ENGINE_ADAPTER_RETURN');
 assert.equal(allowed.result.output.scientific_credit,0);
 assert.equal(allowed.result.output.full_native_method_equivalence,'HELD_UNPROVEN');
 assert.equal(allowed.result.output.human_identity_gates_resolved,false);
 assert.equal(allowed.result.output.source_span_witnesses.length,2);
 assert.equal(c.works.length,32);
 assert.equal(c.works.reduce((n,w)=>n+w.linked_sources.length,0),53);
});
