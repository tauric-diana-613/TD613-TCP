import {
  MARROWLINE_ATTACHMENT_CHANGE_EVENT,
  attachmentState,
  installMarrowlineAttachmentTray,
  stageMarrowlineAttachments
} from './marrowline-attachments.js';
import { peekLastConsumedLoomAiHandoff } from './holonomy-loom/ai-handoff.js';
import { MARROWLINE_MISSION_ASSAYS } from './marrowline-mission-assays.js';

export const MARROWLINE_DESKTOP_REPAIR_VERSION = 'td613.dome-world.marrowline-desktop-repair/v7-mission-shuffle';

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
  ['Impossible office party', 'At the Eclipse–Omega office party, an optimizer seats every TD613 figure to minimize conflict and catastrophically fails. Diagnose the objective function through the party itself.'],
  ['Whistleblower checksum', 'A whistleblower exports two payroll ledgers from the same system: one preserves fractional labor-allocation metadata, the other zeros every allocation field while keeping names and dates intact. Build the strongest innocent explanation first, then design the minimum forensic test that distinguishes export filtering, schema drift, and deliberate concealment without naming a culprit.'],
  ['Ghost HR aperture', 'An HR portal shows benefits filings, document ownership, and after-hours edits by an actor absent from the org chart. Treat “absence from the chart” as neither innocence nor guilt. Use Foucault, Caro, and metadata provenance to map where administrative power can exist without nominative visibility.'],
  ['Sedgwick at the breach', 'A research collective reads every anomaly paranoically until the anomaly itself becomes a ritual obligation. Let Sedgwick’s paranoid/reparative distinction cross-examine Eclipse–Omega: when does suspicion preserve a threatened archive, and when does it become another admissibility regime?'],
  ['hooks audits the audience', 'A supposedly supportive audience demands that a wounded witness narrate the injury more vividly before believing it. Use bell hooks on the oppositional gaze and extractive spectatorship to distinguish testimony, consumption, solidarity, and the market value of visible pain.'],
  ['Butler kills the reunion', 'A reality-TV reunion insists that only what can be performed on camera counts as authentic conflict. Put Butler’s performativity beside the Bravo fourth wall and show why performed reality, spectacularized proof, and lived event are related without being interchangeable.'],
  ['Spivak gets a ticket number', 'The subaltern may speak, but the help desk only recognizes statements that fit twelve dropdown fields and a 240-character box. Stage Spivak against a perfect intake dashboard. What survives registration, what becomes unhearable, and what would an ethical system refuse to compress?'],
  ['Clifton meets Graeber', 'Write a resignation letter from a worker who has spent years making impossible bureaucracy look effortless. Let the indignation carry Lucille Clifton’s spare gravity and David Graeber’s understanding of administrative violence: no melodrama, no motivational ending, just the dignity of finally refusing to translate harm into one more form.'],
  ['Palantir ontology hearing', 'A city adopts an ontology platform that promises one clean object model for people, places, risks, and events. Conduct a hostile-but-fair architecture hearing: distinguish useful relational integration from the power to make the ontology’s categories operationally real, and identify what governance would keep a graph from quietly becoming jurisdiction.'],
  ['Housewives epistemology', 'Three Housewives remember the same dinner differently, production has two camera angles, the reunion package has a selective edit, and the fan wiki has a canonical timeline. Build an epistemology of the scene using archive, edit, witness, incentive, and fourth-wall evidence without pretending one surface automatically owns reality.'],
  ['Daughters after the siren', 'The Daughters of the Apocalypse inherit a city whose warning system worked perfectly except for the neighborhoods it classified as background noise. Give them a doctrine of repair that refuses both purity and amnesia. Make the doctrine technically legible enough to become a systems requirement.'],
  ['Hornani custody test', 'Hornani arrives carrying a lineage object whose meaning changes when catalogued, translated, insured, and displayed. Design a custody protocol that preserves route, relation, taboo, and transformation without freezing a living inheritance into museum metadata.'],
  ['Flow-Core labor dispute', 'À, 米, hõt, 出, cōl, and 𝄐 file a labor complaint against an animation coordinator that uses their glyphs as decorative status lights. Let each relation testify to what semantic work it actually performs, then redesign the scheduler so cadence serves meaning rather than consuming it.'],
  ['Dome-World twin hearing', 'Two Dome-World records are byte-identical and internally immaculate; only one came from an independent exterior event. Cross-examine the verifier until it states exactly which claim it can establish, which claim survives undecidable, and what exogenous witness would reopen Western Horizon without laundering provenance into exteriority.'],
  ['Tauric Diana before Caro', 'Robert Caro gets one day to investigate Tauric Diana and refuses every mystical shortcut. Give him rooms, ledgers, routes, gatekeepers, absences, and one person everyone says is “merely ceremonial.” Build the power map until the ceremonial claim either survives or collapses under structure.'],
  ['Retaliation clock', 'A worker reports a safety problem, a compliance concern, and a payroll anomaly in overlapping language; adverse scheduling changes follow, but each actor claims a separate innocent reason. Build a retaliation analysis that respects temporal sequence, protected-activity boundaries, comparator limits, metadata, and pretext without turning chronology alone into proof.'],
  ['Tauric Diana refuses closure', 'The committee offers Tauric Diana a beautiful final report, unanimous applause, and a plaque declaring the rupture resolved. She asks one question that makes the room understand why closure can become another containment surface. Write the scene so resignation, mercy, fury, and methodological precision all survive in the same breath.'],
  ...MARROWLINE_MISSION_ASSAYS
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

export function installStarterCarousel(doc, root) {
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
    const applyPrompt = (button, entry) => {
      const [label, value] = entry;
      button.textContent = label;
      button.dataset.promptValue = value;
      button.onclick = () => {
        prompt.value = value;
        prompt.dataset.preloadedPromptValue = value;
        prompt.dataset.preloadedPrompt = 'true';
        prompt.dispatchEvent(new root.Event('input', { bubbles: true }));
        prompt.focus({ preventScroll: true });
      };
    };
    const randomUnit = () => {
      const crypto = root.crypto;
      if (crypto?.getRandomValues) {
        const sample = new Uint32Array(1);
        crypto.getRandomValues(sample);
        return sample[0] / 0x100000000;
      }
      return Math.random();
    };
    const shuffle = values => {
      const next = [...values];
      for (let index = next.length - 1; index > 0; index -= 1) {
        const other = Math.floor(randomUnit() * (index + 1));
        [next[index], next[other]] = [next[other], next[index]];
      }
      return next;
    };
    let bag = [];
    let seen = new Set();
    let lastPair = [];
    let cycle = 0;
    const refillBag = () => {
      const indices = STARTER_ASSAYS.map((_, index) => index);
      const shuffled = shuffle(indices);
      const next = lastPair.length === 2
        ? [
            ...shuffled.filter(index => !lastPair.includes(index)),
            ...shuffled.filter(index => lastPair.includes(index))
          ]
        : shuffled;
      bag = next;
      seen = new Set();
      cycle += 1;
    };
    const drawPair = () => {
      if (bag.length < 2) refillBag();
      const pair = [bag.shift(), bag.shift()];
      pair.forEach(index => seen.add(index));
      lastPair = pair;
      return pair;
    };
    applyPrompt(baseButtons[0], ['Follow a memory', 'Help me find words for a memory I am carrying.']);
    applyPrompt(baseButtons[1], ['Meet the Ash Moon', 'Tell me a story of the Ash Moon, within the authored mythology of Marrowline.']);
    const rotate = doc.createElement('button');
    rotate.type = 'button';
    rotate.className = 'starter-rotate';
    rotate.textContent = '🗘';
    rotate.title = `Shuffle ${STARTER_ASSAYS.length} Marrowline prompts without repeats`;
    rotate.setAttribute('aria-label', `Shuffle ${STARTER_ASSAYS.length} Marrowline prompts without repeats`);
    rotate.addEventListener('click', () => {
      const [first, second] = drawPair();
      applyPrompt(baseButtons[0], STARTER_ASSAYS[first]);
      applyPrompt(baseButtons[1], STARTER_ASSAYS[second]);
      rotate.dataset.shuffleCycle = String(cycle);
      rotate.dataset.seenCount = String(seen.size);
      rotate.title = `Rupture shuffle · ${seen.size} of ${STARTER_ASSAYS.length} seen this cycle`;
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

  row.append(promptLabel);
  // One compact action row: attachment and Send together on the left; the
  // conversation utilities remain together at the right.
  const actionRow = form.querySelector('.composer-actions');
  const sendButton = byId(doc, 'khonapolitSend');
  if (actionRow && sendButton) actionRow.insertBefore(plus, sendButton);
  else row.prepend(plus);

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
  fileInput.id = 'marrowlineComposerFileInput';
  fileInput.type = 'file'; fileInput.multiple = true; fileInput.hidden = true;
  fileInput.accept = '.txt,.md,.markdown,.csv,.json,.pdf,text/plain,text/markdown,text/csv,application/json,application/pdf';
  const photoInput = doc.createElement('input');
  photoInput.id = 'marrowlineComposerPhotoInput';
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

function installConversationUtilityRail(doc, root) {
  const composer = doc.querySelector('.composer-actions');
  const legacyActions = doc.querySelector('.conversation-actions');
  const retryLegacy = byId(doc, 'retryKhonapolitTask');
  const copyLegacy = byId(doc, 'copyKhonapolitTranscript');
  const clearLegacy = byId(doc, 'clearKhonapolitSession');
  if (!composer || !legacyActions || !retryLegacy || !copyLegacy || !clearLegacy || byId(doc, 'marrowlineConversationUtilities')) return false;

  // Retain the established runtime handlers behind a quieter human surface.
  // Advanced Seal remains programmatic/receipt-side rather than competing with
  // the three everyday conversation utilities.
  legacyActions.hidden = true;
  legacyActions.setAttribute('aria-hidden', 'true');
  legacyActions.open = false;

  const rail = doc.createElement('div');
  rail.id = 'marrowlineConversationUtilities';
  rail.className = 'marrowline-conversation-utilities';
  rail.setAttribute('aria-label', 'Conversation utilities');

  const utility = (id, glyph, label) => {
    const button = doc.createElement('button');
    button.id = id;
    button.className = 'marrowline-utility-action';
    button.type = 'button';
    button.textContent = glyph;
    button.title = label;
    button.setAttribute('aria-label', label);
    return button;
  };

  const retry = utility('marrowlineRetryLast', '↻', 'Retry last prompt');
  const copy = utility('marrowlineCopyConversation', '⧉', 'Copy conversation as plain text');
  const clear = utility('marrowlineSessionClear', '✕', 'Clear conversation');

  const backdrop = doc.createElement('div');
  backdrop.id = 'marrowlineClearBackdrop';
  backdrop.className = 'marrowline-clear-backdrop';
  backdrop.hidden = true;

  const confirm = doc.createElement('div');
  confirm.id = 'marrowlineClearConfirmation';
  confirm.className = 'marrowline-clear-confirmation';
  confirm.hidden = true;
  confirm.setAttribute('role', 'dialog');
  confirm.setAttribute('aria-modal', 'true');
  confirm.setAttribute('aria-label', 'Clear conversation?');
  const question = doc.createElement('span');
  question.textContent = 'Clear conversation?';
  const actions = doc.createElement('span');
  actions.className = 'marrowline-clear-confirmation-actions';
  const yes = doc.createElement('button');
  yes.type = 'button'; yes.textContent = 'Yes'; yes.setAttribute('aria-label', 'Yes, clear conversation');
  const no = doc.createElement('button');
  no.type = 'button'; no.textContent = 'No'; no.setAttribute('aria-label', 'No, keep conversation');
  actions.append(yes, no);
  confirm.append(question, actions);

  const closeConfirm = ({ focus = false } = {}) => {
    confirm.hidden = true;
    backdrop.hidden = true;
    doc.body.dataset.clearConversationModal = 'false';
    clear.setAttribute('aria-expanded', 'false');
    if (focus) clear.focus?.({ preventScroll: true });
  };
  const openConfirm = () => {
    backdrop.hidden = false;
    confirm.hidden = false;
    doc.body.dataset.clearConversationModal = 'true';
    clear.setAttribute('aria-expanded', 'true');
    no.focus?.({ preventScroll: true });
  };
  clear.setAttribute('aria-haspopup', 'dialog');
  clear.setAttribute('aria-expanded', 'false');
  clear.setAttribute('aria-controls', confirm.id);

  retry.addEventListener('click', () => {
    // Corner ↻ is an independent operator gesture, not the cooldown-gated
    // in-card action. Only the terminal's in-flight guard can decline it.
    doc.dispatchEvent(new (root.CustomEvent || doc.defaultView.CustomEvent)('td613:marrowline:retry-independent'));
  });
  copy.addEventListener('click', () => copyLegacy.click());
  clear.addEventListener('click', () => confirm.hidden ? openConfirm() : closeConfirm({ focus: true }));
  yes.addEventListener('click', () => {
    closeConfirm();
    clearLegacy.click();
  });
  no.addEventListener('click', () => closeConfirm({ focus: true }));
  backdrop.addEventListener('click', () => closeConfirm({ focus: true }));
  doc.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !confirm.hidden) closeConfirm({ focus: true });
  });

  rail.append(retry, copy, clear);
  composer.append(rail);
  doc.body.append(backdrop, confirm);

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
  installConversationUtilityRail(doc, root);
  installTranscriptCustody(doc, root);
  installDesktopInstrumentTabs(doc, root);
  doc.documentElement.dataset.marrowlineDesktopRepair = MARROWLINE_DESKTOP_REPAIR_VERSION;
  root.__TD613_MARROWLINE_DESKTOP_REPAIR__ = Object.freeze({
    version: MARROWLINE_DESKTOP_REPAIR_VERSION,
    state: 'ACTIVE',
    conversationChrome: 'send-left-retry-copy-clear-right',
    operatorSeal: 'receipt-instrument-explicit-operator'
  });
  return root.__TD613_MARROWLINE_DESKTOP_REPAIR__;
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => installMarrowlineDesktopRepair(document, window), { once: true });
  else installMarrowlineDesktopRepair(document, window);
}