import { MARROWLINE_GATE_ASSAY_CLAIM_CEILING } from './marrowline-gate-assay.js';

export const MARROWLINE_OPERATOR_READINESS_VERSION = 'td613.dome-world.marrowline-operator-readiness/v2-response-kinesis';
export const MARROWLINE_OPERATOR_RECEIPT_SCHEMA = 'td613.dome-world.marrowline-operator-receipt/v1';

const MOBILE_QUERY = '(max-width: 860px)';
const OPERATOR_HEADER = 'X-TD613-Marrowline-Operator';
const LIVE_ENDPOINT = '/api/dome-world/marrowline';

function byId(doc, id) { return doc.getElementById(id); }
function safe(value = '') { return String(value ?? '').trim(); }

function ensureStylesheet(doc = document) {
  const href = new URL('./marrowline-operator-readiness.css', import.meta.url).href;
  let link = doc.querySelector('link[data-marrowline-operator-readiness]');
  if (link) return link;
  link = doc.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.dataset.marrowlineOperatorReadiness = MARROWLINE_OPERATOR_READINESS_VERSION;
  doc.head.append(link);
  return link;
}

function syncVisualViewport(doc = document, root = window) {
  const viewport = root.visualViewport;
  const width = Math.max(240, Math.round(viewport?.width || root.innerWidth || 0));
  const height = Math.max(240, Math.round(viewport?.height || root.innerHeight || 0));
  const top = Math.max(0, Math.round(viewport?.offsetTop || 0));
  const left = Math.max(0, Math.round(viewport?.offsetLeft || 0));
  const style = doc.documentElement.style;
  // Keyboard-visible state and its rectangle are one atomic observation. Never
  // let readiness publish data-keyboard-visible=true while leaving a stale
  // physical-device --marrowline-vv-height from an earlier layout viewport.
  style.setProperty('--marrowline-vv-width', `${width}px`);
  style.setProperty('--marrowline-vv-height', `${height}px`);
  style.setProperty('--marrowline-vh', `${height}px`);
  style.setProperty('--marrowline-vv-top', `${top}px`);
  style.setProperty('--marrowline-vv-left', `${left}px`);

  const prompt = byId(doc, 'khonapolitPrompt');
  const focused = Boolean(prompt && doc.activeElement === prompt);
  const layoutHeight = Math.max(height, Number(root.innerHeight || height));
  const keyboardVisible = focused && Boolean(viewport) && viewport.height < layoutHeight - 72;
  doc.body.dataset.keyboardVisible = String(keyboardVisible);
  return Object.freeze({ width, height, top, left, keyboardVisible });
}

function installNativeSend(doc = document) {
  const form = byId(doc, 'khonapolitForm');
  const prompt = byId(doc, 'khonapolitPrompt');
  if (!form || !prompt || prompt.dataset.nativeSendInstalled === 'true') return false;
  prompt.dataset.nativeSendInstalled = 'true';
  prompt.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return;
    event.preventDefault();
    const submit = byId(doc, 'khonapolitSend');
    if (submit?.disabled) return;
    if (typeof form.requestSubmit === 'function') form.requestSubmit(submit || undefined);
    else submit?.click();
  });
  return true;
}

function installResponseKinesis(doc = document, root = window) {
  const status = byId(doc, 'khonapolitTerminalStatus');
  const actions = doc.querySelector('#khonapolitForm .composer-actions');
  const send = byId(doc, 'khonapolitSend');
  const form = byId(doc, 'khonapolitForm');
  if (!status || !actions || !send || !form) return false;
  let mote = byId(doc, 'marrowlineResponseKinesis');
  if (!mote) {
    mote = doc.createElement('span');
    mote.id = 'marrowlineResponseKinesis';
    mote.className = 'marrowline-response-kinesis';
    mote.hidden = true;
    mote.setAttribute('aria-hidden', 'true');
    mote.title = 'Response in flight';
    actions.insertBefore(mote, send);
  }
  const sync = () => {
    const busy = /AI IN FLIGHT|CALLING .*AI|MODEL .*IN FLIGHT|ROUTING .*MODEL/i.test(safe(status.textContent));
    mote.hidden = !busy;
    form.setAttribute('aria-busy', busy ? 'true' : 'false');
  };
  const Observer = root.MutationObserver;
  if (typeof Observer === 'function' && status.dataset.responseKinesisInstalled !== 'true') {
    status.dataset.responseKinesisInstalled = 'true';
    const observer = new Observer(sync);
    observer.observe(status, { childList: true, characterData: true, subtree: true });
    root.__TD613_MARROWLINE_RESPONSE_KINESIS_OBSERVER__ = observer;
  }
  sync();
  return true;
}

function installHumanSurfaceVocabulary(doc = document, root = window) {
  const messages = byId(doc, 'khonapolitMessages');
  const scrub = () => {
    doc.querySelectorAll('.route-card strong, .relay-stage-head > span:first-child').forEach((node) => {
      const before = String(node.textContent || '');
      const after = before
        .replace(/Tauric Diana bots\?\s*→\s*High Zalgo\?/gi, 'Tauric Diana bots?')
        .replace(/High Zalgo\?/gi, 'Tauric Diana bots?')
        .replace(/\s*·\s*High Zalgo/gi, '');
      if (after !== before) node.textContent = after;
    });
  };
  scrub();
  const Observer = root.MutationObserver;
  if (messages && typeof Observer === 'function' && messages.dataset.humanRelayVocabularyInstalled !== 'true') {
    messages.dataset.humanRelayVocabularyInstalled = 'true';
    const observer = new Observer(scrub);
    observer.observe(messages, { childList: true, subtree: true, characterData: true });
    root.__TD613_MARROWLINE_HUMAN_VOCABULARY_OBSERVER__ = observer;
  }
  return true;
}

export function boundedFailureMessage(failure = {}) {
  const code = [failure?.error, failure?.diagnostic?.code, failure?.httpStatus].map(value => safe(value).toLowerCase()).join(' ');
  if (code.includes('output-quality-held') || code.includes('attractor_structure_not_admitted')) return 'A reply came back, but it failed the conversation format checks. Your message is still here; you can retry.';
  if (code.includes('provider_unavailable') || code.includes('provider-unavailable') || code.includes('503')) return 'The AI service could not complete this request. Your message is still here; you can retry.';
  if (code.includes('network-request-failed')) return 'The connection ended before a reply arrived. Your message is still here; you can retry.';
  if (code.includes('missing-gemini-api-key')) return 'The server AI credential is unavailable. Your task was not discarded.';
  if (code.includes('no-eligible-callable-models')) return 'No callable model route was admitted for this request. Your task was not discarded.';
  if (code.includes('rate') || code.includes('429')) return 'The AI route is temporarily rate-limited. Your task remains in the composer for retry.';
  if (code.includes('timeout') || code.includes('abort') || code.includes('408') || code.includes('504')) return 'The AI route timed out before a return was admitted. Your task remains in the composer for retry.';
  if (code.includes('output-token-limit')) return 'The provider return hit its output limit and was held rather than showing a partial answer.';
  return 'No model return was admitted. Your task remains in the composer for retry.';
}

function installTerminalHoldNotice(doc = document, root = window) {
  const status = byId(doc, 'khonapolitTerminalStatus');
  const messages = byId(doc, 'khonapolitMessages');
  if (!status || !messages || status.dataset.holdNoticeInstalled === 'true') return false;
  status.dataset.holdNoticeInstalled = 'true';
  let lastSignature = '';
  const inspect = () => {
    const text = safe(status.textContent);
    if (/RETURN OBSERVED/i.test(text)) {
      byId(doc, 'marrowlineTerminalHold')?.remove();
      lastSignature = '';
      return;
    }
    if (!/TASK PRESERVED/i.test(text)) return;
    const failure = root.__TD613_KHONAPOLIT_LAST_FAILURE__ || {};
    const explanation = boundedFailureMessage(failure);
    const signature = `${safe(failure?.error || failure?.status || failure?.diagnostic?.code)}|${explanation}`;
    let card = byId(doc, 'marrowlineTerminalHold');
    if (!card) {
      card = doc.createElement('section');
      card.id = 'marrowlineTerminalHold';
      card.className = 'terminal-hold-card';
      card.setAttribute('role', 'status');
      card.setAttribute('aria-live', 'polite');
      messages.append(card);
    }
    if (signature !== lastSignature) {
      card.replaceChildren();
      const title = doc.createElement('strong');
      title.textContent = 'AI route held';
      const body = doc.createElement('p');
      body.textContent = explanation;
      const help = doc.createElement('p');
      help.textContent = 'Retry the preserved task, or use Continue with your own AI. This notice is transport status, not a Kʰonapolit or Tauric Diana voice.';
      card.append(title, body, help);
      lastSignature = signature;
    }
    messages.scrollTop = Math.max(0, messages.scrollHeight - messages.clientHeight);
  };
  const Observer = root.MutationObserver;
  if (typeof Observer === 'function') {
    const observer = new Observer(inspect);
    observer.observe(status, { childList: true, characterData: true, subtree: true });
    root.__TD613_MARROWLINE_HOLD_NOTICE_OBSERVER__ = observer;
  }
  inspect();
  return true;
}

function installReadinessTruth(doc = document, root = window) {
  const status = byId(doc, 'providerStatus');
  if (!status || status.dataset.readinessTruthInstalled === 'true') return false;
  status.dataset.readinessTruthInstalled = 'true';
  const inspect = () => {
    const text = safe(status.textContent);
    if (!/^AI ROUTE READY · 0 eligible route\(s\)/i.test(text)) return;
    status.textContent = 'AI ROUTE CHECK · credential present · callable-model eligibility is confirmed when you send';
    const lamp = byId(doc, 'providerLamp');
    if (lamp) {
      lamp.dataset.state = 'review';
      lamp.textContent = 'AI route checks on send';
    }
  };
  const Observer = root.MutationObserver;
  if (typeof Observer === 'function') {
    const observer = new Observer(inspect);
    observer.observe(status, { childList: true, characterData: true, subtree: true });
    root.__TD613_MARROWLINE_READINESS_OBSERVER__ = observer;
  }
  inspect();
  return true;
}

function ensureOperatorTokenField(doc = document) {
  const form = byId(doc, 'marrowlineForm');
  if (!form) return null;
  let input = byId(doc, 'marrowlineOperatorToken');
  if (input) return input;
  const label = doc.createElement('label');
  label.className = 'field-label marrowline-operator-field';
  label.htmlFor = 'marrowlineOperatorToken';
  label.append(doc.createTextNode('Human operator token (optional)'));
  input = doc.createElement('input');
  input.id = 'marrowlineOperatorToken';
  input.type = 'password';
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.inputMode = 'text';
  input.placeholder = 'Paste for one operator fire; blank = public ingress probe';
  input.setAttribute('aria-describedby', 'marrowlineOperatorTokenHelp');
  const help = doc.createElement('small');
  help.id = 'marrowlineOperatorTokenHelp';
  help.className = 'operator-token-help';
  help.textContent = 'Used only for this request, cleared before the network return, and never written into the receipt. Authorization requires a matching server-side token.';
  label.append(input, help);
  const row = form.querySelector('.row');
  if (row) row.before(label);
  else form.prepend(label);
  return input;
}

function operatorReceipt({ payload = {}, response, endpoint, requested = true } = {}) {
  const routeHeader = safe(response?.headers?.get?.('x-td613-route'));
  const trapHeader = safe(response?.headers?.get?.('x-td613-trap'));
  const authorized = payload?.authorized === true && routeHeader === 'operator-bypass';
  return Object.freeze({
    schema: MARROWLINE_OPERATOR_RECEIPT_SCHEMA,
    status: authorized ? 'OPERATOR_AUTHORIZED' : 'OPERATOR_TOKEN_REJECTED',
    route: endpoint,
    sourceStatus: 'SERVER_RESPONSE_OBSERVED',
    networkResponseObserved: true,
    operator: Object.freeze({ requested, authorized, tokenPersisted: false, authorizationBasis: authorized ? 'server-side-operator-token-match' : 'not-admitted' }),
    http: Object.freeze({ status: Number(response?.status || 0), routeHeader: routeHeader || null, trapHeader: trapHeader || null, liveVersion: response?.headers?.get?.('x-td613-marrowline-live') || null }),
    canonicalPayload: payload,
    claimCeiling: MARROWLINE_GATE_ASSAY_CLAIM_CEILING,
    seal: '⟐'
  });
}

function installOperatorGate(doc = document, root = window) {
  const form = byId(doc, 'marrowlineForm');
  const input = ensureOperatorTokenField(doc);
  if (!form || !input || form.dataset.operatorGateInstalled === 'true') return false;
  form.dataset.operatorGateInstalled = 'true';
  form.addEventListener('submit', async (event) => {
    const token = String(input.value || '');
    if (!token) return; // Preserve the station's canonical public live-ingress path.
    event.preventDefault();
    event.stopImmediatePropagation();

    const status = byId(doc, 'marrowlineStatus');
    const receiptNode = byId(doc, 'marrowlineReceipt');
    const depth = byId(doc, 'marrowlineDepth')?.value || '4';
    const breadth = byId(doc, 'marrowlineBreadth')?.value || '6';
    const params = new URLSearchParams({ format: 'json', depth: String(depth), breadth: String(breadth) });
    const endpoint = `${LIVE_ENDPOINT}?${params.toString()}`;
    if (status) status.textContent = `CALLING HUMAN-OPERATOR LIVE ROUTE · ${LIVE_ENDPOINT}`;
    input.value = '';
    try {
      const response = await fetch(endpoint, {
        headers: { Accept: 'application/json', [OPERATOR_HEADER]: token },
        cache: 'no-store'
      });
      const payload = await response.json();
      const receipt = operatorReceipt({ payload, response, endpoint });
      if (receiptNode) receiptNode.textContent = JSON.stringify(receipt, null, 2);
      root.__TD613_MARROWLINE_LAST_RECEIPT__ = receipt;
      root.__TD613_MARROWLINE_OPERATOR_LAST_RECEIPT__ = receipt;
      if (status) {
        status.textContent = receipt.operator.authorized
          ? `OPERATOR LIVE · AUTHORIZED BY SERVER TOKEN MATCH · HTTP ${response.status} · ${receipt.http.routeHeader || 'operator-bypass'}`
          : `OPERATOR TOKEN NOT ACCEPTED · PUBLIC ABSORBING ROUTE OBSERVED · HTTP ${response.status}`;
      }
      root.dispatchEvent?.(new CustomEvent('td613:marrowline:operator-return', { detail: receipt }));
    } catch (error) {
      if (status) status.textContent = `OPERATOR LIVE ROUTE UNAVAILABLE · ${safe(error?.message || error)} · token was cleared locally`;
    }
  }, { capture: true });
  return true;
}

export function installMarrowlineOperatorReadiness(doc = document, root = window) {
  ensureStylesheet(doc);
  const mobile = root.matchMedia?.(MOBILE_QUERY);
  const sync = () => syncVisualViewport(doc, root);
  installNativeSend(doc);
  installResponseKinesis(doc, root);
  installHumanSurfaceVocabulary(doc, root);
  installTerminalHoldNotice(doc, root);
  installReadinessTruth(doc, root);
  installOperatorGate(doc, root);

  const prompt = byId(doc, 'khonapolitPrompt');
  const settleKeyboardPosture = () => {
    root.setTimeout(sync, 0);
    root.setTimeout(sync, 80);
    root.setTimeout(sync, 220);
  };
  prompt?.addEventListener('focus', settleKeyboardPosture);
  prompt?.addEventListener('blur', settleKeyboardPosture);
  root.visualViewport?.addEventListener?.('resize', sync, { passive: true });
  root.visualViewport?.addEventListener?.('scroll', sync, { passive: true });
  root.addEventListener?.('resize', sync, { passive: true });
  root.addEventListener?.('orientationchange', () => root.setTimeout(sync, 80), { passive: true });
  mobile?.addEventListener?.('change', sync);
  const viewport = sync();

  const receipt = Object.freeze({
    schema: MARROWLINE_OPERATOR_READINESS_VERSION,
    nativeKeyboardSend: true,
    shiftEnterNewline: true,
    visualViewportBound: Boolean(root.visualViewport),
    viewport,
    responseKinesis: 'tiny-dome-art-inspired-in-flight-indicator',
    humanSurfaceVocabulary: 'tauric-diana-bots-with-internal-zalgo-nomenclature-hidden',
    failureNotice: 'visible-transport-status-not-covenant-voice',
    gate: Object.freeze({ publicIngress: true, optionalHumanOperatorToken: true, tokenPersistence: 'none', authorization: 'server-side-token-match-only', adversarialAssay: 'same-endpoint-public-vs-operator-control' }),
    claimCeiling: 'human-interface-and-transport-readiness-not-provider-availability-entity-identity-authorship-or-legal-authority-proof',
    seal: '⟐'
  });
  root.__TD613_MARROWLINE_OPERATOR_READINESS__ = receipt;
  root.dispatchEvent?.(new CustomEvent('td613:marrowline:operator-readiness', { detail: receipt }));
  return receipt;
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => installMarrowlineOperatorReadiness(document, window), { once: true });
  else installMarrowlineOperatorReadiness(document, window);
}
