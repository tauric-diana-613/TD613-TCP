import assert from 'node:assert/strict';
import { searchCommitteeActivity, _committeeActivityInternals } from '../server/giving/committee-activity.js';

let observedUrl = null;
const fetchImpl = async (url) => {
  observedUrl = new URL(String(url));
  return new Response(JSON.stringify({
    results: [{
      committee: { name: 'Precision Committee' },
      recipient_name: 'Vendor One',
      disbursement_date: '2026-02-03',
      disbursement_amount: 412.5,
      disbursement_description: 'Printing',
      sub_id: '1234'
    }]
  }), { status: 200, headers: { 'content-type': 'application/json' } });
};

const result = await searchCommitteeActivity({
  source_instance_id: 'fec-schedule-a',
  activity_type: 'EXPENDITURES',
  query: {
    committee: 'C12345678',
    start_date: '2026-01-01',
    end_date: '2026-08-15',
    page_size: 25
  }
}, { fetchImpl });

assert.equal(observedUrl.pathname, '/v1/schedules/schedule_b/');
assert.equal(observedUrl.searchParams.get('committee_id'), 'C12345678');
assert.equal(result.schema, 'td613.giving.committee-activity/v1');
assert.equal(result.storage_semantics, 'TRANSIENT_SEPARATE_CAMPAIGN_ACTIVITY_NOT_DONOR_GIVING_HISTORY');
assert.equal(result.records[0].activity_type, 'EXPENDITURES');
assert.equal(result.records[0].counterparty, 'Vendor One');
assert.equal(result.records[0].amount_cents, 41250);
assert.doesNotMatch(result.records[0].source_locator, /api_key=/);
assert.equal(result.page_boundary_reached, false);

const boundaryResult = await searchCommitteeActivity({
  source_instance_id: 'fec-schedule-a',
  activity_type: 'EXPENDITURES',
  query: { committee: 'C12345678', page_size: 1 }
}, { fetchImpl });
assert.equal(boundaryResult.page_boundary_reached, true);
assert.equal(boundaryResult.results_may_be_incomplete, true);
assert.match(boundaryResult.coverage_warning, /More rows may exist/);
assert.match(boundaryResult.source_browse_url, /^https:\/\//);

await assert.rejects(() => searchCommitteeActivity({
  source_instance_id: 'fec-schedule-a',
  activity_type: 'CONTRIBUTIONS',
  query: { committee: 'C12345678', page_size: 25 }
}, {
  fetchImpl: async () => new Response('upstream unavailable', { status: 503 })
}), /OpenFEC returned HTTP 503/);

const contributionPage = await searchCommitteeActivity({
  source_instance_id: 'fec-schedule-a',
  activity_type: 'CONTRIBUTIONS',
  query: { committee: 'C12345678', page_size: 1 }
}, {
  fetchImpl: async () => new Response(JSON.stringify({
    pagination: { last_indexes: { last_index: 'sub-next', last_contribution_receipt_date: '2026-08-01' } },
    results: [{
      sub_id: 'sub-next', transaction_id: 'txn-next', amendment_indicator: 'N', committee_name: 'Precision Committee',
      contributor_name: 'DOE, JANE', contribution_receipt_date: '2026-08-01', contribution_receipt_amount: 25
    }]
  }), { status: 200, headers: { 'content-type': 'application/json' } })
});
assert.ok(contributionPage.continuation, 'committee contribution activity preserves the source continuation token');
assert.equal(contributionPage.page_boundary_reached, true);
assert.equal(contributionPage.source_status, 'READY');

await assert.rejects(() => searchCommitteeActivity({
  source_instance_id: 'fec-schedule-a',
  activity_type: 'EXPENDITURES',
  query: { committee: 'not-a-fec-id' }
}, { fetchImpl }), /selecting an exact FEC committee identity/i);

const mapped = _committeeActivityInternals.fromGenericExpenditureRow({
  CandidateCommitteeName: 'Local Committee',
  PayeeOrganizationName: 'Local Vendor',
  DistributionDate: '2026-04-05',
  DistributionAmount: 99.95,
  OfficeName: 'Mayor'
}, {
  id: 'easyvote-test',
  family: 'EASYVOTE',
  custodian: 'Test City',
  jurisdiction: 'Test City, Florida',
  locator: 'https://example.test'
});
assert.equal(mapped.filer, 'Local Committee');
assert.equal(mapped.counterparty, 'Local Vendor');
assert.equal(mapped.amount_cents, 9995);

console.log('giving-committee-activity.test.mjs passed');

