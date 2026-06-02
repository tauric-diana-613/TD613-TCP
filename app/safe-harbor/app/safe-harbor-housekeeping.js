(function () {
  'use strict';

  var VERSION = 'pr149-safe-harbor-mobile-recall-hotfix/v1';
  var STORAGE_KEY = 'td613.safe-harbor.session.v1';
  var MIRROR_KEY = 'td613.safe-harbor.session.mirror.v1';
  var SHI_PATTERN = /^TD613-SH-9B07D8B-[A-F0-9]{8}$/i;
  var lastInputValue = '';

  function $(id) { return document.getElementById(id); }
  function text(value) { return String(value == null ? '' : value).trim(); }

  function read(storage, key) {
    try { return storage && storage.getItem(key); } catch (error) { return null; }
  }

  function write(storage, key, value) {
    try { if (storage && value) storage.setItem(key, value); } catch (error) {}
  }

  function remove(storage, key) {
    try { if (storage) storage.removeItem(key); } catch (error) {}
  }

  function parse(raw) {
    try { return raw ? JSON.parse(raw) : null; } catch (error) { return null; }
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
    if (!saved || !ingress) return false;
    return Boolean(
      ingress.vaultOpen ||
      ingress.operatorShellOpen ||
      ingress.packetId ||
      ingress.receiptId ||
      saved.packet ||
      saved.sealed ||
      hasIssuedShi(saved)
    );
  }

  function normalizeOpenSession(saved) {
    if (!sessionLooksOpen(saved)) return { saved: saved, changed: false, open: false };
    if (!saved.ingress || typeof saved.ingress !== 'object') saved.ingress = {};
    var changed = false;
    if (!saved.ingress.operatorShellOpen && !saved.ingress.vaultOpen) {
      saved.ingress.vaultOpen = true;
      changed = true;
    }
    if (saved.ingress.recovered !== true && (saved.packet || saved.sealed || hasIssuedShi(saved))) {
      saved.ingress.recovered = true;
      changed = true;
    }
    return { saved: saved, changed: changed, open: true };
  }

  function writeNormalized(storage, key, saved) {
    if (!saved) return;
    write(storage, key, JSON.stringify(saved));
  }

  function applyOpenDataset(open) {
    if (open) document.documentElement.dataset.safeHarborSessionOpen = 'true';
    else delete document.documentElement.dataset.safeHarborSessionOpen;
  }

  function activeSessionSnapshot() {
    return parse(read(window.sessionStorage, STORAGE_KEY)) || parse(read(window.localStorage, MIRROR_KEY));
  }

  function normalizeActiveSession() {
    var sessionRaw = read(window.sessionStorage, STORAGE_KEY);
    var mirrorRaw = read(window.localStorage, MIRROR_KEY);
    var saved = parse(sessionRaw) || parse(mirrorRaw);
    if (!saved) {
      applyOpenDataset(false);
      return null;
    }
    var result = normalizeOpenSession(saved);
    if (result.open) {
      writeNormalized(window.sessionStorage, STORAGE_KEY, result.saved);
      writeNormalized(window.localStorage, MIRROR_KEY, result.saved);
      applyOpenDataset(true);
      return result.saved;
    }
    applyOpenDataset(false);
    return result.saved;
  }

  function mirrorSession() {
    var raw = read(window.sessionStorage, STORAGE_KEY);
    var saved = parse(raw);
    if (!saved) return;
    var normalized = normalizeOpenSession(saved);
    if (normalized.changed) writeNormalized(window.sessionStorage, STORAGE_KEY, normalized.saved);
    writeNormalized(window.localStorage, MIRROR_KEY, normalized.saved);
    applyOpenDataset(normalized.open);
  }

  function restoreSessionMirror() {
    var sessionRaw = read(window.sessionStorage, STORAGE_KEY);
    var mirrorRaw = read(window.localStorage, MIRROR_KEY);
    var saved = parse(sessionRaw) || parse(mirrorRaw);
    if (!saved) return;
    var normalized = normalizeOpenSession(saved);
    writeNormalized(window.sessionStorage, STORAGE_KEY, normalized.saved);
    if (normalized.open || !mirrorRaw) writeNormalized(window.localStorage, MIRROR_KEY, normalized.saved);
    applyOpenDataset(normalized.open);
  }

  function enforceOpenMembrane() {
    var saved = normalizeActiveSession();
    var open = sessionLooksOpen(saved);
    var membrane = $('ingressMembrane');
    if (open && membrane) {
      membrane.hidden = true;
      membrane.classList.add('is-hidden');
    }
    if (document.body) {
      document.body.classList.toggle('vault-sealed', !open);
      document.body.classList.toggle('vault-open', open);
    }
  }

  function fixFlightLinks() {
    Array.from(document.querySelectorAll('a[href$="td613-flight.html"], a[href="/td613-flight.html"], a[href="/flight.html"], a[href="/flight"]')).forEach(function (link) {
      link.setAttribute('href', '/safe-harbor/td613-flight.html');
    });
  }

  function loadPr149Css() {
    if (document.querySelector('link[href*="safe-harbor-pr149-recall-hotfix.css"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'app/safe-harbor-pr149-recall-hotfix.css?v=' + encodeURIComponent(VERSION);
    document.head.appendChild(link);
  }

  function hardenScroll() {
    document.documentElement.classList.add('safe-harbor-pr147');
    document.documentElement.classList.add('safe-harbor-pr149');
    loadPr149Css();
    document.documentElement.style.overflowY = 'auto';
    document.body.style.overflowY = 'auto';
    document.body.style.touchAction = 'pan-y';
  }

  function emitInput(node) {
    if (!node) return;
    var ev;
    try {
      ev = new InputEvent('input', { bubbles: true, inputType: 'insertText', data: null });
    } catch (error) {
      ev = new Event('input', { bubbles: true });
    }
    node.dispatchEvent(ev);
  }

  function watchIngressTextarea() {
    var input = $('ingressStepInput');
    if (!input) return;
    var current = input.value || '';
    if (current !== lastInputValue) {
      lastInputValue = current;
      emitInput(input);
    }
  }

  function saveOnInput() {
    mirrorSession();
    setTimeout(mirrorSession, 50);
  }

  function hookProgrammaticInput() {
    var input = $('ingressStepInput');
    if (!input || input.dataset.pr147InputHooked) return;
    input.dataset.pr147InputHooked = VERSION;
    lastInputValue = input.value || '';
    ['input', 'change', 'keyup', 'paste', 'compositionend'].forEach(function (type) {
      input.addEventListener(type, saveOnInput, true);
    });
    input.addEventListener('blur', function () { emitInput(input); saveOnInput(); }, true);
    setInterval(watchIngressTextarea, 350);
  }

  function savedTriadReady() {
    var saved = activeSessionSnapshot();
    var segments = saved && saved.ingress && saved.ingress.segments ? saved.ingress.segments : {};
    return ['future_self', 'past_self', 'higher_self'].every(function (key) {
      return text(segments[key]).split(/\s+/).filter(Boolean).length >= 40;
    });
  }

  function hasMintedPacket() {
    var saved = activeSessionSnapshot();
    var issuance = saved && saved.packet && saved.packet.issuance ? saved.packet.issuance : null;
    return Boolean(issuance && SHI_PATTERN.test(text(issuance.badge_number)) && saved.packet);
  }

  function updateRecallGate() {
    var fold = $('ingressBypassFold');
    var pass = $('bypassPassword');
    var file = $('bypassSealedPacketFile');
    var button = $('bypassIngress');
    if (!fold || !pass || !button) return;
    var surfaceOpen = document.body.classList.contains('vault-open') || document.documentElement.dataset.safeHarborSessionOpen === 'true';
    var canRecall = hasMintedPacket() || savedTriadReady();
    var fileOk = file && file.files && file.files.length > 0;
    var shiOk = SHI_PATTERN.test(text(pass.value));
    var recallInputsOpen = !surfaceOpen;
    fold.dataset.pr147Ready = canRecall ? 'true' : 'false';
    fold.dataset.pr149RecallOpen = recallInputsOpen ? 'true' : 'false';
    pass.disabled = !recallInputsOpen;
    pass.setAttribute('aria-disabled', pass.disabled ? 'true' : 'false');
    if (file) {
      file.disabled = !recallInputsOpen;
      file.setAttribute('aria-disabled', file.disabled ? 'true' : 'false');
    }
    button.disabled = !recallInputsOpen || !shiOk || !fileOk;
    button.setAttribute('aria-disabled', button.disabled ? 'true' : 'false');
    var note = $('safeHarborPr147RecallNote');
    if (!note) {
      note = document.createElement('div');
      note.id = 'safeHarborPr147RecallNote';
      note.className = 'safe-harbor-pr147-note';
      var body = fold.querySelector('.ingress-bypass-body');
      if (body) body.appendChild(note);
    }
    if (note) {
      note.textContent = surfaceOpen
        ? 'Safe Harbor session is open. Ingress membrane remains bypassed until Sign Out or Clear Session.'
        : canRecall
          ? 'Recall fields are open. Reopen requires both the minted SHI and the exported sealed packet file.'
          : 'Recall fields are open for an exported packet. Minting a new packet still requires the completed triad.';
    }
    window.__TD613_SAFE_HARBOR_PR149_LAST = {
      version: VERSION,
      surfaceOpen: surfaceOpen,
      recallInputsOpen: recallInputsOpen,
      canRecallFromLocalSession: canRecall,
      shiOk: shiOk,
      fileOk: Boolean(fileOk),
      reopenReady: !button.disabled,
      at: new Date().toISOString()
    };
  }

  function wrapSignOut() {
    Array.from(document.querySelectorAll('#signOutIngress,#signOutVault,#railSignOut,#clearIngress')).forEach(function (button) {
      if (!button || button.dataset.pr147Signout) return;
      button.dataset.pr147Signout = VERSION;
      button.addEventListener('click', function () {
        remove(window.localStorage, MIRROR_KEY);
        applyOpenDataset(false);
      }, true);
    });
  }

  function boot() {
    restoreSessionMirror();
    hardenScroll();
    fixFlightLinks();
    hookProgrammaticInput();
    wrapSignOut();
    enforceOpenMembrane();
    updateRecallGate();
    mirrorSession();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.addEventListener('load', boot);
  window.addEventListener('storage', function (event) {
    if (!event.key || event.key === STORAGE_KEY || event.key === MIRROR_KEY) boot();
  });
  setInterval(function () {
    fixFlightLinks();
    hookProgrammaticInput();
    enforceOpenMembrane();
    updateRecallGate();
    mirrorSession();
  }, 900);

  window.TD613_SAFE_HARBOR_PR147 = Object.freeze({
    version: VERSION,
    boot: boot,
    normalizeActiveSession: normalizeActiveSession,
    sessionLooksOpen: sessionLooksOpen
  });
  window.TD613_SAFE_HARBOR_PR149 = Object.freeze({
    version: VERSION,
    boot: boot,
    updateRecallGate: updateRecallGate
  });
}());