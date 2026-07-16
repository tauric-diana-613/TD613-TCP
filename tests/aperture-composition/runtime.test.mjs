import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import {
  APERTURE_COMPOSITION_RUNTIME_SCHEMA,
  installApertureComposition
} from '../../app/engine/aperture-composition.js';

class FakeCustomEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.detail = options.detail;
  }
}

function eventTarget() {
  return {
    events: [],
    dispatchEvent(event) {
      this.events.push(event);
      return true;
    }
  };
}

function frameFixture() {
  const contentWindow = eventTarget();
  return {
    id: 'td613ApertureTool',
    dataset: {},
    contentWindow
  };
}

const root = {
  ...eventTarget(),
  crypto: webcrypto,
  TextEncoder,
  CustomEvent: FakeCustomEvent
};
const frame = frameFixture();
const modules = {
  release: Object.freeze({ version: 'v3.1-alpha', apertureSchema: 'td613-aperture/v3.1-alpha' }),
  taskIntent: Object.freeze({ schema: 'td613.aperture.task-intent-route/v3.0-alpha' }),
  compatibility: Object.freeze({ schema: 'td613.aperture.v31-v30-bridge-compatibility/v0.1' }),
  reciprocalBridge: Object.freeze({ schema: 'td613.phase4.reciprocal-bridge/v0.1' })
};

const receipt = await installApertureComposition({
  root,
  frame,
  modules,
  CustomEventImpl: FakeCustomEvent,
  cryptoImpl: webcrypto,
  TextEncoderImpl: TextEncoder,
  created_at: '2026-07-16T00:00:00.000Z'
});

assert.equal(receipt.status, 'COMPOSITION_VALIDATED');
assert.equal(receipt.idempotent_reuse, false);
assert.deepEqual(receipt.installed_components, [
  'release-manifest',
  'task-intent',
  'v31-compatibility',
  'phase4-reciprocal-bridge'
]);
assert.deepEqual(receipt.compatibility_aliases, ['TD613_PHASE4_RECIPROCAL_BRIDGE']);
assert.equal(frame.dataset.apertureComposition, 'v0.1');
assert.equal(frame.contentWindow.TD613_APERTURE_COMPOSITION.schema, APERTURE_COMPOSITION_RUNTIME_SCHEMA);
assert.equal(root.TD613_APERTURE_COMPOSITION.schema, APERTURE_COMPOSITION_RUNTIME_SCHEMA);
assert.equal(frame.contentWindow.TD613_APERTURE_RELEASE, modules.release);
assert.equal(frame.contentWindow.TD613_APERTURE_TASK_INTENT, modules.taskIntent);
assert.equal(frame.contentWindow.TD613_APERTURE_V31_COMPATIBILITY, modules.compatibility);
assert.equal(frame.contentWindow.TD613_PHASE4_RECIPROCAL_BRIDGE, modules.reciprocalBridge);
assert.equal(root.TD613_PHASE4_RECIPROCAL_BRIDGE, modules.reciprocalBridge);
assert.equal(Object.hasOwn(root, 'TD613_APERTURE_TASK_INTENT'), false);
assert.equal(Object.getOwnPropertyDescriptor(frame.contentWindow, 'TD613_APERTURE_COMPOSITION').writable, false);
assert.deepEqual(frame.contentWindow.events.map(event => event.type), [
  'td613:phase4-reciprocal-bridge-ready',
  'td613:aperture-composition-ready'
]);

const reused = await installApertureComposition({
  root,
  frame,
  modules,
  CustomEventImpl: FakeCustomEvent,
  cryptoImpl: webcrypto,
  TextEncoderImpl: TextEncoder,
  created_at: '2026-07-16T00:01:00.000Z'
});
assert.equal(reused.idempotent_reuse, true);
assert.equal(frame.contentWindow.events.length, 2);

await assert.rejects(
  () => installApertureComposition({
    root: { ...eventTarget(), crypto: webcrypto, TextEncoder, CustomEvent: FakeCustomEvent },
    frame: frameFixture(),
    modules: { ...modules, release: { version: 'v3.0-alpha', apertureSchema: 'td613-aperture/v3.0-alpha' } },
    CustomEventImpl: FakeCustomEvent,
    cryptoImpl: webcrypto,
    TextEncoderImpl: TextEncoder
  }),
  /release identity/
);

await import('./frame-reload.test.mjs');

console.log('aperture-composition/runtime.test.mjs passed');
