import * as bench from './adversarial-bench.mjs';
import { buildHushSwap, HUSH_SWAP_PATCH38_VERSION } from './engine/hush-swap-patch38.js';
import { GENERATOR_MODES, normalizeRemoteProviderResponse } from './engine/hush-generator-provider.js';
import { buildHushLlmPromptContractV2, buildHushLlmPromptContractV3, buildPhase37ProviderTelemetry } from './engine/hush-generator-provider-phase35.js';
import { auditPropositionIntegrity } from './engine/hush-proposition-integrity.js';
import { deriveApertureApprovalTransparency } from './engine/aperture-approval-transparency.js';
import { extractCadenceProfile } from './engine/stylometry.js';
import { sanitizeHushRemoteContract } from './engine/hush-contract-sanitizer.js';

const $ = (id, doc = document) => doc.getElementById(id);
const text = (value) => String(value ?? '').trim();
const esc = (value = '') => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const PRODUCTION_HUSH_API_ENDPOINT = 'https://td613.vercel.app/api/hush-generate';
const DEFAULT_GENERATOR_MODE = GENERATOR_MODES.REMOTE_LLM_PROXY;
const PHASE35_COMPATIBILITY_LABEL = 'Phase 35 ontology-routed generator';
const PATCH38_REMOTE_CACHE_TTL_MS = 10 * 60 * 1000;
const PATCH38_REMOTE_CACHE_LIMIT = 24;
const patch38RemoteReportCache = new Map();
const patch38RemoteReportInflight = new Map();
let patch38RunSeq = 0;
let activePatch38RunId = 0;
void buildHushLlmPromptContractV2;

function emitHushEvent(name, detail = {}) {
  if (typeof window === 'undefined') return;
  try { window.dispatchEvent(new CustomEvent(name, { detail })); }
  catch (error) { window.__TD613_HUSH_PATCH38_EVENT_ERROR = String(error?.message || error); }
}
function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
}
function hashString(value = '') {
  let hash = 2166136261;
  for (const ch of String(value || '')) { hash ^= ch.codePointAt(0); hash = Math.imul(hash, 16777619); }
  return (hash >>> 0).toString(16).padStart(8, '0');
}
function cloneReport(report = {}) { return JSON.parse(JSON.stringify(report || {})); }
function providerBoundContractOf(contract = {}) { return sanitizeHushRemoteContract(contract); }
function remoteReportCacheKey(contract = {}) { return hashString(stableStringify({ promptVersion: contract.promptVersion, sourceText: contract.sourceText, flightPacket: contract.flightPacket, candidateCount: contract.candidateCount, operatorMode: contract.operatorMode })); }
function getCachedRemoteReport(cacheKey = '') {
  const entry = patch38RemoteReportCache.get(cacheKey);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > PATCH38_REMOTE_CACHE_TTL_MS) { patch38RemoteReportCache.delete(cacheKey); return null; }
  const report = cloneReport(entry.report);
  report.cache = { hit: true, key: cacheKey, ageMs: Date.now() - entry.createdAt, scope: 'patch38-session' };
  report.warnings = [...new Set([...(report.warnings || []), 'patch38-remote-report-cache-hit'])];
  report.requestReceipt = { ...(report.requestReceipt || {}), cacheHit: true, cacheKey };
  return report;
}
function setCachedRemoteReport(cacheKey = '', report = {}) {
  if (!cacheKey || !report?.candidates?.length) return;
  patch38RemoteReportCache.set(cacheKey, { createdAt: Date.now(), report: cloneReport(report) });
  while (patch38RemoteReportCache.size > PATCH38_REMOTE_CACHE_LIMIT) patch38RemoteReportCache.delete(patch38RemoteReportCache.keys().next().value);
}
function selectedMask(state = bench.benchState || {}) {
  const masks = [...(state.hushMasks || []), ...(state.customMasks || [])];
  return masks.find((mask) => mask.id === state.selectedHushMaskId) || state.selectedHushMask || masks[0] || null;
}
function resolveMaskFromDom(doc = document, state = bench.benchState || {}) {
  const selectId = $('maskFieldSelect', doc)?.value || state.selectedHushMaskId || '';
  const masks = [...(state.hushMasks || []), ...(state.customMasks || [])];
  return masks.find((mask) => mask.id === selectId) || state.selectedHushMask || masks.find((mask) => mask.id === state.selectedHushMaskId) || masks[0] || null;
}
function syncBenchStateFromDom(doc = document) {
  const state = bench.benchState || {};
  const selectId = $('maskFieldSelect', doc)?.value || state.selectedHushMaskId || '';
  const currentId = state.selectedHushMask?.id || state.selectedHushMaskId || '';
  if (selectId && selectId !== currentId && typeof bench.selectHushMask === 'function') bench.selectHushMask(selectId);
  const mask = resolveMaskFromDom(doc, state);
  state.selectedHushMaskId = mask?.id || selectId || state.selectedHushMaskId || '';
  state.selectedPersonaId = state.selectedHushMaskId;
  state.selectedHushMask = mask || state.selectedHushMask || null;
  state.protectedBaselineText = $('protectedBaselineInput', doc)?.value || '';
  state.maskReferenceText = $('maskReferenceInput', doc)?.value || '';
  state.messageDraftText = $('messageDraftInput', doc)?.value || '';
  state.protectedOutputText = $('protectedOutputInput', doc)?.value || '';
  state.recognitionContextType = $('recognitionContextType', doc)?.value || state.recognitionContextType || 'group-chat';
  state.recognitionIntentMode = $('recognitionIntentMode', doc)?.value || state.recognitionIntentMode || 'neutralize';
  state.recognitionExposureDuration = $('recognitionExposureDuration', doc)?.value || state.recognitionExposureDuration || 'single-use';
  state.profiles = state.profiles || {};
  state.profiles.maskReference = extractCadenceProfile(state.maskReferenceText || mask?.sampleSeed || mask?.description || '');
  state.profiles.messageDraft = extractCadenceProfile(state.messageDraftText || '');
  state.profiles.protectedBaseline = extractCadenceProfile(state.protectedBaselineText || '');
  state.profiles.protectedOutput = extractCadenceProfile(state.protectedOutputText || '');
  return { state, mask };
}
function activeField(state = bench.benchState || {}, mask = null) { return state.profiles?.maskReference || mask?.profile || selectedMask(state)?.profile || {}; }
function captureTransformSnapshot(doc = document) {
  const { state, mask } = syncBenchStateFromDom(doc);
  const mode = $('hushGeneratorMode', doc)?.value || DEFAULT_GENERATOR_MODE;
  const maskReferenceText = $('maskReferenceInput', doc)?.value || mask?.sampleSeed || mask?.samples?.map((sample) => sample.text).filter(Boolean).join('\n\n') || mask?.description || '';
  const sourceText = $('messageDraftInput', doc)?.value || '';
  const protectedBaselineText = $('protectedBaselineInput', doc)?.value || '';
  const referenceProfile = extractCadenceProfile(maskReferenceText || mask?.sampleSeed || mask?.description || '');
  const runId = ++patch38RunSeq;
  const identity = hashString(stableStringify({ sourceText, maskId: mask?.id || '', maskReferenceText, mode, recognitionIntentMode: state.recognitionIntentMode, recognitionContextType: state.recognitionContextType, recognitionExposureDuration: state.recognitionExposureDuration }));
  activePatch38RunId = runId;
  return { runId, identity, state, mask, mode, sourceText, protectedBaselineText, maskReferenceText, referenceProfile, recognitionIntentMode: state.recognitionIntentMode || 'neutralize', recognitionContextType: state.recognitionContextType || 'group-chat', recognitionExposureDuration: state.recognitionExposureDuration || 'single-use' };
}
function snapshotStillCurrent(snapshot = {}, doc = document) {
  const current = { sourceText: $('messageDraftInput', doc)?.value || '', maskId: $('maskFieldSelect', doc)?.value || bench.benchState?.selectedHushMaskId || '', maskReferenceText: $('maskReferenceInput', doc)?.value || '', mode: $('hushGeneratorMode', doc)?.value || DEFAULT_GENERATOR_MODE, recognitionIntentMode: $('recognitionIntentMode', doc)?.value || bench.benchState?.recognitionIntentMode || 'neutralize', recognitionContextType: $('recognitionContextType', doc)?.value || bench.benchState?.recognitionContextType || 'group-chat', recognitionExposureDuration: $('recognitionExposureDuration', doc)?.value || bench.benchState?.recognitionExposureDuration || 'single-use' };
  return snapshot.runId === activePatch38RunId && hashString(stableStringify(current)) === snapshot.identity;
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
    select.addEventListener('change', () => { select.dataset.operatorTouched = 'true'; setGeneratorStatus(`Generator mode selected: ${generatorModeLabel(select.value)}.`, 'info', doc); });
  }
  if (select.dataset.operatorTouched !== 'true') { select.value = DEFAULT_GENERATOR_MODE; setGeneratorStatus('Generator mode preset: Remote LLM Candidate. Hybrid and local modes remain available manually.', 'info', doc); }
  return select;
}
function installGeneratorMode(doc = document) {
  const existing = $('hushGeneratorMode', doc);
  if (existing) { ensureGeneratorStatus(doc); return configureGeneratorSelect(existing, doc); }
  const host = $('hushGateStrip', doc)?.parentElement || $('generateMaskedOutputBtn', doc)?.closest('.hush-transform-gate') || $('hushBuiltInMaskPanel', doc) || $('maskFieldSelect', doc)?.parentElement || $('recognitionIntentMode', doc)?.closest('.recognition-field-controls') || null;
  if (!host) return null;
  const label = doc.createElement('label');
  label.id = 'hushGeneratorModeWrap';
  label.className = 'hush-field-shell hush-generator-mode-wrap';
  label.setAttribute('for', 'hushGeneratorMode');
  label.innerHTML = '<span class="hush-field-label">Generator Mode</span><select id="hushGeneratorMode"><option value="offline-expressive">Offline Expressive</option><option value="hybrid">Hybrid fallback</option><option value="remote-llm-proxy" selected>Remote LLM Candidate</option></select><span class="hush-field-caption">Remote LLM uses Phase 37 flight packets. Hybrid and local modes remain available manually.</span>';
  const gateStrip = $('hushGateStrip', doc);
  if (gateStrip?.parentElement === host) host.insertBefore(label, gateStrip);
  else host.appendChild(label);
  const status = doc.createElement('div');
  status.id = 'hushGeneratorStatus';
  status.className = 'hush-warning-panel hush-generator-status';
  status.setAttribute('aria-live', 'polite');
  status.textContent = 'Generator mode preset: Remote LLM Candidate. Phase 37 flight packets are active.';
  label.insertAdjacentElement('afterend', status);
  return configureGeneratorSelect($('hushGeneratorMode', doc), doc);
}
function configuredRemoteEndpoint() {
  if (typeof window === 'undefined') return '';
  const direct = window.TD613_HUSH_API_ENDPOINT || window.__TD613_HUSH_API_ENDPOINT__ || '';
  const stored = (() => { try { return window.localStorage?.getItem('td613:hush-api-endpoint') || ''; } catch { return ''; } })();
  return text(direct || stored);
}
function remoteEndpointCandidates() {
  const loc = typeof window !== 'undefined' ? window.location : null;
  const origin = loc?.origin || '';
  const candidates = [];
  const configured = configuredRemoteEndpoint();
  if (configured) candidates.push(configured);
  if (origin && !origin.includes('github.io')) candidates.push(`${origin}/api/hush-generate`);
  candidates.push(PRODUCTION_HUSH_API_ENDPOINT);
  candidates.push('/api/hush-generate');
  return [...new Set(candidates.filter(Boolean))];
}
function buildOutboundPacketExport({ contract = {}, snapshot = {}, phase37Telemetry = {}, mode = '' } = {}) {
  const providerBoundContract = providerBoundContractOf(contract);
  return {
    schema: 'td613-hush-outbound-packet/v1',
    createdAt: new Date().toISOString(),
    exportKind: 'outbound-generator-contract',
    direction: 'outbound',
    includesPrivateText: true,
    privateTextIncluded: true,
    note: 'Outbound packet built locally. Provider-bound payload sanitized before remote generation.',
    mode,
    promptVersion: contract.promptVersion || phase37Telemetry.promptVersion || null,
    flightPacketVersion: contract.flightPacketVersion || phase37Telemetry.flightPacketVersion || contract.flightPacket?.packet_version || null,
    snapshot: { runId: snapshot.runId || null, identity: snapshot.identity || null, maskId: snapshot.mask?.id || '', sourceHash: hashString(snapshot.sourceText || ''), referenceHash: hashString(snapshot.maskReferenceText || '') },
    endpointCandidates: mode === GENERATOR_MODES.REMOTE_LLM_PROXY || mode === GENERATOR_MODES.HYBRID ? remoteEndpointCandidates() : [],
    rawLocalContractHash: hashString(stableStringify(contract)),
    providerBoundContractHash: hashString(stableStringify(providerBoundContract)),
    promptDetox: { active: true, sampleSeedExported: false, maskLoreExported: false, providerBoundPacket: 'sanitized' },
    contract,
    providerBoundContract
  };
}
function publishOutboundPacket(outboundPacket = null, state = bench.benchState || {}) {
  if (typeof window !== 'undefined') window.__TD613_HUSH_PATCH38_LAST_OUTBOUND_PACKET = outboundPacket;
  if (state) state.hushOutboundPacket = outboundPacket;
  emitHushEvent('td613:hush:outbound-packet', { outboundPacket });
}
async function fetchRemoteReportUncached(contract = {}, doc = document) {
  const providerBoundContract = providerBoundContractOf(contract);
  const tried = [];
  for (const endpoint of remoteEndpointCandidates()) {
    try {
      const response = await fetch(endpoint, { method: 'POST', mode: 'cors', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ contract: providerBoundContract }) });
      tried.push(`${endpoint}:${response.status}`);
      if (response.status === 404) continue;
      if (!response.ok) {
        const warning = `remote-provider-http-${response.status}`;
        setGeneratorStatus(`Remote provider reached ${endpoint} but returned ${response.status}; switch to Hybrid if you need local fallback.`, 'warning', doc);
        return { provider: 'remote-llm-proxy', model: 'remote-llm-proxy', candidates: [], warnings: [warning, `endpoint:${endpoint}`], requestReceipt: { endpoint, triedEndpoints: tried, sentPrivateLedger: false, sentMaskMemory: false, redactionApplied: true, promptDetoxActive: true, sampleSeedExportedToProvider: false, maskLoreExportedToProvider: false, providerBoundPacket: 'sanitized', promptVersion: providerBoundContract.promptVersion, flightPacketVersion: providerBoundContract.flightPacketVersion } };
      }
      const normalized = normalizeRemoteProviderResponse(await response.json(), providerBoundContract);
      normalized.requestReceipt = { ...(normalized.requestReceipt || {}), endpoint, triedEndpoints: tried, promptDetoxActive: true, sampleSeedExportedToProvider: false, maskLoreExportedToProvider: false, providerBoundPacket: 'sanitized', promptVersion: providerBoundContract.promptVersion, flightPacketVersion: providerBoundContract.flightPacketVersion };
      if (!normalized.candidates?.length) { normalized.warnings = [...new Set([...(normalized.warnings || []), 'remote-provider-empty-candidates', `endpoint:${endpoint}`])]; setGeneratorStatus(`Remote provider reached ${endpoint} but returned zero usable candidates. Inspect Phase 37 diagnostics.`, 'warning', doc); }
      else setGeneratorStatus(`Remote provider reached ${endpoint} and returned ${normalized.candidates.length} Phase 37 candidate(s). Local audit still controls release.`, 'ok', doc);
      return normalized;
    } catch (error) { tried.push(`${endpoint}:exception`); }
  }
  setGeneratorStatus(`Remote provider route not found. Tried: ${tried.join(', ') || remoteEndpointCandidates().join(', ')}.`, 'error', doc);
  return { provider: 'remote-llm-proxy', model: 'remote-llm-proxy', candidates: [], warnings: ['remote-provider-route-not-found', ...tried.map((item) => `tried:${item}`)], requestReceipt: { sentPrivateLedger: false, sentMaskMemory: false, redactionApplied: true, promptDetoxActive: true, sampleSeedExportedToProvider: false, maskLoreExportedToProvider: false, providerBoundPacket: 'sanitized', promptVersion: 'hush-llm-candidate-v3', triedEndpoints: tried } };
}
async function fetchRemoteReport(input = {}, doc = document) {
  const rawContract = input.contract || buildHushLlmPromptContractV3(input);
  const contract = providerBoundContractOf(rawContract);
  const cacheKey = remoteReportCacheKey(contract);
  const cached = getCachedRemoteReport(cacheKey);
  if (cached) { setGeneratorStatus('Remote provider cache hit: same source + same mask + same Phase37 packet. Reusing stable candidate report.', 'ok', doc); return cached; }
  if (patch38RemoteReportInflight.has(cacheKey)) {
    setGeneratorStatus('Remote provider request already in flight for this exact packet. Reusing the same request.', 'info', doc);
    const reused = cloneReport(await patch38RemoteReportInflight.get(cacheKey));
    reused.cache = { hit: true, key: cacheKey, scope: 'patch38-inflight-reuse' };
    reused.warnings = [...new Set([...(reused.warnings || []), 'patch38-remote-inflight-reused'])];
    reused.requestReceipt = { ...(reused.requestReceipt || {}), cacheHit: true, inflightReused: true, cacheKey };
    return reused;
  }
  const request = fetchRemoteReportUncached(contract, doc).then((report) => { if (report?.candidates?.length) setCachedRemoteReport(cacheKey, report); return report; });
  patch38RemoteReportInflight.set(cacheKey, request);
  try { const report = cloneReport(await request); report.requestReceipt = { ...(report.requestReceipt || {}), cacheKey, cacheHit: false }; return report; }
  finally { patch38RemoteReportInflight.delete(cacheKey); }
}
function renderDiagnostics(result = {}, doc = document) {
  let target = $('hushPhase32Diagnostics', doc);
  if (!target) { target = doc.createElement('div'); target.id = 'hushPhase32Diagnostics'; target.className = 'hush-warning-panel hush-phase32-diagnostics'; const anchor = $('hushSwapWarningsPanel', doc) || $('acceptWarning', doc) || $('protectedOutputInput', doc); if (anchor?.insertAdjacentElement) anchor.insertAdjacentElement('afterend', target); }
  if (!target) return;
  const p = result.patch38Diagnostics || {};
  const phase37 = result.phase37Telemetry || result.phase35Telemetry || {};
  const prop = result.propositionIntegrity || {};
  const route = phase37.ontologyRoute || {};
  const packet = phase37.flightPacket || {};
  const rows = Array.isArray(p.selectorRows) ? p.selectorRows.slice(0, 6) : [];
  const receipt = p.providerReports?.[0]?.requestReceipt || {};
  const endpointLine = receipt.endpoint ? `<span>Endpoint: <code>${esc(receipt.endpoint)}</code></span>` : receipt.triedEndpoints?.length ? `<span>Tried: <code>${esc(receipt.triedEndpoints.join(', '))}</code></span>` : receipt.cacheHit ? `<span>Endpoint: <code>session-cache</code></span>` : '';
  const detoxLine = `<span>Prompt detox: <code>${esc(receipt.promptDetoxActive || result.outboundPacket?.promptDetox?.active ? 'active' : 'n/a')}</code></span><span>Sample seed exported: <code>${esc(receipt.sampleSeedExportedToProvider === false ? 'false' : 'n/a')}</code></span><span>Mask lore exported: <code>${esc(receipt.maskLoreExportedToProvider === false ? 'false' : 'n/a')}</code></span><span>Catchphrase rejected: <code>${esc(receipt.catchphraseRejected ?? 0)}</code></span><span>Provider-bound packet: <code>${esc(receipt.providerBoundPacket || result.outboundPacket?.promptDetox?.providerBoundPacket || 'sanitized')}</code></span>`;
  const operationSpread = Array.isArray(p.operationSpread) ? p.operationSpread.join(', ') : 'none';
  const apertureLine = packet.aperture_bridge ? `<span>Aperture: <code>${esc(packet.aperture_bridge.route_intent || 'bridge')}</code></span><span>Repair: <code>${esc((packet.repair_controls?.aperture_repair_operations || packet.aperture_bridge.repair_controls?.aperture_repair_operations || []).join(', ') || 'none')}</code></span>` : '';
  target.innerHTML = `<strong>Phase 37 ontology-carrying generator flight</strong><span hidden>${PHASE35_COMPATIBILITY_LABEL}</span><div class="hush-phase32-diagnostic-grid"><span>Mode: <code>${esc(p.providerMode || 'offline-expressive')}</code></span><span>Packet: <code>${esc(phase37.flightPacketVersion || packet.packet_version || 'n/a')}</code></span><span>Prompt: <code>${esc(phase37.promptVersion || receipt.promptVersion || 'n/a')}</code></span>${apertureLine}<span>Route: <code>${esc(route.route_type || route.routeType || 'n/a')}</code></span><span>Source: <code>${esc(route.source_type || route.sourceType || 'n/a')}</code></span><span>Risk: <code>${esc(route.semantic_risk || 'n/a')}</code></span><span>Depth: <code>${esc(route.transformation_depth || 'n/a')}</code></span>${endpointLine}${detoxLine}<span>Cache: <code>${esc(receipt.cacheHit ? 'hit' : receipt.cacheKey ? 'stored' : 'n/a')}</code></span><span>Snapshot: <code>${esc(result.patch38Snapshot?.identity || 'n/a')}</code></span><span>Operations: <code>${esc(operationSpread)}</code></span><span>Selected op: <code>${esc(p.selectedStyleOperation || 'n/a')}</code></span><span>Generated: <code>${esc(p.generatedCount ?? 0)}</code></span><span>Merged: <code>${esc(p.mergedCount ?? 0)}</code></span><span>Coverage: <code>${esc(p.selectedCoverage ?? 'n/a')}</code></span><span>Question score: <code>${esc(prop.questionFormScore ?? 'n/a')}</code></span><span>New claim risk: <code>${esc(prop.newClaimRisk?.score ?? 'n/a')}</code></span><span>Collapse: <code>${esc(p.selectedCollapseSurfaceScore ?? 0)}</code></span><span>Warning: <code>${esc(p.warning || prop.warnings?.join(', ') || 'none')}</code></span></div><p class="sub">Outbound packet built locally. Provider-bound payload sanitized before remote generation.</p>${rows.length ? `<details><summary>Phase 37 candidates</summary>${rows.map((row) => `<div><code>${esc(row.id)}</code> ${esc(row.operation || row.strategy || '')} · score ${esc(row.score)} · mask ${esc(row.maskFidelity ?? 'n/a')} · syntax ${esc(row.syntaxDistance ?? 'n/a')} · collapse ${esc(row.collapse)}</div>`).join('')}</details>` : ''}`;
}
function buildPatch38ApprovalPacket({ reason = '', result = {}, warnings = [] } = {}) {
  const diagnostics = result.patch38Diagnostics || {};
  return { routeState: 'patch38_no_approved_candidate', sealStatus: 'blocked', selectedCandidate: null, hardStops: ['selector_no_approved_candidate', ...warnings, ...(diagnostics.warning ? [diagnostics.warning] : [])].filter(Boolean), humanReclosure: { required: true, confirmed: false, rejected_routes_visible: true }, consentStatus: 'confirmed', claimCeiling: 'structural', sourceContext: 'hush_patch38_transform', approvalContext: reason || 'candidate selector produced no releasable output' };
}
function formatPatch38ApprovalBlock(transparency) {
  const blockers = transparency?.approvalDiagnostics?.blockers || [];
  const visibleReason = blockers.length ? blockers.join(' | ') : transparency?.approvalReason || 'candidate selector produced no releasable output';
  return `Candidate approval blocked — not an error. ${visibleReason}. Edit the source/mask or inspect Phase 37 diagnostics, then Transform again.`;
}
function recordPatch38ApprovalBlock(transparency, result = {}) {
  if (typeof window === 'undefined') return;
  window.__TD613_HUSH_PATCH38_APPROVAL__ = { version: HUSH_SWAP_PATCH38_VERSION, appliedAt: new Date().toISOString(), selectedCandidateId: result.patch38Diagnostics?.selectedCandidateId || null, generatedCount: result.patch38Diagnostics?.generatedCount ?? 0, mergedCount: result.patch38Diagnostics?.mergedCount ?? 0, approvalStatus: transparency.approvalStatus, approvalReason: transparency.approvalReason, approvalDiagnostics: transparency.approvalDiagnostics };
  emitHushEvent('td613:hush:patch38-approval', { approval: window.__TD613_HUSH_PATCH38_APPROVAL__, result });
}
function renderGateFailure(reason = '', doc = document, transparency = null) {
  const output = $('protectedOutputInput', doc);
  if (output) output.value = '';
  const message = reason || 'Candidate approval blocked. Inspect Phase 37 diagnostics.';
  setGeneratorStatus(message, 'error', doc);
  const warning = $('acceptWarning', doc);
  if (warning) { warning.hidden = false; warning.textContent = message; }
  if (transparency) { const status = ensureGeneratorStatus(doc); if (status) status.dataset.approvalStatus = transparency.approvalStatus; }
}
function renderStaleTransformDiscard(snapshot = {}, doc = document) { setGeneratorStatus('Stale transform discarded: source, mask, reference, or routing changed before the provider result returned. Transform again from the current state.', 'warning', doc); emitHushEvent('td613:hush:patch38-stale-discard', { snapshot }); }
async function runPatch38Transform(doc = document) {
  installGeneratorMode(doc);
  const snapshot = captureTransformSnapshot(doc);
  const button = $('generateMaskedOutputBtn', doc);
  if (button) button.disabled = true;
  publishOutboundPacket(null, snapshot.state);
  if (!text(snapshot.sourceText)) {
    const transparency = deriveApertureApprovalTransparency(buildPatch38ApprovalPacket({ reason: 'empty source text' }));
    recordPatch38ApprovalBlock(transparency, {});
    renderGateFailure(formatPatch38ApprovalBlock(transparency), doc, transparency);
    if (button) button.disabled = false;
    return null;
  }
  setGeneratorStatus(`Generator mode: ${snapshot.mode}. Building one coherent Phase 37 retrieval snapshot...`, 'info', doc);
  try {
    const phase37Telemetry = buildPhase37ProviderTelemetry({ sourceText: snapshot.sourceText, mask: snapshot.mask, maskReferenceText: snapshot.maskReferenceText, referenceText: snapshot.maskReferenceText, candidateCount: 8 });
    const outboundInput = { sourceText: snapshot.sourceText, mask: snapshot.mask, maskReferenceText: snapshot.maskReferenceText, referenceText: snapshot.maskReferenceText, candidateCount: 8, flightPacket: phase37Telemetry.flightPacket };
    const outboundContract = buildHushLlmPromptContractV3(outboundInput);
    const outboundPacket = buildOutboundPacketExport({ contract: outboundContract, snapshot, phase37Telemetry, mode: snapshot.mode });
    publishOutboundPacket(outboundPacket, snapshot.state);
    const providerReports = [];
    if (snapshot.mode === GENERATOR_MODES.HYBRID || snapshot.mode === GENERATOR_MODES.REMOTE_LLM_PROXY) providerReports.push(await fetchRemoteReport({ contract: outboundPacket.providerBoundContract }, doc));
    if (!snapshotStillCurrent(snapshot, doc)) { renderStaleTransformDiscard(snapshot, doc); return null; }
    const result = buildHushSwap({ sourceText: snapshot.sourceText, protectedBaselineText: snapshot.protectedBaselineText, mask: snapshot.mask, maskProfile: snapshot.referenceProfile || activeField(snapshot.state, snapshot.mask) || snapshot.mask?.profile || {}, maskReferenceText: snapshot.maskReferenceText, generatorMode: snapshot.mode, providerReports, protectedLiterals: [], phase37Telemetry, operatorMode: snapshot.recognitionIntentMode, contextType: snapshot.recognitionContextType, exposureDuration: snapshot.recognitionExposureDuration, options: { candidateCount: 30, includePrivateText: false } });
    if (!snapshotStillCurrent(snapshot, doc)) { renderStaleTransformDiscard(snapshot, doc); return null; }
    result.phase37Telemetry = phase37Telemetry;
    result.phase35Telemetry = phase37Telemetry;
    result.outboundPacket = outboundPacket;
    result.patch38Snapshot = { runId: snapshot.runId, identity: snapshot.identity, maskId: snapshot.mask?.id || '', sourceHash: hashString(snapshot.sourceText), referenceHash: hashString(snapshot.maskReferenceText) };
    result.propositionIntegrity = auditPropositionIntegrity(snapshot.sourceText, result.selectedOutput || '');
    snapshot.state.hushSwapResult = result;
    snapshot.state.hushOutboundPacket = outboundPacket;
    snapshot.state.protectedOutputText = result.selectedOutput || '';
    if (typeof window !== 'undefined') { window.__TD613_HUSH_PATCH38_LAST_RESULT = result; window.__TD613_HUSH_PATCH38_LAST_OUTBOUND_PACKET = outboundPacket; }
    const output = $('protectedOutputInput', doc);
    if (output) output.value = snapshot.state.protectedOutputText;
    renderDiagnostics(result, doc);
    emitHushEvent('td613:hush:patch38-result', { result, phase37Telemetry, snapshot: result.patch38Snapshot, outboundPacket });
    if (!text(snapshot.state.protectedOutputText)) {
      const reports = result.patch38Diagnostics?.providerReports || [];
      const reportWarnings = reports.flatMap((report) => report.warnings || []);
      const transparency = deriveApertureApprovalTransparency(buildPatch38ApprovalPacket({ reason: 'candidate selector produced no releasable output', result, warnings: reportWarnings }));
      recordPatch38ApprovalBlock(transparency, result);
      renderGateFailure(formatPatch38ApprovalBlock(transparency), doc, transparency);
    } else {
      const selected = result.patch38Diagnostics?.selectedCandidateId || result.selectedCandidateId || 'candidate';
      const op = result.patch38Diagnostics?.selectedStyleOperation || 'operation-unreported';
      setGeneratorStatus(`Output produced from ${selected} via ${op}. Snapshot ${result.patch38Snapshot.identity}. Review/edit if needed; Analyze is optional before Accept.`, 'ok', doc);
    }
    return result;
  } finally { if (button && snapshot.runId === activePatch38RunId) button.disabled = false; }
}
export function initHushPatch38(doc = document) {
  if (!doc?.body || doc.body.dataset.pageKind !== 'adversarial-bench') return { installed: false, version: HUSH_SWAP_PATCH38_VERSION };
  doc.body.dataset.hushPatch38 = 'true';
  doc.body.dataset.hushPhase35 = 'true';
  doc.body.dataset.hushPhase37 = 'true';
  installGeneratorMode(doc);
  const button = $('generateMaskedOutputBtn', doc);
  if (button && button.dataset.patch38 !== 'true') { button.dataset.patch38 = 'true'; button.addEventListener('click', (event) => { event.preventDefault(); event.stopImmediatePropagation(); runPatch38Transform(doc); }, true); }
  if (typeof window !== 'undefined') window.__TD613_HUSH_PATCH38__ = { version: HUSH_SWAP_PATCH38_VERSION, phase35: true, phase37: true, runPatch38Transform, installGeneratorMode, remoteEndpointCandidates, lastOutboundPacket: () => window.__TD613_HUSH_PATCH38_LAST_OUTBOUND_PACKET || bench.benchState?.hushOutboundPacket || null, remoteCacheStats: () => ({ size: patch38RemoteReportCache.size, inflight: patch38RemoteReportInflight.size, ttlMs: PATCH38_REMOTE_CACHE_TTL_MS, activeRunId: activePatch38RunId }), clearRemoteCache: () => { patch38RemoteReportCache.clear(); patch38RemoteReportInflight.clear(); }, captureTransformSnapshot: () => captureTransformSnapshot(document) };
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
