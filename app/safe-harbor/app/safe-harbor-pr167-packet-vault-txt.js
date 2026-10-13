(function () {
  'use strict';

  var VERSION = 'safe-harbor-pr167-packet-vault-txt/v3-session-mirror';
  var STORAGE_KEY = 'td613.safe-harbor.session.v1';
  var MIRROR_KEY = 'td613.safe-harbor.session.mirror.v1';
  var DESKTOP_QUERY = '(min-width: 721px)';
  var SHI_PATTERN = /^TD613-SH-9B07D8B-[A-F0-9]{8}$/i;

  function $(id) { return document.getElementById(id); }
  function text(value) { return String(value == null ? '' : value).trim(); }

  function parse(raw) {
    try { return raw ? JSON.parse(raw) : null; } catch (error) { return null; }
  }

  function read(storage, key) {
    try { return storage && storage.getItem(key); } catch (error) { return null; }
  }

  function write(storage, key, value) {
    try { if (storage && value) storage.setItem(key, value); } catch (error) {}
  }

  function remove(storage, key) {
    try { if (storage) storage.removeItem(key); } catch (error) {}
  }

  function hasIssuedShi(saved) {
    var issuance = saved && saved.packet && saved.packet.issuance ? saved.packet.issuance : null;
    var covenant = saved && saved.covenant ? saved.covenant : null;
    return Boolean(
      (issuance && SHI_PATTERN.test(text(issuance.badge_number))) ||
      (covenant && SHI_PATTERN.test(text(covenant.badgeNumber)))
    );
  }

  function sessionLooksOpen(saved) {
    var ingress = saved && saved.ingress ? saved.ingress : null;
    return Boolean(saved && ingress && (
      ingress.vaultOpen ||
      ingress.operatorShellOpen ||
      ingress.packetId ||
      ingress.receiptId ||
      saved.packet ||
      saved.sealed ||
      hasIssuedShi(saved)
    ));
  }

  function normalizeSession(saved) {
    if (!sessionLooksOpen(saved)) return saved;
    if (!saved.ingress || typeof saved.ingress !== 'object') saved.ingress = {};
    if (!saved.ingress.vaultOpen && !saved.ingress.operatorShellOpen) saved.ingress.vaultOpen = true;
    if ((saved.packet || saved.sealed || hasIssuedShi(saved)) && saved.ingress.recovered !== true) saved.ingress.recovered = true;
    return saved;
  }

  function mirrorSession() {
    var sessionRaw = read(window.sessionStorage, STORAGE_KEY);
    var mirrorRaw = read(window.localStorage, MIRROR_KEY);
    var saved = normalizeSession(parse(sessionRaw) || parse(mirrorRaw));
    if (!saved) return false;
    var raw = JSON.stringify(saved);
    write(window.sessionStorage, STORAGE_KEY, raw);
    write(window.localStorage, MIRROR_KEY, raw);
    if (sessionLooksOpen(saved)) {
      document.documentElement.dataset.safeHarborSessionOpen = 'true';
      if (document.body) {
        document.body.classList.add('vault-open');
        document.body.classList.remove('vault-sealed');
      }
      var membrane = $('ingressMembrane');
      if (membrane) {
        membrane.hidden = true;
        membrane.classList.add('is-hidden');
      }
    }
    window.__TD613_SAFE_HARBOR_PR167_SESSION_MIRROR__ = {
      version: VERSION,
      open: sessionLooksOpen(saved),
      packet: Boolean(saved.packet),
      at: new Date().toISOString()
    };
    return true;
  }

  function clearMirrors() {
    remove(window.sessionStorage, STORAGE_KEY);
    remove(window.localStorage, MIRROR_KEY);
    delete document.documentElement.dataset.safeHarborSessionOpen;
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

  function packetFilename() {
    var saved = parse(read(window.sessionStorage, STORAGE_KEY)) || parse(read(window.localStorage, MIRROR_KEY)) || {};
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

  function drawerTargets() {
    return Array.from(document.querySelectorAll([
      '#operatorMirrorSection details',
      '#operatorMirrorSection .dock-fold',
      '#operatorMirrorSection .fold-panel',
      '.operator-dock details',
      '.operator-dock .dock-fold',
      '.operator-dock .fold-panel',
      '.audit-dock details',
      '.audit-dock .dock-fold',
      '.audit-dock .fold-panel'
    ].join(','))).filter(function (node, index, list) {
      return node && node.tagName === 'DETAILS' && list.indexOf(node) === index;
    });
  }

  function desktopDrawerPreset() {
    var isDesktop = window.matchMedia ? window.matchMedia(DESKTOP_QUERY).matches : window.innerWidth >= 721;
    drawerTargets().forEach(function (drawer) {
      drawer.dataset.safeHarborDesktopPreset = isDesktop ? 'open' : 'closed';
      if (isDesktop) drawer.open = true;
      else drawer.open = false;
    });
    window.__TD613_SAFE_HARBOR_PR167_DRAWERS__ = {
      version: VERSION,
      desktop: isDesktop,
      drawers: drawerTargets().length,
      at: new Date().toISOString()
    };
  }

  function bindBreakpoint() {
    if (!window.matchMedia || document.documentElement.dataset.pr167DrawerBreakpoint === 'true') return;
    document.documentElement.dataset.pr167DrawerBreakpoint = 'true';
    var media = window.matchMedia(DESKTOP_QUERY);
    var handler = function () { window.setTimeout(desktopDrawerPreset, 0); };
    if (media.addEventListener) media.addEventListener('change', handler);
    else if (media.addListener) media.addListener(handler);
  }

  function bindClearHooks() {
    Array.from(document.querySelectorAll('#signOutIngress,#signOutVault,#railSignOut,#clearIngress')).forEach(function (button) {
      if (!button || button.dataset.safeHarborPr167ClearHook) return;
      button.dataset.safeHarborPr167ClearHook = VERSION;
      button.addEventListener('click', clearMirrors, true);
    });
  }

  function boot() {
    document.documentElement.classList.add('safe-harbor-pr167');
    mirrorSession();
    ensureButton();
    syncButton();
    desktopDrawerPreset();
    bindBreakpoint();
    bindClearHooks();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.addEventListener('load', boot);
  window.addEventListener('pageshow', boot);
  window.addEventListener('pagehide', mirrorSession);
  window.addEventListener('storage', boot);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') mirrorSession();
    else boot();
  });
  [120, 520, 1200, 2400].forEach(function (delay) { window.setTimeout(boot, delay); });
  setInterval(function () {
    mirrorSession();
    ensureButton();
    syncButton();
    bindClearHooks();
  }, 900);

  window.TD613_SAFE_HARBOR_PR167 = Object.freeze({ version: VERSION, boot: boot, openTxt: openTxt, syncButton: syncButton, desktopDrawerPreset: desktopDrawerPreset, mirrorSession: mirrorSession });
}());