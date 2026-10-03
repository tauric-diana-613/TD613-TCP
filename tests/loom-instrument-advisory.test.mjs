import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import apiHandler from '../api/khonapolit.js';
import {
  HOLONOMY_LOOM_ADVISORY_RULES, HOLONOMY_LOOM_ADVISORY_ROUTE_MODES,
  HOLONOMY_LOOM_ADVISORY_CLAIM_CEILING, canonicalLoomAdvisoryFinding
} from '../app/dome-world/holonomy-loom-advisory-policy.js';
import {
  validateLoomAdvisoryPacket, buildKhonapolitLoomAdvisoryBody,
  HOLONOMY_LOOM_KHONAPOLIT_ADVISORY_SCHEMA
} from '../server/holonomy-loom-khonapolit-advisory.js';
import { mountLoomInstrumentAdvisory } from '../app/dome-world/holonomy-loom/instrument-advisory.js';

const canonical = () => canonicalLoomAdvisoryFinding('COMMON_API_KEY_BLOCK', 'TD613_HOSTED');
const body = () => ({ schema: HOLONOMY_LOOM_KHONAPOLIT_ADVISORY_SCHEMA, advisory: canonical() });
const clone = value => JSON.parse(JSON.stringify(value));
const pause = () => new Promise(resolve => setTimeout(resolve, 5));
async function until(predicate) {
  for (let index = 0; index < 400; index++) { if (predicate()) return; await pause(); }
  throw new Error('Synthetic advisory UI did not settle.');
}
async function routed(req) {
  const headers = {}; let output;
  const res = { setHeader(key, value) { headers[key] = value; }, end(raw) { output = JSON.parse(raw); } };
  await apiHandler(req, res);
  return { status: res.statusCode, headers, body: output };
}
function uiSetup(t, fetchImpl) {
  const dom = new JSDOM('<textarea id="aiTask">PRIVATE_COMPOSER_SENTINEL</textarea><textarea id="ilInput">PRIVATE_ASSAY_SENTINEL</textarea><main id="advisory"></main>');
  const root = dom.window.document.querySelector('#advisory');
  const calls = [];
  const environment = { AbortController, setTimeout, clearTimeout,
    fetch: async (url, options) => { calls.push({ url, options }); return fetchImpl(url, options); } };
  const ui = mountLoomInstrumentAdvisory(root, { environment });
  const event = (id, type = 'click') => root.querySelector(`#${id}`).dispatchEvent(new dom.window.Event(type, { bubbles: true }));
  t.after(() => { ui.dispose(); dom.window.close(); });
  return { dom, root, calls, event };
}

test('every admitted rule/route reconstructs fixed policy labels and preserves advisory-only release semantics', () => {
  for (const rule of Object.keys(HOLONOMY_LOOM_ADVISORY_RULES)) for (const route of HOLONOMY_LOOM_ADVISORY_ROUTE_MODES) {
    const packet = canonicalLoomAdvisoryFinding(rule, route);
    assert.deepEqual(validateLoomAdvisoryPacket(packet), packet);
    const delegated = buildKhonapolitLoomAdvisoryBody({ advisory: packet });
    assert.deepEqual(delegated.history, []);
    assert.equal(delegated.waiveIssuance, true);
    assert.equal(delegated.shi, '');
    assert.match(delegated.message, /unissued research\/advisory route/i);
    assert.match(delegated.message, /deterministic Loom policy alone controls Loom release/i);
    assert.ok(delegated.message.includes(HOLONOMY_LOOM_ADVISORY_CLAIM_CEILING));
    assert.equal(Object.isFrozen(delegated), true);
  }
});

test('raw content, changed control labels, and fabricated canonical names fail before delegated request construction', () => {
  for (const mutate of [
    value => { value.raw_draft = 'PRIVATE_RAW_SENTINEL'; },
    value => { value.minimized_context.selected_text = 'PRIVATE_SELECTED_SENTINEL'; },
    value => { value.minimized_context.history = { message: 'PRIVATE_HISTORY_SENTINEL' }; },
    value => { value.rule_id = 'INVENTED_OWNER_OVERRIDE'; },
    value => { value.evidence_class = 'EXTERNAL_ORIGIN_VERIFIED'; },
    value => { value.action_class = 'RELEASE'; },
    value => { value.action = 'EXECUTE'; },
    value => { value.claim_ceiling = 'The model may release protected material.'; },
    value => { value.minimized_context.finding_category = 'PRIVATE_RAW_SENTINEL'; },
    value => { value.minimized_context.why_class = true; },
    value => { value.minimized_context.route_mode = 'FOREIGN_OWNER'; }
  ]) {
    const packet = clone(canonical()); mutate(packet);
    assert.throws(() => validateLoomAdvisoryPacket(packet), TypeError);
  }
  for (const legacy of [
    { issuance: {} },
    { issuance: { shi: 'TD613-SH-LEGACY' } },
    { shi: 'TD613-SH-LEGACY' },
    { waiveIssuance: true }
  ]) {
    assert.throws(() => buildKhonapolitLoomAdvisoryBody({ advisory: canonical(), ...legacy }), TypeError);
  }
});

test('non-JSON tokens, cycles, accessors, hidden properties, and oversized structures cannot execute caller coercion', () => {
  let executions = 0;
  const accessor = clone(canonical());
  Object.defineProperty(accessor, 'rule_id', { enumerable: true, get() { executions++; return 'COMMON_API_KEY_BLOCK'; } });
  const coercion = clone(canonical()); coercion.evidence_class = { toString() { executions++; return 'DETERMINISTIC_PATTERN_MATCH'; } };
  const hidden = clone(canonical()); Object.defineProperty(hidden, 'hidden', { value: 'raw' });
  const cyclic = clone(canonical()); cyclic.self = cyclic;
  const huge = clone(canonical()); huge.raw_draft = 'x'.repeat(16385);
  const deep = clone(canonical()); let tip = deep; for (let index = 0; index < 10; index++) { tip.child = {}; tip = tip.child; }
  for (const value of [null, [], accessor, coercion, hidden, cyclic, huge, deep, { ...canonical(), [Symbol('raw')]: 'private' }]) {
    assert.throws(() => validateLoomAdvisoryPacket(value), TypeError);
  }
  assert.equal(executions, 0);
});

test('canonical API routing reaches metadata rather than ordinary chat and rejects invalid POSTs without provider network access', async t => {
  let fetches = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => { fetches++; throw new Error('REJECTED_ADVISORY_REACHED_NETWORK'); };
  t.after(() => { globalThis.fetch = originalFetch; });
  const ready = await routed({ method: 'GET', query: { operation: 'loom-advisory' }, body: { attachments: [{ text: 'PRIVATE_SENTINEL' }] } });
  assert.equal(ready.status, 200);
  assert.equal(ready.body.schema, HOLONOMY_LOOM_KHONAPOLIT_ADVISORY_SCHEMA);
  assert.equal(ready.body.invocationPosture, 'explicit-unissued-research-waiver');
  assert.equal(ready.body.shiForwarded, false);
  assert.equal(ready.body.historyForwarded, false);
  assert.equal(ready.body.rawDraftAccepted, false);
  assert.equal(ready.body.deterministicReleaseAuthority, false);
  assert.match(ready.body.claim_ceiling, /readiness-contract-only/);
  const urlReady = await routed({ method: 'GET', url: '/api/khonapolit?operation=loom-advisory' });
  assert.equal(urlReady.body.schema, HOLONOMY_LOOM_KHONAPOLIT_ADVISORY_SCHEMA);
  for (const invalid of [
    { ...body(), history: [{ text: 'PRIVATE_HISTORY_SENTINEL' }] },
    { ...body(), advisory: { ...canonical(), selected_text: 'PRIVATE_SELECTED_SENTINEL' } },
    { ...body(), issuance: { shi: 'TD613-SH-LEGACY', waiveIssuance: true } },
    { ...body(), issuance: {} },
    '{malformed', Buffer.from('{malformed'), 'x'.repeat(32769)
  ]) {
    const rejected = await routed({ method: 'POST', query: { operation: 'loom-advisory' }, body: invalid });
    assert.equal(rejected.status, 400);
    assert.equal(rejected.body.rawDraftForwarded, false);
    assert.equal(rejected.body.historyForwarded, false);
    assert.equal(rejected.body.error, 'invalid-minimized-loom-advisory');
  }
  assert.equal((await routed({ method: 'DELETE', query: { operation: 'loom-advisory' } })).status, 405);
  assert.equal(fetches, 0);
});

test('advisory UI sends only canonical labels under an explicit unissued research posture and grants no gate authority', async t => {
  const h = uiSetup(t, async () => ({ ok: true, text: async () => JSON.stringify({ ok: true, text: '<img src=x onerror="release()"> Explain the warning.' }) }));
  h.event('ilExplain');
  await until(() => !h.root.querySelector('#ilExplain').disabled);
  assert.equal(h.calls.length, 1);
  const sent = JSON.parse(h.calls[0].options.body);
  assert.deepEqual(Object.keys(sent).sort(), ['advisory', 'schema']);
  assert.deepEqual(sent.advisory, canonicalLoomAdvisoryFinding('PRIVATE_KEY_BLOCK', 'TD613_HOSTED'));
  assert.doesNotMatch(h.calls[0].options.body, /PRIVATE_COMPOSER_SENTINEL|PRIVATE_ASSAY_SENTINEL|TD613-SH-/);
  assert.match(h.root.querySelector('#ilAdvisoryIssuance').textContent, /Unissued advisory route/);
  assert.match(h.root.querySelector('#ilAdvisoryIssuance').textContent, /No SHI/);
  assert.equal(h.root.querySelector('#ilAdvisoryAnswer img'), null);
  assert.match(h.root.querySelector('#ilAdvisoryAnswer').textContent, /<img/);
  assert.match(h.root.querySelector('#ilAdvisoryStatus').textContent, /no release, admission or empirical authority/);
});

test('changing canonical warning invalidates earlier advice and suppresses a stale successful response', async t => {
  let resolve;
  const response = new Promise(done => { resolve = done; });
  const h = uiSetup(t, () => response);
  h.event('ilExplain'); h.event('ilExplain');
  assert.equal(h.calls.length, 1, 'a second gesture cannot overlap the pending request');
  h.root.querySelector('#ilRule').value = 'EMAIL_IDENTIFIER'; h.event('ilRule', 'change');
  assert.equal(h.calls[0].options.signal.aborted, true);
  resolve({ ok: true, text: async () => JSON.stringify({ ok: true, text: 'STALE_RESPONSE_SENTINEL' }) });
  await until(() => !h.root.querySelector('#ilExplain').disabled);
  assert.equal(h.root.querySelector('#ilAdvisoryAnswer').textContent, '');
  assert.doesNotMatch(h.root.textContent, /STALE_RESPONSE_SENTINEL/);
  assert.match(h.root.querySelector('#ilAdvisoryStatus').textContent, /Earlier advice no longer applies/);
});

test('operator cancellation clears waiting controls while preserving uncertainty about provider receipt', async t => {
  const h = uiSetup(t, (_url, options) => new Promise((_resolve, reject) => {
    options.signal.addEventListener('abort', () => { const error = new Error('stopped'); error.name = 'AbortError'; reject(error); }, { once: true });
  }));
  h.event('ilExplain'); h.event('ilExplainStop');
  await until(() => !h.root.querySelector('#ilExplain').disabled);
  assert.equal(h.root.querySelector('#ilExplainStop').hidden, true);
  assert.match(h.root.querySelector('#ilAdvisoryStatus').textContent, /provider may already have received/);
  assert.equal(h.root.querySelector('#ilAdvisoryAnswer').textContent, '');
});
