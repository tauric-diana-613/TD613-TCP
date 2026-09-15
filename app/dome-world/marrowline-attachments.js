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
#marrowlineAttachmentTray{display:flex;align-items:center;gap:7px;flex-wrap:wrap;width:100%;margin:3px 0 7px;padding:0;min-height:0}
#marrowlineAttachmentTray[hidden]{display:none!important}
.marrowline-attachment-chip{display:inline-flex;align-items:center;gap:6px;max-width:min(100%,360px);min-height:34px;padding:5px 7px 5px 10px;border:1px solid rgba(159,228,204,.28);border-radius:999px;background:rgba(36,55,66,.72);color:#e8f4ed;font:500 11px/1.3 var(--sans,system-ui,sans-serif)}
.marrowline-attachment-chip b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:220px;font-weight:650}
.marrowline-attachment-chip small{color:#9fbeb2;font:500 9px/1.2 var(--sans,system-ui,sans-serif);white-space:nowrap}
.marrowline-attachment-remove{display:inline-grid!important;place-items:center!important;width:25px!important;height:25px!important;min-width:25px!important;min-height:25px!important;margin:0!important;padding:0!important;border:0!important;border-radius:50%!important;background:transparent!important;color:#c6dcd2!important;font:700 15px/1 var(--sans,system-ui,sans-serif)!important;text-transform:none!important;letter-spacing:0!important}
.marrowline-attachment-remove:hover,.marrowline-attachment-remove:focus-visible{background:rgba(255,255,255,.08)!important;color:#fff!important}
@media(max-width:860px){.marrowline-attachment-chip{max-width:100%}.marrowline-attachment-chip b{max-width:170px}}
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
    tray.setAttribute('aria-live', 'polite');
    tray.setAttribute('aria-label', 'Attachments staged for your next Marrowline message');
    tray.hidden = true;
    actions.before(tray);
  }
  const render = () => {
    const state = attachmentState();
    tray.replaceChildren();
    tray.hidden = state.count === 0;
    for (const item of state.attachments) {
      const chip = doc.createElement('span');
      chip.className = 'marrowline-attachment-chip';
      chip.dataset.attachmentId = item.id;
      const kind = doc.createElement('span'); kind.textContent = item.kind === 'photo' ? 'Photo' : 'File';
      const name = doc.createElement('b'); name.textContent = item.name;
      const size = doc.createElement('small'); size.textContent = formatBytes(item.size_bytes);
      const remove = doc.createElement('button');
      remove.type = 'button'; remove.className = 'marrowline-attachment-remove'; remove.textContent = '×';
      remove.setAttribute('aria-label', `Remove ${item.name}`);
      remove.addEventListener('click', () => removeMarrowlineAttachment(item.id, environment));
      chip.append(kind, name, size, remove);
      tray.append(chip);
    }
  };
  environment.addEventListener?.(CHANGE_EVENT, render);
  render();
  environment.__TD613_MARROWLINE_ATTACHMENT_STATE__ = () => attachmentState();
  return true;
}

export const MARROWLINE_ATTACHMENT_CHANGE_EVENT = CHANGE_EVENT;
