import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { mountLoomTheater } from '../app/dome-world/holonomy-loom/theater.js';

const html = fs.readFileSync(new URL('../app/dome-world/holonomy-loom.html', import.meta.url), 'utf8');

function makeHarness() {
  const dom = new JSDOM(html, { url: 'https://td613.com/dome-world/holonomy-loom.html' });
  const { window } = dom;
  Object.defineProperty(window.document, 'hidden', { value: false, configurable: true });
  let wall = 0;
  let nextFrame = 1;
  const frames = new Map();
  Object.defineProperty(window.performance, 'now', { value: () => wall });
  window.requestAnimationFrame = (callback) => { const id = nextFrame++; frames.set(id, callback); return id; };
  window.cancelAnimationFrame = (id) => frames.delete(id);
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  window.ResizeObserver = class { observe() {} disconnect() {} };
  window.IntersectionObserver = undefined;
  window.devicePixelRatio = 1;
  const step = (ms = 500) => {
    wall += ms;
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((callback) => callback(wall));
  };
  const ui = mountLoomTheater(window.document.querySelector('#loomTheater'), window);
  return { dom, window, root: window.document.querySelector('#loomTheater'), frames, step, ui };
}

{
  const harness = makeHarness();
  const { root, window, frames, step, ui } = harness;
  assert.equal(root.dataset.scene, undefined, 'theater starts without an analysis or receipt');
  window.document.querySelector('#ltPlay').click();
  for (let i = 0; i < 10; i += 1) step();
  assert.equal(root.dataset.scene, 'quiet');
  assert.equal(root.dataset.ruleStatus, 'GREEN');
  assert.equal(ui.inspect().clock.timeMs, 3600);
  assert.equal(ui.inspect().clock.pendingFrames, 0);
  assert.equal(frames.size, 0, 'finite playback leaves no idle RAF chain');
  assert.match(window.document.querySelector('#ltRoute').getAttribute('d'), /^M160/);
  assert.equal(window.document.querySelector('#ltAudit').hidden, true);
}

{
  const harness = makeHarness();
  const { root, window, step, ui } = harness;
  const seen = new Set();
  window.document.querySelector('#ltPlay').click();
  for (let i = 0; i < 8; i += 1) {
    seen.add(root.dataset.scene);
    window.document.querySelector('#ltNext').click();
    step();
  }
  assert.deepEqual([...seen].sort(), ['bounded-change', 'contradiction-missingness', 'modeled-pressure', 'quiet', 'recovery', 'release-block', 'route-memory', 'structural-rest'].sort());
  window.document.querySelector('[data-view="auditor"]').click();
  assert.equal(window.document.querySelector('#ltAudit').hidden, false);
  assert.match(window.document.querySelector('#ltFacts').textContent, /V · C · P · L/);
  window.document.querySelector('#ltPortable').click();
  assert.match(window.document.querySelector('#ltReceiptScope').textContent, /PORTABLE receiver/);
  assert.equal(ui.inspect().packet.authority, undefined, 'the semantic packet has no renderer authority field');
}

{
  const harness = makeHarness();
  const { root, window, frames, step, ui } = harness;
  window.document.querySelector('[data-scene="4"]').click();
  assert.equal(root.dataset.scene, 'modeled-pressure');
  assert.match(window.document.querySelector('#ltGeometryNote').textContent, /DASHED WEATHER/);
  window.document.querySelector('#ltTime').value = '1200';
  window.document.querySelector('#ltTime').dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.equal(ui.inspect().clock.timeMs, 1200);
  const replayPath = window.document.querySelector('#ltRoute').getAttribute('d');
  window.document.querySelector('#ltReduced').click();
  assert.equal(ui.inspect().clock.reducedMotion, true);
  assert.equal(frames.size, 0);
  assert.equal(window.document.querySelector('#ltRoute').getAttribute('d'), replayPath);
  window.document.querySelector('#ltRest').click();
  assert.equal(root.dataset.scene, 'structural-rest');
  assert.equal(ui.inspect().clock.playing, false);
  assert.equal(frames.size, 0);
  step();
  assert.equal(frames.size, 0);
}

{
  const harness = makeHarness();
  const { root, window } = harness;
  assert.match(root.textContent, /Pedagogue/);
  assert.match(root.textContent, /Aperture/);
  assert.match(root.textContent, /Atlas/);
  assert.match(root.textContent, /FDAT/);
  window.document.addEventListener('loom-practice-load', (event) => {
    window.document.querySelector('#message').value = event.detail.text;
    window.document.querySelector('#protected').value = event.detail.protectedTerms.map(item => item.value).join('\\n');
    window.document.querySelector('#journeys').value = event.detail.journeyMarkers.map(item => item.value).join('\\n');
  });
  window.document.querySelector('[data-scene="2"]').click();
  window.document.querySelector('#ltLoad').click();
  assert.equal(root.dataset.scene, 'release-block');
  assert.match(window.document.querySelector('#message').value, /glass seed/);
  window.document.querySelector('#ltLoadClient').click();
  assert.match(window.document.querySelector('#message').value, /ORCHID-ROUTE \/ client-side only/);
  assert.match(window.document.querySelector('#protected').value, /keep this inside the room/);
  assert.match(window.document.querySelector('#journeys').value, /amber handoff/);
}

console.log(JSON.stringify({ schema: 'td613.loom.theater-dom-witness/v0.1', status: 'PASS', scenes: 8, provider_calls: 0, deployment_authority: false }));
