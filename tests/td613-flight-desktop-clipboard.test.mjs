import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const htmlPath = new URL('../app/safe-harbor/td613-flight.html', import.meta.url);
const scriptPath = new URL('../app/safe-harbor/td613-flight-clipboard-fidelity.js', import.meta.url);
const injectorPath = new URL('../api/flight-html.js', import.meta.url);
const html = fs.readFileSync(htmlPath, 'utf8');
const source = fs.readFileSync(scriptPath, 'utf8');
const injector = fs.readFileSync(injectorPath, 'utf8');

const OLD_PHRASE = 'When authoring, stay academically rigorous yet grounded in high speculation.';
const NEW_PHRASE = 'When reasoning and authoring, stay academically rigorous, and rigorous (but imaginative) to forensic AI empiricism, yet both rigors grounded in high speculation.';
const SOURCE_SCRIPT_TAG = '<script src="/safe-harbor/td613-flight-clipboard-fidelity.js?v=20260722-desktop-linebreak-v1"></script>';
const SERVED_SCRIPT_URL = '/safe-harbor/td613-flight-clipboard-fidelity.js?v=20260817-desktop-semantic-paragraph-v4';

assert.equal(html.includes(OLD_PHRASE), false, 'legacy Flight phrase must be absent');
assert.ok((html.split(NEW_PHRASE).length - 1) >= 2, 'visible label and generated phrase must both use the new wording');
assert.ok(html.includes(SOURCE_SCRIPT_TAG), 'Flight source must retain the clipboard helper insertion point');
assert.match(html, /blocks\.join\("\\n\\n"\)/u, 'Flight builder must create literal blank lines between packet blocks before clipboard serialization');
assert.ok(injector.includes(SERVED_SCRIPT_URL), 'production Flight injector must serve the current clipboard asset epoch');
assert.match(injector, /CLIPBOARD_ASSET_SOURCE/u);
assert.match(injector, /CLIPBOARD_ASSET_CURRENT/u);
assert.match(source, /td613\.flight\.clipboard-fidelity\/2026-08-17-v4/u);
assert.match(source, /desktop-dual-mime-copy/u);
assert.match(source, /mobile-writeText/u);
assert.match(source, /semanticParagraphHtml/u);
assert.match(source, /clipboardData\.setData\('text\/plain'/u);
assert.match(source, /clipboardData\.setData\('text\/html'/u);
assert.match(source, /payloadStepperValue/u);
assert.match(source, /contentEditable/u);
assert.match(source, /pointerup/u);
assert.match(source, /authPayload/u);

function makeEventNode(initial = {}) {
  const listeners = new Map();
  return Object.assign({
    textContent: '',
    value: '',
    dataset: {},
    style: {},
    attributes: {},
    listeners,
    selectionStart: 0,
    selectionEnd: 0,
    selectionDirection: 'none',
    addEventListener(type, handler) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(handler);
    },
    removeEventListener(type, handler) {
      const current = listeners.get(type) || [];
      listeners.set(type, current.filter(candidate => candidate !== handler));
    },
    setAttribute(name, value) {
      this.attributes[name] = String(value);
    },
    dispatchEvent(event) {
      (listeners.get(event.type) || []).slice().forEach(handler => handler(event));
      return true;
    },
    setSelectionRange(start, end, direction = 'none') {
      this.selectionStart = start;
      this.selectionEnd = end;
      this.selectionDirection = direction;
    },
    select() {
      this.setSelectionRange(0, String(this.value ?? '').length);
    },
    focus() {},
    blur() {
      (listeners.get('blur') || []).slice().forEach(handler => handler({ type: 'blur' }));
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
  (node.listeners.get(type) || []).slice().forEach(handler => handler(event));
  return event;
}

function createHarness({ mobile = false } = {}) {
  const clipboardWrites = [];
  const textWrites = [];
  const nativeCopies = [];
  const clipboardEvents = [];
  const bodyChildren = [];
  const documentListeners = new Map();
  const status = makeEventNode();
  const payload = makeEventNode({ textContent: '12' });
  const authPayload = makeEventNode({ value: '12' });
  const output = makeEventNode();
  const previousFocus = makeEventNode();
  let activeElement = previousFocus;
  let authPayloadInputEvents = 0;
  authPayload.addEventListener('input', () => { authPayloadInputEvents += 1; });
  let selectedNode = null;

  previousFocus.focus = () => { activeElement = previousFocus; };
  output.focus = () => { activeElement = output; };
  output.closest = () => null;

  const document = {
    readyState: 'complete',
    get activeElement() {
      return activeElement;
    },
    body: {
      appendChild(node) {
        bodyChildren.push(node);
      }
    },
    addEventListener(type, handler) {
      if (!documentListeners.has(type)) documentListeners.set(type, []);
      documentListeners.get(type).push(handler);
    },
    getElementById(id) {
      if (id === 'copyStatus') return status;
      if (id === 'payloadStepperValue') return payload;
      if (id === 'authPayload') return authPayload;
      if (id === 'outputText') return output;
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
      const node = makeEventNode();
      node.focus = () => { activeElement = node; };
      node.remove = () => {};
      return node;
    },
    execCommand(command) {
      if (command !== 'copy') return false;

      const clipboardStore = new Map();
      const copyEvent = {
        type: 'copy',
        defaultPrevented: false,
        clipboardData: {
          setData(type, value) {
            clipboardStore.set(String(type), String(value));
          },
          getData(type) {
            return clipboardStore.get(String(type)) || '';
          }
        },
        preventDefault() {
          this.defaultPrevented = true;
        }
      };

      if (activeElement?.listeners) {
        (activeElement.listeners.get('copy') || []).slice().forEach(handler => handler(copyEvent));
      }

      if (copyEvent.defaultPrevented) {
        clipboardEvents.push({
          plain: clipboardStore.get('text/plain') || '',
          html: clipboardStore.get('text/html') || ''
        });
      } else if (activeElement && typeof activeElement.value === 'string') {
        const start = Number.isInteger(activeElement.selectionStart) ? activeElement.selectionStart : 0;
        const end = Number.isInteger(activeElement.selectionEnd) ? activeElement.selectionEnd : activeElement.value.length;
        nativeCopies.push(activeElement.value.slice(start, end));
      }

      return true;
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
    nativeCopies,
    clipboardEvents,
    status,
    payload,
    authPayload,
    output,
    previousFocus,
    bodyChildren,
    documentListeners,
    get activeElement() { return activeElement; },
    get selectedNode() { return selectedNode; },
    get authPayloadInputEvents() { return authPayloadInputEvents; }
  };
}

{
  const harness = createHarness({ mobile: false });
  const sample = 'Paragraph one.\n\nParagraph two.\nLine two.\n\nFinal paragraph.';
  const expectedHtml = '<div data-td613-flight-clipboard="semantic-paragraphs"><p>Paragraph one.</p><p>Paragraph two.<br>Line two.</p><p>Final paragraph.</p></div>';
  harness.output.value = sample;
  harness.output.setSelectionRange(4, 11, 'forward');

  const result = await harness.context.window.TD613FlightClipboardFidelity.copyText(sample, 'output', harness.output);

  assert.equal(result.ok, true);
  assert.equal(result.mode, 'desktop-dual-mime-copy');
  assert.deepEqual(
    harness.clipboardEvents,
    [{ plain: sample, html: expectedHtml }],
    'desktop Output copy must explicitly put exact plain text and semantic paragraph HTML on the real copy-event clipboard'
  );
  assert.deepEqual(harness.nativeCopies, [], 'desktop Output copy must cancel default textarea serialization after owning clipboardData');
  assert.deepEqual(harness.textWrites, [], 'successful desktop copy-event override must not detour through async writeText');
  assert.equal(harness.clipboardWrites.length, 0, 'successful synchronous desktop path must not need the async ClipboardItem fallback');
  assert.equal(harness.output.selectionStart, 4, 'desktop copy must restore the user selection start');
  assert.equal(harness.output.selectionEnd, 11, 'desktop copy must restore the user selection end');
  assert.equal(harness.activeElement, harness.previousFocus, 'desktop copy must restore prior focus');
  assert.match(harness.status.textContent, /desktop-dual-mime-copy/u);
}

{
  const harness = createHarness({ mobile: false });
  const api = harness.context.window.TD613FlightClipboardFidelity;
  assert.equal(
    api.semanticParagraphHtml('A & <B>\ninside\n\nC\n\n\nD'),
    '<div data-td613-flight-clipboard="semantic-paragraphs"><p>A &amp; &lt;B&gt;<br>inside</p><p>C</p><p><br></p><p>D</p></div>',
    'semantic HTML must escape text, keep single newlines inside a paragraph, and preserve additional blank lines explicitly'
  );
}

{
  const harness = createHarness({ mobile: true });
  const sample = 'Mobile line one\n\nMobile paragraph two';
  harness.output.value = sample;
  const result = await harness.context.window.TD613FlightClipboardFidelity.copyText(sample, 'output', harness.output);
  assert.equal(result.ok, true);
  assert.equal(result.mode, 'mobile-writeText');
  assert.deepEqual(harness.textWrites, [sample], 'mobile must retain the existing exact writeText path');
  assert.deepEqual(harness.clipboardEvents, [], 'mobile must not acquire the desktop dual-MIME path');
  assert.deepEqual(harness.nativeCopies, []);
  assert.equal(harness.clipboardWrites.length, 0);
}

{
  const harness = createHarness({ mobile: false });
  const sample = 'CRLF first\r\n\r\nCRLF second';
  const result = await harness.context.window.TD613FlightClipboardFidelity.copyText(sample, 'generic');
  assert.equal(result.ok, true);
  assert.equal(result.mode, 'desktop-writeText');
  assert.deepEqual(harness.textWrites, ['CRLF first\n\nCRLF second'], 'generic clipboard path must retain blank lines while canonicalizing source line endings');
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
