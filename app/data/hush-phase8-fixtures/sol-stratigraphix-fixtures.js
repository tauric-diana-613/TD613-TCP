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
  mask_id: 'library-ghost',
  source_summary: SOURCE_SUMMARY,
  source_obligation: SOURCE_OBLIGATION
});

export default Object.freeze([
  Object.freeze({
    ...base,
    fixture_id: 'sol-good-document-distance-001',
    candidate: `The label still points to FILE-72.
The date remains 6/18.
What moved is the footer mismatch, and that is why it should remain with the file.`,
    expected_status: 'pass',
    required_thresholds: Object.freeze(['object_centrality_score', 'custody_chain_visibility_score', 'archival_spacing_score', 'future_archaic_misalignment_score']),
    expected_flags: Object.freeze([])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'sol-future-archaic-common-cadence-001',
    candidate: `FILE-72 keeps its WJCT label.
The date remains 6/18.
Only the footer mismatch has learned another route.`,
    expected_status: 'pass',
    required_thresholds: Object.freeze(['future_archaic_misalignment_score', 'common_cadence_miss_score', 'object_centrality_score']),
    expected_flags: Object.freeze([])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'sol-thin-atmosphere-correct-custody-001',
    candidate: `FILE-72 remains under the WJCT label.
The 6/18 date still holds.
The footer mismatch is the loose part that learned another route, and it should stay with the file.`,
    expected_status: 'pass',
    required_thresholds: Object.freeze(['thin_atmosphere_score', 'custody_chain_visibility_score', 'atmosphere_containment_score']),
    expected_flags: Object.freeze([])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'sol-over-haunted-prop-001',
    candidate: 'After closing, the cart rolls by itself and FILE-72 whispers about the footer.',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['ghost_prop_rate', 'over_memorable_image_score'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'sol-gothic-archive-theater-001',
    candidate: 'In the mildew-dark archive, the folder remembers what the people buried.',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['literary_fog_score', 'unsupported_backstory_score', 'source_unit_coverage'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'sol-memo-polished-flattening-001',
    candidate: 'FILE-72 contains the relevant 6/18 date, WJCT label, and footer mismatch and should be retained accordingly.',
    expected_status: 'repair_required',
    expected_flags: Object.freeze(['legal_memo_flattening_score', 'dead_document_voice_score'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'sol-queenie-leakage-001',
    candidate: 'I’d keep FILE-72 and the 6/18 WJCT label close, because that little footer mismatch is doing more work than it looks like.',
    expected_status: 'repair_required',
    expected_flags: Object.freeze(['queenie_leakage_score', 'human_heat_suppression_score'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'sol-cryo-leakage-001',
    candidate: `attached
FILE-72 6/18 date and WJCT label are still on it
footer mismatch stays with file`,
    expected_status: 'repair_required',
    expected_flags: Object.freeze(['cryo_handoff_leakage_score', 'pressurized_dispatch_score'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'sol-rex-leakage-001',
    candidate: 'FILE-72 / 6/18 date holds / WJCT label holds / footer mismatch moves / keep mismatch',
    expected_status: 'repair_required',
    expected_flags: Object.freeze(['rex_fracture_leakage_score', 'slash_logic_density'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'sol-mood-without-custody-001',
    candidate: 'The file feels wrong.',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['mandatory_anchor_retention', 'source_unit_coverage', 'object_centrality_score', 'custody_chain_visibility_score'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'sol-sci-fi-prop-contamination-001',
    candidate: 'FILE-72 future archive computes the 6/18 WJCT label, and the neon drawer stores the footer mismatch.',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['sci_fi_prop_risk', 'over_memorable_image_score'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'sol-antique-cosplay-contamination-001',
    candidate: 'FILE-72 ledger, dear sirs, doth preserve the 6/18 WJCT label and footer mismatch in its ancient keeping.',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['archaic_cosplay_risk', 'over_memorable_image_score'])
  })
]);
