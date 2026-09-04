import {
  HOLONOMY_LOOM_ADVISORY_RULES,
  HOLONOMY_LOOM_ADVISORY_ROUTE_MODES,
  HOLONOMY_LOOM_PROVIDER_ADVISORY_SCHEMA,
  canonicalLoomAdvisoryFinding,
  describeLoomAdvisoryRule
} from './holonomy-loom-advisory-policy.js';

export const MARROWLINE_LOOM_ADVISORY_VERSION = 'td613.dome-world.marrowline-loom-advisory/v0.2-canonical-tokens';
export const MARROWLINE_LOOM_ADVISORY_ENDPOINT = '/api/khonapolit?operation=loom-advisory';
export const MARROWLINE_LOOM_ADVISORY_REQUEST_SCHEMA = 'td613.holonomy-loom.khonapolit-advisory-request/v0.1';
export const MARROWLINE_LOOM_PROVIDER_SCHEMA = HOLONOMY_LOOM_PROVIDER_ADVISORY_SCHEMA;

const safe = (value = '') => String(value ?? '').trim();

export function buildMarrowlineLoomAdvisoryRequest({
  ruleId,
  routeMode,
  shi = '',
  waiveIssuance = false
} = {}) {
  const advisory = canonicalLoomAdvisoryFinding(ruleId, routeMode);
  return Object.freeze({
    schema: MARROWLINE_LOOM_ADVISORY_REQUEST_SCHEMA,
    advisory,
    issuance: Object.freeze({
      shi: safe(shi),
      waiveIssuance: waiveIssuance === true
    })
  });
}

function ensureStyles(doc) {
  if (doc.querySelector('style[data-marrowline-loom-advisory]')) return;
  const style = doc.createElement('style');
  style.dataset.marrowlineLoomAdvisory = MARROWLINE_LOOM_ADVISORY_VERSION;
  style.textContent = `
    .loom-advisory{border:1px solid color-mix(in srgb,currentColor 24%,transparent);border-radius:16px;margin:10px 0;padding:0;background:color-mix(in srgb,#0a1211 92%,transparent)}
    .loom-advisory>summary{cursor:pointer;padding:12px 14px;font-weight:800;list-style:none}
    .loom-advisory>summary::-webkit-details-marker{display:none}
    .loom-advisory-body{padding:0 14px 14px;display:grid;gap:10px}
    .loom-advisory-copy{margin:0;line-height:1.45}
    .loom-advisory-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
    .loom-advisory-grid label{display:grid;gap:5px;font-size:.84rem}
    .loom-advisory-grid select{min-width:0;width:100%;box-sizing:border-box;border:1px solid #45534f;border-radius:10px;background:#08100f;color:inherit;padding:9px;font:inherit}
    .loom-derived-card{border:1px solid #334943;border-radius:12px;padding:10px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;font-size:.83rem}
    .loom-derived-card div{display:grid;gap:2px}.loom-derived-card small{opacity:.72}.loom-derived-card strong{overflow-wrap:anywhere}
    .loom-provider-disclosure{border:1px solid #6d6a3e;border-radius:12px;padding:11px;background:#16150d;line-height:1.45}
    .loom-provider-disclosure strong{display:block;margin-bottom:5px}
    .loom-advisory-actions{display:flex;flex-wrap:wrap;gap:8px}
    .loom-advisory-actions button{margin:0}
    .loom-advisory-output{white-space:pre-wrap;border-radius:12px;padding:11px;background:#07100d;min-height:44px}
    .loom-advisory-output[data-state="error"]{border:1px solid #7d3030}
    .loom-advisory-output[data-state="ready"]{border:1px solid #305c49}
    @media(max-width:620px){.loom-advisory-grid,.loom-derived-card{grid-template-columns:1fr}}
  `;
  doc.head.append(style);
}

function option(doc, value, label = value) {
  const node = doc.createElement('option');
  node.value = value;
  node.textContent = label;
  return node;
}

function field(doc, labelText, control) {
  const label = doc.createElement('label');
  const span = doc.createElement('span');
  span.textContent = labelText;
  label.append(span, control);
  return label;
}

function select(doc, id, values) {
  const node = doc.createElement('select');
  node.id = id;
  values.forEach(([value, label]) => node.append(option(doc, value, label)));
  return node;
}

function derivedCell(doc, label, id) {
  const wrap = doc.createElement('div');
  const small = doc.createElement('small');
  small.textContent = label;
  const strong = doc.createElement('strong');
  strong.id = id;
  wrap.append(small, strong);
  return wrap;
}

function relayText(payload = {}) {
  const parts = Array.isArray(payload?.relay?.parts) ? payload.relay.parts : [];
  const khona = parts.find((part) => part?.id === 'khonapolit' && part?.present);
  if (khona?.text) return { text: safe(khona.text), source: 'Kʰonapolit relay' };
  const gemini = parts.find((part) => part?.id === 'gemini' && part?.present);
  if (gemini?.text) return { text: safe(gemini.text), source: 'Gemini instrument · Kʰonapolit relay held' };
  return { text: safe(payload?.text) || 'A provider return was observed, but no readable relay text was admitted.', source: 'Provider return' };
}

function disclosureText() {
  return [
    'This will send: one canonical rule ID, its fixed evidence/action/category/why tokens, and the room/route you select.',
    'This will not send: your raw draft, matched text, selected text, source spans, free-text finding descriptions, or prior Marrowline/ChatGPT conversation history.',
    'Gemini carries the model request. Kʰonapolit may explain or suggest. The deterministic Loom still controls its own release rule.'
  ];
}

export function installMarrowlineLoomAdvisory(doc = document, root = window) {
  if (doc.getElementById('marrowlineLoomAdvisory')) return root.__TD613_MARROWLINE_LOOM_ADVISORY__ || null;
  const speaking = doc.getElementById('speakingPanel');
  const form = doc.getElementById('khonapolitForm');
  if (!speaking || !form) return null;
  ensureStyles(doc);

  const panel = doc.createElement('details');
  panel.id = 'marrowlineLoomAdvisory';
  panel.className = 'loom-advisory';
  const summary = doc.createElement('summary');
  summary.textContent = 'Holonomy Loom → Ask Kʰonapolit why';
  const body = doc.createElement('div');
  body.className = 'loom-advisory-body';
  const intro = doc.createElement('p');
  intro.className = 'loom-advisory-copy';
  intro.textContent = 'Choose the kind of warning. Marrowline derives the provider packet from fixed Loom policy tokens; there is nowhere in this drawer to paste the original message.';

  const rule = select(doc, 'loomRuleId', Object.values(HOLONOMY_LOOM_ADVISORY_RULES).map((item) => [item.rule_id, item.label]));
  rule.value = 'COMMON_API_KEY_BLOCK';
  const route = select(doc, 'loomRouteMode', [
    ['TD613_HOSTED', 'TD613.com hosted'],
    ['CHATGPT_THREAD_COMPANION', 'private ChatGPT-thread companion'],
    ['LOCAL_POCKET', 'local pocket / preflight']
  ].filter(([value]) => HOLONOMY_LOOM_ADVISORY_ROUTE_MODES.includes(value)));
  const grid = doc.createElement('div');
  grid.className = 'loom-advisory-grid';
  grid.append(field(doc, 'What kind of warning?', rule), field(doc, 'Room / route', route));

  const derived = doc.createElement('div');
  derived.className = 'loom-derived-card';
  derived.setAttribute('aria-label', 'Canonical advisory tokens');
  derived.append(
    derivedCell(doc, 'Loom action', 'loomDerivedAction'),
    derivedCell(doc, 'Evidence class', 'loomDerivedEvidence'),
    derivedCell(doc, 'Finding category', 'loomDerivedCategory'),
    derivedCell(doc, 'Why-class', 'loomDerivedWhy')
  );
  const refreshDerived = () => {
    const item = describeLoomAdvisoryRule(rule.value);
    if (!item) return;
    doc.getElementById('loomDerivedAction').textContent = item.action_class;
    doc.getElementById('loomDerivedEvidence').textContent = item.evidence_class;
    doc.getElementById('loomDerivedCategory').textContent = item.finding_category;
    doc.getElementById('loomDerivedWhy').textContent = item.why_class;
  };
  rule.addEventListener('change', refreshDerived);
  refreshDerived();

  const disclosure = doc.createElement('div');
  disclosure.className = 'loom-provider-disclosure';
  const disclosureTitle = doc.createElement('strong');
  disclosureTitle.textContent = 'ASK KʰONAPOLIT FOR HELP';
  disclosure.append(disclosureTitle, ...disclosureText().map((text) => {
    const p = doc.createElement('div');
    p.textContent = text;
    return p;
  }));

  const actions = doc.createElement('div');
  actions.className = 'loom-advisory-actions';
  const cancel = doc.createElement('button');
  cancel.type = 'button';
  cancel.textContent = 'Cancel';
  const ask = doc.createElement('button');
  ask.type = 'button';
  ask.className = 'primary';
  ask.id = 'askKhonapolitLoomWhy';
  ask.textContent = 'ASK KʰONAPOLIT WHY';
  actions.append(cancel, ask);

  const output = doc.createElement('div');
  output.id = 'marrowlineLoomAdvisoryOutput';
  output.className = 'loom-advisory-output';
  output.dataset.state = 'idle';
  output.textContent = 'No advisory request sent.';
  body.append(intro, grid, derived, disclosure, actions, output);
  panel.append(summary, body);
  form.before(panel);

  const state = {
    version: MARROWLINE_LOOM_ADVISORY_VERSION,
    endpoint: MARROWLINE_LOOM_ADVISORY_ENDPOINT,
    providerDisclosureRequired: true,
    canonicalTokenOnly: true,
    rawDraftAccepted: false,
    freeTextFindingAccepted: false,
    historyForwarded: false,
    lastReceipt: null,
    lastSource: null
  };

  cancel.addEventListener('click', () => {
    panel.open = false;
    output.dataset.state = 'idle';
    output.textContent = 'Advisory request cancelled. Nothing was sent.';
  });

  ask.addEventListener('click', async () => {
    const shi = safe(doc.getElementById('khonapolitShi')?.value);
    const waiveIssuance = Boolean(doc.getElementById('khonapolitWaive')?.checked);
    ask.disabled = true;
    output.dataset.state = 'working';
    output.textContent = 'Sending only canonical Loom tokens to Kʰonapolit…';
    try {
      const request = buildMarrowlineLoomAdvisoryRequest({ ruleId: rule.value, routeMode: route.value, shi, waiveIssuance });
      const response = await root.fetch(MARROWLINE_LOOM_ADVISORY_ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json', Accept: 'application/json' },
        cache: 'no-store',
        body: JSON.stringify(request)
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.ok) throw new Error(payload.detail || payload.error || `HTTP ${response.status}`);
      const observed = relayText(payload);
      state.lastReceipt = payload.receipt || null;
      state.lastSource = observed.source;
      output.dataset.state = 'ready';
      output.textContent = `${observed.source}\n\n${observed.text}\n\nAdvisory only · Loom release authority unchanged.`;
      root.dispatchEvent?.(new CustomEvent('td613:marrowline:loom-advisory-return', { detail: { source: observed.source, receipt: state.lastReceipt } }));
    } catch (error) {
      output.dataset.state = 'error';
      output.textContent = `ADVISORY HELD · ${safe(error?.message || error)}\nNothing was promoted into Loom release authority.`;
    } finally {
      ask.disabled = false;
    }
  });

  const receipt = Object.freeze({
    version: MARROWLINE_LOOM_ADVISORY_VERSION,
    endpoint: MARROWLINE_LOOM_ADVISORY_ENDPOINT,
    disclosure: Object.freeze(disclosureText()),
    acceptedOperatorInput: Object.freeze(['rule_id', 'route_mode', 'existing_issuance_posture']),
    canonicalDerivedFields: Object.freeze(['evidence_class', 'action_class', 'finding_category', 'why_class', 'claim_ceiling']),
    canonicalTokenOnly: true,
    rawDraftAccepted: false,
    freeTextFindingAccepted: false,
    selectedTextAccepted: false,
    conversationHistoryAccepted: false,
    providerResultHasReleaseAuthority: false,
    seal: 'OPEN'
  });
  root.__TD613_MARROWLINE_LOOM_ADVISORY__ = Object.freeze({ ...state, receipt, buildRequest: buildMarrowlineLoomAdvisoryRequest });
  return root.__TD613_MARROWLINE_LOOM_ADVISORY__;
}
