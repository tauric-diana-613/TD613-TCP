import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { JSDOM } from 'jsdom';

const root = process.cwd();
const bridge = readFileSync(join(root, 'app/hush-compare-layout-custody.js'), 'utf8');
const moduleSource = readFileSync(join(root, 'app/hush-strict-held-diagnostic-popup.js'), 'utf8');

assert.match(bridge, /hush-strict-held-diagnostic-popup\.js\?v=202607021640/);
assert.match(moduleSource, /td613-hush-strict-held-diagnostic-receipt\/v1/);
assert.match(moduleSource, /Strict held receipt/);
assert.match(moduleSource, /window\.__TD613_HUSH_FULL_DEBUG_PACKET/);
assert.match(moduleSource, /td613:hush:provider-log/);
assert.doesNotMatch(moduleSource, /new\s+MutationObserver/);

const dom = new JSDOM('<!doctype html><html><head></head><body><div id="hushOutputStatusText"></div><div id="acceptWarning" hidden></div></body></html>', { url: 'https://td613.test/adversarial-bench.html', pretendToBeVisual: true });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.CustomEvent = dom.window.CustomEvent;
globalThis.Event = dom.window.Event;
Object.defineProperty(globalThis, 'navigator', { value: { clipboard: { writeText: async () => undefined } }, configurable: true });
window.__TD613_HUSH_EXACT_OUTBOUND_PACKET = {
  contract: {
    promptVersion: 'hush-strict-provider-bridge-current/v9',
    sourceText: 'Source text with FILE-72 and a mask-specific pressure seam.',
    maskId: 'luz-index',
    selectedMask: { id: 'luz-index', label: 'Luz of the Index' },
    protectedLiterals: ['FILE-72'],
    strictNoFallback: true,
    strictBudgetedUpstream: true,
    flightPacket: { packet_tier: 'strict_remote_mask_evidence_packet', mask_label: 'Luz of the Index' }
  }
};

const popup = await import(`../app/hush-strict-held-diagnostic-popup.js?test=${Date.now()}`);
const providerLog = {
  schema: 'td613-hush-provider-log/v1',
  endpoint: '/api/hush-generate-strict',
  httpStatus: 504,
  payload: {
    ok: false,
    status: 'held',
    held: true,
    provider: 'gemini-strict',
    model: 'strict_budgeted_upstream_no_releasable_candidate',
    reason: 'strict_budgeted_upstream_no_releasable_candidate',
    error: 'strict_budgeted_upstream_no_releasable_candidate',
    warnings: ['strict-budgeted-upstream', 'strict-api-no-usable-candidates', 'no-local-fallback'],
    attempts: [{ model: 'gemini-2.5-flash-lite', ok: true, status: 200, parsedCandidates: 2, usableCandidates: 0, literalIntegrityRejected: 1, catchphraseRejected: 1, warnings: ['candidate-integrity-gate-rejected'], textPreview: 'candidate preview' }],
    requestReceipt: { strictNoFallback: true, strictBudgetedUpstream: true, strictBudgetHonored: true, strictAttemptBudget: 2, elapsedMs: 9130, modelOrder: ['gemini-2.5-flash-lite'] }
  }
};

const receipt = popup.buildStrictHeldReceipt(providerLog, window.__TD613_HUSH_EXACT_OUTBOUND_PACKET);
assert.equal(receipt.schema, 'td613-hush-strict-held-diagnostic-receipt/v1');
assert.equal(receipt.status, 'held');
assert.equal(receipt.reason, 'strict_budgeted_upstream_no_releasable_candidate');
assert.equal(receipt.fallbackReleased, false);
assert.equal(receipt.outputReleased, false);
assert.equal(receipt.contractSummary.maskId, 'luz-index');
assert.equal(receipt.contractSummary.protectedLiteralCount, 1);
assert.equal(receipt.attemptSummary[0].usableCandidates, 0);
assert.equal(receipt.attemptSummary[0].literalIntegrityRejected, 1);
assert.equal(receipt.requestReceipt.strictBudgetedUpstream, true);

assert.equal(popup.inspectStrictHeld(providerLog), true);
const rendered = document.getElementById('hushReceiptPopup');
assert.ok(rendered);
assert.match(rendered.textContent, /Strict held receipt/);
assert.match(rendered.textContent, /strict_budgeted_upstream_no_releasable_candidate/);
assert.equal(window.__TD613_HUSH_NO_FALLBACK_RECEIPT.reason, 'strict_budgeted_upstream_no_releasable_candidate');
assert.equal(window.__TD613_HUSH_FULL_DEBUG_PACKET.receipt.reason, 'strict_budgeted_upstream_no_releasable_candidate');
assert.equal(document.getElementById('acceptWarning').hidden, false);
assert.match(document.getElementById('hushOutputStatusText').textContent, /Receipt ready/);

const firstPopup = document.getElementById('hushReceiptPopup');
const firstStatus = document.getElementById('hushOutputStatusText').textContent;
assert.equal(popup.inspectStrictHeld(providerLog), true);
assert.strictEqual(document.getElementById('hushReceiptPopup'), firstPopup);
assert.equal(document.getElementById('hushOutputStatusText').textContent, firstStatus);

const successLog = {
  schema: 'td613-hush-provider-log/v1',
  endpoint: '/api/hush-generate-strict',
  httpStatus: 200,
  payload: {
    ok: true,
    provider: 'gemini',
    model: 'gemini-flash-lite-latest',
    warnings: ['prompt-detox-active', 'strict-budgeted-upstream', 'strict-upstream-budget-honored', 'strict-normal-upstream-budget-applied'],
    candidates: [{ text: 'Remote candidate released for review.' }, { text: 'Second remote candidate.' }],
    attempts: [
      { model: 'gemini-2.5-flash-lite', ok: false, status: 503, parsedCandidates: 0, usableCandidates: 0, warnings: ['provider-returned-invalid-json'], error: { code: 503, status: 'UNAVAILABLE' } },
      { model: 'gemini-flash-lite-latest', ok: true, status: 200, parsedCandidates: 2, usableCandidates: 2, warnings: ['prompt-detox-active'], error: null }
    ],
    requestReceipt: { strictNoFallback: true, strictBudgetedUpstream: true, strictBudgetHonored: true }
  }
};

document.getElementById('hushReceiptPopup').remove();
window.__TD613_HUSH_NO_FALLBACK_RECEIPT = null;
window.__TD613_HUSH_FULL_DEBUG_PACKET = null;
document.getElementById('acceptWarning').hidden = true;
document.getElementById('hushOutputStatusText').textContent = '';
assert.equal(popup.inspectStrictHeld(successLog), false);
assert.equal(document.getElementById('hushReceiptPopup'), null);
assert.equal(window.__TD613_HUSH_NO_FALLBACK_RECEIPT, null);
assert.equal(window.__TD613_HUSH_FULL_DEBUG_PACKET, null);
assert.equal(document.getElementById('acceptWarning').hidden, true);

console.log('hush-strict-held-diagnostic-popup: ok');
