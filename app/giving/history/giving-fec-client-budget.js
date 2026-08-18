import { GivingApiClient } from './giving-api.js';

const FEC_SOURCE_ID = 'fec-schedule-a';
const FEC_CLIENT_TIMEOUT_MS = 32_000;
const PATCH_MARKER = Symbol.for('td613.giving.fec-client-budget/v1');

const prototype = GivingApiClient.prototype;
if (!prototype[PATCH_MARKER]) {
  const priorCall = prototype.call;
  prototype.call = function givingCallWithFecBudget(operation, payload = {}, options = {}) {
    if (operation === 'search.page' && payload?.source_instance_id === FEC_SOURCE_ID) {
      const requested = Number(options?.timeoutMs);
      if (!Number.isFinite(requested) || requested < FEC_CLIENT_TIMEOUT_MS) {
        options = { ...options, timeoutMs: FEC_CLIENT_TIMEOUT_MS };
      }
    }
    return priorCall.call(this, operation, payload, options);
  };
  Object.defineProperty(prototype, PATCH_MARKER, { value: true });
}

export const GIVING_FEC_CLIENT_TIMEOUT_MS = FEC_CLIENT_TIMEOUT_MS;
export const GIVING_FEC_CLIENT_SOURCE_ID = FEC_SOURCE_ID;
