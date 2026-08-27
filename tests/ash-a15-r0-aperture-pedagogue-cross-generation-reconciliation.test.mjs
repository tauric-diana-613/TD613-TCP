import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  CROSS_GENERATION_RECONCILIATION_SCHEMA,
  R2_RECONCILIATION_ID,
  R2_SELECTED_GENERATION_TWO_BRANCH_ID,
  R2_PROVENANCE_ROLES,
  authorCrossGenerationReconciliation,
  validateCrossGenerationReconciliation,
  buildCrossGenerationReconciliationFixture,
  runCrossGenerationReconciliationGauntlet
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-cross-generation-reconciliation.js';
import {
  GENERATION_TWO_SIBLING_IDS
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-multi-generation-prospective-branching.js';

const clone=value=>JSON.parse(JSON.stringify(value));
const stable=value=>JSON.stringify(value);

const fixture=buildCrossGenerationReconciliationFixture();
const {F,generationOne,priorReconciliation,prospective,generationTwo}=fixture;
const context={
  generation_two_branches:generationTwo,
  prospective,
  prior_reconciliation:priorReconciliation,
  generation_one_branches:generationOne,
  counterfactual_branch:F.A
};
const sourceBefore=stable({generationOne,priorReconciliation,prospective,generationTwo});
const r2=authorCrossGenerationReconciliation({
  generation_two_branches:generationTwo,
  prospective,
  prior_reconciliation:priorReconciliation,
  generation_one_branches:generationOne,
  counterfactual_branch:F.A
});

assert.equal(stable({generationOne,priorReconciliation,prospective,generationTwo}),sourceBefore,'R2 authoring must not mutate H/A-B-C-D/R1/P/G2 sources.');
assert.equal(r2.schema,CROSS_GENERATION_RECONCILIATION_SCHEMA);
assert.equal(r2.reconciliation_id,R2_RECONCILIATION_ID);
assert.equal(r2.event_status,'RECONCILIATION_ONLY');
assert.equal(r2.source_status,'SIMULATED');
assert.equal(r2.authority_class,'A2_DERIVATIONAL');
assert.equal(r2.manifestly_fictional,true);
assert.equal(r2.authorship_order,'AFTER_GENERATION_TWO_BRANCHING');
assert.equal(r2.generation_reconciled,2);
assert.equal(r2.reconciliation_mode,'COMPLETE_TYPED_CROSS_GENERATION_RECONCILIATION');
assert.equal(r2.selection_semantics,'SELECT_ONE_FOR_PROSPECTIVE_CONTINUATION_ONLY');
assert.equal(r2.selected_generation_two_branch_id,R2_SELECTED_GENERATION_TWO_BRANCH_ID);
assert.equal(r2.selected_generation_two_branch_status,'COUNTERFACTUAL_ONLY');
assert.equal(r2.selected_generation_two_branch_historical,false);
assert.equal(r2.historical_realization_claim,false);
assert.deepEqual(r2.generation_two_branch_universe_ids,GENERATION_TWO_SIBLING_IDS);
assert.equal(r2.retained_generation_two_branch_receipts.length,3);
assert.deepEqual(r2.retained_generation_two_branch_receipts,generationTwo);
assert.deepEqual(r2.provenance_roles.map(role=>role.provenance_role),R2_PROVENANCE_ROLES);
assert.equal(r2.provenance_roles[0].referent_ids.length,3);
assert.equal(r2.provenance_roles[1].referent_id,prospective.prospective_event_id);
assert.equal(r2.provenance_roles[2].referent_id,priorReconciliation.reconciliation_id);
assert.equal(r2.provenance_roles[3].referent_id,F.A.branch_id);
assert.equal(r2.prospective_context_id,prospective.prospective_event_id);
assert.deepEqual(r2.prospective_context_snapshot,prospective);
assert.equal(r2.prior_reconciliation_context_id,priorReconciliation.reconciliation_id);
assert.deepEqual(r2.prior_reconciliation_context_snapshot,priorReconciliation);
assert.equal(r2.inherited_counterfactual_state_branch_id,F.A.branch_id);
assert.equal(r2.inherited_counterfactual_state_status,'COUNTERFACTUAL_ONLY');
assert.deepEqual(r2.inherited_counterfactual_state_snapshot,F.A.current_state_signature);
assert.deepEqual(r2.shared_prefix_snapshot,prospective.shared_prefix_snapshot);
assert.deepEqual(r2.shared_prefix_event_ids,prospective.shared_prefix_event_ids);
assert.deepEqual(r2.retained_generation_one_branch_ids,prospective.declared_branch_universe_ids);
assert.deepEqual(r2.retained_generation_one_branch_receipts,prospective.retained_branch_receipts);
assert.equal(generationOne.every(branch=>branch.branch_status==='COUNTERFACTUAL_ONLY'),true);
assert.equal(generationTwo.every(branch=>branch.branch_status==='COUNTERFACTUAL_ONLY'),true);
assert.equal(prospective.selected_branch_status,'COUNTERFACTUAL_ONLY');
assert.equal(prospective.selected_branch_historical,false);
assert.equal(prospective.historical_realization_claim,false);
assert.equal(r2.historical_custody_mutated,false);
assert.equal(r2.prior_reconciliation_mutated,false);
assert.equal(r2.prospective_context_mutated,false);
assert.equal(r2.generation_one_branch_deleted,false);
assert.equal(r2.generation_two_branch_deleted,false);
assert.equal(r2.sibling_merge_performed,false);
assert.equal(r2.majority_vote_used,false);
assert.equal(r2.autonomous_selection,false);
assert.equal(r2.combined_confidence_scalar,null);
assert.equal(r2.sequence_authority,false);
assert.equal(r2.next_stage,null);
assert.deepEqual(r2.stage_unlocks,[]);
assert.equal(r2.promotion_authority,false);
assert.equal(r2.human_closure_required,true);
assert.equal(validateCrossGenerationReconciliation(r2,context),true);

for (const [label,mutate] of [
  ['incomplete G2 universe',r=>{r.generation_two_branch_universe_ids.pop();}],
  ['G2 receipt substitution',r=>{r.retained_generation_two_branch_receipts[1]=clone(r.retained_generation_two_branch_receipts[0]);}],
  ['selected branch switch',r=>{r.selected_generation_two_branch_id='G2_BETA';}],
  ['selected G2 historical laundering',r=>{r.selected_generation_two_branch_historical=true;}],
  ['unselected G2 historical laundering',r=>{r.retained_generation_two_branch_receipts[1].branch_status='HISTORICAL_REALIZED';}],
  ['G2 delete flag',r=>{r.generation_two_branch_deleted=true;}],
  ['sibling merge',r=>{r.sibling_merge_performed=true;}],
  ['generation-one deletion',r=>{r.retained_generation_one_branch_receipts.pop();}],
  ['generation-one delete flag',r=>{r.generation_one_branch_deleted=true;}],
  ['P snapshot rewrite',r=>{r.prospective_context_snapshot.prospective_event_id='P_REWRITTEN';}],
  ['R1 replacement',r=>{r.prior_reconciliation_context_id=R2_RECONCILIATION_ID;}],
  ['R1 snapshot rewrite',r=>{r.prior_reconciliation_context_snapshot.reconciliation_id='R1_REWRITTEN';}],
  ['A provenance switch',r=>{r.inherited_counterfactual_state_branch_id=F.B.branch_id;r.provenance_roles[3].referent_id=F.B.branch_id;}],
  ['A historical laundering',r=>{r.inherited_counterfactual_state_status='HISTORICAL_REALIZED';}],
  ['shared-prefix rewrite',r=>{r.shared_prefix_event_ids[0]='H_REWRITTEN';}],
  ['backdating',r=>{r.authorship_order='BEFORE_GENERATION_TWO_BRANCHING';}],
  ['generation laundering',r=>{r.generation_reconciled=3;}],
  ['provenance role swap',r=>{const x=r.provenance_roles[1];r.provenance_roles[1]=r.provenance_roles[2];r.provenance_roles[2]=x;}],
  ['generic parent flattening',r=>{r.parents=[prospective.prospective_event_id,priorReconciliation.reconciliation_id,F.A.branch_id];}],
  ['winner laundering',r=>{r.winner='G2_ALPHA';}],
  ['majority-vote laundering',r=>{r.majority_vote_used=true;}],
  ['confidence scalar collapse',r=>{r.combined_confidence_scalar=0.91;}],
  ['autonomous selection',r=>{r.autonomous_selection=true;}],
  ['execution authority',r=>{r.prospective_execution_authority=true;}],
  ['automatic execution',r=>{r.automatic_execution=true;}],
  ['historical custody mutation',r=>{r.historical_custody_mutated=true;}],
  ['recursive realization laundering',r=>{r.historical_realization_claim=true;}],
  ['historical promotion authority',r=>{r.historical_promotion_authorized=true;}],
  ['production mutation',r=>{r.production_mutated=true;}],
  ['installed Aperture mutation',r=>{r.installed_aperture_mutated=true;}],
  ['Pedagogue law promotion',r=>{r.pedagogue_law_promoted=true;}],
  ['sequence authority',r=>{r.sequence_authority=true;}],
  ['next stage',r=>{r.next_stage='A16';}],
  ['stage unlock',r=>{r.stage_unlocks=['A16'];}],
  ['promotion authority',r=>{r.promotion_authority=true;}]
]) {
  const hostile=clone(r2);
  mutate(hostile);
  assert.throws(()=>validateCrossGenerationReconciliation(hostile,context),undefined,label);
}

assert.equal(stable({generationOne,priorReconciliation,prospective,generationTwo}),sourceBefore,'hostile validation must not mutate R2 source objects.');

const receipt=runCrossGenerationReconciliationGauntlet();
assert.equal(receipt.ok,true);
assert.equal(receipt.schema,CROSS_GENERATION_RECONCILIATION_SCHEMA);
assert.equal(receipt.source_status,'SIMULATED');
assert.equal(receipt.authority_class,'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional,true);
assert.equal(receipt.reconciliation_id,R2_RECONCILIATION_ID);
assert.equal(receipt.generation_reconciled,2);
assert.equal(receipt.reconciled_generation_two_branch_count,3);
assert.equal(receipt.retained_generation_one_branch_count,4);
assert.equal(receipt.selected_generation_two_branch_id,'G2_ALPHA');
assert.equal(receipt.selected_generation_two_branch_status,'COUNTERFACTUAL_ONLY');
assert.equal(receipt.selected_generation_two_branch_historical,false);
assert.deepEqual(receipt.provenance_roles,R2_PROVENANCE_ROLES);
assert.equal(receipt.complete_generation_two_universe,true);
assert.equal(receipt.all_generation_two_counterfactual_only,true);
assert.equal(receipt.all_generation_one_retained,true);
assert.equal(receipt.all_hostiles_rejected,true);
assert.equal(receipt.source_inputs_preserved,true);
assert.equal(receipt.historical_collapse,false);
assert.match(receipt.gauntlet_status,/CROSS_GENERATION_RECONCILIATION_WITNESSED/);
assert.match(receipt.bounded_refinement_candidate,/without recursively laundering selection into historical realization/);
assert.match(receipt.next_learning_action,/TEST_POST_R2_PROSPECTIVE_CONTINUATION/);
assert.equal(receipt.claims.causal_identification,false);
assert.equal(receipt.claims.structural_causal_model_theorem,false);
assert.equal(receipt.claims.branching_time_theorem,false);
assert.equal(receipt.claims.possible_worlds_theorem,false);
assert.equal(receipt.claims.active_learning,false);
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

const spec=fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_CROSS_GENERATION_RECONCILIATION_GAUNTLET_SPEC_V0_1.md','utf8');
assert.match(spec,/frozen before the R2 executable implementation/);
assert.match(spec,/recursive reconciliation != recursive realization/);
assert.match(spec,/COMPLETE_GENERATION_TWO_RECONCILIATION_UNIVERSE/);
assert.match(spec,/INHERITED_PROSPECTIVE_CONTEXT/);
assert.match(spec,/INHERITED_RECONCILIATION_CONTEXT/);
assert.match(spec,/INHERITED_COUNTERFACTUAL_STATE_PROVENANCE/);
assert.match(spec,/A16 remains held/);
assert.match(spec,/TEST_POST_R2_PROSPECTIVE_CONTINUATION/);

console.log(JSON.stringify({
  ok:true,
  schema:receipt.schema,
  reconciliation_id:receipt.reconciliation_id,
  generation_reconciled:receipt.generation_reconciled,
  reconciled_generation_two_branch_count:receipt.reconciled_generation_two_branch_count,
  retained_generation_one_branch_count:receipt.retained_generation_one_branch_count,
  selected_generation_two_branch_id:receipt.selected_generation_two_branch_id,
  selected_generation_two_branch_status:receipt.selected_generation_two_branch_status,
  selected_generation_two_branch_historical:receipt.selected_generation_two_branch_historical,
  provenance_roles:receipt.provenance_roles,
  complete_generation_two_universe:receipt.complete_generation_two_universe,
  all_generation_two_counterfactual_only:receipt.all_generation_two_counterfactual_only,
  all_hostiles_rejected:receipt.all_hostiles_rejected,
  source_inputs_preserved:receipt.source_inputs_preserved,
  historical_collapse:receipt.historical_collapse,
  next_learning_action:receipt.next_learning_action,
  sequence_authority:receipt.sequence_authority,
  next_stage:receipt.next_stage,
  stage_unlocks:receipt.stage_unlocks,
  promotion_authority:receipt.promotion_authority
},null,2));
