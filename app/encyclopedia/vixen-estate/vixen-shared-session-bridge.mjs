/**
 * Vixen Cybernetics · Cross-Page Session & Corpus Bridge
 *
 * Coordinates read-only navigation, Research Cart tray IDs, Salon Manifesto
 * drafts, Presentation Synthesis Ledger snapshots, and explicit Podium
 * excursion/restore state across standalone Opera destinations:
 *   - /encyclopedia/vix-cyb.html
 *   - /encyclopedia/vix-cyb/podium.html
 *   - /encyclopedia/vix-cyb/human-podium.html
 *
 * Source-integrity law: NEVER duplicates the canonical 600 KB #vixen-corpus-bundle
 * into secondary files. Loads canonical JSON directly from ../vix-cyb.html over
 * same-origin HTTP when a standalone Podium page boots, and keeps every
 * browser-side state transition unprivileged (empirical_replication_credit: 0).
 */

export const TRAY_STORAGE_KEY = 'vixen.study_tray.v1';
export const SALON_MANIFESTO_STORAGE_KEY = 'vixen.salon_manifesto.v1';
export const SYNTHESIS_LOG_STORAGE_KEY = 'vixen.synthesis_log.v1';
export const PODIUM_EXCURSION_STORAGE_KEY = 'vixen.podium.excursion.v1';

function storage() {
  try {
    return typeof window !== 'undefined' && window.sessionStorage ? window.sessionStorage : null;
  } catch (_) {
    return null;
  }
}

function safeReadJson(key, fallback = null) {
  const st = storage();
  if (!st) return fallback;
  try {
    const raw = st.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_) {
    return fallback;
  }
}

function safeWriteJson(key, value) {
  const st = storage();
  if (!st) return false;
  try {
    if (value === null || value === undefined) st.removeItem(key);
    else st.setItem(key, JSON.stringify(value));
    return true;
  } catch (_) {
    return false;
  }
}

export function readSharedStudyTray() {
  const parsed = safeReadJson(TRAY_STORAGE_KEY, []);
  return Array.isArray(parsed) ? [...new Set(parsed.filter((x) => typeof x === 'string' && x.length > 0))] : [];
}

export function writeSharedStudyTray(ids) {
  const clean = Array.isArray(ids) ? [...new Set(ids.filter((x) => typeof x === 'string' && x.length > 0))] : [];
  safeWriteJson(TRAY_STORAGE_KEY, clean);
  return clean;
}

export function readSalonManifestoDraft() {
  const parsed = safeReadJson(SALON_MANIFESTO_STORAGE_KEY, null);
  return parsed && typeof parsed === 'object' ? parsed : null;
}

export function saveSalonManifestoDraft(draft) {
  if (!draft || typeof draft !== 'object') return false;
  return safeWriteJson(SALON_MANIFESTO_STORAGE_KEY, {
    ...draft,
    saved_at: new Date().toISOString()
  });
}

export function readSharedSynthesisState() {
  const parsed = safeReadJson(SYNTHESIS_LOG_STORAGE_KEY, null);
  return parsed && typeof parsed === 'object' && parsed.schema === 'emstd613.vixen.shared-synthesis/v1'
    ? parsed
    : null;
}

export function saveSharedSynthesisState(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return false;
  return safeWriteJson(SYNTHESIS_LOG_STORAGE_KEY, {
    schema: 'emstd613.vixen.shared-synthesis/v1',
    saved_at: new Date().toISOString(),
    ...snapshot
  });
}

export function readPodiumExcursionSnapshot() {
  const parsed = safeReadJson(PODIUM_EXCURSION_STORAGE_KEY, null);
  return parsed && typeof parsed === 'object' && parsed.version === 1 ? parsed : null;
}

export function savePodiumExcursionSnapshot(snap) {
  if (!snap || typeof snap !== 'object') return false;
  return safeWriteJson(PODIUM_EXCURSION_STORAGE_KEY, {
    version: 1,
    saved_at: new Date().toISOString(),
    ...snap
  });
}

export function clearPodiumExcursionSnapshot() {
  return safeWriteJson(PODIUM_EXCURSION_STORAGE_KEY, null);
}

/**
 * Extracts #vixen-corpus-bundle and #vixen-reference-manifest from ../vix-cyb.html
 * without duplicating canonical corpus bytes on disk.
 */
export async function ensureCanonicalCorpusDom({ vixHtmlUrl = '../vix-cyb.html' } = {}) {
  let corpusEl = document.getElementById('vixen-corpus-bundle');
  let manifestEl = document.getElementById('vixen-reference-manifest');
  if (!corpusEl || !manifestEl) {
    const res = await fetch(vixHtmlUrl, { cache: 'no-store' });
    if (!res.ok) throw new Error('CANONICAL_CORPUS_FETCH_FAILED_' + res.status);
    const html = await res.text();
    if (!corpusEl) {
      const m = html.match(/<script[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/);
      if (!m) throw new Error('MISSING_CANONICAL_CORPUS_BUNDLE');
      corpusEl = document.createElement('script');
      corpusEl.id = 'vixen-corpus-bundle';
      corpusEl.type = 'application/json';
      corpusEl.textContent = m[1];
      document.head.append(corpusEl);
    }
    if (!manifestEl) {
      const m = html.match(/<script[^>]*id="vixen-reference-manifest"[^>]*>([\s\S]*?)<\/script>/);
      if (m) {
        manifestEl = document.createElement('script');
        manifestEl.id = 'vixen-reference-manifest';
        manifestEl.type = 'application/json';
        manifestEl.textContent = m[1];
        document.head.append(manifestEl);
      }
    }
  }
  const corpus = JSON.parse(corpusEl.textContent);
  const manifest = manifestEl ? JSON.parse(manifestEl.textContent) : {};
  return { corpus, manifest };
}

export function buildCorpusLookup(corpus) {
  const byId = new Map();
  for (const w of corpus?.works || []) {
    byId.set(w.work_id, {
      id: w.work_id,
      type: 'Work',
      title: w.display_title || w.declared_title,
      sub: w.cluster + ' · ' + (w.linked_sources?.map((s) => s.original_filename).join(' · ') || w.identity_status)
    });
  }
  for (const inst of corpus?.instruments || []) {
    byId.set(inst.instrument_id, {
      id: inst.instrument_id,
      type: 'Method',
      title: inst.instrument_id,
      sub: (inst.family || 'PROTOCOL') + ' · ' + (inst.declared_status || '')
    });
  }
  for (const t of corpus?.giveback_tracks || []) {
    byId.set(t.id, {
      id: t.id,
      type: 'Track',
      title: t.title || t.id,
      sub: 'Giveback Track'
    });
  }
  return byId;
}
