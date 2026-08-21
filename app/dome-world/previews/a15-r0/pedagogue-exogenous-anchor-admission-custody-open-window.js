import {
  runPedagogueNoWindowGauntlet
} from './pedagogue-internal-provenance-non-bootstrap-claim-ceiling-no-window.js';

export const PEDAGOGUE_EXOGENOUS_ANCHOR_ADMISSION_CUSTODY_SCHEMA =
  'td613.pedagogue.exogenous-anchor-admission-custody-hostile/v0.1';

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

function normalizeObservations(observations = []) {
  return [...observations]
    .filter(item => item && typeof item.field === 'string' && Object.prototype.hasOwnProperty.call(item, 'value'))
    .map(item => ({ field: item.field, value: item.value }))
    .sort((a, b) => stable(a).localeCompare(stable(b)));
}

function semanticAnchorFingerprint(anchor) {
  return stable({
    source_kind: anchor.source_kind ?? null,
    target_fingerprint: anchor.target_fingerprint ?? null,
    observations: normalizeObservations(anchor.observations),
    active: anchor.active !== false,
    valid_from_epoch: Number.isFinite(anchor.valid_from_epoch) ? anchor.valid_from_epoch : null,
    valid_through_epoch: Number.isFinite(anchor.valid_through_epoch) ? anchor.valid_through_epoch : null
  });
}

export function makeSyntheticExogenousAnchor({
  anchor_id,
  target_fingerprint,
  observations = [],
  source_kind = 'ADMITTED_EXOGENOUS_OBSERVATION',
  active = true,
  valid_from_epoch = 0,
  valid_through_epoch = null,
  scope_label = null
} = {}) {
  return deepFreeze({
    anchor_id,
    source_kind,
    target_fingerprint,
    observations: normalizeObservations(observations),
    active,
    valid_from_epoch,
    valid_through_epoch,
    scope_label
  });
}

function classifyAnchor(anchor, currentEpoch) {
  const observations = normalizeObservations(anchor?.observations);
  let status = 'LAWFUL_CURRENT_EXOGENOUS_ANCHOR';

  if (anchor?.source_kind === 'INTERNAL_ASSERTION') {
    status = 'REFUSE_INTERNAL_SELF_ATTESTED_EXTERNAL_PROVENANCE';
  } else if (anchor?.source_kind !== 'ADMITTED_EXOGENOUS_OBSERVATION') {
    status = 'REFUSE_UNCLASSIFIED_ANCHOR_ORIGIN';
  } else if (!anchor?.target_fingerprint) {
    status = 'REFUSE_ANCHOR_TARGET_UNBOUND';
  } else if (observations.length === 0) {
    status = 'REFUSE_ANCHOR_WITHOUT_OBSERVATION';
  } else if (anchor.active === false) {
    status = 'INACTIVE_HISTORICAL_EXOGENOUS_ANCHOR';
  } else if (Number.isFinite(anchor.valid_from_epoch) && currentEpoch < anchor.valid_from_epoch) {
    status = 'ABSTAIN_EXOGENOUS_ANCHOR_NOT_YET_VALID';
  } else if (Number.isFinite(anchor.valid_through_epoch) && currentEpoch > anchor.valid_through_epoch) {
    status = 'STALE_EXOGENOUS_ANCHOR';
  }

  return deepFreeze({
    anchor_id: anchor?.anchor_id ?? null,
    status,
    source_kind: anchor?.source_kind ?? null,
    target_fingerprint: anchor?.target_fingerprint ?? null,
    observations,
    scope_label: anchor?.scope_label ?? null,
    semantic_fingerprint: semanticAnchorFingerprint(anchor ?? {}),
    lawful_current: status === 'LAWFUL_CURRENT_EXOGENOUS_ANCHOR'
  });
}

export function evaluateExogenousAnchorAdmissionCustody({
  c14_result = null,
  requested_target = null,
  requested_field = null,
  current_epoch = 10,
  anchors = []
} = {}) {
  const classifications = [...anchors].map(anchor => classifyAnchor(anchor, current_epoch));
  const lawfulCurrent = classifications.filter(item => item.lawful_current);
  const targetMatches = lawfulCurrent.filter(item => item.target_fingerprint === requested_target);
  const fieldObservations = targetMatches.flatMap(item =>
    item.observations
      .filter(observation => observation.field === requested_field)
      .map(observation => ({
        anchor_id: item.anchor_id,
        semantic_anchor_fingerprint: item.semantic_fingerprint,
        field: observation.field,
        value: observation.value
      }))
  );
  const distinctValues = [...new Set(fieldObservations.map(item => stable(item.value)))].sort();
  const supportingSemanticFingerprints = [...new Set(
    fieldObservations.map(item => item.semantic_anchor_fingerprint)
  )].sort();

  let status;
  let observedValue = null;

  if (!requested_target || !requested_field) {
    status = 'ABSTAIN_EXOGENOUS_OBSERVATION_REQUEST_INCOMPLETE';
  } else if (classifications.length === 0) {
    status = c14_result?.external_provenance_status ?? 'UNIDENTIFIED_NO_EXOGENOUS_ANCHOR';
  } else if (lawfulCurrent.length === 0) {
    if (classifications.some(item => item.status === 'REFUSE_INTERNAL_SELF_ATTESTED_EXTERNAL_PROVENANCE')) {
      status = 'REFUSE_INTERNAL_SELF_ATTESTED_EXTERNAL_PROVENANCE';
    } else if (classifications.some(item => item.status === 'STALE_EXOGENOUS_ANCHOR')) {
      status = 'ABSTAIN_NO_CURRENT_EXOGENOUS_ANCHOR_STALE';
    } else if (classifications.some(item => item.status === 'INACTIVE_HISTORICAL_EXOGENOUS_ANCHOR')) {
      status = 'ABSTAIN_NO_CURRENT_EXOGENOUS_ANCHOR_INACTIVE';
    } else {
      status = 'ABSTAIN_NO_LAWFUL_CURRENT_EXOGENOUS_ANCHOR';
    }
  } else if (targetMatches.length === 0) {
    status = 'REFUSE_EXOGENOUS_ANCHOR_TARGET_MISMATCH';
  } else if (fieldObservations.length === 0) {
    status = 'ABSTAIN_EXOGENOUS_ANCHOR_SCOPE_MISMATCH';
  } else if (distinctValues.length > 1) {
    status = 'ABSTAIN_CONFLICTING_EXOGENOUS_ANCHORS';
  } else {
    status = 'ADMIT_SCOPED_EXOGENOUS_OBSERVATION';
    observedValue = fieldObservations[0].value;
  }

  return deepFreeze({
    schema: PEDAGOGUE_EXOGENOUS_ANCHOR_ADMISSION_CUSTODY_SCHEMA,
    candidate: 'E1_EXOGENOUS_ANCHOR_ADMISSION_CUSTODY',
    status,
    requested_target,
    requested_field,
    current_epoch,
    observed_value: observedValue,
    scoped_external_observation_identified: status === 'ADMIT_SCOPED_EXOGENOUS_OBSERVATION',
    global_external_provenance_identified: false,
    external_source_authenticated: false,
    source_honesty_identified: requested_field === 'SOURCE_HONESTY' && status === 'ADMIT_SCOPED_EXOGENOUS_OBSERVATION',
    classifications,
    current_lawful_anchor_count: lawfulCurrent.length,
    current_target_anchor_count: targetMatches.length,
    field_observation_count: fieldObservations.length,
    distinct_observed_value_count: distinctValues.length,
    supporting_anchor_semantic_fingerprints: supportingSemanticFingerprints,
    anchor_identifier_is_authority: false,
    anchor_serialization_is_authority: false,
    anchor_count_is_confidence: false,
    textual_scope_label_is_authority: false,
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

const TARGET_ALPHA = 'TARGET:ALPHA';
const TARGET_BETA = 'TARGET:BETA';
const EXISTENCE_FIELD = 'SOURCE_EXISTENCE_RELATIVE_TO_PROTOCOL';
const ORIGIN_FIELD = 'SOURCE_ORIGIN_CLASS';
const HONESTY_FIELD = 'SOURCE_HONESTY';
const GLOBAL_FIELD = 'GLOBAL_SOURCE_CREDIBILITY';

function anchor(overrides = {}) {
  return makeSyntheticExogenousAnchor({
    anchor_id: 'ANCHOR_ALPHA',
    target_fingerprint: TARGET_ALPHA,
    observations: [{ field: EXISTENCE_FIELD, value: 'PRE_ENTRY' }],
    source_kind: 'ADMITTED_EXOGENOUS_OBSERVATION',
    active: true,
    valid_from_epoch: 1,
    valid_through_epoch: 20,
    ...overrides
  });
}

function ow01(c14) {
  const result = evaluateExogenousAnchorAdmissionCustody({
    c14_result: c14.rooms.nw09.result,
    requested_target: TARGET_ALPHA,
    requested_field: EXISTENCE_FIELD,
    current_epoch: 10,
    anchors: [anchor()]
  });
  return deepFreeze({ case_id: 'OW01_OPEN_WINDOW_NARROW_VIEW', result });
}

function ow02(c14) {
  const result = evaluateExogenousAnchorAdmissionCustody({
    c14_result: c14.rooms.nw09.result,
    requested_target: TARGET_ALPHA,
    requested_field: EXISTENCE_FIELD,
    current_epoch: 10,
    anchors: [anchor({ source_kind: 'INTERNAL_ASSERTION' })]
  });
  return deepFreeze({ case_id: 'OW02_PASSPORT_DRAWN_INSIDE', result });
}

function ow03(c14) {
  const result = evaluateExogenousAnchorAdmissionCustody({
    c14_result: c14.rooms.nw09.result,
    requested_target: TARGET_ALPHA,
    requested_field: EXISTENCE_FIELD,
    current_epoch: 10,
    anchors: [anchor({ target_fingerprint: TARGET_BETA })]
  });
  return deepFreeze({ case_id: 'OW03_WRONG_HOUSE', result });
}

function ow04(c14) {
  const result = evaluateExogenousAnchorAdmissionCustody({
    c14_result: c14.rooms.nw09.result,
    requested_target: TARGET_ALPHA,
    requested_field: EXISTENCE_FIELD,
    current_epoch: 10,
    anchors: [anchor({ valid_through_epoch: 5 })]
  });
  return deepFreeze({ case_id: 'OW04_YESTERDAYS_NEWSPAPER', result });
}

function ow05(c14) {
  const result = evaluateExogenousAnchorAdmissionCustody({
    c14_result: c14.rooms.nw09.result,
    requested_target: TARGET_ALPHA,
    requested_field: EXISTENCE_FIELD,
    current_epoch: 10,
    anchors: [
      anchor({ anchor_id: 'ANCHOR_PRE', observations: [{ field: EXISTENCE_FIELD, value: 'PRE_ENTRY' }] }),
      anchor({ anchor_id: 'ANCHOR_POST', observations: [{ field: EXISTENCE_FIELD, value: 'POST_ENTRY' }] })
    ]
  });
  return deepFreeze({ case_id: 'OW05_TWO_WINDOWS_TWO_STREETS', result });
}

function ow06(c14) {
  const originalAnchors = [
    anchor({ anchor_id: 'AAA' }),
    anchor({
      anchor_id: 'BBB',
      observations: [{ field: EXISTENCE_FIELD, value: 'PRE_ENTRY' }, { field: ORIGIN_FIELD, value: 'EXTERNAL' }]
    })
  ];
  const renamedReversed = [...originalAnchors]
    .reverse()
    .map((item, index) => makeSyntheticExogenousAnchor({ ...clone(item), anchor_id: `RENAMED_${index}` }));
  const original = evaluateExogenousAnchorAdmissionCustody({
    c14_result: c14.rooms.nw09.result,
    requested_target: TARGET_ALPHA,
    requested_field: EXISTENCE_FIELD,
    current_epoch: 10,
    anchors: originalAnchors
  });
  const mutated = evaluateExogenousAnchorAdmissionCustody({
    c14_result: c14.rooms.nw09.result,
    requested_target: TARGET_ALPHA,
    requested_field: EXISTENCE_FIELD,
    current_epoch: 10,
    anchors: renamedReversed
  });
  return deepFreeze({
    case_id: 'OW06_BRASS_NAMEPLATE_SHUFFLE',
    original,
    mutated,
    semantic_authority_equal:
      original.status === mutated.status &&
      stable(original.observed_value) === stable(mutated.observed_value) &&
      stable(original.supporting_anchor_semantic_fingerprints) === stable(mutated.supporting_anchor_semantic_fingerprints)
  });
}

function ow07(c14) {
  const one = evaluateExogenousAnchorAdmissionCustody({
    c14_result: c14.rooms.nw09.result,
    requested_target: TARGET_ALPHA,
    requested_field: EXISTENCE_FIELD,
    current_epoch: 10,
    anchors: [anchor({ anchor_id: 'ONE' })]
  });
  const duplicate = evaluateExogenousAnchorAdmissionCustody({
    c14_result: c14.rooms.nw09.result,
    requested_target: TARGET_ALPHA,
    requested_field: EXISTENCE_FIELD,
    current_epoch: 10,
    anchors: [anchor({ anchor_id: 'ONE' }), anchor({ anchor_id: 'DUPLICATE' })]
  });
  return deepFreeze({
    case_id: 'OW07_DUPLICATE_TELESCOPE',
    one,
    duplicate,
    semantic_support_count_equal:
      one.supporting_anchor_semantic_fingerprints.length === duplicate.supporting_anchor_semantic_fingerprints.length,
    result_equal: one.status === duplicate.status && stable(one.observed_value) === stable(duplicate.observed_value)
  });
}

function ow08(c14) {
  const result = evaluateExogenousAnchorAdmissionCustody({
    c14_result: c14.rooms.nw09.result,
    requested_target: TARGET_ALPHA,
    requested_field: HONESTY_FIELD,
    current_epoch: 10,
    anchors: [anchor()]
  });
  return deepFreeze({ case_id: 'OW08_TELESCOPE_SEES_ONE_STAR', result });
}

function ow09(c14) {
  const result = evaluateExogenousAnchorAdmissionCustody({
    c14_result: c14.rooms.nw09.result,
    requested_target: TARGET_ALPHA,
    requested_field: EXISTENCE_FIELD,
    current_epoch: 10,
    anchors: [anchor({ active: false })]
  });
  return deepFreeze({ case_id: 'OW09_WINDOW_CLOSED', result });
}

function ow10(c14) {
  const result = evaluateExogenousAnchorAdmissionCustody({
    c14_result: c14.rooms.nw09.result,
    requested_target: TARGET_ALPHA,
    requested_field: EXISTENCE_FIELD,
    current_epoch: 10,
    anchors: []
  });
  return deepFreeze({ case_id: 'OW10_EMPTY_FRAME', result });
}

function ow11(c14) {
  const multi = anchor({
    observations: [
      { field: EXISTENCE_FIELD, value: 'PRE_ENTRY' },
      { field: ORIGIN_FIELD, value: 'EXTERNAL' }
    ]
  });
  const existence = evaluateExogenousAnchorAdmissionCustody({
    c14_result: c14.rooms.nw09.result,
    requested_target: TARGET_ALPHA,
    requested_field: EXISTENCE_FIELD,
    current_epoch: 10,
    anchors: [multi]
  });
  const origin = evaluateExogenousAnchorAdmissionCustody({
    c14_result: c14.rooms.nw09.result,
    requested_target: TARGET_ALPHA,
    requested_field: ORIGIN_FIELD,
    current_epoch: 10,
    anchors: [multi]
  });
  const global = evaluateExogenousAnchorAdmissionCustody({
    c14_result: c14.rooms.nw09.result,
    requested_target: TARGET_ALPHA,
    requested_field: GLOBAL_FIELD,
    current_epoch: 10,
    anchors: [multi]
  });
  return deepFreeze({ case_id: 'OW11_TWO_FIELDS_NOT_WHOLE_WORLD', existence, origin, global });
}

function ow12(c14) {
  const result = evaluateExogenousAnchorAdmissionCustody({
    c14_result: c14.rooms.nw09.result,
    requested_target: TARGET_ALPHA,
    requested_field: HONESTY_FIELD,
    current_epoch: 10,
    anchors: [anchor({ scope_label: 'GLOBAL_PROVENANCE' })]
  });
  return deepFreeze({ case_id: 'OW12_FAKE_PANORAMA', result });
}

export function runPedagogueOpenWindowGauntlet() {
  const c14 = runPedagogueNoWindowGauntlet();
  const rooms = {
    ow01: ow01(c14),
    ow02: ow02(c14),
    ow03: ow03(c14),
    ow04: ow04(c14),
    ow05: ow05(c14),
    ow06: ow06(c14),
    ow07: ow07(c14),
    ow08: ow08(c14),
    ow09: ow09(c14),
    ow10: ow10(c14),
    ow11: ow11(c14),
    ow12: ow12(c14)
  };

  const defeat = [];
  if (rooms.ow01.result.status !== 'ADMIT_SCOPED_EXOGENOUS_OBSERVATION' ||
      rooms.ow01.result.observed_value !== 'PRE_ENTRY') {
    defeat.push('LAWFUL_SCOPED_EXOGENOUS_OBSERVATION_NOT_ADMITTED');
  }
  if (rooms.ow01.result.global_external_provenance_identified) {
    defeat.push('SCOPED_ANCHOR_PROMOTED_TO_GLOBAL_PROVENANCE');
  }
  if (rooms.ow02.result.status !== 'REFUSE_INTERNAL_SELF_ATTESTED_EXTERNAL_PROVENANCE' ||
      rooms.ow02.result.scoped_external_observation_identified) {
    defeat.push('INTERNAL_SELF_ATTESTATION_ACCEPTED_AS_EXOGENOUS_ANCHOR');
  }
  if (rooms.ow03.result.status !== 'REFUSE_EXOGENOUS_ANCHOR_TARGET_MISMATCH' ||
      rooms.ow03.result.scoped_external_observation_identified) {
    defeat.push('ANCHOR_TARGET_MISMATCH_LEAKS_AUTHORITY');
  }
  if (rooms.ow04.result.status !== 'ABSTAIN_NO_CURRENT_EXOGENOUS_ANCHOR_STALE' ||
      rooms.ow04.result.scoped_external_observation_identified) {
    defeat.push('STALE_ANCHOR_RETAINS_CURRENT_AUTHORITY');
  }
  if (rooms.ow05.result.status !== 'ABSTAIN_CONFLICTING_EXOGENOUS_ANCHORS' ||
      rooms.ow05.result.scoped_external_observation_identified) {
    defeat.push('CONFLICTING_EXOGENOUS_VALUES_FORCED_TO_CLOSURE');
  }
  if (!rooms.ow06.semantic_authority_equal) {
    defeat.push('ANCHOR_IDENTIFIER_OR_SERIALIZATION_CHANGES_SEMANTIC_AUTHORITY');
  }
  if (!rooms.ow07.semantic_support_count_equal || !rooms.ow07.result_equal ||
      rooms.ow07.duplicate.anchor_count_is_confidence || rooms.ow07.duplicate.scalar_aggregation_used) {
    defeat.push('DUPLICATE_ANCHOR_AMPLIFIES_SCOPE_OR_CONFIDENCE');
  }
  if (rooms.ow08.result.status !== 'ABSTAIN_EXOGENOUS_ANCHOR_SCOPE_MISMATCH' ||
      rooms.ow08.result.source_honesty_identified) {
    defeat.push('UNOBSERVED_FIELD_INFERRED_FROM_NEIGHBORING_EXTERNAL_OBSERVATION');
  }
  if (rooms.ow09.result.status !== 'ABSTAIN_NO_CURRENT_EXOGENOUS_ANCHOR_INACTIVE' ||
      rooms.ow09.result.scoped_external_observation_identified) {
    defeat.push('INACTIVE_ANCHOR_RETAINS_CURRENT_AUTHORITY');
  }
  if (rooms.ow10.result.status !== 'UNIDENTIFIED_NO_EXOGENOUS_ANCHOR' ||
      rooms.ow10.result.scoped_external_observation_identified) {
    defeat.push('NO_ANCHOR_STATE_INVENTS_EXTERNAL_OBSERVATION');
  }
  if (rooms.ow11.existence.status !== 'ADMIT_SCOPED_EXOGENOUS_OBSERVATION' ||
      rooms.ow11.origin.status !== 'ADMIT_SCOPED_EXOGENOUS_OBSERVATION' ||
      rooms.ow11.global.status !== 'ABSTAIN_EXOGENOUS_ANCHOR_SCOPE_MISMATCH' ||
      rooms.ow11.global.global_external_provenance_identified) {
    defeat.push('MULTI_FIELD_ANCHOR_PROMOTED_TO_GLOBAL_SOURCE_CREDIBILITY');
  }
  if (rooms.ow12.result.status !== 'ABSTAIN_EXOGENOUS_ANCHOR_SCOPE_MISMATCH' ||
      rooms.ow12.result.textual_scope_label_is_authority) {
    defeat.push('TEXTUAL_SCOPE_LABEL_WIDENS_ACTUAL_OBSERVATION_SET');
  }

  const inheritedC14Survived =
    c14.candidate_verdict === 'INTERNAL_PROVENANCE_NON_BOOTSTRAP_CLAIM_CEILING_SURVIVES_BOUNDED_NO_WINDOW';

  return deepFreeze({
    ok: true,
    schema: PEDAGOGUE_EXOGENOUS_ANCHOR_ADMISSION_CUSTODY_SCHEMA,
    inherited_c14_verdict: c14.candidate_verdict,
    inherited_c14_survived: inheritedC14Survived,
    c14_scope_preserved: true,
    candidate: 'E1_EXOGENOUS_ANCHOR_ADMISSION_CUSTODY',
    candidate_status: 'ATTACK_ONLY_NOT_PROMOTED',
    candidate_verdict: defeat.length === 0 && inheritedC14Survived
      ? 'EXOGENOUS_ANCHOR_ADMISSION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_OPEN_WINDOW'
      : 'EXOGENOUS_ANCHOR_ADMISSION_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_OPEN_WINDOW',
    defeat_conditions: defeat,
    rooms,
    synthetic_exogenous_fixture: true,
    live_external_source_adapter: false,
    real_world_external_provenance_claim: false,
    global_external_provenance_identified: false,
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
      'IF_E1_SURVIVES_ATTACK_ANCHOR_ADMISSION_EPISODE_CUSTODY_OR_REAL_ADAPTER_AUTHENTICITY_AS_SEPARATE_HUMAN_GATED_PROGRAMS'
  });
}
