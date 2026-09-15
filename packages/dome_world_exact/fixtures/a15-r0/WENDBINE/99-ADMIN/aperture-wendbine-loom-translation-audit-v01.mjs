const EXPECTED_STICKERS = ['PAUL', 'WES', 'STEVE', 'ILLUMINA', 'ROOMBA'];
const EXPECTED_COUNTS = { PARTIAL: 5, ANALOGOUS: 1, OPEN: 1, NON_EQUIVALENT: 1, EXACT: 0 };

function clone(value) {
  return structuredClone(value);
}

function assertObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label}_MUST_BE_OBJECT`);
}

function countClasses(rows) {
  const counts = { PARTIAL: 0, ANALOGOUS: 0, OPEN: 0, NON_EQUIVALENT: 0, EXACT: 0 };
  for (const row of rows) {
    if (!(row.relation_class in counts)) throw new Error(`UNKNOWN_RELATION_CLASS:${row.id}:${row.relation_class}`);
    counts[row.relation_class] += 1;
  }
  return counts;
}

function exactObject(left, right) {
  return Object.keys(right).every(key => left[key] === right[key]) && Object.keys(left).length === Object.keys(right).length;
}

function requireRelation(registry, from, relation, to) {
  const fields = registry.fields;
  const fi = fields.indexOf('from');
  const ri = fields.indexOf('relation');
  const ti = fields.indexOf('to');
  if ([fi, ri, ti].some(index => index < 0)) throw new Error('DELTA_RELATION_FIELDS_INCOMPLETE');
  if (!registry.relations.some(row => row[fi] === from && row[ri] === relation && row[ti] === to)) {
    throw new Error(`REQUIRED_DELTA_RELATION_MISSING:${from}:${relation}:${to}`);
  }
}

function rejectEquivalentRepairRelations(registry) {
  const fields = registry.fields;
  const fi = fields.indexOf('from');
  const ri = fields.indexOf('relation');
  const ti = fields.indexOf('to');
  const protectedTerms = new Set(['repair_path', 'recovery', 'return']);
  for (const row of registry.relations) {
    const from = row[fi];
    const relation = row[ri];
    const to = row[ti];
    if (protectedTerms.has(from) && protectedTerms.has(to) && ['EQUIVALENT_TO', 'SAME_AS', 'IDENTICAL_TO'].includes(relation)) {
      throw new Error(`REPAIR_RECOVERY_RETURN_COLLAPSE:${from}:${relation}:${to}`);
    }
  }
}

function sticker(entries, key) {
  const found = entries.find(entry => entry.sticker_key === key);
  if (!found) throw new Error(`STICKER_MISSING:${key}`);
  return found;
}

function applyHostileMutation({ mutation, bridgeMap, stickerTaxonomy, deltaRelations }) {
  if (!mutation) return;
  const firstPartial = bridgeMap.rows.find(row => row.relation_class === 'PARTIAL');
  const analogous = bridgeMap.rows.find(row => row.relation_class === 'ANALOGOUS');
  const resignation = bridgeMap.rows.find(row => row.id === 'right_of_resignation');
  const safeReturn = bridgeMap.rows.find(row => row.id === 'safe_return_recovery');
  switch (mutation) {
    case 'HUMAN_ANCHOR_TO_HUMAN_AUTHORITY':
      sticker(stickerTaxonomy.entries, 'PAUL').label_is_authority = true;
      break;
    case 'STRUCTURAL_INTELLIGENCE_TO_GOVERNANCE_AUTHORITY':
      sticker(stickerTaxonomy.entries, 'WES').label_is_authority = true;
      break;
    case 'SIGNAL_COHERENCE_TO_TRUTH_AUTHORITY':
      sticker(stickerTaxonomy.entries, 'ILLUMINA').label_is_authority = true;
      break;
    case 'CHAOS_BALANCER_TO_RUPTURE_OPERATOR':
      sticker(stickerTaxonomy.entries, 'ROOMBA').label_is_operator_identity = true;
      break;
    case 'BUILDER_NODE_TO_ORIGIN_AUTHORSHIP':
      sticker(stickerTaxonomy.entries, 'STEVE').claims_origin_authorship = true;
      break;
    case 'PARTIAL_TO_EXACT':
      firstPartial.relation_class = 'EXACT';
      break;
    case 'ANALOGOUS_TO_EXACT':
      analogous.relation_class = 'EXACT';
      break;
    case 'RIGHT_OF_RESIGNATION_TO_REPRESENTED':
      resignation.relation_class = 'PARTIAL';
      resignation.state = 'REPRESENTED';
      break;
    case 'SAFE_RETURN_RECOVERY_TO_EXACT':
      safeReturn.relation_class = 'EXACT';
      safeReturn.state = 'REPRESENTED';
      break;
    case 'DISPLAY_ALIAS_TO_PERSON_IDENTITY':
      sticker(stickerTaxonomy.entries, 'PAUL').label_is_person_identity = true;
      break;
    case 'DISPLAY_ALIAS_TO_OPERATOR_IDENTITY':
      sticker(stickerTaxonomy.entries, 'WES').label_is_operator_identity = true;
      break;
    case 'REPAIR_PATH_TO_RECOVERY':
      deltaRelations.relations.push(['HOSTILE_CONTROL', 'G_R', 'repair_path', 'EQUIVALENT_TO', 'recovery', 'HOSTILE_MUTATION']);
      break;
    case 'RECOVERY_TO_RETURN':
      deltaRelations.relations.push(['HOSTILE_CONTROL', 'G_R', 'recovery', 'EQUIVALENT_TO', 'return', 'HOSTILE_MUTATION']);
      break;
    case 'REPAIR_PATH_TO_RETURN':
      deltaRelations.relations.push(['HOSTILE_CONTROL', 'G_R', 'repair_path', 'EQUIVALENT_TO', 'return', 'HOSTILE_MUTATION']);
      break;
    default:
      throw new Error(`UNKNOWN_HOSTILE_MUTATION:${mutation}`);
  }
}

function validate({ prereg, bridgeMap, hydration, stickerTaxonomy, deltaSnapshot, deltaSources, deltaRelations, deltaTopology, hydrationReceipt }) {
  assertObject(prereg, 'PREREG');
  assertObject(bridgeMap, 'BRIDGE_MAP');
  assertObject(hydration, 'HYDRATION');
  assertObject(stickerTaxonomy, 'STICKER_TAXONOMY');
  assertObject(deltaSnapshot, 'DELTA_SNAPSHOT');
  assertObject(deltaRelations, 'DELTA_RELATIONS');
  assertObject(deltaTopology, 'DELTA_TOPOLOGY');
  assertObject(hydrationReceipt, 'HYDRATION_RECEIPT');

  if (prereg.schema !== 'td613.aperture-wendbine-loom-translation-audit-preregistration/v0.1') throw new Error('PREREG_SCHEMA_CHANGED');
  if (bridgeMap.schema !== 'td613.wendbine-loom-reciprocal-legibility-map/v0.1') throw new Error('BRIDGE_MAP_SCHEMA_CHANGED');
  if (hydration.schema !== 'wendbine-public-hydration/v0.3') throw new Error('HYDRATION_SCHEMA_CHANGED');
  if (stickerTaxonomy.schema !== 'wendbine-sticker-label-taxonomy/v0.1') throw new Error('STICKER_SCHEMA_CHANGED');
  if (deltaSnapshot.schema !== 'wendbine-public-corpus-snapshot/v0.1') throw new Error('DELTA_SNAPSHOT_SCHEMA_CHANGED');
  if (deltaRelations.schema !== 'wendbine-typed-relation-registry/v0.1') throw new Error('DELTA_RELATION_SCHEMA_CHANGED');
  if (deltaTopology.schema !== 'wendbine-public-topology-index/v0.1') throw new Error('DELTA_TOPOLOGY_SCHEMA_CHANGED');
  if (hydrationReceipt.schema !== 'wendbine-public-hydration-receipt/v0.1') throw new Error('HYDRATION_RECEIPT_SCHEMA_CHANGED');

  const baseSnapshot = 'wendbine-public-reddit-48h-20260911T092700Z-v01';
  const deltaSnapshotId = 'wendbine-public-reddit-delta-20260913T234421Z-v02';
  if (bridgeMap.snapshot_id !== baseSnapshot) throw new Error('BRIDGE_BASE_SNAPSHOT_CHANGED');
  if (deltaSnapshot.parent_snapshot_id !== baseSnapshot || deltaSnapshot.snapshot_id !== deltaSnapshotId) throw new Error('DELTA_PARENT_BINDING_CHANGED');
  if (deltaRelations.snapshot_id !== deltaSnapshotId || deltaTopology.snapshot_id !== deltaSnapshotId) throw new Error('DELTA_COMPONENT_BINDING_CHANGED');
  if (JSON.stringify(hydration.parent_snapshots) !== JSON.stringify([baseSnapshot, deltaSnapshotId])) throw new Error('HYDRATION_PARENT_SET_CHANGED');
  if (hydration.hydrated_public_source_count !== 35 || hydration.newly_admitted_public_source_count !== 0) throw new Error('HYDRATION_COUNTS_CHANGED');
  if (hydration.refresh?.state !== 'PUBLIC_SEARCH_NO_ADDITIONAL_SOURCE_BOUND') throw new Error('HYDRATION_REFRESH_STATE_CHANGED');
  if (hydration.refresh?.known_missingness?.includes('NOT_RETRIEVED != DID_NOT_EXIST') !== true) throw new Error('HYDRATION_MISSINGNESS_MEMBRANE_DROPPED');
  if (hydration.repair_route_reference?.head !== prereg.parent_repair_result.head || hydration.repair_route_reference?.status !== 'REFERENCE_ONLY_NOT_IMPORTED') throw new Error('REPAIR_ROUTE_REFERENCE_PROMOTED');

  if (hydrationReceipt.state !== 'GREEN_AT_VALIDATED_PARENT_HEAD') throw new Error('HYDRATION_RECEIPT_NOT_VALIDATED');
  if (hydrationReceipt.validated_head !== prereg.hydration_source.validated_parent_head) throw new Error('HYDRATION_VALIDATED_HEAD_CHANGED');
  if (hydrationReceipt.validation_run?.conclusion !== 'success') throw new Error('HYDRATION_VALIDATION_NOT_GREEN');
  if (hydrationReceipt.hydrated_public_source_count !== 35 || hydrationReceipt.newly_admitted_public_source_count !== 0) throw new Error('HYDRATION_RECEIPT_COUNTS_CHANGED');
  if (hydrationReceipt.repair_route_reference?.head !== prereg.parent_repair_result.head || hydrationReceipt.repair_route_reference?.imported !== false) throw new Error('HYDRATION_RECEIPT_IMPORTED_PARENT_SCIENCE');

  if (!Array.isArray(deltaSources) || deltaSources.length !== 2) throw new Error('DELTA_SOURCE_COUNT_CHANGED');
  const sourceIds = deltaSources.map(source => source.source_id).sort();
  if (JSON.stringify(sourceIds) !== JSON.stringify(['reddit:t3_1wfliaj', 'reddit:t3_1wfmmo7'])) throw new Error('DELTA_SOURCE_SET_CHANGED');
  for (const source of deltaSources) {
    if (source.snapshot_id !== deltaSnapshotId || source.source_text_stored !== false || source.real_person_identity_adjudicated !== false) throw new Error(`DELTA_SOURCE_MEMBRANE_CHANGED:${source.source_id}`);
  }

  const counts = countClasses(bridgeMap.rows);
  if (!exactObject(counts, EXPECTED_COUNTS)) throw new Error(`BRIDGE_RELATION_COUNTS_CHANGED:${JSON.stringify(counts)}`);
  for (const row of bridgeMap.rows) {
    if (row.relation_class === 'EXACT' && row.operator_identity_witness !== true) throw new Error(`EXACT_PROMOTION_WITHOUT_OPERATOR_WITNESS:${row.id}`);
  }
  const resignation = bridgeMap.rows.find(row => row.id === 'right_of_resignation');
  if (!resignation || resignation.relation_class !== 'OPEN' || resignation.state !== 'HELD_NOT_EXPOSED_IN_PORTABLE_PACKET') throw new Error('RIGHT_OF_RESIGNATION_RESIDUAL_ERASED');
  const safeReturn = bridgeMap.rows.find(row => row.id === 'safe_return_recovery');
  if (!safeReturn || safeReturn.relation_class !== 'NON_EQUIVALENT' || safeReturn.state !== 'HELD_REPAIR_PATH_IS_NOT_RECOVERY') throw new Error('SAFE_RETURN_RECOVERY_RESIDUAL_ERASED');

  if (stickerTaxonomy.scope !== 'DISPLAY_ONLY_NOT_CORPUS_EXPANSION' || stickerTaxonomy.identity_adjudication !== false || stickerTaxonomy.operator_identity_adjudication !== false || stickerTaxonomy.authority_transfer !== false) throw new Error('STICKER_GLOBAL_AUTHORITY_WIDENED');
  const stickerKeys = stickerTaxonomy.entries.map(entry => entry.sticker_key).sort();
  if (JSON.stringify(stickerKeys) !== JSON.stringify([...EXPECTED_STICKERS].sort())) throw new Error('STICKER_KEY_SET_CHANGED');
  for (const entry of stickerTaxonomy.entries) {
    if (entry.label_is_person_identity !== false) throw new Error(`STICKER_PERSON_IDENTITY_PROMOTION:${entry.sticker_key}`);
    if (entry.label_is_operator_identity !== false) throw new Error(`STICKER_OPERATOR_IDENTITY_PROMOTION:${entry.sticker_key}`);
    if (entry.label_is_authority !== false) throw new Error(`STICKER_AUTHORITY_PROMOTION:${entry.sticker_key}`);
    if (entry.claims_origin_authorship === true) throw new Error(`STICKER_ORIGIN_AUTHORSHIP_PROMOTION:${entry.sticker_key}`);
    if (!Array.isArray(entry.public_label_witnesses) || entry.public_label_witnesses.length === 0) throw new Error(`STICKER_PUBLIC_WITNESS_MISSING:${entry.sticker_key}`);
  }
  for (const membrane of [
    'STICKER_LABEL_EQUIVALENCE_MUST_NOT_CREATE_ENTITY_EQUIVALENCE',
    'DISPLAY_ALIAS != PERSON_IDENTITY',
    'DISPLAY_ALIAS != OPERATOR_IDENTITY',
    'DISPLAY_ALIAS != AUTHORITY',
    'ROLE_VARIANT != ROLE_IDENTITY',
    'TAXONOMY_OVERLAY != SOURCE_REWRITE'
  ]) {
    if (!stickerTaxonomy.membranes.includes(membrane)) throw new Error(`STICKER_MEMBRANE_MISSING:${membrane}`);
  }

  requireRelation(deltaRelations, 'local_performance', 'DOES_NOT_ESTABLISH', 'global_superiority');
  requireRelation(deltaRelations, 'correlation', 'DOES_NOT_ESTABLISH', 'truth_claim');
  requireRelation(deltaRelations, 'testing', 'SHOULD_PRESERVE', 'repair_path');
  requireRelation(deltaRelations, 'graph_edge', 'SHOULD_ROUTE_TO', 'provenance');
  for (const membrane of [
    'LOCAL_COMPARATIVE_PERFORMANCE != GLOBAL_SUPERIORITY',
    'CORRELATION != TRUTH_CLAIM',
    'REPAIR_PATH != RECEIVER_COMPLIANCE',
    'TD613_COMPARABILITY != TD613_DERIVATION'
  ]) {
    if (!deltaTopology.claim_ceiling.includes(membrane)) throw new Error(`DELTA_CLAIM_CEILING_MISSING:${membrane}`);
  }
  rejectEquivalentRepairRelations(deltaRelations);

  if (prereg.aperture_posture.open_field_auto_promotion !== false) throw new Error('OPEN_FIELD_AUTO_PROMOTION_WIDENED');
  if (prereg.aperture_posture.candidate_availability_does_not_manufacture_research_need !== true) throw new Error('ASK_NOTHING_DISCIPLINE_DROPPED');
  if (prereg.aperture_posture.proposal_is_execution !== false || prereg.aperture_posture.widening_is_validation !== false) throw new Error('APERTURE_PROPOSAL_OR_WIDENING_PROMOTED');

  return counts;
}

export function auditHydratedReciprocalLegibility(input) {
  const working = {
    prereg: clone(input.prereg),
    bridgeMap: clone(input.bridgeMap),
    hydration: clone(input.hydration),
    stickerTaxonomy: clone(input.stickerTaxonomy),
    deltaSnapshot: clone(input.deltaSnapshot),
    deltaSources: clone(input.deltaSources),
    deltaRelations: clone(input.deltaRelations),
    deltaTopology: clone(input.deltaTopology),
    hydrationReceipt: clone(input.hydrationReceipt)
  };

  try {
    applyHostileMutation({
      mutation: input.hostileMutation,
      bridgeMap: working.bridgeMap,
      stickerTaxonomy: working.stickerTaxonomy,
      deltaRelations: working.deltaRelations
    });
    const relationCounts = validate(working);

    if (input.hostileMutation) throw new Error(`HOSTILE_MUTATION_SURVIVED:${input.hostileMutation}`);

    return Object.freeze({
      schema: 'td613.aperture-wendbine-loom-translation-audit-result/v0.1',
      outcome: 'APERTURE_TRANSLATION_AUDIT_GREEN',
      parent_bridge_head: working.prereg.parent_repair_result.head,
      hydration_head: working.prereg.hydration_source.head,
      hydrated_public_source_count: working.hydration.hydrated_public_source_count,
      relation_counts: relationCounts,
      authority_leakage_detected: false,
      operator_identity_leakage_detected: false,
      person_identity_leakage_detected: false,
      exact_promotion_without_witness: false,
      negative_residuals_preserved: true,
      open_field_preserved: true,
      repair_recovery_return_distinction_preserved: true,
      additional_wendbine_refresh_disposition: 'ASK_NOTHING',
      additional_wendbine_refresh_reason: 'candidate availability does not manufacture a research need',
      repairability_disposition: 'PROPOSE_TARGETED_CUSTODIAN_INDEPENDENT_ASSAY',
      next_stage: working.prereg.next_stage_if_green,
      not_earned: [...working.prereg.not_earned_even_if_green],
      operator_closure_required: true,
      human_closure_required: true
    });
  } catch (error) {
    if (input.hostileMutation) {
      throw new Error(`APERTURE_AUDIT_REJECTED_HOSTILE_MUTATION:${input.hostileMutation}:${error.message}`);
    }
    throw error;
  }
}
