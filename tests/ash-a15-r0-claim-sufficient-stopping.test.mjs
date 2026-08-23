import test from 'node:test';
import assert from 'node:assert/strict';
import { runClaimSufficientStoppingAssay } from '../app/dome-world/previews/a15-r0/claim-sufficient-stopping.js';

test('goal-conditioned conjugacy policy stops after one scalar for all 62 in-model truths', () => {
  const receipt=runClaimSufficientStoppingAssay();
  assert.equal(receipt.exhaustive_in_model_goal_cases.case_count,62);
  assert.equal(receipt.exhaustive_in_model_goal_cases.uniform_relation_holds,true);
  for(const item of receipt.exhaustive_in_model_goal_cases.cases) {
    assert.equal(item.goal_policy.measurement_count,1);
    assert.equal(item.goal_policy.target_claim_licensed,true);
    assert.equal(item.goal_policy.remaining_raw_count,31);
    assert.equal(item.goal_policy.raw_matrix_identified,false);
    assert.equal(item.goal_policy.stop_reason,'TARGET_CLAIM_LICENSED');
  }
});

test('raw-first policy needs the second scalar to license the same conjugacy claim', () => {
  const receipt=runClaimSufficientStoppingAssay();
  for(const item of receipt.exhaustive_in_model_goal_cases.cases) {
    assert.equal(item.raw_first_policy.steps[0].target_claim_state.ready,false);
    assert.equal(item.raw_first_policy.measurement_count,2);
    assert.equal(item.raw_first_policy.target_claim_licensed,true);
    assert.equal(item.raw_first_policy.remaining_raw_count,1);
    assert.equal(item.raw_first_policy.raw_matrix_identified,true);
  }
  assert.deepEqual(receipt.measurement_count_ledger,{ conjugacy_goal_conditioned:1, conjugacy_raw_first:2, raw_matrix_goal:2 });
});

test('raw-matrix goal still requires both complementary scalars', () => {
  const control=runClaimSufficientStoppingAssay().raw_state_goal_control;
  assert.equal(control.claim_first_policy_all_require_two,true);
  assert.equal(control.raw_first_policy_all_require_two,true);
  assert.equal(control.all_end_singleton,true);
});

test('out-of-model scalar defeats current support instead of forcing nearest claim', () => {
  const outsider=runClaimSufficientStoppingAssay().outsider_control;
  assert.equal(outsider.oracle_outside_label_used_to_override_support_test,false);
  assert.equal(outsider.result.measurement_count,1);
  assert.equal(outsider.result.steps[0].observed_outcome,6);
  assert.equal(outsider.result.remaining_raw_count,0);
  assert.equal(outsider.result.target_claim_licensed,false);
  assert.equal(outsider.result.forced_nearest_candidate,false);
  assert.equal(outsider.result.stop_reason,'OBSERVATION_OUTSIDE_CURRENT_MODEL_SUPPORT');
  assert.equal(outsider.control_pass,true);
});

test('claim ceiling retains synthetic stopping only', () => {
  const receipt=runClaimSufficientStoppingAssay();
  assert.equal(receipt.findings.assay_validated,true);
  assert.equal(receipt.pedagogue_relation,'PEDAGOGUE_CAN_STOP_WHEN_THE_REQUESTED_CLAIM_IS_CONSTANT_OVER_THE_SURVIVING_COMPATIBLE_FAMILY_WITHOUT_WAITING_FOR_A_POINT_ESTIMATE_IN_THIS_SYNTHETIC_MODEL');
  assert.equal(receipt.hostile_relation,'OUT_OF_MODEL_OBSERVATION_STOPS_WITH_MODEL_INADEQUACY_NOT_FORCED_CLASSIFICATION');
  assert.equal(receipt.claim_ceiling.universal_active_learning_law,false);
  assert.equal(receipt.claim_ceiling.bayesian_optimality,false);
  assert.equal(receipt.claim_ceiling.live_autonomous_experimentation,false);
  assert.equal(receipt.claim_ceiling.physical_sensing,false);
  assert.equal(receipt.claim_ceiling.proto_loom,false);
  assert.equal(receipt.claim_ceiling.production_authority,false);
  assert.equal(receipt.claim_ceiling.vercel_authority,false);
});
