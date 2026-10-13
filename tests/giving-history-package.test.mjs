import assert from 'node:assert/strict';
import { GivingError } from '../server/giving/util.js';
import { prepareGivingHistoryBatch } from '../server/giving/campaign-deputy-giving-history.js';

const baseRecord = {
  record_digest: 'record:abc12345',
  identity_status: 'CONFIRMED',
  committee_name: 'Example Committee',
  committee_id: 'C00123456',
  contributor: {
    first_name: 'Jane',
    last_name: 'Doe',
    organization_name: null,
    address_line_1: '123 Main St',
    address_city: 'Springfield',
    address_state: 'IL',
    address_zip: '62701',
    occupation: 'Attorney',
    employer: 'Doe & Associates'
  },
  contribution_date: '2026-07-15',
  amount_cents: 12500,
  cycle: 2026,
  election: 'Primary',
  jurisdiction: 'Federal',
  source_instance_id: 'fec-schedule-a',
  source_native_ids: { sub_id: 'sub-1', ignored_null: null },
  source_locator: 'https://www.fec.gov/data/receipts/',
  retrieved_at: '2026-08-14T12:00:00.000Z',
  query_digest: 'a'.repeat(64),
  amendment_status: 'A',
  lineage: { amendment_indicator: 'A', supersession_applied: false, provisional: false }
};

const batch = prepareGivingHistoryBatch({
  confirmed: true,
  dossier_id: 'dossier:example-1',
  person_id: 'person:exact-1',
  records: [baseRecord, baseRecord, {
    ...baseRecord,
    record_digest: 'record:def67890',
    committee_name: 'Local Committee Without Stable ID',
    committee_id: null,
    amount_cents: -2500,
    source_native_ids: { sequence_number: 'local-2' }
  }]
});

assert.equal(batch.status, 'HELD_AWAITING_CAMPAIGN_DEPUTY_GIVING_HISTORY_CONTRACT');
assert.equal(batch.external_mutation, false);
assert.equal(batch.campaign_deputy_contribution_endpoint_used, false);
assert.equal(batch.campaign_deputy_list_membership_written, false);
assert.equal(batch.record_count, 2);
assert.equal(batch.target_count, 1);
assert.equal(batch.targets[0].post_import_entity_match, 'REQUIRED_AND_HELD_FOR_SUPPORTED_API');
assert.equal(batch.duplicate_input_count, 1);
assert.equal(batch.committees.length, 2);
assert.equal(batch.records[0].committee.regulatory_id, 'C00123456');
assert.equal(batch.records[1].committee.identity_status, 'NAME_ONLY_REQUIRES_CAMPAIGN_DEPUTY_MATCH');
assert.equal(batch.records[1].amount_cents, -2500, 'refunds remain signed individual records');
assert.match(batch.batch_id, /^cdgh_[a-f0-9]{24}$/);
assert.match(batch.records[0].idempotency_key, /^[a-f0-9]{64}$/);
assert.equal(batch.records[0].provenance.amendment_status, 'A');
assert.equal(batch.records[0].provenance.lineage.supersession_applied, false);
assert.equal(batch.semantics.contribution, 'FORBIDDEN_DESTINATION_FOR_THIS_PACKAGE');
assert.equal(batch.contract_gate.release_allowed, false);
assert.deepEqual(batch.requested_contract_shape.target_modes, ['SINGLE_EXACT_PERSON', 'MULTI_CONTACT_EXACT_MATCH_BATCH']);
assert.equal(batch.requested_contract_shape.committee_behavior, 'MATCH_STABLE_ID_OR_CREATE_BEFORE_COMMITTEE_PARTITION_IMPORT');
assert.equal(batch.requested_contract_shape.ambiguous_person_behavior, 'HOLD_WITHOUT_CREATE_OR_MERGE');
assert.equal(batch.observed_product_contract.person_id_available_in_giving_history_mapping, false);

const multiBatch = prepareGivingHistoryBatch({
  confirmed: true,
  dossier_id: 'dossier:multi-1',
  targets: [
    { person_id: 'person:exact-1', dossier_target_id: 'target:one', exact_match: true, records: [baseRecord] },
    { person_id: 'person:exact-2', dossier_target_id: 'target:two', exact_match: true, records: [{ ...baseRecord, record_digest: 'record:multi-2', amount_cents: 5000 }] }
  ]
});
assert.equal(multiBatch.target_count, 2);
assert.equal(multiBatch.person_id, null);
assert.equal(multiBatch.record_count, 2);
assert.deepEqual(multiBatch.committees[0].target_person_ids, ['person:exact-1', 'person:exact-2']);

const aliasDuplicate = prepareGivingHistoryBatch({
  confirmed: true,
  dossier_id: 'dossier:alias-dedupe',
  person_id: 'person:exact-1',
  records: [baseRecord, { ...baseRecord, record_digest: 'record:alias-result', query_digest: 'b'.repeat(64) }]
});
assert.equal(aliasDuplicate.record_count, 1, 'the same stable source transaction returned by two searches is imported once');
assert.equal(aliasDuplicate.duplicate_input_count, 1);

const jurisdictionScoped = prepareGivingHistoryBatch({
  confirmed: true,
  dossier_id: 'dossier:jurisdictions',
  person_id: 'person:exact-1',
  records: [
    { ...baseRecord, committee_id: null, committee_name: 'Citizens Committee', jurisdiction: 'County A', source_instance_id: 'county-a', source_native_ids: { sequence_number: 'a-1' } },
    { ...baseRecord, committee_id: null, committee_name: 'Citizens Committee', jurisdiction: 'County B', source_instance_id: 'county-b', source_native_ids: { sequence_number: 'b-1' } }
  ]
});
assert.equal(jurisdictionScoped.committees.length, 2, 'name-only committees remain separated by jurisdiction/source namespace');

assert.throws(
  () => prepareGivingHistoryBatch({ confirmed: true, dossier_id: 'dossier:multi-2', targets: [{ person_id: 'person:1', dossier_target_id: 'target:1', exact_match: false, records: [baseRecord] }] }),
  (error) => error instanceof GivingError && error.code === 'giving-history-person-match-unconfirmed'
);

assert.throws(
  () => prepareGivingHistoryBatch({ confirmed: false, dossier_id: 'dossier:1', person_id: 'person:1', records: [baseRecord] }),
  (error) => error instanceof GivingError && error.code === 'giving-history-preparation-confirmation-required'
);
assert.throws(
  () => prepareGivingHistoryBatch({ confirmed: true, dossier_id: 'dossier:1', person_id: 'person:1', records: [{ ...baseRecord, identity_status: 'CANDIDATE' }] }),
  (error) => error instanceof GivingError && error.code === 'giving-history-identity-unconfirmed'
);
assert.throws(
  () => prepareGivingHistoryBatch({ confirmed: true, dossier_id: 'dossier:1', person_id: 'person:1', records: [{ ...baseRecord, contribution_date: '2026-02-30' }] }),
  (error) => error instanceof GivingError && error.code === 'invalid-giving-history-field'
);
assert.throws(
  () => prepareGivingHistoryBatch({ confirmed: true, dossier_id: 'dossier:1', person_id: 'person:1', records: [{ ...baseRecord, committee_name: null }] }),
  (error) => error instanceof GivingError && error.code === 'invalid-giving-history-field',
  'missing committee identity must be held instead of becoming a UI placeholder committee'
);

console.log('giving-history-package.test.mjs passed');
