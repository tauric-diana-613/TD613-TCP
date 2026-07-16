import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const bridge = read('app/dome-world/ash-workspace-bridge.js');
const exporter = read('app/dome-world/ash-return-ready-bundle.js');
const runtime = read('app/dome-world/ash-custodian-return-closure.js');
const engine = read('app/engine/ash-custodian-return-closure.js');
const probe = read('scripts/ash-custodian-return-production-probe.mjs');
const fixture = read('scripts/ash-custodian-return-fixture.mjs');
const workflow = read('.github/workflows/ash-custodian-return.yml');

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

assert.match(workflow, /Ash Custodian Return/);
assert.match(workflow, /validate-and-local-observe:/);
assert.match(workflow, /deployed-observation:/);
assert.match(workflow, /if: github\.event_name == 'push'/);
assert.match(workflow, /needs: validate-and-local-observe/);
assert.match(workflow, /ash-custodian-return-closure\.test\.mjs/);
assert.match(workflow, /ash-custodian-return-closure-contract\.test\.mjs/);
assert.match(workflow, /ash-custodian-return-production-probe\.mjs/);
assert.match(workflow, /statuses: write/);
assert.match(workflow, /Ash Custodian Return Deployed Observation/);
assert.match(workflow, /Wait for deployed Stretch 2 closure surfaces/);
assert.match(workflow, /Publish Return observer pending status/);
assert.match(workflow, /Publish Return observer success status/);
assert.match(workflow, /Publish Return observer failure status/);
assert.match(workflow, /publish-ash-keep-observer-status\.mjs/);
assert.match(workflow, /promotion_authorized/);
assert.doesNotMatch(workflow, /IMPLEMENTED_PRODUCTION_DEMONSTRATED/);
assert.equal(fs.existsSync('.github/workflows/ash-custodian-return-deployed.yml'), false, 'The unregistered standalone observer must not remain as a second authority surface.');

console.log('Ash Custodian Return production-closure contract: PASS');
