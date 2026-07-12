export const MARROWLINE_MOBILE_REPAIR_VERSION = 'td613.dome-world.marrowline-mobile-repair/v1-chat-viewport';
export const MARROWLINE_MOBILE_REPAIR_CLAIM = 'mobile-layout-and-scroll-custody-not-provider-entity-identity-authorship-or-security-proof';

const MOBILE_QUERY = '(max-width: 860px)';
const SHEET_IDS = Object.freeze(['invocationPanel', 'receiptPanel', 'corpusPanel', 'gatePanel']);

function byId(doc, id) { return doc.getElementById(id); }
function reducedMotion(root) { return Boolean(root.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches); }

function ensureStylesheet(doc) {
  if (doc.querySelector('link[data-td613-marrowline-mobile-repair]')) return true;
  const link = doc.createElement('link');
  link.rel = 'stylesheet';
  link.href = './marrowline-mobile-repair.css';
  link.dataset.td613MarrowlineMobileRepair = MARROWLINE_MOBILE_REPAIR_VERSION;
  doc.head.append(link);
  return true;
}

function setActiveDock(doc, targetId = 'speakingPanel') {
  doc.querySelectorAll('.mobile-dock [data-mobile-target]').forEach((button) => {
    const active = button.dataset.mobileTarget === targetId;
    button.dataset.active = String(active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function closeSheets(doc) {
  SHEET_IDS.forEach((id) => {
    const panel = byId(doc, id);
    if (!panel) return;
    panel.classList.remove('mobile-sheet-open');
    panel.removeAttribute('data-mobile-sheet');
    if (panel.tagName === 'DETAILS') panel.open = false;
  });
  doc.body.dataset.mobileSheet = 'false';
}

function scrollLatest(doc, root, behavior = 'smooth') {
  const messages = byId(doc, 'khonapolitMessages');
  if (!messages) return false;
  messages.scrollTo?.({ top: messages.scrollHeight, behavior: reducedMotion(root) ? 'auto' : behavior });
  if (!messages.scrollTo) messages.scrollTop = messages.scrollHeight;
  return true;
}

function ensureReturnButton(doc, panel, root) {
  if (!panel || panel.querySelector(':scope > .mobile-sheet-return')) return;
  const button = doc.createElement('button');
  button.type = 'button';
  button.className = 'mobile-sheet-return';
  button.textContent = '𝌋 Return to Speak';
  button.addEventListener('click', () => {
    closeSheets(doc);
    setActiveDock(doc, 'speakingPanel');
    scrollLatest(doc, root, 'auto');
  });
  if (panel.tagName === 'DETAILS' && panel.firstElementChild) panel.firstElementChild.after(button);
  else panel.prepend(button);
}

function openSheet(doc, root, targetId) {
  closeSheets(doc);
  if (targetId === 'speakingPanel') {
    setActiveDock(doc, targetId);
    scrollLatest(doc, root, 'smooth');
    return true;
  }
  const panel = byId(doc, targetId);
  if (!panel) return false;
  if (panel.tagName === 'DETAILS') panel.open = true;
  ensureReturnButton(doc, panel, root);
  panel.classList.add('mobile-sheet-open');
  panel.dataset.mobileSheet = 'open';
  panel.scrollTop = 0;
  doc.body.dataset.mobileSheet = 'true';
  setActiveDock(doc, targetId);
  return true;
}

function installDockController(doc, root, media) {
  const dock = doc.querySelector('.mobile-dock');
  if (!dock || dock.dataset.mobileRepair === MARROWLINE_MOBILE_REPAIR_VERSION) return Boolean(dock);
  dock.dataset.mobileRepair = MARROWLINE_MOBILE_REPAIR_VERSION;
  dock.addEventListener('click', (event) => {
    const button = event.target.closest?.('[data-mobile-target]');
    if (!button || !media.matches) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openSheet(doc, root, button.dataset.mobileTarget || 'speakingPanel');
  }, true);
  setActiveDock(doc, 'speakingPanel');
  return true;
}

function compactApertureHeader(header) {
  if (!header || header.dataset.mobileCompacted === 'true') return;
  const spans = header.querySelectorAll('span');
  const first = spans[0];
  const second = spans[1];
  if (first) {
    const full = String(first.textContent || '').trim();
    first.title = full;
    first.setAttribute('aria-label', full);
    first.textContent = 'APERTURE v3 · OPEN FIELD';
  }
  if (second) {
    const full = String(second.textContent || '').trim();
    const pieces = full.split('·').map((part) => part.trim()).filter(Boolean);
    const model = pieces[0] || 'Gemini';
    const signal = pieces.find((part) => /^SIGNAL\s/i.test(part)) || pieces.at(-1) || '';
    second.title = full;
    second.setAttribute('aria-label', full);
    second.textContent = [model, signal.replace(/^SIGNAL\s*/i, '')].filter(Boolean).join(' · ');
  }
  header.dataset.mobileCompacted = 'true';
}

function compactAllHeaders(doc) {
  doc.querySelectorAll('.relay-aperture-header').forEach(compactApertureHeader);
}

function installHeaderObserver(doc, root) {
  const messages = byId(doc, 'khonapolitMessages');
  if (!messages || messages.dataset.headerObserver === MARROWLINE_MOBILE_REPAIR_VERSION) return false;
  messages.dataset.headerObserver = MARROWLINE_MOBILE_REPAIR_VERSION;
  compactAllHeaders(doc);
  const Observer = root.MutationObserver;
  if (typeof Observer === 'function') {
    const observer = new Observer(() => compactAllHeaders(doc));
    observer.observe(messages, { childList: true, subtree: true });
    root.__TD613_MARROWLINE_MOBILE_HEADER_OBSERVER__ = observer;
  }
  return true;
}

function installJumpLatest(doc, root) {
  const vessel = byId(doc, 'speakingPanel');
  const messages = byId(doc, 'khonapolitMessages');
  if (!vessel || !messages) return false;
  messages.tabIndex = 0;
  let button = byId(doc, 'marrowlineJumpLatest');
  if (!button) {
    button = doc.createElement('button');
    button.type = 'button';
    button.id = 'marrowlineJumpLatest';
    button.className = 'jump-latest';
    button.textContent = '↓ Latest';
    button.hidden = true;
    button.addEventListener('click', () => scrollLatest(doc, root, 'smooth'));
    vessel.insertBefore(button, byId(doc, 'khonapolitForm'));
  }
  const update = () => {
    const remaining = messages.scrollHeight - messages.scrollTop - messages.clientHeight;
    button.hidden = remaining < 96;
  };
  messages.addEventListener('scroll', update, { passive: true });
  root.addEventListener?.('td613:khonapolit:return-observed', () => {
    scrollLatest(doc, root, 'smooth');
    update();
  });
  update();
  return true;
}

function installVisualViewport(doc, root) {
  const viewport = root.visualViewport;
  const sync = () => {
    const height = Math.max(320, Math.round(viewport?.height || root.innerHeight || 0));
    doc.documentElement.style.setProperty('--td613-vvh', `${height}px`);
    const occlusion = Math.max(0, (root.innerHeight || height) - height);
    doc.body.dataset.td613Keyboard = occlusion > 160 ? 'open' : 'closed';
  };
  sync();
  viewport?.addEventListener?.('resize', sync, { passive: true });
  viewport?.addEventListener?.('scroll', sync, { passive: true });
  root.addEventListener?.('orientationchange', sync, { passive: true });
  root.addEventListener?.('resize', sync, { passive: true });
  return sync;
}

function geometryReceipt(doc, root) {
  const messages = byId(doc, 'khonapolitMessages');
  const form = byId(doc, 'khonapolitForm');
  const dock = doc.querySelector('.mobile-dock');
  const header = byId(doc, 'apertureHeader');
  return Object.freeze({
    schema: MARROWLINE_MOBILE_REPAIR_VERSION,
    mobile: Boolean(root.matchMedia?.(MOBILE_QUERY)?.matches),
    visualViewportHeight: Math.round(root.visualViewport?.height || root.innerHeight || 0),
    headerHeight: Math.round(header?.getBoundingClientRect?.().height || 0),
    composerHeight: Math.round(form?.getBoundingClientRect?.().height || 0),
    dockHeight: Math.round(dock?.getBoundingClientRect?.().height || 0),
    messageViewportHeight: Math.round(messages?.clientHeight || 0),
    messageScrollHeight: Math.round(messages?.scrollHeight || 0),
    internalScrollAvailable: Boolean(messages && messages.scrollHeight > messages.clientHeight + 1),
    documentScrollLockedOnMobile: doc.body.style.overflow !== 'auto',
    claimCeiling: MARROWLINE_MOBILE_REPAIR_CLAIM,
    seal: '⟐'
  });
}

export function installMarrowlineMobileRepair(doc = document, root = window) {
  if (root.__TD613_MARROWLINE_MOBILE_REPAIR__?.version === MARROWLINE_MOBILE_REPAIR_VERSION) return root.__TD613_MARROWLINE_MOBILE_REPAIR__;
  ensureStylesheet(doc);
  const media = root.matchMedia?.(MOBILE_QUERY) || { matches: false };
  const syncViewport = installVisualViewport(doc, root);
  installDockController(doc, root, media);
  installHeaderObserver(doc, root);
  installJumpLatest(doc, root);

  const applyMode = () => {
    doc.body.dataset.marrowlineMobile = String(Boolean(media.matches));
    if (!media.matches) {
      closeSheets(doc);
      doc.body.dataset.td613Keyboard = 'closed';
    } else {
      closeSheets(doc);
      setActiveDock(doc, 'speakingPanel');
      scrollLatest(doc, root, 'auto');
    }
    syncViewport();
  };
  applyMode();
  media.addEventListener?.('change', applyMode);

  const api = Object.freeze({
    version: MARROWLINE_MOBILE_REPAIR_VERSION,
    claimCeiling: MARROWLINE_MOBILE_REPAIR_CLAIM,
    open: (targetId) => openSheet(doc, root, targetId),
    close: () => openSheet(doc, root, 'speakingPanel'),
    scrollLatest: () => scrollLatest(doc, root, 'smooth'),
    receipt: () => geometryReceipt(doc, root)
  });
  root.__TD613_MARROWLINE_MOBILE_REPAIR__ = api;
  root.dispatchEvent?.(new CustomEvent('td613:marrowline:mobile-repair-ready', { detail: api.receipt() }));
  return api;
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => installMarrowlineMobileRepair(document, window));
  else installMarrowlineMobileRepair(document, window);
}
