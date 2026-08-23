import test from 'node:test';
import assert from 'node:assert/strict';
import { runPartitionTomographyOneMembershipMoveRobustnessAssay } from '../app/dome-world/previews/a15-r0/partition-tomography-one-membership-move-robustness.js';

test('one membership move separates estimation fail-safety from corruption detection',()=>{
 const r=runPartitionTomographyOneMembershipMoveRobustnessAssay();
 assert.equal(r.spec_head,'69a7446d8252d8ddfc8f2364102a830866f85a43');
 assert.equal(r.clean_controls.all_pass,true);
 assert.equal(r.total_corruptions,336);
 assert.equal(r.expected_total,336);

 assert.deepEqual(r.decoder_A_zero_bucket.counts,{CORRECT_UNIQUE:240,ABSTAIN_MISSING:48,ABSTAIN_AMBIGUOUS:48});
 assert.equal(r.decoder_A_zero_bucket.wrong_unique_count,0);
 assert.equal(r.decoder_A_zero_bucket.undetected_corruption_with_correct_direction,240);
 assert.equal(r.decoder_A_zero_bucket.fail_safe_under_declared_one_move_family,true);

 assert.deepEqual(r.decoder_B_full_partition.counts,{MODEL_DEFEAT:336});
 assert.equal(r.decoder_B_full_partition.all_one_move_corruptions_rejected_as_model_inconsistent,true);

 assert.deepEqual(r.end_to_end.primary_corruption.decoder_A.counts,{CORRECT_PRIMARY_IDENTIFICATION:120,PRIMARY_ABSTENTION_OR_MODEL_DEFEAT:48});
 assert.deepEqual(r.end_to_end.primary_corruption.decoder_B.counts,{PRIMARY_ABSTENTION_OR_MODEL_DEFEAT:168});
 assert.deepEqual(r.end_to_end.heldout_corruption.decoder_A.counts,{HELDOUT_CORRECT_PASS_UNDETECTED_CORRUPTION:120,HELDOUT_CORRUPTION_DETECTED_OR_ABSTAINED:48});
 assert.deepEqual(r.end_to_end.heldout_corruption.decoder_B.counts,{HELDOUT_CORRUPTION_DETECTED_OR_ABSTAINED:168});

 assert.equal(r.findings.correct_direction_estimate_does_not_certify_clean_partition,true);
 assert.equal(r.findings.zero_bucket_decoder_never_returns_wrong_unique_under_declared_one_move_family,true);
 assert.equal(r.findings.full_partition_consistency_rejects_all_declared_one_move_corruptions,true);
 assert.equal(r.findings.full_partition_validation_is_stricter_but_less_tolerant_than_zero_bucket_direction_recovery,true);
 assert.equal(r.findings.no_false_hypothesis_acceptance_after_clean_heldout_under_declared_one_move_family,true);
 assert.equal(r.findings.assay_mechanism_validated,true);

 assert.equal(r.claim_ceiling.one_membership_move_direction_fail_safety_for_zero_bucket_decoder,true);
 assert.equal(r.claim_ceiling.two_move_robustness,false);
 assert.equal(r.claim_ceiling.adversarial_security_guarantee,false);
 assert.equal(r.claim_ceiling.proto_loom,false);
 assert.equal(r.claim_ceiling.production_authority,false);
 assert.equal(r.claim_ceiling.vercel_authority,false);
});
