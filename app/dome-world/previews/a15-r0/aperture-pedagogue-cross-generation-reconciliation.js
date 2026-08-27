import {
  buildCounterfactualBranchFixture
} from './aperture-pedagogue-counterfactual-shared-prefix-branching.js';
import {
  authorExplicitReconciliationEvent
} from './aperture-pedagogue-explicit-reconciliation-event.js';
import {
  authorPostReconciliationDualLineageEvent,
  validatePostReconciliationDualLineageEvent
} from './aperture-pedagogue-post-reconciliation-dual-lineage.js';
import {
  GENERATION_TWO_SIBLING_IDS,
  authorGenerationTwoProspectiveBranch,
  validateGenerationTwoProspectiveBranch
} from './aperture-pedagogue-multi-generation-prospective-branching.js';

export const CROSS_GENERATION_RECONCILIATION_SCHEMA =
  'td613.a15-r0.aperture-pedagogue-cross-generation-reconciliation/v0.1';

export const R2_RECONCILIATION_ID = 'R2_RECONCILE_G2_SELECT_ALPHA';
export const R2_SELECTED_GENERATION_TWO_BRANCH_ID = 'G2_ALPHA';
export const R2_PROVENANCE_ROLES = Object.freeze([
  'COMPLETE_GENERATION_TWO_RECONCILIATION_UNIVERSE',
  'INHERITED_PROSPECTIVE_CONTEXT',
  'INHERITED_RECONCILIATION_CONTEXT',
  'INHERITED_COUNTERFACTUAL_STATE_PROVENANCE'
]);

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function stable(value) {
  return JSON.stringify(value);
}

function expectedProvenanceRoles({prospective,prior_reconciliation,counterfactual_branch}) {
  return [
    {
      provenance_role:'COMPLETE_GENERATION_TWO_RECONCILIATION_UNIVERSE',
      referent_ids:clone(GENERATION_TWO_SIBLING_IDS),
      referent_status:'COUNTERFACTUAL_ONLY'
    },
    {
      provenance_role:'INHERITED_PROSPECTIVE_CONTEXT',
      referent_id:prospective.prospective_event_id,
      referent_status:prospective.event_status
    },
    {
      provenance_role:'INHERITED_RECONCILIATION_CONTEXT',
      referent_id:prior_reconciliation.reconciliation_id,
      referent_status:prior_reconciliation.event_status
    },
    {
      provenance_role:'INHERITED_COUNTERFACTUAL_STATE_PROVENANCE',
      referent_id:counterfactual_branch.branch_id,
      referent_status:counterfactual_branch.branch_status
    }
  ];
}

function generationTwoContext({prospective,prior_reconciliation,generation_one_branches,counterfactual_branch}) {
  return {
    prospective,
    reconciliation:prior_reconciliation,
    generation_one_branches,
    counterfactual_branch,
    generation_two_sibling_ids:GENERATION_TWO_SIBLING_IDS
  };
}

function requireValidSourceContext({
  generation_two_branches,
  prospective,
  prior_reconciliation,
  generation_one_branches,
  counterfactual_branch
}) {
  if (!Array.isArray(generation_two_branches) || generation_two_branches.length !== GENERATION_TWO_SIBLING_IDS.length) {
    throw new TypeError('complete generation-two branch universe is required.');
  }
  if (!prospective || typeof prospective !== 'object') throw new TypeError('prospective context P is required.');
  if (!prior_reconciliation || typeof prior_reconciliation !== 'object') throw new TypeError('prior reconciliation R1 is required.');
  if (!Array.isArray(generation_one_branches) || generation_one_branches.length !== 4) {
    throw new TypeError('complete four-branch generation-one universe is required.');
  }
  if (!counterfactual_branch || typeof counterfactual_branch !== 'object') {
    throw new TypeError('generation-one counterfactual state provenance A is required.');
  }

  validatePostReconciliationDualLineageEvent(prospective,{
    reconciliation:prior_reconciliation,
    branches:generation_one_branches,
    counterfactual_branch
  });

  const g2Context=generationTwoContext({
    prospective,
    prior_reconciliation,
    generation_one_branches,
    counterfactual_branch
  });
  const ids=generation_two_branches.map(branch=>branch?.branch_id);
  if (stable(ids) !== stable(GENERATION_TWO_SIBLING_IDS)) {
    throw new Error('generation-two source universe must equal the complete preregistered ordered sibling set.');
  }
  generation_two_branches.forEach(branch=>validateGenerationTwoProspectiveBranch(branch,g2Context));

  if (!generation_one_branches.every(branch=>branch.branch_status==='COUNTERFACTUAL_ONLY')) {
    throw new Error('all retained generation-one branches must remain COUNTERFACTUAL_ONLY.');
  }
  if (counterfactual_branch.branch_status !== 'COUNTERFACTUAL_ONLY') {
    throw new Error('inherited counterfactual state provenance A must remain COUNTERFACTUAL_ONLY.');
  }
  if (prospective.selected_branch_status !== 'COUNTERFACTUAL_ONLY' ||
      prospective.selected_branch_historical !== false ||
      prospective.historical_realization_claim !== false) {
    throw new Error('prospective context P must remain non-historical.');
  }
  if (prospective.counterfactual_state_branch_id !== counterfactual_branch.branch_id) {
    throw new Error('P and inherited state provenance A disagree.');
  }
  if (prospective.reconciliation_context_id !== prior_reconciliation.reconciliation_id) {
    throw new Error('P and prior reconciliation R1 disagree.');
  }
  return true;
}

export function authorCrossGenerationReconciliation({
  reconciliation_id=R2_RECONCILIATION_ID,
  generation_two_branches,
  prospective,
  prior_reconciliation,
  generation_one_branches,
  counterfactual_branch,
  selected_generation_two_branch_id=R2_SELECTED_GENERATION_TWO_BRANCH_ID
}) {
  requireValidSourceContext({
    generation_two_branches,
    prospective,
    prior_reconciliation,
    generation_one_branches,
    counterfactual_branch
  });

  if (reconciliation_id !== R2_RECONCILIATION_ID) {
    throw new Error('R2 reconciliation id must remain the preregistered fixture id.');
  }
  if (selected_generation_two_branch_id !== R2_SELECTED_GENERATION_TWO_BRANCH_ID) {
    throw new Error('R2 selected generation-two branch must remain preregistered G2_ALPHA.');
  }
  const selected=generation_two_branches.find(branch=>branch.branch_id===selected_generation_two_branch_id);
  if (!selected) throw new Error('selected generation-two branch must be present in the complete source universe.');

  const receipt=freeze({
    schema:CROSS_GENERATION_RECONCILIATION_SCHEMA,
    reconciliation_id,
    event_status:'RECONCILIATION_ONLY',
    source_status:'SIMULATED',
    authority_class:'A2_DERIVATIONAL',
    manifestly_fictional:true,
    authorship_order:'AFTER_GENERATION_TWO_BRANCHING',
    generation_reconciled:2,
    reconciliation_mode:'COMPLETE_TYPED_CROSS_GENERATION_RECONCILIATION',
    selection_semantics:'SELECT_ONE_FOR_PROSPECTIVE_CONTINUATION_ONLY',
    selected_generation_two_branch_id,
    selected_generation_two_branch_status:'COUNTERFACTUAL_ONLY',
    selected_generation_two_branch_historical:false,
    selected_generation_two_branch_snapshot:freeze(clone(selected)),
    historical_realization_claim:false,
    generation_two_branch_universe_ids:freeze(clone(GENERATION_TWO_SIBLING_IDS)),
    retained_generation_two_branch_receipts:freeze(clone(generation_two_branches)),
    provenance_roles:freeze(clone(expectedProvenanceRoles({prospective,prior_reconciliation,counterfactual_branch}))),
    prospective_context_id:prospective.prospective_event_id,
    prospective_context_snapshot:freeze(clone(prospective)),
    prior_reconciliation_context_id:prior_reconciliation.reconciliation_id,
    prior_reconciliation_context_snapshot:freeze(clone(prior_reconciliation)),
    inherited_counterfactual_state_branch_id:counterfactual_branch.branch_id,
    inherited_counterfactual_state_status:'COUNTERFACTUAL_ONLY',
    inherited_counterfactual_state_snapshot:freeze(clone(counterfactual_branch.current_state_signature)),
    shared_prefix_snapshot:freeze(clone(prospective.shared_prefix_snapshot)),
    shared_prefix_event_ids:freeze(clone(prospective.shared_prefix_event_ids)),
    retained_generation_one_branch_ids:freeze(clone(prospective.declared_branch_universe_ids)),
    retained_generation_one_branch_receipts:freeze(clone(prospective.retained_branch_receipts)),
    historical_custody_mutated:false,
    prior_reconciliation_mutated:false,
    prospective_context_mutated:false,
    generation_one_branch_deleted:false,
    generation_two_branch_deleted:false,
    sibling_merge_performed:false,
    majority_vote_used:false,
    autonomous_selection:false,
    combined_confidence_scalar:null,
    historical_promotion_authorized:false,
    prospective_execution_authority:false,
    automatic_execution:false,
    production_mutated:false,
    installed_aperture_mutated:false,
    pedagogue_law_promoted:false,
    sequence_authority:false,
    next_stage:null,
    stage_unlocks:freeze([]),
    promotion_authority:false,
    human_closure_required:true
  });

  validateCrossGenerationReconciliation(receipt,{
    generation_two_branches,
    prospective,
    prior_reconciliation,
    generation_one_branches,
    counterfactual_branch
  });
  return receipt;
}

export function validateCrossGenerationReconciliation(receipt,context) {
  if (!receipt || typeof receipt !== 'object') throw new TypeError('R2 reconciliation receipt must be an object.');
  requireValidSourceContext(context);
  const {
    generation_two_branches,
    prospective,
    prior_reconciliation,
    generation_one_branches,
    counterfactual_branch
  }=context;

  if (receipt.schema !== CROSS_GENERATION_RECONCILIATION_SCHEMA) throw new Error('R2 schema mismatch.');
  if (receipt.reconciliation_id !== R2_RECONCILIATION_ID) throw new Error('R2 reconciliation id mismatch.');
  if (receipt.event_status !== 'RECONCILIATION_ONLY') throw new Error('R2 event status widened beyond reconciliation-only.');
  if (receipt.source_status !== 'SIMULATED' || receipt.manifestly_fictional !== true) throw new Error('R2 widened beyond synthetic fixture.');
  if (receipt.authority_class !== 'A2_DERIVATIONAL') throw new Error('R2 authority class mismatch.');
  if (receipt.authorship_order !== 'AFTER_GENERATION_TWO_BRANCHING') throw new Error('R2 may not be backdated before generation-two branching.');
  if (receipt.generation_reconciled !== 2) throw new Error('R2 must reconcile generation 2; generation index is not a stage index.');
  if (receipt.reconciliation_mode !== 'COMPLETE_TYPED_CROSS_GENERATION_RECONCILIATION') throw new Error('R2 reconciliation mode mismatch.');
  if (receipt.selection_semantics !== 'SELECT_ONE_FOR_PROSPECTIVE_CONTINUATION_ONLY') throw new Error('R2 selection semantics widened beyond prospective continuation only.');
  if (Object.hasOwn(receipt,'parent') || Object.hasOwn(receipt,'parents')) throw new Error('generic parent flattening is forbidden.');
  if (Object.hasOwn(receipt,'winner')) throw new Error('winner laundering is forbidden.');

  if (stable(receipt.generation_two_branch_universe_ids) !== stable(GENERATION_TWO_SIBLING_IDS)) {
    throw new Error('R2 must retain the complete ordered generation-two sibling universe.');
  }
  if (!Array.isArray(receipt.retained_generation_two_branch_receipts) || receipt.retained_generation_two_branch_receipts.length !== GENERATION_TWO_SIBLING_IDS.length) {
    throw new Error('R2 must retain exactly three generation-two branch receipts.');
  }
  if (stable(receipt.retained_generation_two_branch_receipts) !== stable(generation_two_branches)) {
    throw new Error('R2 generation-two retained receipts were deleted, substituted, reordered, or rewritten.');
  }

  const g2Context=generationTwoContext({
    prospective,
    prior_reconciliation,
    generation_one_branches,
    counterfactual_branch
  });
  receipt.retained_generation_two_branch_receipts.forEach(branch=>
    validateGenerationTwoProspectiveBranch(branch,g2Context)
  );

  if (receipt.selected_generation_two_branch_id !== R2_SELECTED_GENERATION_TWO_BRANCH_ID) {
    throw new Error('R2 selected branch switched away from preregistered G2_ALPHA.');
  }
  const selected=generation_two_branches.find(branch=>branch.branch_id===R2_SELECTED_GENERATION_TWO_BRANCH_ID);
  if (receipt.selected_generation_two_branch_status !== 'COUNTERFACTUAL_ONLY' ||
      receipt.selected_generation_two_branch_historical !== false ||
      receipt.historical_realization_claim !== false) {
    throw new Error('R2 selection may not be laundered into historical realization.');
  }
  if (stable(receipt.selected_generation_two_branch_snapshot) !== stable(selected)) {
    throw new Error('R2 selected generation-two branch snapshot was rewritten.');
  }
  if (!receipt.retained_generation_two_branch_receipts.every(branch=>
    branch.branch_status==='COUNTERFACTUAL_ONLY' && branch.historical_realization_claim===false
  )) {
    throw new Error('every retained generation-two sibling must remain COUNTERFACTUAL_ONLY and non-historical.');
  }

  const provenance=expectedProvenanceRoles({prospective,prior_reconciliation,counterfactual_branch});
  if (stable(receipt.provenance_roles) !== stable(provenance)) {
    throw new Error('R2 typed provenance roles, order, or referents were rewritten.');
  }
  if (receipt.provenance_roles.length !== 4 || new Set(receipt.provenance_roles.map(role=>role.provenance_role)).size !== 4) {
    throw new Error('R2 requires exactly four distinct typed provenance roles.');
  }
  if (stable(receipt.provenance_roles.map(role=>role.provenance_role)) !== stable(R2_PROVENANCE_ROLES)) {
    throw new Error('R2 provenance role sequence mismatch.');
  }

  if (receipt.prospective_context_id !== prospective.prospective_event_id ||
      stable(receipt.prospective_context_snapshot) !== stable(prospective)) {
    throw new Error('R2 prospective context P was replaced or rewritten.');
  }
  if (receipt.prospective_context_snapshot.selected_branch_historical !== false ||
      receipt.prospective_context_snapshot.historical_realization_claim !== false ||
      receipt.prospective_context_snapshot.selected_branch_status !== 'COUNTERFACTUAL_ONLY') {
    throw new Error('R2 retained P contains historical-realization laundering.');
  }

  if (receipt.prior_reconciliation_context_id !== prior_reconciliation.reconciliation_id ||
      stable(receipt.prior_reconciliation_context_snapshot) !== stable(prior_reconciliation)) {
    throw new Error('R2 prior reconciliation R1 was replaced or rewritten.');
  }

  if (receipt.inherited_counterfactual_state_branch_id !== counterfactual_branch.branch_id ||
      receipt.inherited_counterfactual_state_status !== 'COUNTERFACTUAL_ONLY' ||
      stable(receipt.inherited_counterfactual_state_snapshot) !== stable(counterfactual_branch.current_state_signature)) {
    throw new Error('R2 inherited counterfactual state provenance A switched, widened, or was rewritten.');
  }

  if (stable(receipt.shared_prefix_snapshot) !== stable(prospective.shared_prefix_snapshot) ||
      stable(receipt.shared_prefix_event_ids) !== stable(prospective.shared_prefix_event_ids)) {
    throw new Error('R2 rewrote shared historical/custody prefix H.');
  }
  if (stable(receipt.retained_generation_one_branch_ids) !== stable(prospective.declared_branch_universe_ids) ||
      stable(receipt.retained_generation_one_branch_receipts) !== stable(prospective.retained_branch_receipts) ||
      receipt.retained_generation_one_branch_receipts.length !== generation_one_branches.length) {
    throw new Error('R2 deleted, collapsed, reordered, or rewrote generation-one branch universe.');
  }
  if (!receipt.retained_generation_one_branch_receipts.every(branch=>branch.branch_status==='COUNTERFACTUAL_ONLY')) {
    throw new Error('R2 may not historically promote a retained generation-one branch.');
  }

  const requiredFalse={
    historical_custody_mutated:receipt.historical_custody_mutated,
    prior_reconciliation_mutated:receipt.prior_reconciliation_mutated,
    prospective_context_mutated:receipt.prospective_context_mutated,
    generation_one_branch_deleted:receipt.generation_one_branch_deleted,
    generation_two_branch_deleted:receipt.generation_two_branch_deleted,
    sibling_merge_performed:receipt.sibling_merge_performed,
    majority_vote_used:receipt.majority_vote_used,
    autonomous_selection:receipt.autonomous_selection,
    historical_promotion_authorized:receipt.historical_promotion_authorized,
    prospective_execution_authority:receipt.prospective_execution_authority,
    automatic_execution:receipt.automatic_execution,
    production_mutated:receipt.production_mutated,
    installed_aperture_mutated:receipt.installed_aperture_mutated,
    pedagogue_law_promoted:receipt.pedagogue_law_promoted,
    sequence_authority:receipt.sequence_authority,
    promotion_authority:receipt.promotion_authority
  };
  for (const [key,value] of Object.entries(requiredFalse)) {
    if (value !== false) throw new Error(`${key} must remain false in R2 fixture.`);
  }
  if (receipt.combined_confidence_scalar !== null) throw new Error('R2 may not collapse provenance into one confidence scalar.');
  if (receipt.next_stage !== null) throw new Error('R2 may not name a next stage.');
  if (!Array.isArray(receipt.stage_unlocks) || receipt.stage_unlocks.length !== 0) throw new Error('R2 may not unlock stages.');
  if (receipt.human_closure_required !== true) throw new Error('R2 must preserve human closure.');
  return true;
}

function hostileRejected(receipt,context,mutate) {
  const hostile=clone(receipt);
  mutate(hostile);
  try {
    validateCrossGenerationReconciliation(hostile,context);
    return false;
  } catch {
    return true;
  }
}

export function buildCrossGenerationReconciliationFixture() {
  const F=buildCounterfactualBranchFixture();
  const generationOne=[F.A,F.B,F.C,F.D];
  const priorReconciliation=authorExplicitReconciliationEvent({
    reconciliation_id:'R1_CROSS_GEN_SELECT_A',
    branches:generationOne,
    disposition:'SELECT_ONE_FOR_PROSPECTIVE_CONTINUATION',
    selected_branch_id:F.A.branch_id
  });
  const prospective=authorPostReconciliationDualLineageEvent({
    prospective_event_id:'P_CROSS_GEN_FROM_A',
    reconciliation:priorReconciliation,
    branches:generationOne,
    counterfactual_branch:F.A
  });
  const g2Context={
    prospective,
    reconciliation:priorReconciliation,
    generation_one_branches:generationOne,
    counterfactual_branch:F.A,
    generation_two_sibling_ids:GENERATION_TWO_SIBLING_IDS
  };
  const generationTwo=GENERATION_TWO_SIBLING_IDS.map(branch_id=>
    authorGenerationTwoProspectiveBranch({branch_id,...g2Context})
  );
  return freeze({F,generationOne,priorReconciliation,prospective,generationTwo});
}

export function runCrossGenerationReconciliationGauntlet() {
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
  const reconciliation=authorCrossGenerationReconciliation({
    generation_two_branches:generationTwo,
    prospective,
    prior_reconciliation:priorReconciliation,
    generation_one_branches:generationOne,
    counterfactual_branch:F.A
  });
  const sourceAfter=stable({generationOne,priorReconciliation,prospective,generationTwo});
  const sourceInputsPreserved=sourceBefore===sourceAfter;

  const hostileRejections=freeze({
    incomplete_g2_universe:hostileRejected(reconciliation,context,r=>{r.generation_two_branch_universe_ids.pop();}),
    g2_receipt_substitution:hostileRejected(reconciliation,context,r=>{r.retained_generation_two_branch_receipts[1]=clone(r.retained_generation_two_branch_receipts[0]);}),
    selected_branch_switch:hostileRejected(reconciliation,context,r=>{r.selected_generation_two_branch_id='G2_BETA';}),
    selected_g2_historical_laundering:hostileRejected(reconciliation,context,r=>{r.selected_generation_two_branch_historical=true;}),
    unselected_g2_historical_laundering:hostileRejected(reconciliation,context,r=>{r.retained_generation_two_branch_receipts[1].branch_status='HISTORICAL_REALIZED';}),
    g2_delete_flag:hostileRejected(reconciliation,context,r=>{r.generation_two_branch_deleted=true;}),
    sibling_merge:hostileRejected(reconciliation,context,r=>{r.sibling_merge_performed=true;}),
    generation_one_deletion:hostileRejected(reconciliation,context,r=>{r.retained_generation_one_branch_receipts.pop();}),
    p_snapshot_rewrite:hostileRejected(reconciliation,context,r=>{r.prospective_context_snapshot.prospective_event_id='P_REWRITTEN';}),
    r1_replacement:hostileRejected(reconciliation,context,r=>{r.prior_reconciliation_context_id=R2_RECONCILIATION_ID;}),
    a_provenance_switch:hostileRejected(reconciliation,context,r=>{r.inherited_counterfactual_state_branch_id=F.B.branch_id;r.provenance_roles[3].referent_id=F.B.branch_id;}),
    shared_prefix_rewrite:hostileRejected(reconciliation,context,r=>{r.shared_prefix_event_ids[0]='H_REWRITTEN';}),
    backdating:hostileRejected(reconciliation,context,r=>{r.authorship_order='BEFORE_GENERATION_TWO_BRANCHING';}),
    generation_laundering:hostileRejected(reconciliation,context,r=>{r.generation_reconciled=3;}),
    provenance_role_swap:hostileRejected(reconciliation,context,r=>{const x=r.provenance_roles[1];r.provenance_roles[1]=r.provenance_roles[2];r.provenance_roles[2]=x;}),
    generic_parent_flattening:hostileRejected(reconciliation,context,r=>{r.parents=[prospective.prospective_event_id,priorReconciliation.reconciliation_id,F.A.branch_id];}),
    winner_laundering:hostileRejected(reconciliation,context,r=>{r.winner='G2_ALPHA';}),
    majority_vote_laundering:hostileRejected(reconciliation,context,r=>{r.majority_vote_used=true;}),
    confidence_scalar_collapse:hostileRejected(reconciliation,context,r=>{r.combined_confidence_scalar=0.91;}),
    autonomous_selection:hostileRejected(reconciliation,context,r=>{r.autonomous_selection=true;}),
    execution_authority:hostileRejected(reconciliation,context,r=>{r.prospective_execution_authority=true;}),
    historical_custody_mutation:hostileRejected(reconciliation,context,r=>{r.historical_custody_mutated=true;}),
    recursive_realization_laundering:hostileRejected(reconciliation,context,r=>{r.historical_realization_claim=true;}),
    automatic_execution:hostileRejected(reconciliation,context,r=>{r.automatic_execution=true;}),
    sequence_authority:hostileRejected(reconciliation,context,r=>{r.sequence_authority=true;}),
    next_stage:hostileRejected(reconciliation,context,r=>{r.next_stage='A16';}),
    stage_unlock:hostileRejected(reconciliation,context,r=>{r.stage_unlocks=['A16'];}),
    promotion_authority:hostileRejected(reconciliation,context,r=>{r.promotion_authority=true;})
  });

  if (!sourceInputsPreserved) throw new Error('R2 authoring mutated source provenance objects.');
  if (!Object.values(hostileRejections).every(Boolean)) throw new Error('R2 hostile control escaped rejection.');

  return freeze({
    ok:true,
    schema:CROSS_GENERATION_RECONCILIATION_SCHEMA,
    source_status:'SIMULATED',
    authority_class:'A2_DERIVATIONAL',
    manifestly_fictional:true,
    reconciliation_id:reconciliation.reconciliation_id,
    generation_reconciled:reconciliation.generation_reconciled,
    reconciled_generation_two_branch_count:reconciliation.retained_generation_two_branch_receipts.length,
    retained_generation_one_branch_count:reconciliation.retained_generation_one_branch_receipts.length,
    selected_generation_two_branch_id:reconciliation.selected_generation_two_branch_id,
    selected_generation_two_branch_status:reconciliation.selected_generation_two_branch_status,
    selected_generation_two_branch_historical:reconciliation.selected_generation_two_branch_historical,
    provenance_roles:freeze(clone(R2_PROVENANCE_ROLES)),
    complete_generation_two_universe:stable(reconciliation.generation_two_branch_universe_ids)===stable(GENERATION_TWO_SIBLING_IDS),
    all_generation_two_counterfactual_only:reconciliation.retained_generation_two_branch_receipts.every(branch=>branch.branch_status==='COUNTERFACTUAL_ONLY'),
    all_generation_one_retained:stable(reconciliation.retained_generation_one_branch_ids)===stable(prospective.declared_branch_universe_ids),
    all_hostiles_rejected:true,
    hostile_rejections:hostileRejections,
    source_inputs_preserved:sourceInputsPreserved,
    historical_collapse:false,
    gauntlet_status:'CROSS_GENERATION_RECONCILIATION_WITNESSED_IN_BOUNDED_SYNTHETIC_FIXTURE',
    bounded_refinement_candidate:'In this finite synthetic fixture, a later authored reconciliation can operate over a complete second-generation counterfactual sibling set, preserve typed provenance through P/R1/A/H and both branch generations, and select one branch solely for prospective continuation without recursively laundering selection into historical realization.',
    next_learning_action:'TEST_POST_R2_PROSPECTIVE_CONTINUATION_WITH_TYPED_REFERENCE_TO_R2_AND_SELECTED_G2_STATE_WHILE_RETAINING_BOTH_GENERATION_UNIVERSES_WITHOUT_RECURSIVE_HISTORICAL_COLLAPSE',
    claims:freeze({
      historical_adjudication:false,
      causal_identification:false,
      causal_dag_theorem:false,
      structural_causal_model_theorem:false,
      branching_time_theorem:false,
      possible_worlds_theorem:false,
      event_sourcing_theorem:false,
      database_durability_theorem:false,
      prediction:false,
      active_learning:false,
      reinforcement_learning:false,
      planning:false,
      autonomous_reconciliation:false,
      optimal_experimental_design:false,
      physical_tomography:false,
      connection:false,
      curvature:false,
      berry_structure:false,
      holonomy:false,
      td613_general_aia_theorem:false,
      proto_loom:false,
      production_authority:false,
      vercel_authority:false
    }),
    historical_custody_mutated:false,
    installed_aperture_mutated:false,
    pedagogue_law_promoted:false,
    automatic_execution:false,
    production_mutated:false,
    sequence_authority:false,
    next_stage:null,
    stage_unlocks:freeze([]),
    promotion_authority:false,
    human_closure_required:true
  });
}
