import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = file => fs.readFileSync(file, 'utf8');
const probe = read('scripts/ash-keep-production-probe.mjs');
const runner = read('scripts/run-ash-keep-production-probe.mjs');
const receipt = read('app/dome-world/docs/ASH_KEEP_V1_PRODUCTION_DEMO_RECEIPT.md');
const workflow = read('.github/workflows/ash-keep-production-closure.yml');
const release = JSON.parse(read('app/aperture/release.json'));

for (const token of [
  'td613.ash-keep.production-closure-observation/v0.1',
  'promotion_authorized: false',
  "const DB_NAME = 'td613-ash-keep'",
  'indexeddb_record_count',
  'non_read_requests',
  'recipient_transport_requests',
  'case_map_digest',
  'WHAT_ACTUALLY_LEFT',
  'REPLAY_VERIFIED',
  'stale_version_matches',
  'stale_route_matches',
  'provider_called: false',
  'wrong_passphrase_hold',
  'tamper_hold',
  'compile_and_verify_ms',
  'horizontal_overflow',
  'clipped_controls',
  'mobile_portrait',
  'mobile_landscape',
  'rotation_return',
  'reduced_motion',
  'evidence-manifest.json'
]) {
  assert.ok(probe.includes(token), `Production probe omitted required contract token: ${token}`);
}

assert.match(probe, /real_surveillance_probability === null/);
assert.match(probe, /automatic_hold === false/);
assert.match(probe, /transmission_performed === false/);
assert.match(probe, /requests\.filter\(request => request\.method !== 'GET'/);
assert.doesNotMatch(probe, /IMPLEMENTED_PRODUCTION_DEMONSTRATED/);
assert.doesNotMatch(probe, /productionStatus\s*=/);

for (const token of [
  'td613.ash-keep.production-probe-fixture-manifest/v0.1',
  'SYNTHETIC_OPERATOR_SELECTED_EXCERPT',
  'selected_excerpt_sha256',
  'source_probe_sha256',
  'runtime_probe_sha256',
  'source_mutated: false',
  'runtime_copy_ephemeral: true',
  'promotion_authorized: false',
  'targetCount !== 1'
]) {
  assert.ok(runner.includes(token), `Fixture runner omitted required provenance token: ${token}`);
}
assert.match(runner, /TD613_SELECTED_EXCERPT/);
assert.match(runner, /#draftBody/);
assert.doesNotMatch(runner, /IMPLEMENTED_PRODUCTION_DEMONSTRATED/);

for (const token of [
  'NOT_YET_EARNED',
  'PREVIEW_PENDING',
  'post-merge probe',
  'separate promotion commit',
  'runtime commit SHA',
  'workflow run ID',
  'evidence artifact ID',
  'evidence artifact SHA-256',
  'desktop screenshot SHA-256',
  'mobile portrait screenshot SHA-256',
  'mobile landscape screenshot SHA-256',
  'promotion_authorized = false',
  'PROMOTION_WITHHELD'
]) {
  assert.ok(receipt.includes(token), `Production receipt omitted required gate language: ${token}`);
}

assert.equal(release.ash.version, 'v1.0-alpha');
assert.equal(release.ash.phase, 'ASH_KEEP_CASE_MAP_RUNTIME');
assert.equal(release.ash.status, 'IMPLEMENTATION_IN_PROGRESS');
assert.equal(release.ash.productionStatus, 'PREVIEW_PENDING');
assert.equal(release.ash.transport, false);
assert.equal(release.ash.automaticCinder, false);

for (const token of [
  'Ash Keep Production Closure',
  'workflow_dispatch',
  'tests/ash-keep-production-closure-contract.test.mjs',
  'tests/ash-keep-production-promotion-gate.test.mjs',
  'npx playwright install --with-deps chromium',
  'scripts/ash-keep-production-probe.mjs',
  'scripts/run-ash-keep-production-probe.mjs',
  'TD613_PROBE_RUNTIME_DIR',
  'upload-artifact@v4',
  'ash-keep-production-closure-evidence'
]) {
  assert.ok(workflow.includes(token), `Closure workflow omitted required token: ${token}`);
}

console.log('ash-keep-production-closure-contract.test.mjs passed');
