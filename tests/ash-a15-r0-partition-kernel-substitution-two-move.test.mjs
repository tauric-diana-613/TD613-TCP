import test from 'node:test';
import assert from 'node:assert/strict';
import { runPartitionKernelSubstitutionTwoMoveAssay } from '../app/dome-world/previews/a15-r0/partition-kernel-substitution-two-move.js';

test('two coordinated membership moves can impersonate another lawful readout partition',()=>{
 const r=runPartitionKernelSubstitutionTwoMoveAssay();
 assert.equal(r.spec_head,'db0a5f093933e7d63a993f74f72685ae06f9cb69');
 assert.equal(r.total_substitutions,48);
 assert.equal(r.expected_total,48);
 assert.deepEqual(r.decoder_A_counts,{WRONG_UNIQUE:48});
 assert.deepEqual(r.decoder_B_counts,{WRONG_UNIQUE:48});
 assert.ok(r.substitution_ledger.every(x=>x.moved_candidate_count===2));
 assert.ok(r.substitution_ledger.every(x=>x.original_kernel_id!==x.substitute_kernel_id));
 assert.ok(r.substitution_ledger.every(x=>x.substituted_partition_equals_lawful_partition));
 assert.ok(r.substitution_ledger.every(x=>JSON.stringify(x.decoder_A.direction)===JSON.stringify(x.decoder_B.direction)));

 assert.deepEqual(r.primary_corruption.counts,{PRIMARY_DIRECTION_OUTSIDE_HYPOTHESIS_SIGNATURE_TABLE:12,WRONG_PRIMARY_THEN_CLEAN_HELDOUT_REJECTS:12});
 assert.equal(r.primary_corruption.clean_heldout_rejects_every_wrong_selected_hypothesis,true);
 assert.deepEqual(r.heldout_corruption.counts,{HELDOUT_WRONG_UNIQUE_EVIDENCE_CONFLICT:24});
 assert.equal(r.heldout_corruption.governed_classification,'EVIDENCE_CONFLICT_DO_NOT_AUTO_OVERWRITE_CLEAN_PRIMARY');

 assert.equal(r.findings.every_two_move_kernel_substitution_creates_wrong_unique_zero_bucket_direction,true);
 assert.equal(r.findings.every_substituted_partition_is_another_lawful_linear_readout_partition,true);
 assert.equal(r.findings.full_partition_model_consistency_cannot_recover_corruption_provenance_from_final_partition_alone,true);
 assert.equal(r.findings.clean_heldout_rejects_all_wrong_primary_hypothesis_impersonations,true);
 assert.equal(r.findings.corrupted_heldout_packet_can_create_lawful_wrong_validation_direction,true);
 assert.equal(r.findings.validation_disagreement_does_not_identify_which_packet_is_wrong,true);
 assert.equal(r.findings.assay_mechanism_validated,true);

 assert.equal(r.claim_ceiling.two_move_kernel_substitution_vulnerability_in_fixture,true);
 assert.equal(r.claim_ceiling.multi_packet_attack_tolerance,false);
 assert.equal(r.claim_ceiling.adversarial_security_guarantee,false);
 assert.equal(r.claim_ceiling.proto_loom,false);
 assert.equal(r.claim_ceiling.production_authority,false);
 assert.equal(r.claim_ceiling.vercel_authority,false);
});
