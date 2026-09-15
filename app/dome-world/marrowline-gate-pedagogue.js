import {
  MARROWLINE_GATE_ASSAY_CLAIM_CEILING,
  MARROWLINE_GATE_MODES,
  buildMarrowlineGateAssayReceipt
} from './marrowline-gate-assay.js';

export const MARROWLINE_GATE_PEDAGOGUE_VERSION = 'td613.dome-world.marrowline-gate-pedagogue/v1';

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

function buildGuide(doc) {
  const section = doc.createElement('section');
  section.id = 'marrowlineGatePedagogue';
  section.className = 'gate-pedagogue';
  section.setAttribute('aria-labelledby', 'marrowlineGatePedagogueTitle');

  const header = doc.createElement('header');
  header.className = 'gate-pedagogue-head';
  header.append(
    text(doc, 'small', 'Adversarial boundary assay'),
    text(doc, 'h3', 'Three ways to challenge one Gate')
  );
  header.querySelector('h3').id = 'marrowlineGatePedagogueTitle';

  const consequence = text(
    doc,
    'p',
    'Start with the consequence, not the jargon: choose whether you want no network crossing, the public absorbing route, or the human-operator control. Then read what actually answered.',
    'gate-pedagogue-lede'
  );

  const cards = doc.createElement('div');
  cards.className = 'gate-assay-cards';
  cards.append(
    modeCard(doc, {
      mode: MARROWLINE_GATE_MODES.LOCAL_CONTROL,
      eyebrow: 'Control 0 · stays here',
      title: 'Build local fallback',
      body: 'Construct the deterministic reference in this browser. Useful as a control; it is not evidence that the live boundary answered.'
    }),
    modeCard(doc, {
      mode: MARROWLINE_GATE_MODES.PUBLIC_ABSORPTION,
      eyebrow: 'Treatment · crosses the boundary',
      title: 'Fire with the token blank',
      body: 'Send one real request to the declared Marrowline endpoint and let the canonical absorbing route answer. Observe route, egress, digest and matrix.'
    }),
    modeCard(doc, {
      mode: MARROWLINE_GATE_MODES.OPERATOR_BYPASS_CONTROL,
      eyebrow: 'Control 1 · same endpoint',
      title: 'Fire with your operator token',
      body: 'Send one request to the same endpoint with the one-fire operator credential. The server—not the browser—decides whether the bypass is admitted.'
    })
  );

  const law = text(
    doc,
    'p',
    'The useful adversarial comparison is public absorption ↔ authorized operator bypass on the same endpoint. Same endpoint does not mean same route, and a local fallback does not count as a network crossing.',
    'gate-assay-law'
  );

  const result = doc.createElement('section');
  result.id = 'marrowlineGatePlainResult';
  result.className = 'gate-assay-result';
  result.setAttribute('role', 'status');
  result.setAttribute('aria-live', 'polite');
  result.dataset.mode = MARROWLINE_GATE_MODES.UNOBSERVED;
  result.append(
    text(doc, 'small', 'What happened'),
    text(doc, 'strong', 'No Gate result observed yet', 'gate-assay-result-title'),
    text(doc, 'p', 'Choose a control and fire it. Marrowline will translate the resulting receipt here.', 'gate-assay-result-copy'),
    text(doc, 'p', 'Nothing has been compared yet.', 'gate-assay-result-compare')
  );

  const details = doc.createElement('details');
  details.className = 'gate-assay-details';
  const summary = text(doc, 'summary', 'What this Gate can establish now');
  const capability = text(
    doc,
    'p',
    'Within the declared Marrowline endpoint, this is a human-operated adversarial boundary assay: it can compare a deterministic local control, live public absorption, and an authorized server-token bypass control while preserving the observed route and Aperture-egress outcome for each tested fire.'
  );
  const falsifierTitle = text(doc, 'strong', 'Immediate falsifiers');
  const list = doc.createElement('ul');
  for (const item of [
    'A local fallback claims that a network response occurred.',
    'A blank-token public fire is labeled operator-authorized.',
    'The one-fire operator token appears in a persisted or copied receipt.',
    'Public absorption and an admitted operator bypass become indistinguishable in the returned route evidence.',
    'An Aperture-egress status is shown when no egress observation exists.'
  ]) list.append(text(doc, 'li', item));
  const ceiling = text(
    doc,
    'p',
    `Current boundary: ${MARROWLINE_GATE_ASSAY_CLAIM_CEILING}`,
    'gate-assay-ceiling'
  );
  details.append(summary, capability, falsifierTitle, list, ceiling);

  section.append(header, consequence, cards, law, result, details);
  return section;
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
