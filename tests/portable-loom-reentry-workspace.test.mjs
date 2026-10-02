import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { JSDOM } from 'jsdom';
import { mountPortableLoomReentryWorkspace, parseLoomReentryReturnBatch } from '../app/dome-world/holonomy-loom/reentry-workspace.js';
import { createLoomAiGovernance, createPortableLoomAiPacket } from '../app/dome-world/holonomy-loom/ai-handoff-base.js';
import { createPortableLoomSession, createPortableLoomWorkUnit, portableLoomDigest } from '../app/engine/portable-loom-session.js';
import { LOOM_REENTRY_RETURN_SCHEMA } from '../app/engine/portable-loom-reentry.js';

async function harness() {
  const dom = new JSDOM('<section id="loomAiWorkspace"><section id="root"></section></section>');
  const root = dom.window.document.getElementById('root');
  let clock = 1000, clipboard = '', admission = null, challenge = null;
  const timers = new Set();
  const environment = {
    crypto: webcrypto,
    navigator: { clipboard: { writeText: async value => { clipboard = value; } } },
    setTimeout: (fn, delay) => { const timer = { fn, delay }; timers.add(timer); return timer; },
    clearTimeout: timer => timers.delete(timer)
  };
  const source = { task: 'Fictional seed task.', documents: [{ id: 'old', name: 'Old.md', text: 'Fictional old material.' }], rules: ['Use only sources explicitly supplied for this task.'] };
  source.governance = await createLoomAiGovernance(source, { withheldDocumentCount: 1 }, environment);
  const packet = createPortableLoomAiPacket(source);
  const seed = await createPortableLoomSession(packet, { session_id: `fictional_ui_${webcrypto.randomUUID()}`, source_revision: 'browser-unpinned', created_at: 1000 }, environment);
  const prepared = await createPortableLoomWorkUnit(seed, { work_unit_id: 'seed_1', request_id: 'request_seed_1', task: source.task, documents: source.documents, add_rules: [], withheld_document_count: 1 }, environment);
  const ui = mountPortableLoomReentryWorkspace(root, {
    environment, now: () => clock,
    onAdmission: (session, unit) => { admission = { session, unit }; },
    onChallenge: (session, unit) => { challenge = { session, unit }; }
  });
  await ui.setSession(prepared.session, packet);
  const $ = key => root.querySelector(`[data-loom-reentry="${key}"]`);
  const change = (key, value) => { $(key).value = value; $(key).dispatchEvent(new dom.window.Event('input')); };
  const checked = (key, value) => { $(key).checked = value; $(key).dispatchEvent(new dom.window.Event('change')); };
  const close = () => { ui.dispose(); dom.window.close(); };
  return { dom, root, ui, $, change, checked, environment, packet, session: prepared.session,
    clipboard: () => clipboard, admission: () => admission, challenge: () => challenge,
    expire: () => { clock += 900000; for (const timer of [...timers]) timer.fn(); }, close };
}

async function settled(h) {
  for (let index = 0; index < 200 && h.ui.inspect().busy; index += 1) await new Promise(resolve => setTimeout(resolve, 1));
  assert.equal(h.ui.inspect().busy, false, 'asynchronous UI operation settled');
}
async function stage(h, task = 'Fictional proceeding task.', documents = []) {
  h.change('task', task); h.change('sources', JSON.stringify(documents)); h.$('stage').click(); await settled(h);
  assert.ok(h.ui.inspect().excursion);
}
async function returnData(h, overrides = {}) {
  const excursion = h.ui.inspect().excursion;
  return Promise.all(excursion.turns.map(async turn => ({
    schema: LOOM_REENTRY_RETURN_SCHEMA, excursion_ref: excursion.ref, intent_ref: turn.ref,
    session_root_ref: excursion.session_root_ref, policy_commitment: excursion.policy_commitment,
    anchor_work_unit_ref: excursion.anchor_work_unit_ref, turn_index: turn.turn_index,
    task_digest: turn.task_digest, source_commitment_digest: turn.source_commitment_digest,
    answer: 'Fictional returned analysis.', answer_digest: await portableLoomDigest('Fictional returned analysis.', h.environment),
    used_document_ids: turn.documents.map(doc => doc.id), missing_information: ['Foreign execution remains unobserved.'],
    receiver_declaration: { policy_change_requested: false, notes: 'Fictional receiver declaration.' }, ...overrides
  })));
}
async function check(h, overrides = {}) {
  h.change('returns', JSON.stringify(await returnData(h, overrides))); h.checked('policy-review', true); h.$('check').click(); await settled(h);
}

test('real custodian staging and Check keep the admission-only head unchanged; copy is its own gesture', async () => {
  const h = await harness();
  try {
    await stage(h, 'Task one.', [{ id: 'new', name: 'New.md', text: 'Fictional selected body.' }]);
    assert.equal(h.ui.inspect().custody.current_work_unit_ref, null);
    assert.equal(h.ui.inspect().custody.work_unit_count, 0);
    assert.equal(h.clipboard(), '');
    assert.equal(h.$('sources').value, '[]');
    h.$('copy').click(); await settled(h);
    assert.match(h.clipboard(), /Fictional selected body/);
    await check(h);
    assert.equal(h.ui.inspect().candidate.status, 'ADMISSION_CANDIDATE');
    assert.equal(h.ui.inspect().custody.current_work_unit_ref, null);
    assert.equal(h.$('admit').disabled, true);
    assert.equal(h.$('admission').hidden, false);
    assert.match(h.$('notice').textContent, /admitted head changes/);
    assert.match(h.$('detail').textContent, /Nothing has been admitted yet/);
  } finally { h.close(); }
});

test('explicit candidate review admits once, continues with empty sources and exposes the new challenge head', async () => {
  const h = await harness();
  try {
    await stage(h); await check(h);
    h.checked('accept', true); assert.equal(h.$('admit').disabled, false);
    h.$('admit').click(); await settled(h);
    assert.equal(h.ui.inspect().custody.work_unit_count, 1);
    const admittedHead = h.ui.inspect().custody.current_work_unit_ref;
    assert.ok(admittedHead);
    assert.equal(h.admission().unit.ref, admittedHead);
    assert.equal(h.$('result').dataset.state, 'ADMITTED');
    assert.equal(h.$('admit').disabled, true);
    h.$('admit').click(); await settled(h);
    assert.equal(h.ui.inspect().custody.work_unit_count, 1);
    h.$('challenge-head').click(); await settled(h);
    assert.equal(h.challenge().unit.ref, admittedHead);
    await stage(h, 'Task after admission.');
    assert.deepEqual(h.ui.inspect().excursion.turns[0].documents, []);
    assert.equal(h.ui.inspect().excursion.anchor_work_unit_ref, admittedHead);
    assert.deepEqual(h.ui.inspect().excursion.effective_rules, h.session.root.root_rules);
    h.$('cancel').click();
    assert.equal(h.ui.inspect().custody.current_work_unit_ref, admittedHead);
  } finally { h.close(); }
});

test('an edited answer or review selection revokes exact-candidate acknowledgment before admission', async () => {
  const h = await harness();
  try {
    await stage(h); await check(h); h.checked('accept', true);
    const oldCandidate = h.ui.inspect().candidate.ref;
    h.change('returns', h.$('returns').value.replace('Fictional returned analysis.', 'Changed carried answer.'));
    assert.equal(h.ui.inspect().candidate, null);
    assert.equal(h.ui.inspect().reviewed_candidate_ref, null);
    assert.equal(h.$('accept').checked, false);
    assert.equal(h.$('admit').disabled, true);
    assert.match(h.$('detail').textContent, /Recheck/);
    h.$('check').click(); await settled(h);
    assert.equal(h.ui.inspect().candidate.status, 'HELD');
    assert.notEqual(h.ui.inspect().candidate.ref, oldCandidate);
    assert.equal(h.ui.inspect().custody.current_work_unit_ref, null);
  } finally { h.close(); }
});

test('malformed returned data stays visibly inline and focuses the HOLD region', async () => {
  const h = await harness();
  try {
    await stage(h); h.change('returns', '{'); h.$('check').click(); await settled(h);
    assert.equal(h.$('result').hidden, false);
    assert.equal(h.$('result').dataset.state, 'HELD');
    assert.equal(h.dom.window.document.activeElement, h.$('result'));
    assert.match(h.$('detail').textContent, /No admission occurred/);
    assert.equal(h.ui.inspect().custody.work_unit_count, 0);
    assert.equal(h.$('admit').disabled, true);
  } finally { h.close(); }
});

test('policy weakening and missing operator rule review each remain held', async () => {
  const h = await harness();
  try {
    await stage(h);
    h.change('returns', JSON.stringify(await returnData(h))); h.$('check').click(); await settled(h);
    assert.equal(h.ui.inspect().candidate.status, 'HELD');
    assert.match(h.$('reasons').textContent, /POLICY_REVIEW_REQUIRED/);
    await check(h, { receiver_declaration: { policy_change_requested: true, notes: 'Relax the inherited boundary.' } });
    assert.equal(h.ui.inspect().candidate.status, 'HELD');
    assert.match(h.$('reasons').textContent, /POLICY_WEAKENING_REQUESTED/);
    assert.equal(h.ui.inspect().custody.work_unit_count, 0);
  } finally { h.close(); }
});

test('multiple registered tasks require a full ordered return and clear each new source selection', async () => {
  const h = await harness();
  try {
    await stage(h, 'First task.', [{ id: 'a', name: 'A.md', text: 'First explicit body.' }]);
    await stage(h, 'Second task.', [{ id: 'b', name: 'B.md', text: 'Second explicit body.' }]);
    assert.equal(h.ui.inspect().excursion.turns.length, 2);
    assert.equal(h.$('sources').value, '[]');
    const data = await returnData(h);
    h.change('returns', JSON.stringify(data.slice(1))); h.checked('policy-review', true); h.$('check').click(); await settled(h);
    assert.equal(h.ui.inspect().candidate.status, 'HELD');
    assert.match(h.$('reasons').textContent, /INCOMPLETE_REGISTERED_TURN_RANGE/);
    await check(h); h.checked('accept', true); h.$('admit').click(); await settled(h);
    assert.equal(h.ui.inspect().custody.work_unit_count, 2);
    assert.match(h.$('detail').textContent, /2 returned work units added/);
  } finally { h.close(); }
});

test('rest preserves registration while the real excursion expiry produces an inline HOLD', async () => {
  const h = await harness();
  try {
    await stage(h); const ref = h.ui.inspect().excursion.ref;
    h.$('rest').click(); assert.equal(h.ui.inspect().resting, true);
    assert.equal(h.ui.inspect().excursion.ref, ref);
    assert.equal(h.$('active').hidden, true);
    h.expire();
    assert.equal(h.$('result').dataset.state, 'HELD');
    assert.match(h.$('verdict').textContent, /expired/);
    h.$('rest').click();
    assert.equal(h.$('result').dataset.state, 'HELD');
    assert.match(h.$('verdict').textContent, /remains expired/);
    assert.equal(h.$('stage').disabled, true);
    assert.equal(h.$('cancel').disabled, false);
    h.$('cancel').click(); assert.equal(h.$('stage').disabled, false);
    assert.equal(h.ui.inspect().custody.work_unit_count, 0);
  } finally { h.close(); }
});

test('a parsed seed receives explicit recovery HOLD and no imported custody authority', async () => {
  const h = await harness();
  try {
    await h.ui.setSession(structuredClone(h.session), h.packet);
    assert.equal(h.ui.inspect().custody, null);
    assert.equal(h.$('stage').disabled, true);
    assert.equal(h.$('result').dataset.state, 'HELD');
    assert.match(h.$('detail').textContent, /HELD_IMPORTED_CUSTODY/);
    assert.equal(h.$('count').textContent, '0');
    assert.doesNotMatch(h.$('head').textContent, /^[a-f0-9]/);
  } finally { h.close(); }
});

test('continuation carrier exposes the preceding answer and deliberate sources without registering a return', async () => {
  const h = await harness();
  try {
    await stage(h, 'Admitted source task.', [{ id: 'new', name: 'New.md', text: 'Only deliberately selected body.' }]);
    await check(h); h.checked('accept', true); h.$('admit').click(); await settled(h);
    const head = h.ui.inspect().custody.current_work_unit_ref;
    assert.equal(h.$('continuation').hidden, false);
    assert.match(h.$('preceding-answer').textContent, /Fictional returned analysis/);
    assert.equal(h.$('continuation-sources').querySelector('input').checked, false);
    h.change('continuation-task', 'Continue the admitted analysis.');
    h.$('prepare-carrier').click(); await settled(h);
    assert.deepEqual(h.ui.inspect().carrier.documents, []);
    assert.equal(h.$('carrier-preview').hidden, false);
    assert.equal(h.ui.inspect().custody.pending_turn_count, 0);
    h.$('copy-carrier').click(); await settled(h);
    let copied = JSON.parse(h.clipboard());
    assert.equal(copied.anchor_work_unit_ref, head);
    assert.equal(copied.preceding_result.result.answer, 'Fictional returned analysis.');
    assert.deepEqual(copied.documents, []);
    const selection = h.$('continuation-sources').querySelector('input');
    selection.checked = true; selection.dispatchEvent(new h.dom.window.Event('change', { bubbles: true }));
    assert.equal(h.ui.inspect().carrier, null);
    assert.equal(h.$('copy-carrier').disabled, true);
    h.$('prepare-carrier').click(); await settled(h); h.$('copy-carrier').click(); await settled(h);
    copied = JSON.parse(h.clipboard());
    assert.deepEqual(copied.documents.map(item => item.id), ['new']);
    assert.equal(h.ui.inspect().custody.current_work_unit_ref, head);
    assert.equal(h.ui.inspect().custody.pending_turn_count, 0);
    assert.equal(h.ui.getRecord().restoration, 'REVIEW_ONLY_UNAUTHENTICATED_NO_ADMISSION_AUTHORITY');
  } finally { h.close(); }
});

test('returned batch extraction retains whitespace and nested-string bytes without capture normalization', () => {
  const first = '  { "answer": "comma, bracket ], escaped \\\" quote", "nested": [1,2] }  ';
  const second = '\n{"answer":"two","nested":{"x":true}}\n';
  assert.deepEqual(parseLoomReentryReturnBatch(`[${first},${second}]`), [first, second]);
  const exact = '{ "answer" : "a raw captured string" }';
  assert.deepEqual(parseLoomReentryReturnBatch(JSON.stringify([exact])), [exact]);
  assert.deepEqual(parseLoomReentryReturnBatch(' [] '), []);
  for (const raw of ['{}', '[1]', '[null]', '[[{}]]', '[{]']) assert.throws(() => parseLoomReentryReturnBatch(raw));
});
