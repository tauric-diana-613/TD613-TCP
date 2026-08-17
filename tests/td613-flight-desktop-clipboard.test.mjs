import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const htmlPath = new URL('../app/safe-harbor/td613-flight.html', import.meta.url);
const scriptPath = new URL('../app/safe-harbor/td613-flight-clipboard-fidelity.js', import.meta.url);
const html = fs.readFileSync(htmlPath, 'utf8');
const source = fs.readFileSync(scriptPath, 'utf8');

const OLD_PHRASE = 'When authoring, stay academically rigorous yet grounded in high speculation.';
const NEW_PHRASE = 'When reasoning and authoring, stay academically rigorous, and rigorous (but imaginative) to forensic AI empiricism, yet both rigors grounded in high speculation.';
const SCRIPT_TAG = '<script src="/safe-harbor/td613-flight-clipboard-fidelity.js?v=20260722-desktop-linebreak-v1"></script>';

assert.equal(html.includes(OLD_PHRASE), false, 'legacy Flight phrase must be absent');
assert.ok((html.split(NEW_PHRASE).length - 1) >= 2, 'visible label and generated phrase must both use the new wording');
assert.ok(html.includes(SCRIPT_TAG), 'Flight must load the clipboard fidelity layer');
assert.match(source, /desktop-writeText/u);
assert.match(source, /mobile-writeText/u);
assert.match(source, /payloadStepperValue/u);
assert.match(source, /contentEditable/u);
assert.match(source, /pointerup/u);
assert.match(source, /authPayload/u);
assert.doesNotMatch(source, /desktop-rich-clipboard/u, 'desktop must not use a rich HTML clipboard route');

function makeEventNode(initial = {}) {
  const listeners = new Map();
  return Object.assign({
    textContent: '',
    value: '',
    dataset: {},
    style: {},
    attributes: {},
    listeners,
    addEventListener(type, handler) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(handler);
    },
    setAttribute(name, value) {
      this.attributes[name] = String(value);
    },
    dispatchEvent(event) {
      (listeners.get(event.type) || []).forEach(handler => handler(event));
      return true;
    },
    focus() {},
    blur() {
      (listeners.get('blur') || []).forEach(handler => handler({ type: 'blur' }));
    },
    ...initial
  });
}

function fire(node, type, extra = {}) {
  const event = {
    type,
    key: '',
    inputType: '',
    preventDefault() {
      event.defaultPrevented = true;
    },
    defaultPrevented: false,
    ...extra
  };
  (node.listeners.get(type) || []).forEach(handler => handler(event));
  return event;
}

function createHarness({ mobile = false } = {}) {
  const clipboardWrites = [];
  const textWrites = [];
  const bodyChildren = [];
  const status = makeEventNode();
  const payload = makeEventNode({ textContent: '12' });
  const authPayload = makeEventNode({ value: '12' });
  let authPayloadInputEvents = 0;
  authPayload.addEventListener('input', () => { authPayloadInputEvents += 1; });
  let selectedNode = null;

  const document = {
    readyState: 'complete',
    body: {
      appendChild(node) {
        bodyChildren.push(node);
      }
    },
    addEventListener() {},
    getElementById(id) {
      if (id === 'copyStatus') return status;
      if (id === 'payloadStepperValue') return payload;
      if (id === 'authPayload') return authPayload;
      return null;
    },
    createRange() {
      return {
        selectNodeContents(node) {
          selectedNode = node;
        }
      };
    },
    createElement(tag) {
      assert.equal(tag, 'textarea');
      return {
        value: '',
        style: {},
        setAttribute() {},
        focus() {},
        select() {},
        setSelectionRange() {},
        remove() {}
      };
    },
    execCommand(command) {
      return command === 'copy';
    }
  };

  class TestEvent {
    constructor(type, options = {}) {
      this.type = type;
      this.bubbles = Boolean(options.bubbles);
    }
  }

  const selection = {
    removeAllRanges() {},
    addRange() {}
  };

  const context = {
    Blob,
    console,
    document,
    globalThis: null,
    navigator: {
      clipboard: {
        async write(items) {
          clipboardWrites.push(items);
        },
        async writeText(value) {
          textWrites.push(value);
        }
      }
    },
    window: {
      Event: TestEvent,
      matchMedia() {
        return { matches: mobile };
      },
      getSelection() {
        return selection;
      },
      requestAnimationFrame(callback) {
        callback();
        return 1;
      }
    }
  };
  context.globalThis = context;
  context.window.window = context.window;
  context.window.document = document;
  context.window.navigator = context.navigator;
  vm.createContext(context);
  vm.runInContext(source, context, { filename: 'td613-flight-clipboard-fidelity.js' });

  return {
    context,
    clipboardWrites,
    textWrites,
    status,
    payload,
    authPayload,
    bodyChildren,
    get selectedNode() { return selectedNode; },
    get authPayloadInputEvents() { return authPayloadInputEvents; }
  };
}

{
  const harness = createHarness({ mobile: false });
  const sample = 'First line\nSecond line\n\nFourth line';
  const result = await harness.context.window.TD613FlightClipboardFidelity.copyText(sample, 'output');
  assert.equal(result.ok, true);
  assert.equal(result.mode, 'desktop-writeText');
  assert.deepEqual(harness.textWrites, [sample], 'desktop clipboard must receive the exact canonical plaintext including paragraph breaks');
  assert.equal(harness.clipboardWrites.length, 0, 'desktop must not offer an HTML clipboard flavor that paste targets can reinterpret');
  assert.match(harness.status.textContent, /desktop-writeText/u);
}

{
  const harness = createHarness({ mobile: true });
  const sample = 'Mobile line one\n\nMobile paragraph two';
  const result = await harness.context.window.TD613FlightClipboardFidelity.copyText(sample, 'output');
  assert.equal(result.ok, true);
  assert.equal(result.mode, 'mobile-writeText');
  assert.deepEqual(harness.textWrites, [sample]);
  assert.equal(harness.clipboardWrites.length, 0);
}

{
  const harness = createHarness({ mobile: false });
  const editor = harness.payload;
  assert.equal(editor.contentEditable, 'true');
  assert.equal(editor.attributes.role, 'textbox');
  assert.equal(editor.attributes.inputmode, 'numeric');
  assert.match(editor.attributes['aria-label'], /tap once/i);
  assert.equal(editor.style.width, undefined, 'inline payload editor must not change width');
  assert.equal(editor.style.height, undefined, 'inline payload editor must not change height');
  assert.equal(editor.style.padding, undefined, 'inline payload editor must not change padding');
  assert.equal(editor.style.font, undefined, 'inline payload editor must inherit the exact existing font');
  assert.equal(editor.style.color, undefined, 'inline payload editor must inherit the exact existing text color');
  assert.equal(editor.style.border, undefined, 'field affordance must not add box-model border size');
  assert.match(editor.style.boxShadow, /inset/u, 'field affordance must be inset-only');

  const pointerEvent = fire(editor, 'pointerup');
  assert.equal(pointerEvent.defaultPrevented, true);
  assert.equal(harness.selectedNode, editor, 'one tap/click must select the complete payload numeral');

  editor.textContent = '37';
  fire(editor, 'input');
  assert.equal(harness.authPayload.value, '12', 'typing may finish before rebuilding Flight output');
  fire(editor, 'blur');
  assert.equal(harness.authPayload.value, '37', 'blur commits the inline numeral to the canonical authorship payload field');
  assert.equal(harness.authPayloadInputEvents, 1, 'commit must dispatch the existing authPayload input path exactly once');

  editor.textContent = '4x2';
  fire(editor, 'input');
  assert.equal(editor.textContent, '42', 'inline editor strips non-digits without changing geometry');
  fire(editor, 'blur');
  assert.equal(harness.authPayload.value, '42');
}

console.log('td613-flight-desktop-clipboard tests passed');
