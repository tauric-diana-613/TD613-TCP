import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import {
  ASH_DESTINATION_POSTURE_VERSION,
  installAshDestinationPosture
} from '../app/dome-world/ash-guided-destination-posture.js';
import { installAshTrustBoundaryCourt } from '../app/dome-world/ash-guided-trust-boundary-court.js';

const source = fs.readFileSync('app/dome-world/ash-guided-destination-posture.js', 'utf8');
const bridge = fs.readFileSync('app/dome-world/ash-workspace-bridge.js', 'utf8');

assert.equal(ASH_DESTINATION_POSTURE_VERSION, 'td613.ash.destination-posture/v0.1');
for (const required of [
  'Capsule ≠ provider packet',
  'Flow-Core route weather ≠ custody',
  'heterostratigraphic lane',
  'Employer or public-sector managed AI',
  'HARD HOLD',
  'ROUTE MISMATCH',
  'consumer-cloud',
  'managed-adverse',
  'offline-local',
  'stopImmediatePropagation'
]) assert.ok(source.includes(required), `Missing destination-posture contract: ${required}`);
assert.doesNotMatch(source, /fetch\(|indexedDB|localStorage/, 'Destination posture must not acquire storage or network authority.');
assert.match(bridge, /ash-guided-destination-posture\.js\?v=20260717-destination-posture-v1/);
assert.ok(
  bridge.indexOf('ash-guided-trust-boundary-court.js') < bridge.indexOf('ash-guided-destination-posture.js'),
  'Ash Court must compose before destination posture decorates and governs its provider gate.'
);

const dom = new JSDOM(`<!doctype html><html><head></head><body>
  <section id="investigationAiShareGuide"><div class="guided-action-row"></div></section>
  <section class="tool-section"><div class="field-grid">
    <label><input id="providerScreenReview" type="checkbox"></label>
    <label><input id="providerApproval" type="checkbox"></label>
  </div><button id="screenProvider" type="button">Screen</button><button id="askHush" type="button">Send</button><p id="providerStatus"></p></section>
  <textarea id="draftBody"></textarea><input id="localTextFile" type="file">
</body></html>`, { pretendToBeVisual: true, url: 'https://td613.test/dome-world/ash-keep.html' });

assert.equal(installAshTrustBoundaryCourt(dom.window.document, dom.window), true);
assert.equal(installAshDestinationPosture(dom.window.document, dom.window), true);
assert.equal(installAshDestinationPosture(dom.window.document, dom.window), false);
await new Promise(resolve => dom.window.setTimeout(resolve, 140));

const doc = dom.window.document;
const ask = doc.getElementById('askHush');
const posture = doc.getElementById('ashCourtRoutePosture');
assert.ok(posture, 'Destination posture selector was not composed.');
assert.ok(doc.getElementById('ashAnisotropicLaw'), 'Anisotropic custody lesson was not composed.');
assert.equal(doc.documentElement.getAttribute('data-ash-destination-posture'), ASH_DESTINATION_POSTURE_VERSION);

for (const id of ['ashCourtExcerptAttestation', 'ashCourtOriginalAttestation']) {
  const input = doc.getElementById(id);
  input.checked = true;
  input.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
}

let providerAttempts = 0;
ask.addEventListener('click', () => { providerAttempts += 1; });

const click = () => ask.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }));
assert.equal(click(), false, 'Unclassified destination must remain held.');
assert.equal(providerAttempts, 0);
assert.match(doc.getElementById('ashCourtRouteStatus').textContent, /classified/);

posture.value = 'managed-adverse';
posture.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
assert.equal(click(), false, 'Managed workplace AI must remain hard-held.');
assert.equal(providerAttempts, 0);
assert.match(doc.getElementById('ashCourtRouteStatus').textContent, /HARD HOLD/);

posture.value = 'offline-local';
posture.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
assert.equal(click(), false, 'A provider button cannot impersonate an offline local route.');
assert.equal(providerAttempts, 0);
assert.match(doc.getElementById('ashCourtRouteStatus').textContent, /ROUTE MISMATCH/);

posture.value = 'consumer-cloud';
posture.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
assert.equal(click(), true, 'Declared consumer-cloud route should proceed to the existing exact-text gate.');
assert.equal(providerAttempts, 1);
await new Promise(resolve => dom.window.setTimeout(resolve, 10));
assert.equal(posture.value, '', 'Destination declaration must be consumed after a crossing attempt.');
assert.equal(doc.getElementById('ashCourtExcerptAttestation').checked, false);
assert.equal(doc.getElementById('ashCourtOriginalAttestation').checked, false);

dom.window.close();
console.log('ash-destination-posture.test.mjs passed');
