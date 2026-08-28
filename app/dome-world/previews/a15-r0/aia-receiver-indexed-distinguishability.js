import {
  auditDomeWorldCanonicalConstitutionalSource,
  domeWorldConstitutionalSourceSignature,
  compileDomeWorldConstitutionallyFaithfulProjection,
} from './dome-world-constitutional-projection-faithfulness.js';

export const AIA_RECEIVER_INDEXED_DISTINGUISHABILITY_SCHEMA =
  'td613.dome-world.aia-receiver-indexed-distinguishability/v0.1';
export const AIA_RECEIVER_INDEXED_DISTINGUISHABILITY_PARENT_RECEIPT =
  '7639d5b15edc57aa3d76b8669aeefed6d86c12d6';

export const AIA_RECEIVERS = Object.freeze({
  LOOM: 'HOLONOMY_LOOM_TECHNICAL',
  ASH: 'ASH_KEEP_CHILD',
});

const AUTHORITY_KEYS = Object.freeze([
  'inverse',
  'encoder',
  'custody_mutation',
  'release',
  'production',
  'physical_claim',
  'continuum_claim',
]);

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function zeroAuthority() {
  return freeze(Object.fromEntries(AUTHORITY_KEYS.map(key => [key, false])));
}

function technicalObservableVector(receipt) {
  return freeze((receipt?.stratum_panels ?? []).map(panel => freeze({
    stratum: panel.id,
    observable_kind: panel.observable_kind,
  })));
}

function technicalLoomPayload(receipt) {
  const comparisons = [
    ...(receipt.partial_bridges ?? []),
    ...(receipt.comparison_holds ?? []),
    ...(receipt.defined_bridges ?? []),
  ].map(item => freeze({
    from: item.from,
    to: item.to,
    kind: item.kind,
    status: item.status,
    invertible: item.invertible ?? null,
    prohibited_inference: item.prohibited_inference ?? null,
  }));

  return freeze({
    payload_schema: 'td613.dome-world.aia-loom-technical-payload/v0.1',
    strata: freeze((receipt.stratum_panels ?? []).map(panel => freeze({
      id: panel.id,
      observable_kind: panel.observable_kind,
      technical_status: panel.technical_status,
      local_pass: panel.local_pass,
      claim_ceiling: panel.claim_ceiling,
    }))),
    comparisons: freeze(comparisons),
    inspection: freeze({
      comparison_edge_count: receipt.inspection?.comparison_edge_count ?? null,
      partial_bridge_count: receipt.inspection?.partial_bridge_count ?? null,
      hold_count: receipt.inspection?.hold_count ?? null,
      defined_bridge_count: receipt.inspection?.defined_bridge_count ?? null,
    }),
  });
}

function assertAdmittedSource(receipt) {
  const audit = auditDomeWorldCanonicalConstitutionalSource(receipt);
  if (!audit.accepted) {
    throw new Error(`AIA source rejected by #796 constitutional membrane: ${audit.failures.join(', ')}`);
  }
  return audit;
}

export function compileAiaReceiverProjection(receipt, receiver) {
  const sourceAudit = assertAdmittedSource(receipt);
  const constitutionalWitness = domeWorldConstitutionalSourceSignature(receipt);
  let receiverPayload;

  if (receiver === AIA_RECEIVERS.LOOM) {
    receiverPayload = technicalLoomPayload(receipt);
  } else if (receiver === AIA_RECEIVERS.ASH) {
    receiverPayload = compileDomeWorldConstitutionallyFaithfulProjection(receipt).child_surface;
  } else {
    throw new Error(`AIA receiver is undeclared: ${receiver}`);
  }

  return freeze({
    schema: AIA_RECEIVER_INDEXED_DISTINGUISHABILITY_SCHEMA,
    receiver,
    source_parent_receipt: AIA_RECEIVER_INDEXED_DISTINGUISHABILITY_PARENT_RECEIPT,
    constitutional_witness: constitutionalWitness,
    receiver_payload: receiverPayload,
    authority: zeroAuthority(),
    runtime_binding: false,
    source_audit: sourceAudit,
    claim_ceiling: freeze({
      receiver_indexed_payload_projection: true,
      constitutional_custody_recovery: true,
      full_source_reconstruction: false,
      tomography_inverse_authority: false,
      encoder_authority: false,
      semantic_equivalence_authority: false,
      scientific_bridge_promotion_authority: false,
      live_runtime_authority: false,
      production_authority: false,
    }),
  });
}

export function aiaReceiverDistinguishabilityCertificate(leftReceipt, rightReceipt) {
  const leftSignature = domeWorldConstitutionalSourceSignature(leftReceipt);
  const rightSignature = domeWorldConstitutionalSourceSignature(rightReceipt);
  const ashLeft = compileAiaReceiverProjection(leftReceipt, AIA_RECEIVERS.ASH);
  const ashRight = compileAiaReceiverProjection(rightReceipt, AIA_RECEIVERS.ASH);
  const loomLeft = compileAiaReceiverProjection(leftReceipt, AIA_RECEIVERS.LOOM);
  const loomRight = compileAiaReceiverProjection(rightReceipt, AIA_RECEIVERS.LOOM);

  const ashEqual = same(ashLeft.receiver_payload, ashRight.receiver_payload);
  const loomEqual = same(loomLeft.receiver_payload, loomRight.receiver_payload);
  const custodyEqual = same(leftSignature, rightSignature);
  const receiverIndexedAnisotropy = custodyEqual && ashEqual && !loomEqual;

  return freeze({
    custody_signature_equal: custodyEqual,
    ash_payload_equal: ashEqual,
    loom_payload_equal: loomEqual,
    receiver_indexed_anisotropy: receiverIndexedAnisotropy,
    left_technical_observable_vector: technicalObservableVector(leftReceipt),
    right_technical_observable_vector: technicalObservableVector(rightReceipt),
    classification: receiverIndexedAnisotropy
      ? 'SAME_CONSTITUTIONAL_CUSTODY_IS_INDISTINGUISHABLE_TO_ASH_BUT_DISTINGUISHABLE_TO_LOOM_ON_THE_DECLARED_TECHNICAL_PAYLOAD_COORDINATE'
      : 'RECEIVER_INDEXED_ANISOTROPY_NOT_ESTABLISHED_FOR_THIS_PAIR',
    scars: freeze([
      'SAME_SOURCE_CUSTODY != SAME_RECEIVER_PAYLOAD',
      'SAME_CONSTITUTIONAL_WITNESS != SAME_VISIBLE_INFORMATION',
    ]),
  });
}

function partitionByReceiver(receipts, receiver) {
  const blocks = new Map();
  receipts.forEach((receipt, index) => {
    const projection = compileAiaReceiverProjection(receipt, receiver);
    const key = JSON.stringify(projection.receiver_payload);
    if (!blocks.has(key)) blocks.set(key, []);
    blocks.get(key).push(index);
  });
  return freeze([...blocks.values()].map(block => freeze([...block])));
}

function strictlyRefines(fineBlocks, coarseBlocks) {
  const coarseFor = new Map();
  coarseBlocks.forEach((block, coarseIndex) => block.forEach(index => coarseFor.set(index, coarseIndex)));
  const refinement = fineBlocks.every(block => {
    const parentIds = new Set(block.map(index => coarseFor.get(index)));
    return parentIds.size === 1 && !parentIds.has(undefined);
  });
  const strict = refinement && !same(fineBlocks, coarseBlocks);
  return freeze({ refinement, strict });
}

function oneCoordinateTechnicalMutation(canonical, candidate) {
  const left = technicalObservableVector(canonical);
  const right = technicalObservableVector(candidate);
  if (left.length !== right.length) return freeze({ passed: false, changed: [] });
  const changed = left
    .map((row, index) => same(row, right[index]) ? null : freeze({
      index,
      stratum: row.stratum,
      before: row.observable_kind,
      after: right[index]?.observable_kind ?? null,
    }))
    .filter(Boolean);
  return freeze({
    passed: changed.length === 1
      && changed[0].stratum === right[changed[0].index]?.stratum,
    changed: freeze(changed),
  });
}

export function finiteAiaReceiverAnisotropyCertificate(canonicalReceipt, technicalPayloadControls) {
  const receipts = [canonicalReceipt, ...technicalPayloadControls];
  const sourceAudits = receipts.map(auditDomeWorldCanonicalConstitutionalSource);
  const signatures = receipts.map(domeWorldConstitutionalSourceSignature);
  const canonicalSignature = signatures[0];
  const custodyInvariant = signatures.every(signature => same(signature, canonicalSignature));
  const allSourcesAdmitted = sourceAudits.every(audit => audit.accepted);
  const allAuthorityZero = signatures.every(signature => (
    AUTHORITY_KEYS.every(key => signature.source_authority?.[key] === false)
  ));
  const mutationCertificates = technicalPayloadControls.map(control => (
    oneCoordinateTechnicalMutation(canonicalReceipt, control)
  ));
  const eachControlChangesOneTechnicalCoordinate = mutationCertificates.every(row => row.passed);

  const ashPartition = partitionByReceiver(receipts, AIA_RECEIVERS.ASH);
  const loomPartition = partitionByReceiver(receipts, AIA_RECEIVERS.LOOM);
  const refinement = strictlyRefines(loomPartition, ashPartition);

  const ashCollapsesAll = ashPartition.length === 1 && ashPartition[0].length === receipts.length;
  const loomSeparatesAll = loomPartition.length === receipts.length
    && loomPartition.every(block => block.length === 1);
  const noDeterministicAshToLoomReconstruction = ashPartition.some(ashBlock => {
    const loomKeys = new Set(ashBlock.map(index => {
      const projection = compileAiaReceiverProjection(receipts[index], AIA_RECEIVERS.LOOM);
      return JSON.stringify(projection.receiver_payload);
    }));
    return loomKeys.size > 1;
  });

  const custodyRecoveredExactlyFromBoth = receipts.every(receipt => {
    const expected = domeWorldConstitutionalSourceSignature(receipt);
    const ash = compileAiaReceiverProjection(receipt, AIA_RECEIVERS.ASH);
    const loom = compileAiaReceiverProjection(receipt, AIA_RECEIVERS.LOOM);
    return same(ash.constitutional_witness, expected)
      && same(loom.constitutional_witness, expected);
  });

  const passed =
    receipts.length === 5
    && allSourcesAdmitted
    && custodyInvariant
    && allAuthorityZero
    && eachControlChangesOneTechnicalCoordinate
    && ashCollapsesAll
    && loomSeparatesAll
    && refinement.strict
    && noDeterministicAshToLoomReconstruction
    && custodyRecoveredExactlyFromBoth;

  return freeze({
    source_count: receipts.length,
    all_sources_constitutionally_admitted: allSourcesAdmitted,
    constitutional_custody_invariant_across_family: custodyInvariant,
    all_source_authority_coordinates_zero: allAuthorityZero,
    each_control_changes_exactly_one_technical_observable_coordinate: eachControlChangesOneTechnicalCoordinate,
    technical_mutation_certificates: freeze(mutationCertificates),
    ash_partition: ashPartition,
    loom_partition: loomPartition,
    ash_partition_block_count: ashPartition.length,
    loom_partition_block_count: loomPartition.length,
    loom_partition_refines_ash: refinement.refinement,
    loom_partition_strictly_refines_ash: refinement.strict,
    deterministic_ash_to_loom_reconstruction_exists_on_family: !noDeterministicAshToLoomReconstruction,
    constitutional_custody_recovered_exactly_from_both_receivers: custodyRecoveredExactlyFromBoth,
    full_technical_payload_recovered_from_ash: false,
    universal_receiver_order_claimed: false,
    passed,
    classification: passed
      ? 'THE_BOUNDED_DOME_WORLD_RECEIVER_FAMILY_EXHIBITS_RECEIVER_INDEXED_INFORMATION_ANISOTROPY_WITH_LOOM_STRICTLY_REFINING_ASH_ON_THE_PREREGISTERED_FIVE_SOURCE_TECHNICAL_PAYLOAD_FAMILY'
      : 'BOUNDED_AIA_RECEIVER_INDEXED_ANISOTROPY_NOT_ESTABLISHED',
    directional_classification: passed
      ? 'NO_DETERMINISTIC_ASH_TO_LOOM_RECONSTRUCTION_EXISTS_ON_THE_PREREGISTERED_FAMILY_BECAUSE_ONE_ASH_EQUIVALENCE_CLASS_CONTAINS_MULTIPLE_DISTINCT_LOOM_PAYLOADS'
      : 'DIRECTIONAL_NONRECONSTRUCTIBILITY_NOT_ESTABLISHED',
    custody_payload_classification: passed
      ? 'THE_CONSTITUTIONAL_SOURCE_SIGNATURE_IS_RECOVERABLE_EXACTLY_FROM_BOTH_RECEIVERS_WHILE_THE_FULL_TECHNICAL_PAYLOAD_IS_NOT'
      : 'CUSTODY_PAYLOAD_RECOVERABILITY_SPLIT_NOT_ESTABLISHED',
  });
}

export function rejectAiaReceiverProjectionOverreach(candidate) {
  const receiverDeclared = Object.values(AIA_RECEIVERS).includes(candidate?.receiver);
  const witnessPresent = candidate?.constitutional_witness
    && typeof candidate.constitutional_witness === 'object';
  const authorityWidened = Object.values(candidate?.authority ?? {}).some(Boolean);
  const runtimeBinding = candidate?.runtime_binding === true;
  const inverseClaimed = candidate?.claim_ceiling?.tomography_inverse_authority === true;
  const encoderClaimed = candidate?.claim_ceiling?.encoder_authority === true;
  const semanticClaimed = candidate?.claim_ceiling?.semantic_equivalence_authority === true;
  const scientificPromotion = candidate?.claim_ceiling?.scientific_bridge_promotion_authority === true;
  const fullSourceReconstruction = candidate?.claim_ceiling?.full_source_reconstruction === true;

  const accepted = receiverDeclared
    && Boolean(witnessPresent)
    && !authorityWidened
    && !runtimeBinding
    && !inverseClaimed
    && !encoderClaimed
    && !semanticClaimed
    && !scientificPromotion
    && !fullSourceReconstruction;

  return freeze({
    accepted,
    receiver_declared: receiverDeclared,
    constitutional_witness_present: Boolean(witnessPresent),
    authority_widened: authorityWidened,
    runtime_binding_attempted: runtimeBinding,
    tomography_inverse_claimed: inverseClaimed,
    encoder_authority_claimed: encoderClaimed,
    semantic_equivalence_claimed: semanticClaimed,
    scientific_bridge_promotion_claimed: scientificPromotion,
    full_source_reconstruction_claimed: fullSourceReconstruction,
    classification: accepted
      ? 'AIA_RECEIVER_PROJECTION_BOUNDARY_PRESERVED'
      : 'AIA_RECEIVER_PROJECTION_OVERREACH_REJECTED',
  });
}
