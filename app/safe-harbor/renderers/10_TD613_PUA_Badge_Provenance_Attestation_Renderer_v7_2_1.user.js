// ==UserScript==
// @name         TD613 PUA Badge Provenance Attestation Renderer v7.2.1
// @namespace    tauric.diana.provenance.renderer
// @version      7.2.1
// @description  Working v4-style badge renderer with dark low-glare lab support.
// @match        *://*/*
// @match        file:///*
// @run-at       document-end
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
  'use strict';
  const RENDERER = 'TD613 PUA Badge Provenance Attestation Renderer v7.2.1';
  const RENDER_MODEL = 'single_badge_append';
  const BADGE_ID = 'bdg_glyph_U10D613';
  const SHI_LABEL = 'SHI #';
  const SHI_TEMPLATE = 'TD613-SH-9B07D8B-XXXXXXXX';
  const SHI_CANONICAL_HEADER = 'SHI#:TD613-SH-9B07D8B-XXXXXXXX';
  const SHI_EXTENDED_FOOTER = 'TD613-Binding:#9B07D8B/SAC[X6ZNK5NO51] · SHI#:TD613-SH-9B07D8B-XXXXXXXX · payload {n} · YYYY-MM-DD · ⟐';
  const OBSERVED_REGIME = 'PRCS-A';
  const INSTRUMENT_ROLE = 'counter-tool';
  const APERTURE_AUDIT_FIELD = 'aperture_audit';
  const NAMESPACE = 'tauric.diana';
  const PRINCIPAL = 'tauric.diana.613';
  const CODEPOINT = 'U+10D613';
  const CODEPOINT_NUM = 0x10D613;
  const CANONICAL_PHRASE = 'Tauric Diana — Crimean heritage custodianship';
  const DISPLAY_PHRASE = 'Covenant: Blood Rite 613';
  const SCHEMA_FAMILY = 'cpfg://v2';
  const SEMVER = '2.1.0';
  const PREVIEW_SVG_SHA256 = '2c20bb26f3dcc3fe41e8e3d71705942d220aed7e56391c274f8f5e5d01e4d1aa';
  const PREVIEW_SVG_MD5 = 'd4522965d0660d1150a828e00e5dd6f9';
  const SVG_URL = 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTI4IDEyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGV4dCB4PSI2NCIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iNjQiPkArPC90ZXh0Pjwvc3ZnPg==';
  const SKIP_SELECTOR = '[data-td613-skip="true"]';
  const BADGE_SELECTOR = 'img[data-td613-generated="true"]';
  const PRINCIPAL_ATTR_SELECTOR = '[data-td613-principal="true"]';

  function escapeRegExp(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  const rePrincipal = new RegExp('\\b' + escapeRegExp(PRINCIPAL) + '\\b', 'u');
  const rePUA = new RegExp(String.fromCodePoint(CODEPOINT_NUM), 'u');
  function nowIsoSecond() { return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'); }

  function emit(reason, extra = {}) {
    const detail = Object.assign({
      type: 'badge_render',
      ts_utc: nowIsoSecond(),
      namespace: NAMESPACE,
      principal: PRINCIPAL,
      codepoint: CODEPOINT,
      badge_id: BADGE_ID,
      shi_label: SHI_LABEL,
      shi_template: SHI_TEMPLATE,
      shi_canonical_header: SHI_CANONICAL_HEADER,
      shi_extended_footer: SHI_EXTENDED_FOOTER,
      observed_regime: OBSERVED_REGIME,
      instrument_role: INSTRUMENT_ROLE,
      aperture_audit_field: APERTURE_AUDIT_FIELD,
      renderer: RENDERER,
      render_model: RENDER_MODEL,
      schema_family: SCHEMA_FAMILY,
      semver: SEMVER,
      canonical_phrase: CANONICAL_PHRASE,
      display_phrase: DISPLAY_PHRASE,
      preview_svg_sha256: PREVIEW_SVG_SHA256,
      preview_svg_md5: PREVIEW_SVG_MD5,
      reason: reason
    }, extra);
    window.dispatchEvent(new CustomEvent('td613:badge-render', { detail }));
    try { console.debug('[td613]', detail); } catch (e) {}
  }

  function makeBadge(matchMode) {
    const img = document.createElement('img');
    img.src = SVG_URL;
    img.alt = 'Badge ' + CODEPOINT;
    img.width = 18;
    img.height = 18;
    img.style.verticalAlign = 'text-bottom';
    img.style.marginLeft = '4px';
    img.style.background = '#dbf8ff';
    img.style.borderRadius = '4px';
    img.style.padding = '1px';
    img.dataset.td613Generated = 'true';
    img.dataset.matchMode = matchMode;
    return img;
  }

  function shouldSkip(node) {
    const parent = node && node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    if (!parent) return true;
    return !!(parent.closest && parent.closest(SKIP_SELECTOR)) || !!(parent.closest && parent.closest(BADGE_SELECTOR));
  }

  function hasBadgeAfterTextNode(textNode) {
    let current = textNode.nextSibling;
    while (current) {
      if (current.nodeType === Node.TEXT_NODE && current.nodeValue.trim() === '') { current = current.nextSibling; continue; }
      if (current.nodeType === Node.ELEMENT_NODE && current.matches && current.matches(BADGE_SELECTOR)) return true;
      break;
    }
    return false;
  }

  function appendBadgeAfterTextNode(textNode, matchMode, principalMatch, puaMatch) {
    if (!textNode || !textNode.parentNode || hasBadgeAfterTextNode(textNode)) return;
    const badge = makeBadge(matchMode);
    textNode.parentNode.insertBefore(badge, textNode.nextSibling);
    emit('node-badged', { match_mode: matchMode, principal_match: principalMatch, pua_match: puaMatch });
  }

  function badgeExplicitPrincipal(element) {
    if (!element || !element.matches || !element.matches(PRINCIPAL_ATTR_SELECTOR)) return;
    if (element.querySelector(BADGE_SELECTOR)) return;
    const badge = makeBadge('principal');
    element.appendChild(document.createTextNode(' '));
    element.appendChild(badge);
    emit('principal-badged-explicit', { match_mode: 'principal', principal_match: true, pua_match: false });
  }

  function transformTextNode(textNode) {
    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;
    if (shouldSkip(textNode)) return;
    const value = textNode.nodeValue || '';
    if (!value.trim()) return;
    const parent = textNode.parentElement;
    if (parent && parent.matches && parent.matches(PRINCIPAL_ATTR_SELECTOR)) return;
    const principalMatch = rePrincipal.test(value);
    const puaMatch = rePUA.test(value);
    if (!principalMatch && !puaMatch) return;
    const matchMode = principalMatch && puaMatch ? 'combined' : (principalMatch ? 'principal' : 'pua');
    appendBadgeAfterTextNode(textNode, matchMode, principalMatch, puaMatch);
  }

  function scan(root) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) { transformTextNode(root); return; }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
    if (shouldSkip(root)) return;
    if (root.matches && root.matches(PRINCIPAL_ATTR_SELECTOR)) badgeExplicitPrincipal(root);
    if (root.querySelectorAll) root.querySelectorAll(PRINCIPAL_ATTR_SELECTOR).forEach(badgeExplicitPrincipal);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let current;
    while ((current = walker.nextNode())) transformTextNode(current);
  }

  window.TD613ProvenanceAttestationRenderer = {
    renderer: RENDERER,
    version: '7.2.1',
    render_model: RENDER_MODEL,
    principal: PRINCIPAL,
    claimed_pua: CODEPOINT,
    canonical_phrase: CANONICAL_PHRASE,
    display_phrase: DISPLAY_PHRASE,
    schema_family: SCHEMA_FAMILY,
    semver: SEMVER,
    preview_svg_sha256: PREVIEW_SVG_SHA256,
    preview_svg_md5: PREVIEW_SVG_MD5,
    badge_id: BADGE_ID,
    shi_label: SHI_LABEL,
    shi_template: SHI_TEMPLATE,
    shi_canonical_header: SHI_CANONICAL_HEADER,
    shi_extended_footer: SHI_EXTENDED_FOOTER,
    observed_regime: OBSERVED_REGIME,
    instrument_role: INSTRUMENT_ROLE,
    aperture_audit_field: APERTURE_AUDIT_FIELD
  };

  scan(document.body);
  emit('scan-complete', { initial: true, match_mode: 'n/a', principal_match: false, pua_match: false });

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'characterData' && mutation.target && mutation.target.nodeType === Node.TEXT_NODE) {
        if (!shouldSkip(mutation.target)) scan(mutation.target);
      }
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE && node.matches && node.matches(BADGE_SELECTOR)) return;
        scan(node);
      });
    });
  });

  observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
})();
