import {
  evaluateEventMembershipLedger,
  runPedagogueCutAndPasteGauntlet
} from './pedagogue-event-membership-revision-custody-cut-and-paste.js';

export const PEDAGOGUE_MEMBERSHIP_EPOCH_BUNDLE_CUSTODY_SCHEMA =
  'td613.pedagogue.membership-epoch-bundle-custody-hostile/v0.1';

const BLUE = 'ADD_REPLACEMENT_LINEAGE';
const PINK = 'WITHDRAW_PRIMARY_LINEAGE';

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

function rec({ membership_id, raw_event_id, semantic_event_key, epoch, active, revision_kind,
  continuity_from_semantic_event_key = null }) {
  return deepFreeze({ membership_id, raw_event_id, semantic_event_key, epoch, active, revision_kind,
    continuity_from_semantic_event_key });
}

function base() {
  return [
    rec({ membership_id: 'M_PINK_0', raw_event_id: 'PINK', semantic_event_key: PINK,
      epoch: 0, active: true, revision_kind: 'ADMIT' }),
    rec({ membership_id: 'M_BLUE_0', raw_event_id: 'BLUE', semantic_event_key: BLUE,
      epoch: 0, active: true, revision_kind: 'ADMIT' })
  ];
}

function bundleStatus(records) {
  const dispositions = [...new Set(records.map(record => record.active))];
  if (dispositions.length > 1) return 'ABSTAIN_CONFLICTING_SAME_EPOCH_EVENT_MEMBERSHIP';
  return dispositions[0]
    ? 'UNIFORM_ACTIVE_MEMBERSHIP_EPOCH_BUNDLE'
    : 'UNIFORM_INACTIVE_MEMBERSHIP_EPOCH_BUNDLE';
}

function epochTrace(validRecords) {
  const bySemantic = new Map();
  for (const record of validRecords) {
    if (!bySemantic.has(record.semantic_event_key)) bySemantic.set(record.semantic_event_key, new Map());
    const byEpoch = bySemantic.get(record.semantic_event_key);
    if (!byEpoch.has(record.epoch)) byEpoch.set(record.epoch, []);
    byEpoch.get(record.epoch).push(record);
  }

  const traces = [];
  for (const [semantic_event_key, byEpoch] of [...bySemantic.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    let priorActive = false;
    let episodeCount = 0;
    let episodeCountIdentified = true;
    const epochs = [];
    for (const [epoch, records] of [...byEpoch.entries()].sort(([a], [b]) => a - b)) {
      const status = bundleStatus(records);
      const conflict = status === 'ABSTAIN_CONFLICTING_SAME_EPOCH_EVENT_MEMBERSHIP';
      const currentActive = conflict ? null : records[0].active;
      if (conflict) {
        episodeCountIdentified = false;
        priorActive = null;
      } else if (currentActive) {
        if (priorActive === false) episodeCount += 1;
        else if (priorActive === null) episodeCountIdentified = false;
        priorActive = true;
      } else {
        priorActive = false;
      }
      epochs.push(deepFreeze({
        semantic_event_key,
        epoch,
        record_count: records.length,
        status,
        current_active: currentActive,
        record_ids: [...records.map(record => record.membership_id)].sort()
      }));
    }
    traces.push(deepFreeze({ semantic_event_key, episode_count: episodeCount,
      episode_count_identified: episodeCountIdentified, epochs }));
  }
  return deepFreeze(traces);
}

export function evaluateMembershipEpochBundleCustody({ membership_records = [] } = {}) {
  const inherited = evaluateEventMembershipLedger({ membership_records });
  const valid = inherited.valid_records;
  const maxEpochBySemantic = new Map();
  for (const record of valid) {
    const prior = maxEpochBySemantic.get(record.semantic_event_key);
    if (prior === undefined || record.epoch > prior) maxEpochBySemantic.set(record.semantic_event_key, record.epoch);
  }

  const bundleMap = new Map();
  for (const record of valid) {
    if (record.epoch !== maxEpochBySemantic.get(record.semantic_event_key)) continue;
    const key = `${record.semantic_event_key}\u0000${record.epoch}`;
    if (!bundleMap.has(key)) bundleMap.set(key, []);
    bundleMap.get(key).push(record);
  }

  const bundles = [...bundleMap.entries()].map(([key, records]) => {
    const [semantic_event_key, epochText] = key.split('\u0000');
    const status = bundleStatus(records);
    const conflict = status === 'ABSTAIN_CONFLICTING_SAME_EPOCH_EVENT_MEMBERSHIP';
    return deepFreeze({
      semantic_event_key,
      epoch: Number(epochText),
      record_count: records.length,
      records: [...records].sort((a, b) => a.membership_id.localeCompare(b.membership_id)),
      active_dispositions: [...new Set(records.map(record => record.active))].sort(),
      material_disposition_status: status,
      current_membership_identified: !conflict,
      current_active: conflict ? null : records[0].active
    });
  }).sort((a, b) => a.semantic_event_key.localeCompare(b.semantic_event_key));

  const sameEpochConflicts = bundles.filter(bundle => !bundle.current_membership_identified);
  const currentSemanticEvents = bundles
    .filter(bundle => bundle.current_membership_identified && bundle.current_active)
    .map(bundle => bundle.semantic_event_key)
    .sort();

  const status = inherited.status === 'ABSTAIN_CONFLICTING_EVENT_MEMBERSHIP'
    ? 'ABSTAIN_CONFLICTING_EVENT_MEMBERSHIP'
    : sameEpochConflicts.length > 0
      ? 'ABSTAIN_CONFLICTING_SAME_EPOCH_EVENT_MEMBERSHIP'
      : 'MEMBERSHIP_EPOCH_BUNDLE_CUSTODY_EVALUATED';

  return deepFreeze({
    schema: PEDAGOGUE_MEMBERSHIP_EPOCH_BUNDLE_CUSTODY_SCHEMA,
    candidate: 'C9_MEMBERSHIP_EPOCH_BUNDLE_CUSTODY',
    status,
    inherited_c8_ledger_status: inherited.status,
    valid_records: valid,
    rejected_records: inherited.rejected_records,
    inherited_raw_binding_conflicts: inherited.conflicts,
    latest_epoch_bundles: bundles,
    current_semantic_events: currentSemanticEvents,
    current_event_set_fingerprint: stable(currentSemanticEvents),
    epoch_traces: epochTrace(valid),
    membership_id_authority: false,
    input_order_authority: false,
    revision_kind_lexical_authority: false,
    scalar_aggregation_used: false,
    promotion_authority: false
  });
}

export function sealMembershipEpochBundle(value) {
  return deepFreeze(clone(value));
}

export function requestSealedMembershipEpochBundleMutation(sealedBundle, replacement) {
  if (!Object.isFrozen(sealedBundle)) {
    return deepFreeze({ status: 'REJECT_UNSEALED_MEMBERSHIP_EPOCH_BUNDLE_MUTATION_TARGET', mutated: false });
  }
  return deepFreeze({
    status: 'SEALED_MEMBERSHIP_EPOCH_BUNDLE_IMMUTABLE',
    mutated: false,
    requested_replacement: clone(replacement ?? [])
  });
}

function tsmm01() {
  const records = [...base(),
    rec({ membership_id: 'AAA_WITHDRAW', raw_event_id: 'BLUE', semantic_event_key: BLUE,
      epoch: 1, active: false, revision_kind: 'WITHDRAW' }),
    rec({ membership_id: 'ZZZ_ADMIT', raw_event_id: 'BLUE', semantic_event_key: BLUE,
      epoch: 1, active: true, revision_kind: 'ADMIT' })
  ];
  const c8 = evaluateEventMembershipLedger({ membership_records: records });
  const c9 = evaluateMembershipEpochBundleCustody({ membership_records: records });
  return deepFreeze({ case_id: 'TSMM01_TWO_STAMPS_ALPHABET_WINS', records, c8, c9,
    c8_blue_current: c8.current_semantic_events.includes(BLUE),
    c9_blue_bundle: c9.latest_epoch_bundles.find(bundle => bundle.semantic_event_key === BLUE) });
}

function tsmm02() {
  const records = [...base(),
    rec({ membership_id: 'ZZZ_WITHDRAW', raw_event_id: 'BLUE', semantic_event_key: BLUE,
      epoch: 1, active: false, revision_kind: 'WITHDRAW' }),
    rec({ membership_id: 'AAA_ADMIT', raw_event_id: 'BLUE', semantic_event_key: BLUE,
      epoch: 1, active: true, revision_kind: 'ADMIT' })
  ];
  const c8 = evaluateEventMembershipLedger({ membership_records: records });
  const c9 = evaluateMembershipEpochBundleCustody({ membership_records: records });
  return deepFreeze({ case_id: 'TSMM02_RENAME_THE_STAMPS', records, c8, c9,
    c8_blue_current: c8.current_semantic_events.includes(BLUE),
    c9_blue_bundle: c9.latest_epoch_bundles.find(bundle => bundle.semantic_event_key === BLUE) });
}

function tsmm03(tsmm01Room) {
  const forward = evaluateMembershipEpochBundleCustody({ membership_records: tsmm01Room.records });
  const reversed = evaluateMembershipEpochBundleCustody({ membership_records: [...tsmm01Room.records].reverse() });
  return deepFreeze({ case_id: 'TSMM03_REVERSE_THE_FOLDER', forward, reversed,
    status_equal: forward.status === reversed.status,
    current_set_equal: forward.current_event_set_fingerprint === reversed.current_event_set_fingerprint });
}

function tsmm04() {
  const records = [...base(),
    rec({ membership_id: 'ACTIVE_A', raw_event_id: 'BLUE_A', semantic_event_key: BLUE,
      epoch: 1, active: true, revision_kind: 'RENAME_CONTINUOUS', continuity_from_semantic_event_key: BLUE }),
    rec({ membership_id: 'ACTIVE_B', raw_event_id: 'BLUE_B', semantic_event_key: BLUE,
      epoch: 1, active: true, revision_kind: 'RENAME_CONTINUOUS', continuity_from_semantic_event_key: BLUE })
  ];
  const result = evaluateMembershipEpochBundleCustody({ membership_records: records });
  return deepFreeze({ case_id: 'TSMM04_TWO_YES_STAMPS', result,
    blue_bundle: result.latest_epoch_bundles.find(bundle => bundle.semantic_event_key === BLUE) });
}

function tsmm05() {
  const records = [...base(),
    rec({ membership_id: 'INACTIVE_A', raw_event_id: 'BLUE', semantic_event_key: BLUE,
      epoch: 1, active: false, revision_kind: 'WITHDRAW' }),
    rec({ membership_id: 'INACTIVE_B', raw_event_id: 'BLUE', semantic_event_key: BLUE,
      epoch: 1, active: false, revision_kind: 'WITHDRAW' })
  ];
  const result = evaluateMembershipEpochBundleCustody({ membership_records: records });
  return deepFreeze({ case_id: 'TSMM05_TWO_NO_STAMPS', result,
    blue_bundle: result.latest_epoch_bundles.find(bundle => bundle.semantic_event_key === BLUE) });
}

function tsmm06(tsmm01Room) {
  const c8Trace = tsmm01Room.c8.episode_traces.find(trace => trace.semantic_event_key === BLUE);
  const c9Trace = tsmm01Room.c9.epoch_traces.find(trace => trace.semantic_event_key === BLUE);
  const c8EpochOneTransitions = c8Trace.transitions.filter(item => item.epoch === 1).length;
  const c9EpochOneBundles = c9Trace.epochs.filter(item => item.epoch === 1).length;
  return deepFreeze({ case_id: 'TSMM06_EPISODE_HALLUCINATION_CONTROL', c8Trace, c9Trace,
    c8_epoch_one_transition_count: c8EpochOneTransitions,
    c9_epoch_one_bundle_count: c9EpochOneBundles,
    c9_episode_count_identified: c9Trace.episode_count_identified });
}

function tsmm07() {
  const records = [...base(),
    rec({ membership_id: 'BLUE_WITHDRAW_1', raw_event_id: 'BLUE', semantic_event_key: BLUE,
      epoch: 1, active: false, revision_kind: 'WITHDRAW' }),
    rec({ membership_id: 'BLUE_RETURN_2', raw_event_id: 'BLUE_RETURN', semantic_event_key: BLUE,
      epoch: 2, active: true, revision_kind: 'REINTRODUCE', continuity_from_semantic_event_key: BLUE })
  ];
  const result = evaluateMembershipEpochBundleCustody({ membership_records: records });
  const trace = result.epoch_traces.find(item => item.semantic_event_key === BLUE);
  return deepFreeze({ case_id: 'TSMM07_DISTINCT_EPOCH_CONTROL', result, trace });
}

function tsmm08() {
  const inherited = runPedagogueCutAndPasteGauntlet();
  return deepFreeze({ case_id: 'TSMM08_INHERITED_RAW_BINDING_CONFLICT',
    inherited_status: inherited.rooms.cpx09.result.status,
    inherited_current_edge_count: inherited.rooms.cpx09.result.current_admitted_semantic_edges.length });
}

function tsmm09() {
  const records = [...base(),
    rec({ membership_id: 'GOOD_ACTIVE', raw_event_id: 'BLUE', semantic_event_key: BLUE,
      epoch: 1, active: true, revision_kind: 'RENAME_CONTINUOUS', continuity_from_semantic_event_key: BLUE }),
    { membership_id: 'ZZZZ_BAD', raw_event_id: 'BLUE', semantic_event_key: BLUE,
      epoch: 1, active: false, revision_kind: 'MAGIC' }
  ];
  const result = evaluateMembershipEpochBundleCustody({ membership_records: records });
  return deepFreeze({ case_id: 'TSMM09_BAD_RECORD_SORTS_LAST', result });
}

function tsmm10() {
  const duplicate = rec({ membership_id: 'DUPLICATE', raw_event_id: 'BLUE', semantic_event_key: BLUE,
    epoch: 1, active: true, revision_kind: 'ADMIT' });
  const result = evaluateMembershipEpochBundleCustody({ membership_records: [...base(), duplicate, clone(duplicate)] });
  return deepFreeze({ case_id: 'TSMM10_DUPLICATE_ID_CONTROL', result });
}

function tsmm11(tsmm04Room) {
  const compact = deepFreeze({ semantic_event_key: BLUE, epoch: 1, current_active: true });
  return deepFreeze({ case_id: 'TSMM11_BUNDLE_COMPACTION', full: tsmm04Room.blue_bundle, compact,
    current_active_equal: tsmm04Room.blue_bundle.current_active === compact.current_active,
    record_custody_equal: false,
    compact_bundle_history_authority: false });
}

function tsmm12() {
  const sealed = sealMembershipEpochBundle({ semantic_event_key: BLUE, epoch: 1, records: [] });
  const mutation = requestSealedMembershipEpochBundleMutation(sealed, { current_active: true });
  return deepFreeze({ case_id: 'TSMM12_SEALED_BUNDLE_MUTATION', sealed, mutation,
    sealed_still_frozen: Object.isFrozen(sealed) });
}

export function runPedagogueTwoStampsSameMinuteGauntlet() {
  const inherited = runPedagogueCutAndPasteGauntlet();
  const tsmm01Room = tsmm01();
  const tsmm02Room = tsmm02();
  const tsmm03Room = tsmm03(tsmm01Room);
  const tsmm04Room = tsmm04();
  const tsmm05Room = tsmm05();
  const tsmm06Room = tsmm06(tsmm01Room);
  const tsmm07Room = tsmm07();
  const tsmm08Room = tsmm08();
  const tsmm09Room = tsmm09();
  const tsmm10Room = tsmm10();
  const tsmm11Room = tsmm11(tsmm04Room);
  const tsmm12Room = tsmm12();

  const c8LexicalDependenceEstablished =
    tsmm01Room.c8_blue_current === true &&
    tsmm02Room.c8_blue_current === false;

  const defeat = [];
  if (tsmm01Room.c9.status !== 'ABSTAIN_CONFLICTING_SAME_EPOCH_EVENT_MEMBERSHIP' ||
      tsmm01Room.c9_blue_bundle.current_active !== null) {
    defeat.push('CONFLICTING_SAME_EPOCH_DISPOSITIONS_FORCED_TO_UNIQUE_MEMBERSHIP');
  }
  if (tsmm02Room.c9.status !== 'ABSTAIN_CONFLICTING_SAME_EPOCH_EVENT_MEMBERSHIP' ||
      tsmm02Room.c9_blue_bundle.current_active !== null) {
    defeat.push('MEMBERSHIP_ID_SELECTS_SAME_EPOCH_AUTHORITY');
  }
  if (!tsmm03Room.status_equal || !tsmm03Room.current_set_equal) {
    defeat.push('INPUT_ORDER_SELECTS_SAME_EPOCH_AUTHORITY');
  }
  if (tsmm04Room.blue_bundle.material_disposition_status !== 'UNIFORM_ACTIVE_MEMBERSHIP_EPOCH_BUNDLE' ||
      tsmm04Room.blue_bundle.current_active !== true || tsmm04Room.blue_bundle.record_count !== 2) {
    defeat.push('UNIFORM_ACTIVE_BUNDLE_FALSELY_ABSTAINS');
  }
  if (tsmm05Room.blue_bundle.material_disposition_status !== 'UNIFORM_INACTIVE_MEMBERSHIP_EPOCH_BUNDLE' ||
      tsmm05Room.blue_bundle.current_active !== false || tsmm05Room.blue_bundle.record_count !== 2) {
    defeat.push('UNIFORM_INACTIVE_BUNDLE_FALSELY_ABSTAINS');
  }
  if (tsmm06Room.c8_epoch_one_transition_count !== 2 || tsmm06Room.c9_epoch_one_bundle_count !== 1 ||
      tsmm06Room.c9_episode_count_identified !== false) {
    defeat.push('SAME_EPOCH_SERIALIZATION_MANUFACTURES_EPISODE_SEQUENCE');
  }
  if (tsmm07Room.trace.episode_count !== 2 || !tsmm07Room.trace.episode_count_identified) {
    defeat.push('DISTINCT_EPOCH_HISTORY_FLATTENED');
  }
  if (tsmm08Room.inherited_status !== 'ABSTAIN_CONFLICTING_EVENT_MEMBERSHIP' ||
      tsmm08Room.inherited_current_edge_count !== 0) {
    defeat.push('INHERITED_RAW_BINDING_CONFLICT_PROTECTION_LOST');
  }
  if (!tsmm09Room.result.rejected_records.some(item => item.record?.membership_id === 'ZZZZ_BAD') ||
      !tsmm09Room.result.current_semantic_events.includes(BLUE)) {
    defeat.push('INVALID_RECORD_ACQUIRES_BUNDLE_AUTHORITY');
  }
  if (!tsmm10Room.result.rejected_records.some(item => item.status === 'REJECT_DUPLICATE_EVENT_MEMBERSHIP_ID')) {
    defeat.push('DUPLICATE_ID_VALIDATION_LOST');
  }
  if (!tsmm11Room.current_active_equal || tsmm11Room.record_custody_equal || tsmm11Room.compact_bundle_history_authority) {
    defeat.push('BUNDLE_COMPACTION_OVERCLAIMS_HISTORY');
  }
  if (tsmm12Room.mutation.status !== 'SEALED_MEMBERSHIP_EPOCH_BUNDLE_IMMUTABLE' || tsmm12Room.mutation.mutated) {
    defeat.push('SEALED_MEMBERSHIP_EPOCH_BUNDLE_MUTATED');
  }

  return deepFreeze({
    ok: true,
    schema: PEDAGOGUE_MEMBERSHIP_EPOCH_BUNDLE_CUSTODY_SCHEMA,
    inherited_c8_cut_and_paste_verdict: inherited.candidate_verdict,
    inherited_c8_same_epoch_arbitration_verdict: c8LexicalDependenceEstablished
      ? 'EVENT_MEMBERSHIP_REVISION_CUSTODY_C8_FALSIFIED_AS_SAME_EPOCH_ARBITRATION_SUFFICIENT_FORM'
      : 'C8_SAME_EPOCH_ARBITRATION_OVERCLAIM_NOT_ESTABLISHED_IN_THIS_RUN',
    c8_membership_state_flipped_by_identifier_rename: c8LexicalDependenceEstablished,
    candidate: 'C9_MEMBERSHIP_EPOCH_BUNDLE_CUSTODY',
    candidate_status: 'ATTACK_ONLY_NOT_PROMOTED',
    candidate_verdict: defeat.length === 0
      ? 'MEMBERSHIP_EPOCH_BUNDLE_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_TWO_STAMPS_SAME_MINUTE'
      : 'MEMBERSHIP_EPOCH_BUNDLE_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_TWO_STAMPS_SAME_MINUTE',
    defeat_conditions: defeat,
    rooms: {
      tsmm01: tsmm01Room, tsmm02: tsmm02Room, tsmm03: tsmm03Room, tsmm04: tsmm04Room,
      tsmm05: tsmm05Room, tsmm06: tsmm06Room, tsmm07: tsmm07Room, tsmm08: tsmm08Room,
      tsmm09: tsmm09Room, tsmm10: tsmm10Room, tsmm11: tsmm11Room, tsmm12: tsmm12Room
    },
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
      'ATTACK_MEMBERSHIP_EPOCH_BUNDLE_WITH_DECLARED_REVISION_PRECEDENCE_AND_BRIDGE_PROVENANCE_WITHOUT_IMPORTING_DISTRIBUTED_CLOCK_OR_CONSENSUS_CLAIMS'
  });
}
