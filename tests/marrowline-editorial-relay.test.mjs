import test from 'node:test';
import assert from 'node:assert/strict';
import { assessIntegratedTransmission, parseRelayEnvelope, parseRawRelayPackets, relayAuthoredSurface, KHONAPOLIT_RAW_PACKET_PROTOCOL as P } from '../app/dome-world/khonapolit-relay.js';
import { buildGeminiRequest, khonapolitTaskGuidance, terminalContinuationEligible } from '../server/khonapolit-quality.js';

// Synthetic structural witnesses, not artistic reference specimens.
const quotedVoice = 'H\u0301\u0316A\u0302\u0317R\u0303\u0318\nE\u0304\u0319C\u0305\u031aO\u0306\u031b';
const terminalVoice = 'W\u0301\u0316E\u0302\u0317 KEEP THE DIFFERENCE.\nA\u0303\u0318S\u0304\u0319H\u0305\u0320! T\u0306\u0321HE SECOND WITNESS MAY DISAGREE.';
const ending = '\n\nTauric Diana bots\n' + terminalVoice + '\n⟐';

test('a fenced bot specimen cannot impersonate the terminal movement', () => {
  const text = 'Kʰonapolit\nExamine this source:\n```text\nTauric Diana bots\n' + quotedVoice + '\n```\nThe editorial finding ends here.';
  const admission = assessIntegratedTransmission(text);
  assert.deepEqual(admission.reasons, ['tauric-diana-bots-nominative-missing']);
  assert.equal(terminalContinuationEligible(text, admission.reasons), true);
  assert.equal(parseRelayEnvelope(text).parts[0].text, text);
});

test('literal source diacritics survive analysis without counting as authored narration', () => {
  for (const quote of ['> ' + quotedVoice.replaceAll('\n', '\n> '), '```text\n' + quotedVoice + '\n```', '~~~~\n' + quotedVoice + '\n~~~~']) {
    const text = 'Kʰonapolit\nHere is the supplied specimen:\n' + quote + '\nThe inference remains conditional. I yield the consequence.' + ending;
    const parsed = parseRelayEnvelope(text);
    assert.equal(parsed.admission.admissible, true, parsed.admission.reasons.join(', '));
    assert.equal(parsed.parts[0].text, text);
    assert.equal(parsed.admission.botsIndex, text.lastIndexOf('\nTauric Diana bots'));
  }
});

test('unquoted authored diacritics still obey the first movement rule', () => {
  const text = 'Kʰonapolit\nMy own H\u0301 prose.' + ending;
  assert.ok(assessIntegratedTransmission(text).reasons.includes('khonapolit-combining-mark-contamination'));
});

test('fenced legacy packet examples cannot extract or truncate the current answer', () => {
  const example = [P.analyticStart, 'Kʰonapolit', 'Archived text.', P.analyticEnd, P.stressStart, 'Tauric Diana bots', quotedVoice, P.stressEnd].join('\n');
  const text = 'Kʰonapolit\nInspect the old protocol:\n```text\n' + example + '\n```\nThe present analysis continues beyond the example.' + ending;
  assert.equal(parseRawRelayPackets(text), null);
  const parsed = parseRelayEnvelope(text);
  assert.equal(parsed.parts[0].text, text);
  assert.equal(parsed.admission.admissible, true);
  assert.ok(parseRawRelayPackets(example), 'real legacy transport remains supported');
});

test('observation projection preserves offsets, nested fence length and CRLF', () => {
  const source = 'Kʰonapolit\r\n````text\r\n😀𝌋 H\u0301\r\n```\r\nTauric Diana bots\r\n````\r\nOutside\r\n> quoted 𝌋 H\u0301\r\n';
  const surface = relayAuthoredSurface(source);
  assert.equal(surface.length, source.length);
  assert.equal(surface.indexOf('Outside'), source.indexOf('Outside'));
  assert.deepEqual([...surface.matchAll(/\r\n/g)].map(m => m.index), [...source.matchAll(/\r\n/g)].map(m => m.index));
  assert.doesNotMatch(surface, /Tauric Diana bots|😀|𝌋|\p{M}/u);
  assert.doesNotMatch(relayAuthoredSurface('```\nTauric Diana bots\nUnclosed example'), /Tauric/);
});

test('quoted first movement alone cannot qualify for a terminal-only continuation', () => {
  assert.equal(terminalContinuationEligible('```\nKʰonapolit\nQuoted only.\n```', ['tauric-diana-bots-nominative-missing']), false);
});

test('requested synthesis retains epistemic and practical obligations without rerouting as speculation', () => {
  const guidance = khonapolitTaskGuidance({ taskIntent: { primary_route: 'REQUESTED_SYNTHESIS' } });
  assert.match(guidance, /REQUESTED SYNTHESIS:/);
  assert.match(guidance, /Prior AI text is unverified context/);
  assert.match(guidance, /Never promise complete privacy, anonymity or destination enforcement/);
  assert.match(guidance, /venue, accessibility or amenity evidence/);
  assert.doesNotMatch(guidance, /OPEN-FIELD SPECULATIVE TURN/);
  for (const [route, label] of [['OPEN_FIELD_CREATIVE_SYNTHESIS', 'CREATIVE TURN:'], ['OPEN_FIELD_SPECULATIVE_SYNTHESIS', 'OPEN-FIELD SPECULATIVE TURN:'], ['LEGAL_SYNTHESIS', 'LEGAL SYNTHESIS TURN:'], ['RUNTIME_DIAGNOSIS', 'RUNTIME DIAGNOSIS TURN:'], ['UNRECOGNIZED', 'ORDINARY PROJECT WORK:']]) {
    assert.ok(khonapolitTaskGuidance({ taskIntent: { primary_route: route } }).startsWith(label));
  }
  const request = buildGeminiRequest({ systemInstruction: 'Fixture', message: 'Audit these quotations.', history: [] }, {}, 'gemini-3.8-flash');
  assert.match(request.systemInstruction.parts[0].text, /REQUESTED SYNTHESIS:/);
  assert.match(request.systemInstruction.parts[0].text, /Quoted bot passages, source excerpts and typography specimens/);
  assert.match(request.contents.at(-1).parts.at(-1).text, /fresh terminal Tauric Diana bots movement/);
});
