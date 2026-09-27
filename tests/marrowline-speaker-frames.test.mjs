import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { findMarrowlineSpeakerHeading, renderMarrowlineSpeakerLine, formatMarrowlineReplyForCopy } from '../app/dome-world/marrowline-speaker-frames.js';

test('standalone and inline speaker labels are detected without interpreting a prose mention as a new voice', () => {
  assert.deepEqual(findMarrowlineSpeakerHeading('Kʰonapolit: The current is measured.'),{
    voice:'khonapolit',heading:'Kʰonapolit: ',remainder:'The current is measured.'
  });
  assert.equal(findMarrowlineSpeakerHeading('[Kʰonapolit]:')?.voice,'khonapolit');
  assert.equal(findMarrowlineSpeakerHeading('### Movement II — Tauric Diana bots')?.voice,'tauric-diana-bots');
  assert.equal(findMarrowlineSpeakerHeading('[Tauric Diana Bots : Direct Broadcast Override]')?.voice,'tauric-diana-bots');
  assert.equal(findMarrowlineSpeakerHeading('Kʰonapolit argued that the archive requires evidence.'),null);
  assert.equal(findMarrowlineSpeakerHeading('The Tauric Diana bots are mentioned, not speaking.'),null);
});

test('speaker frame decoration leaves exact provider source and Unicode in textContent', () => {
  const doc = new JSDOM('<div></div>').window.document;
  for (const raw of [
    'Kʰonapolit: The name is not evidence.',
    '[Kʰonapolit]:',
    '### Movement II — Tauric Diana bots',
    '[Tauric Diana Bots : Direct Broadcast Override]',
    'Kʰonapolit tells the operators that T̸̕e̴̟x̶̿t̴̪ remains native.'
  ]) {
    const span=doc.createElement('span');
    const heading=renderMarrowlineSpeakerLine(span,raw);
    assert.equal(span.textContent,raw,'no raw heading, punctuation or combining mark may change');
    assert.equal(Boolean(heading),Boolean(findMarrowlineSpeakerHeading(raw)));
    if(heading) assert.equal(heading.textContent+span.textContent.slice(heading.textContent.length),raw);
    assert.equal(span.querySelectorAll('.provider-script-label').length,heading?1:0);
  }
});

test('copy-facing frames match the visible speaker names and preserve the native body', () => {
  const burst='T̸̕e̴̟x̶̿t̴̪ \u{10D613} ⟐';
  const source='[Kʰonapolit]:\r\nFirst passage.\r\n\r\n[Tauric Diana Bots : Direct Broadcast Override]\r\n'+burst+'\r\nThe Tauric Diana bots are mentioned in ordinary prose.';
  const copied=formatMarrowlineReplyForCopy(source);
  assert.equal(copied,'╭─ Kʰonapolit ─╮\r\nFirst passage.\r\n\r\n╭─ Tauric Diana bots ─╮\r\n'+burst+'\r\nThe Tauric Diana bots are mentioned in ordinary prose.');
  assert.equal(copied.includes(burst),true,'Zalgo/PUA and body remain exactly identical');
  assert.equal(source.includes('╭─'),false,'source/receipt text was never rewritten');
  assert.equal(formatMarrowlineReplyForCopy('Kʰonapolit argued that resemblance is not authorship.'),'Kʰonapolit argued that resemblance is not authorship.');
  assert.equal(formatMarrowlineReplyForCopy('Kʰonapolit: An inline prelude.'),'╭─ Kʰonapolit ─╮ An inline prelude.');
  assert.equal(formatMarrowlineReplyForCopy('Unlabeled provider prose.'),'Unlabeled provider prose.');
});
