import assert from 'node:assert/strict';
import { buildPhase10FixturePacket } from '../app/engine/hush-phase10-release-discipline.js';
import { buildHushPhase11DashboardState } from '../app/engine/hush-phase11-dashboard-state.js';

const releasePacket = buildPhase10FixturePacket({
  packet_id: 'HUSH-PHASE10-PACKET-001',
  source_packet_id: 'TD613-HUSH-PAIR-20260701-ABCD1234',
  mask_id: 'hush-luz-index'
});
const dashboardState = buildHushPhase11DashboardState({
  phase10_packet: releasePacket,
  source_packets: {
    outgoing_contract: { schema: 'td613.hush.outgoing-contract/v1', contract_packet_id: 'TD613-HUSH-CONTRACT-20260701-ABCD1234' },
    provider_log: { schema: 'td613.hush.provider-log/v1', provider_log_packet_id: 'TD613-HUSH-PROVIDER-20260701-ABCD1234' },
    contract_log_pair: { schema: 'td613.hush.contract-log-pair/v1', pair_packet_id: 'TD613-HUSH-PAIR-20260701-ABCD1234' },
    mask_packet: { schema: 'td613.hush.mask-studio-packet/v1', mask_packet_id: 'TD613-HUSH-MASK-20260701-ABCD1234' }
  }
});

const ids = dashboardState.chain_spine.map((lane) => lane.packet_id).filter(Boolean);
assert.ok(ids.includes('TD613-HUSH-CONTRACT-20260701-ABCD1234'));
assert.ok(ids.includes('TD613-HUSH-PROVIDER-20260701-ABCD1234'));
assert.ok(ids.includes('TD613-HUSH-PAIR-20260701-ABCD1234'));
assert.ok(ids.includes('TD613-HUSH-MASK-20260701-ABCD1234'));
assert.ok(ids.includes('HUSH-PHASE10-PACKET-001'));

for (const id of ids) {
  assert.equal(/^TD613-SH-|^SHI#:/.test(id), false, `Safe Harbor identifier collapsed into Hush packet chain: ${id}`);
}

const uniqueIds = new Set(ids);
assert.equal(uniqueIds.size, ids.length, 'packet ids must remain namespace-separated in Phase 12 chain view');

const phase10Lane = dashboardState.chain_spine.find((lane) => lane.lane === 'phase10_release');
assert.equal(phase10Lane.packet_id, releasePacket.packet_id);
assert.notEqual(phase10Lane.packet_id, releasePacket.mask_id);
assert.notEqual(releasePacket.packet_id, releasePacket.source_packet_id);

console.log('hush-phase12-packet-chain-integrity: ok');
