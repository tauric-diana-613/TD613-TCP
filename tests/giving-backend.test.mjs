import assert from 'node:assert/strict';
import { amountToCents } from '../server/giving/util.js';
import { MUNICIPALITY_COVERAGE, SOURCE_INSTANCES, publicRegistry } from '../server/giving/registry.js';
import { normalizeFloridaRow } from '../server/giving/normalize.js';
import { sourceById } from '../server/giving/registry.js';
import {
  _sessionInternals,
  createSession,
  publicSessionView,
  requireIntentNonce,
  sessionConfiguration
} from '../server/giving/security.js';
import { _vaultInternals } from '../server/giving/vault.js';
import { GivingError } from '../server/giving/util.js';

assert.equal(SOURCE_INSTANCES.length, 23);
assert.equal(MUNICIPALITY_COVERAGE.length, 62);
assert.deepEqual(publicRegistry().family_counts, { FEC: 1, FLORIDA: 1, VOTERFOCUS: 10, EASYVOTE: 11 });
assert.ok(SOURCE_INSTANCES.some((source) => source.id === 'voterfocus-duval'));
assert.ok(SOURCE_INSTANCES.some((source) => source.id === 'voterfocus-leon'));

assert.equal(amountToCents('$1,234.56'), 123456);
assert.equal(amountToCents('(23.45)'), -2345);
assert.equal(amountToCents('-0.005'), -1);
assert.equal(amountToCents('not-money'), null);

const stateSource = sourceById('florida-state-contributions');
const normalized = normalizeFloridaRow({
  'Committee Name': 'Neighbors for Good',
  'Contributor Name': 'DOE, JANE A JR',
  'Contribution Date': '08/01/2026',
  Amount: '-25.50',
  Amendment: 'A',
  City: 'Tampa',
  State: 'FL'
}, {
  source: stateSource,
  queryDigest: 'q'.repeat(64),
  retrievedAt: '2026-08-11T12:00:00.000Z'
});
assert.equal(normalized.amount_cents, -2550);
assert.equal(normalized.identity_status, 'UNREVIEWED');
assert.equal(normalized.lineage.analytical_total_status, 'DETERMINISTIC_WITHIN_SOURCE_SEMANTICS');
assert.equal(normalized.contributor_name_parsed.family, 'DOE');
assert.equal(normalized.contributor_name_parsed.suffix, 'JR');

const provisional = normalizeFloridaRow({
  'Committee Name': 'Committee without stable amendment semantics',
  'Contributor Name': 'DOE, JANE',
  'Contribution Date': '08/01/2026',
  Amount: '10.00'
}, {
  source: stateSource,
  queryDigest: 'p'.repeat(64),
  retrievedAt: '2026-08-11T12:00:00.000Z'
});
assert.equal(provisional.lineage.analytical_total_status, 'PROVISIONAL');

process.env.TD613_GIVING_ACCESS_SECRET = 'access-secret-that-is-definitely-long-enough';
process.env.TD613_GIVING_SESSION_SECRET = 'session-signing-secret-that-is-distinct-and-long-enough';
assert.equal(sessionConfiguration().separate_authorities, true);
const created = createSession(process.env.TD613_GIVING_ACCESS_SECRET, 'https://td613.com');
const decoded = _sessionInternals.decodeSession(created.token, process.env.TD613_GIVING_SESSION_SECRET);
assert.equal(decoded.sid, created.payload.sid);
assert.equal(publicSessionView(decoded).authenticated, true);
assert.doesNotMatch(created.cookie, /access-secret/);
assert.match(created.cookie, /^__Host-td613-giving=/);
assert.match(created.cookie, /Secure; HttpOnly; SameSite=Strict/);
requireIntentNonce({ intent: { nonce: decoded.nonce } }, decoded);
assert.throws(() => requireIntentNonce({ intent: { nonce: 'wrong' } }, decoded), /session-bound intent nonce/);
assert.throws(
  () => _sessionInternals.decodeSession(`${created.token}x`, process.env.TD613_GIVING_SESSION_SECRET),
  /not valid/
);

const validCiphertext = {
  dossier_id: 'dossier_123',
  version_id: 'version_123',
  ciphertext: 'QUJDRA==',
  wrapped_key: { algorithm: 'AES-GCM', ciphertext: 'QUJDRA==', iv: 'aWtleQ==' },
  crypto: { algorithm: 'AES-GCM', iv: 'dW5pcXVl', schema: 'td613.giving.dossier/v1' },
  content_digest: 'a'.repeat(64),
  custody_mode: 'HOSTED'
};
assert.equal(_vaultInternals.validateCiphertextEnvelope(validCiphertext).versionId, 'version_123');
assert.throws(
  () => _vaultInternals.validateCiphertextEnvelope({ ...validCiphertext, donor_name: 'plaintext' }),
  (error) => error instanceof GivingError && error.code === 'vault-plaintext-withheld'
);
assert.throws(
  () => _vaultInternals.validateCiphertextEnvelope(validCiphertext, { resolving: true }),
  (error) => error instanceof GivingError && error.code === 'vault-resolution-incomplete'
);

console.log('giving-backend.test.mjs passed');
