import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import {
  A15_R0_PROJECTIONS,
  getProjectionDescriptor
} from '../app/dome-world/previews/a15-r0/projection-registry.js';
import {
  ASH_DEMO_ASSET_EPOCH,
  ASH_DEMO_REGISTRY_VERSION
} from '../app/dome-world/ash-demo-registry.js';

const BASE = '90c2b2da6a925e24f4c4e270dbff2098e309ee9d';
const html = fs.readFileSync('app/dome-world/previews/a15-r0/index.html', 'utf8');
const css = fs.readFileSync('app/dome-world/previews/a15-r0/a15-r0-harness.css', 'utf8');
const harness = fs.readFileSync('app/dome-world/previews/a15-r0/a15-r0-harness.js', 'utf8');
const receipt = fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/ASH_KEEP_A15_R0_OPERATOR_REJECTION_FREEZE_RECEIPT_V0_1.md', 'utf8');

assert.equal(A15_R0_PROJECTIONS.length, 3);
assert.deepEqual(A15_R0_PROJECTIONS.map(value => value.projection_id), ['A15_CONTROL', 'MINIMAL_ASH', 'PROTO_LOOM']);
for (const descriptor of A15_R0_PROJECTIONS) {
  assert.equal(descriptor.canonical, false);
  assert.equal(descriptor.preview_only, true);
  assert.equal(descriptor.disposable, true);
  assert.equal(descriptor.production_cutover_authorized, false);
  assert.equal(descriptor.deployment_authorized, false);
  assert.equal(descriptor.human_selection_required, true);
}
assert.equal(getProjectionDescriptor('A15_CONTROL').implementation_status, 'OBSERVABLE_CONTROL');
assert.equal(getProjectionDescriptor('A15_CONTROL').mutated_by_assay, false);
for (const id of ['MINIMAL_ASH', 'PROTO_LOOM']) {
  const descriptor = getProjectionDescriptor(id);
  assert.equal(descriptor.implementation_status, 'NOT_IMPLEMENTED');
  assert.deepEqual(descriptor.declared_controls, []);
  assert.equal(descriptor.entry_route, null);
}

for (const marker of [
  'Preview',
  'Synthetic',
  'Noncanonical',
  'Production unchanged',
  'No external transmission',
  'Human selection required',
  'Keep a reference with this case',
  'Connect it to the question',
  'Compare two routes',
  'Preserve this result',
  'Return to custody',
  'Rest',
  'Reset synthetic run',
  'Missingness',
  'Claim ceiling',
  'Last action receipt',
  'Current projection descriptor',
  'Interaction ownership',
  'Observable interface events'
]) assert.ok(html.includes(marker), `Preview omitted visible marker: ${marker}`);
assert.match(html, /<meta name="viewport"/);
assert.match(html, /role="status" aria-live="polite"/);
assert.match(css, /@media \(max-width: 520px\)/);
assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(css, /:focus-visible/);
assert.match(css, /min-height: 48px/);
assert.match(harness, /FIXTURE_URL = '\.\.\/\.\.\/fixtures\/a15-r0\/governed-task-fixture-v01\.json'/);
assert.match(harness, /button\.addEventListener\('click'/);
assert.doesNotMatch(harness, /stopImmediatePropagation|\.click\(\)|MutationObserver|indexedDB|localStorage|sessionStorage|caches\.|serviceWorker|sendBeacon|XMLHttpRequest/);
assert.doesNotMatch(html, /href="[^"]*(?:minimal-ash|proto-loom)|button[^>]*(?:minimal|loom)/i);
assert.equal((harness.match(/fetch\s*\(/g) || []).length, 1);
assert.match(harness, /fetch\(FIXTURE_URL, \{ cache: 'no-store', credentials: 'same-origin' \}\)/);

assert.equal(ASH_DEMO_REGISTRY_VERSION, 'td613.ash.demo-registry/v0.3-a15');
assert.equal(ASH_DEMO_ASSET_EPOCH, '20260726-a15-empirical-v1');

const p0Files = [
  'app/dome-world/ash-keep.html',
  'app/dome-world/ash-workspace-bridge.js',
  'app/dome-world/ash-premium-ui.js',
  'app/dome-world/ash-premium-ui.css',
  'app/dome-world/ash-premium-compatibility.js',
  'app/dome-world/ash-whole-instrument-pedagogy.js',
  'app/dome-world/ash-whole-instrument-pedagogy.css',
  'app/dome-world/ash-demo-entry-convergence.js',
  'app/dome-world/ash-flowcore-workspace-remount.js',
  'app/dome-world/ash-ui-ux-rescue.js'
];
const p0Diff = execFileSync('git', ['diff', '--name-only', BASE, '--', ...p0Files], { encoding: 'utf8' }).trim();
assert.equal(p0Diff, '', 'The A15 control witness was mutated by the assay.');

for (const marker of [
  'A15 technical production closure = PASSED',
  'A15 operator acceptance = FAILED',
  'current A15 production shell = WITNESS / NOT ACCEPTED',
  'A16 implementation = HELD',
  'Golden Egg implementation = HELD',
  'production action = NONE',
  'deployment action = NONE',
  'historical A15 receipts rewritten = false',
  'operator media received in this implementation session = false',
  'media evidence status = MISSING / MAY BE ADDED LATER'
]) assert.ok(receipt.includes(marker), `R0.0 receipt omitted ${marker}`);

console.log(JSON.stringify({
  ok: true,
  schema: 'td613.ash.a15-r0.preview-contract-test/v0.1',
  descriptors: A15_R0_PROJECTIONS.length,
  p0_mutated: false,
  p1_implemented: false,
  p2_implemented: false,
  production_mutation: false,
  deployment_authorized: false,
  human_selection_required: true
}, null, 2));
