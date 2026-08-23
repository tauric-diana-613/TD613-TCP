import test from 'node:test';
import assert from 'node:assert/strict';
import { runClaimTargetedNextMeasurementDesignBridge } from '../app/dome-world/previews/a15-r0/claim-targeted-next-measurement-design.js';

test('compatible universe contains 62 invertible matrices in exactly two conjugacy classes', () => {
  const receipt=runClaimTargetedNextMeasurementDesignBridge();
  assert.equal(receipt.current_aperture.compatible_candidate_count,62);
  assert.equal(receipt.target_claim.target_class_count,2);
  assert.deepEqual(receipt.target_claim.target_classes.map(item=>item.member_count),[31,31]);
});

test('raw-optimal one-scalar probes shrink to two raw candidates but preserve two target classes', () => {
  const receipt=runClaimTargetedNextMeasurementDesignBridge();
  const byId=Object.fromEntries(receipt.probe_partitions.map(item=>[item.probe_id,item]));
  assert.equal(byId.P_RAW.maximum_raw_bucket_size,2);
  assert.equal(byId.P_RAW.minimum_raw_bucket_size,2);
  assert.equal(byId.P_RAW.maximum_target_class_count_per_bucket,2);
  assert.equal(byId.P_RAW.candidate_count_with_target_resolved,0);
  assert.equal(byId.P_MIX.maximum_raw_bucket_size,2);
  assert.equal(byId.P_MIX.candidate_count_with_target_resolved,0);
});

test('claim-targeted probe leaves 31 raw candidates while making every outcome target-pure', () => {
  const receipt=runClaimTargetedNextMeasurementDesignBridge();
  const p=receipt.probe_partitions.find(item=>item.probe_id==='P_CLAIM');
  assert.equal(p.outcome_count,2);
  assert.equal(p.maximum_raw_bucket_size,31);
  assert.equal(p.minimum_raw_bucket_size,31);
  assert.equal(p.maximum_target_class_count_per_bucket,1);
  assert.equal(p.all_nonempty_buckets_target_pure,true);
  assert.equal(p.candidate_count_with_target_resolved,62);
  assert.equal(p.candidate_fraction_with_target_resolved,'62/62');
});

test('raw-state and target-claim selectors choose different probes without oracle consultation', () => {
  const receipt=runClaimTargetedNextMeasurementDesignBridge();
  assert.equal(receipt.selectors.raw_state.selected_probe_id,'P_RAW');
  assert.equal(receipt.selectors.target_claim.selected_probe_id,'P_CLAIM');
  assert.equal(receipt.selectors.raw_state.oracle_candidate_consulted,false);
  assert.equal(receipt.selectors.target_claim.oracle_candidate_consulted,false);
  assert.equal(receipt.findings.raw_state_and_target_claim_selectors_diverge,true);
});

test('exhaustive comparison holds uniformly over all 62 possible truths', () => {
  const exhaustive=runClaimTargetedNextMeasurementDesignBridge().exhaustive_no_oracle_evaluation;
  assert.equal(exhaustive.case_count,62);
  assert.equal(exhaustive.every_candidate_raw_selector_leaves_two_raw_and_two_target_classes,true);
  assert.equal(exhaustive.every_candidate_claim_selector_leaves_thirty_one_raw_and_one_target_class,true);
  for(const item of exhaustive.cases) {
    assert.equal(item.raw_selector_remaining_raw_count,2);
    assert.equal(item.raw_selector_remaining_target_class_count,2);
    assert.equal(item.claim_selector_remaining_raw_count,31);
    assert.equal(item.claim_selector_remaining_target_class_count,1);
  }
});

test('bridge claim ceiling rejects universal optimality and live measurement authority', () => {
  const receipt=runClaimTargetedNextMeasurementDesignBridge();
  assert.equal(receipt.findings.target_conditioned_measurement_design_bridge_validated,true);
  assert.equal(receipt.bridge_relation,'PEDAGOGUE_PROBE_SELECTION_CAN_BE_CONDITIONED_ON_THE_CLAIM_LICENSE_SOUGHT_WITHOUT_REQUIRING_FULL_RAW_RECONSTRUCTION_IN_THIS_SYNTHETIC_MODEL');
  assert.equal(receipt.claim_ceiling.universal_experiment_optimality,false);
  assert.equal(receipt.claim_ceiling.mutual_information_optimality,false);
  assert.equal(receipt.claim_ceiling.bayesian_active_learning,false);
  assert.equal(receipt.claim_ceiling.live_autonomous_measurement_authority,false);
  assert.equal(receipt.claim_ceiling.physical_sensor_design,false);
  assert.equal(receipt.claim_ceiling.physical_holonomy,false);
  assert.equal(receipt.claim_ceiling.proto_loom,false);
  assert.equal(receipt.claim_ceiling.production_authority,false);
  assert.equal(receipt.claim_ceiling.vercel_authority,false);
});
