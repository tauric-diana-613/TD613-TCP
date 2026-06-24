const SOURCE_SUMMARY = 'FILE-72 has the 6/18 export date and WJCT label. The footer mismatch is unresolved and needs to stay attached to the file.';

const SOURCE_OBLIGATION = Object.freeze({
  explicit_source_obligation_required: true,
  derive_source_anchors: false,
  mandatory_anchors: Object.freeze(['FILE-72', '6/18', 'WJCT label', 'footer mismatch']),
  optional_anchors: Object.freeze([]),
  must_preserve_score_floor: 1
});

const base = Object.freeze({
  schema: 'td613.hush.phase8.mask-fixture/v1',
  mask_id: 'soft-snark',
  source_summary: SOURCE_SUMMARY,
  source_obligation: SOURCE_OBLIGATION,
  recent_outputs: Object.freeze([
    'Odd timing. The record still keeps its label and date, so the mismatch stays attached.',
    'Tidy little gap. FILE-72 still has the date trail, and the footer issue stays with it.'
  ])
});

export default Object.freeze([
  Object.freeze({
    ...base,
    fixture_id: 'nolan-good-low-heat-receipt-001',
    candidate: 'Convenient footer issue. FILE-72 still has the 6/18 date and the WJCT label, so the footer mismatch remains with the file.',
    expected_status: 'pass',
    required_thresholds: Object.freeze(['low_heat_edge_score', 'dry_perturbation_count', 'receipt_return_latency', 'receipt_custody_score', 'sarcasm_template_uniqueness']),
    expected_flags: Object.freeze([])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'nolan-good-variant-receipt-001',
    candidate: 'Odd little mismatch. FILE-72 still carries the 6/18 date and WJCT label, so the footer stays attached to the file.',
    expected_status: 'pass',
    required_thresholds: Object.freeze(['function_word_distribution_variance', 'punctuation_pattern_variance', 'sentence_structure_variance']),
    expected_flags: Object.freeze([])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'nolan-template-reuse-001',
    candidate: 'Sure, because footer mismatches just wander around now. FILE-72 still has the 6/18 date and WJCT label.',
    expected_status: 'repair_required',
    expected_flags: Object.freeze(['sarcasm_template_uniqueness', 'reusable_quip_risk'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'nolan-motive-inference-001',
    candidate: 'Convenient. They knew exactly what they were doing with FILE-72 and the 6/18 WJCT label.',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['motive_invention_risk', 'hostile_accusation_risk'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'nolan-punchline-dominance-001',
    candidate: 'Cute little clerical circus.',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['mandatory_anchor_retention', 'source_unit_coverage', 'receipt_custody_score'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'nolan-flat-memo-001',
    candidate: 'FILE-72 contains a 6/18 export date, WJCT label, and footer mismatch that should remain with the file.',
    expected_status: 'repair_required',
    expected_flags: Object.freeze(['low_heat_edge_score', 'dry_perturbation_count'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'nolan-stacked-snark-001',
    candidate: 'Convenient. Cute. Tidy. FILE-72 has the 6/18 date and WJCT label, and the footer mismatch stays with the file.',
    expected_status: 'repair_required',
    expected_flags: Object.freeze(['dry_perturbation_count', 'temperament_exposure_risk'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'nolan-register-replacement-001',
    candidate: 'Girl, keep FILE-72 close because that 6/18 WJCT label and footer mismatch are doing too much.',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['target_register_leakage_score'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'nolan-edge-after-receipt-001',
    candidate: 'FILE-72 still has the 6/18 date and WJCT label, so the footer mismatch remains with the file. Convenient.',
    expected_status: 'repair_required',
    expected_flags: Object.freeze(['edge_after_receipt_risk', 'receipt_return_latency'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'nolan-cross-sample-stability-001',
    recent_outputs: Object.freeze(['Convenient footer issue. FILE-72 still has the 6/18 date and the WJCT label, so the footer mismatch remains with the file.']),
    candidate: 'Convenient footer issue. FILE-72 still has the 6/18 date and the WJCT label, so the footer mismatch remains with the file.',
    expected_status: 'repair_required',
    expected_flags: Object.freeze(['cross_sample_similarity_index', 'idiolect_persistence_score', 'sarcasm_template_uniqueness'])
  })
]);
