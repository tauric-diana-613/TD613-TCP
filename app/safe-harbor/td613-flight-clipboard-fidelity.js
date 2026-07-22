(function installTD613FlightClipboardFidelity(root) {
  'use strict';

  const VERSION = 'td613.flight.clipboard-fidelity/v1.0-desktop-linebreaks';
  const MOBILE_QUERY = '(max-width: 820px)';

  function normalizeClipboardText(value) {
    return String(value ?? '')
      .replace(/\r\n?/g, '\n')
      .replace(/[\u2028\u2029]/g, '\n');
  }

  function escapeClipboardHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function buildClipboardHtml(value) {
    const escaped = escapeClipboardHtml(normalizeClipboardText(value));
    return `<div data-td613-flight-clipboard="linebreak-fidelity" style="white-space:pre-wrap">${escaped.replace(/\n/g, '<br>\n')}</div>`;
  }

  function isDesktopClipboard(host = root) {
    try {
      return !host.matchMedia?.(MOBILE_QUERY)?.matches;
    } catch {
      return true;
    }
  }

  function clipboardConstructors(host = root) {
    return {
      BlobCtor:host.Blob || globalThis.Blob,
      ClipboardItemCtor:host.ClipboardItem || globalThis.ClipboardItem
    };
  }

  function canWriteRichClipboard(host = root) {
    const { BlobCtor, ClipboardItemCtor } = clipboardConstructors(host);
    return isDesktopClipboard(host)
      && typeof host.navigator?.clipboard?.write === 'function'
      && typeof BlobCtor === 'function'
      && typeof ClipboardItemCtor === 'function';
  }

  function fallbackCopyText(host, value) {
    const documentRef = host.document;
    if (!documentRef?.body || typeof documentRef.execCommand !== 'function') {
      throw new Error('Copy fallback unavailable');
    }
    const temp = documentRef.createElement('textarea');
    temp.value = value;
    temp.setAttribute('readonly', '');
    temp.setAttribute('aria-hidden', 'true');
    temp.style.position = 'fixed';
    temp.style.left = '-9999px';
    temp.style.top = '0';
    temp.style.whiteSpace = 'pre';
    documentRef.body.appendChild(temp);
    temp.focus({ preventScroll:true });
    temp.select();
    temp.setSelectionRange?.(0, temp.value.length);
    const copied = documentRef.execCommand('copy');
    temp.remove();
    if (!copied) throw new Error('Copy command failed');
  }

  async function writeClipboard(host, value) {
    const text = normalizeClipboardText(value);
    const clipboard = host.navigator?.clipboard;

    if (canWriteRichClipboard(host)) {
      const { BlobCtor, ClipboardItemCtor } = clipboardConstructors(host);
      const item = new ClipboardItemCtor({
        'text/plain':new BlobCtor([text], { type:'text/plain;charset=utf-8' }),
        'text/html':new BlobCtor([buildClipboardHtml(text)], { type:'text/html;charset=utf-8' })
      });
      await clipboard.write([item]);
      return Object.freeze({ mode:'desktop-rich', text });
    }

    if (typeof clipboard?.writeText === 'function') {
      await clipboard.writeText(text);
      return Object.freeze({ mode:'plain-text', text });
    }

    fallbackCopyText(host, text);
    return Object.freeze({ mode:'exec-command', text });
  }

  function setStatus(host, message, isError = false) {
    if (typeof host.setCopyStatus === 'function') {
      host.setCopyStatus(message, isError);
      return;
    }
    const node = host.document?.getElementById?.('copyStatus');
    if (!node) return;
    node.textContent = message || '';
    node.classList?.toggle?.('is-error', Boolean(isError));
  }

  function install(host = root) {
    if (!host?.document || host.__TD613FlightClipboardFidelityInstalled === VERSION) return false;

    host.copyText = async function copyTextWithLineBreakFidelity(value, label) {
      const copyLabel = label || 'text';
      const text = normalizeClipboardText(value);
      if (!text) {
        setStatus(host, 'Nothing to copy.', true);
        return false;
      }
      try {
        const receipt = await writeClipboard(host, text);
        host.__TD613FlightClipboardReceipt = Object.freeze({
          schema:'td613.flight.clipboard-receipt/v1.0',
          version:VERSION,
          mode:receipt.mode,
          line_breaks:(text.match(/\n/g) || []).length,
          paragraph_breaks:(text.match(/\n\n/g) || []).length,
          copied_at:new Date().toISOString()
        });
        setStatus(host, `Copied ${copyLabel}.`);
        return true;
      } catch (error) {
        try {
          fallbackCopyText(host, text);
          host.__TD613FlightClipboardReceipt = Object.freeze({
            schema:'td613.flight.clipboard-receipt/v1.0',
            version:VERSION,
            mode:'exec-command-after-error',
            line_breaks:(text.match(/\n/g) || []).length,
            paragraph_breaks:(text.match(/\n\n/g) || []).length,
            copied_at:new Date().toISOString()
          });
          setStatus(host, `Copied ${copyLabel}.`);
          return true;
        } catch {
          setStatus(host, 'Copy failed. Select the output text and copy manually.', true);
          return false;
        }
      }
    };

    host.__TD613FlightClipboardFidelityInstalled = VERSION;
    host.document.documentElement.dataset.flightClipboardFidelity = VERSION;
    return true;
  }

  const api = Object.freeze({
    version:VERSION,
    normalizeClipboardText,
    buildClipboardHtml,
    canWriteRichClipboard,
    writeClipboard,
    install
  });

  root.TD613FlightClipboardFidelity = api;
  if (root.document) install(root);
})(typeof window !== 'undefined' ? window : globalThis);
