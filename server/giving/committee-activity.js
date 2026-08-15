import { searchSourcePage } from './adapters/index.js';
import { _easyVoteInternals } from './adapters/easyvote.js';
import { validateSearchQuery } from './adapters/shared.js';
import { searchVoterFocusPage } from './adapters/voterfocus.js';
import { sourceById } from './registry.js';
import {
  GivingError,
  amountToCents,
  cleanText,
  fetchWithBoundary,
  readBoundedText,
  rowsToObjects,
  sha256,
  splitDelimited
} from './util.js';

const ACTIVITY_TYPES = new Set(['CONTRIBUTIONS', 'EXPENDITURES']);
const ACTIVITY_LIMIT = 100;

function activityType(value) {
  const admitted = cleanText(value, 40)?.toUpperCase() || 'CONTRIBUTIONS';
  if (!ACTIVITY_TYPES.has(admitted)) throw new GivingError('invalid-committee-activity-type', 'Committee activity must use CONTRIBUTIONS or EXPENDITURES', 400);
  return admitted;
}

function normalizedKey(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function valueFrom(row, aliases) {
  const admitted = new Set(aliases.map(normalizedKey));
  for (const [key, value] of Object.entries(row || {})) {
    if (value === null || value === undefined || value === '') continue;
    if (admitted.has(normalizedKey(key))) return cleanText(value, 600);
  }
  return null;
}

function activityRow({ source, type, raw, filer, counterparty, date, amount, purpose, office, recordId, locator }) {
  const amountCents = amountToCents(amount);
  return {
    schema: 'td613.giving.committee-activity-record/v1',
    activity_type: type,
    source_instance_id: source.id,
    source_family: source.family,
    custodian: source.custodian,
    jurisdiction: source.jurisdiction,
    filer: cleanText(filer, 500),
    counterparty: cleanText(counterparty, 500),
    date: cleanText(date, 40),
    amount_cents: Number.isSafeInteger(amountCents) ? amountCents : null,
    purpose: cleanText(purpose, 500),
    office: cleanText(office, 300),
    source_record_id: cleanText(recordId, 160),
    source_locator: cleanText(locator || source.locator, 1000),
    record_digest: sha256({ source: source.id, type, raw })
  };
}

function fromContributionRecord(record, source) {
  return activityRow({
    source,
    type: 'CONTRIBUTIONS',
    raw: record.raw_source_row || record,
    filer: record.committee || record.candidate,
    counterparty: record.contributor_name_display || record.contributor_name_raw || record.source_contributor_name_raw,
    date: record.contribution_date,
    amount: Number.isSafeInteger(record.amount_cents) ? record.amount_cents / 100 : null,
    purpose: record.contribution_type || record.reporting_context,
    office: record.office,
    recordId: record.source_native_ids?.transaction_id || record.source_native_ids?.contribution_id || record.local_digest,
    locator: record.source_locator
  });
}

function fromGenericExpenditureRow(row, source, locator = null) {
  return activityRow({
    source,
    type: 'EXPENDITURES',
    raw: row,
    filer: valueFrom(row, ['Candidate/Committee', 'Candidate Committee', 'CandidateCommitteeName', 'Committee Name', 'Filer Name', 'display candidate name']),
    counterparty: valueFrom(row, ['Payee Name', 'Payee', 'Payee Organization Name', 'PayeeOrganizationName', 'Vendor Name', 'Contributor/Vendor Name', 'display payee name', 'recipient_name']),
    date: valueFrom(row, ['Expenditure Date', 'Distribution Date', 'DistributionDate', 'Date', 'Item Date', 'display distribution date', 'disbursement_date']),
    amount: valueFrom(row, ['Expenditure Amount', 'Distribution Amount', 'DistributionAmount', 'Amount', 'display distribution amount', 'disbursement_amount']),
    purpose: valueFrom(row, ['Purpose', 'Expenditure Purpose', 'Disbursement Description', 'disbursement_description', 'memo_text']),
    office: valueFrom(row, ['Office', 'Office Name', 'OfficeName', 'display office name']),
    recordId: valueFrom(row, ['Transaction ID', 'Record ID', 'Document Filing ID', 'DocumentFilingId', 'sub_id']),
    locator
  });
}

function dateForFlorida(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[2]}/${match[3]}/${match[1]}` : '';
}

function candidateParts(value) {
  const tokens = String(value || '').trim().split(/\s+/).filter(Boolean);
  return { first: tokens.length > 1 ? tokens.slice(0, -1).join(' ') : '', last: tokens.at(-1) || '' };
}

async function floridaExpenditures(source, query, fetchImpl) {
  const candidate = candidateParts(query.candidate || (!query.committee ? query.name : ''));
  const parameters = new URLSearchParams({
    election: query.election || 'All',
    search_on: query.committee ? '4' : '2',
    CanFName: candidate.first,
    CanLName: candidate.last,
    CanNameSrch: '1',
    office: 'All',
    cdistrict: '',
    cgroup: '',
    party: 'All',
    ComName: query.committee || '',
    ComNameSrch: '1',
    committee: 'All',
    namesearch: '1',
    cfname: '',
    clname: '',
    ccity: '',
    cstate: '',
    czipcode: '',
    cpurpose: '',
    cdollar_minimum: query.min_amount_cents === null ? '' : String(query.min_amount_cents / 100),
    cdollar_maximum: query.max_amount_cents === null ? '' : String(query.max_amount_cents / 100),
    rowlimit: String(Math.min(query.page_size, ACTIVITY_LIMIT)),
    csort1: 'DAT',
    csort2: 'CAN',
    cdatefrom: dateForFlorida(query.start_date),
    cdateto: dateForFlorida(query.end_date),
    queryformat: '2',
    Submit: 'Submit'
  });
  const response = await fetchWithBoundary('https://dos.elections.myflorida.com/cgi-bin/expend.exe', {
    method: 'POST',
    headers: {
      Accept: 'text/tab-separated-values,text/plain;q=0.9,*/*;q=0.1',
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      Referer: 'https://dos.elections.myflorida.com/campaign-finance/expenditures/',
      'User-Agent': 'TD613-Giving/1.0 operator research'
    },
    body: parameters.toString()
  }, { fetchImpl });
  if (!response.ok) throw new GivingError('florida-expenditure-upstream-error', `Florida Division of Elections returned HTTP ${response.status}`, 502);
  const text = await readBoundedText(response);
  if (/<!doctype|<html/i.test(text)) throw new GivingError('florida-expenditure-contract-drift', 'Florida returned HTML instead of the requested expenditure export', 502);
  return rowsToObjects(splitDelimited(text, '\t')).map((row) => fromGenericExpenditureRow(row, source, 'https://dos.elections.myflorida.com/campaign-finance/expenditures/'));
}

async function fecExpenditures(source, query, fetchImpl) {
  const committeeId = cleanText(query.committee, 20);
  if (!/^C\d{8}$/.test(committeeId || '')) throw new GivingError('fec-committee-id-required', 'Federal expenditure receipts require selecting an exact FEC committee identity first', 400);
  const url = new URL('https://api.open.fec.gov/v1/schedules/schedule_b/');
  url.searchParams.set('api_key', String(process.env.FEC_API_KEY || '').trim() || 'DEMO_KEY');
  url.searchParams.set('committee_id', committeeId);
  url.searchParams.set('per_page', String(Math.min(query.page_size, ACTIVITY_LIMIT)));
  url.searchParams.set('sort', '-disbursement_date');
  if (query.start_date) url.searchParams.set('min_date', query.start_date);
  if (query.end_date) url.searchParams.set('max_date', query.end_date);
  const response = await fetchWithBoundary(url, { headers: { Accept: 'application/json', 'User-Agent': 'TD613-Giving/1.0 operator research' } }, { fetchImpl, timeoutMs: 24_000 });
  if (!response.ok) throw new GivingError('fec-expenditure-upstream-error', `OpenFEC Schedule B returned HTTP ${response.status}`, 502);
  const body = await response.json();
  if (!Array.isArray(body?.results)) throw new GivingError('fec-expenditure-contract-drift', 'OpenFEC Schedule B did not return its documented results container', 502);
  return body.results.map((row) => fromGenericExpenditureRow({
    ...row,
    'Candidate/Committee': row.committee?.name || committeeId,
    'Payee Name': row.recipient_name,
    'Expenditure Date': row.disbursement_date,
    'Expenditure Amount': row.disbursement_amount,
    Purpose: row.disbursement_description || row.memo_text,
    'Transaction ID': row.sub_id
  }, source, url.toString().replace(/([?&])api_key=[^&]+&?/, '$1').replace(/[?&]$/, '')));
}

async function voterFocusExpenditures(source, query, fetchImpl) {
  const result = await searchVoterFocusPage({ source, query, continuation: null, fetchImpl, activityType: 'EXPENDITURES' });
  return (result.records || []).map((record) => activityRow({
    source,
    type: 'EXPENDITURES',
    raw: record.raw_source_row || record,
    filer: record.committee || record.candidate,
    counterparty: record.contributor_name_display || record.contributor_name_raw || record.source_contributor_name_raw,
    date: record.contribution_date,
    amount: Number.isSafeInteger(record.amount_cents) ? record.amount_cents / 100 : null,
    purpose: record.contribution_type || record.reporting_context,
    office: record.office,
    recordId: record.local_digest,
    locator: source.locator
  }));
}

async function easyVoteExpenditures(source, query, fetchImpl) {
  const identity = await _easyVoteInternals.bootstrapIdentity(source, fetchImpl);
  const url = new URL(`https://ecf-api.easyvoteapp.com/advancedsearch/distributions/${encodeURIComponent(identity.CustomerId)}`);
  const candidate = candidateParts(query.candidate || query.committee || query.name);
  if (candidate.first) url.searchParams.set('candidateFirstName', candidate.first);
  if (candidate.last) url.searchParams.set('candidateLastName', candidate.last);
  if (query.start_date) url.searchParams.set('minDate', query.start_date);
  if (query.end_date) url.searchParams.set('maxDate', query.end_date);
  if (query.min_amount_cents !== null) url.searchParams.set('minAmount', String(query.min_amount_cents / 100));
  if (query.max_amount_cents !== null) url.searchParams.set('maxAmount', String(query.max_amount_cents / 100));
  const extraHeaders = { 'Easy-Vote-Authenticated-User': _easyVoteInternals.authenticationHeader(identity) };
  if (identity.ZumoToken) extraHeaders['X-ZUMO-AUTH'] = identity.ZumoToken;
  const response = await fetchWithBoundary(url, { headers: _easyVoteInternals.easyVoteHeaders(identity.portal, extraHeaders) }, { fetchImpl, timeoutMs: 6500 });
  if (!response.ok) throw new GivingError('easyvote-expenditure-upstream-error', `EasyVote distributions returned HTTP ${response.status}`, 502);
  const body = await response.json();
  const rows = _easyVoteInternals.easyVoteRows(body);
  if (!Array.isArray(rows)) throw new GivingError('easyvote-expenditure-contract-drift', 'EasyVote distributions did not return its current anonymous collection contract', 502);
  return rows.slice(0, ACTIVITY_LIMIT).map((row) => fromGenericExpenditureRow(row, source, `${_easyVoteInternals.easyVoteSiteOrigin(identity.portal)}/advancedsearch/distributions`));
}

export async function searchCommitteeActivity(payload = {}, context = {}) {
  const source = sourceById(payload.source_instance_id);
  if (!source) throw new GivingError('unknown-source-instance', 'Committee activity requires one registered source instance', 400);
  const type = activityType(payload.activity_type);
  const query = validateSearchQuery({ ...(payload.query || {}), page_size: Math.min(Number(payload.query?.page_size) || ACTIVITY_LIMIT, ACTIVITY_LIMIT) });
  let records;
  if (type === 'CONTRIBUTIONS') {
    const result = await searchSourcePage({ source_instance_id: source.id, query }, context);
    records = (result.records || []).map((record) => fromContributionRecord(record, source));
  } else if (source.adapter === 'fec') records = await fecExpenditures(source, query, context.fetchImpl);
  else if (source.adapter === 'florida') records = await floridaExpenditures(source, query, context.fetchImpl);
  else if (source.adapter === 'voterfocus') records = await voterFocusExpenditures(source, query, context.fetchImpl);
  else if (source.adapter === 'easyvote') records = await easyVoteExpenditures(source, query, context.fetchImpl);
  else throw new GivingError('committee-activity-adapter-unavailable', 'This source does not expose the selected committee activity lane', 503);
  return {
    schema: 'td613.giving.committee-activity/v1',
    activity_type: type,
    source_instance_id: source.id,
    records,
    record_count: records.length,
    continuation: null,
    storage_semantics: 'TRANSIENT_SEPARATE_CAMPAIGN_ACTIVITY_NOT_DONOR_GIVING_HISTORY',
    coverage: source.electronic_scope,
    retrieved_at: new Date().toISOString()
  };
}

export const _committeeActivityInternals = Object.freeze({
  activityType,
  valueFrom,
  activityRow,
  fromGenericExpenditureRow,
  dateForFlorida,
  candidateParts
});

