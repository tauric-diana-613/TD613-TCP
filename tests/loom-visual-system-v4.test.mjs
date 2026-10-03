import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../app/dome-world/holonomy-loom.html',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../app/dome-world/holonomy-loom/loom-product-v4.css',import.meta.url),'utf8');
const workspace=fs.readFileSync(new URL('../app/dome-world/holonomy-loom/ai-workspace.js',import.meta.url),'utf8');

test('Loom loads one visual system only',()=>{
  assert.match(html,/loom-product-v4\.css\?v=20261002-v4/);
  assert.doesNotMatch(html,/ai-workspace\.css|reentry-workspace\.css|loom-product-v3\.css/);
  assert.doesNotMatch(css,/var\(--serif\)|Georgia|Times New Roman/);
});

test('Flow-Core field owns the viewport without sticky scroll bleed',()=>{
  assert.match(css,/height:calc\(100svh - 52px\)/);
  assert.match(css,/contain:layout paint style/);
  assert.match(workspace,/IntersectionObserver/);
  assert.match(workspace,/coordinator\.setVisible\(!environment\.document\.hidden && stageVisible\)/);
});

test('mobile is authored independently',()=>{
  assert.match(css,/@media\(max-width:760px\)/);
  assert.match(css,/width:calc\(100% - 28px\)/);
  assert.match(css,/\.ai-send-row\{grid-template-columns:1fr!important\}/);
});
