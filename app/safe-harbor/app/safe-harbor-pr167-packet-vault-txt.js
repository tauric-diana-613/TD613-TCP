(function () {
  'use strict';

  var VERSION = 'safe-harbor-pr167-packet-vault-txt/v1';
  var STORAGE_KEY = 'td613.safe-harbor.session.v1';
  var MIRROR_KEY = 'td613.safe-harbor.session.mirror.v1';

  function $(id) { return document.getElementById(id); }
  function text(value) { return String(value == null ? '' : value).trim(); }

  function parse(raw) {
    try { return raw ? JSON.parse(raw) : null; } catch (error) { return null; }
  }

  function activePacket() {
    var saved = parse(sessionStorage.getItem(STORAGE_KEY)) || parse(localStorage.getItem(MIRROR_KEY));
    return saved && saved.packet ? saved.packet : null;
  }

  function packetText() {
    var packet = activePacket();
    if (packet) return JSON.stringify(packet, null, 2);
    var preview = $('forensicSchemaPreview');
    return preview ? text(preview.textContent || preview.value || '') : '';
  }

  function packetFilename() {
    var saved = parse(sessionStorage.getItem(STORAGE_KEY)) || parse(localStorage.getItem(MIRROR_KEY)) || {};
    var packet = saved.packet || {};
    var issuance = packet.issuance || {};
    var badge = text(issuance.badge_number || (saved.covenant && saved.covenant.badgeNumber) || 'TD613-SH-packet');
    return badge.replace(/[^A-Za-z0-9._-]+/g, '_') + '.txt';
  }

  function canOpenTxt() {
    var exportButton = $('exportPacketPreview');
    return Boolean(activePacket() || (exportButton && exportButton.disabled === false));
  }

  function syncButton() {
    var button = $('openPacketTxtPreview');
    if (!button) return;
    var ready = canOpenTxt();
    button.disabled = !ready;
    button.setAttribute('aria-disabled', ready ? 'false' : 'true');
    button.title = ready ? 'Open the sealed packet as plain text in a new tab' : 'Open .txt unlocks after the packet is sealed/export-ready';
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
      var fallback = document.createElement('a');
      fallback.href = url;
      fallback.target = '_blank';
      fallback.rel = 'noopener noreferrer';
      fallback.download = packetFilename();
      document.body.appendChild(fallback);
      fallback.click();
      fallback.remove();
    }
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 120000);
    return true;
  }

  function ensureButton() {
    var exportButton = $('exportPacketPreview');
    var resetButton = $('resetStagedPacket');
    if (!exportButton || !resetButton) return null;
    var existing = $('openPacketTxtPreview');
    if (existing) return existing;
    var button = document.createElement('button');
    button.className = 'control secondary';
    button.id = 'openPacketTxtPreview';
    button.type = 'button';
    button.textContent = 'Open .txt';
    button.disabled = true;
    button.setAttribute('aria-disabled', 'true');
    resetButton.insertAdjacentElement('beforebegin', button);
    button.addEventListener('click', function (event) {
      event.preventDefault();
      openTxt();
    });
    return button;
  }

  function boot() {
    document.documentElement.classList.add('safe-harbor-pr167');
    ensureButton();
    syncButton();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.addEventListener('load', boot);
  window.addEventListener('storage', boot);
  setInterval(function () {
    ensureButton();
    syncButton();
  }, 900);

  window.TD613_SAFE_HARBOR_PR167 = Object.freeze({ version: VERSION, boot: boot, openTxt: openTxt, syncButton: syncButton });
}());
