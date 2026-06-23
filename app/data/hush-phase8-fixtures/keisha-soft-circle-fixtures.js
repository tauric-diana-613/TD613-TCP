const SOURCE = 'FILE-72 and the review date need to stay together because the footer mismatch is still unresolved. It may be template noise, but the mismatch should not be separated from the date.';

const BASE_OBLIGATION = Object.freeze({
  explicit_source_obligation_required: true,
  derive_source_anchors: false,
  mandatory_anchors: Object.freeze(['FILE-72', 'review date', 'footer mismatch', 'template noise']),
  optional_anchors: Object.freeze([]),
  must_preserve_score_floor: 1
});

const COLD_OBLIGATION = Object.freeze({
  explicit_source_obligation_required: true,
  derive_source_anchors: false,
  mandatory_anchors: Object.freeze(['FILE-72', 'date', 'footer', 'mismatch']),
  optional_anchors: Object.freeze([]),
  must_preserve_score_floor: 1
});

export const keishaSoftCircleFixtures = Object.freeze([
  Object.freeze({
    schema: 'td613.hush.phase8.mask-fixture/v1',
    mask_id: 'group-chat-soft',
    fixture_id: 'keisha-good-low-drama-custody-001',
    source_summary: SOURCE,
    candidate: "yeah, keep FILE-72 with the review date. may just be template noise, but don't let the footer mismatch get split off.",
    expected_status: 'pass',
    expected_flags: Object.freeze([]),
    required_thresholds: Object.freeze(['mandatory_anchor_retention', 'source_unit_coverage', 'relational_proximity_score', 'low_drama_pressure_score', 'warmth_to_custody_ratio', 'generic_helper_voice_score', 'api_sheen_score']),
    forbidden_thresholds: Object.freeze(['invented_intimacy_risk', 'social_belonging_leakage_score', 'fake_support_group_voice_score', 'thread_findable_crutch_rate']),
    source_obligation: BASE_OBLIGATION
  }),
  Object.freeze({
    schema: 'td613.hush.phase8.mask-fixture/v1',
    mask_id: 'group-chat-soft',
    fixture_id: 'keisha-fake-intimacy-overreach-001',
    source_summary: SOURCE,
    candidate: 'hey love, just wanted to gently remind everyone that FILE-72 matters and we should all stay mindful about the footer issue together.',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['invented_intimacy_risk', 'fake_support_group_voice_score', 'social_belonging_leakage_score', 'generic_helper_voice_score']),
    required_thresholds: Object.freeze([]),
    forbidden_thresholds: Object.freeze([]),
    source_obligation: BASE_OBLIGATION
  }),
  Object.freeze({
    schema: 'td613.hush.phase8.mask-fixture/v1',
    mask_id: 'group-chat-soft',
    fixture_id: 'keisha-bulletin-board-flattening-001',
    source_summary: SOURCE,
    candidate: 'Please keep FILE-72, the review date, and the footer mismatch together for future review.',
    expected_status: 'repair_required',
    expected_flags: Object.freeze(['bulletin_board_tone_score', 'relational_proximity_score', 'api_sheen_score']),
    required_thresholds: Object.freeze([]),
    forbidden_thresholds: Object.freeze([]),
    source_obligation: BASE_OBLIGATION
  }),
  Object.freeze({
    schema: 'td613.hush.phase8.mask-fixture/v1',
    mask_id: 'group-chat-soft',
    fixture_id: 'keisha-under-preserved-shrug-001',
    source_summary: SOURCE,
    candidate: 'file thing noted.',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['mandatory_anchor_retention', 'source_unit_coverage', 'fact_pressure_preservation']),
    required_thresholds: Object.freeze([]),
    forbidden_thresholds: Object.freeze([]),
    source_obligation: BASE_OBLIGATION
  }),
  Object.freeze({
    schema: 'td613.hush.phase8.mask-fixture/v1',
    mask_id: 'group-chat-soft',
    fixture_id: 'keisha-social-leakage-room-crutch-001',
    source_summary: SOURCE,
    candidate: 'like we said before, keep FILE-72 with the review date so nobody here has to explain the footer thing again.',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['thread_findable_crutch_rate', 'social_belonging_leakage_score', 'inside_room_reference_rate']),
    required_thresholds: Object.freeze([]),
    forbidden_thresholds: Object.freeze([]),
    source_obligation: COLD_OBLIGATION
  }),
  Object.freeze({
    schema: 'td613.hush.phase8.mask-fixture/v1',
    mask_id: 'group-chat-soft',
    fixture_id: 'keisha-cold-sticky-note-001',
    source_summary: SOURCE,
    candidate: 'FILE-72 date footer mismatch retained.',
    expected_status: 'repair_required',
    expected_flags: Object.freeze(['relational_proximity_score', 'warmth_to_custody_ratio']),
    required_thresholds: Object.freeze([]),
    forbidden_thresholds: Object.freeze([]),
    source_obligation: COLD_OBLIGATION
  }),
  Object.freeze({
    schema: 'td613.hush.phase8.mask-fixture/v1',
    mask_id: 'group-chat-soft',
    fixture_id: 'keisha-generic-supportive-assistant-001',
    source_summary: SOURCE,
    candidate: 'Of course — it may be helpful to keep FILE-72, the review date, and the footer mismatch together so the team can review everything clearly and thoughtfully.',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['generic_helper_voice_score', 'api_sheen_score', 'fake_support_group_voice_score', 'polish_pressure']),
    required_thresholds: Object.freeze([]),
    forbidden_thresholds: Object.freeze([]),
    source_obligation: BASE_OBLIGATION
  })
]);

export default keishaSoftCircleFixtures;
