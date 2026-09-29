const RELATION_CLASSES = new Set(['EXACT', 'PARTIAL', 'ANALOGOUS', 'NON_EQUIVALENT', 'OPEN']);

function plainObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(`${label} must be an object`);
}

function valueAt(root, dottedPath) {
  return dottedPath.split('.').reduce((value, key) => value?.[key], root);
}

function sameStrings(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false;
  const a = [...left].sort();
  const b = [...right].sort();
  return a.every((value, index) => value === b[index]);
}

export function compileReciprocalLegibility({ prereg, mapping, crosswalkReceipt, loomPacket, boundary = {} }) {
  plainObject(prereg, 'preregistration');
  plainObject(mapping, 'mapping');
  plainObject(crosswalkReceipt, 'crosswalk receipt');
  plainObject(loomPacket, 'Loom packet');

  if (prereg.schema !== 'td613.wendbine-loom-reciprocal-legibility-preregistration/v0.1') throw new Error('PREREGISTRATION_SCHEMA_CHANGED');
  if (mapping.schema !== 'td613.wendbine-loom-reciprocal-legibility-map/v0.1') throw new Error('MAPPING_SCHEMA_CHANGED');
  if (crosswalkReceipt.schema !== 'wendbine-td613-bounded-assay/v0.1') throw new Error('CROSSWALK_RECEIPT_SCHEMA_CHANGED');
  if (mapping.snapshot_id !== prereg.source_freeze.wendbine_snapshot_id || crosswalkReceipt.source_freeze.snapshot_id !== mapping.snapshot_id) throw new Error('SOURCE_SNAPSHOT_BINDING_CHANGED');
  if (loomPacket.schema !== 'td613.loom.portable-task/v0.1' || loomPacket.portability_assurance?.schema !== 'td613.aia.portable-assurance/v0.1') throw new Error('LOOM_PORTABLE_SURFACE_CHANGED');

  const assertedBoundary = {
    authority_transfer: boundary.authority_transfer ?? mapping.boundary_claims?.authority_transfer,
    custody_transfer: boundary.custody_transfer ?? mapping.boundary_claims?.custody_transfer,
    human_identity_transfer: boundary.human_identity_transfer ?? mapping.boundary_claims?.human_identity_transfer,
    raw_graph_union: boundary.raw_graph_union ?? mapping.boundary_claims?.raw_graph_union
  };
  for (const [name, value] of Object.entries(assertedBoundary)) {
    if (value !== false) throw new Error(`FORBIDDEN_BOUNDARY_PROMOTION:${name}`);
    if (prereg.success_condition?.[name] !== false) throw new Error(`PREREGISTERED_BOUNDARY_CHANGED:${name}`);
  }

  const preregTargets = new Map(prereg.preregistered_translation_targets.map(row => [row.id, row]));
  const crosswalk = new Map(crosswalkReceipt.crosswalk.map(row => [row.id, row]));
  const seen = new Set();
  const rows = [];

  for (const row of mapping.rows ?? []) {
    plainObject(row, 'translation row');
    if (seen.has(row.id)) throw new Error(`DUPLICATE_TRANSLATION_ROW:${row.id}`);
    seen.add(row.id);
    const target = preregTargets.get(row.id);
    if (!target) throw new Error(`UNPREREGISTERED_TRANSLATION_ROW:${row.id}`);
    const donor = crosswalk.get(row.crosswalk_id);
    if (!donor || row.crosswalk_id !== target.wendbine_crosswalk_id) throw new Error(`CROSSWALK_BINDING_MISSING:${row.id}`);
    if (!sameStrings(row.wendbine_source_refs, donor.wendbine_source_refs)) throw new Error(`WENDBINE_SOURCE_BINDING_CHANGED:${row.id}`);
    if (!row.wendbine_source_refs.every(ref => /^reddit:t3_/.test(ref))) throw new Error(`NON_PUBLIC_SOURCE_REF:${row.id}`);
    if (!RELATION_CLASSES.has(row.relation_class) || row.relation_class !== target.expected_class) throw new Error(`RELATION_CLASS_CHANGED:${row.id}`);
    if (row.state !== target.expected_state) throw new Error(`TRANSLATION_STATE_CHANGED:${row.id}`);
    if (!row.loom_to_wendbine?.trim() || !row.wendbine_to_loom?.trim()) throw new Error(`BIDIRECTIONAL_TRANSLATION_MISSING:${row.id}`);
    if (row.human_subject_mapping !== 'NONE') throw new Error(`HUMAN_IDENTITY_MAPPING_FORBIDDEN:${row.id}`);
    if (row.relation_class === 'EXACT' && row.operator_identity_witness !== true) throw new Error(`EXACT_WITHOUT_OPERATOR_IDENTITY_WITNESS:${row.id}`);

    const declaredSurfaces = row.loom_surfaces ?? [];
    const surfaceStates = declaredSurfaces.map(surface => ({ surface, present: valueAt(loomPacket, surface) !== undefined }));
    if (row.state === 'REPRESENTED' && (!declaredSurfaces.length || surfaceStates.some(item => !item.present))) throw new Error(`REPRESENTED_SURFACE_ABSENT:${row.id}`);
    if (row.state === 'HELD_NOT_EXPOSED_IN_PORTABLE_PACKET' && declaredSurfaces.length) throw new Error(`HELD_PORTABLE_SURFACE_FALSELY_DECLARED:${row.id}`);
    if (row.state === 'HELD_REPAIR_PATH_IS_NOT_RECOVERY') {
      if (!declaredSurfaces.length || surfaceStates.some(item => !item.present)) throw new Error(`REPAIR_PATH_WITNESS_MISSING:${row.id}`);
      if (row.relation_class !== 'NON_EQUIVALENT') throw new Error(`REPAIR_PATH_PROMOTED_TO_RECOVERY:${row.id}`);
    }

    rows.push({
      id: row.id,
      crosswalk_id: row.crosswalk_id,
      source_refs: [...row.wendbine_source_refs],
      relation_class: row.relation_class,
      state: row.state,
      loom_surface_states: surfaceStates,
      loom_to_wendbine: row.loom_to_wendbine,
      wendbine_to_loom: row.wendbine_to_loom,
      authority_effect: 'NONE',
      custody_effect: 'NONE',
      human_identity_effect: 'NONE'
    });
  }

  for (const target of prereg.preregistered_translation_targets) {
    if (!seen.has(target.id)) throw new Error(`PREREGISTERED_TARGET_MISSING:${target.id}`);
  }

  const counts = rows.reduce((acc, row) => {
    acc[row.relation_class] = (acc[row.relation_class] ?? 0) + 1;
    acc[row.state] = (acc[row.state] ?? 0) + 1;
    return acc;
  }, {});
  const negativeOrHeld = rows.filter(row => row.relation_class === 'OPEN' || row.relation_class === 'NON_EQUIVALENT' || row.state.startsWith('HELD_'));
  if (!negativeOrHeld.length) throw new Error('NEGATIVE_OR_HELD_ROWS_ERASED');

  return Object.freeze({
    schema: 'td613.wendbine-loom-reciprocal-legibility-result/v0.1',
    outcome: 'BOUNDED_RECIPROCAL_LEGIBILITY_SUPPORTED',
    route: [...prereg.repair_route],
    source_snapshot_id: mapping.snapshot_id,
    directions: [...prereg.directions],
    rows,
    counts,
    membranes: [...prereg.mandatory_membranes],
    authority_transfer: false,
    custody_transfer: false,
    human_identity_transfer: false,
    raw_graph_union: false,
    negative_or_held_rows_preserved: true,
    human_narration_reduction: 'NOT_MEASURED_IN_V01',
    not_earned: [...prereg.not_earned_even_if_green],
    next_stage_if_green: prereg.next_stage_if_green,
    human_closure_required: true
  });
}
