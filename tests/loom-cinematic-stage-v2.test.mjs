import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../app/dome-world/holonomy-loom.html', import.meta.url), 'utf8');
const stage = fs.readFileSync(new URL('../app/dome-world/holonomy-loom/cinematic-stage-v2.css', import.meta.url), 'utf8');
const workspace = fs.readFileSync(new URL('../app/dome-world/holonomy-loom/ai-workspace.js', import.meta.url), 'utf8');
const instrument = fs.readFileSync(new URL('../app/dome-world/holonomy-loom/instrument-state-view.js', import.meta.url), 'utf8');

test('cinematic stage v2 is the final Loom presentation layer', () => {
  assert.match(html, /dromological-regime\.css"[\s\S]*cinematic-stage-v2\.css"/);
  assert.match(stage, /#loomAiWorkspace>\.ai-runtime\{order:-30\}/);
  assert.match(stage, /#loomAiWorkspace>\.loom-journey\{order:-20\}/);
  assert.match(stage, /font:620 clamp\(2\.35rem,4\.8vw,4\.3rem\)\/\.92 var\(--sans\)/);
});

test('mobile stage is bounded and avoids a squeezed desktop viewport', () => {
  assert.match(stage, /@media\(max-width:760px\)/);
  assert.match(stage, /width:calc\(100% - 28px\)!important/);
  assert.match(stage, /overflow-x:clip!important/);
  assert.doesNotMatch(stage, /@keyframes|animation\s*:/, 'presentation layer owns no second clock');
});

test('the one host coordinator targets smooth cadence while mobile reduces decorative mutation density', () => {
  assert.match(workspace, /maxFps: 60/);
  assert.match(instrument, /const compact = Number\(snapshot\.viewport\?\.width \?\? 1000\) <= 760/);
  assert.match(instrument, /const filamentCount = compact \? 16 : filaments\.length/);
  assert.match(instrument, /const particleCount = compact \? 18 : particles\.length/);
  assert.match(instrument, /const flightCount = compact \? 20 : flightGlyphs\.length/);
  assert.match(instrument, /owns_animation_loop: false/);
});
