import assert from 'node:assert/strict';
import {
  CAMPAIGN_DEPUTY_GIVING_HISTORY_HEADERS,
  buildCampaignDeputyGivingHistoryBundle,
  campaignDeputyGivingHistoryCsv,
  campaignDeputyGivingHistoryRow,
  partitionCampaignDeputyGivingHistory
} from '../app/giving/history/giving-campaign-deputy-import.js';

const personRecord = {
  local_digest: 'record:person-1',
  contributor_name_raw: 'DOE, JANE',
  contributor_name_parsed: { kind: 'PERSON', given: 'JANE', family: 'DOE', display: 'DOE, JANE' },
  address: '123 Main St',
  city: 'Springfield',
  state: 'IL',
  zip: '62701',
  occupation: 'Attorney',
  employer: 'Doe & Associates',
  contribution_date: '2024-11-04',
  amount_cents: 50000,
  committee: 'Example Committee',
  committee_id: 'C00123456',
  cycle: 2024,
  election: 'General',
  office: 'Mayor',
  jurisdiction: 'Federal',
  source_instance_id: 'fec-schedule-a',
  source_native_ids: { sub_id: 'sub-1' }
};

const organizationRecord = {
  ...personRecord,
  local_digest: 'record:organization-1',
  contributor_name_raw: 'Patel Systems LLC',
  contributor_name_parsed: { kind: 'ORGANIZATION', organization: 'Patel Systems LLC', display: 'Patel Systems LLC' },
  amount_cents: 500000,
  committee: 'Second Committee',
  committee_id: null,
  election: 'Primary',
  jurisdiction: 'County A',
  source_instance_id: 'county-a',
  source_native_ids: { candidate_or_committee_id: 'VF-220' }
};

assert.deepEqual(CAMPAIGN_DEPUTY_GIVING_HISTORY_HEADERS, [
  'First Name', 'Last Name', 'Organization Name', 'Address Line 1', 'Address City', 'Address State',
  'Address Zip', 'Occupation', 'Employer', 'Transaction Date', 'Transaction Amount', 'Transaction Type'
]);
assert.deepEqual(campaignDeputyGivingHistoryRow(personRecord), [
  'JANE', 'DOE', '', '123 Main St', 'Springfield', 'IL', '62701', 'Attorney', 'Doe & Associates', '11/04/2024', '500.00', 'Contribution'
]);
assert.deepEqual(campaignDeputyGivingHistoryRow(organizationRecord).slice(0, 3), ['', '', 'Patel Systems LLC']);

const csv = campaignDeputyGivingHistoryCsv([personRecord]);
assert.ok(csv.startsWith('\ufeff"First Name","Last Name","Organization Name"'));
assert.match(csv, /"11\/04\/2024","500\.00","Contribution"/);

const partitions = partitionCampaignDeputyGivingHistory([organizationRecord, personRecord]);
assert.equal(partitions.length, 2, 'Campaign Deputy receives one import partition per Giving History committee');
assert.equal(partitions.find((partition) => partition.committee.name === 'Second Committee').committee.regulatory_id, 'VF-220', 'normalized nested committee IDs are preserved');

const deduplicatedPartitions = partitionCampaignDeputyGivingHistory([
  personRecord,
  { ...personRecord, local_digest: 'record:alias-search', query_digest: 'alias-query' }
]);
assert.equal(deduplicatedPartitions[0].records.length, 1, 'stable source-native transaction IDs collapse alias-search duplicates');

const jurisdictionPartitions = partitionCampaignDeputyGivingHistory([
  { ...organizationRecord, committee_id: null, source_native_ids: {}, committee: 'Citizens Committee', jurisdiction: 'County A', source_instance_id: 'county-a', local_digest: 'record:county-a' },
  { ...organizationRecord, committee_id: null, source_native_ids: {}, committee: 'Citizens Committee', jurisdiction: 'County B', source_instance_id: 'county-b', local_digest: 'record:county-b' }
]);
assert.equal(jurisdictionPartitions.length, 2, 'same-name committees in distinct jurisdictions remain separate import files');

const heldBatch = { batch_id: 'cdgh_example', status: 'HELD_AWAITING_CAMPAIGN_DEPUTY_GIVING_HISTORY_CONTRACT', records_digest: 'abc', targets: [{ person_id: 'person:1' }] };
const bundle = buildCampaignDeputyGivingHistoryBundle({ records: [personRecord, organizationRecord], title: 'Example Dossier', preparedBatch: heldBatch, targetMode: 'SINGLE_EXACT_PERSON' });
assert.equal(bundle.partitions.length, 2);
assert.equal(bundle.manifest.campaign_deputy_template.one_committee_per_import, true);
assert.equal(bundle.manifest.campaign_deputy_template.person_id_available_in_giving_history_mapping, false);
assert.equal(bundle.manifest.files.length, 2);
assert.match(bundle.filename, /example-dossier-campaign-deputy-giving-history\.zip/i);
const zipText = new TextDecoder().decode(bundle.bytes);
assert.match(zipText, /README\.txt/);
assert.match(zipText, /campaign-deputy-giving-history-manifest\.json/);
assert.match(zipText, /held-api-batch\.json/);
assert.match(zipText, /First Name/);

console.log('giving-campaign-deputy-import.test.mjs passed');
