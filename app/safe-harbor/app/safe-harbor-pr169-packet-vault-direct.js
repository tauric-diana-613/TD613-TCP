(function () {
  'use strict';

  var VERSION = 'safe-harbor-pr169-packet-vault-direct/v1';
  var STORAGE_KEY = 'td613.safe-harbor.session.v1';
  var MIRROR_KEY = 'td613.safe-harbor.session.mirror.v1';

  function $(id) { return document.getElementById(id); }
  function text(value) { return String(value == null ? '' : value).trim(); }
  function parse(raw) { try { return raw ? JSON.parse(raw) : null; } catch (error) { return null; } }
  function read(storage, key) { try { return storage && storage.getItem(key); } catch (error) { return null; } }

  function addStylesheet() {
    if (document.querySelector('link[href*="safe-harbor-pr167-packet-vault-polish.css"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'app/safe-harbor-pr167-packet-vault-polish.css?v=20260617-pr169-direct';
    (document.head || document.documentElement).appendChild(link);
  }

  function activePacket() {
    var saved = parse(read(window.sessionStorage, STORAGE_KEY)) || parse(read(window.localStorage, MIRROR_KEY));
    return saved && saved.packet ? saved.packet : null;
  }

  function packetText() {
    var packet = activePacket();
    if (packet) return JSON.stringify(packet, null, 2);
    var preview = $('forensicSchemaPreview');
    return preview ? text(preview.textContent || preview.value || '') : '';
  }

  function canOpenTxt() {
    var exportButton = $('exportPacketPreview');
    return Boolean(activePacket() || (exportButton && exportButton.disabled === false));
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

  function ensureButton() {
    var exportButton = $('exportPacketPreview');
    var resetButton = $('resetStagedPacket');
    if (!exportButton || !resetButton) return null;
    var button = $('openPacketTxtPreview');
    if (!button) {
      button = document.createElement('button');
      button.className = 'control secondary';
      button.id = 'openPacketTxtPreview';
      button.type = 'button';
      button.textContent = 'Open .txt';
      button.disabled = true;
      button.setAttribute('aria-disabled', 'true');
      resetButton.insertAdjacentElement('beforebegin', button);
    }
    if (button.dataset.pr169Bound !== VERSION) {
      button.dataset.pr169Bound = VERSION;
      button.addEventListener('click', function (event) {
        event.preventDefault();
        openTxt();
      });
    }
    return button;
  }

  function syncButton() {
    var button = ensureButton();
    if (!button) return;
    var ready = canOpenTxt();
    button.disabled = !ready;
    button.setAttribute('aria-disabled', ready ? 'false' : 'true');
    button.title = ready ? 'Open the sealed packet as plain text in a new tab' : 'Open .txt unlocks after the packet is sealed/export-ready';
  }

  function boot() {
    document.documentElement.classList.add('safe-harbor-pr147');
    document.documentElement.classList.add('safe-harbor-pr169');
    addStylesheet();
    ensureButton();
    syncButton();
    window.__TD613_SAFE_HARBOR_PR169__ = { version: VERSION, button: Boolean($('openPacketTxtPreview')), at: new Date().toISOString() };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.addEventListener('load', boot);
  window.addEventListener('pageshow', boot);
  document.addEventListener('td613:safe-harbor-packet', boot);
  [100, 360, 900, 1800, 3200].forEach(function (delay) { window.setTimeout(boot, delay); });
  window.setInterval(syncButton, 900);

  window.TD613_SAFE_HARBOR_PR169 = Object.freeze({ version: VERSION, boot: boot, openTxt: openTxt, syncButton: syncButton });
}());
