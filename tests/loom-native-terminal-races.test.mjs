/** Synthetic native terminal/control integration. No browser-layout or provider witness claim. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { webcrypto } from 'node:crypto';
import { JSDOM } from 'jsdom';
import { installKhonapolitTerminal } from '../app/dome-world/marrowline-terminal.js';
import { installMarrowlineLoomDemo } from '../app/dome-world/marrowline-loom-demo.js';
import { clearMarrowlineAttachments, getMarrowlineAttachments, stageMarrowlineAttachments } from '../app/dome-world/marrowline-attachments.js';
import { createLoomAiGovernance, LOOM_HANDOFF_TTL_MS } from '../app/dome-world/holonomy-loom/ai-handoff.js';
import { bindLoomDemoRequest, loomDemoDigest, loomDemoReceiptDigest, loomDemoResult, LOOM_DEMO_STAGE_RECEIPT_SCHEMA } from '../app/dome-world/holonomy-loom/demo-contract.js';

const html = fs.readFileSync(new URL('../app/dome-world/marrowline.html', import.meta.url), 'utf8');
const flush = () => new Promise(resolve => setTimeout(resolve, 0));
async function until(predicate) {
  const deadline = Date.now() + 3000;
  while (!predicate()) { if (Date.now() > deadline) throw new Error('Native synthetic lifecycle did not reach the expected state.'); await flush(); }
}

async function harness(t, { stageInitially = true, cryptoBarrier = true, complete = false } = {}) {
  const dom = new JSDOM(html, { url: 'https://td613.com/dome-world/marrowline.html#loom-demo' });
  const root = dom.window, doc = root.document, calls = [];
  Object.defineProperty(root, 'crypto', { configurable: true, value: webcrypto });
  root.File = File; root.Blob = Blob;
  root.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} });
  root.HTMLElement.prototype.scrollIntoView = function () {};
  const fetchImpl = async (url, options = {}) => {
    if (!options.method) return { ok: true, text: async () => 'SYNTHETIC CORPUS', json: async () => ({ hasGeminiKey: true }) };
    calls.push({ url, body: JSON.parse(options.body) });
    if (complete) {
      const request = calls.at(-1).body;
      const bound = await bindLoomDemoRequest(request, root);
      try {
        const result = { schema: 'td613.loom.ai-task-result/v0.1', request_id: request.request_id, status: 'completed',
          answer: 'Rules received; selected file bodies are still pending.', missing_information: [], used_document_ids: [], suggested_next_step: '' };
        const stage = { schema: LOOM_DEMO_STAGE_RECEIPT_SCHEMA, activation_digest: request.activation.activation_digest,
          phase: request.phase, request_id: request.request_id, request_digest: await loomDemoDigest(request, root),
          current_input_digest: bound.governance.input_digest, prior_result_digest: bound.receipt.prior_result_digest,
          result_digest: await loomDemoDigest(loomDemoResult(result, bound.selected.documents), root),
          predecessor_receipt_digest: request.predecessor ? await loomDemoReceiptDigest(request.predecessor, root) : null,
          expires_at: request.activation.expires_at, admission_state: 'ADMITTED', stage_policy: request.phase === 'ACTIVATE' ? 'AIA_ONLY' : 'SELECTED_FILES_BOUND',
          authority_transferred: false, auth: { scheme: 'hmac-sha256', key_id: 'td613-loom-demo-stage-v1', tag: 'A'.repeat(43) } };
        return { ok: true, status: 200, json: async () => ({ ...result, loom_demo_binding: bound.receipt, loom_demo_stage_receipt: stage,
          native_reply: { ok: true, text: result.answer, relay: { transcript: result.answer, khonapolit: { present: true, text: result.answer } }, receipt: { provider: { completion: { complete: true } } } } }) };
      } finally { bound.governor.close(); }
    }
    return { ok: false, status: 503, json: async () => ({ error: 'SYNTHETIC_PROVIDER_HELD' }) };
  };
  root.fetch = fetchImpl;
  const before = new Map(['fetch', 'CustomEvent', 'window'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  Object.defineProperty(globalThis, 'fetch', { configurable: true, writable: true, value: fetchImpl });
  Object.defineProperty(globalThis, 'CustomEvent', { configurable: true, writable: true, value: root.CustomEvent });
  Object.defineProperty(globalThis, 'window', { configurable: true, writable: true, value: root });
  clearMarrowlineAttachments(root);
  assert.equal(installKhonapolitTerminal(doc, root), true);
  await root.TD613_KHONAPOLIT_TERMINAL.ready;
  const packet = { task: 'Count fictional workstreams.', documents: [{ id: 'selected', name: 'selected.md', text: 'Three fictional workstreams.' }], rules: ['Use only selected files.'] };
  packet.governance = await createLoomAiGovernance(packet, { withheldDocumentCount: 1 }, root);
  let expire;
  const realSetTimeout = root.setTimeout.bind(root);
  root.setTimeout = (callback, milliseconds, ...args) => {
    if (milliseconds > LOOM_HANDOFF_TTL_MS - 5000 && milliseconds <= LOOM_HANDOFF_TTL_MS) expire = callback;
    return realSetTimeout(callback, milliseconds, ...args);
  };
  const controller = await installMarrowlineLoomDemo(packet, doc, root);
  if (stageInitially) await controller.stageAia();
  let release;
  const barrier = new Promise(resolve => { release = resolve; });
  let cryptoWaits = 0;
  Object.defineProperty(root, 'crypto', { configurable: true, value: {
    randomUUID: () => webcrypto.randomUUID(),
    subtle: { digest: async (...args) => { if (cryptoBarrier && cryptoWaits++ === 0) await barrier; return webcrypto.subtle.digest(...args); } }
  } });
  t.after(async () => {
    release();
    root.TD613_KHONAPOLIT_TERMINAL.stop();
    await until(() => doc.getElementById('khonapolitSend').dataset.transmissionState === 'ready');
    controller.destroy(); clearMarrowlineAttachments(root); await flush(); dom.window.close();
    for (const [key, descriptor] of before) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
    }
  });
  return { root, doc, controller, calls, release, expire: () => { assert.equal(typeof expire, 'function'); expire(); },
    waiting: () => until(() => controller.snapshot().busy && cryptoWaits > 0),
    settled: () => until(() => doc.getElementById('khonapolitSend').dataset.transmissionState === 'ready') };
}

for (const targetStage of ['AIA', 'files']) for (const closure of ['leave', 'expiry']) {
  test(`${closure} during ${targetStage} attachment bytes cannot reactivate late staging`, async t => {
    const h = await harness(t, { stageInitially: targetStage === 'files', cryptoBarrier: false, complete: targetStage === 'files' });
    if (targetStage === 'files') { await h.controller.submit(); await h.settled(); assert.equal(h.controller.snapshot().phase, 'AIA_SENT'); }
    let release, reads = 0;
    const barrier = new Promise(resolve => { release = resolve; });
    t.after(() => release());
    h.root.File = class DelayedFile extends File {
      async arrayBuffer() { reads++; await barrier; return super.arrayBuffer(); }
    };
    const staging = targetStage === 'files' ? h.controller.stageFiles() : h.controller.stageAia();
    await until(() => reads > 0);
    if (closure === 'leave') h.controller.leaveDemo(); else h.expire();
    release(); await staging;
    assert.equal(h.controller.snapshot().phase, closure === 'leave' ? 'LEFT' : 'EXPIRED');
    if (closure === 'leave') assert.equal(h.controller.snapshot().active, false);
    assert.equal(getMarrowlineAttachments().length, 0, 'late staging owns no attachments after closure');
    assert.equal(h.doc.getElementById('khonapolitPrompt').value, '', 'late callback cannot preload a task');
    assert.equal(h.calls.length, targetStage === 'files' ? 1 : 0);
    assert.throws(() => h.controller.exportPacket());
  });
}

test('native retry after admitted activation retains its visible reply and waits for the file gesture', async t => {
  const h = await harness(t, { cryptoBarrier: false, complete: true });
  await h.controller.submit(); await h.settled();
  assert.equal(h.controller.snapshot().phase, 'AIA_SENT');
  assert.equal(h.doc.querySelectorAll('#khonapolitMessages .relay-message').length, 1);
  const before = h.doc.getElementById('khonapolitMessages').textContent;
  h.doc.dispatchEvent(new h.root.CustomEvent('td613:marrowline:retry-independent'));
  await flush(); await h.settled();
  assert.equal(h.calls.length, 1, 'completed activation cannot be retried as an unauthorized new provider request');
  assert.equal(h.controller.snapshot().phase, 'AIA_SENT');
  assert.equal(h.doc.getElementById('khonapolitMessages').textContent, before, 'successful activation is not removed before the next lawful file gesture');
  assert.throws(() => h.controller.exportPacket());
});

test('late ended Loom staging cannot remove a separately staged ordinary attachment', async t => {
  const h = await harness(t, { stageInitially: false, cryptoBarrier: false });
  let release, reads = 0;
  const barrier = new Promise(resolve => { release = resolve; }); t.after(() => release());
  h.root.File = class DelayedFile extends File { async arrayBuffer() { reads++; await barrier; return super.arrayBuffer(); } };
  const staging = h.controller.stageAia(); await until(() => reads > 0);
  h.controller.leaveDemo();
  await stageMarrowlineAttachments([new File(['Ordinary separately selected source.'], 'ordinary-selected.txt', { type: 'text/plain' })], { environment: h.root });
  const ordinaryId = getMarrowlineAttachments()[0].id;
  release(); await staging;
  assert.equal(h.controller.snapshot().phase, 'LEFT');
  assert.deepEqual(getMarrowlineAttachments().map(item => item.id), [ordinaryId]);
  assert.equal(h.calls.length, 0);
});

test('rapid native Send is locked before asynchronous Loom preparation', async t => {
  const h = await harness(t);
  const first = h.controller.submit();
  const duplicate = h.root.TD613_KHONAPOLIT_TERMINAL.submitTask('Second impatient tap');
  await h.waiting();
  assert.equal(h.doc.querySelectorAll('#khonapolitMessages .message[data-role="user"]').length, 1);
  assert.equal(h.doc.getElementById('khonapolitSend').getAttribute('aria-label'), 'Stop transmission');
  h.root.TD613_KHONAPOLIT_TERMINAL.stop(); h.release();
  await Promise.all([first, duplicate]); await h.settled();
  assert.equal(h.calls.length, 0, 'stop during preparation prevents dispatch; duplicate cannot create a second request');
  assert.equal(h.controller.snapshot().phase, 'AIA_STAGED');
  assert.equal(h.controller.snapshot().busy, false);
  assert.equal(getMarrowlineAttachments().length, 1, 'the activation attachment survives an explicit stop');
  assert.throws(() => h.controller.exportPacket());
});

for (const closure of ['leave', 'expiry']) {
  test(`${closure} while native Loom preparation is pending cannot dispatch or unlock export`, async t => {
    const h = await harness(t);
    const submitting = h.controller.submit(); await h.waiting();
    if (closure === 'leave') h.controller.leaveDemo(); else h.expire();
    h.release(); await submitting; await h.settled();
    assert.equal(h.calls.length, 0);
    assert.equal(h.controller.snapshot().phase, closure === 'leave' ? 'LEFT' : 'EXPIRED');
    assert.equal(h.controller.snapshot().predecessor_request_id, null);
    assert.throws(() => h.controller.exportPacket());
    assert.equal(h.doc.getElementById('khonapolitSend').getAttribute('aria-label'), 'Send message');
  });
}
