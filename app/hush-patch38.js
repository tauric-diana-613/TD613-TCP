import * as bench from './adversarial-bench.mjs';
import { buildHushSwap, HUSH_SWAP_PATCH38_VERSION } from './engine/hush-swap-patch38.js';
import { GENERATOR_MODES, normalizeRemoteProviderResponse } from './engine/hush-generator-provider.js';
import { buildHushLlmPromptContractV2, buildPhase35ProviderTelemetry } from './engine/hush-generator-provider-phase35.js';
import { auditPropositionIntegrity } from './engine/hush-proposition-integrity.js';
import { deriveApertureApprovalTransparency } from './engine/aperture-approval-transparency.js';

const $ = (id, doc = document) => doc.getElementById(id);
const text = (value) => String(value ?? '').trim();
const esc = (value = '') => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const PRODUCTION_HUSH_API_ENDPOINT = 'https://td613.vercel.app/api/hush-generate';
const DEFAULT_GENERATOR_MODE = GENERATOR_MODES.REMOTE_LLM_PROXY;

function selectedMask(state = bench.benchState || {}) {
  const masks = [...(state.hushMasks || []), ...(state.customMasks || [])];
  return masks.find((mask) => mask.id === state.selectedHushMaskId) || state.selectedHushMask || masks[0] || null;
}

function activeField(state = bench.benchState || {}) {
  const mask = selectedMask(state) || {};
  return state.profiles?.maskReference || mask.profile || {};
}

function ensureGeneratorStatus(doc = document) {
  let status = $('hushGeneratorStatus', doc);
  if (status) return status;
  const host = $('hushGeneratorModeWrap', doc) || $('hushGateStrip', doc)?.parentElement || $('generateMaskedOutputBtn', doc)?.closest('.hush-transform-gate') || $('hushBuiltInMaskPanel', doc) || null;
  if (!host) return null;
  status = doc.createElement('div');
  status.id = 'hushGeneratorStatus';
  status.className = 'hush-warning-panel hush-generator-status';
  status.setAttribute('aria-live', 'polite');
  status.textContent = 'Generator mode ready.';
  host.appendChild(status);
  return status;
}

function setGeneratorStatus(message = '', tone = 'info', doc = document) {
  const status = ensureGeneratorStatus(doc);
  if (!status) return;
  status.dataset.tone = tone;
  status.textContent = message || 'Generator mode ready.';
}

function generatorModeLabel(mode = '') {
  if (mode === GENERATOR_MODES.REMOTE_LLM_PROXY) return 'Remote LLM Candidate';
  if (mode === GENERATOR_MODES.HYBRID) return 'Hybrid fallback';
  if (mode === GENERATOR_MODES.OFFLINE_EXPRESSIVE) return 'Offline Expressive';
  return mode || 'Generator';
}

function configureGeneratorSelect(select, doc = document) {
  if (!select) return null;
  if (select.dataset.patch38Configured !== 'true') {
    select.dataset.patch38Configured = 'true';
    select.addEventListener('change', () => {
      select.dataset.operatorTouched = 'true';
      setGeneratorStatus(`Generator mode selected: ${generatorModeLabel(select.value)}.`, 'info', doc);
    });
  }
  if (select.dataset.operatorTouched !== 'true') {
    select.value = DEFAULT_GENERATOR_MODE;
    setGeneratorStatus('Generator mode preset: Remote LLM Candidate. Hybrid and local modes remain available manually.', 'info', doc);
  }
  return select;
}

function installGeneratorMode(doc = document) {
  const existing = $('hushGeneratorMode', doc);
  if (existing) {
    ensureGeneratorStatus(doc);
    return configureGeneratorSelect(existing, doc);
  }

  const host = $('hushGateStrip', doc)?.parentElement
    || $('generateMaskedOutputBtn', doc)?.closest('.hush-transform-gate')
    || $('hushBuiltInMaskPanel', doc)
    || $('maskFieldSelect', doc)?.parentElement
    || $('recognitionIntentMode', doc)?.closest('.recognition-field-controls')
    || null;
  if (!host) return null;

  const label = doc.createElement('label');
  label.id = 'hushGeneratorModeWrap';
  label.className = 'hush-field-shell hush-generator-mode-wrap';
  label.setAttribute('for', 'hushGeneratorMode');
  label.innerHTML = '<span class="hush-field-label">Generator Mode</span><select id="hushGeneratorMode"><option value="offline-expressive">Offline Expressive</option><option value="hybrid">Hybrid fallback</option><option value="remote-llm-proxy" selected>Remote LLM Candidate</option></select><span class="hush-field-caption">Remote LLM is the default flight route. Hybrid and local modes remain available if provider review fails.</span>';

  const gateStrip = $('hushGateStrip', doc);
  if (gateStrip?.parentElement === host) host.insertBefore(label, gateStrip);
  else host.appendChild(label);

  const status = doc.createElement('div');
  status.id = 'hushGeneratorStatus';
  status.className = 'hush-warning-panel hush-generator-status';
  status.setAttribute('aria-live', 'polite');
  status.textContent = 'Generator mode preset: Remote LLM Candidate. Hybrid and local modes remain available manually.';
  label.insertAdjacentElement('afterend', status);
  return configureGeneratorSelect($('hushGeneratorMode', doc), doc);
}

function configuredRemoteEndpoint() {
  if (typeof window === 'undefined') return '';
  const direct = window.TD613_HUSH_API_ENDPOINT || window.__TD613_HUSH_API_ENDPOINT__ || '';
  const stored = (() => {
    try { return window.localStorage?.getItem('td613:hush-api-endpoint') || ''; }
    catch { return ''; }
  })();
  return text(direct || stored);
}

function remoteEndpointCandidates() {
  const loc = typeof window !== 'undefined' ? window.location : null;
  const origin = loc?.origin || '';
  const pathname = loc?.pathname || '';
  const pageDir = pathname.endsWith('/') ? pathname : pathname.replace(/\/[^/]*$/, '/');
  const candidates = [];
  const configured = configuredRemoteEndpoint();
  if (configured) candidates.push(configured);
  if (origin) candidates.push(`${origin}/api/hush-generate`);
  candidates.push(PRODUCTION_HUSH_API_ENDPOINT);
  if (pageDir && pageDir !== '/') candidates.push(`${pageDir}api/hush-generate`);
  if (pathname.startsWith('/app/')) candidates.push('/app/api/hush-generate');
  candidates.push('/api/hush-generate');
  candidates.push('./api/hush-generate');
  return [...new Set(candidates.filter(Boolean))];
}

async function fetchRemoteReport(input = {}, doc = document) {
  const contract = buildHushLlmPromptContractV2(input);
  const tried = [];
  for (const endpoint of remoteEndpointCandidates()) {
    try {
      const response = await fetch(endpoint, { method: 'POST', mode: 'cors', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ contract }) });
      tried.push(`${endpoint}:${response.status}`);
      if (response.status === 404) continue;
      if (!response.ok) {
        const warning = `remote-provider-http-${response.status}`;
        setGeneratorStatus(`Remote provider reached ${endpoint} but returned ${response.status}; switch to Hybrid if you need local fallback.`, 'warning', doc);
        return { provider: 'remote-llm-proxy', model: 'remote-llm-proxy', candidates: [], warnings: [warning, `endpoint:${endpoint}`], requestReceipt: { endpoint, triedEndpoints: tried, sentPrivateLedger: false, sentMaskMemory: false, redactionApplied: true, promptVersion: contract.promptVersion } };
      }
      const normalized = normalizeRemoteProviderResponse(await response.json(), contract);
      normalized.requestReceipt = { ...(normalized.requestReceipt || {}), endpoint, triedEndpoints: tried };
      if (!normalized.candidates?.length) {
        normalized.warnings = [...new Set([...(normalized.warnings || []), 'remote-provider-empty-candidates', `endpoint:${endpoint}`])];
        setGeneratorStatus(`Remote provider reached ${endpoint} but returned zero usable candidates. Switch to Hybrid if you want local fallback.`, 'warning', doc);
      } else {
        setGeneratorStatus(`Remote provider reached ${endpoint} and returned ${normalized.candidates.length} candidate(s). Local audit still controls release.`, 'ok', doc);
      }
      return normalized;
    } catch (error) {
      tried.push(`${endpoint}:exception`);
    }
  }
  setGeneratorStatus(`Remote provider route not found. Tried: ${tried.join(', ') || remoteEndpointCandidates().join(', ')}.`, 'error', doc);
  return { provider: 'remote-llm-proxy', model: 'remote-llm-proxy', candidates: [], warnings: ['remote-provider-route-not-found', ...tried.map((item) => `tried:${item}`)], requestReceipt: { sentPrivateLedger: false, sentMaskMemory: false, redactionApplied: true, promptVersion: contract.promptVersion, triedEndpoints: tried } };
}

function renderDiagnostics(result = {}, doc = document) {
  let target = $('hushPhase32Diagnostics', doc);
  if (!target) {
    target = doc.createElement('div');
    target.id = 'hushPhase32Diagnostics';
    target.className = 'hush-warning-panel hush-phase32-diagnostics';
    const anchor = $('hushSwapWarningsPanel', doc) || $('acceptWarning', doc) || $('protectedOutputInput', doc);
    if (anchor?.insertAdjacentElement) anchor.insertAdjacentElement('afterend', target);
  }
  if (!target) return;
  const p = result.patch38Diagnostics || {};
  const phase35 = result.phase35Telemetry || {};
  const prop = result.propositionIntegrity || {};
  const route = phase35.ontologyRoute || {};
  const summary = route.propositionSummary || {};
  const rows = Array.isArray(p.selectorRows) ? p.selectorRows.slice(0, 5) : [];
  const receipt = p.providerReports?.[0]?.requestReceipt || {};
  const endpointLine = receipt.endpoint ? `<span>Endpoint: <code>${esc(receipt.endpoint)}</code></span>` : receipt.triedEndpoints?.length ? `<span>Tried: <code>${esc(receipt.triedEndpoints.join(', '))}</code></span>` : '';
  target.innerHTML = `<strong>Phase 35 ontology-routed generator</strong><div class="hush-phase32-diagnostic-grid"><span>Mode: <code>${esc(p.providerMode || 'offline-expressive')}</code></span><span>Route: <code>${esc(route.routeType || 'n/a')}</code></span><span>Source: <code>${esc(route.sourceType || 'n/a')}</code></span>${endpointLine}<span>Propositions: <code>${esc(summary.propositionCount ?? '0')}</code></span><span>Questions: <code>${esc(summary.questionCount ?? '0')}</code></span><span>Question score: <code>${esc(prop.questionFormScore ?? 'n/a')}</code></span><span>New claim risk: <code>${esc(prop.newClaimRisk?.score ?? 'n/a')}</code></span><span>Generated: <code>${esc(p.generatedCount ?? 0)}</code></span><span>Merged: <code>${esc(p.mergedCount ?? 0)}</code></span><span>Collapse: <code>${esc(p.selectedCollapseSurfaceScore ?? 0)}</code></span><span>Warning: <code>${esc(p.warning || prop.warnings?.join(', ') || 'none')}</code></span></div>${rows.length ? `<details><summary>Phase 35 candidates</summary>${rows.map((row) => `<div><code>${esc(row.id)}</code> ${esc(row.strategy || '')} · score ${esc(row.score)} · collapse ${esc(row.collapse)}</div>`).join('')}</details>` : ''}`;
}

function buildPatch38ApprovalPacket({ reason = '', result = {}, warnings = [] } = {}) {
  const diagnostics = result.patch38Diagnostics || {};
  return {
    routeState: 'patch38_no_approved_candidate',
    sealStatus: 'blocked',
    selectedCandidate: null,
    hardStops: [
      'selector_no_approved_candidate',
      ...warnings,
      ...(diagnostics.warning ? [diagnostics.warning] : [])
    ].filter(Boolean),
    humanReclosure: {
      required: true,
      confirmed: false,
      rejected_routes_visible: true
    },
    consentStatus: 'confirmed',
    claimCeiling: 'structural',
    sourceContext: 'hush_patch38_transform',
    approvalContext: reason || 'candidate selector produced no releasable output'
  };
}

function formatPatch38ApprovalBlock(transparency) {
  const blockers = transparency?.approvalDiagnostics?.blockers || [];
  const visibleReason = blockers.length
    ? blockers.join(' | ')
    : transparency?.approvalReason || 'candidate selector produced no releasable output';
  return `Candidate approval blocked — not an error. ${visibleReason}. Switch to Hybrid or Offline Expressive, edit the source/mask, then Transform again.`;
}

function recordPatch38ApprovalBlock(transparency, result = {}) {
  if (typeof window === 'undefined') return;
  window.__TD613_HUSH_PATCH38_APPROVAL__ = {
    version: HUSH_SWAP_PATCH38_VERSION,
    appliedAt: new Date().toISOString(),
    selectedCandidateId: result.patch38Diagnostics?.selectedCandidateId || null,
    generatedCount: result.patch38Diagnostics?.generatedCount ?? 0,
    mergedCount: result.patch38Diagnostics?.mergedCount ?? 0,
    approvalStatus: transparency.approvalStatus,
    approvalReason: transparency.approvalReason,
    approvalDiagnostics: transparency.approvalDiagnostics
  };
}

function renderGateFailure(reason = '', doc = document, transparency = null) {
  const output = $('protectedOutputInput', doc);
  if (output) output.value = '';
  const message = reason || 'Candidate approval blocked. Try Hybrid fallback or inspect provider diagnostics.';
  setGeneratorStatus(message, 'error', doc);
  const warning = $('acceptWarning', doc);
  if (warning) {
    warning.hidden = false;
    warning.textContent = message;
  }
  if (transparency) {
    const status = ensureGeneratorStatus(doc);
    if (status) status.dataset.approvalStatus = transparency.approvalStatus;
  }
}

async function runPatch38Transform(doc = document) {
  const state = bench.benchState || {};
  const sourceText = $('messageDraftInput', doc)?.value || '';
  const select = installGeneratorMode(doc);
  if (!text(sourceText)) {
    const transparency = deriveApertureApprovalTransparency(buildPatch38ApprovalPacket({ reason: 'empty source text' }));
    recordPatch38ApprovalBlock(transparency, {});
    renderGateFailure(formatPatch38ApprovalBlock(transparency), doc, transparency);
    return null;
  }
  const mask = selectedMask(state);
  const mode = select?.value || $('hushGeneratorMode', doc)?.value || DEFAULT_GENERATOR_MODE;
  setGeneratorStatus(`Generator mode: ${mode}. Building candidates...`, 'info', doc);
  const phase35Telemetry = buildPhase35ProviderTelemetry({ sourceText, mask });
  const providerReports = [];
  if (mode === GENERATOR_MODES.HYBRID || mode === GENERATOR_MODES.REMOTE_LLM_PROXY) providerReports.push(await fetchRemoteReport({ sourceText, mask, candidateCount: 6, propositionMap: phase35Telemetry.propositionMap }, doc));
  const result = buildHushSwap({
    sourceText,
    protectedBaselineText: $('protectedBaselineInput', doc)?.value || '',
    mask,
    maskProfile: activeField(state) || mask?.profile || {},
    maskReferenceText: $('maskReferenceInput', doc)?.value || mask?.sampleSeed || '',
    generatorMode: mode,
    providerReports,
    protectedLiterals: [],
    operatorMode: $('recognitionIntentMode', doc)?.value || 'neutralize',
    contextType: state.recognitionContextType || 'group-chat',
    exposureDuration: state.recognitionExposureDuration || 'single-use',
    options: { candidateCount: 30, includePrivateText: false }
  });
  result.phase35Telemetry = phase35Telemetry;
  result.propositionIntegrity = auditPropositionIntegrity(sourceText, result.selectedOutput || '');
  state.hushSwapResult = result;
  state.protectedOutputText = result.selectedOutput || '';
  const output = $('protectedOutputInput', doc);
  if (output) output.value = state.protectedOutputText;
  renderDiagnostics(result, doc);
  if (!text(state.protectedOutputText)) {
    const reports = result.patch38Diagnostics?.providerReports || [];
    const reportWarnings = reports.flatMap((report) => report.warnings || []);
    const transparency = deriveApertureApprovalTransparency(buildPatch38ApprovalPacket({
      reason: 'candidate selector produced no releasable output',
      result,
      warnings: reportWarnings
    }));
    recordPatch38ApprovalBlock(transparency, result);
    renderGateFailure(formatPatch38ApprovalBlock(transparency), doc, transparency);
  } else {
    const selected = result.patch38Diagnostics?.selectedCandidateId || result.selectedCandidateId || 'candidate';
    setGeneratorStatus(`Output produced from ${selected}. Review and Analyze before Accept.`, 'ok', doc);
  }
  return result;
}

export function initHushPatch38(doc = document) {
  if (!doc?.body || doc.body.dataset.pageKind !== 'adversarial-bench') return { installed: false, version: HUSH_SWAP_PATCH38_VERSION };
  doc.body.dataset.hushPatch38 = 'true';
  doc.body.dataset.hushPhase35 = 'true';
  installGeneratorMode(doc);
  const button = $('generateMaskedOutputBtn', doc);
  if (button && button.dataset.patch38 !== 'true') {
    button.dataset.patch38 = 'true';
    button.addEventListener('click', (event) => { event.preventDefault(); event.stopImmediatePropagation(); runPatch38Transform(doc); }, true);
  }
  if (typeof window !== 'undefined') window.__TD613_HUSH_PATCH38__ = { version: HUSH_SWAP_PATCH38_VERSION, phase35: true, runPatch38Transform, installGeneratorMode, remoteEndpointCandidates };
  return { installed: true, version: HUSH_SWAP_PATCH38_VERSION };
}

if (typeof document !== 'undefined') {
  const boot = () => initHushPatch38(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.setTimeout(boot, 240);
  window.setTimeout(boot, 720);
  window.setTimeout(boot, 1400);
}
