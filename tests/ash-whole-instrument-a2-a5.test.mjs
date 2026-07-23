import assert from 'node:assert/strict';
import fs from 'node:fs';

const moduleSource = fs.readFileSync('app/dome-world/ash-whole-instrument-a2-a5.js', 'utf8');
const cssSource = fs.readFileSync('app/dome-world/ash-whole-instrument-a2-a5.css', 'utf8');
const bridgeSource = fs.readFileSync('app/dome-world/ash-workspace-bridge.js', 'utf8');
const closureWorkflow = fs.readFileSync('.github/workflows/ash-keep-production-closure.yml', 'utf8');

for (const required of [
  "td613.ash.whole-instrument-a2-a5/v0.1",
  "td613.ash.workspace-scene/v0.1",
  "td613.ash.navigation-receipt/v0.1",
  "Learn by doing",
  "Protect the source",
  "Check the evidence",
  "Inspect the machinery",
  "Your case path",
  "How this scene is speaking",
  "▶ Play Consequence Field",
  "one_field: true",
  "one_clock: true",
  "automatic_ash_action: false",
  "source_bytes_moved: false",
  "authority_changed: false",
  "human_closure_required: true"
]) assert.ok(moduleSource.includes(required), `missing A2-A5 contract: ${required}`);

assert.equal((moduleSource.match(/new MutationObserver/g) || []).length, 0, 'A2-A5 adds no ambient observer');
assert.equal((moduleSource.match(/setInterval\(/g) || []).length, 0, 'A2-A5 adds no polling clock');
assert.equal((moduleSource.match(/\.ash-flowcore-field/g) || []).length > 0, true, 'A2-A5 targets the canonical field');
assert.ok(!moduleSource.includes('inferRoute'), 'route inference remains absent');
assert.ok(!moduleSource.includes('/api/'), 'pedagogy layer adds no serverless or transport route');

for (const required of [
  'data-channel-active',
  'prefers-reduced-motion:reduce',
  'ash-a2-a5-menu-attention',
  'ash-a2-a5-route-delta'
]) assert.ok(cssSource.includes(required), `missing A2-A5 style contract: ${required}`);

assert.ok(bridgeSource.includes("import './ash-whole-instrument-a2-a5.js?v=20260723-a2-a5-v1';"), 'bridge loads A2-A5 after inherited owners');
assert.ok(!closureWorkflow.includes('workflow_run:'), 'production closure no longer observes stale production automatically after a main push');
assert.ok(closureWorkflow.includes("github.event_name == 'workflow_dispatch'"), 'deployed observation remains explicit');

console.log('Ash whole-instrument A2-A5 contracts passed.');
