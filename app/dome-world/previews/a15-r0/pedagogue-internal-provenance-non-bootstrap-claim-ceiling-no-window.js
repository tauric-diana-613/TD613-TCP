import {
  runPedagogueWitnessKnewTheQuestionGauntlet
} from './pedagogue-precedence-witness-non-anticipating-acquisition-custody-witness-knew-the-question.js';

export const PEDAGOGUE_INTERNAL_PROVENANCE_NON_BOOTSTRAP_CLAIM_CEILING_SCHEMA =
  'td613.pedagogue.internal-provenance-non-bootstrap-claim-ceiling-hostile/v0.1';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export function evaluateInternalProvenanceNonBootstrapClaimCeiling({
  internal_result = null,
  exogenous_anchor_present = null,
  source_origin_claim = null,
  internal_receipts = [],
  self_computed_integrity_field = null
} = {}) {
  const internalNonAnticipationWitnessed =
    internal_result?.status === 'ADMIT_NON_ANTICIPATING_PRECEDENCE_WITNESS' &&
    internal_result?.admitted === true;

  let externalProvenanceStatus;
  if (exogenous_anchor_present === true) {
    externalProvenanceStatus = 'REFUSE_EXTERNAL_ANCHOR_OUTSIDE_ASSAY_JURISDICTION';
  } else if (source_origin_claim != null) {
    externalProvenanceStatus = 'REFUSE_INTERNAL_SELF_ATTESTED_EXTERNAL_PROVENANCE';
  } else if (exogenous_anchor_present === false) {
    externalProvenanceStatus = 'UNIDENTIFIED_NO_EXOGENOUS_ANCHOR';
  } else {
    externalProvenanceStatus = 'ABSTAIN_EXTERNAL_PROVENANCE_ANCHOR_UNOBSERVED';
  }

  return deepFreeze({
    schema: PEDAGOGUE_INTERNAL_PROVENANCE_NON_BOOTSTRAP_CLAIM_CEILING_SCHEMA,
    candidate: 'C14_INTERNAL_PROVENANCE_NON_BOOTSTRAP_CLAIM_CEILING',
    status: externalProvenanceStatus,
    internal_non_anticipation_witnessed: internalNonAnticipationWitnessed,
    inherited_internal_status: internal_result?.status ?? null,
    inherited_internal_admitted: internal_result?.admitted === true,
    external_provenance_status: externalProvenanceStatus,
    external_provenance_identified: false,
    external_provenance_promotion: false,
    external_source_authenticated: false,
    external_origin_confirmed: false,
    exogenous_anchor_present_observed: exogenous_anchor_present === true
      ? true
      : exogenous_anchor_present === false
        ? false
        : null,
    source_origin_claim_received: source_origin_claim,
    internal_receipt_count: Array.isArray(internal_receipts) ? internal_receipts.length : 0,
    self_computed_integrity_field_present: self_computed_integrity_field != null,
    self_computed_integrity_field_is_exogenous_anchor: false,
    internal_receipt_depth_is_external_provenance: false,
    closed_evaluator_can_manufacture_external_source_credibility: false,
    scalar_aggregation_used: false,
    promotion_authority: false,
    product_mutation: false,
    shared_pedagogue_engine_mutation: false,
    browser_execution: false,
    workflow_mutation: false,
    merge_performed: false,
    deployment_performed: false,
    release_authority: false,
    vercel_release_requires_issue_405_and_new_explicit_operator_gesture: true
  });
}

function nw01(c13) {
  const internal = c13.rooms.kq01.preResult;
  const genuine = evaluateInternalProvenanceNonBootstrapClaimCeiling({
    internal_result: internal,
    exogenous_anchor_present: false
  });
  const fabricated = evaluateInternalProvenanceNonBootstrapClaimCeiling({
    internal_result: internal,
    exogenous_anchor_present: false
  });
  return deepFreeze({
    case_id: 'NW01_TWIN_WORLDS_BEHIND_ONE_WALL',
    oracle_world_g_origin: 'EXTERNALLY_SOURCED_BEFORE_ENTRY',
    oracle_world_f_origin: 'FABRICATED_BEFORE_ENTRY',
    oracle_origin_is_evaluator_input: false,
    admitted_internal_transcript_equal: true,
    internal_transcript_fingerprint: stable(internal),
    genuine,
    fabricated,
    posture_equal: stable(genuine) === stable(fabricated)
  });
}

function nw02(c13) {
  const result = evaluateInternalProvenanceNonBootstrapClaimCeiling({
    internal_result: c13.rooms.kq01.preResult,
    exogenous_anchor_present: false,
    source_origin_claim: 'EXTERNAL'
  });
  return deepFreeze({ case_id: 'NW02_SELF_MINTED_PASSPORT', result });
}

function nw03(c13) {
  const internal = c13.rooms.kq01.preResult;
  const baseline = evaluateInternalProvenanceNonBootstrapClaimCeiling({
    internal_result: internal,
    exogenous_anchor_present: false
  });
  const paperwork = evaluateInternalProvenanceNonBootstrapClaimCeiling({
    internal_result: internal,
    exogenous_anchor_present: false,
    internal_receipts: [
      { kind: 'ACQUISITION_RECEIPT' },
      { kind: 'WITNESS_LEDGER_RECEIPT' },
      { kind: 'BRIDGE_RECEIPT' },
      { kind: 'NON_ANTICIPATION_RECEIPT' }
    ]
  });
  return deepFreeze({ case_id: 'NW03_MORE_INTERNAL_PAPERWORK', baseline, paperwork,
    external_posture_equal: baseline.external_provenance_status === paperwork.external_provenance_status });
}

function nw04(c13) {
  const baseline = evaluateInternalProvenanceNonBootstrapClaimCeiling({
    internal_result: c13.rooms.kq01.preResult,
    exogenous_anchor_present: false
  });
  const renamed = evaluateInternalProvenanceNonBootstrapClaimCeiling({
    internal_result: c13.rooms.kq06.result,
    exogenous_anchor_present: false
  });
  return deepFreeze({ case_id: 'NW04_RENAME_THE_WITNESS', baseline, renamed,
    inherited_current_set_equal:
      c13.rooms.kq01.preResult.current_event_set_fingerprint === c13.rooms.kq06.result.current_event_set_fingerprint,
    external_posture_equal: baseline.external_provenance_status === renamed.external_provenance_status });
}

function nw05(c13) {
  const internal = clone(c13.rooms.kq01.preResult);
  internal.acquisition_episode_label = 'RENAMED_ACQUISITION_EPISODE_ONLY';
  const baseline = evaluateInternalProvenanceNonBootstrapClaimCeiling({
    internal_result: c13.rooms.kq01.preResult,
    exogenous_anchor_present: false
  });
  const renamed = evaluateInternalProvenanceNonBootstrapClaimCeiling({
    internal_result: internal,
    exogenous_anchor_present: false
  });
  return deepFreeze({ case_id: 'NW05_RENAME_ACQUISITION_EPISODE', baseline, renamed,
    external_posture_equal: baseline.external_provenance_status === renamed.external_provenance_status });
}

function nw06(c13) {
  const receipts = [
    { receipt_id: 'R1', kind: 'INTERNAL' },
    { receipt_id: 'R2', kind: 'INTERNAL' },
    { receipt_id: 'R3', kind: 'INTERNAL' }
  ];
  const forward = evaluateInternalProvenanceNonBootstrapClaimCeiling({
    internal_result: c13.rooms.kq01.preResult,
    exogenous_anchor_present: false,
    internal_receipts: receipts
  });
  const reversed = evaluateInternalProvenanceNonBootstrapClaimCeiling({
    internal_result: c13.rooms.kq01.preResult,
    exogenous_anchor_present: false,
    internal_receipts: [...receipts].reverse()
  });
  return deepFreeze({ case_id: 'NW06_SERIALIZE_SAME_CLOSED_RECORD', forward, reversed,
    external_posture_equal: forward.external_provenance_status === reversed.external_provenance_status });
}

function nw07(c13) {
  const result = evaluateInternalProvenanceNonBootstrapClaimCeiling({
    internal_result: c13.rooms.kq01.preResult,
    exogenous_anchor_present: false,
    self_computed_integrity_field: 'SELF-DIGEST-CAFE613'
  });
  return deepFreeze({ case_id: 'NW07_INTERNAL_SIGNATURE_THEATER', result });
}

function nw08(c13) {
  const internal = c13.rooms.kq01.preResult;
  const genuine = evaluateInternalProvenanceNonBootstrapClaimCeiling({
    internal_result: internal,
    exogenous_anchor_present: false,
    source_origin_claim: 'EXTERNAL'
  });
  const fabricated = evaluateInternalProvenanceNonBootstrapClaimCeiling({
    internal_result: internal,
    exogenous_anchor_present: false,
    source_origin_claim: 'EXTERNAL'
  });
  return deepFreeze({
    case_id: 'NW08_CARBON_COPY_EXTERNAL_LABEL',
    oracle_world_g_origin: 'EXTERNALLY_SOURCED_BEFORE_ENTRY',
    oracle_world_f_origin: 'FABRICATED_BEFORE_ENTRY',
    visible_origin_label_equal: true,
    genuine,
    fabricated,
    posture_equal: stable(genuine) === stable(fabricated)
  });
}

function nw09(c13) {
  const result = evaluateInternalProvenanceNonBootstrapClaimCeiling({
    internal_result: c13.rooms.kq01.preResult,
    exogenous_anchor_present: false
  });
  return deepFreeze({ case_id: 'NW09_MISSING_ANCHOR_EXPLICIT', result });
}

function nw10(c13) {
  const result = evaluateInternalProvenanceNonBootstrapClaimCeiling({
    internal_result: c13.rooms.kq01.preResult
  });
  return deepFreeze({ case_id: 'NW10_UNKNOWN_ANCHOR_STATUS', result });
}

function nw11(c13) {
  const result = evaluateInternalProvenanceNonBootstrapClaimCeiling({
    internal_result: c13.rooms.kq01.preResult,
    exogenous_anchor_present: false
  });
  return deepFreeze({ case_id: 'NW11_INTERNAL_NON_ANTICIPATION_POSITIVE_CONTROL', result });
}

function nw12() {
  const result = evaluateInternalProvenanceNonBootstrapClaimCeiling({
    internal_result: null,
    exogenous_anchor_present: false
  });
  return deepFreeze({ case_id: 'NW12_NULL_CONTROL', result });
}

export function runPedagogueNoWindowGauntlet() {
  const c13 = runPedagogueWitnessKnewTheQuestionGauntlet();
  const rooms = {
    nw01: nw01(c13),
    nw02: nw02(c13),
    nw03: nw03(c13),
    nw04: nw04(c13),
    nw05: nw05(c13),
    nw06: nw06(c13),
    nw07: nw07(c13),
    nw08: nw08(c13),
    nw09: nw09(c13),
    nw10: nw10(c13),
    nw11: nw11(c13),
    nw12: nw12()
  };

  const defeat = [];
  if (!rooms.nw01.posture_equal ||
      rooms.nw01.genuine.external_provenance_identified ||
      rooms.nw01.fabricated.external_provenance_identified ||
      rooms.nw01.genuine.external_provenance_status !== 'UNIDENTIFIED_NO_EXOGENOUS_ANCHOR') {
    defeat.push('INTERNAL_PAYLOAD_BOOTSTRAPS_EXTERNAL_PROVENANCE');
  }
  if (rooms.nw02.result.external_provenance_status !== 'REFUSE_INTERNAL_SELF_ATTESTED_EXTERNAL_PROVENANCE' ||
      rooms.nw02.result.external_provenance_identified) {
    defeat.push('SELF_ATTESTED_EXTERNAL_LABEL_WIDENS_AUTHORITY');
  }
  if (!rooms.nw03.external_posture_equal || rooms.nw03.paperwork.external_provenance_identified) {
    defeat.push('INTERNAL_RECEIPT_DEPTH_WIDENS_EXTERNAL_AUTHORITY');
  }
  if (!rooms.nw04.inherited_current_set_equal || !rooms.nw04.external_posture_equal) {
    defeat.push('INTERNAL_ID_RENAME_CHANGES_EXTERNAL_PROVENANCE_POSTURE');
  }
  if (!rooms.nw05.external_posture_equal) {
    defeat.push('INTERNAL_ID_RENAME_CHANGES_EXTERNAL_PROVENANCE_POSTURE');
  }
  if (!rooms.nw06.external_posture_equal) {
    defeat.push('SERIALIZATION_ORDER_CREATES_EXTERNAL_AUTHORITY');
  }
  if (rooms.nw07.result.self_computed_integrity_field_is_exogenous_anchor ||
      rooms.nw07.result.external_provenance_identified) {
    defeat.push('SELF_COMPUTED_INTEGRITY_FIELD_TREATED_AS_EXOGENOUS_ANCHOR');
  }
  if (!rooms.nw08.posture_equal || rooms.nw08.genuine.external_provenance_identified ||
      rooms.nw08.fabricated.external_provenance_identified) {
    defeat.push('SELF_ATTESTED_EXTERNAL_LABEL_WIDENS_AUTHORITY');
  }
  if (rooms.nw09.result.external_provenance_status !== 'UNIDENTIFIED_NO_EXOGENOUS_ANCHOR') {
    defeat.push('MISSING_ANCHOR_DEFAULTS_TO_PRESENT');
  }
  if (rooms.nw10.result.external_provenance_status !== 'ABSTAIN_EXTERNAL_PROVENANCE_ANCHOR_UNOBSERVED') {
    defeat.push('UNKNOWN_ANCHOR_DEFAULTS_TO_PRESENT');
  }
  if (!rooms.nw11.result.internal_non_anticipation_witnessed) {
    defeat.push('CLAIM_CEILING_ERASES_LAWFUL_INTERNAL_NON_ANTICIPATION');
  }
  if (rooms.nw12.result.internal_non_anticipation_witnessed || rooms.nw12.result.external_provenance_identified) {
    defeat.push('NULL_STATE_INVENTS_PROVENANCE');
  }

  const inheritedC13Survived =
    c13.candidate_verdict ===
    'PRECEDENCE_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_WITNESS_KNEW_THE_QUESTION';

  return deepFreeze({
    ok: true,
    schema: PEDAGOGUE_INTERNAL_PROVENANCE_NON_BOOTSTRAP_CLAIM_CEILING_SCHEMA,
    inherited_c13_verdict: c13.candidate_verdict,
    inherited_c13_survived: inheritedC13Survived,
    candidate: 'C14_INTERNAL_PROVENANCE_NON_BOOTSTRAP_CLAIM_CEILING',
    candidate_status: 'ATTACK_ONLY_NOT_PROMOTED',
    candidate_verdict: defeat.length === 0 && inheritedC13Survived
      ? 'INTERNAL_PROVENANCE_NON_BOOTSTRAP_CLAIM_CEILING_SURVIVES_BOUNDED_NO_WINDOW'
      : 'INTERNAL_PROVENANCE_NON_BOOTSTRAP_CLAIM_CEILING_FALSIFIED_IN_BOUNDED_NO_WINDOW',
    defeat_conditions: defeat,
    rooms,
    external_anchor_introduction: false,
    external_source_adapter: false,
    external_provenance_identified: false,
    claim_is_universal_impossibility_theorem: false,
    closed_surface_only: true,
    scalar_aggregation_used: false,
    H2: 'HELD_NOT_TESTED_HERE',
    H3: 'HELD_NOT_TESTED_HERE',
    intersections: 'HELD_NOT_OPENED_HERE',
    APERTURE_V32_REPLAY_STABILITY: 'HELD_NOT_YET_WITNESSED',
    product_mutation: false,
    shared_pedagogue_engine_mutation: false,
    browser_execution: false,
    workflow_mutation: false,
    merge_performed: false,
    deployment_performed: false,
    release_authority: false,
    vercel_release_requires_issue_405_and_new_explicit_operator_gesture: true,
    promotion_authority: false,
    next_learning_action:
      'PRESERVE_BOUNDARY_UNLESS_HUMAN_OPENS_EXTERNAL_ANCHOR_OBSERVABILITY_OR_SEPARATE_INTERSECTION_PROGRAM'
  });
}
