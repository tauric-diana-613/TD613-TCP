import assert from 'node:assert/strict';
import { searchSourcePage } from '../server/giving/adapters/index.js';
import { linkExisting, createConfirmed, withhold } from '../server/giving/campaign-deputy.js';

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

const fec = await searchSourcePage({
  source_instance_id: 'fec-schedule-a',
  query: { name: 'Jane Doe', start_date: '2025-01-01', end_date: '2026-08-11', page_size: 1 }
}, {
  fetchImpl: async (url) => {
    const value = String(url);
    assert.match(value, /schedules\/schedule_a/);
    assert.match(value, /contributor_name=Jane\+Doe/);
    assert.match(value, /two_year_transaction_period=2026/);
    assert.match(value, /sort_hide_null=true/);
    assert.match(value, /per_page=1/);
    assert.doesNotMatch(value, /[?&]page=/, 'Schedule A uses seek continuation rather than stale page-number pagination');
    return mockResponse({
      headers: { 'x-ratelimit-remaining': '999' },
      json: {
        pagination: {
          last_indexes: {
            last_index: 'sub-1',
            last_contribution_receipt_date: '2026-08-01'
          }
        },
        results: [{
          sub_id: 'sub-1', transaction_id: 'txn-1', amendment_indicator: 'N',
          committee_name: 'Committee A', contributor_name: 'DOE, JANE',
          contribution_receipt_date: '2026-08-01', contribution_receipt_amount: 125.25
        }]
      }
    });
  }
});
assert.equal(fec.records[0].amount_cents, 12525);
assert.equal(fec.records[0].lineage.transaction_id, 'txn-1');
assert.ok(fec.continuation);

const fecSeek = await searchSourcePage({
  source_instance_id: 'fec-schedule-a',
  query: { name: 'Jane Doe', start_date: '2025-01-01', end_date: '2026-08-11', page_size: 1 },
  continuation: fec.continuation
}, {
  fetchImpl: async (url) => {
    const value = String(url);
    assert.match(value, /last_index=sub-1/);
    assert.match(value, /last_contribution_receipt_date=2026-08-01/);
    return mockResponse({
      json: { pagination: { last_indexes: null }, results: [] }
    });
  }
});
assert.equal(fecSeek.records.length, 0);
assert.equal(fecSeek.continuation, null);

const previousConfiguredFecKey = process.env.FEC_API_KEY;
process.env.FEC_API_KEY = 'test-fec-key';
let fecRetryCalls = 0;
const fecRetried = await searchSourcePage({
  source_instance_id: 'fec-schedule-a',
  query: { name: 'Retry Donor', start_date: '2025-01-01', end_date: '2026-08-11', page_size: 20 }
}, {
  fetchImpl: async () => {
    fecRetryCalls += 1;
    if (fecRetryCalls === 1) return mockResponse({ status: 429, headers: { 'retry-after': '0', 'x-ratelimit-remaining': '0' }, json: {} });
    return mockResponse({
      headers: { 'x-ratelimit-remaining': '998' },
      json: {
        pagination: { last_indexes: null },
        results: [{
          sub_id: 'sub-retry', transaction_id: 'txn-retry', amendment_indicator: 'N',
          committee_name: 'Committee Retry', contributor_name: 'DONOR, RETRY',
          contribution_receipt_date: '2026-08-02', contribution_receipt_amount: 50
        }]
      }
    });
  }
});
assert.equal(fecRetryCalls, 2, 'configured OpenFEC key receives one bounded retry after a transient 429');
assert.equal(fecRetried.source_status, 'READY');
assert.equal(fecRetried.records[0].amount_cents, 5000);
if (previousConfiguredFecKey === undefined) delete process.env.FEC_API_KEY;
else process.env.FEC_API_KEY = previousConfiguredFecKey;

const previousFecApiKey = process.env.FEC_API_KEY;
delete process.env.FEC_API_KEY;
let fecLimitedCalls = 0;
const fecLimited = await searchSourcePage({
  source_instance_id: 'fec-schedule-a',
  query: { name: 'Limited Donor', page_size: 20 }
}, {
  fetchImpl: async () => {
    fecLimitedCalls += 1;
    return mockResponse({ status: 429, headers: { 'retry-after': '0', 'x-ratelimit-remaining': '0' }, json: {} });
  }
});
assert.equal(fecLimitedCalls, 1, 'shared DEMO_KEY 429 is surfaced immediately instead of spending another shared-quota request');
assert.equal(fecLimited.source_status, 'ERROR');
assert.equal(fecLimited.error.code, 'source-rate-limited');
assert.match(fecLimited.error.message, /shared DEMO_KEY fallback/);
if (previousFecApiKey === undefined) delete process.env.FEC_API_KEY;
else process.env.FEC_API_KEY = previousFecApiKey;

const fecValidation = await searchSourcePage({
  source_instance_id: 'fec-schedule-a',
  query: { name: 'Validation Donor', page_size: 20 }
}, {
  fetchImpl: async () => mockResponse({
    status: 422,
    text: JSON.stringify({ message: 'Example OpenFEC validation detail' })
  })
});
assert.equal(fecValidation.source_status, 'ERROR');
assert.equal(fecValidation.error.code, 'fec-upstream-error');
assert.match(fecValidation.error.message, /Example OpenFEC validation detail/);

const floridaTsv = 'Committee Name\tContributor Name\tContribution Date\tAmount\tAmendment\nNeighbors for Florida\tDOE, JANE\t08/01/2026\t20.00\tN';
const florida = await searchSourcePage({
  source_instance_id: 'florida-state-contributions',
  query: { name: 'Doe', election: '20261103-GEN', start_date: '2020-01-01', end_date: '2026-08-11', page_size: 50 }
}, {
  fetchImpl: async (url, options) => {
    assert.equal(String(url), 'https://dos.elections.myflorida.com/cgi-bin/contrib.exe');
    assert.match(options.body, /search_on=4/);
    assert.match(options.body, /clname=Doe/);
    assert.match(options.body, /cdatefrom=2020-01-01/);
    assert.match(options.body, /cdateto=2026-08-11/);
    assert.match(options.body, /rowlimit=50/);
    assert.match(options.body, /queryformat=2/);
    return mockResponse({ text: floridaTsv });
  }
});
assert.equal(florida.records[0].amount_cents, 2000);

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
const voterFocus = await searchSourcePage({
  source_instance_id: 'voterfocus-leon',
  query: { name: 'Doe', start_date: '2000-01-01', end_date: '2026-08-11', page_size: 100 }
}, {
  fetchImpl: async (url, options) => {
    assert.match(String(url), /c=leon/);
    assert.match(options.body, /b_year=2000/);
    assert.match(options.body, /e_year=2026/);
    assert.match(options.body, /srch_tp=C/);
    assert.match(options.body, /c_lastname=Doe/);
    assert.match(options.body, /csv=on/);
    assert.match(options.body, /isSearch=1/);
    assert.match(options.body, /c=leon/);
    return mockResponse({ text: `${headers17.join(',')}\n${row17.join(',')}` });
  }
});
assert.equal(voterFocus.records.length, 1);
assert.equal(voterFocus.records[0].contribution_date, '2010-08-10');
assert.equal(voterFocus.records[0].lineage.column_count, 17);

const easyCalls = [];
const easyVote = await searchSourcePage({
  source_instance_id: 'easyvote-lakeland',
  query: { name: 'Doe', page_size: 25 }
}, {
  fetchImpl: async (url, options) => {
    easyCalls.push({ url: String(url), options });
    if (easyCalls.length === 1) return mockResponse({ json: { UserId: 'u-1', CustomerId: 'c-1', ZumoToken: null } });
    assert.equal(options.headers['Easy-Vote-Authenticated-User'], 'UserId:u-1|CustomerId:c-1|ZumoToken:null');
    assert.equal(options.headers['ZUMO-API-VERSION'], '2.0.0');
    return mockResponse({ json: { data: [{ ContributorName: 'John Doe', Amount: 12.5, ContributionDate: '2026-08-01' }], hasNextPage: false } });
  }
});
assert.equal(easyCalls.length, 2);
assert.equal(easyVote.records[0].amount_cents, 1250);
assert.match(easyVote.receipt.zero_claim, /ELECTRONIC_PORTAL_SCOPE_ONLY/);

const failed = await searchSourcePage({
  source_instance_id: 'fec-schedule-a',
  query: { name: 'Doe' }
}, { fetchImpl: async () => { throw new Error('network down'); } });
assert.equal(failed.records.length, 0);
assert.notEqual(failed.source_status, 'READY');
assert.equal(failed.receipt.zero_claim, 'WITHHELD_SOURCE_FAILURE_IS_NOT_EVIDENCE_OF_ZERO_GIVING');

process.env.CAMPAIGN_DEPUTY_API_KEY = 'test-key';
const cdCalls = [];
const cdFetch = async (url, options) => {
  const value = String(url);
  cdCalls.push({ value, options });
  if (value.includes('/lists?')) return mockResponse({ json: { data: [{ id: 'list-1', name: 'Committee A', listType: 'list' }], metadata: {} } });
  if (value.includes('/lists/list-1?')) return mockResponse({ json: { data: [], metadata: {} } });
  if (value.endsWith('/lists/list-1') && options.method === 'PUT') return mockResponse({ json: { data: { personId: 'person-1' } } });
  throw new Error(`unexpected Campaign Deputy request: ${value}`);
};
const linked = await linkExisting({
  confirmed: true, person_id: 'person-1', committee: 'Committee A', dossier_id: 'dossier-1'
}, { fetchImpl: cdFetch });
assert.equal(linked.sync.action, 'EXISTING_CONTACT_LINKED');
assert.equal(linked.sync.external_contribution_created, false);
assert.ok(cdCalls.every((call) => !call.value.includes('/contribution')));

const createdCalls = [];
const createdContact = await createConfirmed({
  confirmed: true,
  duplicate_reviewed: true,
  create_new_confirmed: true,
  dossier_id: 'dossier-2',
  committee: 'Committee B',
  selected_fields: ['name', 'primaryEmailAddress'],
  person: { name: { givenName: 'Janet', familyName: 'Doe' }, primaryEmailAddress: 'janet@example.test' }
}, {
  fetchImpl: async (url, options) => {
    const value = String(url);
    createdCalls.push({ value, options });
    if (value.endsWith('/people')) return mockResponse({ json: { id: 'person-2', name: { givenName: 'Janet', familyName: 'Doe' } } });
    if (value.includes('/lists?')) return mockResponse({ json: { data: [{ id: 'list-2', name: 'Committee B', listType: 'list' }], metadata: {} } });
    if (value.includes('/lists/list-2?')) return mockResponse({ json: { data: [], metadata: {} } });
    if (value.endsWith('/lists/list-2')) return mockResponse({ json: { data: { personId: 'person-2' } } });
    throw new Error(`unexpected Campaign Deputy request: ${value}`);
  }
});
assert.equal(createdCalls[0].options.method, 'PUT');
assert.equal(createdContact.person.path, 'EXPLICIT_NEW_CONTACT');
assert.ok(createdCalls.every((call) => !call.value.includes('/contribution')));
assert.equal(withhold({ dossier_id: 'dossier-2' }).external_mutation, false);

console.log('giving-adapters.test.mjs passed');
