import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { mountPortableWorkbench } from '../app/dome-world/holonomy-loom/portable-workbench.js';
import { compileLoomDemoScene } from '../app/dome-world/holonomy-loom/semantic-field.js';

function harness(scene = 2) {
  const dom = new JSDOM('<section id="root"></section>');
  const root = dom.window.document.getElementById('root');
  let pauses = 0;
  const ui = mountPortableWorkbench(root, { pause: () => { pauses++; } });
  const packet = compileLoomDemoScene(scene);
  ui.setPacket(packet);
  const $ = selector => root.querySelector(selector);
  return { dom, root, ui, packet, $, pauses: () => pauses };
}

test('active session automatically checks a receiver operation before human review conserves origin and requires no clock', () => {
  const h = harness();
  h.$('#lpStart').click();
  h.$('[data-lp-operation="PROPOSE_ACTION"]').click();
  assert.equal(h.root.dataset.returnStatus, 'PRESENT_TO_HUMAN');
  assert.equal(h.ui.inspect().governance.admitted_count, 1);
  h.$('#lpReturn').click();
  assert.equal(h.root.dataset.returnStatus, 'PRESENT_TO_HUMAN');
  assert.equal(h.ui.inspect().receipt.revalidation.action.proposed_action, 'REST');
  assert.equal(h.ui.inspect().receipt.action_executed, false);
  assert.equal(h.ui.inspect().receipt.revalidation.release_authority, false);
  assert.equal(h.ui.inspect().packet, h.packet);
  assert.equal(h.root.dataset.journeyStage, 'returned');
  h.$('#lpExit').click();
  assert.equal(h.$('#lpSession').hidden, true);
  assert.equal(h.root.dataset.journeyStage, 'rest');
  assert.equal(h.ui.inspect().projection, null);
  assert.ok(h.pauses() >= 3);
  h.ui.destroy(); h.dom.window.close();
});

test('altered return displays the precise permission gap; original remains immutable', () => {
  const h = harness(); h.$('#lpStart').click();
  h.$('[data-lp-operation="EXPLAIN_STATE"]').click(); h.$('#lpAlter').click();
  assert.equal(h.root.dataset.returnStatus, 'HOLD');
  assert.equal(h.root.dataset.journeyStage, 'held');
  assert.deepEqual(h.ui.inspect().receipt.revalidation.fadt.fibres[0].irreducible_gap, ['COPY_CHECKED_MESSAGE']);
  assert.match(h.$('#lpChecks').textContent, /COPY_CHECKED_MESSAGE/);
  assert.equal(h.packet.analysis.release_boundary.raw_release_allowed, false);
  h.ui.destroy(); h.dom.window.close();
});

test('scene change invalidates the active receiver and rejects a pasted stale return', () => {
  const h = harness(); h.$('#lpStart').click(); h.$('[data-lp-operation="TRACE_FLOWCORE"]').click();
  const stale = h.$('#lpCandidate').value;
  h.ui.setPacket(compileLoomDemoScene(4));
  assert.equal(h.ui.inspect().candidate, null); assert.equal(h.$('#lpReturn').disabled, true);
  assert.equal(h.$('#lpSession').hidden, true);
  h.$('#lpStart').click(); h.$('#lpCandidate').value = stale; h.$('#lpImport').click();
  assert.equal(h.root.dataset.returnStatus, 'HOLD');
  h.ui.destroy(); h.dom.window.close();
});

test('receiver change preserves controls but clears an earlier candidate; warning explanation remains modeled', () => {
  const h = harness(4); h.$('#lpStart').click();
  const origin = h.ui.inspect().projection.control;
  h.$('[data-lp-operation="EXPLAIN_STATE"]').click();
  assert.match(h.$('#lpAnswer').textContent, /teaching model/);
  assert.match(h.$('#lpAnswer').textContent, /UNEARNED/);
  h.$('#lpReceiver').value = 'child'; h.$('#lpReceiver').dispatchEvent(new h.dom.window.Event('change'));
  assert.deepEqual(h.ui.inspect().projection.control, origin);
  assert.equal(h.ui.inspect().candidate, null);
  assert.match(h.$('#lpProjection').textContent, /pause and look closer/);
  h.ui.destroy(); h.dom.window.close();
});

test('malformed pasted returns remove any prior success and never render payload markup', () => {
  const h = harness(); h.$('#lpStart').click(); h.$('[data-lp-operation="EXPLAIN_STATE"]').click(); h.$('#lpReturn').click();
  h.$('#lpCandidate').value = '{broken'; h.$('#lpImport').click();
  assert.equal(h.root.dataset.returnStatus, 'HOLD'); assert.equal(h.ui.inspect().receipt, null);
  assert.equal(h.$('#lpChecks').hidden, true);
  h.$('[data-lp-operation="REPORT_MISSINGNESS"]').click();
  const candidate = JSON.parse(h.$('#lpCandidate').value);
  candidate.reported_missingness = ['<img src=x onerror=alert(1)>'];
  h.$('#lpCandidate').value = JSON.stringify(candidate); h.$('#lpImport').click();
  assert.equal(h.root.querySelector('img'), null);
  assert.match(h.$('#lpChecks').textContent, /<img/);
  assert.equal(h.ui.inspect().receipt.revalidation.host_reported_missingness_promoted_to_origin_fact, false);
  h.ui.destroy(); h.dom.window.close();
});

test('empty and oversized returns stay held; no projection means no return authority', () => {
  const h = harness(); h.$('#lpImport').click(); assert.equal(h.root.dataset.returnStatus, 'HOLD');
  h.$('#lpStart').click(); h.$('#lpCandidate').value = 'x'.repeat(64001); h.$('#lpImport').click();
  assert.equal(h.root.dataset.returnStatus, 'HOLD'); assert.equal(h.ui.inspect().receipt, null);
  h.ui.destroy(); h.dom.window.close();
});


test('activation enforces returns; admitted rest actually pauses and closes intake until resume', () => {
  const h = harness(); h.$('#lpStart').click();
  assert.equal(h.ui.inspect().governance.status, 'ACTIVE');
  h.$('#lpAlter').click();
  assert.equal(h.ui.inspect().governance.status, 'HELD');
  assert.equal(h.$('#lpControlBlock').hasAttribute('hidden'), false);
  assert.equal(h.$('#lpSupportBlock').hasAttribute('hidden'), false);
  h.$('[data-lp-operation="PROPOSE_ACTION"]').click();
  assert.equal(h.ui.inspect().governance.latest_event.recovered, true);
  assert.equal(h.$('#lpApplyRest').hidden, false);
  const pauses = h.pauses(); h.$('#lpApplyRest').click();
  assert.ok(h.pauses() > pauses);
  assert.equal(h.ui.inspect().receipt.action_executed, 'REST');
  assert.equal(h.ui.inspect().governance.status, 'REST');
  assert.equal(h.$('[data-lp-operation="PROPOSE_ACTION"]').disabled, true);
  h.$('#lpImport').click();
  assert.equal(h.ui.inspect().governance.status, 'REST');
  assert.equal(h.root.dataset.returnStatus, 'HOLD');
  h.$('#lpResume').click();
  assert.equal(h.ui.inspect().governance.status, 'ACTIVE');
  h.$('[data-lp-operation="TRACE_FLOWCORE"]').click();
  assert.equal(h.root.dataset.returnStatus, 'PRESENT_TO_HUMAN');
  h.ui.destroy(); h.dom.window.close();
});

test('malformed return clears an old rest affordance and records a held boundary event', () => {
  const h = harness(); h.$('#lpStart').click(); h.$('[data-lp-operation="PROPOSE_ACTION"]').click();
  h.$('#lpCandidate').value = '{broken'; h.$('#lpImport').click();
  assert.equal(h.$('#lpApplyRest').hidden, true);
  assert.equal(h.ui.inspect().governance.status, 'HELD');
  assert.equal(h.ui.inspect().candidate, null);
  const pauses = h.pauses(); h.$('#lpApplyRest').click();
  assert.equal(h.pauses(), pauses);
  h.ui.destroy(); h.dom.window.close();
});
