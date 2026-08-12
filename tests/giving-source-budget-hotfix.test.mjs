import assert from 'node:assert/strict';
import { GIVING_SEARCH_MIN_TIMEOUT_MS } from '../app/giving/history/giving-api.js';
import { searchSourcePage } from '../server/giving/adapters/index.js';
import { _fecInternals } from '../server/giving/adapters/fec.js';

function mockResponse({ status = 200, json, text = '', headers = {} }) {
  const normalized = Object.fromEntries(Object.entries(headers).map(([key, value]) => [key.toLowerCase(), String(value)]));
  return {
    status,
    ok: status >= 200 && status < 300,
    headers: { get: (name) => normalized[String(name).toLowerCase()] || null },
    json: async () => json,
    text: async () => text
  };
}

assert.equal(GIVING_SEARCH_MIN_TIMEOUT_MS, 28_000, 'source search client window must outlive two ordinary 12s upstream exchanges');
assert.ok(GIVING_SEARCH_MIN_TIMEOUT_MS < 30_000, 'source search client window must remain below the Giving Vercel function ceiling');
assert.equal(_fecInternals.FEC_PAGE_SIZE_CAP, 50, 'OpenFEC first-page work stays bounded');

let fecCalls = 0;
const broadFec = await searchSourcePage({
  source_instance_id: 'fec-schedule-a',
  query: { name: 'Jane Doe', start_date: '2020-01-01', end_date: '2026-08-12', page_size: 200 }
}, {
  fetchImpl: async (url) => {
    fecCalls += 1;
    const value = String(url);
    assert.match(value, /per_page=50/);
    assert.match(value, /min_date=2020-01-01/);
    assert.match(value, /max_date=2026-08-12/);
    assert.doesNotMatch(value, /two_year_transaction_period=/, 'broad date windows must not repeat transaction-period filters');
    return mockResponse({ json: { pagination: { last_indexes: null }, results: [] } });
  }
});
assert.equal(fecCalls, 1);
assert.equal(broadFec.source_status, 'READY');

const floridaTsv = 'Committee Name\tContributor Name\tContribution Date\tAmount\tAmendment\nNeighbors for Florida\tDOE, JANE\t08/01/2026\t20.00\tN';
let floridaCalls = 0;
const florida = await searchSourcePage({
  source_instance_id: 'florida-state-contributions',
  query: { name: 'Jane Doe', start_date: '2020-01-01', end_date: '2026-08-12', page_size: 200 }
}, {
  fetchImpl: async (_url, options) => {
    floridaCalls += 1;
    assert.match(options.body, /clname=Jane\+Doe/);
    return mockResponse({ text: floridaTsv });
  }
});
assert.equal(floridaCalls, 1, 'ordinary Florida contributor search must remain one bounded upstream POST');
assert.equal(florida.records.length, 1);

const headers17 = [
  'Candidate/Committee', 'Candidate Name', 'Office', 'Election', 'Report',
  'Contributor/Vendor Name', 'Address', 'City', 'State', 'Zip', 'Employer',
  'Contributor Occupation', 'Item Date', 'Contribution Type', 'Amount', 'Amendment', 'Report ID'
];
const row17 = [
  'Jane for Tallahassee', 'Jane Candidate', 'Tallahassee City Commission', '2010 General', 'M7',
  '"DOE, JOHN"', '1 Main St', 'Tallahassee', 'FL', '32301', 'Acme',
  'Engineer', '08/10/2010', 'CHE', '100.00', 'N', 'report-1'
];
let voterFocusCalls = 0;
const voterFocus = await searchSourcePage({
  source_instance_id: 'voterfocus-leon',
  query: { name: 'John Doe', start_date: '2020-01-01', end_date: '2026-08-12', page_size: 200 }
}, {
  fetchImpl: async (_url, options) => {
    voterFocusCalls += 1;
    assert.match(options.body, /c_lastname=Doe/);
    return mockResponse({ text: `${headers17.join(',')}\n${row17.join(',')}` });
  }
});
assert.equal(voterFocusCalls, 1, 'VoterFocus must stop after the first donor projection returns evidence');
assert.equal(voterFocus.records.length, 1);

let easyVoteCalls = 0;
const easyVote = await searchSourcePage({
  source_instance_id: 'easyvote-lakeland',
  query: { name: 'Jane Doe', start_date: '2020-01-01', end_date: '2026-08-12', page_size: 100 }
}, {
  fetchImpl: async (_url, options) => {
    easyVoteCalls += 1;
    if (easyVoteCalls === 1) return mockResponse({ json: { UserId: 'u-1', CustomerId: 'c-1', ZumoToken: null } });
    assert.equal(options.headers['Easy-Vote-Authenticated-User'], 'UserId:u-1|CustomerId:c-1|ZumoToken:null');
    return mockResponse({ json: { data: [], hasNextPage: false } });
  }
});
assert.equal(easyVoteCalls, 2, 'EasyVote remains a bootstrap-plus-search source under the expanded browser observation window');
assert.equal(easyVote.source_status, 'READY');

console.log('giving-source-budget-hotfix.test.mjs passed');
