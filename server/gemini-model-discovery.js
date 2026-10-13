import { createHash } from 'node:crypto';

// A listing is evidence for one credential and transport, never a global catalog.
const TTL_MS = 10 * 60 * 1000;
let cache = null;
let observationRevision = 0;
const failed = (error, status = 599) => Object.freeze({
  ok: false, status, models: Object.freeze([]), cached: false,
  complete: false, observedAt: null, expiresAt: null, error
});

export async function listGeminiGenerateContentModels(apiKey, {
  force = false, fetchImpl = fetch, at = Date.now(), timeoutMs = 5000
} = {}) {
  const key = String(apiKey ?? '').trim();
  if (!key) return failed('missing-gemini-api-key', 0);
  if (!Number.isFinite(at) || !Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    return failed('invalid-model-list-observation-budget', 0);
  }
  const scope = createHash('sha256').update(key).digest('hex');
  const sameScope = cache?.scope === scope && cache?.fetchImpl === fetchImpl;
  if (!force && sameScope && cache.value.observedAt <= at && cache.value.expiresAt > at) {
    return Object.freeze({ ...cache.value, cached: true });
  }
  if (sameScope) cache = null;
  const revision = ++observationRevision;
  const controller = new AbortController();
  let timer;
  const walk = async () => {
    const models = new Set();
    const tokens = new Set();
    let token = '';
    for (let page = 0; page < 10; page++) {
      const url = new URL('https://generativelanguage.googleapis.com/v1beta/models');
      url.searchParams.set('pageSize', '1000');
      if (token) url.searchParams.set('pageToken', token);
      const response = await fetchImpl(url.href, {
        headers: { 'x-goog-api-key': key }, signal: controller.signal
      });
      if (!response.ok) return failed('model-list-http-failure', response.status);
      const payload = await response.json();
      if (!payload || typeof payload !== 'object' || Array.isArray(payload) || payload.error
        || (payload.models !== undefined && !Array.isArray(payload.models))
        || (payload.nextPageToken !== undefined && typeof payload.nextPageToken !== 'string')) {
        return failed('malformed-model-list', 502);
      }
      for (const model of payload.models || []) {
        if (!model || typeof model.name !== 'string' || !/^models\/[a-zA-Z0-9._-]+$/.test(model.name)
          || !Array.isArray(model.supportedGenerationMethods)
          || !model.supportedGenerationMethods.every(method => typeof method === 'string')) {
          return failed('malformed-model-list-entry', 502);
        }
        if (model.supportedGenerationMethods.includes('generateContent')) {
          models.add(model.name.slice('models/'.length));
        }
      }
      token = payload.nextPageToken || '';
      if (!token) return Object.freeze({
        ok: true, status: response.status, models: Object.freeze([...models]),
        cached: false, complete: true, observedAt: at, expiresAt: at + TTL_MS,
        pageCount: page + 1, error: null
      });
      if (tokens.has(token)) return failed('model-list-pagination-cycle', 502);
      tokens.add(token);
      if (controller.signal.aborted) return failed('model-list-timeout', 408);
    }
    return failed('model-list-page-limit', 502);
  };
  try {
    const timeout = new Promise(resolve => {
      timer = setTimeout(() => {
        controller.abort();
        resolve(failed('model-list-timeout', 408));
      }, Math.min(timeoutMs, 10000));
    });
    const result = await Promise.race([walk(), timeout]);
    if (result.ok && revision === observationRevision) cache = { scope, fetchImpl, value: result };
    return result;
  } catch {
    // Provider/transport errors may echo credentials; only bounded error codes leave here.
    return failed(controller.signal.aborted ? 'model-list-timeout' : 'model-list-fetch-or-json-failure');
  } finally {
    clearTimeout(timer);
  }
}
