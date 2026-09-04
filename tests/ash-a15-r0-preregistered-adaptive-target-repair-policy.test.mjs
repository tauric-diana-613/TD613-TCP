import assert from 'node:assert/strict';
import {
  ADAPTIVE_REPAIR_POLICY,
  PREREGISTERED_POLICY_DIGEST,
  PREREGISTERED_ADAPTIVE_TARGET_REPAIR_CERTIFICATE as C,
  predictedAdaptiveLedger,
  executeAdaptiveRepairTrace,
  runPreregisteredAdaptiveTargetRepairPolicy
} from '../app/dome-world/previews/a15-r0/preregistered-adaptive-target-repair-policy.js';

assert.equal(C.status,'PREREGISTERED_ADAPTIVE_TARGET_REPAIR_POLICY_EARNED');
assert.equal(C.rest_symbol,'𝄐');
assert.equal(C.policy_digest,PREREGISTERED_POLICY_DIGEST);
assert.equal(C.policy_frozen_before_outcomes,true);
assert.equal(C.expected_target_refinement_not_realized_target_refinement,true);
assert.equal(C.adaptation_rule_preregistered_before_outcomes,true);
assert.equal(C.outcome_contingent_next_acquisition_admitted,true);
assert.equal(C.posthoc_reselection_forbidden,true);
assert.equal(C.predicted_ledger.ledger_kind,'PREDICTED_BEFORE_OUTCOME');
assert.equal(C.predicted_ledger.realized_outcome,null);
assert.equal(C.predicted_ledger.expected_unresolved_pairs_after_first_acquisition,1);
assert.equal(C.predicted_ledger.expected_pairs_resolved_after_first_acquisition,2);
assert.equal(C.predicted_ledger.expected_total_policy_cost,2);
assert.equal(C.realized_branch_receipts.A_SEPARATED.ledger_kind,'REALIZED_AFTER_OUTCOME');
assert.equal(C.realized_branch_receipts.A_SEPARATED.realized_second_acquisition,'Z_BC');
assert.equal(C.realized_branch_receipts.C_SEPARATED.realized_second_acquisition,'Z_AB');
assert.equal(C.realized_branch_receipts.A_SEPARATED.realized_complete_identification,true);
assert.equal(C.realized_branch_receipts.C_SEPARATED.realized_complete_identification,true);
assert.equal(C.adaptive_expected_total_cost,2);
assert.equal(C.nonadaptive_guaranteed_total_cost,3);
assert.equal(C.adaptive_cost_lower_in_fixture,true);
assert.equal(C.empirical_target_outcome_acquired,false);
assert.equal(C.synthetic_outcome_fixture,true);
assert.equal(C.stochastic_probe_failure_model_earned,false);
assert.equal(C.variable_realized_cost_model_earned,false);
assert.equal(C.empirical_supplemental_probe_repair_earned,false);
assert.equal(C.external_empirical_exteriority_witness_acquired,false);
assert.equal(C.empirical_exteriority_information_gain_measured,false);
assert.equal(C.external_origin_of_artifact_proven,false);
assert.deepEqual(C.exact_golden_egg_surfaces_added,[]);
assert.equal(C.empirical_credit_to_golden_egg,0);
assert.equal(C.golden_egg_earned,false);
assert.equal(C.sequence_authority,false);
assert.equal(C.merge_authority,false);
assert.equal(C.production_authority,false);
assert.equal(C.deployment_authority,false);
assert.equal(C.publication_authority,false);

const predicted=predictedAdaptiveLedger();
assert.equal(predicted.realized_refinement,null,'Predicted ledger must not contain realized refinement.');

const aTrace=executeAdaptiveRepairTrace([
  {acquisition:'Z_BRANCH',outcome:'A_SEPARATED'},
  {acquisition:'Z_BC',outcome:'SUCCESS'}
]);
assert.equal(aTrace.realized_total_cost,2);
assert.equal(aTrace.policy_branch_followed,true);
assert.equal(aTrace.posthoc_reselection_used,false);

const cTrace=executeAdaptiveRepairTrace([
  {acquisition:'Z_BRANCH',outcome:'C_SEPARATED'},
  {acquisition:'Z_AB',outcome:'SUCCESS'}
]);
assert.equal(cTrace.realized_total_cost,2);
assert.equal(cTrace.realized_complete_identification,true);

assert.throws(()=>executeAdaptiveRepairTrace([
  {acquisition:'Z_BRANCH',outcome:'A_SEPARATED'},
  {acquisition:'Z_AB',outcome:'SUCCESS'}
]),/POSTHOC_RESELECTION_FORBIDDEN/,'Observed outcomes may not trigger a branch that was not preregistered for that outcome.');

assert.throws(()=>executeAdaptiveRepairTrace([
  {acquisition:'Z_BRANCH',outcome:'C_SEPARATED'},
  {acquisition:'Z_BC',outcome:'SUCCESS'}
]),/POSTHOC_RESELECTION_FORBIDDEN/);

assert.throws(()=>executeAdaptiveRepairTrace([
  {acquisition:'Z_BRANCH',outcome:'A_SEPARATED'},
  {acquisition:'Z_BC',outcome:'SUCCESS'},
  {acquisition:'Z_AB',outcome:'SUCCESS'}
]),/POST_STOP_ACQUISITION_FORBIDDEN/,'The policy must stop once the preregistered target criterion is met.');

const unfrozen=structuredClone(ADAPTIVE_REPAIR_POLICY);
unfrozen.frozen_before_outcomes=false;
assert.equal(runPreregisteredAdaptiveTargetRepairPolicy(unfrozen).status,'INADMISSIBLE');

const mutatedBranch=structuredClone(ADAPTIVE_REPAIR_POLICY);
mutatedBranch.branch_map.A_SEPARATED.next='Z_AB';
assert.equal(runPreregisteredAdaptiveTargetRepairPolicy(mutatedBranch).status,'INADMISSIBLE','Policy mutation after preregistration must fail the digest and branch contract.');

const missingOutcome=structuredClone(ADAPTIVE_REPAIR_POLICY);
delete missingOutcome.branch_map.C_SEPARATED;
assert.equal(runPreregisteredAdaptiveTargetRepairPolicy(missingOutcome).status,'INADMISSIBLE');

await import('./ash-a15-r0-loom-adaptive-route-holonomy-receipt.test.mjs');

console.log('Preregistered adaptive target-repair policy tests passed.');
