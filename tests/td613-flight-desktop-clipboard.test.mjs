import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

await import('../app/safe-harbor/td613-flight-clipboard-fidelity.js');

const api = globalThis.TD613FlightClipboardFidelity;
const flightSource = fs.readFileSync('app/safe-harbor/td613-flight.html', 'utf8');

class FakeClipboardItem {
  constructor(data) { this.data = data; }
}

test('Flight clipboard normalizes line endings without flattening paragraphs', () => {
  assert.equal(api.normalizeClipboardText('alpha\r\n\r\nbeta\rgamma'), 'alpha\n\nbeta\ngamma');
  assert.equal(api.normalizeClipboardText('alpha\u2028beta\u2029gamma'), 'alpha\nbeta\ngamma');
});

test('desktop clipboard writes plain text and HTML with the same line-break structure', async () => {
  let written = null;
  let writeTextCalled = false;
  const host = {
    Blob,
    ClipboardItem:FakeClipboardItem,
    matchMedia:() => ({ matches:false }),
    navigator:{ clipboard:{
      write:async items => { written = items; },
      writeText:async () => { writeTextCalled = true; }
    } }
  };

  const receipt = await api.writeClipboard(host, 'alpha\r\n\r\nbeta');
  assert.equal(receipt.mode, 'desktop-rich');
  assert.equal(writeTextCalled, false);
  assert.equal(written.length, 1);
  assert.equal(await written[0].data['text/plain'].text(), 'alpha\n\nbeta');
  assert.equal(
    await written[0].data['text/html'].text(),
    '<div data-td613-flight-clipboard="linebreak-fidelity" style="white-space:pre-wrap">alpha<br>\n<br>\nbeta</div>'
  );
});

test('mobile keeps the already-working plain-text clipboard path', async () => {
  let writtenText = null;
  let richWriteCalled = false;
  const host = {
    Blob,
    ClipboardItem:FakeClipboardItem,
    matchMedia:() => ({ matches:true }),
    navigator:{ clipboard:{
      write:async () => { richWriteCalled = true; },
      writeText:async value => { writtenText = value; }
    } }
  };

  const receipt = await api.writeClipboard(host, 'alpha\r\n\r\nbeta');
  assert.equal(receipt.mode, 'plain-text');
  assert.equal(richWriteCalled, false);
  assert.equal(writtenText, 'alpha\n\nbeta');
});

test('Flight page loads the fidelity layer and carries the revised body phrase', () => {
  assert.match(flightSource, /td613-flight-clipboard-fidelity\.js\?v=20260722-desktop-linebreak-v1/);
  assert.match(flightSource, /When reasoning and authoring, stay academically rigorous, and rigorous \(but imaginative\) to forensic AI empiricism, yet both rigors grounded in high speculation\./);
  assert.doesNotMatch(flightSource, /When authoring, stay academically rigorous yet grounded in high speculation\./);
});
