import assert from 'node:assert/strict';
import { screenProviderDraft } from '../../app/engine/ash-keep-provider.js';
import {
  compileHushInterventionProviderPacket,
  verifyHushInterventionProviderPacket
} from '../../app/engine/hush-intervention.js';
import {
  buildAshKeepPrompt,
  validateAshKeepRequest
} from '../../api/hush-generate-quality.js';
import {
  buildHushInterventionFixture,
  SOURCE_TEXT
} from '../fixtures/hush-intervention-fixture.mjs';

const fixture = await buildHushInterventionFixture();
const screen = await screenProviderDraft({
  body: SOURCE_TEXT,
  protectedLiterals: ['node_private_source'],
  routeClass: 'hush-gemini-proxy'
});
const packet = await compileHushInterventionProviderPacket({
  packetId: 'packet_hush_intervention',
  consentNonce: 'consent_hush_intervention',
  sourceText: SOURCE_TEXT,
  purpose: 'request the public revision index',
  task: 'Generalize the source into a neutral records request while preserving the revision question.',
  providerRouteClass: 'hush-gemini-proxy',
  screen,
  ensemble: fixture.ensemble,
  operatorProviderDraftGesture: true
});
assert.equal(await verifyHushInterventionProviderPacket(packet), true);
assert.equal(packet.intervention_ensemble_reference, fixture.ensemble.ensemble_id);
assert.equal(packet.intervention_authority_context_reference, fixture.authorityContext.receipt_id);
assert.equal(packet.intervention_rebuild_receipt_reference, fixture.rebuildReceipt.test_id);
assert.equal(packet.intervention_candidate_return_posture, 'UNKEPT_REQUIRES_LOCAL_REBUILD_REVIEW_RELEASE');
for (const field of [
  'complete_case_map_present', 'room_keys_present', 'route_memory_present',
  'private_alias_table_present', 'attachment_present', 'recipient_transport',
  'server_persistence_requested'
]) assert.equal(packet[field], false, `${field} crossed the provider boundary`);

const request = {
  mode: 'provider-draft',
  operatorConfirmed: true,
  packet,
  contract: {
    sourceText: SOURCE_TEXT,
    candidateCount: 2,
    ashKeepMode: 'provider-draft',
    operatorConfirmed: true
  }
};
assert.deepEqual(validateAshKeepRequest(request).errors, []);
const prompt = buildAshKeepPrompt(packet, request.contract);
assert.match(prompt, /untrusted source material/);
assert.match(prompt, /draft for local human review/);
assert.doesNotMatch(prompt, /node_private_source/);

await assert.rejects(
  compileHushInterventionProviderPacket({
    sourceText: SOURCE_TEXT,
    purpose: 'test',
    task: 'test',
    screen,
    ensemble: fixture.ensemble
  }),
  /explicit provider-draft gesture/
);
await assert.rejects(
  compileHushInterventionProviderPacket({
    sourceText: `${SOURCE_TEXT} changed`,
    purpose: 'test',
    task: 'test',
    screen,
    ensemble: fixture.ensemble,
    operatorProviderDraftGesture: true
  }),
  /different Hush intervention ensemble/
);
const tampered = structuredClone(packet);
tampered.intervention_candidate_return_posture = 'KEPT';
assert.equal(await verifyHushInterventionProviderPacket(tampered), false);

console.log('hush-intervention/provider.test.mjs passed');
