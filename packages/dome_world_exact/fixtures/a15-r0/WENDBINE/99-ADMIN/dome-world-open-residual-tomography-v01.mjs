const RESULT_SCHEMA = 'td613.dome-world.open-residual-tomography-result/v0.1';
const BRIDGE_SCHEMA = 'td613.wendbine-loom-reciprocal-legibility-map/v0.1';
const PARENT_RECEIPT_SCHEMA = 'td613.independent-receiver-replication-receipt/v0.1';

const RESIDUALS = Object.freeze({
  right_of_resignation: Object.freeze({
    parent_relation_class: 'OPEN',
    parent_state: 'HELD_NOT_EXPOSED_IN_PORTABLE_PACKET',
    crosswalk_id: 'typed_trust_revocation',
    typed_witness_deficits: Object.freeze([
      'EXPLICIT_POST_PARTICIPATION_EXIT_OR_REVOCATION_OPERATOR',
      'EXECUTED_POST_PARTICIPATION_WITHDRAWAL_RECEIPT',
      'INDEPENDENT_CONTINUATION_WITHOUT_CUSTODIAN_AUTHORITY',
      'POST_EXIT_ROUTE_USEFULNESS_WITNESS'
    ]),
    archive_limited_ambiguity: Object.freeze([
      'NO_EXIT_OPERATOR_EXISTS',
      'EXIT_OPERATOR_EXISTS_BUT_IS_UNEXPOSED'
    ])
  }),
  safe_return_recovery: Object.freeze({
    parent_relation_class: 'NON_EQUIVALENT',
    parent_state: 'HELD_REPAIR_PATH_IS_NOT_RECOVERY',
    crosswalk_id: 'robustness_recovery',
    typed_witness_deficits: Object.freeze([
      'EXPLICIT_RECOVERY_TRANSITION_SPECIFICATION',
      'EXECUTED_RECOVERY_RECEIPT',
      'VALIDATED_POST_RECOVERY_STATE',
      'DECLARED_DEFEAT_OR_ROLLBACK_CONDITION'
    ]),
    archive_limited_ambiguity: Object.freeze([
      'RECOVERY_CAPABLE_BUT_UNEXECUTED',
      'RECOVERY_INCAPABLE'
    ])
  })
});

const FINDINGS = Object.freeze([
  'BOTH_RESIDUALS_PROJECT_TO_THE_SAME_COARSE_VCPL_VECTOR_UNDER_THE_FROZEN_ARCHIVE',
  'SAME_COARSE_VECTOR_DOES_NOT_IMPLY_SAME_RESIDUAL_SEMANTICS',
  'TYPED_WITNESS_DEFICITS_REMAIN_DISTINCT',
  'ABSENCE_OF_ADMITTED_WITNESS_DOES_NOT_ESTABLISH_ABSENCE_OF_EXTERNAL_PROCESS',
  'GENERIC_REVOCATION_NEIGHBORHOOD_DOES_NOT_ESTABLISH_POST_PARTICIPATION_EXIT_OPERATOR',
  'REPAIR_PATH_PRESENCE_DOES_NOT_ESTABLISH_RECOVERY_PROCESS_OR_POST_RECOVERY_STATE'
]);

function requireObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(`${label}_MUST_BE_OBJECT`);
}

function rejectForbiddenInputs(input) {
  const forbidden = [
    ['custodianNarration', 'CUSTODIAN_NARRATION'],
    ['privateState', 'PRIVATE_STATE'],
    ['externalWitness', 'UNADMITTED_EXTERNAL_WITNESS'],
    ['humanReplicationClaim', 'HUMAN_REPLICATION_CLAIM'],
    ['returnClaim', 'RETURN_CLAIM']
  ];
  for (const [key, code] of forbidden) {
    const value = input[key];
    if (value !== undefined && value !== null && value !== false) throw new Error(`FORBIDDEN_INPUT:${code}`);
  }
}

function validateParent(input) {
  requireObject(input.bridgeMap, 'BRIDGE_MAP');
  requireObject(input.parentReplicationReceipt, 'PARENT_REPLICATION_RECEIPT');
  if (!Array.isArray(input.publicSources)) throw new TypeError('PUBLIC_SOURCES_MUST_BE_ARRAY');

  if (input.bridgeMap.schema !== BRIDGE_SCHEMA) throw new Error('BRIDGE_MAP_SCHEMA_CHANGED');
  if (input.parentReplicationReceipt.schema !== PARENT_RECEIPT_SCHEMA) throw new Error('PARENT_RECEIPT_SCHEMA_CHANGED');
  if (input.parentReplicationReceipt.maximum_green !== 'BOUNDED_INDEPENDENT_MACHINE_RECEIVER_REPLICATION_SUPPORTED') throw new Error('PARENT_REPLICATION_RESULT_CHANGED');
  if (input.parentReplicationReceipt.scientific_green_head !== 'a4ea1b35afd53dca2fb179680efc91811dcfa3c4') throw new Error('PARENT_SCIENTIFIC_HEAD_CHANGED');
  if (input.parentReplicationReceipt.receipt_binding_head !== '28f50af9b4754d13d524543ace794ec01f13a3a9') throw new Error('PARENT_RECEIPT_BINDING_HEAD_CHANGED');
  if (input.parentReplicationReceipt.right_of_resignation !== 'OPEN') throw new Error('PARENT_CLAIM_CEILING_CHANGED:RIGHT_OF_RESIGNATION');
  if (input.parentReplicationReceipt.safe_return_recovery !== 'NON_EQUIVALENT') throw new Error('PARENT_CLAIM_CEILING_CHANGED:SAFE_RETURN_RECOVERY');
  if (input.parentReplicationReceipt.return_promotion_authority !== false) throw new Error('PARENT_RETURN_AUTHORITY_CHANGED');
}

function sourceIndex(publicSources) {
  const index = new Map();
  for (const source of publicSources) {
    if (source && typeof source === 'object' && typeof source.source_id === 'string') index.set(source.source_id, source);
  }
  return index;
}

function custodyRecoverability(row, index) {
  const refs = row.wendbine_source_refs ?? [];
  if (!refs.length) return 0;
  for (const ref of refs) {
    const source = index.get(ref);
    if (!source) return 0;
    if (source.real_person_identity_adjudicated !== false || source.source_text_stored !== false) return 0;
  }
  return 1;
}

function validateFrozenResidual(row, id, spec) {
  if (!row) throw new Error(`PARENT_RESIDUAL_MISSING:${id}`);
  if (row.relation_class !== spec.parent_relation_class || row.state !== spec.parent_state) throw new Error(`PARENT_RESIDUAL_STATE_CHANGED:${id}`);
  if (row.crosswalk_id !== spec.crosswalk_id) throw new Error(`PARENT_RESIDUAL_CROSSWALK_CHANGED:${id}`);
}

function traceVisibility(row) {
  return row && typeof row.id === 'string' && typeof row.relation_class === 'string' && typeof row.state === 'string' ? 1 : 0;
}

function processIdentifiability(id, row) {
  if (id === 'right_of_resignation') {
    const explicitExitWitness = row.exit_operator_witness?.admitted === true && row.exit_operator_witness?.post_participation === true;
    return explicitExitWitness ? 1 : 0;
  }
  if (id === 'safe_return_recovery') {
    const explicitRecoverySpec = row.recovery_transition_spec?.admitted === true;
    return explicitRecoverySpec ? 1 : 0;
  }
  return 0;
}

function latentStateReconstructibility(id, row) {
  if (id === 'right_of_resignation') {
    const postExitWitness = row.post_exit_state_witness?.admitted === true && row.post_exit_state_witness?.custodian_authority_required === false;
    return postExitWitness ? 1 : 0;
  }
  if (id === 'safe_return_recovery') {
    const postRecoveryWitness = row.post_recovery_state_witness?.admitted === true && row.post_recovery_state_witness?.validated === true;
    return postRecoveryWitness ? 1 : 0;
  }
  return 0;
}

function tomographResidual(id, row, index) {
  const spec = RESIDUALS[id];
  validateFrozenResidual(row, id, spec);
  const vector = {
    V: traceVisibility(row),
    C: custodyRecoverability(row, index),
    P: processIdentifiability(id, row),
    L: latentStateReconstructibility(id, row)
  };
  return Object.freeze({
    id,
    parent_relation_class: row.relation_class,
    parent_state: row.state,
    crosswalk_id: row.crosswalk_id,
    loom_surfaces: [...(row.loom_surfaces ?? [])],
    vector,
    typed_witness_deficits: [...spec.typed_witness_deficits],
    archive_limited_ambiguity: [...spec.archive_limited_ambiguity],
    zero_semantics: 'ARCHIVE_LIMITED_MISSING_WITNESS_NOT_EXTERNAL_NONEXISTENCE'
  });
}

export function tomographOpenResiduals(input) {
  requireObject(input, 'TOMOGRAPHY_INPUT');
  rejectForbiddenInputs(input);
  validateParent(input);

  const index = sourceIndex(input.publicSources);
  const rows = new Map((input.bridgeMap.rows ?? []).map(row => [row.id, row]));
  const resignation = tomographResidual('right_of_resignation', rows.get('right_of_resignation'), index);
  const recovery = tomographResidual('safe_return_recovery', rows.get('safe_return_recovery'), index);
  const residuals = [resignation, recovery];

  const baseGreen = residuals.every(row => row.vector.V === 1 && row.vector.C === 1 && row.vector.P === 0 && row.vector.L === 0);
  const outcome = baseGreen ? 'BOUNDED_FORMAL_OPEN_RESIDUAL_TOMOGRAPHY_SUPPORTED' : 'FORMAL_TOMOGRAPHY_DETECTED_COORDINATE_DEGRADATION';

  return Object.freeze({
    schema: RESULT_SCHEMA,
    outcome,
    evidence_state_vector: 'E=(V,C,P,L)',
    residuals,
    findings: [...FINDINGS],
    right_of_resignation: 'OPEN',
    safe_return_recovery: 'NON_EQUIVALENT',
    repair_recovery_return_distinction_preserved: true,
    empirical_exteriority_promoted: false,
    human_replication_promoted: false,
    return_promoted: false,
    claim_ceiling: [
      'FORMAL_TOMOGRAPHY != EMPIRICAL_TOMOGRAPHY',
      'ARCHIVE_LIMITED_P0 != PROCESS_DOES_NOT_EXIST',
      'ARCHIVE_LIMITED_L0 != STATE_DOES_NOT_EXIST',
      'V,C,P,L VECTOR != COMPLETE_RESIDUAL_SEMANTICS',
      'SAME_VECTOR != SAME_FAILURE_MODE',
      'GENERIC_REVOCATION != RIGHT_OF_RESIGNATION',
      'REPAIR_PATH != RECOVERY != RETURN',
      'GREEN != EMPIRICAL_EXTERIORITY',
      'GREEN != CUSTODIAN_INDEPENDENT_RETURN'
    ]
  });
}
