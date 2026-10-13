import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const ledger = read('app/dome-world/docs/PHASE_0_CONTRACT_LEDGER.md');
const readme = read('app/dome-world/README.md');
const kernel = read('app/dome-world/ash/local-commitment.js');
const alias = read('app/dome-world/ash/local-commitment-v071.js');
const manifestSchema = JSON.parse(read('app/dome-world/schemas/ash-custody-manifest-v07.schema.json'));
const vercel = JSON.parse(read('vercel.json'));

for (const marker of [
  'Aperture | v3.0-alpha compatibility context',
  'Dome-World | v0.5.0',
  'Ash local commitment | v0.7 schema with v0.7.1 race hardening',
  'Phason | v0.5',
  'exact substrate | v0.4.3',
  'no selected file',
  'L0_METADATA_ONLY',
  'L1_BROWSER_LOCAL_ARTIFACT_DIGEST',
  'Deferred by roadmap order',
]) assert.ok(ledger.includes(marker), `missing ledger marker: ${marker}`);

assert.match(readme, /api\/dome-world-engine-guard\.py/);
assert.match(readme, /api\/ash-local-commitment-guard\.py/);
assert.doesNotMatch(readme, /One Python function serves/);
assert.match(readme, /browser-local exact-byte SHA-256|canonical local commitment module/);
assert.match(kernel, /TD613 Ash Local Commitment Kernel v0\.7/);
assert.match(kernel, /createLatestCommitmentCoordinator/);
assert.match(kernel, /status: current \? "CURRENT" : "STALE"/);
assert.match(alias, /export \* from "\.\/local-commitment\.js";/);

const localCommitment = manifestSchema.properties.local_commitment;
for (const field of [
  'network_operation_performed_by_module',
  'raw_bytes_transmitted',
  'raw_bytes_returned',
  'raw_bytes_persisted_by_module',
  'memory_erasure_guaranteed',
]) {
  assert.ok(localCommitment.required.includes(field), `${field} must remain schema-required`);
  assert.equal(localCommitment.properties[field].const, false, `${field} must remain false`);
}
const serializedSchema = JSON.stringify(manifestSchema);
assert.match(serializedSchema, /L1_BROWSER_LOCAL_ARTIFACT_DIGEST/);
assert.match(serializedSchema, /"local_commitment":\{"type":"object"\}/);
assert.match(serializedSchema, /"local_commitment":\{"const":null\}/);
for (const [name, config] of Object.entries(vercel.functions || {})) {
  if ('includeFiles' in config) assert.equal(typeof config.includeFiles, 'string', `${name}.includeFiles must be a string`);
  if ('excludeFiles' in config) assert.equal(typeof config.excludeFiles, 'string', `${name}.excludeFiles must be a string`);
}
assert.equal(vercel.functions?.['api/dome-world-engine-v07.py'], undefined);
console.log('Dome-World Phase 0 contract ledger: PASS');
