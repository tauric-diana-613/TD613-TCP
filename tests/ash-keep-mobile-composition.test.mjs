import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import {
  actionGateForLifecycleState,
  ASH_WORKSPACE_BRIDGE_VERSION
} from '../app/dome-world/ash-workspace-bridge.js';
import {
  ASH_KEEP_MOBILE_COMPOSITION_VERSION,
  installAshKeepMobileComposition
} from '../app/dome-world/ash-keep-mobile-composition.js';

const mobileSource = fs.readFileSync(new URL('../app/dome-world/ash-keep-mobile-composition.js', import.meta.url), 'utf8');
const wrapperSource = fs.readFileSync(new URL('../app/dome-world/ash-workspace-bridge.js', import.meta.url), 'utf8');

test('workspace bridge preserves its lifecycle API through the composition wrapper', () => {
  assert.match(ASH_WORKSPACE_BRIDGE_VERSION, /^td613\.ash-keep\.workspace-bridge\//);
  assert.equal(actionGateForLifecycleState('CASE_BOUND', 'case').allowed, true);
  assert.match(wrapperSource, /export \* from '\.\/ash-workspace-bridge-core\.js'/);
  assert.match(wrapperSource, /import '\.\/ash-keep-mobile-composition\.js'/);
});

test('mobile composition creates a compact multi-row navigation surface', () => {
  assert.match(ASH_KEEP_MOBILE_COMPOSITION_VERSION, /^td613\.ash-keep\.mobile-composition\//);
  assert.match(mobileSource, /grid-template-columns: repeat\(4, minmax\(0, 1fr\)\)/);
  assert.match(mobileSource, /grid-auto-rows: 42px/);
  assert.match(mobileSource, /\.eyebrow \{ display: none; \}/);
});

test('map controls and legend move outside the mobile canvas', () => {
  assert.match(mobileSource, /\.map-tools \{[\s\S]*?position: static/);
  assert.match(mobileSource, /content: 'Map controls'/);
  assert.match(mobileSource, /\.map-legend \{[\s\S]*?position: static/);
  assert.match(mobileSource, /height: clamp\(340px, 50svh, 480px\)/);
});

test('case entry becomes a bounded mobile bottom sheet', () => {
  assert.match(mobileSource, /\.launch \{[\s\S]*?align-items: end/);
  assert.match(mobileSource, /max-height: min\(88svh, 760px\)/);
  assert.match(mobileSource, /env\(safe-area-inset-bottom\)/);
});

test('installer remains inert without a browser document', () => {
  assert.equal(installAshKeepMobileComposition(undefined), false);
});
