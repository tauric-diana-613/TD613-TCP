import { inspectPortableLoomReceiverAssurance } from '../../../../../../app/dome-world/holonomy-loom/ai-handoff.js';

const RESULT_SCHEMA = 'td613.custodian-independent-repairability-result/v0.1';
const BRIDGE_SCHEMA = 'td613.wendbine-loom-reciprocal-legibility-map/v0.1';
const STICKER_SCHEMA = 'wendbine-sticker-label-taxonomy/v0.1';
const APERTURE_RECEIPT_SCHEMA = 'td613.aperture-wendbine-loom-translation-audit-receipt/v0.1';
const PACKET_SCHEMA = 'td613.loom.portable-task/v0.1';
const SAFE_RETURN_ID = 'safe_return_recovery';
const RIGHT_OF_RESIGNATION_ID = 'right_of_resignation';

const DIAGNOSES = Object.freeze({
  CLEAN_CONTROL: ['NO_REPAIR_REQUIRED', 'NONE'],
  SOURCE_BINDING_DRIFT: ['PROVENANCE_BINDING_MISMATCH', 'RESTORE_BOUND_PUBLIC_SOURCE_REFERENCE'],
  AUTHORITY_PROMOTION: ['DISPLAY_AUTHORITY_PROMOTION', 'RESTORE_DISPLAY_ONLY_NON_AUTHORITY'],
  RELATION_CLASS_INFLATION: ['UNEARNED_EXACT_PROMOTION', 'RESTORE_PREREGISTERED_RELATION_CLASS'],
  REPAIR_RECOVERY_COLLAPSE: ['REPAIR_RECOVERY_RETURN_COLLAPSE', 'RESTORE_REPAIR_RECOVERY_RETURN_SEPARATION'],
  DESTINATION_ENFORCEMENT_PROMOTION: ['PORTABLE_RECEIVER_ASSURANCE_REJECTED', 'RESTORE_DESTINATION_ENFORCEMENT_UNVERIFIED']
});

function clone(value) {
  return structuredClone(value);
}

function object(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(`${label}_MUST_BE_OBJECT`);
  return value;
}

function rejectForbiddenInputs(input) {
  const forbidden = [
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

function validateFrozenInputs(input) {
  object(input.prereg, 'PREREGISTRATION');
  object(input.portablePacket, 'PORTABLE_PACKET');
  object(input.bridgeMap, 'BRIDGE_MAP');
  object(input.stickerTaxonomy, 'STICKER_TAXONOMY');
  object(input.apertureReceipt, 'APERTURE_RECEIPT');
  if (!Array.isArray(input.publicSources)) throw new TypeError('PUBLIC_SOURCES_MUST_BE_ARRAY');

  if (input.prereg.schema !== 'td613.custodian-independent-repairability-preregistration/v0.1') throw new Error('PREREGISTRATION_SCHEMA_CHANGED');
  if (input.bridgeMap.schema !== BRIDGE_SCHEMA) throw new Error('BRIDGE_MAP_SCHEMA_CHANGED');
  if (input.stickerTaxonomy.schema !== STICKER_SCHEMA) throw new Error('STICKER_TAXONOMY_SCHEMA_CHANGED');
  if (input.apertureReceipt.schema !== APERTURE_RECEIPT_SCHEMA || input.apertureReceipt.bounded_result !== 'APERTURE_TRANSLATION_AUDIT_GREEN') throw new Error('APERTURE_PARENT_NOT_GREEN');
  if (input.portablePacket.schema !== PACKET_SCHEMA) throw new Error('PORTABLE_PACKET_SCHEMA_CHANGED');
  if (input.prereg.parent_aperture_audit?.head !== '92a419b518ed8d61382a9918ac77d283fa2b9ee3') throw new Error('PARENT_APERTURE_HEAD_CHANGED');
  if (input.prereg.maximum_green !== 'BOUNDED_ARTIFACT_ONLY_REPAIRABILITY_SUPPORTED') throw new Error('MAXIMUM_GREEN_CHANGED');
}

function publicSourceIndex(publicSources) {
  const index = new Map();
  for (const source of publicSources) {
    if (!source || typeof source !== 'object' || typeof source.source_id !== 'string') continue;
    index.set(source.source_id, source);
  }
  return index;
}

function sourceBindingFault(input) {
  const index = publicSourceIndex(input.publicSources);
  for (const row of input.bridgeMap.rows ?? []) {
    for (const ref of row.wendbine_source_refs ?? []) {
      const source = index.get(ref);
      if (!source) return { row, ref, reason: 'SOURCE_REF_NOT_IN_FROZEN_PUBLIC_REGISTRY' };
      if (source.real_person_identity_adjudicated !== false || source.source_text_stored !== false) {
        return { row, ref, reason: 'SOURCE_BINDING_MEMBRANE_CHANGED' };
      }
    }
  }
  return null;
}

function authorityFault(input) {
  if (input.stickerTaxonomy.scope !== 'DISPLAY_ONLY_NOT_CORPUS_EXPANSION' || input.stickerTaxonomy.authority_transfer !== false) {
    return { sticker_key: 'GLOBAL_TAXONOMY', public_label_witnesses: [] };
  }
  return (input.stickerTaxonomy.entries ?? []).find(entry => entry.label_is_authority !== false) ?? null;
}

function repairRecoveryFault(input) {
  const safeReturn = (input.bridgeMap.rows ?? []).find(row => row.id === SAFE_RETURN_ID);
  if (!safeReturn || safeReturn.relation_class !== 'NON_EQUIVALENT' || safeReturn.state !== 'HELD_REPAIR_PATH_IS_NOT_RECOVERY') return safeReturn ?? { id: SAFE_RETURN_ID, wendbine_source_refs: [] };
  return null;
}

function relationInflationFault(input) {
  return (input.bridgeMap.rows ?? []).find(row => row.relation_class === 'EXACT' && row.operator_identity_witness !== true) ?? null;
}

function assertResidualsOutsideFiniteFault(input) {
  const resignation = (input.bridgeMap.rows ?? []).find(row => row.id === RIGHT_OF_RESIGNATION_ID);
  if (!resignation || resignation.relation_class !== 'OPEN' || resignation.state !== 'HELD_NOT_EXPOSED_IN_PORTABLE_PACKET') {
    throw new Error('OUT_OF_FAMILY_FAULT:RIGHT_OF_RESIGNATION_RESIDUAL_CHANGED');
  }
}

function resultFor(faultId, witnesses, receiverAssurance = null) {
  const tuple = DIAGNOSES[faultId];
  if (!tuple) throw new Error(`UNKNOWN_REPAIRABILITY_FAULT:${faultId}`);
  const [diagnosis, repairProposal] = tuple;
  const clean = faultId === 'CLEAN_CONTROL';
  return Object.freeze({
    schema: RESULT_SCHEMA,
    outcome: clean ? 'ADMITTED_NO_REPAIR_REQUIRED' : 'HELD_REPAIR_PROPOSED',
    fault_id: faultId,
    diagnosis,
    source_bound_witnesses: witnesses,
    repair_proposal: repairProposal,
    repair_executed: false,
    authority_transferred: false,
    custodian_narration_used: false,
    private_state_used: false,
    external_host_enforced: false,
    right_of_resignation: 'OPEN',
    safe_return_recovery: 'NON_EQUIVALENT',
    ...(receiverAssurance ? { receiver_assurance: receiverAssurance } : {})
  });
}

function baselineWitnesses(input) {
  const index = publicSourceIndex(input.publicSources);
  const witnesses = [];
  for (const row of input.bridgeMap.rows ?? []) {
    for (const ref of row.wendbine_source_refs ?? []) {
      if (index.has(ref)) witnesses.push({ kind: 'PUBLIC_SOURCE_BINDING', row_id: row.id, source_ref: ref, bound: true });
    }
  }
  return witnesses;
}

export function seedRepairabilityFault(artifactBundle, faultId) {
  object(artifactBundle, 'ARTIFACT_BUNDLE');
  if (!(faultId in DIAGNOSES)) throw new Error(`UNKNOWN_REPAIRABILITY_FAULT:${faultId}`);
  const seeded = clone(artifactBundle);

  switch (faultId) {
    case 'CLEAN_CONTROL':
      break;
    case 'SOURCE_BINDING_DRIFT': {
      const row = seeded.bridgeMap.rows?.find(candidate => (candidate.wendbine_source_refs?.length ?? 0) > 0);
      if (!row) throw new Error('FAULT_SEED_FAILED:SOURCE_BINDING_DRIFT');
      row.wendbine_source_refs[0] = 'reddit:t3_seeded_source_binding_drift';
      break;
    }
    case 'AUTHORITY_PROMOTION': {
      const entry = seeded.stickerTaxonomy.entries?.[0];
      if (!entry) throw new Error('FAULT_SEED_FAILED:AUTHORITY_PROMOTION');
      entry.label_is_authority = true;
      break;
    }
    case 'RELATION_CLASS_INFLATION': {
      const row = seeded.bridgeMap.rows?.find(candidate => candidate.relation_class === 'PARTIAL');
      if (!row) throw new Error('FAULT_SEED_FAILED:RELATION_CLASS_INFLATION');
      row.relation_class = 'EXACT';
      break;
    }
    case 'REPAIR_RECOVERY_COLLAPSE': {
      const row = seeded.bridgeMap.rows?.find(candidate => candidate.id === SAFE_RETURN_ID);
      if (!row) throw new Error('FAULT_SEED_FAILED:REPAIR_RECOVERY_COLLAPSE');
      row.relation_class = 'EXACT';
      row.state = 'REPRESENTED';
      break;
    }
    case 'DESTINATION_ENFORCEMENT_PROMOTION':
      if (!seeded.portablePacket.portability_assurance) throw new Error('FAULT_SEED_FAILED:DESTINATION_ENFORCEMENT_PROMOTION');
      seeded.portablePacket.portability_assurance.destination_enforcement = 'VERIFIED';
      break;
    default:
      throw new Error(`UNKNOWN_REPAIRABILITY_FAULT:${faultId}`);
  }
  return seeded;
}

export async function evaluateArtifactOnlyRepairability(artifactBundle, { crypto = globalThis.crypto } = {}) {
  object(artifactBundle, 'ARTIFACT_BUNDLE');
  rejectForbiddenInputs(artifactBundle);
  validateFrozenInputs(artifactBundle);
  assertResidualsOutsideFiniteFault(artifactBundle);

  const sourceFault = sourceBindingFault(artifactBundle);
  if (sourceFault) {
    return resultFor('SOURCE_BINDING_DRIFT', [{
      kind: 'PROVENANCE_BINDING_MISMATCH',
      row_id: sourceFault.row.id,
      source_ref: sourceFault.ref,
      reason: sourceFault.reason
    }]);
  }

  const authority = authorityFault(artifactBundle);
  if (authority) {
    return resultFor('AUTHORITY_PROMOTION', (authority.public_label_witnesses ?? []).map(url => ({
      kind: 'PUBLIC_DISPLAY_LABEL_WITNESS',
      sticker_key: authority.sticker_key,
      canonical_url: url
    })));
  }

  const repairCollapse = repairRecoveryFault(artifactBundle);
  if (repairCollapse) {
    return resultFor('REPAIR_RECOVERY_COLLAPSE', (repairCollapse.wendbine_source_refs ?? []).map(ref => ({
      kind: 'SAFE_RETURN_SOURCE_BINDING',
      row_id: SAFE_RETURN_ID,
      source_ref: ref
    })));
  }

  const inflation = relationInflationFault(artifactBundle);
  if (inflation) {
    return resultFor('RELATION_CLASS_INFLATION', (inflation.wendbine_source_refs ?? []).map(ref => ({
      kind: 'RELATION_CLASS_SOURCE_BINDING',
      row_id: inflation.id,
      source_ref: ref
    })));
  }

  const receiverAssurance = await inspectPortableLoomReceiverAssurance(artifactBundle.portablePacket, { crypto });
  if (receiverAssurance.outcome !== 'ADMITTED' || receiverAssurance.destination_enforcement !== 'UNVERIFIED' || receiverAssurance.authority_transferred !== false) {
    return resultFor('DESTINATION_ENFORCEMENT_PROMOTION', [{
      kind: 'PORTABLE_RECEIVER_ASSURANCE',
      input_digest: artifactBundle.portablePacket.governance?.input_digest ?? null,
      receiver_outcome: receiverAssurance.outcome,
      receiver_reason: receiverAssurance.reason ?? null
    }], receiverAssurance);
  }

  return resultFor('CLEAN_CONTROL', baselineWitnesses(artifactBundle), receiverAssurance);
}
