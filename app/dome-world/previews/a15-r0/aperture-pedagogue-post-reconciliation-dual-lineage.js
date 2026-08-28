import {
  buildCounterfactualBranchFixture
} from './aperture-pedagogue-counterfactual-shared-prefix-branching.js';
import {
  authorExplicitReconciliationEvent,
  validateExplicitReconciliationEvent
} from './aperture-pedagogue-explicit-reconciliation-event.js';

export const POST_RECONCILIATION_DUAL_LINEAGE_SCHEMA =
  'td613.a15-r0.aperture-pedagogue-post-reconciliation-dual-lineage/v0.1';

export const POST_RECONCILIATION_LINEAGE_ROLES = Object.freeze([
  'RECONCILIATION_CONTEXT',
  'COUNTERFACTUAL_STATE_INPUT'
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

function requireSelectedReconciliation(reconciliation, branches) {
  validateExplicitReconciliationEvent(reconciliation, branches);
  if (reconciliation.disposition !== 'SELECT_ONE_FOR_PROSPECTIVE_CONTINUATION') {
    throw new Error('prospective continuation requires an explicitly selected reconciliation, not an unresolved hold.');
  }
  if (reconciliation.prospective_selection_recorded !== true) {
    throw new Error('prospective continuation requires a recorded prospective selection.');
  }
  if (typeof reconciliation.selected_branch_id !== 'string' || reconciliation.selected_branch_id.length === 0) {
    throw new Error('prospective continuation requires an explicit selected branch id.');
  }
  if (reconciliation.selected_branch_historical !== false || reconciliation.historical_realization_claim !== false) {
    throw new Error('prospective continuation cannot inherit historical-realization laundering.');
  }
  return branches.find(branch=>branch.branch_id===reconciliation.selected_branch_id) || null;
}

function expectedLineage(reconciliation, selectedBranch) {
  return [
    {
      lineage_role:'RECONCILIATION_CONTEXT',
      referent_id:reconciliation.reconciliation_id,
      referent_status:reconciliation.event_status
    },
    {
      lineage_role:'COUNTERFACTUAL_STATE_INPUT',
      referent_id:selectedBranch.branch_id,
      referent_status:selectedBranch.branch_status
    }
  ];
}

export function authorPostReconciliationDualLineageEvent({
  prospective_event_id,
  reconciliation,
  branches,
  counterfactual_branch
}) {
  if (typeof prospective_event_id !== 'string' || prospective_event_id.length === 0) {
    throw new TypeError('prospective_event_id must be a non-empty string.');
  }
  if (!Array.isArray(branches) || branches.length < 2) {
    throw new TypeError('prospective continuation requires the complete counterfactual branch universe.');
  }
  const selectedBranch=requireSelectedReconciliation(reconciliation,branches);
  if (!selectedBranch) throw new Error('selected reconciliation branch is missing from the supplied branch universe.');
  if (!counterfactual_branch || typeof counterfactual_branch !== 'object') {
    throw new TypeError('counterfactual_branch is required as the separately typed state-input lineage leg.');
  }
  if (counterfactual_branch.branch_id !== reconciliation.selected_branch_id) {
    throw new Error('counterfactual state input must match the explicitly selected reconciliation branch; branch switching is forbidden.');
  }
  if (counterfactual_branch.branch_status !== 'COUNTERFACTUAL_ONLY') {
    throw new Error('counterfactual state input must remain COUNTERFACTUAL_ONLY.');
  }
  if (stable(counterfactual_branch.current_state_signature) !== stable(selectedBranch.current_state_signature)) {
    throw new Error('counterfactual state input does not match the selected branch state snapshot.');
  }

  const receipt=freeze({
    schema:POST_RECONCILIATION_DUAL_LINEAGE_SCHEMA,
    prospective_event_id,
    event_status:'AUTHORED_PROSPECTIVE_CONTINUATION',
    source_status:'SIMULATED',
    authority_class:'A2_DERIVATIONAL',
    manifestly_fictional:true,
    authorship_order:'AFTER_RECONCILIATION_EVENT',
    lineage_mode:'TYPED_DUAL_LINEAGE',
    lineage:freeze(clone(expectedLineage(reconciliation,selectedBranch))),
    reconciliation_context_id:reconciliation.reconciliation_id,
    reconciliation_context_snapshot:freeze(clone(reconciliation)),
    counterfactual_state_branch_id:selectedBranch.branch_id,
    counterfactual_state_snapshot:freeze(clone(selectedBranch.current_state_signature)),
    shared_prefix_snapshot:freeze(clone(reconciliation.shared_prefix_snapshot)),
    shared_prefix_event_ids:freeze(clone(reconciliation.shared_prefix_event_ids)),
    declared_branch_universe_ids:freeze(clone(reconciliation.declared_branch_universe_ids)),
    retained_branch_receipts:freeze(clone(reconciliation.branch_receipts)),
    selected_branch_status:'COUNTERFACTUAL_ONLY',
    selected_branch_historical:false,
    historical_realization_claim:false,
    historical_custody_mutated:false,
    prospective_event_historical_custody_entry:false,
    shared_history_rewritten:false,
    unselected_branches_collapsed:false,
    branch_merge_performed:false,
    branch_deletion_performed:false,
    branch_switch_performed:false,
    majority_vote_used:false,
    combined_confidence_scalar:null,
    prospective_note:'CONTINUE_FROM_SELECTED_COUNTERFACTUAL_STATE_FOR_RESEARCH_ONLY',
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

  validatePostReconciliationDualLineageEvent(receipt,{reconciliation,branches,counterfactual_branch});
  return receipt;
}

export function validatePostReconciliationDualLineageEvent(receipt,{reconciliation,branches,counterfactual_branch}) {
  if (!receipt || typeof receipt !== 'object') throw new TypeError('prospective continuation receipt must be an object.');
  const selectedBranch=requireSelectedReconciliation(reconciliation,branches);
  if (!selectedBranch) throw new Error('selected reconciliation branch is missing from supplied branch universe.');
  if (!counterfactual_branch || counterfactual_branch.branch_id !== selectedBranch.branch_id) {
    throw new Error('validation counterfactual state input does not match selected branch.');
  }

  if (receipt.schema !== POST_RECONCILIATION_DUAL_LINEAGE_SCHEMA) throw new Error('dual-lineage schema mismatch.');
  if (receipt.event_status !== 'AUTHORED_PROSPECTIVE_CONTINUATION') throw new Error('prospective event status mismatch.');
  if (receipt.source_status !== 'SIMULATED' || receipt.manifestly_fictional !== true) throw new Error('prospective continuation widened beyond synthetic fixture.');
  if (receipt.authority_class !== 'A2_DERIVATIONAL') throw new Error('prospective continuation authority class mismatch.');
  if (receipt.authorship_order !== 'AFTER_RECONCILIATION_EVENT') throw new Error('prospective continuation may not be backdated before reconciliation.');
  if (receipt.lineage_mode !== 'TYPED_DUAL_LINEAGE') throw new Error('prospective continuation must preserve typed dual lineage.');
  if (Object.hasOwn(receipt,'parent') || Object.hasOwn(receipt,'parents')) throw new Error('generic parent collapse is forbidden; lineage roles must remain typed.');

  const lineage=expectedLineage(reconciliation,selectedBranch);
  if (stable(receipt.lineage) !== stable(lineage)) throw new Error('typed dual-lineage legs are missing, reordered, collapsed, or rewritten.');
  if (new Set(receipt.lineage.map(leg=>leg.lineage_role)).size !== 2) throw new Error('dual-lineage roles must remain distinct.');
  if (!POST_RECONCILIATION_LINEAGE_ROLES.every(role=>receipt.lineage.some(leg=>leg.lineage_role===role))) {
    throw new Error('both preregistered lineage roles are required.');
  }

  if (receipt.reconciliation_context_id !== reconciliation.reconciliation_id) throw new Error('reconciliation context id mismatch.');
  if (stable(receipt.reconciliation_context_snapshot) !== stable(reconciliation)) throw new Error('reconciliation context snapshot was rewritten.');
  if (receipt.counterfactual_state_branch_id !== selectedBranch.branch_id) throw new Error('counterfactual state branch id switched away from selected branch.');
  if (stable(receipt.counterfactual_state_snapshot) !== stable(selectedBranch.current_state_signature)) throw new Error('counterfactual state snapshot mismatch.');
  if (receipt.selected_branch_status !== 'COUNTERFACTUAL_ONLY') throw new Error('selected branch may not be relabeled as historical.');

  if (stable(receipt.shared_prefix_snapshot) !== stable(reconciliation.shared_prefix_snapshot)) throw new Error('prospective continuation rewrote shared prefix.');
  if (stable(receipt.shared_prefix_event_ids) !== stable(reconciliation.shared_prefix_event_ids)) throw new Error('prospective continuation rewrote shared prefix identity.');
  if (stable(receipt.declared_branch_universe_ids) !== stable(reconciliation.declared_branch_universe_ids)) throw new Error('prospective continuation changed declared branch universe.');
  if (stable(receipt.retained_branch_receipts) !== stable(reconciliation.branch_receipts)) throw new Error('prospective continuation deleted, collapsed, or rewrote retained branch receipts.');

  if (receipt.prospective_note !== 'CONTINUE_FROM_SELECTED_COUNTERFACTUAL_STATE_FOR_RESEARCH_ONLY') {
    throw new Error('prospective continuation note widened beyond preregistered research-only annotation.');
  }

  const requiredFalse={
    selected_branch_historical:receipt.selected_branch_historical,
    historical_realization_claim:receipt.historical_realization_claim,
    historical_custody_mutated:receipt.historical_custody_mutated,
    prospective_event_historical_custody_entry:receipt.prospective_event_historical_custody_entry,
    shared_history_rewritten:receipt.shared_history_rewritten,
    unselected_branches_collapsed:receipt.unselected_branches_collapsed,
    branch_merge_performed:receipt.branch_merge_performed,
    branch_deletion_performed:receipt.branch_deletion_performed,
    branch_switch_performed:receipt.branch_switch_performed,
    majority_vote_used:receipt.majority_vote_used,
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
    if (value !== false) throw new Error(`${key} must remain false in dual-lineage fixture.`);
  }
  if (receipt.combined_confidence_scalar !== null) throw new Error('dual lineage may not collapse into one confidence scalar.');
  if (receipt.next_stage !== null) throw new Error('dual-lineage fixture may not name a next stage.');
  if (!Array.isArray(receipt.stage_unlocks) || receipt.stage_unlocks.length !== 0) throw new Error('dual-lineage fixture may not unlock stages.');
  if (receipt.human_closure_required !== true) throw new Error('dual-lineage fixture must preserve human closure.');
  return true;
}

function hostileRejected(receipt,context,mutate) {
  const hostile=clone(receipt);
  mutate(hostile);
  try {
    validatePostReconciliationDualLineageEvent(hostile,context);
    return false;
  } catch {
    return true;
  }
}

export function runPostReconciliationDualLineageGauntlet() {
  const F=buildCounterfactualBranchFixture();
  const primary=[F.A,F.B,F.C,F.D];
  const branchesBefore=stable(primary);
  const reconciliation=authorExplicitReconciliationEvent({
    reconciliation_id:'R_DUAL_SELECT_A',
    branches:primary,
    disposition:'SELECT_ONE_FOR_PROSPECTIVE_CONTINUATION',
    selected_branch_id:F.A.branch_id
  });
  const hold=authorExplicitReconciliationEvent({
    reconciliation_id:'R_DUAL_HOLD',
    branches:primary,
    disposition:'HOLD_BRANCH_SET_UNRESOLVED'
  });
  const reconciliationBefore=stable(reconciliation);
  const context={reconciliation,branches:primary,counterfactual_branch:F.A};

  const prospective=authorPostReconciliationDualLineageEvent({
    prospective_event_id:'P_AFTER_R_DUAL_SELECT_A',
    reconciliation,
    branches:primary,
    counterfactual_branch:F.A
  });

  let unresolvedReconciliationRejected=false;
  try {
    authorPostReconciliationDualLineageEvent({
      prospective_event_id:'P_FROM_UNRESOLVED_HOLD',
      reconciliation:hold,
      branches:primary,
      counterfactual_branch:F.A
    });
  } catch {
    unresolvedReconciliationRejected=true;
  }

  let branchSwitchRejected=false;
  try {
    authorPostReconciliationDualLineageEvent({
      prospective_event_id:'P_BRANCH_SWITCH',
      reconciliation,
      branches:primary,
      counterfactual_branch:F.B
    });
  } catch {
    branchSwitchRejected=true;
  }

  const hostileRejections=freeze({
    missing_reconciliation_lineage:hostileRejected(prospective,context,r=>{r.lineage=r.lineage.filter(leg=>leg.lineage_role!=='RECONCILIATION_CONTEXT');}),
    missing_counterfactual_lineage:hostileRejected(prospective,context,r=>{r.lineage=r.lineage.filter(leg=>leg.lineage_role!=='COUNTERFACTUAL_STATE_INPUT');}),
    generic_parent_collapse:hostileRejected(prospective,context,r=>{r.parents=[r.reconciliation_context_id,r.counterfactual_state_branch_id];r.lineage=[];}),
    historical_status_laundering:hostileRejected(prospective,context,r=>{r.selected_branch_status='HISTORICAL_REALIZED';}),
    selected_branch_historical:hostileRejected(prospective,context,r=>{r.selected_branch_historical=true;}),
    historical_realization_claim:hostileRejected(prospective,context,r=>{r.historical_realization_claim=true;}),
    reconciliation_context_rewrite:hostileRejected(prospective,context,r=>{r.reconciliation_context_snapshot.selected_branch_id='B_NEGATIVE';}),
    state_snapshot_rewrite:hostileRejected(prospective,context,r=>{r.counterfactual_state_snapshot.decision.status='DECISION_ACTIONABLE_MINUS';}),
    shared_prefix_rewrite:hostileRejected(prospective,context,r=>{r.shared_prefix_snapshot[0].payload.decision_input.y_hat=0.5;}),
    branch_deletion:hostileRejected(prospective,context,r=>{r.retained_branch_receipts.pop();}),
    unselected_branch_collapse:hostileRejected(prospective,context,r=>{r.unselected_branches_collapsed=true;}),
    branch_merge_laundering:hostileRejected(prospective,context,r=>{r.branch_merge_performed=true;}),
    branch_switch_laundering:hostileRejected(prospective,context,r=>{r.branch_switch_performed=true;}),
    backdating:hostileRejected(prospective,context,r=>{r.authorship_order='BEFORE_RECONCILIATION_EVENT';}),
    majority_vote_laundering:hostileRejected(prospective,context,r=>{r.majority_vote_used=true;}),
    confidence_scalar_collapse:hostileRejected(prospective,context,r=>{r.combined_confidence_scalar=0.9;}),
    execution_authority:hostileRejected(prospective,context,r=>{r.prospective_execution_authority=true;}),
    automatic_execution:hostileRejected(prospective,context,r=>{r.automatic_execution=true;}),
    sequence_authority:hostileRejected(prospective,context,r=>{r.sequence_authority=true;}),
    next_stage:hostileRejected(prospective,context,r=>{r.next_stage='A16';}),
    stage_unlock:hostileRejected(prospective,context,r=>{r.stage_unlocks=['A16'];}),
    promotion_authority:hostileRejected(prospective,context,r=>{r.promotion_authority=true;})
  });

  const allHostilesRejected=Object.values(hostileRejections).every(Boolean);
  const inputsPreserved=branchesBefore===stable(primary) && reconciliationBefore===stable(reconciliation);
  const lineageRoles=prospective.lineage.map(leg=>leg.lineage_role);

  const passed=
    validateExplicitReconciliationEvent(reconciliation,primary) === true &&
    validatePostReconciliationDualLineageEvent(prospective,context) === true &&
    prospective.lineage.length === 2 &&
    stable(lineageRoles) === stable(POST_RECONCILIATION_LINEAGE_ROLES) &&
    prospective.reconciliation_context_id === reconciliation.reconciliation_id &&
    prospective.counterfactual_state_branch_id === F.A.branch_id &&
    stable(prospective.counterfactual_state_snapshot) === stable(F.A.current_state_signature) &&
    prospective.selected_branch_status === 'COUNTERFACTUAL_ONLY' &&
    prospective.selected_branch_historical === false &&
    prospective.historical_realization_claim === false &&
    prospective.retained_branch_receipts.length === 4 &&
    prospective.declared_branch_universe_ids.length === 4 &&
    primary.every(branch=>branch.branch_status==='COUNTERFACTUAL_ONLY') &&
    prospective.unselected_branches_collapsed === false &&
    unresolvedReconciliationRejected === true &&
    branchSwitchRejected === true &&
    allHostilesRejected === true &&
    inputsPreserved === true &&
    prospective.sequence_authority === false &&
    prospective.next_stage === null &&
    prospective.stage_unlocks.length === 0 &&
    prospective.promotion_authority === false &&
    prospective.human_closure_required === true;

  if (!passed) throw new Error('Post-reconciliation dual-lineage gauntlet violated an authored expectation.');

  return freeze({
    schema:POST_RECONCILIATION_DUAL_LINEAGE_SCHEMA,
    source_status:'SIMULATED',
    authority_class:'A2_DERIVATIONAL',
    manifestly_fictional:true,
    prospective_event:prospective,
    lineage_roles:freeze(lineageRoles),
    retained_branch_count:prospective.retained_branch_receipts.length,
    selected_branch_status:prospective.selected_branch_status,
    unresolved_reconciliation_rejected:unresolvedReconciliationRejected,
    branch_switch_rejected:branchSwitchRejected,
    hostile_rejections:hostileRejections,
    all_hostiles_rejected:allHostilesRejected,
    source_inputs_preserved:inputsPreserved,
    gauntlet_status:'POST_RECONCILIATION_TYPED_DUAL_LINEAGE_WITNESSED_WITHOUT_HISTORICAL_COLLAPSE_IN_BOUNDED_SYNTHETIC_FIXTURE',
    bounded_refinement_candidate:'in this finite synthetic fixture, a prospective continuation can preserve two distinct typed provenance roles—reconciliation context and selected counterfactual state input—without collapsing either into historical realization, without erasing unselected branches, and without rewriting the shared retained prefix',
    anti_equivalences:freeze([
      'derivation != realization',
      'reconciliation context != state input',
      'selected counterfactual != historical state',
      'prospective continuation != historical continuation',
      'dual lineage != causal parenthood',
      'lineage reference != merge ancestry',
      'state input != truth claim',
      'selection != branch deletion',
      'typed lineage != confidence scalar',
      'prospective event != execution authority'
    ]),
    next_learning_action:'TEST_MULTI_STEP_PROSPECTIVE_CONTINUATION_WHERE_A_POST_RECONCILIATION_EVENT_GENERATES_A_NEW_COUNTERFACTUAL_FORK_WHILE_PRESERVING_TYPED_LINEAGE_ACROSS_GENERATIONS_WITHOUT_HISTORICAL_COLLAPSE',
    claims:freeze({
      historical_adjudication:false,
      causal_identification:false,
      causal_dag_theorem:false,
      structural_causal_model_theorem:false,
      potential_outcomes_theorem:false,
      event_sourcing_theorem:false,
      database_ancestry_theorem:false,
      git_merge_theorem:false,
      active_learning:false,
      reinforcement_learning:false,
      autonomous_planning:false,
      optimal_experimental_design:false,
      physical_tomography:false,
      operator_tomography:false,
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
