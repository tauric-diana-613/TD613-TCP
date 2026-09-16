export const MARROWLINE_PHYSICAL_DEVICE_REPAIR_VERSION = 'td613.dome-world.marrowline-physical-device-repair/v4-provider-provenance-only';

const MOBILE_QUERY = '(max-width: 860px)';
const byId = (doc, id) => doc.getElementById(id);
const safe = (value = '') => String(value ?? '').trim();

function syncViewport(doc = document, root = window) {
  const vv = root.visualViewport;
  const layoutWidth = Math.max(240, Math.round(root.innerWidth || vv?.width || 0));
  const layoutHeight = Math.max(320, Math.round(root.innerHeight || vv?.height || 0));
  const width = Math.max(240, Math.round(vv?.width || layoutWidth));
  const height = Math.max(240, Math.round(vv?.height || layoutHeight));
  const top = Math.max(0, Math.round(vv?.offsetTop || 0));
  const left = Math.max(0, Math.round(vv?.offsetLeft || 0));
  const prompt = byId(doc, 'khonapolitPrompt');
  const focused = Boolean(prompt && doc.activeElement === prompt);
  const keyboardVisible = Boolean(root.matchMedia?.(MOBILE_QUERY)?.matches && focused && vv && height < layoutHeight - 96);

  const style = doc.documentElement.style;
  style.setProperty('--marrowline-vv-width', `${width}px`);
  style.setProperty('--marrowline-vv-height', `${height}px`);
  style.setProperty('--marrowline-vv-top', `${top}px`);
  style.setProperty('--marrowline-vv-left', `${left}px`);
  style.setProperty('--marrowline-layout-height', `${layoutHeight}px`);
  doc.body.dataset.keyboardVisible = String(keyboardVisible);

  return Object.freeze({ width, height, top, left, layoutWidth, layoutHeight, keyboardVisible });
}

function createKinesis(doc) {
  const card = doc.createElement('section');
  card.id = 'marrowlineChatKinesis';
  card.className = 'marrowline-chat-kinesis';
  card.hidden = true;
  card.setAttribute('role', 'status');
  card.setAttribute('aria-live', 'polite');
  card.setAttribute('aria-label', 'Response in flight');
  card.innerHTML = '<span class="kinesis-orbit" aria-hidden="true"><i></i><i></i><i></i><b></b></span><span class="kinesis-copy">Listening at the shoreline…</span>';
  return card;
}

function installInChatKinesis(doc = document, root = window) {
  const messages = byId(doc, 'khonapolitMessages');
  const status = byId(doc, 'khonapolitTerminalStatus');
  const form = byId(doc, 'khonapolitForm');
  if (!messages || !status || !form) return () => {};

  root.__TD613_MARROWLINE_CHAT_KINESIS_OBSERVER__?.disconnect?.();
  byId(doc, 'marrowlineResponseKinesis')?.remove();
  let card = byId(doc, 'marrowlineChatKinesis');
  if (!card) card = createKinesis(doc);
  let raf = null;

  const sync = () => {
    const busy = /AI IN FLIGHT|CALLING .*AI|MODEL .*IN FLIGHT|ROUTING .*MODEL/i.test(safe(status.textContent));
    form.setAttribute('aria-busy', busy ? 'true' : 'false');
    if (busy) {
      if (!card.isConnected) messages.append(card);
      card.hidden = false;
      messages.dataset.forceFollow = 'true';
      if (raf !== null && typeof root.cancelAnimationFrame === 'function') root.cancelAnimationFrame(raf);
      raf = root.requestAnimationFrame?.(() => {
        raf = null;
        messages.scrollTop = Math.max(0, messages.scrollHeight - messages.clientHeight);
      }) ?? null;
    } else {
      card.hidden = true;
      delete messages.dataset.forceFollow;
    }
  };

  let observer = null;
  const Observer = root.MutationObserver;
  if (typeof Observer === 'function') {
    observer = new Observer(sync);
    observer.observe(status, { childList: true, characterData: true, subtree: true });
    root.__TD613_MARROWLINE_CHAT_KINESIS_OBSERVER__ = observer;
  }
  sync();

  return () => {
    observer?.disconnect?.();
    if (root.__TD613_MARROWLINE_CHAT_KINESIS_OBSERVER__ === observer) delete root.__TD613_MARROWLINE_CHAT_KINESIS_OBSERVER__;
    if (raf !== null && typeof root.cancelAnimationFrame === 'function') root.cancelAnimationFrame(raf);
    raf = null;
  };
}

function prepareProviderNativeLines(stage) {
  const text = stage?.querySelector('.relay-stage-text');
  if (!text || text.dataset.providerNativeLines === 'true') return false;
  const raw = String(text.textContent ?? '');
  text.dataset.providerNativeLines = 'true';
  const fragments = raw.split(/(\r\n|\r|\n)/);
  text.replaceChildren(...fragments.map((fragment, index) => {
    if (index % 2) return text.ownerDocument.createTextNode(fragment);
    const span = text.ownerDocument.createElement('span');
    span.className = 'zalgo-line provider-native-line';
    span.textContent = fragment;
    return span;
  }));
  return true;
}

function scrubProviderBrandFromHumanSurface(doc) {
  // Exact provider identity remains in the provenance receipt and provider-model
  // metric inside the receipt chamber. It is not a conversational stage, route,
  // key-state label, or ontology visible in the speaking surface.
  doc.querySelectorAll('.relay-gemini').forEach((node) => node.remove());
  doc.querySelectorAll('.relay-aperture-header').forEach((header) => {
    const spans = header.querySelectorAll(':scope > span');
    if (spans.length > 1 && /gemini|provider model|flash|pro\b/i.test(spans[1].textContent || '')) spans[1].remove();
  });
  const status = byId(doc, 'providerStatus');
  if (status && /gemini/i.test(status.textContent || '')) status.textContent = 'PROBING PROVIDER + APERTURE ROUTE';
  const lamp = byId(doc, 'providerLamp');
  if (lamp && /gemini/i.test(lamp.textContent || '')) lamp.textContent = 'provider checking';
  const mode = byId(doc, 'khonapolitMode');
  if (mode) {
    const labels = {
      'issued-conjunction': 'Issued covenant frame · Kʰonapolit → Tauric Diana bots',
      'full-invocation': 'Full invocation · direct Kʰonapolit address',
      'tauric-lineage-observation': 'Tauric Diana lineage emphasis'
    };
    [...mode.options].forEach((option) => { if (labels[option.value]) option.textContent = labels[option.value]; });
  }
}

function installIntegratedSurface(doc = document, root = window) {
  const messages = byId(doc, 'khonapolitMessages');
  if (!messages) return () => {};

  root.__TD613_MARROWLINE_INTEGRATED_SURFACE_OBSERVER__?.disconnect?.();
  const legendText = 'Kʰonapolit → Tauric Diana bots · integrated transmission';
  const routeText = '𝌋‌ → Aperture → Kʰonapolit → Tauric Diana bots → OPEN';

  const scrub = () => {
    scrubProviderBrandFromHumanSurface(doc);
    messages.querySelectorAll('.relay-khonapolit[data-present="true"]').forEach((stage) => {
      const head = stage.querySelector('.relay-stage-head > span:first-child');
      if (head && head.textContent !== 'Kʰonapolit ∴ Tauric Diana bots') head.textContent = 'Kʰonapolit ∴ Tauric Diana bots';
      const meta = stage.querySelector('.relay-stage-head small');
      if (meta && meta.textContent !== 'integrated transmission') meta.textContent = 'integrated transmission';
      stage.classList.add('relay-integrated-covenant');
      prepareProviderNativeLines(stage);
    });

    doc.querySelectorAll('.relay-legend').forEach((legend) => {
      const current = legend.children.length === 1 && legend.firstElementChild?.dataset?.stage === 'integrated'
        ? legend.firstElementChild.textContent
        : null;
      if (current === legendText) return;
      legend.replaceChildren();
      const span = doc.createElement('span');
      span.dataset.stage = 'integrated';
      span.textContent = legendText;
      legend.append(span);
    });
    doc.querySelectorAll('.route-card strong').forEach((node) => {
      if (node.textContent !== routeText) node.textContent = routeText;
    });
  };

  scrub();
  let observer = null;
  const Observer = root.MutationObserver;
  if (typeof Observer === 'function') {
    observer = new Observer(scrub);
    observer.observe(messages, { childList: true, subtree: true, characterData: false });
    root.__TD613_MARROWLINE_INTEGRATED_SURFACE_OBSERVER__ = observer;
  }

  return () => {
    observer?.disconnect?.();
    if (root.__TD613_MARROWLINE_INTEGRATED_SURFACE_OBSERVER__ === observer) delete root.__TD613_MARROWLINE_INTEGRATED_SURFACE_OBSERVER__;
  };
}

export function installMarrowlinePhysicalDeviceRepair(doc = document, root = window) {
  root.__TD613_MARROWLINE_PHYSICAL_DEVICE_REPAIR_DISPOSE__?.();

  const prompt = byId(doc, 'khonapolitPrompt');
  const scheduled = new Set();
  const sync = () => syncViewport(doc, root);
  const schedule = (delay) => {
    const timer = root.setTimeout(() => {
      scheduled.delete(timer);
      sync();
    }, delay);
    scheduled.add(timer);
  };
  const settle = () => {
    sync();
    for (const timer of scheduled) root.clearTimeout?.(timer);
    scheduled.clear();
    [40, 120, 260, 520].forEach(schedule);
  };

  prompt?.addEventListener('focus', settle);
  prompt?.addEventListener('blur', settle);
  root.visualViewport?.addEventListener?.('resize', settle, { passive: true });
  root.visualViewport?.addEventListener?.('scroll', sync, { passive: true });
  root.addEventListener?.('resize', settle, { passive: true });
  root.addEventListener?.('orientationchange', settle, { passive: true });

  const disposeKinesis = installInChatKinesis(doc, root);
  const disposeIntegrated = installIntegratedSurface(doc, root);
  const viewport = sync();
  const receipt = Object.freeze({
    schema: MARROWLINE_PHYSICAL_DEVICE_REPAIR_VERSION,
    viewport,
    keyboardContract: 'visualViewport-fixed-chamber-with-nonscrolling-composer-row',
    responseKinesis: 'in-chat-dome-art-orbital-microfield',
    relaySurface: 'single-integrated-khonapolit-tauric-diana-provider-generation',
    providerBrandSurface: 'provenance-receipt-only',
    providerNativeUnicode: 'preserve-exact-code-points-no-local-ornamentation',
    lifecycle: 'explicit-disposal-of-observers-listeners-raf-and-settle-timers',
    seal: '⟐'
  });

  const dispose = () => {
    for (const timer of scheduled) root.clearTimeout?.(timer);
    scheduled.clear();
    prompt?.removeEventListener('focus', settle);
    prompt?.removeEventListener('blur', settle);
    root.visualViewport?.removeEventListener?.('resize', settle);
    root.visualViewport?.removeEventListener?.('scroll', sync);
    root.removeEventListener?.('resize', settle);
    root.removeEventListener?.('orientationchange', settle);
    disposeKinesis();
    disposeIntegrated();
    if (root.__TD613_MARROWLINE_PHYSICAL_DEVICE_REPAIR_DISPOSE__ === dispose) delete root.__TD613_MARROWLINE_PHYSICAL_DEVICE_REPAIR_DISPOSE__;
  };

  root.__TD613_MARROWLINE_PHYSICAL_DEVICE_REPAIR__ = receipt;
  root.__TD613_MARROWLINE_PHYSICAL_DEVICE_REPAIR_DISPOSE__ = dispose;
  return receipt;
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => installMarrowlinePhysicalDeviceRepair(document, window), { once: true });
  else installMarrowlinePhysicalDeviceRepair(document, window);
}