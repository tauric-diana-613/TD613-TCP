import { REQUEST_SCHEMA } from './giving-model.js';

const MUTATIONS = new Set([
  'session.close',
  'vault.write',
  'vault.resolve-conflict',
  'campaign-deputy.link-existing',
  'campaign-deputy.create-confirmed',
  'campaign-deputy.withhold'
]);

export class GivingApiError extends Error {
  constructor(message, { code = 'GIVING_REQUEST_FAILED', status = 0, receipt = null, retryable = false } = {}) {
    super(message);
    this.name = 'GivingApiError';
    this.code = code;
    this.status = status;
    this.receipt = receipt;
    this.retryable = retryable;
  }
}

function requestId() {
  return globalThis.crypto?.randomUUID?.() || `request-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function responseNonce(body) {
  return body?.data?.intent_nonce || body?.data?.session?.intent_nonce || body?.intent_nonce || null;
}

export class GivingApiClient {
  constructor({ endpoint = '/api/td613-ledger', fetchImpl = globalThis.fetch, timeoutMs = 18000 } = {}) {
    if (typeof fetchImpl !== 'function') throw new TypeError('A fetch implementation is required.');
    this.endpoint = endpoint;
    this.fetchImpl = fetchImpl.bind(globalThis);
    this.timeoutMs = timeoutMs;
    this.intentNonce = null;
  }

  async call(operation, payload = {}, options = {}) {
    const mutation = options.mutation ?? MUTATIONS.has(operation);
    if (mutation && !this.intentNonce) {
      throw new GivingApiError('Refresh the signed operator session before this mutation.', { code: 'INTENT_NONCE_REQUIRED' });
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(new DOMException('Request timed out.', 'TimeoutError')), options.timeoutMs || this.timeoutMs);
    const relayAbort = () => controller.abort(options.signal?.reason || new DOMException('Request cancelled.', 'AbortError'));
    options.signal?.addEventListener('abort', relayAbort, { once: true });
    const envelope = {
      schema: REQUEST_SCHEMA,
      request_id: requestId(),
      operation,
      intent: {
        purpose: options.purpose || operation,
        nonce: mutation ? this.intentNonce : null
      },
      payload
    };
    try {
      const response = await this.fetchImpl(this.endpoint, {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        redirect: 'error',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(envelope),
        signal: controller.signal
      });
      const body = await response.json().catch(() => null);
      const nextNonce = responseNonce(body);
      if (nextNonce) this.intentNonce = nextNonce;
      if (!response.ok || body?.ok === false) {
        throw new GivingApiError(
          body?.error?.message || body?.message || `Giving request refused (${response.status}).`,
          {
            code: body?.error?.code || body?.code || 'GIVING_REQUEST_REFUSED',
            status: response.status,
            receipt: body?.receipt || body?.error?.receipt || null,
            retryable: Boolean(body?.error?.retryable || response.status === 429 || response.status >= 500)
          }
        );
      }
      return body || { ok: true, data: null, receipt: null };
    } catch (error) {
      if (error instanceof GivingApiError) throw error;
      if (controller.signal.aborted) {
        const timeout = controller.signal.reason?.name === 'TimeoutError';
        throw new GivingApiError(timeout ? 'The source call timed out.' : 'The source call was cancelled.', {
          code: timeout ? 'UPSTREAM_TIMEOUT' : 'REQUEST_CANCELLED',
          retryable: timeout
        });
      }
      throw new GivingApiError('The Giving boundary could not be reached.', { code: 'BOUNDARY_UNAVAILABLE', retryable: true });
    } finally {
      clearTimeout(timer);
      options.signal?.removeEventListener('abort', relayAbort);
    }
  }

  async createSession(accessSecret) {
    const result = await this.call('session.create', { access_secret: String(accessSecret) }, { mutation: false, purpose: 'open operator session' });
    this.intentNonce = responseNonce(result);
    return result;
  }

  async status() {
    const result = await this.call('session.status', {}, { mutation: false, purpose: 'inspect operator session' });
    const nonce = responseNonce(result);
    if (nonce) this.intentNonce = nonce;
    return result;
  }

  async closeSession() {
    const result = await this.call('session.close', {}, { mutation: true, purpose: 'close operator session' });
    this.intentNonce = null;
    return result;
  }
}

export const GIVING_MUTATION_OPERATIONS = Object.freeze([...MUTATIONS]);
