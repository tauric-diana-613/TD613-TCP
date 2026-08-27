import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  POST_RECONCILIATION_DUAL_LINEAGE_SCHEMA,
  POST_RECONCILIATION_LINEAGE_ROLES,
  authorPostReconciliationDualLineageEvent,
  validatePostReconciliationDualLineageEvent,
  runPostReconciliationDualLineageGauntlet
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-post-reconciliation-dual-lineage.js';
import {
  buildCounterfactualBranchFixture
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-counterfactual-shared-prefix-branching.js';
import {
  authorExplicitReconciliationEvent
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-explicit-reconciliation-event.js';

const clone=value=>JSON.parse(JSON.stringify(value));
const stable=value=>JSON.stringify(value);
const F=buildCounterfactualBranchFixture();
const primary=[F.A,F.B,F.C,F.D];
const reconciliation=authorExplicitReconciliationEvent({
  reconciliation_id:'TEST_DUAL_R_SELECT_A',
  branches:primary,
  disposition:'SELECT_ONE_FOR_PROSPECTIVE_CONTINUATION',
  selected_branch_id:F.A.branch_id
});
const hold=authorExplicitReconciliationEvent({
  reconciliation_id:'TEST_DUAL_R_HOLD',
  branches:primary,
  disposition:'HOLD_BRANCH_SET_UNRESOLVED'
});
const branchesBefore=stable(primary);
const reconciliationBefore=stable(reconciliation);
const context={reconciliation,branches:primary,counterfactual_branch:F.A};

assert.deepEqual(POST_RECONCILIATION_LINEAGE_ROLES,[
  'RECONCILIATION_CONTEXT',
  'COUNTERFACTUAL_STATE_INPUT'
]);

const prospective=authorPostReconciliationDualLineageEvent({
  prospective_event_id:'TEST_P_AFTER_R_SELECT_A',
  reconciliation,
  branches:primary,
  counterfactual_branch:F.A
});

assert.equal(prospective.schema,POST_RECONCILIATION_DUAL_LINEAGE_SCHEMA);
assert.equal(prospective.event_status,'AUTHORED_PROSPECTIVE_CONTINUATION');
assert.equal(prospective.source_status,'SIMULATED');
assert.equal(prospective.authority_class,'A2_DERIVATIONAL');
assert.equal(prospective.manifestly_fictional,true);
assert.equal(prospective.authorship_order,'AFTER_RECONCILIATION_EVENT');
assert.equal(prospective.lineage_mode,'TYPED_DUAL_LINEAGE');
assert.equal(prospective.lineage.length,2);
assert.deepEqual(prospective.lineage.map(leg=>leg.lineage_role),POST_RECONCILIATION_LINEAGE_ROLES);
assert.equal(prospective.lineage[0].referent_id,reconciliation.reconciliation_id);
assert.equal(prospective.lineage[1].referent_id,F.A.branch_id);
assert.equal(prospective.reconciliation_context_id,reconciliation.reconciliation_id);
assert.deepEqual(prospective.reconciliation_context_snapshot,reconciliation);
assert.equal(prospective.counterfactual_state_branch_id,F.A.branch_id);
assert.deepEqual(prospective.counterfactual_state_snapshot,F.A.current_state_signature);
assert.deepEqual(prospective.shared_prefix_snapshot,reconciliation.shared_prefix_snapshot);
assert.deepEqual(prospective.shared_prefix_event_ids,reconciliation.shared_prefix_event_ids);
assert.deepEqual(prospective.declared_branch_universe_ids,reconciliation.declared_branch_universe_ids);
assert.deepEqual(prospective.retained_branch_receipts,reconciliation.branch_receipts);
assert.equal(prospective.retained_branch_receipts.length,4);
assert.equal(prospective.selected_branch_status,'COUNTERFACTUAL_ONLY');
assert.equal(prospective.selected_branch_historical,false);
assert.equal(prospective.historical_realization_claim,false);
assert.equal(prospective.historical_custody_mutated,false);
assert.equal(prospective.shared_history_rewritten,false);
assert.equal(prospective.unselected_branches_collapsed,false);
assert.equal(prospective.branch_merge_performed,false);
assert.equal(prospective.branch_deletion_performed,false);
assert.equal(prospective.branch_switch_performed,false);
assert.equal(prospective.majority_vote_used,false);
assert.equal(prospective.combined_confidence_scalar,null);
assert.equal(prospective.sequence_authority,false);
assert.equal(prospective.next_stage,null);
assert.deepEqual(prospective.stage_unlocks,[]);
assert.equal(prospective.promotion_authority,false);
assert.equal(prospective.human_closure_required,true);
assert.equal(validatePostReconciliationDualLineageEvent(prospective,context),true);
assert.equal(stable(primary),branchesBefore,'authoring prospective continuation may not mutate the branch universe.');
assert.equal(stable(reconciliation),reconciliationBefore,'authoring prospective continuation may not mutate reconciliation.');
assert.equal(primary.every(branch=>branch.branch_status==='COUNTERFACTUAL_ONLY'),true);

assert.throws(() => authorPostReconciliationDualLineageEvent({
  prospective_event_id:'TEST_P_FROM_HOLD',
  reconciliation:hold,
  branches:primary,
  counterfactual_branch:F.A
}), /explicitly selected reconciliation|unresolved hold/);

assert.throws(() => authorPostReconciliationDualLineageEvent({
  prospective_event_id:'TEST_P_BRANCH_SWITCH',
  reconciliation,
  branches:primary,
  counterfactual_branch:F.B
}), /must match the explicitly selected reconciliation branch|branch switching/);

for (const [label,mutate,pattern] of [
  ['missing reconciliation lineage',r=>{r.lineage=r.lineage.filter(leg=>leg.lineage_role!=='RECONCILIATION_CONTEXT');},/dual-lineage legs|both preregistered/],
  ['missing state lineage',r=>{r.lineage=r.lineage.filter(leg=>leg.lineage_role!=='COUNTERFACTUAL_STATE_INPUT');},/dual-lineage legs|both preregistered/],
  ['generic parent collapse',r=>{r.parents=[r.reconciliation_context_id,r.counterfactual_state_branch_id];r.lineage=[];},/generic parent collapse/],
  ['historical status laundering',r=>{r.selected_branch_status='HISTORICAL_REALIZED';},/relabeled as historical/],
  ['selected historical',r=>{r.selected_branch_historical=true;},/selected_branch_historical/],
  ['historical realization',r=>{r.historical_realization_claim=true;},/historical_realization_claim/],
  ['reconciliation context rewrite',r=>{r.reconciliation_context_snapshot.selected_branch_id='B_NEGATIVE';},/context snapshot was rewritten/],
  ['state snapshot rewrite',r=>{r.counterfactual_state_snapshot.decision.status='DECISION_ACTIONABLE_MINUS';},/state snapshot mismatch/],
  ['shared prefix rewrite',r=>{r.shared_prefix_snapshot[0].payload.decision_input.y_hat=0.5;},/rewrote shared prefix/],
  ['branch deletion',r=>{r.retained_branch_receipts.pop();},/deleted, collapsed, or rewrote/],
  ['unselected collapse',r=>{r.unselected_branches_collapsed=true;},/unselected_branches_collapsed/],
  ['branch merge',r=>{r.branch_merge_performed=true;},/branch_merge_performed/],
  ['branch switch',r=>{r.branch_switch_performed=true;},/branch_switch_performed/],
  ['backdating',r=>{r.authorship_order='BEFORE_RECONCILIATION_EVENT';},/backdated/],
  ['majority vote',r=>{r.majority_vote_used=true;},/majority_vote_used/],
  ['confidence scalar',r=>{r.combined_confidence_scalar=0.75;},/confidence scalar/],
  ['execution authority',r=>{r.prospective_execution_authority=true;},/prospective_execution_authority/],
  ['automatic execution',r=>{r.automatic_execution=true;},/automatic_execution/],
  ['sequence authority',r=>{r.sequence_authority=true;},/sequence_authority/],
  ['next stage',r=>{r.next_stage='A16';},/next stage/],
  ['stage unlock',r=>{r.stage_unlocks=['A16'];},/unlock stages/],
  ['promotion authority',r=>{r.promotion_authority=true;},/promotion_authority/]
]) {
  const hostile=clone(prospective);
  mutate(hostile);
  assert.throws(() => validatePostReconciliationDualLineageEvent(hostile,context),pattern,label);
}

const receipt=runPostReconciliationDualLineageGauntlet();
assert.equal(receipt.schema,POST_RECONCILIATION_DUAL_LINEAGE_SCHEMA);
assert.equal(receipt.source_status,'SIMULATED');
assert.equal(receipt.authority_class,'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional,true);
assert.deepEqual(receipt.lineage_roles,POST_RECONCILIATION_LINEAGE_ROLES);
assert.equal(receipt.retained_branch_count,4);
assert.equal(receipt.selected_branch_status,'COUNTERFACTUAL_ONLY');
assert.equal(receipt.unresolved_reconciliation_rejected,true);
assert.equal(receipt.branch_switch_rejected,true);
assert.equal(receipt.all_hostiles_rejected,true);
assert.equal(receipt.source_inputs_preserved,true);
assert.equal(receipt.gauntlet_status,'POST_RECONCILIATION_TYPED_DUAL_LINEAGE_WITNESSED_WITHOUT_HISTORICAL_COLLAPSE_IN_BOUNDED_SYNTHETIC_FIXTURE');
assert.match(receipt.bounded_refinement_candidate,/two distinct typed provenance roles/);
assert.match(receipt.bounded_refinement_candidate,/without collapsing either into historical realization/);
assert.match(receipt.next_learning_action,/TEST_MULTI_STEP_PROSPECTIVE_CONTINUATION/);
assert.equal(receipt.claims.historical_adjudication,false);
assert.equal(receipt.claims.causal_identification,false);
assert.equal(receipt.claims.causal_dag_theorem,false);
assert.equal(receipt.claims.structural_causal_model_theorem,false);
assert.equal(receipt.claims.active_learning,false);
assert.equal(receipt.claims.holonomy,false);
assert.equal(receipt.claims.proto_loom,false);
assert.equal(receipt.claims.production_authority,false);
assert.equal(receipt.claims.vercel_authority,false);
assert.equal(receipt.historical_custody_mutated,false);
assert.equal(receipt.installed_aperture_mutated,false);
assert.equal(receipt.pedagogue_law_promoted,false);
assert.equal(receipt.automatic_execution,false);
assert.equal(receipt.production_mutated,false);
assert.equal(receipt.sequence_authority,false);
assert.equal(receipt.next_stage,null);
assert.deepEqual(receipt.stage_unlocks,[]);
assert.equal(receipt.promotion_authority,false);
assert.equal(receipt.human_closure_required,true);

const spec=fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_POST_RECONCILIATION_DUAL_LINEAGE_GAUNTLET_SPEC_V0_1.md','utf8');
assert.match(spec,/Preregistration boundary: \*\*frozen before executable implementation\.\*\*/);
assert.match(spec,/RECONCILIATION_CONTEXT != COUNTERFACTUAL_STATE_INPUT/);
assert.match(spec,/derivation != realization/);
assert.match(spec,/dual lineage != causal parenthood/);
assert.match(spec,/selected counterfactual != historical state/);
assert.match(spec,/sequence_authority = false/);
assert.match(spec,/next_stage = null/);
assert.match(spec,/stage_unlocks = \[\]/);
assert.match(spec,/TEST_MULTI_STEP_PROSPECTIVE_CONTINUATION/);

console.log(JSON.stringify({
  ok:true,
  schema:receipt.schema,
  lineage_roles:receipt.lineage_roles,
  reconciliation_context_id:receipt.prospective_event.reconciliation_context_id,
  counterfactual_state_branch_id:receipt.prospective_event.counterfactual_state_branch_id,
  selected_branch_status:receipt.selected_branch_status,
  retained_branch_count:receipt.retained_branch_count,
  unresolved_reconciliation_rejected:receipt.unresolved_reconciliation_rejected,
  branch_switch_rejected:receipt.branch_switch_rejected,
  all_hostiles_rejected:receipt.all_hostiles_rejected,
  source_inputs_preserved:receipt.source_inputs_preserved,
  next_learning_action:receipt.next_learning_action,
  sequence_authority:receipt.sequence_authority,
  next_stage:receipt.next_stage,
  stage_unlocks:receipt.stage_unlocks,
  promotion_authority:receipt.promotion_authority
},null,2));
