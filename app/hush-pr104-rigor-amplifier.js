(function () {
  'use strict';

  var VERSION = 'pr104.2-audit-only-packet-handoff-guard';

  function $(id) { return document.getElementById(id); }
  function text(value) { return String(value == null ? '' : value).trim(); }
  function words(value) { return text(value).toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) || []; }

  function tokenOverlap(a, b) {
    var aa = new Set(words(a).filter(function (word) { return word.length > 2; }));
    var bb = new Set(words(b).filter(function (word) { return word.length > 2; }));
    if (!aa.size || !bb.size) return 0;
    var hits = 0;
    aa.forEach(function (word) { if (bb.has(word)) hits += 1; });
    return hits / Math.max(aa.size, bb.size);
  }

  function longestRun(a, b) {
    var aw = words(a);
    var bw = words(b);
    var best = 0;
    for (var i = 0; i < aw.length; i += 1) {
      for (var j = 0; j < bw.length; j += 1) {
        var run = 0;
        while (aw[i + run] && bw[j + run] && aw[i + run] === bw[j + run]) run += 1;
        if (run > best) best = run;
      }
    }
    return best;
  }

  function weakOutput(source, output, result) {
    var out = text(output);
    if (!out) return false;
    var overlap = tokenOverlap(source, out);
    var run = longestRun(source, out);
    var warning = text(result && result.patch38Diagnostics && result.patch38Diagnostics.warning).toLowerCase();
    if (/remote rescue candidate|candidate approval blocked|generator timed out|try another mask|check the remote api probe/i.test(out)) return true;
    if (/just keeping this organized|should stay with the note|that keeps the context together|for the record|record anchor|the point is preservation|the same claim, moved|what changes is the frame/i.test(out)) return true;
    if (/phase37-operation-diversity-low|custody-collapse-risk|operation-diversity-low/.test(warning)) return true;
    if (overlap >= 0.72 && run >= 7) return true;
    if (words(out).length < Math.max(8, Math.floor(words(source).length * 0.42))) return true;
    if (/^(here is|this version|in summary|to clarify|trying to)\b/i.test(out)) return true;
    return false;
  }

  function audit(source, result) {
    var outputEl = $('protectedOutputInput');
    var current = text((outputEl && outputEl.value) || (result && result.selectedOutput) || '');
    var weak = weakOutput(source, current, result);
    window.__TD613_HUSH_PR104_LAST = {
      version: VERSION,
      mode: 'audit-only',
      weak: weak,
      overlap: tokenOverlap(source, current),
      longestRun: longestRun(source, current),
      note: 'PR104 no longer rewrites output. Canonical mask voice must come from API packet handoff and selector candidates.'
    };
    if (weak && result) {
      result.warnings = Array.from(new Set([].concat(result.warnings || [], ['pr104-audit-weak-output-needs-packet-strengthening'])));
      result.patch38Diagnostics = Object.assign({}, result.patch38Diagnostics || {}, { pr104AuditOnly: true, pr104WeakOutput: true });
    }
    return weak;
  }

  function onResult(event) {
    var source = $('messageDraftInput') && $('messageDraftInput').value || '';
    if (!text(source)) return;
    window.setTimeout(function () { audit(source, event && event.detail && event.detail.result); }, 40);
  }

  function boot() {
    if (!document.body || document.body.dataset.pageKind !== 'adversarial-bench') return;
    if (document.body.dataset.pr104RigorAmplifier === VERSION) return;
    document.body.dataset.pr104RigorAmplifier = VERSION;
    window.addEventListener('td613:hush:patch38-result', onResult);
    document.addEventListener('click', function (event) {
      if (!event.target || !event.target.closest || !event.target.closest('#generateMaskedOutputBtn')) return;
      window.setTimeout(function () {
        var source = $('messageDraftInput') && $('messageDraftInput').value || '';
        var result = window.__TD613_HUSH_PATCH38_LAST_RESULT || null;
        audit(source, result);
      }, 520);
    }, true);
    window.TD613_HUSH_PR104 = { version: VERSION, mode: 'audit-only', audit: audit, weakOutput: weakOutput };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.setTimeout(boot, 500);
}());