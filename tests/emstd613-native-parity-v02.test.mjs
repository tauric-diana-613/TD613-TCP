import assert from 'node:assert/strict';
import { emRegistry,queryNativeEmWork,queryNativeEmMotifs }
 from '../packages/dome_world_exact/fixtures/a15-r0/EMSTD613/99-ADMIN/em-native-parity-v02.mjs';

const native=emRegistry();
assert.equal(native.source_rows.length,87);
assert.equal(native.works.length,32);
assert.equal(native.meta.work_identity_state.independent_work_count_lower_bound,32);
assert.equal(native.meta.work_identity_state.independent_work_count_upper_bound,40);
assert.equal(native.meta.registry_states.motifs,'NOT_GENERATED');
assert.equal(native.meta.registry_states.concepts,'NOT_GENERATED');
assert.equal(native.meta.registry_states.relations,'NOT_GENERATED');

const work=queryNativeEmWork('emwork_085223e721130117f5510975');
assert.equal(work.status,'RESOLVED_OPERATIONAL_WORK');
assert.equal(work.identity_status,'SAME_WORK_SUPPORTED');
assert.equal(work.human_gate_required,true);
assert.deepEqual(work.independent_work_contribution_interval,[1,2]);
assert.equal(work.manifestations.length,2);
assert.equal(work.claim_equivalence_across_manifestations,false);
assert.equal(work.authorship,'UNRESOLVED');
assert.equal(queryNativeEmWork('emwork_that_does_not_exist').status,'UNRESOLVED_WORK');
const pdf=work.manifestations.find(x=>x.source_descriptor.media_type==='application/pdf');
assert.ok(pdf&&pdf.source_descriptor.sha256.length===64);
assert.equal(work.manifestations.some(x=>x.source_file_id==='emsrc_b7e4e42924d33bdaf666a4f8'),true);

// Read and rehash two genuinely preserved native text derivatives, without
// generating scientific findings or treating supported manifestations as equal.
const observed=queryNativeEmMotifs({
 source_ids:['emsrc_ae5d4155056773c8a50db1b9','emsrc_b7e4e42924d33bdaf666a4f8'],
 terms:['system','algedonic']
});
assert.equal(observed.hash_verification,'REGISTERED_DERIVATIVES_REHASHED_SHA256');
assert.equal(observed.source_count,2);
assert.equal(observed.independent_work_support.verdict,'INDEPENDENCE_UNRESOLVED');
assert.ok(observed.results.find(x=>x.term==='system').occurrences>0);
assert.equal(observed.observations.every(x=>x.status==='LITERAL_STRING_OBSERVATION_ONLY'),true);
assert.match(observed.claim_ceiling,/NO_MECHANISM_GENEALOGY_NOVELTY/);
assert.throws(()=>queryNativeEmMotifs({
 source_ids:['emsrc_db43deb1f616beed44e042c4'],terms:['system']
}),/SOURCE_TEXT_UNAVAILABLE/);
assert.throws(()=>queryNativeEmMotifs({
 source_ids:['emsrc_ae5d4155056773c8a50db1b9','emsrc_ae5d4155056773c8a50db1b9'],terms:['x']
}),/DUPLICATE_SOURCE_IDS/);
console.log('EM real-corpus SOURCE-BOUND parity pass: 87 source registry, 32 Work index, supported 1–2 Work identity interval, 2 rehashed extracted texts and literal motifs; no relation/motif ledger or theory promoted.');
