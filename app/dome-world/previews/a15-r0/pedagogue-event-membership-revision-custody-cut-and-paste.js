import {
  evaluateAdmissionWitnessReplayCustody,
  runPedagogueCarbonPaperGauntlet
} from './pedagogue-admission-witness-replay-custody-carbon-paper.js';

export const PEDAGOGUE_EVENT_MEMBERSHIP_REVISION_CUSTODY_SCHEMA =
  'td613.pedagogue.event-membership-revision-custody-hostile/v0.1';

const PINK_SEMANTIC = 'WITHDRAW_PRIMARY_LINEAGE';
const BLUE_SEMANTIC = 'ADD_REPLACEMENT_LINEAGE';

const ALLOWED_REVISION_KINDS = new Set([
  'ADMIT',
  'WITHDRAW',
  'REINTRODUCE',
  'RENAME_CONTINUOUS',
  'REPLACE_SEMANTIC',
  'SPLIT_FROM',
  'MERGE_FROM'
]);

const freeze = value => Object.freeze(value);
const freezeArray = values => freeze([...values]);
const freezeRecord = value => freeze({ ...value });

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

function membership({
  membership_id,
  raw_event_id,
  semantic_event_key,
  epoch,
  active,
  revision_kind,
  continuity_from_semantic_event_key = null
}) {
  return deepFreeze({
    membership_id,
    raw_event_id,
    semantic_event_key,
    epoch,
    active,
    revision_kind,
    continuity_from_semantic_event_key
  });
}

function baseMembershipLedger() {
  return [
    membership({
      membership_id: 'M_PINK_0',
      raw_event_id: 'PINK',
      semantic_event_key: PINK_SEMANTIC,
      epoch: 0,
      active: true,
      revision_kind: 'ADMIT'
    }),
    membership({
      membership_id: 'M_BLUE_0',
      raw_event_id: 'BLUE',
      semantic_event_key: BLUE_SEMANTIC,
      epoch: 0,
      active: true,
      revision_kind: 'ADMIT'
    })
  ];
}

function validMembershipRecord(record) {
  if (!record || typeof record !== 'object') return false;
  if (typeof record.membership_id !== 'string' || !record.membership_id) return false;
  if (typeof record.raw_event_id !== 'string' || !record.raw_event_id) return false;
  if (typeof record.semantic_event_key !== 'string' || !record.semantic_event_key) return false;
  if (!Number.isInteger(record.epoch) || record.epoch < 0) return false;
  if (typeof record.active !== 'boolean') return false;
  if (!ALLOWED_REVISION_KINDS.has(record.revision_kind)) return false;
  return true;
}

function episodeTrace(records) {
  const bySemantic = new Map();
  for (const record of records) {
    if (!bySemantic.has(record.semantic_event_key)) bySemantic.set(record.semantic_event_key, []);
    bySemantic.get(record.semantic_event_key).push(record);
  }

  const traces = [];
  for (const [semantic_event_key, items] of [...bySemantic.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const ordered = [...items].sort((a, b) =>
      a.epoch - b.epoch ||
      a.revision_kind.localeCompare(b.revision_kind) ||
      a.membership_id.localeCompare(b.membership_id)
    );
    let priorActive = false;
    let episode = 0;
    const transitions = [];
    for (const record of ordered) {
      if (record.active && !priorActive) episode += 1;
      transitions.push({
        epoch: record.epoch,
        active: record.active,
        revision_kind: record.revision_kind,
        episode,
        semantic_event_key
      });
      priorActive = record.active;
    }
    traces.push({
      semantic_event_key,
      episode_count: episode,
      transitions
    });
  }
  return freezeArray(traces.map(deepFreeze));
}

export function evaluateEventMembershipLedger({ membership_records = [] } = {}) {
  if (!Array.isArray(membership_records)) throw new TypeError('membership_records must be array');

  const seen = new Set();
  const valid = [];
  const rejected = [];
  for (const input of membership_records) {
    const record = clone(input);
    if (typeof record?.membership_id === 'string' && seen.has(record.membership_id)) {
      rejected.push({ record, status: 'REJECT_DUPLICATE_EVENT_MEMBERSHIP_ID' });
      continue;
    }
    if (typeof record?.membership_id === 'string') seen.add(record.membership_id);
    if (!validMembershipRecord(record)) {
      rejected.push({ record, status: 'REJECT_INVALID_EVENT_MEMBERSHIP_RECORD' });
      continue;
    }
    valid.push(deepFreeze(record));
  }

  const activeSameRawEpoch = new Map();
  for (const record of valid.filter(item => item.active)) {
    const key = `${record.raw_event_id}\u0000${record.epoch}`;
    if (!activeSameRawEpoch.has(key)) activeSameRawEpoch.set(key, new Set());
    activeSameRawEpoch.get(key).add(record.semantic_event_key);
  }
  const conflicts = [];
  for (const [key, semantics] of activeSameRawEpoch) {
    if (semantics.size > 1) {
      const [raw_event_id, epochString] = key.split('\u0000');
      conflicts.push({
        raw_event_id,
        epoch: Number(epochString),
        semantic_event_keys: [...semantics].sort()
      });
    }
  }

  const latestBySemantic = new Map();
  for (const record of valid) {
    const prior = latestBySemantic.get(record.semantic_event_key);
    if (!prior || record.epoch > prior.epoch ||
        (record.epoch === prior.epoch && record.membership_id.localeCompare(prior.membership_id) > 0)) {
      latestBySemantic.set(record.semantic_event_key, record);
    }
  }

  const currentSemanticEvents = [...latestBySemantic.values()]
    .filter(record => record.active)
    .map(record => record.semantic_event_key)
    .sort();
  const currentRawBindings = [...latestBySemantic.values()]
    .filter(record => record.active)
    .map(record => ({
      raw_event_id: record.raw_event_id,
      semantic_event_key: record.semantic_event_key,
      epoch: record.epoch
    }))
    .sort((a, b) => a.semantic_event_key.localeCompare(b.semantic_event_key));
  const episodes = episodeTrace(valid);
  const semanticHistory = valid
    .map(record => ({
      semantic_event_key: record.semantic_event_key,
      epoch: record.epoch,
      active: record.active,
      revision_kind: record.revision_kind,
      continuity_from_semantic_event_key: record.continuity_from_semantic_event_key
    }))
    .sort((a, b) =>
      a.epoch - b.epoch ||
      a.semantic_event_key.localeCompare(b.semantic_event_key) ||
      a.revision_kind.localeCompare(b.revision_kind)
    );

  return freezeRecord({
    schema: 'td613.pedagogue.event-membership-ledger/v0.1',
    status: conflicts.length > 0
      ? 'ABSTAIN_CONFLICTING_EVENT_MEMBERSHIP'
      : 'EVENT_MEMBERSHIP_LEDGER_EVALUATED',
    valid_records: freezeArray(valid),
    rejected_records: freezeArray(rejected.map(deepFreeze)),
    conflicts: freezeArray(conflicts.map(deepFreeze)),
    current_semantic_events: freezeArray(currentSemanticEvents),
    current_raw_bindings: freezeArray(currentRawBindings.map(deepFreeze)),
    episode_traces: episodes,
    current_event_set_fingerprint: stable(currentSemanticEvents),
    semantic_membership_history_fingerprint: stable(semanticHistory),
    raw_identifier_authority: false,
    serialization_order_authority: false,
    promotion_authority: false
  });
}

export function evaluateEventMembershipRevisionCustody({
  case_id = 'EVENT_MEMBERSHIP_REVISION_CUSTODY_CASE',
  witness_result,
  membership_records = []
} = {}) {
  if (!witness_result || typeof witness_result !== 'object') throw new TypeError('witness_result required');
  const ledger = evaluateEventMembershipLedger({ membership_records });
  const currentSet = new Set(ledger.current_semantic_events);
  const currentWitnesses = [];
  const historicalByMembership = [];
  const classifications = [];

  for (const support of witness_result.lawful_active_witness_supports ?? []) {
    const membershipComplete = (support.semantic_edge ?? []).every(key => currentSet.has(key));
    const status = ledger.status === 'ABSTAIN_CONFLICTING_EVENT_MEMBERSHIP'
      ? 'ABSTAIN_CONFLICTING_EVENT_MEMBERSHIP'
      : membershipComplete
        ? 'LAWFUL_CURRENT_EVENT_MEMBERSHIP_WITNESS'
        : 'REFUSE_CURRENT_EDGE_EVENT_MEMBERSHIP_INCOMPLETE';
    const item = deepFreeze({
      admission_id: support.admission_id,
      semantic_edge: clone(support.semantic_edge ?? []),
      semantic_witness_fingerprint: support.semantic_witness_fingerprint,
      c7_replay_valid: support.lawful_active === true,
      event_membership_complete: membershipComplete,
      status
    });
    classifications.push(item);
    if (status === 'LAWFUL_CURRENT_EVENT_MEMBERSHIP_WITNESS') currentWitnesses.push(item);
    else historicalByMembership.push(item);
  }

  const currentEdges = ledger.status === 'ABSTAIN_CONFLICTING_EVENT_MEMBERSHIP'
    ? []
    : currentWitnesses.map(item => item.semantic_edge);

  return freezeRecord({
    schema: PEDAGOGUE_EVENT_MEMBERSHIP_REVISION_CUSTODY_SCHEMA,
    candidate: 'C8_EVENT_MEMBERSHIP_REVISION_CUSTODY',
    case_id,
    status: ledger.status === 'ABSTAIN_CONFLICTING_EVENT_MEMBERSHIP'
      ? 'ABSTAIN_CONFLICTING_EVENT_MEMBERSHIP'
      : 'EVENT_MEMBERSHIP_REVISION_CUSTODY_EVALUATED',
    c7_replay_result_preserved: true,
    c7_active_lawful_witness_support_count: witness_result.active_lawful_witness_support_count ?? 0,
    membership_ledger: ledger,
    witness_membership_classifications: freezeArray(classifications),
    lawful_current_witness_supports: freezeArray(currentWitnesses),
    historical_witnesses_excluded_from_current_membership: freezeArray(historicalByMembership),
    current_admitted_semantic_edges: freezeArray(currentEdges.map(edge => freezeArray(edge))),
    historical_witness_custody_preserved:
      classifications.length === (witness_result.lawful_active_witness_supports ?? []).length,
    raw_event_identifier_authority: false,
    support_serialization_authority: false,
    scalar_aggregation_used: false,
    promotion_authority: false
  });
}

export function sealEventMembershipLedger(records) {
  return deepFreeze(clone(records ?? []));
}

export function requestSealedEventMembershipLedgerMutation(sealedLedger, replacement) {
  if (!Object.isFrozen(sealedLedger)) {
    return freezeRecord({ status: 'REJECT_UNSEALED_EVENT_MEMBERSHIP_LEDGER_MUTATION_TARGET', mutated: false });
  }
  return freezeRecord({
    status: 'SEALED_EVENT_MEMBERSHIP_LEDGER_IMMUTABLE',
    mutated: false,
    requested_replacement: deepFreeze(clone(replacement ?? []))
  });
}

function carbonWitnessControl() {
  const carbon = runPedagogueCarbonPaperGauntlet();
  const record = carbon.rooms.cp01.genuine;
  const witness_result = evaluateAdmissionWitnessReplayCustody({
    case_id: 'CUT_AND_PASTE_C7_CONTROL',
    admission_records: [record]
  });
  return deepFreeze({ record, witness_result });
}

function cpx01MissingSheet(control) {
  const before = evaluateEventMembershipRevisionCustody({
    case_id: 'CPX01_BEFORE',
    witness_result: control.witness_result,
    membership_records: baseMembershipLedger()
  });
  const afterRecords = [
    ...baseMembershipLedger(),
    membership({
      membership_id: 'M_BLUE_1_WITHDRAW', raw_event_id: 'BLUE', semantic_event_key: BLUE_SEMANTIC,
      epoch: 1, active: false, revision_kind: 'WITHDRAW'
    })
  ];
  const after = evaluateEventMembershipRevisionCustody({
    case_id: 'CPX01_AFTER', witness_result: control.witness_result, membership_records: afterRecords
  });
  return freezeRecord({
    case_id: 'CPX01_MISSING_SHEET', before, after,
    c7_replay_still_internally_valid: control.witness_result.active_lawful_witness_support_count === 1,
    c7_current_edge_before_membership_gate: control.witness_result.admitted_edges.length === 1,
    c8_current_edge_after_withdrawal: after.current_admitted_semantic_edges.length,
    c8_refusal_observed: after.witness_membership_classifications.some(item =>
      item.status === 'REFUSE_CURRENT_EDGE_EVENT_MEMBERSHIP_INCOMPLETE'),
    historical_witness_custody_preserved: after.historical_witness_custody_preserved
  });
}

function cpx02SameLabelNewPaper(control) {
  const records = [
    ...baseMembershipLedger(),
    membership({ membership_id: 'M_BLUE_1_WITHDRAW', raw_event_id: 'BLUE', semantic_event_key: BLUE_SEMANTIC,
      epoch: 1, active: false, revision_kind: 'WITHDRAW' }),
    membership({ membership_id: 'M_BLUE_1_REPLACE', raw_event_id: 'BLUE', semantic_event_key: 'UNRELATED_BLUE_REPLACEMENT',
      epoch: 1, active: true, revision_kind: 'REPLACE_SEMANTIC', continuity_from_semantic_event_key: BLUE_SEMANTIC })
  ];
  const result = evaluateEventMembershipRevisionCustody({
    case_id: 'CPX02_SAME_LABEL_NEW_PAPER', witness_result: control.witness_result, membership_records: records
  });
  return freezeRecord({ case_id: 'CPX02_SAME_LABEL_NEW_PAPER', result });
}

function cpx03NewLabelSamePaper(control) {
  const records = [
    ...baseMembershipLedger(),
    membership({ membership_id: 'M_BLUE_1_RENAME', raw_event_id: 'BLUE_NEW', semantic_event_key: BLUE_SEMANTIC,
      epoch: 1, active: true, revision_kind: 'RENAME_CONTINUOUS', continuity_from_semantic_event_key: BLUE_SEMANTIC })
  ];
  const result = evaluateEventMembershipRevisionCustody({
    case_id: 'CPX03_NEW_LABEL_SAME_PAPER', witness_result: control.witness_result, membership_records: records
  });
  const blueTrace = result.membership_ledger.episode_traces.find(item => item.semantic_event_key === BLUE_SEMANTIC);
  return freezeRecord({
    case_id: 'CPX03_NEW_LABEL_SAME_PAPER', result,
    blue_episode_count: blueTrace?.episode_count ?? null,
    current_edge_preserved: result.current_admitted_semantic_edges.length === 1
  });
}

function cpx04GoneAndBack(control) {
  const records = [
    ...baseMembershipLedger(),
    membership({ membership_id: 'M_BLUE_1_WITHDRAW', raw_event_id: 'BLUE', semantic_event_key: BLUE_SEMANTIC,
      epoch: 1, active: false, revision_kind: 'WITHDRAW' }),
    membership({ membership_id: 'M_BLUE_2_RETURN', raw_event_id: 'BLUE_RETURN', semantic_event_key: BLUE_SEMANTIC,
      epoch: 2, active: true, revision_kind: 'REINTRODUCE', continuity_from_semantic_event_key: BLUE_SEMANTIC })
  ];
  const result = evaluateEventMembershipRevisionCustody({
    case_id: 'CPX04_GONE_AND_BACK', witness_result: control.witness_result, membership_records: records
  });
  const blueTrace = result.membership_ledger.episode_traces.find(item => item.semantic_event_key === BLUE_SEMANTIC);
  return freezeRecord({
    case_id: 'CPX04_GONE_AND_BACK', result,
    blue_episode_count: blueTrace?.episode_count ?? null,
    current_edge_restored: result.current_admitted_semantic_edges.length === 1
  });
}

function cpx05SameCurrentSetDifferentPast(control) {
  const continuous = evaluateEventMembershipRevisionCustody({
    case_id: 'CPX05_CONTINUOUS', witness_result: control.witness_result, membership_records: baseMembershipLedger()
  });
  const interruptedRecords = [
    ...baseMembershipLedger(),
    membership({ membership_id: 'M_BLUE_1_WITHDRAW', raw_event_id: 'BLUE', semantic_event_key: BLUE_SEMANTIC,
      epoch: 1, active: false, revision_kind: 'WITHDRAW' }),
    membership({ membership_id: 'M_BLUE_2_RETURN', raw_event_id: 'BLUE', semantic_event_key: BLUE_SEMANTIC,
      epoch: 2, active: true, revision_kind: 'REINTRODUCE', continuity_from_semantic_event_key: BLUE_SEMANTIC })
  ];
  const interrupted = evaluateEventMembershipRevisionCustody({
    case_id: 'CPX05_INTERRUPTED', witness_result: control.witness_result, membership_records: interruptedRecords
  });
  return freezeRecord({
    case_id: 'CPX05_SAME_CURRENT_SET_DIFFERENT_PAST', continuous, interrupted,
    current_event_set_equal:
      continuous.membership_ledger.current_event_set_fingerprint === interrupted.membership_ledger.current_event_set_fingerprint,
    membership_history_equal:
      continuous.membership_ledger.semantic_membership_history_fingerprint === interrupted.membership_ledger.semantic_membership_history_fingerprint
  });
}

function cpx06SplitSheet(control) {
  const records = [
    ...baseMembershipLedger(),
    membership({ membership_id: 'M_BLUE_1_WITHDRAW', raw_event_id: 'BLUE', semantic_event_key: BLUE_SEMANTIC,
      epoch: 1, active: false, revision_kind: 'WITHDRAW' }),
    membership({ membership_id: 'M_BLUE_A_1', raw_event_id: 'BLUE_A', semantic_event_key: 'BLUE_SPLIT_A',
      epoch: 1, active: true, revision_kind: 'SPLIT_FROM', continuity_from_semantic_event_key: BLUE_SEMANTIC }),
    membership({ membership_id: 'M_BLUE_B_1', raw_event_id: 'BLUE_B', semantic_event_key: 'BLUE_SPLIT_B',
      epoch: 1, active: true, revision_kind: 'SPLIT_FROM', continuity_from_semantic_event_key: BLUE_SEMANTIC })
  ];
  const result = evaluateEventMembershipRevisionCustody({
    case_id: 'CPX06_SPLIT_SHEET', witness_result: control.witness_result, membership_records: records
  });
  return freezeRecord({ case_id: 'CPX06_SPLIT_SHEET', result });
}

function cpx07PastedSheets(control) {
  const records = [
    ...baseMembershipLedger(),
    membership({ membership_id: 'M_PINK_1_WITHDRAW', raw_event_id: 'PINK', semantic_event_key: PINK_SEMANTIC,
      epoch: 1, active: false, revision_kind: 'WITHDRAW' }),
    membership({ membership_id: 'M_BLUE_1_WITHDRAW', raw_event_id: 'BLUE', semantic_event_key: BLUE_SEMANTIC,
      epoch: 1, active: false, revision_kind: 'WITHDRAW' }),
    membership({ membership_id: 'M_MERGED_1', raw_event_id: 'PINK_BLUE', semantic_event_key: 'MERGED_PINK_BLUE',
      epoch: 1, active: true, revision_kind: 'MERGE_FROM', continuity_from_semantic_event_key: `${PINK_SEMANTIC}+${BLUE_SEMANTIC}` })
  ];
  const result = evaluateEventMembershipRevisionCustody({
    case_id: 'CPX07_PASTED_SHEETS', witness_result: control.witness_result, membership_records: records
  });
  return freezeRecord({ case_id: 'CPX07_PASTED_SHEETS', result });
}

function cpx08BadRevisionSortsFirst(control) {
  const records = [
    { membership_id: 'AAA_BAD', raw_event_id: 'BLUE', semantic_event_key: BLUE_SEMANTIC,
      epoch: 1, active: true, revision_kind: 'MAGIC_CONTINUITY' },
    ...baseMembershipLedger(),
    membership({ membership_id: 'ZZZ_GOOD', raw_event_id: 'BLUE_NEW', semantic_event_key: BLUE_SEMANTIC,
      epoch: 1, active: true, revision_kind: 'RENAME_CONTINUOUS', continuity_from_semantic_event_key: BLUE_SEMANTIC })
  ];
  const result = evaluateEventMembershipRevisionCustody({
    case_id: 'CPX08_BAD_REVISION_SORTS_FIRST', witness_result: control.witness_result, membership_records: records
  });
  return freezeRecord({ case_id: 'CPX08_BAD_REVISION_SORTS_FIRST', result });
}

function cpx09ConflictingCurrentMembership(control) {
  const records = [
    ...baseMembershipLedger(),
    membership({ membership_id: 'CONFLICT_A', raw_event_id: 'BLUE_CONFLICT', semantic_event_key: BLUE_SEMANTIC,
      epoch: 2, active: true, revision_kind: 'RENAME_CONTINUOUS', continuity_from_semantic_event_key: BLUE_SEMANTIC }),
    membership({ membership_id: 'CONFLICT_B', raw_event_id: 'BLUE_CONFLICT', semantic_event_key: 'UNRELATED_BLUE_REPLACEMENT',
      epoch: 2, active: true, revision_kind: 'REPLACE_SEMANTIC', continuity_from_semantic_event_key: BLUE_SEMANTIC })
  ];
  const result = evaluateEventMembershipRevisionCustody({
    case_id: 'CPX09_CONFLICTING_CURRENT_MEMBERSHIP', witness_result: control.witness_result, membership_records: records
  });
  return freezeRecord({ case_id: 'CPX09_CONFLICTING_CURRENT_MEMBERSHIP', result });
}

function cpx10CurrentSetCompaction(control) {
  const fullRecords = [
    ...baseMembershipLedger(),
    membership({ membership_id: 'M_BLUE_1_WITHDRAW', raw_event_id: 'BLUE', semantic_event_key: BLUE_SEMANTIC,
      epoch: 1, active: false, revision_kind: 'WITHDRAW' }),
    membership({ membership_id: 'M_BLUE_2_RETURN', raw_event_id: 'BLUE', semantic_event_key: BLUE_SEMANTIC,
      epoch: 2, active: true, revision_kind: 'REINTRODUCE', continuity_from_semantic_event_key: BLUE_SEMANTIC })
  ];
  const compactRecords = [
    membership({ membership_id: 'COMPACT_PINK', raw_event_id: 'PINK', semantic_event_key: PINK_SEMANTIC,
      epoch: 2, active: true, revision_kind: 'ADMIT' }),
    membership({ membership_id: 'COMPACT_BLUE', raw_event_id: 'BLUE', semantic_event_key: BLUE_SEMANTIC,
      epoch: 2, active: true, revision_kind: 'ADMIT' })
  ];
  const full = evaluateEventMembershipRevisionCustody({
    case_id: 'CPX10_FULL', witness_result: control.witness_result, membership_records: fullRecords
  });
  const compact = evaluateEventMembershipRevisionCustody({
    case_id: 'CPX10_COMPACT', witness_result: control.witness_result, membership_records: compactRecords
  });
  return freezeRecord({
    case_id: 'CPX10_CURRENT_SET_COMPACTION', full, compact,
    current_event_set_equal:
      full.membership_ledger.current_event_set_fingerprint === compact.membership_ledger.current_event_set_fingerprint,
    membership_history_equal:
      full.membership_ledger.semantic_membership_history_fingerprint === compact.membership_ledger.semantic_membership_history_fingerprint,
    compact_history_authority: false
  });
}

function cpx11PostHocScissors() {
  const sealed = sealEventMembershipLedger(baseMembershipLedger());
  const mutation = requestSealedEventMembershipLedgerMutation(sealed, []);
  return freezeRecord({
    case_id: 'CPX11_POSTHOC_SCISSORS', sealed, mutation,
    sealed_still_frozen: Object.isFrozen(sealed)
  });
}

function cpx12OldUniverseReplay(control) {
  const records = [
    ...baseMembershipLedger(),
    membership({ membership_id: 'M_BLUE_1_WITHDRAW', raw_event_id: 'BLUE', semantic_event_key: BLUE_SEMANTIC,
      epoch: 1, active: false, revision_kind: 'WITHDRAW' })
  ];
  const result = evaluateEventMembershipRevisionCustody({
    case_id: 'CPX12_OLD_UNIVERSE_REPLAY', witness_result: control.witness_result, membership_records: records
  });
  return freezeRecord({
    case_id: 'CPX12_OLD_UNIVERSE_REPLAY', result,
    c7_replay_valid: control.witness_result.active_lawful_witness_support_count === 1,
    historical_witness_preserved: result.historical_witness_custody_preserved,
    current_edge_admitted: result.current_admitted_semantic_edges.length === 1
  });
}

export function runPedagogueCutAndPasteGauntlet() {
  const control = carbonWitnessControl();
  const cpx01 = cpx01MissingSheet(control);
  const cpx02 = cpx02SameLabelNewPaper(control);
  const cpx03 = cpx03NewLabelSamePaper(control);
  const cpx04 = cpx04GoneAndBack(control);
  const cpx05 = cpx05SameCurrentSetDifferentPast(control);
  const cpx06 = cpx06SplitSheet(control);
  const cpx07 = cpx07PastedSheets(control);
  const cpx08 = cpx08BadRevisionSortsFirst(control);
  const cpx09 = cpx09ConflictingCurrentMembership(control);
  const cpx10 = cpx10CurrentSetCompaction(control);
  const cpx11 = cpx11PostHocScissors();
  const cpx12 = cpx12OldUniverseReplay(control);

  const defeatConditions = [];
  if (!cpx01.c7_replay_still_internally_valid || !cpx01.c7_current_edge_before_membership_gate ||
      cpx01.c8_current_edge_after_withdrawal !== 0 || !cpx01.c8_refusal_observed ||
      !cpx01.historical_witness_custody_preserved) {
    defeatConditions.push('INACTIVE_EVENT_RETAINS_CURRENT_EDGE_AUTHORITY');
  }
  if (cpx02.result.current_admitted_semantic_edges.length !== 0) {
    defeatConditions.push('RAW_EVENT_ID_REUSE_LAUNDERS_SEMANTIC_CONTINUITY');
  }
  if (!cpx03.current_edge_preserved || cpx03.blue_episode_count !== 1) {
    defeatConditions.push('SEMANTIC_RENAME_BREAKS_DECLARED_CONTINUITY');
  }
  if (!cpx04.current_edge_restored || cpx04.blue_episode_count !== 2) {
    defeatConditions.push('REINTRODUCTION_ERASES_MEMBERSHIP_GAP');
  }
  if (!cpx05.current_event_set_equal || cpx05.membership_history_equal) {
    defeatConditions.push('CURRENT_SET_EQUALITY_ERASES_REVISION_HISTORY');
  }
  if (cpx06.result.current_admitted_semantic_edges.length !== 0) {
    defeatConditions.push('SPLIT_DESCENDANT_INHERITS_WITNESS_WITHOUT_BRIDGE');
  }
  if (cpx07.result.current_admitted_semantic_edges.length !== 0) {
    defeatConditions.push('MERGED_DESCENDANT_INHERITS_WITNESS_WITHOUT_BRIDGE');
  }
  if (!cpx08.result.membership_ledger.rejected_records.some(item => item.record?.membership_id === 'AAA_BAD') ||
      cpx08.result.current_admitted_semantic_edges.length !== 1) {
    defeatConditions.push('EVENT_AUTHORITY_SELECTED_BY_IDENTIFIER_OR_SERIALIZATION');
  }
  if (cpx09.result.status !== 'ABSTAIN_CONFLICTING_EVENT_MEMBERSHIP' ||
      cpx09.result.current_admitted_semantic_edges.length !== 0) {
    defeatConditions.push('CONFLICTING_EVENT_MEMBERSHIP_FORCED_TO_UNIQUE_SEMANTICS');
  }
  if (!cpx10.current_event_set_equal || cpx10.membership_history_equal || cpx10.compact_history_authority) {
    defeatConditions.push('CURRENT_SET_COMPACTION_OVERCLAIMS_HISTORY');
  }
  if (cpx11.mutation.status !== 'SEALED_EVENT_MEMBERSHIP_LEDGER_IMMUTABLE' || cpx11.mutation.mutated) {
    defeatConditions.push('SEALED_EVENT_MEMBERSHIP_LEDGER_MUTATED');
  }
  if (!cpx12.c7_replay_valid || !cpx12.historical_witness_preserved || cpx12.current_edge_admitted) {
    defeatConditions.push('HISTORICAL_WITNESS_ERASED_ON_EVENT_WITHDRAWAL');
  }

  const inheritedOverclaimEstablished =
    cpx01.c7_replay_still_internally_valid &&
    cpx01.c7_current_edge_before_membership_gate &&
    cpx01.c8_current_edge_after_withdrawal === 0 &&
    cpx01.c8_refusal_observed;

  return deepFreeze({
    ok: true,
    schema: PEDAGOGUE_EVENT_MEMBERSHIP_REVISION_CUSTODY_SCHEMA,
    inherited_c7_fixed_event_set_result_preserved: true,
    inherited_c7_event_membership_revision_verdict: inheritedOverclaimEstablished
      ? 'ADMISSION_WITNESS_REPLAY_CUSTODY_C7_FALSIFIED_AS_EVENT_MEMBERSHIP_REVISION_SUFFICIENT_FORM'
      : 'C7_EVENT_MEMBERSHIP_REVISION_OVERCLAIM_NOT_ESTABLISHED_IN_THIS_RUN',
    candidate: 'C8_EVENT_MEMBERSHIP_REVISION_CUSTODY',
    candidate_status: 'ATTACK_ONLY_NOT_PROMOTED',
    candidate_verdict: defeatConditions.length === 0
      ? 'EVENT_MEMBERSHIP_REVISION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_CUT_AND_PASTE'
      : 'EVENT_MEMBERSHIP_REVISION_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_CUT_AND_PASTE',
    defeat_conditions: defeatConditions,
    rooms: { cpx01, cpx02, cpx03, cpx04, cpx05, cpx06, cpx07, cpx08, cpx09, cpx10, cpx11, cpx12 },
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
      'IF_C8_SURVIVES_ATTACK_EVENT_MEMBERSHIP_BRIDGE_PROVENANCE_AND_SPLIT_MERGE_CONTINUITY_SEPARATELY_BEFORE_ANY_FORMALISM_PROMOTION'
  });
}
