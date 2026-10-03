import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { loomWorkspaceTemplate } from '../app/dome-world/holonomy-loom/workspace-template.js';

const html=fs.readFileSync(new URL('../app/dome-world/holonomy-loom.html',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../app/dome-world/holonomy-loom/loom-product-v5.css',import.meta.url),'utf8');
const workspace=fs.readFileSync(new URL('../app/dome-world/holonomy-loom/ai-workspace.js',import.meta.url),'utf8');

test('Loom loads one visual system only',()=>{
  const doc=new JSDOM(html).window.document;
  assert.equal(doc.querySelectorAll('link[rel="stylesheet"]').length,1);
  assert.match(doc.querySelector('link[rel="stylesheet"]').getAttribute('href'),/loom-product-v5\.css/);
  assert.doesNotMatch(html,/ai-workspace\.css|reentry-workspace\.css|loom-product-v[34]\.css/);
  assert.match(workspace,/root\.innerHTML\s*=\s*loomWorkspaceTemplate/);
  assert.doesNotMatch(css,/var\(--serif\)|Georgia|Times New Roman/);
});

test('field visibility shares the coordinator without forcing a full-viewport task barrier',()=>{
  assert.doesNotMatch(css,/(?:min-)?height\s*:\s*calc\(100(?:s|d)?vh\s*-\s*(?:48|52)px\)/);
  assert.match(workspace,/IntersectionObserver/);
  assert.match(workspace,/coordinator\.setVisible\(!environment\.document\.hidden && stageVisible\)/);
  assert.match(workspace,/stageObserver\?\.disconnect\(\)/);
  assert.equal((workspace.match(/new AnimationCoordinator\(/g)||[]).length,1);
});

test('mobile is authored independently',()=>{
  assert.match(css,/@media\(max-width:760px\)/);
  assert.match(css,/@media\(min-width:761px\)/);
  assert.match(css,/\.loom-working-surface\{[^}]*grid-template-columns:/);
  assert.match(css,/@media\(min-width:761px\)\{[\s\S]*?\.loom-working-surface\{[^}]*grid-template-columns:/);
  assert.doesNotMatch(css,/(?:\.loom-instrument-state-boundary|\.ai-facts|#aiGapSummary)\s*\{[^}]*display\s*:\s*none/);
});

test('inactive choices remain hidden under the current visual system',()=>{
  const dom=new JSDOM(`<style>${css}</style><section id="loomAiWorkspace">${loomWorkspaceTemplate}</section>`);
  const chooser=dom.window.document.querySelector('#aiProjectChoices');
  assert.equal(chooser.hidden,true);
  assert.equal(dom.window.getComputedStyle(chooser).display,'none');
  chooser.hidden=false;
  assert.notEqual(dom.window.getComputedStyle(chooser).display,'none');
  dom.window.close();
});
