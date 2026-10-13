import test from 'node:test';
import assert from 'node:assert/strict';
import { runPartitionSignatureDecoderRadiusAssay } from '../app/dome-world/previews/a15-r0/partition-signature-decoder-radius.js';

test('partition signature decoder radius separates exact detection from nearest-source correction',()=>{
 const r=runPartitionSignatureDecoderRadiusAssay();
 assert.equal(r.spec_head,'c42d54b4416c43f49bb3dc524c89fbc43f418208');
 assert.equal(r.attack_model,'SHORTEST_PATH_OVER_SINGLE_NONZERO_MEMBERSHIP_REASSIGNMENTS_WITH_ZERO_TRUSTED_AND_UNMOVED');
 assert.equal(r.decoder_score,'EXACT_MAXIMUM_OVERLAP_ANCHORED_REASSIGNMENT_DISTANCE');

 const expected={
  0:{reachable_signature_count:1,CORRECT_UNIQUE_NEAREST:1,NEAREST_TIE:0,WRONG_UNIQUE_NEAREST:0,NON_CODEWORD_EVIDENCE_CONFLICT:0,CLEAN_CODEWORD_IMPERSONATION:0,SOURCE_CLEAN_CODEWORD:1},
  1:{reachable_signature_count:56,CORRECT_UNIQUE_NEAREST:56,NEAREST_TIE:0,WRONG_UNIQUE_NEAREST:0,NON_CODEWORD_EVIDENCE_CONFLICT:56,CLEAN_CODEWORD_IMPERSONATION:0,SOURCE_CLEAN_CODEWORD:0},
  2:{reachable_signature_count:1316,CORRECT_UNIQUE_NEAREST:1285,NEAREST_TIE:31,WRONG_UNIQUE_NEAREST:0,NON_CODEWORD_EVIDENCE_CONFLICT:1316,CLEAN_CODEWORD_IMPERSONATION:0,SOURCE_CLEAN_CODEWORD:0},
  3:{reachable_signature_count:16996,CORRECT_UNIQUE_NEAREST:14998,NEAREST_TIE:1752,WRONG_UNIQUE_NEAREST:246,NON_CODEWORD_EVIDENCE_CONFLICT:16996,CLEAN_CODEWORD_IMPERSONATION:0,SOURCE_CLEAN_CODEWORD:0}
 };
 for(const h of ['H0','H1','H2','H3']){
  for(const k of [0,1,2,3])assert.deepEqual(r.exhaustive_ledgers[h][k],expected[k]);
 }
 assert.deepEqual(r.aggregate_reachable_by_cost,{0:4,1:224,2:5264,3:67984});

 const tie=r.witnesses.cost_2_tie;
 assert.equal(tie.source,'H0');
 assert.equal(tie.shortest_attack_cost,2);
 assert.equal(tie.decoder.nearest_class,'NEAREST_TIE');
 assert.equal(tie.decoder.distances.H0,2);
 assert.equal(tie.decoder.distances.H1,2);
 assert.deepEqual(tie.decoder.nearest_hypotheses,['H0','H1']);
 assert.equal(tie.path.length,2);

 const wrong=r.witnesses.cost_3_wrong_unique;
 assert.equal(wrong.source,'H0');
 assert.equal(wrong.shortest_attack_cost,3);
 assert.equal(wrong.decoder.nearest_class,'WRONG_UNIQUE_NEAREST');
 assert.deepEqual(wrong.decoder.nearest_hypotheses,['H1']);
 assert.equal(wrong.decoder.distances.H0,3);
 assert.equal(wrong.decoder.distances.H1,1);
 assert.equal(wrong.decoder.exact_class,'NON_CODEWORD_EVIDENCE_CONFLICT');
 assert.equal(wrong.path.length,3);

 assert.equal(r.findings.no_false_clean_codeword_impersonation_through_three_reassignments,true);
 assert.equal(r.findings.every_one_reassignment_state_has_correct_unique_nearest_source,true);
 assert.equal(r.findings.no_wrong_unique_nearest_state_through_two_reassignments,true);
 assert.equal(r.findings.two_reassignments_can_create_nearest_clean_ambiguity,true);
 assert.equal(r.findings.three_reassignments_can_create_wrong_unique_nearest_decoding,true);
 assert.equal(r.findings.exact_codeword_acceptance_and_nearest_decoding_have_different_robustness_envelopes,true);
 assert.equal(r.findings.assay_mechanism_validated,true);

 assert.equal(r.claim_ceiling.generic_error_correcting_code_theorem,false);
 assert.equal(r.claim_ceiling.cryptographic_integrity,false);
 assert.equal(r.claim_ceiling.byzantine_fault_tolerance,false);
 assert.equal(r.claim_ceiling.provenance_recovery_from_terminal_observation,false);
 assert.equal(r.claim_ceiling.proto_loom,false);
 assert.equal(r.claim_ceiling.production_authority,false);
 assert.equal(r.claim_ceiling.vercel_authority,false);
});
