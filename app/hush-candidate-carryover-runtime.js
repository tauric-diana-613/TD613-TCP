const VERSION = 'hush-candidate-carryover-runtime/v1';
const $ = (id, doc = document) => doc.getElementById(id);
const arr = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const carry = (c = {}) => num(c.sourceResidueScore?.sourceResidueRisk ?? c.sourceResidue?.metrics?.cadenceBodyRisk ?? c.match?.sourceResidualRisk ?? c.escapeVector?.scores?.sourceResidualRisk, 1);
const sem = (c = {}) => num(c.escapeVector?.scores?.semanticFidelity ?? c.match?.semanticFidelity ?? c.payloadIntegrity?.score, 0);
function selected(result = {}) {
  const id = result.patch38Diagnostics?.selectedCandidateId || result.selectedCandidateId || '';
  return arr(result.candidates).find((c) => c.id === id || c.text === result.selectedOutput) || null;
}
function ok(c = {}) {
  return Boolean(c.text && c.releasePolicy?.hardBlocked !== true && c.releasePolicy?.mayPopulateOutput !== false && c.payloadIntegrity?.passed !== false && sem(c) >= 0.72);
}
function replacement(result = {}) {
  const current = selected(result);
  if (!current) return null;
  const currentCarry = carry(current);
  const currentSem = sem(current);
  return arr(result.candidates)
    .filter(ok)
    .sort((a, b) => {
      const c = carry(a) - carry(b);
      if (Math.abs(c) > 0.035) return c;
      const s = sem(b) - sem(a);
      if (Math.abs(s) > 0.04) return s;
      return num(b.finalScore) - num(a.finalScore);
    })
    .find((c) => carry(c) <= currentCarry - 0.09 && sem(c) >= Math.max(0.72, currentSem - 0.08)) || null;
}
export function applyCarryoverSelection(result = {}, doc = document) {
  if (!result || result.carryoverSelectionRuntime === VERSION) return false;
  const before = selected(result);
  const next = replacement(result);
  result.carryoverSelectionRuntime = VERSION;
  result.carryoverSelectionReceipt = { version: VERSION, applied: Boolean(next), before: before ? { id: before.id || '', carry: carry(before), semantic: sem(before) } : null, after: next ? { id: next.id || '', carry: carry(next), semantic: sem(next) } : null };
  if (!next) return false;
  result.selectedCandidateId = next.id || result.selectedCandidateId || '';
  result.selectedOutput = next.text || '';
  result.sourceResidue = next.sourceResidue || result.sourceResidue || null;
  result.sourceResidueScore = next.sourceResidueScore || result.sourceResidueScore || null;
  result.sourceResidueSummary = next.sourceResidueSummary || result.sourceResidueSummary || null;
  result.escapeVector = next.escapeVector || result.escapeVector || null;
  result.match = next.match || result.match || null;
  if (result.patch38Diagnostics) {
    result.patch38Diagnostics.selectedCandidateId = result.selectedCandidateId;
    result.patch38Diagnostics.carryoverSelectionReceipt = result.carryoverSelectionReceipt;
  }
  const output = $('protectedOutputInput', doc);
  if (output) {
    output.value = result.selectedOutput;
    output.dataset.carryoverSelectionRuntime = VERSION;
    output.dispatchEvent(new Event('input', { bubbles: true }));
  }
  try { window.dispatchEvent(new CustomEvent('td613:hush:carryover-selection', { detail: { result, receipt: result.carryoverSelectionReceipt } })); } catch {}
  return true;
}
function schedule(result = null) { [30, 120, 420].forEach((delay) => window.setTimeout(() => applyCarryoverSelection(result || window.__TD613_HUSH_PATCH38_LAST_RESULT || {}, document), delay)); }
function boot() {
  if (!document.body || document.body.dataset.pageKind !== 'adversarial-bench') return;
  if (document.body.dataset.hushCarryoverSelectionRuntime === VERSION) return;
  document.body.dataset.hushCarryoverSelectionRuntime = VERSION;
  window.addEventListener('td613:hush:patch38-result', (event) => schedule(event.detail?.result || null));
  window.addEventListener('td613:hush:aperture-repair-pass', (event) => schedule(event.detail?.result || null));
  window.__TD613_HUSH_CARRYOVER_SELECTION_RUNTIME__ = { version: VERSION, applyCarryoverSelection, replacement };
}
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.setTimeout(boot, 500);
}
