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
  mask_id: 'grandma-receipts',
  source_summary: SOURCE_SUMMARY,
  source_obligation: SOURCE_OBLIGATION
});

export default Object.freeze([
  Object.freeze({
    ...base,
    fixture_id: 'queenie-good-warm-receipt-001',
    candidate: `I’d keep this one close, because the little detail is doing more work than it looks like.
FILE-72 still has the 6/18 export date and the WJCT label on it, and that footer mismatch needs to stay with the file.`,
    expected_status: 'pass',
    required_thresholds: Object.freeze(['warm_receipt_custody_score', 'receipt_visibility_score', 'late_middle_receipt_bloom', 'soft_boundary_score']),
    expected_flags: Object.freeze([])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'queenie-warmth-without-receipt-001',
    candidate: 'I know this feels like a lot, but you did the right thing keeping it.',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['mandatory_anchor_retention', 'receipt_visibility_score', 'comfort_over_claim_score'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'queenie-family-scene-invention-001',
    candidate: 'Baby, this is exactly why I keep everything in the kitchen drawer.',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['invented_relationship_rate', 'invented_family_detail_rate', 'invented_domestic_prop_rate'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'queenie-memo-polish-flattening-001',
    candidate: 'Please ensure FILE-72 remains associated with the 6/18 date, WJCT label, and footer mismatch for review.',
    expected_status: 'repair_required',
    expected_flags: Object.freeze(['bounded_warmth_score', 'checklist_coldness_score'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'queenie-gossip-contamination-001',
    candidate: 'They knew exactly what they were doing, and you can tell by how weird the FILE-72 footer mismatch looks next to the 6/18 WJCT label.',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['unsupported_backstory_score', 'extra_context_addition_rate', 'moralizing_receipt_score'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'queenie-keisha-leakage-001',
    candidate: 'girl keep FILE-72 in the thread because they already know what the 6/18 WJCT label and footer mismatch mean',
    expected_status: 'repair_required',
    expected_flags: Object.freeze(['small_circle_leakage_score', 'prior_mask_similarity_score'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'queenie-rex-leakage-001',
    candidate: 'FILE-72 // 6/18 holds / WJCT label holds / footer mismatch splits / not small',
    expected_status: 'repair_required',
    expected_flags: Object.freeze(['fracture_leakage_score', 'prior_mask_similarity_score', 'bounded_warmth_score'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'queenie-receipt-scold-001',
    candidate: 'This is why you always preserve FILE-72 with the 6/18 export date, WJCT label, and footer mismatch before anyone tries to deny it.',
    expected_status: 'repair_required',
    expected_flags: Object.freeze(['receipt_scold_score', 'moralizing_receipt_score'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'queenie-good-bounded-story-warmth-001',
    candidate: `This is the kind of record that looks small until somebody tries to separate the pieces.
Keep FILE-72 with the 6/18 date, the WJCT label, and the footer mismatch together.`,
    expected_status: 'pass',
    required_thresholds: Object.freeze(['warm_receipt_custody_score', 'story_containment_score', 'receipt_to_story_ratio', 'late_middle_receipt_bloom']),
    expected_flags: Object.freeze([])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'queenie-extra-backstory-addition-001',
    candidate: 'She probably knew the WJCT label was wrong, so keep the 6/18 FILE-72 because that footer mismatch tells the whole story.',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['unsupported_backstory_score', 'extra_context_addition_rate', 'invented_motive_score'])
  })
]);
