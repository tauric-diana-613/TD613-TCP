import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { JSDOM } from 'jsdom';
import { AnimationCoordinator } from '../app/dome-world/holonomy-loom/animation-coordinator.js';
import { mountLoomRuntimeStateView } from '../app/dome-world/holonomy-loom/runtime-state-view.js';

// Deliberately delayed real canonical digests, deterministic owner clock and
// synthetic DOM. These tests earn timing/race evidence, not visual acceptance.
async function until(predicate) {
  for (let attempt = 0; attempt < 400; attempt++) {
    if (predicate()) return;
    await new Promise(resolve => setTimeout(resolve, 5));
  }
  throw new Error('Delayed canonical projection did not settle');
}

function setup(t) {
  const dom = new JSDOM('<section id="field"></section>', { pretendToBeVisual: true });
  const doc = dom.window.document, root = doc.querySelector('#field');
  let wall = 0, frameId = 0, hidden = false, release;
  const frames = new Map(), barrier = new Promise(resolve => { release = resolve; });
  Object.defineProperty(doc, 'hidden', { configurable: true, get: () => hidden });
  const coordinator = new AnimationCoordinator({
    durationMs: 4000, maxFps: 60, now: () => wall,
    requestFrame(callback) { const id = ++frameId; frames.set(id, callback); return id; },
    cancelFrame(id) { frames.delete(id); }
  });
  const runtime = mountLoomRuntimeStateView(root, {
    coordinator,
    environment: { crypto: { subtle: { async digest(...args) { await barrier; return webcrypto.subtle.digest(...args); } } } },
    observe: () => ({ source_revision: 'working-tree', events: [] })
  });
  t.after(() => { release(); runtime.dispose(); coordinator.destroy(); dom.window.close(); });
  const packet = phase => ({ phase, at: '2026-10-03T10:00:00.000Z', task_present: true,
    request_id: 'timing-practice', shared: 2, local: 1, selected_document_ids: ['brief', 'source'],
    outbound_submitted: false, response_received: false, binding_verified: phase === 'checking',
    scene: { id: `practice-${phase}`, rules_count: 1 }, geometry: { rest: false } });
  return { root, coordinator, runtime, frames, release, packet,
    advance(ms) { wall += ms; const batch = [...frames.values()]; frames.clear(); batch.forEach(callback => callback()); },
    visibility(value) { hidden = !value; coordinator.setVisible(value); doc.dispatchEvent(new dom.window.Event('visibilitychange')); }
  };
}

test('canonical compile wait preserves zero-time first exposure and runs the existing clock afterward', async t => {
  const h = setup(t);
  h.coordinator.setPacket(h.packet('prepared'));
  h.advance(9000);
  assert.equal(h.runtime.inspect().status, 'COMPILING');
  assert.equal(h.coordinator.inspect().timeMs, 0);
  assert.equal(h.frames.size, 0);
  h.release();
  await until(() => h.runtime.inspect().status === 'CURRENT');
  assert.equal(h.runtime.inspect().frame.progress, 0);
  assert.equal(h.root.dataset.activeRelation, 'gathering');
  const first = h.root.querySelector('.loom-field-flight text').getAttribute('transform');
  assert.equal(h.frames.size, 1);
  h.advance(180);
  assert.equal(h.coordinator.inspect().timeMs, 180);
  assert.notEqual(h.root.querySelector('.loom-field-flight text').getAttribute('transform'), first);
});

test('compile completion respects explicit pause, scrub and reduced motion instead of replaying them', async t => {
  for (const mode of ['pause', 'seek', 'reduced', 'static']) {
    await t.test(mode, async child => {
      const h = setup(child);
      h.coordinator.setPacket(h.packet('checking'), { animate: mode !== 'static' });
      if (mode === 'pause') h.coordinator.pause();
      if (mode === 'seek') h.coordinator.seek(613);
      if (mode === 'reduced') h.coordinator.setReducedMotion(true);
      h.advance(9000);h.release();
      await until(() => h.runtime.inspect().status === 'CURRENT');
      assert.equal(h.root.dataset.activeRelation, 'created_potential');
      assert.equal(h.frames.size, 0);
      assert.equal(h.coordinator.inspect().timeMs, mode === 'seek' ? 613 : ['reduced', 'static'].includes(mode) ? 4000 : 0);
    });
  }
});

test('hidden and superseded compilation cannot expose an old relation or spend the next packet clock', async t => {
  const h = setup(t);
  h.coordinator.setPacket(h.packet('prepared'));
  h.visibility(false);
  h.coordinator.setPacket(h.packet('checking'));
  h.advance(9000);h.release();
  await new Promise(resolve => setTimeout(resolve, 20));
  assert.equal(h.root.dataset.activeRelation, undefined);
  assert.equal(h.frames.size, 0);
  h.visibility(true);
  await until(() => h.runtime.inspect().status === 'CURRENT');
  assert.equal(h.root.dataset.activeRelation, 'created_potential');
  assert.equal(h.runtime.inspect().view.event.phase, 'checking');
  assert.equal(h.runtime.inspect().frame.progress, 0);
  assert.equal(h.frames.size, 1);
  h.advance(180);
  assert.equal(h.coordinator.inspect().timeMs, 180);
});
