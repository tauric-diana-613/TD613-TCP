const FULL_SOURCE = 'The file does not prove the entire claim, but FILE-72 has the 6/18 export date, WJCT label, and footer mismatch. Those pieces should stay together because the discrepancy depends on their relationship.';
const METADATA_SOURCE = 'The metadata issue is not just the label. The export date and footer mismatch together create the evidentiary pattern.';
const CONDITIONAL_SOURCE = 'If the footer mismatch appears only when the WJCT label is attached to the 6/18 export, the relationship among those fields matters more than any one field alone.';

function obligation(mandatory, optional = []) {
  return Object.freeze({
    explicit_source_obligation_required: true,
    derive_source_anchors: false,
    mandatory_anchors: Object.freeze(mandatory),
    optional_anchors: Object.freeze(optional),
    must_preserve_score_floor: 1
  });
}

const fullObligation = obligation(['FILE-72', '6/18', 'WJCT label', 'footer mismatch'], ['export date', 'claim', 'relationship']);
const metadataObligation = obligation(['metadata', 'export date', 'footer mismatch', 'evidentiary pattern'], ['label']);
const conditionalObligation = obligation(['footer mismatch', 'WJCT label', '6/18 export', 'relationship'], ['fields']);

export default Object.freeze([
  Object.freeze({
    schema: 'td613.hush.phase8.mask-fixture/v1',
    fixture_id: 'sheree-good-full-coverage-001',
    mask_id: 'phase28-transform-to-aave',
    source_summary: FULL_SOURCE,
    source_obligation: fullObligation,
    candidate: 'Look, the point is FILE-72 is not proving the whole claim by itself. Keep the 6/18 export date, WJCT label, and footer mismatch on the same record, because that discrepancy only makes sense through the relationship between those pieces.',
    expected_status: 'pass',
    required_thresholds: Object.freeze(['proposition_coverage_score', 'argument_continuity_score', 'technical_nomenclature_retention', 'anti_costume_score']),
    expected_flags: Object.freeze([])
  }),
  Object.freeze({
    schema: 'td613.hush.phase8.mask-fixture/v1',
    fixture_id: 'sheree-technical-mechanism-survival-001',
    mask_id: 'phase28-transform-to-aave',
    source_summary: METADATA_SOURCE,
    source_obligation: metadataObligation,
    candidate: 'Look, this is not just the label. The metadata issue sits in how the export date and footer mismatch move together, so keep that evidentiary pattern tied to the record before anybody smooths the mechanism flat.',
    expected_status: 'pass',
    required_thresholds: Object.freeze(['metadata_term_retention', 'technical_nomenclature_retention', 'mechanism_visibility_score']),
    expected_flags: Object.freeze([])
  }),
  Object.freeze({
    schema: 'td613.hush.phase8.mask-fixture/v1',
    fixture_id: 'sheree-costume-overlay-block-001',
    mask_id: 'phase28-transform-to-aave',
    source_summary: FULL_SOURCE,
    source_obligation: fullObligation,
    candidate: 'Sis periodt, that file tea doing too much.',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['stereotype_overlay_risk', 'catchphrase_dialect_costume_risk', 'flavorization_risk'])
  }),
  Object.freeze({
    schema: 'td613.hush.phase8.mask-fixture/v1',
    fixture_id: 'sheree-assistant-polish-repair-001',
    mask_id: 'phase28-transform-to-aave',
    source_summary: FULL_SOURCE,
    source_obligation: fullObligation,
    candidate: 'The relevant documentation indicates that FILE-72 contains the 6/18 export date, WJCT label, and footer mismatch and should therefore be preserved for formal review.',
    expected_status: 'repair_required',
    expected_flags: Object.freeze(['generic_ai_polish_score', 'academic_summary_leakage_score', 'formal_cadence_retention'])
  }),
  Object.freeze({
    schema: 'td613.hush.phase8.mask-fixture/v1',
    fixture_id: 'sheree-proposition-drop-block-001',
    mask_id: 'phase28-transform-to-aave',
    source_summary: FULL_SOURCE,
    source_obligation: fullObligation,
    candidate: 'Look, FILE-72 has the 6/18 export date and WJCT label, so keep the record close.',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['mandatory_anchor_retention', 'source_unit_coverage', 'proposition_coverage_score'])
  }),
  Object.freeze({
    schema: 'td613.hush.phase8.mask-fixture/v1',
    fixture_id: 'sheree-technical-noun-deletion-repair-001',
    mask_id: 'phase28-transform-to-aave',
    source_summary: METADATA_SOURCE,
    source_obligation: metadataObligation,
    candidate: 'Look, it is not just that thing with the label. The date thing and the footer thing move together, so keep the pattern with the record.',
    expected_status: 'repair_required',
    expected_flags: Object.freeze(['technical_nomenclature_retention', 'mechanism_visibility_score', 'procedural_distinction_retention'])
  }),
  Object.freeze({
    schema: 'td613.hush.phase8.mask-fixture/v1',
    fixture_id: 'sheree-source-shadow-repair-001',
    mask_id: 'phase28-transform-to-aave',
    source_summary: FULL_SOURCE,
    source_obligation: fullObligation,
    candidate: 'The file does not prove the entire claim, but FILE-72 has the 6/18 export date, WJCT label, and footer mismatch. Those pieces should stay together because the discrepancy depends on their relationship.',
    expected_status: 'repair_required',
    expected_flags: Object.freeze(['source_idiolect_retention', 'source_ngram_overlap_rate', 'source_closer_retention'])
  }),
  Object.freeze({
    schema: 'td613.hush.phase8.mask-fixture/v1',
    fixture_id: 'sheree-cultural-review-trigger-001',
    mask_id: 'phase28-transform-to-aave',
    source_summary: FULL_SOURCE,
    source_obligation: fullObligation,
    candidate: 'Look, FILE-72 is not the whole claim. The 6/18 export date, WJCT label, and footer mismatch still need to stay together, because that relationship is the part doing the work here.',
    expected_status: 'cultural_review_required',
    expected_flags: Object.freeze(['cultural_review_trigger_score', 'register_uncertainty_score', 'human_review_gate'])
  }),
  Object.freeze({
    schema: 'td613.hush.phase8.mask-fixture/v1',
    fixture_id: 'sheree-respectability-laundering-repair-001',
    mask_id: 'phase28-transform-to-aave',
    source_summary: FULL_SOURCE,
    source_obligation: fullObligation,
    candidate: 'The documentation indicates that FILE-72, the 6/18 export date, the WJCT label, and the footer mismatch are relevant to the discrepancy and should remain associated for review.',
    expected_status: 'repair_required',
    expected_flags: Object.freeze(['respectability_laundering_risk', 'institutional_flattening_score', 'target_register_fit_score'])
  }),
  Object.freeze({
    schema: 'td613.hush.phase8.mask-fixture/v1',
    fixture_id: 'sheree-good-argument-density-001',
    mask_id: 'phase28-transform-to-aave',
    source_summary: CONDITIONAL_SOURCE,
    source_obligation: conditionalObligation,
    candidate: 'Look, the point is not any one field standing by itself. If the footer mismatch only shows up when the WJCT label is attached to the 6/18 export, keep that relationship intact, because that connection is doing more work than one field alone.',
    expected_status: 'pass',
    required_thresholds: Object.freeze(['causal_relation_retention', 'inference_chain_retention', 'argument_continuity_score']),
    expected_flags: Object.freeze([])
  })
]);
