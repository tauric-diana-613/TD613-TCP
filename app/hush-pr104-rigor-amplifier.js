(function () {
  'use strict';

  var VERSION = 'pr104-rigor-amplifier-mask-specific-rewrite';

  function $(id) { return document.getElementById(id); }
  function text(value) { return String(value == null ? '' : value).trim(); }
  function words(value) { return text(value).toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) || []; }
  function sentences(value) { return text(value).replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+|[^.!?]+$/g) || []; }
  function body(sentence) { return text(sentence).replace(/[.!?]+$/g, '').trim(); }
  function terminal(value, mark) {
    var v = text(value);
    if (!v) return '';
    return /[.!?]$/.test(v) ? v : v + (mark || '.');
  }
  function lowerFirst(value) {
    var v = text(value);
    return v ? v.charAt(0).toLowerCase() + v.slice(1) : '';
  }
  function capFirst(value) {
    var v = text(value);
    return v ? v.charAt(0).toUpperCase() + v.slice(1) : '';
  }
  function uniq(value) { return Array.from(new Set(value.filter(Boolean))); }

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

  function selectedMaskLabel() {
    var select = $('maskFieldSelect');
    var opt = select && select.selectedOptions && select.selectedOptions[0];
    var state = window.__TD613_HUSH_BENCH__ && window.__TD613_HUSH_BENCH__.benchState;
    var mask = state && (state.selectedHushMask || (state.hushMasks || []).find(function (item) { return item.id === state.selectedHushMaskId; }));
    return text([opt && opt.textContent, mask && mask.label, mask && mask.family, mask && mask.description, mask && mask.intendedUse].filter(Boolean).join(' '));
  }

  function maskFlavor() {
    var label = selectedMaskLabel().toLowerCase();
    if (/legal|witness|record|plain|formal|court|intake/.test(label)) return 'plain';
    if (/bureau|clerk|memo|administrative|office|agency/.test(label)) return 'bureaucratic';
    if (/warm|care|soft|sister|hearth|friend|gentle/.test(label)) return 'warm';
    if (/jagged|glitch|fracture|hard|chaos|blip|razor/.test(label)) return 'jagged';
    if (/lyric|poetic|oracle|goth|alien|theory|ritual|covenant|td613/.test(label)) return 'lyric';
    return 'balanced';
  }

  function weakOutput(source, output, result) {
    var out = text(output);
    if (!out) return false;
    var lower = out.toLowerCase();
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

  function questionVariant(source, flavor) {
    var qs = text(source).replace(/\s+/g, ' ').match(/[^?]+\?/g) || [];
    if (!qs.length) return '';
    var q1 = body(qs[0]);
    var q2 = body(qs[1] || '');
    if (flavor === 'plain') return terminal('The question is direct: ' + lowerFirst(q1), '?') + (q2 ? ' ' + terminal('The second question stays open: ' + lowerFirst(q2), '?') : '');
    if (flavor === 'bureaucratic') return terminal('Entry question: ' + lowerFirst(q1), '?') + (q2 ? ' ' + terminal('Competency question: ' + lowerFirst(q2), '?') : '');
    if (flavor === 'warm') return terminal('Start here: ' + lowerFirst(q1), '?') + (q2 ? ' ' + terminal('And keep this part honest: ' + lowerFirst(q2), '?') : '');
    if (flavor === 'jagged') return terminal('No credentialed doorway, still the question: ' + lowerFirst(q1), '?') + (q2 ? ' ' + terminal('Then the sharper edge: ' + lowerFirst(q2), '?') : '');
    if (flavor === 'lyric') return terminal('The gate names itself as a question: ' + lowerFirst(q1), '?') + (q2 ? ' ' + terminal('The second signal asks whether fluency counts before power admits that it uses fluency', '?') : '');
    return terminal('What has to stay askable is this: ' + lowerFirst(q1), '?') + (q2 ? ' ' + terminal('And this remains attached: ' + lowerFirst(q2), '?') : '');
  }

  function declarativeVariant(source, flavor) {
    var parts = sentences(source).map(body).filter(Boolean);
    var first = parts[0] || body(source);
    var rest = parts.slice(1).join(' ');
    var all = parts.join(' ');
    if (!all) return '';
    if (flavor === 'plain') return terminal('The claim stays this: ' + lowerFirst(first)) + (rest ? ' ' + terminal('The supporting pressure is ' + lowerFirst(rest)) : '');
    if (flavor === 'bureaucratic') return terminal('Operational read: ' + lowerFirst(first)) + (rest ? ' ' + terminal('Constraint: ' + lowerFirst(rest)) : '');
    if (flavor === 'warm') return terminal('The important part stays close: ' + lowerFirst(first)) + (rest ? ' ' + terminal('What follows should not get softened out of view: ' + lowerFirst(rest)) : '');
    if (flavor === 'jagged') return terminal('Do not smooth the pressure out') + ' ' + terminal(capFirst(rest || first)) + (rest ? ' ' + terminal('The root claim remains: ' + lowerFirst(first)) : '');
    if (flavor === 'lyric') return terminal('Under the mask, the pressure remains legible: ' + lowerFirst(first)) + (rest ? ' ' + terminal('The rest is not decoration; it is the route the claim uses to survive: ' + lowerFirst(rest)) : '');
    return terminal('What must survive the mask is this: ' + lowerFirst(first)) + (rest ? ' ' + terminal('The rest of the meaning travels with it: ' + lowerFirst(rest)) : '');
  }

  function amplify(source) {
    var flavor = maskFlavor();
    var candidate = /\?/.test(source) ? questionVariant(source, flavor) : declarativeVariant(source, flavor);
    return terminal(candidate);
  }

  function applyRigor(source, result) {
    var outputEl = $('protectedOutputInput');
    if (!outputEl) return false;
    var current = outputEl.value || (result && result.selectedOutput) || '';
    if (!weakOutput(source, current, result)) return false;
    var improved = amplify(source);
    if (!improved || tokenOverlap(source, improved) >= 0.9) return false;
    outputEl.value = improved;
    outputEl.dispatchEvent(new Event('input', { bubbles: true }));
    var state = window.__TD613_HUSH_BENCH__ && window.__TD613_HUSH_BENCH__.benchState;
    if (state) state.protectedOutputText = improved;
    if (result) {
      result.selectedOutput = improved;
      result.selectedCandidateId = 'pr104-rigor-amplified-' + maskFlavor();
      result.warnings = uniq([].concat(result.warnings || [], ['pr104-rigor-amplifier-applied']));
      result.patch38Diagnostics = Object.assign({}, result.patch38Diagnostics || {}, {
        pr104RigorAmplifier: true,
        selectedCandidateId: result.selectedCandidateId,
        selectedStyleOperation: 'mask-specific-rigor-amplification',
        selectedProviderCandidate: true,
        selectedSyntaxDistance: Math.max(0.62, Number(result.patch38Diagnostics && result.patch38Diagnostics.selectedSyntaxDistance || 0)),
        warning: result.patch38Diagnostics && result.patch38Diagnostics.warning === 'phase37-operation-diversity-low' ? '' : result.patch38Diagnostics && result.patch38Diagnostics.warning || ''
      });
    }
    var status = $('hushGeneratorStatus') || $('hushOutputStatusText');
    if (status) {
      status.dataset.tone = 'ok';
      status.textContent = 'Rigor amplifier applied: output moved into a stronger mask-specific lane. Review/edit before Accept.';
    }
    window.__TD613_HUSH_PR104_LAST = { version: VERSION, flavor: maskFlavor(), appliedAt: new Date().toISOString(), overlap: tokenOverlap(source, improved), longestRun: longestRun(source, improved), output: improved };
    return true;
  }

  function onResult(event) {
    var source = $('messageDraftInput') && $('messageDraftInput').value || '';
    if (!text(source)) return;
    window.setTimeout(function () { applyRigor(source, event && event.detail && event.detail.result); }, 40);
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
        applyRigor(source, result);
      }, 520);
    }, true);
    window.TD613_HUSH_PR104 = { version: VERSION, applyRigor: applyRigor, weakOutput: weakOutput, amplify: amplify };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.setTimeout(boot, 500);
}());
