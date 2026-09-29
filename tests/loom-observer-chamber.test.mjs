import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { mountObserverChamber } from '../app/dome-world/holonomy-loom/observer-chamber.js';
function harness() {
  const dom = new JSDOM('<textarea id="message">PRIVATE COMPOSER SENTINEL</textarea><section id="chamber"></section>');
  const root = dom.window.document.querySelector('#chamber');
  dom.window.fetch = () => { throw new Error('No network allowed'); };
  dom.window.requestAnimationFrame = () => { throw new Error('No animation clock allowed'); };
  const ui = mountObserverChamber(root);
  const choose = id => { root.querySelector('#ocCase').value = id; root.querySelector('#ocCase').dispatchEvent(new dom.window.Event('change')); };
  return { dom, root, ui, choose, run: () => root.querySelector('#ocRun').click() };
}
test('mounting is inert, explicit calculation stays fictional and rest clears the result', () => {
  const { root, ui, run, dom } = harness();
  assert.equal(ui.inspect(), null); assert.equal(root.querySelector('#ocResult').hidden, true);
  run(); assert.equal(ui.inspect().routes.control.selected_view.total_bits, 1);
  assert.doesNotMatch(root.textContent, /PRIVATE COMPOSER SENTINEL/);
  assert.equal(dom.window.document.querySelector('#message').value, 'PRIVATE COMPOSER SENTINEL');
  root.querySelector('#ocRest').click(); assert.equal(ui.inspect(), null);
  assert.equal(root.querySelector('#ocResult').hidden, true); assert.equal(root.querySelector('#ocCalculation').textContent, '');
  assert.match(root.querySelector('#ocStatus').textContent, /Rest/); ui.destroy(); assert.equal(root.textContent, '');
});
test('changed observers invalidate the old result and joining exposes parity', () => {
  const { root, ui, choose, run, dom } = harness(); choose('parity'); run();
  assert.equal(ui.inspect().routes.control.selected_view.total_bits, 1);
  const third = root.querySelector('input[value="third"]'); third.checked = false;
  third.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
  assert.equal(ui.inspect(), null); assert.equal(root.querySelector('#ocResult').hidden, true);
  run(); assert.equal(ui.inspect().routes.control.selected_view.total_bits, 0);
  assert.equal(root.querySelectorAll('#ocSubsets tr').length, 4);
});
test('missing capture is HELD in the visible primary table, with subview scope retained', () => {
  const { root, choose, run } = harness(); choose('missing'); run();
  assert.match(root.querySelector('#ocStatus').textContent, /^HELD/);
  assert.match(root.querySelector('#ocMetrics').textContent, /HELD · missing channel/);
  assert.match(root.querySelector('#ocCapture').textContent, /candidate \/ error/);
  assert.match(root.textContent, /Golden Egg: UNEARNED/);
});
test('every declared case renders, and case change clears stale calculations', () => {
  const { root, choose, run, ui } = harness();
  for (const option of root.querySelectorAll('option')) {
    choose(option.value); assert.equal(ui.inspect(), null); run();
    assert.ok(root.querySelectorAll('#ocMetrics tr').length >= 7);
    assert.equal(root.querySelector('#ocResult').hidden, false);
  }
});
test('host integrates one bounded chamber and production module has no transport or storage imports', () => {
  const html = fs.readFileSync(new URL('../app/dome-world/holonomy-loom.html', import.meta.url), 'utf8');
  const doc = new JSDOM(html).window.document;
  assert.equal(doc.querySelectorAll('#loomObserverChamber').length, 1);
  assert.ok(doc.querySelector('#loomLegacy #loomObserverChamber'));
  assert.ok(doc.querySelector('script[src="./holonomy-loom/observer-chamber.js"]'));
  for (const file of ['observer-channel.js', 'observer-cases.js', 'observer-chamber.js']) {
    const source = fs.readFileSync(new URL(`../app/dome-world/holonomy-loom/${file}`, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /\b(fetch|XMLHttpRequest|WebSocket|localStorage|sessionStorage|requestAnimationFrame|setInterval)\s*[.(]/);
  }
});
