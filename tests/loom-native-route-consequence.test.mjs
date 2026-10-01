import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { webcrypto } from 'node:crypto';
import { JSDOM } from 'jsdom';
import { installMarrowlineDesktopRepair } from '../app/dome-world/marrowline-desktop-repair.js';
import { installMarrowlineLoomDemo } from '../app/dome-world/marrowline-loom-demo.js';
import { createLoomAiGovernance } from '../app/dome-world/holonomy-loom/ai-handoff.js';
import { clearMarrowlineAttachments, getMarrowlineAttachments, removeMarrowlineAttachment } from '../app/dome-world/marrowline-attachments.js';

const cueStyles = await readFile(new URL('../app/dome-world/marrowline-desktop-repair.css', import.meta.url), 'utf8');
const html = await readFile(new URL('../app/dome-world/marrowline.html', import.meta.url), 'utf8');
async function scene() {
  const dom = new JSDOM(html, { url: 'https://td613.com/dome-world/marrowline.html' });
  const root = dom.window, doc = root.document;
  root.File = File; root.Blob = Blob;
  Object.defineProperty(root, 'crypto', { value: webcrypto });
  const style = doc.createElement('style'); style.textContent = cueStyles; doc.head.append(style);
  let calls = 0, opened = 0;
  root.fetch = async () => { calls += 1; throw new Error('Offline consequence test forbids provider calls'); };
  root.open = () => { opened += 1; };
  clearMarrowlineAttachments(root);
  installMarrowlineDesktopRepair(doc, root);
  const packet = { task: 'Fictional: count the workstreams.', documents: [{ id: 'selected', name: 'selected.txt', text: 'Two fictional workstreams.' }], rules: ['Use selected files only.'] };
  packet.governance = await createLoomAiGovernance(packet, { withheldDocumentCount: 1 }, root);
  const controller = await installMarrowlineLoomDemo(packet, doc, root);
  const plus = doc.querySelector('#marrowlineComposerPlus');
  const loom = doc.querySelector('#marrowlineContextLoom');
  return { root, doc, controller, plus, loom, calls: () => calls, opened: () => opened,
    close() { controller.destroy(); clearMarrowlineAttachments(root); root.__TD613_MARROWLINE_STARTER_CAROUSEL_OBSERVER__?.disconnect(); dom.window.close(); } };
}

test('the real plus menu retains recovery and explicit exit after staging without opening Loom', async () => {
  const h = await scene();
  try {
    const send = h.doc.querySelector('#khonapolitSend');
    await h.controller.stageAia();
    assert.equal(h.plus.dataset.loomAttention, 'false');
    assert.equal(h.doc.querySelector('#khonapolitSend'), send, 'the native Send element is retained');
    assert.equal(send.disabled, false);
    assert.equal(h.doc.querySelector('#loomDemoMessages'), null);
    assert.equal(h.doc.querySelector('.loom-demo-composer-note'), null);
    h.plus.click(); h.loom.click();
    const submenu = h.doc.querySelector('#loomDemoMenu');
    assert.equal(submenu.hidden, false, 'staged route must retain local recovery/exit access');
    assert.equal(h.loom.getAttribute('aria-expanded'), 'true');
    assert.equal(h.opened(), 0);
    const restore = [...submenu.querySelectorAll('button')].find(node => node.textContent === 'Restore selected attachments');
    assert.equal(restore.hidden, true, 'recovery stays hidden until staging actually differs');
    assert.equal(h.root.getComputedStyle(restore).display, 'none', 'menu button display rules must honor hidden recovery');
    removeMarrowlineAttachment(getMarrowlineAttachments()[0].id, h.root);
    assert.equal(restore.hidden, false);
    assert.notEqual(h.root.getComputedStyle(restore).display, 'none');
    await h.controller.restoreStage();
    assert.equal(getMarrowlineAttachments().length, 1);
    assert.equal(restore.hidden, true);
    h.plus.click(); h.plus.click(); h.loom.click();
    [...submenu.querySelectorAll('button')].find(node => node.textContent === 'End Loom continuation').click();
    assert.equal(h.controller.snapshot().phase, 'LEFT');
    assert.equal(getMarrowlineAttachments().length, 0);
    assert.equal(h.doc.querySelector('#khonapolitMessages').hidden, false);
    assert.equal(h.calls(), 0);
  } finally { h.close(); }
});

test('attention pause changes cue demand only and does not stage, transmit or change custody', async () => {
  const h = await scene();
  try {
    const before = h.controller.snapshot();
    assert.equal(h.plus.dataset.loomAttention, 'true');
    h.plus.click();
    const pause = h.doc.querySelector('#marrowlineContextLoomCue');
    assert.equal(pause.hidden, false);
    pause.click();
    assert.equal(h.plus.dataset.loomAttention, 'false');
    assert.equal(h.doc.documentElement.dataset.loomCuePaused, 'true');
    assert.equal(pause.getAttribute('aria-pressed'), 'true');
    assert.equal(pause.querySelector('span:nth-child(2)').textContent, 'Resume Loom cue');
    assert.deepEqual(h.controller.snapshot(), before);
    assert.equal(getMarrowlineAttachments().length, 0);
    assert.equal(h.calls(), 0);
    assert.equal(h.opened(), 0);
    pause.click();
    assert.equal(h.plus.dataset.loomAttention, 'true');
    assert.deepEqual(h.controller.snapshot(), before);
    await h.controller.stageAia();
    assert.equal(h.plus.dataset.loomAttention, 'false');
    assert.equal(h.controller.snapshot().phase, 'AIA_STAGED');
  } finally { h.close(); }
});

test('context availability follows live custody, independently of next-staging attention', () => {
  const dom = new JSDOM(html, { url: 'https://td613.com/dome-world/marrowline.html' });
  const root = dom.window, doc = root.document;
  let opened = 0, submenuRequests = 0;
  root.open = () => { opened += 1; };
  root.addEventListener('td613:marrowline:loom-demo-open', () => { submenuRequests += 1; });
  installMarrowlineDesktopRepair(doc, root);
  const plus = doc.querySelector('#marrowlineComposerPlus'), loom = doc.querySelector('#marrowlineContextLoom');
  try {
    for (const phase of ['AIA_STAGED', 'FILES_STAGED', 'CONTINUING', 'DONE']) {
      root.__TD613_LOOM_DEMO_STATE__ = { phase, active: true, pending_steps: false, busy: phase === 'CONTINUING', aia_sent: true };
      root.dispatchEvent(new root.CustomEvent('td613:marrowline:loom-demo-state'));
      plus.click(); loom.click();
      assert.equal(loom.getAttribute('aria-expanded'), 'true', phase);
      assert.equal(opened, 0, phase);
      assert.equal(plus.dataset.loomAttention, 'false', phase);
      doc.dispatchEvent(new root.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    }
    assert.equal(submenuRequests, 4);
    root.__TD613_LOOM_DEMO_STATE__ = { phase: 'LEFT', active: false, pending_steps: false };
    root.dispatchEvent(new root.CustomEvent('td613:marrowline:loom-demo-state'));
    plus.click(); loom.click();
    assert.equal(opened, 1, 'ended route resumes normal Loom action');
    assert.equal(doc.querySelector('#marrowlineContextLoomCue').hidden, true);
  } finally {
    clearMarrowlineAttachments(root);
    root.__TD613_MARROWLINE_STARTER_CAROUSEL_OBSERVER__?.disconnect();
    dom.window.close();
  }
});
