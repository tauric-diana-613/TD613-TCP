import assert from 'assert';
import {
  buildProviderHeldReceipt,
  clearProviderBrokerState,
  providerKey,
  providerMayCall,
  writeProviderCooldown,
  HUSH_PROVIDER_BROKER_VERSION
} from '../app/engine/hush-provider-broker.js';

clearProviderBrokerState();
const meta = { provider: 'gemini-strict', model: 'gemini-2.5-flash-lite', endpoint: 'https://td613.com/api/hush-generate-strict' };
const key = providerKey(meta);
assert(key.includes('gemini-strict'));
assert.equal(providerMayCall(meta, 1000).mayCall, true);
const state = writeProviderCooldown(meta, { reason: 'provider_quota_exhausted', httpStatus: 429, retryAfterSeconds: 56 }, 1000);
assert.equal(state.version, HUSH_PROVIDER_BROKER_VERSION);
assert.equal(state.mayCall, false);
assert.equal(state.state, 'cooling_down');
assert.equal(state.retryAfterSeconds, 56);
const held = buildProviderHeldReceipt(state, { packetTier: 'plain_record_packet', maskEvidenceState: 'seed_derived' });
assert.equal(held.status, 'held');
assert.equal(held.fallbackReleased, false);
assert.equal(held.reason, 'provider_cooling_down');
assert.equal(held.packetTier, 'plain_record_packet');
assert.equal(providerMayCall(meta, 58000).mayCall, true);
clearProviderBrokerState();
console.log('hush-provider-broker.test.mjs passed');
