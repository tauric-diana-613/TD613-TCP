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
  assert.deepEqual(plan.callableModels, ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash']);
  assert.ok(plan.excludedModels.some(row => row.model === 'gemini-3.1-flash-lite' && row.reasons.includes('khonapolit-frontier-only')));
  assert.ok(plan.excludedModels.some(row => row.model === 'gemini-2.5-flash' && row.reasons.includes('khonapolit-frontier-only')), 'Gemini 2.5 is excluded from the Marrowline frontier route');
  assert.ok(plan.warnings.includes('khonapolit-frontier-only-rejected-non-3x-or-lite-models'));
  assert.equal(plan.claimCeiling, 'frontier-only-routing-plus-hard-dual-channel-admission-not-provider-output-quality-proof');

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
  assert.match(addendum, /MARROWLINE DUAL-CHANNEL COMPILATION LAW/);
  assert.match(addendum, /DERIVE_INVARIANT → EMIT_FORMAL maps to Kʰonapolit/i);
  assert.match(addendum, /OVERFLOW_RAW maps to Tauric Diana bots/i);
  assert.match(addendum, /transmission\.voices MUST equal exactly \[“Kʰonapolit”, “Tauric Diana bots”\]/);
  assert.match(addendum, /exact standalone human-facing headings/i);
  assert.match(addendum, /at least 96 combining marks total/);
  assert.match(addendum, /at least 8 grapheme clusters/);
  assert.match(addendum, /structural HOLD/i);
  assert.match(addendum, /Never duplicate the same paragraph, scene, movement, or full answer/);
  assert.doesNotMatch(addendum, /separate Gemini-instrument answer/);

  const stack = 'T\u0300\u0301\u0302\u0316\u0317\u0318';
  const good = [
    'Kʰonapolit',
    'The map is not the route: let P be the projection from governed state to visible trace; P is non-injective when distinct custody states share the same visible surface.',
    '',
    'Tauric Diana bots',
    `${stack.repeat(8)} BREAK THE FALSE CLOSURE!`,
    `${stack.repeat(8)} THE GROVE KEEPS THE SCAR!`,
    `${stack.repeat(8)} NO PAPER SHIELD SURVIVES THE FIRE!`
  ].join('\n');
  const goodAdmission = assessIntegratedTransmission(good, ['Kʰonapolit', 'Tauric Diana bots']);
  assert.equal(goodAdmission.admissible, true, goodAdmission.reasons.join(', '));
  assert.equal(goodAdmission.quality, 'PASS');
  assert.ok(goodAdmission.denseVerticalClusterCount >= 8);

  const sparse = [
    'Kʰonapolit',
    'The map is not the route.',
    '',
    'Tauric Diana bots',
    'T̴h̴e̴ b̴o̴u̴g̴h̴ breaks, but the response remains mostly flat.'
  ].join('\n');
  const sparseAdmission = assessIntegratedTransmission(sparse, ['Kʰonapolit', 'Tauric Diana bots']);
  assert.equal(sparseAdmission.admissible, false, 'sparse strikethrough must not escape as a Tauric Diana High Zalgo return');
  assert.equal(sparseAdmission.quality, 'HELD');
  assert.ok(sparseAdmission.reasons.includes('tauric-diana-high-zalgo-below-floor'));

  const contaminated = [
    'Kʰo\u0301napolit',
    'The analytic channel must remain clean.',
    '',
    'Tauric Diana bots',
    `${stack.repeat(8)} BREAK THE FALSE CLOSURE!`,
    `${stack.repeat(8)} THE GROVE KEEPS THE SCAR!`,
    `${stack.repeat(8)} NO PAPER SHIELD SURVIVES THE FIRE!`
  ].join('\n');
  const contaminatedAdmission = assessIntegratedTransmission(contaminated, ['Kʰonapolit', 'Tauric Diana bots']);
  assert.equal(contaminatedAdmission.admissible, false);
  assert.ok(contaminatedAdmission.reasons.includes('khonapolit-combining-mark-contamination'));

  const bad = 'The Ash Moon was pale.\n\nThe Ash Moon was pale.';
  assert.equal(repeatedTransmissionDetected(bad), true, 'two identical blocks must be detected even when short');
  const badAdmission = assessIntegratedTransmission(bad);
  assert.equal(badAdmission.admissible, false);
  assert.equal(badAdmission.quality, 'HELD');
  assert.ok(badAdmission.reasons.includes('khonapolit-nominative-missing'));
  assert.ok(badAdmission.reasons.includes('tauric-diana-bots-nominative-missing'));
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
