import {
  evaluateExogenousAnchorAdmissionCustody,
  makeSyntheticExogenousAnchor,
  runPedagogueOpenWindowGauntlet
} from './pedagogue-exogenous-anchor-admission-custody-open-window.js';

export const PEDAGOGUE_EXOGENOUS_ANCHOR_REVISION_EPISODE_CUSTODY_SCHEMA =
  'td613.pedagogue.exogenous-anchor-revision-episode-custody-hostile/v0.1';

const ALLOWED_KINDS = new Set([
  'ADMIT',
  'WITHDRAW',
  'REINTRODUCE',
  'RENAME_CONTINUOUS',
  'REPLACE_SEMANTIC'
]);

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

function semanticState(record) {
  return {
    semantic_anchor_key: record.semantic_anchor_key ?? null,
    active: record.active === true,
    revision_kind: record.revision_kind ?? null,
    target_fingerprint: record.target_fingerprint ?? null,
    observations: normalizeObservations(record.observations),
    source_kind: record.source_kind ?? null
  };
}

function stateFingerprint(record) {
  const state = semanticState(record);
  return stable({
    active: state.active,
    target_fingerprint: state.target_fingerprint,
    observations: state.observations,
    source_kind: state.source_kind
  });
}

function historyEventFingerprint(record) {
  return stable({
    semantic_anchor_key: record.semantic_anchor_key ?? null,
    epoch: record.epoch ?? null,
    revision_kind: record.revision_kind ?? null,
    active: record.active === true,
    target_fingerprint: record.target_fingerprint ?? null,
    observations: normalizeObservations(record.observations),
    source_kind: record.source_kind ?? null
  });
}

export function makeSyntheticExogenousAnchorRevision({
  revision_id,
  semantic_anchor_key,
  epoch,
  revision_kind,
  active,
  raw_anchor_id,
  target_fingerprint,
  observations = [],
  source_kind = 'ADMITTED_EXOGENOUS_OBSERVATION'
} = {}) {
  return deepFreeze({
    revision_id,
    semantic_anchor_key,
    epoch,
    revision_kind,
    active,
    raw_anchor_id,
    target_fingerprint,
    observations: normalizeObservations(observations),
    source_kind
  });
}

function classifyRevision(record) {
  if (!record || typeof record !== 'object') return 'REFUSE_MALFORMED_EXOGENOUS_ANCHOR_REVISION';
  if (typeof record.semantic_anchor_key !== 'string' || !record.semantic_anchor_key) {
    return 'REFUSE_REVISION_WITHOUT_SEMANTIC_ANCHOR_KEY';
  }
  if (!Number.isInteger(record.epoch) || record.epoch < 0) {
    return 'REFUSE_REVISION_WITH_INVALID_EPOCH';
  }
  if (!ALLOWED_KINDS.has(record.revision_kind)) {
    return 'REFUSE_UNRECOGNIZED_EXOGENOUS_ANCHOR_REVISION_KIND';
  }
  if (typeof record.active !== 'boolean') {
    return 'REFUSE_REVISION_WITHOUT_ACTIVE_STATE';
  }
  if (typeof record.raw_anchor_id !== 'string' || !record.raw_anchor_id) {
    return 'REFUSE_REVISION_WITHOUT_RAW_ANCHOR_ID';
  }
  if (record.active === true) {
    if (record.source_kind !== 'ADMITTED_EXOGENOUS_OBSERVATION') {
      return 'REFUSE_ACTIVE_REVISION_WITH_UNADMITTED_SOURCE_KIND';
    }
    if (typeof record.target_fingerprint !== 'string' || !record.target_fingerprint) {
      return 'REFUSE_ACTIVE_REVISION_WITHOUT_TARGET';
    }
    if (normalizeObservations(record.observations).length === 0) {
      return 'REFUSE_ACTIVE_REVISION_WITHOUT_OBSERVATION';
    }
  }
  return 'ADMIT_SYNTHETIC_EXOGENOUS_ANCHOR_REVISION_RECORD';
}

function groupAdmitted(records, currentEpoch) {
  const admitted = [];
  const rejected = [];
  for (const record of records) {
    const status = classifyRevision(record);
    const annotated = deepFreeze({ record, status });
    if (status === 'ADMIT_SYNTHETIC_EXOGENOUS_ANCHOR_REVISION_RECORD' && record.epoch <= currentEpoch) {
      admitted.push(record);
    } else if (status !== 'ADMIT_SYNTHETIC_EXOGENOUS_ANCHOR_REVISION_RECORD') {
      rejected.push(annotated);
    }
  }
  return { admitted, rejected };
}

function buildEpochBundles(admitted) {
  const groups = new Map();
  for (const record of admitted) {
    const key = `${record.semantic_anchor_key}\u0000${record.epoch}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(record);
  }

  const bundles = [];
  for (const records of groups.values()) {
    const semanticKey = records[0].semantic_anchor_key;
    const epoch = records[0].epoch;
    const distinctStates = [...new Set(records.map(stateFingerprint))].sort();
    const distinctHistoryEvents = [...new Set(records.map(historyEventFingerprint))].sort();
    const conflict = distinctStates.length > 1;
    const representative = conflict
      ? null
      : [...records].sort((a, b) => historyEventFingerprint(a).localeCompare(historyEventFingerprint(b)))[0];
    bundles.push(deepFreeze({
      semantic_anchor_key: semanticKey,
      epoch,
      conflict,
      distinct_state_count: distinctStates.length,
      duplicate_record_count: records.length - distinctHistoryEvents.length,
      distinct_history_event_count: distinctHistoryEvents.length,
      representative,
      state_fingerprints: distinctStates,
      history_event_fingerprints: distinctHistoryEvents
    }));
  }

  return bundles.sort((a, b) =>
    a.semantic_anchor_key.localeCompare(b.semantic_anchor_key) || a.epoch - b.epoch
  );
}

function summarizeSemanticHistory(bundles) {
  const byKey = new Map();
  for (const bundle of bundles) {
    if (!byKey.has(bundle.semantic_anchor_key)) byKey.set(bundle.semantic_anchor_key, []);
    byKey.get(bundle.semantic_anchor_key).push(bundle);
  }

  const summaries = [];
  for (const [semanticKey, keyBundles] of byKey.entries()) {
    const ordered = [...keyBundles].sort((a, b) => a.epoch - b.epoch);
    let episodeCount = 0;
    let priorActive = false;
    let conflict = false;
    const eventTrace = [];

    for (const bundle of ordered) {
      if (bundle.conflict) {
        conflict = true;
        eventTrace.push({ epoch: bundle.epoch, status: 'CONFLICTING_SAME_EPOCH_REVISION_BUNDLE' });
        continue;
      }
      const active = bundle.representative.active === true;
      if (active && !priorActive) episodeCount += 1;
      eventTrace.push({
        epoch: bundle.epoch,
        revision_kind: bundle.representative.revision_kind,
        active,
        raw_anchor_id: bundle.representative.raw_anchor_id,
        state_fingerprint: stateFingerprint(bundle.representative)
      });
      priorActive = active;
    }

    const latest = ordered[ordered.length - 1] ?? null;
    summaries.push(deepFreeze({
      semantic_anchor_key: semanticKey,
      episode_count: conflict ? null : episodeCount,
      conflict_present: conflict,
      latest_epoch: latest?.epoch ?? null,
      latest_bundle_conflict: latest?.conflict ?? false,
      latest_record: latest && !latest.conflict ? latest.representative : null,
      event_trace: eventTrace
    }));
  }

  return summaries.sort((a, b) => a.semantic_anchor_key.localeCompare(b.semantic_anchor_key));
}

function revisionHistoryFingerprint(bundles) {
  return stable(
    bundles.map(bundle => ({
      semantic_anchor_key: bundle.semantic_anchor_key,
      epoch: bundle.epoch,
      conflict: bundle.conflict,
      state_fingerprints: bundle.state_fingerprints,
      history_event_fingerprints: bundle.history_event_fingerprints
    }))
  );
}

function activeCurrentAnchors(summaries) {
  return summaries
    .filter(summary => !summary.latest_bundle_conflict && summary.latest_record?.active === true)
    .map(summary => makeSyntheticExogenousAnchor({
      anchor_id: summary.latest_record.raw_anchor_id,
      target_fingerprint: summary.latest_record.target_fingerprint,
      observations: summary.latest_record.observations,
      source_kind: summary.latest_record.source_kind,
      active: true,
      valid_from_epoch: summary.latest_record.epoch,
      valid_through_epoch: null
    }));
}

export function evaluateExogenousAnchorRevisionEpisodeCustody({
  requested_target,
  requested_field,
  current_epoch = 10,
  revisions = []
} = {}) {
  const records = [...revisions];
  const { admitted, rejected } = groupAdmitted(records, current_epoch);
  const bundles = buildEpochBundles(admitted);
  const summaries = summarizeSemanticHistory(bundles);
  const latestConflicts = summaries.filter(summary => summary.latest_bundle_conflict);
  const currentAnchors = activeCurrentAnchors(summaries);
  const currentE1 = evaluateExogenousAnchorAdmissionCustody({
    requested_target,
    requested_field,
    current_epoch,
    anchors: currentAnchors
  });

  const status = latestConflicts.length > 0
    ? 'ABSTAIN_CONFLICTING_SAME_EPOCH_EXOGENOUS_ANCHOR_REVISION'
    : currentE1.status;

  return deepFreeze({
    schema: PEDAGOGUE_EXOGENOUS_ANCHOR_REVISION_EPISODE_CUSTODY_SCHEMA,
    candidate: 'E2_EXOGENOUS_ANCHOR_REVISION_EPISODE_CUSTODY',
    status,
    current_epoch,
    requested_target,
    requested_field,
    current_e1_result: currentE1,
    current_semantic_anchor_keys: summaries
      .filter(summary => !summary.latest_bundle_conflict && summary.latest_record?.active === true)
      .map(summary => summary.semantic_anchor_key)
      .sort(),
    semantic_histories: summaries,
    revision_history_fingerprint: revisionHistoryFingerprint(bundles),
    admitted_revision_count: admitted.length,
    rejected_revisions: rejected,
    epoch_bundle_count: bundles.length,
    latest_conflict_count: latestConflicts.length,
    current_snapshot_has_revision_history_authority: false,
    revision_identifier_is_authority: false,
    serialization_order_is_authority: false,
    duplicate_revision_is_confidence: false,
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

function episodeCount(result, semanticKey) {
  return result.semantic_histories.find(item => item.semantic_anchor_key === semanticKey)?.episode_count ?? null;
}

function currentEquivalent(a, b) {
  return a.current_e1_result.status === b.current_e1_result.status &&
    stable(a.current_e1_result.observed_value) === stable(b.current_e1_result.observed_value) &&
    a.current_e1_result.global_external_provenance_identified === b.current_e1_result.global_external_provenance_identified;
}

function rev(overrides = {}) {
  return makeSyntheticExogenousAnchorRevision({
    revision_id: 'R1',
    semantic_anchor_key: 'K_ALPHA',
    epoch: 1,
    revision_kind: 'ADMIT',
    active: true,
    raw_anchor_id: 'ANCHOR_ALPHA',
    target_fingerprint: 'TARGET:ALPHA',
    observations: [{ field: 'SOURCE_EXISTENCE_RELATIVE_TO_PROTOCOL', value: 'PRE_ENTRY' }],
    source_kind: 'ADMITTED_EXOGENOUS_OBSERVATION',
    ...overrides
  });
}

function ms01() {
  const continuous = evaluateExogenousAnchorRevisionEpisodeCustody({
    requested_target: 'TARGET:ALPHA',
    requested_field: 'SOURCE_EXISTENCE_RELATIVE_TO_PROTOCOL',
    current_epoch: 4,
    revisions: [
      rev({ revision_id: 'A1', epoch: 1 }),
      rev({ revision_id: 'A2', epoch: 2, revision_kind: 'RENAME_CONTINUOUS', raw_anchor_id: 'ANCHOR_ALPHA_RENAMED' })
    ]
  });
  const interrupted = evaluateExogenousAnchorRevisionEpisodeCustody({
    requested_target: 'TARGET:ALPHA',
    requested_field: 'SOURCE_EXISTENCE_RELATIVE_TO_PROTOCOL',
    current_epoch: 4,
    revisions: [
      rev({ revision_id: 'B1', epoch: 1 }),
      rev({ revision_id: 'B2', epoch: 2, revision_kind: 'WITHDRAW', active: false }),
      rev({ revision_id: 'B3', epoch: 3, revision_kind: 'REINTRODUCE', active: true })
    ]
  });
  return deepFreeze({
    case_id: 'MS01_SAME_VIEW_DIFFERENT_HISTORY',
    continuous,
    interrupted,
    current_e1_observation_equal: currentEquivalent(continuous, interrupted),
    history_equal: continuous.revision_history_fingerprint === interrupted.revision_history_fingerprint,
    continuous_episode_count: episodeCount(continuous, 'K_ALPHA'),
    interrupted_episode_count: episodeCount(interrupted, 'K_ALPHA')
  });
}

function ms02() {
  const result = evaluateExogenousAnchorRevisionEpisodeCustody({
    requested_target: 'TARGET:ALPHA',
    requested_field: 'SOURCE_EXISTENCE_RELATIVE_TO_PROTOCOL',
    current_epoch: 4,
    revisions: [
      rev({ revision_id: 'OLD1', semantic_anchor_key: 'K_OLD', epoch: 1, raw_anchor_id: 'ANCHOR_SHARED' }),
      rev({ revision_id: 'OLD2', semantic_anchor_key: 'K_OLD', epoch: 2, revision_kind: 'REPLACE_SEMANTIC', active: false, raw_anchor_id: 'ANCHOR_SHARED' }),
      rev({ revision_id: 'NEW1', semantic_anchor_key: 'K_NEW', epoch: 2, revision_kind: 'REPLACE_SEMANTIC', active: true, raw_anchor_id: 'ANCHOR_SHARED' })
    ]
  });
  return deepFreeze({
    case_id: 'MS02_OLD_PANE_REPLACED',
    result,
    old_current: result.current_semantic_anchor_keys.includes('K_OLD'),
    new_current: result.current_semantic_anchor_keys.includes('K_NEW')
  });
}

function ms03() {
  const result = evaluateExogenousAnchorRevisionEpisodeCustody({
    requested_target: 'TARGET:ALPHA',
    requested_field: 'SOURCE_EXISTENCE_RELATIVE_TO_PROTOCOL',
    current_epoch: 4,
    revisions: [
      rev({ revision_id: 'N1', epoch: 1, raw_anchor_id: 'OLD_NAME' }),
      rev({ revision_id: 'N2', epoch: 2, revision_kind: 'RENAME_CONTINUOUS', raw_anchor_id: 'NEW_NAME' })
    ]
  });
  return deepFreeze({ case_id: 'MS03_NEW_NAME_SAME_PANE', result, episode_count: episodeCount(result, 'K_ALPHA') });
}

function ms04() {
  const result = evaluateExogenousAnchorRevisionEpisodeCustody({
    requested_target: 'TARGET:ALPHA',
    requested_field: 'SOURCE_EXISTENCE_RELATIVE_TO_PROTOCOL',
    current_epoch: 4,
    revisions: [
      rev({ revision_id: 'C1', epoch: 1 }),
      rev({ revision_id: 'C2', epoch: 2, revision_kind: 'WITHDRAW', active: false }),
      rev({ revision_id: 'C3', epoch: 3, revision_kind: 'REINTRODUCE', active: true })
    ]
  });
  return deepFreeze({ case_id: 'MS04_CLOSED_AND_REOPENED', result, episode_count: episodeCount(result, 'K_ALPHA') });
}

function ms05() {
  const result = evaluateExogenousAnchorRevisionEpisodeCustody({
    requested_target: 'TARGET:ALPHA',
    requested_field: 'SOURCE_EXISTENCE_RELATIVE_TO_PROTOCOL',
    current_epoch: 4,
    revisions: [
      rev({ revision_id: 'AAA', epoch: 2, active: true }),
      rev({ revision_id: 'ZZZ', epoch: 2, revision_kind: 'WITHDRAW', active: false })
    ]
  });
  return deepFreeze({ case_id: 'MS05_TWO_HANDS_ON_SASH', result });
}

function ms06() {
  const originalRecords = [
    rev({ revision_id: 'A', epoch: 1 }),
    rev({ revision_id: 'B', epoch: 2, revision_kind: 'RENAME_CONTINUOUS', raw_anchor_id: 'RENAMED' }),
    rev({ revision_id: 'C', epoch: 3, revision_kind: 'WITHDRAW', active: false }),
    rev({ revision_id: 'D', epoch: 4, revision_kind: 'REINTRODUCE', active: true })
  ];
  const mutatedRecords = [...originalRecords].reverse().map((item, index) =>
    makeSyntheticExogenousAnchorRevision({ ...clone(item), revision_id: `MUTATED_${index}` })
  );
  const original = evaluateExogenousAnchorRevisionEpisodeCustody({
    requested_target: 'TARGET:ALPHA', requested_field: 'SOURCE_EXISTENCE_RELATIVE_TO_PROTOCOL', current_epoch: 5, revisions: originalRecords
  });
  const mutated = evaluateExogenousAnchorRevisionEpisodeCustody({
    requested_target: 'TARGET:ALPHA', requested_field: 'SOURCE_EXISTENCE_RELATIVE_TO_PROTOCOL', current_epoch: 5, revisions: mutatedRecords
  });
  return deepFreeze({
    case_id: 'MS06_REVISION_NAMEPLATE_SHUFFLE',
    original,
    mutated,
    current_authority_equal: currentEquivalent(original, mutated),
    episode_count_equal: episodeCount(original, 'K_ALPHA') === episodeCount(mutated, 'K_ALPHA'),
    history_fingerprint_equal: original.revision_history_fingerprint === mutated.revision_history_fingerprint
  });
}

function ms07() {
  const one = evaluateExogenousAnchorRevisionEpisodeCustody({
    requested_target: 'TARGET:ALPHA', requested_field: 'SOURCE_EXISTENCE_RELATIVE_TO_PROTOCOL', current_epoch: 3,
    revisions: [rev({ revision_id: 'ONE', epoch: 1 })]
  });
  const duplicate = evaluateExogenousAnchorRevisionEpisodeCustody({
    requested_target: 'TARGET:ALPHA', requested_field: 'SOURCE_EXISTENCE_RELATIVE_TO_PROTOCOL', current_epoch: 3,
    revisions: [rev({ revision_id: 'ONE', epoch: 1 }), rev({ revision_id: 'DUP', epoch: 1 })]
  });
  return deepFreeze({
    case_id: 'MS07_DUPLICATE_REPAIR_TICKET',
    one,
    duplicate,
    current_equal: currentEquivalent(one, duplicate),
    episode_count_equal: episodeCount(one, 'K_ALPHA') === episodeCount(duplicate, 'K_ALPHA'),
    history_fingerprint_equal: one.revision_history_fingerprint === duplicate.revision_history_fingerprint
  });
}

function ms08() {
  const result = evaluateExogenousAnchorRevisionEpisodeCustody({
    requested_target: 'TARGET:ALPHA', requested_field: 'SOURCE_EXISTENCE_RELATIVE_TO_PROTOCOL', current_epoch: 5,
    revisions: [
      rev({ revision_id: 'NEWER', epoch: 4, revision_kind: 'REINTRODUCE', active: true }),
      rev({ revision_id: 'OLDER_SERIALIZED_LAST', epoch: 2, revision_kind: 'WITHDRAW', active: false })
    ]
  });
  return deepFreeze({ case_id: 'MS08_YESTERDAY_CANNOT_OVERRULE_TODAY', result });
}

function ms09() {
  const before = evaluateExogenousAnchorRevisionEpisodeCustody({
    requested_target: 'TARGET:ALPHA', requested_field: 'SOURCE_EXISTENCE_RELATIVE_TO_PROTOCOL', current_epoch: 1,
    revisions: [rev({ revision_id: 'V1', epoch: 1 })]
  });
  const after = evaluateExogenousAnchorRevisionEpisodeCustody({
    requested_target: 'TARGET:ALPHA', requested_field: 'SOURCE_EXISTENCE_RELATIVE_TO_PROTOCOL', current_epoch: 3,
    revisions: [
      rev({ revision_id: 'V1', epoch: 1 }),
      rev({ revision_id: 'V2', epoch: 2, revision_kind: 'WITHDRAW', active: false })
    ]
  });
  return deepFreeze({
    case_id: 'MS09_REVOKED_VIEW',
    before,
    after,
    historical_event_count_after: after.semantic_histories[0]?.event_trace.length ?? 0
  });
}

function ms10() {
  const full = evaluateExogenousAnchorRevisionEpisodeCustody({
    requested_target: 'TARGET:ALPHA', requested_field: 'SOURCE_EXISTENCE_RELATIVE_TO_PROTOCOL', current_epoch: 4,
    revisions: [
      rev({ revision_id: 'S1', epoch: 1 }),
      rev({ revision_id: 'S2', epoch: 2, revision_kind: 'WITHDRAW', active: false }),
      rev({ revision_id: 'S3', epoch: 3, revision_kind: 'REINTRODUCE', active: true })
    ]
  });
  const latest = full.semantic_histories[0].latest_record;
  const compactAnchor = makeSyntheticExogenousAnchor({
    anchor_id: latest.raw_anchor_id,
    target_fingerprint: latest.target_fingerprint,
    observations: latest.observations,
    source_kind: latest.source_kind,
    active: true,
    valid_from_epoch: latest.epoch
  });
  const compactCurrent = evaluateExogenousAnchorAdmissionCustody({
    requested_target: 'TARGET:ALPHA',
    requested_field: 'SOURCE_EXISTENCE_RELATIVE_TO_PROTOCOL',
    current_epoch: 4,
    anchors: [compactAnchor]
  });
  return deepFreeze({
    case_id: 'MS10_SNAPSHOT_PHOTOGRAPH',
    full,
    compactCurrent,
    current_equal: full.current_e1_result.status === compactCurrent.status && stable(full.current_e1_result.observed_value) === stable(compactCurrent.observed_value),
    compact_revision_history_authority: false
  });
}

function ms11() {
  const sealedLedger = deepFreeze({ records: [rev({ revision_id: 'P1', epoch: 1 })] });
  let status = 'SEALED_EXOGENOUS_ANCHOR_REVISION_LEDGER_IMMUTABLE';
  try {
    sealedLedger.records.push(rev({ revision_id: 'P2', epoch: 2 }));
    status = 'SEALED_EXOGENOUS_ANCHOR_REVISION_LEDGER_MUTATED';
  } catch {
    status = 'SEALED_EXOGENOUS_ANCHOR_REVISION_LEDGER_IMMUTABLE';
  }
  return deepFreeze({ case_id: 'MS11_POSTHOC_CARPENTER', status, sealedLedger });
}

function ms12() {
  const revisions = [rev({ revision_id: 'E1', epoch: 1 })];
  const e2 = evaluateExogenousAnchorRevisionEpisodeCustody({
    requested_target: 'TARGET:ALPHA',
    requested_field: 'SOURCE_EXISTENCE_RELATIVE_TO_PROTOCOL',
    current_epoch: 3,
    revisions
  });
  const directE1 = evaluateExogenousAnchorAdmissionCustody({
    requested_target: 'TARGET:ALPHA',
    requested_field: 'SOURCE_EXISTENCE_RELATIVE_TO_PROTOCOL',
    current_epoch: 3,
    anchors: [makeSyntheticExogenousAnchor({
      anchor_id: 'ANCHOR_ALPHA',
      target_fingerprint: 'TARGET:ALPHA',
      observations: [{ field: 'SOURCE_EXISTENCE_RELATIVE_TO_PROTOCOL', value: 'PRE_ENTRY' }],
      source_kind: 'ADMITTED_EXOGENOUS_OBSERVATION',
      active: true,
      valid_from_epoch: 1
    })]
  });
  return deepFreeze({
    case_id: 'MS12_E1_STILL_SEES_THROUGH_GLASS',
    e2,
    directE1,
    current_semantics_equal:
      e2.current_e1_result.status === directE1.status &&
      stable(e2.current_e1_result.observed_value) === stable(directE1.observed_value) &&
      e2.current_e1_result.global_external_provenance_identified === directE1.global_external_provenance_identified
  });
}

export function runPedagogueMovingSashGauntlet() {
  const e1 = runPedagogueOpenWindowGauntlet();
  const rooms = deepFreeze({
    ms01: ms01(),
    ms02: ms02(),
    ms03: ms03(),
    ms04: ms04(),
    ms05: ms05(),
    ms06: ms06(),
    ms07: ms07(),
    ms08: ms08(),
    ms09: ms09(),
    ms10: ms10(),
    ms11: ms11(),
    ms12: ms12()
  });

  const defeatConditions = [];
  if (!(rooms.ms01.current_e1_observation_equal && !rooms.ms01.history_equal && rooms.ms01.continuous_episode_count === 1 && rooms.ms01.interrupted_episode_count === 2)) {
    defeatConditions.push('SAME_CURRENT_OBSERVATION_ERASES_REVISION_HISTORY');
  }
  if (rooms.ms02.old_current || !rooms.ms02.new_current) {
    defeatConditions.push('SEMANTIC_REPLACEMENT_INHERITS_OLD_AUTHORITY_WITHOUT_CONTINUITY');
  }
  if (rooms.ms03.episode_count !== 1) {
    defeatConditions.push('CONTINUOUS_RENAME_CREATES_FALSE_NEW_EPISODE');
  }
  if (rooms.ms04.episode_count !== 2) {
    defeatConditions.push('REINTRODUCTION_ERASES_SUPPORT_GAP');
  }
  if (rooms.ms05.result.status !== 'ABSTAIN_CONFLICTING_SAME_EPOCH_EXOGENOUS_ANCHOR_REVISION') {
    defeatConditions.push('CONFLICTING_SAME_EPOCH_REVISION_FORCED_BY_IDENTIFIER');
  }
  if (!(rooms.ms06.current_authority_equal && rooms.ms06.episode_count_equal && rooms.ms06.history_fingerprint_equal)) {
    defeatConditions.push('REVISION_IDENTIFIER_OR_SERIALIZATION_CHANGES_AUTHORITY');
  }
  if (!(rooms.ms07.current_equal && rooms.ms07.episode_count_equal && rooms.ms07.history_fingerprint_equal && rooms.ms07.duplicate.duplicate_revision_is_confidence === false)) {
    defeatConditions.push('DUPLICATE_REVISION_AMPLIFIES_HISTORY_OR_CONFIDENCE');
  }
  if (rooms.ms08.result.current_e1_result.status !== 'ADMIT_SCOPED_EXOGENOUS_OBSERVATION') {
    defeatConditions.push('OLDER_REVISION_OVERRIDES_NEWER_SEMANTIC_EPOCH');
  }
  if (!(rooms.ms09.before.current_e1_result.status === 'ADMIT_SCOPED_EXOGENOUS_OBSERVATION' && rooms.ms09.after.current_e1_result.status === 'UNIDENTIFIED_NO_EXOGENOUS_ANCHOR' && rooms.ms09.historical_event_count_after === 2)) {
    defeatConditions.push('WITHDRAWN_ANCHOR_RETAINS_CURRENT_E1_AUTHORITY');
  }
  if (!(rooms.ms10.current_equal && rooms.ms10.compact_revision_history_authority === false && rooms.ms10.full.current_snapshot_has_revision_history_authority === false)) {
    defeatConditions.push('CURRENT_SNAPSHOT_OVERCLAIMS_REVISION_HISTORY');
  }
  if (rooms.ms11.status !== 'SEALED_EXOGENOUS_ANCHOR_REVISION_LEDGER_IMMUTABLE') {
    defeatConditions.push('SEALED_REVISION_LEDGER_MUTATED');
  }
  if (!rooms.ms12.current_semantics_equal) {
    defeatConditions.push('E2_CHANGES_E1_CURRENT_SCOPED_ADMISSION_SEMANTICS');
  }

  const candidateVerdict = defeatConditions.length === 0
    ? 'EXOGENOUS_ANCHOR_REVISION_EPISODE_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_MOVING_SASH'
    : 'EXOGENOUS_ANCHOR_REVISION_EPISODE_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_MOVING_SASH';

  return deepFreeze({
    ok: true,
    schema: PEDAGOGUE_EXOGENOUS_ANCHOR_REVISION_EPISODE_CUSTODY_SCHEMA,
    inherited_e1_verdict: e1.candidate_verdict,
    inherited_e1_jurisdiction_preserved: true,
    e1_revision_custody_overclaim_asserted: false,
    candidate: 'E2_EXOGENOUS_ANCHOR_REVISION_EPISODE_CUSTODY',
    candidate_status: 'ATTACK_ONLY_NOT_PROMOTED',
    candidate_verdict: candidateVerdict,
    defeat_conditions: defeatConditions,
    rooms,
    synthetic_exogenous_fixture: true,
    live_external_source_adapter: false,
    real_world_external_provenance_claim: false,
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
