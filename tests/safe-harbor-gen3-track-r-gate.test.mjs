import assert from 'node:assert/strict';
import { runSafeHarborTrackR } from '../app/safe-harbor/research/safe-harbor-track-r.js';

function features(seed) { return { micro: { sentence: seed + 10, punctuation: seed / 10 }, meso: { qualification: seed / 20 }, macro: { return: seed / 30 } }; }
const ids = ['F1','F2','F3','P1','P2','P3','H1','H2','H3'];
const windows = ids.map((window_id, index) => ({ window_id, lane: window_id[0], observed_words: 120, features: features(index + 1) }));
function control(candidate_id, control_class, seed) { return { candidate_id, control_class, provenance: 'unmistakably synthetic fixture', features: features(seed) }; }
const controls = [
  control('h1','topic_matched_human',20),control('h2','topic_matched_human',21),
  control('p1','semantic_paraphrase',18),control('p2','semantic_paraphrase',19),
  control('l1','llm_style_imitation',1),control('l2','llm_style_imitation',25),
  control('r1','entrant_register_shift',9)
];
const packet = {
  schema_version: 'td613.safe-harbor.packet/v1',
  packet_hash_sha256: `sha256:${'d'.repeat(64)}`,
  authorship_evidence: { schema_version: 'td613.safe-harbor.authorship-evidence/v1' },
  bridge: { export_gate: { ready: true, state: 'harbor-eligible', blockers: [] } }
};
const held = await runSafeHarborTrackR(packet, {}, {});
assert.equal(held.track_r.status, 'held');
assert.ok(held.bridge.export_gate.blockers.includes('track-r-explicit-invocation-required'));
const executed = await runSafeHarborTrackR(packet, {
  windows, controls, selection_nonce: 'track-r-selection', ranking_nonce: 'track-r-ranking', calibration_triads_completed: 2,
  perturbation: {
    prompt_schedule_digest: `sha256:${'e'.repeat(64)}`,
    features: { 'dash-density': { family: 'scalar', scale: 'micro', baseline: 0.2, perturbed: 1.2, recovery: [0.8,0.4,0.21], perturbation_level: 3 } }
  }
}, { researchMode: true, operatorGesture: 'AUTHORIZE_TRACK_R_RESEARCH_EXECUTION' });
assert.equal(executed.track_r.status, 'research-executed-unpromoted');
assert.equal(executed.track_r.baseline_intake_authorized, false);
assert.equal(executed.track_r.production_promotion_authorized, false);
assert.match(executed.track_r.blind_result_digest, /^sha256:/u);
assert.match(executed.track_r.restoration_receipt_digest, /^sha256:/u);
assert.ok(executed.authorship_evidence.blind_custody_challenge);
assert.ok(executed.authorship_evidence.perturbation_invariance);
console.log('track r gate: ok');
