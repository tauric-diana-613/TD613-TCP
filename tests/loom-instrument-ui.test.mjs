import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { JSDOM } from 'jsdom';
import { mountLoomInstrumentLab } from '../app/dome-world/holonomy-loom/instrument-lab.js';
import { mountLoomRuntimeStateView } from '../app/dome-world/holonomy-loom/runtime-state-view.js';
import { compileLoomInstrumentStateView } from '../app/dome-world/holonomy-loom/instrument-state-view.js';
import { createLoomAiGovernance, createPortableLoomAiPacket } from '../app/dome-world/holonomy-loom/ai-handoff.js';

// Synthetic DOM behavior, not desktop/mobile, human comprehension, or hardware
// evidence. Browser witnessing remains an independent release requirement.
const pause = () => new Promise(resolve => setTimeout(resolve, 5));
async function until(predicate) {
  for (let index = 0; index < 400; index++) { if (predicate()) return; await pause(); }
  throw new Error('Synthetic UI did not reach the expected state.');
}
function setup(t, patch = {}) {
  const dom = new JSDOM('<section id="lab"></section>', { url: 'https://td613.invalid/dome-world/holonomy-loom.html' });
  const root = dom.window.document.querySelector('#lab');
  const downloads = [], revoked = [];
  let fetches = 0;
  const environment = {
    crypto: webcrypto, Blob, AbortController,
    setTimeout, clearTimeout,
    URL: { createObjectURL(blob) { downloads.push(blob); return 'blob:synthetic-receipt'; }, revokeObjectURL(url) { revoked.push(url); } },
    fetch() { fetches++; throw new Error('LOCAL_ASSAY_MUST_NOT_DISPATCH_PROVIDER'); },
    ...patch
  };
  const ui = mountLoomInstrumentLab(root, { environment, observe: () => ({ source_revision: 'working-tree', events: [] }) });
  const event = (id, type = 'click') => root.querySelector(`#${id}`).dispatchEvent(new dom.window.Event(type, { bubbles: true }));
  const choose = id => { root.querySelector('#ilBench').value = id; event('ilBench', 'change'); };
  const input = value => { root.querySelector('#ilInput').value = value; event('ilInput', 'input'); };
  const run = async () => { event('ilRun'); await until(() => !root.querySelector('#ilRun').disabled); };
  t.after(() => { ui.dispose(); dom.window.close(); });
  return { dom, root, ui, event, choose, input, run, downloads, revoked, fetches: () => fetches };
}

test('Lab practice loading is inert; running preserves explicit result scope and no gate authority', async t => {
  const h = setup(t);
  assert.equal(h.ui.inspect().receipt, null);
  assert.equal(h.root.querySelectorAll('details').length, 0, 'the bench must not nest disclosure drawers');
  assert.equal(h.root.querySelector('#ilState'), null, 'the Lab must not duplicate the primary runtime');
  assert.equal(h.root.querySelector('#ilResult').hidden, true);
  h.choose('route'); h.event('ilPractice');
  assert.equal(h.ui.inspect().receipt, null);
  assert.equal(h.ui.inspect().input_class, 'FICTIONAL_PRACTICE');
  assert.match(h.root.querySelector('#ilInputClass').textContent, /no measurement or authority/);
  await h.run();
  const receipt = h.ui.inspect().receipt;
  assert.equal(receipt.instrument, 'route');
  assert.equal(receipt.input_class, 'FICTIONAL_PRACTICE');
  assert.deepEqual(receipt.authority, { admission: false, execution: false, empirical_claim: false });
  assert.equal(receipt.result.authority.loom_admission, false);
  assert.equal(receipt.result.authority.consequential_execution, false);
  assert.equal(h.fetches(), 0);
});

test('Quick/Deep exact inspection carries unchanged canonical report, lawful-action gap, and claim scope', async t => {
  const h = setup(t); h.choose('compression'); h.event('ilPractice'); await h.run();
  const canonical = structuredClone(h.ui.inspect().receipt);
  assert.equal(canonical.result.verdict, 'HOLD');
  assert.deepEqual(canonical.result.finite_audit.fibres[0].irreducible_gap, ['EXPORT_CURRENT']);
  const quickText = h.root.querySelector('#ilReceipt').textContent;
  assert.deepEqual(JSON.parse(quickText), canonical);
  assert.equal(h.root.querySelector('#ilExact').hidden, true);
  h.event('ilDeep');
  assert.equal(h.root.querySelector('#ilExact').hidden, false);
  assert.deepEqual(JSON.parse(h.root.querySelector('#ilReceipt').textContent), canonical);
  assert.equal(h.root.querySelector('#ilDeep').getAttribute('aria-pressed'), 'true');
  h.event('ilQuick');
  assert.equal(h.root.querySelector('#ilReceipt').textContent, quickText);
  assert.deepEqual(h.ui.inspect().receipt, canonical);
  assert.equal(h.fetches(), 0);
});

test('edited input, route switching, and malformed reruns invalidate results; receipt depth changes preserve unchanged evidence', async t => {
  const h = setup(t); h.event('ilPractice'); await h.run();
  h.input('{"baseline":0}');
  assert.equal(h.ui.inspect().receipt, null);
  assert.equal(h.root.querySelector('#ilResult').hidden, true);
  assert.equal(h.root.querySelector('#ilReceipt').textContent, '');
  h.event('ilPractice'); await h.run();
  h.choose('compression');
  assert.equal(h.ui.inspect().receipt, null);
  assert.equal(h.root.querySelector('#ilInput').value, '');
  h.event('ilPractice'); await h.run();
  const preserved = h.ui.inspect().receipt; h.event('ilDeep');
  assert.equal(h.ui.inspect().receipt, preserved); h.event('ilQuick');
  assert.equal(h.ui.inspect().receipt, preserved);
  assert.equal(h.root.querySelector('#ilRest, #ilResume, #ilState'), null, 'the primary runtime owns display state and rest');
  assert.equal(h.fetches(), 0);
  h.event('ilPractice'); await h.run();
  h.input('{malformed'); await h.run();
  assert.equal(h.ui.inspect().receipt, null);
  assert.equal(h.root.querySelector('#ilResult').hidden, true);
  assert.match(h.root.querySelector('#ilStatus').textContent, /Input held/);
});

test('rendered conditional information preserves a positive finite result and never turns an invalid distribution into zero', async t => {
  const h = setup(t); h.choose('information-gain'); h.event('ilPractice'); await h.run();
  assert.match(h.root.querySelector('#ilFinding').textContent, /1\.000000 bits/);
  const invalid = JSON.parse(h.root.querySelector('#ilInput').value);
  invalid.distribution[0].probability = 0.1;
  h.input(JSON.stringify(invalid)); await h.run();
  assert.equal(h.ui.inspect().receipt.result.status, 'INADMISSIBLE');
  assert.match(h.root.querySelector('#ilFinding').textContent, /remains held/);
  assert.doesNotMatch(h.root.querySelector('#ilFinding').textContent, /0\.000000/);
});

test('beginning a JSON import clears stale receipt immediately; malformed and oversized imports remain held', async t => {
  const h = setup(t); h.event('ilPractice'); await h.run();
  let release;
  const pending = new Promise(resolve => { release = resolve; });
  const upload = h.root.querySelector('#ilUpload');
  Object.defineProperty(upload, 'files', { configurable: true, value: [{ size: 16, text: () => pending }] });
  h.event('ilUpload', 'change');
  assert.equal(h.ui.inspect().receipt, null, 'old successful receipt must not remain current during intake');
  assert.equal(h.root.querySelector('#ilResult').hidden, true);
  release('{malformed');
  await until(() => /Import held/.test(h.root.querySelector('#ilStatus').textContent));
  assert.equal(h.ui.inspect().receipt, null);
  h.event('ilPractice'); await h.run();
  Object.defineProperty(upload, 'files', { configurable: true, value: [{ size: 131073, text: () => { throw new Error('OVERSIZED_BODY_READ'); } }] });
  h.event('ilUpload', 'change');
  assert.equal(h.ui.inspect().receipt, null);
  assert.equal(h.root.querySelector('#ilResult').hidden, true);
  assert.match(h.root.querySelector('#ilStatus').textContent, /Import held/);
});

test('late receiver recomputation cannot replace a newly selected bench or edited input', async t => {
  const selected = { task: 'Inspect the fictional selected source.', documents: [], rules: [] };
  selected.governance = await createLoomAiGovernance(selected, {}, { crypto: webcrypto });
  const packet = createPortableLoomAiPacket(selected);
  let release;
  const pending = new Promise(resolve => { release = resolve; });
  const h = setup(t, { crypto: {
    subtle: { digest: async (...args) => { await pending; return webcrypto.subtle.digest(...args); } }
  } });
  h.choose('receiver-assurance'); h.input(JSON.stringify(packet)); h.event('ilRun');
  assert.equal(h.root.querySelector('#ilRun').disabled, true);
  h.choose('route'); release();
  await until(() => !h.root.querySelector('#ilRun').disabled);
  assert.equal(h.ui.inspect().receipt, null);
  assert.equal(h.root.querySelector('#ilResult').hidden, true);
  assert.equal(h.root.querySelector('#ilBench').value, 'route');
});

test('Fire Gate remains execution-held in the rendered result; local benchmark stays fictional and bounded', async t => {
  const h = setup(t); h.choose('fire-preparation'); h.event('ilPractice'); await h.run();
  assert.equal(h.ui.inspect().receipt.result.state, 'PREPARED');
  assert.equal(h.root.dataset.assayState, 'EXECUTION_HELD');
  assert.match(h.root.querySelector('#ilResultStatus').textContent, /EXECUTION_HELD/);
  assert.equal(h.ui.inspect().receipt.result.evidence_boundary.actions_executed, false);
  h.choose('local-execution'); h.event('ilPractice'); await h.run();
  const result = h.ui.inspect().receipt.result;
  assert.equal(result.outcome, 'BOUNDED_LOCAL_MACHINE_EXECUTION_WITNESSES_ACQUIRED');
  assert.equal(result.synthetic_origin, true);
  assert.equal(result.episode_state, 'CANDIDATE');
  assert.equal(result.external_host_enforcement_promoted, false);
  assert.equal(result.evidence_boundary.actions_executed, false);
  assert.equal(h.fetches(), 0);
});

test('primary runtime suppresses a compilation hidden midflight and recovers only the latest state when visible', async t => {
  const packet = {
    phase: 'pending', at: '2026-10-02T10:00:00.000Z', request_id: 'hidden-compile',
    shared: 1, local: 0, selected_document_ids: ['selected'],
    outbound_submitted: true, response_received: false, binding_verified: true,
    scene: { id: 'hidden-compile-pending', rules_count: 1 }
  };
  let requiredDigests = 0;
  await compileLoomInstrumentStateView(packet, { cryptoImpl: { subtle: {
    digest(...args) { requiredDigests++; return webcrypto.subtle.digest(...args); }
  } } });
  assert.ok(requiredDigests > 0);

  const dom = new JSDOM('<section id="lab"></section>', { pretendToBeVisual: true });
  const doc = dom.window.document, root = doc.querySelector('#lab');
  let hidden = false, renderPass, entered = false, completedDigests = 0, release;
  Object.defineProperty(doc, 'hidden', { configurable: true, get: () => hidden });
  const barrier = new Promise(resolve => { release = resolve; });
  const controlledCrypto = { subtle: {
    async digest(...args) {
      entered = true;
      await barrier;
      const result = await webcrypto.subtle.digest(...args);
      completedDigests++;
      return result;
    }
  } };
  const ui = mountLoomRuntimeStateView(root, {
    environment: { crypto: controlledCrypto },
    coordinator: { setViewport() {}, registerPass(_name, callback) { renderPass = callback; return () => {}; } },
    observe: () => ({ source_revision: 'working-tree', events: [] })
  });
  t.after(() => { ui.dispose(); dom.window.close(); });
  const snapshot = { packet, progress: 0, timeMs: 0, reducedMotion: true,
    viewport: { width: 390, height: 844, dpr: 1 } };
  const stateRoot = root;
  let hiddenMutations = 0;
  const observer = new dom.window.MutationObserver(records => { hiddenMutations += records.length; });
  observer.observe(stateRoot, { subtree: true, attributes: true, childList: true, characterData: true });
  try {
    renderPass(snapshot);
    await until(() => entered);
    hidden = true;
    doc.dispatchEvent(new dom.window.Event('visibilitychange'));
    await pause();
    hiddenMutations = 0;
    release();
    await until(() => completedDigests === requiredDigests);
    await pause();
    assert.equal(hiddenMutations, 0, 'an asynchronous compilation must not draw into a hidden tab');
    assert.equal(stateRoot.dataset.clientPhase, undefined);
    hidden = false;
    doc.dispatchEvent(new dom.window.Event('visibilitychange'));
    await until(() => ui.inspect().status === 'CURRENT');
    assert.equal(stateRoot.dataset.clientPhase, 'pending');
    assert.equal(stateRoot.querySelector('[data-instrument-active-glyph]').textContent, '出');
    assert.equal(ui.inspect().owns_animation_loop, false);
    assert.equal(ui.inspect().view.state.custody_admitted, false, 'visibility recovery cannot manufacture admission');
  } finally {
    observer.disconnect();
    release();

  }
});

test('one bench selector exposes custody and advisory tools without granting gate authority', t => {
  const h = setup(t);
  h.choose('custody');
  assert.equal(h.root.querySelector('#ilBenchBody').hidden, true);
  assert.equal(h.root.querySelector('#ilCustodyPanel').hidden, false);
  h.event('ilCustody');
  assert.equal(JSON.parse(h.root.querySelector('#ilCustodyReceipt').textContent).lab_admission_authority, false);
  h.choose('advisory');
  assert.equal(h.root.querySelector('#ilCustodyPanel').hidden, true);
  assert.equal(h.root.querySelector('#ilAdvisory').hidden, false);
  assert.equal(h.root.querySelectorAll('details').length, 0);
  assert.equal(h.fetches(), 0);
  assert.equal(h.ui.inspect().receipt, null);
});

test('pending projection reserves the field footprint while hiding stale current evidence', async t => {
  const dom = new JSDOM('<section id="field"></section><section id="session"></section>', { pretendToBeVisual: true });
  const doc = dom.window.document, root = doc.querySelector('#field'), session = doc.querySelector('#session');
  let renderPass, delay = false, release;
  const barrier = new Promise(resolve => { release = resolve; });
  const ui = mountLoomRuntimeStateView(root, {
    environment: { crypto: { subtle: { async digest(...args) { if (delay) await barrier; return webcrypto.subtle.digest(...args); } } } },
    coordinator: { setViewport() {}, registerPass(_name, callback) { renderPass = callback; return () => {}; } },
    observe: () => ({ source_revision: 'working-tree', events: [] })
  });
  t.after(() => { release(); ui.dispose(); dom.window.close(); });
  const base = { phase: 'prepared', task_present: true, shared: 0, local: 0, selected_document_ids: [],
    outbound_submitted: false, response_received: false, binding_verified: false, scene: { id: 'draft', rules_count: 2 } };
  const snapshot = packet => ({ packet, timeMs: 0, progress: 0, reducedMotion: true, viewport: { width: 390, height: 844, dpr: 1 } });
  renderPass(snapshot(base));
  await until(() => ui.inspect().status === 'CURRENT');
  const section = root.querySelector('.loom-instrument-state'), inspection = root.querySelector('.loom-instrument-state-inspection');
  session.append(inspection);
  assert.equal(root.dataset.activeRelation, 'gathering');
  delay = true;
  renderPass(snapshot({ ...base, binding_verified: true, phase: 'checking' }));
  assert.equal(ui.inspect().status, 'COMPILING');
  assert.equal(ui.inspect().view, null);
  assert.equal(section.hidden, false, 'compilation must not use display:none and collapse the field');
  assert.equal(section.style.visibility, 'hidden', 'prior pixels stay concealed while their layout is retained');
  assert.equal(section.style.opacity, '0', 'explicitly visible SVG descendants cannot escape ancestor compositing');
  assert.equal(section.getAttribute('aria-hidden'), 'true');
  assert.ok(section.hasAttribute('inert'));
  assert.equal(root.dataset.activeRelation, undefined);
  assert.equal(doc.documentElement.dataset.loomRelation, undefined);
  assert.match(inspection.querySelector('summary').textContent, /Prior observation.*updating/);
  const status = root.querySelector('.ai-runtime-state-status');
  assert.equal(status.hidden, false);
  assert.equal(status.style.position, 'absolute', 'status must not insert a new flow-height contribution');
  assert.equal(status.style.pointerEvents, 'none');
  release();
  await until(() => ui.inspect().status === 'CURRENT');
  assert.equal(section.style.visibility, '');
  assert.equal(section.style.opacity, '');
  assert.equal(section.hasAttribute('aria-hidden'), false);
  assert.equal(section.hasAttribute('inert'), false);
  assert.equal(root.dataset.activeRelation, 'created_potential');
  assert.equal(status.hidden, true);
});
