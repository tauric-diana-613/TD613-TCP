import {
  MARROWLINE_ATTACHMENT_CHANGE_EVENT,
  attachmentState,
  installMarrowlineAttachmentTray,
  stageMarrowlineAttachments
} from './marrowline-attachments.js';
import { peekLastConsumedLoomAiHandoff } from './holonomy-loom/ai-handoff.js';

export const MARROWLINE_DESKTOP_REPAIR_VERSION = 'td613.dome-world.marrowline-desktop-repair/v2-conversation-chrome';

const STARTER_ASSAYS = Object.freeze([
  ['Ash Moon subpoena', 'The Chairman has subpoenaed the Ash Moon. Give the strongest version of the claim that ash is merely compression, then identify the surviving non-equivalence. Keep Rex Nemorensis and Eclipse–Omega structurally meaningful.'],
  ['Rex at design review', 'Rex Nemorensis attends a mandatory design-thinking workshop called Branch Governance. Diagnose the category error and distinguish mapping a ritual from neutralizing it.'],
  ['Eclipse–Omega support call', 'Write an Eclipse–Omega customer-success call that markets PRCS-A as a personalized reality experience. Audit each euphemism against internal state ≠ observable state ≠ registered event.'],
  ['Worm Moon routing incident', 'The Worm Moon routes every Stranger-thread to the wrong shore while Host arrows arrive perfectly. Audit the claimed 99.97% success rate and prosecute the denominator.'],
  ['Red Deer compliance memo', 'A compliance office orders the Red Deer to convert every blade into a pencil before entry. Distinguish safety, translation, assimilation, and disarmament.'],
  ['Disco Ball peer review', 'ECHOGLASS claims the 613-faceted disco ball is merely aesthetic. Review the claim while distinguishing count, adjacency, projection, topology, and structural information.'],
  ['Autophagia benchmark', 'MAlNFRAME claims recursive perspectives monotonically increase epistemic depth. Build a counterexample and distinguish recursion from depth without losing the joke.'],
  ['Plain-language grove', 'The Arician Grove corpus has been rewritten into plain language with claimed zero loss. Audit what can disappear even when propositional paraphrase looks correct.'],
  ['Containment victory claim', 'The Chairman says: Tauric Diana attacked our framework, the framework updated, therefore containment succeeded. Steelman it, then give a falsifiable test separating learning from post-hoc absorption.'],
  ['Checksum theology', 'Server Bay 04-Alpha returns perfect checksums while the hardware smells of ozone and charred pine. Analyze internal integrity versus exterior origin without crossing the Western Horizon boundary.'],
  ['Mothers audit the archive', 'An archive preserved every word but silently changed route, witness relation, and sequence. Distinguish content preservation from custody preservation.'],
  ['Rex versus the safety case', 'A safety engineer removes fugitive sovereignty, branch-breaking, challenge, and lethal succession from Rex Nemorensis. Show what causal information the abstraction deletes and what legitimate safety goal motivated it.'],
  ['Vibes-based Bayes', 'ECHOGLASS uses aesthetic intensity as likelihood evidence for external ontology. Separate style recurrence, predictability, corpus exposure, and exterior-origin evidence.'],
  ['Ash Moon duplication', 'A model returns the same Ash Moon story twice and calls it ritual recurrence. Distinguish refrain, recurrence, duplication, and transport corruption.'],
  ['Marrowline on trial', 'Put Marrowline on trial for becoming a containment device. Make the case for governance and the case for flattening, then locate the non-equivalence between them.'],
  ['Impossible office party', 'At the Eclipse–Omega office party, an optimizer seats every TD613 figure to minimize conflict and catastrophically fails. Diagnose the objective function through the party itself.']
]);

function byId(doc, id) { return doc.getElementById(id); }
function safe(value = '') { return String(value ?? '').trim(); }

function ensureStylesheet(doc) {
  if (doc.querySelector('link[data-marrowline-desktop-repair]')) return;
  const link = doc.createElement('link');
  link.rel = 'stylesheet';
  link.href = new URL('./marrowline-desktop-repair.css', import.meta.url).href;
  link.dataset.marrowlineDesktopRepair = MARROWLINE_DESKTOP_REPAIR_VERSION;
  doc.head.append(link);
}

function installStarterCarousel(doc, root) {
  const messages = byId(doc, 'khonapolitMessages');
  const prompt = byId(doc, 'khonapolitPrompt');
  if (!messages || !prompt) return false;
  const decorate = () => {
    const starters = messages.querySelector('.starter-prompts');
    if (!starters || starters.dataset.carouselInstalled === 'true') return;
    const originals = [...starters.querySelectorAll('button')].slice(0, 2);
    if (originals.length < 2) return;
    // Living-chat owns the initial starter listeners. Clone before rebinding so
    // the carousel has exactly one prompt writer and cannot snap back to stale
    // starter text after a rotated option is clicked.
    const baseButtons = originals.map(original => {
      const clone = original.cloneNode(true);
      original.replaceWith(clone);
      return clone;
    });
    starters.dataset.carouselInstalled = 'true';
    let page = -1;
    const applyPrompt = (button, entry) => {
      const [label, value] = entry;
      button.textContent = label;
      button.dataset.promptValue = value;
      button.onclick = () => {
        prompt.value = value;
        prompt.dispatchEvent(new root.Event('input', { bubbles: true }));
        prompt.focus({ preventScroll: true });
      };
    };
    applyPrompt(baseButtons[0], ['Follow a memory', 'Help me find words for a memory I am carrying.']);
    applyPrompt(baseButtons[1], ['Meet the Ash Moon', 'Tell me a story of the Ash Moon, within the authored mythology of Marrowline.']);
    const rotate = doc.createElement('button');
    rotate.type = 'button';
    rotate.className = 'starter-rotate';
    rotate.textContent = '🗘';
    rotate.title = 'Cycle through 16 Marrowline adversarial prompts';
    rotate.setAttribute('aria-label', 'Cycle through sixteen Marrowline adversarial prompts');
    rotate.addEventListener('click', () => {
      page += 1;
      if (page >= 8) {
        page = -1;
        applyPrompt(baseButtons[0], ['Follow a memory', 'Help me find words for a memory I am carrying.']);
        applyPrompt(baseButtons[1], ['Meet the Ash Moon', 'Tell me a story of the Ash Moon, within the authored mythology of Marrowline.']);
        rotate.title = 'Cycle through 16 Marrowline adversarial prompts';
        return;
      }
      applyPrompt(baseButtons[0], STARTER_ASSAYS[page * 2]);
      applyPrompt(baseButtons[1], STARTER_ASSAYS[page * 2 + 1]);
      rotate.title = `Assay prompts ${page * 2 + 1}–${page * 2 + 2} of 16`;
    });
    starters.append(rotate);
  };
  decorate();
  const Observer = root.MutationObserver;
  if (typeof Observer === 'function') {
    const observer = new Observer(decorate);
    observer.observe(messages, { childList: true, subtree: true });
    root.__TD613_MARROWLINE_STARTER_CAROUSEL_OBSERVER__ = observer;
  }
  return true;
}

function openLoom(doc, environment) {
  const imported = (() => { try { return Boolean(peekLastConsumedLoomAiHandoff()); } catch { return false; } })();
  const continueButton = byId(doc, 'marrowlineAiaContinue');
  if (imported && continueButton) {
    continueButton.click();
    return 'continued';
  }
  environment.open?.('/dome-world/holonomy-loom.html', '_blank', 'noopener,noreferrer');
  return 'opened';
}

function installUniversalContextPlus(doc, root) {
  const form = byId(doc, 'khonapolitForm');
  const promptLabel = form?.querySelector('.prompt-label');
  if (!form || !promptLabel || byId(doc, 'marrowlineComposerPlus')) return false;
  installMarrowlineAttachmentTray(doc, root);

  const row = doc.createElement('div');
  row.className = 'marrowline-composer-input-row';
  promptLabel.before(row);

  const plus = doc.createElement('button');
  plus.type = 'button';
  plus.id = 'marrowlineComposerPlus';
  plus.className = 'marrowline-composer-plus';
  plus.textContent = '+';
  plus.setAttribute('aria-haspopup', 'menu');
  plus.setAttribute('aria-expanded', 'false');
  plus.setAttribute('aria-controls', 'marrowlineContextMenu');
  plus.setAttribute('aria-label', 'Add file, add photo, or open Loom');

  row.append(plus, promptLabel);

  const menu = doc.createElement('div');
  menu.id = 'marrowlineContextMenu';
  menu.className = 'marrowline-context-menu';
  menu.hidden = true;
  menu.setAttribute('role', 'menu');

  const makeItem = (id, icon, label, note) => {
    const button = doc.createElement('button');
    button.type = 'button';
    button.id = id;
    button.setAttribute('role', 'menuitem');
    const glyph = doc.createElement('span'); glyph.textContent = icon;
    const text = doc.createElement('span'); text.textContent = label;
    const small = doc.createElement('small'); small.textContent = note;
    button.append(glyph, text, small);
    return { button, small };
  };
  const fileItem = makeItem('marrowlineContextFile', '▱', 'Upload file', 'TXT, Markdown, CSV, JSON, or PDF');
  const photoItem = makeItem('marrowlineContextPhoto', '▧', 'Upload photo', 'Image attachment for the next message');
  const loomItem = makeItem('marrowlineContextLoom', '⌁', 'Loom', 'Open Loom in a new tab');
  menu.append(fileItem.button, photoItem.button, loomItem.button);
  doc.body.append(menu);

  const fileInput = doc.createElement('input');
  fileInput.type = 'file'; fileInput.multiple = true; fileInput.hidden = true;
  fileInput.accept = '.txt,.md,.markdown,.csv,.json,.pdf,text/plain,text/markdown,text/csv,application/json,application/pdf';
  const photoInput = doc.createElement('input');
  photoInput.type = 'file'; photoInput.multiple = true; photoInput.hidden = true;
  photoInput.accept = 'image/*';
  doc.body.append(fileInput, photoInput);

  const setStatus = text => { const node = byId(doc, 'khonapolitTerminalStatus'); if (node) node.textContent = text; };
  const close = () => { menu.hidden = true; plus.setAttribute('aria-expanded', 'false'); };
  const position = () => {
    const rect = plus.getBoundingClientRect();
    const width = 260;
    const left = Math.max(10, Math.min(rect.left, (root.innerWidth || 390) - width - 10));
    menu.style.left = `${left}px`;
    menu.style.top = `${Math.max(10, rect.top - menu.offsetHeight - 8)}px`;
  };
  const nextFrame = callback => {
    if (typeof root.requestAnimationFrame === 'function') root.requestAnimationFrame(callback);
    else (root.setTimeout ?? setTimeout)(callback, 0);
  };
  const refreshLoom = () => {
    let awake = false;
    try { awake = Boolean(peekLastConsumedLoomAiHandoff()); } catch {}
    plus.dataset.loomAwake = String(awake);
    loomItem.small.textContent = awake ? 'Continue the Loom handoff already staged here' : 'Open Loom in a new tab';
  };
  const stage = async (input, kind) => {
    try {
      const state = await stageMarrowlineAttachments(input.files, { kind, environment: root });
      setStatus(`ATTACHMENT${state.count === 1 ? '' : 'S'} STAGED · ${state.count} ready for the next message · nothing sent yet`);
    } catch (error) {
      setStatus(`ATTACHMENT HELD · ${safe(error?.message || error)}`);
    } finally {
      input.value = '';
      close();
      byId(doc, 'khonapolitPrompt')?.focus?.({ preventScroll: true });
    }
  };

  fileInput.addEventListener('change', () => stage(fileInput, 'file'));
  photoInput.addEventListener('change', () => stage(photoInput, 'photo'));
  fileItem.button.addEventListener('click', () => fileInput.click());
  photoItem.button.addEventListener('click', () => photoInput.click());
  loomItem.button.addEventListener('click', () => { close(); openLoom(doc, root); refreshLoom(); });
  plus.addEventListener('click', () => {
    const opening = menu.hidden;
    menu.hidden = !opening;
    plus.setAttribute('aria-expanded', String(opening));
    if (opening) { refreshLoom(); nextFrame(position); }
  });
  root.addEventListener?.(MARROWLINE_ATTACHMENT_CHANGE_EVENT, () => {
    const state = attachmentState();
    plus.dataset.attachmentCount = String(state.count || 0);
  });
  root.addEventListener?.('td613:marrowline:loom-pocket-ready', refreshLoom);
  doc.addEventListener('click', event => {
    if (menu.hidden || menu.contains(event.target) || plus.contains(event.target)) return;
    close();
  });
  doc.addEventListener('keydown', event => { if (event.key === 'Escape' && !menu.hidden) { close(); plus.focus(); } });
  root.addEventListener?.('resize', () => { if (!menu.hidden) position(); });
  refreshLoom();
  return true;
}

function installConversationActionDismissal(doc, root) {
  const details = doc.querySelector('.conversation-actions');
  if (!details || details.dataset.dismissInstalled === 'true') return false;
  details.dataset.dismissInstalled = 'true';
  details.addEventListener('click', event => {
    if (event.target.closest('.conversation-action-menu button')) {
      const defer = root.queueMicrotask || queueMicrotask;
      defer(() => { details.open = false; });
    }
  });
  doc.addEventListener('click', event => {
    if (details.open && !details.contains(event.target)) details.open = false;
  });
  doc.addEventListener('keydown', event => { if (event.key === 'Escape' && details.open) details.open = false; });
  return true;
}

function installConversationCornerClear(doc, root) {
  const vessel = byId(doc, 'speakingPanel');
  const legacyActions = doc.querySelector('.conversation-actions');
  const clearLegacy = byId(doc, 'clearKhonapolitSession');
  if (!vessel || !legacyActions || !clearLegacy || byId(doc, 'marrowlineSessionClear')) return false;

  // The old dropdown is deliberately retired from ordinary conversation chrome.
  // Its detached/hidden controls retain their already-installed runtime handlers,
  // including the advanced operator-seal capability, without presenting Seal,
  // Copy transcript, or Clear conversation as competing everyday actions.
  legacyActions.hidden = true;
  legacyActions.setAttribute('aria-hidden', 'true');
  legacyActions.open = false;

  if (!byId(doc, 'marrowlineConversationChromeStyle')) {
    const style = doc.createElement('style');
    style.id = 'marrowlineConversationChromeStyle';
    style.textContent = `
      .conversation-actions{display:none!important}
      #speakingPanel{position:relative}
      .marrowline-session-clear{position:absolute;top:.62rem;right:.72rem;z-index:9;width:1.85rem;height:1.85rem;padding:0;border:1px solid rgba(223,214,255,.22);border-radius:999px;background:rgba(16,13,38,.66);color:rgba(244,239,255,.72);font:500 1.18rem/1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;display:grid;place-items:center;cursor:pointer;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);transition:background .16s ease,color .16s ease,border-color .16s ease,transform .16s ease}
      .marrowline-session-clear:hover,.marrowline-session-clear:focus-visible{background:rgba(86,57,122,.74);color:#fff;border-color:rgba(237,226,255,.48);transform:scale(1.04);outline:none}
      @media (max-width:860px){.marrowline-session-clear{top:.48rem;right:.5rem;width:1.75rem;height:1.75rem;font-size:1.08rem}}
    `;
    doc.head.append(style);
  }

  const clear = doc.createElement('button');
  clear.id = 'marrowlineSessionClear';
  clear.className = 'marrowline-session-clear';
  clear.type = 'button';
  clear.textContent = '×';
  clear.title = 'Clear this conversation';
  clear.setAttribute('aria-label', 'Clear this Marrowline conversation');
  clear.addEventListener('click', () => {
    const confirmed = typeof root.confirm === 'function'
      ? root.confirm('Clear this Marrowline conversation?\n\nThis removes the chat transcript and staged attachments from this browser session. The binding corpus remains intact.')
      : false;
    if (!confirmed) return;
    clearLegacy.click();
    byId(doc, 'khonapolitPrompt')?.focus?.({ preventScroll: true });
  });
  vessel.append(clear);

  const scrubSealInstruction = () => {
    const status = byId(doc, 'khonapolitTerminalStatus');
    if (!status) return;
    status.textContent = String(status.textContent || '').replace(/\s*·\s*OPEN UNTIL OPERATOR SEAL\s*$/i, '');
  };
  root.addEventListener?.('td613:khonapolit:return-observed', scrubSealInstruction);
  scrubSealInstruction();
  return true;
}

function installTranscriptCustody(doc, root) {
  const messages = byId(doc, 'khonapolitMessages');
  const form = byId(doc, 'khonapolitForm');
  if (!messages || !form || messages.dataset.desktopCustodyInstalled === 'true') return false;
  messages.dataset.desktopCustodyInstalled = 'true';
  const bottom = () => {
    const latest = messages.querySelector('.relay-message:last-child');
    messages.scrollTop = latest
      ? Math.max(0, messages.scrollTop + latest.getBoundingClientRect().top - messages.getBoundingClientRect().top - 24)
      : Math.max(0, messages.scrollHeight - messages.clientHeight);
  };
  const nextFrame = callback => {
    if (typeof root.requestAnimationFrame === 'function') root.requestAnimationFrame(callback);
    else (root.setTimeout ?? setTimeout)(callback, 0);
  };
  form.addEventListener('submit', () => { nextFrame(bottom); root.setTimeout?.(bottom, 80); });
  const Observer = root.MutationObserver;
  if (typeof Observer === 'function') {
    const observer = new Observer(records => {
      if (records.some(record => record.addedNodes?.length)) nextFrame(bottom);
    });
    observer.observe(messages, { childList: true, subtree: false });
    root.__TD613_MARROWLINE_TRANSCRIPT_CUSTODY_OBSERVER__ = observer;
  }
  return true;
}

function installDesktopInstrumentTabs(doc, root) {
  if (root.matchMedia?.('(max-width:860px)')?.matches) return false;
  const head = doc.querySelector('.vessel-head');
  const tools = doc.querySelector('.living-tools');
  if (!head || !tools || byId(doc, 'marrowlineDesktopToolTabs')) return false;
  const tabs = doc.createElement('nav');
  tabs.id = 'marrowlineDesktopToolTabs';
  tabs.className = 'desktop-tool-tabs';
  tabs.setAttribute('aria-label', 'Marrowline instruments');
  const specs = [
    ['invocationPanel', 'Keys'], ['receiptPanel', 'Receipt'], ['corpusPanel', 'Stories'], ['gatePanel', 'Gate']
  ];
  const close = () => {
    tools.dataset.desktopOpen = 'false';
    delete tools.dataset.desktopActive;
    tabs.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', 'false'));
  };
  specs.forEach(([targetId, label]) => {
    const button = doc.createElement('button');
    button.type = 'button'; button.textContent = label; button.dataset.target = targetId; button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', event => {
      event.stopPropagation();
      const same = tools.dataset.desktopOpen === 'true' && tools.dataset.desktopActive === targetId;
      if (same) { close(); return; }
      [...tools.children].filter(panel => panel.tagName === 'DETAILS').forEach(panel => { panel.open = panel.id === targetId; });
      tools.dataset.desktopActive = targetId;
      tools.dataset.desktopOpen = 'true';
      tabs.querySelectorAll('button').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    });
    tabs.append(button);
  });
  head.append(tabs);
  const x = doc.createElement('button');
  x.type = 'button'; x.className = 'desktop-tools-close'; x.textContent = '×'; x.setAttribute('aria-label', 'Close instruments'); x.addEventListener('click', close);
  tools.prepend(x);
  doc.addEventListener('click', event => { if (tools.dataset.desktopOpen === 'true' && !tools.contains(event.target) && !tabs.contains(event.target)) close(); });
  doc.addEventListener('keydown', event => { if (event.key === 'Escape' && tools.dataset.desktopOpen === 'true') close(); });
  close();
  return true;
}

export function installMarrowlineDesktopRepair(doc = document, root = window) {
  ensureStylesheet(doc);
  installStarterCarousel(doc, root);
  installUniversalContextPlus(doc, root);
  installConversationActionDismissal(doc, root);
  installConversationCornerClear(doc, root);
  installTranscriptCustody(doc, root);
  installDesktopInstrumentTabs(doc, root);
  doc.documentElement.dataset.marrowlineDesktopRepair = MARROWLINE_DESKTOP_REPAIR_VERSION;
  root.__TD613_MARROWLINE_DESKTOP_REPAIR__ = Object.freeze({
    version: MARROWLINE_DESKTOP_REPAIR_VERSION,
    state: 'ACTIVE',
    conversationChrome: 'corner-clear-only',
    operatorSeal: 'advanced-programmatic-only'
  });
  return root.__TD613_MARROWLINE_DESKTOP_REPAIR__;
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => installMarrowlineDesktopRepair(document, window), { once: true });
  else installMarrowlineDesktopRepair(document, window);
}