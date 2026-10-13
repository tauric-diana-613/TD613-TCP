import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { loomWorkspaceTemplate } from '../app/dome-world/holonomy-loom/workspace-template.js';

const html=fs.readFileSync(new URL('../app/dome-world/holonomy-loom.html',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../app/dome-world/holonomy-loom/loom-product-v6.css',import.meta.url),'utf8');
const workspace=fs.readFileSync(new URL('../app/dome-world/holonomy-loom/ai-workspace.js',import.meta.url),'utf8');

test('Loom loads one visual system only',()=>{
  const doc=new JSDOM(html).window.document;
  assert.equal(doc.querySelectorAll('link[rel="stylesheet"]').length,1);
  assert.match(doc.querySelector('link[rel="stylesheet"]').getAttribute('href'),/loom-product-v6\.css/);
  assert.doesNotMatch(html,/ai-workspace\.css|reentry-workspace\.css|loom-product-v[34]\.css/);
  assert.match(workspace,/root\.innerHTML\s*=\s*loomWorkspaceTemplate/);
  assert.doesNotMatch(css,/var\(--serif\)|Georgia|Times New Roman/);
});

test('field visibility shares the coordinator while the field owns one cinematic scene',()=>{
  assert.match(css,/#loomAiWorkspace \.loom-stage\{[\s\S]*?height:calc\(100svh - 52px\)/);
  assert.match(workspace,/IntersectionObserver/);
  assert.match(workspace,/coordinator\.setVisible\(!environment\.document\.hidden && stageVisible\)/);
  assert.match(workspace,/stageObserver\?\.disconnect\(\)/);
  assert.equal((workspace.match(/new AnimationCoordinator\(/g)||[]).length,1);
});

test('mobile preserves the cinematic scene sequence without compacting the field into the builder',()=>{
  assert.match(css,/@media\(max-width:760px\)/);
  assert.match(css,/#loomAiWorkspace \.loom-working-surface\{display:block!important\}/);
  assert.match(css,/@media\(max-width:760px\)[\s\S]*?#loomAiWorkspace \.loom-stage\{[\s\S]*?height:calc\(100svh - 48px\)/);
  assert.match(css,/#loomAiWorkspace \.loom-builder-shell\{/);
  assert.doesNotMatch(css,/grid-template-columns:116px\s+minmax\(0,1fr\)/);
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
