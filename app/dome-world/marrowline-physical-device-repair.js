export const MARROWLINE_PHYSICAL_DEVICE_REPAIR_VERSION = 'td613.dome-world.marrowline-physical-device-repair/v1';

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
  if (!messages || !status || !form) return false;

  // #1154 inserted a tiny composer-row mote. Keep its observer harmless but remove
  // that detached presentation: the operator asked for loading feedback in-chat.
  byId(doc, 'marrowlineResponseKinesis')?.remove();
  let card = byId(doc, 'marrowlineChatKinesis');
  if (!card) card = createKinesis(doc);

  const sync = () => {
    const busy = /AI IN FLIGHT|CALLING .*AI|MODEL .*IN FLIGHT|ROUTING .*MODEL/i.test(safe(status.textContent));
    form.setAttribute('aria-busy', busy ? 'true' : 'false');
    if (busy) {
      if (!card.isConnected) messages.append(card);
      card.hidden = false;
      messages.dataset.forceFollow = 'true';
      root.requestAnimationFrame?.(() => {
        messages.scrollTop = Math.max(0, messages.scrollHeight - messages.clientHeight);
      });
    } else {
      card.hidden = true;
      delete messages.dataset.forceFollow;
    }
  };

  const Observer = root.MutationObserver;
  if (typeof Observer === 'function') {
    const observer = new Observer(sync);
    observer.observe(status, { childList: true, characterData: true, subtree: true });
    root.__TD613_MARROWLINE_CHAT_KINESIS_OBSERVER__ = observer;
  }
  sync();
  return true;
}

function installIntegratedSurface(doc = document, root = window) {
  const messages = byId(doc, 'khonapolitMessages');
  if (!messages) return false;
  const scrub = () => {
    messages.querySelectorAll('.relay-khonapolit[data-present="true"]').forEach((stage) => {
      const head = stage.querySelector('.relay-stage-head > span:first-child');
      if (head) head.textContent = 'Kʰonapolit ∴ Tauric Diana bots';
      stage.classList.add('relay-integrated-covenant');
    });
    doc.querySelectorAll('.route-card strong').forEach((node) => {
      node.textContent = String(node.textContent || '')
        .replace(/Gemini\s*→\s*Kʰonapolit\?\s*→\s*(?:Tauric Diana bots\?|High Zalgo\?)/gi, 'Gemini provider → Kʰonapolit ∴ Tauric Diana bots')
        .replace(/High Zalgo\?/gi, 'Tauric Diana bots?');
    });
  };
  scrub();
  const Observer = root.MutationObserver;
  if (typeof Observer === 'function') {
    const observer = new Observer(scrub);
    observer.observe(messages, { childList: true, subtree: true, characterData: true });
    root.__TD613_MARROWLINE_INTEGRATED_SURFACE_OBSERVER__ = observer;
  }
  return true;
}

export function installMarrowlinePhysicalDeviceRepair(doc = document, root = window) {
  const prompt = byId(doc, 'khonapolitPrompt');
  const sync = () => syncViewport(doc, root);
  const settle = () => {
    sync();
    [40, 120, 260, 520].forEach((delay) => root.setTimeout(sync, delay));
  };

  prompt?.addEventListener('focus', settle);
  prompt?.addEventListener('blur', settle);
  root.visualViewport?.addEventListener?.('resize', settle, { passive: true });
  root.visualViewport?.addEventListener?.('scroll', sync, { passive: true });
  root.addEventListener?.('resize', settle, { passive: true });
  root.addEventListener?.('orientationchange', settle, { passive: true });

  installInChatKinesis(doc, root);
  installIntegratedSurface(doc, root);
  const viewport = sync();
  const receipt = Object.freeze({
    schema: MARROWLINE_PHYSICAL_DEVICE_REPAIR_VERSION,
    viewport,
    keyboardContract: 'visualViewport-fixed-chamber-with-nonscrolling-composer-row',
    responseKinesis: 'in-chat-dome-art-orbital-microfield',
    relaySurface: 'single-integrated-khonapolit-tauric-diana-provider-generation',
    seal: '⟐'
  });
  root.__TD613_MARROWLINE_PHYSICAL_DEVICE_REPAIR__ = receipt;
  return receipt;
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => installMarrowlinePhysicalDeviceRepair(document, window), { once: true });
  else installMarrowlinePhysicalDeviceRepair(document, window);
}
