import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { createDossier } from '../app/giving/history/giving-model.js';
import {
  decryptDossier,
  encryptDossier,
  fromHostedVaultRow,
  toHostedVaultPayload
} from '../app/giving/history/giving-vault.js';

if (!globalThis.btoa) globalThis.btoa = (value) => Buffer.from(value, 'binary').toString('base64');
if (!globalThis.atob) globalThis.atob = (value) => Buffer.from(value, 'base64').toString('binary');

const dossier = createDossier({ title: 'Vault contract', custody: 'HYBRID' });
dossier.records.push({ local_digest: 'private-record', contributor_name_raw: 'Test Person', amount_cents: 61300 });
const passphrase = 'correct horse aperture battery';

const first = await encryptDossier(dossier, passphrase, { cryptoImpl: webcrypto, iterations: 1000, versionId: 'version-one' });
const second = await encryptDossier(dossier, passphrase, { cryptoImpl: webcrypto, iterations: 1000, versionId: 'version-two' });
assert.notEqual(first.crypto.payload_iv, second.crypto.payload_iv, 'every dossier version receives a unique payload IV');
assert.notEqual(first.wrapped_key, second.wrapped_key, 'every version receives a fresh wrapped content key');
assert.deepEqual(await decryptDossier(first, passphrase, { cryptoImpl: webcrypto }), dossier);
await assert.rejects(() => decryptDossier(first, 'wrong passphrase value', { cryptoImpl: webcrypto }), /authentication failed/);

const tampered = { ...first, ciphertext: `${first.ciphertext.slice(0, -2)}AA` };
await assert.rejects(() => decryptDossier(tampered, passphrase, { cryptoImpl: webcrypto }), /authentication failed/);

const hosted = toHostedVaultPayload(first, {
  parentVersionId: 'version-zero',
  custodyMode: 'HYBRID'
});
assert.equal(hosted.dossier_id, dossier.id);
assert.equal(hosted.version_id, 'version-one');
assert.equal(hosted.parent_version_id, 'version-zero');
assert.equal(hosted.content_digest.length, 64);
assert.equal(hosted.crypto.algorithm, 'AES-GCM-256');
assert.ok(!JSON.stringify(hosted).includes('Test Person'), 'hosted payload contains no dossier plaintext');

const reconstructed = fromHostedVaultRow({
  ...hosted,
  crypto: hosted.crypto,
  created_at: new Date().toISOString()
});
assert.deepEqual(await decryptDossier(reconstructed, passphrase, { cryptoImpl: webcrypto }), dossier);

console.log('giving-client-vault.test.mjs passed');
