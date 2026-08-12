import { normalizeEasyVoteRow } from '../normalize.js';
import { GivingError, cleanText, fetchWithBoundary } from '../util.js';
import {
  decodeContinuation,
  encodeContinuation,
  queryDigest,
  sourceReceipt
} from './shared.js';

const EASYVOTE_REQUEST_TIMEOUT_MS = 6500;

function authenticationHeader(identity) {
  const token = identity.ZumoToken === null || identity.ZumoToken === undefined
    ? 'null'
    : String(identity.ZumoToken);
  return `UserId:${identity.UserId}|CustomerId:${identity.CustomerId}|ZumoToken:${token}`;
}

function easyVotePortalCandidates(portal) {
  const normalized = cleanText(portal, 160)?.toLowerCase() || '';
  if (!normalized) return [];
  // Current Florida EasyVote public tenants commonly carry the cityof prefix.
  // Prefer the current public-host form, then retain the historical slug as a
  // bounded fallback for tenants that still use it.
  const candidates = normalized.startsWith('cityof')
    ? [normalized]
    : [`cityof${normalized}`, normalized];
  return [...new Set(candidates)];
}

function easyVoteSiteOrigin(portal) {
  return `https://${portal}.easyvotecampaignfinance.com`;
}

function easyVoteHeaders(portal, extra = {}) {
  const origin = easyVoteSiteOrigin(portal);
  return {
    Accept: 'application/json',
    Origin: origin,
    Referer: `${origin}/`,
    'ZUMO-API-VERSION': '2.0.0',
    'User-Agent': 'Mozilla/5.0 (TD613 Giving operator research)',
    ...extra
  };
}

function easyVoteQuery(query, page) {
  const params = new URLSearchParams();
  params.set('pageNumber', String(page));
  params.set('pageSize', String(query.page_size));
  params.set('contributorName', query.name || query.last_name || '');
  params.set('candidateCommitteeName', query.committee || query.candidate || '');
  params.set('startDate', query.start_date || '');
  params.set('endDate', query.end_date || '');
  params.set('minimumAmount', query.min_amount_cents === null ? '' : String(query.min_amount_cents / 100));
  params.set('maximumAmount', query.max_amount_cents === null ? '' : String(query.max_amount_cents / 100));
  params.set('city', query.city || '');
  params.set('state', query.state || '');
  params.set('zipCode', query.zip || '');
  params.set('occupation', query.occupation || '');
  params.set('sortColumn', 'ContributionDate');
  params.set('sortDirection', 'desc');
  return params;
}

async function bootstrapPortalIdentity(portal, fetchImpl) {
  const bootstrapUrl = `https://ecf-api.easyvoteapp.com/authentication/getwebsiteuser/${encodeURIComponent(portal)}`;
  const bootstrap = await fetchWithBoundary(bootstrapUrl, {
    headers: easyVoteHeaders(portal)
  }, { fetchImpl, timeoutMs: EASYVOTE_REQUEST_TIMEOUT_MS });
  if (!bootstrap.ok) {
    return { ok: false, stage: 'bootstrap', portal, status: bootstrap.status };
  }

  const rawIdentity = await bootstrap.json();
  const identity = rawIdentity?.data || rawIdentity;
  const UserId = cleanText(identity?.UserId || identity?.userId, 100);
  const CustomerId = cleanText(identity?.CustomerId || identity?.customerId, 100);
  const rawToken = identity?.ZumoToken ?? identity?.zumoToken ?? null;
  const ZumoToken = rawToken === null ? null : cleanText(rawToken, 4000);
  if (!UserId || !CustomerId || (rawToken !== null && !ZumoToken)) {
    return {
      ok: false,
      stage: 'bootstrap-contract',
      portal,
      status: bootstrap.status,
      has_user_id: Boolean(UserId),
      has_customer_id: Boolean(CustomerId),
      token_present: rawToken !== null
    };
  }

  return {
    ok: true,
    identity: { UserId, CustomerId, ZumoToken, portal, upstreamStatus: bootstrap.status }
  };
}

async function bootstrapIdentity(source, fetchImpl) {
  const candidates = easyVotePortalCandidates(source.portal);
  if (!candidates.length) {
    throw new GivingError('easyvote-bootstrap-drift', 'EasyVote source has no usable tenant identifier', 502);
  }

  let lastFailure = null;
  for (const portal of candidates) {
    try {
      const attempt = await bootstrapPortalIdentity(portal, fetchImpl);
      if (attempt.ok) return attempt.identity;
      lastFailure = attempt;
    } catch (error) {
      lastFailure = { portal, stage: 'bootstrap-fetch', code: error?.code || 'upstream-unavailable' };
    }
  }

  throw new GivingError('easyvote-bootstrap-error', 'EasyVote anonymous bootstrap failed for every bounded tenant candidate', 502, {
    tenant_candidates: candidates,
    last_failure: lastFailure
  });
}

function easyVoteRows(body) {
  if (Array.isArray(body)) return body;
  const direct = body?.data || body?.Results || body?.results || body?.Items || body?.items;
  if (Array.isArray(direct)) return direct;
  // Some EasyVote deployments wrap the collection one layer deeper.
  const nested = direct?.data || direct?.Results || direct?.results || direct?.Items || direct?.items;
  return Array.isArray(nested) ? nested : null;
}

async function searchEasyVotePortal({ portal, query, page, fetchImpl }) {
  const bootstrap = await bootstrapPortalIdentity(portal, fetchImpl);
  if (!bootstrap.ok) return bootstrap;

  const identity = bootstrap.identity;
  const endpoint = new URL(`https://ecf-api.easyvoteapp.com/advancedsearch/contributions/${encodeURIComponent(identity.CustomerId)}`);
  endpoint.search = easyVoteQuery(query, page).toString();
  const extraHeaders = {
    'Easy-Vote-Authenticated-User': authenticationHeader(identity)
  };
  if (identity.ZumoToken) extraHeaders['X-ZUMO-AUTH'] = identity.ZumoToken;

  const response = await fetchWithBoundary(endpoint, {
    headers: easyVoteHeaders(portal, extraHeaders)
  }, { fetchImpl, timeoutMs: EASYVOTE_REQUEST_TIMEOUT_MS });
  if (!response.ok) {
    return {
      ok: false,
      stage: 'contribution-search',
      portal,
      status: response.status,
      token_present: Boolean(identity.ZumoToken)
    };
  }

  const body = await response.json();
  const rows = easyVoteRows(body);
  if (!Array.isArray(rows)) {
    return {
      ok: false,
      stage: 'contribution-contract',
      portal,
      status: response.status,
      response_keys: body && typeof body === 'object' ? Object.keys(body).slice(0, 20) : []
    };
  }

  return { ok: true, portal, identity, response, body, rows };
}

export async function searchEasyVotePage({ source, query, continuation, fetchImpl }) {
  const startedAt = new Date().toISOString();
  const digest = queryDigest(source.id, query);
  const cursor = decodeContinuation(continuation, source.id);
  const page = cursor?.page || 1;
  const candidates = easyVotePortalCandidates(source.portal);
  if (!candidates.length) {
    throw new GivingError('easyvote-bootstrap-drift', 'EasyVote source has no usable tenant identifier', 502);
  }

  let result = null;
  let lastFailure = null;
  for (const portal of candidates) {
    try {
      const attempt = await searchEasyVotePortal({ portal, query, page, fetchImpl });
      if (attempt.ok) {
        result = attempt;
        break;
      }
      lastFailure = attempt;
    } catch (error) {
      lastFailure = {
        portal,
        stage: 'tenant-fetch',
        code: error?.code || 'upstream-unavailable',
        message: cleanText(error?.message, 240)
      };
    }
  }

  if (!result) {
    throw new GivingError('easyvote-upstream-error', 'EasyVote failed for every bounded tenant candidate', 502, {
      tenant_candidates: candidates,
      last_failure: lastFailure
    });
  }

  const { portal, response, body, rows } = result;
  const totalPages = Number(body?.TotalPages || body?.totalPages || body?.metadata?.totalPages || page);
  const hasMore = Boolean(body?.HasNextPage ?? body?.hasNextPage ?? (page < totalPages));
  const next = hasMore ? encodeContinuation({ source_instance_id: source.id, page: page + 1 }) : null;
  const retrievedAt = new Date().toISOString();
  const records = rows.map((row) => normalizeEasyVoteRow(row, { source, queryDigest: digest, retrievedAt }));
  return {
    records,
    continuation: next,
    source_status: 'READY',
    coverage: source.electronic_scope,
    receipt: sourceReceipt({
      source, digest, startedAt, state: 'READY', upstreamStatus: response.status, page,
      continuation: next, count: records.length, coverage: source.electronic_scope,
      assertion: 'ELECTRONIC_PORTAL_SCOPE_ONLY_MAY_NOT_INCLUDE_EVERY_FILING',
      resolved_portal: portal
    })
  };
}

export const _easyVoteInternals = Object.freeze({
  authenticationHeader,
  easyVotePortalCandidates,
  easyVoteSiteOrigin,
  easyVoteHeaders,
  easyVoteQuery,
  easyVoteRows,
  bootstrapPortalIdentity,
  bootstrapIdentity,
  searchEasyVotePortal
});
