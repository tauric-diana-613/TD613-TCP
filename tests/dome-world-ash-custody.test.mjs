import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");

const html = read("app/dome-world/ash-custody.html");
const cockpit = read("app/dome-world/index.html");
const api = read("api/dome-world-engine.py");
const ashRuntime = read("packages/dome_world_exact/ash_v06.py");
const operationSurface = api + "\n" + ashRuntime;
const commitmentSource = read("app/dome-world/ash/local-commitment.js");
const manifestSchema = JSON.parse(
  read("app/dome-world/schemas/ash-custody-manifest.schema.json"),
);
const receiptSchema = JSON.parse(
  read("app/dome-world/schemas/ash-custody-receipt.schema.json"),
);
const phasonSchema = JSON.parse(
  read("app/dome-world/schemas/phason-custody-diff.schema.json"),
);
const indexSchema = JSON.parse(
  read("app/dome-world/schemas/receipt-index.schema.json"),
);
const syntheticGarden = JSON.parse(
  read("app/dome-world/fixtures/ash-custody-garden.json"),
);

assert.match(html, /Register Artifact/);
assert.match(html, /Leak Challenge/);
assert.match(html, /Veil/);
assert.match(html, /Cinder/);
assert.match(html, /Recall/);
assert.match(
  cockpit,
  /href="\/dome-world\/ash-custody\.html">Register Artifact<\/a>/,
);
assert.match(
  cockpit,
  /Ash registers metadata and custody posture; raw content stays outside server custody\./,
);
assert.equal(
  (cockpit.match(/class="tab(?: active)?" data-view=/g) || []).length,
  8,
);
assert.match(html, /Ash owns custody/);
assert.match(html, /Receipts index only/);
assert.match(html, /Phason diffs projection/);
assert.match(html, /Substrate waits for exact coordinates/);
assert.match(html, /#intake > \.panel:first-child \{\s*display: grid;/);
assert.match(
  html,
  /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/,
);
assert.match(html, /font-size: 16px;/);
assert.match(html, /max-height: 52vh;/);
assert.match(html, /scrollbar-width: none;/);

assert.match(html, /type="module"/);
assert.match(html, /generateLocalCommitment/);
assert.match(html, /\.\/ash\/local-commitment\.js/);
assert.match(html, /L0_METADATA_ONLY/);
assert.match(html, /L1_BROWSER_LOCAL_ARTIFACT_DIGEST/);
assert.match(html, /artifactDigest: localCommitment\?\.artifact_digest \|\| null/);
assert.match(html, /contentHash[\s\S]*readonly/);
assert.doesNotMatch(html, /sha256:manual-placeholder/);
assert.doesNotMatch(commitmentSource, /\bfetch\s*\(/);
assert.match(commitmentSource, /crypto\?\.subtle/);
assert.match(commitmentSource, /new Uint8Array\(artifactBuffer\)\.fill\(0\)/);
assert.match(commitmentSource, /memory_erasure_guaranteed: false/);

for (const op of [
  "ash-custody-register",
  "ash-custody-replay",
  "phason-custody-diff",
  "receipt-index",
  "ash-leak-challenge",
  "ash-veil",
  "ash-cinder",
  "ash-compare",
  "ash-recall",
  "ash-grade-gate",
  "ash-hcc-adapter",
  "ash-projection-simulate",
]) {
  assert.match(operationSurface, new RegExp(`"${op}"`));
}
assert.match(api, /RAW_CONTENT_KEYS/);
assert.match(api, /walk\(payload\)/);
assert.match(api, /metadataDigestFallback": False/);
assert.match(api, /SHA256_DIGEST_RE/);
assert.doesNotMatch(
  api,
  /content_hash = _sha256\(\{"source": source_environment/,
);

assert.equal(
  manifestSchema.$id,
  "td613.ash.custody-manifest/v0.5",
);
assert.equal(
  receiptSchema.$id,
  "td613.ash.custody-receipt/v0.5",
);
assert.equal(phasonSchema.$id, "td613.phason.custody-diff/v0.5");
assert.equal(indexSchema.$id, "td613.dome.receipt-index/v0.5");

assert.ok(receiptSchema.required.includes("anti_extraction_defaults"));
assert.ok(receiptSchema.required.includes("assurance_class"));
assert.equal(
  receiptSchema.properties.public_surface.properties.content_exported.const,
  false,
);
assert.equal(
  receiptSchema.properties.public_surface.properties.text_preview.const,
  null,
);
assert.equal(
  receiptSchema.properties.public_surface.properties.quantized_weather_only.const,
  true,
);
assert.equal(
  receiptSchema.properties.export_boundary.properties.raw_content_allowed.const,
  false,
);
assert.equal(
  receiptSchema.properties.export_boundary.properties.summary_before_custody.const,
  false,
);
assert.equal(
  receiptSchema.properties.export_boundary.properties.arrival_as_consent.const,
  false,
);
assert.equal(
  receiptSchema.properties.anti_extraction_defaults.properties.local_hold.const,
  true,
);
assert.equal(
  receiptSchema.properties.anti_extraction_defaults.properties.no_content_export.const,
  true,
);
assert.equal(
  receiptSchema.properties.anti_extraction_defaults.properties.public_weather_only.const,
  true,
);
assert.equal(
  receiptSchema.properties.anti_extraction_defaults.properties.receipt_not_proof.const,
  true,
);
assert.equal(
  receiptSchema.properties.anti_extraction_defaults.properties.beauty_not_verification.const,
  true,
);
assert.equal(
  receiptSchema.properties.claimCeiling.const,
  "ash-custody-receipt-not-content-custody-or-permission-proof",
);

const artifactMetadata =
  manifestSchema.properties.artifact_metadata.properties;
assert.equal(
  artifactMetadata.commitment_assurance.enum.includes("L0_METADATA_ONLY"),
  true,
);
assert.equal(
  artifactMetadata.commitment_assurance.enum.includes(
    "L1_BROWSER_LOCAL_ARTIFACT_DIGEST",
  ),
  true,
);
assert.equal(
  artifactMetadata.local_commitment.properties.schema.const,
  "td613.ash.local-commitment/v0.7",
);

const envs = manifestSchema.properties.source_environment.enum;
for (const env of [
  "local_file",
  "repo",
  "cloud_drive",
  "local_drive",
  "spreadsheet",
  "llm_chat",
  "manual",
]) {
  assert.ok(envs.includes(env));
}

assert.equal(
  syntheticGarden.schema,
  "td613.ash.synthetic-garden/v0.6",
);
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

await import("./dome-world-ash-local-commitment.test.mjs");

console.log("Ash custody layer contract: PASS");
