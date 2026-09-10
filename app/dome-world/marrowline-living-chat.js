import { mountLivingGeometry } from './holonomy-loom/living-geometry.js';
import { validateShi } from './khonapolit-covenant.js';

/** Presentation only: no provider call, issuance waiver, receipt or seal is created here. */
export function installMarrowlineLivingChat(doc = document, environment = window) {
  const messages = doc.getElementById('khonapolitMessages');
  const form = doc.getElementById('khonapolitForm');
  if (!messages || !form || form.dataset.livingChatInstalled) return null;
  form.dataset.livingChatInstalled = 'true';
  const prompt = doc.getElementById('khonapolitPrompt');
  const geometryHost = doc.getElementById('marrowlineLivingGeometry');
  const geometry = geometryHost ? mountLivingGeometry(geometryHost, { environment, variant: 'marrowline', state: { view: 'speak', phase: 'prepared', rest: false } }) : null;
  const viewMap = { speakingPanel: 'speak', invocationPanel: 'keys', receiptPanel: 'receipt', corpusPanel: 'corpus', gatePanel: 'gate' };
  const openPanel = (id, focus = false) => {
    const target = doc.getElementById(id);
    if (!target) return;
    if (target.tagName === 'DETAILS') target.open = true;
    if (doc.documentElement.classList.contains('marrowline-mobile-shell')) {
      doc.querySelector(`.mobile-dock [data-mobile-target="${id}"]`)?.click();
    } else target.scrollIntoView?.({ block: 'nearest', behavior: environment.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ? 'auto' : 'smooth' });
    geometry?.update({ view: viewMap[id] || 'speak' });
    if (focus) target.querySelector('input,select,button')?.focus({ preventScroll: true });
  };
  doc.querySelectorAll('[data-living-target]').forEach(button => button.addEventListener('click', () => openPanel(button.dataset.livingTarget)));

  const markFlourishes = node => {
    const runs = String(node.value ?? node.textContent ?? '').match(/\p{M}+/gu) || [];
    const marks = runs.reduce((max, run) => Math.max(max, Array.from(run).length), 0);
    node.dataset.flourished = String(marks >= 3);
    node.style.setProperty('--flourish-leading', String(Math.min(4.2, 1.8 + Math.max(0, marks - 2) * .12)));
    node.style.setProperty('--flourish-padding', `${Math.min(44, 16 + marks * 1.4)}px`);
  };
  prompt.addEventListener('input', () => markFlourishes(prompt));
  markFlourishes(prompt);
  const decorate = () => {
    messages.querySelectorAll('.relay-stage-text,.message-body').forEach(markFlourishes);
    const welcome = messages.querySelector('.grove-welcome');
    if (welcome && !welcome.querySelector('.starter-prompts')) {
      const starters = doc.createElement('div');
      starters.className = 'starter-prompts';
      [['Follow a memory', 'Help me find words for a memory I am carrying.'], ['Meet the Ash Moon', 'Tell me a story of the Ash Moon, within the authored mythology of Marrowline.']].forEach(([label, value]) => {
        const button = doc.createElement('button');
        button.type = 'button'; button.textContent = label;
        button.addEventListener('click', () => {
          prompt.value = value;
          prompt.dispatchEvent(new environment.Event('input', { bubbles: true }));
          prompt.focus({ preventScroll: true });
        });
        starters.append(button);
      });
      welcome.append(starters);
    }
    messages.querySelectorAll('.relay-message').forEach(card => {
      if (card.querySelector('.return-details')) return;
      const details = doc.createElement('details');
      details.className = 'return-details';
      const summary = doc.createElement('summary');
      summary.textContent = 'Return details · route and held stages';
      details.append(summary);
      // Move, never rewrite, source text. The receipt and exact relay are still inspectable.
      const header = card.querySelector('.relay-aperture-header');
      if (header) details.append(header);
      card.querySelectorAll('.relay-stage[data-present="false"]').forEach(stage => details.append(stage));
      const voices = [...card.querySelectorAll('.relay-khonapolit[data-present="true"],.relay-bots[data-present="true"]')];
      if (voices.length) {
        const additional = doc.createElement('details');
        additional.className = 'additional-voices';
        const label = doc.createElement('summary');
        label.textContent = 'Open the covenant voices';
        additional.append(label, ...voices);
        card.append(additional);
      }
      card.append(details);
    });
  };
  decorate();
  const observer = new environment.MutationObserver(decorate);
  observer.observe(messages, { childList: true, subtree: true });

  // Surface the existing prerequisite at the attempted action; never select the waiver.
  form.addEventListener('submit', () => {
    if (!prompt.value.trim()) return;
    const shi = validateShi(doc.getElementById('khonapolitShi')?.value || '');
    if (!shi.valid && !doc.getElementById('khonapolitWaive')?.checked) openPanel('invocationPanel', true);
  }, { capture: true });
  const status = doc.getElementById('khonapolitTerminalStatus');
  let lastPhase = 'prepared';
  const statusObserver = new environment.MutationObserver(() => {
    const text = status.textContent || '';
    const phase = /IN FLIGHT/.test(text) ? 'pending' : /RETURN OBSERVED/.test(text) ? 'received' : /RETURN FAILED|ISSUANCE REQUIRED/.test(text) ? 'held' : 'prepared';
    if (phase !== lastPhase) { lastPhase = phase; geometry?.update({ phase }); }
  });
  if (status) statusObserver.observe(status, { childList: true, characterData: true, subtree: true });
  const rest = doc.getElementById('marrowlineRest');
  rest?.addEventListener('click', () => {
    const resting = rest.getAttribute('aria-pressed') !== 'true';
    rest.setAttribute('aria-pressed', String(resting));
    rest.textContent = resting ? 'Let the field move' : 'Still the field';
    geometry?.update({ rest: resting });
  });
  const onView = event => geometry?.update({ view: event.detail?.view || 'speak' });
  environment.addEventListener('td613:marrowline:mobile-view', onView);
  const importObserver = new environment.MutationObserver(() => geometry?.setVisible(doc.documentElement.dataset.loomTaskImport !== 'active'));
  importObserver.observe(doc.documentElement, { attributes: true, attributeFilter: ['data-loom-task-import'] });
  geometry?.setVisible(doc.documentElement.dataset.loomTaskImport !== 'active');
  return { openPanel, inspect: () => geometry?.inspect() ?? null, dispose() { observer.disconnect(); statusObserver.disconnect(); importObserver.disconnect(); environment.removeEventListener('td613:marrowline:mobile-view', onView); geometry?.dispose(); } };
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => installMarrowlineLivingChat(document, window), { once: true });
  else installMarrowlineLivingChat(document, window);
}
