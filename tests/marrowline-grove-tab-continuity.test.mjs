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

test('explicit off and unknown flags clear per-tab trial; they must never fall back to historical mode', () => {
  for(const off of ['off','', 'historical-20261003-v1']) {
    const storage=tab({[MARROWLINE_GROVE_TRIAL_TAB_KEY]:MARROWLINE_HISTORICAL_TRIAL_ID});
    const page=root('https://td613.com/app/dome-world/marrowline.html?groveTrial='+off,storage);
    const choice=resolveMarrowlineGroveTrialTab(page.location,storage);
    assert.equal(choice.id,null);
    assert.equal(choice.source,'explicit-off');
    assert.equal(storage.getItem(MARROWLINE_GROVE_TRIAL_TAB_KEY),null);
  }
});

test('operator can explicitly exit trial and preserve other query parameters and hash', () => {
  const storage = tab({[MARROWLINE_GROVE_TRIAL_TAB_KEY]:MARROWLINE_GROVE_TRIAL_ID});
  const page=root('https://td613.com/app/dome-world/marrowline.html?foo=bar&groveTrial=native-voice-v1#chat',storage);
  assert.equal(exitMarrowlineGroveTrial(page),true);
  assert.equal(page.writes.at(-1).uri,'/app/dome-world/marrowline.html?foo=bar#chat');
  assert.equal(storage.getItem(MARROWLINE_GROVE_TRIAL_TAB_KEY),null);
  assert.equal(resolveMarrowlineGroveTrialTab(page.location,storage).id,null);
});

test('separate tabs and ordinary navigation never acquire an experiment without opt-in', () => {
  const one=tab(),two=tab();
  assert.equal(resolveMarrowlineGroveTrialTab(root('https://td613.com/app/dome-world/marrowline.html',one).location,one).id,null);
  resolveMarrowlineGroveTrialTab(root('https://td613.com/app/dome-world/marrowline.html?groveTrial=historical-20261002-v1',one).location,one);
  assert.equal(resolveMarrowlineGroveTrialTab(root('https://td613.com/app/dome-world/marrowline.html',two).location,two).id,null);
  assert.equal(exposeRestoredMarrowlineGroveTrial(root('https://td613.com/other.html',one),{id:MARROWLINE_HISTORICAL_TRIAL_ID,source:'tab-session'}),false);
});

test('browser composer binds the exact tab mode to text-only requests, offers Exit, and does not override Loom', () => {
  const source=readFileSync(new URL('../app/dome-world/marrowline-terminal.js',import.meta.url),'utf8');
  assert.match(source,/let groveTrial = initialGroveResolution\.id/);
  assert.match(source,/groveNotice\.dataset\.groveTrial = groveTrial \|\| 'off'/);
  assert.match(source,/exitMarrowlineGroveTrial\(root\)/);
  assert.match(source,/if \(groveTrial && !loomTransport && attachments\.length === 0\) requestBody\.groveTrial = groveTrial/);
  assert.match(source,/groveExit\.disabled = true/);
  assert.match(source,/groveExit\.disabled = false/);
});
