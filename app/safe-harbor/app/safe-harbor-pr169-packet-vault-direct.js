(function () {
  'use strict';

  var VERSION = 'safe-harbor-pr169-packet-vault-direct/v15-phase9-release-discipline';
  var STORAGE_KEY = 'td613.safe-harbor.session.v1';
  var MIRROR_KEY = 'td613.safe-harbor.session.mirror.v1';
  var HISTORICAL_EXAMPLE = 'TD613-Binding:#9B07D8B/SAC[X6ZNK5NO51] · payload 5 · 2025-10-17 · ⟐';
  var SCRIPT_URL = document.currentScript && document.currentScript.src ? document.currentScript.src : '';
  var finalizerPromise = null;
  var phase5Promise = null;
  var outsideWitnessPromise = null;
  var publicGatePromise = null;
  var releaseDisciplinePromise = null;

  function $(id) { return document.getElementById(id); }
  function parse(raw) { try { return raw ? JSON.parse(raw) : null; } catch (error) { return null; } }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function read(storage, key) { try { return storage && storage.getItem(key); } catch (error) { return null; } }
  function write(storage, key, value) { try { if (storage) storage.setItem(key, JSON.stringify(value)); } catch (error) {} }
  function localModuleUrl(filename) { try { return new URL(filename, SCRIPT_URL || window.location.href).href; } catch (error) { return 'app/' + filename; } }

  function savedSession() { return parse(read(window.sessionStorage, STORAGE_KEY)) || parse(read(window.localStorage, MIRROR_KEY)) || null; }
  function storeSession(saved) {
    if (!saved || !saved.packet) return;
    write(window.sessionStorage, STORAGE_KEY, saved);
    write(window.localStorage, MIRROR_KEY, saved);
  }
  function rawSegmentsFromSaved(saved) {
    var source = saved && saved.ingress && saved.ingress.segments ? saved.ingress.segments : null;
    if (!source && saved && saved.sealed && saved.sealed.segments) source = saved.sealed.segments;
    if (!source || typeof source !== 'object') return null;
    var out = {};
    ['future_self', 'past_self', 'higher_self'].forEach(function (key) {
      var value = source[key];
      out[key] = typeof value === 'string' ? value : (value && typeof value.raw_text === 'string' ? value.raw_text : '');
    });
    return out.future_self && out.past_self && out.higher_self ? out : null;
  }
  function hasRawSegments(saved) { return Boolean(rawSegmentsFromSaved(saved)); }

  async function finalizerApi() {
    var api = window.TD613_SAFE_HARBOR_NATIVE_FINALIZER;
    if (api && typeof api.finalizeSafeHarborPacket === 'function') return api;
    if (!finalizerPromise) finalizerPromise = import(localModuleUrl('safe-harbor-native-finalizer.js')).catch(function () { return null; });
    var mod = await finalizerPromise;
    if (mod && typeof mod.finalizeSafeHarborPacket === 'function') return mod;
    api = window.TD613_SAFE_HARBOR_NATIVE_FINALIZER;
    return api && typeof api.finalizeSafeHarborPacket === 'function' ? api : null;
  }
  async function phase5Api() {
    var api = window.TD613_SAFE_HARBOR_PHASE5;
    if (api && typeof api.buildPhase5ReplayHardening === 'function') return api;
    if (!phase5Promise) phase5Promise = import(localModuleUrl('safe-harbor-phase5-replay-hardening.js')).catch(function () { return null; });
    var mod = await phase5Promise;
    if (mod && typeof mod.buildPhase5ReplayHardening === 'function') return mod;
    api = window.TD613_SAFE_HARBOR_PHASE5;
    return api && typeof api.buildPhase5ReplayHardening === 'function' ? api : null;
  }
  async function outsideWitnessApi() {
    var api = window.TD613_SAFE_HARBOR_OUTSIDE_WITNESS;
    if (api && typeof api.buildOutsideWitnessAlignment === 'function') return api;
    if (!outsideWitnessPromise) outsideWitnessPromise = import(localModuleUrl('safe-harbor-outside-witness-alignment.js')).catch(function () { return null; });
    var mod = await outsideWitnessPromise;
    if (mod && typeof mod.buildOutsideWitnessAlignment === 'function') return mod;
    api = window.TD613_SAFE_HARBOR_OUTSIDE_WITNESS;
    return api && typeof api.buildOutsideWitnessAlignment === 'function' ? api : null;
  }
  async function publicGateApi() {
    var api = window.TD613_SAFE_HARBOR_PUBLIC_DEFAULT_GATE;
    if (api && typeof api.applyPublicDefaultGate === 'function') return api;
    if (!publicGatePromise) publicGatePromise = import(localModuleUrl('safe-harbor-public-default-gate.js')).catch(function () { return null; });
    var mod = await publicGatePromise;
    if (mod && typeof mod.applyPublicDefaultGate === 'function') return mod;
    api = window.TD613_SAFE_HARBOR_PUBLIC_DEFAULT_GATE;
    return api && typeof api.applyPublicDefaultGate === 'function' ? api : null;
  }
  async function releaseDisciplineApi() {
    var api = window.TD613_SAFE_HARBOR_RELEASE_DISCIPLINE;
    if (api && typeof api.applyReleaseDiscipline === 'function') return api;
    if (!releaseDisciplinePromise) releaseDisciplinePromise = import(localModuleUrl('safe-harbor-release-discipline.js')).catch(function () { return null; });
    var mod = await releaseDisciplinePromise;
    if (mod && typeof mod.applyReleaseDiscipline === 'function') return mod;
    api = window.TD613_SAFE_HARBOR_RELEASE_DISCIPLINE;
    return api && typeof api.applyReleaseDiscipline === 'function' ? api : null;
  }

  function nativeBorn(packet) { return Boolean(packet && packet.native_spine_purification && packet.native_spine_purification.status === 'native'); }
  function exportHardened(packet) { return Boolean(packet && packet.native_spine_purification && packet.native_spine_purification.status === 'export-hardened'); }

  async function attachOutsideWitness(packet) {
    var api = await outsideWitnessApi();
    if (!api || typeof api.buildOutsideWitnessAlignment !== 'function') return packet;
    var out = clone(packet);
    var alignment = await api.buildOutsideWitnessAlignment(out);
    out.outside_witness_alignment = alignment;
    out.step1_countersignature = alignment.step1_countersignature;
    out.countersignatory_intake = alignment.countersignatory_intake;
    out.renderer_authority_metadata = alignment.renderer_authority_metadata;
    out.svg_authority_metadata = alignment.svg_authority_metadata;
    out.signature_overlay_authority = alignment.signature_overlay_authority;
    out.tcp_hook_authority = alignment.tcp_hook_authority;
    out.eo_hook_authority = alignment.eo_hook_authority;
    out.outside_witness_receipt = alignment.outside_witness_receipt;
    if (out.phase4_recall_intake && alignment.step1_countersignature) {
      out.phase4_recall_intake.countersignature_evidence_review = {
        schema_version: 'td613.safe-harbor.countersignature-evidence-review/v1',
        step1_can_countersign: Boolean(alignment.step1_countersignature.can_countersign),
        step1_recommended_action: alignment.step1_countersignature.recommended_action,
        refusal_reasons: alignment.step1_countersignature.refusal_reasons || [],
        public_default: 'v2',
        raw_text_exported: false
      };
    }
    return out;
  }
  async function attachPublicDefaultGate(packet) {
    var api = await publicGateApi();
    if (!api || typeof api.applyPublicDefaultGate !== 'function') return packet;
    return api.applyPublicDefaultGate(packet, { phase8Policy: { public_display_mode: 'v2-only' } });
  }
  async function attachReleaseDiscipline(packet) {
    var api = await releaseDisciplineApi();
    if (!api || typeof api.applyReleaseDiscipline !== 'function') return packet;
    return api.applyReleaseDiscipline(packet, {});
  }
  async function attachWitnessGateAndRelease(packet) {
    var withWitness = await attachOutsideWitness(packet);
    var withGate = await attachPublicDefaultGate(withWitness);
    return attachReleaseDiscipline(withGate);
  }

  async function refreshPhase5Only(packet) {
    var api = await phase5Api();
    var out = clone(packet);
    if (api && typeof api.buildPhase5ReplayHardening === 'function') {
      var hardening = await api.buildPhase5ReplayHardening(out, { includeTamperFixtures: false });
      out.phase5_replay_hardening = hardening;
      if (typeof api.applyPhase5Quarantine === 'function') out = api.applyPhase5Quarantine(out, hardening);
    }
    return attachWitnessGateAndRelease(out);
  }

  async function finalizePacket(packet, saved, mode) {
    if (!packet || typeof packet !== 'object') return packet;
    if (nativeBorn(packet)) return refreshPhase5Only(packet);
    var api = await finalizerApi();
    if (!api || typeof api.finalizeSafeHarborPacket !== 'function') return attachWitnessGateAndRelease(packet);
    var segments = rawSegmentsFromSaved(saved);
    var chosenMode = mode || (segments ? 'native' : 'legacy-repair');
    if (!segments && chosenMode !== 'native') return refreshPhase5Only(packet);
    var finalized = await api.finalizeSafeHarborPacket(packet, {
      mode: chosenMode,
      segments: segments,
      includePhase5: true,
      includeTamperFixtures: false,
      allowV3Rebuild: false,
      rawTextExportAllowed: false
    });
    return attachWitnessGateAndRelease(finalized);
  }

  async function normalizePacket(packet, saved) {
    if (!packet || typeof packet !== 'object') return packet;
    if (nativeBorn(packet)) return refreshPhase5Only(packet);
    if (exportHardened(packet)) return refreshPhase5Only(packet);
    return finalizePacket(packet, saved, hasRawSegments(saved) ? 'native' : 'export-normalized');
  }
  async function nativeFinalizeSavedPacket() {
    var saved = savedSession();
    if (!saved || !saved.packet) return null;
    var finalized = await finalizePacket(saved.packet, saved, 'native');
    saved.packet = finalized;
    storeSession(saved);
    syncPreview(finalized);
    return finalized;
  }

  function packetExportReady(packet) {
    if (!packet || !packet.bridge || !packet.bridge.export_gate || !packet.bridge.export_gate.ready) return false;
    if (packet.phase8_public_default_gate && packet.phase8_public_default_gate.status === 'blocked') return false;
    if (packet.phase9_release_discipline && packet.phase9_release_discipline.release_class === 'blocked') return false;
    return !(packet.phase5_replay_hardening && (packet.phase5_replay_hardening.status === 'quarantine' || packet.phase5_replay_hardening.status === 'fail'));
  }
  function packetFilename(packet) {
    var helperTs = packet && packet.intake && packet.intake.helper_filename_safe;
    var created = packet && (packet.created_at || (packet.receipt && packet.receipt.minted_at));
    var ts = helperTs || String(created || new Date().toISOString()).replace(/[:.]/g, '-');
    var stage = packet && packet.seal_handshake ? 'sealed' : (packet && packet.issuance && packet.issuance.badge_number ? 'minted' : 'staged');
    var shi = packet && packet.issuance && packet.issuance.badge_number ? '-' + packet.issuance.badge_number : '';
    var v3 = packet && packet.issuance && packet.issuance.badge_number_v3 ? '-' + packet.issuance.badge_number_v3 : '';
    var batch = packet && packet.intake && packet.intake.selected_batch_id ? '-' + packet.intake.selected_batch_id : '';
    return 'td613-packet' + batch + '-' + stage + shi + v3 + '-' + ts + '.json';
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
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(body).catch(function () { fallbackCopy(body); });
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
  function publicLabel(packet) {
    var gate = packet && packet.phase8_public_default_gate;
    var mode = gate && gate.public_default_after ? gate.public_default_after : 'v2-only';
    if (mode === 'v2-primary-v3-visible') return 'public v2+v3 visible';
    if (mode === 'dual-v2-v3') return 'public dual-gated';
    if (mode === 'blocked') return 'public blocked';
    return 'public v2-only';
  }
  function releaseLabel(packet) {
    var release = packet && packet.phase9_release_discipline;
    return 'release ' + (release && release.release_class ? release.release_class : 'operator-only');
  }
  function syncPreview(packet) {
    var preview = $('packetPreview');
    if (preview && packet) preview.textContent = JSON.stringify(packet, null, 2);
    var schema = $('forensicSchemaPreview');
    if (schema && packet) schema.textContent = JSON.stringify(packet, null, 2);
    var hash = $('packetHashReadout');
    if (hash && packet && packet.packet_hash_sha256) hash.textContent = packet.packet_hash_sha256;
    var badge = $('badgeStatusReadout');
    if (badge && packet && packet.issuance) badge.textContent = packet.issuance.badge_number_v3 ? packet.issuance.badge_number + ' / ' + packet.issuance.badge_number_v3 : (packet.issuance.badge_number || 'not issued');
    var phase = $('packetPhase');
    if (phase && packet) {
      var spine = packet.native_spine_purification && packet.native_spine_purification.status;
      var hardening = packet.phase5_replay_hardening && packet.phase5_replay_hardening.status;
      var witness = packet.outside_witness_alignment && packet.outside_witness_alignment.status;
      phase.textContent = hardening === 'quarantine'
        ? 'Native Spine: quarantined / ' + publicLabel(packet) + ' / ' + releaseLabel(packet)
        : spine === 'native'
          ? 'Native Spine: native-born / witnesses ' + (witness || 'pending') + ' / ' + publicLabel(packet) + ' / ' + releaseLabel(packet)
          : spine === 'export-hardened'
            ? 'Native Spine: export-hardened / witnesses ' + (witness || 'pending') + ' / ' + publicLabel(packet) + ' / ' + releaseLabel(packet)
            : 'Native Spine: legacy v2 / witnesses ' + (witness || 'pending') + ' / ' + publicLabel(packet) + ' / ' + releaseLabel(packet);
    }
  }
  async function activePacket() {
    var saved = savedSession();
    var packet = saved && saved.packet ? saved.packet : null;
    if (!packet) return null;
    var patched = await normalizePacket(packet, saved);
    if (JSON.stringify(patched) !== JSON.stringify(packet)) {
      saved.packet = patched;
      storeSession(saved);
    }
    return patched;
  }
  function activePacketSync() { var saved = savedSession(); return saved && saved.packet ? clone(saved.packet) : null; }
  async function normalizeVisiblePacket() { var packet = await activePacket(); if (packet) syncPreview(packet); return packet; }

  function patchProbeText(raw) {
    var body = String(raw || '');
    if (!body) return body;
    var parsed = parse(body);
    if (parsed && typeof parsed === 'object') return JSON.stringify(parsed, null, 2);
    if (body.indexOf('- canonical_footer:') === -1 || body.indexOf('- historical_example:') !== -1) return body;
    return body.replace(/(^- canonical_footer:.*$)/m, '$1\n- historical_example: ' + HISTORICAL_EXAMPLE);
  }
  function patchProbeOutput() {
    var node = $('probeOutput');
    if (!node) return null;
    var current = 'value' in node ? node.value : node.textContent;
    var patched = patchProbeText(current);
    if (patched !== current) { if ('value' in node) node.value = patched; else node.textContent = patched; }
    return patched;
  }
  async function openTxt() {
    var packet = await normalizeVisiblePacket();
    if (!packet || !packetExportReady(packet)) { syncButton(); return false; }
    var blob = new Blob([JSON.stringify(packet, null, 2) + '\n'], { type: 'text/plain;charset=utf-8' });
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
  function button() { return $('openPacketTxtPreview'); }
  function bindButton() {
    var node = button();
    if (!node) return null;
    if (node.dataset.pr169Bound !== VERSION) {
      node.dataset.pr169Bound = VERSION;
      node.addEventListener('click', function (event) { event.preventDefault(); void openTxt(); });
    }
    return node;
  }
  function bindPacketExports() {
    var exportButton = $('exportPacketPreview');
    if (exportButton && exportButton.dataset.richStylometryExport !== VERSION) {
      exportButton.dataset.richStylometryExport = VERSION;
      exportButton.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        void normalizeVisiblePacket().then(function (packet) { if (packet && packetExportReady(packet)) downloadJson(packetFilename(packet), packet); });
      }, true);
    }
    var packetCopyButton = $('copyPacketPreview');
    if (packetCopyButton && packetCopyButton.dataset.richStylometryCopy !== VERSION) {
      packetCopyButton.dataset.richStylometryCopy = VERSION;
      packetCopyButton.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        void normalizeVisiblePacket().then(function (packet) { if (packet) void copyText(JSON.stringify(packet, null, 2) + '\n'); });
      }, true);
    }
    var exportCopyButton = $('copyForensicSchemaPreview');
    if (exportCopyButton && exportCopyButton.dataset.richStylometryCopy !== VERSION) {
      exportCopyButton.dataset.richStylometryCopy = VERSION;
      exportCopyButton.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        void normalizeVisiblePacket().then(function (packet) { if (packet) void copyText(JSON.stringify(packet, null, 2) + '\n'); });
      }, true);
    }
  }
  function bindProbeOutputs() {
    Array.from(document.querySelectorAll('[data-probe-variant]')).forEach(function (buttonNode) {
      if (buttonNode.dataset.footerHistoryProbe === VERSION) return;
      buttonNode.dataset.footerHistoryProbe = VERSION;
      buttonNode.addEventListener('click', function () { window.setTimeout(patchProbeOutput, 0); }, false);
    });
    var copyProbe = $('copyProbeOutput');
    if (copyProbe && copyProbe.dataset.footerHistoryProbeCopy !== VERSION) {
      copyProbe.dataset.footerHistoryProbeCopy = VERSION;
      copyProbe.addEventListener('click', function () { patchProbeOutput(); }, true);
    }
  }
  function patchApi() {
    var api = window.TD613SafeHarbor;
    if (!api || api.__phase9ReleaseDisciplinePatch === VERSION) return;
    if (typeof api.mintStagedPacket === 'function') {
      var originalMint = api.mintStagedPacket.bind(api);
      api.mintStagedPacket = async function () { var result = await originalMint(); await nativeFinalizeSavedPacket(); return result; };
    }
    if (typeof api.buildPacket === 'function') {
      var originalBuildPacket = api.buildPacket.bind(api);
      api.buildPacket = async function () { var packet = await originalBuildPacket(); var saved = savedSession(); return packet && saved ? finalizePacket(packet, saved, nativeBorn(packet) ? null : 'native') : packet; };
    }
    if (typeof api.buildProbe === 'function') {
      var originalBuildProbe = api.buildProbe.bind(api);
      api.buildProbe = function (variant) { var result = originalBuildProbe(variant); var patched = patchProbeText(result); var node = $('probeOutput'); if (node) { if ('value' in node) node.value = patched; else node.textContent = patched; } return patched; };
    }
    api.__phase9ReleaseDisciplinePatch = VERSION;
  }
  function syncButton() {
    var node = bindButton();
    bindPacketExports();
    bindProbeOutputs();
    patchApi();
    void normalizeVisiblePacket();
    patchProbeOutput();
    if (!node) return;
    var ready = packetExportReady(activePacketSync());
    node.disabled = !ready;
    node.setAttribute('aria-disabled', ready ? 'false' : 'true');
    node.title = ready ? 'Open the sealed packet as plain text in a new tab' : 'Open .txt unlocks after the packet is export-ready, Phase 5 is not quarantined, witnesses are readable, Phase 8 gate is not blocked, and release discipline is not blocked';
  }
  function boot() {
    document.documentElement.classList.add('safe-harbor-pr169');
    bindButton();
    bindPacketExports();
    bindProbeOutputs();
    patchApi();
    syncButton();
    window.__TD613_SAFE_HARBOR_PR169__ = { version: VERSION, button: Boolean(button()), at: new Date().toISOString(), footer_history: HISTORICAL_EXAMPLE, phase6_native_callsite: true, phase6_compose_purity: true, phase7_outside_witness_alignment: true, phase8_public_default_gate: true, phase9_release_discipline: true, normalizer_role: 'verification-or-export-hardening-fallback' };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
  window.addEventListener('load', boot);
  window.addEventListener('pageshow', boot);
  window.addEventListener('storage', syncButton);
  window.addEventListener('td613:safe-harbor:native-finalizer-ready', syncButton);
  window.addEventListener('td613:safe-harbor:outside-witness-ready', syncButton);
  window.addEventListener('td613:safe-harbor:public-default-gate-ready', syncButton);
  window.addEventListener('td613:safe-harbor:release-discipline-ready', syncButton);
  document.addEventListener('td613:safe-harbor-packet', syncButton);
  ['click', 'input', 'change'].forEach(function (type) { document.addEventListener(type, function () { window.setTimeout(syncButton, 0); }, true); });
  [100, 360, 900, 1800].forEach(function (delay) { window.setTimeout(syncButton, delay); });
  window.setInterval(syncButton, 900);
  window.TD613_SAFE_HARBOR_PR169 = Object.freeze({ version: VERSION, boot: boot, openTxt: openTxt, syncButton: syncButton, historicalExample: HISTORICAL_EXAMPLE, patchProbeText: patchProbeText, normalizePacket: normalizePacket });
}());
