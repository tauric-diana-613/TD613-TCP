import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { mountPortableWorkbench } from '../app/dome-world/holonomy-loom/portable-workbench.js';
import { compileLoomDemoScene } from '../app/dome-world/holonomy-loom/semantic-field.js';

function harness(t) {
  const dom = new JSDOM('<section id="root"></section>');
  const root = dom.window.document.getElementById('root');
  let pauses = 0;
  const ui = mountPortableWorkbench(root, { pause: () => { pauses += 1; } });
  ui.setPacket(compileLoomDemoScene(2));
  const $ = selector => root.querySelector(selector);
  t.after(() => { ui.destroy(); dom.window.close(); });
  $('#lpStart').click();
  return {
    $, root, ui, pauses: () => pauses,
    receive(value) { $('#lpCandidate').value = JSON.stringify(value); $('#lpImport').click(); },
    changeReceiver(value) {
      $('#lpReceiver').value = value;
      $('#lpReceiver').dispatchEvent(new dom.window.Event('change'));
    }
  };
}

test('changing receiver presentation cannot visually resume a resting governor', t => {
  const h = harness(t);
  h.$('#lpRest').click();
  h.changeReceiver('child');
  assert.equal(h.ui.inspect().governance.status, 'REST');
  assert.equal(h.root.dataset.governorStatus, 'REST');
  assert.match(h.$('#lpStatus').textContent, /resting/i);
  assert.equal(h.root.dataset.journeyStage, 'rest');
  assert.equal(h.$('[data-lp-operation="TRACE_FLOWCORE"]').disabled, true);
  assert.equal(h.$('#lpResume').hidden, false);
  assert.equal(h.ui.inspect().governance.admitted_count, 0);
});

test('changing receiver presentation preserves the held boundary and its cause', t => {
  const h = harness(t);
  h.$('#lpAlter').click();
  const prior = h.ui.inspect().governance.latest_event;
  assert.equal(prior.outcome, 'HELD');
  h.changeReceiver('auditor');
  assert.equal(h.ui.inspect().governance.status, 'HELD');
  assert.equal(h.ui.inspect().governance.latest_event, prior);
  assert.equal(h.ui.inspect().candidate, null);
  assert.match(h.$('#lpStatus').textContent, /held/i);
  assert.equal(h.root.dataset.journeyStage, 'held');
  assert.equal(h.$('#lpControlBlock').hasAttribute('hidden'), false);
  assert.equal(h.$('#lpSupportBlock').hasAttribute('hidden'), false);
  assert.match(h.$('#lpFieldMeaning').textContent, /COPY_CHECKED_MESSAGE/);
});

test('trace-only drift visibly interrupts the control lane while preserving exact action support', t => {
  const h = harness(t);
  h.$('[data-lp-operation="TRACE_FLOWCORE"]').click();
  const returned = JSON.parse(h.$('#lpCandidate').value);
  returned.flow_core_trace += ' 𝄐';
  h.receive(returned);
  const result = h.ui.inspect().governance.latest_event.revalidation;
  assert.equal(h.ui.inspect().governance.status, 'HELD');
  assert.equal(result.atlas.control_plane_equal, true);
  assert.equal(result.atlas.flow_core_trace_equal, false);
  assert.equal(result.fadt.all_fibres_exact, true);
  assert.deepEqual(result.fadt.fibres[0].irreducible_gap, []);
  assert.equal(h.$('#lpControlBlock').hasAttribute('hidden'), false);
  assert.equal(h.$('#lpSupportBlock').hasAttribute('hidden'), true);
  assert.match(h.$('#lpFieldMeaning').textContent, /trace/i);
  assert.doesNotMatch(h.$('#lpFieldMeaning').textContent, /action support failed/i);
  assert.equal(h.ui.inspect().governance.action_executed, false);
});

test('wrong receiver and unsupported action never grant a local effect or external enforcement', t => {
  const h = harness(t);
  h.$('[data-lp-operation="PROPOSE_ACTION"]').click();
  const returned = JSON.parse(h.$('#lpCandidate').value);
  const admitted = h.ui.inspect().governance.admitted_count;
  h.receive({ ...returned, source_receiver: 'auditor' });
  assert.equal(h.ui.inspect().governance.admitted_count, admitted);
  assert.equal(h.root.dataset.returnStatus, 'HOLD');
  assert.equal(h.$('#lpApplyRest').hidden, true);
  h.receive({ ...returned, proposed_action: 'COPY_CHECKED_MESSAGE' });
  const state = h.ui.inspect().governance;
  assert.equal(state.admitted_count, admitted);
  assert.equal(state.status, 'HELD');
  assert.ok(state.latest_event.revalidation.reason_codes.includes('PROPOSED_ACTION_OUTSIDE_ORIGIN_SUPPORT'));
  assert.equal(state.external_host_enforced, false);
  assert.equal(state.action_executed, false);
  assert.match(h.$('.lp-scope').textContent, /Loom local session/);
  assert.match(h.$('.lp-scope').textContent, /Remote host adapter: not connected/);
  assert.match(h.$('.lp-limit').textContent, /external enforcement requires a host adapter/i);
  assert.equal(h.$('#lpApplyRest').hidden, true);
  const pauses = h.pauses();
  h.$('#lpApplyRest').click();
  assert.equal(h.pauses(), pauses);
  assert.equal(h.ui.inspect().governance.status, 'HELD');
});
