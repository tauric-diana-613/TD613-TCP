import {
  MARROWLINE_GATE_ASSAY_CLAIM_CEILING,
  MARROWLINE_GATE_MODES,
  buildMarrowlineGateAssayReceipt
} from './marrowline-gate-assay.js';

export const MARROWLINE_GATE_PEDAGOGUE_VERSION = 'td613.dome-world.marrowline-gate-pedagogue/v2-single-sequence';

function byId(doc, id) { return doc.getElementById(id); }
function text(doc, tag, value, className = '') {
  const node = doc.createElement(tag);
  if (className) node.className = className;
  node.textContent = value;
  return node;
}

function ensureStylesheet(doc = document) {
  const href = new URL('./marrowline-gate-pedagogue.css', import.meta.url).href;
  let link = doc.querySelector('link[data-marrowline-gate-pedagogue]');
  if (link) return link;
  link = doc.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.dataset.marrowlineGatePedagogue = MARROWLINE_GATE_PEDAGOGUE_VERSION;
  doc.head.append(link);
  return link;
}

function modeCard(doc, { mode, eyebrow, title, body }) {
  const card = doc.createElement('article');
  card.className = 'gate-assay-card';
  card.dataset.assayMode = mode;
  card.append(
    text(doc, 'small', eyebrow, 'gate-assay-card-kicker'),
    text(doc, 'strong', title),
    text(doc, 'p', body)
  );
  return card;
}

function modeChoice(doc, { mode, title, hint }) {
  const button = doc.createElement('button');
  button.type = 'button';
  button.className = 'gate-mode-choice';
  button.dataset.gateMode = mode;
  button.setAttribute('aria-pressed', 'false');
  button.append(
    text(doc, 'strong', title),
    text(doc, 'small', hint)
  );
  return button;
}

function buildGuide(doc) {
  const section = doc.createElement('section');
  section.id = 'marrowlineGatePedagogue';
  section.className = 'gate-pedagogue';
  section.setAttribute('aria-labelledby', 'marrowlineGatePedagogueTitle');

  const header = doc.createElement('header');
  header.className = 'gate-pedagogue-head';
  header.append(
    text(doc, 'small', 'Adversarial boundary assay'),
    text(doc, 'h3', 'Choose the Gate condition')
  );
  header.querySelector('h3').id = 'marrowlineGatePedagogueTitle';

  const consequence = text(
    doc,
    'p',
    'Local stays in this browser. Public crosses the absorbing boundary. Operator tests the separately authorized bypass.',
    'gate-pedagogue-lede'
  );

  const choices = doc.createElement('div');
  choices.className = 'gate-mode-choices';
  choices.setAttribute('role', 'group');
  choices.setAttribute('aria-label', 'Gate condition');
  choices.append(
    modeChoice(doc, {
      mode: MARROWLINE_GATE_MODES.LOCAL_CONTROL,
      title: 'Local control',
      hint: 'No network crossing'
    }),
    modeChoice(doc, {
      mode: MARROWLINE_GATE_MODES.PUBLIC_ABSORPTION,
      title: 'Public boundary',
      hint: 'Blank token · live endpoint'
    }),
    modeChoice(doc, {
      mode: MARROWLINE_GATE_MODES.OPERATOR_BYPASS_CONTROL,
      title: 'Operator control',
      hint: 'One-fire token · same endpoint'
    })
  );

  const result = doc.createElement('section');
  result.id = 'marrowlineGatePlainResult';
  result.className = 'gate-assay-result';
  result.setAttribute('role', 'status');
  result.setAttribute('aria-live', 'polite');
  result.dataset.mode = MARROWLINE_GATE_MODES.UNOBSERVED;
  result.append(
    text(doc, 'small', 'Observed outcome'),
    text(doc, 'strong', 'No Gate result observed yet', 'gate-assay-result-title'),
    text(doc, 'p', 'Choose a condition, use its nearby action, then read what actually answered.', 'gate-assay-result-copy'),
    text(doc, 'p', 'Nothing has been compared yet.', 'gate-assay-result-compare')
  );

  const details = doc.createElement('details');
  details.className = 'gate-assay-details';
  const summary = text(doc, 'summary', 'Compare the three conditions & limits');
  const cards = doc.createElement('div');
  cards.className = 'gate-assay-cards';
  cards.append(
    modeCard(doc, {
      mode: MARROWLINE_GATE_MODES.LOCAL_CONTROL,
      eyebrow: 'Control 0 · stays here',
      title: 'Build local fallback',
      body: 'Constructs the deterministic reference in this browser. It cannot establish that the live boundary answered.'
    }),
    modeCard(doc, {
      mode: MARROWLINE_GATE_MODES.PUBLIC_ABSORPTION,
      eyebrow: 'Treatment · crosses boundary',
      title: 'Fire with token blank',
      body: 'Sends one request to the declared endpoint and observes the canonical absorbing route, egress, digest and matrix.'
    }),
    modeCard(doc, {
      mode: MARROWLINE_GATE_MODES.OPERATOR_BYPASS_CONTROL,
      eyebrow: 'Control 1 · same endpoint',
      title: 'Fire with operator token',
      body: 'Sends one request to that endpoint with the one-fire credential. The server decides whether bypass is admitted.'
    })
  );
  const law = text(
    doc,
    'p',
    'Public absorption and authorized operator bypass share an endpoint but not necessarily a route. Local fallback remains a no-network control.',
    'gate-assay-law'
  );
  const capability = text(
    doc,
    'p',
    'This Gate can compare the declared endpoint’s local control, public absorption and authorized bypass while preserving observed route and Aperture-egress evidence. It does not measure hostile reconstruction across the full Loom → Marrowline → return journey.'
  );
  const falsifierTitle = text(doc, 'strong', 'Immediate falsifiers');
  const list = doc.createElement('ul');
  for (const item of [
    'A local fallback claims that a network response occurred.',
    'A blank-token public fire is labeled operator-authorized.',
    'The one-fire operator token appears in a persisted or copied receipt.',
    'Public absorption and an admitted operator bypass become indistinguishable in returned route evidence.',
    'An Aperture-egress status is shown when no egress observation exists.'
  ]) list.append(text(doc, 'li', item));
  const ceiling = text(doc, 'p', `Current boundary: ${MARROWLINE_GATE_ASSAY_CLAIM_CEILING}`, 'gate-assay-ceiling');
  details.append(summary, cards, law, capability, falsifierTitle, list, ceiling);

  section.append(header, consequence, choices, result, details);
  return section;
}

function applySelectedMode(doc, gate, mode, { focus = false } = {}) {
  const form = byId(doc, 'marrowlineForm');
  if (!gate || !form) return mode;
  const submit = form.querySelector('button[type="submit"]');
  const local = byId(doc, 'buildLocalMarrowline');
  const token = byId(doc, 'marrowlineOperatorToken');
  const tokenField = token?.closest?.('label') || null;
  const seedField = byId(doc, 'marrowlineSeed')?.closest?.('label') || null;
  if (submit && !submit.id) submit.id = 'marrowlineLiveGateFire';

  gate.dataset.selectedGateMode = mode;
  gate.querySelectorAll('.gate-mode-choice').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.gateMode === mode));
  });

  const localMode = mode === MARROWLINE_GATE_MODES.LOCAL_CONTROL;
  const operatorMode = mode === MARROWLINE_GATE_MODES.OPERATOR_BYPASS_CONTROL;
  if (submit) {
    submit.hidden = localMode;
    submit.textContent = operatorMode ? 'Fire operator control' : 'Fire public boundary';
  }
  if (local) {
    local.hidden = !localMode;
    local.classList.toggle('primary', localMode);
    local.textContent = 'Build local control';
  }
  if (seedField) seedField.hidden = !localMode;
  if (tokenField) tokenField.hidden = !operatorMode;
  if (token && !operatorMode) token.value = '';

  if (focus) {
    if (localMode) local?.focus?.();
    else if (operatorMode) token?.focus?.();
    else submit?.focus?.();
  }
  return mode;
}

function ensureTechnicalEvidenceDisclosure(doc, gate) {
  const output = gate?.querySelector('.gate-output');
  if (!gate || !output || output.closest('.gate-technical-evidence')) return null;
  const details = doc.createElement('details');
  details.className = 'gate-technical-evidence';
  const summary = doc.createElement('summary');
  summary.append(
    text(doc, 'span', 'Inspect matrix & technical receipt', 'gate-technical-evidence-label'),
    text(doc, 'span', '▽', 'gate-technical-evidence-glyph')
  );
  summary.querySelector('.gate-technical-evidence-glyph')?.setAttribute('aria-hidden', 'true');
  details.append(summary, output);
  gate.querySelector('.panel-body.gate-grid')?.append(details);
  return details;
}

function parseReceipt(node) {
  try { return JSON.parse(String(node?.textContent || '').trim()); }
  catch { return null; }
}

function renderResult(doc, receipt) {
  const node = byId(doc, 'marrowlineGatePlainResult');
  if (!node || !receipt) return null;
  const assay = buildMarrowlineGateAssayReceipt(receipt);
  const classification = assay.classification;
  node.dataset.mode = classification.mode;
  node.querySelector('.gate-assay-result-title').textContent = classification.headline;
  node.querySelector('.gate-assay-result-copy').textContent = classification.plainLanguage;
  node.querySelector('.gate-assay-result-compare').textContent = classification.comparisonUse;
  const gate = byId(doc, 'gatePanel');
  if (gate) gate.dataset.assayMode = classification.mode;
  return assay;
}

export function installMarrowlineGatePedagogue(doc = document, root = window) {
  const gate = byId(doc, 'gatePanel');
  const controls = gate?.querySelector('.gate-controls');
  const receiptNode = byId(doc, 'marrowlineReceipt');
  if (!gate || !controls || !receiptNode) return null;
  ensureStylesheet(doc);

  let guide = byId(doc, 'marrowlineGatePedagogue');
  if (!guide) {
    guide = buildGuide(doc);
    const form = byId(doc, 'marrowlineForm');
    if (form) controls.insertBefore(guide, form);
    else controls.prepend(guide);
  }

  const form = byId(doc, 'marrowlineForm');
  form?.setAttribute('aria-describedby', 'marrowlineGatePedagogueTitle marrowlineGatePlainResult');
  ensureTechnicalEvidenceDisclosure(doc, gate);

  const defaultMode = byId(doc, 'marrowlineOperatorToken')?.value
    ? MARROWLINE_GATE_MODES.OPERATOR_BYPASS_CONTROL
    : MARROWLINE_GATE_MODES.PUBLIC_ABSORPTION;
  applySelectedMode(doc, gate, defaultMode);
  guide.querySelectorAll('.gate-mode-choice').forEach((button) => {
    button.addEventListener('click', () => applySelectedMode(doc, gate, button.dataset.gateMode, { focus: true }));
  });
  form?.addEventListener('submit', (event) => {
    if (gate.dataset.selectedGateMode !== MARROWLINE_GATE_MODES.OPERATOR_BYPASS_CONTROL) return;
    const token = byId(doc, 'marrowlineOperatorToken');
    if (String(token?.value || '').trim()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const status = byId(doc, 'marrowlineStatus');
    if (status) status.textContent = 'OPERATOR CONTROL HELD · enter the one-fire token or choose Public boundary';
    token?.focus?.();
  }, { capture: true });

  let lastText = '';
  const inspect = () => {
    const raw = String(receiptNode.textContent || '').trim();
    if (!raw || raw === lastText) return null;
    lastText = raw;
    const receipt = parseReceipt(receiptNode);
    if (!receipt) return null;
    const assay = renderResult(doc, receipt);
    if (assay) {
      root.__TD613_MARROWLINE_GATE_ASSAY__ = assay;
      root.dispatchEvent?.(new CustomEvent('td613:marrowline:gate-assay', { detail: assay }));
    }
    return assay;
  };

  const Observer = root.MutationObserver;
  if (typeof Observer === 'function') {
    const observer = new Observer(inspect);
    observer.observe(receiptNode, { childList: true, characterData: true, subtree: true });
    root.__TD613_MARROWLINE_GATE_PEDAGOGUE_OBSERVER__ = observer;
  }
  inspect();

  const installation = Object.freeze({
    schema: MARROWLINE_GATE_PEDAGOGUE_VERSION,
    consequenceBeforeOntology: true,
    controls: Object.freeze([
      MARROWLINE_GATE_MODES.LOCAL_CONTROL,
      MARROWLINE_GATE_MODES.PUBLIC_ABSORPTION,
      MARROWLINE_GATE_MODES.OPERATOR_BYPASS_CONTROL
    ]),
    sameEndpointNotSameRoute: true,
    singleColumnSequence: true,
    technicalEvidenceCollapsedByDefault: true,
    localFallbackNotNetworkEvidence: true,
    operatorAuthorizationServerDecided: true,
    claimCeiling: MARROWLINE_GATE_ASSAY_CLAIM_CEILING,
    seal: '⟐'
  });
  root.__TD613_MARROWLINE_GATE_PEDAGOGUE__ = installation;
  root.dispatchEvent?.(new CustomEvent('td613:marrowline:gate-pedagogue-ready', { detail: installation }));
  return installation;
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => installMarrowlineGatePedagogue(document, window), { once: true });
  else installMarrowlineGatePedagogue(document, window);
}
