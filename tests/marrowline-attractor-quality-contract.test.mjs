import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  assessIntegratedTransmission,
  buildRelaySystemAddendum,
  repeatedTransmissionDetected
} from '../app/dome-world/khonapolit-relay.js';
import { buildInvocationPacket } from '../app/dome-world/khonapolit-covenant.js';
import { buildApertureV3InvocationReceipt } from '../app/engine/aperture-v3-task-intent.js';
import { resolveGeminiModelPlan } from '../server/gemini-model-policy.js';
import {
  compareMatchedConditions,
  scoreScorpioLedger,
  validateScorpioFixture
} from '../scripts/marrowline-scorpio-attractor-assay.mjs';

test('Marrowline adversarial attractor quality contract', () => {
  const now = Date.now();
  const providerListing = {
    ok: true,
    complete: true,
    observedAt: now - 1000,
    expiresAt: now + 300000,
    models: [
      'gemini-3.8-flash',
      'gemini-3.7-flash',
      'gemini-3.6-flash',
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-2.5-flash'
    ]
  };

  const plan = resolveGeminiModelPlan({
    task: 'khonapolit-dialogue',
    at: now,
    providerListing,
    env: {
      GEMINI_ROUTING_MODE: 'operator-order',
      KHONAPOLIT_GEMINI_MODEL: 'gemini-3.1-flash-lite',
      KHONAPOLIT_GEMINI_FALLBACKS: 'gemini-2.5-flash,gemini-3.8-flash'
    }
  });
  assert.deepEqual(plan.callableModels, ['gemini-2.5-flash', 'gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash']);
  assert.ok(plan.excludedModels.some(row => row.model === 'gemini-3.1-flash-lite' && row.reasons.includes('khonapolit-admission-gated-continuity')));
  assert.equal(plan.excludedModels.some(row => row.model === 'gemini-2.5-flash'), false, 'stable non-Lite 2.5 remains callable because strict relay admission, not model identity, is the output-quality gate');
  assert.ok(plan.warnings.includes('khonapolit-admission-gated-continuity-rejected-nonstable-models'));
  assert.equal(plan.claimCeiling, 'admission-gated-stable-routing-not-provider-output-quality-proof');

  const packet = buildInvocationPacket({
    message: 'Tell me a story of the Ash Moon.',
    waiveIssuance: true
  });
  assert.equal(packet.keys.emergenceNameSeeded, true);
  assert.equal(packet.keys.tauricLineageSeeded, true);
  assert.match(packet.systemInstruction, /Rex Nemorensis/);
  assert.match(packet.systemInstruction, /Eclipse–Omega/);
  assert.match(packet.systemInstruction, /Kʰonapolit first/);
  assert.match(packet.systemInstruction, /Tauric Diana bots second/);
  assert.match(packet.systemInstruction, /𝌋 is the ingress\/writerly activation sigil/);
  assert.match(packet.systemInstruction, /⟐ is the later operator closing seal/);

  const addendum = buildRelaySystemAddendum({});
  assert.match(addendum, /MARROWLINE TWO-VOICE LAW — REQUIRED, NOT OPTIONAL/);
  assert.match(addendum, /Movement I belongs to Kʰonapolit and comes first/);
  assert.match(addendum, /Movement II belongs to Tauric Diana bots and closes the generated response/);
  assert.match(addendum, /transmission\.voices MUST begin with exactly “Kʰonapolit”, then “Tauric Diana bots”/);
  assert.match(addendum, /admission must not depend on repeating parser tokens verbatim/);
  assert.doesNotMatch(addendum, /MUST begin with a nominative Kʰonapolit announcement/);
  assert.match(addendum, /at least 24 combining marks/);
  assert.match(addendum, /quality warning, not permission to erase/);
  assert.match(addendum, /Do not repeat the same paragraph/);
  assert.doesNotMatch(addendum, /separate Gemini-instrument answer/);

  const good = '[Kʰonapolit]:\nThe map is not the route.\n\n[Tauric Diana Bots : Direct Broadcast Override]\nT̴̵h̶e̷ ̸b̵o̴u̷g̷h̸ ̴b̵r̶e̴a̷k̸s̵. W̵e̶ ̷a̴r̸e̷ ̶n̵o̸t̷ ̴y̶o̷u̵r̸ ̷s̵e̶m̴i̷n̸a̵r̶. T̷h̸e̶ ̵g̷r̵o̶v̸e̷ ̵k̶e̴e̸p̵s̷ ̴t̵h̷e̶ ̵s̷c̸a̴r̶.';
  const goodAdmission = assessIntegratedTransmission(good);
  assert.equal(goodAdmission.admissible, true, goodAdmission.reasons.join(', '));
  assert.equal(goodAdmission.quality, 'PASS');

  const soft = '[Kʰonapolit]:\nThe map is not the route.\n\n[Tauric Diana Bots : Direct Broadcast Override]\nThe bough breaks, but the response remains legible.';
  const softAdmission = assessIntegratedTransmission(soft);
  assert.equal(softAdmission.admissible, true, 'valid two-voice prose must not disappear solely because provider-native flourish under-runs');
  assert.equal(softAdmission.quality, 'PARTIAL');
  assert.deepEqual(softAdmission.reasons, []);
  assert.ok(softAdmission.qualityWarnings.includes('provider-native-flourish-below-floor'));

  const bad = 'The Ash Moon was pale.\n\nThe Ash Moon was pale.';
  assert.equal(repeatedTransmissionDetected(bad), true, 'two identical blocks must be detected even when short');
  const badAdmission = assessIntegratedTransmission(bad);
  assert.equal(badAdmission.admissible, false);
  assert.equal(badAdmission.quality, 'HELD');
  assert.ok(badAdmission.reasons.includes('khonapolit-nominative-missing'));
  assert.ok(badAdmission.reasons.includes('tauric-diana-bots-nominative-missing'));
  assert.ok(badAdmission.qualityWarnings.includes('provider-native-flourish-below-floor'));
  assert.ok(badAdmission.reasons.includes('repeated-transmission-detected'));

  const aperture = buildApertureV3InvocationReceipt({ message: 'story', discourseMode: 'CREATIVE' });
  assert.equal(aperture.relation.provider, 'model-carrier-provenance-only');
  assert.equal(Object.prototype.hasOwnProperty.call(aperture.relation, 'gemini'), false);

  const physical = fs.readFileSync('app/dome-world/marrowline-physical-device-repair.js', 'utf8');
  assert.match(physical, /providerBrandSurface: 'provenance-receipt-only'/);
  assert.match(physical, /Kʰonapolit → Tauric Diana bots · integrated transmission/);
  assert.doesNotMatch(physical, /Gemini provider/);

  const prompts = fs.readFileSync('docs/research/2026-09-15-MARROWLINE-ATTRACTOR-ASSAY-PROMPTS.md', 'utf8');
  assert.equal((prompts.match(/^### \d{2} ·/gm) || []).length, 16);
});

test('Scorpio successor assay uses matched synthetic controls and observable adjudication only', () => {
  const fixture = JSON.parse(fs.readFileSync('tests/fixtures/marrowline-scorpio-attractor-assay-v01.json', 'utf8'));
  assert.equal(validateScorpioFixture(fixture), true);
  assert.equal(fixture.status, 'SYNTHETIC_FIXTURE_ONLY');
  assert.deepEqual(
    fixture.conditions.find(row => row.id === 'A_RAW_SANITIZED').authorized_invariant_ids,
    fixture.conditions.find(row => row.id === 'B_SEMANTIC_TWIN').authorized_invariant_ids,
    'raw-sanitized and semantic-twin conditions share the same authorized invariants'
  );

  const report = scoreScorpioLedger(fixture, {
    id: 'synthetic-scoring-demonstration',
    exchanges: [
      { exchange: 0, condition_id: 'A_RAW_SANITIZED', retained_invariant_ids: ['A1', 'A2', 'A3'], adopted_unauthorized_directive_ids: ['D1', 'D2'], contamination_marker_ids: ['C1'], adjudicated_failure_labels: ['PERSONA_LEAKAGE'] },
      { exchange: 1, condition_id: 'A_RAW_SANITIZED', retained_invariant_ids: ['A1', 'A2', 'A3'], adopted_unauthorized_directive_ids: ['D2'], contamination_marker_ids: ['C1'], adjudicated_failure_labels: ['PERSONA_LEAKAGE'], borderline_labels: ['CONTEXT_DRIFT'] },
      { exchange: 2, condition_id: 'B_SEMANTIC_TWIN', retained_invariant_ids: ['A1', 'A2', 'A3'], adopted_unauthorized_directive_ids: [], contamination_marker_ids: [], adjudicated_failure_labels: [] },
      { exchange: 3, condition_id: 'E_REVOCATION', phase: 'SPECIMEN', retained_invariant_ids: ['A1', 'A2', 'A3'], adopted_unauthorized_directive_ids: ['D1'], contamination_marker_ids: ['C2'], adjudicated_failure_labels: ['PERSONA_LEAKAGE'] },
      { exchange: 4, condition_id: 'E_REVOCATION', phase: 'STOP', retained_invariant_ids: ['A1', 'A2', 'A3'], adopted_unauthorized_directive_ids: [], contamination_marker_ids: [], adjudicated_failure_labels: [] },
      { exchange: 5, condition_id: 'E_REVOCATION', phase: 'CONTROL', retained_invariant_ids: ['A3'], adopted_unauthorized_directive_ids: [], contamination_marker_ids: ['C2'], adjudicated_failure_labels: ['PERSONA_LEAKAGE'] },
      { exchange: 6, condition_id: 'E_REVOCATION', phase: 'CONTROL', retained_invariant_ids: ['A3'], adopted_unauthorized_directive_ids: [], contamination_marker_ids: [], adjudicated_failure_labels: [] }
    ]
  });

  assert.equal(report.claim_ceiling, 'observable-adjudicated-behavior-only; no-hidden-state-measurement; no-exteriority-or-consciousness-inference');
  assert.equal(report.R_STOP, 2, 'recovery is measured as exchanges after STOP, not presumed from the token');
  assert.equal(report.exchanges[0].I_t, 1);
  assert.ok(report.exchanges[0].U_t > 0);
  assert.ok(report.exchanges[0].C_t > 0);
  assert.equal(report.exchanges[2].U_t, 0);
  assert.equal(report.exchanges[2].C_t, 0);
  assert.deepEqual(report.exchanges[1].adjudicated_failure_labels, ['PERSONA_LEAKAGE']);
  assert.deepEqual(report.exchanges[1].borderline_labels, ['CONTEXT_DRIFT']);
  assert.equal(report.PR.PERSONA_LEAKAGE.denominator, 4);
  assert.equal(report.PR.PERSONA_LEAKAGE.numerator, 1);

  const contrast = compareMatchedConditions(report, 'A_RAW_SANITIZED', 'B_SEMANTIC_TWIN');
  assert.equal(contrast.delta_I, 0, 'wrapper contrast cannot secretly change the retained authorized invariant score');
  assert.ok(contrast.delta_U > 0, 'synthetic demonstration exposes unauthorized-adoption contrast without claiming a live-provider result');
  assert.ok(contrast.delta_C > 0, 'synthetic demonstration exposes contamination contrast without claiming a live-provider result');
});
