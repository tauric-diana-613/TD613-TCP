import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), 'utf8');

const html = read('app/dome-world/ash-custody.html');
const htmlV07 = read('app/dome-world/ash-custody-v07.html');
const localKernelSource = read('app/dome-world/ash/local-commitment.js');
const cockpit = read('app/dome-world/index.html');
const api = read('api/dome-world-engine.py');
const apiV07 = read('api/dome-world-engine-v07.py');
const ashRuntime = read('packages/dome_world_exact/ash_v06.py');
const operationSurface = api + '\n' + apiV07 + '\n' + ashRuntime;
const manifestSchema = JSON.parse(read('app/dome-world/schemas/ash-custody-manifest.schema.json'));
const receiptSchema = JSON.parse(read('app/dome-world/schemas/ash-custody-receipt.schema.json'));
const manifestSchemaV07 = JSON.parse(read('app/dome-world/schemas/ash-custody-manifest-v07.schema.json'));
const receiptSchemaV07 = JSON.parse(read('app/dome-world/schemas/ash-custody-receipt-v07.schema.json'));
const phasonSchema = JSON.parse(read('app/dome-world/schemas/phason-custody-diff.schema.json'));
const indexSchema = JSON.parse(read('app/dome-world/schemas/receipt-index.schema.json'));
const syntheticGarden = JSON.parse(read('app/dome-world/fixtures/ash-custody-garden.json'));

for (const surface of [html, htmlV07]) {
  for (const marker of [/Register Artifact/, /Leak Challenge/, /Veil/, /Cinder/, /Recall/, /Ash owns custody/, /Receipts index only/, /Phason diffs projection/]) {
    assert.match(surface, marker);
  }
  assert.match(surface, /#intake > \.panel:first-child \{\s*display: grid;/);
  assert.match(surface, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(surface, /font-size:16px;|font-size: 16px;/);
  assert.match(surface, /max-height:52vh;|max-height: 52vh;/);
  assert.match(surface, /scrollbar-width:none;|scrollbar-width: none;/);
}

assert.match(cockpit, /href="\/dome-world\/ash-custody\.html">Register Artifact<\/a>/);
assert.match(cockpit, /Ash registers metadata and custody posture; raw content stays outside server custody\./);
assert.equal((cockpit.match(/class="tab(?: active)?" data-view=/g) || []).length, 8);
assert.match(html, /Substrate waits for exact coordinates/);

for (const op of ['ash-custody-register', 'ash-custody-replay', 'phason-custody-diff', 'receipt-index', 'ash-leak-challenge', 'ash-veil', 'ash-cinder', 'ash-compare', 'ash-recall', 'ash-grade-gate', 'ash-hcc-adapter', 'ash-projection-simulate']) {
  assert.match(operationSurface, new RegExp(`"${op}"`));
}
assert.match(api, /RAW_CONTENT_KEYS/);
assert.match(api, /walk\(payload\)/);

assert.equal(manifestSchema.$id, 'td613.ash.custody-manifest/v0.5');
assert.equal(receiptSchema.$id, 'td613.ash.custody-receipt/v0.5');
assert.equal(manifestSchemaV07.$id, 'td613.ash.custody-manifest/v0.7');
assert.equal(receiptSchemaV07.$id, 'td613.ash.custody-receipt/v0.7');
assert.equal(phasonSchema.$id, 'td613.phason.custody-diff/v0.5');
assert.equal(indexSchema.$id, 'td613.dome.receipt-index/v0.5');

assert.ok(receiptSchema.required.includes('anti_extraction_defaults'));
assert.equal(receiptSchema.properties.public_surface.properties.content_exported.const, false);
assert.equal(receiptSchema.properties.public_surface.properties.text_preview.const, null);
assert.equal(receiptSchema.properties.public_surface.properties.quantized_weather_only.const, true);
assert.equal(receiptSchema.properties.export_boundary.properties.raw_content_allowed.const, false);
assert.equal(receiptSchema.properties.export_boundary.properties.summary_before_custody.const, false);
assert.equal(receiptSchema.properties.export_boundary.properties.arrival_as_consent.const, false);
assert.equal(receiptSchema.properties.anti_extraction_defaults.properties.local_hold.const, true);
assert.equal(receiptSchema.properties.anti_extraction_defaults.properties.no_content_export.const, true);
assert.equal(receiptSchema.properties.anti_extraction_defaults.properties.public_weather_only.const, true);
assert.equal(receiptSchema.properties.anti_extraction_defaults.properties.receipt_not_proof.const, true);
assert.equal(receiptSchema.properties.anti_extraction_defaults.properties.beauty_not_verification.const, true);
assert.equal(receiptSchema.properties.claimCeiling.const, 'ash-custody-receipt-not-content-custody-or-permission-proof');

for (const env of ['local_file', 'repo', 'cloud_drive', 'local_drive', 'spreadsheet', 'llm_chat', 'manual']) {
  assert.ok(manifestSchema.properties.source_environment.enum.includes(env));
}

assert.equal(syntheticGarden.schema, 'td613.ash.synthetic-garden/v0.6');
assert.ok(syntheticGarden.fixtures.length >= 10);
for (const fixture of syntheticGarden.fixtures) {
  assert.ok(fixture.teaches);
  assert.ok(Array.isArray(fixture.doesNotProve));
  assert.ok(fixture.payload?.sourceEnvironment);
  assert.ok(fixture.payload?.sourceLocator);
  assert.ok(fixture.payload?.artifactMetadata?.contentHash);
  assert.ok(fixture.payload?.credentialReference);
  assert.ok(fixture.payload?.ashPosture);
  assert.ok(fixture.expectedDecision);
  assert.ok(fixture.claimCeiling);
}

// Phase 1 Local Commitment Kernel contract.
assert.doesNotMatch(htmlV07, /sha256:manual-placeholder/);
assert.match(htmlV07, /import \{ generateLocalCommitment/);
assert.match(htmlV07, /id="contentHash" readonly/);
assert.match(htmlV07, /L0_METADATA_ONLY/);
assert.match(localKernelSource, /L1_BROWSER_LOCAL_ARTIFACT_DIGEST/);
assert.match(apiV07, /metadataDigestFallback": False/);
assert.doesNotMatch(apiV07, /artifact_digest.*_sha256\(\{"source"/s);
assert.doesNotMatch(localKernelSource, /fetch\(|XMLHttpRequest|WebSocket/);

const { generateLocalCommitment, DEFAULT_MAX_BYTES } = await import('../app/dome-world/ash/local-commitment.js');
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
assert.equal(abc.schema, 'td613.ash.local-commitment/v0.7');
assert.equal(abc.assurance_class, 'L1_BROWSER_LOCAL_ARTIFACT_DIGEST');
assert.equal(abc.artifact_digest, 'sha256:ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
assert.equal(abc.raw_bytes_transmitted, false);
assert.equal(abc.raw_bytes_returned, false);
assert.equal(abc.memory_erasure_guaranteed, false);
assert.ok(!('bytes' in abc));
assert.ok(!('arrayBuffer' in abc));

const empty = await commit(fileLike(new Uint8Array()));
assert.equal(empty.artifact_digest, 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');

const changed = await commit(fileLike(new TextEncoder().encode('abd')));
assert.notEqual(changed.artifact_digest, abc.artifact_digest);

const nfc = await commit(fileLike(new TextEncoder().encode('\u00e9')));
const nfd = await commit(fileLike(new TextEncoder().encode('e\u0301')));
assert.notEqual(nfc.artifact_digest, nfd.artifact_digest, 'exact byte commitments must not normalize Unicode');

await assert.rejects(
  () => commit({ ...fileLike(new Uint8Array()), size: DEFAULT_MAX_BYTES + 1 }),
  /exceeds the Phase 1 local-hashing ceiling/,
);

console.log('Ash custody layer + local commitment kernel contract: PASS');
