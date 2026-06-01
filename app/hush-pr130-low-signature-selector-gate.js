(function () {
  'use strict';

  var VERSION = 'pr130-low-signature-selector-gate/v1';

  function $(id) { return document.getElementById(id); }
  function safe(value) { return String(value == null ? '' : value).trim(); }
  function asArray(value) { return Array.isArray(value) ? value.filter(Boolean) : []; }
  function words(text) { return safe(text).toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) || []; }
  function normalized(text) { return words(text).join(' '); }
  function remoteSource(candidate) { return /remote-llm-candidate|llm-candidate/i.test(safe(candidate && (candidate.source || candidate.id))); }
  function sourceText() { return safe(($('messageDraftInput') || {}).value || ''); }
  function outputBox() { return $('protectedOutputInput'); }

  function tokenOverlap(a, b) {
    var aa = new Set(words(a).filter(function (word) { return word.length > 2; }));
    var bb = new Set(words(b).filter(function (word) { return word.length > 2; }));
    if (!aa.size || !bb.size) return 0;
    var hits = 0;
    aa.forEach(function (word) { if (bb.has(word)) hits += 1; });
    return hits / Math.max(aa.size, bb.size);
  }

  function longestRun(candidateText, source) {
    var c = words(candidateText);
    var s = words(source);
    var best = 0;
    for (var i = 0; i < c.length; i += 1) {
      for (var j = 0; j < s.length; j += 1) {
        var k = 0;
        while (c[i + k] && s[j + k] && c[i + k] === s[j + k]) k += 1;
        if (k > best) best = k;
      }
    }
    return best;
  }

  function copyRisk(candidateText, source) {
    var cn = normalized(candidateText);
    var sn = normalized(source);
    if (!cn || !sn) return { hard: false, overlap: 0, longestRun: 0, lengthRatio: 1 };
    var sw = words(source);
    var cw = words(candidateText);
    var overlap = tokenOverlap(candidateText, source);
    var run = longestRun(candidateText, source);
    var ratio = cw.length / Math.max(1, sw.length);
    var hard = cn === sn || (sn.length >= 24 && cn.indexOf(sn) >= 0) || run >= Math.min(10, Math.max(7, Math.floor(sw.length * 0.58))) || (overlap >= 0.93 && ratio >= 0.82 && ratio <= 1.22 && run >= Math.min(8, Math.max(5, Math.floor(sw.length * 0.4))));
    return { hard: hard, overlap: Number(overlap.toFixed(4)), longestRun: run, lengthRatio: Number(ratio.toFixed(4)) };
  }

  function compactBlockedRows(rows) {
    return asArray(rows).slice(0, 6).map(function (row) {
      return {
        id: row.id || '',
        source: row.source || '',
        operation: row.operation || '',
        warnings: asArray(row.warnings).slice(0, 8),
        coverage: Number(row.coverage || 0),
        lengthRatio: Number(row.lengthRatio || 0),
        missingUnitCount: Number(row.missingUnitCount || 0),
        sourceCopyRisk: row.sourceCopyRisk || null
      };
    });
  }

  function candidateScore(candidate, source) {
    var audit = candidate.propositionIntegrity || {};
    var coverage = audit.coverage || {};
    var copy = copyRisk(candidate.text || '', source);
    var warnings = asArray(audit.warnings).length + asArray(candidate.warnings).length;
    var newClaimRisk = Number((audit.newClaimRisk && audit.newClaimRisk.score) || 0);
    var avg = Number(coverage.averageCoverage || 0);
    var sourceTerm = Number(coverage.sourceTermCoverage || 0);
    var ratio = Number(coverage.lengthRatio || copy.lengthRatio || 1);
    var shapePenalty = ratio < 0.18 || ratio > 3.2 ? 0.4 : 0;
    return (avg * 1.1) + (sourceTerm * 0.8) + Math.min(0.6, ratio * 0.12) - (warnings * 0.035) - (newClaimRisk * 0.9) - (copy.hard ? 4 : copy.overlap > 0.9 ? 0.35 : 0) - shapePenalty;
  }

  function lowSignatureEligible(candidate, source) {
    if (!candidate || !remoteSource(candidate) || !safe(candidate.text)) return false;
    var audit = candidate.propositionIntegrity || {};
    var coverage = audit.coverage || {};
    var copy = copyRisk(candidate.text, source);
    var newClaimRisk = Number((audit.newClaimRisk && audit.newClaimRisk.score) || 0);
    var questionOk = Number(audit.questionFormScore == null ? 1 : audit.questionFormScore) >= 0.45;
    var claimOk = !audit.answeredQuestion && !audit.inventedAdvice && !audit.strengthenedClaim && newClaimRisk < 0.55;
    var meaningOk = Number(coverage.averageCoverage || 0) >= 0.22 || Number(coverage.sourceTermCoverage || 0) >= 0.24 || asArray(candidate.preserved_propositions).length > 0;
    var ratio = Number(coverage.lengthRatio || copy.lengthRatio || 1);
    var shapeOk = ratio >= 0.18 && ratio <= 3.2;
    return !copy.hard && questionOk && claimOk && meaningOk && shapeOk;
  }

  function chooseLowSignatureCandidate(debug) {
    var result = debug && debug.result;
    var diagnostics = result && result.patch38Diagnostics;
    var source = sourceText();
    if (!diagnostics || diagnostics.packetTier !== 'low_signature_packet' || !diagnostics.strictRemoteOnly) return null;
    if (safe(result.selectedOutput)) return null;
    var candidates = asArray(diagnostics.mergedCandidates).filter(function (candidate) { return lowSignatureEligible(candidate, source); });
    candidates.sort(function (a, b) { return candidateScore(b, source) - candidateScore(a, source); });
    return candidates[0] || null;
  }

  function attachCompactDiagnostics(debug, candidate) {
    var result = debug && debug.result;
    var diagnostics = result && result.patch38Diagnostics;
    var receipt = window.__TD613_HUSH_NO_FALLBACK_RECEIPT || {};
    if (!diagnostics) return receipt;
    receipt.selectorDiagnostics = {
      version: VERSION,
      packetTier: diagnostics.packetTier || '',
      strictRemoteOnly: Boolean(diagnostics.strictRemoteOnly),
      remoteCandidateCount: diagnostics.remoteCandidateCount || 0,
      releasableCount: diagnostics.releasableCount || 0,
      blockedCount: diagnostics.blockedCount || 0,
      blockedCopyCount: diagnostics.blockedCopyCount || 0,
      warning: diagnostics.warning || '',
      blockedRows: compactBlockedRows(diagnostics.blockedRows),
      selectorRows: asArray(diagnostics.selectorRows).slice(0, 5).map(function (row) {
        return {
          id: row.id,
          operation: row.operation,
          score: row.score,
          coverage: row.coverage,
          lengthRatio: row.lengthRatio,
          maskFidelity: row.maskFidelity,
          sourceCopyRisk: row.sourceCopyRisk || null
        };
      })
    };
    if (candidate) {
      receipt.status = 'released';
      receipt.reason = 'low_signature_remote_release';
      receipt.message = 'Remote low-signature candidate passed the relaxed selector gate. No fallback was released.';
      receipt.selectedCandidateId = candidate.id || '';
      receipt.fallbackReleased = false;
    }
    window.__TD613_HUSH_NO_FALLBACK_RECEIPT = receipt;
    return receipt;
  }

  function releaseCandidate(candidate, debug) {
    var box = outputBox();
    if (!box || !candidate) return false;
    box.value = candidate.text || '';
    box.dispatchEvent(new Event('input', { bubbles: true }));
    var warning = $('acceptWarning');
    if (warning) {
      warning.hidden = false;
      warning.textContent = 'Remote low-signature output released under PR130. Review before Accept.';
    }
    if (debug && debug.result) {
      debug.result.selectedOutput = candidate.text || '';
      debug.result.selectedCandidateId = candidate.id || '';
      debug.result.patch38Diagnostics = debug.result.patch38Diagnostics || {};
      debug.result.patch38Diagnostics.pr130LowSignatureRelease = true;
      debug.result.patch38Diagnostics.pr130SelectedCandidateId = candidate.id || '';
      window.__TD613_HUSH_PATCH38_LAST_RESULT = debug.result;
    }
    window.__TD613_HUSH_FULL_DEBUG_PACKET = debug;
    attachCompactDiagnostics(debug, candidate);
    var popup = $('hushReceiptPopup');
    if (popup) popup.remove();
    return true;
  }

  async function wrappedRun(originalRun, event) {
    var result = await originalRun(event);
    var receipt = window.__TD613_HUSH_NO_FALLBACK_RECEIPT || {};
    if (receipt.reason !== 'selector_rejected_remote_candidates') return result;
    var debug = window.__TD613_HUSH_FULL_DEBUG_PACKET || {};
    attachCompactDiagnostics(debug, null);
    var candidate = chooseLowSignatureCandidate(debug);
    if (candidate && releaseCandidate(candidate, debug)) return window.__TD613_HUSH_PATCH38_LAST_RESULT || result;
    return result;
  }

  function install() {
    var api = window.TD613_HUSH_PR123;
    var button = $('generateMaskedOutputBtn');
    if (!api || typeof api.run !== 'function' || !button || button.dataset.pr130LowSignatureGate === VERSION) return false;
    var originalRun = api.run;
    var clone = button.cloneNode(true);
    clone.dataset.pr130LowSignatureGate = VERSION;
    button.replaceWith(clone);
    api.run = function (event) { return wrappedRun(originalRun, event); };
    clone.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      api.run(event);
    }, true);
    document.body && (document.body.dataset.pr130LowSignatureGate = VERSION);
    return true;
  }

  function boot() {
    var tries = 0;
    var timer = setInterval(function () {
      if (install() || ++tries > 30) clearInterval(timer);
    }, 250);
  }

  window.TD613_HUSH_PR130_LOW_SIGNATURE_GATE = { version: VERSION, install: install, choose: chooseLowSignatureCandidate };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
}());
