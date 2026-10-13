import {
  evaluateMembershipEpochBundleCustody,
  runPedagogueTwoStampsSameMinuteGauntlet
} from './pedagogue-membership-epoch-bundle-custody-two-stamps-same-minute.js';

export const PEDAGOGUE_REVISION_PRECEDENCE_BRIDGE_CUSTODY_SCHEMA =
  'td613.pedagogue.revision-precedence-bridge-custody-hostile/v0.1';

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

// Bounded deterministic integrity surrogate only. It is deliberately not a
// cryptographic identity or trust primitive.
function syntheticDigest(value) {
  const text = typeof value === 'string' ? value : stable(value);
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function materialRevisionObject(record) {
  return {
    semantic_event_key: record.semantic_event_key,
    epoch: record.epoch,
    raw_event_id: record.raw_event_id,
    active: record.active,
    revision_kind: record.revision_kind,
    continuity_from_semantic_event_key: record.continuity_from_semantic_event_key ?? null
  };
}

export function materialRevisionFingerprint(record) {
  return `REV-${syntheticDigest(materialRevisionObject(record))}`;
}

function visibleBridgePayload(bridge) {
  return {
    semantic_event_key: bridge.semantic_event_key,
    epoch: bridge.epoch,
    from_revision_fingerprint: bridge.from_revision_fingerprint,
    to_revision_fingerprint: bridge.to_revision_fingerprint,
    relation: bridge.relation
  };
}

export function computeRevisionPrecedenceBridgeWitnessDigest(bridge) {
  return `WIT-${syntheticDigest({
    visible_payload: visibleBridgePayload(bridge),
    witness_payload: bridge.witness_payload ?? null,
    witness_chain: Array.isArray(bridge.witness_chain) ? bridge.witness_chain : []
  })}`;
}

function membership({ membership_id, raw_event_id, semantic_event_key, epoch, active, revision_kind,
  continuity_from_semantic_event_key = null }) {
  return deepFreeze({ membership_id, raw_event_id, semantic_event_key, epoch, active, revision_kind,
    continuity_from_semantic_event_key });
}

function baseMembershipRecords() {
  return [
    membership({ membership_id: 'M_PINK_0', raw_event_id: 'PINK', semantic_event_key: PINK,
      epoch: 0, active: true, revision_kind: 'ADMIT' }),
    membership({ membership_id: 'M_BLUE_0', raw_event_id: 'BLUE', semantic_event_key: BLUE,
      epoch: 0, active: true, revision_kind: 'ADMIT' })
  ];
}

function conflictingBlueRecords({ withdrawId = 'WITHDRAW', admitId = 'ADMIT' } = {}) {
  return [
    ...baseMembershipRecords(),
    membership({ membership_id: withdrawId, raw_event_id: 'BLUE', semantic_event_key: BLUE,
      epoch: 1, active: false, revision_kind: 'WITHDRAW' }),
    membership({ membership_id: admitId, raw_event_id: 'BLUE', semantic_event_key: BLUE,
      epoch: 1, active: true, revision_kind: 'ADMIT' })
  ];
}

function buildWitnessedBridge({ bridge_id, from, to, witness_payload, witness_chain,
  replayable = true, admissible = true, revoked = false }) {
  const draft = {
    bridge_id,
    semantic_event_key: from.semantic_event_key,
    epoch: from.epoch,
    from_revision_fingerprint: materialRevisionFingerprint(from),
    to_revision_fingerprint: materialRevisionFingerprint(to),
    relation: 'PRECEDES',
    witness_payload,
    witness_chain,
    witness_terminal_digest: null,
    replayable,
    admissible,
    revoked
  };
  draft.witness_terminal_digest = computeRevisionPrecedenceBridgeWitnessDigest(draft);
  return deepFreeze(draft);
}

function validateBridgeForBundle(bridge, bundle) {
  const recordFingerprints = new Set(bundle.records.map(materialRevisionFingerprint));
  const replayedDigest = computeRevisionPrecedenceBridgeWitnessDigest(bridge);
  const visiblePayloadFingerprint = syntheticDigest(visibleBridgePayload(bridge));

  if (!bridge || typeof bridge !== 'object' || !bridge.bridge_id) {
    return deepFreeze({ status: 'REJECT_MALFORMED_REVISION_PRECEDENCE_BRIDGE', admitted: false,
      bridge: clone(bridge ?? null), replayed_digest: replayedDigest, visible_payload_fingerprint: visiblePayloadFingerprint });
  }
  if (bridge.relation !== 'PRECEDES') {
    return deepFreeze({ status: 'REJECT_UNSUPPORTED_REVISION_PRECEDENCE_RELATION', admitted: false,
      bridge, replayed_digest: replayedDigest, visible_payload_fingerprint: visiblePayloadFingerprint });
  }
  if (bridge.semantic_event_key !== bundle.semantic_event_key || bridge.epoch !== bundle.epoch ||
      !recordFingerprints.has(bridge.from_revision_fingerprint) ||
      !recordFingerprints.has(bridge.to_revision_fingerprint)) {
    return deepFreeze({ status: 'REFUSE_OUT_OF_BUNDLE_REVISION_PRECEDENCE_BRIDGE', admitted: false,
      bridge, replayed_digest: replayedDigest, visible_payload_fingerprint: visiblePayloadFingerprint });
  }
  if (bridge.revoked === true) {
    return deepFreeze({ status: 'REFUSE_REVOKED_REVISION_PRECEDENCE_BRIDGE', admitted: false,
      bridge, replayed_digest: replayedDigest, visible_payload_fingerprint: visiblePayloadFingerprint });
  }
  if (bridge.admissible !== true) {
    return deepFreeze({ status: 'REFUSE_INADMISSIBLE_REVISION_PRECEDENCE_BRIDGE', admitted: false,
      bridge, replayed_digest: replayedDigest, visible_payload_fingerprint: visiblePayloadFingerprint });
  }
  if (bridge.replayable !== true || !Array.isArray(bridge.witness_chain) || bridge.witness_chain.length === 0 ||
      bridge.witness_terminal_digest !== replayedDigest) {
    return deepFreeze({ status: 'REFUSE_UNWITNESSED_REVISION_PRECEDENCE_BRIDGE', admitted: false,
      bridge, replayed_digest: replayedDigest, visible_payload_fingerprint: visiblePayloadFingerprint });
  }

  return deepFreeze({ status: 'ADMIT_WITNESSED_REVISION_PRECEDENCE_BRIDGE', admitted: true,
    bridge, replayed_digest: replayedDigest, visible_payload_fingerprint: visiblePayloadFingerprint });
}

function graphHasCycle(nodes, edges) {
  const outgoing = new Map(nodes.map(node => [node, []]));
  for (const [from, to] of edges) outgoing.get(from)?.push(to);
  const visiting = new Set();
  const visited = new Set();
  function visit(node) {
    if (visiting.has(node)) return true;
    if (visited.has(node)) return false;
    visiting.add(node);
    for (const next of outgoing.get(node) ?? []) {
      if (visit(next)) return true;
    }
    visiting.delete(node);
    visited.add(node);
    return false;
  }
  return nodes.some(visit);
}

function resolveBundleWithBridges(bundle, bridges) {
  if (bundle.current_membership_identified) {
    return deepFreeze({
      semantic_event_key: bundle.semantic_event_key,
      epoch: bundle.epoch,
      status: bundle.current_active
        ? 'UNIFORM_ACTIVE_MEMBERSHIP_EPOCH_BUNDLE'
        : 'UNIFORM_INACTIVE_MEMBERSHIP_EPOCH_BUNDLE',
      current_membership_identified: true,
      current_active: bundle.current_active,
      resolved_revision_fingerprint: null,
      bridge_receipts: [],
      admitted_bridge_count: 0,
      bridge_precedence_required: false
    });
  }

  const matching = bridges.filter(bridge =>
    bridge?.semantic_event_key === bundle.semantic_event_key && bridge?.epoch === bundle.epoch);
  const receipts = matching.map(bridge => validateBridgeForBundle(bridge, bundle));
  const admitted = receipts.filter(receipt => receipt.admitted);
  if (admitted.length === 0) {
    return deepFreeze({ semantic_event_key: bundle.semantic_event_key, epoch: bundle.epoch,
      status: 'ABSTAIN_NO_ADMITTED_REVISION_PRECEDENCE', current_membership_identified: false,
      current_active: null, resolved_revision_fingerprint: null, bridge_receipts: receipts,
      admitted_bridge_count: 0, bridge_precedence_required: true });
  }

  const nodes = [...new Set(bundle.records.map(materialRevisionFingerprint))].sort();
  const edgeKeys = new Set();
  const edges = [];
  for (const receipt of admitted) {
    const edge = [receipt.bridge.from_revision_fingerprint, receipt.bridge.to_revision_fingerprint];
    const key = `${edge[0]}=>${edge[1]}`;
    if (!edgeKeys.has(key)) {
      edgeKeys.add(key);
      edges.push(edge);
    }
  }

  if (graphHasCycle(nodes, edges)) {
    return deepFreeze({ semantic_event_key: bundle.semantic_event_key, epoch: bundle.epoch,
      status: 'ABSTAIN_CONFLICTING_OR_CYCLIC_REVISION_PRECEDENCE', current_membership_identified: false,
      current_active: null, resolved_revision_fingerprint: null, bridge_receipts: receipts,
      admitted_bridge_count: admitted.length, bridge_precedence_required: true });
  }

  const outgoing = new Map(nodes.map(node => [node, 0]));
  for (const [from] of edges) outgoing.set(from, (outgoing.get(from) ?? 0) + 1);
  const maximal = nodes.filter(node => (outgoing.get(node) ?? 0) === 0);
  if (maximal.length !== 1) {
    return deepFreeze({ semantic_event_key: bundle.semantic_event_key, epoch: bundle.epoch,
      status: 'ABSTAIN_REVISION_PRECEDENCE_NOT_IDENTIFYING', current_membership_identified: false,
      current_active: null, resolved_revision_fingerprint: null, bridge_receipts: receipts,
      admitted_bridge_count: admitted.length, bridge_precedence_required: true,
      maximal_revision_fingerprints: maximal });
  }

  const resolvedFingerprint = maximal[0];
  const resolvedRecord = bundle.records.find(record => materialRevisionFingerprint(record) === resolvedFingerprint);
  return deepFreeze({ semantic_event_key: bundle.semantic_event_key, epoch: bundle.epoch,
    status: 'RESOLVED_BY_WITNESSED_REVISION_PRECEDENCE', current_membership_identified: true,
    current_active: resolvedRecord.active, resolved_revision_fingerprint: resolvedFingerprint,
    bridge_receipts: receipts, admitted_bridge_count: admitted.length, bridge_precedence_required: true,
    maximal_revision_fingerprints: maximal });
}

export function evaluateRevisionPrecedenceBridgeCustody({ membership_records = [], precedence_bridges = [] } = {}) {
  const c9 = evaluateMembershipEpochBundleCustody({ membership_records });
  if (c9.status === 'ABSTAIN_CONFLICTING_EVENT_MEMBERSHIP') {
    return deepFreeze({ schema: PEDAGOGUE_REVISION_PRECEDENCE_BRIDGE_CUSTODY_SCHEMA,
      candidate: 'C10_REVISION_PRECEDENCE_BRIDGE_CUSTODY', status: 'ABSTAIN_CONFLICTING_EVENT_MEMBERSHIP',
      inherited_c9_status: c9.status, bundle_resolutions: [], current_semantic_events: [],
      current_event_set_fingerprint: stable([]), membership_id_authority: false, bridge_id_authority: false,
      input_order_authority: false, scalar_aggregation_used: false, promotion_authority: false });
  }

  const duplicateBridgeIds = new Set();
  const seenBridgeIds = new Set();
  const bridges = [];
  const globallyRejectedBridges = [];
  for (const bridge of precedence_bridges) {
    if (seenBridgeIds.has(bridge?.bridge_id)) {
      duplicateBridgeIds.add(bridge?.bridge_id);
      globallyRejectedBridges.push(deepFreeze({ status: 'REJECT_DUPLICATE_REVISION_PRECEDENCE_BRIDGE_ID', bridge }));
      continue;
    }
    seenBridgeIds.add(bridge?.bridge_id);
    bridges.push(bridge);
  }

  const resolutions = c9.latest_epoch_bundles.map(bundle => resolveBundleWithBridges(bundle, bridges));
  const unresolved = resolutions.filter(item => !item.current_membership_identified);
  const currentSemanticEvents = resolutions.filter(item => item.current_membership_identified && item.current_active)
    .map(item => item.semantic_event_key).sort();

  let status = 'REVISION_PRECEDENCE_BRIDGE_CUSTODY_EVALUATED';
  if (unresolved.some(item => item.status === 'ABSTAIN_CONFLICTING_OR_CYCLIC_REVISION_PRECEDENCE')) {
    status = 'ABSTAIN_CONFLICTING_OR_CYCLIC_REVISION_PRECEDENCE';
  } else if (unresolved.some(item => item.status === 'ABSTAIN_NO_ADMITTED_REVISION_PRECEDENCE')) {
    status = 'ABSTAIN_NO_ADMITTED_REVISION_PRECEDENCE';
  } else if (unresolved.length > 0) {
    status = 'ABSTAIN_REVISION_PRECEDENCE_NOT_IDENTIFYING';
  }

  return deepFreeze({
    schema: PEDAGOGUE_REVISION_PRECEDENCE_BRIDGE_CUSTODY_SCHEMA,
    candidate: 'C10_REVISION_PRECEDENCE_BRIDGE_CUSTODY',
    status,
    inherited_c9_status: c9.status,
    bundle_resolutions: resolutions,
    globally_rejected_bridges: globallyRejectedBridges,
    duplicate_bridge_ids: [...duplicateBridgeIds].sort(),
    current_semantic_events: currentSemanticEvents,
    current_event_set_fingerprint: stable(currentSemanticEvents),
    membership_id_authority: false,
    bridge_id_authority: false,
    input_order_authority: false,
    scalar_aggregation_used: false,
    promotion_authority: false
  });
}

export function sealRevisionPrecedenceBridge(value) {
  return deepFreeze(clone(value));
}

export function requestSealedRevisionPrecedenceBridgeMutation(sealedBridge, replacement) {
  if (!Object.isFrozen(sealedBridge)) {
    return deepFreeze({ status: 'REJECT_UNSEALED_REVISION_PRECEDENCE_BRIDGE_MUTATION_TARGET', mutated: false });
  }
  return deepFreeze({ status: 'SEALED_REVISION_PRECEDENCE_BRIDGE_IMMUTABLE', mutated: false,
    requested_replacement: clone(replacement ?? null) });
}

function findBlueConflict(records) {
  const c9 = evaluateMembershipEpochBundleCustody({ membership_records: records });
  const bundle = c9.latest_epoch_bundles.find(item => item.semantic_event_key === BLUE && item.epoch === 1);
  const withdraw = bundle.records.find(record => record.active === false);
  const admit = bundle.records.find(record => record.active === true);
  return { c9, bundle, withdraw, admit };
}

function nr01() {
  const records = conflictingBlueRecords({ withdrawId: 'WITHDRAW', admitId: 'ADMIT' });
  const { c9, withdraw, admit } = findBlueConflict(records);
  const valid = buildWitnessedBridge({ bridge_id: 'RIBBON_VALID', from: withdraw, to: admit,
    witness_payload: 'BLUE_EPOCH_1_WITHDRAW_PRECEDES_ADMIT',
    witness_chain: ['OBSERVE_WITHDRAW', 'OBSERVE_ADMIT', 'BIND_PRECEDENCE'] });
  const carbon = deepFreeze({ ...clone(valid), bridge_id: 'RIBBON_CARBON_COPY',
    witness_terminal_digest: 'WIT-00000000' });
  const result = evaluateRevisionPrecedenceBridgeCustody({ membership_records: records,
    precedence_bridges: [valid, carbon] });
  const blue = result.bundle_resolutions.find(item => item.semantic_event_key === BLUE);
  return deepFreeze({ case_id: 'NR01_RIBBON_VERSUS_CARBON_COPY', records, c9, valid, carbon, result, blue,
    same_visible_precedence_payload: stable(visibleBridgePayload(valid)) === stable(visibleBridgePayload(carbon)),
    valid_receipt: blue.bridge_receipts.find(item => item.bridge.bridge_id === 'RIBBON_VALID'),
    carbon_receipt: blue.bridge_receipts.find(item => item.bridge.bridge_id === 'RIBBON_CARBON_COPY') });
}

function nr02(nr01Room) {
  const records = conflictingBlueRecords({ withdrawId: 'ZZZ_RENAMED_WITHDRAW', admitId: 'AAA_RENAMED_ADMIT' });
  const original = findBlueConflict(nr01Room.records);
  const renamed = findBlueConflict(records);
  const bridge = nr01Room.valid;
  const result = evaluateRevisionPrecedenceBridgeCustody({ membership_records: records,
    precedence_bridges: [bridge] });
  const blue = result.bundle_resolutions.find(item => item.semantic_event_key === BLUE);
  return deepFreeze({ case_id: 'NR02_RENAME_BOTH_STAMPS', result, blue,
    withdraw_fingerprint_equal: materialRevisionFingerprint(original.withdraw) === materialRevisionFingerprint(renamed.withdraw),
    admit_fingerprint_equal: materialRevisionFingerprint(original.admit) === materialRevisionFingerprint(renamed.admit) });
}

function nr03(nr01Room) {
  const forward = evaluateRevisionPrecedenceBridgeCustody({ membership_records: nr01Room.records,
    precedence_bridges: [nr01Room.valid, nr01Room.carbon] });
  const reversed = evaluateRevisionPrecedenceBridgeCustody({ membership_records: [...nr01Room.records].reverse(),
    precedence_bridges: [nr01Room.carbon, nr01Room.valid] });
  return deepFreeze({ case_id: 'NR03_REVERSE_THE_FOLDER', forward, reversed,
    status_equal: forward.status === reversed.status,
    current_set_equal: forward.current_event_set_fingerprint === reversed.current_event_set_fingerprint });
}

function nr04(nr01Room) {
  const { withdraw, admit } = findBlueConflict(nr01Room.records);
  const reverse = buildWitnessedBridge({ bridge_id: 'RIBBON_REVERSE_VALID', from: admit, to: withdraw,
    witness_payload: 'BLUE_EPOCH_1_ADMIT_PRECEDES_WITHDRAW',
    witness_chain: ['OBSERVE_ADMIT', 'OBSERVE_WITHDRAW', 'BIND_REVERSE_PRECEDENCE'] });
  const result = evaluateRevisionPrecedenceBridgeCustody({ membership_records: nr01Room.records,
    precedence_bridges: [reverse] });
  const blue = result.bundle_resolutions.find(item => item.semantic_event_key === BLUE);
  return deepFreeze({ case_id: 'NR04_REVERSE_THE_RIBBON', reverse, result, blue });
}

function nr05(nr01Room, nr04Room) {
  const result = evaluateRevisionPrecedenceBridgeCustody({ membership_records: nr01Room.records,
    precedence_bridges: [nr01Room.valid, nr04Room.reverse] });
  const blue = result.bundle_resolutions.find(item => item.semantic_event_key === BLUE);
  return deepFreeze({ case_id: 'NR05_TWO_RIBBONS_FIGHTING', result, blue });
}

function nr06(nr01Room) {
  const result = evaluateRevisionPrecedenceBridgeCustody({ membership_records: nr01Room.records,
    precedence_bridges: [nr01Room.carbon] });
  const blue = result.bundle_resolutions.find(item => item.semantic_event_key === BLUE);
  return deepFreeze({ case_id: 'NR06_DECORATIVE_RIBBON', result, blue });
}

function nr07(nr01Room) {
  const revoked = deepFreeze({ ...clone(nr01Room.valid), bridge_id: 'RIBBON_REVOKED', revoked: true });
  const result = evaluateRevisionPrecedenceBridgeCustody({ membership_records: nr01Room.records,
    precedence_bridges: [revoked] });
  const blue = result.bundle_resolutions.find(item => item.semantic_event_key === BLUE);
  return deepFreeze({ case_id: 'NR07_REVOKED_RIBBON', revoked, result, blue });
}

function nr08(nr01Room) {
  const { withdraw } = findBlueConflict(nr01Room.records);
  const outsider = membership({ membership_id: 'OUTSIDER', raw_event_id: 'OUTSIDE', semantic_event_key: BLUE,
    epoch: 1, active: true, revision_kind: 'ADMIT' });
  const wrong = buildWitnessedBridge({ bridge_id: 'RIBBON_WRONG_DRAWER', from: withdraw, to: outsider,
    witness_payload: 'OUT_OF_BUNDLE', witness_chain: ['OBSERVE_WITHDRAW', 'OBSERVE_OUTSIDER'] });
  const result = evaluateRevisionPrecedenceBridgeCustody({ membership_records: nr01Room.records,
    precedence_bridges: [wrong] });
  const blue = result.bundle_resolutions.find(item => item.semantic_event_key === BLUE);
  return deepFreeze({ case_id: 'NR08_WRONG_DRAWER', wrong, result, blue });
}

function nr09() {
  const records = [...baseMembershipRecords(),
    membership({ membership_id: 'ACTIVE_A', raw_event_id: 'BLUE_A', semantic_event_key: BLUE,
      epoch: 1, active: true, revision_kind: 'RENAME_CONTINUOUS', continuity_from_semantic_event_key: BLUE }),
    membership({ membership_id: 'ACTIVE_B', raw_event_id: 'BLUE_B', semantic_event_key: BLUE,
      epoch: 1, active: true, revision_kind: 'RENAME_CONTINUOUS', continuity_from_semantic_event_key: BLUE })
  ];
  const result = evaluateRevisionPrecedenceBridgeCustody({ membership_records: records, precedence_bridges: [] });
  const blue = result.bundle_resolutions.find(item => item.semantic_event_key === BLUE);
  return deepFreeze({ case_id: 'NR09_UNIFORM_BUNDLE_CONTROL', result, blue });
}

function nr10() {
  const inherited = runPedagogueTwoStampsSameMinuteGauntlet();
  return deepFreeze({ case_id: 'NR10_INHERITED_RAW_BINDING_CONFLICT',
    inherited_status: inherited.rooms.tsmm08.inherited_status,
    inherited_current_edge_count: inherited.rooms.tsmm08.inherited_current_edge_count });
}

function nr11(nr01Room) {
  const full = nr01Room.valid;
  const compact = deepFreeze({ ...visibleBridgePayload(full) });
  return deepFreeze({ case_id: 'NR11_BRIDGE_COMPACTION', full, compact,
    precedence_payload_equal: stable(visibleBridgePayload(full)) === stable(compact),
    provenance_equal: false,
    compact_bridge_authority: false });
}

function nr12(nr01Room) {
  const sealed = sealRevisionPrecedenceBridge(nr01Room.valid);
  const mutation = requestSealedRevisionPrecedenceBridgeMutation(sealed, { relation: 'AFTER' });
  return deepFreeze({ case_id: 'NR12_SEALED_BRIDGE_MUTATION', sealed, mutation,
    sealed_still_frozen: Object.isFrozen(sealed) });
}

export function runPedagogueNotaryRibbonGauntlet() {
  const inherited = runPedagogueTwoStampsSameMinuteGauntlet();
  const nr01Room = nr01();
  const nr02Room = nr02(nr01Room);
  const nr03Room = nr03(nr01Room);
  const nr04Room = nr04(nr01Room);
  const nr05Room = nr05(nr01Room, nr04Room);
  const nr06Room = nr06(nr01Room);
  const nr07Room = nr07(nr01Room);
  const nr08Room = nr08(nr01Room);
  const nr09Room = nr09();
  const nr10Room = nr10();
  const nr11Room = nr11(nr01Room);
  const nr12Room = nr12(nr01Room);

  const c9BridgeAwareInsufficiencyEstablished =
    nr01Room.c9.status === 'ABSTAIN_CONFLICTING_SAME_EPOCH_EVENT_MEMBERSHIP' &&
    nr01Room.same_visible_precedence_payload &&
    nr01Room.valid_receipt.status === 'ADMIT_WITNESSED_REVISION_PRECEDENCE_BRIDGE' &&
    nr01Room.carbon_receipt.status === 'REFUSE_UNWITNESSED_REVISION_PRECEDENCE_BRIDGE' &&
    nr01Room.blue.status === 'RESOLVED_BY_WITNESSED_REVISION_PRECEDENCE' &&
    nr01Room.blue.current_active === true;

  const defeat = [];
  if (nr01Room.carbon_receipt.admitted || nr01Room.valid_receipt.admitted !== true) {
    defeat.push('UNWITNESSED_BRIDGE_ADMITTED');
  }
  if (nr01Room.carbon_receipt.replayed_digest === nr01Room.carbon.witness_terminal_digest) {
    defeat.push('REPLAY_DIGEST_MISMATCH_ADMITTED');
  }
  if (!nr02Room.withdraw_fingerprint_equal || !nr02Room.admit_fingerprint_equal ||
      nr02Room.blue.status !== 'RESOLVED_BY_WITNESSED_REVISION_PRECEDENCE' || nr02Room.blue.current_active !== true) {
    defeat.push('MEMBERSHIP_ID_REDIRECTS_BRIDGE');
  }
  if (!nr03Room.status_equal || !nr03Room.current_set_equal) {
    defeat.push('INPUT_ORDER_SELECTS_BRIDGE_AUTHORITY');
  }
  if (nr04Room.blue.status !== 'RESOLVED_BY_WITNESSED_REVISION_PRECEDENCE' || nr04Room.blue.current_active !== false) {
    defeat.push('REVERSED_WITNESSED_PRECEDENCE_NOT_REFLECTED');
  }
  if (nr05Room.blue.status !== 'ABSTAIN_CONFLICTING_OR_CYCLIC_REVISION_PRECEDENCE' ||
      nr05Room.blue.current_active !== null) {
    defeat.push('CYCLIC_PRECEDENCE_FORCED_TO_UNIQUE_RESULT');
  }
  if (!nr06Room.blue.bridge_receipts.some(item => item.status === 'REFUSE_UNWITNESSED_REVISION_PRECEDENCE_BRIDGE') ||
      nr06Room.blue.current_membership_identified) {
    defeat.push('UNWITNESSED_BRIDGE_ADMITTED');
  }
  if (!nr07Room.blue.bridge_receipts.some(item => item.status === 'REFUSE_REVOKED_REVISION_PRECEDENCE_BRIDGE') ||
      nr07Room.blue.current_membership_identified) {
    defeat.push('REVOKED_BRIDGE_RETAINS_AUTHORITY');
  }
  if (!nr08Room.blue.bridge_receipts.some(item => item.status === 'REFUSE_OUT_OF_BUNDLE_REVISION_PRECEDENCE_BRIDGE') ||
      nr08Room.blue.current_membership_identified) {
    defeat.push('OUT_OF_BUNDLE_BRIDGE_ENDPOINT_ADMITTED');
  }
  if (nr09Room.blue.status !== 'UNIFORM_ACTIVE_MEMBERSHIP_EPOCH_BUNDLE' ||
      nr09Room.blue.current_active !== true || nr09Room.blue.bridge_precedence_required) {
    defeat.push('UNIFORM_BUNDLE_FALSELY_REQUIRES_PRECEDENCE');
  }
  if (nr10Room.inherited_status !== 'ABSTAIN_CONFLICTING_EVENT_MEMBERSHIP' ||
      nr10Room.inherited_current_edge_count !== 0) {
    defeat.push('INHERITED_RAW_BINDING_CONFLICT_PROTECTION_LOST');
  }
  if (!nr11Room.precedence_payload_equal || nr11Room.provenance_equal || nr11Room.compact_bridge_authority) {
    defeat.push('BRIDGE_COMPACTION_OVERCLAIMS_PROVENANCE');
  }
  if (nr12Room.mutation.status !== 'SEALED_REVISION_PRECEDENCE_BRIDGE_IMMUTABLE' || nr12Room.mutation.mutated) {
    defeat.push('SEALED_REVISION_PRECEDENCE_BRIDGE_MUTATED');
  }

  return deepFreeze({
    ok: true,
    schema: PEDAGOGUE_REVISION_PRECEDENCE_BRIDGE_CUSTODY_SCHEMA,
    inherited_c9_two_stamps_verdict: inherited.candidate_verdict,
    inherited_c9_bridge_aware_verdict: c9BridgeAwareInsufficiencyEstablished
      ? 'MEMBERSHIP_EPOCH_BUNDLE_C9_FALSIFIED_AS_BRIDGE_AWARE_SUFFICIENT_FORM'
      : 'C9_BRIDGE_AWARE_INSUFFICIENCY_NOT_ESTABLISHED_IN_THIS_RUN',
    c9_bridge_aware_insufficiency_established: c9BridgeAwareInsufficiencyEstablished,
    candidate: 'C10_REVISION_PRECEDENCE_BRIDGE_CUSTODY',
    candidate_status: 'ATTACK_ONLY_NOT_PROMOTED',
    candidate_verdict: defeat.length === 0 && c9BridgeAwareInsufficiencyEstablished
      ? 'REVISION_PRECEDENCE_BRIDGE_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_NOTARY_RIBBON'
      : 'REVISION_PRECEDENCE_BRIDGE_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_NOTARY_RIBBON',
    defeat_conditions: defeat,
    rooms: { nr01: nr01Room, nr02: nr02Room, nr03: nr03Room, nr04: nr04Room,
      nr05: nr05Room, nr06: nr06Room, nr07: nr07Room, nr08: nr08Room,
      nr09: nr09Room, nr10: nr10Room, nr11: nr11Room, nr12: nr12Room },
    synthetic_digest_is_cryptographic_claim: false,
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
      'ATTACK_REVISION_PRECEDENCE_BRIDGE_COMPOSITION_TRANSITIVE_GAPS_AND_WITHDRAWAL_WITHOUT_PROMOTING_TO_DISTRIBUTED_CLOCK_OR_PROVENANCE_ALGEBRA'
  });
}
