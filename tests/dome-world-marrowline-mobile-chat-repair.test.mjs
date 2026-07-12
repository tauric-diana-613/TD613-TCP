import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';

const html = fs.readFileSync('app/dome-world/marrowline.html', 'utf8');
const css = fs.readFileSync('app/dome-world/marrowline-mobile-repair.css', 'utf8');
const source = fs.readFileSync('app/dome-world/marrowline-mobile-repair.js', 'utf8');
const boot = fs.readFileSync('app/dome-world/marrowline-egress-boot.js', 'utf8');

assert.match(css, /html,body\{height:100%;overflow:hidden/);
assert.match(css, /grid-template-rows:var\(--td613-mobile-header\) minmax\(0,1fr\)/);
assert.match(css, /\.speaking-vessel\{[\s\S]*?height:100%;[\s\S]*?grid-template-rows:auto minmax\(0,1fr\) auto/);
assert.match(css, /\.messages\{[\s\S]*?overflow-y:auto/);
assert.match(css, /-webkit-overflow-scrolling:touch/);
assert.match(css, /\.vessel-form\{[\s\S]*?position:relative;[\s\S]*?bottom:auto/);
assert.match(css, /\.relay-stage\[data-present="false"\]\{display:none\}/);
assert.match(css, /\.mobile-sheet-open\{[\s\S]*?position:fixed!important/);
assert.match(css, /body\[data-td613-keyboard="open"\] \.mobile-dock\{display:none\}/);
assert.match(css, /\.relay-bots \.relay-stage-text\{[\s\S]*?line-height:3\.05/);
assert.match(source, /visualViewport/);
assert.match(source, /stopImmediatePropagation/);
assert.match(source, /internalScrollAvailable/);
assert.match(source, /APERTURE v3 · OPEN FIELD/);
assert.match(boot, /marrowline-mobile-repair\.js/);
assert.match(boot, /mobileRepair/);

const dom = new JSDOM(html, { url: 'https://td613.test/dome-world/marrowline.html', pretendToBeVisual: true });
const { window } = dom;
window.matchMedia = (query) => ({
  matches: query.includes('max-width: 860px'),
  media: query,
  addEventListener() {},
  removeEventListener() {}
});
window.visualViewport = {
  height: 740,
  addEventListener() {},
  removeEventListener() {}
};
window.innerHeight = 844;
const messages = window.document.getElementById('khonapolitMessages');
messages.scrollTo = ({ top }) => { messages.scrollTop = top; };

const previousCustomEvent = globalThis.CustomEvent;
globalThis.CustomEvent = window.CustomEvent;
try {
  const modulePath = path.resolve('app/dome-world/marrowline-mobile-repair.js');
  const moduleUrl = `${pathToFileURL(modulePath).href}?test=${Date.now()}`;
  const repairModule = await import(moduleUrl);
  const api = repairModule.installMarrowlineMobileRepair(window.document, window);

  assert.equal(api.version, repairModule.MARROWLINE_MOBILE_REPAIR_VERSION);
  assert.ok(window.document.querySelector('link[data-td613-marrowline-mobile-repair]'));
  assert.ok(window.document.getElementById('marrowlineJumpLatest'));
  assert.equal(window.document.body.dataset.marrowlineMobile, 'true');
  assert.equal(window.document.querySelector('[data-mobile-target="speakingPanel"]')?.dataset.active, 'true');

  api.open('receiptPanel');
  assert.equal(window.document.getElementById('receiptPanel')?.classList.contains('mobile-sheet-open'), true);
  assert.equal(window.document.body.dataset.mobileSheet, 'true');
  api.close();
  assert.equal(window.document.getElementById('receiptPanel')?.classList.contains('mobile-sheet-open'), false);
  assert.equal(window.document.body.dataset.mobileSheet, 'false');
  assert.equal(api.receipt().schema, repairModule.MARROWLINE_MOBILE_REPAIR_VERSION);
} finally {
  globalThis.CustomEvent = previousCustomEvent;
}

console.log('dome-world-marrowline-mobile-chat-repair: bounded chat viewport, internal scrolling, safe-area dock, and mobile sheets ok');
