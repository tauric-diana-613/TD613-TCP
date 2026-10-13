import test from 'node:test';
import assert from 'node:assert/strict';
import { runPartitionSignatureCodeDistanceAssay, anchoredPartitionDistance } from '../app/dome-world/previews/a15-r0/partition-signature-code-distance.js';

test('anchored two-packet partition signatures have exact minimum reassignment distance four',()=>{
 const r=runPartitionSignatureCodeDistanceAssay();
 assert.equal(r.spec_head,'c272de9c9031991af47afd6826c12e184609f082');
 assert.equal(r.pairwise_distance_ledger.length,6);
 assert.equal(r.minimum_signature_distance,4);
 assert.equal(r.minimum_distance_pairs.length,6);
 assert.ok(r.pairwise_distance_ledger.every(x=>x.q3_distance===2));
 assert.ok(r.pairwise_distance_ledger.every(x=>x.q4_distance===2));
 assert.ok(r.pairwise_distance_ledger.every(x=>x.signature_distance===4));
 assert.ok(r.pairwise_distance_ledger.every(x=>x.q3_certificate.zero_anchor_forced));
 assert.ok(r.pairwise_distance_ledger.every(x=>x.q4_certificate.zero_anchor_forced));
 assert.ok(r.pairwise_distance_ledger.every(x=>x.q3_certificate.nonzero_block_matching.assignment_count===720));
 assert.ok(r.pairwise_distance_ledger.every(x=>x.q4_certificate.nonzero_block_matching.assignment_count===720));

 assert.equal(r.inherited_two_move_calibration.all_distinct_hypothesis_packet_distances_equal_two,true);
 assert.deepEqual(r.inherited_two_move_calibration.observed_packet_distances,Array(12).fill(2));

 assert.equal(r.constructive_tight_attack.from,'H0');
 assert.equal(r.constructive_tight_attack.to,'H1');
 assert.equal(r.constructive_tight_attack.q3.from_kernel,'D_19');
 assert.equal(r.constructive_tight_attack.q3.to_kernel,'D_18');
 assert.equal(r.constructive_tight_attack.q4.from_kernel,'D_24');
 assert.equal(r.constructive_tight_attack.q4.to_kernel,'D_17');
 assert.equal(r.constructive_tight_attack.total_membership_moves,4);
 assert.equal(r.constructive_tight_attack.exact_target_reached,true);

 assert.equal(r.findings.minimum_two_packet_signature_distance_four,true);
 assert.equal(r.findings.three_or_fewer_anchored_reassignments_cannot_exactly_impersonate_another_clean_signature,true);
 assert.equal(r.findings.explicit_four_reassignment_exact_impersonation_exists,true);
 assert.equal(r.findings.correction_radius_earned,false);
 assert.equal(r.findings.assay_mechanism_validated,true);

 assert.equal(r.claim_ceiling.bounded_clean_codeword_impersonation_distance,true);
 assert.equal(r.claim_ceiling.error_correction,false);
 assert.equal(r.claim_ceiling.arbitrary_corruption_detection,false);
 assert.equal(r.claim_ceiling.cryptographic_security,false);
 assert.equal(r.claim_ceiling.td613_general_code_theorem,false);
 assert.equal(r.claim_ceiling.production_authority,false);
 assert.equal(r.claim_ceiling.vercel_authority,false);
});

test('ZERO-anchor prevents generic unlabeled block relabeling from undercounting kernel substitution',()=>{
 const r=runPartitionSignatureCodeDistanceAssay();
 const h0q3=r.clean_codewords.H0.q3;
 const h1q3=r.clean_codewords.H1.q3;
 const cert=anchoredPartitionDistance(h0q3,h1q3);
 assert.equal(cert.distance,2);
 assert.deepEqual(cert.zero_left,['D_19','ZERO']);
 assert.deepEqual(cert.zero_right,['D_18','ZERO']);
 assert.equal(cert.zero_retention,1);
 assert.equal(cert.zero_anchor_forced,true);
});
