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
  const SHI_TEMPLATE = 'TD613-SH-9B07D8B + minted 8-hex suffix';
  const SHI_CANONICAL_HEADER = '';
  const SHI_CANONICAL_FOOTER = '';
  const HISTORICAL_EXAMPLE = 'TD613-Binding:#9B07D8B/SAC[X6ZNK5NO51] · payload 5 · 2025-10-17 · ⟐';
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
  const BINDING_TEXT_SHA256 = '9b07d8bcc73096c8c616ca6039057a46bb42d361edb9c10551c88f3756a1cb04';
  const BINDING_TEXT_MD5 = 'b6ca85d00f211127729bdb73a19c691a';
  const FALLBACK_GLYPH = '@+';
  const FALLBACK_REASON = 'U+10D613 unrenderable in default fonts';
  const SKIP_SELECTOR = '[data-td613-skip="true"]';
  const PRINCIPAL_ATTR_SELECTOR = '[data-td613-principal="true"]';

  // Asymmetric-compute defense: badges are tracked in a WeakSet, not via a
  // queryable HTML attribute. Removes the cheap regex sweep target
  // ('[data-td613-generated]') that automated scanners would key on. Forces
  // any adversary into expensive optical/accessibility-tree scraping.
  const BADGES = new WeakSet();

  function isBadge(node) {
    return Boolean(node) && node.nodeType === Node.ELEMENT_NODE && BADGES.has(node);
  }
  function ancestorBadge(node) {
    let cur = node && node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    while (cur) {
      if (isBadge(cur)) return cur;
      cur = cur.parentElement;
    }
    return null;
  }
  function elementContainsBadge(element) {
    if (!element || !element.firstElementChild) return false;
    const stack = [element.firstElementChild];
    while (stack.length) {
      const node = stack.pop();
      if (!node) continue;
      if (isBadge(node)) return true;
      if (node.firstElementChild) stack.push(node.firstElementChild);
      if (node.nextElementSibling) stack.push(node.nextElementSibling);
    }
    return false;
  }

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
      shi_canonical_footer: SHI_CANONICAL_FOOTER,
      historical_example: HISTORICAL_EXAMPLE,
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

  function readBadgeMeta(node) {
    const principalNode = (node && node.closest && node.closest(PRINCIPAL_ATTR_SELECTOR))
      || document.querySelector(PRINCIPAL_ATTR_SELECTOR)
      || document.body;
    const ds = (principalNode && principalNode.dataset) ? principalNode.dataset : {};
    return {
      shi: ds.td613Shi || null,
      packet_id: ds.td613PacketId || null,
      packet_hash: ds.td613PacketHash || null,
      stylometric_fingerprint: ds.td613StylometricFingerprint || null
    };
  }

  function utf8ToBase64(text) {
    return btoa(unescape(encodeURIComponent(text)));
  }

  function makeBadgeSvg(meta) {
    const m = meta || {};
    const md = JSON.stringify({
      shi_label: SHI_LABEL,
      shi_number: m.shi || null,
      packet_id: m.packet_id || null,
      packet_hash_sha256: m.packet_hash || null,
      stylometric_fingerprint: m.stylometric_fingerprint || null,
      shi_canonical_footer: SHI_CANONICAL_FOOTER,
      historical_example: HISTORICAL_EXAMPLE,
      binding_text_sha256: BINDING_TEXT_SHA256,
      binding_text_md5: BINDING_TEXT_MD5,
      preview_svg_sha256: PREVIEW_SVG_SHA256,
      preview_svg_md5: PREVIEW_SVG_MD5,
      principal: PRINCIPAL,
      claimed_pua: CODEPOINT,
      canonical_phrase: CANONICAL_PHRASE,
      display_phrase: DISPLAY_PHRASE,
      fallback_glyph: FALLBACK_GLYPH,
      fallback_reason: FALLBACK_REASON,
      renderer: RENDERER,
      schema_family: SCHEMA_FAMILY,
      semver: SEMVER
    });
    return '<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">' +
      '<metadata id="safeHarborStylometricProvenance">' + md + '</metadata>' +
      '<text x="64" y="80" text-anchor="middle" font-size="64" data-codepoint="' + CODEPOINT + '" aria-label="' + CODEPOINT + '">' + FALLBACK_GLYPH + '</text>' +
      '</svg>';
  }

  function isCoarsePointer() {
    try {
      return Boolean(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    } catch (error) {
      return false;
    }
  }

  function shouldPreferNativeFileSave(event) {
    if (event && (event.type === 'touchend' || event.type === 'contextmenu')) return true;
    if (event && event.pointerType && event.pointerType !== 'mouse') return true;
    return isCoarsePointer();
  }

  function triggerAnchorDownload(filename, blob) {
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    link.rel = 'noopener';
    link.type = 'image/svg+xml';
    link.style.position = 'fixed';
    link.style.left = '-9999px';
    link.style.top = '-9999px';
    link.setAttribute('data-td613-skip', 'true');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(function () { URL.revokeObjectURL(href); }, 1200);
  }

  async function downloadBadgeSvg(badge, options) {
    const opts = options || {};
    const meta = readBadgeMeta(badge);
    const svgText = makeBadgeSvg(meta);
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = 'TD613_U10D613_' + stamp + '.svg';
    const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    if (opts.preferNative && typeof window.showSaveFilePicker === 'function') {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [{ description: 'TD613 SVG attestation', accept: { 'image/svg+xml': ['.svg'] } }]
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        emit('badge-svg-file-saved', { filename: filename, shi: meta.shi || null, packet_id: meta.packet_id || null, activation: opts.activation || 'tap' });
        return;
      } catch (error) {
        if (error && error.name === 'AbortError') {
          emit('badge-svg-save-canceled', { filename: filename, shi: meta.shi || null, activation: opts.activation || 'tap' });
          return;
        }
      }
    }
    if (opts.preferNative && navigator.share && typeof File === 'function') {
      const file = new File([blob], filename, { type: 'image/svg+xml' });
      const shareData = {
        files: [file],
        title: filename,
        text: 'TD613 Safe Harbor SVG attestation'
      };
      try {
        if (!navigator.canShare || navigator.canShare(shareData)) {
          await navigator.share(shareData);
          emit('badge-svg-shared', { filename: filename, shi: meta.shi || null, packet_id: meta.packet_id || null, activation: opts.activation || 'tap' });
          return;
        }
      } catch (error) {
        if (error && error.name === 'AbortError') {
          emit('badge-svg-share-canceled', { filename: filename, shi: meta.shi || null, activation: opts.activation || 'tap' });
          return;
        }
      }
    }
    triggerAnchorDownload(filename, blob);
    emit('badge-svg-saved', { filename: filename, shi: meta.shi || null, packet_id: meta.packet_id || null });
  }

  let lastBadgeActivationMs = 0;
  function activateBadgeSave(event, badge, activation) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const now = Date.now();
    if (now - lastBadgeActivationMs < 650) return;
    lastBadgeActivationMs = now;
    void downloadBadgeSvg(badge, {
      activation: activation || (event && event.type) || 'click',
      preferNative: shouldPreferNativeFileSave(event)
    });
  }

  function makeBadge(matchMode) {
    const badge = document.createElement('span');
    badge.setAttribute('role', 'button');
    badge.setAttribute('tabindex', '0');
    badge.setAttribute('aria-label', 'Save TD613 SVG attestation for ' + CODEPOINT);
    badge.setAttribute('data-td613-skip', 'true');
    badge.textContent = FALLBACK_GLYPH;
    badge.style.display = 'inline-flex';
    badge.style.alignItems = 'center';
    badge.style.justifyContent = 'center';
    badge.style.width = '22px';
    badge.style.height = '22px';
    badge.style.marginLeft = '4px';
    badge.style.verticalAlign = 'text-bottom';
    badge.style.border = '1px solid rgba(6, 18, 28, 0.18)';
    badge.style.background = '#dbf8ff';
    badge.style.color = '#031018';
    badge.style.borderRadius = '4px';
    badge.style.fontFamily = 'Cascadia Code, Consolas, ui-monospace, monospace';
    badge.style.fontSize = '12px';
    badge.style.fontWeight = '800';
    badge.style.lineHeight = '1';
    badge.style.cursor = 'pointer';
    badge.style.touchAction = 'manipulation';
    badge.style.userSelect = 'none';
    badge.style.webkitUserSelect = 'none';
    badge.style.webkitTouchCallout = 'none';
    badge.title = 'Tap to save TD613 SVG attestation';
    BADGES.add(badge);
    badge.addEventListener('pointerup', function (event) {
      if (event.pointerType && event.pointerType !== 'mouse') activateBadgeSave(event, badge, 'tap');
    });
    badge.addEventListener('touchend', function (event) {
      activateBadgeSave(event, badge, 'tap');
    }, { passive: false });
    badge.addEventListener('contextmenu', function (event) {
      activateBadgeSave(event, badge, 'contextmenu');
    });
    badge.addEventListener('click', function (event) {
      activateBadgeSave(event, badge, 'click');
    });
    badge.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') activateBadgeSave(event, badge, 'keyboard');
    });
    return badge;
  }

  function shouldSkip(node) {
    const parent = node && node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    if (!parent) return true;
    return !!(parent.closest && parent.closest(SKIP_SELECTOR)) || !!ancestorBadge(parent);
  }

  function hasBadgeAfterTextNode(textNode) {
    let current = textNode.nextSibling;
    while (current) {
      if (current.nodeType === Node.TEXT_NODE && current.nodeValue.trim() === '') { current = current.nextSibling; continue; }
      if (isBadge(current)) return true;
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
    if (elementContainsBadge(element)) return;
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
    shi_canonical_footer: SHI_CANONICAL_FOOTER,
    historical_example: HISTORICAL_EXAMPLE,
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
        if (isBadge(node)) return;
        scan(node);
      });
    });
  });

  observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
})();
