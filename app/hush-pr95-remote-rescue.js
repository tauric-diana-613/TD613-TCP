(function () {
  'use strict';

  var VERSION = 'pr95.1-direct-remote-rescue-after-selector-block';
  var originalAlert = null;
  var inflight = false;

  function $(id) { return document.getElementById(id); }
  function text(value) { return String(value == null ? '' : value); }
  function trim(value) { return text(value).trim(); }
  function words(value) { return text(value).toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) || []; }
  function norm(value) { return words(value).join(' '); }

  function sourceLooksCopied(candidate, source) {
    var a = norm(candidate);
    var b = norm(source);
    if (!a || !b) return true;
    if (a === b) return true;
    if (a.indexOf(b) >= 0) return true;
    var aw = words(candidate);
    var bw = words(source);
    var best = 0;
    for (var i = 0; i < aw.length; i += 1) {
      for (var j = 0; j < bw.length; j += 1) {
        var run = 0;
        while (aw[i + run] && bw[j + run] && aw[i + run] === bw[j + run]) run += 1;
        if (run > best) best = run;
      }
    }
    return best >= Math.min(9, Math.max(6, Math.floor(bw.length * 0.55)));
  }

  function selectedMaskPayload() {
    var select = $('maskFieldSelect');
    var option = select && select.selectedOptions && select.selectedOptions[0];
    var reference = $('maskReferenceInput');
    return {
      id: select ? select.value : 'selected-mask',
      label: option ? option.textContent : 'Selected mask',
      name: option ? option.textContent : 'Selected mask',
      description: option ? option.textContent : '',
      sampleSeed: reference ? reference.value : ''
    };
  }

  function setStatus(message, tone) {
    var status = $('hushGeneratorStatus') || $('hushOutputStatusText');
    if (!status) return;
    status.dataset.tone = tone || 'info';
    status.textContent = message;
  }

  function blankOutput() {
    var output = $('protectedOutputInput');
    if (!output) return;
    output.value = '';
    output.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function acceptCandidate(candidateText, payload) {
    var source = $('messageDraftInput') ? $('messageDraftInput').value : '';
    if (!trim(candidateText) || sourceLooksCopied(candidateText, source)) return false;
    var output = $('protectedOutputInput');
    if (!output) return false;
    output.value = candidateText;
    output.dispatchEvent(new Event('input', { bubbles: true }));
    setStatus('Remote rescue candidate produced. Review/edit before Accept.', 'warning');
    var warning = $('acceptWarning');
    if (warning) {
      warning.hidden = true;
      warning.textContent = '';
    }
    window.TD613_HUSH_PR95_LAST = payload || null;
    return true;
  }

  function buildContract(source) {
    return {
      promptVersion: 'hush-pr95-direct-rescue-v1',
      sourceText: source,
      messageDraftText: source,
      mask: selectedMaskPayload(),
      candidateCount: 8,
      operatorMode: 'neutralize',
      operationTaxonomy: ['syntax_inversion', 'cadence_alias', 'register_shift', 'sentence_boundary_shift', 'term_preserving_reframe', 'heat_calibration'],
      flightPacket: {
        packet_version: 'hush-pr95-direct-rescue-flight/v1',
        flight_controls: { candidate_count: 8, required_operations: ['syntax_inversion', 'cadence_alias', 'register_shift', 'sentence_boundary_shift', 'term_preserving_reframe', 'heat_calibration'] },
        mask_style_vector: { desired_moves: ['change opening word', 'change sentence order', 'preserve propositions', 'avoid six-word source runs'] }
      }
    };
  }

  async function remoteRescue(reason) {
    if (inflight) return;
    var source = $('messageDraftInput') ? $('messageDraftInput').value : '';
    if (!trim(source)) return;
    inflight = true;
    blankOutput();
    setStatus('Selector blocked local candidates. Requesting direct remote rescue…', 'warning');
    try {
      var response = await fetch('/api/hush-generate?rescue=1', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ contract: buildContract(source), blockedReason: reason || '' })
      });
      var payload = await response.json().catch(function () { return {}; });
      var candidates = Array.isArray(payload.candidates) ? payload.candidates : [];
      for (var i = 0; i < candidates.length; i += 1) {
        var candidateText = candidates[i] && (candidates[i].text || candidates[i].output || candidates[i].candidate || candidates[i].rewrite);
        if (acceptCandidate(candidateText, payload)) return;
      }
      blankOutput();
      setStatus('Remote rescue returned no usable candidate. Check TD613_HUSH_PR95_LAST / API attempts.', 'error');
      window.TD613_HUSH_PR95_LAST = payload;
    } catch (error) {
      blankOutput();
      setStatus('Remote rescue failed before producing a candidate.', 'error');
      window.TD613_HUSH_PR95_LAST = { error: String(error && error.message || error) };
    } finally {
      inflight = false;
    }
  }

  function installAlertBridge() {
    if (window.__hushPr95AlertBridgeInstalled) return;
    window.__hushPr95AlertBridgeInstalled = true;
    originalAlert = window.alert ? window.alert.bind(window) : null;
    window.alert = function (message) {
      var msg = text(message);
      if (/Candidate approval blocked|all-candidates-copied-source|selector_no_approved_candidate|no candidate available/i.test(msg)) {
        window.setTimeout(function () { remoteRescue(msg); }, 0);
        return undefined;
      }
      return originalAlert ? originalAlert(message) : undefined;
    };
  }

  function boot() {
    if (!document.body || document.body.dataset.pageKind !== 'adversarial-bench') return;
    if (document.body.dataset.pr95RemoteRescue === 'true') return;
    document.body.dataset.pr95RemoteRescue = 'true';
    installAlertBridge();
    document.addEventListener('click', function (event) {
      var transform = event.target && event.target.closest && event.target.closest('#generateMaskedOutputBtn');
      if (!transform) return;
      blankOutput();
      setStatus('Generating mask output…', 'info');
    }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.setTimeout(boot, 500);
  window.TD613_HUSH_PR95 = { version: VERSION, remoteRescue: remoteRescue };
}());
