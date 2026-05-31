(function () {
  'use strict';

  var VERSION = 'pr106-stylometry-ontology-release-guard';
  var BLOCKED_WARNING = 'pr106-stylometry-ontology-release-blocked';

  function $(id) { return document.getElementById(id); }
  function text(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value.filter(Boolean) : []; }
  function setStatus(message, tone) {
    var status = $('hushGeneratorStatus') || $('hushOutputStatusText');
    if (!status) return;
    status.dataset.tone = tone || 'error';
    status.textContent = message;
  }
  function selectedCandidate(result) {
    var id = result && (result.selectedCandidateId || (result.patch38Diagnostics && result.patch38Diagnostics.selectedCandidateId));
    return asArray(result && result.candidates).find(function (candidate) { return candidate && candidate.id === id; }) || null;
  }
  function noteCount(candidate) {
    var notes = candidate && (candidate.mask_surface_notes || (candidate.providerTelemetry && candidate.providerTelemetry.mask_surface_notes));
    return notes && typeof notes === 'object' ? Object.keys(notes).filter(function (key) { return text(notes[key]); }).length : 0;
  }
  function hasServerRepair(candidate, result) {
    var hay = [
      candidate && candidate.provider,
      candidate && candidate.model,
      candidate && candidate.source,
      candidate && candidate.style_note,
      candidate && candidate.style_operation,
      asArray(candidate && candidate.warnings).join(' '),
      asArray(result && result.warnings).join(' '),
      JSON.stringify((result && result.patch38Diagnostics && result.patch38Diagnostics.providerReports) || [])
    ].join(' ').toLowerCase();
    return /server-deterministic-repair|server-repair|gemini-fast-path-fallback-before-timeout|deterministic-repair/.test(hay);
  }
  function copyRiskBlocked(copy) {
    return Boolean(copy && (copy.exactCopy || copy.wrapperCopy || copy.nearCopy || copy.longVerbatimRun));
  }
  function complianceBlockers(result) {
    var blockers = [];
    if (!result || !text(result.selectedOutput)) return blockers;
    var p = result.patch38Diagnostics || {};
    var phase = result.phase37Telemetry || result.phase35Telemetry || {};
    var packet = phase.flightPacket || {};
    var engine = packet.stylometry_engine || phase.stylometryEngine || {};
    var route = packet.ontology_route || phase.ontologyRoute || {};
    var candidate = selectedCandidate(result);
    var selectedRemote = Boolean(p.selectedRemoteCandidate || (candidate && /remote-llm-candidate/i.test(candidate.source || candidate.id || '')));
    var selectedProvider = Boolean(p.selectedProviderCandidate || selectedRemote || (candidate && candidate.provider));
    if (!packet.packet_version && !phase.flightPacketVersion) blockers.push('phase37-flight-packet-missing');
    if (!engine.target_shell && !engine.cadence_shell) blockers.push('stylometry-target-shell-missing');
    if (!route.route_type && !route.routeType) blockers.push('ontology-route-missing');
    if (hasServerRepair(candidate, result)) blockers.push('server-repair-candidate-not-stylometry-rigorous');
    if (copyRiskBlocked(p.selectedSourceCopyRisk || (candidate && candidate.sourceCopyRisk))) blockers.push('source-copy-risk-selected');
    if (Number(p.selectedCollapseSurfaceScore || 0) >= 0.48) blockers.push('custody-collapse-surface-too-high');
    if (Number(p.selectedCoverage || 0) < 0.38) blockers.push('proposition-coverage-too-low');
    if (Number(p.selectedLengthRatio || 0) > 0 && Number(p.selectedLengthRatio || 0) < 0.28) blockers.push('output-too-thin-for-source');
    if (selectedProvider && Number(p.selectedSyntaxDistance || 0) < 0.42) blockers.push('syntax-distance-too-low');
    if (selectedProvider && Number(p.selectedOperationCompleteness || 0) < 0.58) blockers.push('operation-telemetry-incomplete');
    if (selectedProvider && Number(p.selectedMaskFidelity || 0) < 0.30) blockers.push('mask-fidelity-too-low');
    if (selectedRemote && noteCount(candidate) < 2) blockers.push('mask-surface-notes-missing');
    if (selectedRemote && !text(candidate && (candidate.style_operation || (candidate.providerTelemetry && candidate.providerTelemetry.style_operation)))) blockers.push('style-operation-missing');
    return blockers;
  }
  function renderBlock(result, blockers) {
    var message = 'Release held: selected candidate did not prove stylometry + ontology compliance. Blockers: ' + blockers.join(', ') + '.';
    var output = $('protectedOutputInput');
    if (output) {
      output.value = '';
      output.dispatchEvent(new Event('input', { bubbles: true }));
    }
    var warning = $('acceptWarning');
    if (warning) {
      warning.hidden = false;
      warning.textContent = message;
    }
    var panel = $('hushSwapWarningsPanel');
    if (panel) {
      panel.innerHTML = [BLOCKED_WARNING].concat(blockers).map(function (item) { return '<span class="chip">' + String(item).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }) + '</span>'; }).join(' ');
    }
    setStatus(message, 'error');
    if (window.__TD613_HUSH_BENCH__ && window.__TD613_HUSH_BENCH__.benchState) {
      window.__TD613_HUSH_BENCH__.benchState.protectedOutputText = '';
    }
    if (result) {
      result.selectedOutput = '';
      result.releasePolicy = { mayPopulateOutput: false, hardBlocked: true, state: 'hold' };
      result.releaseSummary = { status: 'hold', warnings: [BLOCKED_WARNING].concat(blockers) };
      result.warnings = Array.from(new Set(asArray(result.warnings).concat([BLOCKED_WARNING], blockers)));
      result.pr106ReleaseGuard = { version: VERSION, blocked: true, blockers: blockers, at: new Date().toISOString() };
    }
    window.__TD613_HUSH_PR106_LAST = { version: VERSION, blocked: true, blockers: blockers, result: result, at: new Date().toISOString() };
  }
  function inspect(event) {
    var result = event && event.detail && event.detail.result || window.__TD613_HUSH_PATCH38_LAST_RESULT || null;
    var blockers = complianceBlockers(result);
    if (blockers.length) renderBlock(result, blockers);
    else window.__TD613_HUSH_PR106_LAST = { version: VERSION, blocked: false, at: new Date().toISOString(), selectedCandidateId: result && (result.selectedCandidateId || (result.patch38Diagnostics && result.patch38Diagnostics.selectedCandidateId)) };
  }
  function boot() {
    if (!document.body || document.body.dataset.pageKind !== 'adversarial-bench') return;
    if (document.body.dataset.pr106StylometryOntologyGuard === VERSION) return;
    document.body.dataset.pr106StylometryOntologyGuard = VERSION;
    window.addEventListener('td613:hush:patch38-result', inspect);
    window.TD613_HUSH_PR106 = { version: VERSION, inspect: inspect, complianceBlockers: complianceBlockers };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.setTimeout(boot, 500);
}());
