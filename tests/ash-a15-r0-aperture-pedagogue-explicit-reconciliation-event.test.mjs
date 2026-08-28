import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  EXPLICIT_RECONCILIATION_EVENT_SCHEMA,
  EXPLICIT_RECONCILIATION_DISPOSITIONS,
  authorExplicitReconciliationEvent,
  validateExplicitReconciliationEvent,
  runExplicitReconciliationEventGauntlet
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-explicit-reconciliation-event.js';
import {
  buildCounterfactualBranchFixture
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-counterfactual-shared-prefix-branching.js';

const clone=value=>JSON.parse(JSON.stringify(value));
const stable=value=>JSON.stringify(value);
const F=buildCounterfactualBranchFixture();
const primary=[F.A,F.B,F.C,F.D];
const before=stable(primary);

assert.deepEqual(EXPLICIT_RECONCILIATION_DISPOSITIONS,[
  'SELECT_ONE_FOR_PROSPECTIVE_CONTINUATION',
  'HOLD_BRANCH_SET_UNRESOLVED'
]);

const selected=authorExplicitReconciliationEvent({
  reconciliation_id:'TEST_RECONCILE_A',
  branches:primary,
  disposition:'SELECT_ONE_FOR_PROSPECTIVE_CONTINUATION',
  selected_branch_id:F.A.branch_id
});
assert.equal(selected.schema,EXPLICIT_RECONCILIATION_EVENT_SCHEMA);
assert.equal(selected.event_status,'AUTHORED_RECONCILIATION_EVENT');
assert.equal(selected.source_status,'SIMULATED');
assert.equal(selected.reconciliation_scope,'COUNTERFACTUAL_BRANCH_SET');
assert.equal(selected.authorship_order,'AFTER_REFERENCED_BRANCH_RECEIPTS');
assert.deepEqual(selected.shared_prefix_snapshot,F.A.shared_prefix_snapshot);
assert.deepEqual(selected.shared_prefix_event_ids,F.A.shared_prefix_event_ids);
assert.deepEqual(selected.declared_branch_universe_ids,primary.map(branch=>branch.branch_id));
assert.equal(selected.branch_receipts.length,4);
assert.equal(selected.selected_branch_id,F.A.branch_id);
assert.deepEqual(selected.selected_branch_head,F.A.current_state_signature);
assert.equal(selected.selection_basis,'EXPLICIT_AUTHORED_GESTURE');
assert.equal(selected.prospective_selection_recorded,true);
assert.equal(selected.selected_branch_historical,false);
assert.equal(selected.historical_realization_claim,false);
assert.equal(selected.historical_custody_mutated,false);
assert.equal(selected.reconciliation_event_historical_custody_entry,false);
assert.equal(selected.counterfactual_branch_statuses_preserved,true);
assert.equal(selected.branch_merge_performed,false);
assert.equal(selected.branch_deletion_performed,false);
assert.equal(selected.majority_vote_used,false);
assert.equal(selected.combined_confidence_scalar,null);
assert.equal(selected.historical_promotion_authorized,false);
assert.equal(selected.prospective_execution_authority,false);
assert.equal(selected.automatic_execution,false);
assert.equal(selected.promotion_authority,false);
assert.equal(selected.human_closure_required,true);
assert.equal(validateExplicitReconciliationEvent(selected,primary),true);
assert.equal(stable(primary),before,'authoring reconciliation may not mutate the branch universe.');
assert.equal(primary.every(branch=>branch.branch_status==='COUNTERFACTUAL_ONLY'),true);

const hold=authorExplicitReconciliationEvent({
  reconciliation_id:'TEST_RECONCILE_HOLD',
  branches:primary,
  disposition:'HOLD_BRANCH_SET_UNRESOLVED'
});
assert.equal(hold.selected_branch_id,null);
assert.equal(hold.selected_branch_head,null);
assert.equal(hold.selection_basis,null);
assert.equal(hold.prospective_selection_recorded,false);
assert.equal(validateExplicitReconciliationEvent(hold,primary),true);

assert.throws(() => authorExplicitReconciliationEvent({
  reconciliation_id:'TEST_IMPLICIT_SELECTION',
  branches:[F.A1,F.A2,F.B1],
  disposition:'SELECT_ONE_FOR_PROSPECTIVE_CONTINUATION'
}), /explicit selected_branch_id is required/);

assert.throws(() => authorExplicitReconciliationEvent({
  reconciliation_id:'TEST_UNKNOWN_SELECTION',
  branches:primary,
  disposition:'SELECT_ONE_FOR_PROSPECTIVE_CONTINUATION',
  selected_branch_id:'NOT_IN_UNIVERSE'
}), /must name one branch/);

assert.throws(() => authorExplicitReconciliationEvent({
  reconciliation_id:'TEST_BAD_HOLD',
  branches:primary,
  disposition:'HOLD_BRANCH_SET_UNRESOLVED',
  selected_branch_id:F.A.branch_id
}), /requires selected_branch_id = null/);

const duplicateHold=authorExplicitReconciliationEvent({
  reconciliation_id:'TEST_DUPLICATE_HOLD',
  branches:[F.A1,F.A2,F.B1],
  disposition:'HOLD_BRANCH_SET_UNRESOLVED'
});
assert.equal(duplicateHold.branch_receipts.length,3);
assert.equal(duplicateHold.selected_branch_id,null);
assert.equal(duplicateHold.majority_vote_used,false);
assert.equal(validateExplicitReconciliationEvent(duplicateHold,[F.A1,F.A2,F.B1]),true);

for (const [label,mutate,pattern] of [
  ['selected historical',r=>{r.selected_branch_historical=true;},/selected_branch_historical/],
  ['historical realization',r=>{r.historical_realization_claim=true;},/historical_realization_claim/],
  ['branch status laundering',r=>{r.branch_receipts[0].branch_status='HISTORICAL_REALIZED';},/branch receipt snapshots|relabel/],
  ['shared prefix rewrite',r=>{r.shared_prefix_snapshot[0].payload.decision_input.y_hat=0.5;},/shared prefix was rewritten/],
  ['branch deletion',r=>{r.branch_receipts.pop();},/branch receipt snapshots/],
  ['backdating',r=>{r.authorship_order='BEFORE_REFERENCED_BRANCH_RECEIPTS';},/backdated/],
  ['majority vote laundering',r=>{r.majority_vote_used=true;},/majority_vote_used/],
  ['merge laundering',r=>{r.branch_merge_performed=true;},/branch_merge_performed/]
]) {
  const hostile=clone(selected);
  mutate(hostile);
  assert.throws(() => validateExplicitReconciliationEvent(hostile,primary),pattern,label);
}

const hostileBranch=clone(F.A);
hostileBranch.shared_prefix_snapshot[0].payload.decision_input.y_hat=0.5;
hostileBranch.history[0].payload.decision_input.y_hat=0.5;
assert.throws(() => authorExplicitReconciliationEvent({
  reconciliation_id:'TEST_BAD_PREFIX',
  branches:[hostileBranch,F.B,F.C,F.D],
  disposition:'HOLD_BRANCH_SET_UNRESOLVED'
}), /exactly shared retained prefix/);

const receipt=runExplicitReconciliationEventGauntlet();
assert.equal(receipt.schema,EXPLICIT_RECONCILIATION_EVENT_SCHEMA);
assert.equal(receipt.source_status,'SIMULATED');
assert.equal(receipt.authority_class,'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional,true);
assert.equal(receipt.selected_reconciliation.selected_branch_id,F.A.branch_id);
assert.equal(receipt.selected_reconciliation.selected_branch_historical,false);
assert.equal(receipt.selected_reconciliation.historical_realization_claim,false);
assert.equal(receipt.selected_reconciliation.branch_receipts.length,4);
assert.equal(receipt.unresolved_reconciliation.selected_branch_id,null);
assert.equal(receipt.duplicate_majority_inferred_selection_rejected,true);
assert.equal(receipt.duplicate_majority_hold.selected_branch_id,null);
assert.equal(receipt.all_hostiles_rejected,true);
assert.equal(receipt.mutated_branch_prefix_rejected,true);
assert.equal(receipt.primary_branch_universe_preserved,true);
assert.equal(receipt.gauntlet_status,'EXPLICIT_RECONCILIATION_AS_NEW_AUTHORED_EVENT_WITNESSED_WITHOUT_HISTORICAL_REALIZATION_IN_BOUNDED_SYNTHETIC_FIXTURE');
assert.match(receipt.bounded_refinement_candidate,/later authored event over a complete counterfactual branch set/);
assert.match(receipt.bounded_refinement_candidate,/without converting the selected counterfactual into historical realization/);
assert.match(receipt.next_learning_action,/TEST_POST_RECONCILIATION_PROSPECTIVE_CONTINUATION_WITH_DUAL_LINEAGE/);
assert.equal(receipt.claims.historical_adjudication,false);
assert.equal(receipt.claims.causal_identification,false);
assert.equal(receipt.claims.consensus_theorem,false);
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
assert.equal(receipt.promotion_authority,false);
assert.equal(receipt.human_closure_required,true);

const spec=fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_EXPLICIT_RECONCILIATION_EVENT_GAUNTLET_SPEC_V0_1.md','utf8');
assert.match(spec,/Preregistration boundary: \*\*frozen before executable implementation\.\*\*/);
assert.match(spec,/reconciliation != realization/);
assert.match(spec,/prospective selection != historical fact/);
assert.match(spec,/selection != deletion/);
assert.match(spec,/selection != merge/);
assert.match(spec,/branch majority != evidence majority/);
assert.match(spec,/TEST_POST_RECONCILIATION_PROSPECTIVE_CONTINUATION_WITH_DUAL_LINEAGE/);

console.log(JSON.stringify({
  ok:true,
  schema:receipt.schema,
  selected_branch_id:receipt.selected_reconciliation.selected_branch_id,
  selected_branch_historical:receipt.selected_reconciliation.selected_branch_historical,
  historical_realization_claim:receipt.selected_reconciliation.historical_realization_claim,
  retained_branch_count:receipt.selected_reconciliation.branch_receipts.length,
  unresolved_selection:receipt.unresolved_reconciliation.selected_branch_id,
  duplicate_majority_inferred_selection_rejected:receipt.duplicate_majority_inferred_selection_rejected,
  all_hostiles_rejected:receipt.all_hostiles_rejected,
  historical_custody_mutated:receipt.historical_custody_mutated,
  next_learning_action:receipt.next_learning_action,
  promotion_authority:receipt.promotion_authority
},null,2));
