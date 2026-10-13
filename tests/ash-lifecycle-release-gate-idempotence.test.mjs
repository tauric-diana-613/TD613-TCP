import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const source = fs.readFileSync('app/dome-world/ash-lifecycle-core.js', 'utf8');
const match = source.match(/function enforceReleaseGate\(\) \{[\s\S]*?\n\}/);
assert.ok(match, 'enforceReleaseGate source must remain discoverable');
assert.doesNotMatch(source, /button\.disabled = !\(nativeReady && ui\.lifecycle\.gates\.local_release\);/);
assert.match(source, /const shouldDisable = !\(nativeReady && ui\.lifecycle\.gates\.local_release\);/);
assert.match(source, /if \(button\.disabled !== shouldDisable\) button\.disabled = shouldDisable;/);

const dom = new JSDOM('<button id="approveRelease"></button><span id="reviewStatus"></span>', {
  runScripts: 'outside-only',
  pretendToBeVisual: true
});
const { window } = dom;
window.eval(`
  const ui = {
    latestReview: null,
    lifecycle: { gates: { local_release: false }, next_action: 'REGISTER_CUSTODY_ROOT' }
  };
  const $ = id => document.getElementById(id);
  ${match[0]}
  window.__enforceReleaseGate = enforceReleaseGate;
`);

const button = window.document.getElementById('approveRelease');
let callbacks = 0;
const observer = new window.MutationObserver(() => {
  callbacks += 1;
  window.__enforceReleaseGate();
});
observer.observe(button, { attributes: true, attributeFilter: ['disabled'] });

window.__enforceReleaseGate();
await new Promise(resolve => window.setTimeout(resolve, 0));
assert.equal(button.disabled, true, 'release must remain held without lifecycle eligibility');
assert.equal(callbacks, 1, 'the first real disabled transition may notify once');

window.__enforceReleaseGate();
await new Promise(resolve => window.setTimeout(resolve, 0));
assert.equal(callbacks, 1, 'an idempotent release-gate check must not renew its own observer');

observer.disconnect();
dom.window.close();
console.log('ash-lifecycle-release-gate-idempotence.test.mjs passed');
