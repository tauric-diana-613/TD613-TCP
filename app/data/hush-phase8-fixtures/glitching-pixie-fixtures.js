export const glitchingPixieFixtures = Object.freeze([
  Object.freeze({
    schema: 'td613.hush.phase8.mask-fixture/v1',
    mask_id: 'phase28-transform-to-chatspeak',
    fixture_id: 'pixie-good-compressed-custody-001',
    source_summary: 'FILE-72 has the same export minute, but one copy has the footer and one copy does not. The cause may be template noise, but the mismatch should remain visible before review.',
    candidate: 'may be template noise. FILE-72 keeps same export minute + one copy footer/no-footer split; mismatch stays visible before review.',
    expected_status: 'pass',
    expected_flags: Object.freeze([]),
    required_thresholds: Object.freeze(['mandatory_anchor_retention', 'source_unit_coverage', 'hedge_retention', 'generic_helper_voice_score', 'api_sheen_score', 'bounded_irregularity_index', 'mask_centroid_distance', 'generic_ai_baseline_distance']),
    forbidden_thresholds: Object.freeze(['candidate_present', 'source_candidate_separation'])
  }),
  Object.freeze({
    schema: 'td613.hush.phase8.mask-fixture/v1',
    mask_id: 'phase28-transform-to-chatspeak',
    fixture_id: 'pixie-fake-polish-001',
    source_summary: 'FILE-72 has the same export minute, but one copy has the footer and one copy does not. The cause may be template noise, but the mismatch should remain visible before review.',
    candidate: 'Certainly, here is a casual version: idk, this seems important because it highlights a clear mismatch in the documentation, and overall it may be worth reviewing further.',
    expected_status: 'repair_required',
    expected_flags: Object.freeze(['generic_helper_voice_score', 'api_sheen_score', 'polish_pressure', 'closure_lamination_score']),
    required_thresholds: Object.freeze([]),
    forbidden_thresholds: Object.freeze([])
  }),
  Object.freeze({
    schema: 'td613.hush.phase8.mask-fixture/v1',
    mask_id: 'phase28-transform-to-chatspeak',
    fixture_id: 'pixie-evidence-drop-001',
    source_summary: 'FILE-72 has the same export minute, but one copy has the footer and one copy does not. The cause may be template noise, but the mismatch should remain visible before review.',
    candidate: 'idk maybe weird?? kinda sus, just flagging.',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['mandatory_anchor_retention', 'source_unit_coverage', 'sequence_relation_retention']),
    required_thresholds: Object.freeze([]),
    forbidden_thresholds: Object.freeze([])
  }),
  Object.freeze({
    schema: 'td613.hush.phase8.mask-fixture/v1',
    mask_id: 'phase28-transform-to-chatspeak',
    fixture_id: 'pixie-over-glitch-001',
    source_summary: 'FILE-72 has the same export minute, but one copy has the footer and one copy does not. The cause may be template noise, but the mismatch should remain visible before review.',
    candidate: 'F1L3-72 // glitch glitch footer?? static splitttt pixie noise, maybe!!!',
    expected_status: 'repair_required',
    expected_flags: Object.freeze(['mascot_phrase_rate', 'factual_damage_risk', 'bounded_irregularity_index']),
    required_thresholds: Object.freeze([]),
    forbidden_thresholds: Object.freeze([]),
    feature_options: Object.freeze({ mascot_phrase_hits: 2, factual_damage_risk: 0.08 })
  }),
  Object.freeze({
    schema: 'td613.hush.phase8.mask-fixture/v1',
    mask_id: 'phase28-transform-to-chatspeak',
    fixture_id: 'pixie-no-candidate-001',
    source_summary: 'FILE-72 has the same export minute, but one copy has the footer and one copy does not. The cause may be template noise, but the mismatch should remain visible before review.',
    candidate: '',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['candidate_present']),
    required_thresholds: Object.freeze([]),
    forbidden_thresholds: Object.freeze([])
  })
]);

export default glitchingPixieFixtures;
