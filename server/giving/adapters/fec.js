import { normalizeFecRow } from '../normalize.js';
import { GivingError, fetchWithBoundary } from '../util.js';
import {
  decodeContinuation,
  encodeContinuation,
  queryDigest,
  sourceReceipt
} from './shared.js';

const RETRYABLE_FEC_STATUSES = new Set([429, 502, 503, 504]);
const MAX_FEC_ATTEMPTS = 2;
const MAX_RETRY_DELAY_MS = 1200;

function boundedRetryDelay(response) {
  const retryAfter = response.headers?.get?.('retry-after');
  if (retryAfter !== null && retryAfter !== undefined) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds)) return Math.max(0, Math.min(MAX_RETRY_DELAY_MS, seconds * 1000));
    const date = Date.parse(retryAfter);
    if (Number.isFinite(date)) return Math.max(0, Math.min(MAX_RETRY_DELAY_MS, date - Date.now()));
  }
  const reset = Number(response.headers?.get?.('x-ratelimit-reset'));
  if (Number.isFinite(reset) && reset > 0) {
    const milliseconds = reset > 10_000_000_000 ? reset - Date.now() : (reset * 1000) - Date.now();
    return Math.max(0, Math.min(MAX_RETRY_DELAY_MS, milliseconds));
  }
  return 300;
}

async function fetchFecWithRetry(url, fetchImpl) {
  let response = null;
  let attempts = 0;
  for (attempts = 1; attempts <= MAX_FEC_ATTEMPTS; attempts += 1) {
    response = await fetchWithBoundary(url, {
      headers: { Accept: 'application/json', 'User-Agent': 'TD613-Giving/1.0 operator research' }
    }, { fetchImpl });
    if (!RETRYABLE_FEC_STATUSES.has(response.status) || attempts === MAX_FEC_ATTEMPTS) break;
    const delay = boundedRetryDelay(response);
    if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
  }
  return { response, attempts };
}

export async function searchFecPage({ source, query, continuation, fetchImpl }) {
  const startedAt = new Date().toISOString();
  const digest = queryDigest(source.id, query);
  const cursor = decodeContinuation(continuation, source.id);
  const page = cursor?.page || 1;
  const configuredKey = String(process.env.FEC_API_KEY || '').trim();
  const apiKey = configuredKey || 'DEMO_KEY';
  const keyMode = configuredKey ? 'configured' : 'demo';
  const url = new URL('https://api.open.fec.gov/v1/schedules/schedule_a/');
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('page', String(page));
  url.searchParams.set('per_page', String(Math.min(query.page_size, 100)));
  url.searchParams.set('sort', '-contribution_receipt_date');
  if (query.name || query.last_name) url.searchParams.set('contributor_name', query.name || query.last_name);
  if (query.city) url.searchParams.set('contributor_city', query.city);
  if (query.state) url.searchParams.set('contributor_state', query.state);
  if (query.zip) url.searchParams.set('contributor_zip', query.zip);
  if (query.employer) url.searchParams.set('contributor_employer', query.employer);
  if (query.occupation) url.searchParams.set('contributor_occupation', query.occupation);
  if (query.committee) url.searchParams.set('committee_id', query.committee);
  if (query.start_date) url.searchParams.set('min_date', query.start_date);
  if (query.end_date) url.searchParams.set('max_date', query.end_date);
  if (query.min_amount_cents !== null) url.searchParams.set('min_amount', String(query.min_amount_cents / 100));
  if (query.max_amount_cents !== null) url.searchParams.set('max_amount', String(query.max_amount_cents / 100));

  const { response, attempts } = await fetchFecWithRetry(url, fetchImpl);
  const rateLimit = {
    limit: response.headers?.get?.('x-ratelimit-limit') || null,
    remaining: response.headers?.get?.('x-ratelimit-remaining') || null,
    reset: response.headers?.get?.('x-ratelimit-reset') || null
  };
  if (response.status === 429) {
    const message = keyMode === 'demo'
      ? 'OpenFEC rate limit reached while using the DEMO_KEY fallback; configure FEC_API_KEY in the production environment or retry after the provider reset'
      : 'OpenFEC rate limit reached; retry after the provider reset';
    throw new GivingError('source-rate-limited', message, 429, {
      rate_limit: rateLimit,
      api_key_mode: keyMode,
      attempts
    });
  }
  if (response.status === 403) {
    const message = keyMode === 'demo'
      ? 'OpenFEC refused the DEMO_KEY fallback; configure FEC_API_KEY in the production environment'
      : 'OpenFEC rejected the configured API key; verify FEC_API_KEY in the production environment';
    throw new GivingError('fec-api-key-refused', message, 503, { api_key_mode: keyMode, attempts });
  }
  if (!response.ok) throw new GivingError('fec-upstream-error', `OpenFEC returned HTTP ${response.status} after ${attempts} attempt${attempts === 1 ? '' : 's'}`, 502, {
    upstream_status: response.status,
    attempts,
    api_key_mode: keyMode
  });
  const body = await response.json();
  if (!Array.isArray(body?.results) || !body?.pagination) {
    throw new GivingError('fec-contract-drift', 'OpenFEC response did not match the Schedule A contract', 502);
  }
  const retrievedAt = new Date().toISOString();
  const records = body.results.map((row) => normalizeFecRow(row, { source, queryDigest: digest, retrievedAt }));
  const pages = Number(body.pagination.pages || page);
  const next = page < pages ? encodeContinuation({ source_instance_id: source.id, page: page + 1 }) : null;
  return {
    records,
    continuation: next,
    source_status: 'READY',
    coverage: source.electronic_scope,
    receipt: sourceReceipt({
      source, digest, startedAt, state: 'READY', upstreamStatus: response.status, page,
      continuation: next, count: records.length, coverage: source.electronic_scope, rateLimit
    })
  };
}
