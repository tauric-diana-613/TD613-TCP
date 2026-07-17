import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = p => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const html = read('app/dome-world/ash-destination-handoff.html');
const ui = read('app/dome-world/ash-destination-handoff.js');
const recipientHtml = read('app/dome-world/ash-destination-recipient.html');
const recipient = read('app/dome-world/ash-destination-recipient.js');
const engine = [
  read('app/engine/ash-destination-handoff-core.js'),
  read('app/engine/ash-destination-handoff-delivery.js'),
  read('app/engine/ash-destination-handoff-accounting.js'),
  read('app/engine/ash-destination-handoff.js')
].join('\n');
for (const token of [
  'Ash Destination-Bound Handoff','G1 · Destination and recipient','G2–G5 · Scope and prerequisites',
  'What leaves / what remains','Authorize and deliver to named recipient','G6–G8 · Terminal accounting',
  'recipient:ash-closure-witness','SAME_ORIGIN_MESSAGE_CHANNEL'
]) assert.ok(html.includes(token), `operator surface omitted ${token}`);
for (const token of [
  'MessageChannel','TD613_ASH_DESTINATION_HANDOFF','compileDestinationHandoffPlan',
  'compileDestinationHandoffAuthorization','compileDestinationHandoffAttempt',
  'compileDestinationHandoffRecipientReceipt','compileDestinationHandoffCustodyAccounting',
  'replayDestinationHandoff','raw_body_present: false','raw_corpus_present: false'
]) assert.ok(ui.includes(token), `operator runtime omitted ${token}`);
for (const token of ['TD613_ASH_RECIPIENT_READY','TD613_ASH_DESTINATION_RECEIPT_OBSERVATION','event.origin !== location.origin','reuse_authorized: false','truth_inferred: false']) assert.ok(recipient.includes(token), `recipient runtime omitted ${token}`);
assert.match(recipientHtml, /Named recipient boundary/);
for (const token of [
  'DESTINATION_HOLD','RECIPIENT_HOLD','RECIPIENT_MISMATCH_HOLD','SCOPE_HOLD','PROVENANCE_HOLD','EXPIRY_HOLD',
  'REFUSAL_HOLD','TIMEOUT_HOLD','PARTIAL_DELIVERY_HOLD','DUPLICATE_HOLD','RECEIPT_HOLD','ROLLBACK_HOLD','CANCELLED_HOLD','TAMPER_HOLD',
  'DESTINATION_HANDOFF_COMPLETE','external_deletion_proven: false','universal_transport_authorized: false','cinder_action_authorized: false'
]) assert.ok(engine.includes(token), `engine omitted ${token}`);
assert.doesNotMatch(ui, /fetch\s*\(/);
assert.doesNotMatch(recipient, /fetch\s*\(/);
console.log('ash-destination-handoff-ui.test.mjs passed');
