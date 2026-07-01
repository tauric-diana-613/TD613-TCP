import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildProtectedLiteralList, checkProtectedLiteralIntegrity } from '../app/engine/hush-protected-literals.js';
import { buildPrompt, candidateIntegrity, compactStyle, protectedLiteralsOf } from '../api/hush-generate-budgeted.js';

const sourceText = 'At 02:18:44Z, HUSH-613.42 kept public_default_allowed false for FILE-72 on 2026-06-18.';
const expected = ['02:18:44Z', 'HUSH-613.42', 'public_default_allowed', 'FILE-72', '2026-06-18'];
const literals = buildProtectedLiteralList(sourceText);
for (const literal of expected) assert.ok(literals.includes(literal), `missing exact protected literal ${literal}`);
assert.ok(!literals.includes('HUSH-613'), 'composite identifier must not be truncated at a period');

const preserved = checkProtectedLiteralIntegrity(sourceText, literals);
assert.equal(preserved.passed, true);
assert.equal(preserved.preservationScore, 1);
const truncated = checkProtectedLiteralIntegrity(sourceText.replace('HUSH-613.42', 'HUSH-613'), literals);
assert.equal(truncated.passed, false);
assert.ok(truncated.missing.includes('HUSH-613.42'));

const mask = {
  id: 'phase28-transform-to-chatspeak',
  label: 'Glitching Pixie',
  family: 'chat shorthand',
  description: 'Fast, funny for half a second, then precise enough to keep the file intact.',
  intendedUse: 'Compact chat transforms with factual custody.',
  riskTell: 'Too much glitch can look like damage.',
  sampleSeed: 'idk maybe normal but the timestamp and mismatch stay visible.',
  transformHints: {
    sentence: 'very-short',
    ornament: 'medium',
    warmth: 'medium',
    custody: 'high',
    desiredMoves: ['use chat shorthand without losing event shape'],
    avoidMoves: ['over-glitching facts']
  },
  dictionHints: ['chat shorthand'],
  avoidList: ['formal cadence'],
  pressureWarnings: ['preserve claims under shorthand']
};
const contract = {
  sourceText,
  maskId: mask.id,
  mask,
  selectedMask: mask,
  protectedLiterals: literals,
  flightPacket: {
    packet_tier: 'strict_remote_mask_label_packet',
    mask_style_vector: {
      mask_id: mask.id,
      display_name: mask.label,
      persona_scene: mask.description,
      intended_use: mask.intendedUse,
      risk_tell: mask.riskTell,
      sample_seed: mask.sampleSeed,
      transform_hints: mask.transformHints,
      desired_moves: mask.transformHints.desiredMoves,
      avoid_moves: mask.transformHints.avoidMoves,
      diction_hints: mask.dictionHints,
      avoid_list: mask.avoidList,
      pressure_warnings: mask.pressureWarnings
    },
    flight_controls: { candidate_count: 2 }
  }
};

assert.deepEqual(protectedLiteralsOf(contract), literals);
const style = compactStyle(contract);
assert.equal(style.personaScene, mask.description);
assert.equal(style.intendedUse, mask.intendedUse);
assert.equal(style.sentence, 'very-short');
assert.ok(style.dictionHints.includes('use chat shorthand without losing event shape'));
assert.ok(style.avoid.includes('formal cadence'));

const prompt = buildPrompt(contract);
for (const literal of expected) assert.ok(prompt.includes(`- ${literal}`), `prompt must enumerate ${literal}`);
for (const phrase of ['persona scene=', 'intended use=', 'risk tell=', 'sentence=very-short', 'reference seed=']) {
  assert.ok(prompt.includes(phrase), `prompt missing mask anatomy field ${phrase}`);
}

const goodCandidate = { text: sourceText, dropped_propositions: [], new_claims: [] };
assert.equal(candidateIntegrity(goodCandidate, contract).passed, true);
const missingCandidate = { ...goodCandidate, text: sourceText.replace('HUSH-613.42', 'HUSH-613') };
assert.equal(candidateIntegrity(missingCandidate, contract).passed, false);
const droppedCandidate = { ...goodCandidate, dropped_propositions: ['footer mismatch'] };
assert.equal(candidateIntegrity(droppedCandidate, contract).passed, false);
const newClaimCandidate = { ...goodCandidate, new_claims: ['identity verified'] };
assert.equal(candidateIntegrity(newClaimCandidate, contract).passed, false);

const bridge = fs.readFileSync('app/hush-pr123-strict-undefined-fallback.js', 'utf8');
const html = fs.readFileSync('app/adversarial-bench.html', 'utf8');
const runLock = fs.readFileSync('app/hush-pr168-strict-transform-run-lock.js', 'utf8');
const housekeeping = fs.readFileSync('app/hush-housekeeping-relayout.js', 'utf8');
for (const marker of ['function protectedLiterals', 'function styleVector', 'function candidateIntegrity', 'function markReviewPending', 'protected_literals: literals']) {
  assert.ok(bridge.includes(marker), `strict browser bridge missing ${marker}`);
}
assert.ok(html.includes('hush-pr123-strict-undefined-fallback.js?v=202607010705'));
assert.equal((html.match(/hush-pr123-strict-undefined-fallback\.js/g) || []).length, 1, 'page must declare one strict bridge owner');
assert.ok(!runLock.includes("appendScriptOnce('hushPr123ExactArtifactLoader'"), 'run-lock must not inject a competing strict bridge');
assert.ok(!housekeeping.includes('data-td613-hush-pr123-exact='), 'housekeeping must not inject strict bridge assets');
assert.ok(bridge.indexOf("status('Remote provider output received") < bridge.indexOf('markReviewPending(contract.protectedLiterals.length)'), 'review status must win after provider success');
assert.ok(bridge.includes("last.payload.held === true || last.payload.status === 'held'"), 'structured holds must not fall through to a cross-domain retry');
assert.ok(!bridge.includes('runLocalReview'), 'strict generation must not auto-load the heavy review bench');

console.log('hush strict provider mask-anatomy and literal-integrity tests passed');
