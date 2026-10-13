import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { webcrypto } from 'node:crypto';
import { JSDOM } from 'jsdom';
import {
  compileCanonicalPracticeFixture,
  compilePedagoguePracticeReview,
  verifyPracticeFixtureLoad,
  comparePracticeFixtureTraversal
} from '../app/engine/pedagogue-practice-fixture.js';
import { createLoomAiGovernance } from '../app/dome-world/holonomy-loom/ai-handoff.js';
import { installMarrowlineLoomDemo } from '../app/dome-world/marrowline-loom-demo.js';
import { clearMarrowlineAttachments, getMarrowlineAttachments } from '../app/dome-world/marrowline-attachments.js';

const declaration = JSON.parse(await readFile(new URL('./fixtures/pedagogue/marrowline-loom-two-stage-practice.json', import.meta.url), 'utf8'));
const html = await readFile(new URL('../app/dome-world/marrowline.html', import.meta.url), 'utf8');
const zeroEffects = () => ({ evidence_records: 0, retrieval_requests: 0, retrieval_receipts: 0, practice_custody_writes: 0, domain_mutations: 0, authority_grants: 0 });

async function localRoute() {
  const dom = new JSDOM(html, { url: 'https://td613.com/dome-world/marrowline.html' });
  const root = dom.window;
  Object.defineProperty(root, 'crypto', { value: webcrypto });
  root.File = File;
  root.Blob = Blob;
  let providerCalls = 0;
  root.fetch = async () => { providerCalls += 1; throw new Error('This Pedagogue fixture admits no provider calls.'); };
  const packet = {
    task: 'FICTIONAL practice: compare fictional workstreams.',
    documents: [{ id: 'fictional-selected', name: 'fictional-selected.md', text: 'FICTIONAL: Workstream A requires one review.' }],
    rules: ['Use only selected fictional sources. Preserve missing evidence.']
  };
  packet.governance = await createLoomAiGovernance(packet, { withheldDocumentCount: 1 }, root);
  clearMarrowlineAttachments(root);
  const controller = await installMarrowlineLoomDemo(packet, root.document, root);
  return {
    root, doc: root.document, controller,
    calls: () => providerCalls,
    close() { controller.destroy(); clearMarrowlineAttachments(root); dom.window.close(); }
  };
}

test('Loom practice declaration is authority-closed, uses the real route, and cannot fabricate evidence', () => {
  const review = compilePedagoguePracticeReview(declaration);
  assert.equal(Object.values(review.practice_gate).every(Boolean), true);
  assert.equal(review.fixture.runtime_binding_declared, true);
  assert.equal(review.fixture.traversal_contract.separate_demo_route_forbidden, true);
  assert.equal(review.fixture.authority.operator_read_only_retrieval_allowed, false);
  assert.equal(review.fixture.authority.practice_custody_write_authority, false);
  assert.equal(review.fixture.authority.human_closure_required, true);
  assert.equal(review.fixture.research_claim_ceiling.geometric_holonomy_claim, false);
  const forged = structuredClone(declaration);
  forged.fictional_payload.receipts = [{ status: 'admitted' }];
  assert.throws(() => compileCanonicalPracticeFixture(forged), /may not fabricate/);
});

test('real Loom arrival, inspection, close and staging are local preparation, not Send', async () => {
  const h = await localRoute();
  try {
    const practice = compileCanonicalPracticeFixture(declaration);
    const before = zeroEffects();
    assert.equal(h.calls(), 0);
    assert.equal(getMarrowlineAttachments().length, 0);
    assert.equal(h.doc.querySelector('#loomImportedWorkspace'), null);
    h.controller.openMenu();
    const menu = h.doc.querySelector('#loomDemoMenu');
    const choices = [...menu.querySelectorAll('button')];
    assert.equal(menu.hidden, false);
    assert.equal(choices[0].textContent, 'Setup · Attach Loom handoff');
    assert.equal(choices[1].textContent, 'Continue · Attach selected files');
    assert.equal(choices[1].disabled, true);
    h.doc.dispatchEvent(new h.root.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    assert.equal(menu.hidden, true);
    assert.equal(h.calls(), 0);
    await h.controller.stageFiles();
    assert.equal(getMarrowlineAttachments().length, 0);
    await h.controller.stageAia();
    assert.equal(h.calls(), 0);
    assert.equal(getMarrowlineAttachments().length, 1);
    assert.equal(h.controller.snapshot().aia_sent, false);
    assert.equal(choices[1].disabled, true);
    assert.equal(h.doc.querySelector('.loom-demo-composer-note'), null);
    assert.equal(h.doc.querySelector('#loomDemoMessages'), null);
    assert.equal(h.doc.querySelector('#khonapolitMessages').hidden, false);
    // OLD ASSERTION: public Portable AIA wording. REAL CONTRACT: setup handoff + prompt are staged before explicit Send.
    // NEW WITNESS: Loom wording and all existing staged/no-network assertions below.
    assert.match(h.doc.querySelector('#khonapolitPrompt').value, /Receive the attached Loom handoff/);
    assert.match(h.doc.querySelector('#khonapolitTerminalStatus').textContent, /Selected file contents remain here/);
    assert.equal(h.doc.activeElement, h.doc.querySelector('#khonapolitPrompt'));
    assert.equal(menu.querySelectorAll('button')[2].hidden, true);
    const after = { ...zeroEffects(), retrieval_requests: h.calls() };
    assert.equal(verifyPracticeFixtureLoad(practice, { before, after }).no_effects, true);
  } finally { h.close(); }
});

test('ending a staged Loom route is local exit in the submenu, retaining the native conversation', async () => {
  const h = await localRoute();
  try {
    await h.controller.stageAia();
    const transcript = h.doc.querySelector('#khonapolitMessages');
    transcript.textContent = 'Native conversation remains visible';
    assert.equal(transcript.hidden, false);
    h.controller.openMenu();
    const leave = [...h.doc.querySelectorAll('#loomDemoMenu button')].find(node => node.textContent === 'End Loom continuation');
    assert.ok(leave);
    leave.click();
    assert.equal(h.calls(), 0);
    assert.equal(h.controller.snapshot().phase, 'LEFT');
    assert.equal(h.doc.documentElement.dataset.loomDemoActive, 'false');
    assert.equal(h.doc.querySelector('#khonapolitMessages').hidden, false);
    assert.equal(h.doc.querySelector('#loomDemoMessages'), null);
    assert.equal(transcript.textContent, 'Native conversation remains visible');
    assert.equal(getMarrowlineAttachments().length, 0);
    assert.equal(h.doc.querySelector('#khonapolitPrompt').value, '', 'ending clears the untouched generated attachment draft');
    assert.equal(h.root.location.hash, '');
    assert.throws(() => h.controller.exportPacket());
  } finally { h.close(); }
});

test('same export endpoint cannot erase a skipped activation in the practice route', () => {
  const practice = compileCanonicalPracticeFixture(declaration);
  const exact = comparePracticeFixtureTraversal(practice, declaration.expected_route_steps);
  assert.equal(exact.exact_route_reconstruction, true);
  assert.equal(exact.authority_closed, true);
  const skipped = declaration.expected_route_steps.filter(step => step !== 'explicit-send-activation');
  const mismatch = comparePracticeFixtureTraversal(practice, skipped, { observedEndpoint: declaration.expected_endpoint });
  assert.equal(mismatch.exact_route_reconstruction, false);
  assert.equal(mismatch.endpoint_equivalent, true);
  assert.equal(mismatch.route_memory_comparison.same_endpoint_not_same_history, true);
  assert.ok(mismatch.route_reconstruction_error_millipoints > 0);
  assert.equal(mismatch.research_claim_ceiling.geometric_holonomy_claim, false);
  assert.throws(() => comparePracticeFixtureTraversal(practice, declaration.expected_route_steps, { explicitOperatorGesture: true, observedEffects: { retrieval_requests: 1 } }), /explicit operator gesture and an admitted/);
  assert.throws(() => comparePracticeFixtureTraversal(practice, declaration.expected_route_steps, { observedAuthority: { automatic_release: true } }), /widen authority/);
});
