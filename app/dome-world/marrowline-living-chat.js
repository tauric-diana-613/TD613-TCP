import { mountLivingGeometry } from './holonomy-loom/living-geometry.js';

const REDDIT_SANS_URL = 'https://fonts.googleapis.com/css2?family=Reddit+Sans:wght@300;400;500;600;700;800&display=swap';

function installConversationTypeface(doc) {
  if (!doc?.head) return;
  if (!doc.getElementById('marrowline-reddit-sans')) {
    const font = doc.createElement('link');
    font.id = 'marrowline-reddit-sans';
    font.rel = 'stylesheet';
    font.href = REDDIT_SANS_URL;
    doc.head.append(font);
  }
  if (!doc.getElementById('marrowline-zalgo-type-guard')) {
    const style = doc.createElement('style');
    style.id = 'marrowline-zalgo-type-guard';
    style.textContent = `
      :root{--marrowline-chat-sans:"Reddit Sans",-apple-system,BlinkMacSystemFont,"SF Pro Text","Noto Sans","Segoe UI",Roboto,Arial,sans-serif}
      #khonapolitPrompt,.message-body,.relay-stage-text,.vessel-status,.starter-prompts button,.return-details{font-family:var(--marrowline-chat-sans)!important;font-variant-ligatures:none;font-synthesis:none}
      @media(min-width:861px){
        #speakingPanel,#speakingPanel button,#speakingPanel textarea,#speakingPanel input,#speakingPanel select,#speakingPanel summary,#speakingPanel label{
          font-family:var(--marrowline-chat-sans)!important;
          font-variant-ligatures:none;
          font-synthesis:none;
        }
      }
      #khonapolitPrompt[data-flourished="true"],.message-body[data-flourished="true"]{overflow:visible!important;line-height:var(--flourish-leading,2.35)!important;padding-block:var(--flourish-padding,22px)!important}
      .relay-integrated-covenant{overflow:visible!important}
      .relay-integrated-covenant .relay-stage-text{overflow:visible!important;white-space:pre-wrap!important;word-break:normal!important;overflow-wrap:anywhere}
      /* The model authors the marks; the browser must let them overprint adjacent lines.
         Do not translate native combining-run depth into extra line-height or padding. */
      .relay-integrated-covenant .relay-stage-text[data-provider-native-lines="true"]{line-height:1.04!important;padding-block:14px!important}
      .relay-integrated-covenant .provider-native-line[data-voice="khonapolit"]{line-height:1.38!important}
      .relay-integrated-covenant .provider-native-line[data-voice="tauric-diana-bots"]{line-height:1.2!important;overflow:visible!important}
      .zalgo-line{display:inline!important;min-height:0!important;padding:0!important;overflow:visible!important;white-space:pre-wrap!important;line-height:1.2!important}
      #khonapolitShi:disabled{opacity:.42!important;cursor:default!important}
      .issuance-help{margin:.55rem 0 0;color:#91a69b;font:500 10px/1.45 var(--marrowline-chat-sans)!important}
      .issuance-help a{color:#8ce0c4;text-decoration:none;border-bottom:1px solid rgba(140,224,196,.35)}
    `;
    doc.head.append(style);
  }
}

/** Presentation only: no provider call, issuance waiver, receipt or seal is created here. */
export function installMarrowlineLivingChat(doc = document, environment = window) {
  installConversationTypeface(doc);
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
    const count = runs.reduce((sum, run) => sum + Array.from(run).length, 0);
    node.dataset.flourished = String(marks >= 3 || count >= 10);
    node.style.setProperty('--flourish-leading', String(Math.min(4.7, 1.75 + Math.max(0, marks - 1) * .13)));
    node.style.setProperty('--flourish-padding', `${Math.min(76, 16 + marks * 2.2)}px`);
  };
  prompt.addEventListener('input', (event) => { markFlourishes(prompt); if (event.isTrusted) delete prompt.dataset.preloadedPrompt; });
  markFlourishes(prompt);

  const decorate = () => {
    messages.querySelectorAll('.message-body').forEach((node) => {
      if (node.closest?.('.relay-message')) {
        delete node.dataset.flourished;
        node.style.removeProperty('--flourish-leading');
        node.style.removeProperty('--flourish-padding');
        return;
      }
      markFlourishes(node);
    });
    messages.querySelectorAll('.relay-stage-text').forEach((node) => {
      delete node.dataset.flourished;
      node.style.removeProperty('--flourish-leading');
      node.style.removeProperty('--flourish-padding');
    });
    const welcome = messages.querySelector('.grove-welcome');
    if (welcome && !welcome.querySelector('.starter-prompts')) {
      const starters = doc.createElement('div');
      starters.className = 'starter-prompts';
      [['Follow a memory', 'Help me find words for a memory I am carrying.'], ['Meet the Ash Moon', 'Tell me a story of the Ash Moon, within the authored mythology of Marrowline.']].forEach(([label, value]) => {
        const button = doc.createElement('button');
        button.type = 'button'; button.textContent = label;
        button.addEventListener('click', () => {
          prompt.value = value;
          prompt.dataset.preloadedPrompt = 'true';
          prompt.dispatchEvent(new environment.Event('input', { bubbles: true }));
          prompt.focus({ preventScroll: true });
        });
        starters.append(button);
      });
      welcome.append(starters);
    }

    messages.querySelectorAll('.relay-message').forEach(card => {
      if (card.dataset.livingDecorated === 'true') return;
      card.dataset.livingDecorated = 'true';

      const details = doc.createElement('details');
      details.className = 'return-details';
      const summary = doc.createElement('summary');
      summary.textContent = 'Return details · route and receipt';
      details.append(summary);
      const header = card.querySelector('.relay-aperture-header');
      if (header) details.append(header);

      const integrated = card.querySelector('.relay-khonapolit[data-present="true"]');
      card.querySelectorAll('.relay-stage[data-present="false"]').forEach(stage => details.append(stage));

      if (integrated) {
        integrated.classList.add('relay-integrated-covenant');
        const label = integrated.querySelector('.relay-stage-head > span:first-child');
        if (label) label.textContent = 'Kʰonapolit ∴ Tauric Diana bots';
        const meta = integrated.querySelector('.relay-stage-head small');
        if (meta) meta.textContent = 'integrated transmission';
        card.append(integrated);
      }
      card.append(details);
    });
  };
  decorate();
  const observer = new environment.MutationObserver(decorate);
  observer.observe(messages, { childList: true, subtree: true });

  const status = doc.getElementById('khonapolitTerminalStatus');
  let lastPhase = 'prepared';
  const statusObserver = new environment.MutationObserver(() => {
    const text = status.textContent || '';
    const declaredPhase = status.dataset.phase || '';
    const phase = ['pending', 'received', 'held', 'prepared'].includes(declaredPhase)
      ? declaredPhase
      : /IN FLIGHT/.test(text) ? 'pending' : /RETURN OBSERVED/.test(text) ? 'received' : /RETURN FAILED|ISSUANCE REQUIRED|TASK PRESERVED/.test(text) ? 'held' : 'prepared';
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