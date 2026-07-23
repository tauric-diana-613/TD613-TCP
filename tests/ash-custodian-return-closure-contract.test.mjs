import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const bridge = read('app/dome-world/ash-workspace-bridge.js');
const exporter = read('app/dome-world/ash-return-ready-bundle.js');
const runtime = read('app/dome-world/ash-custodian-return-closure.js');
const engine = read('app/engine/ash-custodian-return-closure.js');
const probe = read('scripts/ash-custodian-return-production-probe.mjs');
const fixture = read('scripts/ash-custodian-return-fixture.mjs');
const workflow = read('.github/workflows/td613-ci.yml');
const statusPublisher = read('scripts/publish-ash-keep-observer-status.mjs');

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

for (const token of [
  'Ash Custodian Return contracts',
  'node tests/ash-custodian-return.test.mjs',
  'node tests/ash-custodian-return-contract.test.mjs',
  'node tests/ash-custodian-return-closure.test.mjs',
  'node tests/ash-custodian-return-closure-contract.test.mjs'
]) assert.match(workflow, new RegExp(token.replaceAll('.', '\\.')));
assert.match(workflow, /permissions:\s*\n\s*contents: read/);
assert.doesNotMatch(workflow, /statuses: write/);
assert.equal(fs.existsSync('.github/workflows/ash-custodian-return.yml'), false,
  'Custodian Return must remain a contract suite, not regain an independent push workflow.');
assert.equal(fs.existsSync('.github/workflows/ash-custodian-return-deployed.yml'), false,
  'The unregistered standalone observer must not remain as a second authority surface.');

assert.match(statusPublisher, /Ash Keep Deployed Observation/);
assert.match(statusPublisher, /Ash Lifecycle Deployed Observation/);
assert.match(statusPublisher, /Ash Custodian Return Local Observation/);
assert.match(statusPublisher, /Ash Custodian Return Deployed Observation/);
assert.match(statusPublisher, /promotion_authorized: false/);
assert.doesNotMatch(workflow, /publish-ash-keep-observer-status\.mjs/,
  'Consolidated CI must validate Return contracts without publishing automatic commit statuses.');

console.log('Ash Custodian Return production-closure contract: PASS');
