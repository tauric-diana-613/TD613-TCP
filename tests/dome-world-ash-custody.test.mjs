import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), 'utf8');

const htmlAlias = read('app/dome-world/ash-custody.html');
const htmlV07 = read('app/dome-world/ash-custody-v07.html');
const htmlV08 = read('app/dome-world/ash-custody-v08.html');
const localKernelSource = read('app/dome-world/ash/local-commitment.js');
const canonicalSource = read('app/dome-world/ash/canonical-json.js');
const cockpit = read('app/dome-world/index.html');
const apiCommitment = read('api/ash-local-commitment.py');
const commitmentRuntime = read('packages/dome_world_exact/ash_commitment_v08.py');
const receiptRuntime = read('packages/dome_world_exact/ash_receipt_v08.py');
const phase2Runtime = apiCommitment + '\n' + commitmentRuntime + '\n' + receiptRuntime;
const manifestV07 = JSON.parse(read('app/dome-world/schemas/ash-custody-manifest-v07.schema.json'));
const receiptV07 = JSON.parse(read('app/dome-world/schemas/ash-custody-receipt-v07.schema.json'));
const manifestV08 = JSON.parse(read('app/dome-world/schemas/ash-custody-manifest-v08.schema.json'));
const receiptV08 = JSON.parse(read('app/dome-world/schemas/ash-custody-receipt-v08.schema.json'));
const migrationV08 = JSON.parse(read('app/dome-world/schemas/ash-custody-migration-v08.schema.json'));
const vectors = JSON.parse(read('app/dome-world/fixtures/ash-canonical-json-vectors.json'));

for (const marker of [
  /Ash Custody \/\/ v0\.8/,
  /Canonical Digest \+ Receipt Spine/,
  /artifact ≠ manifest ≠ receipt/,
  /Replay or migrate/,
  /Local receipt index/,
  /Derivative transport held/,
]) assert.match(htmlV08, marker);

assert.match(htmlV08, /font-size:16px/);
assert.match(htmlV08, /max-height:54vh/);
assert.match(htmlV08, /@media\(max-width:820px\)/);
assert.match(htmlAlias, /ash-custody-v08\.html/);
assert.doesNotMatch(htmlAlias, /sha256:manual-placeholder|claim-ceiling/);
assert.match(htmlV07, /Ash Custody \/\/ v0\.7 Lab/);
assert.match(cockpit, /data-ash-threshold-enter href="\/dome-world\/ash-threshold\.html"/);

assert.match(htmlV08, /verifyReceiptDigests.*canonical-json\.js/);
assert.match(htmlV08, /ash-custody-migrate/);
assert.match(htmlV08, /Cinder plaintext transport remains disabled until Phase 6/);
assert.doesNotMatch(htmlV08, /domeRequest\("ash-cinder"/);
assert.doesNotMatch(htmlV08, /innerHTML\s*=/);
assert.doesNotMatch(htmlV08, /claimCeiling|claim_ceiling/);
assert.doesNotMatch(htmlV08, /sha256:manual-placeholder/);
assert.match(canonicalSource, /td613\.ash\.canonical-json\/v0\.1/);
assert.match(canonicalSource, /MANIFEST_DIGEST_DOMAIN/);
assert.match(canonicalSource, /RECEIPT_DIGEST_DOMAIN/);
assert.doesNotMatch(canonicalSource, /fetch\(|XMLHttpRequest|WebSocket/);

assert.equal(manifestV07.$id, 'td613.ash.custody-manifest/v0.7');
assert.equal(receiptV07.$id, 'td613.ash.custody-receipt/v0.7');
assert.equal(manifestV08.$id, 'td613.ash.custody-manifest/v0.8');
assert.equal(receiptV08.$id, 'td613.ash.custody-receipt/v0.8');
assert.equal(migrationV08.$id, 'td613.ash.custody-migration/v0.8');
assert.ok(manifestV08.required.includes('manifest_digest'));
assert.ok(receiptV08.required.includes('receipt_digest'));
assert.ok(receiptV08.required.includes('manifest_digest'));
assert.ok(!('content_hash' in manifestV08.properties.artifact_metadata.properties));
assert.ok(!receiptV08.required.includes('claimCeiling'));
assert.ok(!('claimCeiling' in receiptV08.properties));
assert.equal(receiptV08.properties.export_boundary.properties.universal_stable_digest_allowed.const, false);
assert.equal(manifestV08.properties.privacy_boundary.properties.digest_visibility.const, 'local-receipt-only');

assert.equal(vectors.profile, 'td613.ash.canonical-json/v0.1');
assert.ok(vectors.vectors.length >= 4);
assert.match(phase2Runtime, /td613\.ash\.custody-manifest\/v0\.8/);
assert.match(phase2Runtime, /ash-custody-migrate/);
assert.match(phase2Runtime, /compute_manifest_digest/);
assert.match(phase2Runtime, /compute_receipt_digest/);
assert.match(phase2Runtime, /universalStableDigestPublishedByDefault": False/);
assert.doesNotMatch(phase2Runtime, /artifact_id = "ash_artifact_" \+ _sha256/);

const {
  generateLocalCommitment,
  createLatestCommitmentCoordinator,
  DEFAULT_MAX_BYTES,
} = await import('../app/dome-world/ash/local-commitment.js');
const fileLike = (bytes, type = 'application/octet-stream') => ({
  size: bytes.byteLength,
  type,
  lastModified: 613,
  async arrayBuffer() {
    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  },
});
const commit = (file, options = {}) => generateLocalCommitment(file, { cryptoImpl: webcrypto, ...options });
const abc = await commit(fileLike(new TextEncoder().encode('abc'), 'text/plain'));
assert.equal(abc.artifact_digest, 'sha256:ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
assert.equal(abc.network_operation_performed_by_module, false);
assert.equal(abc.raw_bytes_persisted_by_module, false);
const empty = await commit(fileLike(new Uint8Array()));
assert.equal(empty.artifact_digest, 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
await assert.rejects(
  () => commit({ ...fileLike(new Uint8Array()), size: DEFAULT_MAX_BYTES + 1 }),
  /exceeds the Phase 1 local-hashing limit/,
);

const pending = new Map();
const coordinator = createLatestCommitmentCoordinator((file) => new Promise((resolve) => pending.set(file, resolve)));
const first = fileLike(new Uint8Array([1]));
const second = fileLike(new Uint8Array([2]));
const firstRun = coordinator.commit(first);
const secondRun = coordinator.commit(second);
pending.get(second)({ artifact_digest: `sha256:${'2'.repeat(64)}` });
assert.equal((await secondRun).status, 'CURRENT');
pending.get(first)({ artifact_digest: `sha256:${'1'.repeat(64)}` });
const stale = await firstRun;
assert.equal(stale.status, 'STALE');
assert.equal(stale.commitment, null);

assert.match(localKernelSource, /L1_BROWSER_LOCAL_ARTIFACT_DIGEST/);
assert.match(localKernelSource, /createLatestCommitmentCoordinator/);
assert.doesNotMatch(localKernelSource, /fetch\(|XMLHttpRequest|WebSocket/);

console.log('Ash custody v0.8 + Phase 1 commitment continuity: PASS');
