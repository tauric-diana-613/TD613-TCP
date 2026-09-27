import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { findMarrowlineSpeakerHeading, renderMarrowlineSpeakerLine } from '../app/dome-world/marrowline-speaker-frames.js';

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
