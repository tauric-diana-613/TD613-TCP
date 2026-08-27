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

export const MULTI_GENERATION_PROSPECTIVE_BRANCHING_SCHEMA =
  'td613.a15-r0.aperture-pedagogue-multi-generation-prospective-branching/v0.1';

export const GENERATION_TWO_LINEAGE_ROLES = Object.freeze([
  'DIRECT_PROSPECTIVE_DERIVATION_SOURCE',
  'INHERITED_RECONCILIATION_CONTEXT',
  'INHERITED_COUNTERFACTUAL_STATE_PROVENANCE'
]);

export const GENERATION_TWO_SIBLING_IDS = Object.freeze([
  'G2_ALPHA',
  'G2_BETA',
  'G2_GAMMA'
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

function expectedLineage(prospective, reconciliation, counterfactualBranch) {
  return [
    {
      lineage_role:'DIRECT_PROSPECTIVE_DERIVATION_SOURCE',
      referent_id:prospective.prospective_event_id,
      referent_status:prospective.event_status
    },
    {
      lineage_role:'INHERITED_RECONCILIATION_CONTEXT',
      referent_id:reconciliation.reconciliation_id,
      referent_status:reconciliation.event_status
    },
    {
      lineage_role:'INHERITED_COUNTERFACTUAL_STATE_PROVENANCE',
      referent_id:counterfactualBranch.branch_id,
      referent_status:counterfactualBranch.branch_status
    }
  ];
}

function expectedCurrentState(prospective, variantId) {
  return {
    ...clone(prospective.counterfactual_state_snapshot),
    prospective_variant_id:variantId,
    prospective_variant_note:'RESEARCH_ONLY_COUNTERFACTUAL_VARIANT'
  };
}

function requireValidSourceContext({
  prospective,
  reconciliation,
  generation_one_branches,
  counterfactual_branch,
  generation_two_sibling_ids=GENERATION_TWO_SIBLING_IDS
}) {
  if (!prospective || typeof prospective !== 'object') throw new TypeError('prospective source P is required.');
  if (!reconciliation || typeof reconciliation !== 'object') throw new TypeError('reconciliation source R is required.');
  if (!Array.isArray(generation_one_branches) || generation_one_branches.length < 2) {
    throw new TypeError('complete generation-one branch universe is required.');
  }
  if (!counterfactual_branch || typeof counterfactual_branch !== 'object') {
    throw new TypeError('generation-one counterfactual state source A is required.');
  }
  if (!Array.isArray(generation_two_sibling_ids) || stable(generation_two_sibling_ids) !== stable(GENERATION_TWO_SIBLING_IDS)) {
    throw new Error('generation-two sibling universe must equal the preregistered complete sibling set.');
  }

  validatePostReconciliationDualLineageEvent(prospective,{
    reconciliation,
    branches:generation_one_branches,
    counterfactual_branch
  });

  if (prospective.selected_branch_status !== 'COUNTERFACTUAL_ONLY' ||
      prospective.selected_branch_historical !== false ||
      prospective.historical_realization_claim !== false) {
    throw new Error('prospective source P must remain non-historical and COUNTERFACTUAL_ONLY at its selected-state boundary.');
  }
  if (counterfactual_branch.branch_status !== 'COUNTERFACTUAL_ONLY') {
    throw new Error('inherited generation-one state provenance must remain COUNTERFACTUAL_ONLY.');
  }
  if (prospective.counterfactual_state_branch_id !== counterfactual_branch.branch_id) {
    throw new Error('P and inherited state provenance A disagree about selected counterfactual branch identity.');
  }
  if (prospective.reconciliation_context_id !== reconciliation.reconciliation_id) {
    throw new Error('P and inherited reconciliation context R disagree about reconciliation identity.');
  }
  return true;
}

export function authorGenerationTwoProspectiveBranch({
  branch_id,
  prospective,
  reconciliation,
  generation_one_branches,
  counterfactual_branch,
  generation_two_sibling_ids=GENERATION_TWO_SIBLING_IDS
}) {
  requireValidSourceContext({
    prospective,
    reconciliation,
    generation_one_branches,
    counterfactual_branch,
    generation_two_sibling_ids
  });

  if (!GENERATION_TWO_SIBLING_IDS.includes(branch_id)) {
    throw new Error('generation-two branch id must be one of the preregistered sibling ids.');
  }

  const receipt=freeze({
    schema:MULTI_GENERATION_PROSPECTIVE_BRANCHING_SCHEMA,
    branch_id,
    branch_status:'COUNTERFACTUAL_ONLY',
    source_status:'SIMULATED',
    authority_class:'A2_DERIVATIONAL',
    manifestly_fictional:true,
    generation:2,
    authorship_order:'AFTER_PROSPECTIVE_CONTINUATION',
    lineage_mode:'TYPED_CROSS_GENERATION_LINEAGE',
    lineage:freeze(clone(expectedLineage(prospective,reconciliation,counterfactual_branch))),
    direct_prospective_source_id:prospective.prospective_event_id,
    direct_prospective_source_snapshot:freeze(clone(prospective)),
    inherited_reconciliation_context_id:reconciliation.reconciliation_id,
    inherited_reconciliation_context_snapshot:freeze(clone(reconciliation)),
    inherited_counterfactual_state_branch_id:counterfactual_branch.branch_id,
    inherited_counterfactual_state_status:'COUNTERFACTUAL_ONLY',
    inherited_counterfactual_state_snapshot:freeze(clone(counterfactual_branch.current_state_signature)),
    shared_prefix_snapshot:freeze(clone(prospective.shared_prefix_snapshot)),
    shared_prefix_event_ids:freeze(clone(prospective.shared_prefix_event_ids)),
    retained_generation_one_branch_ids:freeze(clone(prospective.declared_branch_universe_ids)),
    retained_generation_one_branch_receipts:freeze(clone(prospective.retained_branch_receipts)),
    generation_two_sibling_ids:freeze(clone(generation_two_sibling_ids)),
    prospective_variant_id:branch_id,
    current_state_signature:freeze(expectedCurrentState(prospective,branch_id)),
    historical_realization_claim:false,
    historical_custody_mutated:false,
    prior_generation_mutated:false,
    shared_history_rewritten:false,
    generation_one_branch_deleted:false,
    generation_two_sibling_deleted:false,
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

  validateGenerationTwoProspectiveBranch(receipt,{
    prospective,
    reconciliation,
    generation_one_branches,
    counterfactual_branch,
    generation_two_sibling_ids
  });
  return receipt;
}

export function validateGenerationTwoProspectiveBranch(receipt,context) {
  if (!receipt || typeof receipt !== 'object') throw new TypeError('generation-two branch receipt must be an object.');
  requireValidSourceContext(context);
  const {
    prospective,
    reconciliation,
    generation_one_branches,
    counterfactual_branch,
    generation_two_sibling_ids=GENERATION_TWO_SIBLING_IDS
  }=context;

  if (receipt.schema !== MULTI_GENERATION_PROSPECTIVE_BRANCHING_SCHEMA) throw new Error('generation-two schema mismatch.');
  if (receipt.branch_status !== 'COUNTERFACTUAL_ONLY') throw new Error('generation-two branch must remain COUNTERFACTUAL_ONLY.');
  if (receipt.source_status !== 'SIMULATED' || receipt.manifestly_fictional !== true) throw new Error('generation-two branch widened beyond synthetic fixture.');
  if (receipt.authority_class !== 'A2_DERIVATIONAL') throw new Error('generation-two authority class mismatch.');
  if (receipt.generation !== 2) throw new Error('generation index must remain 2 and is not a stage index.');
  if (receipt.authorship_order !== 'AFTER_PROSPECTIVE_CONTINUATION') throw new Error('generation-two branch may not be backdated before P.');
  if (receipt.lineage_mode !== 'TYPED_CROSS_GENERATION_LINEAGE') throw new Error('generation-two branch must preserve typed cross-generation lineage.');
  if (Object.hasOwn(receipt,'parent') || Object.hasOwn(receipt,'parents')) throw new Error('generic parent flattening is forbidden.');
  if (Object.hasOwn(receipt,'winner') || Object.hasOwn(receipt,'selected_generation_two_branch_id')) throw new Error('generation-two winner/selection laundering is forbidden.');

  const lineage=expectedLineage(prospective,reconciliation,counterfactual_branch);
  if (stable(receipt.lineage) !== stable(lineage)) throw new Error('cross-generation lineage roles, order, or referents were rewritten.');
  if (receipt.lineage.length !== 3 || new Set(receipt.lineage.map(leg=>leg.lineage_role)).size !== 3) {
    throw new Error('generation-two branch requires exactly three distinct typed lineage legs.');
  }
  if (stable(receipt.lineage.map(leg=>leg.lineage_role)) !== stable(GENERATION_TWO_LINEAGE_ROLES)) {
    throw new Error('generation-two lineage role sequence mismatch.');
  }

  if (receipt.direct_prospective_source_id !== prospective.prospective_event_id) throw new Error('direct derivation source must be P.');
  if (stable(receipt.direct_prospective_source_snapshot) !== stable(prospective)) throw new Error('direct prospective source P snapshot was rewritten.');
  if (receipt.direct_prospective_source_snapshot.selected_branch_historical !== false ||
      receipt.direct_prospective_source_snapshot.historical_realization_claim !== false ||
      receipt.direct_prospective_source_snapshot.selected_branch_status !== 'COUNTERFACTUAL_ONLY') {
    throw new Error('retained P snapshot contains historical-realization laundering.');
  }

  if (receipt.inherited_reconciliation_context_id !== reconciliation.reconciliation_id) throw new Error('inherited reconciliation context must remain R.');
  if (stable(receipt.inherited_reconciliation_context_snapshot) !== stable(reconciliation)) throw new Error('inherited reconciliation context R snapshot was rewritten.');

  if (receipt.inherited_counterfactual_state_branch_id !== counterfactual_branch.branch_id) throw new Error('inherited counterfactual state provenance switched away from A.');
  if (receipt.inherited_counterfactual_state_status !== 'COUNTERFACTUAL_ONLY') throw new Error('inherited state provenance may not be relabeled historical.');
  if (stable(receipt.inherited_counterfactual_state_snapshot) !== stable(counterfactual_branch.current_state_signature)) {
    throw new Error('inherited counterfactual state A snapshot was rewritten.');
  }

  if (stable(receipt.shared_prefix_snapshot) !== stable(prospective.shared_prefix_snapshot)) throw new Error('generation-two branch rewrote shared prefix.');
  if (stable(receipt.shared_prefix_event_ids) !== stable(prospective.shared_prefix_event_ids)) throw new Error('generation-two branch rewrote shared prefix identity.');
  if (stable(receipt.retained_generation_one_branch_ids) !== stable(prospective.declared_branch_universe_ids)) {
    throw new Error('generation-two branch deleted or changed generation-one branch identities.');
  }
  if (stable(receipt.retained_generation_one_branch_receipts) !== stable(prospective.retained_branch_receipts)) {
    throw new Error('generation-two branch deleted, collapsed, or rewrote generation-one branch receipts.');
  }
  if (receipt.retained_generation_one_branch_receipts.length !== generation_one_branches.length) {
    throw new Error('generation-one retained branch cardinality mismatch.');
  }
  if (stable(receipt.generation_two_sibling_ids) !== stable(generation_two_sibling_ids)) {
    throw new Error('generation-two sibling set was deleted, reordered, or rewritten.');
  }

  if (!GENERATION_TWO_SIBLING_IDS.includes(receipt.branch_id) || receipt.prospective_variant_id !== receipt.branch_id) {
    throw new Error('generation-two branch identity and research-only variant id must match a preregistered sibling.');
  }
  if (stable(receipt.current_state_signature) !== stable(expectedCurrentState(prospective,receipt.branch_id))) {
    throw new Error('generation-two current state invented a downstream consequence or rewrote inherited state.');
  }

  const requiredFalse={
    historical_realization_claim:receipt.historical_realization_claim,
    historical_custody_mutated:receipt.historical_custody_mutated,
    prior_generation_mutated:receipt.prior_generation_mutated,
    shared_history_rewritten:receipt.shared_history_rewritten,
    generation_one_branch_deleted:receipt.generation_one_branch_deleted,
    generation_two_sibling_deleted:receipt.generation_two_sibling_deleted,
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
    if (value !== false) throw new Error(`${key} must remain false in generation-two fixture.`);
  }
  if (receipt.combined_confidence_scalar !== null) throw new Error('cross-generation lineage may not collapse into one confidence scalar.');
  if (receipt.next_stage !== null) throw new Error('generation-two fixture may not name a next stage.');
  if (!Array.isArray(receipt.stage_unlocks) || receipt.stage_unlocks.length !== 0) throw new Error('generation-two fixture may not unlock stages.');
  if (receipt.human_closure_required !== true) throw new Error('generation-two fixture must preserve human closure.');
  return true;
}

function hostileRejected(receipt,context,mutate) {
  const hostile=clone(receipt);
  mutate(hostile);
  try {
    validateGenerationTwoProspectiveBranch(hostile,context);
    return false;
  } catch {
    return true;
  }
}

export function runMultiGenerationProspectiveBranchingGauntlet() {
  const F=buildCounterfactualBranchFixture();
  const generationOne=[F.A,F.B,F.C,F.D];
  const reconciliation=authorExplicitReconciliationEvent({
    reconciliation_id:'R_MULTI_GEN_SELECT_A',
    branches:generationOne,
    disposition:'SELECT_ONE_FOR_PROSPECTIVE_CONTINUATION',
    selected_branch_id:F.A.branch_id
  });
  const prospective=authorPostReconciliationDualLineageEvent({
    prospective_event_id:'P_MULTI_GEN_FROM_A',
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
  const sourceAfter=stable({generationOne,reconciliation,prospective});
  const sourceInputsPreserved=sourceBefore===sourceAfter;

  const primary=generationTwo[0];
  const hostileRejections=freeze({
    direct_source_skip:hostileRejected(primary,context,r=>{r.direct_prospective_source_id=F.A.branch_id;r.lineage[0].referent_id=F.A.branch_id;}),
    reconciliation_switch:hostileRejected(primary,context,r=>{r.inherited_reconciliation_context_id='R_OTHER';r.lineage[1].referent_id='R_OTHER';}),
    state_branch_switch:hostileRejected(primary,context,r=>{r.inherited_counterfactual_state_branch_id=F.B.branch_id;r.lineage[2].referent_id=F.B.branch_id;}),
    lineage_role_referent_swap:hostileRejected(primary,context,r=>{const a=r.lineage[0];r.lineage[0]=r.lineage[1];r.lineage[1]=a;}),
    generic_parent_flattening:hostileRejected(primary,context,r=>{r.parents=[r.direct_prospective_source_id,r.inherited_reconciliation_context_id,r.inherited_counterfactual_state_branch_id];r.lineage=[];}),
    generation_laundering:hostileRejected(primary,context,r=>{r.generation=3;}),
    backdating:hostileRejected(primary,context,r=>{r.authorship_order='BEFORE_PROSPECTIVE_CONTINUATION';}),
    p_historical_laundering:hostileRejected(primary,context,r=>{r.direct_prospective_source_snapshot.selected_branch_historical=true;}),
    a_historical_laundering:hostileRejected(primary,context,r=>{r.inherited_counterfactual_state_status='HISTORICAL_REALIZED';}),
    p_snapshot_rewrite:hostileRejected(primary,context,r=>{r.direct_prospective_source_snapshot.prospective_note='REWRITTEN';}),
    r_snapshot_rewrite:hostileRejected(primary,context,r=>{r.inherited_reconciliation_context_snapshot.selected_branch_id='B_NEGATIVE';}),
    shared_prefix_rewrite:hostileRejected(primary,context,r=>{r.shared_prefix_snapshot[0].payload.decision_input.y_hat=0.5;}),
    generation_one_branch_deletion:hostileRejected(primary,context,r=>{r.retained_generation_one_branch_receipts.pop();}),
    generation_one_delete_flag:hostileRejected(primary,context,r=>{r.generation_one_branch_deleted=true;}),
    generation_two_sibling_deletion:hostileRejected(primary,context,r=>{r.generation_two_sibling_ids.pop();}),
    generation_two_delete_flag:hostileRejected(primary,context,r=>{r.generation_two_sibling_deleted=true;}),
    sibling_merge:hostileRejected(primary,context,r=>{r.sibling_merge_performed=true;}),
    majority_vote_winner:hostileRejected(primary,context,r=>{r.majority_vote_used=true;r.winner='G2_ALPHA';}),
    autonomous_selection:hostileRejected(primary,context,r=>{r.autonomous_selection=true;}),
    confidence_scalar:hostileRejected(primary,context,r=>{r.combined_confidence_scalar=0.9;}),
    invented_downstream_consequence:hostileRejected(primary,context,r=>{r.current_state_signature.decision={status:'DECISION_ACTIONABLE_PLUS'};}),
    execution_authority:hostileRejected(primary,context,r=>{r.prospective_execution_authority=true;}),
    automatic_execution:hostileRejected(primary,context,r=>{r.automatic_execution=true;}),
    sequence_authority:hostileRejected(primary,context,r=>{r.sequence_authority=true;}),
    next_stage:hostileRejected(primary,context,r=>{r.next_stage='A16';}),
    stage_unlock:hostileRejected(primary,context,r=>{r.stage_unlocks=['A16'];}),
    promotion_authority:hostileRejected(primary,context,r=>{r.promotion_authority=true;})
  });

  const allHostilesRejected=Object.values(hostileRejections).every(Boolean);
  const allGenerationTwoValid=generationTwo.every(branch=>validateGenerationTwoProspectiveBranch(branch,context));
  const allCounterfactualOnly=generationTwo.every(branch=>branch.branch_status==='COUNTERFACTUAL_ONLY');
  const allGenerationTwo=generationTwo.every(branch=>branch.generation===2);
  const allLineageExact=generationTwo.every(branch=>
    stable(branch.lineage.map(leg=>leg.lineage_role))===stable(GENERATION_TWO_LINEAGE_ROLES)
  );
  const allRetainGenerationOne=generationTwo.every(branch=>branch.retained_generation_one_branch_receipts.length===4);
  const allRetainSiblings=generationTwo.every(branch=>stable(branch.generation_two_sibling_ids)===stable(GENERATION_TWO_SIBLING_IDS));
  const allNonHistorical=generationTwo.every(branch=>branch.historical_realization_claim===false);
  const generationOneStillCounterfactual=generationOne.every(branch=>branch.branch_status==='COUNTERFACTUAL_ONLY');

  const passed=
    allGenerationTwoValid &&
    allCounterfactualOnly &&
    allGenerationTwo &&
    allLineageExact &&
    allRetainGenerationOne &&
    allRetainSiblings &&
    allNonHistorical &&
    generationOneStillCounterfactual &&
    prospective.selected_branch_status==='COUNTERFACTUAL_ONLY' &&
    prospective.selected_branch_historical===false &&
    prospective.historical_realization_claim===false &&
    sourceInputsPreserved &&
    allHostilesRejected;

  if (!passed) throw new Error('Multi-generation prospective branching gauntlet violated an authored expectation.');

  return freeze({
    schema:MULTI_GENERATION_PROSPECTIVE_BRANCHING_SCHEMA,
    source_status:'SIMULATED',
    authority_class:'A2_DERIVATIONAL',
    manifestly_fictional:true,
    generation:2,
    generation_two_branch_count:generationTwo.length,
    lineage_roles:freeze(clone(GENERATION_TWO_LINEAGE_ROLES)),
    direct_source_id:prospective.prospective_event_id,
    inherited_reconciliation_id:reconciliation.reconciliation_id,
    inherited_counterfactual_branch_id:F.A.branch_id,
    retained_generation_one_branch_count:primary.retained_generation_one_branch_receipts.length,
    generation_two_sibling_ids:freeze(clone(GENERATION_TWO_SIBLING_IDS)),
    all_generation_two_counterfactual_only:allCounterfactualOnly,
    all_generation_two_lineage_exact:allLineageExact,
    all_generation_one_retained:allRetainGenerationOne,
    all_generation_two_siblings_retained:allRetainSiblings,
    all_hostiles_rejected:allHostilesRejected,
    source_inputs_preserved:sourceInputsPreserved,
    historical_collapse:false,
    gauntlet_status:'MULTI_GENERATION_PROSPECTIVE_BRANCHING_WITNESSED_WITH_TYPED_LINEAGE_WITHOUT_TRANSITIVE_HISTORICAL_COLLAPSE_IN_BOUNDED_SYNTHETIC_FIXTURE',
    bounded_refinement_candidate:'in this finite synthetic fixture, one additional generation of prospective counterfactual branching can retain a typed derivation chain through P while preserving R/A/H as immutable referenced provenance and leaving generation-one and generation-two alternatives intact without transitive historical collapse',
    anti_equivalences:freeze([
      'transitive provenance != transitive realization',
      'derivation generation != historical generation',
      'direct derivation source != causal parent',
      'inherited context != inherited truth',
      'inherited state provenance != realized state',
      'counterfactual child != future prediction',
      'prospective fork != runtime fork',
      'generation index != stage index',
      'synthetic derivation != execution authority'
    ]),
    next_learning_action:'TEST_RECONCILIATION_ACROSS_GENERATIONS_WHERE_A_LATER_AUTHORED_EVENT_REFERENCES_MULTIPLE_GENERATION_TWO_COUNTERFACTUAL_BRANCHES_WHILE_PRESERVING_GENERATION_ONE_AND_SHARED_PREFIX_LINEAGE_WITHOUT_TRANSITIVE_HISTORICAL_COLLAPSE',
    claims:freeze({
      historical_adjudication:false,
      causal_identification:false,
      causal_dag_theorem:false,
      structural_causal_model_theorem:false,
      branching_time_theorem:false,
      possible_worlds_theorem:false,
      event_sourcing_theorem:false,
      database_ancestry_theorem:false,
      database_durability_theorem:false,
      git_version_control_theorem:false,
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
