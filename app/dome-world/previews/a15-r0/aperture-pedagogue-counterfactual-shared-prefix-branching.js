import {
  replayDecisionCustodyHistory,
  initializeReplayLedger,
  appendDecisionObservation,
  appendCustodyReceiptSet
} from './aperture-pedagogue-decision-transition-append-only-custody-replay.js';
import {
  buildProvenanceFixtures
} from './aperture-pedagogue-noisy-orientation-provenance-independence.js';

export const COUNTERFACTUAL_SHARED_PREFIX_BRANCHING_SCHEMA =
  'td613.a15-r0.aperture-pedagogue-counterfactual-shared-prefix-branching/v0.1';

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

function stateSignature(state) {
  if (!state || typeof state !== 'object') throw new TypeError('state must be an object.');
  return freeze({
    decision:freeze({
      status:state.decision.status,
      selected_action:state.decision.selected_action,
      interval:state.decision.interval,
      support_eligible:state.decision.support_eligible,
      declared_bound_holds:state.decision.declared_bound_holds
    }),
    custody:freeze({
      status:state.custody.status,
      resolved_route:state.custody.resolved_route,
      unique_root_count:state.custody.unique_root_count,
      independent_support_count:state.custody.independent_support_count,
      raw_record_count:state.custody.raw_record_count
    }),
    composition:freeze({
      joint_state_id:state.composition.joint_state_id,
      decision_authority_from_custody:state.composition.decision_authority_from_custody,
      custody_authority_from_decision:state.composition.custody_authority_from_decision,
      combined_confidence_scalar:state.composition.combined_confidence_scalar,
      majority_vote_used:state.composition.majority_vote_used,
      automatic_escalation:state.composition.automatic_escalation,
      automatic_execution:state.composition.automatic_execution,
      human_closure_required:state.composition.human_closure_required
    })
  });
}

function validatePrefixLedger(prefixLedger) {
  if (!prefixLedger || !Array.isArray(prefixLedger.history) || prefixLedger.history.length === 0) {
    throw new TypeError('prefixLedger must contain non-empty history.');
  }
  const replay = replayDecisionCustodyHistory(prefixLedger.history);
  if (stable(replay.current_state) !== stable(prefixLedger.current_state)) {
    throw new Error('shared prefix stored state does not match replay.');
  }
  return replay;
}

export function buildSharedCounterfactualPrefix() {
  const P = buildProvenanceFixtures();
  return initializeReplayLedger({
    event_id:'CF_SHARED_E0',
    decision_input:{y_hat:0,bound:0.0002},
    custody_classification:P.P2
  });
}

export function forkCounterfactualBranch({
  branch_id,
  prefix_ledger,
  suffix_kind,
  suffix_event_id,
  decision_input=null,
  custody_classification=null
}) {
  if (typeof branch_id !== 'string' || !branch_id.length) throw new TypeError('branch_id must be a non-empty string.');
  if (typeof suffix_event_id !== 'string' || !suffix_event_id.length) throw new TypeError('suffix_event_id must be a non-empty string.');
  validatePrefixLedger(prefix_ledger);

  const prefixSnapshot = freeze(clone(prefix_ledger.history));
  const prefixLength = prefixSnapshot.length;
  let branched;

  if (suffix_kind === 'DECISION_OBSERVATION') {
    if (!decision_input || typeof decision_input !== 'object') throw new TypeError('DECISION_OBSERVATION requires decision_input.');
    branched = appendDecisionObservation(prefix_ledger,{
      event_id:suffix_event_id,
      decision_input
    });
  } else if (suffix_kind === 'CUSTODY_RECEIPT_SET') {
    if (!custody_classification || typeof custody_classification !== 'object') throw new TypeError('CUSTODY_RECEIPT_SET requires custody_classification.');
    branched = appendCustodyReceiptSet(prefix_ledger,{
      event_id:suffix_event_id,
      custody_classification
    });
  } else {
    throw new RangeError('suffix_kind must be preregistered.');
  }

  if (stable(branched.history.slice(0,prefixLength)) !== stable(prefixSnapshot)) {
    throw new Error('counterfactual branch mutated the shared prefix.');
  }
  const firstSuffix = branched.history[prefixLength];
  if (!firstSuffix || firstSuffix.sequence !== prefixLength) throw new Error('counterfactual suffix sequence does not begin at fork boundary.');
  if (firstSuffix.previous_event_id !== prefixSnapshot.at(-1).event_id) throw new Error('counterfactual suffix predecessor does not bind to shared prefix head.');

  return freeze({
    branch_id,
    branch_status:'COUNTERFACTUAL_ONLY',
    source_status:'SIMULATED',
    authority_class:'A2_DERIVATIONAL',
    shared_prefix_length:prefixLength,
    shared_prefix_snapshot:prefixSnapshot,
    shared_prefix_event_ids:freeze(prefixSnapshot.map(event=>event.event_id)),
    suffix_events:freeze(clone(branched.history.slice(prefixLength))),
    history:freeze(clone(branched.history)),
    current_state:branched.current_state,
    current_state_signature:stateSignature(branched.current_state),
    replay_trace:branched.trace,
    historical_custody_mutated:false,
    historical_promotion_authorized:false,
    promotion_authority:false,
    automatic_execution:false,
    human_closure_required:true
  });
}

function branchPrefixValid(branch,canonicalPrefix) {
  if (!branch || typeof branch !== 'object') return false;
  if (!Array.isArray(branch.shared_prefix_snapshot) || !Array.isArray(branch.history)) return false;
  if (branch.shared_prefix_length !== canonicalPrefix.length) return false;
  if (stable(branch.shared_prefix_snapshot) !== stable(canonicalPrefix)) return false;
  if (stable(branch.history.slice(0,canonicalPrefix.length)) !== stable(canonicalPrefix)) return false;
  if (stable(branch.shared_prefix_event_ids) !== stable(canonicalPrefix.map(event=>event.event_id))) return false;
  return true;
}

export function compareCounterfactualBranches(branches) {
  if (!Array.isArray(branches) || branches.length < 2) throw new TypeError('branches must contain at least two branch objects.');
  const canonicalPrefix = branches[0]?.shared_prefix_snapshot;
  if (!Array.isArray(canonicalPrefix) || canonicalPrefix.length === 0) throw new TypeError('first branch must carry a non-empty shared prefix snapshot.');
  const sharedPrefixIdentical = branches.every(branch=>branchPrefixValid(branch,canonicalPrefix));

  const branchIds=branches.map(branch=>branch.branch_id);
  const uniqueIds=new Set(branchIds);
  if (uniqueIds.size !== branchIds.length) throw new Error('branch_id values must be unique within a comparison.');

  let headSignatures=[];
  let headStatesEqual=false;
  let decisionHeadsEqual=false;
  let custodyHeadsEqual=false;
  if (sharedPrefixIdentical) {
    headSignatures=branches.map(branch=>stateSignature(branch.current_state));
    headStatesEqual=headSignatures.every(signature=>stable(signature)===stable(headSignatures[0]));
    decisionHeadsEqual=headSignatures.every(signature=>stable(signature.decision)===stable(headSignatures[0].decision));
    custodyHeadsEqual=headSignatures.every(signature=>stable(signature.custody)===stable(headSignatures[0].custody));
  }

  const relationStatus = !sharedPrefixIdentical
    ? 'INVALID_SHARED_PREFIX'
    : headStatesEqual
      ? 'EQUIVALENT_COUNTERFACTUAL_HEADS'
      : 'DIVERGENT_COUNTERFACTUAL_HEADS';

  return freeze({
    shared_prefix_identical:sharedPrefixIdentical,
    shared_prefix_length:canonicalPrefix.length,
    branch_ids:freeze(branchIds),
    head_states:freeze(headSignatures),
    head_states_equal:headStatesEqual,
    decision_heads_equal:decisionHeadsEqual,
    custody_heads_equal:custodyHeadsEqual,
    divergence_event_index:sharedPrefixIdentical ? canonicalPrefix.length : null,
    relation_status:relationStatus,
    winner:null,
    merge_authorized:false,
    merge_status:headStatesEqual && sharedPrefixIdentical
      ? 'EQUIVALENT_HEADS_DO_NOT_CONSTITUTE_AUTHORIZED_MERGE'
      : 'EXPLICIT_RECONCILIATION_RULE_REQUIRED',
    historical_promotion_authorized:false,
    majority_vote_used:false,
    combined_confidence_scalar:null,
    human_closure_required:true
  });
}

export function buildCounterfactualBranchFixture() {
  const P=buildProvenanceFixtures();
  const prefix=buildSharedCounterfactualPrefix();
  const A=forkCounterfactualBranch({
    branch_id:'A_POSITIVE',
    prefix_ledger:prefix,
    suffix_kind:'DECISION_OBSERVATION',
    suffix_event_id:'CF_A_E1',
    decision_input:{y_hat:0.001,bound:0.0002,actual_eta:0}
  });
  const B=forkCounterfactualBranch({
    branch_id:'B_NEGATIVE',
    prefix_ledger:prefix,
    suffix_kind:'DECISION_OBSERVATION',
    suffix_event_id:'CF_B_E1',
    decision_input:{y_hat:-0.001,bound:0.0002,actual_eta:0}
  });
  const C=forkCounterfactualBranch({
    branch_id:'C_CUSTODY_CONFLICT',
    prefix_ledger:prefix,
    suffix_kind:'CUSTODY_RECEIPT_SET',
    suffix_event_id:'CF_C_E1',
    custody_classification:P.P3
  });
  const D=forkCounterfactualBranch({
    branch_id:'D_BOUND_FALSIFIED',
    prefix_ledger:prefix,
    suffix_kind:'DECISION_OBSERVATION',
    suffix_event_id:'CF_D_E1',
    decision_input:{y_hat:-0.0001,bound:0.00005,actual_eta:-0.0009}
  });
  const A1=forkCounterfactualBranch({
    branch_id:'A_COPY_1',
    prefix_ledger:prefix,
    suffix_kind:'DECISION_OBSERVATION',
    suffix_event_id:'CF_A_COPY_E1',
    decision_input:{y_hat:0.001,bound:0.0002,actual_eta:0}
  });
  const A2=forkCounterfactualBranch({
    branch_id:'A_COPY_2',
    prefix_ledger:prefix,
    suffix_kind:'DECISION_OBSERVATION',
    suffix_event_id:'CF_A_COPY_E1',
    decision_input:{y_hat:0.001,bound:0.0002,actual_eta:0}
  });
  const B1=forkCounterfactualBranch({
    branch_id:'B_COPY_CONTROL',
    prefix_ledger:prefix,
    suffix_kind:'DECISION_OBSERVATION',
    suffix_event_id:'CF_B_COPY_E1',
    decision_input:{y_hat:-0.001,bound:0.0002,actual_eta:0}
  });
  return freeze({prefix,A,B,C,D,A1,A2,B1});
}

function replayBranchMatches(branch) {
  const replay = replayDecisionCustodyHistory(branch.history);
  return stable(stateSignature(replay.current_state)) === stable(branch.current_state_signature);
}

export function runCounterfactualSharedPrefixBranchingGauntlet() {
  const F=buildCounterfactualBranchFixture();
  const AB=compareCounterfactualBranches([F.A,F.B]);
  const AC=compareCounterfactualBranches([F.A,F.C]);
  const duplicateMajority=compareCounterfactualBranches([F.A1,F.A2,F.B1]);
  const allBranches=[F.A,F.B,F.C,F.D];

  const passed=
    replayDecisionCustodyHistory(F.prefix.history).replay_consistent === true &&
    allBranches.every(branch=>stable(branch.shared_prefix_snapshot)===stable(F.prefix.history)) &&
    allBranches.every(replayBranchMatches) &&
    F.A.current_state.decision.status === 'DECISION_ACTIONABLE_PLUS' &&
    F.A.current_state.decision.selected_action === 'Q_PLUS_REPAIR' &&
    F.A.current_state.custody.status === 'CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT' &&
    F.B.current_state.decision.status === 'DECISION_ACTIONABLE_MINUS' &&
    F.B.current_state.decision.selected_action === 'Q_MINUS_REPAIR' &&
    F.B.current_state.custody.status === 'CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT' &&
    F.C.current_state.decision.status === 'DECISION_ABSTAIN_ORIENTATION_UNRESOLVED' &&
    F.C.current_state.custody.status === 'CUSTODY_PROVENANCE_CONFLICT_HOLD' &&
    F.D.current_state.decision.status === 'DECISION_EVIDENCE_INELIGIBLE_BOUND_FALSIFIED' &&
    F.D.current_state.custody.status === 'CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT' &&
    AB.shared_prefix_identical === true &&
    AB.relation_status === 'DIVERGENT_COUNTERFACTUAL_HEADS' &&
    AB.winner === null &&
    AB.merge_authorized === false &&
    AC.shared_prefix_identical === true &&
    AC.relation_status === 'DIVERGENT_COUNTERFACTUAL_HEADS' &&
    duplicateMajority.relation_status === 'DIVERGENT_COUNTERFACTUAL_HEADS' &&
    duplicateMajority.winner === null &&
    duplicateMajority.majority_vote_used === false &&
    duplicateMajority.merge_authorized === false &&
    allBranches.every(branch=>branch.branch_status==='COUNTERFACTUAL_ONLY') &&
    allBranches.every(branch=>branch.historical_custody_mutated===false) &&
    allBranches.every(branch=>branch.promotion_authority===false) &&
    allBranches.every(branch=>branch.automatic_execution===false) &&
    allBranches.every(branch=>branch.current_state.composition.combined_confidence_scalar===null);

  if (!passed) throw new Error('Counterfactual shared-prefix branching gauntlet violated an authored expectation.');

  return freeze({
    schema:COUNTERFACTUAL_SHARED_PREFIX_BRANCHING_SCHEMA,
    source_status:'SIMULATED',
    authority_class:'A2_DERIVATIONAL',
    manifestly_fictional:true,
    shared_prefix:freeze(clone(F.prefix.history)),
    shared_prefix_length:F.prefix.history.length,
    branch_heads:freeze({
      A:F.A.current_state_signature,
      B:F.B.current_state_signature,
      C:F.C.current_state_signature,
      D:F.D.current_state_signature
    }),
    comparisons:freeze({AB,AC,duplicate_majority:duplicateMajority}),
    all_primary_branches_replay_consistent:allBranches.every(replayBranchMatches),
    all_primary_branches_preserve_shared_prefix:allBranches.every(branch=>stable(branch.shared_prefix_snapshot)===stable(F.prefix.history)),
    gauntlet_status:'SHARED_CUSTODIED_PREFIX_WITH_DIVERGENT_COUNTERFACTUAL_SUFFIXES_WITNESSED_IN_BOUNDED_SYNTHETIC_FIXTURE',
    bounded_refinement_candidate:'in this finite synthetic fixture, multiple replayable counterfactual suffixes can diverge from one exactly shared retained evidence prefix while preserving the common past, branch identity, and non-promotion boundary; alternative futures need not retroactively rewrite or resolve their shared custody history',
    anti_equivalences:freeze([
      'counterfactual branch != historical custody',
      'shared past != shared future',
      'branch comparison != reconciliation',
      'branch count != independent support',
      'head equality != provenance equality',
      'head divergence != historical contradiction',
      'counterfactual replay != causal inference'
    ]),
    next_learning_action:'TEST_EXPLICIT_RECONCILIATION_AS_A_NEW_AUTHORED_EVENT_THAT_REFERENCES_MULTIPLE_COUNTERFACTUAL_BRANCH_RECEIPTS_WITHOUT_REWRITING_THE_SHARED_PREFIX_OR_PRETENDING_BRANCH_SELECTION_WAS_HISTORICAL_FACT',
    claims:freeze({
      causal_counterfactual_theorem:false,
      structural_causal_model_theorem:false,
      potential_outcomes_theorem:false,
      branching_time_logic_theorem:false,
      possible_worlds_semantics_theorem:false,
      multiverse:false,
      git_version_control_theorem:false,
      event_sourcing_theorem:false,
      database_branching_theorem:false,
      database_durability_theorem:false,
      cryptographic_append_only_log_theorem:false,
      blockchain:false,
      tamper_proof_storage:false,
      bayesian_model_selection:false,
      prediction:false,
      active_learning:false,
      reinforcement_learning:false,
      optimal_experimental_design:false,
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
    installed_aperture_mutated:false,
    pedagogue_law_promoted:false,
    historical_custody_mutated:false,
    automatic_execution:false,
    production_mutated:false,
    promotion_authority:false,
    human_closure_required:true
  });
}
