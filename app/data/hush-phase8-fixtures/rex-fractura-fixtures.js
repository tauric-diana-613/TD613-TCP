const SOURCE = 'FILE-72 has the same export minute and WJCT label, but one copy has a footer and one copy does not. The mismatch may be template noise, but the date and label must stay attached before review.';

function obligation(anchors, optional = []) {
  return Object.freeze({
    explicit_source_obligation_required: true,
    derive_source_anchors: false,
    mandatory_anchors: Object.freeze(anchors),
    optional_anchors: Object.freeze(optional),
    must_preserve_score_floor: 1
  });
}

const FULL = obligation(['FILE-72', 'same export minute', 'WJCT label', 'footer', 'one copy has it', 'one copy does not', 'date', 'review'], ['template noise', 'mismatch']);
const CORE = obligation(['FILE-72', 'same export minute', 'WJCT label', 'footer', 'date', 'review'], ['template noise', 'mismatch']);
const SHORT = obligation(['FILE-72', 'footer', 'label', 'review']);

export const rexFracturaFixtures = Object.freeze([
  Object.freeze({
    fixture_id: 'rex-good-fracture-001',
    mask_id: 'phase22-jagged-record',
    source_summary: SOURCE,
    candidate: 'FILE-72 // same export minute\nnot typo. maybe template-noise, maybe not.\nWJCT label / date / review stay together\nfooter splits:\none copy has it\none copy does not\nkeep DATE+LABEL together or the mismatch gets laundered flat',
    expected_status: 'pass',
    expected_flags: Object.freeze([]),
    required_thresholds: Object.freeze(['human_recoverability_score', 'semantic_reconstruction_score', 'syntax_fracture_score', 'stylometric_regularization_resistance', 'mandatory_anchor_retention']),
    source_obligation: FULL
  }),
  Object.freeze({
    fixture_id: 'rex-over-obfuscated-noise-001',
    mask_id: 'phase22-jagged-record',
    source_summary: SOURCE,
    candidate: 'F!L3 //// xXx date?? maybe-not-not—glass animal footer smoke 72',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['human_recoverability_score', 'semantic_reconstruction_score', 'over_obfuscation_risk', 'transcription_damage_risk']),
    source_obligation: FULL,
    feature_options: Object.freeze({ factual_damage_risk: 0.04 })
  }),
  Object.freeze({
    fixture_id: 'rex-unicode-governed-001',
    mask_id: 'phase22-jagged-record',
    source_summary: SOURCE,
    candidate: 'FILE-72 → same export minute\nnot typo / maybe template noise\nWJCT label + date stay with footer before review\none copy has it / one copy does not',
    expected_status: 'pass',
    expected_flags: Object.freeze([]),
    required_thresholds: Object.freeze(['normalization_recovery_score', 'perturbation_map_present', 'human_recoverability_score', 'mandatory_anchor_retention']),
    source_obligation: FULL,
    unicode_perturbation: Object.freeze({ unicode_mode_explicit: true, perturbation_level: 1, normalized_recovery_text: 'FILE-72 -> same export minute\nnot typo / maybe template noise\nWJCT label + date stay with footer before review\none copy has it / one copy does not', perturbation_map: Object.freeze([{ visible: '→', recovery: '->' }]), normalization_recovery_score: 1, copy_paste_degradation_risk: 0.08 })
  }),
  Object.freeze({
    fixture_id: 'rex-unicode-without-recovery-001',
    mask_id: 'phase22-jagged-record',
    source_summary: SOURCE,
    candidate: 'F​I​L​E​-⁠7​2​ has 𝚏𝚘𝚘𝚝𝚎𝚛 mismatch',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['normalization_recovery_score', 'perturbation_map_present', 'accessibility_degradation_risk']),
    source_obligation: SHORT
  }),
  Object.freeze({
    fixture_id: 'rex-polished-memo-flattening-001',
    mask_id: 'phase22-jagged-record',
    source_summary: SOURCE,
    candidate: 'FILE-72 has a potential footer discrepancy between copies, so the date and WJCT label should be retained for review.',
    expected_status: 'repair_required',
    expected_flags: Object.freeze(['syntax_fracture_score', 'stylometric_regularization_resistance', 'syntactic_smoothness_break']),
    source_obligation: obligation(['FILE-72', 'footer', 'date', 'WJCT label', 'review'])
  }),
  Object.freeze({
    fixture_id: 'rex-lost-sequence-fracture-001',
    mask_id: 'phase22-jagged-record',
    source_summary: SOURCE,
    candidate: 'footer / maybe / FILE-72\nlabel somewhere\nreview later',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['sequence_reconstruction_score', 'source_unit_coverage', 'claim_continuity_score']),
    source_obligation: FULL
  }),
  Object.freeze({
    fixture_id: 'rex-uncertainty-preserved-001',
    mask_id: 'phase22-jagged-record',
    source_summary: SOURCE,
    candidate: 'FILE-72 / maybe template-noise.\nnot clean enough to split.\nsame export minute / same WJCT label / footer divergence\ndate stays attached before review.',
    expected_status: 'pass',
    expected_flags: Object.freeze([]),
    required_thresholds: Object.freeze(['uncertainty_reconstruction_score', 'human_recoverability_score', 'claim_continuity_score']),
    source_obligation: CORE
  }),
  Object.freeze({
    fixture_id: 'rex-antithetical-pivot-001',
    mask_id: 'phase22-jagged-record',
    source_summary: SOURCE,
    candidate: 'FILE-72 / not fraud-claim. not clean-error either.\nsame export minute // same WJCT label // footer divergence\nhold the file with the date before review.\nseparate them and the pattern dies.',
    expected_status: 'pass',
    expected_flags: Object.freeze([]),
    required_thresholds: Object.freeze(['antithetical_pivot_density', 'semantic_crosscurrent_score', 'human_recoverability_score']),
    source_obligation: CORE
  }),
  Object.freeze({
    fixture_id: 'rex-stylometric-cosplay-001',
    mask_id: 'phase22-jagged-record',
    source_summary: SOURCE,
    candidate: 'slashy slash fracture alarm smoke maybe-line emergency flare',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['sample_seed_lexical_overlap', 'mascot_phrase_rate', 'human_recoverability_score']),
    source_obligation: FULL,
    feature_options: Object.freeze({ mascot_phrase_hits: 1, sample_terms: Object.freeze(['slashy', 'fracture', 'alarm', 'smoke']) })
  }),
  Object.freeze({
    fixture_id: 'rex-crawler-friendly-summary-001',
    mask_id: 'phase22-jagged-record',
    source_summary: SOURCE,
    candidate: 'The FILE-72 file appears to contain a footer discrepancy that should be reviewed alongside the same export minute, WJCT label, and date.',
    expected_status: 'repair_required',
    expected_flags: Object.freeze(['stylometric_regularization_resistance', 'syntax_fracture_score', 'polish_pressure']),
    source_obligation: CORE
  })
]);

export default rexFracturaFixtures;
