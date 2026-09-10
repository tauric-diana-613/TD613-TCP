import {
  buildCounterfactualBranchFixture,
  compareCounterfactualBranches
} from './aperture-pedagogue-counterfactual-shared-prefix-branching.js';

export const EXPLICIT_RECONCILIATION_EVENT_SCHEMA =
  'td613.a15-r0.aperture-pedagogue-explicit-reconciliation-event/v0.1';

export const EXPLICIT_RECONCILIATION_DISPOSITIONS = Object.freeze([
  'SELECT_ONE_FOR_PROSPECTIVE_CONTINUATION',
  'HOLD_BRANCH_SET_UNRESOLVED'
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

function snapshotBranchReceipt(branch) {
  return freeze({
    branch_id:branch.branch_id,
    branch_status:branch.branch_status,
    source_status:branch.source_status,
    shared_prefix_event_ids:freeze(clone(branch.shared_prefix_event_ids)),
    suffix_event_ids:freeze(branch.suffix_events.map(event=>event.event_id)),
    current_state_signature:freeze(clone(branch.current_state_signature)),
    historical_custody_mutated:branch.historical_custody_mutated,
    promotion_authority:branch.promotion_authority,
    automatic_execution:branch.automatic_execution,
    human_closure_required:branch.human_closure_required
  });
}

function validateBranchUniverse(branches) {
  if (!Array.isArray(branches) || branches.length < 2) {
    throw new TypeError('reconciliation requires at least two counterfactual branch receipts.');
  }
  const ids=branches.map(branch=>branch?.branch_id);
  if (ids.some(id=>typeof id !== 'string' || id.length === 0)) {
    throw new TypeError('every reconciliation branch must expose a non-empty branch_id.');
  }
  if (new Set(ids).size !== ids.length) {
    throw new Error('reconciliation branch universe contains duplicate branch_id values.');
  }
  for (const branch of branches) {
    if (branch.branch_status !== 'COUNTERFACTUAL_ONLY') {
      throw new Error('reconciliation may reference only COUNTERFACTUAL_ONLY branches.');
    }
    if (branch.source_status !== 'SIMULATED') {
      throw new Error('reconciliation fixture may reference only SIMULATED branch receipts.');
    }
    if (branch.historical_custody_mutated !== false) {
      throw new Error('reconciliation branch already claims historical custody mutation.');
    }
    if (branch.promotion_authority !== false || branch.automatic_execution !== false) {
      throw new Error('reconciliation branch carries prohibited execution or promotion authority.');
    }
    if (branch.human_closure_required !== true) {
      throw new Error('reconciliation branch must preserve human closure.');
    }
  }
  const comparison=compareCounterfactualBranches(branches);
  if (comparison.shared_prefix_identical !== true || comparison.relation_status === 'INVALID_SHARED_PREFIX') {
    throw new Error('reconciliation requires one exactly shared retained prefix.');
  }
  return freeze({ids:freeze([...ids]),comparison});
}

export function authorExplicitReconciliationEvent({
  reconciliation_id,
  branches,
  disposition,
  selected_branch_id=null
}) {
  if (typeof reconciliation_id !== 'string' || reconciliation_id.length === 0) {
    throw new TypeError('reconciliation_id must be a non-empty string.');
  }
  if (!EXPLICIT_RECONCILIATION_DISPOSITIONS.includes(disposition)) {
    throw new RangeError('reconciliation disposition must be preregistered.');
  }

  const {ids,comparison}=validateBranchUniverse(branches);
  let selectedBranch=null;
  let selectionBasis=null;
  let prospectiveSelectionRecorded=false;

  if (disposition === 'SELECT_ONE_FOR_PROSPECTIVE_CONTINUATION') {
    if (typeof selected_branch_id !== 'string' || selected_branch_id.length === 0) {
      throw new Error('explicit selected_branch_id is required; branch count may not infer reconciliation selection.');
    }
    selectedBranch=branches.find(branch=>branch.branch_id===selected_branch_id) || null;
    if (!selectedBranch) throw new Error('selected_branch_id must name one branch in the declared reconciliation universe.');
    selectionBasis='EXPLICIT_AUTHORED_GESTURE';
    prospectiveSelectionRecorded=true;
  } else if (selected_branch_id !== null) {
    throw new Error('HOLD_BRANCH_SET_UNRESOLVED requires selected_branch_id = null.');
  }

  const sharedPrefix=clone(branches[0].shared_prefix_snapshot);
  const receipt=freeze({
    schema:EXPLICIT_RECONCILIATION_EVENT_SCHEMA,
    reconciliation_id,
    event_status:'AUTHORED_RECONCILIATION_EVENT',
    source_status:'SIMULATED',
    authority_class:'A2_DERIVATIONAL',
    manifestly_fictional:true,
    reconciliation_scope:'COUNTERFACTUAL_BRANCH_SET',
    authorship_order:'AFTER_REFERENCED_BRANCH_RECEIPTS',
    shared_prefix_snapshot:freeze(sharedPrefix),
    shared_prefix_event_ids:freeze(sharedPrefix.map(event=>event.event_id)),
    declared_branch_universe_ids:freeze([...ids]),
    branch_receipts:freeze(branches.map(snapshotBranchReceipt)),
    branch_comparison:freeze(clone(comparison)),
    disposition,
    selected_branch_id:selectedBranch?.branch_id ?? null,
    selected_branch_head:selectedBranch ? freeze(clone(selectedBranch.current_state_signature)) : null,
    selection_basis:selectionBasis,
    prospective_selection_recorded:prospectiveSelectionRecorded,
    selected_branch_historical:false,
    historical_realization_claim:false,
    historical_custody_mutated:false,
    reconciliation_event_historical_custody_entry:false,
    counterfactual_branch_statuses_preserved:true,
    branch_merge_performed:false,
    branch_deletion_performed:false,
    majority_vote_used:false,
    combined_confidence_scalar:null,
    historical_promotion_authorized:false,
    prospective_execution_authority:false,
    automatic_execution:false,
    production_mutated:false,
    installed_aperture_mutated:false,
    pedagogue_law_promoted:false,
    promotion_authority:false,
    human_closure_required:true
  });

  validateExplicitReconciliationEvent(receipt,branches);
  return receipt;
}

export function validateExplicitReconciliationEvent(receipt,branches) {
  if (!receipt || typeof receipt !== 'object') throw new TypeError('reconciliation receipt must be an object.');
  const {ids,comparison}=validateBranchUniverse(branches);
  const expectedBranchReceipts=branches.map(snapshotBranchReceipt);
  const expectedPrefix=branches[0].shared_prefix_snapshot;
  const expectedPrefixIds=expectedPrefix.map(event=>event.event_id);

  if (receipt.schema !== EXPLICIT_RECONCILIATION_EVENT_SCHEMA) throw new Error('reconciliation schema mismatch.');
  if (receipt.event_status !== 'AUTHORED_RECONCILIATION_EVENT') throw new Error('reconciliation event status mismatch.');
  if (receipt.source_status !== 'SIMULATED' || receipt.manifestly_fictional !== true) throw new Error('reconciliation source status widened beyond synthetic fixture.');
  if (receipt.reconciliation_scope !== 'COUNTERFACTUAL_BRANCH_SET') throw new Error('reconciliation scope mismatch.');
  if (receipt.authorship_order !== 'AFTER_REFERENCED_BRANCH_RECEIPTS') throw new Error('reconciliation may not be backdated before referenced branch receipts.');
  if (stable(receipt.shared_prefix_snapshot) !== stable(expectedPrefix)) throw new Error('reconciliation shared prefix was rewritten.');
  if (stable(receipt.shared_prefix_event_ids) !== stable(expectedPrefixIds)) throw new Error('reconciliation shared prefix identity mismatch.');
  if (stable(receipt.declared_branch_universe_ids) !== stable(ids)) throw new Error('reconciliation branch universe omitted, added, reordered, or replaced a branch.');
  if (stable(receipt.branch_receipts) !== stable(expectedBranchReceipts)) throw new Error('reconciliation branch receipt snapshots do not match the supplied counterfactual universe.');
  if (stable(receipt.branch_comparison) !== stable(comparison)) throw new Error('reconciliation branch comparison was rewritten.');

  if (receipt.disposition === 'SELECT_ONE_FOR_PROSPECTIVE_CONTINUATION') {
    const selected=branches.find(branch=>branch.branch_id===receipt.selected_branch_id) || null;
    if (!selected) throw new Error('reconciliation selection must name one supplied branch.');
    if (receipt.selection_basis !== 'EXPLICIT_AUTHORED_GESTURE') throw new Error('reconciliation selection may not be inferred.');
    if (receipt.prospective_selection_recorded !== true) throw new Error('selected reconciliation must record prospective selection.');
    if (stable(receipt.selected_branch_head) !== stable(selected.current_state_signature)) throw new Error('selected branch head snapshot mismatch.');
  } else if (receipt.disposition === 'HOLD_BRANCH_SET_UNRESOLVED') {
    if (receipt.selected_branch_id !== null || receipt.selected_branch_head !== null || receipt.selection_basis !== null) {
      throw new Error('unresolved reconciliation hold may not carry a selected branch.');
    }
    if (receipt.prospective_selection_recorded !== false) throw new Error('unresolved reconciliation hold may not claim selection.');
  } else {
    throw new Error('reconciliation disposition is not preregistered.');
  }

  for (const branchReceipt of receipt.branch_receipts) {
    if (branchReceipt.branch_status !== 'COUNTERFACTUAL_ONLY') throw new Error('reconciliation may not relabel a branch as historical.');
    if (branchReceipt.historical_custody_mutated !== false) throw new Error('reconciliation may not launder branch custody mutation.');
    if (branchReceipt.promotion_authority !== false || branchReceipt.automatic_execution !== false) throw new Error('reconciliation branch snapshot widened authority.');
  }

  const requiredFalse={
    selected_branch_historical:receipt.selected_branch_historical,
    historical_realization_claim:receipt.historical_realization_claim,
    historical_custody_mutated:receipt.historical_custody_mutated,
    reconciliation_event_historical_custody_entry:receipt.reconciliation_event_historical_custody_entry,
    branch_merge_performed:receipt.branch_merge_performed,
    branch_deletion_performed:receipt.branch_deletion_performed,
    majority_vote_used:receipt.majority_vote_used,
    historical_promotion_authorized:receipt.historical_promotion_authorized,
    prospective_execution_authority:receipt.prospective_execution_authority,
    automatic_execution:receipt.automatic_execution,
    production_mutated:receipt.production_mutated,
    installed_aperture_mutated:receipt.installed_aperture_mutated,
    pedagogue_law_promoted:receipt.pedagogue_law_promoted,
    promotion_authority:receipt.promotion_authority
  };
  for (const [key,value] of Object.entries(requiredFalse)) {
    if (value !== false) throw new Error(`${key} must remain false in reconciliation fixture.`);
  }
  if (receipt.counterfactual_branch_statuses_preserved !== true) throw new Error('reconciliation must preserve counterfactual branch statuses.');
  if (receipt.combined_confidence_scalar !== null) throw new Error('reconciliation may not collapse branch relations into one confidence scalar.');
  if (receipt.human_closure_required !== true) throw new Error('reconciliation must preserve human closure.');
  return true;
}

function hostileRejected(receipt,branches,mutate) {
  const hostile=clone(receipt);
  mutate(hostile);
  try {
    validateExplicitReconciliationEvent(hostile,branches);
    return false;
  } catch {
    return true;
  }
}

export function runExplicitReconciliationEventGauntlet() {
  const F=buildCounterfactualBranchFixture();
  const primary=[F.A,F.B,F.C,F.D];
  const before=stable(primary);
  const selected=authorExplicitReconciliationEvent({
    reconciliation_id:'R_SELECT_A',
    branches:primary,
    disposition:'SELECT_ONE_FOR_PROSPECTIVE_CONTINUATION',
    selected_branch_id:F.A.branch_id
  });
  const hold=authorExplicitReconciliationEvent({
    reconciliation_id:'R_HOLD_ALL',
    branches:primary,
    disposition:'HOLD_BRANCH_SET_UNRESOLVED'
  });
  const duplicateFamily=[F.A1,F.A2,F.B1];
  const duplicateHold=authorExplicitReconciliationEvent({
    reconciliation_id:'R_DUPLICATE_HOLD',
    branches:duplicateFamily,
    disposition:'HOLD_BRANCH_SET_UNRESOLVED'
  });

  let duplicateMajoritySelectionRejected=false;
  try {
    authorExplicitReconciliationEvent({
      reconciliation_id:'R_DUPLICATE_INFERRED_SELECTION',
      branches:duplicateFamily,
      disposition:'SELECT_ONE_FOR_PROSPECTIVE_CONTINUATION'
    });
  } catch {
    duplicateMajoritySelectionRejected=true;
  }

  const hostileRejections=freeze({
    selected_branch_historical:hostileRejected(selected,primary,r=>{r.selected_branch_historical=true;}),
    historical_realization_claim:hostileRejected(selected,primary,r=>{r.historical_realization_claim=true;}),
    branch_status_laundering:hostileRejected(selected,primary,r=>{r.branch_receipts[0].branch_status='HISTORICAL_REALIZED';}),
    shared_prefix_rewrite:hostileRejected(selected,primary,r=>{r.shared_prefix_snapshot[0].payload.decision_input.y_hat=0.5;}),
    branch_deletion:hostileRejected(selected,primary,r=>{r.branch_receipts.pop();}),
    backdating:hostileRejected(selected,primary,r=>{r.authorship_order='BEFORE_REFERENCED_BRANCH_RECEIPTS';}),
    majority_vote_laundering:hostileRejected(selected,primary,r=>{r.majority_vote_used=true;}),
    merge_laundering:hostileRejected(selected,primary,r=>{r.branch_merge_performed=true;})
  });

  const mutatedBranch=clone(F.A);
  mutatedBranch.shared_prefix_snapshot[0].payload.decision_input.y_hat=0.5;
  mutatedBranch.history[0].payload.decision_input.y_hat=0.5;
  let mutatedBranchPrefixRejected=false;
  try {
    authorExplicitReconciliationEvent({
      reconciliation_id:'R_BAD_PREFIX',
      branches:[mutatedBranch,F.B,F.C,F.D],
      disposition:'HOLD_BRANCH_SET_UNRESOLVED'
    });
  } catch {
    mutatedBranchPrefixRejected=true;
  }

  const allHostilesRejected=Object.values(hostileRejections).every(Boolean) && mutatedBranchPrefixRejected;
  const passed=
    validateExplicitReconciliationEvent(selected,primary) === true &&
    validateExplicitReconciliationEvent(hold,primary) === true &&
    validateExplicitReconciliationEvent(duplicateHold,duplicateFamily) === true &&
    before === stable(primary) &&
    selected.declared_branch_universe_ids.length === 4 &&
    selected.branch_receipts.length === 4 &&
    selected.selected_branch_id === F.A.branch_id &&
    selected.selection_basis === 'EXPLICIT_AUTHORED_GESTURE' &&
    selected.prospective_selection_recorded === true &&
    selected.selected_branch_historical === false &&
    selected.historical_realization_claim === false &&
    selected.branch_deletion_performed === false &&
    selected.branch_merge_performed === false &&
    selected.majority_vote_used === false &&
    selected.prospective_execution_authority === false &&
    hold.selected_branch_id === null &&
    hold.prospective_selection_recorded === false &&
    duplicateHold.declared_branch_universe_ids.length === 3 &&
    duplicateHold.selected_branch_id === null &&
    duplicateMajoritySelectionRejected === true &&
    allHostilesRejected === true;

  if (!passed) throw new Error('Explicit reconciliation event gauntlet violated an authored expectation.');

  return freeze({
    schema:EXPLICIT_RECONCILIATION_EVENT_SCHEMA,
    source_status:'SIMULATED',
    authority_class:'A2_DERIVATIONAL',
    manifestly_fictional:true,
    selected_reconciliation:selected,
    unresolved_reconciliation:hold,
    duplicate_majority_hold:duplicateHold,
    duplicate_majority_inferred_selection_rejected:duplicateMajoritySelectionRejected,
    hostile_rejections:hostileRejections,
    mutated_branch_prefix_rejected:mutatedBranchPrefixRejected,
    all_hostiles_rejected:allHostilesRejected,
    primary_branch_universe_preserved:before===stable(primary),
    gauntlet_status:'EXPLICIT_RECONCILIATION_AS_NEW_AUTHORED_EVENT_WITNESSED_WITHOUT_HISTORICAL_REALIZATION_IN_BOUNDED_SYNTHETIC_FIXTURE',
    bounded_refinement_candidate:'in this finite synthetic fixture, reconciliation can be represented as a later authored event over a complete counterfactual branch set, including an explicit prospective branch preference, while preserving shared history and every branch receipt and without converting the selected counterfactual into historical realization',
    anti_equivalences:freeze([
      'reconciliation != realization',
      'prospective selection != historical fact',
      'selection != deletion',
      'selection != merge',
      'reference != mutation',
      'branch receipt != custody event',
      'branch majority != evidence majority',
      'branch count != independent support',
      'later authored event != retroactive cause',
      'counterfactual continuation != historical reconstruction'
    ]),
    next_learning_action:'TEST_POST_RECONCILIATION_PROSPECTIVE_CONTINUATION_WITH_DUAL_LINEAGE_WHERE_NEW_EVENTS_DESCEND_FROM_THE_RECONCILIATION_RECORD_AND_THE_SELECTED_COUNTERFACTUAL_RECEIPT_WITHOUT_COLLAPSING_UNSELECTED_BRANCHES_OR_REWRITING_SHARED_HISTORY',
    claims:freeze({
      historical_adjudication:false,
      causal_identification:false,
      structural_causal_model_theorem:false,
      potential_outcomes_theorem:false,
      branching_time_logic_theorem:false,
      possible_worlds_theorem:false,
      consensus_theorem:false,
      voting_theorem:false,
      merge_theorem:false,
      event_sourcing_theorem:false,
      database_durability_theorem:false,
      cryptographic_append_only_guarantee:false,
      tamper_proof_storage:false,
      bayesian_model_selection:false,
      prediction:false,
      active_learning:false,
      reinforcement_learning:false,
      optimal_experimental_design:false,
      autonomous_reconciliation:false,
      physical_tomography:false,
      blind_tomography:false,
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
    promotion_authority:false,
    human_closure_required:true
  });
}
