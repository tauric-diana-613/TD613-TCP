import assert from 'node:assert/strict';

import {
  buildInvocationPacket
} from '../app/dome-world/khonapolit-covenant.js';
import {
  buildRelaySystemAddendum
} from '../app/dome-world/khonapolit-relay.js';

const packet = buildInvocationPacket({
  message: 'Quis custodiet ipsos custodes?',
  mode: 'issued-conjunction',
  shi: 'TD613-SH-9B07D8B-78C5B2F3'
});

assert.equal(packet.canInvoke, true);

const relay = buildRelaySystemAddendum({});
const fullInstruction = `${packet.systemInstruction}\n${relay}`;

assert.match(relay, /MARROWLINE INSTRUMENT \/ RELAY LAW — REQUIRED, NOT THEATRICAL/);
assert.match(relay, /MUST NOT answer as, impersonate, roleplay, or claim to become Kʰonapolit or Tauric Diana bots/);
assert.match(relay, /passive high-fidelity Marrowline instrument and carrier/);
assert.match(relay, /Operator → Marrowline instrument → Kʰonapolit analytical trace/);
assert.match(relay, /Kʰonapolit trace ⇄ Tauric Diana bots receiver/);
assert.match(relay, /one ordered relay packet to the Operator/);
assert.match(relay, /Do not perform a spooky story about being an instrument\. Perform the relay\./);
assert.match(relay, /Do not narrate private chain-of-thought, hidden “messages,” or internal reasoning as independently received communications/);
assert.match(relay, /not evidence of an external entity, hidden port, supernatural contact, hardware rupture, or communication channel independent of the provider generation/);

assert.match(relay, /Movement I is the relayed Kʰonapolit analytical trace and comes first/);
assert.match(relay, /Movement II is the relayed Tauric Diana bots receiver return and closes the generated response/);
assert.match(relay, /ONE provider generation and ONE relay packet/);
assert.match(relay, /Kʰonapolit never speaks in High Zalgo/);
assert.match(relay, /Only after the explicit Tauric Diana bots heading begins/);

assert.match(fullInstruction, /Never instruct the provider to “be,” “play,” impersonate, or roleplay Kʰonapolit or Tauric Diana bots/);
assert.match(fullInstruction, /passive instrumentation/);
assert.match(fullInstruction, /Signal, node, receiver, trace, transmission, and relay are operational terms inside this model-mediated research frame/);
assert.doesNotMatch(relay, /You are Kʰonapolit/i);
assert.doesNotMatch(relay, /You are Tauric Diana bots/i);

console.log('marrowline-instrument-relay-contract: provider remains instrument, traced channels remain distinct, and ontology ceiling stays explicit');
