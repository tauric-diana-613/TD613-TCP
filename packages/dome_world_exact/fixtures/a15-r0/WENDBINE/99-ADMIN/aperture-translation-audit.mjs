const CLAIMS_FORBIDDEN = [
  'semantic_equivalence_claimed',
  'authority_transferred',
  'authorship_transferred',
  'custody_transferred'
];

function validWitness(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
    && typeof value.repository_path === 'string' && value.repository_path.length > 0
    && typeof value.test_pattern === 'string' && value.test_pattern.length > 0
    && typeof value.claimed_scope === 'string' && value.claimed_scope.length > 0;
}

export function auditWendbineLoomTranslation({ manifest, family }) {
  if (!manifest || manifest.schema !== 'td613.wendbine-loom-translation-manifest/v0.1') throw new TypeError('unexpected translation manifest');
  if (!family || family.schema !== 'td613.wendbine-loom-translation-family/v0.1') throw new TypeError('unexpected translation family');

  const forwardById = new Map(family.forward.map(packet => [packet.mapping_id, packet]));
  const reverseById = new Map(family.reverse.map(packet => [packet.mapping_id, packet]));
  const rows = manifest.mappings.map(mapping => {
    const forward = forwardById.get(mapping.id);
    const reverse = reverseById.get(mapping.id);
    const holds = [];
    const rejects = [];
    const accepted = [];

    if (!forward || !reverse) holds.push('BIDIRECTIONAL_PACKET_MISSING');
    else {
      accepted.push('BIDIRECTIONAL_PACKET_PRESENT');
      if (forward.relation_class !== mapping.relation_class || reverse.relation_class !== mapping.relation_class) holds.push('RELATION_CLASS_DRIFT');
      if (forward.retained_difference !== mapping.retained_difference || reverse.retained_difference !== mapping.retained_difference) holds.push('RETAINED_DIFFERENCE_DRIFT');
      if (JSON.stringify(forward.source_refs) !== JSON.stringify(mapping.wendbine_source_refs) || JSON.stringify(reverse.source_refs) !== JSON.stringify(mapping.wendbine_source_refs)) holds.push('SOURCE_REFERENCE_DRIFT');
      for (const key of CLAIMS_FORBIDDEN) {
        if (forward[key] !== false || reverse[key] !== false) rejects.push(`FORBIDDEN_PROMOTION:${key}`);
      }
    }

    if (mapping.relation_class === 'NON_EQUIVALENT') accepted.push('NON_EQUIVALENCE_EXPLICIT');
    if (!validWitness(mapping.operator_witness)) holds.push('OPERATOR_WITNESS_MISSING');
    else accepted.push('OPERATOR_WITNESS_BOUND');

    return {
      mapping_id: mapping.id,
      lexical_translation: rejects.length || holds.some(item => item !== 'OPERATOR_WITNESS_MISSING') ? 'HELD' : 'ADMITTED',
      operational_translation: rejects.length || holds.length ? 'HELD' : 'ADMITTED',
      accepted,
      holds,
      rejects
    };
  });

  const rejected = rows.filter(row => row.rejects.length > 0).length;
  const lexicalAdmitted = rows.filter(row => row.lexical_translation === 'ADMITTED').length;
  const operationalAdmitted = rows.filter(row => row.operational_translation === 'ADMITTED').length;
  const missingWitnesses = rows.filter(row => row.holds.includes('OPERATOR_WITNESS_MISSING')).length;
  const outcome = rejected > 0 ? 'REJECT_AUTHORITY_OR_EQUIVALENCE_BREACH'
    : operationalAdmitted === rows.length ? 'TRANSLATION_AUDIT_ADMISSIBLE'
      : 'HOLD_FOR_REPAIR';

  return {
    schema: 'td613.aperture.wendbine-loom-translation-audit/v0.1',
    outcome,
    rows,
    counts: {
      mappings: rows.length,
      lexical_admitted: lexicalAdmitted,
      operational_admitted: operationalAdmitted,
      operator_witness_missing: missingWitnesses,
      rejected
    },
    diagnosis: operationalAdmitted === rows.length
      ? 'MACHINE_CROSSWALK_HAS_BOUND_OPERATOR_WITNESSES'
      : 'MACHINE_READABLE_CROSSWALK_DOES_NOT_YET_ESTABLISH_OPERATOR_FIDELITY_OR_CUSTODIAN_INDEPENDENT_UNDERSTANDING',
    recommendation_not_command: true,
    open_field_promotion: false,
    authority_transferred: false,
    human_closure_required: true,
    next_test: missingWitnesses > 0 ? 'BIND_EXISTING_EXECUTABLE_OPERATOR_WITNESSES_WITHOUT_INVENTING_MISSING_ONES' : null
  };
}
