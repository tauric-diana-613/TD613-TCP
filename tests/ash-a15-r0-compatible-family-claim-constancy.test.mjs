import test from 'node:test';
import assert from 'node:assert/strict';
import { runCompatibleFamilyClaimConstancyLedger } from '../app/dome-world/previews/a15-r0/compatible-family-claim-constancy.js';

test('Q1 leaves raw matrix unidentified while seven preregistered downstream claims remain identified', () => {
  const q1=runCompatibleFamilyClaimConstancyLedger().families.Q1;
  assert.equal(q1.compatible_family_size,31);
  assert.equal(q1.claims.RAW_MATRIX.identified,false);
  assert.deepEqual(q1.identified_claim_ids,[
    'TRACE','DETERMINANT','DISCRIMINANT','CONJUGACY_FINGERPRINT','LOOP_IS_IDENTITY','RANK_H_MINUS_I','REPEATED_ROOT_TYPE'
  ]);
  assert.deepEqual(q1.withheld_claim_ids,['RAW_MATRIX']);
  assert.deepEqual(q1.claims.REPEATED_ROOT_TYPE.distinct_values,['NOT_REPEATED_ROOT']);
});

test('Q2 preserves coarse scalar claims while withholding finer conjugacy structure', () => {
  const q2=runCompatibleFamilyClaimConstancyLedger().families.Q2;
  assert.equal(q2.compatible_family_size,31);
  assert.deepEqual(q2.identified_claim_ids,['TRACE','DETERMINANT','DISCRIMINANT','LOOP_IS_IDENTITY','RANK_H_MINUS_I']);
  assert.deepEqual(q2.withheld_claim_ids,['RAW_MATRIX','CONJUGACY_FINGERPRINT','REPEATED_ROOT_TYPE']);
  assert.equal(q2.claims.TRACE.distinct_values[0],6);
  assert.equal(q2.claims.DETERMINANT.distinct_values[0],9);
  assert.equal(q2.claims.DISCRIMINANT.distinct_values[0],0);
});

test('every withheld claim freezes a concrete counterexample pair from the complete compatible family', () => {
  const receipt=runCompatibleFamilyClaimConstancyLedger();
  for(const ledger of Object.values(receipt.families)) {
    for(const claimId of ledger.withheld_claim_ids) {
      const claim=ledger.claims[claimId];
      assert.ok(claim.counterexample);
      assert.notDeepEqual(claim.counterexample.left_value,claim.counterexample.right_value);
    }
  }
});

test('Q2 conjugacy and repeated-root witnesses use scalar b=0 versus Jordan b=1', () => {
  const q2=runCompatibleFamilyClaimConstancyLedger().families.Q2;
  assert.deepEqual(q2.claims.CONJUGACY_FINGERPRINT.counterexample.left_candidate_index,0);
  assert.deepEqual(q2.claims.CONJUGACY_FINGERPRINT.counterexample.right_candidate_index,1);
  assert.equal(q2.claims.REPEATED_ROOT_TYPE.counterexample.left_value,'SCALAR_REPEATED_ROOT');
  assert.equal(q2.claims.REPEATED_ROOT_TYPE.counterexample.right_value,'NONTRIVIAL_JORDAN_REPEATED_ROOT');
});

test('claim descent nickname carries no sheaf or categorical authority', () => {
  const receipt=runCompatibleFamilyClaimConstancyLedger();
  assert.equal(receipt.research_nickname,'CLAIM_DESCENT_LEDGER');
  assert.equal(receipt.naming_firewall.sheaf_descent,false);
  assert.equal(receipt.naming_firewall.stack_descent,false);
  assert.equal(receipt.naming_firewall.categorical_descent,false);
  assert.equal(receipt.naming_firewall.functorial_semantics,false);
  assert.equal(receipt.claim_ceiling.sheaf_structure,false);
  assert.equal(receipt.claim_ceiling.categorical_structure,false);
});

test('bounded research rule admits only claims constant across full current compatible family', () => {
  const receipt=runCompatibleFamilyClaimConstancyLedger();
  assert.equal(receipt.findings.ledger_validated,true);
  assert.equal(receipt.findings.downstream_claim_identifiability_can_be_coarser_than_raw_state_identifiability,true);
  assert.equal(receipt.findings.coarser_claims_can_remain_identified_while_finer_quotient_claim_is_withheld,true);
  assert.equal(receipt.candidate_research_rule,'WITHHOLD_ONLY_DOWNSTREAM_CLAIMS_THAT_VARY_ACROSS_THE_FULL_CURRENT_COMPATIBLE_FAMILY');
  assert.equal(receipt.claim_ceiling.universal_admissibility_theorem,false);
  assert.equal(receipt.claim_ceiling.proto_loom,false);
  assert.equal(receipt.claim_ceiling.production_authority,false);
  assert.equal(receipt.claim_ceiling.vercel_authority,false);
});
