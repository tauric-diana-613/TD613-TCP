import { peekLastConsumedLoomAiHandoff, createPortableLoomAiPacket } from './holonomy-loom/ai-handoff.js';

export const MARROWLINE_LOOM_POCKET_VERSION = 'td613.dome-world.marrowline-loom-pocket/v0.1';
export const MARROWLINE_LOOM_POCKET_SCHEMA = 'td613.dome-world.marrowline-loom-pocket-receipt/v0.1';

const STYLE_ID = 'marrowline-loom-pocket-style';
const READY_EVENT = 'td613:marrowline:loom-pocket-ready';

function byId(doc, id) { return doc.getElementById(id); }
function countLabel(count, singular, plural = `${singular}s`) { return `${count} ${count === 1 ? singular : plural}`; }

function installStyle(doc) {
  if (!doc?.head || byId(doc, STYLE_ID)) return;
  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
#loomImportedWorkspace:not([data-aia-pocket-open="true"]){display:none!important}
#speakingPanel[data-loom-pocket-host="true"]{position:relative}
#khonapolitForm[data-loom-pocket-composer="true"]{z-index:70}
.marrowline-aia-pocket-control{position:relative;z-index:72;display:flex;align-items:center;gap:7px;order:0;flex:none}
.marrowline-aia-plus{display:inline-grid;place-items:center;width:44px;height:44px;min-width:44px;padding:0;border:1px solid rgba(155,222,197,.48);border-radius:50%;background:rgba(31,52,60,.78);color:#e8f5ec;font:400 25px/1 var(--sans,system-ui,sans-serif);text-transform:none;letter-spacing:0;box-shadow:inset 0 0 0 1px rgba(255,255,255,.025)}
.marrowline-aia-plus:hover,.marrowline-aia-plus:focus-visible{border-color:#9fe4cc;background:rgba(50,83,83,.9)}
.marrowline-aia-plus::after{content:'';position:absolute;right:1px;top:1px;width:9px;height:9px;border-radius:50%;background:#9fe4cc;box-shadow:0 0 14px rgba(159,228,204,.8)}
.marrowline-aia-ready-label{color:#a9cabd;font:600 10px/1.25 var(--sans,system-ui,sans-serif);letter-spacing:.04em;white-space:nowrap}
.marrowline-aia-menu{position:absolute;left:0;bottom:calc(100% + 10px);z-index:75;display:grid;gap:4px;width:min(330px,calc(100vw - 30px));max-height:min(54dvh,440px);overflow:auto;padding:11px;border:1px solid rgba(150,213,191,.42);border-radius:16px;background:#211a46f7;box-shadow:0 18px 64px rgba(0,0,0,.62);overscroll-behavior:contain}
.marrowline-aia-menu[hidden]{display:none!important}
.marrowline-aia-menu-head{display:grid;gap:3px;padding:6px 8px 10px;border-bottom:1px solid rgba(255,255,255,.08)}
.marrowline-aia-menu-head small{color:#91d8c0;font:700 9px/1.3 var(--sans,system-ui,sans-serif);letter-spacing:.12em;text-transform:uppercase}
.marrowline-aia-menu-head strong{color:#f0f3e8;font:650 14px/1.35 var(--sans,system-ui,sans-serif)}
.marrowline-aia-menu-head p{margin:0;color:#b6c9bd;font:400 11px/1.55 var(--sans,system-ui,sans-serif)}
.marrowline-aia-menu button,.marrowline-aia-menu a{display:grid!important;justify-items:start!important;gap:2px!important;width:100%;min-height:48px!important;margin:0!important;padding:10px 11px!important;border:0!important;border-radius:10px!important;background:transparent!important;color:#edf3ec!important;text-align:left!important;text-decoration:none!important;font:600 12px/1.35 var(--sans,system-ui,sans-serif)!important;letter-spacing:0!important;text-transform:none!important}
.marrowline-aia-menu button:hover,.marrowline-aia-menu button:focus-visible,.marrowline-aia-menu a:hover,.marrowline-aia-menu a:focus-visible{background:rgba(126,183,165,.13)!important;outline:1px solid rgba(159,228,204,.35)!important;outline-offset:0!important}
.marrowline-aia-menu button span,.marrowline-aia-menu a span{color:#9fb8ab;font:400 10px/1.45 var(--sans,system-ui,sans-serif)}
#loomImportedWorkspace[data-aia-pocket-open="true"]{position:absolute!important;z-index:38;left:clamp(10px,2vw,22px)!important;right:clamp(10px,2vw,22px)!important;bottom:calc(var(--marrowline-pocket-composer-height,180px) + 10px)!important;width:auto!important;max-height:min(64%,580px)!important;margin:0!important;overflow:auto!important;overscroll-behavior:contain;scrollbar-gutter:stable;box-shadow:0 22px 80px rgba(0,0,0,.72)!important}
#loomImportedWorkspace[data-aia-pocket-open="true"] .loom-import-close{position:sticky;top:0;z-index:4;float:none!important;margin:0 0 8px auto!important;background:#201a46f2!important;backdrop-filter:blur(10px)}
@media(max-width:860px){
  .marrowline-aia-ready-label{display:none}
  #khonapolitForm[data-loom-pocket-composer="true"]{position:relative;z-index:90}
  .marrowline-aia-pocket-control{z-index:92}
  .marrowline-aia-menu{z-index:95;left:0;right:auto;width:min(330px,calc(100vw - 30px));max-height:min(52dvh,410px)}
  #loomImportedWorkspace[data-aia-pocket-open="true"]{left:8px!important;right:8px!important;bottom:calc(var(--marrowline-pocket-composer-height,190px) + 8px)!important;max-height:min(55%,440px)!important;border-radius:18px!important}
}
`;
  doc.head.append(style);
}

function setTerminalStatus(doc, message) {
  const status = byId(doc, 'khonapolitTerminalStatus');
  if (status) status.textContent = message;
}

function stagedPacket() {
  try { return peekLastConsumedLoomAiHandoff(); }
  catch { return null; }
}

function portableInput(packet) {
  return {
    task: packet.task,
    documents: packet.documents,
    rules: packet.rules,
    governance: packet.governance
  };
}

function exportPortable(packet, doc, environment) {
  const payload = createPortableLoomAiPacket(portableInput(packet));
  const BlobCtor = environment.Blob ?? doc.defaultView?.Blob;
  const URLApi = environment.URL ?? doc.defaultView?.URL;
  if (!BlobCtor || !URLApi?.createObjectURL) throw new Error('Export unavailable in this browser');
  const url = URLApi.createObjectURL(new BlobCtor([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' }));
  const link = doc.createElement('a');
  link.href = url;
  link.download = 'loom-portable-aia.json';
  doc.body.append(link);
  link.click();
  link.remove();
  (environment.setTimeout ?? setTimeout)(() => URLApi.revokeObjectURL(url), 1000);
  return payload;
}

function menuButton(doc, id, label, help) {
  const button = doc.createElement('button');
  button.type = 'button';
  button.id = id;
  button.setAttribute('role', 'menuitem');
  button.append(doc.createTextNode(label));
  const note = doc.createElement('span'); note.textContent = help; button.append(note);
  return button;
}

function closeMenu(toggle, menu) {
  menu.hidden = true;
  toggle.setAttribute('aria-expanded', 'false');
}

function pocketize(root, packet, doc, environment) {
  if (!root || !packet || root.dataset.aiaPocketReady === 'true') return false;
  const form = byId(doc, 'khonapolitForm');
  const actions = form?.querySelector('.composer-actions');
  const host = byId(doc, 'speakingPanel');
  if (!form || !actions || !host) return false;

  root.dataset.aiaPocketReady = 'true';
  root.dataset.aiaPocketOpen = 'false';
  root.hidden = true;
  form.dataset.loomPocketComposer = 'true';
  host.dataset.loomPocketHost = 'true';
  host.append(root);
  doc.documentElement.dataset.loomTaskImport = 'staged';

  const close = root.querySelector('.loom-import-close');
  if (close) {
    close.textContent = 'Back to Marrowline chat';
    close.setAttribute('aria-label', 'Back to Marrowline chat');
  }

  const control = doc.createElement('div');
  control.className = 'marrowline-aia-pocket-control';
  control.id = 'marrowlineAiaPocket';

  const toggle = doc.createElement('button');
  toggle.type = 'button';
  toggle.id = 'marrowlineAiaToggle';
  toggle.className = 'marrowline-aia-plus';
  toggle.textContent = '＋';
  toggle.setAttribute('aria-haspopup', 'menu');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'marrowlineAiaMenu');
  toggle.setAttribute('aria-label', 'Loom context ready. Open context menu.');

  const readyLabel = doc.createElement('span');
  readyLabel.className = 'marrowline-aia-ready-label';
  readyLabel.textContent = 'Loom ready';

  const menu = doc.createElement('div');
  menu.id = 'marrowlineAiaMenu';
  menu.className = 'marrowline-aia-menu';
  menu.setAttribute('role', 'menu');
  menu.hidden = true;

  const head = doc.createElement('div'); head.className = 'marrowline-aia-menu-head';
  const kicker = doc.createElement('small'); kicker.textContent = 'Brought from Loom';
  const title = doc.createElement('strong'); title.textContent = 'Your Loom context is ready';
  const description = doc.createElement('p');
  description.id = 'marrowlineAiaSummary';
  description.textContent = `${countLabel(packet.documents.length, 'selected file')} · ${countLabel(packet.rules.length, 'rule')}. Nothing is sent until you choose an action.`;
  head.append(kicker, title, description);

  const continueButton = menuButton(doc, 'marrowlineAiaContinue', 'Continue the Loom task', 'Open the selected task, files and rules here. Run remains a separate gesture.');
  const reviewButton = menuButton(doc, 'marrowlineAiaReview', 'Review what came over', 'Inspect the transferred task and selected material without sending anything.');
  const exportButton = menuButton(doc, 'marrowlineAiaExport', 'Export Loom AIA', 'Download the selected task, files, rules and portable assurance.');
  const returnLink = doc.createElement('a');
  returnLink.id = 'marrowlineAiaReturn';
  returnLink.href = '/dome-world/holonomy-loom.html';
  returnLink.setAttribute('role', 'menuitem');
  returnLink.append(doc.createTextNode('Add or change files in Loom'));
  const returnNote = doc.createElement('span'); returnNote.textContent = 'Loom owns document intake; come back here with Continue in Marrowline when ready.'; returnLink.append(returnNote);

  menu.append(head, continueButton, reviewButton, exportButton, returnLink);
  control.append(toggle, readyLabel, menu);
  actions.prepend(control);

  const updateInset = () => {
    const height = Math.ceil(form.getBoundingClientRect?.().height || 180);
    host.style.setProperty('--marrowline-pocket-composer-height', `${Math.max(120, height)}px`);
  };
  updateInset();
  const ResizeObserverCtor = environment.ResizeObserver;
  const resizeObserver = typeof ResizeObserverCtor === 'function' ? new ResizeObserverCtor(updateInset) : null;
  resizeObserver?.observe(form);
  environment.visualViewport?.addEventListener?.('resize', updateInset);
  environment.addEventListener?.('resize', updateInset);

  const openWorkspace = ({ review = false } = {}) => {
    closeMenu(toggle, menu);
    updateInset();
    root.hidden = false;
    root.dataset.aiaPocketOpen = 'true';
    doc.documentElement.dataset.loomTaskImport = 'active';
    const status = root.querySelector('[role=status]');
    if (review && status) status.textContent = 'Review only. Nothing has been sent. Run with Flow-Core AI remains a separate action.';
    if (review) {
      const docs = byId(doc, 'loomImportedDocuments'); if (docs) docs.open = true;
      const rules = byId(doc, 'loomImportedRules'); if (rules) rules.open = true;
    }
    const target = review ? (byId(doc, 'loomImportedBoundary') || root) : (root.querySelector('h2') || root);
    target?.focus?.({ preventScroll: true });
    root.scrollTop = 0;
    setTerminalStatus(doc, review ? 'LOOM CONTEXT OPEN · review only · no AI request made' : 'LOOM CONTEXT OPEN · Run remains a separate operator gesture');
  };

  toggle.addEventListener('click', () => {
    const opening = menu.hidden;
    menu.hidden = !opening;
    toggle.setAttribute('aria-expanded', String(opening));
    if (opening) menu.querySelector('[role=menuitem]')?.focus?.();
  });
  continueButton.addEventListener('click', () => openWorkspace({ review: false }));
  reviewButton.addEventListener('click', () => openWorkspace({ review: true }));
  exportButton.addEventListener('click', () => {
    try {
      exportPortable(packet, doc, environment);
      closeMenu(toggle, menu);
      setTerminalStatus(doc, 'LOOM AIA EXPORTED · no provider request was made');
      toggle.focus?.();
    } catch (error) {
      setTerminalStatus(doc, `LOOM AIA EXPORT HELD · ${error.message}`);
    }
  });

  root.addEventListener('click', (event) => {
    if (!event.target?.closest?.('.loom-import-close')) return;
    root.dataset.aiaPocketOpen = 'false';
    doc.documentElement.dataset.loomTaskImport = 'staged';
    setTerminalStatus(doc, 'LOOM CONTEXT STAGED · open ＋ when you want it again');
    toggle.focus?.();
  });
  doc.addEventListener('click', (event) => {
    if (menu.hidden || control.contains(event.target)) return;
    closeMenu(toggle, menu);
  });
  doc.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (!menu.hidden) { closeMenu(toggle, menu); toggle.focus?.(); return; }
    if (root.dataset.aiaPocketOpen === 'true') {
      root.hidden = true;
      root.dataset.aiaPocketOpen = 'false';
      doc.documentElement.dataset.loomTaskImport = 'staged';
      setTerminalStatus(doc, 'LOOM CONTEXT STAGED · open ＋ when you want it again');
      toggle.focus?.();
    }
  });

  const receipt = Object.freeze({
    schema: MARROWLINE_LOOM_POCKET_SCHEMA,
    version: MARROWLINE_LOOM_POCKET_VERSION,
    state: 'READY',
    source: 'consumed-local-loom-handoff',
    selectedDocumentCount: packet.documents.length,
    ruleCount: packet.rules.length,
    arrivalAction: 'NONE',
    providerRequestOnArrival: false,
    availableActions: Object.freeze(['CONTINUE', 'REVIEW', 'EXPORT', 'RETURN_TO_LOOM']),
    claimCeiling: 'valid-consumed-loom-handoff-staged-for-human-operated-use; no-provider-request-until-separate-run; no-unselected-file-carriage; no-human-comprehension-claim',
    seal: '⟐'
  });
  environment.__TD613_MARROWLINE_LOOM_POCKET__ = receipt;
  environment.dispatchEvent?.(new CustomEvent(READY_EVENT, { detail: receipt }));
  setTerminalStatus(doc, `LOOM CONTEXT READY · ${countLabel(packet.documents.length, 'selected file')} · open ＋ to continue`);
  return true;
}

export function installMarrowlineLoomPocket(doc = document, environment = window) {
  installStyle(doc);
  const attempt = () => {
    const root = byId(doc, 'loomImportedWorkspace');
    const packet = stagedPacket();
    return root?.hasAttribute('data-loom-import-workspace') && packet ? pocketize(root, packet, doc, environment) : false;
  };
  if (attempt()) return true;
  const Observer = environment.MutationObserver;
  if (typeof Observer !== 'function') return false;
  const observer = new Observer(() => { if (attempt()) observer.disconnect(); });
  observer.observe(doc.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-loom-import-workspace'] });
  environment.__TD613_MARROWLINE_LOOM_POCKET_OBSERVER__ = observer;
  return true;
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') installMarrowlineLoomPocket(document, window);
