import { GivingError, cleanText, fetchWithBoundary, sha256 } from './util.js';

const OPENFEC_BASE = 'https://api.open.fec.gov/v1';
const OPENSECRETS_BASE = 'https://www.opensecrets.org/api/';
const CAMPAIGN_DEPUTY_BASE = 'https://us.api.campaigndeputy.app/v1';
const DIRECTORY_TIMEOUT_MS = 15_000;
const MAX_LIST_PAGES = 40;

function phrase(value) {
  const text = cleanText(value, 120);
  if (!text || text.length < 2) throw new GivingError('campaign-directory-query-required', 'Campaign / PC lookup requires at least two characters', 400);
  return text;
}

function fecKey() {
  return String(process.env.FEC_API_KEY || '').trim() || 'DEMO_KEY';
}

function campaignDeputyKey() {
  const key = String(process.env.CAMPAIGN_DEPUTY_API_KEY || '').trim();
  if (!key) throw new GivingError('campaign-deputy-unavailable', 'Campaign Deputy integration is not configured', 503);
  return key;
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return [value];
  return [];
}

async function jsonFetch(url, options = {}, context = {}) {
  const response = await fetchWithBoundary(url, options, { fetchImpl: context.fetchImpl, timeoutMs: DIRECTORY_TIMEOUT_MS });
  if (!response.ok) {
    throw new GivingError('campaign-directory-upstream-error', `Campaign directory upstream returned HTTP ${response.status}`, 502, {
      upstream_status: response.status,
      upstream_host: new URL(String(url)).hostname
    });
  }
  try {
    return await response.json();
  } catch {
    throw new GivingError('campaign-directory-contract-drift', 'Campaign directory upstream returned a non-JSON response', 502);
  }
}

function normalizePrincipalCommittee(value) {
  return {
    committee_id: cleanText(value?.committee_id, 20),
    name: cleanText(value?.name, 300),
    designation: cleanText(value?.designation, 80),
    designation_full: cleanText(value?.designation_full, 180),
    committee_type: cleanText(value?.committee_type, 80),
    committee_type_full: cleanText(value?.committee_type_full, 180),
    organization_type: cleanText(value?.organization_type, 80),
    organization_type_full: cleanText(value?.organization_type_full, 180),
    party: cleanText(value?.party, 80),
    state: cleanText(value?.state, 80)
  };
}

function normalizeCandidate(value) {
  return {
    candidate_id: cleanText(value?.candidate_id, 20),
    name: cleanText(value?.name, 300),
    office: cleanText(value?.office_full || value?.office || value?.office_sought, 180),
    state: cleanText(value?.state, 80),
    district: cleanText(value?.district, 40),
    party: cleanText(value?.party_full || value?.party, 120),
    status: cleanText(value?.candidate_status, 80),
    principal_committees: asArray(value?.principal_committees).map(normalizePrincipalCommittee).filter((item) => item.committee_id && item.name)
  };
}

function normalizeCommittee(value) {
  return {
    committee_id: cleanText(value?.committee_id, 20),
    name: cleanText(value?.name, 300),
    committee_type: cleanText(value?.committee_type, 80),
    committee_type_full: cleanText(value?.committee_type_full, 180),
    designation: cleanText(value?.designation, 80),
    designation_full: cleanText(value?.designation_full, 180),
    organization_type: cleanText(value?.organization_type, 80),
    organization_type_full: cleanText(value?.organization_type_full, 180),
    party: cleanText(value?.party_full || value?.party, 120),
    state: cleanText(value?.state, 80),
    candidate_ids: asArray(value?.candidate_ids).map((item) => cleanText(item, 20)).filter(Boolean),
    cycles: asArray(value?.cycles).map(Number).filter(Number.isFinite)
  };
}

function normalizeOpenSecretsOrg(value) {
  const attributes = value?.['@attributes'] || value || {};
  return {
    org_id: cleanText(attributes.orgid || attributes.org_id || attributes.id, 40),
    name: cleanText(attributes.orgname || attributes.org_name || attributes.name, 300)
  };
}

async function openSecretsOrganizations(searchPhrase, context) {
  const key = String(process.env.OPENSECRETS_API_KEY || '').trim();
  if (!key) {
    return {
      configured: false,
      status: 'HELD',
      reason: 'OPENSECRETS_API_KEY is not configured',
      organizations: []
    };
  }
  const url = new URL(OPENSECRETS_BASE);
  url.searchParams.set('method', 'getOrgs');
  url.searchParams.set('output', 'json');
  url.searchParams.set('apikey', key);
  url.searchParams.set('org', searchPhrase);
  try {
    const body = await jsonFetch(url, { headers: { Accept: 'application/json', 'User-Agent': 'TD613-Giving/1.0 operator research' } }, context);
    const organizations = asArray(body?.response?.organization).map(normalizeOpenSecretsOrg).filter((item) => item.org_id && item.name);
    return { configured: true, status: 'READY', reason: null, organizations };
  } catch (error) {
    return {
      configured: true,
      status: 'ERROR',
      reason: error?.message || 'OpenSecrets lookup did not complete',
      organizations: []
    };
  }
}

export async function searchCampaignDirectory(payload = {}, context = {}) {
  const searchPhrase = phrase(payload.query);
  const state = cleanText(payload.state, 2)?.toUpperCase() || null;
  if (state && !/^[A-Z]{2}$/.test(state)) throw new GivingError('invalid-campaign-directory-state', 'Campaign directory state must use a two-letter postal code', 400);
  const key = fecKey();
  const candidateUrl = new URL(`${OPENFEC_BASE}/candidates/search/`);
  candidateUrl.searchParams.set('api_key', key);
  candidateUrl.searchParams.set('q', searchPhrase);
  candidateUrl.searchParams.set('per_page', '20');
  if (state) candidateUrl.searchParams.set('state', state);
  const committeeUrl = new URL(`${OPENFEC_BASE}/committees/`);
  committeeUrl.searchParams.set('api_key', key);
  committeeUrl.searchParams.set('q', searchPhrase);
  committeeUrl.searchParams.set('per_page', '20');
  if (state) committeeUrl.searchParams.set('state', state);

  const [candidateBody, committeeBody, openSecrets] = await Promise.all([
    jsonFetch(candidateUrl, { headers: { Accept: 'application/json', 'User-Agent': 'TD613-Giving/1.0 operator research' } }, context),
    jsonFetch(committeeUrl, { headers: { Accept: 'application/json', 'User-Agent': 'TD613-Giving/1.0 operator research' } }, context),
    openSecretsOrganizations(searchPhrase, context)
  ]);
  if (!Array.isArray(candidateBody?.results) || !Array.isArray(committeeBody?.results)) {
    throw new GivingError('campaign-directory-contract-drift', 'OpenFEC candidate / committee search did not match the expected result containers', 502);
  }
  return {
    schema: 'td613.giving.campaign-directory/v1',
    query: searchPhrase,
    state,
    fec_api_key_mode: String(process.env.FEC_API_KEY || '').trim() ? 'configured' : 'demo',
    candidates: candidateBody.results.map(normalizeCandidate).filter((item) => item.candidate_id && item.name),
    committees: committeeBody.results.map(normalizeCommittee).filter((item) => item.committee_id && item.name),
    opensecrets: openSecrets,
    semantics: {
      candidates: 'OPENFEC_CANDIDATE_SEARCH_WITH_PRINCIPAL_COMMITTEES',
      committees: 'OPENFEC_COMMITTEE_IDENTITY',
      opensecrets: 'AGGREGATE_ORGANIZATION_INTELLIGENCE_NOT_INDIVIDUAL_DONOR_TRANSACTIONS'
    }
  };
}

export async function openSecretsOrganizationSummary(payload = {}, context = {}) {
  const key = String(process.env.OPENSECRETS_API_KEY || '').trim();
  if (!key) throw new GivingError('opensecrets-unavailable', 'OpenSecrets integration requires OPENSECRETS_API_KEY', 503);
  const orgId = cleanText(payload.org_id, 40);
  if (!/^D\d{9}$/.test(orgId)) throw new GivingError('invalid-opensecrets-org-id', 'OpenSecrets organization ID must use the documented D######### form', 400);
  const url = new URL(OPENSECRETS_BASE);
  url.searchParams.set('method', 'orgSummary');
  url.searchParams.set('output', 'json');
  url.searchParams.set('apikey', key);
  url.searchParams.set('id', orgId);
  const body = await jsonFetch(url, { headers: { Accept: 'application/json', 'User-Agent': 'TD613-Giving/1.0 operator research' } }, context);
  const attributes = body?.response?.organization?.['@attributes'] || body?.response?.organization;
  if (!attributes || typeof attributes !== 'object') throw new GivingError('opensecrets-contract-drift', 'OpenSecrets organization summary did not match the documented container', 502);
  return {
    schema: 'td613.giving.opensecrets-org-summary/v1',
    org_id: orgId,
    name: cleanText(attributes.orgname, 300),
    cycle: Number(attributes.cycle) || null,
    total: Number(attributes.total) || null,
    individuals: Number(attributes.indivs) || null,
    pacs: Number(attributes.pacs) || null,
    democrats: Number(attributes.dems) || null,
    republicans: Number(attributes.repubs) || null,
    lobbying: Number(attributes.lobbying) || null,
    outside: Number(attributes.outside) || null,
    gave_to_candidates: Number(attributes.gave_to_cand) || null,
    source: cleanText(attributes.source, 500),
    semantics: 'OPENSECRETS_AGGREGATE_ORGANIZATION_SUMMARY'
  };
}

async function campaignDeputyFetch(path, options = {}, context = {}) {
  const response = await fetchWithBoundary(`${CAMPAIGN_DEPUTY_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${campaignDeputyKey()}`,
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {})
    }
  }, { fetchImpl: context.fetchImpl, timeoutMs: 12_000 });
  if (!response.ok) {
    let upstreamMessage = null;
    try { upstreamMessage = cleanText((await response.json())?.message, 300); } catch {}
    if (response.status === 401 || response.status === 403) throw new GivingError('campaign-deputy-authorization-failed', 'Campaign Deputy did not authorize this server request', 502);
    throw new GivingError(response.status === 409 ? 'campaign-deputy-conflict' : 'campaign-deputy-upstream-error', `Campaign Deputy returned HTTP ${response.status}`, 502, {
      upstream_status: response.status,
      ...(upstreamMessage ? { upstream_message: upstreamMessage } : {})
    });
  }
  if (response.status === 204) return {};
  try { return await response.json(); } catch { throw new GivingError('campaign-deputy-contract-drift', 'Campaign Deputy returned a non-JSON response', 502); }
}

async function listAllCampaignDeputyLists(context) {
  const lists = [];
  let cursor = null;
  for (let page = 0; page < MAX_LIST_PAGES; page += 1) {
    const params = new URLSearchParams({ listType: 'list', pageSize: '100' });
    if (cursor) params.set('lastEvaluatedKey', cursor);
    const body = await campaignDeputyFetch(`/lists?${params}`, {}, context);
    if (!Array.isArray(body?.data)) throw new GivingError('campaign-deputy-contract-drift', 'Campaign Deputy list page did not match its documented container', 502);
    lists.push(...body.data);
    cursor = body.metadata?.lastEvaluatedKey || null;
    if (!cursor) return lists;
  }
  throw new GivingError('campaign-deputy-pagination-ceiling', 'Campaign Deputy list pagination exceeded the bounded traversal ceiling', 502);
}

export async function ensureCampaignDeputyCommittee(payload = {}, context = {}) {
  if (payload.confirmed !== true) throw new GivingError('committee-confirmation-required', 'Committee integration requires the explicit operator gesture', 409);
  const committeeId = cleanText(payload.committee_id, 20);
  if (!/^C\d{8}$/.test(committeeId)) throw new GivingError('invalid-fec-committee-id', 'Committee integration requires an exact FEC committee ID', 400);
  const name = cleanText(payload.committee_name, 100);
  if (!name) throw new GivingError('committee-required', 'Committee integration requires the exact reviewed committee name', 400);
  const lists = await listAllCampaignDeputyLists(context);
  let list = lists.find((item) => item?.listType === 'list' && cleanText(item?.name, 100).toLocaleLowerCase() === name.toLocaleLowerCase());
  let created = false;
  if (!list?.id) {
    try {
      const body = await campaignDeputyFetch('/lists', {
        method: 'POST',
        body: JSON.stringify({ name, listType: 'list' })
      }, context);
      list = body?.data || body;
      if (!list?.id) throw new GivingError('campaign-deputy-contract-drift', 'Campaign Deputy did not return the created list ID', 502);
      created = true;
    } catch (error) {
      if (error?.details?.upstream_status !== 409) throw error;
      const afterConflict = await listAllCampaignDeputyLists(context);
      list = afterConflict.find((item) => item?.listType === 'list' && cleanText(item?.name, 100).toLocaleLowerCase() === name.toLocaleLowerCase());
      if (!list?.id) throw error;
    }
  }
  const receipt = {
    schema: 'td613.giving.campaign-deputy-committee-receipt/v1',
    action: created ? 'COMMITTEE_LIST_CREATED' : 'COMMITTEE_LIST_ALREADY_PRESENT',
    at: new Date().toISOString(),
    listId: list.id,
    list_name: name,
    fec_committee_id: committeeId,
    candidate_id: cleanText(payload.candidate_id, 20) || null,
    committee_type: cleanText(payload.committee_type, 120) || null,
    designation: cleanText(payload.designation, 120) || null,
    idempotency_key: sha256({ committeeId, name, listId: list.id }),
    external_contribution_created: false,
    relationship_semantics: 'REVIEWED_FEC_COMMITTEE_IDENTITY_TO_CAMPAIGN_DEPUTY_LIST'
  };
  return { list: { ...list, created }, receipt };
}

export function campaignDirectoryReadiness() {
  return {
    openfec: { configured_key: Boolean(String(process.env.FEC_API_KEY || '').trim()), demo_fallback: true },
    opensecrets: { configured: Boolean(String(process.env.OPENSECRETS_API_KEY || '').trim()), capability: 'ORGANIZATION_LOOKUP_AND_AGGREGATE_SUMMARY' },
    campaign_deputy_committee: { configured: Boolean(String(process.env.CAMPAIGN_DEPUTY_API_KEY || '').trim()), representation: 'listType=list', historical_contribution_writeback_used: false }
  };
}

