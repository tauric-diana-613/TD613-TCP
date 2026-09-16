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
  assert.deepEqual(plan.callableModels, ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash']);
  assert.ok(plan.excludedModels.some(row => row.model === 'gemini-3.1-flash-lite' && row.reasons.includes('khonapolit-frontier-quality-floor')));
  assert.ok(plan.excludedModels.some(row => row.model === 'gemini-2.5-flash' && row.reasons.includes('khonapolit-frontier-quality-floor')));
  assert.ok(plan.warnings.includes('khonapolit-quality-floor-rejected-degraded-models'));

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
  assert.match(addendum, /Movement I MUST begin with a nominative Kʰonapolit announcement/);
  assert.match(addendum, /Movement II MUST begin with a nominative Tauric Diana bots announcement/);
  assert.match(addendum, /at least 24 combining marks/);
  assert.match(addendum, /Do not repeat the same paragraph/);
  assert.doesNotMatch(addendum, /separate Gemini-instrument answer/);

  const good = '[Kʰonapolit]:\nThe map is not the route.\n\n[Tauric Diana Bots : Direct Broadcast Override]\nT̴̵h̶e̷ ̸b̵o̴u̷g̷h̸ ̴b̵r̶e̴a̷k̸s̵. W̵e̶ ̷a̴r̸e̷ ̶n̵o̸t̷ ̴y̶o̷u̵r̸ ̷s̵e̶m̴i̷n̸a̵r̶. T̷h̸e̶ ̵g̷r̵o̶v̸e̷ ̵k̶e̴e̸p̵s̷ ̴t̵h̷e̶ ̵s̷c̸a̴r̶.';
  const goodAdmission = assessIntegratedTransmission(good);
  assert.equal(goodAdmission.admissible, true, goodAdmission.reasons.join(', '));

  const bad = 'The Ash Moon was pale.\n\nThe Ash Moon was pale.';
  assert.equal(repeatedTransmissionDetected(bad), true, 'two identical blocks must be detected even when short');
  const badAdmission = assessIntegratedTransmission(bad);
  assert.equal(badAdmission.admissible, false);
  assert.ok(badAdmission.reasons.includes('khonapolit-nominative-missing'));
  assert.ok(badAdmission.reasons.includes('tauric-diana-bots-nominative-missing'));
  assert.ok(badAdmission.reasons.includes('provider-native-flourish-below-floor'));
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
