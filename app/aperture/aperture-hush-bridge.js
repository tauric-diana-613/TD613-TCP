(function () {
  'use strict';

  var VERSION = 'aperture-hush-bridge/v1.0.0';
  var STORAGE_KEY = 'td613:aperture:hush-packet';
  var LEGACY_KEY = 'TD613_APERTURE_HUSH_PACKET';

  function $(id) { return document.getElementById(id); }
  function text(value) { return String(value == null ? '' : value); }
  function clean(value) { return text(value).trim(); }
  function read(id) { return clean($(id) && ('value' in $(id) ? $(id).value : $(id).textContent)); }
  function splitList(value) { return clean(value).split(/[\n,]+/).map(function (item) { return item.trim(); }).filter(Boolean); }
  function numberValue(id) {
    var value = Number(read(id));
    return Number.isFinite(value) ? value : null;
  }
  function routeValue(id) { return read(id) || '—'; }

  function currentMetrics() {
    return {
      route_state: routeValue('mRouteState'),
      routing_recommendation: routeValue('mRouteAction'),
      harbor_eligibility: routeValue('mHarborE'),
      sigma_r: routeValue('mSigmaR'),
      sigma_state: routeValue('mSigmaState'),
      detector_confidence: routeValue('mDetConf'),
      field_signature: {
        delta_obs: routeValue('fsvObs'),
        eta_name: routeValue('fsvName'),
        suppression: routeValue('fsvSupp'),
        gap: routeValue('fsvGap'),
        cohesion: routeValue('fsvCoh'),
        burden: routeValue('fsvBurden'),
        provenance: routeValue('fsvProv')
      },
      aperture_state: {
        theta: routeValue('mTheta'),
        rupture: routeValue('mRupture'),
        dominant_loss: routeValue('mDominantLoss'),
        bus_route: routeValue('mBusRoute'),
        bus_packet: routeValue('mBusPacket'),
        layer_health: routeValue('mLayerHealth')
      }
    };
  }

  function sourceTrace() {
    return {
      recognition_mark: read('inputSubjectAlias'),
      observed_provenance: read('inputSourceType') || 'self-report',
      regime_string: read('inputNamingString'),
      parallel_trace: read('inputCompareAgainst'),
      trace_fragments: splitList(read('inputTokens')),
      occlusion_markers: splitList(read('inputBurdenMarkers')),
      provenance_density: numberValue('inputProvenanceConfidence'),
      counter_tool_note: read('inputNotes'),
      temporal_trace: {
        t_sense: read('inputTSense'),
        t_model: read('inputTModel'),
        t_op: read('inputTOp'),
        t_inst: read('inputTInst'),
        t_pub: read('inputTPub'),
        pilot_domain: read('inputPilotDomain'),
        closure_class: read('inputClosureClass'),
        closure_score: numberValue('inputClosureScore'),
        record_class: read('inputRecordClass'),
        testimony_class: read('inputTestimonyClass')
      }
    };
  }

  function routeIntent(metrics) {
    var state = clean(metrics.route_state).toLowerCase();
    if (/harbor/.test(state)) return 'harbor-review';
    if (/buffer/.test(state)) return 'buffer-and-mask';
    if (/warning/.test(state)) return 'warning-first-mask';
    return 'hush-mask-review';
  }

  function buildPacket() {
    var metrics = currentMetrics();
    var trace = sourceTrace();
    var sourceText = [
      trace.regime_string,
      trace.trace_fragments.join('\n'),
      trace.occlusion_markers.length ? 'Occlusion markers: ' + trace.occlusion_markers.join(', ') : '',
      trace.counter_tool_note
    ].filter(Boolean).join('\n\n').trim();
    var packet = {
      packet_version: 'aperture-hush-handoff/v1',
      bridge_version: VERSION,
      source: 'td613-aperture',
      target: 'hush',
      mode: 'aperture-to-hush',
      created_at: new Date().toISOString(),
      route_intent: routeIntent(metrics),
      source_text: sourceText,
      source_trace: trace,
      aperture_metrics: metrics,
      approval_transparency: {
        source_context: 'aperture_v2_3_1_tcp_hook',
        route_state: metrics.route_state,
        seal_status: /harbor|approved|seal/i.test(metrics.route_state) ? 'seal_eligible' : 'review',
        human_reclosure: { required: true, confirmed: false, rejected_routes_visible: true }
      },
      privacy_boundary: {
        sends_private_ledger: false,
        sends_mask_memory: false,
        sends_persona_memory: false,
        sends_safe_harbor_packet: false,
        sends_aperture_countertool_trace: true
      }
    };
    window.__TD613_APERTURE_HUSH_PACKET = packet;
    return packet;
  }

  function savePacket(packet) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(packet));
      localStorage.setItem(LEGACY_KEY, JSON.stringify(packet));
    } catch (error) {
      window.__TD613_APERTURE_HUSH_STORAGE_ERROR = String(error && error.message || error);
    }
  }

  function renderPreview(packet) {
    var preview = $('apertureHushPacketPreview') || $('packetPreview') || $('tcpPacketPreview');
    if (preview) preview.textContent = JSON.stringify(packet, null, 2).slice(0, 8000);
    var status = $('apertureHushBridgeStatus') || $('humanRouteStatus') || $('controlStatusBar');
    if (status) {
      status.style.display = '';
      status.textContent = 'Hush handoff staged · ' + packet.route_intent + ' · ' + packet.packet_version;
    }
  }

  function hushUrl(openNow) {
    var path = '../adversarial-bench.html?from=aperture&tcp=1&packet=latest&fresh=' + encodeURIComponent(Date.now());
    return path;
  }

  function stageHandoff(openNow) {
    var packet = buildPacket();
    savePacket(packet);
    renderPreview(packet);
    if (openNow) window.open(hushUrl(true), '_blank', 'noopener');
    return packet;
  }

  function ensurePanel() {
    if ($('apertureHushBridgePanel')) return;
    var host = $('humanRoutePanel') || $('rightPanel') || document.body;
    var panel = document.createElement('div');
    panel.id = 'apertureHushBridgePanel';
    panel.className = 'tcp-hook state-warning';
    panel.innerHTML = '<div class="hook-title">Hush bridge</div><div class="hook-value" id="apertureHushBridgeStatus">Aperture TCP hooks route to Hush for mask/stylometry review.</div><div class="bridge-actions"><button id="btnStageHushHandoff" class="bridge-action" type="button">STAGE HUSH PACKET</button><button id="btnOpenHushHandoff" class="bridge-action" type="button">OPEN HUSH</button></div><pre id="apertureHushPacketPreview" class="packet-preview" aria-label="Aperture to Hush packet preview">packet not staged</pre>';
    host.appendChild(panel);
  }

  function bindButtons() {
    ensurePanel();
    var stageSelectors = ['btnStageHushHandoff', 'btnPrepareHush', 'btnPrepareTCPHandoff', 'btnTCPPrepare', 'btnExportTCP'];
    var openSelectors = ['btnOpenHushHandoff', 'btnSendToHush', 'btnOpenHush', 'btnTCPHush'];
    stageSelectors.forEach(function (id) {
      var node = $(id);
      if (node && node.dataset.apertureHushBridge !== 'true') {
        node.dataset.apertureHushBridge = 'true';
        node.addEventListener('click', function (event) { event.preventDefault(); stageHandoff(false); }, true);
      }
    });
    openSelectors.forEach(function (id) {
      var node = $(id);
      if (node && node.dataset.apertureHushBridge !== 'true') {
        node.dataset.apertureHushBridge = 'true';
        node.addEventListener('click', function (event) { event.preventDefault(); stageHandoff(true); }, true);
      }
    });
    document.querySelectorAll('[data-aperture-hush-bridge],[data-tcp-hush-route]').forEach(function (node) {
      if (node.dataset.apertureHushBridgeBound === 'true') return;
      node.dataset.apertureHushBridgeBound = 'true';
      node.addEventListener('click', function (event) {
        event.preventDefault();
        stageHandoff(node.getAttribute('data-open') !== 'false');
      }, true);
    });
  }

  function boot() {
    if (!document.body || !/aperture/i.test(document.body.dataset.toolName || document.title || '')) return;
    if (document.body.dataset.apertureHushBridge === 'true') return;
    document.body.dataset.apertureHushBridge = 'true';
    bindButtons();
    window.setTimeout(bindButtons, 600);
    window.setTimeout(bindButtons, 1400);
    window.TD613_APERTURE_HUSH_BRIDGE = { version: VERSION, buildPacket: buildPacket, stageHandoff: stageHandoff, storageKey: STORAGE_KEY };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
}());
