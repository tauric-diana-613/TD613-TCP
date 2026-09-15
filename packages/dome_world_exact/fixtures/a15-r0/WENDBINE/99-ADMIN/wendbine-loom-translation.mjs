const ALLOWED = new Set(['PARTIAL', 'ANALOGOUS', 'NON_EQUIVALENT', 'OPEN']);

function assertManifest(manifest) {
  if (!manifest || manifest.schema !== 'td613.wendbine-loom-translation-manifest/v0.1') throw new TypeError('unexpected translation manifest');
  if (!Array.isArray(manifest.mappings) || manifest.mappings.length === 0) throw new TypeError('translation manifest has no mappings');
  const ids = new Set();
  for (const row of manifest.mappings) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw new TypeError('translation mapping must be an object');
    if (typeof row.id !== 'string' || !row.id || ids.has(row.id)) throw new TypeError('translation mapping id invalid or duplicated');
    ids.add(row.id);
    if (!ALLOWED.has(row.relation_class)) throw new TypeError('translation relation class is not admitted');
    if (!Array.isArray(row.wendbine_source_refs) || row.wendbine_source_refs.length === 0 || row.wendbine_source_refs.some(ref => typeof ref !== 'string' || !ref.startsWith('reddit:t3_'))) throw new TypeError('translation mapping must remain source-bound');
    if (typeof row.wendbine !== 'string' || !row.wendbine.trim() || typeof row.td613 !== 'string' || !row.td613.trim()) throw new TypeError('translation endpoints must be named');
    if (typeof row.retained_difference !== 'string' || !row.retained_difference.trim()) throw new TypeError('translation mapping must retain a difference statement');
  }
  return manifest;
}

function packet(row, direction) {
  const forward = direction === 'WENDBINE_TO_TD613';
  if (!forward && direction !== 'TD613_TO_WENDBINE') throw new TypeError('translation direction not admitted');
  return {
    schema: 'td613.wendbine-loom-translation-packet/v0.1',
    mapping_id: row.id,
    direction,
    source_expression: forward ? row.wendbine : row.td613,
    translated_expression: forward ? row.td613 : row.wendbine,
    relation_class: row.relation_class,
    source_refs: [...row.wendbine_source_refs],
    retained_difference: row.retained_difference,
    semantic_equivalence_claimed: false,
    authority_transferred: false,
    authorship_transferred: false,
    custody_transferred: false,
    external_receiver_enforcement: 'UNVERIFIED'
  };
}

export function compileWendbineLoomTranslation(manifest) {
  assertManifest(manifest);
  const forward = manifest.mappings.map(row => packet(row, 'WENDBINE_TO_TD613'));
  const reverse = manifest.mappings.map(row => packet(row, 'TD613_TO_WENDBINE'));
  return {
    schema: 'td613.wendbine-loom-translation-family/v0.1',
    state: 'COMPILED_BIDIRECTIONAL_NON_EQUIVALENT_TRANSLATION',
    forward,
    reverse,
    counts: {
      mappings: manifest.mappings.length,
      forward_packets: forward.length,
      reverse_packets: reverse.length,
      exact_equivalence_packets: 0
    },
    invariants: {
      source_refs_preserved: true,
      retained_differences_preserved: true,
      semantic_equivalence_required: false,
      authority_transferred: false,
      authorship_transferred: false,
      custody_transferred: false
    },
    claim_ceiling: [...manifest.claim_ceiling]
  };
}

export function inspectTranslationRoundTrip(family) {
  if (!family || family.schema !== 'td613.wendbine-loom-translation-family/v0.1') throw new TypeError('unexpected translation family');
  const reverseById = new Map(family.reverse.map(item => [item.mapping_id, item]));
  const rows = family.forward.map(forward => {
    const reverse = reverseById.get(forward.mapping_id);
    const preserved = Boolean(reverse) &&
      reverse.translated_expression === forward.source_expression &&
      reverse.source_expression === forward.translated_expression &&
      reverse.relation_class === forward.relation_class &&
      JSON.stringify(reverse.source_refs) === JSON.stringify(forward.source_refs) &&
      reverse.retained_difference === forward.retained_difference;
    return { mapping_id: forward.mapping_id, preserved };
  });
  return {
    schema: 'td613.wendbine-loom-roundtrip-inspection/v0.1',
    outcome: rows.every(row => row.preserved) ? 'ADMITTED' : 'HELD',
    rows,
    authority_transferred: false,
    semantic_equivalence_verified: false,
    independent_human_understanding_verified: false,
    external_interoperability_verified: false
  };
}
