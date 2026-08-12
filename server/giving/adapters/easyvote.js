import { normalizeEasyVoteRow } from '../normalize.js';
import { GivingError, cleanText, fetchWithBoundary } from '../util.js';
import {
  decodeContinuation,
  encodeContinuation,
  queryDigest,
  sourceReceipt
} from './shared.js';

function authenticationHeader(identity) {
  const token = identity.ZumoToken === null || identity.ZumoToken === undefined
    ? 'null'
    : String(identity.ZumoToken);
  return `UserId:${identity.UserId}|CustomerId:${identity.CustomerId}|ZumoToken:${token}`;
}

function easyVotePortalCandidates(portal) {
  const normalized = cleanText(portal, 160)?.toLowerCase() || '';
  if (!normalized) return [];
  const candidates = [normalized];
  if (!normalized.startsWith('cityof')) candidates.push(`cityof${normalized}`);
  return [...new Set(candidates)];
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

async function bootstrapIdentity(source, fetchImpl) {
  const candidates = easyVotePortalCandidates(source.portal);
  if (!candidates.length) {
    throw new GivingError('easyvote-bootstrap-drift', 'EasyVote source has no usable tenant identifier', 502);
  }

  let lastStatus = null;
  let lastDrift = null;
  for (const portal of candidates) {
    const bootstrapUrl = `https://ecf-api.easyvoteapp.com/authentication/getwebsiteuser/${encodeURIComponent(portal)}`;
    const bootstrap = await fetchWithBoundary(bootstrapUrl, {
      headers: {
        Accept: 'application/json',
        'ZUMO-API-VERSION': '2.0.0',
        'User-Agent': 'TD613-Giving/1.0 operator research'
      }
    }, { fetchImpl });
    lastStatus = bootstrap.status;
    if (!bootstrap.ok) continue;

    const rawIdentity = await bootstrap.json();
    const identity = rawIdentity?.data || rawIdentity;
    const UserId = cleanText(identity?.UserId || identity?.userId, 100);
    const CustomerId = cleanText(identity?.CustomerId || identity?.customerId, 100);
    const rawToken = identity?.ZumoToken ?? identity?.zumoToken ?? null;
    const ZumoToken = rawToken === null ? null : cleanText(rawToken, 4000);
    if (!UserId || !CustomerId || (rawToken !== null && !ZumoToken)) {
      lastDrift = {
        portal,
        has_user_id: Boolean(UserId),
        has_customer_id: Boolean(CustomerId),
        token_present: rawToken !== null
      };
      continue;
    }
    return { UserId, CustomerId, ZumoToken, portal, upstreamStatus: bootstrap.status };
  }

  if (lastDrift) {
    throw new GivingError('easyvote-bootstrap-drift', 'EasyVote anonymous bootstrap returned an unusable website identity', 502, lastDrift);
  }
  throw new GivingError('easyvote-bootstrap-error', `EasyVote bootstrap returned HTTP ${lastStatus ?? 'unknown'} for every bounded tenant candidate`, 502, {
    tenant_candidates: candidates
  });
}

export async function searchEasyVotePage({ source, query, continuation, fetchImpl }) {
  const startedAt = new Date().toISOString();
  const digest = queryDigest(source.id, query);
  const cursor = decodeContinuation(continuation, source.id);
  const page = cursor?.page || 1;
  const identity = await bootstrapIdentity(source, fetchImpl);
  const endpoint = new URL(`https://ecf-api.easyvoteapp.com/advancedsearch/contributions/${encodeURIComponent(identity.CustomerId)}`);
  endpoint.search = easyVoteQuery(query, page).toString();
  const headers = {
    Accept: 'application/json',
    'Easy-Vote-Authenticated-User': authenticationHeader(identity),
    'ZUMO-API-VERSION': '2.0.0',
    'User-Agent': 'TD613-Giving/1.0 operator research'
  };
  if (identity.ZumoToken) headers['X-ZUMO-AUTH'] = identity.ZumoToken;
  const response = await fetchWithBoundary(endpoint, { headers }, { fetchImpl });
  if (!response.ok) throw new GivingError('easyvote-upstream-error', `EasyVote returned HTTP ${response.status}`, 502, {
    resolved_portal: identity.portal,
    token_present: Boolean(identity.ZumoToken)
  });
  const body = await response.json();
  const rows = Array.isArray(body) ? body : (body?.data || body?.Results || body?.results || body?.Items || body?.items);
  if (!Array.isArray(rows)) throw new GivingError('easyvote-contract-drift', 'EasyVote contribution search response was not a JSON result collection', 502, {
    resolved_portal: identity.portal
  });
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
      assertion: 'ELECTRONIC_PORTAL_SCOPE_ONLY_MAY_NOT_INCLUDE_EVERY_FILING'
    })
  };
}

export const _easyVoteInternals = Object.freeze({
  authenticationHeader,
  easyVotePortalCandidates,
  easyVoteQuery,
  bootstrapIdentity
});
