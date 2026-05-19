import assert from 'assert';
import fs from 'fs';
import { JSDOM } from 'jsdom';
import {
  HUSH_SIMPLE_PATH_VERSION,
  prepareEffectiveBaseline,
  clearFallbackBaseline,
  initHushSimplePath
} from '../app/hush-simple-path.js';

const html = fs.readFileSync('app/adversarial-bench.html', 'utf8');
const bridge = fs.readFileSync('app/adversarial-bench.js', 'utf8');

assert.equal(HUSH_SIMPLE_PATH_VERSION, 'phase-14');
assert(html.includes('Message to Transform'), 'Hush page exposes Message to Transform as primary input');
assert(html.includes('Choose Mask'), 'Hush page exposes Choose Mask as primary selection');
assert(html.includes('>Transform<'), 'Hush page uses Transform as the primary action');
assert(html.includes('Transformed Message'), 'Hush page exposes Transformed Message as output');
assert(html.includes('id="hushVaultDrawer"'), 'Hush keeps reference voice in the Vault drawer');
assert(html.includes('Advanced Reference Voice'), 'advanced reference voice remains available');
assert(html.includes('id="maskReferenceDetails"'), 'mask reference details are moved behind the Vault drawer');
assert(bridge.includes("import './hush-simple-path.js'"), 'browser bridge imports the simple path helper');

const dom = new JSDOM(`<!doctype html><body data-page-kind="adversarial-bench">
  <textarea id="protectedBaselineInput"></textarea>
  <textarea id="messageDraftInput"></textarea>
  <div id="protectedBaselineProfile"></div>
  <button id="generateMaskedOutputBtn" type="button">Transform</button>
  <button id="resetBenchBtn" type="button">Reset</button>
</body>`, { url: 'http://localhost/adversarial-bench.html', pretendToBeVisual: true });

const doc = dom.window.document;
assert(initHushSimplePath(doc), 'simple path initializes on Hush page');
assert(doc.getElementById('protectedBaselineProfile').textContent.includes('Most users can leave this blank'));

doc.getElementById('messageDraftInput').value = 'Message body with EXHIBIT-42 that should travel through a mask.';
let prepared = prepareEffectiveBaseline(doc);
assert.equal(prepared.source, 'message-to-transform');
assert.equal(prepared.applied, true);
assert.equal(doc.getElementById('protectedBaselineInput').value, doc.getElementById('messageDraftInput').value);
assert(doc.getElementById('protectedBaselineProfile').textContent.includes('Using Message to Transform'));

clearFallbackBaseline(doc);
assert.equal(doc.getElementById('protectedBaselineInput').value, '');

doc.getElementById('protectedBaselineInput').value = 'Separate reference voice sample.';
prepared = prepareEffectiveBaseline(doc);
assert.equal(prepared.source, 'advanced-reference-voice');
assert.equal(prepared.applied, false);
assert.equal(doc.getElementById('protectedBaselineInput').value, 'Separate reference voice sample.');

console.log('hush-simple-path tests passed');
