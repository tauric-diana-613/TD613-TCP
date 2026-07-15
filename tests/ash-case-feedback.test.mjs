import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import {
  ASH_CASE_FEEDBACK_VERSION,
  installAshCaseFeedback
} from '../app/dome-world/ash-case-feedback.js';

const dom = new JSDOM('<!doctype html><html><body><span id="storageState">CASE BOUND</span></body></html>', { pretendToBeVisual: true });
const { window } = dom;
const { document } = window;
let lifecycleRefreshes = 0;
window.__td613AshLifecycleRefresh = async () => { lifecycleRefreshes += 1; };

assert.equal(installAshCaseFeedback(document, window), true);
assert.equal(installAshCaseFeedback(document, window), false, 'Save feedback installation must remain idempotent.');
assert.equal(document.documentElement.dataset.ashCaseFeedback, ASH_CASE_FEEDBACK_VERSION);

window.dispatchEvent(new window.CustomEvent('td613:ash:constitutional:case-state', {
  detail: { case_id: 'case_feedback_fixture', state: 'CURRENT_SAVED' }
}));
assert.equal(document.getElementById('storageState').textContent, 'Case saved');
assert.equal(document.documentElement.dataset.ashSaveFeedback, 'case_feedback_fixture');

// Simulate lifecycle posture racing the operator confirmation.
document.getElementById('storageState').textContent = 'CASE BOUND';
await new Promise(resolve => window.setTimeout(resolve, 90));
assert.equal(document.getElementById('storageState').textContent, 'Case saved', 'Save confirmation must outlive the immediate lifecycle repaint.');

await new Promise(resolve => window.setTimeout(resolve, 1650));
assert.equal(document.documentElement.dataset.ashSaveFeedback, undefined);
assert.equal(lifecycleRefreshes, 1, 'Lifecycle posture must be restored after the bounded confirmation window.');

const source = await import('node:fs').then(fs => fs.readFileSync('app/dome-world/ash-case-feedback.js', 'utf8'));
assert.doesNotMatch(source, /localStorage|indexedDB|fetch\(|requestAnimationFrame/, 'Save feedback must remain presentation-only.');

dom.window.close();
console.log('ash-case-feedback.test.mjs passed');
