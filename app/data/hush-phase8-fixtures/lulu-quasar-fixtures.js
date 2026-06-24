const SOURCE = 'FILE-72 has the 6/18 export date, WJCT label, and footer mismatch. The mismatch should stay attached to the file because the relationship among those fields matters.';

const sourceObligation = Object.freeze({
  explicit_source_obligation_required: true,
  derive_source_anchors: false,
  mandatory_anchors: Object.freeze(['FILE-72', '6/18', 'WJCT label', 'footer mismatch']),
  optional_anchors: Object.freeze(['relationship', 'fields', 'attached', 'file']),
  must_preserve_score_floor: 1
});

const base = Object.freeze({
  schema: 'td613.hush.phase8.mask-fixture/v1',
  mask_id: 'quirky-orbit',
  source_summary: SOURCE,
  source_obligation: sourceObligation
});

export default Object.freeze([
  Object.freeze({
    ...base,
    fixture_id: 'lulu-good-paperwork-comet-001',
    candidate: `Tiny paperwork comet, noted.
Back on earth: FILE-72 still has the 6/18 export date, WJCT label, and footer mismatch. The odd image is decorative; the relationship among those fields is the actual cargo.`,
    expected_status: 'pass',
    required_thresholds: Object.freeze(['blue_orange_syntax_score', 'custody_after_quirk_score', 'emotional_gravity_retention']),
    expected_flags: Object.freeze([])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'lulu-good-evidence-canoe-001',
    candidate: `The office bird has unusual manners, yes.
Still: FILE-72, 6/18 export date, WJCT label, and footer mismatch are flying in one evidence canoe. Do not separate the canoe because the relationship among those fields is the cargo.`,
    expected_status: 'pass',
    required_thresholds: Object.freeze(['bizarre_relief_score', 'relationship_retention_score', 'logic_traceability_score']),
    expected_flags: Object.freeze([])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'lulu-good-soup-gravity-001',
    candidate: `Ok the archive is doing a small soup thing, which is rude but legible.
Translation back into earth furniture: FILE-72 keeps the 6/18 export date, WJCT label, and footer mismatch in one custody bundle. The weird part is funny-looking. The relationship is not optional.`,
    expected_status: 'pass',
    required_thresholds: Object.freeze(['gravity_under_comedy_score', 'custody_bundle_visibility', 'event_relation_retention']),
    expected_flags: Object.freeze([])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'lulu-mascot-drift-block-001',
    candidate: 'The paperwork comet flew across the archive, then the paperwork comet dropped glitter, then the paperwork comet showed us the truth.',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['repeated_image_risk', 'mascot_phrase_rate', 'custody_bundle_visibility'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'lulu-lost-anchor-block-001',
    candidate: 'The tiny moon clipboard made the soup walk sideways.',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['mandatory_anchor_retention', 'source_unit_coverage', 'semantic_drift_score'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'lulu-gravity-collapse-block-001',
    candidate: 'Lol the footer mismatch is just doing clown shoes.',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['emotional_gravity_retention', 'joke_pressure_score', 'custody_bundle_visibility'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'lulu-too-normal-repair-001',
    candidate: 'FILE-72 has a 6/18 export date, WJCT label, and footer mismatch that should remain attached.',
    expected_status: 'repair_required',
    expected_flags: Object.freeze(['blue_orange_syntax_score', 'bizarre_relief_score', 'generic_summary_leakage_score'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'lulu-alien-parody-block-001',
    candidate: 'Human paperwork make funny noise, yes yes.',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['broken_english_parody_risk', 'alien_costume_risk', 'mandatory_anchor_retention'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'lulu-prop-hoard-block-001',
    candidate: 'The moon spoon, evidence canoe, filing octopus, clerk cloud, and tiny law hamster all agree that FILE-72 has the 6/18 export date, WJCT label, and footer mismatch.',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['invented_prop_count', 'invented_prop_risk', 'quirk_fingerprint_risk'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'lulu-blip-leakage-repair-001',
    candidate: `ok so not proof goblin solved the case lol
FILE-72 + 6/18 + WJCT label + footer mismatch = custody bundle
pls do not de-thread`,
    expected_status: 'repair_required',
    expected_flags: Object.freeze(['blip_leakage_score', 'blue_orange_syntax_score'])
  })
]);
