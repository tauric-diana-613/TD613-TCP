import { REQUEST_SCHEMA } from './giving-model.js';
import { currentGivingApertureContext } from './giving-aperture-context.js';

const MUTATIONS = new Set([
  'session.close',
  'vault.write',
  'vault.resolve-conflict',
  'campaign-deputy.link-existing',
  'campaign-deputy.create-confirmed',
  'campaign-deputy.ensure-committee',
  'campaign-deputy.withhold'
]);

const PRACTICE_FIXTURE_ID = 'giving.bikini-bottom-practice/v0.1';
const PRACTICE_LOCAL_VAULT_MUTATIONS = new Set(['vault.write', 'vault.resolve-conflict']);

// Practice Vault is a browser-only synthetic shelf installed by the practice runtime
// before this client is constructed. It may cross the client-side nonce precheck only
// while the explicit practice marker is active, and the returned body must prove that
// it stayed manifestly fictional with zero external mutation. If the practice fetch
// wrapper is absent, the nonce-less request still reaches the server without authority
// and is refused there; a noncanonical success response is rejected below as well.
function localPracticeVaultMutation(operation) {
  return PRACTICE_LOCAL_VAULT_MUTATIONS.has(operation) &&
    globalThis.document?.documentElement?.dataset?.givingPractice === 'true';
}

function canonicalPracticeVaultReceipt(body) {
  const receipt = body?.receipt;
  return receipt?.practice_fixture_id === PRACTICE_FIXTURE_ID &&
    receipt?.manifestly_fictional === true &&
    receipt?.external_mutation === false &&
    receipt?.event === 'PRACTICE_VAULT_WRITE';
}

// Giving's Node function is explicitly admitted for 60 seconds. Keep the browser
// alive through the upstream window while leaving two seconds for serialization.
export const GIVING_SEARCH_MIN_TIMEOUT_MS = 58_000;

// Retrieval and rendering have separate budgets. The prior 50-row hotfix treated
// source evidence volume as a UI-performance control and still allowed the page to
// freeze. Restore the ordinary 200-row source request used by Giving; FEC retains
// its independent 100-row provider-boundary ceiling, while Contributions rendering
// is backpressured and paged separately in the browser.
export const GIVING_SEARCH_PAGE_SIZE = 200;

function boundedPayload(operation, payload) {
  if (operation !== 'search.page' || !payload?.query || typeof payload.query !== 'object') return payload;
  const requested = Number(payload.query.page_size);
  if (!Number.isFinite(requested) || requested <= 0) return payload;
  return {
    ...payload,
    query: {
      ...payload.query,
      page_size: Math.min(GIVING_SEARCH_PAGE_SIZE, Math.max(1, Math.floor(requested)))
    }
  };
}

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
  return body?.data?.intent_nonce || body?.data?.session?.intent_nonce || body?.session?.intent_nonce || body?.intent_nonce || null;
}

export class GivingApiClient {
  constructor({
    endpoint = '/api/td613-ledger',
    fetchImpl = globalThis.fetch,
    timeoutMs = 18000,
    apertureContextProvider = currentGivingApertureContext
  } = {}) {
    if (typeof fetchImpl !== 'function') throw new TypeError('A fetch implementation is required.');
    if (typeof apertureContextProvider !== 'function') throw new TypeError('Aperture context provider must be a function.');
    this.endpoint = endpoint;
    this.fetchImpl = fetchImpl.bind(globalThis);
    this.timeoutMs = timeoutMs;
    this.intentNonce = null;
    this.apertureContextProvider = apertureContextProvider;
  }

  async call(operation, payload = {}, options = {}) {
    const mutation = options.mutation ?? MUTATIONS.has(operation);
    const practiceLocalVaultMutation = mutation && localPracticeVaultMutation(operation);
    if (mutation && !practiceLocalVaultMutation && !this.intentNonce) {
      throw new GivingApiError('Refresh the signed operator session before this mutation.', { code: 'INTENT_NONCE_REQUIRED' });
    }
    const controller = new AbortController();
    const requestedTimeout = options.timeoutMs || this.timeoutMs;
    const timeoutMs = operation === 'search.page'
      ? Math.max(requestedTimeout, GIVING_SEARCH_MIN_TIMEOUT_MS)
      : requestedTimeout;
    const timer = setTimeout(() => controller.abort(new DOMException('Request timed out.', 'TimeoutError')), timeoutMs);
    const relayAbort = () => controller.abort(options.signal?.reason || new DOMException('Request cancelled.', 'AbortError'));
    options.signal?.addEventListener('abort', relayAbort, { once: true });
    const apertureContext = options.apertureContext === undefined
      ? this.apertureContextProvider(globalThis)
      : options.apertureContext;
    const envelope = {
      schema: REQUEST_SCHEMA,
      request_id: requestId(),
      operation,
      intent: {
        purpose: options.purpose || operation,
        nonce: mutation && !practiceLocalVaultMutation ? this.intentNonce : null,
        ...(apertureContext ? { aperture_context: apertureContext } : {})
      },
      payload: boundedPayload(operation, payload)
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
      if (practiceLocalVaultMutation && response.ok && body?.ok !== false && !canonicalPracticeVaultReceipt(body)) {
        throw new GivingApiError('Practice Vault response did not prove fictional local-only custody.', {
          code: 'PRACTICE_LOCAL_TRANSPORT_REQUIRED',
          status: response.status,
          receipt: body?.receipt || null,
          retryable: false
        });
      }
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