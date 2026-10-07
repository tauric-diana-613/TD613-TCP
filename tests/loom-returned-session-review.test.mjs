import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { JSDOM } from 'jsdom';
import { createLoomAiGovernance } from '../app/dome-world/holonomy-loom/ai-handoff.js';
import {
  createLoomDemoActivation, bindLoomDemoRequest, exportLoomDemoCurrent, inspectLoomDemoExport,
  loomDemoDigest, loomDemoReceiptDigest, LOOM_DEMO_REQUEST_SCHEMA, LOOM_DEMO_STAGE_RECEIPT_SCHEMA
} from '../app/dome-world/holonomy-loom/demo-contract.js';
import { mountReturnedSessionReview, LOOM_RETURN_REVIEW_STORAGE_KEY, LOOM_RETURN_MESSAGE_SCHEMA } from '../app/dome-world/holonomy-loom/returned-session-review.js';
const environment = { crypto: webcrypto };
const copy = value => JSON.parse(JSON.stringify(value));

async function fixture() {
  const origin = { task: 'Compare the fictional workstreams.', documents: [{ id: 'a', name: 'workstreams.md', text: 'State A has three workstreams.' }], rules: ['Use only selected sources.'] };
  origin.governance = await createLoomAiGovernance(origin, { withheldDocumentCount: 1 }, environment);
  const result = (id, answer, activation = false) => ({ schema: 'td613.loom.ai-task-result/v0.1', request_id: id, status: 'completed', answer,
    missing_information: activation ? [] : ['Independent effect remains unobserved.'], used_document_ids: activation ? [] : ['a'], suggested_next_step: 'Review the returned work.' });
  origin.continuation = { prior_result: result('origin', 'State A has three workstreams.') };
  const activation = await createLoomDemoActivation(origin, environment), stages = [];
  let previous = null, latest = origin.continuation.prior_result, binder = null, afterB = null;
  for (let index = 0; index < 3; index++) {
    const phase = index ? 'CONTINUE' : 'ACTIVATE';
    const request = { schema: LOOM_DEMO_REQUEST_SCHEMA, request_id: `request-${index}`, phase, activation, documents: index ? origin.documents : [],
      operator_request: index ? 'Continue from the latest work.' : 'Receive the handoff.', prior_result: index ? latest : null, predecessor: previous };
    const bound = await bindLoomDemoRequest(request, environment);
    const answer = result(request.request_id, index === 0 ? 'Rules received; selected files are pending.' : index === 1 ? 'State B has four workstreams.' : 'State C has five workstreams.', !index);
    assert.equal(bound.admit(answer).allowed, true);
    const receipt = { schema: LOOM_DEMO_STAGE_RECEIPT_SCHEMA, activation_digest: activation.activation_digest, phase, request_id: request.request_id,
      request_digest: await loomDemoDigest(request, environment), current_input_digest: bound.governance.input_digest,
      prior_result_digest: bound.receipt.prior_result_digest, result_digest: await loomDemoDigest(answer, environment),
      predecessor_receipt_digest: previous ? await loomDemoReceiptDigest(previous, environment) : null, expires_at: activation.expires_at,
      admission_state: 'ADMITTED', stage_policy: index ? 'SELECTED_FILES_BOUND' : 'AIA_ONLY', authority_transferred: false,
      // Synthetic declarations deliberately provide no signature-authenticity evidence.
      auth: { scheme: 'hmac-sha256', key_id: 'td613-loom-demo-stage-v1', tag: 'A'.repeat(43) } };
    stages.push({ receipt, binding: copy(bound.receipt), result: copy(answer), receiver: 'MARROWLINE', observed_at: new Date().toISOString(),
      predecessor_request_id: previous?.request_id ?? null, content_predecessor_request_id: index ? latest.request_id : null });
    previous = receipt; if (index) latest = answer;
    binder?.governor.close(); binder = bound;
    if (index === 1) afterB = exportLoomDemoCurrent(bound, undefined, { origin, activation, stages });
  }
  const packet = exportLoomDemoCurrent(binder, undefined, { origin, activation, stages });
  binder.governor.close();
  return { origin, packet, afterB };
}
function harness({ origin = null, child = null, saved = null, protectedTerms = [], onReview = () => {} } = {}) {
  const dom = new JSDOM('<div id="review"></div>', { url: 'https://td613.com/dome-world/holonomy-loom.html' }), root = dom.window;
  Object.defineProperty(root, 'crypto', { value: webcrypto });
  if (saved) root.sessionStorage.setItem(LOOM_RETURN_REVIEW_STORAGE_KEY, JSON.stringify(saved));
  let activeOrigin = origin, activeChild = child, activeProtectedTerms = protectedTerms;
  const controller = mountReturnedSessionReview(root.document.querySelector('#review'), { environment: root, getOrigin: () => activeOrigin, getChild: () => activeChild, getProtectedTerms: () => activeProtectedTerms, onReview });
  return { dom, root, controller, setOrigin(value) { activeOrigin = value; }, setChild(value) { activeChild = value; }, setProtectedTerms(value) { activeProtectedTerms = value; }, close() { controller.dispose(); dom.window.close(); } };
}

test('new public exports retain setup, B and C bodies and missingness; changing intermediate B is held', async () => {
  const f = await fixture();
  assert.equal(f.packet.loom_demo_provenance.schema, 'td613.loom.demo-export-provenance/v0.2');
  assert.equal(f.packet.loom_demo_provenance.stages[1].result.answer, 'State B has four workstreams.');
  assert.equal(f.packet.loom_demo_provenance.stages[2].result.answer, 'State C has five workstreams.');
  const review = await inspectLoomDemoExport(f.packet, environment);
  assert.equal(review.content_history_retained, true); assert.equal(review.substantive_continuation_count, 2);
  assert.equal(review.receipt_signatures_verified, false); assert.equal(review.restore_authority, false);
  const altered = copy(f.packet); altered.loom_demo_provenance.stages[1].result.answer = 'A different B body.';
  assert.equal((await inspectLoomDemoExport(altered, environment)).reason, 'LOOM_DEMO_EXPORT_STAGE_RESULT_CHANGED');
  const missing = copy(f.packet); delete missing.loom_demo_provenance.stages[1].result;
  assert.equal((await inspectLoomDemoExport(missing, environment)).status, 'HELD');
  assert.equal(JSON.stringify(f.packet).includes('local_ground_truth'), false);
  assert.equal(JSON.stringify(f.packet).includes('PRIVATE_SENTINEL'), false);
});

test('legacy receipt-only exports remain readable with explicitly missing intermediate bodies', async () => {
  const f = await fixture(), legacy = copy(f.packet);
  legacy.loom_demo_provenance.schema = 'td613.loom.demo-export-provenance/v0.1';
  legacy.loom_demo_provenance.stages.forEach(stage => delete stage.result);
  const review = await inspectLoomDemoExport(legacy, environment);
  assert.equal(review.status, 'REVIEW_ONLY_CONSISTENCY');
  assert.equal(review.content_history_retained, false);
  assert.match(review.content_history_scope, /INTERMEDIATE_CONTENT_UNOBSERVED/);
  const falseBodies = copy(legacy); falseBodies.loom_demo_provenance.stages[1].result = f.packet.loom_demo_provenance.stages[1].result;
  assert.equal((await inspectLoomDemoExport(falseBodies, environment)).status, 'HELD');
});

test('return inspection binds current origin and exact child while preserving HELD signature and admission coordinates', async () => {
  const f = await fixture(), child = {}, h = harness({ origin: f.origin, child });
  try {
    const unknown = await h.controller.receive(f.packet, { source: 'OPENER_RETURN', sourceWindow: {} });
    assert.equal(unknown.reason, 'LOOM_RETURN_UNRECOGNIZED_WINDOW'); assert.equal(h.controller.inspect(), null);
    const accepted = await h.controller.receive(f.packet, { source: 'OPENER_RETURN', sourceWindow: child });
    assert.equal(accepted.origin_match, 'ORIGIN_SELECTED_INPUTS_MATCH'); assert.equal(accepted.restore_authority, false);
    assert.equal(accepted.receipt_signatures_verified, false); assert.equal(accepted.persisted_for_reload, true);
    assert.match(h.root.document.querySelector('[data-return-review=boundary]').textContent, /local custody admission remains HELD/);
    assert.equal(h.root.document.querySelectorAll('[data-return-review=history] article').length, 4);
    assert.match(h.root.document.querySelector('[data-return-review=lineage]').textContent, /2 substantive continuations/);
    const earlier = await h.controller.receive(f.afterB); assert.equal(earlier.reason, 'LOOM_RETURN_EARLIER_SNAPSHOT');
    assert.equal(h.controller.inspect().inspection.latest_request_id, 'request-2');
    const changed = copy(f.origin); changed.task = 'Another task.'; h.setOrigin(changed);
    assert.equal((await h.controller.receive(f.packet)).reason, 'LOOM_RETURN_ORIGIN_CHANGED');
    assert.equal(h.controller.inspect().inspection.latest_request_id, 'request-2');
  } finally { h.close(); }
});

test('live bound return must match the exact latest reviewed Marrowline result bytes', async () => {
  const f = await fixture(), child = {}, seen = [], h = harness({ origin: f.origin, child, onReview: (review, bound) => seen.push({ review, bound }) });
  try {
    const latest = f.afterB.loom_demo_provenance.stages.filter(stage => stage.receipt.phase === 'CONTINUE').at(-1).result;
    const bound = {
      schema: 'td613.loom.bound-receiver-turn/v0.2',
      answer: latest.answer,
      missing_information: latest.missing_information,
      used_document_ids: latest.used_document_ids
    };
    const accepted = await h.controller.receive(f.afterB, { source: 'OPENER_RETURN', sourceWindow: child, boundReturn: bound });
    assert.equal(accepted.status, 'REVIEW_ONLY_CONSISTENCY');
    assert.equal(seen.length, 1); assert.deepEqual(seen[0].bound, bound);
    const changed = copy(bound); changed.answer = 'Different staged answer.';
    const held = await h.controller.receive(f.afterB, { source: 'OPENER_RETURN', sourceWindow: child, boundReturn: changed });
    assert.equal(held.reason, 'LOOM_RETURN_BOUND_TURN_RESULT_MISMATCH');
    assert.equal(seen.length, 1);
  } finally { h.close(); }
});

test('reload recovers only review data; independent file reentry remains inspectable without the live origin', async () => {
  const f = await fixture(), h = harness({ saved: f.packet });
  try {
    const restored = await h.controller.ready;
    assert.equal(restored.status, 'REVIEW_ONLY_CONSISTENCY'); assert.equal(restored.origin_match, 'UNOBSERVED');
    assert.equal(restored.live_custody_capability, false); assert.equal(restored.restore_authority, false);
    const record = h.controller.inspect(); assert.equal(record.inspection.latest_request_id, 'request-2');
    assert.match(h.root.document.querySelector('[data-return-review=boundary]').textContent, /original local record is unavailable/);
    h.controller.clear(); assert.equal(h.root.sessionStorage.getItem(LOOM_RETURN_REVIEW_STORAGE_KEY), null);
    assert.equal((await h.controller.receive(JSON.stringify(f.packet))).status, 'REVIEW_ONLY_CONSISTENCY');
  } finally { h.close(); }
});

test('message boundary ignores cross-origin and unknown windows; malformed records and accessors preserve prior review', async () => {
  const f = await fixture(), child = {}, h = harness({ origin: f.origin, child });
  try {
    await h.controller.receive(f.packet);
    const send = (origin, source, data) => h.root.dispatchEvent(new h.root.MessageEvent('message', { origin, source, data }));
    send('https://foreign.example', child, { schema: LOOM_RETURN_MESSAGE_SCHEMA, packet: f.afterB });
    send(h.root.location.origin, {}, { schema: LOOM_RETURN_MESSAGE_SCHEMA, packet: f.afterB });
    assert.equal(h.controller.inspect().inspection.latest_request_id, 'request-2');
    let getterCalls = 0; const malicious = { get schema() { getterCalls++; return LOOM_RETURN_MESSAGE_SCHEMA; }, packet: f.packet };
    send(h.root.location.origin, child, malicious); assert.equal(getterCalls, 0);
    assert.equal(h.controller.inspect().inspection.latest_request_id, 'request-2');
    assert.equal((await h.controller.receive('x'.repeat(2000001))).reason, 'LOOM_RETURN_RECORD_TOO_LARGE');
    const mutable = copy(f.packet), pending = h.controller.receive(mutable); mutable.loom_demo_provenance.stages[1].result.answer = 'Changed after snapshot.';
    assert.equal((await pending).status, 'REVIEW_ONLY_CONSISTENCY');
    h.setOrigin(null);
    assert.equal((await h.controller.receive(f.packet, { source: 'OPENER_RETURN', sourceWindow: child })).reason, 'LOOM_RETURN_NO_ACTIVE_ORIGIN');
  } finally { h.close(); }
});


test('validated message delivery announces review only; async origin/child drift cannot install a return', async () => {
  const f = await fixture(), child = {}, notifications = [], h = harness({ origin: f.origin, child, onReview: value => notifications.push(value) });
  try {
    h.root.dispatchEvent(new h.root.MessageEvent('message', { origin: h.root.location.origin, source: child,
      data: { schema: LOOM_RETURN_MESSAGE_SCHEMA, packet: f.packet } }));
    for (let tries = 0; !notifications.length && tries < 100; tries++) await new Promise(resolve => setTimeout(resolve, 5));
    assert.equal(notifications.length, 1);
    assert.equal(notifications[0].source, 'OPENER_RETURN'); assert.equal(notifications[0].status, 'REVIEW_ONLY_CONSISTENCY');
    assert.equal(notifications[0].receipt_signatures_verified, false); assert.equal(notifications[0].restore_authority, false);
    h.controller.clear();
    const childDrift = h.controller.receive(f.packet, { source: 'OPENER_RETURN', sourceWindow: child }); h.setChild({});
    assert.equal((await childDrift).reason, 'LOOM_RETURN_CHANGED_DURING_REVIEW'); assert.equal(h.controller.inspect(), null);
    h.setChild(child);
    const originDrift = h.controller.receive(f.packet, { source: 'OPENER_RETURN', sourceWindow: child });
    const nextOrigin = copy(f.origin); nextOrigin.task = 'A new route.'; h.setOrigin(nextOrigin);
    assert.equal((await originDrift).reason, 'LOOM_RETURN_CHANGED_DURING_REVIEW'); assert.equal(h.controller.inspect(), null);
    assert.equal(notifications.length, 1);
  } finally { h.close(); }
});


test('current local protected checks hold matching latest or retained earlier answers without installing or saving the candidate', async () => {
  const f = await fixture(), h = harness({ origin: f.origin });
  try {
    const noTerms = await h.controller.receive(f.afterB);
    assert.equal(noTerms.local_protected_check.state, 'NO_DECLARED_LOCAL_TERMS');
    assert.equal(noTerms.local_protected_check.screened_result_count, 0);
    const savedB = h.root.sessionStorage.getItem(LOOM_RETURN_REVIEW_STORAGE_KEY);
    h.setProtectedTerms(['State C']);
    const latestMatch = await h.controller.receive(f.packet);
    assert.equal(latestMatch.reason, 'LOOM_RETURN_PROTECTED_RESULT_MATCH');
    assert.equal(latestMatch.local_protected_check.state, 'HELD_EXACT_LITERAL_MATCH');
    assert.equal(h.controller.inspect().inspection.latest_request_id, 'request-1');
    assert.equal(h.root.sessionStorage.getItem(LOOM_RETURN_REVIEW_STORAGE_KEY), savedB);
    h.setProtectedTerms(['State B']);
    assert.equal((await h.controller.receive(f.packet)).reason, 'LOOM_RETURN_PROTECTED_RESULT_MATCH');
    assert.equal(h.controller.inspect().inspection.latest_request_id, 'request-1');
    assert.doesNotMatch(h.root.document.querySelector('[data-return-review=status]').textContent, /State C|State B/);
    h.setProtectedTerms(['state c']);
    const caseSensitive = await h.controller.receive(f.packet);
    assert.equal(caseSensitive.local_protected_check.state, 'EXACT_LITERAL_CHECK_CLEAR');
    assert.equal(caseSensitive.local_protected_check.universal_secrecy_established, false);
  } finally { h.close(); }
});

test('private terms remain exclusively local and private-policy drift withdraws an async check', async () => {
  const f = await fixture(), terms = ['PRIVATE_SENTINEL_TERMS_LOCAL_ONLY'], notifications = [], h = harness({ origin: f.origin, protectedTerms: terms, onReview: outcome => notifications.push(outcome) });
  try {
    const accepted = await h.controller.receive(f.packet);
    assert.equal(accepted.local_protected_check.term_count, 1);
    assert.equal(accepted.local_protected_check.screened_result_count, 4);
    for (const serialized of [JSON.stringify(h.controller.inspect()), h.root.sessionStorage.getItem(LOOM_RETURN_REVIEW_STORAGE_KEY), JSON.stringify(notifications), h.root.document.querySelector('#review').textContent]) {
      assert.equal(serialized.includes(terms[0]), false);
    }
    h.controller.clear();
    const pending = h.controller.receive(f.packet); h.setProtectedTerms(['State C']);
    const held = await pending;
    assert.equal(held.reason, 'LOOM_RETURN_PRIVATE_POLICY_CHANGED_DURING_REVIEW');
    assert.equal(held.local_protected_check.state, 'HELD_LOCAL_PRIVATE_POLICY_CHANGED');
    assert.equal(h.controller.inspect(), null); assert.equal(h.root.sessionStorage.getItem(LOOM_RETURN_REVIEW_STORAGE_KEY), null);
    assert.equal(notifications.length, 1);
    h.setProtectedTerms(Array(1));
    assert.equal((await h.controller.receive(f.packet)).status, 'HELD');
    assert.equal(h.controller.inspect(), null);
  } finally { h.close(); }
});
