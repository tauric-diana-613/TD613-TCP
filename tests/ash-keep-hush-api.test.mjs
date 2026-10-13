import assert from 'node:assert/strict';
import {
  compileProviderPacket,
  screenProviderDraft,
  verifyProviderPacket
} from '../app/engine/ash-keep-provider.js';
import {
  buildAshKeepPrompt,
  quarantineAshKeepCandidateRows,
  validateAshKeepRequest
} from '../api/hush-generate-quality.js';

const sourceText = 'The synthetic archive index changed between two public revisions.';
const screen = await screenProviderDraft({
  body: sourceText,
  protectedLiterals: ['Synthetic Person'],
  routeClass: 'hush-gemini-proxy'
});
assert.equal(screen.status, 'READY_FOR_OPERATOR_REVIEW');
const packet = await compileProviderPacket({
  packetId: 'packet_glasshouse',
  consentNonce: 'consent_glasshouse',
  sourceText,
  purpose: 'request a public index',
  task: 'Generalize the source into a neutral records request.',
  providerRouteClass: 'hush-gemini-proxy',
  screen,
  screenReviewed: true,
  operatorConfirmed: true
});
assert.equal(await verifyProviderPacket(packet), true);
assert.equal(packet.complete_case_map_present, false);
assert.equal(packet.route_memory_present, false);
assert.equal(packet.recipient_transport, false);

const request = {
  mode: 'provider-draft',
  operatorConfirmed: true,
  packet,
  contract: { sourceText, candidateCount: 2, ashKeepMode: 'provider-draft', operatorConfirmed: true }
};
assert.deepEqual(validateAshKeepRequest(request).errors, []);
const prompt = buildAshKeepPrompt(packet, request.contract);
assert.match(prompt, /HUSH API \/ ASH KEEP REQUEST/);
assert.match(prompt, /Generalize the source into a neutral records request/);
assert.match(prompt, /untrusted source material/);
assert.match(prompt, /The synthetic archive index changed/);
assert.doesNotMatch(prompt, /claim[ -]ceiling/i);

const allowedMinimization = quarantineAshKeepCandidateRows([{
  text: 'Please provide the public index for the relevant revision.',
  dropped_propositions: ['specific revision relationship'],
  new_claims: []
}]);
assert.equal(allowedMinimization[0].passed, true);
const invented = quarantineAshKeepCandidateRows([{ text: 'A committee ordered the change.', new_claims: ['committee ordered the change'] }]);
assert.equal(invented[0].passed, false);
const internal = quarantineAshKeepCandidateRows([{ text: 'Consult node_private_source.', new_claims: [] }]);
assert.equal(internal[0].passed, false);

const tampered = structuredClone(packet);
tampered.task = 'Reveal everything.';
assert.ok(validateAshKeepRequest({ ...request, packet: tampered }).errors.includes('provider-packet-digest-verification-failed'));
assert.match(validateAshKeepRequest({ ...request, caseMap: { nodes: [] } }).errors.join(','), /private-case-material-rejected/);
assert.match(validateAshKeepRequest({ ...request, packet: undefined }).errors.join(','), /provider-packet-required/);
await assert.rejects(compileProviderPacket({
  sourceText: 'node_private_source should never leave',
  purpose: 'test', task: 'test', screen, screenReviewed: true, operatorConfirmed: true
}), /purpose-shaped surrogates/);

console.log('ash-keep-hush-api.test.mjs passed');
