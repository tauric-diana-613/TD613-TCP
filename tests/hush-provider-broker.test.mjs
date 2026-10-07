import assert from 'assert';
import {
  buildProviderHeldReceipt,
  clearProviderBrokerState,
  providerKey,
  providerMayCall,
  writeProviderCooldown,
  writeProviderStateFromReceipt,
  HUSH_PROVIDER_BROKER_VERSION
} from '../app/engine/hush-provider-broker.js';

clearProviderBrokerState();
const meta = { provider: 'gemini-strict', model: 'auto-quality', endpoint: 'https://td613.com/api/hush-generate-strict' };
const key = providerKey(meta);
assert(key.includes('gemini-strict'));
assert.equal(providerMayCall(meta, 1000).mayCall, true);
const state = writeProviderCooldown(meta, { reason: 'provider_quota_exhausted', httpStatus: 429, retryAfterSeconds: 56 }, 1000);
assert.equal(state.version, HUSH_PROVIDER_BROKER_VERSION);
assert.equal(state.mayCall, false);
assert.equal(state.state, 'cooling_down');
assert.equal(state.retryAfterSeconds, 185);
assert.equal(state.providerRetryAfterSeconds, 56);
const held = buildProviderHeldReceipt(state, { packetTier: 'plain_record_packet', maskEvidenceState: 'seed_derived' });
assert.equal(held.status, 'held');
assert.equal(held.fallbackReleased, false);
assert.equal(held.reason, 'provider_cooling_down');
assert.equal(held.packetTier, 'plain_record_packet');
assert.equal(providerMayCall(meta, 58000).mayCall, false);
assert.equal(providerMayCall(meta, 186000).mayCall, true);

clearProviderBrokerState();
const modelScoped = writeProviderStateFromReceipt(meta, {
  reason: 'model_quota_exhausted',
  httpStatus: 429,
  retryAfterSeconds: 12,
  model: 'gemini-3.8-flash',
  providerQuota: { quotaScope: 'model', model: 'gemini-3.8-flash' }
}, 2000);
assert.equal(modelScoped.reason, 'model_quota_exhausted');
assert.equal(modelScoped.model, 'gemini-3.8-flash');
assert.equal(modelScoped.mayCall, false);
assert.equal(providerMayCall(meta, 2000).mayCall, true, 'model-scoped quota must not freeze the auto-quality provider route');

clearProviderBrokerState();
const ambiguous = writeProviderStateFromReceipt(meta, {
  reason: 'quota',
  httpStatus: 429,
  retryAfterSeconds: 0
}, 3000);
assert.equal(ambiguous.mayCall, true, 'bare 429 cannot establish provider-wide cooldown');
assert.equal(ambiguous.state, 'available');

clearProviderBrokerState();
const providerScoped = writeProviderStateFromReceipt(meta, {
  reason: 'provider_quota_exhausted',
  httpStatus: 429,
  retryAfterSeconds: 4,
  providerQuota: { quotaScope: 'provider' }
}, 4000);
assert.equal(providerScoped.reason, 'provider_quota_exhausted');
assert.equal(providerScoped.model, 'auto-quality');
assert.equal(providerScoped.mayCall, false);
assert.equal(providerMayCall(meta, 4000).mayCall, false);

clearProviderBrokerState();
console.log('hush-provider-broker.test.mjs passed');
