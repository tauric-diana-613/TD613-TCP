(function () {
  'use strict';

  var VERSION = 'pr130-low-signature-selector-gate/v2-boundary-repair';
  var SUPPORTED_PACKET_TIERS = ['low_signature_packet', 'chat_cadence_packet'];

  function $(id) { return document.getElementById(id); }
  function safe(value) { return String(value == null ? '' : value).trim(); }
  function lowerFirst(value) {
    var text = safe(value);
    return text ? text.charAt(0).toLowerCase() + text.slice(1) : '';
  }
  function asArray(value) { return Array.isArray(value) ? value.filter(Boolean) : []; }
  function words(text) { return safe(text).toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) || []; }
  function normalized(text) { return words(text).join(' '); }
  function remoteSource(candidate) { return /remote-llm-candidate|llm-candidate/i.test(safe(candidate && (candidate.source || candidate.id))); }
  function sourceText() { return safe(($('messageDraftInput') || {}).value || ''); }
  function outputBox() { return $('protectedOutputInput'); }
  function sentenceUnits(text) { return safe(text).replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map(function (item) { return item.trim(); }).filter(Boolean) || []; }
  function terminal(sentence, fallback) { return /[.!?]$/.test(safe(sentence)) ? safe(sentence) : safe(sentence) + (fallback || '.'); }
  function packetTierAllowed(tier) { return SUPPORTED_PACKET_TIERS.indexOf(safe(tier)) >= 0; }

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

  function localBoundaryRisk(candidateText, source) {
    var sourceUnits = sentenceUnits(source);
    var candidateUnits = sentenceUnits(candidateText);
    var sourceFirst = words(sourceUnits[0] || '');
    var sourceLast = words(sourceUnits[sourceUnits.length - 1] || sourceUnits[0] || '');
    var candidateFirst = words(candidateUnits[0] || '');
    var candidateLast = words(candidateUnits[candidateUnits.length - 1] || candidateUnits[0] || '');
    var openingRun = 0;
    var closingRun = 0;
    while (candidateFirst[openingRun] && sourceFirst[openingRun] && candidateFirst[openingRun] === sourceFirst[openingRun]) openingRun += 1;
    while (candidateLast[candidateLast.length - 1 - closingRun] && sourceLast[sourceLast.length - 1 - closingRun] && candidateLast[candidateLast.length - 1 - closingRun] === sourceLast[sourceLast.length - 1 - closingRun]) closingRun += 1;
    var openingThreshold = Math.min(8, Math.max(5, Math.floor(Math.max(0, sourceFirst.length) * 0.62)));
    var closingThreshold = Math.min(8, Math.max(5, Math.floor(Math.max(0, sourceLast.length) * 0.62)));
    var openingRetained = sourceFirst.length >= 6 && openingRun >= openingThreshold;
    var closingRetained = sourceLast.length >= 6 && closingRun >= closingThreshold;
    return { openingRetained: openingRetained, closingRetained: closingRetained, boundaryCopy: openingRetained || closingRetained, openingRun: openingRun, closingRun: closingRun, openingThreshold: openingThreshold, closingThreshold: closingThreshold };
  }

  function rewriteQuestion(sentence) {
    var body = safe(sentence).replace(/[?]+$/g, '').trim();
    var m;
    if ((m = body.match(/^is\s+(.+?)\s+really\s+(.+)$/i))) return 'How should ' + lowerFirst(m[1]) + ' be understood ' + lowerFirst(m[2]) + '?';
    if ((m = body.match(/^does\s+(.+?)\s+really\s+(.+)$/i))) return 'How should ' + lowerFirst(m[1]) + ' be treated when ' + lowerFirst(m[2]) + '?';
    if ((m = body.match(/^how\s+do\s+you\s+(.+)$/i))) return 'What route lets someone ' + lowerFirst(m[1]) + '?';
    if ((m = body.match(/^how\s+does\s+someone\s+(.+)$/i))) return 'What route lets someone ' + lowerFirst(m[1]) + '?';
    if ((m = body.match(/^what\s+(.+)$/i))) return 'Which part of ' + lowerFirst(m[1]) + ' needs naming here?';
    return 'How should this be phrased so the same question moves in a cleaner direction?';
  }

  function rewriteStatement(sentence) {
    var body = safe(sentence).replace(/[.!]+$/g, '').trim();
    if (!body) return '';
    return 'The same point can be carried this way: ' + lowerFirst(body) + '.';
  }

  function boundaryRepairText(candidateText, source, risk) {
    var units = sentenceUnits(candidateText);
    if (!units.length) return candidateText;
    var localRisk = risk || localBoundaryRisk(candidateText, source);
    if (localRisk.openingRetained) {
      units[0] = /\?$/.test(units[0]) ? rewriteQuestion(units[0]) : rewriteStatement(units[0]);
    }
    if (localRisk.closingRetained && units.length > 1) {
      var last = units[units.length - 1];
      units[units.length - 1] = /\?$/.test(last) ? rewriteQuestion(last) : rewriteStatement(last);
    } else if (localRisk.closingRetained && units.length === 1) {
      units[0] = /\?$/.test(units[0]) ? rewriteQuestion(units[0]) : rewriteStatement(units[0]);
    }
    return units.map(function (unit) { return terminal(unit, /\?$/.test(unit) ? '?' : '.'); }).join(' ');
  }

  function repairBoundaryCandidate(candidate, source) {
    if (!candidate || !safe(candidate.text)) return candidate;
    var existingRisk = candidate.sourceCopyRisk || {};
    var localRisk = localBoundaryRisk(candidate.text, source);
    var shouldRepair = Boolean(existingRisk.boundaryCopy || existingRisk.openingRetained || existingRisk.closingRetained || localRisk.boundaryCopy);
    if (!shouldRepair) return candidate;
    var repairedText = boundaryRepairText(candidate.text, source, {
      openingRetained: Boolean(existingRisk.openingRetained || localRisk.openingRetained),
      closingRetained: Boolean(existingRisk.closingRetained || localRisk.closingRetained)
    });
    var repairedRisk = copyRisk(repairedText, source);
    var repairedBoundary = localBoundaryRisk(repairedText, source);
    if (repairedRisk.hard || repairedBoundary.boundaryCopy) return candidate;
    return {
      ...candidate,
      id: (candidate.id || 'remote-candidate') + '-boundary-repaired',
      text: repairedText,
      source: candidate.source || 'remote-llm-candidate',
      strategy: 'pr130-boundary-repair',
      style_operation: candidate.style_operation || candidate.operation || 'boundary_rewrite',
      warnings: [...new Set(asArray(candidate.warnings).filter(function (warning) { return !/source-boundary|source-closing|source-opening/.test(warning); }).concat(['pr130-boundary-repaired']))],
      authorship_moves: [...new Set(asArray(candidate.authorship_moves).concat(['boundary_rewrite']))],
      sourceCopyRisk: { ...existingRisk, ...repairedRisk, ...repairedBoundary, boundaryCopy: false, openingRetained: false, closingRetained: false, repairedBoundaryCopy: true },
      pr130BoundaryRepair: { version: VERSION, originalCandidateId: candidate.id || '', originalBoundary: existingRisk.boundaryCopy ? existingRisk : localRisk }
    };
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
    var warnings = asArray(audit.warnings).length + asArray(candidate.warnings).filter(function (warning) { return warning !== 'pr130-boundary-repaired'; }).length;
    var newClaimRisk = Number((audit.newClaimRisk && audit.newClaimRisk.score) || 0);
    var avg = Number(coverage.averageCoverage || 0);
    var sourceTerm = Number(coverage.sourceTermCoverage || 0);
    var ratio = Number(coverage.lengthRatio || copy.lengthRatio || 1);
    var shapePenalty = ratio < 0.18 || ratio > 3.2 ? 0.4 : 0;
    var repairBonus = candidate.pr130BoundaryRepair ? 0.22 : 0;
    return (avg * 1.1) + (sourceTerm * 0.8) + Math.min(0.6, ratio * 0.12) + repairBonus - (warnings * 0.035) - (newClaimRisk * 0.9) - (copy.hard ? 4 : copy.overlap > 0.9 ? 0.35 : 0) - shapePenalty;
  }

  function lowSignatureEligible(candidate, source) {
    if (!candidate || !remoteSource(candidate) || !safe(candidate.text)) return false;
    var audit = candidate.propositionIntegrity || {};
    var coverage = audit.coverage || {};
    var copy = copyRisk(candidate.text, source);
    var boundary = candidate.sourceCopyRisk || localBoundaryRisk(candidate.text, source);
    var newClaimRisk = Number((audit.newClaimRisk && audit.newClaimRisk.score) || 0);
    var questionOk = Number(audit.questionFormScore == null ? 1 : audit.questionFormScore) >= 0.45;
    var claimOk = !audit.answeredQuestion && !audit.inventedAdvice && !audit.strengthenedClaim && newClaimRisk < 0.55;
    var meaningOk = Number(coverage.averageCoverage || 0) >= 0.22 || Number(coverage.sourceTermCoverage || 0) >= 0.24 || asArray(candidate.preserved_propositions).length > 0;
    var ratio = Number(coverage.lengthRatio || copy.lengthRatio || 1);
    var shapeOk = ratio >= 0.18 && ratio <= 3.2;
    return !copy.hard && !boundary.boundaryCopy && questionOk && claimOk && meaningOk && shapeOk;
  }

  function chooseLowSignatureCandidate(debug) {
    var result = debug && debug.result;
    var diagnostics = result && result.patch38Diagnostics;
    var source = sourceText();
    if (!diagnostics || !packetTierAllowed(diagnostics.packetTier) || !diagnostics.strictRemoteOnly) return null;
    if (safe(result.selectedOutput)) return null;
    var candidates = asArray(diagnostics.mergedCandidates).map(function (candidate) { return repairBoundaryCandidate(candidate, source); }).filter(function (candidate) { return lowSignatureEligible(candidate, source); });
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
      receipt.reason = candidate.pr130BoundaryRepair ? 'chat_cadence_boundary_repaired_remote_release' : 'low_signature_remote_release';
      receipt.message = candidate.pr130BoundaryRepair ? 'Remote candidate retained a source boundary, so PR130 rewrote the copied edge before release. No fallback was released.' : 'Remote candidate passed the relaxed selector gate. No fallback was released.';
      receipt.selectedCandidateId = candidate.id || '';
      receipt.fallbackReleased = false;
      receipt.boundaryRepairApplied = Boolean(candidate.pr130BoundaryRepair);
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
      warning.textContent = candidate.pr130BoundaryRepair ? 'Remote chat-cadence output released after PR130 boundary repair. Review before Accept.' : 'Remote low-signature output released under PR130. Review before Accept.';
    }
    if (debug && debug.result) {
      debug.result.selectedOutput = candidate.text || '';
      debug.result.selectedCandidateId = candidate.id || '';
      debug.result.patch38Diagnostics = debug.result.patch38Diagnostics || {};
      debug.result.patch38Diagnostics.pr130LowSignatureRelease = true;
      debug.result.patch38Diagnostics.pr130BoundaryRepairApplied = Boolean(candidate.pr130BoundaryRepair);
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

  window.TD613_HUSH_PR130_LOW_SIGNATURE_GATE = { version: VERSION, install: install, choose: chooseLowSignatureCandidate, repairBoundaryCandidate: repairBoundaryCandidate };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
}());