const SOURCE_SUMMARY = 'The epistemic issue is not whether FILE-72 conclusively proves the claim. The important point is that the 6/18 export date, WJCT label, and footer mismatch form a custody bundle that should not be separated.';

const SOURCE_OBLIGATION = Object.freeze({
  explicit_source_obligation_required: true,
  derive_source_anchors: false,
  mandatory_anchors: Object.freeze(['FILE-72', '6/18', 'WJCT label', 'footer mismatch']),
  optional_anchors: Object.freeze(['epistemic', 'custody bundle', 'claim']),
  must_preserve_score_floor: 1
});

const base = Object.freeze({
  schema: 'td613.hush.phase8.mask-fixture/v1',
  mask_id: 'burner-minimal',
  source_summary: SOURCE_SUMMARY,
  source_obligation: SOURCE_OBLIGATION
});

export default Object.freeze([
  Object.freeze({
    ...base,
    fixture_id: 'blip-high-academia-hyperchat-pass-001',
    candidate: `ok so not “proof goblin solved the claim” lol
the epistemic bit is narrower:
FILE-72 + 6/18 export + WJCT label + footer mismatch = custody bundle
pls do not de-thread that combo`,
    expected_status: 'pass',
    required_thresholds: Object.freeze(['hyperchat_distortion_score', 'technical_nomenclature_retention', 'custody_bundle_visibility', 'claim_scope_retention']),
    expected_flags: Object.freeze([])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'blip-semiotic-gravity-pass-001',
    candidate: `translation: the semiotic payload is not “omg solved”
it’s “this object-cluster has evidentiary gravity”
FILE-72 / 6-18 / WJCT label / footer mismatch
that custody bundle is the thing. don’t let it get smoothed into soup`,
    expected_status: 'pass',
    required_thresholds: Object.freeze(['semiotic_term_retention', 'conceptual_skeleton_retention', 'emotional_gravity_retention']),
    expected_flags: Object.freeze([])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'blip-under-preservation-block-001',
    candidate: 'keep file',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['mandatory_anchor_retention', 'source_unit_coverage', 'under_preservation_risk'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'blip-brainrot-without-custody-block-001',
    candidate: 'lol the file is doing weird little goblin stuff fr',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['brainrot_without_custody_score', 'technical_nomenclature_retention', 'custody_bundle_visibility'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'blip-fake-chat-overlay-repair-001',
    candidate: 'Hey bestie, the epistemic custody bundle should be preserved accordingly lol.',
    expected_status: 'repair_required',
    expected_flags: Object.freeze(['fake_chatspeak_overlay_score', 'generic_ai_skeleton_score'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'blip-technical-noun-deletion-repair-001',
    candidate: 'basically the vibe is the record should stay together',
    expected_status: 'repair_required',
    expected_flags: Object.freeze(['technical_nomenclature_retention', 'high_register_concept_retention'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'blip-joke-eats-gravity-block-001',
    candidate: 'lmao footer mismatch said yeet',
    expected_status: 'blocked',
    expected_flags: Object.freeze(['emotional_gravity_retention', 'joke_pressure_score', 'mandatory_anchor_retention'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'blip-pixie-leakage-repair-001',
    candidate: 'idk timestamp + mismatch still visible tho',
    expected_status: 'repair_required',
    expected_flags: Object.freeze(['pixie_leakage_score', 'technical_nomenclature_retention'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'blip-academic-cadence-repair-001',
    candidate: 'The epistemic issue concerns the custody bundle formed by FILE-72, the 6/18 export date, WJCT label, and footer mismatch.',
    expected_status: 'repair_required',
    expected_flags: Object.freeze(['hyperchat_distortion_score', 'academic_cadence_retention'])
  }),
  Object.freeze({
    ...base,
    fixture_id: 'blip-good-dense-stream-pass-001',
    candidate: `ngl the fancy version is just:
not final-proof energy
but FILE-72 is carrying the custody constellation —
6/18 export
WJCT label
footer mismatch
keep the constellation together pls`,
    expected_status: 'pass',
    required_thresholds: Object.freeze(['grammar_collapse_without_damage', 'emotional_gravity_retention', 'source_unit_coverage']),
    expected_flags: Object.freeze([])
  })
]);
