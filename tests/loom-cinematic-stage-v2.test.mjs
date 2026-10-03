import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../app/dome-world/holonomy-loom.html',import.meta.url),'utf8');
const product=fs.readFileSync(new URL('../app/dome-world/holonomy-loom/loom-product-v4.css',import.meta.url),'utf8');
const workspace=fs.readFileSync(new URL('../app/dome-world/holonomy-loom/ai-workspace.js',import.meta.url),'utf8');
const instrument=fs.readFileSync(new URL('../app/dome-world/holonomy-loom/instrument-state-view.js',import.meta.url),'utf8');

test('animation-native shell replaces the override cascade',()=>{
  assert.match(html,/loom-product-v4\\.css/);
  assert.doesNotMatch(html,/ai-workspace\.css|reentry-workspace\.css|loom-product-v3\.css|ux-repair\.css|cinematic-rescue\.css|dromological-regime\.css|cinematic-stage-v2\.css/);
  assert.match(product,/#loomAiWorkspace \.loom-stage/);
  assert.match(product,/#loomAiWorkspace \.loom-builder/);
});

test('one coordinator remains the animation owner',()=>{
  assert.match(workspace,/new AnimationCoordinator\(\{ durationMs: 4000, maxFps: 60/);
  assert.match(instrument,/owns_animation_loop: false/);
  assert.doesNotMatch(product,/@keyframes|animation\s*:/);
});

test('mobile reduces decorative mutation density without changing relation grammar',()=>{
  assert.match(instrument,/const filamentCount = compact \? 10 : filaments\.length/);
  assert.match(instrument,/const particleCount = compact \? 12 : particles\.length/);
  assert.match(instrument,/const flightCount = compact \? 12 : flightGlyphs\.length/);
  assert.match(instrument,/const depthCount = compact \? 4 : depth\.length/);
  for(const glyph of ['à','米','出','上','下','cōl','hõt','𝄐']) assert.ok(instrument.includes(glyph));
});
