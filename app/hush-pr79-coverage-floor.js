import { deriveApertureApprovalTransparency } from './engine/aperture-approval-transparency.js';

export const HUSH_PR79_COVERAGE_FLOOR_VERSION = 'pr79.2-deferred-coverage-floor-no-premature-output';

const $ = (id, doc = document) => doc.getElementById(id);
const clean = (value) => String(value ?? '').trim();

function setStatus(message = '', doc = document, tone = 'info') {
  const status = $('hushGeneratorStatus', doc);
  if (status) {
    status.dataset.tone = tone;
    status.textContent = message;
  }
}

function setWarning(message = '', doc = document) {
  const warning = $('acceptWarning', doc);
  if (warning) {
    warning.hidden = !message;
    warning.textContent = message;
  }
  const accept = $('acceptOutputBtn', doc);
  if (accept && message) accept.disabled = true;
}

function buildCoverageFloorPacket({ input = '', output = '' } = {}) {
  const sourceChars = clean(input).length;
  const outputChars = clean(output).length;
  return {
    routeState: 'coverage_floor_deferred',
    sealStatus: 'pending',
    selectedCandidate: null,
    hardStops: [],
    humanReclosure: {
      required: false,
      confirmed: false,
      rejected_routes_visible: true
    },
    consentStatus: 'confirmed',
    claimCeiling: 'structural',
    sourceContext: 'hush_adversarial_bench',
    sourceChars,
    outputChars
  };
}

function formatCoverageFloorMessage(transparency) {
  const blockers = transparency?.approvalDiagnostics?.blockers || [];
  const visibleReason = blockers.length ? blockers.join(' | ') : transparency?.approvalReason || 'generation still pending';
  return `Generation is still pending — output remains blank until Hush receives an approved candidate. ${visibleReason}`;
}

function isTransformPending(doc = document) {
  const pending = window.__TD613_HUSH_TRANSFORM_PENDING__;
  if (!pending?.startedAt) return false;
  const output = $('protectedOutputInput', doc);
  if (output && clean(output.value)) return false;
  return Date.now() - Number(pending.startedAt) < 30000;
}

function markPending(doc = document) {
  window.__TD613_HUSH_TRANSFORM_PENDING__ = {
    version: HUSH_PR79_COVERAGE_FLOOR_VERSION,
    startedAt: Date.now()
  };
  const output = $('protectedOutputInput', doc);
  if (output) {
    output.value = '';
    output.dispatchEvent(new Event('input', { bubbles: true }));
  }
  setWarning('', doc);
  setStatus('Generating mask output…', doc, 'info');
}

function maybeReportDeferredCoverage(doc = document) {
  const input = $('messageDraftInput', doc);
  const output = $('protectedOutputInput', doc);
  if (!input || !output || clean(output.value)) return;
  if (isTransformPending(doc)) {
    setStatus('Generating mask output…', doc, 'info');
    setWarning('', doc);
    return;
  }
  const approvalPacket = buildCoverageFloorPacket({ input: input.value, output: output.value });
  const transparency = deriveApertureApprovalTransparency(approvalPacket);
  setStatus(formatCoverageFloorMessage(transparency), doc, 'info');
  setWarning('', doc);
  window.__TD613_HUSH_COVERAGE_FLOOR__ = {
    version: HUSH_PR79_COVERAGE_FLOOR_VERSION,
    deferredAt: new Date().toISOString(),
    sourceChars: approvalPacket.sourceChars,
    outputChars: approvalPacket.outputChars,
    approvalStatus: transparency.approvalStatus,
    approvalReason: transparency.approvalReason,
    approvalDiagnostics: transparency.approvalDiagnostics
  };
}

function bind(doc = document) {
  if (!doc?.body || doc.body.dataset.pageKind !== 'adversarial-bench' || doc.body.dataset.hushPr79 === 'true') return;
  doc.body.dataset.hushPr79 = 'true';
  const transform = $('generateMaskedOutputBtn', doc);
  if (!transform) return;
  transform.addEventListener('click', () => {
    markPending(doc);
    [1200, 3200, 7000, 12000, 20000, 31000].forEach((delay) => window.setTimeout(() => maybeReportDeferredCoverage(doc), delay));
  }, true);
  const output = $('protectedOutputInput', doc);
  if (output) {
    output.addEventListener('input', () => {
      if (clean(output.value)) window.__TD613_HUSH_TRANSFORM_PENDING__ = null;
    }, true);
  }
}

if (typeof document !== 'undefined') {
  const run = () => bind(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  [240, 900, 1800].forEach((delay) => window.setTimeout(run, delay));
}
