import { normalizeVoterFocusRow } from '../normalize.js';
import {
  GivingError,
  fetchWithBoundary,
  readBoundedText,
  rowsToObjects,
  splitDelimited
} from '../util.js';
import {
  decodeContinuation,
  encodeContinuation,
  queryDigest,
  sourceReceipt
} from './shared.js';

function dateParts(date) {
  const [year, month, day] = date.split('-');
  return { year, month: String(Number(month)), day: String(Number(day)) };
}

function candidateParts(value) {
  const tokens = String(value || '').trim().split(/\s+/).filter(Boolean);
  if (tokens.length < 2) return { family: tokens[0] || '', given: '' };
  return { family: tokens.at(-1), given: tokens.slice(0, -1).join(' ') };
}

function normalizedHeader(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function rowValue(row, accepted) {
  const entries = Object.entries(row || {});
  for (const [key, value] of entries) {
    if (!String(value || '').trim()) continue;
    if (accepted.has(normalizedHeader(key))) return String(value).trim();
  }
  return '';
}

const FIRST_HEADERS = new Set([
  'contributorfirstname', 'contributorvendorfirstname', 'contributorvendorfirst', 'firstname', 'first'
]);
const MIDDLE_HEADERS = new Set([
  'contributormiddlename', 'contributorvendormiddlename', 'contributorvendormiddle', 'middlename', 'middle', 'mi'
]);
const LAST_HEADERS = new Set([
  'contributorlastname', 'contributorvendorlastname', 'contributorlastnamecompanyname',
  'contributorvendorlastnamecompanyname', 'lastname', 'lastnamecompanyname', 'lastnamecompany',
  'lastcompanyname', 'lastnameorcompanyname', 'companylastname', 'companyname', 'organizationname'
]);

function exactMatchContributorProjection(row, record) {
  const first = rowValue(row, FIRST_HEADERS);
  const middle = rowValue(row, MIDDLE_HEADERS);
  const last = rowValue(row, LAST_HEADERS);
  if (first && last) return `${last}, ${[first, middle].filter(Boolean).join(' ')}`;

  const current = String(
    record?.source_contributor_name_raw ||
    record?.contributor_name_raw ||
    record?.contributor_name_parsed?.source_display ||
    ''
  ).trim();
  if (!current || current.includes(',')) return current;

  // VoterFocus's contributor search surface is explicitly keyed by
  // “Last Name or Company Name.” Some county CSV renderers omit the comma and
  // emit person names as LAST FIRST [MIDDLE]. Promote that serialization into
  // a comma-delimited person projection before the browser's Exact Match gate.
  if (record?.contributor_name_parsed?.kind === 'PERSON') {
    const tokens = current.split(/\s+/).filter(Boolean);
    if (tokens.length >= 2) return `${tokens[0]}, ${tokens.slice(1).join(' ')}`;
  }
  return current;
}

function admitVoterFocusName(record, row) {
  const projected = exactMatchContributorProjection(row, record);
  if (!projected || projected === record.contributor_name_raw) return record;
  return {
    ...record,
    contributor_name_raw: projected,
    contributor_name_display: projected,
    contributor_name_parsed: {
      ...(record.contributor_name_parsed || {}),
      display: projected,
      source_display: record.source_contributor_name_raw || record.contributor_name_parsed?.source_display || projected
    },
    lineage: {
      ...(record.lineage || {}),
      voterfocus_exact_match_projection: 'LAST_COMMA_FIRST_FROM_SPLIT_OR_LAST_FIRST_SOURCE_SERIALIZATION'
    }
  };
}

function voterFocusPayload(query, projection = 'CONTRIBUTOR_ENTITY') {
  if (!query.start_date || !query.end_date) {
    throw new GivingError('explicit-dates-required', 'VoterFocus historical searches require explicit start_date and end_date values', 400);
  }
  const from = dateParts(query.start_date);
  const to = dateParts(query.end_date);
  const params = new URLSearchParams();
  params.set('srch_tp', 'C');
  const person = candidateParts(query.candidate || query.name);
  params.set('c_lastname', projection === 'CONTRIBUTOR_PERSON'
    ? (query.last_name || person.family)
    : projection === 'CONTRIBUTOR_ENTITY' ? (query.name || query.last_name || query.committee || '') : '');
  params.set('cand_name', projection === 'COMMITTEE'
    ? (query.committee || query.name || '')
    : projection === 'CANDIDATE' ? (query.last_name || person.family) : '');
  params.set('cand_fname', projection === 'CANDIDATE' ? (query.first_name || person.given) : '');
  params.set('cand_id', '');
  params.set('b_month', from.month);
  params.set('b_day', from.day);
  params.set('b_year', from.year);
  params.set('e_month', to.month);
  params.set('e_day', to.day);
  params.set('e_year', to.year);
  params.set('s_min', query.min_amount_cents === null ? '' : String(query.min_amount_cents / 100));
  params.set('s_max', query.max_amount_cents === null ? '' : String(query.max_amount_cents / 100));
  params.set('c_item_type', '');
  params.set('e_item_type', '');
  params.set('contributor_tp', '');
  params.set('c_occ', query.occupation || '');
  params.set('srch_order', 'D');
  params.set('s_min_summary', '0');
  params.set('csv', 'on');
  params.set('isSearch', '1');
  return params;
}

function decodeHtml(value) {
  return String(value)
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function extractCsv(text) {
  if (!/<html|<!doctype/i.test(text)) return text.trim();
  const pre = text.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
  if (pre) return decodeHtml(pre[1].replace(/<[^>]+>/g, '')).trim();
  if (/no\s+(transactions|records|results)\s+(were\s+)?found/i.test(text)) return '';
  throw new GivingError('voterfocus-contract-drift', 'VoterFocus did not return its CSV export contract', 502);
}

export async function searchVoterFocusPage({ source, query, continuation, fetchImpl }) {
  const startedAt = new Date().toISOString();
  const digest = queryDigest(source.id, query);
  const cursor = decodeContinuation(continuation, source.id);
  const offset = cursor?.offset || 0;
  const endpoint = new URL('https://www.voterfocus.com/CampaignFinance/cand_srch.php');
  endpoint.searchParams.set('c', source.code);

  // Giving's primary search is a contributor search. Candidate/committee lookup
  // has its own dedicated surface, so a donor query must not fan out through four
  // sequential roles inside one serverless request. Try the person-shaped donor
  // projection first and the entity/company donor projection only when needed.
  const projections = query.committee
    ? ['COMMITTEE']
    : query.candidate
      ? ['CANDIDATE']
      : ['CONTRIBUTOR_PERSON', 'CONTRIBUTOR_ENTITY'];

  let response = null;
  let observedRows = [];
  for (const projection of projections) {
    response = await fetchWithBoundary(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'text/csv,text/plain;q=0.9,text/html;q=0.5',
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        Referer: source.locator,
        'User-Agent': 'TD613-Giving/1.0 operator research'
      },
      body: (() => {
        const parameters = voterFocusPayload(query, projection);
        parameters.set('c', source.code);
        return parameters.toString();
      })()
    }, { fetchImpl });
    if (!response.ok) throw new GivingError('voterfocus-upstream-error', `VoterFocus returned HTTP ${response.status}`, 502);
    const csv = extractCsv(await readBoundedText(response));
    if (!csv) continue;
    const projectionRows = splitDelimited(csv, ',');
    const width = projectionRows[0]?.length || 0;
    if (width !== 17 || projectionRows.some((row) => row.length !== width)) {
      throw new GivingError('voterfocus-schema-drift', `Expected the 17-column VoterFocus CSV schema; observed ${width}`, 502, {
        expected_columns: 17,
        observed_columns: width
      });
    }
    observedRows = rowsToObjects(projectionRows);
    if (observedRows.length) break;
  }

  if (!observedRows.length) {
    return {
      records: [], continuation: null, source_status: 'READY', coverage: source.electronic_scope,
      receipt: sourceReceipt({
        source, digest, startedAt, state: 'READY', upstreamStatus: response.status, page: 1,
        continuation: null, count: 0, coverage: source.electronic_scope
      })
    };
  }

  const pageRows = observedRows.slice(offset, offset + query.page_size);
  const nextOffset = offset + pageRows.length;
  const next = nextOffset < observedRows.length
    ? encodeContinuation({ source_instance_id: source.id, offset: nextOffset })
    : null;
  const retrievedAt = new Date().toISOString();
  const records = pageRows.map((row) => admitVoterFocusName(
    normalizeVoterFocusRow(row, { source, queryDigest: digest, retrievedAt }),
    row
  ));
  return {
    records,
    continuation: next,
    source_status: 'READY',
    coverage: source.electronic_scope,
    receipt: sourceReceipt({
      source, digest, startedAt, state: 'READY', upstreamStatus: response.status,
      page: Math.floor(offset / query.page_size) + 1, continuation: next, count: records.length,
      coverage: source.electronic_scope
    })
  };
}

export const _voterFocusInternals = Object.freeze({
  voterFocusPayload,
  extractCsv,
  candidateParts,
  exactMatchContributorProjection,
  admitVoterFocusName
});
