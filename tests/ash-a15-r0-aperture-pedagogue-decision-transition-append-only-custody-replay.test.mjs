import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  DECISION_TRANSITION_APPEND_ONLY_CUSTODY_REPLAY_SCHEMA,
  replayDecisionCustodyHistory,
  initializeReplayLedger,
  appendDecisionObservation,
  appendCustodyReceiptSet,
  buildReplayScenarios,
  runDecisionTransitionAppendOnlyCustodyReplayGauntlet
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-decision-transition-append-only-custody-replay.js';
import {
  buildProvenanceFixtures
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-noisy-orientation-provenance-independence.js';

const P=buildProvenanceFixtures();
const initial=initializeReplayLedger({
  event_id:'HOSTILE_E0',
  decision_input:{y_hat:0,bound:0.0002},
  custody_classification:P.P3
});
const afterDecision=appendDecisionObservation(initial,{
  event_id:'HOSTILE_E1',
  decision_input:{y_hat:0.001,bound:0.0002,actual_eta:0}
});
assert.equal(initial.history.length,1);
assert.equal(afterDecision.history.length,2);
assert.deepEqual(afterDecision.history.slice(0,1),initial.history);
assert.equal(initial.current_state.decision.status,'DECISION_ABSTAIN_ORIENTATION_UNRESOLVED');
assert.equal(afterDecision.current_state.decision.status,'DECISION_ACTIONABLE_PLUS');
assert.equal(initial.current_state.custody.status,'CUSTODY_PROVENANCE_CONFLICT_HOLD');
assert.equal(afterDecision.current_state.custody.status,'CUSTODY_PROVENANCE_CONFLICT_HOLD');

const afterCustody=appendCustodyReceiptSet(afterDecision,{
  event_id:'HOSTILE_E2',
  custody_classification:P.P2
});
assert.equal(afterCustody.current_state.decision.status,'DECISION_ACTIONABLE_PLUS');
assert.equal(afterCustody.current_state.custody.status,'CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT');
assert.deepEqual(afterCustody.history.slice(0,2),afterDecision.history);

assert.throws(() => appendDecisionObservation(afterDecision,{
  event_id:'HOSTILE_E1',
  decision_input:{y_hat:-0.001,bound:0.0002,actual_eta:0}
}), /duplicate event_id/);

const scenarios=buildReplayScenarios();

const t5Trace=scenarios.T5.final.trace;
assert.deepEqual(t5Trace.map(item=>item.decision_status_after),[
  'DECISION_ABSTAIN_ORIENTATION_UNRESOLVED',
  'DECISION_ACTIONABLE_PLUS',
  'DECISION_ABSTAIN_ORIENTATION_UNRESOLVED'
]);
assert.ok(t5Trace.every(item=>item.custody_status_after==='CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT'));

const deletedMiddle=scenarios.T5.final.history.filter(event=>event.event_id!=='T5_E1');
assert.throws(() => replayDecisionCustodyHistory(deletedMiddle), /(sequence|previous_event_id)/);

const payloadMutated=JSON.parse(JSON.stringify(scenarios.T1.final.history));
payloadMutated[1].payload.decision_input.y_hat=-0.001;
assert.throws(() => replayDecisionCustodyHistory(payloadMutated), /payload\/state_after replay mismatch/);

const replacedInitial=JSON.parse(JSON.stringify(scenarios.T2.final.history));
replacedInitial[0].payload.decision_input.y_hat=0.001;
assert.throws(() => replayDecisionCustodyHistory(replacedInitial), /payload\/state_after replay mismatch/);

const wrongPrevious=JSON.parse(JSON.stringify(scenarios.T1.final.history));
wrongPrevious[1].previous_event_id='NOT_THE_PARENT';
assert.throws(() => replayDecisionCustodyHistory(wrongPrevious), /previous_event_id/);

const sequenceGap=JSON.parse(JSON.stringify(scenarios.T1.final.history));
sequenceGap[1].sequence=2;
assert.throws(() => replayDecisionCustodyHistory(sequenceGap), /sequence/);

const duplicateId=JSON.parse(JSON.stringify(scenarios.T1.final.history));
duplicateId[1].event_id=duplicateId[0].event_id;
assert.throws(() => replayDecisionCustodyHistory(duplicateId), /duplicate event_id/);

const unknownKind=JSON.parse(JSON.stringify(scenarios.T1.final.history));
unknownKind[1].kind='UNKNOWN_EVENT_KIND';
assert.throws(() => replayDecisionCustodyHistory(unknownKind), /unknown event kind/);

for (const key of ['T1','T2','T3','T4','T5','T6']) {
  const history=scenarios[key].final.history;
  const replay=replayDecisionCustodyHistory(history);
  assert.deepEqual(replay.current_state,history.at(-1).state_after);
  for (let length=1; length<=history.length; length += 1) {
    const prefix=history.slice(0,length);
    assert.deepEqual(replayDecisionCustodyHistory(prefix).current_state,prefix.at(-1).state_after);
  }
}

assert.equal(scenarios.T1.final.current_state.decision.status,'DECISION_ACTIONABLE_PLUS');
assert.equal(scenarios.T1.final.current_state.custody.status,'CUSTODY_PROVENANCE_CONFLICT_HOLD');
assert.equal(scenarios.T2.final.current_state.decision.status,'DECISION_ACTIONABLE_MINUS');
assert.equal(scenarios.T2.final.current_state.custody.status,'CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT');
assert.equal(scenarios.T3.final.current_state.decision.status,scenarios.T3.initial.current_state.decision.status);
assert.equal(scenarios.T3.final.current_state.custody.status,'CUSTODY_PROVENANCE_CONFLICT_HOLD');
assert.equal(scenarios.T3.final.current_state.custody.raw_record_count,4);
assert.equal(scenarios.T4.initial.current_state.custody.status,'CUSTODY_SINGLE_ROOT_SUPPORTED_NOT_CORROBORATED');
assert.equal(scenarios.T4.final.current_state.custody.status,'CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT');
assert.equal(scenarios.T4.initial.current_state.decision.status,scenarios.T4.final.current_state.decision.status);
assert.equal(scenarios.T5.final.history.length,3);
assert.equal(scenarios.T6.initial.current_state.custody.status,'CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT');
assert.equal(scenarios.T6.final.current_state.custody.status,'CUSTODY_PROVENANCE_CONFLICT_HOLD');
assert.equal(scenarios.T6.initial.current_state.decision.status,scenarios.T6.final.current_state.decision.status);

const receipt=runDecisionTransitionAppendOnlyCustodyReplayGauntlet();
assert.equal(receipt.schema,DECISION_TRANSITION_APPEND_ONLY_CUSTODY_REPLAY_SCHEMA);
assert.equal(receipt.source_status,'SIMULATED');
assert.equal(receipt.authority_class,'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional,true);
assert.equal(receipt.authored_scenario_count,6);
assert.ok(Object.values(receipt.prefix_preservation).every(Boolean));
assert.ok(Object.values(receipt.prefix_replay_consistency).every(Boolean));
assert.deepEqual([
  receipt.transitions.T5.initial.decision,
  receipt.transitions.T5.middle.decision,
  receipt.transitions.T5.final.decision
],[
  'DECISION_ABSTAIN_ORIENTATION_UNRESOLVED',
  'DECISION_ACTIONABLE_PLUS',
  'DECISION_ABSTAIN_ORIENTATION_UNRESOLVED'
]);
assert.deepEqual([
  receipt.transitions.T6.initial.custody,
  receipt.transitions.T6.final.custody
],[
  'CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT',
  'CUSTODY_PROVENANCE_CONFLICT_HOLD'
]);
assert.equal(receipt.gauntlet_status,'NONMONOTONIC_CURRENT_STATE_WITH_APPEND_ONLY_EPISTEMIC_REPLAY_WITNESSED_IN_BOUNDED_SYNTHETIC_FIXTURE');
assert.match(receipt.bounded_refinement_candidate,/current decision and custody postures may change non-monotonically/);
assert.match(receipt.bounded_refinement_candidate,/replay history remains append-only/);
assert.match(receipt.next_learning_action,/TEST_COUNTERFACTUAL_REPLAY_BRANCHING_FROM_THE_SAME_CUSTODIED_PREFIX/);
assert.equal(receipt.claims.event_sourcing_theorem,false);
assert.equal(receipt.claims.cryptographic_append_only_log_theorem,false);
assert.equal(receipt.claims.blockchain,false);
assert.equal(receipt.claims.tamper_proof_storage,false);
assert.equal(receipt.claims.markov_state_theorem,false);
assert.equal(receipt.claims.active_learning,false);
assert.equal(receipt.claims.holonomy,false);
assert.equal(receipt.claims.production_authority,false);
assert.equal(receipt.claims.vercel_authority,false);
assert.equal(receipt.installed_aperture_mutated,false);
assert.equal(receipt.pedagogue_law_promoted,false);
assert.equal(receipt.production_mutated,false);
assert.equal(receipt.promotion_authority,false);
assert.equal(receipt.human_closure_required,true);

const spec=fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_DECISION_TRANSITION_APPEND_ONLY_CUSTODY_REPLAY_GAUNTLET_SPEC_V0_1.md','utf8');
assert.match(spec,/Preregistration boundary: \*\*frozen before executable implementation\.\*\*/);
assert.match(spec,/history_\{t\+1\} contains history_t as an unchanged prefix/);
assert.match(spec,/ABSTAIN -> ACTIONABLE -> ABSTAIN/);
assert.match(spec,/current state != complete replay history/);
assert.match(spec,/append-only history != monotonically increasing certainty/);
assert.match(spec,/TEST_COUNTERFACTUAL_REPLAY_BRANCHING_FROM_THE_SAME_CUSTODIED_PREFIX/);

console.log(JSON.stringify({
  ok:true,
  schema:receipt.schema,
  authored_scenario_count:receipt.authored_scenario_count,
  T5_decision_transition:[
    receipt.transitions.T5.initial.decision,
    receipt.transitions.T5.middle.decision,
    receipt.transitions.T5.final.decision
  ],
  T6_custody_transition:[
    receipt.transitions.T6.initial.custody,
    receipt.transitions.T6.final.custody
  ],
  prefix_preservation:receipt.prefix_preservation,
  prefix_replay_consistency:receipt.prefix_replay_consistency,
  next_learning_action:receipt.next_learning_action,
  promotion_authority:receipt.promotion_authority
},null,2));
