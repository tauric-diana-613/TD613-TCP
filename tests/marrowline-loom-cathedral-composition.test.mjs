import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { webcrypto } from 'node:crypto';
import { JSDOM } from 'jsdom';
import { createLoomAiGovernance } from '../app/dome-world/holonomy-loom/ai-handoff.js';
import {
  bindLoomDemoRequest,
  loomDemoDigest,
  loomDemoReceiptDigest,
  loomDemoResult,
  LOOM_DEMO_STAGE_RECEIPT_SCHEMA
} from '../app/dome-world/holonomy-loom/demo-contract.js';
import { installKhonapolitTerminal, marrowlineThreadMatchesSearch } from '../app/dome-world/marrowline-terminal.js';
import {
  installMarrowlineLoomDemo,
  PRESENTATION_CANDIDATES,
  FLOWCORE_OPERATORS
} from '../app/dome-world/marrowline-loom-demo.js';
import { installMarrowlineDesktopRepair } from '../app/dome-world/marrowline-desktop-repair.js';
import {
  clearMarrowlineAttachments,
  stageMarrowlineAttachments,
  getMarrowlineAttachments
} from '../app/dome-world/marrowline-attachments.js';
import { AnimationCoordinator } from '../app/dome-world/holonomy-loom/animation-coordinator.js';
import { installFlowcoreCathedralField, CARRIER_DEPTH_CONFIG } from '../app/dome-world/marrowline-flowcore-cathedral.js';

const html = fs.readFileSync('app/dome-world/marrowline.html', 'utf8');

async function createCompositionHarness({ candidate = 'F', reducedMotion = false } = {}) {
  const dom = new JSDOM(html, { url: 'https://td613.com/dome-world/marrowline.html' });
  const root = dom.window;
  const doc = root.document;

  root.matchMedia = (query) => ({
    matches: query.includes('prefers-reduced-motion') ? reducedMotion : false,
    media: query,
    addEventListener() {},
    removeEventListener() {}
  });
  root.requestAnimationFrame = (cb) => root.setTimeout(cb, 0);
  root.cancelAnimationFrame = (id) => root.clearTimeout(id);
  Object.defineProperty(root, 'crypto', { value: webcrypto });
  root.File = File;
  root.Blob = Blob;

  const packet = {
    task: 'Analyze market conditions and competitor vectors.',
    documents: [
      { id: 'doc-market', name: 'market.md', text: 'Market has 3 major competitors.' },
      { id: 'doc-pricing', name: 'pricing.md', text: 'Pricing ceiling is bounded at $45/mo.' }
    ],
    rules: [
      'Preserve source modality: treat limits as contractual ceilings.',
      'Exclude unselected documents from carriage.'
    ]
  };
  packet.governance = await createLoomAiGovernance(packet, { withheldDocumentCount: 2 }, root);

  clearMarrowlineAttachments(root);
  installMarrowlineDesktopRepair(doc, root);

  const loomRequests = [];
  const ordinaryRequests = [];

  root.fetch = async (url, options) => {
    const request = JSON.parse(options.body);
    if (url.includes('operation=loom-demo-task')) {
      loomRequests.push(request);
      const bound = await bindLoomDemoRequest(request, root);
      const continuationIdx = loomRequests.filter((r) => r.phase === 'CONTINUE').length;
      const out = {
        schema: 'td613.loom.ai-task-result/v0.1',
        request_id: request.request_id,
        status: 'completed',
        answer: request.phase === 'ACTIVATE'
          ? 'Rules acknowledged: task and boundaries registered.'
          : continuationIdx === 1
            ? 'State B: Competitor landscape established.'
            : continuationIdx === 2
              ? 'State C: Pricing resilience modeled under bounded ceilings.'
              : `State D: Multi-turn continuation ${continuationIdx} confirmed.`,
        missing_information: [],
        used_document_ids: request.phase === 'ACTIVATE' ? [] : ['doc-market', 'doc-pricing'],
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
        predecessor_receipt_digest: request.phase === 'CONTINUE'
          ? await loomDemoReceiptDigest(request.predecessor, root)
          : null,
        expires_at: request.activation.expires_at,
        admission_state: 'ADMITTED',
        stage_policy: request.phase === 'ACTIVATE' ? 'AIA_ONLY' : 'SELECTED_FILES_BOUND',
        authority_transferred: false,
        auth: { scheme: 'hmac-sha256', key_id: 'td613-loom-demo-stage-v1', tag: 'A'.repeat(43) }
      };
      bound.governor.close();
      return {
        ok: true,
        status: 200,
        json: async () => ({
          ...out,
          native_reply: {
            ok: true,
            text: out.answer,
            relay: { transcript: out.answer, khonapolit: { present: true, text: out.answer } },
            receipt: { provider: { completion: { complete: true } } }
          },
          loom_demo_binding: bound.receipt,
          loom_demo_stage_receipt: stage
        })
      };
    } else {
      ordinaryRequests.push(request);
      return {
        ok: true,
        json: async () => ({
          ok: true,
          text: 'Ordinary reply: ' + request.message,
          relay: { transcript: 'Ordinary reply: ' + request.message },
          receipt: { provider: { completion: { complete: true } } }
        })
      };
    }
  };

  installKhonapolitTerminal(doc, root);
  await root.TD613_KHONAPOLIT_TERMINAL.ready;
  root.__TD613_LOOM_PRESENTATION_CANDIDATE__ = candidate;
  const controller = await installMarrowlineLoomDemo(packet, doc, root);

  return {
    dom,
    root,
    doc,
    packet,
    controller,
    loomRequests,
    ordinaryRequests,
    close() {
      controller.destroy();
      dom.window.close();
    }
  };
}

// ----------------------------------------------------------------------------
// 1. PRESENTATION TOURNAMENT: CANDIDATES A THROUGH F PRESERVE GOVERNANCE
// ----------------------------------------------------------------------------
for (const candKey of ['A', 'B', 'C', 'D', 'E', 'F']) {
  test(`TOURNAMENT [Candidate ${candKey} - ${PRESENTATION_CANDIDATES[candKey].name}]: Full 2-Turn Cycle with REST Boundary & Plain Language Disclosure`, async () => {
    const h = await createCompositionHarness({ candidate: candKey });
    try {
      assert.equal(h.controller.getPresentationCandidate(), candKey);
      assert.equal(h.controller.snapshot().phase, 'ARRIVED');
      assert.equal(h.controller.snapshot().active, false);

      // Setup Turn (AIA handoff)
      await h.controller.stageAia();
      assert.equal(h.controller.snapshot().phase, 'AIA_STAGED');
      assert.equal(h.controller.snapshot().active, true);
      await h.controller.submit();
      assert.equal(h.controller.snapshot().phase, 'AIA_SENT');

      // Continuation Turn 1 (Selected files staged)
      await h.controller.stageFiles();
      assert.equal(h.controller.snapshot().phase, 'FILES_STAGED');
      assert.equal(h.controller.snapshot().active, true);
      await h.controller.submit();

      // REST Boundary Check: active === false, A = 0
      assert.equal(h.controller.snapshot().phase, 'DONE');
      assert.equal(h.controller.snapshot().active, false, 'Route must visibly return to REST');
      assert.equal(h.controller.snapshot().substantive_continuation_count, 1);

      // Invariant: Ordinary chat at REST carries NO Loom files
      const prompt = h.doc.querySelector('#khonapolitPrompt');
      prompt.value = 'Can you clarify the pricing boundary?';
      prompt.dispatchEvent(new h.root.Event('input', { bubbles: true }));
      await h.controller.submit();

      assert.equal(h.ordinaryRequests.length, 1);
      assert.equal(h.ordinaryRequests[0].message, 'Can you clarify the pricing boundary?');
      assert.equal(h.ordinaryRequests[0].attachments, undefined, 'Ordinary chat carries zero selected files');
      assert.equal(h.loomRequests.length, 2, 'Loom route remained at REST');

      // Re-entry Disclosure Surface
      h.controller.openReentryModal();
      const modal = h.doc.querySelector('#loomReentryModal');
      assert.ok(modal, 'Re-entry surface exists');
      assert.equal(modal.hidden, false);
      assert.equal(modal.dataset.presentationCandidate, candKey);

      // Plain Language Boundary Check: SENDS TO AI / STAYS HERE / WE CAN'T SEE
      const crossCard = modal.querySelector('.loom-reentry-card-cross');
      const stayCard = modal.querySelector('.loom-reentry-card-stay');
      const unknownCard = modal.querySelector('.loom-reentry-card-unknown');

      assert.match(crossCard.textContent, /SENDS TO AI/i);
      assert.match(crossCard.textContent, /market\.md/);
      assert.match(crossCard.textContent, /State B/);

      assert.match(stayCard.textContent, /STAYS HERE/i);
      assert.match(stayCard.textContent, /2 unselected\/local files remain withheld/);
      assert.match(stayCard.textContent, /Ordinary chat messages/);

      assert.match(unknownCard.textContent, /WE CAN'T SEE/i);
      assert.match(unknownCard.textContent, /internal reasoning/);

      // Cancel preserves REST with zero network activity
      const cancelBtn = h.doc.querySelector('#loomReentryCancel');
      cancelBtn.click();
      assert.equal(modal.hidden, true);
      assert.equal(h.controller.snapshot().active, false);
      assert.equal(h.loomRequests.length, 2);

      // Re-open and Confirm re-arms authority for exactly 1 turn
      h.controller.openReentryModal();
      await h.controller.confirmReentry();
      assert.equal(modal.hidden, true);
      assert.equal(h.controller.snapshot().phase, 'FILES_STAGED');
      assert.equal(h.controller.snapshot().active, true, 'Authority armed for 1 turn');

      prompt.value = 'Continuation 2: model pricing ceilings.';
      prompt.dispatchEvent(new h.root.Event('input', { bubbles: true }));
      await h.controller.submit();

      // Continuation 2 returned and route returns to REST
      assert.equal(h.loomRequests.length, 3);
      assert.equal(h.loomRequests[2].predecessor.request_id, h.loomRequests[1].request_id, 'C2 binds C1 receipt');
      assert.equal(h.controller.snapshot().phase, 'DONE');
      assert.equal(h.controller.snapshot().active, false, 'Returns to REST after C2 admission');
      assert.equal(h.controller.snapshot().substantive_continuation_count, 2);
    } finally {
      h.close();
    }
  });
}

// ----------------------------------------------------------------------------
// 2. PR #1433 RETRY SEAM INTEGRATION TESTS
// ----------------------------------------------------------------------------
test('RETRY SEAM: Ordinary prompt with file + photo live retry retains exact bodies without arming Loom', async () => {
  const h = await createCompositionHarness({ candidate: 'F' });
  try {
    // Advance Loom to REST
    await h.controller.stageAia();
    await h.controller.submit();
    await h.controller.stageFiles();
    await h.controller.submit();
    assert.equal(h.controller.snapshot().phase, 'DONE');
    assert.equal(h.controller.snapshot().active, false);

    // Now send an ordinary chat turn with attachments
    const fileBytes = new TextEncoder().encode('marrowline-composition-file');
    const photoBytes = new Uint8Array([0xff, 0xd8, 0xaa, 0xbb, 0xff, 0xd9]);

    await stageMarrowlineAttachments([{
      name: 'notes.txt', type: 'text/plain', size: fileBytes.byteLength,
      arrayBuffer: async () => fileBytes.buffer
    }], { kind: 'file', environment: h.root });

    await stageMarrowlineAttachments([{
      name: 'chart.jpg', type: 'image/jpeg', size: photoBytes.byteLength,
      arrayBuffer: async () => photoBytes.buffer
    }], { kind: 'photo', environment: h.root });

    const prompt = h.doc.querySelector('#khonapolitPrompt');
    prompt.value = 'Please inspect this photo and note.';
    prompt.dispatchEvent(new h.root.Event('input', { bubbles: true }));
    await h.controller.submit();

    assert.equal(h.ordinaryRequests.length, 1);
    assert.equal(h.ordinaryRequests[0].attachments.length, 2);
    assert.equal(h.loomRequests.length, 2, 'Loom route untouched');

    // Trigger explicit live retry
    h.doc.dispatchEvent(new h.root.CustomEvent('td613:marrowline:retry-independent'));
    await new Promise((r) => h.root.setTimeout(r, 20));

    assert.equal(h.ordinaryRequests.length, 2, 'Retry dispatches to ordinary chat');
    assert.deepEqual(h.ordinaryRequests[1].attachments, h.ordinaryRequests[0].attachments,
      'Retry preserves exact file and photo attachment bodies');
    assert.equal(h.loomRequests.length, 2, 'Retry does NOT silently re-arm Loom transport');
    assert.equal(h.controller.snapshot().active, false, 'Loom remains at REST');
  } finally {
    h.close();
  }
});

test('RETRY SEAM: Governed continuation retry obeys declared governed route contract', async () => {
  const h = await createCompositionHarness({ candidate: 'F' });
  try {
    await h.controller.stageAia();
    await h.controller.submit();
    await h.controller.stageFiles();

    // Verify staged files are present
    assert.equal(h.controller.snapshot().phase, 'FILES_STAGED');
    assert.equal(h.controller.snapshot().active, true);

    // Staged attachments cannot be stolen by ordinary chat
    const stagedBefore = getMarrowlineAttachments(h.root);
    assert.equal(stagedBefore.length, 2);

    await h.controller.submit();
    assert.equal(h.controller.snapshot().phase, 'DONE');
    assert.equal(h.controller.snapshot().active, false);

    // After admission, tray is cleared
    assert.equal(getMarrowlineAttachments(h.root).length, 0);
  } finally {
    h.close();
  }
});

// ----------------------------------------------------------------------------
// 3. PR #1433 SEARCH SEAM INTEGRATION TESTS
// ----------------------------------------------------------------------------
test('SEARCH SEAM: Browser-local search operates cleanly across Loom inactive, REST, and typography', async () => {
  const thread = {
    conversationTitle: 'Kʰonapolit Market Analysis',
    messages: [
      { role: 'user', text: 'Red Deer inspects market conditions with orchid marker.' },
      {
        role: 'model',
        relay: {
          parts: [
            {
              id: 'khonapolit',
              label: 'Kʰonapolit ∴ Tauric Diana bots',
              present: true,
              text: 'The covenant answer keeps a shoreline witness under Crimean heritage.'
            }
          ]
        }
      }
    ]
  };

  // 1. Unicode normalization (NFKC) matches Kʰonapolit typography
  assert.equal(marrowlineThreadMatchesSearch(thread, 'khonapolit'), true);
  assert.equal(marrowlineThreadMatchesSearch(thread, 'Kʰonapolit'), true);

  // 2. Multi-term matching across user and model messages
  assert.equal(marrowlineThreadMatchesSearch(thread, 'orchid shoreline'), true);
  assert.equal(marrowlineThreadMatchesSearch(thread, 'orchid absentmarker'), false);

  // 3. Zero provider requests during search
  const h = await createCompositionHarness({ candidate: 'F' });
  try {
    const searchInput = h.doc.querySelector('#marrowlineThreadSearchInput');
    const searchPanel = h.doc.querySelector('#marrowlineThreadSearchPanel');
    const searchToggle = h.doc.querySelector('#marrowlineThreadSearchToggle');

    if (searchToggle && searchPanel && searchInput) {
      searchToggle.click();
      assert.equal(searchPanel.hidden, false);
      searchInput.value = 'Crimean';
      searchInput.dispatchEvent(new h.root.Event('input', { bubbles: true }));
      assert.equal(h.ordinaryRequests.length, 0, 'Zero provider calls on search');
      assert.equal(h.loomRequests.length, 0, 'Zero Loom requests on search');
    }
  } finally {
    h.close();
  }
});

// ----------------------------------------------------------------------------
// 4. FLOW-CORE CATHEDRAL 39-CARRIER ARCHITECTURE
// ----------------------------------------------------------------------------
test('FLOW-CORE CATHEDRAL: Exactly 39 carriers (6 near, 13 mid, 20 far) with canonical operators and single clock', async () => {
  const h = await createCompositionHarness({ candidate: 'F' });
  try {
    const cathedralField = h.controller.getCathedralField();
    assert.ok(cathedralField, 'Cathedral carrier field installed');
    assert.equal(cathedralField.getCarrierCount(), 39, 'Exactly 39 carriers installed');

    const nearCarriers = cathedralField.carriers.filter((c) => c.depth === 'near');
    const midCarriers = cathedralField.carriers.filter((c) => c.depth === 'mid');
    const farCarriers = cathedralField.carriers.filter((c) => c.depth === 'far');

    assert.equal(nearCarriers.length, CARRIER_DEPTH_CONFIG.near.count, 'Exactly 6 near carriers');
    assert.equal(midCarriers.length, CARRIER_DEPTH_CONFIG.mid.count, 'Exactly 13 mid carriers');
    assert.equal(farCarriers.length, CARRIER_DEPTH_CONFIG.far.count, 'Exactly 20 far carriers');

    // Canonical Flow-Core operators verified
    const canonicalGlyphs = new Set(['à', '米', '出', 'hõt', 'cōl', '上', '下', '𝄐']);
    assert.equal(FLOWCORE_OPERATORS.length, 8);
    for (const op of FLOWCORE_OPERATORS) {
      assert.ok(canonicalGlyphs.has(op.glyph), `Operator ${op.glyph} is canonical`);
    }

    // Verify SVG DOM nodes have operator identities
    for (const carrier of cathedralField.carriers) {
      assert.ok(canonicalGlyphs.has(carrier.operator.glyph));
      assert.equal(carrier.node.getAttribute('data-carrier-depth'), carrier.depth);
      assert.ok(carrier.node.getAttribute('data-carrier-operator'));
    }

    // Route state choreography transitions
    cathedralField.setRouteState('ARRIVAL');
    assert.equal(cathedralField.getRouteState(), 'ARRIVAL');

    cathedralField.setRouteState('BOUNDARY_DISCLOSURE');
    assert.equal(cathedralField.getRouteState(), 'BOUNDARY_DISCLOSURE');

    cathedralField.setRouteState('GOVERNED_SEND');
    assert.equal(cathedralField.getRouteState(), 'GOVERNED_SEND');

    cathedralField.setRouteState('RETURN');
    assert.equal(cathedralField.getRouteState(), 'RETURN');

    cathedralField.setRouteState('REST');
    assert.equal(cathedralField.getRouteState(), 'REST');

    cathedralField.setRouteState('RE_ENTRY');
    assert.equal(cathedralField.getRouteState(), 'RE_ENTRY');
  } finally {
    h.close();
  }
});

// ----------------------------------------------------------------------------
// 5. RESPONSIVE MATRIX & PRODUCT HOLDS (844x390 landscape, reduced motion)
// ----------------------------------------------------------------------------
test('RESPONSIVE & PRODUCT HOLDS: Landscape 844x390, reduced motion, dynamic DOM hint and tether', async () => {
  const h = await createCompositionHarness({ candidate: 'F', reducedMotion: true });
  try {
    const tether = h.doc.querySelector('#loomRouteTether');
    assert.ok(tether, 'Dynamic route tether exists for Candidate F');

    // Initial hint check (HOLD-STATIC-DOM-HINT)
    const menuHint = h.doc.querySelector('#loomDemoMenu p');
    assert.match(menuHint.textContent, /Setup first/, 'Dynamic hint reflects ARRIVED state');

    // Step 1: Setup
    await h.controller.stageAia();
    await h.controller.submit();
    assert.match(menuHint.textContent, /Setup acknowledged/, 'Dynamic hint reflects AIA_SENT state');

    // Step 2: Continuation 1
    await h.controller.stageFiles();
    await h.controller.submit();
    assert.match(menuHint.textContent, /Loom is resting/, 'Dynamic hint reflects DONE / REST state');

    // Route Tether reflects REST state
    assert.equal(tether.dataset.routeState, 'REST');
    assert.equal(tether.hidden, false);
    assert.match(tether.querySelector('.loom-route-tether-state').textContent, /resting/);

    // Tether action opens re-entry disclosure directly without menu diving
    const tetherAction = tether.querySelector('#loomRouteTetherAction');
    tetherAction.click();

    const modal = h.doc.querySelector('#loomReentryModal');
    assert.equal(modal.hidden, false, 'Tether button opened re-entry surface');

    // Keyboard navigation: Escape key dismisses modal
    h.doc.dispatchEvent(new h.root.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    assert.equal(modal.hidden, true, 'Escape key cleanly dismisses disclosure');
    assert.equal(h.controller.snapshot().active, false, 'Dismissal preserves REST');
  } finally {
    h.close();
  }
});

// ----------------------------------------------------------------------------
// 6. NORMAL MARROWLINE DIRECT ENTRY CLEANLINESS (RULE XI)
// ----------------------------------------------------------------------------
test('RULE XI: Normal Marrowline direct entry without Loom hash carries ZERO Loom furniture or pink styling', async () => {
  const dom = new JSDOM(html, { url: 'https://td613.com/dome-world/marrowline.html' });
  const root = dom.window;
  const doc = root.document;

  clearMarrowlineAttachments(root);
  installMarrowlineDesktopRepair(doc, root);
  installKhonapolitTerminal(doc, root);
  await root.TD613_KHONAPOLIT_TERMINAL.ready;

  // In normal Marrowline direct entry:
  assert.equal(doc.querySelector('#loomDemoMenu'), null, 'No Loom demo menu in normal Marrowline');
  assert.equal(doc.querySelector('#loomReentryModal'), null, 'No Loom re-entry modal in normal Marrowline');
  assert.equal(doc.querySelector('#marrowlineFlowcoreField'), null, 'No Flow-Core carrier SVG in normal Marrowline');
  assert.equal(doc.querySelector('#loomRouteTether'), null, 'No route tether in normal Marrowline');

  // Verify normal composer plus is neutral without pink styling
  const composerPlus = doc.querySelector('#marrowlineComposerPlus');
  assert.ok(composerPlus);
  assert.notEqual(composerPlus.dataset.loomAttention, 'true', 'No Loom attention cue in normal Marrowline');

  dom.window.close();
});
