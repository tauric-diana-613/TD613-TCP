(function () {
  'use strict';

  const CONTRACT = 'td613.flight.clipboard-fidelity/2026-08-17-v4';
  const MOBILE_QUERY = '(max-width: 820px)';
  const PAYLOAD_EDITOR_MARKER = 'td613-flight-inline-payload-editor';

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

  function semanticParagraphHtml(value) {
    const plain = normalizeLineEndings(value);
    if (!plain) return '<div data-td613-flight-clipboard="semantic-paragraphs"></div>';

    const parts = plain.split(/(\n{2,})/u);
    const rendered = [];

    for (const part of parts) {
      if (!part) continue;
      if (/^\n{2,}$/u.test(part)) {
        // Adjacent <p> elements represent the first paragraph break. Preserve any
        // additional blank lines beyond that as explicit empty paragraphs.
        const extraBlankParagraphs = Math.max(0, part.length - 2);
        for (let index = 0; index < extraBlankParagraphs; index += 1) {
          rendered.push('<p><br></p>');
        }
        continue;
      }
      rendered.push('<p>' + escapeHtml(part).replace(/\n/gu, '<br>') + '</p>');
    }

    return '<div data-td613-flight-clipboard="semantic-paragraphs">' + rendered.join('') + '</div>';
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

  function desktopStructuredCopy(textarea, value) {
    if (!textarea || typeof textarea.select !== 'function' || typeof document.execCommand !== 'function') {
      throw new Error('Desktop structured copy path unavailable.');
    }

    const plain = normalizeLineEndings(value);
    const html = semanticParagraphHtml(plain);
    const previousFocus = document.activeElement || null;
    const previousStart = Number.isInteger(textarea.selectionStart) ? textarea.selectionStart : null;
    const previousEnd = Number.isInteger(textarea.selectionEnd) ? textarea.selectionEnd : null;
    const previousDirection = typeof textarea.selectionDirection === 'string' ? textarea.selectionDirection : 'none';
    let clipboardOverridden = false;

    const handleCopy = (event) => {
      if (!event || !event.clipboardData || typeof event.clipboardData.setData !== 'function') return;
      event.clipboardData.setData('text/plain', plain);
      event.clipboardData.setData('text/html', html);
      event.preventDefault();
      clipboardOverridden = true;
    };

    textarea.addEventListener('copy', handleCopy, true);

    try {
      try {
        textarea.focus({ preventScroll: true });
      } catch (error) {
        textarea.focus();
      }
      textarea.select();
      if (typeof textarea.setSelectionRange === 'function') {
        textarea.setSelectionRange(0, textarea.value.length);
      }

      const copied = document.execCommand('copy');
      if (!copied || !clipboardOverridden) {
        throw new Error('Desktop structured copy event did not own the system clipboard.');
      }
      return { mode: 'desktop-dual-mime-copy', plain, html };
    } finally {
      if (typeof textarea.removeEventListener === 'function') {
        textarea.removeEventListener('copy', handleCopy, true);
      }
      if (previousStart !== null && previousEnd !== null && typeof textarea.setSelectionRange === 'function') {
        try {
          textarea.setSelectionRange(previousStart, previousEnd, previousDirection);
        } catch (error) {}
      }
      if (previousFocus && previousFocus !== textarea && typeof previousFocus.focus === 'function') {
        try {
          previousFocus.focus({ preventScroll: true });
        } catch (error) {
          try { previousFocus.focus(); } catch (focusError) {}
        }
      }
    }
  }

  async function writeStructuredClipboard(value) {
    const plain = normalizeLineEndings(value);
    const html = semanticParagraphHtml(plain);
    const clipboard = navigator.clipboard;

    if (clipboard && typeof clipboard.write === 'function' && typeof window.ClipboardItem === 'function') {
      const item = new window.ClipboardItem({
        'text/plain': new Blob([plain], { type: 'text/plain;charset=utf-8' }),
        'text/html': new Blob([html], { type: 'text/html;charset=utf-8' })
      });
      await clipboard.write([item]);
      return 'desktop-dual-mime-write';
    }

    if (clipboard && typeof clipboard.writeText === 'function') {
      await clipboard.writeText(plain);
      return 'desktop-writeText-fallback';
    }

    return fallbackCopy(plain);
  }

  async function writeClipboard(value) {
    const plain = normalizeLineEndings(value);
    const clipboard = navigator.clipboard;

    if (clipboard && typeof clipboard.writeText === 'function') {
      await clipboard.writeText(plain);
      return mobileLayout() ? 'mobile-writeText' : 'desktop-writeText';
    }

    return fallbackCopy(plain);
  }

  async function copyTextWithFidelity(value, label, sourceTextarea) {
    const plain = normalizeLineEndings(value);
    try {
      // The desktop Output button owns the real synchronous copy event and writes
      // both mandatory clipboard representations. Plain text keeps the exact textarea
      // bytes; rich paste targets receive semantic paragraphs instead of a flat <br>
      // stream. Mobile remains on its already-working writeText path.
      const mode = sourceTextarea && !mobileLayout()
        ? desktopStructuredCopy(sourceTextarea, plain).mode
        : await writeClipboard(plain);
      setCopyStatus(label, mode);
      return { ok: true, mode, text: plain };
    } catch (error) {
      try {
        const mode = sourceTextarea && !mobileLayout()
          ? await writeStructuredClipboard(plain)
          : await writeClipboard(plain);
        setCopyStatus(label, mode);
        return { ok: true, mode, text: plain };
      } catch (writeError) {
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
            error: String(fallbackError?.message || writeError?.message || error?.message || fallbackError || writeError || error)
          };
        }
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

  function selectPayloadText(node) {
    if (!node || typeof window.getSelection !== 'function' || typeof document.createRange !== 'function') return;
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function payloadDigits(value) {
    return String(value ?? '').replace(/[^0-9]/gu, '');
  }

  function payloadNumber(value) {
    const digits = payloadDigits(value);
    const parsed = Number.parseInt(digits || '1', 10);
    return Number.isFinite(parsed) ? Math.max(1, parsed) : 1;
  }

  function commitPayloadEditor(node) {
    const authPayload = document.getElementById('authPayload');
    if (!node || !authPayload) return 1;
    const next = payloadNumber(node.textContent);
    const nextText = String(next);
    node.textContent = nextText;
    if (authPayload.value !== nextText) {
      authPayload.value = nextText;
      const EventCtor = window.Event || globalThis.Event;
      if (typeof EventCtor === 'function') {
        authPayload.dispatchEvent(new EventCtor('input', { bubbles: true }));
      }
    }
    return next;
  }

  function installPayloadEditor() {
    const node = document.getElementById('payloadStepperValue');
    if (!node || node.dataset.td613PayloadEditor === 'true') return node || null;

    node.dataset.td613PayloadEditor = 'true';
    node.contentEditable = 'true';
    node.setAttribute('role', 'textbox');
    node.setAttribute('inputmode', 'numeric');
    node.setAttribute('aria-label', 'Payload number. Tap once to select the full number and type a replacement.');
    node.setAttribute('aria-multiline', 'false');
    node.setAttribute('spellcheck', 'false');
    node.setAttribute('data-td613-flight-payload-editor', PAYLOAD_EDITOR_MARKER);

    // Inset-only treatment: no padding, border, width, height, font, or color changes.
    // The existing payload-stepper geometry and typography remain authoritative.
    node.style.background = 'rgba(120,247,255,0.035)';
    node.style.boxShadow = 'inset 0 0 0 1px rgba(120,247,255,0.14)';
    node.style.borderRadius = '2px';
    node.style.cursor = 'text';
    node.style.userSelect = 'text';
    node.style.webkitUserSelect = 'text';
    node.style.outline = 'none';

    const selectAll = (event) => {
      if (event && typeof event.preventDefault === 'function') event.preventDefault();
      if (typeof node.focus === 'function') node.focus();
      selectPayloadText(node);
    };

    node.addEventListener('focus', () => {
      if (typeof window.requestAnimationFrame === 'function') {
        window.requestAnimationFrame(() => selectPayloadText(node));
      } else {
        selectPayloadText(node);
      }
    });
    node.addEventListener('pointerup', selectAll);
    node.addEventListener('click', selectAll);
    node.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        commitPayloadEditor(node);
        if (typeof node.blur === 'function') node.blur();
      }
    });
    node.addEventListener('beforeinput', (event) => {
      if (event.inputType === 'insertParagraph' || event.inputType === 'insertLineBreak') {
        event.preventDefault();
      }
    });
    node.addEventListener('input', () => {
      const clean = payloadDigits(node.textContent);
      if (clean !== node.textContent) node.textContent = clean;
    });
    node.addEventListener('blur', () => commitPayloadEditor(node));

    return node;
  }

  function install() {
    window.copyText = copyTextWithFidelity;
    window.TD613FlightClipboardFidelity = Object.freeze({
      contract: CONTRACT,
      copyText: copyTextWithFidelity,
      normalizeLineEndings,
      semanticParagraphHtml,
      mobileLayout,
      desktopStructuredCopy,
      writeStructuredClipboard,
      installPayloadEditor,
      commitPayloadEditor,
      selectPayloadText
    });

    installPayloadEditor();

    document.addEventListener('click', (event) => {
      const trigger = outputCopyTrigger(event.target);
      if (!trigger) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      void copyTextWithFidelity(trigger.output.value, 'output', trigger.output);
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
