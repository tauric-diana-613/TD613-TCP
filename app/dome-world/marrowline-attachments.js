export const MARROWLINE_ATTACHMENT_SCHEMA = 'td613.marrowline.attachment/v0.1';
export const MARROWLINE_ATTACHMENT_STATE_SCHEMA = 'td613.marrowline.attachment-state/v0.1';
export const MARROWLINE_ATTACHMENT_LIMITS = Object.freeze({
  count: 6,
  totalBytes: 2_500_000,
  singleBytes: 1_500_000
});

const FILE_MIMES = new Set([
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/json',
  'application/pdf'
]);
const PHOTO_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/gif'
]);
const EXTENSION_MIMES = Object.freeze({
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.markdown': 'text/markdown',
  '.csv': 'text/csv',
  '.json': 'application/json',
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
  '.gif': 'image/gif'
});
const CHANGE_EVENT = 'td613:marrowline:attachments-changed';
const STYLE_ID = 'marrowline-attachment-style';
let attachments = [];

const copy = value => JSON.parse(JSON.stringify(value));
const formatBytes = value => value < 1024 ? `${value} B` : value < 1024 * 1024 ? `${Math.ceil(value / 1024)} KB` : `${(value / (1024 * 1024)).toFixed(1)} MB`;

function inferredMime(file = {}) {
  const declared = String(file.type || '').trim().toLowerCase();
  if (declared) return declared;
  const name = String(file.name || '').toLowerCase();
  const extension = Object.keys(EXTENSION_MIMES).find(key => name.endsWith(key));
  return extension ? EXTENSION_MIMES[extension] : '';
}

function validKindMime(kind, mime) {
  return kind === 'photo' ? PHOTO_MIMES.has(mime) : kind === 'file' ? FILE_MIMES.has(mime) : false;
}

function cleanName(value = '') {
  const name = String(value || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 240);
  return name || 'untitled-attachment';
}

function makeId(environment = globalThis) {
  const random = environment.crypto?.randomUUID?.().replace(/-/g, '') || Math.random().toString(16).slice(2).padEnd(24, '0');
  return `att_${random.slice(0, 32)}`;
}

async function fileBase64(file, environment = globalThis) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = '';
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
  const encode = environment.btoa?.bind(environment) || globalThis.btoa?.bind(globalThis);
  if (!encode) throw new Error('This browser cannot encode the selected attachment.');
  return encode(binary);
}

function notify(environment = globalThis) {
  const detail = attachmentState();
  if (typeof environment.CustomEvent === 'function') environment.dispatchEvent?.(new environment.CustomEvent(CHANGE_EVENT, { detail }));
  return detail;
}

export function attachmentState() {
  const summaries = attachments.map(({ data_base64, ...summary }) => Object.freeze({ ...summary }));
  return Object.freeze({
    schema: MARROWLINE_ATTACHMENT_STATE_SCHEMA,
    count: summaries.length,
    total_bytes: summaries.reduce((sum, item) => sum + item.size_bytes, 0),
    attachments: Object.freeze(summaries),
    storage: 'browser-memory-only-until-explicit-send',
    seal: '⟐'
  });
}

export function getMarrowlineAttachments() {
  return copy(attachments);
}

export function getMarrowlineAttachmentSummaries() {
  return attachmentState().attachments.map(item => ({ ...item }));
}

export async function stageMarrowlineAttachments(fileList, { kind = 'file', environment = globalThis } = {}) {
  const files = Array.from(fileList || []);
  if (!files.length) return attachmentState();
  if (!['file', 'photo'].includes(kind)) throw new TypeError('Attachment kind must be file or photo.');
  if (attachments.length + files.length > MARROWLINE_ATTACHMENT_LIMITS.count) throw new Error(`Marrowline can stage up to ${MARROWLINE_ATTACHMENT_LIMITS.count} attachments at once.`);

  const next = [];
  let total = attachments.reduce((sum, item) => sum + item.size_bytes, 0);
  for (const file of files) {
    const size = Number(file?.size || 0);
    const mime = inferredMime(file);
    if (!Number.isSafeInteger(size) || size <= 0) throw new Error('Empty attachments cannot be staged.');
    if (size > MARROWLINE_ATTACHMENT_LIMITS.singleBytes) throw new Error(`${cleanName(file?.name)} is larger than Marrowline’s 1.5 MB per-attachment limit.`);
    if (!validKindMime(kind, mime)) {
      throw new Error(kind === 'photo'
        ? 'Choose a JPEG, PNG, WebP, HEIC/HEIF, or GIF image.'
        : 'Choose a TXT, Markdown, CSV, JSON, or PDF file.');
    }
    total += size;
    if (total > MARROWLINE_ATTACHMENT_LIMITS.totalBytes) throw new Error('The staged attachments exceed Marrowline’s 2.5 MB total attachment limit.');
    const data_base64 = await fileBase64(file, environment);
    next.push({
      schema: MARROWLINE_ATTACHMENT_SCHEMA,
      id: makeId(environment),
      name: cleanName(file.name),
      kind,
      mime_type: mime,
      size_bytes: size,
      data_base64
    });
  }
  attachments = [...attachments, ...next];
  return notify(environment);
}

export function removeMarrowlineAttachment(id, environment = globalThis) {
  const before = attachments.length;
  attachments = attachments.filter(item => item.id !== id);
  if (attachments.length !== before) notify(environment);
  return attachmentState();
}

export function clearMarrowlineAttachments(environment = globalThis) {
  if (!attachments.length) return attachmentState();
  attachments = [];
  return notify(environment);
}

function installStyle(doc) {
  if (doc.getElementById(STYLE_ID)) return;
  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
#marrowlineAttachmentTray{position:relative;display:block;min-width:0;margin:0;padding:0}
#marrowlineAttachmentTray[hidden]{display:none!important}
#marrowlineAttachmentToggle{cursor:pointer}
.marrowline-attachment-menu{position:absolute;z-index:2147483150;left:0;bottom:calc(100% + 7px);width:min(330px,calc(100vw - 28px));max-height:min(42dvh,340px);overflow:auto;padding:7px;border:1px solid rgba(131,215,214,.4);border-radius:12px;background:#17132f;color:#d8e5df;box-shadow:0 22px 65px rgba(0,0,0,.72)}
.marrowline-attachment-menu[hidden]{display:none!important}
.marrowline-attachment-list{display:grid;gap:4px}
.marrowline-attachment-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:7px;align-items:center;min-width:0;padding:8px 7px;border-top:1px solid rgba(255,255,255,.06)}
.marrowline-attachment-row:first-child{border-top:0}
.marrowline-attachment-copy{display:grid;min-width:0;gap:2px}
.marrowline-attachment-copy b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#eef4f2;font:600 11px/1.25 var(--marrowline-chat-sans,system-ui,sans-serif)}
.marrowline-attachment-copy small{color:#9fb7b3;font:500 9px/1.25 var(--marrowline-chat-sans,system-ui,sans-serif)}
.marrowline-attachment-remove{display:inline-grid!important;place-items:center!important;width:28px!important;height:28px!important;min-width:28px!important;min-height:28px!important;margin:0!important;padding:0!important;border:0!important;border-radius:6px!important;background:transparent!important;color:#c6dcd2!important;font:700 15px/1 var(--marrowline-chat-sans,system-ui,sans-serif)!important;text-transform:none!important;letter-spacing:0!important}
.marrowline-attachment-remove:hover,.marrowline-attachment-remove:focus-visible{background:rgba(255,255,255,.08)!important;color:#fff!important}
`;
  doc.head.append(style);
}

export function installMarrowlineAttachmentTray(doc = document, environment = window) {
  installStyle(doc);
  const form = doc.getElementById('khonapolitForm');
  const actions = form?.querySelector('.composer-actions');
  if (!form || !actions) return false;
  let tray = doc.getElementById('marrowlineAttachmentTray');
  if (!tray) {
    tray = doc.createElement('div');
    tray.id = 'marrowlineAttachmentTray';
    tray.setAttribute('aria-label', 'Attachments staged for your next Marrowline message');
    tray.hidden = true;

    const toggle = doc.createElement('button');
    toggle.id = 'marrowlineAttachmentToggle';
    toggle.className = 'marrowline-attachment-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-haspopup', 'dialog');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'marrowlineAttachmentMenu');
    const glyph = doc.createElement('span');
    glyph.className = 'marrowline-thread-glyph';
    glyph.setAttribute('aria-hidden', 'true');
    glyph.textContent = '▱';
    const label = doc.createElement('span');
    label.textContent = 'Attachments';
    toggle.append(glyph, label);

    const menu = doc.createElement('div');
    menu.id = 'marrowlineAttachmentMenu';
    menu.className = 'marrowline-attachment-menu';
    menu.hidden = true;
    menu.setAttribute('role', 'dialog');
    menu.setAttribute('aria-label', 'Staged attachments');
    const list = doc.createElement('div');
    list.className = 'marrowline-attachment-list';
    menu.append(list);
    tray.append(toggle, menu);
    actions.before(tray);

    const close = () => {
      menu.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    };
    toggle.addEventListener('click', () => {
      const opening = menu.hidden;
      menu.hidden = !opening;
      toggle.setAttribute('aria-expanded', String(opening));
    });
    doc.addEventListener('click', event => {
      if (!menu.hidden && !tray.contains(event.target)) close();
    });
    doc.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !menu.hidden) {
        close();
        toggle.focus?.({ preventScroll: true });
      }
    });
  }

  const toggle = doc.getElementById('marrowlineAttachmentToggle');
  const menu = doc.getElementById('marrowlineAttachmentMenu');
  const list = menu?.querySelector('.marrowline-attachment-list');
  const status = doc.getElementById('khonapolitTerminalStatus');
  const render = () => {
    const state = attachmentState();
    const dispatching = status?.dataset.phase === 'pending';
    if (list) list.replaceChildren();
    tray.hidden = state.count === 0 || dispatching;
    if (tray.hidden && menu) {
      menu.hidden = true;
      toggle?.setAttribute('aria-expanded', 'false');
    }
    if (toggle) toggle.setAttribute('aria-label', `Open ${state.count} staged attachment${state.count === 1 ? '' : 's'}`);
    for (const item of state.attachments) {
      const row = doc.createElement('div');
      row.className = 'marrowline-attachment-row';
      row.dataset.attachmentId = item.id;
      const copy = doc.createElement('span');
      copy.className = 'marrowline-attachment-copy';
      const name = doc.createElement('b');
      name.textContent = item.name;
      const meta = doc.createElement('small');
      meta.textContent = `${item.kind === 'photo' ? 'Photo' : 'File'} · ${formatBytes(item.size_bytes)}`;
      copy.append(name, meta);
      const remove = doc.createElement('button');
      remove.type = 'button';
      remove.className = 'marrowline-attachment-remove';
      remove.textContent = '×';
      remove.setAttribute('aria-label', `Remove ${item.name}`);
      remove.addEventListener('click', () => removeMarrowlineAttachment(item.id, environment));
      row.append(copy, remove);
      list?.append(row);
    }
  };
  environment.addEventListener?.(CHANGE_EVENT, render);
  const Observer = environment.MutationObserver;
  if (status && typeof Observer === 'function') {
    const observer = new Observer(render);
    observer.observe(status, { attributes: true, attributeFilter: ['data-phase'] });
    environment.__TD613_MARROWLINE_ATTACHMENT_STATUS_OBSERVER__?.disconnect?.();
    environment.__TD613_MARROWLINE_ATTACHMENT_STATUS_OBSERVER__ = observer;
  }
  render();
  environment.__TD613_MARROWLINE_ATTACHMENT_STATE__ = () => attachmentState();
  return true;
}

export const MARROWLINE_ATTACHMENT_CHANGE_EVENT = CHANGE_EVENT;
