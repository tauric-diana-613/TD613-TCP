import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const bridge = read('app/dome-world/ash-workspace-bridge.js');
const exporter = read('app/dome-world/ash-return-ready-bundle.js');
const runtime = read('app/dome-world/ash-custodian-return-closure.js');
const engine = read('app/engine/ash-custodian-return-closure.js');
const probe = read('scripts/ash-custodian-return-production-probe.mjs');
const fixture = read('scripts/ash-custodian-return-fixture.mjs');
const validationWorkflow = read('.github/workflows/ash-custodian-return.yml');
const deployedWorkflow = read('.github/workflows/ash-custodian-return-deployed.yml');

assert.match(bridge, /ash-return-ready-bundle\.js[\s\S]*ash-custodian-return\.js[\s\S]*ash-custodian-return-closure\.js/);
for (const token of [
  'td613.ash.return-ready-bundle/v0.1',
  'td613.ash.custodian-return-hold/v0.1',
  'td613.ash.custodian-return-replay/v0.1',
  'td613.ash.custodian-return-production-observation/v0.1',
  'CONTINUITY_SEALED',
  'WRONG_PASSPHRASE',
  'TAMPER_HOLD',
  'PARTIAL_CAPSULE_HOLD',
  'STALE_RECEIPT_HOLD',
  'INTERRUPTED_IMPORT_HOLD',
  'REPLAY_HOLD'
]) assert.ok(engine.includes(token), `Closure engine omitted ${token}`);

assert.match(exporter, /compileReturnReadyBundle/);
assert.match(exporter, /verifyReturnReadyBundle/);
assert.match(exporter, /window\.__td613AshLifecycleRefresh/);
assert.match(exporter, /returnReadyBundle/);
assert.match(exporter, /CONTINUITY_SEALED/);
assert.doesNotMatch(exporter, /fetch\s*\(/, 'Return-ready export must stay browser-local.');
assert.doesNotMatch(exporter, /recipient_transport_allowed:\s*true|automatic_cinder_allowed:\s*true/);

for (const token of [
  'td613-ash-return-sandbox',
  "['returns', 'imports', 'holds', 'replays']",
  'verifyReturnReadyBundle',
  'compileReturnReplayReceipt',
  'recoverInterruptedImports',
  'seedInterruptedImportForProbe',
  'No universal recovery score was emitted',
  "setAttribute('aria-live', 'polite')"
]) assert.ok(runtime.includes(token), `Closure runtime omitted ${token}`);
assert.match(runtime, /live Ash case remained untouched/i);
assert.doesNotMatch(runtime, /\/api\/hush-generate|navigator\.share|recipient_transport\s*[:=]\s*['"](?:ENABLED|ACTIVE|SENT)/i);

for (const token of [
  'valid_return', 'wrong_passphrase', 'tamper', 'partial_capsule', 'stale_receipt', 'interrupted_import', 'replay',
  'custodian-return-desktop.png', 'custodian-return-mobile.png', 'prefers-reduced-motion',
  'providerRequests.length', 'recipientTransportRequests.length', 'liveCaseMutations.length', 'cinderActions.length',
  'promotion_authorized: false'
]) assert.ok(probe.includes(token), `Production probe omitted ${token}`);
assert.match(fixture, /SYNTHETIC|Synthetic/);
assert.match(fixture, /returnReadyBundle/);

assert.match(validationWorkflow, /Ash Custodian Return/);
assert.match(validationWorkflow, /ash-custodian-return-closure\.test\.mjs/);
assert.match(validationWorkflow, /ash-custodian-return-closure-contract\.test\.mjs/);
assert.match(validationWorkflow, /ash-custodian-return-production-probe\.mjs/);
assert.doesNotMatch(validationWorkflow, /workflow_run|statuses: write|TD613_OBSERVER_STATUS_CONTEXT/);

assert.match(deployedWorkflow, /Ash Custodian Return Deployed/);
assert.match(deployedWorkflow, /workflow_run/);
assert.match(deployedWorkflow, /Test and deploy static app/);
assert.match(deployedWorkflow, /statuses: write/);
assert.match(deployedWorkflow, /Ash Custodian Return Deployed Observation/);
assert.match(deployedWorkflow, /Publish Return observer pending status/);
assert.match(deployedWorkflow, /Publish Return observer success status/);
assert.match(deployedWorkflow, /Publish Return observer failure status/);
assert.match(deployedWorkflow, /publish-ash-keep-observer-status\.mjs/);
assert.match(deployedWorkflow, /promotion_authorized/);
assert.doesNotMatch(deployedWorkflow, /IMPLEMENTED_PRODUCTION_DEMONSTRATED/);

console.log('Ash Custodian Return production-closure contract: PASS');
