import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { ASH_STRETCH12_OPERATOR_VERSION, installAshStretch12Operator } from '../app/dome-world/ash-stretch12-operator.js';

const operatorSource = fs.readFileSync('app/dome-world/ash-stretch12-operator.js', 'utf8');
const labSource = fs.readFileSync('app/dome-world/ash-portable-anisotropy.js', 'utf8');
const html = fs.readFileSync('app/dome-world/ash-portable-anisotropy.html', 'utf8');
const bridge = fs.readFileSync('app/dome-world/ash-workspace-bridge.js', 'utf8');

assert.equal(ASH_STRETCH12_OPERATOR_VERSION, 'td613.ash.stretch12-operator/v0.1');
for (const required of [
  'Capsule ≠ provider packet',
  'Flow-Core route weather ≠ custody',
  'Local-looking terminal ≠ local model',
  'Low tested recovery ≠ universal secrecy',
  'quantum-derived method',
  'Phason susceptibility',
  'Unknown Readers remain unmeasured'
]) assert.ok(`${operatorSource}\n${html}`.includes(required), `Missing Stretch 12 operator law: ${required}`);
assert.doesNotMatch(operatorSource, /fetch\(|indexedDB|localStorage/);
assert.doesNotMatch(labSource, /fetch\(|indexedDB|localStorage/);
assert.match(bridge, /ash-stretch12-operator\.js\?v=20260717-stretch12-v1/);
assert.match(html, /<script type="module" src="\/dome-world\/ash-portable-anisotropy\.js\?v=20260717-stretch12-v1"><\/script>/);
assert.doesNotMatch(html, /<script(?![^>]*src=)[^>]*>/, 'Hardened lab must not contain inline script.');

const dom = new JSDOM('<!doctype html><html><head></head><body><section id="investigationAiShareGuide"></section></body></html>', { pretendToBeVisual: true, url: 'https://td613.test/dome-world/ash-keep.html' });
assert.equal(installAshStretch12Operator(dom.window.document, dom.window), true);
assert.equal(installAshStretch12Operator(dom.window.document, dom.window), false);
await new Promise(resolve => dom.window.setTimeout(resolve, 80));
const card = dom.window.document.getElementById('ashStretch12PortableAnisotropy');
assert.ok(card);
assert.equal(card.querySelector('a').getAttribute('href'), '/dome-world/ash-portable-anisotropy.html');
assert.equal(dom.window.document.documentElement.getAttribute('data-ash-stretch12-operator'), ASH_STRETCH12_OPERATOR_VERSION);
assert.ok(dom.window.document.getElementById('td613-ash-stretch12-operator-css'));
dom.window.close();

console.log('ash-stretch12-operator-ui.test.mjs passed');
