import assert from 'node:assert/strict';
import {
  IDENTITY_STATUS,
  committeeLedger,
  createDossier,
  exactNameMatch,
  identityPairScore,
  parseMoneyToCents,
  setIdentityDecision,
  suggestIdentityClusters
} from '../app/giving/history/giving-model.js';

assert.equal(parseMoneyToCents('$1,000.00'), 100000);
assert.equal(parseMoneyToCents('(25.125)'), -2513);
assert.equal(parseMoneyToCents('-0.01'), -1);
assert.equal(parseMoneyToCents(19.995), 2000);

assert.equal(exactNameMatch('DOE, JANE', 'Jane Doe'), true, 'comma-order names normalize to the same exact identity string');
assert.equal(exactNameMatch('Jane A. Doe', 'Jane Doe'), false, 'middle-name differences remain meaningful for Exact Match');
assert.equal(exactNameMatch('Jane Doe Jr', 'Jane Doe'), false, 'suffix differences remain meaningful for Exact Match');
assert.equal(createDossier({ query: { name: 'Jane Doe', exact_match: true } }).query.exact_match, true);

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

console.log('giving-client-model.test.mjs passed');
