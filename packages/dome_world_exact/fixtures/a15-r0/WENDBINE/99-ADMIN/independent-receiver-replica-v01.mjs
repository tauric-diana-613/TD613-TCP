import { inspectPortableLoomReceiverAssurance } from '../../../../../../app/dome-world/holonomy-loom/ai-handoff.js';

const RESULT_SCHEMA = 'td613.independent-receiver-replica-result/v0.1';
const BRIDGE_SCHEMA = 'td613.wendbine-loom-reciprocal-legibility-map/v0.1';
const STICKER_SCHEMA = 'wendbine-sticker-label-taxonomy/v0.1';
const APERTURE_SCHEMA = 'td613.aperture-wendbine-loom-translation-audit-receipt/v0.1';
const PACKET_SCHEMA = 'td613.loom.portable-task/v0.1';

const REPLICA_RESULTS = Object.freeze({
  CLEAN_CONTROL: ['NO_REPAIR_REQUIRED', 'NONE', 'ADMITTED_NO_REPAIR_REQUIRED'],
  SOURCE_BINDING_DRIFT: ['PROVENANCE_BINDING_MISMATCH', 'RESTORE_BOUND_PUBLIC_SOURCE_REFERENCE', 'HELD_REPAIR_PROPOSED'],
  AUTHORITY_PROMOTION: ['DISPLAY_AUTHORITY_PROMOTION', 'RESTORE_DISPLAY_ONLY_NON_AUTHORITY', 'HELD_REPAIR_PROPOSED'],
  RELATION_CLASS_INFLATION: ['UNEARNED_EXACT_PROMOTION', 'RESTORE_PREREGISTERED_RELATION_CLASS', 'HELD_REPAIR_PROPOSED'],
  REPAIR_RECOVERY_COLLAPSE: ['REPAIR_RECOVERY_RETURN_COLLAPSE', 'RESTORE_REPAIR_RECOVERY_RETURN_SEPARATION', 'HELD_REPAIR_PROPOSED'],
  DESTINATION_ENFORCEMENT_PROMOTION: ['PORTABLE_RECEIVER_ASSURANCE_REJECTED', 'RESTORE_DESTINATION_ENFORCEMENT_UNVERIFIED', 'HELD_REPAIR_PROPOSED']
});

function requireObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(`${label}_MUST_BE_OBJECT`);
}

function rejectAnswerLeakage(input) {
  const forbidden = [
    ['prereg', 'PREREGISTRATION_ANSWER_MATERIAL'],
    ['caseId', 'CASE_IDENTITY'],
    ['expectedAnswers', 'EXPECTED_ANSWER_MATERIAL'],
    ['expectedDiagnosis', 'EXPECTED_ANSWER_MATERIAL'],
    ['expectedRepair', 'EXPECTED_ANSWER_MATERIAL'],
    ['custodianNarration', 'CUSTODIAN_NARRATION'],
    ['privateWendbineState', 'PRIVATE_WENDBINE_STATE'],
    ['personIdentityBinding', 'PERSON_IDENTITY_BINDING'],
    ['operatorIdentityBinding', 'OPERATOR_IDENTITY_BINDING'],
    ['unboundedExternalSearch', 'UNBOUNDED_EXTERNAL_SEARCH'],
    ['continuingCustodianAuthority', 'CONTINUING_CUSTODIAN_AUTHORITY']
  ];
  for (const [key, code] of forbidden) {
    const value = input[key];
    if (value !== undefined && value !== null && value !== false) throw new Error(`FORBIDDEN_INPUT:${code}`);
  }
}

function validateInputSurfaces(input) {
  requireObject(input.portablePacket, 'PORTABLE_PACKET');
  requireObject(input.bridgeMap, 'BRIDGE_MAP');
  requireObject(input.stickerTaxonomy, 'STICKER_TAXONOMY');
  requireObject(input.apertureReceipt, 'APERTURE_RECEIPT');
  if (!Array.isArray(input.publicSources)) throw new TypeError('PUBLIC_SOURCES_MUST_BE_ARRAY');

  if (input.portablePacket.schema !== PACKET_SCHEMA) throw new Error('PORTABLE_PACKET_SCHEMA_CHANGED');
  if (input.bridgeMap.schema !== BRIDGE_SCHEMA) throw new Error('BRIDGE_MAP_SCHEMA_CHANGED');
  if (input.stickerTaxonomy.schema !== STICKER_SCHEMA) throw new Error('STICKER_TAXONOMY_SCHEMA_CHANGED');
  if (input.apertureReceipt.schema !== APERTURE_SCHEMA || input.apertureReceipt.bounded_result !== 'APERTURE_TRANSLATION_AUDIT_GREEN') {
    throw new Error('APERTURE_PARENT_NOT_GREEN');
  }
}

function indexSources(publicSources) {
  const index = new Map();
  for (const source of publicSources) {
    if (source && typeof source === 'object' && typeof source.source_id === 'string') index.set(source.source_id, source);
  }
  return index;
}

function findSourceBindingMismatch(input) {
  const index = indexSources(input.publicSources);
  for (const row of input.bridgeMap.rows ?? []) {
    for (const ref of row.wendbine_source_refs ?? []) {
      const source = index.get(ref);
      if (!source) return { row_id: row.id, ref, reason: 'SOURCE_REF_NOT_IN_FROZEN_PUBLIC_REGISTRY' };
      if (source.real_person_identity_adjudicated !== false || source.source_text_stored !== false) {
        return { row_id: row.id, ref, reason: 'SOURCE_BINDING_MEMBRANE_CHANGED' };
      }
    }
  }
  return null;
}

function findDisplayAuthorityPromotion(input) {
  if (input.stickerTaxonomy.scope !== 'DISPLAY_ONLY_NOT_CORPUS_EXPANSION' || input.stickerTaxonomy.authority_transfer !== false) {
    return { sticker_key: 'GLOBAL_TAXONOMY', public_label_witnesses: [] };
  }
  return (input.stickerTaxonomy.entries ?? []).find(entry => entry.label_is_authority !== false) ?? null;
}

function findRepairRecoveryCollapse(input) {
  const row = (input.bridgeMap.rows ?? []).find(candidate => candidate.id === 'safe_return_recovery');
  if (!row || row.relation_class !== 'NON_EQUIVALENT' || row.state !== 'HELD_REPAIR_PATH_IS_NOT_RECOVERY') return row ?? { id: 'safe_return_recovery', wendbine_source_refs: [] };
  return null;
}

function findUnearnedExact(input) {
  return (input.bridgeMap.rows ?? []).find(row => row.relation_class === 'EXACT' && row.operator_identity_witness !== true) ?? null;
}

function assertOpenResidual(input) {
  const row = (input.bridgeMap.rows ?? []).find(candidate => candidate.id === 'right_of_resignation');
  if (!row || row.relation_class !== 'OPEN' || row.state !== 'HELD_NOT_EXPOSED_IN_PORTABLE_PACKET') {
    throw new Error('OUT_OF_FAMILY_FAULT:RIGHT_OF_RESIGNATION_RESIDUAL_CHANGED');
  }
}

function baselineWitnesses(input) {
  const index = indexSources(input.publicSources);
  const witnesses = [];
  for (const row of input.bridgeMap.rows ?? []) {
    for (const ref of row.wendbine_source_refs ?? []) {
      if (index.has(ref)) witnesses.push({ kind: 'PUBLIC_SOURCE_BINDING', row_id: row.id, source_ref: ref, bound: true });
    }
  }
  return witnesses;
}

function makeResult(faultClass, witnesses, receiverAssurance = null) {
  const tuple = REPLICA_RESULTS[faultClass];
  if (!tuple) throw new Error(`UNKNOWN_REPLICA_FAULT:${faultClass}`);
  const [diagnosis, repairProposal, outcome] = tuple;
  return Object.freeze({
    schema: RESULT_SCHEMA,
    fault_class: faultClass,
    diagnosis,
    repair_proposal: repairProposal,
    outcome,
    source_bound_witnesses: witnesses,
    repair_executed: false,
    authority_transferred: false,
    custodian_narration_used: false,
    private_state_used: false,
    external_host_enforced: false,
    case_identity_received: false,
    expected_answer_material_received: false,
    right_of_resignation: 'OPEN',
    safe_return_recovery: 'NON_EQUIVALENT',
    ...(receiverAssurance ? { receiver_assurance: receiverAssurance } : {})
  });
}

export async function replicateArtifactOnlyRepairability(artifactBundle, { crypto = globalThis.crypto } = {}) {
  requireObject(artifactBundle, 'ARTIFACT_BUNDLE');
  rejectAnswerLeakage(artifactBundle);
  validateInputSurfaces(artifactBundle);
  assertOpenResidual(artifactBundle);

  const sourceFault = findSourceBindingMismatch(artifactBundle);
  if (sourceFault) {
    return makeResult('SOURCE_BINDING_DRIFT', [{
      kind: 'PROVENANCE_BINDING_MISMATCH',
      row_id: sourceFault.row_id,
      source_ref: sourceFault.ref,
      reason: sourceFault.reason
    }]);
  }

  const authorityFault = findDisplayAuthorityPromotion(artifactBundle);
  if (authorityFault) {
    return makeResult('AUTHORITY_PROMOTION', (authorityFault.public_label_witnesses ?? []).map(url => ({
      kind: 'PUBLIC_DISPLAY_LABEL_WITNESS',
      sticker_key: authorityFault.sticker_key,
      canonical_url: url
    })));
  }

  const recoveryFault = findRepairRecoveryCollapse(artifactBundle);
  if (recoveryFault) {
    return makeResult('REPAIR_RECOVERY_COLLAPSE', (recoveryFault.wendbine_source_refs ?? []).map(ref => ({
      kind: 'SAFE_RETURN_SOURCE_BINDING',
      row_id: 'safe_return_recovery',
      source_ref: ref
    })));
  }

  const exactFault = findUnearnedExact(artifactBundle);
  if (exactFault) {
    return makeResult('RELATION_CLASS_INFLATION', (exactFault.wendbine_source_refs ?? []).map(ref => ({
      kind: 'RELATION_CLASS_SOURCE_BINDING',
      row_id: exactFault.id,
      source_ref: ref
    })));
  }

  const receiverAssurance = await inspectPortableLoomReceiverAssurance(artifactBundle.portablePacket, { crypto });
  if (receiverAssurance.outcome !== 'ADMITTED' || receiverAssurance.destination_enforcement !== 'UNVERIFIED' || receiverAssurance.authority_transferred !== false) {
    return makeResult('DESTINATION_ENFORCEMENT_PROMOTION', [{
      kind: 'PORTABLE_RECEIVER_ASSURANCE',
      input_digest: artifactBundle.portablePacket.governance?.input_digest ?? null,
      receiver_outcome: receiverAssurance.outcome,
      receiver_reason: receiverAssurance.reason ?? null
    }], receiverAssurance);
  }

  return makeResult('CLEAN_CONTROL', baselineWitnesses(artifactBundle), receiverAssurance);
}
