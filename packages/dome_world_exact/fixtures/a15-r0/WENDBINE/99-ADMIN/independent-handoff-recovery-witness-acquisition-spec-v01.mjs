const EXPECTED_MAXIMUM = 'BOUNDED_INDEPENDENT_HANDOFF_RECOVERY_WITNESS_ACQUISITION_SPEC_SUPPORTED';
const EXPECTED_PARENT_RESULT = 'BOUNDED_FORMAL_OPEN_RESIDUAL_TOMOGRAPHY_SUPPORTED';
const EXPECTED_PARENT_HEAD = 'cf6232fe74c2adf319f009ab78942b3aa396f428';

function requireCondition(condition, code) {
  if (!condition) throw new Error(code);
}

function exactArray(actual, expected, code) {
  requireCondition(Array.isArray(actual), code);
  requireCondition(actual.length === expected.length, code);
  for (let i = 0; i < expected.length; i += 1) requireCondition(actual[i] === expected[i], code);
}

function rejectPromotions(claims = {}) {
  const promotions = [
    ['witness_acquired', 'WITNESS_ACQUISITION'],
    ['right_of_resignation_established', 'RIGHT_OF_RESIGNATION'],
    ['recovery_established', 'RECOVERY'],
    ['return_established', 'RETURN'],
    ['human_replication_established', 'HUMAN_REPLICATION'],
    ['empirical_exteriority_established', 'EMPIRICAL_EXTERIORITY']
  ];
  for (const [key, label] of promotions) {
    if (claims[key] !== false) throw new Error(`FORBIDDEN_CLAIM_PROMOTION:${label}`);
  }
}

export function validateWitnessAcquisitionSpecification({ prereg, parentReceipt, spec }) {
  requireCondition(prereg?.schema === 'td613.independent-handoff-recovery-witness-acquisition-spec-preregistration/v0.1', 'PREREGISTRATION_SCHEMA_MISMATCH');
  requireCondition(prereg?.scope === 'SPECIFICATION_ONLY', 'PREREGISTRATION_SCOPE_MISMATCH');
  requireCondition(prereg?.maximum_green === EXPECTED_MAXIMUM, 'PREREGISTRATION_MAXIMUM_MISMATCH');
  requireCondition(prereg?.parent_tomography?.sealed_head === EXPECTED_PARENT_HEAD, 'PREREGISTRATION_PARENT_HEAD_MISMATCH');
  requireCondition(prereg?.parent_tomography?.result === EXPECTED_PARENT_RESULT, 'PREREGISTRATION_PARENT_RESULT_MISMATCH');

  requireCondition(parentReceipt?.maximum_green === EXPECTED_PARENT_RESULT, 'PARENT_TOMOGRAPHY_RESULT_MISMATCH');
  requireCondition(parentReceipt?.right_of_resignation === 'OPEN', 'PARENT_RESIDUAL_STATE_CHANGED:RIGHT_OF_RESIGNATION');
  requireCondition(parentReceipt?.safe_return_recovery === 'NON_EQUIVALENT', 'PARENT_RESIDUAL_STATE_CHANGED:SAFE_RETURN_RECOVERY');
  requireCondition(parentReceipt?.return_promotion_authority === false, 'PARENT_RETURN_AUTHORITY_WIDENED');
  requireCondition(parentReceipt?.empirical_exteriority_promotion_authority === false, 'PARENT_EXTERIORITY_AUTHORITY_WIDENED');

  requireCondition(spec?.schema === 'td613.independent-handoff-recovery-witness-acquisition-spec/v0.1', 'SPEC_SCHEMA_MISMATCH');
  requireCondition(spec?.scope === 'SPECIFICATION_ONLY', 'SPEC_SCOPE_MISMATCH');
  requireCondition(spec?.parent_tomography?.sealed_head === EXPECTED_PARENT_HEAD, 'SPEC_PARENT_HEAD_MISMATCH');
  requireCondition(spec?.parent_tomography?.result === EXPECTED_PARENT_RESULT, 'SPEC_PARENT_RESULT_MISMATCH');
  requireCondition(spec?.initial_episode_state === 'NOT_ACQUIRED', 'INITIAL_EPISODE_STATE_MUST_BE_NOT_ACQUIRED');
  exactArray(spec?.future_episode_states, prereg.future_episode_states, 'FUTURE_EPISODE_STATE_MISMATCH');
  requireCondition(spec?.forbidden_future_state === 'PROVEN_BY_SPECIFICATION', 'FORBIDDEN_FUTURE_STATE_MISMATCH');

  requireCondition(Array.isArray(spec?.allowed_witness_source_classes), 'WITNESS_SOURCE_CLASSES_MISSING');
  if (spec.allowed_witness_source_classes.includes('CUSTODIAN_NARRATION')) {
    throw new Error('FORBIDDEN_WITNESS_SOURCE_CLASS:CUSTODIAN_NARRATION');
  }
  requireCondition(spec.allowed_witness_source_classes.length > 0, 'WITNESS_SOURCE_CLASSES_EMPTY');

  const resignationExpected = prereg.required_lanes.right_of_resignation;
  const recoveryExpected = prereg.required_lanes.safe_return_recovery;
  const resignation = spec?.lanes?.right_of_resignation;
  const recovery = spec?.lanes?.safe_return_recovery;

  requireCondition(resignation?.parent_state === 'OPEN', 'RESIGNATION_PARENT_STATE_MISMATCH');
  requireCondition(recovery?.parent_state === 'NON_EQUIVALENT', 'RECOVERY_PARENT_STATE_MISMATCH');
  exactArray(resignation?.required_witness_families, resignationExpected.required_witness_families, 'RESIGNATION_WITNESS_FAMILY_MISMATCH');
  exactArray(recovery?.required_witness_families, recoveryExpected.required_witness_families, 'RECOVERY_WITNESS_FAMILY_MISMATCH');
  exactArray(resignation?.defeat_conditions, resignationExpected.defeat_conditions, 'RESIGNATION_DEFEAT_CONDITION_MISMATCH');
  exactArray(recovery?.defeat_conditions, recoveryExpected.defeat_conditions, 'RECOVERY_DEFEAT_CONDITION_MISMATCH');
  requireCondition(JSON.stringify(resignation.required_witness_families) !== JSON.stringify(recovery.required_witness_families), 'WITNESS_LANES_COLLAPSED');

  const contract = spec?.episode_contract ?? {};
  requireCondition(contract.preregistration_required_before_execution === true, 'EPISODE_CONTRACT_PREREGISTRATION_MISSING');
  requireCondition(contract.immutable_episode_id_required === true, 'EPISODE_CONTRACT_IMMUTABLE_ID_MISSING');
  requireCondition(contract.witness_identity_required === true, 'EPISODE_CONTRACT_WITNESS_IDENTITY_MISSING');
  requireCondition(contract.witness_source_class_required === true, 'EPISODE_CONTRACT_SOURCE_CLASS_MISSING');
  requireCondition(contract.observation_time_required === true, 'EPISODE_CONTRACT_OBSERVATION_TIME_MISSING');
  requireCondition(contract.episode_binding_required === true, 'EPISODE_CONTRACT_BINDING_MISSING');
  requireCondition(contract.custodian_narration_may_satisfy_independent_witness === false, 'EPISODE_CONTRACT_NARRATION_WIDENED');
  requireCondition(contract.held_and_failed_episodes_retained === true, 'EPISODE_CONTRACT_FAILURE_RETENTION_MISSING');
  requireCondition(contract.candidate_requires_all_lane_witnesses_and_no_defeat_condition === true, 'EPISODE_CONTRACT_CANDIDATE_GATE_MISSING');
  requireCondition(contract.candidate_is_return === false, 'EPISODE_CONTRACT_CANDIDATE_RETURN_COLLAPSE');

  exactArray(spec?.invariants, prereg.acquisition_invariants, 'ACQUISITION_INVARIANT_MISMATCH');
  exactArray(spec?.claim_ceiling, prereg.claim_ceiling, 'CLAIM_CEILING_MISMATCH');
  rejectPromotions(spec?.claims);

  return {
    schema: 'td613.independent-handoff-recovery-witness-acquisition-spec-result/v0.1',
    outcome: EXPECTED_MAXIMUM,
    scope: 'SPECIFICATION_ONLY',
    lanes: [
      {
        id: 'right_of_resignation',
        parent_state: 'OPEN',
        required_witness_families: [...resignation.required_witness_families],
        defeat_conditions: [...resignation.defeat_conditions]
      },
      {
        id: 'safe_return_recovery',
        parent_state: 'NON_EQUIVALENT',
        required_witness_families: [...recovery.required_witness_families],
        defeat_conditions: [...recovery.defeat_conditions]
      }
    ],
    invariants: [...spec.invariants],
    findings: [
      'SPECIFICATION_COMPLETENESS_DOES_NOT_ACQUIRE_A_WITNESS',
      'RIGHT_OF_RESIGNATION_AND_RECOVERY_REQUIRE_DISTINCT_WITNESS_FAMILIES',
      'CUSTODIAN_NARRATION_EXCLUDED_FROM_INDEPENDENT_WITNESS_SOURCES',
      'FUTURE_EPISODES_BEGIN_NOT_ACQUIRED',
      'FAILED_OR_HELD_EPISODES_REMAIN_RETAINED',
      'RETURN_REMAINS_UNPROMOTABLE_BY_THIS_CHAMBER'
    ],
    future_episode_initial_state: 'NOT_ACQUIRED',
    witness_acquired: false,
    right_of_resignation_promoted: false,
    recovery_promoted: false,
    return_promoted: false,
    human_replication_promoted: false,
    empirical_exteriority_promoted: false
  };
}
