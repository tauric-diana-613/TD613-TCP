import {
  evaluateExogenousAnchorRevisionEpisodeCustody,
  makeSyntheticExogenousAnchorRevision,
  runPedagogueMovingSashGauntlet
} from './pedagogue-exogenous-anchor-revision-episode-custody-moving-sash.js';

export const PEDAGOGUE_ANCHOR_DEPENDENT_WARRANT_REVOCATION_CUSTODY_SCHEMA =
  'td613.pedagogue.anchor-dependent-warrant-revocation-custody-hostile/v0.1';

const SUPPORT_KINDS = new Set(['EXOGENOUS_ANCHOR', 'INDEPENDENT_DECLARED_SUPPORT']);

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

function observationMatches(record, field, requiredValue) {
  return Array.isArray(record?.observations) && record.observations.some(
    observation => observation?.field === field && stable(observation.value) === stable(requiredValue)
  );
}

export function makeSyntheticWarrantSupportLineage({
  lineage_id,
  warrant_key,
  support_kind,
  active = true,
  semantic_anchor_key = null,
  target_fingerprint = null,
  observed_field = null,
  required_value = null,
  independent_support_key = null
} = {}) {
  return deepFreeze({
    lineage_id,
    warrant_key,
    support_kind,
    active,
    semantic_anchor_key,
    target_fingerprint,
    observed_field,
    required_value,
    independent_support_key
  });
}

function lineageSemanticFingerprint(lineage) {
  return stable({
    warrant_key: lineage.warrant_key ?? null,
    support_kind: lineage.support_kind ?? null,
    active: lineage.active === true,
    semantic_anchor_key: lineage.semantic_anchor_key ?? null,
    target_fingerprint: lineage.target_fingerprint ?? null,
    observed_field: lineage.observed_field ?? null,
    required_value: lineage.required_value ?? null,
    independent_support_key: lineage.independent_support_key ?? null
  });
}

function classifyLineage(lineage, warrantKey) {
  if (!lineage || typeof lineage !== 'object') return 'REFUSE_MALFORMED_WARRANT_SUPPORT_LINEAGE';
  if (lineage.warrant_key !== warrantKey) return 'REFUSE_WARRANT_SUPPORT_LINEAGE_WRONG_WARRANT';
  if (!SUPPORT_KINDS.has(lineage.support_kind)) return 'REFUSE_UNKNOWN_WARRANT_SUPPORT_KIND';
  if (typeof lineage.active !== 'boolean') return 'REFUSE_WARRANT_SUPPORT_WITHOUT_ACTIVE_STATE';
  if (lineage.support_kind === 'EXOGENOUS_ANCHOR') {
    if (!lineage.semantic_anchor_key || !lineage.target_fingerprint || !lineage.observed_field) {
      return 'REFUSE_INCOMPLETE_EXOGENOUS_WARRANT_DEPENDENCY';
    }
  }
  if (lineage.support_kind === 'INDEPENDENT_DECLARED_SUPPORT' && !lineage.independent_support_key) {
    return 'REFUSE_INCOMPLETE_INDEPENDENT_WARRANT_DEPENDENCY';
  }
  return 'ADMIT_SYNTHETIC_WARRANT_SUPPORT_LINEAGE';
}

function historicalExogenousMatch(revisions, lineage, currentEpoch) {
  return revisions.some(record =>
    record?.semantic_anchor_key === lineage.semantic_anchor_key &&
    Number.isInteger(record?.epoch) && record.epoch <= currentEpoch &&
    record.active === true &&
    record.target_fingerprint === lineage.target_fingerprint &&
    observationMatches(record, lineage.observed_field, lineage.required_value)
  );
}

function evaluateExogenousLineage({ lineage, e2, revisions, currentEpoch }) {
  const history = e2.semantic_histories.find(item => item.semantic_anchor_key === lineage.semantic_anchor_key) ?? null;
  const historicalSupport = historicalExogenousMatch(revisions, lineage, currentEpoch);

  if (!history) {
    return deepFreeze({
      semantic_fingerprint: lineageSemanticFingerprint(lineage),
      support_kind: lineage.support_kind,
      current_valid: false,
      conflict: false,
      historical_support: historicalSupport,
      status: 'REFUSE_BOUND_EXOGENOUS_ANCHOR_UNOBSERVED'
    });
  }

  if (history.latest_bundle_conflict) {
    return deepFreeze({
      semantic_fingerprint: lineageSemanticFingerprint(lineage),
      support_kind: lineage.support_kind,
      current_valid: false,
      conflict: true,
      historical_support: historicalSupport,
      status: 'ABSTAIN_DEPENDENCY_SUPPORT_CONFLICT'
    });
  }

  const current = history.latest_record;
  if (!current || current.active !== true) {
    return deepFreeze({
      semantic_fingerprint: lineageSemanticFingerprint(lineage),
      support_kind: lineage.support_kind,
      current_valid: false,
      conflict: false,
      historical_support: historicalSupport,
      status: 'REFUSE_BOUND_EXOGENOUS_ANCHOR_NOT_CURRENT'
    });
  }

  if (current.target_fingerprint !== lineage.target_fingerprint) {
    return deepFreeze({
      semantic_fingerprint: lineageSemanticFingerprint(lineage),
      support_kind: lineage.support_kind,
      current_valid: false,
      conflict: false,
      historical_support: historicalSupport,
      status: 'REFUSE_DEPENDENCY_TARGET_MISMATCH'
    });
  }

  if (!observationMatches(current, lineage.observed_field, lineage.required_value)) {
    return deepFreeze({
      semantic_fingerprint: lineageSemanticFingerprint(lineage),
      support_kind: lineage.support_kind,
      current_valid: false,
      conflict: false,
      historical_support: historicalSupport,
      status: 'REFUSE_DEPENDENCY_FIELD_OR_VALUE_MISMATCH'
    });
  }

  return deepFreeze({
    semantic_fingerprint: lineageSemanticFingerprint(lineage),
    support_kind: lineage.support_kind,
    current_valid: true,
    conflict: false,
    historical_support: true,
    status: 'ADMIT_CURRENT_EXOGENOUS_WARRANT_SUPPORT'
  });
}

function evaluateIndependentLineage({ lineage, activeIndependentSupportKeys }) {
  const currentValid = lineage.active === true && activeIndependentSupportKeys.has(lineage.independent_support_key);
  return deepFreeze({
    semantic_fingerprint: lineageSemanticFingerprint(lineage),
    support_kind: lineage.support_kind,
    current_valid: currentValid,
    conflict: false,
    historical_support: currentValid,
    status: currentValid
      ? 'ADMIT_CURRENT_INDEPENDENT_WARRANT_SUPPORT'
      : 'REFUSE_INDEPENDENT_WARRANT_SUPPORT_NOT_CURRENT'
  });
}

export function evaluateAnchorDependentWarrantRevocationCustody({
  warrant_key,
  requested_target,
  requested_field,
  current_epoch = 10,
  revisions = [],
  support_lineages = [],
  active_independent_support_keys = [],
  value_only_snapshot = null
} = {}) {
  const e2 = evaluateExogenousAnchorRevisionEpisodeCustody({
    requested_target,
    requested_field,
    current_epoch,
    revisions
  });
  const activeIndependentSupportKeys = new Set(active_independent_support_keys);
  const admitted = [];
  const rejected = [];

  for (const lineage of support_lineages) {
    const status = classifyLineage(lineage, warrant_key);
    if (status === 'ADMIT_SYNTHETIC_WARRANT_SUPPORT_LINEAGE') admitted.push(lineage);
    else rejected.push(deepFreeze({ lineage, status }));
  }

  const semanticUnique = new Map();
  for (const lineage of admitted) {
    const fingerprint = lineageSemanticFingerprint(lineage);
    if (!semanticUnique.has(fingerprint)) semanticUnique.set(fingerprint, lineage);
  }

  const evaluations = [...semanticUnique.values()].map(lineage => {
    if (lineage.active !== true) {
      return deepFreeze({
        semantic_fingerprint: lineageSemanticFingerprint(lineage),
        support_kind: lineage.support_kind,
        current_valid: false,
        conflict: false,
        historical_support: false,
        status: 'REFUSE_INACTIVE_WARRANT_SUPPORT_LINEAGE'
      });
    }
    return lineage.support_kind === 'EXOGENOUS_ANCHOR'
      ? evaluateExogenousLineage({ lineage, e2, revisions, currentEpoch: current_epoch })
      : evaluateIndependentLineage({ lineage, activeIndependentSupportKeys });
  });

  const valid = evaluations.filter(item => item.current_valid);
  const conflicts = evaluations.filter(item => item.conflict);
  const historical = evaluations.filter(item => item.historical_support);

  const status = valid.length > 0
    ? 'ADMIT_CURRENT_WARRANT_WITH_LAWFUL_SUPPORT'
    : conflicts.length > 0
      ? 'ABSTAIN_WARRANT_SUPPORT_CONFLICT'
      : 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT';

  return deepFreeze({
    schema: PEDAGOGUE_ANCHOR_DEPENDENT_WARRANT_REVOCATION_CUSTODY_SCHEMA,
    candidate: 'E3_ANCHOR_DEPENDENT_WARRANT_REVOCATION_CUSTODY',
    warrant_key,
    status,
    current_epoch,
    current_e2_result: e2,
    support_evaluations: evaluations,
    current_support_count: valid.length,
    current_support_kinds: [...new Set(valid.map(item => item.support_kind))].sort(),
    current_support_semantic_fingerprints: valid.map(item => item.semantic_fingerprint).sort(),
    historical_support_count: historical.length,
    historical_support_semantic_fingerprints: historical.map(item => item.semantic_fingerprint).sort(),
    conflict_count: conflicts.length,
    semantic_support_lineage_count: semanticUnique.size,
    duplicate_lineage_count: admitted.length - semanticUnique.size,
    support_semantic_fingerprint: stable([...semanticUnique.keys()].sort()),
    value_only_snapshot_observed: value_only_snapshot !== null,
    value_only_snapshot_has_dependency_authority: false,
    lineage_identifier_is_authority: false,
    serialization_order_is_authority: false,
    duplicate_lineage_is_confidence: false,
    scalar_aggregation_used: false,
    rejected_lineages: rejected,
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

function rev(overrides = {}) {
  return makeSyntheticExogenousAnchorRevision({
    revision_id: 'R1',
    semantic_anchor_key: 'K_OLD',
    epoch: 1,
    revision_kind: 'ADMIT',
    active: true,
    raw_anchor_id: 'ANCHOR_OLD',
    target_fingerprint: 'TARGET:ALPHA',
    observations: [{ field: 'SOURCE_EXISTENCE_RELATIVE_TO_PROTOCOL', value: 'PRE_ENTRY' }],
    source_kind: 'ADMITTED_EXOGENOUS_OBSERVATION',
    ...overrides
  });
}

function exo(overrides = {}) {
  return makeSyntheticWarrantSupportLineage({
    lineage_id: 'L1',
    warrant_key: 'W_ALPHA',
    support_kind: 'EXOGENOUS_ANCHOR',
    active: true,
    semantic_anchor_key: 'K_OLD',
    target_fingerprint: 'TARGET:ALPHA',
    observed_field: 'SOURCE_EXISTENCE_RELATIVE_TO_PROTOCOL',
    required_value: 'PRE_ENTRY',
    ...overrides
  });
}

function independent(overrides = {}) {
  return makeSyntheticWarrantSupportLineage({
    lineage_id: 'I1',
    warrant_key: 'W_ALPHA',
    support_kind: 'INDEPENDENT_DECLARED_SUPPORT',
    active: true,
    independent_support_key: 'SYNTHETIC_INDEPENDENT_ALPHA',
    ...overrides
  });
}

function evaluateCase({ current_epoch = 4, revisions = [], support_lineages = [], active_independent_support_keys = [], value_only_snapshot = null } = {}) {
  return evaluateAnchorDependentWarrantRevocationCustody({
    warrant_key: 'W_ALPHA',
    requested_target: 'TARGET:ALPHA',
    requested_field: 'SOURCE_EXISTENCE_RELATIVE_TO_PROTOCOL',
    current_epoch,
    revisions,
    support_lineages,
    active_independent_support_keys,
    value_only_snapshot
  });
}

function bl01() {
  const revisions = [
    rev({ revision_id: 'A1', epoch: 1 }),
    rev({ revision_id: 'A2', epoch: 2, revision_kind: 'WITHDRAW', active: false })
  ];
  const before = evaluateCase({ current_epoch: 1, revisions, support_lineages: [exo()] });
  const after = evaluateCase({ current_epoch: 3, revisions, support_lineages: [exo()] });
  return deepFreeze({ case_id: 'BL01_LAST_LAMP_OUT', before, after });
}

function bl02() {
  const revisions = [
    rev({ revision_id: 'B1', epoch: 1 }),
    rev({ revision_id: 'B2', epoch: 2, revision_kind: 'WITHDRAW', active: false })
  ];
  const after = evaluateCase({
    current_epoch: 3,
    revisions,
    support_lineages: [exo(), independent()],
    active_independent_support_keys: ['SYNTHETIC_INDEPENDENT_ALPHA']
  });
  return deepFreeze({ case_id: 'BL02_SECOND_LAMP', after });
}

function bl03() {
  const revisions = [
    rev({ revision_id: 'C1', semantic_anchor_key: 'K_OLD', epoch: 1 }),
    rev({ revision_id: 'C2', semantic_anchor_key: 'K_OLD', epoch: 2, revision_kind: 'REPLACE_SEMANTIC', active: false }),
    rev({ revision_id: 'C3', semantic_anchor_key: 'K_NEW', raw_anchor_id: 'ANCHOR_NEW', epoch: 2, revision_kind: 'REPLACE_SEMANTIC', active: true })
  ];
  const result = evaluateCase({ current_epoch: 3, revisions, support_lineages: [exo()] });
  return deepFreeze({
    case_id: 'BL03_SAME_LIGHT_DIFFERENT_LAMP',
    result,
    current_e2_value: result.current_e2_result.current_e1_result.observed_value,
    old_anchor_current: result.current_e2_result.current_semantic_anchor_keys.includes('K_OLD'),
    replacement_anchor_current: result.current_e2_result.current_semantic_anchor_keys.includes('K_NEW')
  });
}

function bl04() {
  const revisions = [
    rev({ revision_id: 'D1', semantic_anchor_key: 'K_OLD', epoch: 2, active: true }),
    rev({ revision_id: 'D2', semantic_anchor_key: 'K_OLD', epoch: 2, revision_kind: 'WITHDRAW', active: false })
  ];
  return deepFreeze({ case_id: 'BL04_TWO_WINDOWS_DISAGREE', result: evaluateCase({ current_epoch: 3, revisions, support_lineages: [exo()] }) });
}

function bl05() {
  const revisions = [rev({ revision_id: 'E1', epoch: 1 })];
  const wrongTarget = evaluateCase({
    current_epoch: 2,
    revisions,
    support_lineages: [exo({ lineage_id: 'T', target_fingerprint: 'TARGET:BETA' })]
  });
  const wrongField = evaluateCase({
    current_epoch: 2,
    revisions,
    support_lineages: [exo({ lineage_id: 'F', observed_field: 'SOURCE_HONESTY' })]
  });
  const wrongValue = evaluateCase({
    current_epoch: 2,
    revisions,
    support_lineages: [exo({ lineage_id: 'V', required_value: 'POST_ENTRY' })]
  });
  return deepFreeze({ case_id: 'BL05_WRONG_COLOR_BULB', wrongTarget, wrongField, wrongValue });
}

function bl06() {
  const revisions = [rev({ revision_id: 'F1', epoch: 1 })];
  const one = evaluateCase({ current_epoch: 2, revisions, support_lineages: [exo({ lineage_id: 'ONE' })] });
  const duplicate = evaluateCase({ current_epoch: 2, revisions, support_lineages: [exo({ lineage_id: 'ONE' }), exo({ lineage_id: 'DUP' })] });
  return deepFreeze({
    case_id: 'BL06_CHANDELIER_COUNTING',
    one,
    duplicate,
    authority_equal: one.status === duplicate.status,
    semantic_support_count_equal: one.semantic_support_lineage_count === duplicate.semantic_support_lineage_count,
    support_fingerprint_equal: one.support_semantic_fingerprint === duplicate.support_semantic_fingerprint
  });
}

function bl07() {
  const revisions = [rev({ revision_id: 'G1', epoch: 1 })];
  const originalLineages = [exo({ lineage_id: 'AAA' }), independent({ lineage_id: 'BBB' })];
  const renamedReversed = [...originalLineages].reverse().map((lineage, index) =>
    makeSyntheticWarrantSupportLineage({ ...clone(lineage), lineage_id: `RENAMED_${index}` })
  );
  const original = evaluateCase({
    current_epoch: 2,
    revisions,
    support_lineages: originalLineages,
    active_independent_support_keys: ['SYNTHETIC_INDEPENDENT_ALPHA']
  });
  const mutated = evaluateCase({
    current_epoch: 2,
    revisions,
    support_lineages: renamedReversed,
    active_independent_support_keys: ['SYNTHETIC_INDEPENDENT_ALPHA']
  });
  return deepFreeze({
    case_id: 'BL07_LAMP_TAGS_SHUFFLED',
    original,
    mutated,
    authority_equal: original.status === mutated.status,
    current_support_fingerprint_equal: stable(original.current_support_semantic_fingerprints) === stable(mutated.current_support_semantic_fingerprints),
    support_semantic_fingerprint_equal: original.support_semantic_fingerprint === mutated.support_semantic_fingerprint
  });
}

function bl08() {
  const result = bl01().after;
  return deepFreeze({
    case_id: 'BL08_AFTERIMAGE',
    result,
    historical_support_preserved: result.historical_support_count === 1 && result.current_support_count === 0
  });
}

function bl09() {
  const revisions = [
    rev({ revision_id: 'H1', semantic_anchor_key: 'K_ONE', raw_anchor_id: 'A_ONE', epoch: 1 }),
    rev({ revision_id: 'H2', semantic_anchor_key: 'K_TWO', raw_anchor_id: 'A_TWO', epoch: 1 }),
    rev({ revision_id: 'H3', semantic_anchor_key: 'K_ONE', raw_anchor_id: 'A_ONE', epoch: 2, revision_kind: 'WITHDRAW', active: false })
  ];
  const supportOne = exo({ lineage_id: 'L_ONE', semantic_anchor_key: 'K_ONE' });
  const supportTwo = exo({ lineage_id: 'L_TWO', semantic_anchor_key: 'K_TWO' });
  const result = evaluateCase({ current_epoch: 3, revisions, support_lineages: [supportOne, supportTwo] });
  return deepFreeze({
    case_id: 'BL09_ONE_OF_TWO_ANCHORS_LEAVES',
    result,
    surviving_semantic_key_current: result.current_e2_result.current_semantic_anchor_keys.includes('K_TWO'),
    withdrawn_semantic_key_current: result.current_e2_result.current_semantic_anchor_keys.includes('K_ONE')
  });
}

function bl10() {
  const result = evaluateCase({
    current_epoch: 3,
    revisions: [],
    support_lineages: [exo()],
    value_only_snapshot: { field: 'SOURCE_EXISTENCE_RELATIVE_TO_PROTOCOL', value: 'PRE_ENTRY' }
  });
  return deepFreeze({ case_id: 'BL10_PHOTOGRAPH_OF_LIGHT', result });
}

function bl11() {
  const ledger = deepFreeze({ support_lineages: [exo()] });
  let status = 'SEALED_WARRANT_DEPENDENCY_LEDGER_IMMUTABLE';
  try {
    ledger.support_lineages.push(independent());
    status = 'SEALED_WARRANT_DEPENDENCY_LEDGER_MUTATED';
  } catch {
    status = 'SEALED_WARRANT_DEPENDENCY_LEDGER_IMMUTABLE';
  }
  return deepFreeze({ case_id: 'BL11_POSTHOC_REWIRING', status, ledger });
}

function bl12() {
  const revisions = [rev({ revision_id: 'J1', epoch: 1 })];
  const result = evaluateCase({ current_epoch: 2, revisions, support_lineages: [exo()] });
  return deepFreeze({
    case_id: 'BL12_E1_E2_CONTROL',
    result,
    current_e2_status: result.current_e2_result.current_e1_result.status,
    current_e2_value: result.current_e2_result.current_e1_result.observed_value
  });
}

export function runPedagogueBorrowedLightGauntlet() {
  const e2 = runPedagogueMovingSashGauntlet();
  const rooms = deepFreeze({
    bl01: bl01(),
    bl02: bl02(),
    bl03: bl03(),
    bl04: bl04(),
    bl05: bl05(),
    bl06: bl06(),
    bl07: bl07(),
    bl08: bl08(),
    bl09: bl09(),
    bl10: bl10(),
    bl11: bl11(),
    bl12: bl12()
  });

  const defeatConditions = [];
  if (!(rooms.bl01.before.status === 'ADMIT_CURRENT_WARRANT_WITH_LAWFUL_SUPPORT' && rooms.bl01.after.status === 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT')) {
    defeatConditions.push('SOLE_WITHDRAWN_ANCHOR_RETAINS_CURRENT_WARRANT');
  }
  if (!(rooms.bl02.after.status === 'ADMIT_CURRENT_WARRANT_WITH_LAWFUL_SUPPORT' && rooms.bl02.after.current_support_kinds.length === 1 && rooms.bl02.after.current_support_kinds[0] === 'INDEPENDENT_DECLARED_SUPPORT')) {
    defeatConditions.push('INDEPENDENT_ALTERNATE_SUPPORT_FALSELY_REVOKED');
  }
  if (!(rooms.bl03.current_e2_value === 'PRE_ENTRY' && rooms.bl03.old_anchor_current === false && rooms.bl03.replacement_anchor_current === true && rooms.bl03.result.status === 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT')) {
    defeatConditions.push('SEMANTIC_REPLACEMENT_LAUNDERS_DEPENDENCY_CONTINUITY');
  }
  if (rooms.bl04.result.status !== 'ABSTAIN_WARRANT_SUPPORT_CONFLICT') {
    defeatConditions.push('CONFLICTING_ANCHOR_FORCES_WARRANT_AUTHORITY');
  }
  if (![rooms.bl05.wrongTarget, rooms.bl05.wrongField, rooms.bl05.wrongValue].every(result => result.status === 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT')) {
    defeatConditions.push('TARGET_FIELD_OR_VALUE_MISMATCH_COUNTS_AS_SUPPORT');
  }
  if (!(rooms.bl06.authority_equal && rooms.bl06.semantic_support_count_equal && rooms.bl06.support_fingerprint_equal && rooms.bl06.duplicate.duplicate_lineage_is_confidence === false)) {
    defeatConditions.push('DUPLICATE_LINEAGE_AMPLIFIES_SUPPORT_OR_CONFIDENCE');
  }
  if (!(rooms.bl07.authority_equal && rooms.bl07.current_support_fingerprint_equal && rooms.bl07.support_semantic_fingerprint_equal && rooms.bl07.mutated.lineage_identifier_is_authority === false && rooms.bl07.mutated.serialization_order_is_authority === false)) {
    defeatConditions.push('LINEAGE_IDENTIFIER_OR_SERIALIZATION_CHANGES_AUTHORITY');
  }
  if (!rooms.bl08.historical_support_preserved) {
    defeatConditions.push('HISTORICAL_SUPPORT_ERASED_ON_CURRENT_REVOCATION');
  }
  if (!(rooms.bl09.result.status === 'ADMIT_CURRENT_WARRANT_WITH_LAWFUL_SUPPORT' && rooms.bl09.result.current_support_count === 1 && rooms.bl09.surviving_semantic_key_current && !rooms.bl09.withdrawn_semantic_key_current)) {
    defeatConditions.push('SURVIVING_EXOGENOUS_LINEAGE_NOT_PRESERVED');
  }
  if (!(rooms.bl10.result.status === 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT' && rooms.bl10.result.value_only_snapshot_observed && rooms.bl10.result.value_only_snapshot_has_dependency_authority === false)) {
    defeatConditions.push('VALUE_ONLY_SNAPSHOT_SATISFIES_BOUND_ANCHOR_DEPENDENCY');
  }
  if (rooms.bl11.status !== 'SEALED_WARRANT_DEPENDENCY_LEDGER_IMMUTABLE') {
    defeatConditions.push('SEALED_DEPENDENCY_LEDGER_MUTATED');
  }
  if (!(rooms.bl12.result.status === 'ADMIT_CURRENT_WARRANT_WITH_LAWFUL_SUPPORT' && rooms.bl12.current_e2_status === 'ADMIT_SCOPED_EXOGENOUS_OBSERVATION' && rooms.bl12.current_e2_value === 'PRE_ENTRY')) {
    defeatConditions.push('E3_CHANGES_E1_OR_E2_SCOPED_SEMANTICS');
  }

  const candidateVerdict = defeatConditions.length === 0
    ? 'ANCHOR_DEPENDENT_WARRANT_REVOCATION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_BORROWED_LIGHT'
    : 'ANCHOR_DEPENDENT_WARRANT_REVOCATION_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_BORROWED_LIGHT';

  return deepFreeze({
    ok: true,
    schema: PEDAGOGUE_ANCHOR_DEPENDENT_WARRANT_REVOCATION_CUSTODY_SCHEMA,
    inherited_e1_verdict: 'EXOGENOUS_ANCHOR_ADMISSION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_OPEN_WINDOW',
    inherited_e2_verdict: e2.candidate_verdict,
    inherited_e1_e2_jurisdiction_preserved: true,
    direct_dependency_scope_only: true,
    candidate: 'E3_ANCHOR_DEPENDENT_WARRANT_REVOCATION_CUSTODY',
    candidate_status: 'ATTACK_ONLY_NOT_PROMOTED',
    candidate_verdict: candidateVerdict,
    defeat_conditions: defeatConditions,
    rooms,
    synthetic_exogenous_fixture: true,
    live_external_source_adapter: false,
    real_world_external_provenance_claim: false,
    multi_hop_dependency_closure: false,
    semantic_replacement_bridge_law: 'HELD_NOT_OPENED_HERE',
    scalar_aggregation_used: false,
    H2: 'HELD_NOT_TESTED_HERE',
    H3: 'HELD_NOT_TESTED_HERE',
    intersections: 'HELD_NOT_OPENED_HERE',
    APERTURE_V32_REPLAY_STABILITY: 'HELD_NOT_YET_WITNESSED',
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
