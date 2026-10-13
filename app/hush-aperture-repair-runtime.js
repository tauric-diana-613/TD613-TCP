import { evaluateApertureRepairCandidate, HUSH_APERTURE_REPAIR_PASS_VERSION } from './engine/hush-aperture-repair-pass.js';

const VERSION = 'hush-aperture-repair-runtime/v2-contained-status';
const $ = (id, doc = document) => doc.getElementById(id);
const safe = (value = '') => String(value ?? '');
const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const round4 = (value) => Number.isFinite(Number(value)) ? Number(Number(value).toFixed(4)) : 0;

function selectedMaskFromDom(doc = document) {
  const select = $('maskFieldSelect', doc);
  return { id: select?.value || '', label: select?.selectedOptions?.[0]?.textContent || select?.value || '' };
}
function sourceTextFromResult(result = {}, doc = document) {
  return result.outboundPacket?.contract?.sourceText || $('messageDraftInput', doc)?.value || '';
}
function candidatesFromResult(result = {}) {
  return [...asArray(result.patch38Diagnostics?.mergedCandidates), ...asArray(result.candidates)]
    .filter((candidate, index, arr) => candidate?.text && arr.findIndex((other) => (other.id || other.text) === (candidate.id || candidate.text)) === index);
}
function selectedCandidate(result = {}) {
  const id = result.patch38Diagnostics?.selectedCandidateId || result.selectedCandidateId || '';
  return candidatesFromResult(result).find((candidate) => candidate.id === id || candidate.text === result.selectedOutput) || { id, text: result.selectedOutput || '', source: 'selected-output' };
}
function baseCandidateScore(candidate = {}, result = {}) {
  const row = asArray(result.patch38Diagnostics?.selectorRows).find((entry) => entry.id === candidate.id);
  return Number(row?.score ?? candidate.finalScore ?? 0.45);
}
function evaluateRows(result = {}, doc = document) {
  const sourceText = sourceTextFromResult(result, doc);
  const mask = selectedMaskFromDom(doc);
  return candidatesFromResult(result).map((candidate) => {
    const aperture = evaluateApertureRepairCandidate(candidate, sourceText, { mask, phase37Telemetry: result.phase37Telemetry || result.phase35Telemetry || {} });
    return { candidate, aperture, score: round4(baseCandidateScore(candidate, result) + aperture.bonus - aperture.penalty) };
  }).sort((a, b) => b.score - a.score);
}
function publishStatus(message = '', tone = 'warning', doc = document) {
  const status = $('hushGeneratorStatus', doc) || $('acceptWarning', doc);
  if (!status) return;
  status.hidden = false;
  status.dataset.tone = tone;
  status.textContent = message;
}
function publicMessageForSwap() {
  return 'Hush selected a lower-risk candidate and kept the diagnostic receipt internal.';
}
function publicMessageForHold() {
  return 'Hush held the output for review. Open diagnostics for details.';
}
function setOutput(result = {}, candidate = null, row = null, doc = document) {
  const output = $('protectedOutputInput', doc);
  if (!candidate) {
    result.selectedOutput = '';
    result.selectedCandidateId = '';
    if (result.patch38Diagnostics) result.patch38Diagnostics.selectedCandidateId = '';
    if (output) output.value = '';
    return;
  }
  result.selectedOutput = candidate.text || '';
  result.selectedCandidateId = candidate.id || result.selectedCandidateId || '';
  result.apertureRepairSelected = row?.aperture || null;
  if (result.patch38Diagnostics) {
    result.patch38Diagnostics.selectedCandidateId = result.selectedCandidateId;
    result.patch38Diagnostics.selectedApertureRepair = row?.aperture || null;
    result.patch38Diagnostics.apertureRepairRuntimeVersion = VERSION;
  }
  if (output) {
    output.value = result.selectedOutput;
    output.dataset.apertureRepairRuntime = VERSION;
    output.dispatchEvent(new Event('input', { bubbles: true }));
  }
}
function hasOnlyReviewReasons(receipt = {}) {
  return Boolean(!receipt.hardBlocked && asArray(receipt.reviewReasons).length);
}
export function applyApertureHushRepair(result = {}, doc = document) {
  if (!result || result.apertureRepairRuntimeApplied === VERSION) return false;
  const selected = selectedCandidate(result);
  const sourceText = sourceTextFromResult(result, doc);
  const mask = selectedMaskFromDom(doc);
  const selectedAperture = evaluateApertureRepairCandidate(selected, sourceText, { mask, phase37Telemetry: result.phase37Telemetry || result.phase35Telemetry || {} });
  const rows = evaluateRows(result, doc);
  const best = rows.find((row) => !row.aperture.hardBlocked && row.candidate.releasePolicy?.mayPopulateOutput !== false && row.candidate.releasePolicy?.hardBlocked !== true) || null;
  const selectedScore = round4(baseCandidateScore(selected, result) + selectedAperture.bonus - selectedAperture.penalty);
  const shouldSwap = best && (selectedAperture.hardBlocked || best.score > selectedScore + 0.18 || (selectedAperture.penalty > 0.5 && best.aperture.penalty < selectedAperture.penalty));
  result.apertureRepairRuntimeApplied = VERSION;
  result.apertureRepairRuntime = {
    schema: 'td613-hush-aperture-repair-runtime/v1',
    version: VERSION,
    engineVersion: HUSH_APERTURE_REPAIR_PASS_VERSION,
    selectedBefore: { id: selected.id || '', score: selectedScore, aperture: selectedAperture },
    selectedAfter: shouldSwap ? { id: best.candidate.id || '', score: best.score, aperture: best.aperture } : null,
    rows: rows.slice(0, 8).map((row) => ({ id: row.candidate.id || '', score: row.score, penalty: row.aperture.penalty, bonus: row.aperture.bonus, hardBlocked: row.aperture.hardBlocked, warnings: row.aperture.warnings }))
  };
  if (typeof window !== 'undefined') window.__TD613_HUSH_APERTURE_REPAIR_PASS__ = result.apertureRepairRuntime;
  if (shouldSwap) {
    setOutput(result, best.candidate, best, doc);
    publishStatus(publicMessageForSwap(), 'warning', doc);
    try { window.dispatchEvent(new CustomEvent('td613:hush:aperture-repair-pass', { detail: { result, repair: result.apertureRepairRuntime } })); } catch {}
    return true;
  }
  if (hasOnlyReviewReasons(selectedAperture)) {
    if (result.patch38Diagnostics) {
      result.patch38Diagnostics.selectedApertureRepair = selectedAperture;
      result.patch38Diagnostics.apertureRepairRuntimeVersion = VERSION;
    }
    return false;
  }
  if (selectedAperture.hardBlocked && !best) {
    setOutput(result, null, null, doc);
    publishStatus(publicMessageForHold(), 'error', doc);
    try { window.dispatchEvent(new CustomEvent('td613:hush:aperture-repair-pass', { detail: { result, repair: result.apertureRepairRuntime } })); } catch {}
    return true;
  }
  if (result.patch38Diagnostics) {
    result.patch38Diagnostics.selectedApertureRepair = selectedAperture;
    result.patch38Diagnostics.apertureRepairRuntimeVersion = VERSION;
  }
  return false;
}

function schedule(result = null) {
  [0, 80, 240].forEach((delay) => window.setTimeout(() => applyApertureHushRepair(result || window.__TD613_HUSH_PATCH38_LAST_RESULT || {}, document), delay));
}
function boot() {
  if (!document.body || document.body.dataset.pageKind !== 'adversarial-bench') return;
  if (document.body.dataset.hushApertureRepairRuntime === VERSION) return;
  document.body.dataset.hushApertureRepairRuntime = VERSION;
  window.addEventListener('td613:hush:patch38-result', (event) => schedule(event.detail?.result || null));
  window.__TD613_HUSH_APERTURE_REPAIR_RUNTIME__ = { version: VERSION, applyApertureHushRepair };
}
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.setTimeout(boot, 500);
}
