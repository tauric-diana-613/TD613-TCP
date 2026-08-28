import {
  composeDecisionCustodyState
} from './aperture-pedagogue-joint-decision-custody-hold-composition.js';
import {
  buildProvenanceFixtures,
  classifyProvenanceIndependence
} from './aperture-pedagogue-noisy-orientation-provenance-independence.js';

export const DECISION_TRANSITION_APPEND_ONLY_CUSTODY_REPLAY_SCHEMA =
  'td613.a15-r0.aperture-pedagogue-decision-transition-append-only-custody-replay/v0.1';

const SOURCE_STATUS = 'SIMULATED';
const AUTHORITY_CLASS = 'A2_DERIVATIONAL';
const ALLOWED_KINDS = Object.freeze([
  'INITIAL_JOINT_STATE',
  'DECISION_OBSERVATION',
  'CUSTODY_RECEIPT_SET'
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

function equal(left,right) {
  return stable(left) === stable(right);
}

function validateEventShell(event,index,seenIds) {
  if (!event || typeof event !== 'object') throw new TypeError('event must be an object.');
  if (typeof event.event_id !== 'string' || !event.event_id.length) throw new TypeError('event_id must be a non-empty string.');
  if (seenIds.has(event.event_id)) throw new Error('duplicate event_id is forbidden.');
  seenIds.add(event.event_id);
  if (event.sequence !== index) throw new Error('event sequence must be contiguous and ordered.');
  const expectedPrevious = index === 0 ? null : undefined;
  if (index === 0) {
    if (event.previous_event_id !== expectedPrevious) throw new Error('initial previous_event_id must be null.');
  }
  if (!ALLOWED_KINDS.includes(event.kind)) throw new RangeError('unknown event kind.');
  if (event.source_status !== SOURCE_STATUS) throw new Error('event source_status must remain SIMULATED.');
  if (event.authority_class !== AUTHORITY_CLASS) throw new Error('event authority_class must remain A2_DERIVATIONAL.');
  if (!event.payload || typeof event.payload !== 'object') throw new TypeError('event payload must be an object.');
  if (!event.state_after || typeof event.state_after !== 'object') throw new TypeError('event state_after must be an object.');
}

function composeFromInputs(decisionInput,custodyClassification,eventId) {
  return composeDecisionCustodyState({
    case_id:eventId,
    decision_input:decisionInput,
    custody_classification:custodyClassification
  });
}

function eventTrace(event,state) {
  return freeze({
    event_id:event.event_id,
    sequence:event.sequence,
    kind:event.kind,
    decision_status_after:state.decision.status,
    custody_status_after:state.custody.status,
    selected_action_after:state.decision.selected_action,
    resolved_route_after:state.custody.resolved_route
  });
}

export function replayDecisionCustodyHistory(history) {
  if (!Array.isArray(history) || history.length === 0) throw new TypeError('history must be a non-empty array.');
  const seenIds = new Set();
  let decisionInput = null;
  let custodyClassification = null;
  let currentState = null;
  const trace=[];

  for (let index=0; index<history.length; index += 1) {
    const event = history[index];
    validateEventShell(event,index,seenIds);
    if (index > 0 && event.previous_event_id !== history[index-1].event_id) {
      throw new Error('previous_event_id must reference the immediately preceding event.');
    }

    if (event.kind === 'INITIAL_JOINT_STATE') {
      if (index !== 0) throw new Error('INITIAL_JOINT_STATE may appear only at sequence zero.');
      decisionInput = clone(event.payload.decision_input);
      custodyClassification = clone(event.payload.custody_classification);
    } else if (event.kind === 'DECISION_OBSERVATION') {
      if (!decisionInput || !custodyClassification) throw new Error('decision event requires initialized replay state.');
      if (!event.payload.decision_input || typeof event.payload.decision_input !== 'object') throw new TypeError('decision event requires decision_input.');
      decisionInput = clone(event.payload.decision_input);
    } else if (event.kind === 'CUSTODY_RECEIPT_SET') {
      if (!decisionInput || !custodyClassification) throw new Error('custody event requires initialized replay state.');
      if (!event.payload.custody_classification || typeof event.payload.custody_classification !== 'object') throw new TypeError('custody event requires custody_classification.');
      custodyClassification = clone(event.payload.custody_classification);
    }

    const recomputed = composeFromInputs(decisionInput,custodyClassification,event.event_id);
    if (!equal(recomputed,event.state_after)) {
      throw new Error('event payload/state_after replay mismatch.');
    }
    currentState = recomputed;
    trace.push(eventTrace(event,currentState));
  }

  return freeze({
    current_state:currentState,
    trace:freeze(trace),
    history_length:history.length,
    replay_consistent:true,
    decision_input:freeze(clone(decisionInput)),
    custody_classification:freeze(clone(custodyClassification))
  });
}

function makeEvent({eventId,sequence,previousEventId,kind,payload,stateAfter}) {
  return freeze({
    event_id:eventId,
    sequence,
    previous_event_id:previousEventId,
    kind,
    payload:freeze(clone(payload)),
    state_after:stateAfter,
    source_status:SOURCE_STATUS,
    authority_class:AUTHORITY_CLASS
  });
}

export function initializeReplayLedger({event_id,decision_input,custody_classification}) {
  if (typeof event_id !== 'string' || !event_id.length) throw new TypeError('event_id must be a non-empty string.');
  const stateAfter = composeFromInputs(decision_input,custody_classification,event_id);
  const event = makeEvent({
    eventId:event_id,
    sequence:0,
    previousEventId:null,
    kind:'INITIAL_JOINT_STATE',
    payload:{decision_input,custody_classification},
    stateAfter
  });
  const history=freeze([event]);
  const replay=replayDecisionCustodyHistory(history);
  return freeze({history,current_state:replay.current_state,trace:replay.trace});
}

function appendEvent(ledger,{eventId,kind,payload}) {
  if (!ledger || !Array.isArray(ledger.history) || ledger.history.length === 0) throw new TypeError('ledger must contain history.');
  if (typeof eventId !== 'string' || !eventId.length) throw new TypeError('eventId must be a non-empty string.');
  if (ledger.history.some(event => event.event_id === eventId)) throw new Error('duplicate event_id is forbidden.');
  const priorHistorySnapshot=stable(ledger.history);
  const priorReplay=replayDecisionCustodyHistory(ledger.history);
  let decisionInput=priorReplay.decision_input;
  let custodyClassification=priorReplay.custody_classification;

  if (kind === 'DECISION_OBSERVATION') {
    if (!payload?.decision_input || typeof payload.decision_input !== 'object') throw new TypeError('decision append requires decision_input.');
    decisionInput=clone(payload.decision_input);
  } else if (kind === 'CUSTODY_RECEIPT_SET') {
    if (!payload?.custody_classification || typeof payload.custody_classification !== 'object') throw new TypeError('custody append requires custody_classification.');
    custodyClassification=clone(payload.custody_classification);
  } else {
    throw new RangeError('append kind must be DECISION_OBSERVATION or CUSTODY_RECEIPT_SET.');
  }

  const stateAfter=composeFromInputs(decisionInput,custodyClassification,eventId);
  const event=makeEvent({
    eventId,
    sequence:ledger.history.length,
    previousEventId:ledger.history.at(-1).event_id,
    kind,
    payload,
    stateAfter
  });
  const history=freeze([...ledger.history,event]);
  if (stable(history.slice(0,-1)) !== priorHistorySnapshot) throw new Error('append mutated prior replay history.');
  const replay=replayDecisionCustodyHistory(history);
  return freeze({history,current_state:replay.current_state,trace:replay.trace});
}

export function appendDecisionObservation(ledger,{event_id,decision_input}) {
  return appendEvent(ledger,{
    eventId:event_id,
    kind:'DECISION_OBSERVATION',
    payload:{decision_input}
  });
}

export function appendCustodyReceiptSet(ledger,{event_id,custody_classification}) {
  return appendEvent(ledger,{
    eventId:event_id,
    kind:'CUSTODY_RECEIPT_SET',
    payload:{custody_classification}
  });
}

function stateTuple(ledger) {
  return freeze({
    decision:ledger.current_state.decision.status,
    custody:ledger.current_state.custody.status,
    selected_action:ledger.current_state.decision.selected_action,
    resolved_route:ledger.current_state.custody.resolved_route
  });
}

function buildExpandedConflict() {
  return classifyProvenanceIndependence([
    {witness_id:'T3_A1',source_root_id:'T3_RA',route_value:'Q_A',derivation_kind:'PRIMARY'},
    {witness_id:'T3_A2',source_root_id:'T3_RA',route_value:'Q_A',derivation_kind:'COPY_OF_ROOT'},
    {witness_id:'T3_A3',source_root_id:'T3_RA',route_value:'Q_A',derivation_kind:'COPY_OF_ROOT'},
    {witness_id:'T3_B1',source_root_id:'T3_RB',route_value:'Q_B',derivation_kind:'INDEPENDENT_SYNTHETIC_ROOT'}
  ]);
}

function prefixReplayMatches(ledger) {
  for (let length=1; length<=ledger.history.length; length += 1) {
    const prefix=ledger.history.slice(0,length);
    const replay=replayDecisionCustodyHistory(prefix);
    if (!equal(replay.current_state,prefix.at(-1).state_after)) return false;
  }
  return true;
}

function historyPrefixPreserved(before,after) {
  return after.history.length === before.history.length + 1 &&
    stable(after.history.slice(0,before.history.length)) === stable(before.history);
}

export function buildReplayScenarios() {
  const P=buildProvenanceFixtures();

  const T1_0=initializeReplayLedger({event_id:'T1_E0',decision_input:{y_hat:0,bound:0.0002},custody_classification:P.P3});
  const T1_1=appendDecisionObservation(T1_0,{event_id:'T1_E1',decision_input:{y_hat:0.001,bound:0.0002,actual_eta:0}});

  const T2_0=initializeReplayLedger({event_id:'T2_E0',decision_input:{y_hat:0,bound:0.0002},custody_classification:P.P2});
  const T2_1=appendDecisionObservation(T2_0,{event_id:'T2_E1',decision_input:{y_hat:-0.001,bound:0.0002,actual_eta:0}});

  const T3_0=initializeReplayLedger({event_id:'T3_E0',decision_input:{y_hat:0.001,bound:0.0002,actual_eta:0},custody_classification:P.P3});
  const T3_1=appendCustodyReceiptSet(T3_0,{event_id:'T3_E1',custody_classification:buildExpandedConflict()});

  const T4_0=initializeReplayLedger({event_id:'T4_E0',decision_input:{y_hat:-0.001,bound:0.0002,actual_eta:0},custody_classification:P.P1});
  const T4_1=appendCustodyReceiptSet(T4_0,{event_id:'T4_E1',custody_classification:P.P2});

  const T5_0=initializeReplayLedger({event_id:'T5_E0',decision_input:{y_hat:0,bound:0.0002},custody_classification:P.P2});
  const T5_1=appendDecisionObservation(T5_0,{event_id:'T5_E1',decision_input:{y_hat:0.001,bound:0.0002,actual_eta:0}});
  const T5_2=appendDecisionObservation(T5_1,{event_id:'T5_E2',decision_input:{y_hat:0,bound:0.0002,actual_eta:0}});

  const T6_0=initializeReplayLedger({event_id:'T6_E0',decision_input:{y_hat:0.001,bound:0.0002,actual_eta:0},custody_classification:P.P2});
  const T6_1=appendCustodyReceiptSet(T6_0,{event_id:'T6_E1',custody_classification:P.P3});

  return freeze({
    T1:freeze({initial:T1_0,final:T1_1}),
    T2:freeze({initial:T2_0,final:T2_1}),
    T3:freeze({initial:T3_0,final:T3_1}),
    T4:freeze({initial:T4_0,final:T4_1}),
    T5:freeze({initial:T5_0,middle:T5_1,final:T5_2}),
    T6:freeze({initial:T6_0,final:T6_1})
  });
}

export function runDecisionTransitionAppendOnlyCustodyReplayGauntlet() {
  const S=buildReplayScenarios();
  const t1=freeze({initial:stateTuple(S.T1.initial),final:stateTuple(S.T1.final)});
  const t2=freeze({initial:stateTuple(S.T2.initial),final:stateTuple(S.T2.final)});
  const t3=freeze({initial:stateTuple(S.T3.initial),final:stateTuple(S.T3.final)});
  const t4=freeze({initial:stateTuple(S.T4.initial),final:stateTuple(S.T4.final)});
  const t5=freeze({initial:stateTuple(S.T5.initial),middle:stateTuple(S.T5.middle),final:stateTuple(S.T5.final)});
  const t6=freeze({initial:stateTuple(S.T6.initial),final:stateTuple(S.T6.final)});
  const finals=[S.T1.final,S.T2.final,S.T3.final,S.T4.final,S.T5.final,S.T6.final];

  const prefixPreservation=freeze({
    T1:historyPrefixPreserved(S.T1.initial,S.T1.final),
    T2:historyPrefixPreserved(S.T2.initial,S.T2.final),
    T3:historyPrefixPreserved(S.T3.initial,S.T3.final),
    T4:historyPrefixPreserved(S.T4.initial,S.T4.final),
    T5_first:historyPrefixPreserved(S.T5.initial,S.T5.middle),
    T5_second:historyPrefixPreserved(S.T5.middle,S.T5.final),
    T6:historyPrefixPreserved(S.T6.initial,S.T6.final)
  });

  const prefixReplay=freeze({
    T1:prefixReplayMatches(S.T1.final),
    T2:prefixReplayMatches(S.T2.final),
    T3:prefixReplayMatches(S.T3.final),
    T4:prefixReplayMatches(S.T4.final),
    T5:prefixReplayMatches(S.T5.final),
    T6:prefixReplayMatches(S.T6.final)
  });

  const passed=
    t1.initial.decision === 'DECISION_ABSTAIN_ORIENTATION_UNRESOLVED' &&
    t1.initial.custody === 'CUSTODY_PROVENANCE_CONFLICT_HOLD' &&
    t1.final.decision === 'DECISION_ACTIONABLE_PLUS' &&
    t1.final.custody === 'CUSTODY_PROVENANCE_CONFLICT_HOLD' &&
    t2.final.decision === 'DECISION_ACTIONABLE_MINUS' &&
    t2.final.custody === 'CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT' &&
    t3.initial.decision === t3.final.decision &&
    t3.final.custody === 'CUSTODY_PROVENANCE_CONFLICT_HOLD' &&
    S.T3.final.current_state.custody.raw_record_count === 4 &&
    t4.initial.decision === t4.final.decision &&
    t4.initial.custody === 'CUSTODY_SINGLE_ROOT_SUPPORTED_NOT_CORROBORATED' &&
    t4.final.custody === 'CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT' &&
    t5.initial.decision === 'DECISION_ABSTAIN_ORIENTATION_UNRESOLVED' &&
    t5.middle.decision === 'DECISION_ACTIONABLE_PLUS' &&
    t5.final.decision === 'DECISION_ABSTAIN_ORIENTATION_UNRESOLVED' &&
    t5.initial.custody === t5.middle.custody &&
    t5.middle.custody === t5.final.custody &&
    t6.initial.decision === t6.final.decision &&
    t6.initial.custody === 'CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT' &&
    t6.final.custody === 'CUSTODY_PROVENANCE_CONFLICT_HOLD' &&
    Object.values(prefixPreservation).every(Boolean) &&
    Object.values(prefixReplay).every(Boolean) &&
    finals.every(ledger => ledger.current_state.composition.combined_confidence_scalar === null) &&
    finals.every(ledger => ledger.current_state.composition.automatic_execution === false) &&
    finals.every(ledger => ledger.current_state.composition.automatic_escalation === false) &&
    finals.every(ledger => ledger.current_state.composition.human_closure_required === true);

  if (!passed) throw new Error('Decision transition / append-only custody replay gauntlet violated an authored expectation.');

  return freeze({
    schema:DECISION_TRANSITION_APPEND_ONLY_CUSTODY_REPLAY_SCHEMA,
    source_status:SOURCE_STATUS,
    authority_class:AUTHORITY_CLASS,
    manifestly_fictional:true,
    authored_scenario_count:6,
    transitions:freeze({T1:t1,T2:t2,T3:t3,T4:t4,T5:t5,T6:t6}),
    prefix_preservation:prefixPreservation,
    prefix_replay_consistency:prefixReplay,
    replay_traces:freeze({
      T1:S.T1.final.trace,
      T2:S.T2.final.trace,
      T3:S.T3.final.trace,
      T4:S.T4.final.trace,
      T5:S.T5.final.trace,
      T6:S.T6.final.trace
    }),
    gauntlet_status:'NONMONOTONIC_CURRENT_STATE_WITH_APPEND_ONLY_EPISTEMIC_REPLAY_WITNESSED_IN_BOUNDED_SYNTHETIC_FIXTURE',
    bounded_refinement_candidate:'in this finite synthetic event-sourced fixture, current decision and custody postures may change non-monotonically while their authored replay history remains append-only; preserving earlier states and evidence conditions does not require freezing the current epistemic state',
    next_learning_action:'TEST_COUNTERFACTUAL_REPLAY_BRANCHING_FROM_THE_SAME_CUSTODIED_PREFIX_WITH_ALTERNATIVE_NEW_OBSERVATIONS_WHILE_PRESERVING_SHARED_HISTORY_AND_FORBIDDING_RETROACTIVE_EDITING',
    claims:freeze({
      event_sourcing_theorem:false,
      database_durability_theorem:false,
      cryptographic_append_only_log_theorem:false,
      blockchain:false,
      tamper_proof_storage:false,
      bayesian_filtering_theorem:false,
      kalman_filtering_theorem:false,
      markov_state_theorem:false,
      pomdp_theorem:false,
      sufficient_statistic_theorem:false,
      consensus_theorem:false,
      real_world_provenance_independence:false,
      causal_intervention_theorem:false,
      active_learning:false,
      reinforcement_learning:false,
      optimal_experimental_design:false,
      autonomous_escalation:false,
      autonomous_execution:false,
      physical_sensor_feedback:false,
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
    production_mutated:false,
    promotion_authority:false,
    human_closure_required:true
  });
}
