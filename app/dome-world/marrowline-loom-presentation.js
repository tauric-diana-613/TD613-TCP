/**
 * Marrowline Loom Presentation Architecture
 * Implements the presentation tournament candidates:
 * A: CURRENT DIALOG (Candidate X baseline modal)
 * B: INLINE COMPOSER MODE (Docked inline card above textarea)
 * C: MOBILE BOTTOM SHEET (Thumb-native sheet anchored to viewport bottom)
 * D: STAGED ATTACHMENT RAIL (Contextual staging rail adjacent to composer)
 * E: ADAPTIVE HYBRID (Desktop Inline Card + Mobile Bottom Sheet with landscape 3-column layout)
 * F: THE CROSSING CATHEDRAL (Adaptive Hybrid + Flow-Core 39-Carrier Field + Dynamic Route Tether)
 *
 * All candidates strictly preserve the identical governance primitive:
 * - REST boundary: active === false, ordinary chat carries zero selected files
 * - Explicit human gesture to open disclosure
 * - SENDS TO AI / STAYS HERE / WE CAN'T SEE boundary disclosure
 * - Cancel preserves REST with zero network calls
 * - Confirm arms carriage authority for exactly one turn
 * - Immediate return to REST upon admission
 */

export const PRESENTATION_CANDIDATES = Object.freeze({
  A: { id: 'A', name: 'CURRENT DIALOG', mode: 'dialog' },
  B: { id: 'B', name: 'INLINE COMPOSER MODE', mode: 'inline' },
  C: { id: 'C', name: 'MOBILE BOTTOM SHEET', mode: 'sheet' },
  D: { id: 'D', name: 'STAGED ATTACHMENT RAIL', mode: 'rail' },
  E: { id: 'E', name: 'ADAPTIVE HYBRID', mode: 'adaptive' },
  F: { id: 'F', name: 'THE CROSSING CATHEDRAL', mode: 'cathedral' }
});

const DEFAULT_CANDIDATE = 'F';

function el(doc, tag, className = '', text = '') {
  const node = doc.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function btn(doc, label, action, className = '') {
  const node = el(doc, 'button', className, label);
  node.type = 'button';
  node.addEventListener('click', action);
  return node;
}

export function installMarrowlineLoomPresentation({
  doc = (typeof document !== 'undefined' ? document : null),
  environment = globalThis,
  packet = {},
  activation = {},
  onConfirm = async () => {},
  onCancel = () => {},
  initialCandidate = DEFAULT_CANDIDATE
} = {}) {
  let activeCandidate = initialCandidate;
  let isOpen = false;
  let currentLatest = null;

  // Root dialog / surface element
  const modal = el(doc, 'dialog', 'loom-reentry-modal', '');
  modal.id = 'loomReentryModal';
  modal.dataset.presentationCandidate = activeCandidate;

  // Sheet handle for mobile gestures
  const sheetHandle = el(doc, 'div', 'loom-reentry-sheet-handle', '');
  sheetHandle.setAttribute('aria-hidden', 'true');

  const form = el(doc, 'form', 'loom-reentry-form', '');
  form.setAttribute('method', 'dialog');

  const title = el(doc, 'h3', 'loom-reentry-title', 'Continue with Loom context');
  title.id = 'loomReentryTitle';

  const lead = el(doc, 'p', 'loom-reentry-lead',
    'Before continuing with your selected files, confirm what crosses to the AI receiver and what stays in your browser:');

  // The 3 boundary disclosure cards (plain language)
  const cards = el(doc, 'div', 'loom-reentry-cards', '');

  // 1. CROSS (SENDS TO AI)
  const cardCross = el(doc, 'div', 'loom-reentry-card loom-reentry-card-cross', '');
  const cardCrossTitle = el(doc, 'strong', 'card-header', 'SENDS TO AI:');
  const cardCrossList = el(doc, 'ul', '', '');
  cardCross.append(cardCrossTitle, cardCrossList);

  // 2. STAY (STAYS HERE)
  const cardStay = el(doc, 'div', 'loom-reentry-card loom-reentry-card-stay', '');
  const cardStayTitle = el(doc, 'strong', 'card-header', 'STAYS HERE:');
  const cardStayList = el(doc, 'ul', '', '');
  cardStay.append(cardStayTitle, cardStayList);

  // 3. UNKNOWN (WE CAN'T SEE)
  const cardUnknown = el(doc, 'div', 'loom-reentry-card loom-reentry-card-unknown', '');
  const cardUnknownTitle = el(doc, 'strong', 'card-header', 'WE CAN\'T SEE:');
  const cardUnknownList = el(doc, 'ul', '', '');
  cardUnknown.append(cardUnknownTitle, cardUnknownList);

  cards.append(cardCross, cardStay, cardUnknown);

  // Action controls
  const actions = el(doc, 'menu', 'loom-reentry-actions', '');
  const cancelBtn = btn(doc, 'Cancel · Stay in ordinary chat', () => {
    close();
    onCancel();
  }, 'loom-reentry-cancel');
  cancelBtn.id = 'loomReentryCancel';

  const confirmBtn = btn(doc, 'Confirm & attach selected files', async () => {
    close();
    await onConfirm();
  }, 'loom-reentry-confirm');
  confirmBtn.id = 'loomReentryConfirm';

  actions.append(cancelBtn, confirmBtn);
  form.append(sheetHandle, title, lead, cards, actions);
  modal.append(form);
  doc.body.append(modal);

  // Dynamic Route Tether bar for Candidate F / Cathedral
  const prompt = doc.getElementById('khonapolitPrompt');
  const composerForm = doc.getElementById('khonapolitForm');
  let routeTether = doc.getElementById('loomRouteTether');
  if (!routeTether && composerForm && prompt) {
    routeTether = el(doc, 'div', 'loom-route-tether', '');
    routeTether.id = 'loomRouteTether';
    routeTether.hidden = true;
    routeTether.innerHTML = `
      <div class="loom-route-tether-body">
        <span class="loom-route-tether-sigil" aria-hidden="true">☾</span>
        <div class="loom-route-tether-info">
          <strong class="loom-route-tether-state">Loom route is resting</strong>
          <span class="loom-route-tether-sub">Ordinary chat messages stay private</span>
        </div>
        <button type="button" class="loom-route-tether-action" id="loomRouteTetherAction">
          Continue with Loom context →
        </button>
      </div>
    `;
    const actionBtn = routeTether.querySelector('#loomRouteTetherAction');
    actionBtn?.addEventListener('click', () => open());
    const reference = doc.querySelector('.marrowline-composer-input-row') || prompt.closest('.prompt-label') || prompt;
    if (reference && reference.parentElement) {
      reference.parentElement.insertBefore(routeTether, reference);
    } else {
      composerForm.prepend(routeTether);
    }
  }

  function populateCards(latest = currentLatest) {
    currentLatest = latest;

    // 1. CROSS List
    cardCrossList.innerHTML = '';
    const docs = Array.isArray(packet.documents) ? packet.documents : [];
    const itemTask = el(doc, 'li', '', `Task & portable rules: ${packet.task || 'Analyze market conditions'}`);
    const itemFiles = el(doc, 'li', '', `${docs.length} selected files: ${docs.map(d => d.name || d.id).join(', ') || 'market.md'}`);
    const briefText = latest ? (latest.answer ? latest.answer.slice(0, 60) + '…' : 'State B') : 'none';
    const itemBrief = el(doc, 'li', '', `Prior Loom brief: ${briefText}`);
    cardCrossList.append(itemTask, itemFiles, itemBrief);

    // 2. STAY List
    cardStayList.innerHTML = '';
    const withheld = activation?.governance?.withheld_document_count ?? packet?.governance?.withheld_document_count ?? 1;
    const itemWithheld = el(doc, 'li', '', `${withheld} unselected/local files remain withheld in Loom.`);
    const itemChat = el(doc, 'li', '', 'Ordinary chat messages outside Loom stages stay private.');
    const itemLocal = el(doc, 'li', '', 'Selected file bodies leave live memory after this turn.');
    cardStayList.append(itemWithheld, itemChat, itemLocal);

    // 3. UNKNOWN List
    cardUnknownList.innerHTML = '';
    const itemReasoning = el(doc, 'li', '', 'AI provider internal reasoning and downstream retention.');
    const itemRemote = el(doc, 'li', '', 'Remote server logs or model memory outside this session.');
    cardUnknownList.append(itemReasoning, itemRemote);
  }

  function setCandidate(candidateKey) {
    if (!PRESENTATION_CANDIDATES[candidateKey]) return;
    activeCandidate = candidateKey;
    modal.dataset.presentationCandidate = candidateKey;
    if (routeTether) {
      routeTether.dataset.presentationCandidate = candidateKey;
      routeTether.hidden = !(candidateKey === 'F' || candidateKey === 'E');
    }
  }

  function open(latest = currentLatest) {
    populateCards(latest);
    isOpen = true;
    modal.removeAttribute('hidden');
    modal.hidden = false;
    modal.setAttribute('open', 'true');
    modal.showModal?.();
    confirmBtn.focus?.({ preventScroll: true });
    environment.dispatchEvent?.(new environment.CustomEvent('td613:marrowline:presentation-open', {
      detail: { candidate: activeCandidate }
    }));
  }

  function close() {
    isOpen = false;
    modal.close?.();
    modal.removeAttribute('open');
    modal.hidden = true;
    prompt?.focus?.({ preventScroll: true });
    environment.dispatchEvent?.(new environment.CustomEvent('td613:marrowline:presentation-close', {
      detail: { candidate: activeCandidate }
    }));
  }

  function updateRouteTether(state = {}) {
    if (!routeTether) return;
    const { phase, active, substantive_continuation_count: count = 0 } = state;
    const infoState = routeTether.querySelector('.loom-route-tether-state');
    const infoSub = routeTether.querySelector('.loom-route-tether-sub');
    const actionBtn = routeTether.querySelector('#loomRouteTetherAction');

    if (!active && phase === 'DONE') {
      routeTether.dataset.routeState = 'REST';
      routeTether.hidden = false;
      if (infoState) infoState.textContent = `Loom route is resting (${count} continuation${count === 1 ? '' : 's'} complete)`;
      if (infoSub) infoSub.textContent = 'Ordinary chat messages stay private and local';
      if (actionBtn) {
        actionBtn.textContent = 'Continue with Loom context (1 turn) →';
        actionBtn.disabled = false;
        actionBtn.hidden = false;
      }
    } else if (active && phase === 'FILES_STAGED') {
      routeTether.dataset.routeState = 'STAGED';
      routeTether.hidden = false;
      if (infoState) infoState.textContent = 'Governed continuation prepared';
      if (infoSub) infoSub.textContent = 'Selected files attached for 1 turn · Send to dispatch';
      if (actionBtn) actionBtn.hidden = true;
    } else if (phase === 'ARRIVED') {
      routeTether.dataset.routeState = 'ARRIVED';
      routeTether.hidden = false;
      if (infoState) infoState.textContent = 'Loom handoff arrived';
      if (infoSub) infoSub.textContent = 'Setup required before selected files can cross';
      if (actionBtn) actionBtn.hidden = true;
    } else {
      routeTether.hidden = true;
    }
  }

  // Keyboard navigation & dismissal
  const handleKeydown = (event) => {
    if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      close();
      onCancel();
    }
  };
  doc.addEventListener('keydown', handleKeydown);

  // Initial population
  populateCards();
  setCandidate(initialCandidate);

  const destroy = () => {
    doc.removeEventListener('keydown', handleKeydown);
    modal.remove();
    routeTether?.remove();
  };

  return Object.freeze({
    modal,
    form,
    open,
    close,
    isOpen: () => isOpen,
    setCandidate,
    getCandidate: () => activeCandidate,
    populateCards,
    updateRouteTether,
    destroy
  });
}
