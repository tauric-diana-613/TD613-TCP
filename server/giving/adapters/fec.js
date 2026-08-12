import { normalizeFecRow } from '../normalize.js';
import { GivingError, fetchWithBoundary } from '../util.js';
import {
  decodeContinuation,
  encodeContinuation,
  queryDigest,
  sourceReceipt
} from './shared.js';

export async function searchFecPage({ source, query, continuation, fetchImpl }) {
  const startedAt = new Date().toISOString();
  const digest = queryDigest(source.id, query);
  const cursor = decodeContinuation(continuation, source.id);
  const page = cursor?.page || 1;
  const url = new URL('https://api.open.fec.gov/v1/schedules/schedule_a/');
  url.searchParams.set('api_key', process.env.FEC_API_KEY || 'DEMO_KEY');
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

  const response = await fetchWithBoundary(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'TD613-Giving/1.0 operator research' }
  }, { fetchImpl });
  const rateLimit = {
    limit: response.headers?.get?.('x-ratelimit-limit') || null,
    remaining: response.headers?.get?.('x-ratelimit-remaining') || null,
    reset: response.headers?.get?.('x-ratelimit-reset') || null
  };
  if (response.status === 429) {
    throw new GivingError('source-rate-limited', 'OpenFEC rate limit reached; retry after the provider reset', 429, { rate_limit: rateLimit });
  }
  if (!response.ok) throw new GivingError('fec-upstream-error', `OpenFEC returned HTTP ${response.status}`, 502);
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
