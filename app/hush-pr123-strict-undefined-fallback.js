// app/hush-pr123-strict-undefined-fallback.js
(function () {
  'use strict';

  var VERSION = 'pr123-strict-provider-bridge/v2-current-hush';
  var ENDPOINT = '/api/hush-generate-strict';
  var running = false;

  function $(id) { return document.getElementById(id); }
  function text(value) { return String(value == null ? '' : value).trim(); }
  function words(value) { return (String(value || '').match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length; }
  function safeJson(value) { try { return JSON.parse(JSON.stringify(value || {})); } catch (_) { return {}; } }
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
    var status = $('hushGeneratorStatus') || $('hushOutputStatusText');
    if (!status) return;
    status.dataset.tone = tone || 'info';
    status.textContent = message;
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
      version: 'pr123-strict-provider-bridge/v2-current-hush',
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
      promptVersion: 'hush-strict-provider-bridge-current/v2',
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
        packet_version: 'hush-strict-provider-bridge-flight/v2',
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
    return text(candidate && (candidate.text || candidate.output || candidate.candidate || candidate.rewrite || candidate.message));
  }
  function poisoned(value) {
    return /Just keeping this organized|Keeping this organized|should stay with the note|That keeps the context together/i.test(value || '');
  }
  function usableCandidate(payload) {
    var candidates = Array.isArray(payload && payload.candidates) ? payload.candidates : [];
    for (var i = 0; i < candidates.length; i += 1) {
      var value = candidateText(candidates[i]);
      if (value && !poisoned(value)) return { text: value, candidate: candidates[i] };
    }
    return null;
  }
  function publishReceipt(payload, contract) {
    window.__TD613_HUSH_PR123_LAST = safeJson(payload);
    window.__TD613_HUSH_STRICT_PROVIDER_LAST_CONTRACT = safeJson(contract);
    try {
      window.dispatchEvent(new CustomEvent('td613:hush:outbound-packet', { detail: { outboundPacket: { schema: 'td613-hush-outbound-packet/v1', createdAt: new Date().toISOString(), direction: 'outbound', mode: 'remote-llm-proxy', contract: contract, flightPacket: contract.flightPacket } } }));
    } catch (_) {}
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
    try {
      var response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ contract: contract })
      });
      var payload = await response.json().catch(function () { return {}; });
      publishReceipt(payload, contract);
      var selected = usableCandidate(payload);
      if (!response.ok || !selected) {
        var reason = text(payload.reason || payload.error || payload.message || 'strict provider returned no releasable remote candidate');
        window.__TD613_HUSH_NO_FALLBACK_RECEIPT = { status: 'held', reason: reason, fallbackReleased: false, payload: payload };
        setStatus('Strict provider held: ' + reason + '. No local fallback released.', 'error');
        return null;
      }
      setOutput(selected.text);
      setStatus('Remote provider output received. Review/edit before Accept.', 'ok');
      return selected.text;
    } catch (error) {
      window.__TD613_HUSH_NO_FALLBACK_RECEIPT = { status: 'held', reason: 'provider_request_failed', error: String(error && error.message || error), fallbackReleased: false };
      setStatus('Strict provider request failed. No local fallback released.', 'error');
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
