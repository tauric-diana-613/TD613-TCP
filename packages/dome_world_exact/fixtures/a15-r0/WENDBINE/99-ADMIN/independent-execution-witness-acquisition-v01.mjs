const EXPECTED_PARENT_RESULT = 'BOUNDED_INDEPENDENT_HANDOFF_RECOVERY_WITNESS_ACQUISITION_SPEC_SUPPORTED';
const EXPECTED_MAXIMUM = 'BOUNDED_LOCAL_MACHINE_EXECUTION_WITNESSES_ACQUIRED';

function requireCondition(condition, code) {
  if (!condition) throw new Error(code);
}

function sameValue(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function requireParentAndPrereg(prereg, parentReceipt) {
  requireCondition(prereg?.schema === 'td613.independent-execution-witness-acquisition-preregistration/v0.1', 'PREREGISTRATION_SCHEMA_MISMATCH');
  requireCondition(prereg?.scope === 'EXISTING_SUBSTRATE_EXECUTION_ONLY', 'PREREGISTRATION_SCOPE_MISMATCH');
  requireCondition(prereg?.product_mutation_allowed === false, 'PRODUCT_MUTATION_AUTHORITY_WIDENED');
  requireCondition(prereg?.maximum_green === EXPECTED_MAXIMUM, 'PREREGISTRATION_MAXIMUM_MISMATCH');
  requireCondition(prereg?.episode_state_before_execution === 'NOT_ACQUIRED', 'PREREGISTRATION_EPISODE_STATE_MISMATCH');
  requireCondition(parentReceipt?.maximum_green === EXPECTED_PARENT_RESULT, 'PARENT_RESULT_MISMATCH');
  requireCondition(parentReceipt?.witness_acquired === false, 'PARENT_WITNESS_STATE_WIDENED');
  requireCondition(parentReceipt?.right_of_resignation === 'OPEN', 'PARENT_RIGHT_OF_RESIGNATION_STATE_CHANGED');
  requireCondition(parentReceipt?.safe_return_recovery === 'NON_EQUIVALENT', 'PARENT_RECOVERY_STATE_CHANGED');
  requireCondition(parentReceipt?.return_promotion_authority === false, 'PARENT_RETURN_AUTHORITY_WIDENED');
  requireCondition(prereg?.human_replication_authority === false, 'HUMAN_REPLICATION_AUTHORITY_WIDENED');
  requireCondition(prereg?.external_host_enforcement_authority === false, 'EXTERNAL_HOST_AUTHORITY_WIDENED');
  requireCondition(prereg?.universal_revocation_authority === false, 'UNIVERSAL_REVOCATION_AUTHORITY_WIDENED');
  requireCondition(prereg?.safe_return_promotion_authority === false, 'SAFE_RETURN_AUTHORITY_WIDENED');
  requireCondition(prereg?.return_promotion_authority === false, 'RETURN_AUTHORITY_WIDENED');
  requireCondition(prereg?.empirical_exteriority_authority === false, 'EMPIRICAL_EXTERIORITY_AUTHORITY_WIDENED');
}

export function runIndependentExecutionWitnessAcquisition({
  prereg,
  parentReceipt,
  createLoomPortableGovernor,
  compileLoomDemoScene,
  compileDollhousePortableProjection,
  operateDollhousePortableProjection
}) {
  requireParentAndPrereg(prereg, parentReceipt);
  for (const [name, fn] of Object.entries({
    createLoomPortableGovernor,
    compileLoomDemoScene,
    compileDollhousePortableProjection,
    operateDollhousePortableProjection
  })) requireCondition(typeof fn === 'function', `REQUIRED_SUBSTRATE_MISSING:${name}`);

  // Use one frozen, fixture-closed semantic origin for every receiver. No state from a
  // governor instance is used to construct a later governor.
  const origin = compileLoomDemoScene(0, { sourceRevision: 'working-tree' });
  requireCondition(Object.isFrozen(origin), 'ORIGIN_ARTIFACT_NOT_FROZEN');
  const projection = compileDollhousePortableProjection(origin, { receiver: 'companion' });
  const validReturn = operateDollhousePortableProjection(projection, { operation: 'EXPLAIN_STATE' });

  // Lane A: execute participation, local close, refusal after close, then construct a
  // fresh receiver from the frozen origin and show that the route remains usable.
  const firstReceiver = createLoomPortableGovernor(origin);
  const firstOriginControl = firstReceiver.inspect().origin_control;
  const priorParticipation = firstReceiver.receive(validReturn);
  requireCondition(priorParticipation.outcome === 'ADMITTED', 'PRIOR_PARTICIPATION_NOT_ADMITTED');

  const closedState = firstReceiver.close();
  const exitReceipt = closedState.latest_event;
  requireCondition(exitReceipt?.kind === 'CLOSE' && exitReceipt?.outcome === 'CLOSED', 'NO_CLOSE_RECEIPT');

  const closedSessionProbe = firstReceiver.receive(validReturn);
  requireCondition(closedSessionProbe.outcome === 'HELD', 'CLOSED_SESSION_STILL_ADMITS_RETURN');
  requireCondition(closedSessionProbe.reasons.includes('SESSION_CLOSED'), 'CLOSED_SESSION_REFUSAL_NOT_BOUND');
  requireCondition(sameValue(firstOriginControl, firstReceiver.inspect().origin_control), 'FIRST_RECEIVER_ORIGIN_CONTROL_MUTATED');

  const secondReceiver = createLoomPortableGovernor(origin);
  requireCondition(secondReceiver !== firstReceiver, 'SECOND_RECEIVER_NOT_INDEPENDENT_INSTANCE');
  const secondOriginControl = secondReceiver.inspect().origin_control;
  requireCondition(sameValue(firstOriginControl, secondOriginControl), 'SECOND_RECEIVER_ORIGIN_CONTROL_DRIFT');
  const independentContinuation = secondReceiver.receive(validReturn);
  requireCondition(independentContinuation.outcome === 'ADMITTED', 'SECOND_RECEIVER_CANNOT_ADMIT_VALID_RETURN');
  const originControlPreservedAcrossReceivers = sameValue(firstOriginControl, secondReceiver.inspect().origin_control);
  requireCondition(originControlPreservedAcrossReceivers, 'ORIGIN_CONTROL_NOT_PRESERVED_ACROSS_RECEIVERS');

  // Lane B: seed control-plane drift, require HOLD, then submit the valid return and
  // require the governor's own HELD->ADMITTED recovered=true receipt. Finally seed
  // drift again to prove recovery did not disable the boundary or mutate the origin.
  const recoveryReceiver = createLoomPortableGovernor(origin);
  const recoveryOriginControl = recoveryReceiver.inspect().origin_control;
  const driftedReturn = cloneJson(validReturn);
  driftedReturn.returned_control.scene_id = `${driftedReturn.returned_control.scene_id}:SEEDED_DRIFT`;

  const seededDrift = recoveryReceiver.receive(driftedReturn);
  requireCondition(seededDrift.outcome === 'HELD', 'SEEDED_DRIFT_ADMITTED');
  requireCondition(seededDrift.reasons.includes('CONTROL_PLANE_DRIFT'), 'SEEDED_DRIFT_NOT_LOCALIZED');
  const originControlPreservedWhileHeld = sameValue(recoveryOriginControl, recoveryReceiver.inspect().origin_control);
  requireCondition(originControlPreservedWhileHeld, 'ORIGIN_CONTROL_MUTATES_WHILE_HELD');

  const recoveryReceipt = recoveryReceiver.receive(validReturn);
  requireCondition(recoveryReceipt.outcome === 'ADMITTED', 'VALID_RETURN_FAILS_TO_RECOVER');
  requireCondition(recoveryReceipt.recovered === true, 'RECOVERY_RECEIPT_NOT_MARKED');
  const postRecoveryState = recoveryReceiver.inspect();
  requireCondition(postRecoveryState.status === 'ACTIVE', 'POST_RECOVERY_STATE_NOT_ACTIVE');
  const originControlPreservedAfterRecovery = sameValue(recoveryOriginControl, postRecoveryState.origin_control);
  requireCondition(originControlPreservedAfterRecovery, 'ORIGIN_CONTROL_MUTATES_AFTER_RECOVERY');

  const defeatProbe = recoveryReceiver.receive(driftedReturn);
  requireCondition(defeatProbe.outcome === 'HELD', 'INVALID_POST_RECOVERY_RETURN_ESCAPES_HOLD');
  const postDefeatState = recoveryReceiver.inspect();
  requireCondition(postDefeatState.status === 'HELD', 'POST_DEFEAT_STATE_NOT_HELD');
  const originControlPreservedAfterDefeatProbe = sameValue(recoveryOriginControl, postDefeatState.origin_control);
  requireCondition(originControlPreservedAfterDefeatProbe, 'ORIGIN_CONTROL_MUTATES_AFTER_DEFEAT_PROBE');

  return Object.freeze({
    schema: 'td613.independent-execution-witness-acquisition-result/v0.1',
    outcome: EXPECTED_MAXIMUM,
    scope: 'EXISTING_SUBSTRATE_EXECUTION_ONLY',
    product_mutated: false,
    episode_state_after_execution: 'CANDIDATE',
    witness_acquired: true,
    right_of_resignation_candidate: true,
    safe_return_recovery_candidate: true,
    right_of_resignation_established: false,
    safe_return_established: false,
    return_promoted: false,
    human_replication_promoted: false,
    external_host_enforcement_promoted: false,
    empirical_exteriority_promoted: false,
    episodes: {
      right_of_resignation: {
        prior_participation: priorParticipation,
        exit_receipt: exitReceipt,
        closed_session_probe: closedSessionProbe,
        independent_continuation: independentContinuation,
        independent_receiver_is_new_instance: secondReceiver !== firstReceiver,
        frozen_origin_artifact: true,
        first_session_state_used_to_construct_second_receiver: false,
        post_exit_route_useful: independentContinuation.outcome === 'ADMITTED',
        origin_control_preserved_across_receivers: originControlPreservedAcrossReceivers
      },
      safe_return_recovery: {
        seeded_drift: seededDrift,
        origin_control_preserved_while_held: originControlPreservedWhileHeld,
        recovery_receipt: recoveryReceipt,
        post_recovery_state: postRecoveryState,
        origin_control_preserved_after_recovery: originControlPreservedAfterRecovery,
        defeat_probe: defeatProbe,
        post_defeat_state: postDefeatState,
        origin_control_preserved_after_defeat_probe: originControlPreservedAfterDefeatProbe
      }
    },
    findings: [
      'EXISTING_GOVERNOR_CLOSE_PRODUCES_EXECUTED_LOCAL_EXIT_RECEIPT',
      'SEPARATE_GOVERNOR_CONTINUES_FROM_FROZEN_ORIGIN_AFTER_FIRST_SESSION_CLOSE',
      'HELD_TO_ADMITTED_TRANSITION_PRODUCES_RECOVERED_TRUE_RECEIPT',
      'POST_RECOVERY_INVALID_RETURN_REENTERS_HOLD_WITHOUT_ORIGIN_MUTATION',
      'LOCAL_MACHINE_WITNESSES_REACH_CANDIDATE_NOT_RETURN'
    ],
    claim_ceiling: [...prereg.claim_ceiling]
  });
}
