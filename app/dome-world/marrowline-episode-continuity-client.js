export const MARROWLINE_EPISODE_RECORD_SCHEMA = 'td613.marrowline.pending-episode/v1';
export const MARROWLINE_EPISODE_CLAIM_SCHEMA = 'td613.marrowline.episode-claim/v1';
export const MARROWLINE_EPISODE_STREAM_SCHEMA = 'td613.marrowline.episode-stream/v1';
export const MARROWLINE_EPISODE_CLAIM_ENDPOINT = '/api/dome-world/khonapolit?operation=episode-claim';
export const MARROWLINE_EPISODE_CONSUME_ENDPOINT = '/api/dome-world/khonapolit?operation=episode-consume';
export const MARROWLINE_EPISODE_CANCEL_ENDPOINT = '/api/dome-world/khonapolit?operation=episode-cancel';

export const MARROWLINE_EPISODE_LEASE_MS = 240_000;
export const MARROWLINE_EPISODE_HARD_TTL_MS = 900_000;

function resolveCrypto(root = globalThis) {
  if (root?.crypto?.subtle && typeof root.crypto.getRandomValues === 'function') return root.crypto;
  if (globalThis.crypto?.subtle && typeof globalThis.crypto.getRandomValues === 'function') return globalThis.crypto;
  return null;
}

function bytesToBase64Url(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  const b64 = typeof btoa === 'function' ? btoa(binary) : Buffer.from(bytes).toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(text = '') {
  const normalized = String(text || '').replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  if (typeof atob === 'function') {
    const binary = atob(padded);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
    return out;
  }
  return new Uint8Array(Buffer.from(padded, 'base64'));
}

function base64ToBytes(text = '') {
  if (typeof atob === 'function') {
    const binary = atob(String(text || ''));
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
    return out;
  }
  return new Uint8Array(Buffer.from(String(text || ''), 'base64'));
}

function bytesToHex(bytes) {
  let out = '';
  for (let i = 0; i < bytes.length; i += 1) out += bytes[i].toString(16).padStart(2, '0');
  return out;
}

async function sha256Bytes(cryptoApi, utf8String) {
  const encoded = new TextEncoder().encode(utf8String);
  const digest = await cryptoApi.subtle.digest('SHA-256', encoded);
  return new Uint8Array(digest);
}

function generateEpisodeId(cryptoApi) {
  if (typeof cryptoApi?.randomUUID === 'function') {
    return `ep_${cryptoApi.randomUUID().replace(/-/g, '')}`;
  }
  const bytes = new Uint8Array(16);
  cryptoApi.getRandomValues(bytes);
  return `ep_${bytesToHex(bytes)}`;
}

export function buildMarrowlineEpisodeAad(episodeId = '', requestBodySha256 = '', hardExpiresAt = 0) {
  return `td613.marrowline.episode/v1:${episodeId}:${String(requestBodySha256).toLowerCase()}:${Number(hardExpiresAt)}`;
}

export async function deriveMarrowlineEpisodeCapability(root, { episodeId, rootSecretB64 } = {}) {
  const cryptoApi = resolveCrypto(root);
  if (!cryptoApi || !episodeId || !rootSecretB64) return null;
  const authBytes = await sha256Bytes(cryptoApi, `td613.marrowline.episode-auth/v1:${rootSecretB64}:${episodeId}`);
  const keyBytes = await sha256Bytes(cryptoApi, `td613.marrowline.episode-aes256gcm/v1:${rootSecretB64}:${episodeId}`);
  return Object.freeze({
    episodeId,
    claimAuthToken: bytesToBase64Url(authBytes),
    envelopeKey: bytesToBase64Url(keyBytes)
  });
}

export async function createMarrowlineEpisode(root, serializedRequestBody = '', { now = Date.now(), hasAttachments = false } = {}) {
  const cryptoApi = resolveCrypto(root);
  if (!cryptoApi) return null;
  const episodeId = generateEpisodeId(cryptoApi);
  const secretBytes = new Uint8Array(32);
  cryptoApi.getRandomValues(secretBytes);
  const rootSecretB64 = bytesToBase64Url(secretBytes);
  secretBytes.fill(0);

  const bodyHashBytes = await sha256Bytes(cryptoApi, String(serializedRequestBody || ''));
  const requestBodySha256 = bytesToHex(bodyHashBytes);
  const capability = await deriveMarrowlineEpisodeCapability(root, { episodeId, rootSecretB64 });
  const leaseExpiresAt = now + MARROWLINE_EPISODE_LEASE_MS;
  const hardExpiresAt = now + MARROWLINE_EPISODE_HARD_TTL_MS;

  // Store only capability metadata locally; raw attachment bytes are never stored here.
  const episodeRecord = Object.freeze({
    schema: MARROWLINE_EPISODE_RECORD_SCHEMA,
    episodeId,
    rootSecretB64,
    requestBodySha256,
    startedAt: now,
    leaseExpiresAt,
    hardExpiresAt,
    hasAttachments: Boolean(hasAttachments)
  });

  const requestHeaders = Object.freeze({
    'X-TD613-Episode-Id': episodeId,
    'X-TD613-Episode-Auth': capability.claimAuthToken,
    'X-TD613-Episode-Key': capability.envelopeKey,
    'X-TD613-Transport-Stream': 'heartbeat-v1'
  });

  return Object.freeze({
    episodeRecord,
    requestHeaders,
    claimAuthToken: capability.claimAuthToken,
    envelopeKey: capability.envelopeKey
  });
}

export async function decryptMarrowlineEpisodeEnvelope(root, {
  envelope,
  envelopeKey,
  episodeId,
  requestBodySha256
} = {}) {
  const cryptoApi = resolveCrypto(root);
  if (!cryptoApi) throw new Error('webcrypto-unavailable');
  const rawKey = base64UrlToBytes(envelopeKey);
  try {
    const cryptoKey = await cryptoApi.subtle.importKey(
      'raw',
      rawKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    const iv = base64ToBytes(envelope?.iv_b64);
    const ciphertext = base64ToBytes(envelope?.ciphertext_b64);
    const tag = base64ToBytes(envelope?.tag_b64);
    const combined = new Uint8Array(ciphertext.length + tag.length);
    combined.set(ciphertext, 0);
    combined.set(tag, ciphertext.length);
    const aad = new TextEncoder().encode(
      buildMarrowlineEpisodeAad(episodeId, requestBodySha256, envelope?.hard_expires_at)
    );
    const decryptedBuffer = await cryptoApi.subtle.decrypt(
      { name: 'AES-GCM', iv, additionalData: aad, tagLength: 128 },
      cryptoKey,
      combined
    );
    return JSON.parse(new TextDecoder().decode(decryptedBuffer));
  } finally {
    rawKey.fill(0);
  }
}

function abortableRace(promise, signal) {
  const makeAbort = () => Object.assign(new Error('Transmission stopped'), { name: 'AbortError' });
  if (signal?.aborted) return Promise.reject(makeAbort());
  return new Promise((resolve, reject) => {
    const onAbort = () => reject(makeAbort());
    signal?.addEventListener?.('abort', onAbort, { once: true });
    Promise.resolve(promise).then(resolve, reject).finally(() => {
      signal?.removeEventListener?.('abort', onAbort);
    });
  });
}

export class MarrowlineStreamInterruptedError extends Error {
  constructor(message = 'Episode heartbeat stream closed before terminal result frame', meta = {}) {
    super(message);
    this.name = 'MarrowlineStreamInterruptedError';
    this.acceptedFrame = meta.acceptedFrame || null;
    this.heartbeatCount = meta.heartbeatCount || 0;
  }
}

export async function readMarrowlineTransportResponse(
  response,
  signal,
  { onAccepted = null, onHeartbeat = null } = {}
) {
  const contentType = String(response?.headers?.get?.('content-type') || '').toLowerCase();
  const isNdjsonStream = contentType.includes('application/x-ndjson')
    && typeof response?.body?.getReader === 'function';

  if (!isNdjsonStream) {
    const payload = await abortableRace(response.json(), signal);
    return {
      streamed: false,
      acceptedFrame: null,
      heartbeatCount: 0,
      httpStatus: Number(response?.status || 200),
      headers: {
        get: (name) => response?.headers?.get?.(name) ?? null
      },
      payload
    };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let acceptedFrame = null;
  let resultFrame = null;
  let heartbeatCount = 0;

  const processLine = (line) => {
    const trimmed = String(line || '').trim();
    if (!trimmed) return;
    const frame = JSON.parse(trimmed);
    if (frame?.type === 'accepted') {
      acceptedFrame = frame;
      onAccepted?.(frame);
    } else if (frame?.type === 'heartbeat') {
      heartbeatCount += 1;
      onHeartbeat?.(frame);
    } else if (frame?.type === 'result') {
      resultFrame = frame;
    }
  };

  try {
    while (true) {
      const { value, done } = await abortableRace(reader.read(), signal);
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || '';
      for (const line of lines) processLine(line);
      if (resultFrame) break;
    }
    buffer += decoder.decode();
    if (!resultFrame && buffer.trim()) {
      for (const line of buffer.split(/\r?\n/)) processLine(line);
    }
  } finally {
    try { reader.releaseLock?.(); } catch {}
  }

  if (!resultFrame) {
    throw new MarrowlineStreamInterruptedError(
      'Episode heartbeat stream ended before terminal result frame',
      { acceptedFrame, heartbeatCount }
    );
  }

  const headerMap = resultFrame.headers && typeof resultFrame.headers === 'object'
    ? resultFrame.headers
    : {};
  return {
    streamed: true,
    acceptedFrame,
    heartbeatCount,
    httpStatus: Number(resultFrame.http_status || 200),
    headers: {
      get: (name) => {
        const target = String(name || '').toLowerCase();
        const pair = Object.entries(headerMap).find(([k]) => k.toLowerCase() === target);
        return pair ? String(pair[1]) : (response?.headers?.get?.(name) ?? null);
      }
    },
    payload: resultFrame.body
  };
}

function waitForWakeOrDelay(root, doc, delayMs, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(Object.assign(new Error('Transmission stopped'), { name: 'AbortError' }));
      return;
    }
    let settled = false;
    let timer = null;
    const finish = (err = null) => {
      if (settled) return;
      settled = true;
      if (timer !== null) (root?.clearTimeout || clearTimeout)(timer);
      doc?.removeEventListener?.('visibilitychange', wake);
      root?.removeEventListener?.('pageshow', wake);
      root?.removeEventListener?.('focus', wake);
      root?.removeEventListener?.('online', wake);
      doc?.removeEventListener?.('resume', wake);
      signal?.removeEventListener?.('abort', onAbort);
      if (err) reject(err);
      else resolve();
    };
    const wake = () => {
      if (doc?.visibilityState === 'hidden') return;
      finish();
    };
    const onAbort = () => finish(Object.assign(new Error('Transmission stopped'), { name: 'AbortError' }));

    doc?.addEventListener?.('visibilitychange', wake);
    root?.addEventListener?.('pageshow', wake);
    root?.addEventListener?.('focus', wake);
    root?.addEventListener?.('online', wake);
    doc?.addEventListener?.('resume', wake);
    signal?.addEventListener?.('abort', onAbort, { once: true });

    if (Number.isFinite(delayMs) && delayMs >= 0) {
      timer = (root?.setTimeout || setTimeout)(() => finish(), delayMs);
    }
  });
}

export async function pollMarrowlineEpisodeClaim({
  root = globalThis,
  doc = root?.document,
  fetchImpl = root?.fetch || fetch,
  episodeRecord,
  signal,
  pollIntervalsMs = [120, 800, 1800, 3000],
  onRunning = null,
  now = () => Date.now()
} = {}) {
  if (!episodeRecord?.episodeId || !episodeRecord?.rootSecretB64) {
    return { outcome: 'UNSUPPORTED_TRANSPORT', reason: 'missing-episode-record' };
  }
  if (now() >= Number(episodeRecord.hardExpiresAt || 0)) {
    return { outcome: 'OUTCOME_UNKNOWN', reason: 'episode-expired' };
  }
  const capability = await deriveMarrowlineEpisodeCapability(root, episodeRecord);
  if (!capability) {
    return { outcome: 'UNSUPPORTED_TRANSPORT', reason: 'webcrypto-unavailable' };
  }

  const claimUrl = `${MARROWLINE_EPISODE_CLAIM_ENDPOINT}&request_id=${encodeURIComponent(episodeRecord.episodeId)}`;
  let attempt = 0;
  let transientNetworkErrors = 0;

  while (true) {
    if (signal?.aborted) {
      throw Object.assign(new Error('Transmission stopped'), { name: 'AbortError' });
    }
    if (now() >= Number(episodeRecord.hardExpiresAt || 0)) {
      return { outcome: 'OUTCOME_UNKNOWN', reason: 'episode-expired' };
    }

    // Pause active polling while page is hidden to preserve mobile battery and avoid suspended-socket churn;
    // wake immediately when visibilitychange/pageshow/focus/resume/online fires.
    if (doc?.visibilityState === 'hidden' && attempt > 0) {
      await waitForWakeOrDelay(root, doc, null, signal);
      if (signal?.aborted) throw Object.assign(new Error('Transmission stopped'), { name: 'AbortError' });
    }

    let response;
    let body;
    try {
      // Omit options.method so default HTTP GET is used (preserving compatibility with legacy !options.method test mocks).
      response = await abortableRace(fetchImpl(claimUrl, {
        headers: {
          Accept: 'application/json',
          'X-TD613-Episode-Auth': capability.claimAuthToken
        },
        cache: 'no-store',
        signal
      }), signal);
      body = await abortableRace(response.json(), signal);
      transientNetworkErrors = 0;
    } catch (error) {
      if (signal?.aborted || error?.name === 'AbortError') throw error;
      transientNetworkErrors += 1;
      // Allow brief Wi-Fi <-> cellular handoff recovery while remaining bounded inside lease
      if (transientNetworkErrors > 4 || now() >= Number(episodeRecord.leaseExpiresAt || 0)) {
        return { outcome: 'OUTCOME_UNKNOWN', reason: 'claim-network-unreachable' };
      }
      const retryDelay = pollIntervalsMs[Math.min(attempt, pollIntervalsMs.length - 1)] || 1500;
      attempt += 1;
      await waitForWakeOrDelay(root, doc, retryDelay, signal);
      continue;
    }

    // Legacy mock transports that do not implement episode-claim return readiness payloads without the claim schema.
    if (!body || body.schema !== MARROWLINE_EPISODE_CLAIM_SCHEMA) {
      return { outcome: 'UNSUPPORTED_TRANSPORT', reason: 'claim-schema-absent' };
    }

    if (response.status === 410 || body.state === 'EXPIRED') {
      return { outcome: 'OUTCOME_UNKNOWN', reason: 'episode-expired', continuity: body.continuity || null };
    }
    if (response.status === 404 || body.state === 'UNOBSERVED') {
      return { outcome: 'OUTCOME_UNKNOWN', reason: 'episode-unobserved-on-instance', continuity: body.continuity || null };
    }
    if (response.status === 403) {
      return { outcome: 'OUTCOME_UNKNOWN', reason: 'episode-auth-rejected', continuity: body.continuity || null };
    }
    if (body.state === 'CANCELLED') {
      return { outcome: 'CANCELLED', continuity: body.continuity || null };
    }
    if (body.state === 'OUTCOME_UNKNOWN') {
      return { outcome: 'OUTCOME_UNKNOWN', reason: body.reason || 'episode-lease-expired', continuity: body.continuity || null };
    }

    if ((body.state === 'COMPLETED' || body.state === 'FAILED') && body.envelope) {
      const decrypted = await decryptMarrowlineEpisodeEnvelope(root, {
        envelope: body.envelope,
        envelopeKey: capability.envelopeKey,
        episodeId: episodeRecord.episodeId,
        requestBodySha256: episodeRecord.requestBodySha256
      });
      return {
        outcome: 'RECOVERED',
        episodeState: body.state,
        httpStatus: Number(decrypted?.httpStatus || 200),
        headers: {
          get: (name) => {
            const target = String(name || '').toLowerCase();
            const pair = Object.entries(decrypted?.headers || {}).find(([k]) => k.toLowerCase() === target);
            return pair ? String(pair[1]) : null;
          }
        },
        payload: decrypted?.body || null,
        continuity: body.continuity || null,
        claimAuthToken: capability.claimAuthToken
      };
    }

    if (body.state === 'RUNNING') {
      onRunning?.(body);
      const effectiveLease = Number(body.lease_expires_at || episodeRecord.leaseExpiresAt || 0);
      if (now() >= effectiveLease && attempt >= 1) {
        return { outcome: 'OUTCOME_UNKNOWN', reason: 'episode-lease-expired', continuity: body.continuity || null };
      }
      const delay = pollIntervalsMs[Math.min(attempt, pollIntervalsMs.length - 1)] || 2000;
      attempt += 1;
      await waitForWakeOrDelay(root, doc, delay, signal);
      continue;
    }

    return { outcome: 'OUTCOME_UNKNOWN', reason: 'unrecognized-episode-state', continuity: body.continuity || null };
  }
}

export async function consumeMarrowlineEpisode({
  fetchImpl = fetch,
  episodeId,
  claimAuthToken
} = {}) {
  if (!episodeId || !claimAuthToken) return false;
  try {
    const response = await fetchImpl(MARROWLINE_EPISODE_CONSUME_ENDPOINT, {
      method: 'POST',
      keepalive: true,
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-TD613-Episode-Id': episodeId,
        'X-TD613-Episode-Auth': claimAuthToken
      },
      body: JSON.stringify({ request_id: episodeId })
    });
    return Boolean(response?.ok);
  } catch {
    return false;
  }
}

export async function cancelMarrowlineEpisode({
  root = globalThis,
  fetchImpl = root?.fetch || fetch,
  episodeRecord
} = {}) {
  if (!episodeRecord?.episodeId || !episodeRecord?.rootSecretB64) return false;
  try {
    const capability = await deriveMarrowlineEpisodeCapability(root, episodeRecord);
    if (!capability) return false;
    const response = await fetchImpl(MARROWLINE_EPISODE_CANCEL_ENDPOINT, {
      method: 'POST',
      keepalive: true,
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-TD613-Episode-Id': episodeRecord.episodeId,
        'X-TD613-Episode-Auth': capability.claimAuthToken
      },
      body: JSON.stringify({ request_id: episodeRecord.episodeId })
    });
    return Boolean(response?.ok);
  } catch {
    return false;
  }
}
