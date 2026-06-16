import assert from 'assert';
import fs from 'fs';
import { JSDOM } from 'jsdom';

const STORAGE_KEY = 'td613:hush:phase31:logged-samples:v1';

function sampleText() {
  return Array.from({ length: 82 }, (_, index) => `sampleword${index + 1}`).join(' ') + '.';
}

function storedSamples(count) {
  return JSON.stringify({
    version: 'phase31-logged-samples/v1',
    updatedAt: '2026-06-15T19:00:00.000Z',
    samples: Array.from({ length: count }, (_, index) => ({
      text: `${sampleText()} sample-${index + 1}`,
      promptCategory: index % 2 ? 'argumentative' : 'explanatory',
      contextLabel: index % 2 ? 'implementation-handoff' : 'baseline-voice',
      discourseMode: index % 2 ? 'argumentative' : 'explanatory',
      retrievalTrigger: index % 2 ? 'implementation-handoff' : 'baseline-voice'
    }))
  });
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

async function verifySnapCarouselForCount(sampleCount) {
  const dom = installDom(storedSamples(sampleCount));
  await loadPhase31(`snap-carousel-edit-${sampleCount}`);

  const editButton = document.getElementById('hushPhase31EditCorpus');
  assert.notEqual(editButton.dataset.td613Phase31NativeEditCorpusBound, 'true', 'legacy bulk edit handler is not bound to edit button');
  editButton.click();
  await new Promise((resolve) => setTimeout(resolve, 80));

  assert.equal(document.querySelectorAll('.hush-phase31-edit-sample').length, sampleCount, 'snap carousel renders one slide per stored sample');
  assert.equal(document.querySelectorAll('.hush-phase31-edit-category').length, sampleCount, 'snap carousel renders discourse dropdowns for every slide');
  assert.equal(document.querySelectorAll('.hush-phase31-edit-context').length, sampleCount, 'snap carousel renders retrieval dropdowns for every slide');
  assert.equal(document.getElementById('hushPhase31EditCorpusList').dataset.td613CarouselOwned, 'true', 'carousel marks the edit list as native-owned');
  assert.equal(document.getElementById('hushPhase31PrevSample'), null, 'snap carousel does not render previous navigation');
  assert.equal(document.getElementById('hushPhase31NextSample'), null, 'snap carousel does not render next navigation');
  assert(document.getElementById('hushPhase31CarouselPrev'), 'desktop carousel has a tiny previous affordance');
  assert(document.getElementById('hushPhase31CarouselNext'), 'desktop carousel has a tiny next affordance');
  assert.equal(document.getElementById('hushPhase31CarouselCount').textContent, `Sample 1 / ${sampleCount} - swipe samples`);

  document.querySelector('.hush-phase31-edit-text').value = 'edited ' + sampleText();
  document.getElementById('hushPhase31SaveCorpusEdits').click();
  await new Promise((resolve) => setTimeout(resolve, 80));

  const editedStored = JSON.parse(localStorage.getItem(STORAGE_KEY));
  assert.equal(editedStored.samples.length, sampleCount, 'carousel save preserves full working corpus');
  assert(editedStored.samples[0].text.startsWith('edited '), 'carousel save stores edited slide text');
  assert.equal(editedStored.samples[0].promptCategory, editedStored.samples[0].discourseMode);
  assert.equal(editedStored.samples[0].contextLabel, editedStored.samples[0].retrievalTrigger);

  dom.window.close();
}

const html = fs.readFileSync('app/adversarial-bench.html', 'utf8');
const css = fs.readFileSync('app/hush-phase31-1.css', 'utf8');
const js = fs.readFileSync('app/hush-phase31-1.js', 'utf8');
const originalJs = fs.readFileSync('app/hush-phase31-1-original.js', 'utf8');
const policy = fs.readFileSync('app/hush-source-layout-policy.js', 'utf8');
const stableTransform = fs.readFileSync('app/hush-pr123-stable-transform.js', 'utf8');

assert(html.includes('hush-phase31-1.css?v=202606131510'));
assert(html.includes('hush-phase31-1.js?v=202606160010'));
assert(!html.includes('hush-edit-corpus-open-fallback.js'), 'edit fallback script should not load on Hush');
assert(html.includes('hush-source-layout-policy.js?v=202606131610'));
assert(js.includes('externalEditOwner: true'), 'Phase31 wrapper should disable legacy bulk edit bindings');
assert(js.includes('dropdownSnapCarousel: true'), 'Phase31 wrapper should expose snap carousel editor ownership');
assert(originalJs.includes('hushPhase31DraftUtility'));
assert(originalJs.includes('hushPhase31ClearDraft'));
assert(!originalJs.includes('if (area && samples.length) area.value = samples.map'));
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
assert(policy.includes('td613CarouselOwned'), 'late layout policy should not rewrite carousel-owned edit rows');
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
assert.equal(stored.samples[0].promptCategory, stored.samples[0].discourseMode, 'stored sample preserves discourse alias');
assert.equal(stored.samples[0].contextLabel, stored.samples[0].retrievalTrigger, 'stored sample preserves retrieval alias');
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

for (const sampleCount of [8, 29, 40, 100]) {
  await verifySnapCarouselForCount(sampleCount);
}

console.log('hush-phase31-draft-ledger tests passed');
