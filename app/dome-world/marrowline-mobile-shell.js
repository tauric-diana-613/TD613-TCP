export const MARROWLINE_MOBILE_SHELL_VERSION = 'td613.dome-world.marrowline-mobile-shell/v1-scroll-custody';
export const MARROWLINE_MOBILE_QUERY = '(max-width: 860px)';

const VIEW_MAP = Object.freeze({
  speakingPanel: 'speak',
  invocationPanel: 'keys',
  receiptPanel: 'receipt',
  corpusPanel: 'corpus',
  gatePanel: 'gate'
});

function byId(doc, id) { return doc.getElementById(id); }

function ensureStylesheet(doc = document) {
  const href = new URL('./marrowline-mobile-shell.css', import.meta.url).href;
  let link = doc.querySelector('link[data-marrowline-mobile-shell]');
  if (link) return link;
  link = doc.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.dataset.marrowlineMobileShell = MARROWLINE_MOBILE_SHELL_VERSION;
  doc.head.append(link);
  return link;
}

function setViewportHeight(doc = document, root = window) {
  const viewport = root.visualViewport;
  const height = Math.max(320, Math.round(viewport?.height || root.innerHeight || 0));
  doc.documentElement.style.setProperty('--marrowline-vh', `${height}px`);
  return height;
}

function atBottom(node, tolerance = 72) {
  return node.scrollHeight - node.scrollTop - node.clientHeight <= tolerance;
}

function scrollLatest(node, behavior = 'auto') {
  if (!node) return;
  const top = Math.max(0, node.scrollHeight - node.clientHeight);
  node.scrollTo?.({ top, behavior });
  if (!node.scrollTo) node.scrollTop = top;
}

function compactApertureHeader(card) {
  const header = card.querySelector('.relay-aperture-header');
  if (!header || header.dataset.mobileCompacted === 'true') return;
  header.dataset.mobileCompacted = 'true';
  const spans = header.querySelectorAll('span');
  const fullRoute = spans[0]?.textContent?.trim() || '';
  const turnState = spans[1]?.textContent?.trim() || '';
  header.title = [fullRoute, turnState].filter(Boolean).join(' · ');
  if (spans[0]) spans[0].textContent = 'APERTURE v3 · OPEN FIELD';
  if (spans[1]) {
    const model = turnState.split('·')[0]?.trim() || 'Gemini';
    const signal = turnState.match(/SIGNAL\s+([A-Z_]+)/i)?.[1]?.replaceAll('_', ' ') || 'UNOBSERVED';
    spans[1].textContent = `${model} · ${signal}`;
  }
}

function prepareZalgoStage(card) {
  const stage = card.querySelector('.relay-bots');
  const text = stage?.querySelector('.relay-stage-text');
  if (!stage || !text || stage.dataset.zalgoPrepared === 'true') return;
  stage.dataset.zalgoPrepared = 'true';
  const intensityText = stage.querySelector('.relay-stage-head small')?.textContent || '';
  const intensity = Number(intensityText.match(/intensity\s+(\d+)/i)?.[1] || 0);
  stage.dataset.intensity = String(Math.max(0, Math.min(5, intensity)));
  if (stage.dataset.present !== 'true') return;
  const lines = String(text.textContent || '').split(/\n+/).map((line) => line.trim()).filter(Boolean);
  text.replaceChildren(...(lines.length ? lines : ['']).map((line) => {
    const span = text.ownerDocument.createElement('span');
    span.className = 'zalgo-line';
    span.textContent = line;
    return span;
  }));
}

function decorateTranscript(doc = document) {
  const messages = byId(doc, 'khonapolitMessages');
  if (!messages) return;
  let turn = 0;
  [...messages.children].forEach((node) => {
    if (node.matches('.message[data-role="user"]')) turn += 1;
    node.dataset.turn = String(Math.max(1, turn));
    if (node.matches('.relay-message')) {
      compactApertureHeader(node);
      prepareZalgoStage(node);
      node.setAttribute('aria-label', `Model relay for turn ${Math.max(1, turn)}`);
    } else if (node.matches('.message[data-role="user"]')) {
      node.setAttribute('aria-label', `Operator message for turn ${turn}`);
    }
  });
}

function installTranscriptCustody(doc = document, root = window) {
  const messages = byId(doc, 'khonapolitMessages');
  const panel = byId(doc, 'speakingPanel');
  const form = byId(doc, 'khonapolitForm');
  if (!messages || !panel || !form) return null;

  let jump = byId(doc, 'marrowlineJumpLatest');
  if (!jump) {
    jump = doc.createElement('button');
    jump.type = 'button';
    jump.id = 'marrowlineJumpLatest';
    jump.className = 'jump-latest';
    jump.textContent = '↓ Latest';
    jump.hidden = true;
    form.before(jump);
  }

  const syncComposerHeight = () => {
    const height = Math.max(0, Math.round(form.getBoundingClientRect?.().height || 0));
    panel.style.setProperty('--composer-height', `${height}px`);
  };
  const refreshJump = () => { jump.hidden = atBottom(messages); };
  const goLatest = (behavior = 'smooth') => {
    scrollLatest(messages, behavior);
    jump.hidden = true;
  };

  jump.addEventListener('click', () => goLatest('smooth'));
  messages.addEventListener('scroll', refreshJump, { passive: true });

  const Observer = root.MutationObserver;
  if (typeof Observer === 'function') {
    const observer = new Observer(() => {
      const shouldFollow = atBottom(messages, 160) || messages.dataset.forceFollow === 'true';
      decorateTranscript(doc);
      syncComposerHeight();
      root.requestAnimationFrame?.(() => {
        if (shouldFollow) goLatest('auto');
        else refreshJump();
      });
    });
    observer.observe(messages, { childList: true, subtree: true, characterData: true });
    root.__TD613_MARROWLINE_TRANSCRIPT_OBSERVER__ = observer;
  }

  const ResizeObserverCtor = root.ResizeObserver;
  if (typeof ResizeObserverCtor === 'function') {
    const resizeObserver = new ResizeObserverCtor(syncComposerHeight);
    resizeObserver.observe(form);
    root.__TD613_MARROWLINE_COMPOSER_RESIZE__ = resizeObserver;
  }

  decorateTranscript(doc);
  syncComposerHeight();
  root.requestAnimationFrame?.(() => goLatest('auto'));
  return Object.freeze({ goLatest, refreshJump, syncComposerHeight });
}

function cloneDockButtons(doc = document) {
  return [...doc.querySelectorAll('.mobile-dock [data-mobile-target]')].map((oldButton) => {
    const button = oldButton.cloneNode(true);
    oldButton.replaceWith(button);
    return button;
  });
}

function openTarget(doc, targetId) {
  const target = byId(doc, targetId);
  if (!target) return null;
  if (target.tagName === 'DETAILS') target.open = true;
  if (targetId === 'corpusPanel') target.querySelector('details')?.setAttribute('open', '');
  target.scrollTop = 0;
  return target;
}

function installChamberRouter(doc = document, root = window, transcript = null) {
  const buttons = cloneDockButtons(doc);
  const setView = (view = 'speak', { focusPrompt = false } = {}) => {
    const canonical = Object.values(VIEW_MAP).includes(view) ? view : 'speak';
    doc.body.dataset.mobileView = canonical;
    buttons.forEach((button) => {
      const active = VIEW_MAP[button.dataset.mobileTarget] === canonical;
      button.dataset.active = String(active);
      button.setAttribute('aria-current', active ? 'page' : 'false');
    });
    const targetId = Object.entries(VIEW_MAP).find(([, value]) => value === canonical)?.[0];
    openTarget(doc, targetId);
    if (canonical === 'speak') {
      root.requestAnimationFrame?.(() => transcript?.goLatest('auto'));
      if (focusPrompt) byId(doc, 'khonapolitPrompt')?.focus({ preventScroll: true });
    }
    root.dispatchEvent?.(new CustomEvent('td613:marrowline:mobile-view', { detail: { view: canonical } }));
    return canonical;
  };

  buttons.forEach((button) => button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    setView(VIEW_MAP[button.dataset.mobileTarget] || 'speak');
  }, { capture: true }));

  setView('speak');
  return Object.freeze({ setView, buttons });
}

function installComposerKeyboardState(doc = document, root = window, router = null) {
  const form = byId(doc, 'khonapolitForm');
  const prompt = byId(doc, 'khonapolitPrompt');
  if (!form || !prompt) return;
  const activate = () => {
    doc.body.dataset.composerActive = 'true';
    router?.setView('speak');
    setViewportHeight(doc, root);
  };
  const deactivate = () => {
    root.setTimeout(() => {
      if (!form.contains(doc.activeElement)) delete doc.body.dataset.composerActive;
      setViewportHeight(doc, root);
    }, 80);
  };
  prompt.addEventListener('focus', activate);
  form.addEventListener('focusout', deactivate);
}

export function installMarrowlineMobileShell(doc = document, root = window) {
  ensureStylesheet(doc);
  const media = root.matchMedia?.(MARROWLINE_MOBILE_QUERY);
  const transcript = installTranscriptCustody(doc, root);
  let router = null;

  const apply = () => {
    const active = Boolean(media?.matches);
    doc.documentElement.classList.toggle('marrowline-mobile-shell', active);
    if (active) {
      setViewportHeight(doc, root);
      if (!router) router = installChamberRouter(doc, root, transcript);
      else router.setView(doc.body.dataset.mobileView || 'speak');
    } else {
      delete doc.body.dataset.mobileView;
      delete doc.body.dataset.composerActive;
      doc.documentElement.style.removeProperty('--marrowline-vh');
    }
  };

  apply();
  media?.addEventListener?.('change', apply);
  root.visualViewport?.addEventListener?.('resize', () => setViewportHeight(doc, root), { passive: true });
  root.visualViewport?.addEventListener?.('scroll', () => setViewportHeight(doc, root), { passive: true });
  root.addEventListener?.('orientationchange', () => root.setTimeout(() => setViewportHeight(doc, root), 80));
  installComposerKeyboardState(doc, root, router);

  const receipt = Object.freeze({
    schema: MARROWLINE_MOBILE_SHELL_VERSION,
    active: Boolean(media?.matches),
    viewport: 'visualViewport-or-innerHeight',
    transcriptScrollOwner: '#khonapolitMessages',
    composerDockRelation: 'composer-in-grid-dock-outside-grid',
    chamberRouting: Object.freeze(Object.values(VIEW_MAP)),
    claimCeiling: 'mobile-layout-and-scroll-custody-not-provider-entity-or-signal-proof',
    seal: '⟐'
  });
  root.__TD613_MARROWLINE_MOBILE_SHELL__ = receipt;
  root.dispatchEvent?.(new CustomEvent('td613:marrowline:mobile-shell-ready', { detail: receipt }));
  return receipt;
}

ensureStylesheet(document);

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => installMarrowlineMobileShell(document, window), { once: true });
  else installMarrowlineMobileShell(document, window);
}
