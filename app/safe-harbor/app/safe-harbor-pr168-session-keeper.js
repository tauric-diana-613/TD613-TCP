(function () {
  'use strict';

  var VERSION = 'safe-harbor-pr168-session-keeper/v1';
  var STORAGE_KEY = 'td613.safe-harbor.session.v1';
  var MIRROR_KEY = 'td613.safe-harbor.session.mirror.v1';
  var SHI_PATTERN = /^TD613-SH-9B07D8B-[A-F0-9]{8}$/i;

  function $(id) { return document.getElementById(id); }
  function text(value) { return String(value == null ? '' : value).trim(); }
  function parse(raw) { try { return raw ? JSON.parse(raw) : null; } catch (error) { return null; } }
  function read(storage, key) { try { return storage && storage.getItem(key); } catch (error) { return null; } }
  function write(storage, key, value) { try { if (storage && value) storage.setItem(key, value); } catch (error) {} }

  function hasIssuedShi(saved) {
    var issuance = saved && saved.packet && saved.packet.issuance ? saved.packet.issuance : null;
    var covenant = saved && saved.covenant ? saved.covenant : null;
    return Boolean(
      (issuance && SHI_PATTERN.test(text(issuance.badge_number))) ||
      (covenant && SHI_PATTERN.test(text(covenant.badgeNumber)))
    );
  }

  function looksOpen(saved) {
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

  function normalize(saved) {
    if (!looksOpen(saved)) return saved;
    if (!saved.ingress || typeof saved.ingress !== 'object') saved.ingress = {};
    if (!saved.ingress.vaultOpen && !saved.ingress.operatorShellOpen) saved.ingress.vaultOpen = true;
    if ((saved.packet || saved.sealed || hasIssuedShi(saved)) && saved.ingress.recovered !== true) saved.ingress.recovered = true;
    return saved;
  }

  function apply(open) {
    var membrane = $('ingressMembrane');
    if (open) document.documentElement.dataset.safeHarborSessionOpen = 'true';
    else delete document.documentElement.dataset.safeHarborSessionOpen;
    if (document.body) {
      document.body.classList.toggle('vault-open', Boolean(open));
      document.body.classList.toggle('vault-sealed', !open);
    }
    if (membrane && open) {
      membrane.hidden = true;
      membrane.classList.add('is-hidden');
    }
  }

  function keep() {
    var sessionRaw = read(window.sessionStorage, STORAGE_KEY);
    var mirrorRaw = read(window.localStorage, MIRROR_KEY);
    var saved = normalize(parse(sessionRaw) || parse(mirrorRaw));
    if (!saved) {
      apply(false);
      return false;
    }
    var raw = JSON.stringify(saved);
    write(window.sessionStorage, STORAGE_KEY, raw);
    write(window.localStorage, MIRROR_KEY, raw);
    apply(looksOpen(saved));
    window.__TD613_SAFE_HARBOR_PR168_SESSION__ = {
      version: VERSION,
      open: looksOpen(saved),
      packet: Boolean(saved.packet),
      at: new Date().toISOString()
    };
    return true;
  }

  function boot() {
    document.documentElement.classList.add('safe-harbor-pr168');
    keep();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.addEventListener('load', boot);
  window.addEventListener('pageshow', boot);
  window.addEventListener('pagehide', keep);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') keep();
    else boot();
  });
  [80, 240, 700, 1600, 3200].forEach(function (delay) { window.setTimeout(boot, delay); });
  window.setInterval(keep, 2400);

  window.TD613_SAFE_HARBOR_PR168_SESSION_KEEPER = Object.freeze({ version: VERSION, keep: keep });
}());
