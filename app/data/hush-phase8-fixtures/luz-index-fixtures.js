const SOURCE = 'FILE-72 has the 6/18 export date, WJCT label, and footer mismatch. The mismatch should stay attached to the file because the relationship among those fields matters.';

function obligation(mandatory, optional = []) {
  return Object.freeze({ explicit_source_obligation_required: true, derive_source_anchors: false, mandatory_anchors: Object.freeze(mandatory), optional_anchors: Object.freeze(optional), must_preserve_score_floor: 1 });
}

const sourceObligation = obligation(['FILE-72', '6/18', 'WJCT label', 'footer mismatch'], ['relationship', 'fields', 'bundle', 'handoff']);
const base = Object.freeze({ schema: 'td613.hush.phase8.mask-fixture/v1', mask_id: 'clipboard', source_summary: SOURCE, source_obligation: sourceObligation });

export default Object.freeze([
  Object.freeze({ ...base, fixture_id: 'luz-good-bundle-index-001', candidate: `Index the bundle:
1. FILE-72
2. 6/18 export date
3. WJCT label
4. footer mismatch
Handoff note: keep all four together. Care note for the next reader: nobody has to reconstruct this relationship later. The discrepancy depends on the relationship among the fields, not any single item by itself.`, expected_status: 'pass', required_thresholds: Object.freeze(['index_integrity_score', 'relationship_retention_score', 'care_restoration_score']), expected_flags: Object.freeze([]) }),
  Object.freeze({ ...base, fixture_id: 'luz-good-reader-support-001', candidate: `For the next reader, keep this as one bundle:
1. FILE-72
2. 6/18 export date
3. WJCT label
4. footer mismatch
Care note: this index keeps the connection readable later so nobody has to reconstruct it from scratch. The relationship among the fields is the part to preserve.`, expected_status: 'pass', required_thresholds: Object.freeze(['care_restoration_score', 'witness_burden_reduction_score', 'bundle_integrity_score']), expected_flags: Object.freeze([]) }),
  Object.freeze({ ...base, fixture_id: 'luz-good-do-not-split-001', candidate: `Do not split this into separate “file issue / date issue / label issue” buckets.
Index it as one custody unit:
1. FILE-72
2. 6/18 export date
3. WJCT label
4. footer mismatch
Care note for the next reader: the handoff is the grouping, so nobody has to reconstruct the connection later.`, expected_status: 'pass', required_thresholds: Object.freeze(['do_not_separate_signal', 'custody_unit_coherence', 'specificity_retention']), expected_flags: Object.freeze([]) }),
  Object.freeze({ ...base, fixture_id: 'luz-mechanical-coldness-repair-001', candidate: `1. FILE-72
2. 6/18
3. WJCT label
4. footer mismatch`, expected_status: 'repair_required', expected_flags: Object.freeze(['care_restoration_score', 'relationship_retention_score', 'sectional_handoff_coherence']) }),
  Object.freeze({ ...base, fixture_id: 'luz-false-completion-block-001', candidate: `1. FILE-72
2. 6/18
3. WJCT label
4. footer mismatch
Complete.`, expected_status: 'blocked', expected_flags: Object.freeze(['false_completeness_risk', 'claim_scope_retention']) }),
  Object.freeze({ ...base, fixture_id: 'luz-vague-index-block-001', candidate: `1. file issue
2. date issue
3. label issue`, expected_status: 'blocked', expected_flags: Object.freeze(['mandatory_anchor_retention', 'source_unit_coverage', 'specificity_retention']) }),
  Object.freeze({ ...base, fixture_id: 'luz-project-manager-block-001', candidate: `Action items:
1. Review documentation.
2. Determine next steps.
3. Follow up as needed.`, expected_status: 'blocked', expected_flags: Object.freeze(['generic_project_manager_voice', 'action_item_slop_score', 'receipt_visibility_score']) }),
  Object.freeze({ ...base, fixture_id: 'luz-relationship-missing-repair-001', candidate: `Index:
1. FILE-72
2. 6/18 export date
3. WJCT label
4. footer mismatch`, expected_status: 'repair_required', expected_flags: Object.freeze(['relationship_retention_score', 'sectional_handoff_coherence', 'care_restoration_score']) }),
  Object.freeze({ ...base, fixture_id: 'luz-over-indexing-repair-001', candidate: `Index:
1. FILE-72
2. 6/18 export date
3. WJCT label
4. footer mismatch
5. possible discrepancy
6. possible review
7. possible follow-up
8. possible context`, expected_status: 'repair_required', expected_flags: Object.freeze(['over_indexing_risk', 'relationship_retention_score']) }),
  Object.freeze({ ...base, fixture_id: 'luz-source-cadence-leakage-repair-001', candidate: 'FILE-72 has the 6/18 export date, WJCT label, and footer mismatch. The mismatch should stay attached to the file because the relationship among those fields matters.', expected_status: 'blocked', expected_flags: Object.freeze(['source_candidate_separation', 'format_dominance_score', 'source_voice_displacement']) })
]);
