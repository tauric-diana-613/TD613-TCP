(function () {
  'use strict';

  var VERSION = 'pr147-safe-harbor-housekeeping/v1';
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

  function mirrorSession() {
    var raw = read(window.sessionStorage, STORAGE_KEY);
    if (raw) write(window.localStorage, MIRROR_KEY, raw);
  }

  function restoreSessionMirror() {
    var sessionRaw = read(window.sessionStorage, STORAGE_KEY);
    if (sessionRaw) return;
    var mirrorRaw = read(window.localStorage, MIRROR_KEY);
    if (!mirrorRaw) return;
    write(window.sessionStorage, STORAGE_KEY, mirrorRaw);
    var saved = parse(mirrorRaw);
    var ingress = saved && saved.ingress;
    if (ingress && (ingress.vaultOpen || ingress.operatorShellOpen)) {
      document.documentElement.dataset.safeHarborSessionOpen = 'true';
    }
  }

  function fixFlightLinks() {
    Array.from(document.querySelectorAll('a[href$="td613-flight.html"], a[href="/td613-flight.html"], a[href="/flight.html"], a[href="/flight"]')).forEach(function (link) {
      link.setAttribute('href', '/safe-harbor/td613-flight.html');
    });
  }

  function hardenScroll() {
    document.documentElement.classList.add('safe-harbor-pr147');
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
    var saved = parse(read(window.sessionStorage, STORAGE_KEY)) || parse(read(window.localStorage, MIRROR_KEY));
    var segments = saved && saved.ingress && saved.ingress.segments ? saved.ingress.segments : {};
    return ['future_self', 'past_self', 'higher_self'].every(function (key) {
      return text(segments[key]).split(/\s+/).filter(Boolean).length >= 40;
    });
  }

  function hasMintedPacket() {
    var saved = parse(read(window.sessionStorage, STORAGE_KEY)) || parse(read(window.localStorage, MIRROR_KEY));
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
    fold.dataset.pr147Ready = canRecall ? 'true' : 'false';
    pass.disabled = surfaceOpen || !canRecall;
    if (file) file.disabled = surfaceOpen || !canRecall;
    button.disabled = surfaceOpen || !canRecall || !shiOk || !fileOk;
    var note = $('safeHarborPr147RecallNote');
    if (!note) {
      note = document.createElement('div');
      note.id = 'safeHarborPr147RecallNote';
      note.className = 'safe-harbor-pr147-note';
      var body = fold.querySelector('.ingress-bypass-body');
      if (body) body.appendChild(note);
    }
    if (note) {
      note.textContent = canRecall
        ? 'Recall requires both the minted SHI and the exported sealed packet file.'
        : 'Recall stays locked until the triad is completed and a packet is minted/exported.';
    }
  }

  function wrapSignOut() {
    Array.from(document.querySelectorAll('#signOutIngress,#signOutVault,#railSignOut')).forEach(function (button) {
      if (!button || button.dataset.pr147Signout) return;
      button.dataset.pr147Signout = VERSION;
      button.addEventListener('click', function () {
        remove(window.localStorage, MIRROR_KEY);
      }, true);
    });
  }

  function boot() {
    restoreSessionMirror();
    hardenScroll();
    fixFlightLinks();
    hookProgrammaticInput();
    wrapSignOut();
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
    updateRecallGate();
    mirrorSession();
  }, 900);

  window.TD613_SAFE_HARBOR_PR147 = Object.freeze({ version: VERSION, boot: boot });
}());
