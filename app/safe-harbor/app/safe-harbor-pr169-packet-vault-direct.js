(function () {
  'use strict';

  var VERSION = 'safe-harbor-pr169-packet-vault-direct/v2';
  var STORAGE_KEY = 'td613.safe-harbor.session.v1';
  var MIRROR_KEY = 'td613.safe-harbor.session.mirror.v1';

  function $(id) { return document.getElementById(id); }
  function text(value) { return String(value == null ? '' : value).trim(); }
  function parse(raw) { try { return raw ? JSON.parse(raw) : null; } catch (error) { return null; } }
  function read(storage, key) { try { return storage && storage.getItem(key); } catch (error) { return null; } }

  function savedSession() {
    return parse(read(window.sessionStorage, STORAGE_KEY)) || parse(read(window.localStorage, MIRROR_KEY)) || null;
  }

  function activePacket() {
    var saved = savedSession();
    return saved && saved.packet ? saved.packet : null;
  }

  function packetExportReady(packet) {
    return Boolean(
      packet &&
      packet.bridge &&
      packet.bridge.export_gate &&
      packet.bridge.export_gate.ready
    );
  }

  function packetText() {
    var packet = activePacket();
    if (packet) return JSON.stringify(packet, null, 2);
    var preview = $('forensicSchemaPreview');
    return preview ? text(preview.textContent || preview.value || '') : '';
  }

  function canOpenTxt() {
    var packet = activePacket();
    var exportButton = $('exportPacketPreview');
    return Boolean(packetExportReady(packet) || (exportButton && exportButton.disabled === false));
  }

  function openTxt() {
    if (!canOpenTxt()) {
      syncButton();
      return false;
    }
    var body = packetText();
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
        openTxt();
      });
    }
    return node;
  }

  function syncButton() {
    var node = bindButton();
    if (!node) return;
    var ready = canOpenTxt();
    node.disabled = !ready;
    node.setAttribute('aria-disabled', ready ? 'false' : 'true');
    node.title = ready ? 'Open the sealed packet as plain text in a new tab' : 'Open .txt unlocks after the packet is sealed/export-ready';
  }

  function boot() {
    document.documentElement.classList.add('safe-harbor-pr169');
    bindButton();
    syncButton();
    window.__TD613_SAFE_HARBOR_PR169__ = { version: VERSION, button: Boolean(button()), at: new Date().toISOString() };
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

  window.TD613_SAFE_HARBOR_PR169 = Object.freeze({ version: VERSION, boot: boot, openTxt: openTxt, syncButton: syncButton });
}());
