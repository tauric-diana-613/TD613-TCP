import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  POST_R2_PROSPECTIVE_CONTINUATION_SCHEMA,
  P2_PROSPECTIVE_EVENT_ID,
  P2_SELECTED_GENERATION_TWO_BRANCH_ID,
  P2_LINEAGE_ROLES,
  authorPostR2ProspectiveContinuation,
  validatePostR2ProspectiveContinuation,
  buildPostR2ProspectiveContinuationFixture,
  runPostR2ProspectiveContinuationGauntlet
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-post-r2-prospective-continuation.js';

const stable=value=>JSON.stringify(value);
const fixture=buildPostR2ProspectiveContinuationFixture();
const {F,generationOne,priorReconciliation,prospective,generationTwo,r2}=fixture;
const context={r2,generation_two_branches:generationTwo,prospective,prior_reconciliation:priorReconciliation,generation_one_branches:generationOne,counterfactual_branch:F.A};
const sourceBefore=stable({generationOne,priorReconciliation,prospective,generationTwo,r2});
const p2=authorPostR2ProspectiveContinuation(context);

assert.equal(stable({generationOne,priorReconciliation,prospective,generationTwo,r2}),sourceBefore);
assert.equal(p2.schema,POST_R2_PROSPECTIVE_CONTINUATION_SCHEMA);
assert.equal(p2.prospective_event_id,P2_PROSPECTIVE_EVENT_ID);
assert.equal(p2.event_status,'AUTHORED_PROSPECTIVE_CONTINUATION');
assert.equal(p2.source_status,'SIMULATED');
assert.equal(p2.authority_class,'A2_DERIVATIONAL');
assert.equal(p2.authorship_order,'AFTER_R2_RECONCILIATION');
assert.equal(p2.lineage_mode,'TYPED_POST_R2_DUAL_LINEAGE');
assert.deepEqual(p2.lineage.map(leg=>leg.lineage_role),P2_LINEAGE_ROLES);
assert.equal(p2.lineage.length,2);
assert.equal(p2.lineage[0].referent_id,r2.reconciliation_id);
assert.equal(p2.lineage[0].referent_status,'RECONCILIATION_ONLY');
assert.equal(p2.lineage[1].referent_id,P2_SELECTED_GENERATION_TWO_BRANCH_ID);
assert.equal(p2.lineage[1].referent_status,'COUNTERFACTUAL_ONLY');
assert.deepEqual(p2.r2_reconciliation_context_snapshot,r2);
assert.deepEqual(p2.selected_generation_two_state_snapshot,generationTwo[0].current_state_signature);
assert.deepEqual(p2.selected_generation_two_branch_receipt_snapshot,generationTwo[0]);
assert.equal(p2.selected_generation_two_branch_historical,false);
assert.equal(p2.historical_realization_claim,false);
assert.equal(p2.prospective_event_historical_custody_entry,false);
assert.deepEqual(p2.retained_generation_one_branch_receipts,r2.retained_generation_one_branch_receipts);
assert.deepEqual(p2.retained_generation_two_branch_receipts,r2.retained_generation_two_branch_receipts);
assert.equal(p2.retained_generation_one_branch_receipts.length,4);
assert.equal(p2.retained_generation_two_branch_receipts.length,3);
assert.equal(p2.r2_reconciliation_context_snapshot.prospective_context_id,prospective.prospective_event_id);
assert.equal(p2.r2_reconciliation_context_snapshot.prior_reconciliation_context_id,priorReconciliation.reconciliation_id);
assert.equal(p2.r2_reconciliation_context_snapshot.inherited_counterfactual_state_branch_id,F.A.branch_id);
assert.equal(p2.historical_custody_mutated,false);
assert.equal(p2.r2_reconciliation_mutated,false);
assert.equal(p2.generation_one_branch_deleted,false);
assert.equal(p2.generation_two_branch_deleted,false);
assert.equal(p2.sibling_merge_performed,false);
assert.equal(p2.branch_switch_performed,false);
assert.equal(p2.majority_vote_used,false);
assert.equal(p2.autonomous_selection,false);
assert.equal(p2.combined_confidence_scalar,null);
assert.equal(p2.prospective_execution_authority,false);
assert.equal(p2.automatic_execution,false);
assert.equal(p2.sequence_authority,false);
assert.equal(p2.next_stage,null);
assert.deepEqual(p2.stage_unlocks,[]);
assert.equal(p2.promotion_authority,false);
assert.equal(p2.human_closure_required,true);
assert.equal(validatePostR2ProspectiveContinuation(p2,context),true);
assert.equal(stable({generationOne,priorReconciliation,prospective,generationTwo,r2}),sourceBefore);

const receipt=runPostR2ProspectiveContinuationGauntlet();
assert.equal(receipt.ok,true);
assert.equal(receipt.schema,POST_R2_PROSPECTIVE_CONTINUATION_SCHEMA);
assert.equal(receipt.prospective_event_id,P2_PROSPECTIVE_EVENT_ID);
assert.equal(receipt.event_status,'AUTHORED_PROSPECTIVE_CONTINUATION');
assert.deepEqual(receipt.lineage_roles,P2_LINEAGE_ROLES);
assert.equal(receipt.r2_reconciliation_context_id,r2.reconciliation_id);
assert.equal(receipt.selected_generation_two_state_branch_id,'G2_ALPHA');
assert.equal(receipt.selected_generation_two_state_status,'COUNTERFACTUAL_ONLY');
assert.equal(receipt.selected_generation_two_branch_historical,false);
assert.equal(receipt.retained_generation_one_branch_count,4);
assert.equal(receipt.retained_generation_two_branch_count,3);
assert.equal(receipt.complete_generation_one_universe,true);
assert.equal(receipt.complete_generation_two_universe,true);
assert.equal(receipt.all_generation_one_counterfactual_only,true);
assert.equal(receipt.all_generation_two_counterfactual_only,true);
assert.equal(receipt.r2_retained_non_historical,true);
assert.equal(receipt.all_hostiles_rejected,true);
assert.equal(receipt.source_inputs_preserved,true);
assert.equal(receipt.historical_collapse,false);
assert.match(receipt.gauntlet_status,/POST_R2_PROSPECTIVE_CONTINUATION_WITNESSED/);
assert.match(receipt.bounded_refinement_candidate,/preserving historical non-realization/);
assert.equal(receipt.next_learning_action,'HELD_PENDING_WITNESSED_RECEIPT_REVIEW');
assert.equal(Object.values(receipt.hostile_rejections).every(Boolean),true);
assert.equal(receipt.claims.causal_identification,false);
assert.equal(receipt.claims.structural_causal_model_theorem,false);
assert.equal(receipt.claims.branching_time_theorem,false);
assert.equal(receipt.claims.possible_worlds_theorem,false);
assert.equal(receipt.claims.prediction,false);
assert.equal(receipt.claims.planning,false);
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

const spec=fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_POST_R2_PROSPECTIVE_CONTINUATION_GAUNTLET_SPEC_V0_1.md','utf8');
assert.match(spec,/frozen before the P2 executable implementation/);
assert.match(spec,/prospective continuation after recursive reconciliation != historical realization/);
assert.match(spec,/R2_RECONCILIATION_CONTEXT/);
assert.match(spec,/SELECTED_GENERATION_TWO_COUNTERFACTUAL_STATE_INPUT/);
assert.match(spec,/No downstream chamber is authorized by preregistration alone/);
assert.match(spec,/A16 remains held/);

console.log(JSON.stringify({ok:true,schema:receipt.schema,prospective_event_id:receipt.prospective_event_id,event_status:receipt.event_status,lineage_roles:receipt.lineage_roles,r2_reconciliation_context_id:receipt.r2_reconciliation_context_id,selected_generation_two_state_branch_id:receipt.selected_generation_two_state_branch_id,selected_generation_two_state_status:receipt.selected_generation_two_state_status,selected_generation_two_branch_historical:receipt.selected_generation_two_branch_historical,retained_generation_one_branch_count:receipt.retained_generation_one_branch_count,retained_generation_two_branch_count:receipt.retained_generation_two_branch_count,all_hostiles_rejected:receipt.all_hostiles_rejected,source_inputs_preserved:receipt.source_inputs_preserved,historical_collapse:receipt.historical_collapse,next_learning_action:receipt.next_learning_action,sequence_authority:receipt.sequence_authority,next_stage:receipt.next_stage,stage_unlocks:receipt.stage_unlocks,promotion_authority:receipt.promotion_authority},null,2));
