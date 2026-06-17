(function () {
  'use strict';

  var VERSION = 'safe-harbor-pr169-packet-vault-direct/v4-probe-footer-history';
  var STORAGE_KEY = 'td613.safe-harbor.session.v1';
  var MIRROR_KEY = 'td613.safe-harbor.session.mirror.v1';
  var HISTORICAL_EXAMPLE = 'TD613-Binding:#9B07D8B/SAC[X6ZNK5NO51] · payload 5 · 2025-10-17 · ⟐';

  function $(id) { return document.getElementById(id); }
  function text(value) { return String(value == null ? '' : value).trim(); }
  function parse(raw) { try { return raw ? JSON.parse(raw) : null; } catch (error) { return null; } }
  function read(storage, key) { try { return storage && storage.getItem(key); } catch (error) { return null; } }
  function write(storage, key, value) { try { if (storage) storage.setItem(key, JSON.stringify(value)); } catch (error) {} }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }

  function stable(value) {
    if (value === null || typeof value !== 'object') return JSON.stringify(value);
    if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']';
    return '{' + Object.keys(value).sort().map(function (key) {
      return JSON.stringify(key) + ':' + stable(value[key]);
    }).join(',') + '}';
  }

  function hex(buffer) {
    return Array.from(new Uint8Array(buffer)).map(function (b) {
      return b.toString(16).padStart(2, '0');
    }).join('');
  }

  async function sha256(textValue) {
    var enc = new TextEncoder();
    var digest = await crypto.subtle.digest('SHA-256', enc.encode(String(textValue || '')));
    return 'sha256:' + hex(digest);
  }

  function isFooterKey(key) {
    return String(key || '').toLowerCase().indexOf('footer') !== -1;
  }

  function isActualFooterKey(key) {
    var k = String(key || '').toLowerCase();
    return k.indexOf('footer') !== -1 && k !== 'footer_mode';
  }

  function addHistory(value) {
    if (value === null || typeof value !== 'object') return value;
    if (Array.isArray(value)) return value.map(addHistory);
    var keys = Object.keys(value);
    var hasHistory = Object.prototype.hasOwnProperty.call(value, 'historical_example');
    var actualFooterKeys = keys.filter(isActualFooterKey);
    var anyFooterKeys = keys.filter(isFooterKey);
    var target = actualFooterKeys.length
      ? actualFooterKeys[actualFooterKeys.length - 1]
      : (anyFooterKeys.length ? anyFooterKeys[anyFooterKeys.length - 1] : null);
    var out = {};
    keys.forEach(function (key) {
      out[key] = addHistory(value[key]);
      if (!hasHistory && target && key === target) out.historical_example = HISTORICAL_EXAMPLE;
    });
    return out;
  }

  function addHistoryAfterPublicFooter(value) {
    if (value === null || typeof value !== 'object') return value;
    if (Array.isArray(value)) return value.map(addHistoryAfterPublicFooter);
    var keys = Object.keys(value);
    var hasPublicFooter = Object.prototype.hasOwnProperty.call(value, 'public_footer');
    var hasHistory = Object.prototype.hasOwnProperty.call(value, 'historical_example');
    var out = {};
    keys.forEach(function (key) {
      out[key] = addHistoryAfterPublicFooter(value[key]);
      if (hasPublicFooter && !hasHistory && key === 'public_footer') {
        out.historical_example = HISTORICAL_EXAMPLE;
      }
    });
    return out;
  }

  function needsHistory(value) {
    if (value === null || typeof value !== 'object') return false;
    if (Array.isArray(value)) return value.some(needsHistory);
    var keys = Object.keys(value);
    if (keys.some(isFooterKey) && !Object.prototype.hasOwnProperty.call(value, 'historical_example')) return true;
    return keys.some(function (key) { return needsHistory(value[key]); });
  }

  function packetHashMaterial(packet) {
    var material = clone(packet);
    if (material && material.signature) {
      material.signature.sig = null;
      material.signature.attached_at = null;
      if (material.signature.status === 'sealed') material.signature.status = 'declared';
    }
    if (material) material.packet_hash_sha256 = null;
    return material;
  }

  async function normalizePacket(packet) {
    if (!packet || typeof packet !== 'object') return packet;
    var patched = needsHistory(packet) ? addHistory(clone(packet)) : clone(packet);
    if (patched && patched.schema_version === 'td613.safe-harbor.packet/v1') {
      patched.packet_hash_sha256 = await sha256(stable(packetHashMaterial(patched)));
    }
    return patched;
  }

  function savedSession() {
    return parse(read(window.sessionStorage, STORAGE_KEY)) || parse(read(window.localStorage, MIRROR_KEY)) || null;
  }

  function storeSession(saved) {
    if (!saved || !saved.packet) return;
    write(window.sessionStorage, STORAGE_KEY, saved);
    write(window.localStorage, MIRROR_KEY, saved);
  }

  async function activePacket() {
    var saved = savedSession();
    var packet = saved && saved.packet ? saved.packet : null;
    if (!packet) return null;
    var patched = await normalizePacket(packet);
    if (saved && JSON.stringify(patched) !== JSON.stringify(packet)) {
      saved.packet = patched;
      storeSession(saved);
    }
    return patched;
  }

  function activePacketSync() {
    var saved = savedSession();
    return saved && saved.packet ? addHistory(clone(saved.packet)) : null;
  }

  function packetExportReady(packet) {
    return Boolean(
      packet &&
      packet.bridge &&
      packet.bridge.export_gate &&
      packet.bridge.export_gate.ready
    );
  }

  async function packetText() {
    var packet = await activePacket();
    if (packet) return JSON.stringify(packet, null, 2) + '\n';
    var preview = $('forensicSchemaPreview');
    return preview ? text(preview.textContent || preview.value || '') : '';
  }

  function canOpenTxt() {
    var packet = activePacketSync();
    var exportButton = $('exportPacketPreview');
    return Boolean(packetExportReady(packet) || (exportButton && exportButton.disabled === false));
  }

  function packetFilename(packet) {
    var helperTs = packet && packet.intake && packet.intake.helper_filename_safe;
    var created = packet && (packet.created_at || (packet.receipt && packet.receipt.minted_at));
    var ts = helperTs || String(created || new Date().toISOString()).replace(/[:.]/g, '-');
    var stage = packet && packet.seal_handshake
      ? 'sealed'
      : (packet && packet.issuance && packet.issuance.badge_number ? 'minted' : 'staged');
    var shi = packet && packet.issuance && packet.issuance.badge_number ? '-' + packet.issuance.badge_number : '';
    var batch = packet && packet.intake && packet.intake.selected_batch_id ? '-' + packet.intake.selected_batch_id : '';
    return 'td613-packet' + batch + '-' + stage + shi + '-' + ts + '.json';
  }

  function downloadJson(filename, value) {
    var blob = new Blob([JSON.stringify(value, null, 2) + '\n'], { type: 'application/json;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename || 'td613-safe-harbor-packet.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 0);
  }

  function copyText(value) {
    var body = String(value || '');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(body).catch(function () { fallbackCopy(body); });
    }
    fallbackCopy(body);
    return Promise.resolve();
  }

  function fallbackCopy(value) {
    var textarea = document.createElement('textarea');
    textarea.value = String(value || '');
    textarea.setAttribute('readonly', 'readonly');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try { document.execCommand('copy'); } catch (error) {}
    textarea.remove();
  }

  function syncPreview(packet) {
    var preview = $('packetPreview');
    if (preview && packet) preview.textContent = JSON.stringify(packet, null, 2);
    var hash = $('packetHashReadout');
    if (hash && packet && packet.packet_hash_sha256) hash.textContent = packet.packet_hash_sha256;
  }

  async function normalizeVisiblePacket() {
    var packet = await activePacket();
    if (packet) syncPreview(packet);
    return packet;
  }

  function patchProbeText(raw) {
    var body = String(raw || '');
    if (!body) return body;
    var parsed = parse(body);
    if (parsed && typeof parsed === 'object') {
      return JSON.stringify(addHistoryAfterPublicFooter(parsed), null, 2);
    }
    if (body.indexOf('- canonical_footer:') === -1 || body.indexOf('- historical_example:') !== -1) return body;
    return body.replace(/(^- canonical_footer:.*$)/m, '$1\n- historical_example: ' + HISTORICAL_EXAMPLE);
  }

  function patchProbeOutput() {
    var node = $('probeOutput');
    if (!node) return null;
    var current = 'value' in node ? node.value : node.textContent;
    var patched = patchProbeText(current);
    if (patched !== current) {
      if ('value' in node) node.value = patched;
      else node.textContent = patched;
    }
    return patched;
  }

  async function openTxt() {
    if (!canOpenTxt()) {
      syncButton();
      return false;
    }
    var body = await packetText();
    if (!body) {
      syncButton();
      return false;
    }
    var blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) {
      var a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.download = 'TD613-Safe-Harbor-packet.txt';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 120000);
    return true;
  }

  function button() {
    return $('openPacketTxtPreview');
  }

  function bindButton() {
    var node = button();
    if (!node) return null;
    if (node.dataset.pr169Bound !== VERSION) {
      node.dataset.pr169Bound = VERSION;
      node.addEventListener('click', function (event) {
        event.preventDefault();
        void openTxt();
      });
    }
    return node;
  }

  function bindPacketExports() {
    var exportButton = $('exportPacketPreview');
    if (exportButton && exportButton.dataset.footerHistoryExport !== VERSION) {
      exportButton.dataset.footerHistoryExport = VERSION;
      exportButton.addEventListener('click', function (event) {
        var raw = activePacketSync();
        if (!packetExportReady(raw)) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        void normalizeVisiblePacket().then(function (packet) {
          if (!packet) return;
          downloadJson(packetFilename(packet), packet);
        });
      }, true);
    }

    var packetCopyButton = $('copyPacketPreview');
    if (packetCopyButton && packetCopyButton.dataset.footerHistoryCopy !== VERSION) {
      packetCopyButton.dataset.footerHistoryCopy = VERSION;
      packetCopyButton.addEventListener('click', function (event) {
        var raw = activePacketSync();
        if (!raw) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        void normalizeVisiblePacket().then(function (packet) {
          if (packet) void copyText(JSON.stringify(packet, null, 2) + '\n');
        });
      }, true);
    }

    var exportCopyButton = $('copyForensicSchemaPreview');
    if (exportCopyButton && exportCopyButton.dataset.footerHistoryCopy !== VERSION) {
      exportCopyButton.dataset.footerHistoryCopy = VERSION;
      exportCopyButton.addEventListener('click', function (event) {
        var raw = activePacketSync();
        if (!packetExportReady(raw)) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        void normalizeVisiblePacket().then(function (packet) {
          if (packet) void copyText(JSON.stringify(packet, null, 2) + '\n');
        });
      }, true);
    }
  }

  function bindProbeOutputs() {
    var probeButtons = Array.from(document.querySelectorAll('[data-probe-variant]'));
    probeButtons.forEach(function (buttonNode) {
      if (buttonNode.dataset.footerHistoryProbe === VERSION) return;
      buttonNode.dataset.footerHistoryProbe = VERSION;
      buttonNode.addEventListener('click', function () {
        window.setTimeout(patchProbeOutput, 0);
      }, false);
    });

    var copyProbe = $('copyProbeOutput');
    if (copyProbe && copyProbe.dataset.footerHistoryProbeCopy !== VERSION) {
      copyProbe.dataset.footerHistoryProbeCopy = VERSION;
      copyProbe.addEventListener('click', function () {
        patchProbeOutput();
      }, true);
    }
  }

  function patchApi() {
    var api = window.TD613SafeHarbor;
    if (!api || api.__footerHistoryPatch === VERSION) return;
    if (typeof api.buildPacket === 'function') {
      var originalBuildPacket = api.buildPacket.bind(api);
      api.buildPacket = async function () {
        var packet = await originalBuildPacket();
        return normalizePacket(packet);
      };
    }
    if (typeof api.buildProbe === 'function') {
      var originalBuildProbe = api.buildProbe.bind(api);
      api.buildProbe = function (variant) {
        var result = originalBuildProbe(variant);
        var patched = patchProbeText(result);
        var node = $('probeOutput');
        if (node) {
          if ('value' in node) node.value = patched;
          else node.textContent = patched;
        }
        return patched;
      };
    }
    api.__footerHistoryPatch = VERSION;
  }

  function syncButton() {
    var node = bindButton();
    bindPacketExports();
    bindProbeOutputs();
    patchApi();
    void normalizeVisiblePacket();
    patchProbeOutput();
    if (!node) return;
    var ready = canOpenTxt();
    node.disabled = !ready;
    node.setAttribute('aria-disabled', ready ? 'false' : 'true');
    node.title = ready ? 'Open the sealed packet as plain text in a new tab' : 'Open .txt unlocks after the packet is sealed/export-ready';
  }

  function boot() {
    document.documentElement.classList.add('safe-harbor-pr169');
    bindButton();
    bindPacketExports();
    bindProbeOutputs();
    patchApi();
    syncButton();
    window.__TD613_SAFE_HARBOR_PR169__ = { version: VERSION, button: Boolean(button()), at: new Date().toISOString(), footer_history: HISTORICAL_EXAMPLE };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.addEventListener('load', boot);
  window.addEventListener('pageshow', boot);
  window.addEventListener('storage', syncButton);
  document.addEventListener('td613:safe-harbor-packet', syncButton);
  ['click', 'input', 'change'].forEach(function (type) {
    document.addEventListener(type, function () { window.setTimeout(syncButton, 0); }, true);
  });
  [100, 360, 900, 1800].forEach(function (delay) { window.setTimeout(syncButton, delay); });
  window.setInterval(syncButton, 900);

  window.TD613_SAFE_HARBOR_PR169 = Object.freeze({
    version: VERSION,
    boot: boot,
    openTxt: openTxt,
    syncButton: syncButton,
    historicalExample: HISTORICAL_EXAMPLE,
    patchProbeText: patchProbeText
  });
}());