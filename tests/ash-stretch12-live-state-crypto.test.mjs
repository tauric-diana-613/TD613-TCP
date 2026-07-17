import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import {
  createEncryptedCaseEnvelope,
  openEncryptedCaseEnvelope,
  verifyEncryptedCaseEnvelope
} from '../app/engine/ash-stretch12-live-state-crypto.js';

const options = { cryptoImpl: webcrypto, TextEncoderImpl: TextEncoder, TextDecoderImpl: TextDecoder };
const envelope = await createEncryptedCaseEnvelope({
  caseId: 'case-encrypted-live-state',
  passphrase: 'a sufficiently long test passphrase',
  iterations: 600000,
  databaseVersion: 12,
  originManifestRoot: `sha256:${'a'.repeat(64)}`,
  custodyRootReference: 'custody-root-test',
  createdAt: '2026-07-17T20:00:00.000Z',
  records: [
    { recordId: 'case-map', recordClass: 'CASE_MAP', sequence: 1, body: { title: 'Protected investigation', nodes: ['n1', 'n2'], private: true } },
    { recordId: 'route-memory', recordClass: 'ROUTE_MEMORY', sequence: 2, body: { entries: [], unknowns: ['external deletion'] } }
  ]
}, options);

assert.equal(await verifyEncryptedCaseEnvelope(envelope, options), true);
assert.equal(envelope.plaintext_persisted, false);
assert.equal(envelope.passphrase_persisted, false);
assert.equal(envelope.derived_key_persisted, false);
assert.equal(JSON.stringify(envelope).includes('Protected investigation'), false);
assert.equal(new Set(envelope.records.map(record => record.iv_b64)).size, 2);

const opened = await openEncryptedCaseEnvelope(envelope, 'a sufficiently long test passphrase', options);
assert.equal(opened.records[0].body.title, 'Protected investigation');
assert.equal(opened.records[1].body.unknowns[0], 'external deletion');
assert.equal(opened.live_case_mutated, false);

await assert.rejects(() => openEncryptedCaseEnvelope(envelope, 'wrong passphrase', options), /LIVE_STATE_PASSPHRASE_OR_WRAP_HOLD/);
const tampered = JSON.parse(JSON.stringify(envelope));
tampered.records[0].ciphertext_b64 = `${tampered.records[0].ciphertext_b64.slice(0, -2)}AA`;
await assert.rejects(() => openEncryptedCaseEnvelope(tampered, 'a sufficiently long test passphrase', options), /LIVE_STATE_TAMPER_HOLD/);

console.log('ash-stretch12-live-state-crypto.test.mjs passed');
