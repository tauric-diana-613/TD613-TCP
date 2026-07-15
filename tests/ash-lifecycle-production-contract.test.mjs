import assert from 'node:assert/strict';
import fs from 'node:fs';
import handler from '../api/dome-world-shell.js';

const read = path => fs.readFileSync(path, 'utf8');
const workflow = read('.github/workflows/ash-keep-production-closure.yml');
const probeCompiler = read('scripts/ash-lifecycle-production-probe.mjs');
const probeBase = read('scripts/ash-lifecycle-production-probe-base.mjs');
const probe = `${probeCompiler}\n${probeBase}`;
const shell = read('api/dome-world-shell.js');
const receipt = read('docs/ASH_LIFECYCLE_PRODUCTION_DEMO_RECEIPT.md');
const ledger = read('docs/ASH_KEEP_BUILDOUT_LEDGER.md');
const roadmap = read('ROADMAP.md');

function invokeShell(req) {
  const headers = new Map();
  let body = '';
  const res = {
    statusCode: 0,
    setHeader(name, value) { headers.set(String(name).toLowerCase(), String(value)); },
    end(value = '') { body = String(value); }
  };
  handler(req, res);
  return { statusCode: res.statusCode, headers, body };
}

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
assert.match(probeCompiler, /ash-lifecycle-production-probe-base\.mjs/);
assert.match(probeCompiler, /operator-visible lifecycle surface/);
assert.match(probeCompiler, /ash-lifecycle-production-probe\.runtime\.mjs/);
assert.match(probeCompiler, /pathToFileURL/);
assert.match(probeBase, /meta\[name="ash-lifecycle"\]\[content="v0\.1"\]/);
assert.match(probeBase, /#workspace-custody/);

assert.match(shell, /ASH_KEEP_JS_SHELL_VERSION = 'td613\.ash-keep\.js-shell\/v0\.2-review-refresh'/);
assert.match(shell, /td613 lifecycle review refresh/);
assert.match(shell, /setTimeout\(\(\) => location\.reload\(\), 160\)/);
assert.match(shell, /searchParams\.get\('arrival'\) === 'cleared'/);
assert.match(shell, /req\.query\?\.arrival === 'cleared'/);

const arrivalOnly = invokeShell({
  method: 'GET',
  url: '/api/dome-world-shell?arrival=cleared',
  query: { arrival: 'cleared' }
});
assert.equal(arrivalOnly.statusCode, 200);
assert.equal(arrivalOnly.headers.get('x-td613-ash-keep-shell'), 'td613.ash-keep.shell/v0.1');
assert.match(arrivalOnly.body, /<title>TD613 Ash Keep · Case Map<\/title>/);
assert.match(arrivalOnly.body, /<meta name="ash-lifecycle" content="v0\.1">/);
assert.match(arrivalOnly.body, /<script type="module" src="\/dome-world\/ash-lifecycle\.js"><\/script>/);
assert.doesNotMatch(arrivalOnly.body, /<title>TD613 Dome-World/);

const explicitSurface = invokeShell({
  method: 'GET',
  url: '/api/dome-world-shell?surface=ash-keep-html&arrival=cleared',
  query: { surface: 'ash-keep-html', arrival: 'cleared' }
});
assert.equal(explicitSurface.statusCode, 200);
assert.equal(explicitSurface.headers.get('x-td613-ash-keep-shell'), 'td613.ash-keep.shell/v0.1');
assert.match(explicitSurface.body, /name="ash-lifecycle" content="v0\.1"/);

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
