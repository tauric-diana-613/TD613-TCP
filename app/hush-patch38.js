import * as bench from './adversarial-bench.mjs';
import { buildHushSwap, HUSH_SWAP_PATCH38_VERSION } from './engine/hush-swap-patch38.js';
import { GENERATOR_MODES, normalizeRemoteProviderResponse } from './engine/hush-generator-provider.js';
import { buildHushLlmPromptContractV2, buildPhase35ProviderTelemetry } from './engine/hush-generator-provider-phase35.js';
import { auditPropositionIntegrity } from './engine/hush-proposition-integrity.js';

const $ = (id, doc = document) => doc.getElementById(id);
const text = (value) => String(value ?? '').trim();
const esc = (value = '') => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

function selectedMask(state = bench.benchState || {}) {
  const masks = [...(state.hushMasks || []), ...(state.customMasks || [])];
  return masks.find((mask) => mask.id === state.selectedHushMaskId) || state.selectedHushMask || masks[0] || null;
}

function activeField(state = bench.benchState || {}) {
  const mask = selectedMask(state) || {};
  return state.profiles?.maskReference || mask.profile || {};
}

function installGeneratorMode(doc = document) {
  if ($('hushGeneratorMode', doc)) return;
  const anchor = $('recognitionIntentMode', doc)?.closest('label') || $('maskFieldSelect', doc)?.closest('label');
  if (!anchor?.parentElement) return;
  const label = doc.createElement('label');
  label.className = 'hush-field-shell hush-generator-mode-wrap';
  label.innerHTML = '<span class="hush-field-label">Generator Mode</span><select id="hushGeneratorMode"><option value="offline-expressive">Offline Expressive</option><option value="hybrid">Hybrid</option><option value="remote-llm-proxy">Remote LLM Candidate</option></select><span class="hush-field-caption">Remote mode uses /api/hush-generate. API keys never belong in browser code.</span>';
  anchor.parentElement.appendChild(label);
}

async function fetchRemoteReport(input = {}) {
  const contract = buildHushLlmPromptContractV2(input);
  try {
    const response = await fetch('/api/hush-generate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ contract }) });
    if (!response.ok) return { provider: 'remote-llm-proxy', model: 'remote-llm-proxy', candidates: [], warnings: [`remote-provider-http-${response.status}`], requestReceipt: { sentPrivateLedger: false, sentMaskMemory: false, redactionApplied: true, promptVersion: contract.promptVersion } };
    return normalizeRemoteProviderResponse(await response.json(), contract);
  } catch {
    return { provider: 'remote-llm-proxy', model: 'remote-llm-proxy', candidates: [], warnings: ['remote-provider-unavailable'], requestReceipt: { sentPrivateLedger: false, sentMaskMemory: false, redactionApplied: true, promptVersion: contract.promptVersion } };
  }
}

function renderDiagnostics(result = {}, doc = document) {
  const target = $('hushPhase32Diagnostics', doc);
  if (!target) return;
  const p = result.patch38Diagnostics || {};
  const phase35 = result.phase35Telemetry || {};
  const prop = result.propositionIntegrity || {};
  const route = phase35.ontologyRoute || {};
  const summary = route.propositionSummary || {};
  const rows = Array.isArray(p.selectorRows) ? p.selectorRows.slice(0, 5) : [];
  target.innerHTML = `<strong>Phase 35 ontology-routed generator</strong><div class="hush-phase32-diagnostic-grid"><span>Mode: <code>${esc(p.providerMode || 'offline-expressive')}</code></span><span>Route: <code>${esc(route.routeType || 'n/a')}</code></span><span>Source: <code>${esc(route.sourceType || 'n/a')}</code></span><span>Propositions: <code>${esc(summary.propositionCount ?? '0')}</code></span><span>Questions: <code>${esc(summary.questionCount ?? '0')}</code></span><span>Question score: <code>${esc(prop.questionFormScore ?? 'n/a')}</code></span><span>New claim risk: <code>${esc(prop.newClaimRisk?.score ?? 'n/a')}</code></span><span>Collapse: <code>${esc(p.selectedCollapseSurfaceScore ?? 0)}</code></span><span>Warning: <code>${esc(p.warning || prop.warnings?.join(', ') || 'none')}</code></span></div>${rows.length ? `<details><summary>Phase 35 candidates</summary>${rows.map((row) => `<div><code>${esc(row.id)}</code> ${esc(row.strategy || '')} · score ${esc(row.score)} · collapse ${esc(row.collapse)}</div>`).join('')}</details>` : ''}`;
}

async function runPatch38Transform(doc = document) {
  const state = bench.benchState || {};
  const sourceText = $('messageDraftInput', doc)?.value || '';
  if (!text(sourceText)) return null;
  const mask = selectedMask(state);
  const mode = $('hushGeneratorMode', doc)?.value || GENERATOR_MODES.OFFLINE_EXPRESSIVE;
  const phase35Telemetry = buildPhase35ProviderTelemetry({ sourceText, mask });
  const providerReports = [];
  if (mode === GENERATOR_MODES.HYBRID || mode === GENERATOR_MODES.REMOTE_LLM_PROXY) providerReports.push(await fetchRemoteReport({ sourceText, mask, candidateCount: 6, propositionMap: phase35Telemetry.propositionMap }));
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
  if (typeof window !== 'undefined') window.__TD613_HUSH_PATCH38__ = { version: HUSH_SWAP_PATCH38_VERSION, phase35: true, runPatch38Transform };
  return { installed: true, version: HUSH_SWAP_PATCH38_VERSION };
}

if (typeof document !== 'undefined') {
  const boot = () => initHushPatch38(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.setTimeout(boot, 240);
  window.setTimeout(boot, 720);
}