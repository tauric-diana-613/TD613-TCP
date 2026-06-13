import assert from 'assert';
import fs from 'fs';
import { JSDOM } from 'jsdom';

const STORAGE_KEY = 'td613:hush:phase31:logged-samples:v1';

function sampleText() {
  return Array.from({ length: 82 }, (_, index) => `sampleword${index + 1}`).join(' ') + '.';
}

function installDom(storedPayload = '') {
  const dom = new JSDOM(`<!doctype html><body data-page-kind="adversarial-bench">
    <button id="hushBuiltInTabBtn" type="button" aria-pressed="false">Masks</button>
    <button id="hushCustomizeTabBtn" type="button" aria-pressed="true">Customize</button>
    <select id="maskFieldSelect"></select>
    <textarea id="maskReferenceInput"></textarea>
    <section id="maskColumn">
      <div id="hushSwapWarningsPanel"></div>
      <div id="hushProfileMatchPanel"></div>
    </section>
  </body>`, { url: 'http://localhost/adversarial-bench.html', pretendToBeVisual: true });

  global.window = dom.window;
  global.document = dom.window.document;
  global.HTMLElement = dom.window.HTMLElement;
  global.Event = dom.window.Event;
  global.Node = dom.window.Node;
  global.localStorage = dom.window.localStorage;
  Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });

  dom.window.__TD613_HUSH_BENCH__ = {
    benchState: { hushMasks: [], customMasks: [] },
    renderHushMaskProfile() {},
    renderHushProfileMatch() {},
    renderHushMaskOptions() {}
  };

  if (storedPayload) dom.window.localStorage.setItem(STORAGE_KEY, storedPayload);
  return dom;
}

async function loadPhase31(label) {
  const mod = await import(`../app/hush-phase31-1.js?draft-ledger=${label}-${Date.now()}`);
  mod.initHushPhase311(document);
  window.dispatchEvent(new window.Event('load'));
  await new Promise((resolve) => setTimeout(resolve, 620));
  return mod;
}

const html = fs.readFileSync('app/adversarial-bench.html', 'utf8');
const css = fs.readFileSync('app/hush-phase31-1.css', 'utf8');
const js = fs.readFileSync('app/hush-phase31-1.js', 'utf8');
const policy = fs.readFileSync('app/hush-source-layout-policy.js', 'utf8');
const stableTransform = fs.readFileSync('app/hush-pr123-stable-transform.js', 'utf8');

assert(html.includes('hush-phase31-1.css?v=202606131510'));
assert(html.includes('hush-phase31-1.js?v=202606131420'));
assert(html.includes('hush-source-layout-policy.js?v=202606131420'));
assert(js.includes('hushPhase31DraftUtility'));
assert(js.includes('hushPhase31ClearDraft'));
assert(!js.includes('if (area && samples.length) area.value = samples.map'));
assert(css.includes('.hush-phase31-draft-utility'));
assert(css.includes('align-items: baseline'));
assert(css.includes('#hushPhase31ClearDraft.hush-phase31-clear-draft'));
assert(css.includes('text-transform: none !important'));
assert(css.includes('letter-spacing: .04em !important'));
assert(css.includes('text-decoration: none !important'));
assert(css.includes('min-width: 2.15rem'));
assert(css.includes('border-radius: 0 !important'));
assert(css.includes('background: transparent !important'));
assert(css.includes('color: rgba(255, 118, 104, .92) !important'));
assert(!policy.includes('hushPhase31LedgerUtility'));
assert(!policy.includes('logButton.click()'));
assert(stableTransform.includes('finally{if(btn)btn.disabled=false}'));

let dom = installDom();
await loadPhase31('first');

const area = document.getElementById('hushVoiceReferenceSamplesSaved');
const utility = document.getElementById('hushPhase31DraftUtility');
const clear = document.getElementById('hushPhase31ClearDraft');
const counter = document.getElementById('hushPhase31WordFloorCounter');
assert(area, 'draft textarea is present');
assert(utility, 'native draft utility row is present');
assert.equal(utility.firstElementChild, clear, 'clear sits before the counter in the utility row');
assert.equal(utility.lastElementChild, counter, 'counter sits inside the utility row');

const validSample = sampleText();
area.value = validSample;
area.dispatchEvent(new Event('input', { bubbles: true }));
assert.equal(counter.textContent, '82/75');

clear.click();
assert.equal(area.value, '');
assert.equal(counter.textContent, '0/75');

area.value = validSample;
area.dispatchEvent(new Event('input', { bubbles: true }));
document.getElementById('hushPhase31LogSampleBtn').click();

assert.equal(document.getElementById('hushPhase31SampleCount').textContent, '1');
assert.equal(document.getElementById('hushPhase31AcceptedCount').textContent, '1');
assert.equal(area.value, '', 'accepted sample clears from draft');
assert.equal(counter.textContent, '0/75');

const storedPayload = localStorage.getItem(STORAGE_KEY);
const stored = JSON.parse(storedPayload);
assert.equal(stored.samples.length, 1, 'one click stores exactly one sample');
assert.equal(stored.samples[0].text, validSample);
dom.window.close();

dom = installDom(storedPayload);
await loadPhase31('second');

assert.equal(document.getElementById('hushPhase31SampleCount').textContent, '1', 'stored sample rehydrates sample count');
assert.equal(document.getElementById('hushPhase31AcceptedCount').textContent, '1', 'stored sample rehydrates accepted count');
assert.equal(document.getElementById('hushVoiceReferenceSamplesSaved').value, '', 'rehydrated sample does not echo into draft');
assert.equal(document.getElementById('hushPhase31WordFloorCounter').textContent, '0/75');

document.getElementById('hushPhase31Undo').click();
assert.equal(document.getElementById('hushPhase31SampleCount').textContent, '0');
assert.equal(localStorage.getItem(STORAGE_KEY), null, 'undo clears persisted last sample');

dom.window.close();
console.log('hush-phase31-draft-ledger tests passed');
