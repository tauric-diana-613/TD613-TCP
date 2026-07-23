import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const moduleSource = read('app/dome-world/ash-whole-instrument-pedagogy.js');
const css = read('app/dome-world/ash-whole-instrument-pedagogy.css');
const bridge = read('app/dome-world/ash-workspace-bridge.js');
const field = read('app/dome-world/ash-flowcore-pedagogy-field.js');
const closureWorkflow = read('.github/workflows/ash-keep-production-closure.yml');
const receipt = read('app/dome-world/docs/ASH_KEEP_A2_A5_IMPLEMENTATION_RECEIPT_V0_1.md');

assert.match(moduleSource, /td613\.ash\.whole-instrument-pedagogy\/v0\.1-a2-a5/);
assert.match(moduleSource, /▶ Play Consequence Field/);
assert.match(moduleSource, /How this scene is speaking/);
for (const channel of ['glyph','motion','shape','language','inspection']) {
  assert.match(moduleSource, new RegExp(`data-flowcore-channel="${channel}"`));
}
assert.match(moduleSource, /openInspection/);
assert.match(moduleSource, /prefers-reduced-motion: reduce/);
assert.match(moduleSource, /static_parity: true/);

for (const scene of ['ingress','home','map','work','choir','capsule']) {
  assert.match(moduleSource, new RegExp(`\\b${scene}: Object\\.freeze`));
}
assert.doesNotMatch(moduleSource, /new MutationObserver|setInterval\(/);
assert.match(field, /let field = null/);

for (const [route, label] of [
  ['EXPERIENTIAL','Learn by doing'],
  ['CUSTODIAL','Protect the source'],
  ['AUDIT','Check the evidence'],
  ['IMPLEMENTATION','Inspect the machinery']
]) {
  assert.match(moduleSource, new RegExp(`${route}:[\\s\\S]*?label: '${label}'`));
}
assert.match(moduleSource, /Your case path/);
assert.match(moduleSource, /See what stays local, what may change, and where a human decision is still required\./);
assert.match(moduleSource, /route_inference: false/);
assert.match(moduleSource, /td613\.ash\.transition-delta\/v0\.1/);
for (const preserved of ['case state','authority','source bytes','custody','claim ceiling','release posture','human closure']) {
  assert.match(moduleSource, new RegExp(`'${preserved}'`));
}
for (const invariant of [
  'authority_changed: false',
  'source_bytes_moved: false',
  'custody_changed: false',
  'claim_ceiling_changed: false',
  'release_posture_changed: false',
  'closure_changed: false'
]) assert.match(moduleSource, new RegExp(invariant));

assert.match(moduleSource, /td613\.ash\.navigation-receipt\/v0\.1/);
for (const fieldName of [
  'source_control','source_workspace','destination_workspace','destination_heading',
  'destination_anchor','prior_viewport_owner','new_viewport_owner','return_path','result'
]) assert.match(moduleSource, new RegExp(`${fieldName}:`));
assert.match(moduleSource, /EXPLICIT_NAVIGATION_GESTURE/);
assert.match(moduleSource, /scrollIntoView/);
assert.match(moduleSource, /preventScroll:true/);
assert.match(moduleSource, /event\.stopImmediatePropagation\(\)/);
assert.match(moduleSource, /ingress-\$\{type\}/);

assert.match(css, /ash-whole-instrument-play/);
assert.match(css, /bottom:14px/);
assert.match(css, /ash-channel-legend/);
assert.match(css, /ash-route-surface/);
assert.match(css, /ash-command-attention/);
assert.match(css, /prefers-reduced-motion:reduce/);
assert.match(bridge, /ash-whole-instrument-pedagogy\.js\?v=20260723-a2-a5-v1/);

assert.doesNotMatch(closureWorkflow, /\n  workflow_run:/);
assert.doesNotMatch(closureWorkflow, /github\.event\.workflow_run/);
assert.match(closureWorkflow, /RUN_DEPLOYED_OBSERVATION/);
assert.match(closureWorkflow, /inputs\.base_url/);

assert.match(receipt, /new serverless function = false/);
assert.match(receipt, /active serverless functions = 11/);
assert.match(receipt, /reserved function capacity = 1/);
assert.doesNotMatch(moduleSource, /\/api\//);

console.log('Ash A2-A5 whole-instrument contracts: PASS');
