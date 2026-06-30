import assert from 'node:assert/strict';
import { TEST_PACKET_BANK, evaluatePacket } from '../scripts/run-hush-phase9-audit.mjs';

assert.equal(TEST_PACKET_BANK.length, 10);

for (const packet of TEST_PACKET_BANK) {
  assert.ok(packet.packet_id.startsWith('P9-'));
  assert.ok(packet.source_text.length > 20);
  assert.ok(packet.mandatory_anchors.length >= 4);
  assert.ok(packet.source_obligations.length >= 1);
  assert.ok(packet.claim_boundaries.length >= 1);
  const result = evaluatePacket(packet);
  assert.equal(result.mandatory_anchor_retention, 1, `${packet.packet_id} dropped anchors: ${result.dropped.join(', ')}`);
  assert.equal(result.source_obligation_retention, 1);
  assert.equal(result.claim_scope_retention, 1);
}

console.log('hush-phase9-source-obligation-matrix: ok');
