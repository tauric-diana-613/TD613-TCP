const VERSION = 'hush-strict-held-diagnostic-popup/v2-idempotent';
let lastRenderedSignature = '';

function $(id) { return document.getElementById(id); }
function text(value = '') { return String(value ?? '').trim(); }
function arr(value) { return Array.isArray(value) ? value.filter(Boolean) : []; }
function copy(value = {}) { try { return JSON.parse(JSON.stringify(value || {})); } catch { return {}; } }
function hash(value = '') {
  let h = 2166136261;
  String(value || '').split('').forEach((ch) => { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); });
  return (h >>> 0).toString(16).padStart(8, '0');
}
function unique(values = []) { return [...new Set(arr(values).map(text).filter(Boolean))]; }

function copyText(value = '') {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(value);
  const t = document.createElement('textarea');
  t.value = value;
  document.body.appendChild(t);
  t.select();
  document.execCommand('copy');
  t.remove();
  return Promise.resolve();
}

function heldReason(payload = {}) {
  return text(payload.reason || payload.error || payload.message || payload.model || '');
}

function isStrictHeld(payload = {}) {
  const reason = heldReason(payload);
  const warnings = unique(payload.warnings).join(' ');
  return payload.held === true
    || payload.status === 'held'
    || /strict[_-]budgeted[_-]upstream|strict[_-]api[_-]no[_-]usable[_-]candidates|no[_-]local[_-]fallback/i.test(`${reason} ${warnings}`);
}

function summarizeAttempts(payload = {}) {
  return arr(payload.attempts).map((attempt) => ({
    model: text(attempt.model),
    ok: Boolean(attempt.ok),
    status: attempt.status ?? '',
    timedOut: Boolean(attempt.timedOut),
    parsedCandidates: Number(attempt.parsedCandidates || 0),
    usableCandidates: Number(attempt.usableCandidates || 0),
    catchphraseRejected: Number(attempt.catchphraseRejected || 0),
    literalIntegrityRejected: Number(attempt.literalIntegrityRejected || 0),
    aaveAcademicRejected: Number(attempt.aaveAcademicRejected || 0),
    aaveCompressedRejected: Number(attempt.aaveCompressedRejected || 0),
    warnings: unique(attempt.warnings).slice(0, 12),
    error: attempt.error || null,
    textPreview: text(attempt.textPreview).slice(0, 220)
  }));
}

function compactContract(contract = {}) {
  const source = text(contract.sourceText || contract.messageDraftText || '');
  const mask = contract.mask || contract.selectedMask || {};
  const flight = contract.flightPacket || {};
  return {
    promptVersion: text(contract.promptVersion),
    maskId: text(contract.maskId || contract.selectedMaskId || flight.mask_id || mask.id),
    maskLabel: text(flight.mask_label || mask.label || mask.name),
    packetTier: text(contract.packetTier || flight.packetTier || flight.packet_tier),
    maskEvidenceState: text(contract.maskEvidenceState || flight.maskEvidenceState || flight.mask_evidence?.maskEvidenceState),
    sourceHash: source ? hash(source) : '',
    sourceWordCount: (source.match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length,
    protectedLiteralCount: arr(contract.protectedLiterals || flight.protected_literals).length,
    strictNoFallback: contract.strictNoFallback === true || contract.noFallback === true || flight.flight_controls?.no_local_fallback === true,
    strictBudgetedUpstream: contract.strictBudgetedUpstream === true || flight.flight_controls?.strict_budgeted_upstream === true
  };
}

export function buildStrictHeldReceipt(providerLog = {}, outboundPacket = null) {
  const payload = providerLog.payload || providerLog || {};
  const request = payload.requestReceipt || {};
  const contract = outboundPacket?.contract || window.__TD613_HUSH_EXACT_OUTBOUND_PACKET?.contract || {};
  const reason = heldReason(payload) || 'strict provider returned no releasable remote candidate';
  const attempts = summarizeAttempts(payload);
  return {
    schema: 'td613-hush-strict-held-diagnostic-receipt/v1',
    version: VERSION,
    status: 'held',
    reason,
    message: `Strict provider held: ${reason}. No local fallback released.`,
    fallbackReleased: false,
    outputReleased: false,
    provider: text(payload.provider || 'gemini-strict'),
    model: text(payload.model || reason),
    endpoint: text(providerLog.endpoint || window.__TD613_HUSH_PR123_LAST?.endpoint || ''),
    httpStatus: providerLog.httpStatus ?? window.__TD613_HUSH_PR123_LAST?.httpStatus ?? null,
    warnings: unique(payload.warnings || []),
    requestReceipt: {
      strictDirect: request.strictDirect === true,
      strictNoFallback: true,
      strictBudgetedUpstream: request.strictBudgetedUpstream === true || /strict_budgeted/.test(reason),
      strictBudgetHonored: request.strictBudgetHonored === true,
      strictFastUpstream: request.strictFastUpstream === true,
      strictUpstreamBudgetMs: request.strictUpstreamBudgetMs || '',
      strictAttemptBudget: request.strictAttemptBudget || '',
      elapsedMs: request.elapsedMs || '',
      modelOrder: request.modelOrder || attempts.map((attempt) => attempt.model),
      aaveRoute: request.aaveRoute === true,
      rotationVersion: request.rotationVersion || payload.rotationVersion || payload.version || ''
    },
    contractSummary: compactContract(contract),
    attemptSummary: attempts,
    diagnosticCopyTargets: {
      shortReceipt: 'window.__TD613_HUSH_NO_FALLBACK_RECEIPT',
      fullDebug: 'window.__TD613_HUSH_FULL_DEBUG_PACKET',
      providerLog: 'window.__TD613_HUSH_EXACT_PROVIDER_LOG',
      outboundPacket: 'window.__TD613_HUSH_EXACT_OUTBOUND_PACKET'
    },
    nextStep: attempts.length ? 'Inspect rejected attempt counts, revise mask/source pressure, then Transform again.' : 'Provider returned no usable attempt details. Retry after checking provider status and selected mask pressure.',
    createdAt: new Date().toISOString()
  };
}

function receiptSignature(receipt = {}) {
  return [receipt.schema, receipt.reason, receipt.endpoint, receipt.httpStatus, receipt.contractSummary?.maskId, arr(receipt.attemptSummary).map((attempt) => `${attempt.model}:${attempt.status}:${attempt.usableCandidates}:${attempt.literalIntegrityRejected}:${attempt.catchphraseRejected}`).join('|')].map(text).join('::');
}

function safePopupReceipt(receipt = {}) {
  const safe = copy(receipt);
  safe.attemptSummary = arr(safe.attemptSummary).slice(0, 4);
  return safe;
}

function ensureCss() {
  if ($('hushStrictHeldPopupStyle')) return;
  const s = document.createElement('style');
  s.id = 'hushStrictHeldPopupStyle';
  s.textContent = '.hush-receipt-pop{position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:2147483000;max-height:48vh;border:1px solid rgba(255,122,122,.68);border-radius:18px;background:rgba(13,8,10,.97);box-shadow:0 18px 54px rgba(0,0,0,.55);color:#fff7f7;overflow:hidden}.hush-receipt-pop-head{display:flex;align-items:center;justify-content:space-between;gap:.75rem;padding:.72rem .82rem;border-bottom:1px solid rgba(255,255,255,.12)}.hush-receipt-pop-title{font-weight:900;letter-spacing:.08em;text-transform:uppercase;font-size:.72rem}.hush-receipt-pop-actions{display:flex;gap:.45rem;flex-wrap:wrap}.hush-receipt-pop-btn{border:1px solid rgba(255,122,122,.7);border-radius:999px;padding:.42rem .68rem;background:rgba(255,122,122,.16);color:#fff;font-weight:850;font-size:.72rem}.hush-receipt-pop-body{max-height:32vh;overflow:auto;-webkit-overflow-scrolling:touch;padding:.78rem .85rem}.hush-receipt-pop-body pre{margin:0;white-space:pre-wrap;font-size:.72rem;line-height:1.35}.hush-receipt-pop-note{padding:.55rem .85rem;border-top:1px solid rgba(255,255,255,.08);font-size:.72rem;color:rgba(255,245,245,.78)}';
  document.head.appendChild(s);
}

export function renderStrictHeldPopup(receipt = {}) {
  ensureCss();
  const signature = receiptSignature(receipt);
  const old = $('hushReceiptPopup');
  if (old && old.dataset.strictHeldSignature === signature) return true;
  if (old) old.remove();
  const box = document.createElement('section');
  box.id = 'hushReceiptPopup';
  box.className = 'hush-receipt-pop';
  box.dataset.strictHeldSignature = signature;
  box.innerHTML = '<div class="hush-receipt-pop-head"><div class="hush-receipt-pop-title">Strict held receipt</div><div class="hush-receipt-pop-actions"><button id="hushStrictHeldCopy" class="hush-receipt-pop-btn" type="button">Copy</button><button id="hushStrictHeldFull" class="hush-receipt-pop-btn" type="button">Full</button><button id="hushStrictHeldClose" class="hush-receipt-pop-btn" type="button">Close</button></div></div><div class="hush-receipt-pop-body"><pre></pre></div><div class="hush-receipt-pop-note">Failure mode: strict provider held. No local fallback released. Full debug stays in window.__TD613_HUSH_FULL_DEBUG_PACKET.</div>';
  box.querySelector('pre').textContent = JSON.stringify(safePopupReceipt(receipt), null, 2);
  document.body.appendChild(box);
  $('hushStrictHeldCopy').onclick = () => copyText(JSON.stringify(window.__TD613_HUSH_NO_FALLBACK_RECEIPT || receipt || {}, null, 2));
  $('hushStrictHeldFull').onclick = () => copyText(JSON.stringify(window.__TD613_HUSH_FULL_DEBUG_PACKET || window.__TD613_HUSH_EXACT_PROVIDER_LOG || receipt || {}, null, 2));
  $('hushStrictHeldClose').onclick = () => box.remove();
  return true;
}

function publishReceipt(receipt, providerLog = null) {
  const signature = receiptSignature(receipt);
  window.__TD613_HUSH_NO_FALLBACK_RECEIPT = receipt;
  window.__TD613_HUSH_FULL_DEBUG_PACKET = {
    schema: 'td613-hush-strict-held-full-debug/v1',
    receipt,
    providerLog: providerLog || window.__TD613_HUSH_EXACT_PROVIDER_LOG || null,
    outboundPacket: window.__TD613_HUSH_EXACT_OUTBOUND_PACKET || null,
    lastStrictBridge: window.__TD613_HUSH_PR123_LAST || null
  };
  const warning = $('acceptWarning');
  if (warning) {
    warning.hidden = false;
    warning.textContent = `${receipt.message} Receipt ready.`;
  }
  const status = $('hushGeneratorStatus') || $('hushStrictProviderStatus') || $('hushOutputStatusText');
  if (status) {
    status.dataset.tone = 'error';
    status.textContent = `${receipt.message} Receipt ready.`;
  }
  renderStrictHeldPopup(receipt);
  if (lastRenderedSignature !== signature) {
    lastRenderedSignature = signature;
    try { window.dispatchEvent(new CustomEvent('td613:hush:strict-held-receipt', { detail: { receipt } })); } catch {}
  }
}

export function inspectStrictHeld(providerLog = null) {
  const log = providerLog || window.__TD613_HUSH_EXACT_PROVIDER_LOG || null;
  const payload = log?.payload || window.__TD613_HUSH_PR123_LAST?.payload || window.__TD613_HUSH_NO_FALLBACK_RECEIPT || null;
  if (!payload || !isStrictHeld(payload)) return false;
  const receipt = payload.schema === 'td613-hush-strict-held-diagnostic-receipt/v1'
    ? payload
    : buildStrictHeldReceipt(log || payload, window.__TD613_HUSH_EXACT_OUTBOUND_PACKET || null);
  publishReceipt(receipt, log);
  return true;
}

function schedule() {
  [0, 80, 220, 520, 1100].forEach((delay) => window.setTimeout(() => inspectStrictHeld(), delay));
}

function boot() {
  if (!document.body || document.body.dataset.pageKind !== 'adversarial-bench') return;
  if (document.body.dataset.hushStrictHeldDiagnosticPopup === VERSION) return;
  document.body.dataset.hushStrictHeldDiagnosticPopup = VERSION;
  window.addEventListener('td613:hush:provider-log', (event) => {
    const log = event.detail?.providerLog || null;
    if (!inspectStrictHeld(log)) schedule();
  });
  document.addEventListener('click', (event) => {
    if (event.target?.closest?.('#generateMaskedOutputBtn')) schedule();
  }, true);
  if (window.MutationObserver) new MutationObserver(() => inspectStrictHeld()).observe(document.body, { childList: true, subtree: true, characterData: true });
  window.__TD613_HUSH_STRICT_HELD_DIAGNOSTIC_POPUP__ = { version: VERSION, inspectStrictHeld, buildStrictHeldReceipt, renderStrictHeldPopup };
  schedule();
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.setTimeout(boot, 500);
}
