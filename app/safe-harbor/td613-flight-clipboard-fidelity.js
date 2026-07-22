(function () {
  'use strict';

  const CONTRACT = 'td613.flight.clipboard-fidelity/2026-07-22-v1';
  const MOBILE_QUERY = '(max-width: 820px)';

  function normalizeLineEndings(value) {
    return String(value ?? '').replace(/\r\n?/gu, '\n');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/gu, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]);
  }

  function lineBreakPreservingHtml(value) {
    const plain = normalizeLineEndings(value);
    return '<div data-td613-flight-clipboard="linebreak-preserved" style="white-space:pre-wrap">' +
      escapeHtml(plain).replace(/\n/gu, '<br>') +
      '</div>';
  }

  function mobileLayout() {
    return Boolean(window.matchMedia && window.matchMedia(MOBILE_QUERY).matches);
  }

  function setCopyStatus(label, detail) {
    const status = document.getElementById('copyStatus');
    if (!status) return;
    status.textContent = (label || 'output') + ' copied' + (detail ? ' · ' + detail : '');
  }

  function fallbackCopy(plain) {
    const textarea = document.createElement('textarea');
    textarea.value = plain;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.inset = '-9999px auto auto -9999px';
    textarea.style.whiteSpace = 'pre-wrap';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    const copied = document.execCommand('copy');
    textarea.remove();
    if (!copied) throw new Error('Clipboard fallback rejected copy.');
    return 'fallback-textarea';
  }

  async function writeClipboard(value) {
    const plain = normalizeLineEndings(value);
    const clipboard = navigator.clipboard;

    if (mobileLayout() && clipboard && typeof clipboard.writeText === 'function') {
      await clipboard.writeText(plain);
      return 'mobile-writeText';
    }

    if (!mobileLayout() && clipboard && typeof clipboard.write === 'function' && typeof window.ClipboardItem === 'function') {
      const item = new window.ClipboardItem({
        'text/plain': new Blob([plain], { type: 'text/plain;charset=utf-8' }),
        'text/html': new Blob([lineBreakPreservingHtml(plain)], { type: 'text/html;charset=utf-8' })
      });
      await clipboard.write([item]);
      return 'desktop-rich-clipboard';
    }

    if (clipboard && typeof clipboard.writeText === 'function') {
      await clipboard.writeText(plain);
      return 'plain-writeText';
    }

    return fallbackCopy(plain);
  }

  async function copyTextWithFidelity(value, label) {
    const plain = normalizeLineEndings(value);
    try {
      const mode = await writeClipboard(plain);
      setCopyStatus(label, mode);
      return { ok: true, mode, text: plain };
    } catch (error) {
      try {
        const mode = fallbackCopy(plain);
        setCopyStatus(label, mode);
        return { ok: true, mode, text: plain };
      } catch (fallbackError) {
        setCopyStatus(label, 'copy failed');
        return {
          ok: false,
          mode: 'failed',
          text: plain,
          error: String(fallbackError?.message || error?.message || fallbackError || error)
        };
      }
    }
  }

  function outputCopyTrigger(target) {
    const button = target && target.closest ? target.closest('button') : null;
    const output = document.getElementById('outputText');
    if (!button || !output || !/copy/iu.test(button.textContent || '')) return null;
    const outputCard = output.closest('.card');
    return outputCard && outputCard.contains(button) ? { button, output } : null;
  }

  function install() {
    window.copyText = copyTextWithFidelity;
    window.TD613FlightClipboardFidelity = Object.freeze({
      contract: CONTRACT,
      copyText: copyTextWithFidelity,
      normalizeLineEndings,
      lineBreakPreservingHtml,
      mobileLayout
    });

    document.addEventListener('click', (event) => {
      const trigger = outputCopyTrigger(event.target);
      if (!trigger) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      void copyTextWithFidelity(trigger.output.value, 'output');
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
