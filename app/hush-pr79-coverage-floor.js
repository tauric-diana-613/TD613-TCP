import { deriveApertureApprovalTransparency } from './engine/aperture-approval-transparency.js';

export const HUSH_PR79_COVERAGE_FLOOR_VERSION = 'pr79.3-observer-only-no-pending-loop';

const $ = (id, doc = document) => doc.getElementById(id);
const clean = (value) => String(value ?? '').trim();

function setStatus(message = '', doc = document, tone = 'info') {
  const status = $('hushGeneratorStatus', doc);
  if (status) {
    status.dataset.tone = tone;
    status.textContent = message;
  }
}

function currentPatch38Result() {
  return window.__TD613_HUSH_PATCH38_LAST_RESULT || null;
}

function currentReleaseHeld(result = currentPatch38Result()) {
  return Boolean(
    result?.releasePolicy?.hardBlocked ||
    result?.releasePolicy?.state === 'hold' ||
    result?.releaseSummary?.status === 'hold' ||
    result?.pr106ReleaseGuard?.blocked
  );
}

function buildCoverageFloorPacket({ input = '', output = '', result = null } = {}) {
  const sourceChars = clean(input).length;
  const outputChars = clean(output).length;
  const diagnostics = result?.patch38Diagnostics || {};
  return {
    routeState: currentReleaseHeld(result) ? 'coverage_floor_held_by_release_guard' : 'coverage_floor_observer',
    sealStatus: currentReleaseHeld(result) ? 'blocked' : outputChars ? 'available' : 'quiet',
    selectedCandidate: result?.selectedCandidateId || diagnostics.selectedCandidateId || null,
    hardStops: currentReleaseHeld(result) ? (result?.releaseSummary?.warnings || result?.warnings || []) : [],
    humanReclosure: {
      required: currentReleaseHeld(result),
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

function inspectCoverageFloor(doc = document) {
  const input = $('messageDraftInput', doc);
  const output = $('protectedOutputInput', doc);
  const result = currentPatch38Result();
  if (!input || !output) return;
  const approvalPacket = buildCoverageFloorPacket({ input: input.value, output: output.value, result });
  const transparency = deriveApertureApprovalTransparency(approvalPacket);
  window.__TD613_HUSH_COVERAGE_FLOOR__ = {
    version: HUSH_PR79_COVERAGE_FLOOR_VERSION,
    inspectedAt: new Date().toISOString(),
    sourceChars: approvalPacket.sourceChars,
    outputChars: approvalPacket.outputChars,
    selectedCandidate: approvalPacket.selectedCandidate,
    approvalStatus: transparency.approvalStatus,
    approvalReason: transparency.approvalReason,
    approvalDiagnostics: transparency.approvalDiagnostics,
    observerOnly: true
  };
  if (!clean(output.value) && currentReleaseHeld(result)) {
    const blockers = result?.releaseSummary?.warnings || result?.warnings || transparency?.approvalDiagnostics?.blockers || [];
    setStatus(`Release held by generator guard. ${blockers.slice(0, 6).join(' | ') || 'Inspect PR106/Patch38 diagnostics.'}`, doc, 'error');
  }
}

function bind(doc = document) {
  if (!doc?.body || doc.body.dataset.pageKind !== 'adversarial-bench' || doc.body.dataset.hushPr79 === HUSH_PR79_COVERAGE_FLOOR_VERSION) return;
  doc.body.dataset.hushPr79 = HUSH_PR79_COVERAGE_FLOOR_VERSION;
  window.addEventListener('td613:hush:patch38-result', () => inspectCoverageFloor(doc));
  window.addEventListener('td613:hush:patch38-approval', () => inspectCoverageFloor(doc));
  window.TD613_HUSH_PR79 = {
    version: HUSH_PR79_COVERAGE_FLOOR_VERSION,
    mode: 'observer-only',
    inspectCoverageFloor: () => inspectCoverageFloor(doc)
  };
}

if (typeof document !== 'undefined') {
  const run = () => bind(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  [240, 900, 1800].forEach((delay) => window.setTimeout(run, delay));
}