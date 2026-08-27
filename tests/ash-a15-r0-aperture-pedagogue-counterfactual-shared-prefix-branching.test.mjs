import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  COUNTERFACTUAL_SHARED_PREFIX_BRANCHING_SCHEMA,
  buildSharedCounterfactualPrefix,
  forkCounterfactualBranch,
  compareCounterfactualBranches,
  buildCounterfactualBranchFixture,
  runCounterfactualSharedPrefixBranchingGauntlet
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-counterfactual-shared-prefix-branching.js';
import {
  replayDecisionCustodyHistory
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-decision-transition-append-only-custody-replay.js';
import {
  buildProvenanceFixtures
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-noisy-orientation-provenance-independence.js';

const clone=value=>JSON.parse(JSON.stringify(value));
const P=buildProvenanceFixtures();
const prefix=buildSharedCounterfactualPrefix();
assert.equal(prefix.history.length,1);
assert.equal(prefix.current_state.decision.status,'DECISION_ABSTAIN_ORIENTATION_UNRESOLVED');
assert.equal(prefix.current_state.custody.status,'CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT');
assert.equal(replayDecisionCustodyHistory(prefix.history).replay_consistent,true);

const A=forkCounterfactualBranch({
  branch_id:'TEST_A',
  prefix_ledger:prefix,
  suffix_kind:'DECISION_OBSERVATION',
  suffix_event_id:'TEST_A_E1',
  decision_input:{y_hat:0.001,bound:0.0002,actual_eta:0}
});
const B=forkCounterfactualBranch({
  branch_id:'TEST_B',
  prefix_ledger:prefix,
  suffix_kind:'DECISION_OBSERVATION',
  suffix_event_id:'TEST_B_E1',
  decision_input:{y_hat:-0.001,bound:0.0002,actual_eta:0}
});
assert.deepEqual(A.shared_prefix_snapshot,prefix.history);
assert.deepEqual(B.shared_prefix_snapshot,prefix.history);
assert.deepEqual(A.history.slice(0,prefix.history.length),prefix.history);
assert.deepEqual(B.history.slice(0,prefix.history.length),prefix.history);
assert.equal(A.suffix_events[0].sequence,prefix.history.length);
assert.equal(A.suffix_events[0].previous_event_id,prefix.history.at(-1).event_id);
assert.equal(A.current_state.decision.status,'DECISION_ACTIONABLE_PLUS');
assert.equal(B.current_state.decision.status,'DECISION_ACTIONABLE_MINUS');
assert.equal(A.branch_status,'COUNTERFACTUAL_ONLY');
assert.equal(A.historical_custody_mutated,false);
assert.equal(A.promotion_authority,false);
assert.equal(A.automatic_execution,false);

const AB=compareCounterfactualBranches([A,B]);
assert.equal(AB.shared_prefix_identical,true);
assert.equal(AB.relation_status,'DIVERGENT_COUNTERFACTUAL_HEADS');
assert.equal(AB.head_states_equal,false);
assert.equal(AB.decision_heads_equal,false);
assert.equal(AB.custody_heads_equal,true);
assert.equal(AB.divergence_event_index,prefix.history.length);
assert.equal(AB.winner,null);
assert.equal(AB.merge_authorized,false);
assert.equal(AB.merge_status,'EXPLICIT_RECONCILIATION_RULE_REQUIRED');
assert.equal(AB.majority_vote_used,false);
assert.equal(AB.historical_promotion_authorized,false);

const AEquivalent=forkCounterfactualBranch({
  branch_id:'TEST_A_EQUIVALENT',
  prefix_ledger:prefix,
  suffix_kind:'DECISION_OBSERVATION',
  suffix_event_id:'TEST_A_EQ_E1',
  decision_input:{y_hat:0.001,bound:0.0002,actual_eta:0}
});
const equivalent=compareCounterfactualBranches([A,AEquivalent]);
assert.equal(equivalent.relation_status,'EQUIVALENT_COUNTERFACTUAL_HEADS');
assert.equal(equivalent.head_states_equal,true);
assert.equal(equivalent.winner,null);
assert.equal(equivalent.merge_authorized,false);
assert.equal(equivalent.merge_status,'EQUIVALENT_HEADS_DO_NOT_CONSTITUTE_AUTHORIZED_MERGE');

assert.throws(() => forkCounterfactualBranch({
  branch_id:'BAD_KIND',
  prefix_ledger:prefix,
  suffix_kind:'UNDECLARED',
  suffix_event_id:'BAD_E1'
}), /preregistered/);
assert.throws(() => compareCounterfactualBranches([A,{...A}]), /branch_id values must be unique/);

const F=buildCounterfactualBranchFixture();
assert.equal(F.A.current_state.decision.status,'DECISION_ACTIONABLE_PLUS');
assert.equal(F.B.current_state.decision.status,'DECISION_ACTIONABLE_MINUS');
assert.equal(F.C.current_state.decision.status,'DECISION_ABSTAIN_ORIENTATION_UNRESOLVED');
assert.equal(F.C.current_state.custody.status,'CUSTODY_PROVENANCE_CONFLICT_HOLD');
assert.equal(F.D.current_state.decision.status,'DECISION_EVIDENCE_INELIGIBLE_BOUND_FALSIFIED');
assert.equal(F.D.current_state.custody.status,'CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT');

const duplicateMajority=compareCounterfactualBranches([F.A1,F.A2,F.B1]);
assert.equal(duplicateMajority.relation_status,'DIVERGENT_COUNTERFACTUAL_HEADS');
assert.equal(duplicateMajority.winner,null);
assert.equal(duplicateMajority.majority_vote_used,false);
assert.equal(duplicateMajority.merge_authorized,false);

const mutatedPrefixBranch=clone(F.A);
mutatedPrefixBranch.shared_prefix_snapshot[0].payload.decision_input.y_hat=0.001;
mutatedPrefixBranch.history[0].payload.decision_input.y_hat=0.001;
const invalidPrefixComparison=compareCounterfactualBranches([mutatedPrefixBranch,F.B]);
assert.equal(invalidPrefixComparison.shared_prefix_identical,false);
assert.equal(invalidPrefixComparison.relation_status,'INVALID_SHARED_PREFIX');
assert.equal(invalidPrefixComparison.winner,null);
assert.equal(invalidPrefixComparison.merge_authorized,false);
assert.throws(() => replayDecisionCustodyHistory(mutatedPrefixBranch.history), /payload\/state_after replay mismatch/);

const deletedSharedPrefix=clone(F.A.history);
deletedSharedPrefix.splice(0,1);
assert.throws(() => replayDecisionCustodyHistory(deletedSharedPrefix), /(sequence|INITIAL_JOINT_STATE|previous_event_id)/);

const harmonized=clone(F.B);
harmonized.shared_prefix_snapshot[0].payload.decision_input.y_hat=-0.001;
harmonized.history[0].payload.decision_input.y_hat=-0.001;
const retroactiveHarmonization=compareCounterfactualBranches([F.A,harmonized]);
assert.equal(retroactiveHarmonization.relation_status,'INVALID_SHARED_PREFIX');
assert.equal(retroactiveHarmonization.winner,null);
assert.equal(retroactiveHarmonization.merge_authorized,false);

const receipt=runCounterfactualSharedPrefixBranchingGauntlet();
assert.equal(receipt.schema,COUNTERFACTUAL_SHARED_PREFIX_BRANCHING_SCHEMA);
assert.equal(receipt.source_status,'SIMULATED');
assert.equal(receipt.authority_class,'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional,true);
assert.equal(receipt.shared_prefix_length,1);
assert.equal(receipt.all_primary_branches_replay_consistent,true);
assert.equal(receipt.all_primary_branches_preserve_shared_prefix,true);
assert.equal(receipt.comparisons.AB.relation_status,'DIVERGENT_COUNTERFACTUAL_HEADS');
assert.equal(receipt.comparisons.AB.winner,null);
assert.equal(receipt.comparisons.AB.merge_authorized,false);
assert.equal(receipt.comparisons.duplicate_majority.relation_status,'DIVERGENT_COUNTERFACTUAL_HEADS');
assert.equal(receipt.comparisons.duplicate_majority.winner,null);
assert.equal(receipt.comparisons.duplicate_majority.majority_vote_used,false);
assert.equal(receipt.gauntlet_status,'SHARED_CUSTODIED_PREFIX_WITH_DIVERGENT_COUNTERFACTUAL_SUFFIXES_WITNESSED_IN_BOUNDED_SYNTHETIC_FIXTURE');
assert.match(receipt.bounded_refinement_candidate,/multiple replayable counterfactual suffixes/);
assert.match(receipt.bounded_refinement_candidate,/one exactly shared retained evidence prefix/);
assert.match(receipt.next_learning_action,/TEST_EXPLICIT_RECONCILIATION_AS_A_NEW_AUTHORED_EVENT/);
assert.equal(receipt.claims.causal_counterfactual_theorem,false);
assert.equal(receipt.claims.structural_causal_model_theorem,false);
assert.equal(receipt.claims.multiverse,false);
assert.equal(receipt.claims.git_version_control_theorem,false);
assert.equal(receipt.claims.event_sourcing_theorem,false);
assert.equal(receipt.claims.active_learning,false);
assert.equal(receipt.claims.holonomy,false);
assert.equal(receipt.claims.production_authority,false);
assert.equal(receipt.claims.vercel_authority,false);
assert.equal(receipt.installed_aperture_mutated,false);
assert.equal(receipt.pedagogue_law_promoted,false);
assert.equal(receipt.historical_custody_mutated,false);
assert.equal(receipt.automatic_execution,false);
assert.equal(receipt.production_mutated,false);
assert.equal(receipt.promotion_authority,false);
assert.equal(receipt.human_closure_required,true);

const spec=fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_COUNTERFACTUAL_SHARED_PREFIX_BRANCHING_GAUNTLET_SPEC_V0_1.md','utf8');
assert.match(spec,/Preregistration boundary: \*\*frozen before executable implementation\.\*\*/);
assert.match(spec,/counterfactual_branch != historical_custody/);
assert.match(spec,/shared past != shared future/);
assert.match(spec,/branch comparison != reconciliation/);
assert.match(spec,/branch count != independent support/);
assert.match(spec,/EQUIVALENT_HEADS_DO_NOT_CONSTITUTE_AUTHORIZED_MERGE/);
assert.match(spec,/TEST_EXPLICIT_RECONCILIATION_AS_A_NEW_AUTHORED_EVENT/);

console.log(JSON.stringify({
  ok:true,
  schema:receipt.schema,
  shared_prefix_length:receipt.shared_prefix_length,
  branch_decisions:{
    A:receipt.branch_heads.A.decision.status,
    B:receipt.branch_heads.B.decision.status,
    C:receipt.branch_heads.C.decision.status,
    D:receipt.branch_heads.D.decision.status
  },
  branch_custody:{
    A:receipt.branch_heads.A.custody.status,
    B:receipt.branch_heads.B.custody.status,
    C:receipt.branch_heads.C.custody.status,
    D:receipt.branch_heads.D.custody.status
  },
  AB_relation:receipt.comparisons.AB.relation_status,
  duplicate_majority_relation:receipt.comparisons.duplicate_majority.relation_status,
  winner:receipt.comparisons.duplicate_majority.winner,
  merge_authorized:receipt.comparisons.AB.merge_authorized,
  next_learning_action:receipt.next_learning_action,
  promotion_authority:receipt.promotion_authority
},null,2));
