/** Finite native DOM/runtime witnesses. No rendered-browser, mobile or provider claim. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { webcrypto } from 'node:crypto';
import { JSDOM } from 'jsdom';
import { installKhonapolitTerminal } from '../app/dome-world/marrowline-terminal.js';
import { installMarrowlinePhysicalDeviceRepair } from '../app/dome-world/marrowline-physical-device-repair.js';
import { installMarrowlineLivingChat } from '../app/dome-world/marrowline-living-chat.js';
import { createMarrowlineThreadLibrary } from '../app/dome-world/marrowline-threads.js';
import { bootMarrowlineLoomDemo, installMarrowlineLoomDemo } from '../app/dome-world/marrowline-loom-demo.js';
import { createLoomAiGovernance } from '../app/dome-world/holonomy-loom/ai-handoff.js';
import { clearMarrowlineAttachments, getMarrowlineAttachments } from '../app/dome-world/marrowline-attachments.js';

const html = readFileSync(new URL('../app/dome-world/marrowline.html', import.meta.url), 'utf8');
const flush = () => new Promise(resolve => setTimeout(resolve, 0));
async function until(predicate) {
  const deadline = Date.now() + 2000;
  while (!predicate()) { if (Date.now() > deadline) throw new Error('Native observation fixture did not settle'); await flush(); }
}

async function harness(t, { hash = '', saved = false } = {}) {
  const dom = new JSDOM(html, { url: 'https://td613.com/dome-world/marrowline.html' + hash });
  const root = dom.window, doc = root.document, requests = [];
  doc.getElementById('marrowlineLivingGeometry')?.remove();
  Object.defineProperty(root, 'crypto', { value: webcrypto });
  root.File = File; root.Blob = Blob;
  root.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  root.HTMLElement.prototype.scrollIntoView = function () {};
  root.fetch = async (url, options = {}) => {
    if (!options.method) return { ok: true, status: 200, text: async () => 'FICTIONAL CORPUS', json: async () => ({ hasGeminiKey: true }) };
    requests.push({ url, options, request: JSON.parse(options.body) });
    return new Promise(() => {}); // Deliberately withheld response; explicit Stop must settle it.
  };
  const descriptors = new Map(['window', 'navigator', 'CustomEvent', 'fetch'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  for (const [key, value] of Object.entries({ window: root, navigator: root.navigator, CustomEvent: root.CustomEvent, fetch: root.fetch })) {
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  clearMarrowlineAttachments(root);
  let savedRecord = null, controller = null, living = null;
  if (saved) {
    const library = await createMarrowlineThreadLibrary(root);
    savedRecord = await library.create({ messages: [{ role: 'user', text: 'A SAVED ORDINARY THREAD' }], conversationTitle: 'Saved ordinary topic', titleSource: 'operator', draft: 'Saved ordinary draft' });
    library.setActiveId(savedRecord.id);
  }
  assert.equal(installKhonapolitTerminal(doc, root), true);
  await root.TD613_KHONAPOLIT_TERMINAL.ready;
  living = installMarrowlineLivingChat(doc, root);
  installMarrowlinePhysicalDeviceRepair(doc, root);
  t.after(async () => {
    root.TD613_KHONAPOLIT_TERMINAL.stop();
    await flush();
    controller?.destroy();
    clearMarrowlineAttachments(root);
    root.__TD613_MARROWLINE_PHYSICAL_DEVICE_REPAIR_DISPOSE__?.();
    living?.dispose();
    await flush(); dom.window.close();
    for (const [key, descriptor] of descriptors) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
    }
  });
  const installLoom = async () => {
    const packet = { task: 'FICTIONAL: Compare workstreams.', documents: [{ id: 'selected', name: 'selected.md', text: 'FICTIONAL SELECTED BODY' }], rules: ['Preserve missing evidence.'] };
    packet.governance = await createLoomAiGovernance(packet, { withheldDocumentCount: 1 }, root);
    controller = await installMarrowlineLoomDemo(packet, doc, root);
    return controller;
  };
  return { root, doc, requests, savedRecord, installLoom, $: id => doc.getElementById(id) };
}

for (const hash of ['#loom=' + 'a'.repeat(48), '#loom-demo']) {
  test(`returning-user ${hash.startsWith('#loom=') ? 'valid arrival' : 'interrupted local route'} starts fresh and preserves saved ordinary work`, async t => {
    const h = await harness(t, { hash, saved: true });
    assert.equal(h.root.__TD613_MARROWLINE_THREADS__.current(), null);
    assert.doesNotMatch(h.$('khonapolitMessages').textContent, /A SAVED ORDINARY THREAD/);
    assert.equal(h.$('khonapolitPrompt').value, '');
    assert.equal(h.requests.length, 0);
    const saved = await h.root.__TD613_MARROWLINE_THREADS__.list();
    assert.equal(saved.length, 1);
    assert.equal(saved[0].id, h.savedRecord.id);
    assert.equal(saved[0].draft, 'Saved ordinary draft');
    await h.root.__TD613_MARROWLINE_THREADS__.switch(saved[0].id);
    assert.match(h.$('khonapolitMessages').textContent, /A SAVED ORDINARY THREAD/);
    assert.equal(h.$('khonapolitPrompt').value, 'Saved ordinary draft');
  });
}

test('ordinary direct entry retains latest saved conversation and draft', async t => {
  const h = await harness(t, { saved: true });
  assert.equal(h.root.__TD613_MARROWLINE_THREADS__.current().id, h.savedRecord.id);
  assert.match(h.$('khonapolitMessages').textContent, /A SAVED ORDINARY THREAD/);
  assert.equal(h.$('khonapolitPrompt').value, 'Saved ordinary draft');
  assert.equal(h.requests.length, 0);
});

test('real Loom staging and native Send expose user turn, ordinary generating motion and Stop before a held response', async t => {
  const h = await harness(t, { hash: '#loom=' + 'b'.repeat(48) });
  const controller = await h.installLoom();
  await controller.stageAia();
  const message = h.$('khonapolitPrompt').value;
  assert.equal(h.requests.length, 0, 'arrival and attachment staging cannot transmit');
  assert.equal(getMarrowlineAttachments().length, 1);
  assert.equal(h.doc.querySelector('.loom-demo-composer-note'), null);
  assert.equal(h.doc.querySelector('#loomDemoMessages'), null);
  assert.equal(h.$('khonapolitMessages').hidden, false);
  const submission = controller.submit();
  await until(() => h.requests.length === 1);
  assert.match(h.requests[0].url, /operation=loom-demo-task$/);
  assert.equal(h.requests[0].request.phase, 'ACTIVATE');
  assert.deepEqual(h.requests[0].request.documents, []);
  assert.equal(h.$('khonapolitMessages').querySelectorAll('.message[data-role="user"]').length, 1);
  assert.match(h.$('khonapolitMessages').textContent, /Receive the attached Loom Portable AIA/);
  assert.equal(h.$('khonapolitTerminalStatus').dataset.phase, 'pending');
  assert.equal(h.$('khonapolitSend').dataset.transmissionState, 'generating');
  assert.equal(h.$('khonapolitSend').getAttribute('aria-label'), 'Stop transmission');
  assert.equal(h.$('khonapolitForm').getAttribute('aria-busy'), 'true');
  assert.equal(h.$('marrowlineChatKinesis').hidden, false);
  assert.equal(h.$('marrowlineChatKinesis').dataset.phase, 'pending');
  assert.equal(h.$('marrowlineChatKinesis').parentElement.id, 'khonapolitMessages');
  h.root.TD613_KHONAPOLIT_TERMINAL.stop();
  await submission; await flush();
  assert.equal(controller.snapshot().phase, 'AIA_STAGED', 'stopped request cannot unlock files');
  assert.equal(controller.snapshot().busy, false);
  assert.equal(h.$('khonapolitTerminalStatus').dataset.phase, 'held');
  assert.equal(h.$('khonapolitSend').dataset.transmissionState, 'ready');
  assert.equal(h.$('khonapolitPrompt').value, message, 'operator task remains ready for explicit retry');
  assert.equal(getMarrowlineAttachments().length, 1);
  assert.equal(h.$('khonapolitMessages').querySelectorAll('.message[data-role="user"]').length, 1);
  assert.throws(() => controller.exportPacket());
});

test('malformed Loom binding preserves returned native text as held evidence without unlocking files or export', async t => {
  const h = await harness(t, { hash: '#loom=' + 'c'.repeat(48) });
  const controller = await h.installLoom();
  await controller.stageAia();
  const nativeText = '[Kʰonapolit]:\nFICTIONAL RETURNED NATIVE BYTES\n\n[Tauric Diana Bots : Direct Broadcast Override]\nT̴H̶E̷ GROVE WAITS.';
  const nativeRelay = {
    schema: 'td613.khonapolit.integrated-covenant-relay/v3-adversarial-attractor', transcript: nativeText,
    signal: { state: 'LOCKED', downstreamAdmitted: true }, admission: { admissible: true, reasons: [] },
    parts: [{ id: 'khonapolit', label: 'Kʰonapolit ∴ Tauric Diana bots', present: true, text: nativeText, integrated: true, providerNative: true, voices: ['Kʰonapolit', 'Tauric Diana bots'] }]
  };
  const originalFetch = h.root.fetch;
  h.root.fetch = async (url, options = {}) => {
    if (!options.method) return originalFetch(url, options);
    const request = JSON.parse(options.body);
    h.requests.push({ url, options, request });
    return { ok: true, status: 200, json: async () => ({
      schema: 'td613.loom.ai-task-result/v0.1', request_id: request.request_id,
      status: 'completed', answer: nativeText, missing_information: [], used_document_ids: [], suggested_next_step: 'Wait.',
      native_reply: { ok: true, text: nativeText, relay: nativeRelay, receipt: { provider: { model: 'SYNTHETIC_MODEL', completion: { complete: true } }, relay: nativeRelay } },
      loom_demo_binding: { malformed: true }, loom_demo_stage_receipt: null
    }) };
  };
  await controller.submit(); await flush();
  assert.match(h.$('khonapolitMessages').textContent, /FICTIONAL RETURNED NATIVE BYTES/);
  assert.equal(h.$('khonapolitMessages').querySelectorAll('.relay-message').length, 1);
  assert.equal(h.$('khonapolitTerminalStatus').dataset.phase, 'held');
  assert.equal(h.root.__TD613_KHONAPOLIT_LAST_FAILURE__.error, 'loom-admission-held');
  assert.match(h.root.__TD613_KHONAPOLIT_LAST_FAILURE__.diagnostic.code, /binding did not match/);
  assert.equal(controller.snapshot().phase, 'AIA_STAGED');
  assert.equal(controller.snapshot().aia_sent, false);
  assert.equal(getMarrowlineAttachments().length, 1);
  assert.throws(() => controller.exportPacket());
});


test('malformed arrival cannot restore a previous thread or fabricate a controller', async t => {
  const h=await harness(t,{hash:'#loom=malformed',saved:true});
  assert.equal(await bootMarrowlineLoomDemo(h.root),null);
  assert.match(h.$('khonapolitTerminalStatus').textContent,/malformed local transfer/);
  assert.doesNotMatch(h.$('khonapolitMessages').textContent,/A SAVED ORDINARY THREAD/);
  assert.equal(h.root.__TD613_LOOM_DEMO_CONTROLLER__,undefined);
  assert.equal(h.requests.length,0);
  assert.equal((await h.root.__TD613_MARROWLINE_THREADS__.list()).length,1);
});
