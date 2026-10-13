const VERSION = 'hush-lab-provider-sync/v1-output-field-bridge';
const $ = (id, doc = document) => doc.getElementById(id);
let lastSignature = '';
let syncTimer = null;
let syncing = false;

function text(value) {
  return String(value == null ? '' : value).trim();
}

function signature(doc = document) {
  return [
    text($('messageDraftInput', doc)?.value || ''),
    text($('maskFieldSelect', doc)?.value || ''),
    text($('protectedOutputInput', doc)?.value || '')
  ].join('\n---td613-lab-sync---\n');
}

function outputExists(doc = document) {
  return Boolean(text($('protectedOutputInput', doc)?.value || ''));
}

function markStatus(message, tone = 'info') {
  const status = $('hushStrictProviderStatus') || $('hushGeneratorStatus');
  if (!status) return;
  if (tone) status.dataset.labSyncTone = tone;
  status.dataset.labSync = message;
}

async function syncLab(doc = document) {
  if (syncing || !outputExists(doc)) return false;
  const current = signature(doc);
  if (!current || current === lastSignature) return false;
  const api = window.__TD613_HUSH_BENCH__;
  if (!api || typeof api.analyzeProtectedOutput !== 'function') return false;
  syncing = true;
  try {
    markStatus('syncing custody lab', 'info');
    await Promise.resolve(api.analyzeProtectedOutput(doc));
    if (typeof api.syncMaskMemoryGate === 'function') api.syncMaskMemoryGate();
    lastSignature = current;
    try {
      window.dispatchEvent(new CustomEvent('td613:hush:lab-synced', {
        detail: { version: VERSION, signature: current }
      }));
    } catch (_) {}
    return true;
  } catch (error) {
    window.__TD613_HUSH_LAB_SYNC_ERROR = String(error && error.stack || error);
    try {
      window.dispatchEvent(new CustomEvent('td613:hush:lab-sync-error', {
        detail: { version: VERSION, error: window.__TD613_HUSH_LAB_SYNC_ERROR }
      }));
    } catch (_) {}
    return false;
  } finally {
    syncing = false;
  }
}

function scheduleSync(doc = document, delay = 120) {
  window.clearTimeout(syncTimer);
  syncTimer = window.setTimeout(() => syncLab(doc), delay);
}

function bind(doc = document) {
  if (!doc?.body || doc.body.dataset.pageKind !== 'adversarial-bench' || doc.body.dataset.hushLabProviderSync === VERSION) return;
  doc.body.dataset.hushLabProviderSync = VERSION;
  const output = $('protectedOutputInput', doc);
  if (output) output.addEventListener('input', () => scheduleSync(doc, 160));
  window.addEventListener('td613:hush:provider-output', () => scheduleSync(doc, 40));
  window.addEventListener('td613:hush:outbound-packet', () => scheduleSync(doc, 220));
  if (outputExists(doc)) scheduleSync(doc, 420);
}

if (typeof document !== 'undefined') {
  const run = () => bind(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  [320, 900, 1800, 3200].forEach((delay) => window.setTimeout(run, delay));
}

window.__TD613_HUSH_LAB_PROVIDER_SYNC__ = { version: VERSION, syncLab, scheduleSync };
