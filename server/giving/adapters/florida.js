import { normalizeFloridaRow } from '../normalize.js';
import {
  GivingError,
  fetchWithBoundary,
  readBoundedText,
  rowsToObjects,
  splitDelimited
} from '../util.js';
import { queryDigest, sourceReceipt } from './shared.js';

function floridaPayload(query) {
  const parameters = new URLSearchParams();
  parameters.set('election', query.election || (query.election_year ? `${query.election_year}1103-GEN` : 'All'));
  parameters.set('search_on', '4');
  parameters.set('CanFName', '');
  parameters.set('CanLName', '');
  parameters.set('CanNameSrch', '2');
  parameters.set('office', 'All');
  parameters.set('cdistrict', '');
  parameters.set('cgroup', '');
  parameters.set('party', 'All');
  parameters.set('ComName', '');
  parameters.set('ComNameSrch', '2');
  parameters.set('committee', 'All');
  parameters.set('namesearch', '2');
  parameters.set('cfname', query.first_name || '');
  parameters.set('clname', query.name || query.last_name || '');
  parameters.set('ccity', query.city || '');
  parameters.set('cstate', query.state || '');
  parameters.set('czipcode', query.zip || '');
  parameters.set('coccupation', query.occupation || '');
  parameters.set('cdatefrom', query.start_date || '');
  parameters.set('cdateto', query.end_date || '');
  parameters.set('cdollar_minimum', query.min_amount_cents === null ? '' : String(query.min_amount_cents / 100));
  parameters.set('cdollar_maximum', query.max_amount_cents === null ? '' : String(query.max_amount_cents / 100));
  parameters.set('rowlimit', String(Math.min(query.page_size, 500)));
  parameters.set('csort1', 'NAM');
  parameters.set('csort2', 'CAN');
  parameters.set('queryformat', '2');
  parameters.set('Submit', 'Submit');
  return parameters;
}

export async function searchFloridaPage({ source, query, continuation, fetchImpl }) {
  if (continuation) throw new GivingError('invalid-continuation', 'Florida state queries are bounded by the requested record limit and do not expose an upstream cursor', 400);
  const startedAt = new Date().toISOString();
  const digest = queryDigest(source.id, query);
  const response = await fetchWithBoundary('https://dos.elections.myflorida.com/cgi-bin/contrib.exe', {
    method: 'POST',
    headers: {
      Accept: 'text/tab-separated-values,text/plain;q=0.9,*/*;q=0.1',
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      Referer: 'https://dos.elections.myflorida.com/campaign-finance/contributions/',
      'User-Agent': 'TD613-Giving/1.0 operator research'
    },
    body: floridaPayload(query).toString()
  }, { fetchImpl });
  if (!response.ok) throw new GivingError('florida-upstream-error', `Florida Division of Elections returned HTTP ${response.status}`, 502);
  const text = await readBoundedText(response);
  if (/<!doctype|<html/i.test(text)) {
    throw new GivingError('florida-contract-drift', 'Florida returned HTML instead of the requested tab-delimited export', 502);
  }
  const rows = splitDelimited(text, '\t');
  const objects = rowsToObjects(rows);
  const retrievedAt = new Date().toISOString();
  const records = objects.map((row) => normalizeFloridaRow(row, { source, queryDigest: digest, retrievedAt }));
  return {
    records,
    continuation: null,
    source_status: 'READY',
    coverage: source.electronic_scope,
    receipt: sourceReceipt({
      source, digest, startedAt, state: 'READY', upstreamStatus: response.status, page: 1,
      continuation: null, count: records.length, coverage: source.electronic_scope,
      assertion: records.length === query.page_size
        ? 'PAGE_LIMIT_REACHED_NARROW_CRITERIA_BEFORE_INTERPRETING_COMPLETENESS'
        : null
    })
  };
}
