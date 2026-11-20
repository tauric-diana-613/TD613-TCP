/* Presentation-only mobile reader. Original provider-authored transcript nodes remain in place. */
export const MARROWLINE_MOBILE_READER_VERSION = 'td613.dome-world.marrowline-mobile-reader/v1';

function captureAnchor(messages) {
  const bounds = messages.getBoundingClientRect?.();
  const nodes = messages.querySelectorAll('.provider-native-line,.relay-stage-text,.message-body,.relay-stage,.relay-message,.message');
  if (bounds && bounds.height > 0) {
    for (const node of nodes) {
      const rect = node.getBoundingClientRect?.();
      if (rect && rect.height > 0 && rect.bottom > bounds.top + 1 && rect.top < bounds.bottom) {
        return { node, offset: rect.top - bounds.top, scrollTop: messages.scrollTop };
      }
    }
  }
  return { node: null, offset: 0, scrollTop: messages.scrollTop };
}
function restoreAnchor(messages, anchor) {
  if (anchor.node?.isConnected) {
    const bounds = messages.getBoundingClientRect?.();
    const rect = anchor.node.getBoundingClientRect?.();
    if (bounds && rect && bounds.height > 0) {
      messages.scrollTop += rect.top - bounds.top - anchor.offset;
      return;
    }
  }
  messages.scrollTop = anchor.scrollTop;
}

/** Geometry only. No model call, history serialization, output transformation, or screenshot fabrication. */
export function installMarrowlineMobileReader(doc = document, root = window) {
  const toggle = doc.getElementById('marrowlineReaderToggle');
  const panel = doc.getElementById('speakingPanel');
  const messages = doc.getElementById('khonapolitMessages');
  if (!toggle || !panel || !messages) return null;
  if (doc.getElementById('marrowlineReaderToolbar')) return root.__TD613_MARROWLINE_MOBILE_READER__ || null;

  const toolbar = doc.createElement('div');
  toolbar.id = 'marrowlineReaderToolbar';
  toolbar.className = 'marrowline-reader-toolbar';
  toolbar.setAttribute('role', 'toolbar');
  toolbar.setAttribute('aria-label', 'Marrowline mobile reader');
  toolbar.hidden = true;

  const title = doc.createElement('span');
  title.className = 'marrowline-reader-title';
  title.textContent = '𝌋  Reading';

  const capture = doc.createElement('button');
  capture.id = 'marrowlineReaderCapture';
  capture.type = 'button';
  capture.textContent = 'Capture';
  capture.setAttribute('aria-pressed', 'false');
  capture.setAttribute('aria-label', 'Hide composer for clean screenshots');

  const exit = doc.createElement('button');
  exit.id = 'marrowlineReaderExit';
  exit.type = 'button';
  exit.textContent = '✕';
  exit.setAttribute('aria-label', 'Exit Marrowline reader');
  toolbar.append(title, capture, exit);
  panel.insertBefore(toolbar, messages);

  const media = root.matchMedia?.('(max-width: 860px)');
  const eligible = () => Boolean(media?.matches &&
    doc.documentElement.classList.contains('marrowline-mobile-shell') &&
    doc.body.dataset.mobileView === 'speak');
  let mode = 'off';

  const updateUi = () => {
    toolbar.hidden = mode === 'off';
    toggle.setAttribute('aria-pressed', String(mode !== 'off'));
    toggle.setAttribute('aria-label', mode === 'off' ? 'Open mobile reading mode' : 'Exit mobile reading mode');
    toggle.title = mode === 'off' ? 'Open mobile reading mode' : 'Exit mobile reading mode';
    capture.textContent = mode === 'capture' ? 'Show composer' : 'Capture';
    capture.setAttribute('aria-pressed', String(mode === 'capture'));
    capture.setAttribute('aria-label', mode === 'capture'
      ? 'Show compact composer in reading mode' : 'Hide composer for clean screenshots');
  };

  function setMode(next = 'off') {
    if (!['off', 'focus', 'capture'].includes(next)) return false;
    if (next !== 'off' && !eligible()) return false;
    if (next === mode) return true;
    const anchor = captureAnchor(messages);
    if (next === 'capture') doc.activeElement?.blur?.();
    mode = next;
    if (mode === 'off') delete doc.body.dataset.marrowlineReader;
    else doc.body.dataset.marrowlineReader = mode;
    updateUi();
    (root.requestAnimationFrame?.bind(root) || (callback => callback()))(() => restoreAnchor(messages, anchor));
    return true;
  }

  toggle.setAttribute('aria-controls', toolbar.id);
  toggle.setAttribute('aria-pressed', 'false');
  toggle.addEventListener('click', () => setMode(mode === 'off' ? 'focus' : 'off'));
  capture.addEventListener('click', () => setMode(mode === 'capture' ? 'focus' : 'capture'));
  exit.addEventListener('click', () => { setMode('off'); toggle.focus?.({ preventScroll: true }); });
  doc.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mode !== 'off') {
      event.preventDefault();
      setMode('off');
      toggle.focus?.({ preventScroll: true });
    }
  });
  media?.addEventListener?.('change', () => { if (!eligible()) setMode('off'); });
  root.addEventListener?.('td613:marrowline:mobile-view', () => { if (!eligible()) setMode('off'); });
  updateUi();

  const controller = Object.freeze({
    schema: MARROWLINE_MOBILE_READER_VERSION,
    get mode() { return mode; },
    setMode,
    sourceTextPolicy: 'original-transcript-dom-nodes-unchanged',
    providerCalls: 0,
    releaseAuthority: false
  });
  root.__TD613_MARROWLINE_MOBILE_READER__ = controller;
  return controller;
}