(function () {
  'use strict';

  var VERSION = 'pr92.1-dom-profile-suggestions-owner';
  var armedSource = '';
  var suppress = false;

  function $(id) { return document.getElementById(id); }
  function text(value) { return String(value == null ? '' : value); }
  function trim(value) { return text(value).trim(); }
  function esc(value) {
    return text(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
  }
  function words(value) { return text(value).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []; }
  function sentences(value) { return (text(value).match(/[^.!?]+[.!?]+|[^.!?]+$/g) || []).map(function (item) { return item.trim(); }).filter(Boolean); }
  function mean(values) { return values.length ? values.reduce(function (sum, item) { return sum + item; }, 0) / values.length : 0; }
  function std(values) {
    if (values.length < 2) return 0;
    var m = mean(values);
    return Math.sqrt(values.reduce(function (sum, item) { return sum + Math.pow(item - m, 2); }, 0) / values.length);
  }
  function round(value, digits) {
    var n = Number(value);
    return Number.isFinite(n) ? Number(n.toFixed(digits == null ? 2 : digits)) : 0;
  }
  function clamp01(value) {
    var n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(1, n));
  }
  function density(source, pattern) {
    return clamp01((text(source).match(pattern) || []).length / (words(source).length || 1));
  }
  function syllables(word) {
    return Math.max(1, (text(word).toLowerCase().match(/[aeiouy]+/g) || []).length);
  }

  function installStyle() {
    if ($('hushPr92DomOwnerStyle')) return;
    var style = document.createElement('style');
    style.id = 'hushPr92DomOwnerStyle';
    style.textContent = [
      'body[data-page-kind="adversarial-bench"] #messageDraftProfile.bay-profile{display:none!important;height:0!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;overflow:hidden!important;}',
      'body[data-page-kind="adversarial-bench"][data-pr92-analyzed="true"] #messageDraftProfile.bay-profile[data-pr92-ready="true"]{display:block!important;height:auto!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;overflow:visible!important;}',
      '#messageDraftProfile .pr92-panel{margin:.65rem 0 .55rem!important;padding:.62rem!important;border:1px solid rgba(137,255,240,.20)!important;border-radius:18px!important;background:linear-gradient(145deg,rgba(4,11,22,.84),rgba(16,7,26,.76))!important;box-sizing:border-box!important;}',
      '#messageDraftProfile .pr92-head{display:grid!important;gap:.18rem!important;margin-bottom:.5rem!important;}',
      '#messageDraftProfile .pr92-head span{display:block!important;color:#89e7ff!important;font-size:.58rem!important;letter-spacing:.18em!important;text-transform:uppercase!important;}',
      '#messageDraftProfile .pr92-head strong{display:block!important;color:#f1fff6!important;font-size:.78rem!important;letter-spacing:.12em!important;text-transform:uppercase!important;}',
      '#messageDraftProfile .pr92-head p{margin:0!important;color:rgba(226,255,236,.66)!important;font-size:.58rem!important;line-height:1.28!important;}',
      '#messageDraftProfile .pr92-grid{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:.34rem!important;}',
      '#messageDraftProfile .pr92-metric{min-height:3rem!important;border:1px solid rgba(137,255,240,.18)!important;border-radius:14px!important;background:rgba(0,0,0,.24)!important;padding:.38rem .42rem!important;box-sizing:border-box!important;}',
      '#messageDraftProfile .pr92-metric span{display:block!important;color:rgba(202,255,223,.58)!important;font-size:.48rem!important;letter-spacing:.1em!important;text-transform:uppercase!important;}',
      '#messageDraftProfile .pr92-metric strong{display:block!important;margin-top:.18rem!important;color:#f1fff6!important;font-size:.64rem!important;line-height:1.16!important;word-break:break-word!important;}',
      '#messageDraftProfile .pr92-scroll{display:none!important;}',
      '#hushSuggestedMasksPanel.pr92-suggestions{display:block!important;margin:.8rem 0 .2rem!important;padding:.72rem!important;border:1px solid rgba(137,255,240,.2)!important;border-radius:18px!important;background:rgba(4,11,22,.64)!important;}',
      '#hushSuggestedMasksPanel[hidden]{display:none!important;}',
      '.pr92-suggest-head{display:grid!important;gap:.12rem!important;margin-bottom:.55rem!important;}',
      '.pr92-suggest-head span{color:#89e7ff!important;font-size:.58rem!important;letter-spacing:.18em!important;text-transform:uppercase!important;}',
      '.pr92-suggest-head strong{color:#f1fff6!important;font-size:.78rem!important;letter-spacing:.12em!important;text-transform:uppercase!important;}',
      '.pr92-suggest-list{display:flex!important;gap:.62rem!important;overflow-x:auto!important;-webkit-overflow-scrolling:touch!important;padding-bottom:.2rem!important;}',
      '.pr92-suggest-card{flex:0 0 82%!important;max-width:28rem!important;border:1px solid rgba(137,255,240,.2)!important;border-radius:18px!important;background:rgba(0,0,0,.25)!important;padding:.72rem!important;box-sizing:border-box!important;}',
      '.pr92-suggest-card strong{display:block!important;color:#f1fff6!important;font-size:.9rem!important;letter-spacing:.08em!important;}',
      '.pr92-suggest-card p{margin:.35rem 0 .55rem!important;color:rgba(226,255,236,.66)!important;font-size:.72rem!important;line-height:1.35!important;}',
      '.pr92-suggest-card button{width:100%!important;border:1px solid rgba(137,255,240,.28)!important;border-radius:999px!important;background:rgba(137,255,240,.10)!important;color:#f1fff6!important;padding:.68rem!important;letter-spacing:.14em!important;text-transform:uppercase!important;font-weight:700!important;}',
      '@media(max-width:760px){#messageDraftProfile .pr92-panel{height:clamp(12rem,34vh,16rem)!important;max-height:clamp(12rem,34vh,16rem)!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;padding:.5rem .46rem 1.4rem!important;}#messageDraftProfile .pr92-head{position:sticky!important;top:-.5rem!important;z-index:3!important;margin:-.5rem -.46rem .3rem!important;padding:.5rem .46rem .34rem!important;background:rgba(4,10,21,.97)!important;}#messageDraftProfile .pr92-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:.26rem!important;}#messageDraftProfile .pr92-metric{height:2.8rem!important;min-height:2.8rem!important;max-height:2.8rem!important;padding:.32rem!important;overflow:hidden!important;}#messageDraftProfile .pr92-metric span{font-size:.39rem!important;letter-spacing:.075em!important;}#messageDraftProfile .pr92-metric strong{font-size:.52rem!important;}#messageDraftProfile .pr92-scroll{display:block!important;position:sticky!important;bottom:0!important;margin:.35rem auto -1rem!important;width:max-content!important;padding:.16rem .5rem!important;border:1px solid rgba(137,255,240,.24)!important;border-radius:999px!important;background:rgba(7,13,28,.96)!important;color:rgba(202,255,223,.86)!important;font-size:.48rem!important;letter-spacing:.15em!important;text-transform:uppercase!important;pointer-events:none!important;}#messageDraftProfile .pr92-panel[data-scrolled="true"] .pr92-scroll{opacity:0!important;}.pr92-suggest-card{flex-basis:86%!important;}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function metric(label, value) {
    return '<article class="pr92-metric"><span>' + esc(label) + '</span><strong>' + esc(value) + '</strong></article>';
  }

  function profile(source) {
    var tokenList = words(source);
    var lower = tokenList.map(function (token) { return token.toLowerCase(); });
    var rows = sentences(source);
    var lengths = rows.map(function (row) { return words(row).length; });
    var unique = new Set(lower);
    var syllableCount = tokenList.reduce(function (sum, token) { return sum + syllables(token); }, 0);
    var bigrams = tokenList.length > 2 ? 1 - new Set(lower.slice(0, -1).map(function (_, i) { return lower[i] + ' ' + lower[i + 1]; })).size / Math.max(1, tokenList.length - 1) : 0;
    var trigrams = tokenList.length > 3 ? 1 - new Set(lower.slice(0, -2).map(function (_, i) { return lower[i] + ' ' + lower[i + 1] + ' ' + lower[i + 2]; })).size / Math.max(1, tokenList.length - 2) : 0;
    var punctuation = density(source, /[.,;:!?—-]/g);
    var caveat = density(source, /\b(?:maybe|perhaps|unless|except|however|although|but|if|might|could|should|probably|apparently|because|arguably|seems|appears)\b/gi) * 10;
    var claim = density(source, /\b(?:is|are|was|were|will|must|can|created|means|shows|proves|takes|gives|made|built|turns|requires|produces|making|becomes)\b/gi) * 10;
    var literal = density(source, /\b(?:EXHIBIT|DOC|CASE|ID|REF|TD613|SHI|SAC|API|LLM|AI|PR\d+|\d{2,}(?:[-/:.]\d+)*)\b/gi) * 10;
    var first = density(source, /\b(?:i|me|my|mine|we|us|our|ours)\b/gi) * 10;
    var second = density(source, /\b(?:you|your|yours|u|ur)\b/gi) * 10;
    var third = density(source, /\b(?:he|she|they|them|their|hers|his|it|its)\b/gi) * 10;
    return {
      words: tokenList.length,
      characters: source.replace(/\s/g, '').length,
      sentences: rows.length,
      avgSentence: mean(lengths),
      spread: std(lengths),
      maxSentence: Math.max(0, ...lengths),
      burst: mean(lengths) ? std(lengths) / mean(lengths) : 0,
      lexical: tokenList.length ? unique.size / tokenList.length : 0,
      hapax: tokenList.length ? Array.from(unique).filter(function (word) { return lower.filter(function (item) { return item === word; }).length === 1; }).length / tokenList.length : 0,
      avgWord: tokenList.length ? mean(tokenList.map(function (token) { return token.length; })) : 0,
      syllables: tokenList.length ? syllableCount / tokenList.length : 0,
      readability: tokenList.length && rows.length ? 206.835 - 1.015 * (tokenList.length / rows.length) - 84.6 * (syllableCount / tokenList.length) : 0,
      longWord: tokenList.length ? tokenList.filter(function (token) { return token.length >= 8; }).length / tokenList.length : 0,
      shortWord: tokenList.length ? tokenList.filter(function (token) { return token.length <= 3; }).length / tokenList.length : 0,
      punctuation: punctuation,
      comma: density(source, /,/g) * 10,
      colon: density(source, /[;:]/g) * 10,
      dash: density(source, /[—-]/g) * 10,
      quote: density(source, /["“”'‘’]/g) * 10,
      paren: density(source, /[()[\]{}]/g) * 10,
      question: rows.length ? (source.match(/\?/g) || []).length / rows.length : 0,
      exclaim: rows.length ? (source.match(/!/g) || []).length / rows.length : 0,
      claim: clamp01(claim), caveat: clamp01(caveat), literal: clamp01(literal),
      modal: density(source, /\b(?:can|could|would|should|might|must|may|need|needs|supposed|trying)\b/gi) * 10,
      causal: density(source, /\b(?:because|so|therefore|since|that means|which means|if|then|when|thus|hence)\b/gi) * 10,
      contrast: density(source, /\b(?:but|however|although|yet|still|nevertheless|instead|whereas)\b/gi) * 10,
      temporal: density(source, /\b(?:before|after|when|while|then|now|later|already|again|still|until)\b/gi) * 10,
      first: clamp01(first), second: clamp01(second), third: clamp01(third),
      named: density(source, /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}\b/g) * 10,
      uppercase: density(source, /\b[A-Z]{2,}\b/g) * 10,
      recurrence: clamp01(bigrams * 0.32 + trigrams * 0.24), bigrams: bigrams, trigrams: trigrams,
      heat: clamp01(punctuation * 2.2 + caveat * 0.18 + literal * 0.14)
    };
  }

  function clearSurfaces() {
    armedSource = '';
    document.body.dataset.pr92Analyzed = 'false';
    var host = $('messageDraftProfile');
    if (host) { host.innerHTML = ''; host.dataset.pr92Ready = 'false'; }
    var panel = $('hushSuggestedMasksPanel');
    if (panel) { panel.hidden = true; panel.innerHTML = ''; }
  }

  function renderProfile() {
    var input = $('messageDraftInput');
    var host = $('messageDraftProfile');
    if (!input || !host || !armedSource || input.value !== armedSource) return;
    var p = profile(armedSource);
    var route = p.heat > 0.65 ? 'high-friction transform; preserve propositions before style.' : 'stable source; standard mask route.';
    var metrics = [
      metric('Words', p.words), metric('Characters', p.characters), metric('Sentences', p.sentences), metric('Syntax', 'avg ' + round(p.avgSentence, 1) + 'w · spread ' + round(p.spread, 1) + ' · max ' + p.maxSentence), metric('Burstiness', round(p.burst, 2)), metric('Lexical variety', round(p.lexical, 2)), metric('Hapax rate', round(p.hapax, 2)), metric('Avg word length', round(p.avgWord, 1)), metric('Long-word rate', round(p.longWord, 2)), metric('Short-word rate', round(p.shortWord, 2)), metric('Syllables/word', round(p.syllables, 2)), metric('Readability', round(p.readability, 1)), metric('Punctuation', round(p.punctuation, 2)), metric('Comma load', round(p.comma, 2)), metric('Colon/semicolon', round(p.colon, 2)), metric('Dash load', round(p.dash, 2)), metric('Quote load', round(p.quote, 2)), metric('Parenthetical load', round(p.paren, 2)), metric('Question load', round(p.question, 2)), metric('Exclamation load', round(p.exclaim, 2)), metric('Claim density', round(p.claim, 2)), metric('Caveats', round(p.caveat, 2)), metric('Modality', round(p.modal, 2)), metric('Causal hinges', round(p.causal, 2)), metric('Contrast hinges', round(p.contrast, 2)), metric('Temporal hinges', round(p.temporal, 2)), metric('Voice markers', '1p ' + round(p.first, 2) + ' · 2p ' + round(p.second, 2) + ' · 3p ' + round(p.third, 2)), metric('Named/literal load', round(p.named, 2) + ' / ' + round(p.literal, 2)), metric('Uppercase load', round(p.uppercase, 2)), metric('Recurrence', round(p.recurrence, 2)), metric('Bigram repeat', round(p.bigrams, 2)), metric('Trigram repeat', round(p.trigrams, 2)), metric('Pressure', 'heat ' + round(p.heat, 2)), metric('Route difficulty', p.heat >= 0.72 ? 'high' : p.heat >= 0.42 ? 'medium' : 'low')
    ];
    suppress = true;
    host.innerHTML = '<section class="pr92-panel" aria-label="Authorship profile"><div class="pr92-head"><span>Authorship Profile</span><strong>Message route scan</strong><p>' + esc(route) + '</p></div><div class="pr92-grid">' + metrics.join('') + '</div><div class="pr92-scroll">↕ scroll stylometrics</div></section>';
    host.dataset.pr92Ready = 'true';
    document.body.dataset.pr92Analyzed = 'true';
    suppress = false;
    var scroll = host.querySelector('.pr92-panel');
    if (scroll && !scroll.dataset.bound) {
      scroll.dataset.bound = 'true';
      scroll.addEventListener('scroll', function () { if (scroll.scrollTop > 2) scroll.dataset.scrolled = 'true'; }, { passive: true });
    }
  }

  function ensureSuggestions() {
    var panel = $('hushSuggestedMasksPanel');
    if (panel) return panel;
    var host = $('messageDraftProfile') || $('messageDraftInput');
    if (!host) return null;
    panel = document.createElement('section');
    panel.id = 'hushSuggestedMasksPanel';
    panel.className = 'pr92-suggestions';
    host.insertAdjacentElement('afterend', panel);
    return panel;
  }

  function currentMasks() {
    var select = $('maskFieldSelect');
    if (!select) return [];
    return Array.from(select.options || []).map(function (option) {
      return { id: option.value, label: option.textContent || option.value };
    }).filter(function (item) { return item.id; });
  }

  function renderSuggestions() {
    var panel = ensureSuggestions();
    var masks = currentMasks().slice(0, 5);
    if (!panel || !armedSource) return;
    panel.hidden = false;
    panel.classList.add('pr92-suggestions');
    if (!masks.length) {
      panel.innerHTML = '<div class="pr92-suggest-head"><span>Suggested Masks</span><strong>Mask routes still loading</strong></div>';
      return;
    }
    panel.innerHTML = '<div class="pr92-suggest-head"><span>Suggested Masks</span><strong>Recommended routes</strong></div><div class="pr92-suggest-list">' + masks.map(function (mask, index) {
      return '<article class="pr92-suggest-card"><strong>' + esc(mask.label) + '</strong><p>Route ' + (index + 1) + '. Recommended for this message, not for you.</p><button type="button" data-pr92-use-mask="' + esc(mask.id) + '">Use Mask</button></article>';
    }).join('') + '</div>';
  }

  function arm() {
    var input = $('messageDraftInput');
    armedSource = input && trim(input.value) ? input.value : '';
    if (!armedSource) { clearSurfaces(); return; }
    renderProfile();
    renderSuggestions();
  }

  function useMask(id) {
    var select = $('maskFieldSelect');
    if (select && id) {
      select.value = id;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    window.setTimeout(renderProfile, 0);
    window.setTimeout(renderSuggestions, 0);
  }

  function boot() {
    if (!document.body || document.body.dataset.pageKind !== 'adversarial-bench') return;
    if (document.body.dataset.pr92DomOwner === 'true') return;
    document.body.dataset.pr92DomOwner = 'true';
    installStyle();
    clearSurfaces();
    document.addEventListener('click', function (event) {
      var analyze = event.target && event.target.closest && event.target.closest('#analyzeOutputBtn');
      var use = event.target && event.target.closest && event.target.closest('[data-pr92-use-mask],[data-hush-use-mask]');
      if (analyze) [0, 80, 220, 520, 900].forEach(function (delay) { window.setTimeout(arm, delay); });
      if (use) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        useMask(use.getAttribute('data-pr92-use-mask') || use.getAttribute('data-hush-use-mask'));
      }
    }, true);
    var input = $('messageDraftInput');
    if (input) input.addEventListener('input', clearSurfaces, true);
    var host = $('messageDraftProfile');
    if (host) new MutationObserver(function () {
      if (suppress || !armedSource) return;
      if (host.dataset.pr92Ready !== 'true' || !host.querySelector('.pr92-panel')) renderProfile();
    }).observe(host, { childList: true, subtree: true, characterData: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.setTimeout(boot, 500);
  window.TD613_HUSH_PR92 = { version: VERSION, arm: arm, clearSurfaces: clearSurfaces };
}());
