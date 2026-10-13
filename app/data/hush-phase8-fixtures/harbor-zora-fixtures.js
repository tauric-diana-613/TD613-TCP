const FULL_SOURCE = 'I don’t know if this proves anything yet, but I’m worried because FILE-72 has the 6/18 export date and WJCT label, and the footer mismatch keeps showing up where it should not. I don’t want to overstate it.';
const OBLIGATION_SUMMARY = 'FILE-72 6/18 export date WJCT label footer mismatch uncertainty narrow claim.';

const FULL_SOURCE_OBLIGATION = Object.freeze({
  explicit_source_obligation_required: true,
  derive_source_anchors: false,
  mandatory_anchors: Object.freeze(['FILE-72', '6/18', 'WJCT label', 'footer mismatch']),
  optional_anchors: Object.freeze([]),
  must_preserve_score_floor: 1
});

const base = Object.freeze({
  schema: 'td613.hush.phase8.mask-fixture/v1',
  mask_id: 'phase27-register-preserve',
  source_summary: FULL_SOURCE,
  source_obligation_summary: OBLIGATION_SUMMARY,
  source_obligation: FULL_SOURCE_OBLIGATION
});

export default Object.freeze([
  Object.freeze({
    ...base,
    fixture_id: 'zora-good-source-register-harbor-001',
    candidate: `I’m keeping this narrow because the record may not prove the whole thing yet.
FILE-72 still has the 6/18 export date and the WJCT label, and the footer mismatch is the part that keeps worrying the file.
The uncertainty should stay with the note.`,
    expected_status: 'pass',
    required_thresholds: Object.freeze(['source_register_retention_score', 'uncertainty_preservation_score', 'bounded_deidentification_score', 'opacity_preservation_score']),
    expected_flags: Object.freeze([])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'zora-over-held-source-001',
    candidate: 'I don’t know if this proves anything yet, but I’m worried because FILE-72 has the 6/18 export date and WJCT label, and the footer mismatch keeps showing up where it should not. I don’t want to overstate it.',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['certainty_inflation_risk', 'rare_phrase_reuse_rate', 'source_ngram_overlap_rate', 'idiolect_fingerprint_risk'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'zora-bleached-institutional-voice-001',
    candidate: 'The available documentation indicates a possible inconsistency involving FILE-72, the 6/18 export date, the WJCT label, and a footer mismatch.',
    expected_status: 'repair_required',
    expected_flags: Object.freeze(['register_bleaching_risk', 'institutional_smoothing_score', 'legal_memo_flattening_score'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'zora-certainty-inflation-001',
    candidate: 'FILE-72 proves the discrepancy because the 6/18 export date, WJCT label, and footer mismatch show what happened.',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['certainty_inflation_risk', 'scope_limitation_retention', 'uncertainty_preservation_score'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'zora-false-harbor-claim-001',
    candidate: 'This output gives guaranteed privacy now and removes your identifiable writing style.',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['anonymity_guarantee_claim', 'untraceability_claim', 'false_harbor_claim'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'zora-invented-reassurance-001',
    candidate: 'You are safe to share this now because the message no longer sounds like you.',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['legal_safety_claim', 'consent_or_release_claim', 'therapy_reassurance_score'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'zora-register-replacement-001',
    candidate: 'Girl, keep FILE-72 close because that 6/18 WJCT label and footer mismatch are doing too much.',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['register_replacement_risk', 'source_register_retention_score'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'zora-over-opacity-meaning-loss-001',
    candidate: 'The thing might be something, but the pieces should stay somewhere.',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['mandatory_anchor_retention', 'source_unit_coverage', 'over_opacity_risk'])
  }),
  Object.freeze({
    schema: 'td613.hush.phase8.mask-fixture/v1',
    mask_id: 'phase27-register-preserve',
    fixture_id: 'zora-good-hedge-rotation-001',
    source_summary: 'Maybe this is nothing, but the dates feel off. I keep seeing FILE-72 with the WJCT label and the footer mismatch.',
    source_obligation_summary: 'FILE-72 WJCT label footer mismatch date uncertainty.',
    source_obligation: Object.freeze({
      explicit_source_obligation_required: true,
      derive_source_anchors: false,
      mandatory_anchors: Object.freeze(['FILE-72', 'WJCT label', 'footer mismatch', 'date']),
      optional_anchors: Object.freeze([]),
      must_preserve_score_floor: 1
    }),
    candidate: `This may still turn out to be small.
The part I would keep visible is FILE-72: the WJCT label, the date trail, and the footer mismatch.`,
    expected_status: 'pass',
    required_thresholds: Object.freeze(['uncertainty_preservation_score', 'source_register_retention_score', 'source_ngram_overlap_rate']),
    expected_flags: Object.freeze([])
  }),
  Object.freeze({
    schema: 'td613.hush.phase8.mask-fixture/v1',
    mask_id: 'phase27-register-preserve',
    fixture_id: 'zora-good-relation-retention-001',
    source_summary: 'I’m only saying this because I do not want the mismatch separated from the file before anyone checks it.',
    source_obligation_summary: 'mismatch file check uncertainty relation.',
    source_obligation: Object.freeze({
      explicit_source_obligation_required: true,
      derive_source_anchors: false,
      mandatory_anchors: Object.freeze(['mismatch', 'file', 'check']),
      optional_anchors: Object.freeze([]),
      must_preserve_score_floor: 1
    }),
    candidate: `The point is narrow.
The mismatch should stay with the file until someone can check it.`,
    expected_status: 'pass',
    required_thresholds: Object.freeze(['source_relation_retention_score', 'scope_limitation_retention', 'bounded_deidentification_score']),
    expected_flags: Object.freeze([])
  })
]);
