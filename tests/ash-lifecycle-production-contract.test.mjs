import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const workflow = read('.github/workflows/ash-keep-production-closure.yml');
const probe = read('scripts/ash-lifecycle-production-probe.mjs');
const threshold = read('app/dome-world/ash-threshold.html');
const shell = read('api/dome-world-shell.js');
const receipt = read('docs/ASH_LIFECYCLE_PRODUCTION_DEMO_RECEIPT.md');
const ledger = read('docs/ASH_KEEP_BUILDOUT_LEDGER.md');
const roadmap = read('ROADMAP.md');

assert.match(workflow, /Ash Lifecycle Deployed Observation/);
assert.match(workflow, /TD613 Ash · Threshold/);
assert.match(workflow, /name="ash-lifecycle" content="v0\.1"/);
assert.match(workflow, /Observe deployed Ash lifecycle without promotion/);
assert.match(workflow, /node scripts\/ash-lifecycle-production-probe\.mjs/);
const deployedJob = workflow.split('  deployed-observation:')[1] || '';
assert.doesNotMatch(deployedJob, /run-ash-keep-production-probe/);
assert.match(deployedJob, /CONTINUITY_SEALED/);
assert.match(deployedJob, /promotion remains separate/i);

for (const token of [
  'ARRIVAL_UNPERSISTED',
  'READINESS_OBSERVED',
  'CASE_BOUND',
  'REBUILD_ELIGIBLE',
  'RELEASE_ELIGIBLE',
  'CONTINUITY_SEALED',
  'ash-custody-register',
  'raw_artifact_in_request_body',
  'provider_or_transport_requests',
  'ash-lifecycle-mobile-portrait.png',
  'ash-lifecycle-mobile-landscape.png'
]) assert.ok(probe.includes(token), `Lifecycle probe omitted ${token}`);
assert.match(probe, /promotion_authorized: false/);
assert.match(probe, /readiness is not custody/);
assert.match(probe, /continuity is not transport/);
assert.match(probe, /waitForURL\([^\n]+arrival=cleared/);

assert.match(threshold, /sessionStorage\.setItem\('td613:ash-threshold:readiness:v0\.1'/);
assert.match(threshold, /location\.replace\('\/dome-world\/ash-keep\.html\?arrival=cleared&surface=ash-keep-html'\)/);
assert.match(threshold, /readiness observation into Ash Keep/);

assert.match(shell, /ASH_KEEP_JS_SHELL_VERSION = 'td613\.ash-keep\.js-shell\/v0\.2-review-refresh'/);
assert.match(shell, /surface === 'ash-keep-html'/);
assert.match(shell, /td613 lifecycle review refresh/);
assert.match(shell, /setTimeout\(\(\) => location\.reload\(\), 160\)/);

assert.match(receipt, /Status: `NOT_YET_EARNED`/);
assert.match(receipt, /promotion_authorized: false/);
assert.match(receipt, /deployed threshold → readiness → custody root → case binding/i);
assert.match(receipt, /A passing workflow does not edit this receipt automatically/i);

assert.match(ledger, /H\. Ash product lifecycle orchestration \| \*\*24 \/ 35\*\*/);
assert.match(ledger, /main = 147 \/ 330/);
assert.match(ledger, /PR `#297`/);
assert.match(ledger, /production demonstration remains unearned/i);
assert.match(roadmap, /Ash lifecycle production closure/);
assert.match(roadmap, /SELECTED_NEXT/);
assert.match(roadmap, /calibration receipt binding.*AFTER/i);

console.log('ash-lifecycle-production-contract.test.mjs passed');
