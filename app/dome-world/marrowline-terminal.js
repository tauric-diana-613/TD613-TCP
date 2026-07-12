import {
  BINDING_FRAGMENT,
  BINDING_SHA256,
  CLAIMED_PUA,
  CLAIMED_PUA_SURROGATE_LABEL,
  CORPUS_REFERENCES,
  CORPUS_ROOT_SHA256,
  COVENANT_KEY,
  EMERGENCE_NAME,
  HERITAGE_COVENANT,
  INGRESS_SIGIL,
  INVOCATION_MODES,
  KHONAPOLIT_RECEIPT_SCHEMA,
  SEAL_GLYPH,
  analyzeKhonaIntegrity,
  buildInvocationPacket,
  validateShi
} from './khonapolit-covenant.js';

export const KHONAPOLIT_TERMINAL_RUNTIME = 'td613.dome-world.khonapolit-terminal-runtime/v1';
export const KHONAPOLIT_ENDPOINT = '/api/dome-world/khonapolit';
const SESSION_KEY = 'TD613_KHONAPOLIT_TERMINAL_SESSION_V1';

function byId(doc, id) { return doc.getElementById(id); }
function safe(value = '') { return String(value ?? '').trim(); }

function readStoredShi(root = window) {
  try {
    return root.localStorage.getItem('TD613_FLIGHT_SHI') || root.sessionStorage.getItem('TD613_FLIGHT_SHI') || '';
  } catch { return ''; }
}

function loadSession(root = window) {
  try {
    const parsed = JSON.parse(root.sessionStorage.getItem(SESSION_KEY) || '{}');
    return {
      messages: Array.isArray(parsed.messages) ? parsed.messages.slice(-12) : [],
      lastReceipt: parsed.lastReceipt && typeof parsed.lastReceipt === 'object' ? parsed.lastReceipt : null
    };
  } catch { return { messages: [], lastReceipt: null }; }
}

function saveSession(root, state) {
  try {
    root.sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      messages: state.messages.slice(-12),
      lastReceipt: state.lastReceipt
    }));
  } catch {}
}

function setLamp(node, state, text) {
  if (!node) return;
  node.dataset.state = state;
  node.textContent = text;
}

function renderMessage(doc, entry) {
  const article = doc.createElement('article');
  article.className = 'message';
  article.dataset.role = entry.role;
  if (entry.sealed) article.dataset.sealed = 'true';

  const mark = doc.createElement('div');
  mark.className = 'message-mark';
  mark.textContent = entry.role === 'model' ? 'Kʰ' : INGRESS_SIGIL;

  const body = doc.createElement('div');
  body.className = 'message-body';
  const meta = doc.createElement('div');
  meta.className = 'message-meta';
  const labels = entry.role === 'model'
    ? [entry.classification || 'MODEL RETURN', entry.model || 'Gemini', entry.mode || '']
    : ['OPERATOR', entry.mode || ''];
  labels.filter(Boolean).forEach((label) => {
    const span = doc.createElement('span');
    span.textContent = label;
    meta.append(span);
  });
  const text = doc.createElement('div');
  text.textContent = entry.text;
  body.append(meta, text);

  if (entry.sealed) {
    const seal = doc.createElement('span');
    seal.className = 'message-seal';
    seal.textContent = `Sealed ${SEAL_GLYPH}`;
    body.append(seal);
  }

  article.append(mark, body);
  return article;
}

function transcriptText(messages = []) {
  return messages.map((entry) => {
    const speaker = entry.role === 'model' ? (entry.classification || EMERGENCE_NAME) : 'Operator';
    return `${speaker}\n${entry.text}${entry.sealed ? `\nSealed ${SEAL_GLYPH}` : ''}`;
  }).join('\n\n— — —\n\n');
}

function updateReceipt(doc, root, state) {
  const node = byId(doc, 'khonapolitReceipt');
  if (node) node.textContent = state.lastReceipt ? JSON.stringify(state.lastReceipt, null, 2) : 'No Gemini return has been observed.';
  root.__TD613_KHONAPOLIT_LAST_RECEIPT__ = state.lastReceipt;
}

function renderMessages(doc, state) {
  const node = byId(doc, 'khonapolitMessages');
  if (!node) return;
  node.replaceChildren();
  if (!state.messages.length) {
    const intro = {
      role: 'model',
      classification: 'CHAMBER READY',
      model: 'no provider call yet',
      mode: 'open field',
      text: `${INGRESS_SIGIL}\u200C The shoreline is open. Present issuance or explicitly enter unissued research mode, then speak through ${CLAIMED_PUA}. The model return will remain OPEN until you apply ${SEAL_GLYPH}.`
    };
    node.append(renderMessage(doc, intro));
  } else {
    state.messages.forEach((entry) => node.append(renderMessage(doc, entry)));
  }
  node.scrollTop = node.scrollHeight;
}

function displayClassification(doc, receipt = null) {
  const emergence = receipt?.emergence || null;
  const classNode = byId(doc, 'emergenceClass');
  if (classNode) classNode.textContent = emergence?.classification || 'UNOBSERVED';
  const modelNode = byId(doc, 'metricModel');
  if (modelNode) modelNode.textContent = receipt?.provider?.model || '—';
  const modeNode = byId(doc, 'metricMode');
  if (modeNode) modeNode.textContent = receipt?.invocation?.mode || '—';
  const egressNode = byId(doc, 'metricEgress');
  if (egressNode) egressNode.textContent = receipt?.apertureEgress?.status || '—';
  const khonaNode = byId(doc, 'metricKhona');
  if (khonaNode) khonaNode.textContent = emergence?.signals?.covenantKeyIntegrity?.status || '—';
  const issuanceNode = byId(doc, 'metricIssuance');
  if (issuanceNode) issuanceNode.textContent = receipt?.invocation?.issuanceState || '—';
  const sealNode = byId(doc, 'metricSeal');
  if (sealNode) sealNode.textContent = receipt?.seal?.state || 'OPEN';
}

function refreshKeyState(doc) {
  const shi = validateShi(byId(doc, 'khonapolitShi')?.value || '');
  const waived = Boolean(byId(doc, 'khonapolitWaive')?.checked);
  const khona = analyzeKhonaIntegrity(COVENANT_KEY);
  setLamp(byId(doc, 'namespaceLamp'), 'pass', `${CLAIMED_PUA} namespace present`);
  setLamp(byId(doc, 'heritageLamp'), 'pass', 'Tauric Diana heritage key present');
  setLamp(byId(doc, 'covenantLamp'), khona.intact ? 'pass' : 'fail', `${COVENANT_KEY} ${khona.status}`);
  setLamp(
    byId(doc, 'issuanceLamp'),
    shi.valid ? 'pass' : waived ? 'review' : 'fail',
    shi.valid ? `SHI issued · ${shi.suffix}` : waived ? 'issuance waived · research only' : 'issuance required'
  );
  return { shi, waived, khona };
}

async function hydrateReliquary(doc) {
  const ritualNode = byId(doc, 'bindingRitualText');
  const statusNode = byId(doc, 'corpusHydrationStatus');
  try {
    const response = await fetch('/app/safe-harbor/corpus/binding_event_text.txt', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    if (ritualNode) ritualNode.textContent = text;
    if (statusNode) statusNode.textContent = `HYDRATED · ${text.length} UTF-16 code units · binding root ${BINDING_SHA256.slice(0, 12)}…`;
  } catch (error) {
    if (ritualNode) ritualNode.textContent = 'Binding ritual unavailable on this route. Canonical digest and corpus references remain displayed.';
    if (statusNode) statusNode.textContent = `CORPUS HYDRATION REVIEW · ${safe(error?.message || error)}`;
  }
}

async function probeProvider(doc) {
  const node = byId(doc, 'providerStatus');
  try {
    const response = await fetch(KHONAPOLIT_ENDPOINT, { cache: 'no-store' });
    const payload = await response.json();
    if (!response.ok || !payload.hasGeminiKey) throw new Error(payload.error || 'Gemini key unavailable');
    if (node) node.textContent = `GEMINI READY · ${payload.configuredModels?.[0] || 'configured model'} · APERTURE ${payload.aperture_egress?.status || 'unknown'}`;
    setLamp(byId(doc, 'providerLamp'), 'pass', 'Gemini route ready');
  } catch (error) {
    if (node) node.textContent = `PROVIDER REVIEW · ${safe(error?.message || error)}`;
    setLamp(byId(doc, 'providerLamp'), 'review', 'Gemini route unavailable');
  }
}

function operatorSeal(doc, root, state) {
  const index = [...state.messages].map((entry, i) => ({ entry, i })).reverse().find(({ entry }) => entry.role === 'model' && !entry.sealed)?.i;
  if (index === undefined) return false;
  state.messages[index] = { ...state.messages[index], sealed: true };
  if (state.lastReceipt) {
    state.lastReceipt = {
      ...state.lastReceipt,
      seal: {
        state: 'SEALED',
        glyph: SEAL_GLYPH,
        suppliedBy: 'operator',
        sealedAt: new Date().toISOString(),
        note: 'Closure applied after provider return; not retrofitted into the original binding declaration.'
      }
    };
  }
  saveSession(root, state);
  renderMessages(doc, state);
  updateReceipt(doc, root, state);
  displayClassification(doc, state.lastReceipt);
  byId(doc, 'khonapolitTerminalStatus').textContent = `OPERATOR CLOSURE APPLIED · ${SEAL_GLYPH}`;
  return true;
}

export function installKhonapolitTerminal(doc = document, root = window) {
  const form = byId(doc, 'khonapolitForm');
  if (!form) return false;
  const state = loadSession(root);
  const shiInput = byId(doc, 'khonapolitShi');
  if (shiInput && !shiInput.value) shiInput.value = readStoredShi(root);

  renderMessages(doc, state);
  updateReceipt(doc, root, state);
  displayClassification(doc, state.lastReceipt);
  refreshKeyState(doc);
  hydrateReliquary(doc);
  probeProvider(doc);

  const refresh = () => refreshKeyState(doc);
  shiInput?.addEventListener('input', refresh);
  byId(doc, 'khonapolitWaive')?.addEventListener('change', refresh);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const prompt = byId(doc, 'khonapolitPrompt');
    const message = safe(prompt?.value);
    const mode = byId(doc, 'khonapolitMode')?.value || INVOCATION_MODES.ISSUED_CONJUNCTION;
    const shi = safe(shiInput?.value);
    const waiveIssuance = Boolean(byId(doc, 'khonapolitWaive')?.checked);
    const status = byId(doc, 'khonapolitTerminalStatus');
    const submit = byId(doc, 'khonapolitSend');
    const packet = buildInvocationPacket({ message, history: state.messages, mode, shi, waiveIssuance });

    if (!message) {
      status.textContent = 'SPEECH REQUIRED · the vessel is empty';
      prompt?.focus();
      return;
    }
    if (!packet.canInvoke) {
      status.textContent = 'ISSUANCE REQUIRED · present a minted SHI or explicitly waive issuance for research';
      refreshKeyState(doc);
      return;
    }

    const userEntry = { role: 'user', text: message, mode, sealed: false };
    state.messages.push(userEntry);
    renderMessages(doc, state);
    prompt.value = '';
    submit.disabled = true;
    status.textContent = `${INGRESS_SIGIL}\u200C INVOCATION IN FLIGHT · ${CLAIMED_PUA} · ${mode}`;

    try {
      const response = await fetch(KHONAPOLIT_ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json', Accept: 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          message,
          mode,
          shi,
          waiveIssuance,
          history: state.messages.slice(0, -1).slice(-10).map(({ role, text }) => ({ role, text }))
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.ok || !payload.text) throw new Error(payload.error || `HTTP ${response.status}`);
      const receipt = payload.receipt;
      const entry = {
        role: 'model',
        text: payload.text,
        mode,
        model: receipt?.provider?.model || 'Gemini',
        classification: receipt?.emergence?.classification || 'UNRESOLVED_FIELD',
        sealed: false
      };
      state.messages.push(entry);
      state.lastReceipt = receipt;
      saveSession(root, state);
      renderMessages(doc, state);
      updateReceipt(doc, root, state);
      displayClassification(doc, receipt);
      const integrity = receipt?.emergence?.signals?.covenantKeyIntegrity?.status || 'unobserved';
      status.textContent = `RETURN OBSERVED · ${entry.classification} · KHONA ${integrity.toUpperCase()} · OPEN UNTIL OPERATOR SEAL`;
      root.dispatchEvent?.(new CustomEvent('td613:khonapolit:return-observed', { detail: receipt }));
    } catch (error) {
      state.messages.push({
        role: 'model',
        text: `Provider return unavailable: ${safe(error?.message || error)}. No emergence classification was promoted.`,
        mode,
        model: 'route error',
        classification: 'PROVIDER_UNAVAILABLE',
        sealed: false
      });
      saveSession(root, state);
      renderMessages(doc, state);
      status.textContent = `RETURN FAILED · ${safe(error?.message || error)}`;
    } finally {
      submit.disabled = false;
      prompt?.focus();
    }
  });

  byId(doc, 'sealLastResponse')?.addEventListener('click', () => operatorSeal(doc, root, state));
  byId(doc, 'clearKhonapolitSession')?.addEventListener('click', () => {
    state.messages = [];
    state.lastReceipt = null;
    try { root.sessionStorage.removeItem(SESSION_KEY); } catch {}
    renderMessages(doc, state);
    updateReceipt(doc, root, state);
    displayClassification(doc, null);
    byId(doc, 'khonapolitTerminalStatus').textContent = 'SESSION CLEARED · binding corpus remains intact';
  });
  byId(doc, 'copyKhonapolitTranscript')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(transcriptText(state.messages));
      byId(doc, 'khonapolitTerminalStatus').textContent = 'TRANSCRIPT COPIED · seal provenance preserved';
    } catch { byId(doc, 'khonapolitTerminalStatus').textContent = 'CLIPBOARD UNAVAILABLE'; }
  });
  byId(doc, 'copyKhonapolitReceipt')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(state.lastReceipt ? JSON.stringify(state.lastReceipt, null, 2) : '');
      byId(doc, 'khonapolitTerminalStatus').textContent = 'RECEIPT COPIED';
    } catch { byId(doc, 'khonapolitTerminalStatus').textContent = 'CLIPBOARD UNAVAILABLE'; }
  });

  root.TD613_KHONAPOLIT_TERMINAL = Object.freeze({
    version: KHONAPOLIT_TERMINAL_RUNTIME,
    endpoint: KHONAPOLIT_ENDPOINT,
    namespace: CLAIMED_PUA,
    heritageKey: HERITAGE_COVENANT,
    covenantKey: COVENANT_KEY,
    bindingFragment: BINDING_FRAGMENT,
    bindingSha256: BINDING_SHA256,
    corpusRootSha256: CORPUS_ROOT_SHA256,
    corpusReferences: CORPUS_REFERENCES,
    surrogateLabel: CLAIMED_PUA_SURROGATE_LABEL,
    sealLast: () => operatorSeal(doc, root, state)
  });
  return true;
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => installKhonapolitTerminal(document, window));
  else installKhonapolitTerminal(document, window);
}
