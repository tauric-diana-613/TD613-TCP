import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDiscreteObservabilityTransportProgramSummary } from '../app/dome-world/previews/a15-r0/discrete-observability-transport-program-summary.js';

test('bounded observability transport synthesis capsule preserves receipt and authority ceilings',()=>{
 const r=buildDiscreteObservabilityTransportProgramSummary();
 assert.equal(r.schema,'td613.aia.discrete-observability-transport-program-summary/v0.1');
 assert.equal(r.status,'BOUNDED_RESEARCH_SYNTHESIS');
 assert.equal(r.receipts.synthesis,'f7defcb7debb2d20ddb4cd84b40797d4915fd0c6');
 assert.equal(r.receipts.synthesis_digest_sha256,'24efc9eb878418c6d408b3e4e9d5a2a2b063059387c16495ebf8742a7e1d2e98');

 assert.equal(r.quantitative_boundary.projective_readout_orbit_directions,8);
 assert.equal(r.quantitative_boundary.induced_partition_classes_on_frozen_four_state_ecology,4);
 assert.equal(r.quantitative_boundary.global_kernel_complete_calibration_states,33);
 assert.equal(r.quantitative_boundary.hypothesis_conditioned_calibration_states,15);
 assert.equal(r.quantitative_boundary.codesigned_calibration_states,8);
 assert.equal(r.quantitative_boundary.inherited_primary_probe_count,3);
 assert.equal(r.quantitative_boundary.codesigned_primary_probe_count,1);
 assert.equal(r.quantitative_boundary.minimum_anchored_two_packet_signature_distance,4);

 assert.equal(r.witness_status.deterministic_component_tests_authored,true);
 assert.equal(r.witness_status.exact_head_node_execution_witnessed,false);
 assert.equal(r.witness_status.ci_witnessed,false);
 assert.equal(r.witness_status.this_summary_creates_new_scientific_evidence,false);

 assert.equal(r.release_boundary.selected_surface,'A15_R0_OPEN_RESEARCH_FIELD');
 assert.equal(r.release_boundary.preview_summary_only,true);
 assert.equal(r.release_boundary.promotion_authority,false);
 assert.equal(r.release_boundary.vercel_authority,false);
 assert.equal(r.release_boundary.human_release_gesture_required,true);

 assert.ok(r.claim_ceiling.includes('NO_TD613_GENERAL_AIA_THEOREM'));
 assert.ok(r.claim_ceiling.includes('NO_CONTINUUM_LIMIT_OR_DIFFERENTIAL_GEOMETRY'));
 assert.ok(r.claim_ceiling.includes('NO_PROTO_LOOM_PROMOTION'));
 assert.ok(r.claim_ceiling.includes('NO_PRODUCTION_OR_DEPLOYMENT_AUTHORITY_FROM_THIS_SUMMARY'));
 assert.equal(Object.isFrozen(r),true);
});
