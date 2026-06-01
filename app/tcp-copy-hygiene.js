(function () {
  var VERSION = 'pr126-copy-hygiene/v1+pr130-loader';
  var REPLACEMENTS = [
    [/\bPhase\s*37\b/gi, 'provider packet'],
    [/\bPhase\s*38\b/gi, 'selector route'],
    [/\bPhase\s*39\b/gi, 'reader route'],
    [/\bflight\s+packet\b/gi, 'provider packet'],
    [/\bStrict\s+API\s+transform\b/g, 'Strict provider transform'],
    [/\bstrict\s+api\s+transform\b/g, 'strict provider transform'],
    [/\bRemote\s+LLM\b/g, 'Remote provider'],
    [/\bremote\s+llm\b/g, 'remote provider'],
    [/\bLLM\s+uses\b/g, 'provider uses'],
    [/\bAPI\s+candidate\b/g, 'provider candidate'],
    [/\bAPI\s+candidates\b/g, 'provider candidates'],
    [/\bAPI\s+output\b/g, 'provider output'],
    [/\bCandidate approval blocked\b/g, 'Output held for review'],
    [/\bno candidate available\b/g, 'no approved output available'],
    [/\binspect\s+provider\s+packet\s+diagnostics\b/gi, 'review the receipt'],
    [/\binspect\s+Phase\s*37\s+diagnostics\b/gi, 'review the receipt'],
    [/\bEdit the source\/mask or inspect[^.]+\.??/gi, 'Edit the source or mask, review the receipt, then Transform again.']
  ];

  function cleanText(text) {
    var out = String(text == null ? '' : text);
    REPLACEMENTS.forEach(function (pair) { out = out.replace(pair[0], pair[1]); });
    out = out.replace(/\bprovider packet\s+packet\b/gi, 'provider packet');
    out = out.replace(/\s{2,}/g, ' ');
    return out;
  }

  function canCleanElement(element) {
    if (!element || element.dataset && element.dataset.copyHygieneSkip === 'true') return false;
    var tag = element.tagName;
    return !/^(SCRIPT|STYLE|TEXTAREA|INPUT|CODE|PRE|OPTION|SELECT)$/i.test(tag || '');
  }

  function cleanNode(node) {
    if (!node) return;
    if (node.nodeType === Node.TEXT_NODE) {
      var cleaned = cleanText(node.nodeValue);
      if (cleaned !== node.nodeValue) node.nodeValue = cleaned;
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE || !canCleanElement(node)) return;
    Array.prototype.forEach.call(node.childNodes || [], cleanNode);
    ['title', 'aria-label', 'placeholder'].forEach(function (attr) {
      if (!node.hasAttribute || !node.hasAttribute(attr)) return;
      var current = node.getAttribute(attr);
      var cleaned = cleanText(current);
      if (cleaned !== current) node.setAttribute(attr, cleaned);
    });
  }

  function loadLowSignatureGate() {
    if (!document.body || document.body.dataset.pageKind !== 'adversarial-bench') return;
    if (document.querySelector('script[src^="./hush-pr130-low-signature-selector-gate.js"]')) return;
    var script = document.createElement('script');
    script.src = './hush-pr130-low-signature-selector-gate.js?v=202606010610';
    script.dataset.td613Pr130Loader = VERSION;
    document.head.appendChild(script);
  }

  function run() {
    if (!document.body) return;
    document.body.dataset.copyHygiene = VERSION;
    cleanNode(document.body);
  }

  function observe() {
    if (!window.MutationObserver || !document.body || window.__TD613_COPY_HYGIENE_OBSERVER) return;
    window.__TD613_COPY_HYGIENE_OBSERVER = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === 'characterData') cleanNode(mutation.target);
        Array.prototype.forEach.call(mutation.addedNodes || [], cleanNode);
      });
    });
    window.__TD613_COPY_HYGIENE_OBSERVER.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  function boot() {
    run();
    observe();
    loadLowSignatureGate();
  }

  window.TD613_COPY_HYGIENE = { version: VERSION, run: run, cleanText: cleanText, loadLowSignatureGate: loadLowSignatureGate };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
}());
