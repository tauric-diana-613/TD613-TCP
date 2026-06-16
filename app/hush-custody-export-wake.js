const TD613_HUSH_CUSTODY_EXPORT_WAKE_VERSION = 'custody-export-wake/v1';
const $ = (id) => document.getElementById(id);
const trim = (value) => String(value ?? '').trim();

function benchState() {
  return window.__TD613_HUSH_BENCH__?.benchState || {};
}

function resultState() {
  return benchState().hushSwapResult || window.__TD613_HUSH_PATCH38_LAST_RESULT || null;
}

function outputText() {
  return trim($('protectedOutputInput')?.value || benchState().protectedOutputText || resultState()?.selectedOutput || '');
}

function transformComplete() {
  return Boolean(outputText() || resultState());
}

function hashText(value = '') {
  let hash = 2166136261;
  for (const ch of String(value || '')) { hash ^= ch.codePointAt(0); hash = Math.imul(hash, 16777619); }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function selectedMask() {
  const s = benchState();
  const select = $('maskFieldSelect');
  const masks = [...(s.hushMasks || []), ...(s.customMasks || [])];
  const id = select?.value || s.selectedHushMaskId || s.selectedHushMask?.id || '';
  return masks.find((mask) => mask.id === id) || s.selectedHushMask || null;
}

function exactOutboundPacket() {
  const s = benchState();
  const result = resultState() || {};
  return window.__TD613_HUSH_PATCH38_LAST_OUTBOUND_PACKET
    || window.__TD613_HUSH_PATCH38__?.lastOutboundPacket?.()
    || s.hushOutboundPacket
    || result.outboundPacket
    || null;
}

function fallbackOutboundPacket() {
  if (!transformComplete()) return null;
  const s = benchState();
  const result = resultState() || {};
  const mask = selectedMask() || {};
  const source = $('messageDraftInput')?.value || s.messageDraftText || '';
  const reference = $('maskReferenceInput')?.value || s.maskReferenceText || mask.sampleSeed || mask.description || '';
  const identity = result.patch38Snapshot?.identity || `local-${hashText(`${source}\n${mask.id || ''}\n${reference}`)}`;
  return {
    schema: 'td613-hush-outbound-packet/v1',
    exportKind: 'outbound-generator-contract',
    direction: 'outbound',
    diagnosticFallback: true,
    createdAt: new Date().toISOString(),
    note: 'Rebuilt from the latest completed local Hush transform because no stored Patch38 outbound contract was available. This is not provider output.',
    snapshot: {
      identity,
      maskId: mask.id || s.selectedHushMaskId || null,
      sourceHash: hashText(source),
      referenceHash: hashText(reference)
    },
    contract: {
      promptVersion: result.phase37Telemetry?.promptVersion || result.phase35Telemetry?.promptVersion || 'local-hush-transform-fallback',
      flightPacketVersion: result.phase37Telemetry?.flightPacketVersion || result.phase37Telemetry?.flightPacket?.packet_version || null,
      sourceText: source,
      mask,
      maskReferenceText: reference,
      operatorMode: s.recognitionIntentMode || 'neutralize',
      contextType: s.recognitionContextType || 'group-chat',
      exposureDuration: s.recognitionExposureDuration || 'single-use',
      flightPacket: result.phase37Telemetry?.flightPacket || null,
      diagnostics: result.patch38Diagnostics || result.phase34Diagnostics || null
    }
  };
}

function outboundPacket() {
  return exactOutboundPacket() || fallbackOutboundPacket();
}

function providerReports() {
  const result = resultState() || {};
  return result.patch38Diagnostics?.providerReports
    || result.providerReports
    || window.__TD613_HUSH_PATCH38_LAST_PROVIDER_REPORTS
    || [];
}

function providerLog() {
  if (!transformComplete()) return null;
  const result = resultState() || {};
  const reports = providerReports();
  return {
    schema: 'td613-hush-provider-log/v1',
    exportKind: reports.length ? 'inbound-provider-log' : 'local-transform-provider-note',
    direction: 'inbound',
    createdAt: new Date().toISOString(),
    note: reports.length
      ? 'Inbound provider return diagnostics from the latest Transform. This is not the outbound packet.'
      : 'No remote provider return was recorded for the latest completed local Transform. This log records that absence plus local diagnostics.',
    snapshot: result.patch38Snapshot || null,
    reports,
    diagnostics: result.patch38Diagnostics || result.phase34Diagnostics || null,
    propositionIntegrity: result.propositionIntegrity || null
  };
}

function writeJson(payload, filename) {
  const json = JSON.stringify(payload, null, 2);
  const out = $('ledgerExportOutput') || $('reportExportOutput');
  if (out) out.value = json;
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return json;
}

function setStatus(message) {
  const status = $('hushCustodyStatus');
  if (status) status.textContent = message;
}

function setButton(id, ready, title) {
  const button = $(id);
  if (!button) return;
  button.disabled = !ready;
  button.setAttribute('aria-disabled', ready ? 'false' : 'true');
  if (title) button.title = title;
}

function updateButtons() {
  const ready = transformComplete();
  setButton('hushExportPacketBtn', ready, ready ? 'Download the outbound packet for the latest completed Transform.' : 'Transform first to build a packet.');
  setButton('hushExportProviderLogBtn', ready, ready ? 'Download provider diagnostics for the latest completed Transform.' : 'Transform first to create provider diagnostics.');
}

function exportPacket(event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
  event?.stopImmediatePropagation?.();
  const payload = outboundPacket();
  if (!payload) { setStatus('Transform first; no packet is ready yet.'); updateButtons(); return null; }
  const suffix = payload.snapshot?.identity || Date.now().toString(36);
  const json = writeJson({ ...payload, exportedAt: new Date().toISOString() }, `hush-outbound-packet-${suffix}.json`);
  setStatus(payload.diagnosticFallback ? 'Fallback outbound packet exported from the completed local Transform.' : 'Outbound packet exported. This is not provider output.');
  updateButtons();
  return json;
}

function exportProviderLog(event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
  event?.stopImmediatePropagation?.();
  const payload = providerLog();
  if (!payload) { setStatus('Transform first; no provider diagnostics are ready yet.'); updateButtons(); return null; }
  const suffix = payload.snapshot?.identity || Date.now().toString(36);
  const json = writeJson(payload, `hush-provider-log-${suffix}.json`);
  setStatus(payload.reports?.length ? 'Provider log exported.' : 'Local transform provider-note exported; no remote provider return was recorded.');
  updateButtons();
  return json;
}

function bindButton(id, handler, key) {
  const button = $(id);
  if (!button || button.dataset[key] === 'true') return;
  button.dataset[key] = 'true';
  button.addEventListener('click', handler, true);
}

function wakeSoon() {
  [40, 160, 420, 900, 1800, 3200].forEach((delay) => window.setTimeout(updateButtons, delay));
}

function bind() {
  bindButton('hushExportPacketBtn', exportPacket, 'custodyWakePacket');
  bindButton('hushExportProviderLogBtn', exportProviderLog, 'custodyWakeProvider');
  updateButtons();
}

function boot() {
  bind();
  wakeSoon();
  window.setInterval(updateButtons, 1500);
}

for (const name of ['td613:hush:patch38-result', 'td613:hush:outbound-packet', 'td613:hush:patch38-approval']) {
  window.addEventListener(name, wakeSoon);
}
for (const id of ['generateMaskedOutputBtn', 'analyzeOutputBtn', 'protectedOutputInput']) {
  const eventName = id === 'protectedOutputInput' ? 'input' : 'click';
  const attach = () => $(id)?.addEventListener(eventName, wakeSoon);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach, { once: true });
  else attach();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
window.addEventListener('load', () => window.setTimeout(boot, 120));
window.__TD613_HUSH_CUSTODY_EXPORT_WAKE__ = { version: TD613_HUSH_CUSTODY_EXPORT_WAKE_VERSION, updateButtons, exportPacket, exportProviderLog, outboundPacket, providerLog };
