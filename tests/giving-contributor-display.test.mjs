import assert from 'node:assert/strict';
import { exactNameMatch } from '../app/giving/history/giving-model.js';
import {
  normalizeEasyVoteRow,
  normalizeFecRow,
  normalizeFloridaRow,
  normalizeVoterFocusRow
} from '../server/giving/normalize.js';

const retrievedAt = '2026-08-12T20:00:00.000Z';
const queryDigest = 'display-normalization-test';
const source = (id, family) => ({
  id,
  family,
  custodian: `${family} test custodian`,
  jurisdiction: 'Florida',
  locator: 'https://example.test/source'
});

const fec = normalizeFecRow({
  sub_id: 'fec-1',
  transaction_id: 'txn-1',
  amendment_indicator: 'N',
  entity_type: 'IND',
  committee_name: 'Committee A',
  contributor_name: 'DOE, JANE A',
  contribution_receipt_date: '2026-08-01',
  contribution_receipt_amount: 25
}, { source: source('fec-schedule-a', 'FEC'), queryDigest, retrievedAt });

const florida = normalizeFloridaRow({
  'Committee Name': 'Committee A',
  'Contributor Name': 'Jane A Doe',
  'Contributor Type': 'Individual',
  'Contribution Date': '08/01/2026',
  Amount: '25.00',
  Amendment: 'N'
}, { source: source('florida-state-contributions', 'FLORIDA'), queryDigest, retrievedAt });

const voterFocus = normalizeVoterFocusRow({
  'Candidate/Committee': 'Committee A',
  'Last Name/Company Name': 'DOE',
  'First Name': 'JANE',
  'Middle Name': 'A',
  'Item Date': '08/01/2026',
  Amount: '25.00',
  Amendment: 'N'
}, { source: source('voterfocus-duval', 'VOTERFOCUS'), queryDigest, retrievedAt });

const easyVote = normalizeEasyVoteRow({
  CandidateCommitteeName: 'Committee A',
  ContributorName: 'Jane A Doe',
  ContributorType: 'Individual',
  ContributionDate: '2026-08-01',
  Amount: 25,
  Amendment: 'N'
}, { source: source('easyvote-lakeland', 'EASYVOTE'), queryDigest, retrievedAt });

for (const record of [fec, florida, voterFocus, easyVote]) {
  assert.equal(record.contributor_name_raw, 'DOE, JANE A', 'all admitted person records feed one LAST, FIRST MIDDLE display form into Giving');
  assert.equal(record.contributor_name_display, 'DOE, JANE A');
  assert.equal(record.contributor_name_parsed.display, 'DOE, JANE A');
  assert.equal(record.lineage.contributor_display_policy, 'LAST_COMMA_FIRST_MIDDLE_SUFFIX_UPPER');
  assert.equal(exactNameMatch(record.contributor_name_raw, 'Jane Doe'), true, 'Exact Match retains source rows whose only extra name evidence is a middle name or initial');
}

assert.equal(fec.source_contributor_name_raw, 'DOE, JANE A');
assert.equal(florida.source_contributor_name_raw, 'Jane A Doe', 'state source spelling/order remains preserved separately');
assert.equal(voterFocus.source_contributor_name_raw, 'DOE, JANE A');
assert.equal(easyVote.source_contributor_name_raw, 'Jane A Doe', 'municipal source spelling/order remains preserved separately');
assert.equal(florida.raw_source_row['Contributor Name'], 'Jane A Doe', 'raw source row remains untouched');
assert.equal(easyVote.raw_source_row.ContributorName, 'Jane A Doe', 'raw municipal row remains untouched');

const organization = normalizeFloridaRow({
  'Committee Name': 'Committee A',
  'Contributor Name': 'Planned Parenthood',
  'Contributor Type': 'Organization',
  'Contribution Date': '08/01/2026',
  Amount: '50.00',
  Amendment: 'N'
}, { source: source('florida-state-contributions', 'FLORIDA'), queryDigest, retrievedAt });
assert.equal(organization.contributor_name_raw, 'Planned Parenthood', 'organization names are never reversed into person-name order');
assert.equal(organization.source_contributor_name_raw, 'Planned Parenthood');
assert.equal(organization.contributor_name_parsed.kind, 'ORGANIZATION');
assert.equal(organization.lineage.contributor_display_policy, 'SOURCE_PRESERVED_ORGANIZATION');

const uncertainTwoToken = normalizeEasyVoteRow({
  CandidateCommitteeName: 'Committee A',
  ContributorName: 'Civic Future',
  ContributionDate: '2026-08-01',
  Amount: 10,
  Amendment: 'N'
}, { source: source('easyvote-lakeland', 'EASYVOTE'), queryDigest, retrievedAt });
assert.equal(uncertainTwoToken.contributor_name_raw, 'Civic Future', 'ambiguous untyped names preserve source order rather than guessing person order');
assert.equal(uncertainTwoToken.lineage.contributor_display_policy, 'SOURCE_PRESERVED_UNCERTAIN_PERSON_ORDER');

console.log('giving-contributor-display.test.mjs passed');