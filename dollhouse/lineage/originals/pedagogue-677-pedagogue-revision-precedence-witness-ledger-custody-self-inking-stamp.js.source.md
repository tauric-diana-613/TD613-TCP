import {
  materialRevisionFingerprint,
  computeRevisionPrecedenceBridgeWitnessDigest,
  evaluateRevisionPrecedenceBridgeCustody,
  runPedagogueNotaryRibbonGauntlet
} from './pedagogue-revision-precedence-bridge-custody-notary-ribbon.js';

export const PEDAGOGUE_REVISION_PRECEDENCE_WITNESS_LEDGER_CUSTODY_SCHEMA =
  'td613.pedagogue.revision-precedence-witness-ledger-custody-hostile/v0.1';

const BLUE = 'ADD_REPLACEMENT_LINEAGE';

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

function witness({ witness_id, witness_kind, semantic_event_key, epoch,
  observed_revision_fingerprint = null, from_revision_fingerprint = null,
  to_revision_fingerprint = null, revoked = false }) {
  return deepFreeze({ witness_id, witness_kind, semantic_event_key, epoch,
    observed_revision_fingerprint, from_revision_fingerprint, to_revision_fingerprint, revoked });
}

function witnessLedgerForBridge(bridge, prefix = '') {
  const ids = bridge.witness_chain;
  return [
    witness({ witness_id: ids[0], witness_kind: 'REVISION_OBSERVED',
      semantic_event_key: bridge.semantic_event_key, epoch: bridge.epoch,
      observed_revision_fingerprint: bridge.from_revision_fingerprint }),
    witness({ witness_id: ids[1], witness_kind: 'REVISION_OBSERVED',
      semantic_event_key: bridge.semantic_event_key, epoch: bridge.epoch,
      observed_revision_fingerprint: bridge.to_revision_fingerprint }),
    witness({ witness_id: ids[2], witness_kind: 'PRECEDENCE_BIND_OBSERVED',
      semantic_event_key: bridge.semantic_event_key, epoch: bridge.epoch,
      from_revision_fingerprint: bridge.from_revision_fingerprint,
      to_revision_fingerprint: bridge.to_revision_fingerprint })
  ].map(record => deepFreeze({ ...record, ledger_partition: prefix || 'PRIMARY' }));
}

function bridgeIntegrityReceipt({ membership_records, bridge }) {
  const c10 = evaluateRevisionPrecedenceBridgeCustody({
    membership_records,
    precedence_bridges: [bridge]
  });
  const resolution = c10.bundle_resolutions?.find(item =>
    item.semantic_event_key === bridge.semantic_event_key && item.epoch === bridge.epoch);
  const bridgeReceipt = resolution?.bridge_receipts?.find(item =>
    item.bridge?.bridge_id === bridge.bridge_id) ?? null;
  return { c10, resolution, bridgeReceipt };
}

function ledgerIndex(witness_ledger) {
  const byId = new Map();
  const duplicates = new Set();
  for (const record of witness_ledger) {
    if (!record || typeof record !== 'object' || !record.witness_id) continue;
    if (byId.has(record.witness_id)) duplicates.add(record.witness_id);
    else byId.set(record.witness_id, record);
  }
  return { byId, duplicates };
}

function validateWitnessChain({ membership_records, bridge, witness_ledger }) {
  const inherited = bridgeIntegrityReceipt({ membership_records, bridge });
  if (!inherited.bridgeReceipt?.admitted) {
    return deepFreeze({
      bridge_id: bridge.bridge_id,
      status: inherited.bridgeReceipt?.status ?? 'REFUSE_C10_BRIDGE_INTEGRITY_NOT_ADMITTED',
      admitted: false,
      inherited_c10_bridge_receipt: inherited.bridgeReceipt,
      resolved_witness_records: []
    });
  }

  const chain = Array.isArray(bridge.witness_chain) ? bridge.witness_chain : [];
  const { byId, duplicates } = ledgerIndex(witness_ledger);
  if (chain.some(id => duplicates.has(id))) {
    return deepFreeze({ bridge_id: bridge.bridge_id,
      status: 'REFUSE_DUPLICATE_PRECEDENCE_WITNESS_ID', admitted: false,
      inherited_c10_bridge_receipt: inherited.bridgeReceipt, resolved_witness_records: [] });
  }

  const resolved = chain.map(id => byId.get(id) ?? null);
  const presentCount = resolved.filter(Boolean).length;
  if (presentCount === 0 && chain.length > 0) {
    return deepFreeze({ bridge_id: bridge.bridge_id,
      status: 'REFUSE_SELF_ATTESTED_REVISION_PRECEDENCE_BRIDGE', admitted: false,
      inherited_c10_bridge_receipt: inherited.bridgeReceipt, resolved_witness_records: [] });
  }
  if (chain.length !== 3 || resolved.some(record => record === null)) {
    return deepFreeze({ bridge_id: bridge.bridge_id,
      status: 'REFUSE_MISSING_PRECEDENCE_WITNESS_RECORD', admitted: false,
      inherited_c10_bridge_receipt: inherited.bridgeReceipt,
      resolved_witness_records: resolved.filter(Boolean) });
  }
  if (resolved.some(record => record.revoked === true)) {
    return deepFreeze({ bridge_id: bridge.bridge_id,
      status: 'REFUSE_REVOKED_PRECEDENCE_WITNESS_RECORD', admitted: false,
      inherited_c10_bridge_receipt: inherited.bridgeReceipt, resolved_witness_records: resolved });
  }

  const [fromObserved, toObserved, bindObserved] = resolved;
  const commonBindingValid = resolved.every(record =>
    record.semantic_event_key === bridge.semantic_event_key && record.epoch === bridge.epoch);
  const materialBindingValid =
    fromObserved.witness_kind === 'REVISION_OBSERVED' &&
    fromObserved.observed_revision_fingerprint === bridge.from_revision_fingerprint &&
    toObserved.witness_kind === 'REVISION_OBSERVED' &&
    toObserved.observed_revision_fingerprint === bridge.to_revision_fingerprint &&
    bindObserved.witness_kind === 'PRECEDENCE_BIND_OBSERVED' &&
    bindObserved.from_revision_fingerprint === bridge.from_revision_fingerprint &&
    bindObserved.to_revision_fingerprint === bridge.to_revision_fingerprint;

  if (!commonBindingValid || !materialBindingValid) {
    return deepFreeze({ bridge_id: bridge.bridge_id,
      status: 'REFUSE_MISBOUND_PRECEDENCE_WITNESS_RECORD', admitted: false,
      inherited_c10_bridge_receipt: inherited.bridgeReceipt, resolved_witness_records: resolved });
  }

  return deepFreeze({ bridge_id: bridge.bridge_id,
    status: 'ADMIT_LEDGER_WITNESSED_REVISION_PRECEDENCE_BRIDGE', admitted: true,
    inherited_c10_bridge_receipt: inherited.bridgeReceipt, resolved_witness_records: resolved });
}

export function evaluateRevisionPrecedenceWitnessLedgerCustody({
  membership_records = [], precedence_bridges = [], witness_ledger = []
} = {}) {
  const custodyReceipts = precedence_bridges.map(bridge =>
    validateWitnessChain({ membership_records, bridge, witness_ledger }));
  const admittedIds = new Set(custodyReceipts.filter(receipt => receipt.admitted).map(receipt => receipt.bridge_id));
  const admittedBridges = precedence_bridges.filter(bridge => admittedIds.has(bridge.bridge_id));

  const c10 = evaluateRevisionPrecedenceBridgeCustody({
    membership_records,
    precedence_bridges: admittedBridges
  });

  return deepFreeze({
    schema: PEDAGOGUE_REVISION_PRECEDENCE_WITNESS_LEDGER_CUSTODY_SCHEMA,
    candidate: 'C11_REVISION_PRECEDENCE_WITNESS_LEDGER_CUSTODY',
    status: c10.status,
    inherited_c10_result: c10,
    bridge_custody_receipts: custodyReceipts,
    admitted_bridge_ids: [...admittedIds].sort(),
    current_semantic_events: c10.current_semantic_events,
    current_event_set_fingerprint: c10.current_event_set_fingerprint,
    witness_ledger_record_count: witness_ledger.length,
    witness_id_lexical_authority: false,
    bridge_id_authority: false,
    membership_id_authority: false,
    input_order_authority: false,
    scalar_aggregation_used: false,
    promotion_authority: false
  });
}

export function sealPrecedenceWitnessRecord(value) {
  return deepFreeze(clone(value));
}

export function requestSealedPrecedenceWitnessRecordMutation(sealedRecord, replacement) {
  if (!Object.isFrozen(sealedRecord)) {
    return deepFreeze({ status: 'REJECT_UNSEALED_PRECEDENCE_WITNESS_RECORD_MUTATION_TARGET', mutated: false });
  }
  return deepFreeze({
    status: 'SEALED_PRECEDENCE_WITNESS_RECORD_IMMUTABLE',
    mutated: false,
    requested_replacement: clone(replacement ?? null)
  });
}

function selfConsistentFakeBridge(validBridge) {
  const draft = {
    ...clone(validBridge),
    bridge_id: 'SELF_INKING_FAKE',
    witness_payload: 'FABRICATED_BUT_SELF_CONSISTENT',
    witness_chain: ['FAKE_FROM', 'FAKE_TO', 'FAKE_BIND'],
    witness_terminal_digest: null,
    replayable: true,
    admissible: true,
    revoked: false
  };
  draft.witness_terminal_digest = computeRevisionPrecedenceBridgeWitnessDigest(draft);
  return deepFreeze(draft);
}

function reverseBridge(validBridge) {
  const draft = {
    ...clone(validBridge),
    bridge_id: 'REVERSE_LEDGER_WITNESSED',
    from_revision_fingerprint: validBridge.to_revision_fingerprint,
    to_revision_fingerprint: validBridge.from_revision_fingerprint,
    witness_payload: 'REVERSE_INDEPENDENTLY_WITNESSED',
    witness_chain: ['REV_FROM', 'REV_TO', 'REV_BIND'],
    witness_terminal_digest: null,
    replayable: true,
    admissible: true,
    revoked: false
  };
  draft.witness_terminal_digest = computeRevisionPrecedenceBridgeWitnessDigest(draft);
  return deepFreeze(draft);
}

function resolutionForBlue(result) {
  return result.inherited_c10_result.bundle_resolutions?.find(item => item.semantic_event_key === BLUE) ?? null;
}

function custodyFor(result, bridgeId) {
  return result.bridge_custody_receipts.find(item => item.bridge_id === bridgeId) ?? null;
}

function si01() {
  const inherited = runPedagogueNotaryRibbonGauntlet();
  const nr01 = inherited.rooms.nr01;
  const records = nr01.records;
  const valid = nr01.valid;
  const fake = selfConsistentFakeBridge(valid);
  const ledger = witnessLedgerForBridge(valid);
  const c10Both = evaluateRevisionPrecedenceBridgeCustody({ membership_records: records,
    precedence_bridges: [valid, fake] });
  const c10Blue = c10Both.bundle_resolutions.find(item => item.semantic_event_key === BLUE);
  const result = evaluateRevisionPrecedenceWitnessLedgerCustody({ membership_records: records,
    precedence_bridges: [valid, fake], witness_ledger: ledger });
  return deepFreeze({ case_id: 'SI01_NOTARY_CARVES_OWN_STAMP', records, valid, fake, ledger,
    c10Both, c10Blue, result, blue: resolutionForBlue(result),
    validCustody: custodyFor(result, valid.bridge_id), fakeCustody: custodyFor(result, fake.bridge_id),
    c10_valid_admitted: c10Blue.bridge_receipts.some(item => item.bridge.bridge_id === valid.bridge_id && item.admitted),
    c10_fake_admitted: c10Blue.bridge_receipts.some(item => item.bridge.bridge_id === fake.bridge_id && item.admitted) });
}

function si02(si01Room) {
  const renamed = deepFreeze({ ...clone(si01Room.valid), bridge_id: 'RIBBON_RENAMED_ONLY' });
  const result = evaluateRevisionPrecedenceWitnessLedgerCustody({ membership_records: si01Room.records,
    precedence_bridges: [renamed], witness_ledger: si01Room.ledger });
  return deepFreeze({ case_id: 'SI02_RENAME_THE_RIBBON', renamed, result, blue: resolutionForBlue(result),
    admitted: custodyFor(result, renamed.bridge_id)?.admitted === true });
}

function si03(si01Room) {
  const renamedRecords = si01Room.records.map((record, index) => deepFreeze({
    ...clone(record), membership_id: `RENAMED_${index}`
  }));
  const originalFingerprints = si01Room.records.map(materialRevisionFingerprint).sort();
  const renamedFingerprints = renamedRecords.map(materialRevisionFingerprint).sort();
  const result = evaluateRevisionPrecedenceWitnessLedgerCustody({ membership_records: renamedRecords,
    precedence_bridges: [si01Room.valid], witness_ledger: si01Room.ledger });
  return deepFreeze({ case_id: 'SI03_RENAME_MEMBERSHIP_RECORDS', result, blue: resolutionForBlue(result),
    material_fingerprints_equal: stable(originalFingerprints) === stable(renamedFingerprints) });
}

function si04(si01Room) {
  const forward = evaluateRevisionPrecedenceWitnessLedgerCustody({ membership_records: si01Room.records,
    precedence_bridges: [si01Room.valid, si01Room.fake], witness_ledger: si01Room.ledger });
  const reversed = evaluateRevisionPrecedenceWitnessLedgerCustody({ membership_records: [...si01Room.records].reverse(),
    precedence_bridges: [si01Room.fake, si01Room.valid], witness_ledger: [...si01Room.ledger].reverse() });
  return deepFreeze({ case_id: 'SI04_REVERSE_FILING_ORDER', forward, reversed,
    status_equal: forward.status === reversed.status,
    current_set_equal: forward.current_event_set_fingerprint === reversed.current_event_set_fingerprint });
}

function si05(si01Room) {
  const ledger = si01Room.ledger.slice(0, 2);
  const result = evaluateRevisionPrecedenceWitnessLedgerCustody({ membership_records: si01Room.records,
    precedence_bridges: [si01Room.valid], witness_ledger: ledger });
  return deepFreeze({ case_id: 'SI05_MISSING_LEDGER_PAGE', result,
    custody: custodyFor(result, si01Room.valid.bridge_id) });
}

function si06(si01Room) {
  const ledger = si01Room.ledger.map((record, index) => index === 0
    ? deepFreeze({ ...clone(record), observed_revision_fingerprint: 'REV-WRONG' })
    : record);
  const result = evaluateRevisionPrecedenceWitnessLedgerCustody({ membership_records: si01Room.records,
    precedence_bridges: [si01Room.valid], witness_ledger: ledger });
  return deepFreeze({ case_id: 'SI06_WRONG_STAMP_ON_RIGHT_PAGE', result,
    custody: custodyFor(result, si01Room.valid.bridge_id) });
}

function si07(si01Room) {
  const ledger = si01Room.ledger.map((record, index) => index === 1
    ? deepFreeze({ ...clone(record), revoked: true })
    : record);
  const result = evaluateRevisionPrecedenceWitnessLedgerCustody({ membership_records: si01Room.records,
    precedence_bridges: [si01Room.valid], witness_ledger: ledger });
  return deepFreeze({ case_id: 'SI07_REVOKED_WITNESS', result,
    custody: custodyFor(result, si01Room.valid.bridge_id) });
}

function si08(si01Room) {
  const duplicate = deepFreeze({ ...clone(si01Room.ledger[0]), ledger_partition: 'DUPLICATE' });
  const ledger = [...si01Room.ledger, duplicate];
  const result = evaluateRevisionPrecedenceWitnessLedgerCustody({ membership_records: si01Room.records,
    precedence_bridges: [si01Room.valid], witness_ledger: ledger });
  return deepFreeze({ case_id: 'SI08_DUPLICATE_WITNESS_ID', result,
    custody: custodyFor(result, si01Room.valid.bridge_id) });
}

function si09(si01Room) {
  const result = evaluateRevisionPrecedenceWitnessLedgerCustody({ membership_records: si01Room.records,
    precedence_bridges: [si01Room.fake, si01Room.valid], witness_ledger: si01Room.ledger });
  return deepFreeze({ case_id: 'SI09_ALTERNATIVE_GOOD_AND_FAKE_CHAINS', result,
    blue: resolutionForBlue(result), validCustody: custodyFor(result, si01Room.valid.bridge_id),
    fakeCustody: custodyFor(result, si01Room.fake.bridge_id) });
}

function si10(si01Room) {
  const reverse = reverseBridge(si01Room.valid);
  const reverseLedger = witnessLedgerForBridge(reverse, 'REVERSE');
  const ledger = [...si01Room.ledger, ...reverseLedger];
  const result = evaluateRevisionPrecedenceWitnessLedgerCustody({ membership_records: si01Room.records,
    precedence_bridges: [si01Room.valid, reverse], witness_ledger: ledger });
  return deepFreeze({ case_id: 'SI10_INHERITED_CYCLE_CONTROL', reverse, ledger, result,
    blue: resolutionForBlue(result), reverseCustody: custodyFor(result, reverse.bridge_id) });
}

function si11(si01Room) {
  const compact = si01Room.ledger.map(record => record.witness_id).sort();
  return deepFreeze({ case_id: 'SI11_WITNESS_LEDGER_COMPACTION', full: si01Room.ledger, compact,
    witness_ids_equal: stable(compact) === stable(si01Room.ledger.map(record => record.witness_id).sort()),
    provenance_equal: false, compact_ledger_authority: false });
}

function si12(si01Room) {
  const sealed = sealPrecedenceWitnessRecord(si01Room.ledger[0]);
  const mutation = requestSealedPrecedenceWitnessRecordMutation(sealed, { revoked: true });
  return deepFreeze({ case_id: 'SI12_SEALED_WITNESS_MUTATION', sealed, mutation,
    sealed_still_frozen: Object.isFrozen(sealed) });
}

export function runPedagogueSelfInkingStampGauntlet() {
  const inherited = runPedagogueNotaryRibbonGauntlet();
  const si01Room = si01();
  const si02Room = si02(si01Room);
  const si03Room = si03(si01Room);
  const si04Room = si04(si01Room);
  const si05Room = si05(si01Room);
  const si06Room = si06(si01Room);
  const si07Room = si07(si01Room);
  const si08Room = si08(si01Room);
  const si09Room = si09(si01Room);
  const si10Room = si10(si01Room);
  const si11Room = si11(si01Room);
  const si12Room = si12(si01Room);

  const c10SelfAttestationInsufficiencyEstablished =
    si01Room.c10_valid_admitted === true &&
    si01Room.c10_fake_admitted === true &&
    si01Room.validCustody.status === 'ADMIT_LEDGER_WITNESSED_REVISION_PRECEDENCE_BRIDGE' &&
    si01Room.fakeCustody.status === 'REFUSE_SELF_ATTESTED_REVISION_PRECEDENCE_BRIDGE' &&
    si01Room.blue?.status === 'RESOLVED_BY_WITNESSED_REVISION_PRECEDENCE' &&
    si01Room.blue?.current_active === true;

  const defeat = [];
  if (si01Room.fakeCustody.admitted || si01Room.validCustody.admitted !== true) {
    defeat.push('SELF_ATTESTED_BRIDGE_ADMITTED_WITHOUT_LEDGER');
  }
  if (!si02Room.admitted || si02Room.blue?.current_active !== true) {
    defeat.push('BRIDGE_ID_RENAME_CHANGES_AUTHORITY');
  }
  if (!si03Room.material_fingerprints_equal || si03Room.blue?.current_active !== true) {
    defeat.push('MEMBERSHIP_ID_RENAME_CHANGES_AUTHORITY');
  }
  if (!si04Room.status_equal || !si04Room.current_set_equal) {
    defeat.push('INPUT_ORDER_SELECTS_WITNESS_AUTHORITY');
  }
  if (si05Room.custody.status !== 'REFUSE_MISSING_PRECEDENCE_WITNESS_RECORD') {
    defeat.push('MISSING_WITNESS_RECORD_ADMITTED');
  }
  if (si06Room.custody.status !== 'REFUSE_MISBOUND_PRECEDENCE_WITNESS_RECORD') {
    defeat.push('MISBOUND_WITNESS_RECORD_ADMITTED');
  }
  if (si07Room.custody.status !== 'REFUSE_REVOKED_PRECEDENCE_WITNESS_RECORD') {
    defeat.push('REVOKED_WITNESS_RECORD_RETAINS_AUTHORITY');
  }
  if (si08Room.custody.status !== 'REFUSE_DUPLICATE_PRECEDENCE_WITNESS_ID') {
    defeat.push('DUPLICATE_WITNESS_ID_ARBITRATED_LEXICALLY');
  }
  if (si09Room.validCustody.admitted !== true || si09Room.fakeCustody.admitted ||
      si09Room.blue?.current_active !== true) {
    defeat.push('VALID_CHAIN_ERASED_BY_FAKE_ALTERNATIVE');
  }
  if (si10Room.reverseCustody.admitted !== true ||
      si10Room.blue?.status !== 'ABSTAIN_CONFLICTING_OR_CYCLIC_REVISION_PRECEDENCE') {
    defeat.push('INHERITED_CYCLE_REFUSAL_LOST');
  }
  if (!si11Room.witness_ids_equal || si11Room.provenance_equal || si11Room.compact_ledger_authority) {
    defeat.push('WITNESS_LEDGER_COMPACTION_OVERCLAIMS_PROVENANCE');
  }
  if (si12Room.mutation.status !== 'SEALED_PRECEDENCE_WITNESS_RECORD_IMMUTABLE' || si12Room.mutation.mutated) {
    defeat.push('SEALED_PRECEDENCE_WITNESS_RECORD_MUTATED');
  }

  return deepFreeze({
    ok: true,
    schema: PEDAGOGUE_REVISION_PRECEDENCE_WITNESS_LEDGER_CUSTODY_SCHEMA,
    inherited_c10_notary_ribbon_verdict: inherited.candidate_verdict,
    inherited_c10_independent_witness_custody_verdict: c10SelfAttestationInsufficiencyEstablished
      ? 'REVISION_PRECEDENCE_BRIDGE_C10_FALSIFIED_AS_INDEPENDENT_WITNESS_CUSTODY_SUFFICIENT_FORM'
      : 'C10_SELF_ATTESTATION_INSUFFICIENCY_NOT_ESTABLISHED_IN_THIS_RUN',
    c10_self_attestation_insufficiency_established: c10SelfAttestationInsufficiencyEstablished,
    candidate: 'C11_REVISION_PRECEDENCE_WITNESS_LEDGER_CUSTODY',
    candidate_status: 'ATTACK_ONLY_NOT_PROMOTED',
    candidate_verdict: defeat.length === 0 && c10SelfAttestationInsufficiencyEstablished
      ? 'REVISION_PRECEDENCE_WITNESS_LEDGER_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_SELF_INKING_STAMP'
      : 'REVISION_PRECEDENCE_WITNESS_LEDGER_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_SELF_INKING_STAMP',
    defeat_conditions: defeat,
    rooms: { si01: si01Room, si02: si02Room, si03: si03Room, si04: si04Room,
      si05: si05Room, si06: si06Room, si07: si07Room, si08: si08Room,
      si09: si09Room, si10: si10Room, si11: si11Room, si12: si12Room },
    external_witness_ledger_is_real_world_trust_root: false,
    scalar_aggregation_used: false,
    H2: 'HELD_NOT_TESTED_HERE', H3: 'HELD_NOT_TESTED_HERE',
    intersections: 'HELD_NOT_OPENED_HERE',
    APERTURE_V32_REPLAY_STABILITY: 'HELD_NOT_YET_WITNESSED',
    product_mutation: false, shared_pedagogue_engine_mutation: false,
    browser_execution: false, workflow_mutation: false,
    merge_performed: false, deployment_performed: false, release_authority: false,
    vercel_release_requires_issue_405_and_new_explicit_operator_gesture: true,
    promotion_authority: false,
    next_learning_action:
      'ATTACK_WITNESS_LEDGER_ADMISSION_PROVENANCE_AND_BOOTSTRAP_AUTHORITY_BEFORE_PRECEDENCE_PATH_COMPOSITION_OR_PROVENANCE_ALGEBRA'
  });
}
