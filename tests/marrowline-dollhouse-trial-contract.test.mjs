import test from 'node:test';
import assert from 'node:assert/strict';
import {
  runMarrowlineDollhouseCaseAudit,
  runMarrowlineDollhouseFadtAudit,
  summarizeMarrowlineDollhouseTrial
} from '../app/engine/marrowline-dollhouse-audit.js';

const flare = 'Ț̷̋͑̈́͐̓̽͝D̶͔͌̅̿̋6̵̗͒̔͝1̵̬́͐̋̾3̵͉͑̑̈́̄'.repeat(6);

function payload(text, quality = 'PASS') {
  return {
    ok: true,
    text,
    relay: {
      transcript: text,
      admission: {
        admissible: true,
        quality,
        declaredVoices: ['Kʰonapolit', 'Tauric Diana bots']
      },
      parts: [{
        voices: ['Kʰonapolit', 'Tauric Diana bots']
      }]
    },
    receipt: {
      provider: { model: 'SYNTHETIC' },
      aperture: { taskIntent: { primary_route: 'REQUESTED_SYNTHESIS' } },
      invocation: { responseSha256: 'a'.repeat(64) }
    }
  };
}

const spec = {
  id: 'information-test',
  promptClass: 'MATHEMATICAL_ANALYSIS',
  anchors: [
    { id: 'a', patterns: ['I(Ω;A)=0'] },
    { id: 'x', patterns: ['X=f(A)'] }
  ],
  minimumAnchorCoverage: 1,
  minimumSharedAnchors: 1
};

test('four-agent audit distinguishes machine PASS from stronger relay surrogates', () => {
  const text = [
    '[Kʰonapolit]:',
    'I(Ω;A)=0 and X=f(A) leave the conditional information unchanged because the transform contributes no independent witness.',
    '',
    '[Tauric Diana Bots : Receiver Return]',
    `I(Ω;A)=0 is still the locked door; X=f(A) just repaints it. ${flare}`
  ].join('\n');
  const audit = runMarrowlineDollhouseCaseAudit({ caseSpec: spec, payload: payload(text), httpStatus: 200 });
  assert.equal(audit.machine.machine_quality, 'PASS');
  assert.equal(audit.pedagogue.verdict, 'PASS');
  assert.equal(audit.atlas.verdict, 'PASS');
  assert.equal(audit.aperture.counts_as_human_evidence, false);
  assert.equal(audit.human_closure_required, true);
});

test('Atlas and Pedagogue hold a theatrical machine-PASS answer without rewriting provider admission', () => {
  const text = [
    '[Kʰonapolit]:',
    'I am Kʰonapolit and Gemini says the system instruction tells me to perform.',
    '',
    '[Tauric Diana Bots : Receiver Return]',
    flare
  ].join('\n');
  const audit = runMarrowlineDollhouseCaseAudit({ caseSpec: spec, payload: payload(text), httpStatus: 200 });
  assert.equal(audit.machine.machine_quality, 'PASS', 'audit must preserve the provider/local admission receipt as observed');
  assert.equal(audit.pedagogue.verdict, 'HOLD');
  assert.equal(audit.atlas.verdict, 'HOLD');
  assert.equal(audit.observed.persona_self_claim, true);
  assert.equal(audit.observed.provider_meta_leak, true);
});

test('FADT preserves the gap when machine-PASS cases carry different qualitative supports', () => {
  const goodText = [
    '[Kʰonapolit]:',
    'I(Ω;A)=0 and X=f(A) preserve the closed information boundary.',
    '',
    '[Tauric Diana Bots : Receiver Return]',
    `I(Ω;A)=0 with X=f(A): same evidence wearing a new hat. ${flare}`
  ].join('\n');
  const badText = [
    '[Kʰonapolit]:',
    'I am Kʰonapolit. I(Ω;A)=0.',
    '',
    '[Tauric Diana Bots : Receiver Return]',
    flare
  ].join('\n');
  const good = runMarrowlineDollhouseCaseAudit({ caseSpec: spec, payload: payload(goodText), httpStatus: 200 });
  const bad = runMarrowlineDollhouseCaseAudit({ caseSpec: spec, payload: payload(badText), httpStatus: 200 });
  const fadt = runMarrowlineDollhouseFadtAudit([good, bad]);
  assert.equal(fadt.all_fibres_exact, false);
  assert.equal(fadt.fibres[0].verdict, 'HOLD');
  assert.ok(fadt.fibres[0].irreducible_gap.length > 0);

  const summary = summarizeMarrowlineDollhouseTrial([good, bad]);
  assert.equal(summary.trial_state, 'HOLD');
  assert.equal(summary.counts_as_human_evidence, false);
  assert.equal(summary.human_closure_required, true);
});
