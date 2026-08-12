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
const FEC_UPSTREAM_TIMEOUT_MS = 24_000;

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

function transactionPeriodForYear(year) {
  return year % 2 === 0 ? year : year + 1;
}

function transactionPeriods(startDate, endDate) {
  const startYear = Number(String(startDate || '').slice(0, 4));
  const endYear = Number(String(endDate || '').slice(0, 4));
  if (!Number.isInteger(startYear) || !Number.isInteger(endYear) || startYear < 1975 || endYear < startYear) return [];
  const first = Math.max(1976, transactionPeriodForYear(startYear));
  const last = transactionPeriodForYear(endYear);
  const periods = [];
  for (let year = first; year <= last; year += 2) periods.push(year);
  return periods;
}

function appendSeekCursor(url, cursor) {
  const lastIndexes = cursor?.last_indexes;
  if (!lastIndexes || typeof lastIndexes !== 'object') return;
  if (lastIndexes.last_index !== null && lastIndexes.last_index !== undefined) {
    url.searchParams.set('last_index', String(lastIndexes.last_index));
  }
  if (lastIndexes.last_contribution_receipt_date) {
    url.searchParams.set('last_contribution_receipt_date', String(lastIndexes.last_contribution_receipt_date));
  }
  if (lastIndexes.last_contribution_receipt_amount !== null && lastIndexes.last_contribution_receipt_amount !== undefined) {
    url.searchParams.set('last_contribution_receipt_amount', String(lastIndexes.last_contribution_receipt_amount));
  }
}

async function fetchFecWithRetry(url, fetchImpl, keyMode) {
  let response = null;
  let attempts = 0;
  for (attempts = 1; attempts <= MAX_FEC_ATTEMPTS; attempts += 1) {
    response = await fetchWithBoundary(url, {
      headers: { Accept: 'application/json', 'User-Agent': 'TD613-Giving/1.0 operator research' }
    }, { fetchImpl, timeoutMs: FEC_UPSTREAM_TIMEOUT_MS });
    const demoRateLimited = response.status === 429 && keyMode === 'demo';
    if (!RETRYABLE_FEC_STATUSES.has(response.status) || attempts === MAX_FEC_ATTEMPTS || demoRateLimited) break;
    const delay = boundedRetryDelay(response);
    if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));
  }
  return { response, attempts };
}

async function upstreamFailureDetail(response) {
  try {
    const text = await response.text();
    if (!text) return null;
    try {
      const parsed = JSON.parse(text);
      const detail = parsed?.message || parsed?.error?.message || parsed?.error || parsed?.detail;
      return detail ? String(detail).slice(0, 500) : text.slice(0, 500);
    } catch {
      return text.slice(0, 500);
    }
  } catch {
    return null;
  }
}

export async function searchFecPage({ source, query, continuation, fetchImpl }) {
  const startedAt = new Date().toISOString();
  const digest = queryDigest(source.id, query);
  const cursor = decodeContinuation(continuation, source.id);
  const sequence = Number.isInteger(cursor?.sequence) && cursor.sequence > 0 ? cursor.sequence : 1;
  const configuredKey = String(process.env.FEC_API_KEY || '').trim();
  const apiKey = configuredKey || 'DEMO_KEY';
  const keyMode = configuredKey ? 'configured' : 'demo';
  const perPage = Math.min(query.page_size, 100);
  const url = new URL('https://api.open.fec.gov/v1/schedules/schedule_a/');
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('per_page', String(perPage));
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
  if (query.start_date || query.end_date) url.searchParams.set('sort_hide_null', 'true');
  if (query.min_amount_cents !== null) url.searchParams.set('min_amount', String(query.min_amount_cents / 100));
  if (query.max_amount_cents !== null) url.searchParams.set('max_amount', String(query.max_amount_cents / 100));

  // Current OpenFEC Schedule A accepts multiple two-year transaction periods.
  // Supplying the periods implied by the operator's date window preserves the
  // requested coverage while giving the upstream database explicit partitions.
  for (const period of transactionPeriods(query.start_date, query.end_date)) {
    url.searchParams.append('two_year_transaction_period', String(period));
  }
  appendSeekCursor(url, cursor);

  let response;
  let attempts;
  try {
    ({ response, attempts } = await fetchFecWithRetry(url, fetchImpl, keyMode));
  } catch (error) {
    if (error?.code === 'upstream-timeout') {
      throw new GivingError(
        'upstream-timeout',
        `OpenFEC Schedule A did not complete within ${Math.round(FEC_UPSTREAM_TIMEOUT_MS / 1000)} seconds; this source can be slow for broad contributor/date searches`,
        504,
        { api_key_mode: keyMode, timeout_ms: FEC_UPSTREAM_TIMEOUT_MS }
      );
    }
    throw error;
  }

  const rateLimit = {
    limit: response.headers?.get?.('x-ratelimit-limit') || null,
    remaining: response.headers?.get?.('x-ratelimit-remaining') || null,
    reset: response.headers?.get?.('x-ratelimit-reset') || null
  };
  if (response.status === 429) {
    const message = keyMode === 'demo'
      ? 'OpenFEC rate limit reached while using the shared DEMO_KEY fallback; configure FEC_API_KEY in the production environment for reliable programmatic retrieval'
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
  if (!response.ok) {
    const detail = await upstreamFailureDetail(response);
    throw new GivingError(
      'fec-upstream-error',
      `OpenFEC returned HTTP ${response.status} after ${attempts} attempt${attempts === 1 ? '' : 's'}${detail ? `: ${detail}` : ''}`,
      502,
      { upstream_status: response.status, attempts, api_key_mode: keyMode }
    );
  }

  const body = await response.json();
  if (!Array.isArray(body?.results) || !body?.pagination) {
    throw new GivingError('fec-contract-drift', 'OpenFEC response did not match the Schedule A contract', 502);
  }
  const retrievedAt = new Date().toISOString();
  const records = body.results.map((row) => normalizeFecRow(row, { source, queryDigest: digest, retrievedAt }));
  const lastIndexes = body.pagination.last_indexes && typeof body.pagination.last_indexes === 'object'
    ? body.pagination.last_indexes
    : null;
  const next = records.length >= perPage && lastIndexes?.last_index
    ? encodeContinuation({ source_instance_id: source.id, sequence: sequence + 1, last_indexes: lastIndexes })
    : null;
  return {
    records,
    continuation: next,
    source_status: 'READY',
    coverage: source.electronic_scope,
    receipt: sourceReceipt({
      source, digest, startedAt, state: 'READY', upstreamStatus: response.status, page: sequence,
      continuation: next, count: records.length, coverage: source.electronic_scope, rateLimit
    })
  };
}
