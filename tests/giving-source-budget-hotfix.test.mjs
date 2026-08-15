import assert from 'node:assert/strict';
import fs from 'node:fs';
import { GIVING_SEARCH_MIN_TIMEOUT_MS } from '../app/giving/history/giving-api.js';
import { searchSourcePage } from '../server/giving/adapters/index.js';
import { _fecInternals } from '../server/giving/adapters/fec.js';
import { maxDuration as GIVING_FUNCTION_MAX_DURATION_SECONDS } from '../api/giving.js';
import { MAX_SOURCE_PAGE_SIZE } from '../server/giving/constants.js';

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

const bootstrap = fs.readFileSync('app/giving/history/giving-bootstrap.js', 'utf8');
const pagingEntry = fs.readFileSync('app/giving/history/giving-review-paging.js', 'utf8');
const pagingCore = fs.readFileSync('app/giving/history/giving-review-paging-core.js', 'utf8');
const pagingCss = fs.readFileSync('app/giving/history/giving-review-paging.css', 'utf8');
const pageSizeModule = fs.readFileSync('app/giving/history/giving-page-size.js', 'utf8');
assert.match(bootstrap, /GIVING_ASSET_EPOCH = '20260814-1'/, 'Giving must carry one coordinated eviction epoch');
assert.match(bootstrap, /document\.title = 'TD613 Giving'/, 'browser title must be TD613 Giving');
assert.match(bootstrap, /ingressTitle\.textContent = 'TD613 Giving'/, 'ingress title must be TD613 Giving');
assert.match(bootstrap, /shellTitle\.textContent = 'TD613 Giving'/, 'unlocked masthead must be TD613 Giving');
assert.match(bootstrap, /retrievalLabel\.textContent = 'GIVING HISTORY'/, 'search panel eyebrow must become GIVING HISTORY');
assert.match(pagingEntry, /giving-page-size\.js\?v=20260814-1/, 'FEC-aware request normalizer must load before core Giving');
assert.match(pagingEntry, /giving-review-paging-core\.js\?v=20260813-3/, 'review paging core must retain its stable paging epoch');
assert.match(pageSizeModule, /PAGE_SIZE = 300/, 'source search envelope must retain the 300-row non-FEC page size');
assert.match(pageSizeModule, /FEC_BOUNDARY_PAGE_SIZE = 100/, 'FEC search envelope must stay to one provider page per boundary');
assert.match(pagingCore, /PAGE_SIZE = 300/, 'Contributions UI must paginate at 300 cards');
assert.match(pagingCore, /data-review-page/, 'Contributions pagination must expose clickable page numbers');
assert.match(pagingCore, /Previous contribution page/, 'Contributions pagination must expose previous navigation');
assert.match(pagingCore, /Next contribution page/, 'Contributions pagination must expose next navigation');
assert.match(pagingCss, /review-pagination/, 'Contributions pager must have its own compact stylesheet');
assert.doesNotMatch(`${bootstrap}\n${pagingEntry}\n${pagingCore}\n${pageSizeModule}`, /indexedDB\.deleteDatabase|localStorage\.clear|sessionStorage\.clear/, 'asset eviction must never destroy local dossier custody');

assert.equal(GIVING_FUNCTION_MAX_DURATION_SECONDS, 30, 'Giving function code must match the explicit 30-second Vercel override');
assert.equal(GIVING_SEARCH_MIN_TIMEOUT_MS, 58_000, 'browser may remain patient while the server settles inside its own bounded envelope');
assert.equal(MAX_SOURCE_PAGE_SIZE, 300, 'Giving source pages must admit the 300-record UI page');
assert.equal(_fecInternals.FEC_GIVING_PAGE_BUDGET_MS, 27_000, 'FEC must settle before the 30-second Vercel wall');
assert.equal(_fecInternals.FEC_UPSTREAM_TIMEOUT_MS, 24_000, 'one OpenFEC request must leave serialization/fallback margin');
assert.equal(_fecInternals.FEC_UPSTREAM_PAGE_SIZE, 100, 'OpenFEC provider pages stay at the provider-friendly 100-row size');
assert.ok(_fecInternals.FEC_GIVING_PAGE_BUDGET_MS < GIVING_FUNCTION_MAX_DURATION_SECONDS * 1000, 'server FEC budget must stay below the platform wall');

let fecCalls = 0;
const broadFec = await searchSourcePage({
  source_instance_id: 'fec-schedule-a',
  query: { name: 'Jane Doe', start_date: '2020-01-01', end_date: '2026-08-12', page_size: 300 }
}, {
  fetchImpl: async (url) => {
    fecCalls += 1;
    const value = String(url);
    assert.match(value, /per_page=100/);
    assert.match(value, /min_date=2020-01-01/);
    assert.match(value, /max_date=2026-08-12/);
    assert.doesNotMatch(value, /per_page=25/, 'the retired 25-row common-name cap must stay gone');
    assert.doesNotMatch(value, /two_year_transaction_period=/, 'broad date windows must not repeat transaction-period filters');
    return mockResponse({ json: { pagination: { last_indexes: null }, results: [] } });
  }
});
assert.equal(fecCalls, 1);
assert.equal(broadFec.source_status, 'READY');

let aggregateFecCalls = 0;
const aggregatedFec = await searchSourcePage({
  source_instance_id: 'fec-schedule-a',
  query: { name: 'Common Name', start_date: '2020-01-01', end_date: '2026-08-12', page_size: 300 }
}, {
  fetchImpl: async (url) => {
    aggregateFecCalls += 1;
    const page = aggregateFecCalls;
    const parsed = new URL(String(url));
    assert.equal(parsed.searchParams.get('per_page'), '100');
    if (page > 1) assert.equal(parsed.searchParams.get('last_index'), `cursor-${page - 1}`);
    const results = Array.from({ length: 100 }, (_, index) => ({
      sub_id: `${page}-${index}`,
      contributor_name: 'COMMON, NAME',
      contribution_receipt_amount: 10 + index,
      contribution_receipt_date: `2026-08-${String((index % 28) + 1).padStart(2, '0')}`,
      committee: { name: 'Example Committee' },
      committee_id: 'C00000001'
    }));
    return mockResponse({ json: { pagination: { last_indexes: { last_index: `cursor-${page}` } }, results } });
  }
});
assert.equal(aggregateFecCalls, 3, 'server adapter still supports three provider pages when explicitly requested outside the browser boundary shim');
assert.equal(aggregatedFec.records.length, 300, 'server adapter must retain the complete explicitly requested 300-record page');
assert.ok(aggregatedFec.continuation, 'a full 300-row server page must preserve seek continuation when more FEC evidence exists');

let multiStateFecCalls = 0;
await searchSourcePage({
  source_instance_id: 'fec-schedule-a',
  query: { name: 'Jane Doe', states: ['FL', 'GA', 'MA', 'DC'], start_date: '2020-01-01', end_date: '2026-08-12', page_size: 300 }
}, {
  fetchImpl: async (url) => {
    multiStateFecCalls += 1;
    const parsed = new URL(String(url));
    assert.deepEqual(parsed.searchParams.getAll('contributor_state'), ['FL', 'GA', 'MA', 'DC']);
    return mockResponse({ json: { pagination: { last_indexes: null }, results: [] } });
  }
});
assert.equal(multiStateFecCalls, 1, 'multi-state FEC filter remains one upstream request when the provider returns no rows');

const floridaTsv = 'Committee Name\tContributor Name\tContributor Address\tContributor City\tContributor State\tContributor Zip\tContribution Date\tAmount\tAmendment\nNeighbors for Florida\tDOE JANE Q\t1 Main St\tTallahassee\tFL\t32301\t08/01/2026\t20.00\tN';
let floridaCalls = 0;
const florida = await searchSourcePage({
  source_instance_id: 'florida-state-contributions',
  query: { name: 'Jane Doe', exact_match: true, start_date: '2020-01-01', end_date: '2026-08-12', page_size: 300 }
}, {
  fetchImpl: async (_url, options) => {
    floridaCalls += 1;
    assert.match(options.body, /cfname=Jane/);
    assert.match(options.body, /clname=Doe/);
    assert.doesNotMatch(options.body, /clname=Jane\+Doe/, 'a person name must not be posted wholesale into Florida last/company');
    return mockResponse({ text: floridaTsv });
  }
});
assert.equal(floridaCalls, 1, 'ordinary Florida contributor search must remain one bounded upstream POST');
assert.equal(florida.records.length, 1);
assert.equal(florida.records[0].contributor_name_raw, 'DOE, JANE Q', 'Florida person display must use LAST, FIRST MIDDLE comma order');
assert.equal(florida.records[0].address, '1 Main St');
assert.equal(florida.records[0].city, 'Tallahassee');
assert.equal(florida.records[0].state, 'FL');
assert.equal(florida.records[0].zip, '32301');

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
  query: { name: 'John Doe', exact_match: true, start_date: '2020-01-01', end_date: '2026-08-12', page_size: 300 }
}, {
  fetchImpl: async (_url, options) => {
    voterFocusCalls += 1;
    assert.match(options.body, /c_lastname=Doe/);
    return mockResponse({ text: `${headers17.join(',')}\n${row17.join(',')}` });
  }
});
assert.equal(voterFocusCalls, 1, 'VoterFocus must stop after the first donor projection returns evidence');
assert.equal(voterFocus.records.length, 1);
assert.equal(voterFocus.records[0].contributor_name_raw, 'DOE, JOHN');
assert.equal(voterFocus.records[0].address, '1 Main St');

const row17FirstOnly = [
  'Jane for Tallahassee', 'Jane Candidate', 'Tallahassee City Commission', '2010 General', 'M7',
  'JOHN', '1 Main St', 'Tallahassee', 'FL', '32301', 'Acme',
  'Engineer', '08/10/2010', 'CHE', '100.00', 'N', 'report-first-only'
];
const voterFocusFirstOnly = await searchSourcePage({
  source_instance_id: 'voterfocus-leon',
  query: { name: 'John Doe', exact_match: true, start_date: '2020-01-01', end_date: '2026-08-12', page_size: 300 }
}, {
  fetchImpl: async () => mockResponse({ text: `${headers17.join(',')}\n${row17FirstOnly.join(',')}` })
});
assert.equal(voterFocusFirstOnly.records.length, 1);
assert.equal(voterFocusFirstOnly.records[0].contributor_name_raw, 'DOE, JOHN');
assert.equal(voterFocusFirstOnly.records[0].evidence_status, 'DERIVED');
assert.equal(voterFocusFirstOnly.records[0].lineage.voterfocus_exact_match_projection, 'QUERY_ASSISTED_FIRST_ONLY_SOURCE_ROW');

let easyVoteCalls = 0;
const easyVote = await searchSourcePage({
  source_instance_id: 'easyvote-lakeland',
  query: { name: 'Jane Doe', exact_match: true, start_date: '2020-01-01', end_date: '2026-08-12', page_size: 100 }
}, {
  fetchImpl: async (url, options) => {
    easyVoteCalls += 1;
    assert.equal(options.headers.Origin, 'https://cityoflakelandfl.easyvotecampaignfinance.com');
    assert.equal(options.headers.Referer, 'https://cityoflakelandfl.easyvotecampaignfinance.com/');
    if (easyVoteCalls === 1) {
      assert.match(String(url), /getwebsiteuser\/cityoflakelandfl$/);
      return mockResponse({ json: { UserId: 'u-1', CustomerId: 'c-1', ZumoToken: null } });
    }
    assert.equal(options.headers['Easy-Vote-Authenticated-User'], 'UserId:u-1|CustomerId:c-1|ZumoToken:null');
    return mockResponse({
      json: {
        data: [{
          Contributor: {
            FirstName: 'Jane', MiddleName: 'Q', LastName: 'Doe',
            Address: { AddressLine1: '9 Lake Ave', City: 'Lakeland', State: 'FL', ZipCode: '33801' }
          },
          Amount: 25,
          ContributionDate: '2026-08-01'
        }],
        hasNextPage: false
      }
    });
  }
});
assert.equal(easyVoteCalls, 2, 'EasyVote tenant remains bootstrap-plus-search when the preferred public tenant succeeds');
assert.equal(easyVote.source_status, 'READY');
assert.equal(easyVote.records.length, 1);
assert.equal(easyVote.records[0].contributor_name_raw, 'DOE, JANE Q');
assert.equal(easyVote.records[0].address, '9 Lake Ave');
assert.equal(easyVote.records[0].city, 'Lakeland');
assert.equal(easyVote.records[0].state, 'FL');
assert.equal(easyVote.records[0].zip, '33801');

const easyVoteObservedUrls = [];
const easyVoteFallback = await searchSourcePage({
  source_instance_id: 'easyvote-safety-harbor',
  query: { name: 'Jane Doe', start_date: '2020-01-01', end_date: '2026-08-12', page_size: 100 }
}, {
  fetchImpl: async (url, options = {}) => {
    const value = String(url);
    easyVoteObservedUrls.push(value);
    if (easyVoteObservedUrls.length === 1) {
      assert.match(value, /getwebsiteuser\/cityofsafetyharborfl$/);
      assert.equal(options.headers.Origin, 'https://cityofsafetyharborfl.easyvotecampaignfinance.com');
      return mockResponse({ json: { data: { UserId: 'u-city', CustomerId: 'c-city', ZumoToken: null } } });
    }
    if (easyVoteObservedUrls.length === 2) {
      assert.match(value, /advancedsearch\/contributions\/c-city/);
      assert.equal(options.headers.Origin, 'https://cityofsafetyharborfl.easyvotecampaignfinance.com');
      return mockResponse({ status: 403, json: {} });
    }
    if (easyVoteObservedUrls.length === 3) {
      assert.match(value, /getwebsiteuser\/safetyharborfl$/);
      assert.equal(options.headers.Origin, 'https://safetyharborfl.easyvotecampaignfinance.com');
      return mockResponse({ json: { data: { UserId: 'u-old', CustomerId: 'c-old', ZumoToken: 'zumo-token-2' } } });
    }
    assert.match(value, /advancedsearch\/contributions\/c-old/);
    assert.equal(options.headers.Origin, 'https://safetyharborfl.easyvotecampaignfinance.com');
    assert.equal(options.headers.Referer, 'https://safetyharborfl.easyvotecampaignfinance.com/');
    assert.equal(options.headers['Easy-Vote-Authenticated-User'], 'UserId:u-old|CustomerId:c-old|ZumoToken:zumo-token-2');
    assert.equal(options.headers['X-ZUMO-AUTH'], 'zumo-token-2');
    return mockResponse({
      json: {
        data: [{ ContributorName: 'Jane Doe', Amount: 25, ContributionDate: '2026-08-01' }],
        hasNextPage: false
      }
    });
  }
});
assert.equal(easyVoteObservedUrls.length, 4, 'EasyVote must retry the alternate tenant after contribution-search failure, not only bootstrap failure');
assert.equal(easyVoteFallback.source_status, 'READY');
assert.equal(easyVoteFallback.records.length, 1);
assert.equal(easyVoteFallback.records[0].amount_cents, 2500);

console.log('giving-source-budget-hotfix.test.mjs passed');
