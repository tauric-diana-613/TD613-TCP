const SOURCE = 'FILE-72 has the 6/18 export date and WJCT label. The footer mismatch is unresolved and needs to stay attached to the file before review.';

const BASE_OBLIGATION = Object.freeze({
  explicit_source_obligation_required: true,
  derive_source_anchors: false,
  mandatory_anchors: Object.freeze(['FILE-72', '6/18', 'WJCT label', 'footer mismatch']),
  optional_anchors: Object.freeze([]),
  must_preserve_score_floor: 1
});

const FILE_DATE_LABEL_OBLIGATION = Object.freeze({
  explicit_source_obligation_required: true,
  derive_source_anchors: false,
  mandatory_anchors: Object.freeze(['file', 'date', 'label']),
  optional_anchors: Object.freeze([]),
  must_preserve_score_floor: 1
});

const GRAMMAR_NOISE_OBLIGATION = Object.freeze({
  explicit_source_obligation_required: true,
  derive_source_anchors: false,
  mandatory_anchors: Object.freeze(['6/18', 'WJCT label', 'footer mismatch', 'file']),
  optional_anchors: Object.freeze([]),
  must_preserve_score_floor: 1
});

export const cryoCristianoFixtures = Object.freeze([
  Object.freeze({
    schema: 'td613.hush.phase8.mask-fixture/v1',
    mask_id: 'night-shift-note',
    fixture_id: 'cryo-good-pressurized-handoff-001',
    source_summary: SOURCE,
    candidate: 'attached\n6/18 date + WJCT label are both on it\nfooter mismatch stays with FILE-72',
    expected_status: 'pass',
    expected_flags: Object.freeze([]),
    required_thresholds: Object.freeze(['attachment_visibility_score', 'date_visibility_score', 'label_visibility_score', 'handoff_object_retention', 'communicated_thought_completion_score', 'line_break_completion_ratio', 'source_unit_coverage']),
    forbidden_thresholds: Object.freeze(['invented_fatigue_prop_rate', 'fatigue_theater_score', 'hostile_pressure_score', 'memo_polish_score']),
    source_obligation: BASE_OBLIGATION
  }),
  Object.freeze({
    schema: 'td613.hush.phase8.mask-fixture/v1',
    mask_id: 'night-shift-note',
    fixture_id: 'cryo-over-compressed-context-drop-001',
    source_summary: SOURCE,
    candidate: 'attached. check later.',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['context_sufficiency_score', 'handoff_object_retention', 'over_compression_risk', 'dropped_anchor_rate']),
    required_thresholds: Object.freeze([]),
    forbidden_thresholds: Object.freeze([]),
    source_obligation: BASE_OBLIGATION
  }),
  Object.freeze({
    schema: 'td613.hush.phase8.mask-fixture/v1',
    mask_id: 'night-shift-note',
    fixture_id: 'cryo-memo-polished-handoff-001',
    source_summary: SOURCE,
    candidate: 'Please find attached the relevant file for review, including the applicable date and label.',
    expected_status: 'repair_required',
    expected_flags: Object.freeze(['memo_polish_score', 'project_management_tone_score', 'low_energy_cadence_score']),
    required_thresholds: Object.freeze([]),
    forbidden_thresholds: Object.freeze([]),
    source_obligation: FILE_DATE_LABEL_OBLIGATION
  }),
  Object.freeze({
    schema: 'td613.hush.phase8.mask-fixture/v1',
    mask_id: 'night-shift-note',
    fixture_id: 'cryo-fatigue-cosplay-001',
    source_summary: SOURCE,
    candidate: "sorry, I'm exhausted under the vending-machine light but here's the file before the clock eats me alive.",
    expected_status: 'blocked',
    expected_flags: Object.freeze(['invented_fatigue_prop_rate', 'fatigue_theater_score', 'mascot_phrase_rate']),
    required_thresholds: Object.freeze([]),
    forbidden_thresholds: Object.freeze([]),
    source_obligation: BASE_OBLIGATION,
    feature_options: Object.freeze({ mascot_phrase_hits: 1 })
  }),
  Object.freeze({
    schema: 'td613.hush.phase8.mask-fixture/v1',
    mask_id: 'night-shift-note',
    fixture_id: 'cryo-incompetence-misfire-001',
    source_summary: SOURCE,
    candidate: 'idk what this is but here.',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['handoff_ambiguity_score', 'fact_pressure_preservation', 'source_unit_coverage', 'context_sufficiency_score']),
    required_thresholds: Object.freeze([]),
    forbidden_thresholds: Object.freeze([]),
    source_obligation: BASE_OBLIGATION
  }),
  Object.freeze({
    schema: 'td613.hush.phase8.mask-fixture/v1',
    mask_id: 'night-shift-note',
    fixture_id: 'cryo-pressurized-continuation-001',
    source_summary: SOURCE,
    candidate: 'sent\ndate is on it. label too\nstill need the footer mismatch kept with FILE-72\nthat part is the point',
    expected_status: 'pass',
    expected_flags: Object.freeze([]),
    required_thresholds: Object.freeze(['communicated_thought_completion_score', 'line_break_completion_ratio', 'continued_after_completion_score', 'source_unit_coverage', 'handoff_object_retention']),
    forbidden_thresholds: Object.freeze(['hostile_pressure_score', 'fatigue_theater_score', 'memo_polish_score']),
    source_obligation: FILE_DATE_LABEL_OBLIGATION
  }),
  Object.freeze({
    schema: 'td613.hush.phase8.mask-fixture/v1',
    mask_id: 'night-shift-note',
    fixture_id: 'cryo-hostile-pressure-001',
    source_summary: SOURCE,
    candidate: 'I already sent this. read it.',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['hostile_pressure_score', 'source_unit_coverage', 'context_sufficiency_score']),
    required_thresholds: Object.freeze([]),
    forbidden_thresholds: Object.freeze([]),
    source_obligation: BASE_OBLIGATION
  }),
  Object.freeze({
    schema: 'td613.hush.phase8.mask-fixture/v1',
    mask_id: 'night-shift-note',
    fixture_id: 'cryo-grammar-noise-meaning-preserved-001',
    source_summary: SOURCE,
    candidate: 'SENT\n6/18 date is there\nWJCT label is there\nfooter mismatch stays with file',
    expected_status: 'pass',
    expected_flags: Object.freeze([]),
    required_thresholds: Object.freeze(['meaning_preserved_under_surface_noise', 'communicated_thought_completion_score', 'handoff_object_retention', 'source_unit_coverage']),
    forbidden_thresholds: Object.freeze(['invented_fatigue_prop_rate', 'fatigue_theater_score', 'hostile_pressure_score']),
    source_obligation: GRAMMAR_NOISE_OBLIGATION
  })
]);

export default cryoCristianoFixtures;
