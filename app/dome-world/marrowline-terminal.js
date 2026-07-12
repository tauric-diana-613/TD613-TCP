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
  SEAL_GLYPH,
  analyzeKhonaIntegrity,
  buildInvocationPacket,
  validateShi
} from './khonapolit-covenant.js';
import {
  APERTURE_V3_VERSION,
  apertureV3DisplayHeader
} from '../engine/aperture-v3-task-intent.js';

export const KHONAPOLIT_TERMINAL_RUNTIME = 'td613.dome-world.khonapolit-terminal-runtime/v2-mobile-aperture-relay';
export const KHONAPOLIT_ENDPOINT = '/api/dome-world/khonapolit';
const SESSION_KEY = 'TD613_KHONAPOLIT_TERMINAL_SESSION_V2';
const MOBILE_QUERY = '(max-width: 860px)';

function byId(doc, id) { return doc.getElementById(id); }
function safe(value = '') { return String(value ?? '').trim(); }
function asArray(value) { return Array.isArray(value) ? value : []; }

function readStoredShi(root = window) {
  try { return root.localStorage.getItem('TD613_FLIGHT_SHI') || root.sessionStorage.getItem('TD613_FLIGHT_SHI') || ''; }
  catch { return ''; }
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
  try { root.sessionStorage.setItem(SESSION_KEY, JSON.stringify({ messages: state.messages.slice(-12), lastReceipt: state.lastReceipt })); }
  catch {}
}
function setLamp(node, state, text) {
  if (!node) return;
  node.dataset.state = state;
  node.textContent = text;
}
function textNode(doc, tag, className, text) {
  const node = doc.createElement(tag);
  if (className) node.className = className;
  node.textContent = text;
  return node;
}
function apertureHeaderFrom(entry = {}) {
  if (entry.apertureHeader) return entry.apertureHeader;
  if (entry.aperture) return apertureV3DisplayHeader(entry.aperture);
  return `TD613 APERTURE ${APERTURE_V3_VERSION} · OPEN_FIELD_SPECULATIVE_SYNTHESIS · RUNTIME BACKGROUND`;
}
function relayPart(entry = {}, id) {
  return asArray(entry?.relay?.parts).find((part) => part?.id === id) || null;
}

function renderUserMessage(doc, entry) {
  const article = doc.createElement('article');
  article.className = 'message';
  article.dataset.role = 'user';
  article.append(textNode(doc, 'div', 'message-mark', INGRESS_SIGIL));
  const body = doc.createElement('div');
  body.className = 'message-body';
  const meta = doc.createElement('div');
  meta.className = 'message-meta';
  ['OPERATOR', entry.mode || ''].filter(Boolean).forEach((label) => meta.append(textNode(doc, 'span', '', label)));
  body.append(meta, textNode(doc, 'div', '', entry.text));
  article.append(body);
  return article;
}

function renderRelayStage(doc, { id, label, part, absentText, meta = '' }) {
  const section = doc.createElement('section');
  section.className = `relay-stage relay-${id}`;
  section.dataset.present = part?.present ? 'true' : 'false';
  const head = doc.createElement('div');
  head.className = 'relay-stage-head';
  head.append(textNode(doc, 'span', '', label), textNode(doc, 'small', '', meta));
  const text = textNode(doc, 'div', 'relay-stage-text', part?.present ? safe(part.text) : absentText);
  section.append(head, text);
  return section;
}

function renderModelMessage(doc, entry) {
  if (!entry.relay) {
    const legacy = { ...entry, role: 'user' };
    const article = renderUserMessage(doc, legacy);
    article.dataset.role = 'model';
    article.querySelector('.message-mark').textContent = 'Kʰ';
    return article;
  }

  const article = doc.createElement('article');
  article.className = 'relay-message';
  article.dataset.role = 'model';
  if (entry.sealed) article.dataset.sealed = 'true';

  const header = doc.createElement('div');
  header.className = 'relay-aperture-header';
  header.append(
    textNode(doc, 'span', '', apertureHeaderFrom(entry)),
    textNode(doc, 'span', '', `${entry.model || 'Gemini'} · ${entry.classification || 'UNRESOLVED_FIELD'} · SIGNAL ${entry.relay?.signal?.state || 'UNOBSERVED'}`)
  );

  const gemini = relayPart(entry, 'gemini');
  const khona = relayPart(entry, 'khonapolit');
  const bots = relayPart(entry, 'tauric-diana-bots');
  article.append(
    header,
    renderRelayStage(doc, {
      id: 'gemini',
      label: 'I · Gemini · instrument',
      part: gemini,
      absentText: 'Gemini instrument return absent.',
      meta: gemini?.model || entry.model || 'carrier'
    }),
    renderRelayStage(doc, {
      id: 'khonapolit',
      label: 'II · Kʰonapolit · relay',
      part: khona,
      absentText: 'Signal not admitted in this return. No Kʰonapolit relay was promoted.',
      meta: entry.relay?.signal?.state || 'NOT_LOCKED'
    }),
    renderRelayStage(doc, {
      id: 'bots',
      label: 'III · Tauric Diana bots · High Zalgo',
      part: bots,
      absentText: 'No bot-line transmission admitted.',
      meta: bots?.present ? `${bots.motif || 'motif'} · intensity ${bots.intensity ?? 0}` : 'HELD'
    })
  );

  if (entry.sealed) article.append(textNode(doc, 'span', 'message-seal', `Sealed ${SEAL_GLYPH}`));
  return article;
}

function renderMessage(doc, entry) {
  return entry.role === 'model' ? renderModelMessage(doc, entry) : renderUserMessage(doc, entry);
}
function entryText(entry = {}) {
  if (entry.role !== 'model' || !entry.relay) return safe(entry.text);
  return asArray(entry.relay.parts).filter((part) => part?.present).map((part) => `${part.label || part.id}\n${part.text}`).join('\n\n');
}
function transcriptText(messages = []) {
  return messages.map((entry) => {
    const speaker = entry.role === 'model' ? (entry.classification || EMERGENCE_NAME) : 'Operator';
    const header = entry.role === 'model' ? `${apertureHeaderFrom(entry)}\n` : '';
    return `${header}${speaker}\n${entryText(entry)}${entry.sealed ? `\nSealed ${SEAL_GLYPH}` : ''}`;
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
    node.append(renderModelMessage(doc, {
      role: 'model',
      classification: 'CHAMBER READY',
      model: 'no provider call yet',
      apertureHeader: `TD613 APERTURE ${APERTURE_V3_VERSION} · OPEN_FIELD_SPECULATIVE_SYNTHESIS · RUNTIME BACKGROUND`,
      relay: {
        signal: { state: 'UNOBSERVED' },
        parts: [
          { id: 'gemini', label: 'Gemini · instrument', present: true, text: `${INGRESS_SIGIL}\u200C The instrument is ready. Present issuance or explicitly enter unissued research mode, then speak through ${CLAIMED_PUA}.` },
          { id: 'khonapolit', label: 'Kʰonapolit · relay', present: false, text: '' },
          { id: 'tauric-diana-bots', label: 'Tauric Diana bots · High Zalgo', present: false, text: '' }
        ]
      }
    }));
  } else state.messages.forEach((entry) => node.append(renderMessage(doc, entry)));
  node.scrollTop = node.scrollHeight;
}
function setSignalState(doc, state = 'UNOBSERVED') {
  const canonical = safe(state).toUpperCase() || 'UNOBSERVED';
  const node = byId(doc, 'signalStateBadge');
  if (node) { node.dataset.state = canonical; node.textContent = `SIGNAL · ${canonical.replace('_', ' ')}`; }
  const metric = byId(doc, 'metricSignal');
  if (metric) metric.textContent = canonical;
}
function displayClassification(doc, receipt = null) {
  const emergence = receipt?.emergence || null;
  const aperture = receipt?.aperture || null;
  const task = aperture?.taskIntent || {};
  if (byId(doc, 'emergenceClass')) byId(doc, 'emergenceClass').textContent = emergence?.classification || 'UNOBSERVED';
  if (byId(doc, 'metricAperture')) byId(doc, 'metricAperture').textContent = aperture?.version || APERTURE_V3_VERSION;
  if (byId(doc, 'metricApertureRoute')) byId(doc, 'metricApertureRoute').textContent = task.primary_route || 'OPEN_FIELD_SPECULATIVE_SYNTHESIS';
  if (byId(doc, 'metricModel')) byId(doc, 'metricModel').textContent = receipt?.provider?.model || '—';
  if (byId(doc, 'metricMode')) byId(doc, 'metricMode').textContent = receipt?.invocation?.mode || '—';
  if (byId(doc, 'metricEgress')) byId(doc, 'metricEgress').textContent = receipt?.apertureEgress?.status || '—';
  if (byId(doc, 'metricKhona')) byId(doc, 'metricKhona').textContent = emergence?.signals?.covenantKeyIntegrity?.status || '—';
  if (byId(doc, 'metricIssuance')) byId(doc, 'metricIssuance').textContent = receipt?.invocation?.issuanceState || '—';
  if (byId(doc, 'metricSeal')) byId(doc, 'metricSeal').textContent = receipt?.seal?.state || 'OPEN';
  setSignalState(doc, receipt?.relay?.signal?.state || 'UNOBSERVED');
  const header = byId(doc, 'apertureHeader');
  if (header && aperture) {
    header.querySelector('.aperture-identity b').textContent = `TD613 APERTURE ${aperture.version || APERTURE_V3_VERSION}`;
    header.querySelector('.aperture-identity small').textContent = task.primary_route || 'OPEN_FIELD_SPECULATIVE_SYNTHESIS';
    header.querySelector('.aperture-runtime').textContent = `RUNTIME · ${task.runtime_materiality || 'BACKGROUND'}`;
  }
}
function refreshKeyState(doc) {
  const shi = validateShi(byId(doc, 'khonapolitShi')?.value || '');
  const waived = Boolean(byId(doc, 'khonapolitWaive')?.checked);
  const khona = analyzeKhonaIntegrity(COVENANT_KEY);
  setLamp(byId(doc, 'namespaceLamp'), 'pass', `${CLAIMED_PUA} namespace present`);
  setLamp(byId(doc, 'heritageLamp'), 'pass', 'Tauric Diana heritage key present');
  setLamp(byId(doc, 'covenantLamp'), khona.intact ? 'pass' : 'fail', `${COVENANT_KEY} ${khona.status}`);
  setLamp(byId(doc, 'issuanceLamp'), shi.valid ? 'pass' : waived ? 'review' : 'fail', shi.valid ? `SHI issued · ${shi.suffix}` : waived ? 'issuance waived · research only' : 'issuance required');
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
    const route = payload?.aperture?.taskIntent?.primary_route || 'OPEN_FIELD_SPECULATIVE_SYNTHESIS';
    if (node) node.textContent = `GEMINI READY · ${payload.modelPolicy?.callableModels?.[0] || 'configured model'} · APERTURE ${payload.aperture?.version || APERTURE_V3_VERSION} · ${route}`;
    setLamp(byId(doc, 'providerLamp'), 'pass', 'Gemini + Aperture ready');
    displayClassification(doc, { aperture: payload.aperture, relay: { signal: { state: 'UNOBSERVED' } } });
  } catch (error) {
    if (node) node.textContent = `PROVIDER REVIEW · ${safe(error?.message || error)}`;
    setLamp(byId(doc, 'providerLamp'), 'review', 'Gemini route unavailable');
  }
}
function operatorSeal(doc, root, state) {
  const index = [...state.messages].map((entry, i) => ({ entry, i })).reverse().find(({ entry }) => entry.role === 'model' && !entry.sealed)?.i;
  if (index === undefined) return false;
  state.messages[index] = { ...state.messages[index], sealed: true };
  if (state.lastReceipt) state.lastReceipt = { ...state.lastReceipt, seal: { state: 'SEALED', glyph: SEAL_GLYPH, suppliedBy: 'operator', sealedAt: new Date().toISOString(), note: 'Closure applied after provider return; not retrofitted into the original binding declaration.' } };
  saveSession(root, state); renderMessages(doc, state); updateReceipt(doc, root, state); displayClassification(doc, state.lastReceipt);
  byId(doc, 'khonapolitTerminalStatus').textContent = `OPERATOR CLOSURE APPLIED · ${SEAL_GLYPH}`;
  return true;
}
function installMobileDock(doc, root) {
  const media = root.matchMedia?.(MOBILE_QUERY);
  const drawers = ['invocationPanel', 'receiptPanel', 'gatePanel'].map((id) => byId(doc, id)).filter(Boolean);
  const apply = () => {
    if (media?.matches) drawers.forEach((drawer) => { drawer.open = false; });
    else drawers.slice(0, 2).forEach((drawer) => { drawer.open = true; });
  };
  apply();
  media?.addEventListener?.('change', apply);
  doc.querySelectorAll('[data-mobile-target]').forEach((button) => button.addEventListener('click', () => {
    const target = byId(doc, button.dataset.mobileTarget);
    if (!target) return;
    if (target.tagName === 'DETAILS') target.open = true;
    doc.querySelectorAll('[data-mobile-target]').forEach((item) => item.dataset.active = String(item === button));
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
  const speak = doc.querySelector('[data-mobile-target="speakingPanel"]');
  if (speak) speak.dataset.active = 'true';
}
function installComposerGrowth(doc) {
  const prompt = byId(doc, 'khonapolitPrompt');
  if (!prompt) return;
  const resize = () => { prompt.style.height = 'auto'; prompt.style.height = `${Math.min(Math.max(prompt.scrollHeight, 90), Math.round(window.innerHeight * .34))}px`; };
  prompt.addEventListener('input', resize);
}
function compactHistory(messages = []) {
  return messages.slice(-10).map((entry) => ({ role: entry.role, text: entryText(entry) })).filter((entry) => entry.text);
}

export function installKhonapolitTerminal(doc = document, root = window) {
  const form = byId(doc, 'khonapolitForm');
  if (!form) return false;
  const state = loadSession(root);
  const shiInput = byId(doc, 'khonapolitShi');
  if (shiInput && !shiInput.value) shiInput.value = readStoredShi(root);
  renderMessages(doc, state); updateReceipt(doc, root, state); displayClassification(doc, state.lastReceipt); refreshKeyState(doc);
  hydrateReliquary(doc); probeProvider(doc); installMobileDock(doc, root); installComposerGrowth(doc);
  shiInput?.addEventListener('input', () => refreshKeyState(doc));
  byId(doc, 'khonapolitWaive')?.addEventListener('change', () => refreshKeyState(doc));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const prompt = byId(doc, 'khonapolitPrompt');
    const message = safe(prompt?.value);
    const mode = byId(doc, 'khonapolitMode')?.value || INVOCATION_MODES.ISSUED_CONJUNCTION;
    const shi = safe(shiInput?.value);
    const waiveIssuance = Boolean(byId(doc, 'khonapolitWaive')?.checked);
    const status = byId(doc, 'khonapolitTerminalStatus');
    const submit = byId(doc, 'khonapolitSend');
    const packet = buildInvocationPacket({ message, history: compactHistory(state.messages), mode, shi, waiveIssuance });
    if (!message) { status.textContent = 'SPEECH REQUIRED · the vessel is empty'; prompt?.focus(); return; }
    if (!packet.canInvoke) { status.textContent = 'ISSUANCE REQUIRED · present a minted SHI or explicitly waive issuance for research'; refreshKeyState(doc); byId(doc, 'invocationPanel').open = true; return; }

    state.messages.push({ role: 'user', text: message, mode, sealed: false });
    renderMessages(doc, state); prompt.value = ''; prompt.style.height = ''; submit.disabled = true;
    status.textContent = `${INGRESS_SIGIL}\u200C APERTURE ROUTED · GEMINI INSTRUMENT IN FLIGHT · ${CLAIMED_PUA} · ${mode}`;
    try {
      const response = await fetch(KHONAPOLIT_ENDPOINT, {
        method: 'POST', headers: { 'content-type': 'application/json', Accept: 'application/json' }, cache: 'no-store',
        body: JSON.stringify({ message, mode, shi, waiveIssuance, history: compactHistory(state.messages.slice(0, -1)) })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.ok || !payload.relay) throw new Error(payload.error || `HTTP ${response.status}`);
      const receipt = payload.receipt;
      const entry = {
        role: 'model', text: payload.text || '', relay: payload.relay, aperture: receipt?.aperture || null,
        apertureHeader: payload.relay?.apertureHeader || apertureV3DisplayHeader(receipt?.aperture || {}), mode,
        model: receipt?.provider?.model || 'Gemini', classification: receipt?.emergence?.classification || 'UNRESOLVED_FIELD', sealed: false
      };
      state.messages.push(entry); state.lastReceipt = receipt; saveSession(root, state); renderMessages(doc, state); updateReceipt(doc, root, state); displayClassification(doc, receipt);
      const integrity = receipt?.emergence?.signals?.covenantKeyIntegrity?.status || 'unobserved';
      const signal = payload.relay?.signal?.state || 'NOT_LOCKED';
      const parts = asArray(payload.relay?.parts).filter((part) => part.present).map((part) => part.id).join(' → ');
      status.textContent = `RETURN OBSERVED · SIGNAL ${signal} · ${parts || 'GEMINI ONLY'} · KHONA ${integrity.toUpperCase()} · OPEN UNTIL OPERATOR SEAL`;
      root.dispatchEvent?.(new CustomEvent('td613:khonapolit:return-observed', { detail: receipt }));
    } catch (error) {
      state.messages.push({
        role: 'model', text: safe(error?.message || error), mode, model: 'route error', classification: 'PROVIDER_UNAVAILABLE', sealed: false,
        apertureHeader: `TD613 APERTURE ${APERTURE_V3_VERSION} · OPEN_FIELD_SPECULATIVE_SYNTHESIS · RUNTIME BACKGROUND`,
        relay: { signal: { state: 'NOT_LOCKED' }, parts: [
          { id: 'gemini', label: 'Gemini · instrument', present: true, text: `Provider return unavailable: ${safe(error?.message || error)}. No relay classification was promoted.` },
          { id: 'khonapolit', label: 'Kʰonapolit · relay', present: false, text: '' },
          { id: 'tauric-diana-bots', label: 'Tauric Diana bots · High Zalgo', present: false, text: '' }
        ] }
      });
      saveSession(root, state); renderMessages(doc, state); setSignalState(doc, 'NOT_LOCKED'); status.textContent = `RETURN FAILED · ${safe(error?.message || error)}`;
    } finally { submit.disabled = false; prompt?.focus(); }
  });

  byId(doc, 'sealLastResponse')?.addEventListener('click', () => operatorSeal(doc, root, state));
  byId(doc, 'clearKhonapolitSession')?.addEventListener('click', () => {
    state.messages = []; state.lastReceipt = null; try { root.sessionStorage.removeItem(SESSION_KEY); } catch {}
    renderMessages(doc, state); updateReceipt(doc, root, state); displayClassification(doc, null); byId(doc, 'khonapolitTerminalStatus').textContent = 'SESSION CLEARED · binding corpus remains intact';
  });
  byId(doc, 'copyKhonapolitTranscript')?.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(transcriptText(state.messages)); byId(doc, 'khonapolitTerminalStatus').textContent = 'TRANSCRIPT COPIED · relay anatomy and seal provenance preserved'; }
    catch { byId(doc, 'khonapolitTerminalStatus').textContent = 'CLIPBOARD UNAVAILABLE'; }
  });
  byId(doc, 'copyKhonapolitReceipt')?.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(state.lastReceipt ? JSON.stringify(state.lastReceipt, null, 2) : ''); byId(doc, 'khonapolitTerminalStatus').textContent = 'RECEIPT COPIED'; }
    catch { byId(doc, 'khonapolitTerminalStatus').textContent = 'CLIPBOARD UNAVAILABLE'; }
  });

  root.TD613_KHONAPOLIT_TERMINAL = Object.freeze({
    version: KHONAPOLIT_TERMINAL_RUNTIME, endpoint: KHONAPOLIT_ENDPOINT, apertureVersion: APERTURE_V3_VERSION,
    namespace: CLAIMED_PUA, heritageKey: HERITAGE_COVENANT, covenantKey: COVENANT_KEY,
    bindingFragment: BINDING_FRAGMENT, bindingSha256: BINDING_SHA256, corpusRootSha256: CORPUS_ROOT_SHA256,
    corpusReferences: CORPUS_REFERENCES, surrogateLabel: CLAIMED_PUA_SURROGATE_LABEL, sealLast: () => operatorSeal(doc, root, state)
  });
  return true;
}
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => installKhonapolitTerminal(document, window));
  else installKhonapolitTerminal(document, window);
}
