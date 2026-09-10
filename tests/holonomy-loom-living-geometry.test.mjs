import test from 'node:test';
import assert from 'node:assert/strict';
import { AnimationCoordinator } from '../app/dome-world/holonomy-loom/animation-coordinator.js';
import { LIVING_GEOMETRY_CONTRACT, livingGeometryViewport, projectLivingGeometry, drawLivingGeometry, livingGeometryTransform, mountLivingGeometry } from '../app/dome-world/holonomy-loom/living-geometry.js';

function rig() {
  let wall = 0, id = 0;
  const queue = new Map(), documentListeners = new Map();
  const stats = { paths: 0, vertices: 0, finite: true };
  const context = new Proxy({}, { get(_, key) {
    if (key === 'createRadialGradient' || key === 'createLinearGradient') return () => ({ addColorStop() {} });
    return (...values) => {
      if (key === 'beginPath') stats.paths++;
      if (['lineTo', 'moveTo'].includes(key)) stats.vertices++;
      stats.finite &&= values.every(value => typeof value !== 'number' || Number.isFinite(value));
    };
  }, set() { return true; } });
  const canvas = { style: {}, width: 0, height: 0, setAttribute() {}, getContext: () => context, remove() {} };
  const environment = {
    document: { hidden: false, createElement: () => canvas, addEventListener: (key, value) => documentListeners.set(key, value), removeEventListener: key => documentListeners.delete(key) },
    performance: { now: () => wall }, devicePixelRatio: 3,
    requestAnimationFrame: callback => { queue.set(++id, callback); return id; }, cancelAnimationFrame: key => queue.delete(key),
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
    addEventListener() {}, removeEventListener() {},
    IntersectionObserver: class { constructor(callback) { environment.intersect = callback; } observe() {} disconnect() {} },
    ResizeObserver: class { constructor(callback) { environment.resize = callback; } observe() {} disconnect() {} },
  };
  const host = { dataset: {}, classList: { add() {} }, append() {}, getBoundingClientRect: () => ({ width: 1200, height: 900 }) };
  const advance = ms => { wall += ms; const pending = [...queue.values()]; queue.clear(); pending.forEach(callback => callback(wall)); };
  return { environment, host, queue, advance, stats, context, documentListeners };
}

test('aesthetic projection admits only view/request/rest and never invents hidden-state observations', () => {
  const a = projectLivingGeometry({ view: 'chat', hidden_pressure: 400, uncertainty: 0 }, { progress: .3 });
  const b = projectLivingGeometry({ view: 'chat', hidden_pressure: 0, uncertainty: 99 }, { progress: .3 });
  assert.deepEqual(a, b);
  assert.equal(a.outgoing, false);
  assert.equal(a.returning, false);
  const pending = projectLivingGeometry({}, { packet: { phase: 'pending' }, progress: .5 });
  assert.equal(pending.outgoing, true);
  assert.equal(pending.returning, false);
  assert.equal(projectLivingGeometry({}, { packet: { phase: 'completed' } }).returning, true);
  assert.equal(projectLivingGeometry({}, { packet: { phase: 'held' } }).held, true);
  assert.match(a.claimCeiling, /no measured hidden state/);
});

test('reduced motion and explicit rest retain the complete settled geometry', () => {
  const settled = projectLivingGeometry({ view: 'chat' }, { progress: 1 });
  for (const snapshot of [{ progress: 0, reducedMotion: true }, { progress: .3, rest: true }]) {
    const staticField = projectLivingGeometry({ view: 'chat' }, snapshot);
    assert.equal(staticField.settle, settled.settle);
    assert.equal(staticField.orientation, settled.orientation);
  }
});

test('viewport and drawing budget stay bounded even for huge or invalid inputs', () => {
  for (const [width, height, dpr] of [[9000, 9000, 8], [390, 844, 3], [NaN, Infinity, NaN]]) {
    const viewport = livingGeometryViewport(width, height, dpr);
    assert.ok(viewport.pixelWidth * viewport.pixelHeight <= LIVING_GEOMETRY_CONTRACT.maxPixels);
    assert.ok(viewport.dpr <= LIVING_GEOMETRY_CONTRACT.maxDpr);
    const { context, stats } = rig();
    drawLivingGeometry(context, viewport, projectLivingGeometry({}, { packet: { phase: 'completed' } }));
    assert.ok(stats.paths <= LIVING_GEOMETRY_CONTRACT.maxPaths);
    assert.ok(stats.vertices <= LIVING_GEOMETRY_CONTRACT.maxSegments);
    assert.equal(stats.finite, true);
  }
});

test('standalone ambient owner caches geometry and cancels hidden/offscreen/rest frames', () => {
  const { host, environment, advance, queue, documentListeners, stats } = rig();
  const art = mountLivingGeometry(host, { environment, variant: 'marrowline' });
  assert.equal(art.inspect().ownsClock, true);
  assert.equal(queue.size, 1);
  const resizes = art.inspect().resizes;
  const rasters = art.inspect().draws;
  const vertices = stats.vertices;
  advance(100);
  assert.equal(art.inspect().resizes, resizes);
  assert.equal(art.inspect().draws, rasters);
  assert.equal(stats.vertices, vertices, 'no geometry rebuilt on animation frames');
  environment.intersect([{ isIntersecting: false }]);
  const draws = art.inspect().draws;
  assert.equal(queue.size, 0);
  environment.resize(); advance(100);
  assert.equal(art.inspect().draws, draws);
  environment.intersect([{ isIntersecting: true }]);
  assert.equal(queue.size, 1);
  advance(2000);
  assert.equal(queue.size, 1, 'ambient request keeps the single owner alive');
  assert.equal(art.inspect().draws, rasters);
  art.update({ phase: 'pending' });
  environment.document.hidden = true;
  documentListeners.get('visibilitychange')();
  assert.equal(queue.size, 0);
  art.update({ rest: true });
  assert.equal(queue.size, 0);
  art.dispose();
  assert.equal(art.inspect().disposed, true);
  assert.equal(documentListeners.size, 0);
});

test('borrowed clock registers one projection and never replaces application packet or owns a second clock', () => {
  const { host, environment, queue } = rig();
  const coordinator = new AnimationCoordinator({ requestFrame: environment.requestAnimationFrame, cancelFrame: environment.cancelAnimationFrame, now: environment.performance.now });
  let seen;
  coordinator.registerPass('application', snapshot => { seen = snapshot.packet; });
  const art = mountLivingGeometry(host, { environment, coordinator });
  coordinator.setPacket({ scene: { id: 'real-request' }, phase: 'pending', geometry: { rest: false } });
  const packet = seen;
  art.update({ view: 'inspector', phase: 'completed' });
  assert.equal(seen, packet);
  assert.equal(host.dataset.geometryPhase, 'pending');
  assert.equal(art.inspect().ownsClock, false);
  assert.equal(coordinator.inspect().passCount, 2);
  assert.equal(queue.size, 1);
  art.dispose();
  assert.equal(coordinator.inspect().passCount, 1);
  assert.equal(coordinator.inspect().destroyed, false);
  coordinator.destroy();
  assert.equal(queue.size, 0);
});


test('cached ambient transform is slow, deterministic and static at rest', () => {
  const initial = livingGeometryTransform({ motionTimeMs: 0 });
  const afterSecond = livingGeometryTransform({ motionTimeMs: 1000 });
  const dx = Number(afterSecond.match(/translate3d\(([-.0-9]+)/)[1]);
  assert.ok(dx > 0 && dx < .25, 'drift below a quarter CSS pixel per second at entry');
  assert.equal(afterSecond, livingGeometryTransform({ motionTimeMs: 1000 }));
  assert.equal(initial, livingGeometryTransform({ motionTimeMs: 60000, rest: true }));
  assert.equal(initial, livingGeometryTransform({ motionTimeMs: 60000, reducedMotion: true }));
});

test('a standalone view can explicitly retain a finite entrance', () => {
  const { host, environment, advance, queue } = rig();
  const art = mountLivingGeometry(host, { environment, ambient: false });
  advance(2000);
  assert.equal(queue.size, 0);
  art.dispose();
});
