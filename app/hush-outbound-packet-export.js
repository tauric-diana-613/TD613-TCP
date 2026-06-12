const HUSH_OUTBOUND_PACKET_EXPORT_VERSION = 'outbound-packet-export/v1';
const $ = (id) => document.getElementById(id);

function state() {
  return window.__TD613_HUSH_BENCH__?.benchState || {};
}

function currentOutboundPacket() {
  return window.__TD613_HUSH_PATCH38_LAST_OUTBOUND_PACKET
    || window.__TD613_HUSH_PATCH38__?.lastOutboundPacket?.()
    || state().hushOutboundPacket
    || state().hushSwapResult?.outboundPacket
    || null;
}

function setStatus(message = '') {
  const status = $('hushCustodyStatus');
  if (status) status.textContent = message;
}

function writeExportOutput(json = '') {
  const out = $('ledgerExportOutput') || $('reportExportOutput');
  if (out) out.value = json;
}

function downloadJson(payload = {}, filename = 'hush-outbound-packet.json') {
  const json = JSON.stringify(payload, null, 2);
  writeExportOutput(json);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
  return json;
}

function updateOutboundPacketButton() {
  const packet = currentOutboundPacket();
  const button = $('hushExportPacketBtn');
  if (!button) return;
  const ready = Boolean(packet?.contract || packet?.flightPacket || packet?.packet);
  button.disabled = !ready;
  button.setAttribute('aria-disabled', ready ? 'false' : 'true');
  button.title = ready
    ? 'Download the outbound Hush generator contract built at the latest Transform.'
    : 'Transform first to build an outbound Hush packet.';
}

function exportOutboundPacket(event = null) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }
  const packet = currentOutboundPacket();
  if (!packet) {
    setStatus('Transform first; no outbound Hush packet is ready to export yet.');
    updateOutboundPacketButton();
    return null;
  }
  const identity = packet.snapshot?.identity || Date.now().toString(36);
  const payload = {
    ...packet,
    schema: packet.schema || 'td613-hush-outbound-packet/v1',
    exportKind: 'outbound-generator-contract',
    direction: 'outbound',
    exportedAt: new Date().toISOString(),
    note: packet.note || 'Outbound Hush generator contract built at Transform time. This is not Gemini output.'
  };
  const json = downloadJson(payload, `hush-outbound-packet-${identity}.json`);
  setStatus('Outbound Hush packet exported. This is the Transform-time packet/contract, not Gemini output.');
  updateOutboundPacketButton();
  return json;
}

function bindOutboundPacketExport() {
  const button = $('hushExportPacketBtn');
  if (!button) return false;
  if (button.dataset.outboundPacketExport !== 'true') {
    button.dataset.outboundPacketExport = 'true';
    button.addEventListener('click', exportOutboundPacket, true);
  }
  updateOutboundPacketButton();
  return true;
}

function boot() {
  bindOutboundPacketExport();
  window.setTimeout(bindOutboundPacketExport, 120);
  window.setTimeout(bindOutboundPacketExport, 500);
}

window.addEventListener('td613:hush:outbound-packet', () => window.setTimeout(updateOutboundPacketButton, 30));
window.addEventListener('td613:hush:patch38-result', () => window.setTimeout(updateOutboundPacketButton, 30));
window.addEventListener('load', () => window.setTimeout(boot, 120));
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
window.__TD613_HUSH_OUTBOUND_PACKET_EXPORT__ = { version: HUSH_OUTBOUND_PACKET_EXPORT_VERSION, currentOutboundPacket, exportOutboundPacket, updateOutboundPacketButton };
