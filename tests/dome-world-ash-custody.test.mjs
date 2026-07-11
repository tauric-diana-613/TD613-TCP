import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), 'utf8');

const htmlAlias = read('app/dome-world/ash-custody.html');
const htmlV07 = read('app/dome-world/ash-custody-v07.html');
const localKernelSource = read('app/dome-world/ash/local-commitment.js');
const cockpit = read('app/dome-world/index.html');
const api = read('api/dome-world-engine.py');
const apiCommitment = read('api/ash-local-commitment.py');
const ashRuntime = read('packages/dome_world_exact/ash_v06.py');
const operationSurface = api + '\n' + apiCommitment + '\n' + ashRuntime;
const manifestSchema = JSON.parse(read('app/dome-world/schemas/ash-custody-manifest.schema.json'));
const receiptSchema = JSON.parse(read('app/dome-world/schemas/ash-custody-receipt.schema.json'));
const manifestSchemaV07 = JSON.parse(read('app/dome-world/schemas/ash-custody-manifest-v07.schema.json'));
const receiptSchemaV07 = JSON.parse(read('app/dome-world/schemas/ash-custody-receipt-v07.schema.json'));
const phasonSchema = JSON.parse(read('app/dome-world/schemas/phason-custody-diff.schema.json'));
const indexSchema = JSON.parse(read('app/dome-world/schemas/receipt-index.schema.json'));
const syntheticGarden = JSON.parse(read('app/dome-world/fixtures/ash-custody-garden.json'));

for (const marker of [/Register Artifact/, /Leak Challenge/, /Veil/, /Cinder/, /Recall/, /Ash owns custody/, /Receipts index only/, /Phason diffs projection/]) {
  assert.match(htmlV07, marker);
}
assert.match(htmlV07, /#intake > \.panel:first-child \{\s*display:\s*grid;/);
assert.match(htmlV07, /grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
assert.match(htmlV07, /font-size:16px;|font-size: 16px;/);
assert.match(htmlV07, /max-height:52vh;|max-height: 52vh;/);
assert.match(htmlV07, /scrollbar-width:none;|scrollbar-width: none;/);
assert.match(htmlAlias, /ash-custody-v07\.html/);
assert.doesNotMatch(htmlAlias, /sha256:manual-placeholder|claim-ceiling/);
assert.equal((cockpit.match(/class="tab(?: active)?" data-view=/g) || []).length, 8);

for (const op of ['ash-custody-register', 'ash-custody-replay', 'phason-custody-diff', 'receipt-index', 'ash-leak-challenge', 'ash-veil', 'ash-cinder', 'ash-compare', 'ash-recall', 'ash-grade-gate', 'ash-hcc-adapter', 'ash-projection-simulate']) {
  assert.match(operationSurface, new RegExp(`"${op}"`));
}
assert.match(api, /RAW_CONTENT_KEYS/);
assert.match(api, /walk\(payload\)/);
assert.match(api, /"fragment"/);
assert.match(api, /"candidateFragment"/);

assert.equal(manifestSchema.$id, 'td613.ash.custody-manifest/v0.5');
assert.equal(receiptSchema.$id, 'td613.ash.custody-receipt/v0.5');
assert.equal(manifestSchemaV07.$id, 'td613.ash.custody-manifest/v0.7');
assert.equal(receiptSchemaV07.$id, 'td613.ash.custody-receipt/v0.7');
assert.equal(phasonSchema.$id, 'td613.phason.custody-diff/v0.5');
assert.equal(indexSchema.$id, 'td613.dome.receipt-index/v0.5');

// Legacy v0.5 boundaries remain frozen for later review.
assert.ok(receiptSchema.required.includes('anti_extraction_defaults'));
assert.equal(receiptSchema.properties.public_surface.properties.content_exported.const, false);
assert.equal(receiptSchema.properties.public_surface.properties.text_preview.const, null);
assert.equal(receiptSchema.properties.export_boundary.properties.raw_content_allowed.const, false);
assert.equal(receiptSchema.properties.anti_extraction_defaults.properties.receipt_not_proof.const, true);
assert.equal(receiptSchema.properties.claimCeiling.const, 'ash-custody-receipt-not-content-custody-or-permission-proof');

// v0.7 introduces no new claim-ceiling mechanism.
assert.ok(!receiptSchemaV07.required.includes('claimCeiling'));
assert.ok(!('claimCeiling' in receiptSchemaV07.properties));
assert.ok(receiptSchemaV07.required.includes('does_not_establish'));
assert.ok(manifestSchemaV07.required.includes('does_not_establish'));
assert.equal(
  manifestSchemaV07.properties.local_commitment.properties.network_operation_performed_by_module.const,
  false,
);
assert.equal(
  manifestSchemaV07.properties.local_commitment.properties.raw_bytes_persisted_by_module.const,
  false,
);

for (const env of ['local_file', 'repo', 'cloud_drive', 'local_drive', 'spreadsheet', 'llm_chat', 'manual']) {
  assert.ok(manifestSchema.properties.source_environment.enum.includes(env));
  assert.ok(manifestSchemaV07.properties.source_environment.enum.includes(env));
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
assert.match(htmlV07, /import \{ createLatestCommitmentCoordinator, generateLocalCommitment/);
assert.match(htmlV07, /id="contentHash" readonly/);
assert.match(htmlV07, /L0_METADATA_ONLY/);
assert.match(htmlV07, /Cinder transport held · Phase 6/);
assert.doesNotMatch(htmlV07, /domeRequest\("ash-cinder"/);
assert.doesNotMatch(htmlV07, /innerHTML\s*=/);
assert.doesNotMatch(htmlV07, /claimCeiling|claim_ceiling/);
assert.match(localKernelSource, /L1_BROWSER_LOCAL_ARTIFACT_DIGEST/);
assert.match(localKernelSource, /createLatestCommitmentCoordinator/);
assert.match(apiCommitment, /metadataDigestFallback": False/);
assert.match(apiCommitment, /boundaryVocabularyPolicy": "no-new-mechanism-legacy-frozen"/);
assert.doesNotMatch(apiCommitment, /artifact_digest.*_sha256\(\{"source"/s);
assert.doesNotMatch(localKernelSource, /fetch\(|XMLHttpRequest|WebSocket/);

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
assert.equal(abc.schema, 'td613.ash.local-commitment/v0.7');
assert.equal(abc.assurance_class, 'L1_BROWSER_LOCAL_ARTIFACT_DIGEST');
assert.equal(abc.artifact_digest, 'sha256:ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
assert.equal(abc.network_operation_performed_by_module, false);
assert.equal(abc.raw_bytes_transmitted, false);
assert.equal(abc.raw_bytes_returned, false);
assert.equal(abc.raw_bytes_persisted_by_module, false);
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
  /exceeds the Phase 1 local-hashing limit/,
);

// A slow old selection cannot overwrite a newer selection.
const pending = new Map();
const fakeGenerate = (file) => new Promise((resolve) => pending.set(file, resolve));
const coordinator = createLatestCommitmentCoordinator(fakeGenerate);
const first = fileLike(new Uint8Array([1]));
const second = fileLike(new Uint8Array([2]));
const firstRun = coordinator.commit(first);
const secondRun = coordinator.commit(second);
pending.get(second)({ artifact_digest: 'sha256:' + '2'.repeat(64) });
const secondResult = await secondRun;
assert.equal(secondResult.status, 'CURRENT');
pending.get(first)({ artifact_digest: 'sha256:' + '1'.repeat(64) });
const firstResult = await firstRun;
assert.equal(firstResult.status, 'STALE');
assert.equal(firstResult.commitment, null);

console.log('Ash custody layer + local commitment kernel contract: PASS');
