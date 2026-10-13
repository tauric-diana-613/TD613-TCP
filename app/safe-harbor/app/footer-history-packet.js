(function () {
  'use strict';
  const VERSION = 'safe-harbor-footer-history/v2-session-gate';
  const HISTORICAL_EXAMPLE = 'TD613-Binding:#9B07D8B/SAC[X6ZNK5NO51] · payload 5 · 2025-10-17 · ⟐';
  let busy = false;

  const $ = (id) => document.getElementById(id);
  const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

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

  async function refresh() { return false; }

  async function augmentPacket(packet) {
    if (!packet || packet.schema_version !== 'td613.safe-harbor.packet/v1' || !needsHistory(packet)) return packet;
    return addHistory(clone(packet));
  }

  function loadScriptOnce(id, src) {
    window.setTimeout(function () {
      if (document.getElementById(id)) return;
      const script = document.createElement('script');
      script.id = id;
      script.src = src;
      (document.body || document.documentElement).appendChild(script);
    }, 0);
  }

  function boot() {
    loadScriptOnce('td613SafeHarborSessionGate', 'app/safe-harbor-session-gate.js?v=20260620-phase9-1c');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

  window.TD613_SAFE_HARBOR_FOOTER_HISTORY = { version: VERSION, historicalExample: HISTORICAL_EXAMPLE, augmentPacket, refresh };
}());
