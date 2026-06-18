(function () {
  'use strict';

  var VERSION = 'safe-harbor-pr169-packet-vault-direct/v6-rich-lane-profiles';
  var STORAGE_KEY = 'td613.safe-harbor.session.v1';
  var MIRROR_KEY = 'td613.safe-harbor.session.mirror.v1';
  var HISTORICAL_EXAMPLE = 'TD613-Binding:#9B07D8B/SAC[X6ZNK5NO51] · payload 5 · 2025-10-17 · ⟐';
  var SCRIPT_URL = document.currentScript && document.currentScript.src ? document.currentScript.src : '';
  var KEYS = ['future_self', 'past_self', 'higher_self'];
  var RICH_PROFILE_SCHEMA = 'td613.safe-harbor.lane-rich-profile/v1';
  var RICH_PROFILE_SOURCE = 'app/engine/stylometry.extractCadenceProfile + StylometricDeepMetrics.analyze';
  var richModulePromise = null;

  function $(id) { return document.getElementById(id); }
  function text(value) { return String(value == null ? '' : value).trim(); }
  function parse(raw) { try { return raw ? JSON.parse(raw) : null; } catch (error) { return null; } }
  function read(storage, key) { try { return storage && storage.getItem(key); } catch (error) { return null; } }
  function write(storage, key, value) { try { if (storage) storage.setItem(key, JSON.stringify(value)); } catch (error) {} }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }

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
      if (hasPublicFooter && !hasHistory && key === 'public_footer') out.historical_example = HISTORICAL_EXAMPLE;
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

  function savedSession() {
    return parse(read(window.sessionStorage, STORAGE_KEY)) || parse(read(window.localStorage, MIRROR_KEY)) || null;
  }

  function storeSession(saved) {
    if (!saved || !saved.packet) return;
    write(window.sessionStorage, STORAGE_KEY, saved);
    write(window.localStorage, MIRROR_KEY, saved);
  }

  function richAdapterUrl() {
    try {
      return new URL('safe-harbor-rich-stylometry-adapter.js', SCRIPT_URL || window.location.href).href;
    } catch (error) {
      return 'app/safe-harbor-rich-stylometry-adapter.js';
    }
  }

  async function richBuilder() {
    var api = window.TD613_SAFE_HARBOR_STYLOMETRY;
    if (api && typeof api.buildSafeHarborRichStylometry === 'function') return api.buildSafeHarborRichStylometry;
    if (!richModulePromise) richModulePromise = import(richAdapterUrl()).catch(function () { return null; });
    var mod = await richModulePromise;
    if (mod && typeof mod.buildSafeHarborRichStylometry === 'function') return mod.buildSafeHarborRichStylometry;
    api = window.TD613_SAFE_HARBOR_STYLOMETRY;
    return api && typeof api.buildSafeHarborRichStylometry === 'function' ? api.buildSafeHarborRichStylometry : null;
  }

  function hasUsableSegments(segments) {
    return Boolean(
      segments &&
      typeof segments === 'object' &&
      KEYS.every(function (key) { return typeof segments[key] === 'string' && segments[key].trim().length > 0; })
    );
  }

  function topWeighted(profile, max) {
    return Object.fromEntries(Object.entries(profile || {})
      .filter(function (entry) { return Number(entry[1] || 0) > 0; })
      .sort(function (left, right) { return Number(right[1] || 0) - Number(left[1] || 0); })
      .slice(0, max || 80));
  }

  function compactLaneRichProfile(profile) {
    if (!profile || typeof profile !== 'object') return null;
    return {
      contentWordComplexity: Number(profile.contentWordComplexity || 0),
      modifierDensity: Number(profile.modifierDensity || 0),
      hedgeDensity: Number(profile.hedgeDensity || 0),
      abstractionPosture: Number(profile.abstractionPosture || 0),
      directness: Number(profile.directness || 0),
      latinatePreference: Number(profile.latinatePreference || 0),
      abbreviationDensity: Number(profile.abbreviationDensity || 0),
      orthographicLooseness: Number(profile.orthographicLooseness || 0),
      fragmentPressure: Number(profile.fragmentPressure || 0),
      conversationalPosture: Number(profile.conversationalPosture || 0),
      syntacticBranchingDepth: Number(profile.syntacticBranchingDepth || 0),
      structuralFriction: Number(profile.structuralFriction || 0),
      lexicalEntropyScore: Number(profile.lexicalEntropyScore || 0),
      characterEntropyBits: Number(profile.characterEntropyBits || 0),
      tokenEntropyBits: Number(profile.tokenEntropyBits || 0),
      transitionVariance: Number(profile.transitionVariance || 0),
      acousticWeight: Number(profile.acousticWeight || 0),
      registerMode: String(profile.registerMode || ''),
      surfaceMarkerProfile: clone(profile.surfaceMarkerProfile || {}),
      functionWordProfile: clone(profile.functionWordProfile || {}),
      wordLengthProfile: clone(profile.wordLengthProfile || {}),
      charTrigramProfile: topWeighted(profile.charTrigramProfile || {}, 80)
    };
  }

  function compactRichProvenance(rich) {
    if (!rich || typeof rich !== 'object') return null;
    return {
      schema_version: rich.schema_version,
      rich_fingerprint: rich.rich_fingerprint,
      engine: clone(rich.engine),
      triad_profile: clone(rich.triad_profile),
      cross_lane_divergence: clone(rich.cross_lane_divergence),
      traceability_surface: clone(rich.traceability_surface),
      compatibility_note: rich.compatibility_note
    };
  }

  function promoteRichLaneProfiles(packet, rich) {
    var signatures = packet && packet.analysis && packet.analysis.segment_cadence_signatures;
    var profiles = rich && rich.per_lane_profiles;
    if (!signatures || !profiles || typeof signatures !== 'object' || typeof profiles !== 'object') return;
    KEYS.forEach(function (key) {
      if (!signatures[key] || typeof signatures[key] !== 'object') return;
      var compact = compactLaneRichProfile(profiles[key]);
      signatures[key].rich_profile_schema = compact ? RICH_PROFILE_SCHEMA : null;
      signatures[key].rich_profile_source = compact ? RICH_PROFILE_SOURCE : 'not available';
      signatures[key].rich_profile = compact;
    });
  }

  function attachRichLaneSemantics(packet) {
    if (!packet || !packet.issuance || typeof packet.issuance !== 'object') return;
    packet.issuance.stylometric_provenance = packet.issuance.stylometric_provenance && typeof packet.issuance.stylometric_provenance === 'object'
      ? packet.issuance.stylometric_provenance
      : {};
    packet.issuance.stylometric_provenance.rich_lane_profile_semantics = {
      status: 'present when Phase 2 lane signatures include rich_profile',
      claim_supported: 'native per-lane authorship-signal enrichment',
      claim_limit: 'not v3 SHI derivation unless explicit v3 seed is invoked'
    };
  }

  async function attachRichStylometry(packet, saved) {
    var segments = saved && saved.ingress && saved.ingress.segments ? saved.ingress.segments : null;
    if (!packet || !hasUsableSegments(segments)) return packet;
    var builder = await richBuilder();
    if (typeof builder !== 'function') return packet;
    var rich = builder(segments);
    if (!rich || typeof rich !== 'object') return packet;
    packet.analysis = packet.analysis && typeof packet.analysis === 'object' ? packet.analysis : {};
    packet.analysis.rich_stylometry = clone(rich);
    packet.issuance = packet.issuance && typeof packet.issuance === 'object' ? packet.issuance : {};
    packet.issuance.stylometric_provenance = packet.issuance.stylometric_provenance && typeof packet.issuance.stylometric_provenance === 'object'
      ? packet.issuance.stylometric_provenance
      : {};
    packet.issuance.stylometric_provenance.rich_stylometry = compactRichProvenance(rich);
    promoteRichLaneProfiles(packet, rich);
    attachRichLaneSemantics(packet);
    return packet;
  }

  async function normalizePacket(packet, saved) {
    if (!packet || typeof packet !== 'object') return packet;
    var patched = needsHistory(packet) ? addHistory(clone(packet)) : clone(packet);
    patched = await attachRichStylometry(patched, saved);
    return patched;
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

  function activePacketSync() {
    var saved = savedSession();
    return saved && saved.packet ? addHistory(clone(saved.packet)) : null;
  }

  function packetExportReady(packet) {
    return Boolean(packet && packet.bridge && packet.bridge.export_gate && packet.bridge.export_gate.ready);
  }

  function packetFilename(packet) {
    var helperTs = packet && packet.intake && packet.intake.helper_filename_safe;
    var created = packet && (packet.created_at || (packet.receipt && packet.receipt.minted_at));
    var ts = helperTs || String(created || new Date().toISOString()).replace(/[:.]/g, '-');
    var stage = packet && packet.seal_handshake ? 'sealed' : (packet && packet.issuance && packet.issuance.badge_number ? 'minted' : 'staged');
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

  async function packetText() {
    var packet = await activePacket();
    if (packet) return JSON.stringify(packet, null, 2) + '\n';
    var preview = $('forensicSchemaPreview');
    return preview ? text(preview.textContent || preview.value || '') : '';
  }

  function patchProbeText(raw) {
    var body = String(raw || '');
    if (!body) return body;
    var parsed = parse(body);
    if (parsed && typeof parsed === 'object') return JSON.stringify(addHistoryAfterPublicFooter(parsed), null, 2);
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
    if (!packetExportReady(activePacketSync())) {
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

  function button() { return $('openPacketTxtPreview'); }

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
    if (exportButton && exportButton.dataset.richStylometryExport !== VERSION) {
      exportButton.dataset.richStylometryExport = VERSION;
      exportButton.addEventListener('click', function (event) {
        var raw = activePacketSync();
        if (!packetExportReady(raw)) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        void normalizeVisiblePacket().then(function (packet) {
          if (packet) downloadJson(packetFilename(packet), packet);
        });
      }, true);
    }

    var packetCopyButton = $('copyPacketPreview');
    if (packetCopyButton && packetCopyButton.dataset.richStylometryCopy !== VERSION) {
      packetCopyButton.dataset.richStylometryCopy = VERSION;
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
    if (exportCopyButton && exportCopyButton.dataset.richStylometryCopy !== VERSION) {
      exportCopyButton.dataset.richStylometryCopy = VERSION;
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
    if (!api || api.__richStylometryExportPatch === VERSION) return;
    if (typeof api.buildPacket === 'function') {
      var originalBuildPacket = api.buildPacket.bind(api);
      api.buildPacket = async function () {
        var packet = await originalBuildPacket();
        return normalizePacket(packet, savedSession());
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
    api.__richStylometryExportPatch = VERSION;
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
    node.title = ready ? 'Open the sealed packet as plain text in a new tab' : 'Open .txt unlocks after the packet is sealed/export-ready';
  }

  function boot() {
    document.documentElement.classList.add('safe-harbor-pr169');
    bindButton();
    bindPacketExports();
    bindProbeOutputs();
    patchApi();
    syncButton();
    window.__TD613_SAFE_HARBOR_PR169__ = {
      version: VERSION,
      button: Boolean(button()),
      at: new Date().toISOString(),
      footer_history: HISTORICAL_EXAMPLE,
      rich_stylometry_export: true,
      rich_lane_profiles: true
    };
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
    patchProbeText: patchProbeText,
    normalizePacket: normalizePacket,
    compactLaneRichProfile: compactLaneRichProfile
  });
}());