import assert from 'node:assert/strict';
import fs from 'node:fs';
import handler from '../api/dome-world-shell.js';

const read = path => fs.readFileSync(path, 'utf8');
const workflow = read('.github/workflows/ash-keep-production-closure.yml');
const probeRunner = read('scripts/ash-lifecycle-production-probe.mjs');
const probeBase = read('scripts/ash-lifecycle-production-probe-base.mjs');
const probe = `${probeRunner}\n${probeBase}`;
const shell = read('api/dome-world-shell.js');
const adapter = read('app/dome-world/ash-keep-entry.html');
const adapterJs = read('app/dome-world/ash-keep-entry.js');
const keepSource = read('app/dome-world/ash-keep.html');
const deliverySource = read('app/dome-world/ash-keep-source.html');
const receipt = read('docs/ASH_LIFECYCLE_PRODUCTION_DEMO_RECEIPT.md');
const ledger = read('docs/ASH_KEEP_BUILDOUT_LEDGER.md');
const roadmap = read('ROADMAP.md');

function invokeShell(req) {
  const headers = new Map();
  let body = '';
  const res = { statusCode: 0, setHeader(name, value) { headers.set(String(name).toLowerCase(), String(value)); }, end(value = '') { body = String(value); } };
  handler(req, res);
  return { statusCode: res.statusCode, headers, body };
}

for (const marker of [
  /Ash Lifecycle Deployed Observation/,
  /TD613 Ash · Threshold/,
  /name="ash-lifecycle" content="v0\.1"/,
  /Observe deployed Ash lifecycle without promotion/,
  /node scripts\/ash-lifecycle-production-probe\.mjs/
]) assert.match(workflow, marker);
const deployedJob = workflow.split('  deployed-observation:')[1] || '';
assert.doesNotMatch(deployedJob, /run-ash-keep-production-probe/);
assert.match(deployedJob, /CONTINUITY_SEALED/);
assert.match(deployedJob, /promotion remains separate/i);

for (const token of [
  'ARRIVAL_UNPERSISTED', 'READINESS_OBSERVED', 'CASE_BOUND', 'REBUILD_ELIGIBLE', 'RELEASE_ELIGIBLE', 'CONTINUITY_SEALED',
  'ash-custody-register', 'raw_artifact_in_request_body', 'provider_or_transport_requests',
  'ash-lifecycle-mobile-portrait.png', 'ash-lifecycle-mobile-landscape.png',
  'SYNTHETIC_DRAFT', 'draft_body_sha256', 'Synthetic draft entered a request body'
]) assert.ok(probe.includes(token), `Lifecycle probe omitted ${token}`);
assert.match(probeRunner, /ash-lifecycle-production-probe-base\.mjs/);
assert.match(probeRunner, /ash-lifecycle-production-probe\.runtime\.mjs/);
assert.match(probeRunner, /#draftBody/);
assert.match(probe, /promotion_authorized: false/);
assert.match(probe, /readiness is not custody/);
assert.match(probe, /continuity is not transport/);

assert.match(shell, /ASH_KEEP_ENTRY_ROUTE = '\/dome-world\/ash-keep-entry\.html'/);
assert.match(shell, /ASH_KEEP_JS_SHELL_VERSION = 'td613\.ash-keep\.js-shell\/v0\.2-review-refresh'/);
assert.match(shell, /td613 lifecycle review refresh/);
assert.match(shell, /searchParams\.get\('arrival'\) === 'cleared'/);
assert.match(shell, /redirectAshKeepDocument/);
assert.equal(deliverySource, keepSource, 'Static delivery source drifted from the canonical Ash Keep document');
assert.match(adapter, /name="ash-delivery-adapter" content="v0\.1"/);
assert.match(adapter, /name="ash-lifecycle" content="v0\.1"/);
assert.match(adapterJs, /ash-keep-source\.html\?delivery=td613-static-v0\.1/);
assert.match(adapterJs, /document\.open\('text\/html', 'replace'\)/);

const arrivalOnly = invokeShell({ method: 'GET', url: '/api/dome-world-shell?arrival=cleared', query: { arrival: 'cleared' } });
assert.equal(arrivalOnly.statusCode, 307);
assert.equal(arrivalOnly.headers.get('location'), '/dome-world/ash-keep-entry.html');
assert.equal(arrivalOnly.headers.get('x-td613-ash-keep-shell'), 'td613.ash-keep.shell/v0.1');
const explicitSurface = invokeShell({ method: 'GET', url: '/api/dome-world-shell?surface=ash-keep-html&arrival=cleared', query: { surface: 'ash-keep-html', arrival: 'cleared' } });
assert.equal(explicitSurface.statusCode, 307);
assert.equal(explicitSurface.headers.get('location'), '/dome-world/ash-keep-entry.html');
const headSurface = invokeShell({ method: 'HEAD', url: '/api/dome-world-shell?surface=ash-keep-html', query: { surface: 'ash-keep-html' } });
assert.equal(headSurface.statusCode, 307);
assert.equal(headSurface.body, '');

assert.match(receipt, /Status: `NOT_YET_EARNED`/);
assert.match(receipt, /promotion_authorized: false/);
assert.match(receipt, /deployed threshold → readiness → custody root → case binding/i);
assert.match(ledger, /H\. Ash product lifecycle orchestration \| \*\*24 \/ 35\*\*/);
assert.match(ledger, /main = 147 \/ 330/);
assert.match(ledger, /production demonstration remains unearned/i);
assert.match(roadmap, /Ash lifecycle production closure/);
assert.match(roadmap, /SELECTED_NEXT/);
assert.match(roadmap, /calibration receipt binding.*AFTER/i);

console.log('ash-lifecycle-production-contract.test.mjs passed');
