import test from 'node:test';
import assert from 'node:assert/strict';
import { AnimationCoordinator } from '../app/dome-world/holonomy-loom/animation-coordinator.js';

function rig(options = {}) {
  let wall = 0;
  let nextId = 0;
  const queued = new Map();
  const cancelled = [];
  const coordinator = new AnimationCoordinator({
    requestFrame(callback) { const id = ++nextId; queued.set(id, callback); return id; },
    cancelFrame(id) { cancelled.push(queued.get(id)); queued.delete(id); },
    now: () => wall,
    ...options,
  });
  return {
    coordinator, queued, cancelled,
    advance(ms) {
      wall += ms;
      const batch = [...queued.values()];
      queued.clear();
      for (const callback of batch) callback(wall);
    },
  };
}

function packet(id = 'quiet', rest = false) {
  return { scene: { id }, geometry: { rest, route: [{ x: 2, y: 4 }] }, replay: { seed: 613 }, claim_ceiling: ['L_UNEARNED'] };
}

test('one pending frame and one immutable world snapshot for every render pass', () => {
  const { coordinator, queued, advance } = rig();
  const first = [], second = [];
  const supplied = packet();
  coordinator.registerPass('weather', (snapshot) => first.push(snapshot));
  coordinator.registerPass('strands', (snapshot) => second.push(snapshot));
  coordinator.setViewport({ width: 390, height: 400, dpr: 2 });
  coordinator.setPacket(supplied);
  supplied.geometry.route[0].x = 900;
  coordinator.play();
  coordinator.play();
  assert.equal(queued.size, 1);
  assert.equal(coordinator.inspect().pendingFrames, 1);
  advance(40);
  assert.equal(queued.size, 1);
  assert.equal(first.length, 2);
  for (let index = 0; index < first.length; index += 1) {
    assert.equal(first[index], second[index]);
    assert.equal(first[index].packet.geometry.route[0].x, 2);
    assert.ok(Object.isFrozen(first[index]));
    assert.ok(Object.isFrozen(first[index].packet.geometry.route[0]));
    assert.throws(() => { first[index].viewport.width = 9; }, TypeError);
  }
});

test('cadence is bounded and the finite sequence settles with zero idle frames', () => {
  const { coordinator, queued, advance } = rig({ durationMs: 100, maxFps: 25 });
  const times = [];
  coordinator.registerPass('time', ({ timeMs }) => times.push(timeMs));
  coordinator.setPacket(packet());
  advance(10);
  advance(20);
  assert.deepEqual(times, [0]);
  advance(10);
  assert.deepEqual(times, [0, 40]);
  advance(60);
  assert.deepEqual(times, [0, 40, 100]);
  assert.equal(queued.size, 0);
  assert.equal(coordinator.inspect().playing, false);
  advance(10000);
  assert.deepEqual(times, [0, 40, 100]);
});

test('pause and packet replacement invalidate cancelled callbacks', () => {
  const { coordinator, queued, cancelled, advance } = rig();
  const ids = [];
  coordinator.registerPass('scene', ({ packet: current }) => ids.push(current.scene.id));
  coordinator.setPacket(packet());
  coordinator.pause();
  const paused = coordinator.inspect();
  cancelled[0]();
  assert.deepEqual(coordinator.inspect(), paused);
  assert.equal(queued.size, 0);
  coordinator.play();
  coordinator.setPacket(packet('red'));
  const replaced = coordinator.inspect();
  cancelled[1]();
  assert.deepEqual(coordinator.inspect(), replaced);
  assert.equal(queued.size, 1);
  advance(50);
  assert.equal(ids.at(-1), 'red');
});

test('hidden views cancel, preserve the rendered state, and resume without time debt', () => {
  const { coordinator, queued, cancelled, advance } = rig();
  coordinator.setPacket(packet());
  advance(100);
  coordinator.setVisible(false);
  assert.equal(coordinator.inspect().timeMs, 100);
  assert.equal(coordinator.inspect().playing, false);
  assert.equal(queued.size, 0);
  advance(50000);
  cancelled.at(-1)();
  assert.equal(queued.size, 0);
  coordinator.setVisible(true);
  advance(100);
  assert.equal(coordinator.inspect().timeMs, 200);
  coordinator.setVisible(false);
  coordinator.pause();
  coordinator.setVisible(true);
  assert.equal(queued.size, 0, 'explicit pause cancels automatic visibility resume');
});

test('reduced motion renders the complete static equivalent and cannot accumulate RAF', () => {
  const { coordinator, queued, advance } = rig();
  let snapshot;
  coordinator.registerPass('static', (value) => { snapshot = value; });
  coordinator.setPacket(packet());
  advance(50);
  coordinator.setReducedMotion(true);
  assert.equal(queued.size, 0);
  assert.equal(snapshot.reducedMotion, true);
  assert.equal(snapshot.progress, 1);
  coordinator.seek(0);
  coordinator.play();
  assert.equal(snapshot.progress, 1);
  coordinator.setPacket(packet('yellow'));
  assert.equal(snapshot.packet.scene.id, 'yellow');
  assert.equal(snapshot.progress, 1);
  assert.equal(queued.size, 0);
  coordinator.setReducedMotion(false);
  assert.equal(queued.size, 0, 'normal motion does not silently restart after preference change');
  coordinator.play();
  assert.equal(queued.size, 1);
  assert.equal(snapshot.progress, 0);
});

test('structural rest is a persistent complete state, not a perpetually animated pause', () => {
  const { coordinator, queued, advance } = rig();
  let snapshot;
  coordinator.registerPass('rest', (value) => { snapshot = value; });
  coordinator.setPacket(packet('rest', true));
  assert.equal(snapshot.rest, true);
  assert.equal(snapshot.progress, 1);
  coordinator.play();
  coordinator.reset();
  coordinator.seek(600);
  coordinator.setVisible(false);
  coordinator.setVisible(true);
  advance(10000);
  assert.equal(snapshot.progress, 1);
  assert.equal(queued.size, 0);
});

test('scrub/replay uses exact time, stable seed and packet without resuming', () => {
  const { coordinator, queued, advance } = rig();
  const frames = [];
  coordinator.registerPass('receipt', (snapshot) => frames.push(snapshot));
  coordinator.setPacket(packet());
  coordinator.seek(613);
  const original = frames.at(-1);
  assert.equal(queued.size, 0);
  coordinator.play();
  advance(150);
  coordinator.seek(613);
  assert.deepEqual(frames.at(-1), original);
  assert.equal(frames.at(-1).packet, original.packet);
  coordinator.seek(-1);
  assert.equal(frames.at(-1).timeMs, 0);
  coordinator.seek(99999);
  assert.equal(frames.at(-1).timeMs, 2600);
  coordinator.reset();
  assert.equal(frames.at(-1).timeMs, 0);
  assert.equal(queued.size, 0);
});

test('registration changes are frame-bounded and a render pass may safely pause its owner', () => {
  const { coordinator, queued } = rig();
  const calls = [];
  let unregisterSecond;
  const unregisterFirst = coordinator.registerPass('first', (snapshot) => {
    calls.push(['first', snapshot]);
    unregisterSecond();
    coordinator.pause();
  });
  unregisterSecond = coordinator.registerPass('second', (snapshot) => calls.push(['second', snapshot]));
  coordinator.setPacket(packet());
  assert.equal(calls.length, 2);
  assert.equal(calls[0][1], calls[1][1]);
  assert.equal(queued.size, 0);
  unregisterFirst();
  coordinator.registerPass('first', () => {});
  unregisterFirst();
  assert.equal(coordinator.inspect().passCount, 1, 'old unregister does not remove a replacement');
});

test('mutating state from a render pass fails closed instead of creating nested render loops', () => {
  const { coordinator, queued } = rig();
  coordinator.registerPass('bad-owner', () => coordinator.seek(50));
  assert.throws(() => coordinator.setPacket(packet()), /Render passes may project state/);
  assert.equal(queued.size, 0);
  assert.equal(coordinator.inspect().playing, false);
});

test('a failed asynchronous render cannot leave a live scheduling chain', () => {
  const { coordinator, queued, advance } = rig();
  coordinator.registerPass('fails-later', ({ timeMs }) => {
    if (timeMs > 0) throw new Error('render failed');
  });
  coordinator.setPacket(packet());
  assert.throws(() => advance(100), /render failed/);
  assert.equal(queued.size, 0);
  assert.equal(coordinator.inspect().pendingFrames, 0);
  assert.equal(coordinator.inspect().playing, false);
});

test('a packet loaded while hidden waits; an explicit static packet never resumes', () => {
  const { coordinator, queued, advance } = rig();
  coordinator.setVisible(false);
  coordinator.setPacket(packet());
  assert.equal(queued.size, 0);
  assert.equal(coordinator.inspect().timeMs, 0);
  coordinator.setVisible(true);
  advance(100);
  assert.equal(coordinator.inspect().timeMs, 100);
  coordinator.setVisible(false);
  coordinator.setPacket(packet('static'), { animate: false });
  coordinator.setVisible(true);
  assert.equal(coordinator.inspect().timeMs, 2600);
  assert.equal(queued.size, 0);
});

test('onState may advance a completed sequence without leaving a stale clock', () => {
  let coordinator;
  let advanced = false;
  const setup = rig({ durationMs: 100, onState(state) {
    if (!advanced && state.timeMs === 100) {
      advanced = true;
      coordinator.setPacket(packet('recovery'));
    }
  } });
  coordinator = setup.coordinator;
  coordinator.setPacket(packet('red'));
  setup.advance(100);
  assert.equal(setup.queued.size, 1);
  assert.equal(coordinator.inspect().timeMs, 0);
  setup.advance(100);
  assert.equal(setup.queued.size, 0);
});

test('destroy cancels and invalidates work, clears passes, and is idempotent', () => {
  const { coordinator, queued, cancelled } = rig();
  coordinator.registerPass('pass', () => {});
  coordinator.setPacket(packet());
  coordinator.destroy();
  cancelled[0]();
  coordinator.destroy();
  assert.equal(queued.size, 0);
  assert.equal(coordinator.inspect().passCount, 0);
  assert.equal(coordinator.inspect().destroyed, true);
  assert.throws(() => coordinator.play(), /destroyed/);
});

test('bad timing, viewport, and mutable/non-JSON packets are rejected', () => {
  for (const durationMs of [0, -1, NaN, Infinity, 60001]) {
    assert.throws(() => rig({ durationMs }), /durationMs/);
  }
  for (const maxFps of [0, Infinity, 121]) assert.throws(() => rig({ maxFps }), /maxFps/);
  const { coordinator } = rig();
  for (const time of [NaN, Infinity, '12']) assert.throws(() => coordinator.seek(time), /timeMs/);
  for (const viewport of [{ width: 0, height: 10 }, { width: 30, height: NaN }, { width: 30, height: 10, dpr: 0 }]) {
    assert.throws(() => coordinator.setViewport(viewport), /finite number/);
  }
  assert.throws(() => coordinator.setPacket({}), /scene.id/);
  assert.throws(() => coordinator.setPacket({ ...packet(), fn() {} }), /JSON/);
  assert.throws(() => coordinator.setPacket({ ...packet(), date: new Date() }), /JSON/);
  const cycle = packet(); cycle.self = cycle;
  assert.throws(() => coordinator.setPacket(cycle), /acyclic JSON/);
  assert.throws(() => coordinator.setReducedMotion('false'), /boolean/);
  assert.throws(() => coordinator.setVisible(1), /boolean/);
  assert.throws(() => coordinator.setPacket(packet(), { animate: 'yes' }), /boolean/);
});


test('explicit continuous motion shares one bounded owner while semantic progress stays finite', () => {
  const { coordinator, queued, advance } = rig({ durationMs: 100, maxFps: 25 });
  const snapshots = [];
  coordinator.registerPass('ambient', snapshot => snapshots.push(snapshot));
  coordinator.setContinuous(true);
  coordinator.setPacket(packet());
  advance(100);
  assert.equal(snapshots.at(-1).progress, 1);
  assert.equal(queued.size, 1);
  const count = snapshots.length;
  advance(10);
  assert.equal(snapshots.length, count, 'finite progress must not bypass the frame budget');
  advance(40);
  assert.equal(snapshots.at(-1).motionTimeMs, 150);
  coordinator.setVisible(false);
  advance(9000);
  assert.equal(queued.size, 0);
  coordinator.setVisible(true);
  advance(50);
  assert.equal(snapshots.at(-1).motionTimeMs, 200, 'hidden time never becomes animation debt');
  assert.equal(snapshots.at(-1).progress, 1, 'visibility resume never resets semantic progress');
  coordinator.setContinuous(false);
  assert.equal(queued.size, 0);
  coordinator.setContinuous(true);
  assert.equal(queued.size, 1);
  coordinator.setPacket(packet('rest', true));
  assert.equal(queued.size, 0);
  coordinator.setPacket(packet());
  coordinator.setReducedMotion(true);
  assert.equal(queued.size, 0);
});
