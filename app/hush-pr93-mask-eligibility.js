(function () {
  'use strict';

  var VERSION = 'pr93.1-mask-eligibility-ranking';
  var lastSource = '';

  function $(id) { return document.getElementById(id); }
  function text(value) { return String(value == null ? '' : value); }
  function trim(value) { return text(value).trim(); }
  function esc(value) {
    return text(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
  }
  function words(value) { return text(value).toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) || []; }
  function clamp(value) { return Math.max(0, Math.min(1, Number.isFinite(Number(value)) ? Number(value) : 0)); }
  function density(source, pattern) { return clamp((text(source).match(pattern) || []).length / Math.max(1, words(source).length)); }
  function tokenSet(value) { return new Set(words(value).filter(function (word) { return word.length > 2; })); }
  function overlap(a, b) {
    var aa = tokenSet(a);
    var bb = tokenSet(b);
    if (!aa.size || !bb.size) return 0;
    var hits = 0;
    aa.forEach(function (word) { if (bb.has(word)) hits += 1; });
    return hits / Math.max(aa.size, bb.size);
  }
  function round(value, digits) {
    var n = Number(value);
    return Number.isFinite(n) ? Number(n.toFixed(digits == null ? 3 : digits)) : 0;
  }

  function sourceProfile(source) {
    var tokens = words(source);
    var wc = Math.max(1, tokens.length);
    var punctuation = density(source, /[.,;:!?—-]/g);
    var question = (text(source).match(/\?/g) || []).length > 0 ? 1 : 0;
    var first = density(source, /\b(?:i|me|my|mine|we|us|our|ours)\b/gi) * 10;
    var second = density(source, /\b(?:you|your|yours|u|ur)\b/gi) * 10;
    var claim = density(source, /\b(?:is|are|was|were|will|must|can|created|means|shows|proves|takes|gives|made|built|turns|requires|produces|making|becomes)\b/gi) * 10;
    var caveat = density(source, /\b(?:maybe|perhaps|unless|except|however|although|but|if|might|could|should|probably|apparently|because|arguably|seems|appears|you know|basically)\b/gi) * 10;
    var literal = density(source, /\b(?:EXHIBIT|DOC|CASE|ID|REF|TD613|SHI|SAC|API|LLM|AI|PR\d+|\d{2,}(?:[-/:.]\d+)*)\b/gi) * 10;
    var tech = density(source, /\b(?:ai|llm|model|api|system|platform|generator|algorithm|prompt|route|ingress|sigil|mask|transform)\b/gi) * 10;
    var heatWords = density(source, /\b(?:takes|gives|steal|stole|copy|copied|fear|harm|alert|blocked|wrong|broken|ugly|flicker|glitch|problem|wtf)\b/gi) * 10;
    var intimacy = clamp(first * 0.55 + second * 0.45);
    var heat = clamp(punctuation * 2.1 + heatWords * 0.24 + caveat * 0.12 + second * 0.08 + literal * 0.08);
    var literalLoad = clamp(literal * 0.22 + tech * 0.16);
    var structure = clamp(claim * 0.18 + caveat * 0.16 + question * 0.18 + literalLoad * 0.18);
    return { wc: wc, punctuation: punctuation, question: question, first: clamp(first), second: clamp(second), claim: clamp(claim), caveat: clamp(caveat), literal: literalLoad, tech: clamp(tech), intimacy: intimacy, heat: heat, structure: structure };
  }

  function maskFeatures(label) {
    var l = text(label).toLowerCase();
    return {
      low: /low|steady|mabel|plain|record|quiet|soft|minimal|clean/.test(l) ? 1 : 0,
      high: /heat|hot|lyric|sharp|acid|rupture|pressure|rage|wild|poetic|electric/.test(l) ? 1 : 0,
      formal: /formal|record|office|brief|legal|clinical|structured|report|memo/.test(l) ? 1 : 0,
      casual: /casual|text|friend|dm|soft|warm|mabel/.test(l) ? 1 : 0,
      tech: /tech|signal|system|api|llm|ai|machine|route|mask|generator|console/.test(l) ? 1 : 0,
      question: /question|ask|inquiry|interview/.test(l) ? 1 : 0,
      unlink: /unlink|alias|distance|mask|neutral|obscure|hide|hush/.test(l) ? 1 : 0
    };
  }

  function currentMasks() {
    var select = $('maskFieldSelect');
    if (!select) return [];
    return Array.from(select.options || []).map(function (option, index) {
      var label = option.textContent || option.value;
      var card = document.querySelector('[data-mask-id="' + CSS.escape(option.value) + '"]');
      var desc = card ? card.textContent : '';
      return { id: option.value, label: label, desc: desc, index: index };
    }).filter(function (item) { return item.id; });
  }

  function scoreMask(source, mask) {
    var p = sourceProfile(source);
    var f = maskFeatures(mask.label + ' ' + mask.desc);
    var semantic = overlap(source, mask.label + ' ' + mask.desc);
    var heatFit = 1 - Math.abs(p.heat - (f.high ? 0.78 : f.low ? 0.18 : 0.46));
    var structureFit = 1 - Math.abs(p.structure - (f.formal ? 0.72 : f.casual ? 0.24 : 0.48));
    var techFit = f.tech ? p.tech : 0.22 * (1 - p.tech);
    var questionFit = p.question ? (f.question ? 0.24 : 0.06) : 0;
    var unlinkFit = f.unlink ? clamp(p.literal + p.heat * 0.45) : 0.08;
    var lowPenalty = f.low && p.heat > 0.65 ? 0.22 : 0;
    var highPenalty = f.high && p.heat < 0.28 ? 0.16 : 0;
    var raw = 0.23 * semantic + 0.22 * heatFit + 0.2 * structureFit + 0.14 * techFit + 0.11 * unlinkFit + questionFit - lowPenalty - highPenalty;
    var meaning = clamp(0.48 + semantic * 0.28 + structureFit * 0.18 + techFit * 0.08);
    var unlink = clamp(0.42 + unlinkFit * 0.28 + (1 - semantic) * 0.12 + p.heat * 0.08);
    var drift = clamp(0.28 + Math.abs(p.heat - (f.high ? 0.75 : f.low ? 0.18 : 0.48)) * 0.38 + (f.high && p.heat < 0.25 ? 0.16 : 0));
    return { score: clamp(raw), meaning: meaning, unlink: unlink, drift: drift, semantic: semantic, heatFit: heatFit, structureFit: structureFit, techFit: techFit };
  }

  function ensurePanel() {
    var panel = $('hushSuggestedMasksPanel');
    if (panel) return panel;
    var host = $('messageDraftProfile') || $('messageDraftInput');
    if (!host) return null;
    panel = document.createElement('section');
    panel.id = 'hushSuggestedMasksPanel';
    panel.className = 'pr92-suggestions pr93-ranked-suggestions';
    host.insertAdjacentElement('afterend', panel);
    return panel;
  }

  function render() {
    var source = lastSource || $('messageDraftInput')?.value || '';
    source = trim(source);
    if (!source) return;
    var panel = ensurePanel();
    if (!panel) return;
    var ranked = currentMasks().map(function (mask) {
      return Object.assign({}, mask, { metrics: scoreMask(source, mask) });
    }).sort(function (a, b) {
      if (Math.abs(b.metrics.score - a.metrics.score) > 0.001) return b.metrics.score - a.metrics.score;
      return a.index - b.index;
    }).slice(0, 5);
    panel.hidden = false;
    panel.classList.add('pr92-suggestions', 'pr93-ranked-suggestions');
    if (!ranked.length) {
      panel.innerHTML = '<div class="pr92-suggest-head"><span>Suggested Masks</span><strong>Mask routes still loading</strong></div>';
      return;
    }
    panel.innerHTML = '<div class="pr92-suggest-head"><span>Suggested Masks</span><strong>Ranked by source × mask eligibility</strong></div><div class="pr92-suggest-list">' + ranked.map(function (mask, index) {
      var m = mask.metrics;
      var band = m.score >= 0.66 ? 'strong' : m.score >= 0.48 ? 'review' : 'soft';
      return '<article class="pr92-suggest-card" data-pr93-rank="' + (index + 1) + '"><strong>' + esc(mask.label) + '</strong><p>Rank ' + (index + 1) + ' · ' + band + ' fit for this message route.</p><div class="pr93-score-row"><span>score ' + round(m.score, 3) + '</span><span>meaning ' + round(m.meaning, 3) + '</span><span>unlink ' + round(m.unlink, 3) + '</span><span>drift ' + round(m.drift, 3) + '</span></div><button type="button" data-pr93-use-mask="' + esc(mask.id) + '">Use Mask</button></article>';
    }).join('') + '</div>';
  }

  function useMask(id) {
    var select = $('maskFieldSelect');
    if (select && id) {
      select.value = id;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    window.setTimeout(render, 0);
    if (window.TD613_HUSH_PR92 && typeof window.TD613_HUSH_PR92.arm === 'function') window.setTimeout(window.TD613_HUSH_PR92.arm, 0);
  }

  function installStyle() {
    if ($('hushPr93MaskEligibilityStyle')) return;
    var style = document.createElement('style');
    style.id = 'hushPr93MaskEligibilityStyle';
    style.textContent = '.pr93-score-row{display:flex!important;gap:.32rem!important;flex-wrap:wrap!important;margin:.35rem 0 .6rem!important}.pr93-score-row span{border:1px solid rgba(137,255,240,.18)!important;border-radius:999px!important;padding:.16rem .38rem!important;color:rgba(226,255,236,.72)!important;font-size:.56rem!important;letter-spacing:.08em!important;text-transform:uppercase!important}';
    document.head.appendChild(style);
  }

  function boot() {
    if (!document.body || document.body.dataset.pageKind !== 'adversarial-bench') return;
    if (document.body.dataset.pr93MaskEligibility === 'true') return;
    document.body.dataset.pr93MaskEligibility = 'true';
    installStyle();
    document.addEventListener('click', function (event) {
      var analyze = event.target && event.target.closest && event.target.closest('#analyzeOutputBtn');
      var use = event.target && event.target.closest && event.target.closest('[data-pr93-use-mask]');
      if (analyze) {
        lastSource = $('messageDraftInput')?.value || '';
        [100, 260, 620, 980, 1400].forEach(function (delay) { window.setTimeout(render, delay); });
      }
      if (use) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        useMask(use.getAttribute('data-pr93-use-mask'));
      }
    }, true);
    var input = $('messageDraftInput');
    if (input) input.addEventListener('input', function () { lastSource = ''; }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.setTimeout(boot, 500);
  window.TD613_HUSH_PR93 = { version: VERSION, render: render, scoreMask: scoreMask };
}());
