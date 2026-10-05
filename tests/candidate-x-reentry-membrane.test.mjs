import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {webcrypto} from 'node:crypto';
import {JSDOM} from 'jsdom';
import {createLoomAiGovernance} from '../app/dome-world/holonomy-loom/ai-handoff.js';
import {bindLoomDemoRequest,loomDemoDigest,loomDemoReceiptDigest,loomDemoResult,LOOM_DEMO_STAGE_RECEIPT_SCHEMA} from '../app/dome-world/holonomy-loom/demo-contract.js';
import {installKhonapolitTerminal} from '../app/dome-world/marrowline-terminal.js';
import {installMarrowlineLoomDemo} from '../app/dome-world/marrowline-loom-demo.js';
import {installMarrowlineDesktopRepair} from '../app/dome-world/marrowline-desktop-repair.js';
import {clearMarrowlineAttachments} from '../app/dome-world/marrowline-attachments.js';

const html = fs.readFileSync('app/dome-world/marrowline.html','utf8');

async function harnessCandidateX() {
  const dom = new JSDOM(html, {url:'https://td613.com/dome-world/marrowline.html'}), root = dom.window, doc = root.document;
  root.matchMedia = () => ({matches:false, addEventListener(){}, removeEventListener(){}});
  root.requestAnimationFrame = cb => root.setTimeout(cb, 0);
  Object.defineProperty(root, 'crypto', {value:webcrypto}); root.File = File; root.Blob = Blob;

  const packet = {
    task: 'Analyze market conditions.',
    documents: [{id:'doc-1', name:'market.md', text:'Market has 3 competitors.'}],
    rules: ['Rule 1: Exclude non-selected data.']
  };
  packet.governance = await createLoomAiGovernance(packet, {withheldDocumentCount:1}, root);

  clearMarrowlineAttachments(root);
  installMarrowlineDesktopRepair(doc, root);

  const loomRequests = [];
  const ordinaryRequests = [];

  root.fetch = async(url, options) => {
    const request = JSON.parse(options.body);
    if (url.includes('operation=loom-demo-task')) {
      loomRequests.push(request);
      const bound = await bindLoomDemoRequest(request, root);
      const continuationIdx = loomRequests.filter(r => r.phase === 'CONTINUE').length;
      const out = {
        schema: 'td613.loom.ai-task-result/v0.1',
        request_id: request.request_id,
        status: 'completed',
        answer: request.phase === 'ACTIVATE'
          ? 'Rules acknowledged.'
          : continuationIdx === 1
            ? 'State B: initial analysis of 3 competitors.'
            : continuationIdx === 2
              ? 'State C: follow-up analysis with risk vectors.'
              : `State D: continuation ${continuationIdx} detailed findings.`,
        missing_information: [],
        used_document_ids: request.phase === 'ACTIVATE' ? [] : ['doc-1'],
        suggested_next_step: 'Return to Loom.'
      };
      const normalized = loomDemoResult(out, bound.selected.documents);
      const stage = {
        schema: LOOM_DEMO_STAGE_RECEIPT_SCHEMA,
        activation_digest: request.activation.activation_digest,
        phase: request.phase,
        request_id: request.request_id,
        request_digest: await loomDemoDigest(request, root),
        current_input_digest: bound.governance.input_digest,
        prior_result_digest: bound.receipt.prior_result_digest,
        result_digest: await loomDemoDigest(normalized, root),
        predecessor_receipt_digest: request.phase === 'CONTINUE' ? await loomDemoReceiptDigest(request.predecessor, root) : null,
        expires_at: request.activation.expires_at,
        admission_state: 'ADMITTED',
        stage_policy: request.phase === 'ACTIVATE' ? 'AIA_ONLY' : 'SELECTED_FILES_BOUND',
        authority_transferred: false,
        auth: {scheme:'hmac-sha256', key_id:'td613-loom-demo-stage-v1', tag:'A'.repeat(43)}
      };
      bound.governor.close();
      return {
        ok: true, status: 200,
        json: async() => ({
          ...out,
          native_reply: {
            ok: true, text: out.answer,
            relay: {transcript: out.answer, khonapolit: {present:true, text:out.answer}},
            receipt: {provider: {completion: {complete:true}}}
          },
          loom_demo_binding: bound.receipt,
          loom_demo_stage_receipt: stage
        })
      };
    } else {
      ordinaryRequests.push(request);
      return {
        ok: true, status: 200,
        json: async() => ({
          ok: true, text: 'Ordinary chat answer: ' + request.message,
          relay: {transcript: 'Ordinary chat answer: ' + request.message},
          receipt: {provider: {completion: {complete:true}}}
        })
      };
    }
  };

  installKhonapolitTerminal(doc, root);
  await root.TD613_KHONAPOLIT_TERMINAL.ready;
  const controller = await installMarrowlineLoomDemo(packet, doc, root);
  return {dom, root, doc, packet, controller, loomRequests, ordinaryRequests, close(){controller.destroy(); dom.window.close();}};
}

test('CANDIDATE X: Explicit Re-entry Membrane - Setup -> Continuation 1 -> REST (A=0) -> Ordinary Chat -> Membrane Dialog -> Continuation 2 -> REST', async () => {
  const h = await harnessCandidateX();
  try {
    // 1. Initial Arrival
    assert.equal(h.controller.snapshot().phase, 'ARRIVED');
    assert.equal(h.controller.snapshot().active, false);

    // 2. Step 1: Setup
    await h.controller.stageAia();
    assert.equal(h.controller.snapshot().phase, 'AIA_STAGED');
    assert.equal(h.controller.snapshot().active, true);
    await h.controller.submit();
    assert.equal(h.controller.snapshot().phase, 'AIA_SENT');
    assert.equal(h.loomRequests.length, 1);
    assert.equal(h.loomRequests[0].phase, 'ACTIVATE');

    // 3. Step 2: Continuation 1
    await h.controller.stageFiles();
    assert.equal(h.controller.snapshot().phase, 'FILES_STAGED');
    await h.controller.submit();
    assert.equal(h.controller.snapshot().phase, 'DONE');
    assert.equal(h.controller.snapshot().active, false, 'active must be false (REST) after continuation admits');
    assert.equal(h.controller.snapshot().substantive_continuation_count, 1);
    assert.equal(h.loomRequests.length, 2);
    assert.equal(h.loomRequests[1].phase, 'CONTINUE');

    // 4. Invariant: Ordinary Chat while at REST (A=0) is NOT intercepted by Loom
    const prompt = h.doc.querySelector('#khonapolitPrompt');
    prompt.value = 'Can you summarize that in one sentence?';
    prompt.dispatchEvent(new h.root.Event('input', {bubbles: true}));
    await h.controller.submit();

    assert.equal(h.ordinaryRequests.length, 1, 'message must route to ordinary chat endpoint');
    assert.equal(h.ordinaryRequests[0].message, 'Can you summarize that in one sentence?');
    assert.equal(h.ordinaryRequests[0].attachments, undefined, 'no selected files retransmitted in ordinary chat');
    assert.equal(h.loomRequests.length, 2, 'no silent Loom continuation dispatched');

    // 5. Re-entry Membrane Modal: Inspection and Cancel test
    h.controller.openReentryModal();
    const modal = h.doc.querySelector('#loomReentryModal');
    assert.ok(modal, 'Re-entry modal dialog exists');
    assert.equal(modal.hidden, false, 'Re-entry modal is visible');

    // Verify CROSS / STAY / UNKNOWN contents
    const crossList = modal.querySelector('.loom-reentry-card-cross ul');
    const stayList = modal.querySelector('.loom-reentry-card-stay ul');
    const unknownList = modal.querySelector('.loom-reentry-card-unknown ul');

    assert.match(crossList.textContent, /Analyze market conditions/, 'Task is disclosed in CROSS');
    assert.match(crossList.textContent, /market\.md/, 'Selected files are disclosed in CROSS');
    assert.match(crossList.textContent, /State B/, 'Prior answer brief is disclosed in CROSS');

    assert.match(stayList.textContent, /1 unselected\/local files remain withheld/, 'Withheld files disclosed in STAY');
    assert.match(stayList.textContent, /Ordinary chat messages/, 'Chat privacy disclosed in STAY');

    assert.match(unknownList.textContent, /internal reasoning/, 'Provider uncertainty disclosed in UNKNOWN');

    // Test Cancel button: preserves REST, does not re-arm Loom
    const cancelBtn = h.doc.querySelector('#loomReentryCancel');
    cancelBtn.click();
    assert.equal(modal.hidden, true, 'Modal closes on cancel');
    assert.equal(h.controller.snapshot().active, false, 'Loom remains at REST on cancel');
    assert.equal(h.controller.snapshot().phase, 'DONE');

    // 6. Re-entry Membrane Modal: Confirm test (re-arms authority A=1 for 1 turn)
    h.controller.openReentryModal();
    await h.controller.confirmReentry();

    assert.equal(modal.hidden, true, 'Modal closes on confirm');
    assert.equal(h.controller.snapshot().phase, 'FILES_STAGED');
    assert.equal(h.controller.snapshot().active, true, 'Loom authority re-armed');
    assert.match(prompt.value, /Continue the original Loom task from its prior answer/);

    // Submit Continuation 2
    prompt.value = 'Focus specifically on competitor #2.';
    prompt.dispatchEvent(new h.root.Event('input', {bubbles: true}));
    await h.controller.submit();

    assert.equal(h.loomRequests.length, 3, 'Continuation 2 dispatched via Loom transport');
    assert.equal(h.loomRequests[2].phase, 'CONTINUE');
    assert.equal(h.loomRequests[2].predecessor.request_id, h.loomRequests[1].request_id, 'C2 binds C1 receipt as predecessor');
    assert.equal(h.controller.snapshot().phase, 'DONE');
    assert.equal(h.controller.snapshot().active, false, 'active returns to false (REST) after C2 admits');
    assert.equal(h.controller.snapshot().substantive_continuation_count, 2);

    // 7. Verify Return to Loom packet carries all stages
    const exported = h.controller.exportPacket();
    assert.equal(exported.loom_demo_provenance.stages.length, 3, 'Export has AIA, C1, and C2 stages');
    assert.equal(exported.loom_demo_provenance.stages[1].result.answer, 'State B: initial analysis of 3 competitors.');
    assert.equal(exported.loom_demo_provenance.stages[2].result.answer, 'State C: follow-up analysis with risk vectors.');
    assert.equal(exported.loom_demo_provenance.stages[2].content_predecessor_request_id, h.loomRequests[1].request_id, 'C2 content predecessor is C1');
  } finally {
    h.close();
  }
});

test('CANDIDATE X: Multi-Cycle Repetition (Turns 3 and 4) preserves REST boundaries and predecessor chains', async () => {
  const h = await harnessCandidateX();
  try {
    // Traverse Setup -> C1 -> C2
    await h.controller.stageAia();
    await h.controller.submit();
    await h.controller.stageFiles();
    await h.controller.submit();
    assert.equal(h.controller.snapshot().active, false, 'REST after C1');

    await h.controller.reenterLoom();
    h.doc.querySelector('#khonapolitPrompt').value = 'Turn 2 prompt';
    await h.controller.submit();
    assert.equal(h.controller.snapshot().active, false, 'REST after C2');
    assert.equal(h.controller.snapshot().substantive_continuation_count, 2);

    // Turn 3: Open membrane, confirm, submit
    h.controller.openReentryModal();
    await h.controller.confirmReentry();
    assert.equal(h.controller.snapshot().phase, 'FILES_STAGED');
    assert.equal(h.controller.snapshot().active, true);
    const prompt = h.doc.querySelector('#khonapolitPrompt');
    prompt.value = 'Turn 3 prompt: analyze risk scenarios.';
    prompt.dispatchEvent(new h.root.Event('input', {bubbles: true}));
    await h.controller.submit();

    assert.equal(h.loomRequests.length, 4, 'C3 dispatched via Loom');
    assert.equal(h.loomRequests[3].phase, 'CONTINUE');
    assert.equal(h.loomRequests[3].predecessor.request_id, h.loomRequests[2].request_id, 'C3 binds C2 receipt as predecessor');
    assert.equal(h.controller.snapshot().phase, 'DONE');
    assert.equal(h.controller.snapshot().active, false, 'REST after C3');
    assert.equal(h.controller.snapshot().substantive_continuation_count, 3);

    // Turn 4: Open membrane, confirm, submit
    h.controller.openReentryModal();
    await h.controller.confirmReentry();
    assert.equal(h.controller.snapshot().phase, 'FILES_STAGED');
    assert.equal(h.controller.snapshot().active, true);
    prompt.value = 'Turn 4 prompt: synthesize conclusions.';
    prompt.dispatchEvent(new h.root.Event('input', {bubbles: true}));
    await h.controller.submit();

    assert.equal(h.loomRequests.length, 5, 'C4 dispatched via Loom');
    assert.equal(h.loomRequests[4].phase, 'CONTINUE');
    assert.equal(h.loomRequests[4].predecessor.request_id, h.loomRequests[3].request_id, 'C4 binds C3 receipt as predecessor');
    assert.equal(h.controller.snapshot().phase, 'DONE');
    assert.equal(h.controller.snapshot().active, false, 'REST after C4');
    assert.equal(h.controller.snapshot().substantive_continuation_count, 4);

    // Verify Export packet has all 5 stages
    const exported = h.controller.exportPacket();
    assert.equal(exported.loom_demo_provenance.stages.length, 5, 'Export has AIA, C1, C2, C3, C4');
    assert.equal(exported.loom_demo_provenance.stages[4].content_predecessor_request_id, h.loomRequests[3].request_id, 'C4 content predecessor is C3');
  } finally {
    h.close();
  }
});
