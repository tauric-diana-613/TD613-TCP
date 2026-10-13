import { MAX_SOURCE_PAGE_SIZE } from '../constants.js';
import {
  GivingError,
  canonicalJson,
  clampInteger,
  cleanText,
  isoDate,
  sha256
} from '../util.js';

const ADMITTED_STATES = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'
]);

function normalizedStates(raw = {}) {
  const supplied = Array.isArray(raw.states) ? raw.states : raw.state ? [raw.state] : [];
  return [...new Set(supplied
    .map((value) => cleanText(value, 40)?.toUpperCase())
    .filter((value) => ADMITTED_STATES.has(value)))];
}

export function validateSearchQuery(raw = {}) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new GivingError('invalid-search-query', 'payload.query must be an object');
  }
  const states = normalizedStates(raw);
  const query = {
    name: cleanText(raw.name || raw.contributor_name, 240),
    first_name: cleanText(raw.first_name, 120),
    last_name: cleanText(raw.last_name, 160),
    city: cleanText(raw.city, 120),
    state: states.length === 1 ? states[0] : null,
    states,
    zip: cleanText(raw.zip, 20),
    employer: cleanText(raw.employer, 180),
    occupation: cleanText(raw.occupation, 180),
    committee: cleanText(raw.committee, 240),
    candidate: cleanText(raw.candidate, 240),
    start_date: isoDate(raw.start_date),
    end_date: isoDate(raw.end_date),
    election: cleanText(raw.election, 80),
    election_year: raw.election_year ? clampInteger(raw.election_year, 1990, 2100, new Date().getUTCFullYear()) : null,
    exact_match: Boolean(raw.exact_match),
    min_amount_cents: raw.min_amount_cents === null || raw.min_amount_cents === undefined ? null : clampInteger(raw.min_amount_cents, -1_000_000_000_00, 1_000_000_000_00, 0),
    max_amount_cents: raw.max_amount_cents === null || raw.max_amount_cents === undefined ? null : clampInteger(raw.max_amount_cents, -1_000_000_000_00, 1_000_000_000_00, 0),
    page_size: clampInteger(raw.page_size, 1, MAX_SOURCE_PAGE_SIZE, 100)
  };
  if (!query.name && !query.last_name && !query.first_name && !query.committee && !query.candidate) {
    throw new GivingError('search-too-broad', 'Provide a contributor, candidate, or committee term before querying a public source', 400);
  }
  if ((raw.start_date && !query.start_date) || (raw.end_date && !query.end_date)) {
    throw new GivingError('invalid-date', 'Search dates must use YYYY-MM-DD', 400);
  }
  if (query.start_date && query.end_date && query.start_date > query.end_date) {
    throw new GivingError('invalid-date-range', 'start_date must not be later than end_date', 400);
  }
  return query;
}

export function queryDigest(sourceId, query) {
  return sha256({ source_instance_id: sourceId, query });
}

export function encodeContinuation(value) {
  if (!value) return null;
  return Buffer.from(canonicalJson(value)).toString('base64url');
}

export function decodeContinuation(token, sourceId) {
  if (!token) return null;
  try {
    const parsed = JSON.parse(Buffer.from(String(token), 'base64url').toString('utf8'));
    if (parsed?.source_instance_id !== sourceId) throw new Error('source mismatch');
    return parsed;
  } catch {
    throw new GivingError('invalid-continuation', 'Continuation receipt does not belong to this source instance', 400);
  }
}

export function sourceReceipt({ source, digest, startedAt, state, upstreamStatus = null, page, continuation, count, coverage, rateLimit = null, assertion = null }) {
  return {
    schema: 'td613.giving.source-receipt/v1',
    source_instance_id: source.id,
    source_family: source.family,
    custodian: source.custodian,
    jurisdiction: source.jurisdiction,
    query_digest: digest,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    state,
    upstream_status: upstreamStatus,
    page,
    returned_record_count: count,
    continuation_available: Boolean(continuation),
    coverage,
    rate_limit: rateLimit,
    zero_claim: assertion || (state === 'READY' && count === 0
      ? 'NO_ROWS_OBSERVED_WITHIN_THIS_EXACT_QUERY_AND_PAGE'
      : state === 'READY'
        ? 'NOT_APPLICABLE_ROWS_OBSERVED'
        : 'WITHHELD_SOURCE_DID_NOT_COMPLETE')
  };
}

export function failedSourceResult(source, query, error) {
  const digest = queryDigest(source.id, query);
  return {
    records: [],
    continuation: null,
    source_status: error?.code === 'upstream-timeout' ? 'UNAVAILABLE' : 'ERROR',
    coverage: source.electronic_scope,
    receipt: sourceReceipt({
      source,
      digest,
      startedAt: new Date().toISOString(),
      state: error?.code === 'upstream-timeout' ? 'UNAVAILABLE' : 'ERROR',
      page: null,
      count: 0,
      coverage: source.electronic_scope,
      assertion: 'WITHHELD_SOURCE_FAILURE_IS_NOT_EVIDENCE_OF_ZERO_GIVING'
    }),
    error: {
      code: error?.code || 'source-error',
      message: error?.message || 'Source did not complete'
    }
  };
}

export const _sharedInternals = Object.freeze({ ADMITTED_STATES, normalizedStates });
