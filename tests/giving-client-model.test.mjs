import assert from 'node:assert/strict';
import {
  IDENTITY_STATUS,
  addSearchPage,
  committeeLedger,
  createDossier,
  exactNameMatch,
  identityPairScore,
  parseMoneyToCents,
  recordBelongsToTarget,
  searchTargetFromQuery,
  setIdentityDecision,
  suggestIdentityClusters
} from '../app/giving/history/giving-model.js';
import { buildDossierXlsx } from '../app/giving/history/giving-xlsx.js';

assert.equal(parseMoneyToCents('$1,000.00'), 100000);
assert.equal(parseMoneyToCents('(25.125)'), -2513);
assert.equal(parseMoneyToCents('-0.01'), -1);
assert.equal(parseMoneyToCents(19.995), 2000);

assert.equal(exactNameMatch('DOE, JANE', 'Jane Doe'), true, 'comma-order names normalize to the same exact identity string');
assert.equal(exactNameMatch('DOE, JANE A', 'Jane Doe'), true, 'source middle initials remain admissible when the submitted name omits middle evidence');
assert.equal(exactNameMatch('Jane A Doe', 'Jane Doe'), true, 'an omitted middle name is unspecified rather than contradictory');
assert.equal(exactNameMatch('DOE JANE', 'Jane Doe'), true, 'municipal last-first names without commas remain exact matches');
assert.equal(exactNameMatch('DOE JANE A', 'Jane Doe'), true, 'municipal last-first names with source middle initials remain exact matches');
assert.equal(exactNameMatch('DOE JANE A', 'Jane B Doe'), false, 'reversed source order still rejects conflicting explicit middle evidence');
assert.equal(exactNameMatch('Jane A Doe', 'Jane B Doe'), false, 'conflicting explicit middle names remain a failed Exact Match');
assert.equal(exactNameMatch('Jane Doe Jr', 'Jane Doe'), false, 'suffix differences remain meaningful for Exact Match');
assert.equal(createDossier({ query: { name: 'Jane Doe', exact_match: true } }).query.exact_match, true);
assert.equal(createDossier().title, 'Untitled contributor research', 'a fresh local research container never impersonates a pre-existing dated file');

const records = [
  {
    local_digest: 'fec-a', contributor_name_raw: 'RIVERA, SAMUEL J', address: '100 Palm Ave', city: 'Tampa', state: 'FL', zip: '33602',
    employer: 'Harbor Works', committee: 'Neighbors for Transit', jurisdiction: 'Federal', office: 'Congress', cycle: 2026, amount_cents: 25000
  },
  {
    local_digest: 'fl-b', contributor_name_raw: 'Samuel J Rivera', address: '100 Palm Avenue', city: 'Tampa', state: 'FL', zip: '33602',
    employer: 'Harbor Works', committee: 'Neighbors for Transit', jurisdiction: 'Florida', office: 'Mayor', cycle: 2025, amount_cents: 10000,
    lineage: { analytical_total_status: 'PROVISIONAL' }
  },
  {
    local_digest: 'other-c', contributor_name_raw: 'Samuel Rivera Jr', city: 'Jacksonville', state: 'FL', zip: '32202',
    committee: 'Duval Future', jurisdiction: 'Duval', office: 'Council', cycle: 2027, amount_cents: 5000
  }
];

const comparison = identityPairScore(records[0], records[1]);
assert.ok(comparison.score >= 0.42);
assert.ok(comparison.reasons.includes('same ZIP'));
assert.ok(suggestIdentityClusters(records).some((cluster) => cluster.members.includes('fec-a') && cluster.members.includes('fl-b')));

let dossier = createDossier({ title: 'Samuel Rivera' });
dossier.records = records;
dossier.decisions = Object.fromEntries(records.map((record) => [record.local_digest, IDENTITY_STATUS.UNREVIEWED]));
assert.deepEqual(committeeLedger(dossier), [], 'unreviewed records never enter totals');

dossier = setIdentityDecision(dossier, 'fec-a', IDENTITY_STATUS.CONFIRMED);
dossier = setIdentityDecision(dossier, 'fl-b', IDENTITY_STATUS.CANDIDATE);
dossier = setIdentityDecision(dossier, 'other-c', IDENTITY_STATUS.EXCLUDED);
let ledger = committeeLedger(dossier);
assert.equal(ledger.length, 1);
assert.equal(ledger[0].amount_cents, 25000, 'candidate and excluded rows remain outside totals');

dossier = setIdentityDecision(dossier, 'fl-b', IDENTITY_STATUS.CONFIRMED);
ledger = committeeLedger(dossier);
assert.equal(ledger.reduce((sum, row) => sum + row.amount_cents, 0), 35000);
assert.ok(ledger.some((row) => row.provisional), 'uncertain source lineage remains visibly provisional');

const firstQuery = { name: 'Samuel Rivera', aliases: ['Samuel J Rivera'], hints: 'Tampa', date_from: '2020-01-01', date_to: '2026-08-12' };
const secondQuery = { name: 'Samantha Rivera', hints: 'Jacksonville', date_from: '2020-01-01', date_to: '2026-08-12' };
const firstTarget = searchTargetFromQuery(firstQuery);
const sameFirstTarget = searchTargetFromQuery({ ...firstQuery });
const secondTarget = searchTargetFromQuery(secondQuery);
assert.equal(firstTarget.id, sameFirstTarget.id, 'the same contact search parameters produce the same stable target');
assert.notEqual(firstTarget.id, secondTarget.id, 'different contact targets remain distinct');

let partitioned = createDossier({ title: 'Contact queue', query: firstQuery });
partitioned = addSearchPage(partitioned, 'fec-schedule-a', {
  records: [{ local_digest: 'shared-row', contributor_name_raw: 'RIVERA, SAMUEL J', committee: 'Committee One', amount_cents: 10000 }]
}, { state: 'READY' });
assert.equal(partitioned.search_targets.length, 1);
assert.equal(recordBelongsToTarget(partitioned.records[0], firstTarget.id), true);

partitioned = { ...partitioned, query: secondQuery };
partitioned = addSearchPage(partitioned, 'fec-schedule-a', {
  records: [
    { local_digest: 'second-row', contributor_name_raw: 'RIVERA, SAMANTHA', committee: 'Committee Two', amount_cents: 20000 },
    { local_digest: 'shared-row', contributor_name_raw: 'RIVERA, SAMUEL J', committee: 'Committee One', amount_cents: 10000 }
  ]
}, { state: 'READY' });
assert.equal(partitioned.search_targets.length, 2);
const sharedRow = partitioned.records.find((record) => record.local_digest === 'shared-row' || record.digest === 'shared-row');
assert.equal(recordBelongsToTarget(sharedRow, firstTarget.id), true);
assert.equal(recordBelongsToTarget(sharedRow, secondTarget.id), true, 'one source row can support more than one retrieval target without duplication');
assert.equal(partitioned.records.filter((record) => (record.local_digest || record.digest) === 'shared-row').length, 1);

partitioned.decisions = Object.fromEntries(partitioned.records.map((record) => [record.digest || record.local_digest, IDENTITY_STATUS.CONFIRMED]));
assert.equal(committeeLedger(partitioned, firstTarget.id).length, 1);
assert.equal(committeeLedger(partitioned, secondTarget.id).length, 2, 'Campaign Deputy committee scope can be computed per Giving contact target');

const isolatedClusters = suggestIdentityClusters([
  { local_digest: 'target-a', contributor_name_raw: 'Alex Jordan', city: 'Tampa', state: 'FL', search_target_ids: ['target-one'] },
  { local_digest: 'target-b', contributor_name_raw: 'Alex Jordan', city: 'Tampa', state: 'FL', search_target_ids: ['target-two'] }
]);
assert.equal(isolatedClusters.length, 0, 'identity clustering never bridges two unrelated queued contact targets');

const stressRecords = Array.from({ length: 600 }, (_, index) => ({
  local_digest: `stress-${index}`,
  contributor_name_raw: 'Alex Common',
  address: `${100 + (index % 30)} Test Ave`,
  city: 'Jacksonville',
  state: 'FL',
  zip: '32202',
  employer: `Fixture Employer ${index % 12}`,
  search_target_ids: ['stress-target']
}));
const stressClusters = suggestIdentityClusters(stressRecords);
assert.equal(stressClusters.length, 1, 'a large same-name practice field remains connected under bounded candidate windows');
assert.equal(stressClusters[0].members.length, stressRecords.length);
assert.ok(
  stressClusters[0].comparisons.length <= (stressRecords.length * 24) / 2,
  'bounded clustering never materializes the quadratic all-record pair field'
);

const workbook = buildDossierXlsx(partitioned);
assert.ok(workbook instanceof Uint8Array);
assert.deepEqual([...workbook.slice(0, 4)], [0x50, 0x4b, 0x03, 0x04], 'XLSX begins with a ZIP local-file signature');
const workbookText = new TextDecoder().decode(workbook);
assert.match(workbookText, /Giving Records/);
assert.match(workbookText, /Search Target/);
assert.match(workbookText, /Committee One/);

console.log('giving-client-model.test.mjs passed');