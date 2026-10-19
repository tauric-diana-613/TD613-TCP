import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  MARROWLINE_GROVE_TRIAL_TAB_KEY,
  MARROWLINE_GROVE_TRIAL_ID,
  resolveMarrowlineGroveTrialTab,
  exposeRestoredMarrowlineGroveTrial,
  exitMarrowlineGroveTrial
} from '../app/dome-world/marrowline-grove-trial.js';
import { MARROWLINE_HISTORICAL_TRIAL_ID } from '../app/dome-world/marrowline-historical-grove.js';

function tab(initial = {}) {
  const entries = new Map(Object.entries(initial));
  return {
    getItem: key => entries.has(key) ? entries.get(key) : null,
    setItem: (key, value) => { entries.set(key, String(value)); },
    removeItem: key => { entries.delete(key); }
  };
}
function root(url, storage) {
  const parsed = new URL(url);
  const location = {
    pathname: parsed.pathname, search: parsed.search, hash: parsed.hash
  };
  const writes = [];
  return {
    sessionStorage: storage, location,
    history: {
      state: { previous: 'kept' },
      replaceState(state, _, uri) {
        writes.push({ state, uri });
        const next = new URL(uri,'https://td613.com');
        location.pathname = next.pathname;
        location.search = next.search;
        location.hash = next.hash;
      }
    },
    writes
  };
}

test('tab-only opt-in survives a return through Dome-World navigation and becomes visible in the URL', () => {
  const storage = tab();
  const first = root('https://td613.com/app/dome-world/marrowline.html?groveTrial=historical-20261002-v1',storage);
  const selected = resolveMarrowlineGroveTrialTab(first.location,storage);
  assert.deepEqual(selected, {id:MARROWLINE_HISTORICAL_TRIAL_ID,source:'url-opt-in',persistence:'tab-session'});
  assert.equal(storage.getItem(MARROWLINE_GROVE_TRIAL_TAB_KEY),MARROWLINE_HISTORICAL_TRIAL_ID);
  assert.equal(exposeRestoredMarrowlineGroveTrial(first,selected),false);

  const returned = root('https://td613.com/app/dome-world/marrowline.html?foo=bar#chat',storage);
  const replay = resolveMarrowlineGroveTrialTab(returned.location,storage);
  assert.equal(replay.id,MARROWLINE_HISTORICAL_TRIAL_ID);
  assert.equal(replay.source,'tab-session');
  assert.equal(exposeRestoredMarrowlineGroveTrial(returned,replay),true);
  assert.equal(returned.writes.length,1);
  assert.equal(returned.writes[0].state.previous,'kept');
  assert.equal(returned.writes[0].uri,'/app/dome-world/marrowline.html?foo=bar&groveTrial=historical-20261002-v1#chat');
  assert.equal(resolveMarrowlineGroveTrialTab(returned.location,storage).id,MARROWLINE_HISTORICAL_TRIAL_ID);
});

test('explicit off is a deliberate URL diagnostic; stale sticky off from the retired Exit bar is healed', () => {
  for(const off of ['off','', 'historical-20261003-v1']) {
    const storage=tab({[MARROWLINE_GROVE_TRIAL_TAB_KEY]:MARROWLINE_HISTORICAL_TRIAL_ID});
    const page=root('https://td613.com/app/dome-world/marrowline.html?groveTrial='+off,storage);
    const choice=resolveMarrowlineGroveTrialTab(page.location,storage);
    assert.equal(choice.id,null);
    assert.equal(choice.source,'explicit-off');
    const returned=root('https://td613.com/app/dome-world/marrowline.html',storage);
    assert.equal(resolveMarrowlineGroveTrialTab(returned.location,storage).id,MARROWLINE_HISTORICAL_TRIAL_ID);
  }
  const oldExit=tab({[MARROWLINE_GROVE_TRIAL_TAB_KEY]:'off'});
  const returned=root('https://td613.com/app/dome-world/marrowline.html',oldExit);
  assert.equal(resolveMarrowlineGroveTrialTab(returned.location,oldExit).id,MARROWLINE_HISTORICAL_TRIAL_ID);
});

test('operator can explicitly exit trial and preserve other query parameters and hash', () => {
  const storage = tab({[MARROWLINE_GROVE_TRIAL_TAB_KEY]:MARROWLINE_GROVE_TRIAL_ID});
  const page=root('https://td613.com/app/dome-world/marrowline.html?foo=bar&groveTrial=native-voice-v1#chat',storage);
  assert.equal(exitMarrowlineGroveTrial(page),true);
  assert.equal(page.writes.at(-1).uri,'/app/dome-world/marrowline.html?foo=bar#chat');
  assert.equal(storage.getItem(MARROWLINE_GROVE_TRIAL_TAB_KEY),'off');
  assert.equal(resolveMarrowlineGroveTrialTab(page.location,storage).id,MARROWLINE_HISTORICAL_TRIAL_ID);
});

test('October 2 voice remains normal text-only default, with independent tabs and no forced trial URL', () => {
  const one=tab(),two=tab();
  const first=root('https://td613.com/app/dome-world/marrowline.html?foo=bar#chat',one);
  const restored=resolveMarrowlineGroveTrialTab(first.location,one);
  assert.deepEqual(restored,{id:MARROWLINE_HISTORICAL_TRIAL_ID,source:'restored-default',persistence:'tab-session'});
  assert.equal(one.getItem(MARROWLINE_GROVE_TRIAL_TAB_KEY),MARROWLINE_HISTORICAL_TRIAL_ID);
  assert.equal(first.writes.length,0,'ordinary visits are not required to carry experiment query parameters');
  assert.equal(resolveMarrowlineGroveTrialTab(root('https://td613.com/app/dome-world/marrowline.html',two).location,two).id,MARROWLINE_HISTORICAL_TRIAL_ID);
  const diagnostic=root('https://td613.com/app/dome-world/marrowline.html?groveTrial=off',one);
  assert.equal(resolveMarrowlineGroveTrialTab(diagnostic.location,one).id,null);
  assert.equal(resolveMarrowlineGroveTrialTab(root('https://td613.com/app/dome-world/marrowline.html',one).location,one).id,MARROWLINE_HISTORICAL_TRIAL_ID);
});

test('browser composer transmits restored voice without the oversized trial bar, preserves optional diagnostics and Loom boundaries', () => {
  const source=readFileSync(new URL('../app/dome-world/marrowline-terminal.js',import.meta.url),'utf8');
  assert.match(source,/const groveTrial = initialGroveResolution\\.id/);
  assert.match(source,/if \\(groveTrial && !loomTransport && attachments\\.length === 0\\) requestBody\\.groveTrial = groveTrial/);
  assert.doesNotMatch(source,/marrowlineGroveTrialNotice|Exit trial|groveExit|renderGroveMode/);
  assert.doesNotMatch(source,/exposeRestoredMarrowlineGroveTrial\\(root, initialGroveResolution\\)/);
  assert.match(source,/receivedReceipt = payload\\?\\.receipt \\|\\| null/);
  assert.match(source,/ingestGeminiConsumption/);
  assert.match(source,/const payload = loomTransport \\? transportPayload\\.native_reply : transportPayload/);
});

test('plain-h server always exposes explicit ordinary, historical or unresolved route identity without editing provider text', () => {
  const source = readFileSync(new URL('../server/khonapolit-quality.js',import.meta.url),'utf8');
  assert.match(source,/id: groveTrial \|\| 'off'/);
  assert.match(source,/id: 'unresolved', active: false/);
  assert.match(source,/grove_trial: observedExperiment/);
  assert.match(source,/receipt: \{ \.\.\.payload\.receipt, grove_trial: observedExperiment \}/);
  assert.match(source,/res\.setHeader\('X-TD613-Grove-Trial', groveTrial \|\| 'off'\)/);
});
