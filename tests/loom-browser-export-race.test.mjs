/** Mounted-workspace lifecycle witness. The injected package builder returns
 * explicitly synthetic bytes: real archive content/recomputation is witnessed
 * separately. These tests prove no provider, browser or empirical result.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { JSDOM } from 'jsdom';
const { mountLoomAiWorkspace } = await import(process.env.TD613_LOOM_PRESENTATION === 'classic79'
  ? '../app/dome-world/holonomy-loom/ai-workspace-classic79.js'
  : '../app/dome-world/holonomy-loom/ai-workspace.js');

function deferred() {
  let resolve, reject;
  const promise = new Promise((a, b) => { resolve = a; reject = b; });
  return { promise, resolve, reject };
}
async function until(predicate, description) {
  const deadline = Date.now() + 3000;
  while (!predicate()) {
    if (Date.now() > deadline) throw new Error(`Export lifecycle did not settle: ${description}`);
    await new Promise(resolve => setTimeout(resolve, 5));
  }
}
async function drain() {
  // Complete the injected builder's promise and the mounted event's continuation.
  for (let index = 0; index < 4; index++) await new Promise(resolve => setImmediate(resolve));
}
function syntheticPackage(sessionExport) {
  const root = sessionExport.session.root.ref;
  return {
    artifact: { ...sessionExport, portable_tomography: { evidence_class: 'SYNTHETIC_LIFECYCLE_TEST_ONLY' } },
    prompt: `SYNTHETIC_LIFECYCLE_PROMPT:${root}`,
    zipBytes: new Uint8Array([0x53, 0x59, 0x4e, 0x54, 0x48]),
    files: []
  };
}
function harness(t, build = call => call.pending.promise) {
  const dom = new JSDOM('<section id="fixture"></section>', {
    url: 'https://td613.com/dome-world/holonomy-loom.html', pretendToBeVisual: true
  });
  const environment = dom.window, root = environment.document.querySelector('#fixture');
  const beforeRaf = globalThis.requestAnimationFrame, beforeCancel = globalThis.cancelAnimationFrame;
  let frame = 0, disposed = false;
  globalThis.requestAnimationFrame = () => ++frame;
  globalThis.cancelAnimationFrame = () => {};
  Object.defineProperty(environment, 'crypto', { configurable: true, value: webcrypto });
  environment.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} });
  const downloads = [], clipboard = [], calls = [], requests = [], blobs = [], revoked = [];
  environment.fetch = (...args) => { requests.push(args); throw new Error('Lifecycle test attempted network access'); };
  Object.defineProperty(environment.navigator, 'clipboard', {
    configurable: true, value: { writeText: async value => { clipboard.push(value); } }
  });
  environment.URL.createObjectURL = blob => { blobs.push(blob); return `blob:synthetic-lifecycle-${blobs.length}`; };
  environment.URL.revokeObjectURL = url => revoked.push(url);
  environment.HTMLAnchorElement.prototype.click = function () { downloads.push({ filename: this.download, href: this.href }); };
  const prepareSessionBundle = (sessionExport, options) => {
    const call = { sessionExport, options, pending: deferred() };
    calls.push(call);
    return build(call, calls.length);
  };
  const ui = mountLoomAiWorkspace(root, environment, { prepareSessionBundle });
  const $ = selector => root.querySelector(selector);
  const change = (selector, value) => {
    $(selector).value = value;
    $(selector).dispatchEvent(new environment.Event('input', { bubbles: true }));
  };
  const dispose = () => { if (!disposed) { disposed = true; ui.dispose(); } };
  t.after(() => {
    dispose();
    for (const call of calls) call.pending.resolve(syntheticPackage(call.sessionExport));
    environment.close();
    if (beforeRaf === undefined) delete globalThis.requestAnimationFrame;
    else globalThis.requestAnimationFrame = beforeRaf;
    if (beforeCancel === undefined) delete globalThis.cancelAnimationFrame;
    else globalThis.cancelAnimationFrame = beforeCancel;
  });
  const settled = () => until(() => root.getAttribute('aria-busy') !== 'true', 'local preparation');
  const prepare = async (task = 'Read the selected evidence and keep its boundaries.') => {
    change('#aiTask', task);
    if (!$('#aiNewRootNotice').hidden) {
      $('#aiNewRootConfirm').checked = true;
      $('#aiNewRootConfirm').dispatchEvent(new environment.Event('change', { bubbles: true }));
    }
    $('#aiPreparePortable').click();
    await settled();
    assert.ok(ui.inspect().session, 'real local preparation established its session');
    assert.equal($('#aiExportSession').disabled, false);
    return JSON.parse($('#aiSessionReceipt').textContent);
  };
  $('#loomFirstCrossingLeave').click();
  return { environment, root, ui, $, change, prepare, settled, dispose, downloads, clipboard, calls, requests, blobs, revoked };
}

test('pending session export refuses duplicate dispatch and preserves the prepared root and packet', async t => {
  const h = harness(t), prepared = await h.prepare();
  const before = h.ui.inspect().session;
  h.$('#aiExportSession').click();
  assert.equal(h.calls.length, 1, 'package factory entered once');
  assert.equal(h.$('#aiExportSession').disabled, true, 'pending export locks immediately');
  h.$('#aiExportSession').dispatchEvent(new h.environment.Event('click'));
  assert.equal(h.calls.length, 1, 'a second event cannot start another package');
  assert.equal(h.calls[0].options.environment, h.environment);
  assert.equal(h.calls[0].options.signal.aborted, false);
  h.calls[0].pending.resolve(syntheticPackage(h.calls[0].sessionExport));
  await until(() => h.downloads.length === 1, 'single complete export');
  await drain();
  assert.equal(h.downloads[0].filename, 'loom-portable-session.zip');
  assert.equal(h.downloads.length, 1);
  assert.deepEqual(h.ui.inspect().session, before, 'export never advances local custody');
  assert.deepEqual(h.calls[0].sessionExport.session.root, prepared.session.root);
  assert.deepEqual(h.calls[0].sessionExport.portable_task, prepared.portable_task);
  assert.equal(h.requests.length, 0);
});

test('queued Tools close cannot steal pending export focus and completion restores Export', async t => {
  const h = harness(t);
  await h.prepare();
  const opener = h.$('#loomPreparedInspect'), dialog = h.$('#loomTools');
  opener.focus(); opener.click();
  assert.equal(dialog.open, true);
  // A native close event can be queued until after the next user gesture.
  // Close the dialog now, and deliver that queued event during preparation.
  dialog.close = () => dialog.removeAttribute('open');
  h.$('#loomToolsClose').click();
  const action = h.$('#aiExportSession');
  action.focus(); action.click();
  const notice = h.$('#aiSessionPackageStatus');
  assert.equal(h.environment.document.activeElement, notice, 'pending action parks focus on its adjacent status');
  assert.equal(notice.tabIndex, -1);
  dialog.dispatchEvent(new h.environment.Event('close'));
  assert.equal(h.environment.document.activeElement, notice, 'older dialog event preserves the newer export gesture');
  h.calls[0].pending.resolve(syntheticPackage(h.calls[0].sessionExport));
  await until(() => h.downloads.length === 1, 'keyboard export completion');
  await drain();
  assert.equal(action.disabled, false);
  assert.equal(h.environment.document.activeElement, action, 'finished export restores its original control');
});

test('deliberate outside focus movement during export survives the queued Tools close and completion', async t => {
  const h = harness(t);
  await h.prepare();
  const opener = h.$('#loomPreparedInspect'), dialog = h.$('#loomTools');
  opener.focus(); opener.click();
  dialog.close = () => dialog.removeAttribute('open');
  h.$('#loomToolsClose').click();
  const action = h.$('#aiExportSession');
  action.focus(); action.click();
  assert.equal(h.environment.document.activeElement, h.$('#aiSessionPackageStatus'));
  const deliberate = h.$('#aiMarrowline');
  deliberate.focus();
  assert.equal(h.environment.document.activeElement, deliberate);
  dialog.dispatchEvent(new h.environment.Event('close'));
  assert.equal(h.environment.document.activeElement, deliberate, 'queued dialog event leaves the chosen outside control focused');
  h.calls[0].pending.resolve(syntheticPackage(h.calls[0].sessionExport));
  await until(() => h.downloads.length === 1, 'export after deliberate focus movement');
  await drain();
  assert.equal(h.environment.document.activeElement, deliberate, 'export completion respects a newer focus choice');
  assert.equal(action.disabled, false);
});

test('session copy uses the same completed package prompt without rebuilding or copying a plain fallback', async t => {
  const h = harness(t), prepared = await h.prepare();
  h.$('#aiExportSession').click();
  h.calls[0].pending.resolve(syntheticPackage(h.calls[0].sessionExport));
  await until(() => h.downloads.length === 1, 'package cache');
  await until(() => !h.$('#aiCopySession').disabled, 'copy becomes available');
  h.$('#aiCopySession').click();
  await until(() => h.clipboard.length === 1, 'enriched session prompt');
  assert.equal(h.calls.length, 1, 'copy shares the completed package');
  assert.equal(h.clipboard[0], `SYNTHETIC_LIFECYCLE_PROMPT:${prepared.session.root.ref}`);
  assert.equal(h.requests.length, 0);
});

test('promise-backed clipboard writes the completed enriched prompt as text without a download', async t => {
  const h = harness(t), prepared = await h.prepare(), items = [];
  // Node Blob supplies text(); JSDOM's Blob lacks that reader. The mounted
  // ClipboardItem branch itself remains the installed workspace behavior.
  h.environment.Blob = globalThis.Blob;
  h.environment.ClipboardItem = class {
    constructor(parts) { this.parts = parts; items.push(this); }
  };
  const writes = [];
  h.environment.navigator.clipboard.write = async offered => {
    writes.push(offered);
    const blob = await offered[0].parts['text/plain'];
    assert.equal(blob.type, 'text/plain');
    h.clipboard.push(await blob.text());
  };
  h.$('#aiCopySession').click();
  assert.equal(items.length, 1, 'the direct gesture creates a promise-backed item');
  assert.equal(writes.length, 1, 'clipboard.write starts before package completion');
  assert.equal(typeof items[0].parts['text/plain'].then, 'function');
  assert.equal(h.clipboard.length, 0, 'pending package supplies no premature text');
  assert.equal(h.calls.length, 1);
  h.calls[0].pending.resolve(syntheticPackage(h.calls[0].sessionExport));
  await until(() => h.clipboard.length === 1, 'promise-backed clipboard content');
  await until(() => /Session copied with its local mathematical report/.test(h.$('#aiStatus').textContent), 'copy confirmation');
  assert.equal(h.clipboard[0], `SYNTHETIC_LIFECYCLE_PROMPT:${prepared.session.root.ref}`);
  assert.equal(h.downloads.length, 0);
  assert.equal(h.requests.length, 0);
});

test('early clipboard denial and draft invalidation consume the later stale content rejection', async t => {
  const h = harness(t), items = [], unhandled = [];
  const capture = reason => unhandled.push(reason);
  process.on('unhandledRejection', capture);
  t.after(() => process.removeListener('unhandledRejection', capture));
  h.environment.ClipboardItem = class {
    constructor(parts) { this.parts = parts; items.push(this); }
  };
  let attemptedWrites = 0;
  h.environment.navigator.clipboard.write = async () => {
    attemptedWrites++;
    // Deliberately reject without consuming the ClipboardItem data promise.
    throw new h.environment.DOMException('Controlled clipboard permission denied', 'NotAllowedError');
  };
  await h.prepare(); h.$('#aiCopySession').click();
  await until(() => /Controlled clipboard permission denied/.test(h.$('#aiStatus').textContent), 'clipboard denial');
  assert.equal(attemptedWrites, 1);
  assert.equal(items.length, 1);
  const stale = h.calls[0];
  h.change('#aiTask', 'New draft after permission denial.');
  const afterEditStatus = h.$('#aiStatus').textContent;
  assert.equal(stale.options.signal.aborted, true, 'invalidation still reaches pending package work after clipboard denial');
  stale.pending.resolve(syntheticPackage(stale.sessionExport));
  await drain();
  assert.equal(h.clipboard.length, 0, 'denied permission never writes stale text');
  assert.equal(h.downloads.length, 0);
  assert.equal(h.blobs.length, 0);
  assert.equal(h.$('#aiStatus').textContent, afterEditStatus, 'late package completion cannot announce success');
  assert.deepEqual(unhandled, [], 'derived ClipboardItem content rejection is consumed');
  assert.equal(h.requests.length, 0);
});

test('editing during a delayed export aborts its publication and later preparation can export', async t => {
  const h = harness(t), original = await h.prepare();
  h.$('#aiExportSession').click();
  const stale = h.calls[0];
  h.change('#aiTask', 'A newly edited request with its own deliberate preparation.');
  assert.equal(stale.options.signal.aborted, true, 'draft invalidation aborts export work');
  const afterEditStatus = h.$('#aiStatus').textContent;
  stale.pending.resolve(syntheticPackage(stale.sessionExport));
  await drain();
  assert.equal(h.downloads.length, 0, 'stale package creates no download');
  assert.equal(h.$('#aiStatus').textContent, afterEditStatus, 'stale completion announces no success');
  assert.equal(h.ui.inspect().session, null, 'unprepared edited draft has no seed export');
  const replacement = await h.prepare('A newly edited request with its own deliberate preparation.');
  assert.notEqual(replacement.session.root.ref, original.session.root.ref);
  h.$('#aiExportSession').click();
  assert.equal(h.calls.length, 2);
  h.calls[1].pending.resolve(syntheticPackage(h.calls[1].sessionExport));
  await until(() => h.downloads.length === 1, 'replacement export');
  assert.equal(h.calls[1].sessionExport.session.root.ref, replacement.session.root.ref);
  assert.equal(h.requests.length, 0);
});

test('an old package cannot publish into a newly prepared root even when the task text repeats', async t => {
  const h = harness(t), original = await h.prepare();
  h.$('#aiExportSession').click();
  const stale = h.calls[0];
  const replacement = await h.prepare(original.portable_task.task);
  assert.notEqual(replacement.session.root.ref, original.session.root.ref, 'repeated content still creates a distinct root');
  const replacementStatus = h.$('#aiStatus').textContent;
  stale.pending.resolve(syntheticPackage(stale.sessionExport));
  await drain();
  assert.equal(stale.options.signal.aborted, true);
  assert.equal(h.downloads.length, 0);
  assert.equal(h.$('#aiStatus').textContent, replacementStatus);
  assert.equal(h.ui.inspect().session.root_ref, replacement.session.root.ref);
});

test('disposal suppresses a delayed package download and status publication', async t => {
  const h = harness(t);
  await h.prepare(); h.$('#aiExportSession').click();
  const stale = h.calls[0], before = h.$('#aiStatus').textContent;
  h.dispose();
  assert.equal(stale.options.signal.aborted, true);
  stale.pending.resolve(syntheticPackage(stale.sessionExport));
  await drain();
  assert.equal(h.downloads.length, 0);
  assert.equal(h.clipboard.length, 0);
  assert.equal(h.$('#aiStatus').textContent, before);
});

test('failed package preserves the prepared session and supports retry without a partial JSON fallback', async t => {
  const h = harness(t), prepared = await h.prepare();
  const before = h.ui.inspect().session;
  h.$('#aiExportSession').click();
  h.calls[0].pending.reject(new Error('Controlled missing mathematical source'));
  await until(() => /Controlled missing mathematical source/.test(h.$('#aiStatus').textContent), 'held package error');
  assert.equal(h.downloads.length, 0);
  assert.equal(h.blobs.length, 0, 'failed package never creates a partial download');
  assert.deepEqual(h.ui.inspect().session, before);
  assert.equal(h.$('#aiExportSession').disabled, false, 'same prepared session remains retryable');
  h.$('#aiExportSession').click();
  assert.equal(h.calls.length, 2);
  assert.equal(h.calls[1].sessionExport.session.root.ref, prepared.session.root.ref);
  h.calls[1].pending.resolve(syntheticPackage(h.calls[1].sessionExport));
  await until(() => h.downloads.length === 1, 'successful retry');
  assert.equal(h.downloads[0].filename, 'loom-portable-session.zip');
  assert.equal(h.requests.length, 0);
});
