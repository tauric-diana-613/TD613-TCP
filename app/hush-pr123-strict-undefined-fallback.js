// app/hush-pr123-strict-undefined-fallback.js
(function () {
  'use strict';

  var VERSION = 'pr123-strict-provider-bridge/v9-mask-anatomy-literal-gate';
  var ENDPOINTS = ['/api/hush-generate-strict', 'https://td613.vercel.app/api/hush-generate-strict'];
  var running = false;

  function $(id) { return document.getElementById(id); }
  function T(value) { return String(value == null ? '' : value).trim(); }
  function A(value) { return Array.isArray(value) ? value.filter(Boolean) : []; }
  function copy(value) { try { return JSON.parse(JSON.stringify(value || {})); } catch (_) { return {}; } }
  function hash(value) { var h = 2166136261; String(value || '').split('').forEach(function (ch) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); }); return (h >>> 0).toString(16).padStart(8, '0'); }
  function state() { return window.__TD613_HUSH_BENCH__ && window.__TD613_HUSH_BENCH__.benchState || {}; }
  function mask() {
    var s = state();
    var id = $('maskFieldSelect') && $('maskFieldSelect').value || s.selectedHushMaskId || '';
    var masks = [].concat(A(s.hushMasks), A(s.customMasks));
    return masks.find(function (item) { return item && item.id === id; }) || s.selectedHushMask || { id: id || 'selected-mask', label: 'Selected mask' };
  }
  function status(message, tone) {
    var node = $('hushGeneratorStatus') || $('hushStrictProviderStatus') || $('hushOutputStatusText');
    if (!node) {
      node = document.createElement('div');
      node.id = 'hushStrictProviderStatus';
      node.className = 'hush-warning-panel hush-generator-status';
      var host = $('hushGateStrip') || $('generateMaskedOutputBtn') && $('generateMaskedOutputBtn').parentElement || document.body;
      host.insertAdjacentElement ? host.insertAdjacentElement('beforebegin', node) : document.body.appendChild(node);
    }
    node.dataset.tone = tone || 'info';
    node.textContent = message;
    var out = $('hushOutputStatusText');
    if (out) out.textContent = tone === 'ok' ? 'Provider' : tone === 'error' ? 'Held' : 'Running';
  }
  function setBusy(value) {
    var button = $('generateMaskedOutputBtn');
    if (button) {
      button.disabled = Boolean(value);
      button.dataset.strictTransformRunning = value ? 'true' : 'false';
    }
    if (document.body) document.body.dataset.strictTransformRunning = value ? 'true' : 'false';
  }
  function setOutput(value) {
    var output = $('protectedOutputInput');
    if (output) {
      output.value = value || '';
      output.dispatchEvent(new Event('input', { bubbles: true }));
    }
    state().protectedOutputText = value || '';
  }
  function wordCount(value) { return (String(value || '').match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length; }
  function protectedLiterals(value) {
    var source = T(value);
    var patterns = [
      /\b(?:EXHIBIT|DOC|CASE|ID|REF|INV|PO|HR|PAY|FILE|TICKET|REQ|FORM|TD613|SHI|SAC|HUSH)(?:[-:#/._][A-Z0-9]+)+\b/gi,
      /\b\d{4}-\d{2}-\d{2}\b/g,
      /\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/g,
      /\b\d{1,2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:\d{2})?\b/g,
      /\b[a-z][a-z0-9]*(?:_[a-z0-9]+)+\b/g,
      /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}\b/g
    ];
    var out = [];
    patterns.forEach(function (pattern) { out = out.concat(source.match(pattern) || []); });
    return Array.from(new Set(out)).slice(0, 48);
  }
  function styleVector(m, ref) {
    var hints = m.transformHints || {};
    return {
      mask_id: m.id || '',
      display_name: m.label || m.name || '',
      family: m.family || '',
      register: m.internalRegister || m.family || '',
      persona_scene: m.description || '',
      intended_use: m.intendedUse || '',
      risk_tell: m.riskTell || '',
      sentence: hints.sentence || '',
      ornament: hints.ornament || '',
      warmth: hints.warmth || '',
      custody: hints.custody || '',
      sample_seed: ref,
      transform_hints: copy(hints),
      desired_moves: A(hints.desiredMoves),
      avoid_moves: A(hints.avoidMoves),
      diction_hints: A(m.dictionHints),
      transition_bank: A(m.transitionBank),
      avoid_list: A(m.avoidList),
      pressure_warnings: A(m.pressureWarnings),
      style_diversity: copy(m.diversity),
      writing_traits: copy(m.writingTraits),
      profile_targets: copy(m.profileTargets),
      source_layout_policy: sourceLayoutPolicy()
    };
  }
  function sourceLayoutPolicy() {
    return {
      version: VERSION,
      source_line_breaks_are_constraints: false,
      source_line_breaks_are_reading_context: true,
      mask_line_breaks_may_guide_output_pacing: true,
      instruction: 'Source/input line breaks are reading context only. Use the selected mask or natural target-register pacing for visible layout.'
    };
  }
  function buildContract() {
    var s = state();
    var m = mask();
    var src = $('messageDraftInput') ? $('messageDraftInput').value : s.messageDraftText || '';
    var ref = $('maskReferenceInput') ? $('maskReferenceInput').value : s.maskReferenceText || m.sampleSeed || m.description || '';
    var tier = wordCount(ref) >= 180 ? 'strict_remote_mask_evidence_packet' : 'strict_remote_mask_label_packet';
    var literals = protectedLiterals([src, $('protectedBaselineInput') ? $('protectedBaselineInput').value : s.protectedBaselineText || ''].join('\n'));
    return {
      promptVersion: 'hush-strict-provider-bridge-current/v9',
      sourceText: src,
      messageDraftText: src,
      protectedBaselineText: $('protectedBaselineInput') ? $('protectedBaselineInput').value : s.protectedBaselineText || '',
      maskReferenceText: ref,
      mask: m,
      selectedMask: m,
      maskId: m.id || s.selectedHushMaskId || '',
      selectedMaskId: m.id || s.selectedHushMaskId || '',
      candidateCount: 2,
      operatorMode: s.recognitionIntentMode || 'neutralize',
      contextType: $('recognitionContextType') ? $('recognitionContextType').value : s.recognitionContextType || 'group-chat',
      exposureDuration: $('recognitionExposureDuration') ? $('recognitionExposureDuration').value : s.recognitionExposureDuration || 'single-use',
      strictDirect: true,
      strictNoFallback: true,
      strictBudgetedUpstream: true,
      noFallback: true,
      packetTier: tier,
      maskEvidenceState: tier.indexOf('evidence') >= 0 ? 'rich' : 'label-only',
      protectedLiterals: literals,
      operationTaxonomy: ['register_transform', 'syntax_inversion', 'cadence_alias', 'sentence_boundary_shift', 'term_preserving_reframe', 'heat_calibration'],
      sourceLayoutPolicy: sourceLayoutPolicy(),
      rules: [
        'Use remote provider generation only. Do not release local deterministic fallback text.',
        'Preserve core propositions and protected literals while changing register, syntax, cadence, and sentence architecture.',
        sourceLayoutPolicy().instruction
      ],
      flightPacket: {
        packet_version: 'hush-strict-provider-bridge-flight/v9',
        packet_tier: tier,
        mask_id: m.id || '',
        mask_label: m.label || m.name || '',
        mask_evidence: { maskEvidenceState: tier.indexOf('evidence') >= 0 ? 'rich' : 'label-only', wordCount: wordCount(ref) },
        source_layout_policy: sourceLayoutPolicy(),
        protected_literals: literals,
        flight_controls: { candidate_count: 2, strict_budgeted_upstream: true, no_local_fallback: true },
        mask_style_vector: styleVector(m, ref)
      }
    };
  }
  function packetFor(contract, endpoint) {
    return {
      schema: 'td613-hush-outbound-packet/v1',
      exportKind: 'outbound-generator-contract',
      direction: 'outbound',
      diagnosticFallback: false,
      createdAt: new Date().toISOString(),
      mode: 'remote-llm-proxy',
      endpoint: endpoint || null,
      promptVersion: contract.promptVersion,
      flightPacketVersion: contract.flightPacket && contract.flightPacket.packet_version || null,
      snapshot: { identity: 'strict-' + hash([contract.sourceText, contract.maskId, contract.maskReferenceText, endpoint || ''].join('\n')), maskId: contract.maskId || null, sourceHash: hash(contract.sourceText || ''), referenceHash: hash(contract.maskReferenceText || '') },
      note: 'Exact outbound strict provider contract captured before the provider request. This is not provider output.',
      contract: contract,
      flightPacket: contract.flightPacket || null
    };
  }
  function publishPacket(contract, endpoint) {
    var packet = packetFor(contract, endpoint);
    window.__TD613_HUSH_EXACT_OUTBOUND_PACKET = copy(packet);
    window.__TD613_HUSH_PATCH38_LAST_OUTBOUND_PACKET = copy(packet);
    state().hushOutboundPacket = copy(packet);
    try { window.dispatchEvent(new CustomEvent('td613:hush:outbound-packet', { detail: { outboundPacket: packet } })); } catch (_) {}
    return packet;
  }
  function publishProvider(payload, contract, endpoint, httpStatus) {
    var log = { schema: 'td613-hush-provider-log/v1', exportKind: 'inbound-provider-log', direction: 'inbound', createdAt: new Date().toISOString(), bridgeVersion: VERSION, endpoint: endpoint, httpStatus: httpStatus, promptVersion: contract.promptVersion, flightPacketVersion: contract.flightPacket && contract.flightPacket.packet_version || null, note: 'Exact provider return captured after the provider response. This is not the outbound packet.', payload: copy(payload) };
    window.__TD613_HUSH_PR123_LAST = copy({ endpoint: endpoint, httpStatus: httpStatus, payload: payload });
    window.__TD613_HUSH_EXACT_PROVIDER_LOG = copy(log);
    window.__TD613_HUSH_PATCH38_LAST_PROVIDER_REPORTS = [copy(log)];
    state().hushProviderLog = copy(log);
    try { window.dispatchEvent(new CustomEvent('td613:hush:provider-log', { detail: { providerLog: log } })); } catch (_) {}
    return log;
  }
  function candidateText(candidate) { return T(candidate && (candidate.text || candidate.output || candidate.candidate || candidate.rewrite || candidate.message || candidate.selectedOutput || candidate.protectedOutputText)); }
  function collectCandidates(payload) {
    var out = [];
    if (!payload || typeof payload !== 'object') return out;
    ['candidates', 'outputs', 'results'].forEach(function (key) { if (Array.isArray(payload[key])) out = out.concat(payload[key]); });
    if (payload.selectedOutput || payload.output || payload.text || payload.rewrite || payload.message) out.push(payload);
    if (payload.payload && typeof payload.payload === 'object') out = out.concat(collectCandidates(payload.payload));
    if (Array.isArray(payload.providerReports)) payload.providerReports.forEach(function (report) { out = out.concat(collectCandidates(report)); });
    return out;
  }
  function candidateIntegrity(candidate, contract) {
    var value = candidateText(candidate);
    var missing = A(contract.protectedLiterals).filter(function (literal) { return value.indexOf(literal) < 0; });
    var dropped = A(candidate && (candidate.dropped_propositions || candidate.droppedPropositions));
    var added = A(candidate && (candidate.new_claims || candidate.newClaims));
    return { passed: Boolean(value) && !missing.length && !dropped.length && !added.length, missing: missing, dropped: dropped, newClaims: added };
  }
  function selectedCandidate(payload, contract) {
    var candidates = collectCandidates(payload);
    var rejected = [];
    for (var i = 0; i < candidates.length; i += 1) {
      var value = candidateText(candidates[i]);
      var integrity = candidateIntegrity(candidates[i], contract);
      if (value && integrity.passed && !/Just keeping this organized|Keeping this organized|should stay with the note|That keeps the context together/i.test(value)) return { text: value, candidate: candidates[i], integrity: integrity };
      rejected.push(integrity);
    }
    if (payload && typeof payload === 'object') payload.clientIntegrityRejections = rejected;
    return null;
  }
  function markReviewPending(literalCount) {
    var values = {
      hushOutputStatusText: 'Review',
      hushOutputClaimText: 'Pending',
      hushOutputLiteralText: literalCount ? 'Exact gate passed' : 'None required',
      hushOutputSourceText: 'Pending'
    };
    Object.keys(values).forEach(function (id) { var node = $(id); if (node) node.textContent = values[id]; });
  }
  async function callEndpoint(endpoint, contract) {
    publishPacket(contract, endpoint);
    var response = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ contract: contract }) });
    var payload = await response.json().catch(function () { return { ok: false, error: 'non_json_response' }; });
    publishProvider(payload, contract, endpoint, response.status);
    return { endpoint: endpoint, response: response, payload: payload };
  }
  async function run(event) {
    if (event && event.preventDefault) event.preventDefault();
    if (event && event.stopPropagation) event.stopPropagation();
    if (event && event.stopImmediatePropagation) event.stopImmediatePropagation();
    if (running) { status('Strict provider transform already running...', 'info'); return null; }
    var contract = buildContract();
    if (!T(contract.sourceText)) { status('Message required before Transform.', 'error'); return null; }
    running = true;
    setBusy(true);
    setOutput('');
    var last = null;
    try {
      for (var i = 0; i < ENDPOINTS.length; i += 1) {
        var endpoint = ENDPOINTS[i];
        status('Remote provider request in flight via ' + endpoint + '...', 'info');
        try {
          last = await callEndpoint(endpoint, contract);
          var selected = selectedCandidate(last.payload, contract);
          if (last.response.ok && selected) {
            setOutput(selected.text);
            var candidateId = selected.candidate && (selected.candidate.id || selected.candidate.source) || 'provider-candidate';
            var result = { selectedOutput: selected.text, selectedCandidateId: candidateId, candidates: [selected.candidate], lockboxVerification: { passed: true, preservationScore: 1, missing: [], protectedLiterals: contract.protectedLiterals }, releasePolicy: { mayPopulateOutput: true, hardBlocked: false, releaseStatus: 'Review required', state: 'review' }, releaseSummary: { status: 'review', warnings: ['operator-review-required'] }, patch38Diagnostics: { providerMode: 'remote-llm-proxy', providerReports: [window.__TD613_HUSH_EXACT_PROVIDER_LOG], selectedCandidateId: candidateId }, phase37Telemetry: { promptVersion: contract.promptVersion, flightPacketVersion: contract.flightPacket.packet_version, flightPacket: contract.flightPacket }, patch38Snapshot: window.__TD613_HUSH_EXACT_OUTBOUND_PACKET && window.__TD613_HUSH_EXACT_OUTBOUND_PACKET.snapshot || null, outboundPacket: window.__TD613_HUSH_EXACT_OUTBOUND_PACKET };
            state().hushSwapResult = result;
            window.__TD613_HUSH_PATCH38_LAST_RESULT = result;
            status('Remote provider output received from ' + endpoint + '. Review/edit before Accept.', 'ok');
            markReviewPending(contract.protectedLiterals.length);
            try { window.dispatchEvent(new CustomEvent('td613:hush:patch38-result', { detail: { result: result, outboundPacket: window.__TD613_HUSH_EXACT_OUTBOUND_PACKET } })); } catch (_) {}
            return selected.text;
          }
          if (last.payload && (last.payload.held === true || last.payload.status === 'held')) break;
        } catch (error) {
          publishProvider({ error: 'request_failed', message: String(error && error.message || error) }, contract, endpoint, 0);
          last = { endpoint: endpoint, response: { status: 0, ok: false }, payload: { error: 'request_failed' } };
        }
      }
      var payload = last && last.payload || {};
      var reason = T(payload.reason || payload.error || payload.message || 'strict provider returned no releasable remote candidate');
      window.__TD613_HUSH_NO_FALLBACK_RECEIPT = { status: 'held', reason: reason, fallbackReleased: false, endpoint: last && last.endpoint, httpStatus: last && last.response && last.response.status, bridgeVersion: VERSION, contract: contract };
      status('Strict provider held: ' + reason + '. No local fallback released.', 'error');
      return null;
    } finally {
      running = false;
      setBusy(false);
    }
  }
  function bind() {
    if (!document.body || document.body.dataset.pageKind !== 'adversarial-bench') return;
    var button = $('generateMaskedOutputBtn');
    if (!button || button.dataset.pr123StrictProviderBridge === VERSION) return;
    button.dataset.pr123StrictProviderBridge = VERSION;
    button.addEventListener('click', run, true);
    status('Strict provider bridge ready.', 'info');
  }
  window.TD613_HUSH_PR123 = window.TD613_HUSH_PR123 || {};
  window.TD613_HUSH_PR123.version = VERSION;
  window.TD613_HUSH_PR123.run = run;
  window.TD613_HUSH_PR123.buildContract = buildContract;
  window.TD613_HUSH_PR123.protectedLiterals = protectedLiterals;
  window.TD613_HUSH_PR123.candidateIntegrity = candidateIntegrity;
  window.TD613_HUSH_PR123.lastOutboundPacket = function () { return window.__TD613_HUSH_EXACT_OUTBOUND_PACKET || null; };
  window.TD613_HUSH_PR123.lastProviderLog = function () { return window.__TD613_HUSH_EXACT_PROVIDER_LOG || null; };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, { once: true });
  else bind();
  window.setTimeout(bind, 240);
  window.setTimeout(bind, 720);
  window.setTimeout(bind, 1400);
}());
