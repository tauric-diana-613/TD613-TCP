import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const html = fs.readFileSync(new URL('../app/dome-world/holonomy-loom.html', import.meta.url), 'utf8');
const product = fs.readFileSync(new URL('../app/dome-world/holonomy-loom/loom-product-v4.css', import.meta.url), 'utf8');
const workspaceSource = fs.readFileSync(new URL('../app/dome-world/holonomy-loom/ai-workspace.js', import.meta.url), 'utf8');
const instrumentSource = fs.readFileSync(new URL('../app/dome-world/holonomy-loom/instrument-state-view.js', import.meta.url), 'utf8');

test('primary Loom is one product route, not a nested laboratory archive', () => {
  const doc = new JSDOM(html).window.document;
  assert.equal(doc.querySelectorAll('#loomLegacy').length, 0);
  assert.equal(doc.querySelectorAll('.hero,.wrap').length, 0);
  assert.equal(doc.querySelector('a[href="/dome-world/loom-instrument-lab.html"]')?.textContent, 'Lab');
  assert.equal(doc.querySelectorAll('link[href*="ai-workspace.css"],link[href*="reentry-workspace.css"],link[href*="loom-product-v3.css"],link[href*="ux-repair.css"],link[href*="cinematic-rescue.css"],link[href*="dromological-regime.css"]').length,0);
});

test('Flow-Core field owns the first product viewport', () => {
  assert.match(workspaceSource, /<section class="loom-stage"/);
  assert.ok(workspaceSource.indexOf('id="aiRuntime"') < workspaceSource.indexOf('id="loomBuilder"'));
  assert.match(product, /\.loom-stage\{[^}]*min-height:calc\(100svh - 52px\)/);
  assert.match(product, /#loomAiWorkspace \.ai-runtime\{[\s\S]*position:absolute!important;inset:0!important/);
});

test('mobile is authored around the field rather than squeezed from desktop', () => {
  assert.match(product, /@media\(max-width:760px\)/);
  assert.match(product, /\.loom-stage\{min-height:calc\(100svh - 48px\);height:calc\(100svh - 48px\)\}/);
  assert.match(product, /\.loom-builder\{width:calc\(100% - 28px\)/);
  assert.match(product, /#aiPreparePortable,#loomAiWorkspace #aiRun,#loomAiWorkspace #aiStop\{width:100%!important/);
  assert.doesNotMatch(product, /Georgia|Times New Roman|var\(--serif\)/);
});

test('product shell owns no second animation clock or network authority', () => {
  for (const forbidden of [/requestAnimationFrame/,/setInterval\s*\(/,/fetch\s*\(/,/XMLHttpRequest/,/WebSocket/,/@keyframes|animation\s*:/]) assert.doesNotMatch(product,forbidden);
});

test('return admission remains absent from the default journey until a Loom session exists', () => {
  assert.match(workspaceSource, /id="aiReentryWorkspace" aria-label="Returned work admission" hidden/);
  assert.match(workspaceSource, /\$\('aiReentryWorkspace'\)\.hidden=false;[\s\S]*await reentry\.setSession/);
});

test('cinematic Flow-Core traffic remains evidence-bound and single-clock', () => {
  assert.match(instrumentSource, /event_relation_history: eventRelationHistory/);
  assert.match(instrumentSource, /view\.event_relation_history/);
  assert.match(instrumentSource, /owns_animation_loop: false/);
  assert.match(instrumentSource, /const filamentCount = compact \? 10 : filaments\.length/);
  assert.match(instrumentSource, /const flightCount = compact \? 12 : flightGlyphs\.length/);
});

test('Loom product chrome does not reintroduce SHI or speculative release authority', () => {
  assert.doesNotMatch(workspaceSource, /id="aiShi"|Safe Harbor issuance|validateShi|issuanceHold/);
  assert.match(workspaceSource, /const awake = \(Boolean\(acceptedTask\) \|\| locallyAdmitted\) && !busy/);
});
