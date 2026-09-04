export const MARROWLINE_LOOM_ADVISORY_VERSION = 'td613.dome-world.marrowline-loom-advisory/v0.1';
export const MARROWLINE_LOOM_ADVISORY_ENDPOINT = '/api/khonapolit?operation=loom-advisory';
export const MARROWLINE_LOOM_ADVISORY_REQUEST_SCHEMA = 'td613.holonomy-loom.khonapolit-advisory-request/v0.1';
export const MARROWLINE_LOOM_PROVIDER_SCHEMA = 'td613.holonomy-loom.provider-advisory-request/v0.1';

const ALLOWED_ACTIONS = Object.freeze(['KEEP', 'CHANGE', 'REMOVE']);
const ALLOWED_EVIDENCE = Object.freeze([
  'DETERMINISTIC_PATTERN_MATCH',
  'USER_DECLARED_EXACT_RULE',
  'USER_DECLARED_CUSTODY_CONTEXT'
]);
const ALLOWED_ROUTES = Object.freeze([
  'TD613_HOSTED',
  'CHATGPT_THREAD_COMPANION',
  'LOCAL_POCKET'
]);

const safe = (value = '') => String(value ?? '').trim();

function bounded(value, label, max = 240) {
  const text = safe(value);
  if (!text) throw new TypeError(`${label} is required`);
  if (text.length > max) throw new TypeError(`${label} exceeds ${max} characters`);
  return text;
}

export function buildMarrowlineLoomAdvisoryRequest({
  ruleId,
  evidenceClass,
  actionClass,
  findingCategory,
  whyClass,
  routeMode,
  shi = '',
  waiveIssuance = false
} = {}) {
  const action = bounded(actionClass, 'actionClass', 16).toUpperCase();
  const evidence = bounded(evidenceClass, 'evidenceClass', 80).toUpperCase();
  const route = bounded(routeMode, 'routeMode', 80).toUpperCase();
  if (!ALLOWED_ACTIONS.includes(action)) throw new TypeError('unsupported actionClass');
  if (!ALLOWED_EVIDENCE.includes(evidence)) throw new TypeError('unsupported evidenceClass');
  if (!ALLOWED_ROUTES.includes(route)) throw new TypeError('unsupported routeMode');

  return Object.freeze({
    schema: MARROWLINE_LOOM_ADVISORY_REQUEST_SCHEMA,
    advisory: Object.freeze({
      schema: MARROWLINE_LOOM_PROVIDER_SCHEMA,
      action: 'EXPLAIN_FINDING',
      rule_id: bounded(ruleId, 'ruleId', 160),
      evidence_class: evidence,
      action_class: action,
      minimized_context: Object.freeze({
        finding_category: bounded(findingCategory, 'findingCategory', 240),
        why_class: bounded(whyClass, 'whyClass', 240),
        route_mode: route
      }),
      claim_ceiling: 'Kʰonapolit may explain the finding class and suggest bounded mitigation. Deterministic Loom policy alone controls Loom release.'
    }),
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
    .loom-advisory-grid input,.loom-advisory-grid select{min-width:0;width:100%;box-sizing:border-box;border:1px solid #45534f;border-radius:10px;background:#08100f;color:inherit;padding:9px;font:inherit}
    .loom-provider-disclosure{border:1px solid #6d6a3e;border-radius:12px;padding:11px;background:#16150d;line-height:1.45}
    .loom-provider-disclosure strong{display:block;margin-bottom:5px}
    .loom-advisory-actions{display:flex;flex-wrap:wrap;gap:8px}
    .loom-advisory-actions button{margin:0}
    .loom-advisory-output{white-space:pre-wrap;border-radius:12px;padding:11px;background:#07100d;min-height:44px}
    .loom-advisory-output[data-state="error"]{border:1px solid #7d3030}
    .loom-advisory-output[data-state="ready"]{border:1px solid #305c49}
    @media(max-width:620px){.loom-advisory-grid{grid-template-columns:1fr}}
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

function input(doc, id, placeholder) {
  const node = doc.createElement('input');
  node.id = id;
  node.autocomplete = 'off';
  node.spellcheck = false;
  node.placeholder = placeholder;
  return node;
}

function select(doc, id, values) {
  const node = doc.createElement('select');
  node.id = id;
  values.forEach(([value, label]) => node.append(option(doc, value, label)));
  return node;
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
    'This will send: rule ID, evidence class, action class, finding category, why-class, and route mode.',
    'This will not send: your raw draft, matched text, selected text, source spans, or prior Marrowline/ChatGPT conversation history.',
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
  intro.textContent = 'Kʰonapolit can explain a warning from its finding classes without receiving the whole message.';

  const grid = doc.createElement('div');
  grid.className = 'loom-advisory-grid';
  const ruleId = input(doc, 'loomRuleId', 'COMMON_API_KEY_BLOCK');
  const category = input(doc, 'loomFindingCategory', 'credential-like token');
  const why = input(doc, 'loomWhyClass', 'credential_access_risk');
  const evidence = select(doc, 'loomEvidenceClass', [
    ['DETERMINISTIC_PATTERN_MATCH', 'deterministic pattern match'],
    ['USER_DECLARED_EXACT_RULE', 'user-declared exact rule'],
    ['USER_DECLARED_CUSTODY_CONTEXT', 'user-declared custody context']
  ]);
  const action = select(doc, 'loomActionClass', [['REMOVE', 'REMOVE'], ['CHANGE', 'CHANGE'], ['KEEP', 'KEEP']]);
  const route = select(doc, 'loomRouteMode', [
    ['TD613_HOSTED', 'TD613.com hosted'],
    ['CHATGPT_THREAD_COMPANION', 'private ChatGPT-thread companion'],
    ['LOCAL_POCKET', 'local pocket / preflight']
  ]);
  grid.append(
    field(doc, 'Rule ID', ruleId),
    field(doc, 'Finding category', category),
    field(doc, 'Why-class', why),
    field(doc, 'Evidence class', evidence),
    field(doc, 'Loom action', action),
    field(doc, 'Room / route', route)
  );

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
  body.append(intro, grid, disclosure, actions, output);
  panel.append(summary, body);
  form.before(panel);

  const state = {
    version: MARROWLINE_LOOM_ADVISORY_VERSION,
    endpoint: MARROWLINE_LOOM_ADVISORY_ENDPOINT,
    providerDisclosureRequired: true,
    rawDraftAccepted: false,
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
    output.textContent = 'Sending only the disclosed finding classes to Kʰonapolit…';
    try {
      const request = buildMarrowlineLoomAdvisoryRequest({
        ruleId: ruleId.value,
        evidenceClass: evidence.value,
        actionClass: action.value,
        findingCategory: category.value,
        whyClass: why.value,
        routeMode: route.value,
        shi,
        waiveIssuance
      });
      const serialized = JSON.stringify(request);
      const response = await root.fetch(MARROWLINE_LOOM_ADVISORY_ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json', Accept: 'application/json' },
        cache: 'no-store',
        body: serialized
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.ok) throw new Error(payload.detail || payload.error || `HTTP ${response.status}`);
      const observed = relayText(payload);
      state.lastReceipt = payload.receipt || null;
      state.lastSource = observed.source;
      output.dataset.state = 'ready';
      output.textContent = `${observed.source}\n\n${observed.text}\n\nAdvisory only · Loom release authority unchanged.`;
      root.dispatchEvent?.(new CustomEvent('td613:marrowline:loom-advisory-return', {
        detail: { source: observed.source, receipt: state.lastReceipt }
      }));
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
    acceptedInput: Object.freeze(['rule_id', 'evidence_class', 'action_class', 'finding_category', 'why_class', 'route_mode']),
    rawDraftAccepted: false,
    selectedTextAccepted: false,
    conversationHistoryAccepted: false,
    providerResultHasReleaseAuthority: false,
    seal: 'OPEN'
  });
  root.__TD613_MARROWLINE_LOOM_ADVISORY__ = Object.freeze({ ...state, receipt, buildRequest: buildMarrowlineLoomAdvisoryRequest });
  return root.__TD613_MARROWLINE_LOOM_ADVISORY__;
}
