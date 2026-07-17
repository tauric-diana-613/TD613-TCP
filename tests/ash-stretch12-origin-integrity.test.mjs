import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import {
  compileOriginManifest,
  compileOriginWitnessReceipt,
  signOriginManifest,
  verifyAssetBytes,
  verifyOriginManifest,
  verifyOriginSignature,
  verifyOriginWitnessReceipt
} from '../app/engine/ash-stretch12-origin-integrity.js';

const options = { cryptoImpl: webcrypto, TextEncoderImpl: TextEncoder, keyId: 'stretch12-test-key' };
const digest = async text => {
  const bytes = new TextEncoder().encode(text);
  const hash = await webcrypto.subtle.digest('SHA-256', bytes);
  return `sha256:${Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('')}`;
};
const assets = [
  { path: 'app/a.js', digest: await digest('alpha'), executable: true },
  { path: 'app/b.css', digest: await digest('beta'), executable: false }
];
const manifest = await compileOriginManifest({
  repository: 'tauric-diana-613/TD613-TCP',
  commit: 'aefa01d53a78207a2a08e682d62b925db12ea32e',
  releaseVersion: 'stretch12-candidate',
  createdAt: '2026-07-17T20:00:00.000Z',
  assets,
  dependencyLockDigest: `sha256:${'d'.repeat(64)}`,
  runtimeVersions: ['node-24'],
  reproducibilityPosture: 'CANDIDATE'
}, options);
assert.equal(await verifyOriginManifest(manifest, options), true);
assert.match(manifest.merkle_root, /^sha256:[0-9a-f]{64}$/);

const keyPair = await webcrypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
const signature = await signOriginManifest(manifest, keyPair.privateKey, options);
assert.equal(await verifyOriginSignature(manifest, signature, keyPair.publicKey, options), true);

const results = [
  await verifyAssetBytes(assets[0], new TextEncoder().encode('alpha'), options),
  await verifyAssetBytes(assets[1], new TextEncoder().encode('beta'), options)
];
assert.equal(results.every(result => result.valid), true);
const witness = await compileOriginWitnessReceipt({
  manifest,
  manifestReference: manifest.manifest_id,
  releaseKeyId: signature.key_id,
  signatureValid: true,
  assetResults: results,
  createdAt: '2026-07-17T20:00:00.000Z'
}, options);
assert.equal(await verifyOriginWitnessReceipt(witness, options), true);
assert.equal(witness.decision, 'ORIGIN_VERIFIED');
assert.equal(witness.endpoint_integrity_proven, false);

const altered = await verifyAssetBytes(assets[0], new TextEncoder().encode('altered'), options);
assert.equal(altered.valid, false);

console.log('ash-stretch12-origin-integrity.test.mjs passed');
