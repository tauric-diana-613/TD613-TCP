import { canonicalBytes } from '../dome-world/ash/canonical-json.js';
import { freeze, randomId, recordDigest, text, uniqueStrings, verifyRecord } from './aperture-v31-core.js';

export const STRETCH12_ORIGIN_MANIFEST_SCHEMA = 'td613.ash.origin-manifest/v0.1';
export const STRETCH12_ORIGIN_WITNESS_SCHEMA = 'td613.ash.origin-witness-receipt/v0.1';
const MANIFEST_DOMAIN = 'TD613:ASH:S12:ORIGIN-MANIFEST:v1';
const WITNESS_DOMAIN = 'TD613:ASH:S12:ORIGIN-WITNESS:v1';

function bytesToHex(buffer) {
  return Array.from(new Uint8Array(buffer), byte => byte.toString(16).padStart(2, '0')).join('');
}
function hexToBytes(hex) {
  if (!/^[0-9a-f]{64}$/.test(hex)) throw new Error('SHA-256 hex is required.');
  return Uint8Array.from(hex.match(/.{2}/g), pair => Number.parseInt(pair, 16));
}
function toBase64(bytes) {
  const value = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (typeof Buffer !== 'undefined') return Buffer.from(value).toString('base64');
  let binary = '';
  for (const byte of value) binary += String.fromCharCode(byte);
  return btoa(binary);
}
function fromBase64(value) {
  if (typeof Buffer !== 'undefined') return new Uint8Array(Buffer.from(value, 'base64'));
  const binary = atob(value);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}
async function sha256(bytes, cryptoImpl) {
  return new Uint8Array(await cryptoImpl.subtle.digest('SHA-256', bytes));
}
function digestHex(value, label) {
  const output = String(value || '').trim();
  if (!/^sha256:[0-9a-f]{64}$/.test(output)) throw new Error(`${label} must be SHA-256.`);
  return output;
}

export async function computeMerkleRoot(assetDigests = [], options = {}) {
  const cryptoImpl = options.cryptoImpl || globalThis.crypto;
  if (!assetDigests.length) throw new Error('At least one asset digest is required.');
  let layer = assetDigests.map((value, index) => hexToBytes(digestHex(value, `Asset ${index + 1} digest`).slice(7)));
  while (layer.length > 1) {
    const next = [];
    for (let index = 0; index < layer.length; index += 2) {
      const left = layer[index];
      const right = layer[index + 1] || left;
      const joined = new Uint8Array(left.length + right.length);
      joined.set(left, 0); joined.set(right, left.length);
      next.push(await sha256(joined, cryptoImpl));
    }
    layer = next;
  }
  return `sha256:${bytesToHex(layer[0])}`;
}

export async function compileOriginManifest(input = {}, options = {}) {
  const assets = (input.assets || []).map((asset, index) => ({
    path: text(asset.path, `Asset ${index + 1} path`),
    digest: digestHex(asset.digest, `Asset ${index + 1} digest`),
    executable: Boolean(asset.executable)
  })).sort((left, right) => left.path.localeCompare(right.path));
  if (!assets.length) throw new Error('Origin Manifest requires assets.');
  const record = {
    schema: STRETCH12_ORIGIN_MANIFEST_SCHEMA,
    manifest_id: input.manifestId || randomId('origin_', options.cryptoImpl || globalThis.crypto),
    repository: text(input.repository, 'Repository'),
    commit: text(input.commit, 'Commit'),
    release_version: text(input.releaseVersion, 'Release version'),
    created_at: input.createdAt || new Date().toISOString(),
    assets,
    merkle_root: await computeMerkleRoot(assets.map(asset => asset.digest), options),
    dependency_lock_digest: digestHex(input.dependencyLockDigest, 'Dependency lock digest'),
    build_command: text(input.buildCommand || 'static-no-build', 'Build command'),
    runtime_versions: uniqueStrings(input.runtimeVersions || []),
    reproducibility_posture: String(input.reproducibilityPosture || 'UNVERIFIED').toUpperCase(),
    known_exceptions: uniqueStrings(input.knownExceptions || []),
    universal_endpoint_integrity_claim: false,
    manifest_digest: null
  };
  record.manifest_digest = await recordDigest(MANIFEST_DOMAIN, record, 'manifest_digest', options);
  return freeze(record);
}

export const verifyOriginManifest = (value, options = {}) => verifyRecord(MANIFEST_DOMAIN, value, 'manifest_digest', STRETCH12_ORIGIN_MANIFEST_SCHEMA, options);

export async function signOriginManifest(manifest, privateKey, options = {}) {
  const cryptoImpl = options.cryptoImpl || globalThis.crypto;
  if (!(await verifyOriginManifest(manifest, options))) throw new Error('ORIGIN_MANIFEST_DIGEST_HOLD');
  const signature = await cryptoImpl.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privateKey, canonicalBytes(manifest));
  return freeze({ algorithm: 'ECDSA-P256-SHA256', key_id: text(options.keyId || 'unassigned-release-key', 'Release key ID'), signature_b64: toBase64(signature) });
}

export async function verifyOriginSignature(manifest, signature, publicKey, options = {}) {
  const cryptoImpl = options.cryptoImpl || globalThis.crypto;
  if (!(await verifyOriginManifest(manifest, options))) return false;
  if (signature?.algorithm !== 'ECDSA-P256-SHA256') return false;
  return cryptoImpl.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, publicKey, fromBase64(signature.signature_b64), canonicalBytes(manifest));
}

export async function verifyAssetBytes(asset, bytes, options = {}) {
  const cryptoImpl = options.cryptoImpl || globalThis.crypto;
  const digest = `sha256:${bytesToHex(await sha256(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes), cryptoImpl))}`;
  return freeze({ path: asset.path, expected_digest: asset.digest, observed_digest: digest, valid: digest === asset.digest });
}

export async function compileOriginWitnessReceipt(input = {}, options = {}) {
  const manifest = input.manifest;
  if (!manifest || manifest.schema !== STRETCH12_ORIGIN_MANIFEST_SCHEMA) throw new Error('Origin Manifest is required.');
  const assetResults = (input.assetResults || []).map(result => ({
    path: text(result.path, 'Asset result path'),
    expected_digest: digestHex(result.expected_digest || result.expectedDigest, 'Expected asset digest'),
    observed_digest: digestHex(result.observed_digest || result.observedDigest, 'Observed asset digest'),
    valid: Boolean(result.valid)
  }));
  const signatureValid = Boolean(input.signatureValid);
  const assetsValid = assetResults.length === manifest.assets.length && assetResults.every(result => result.valid);
  const decision = signatureValid && assetsValid ? 'ORIGIN_VERIFIED' : !signatureValid ? 'ORIGIN_SIGNATURE_HOLD' : 'ASSET_DIGEST_HOLD';
  const record = {
    schema: STRETCH12_ORIGIN_WITNESS_SCHEMA,
    witness_id: input.witnessId || randomId('origin_witness_', options.cryptoImpl || globalThis.crypto),
    created_at: input.createdAt || new Date().toISOString(),
    manifest_reference: text(input.manifestReference, 'Origin Manifest reference'),
    manifest_digest: digestHex(manifest.manifest_digest, 'Origin Manifest digest'),
    release_key_id: text(input.releaseKeyId || 'unassigned-release-key', 'Release key ID'),
    signature_valid: signatureValid,
    assets_valid: assetsValid,
    asset_results: assetResults,
    decision,
    endpoint_integrity_proven: false,
    cannot_establish: [
      'uncompromised operating system',
      'uncompromised browser runtime',
      'absence of malicious extensions',
      'physical identity of the device operator'
    ],
    operator_closure: { required: true, status: String(input.operatorClosure || 'OPEN').toUpperCase() },
    receipt_digest: null
  };
  record.receipt_digest = await recordDigest(WITNESS_DOMAIN, record, 'receipt_digest', options);
  return freeze(record);
}

export const verifyOriginWitnessReceipt = (value, options = {}) => verifyRecord(WITNESS_DOMAIN, value, 'receipt_digest', STRETCH12_ORIGIN_WITNESS_SCHEMA, options);
