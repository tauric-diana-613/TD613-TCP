(function () {
  'use strict';
  const VERSION = 'safe-harbor-footer-history/v1';
  const HISTORICAL_EXAMPLE = 'TD613-Binding:#9B07D8B/SAC[X6ZNK5NO51] · payload 5 · 2025-10-17 · ⟐';
  const enc = new TextEncoder();
  let busy = false;

  const $ = (id) => document.getElementById(id);
  const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

  function stable(value) {
    if (value === null || typeof value !== 'object') return JSON.stringify(value);
    if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']';
    return '{' + Object.keys(value).sort().map((key) => JSON.stringify(key) + ':' + stable(value[key])).join(',') + '}';
  }

  async function sha256(text) {
    const digest = await crypto.subtle.digest('SHA-256', enc.encode(String(text || '')));
    return 'sha256:' + Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  function isFooterKey(key) {
    return String(key || '').toLowerCase().indexOf('footer') !== -1;
  }

  function isActualFooterKey(key) {
    const k = String(key || '').toLowerCase();
    return k.indexOf('footer') !== -1 && k !== 'footer_mode';
  }

  function addHistory(value) {
    if (value === null || typeof value !== 'object') return value;
    if (Array.isArray(value)) return value.map(addHistory);
    const keys = Object.keys(value);
    const hasHistory = Object.prototype.hasOwnProperty.call(value, 'historical_example');
    const actualFooterKeys = keys.filter(isActualFooterKey);
    const anyFooterKeys = keys.filter(isFooterKey);
    const target = actualFooterKeys.length ? actualFooterKeys[actualFooterKeys.length - 1] : (anyFooterKeys.length ? anyFooterKeys[anyFooterKeys.length - 1] : null);
    const out = {};
    keys.forEach((key) => {
      out[key] = addHistory(value[key]);
      if (!hasHistory && target && key === target) out.historical_example = HISTORICAL_EXAMPLE;
    });
    return out;
  }

  function needsHistory(value) {
    if (value === null || typeof value !== 'object') return false;
    if (Array.isArray(value)) return value.some(needsHistory);
    const keys = Object.keys(value);
    if (keys.some(isFooterKey) && !Object.prototype.hasOwnProperty.call(value, 'historical_example')) return true;
    return keys.some((key) => needsHistory(value[key]));
  }

  async function updateHash(packet) {
    const material = clone(packet);
    if (material.signature) {
      material.signature.sig = null;
      material.signature.attached_at = null;
      if (material.signature.status === 'sealed') material.signature.status = 'declared';
    }
    material.packet_hash_sha256 = null;
    packet.packet_hash_sha256 = await sha256(stable(material));
    return packet;
  }

  function readPacket() {
    const node = $('packetPreview');
    if (!node) return null;
    const raw = String(node.textContent || '').trim();
    if (!raw || raw === 'packet pending') return null;
    try { return JSON.parse(raw); } catch (error) { return null; }
  }

  async function refresh() {
    if (busy) return;
    const node = $('packetPreview');
    const packet = readPacket();
    if (!node || !packet || packet.schema_version !== 'td613.safe-harbor.packet/v1' || !needsHistory(packet)) return;
    busy = true;
    try {
      const next = await updateHash(addHistory(clone(packet)));
      node.textContent = JSON.stringify(next, null, 2);
      const hash = $('packetHashReadout');
      if (hash && next.packet_hash_sha256) hash.textContent = next.packet_hash_sha256;
    } finally {
      busy = false;
    }
  }

  function boot() {
    const node = $('packetPreview');
    if (node && node.dataset.footerHistoryPacket !== VERSION) {
      node.dataset.footerHistoryPacket = VERSION;
      new MutationObserver(() => window.setTimeout(refresh, 0)).observe(node, { childList: true, characterData: true, subtree: true });
    }
    window.setTimeout(refresh, 0);
    window.setTimeout(refresh, 300);
    window.setTimeout(refresh, 900);
    window.setTimeout(refresh, 1800);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

  window.TD613_SAFE_HARBOR_FOOTER_HISTORY = { version: VERSION, historicalExample: HISTORICAL_EXAMPLE, refresh };
}());
