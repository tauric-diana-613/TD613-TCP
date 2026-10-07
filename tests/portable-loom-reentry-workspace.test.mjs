import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { JSDOM } from 'jsdom';
import { mountPortableLoomReentryWorkspace, parseLoomReentryReturnBatch } from '../app/dome-world/holonomy-loom/reentry-workspace.js';
import { createLoomAiGovernance, createPortableLoomAiPacket } from '../app/dome-world/holonomy-loom/ai-handoff-base.js';
import { createPortableLoomSession, createPortableLoomWorkUnit, portableLoomDigest } from '../app/engine/portable-loom-session.js';
import { LOOM_REENTRY_RETURN_SCHEMA, createPortableLoomReentryCustodian } from '../app/engine/portable-loom-reentry.js';

async function harness({ onCheck = () => {}, createCustodian = createPortableLoomReentryCustodian } = {}) {
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
    onCheck, createCustodian,
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

// Presentation migration: the old witness opened a top-level Return drawer and
// nested operational drawers. The behavioral contract is reachable registration,
// Check and exact-candidate Admit, with inspectable commitments and private scope.
// The new composition keeps those controls outside the one secondary disclosure.
test('Return is a primary workspace with one secondary inspection and no nested disclosures', async () => {
  const h = await harness();
  try {
    assert.equal(h.$('drawer').tagName, 'SECTION');
    assert.equal(h.root.querySelectorAll('details').length, 1);
    assert.equal(h.root.querySelectorAll('details details').length, 0);
    for (const key of ['task', 'stage', 'copy', 'returns', 'policy-review', 'check', 'accept', 'admit', 'save', 'rest']) {
      assert.equal(h.$(key).closest('details'), null, `${key} belongs to the primary route`);
    }
    assert.equal(h.$('rules').closest('details'), null, 'the exact rules are visible before policy review');
    assert.equal(h.$('inspection').open, false);
    h.$('inspect-sources').click();
    assert.equal(h.$('inspection').open, true);
    assert.equal(h.dom.window.document.activeElement, h.$('sources'));
    await stage(h, 'Return with deliberately selected source.', [{ id: 'selected', name: 'Selected.md', text: 'Fictional explicit source.' }]);
    await check(h); h.checked('accept', true); h.$('admit').click(); await settled(h);
    assert.equal(h.root.querySelectorAll('details').length, 1, 'admitted source inspection adds no nested disclosure');
    assert.equal(h.$('continuation').closest('details'), h.$('inspection'), 'carrier-only compatibility stays secondary');
    assert.match(h.$('continuation').textContent, /registers no foreign turn and advances no ancestry/);
  } finally { h.close(); }
});

test('source selection and live-versus-imported custody remain visible without opening inspection', async () => {
  const h = await harness();
  try {
    assert.equal(h.root.dataset.custodyState, 'LIVE_PROCESS');
    assert.match(h.$('lane-state').textContent, /Live local custody in this tab/);
    assert.equal(h.$('lane-state').closest('details'), null);
    h.change('sources', JSON.stringify([{ id: 'selected', name: 'Selected.md', text: 'Fictional explicit source.' }]));
    h.change('withheld', '1');
    assert.match(h.$('source-selection').textContent, /1 source body selected.*1 deliberately withheld/);
    assert.equal(h.$('inspection').open, false);
    h.ui.clearSession();
    await assert.rejects(h.ui.setSession(structuredClone(h.session), h.packet), /HELD_IMPORTED_CUSTODY/);
    assert.equal(h.root.dataset.custodyState, 'UNAVAILABLE');
    assert.match(h.$('lane-state').textContent, /Imported or reloaded records remain review-only/);
    assert.equal(h.$('stage').disabled, true);
    assert.equal(h.$('admit').disabled, true);
    assert.equal(h.$('result').dataset.state, 'HELD');
    assert.equal(h.$('result').closest('details'), null);
  } finally { h.close(); }
});

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

test('Check observation follows the actual rendered candidate and never advances the head', async () => {
  const observed = [];
  let h;
  h = await harness({ onCheck: checked => observed.push({ checked,
    candidate: h.ui.inspect().candidate, head: h.ui.inspect().custody.current_work_unit_ref,
    visibleState: h.$('result').dataset.state, admissionVisible: !h.$('admission').hidden }) });
  try {
    await stage(h);
    h.change('returns', '{'); h.$('check').click(); await settled(h);
    assert.equal(observed.length, 0, 'malformed input rejected before custodian.check produces no check observation');
    assert.equal(h.$('result').dataset.state, 'HELD');
    await check(h);
    assert.equal(observed.length, 1);
    assert.equal(observed[0].checked, h.ui.inspect().candidate);
    assert.equal(observed[0].candidate, observed[0].checked);
    assert.equal(observed[0].checked.status, 'ADMISSION_CANDIDATE');
    assert.equal(observed[0].visibleState, 'ADMISSION_CANDIDATE');
    assert.equal(observed[0].admissionVisible, true, 'callback follows rendered admission candidate');
    assert.equal(observed[0].head, null);
    assert.equal(h.ui.inspect().custody.work_unit_count, 0);
    await check(h, { receiver_declaration: { policy_change_requested: true, notes: 'Fictional attempted weakening.' } });
    assert.equal(observed.length, 2);
    assert.equal(observed[1].checked.status, 'HELD');
    assert.equal(observed[1].visibleState, 'HELD');
    assert.equal(observed[1].admissionVisible, false);
    assert.equal(observed[1].head, null);
  } finally { h.close(); }
});

test('failed Check observation preserves the real candidate and its subsequent exact admission', async () => {
  const h = await harness({ onCheck: () => { throw new Error('Fictional companion unavailable.'); } });
  try {
    await stage(h); await check(h);
    const candidate = h.ui.inspect().candidate;
    assert.equal(candidate.status, 'ADMISSION_CANDIDATE');
    assert.equal(h.$('result').dataset.state, 'ADMISSION_CANDIDATE');
    assert.equal(h.$('verdict').textContent, 'Ready for local admission.');
    assert.equal(h.$('check-observation-status').hidden, false);
    assert.match(h.$('check-observation-status').textContent, /observation refresh held/);
    assert.equal(h.ui.inspect().custody.current_work_unit_ref, null);
    h.checked('accept', true); h.$('admit').click(); await settled(h);
    assert.equal(h.ui.inspect().custody.work_unit_count, 1);
    assert.equal(h.$('result').dataset.state, 'ADMITTED');
    assert.equal(h.$('check-observation-status').hidden, true);
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
    h.ui.clearSession();
    await assert.rejects(h.ui.setSession(structuredClone(h.session), h.packet), /HELD_IMPORTED_CUSTODY/);
    assert.equal(h.ui.inspect().custody, null);
    assert.equal(h.$('stage').disabled, true);
    assert.equal(h.$('result').dataset.state, 'HELD');
    assert.match(h.$('detail').textContent, /HELD_IMPORTED_CUSTODY/);
    assert.equal(h.$('count').textContent, '0');
    assert.doesNotMatch(h.$('head').textContent, /^[a-f0-9]/);
  } finally { h.close(); }
});

test('failed replacement preserves the live custody record, pending registration and editable return', async () => {
  const h = await harness();
  try {
    await stage(h, 'Preserve this registered task.', [{ id: 'pending', name: 'Pending.md', text: 'Retained selected material.' }]);
    await check(h); h.checked('accept', true);
    const before = h.ui.getRecord(), pending = h.ui.inspect().excursion;
    const returned = h.$('returns').value;
    await assert.rejects(h.ui.setSession(structuredClone(h.session), h.packet), /HELD_IMPORTED_CUSTODY/);
    assert.deepEqual(h.ui.getRecord(), before);
    assert.equal(h.ui.inspect().excursion, pending);
    assert.equal(h.ui.inspect().custody.pending_turn_count, 1);
    assert.equal(h.$('returns').value, returned);
    assert.equal(h.root.dataset.custodyState, 'LIVE_PROCESS');
    assert.equal(h.$('check').disabled, false);
    assert.equal(h.$('accept').checked, false, 'failed replacement requires a fresh exact-candidate review');
    assert.equal(h.$('admit').disabled, true);
    assert.match(h.$('detail').textContent, /previous custody lane and registered tasks remain unchanged/);
    await check(h); h.checked('accept', true); h.$('admit').click(); await settled(h);
    assert.equal(h.ui.inspect().custody.work_unit_count, 1, 'the preserved lane still admits its registered return');
  } finally { h.close(); }
});

test('late installation cancellation closes only the candidate and preserves the previous lane', async () => {
  let created = 0, candidateClosed = false, release, entered;
  const creationStarted = new Promise(resolve => { entered = resolve; });
  const h = await harness({ createCustodian: async (...args) => {
    created += 1;
    if (created === 1) return createPortableLoomReentryCustodian(...args);
    entered();
    await new Promise(resolve => { release = resolve; });
    return { close() { candidateClosed = true; } };
  } });
  try {
    await stage(h, 'Task survives cancellation.');
    const before = h.ui.getRecord(), pending = h.ui.inspect().excursion;
    let permitted = true;
    const installing = h.ui.setSession(h.session, h.packet, { canCommit: () => permitted });
    await creationStarted;
    assert.deepEqual(h.ui.getRecord(), before, 'candidate construction does not close or replace the previous lane');
    assert.equal(h.$('stage').disabled, true, 'pending installation disables competing gestures');
    permitted = false; release();
    await assert.rejects(installing, { name: 'AbortError' });
    assert.equal(candidateClosed, true);
    assert.deepEqual(h.ui.getRecord(), before);
    assert.equal(h.ui.inspect().excursion, pending);
    assert.equal(h.$('check').disabled, false);
    await stage(h, 'Second task on the original lane.');
    assert.equal(h.ui.inspect().custody.pending_turn_count, 2, 'the original custodian remains live');
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


test('native route bridge registers one departure and stages returned bytes without bypassing Check or Admit', async () => {
  const h = await harness();
  try {
    const excursion = await h.ui.registerDeparture({
      task: 'Native Marrowline continuation.',
      documents: [{ id: 'native', name: 'Native.md', text: 'Fictional native-route source.' }],
      withheld_document_count: 0
    });
    assert.equal(excursion.turns.length, 1);
    assert.equal(h.ui.inspect().custody.work_unit_count, 0);
    const turn = excursion.turns[0], answer = 'Fictional result returned through native Marrowline.';
    const returned = {
      schema: LOOM_REENTRY_RETURN_SCHEMA, excursion_ref: excursion.ref, intent_ref: turn.ref,
      session_root_ref: excursion.session_root_ref, policy_commitment: excursion.policy_commitment,
      anchor_work_unit_ref: excursion.anchor_work_unit_ref, turn_index: turn.turn_index,
      task_digest: turn.task_digest, source_commitment_digest: turn.source_commitment_digest,
      answer, answer_digest: await portableLoomDigest(answer, h.environment),
      used_document_ids: ['native'], missing_information: ['Foreign execution remains unresolved.'],
      receiver_declaration: { policy_change_requested: false, notes: 'Native route declaration only.' }
    };
    h.ui.loadReturnedTurn(returned);
    assert.equal(h.ui.inspect().candidate, null);
    assert.equal(h.ui.inspect().custody.work_unit_count, 0);
    assert.equal(h.$('admit').disabled, true);
    h.checked('policy-review', true); h.$('check').click(); await settled(h);
    assert.equal(h.ui.inspect().candidate.status, 'ADMISSION_CANDIDATE');
    assert.equal(h.ui.inspect().custody.work_unit_count, 0);
    h.checked('accept', true); h.$('admit').click(); await settled(h);
    assert.equal(h.ui.inspect().custody.work_unit_count, 1);
    assert.equal(h.$('result').dataset.state, 'ADMITTED');
  } finally { h.close(); }
});
