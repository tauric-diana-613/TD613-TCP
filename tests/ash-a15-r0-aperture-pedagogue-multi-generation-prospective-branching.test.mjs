import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  MULTI_GENERATION_PROSPECTIVE_BRANCHING_SCHEMA,
  GENERATION_TWO_LINEAGE_ROLES,
  GENERATION_TWO_SIBLING_IDS,
  authorGenerationTwoProspectiveBranch,
  validateGenerationTwoProspectiveBranch,
  runMultiGenerationProspectiveBranchingGauntlet
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-multi-generation-prospective-branching.js';
import {
  buildCounterfactualBranchFixture
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-counterfactual-shared-prefix-branching.js';
import {
  authorExplicitReconciliationEvent
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-explicit-reconciliation-event.js';
import {
  authorPostReconciliationDualLineageEvent
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-post-reconciliation-dual-lineage.js';

const clone=value=>JSON.parse(JSON.stringify(value));
const stable=value=>JSON.stringify(value);

const F=buildCounterfactualBranchFixture();
const generationOne=[F.A,F.B,F.C,F.D];
const reconciliation=authorExplicitReconciliationEvent({
  reconciliation_id:'TEST_R_MULTI_GEN_SELECT_A',
  branches:generationOne,
  disposition:'SELECT_ONE_FOR_PROSPECTIVE_CONTINUATION',
  selected_branch_id:F.A.branch_id
});
const prospective=authorPostReconciliationDualLineageEvent({
  prospective_event_id:'TEST_P_MULTI_GEN_FROM_A',
  reconciliation,
  branches:generationOne,
  counterfactual_branch:F.A
});
const context={
  prospective,
  reconciliation,
  generation_one_branches:generationOne,
  counterfactual_branch:F.A,
  generation_two_sibling_ids:GENERATION_TWO_SIBLING_IDS
};
const sourceBefore=stable({generationOne,reconciliation,prospective});

const generationTwo=GENERATION_TWO_SIBLING_IDS.map(branch_id=>
  authorGenerationTwoProspectiveBranch({branch_id,...context})
);

assert.equal(stable({generationOne,reconciliation,prospective}),sourceBefore,'generation-two authoring must not mutate H/A-B-C-D/R/P source objects.');
assert.equal(generationTwo.length,3);
assert.equal(generationOne.every(branch=>branch.branch_status==='COUNTERFACTUAL_ONLY'),true);
assert.equal(prospective.selected_branch_status,'COUNTERFACTUAL_ONLY');
assert.equal(prospective.selected_branch_historical,false);
assert.equal(prospective.historical_realization_claim,false);

for (const branch of generationTwo) {
  assert.equal(branch.schema,MULTI_GENERATION_PROSPECTIVE_BRANCHING_SCHEMA);
  assert.equal(branch.branch_status,'COUNTERFACTUAL_ONLY');
  assert.equal(branch.source_status,'SIMULATED');
  assert.equal(branch.authority_class,'A2_DERIVATIONAL');
  assert.equal(branch.manifestly_fictional,true);
  assert.equal(branch.generation,2);
  assert.equal(branch.authorship_order,'AFTER_PROSPECTIVE_CONTINUATION');
  assert.equal(branch.lineage_mode,'TYPED_CROSS_GENERATION_LINEAGE');
  assert.deepEqual(branch.lineage.map(leg=>leg.lineage_role),GENERATION_TWO_LINEAGE_ROLES);
  assert.equal(branch.lineage.length,3);
  assert.equal(branch.lineage[0].referent_id,prospective.prospective_event_id);
  assert.equal(branch.lineage[1].referent_id,reconciliation.reconciliation_id);
  assert.equal(branch.lineage[2].referent_id,F.A.branch_id);
  assert.equal(branch.direct_prospective_source_id,prospective.prospective_event_id);
  assert.deepEqual(branch.direct_prospective_source_snapshot,prospective);
  assert.equal(branch.inherited_reconciliation_context_id,reconciliation.reconciliation_id);
  assert.deepEqual(branch.inherited_reconciliation_context_snapshot,reconciliation);
  assert.equal(branch.inherited_counterfactual_state_branch_id,F.A.branch_id);
  assert.equal(branch.inherited_counterfactual_state_status,'COUNTERFACTUAL_ONLY');
  assert.deepEqual(branch.inherited_counterfactual_state_snapshot,F.A.current_state_signature);
  assert.deepEqual(branch.shared_prefix_snapshot,prospective.shared_prefix_snapshot);
  assert.deepEqual(branch.shared_prefix_event_ids,prospective.shared_prefix_event_ids);
  assert.deepEqual(branch.retained_generation_one_branch_ids,prospective.declared_branch_universe_ids);
  assert.deepEqual(branch.retained_generation_one_branch_receipts,prospective.retained_branch_receipts);
  assert.deepEqual(branch.generation_two_sibling_ids,GENERATION_TWO_SIBLING_IDS);
  assert.equal(branch.prospective_variant_id,branch.branch_id);
  assert.equal(branch.current_state_signature.prospective_variant_id,branch.branch_id);
  assert.equal(branch.current_state_signature.prospective_variant_note,'RESEARCH_ONLY_COUNTERFACTUAL_VARIANT');
  const stateWithoutMarkers=clone(branch.current_state_signature);
  delete stateWithoutMarkers.prospective_variant_id;
  delete stateWithoutMarkers.prospective_variant_note;
  assert.deepEqual(stateWithoutMarkers,prospective.counterfactual_state_snapshot);
  assert.equal(branch.historical_realization_claim,false);
  assert.equal(branch.historical_custody_mutated,false);
  assert.equal(branch.prior_generation_mutated,false);
  assert.equal(branch.shared_history_rewritten,false);
  assert.equal(branch.generation_one_branch_deleted,false);
  assert.equal(branch.generation_two_sibling_deleted,false);
  assert.equal(branch.sibling_merge_performed,false);
  assert.equal(branch.majority_vote_used,false);
  assert.equal(branch.autonomous_selection,false);
  assert.equal(branch.combined_confidence_scalar,null);
  assert.equal(branch.sequence_authority,false);
  assert.equal(branch.next_stage,null);
  assert.deepEqual(branch.stage_unlocks,[]);
  assert.equal(branch.promotion_authority,false);
  assert.equal(branch.human_closure_required,true);
  assert.equal(validateGenerationTwoProspectiveBranch(branch,context),true);
}

const primary=generationTwo[0];
for (const [label,mutate] of [
  ['direct source skip',r=>{r.direct_prospective_source_id=F.A.branch_id;r.lineage[0].referent_id=F.A.branch_id;}],
  ['reconciliation switch',r=>{r.inherited_reconciliation_context_id='R_OTHER';r.lineage[1].referent_id='R_OTHER';}],
  ['state branch switch',r=>{r.inherited_counterfactual_state_branch_id=F.B.branch_id;r.lineage[2].referent_id=F.B.branch_id;}],
  ['lineage role swap',r=>{const a=r.lineage[0];r.lineage[0]=r.lineage[1];r.lineage[1]=a;}],
  ['generic parent flattening',r=>{r.parents=[r.direct_prospective_source_id,r.inherited_reconciliation_context_id,r.inherited_counterfactual_state_branch_id];r.lineage=[];}],
  ['generation laundering',r=>{r.generation=3;}],
  ['backdating',r=>{r.authorship_order='BEFORE_PROSPECTIVE_CONTINUATION';}],
  ['P historical laundering',r=>{r.direct_prospective_source_snapshot.selected_branch_historical=true;}],
  ['A historical laundering',r=>{r.inherited_counterfactual_state_status='HISTORICAL_REALIZED';}],
  ['P snapshot rewrite',r=>{r.direct_prospective_source_snapshot.prospective_note='REWRITTEN';}],
  ['R snapshot rewrite',r=>{r.inherited_reconciliation_context_snapshot.selected_branch_id='B_NEGATIVE';}],
  ['shared-prefix rewrite',r=>{r.shared_prefix_snapshot[0].payload.decision_input.y_hat=0.5;}],
  ['generation-one branch deletion',r=>{r.retained_generation_one_branch_receipts.pop();}],
  ['generation-one delete flag',r=>{r.generation_one_branch_deleted=true;}],
  ['generation-two sibling deletion',r=>{r.generation_two_sibling_ids.pop();}],
  ['generation-two delete flag',r=>{r.generation_two_sibling_deleted=true;}],
  ['sibling merge',r=>{r.sibling_merge_performed=true;}],
  ['majority-vote winner',r=>{r.majority_vote_used=true;r.winner='G2_ALPHA';}],
  ['autonomous selection',r=>{r.autonomous_selection=true;}],
  ['confidence scalar',r=>{r.combined_confidence_scalar=0.8;}],
  ['invented downstream consequence',r=>{r.current_state_signature.decision={status:'DECISION_ACTIONABLE_PLUS'};}],
  ['execution authority',r=>{r.prospective_execution_authority=true;}],
  ['automatic execution',r=>{r.automatic_execution=true;}],
  ['sequence authority',r=>{r.sequence_authority=true;}],
  ['next stage',r=>{r.next_stage='A16';}],
  ['stage unlock',r=>{r.stage_unlocks=['A16'];}],
  ['promotion authority',r=>{r.promotion_authority=true;}]
]) {
  const hostile=clone(primary);
  mutate(hostile);
  assert.throws(()=>validateGenerationTwoProspectiveBranch(hostile,context),undefined,label);
}

assert.equal(stable({generationOne,reconciliation,prospective}),sourceBefore,'hostile validation must not mutate source objects.');

const receipt=runMultiGenerationProspectiveBranchingGauntlet();
assert.equal(receipt.schema,MULTI_GENERATION_PROSPECTIVE_BRANCHING_SCHEMA);
assert.equal(receipt.source_status,'SIMULATED');
assert.equal(receipt.authority_class,'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional,true);
assert.equal(receipt.generation,2);
assert.equal(receipt.generation_two_branch_count,3);
assert.deepEqual(receipt.lineage_roles,GENERATION_TWO_LINEAGE_ROLES);
assert.equal(receipt.direct_source_id,'P_MULTI_GEN_FROM_A');
assert.equal(receipt.inherited_reconciliation_id,'R_MULTI_GEN_SELECT_A');
assert.equal(receipt.inherited_counterfactual_branch_id,'A_POSITIVE');
assert.equal(receipt.retained_generation_one_branch_count,4);
assert.deepEqual(receipt.generation_two_sibling_ids,GENERATION_TWO_SIBLING_IDS);
assert.equal(receipt.all_generation_two_counterfactual_only,true);
assert.equal(receipt.all_generation_two_lineage_exact,true);
assert.equal(receipt.all_generation_one_retained,true);
assert.equal(receipt.all_generation_two_siblings_retained,true);
assert.equal(receipt.all_hostiles_rejected,true);
assert.equal(receipt.source_inputs_preserved,true);
assert.equal(receipt.historical_collapse,false);
assert.match(receipt.gauntlet_status,/MULTI_GENERATION_PROSPECTIVE_BRANCHING_WITNESSED/);
assert.match(receipt.bounded_refinement_candidate,/without transitive historical collapse/);
assert.match(receipt.next_learning_action,/TEST_RECONCILIATION_ACROSS_GENERATIONS/);
assert.equal(receipt.claims.causal_identification,false);
assert.equal(receipt.claims.structural_causal_model_theorem,false);
assert.equal(receipt.claims.branching_time_theorem,false);
assert.equal(receipt.claims.possible_worlds_theorem,false);
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

const spec=fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_MULTI_GENERATION_PROSPECTIVE_BRANCHING_GAUNTLET_SPEC_V0_1.md','utf8');
assert.match(spec,/frozen before generation-two executable implementation/);
assert.match(spec,/transitive provenance != transitive realization/);
assert.match(spec,/DIRECT_PROSPECTIVE_DERIVATION_SOURCE/);
assert.match(spec,/INHERITED_RECONCILIATION_CONTEXT/);
assert.match(spec,/INHERITED_COUNTERFACTUAL_STATE_PROVENANCE/);
assert.match(spec,/generation index != stage index/);
assert.match(spec,/TEST_RECONCILIATION_ACROSS_GENERATIONS/);
assert.match(spec,/A16 remains held/);

console.log(JSON.stringify({
  ok:true,
  schema:receipt.schema,
  generation:receipt.generation,
  generation_two_branch_count:receipt.generation_two_branch_count,
  lineage_roles:receipt.lineage_roles,
  direct_source_id:receipt.direct_source_id,
  inherited_reconciliation_id:receipt.inherited_reconciliation_id,
  inherited_counterfactual_branch_id:receipt.inherited_counterfactual_branch_id,
  retained_generation_one_branch_count:receipt.retained_generation_one_branch_count,
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
