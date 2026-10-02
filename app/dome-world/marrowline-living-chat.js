import { mountLivingGeometry } from './holonomy-loom/living-geometry.js';
import { installMarrowlineReadingSurface } from './marrowline-reading-surface.js';
import {
  MARROWLINE_ATTACHMENT_CHANGE_EVENT,
  attachmentState
} from './marrowline-attachments.js';

const REDDIT_SANS_URL = 'https://fonts.googleapis.com/css2?family=Reddit+Sans:wght@300;400;500;600;700;800&display=swap';

// Reply-local follow-up prompts must not copy an arbitrarily long model return
// into a potentially large human composer draft. The exact original remains in the
// transcript/receipt. An older reply may fall outside the bounded model history,
// so a short excerpt is explicitly identified as an excerpt.
export function buildMarrowlineReplyFollowupDraft(instruction, replyText) {
  const source = String(replyText ?? '');
  const excerpt = source.length > 2400
    ? source.slice(0, 2400) + '\n[Excerpt only. The selected reply may contain additional text.]'
    : source;
  return `${instruction}\n\nSelected reply excerpt for reference:\n${excerpt}`;
}

function replyAttachmentReceipt(card) {
  try {
    const value = JSON.parse(card?.dataset?.attachmentReceipt || '[]');
    return Array.isArray(value) ? value.filter(item => item && item.name && Number(item.size_bytes) > 0) : [];
  } catch {
    return [];
  }
}
function formatReplyAttachmentBytes(value = 0) {
  const bytes = Number(value || 0);
  if (!Number.isFinite(bytes) || bytes <= 0) return '';
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

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
      .relay-integrated-covenant .provider-native-line[data-voice="tauric-diana-bots"]{line-height:1.04!important;overflow:visible!important}
      .zalgo-line{display:inline!important;min-height:0!important;padding:0!important;overflow:visible!important;white-space:pre-wrap!important;line-height:1.04!important}
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
    const behavior = environment.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ? 'auto' : 'smooth';
    const mobile = doc.documentElement.classList.contains('marrowline-mobile-shell');
    if (mobile) {
      const dockButton = doc.querySelector(`.mobile-dock [data-mobile-target="${id}"]`);
      dockButton?.click();
      target.scrollIntoView?.({ block: 'start', behavior });
      if (focus) dockButton?.focus?.({ preventScroll: true });
    } else {
      const desktopTab = doc.querySelector(`#marrowlineDesktopToolTabs [data-target="${id}"]`);
      if (desktopTab) {
        desktopTab.click();
        const tools = doc.querySelector('.living-tools');
        if (typeof tools?.scrollTo === 'function') tools.scrollTo({ top: 0, behavior });
        else if (tools) tools.scrollTop = 0;
        if (focus) desktopTab.focus?.({ preventScroll: true });
      } else {
        target.scrollIntoView?.({ block: 'nearest', behavior });
        if (focus) target.querySelector('input,select,button')?.focus?.({ preventScroll: true });
      }
    }
    geometry?.update({ view: viewMap[id] || 'speak' });
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
  // The preloaded first-tap affordance belongs only to the untouched starter.
  // Programmatic fill and native editing invalidate only on a value change;
  // event provenance never overrides the actual untouched-starter snapshot.
  prompt.addEventListener('input', () => {
    markFlourishes(prompt);
    // Both the initial two prompts and the rotating carousel own the same
    // snapshot contract; the first real edit invalidates first-tap interception.
    if (prompt.dataset.preloadedPrompt === 'true' && prompt.value !== prompt.dataset.preloadedPromptValue) {
      delete prompt.dataset.preloadedPrompt;
      delete prompt.dataset.preloadedPromptValue;
    }
  });
  markFlourishes(prompt);

  let attachmentSubmissionActive = false;
  const syncReplyAttachmentAccess = () => {
    const staged = Number(attachmentState()?.count || 0) > 0 && !attachmentSubmissionActive;
    messages.querySelectorAll('.relay-message .reply-attachment-access').forEach(button => {
      const historical = button.dataset.hasReceiptAttachments === 'true';
      button.hidden = !(historical || staged);
    });
  };

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
          prompt.dataset.preloadedPromptValue = value;
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
      const receiptAttachments = replyAttachmentReceipt(card);

      // Reply-local options belong in their compact drawer, not in the
      // model's reading flow. Technical provenance remains in Receipt.
      const actions = doc.createElement('details');
      actions.className = 'reply-next-actions';
      const actionSummary = doc.createElement('summary');
      actionSummary.textContent = 'More with this reply';
      actions.append(actionSummary);
      const choices = doc.createElement('div');
      choices.className = 'reply-next-choices';
      choices.setAttribute('role', 'group');
      choices.setAttribute('aria-label', 'Follow-up options for this reply');
      const replyText = card.querySelector('.relay-khonapolit .relay-stage-text')?.textContent || '';
      for (const [label, instruction] of [
        ['Check the claims', 'Review the reply quoted below. Separate supported claims from assumptions, identify missing evidence, and explain what would verify or change the conclusion.'],
        ['Make a plan', 'Turn the reply quoted below into practical next steps. Identify the first action, prerequisites, and decisions I need to make.']
      ]) {
        const button = doc.createElement('button');
        button.type = 'button'; button.textContent = label;
        button.addEventListener('click', () => {
          const input = doc.getElementById('khonapolitPrompt');
          if (input.value.trim()) { input.focus({ preventScroll: true }); return; }
          input.value = buildMarrowlineReplyFollowupDraft(instruction, replyText);
          input.dispatchEvent(new environment.Event('input', { bubbles: true }));
          actions.open = false;
          input.focus({ preventScroll: true });
        });
        choices.append(button);
      }
      const receiptButton = doc.createElement('button');
      receiptButton.type = 'button';
      receiptButton.textContent = 'Receipts';
      receiptButton.addEventListener('click', () => {
        actions.open = false;
        openPanel('receiptPanel', true);
      });
      choices.append(receiptButton);
      const branchButton = doc.createElement('button');
      branchButton.type = 'button';
      branchButton.className = 'reply-branch-action';
      branchButton.textContent = 'Branch';
      branchButton.setAttribute('aria-label', 'Branch a new conversation from this reply');
      branchButton.addEventListener('click', () => {
        const responseIndex = Number(card.dataset.messageIndex);
        if (!Number.isInteger(responseIndex)) return;
        actions.open = false;
        doc.dispatchEvent(new environment.CustomEvent('td613:marrowline:branch-reply', {
          detail: { responseIndex }
        }));
      });
      choices.append(branchButton);
      const attachmentButton = doc.createElement('button');
      attachmentButton.type = 'button';
      attachmentButton.className = 'reply-attachment-access';
      attachmentButton.textContent = 'Attachments';
      attachmentButton.dataset.hasReceiptAttachments = String(receiptAttachments.length > 0);
      attachmentButton.hidden = receiptAttachments.length === 0;
      attachmentButton.setAttribute('aria-expanded', 'false');
      const attachmentReceiptPanel = doc.createElement('div');
      attachmentReceiptPanel.className = 'reply-attachment-receipt';
      attachmentReceiptPanel.hidden = true;
      attachmentReceiptPanel.setAttribute('role', 'region');
      attachmentReceiptPanel.setAttribute('aria-label', 'Attachments used for this reply');
      receiptAttachments.forEach(item => {
        const row = doc.createElement('div');
        row.className = 'reply-attachment-receipt-row';
        const kind = doc.createElement('span');
        kind.textContent = item.kind === 'photo' ? 'Photo' : 'File';
        const name = doc.createElement('b');
        name.textContent = item.name;
        const size = doc.createElement('small');
        size.textContent = formatReplyAttachmentBytes(item.size_bytes);
        row.append(kind, name, size);
        attachmentReceiptPanel.append(row);
      });
      attachmentButton.setAttribute('aria-label', receiptAttachments.length
        ? `Show ${receiptAttachments.length} attachment${receiptAttachments.length === 1 ? '' : 's'} used for this reply`
        : 'Open staged attachments');
      attachmentButton.addEventListener('click', () => {
        if (receiptAttachments.length) {
          const opening = attachmentReceiptPanel.hidden;
          attachmentReceiptPanel.hidden = !opening;
          attachmentButton.setAttribute('aria-expanded', String(opening));
          return;
        }
        actions.open = false;
        environment.dispatchEvent?.(new environment.CustomEvent('td613:marrowline:attachments-open-request'));
      });
      choices.append(attachmentButton);
      actions.append(choices);
      if (receiptAttachments.length) actions.append(attachmentReceiptPanel);
      const integrated = card.querySelector('.relay-khonapolit[data-present="true"]');

      if (integrated) {
        integrated.classList.add('relay-integrated-covenant');
        const label = integrated.querySelector('.relay-stage-head > span:first-child');
        if (label) label.textContent = 'Kʰonapolit ∴ Tauric Diana bots';
        const meta = integrated.querySelector('.relay-stage-head small');
        if (meta) meta.textContent = 'integrated transmission';
        card.append(integrated);
        // Derive a professional reading layer without mutating the canonical
        // provider-return node used by custody, receipts, copy, follow-up and
        // morphology witnesses.
        installMarrowlineReadingSurface(integrated, environment);
      }
      // The footer contains only the disclosure. Branching is reply-local
      // inside More with this reply, alongside the other actions.
      const toolRow = doc.createElement('div');
      toolRow.className = 'marrowline-reply-tool-row';
      toolRow.append(actions);
      card.append(toolRow);
      // Keep the native single-reply copy control last and outside the drawer.
      const replyCopy = card.querySelector('.marrowline-copy-reply');
      if (replyCopy) card.append(replyCopy);
    });
    syncReplyAttachmentAccess();
  };
  decorate();
  const observer = new environment.MutationObserver(decorate);
  observer.observe(messages, { childList: true, subtree: true });
  const onAttachmentChange = () => syncReplyAttachmentAccess();
  const onAttachmentSubmission = event => {
    attachmentSubmissionActive = Boolean(event.detail?.sending);
    syncReplyAttachmentAccess();
  };
  environment.addEventListener?.(MARROWLINE_ATTACHMENT_CHANGE_EVENT, onAttachmentChange);
  environment.addEventListener?.('td613:marrowline:attachment-submission-state', onAttachmentSubmission);

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
  // The masthead now links to TD613 in a separate tab. Keep the current
  // conversation and animation state untouched when that link is activated.
  const onView = event => geometry?.update({ view: event.detail?.view || 'speak' });
  environment.addEventListener('td613:marrowline:mobile-view', onView);
  const importObserver = new environment.MutationObserver(() => geometry?.setVisible(doc.documentElement.dataset.loomTaskImport !== 'active'));
  importObserver.observe(doc.documentElement, { attributes: true, attributeFilter: ['data-loom-task-import'] });
  geometry?.setVisible(doc.documentElement.dataset.loomTaskImport !== 'active');
  return { openPanel, inspect: () => geometry?.inspect() ?? null, dispose() {
    observer.disconnect(); statusObserver.disconnect(); importObserver.disconnect();
    environment.removeEventListener('td613:marrowline:mobile-view', onView);
    environment.removeEventListener?.(MARROWLINE_ATTACHMENT_CHANGE_EVENT, onAttachmentChange);
    environment.removeEventListener?.('td613:marrowline:attachment-submission-state', onAttachmentSubmission);
    geometry?.dispose();
  } };
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => installMarrowlineLivingChat(document, window), { once: true });
  else installMarrowlineLivingChat(document, window);
}