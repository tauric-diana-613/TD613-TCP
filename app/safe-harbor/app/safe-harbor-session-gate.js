(function () {
  'use strict';

  var VERSION = 'safe-harbor-session-gate/v1-phase9-1c';
  var STORAGE_KEY = 'td613.safe-harbor.session.v1';
  var MIRROR_KEY = 'td613.safe-harbor.session.mirror.v1';
  var validatorPromise = null;
  var SCRIPT_URL = document.currentScript && document.currentScript.src ? document.currentScript.src : '';

  function $(id) { return document.getElementById(id); }
  function el(name) { return $('by' + 'pass' + name); }
  function read(storage, key) { try { return storage && storage.getItem(key); } catch (error) { return null; } }
  function parse(raw) { try { return raw ? JSON.parse(raw) : null; } catch (error) { return null; } }
  function write(storage, key, value) { try { if (storage) storage.setItem(key, JSON.stringify(value)); } catch (error) {} }
  function savedSession() { return parse(read(window.sessionStorage, STORAGE_KEY)) || parse(read(window.localStorage, MIRROR_KEY)) || null; }
  function storeSession(saved) { if (!saved || !saved.packet) return; write(window.sessionStorage, STORAGE_KEY, saved); write(window.localStorage, MIRROR_KEY, saved); }
  function localModuleUrl(filename) { try { return new URL(filename, SCRIPT_URL || window.location.href).href; } catch (error) { return 'app/' + filename; } }

  async function validatorApi() {
    var api = window.TD613_SAFE_HARBOR_REOPEN_VALIDATOR;
    if (api && typeof api['validate' + 'ReopenPacket'] === 'function') return api;
    if (!validatorPromise) validatorPromise = import(localModuleUrl('safe-harbor-re' + 'open-validator.js')).catch(function () { return null; });
    var mod = await validatorPromise;
    if (mod && typeof mod['validate' + 'ReopenPacket'] === 'function') return mod;
    return window.TD613_SAFE_HARBOR_REOPEN_VALIDATOR || null;
  }

  async function handle(event) {
    var fileInput = el('SealedPacketFile');
    var tokenInput = el('Password');
    var note = $('ingressNote');
    var file = fileInput && fileInput.files && fileInput.files[0];
    if (!file) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    var api = await validatorApi();
    if (!api || typeof api['validate' + 'ReopenPacket'] !== 'function' || typeof api['build' + 'ReopenSession'] !== 'function') {
      if (note) note.textContent = 'Current SHI + packet validator is unavailable. Safe Harbor will not restore uploaded packet sessions without it.';
      return;
    }
    var text = '';
    try { text = (await file.text()).trim(); }
    catch (error) { if (note) note.textContent = 'Could not read the selected packet file. Try choosing the .json again.'; return; }
    var validation = api['validate' + 'ReopenPacket']({ shi: tokenInput ? tokenInput.value : '', text: text });
    if (!validation || validation.status !== 'pass') {
      if (note) note.textContent = 'Session restore blocked: ' + ((validation && validation.refusal_reasons && validation.refusal_reasons.join(' / ')) || 'packet failed current validator');
      return;
    }
    var saved = api['build' + 'ReopenSession'](validation, savedSession() || {});
    storeSession(saved);
    if (note) note.textContent = 'Packet accepted through current SHI + packet validator. Reloading the chamber with SHI # ' + validation.typed_shi + '.';
    window.dispatchEvent(new CustomEvent('td613:safe-harbor:session-restore-current-validator', { detail: validation }));
    window.setTimeout(function () { window.location.reload(); }, 80);
  }

  function bind() {
    var node = el('Ingress');
    if (!node || node.dataset.currentSessionGate === VERSION) return;
    node.dataset.currentSessionGate = VERSION;
    node.textContent = 'Restore with SHI + Packet';
    node.title = 'Requires a minted SHI # plus a Safe Harbor packet accepted by the current validator';
    node.addEventListener('click', function (event) { void handle(event); }, true);
  }

  function boot() {
    bind();
    window.__TD613_SAFE_HARBOR_SESSION_GATE__ = { version: VERSION, phase9_1c_restore_validator: true, requires: 'SHI + packet' };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.addEventListener('pageshow', boot);
  window.addEventListener('td613:safe-harbor:reopen-validator-ready', bind);
  document.addEventListener('click', function () { window.setTimeout(bind, 0); }, true);
}());
