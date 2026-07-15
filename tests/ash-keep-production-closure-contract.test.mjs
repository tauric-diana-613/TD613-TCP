import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = file => fs.readFileSync(file, 'utf8');
const probe = read('scripts/ash-keep-production-probe.mjs');
const runner = read('scripts/run-ash-keep-production-probe.mjs');
const lifecycleProbeCompiler = read('scripts/ash-lifecycle-production-probe.mjs');
const lifecycleProbeBase = read('scripts/ash-lifecycle-production-probe-base.mjs');
const lifecycleProbe = `${lifecycleProbeCompiler}\n${lifecycleProbeBase}`;
const publisher = read('scripts/publish-ash-keep-observer-status.mjs');
const postureVerifier = read('scripts/assert-ash-keep-release-posture.mjs');
const receipt = read('app/dome-world/docs/ASH_KEEP_V1_PRODUCTION_DEMO_RECEIPT.md');
const workflow = read('.github/workflows/ash-keep-production-closure.yml');
const release = JSON.parse(read('app/aperture/release.json'));

for (const token of [
  'td613.ash-keep.production-closure-observation/v0.1',
  'promotion_authorized: false',
  "const DB_NAME = 'td613-ash-keep'",
  'indexeddb_record_count',
  'recipient_transport_requests',
  'case_map_digest',
  'WHAT_ACTUALLY_LEFT',
  'REPLAY_VERIFIED',
  'wrong_passphrase_hold',
  'tamper_hold',
  'mobile_portrait',
  'mobile_landscape',
  'evidence-manifest.json'
]) assert.ok(probe.includes(token), `Core production probe omitted ${token}`);
assert.match(probe, /real_surveillance_probability === null/);
assert.match(probe, /automatic_hold === false/);
assert.match(probe, /transmission_performed === false/);
assert.doesNotMatch(probe, /IMPLEMENTED_PRODUCTION_DEMONSTRATED/);

for (const token of [
  'td613.ash-keep.production-probe-fixture-manifest/v0.1',
  'SYNTHETIC_OPERATOR_SELECTED_EXCERPT',
  'runtime_copy_ephemeral: true',
  'CLASSIFY_INTENTIONAL_HORIZONTAL_SCROLL_LANES_SEPARATELY_FROM_CLIPPING',
  'promotion_authorized: false'
]) assert.ok(runner.includes(token), `Core fixture runner omitted ${token}`);

for (const token of [
  "new Set(['pending', 'success', 'failure', 'error'])",
  "required('GITHUB_TOKEN')",
  "required('TD613_OBSERVED_COMMIT')",
  'TD613_OBSERVER_STATUS_RECEIPT_PATH',
  'status_id: result.id',
  'receipt_sha256',
  'promotion_authorized: false'
]) assert.ok(publisher.includes(token), `Observer publisher omitted ${token}`);
assert.doesNotMatch(publisher, /release\.json|productionStatus|IMPLEMENTED_PRODUCTION_DEMONSTRATED/);

for (const token of [
  'td613.ash-keep.release-posture-verification/v0.1',
  "ash.status === 'IMPLEMENTED_PRODUCTION_DEMONSTRATED' && ash.productionStatus === 'PRODUCTION_DEMONSTRATED'",
  'ash.transport === false',
  'ash.automaticCinder === false',
  'posture_preserved: true',
  'promotion_authorized: false'
]) assert.ok(postureVerifier.includes(token), `Posture verifier omitted ${token}`);

const productionPosture = release.ash.status === 'IMPLEMENTED_PRODUCTION_DEMONSTRATED'
  && release.ash.productionStatus === 'PRODUCTION_DEMONSTRATED'
  && receipt.includes('Operator closure: `PRODUCTION_DEMONSTRATED`');
assert.equal(productionPosture, true, 'Ash Keep production posture is incoherent.');
assert.equal(release.ash.transport, false);
assert.equal(release.ash.automaticCinder, false);

const localJob = workflow.split('  local-closure-validation:')[1]?.split('  deployed-observation:')[0] || '';
const deployedJob = workflow.split('  deployed-observation:')[1] || '';
for (const token of [
  'Ash Keep Production Closure',
  'workflow_dispatch',
  'workflow_run',
  'workflows: ["Test and deploy static app"]',
  'statuses: write',
  'tests/ash-keep-production-closure-contract.test.mjs',
  'tests/ash-keep-production-promotion-gate.test.mjs',
  'scripts/ash-keep-production-probe.mjs',
  'scripts/run-ash-keep-production-probe.mjs',
  'ash-keep-production-closure-evidence'
]) assert.ok(workflow.includes(token), `Closure workflow omitted ${token}`);
assert.match(localJob, /Run bounded local core closure observation/);
assert.match(localJob, /run-ash-keep-production-probe\.mjs/);
assert.match(deployedJob, /Ash Lifecycle Deployed Observation/);
assert.match(deployedJob, /ash-lifecycle-production-probe\.mjs/);
assert.doesNotMatch(deployedJob, /run-ash-keep-production-probe\.mjs/);
assert.match(lifecycleProbeCompiler, /ash-lifecycle-production-probe-base\.mjs/);
assert.match(lifecycleProbeCompiler, /operator-visible lifecycle surface/);
assert.match(lifecycleProbe, /td613\.ash\.lifecycle-production-observation\/v0\.1/);
assert.doesNotMatch(workflow, /IMPLEMENTED_PRODUCTION_DEMONSTRATED/);

console.log('ash-keep-production-closure-contract.test.mjs passed');
