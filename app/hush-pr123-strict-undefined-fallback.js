// app/hush-pr123-strict-undefined-fallback.js
(function () {
  'use strict';

  var VERSION = 'pr123-strict-provider-bridge/v3-visible-status-endpoint-fallback';
  var ENDPOINTS = ['/api/hush-generate-strict', 'https://td613.vercel.app/api/hush-generate-strict'];
  var running = false;

  function $(id) { return document.getElementById(id); }
  function text(value) { return String(value == null ? '' : value).trim(); }
  function words(value) { return (String(value || '').match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length; }
  function safeJson(value) { try { return JSON.parse(JSON.stringify(value || {})); } catch (_) { return {}; } }
  function ensureVisibleStatus() {
    var existing = $('hushGeneratorStatus') || $('hushStrictProviderStatus');
    if (existing) return existing;
    var host = $('hushGeneratorModeWrap') || $('hushGateStrip') || ($('generateMaskedOutputBtn') && $('generateMaskedOutputBtn').closest('.hush-transform-gate')) || ($('generateMaskedOutputBtn') && $('generateMaskedOutputBtn').parentElement);
    var status = document.createElement('div');
    status.id = 'hushStrictProviderStatus';
    status.className = 'hush-warning-panel hush-generator-status';
    status.setAttribute('aria-live', 'polite');
    status.style.cssText = 'display:block;margin:.65rem 0 0;padding:.7rem .85rem;border:1px solid rgba(137,255,240,.28);border-radius:18px;background:rgba(3,9,20,.82);color:rgba(226,255,236,.92);font-size:.72rem;line-height:1.35;letter-spacing:.02em;white-space:normal;overflow-wrap:anywhere;';
    status.textContent = 'Strict provider bridge ready.';
    if (host && host.parentElement && host.id === 'hushGateStrip') host.insertAdjacentElement('beforebegin', status);
    else if (host && host.appendChild) host.appendChild(status);
    else document.body.appendChild(status);
    return status;
  }
  function selectedMaskPayload() {
    var select = $('maskFieldSelect');
    var option = select && select.selectedOptions && select.selectedOptions[0];
    var reference = $('maskReferenceInput');
    return {
      id: select ? select.value : 'selected-mask',
      label: option ? option.textContent.replace(/\s+[-—].*$/, '').trim() : 'Selected mask',
      name: option ? option.textContent.replace(/\s+[-—].*$/, '').trim() : 'Selected mask',
      description: option ? option.textContent : '',
      sampleSeed: reference ? reference.value : '',
      profileStatus: 'remote-strict'
    };
  }
  function setStatus(message, tone) {
    var status = ensureVisibleStatus();
    if (!status) return;
    status.dataset.tone = tone || 'info';
    status.textContent = message;
    var outputStatus = $('hushOutputStatusText');
    if (outputStatus) outputStatus.textContent = tone === 'ok' ? 'Provider' : tone === 'error' ? 'Held' : 'Running';
  }
  function setOutput(value) {
    var output = $('protectedOutputInput');
    if (!output) return;
    output.value = value || '';
    output.dispatchEvent(new Event('input', { bubbles: true }));
    if (window.__TD613_HUSH_BENCH__ && window.__TD613_HUSH_BENCH__.benchState) {
      window.__TD613_HUSH_BENCH__.benchState.protectedOutputText = value || '';
    }
  }
  function setBusy(value) {
    var button = $('generateMaskedOutputBtn');
    if (button) {
      button.disabled = Boolean(value);
      button.dataset.strictTransformRunning = value ? 'true' : 'false';
    }
    if (document.body) document.body.dataset.strictTransformRunning = value ? 'true' : 'false';
  }
  function sourceLayoutPolicy() {
    return {
      version: 'pr123-strict-provider-bridge/v3-current-hush',
      source_line_breaks_are_constraints: false,
      source_line_breaks_are_reading_context: true,
      mask_line_breaks_may_guide_output_pacing: true,
      instruction: 'Source/input line breaks are reading context only, not output constraints. Do not copy or preserve source line breaks for their own sake. Visible pacing should come from the selected mask/custom-mask corpus or natural target-register pacing.'
    };
  }
  function buildContract() {
    var source = $('messageDraftInput') ? $('messageDraftInput').value : '';
    var mask = selectedMaskPayload();
    var candidateCount = 2;
    var contract = {
      promptVersion: 'hush-strict-provider-bridge-current/v3',
      sourceText: source,
      messageDraftText: source,
      protectedBaselineText: $('protectedBaselineInput') ? $('protectedBaselineInput').value : '',
      maskReferenceText: $('maskReferenceInput') ? $('maskReferenceInput').value : mask.sampleSeed || '',
      mask: mask,
      selectedMask: mask,
      maskId: mask.id,
      selectedMaskId: mask.id,
      candidateCount: candidateCount,
      operatorMode: 'neutralize',
      contextType: $('recognitionContextType') ? $('recognitionContextType').value : 'group-chat',
      exposureDuration: $('recognitionExposureDuration') ? $('recognitionExposureDuration').value : 'single-use',
      strictDirect: true,
      strictNoFallback: true,
      strictBudgetedUpstream: true,
      noFallback: true,
      packetTier: words(mask.sampleSeed || '') >= 180 ? 'strict_remote_mask_evidence_packet' : 'strict_remote_mask_label_packet',
      maskEvidenceState: words(mask.sampleSeed || '') >= 180 ? 'rich' : 'label-only',
      operationTaxonomy: ['register_transform', 'syntax_inversion', 'cadence_alias', 'sentence_boundary_shift', 'term_preserving_reframe', 'heat_calibration'],
      sourceLayoutPolicy: sourceLayoutPolicy(),
      rules: [
        'Use remote provider generation only. Do not release local deterministic fallback text.',
        'Do not prepend organizer phrases such as “Just keeping this organized.”',
        'Preserve core propositions and protected literals while changing register, syntax, cadence, and sentence architecture.',
        sourceLayoutPolicy().instruction
      ],
      flightPacket: {
        packet_version: 'hush-strict-provider-bridge-flight/v3',
        packet_tier: words(mask.sampleSeed || '') >= 180 ? 'strict_remote_mask_evidence_packet' : 'strict_remote_mask_label_packet',
        mask_id: mask.id,
        mask_label: mask.label,
        mask_evidence: { maskEvidenceState: words(mask.sampleSeed || '') >= 180 ? 'rich' : 'label-only', wordCount: words(mask.sampleSeed || '') },
        source_layout_policy: sourceLayoutPolicy(),
        flight_controls: {
          candidate_count: candidateCount,
          strict_budgeted_upstream: true,
          no_local_fallback: true,
          required_operations: ['register_transform', 'syntax_inversion', 'cadence_alias', 'sentence_boundary_shift', 'term_preserving_reframe', 'heat_calibration']
        },
        mask_style_vector: {
          mask_id: mask.id,
          display_name: mask.label,
          sample_seed: mask.sampleSeed || '',
          desired_moves: ['change opening word', 'change sentence order', 'preserve propositions', 'avoid source wrapper copy', 'avoid organizer prefaces'],
          source_layout_policy: sourceLayoutPolicy()
        }
      }
    };
    return contract;
  }
  function candidateText(candidate) {
    return text(candidate && (candidate.text || candidate.output || candidate.candidate || candidate.rewrite || candidate.message || candidate.selectedOutput || candidate.protectedOutputText));
  }
  function poisoned(value) {
    return /Just keeping this organized|Keeping this organized|should stay with the note|That keeps the context together/i.test(value || '');
  }
  function allCandidateLike(payload) {
    var out = [];
    if (!payload || typeof payload !== 'object') return out;
    if (Array.isArray(payload.candidates)) out = out.concat(payload.candidates);
    if (Array.isArray(payload.outputs)) out = out.concat(payload.outputs);
    if (Array.isArray(payload.results)) out = out.concat(payload.results);
    if (payload.selectedOutput || payload.output || payload.text || payload.rewrite || payload.message) out.push(payload);
    if (payload.payload && typeof payload.payload === 'object') out = out.concat(allCandidateLike(payload.payload));
    if (Array.isArray(payload.providerReports)) payload.providerReports.forEach(function (report) { out = out.concat(allCandidateLike(report)); });
    return out;
  }
  function usableCandidate(payload) {
    var candidates = allCandidateLike(payload);
    for (var i = 0; i < candidates.length; i += 1) {
      var value = candidateText(candidates[i]);
      if (value && !poisoned(value)) return { text: value, candidate: candidates[i] };
    }
    return null;
  }
  function publishReceipt(payload, contract, endpoint, status) {
    window.__TD613_HUSH_PR123_LAST = safeJson({ endpoint: endpoint, httpStatus: status, payload: payload });
    window.__TD613_HUSH_STRICT_PROVIDER_LAST_CONTRACT = safeJson(contract);
    try {
      window.dispatchEvent(new CustomEvent('td613:hush:outbound-packet', { detail: { outboundPacket: { schema: 'td613-hush-outbound-packet/v1', createdAt: new Date().toISOString(), direction: 'outbound', mode: 'remote-llm-proxy', endpoint: endpoint, contract: contract, flightPacket: contract.flightPacket } } }));
    } catch (_) {}
  }
  async function callEndpoint(endpoint, contract) {
    var response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ contract: contract })
    });
    var payload = await response.json().catch(function () { return { ok: false, error: 'non_json_response' }; });
    return { response: response, payload: payload, endpoint: endpoint };
  }
  async function run(event) {
    if (event && event.preventDefault) event.preventDefault();
    if (event && event.stopPropagation) event.stopPropagation();
    if (event && event.stopImmediatePropagation) event.stopImmediatePropagation();
    if (running) {
      setStatus('Strict provider transform already running…', 'info');
      return null;
    }
    var contract = buildContract();
    if (!text(contract.sourceText)) {
      setStatus('Message required before Transform.', 'error');
      return null;
    }
    running = true;
    setBusy(true);
    setOutput('');
    setStatus('Remote provider request in flight… strict packet sent. No local fallback will be released.', 'info');
    var last = null;
    try {
      for (var i = 0; i < ENDPOINTS.length; i += 1) {
        var endpoint = ENDPOINTS[i];
        setStatus('Remote provider request in flight via ' + endpoint + '…', 'info');
        try {
          last = await callEndpoint(endpoint, contract);
          publishReceipt(last.payload, contract, endpoint, last.response.status);
          var selected = usableCandidate(last.payload);
          if (last.response.ok && selected) {
            setOutput(selected.text);
            setStatus('Remote provider output received from ' + endpoint + '. Review/edit before Accept.', 'ok');
            return selected.text;
          }
        } catch (error) {
          last = { endpoint: endpoint, error: String(error && error.message || error), payload: { error: 'request_failed' }, response: { status: 0, ok: false } };
          window.__TD613_HUSH_PR123_LAST = safeJson(last);
        }
      }
      var payload = last && last.payload ? last.payload : {};
      var reason = text(payload.reason || payload.error || payload.message || (last && last.error) || 'strict provider returned no releasable remote candidate');
      window.__TD613_HUSH_NO_FALLBACK_RECEIPT = { status: 'held', reason: reason, fallbackReleased: false, payload: payload, endpoint: last && last.endpoint };
      setStatus('Strict provider held: ' + reason + '. No local fallback released. Inspect window.__TD613_HUSH_PR123_LAST.', 'error');
      return null;
    } finally {
      running = false;
      setBusy(false);
    }
  }
  function bind() {
    if (!document.body || document.body.dataset.pageKind !== 'adversarial-bench') return;
    ensureVisibleStatus();
    var button = $('generateMaskedOutputBtn');
    if (!button || button.dataset.pr123StrictProviderBridge === VERSION) return;
    button.dataset.pr123StrictProviderBridge = VERSION;
    button.addEventListener('click', run, true);
  }
  window.TD613_HUSH_PR123 = window.TD613_HUSH_PR123 || {};
  window.TD613_HUSH_PR123.version = VERSION;
  window.TD613_HUSH_PR123.run = run;
  window.TD613_HUSH_PR123.buildContract = buildContract;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, { once: true });
  else bind();
  window.setTimeout(bind, 240);
  window.setTimeout(bind, 720);
  window.setTimeout(bind, 1400);
}());
