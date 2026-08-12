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

function voterFocusPayload(query, projection = 'CONTRIBUTOR') {
  if (!query.start_date || !query.end_date) {
    throw new GivingError('explicit-dates-required', 'VoterFocus historical searches require explicit start_date and end_date values', 400);
  }
  const from = dateParts(query.start_date);
  const to = dateParts(query.end_date);
  const params = new URLSearchParams();
  params.set('srch_tp', 'C');
  const person = candidateParts(query.candidate || query.name);
  params.set('c_lastname', projection === 'CONTRIBUTOR' ? (query.name || query.last_name || '') : '');
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
  const projections = query.committee ? ['COMMITTEE'] : query.candidate ? ['CANDIDATE'] : ['CONTRIBUTOR', 'CANDIDATE', 'COMMITTEE'];
  let response = null;
  let csv = '';
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
    csv = extractCsv(await readBoundedText(response));
    if (csv && rowsToObjects(splitDelimited(csv, ',')).length) break;
  }
  if (!csv) {
    return {
      records: [], continuation: null, source_status: 'READY', coverage: source.electronic_scope,
      receipt: sourceReceipt({
        source, digest, startedAt, state: 'READY', upstreamStatus: response.status, page: 1,
        continuation: null, count: 0, coverage: source.electronic_scope
      })
    };
  }
  const rows = splitDelimited(csv, ',');
  const width = rows[0]?.length || 0;
  if (width !== 17 || rows.some((row) => row.length !== width)) {
    throw new GivingError('voterfocus-schema-drift', `Expected the 17-column VoterFocus CSV schema; observed ${width}`, 502, {
      expected_columns: 17,
      observed_columns: width
    });
  }
  const objects = rowsToObjects(rows);
  const pageRows = objects.slice(offset, offset + query.page_size);
  const nextOffset = offset + pageRows.length;
  const next = nextOffset < objects.length
    ? encodeContinuation({ source_instance_id: source.id, offset: nextOffset })
    : null;
  const retrievedAt = new Date().toISOString();
  const records = pageRows.map((row) => normalizeVoterFocusRow(row, { source, queryDigest: digest, retrievedAt }));
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

export const _voterFocusInternals = Object.freeze({ voterFocusPayload, extractCsv, candidateParts });
