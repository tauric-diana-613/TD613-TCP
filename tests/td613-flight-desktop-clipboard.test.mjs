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
assert.match(source, /text\/plain/u);
assert.match(source, /text\/html/u);
assert.match(source, /ClipboardItem/u);
assert.match(source, /mobile-writeText/u);
assert.match(source, /desktop-rich-clipboard/u);
assert.match(source, /replace\(\/\\n\/gu, '<br>'\)/u);

function createHarness({ mobile = false } = {}) {
  const clipboardWrites = [];
  const textWrites = [];
  const listeners = new Map();
  const bodyChildren = [];
  const status = { textContent: '' };

  class TestClipboardItem {
    constructor(items) {
      this.items = items;
    }
  }

  const document = {
    readyState: 'complete',
    body: {
      appendChild(node) {
        bodyChildren.push(node);
      }
    },
    addEventListener(type, handler) {
      listeners.set(type, handler);
    },
    getElementById(id) {
      return id === 'copyStatus' ? status : null;
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

  const context = {
    Blob,
    console,
    document,
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
      ClipboardItem: TestClipboardItem,
      matchMedia() {
        return { matches: mobile };
      }
    }
  };
  context.window.window = context.window;
  context.window.document = document;
  context.window.navigator = context.navigator;
  vm.createContext(context);
  vm.runInContext(source, context, { filename: 'td613-flight-clipboard-fidelity.js' });

  return { context, clipboardWrites, textWrites, status, listeners, bodyChildren };
}

{
  const harness = createHarness({ mobile: false });
  const sample = 'First line\nSecond line\n\nFourth line';
  const result = await harness.context.window.TD613FlightClipboardFidelity.copyText(sample, 'output');
  assert.equal(result.ok, true);
  assert.equal(result.mode, 'desktop-rich-clipboard');
  assert.equal(harness.textWrites.length, 0, 'desktop rich path must not collapse into writeText');
  assert.equal(harness.clipboardWrites.length, 1);
  const [item] = harness.clipboardWrites[0];
  assert.equal(await item.items['text/plain'].text(), sample);
  const rich = await item.items['text/html'].text();
  assert.match(rich, /First line<br>Second line<br><br>Fourth line/u);
  assert.match(harness.status.textContent, /desktop-rich-clipboard/u);
}

{
  const harness = createHarness({ mobile: true });
  const sample = 'Mobile line one\n\nMobile paragraph two';
  const result = await harness.context.window.TD613FlightClipboardFidelity.copyText(sample, 'output');
  assert.equal(result.ok, true);
  assert.equal(result.mode, 'mobile-writeText');
  assert.deepEqual(harness.textWrites, [sample]);
  assert.equal(harness.clipboardWrites.length, 0, 'mobile route must retain writeText behavior');
}

console.log('td613-flight-desktop-clipboard tests passed');
