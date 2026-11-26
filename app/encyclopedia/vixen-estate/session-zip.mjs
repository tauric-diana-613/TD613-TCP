/**
 * 𝌋 Vixen Cybernetics · Zero-Dependency Portable Session ZIP Exporter.
 *
 * Pure ES module PKZIP (Store / method 0, IEEE 802.3 CRC-32, UTF-8 EFS flag 0x0800).
 * Packages the live browser state (`vixen-estate/podium-synthesis.json` &
 * `vixen-estate/session-state.json`), verbatim `vix-cyb.html`, the complete
 * `vixen-estate/` and `assets/vixen/` trees, same-origin `reference/` index/contract
 * assets, and `vix-cyb/llms.txt` + `SESSION_START_HERE.md` with ZERO external CDN
 * or network requests (`STANDALONE_EXTERNAL_RESOURCE_REQUESTS = 0`).
 *
 * Authority: READ_ONLY_SNAPSHOT. Exporting a session never grants release authority,
 * empirical replication credit, or remote source admission.
 */

import {inspectVixenPortableFidelity} from './vixen-portable-fidelity.mjs';

export const SESSION_ZIP_SCHEMA = 'emstd613.vixen.session-zip/v1';

const TEXT_ENCODER = new TextEncoder();

const CRC32_TABLE = (() => {
  const tbl = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    tbl[i] = c >>> 0;
  }
  return tbl;
})();

export function crc32Bytes(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function toUint8Array(data) {
  if (data instanceof Uint8Array) return data;
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView(data)) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  }
  return TEXT_ENCODER.encode(String(data ?? ''));
}

function encodeDosDateTime(dateInput) {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput || Date.now());
  const yr = Math.max(1980, Math.min(2107, d.getUTCFullYear())) - 1980;
  const mon = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  const hr = d.getUTCHours();
  const min = d.getUTCMinutes();
  const sec = Math.floor(d.getUTCSeconds() / 2);
  const dosTime = ((hr & 0x1f) << 11) | ((min & 0x3f) << 5) | (sec & 0x1f);
  const dosDate = ((yr & 0x7f) << 9) | ((mon & 0x0f) << 5) | (day & 0x1f);
  return { dosTime, dosDate };
}

/**
 * Builds a standards-compliant PKZIP archive (Store method 0, UTF-8 EFS bit)
 * from `{ path, data, mtime? }` entries. Pure JS, zero dependencies.
 * @param {Array<{path: string, data: Uint8Array|ArrayBuffer|string, mtime?: Date|string|number}>} entries
 * @returns {Uint8Array}
 */
export function buildVixenSessionZipBytes(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new TypeError('SESSION_ZIP_ENTRIES_REQUIRED');
  }
  const normalized = [];
  const seen = new Set();
  for (const item of entries) {
    const cleanPath = String(item?.path || '').replace(/\\/g, '/').replace(/^\/+/, '');
    if (!cleanPath || cleanPath.includes('..') || seen.has(cleanPath)) continue;
    seen.add(cleanPath);
    const nameBytes = TEXT_ENCODER.encode(cleanPath);
    const content = toUint8Array(item.data);
    const crc = crc32Bytes(content);
    const { dosTime, dosDate } = encodeDosDateTime(item.mtime);
    normalized.push({ path: cleanPath, nameBytes, content, crc, dosTime, dosDate });
  }

  let offset = 0;
  const localParts = [];
  const centralParts = [];

  for (const entry of normalized) {
    const nLen = entry.nameBytes.length;
    const cLen = entry.content.length;

    const lfh = new Uint8Array(30 + nLen);
    const lv = new DataView(lfh.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);       // version needed (2.0)
    lv.setUint16(6, 0x0800, true);   // UTF-8 filename flag
    lv.setUint16(8, 0, true);        // Store (method 0)
    lv.setUint16(10, entry.dosTime, true);
    lv.setUint16(12, entry.dosDate, true);
    lv.setUint32(14, entry.crc, true);
    lv.setUint32(18, cLen, true);
    lv.setUint32(22, cLen, true);
    lv.setUint16(26, nLen, true);
    lv.setUint16(28, 0, true);
    lfh.set(entry.nameBytes, 30);

    const cdh = new Uint8Array(46 + nLen);
    const cv = new DataView(cdh.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);       // version made by
    cv.setUint16(6, 20, true);       // version needed
    cv.setUint16(8, 0x0800, true);   // UTF-8 filename flag
    cv.setUint16(10, 0, true);       // Store
    cv.setUint16(12, entry.dosTime, true);
    cv.setUint16(14, entry.dosDate, true);
    cv.setUint32(16, entry.crc, true);
    cv.setUint32(20, cLen, true);
    cv.setUint32(24, cLen, true);
    cv.setUint16(28, nLen, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, offset, true);  // relative offset of local header
    cdh.set(entry.nameBytes, 46);

    localParts.push(lfh, entry.content);
    centralParts.push(cdh);
    offset += lfh.length + cLen;
  }

  let cdSize = 0;
  for (const part of centralParts) cdSize += part.length;

  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, normalized.length, true);
  ev.setUint16(10, normalized.length, true);
  ev.setUint32(12, cdSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true);

  const totalSize = offset + cdSize + eocd.length;
  const out = new Uint8Array(totalSize);
  let pos = 0;
  for (const part of localParts) { out.set(part, pos); pos += part.length; }
  for (const part of centralParts) { out.set(part, pos); pos += part.length; }
  out.set(eocd, pos);
  return out;
}

export const VIXEN_ESTATE_ASSET_PATHS = Object.freeze([
  'AGENTS.md',
  'corpus-experiment-a-part1.json',
  'corpus-experiment-a-part2.json',
  'corpus-experiment-a.mjs',
  'cross-opera-warrant.mjs',
  'dollhouse-design-grammar.mjs',
  'fox-house-dock.mjs',
  'glinda-cybergoth-rgi10.css',
  'glinda-luminous-proscenium-rgi12.css',
  'glinda-spectacle-rgi11.css',
  'observatory-computational-score.mjs',
  'observatory-electric-foundry.css',
  'observatory-electric-foundry.mjs',
  'observatory-foundry-kernel.mjs',
  'observatory-foundry-renderer.mjs',
  'observatory-foundry.frag',
  'observatory-open-form-protocol.mjs',
  'observatory-score-auditions.mjs',
  'observatory-vixen-corpus.mjs',
  'podium-composition-score.mjs',
  'podium-salon-optical-bridge.mjs',
  'manuscript-reader.mjs',
  'research-chamber.css',
  'research-chamber.mjs',
  'role-boundary.mjs',
  'semantic-semiotic-index.v1.json',
  'semantic-semiotic-search.mjs',
  'vixen-ai-session.mjs',
  'vixen-ai-conductor.mjs',
  'vixen-ai-journey.mjs',
  'vixen-local-exit.mjs',
  'vixen-portable-fidelity.mjs',
  'vixen-ai-journey.css',
  'vixen-opera-public-copy.mjs',
  'vixen-obsidian-reading-rgi26.css',
  'session-zip.mjs',
  'synthesis-salon-engine.mjs',
  'synthesis-salon.css',
  'synthesis-salon.mjs',
  'vixen-beat-radiometry-rgi15.mjs',
  'vixen-bias-cut-couture.css',
  'vixen-bias-draft.mjs',
  'vixen-desktop-manuscript-opera-rgi28.css',
  'vixen-electrical-breath-rgi13.css',
  'vixen-folded-cuirass.mjs',
  'vixen-foyer.css',
  'vixen-foyer.mjs',
  'vixen-live-mesh-rgi13.mjs',
  'vixen-mobile-manuscript-opera-rgi27.css',
  'vixen-mobile-reading-rgi17.css',
  'vixen-mobile-seams-rgi16.css',
  'vixen-motion-governor.mjs',
  'vixen-motion.css',
  'vixen-opaline-couture-rgi14.css',
  'vixen-opaline-couture-rgi14.mjs',
  'vixen-proscenium-seam.css',
  'vixen-redpen-couture-rgi18.css',
  'vixen-salon-ambient-field.mjs',
  'vixen-salon-light.mjs',
  'vixen-shared-session-bridge.mjs',
  'vixen-stage-architecture-rgi10b.css'
]);

export const VIXEN_BRAND_ASSET_PATHS = Object.freeze([
  'README.md',
  'asset-contract.json',
  'brand-assets.css',
  'fox-arcflash.svg',
  'frontispiece-desktop.png',
  'frontispiece-mobile.png'
]);

export const VIXEN_REFERENCE_CONTRACT_PATHS = Object.freeze([
  'directory.json',
  'graph.json',
  'intake-schema.json',
  'manifest.json',
  'vixen-operator-encounter.css',
  'vixen-operator-encounter.mjs',
  'vixen-podium.mjs',
  'vixen-read-gateway.mjs',
  'vixen-stage-boundary.mjs',
  'podium/manifest.json'
]);

export function buildSessionStartHereMd({ synthesisState, sessionMeta, exportedAt }) {
  const activeEntry = synthesisState?.active_entry_id || 'syn-0000-baseline';
  const seq = Number.isInteger(synthesisState?.synthesis_seq) ? synthesisState.synthesis_seq : 0;
  const headline = synthesisState?.synthesis_headline || {};
  const q = synthesisState?.operator_question || headline.researchQuestion || '(baseline estate question)';
  const m = synthesisState?.operator_method || 'BASELINE · Non-collapsing S ≠ W ≠ A constellation synthesis';
  const trayCount = Array.isArray(sessionMeta?.study_tray_work_ids) ? sessionMeta.study_tray_work_ids.length : 0;
  return [
    '# Vixen Cybernetics — Portable Session Archive',
    '',
    `- **Exported At (UTC):** \`${exportedAt}\``,
    `- **Active Synthesis Entry:** \`${activeEntry}\` (sequence \`${seq}\`)`,
    `- **Active Subtitle:** ${headline.patternSubtitle || 'UNIFIED SYNTHESIS CANDIDATE (ENGINE-DERIVED)'}`,
    `- **Research Question Meta:** ${headline.researchQuestionMeta || 'CONSTITUTIVE INQUIRY QUESTION · S ≠ W ≠ A · UNRATIFIED'}`,
    `- **Study Tray Selected Works:** \`${trayCount}\``,
    '- **Authority Ceiling:** `READ_ONLY_PORTABLE_SNAPSHOT` (`empirical_replication_credit: 0`, `release_authority: false`, `human_closure_required: true`)',
    '',
    '## Active Operator Question & Method',
    '',
    `- **Question:** ${q}`,
    `- **Method:** ${m}`,
    '',
    '## Quickstart for Human & AI Collaborator',
    '',
    '1. **Serve locally to view offline identically:** run `npx serve .` (or `python -m http.server 8000`) from this unpacked folder, then open `/encyclopedia/vix-cyb.html`. The page loads your live saved `encyclopedia/vixen-estate/podium-synthesis.json` immediately.',
    '2. **AI Operator Podium Instructions:** read `encyclopedia/vix-cyb/llms.txt` first for the complete computational machinery map (Observatory Vernier / SVD / [111] / XOR synergy, Synthesis Salon, 7 cross-domain conjectures, Podium 12-route schema, native engine slots, and non-retroactive synthesis log & `--rollback`).',
    '3. **Universal Edition 1.4 Retrieval Instructions:** read `encyclopedia/llms.txt` and `encyclopedia/reference/manifest.json` (`1,141` records; `2,131` typed graph edges).',
    '4. **Opera Boundary Law:** `OPERAHOUSE ≠ OPERA ≠ PERFORMER`. Never claim authorship resolution, empirical replication credit, or production closure without explicit human review. ⟐',
    ''
  ].join('\n');
}

async function fetchSameOriginBytes(fetcher, baseUrl, relPath) {
  if (typeof fetcher !== 'function') return null;
  let targetUrl;
  try {
    targetUrl = new URL(relPath, baseUrl);
    if (baseUrl.protocol !== 'file:' && targetUrl.origin !== baseUrl.origin) return null;
    if (!['http:', 'https:', 'file:'].includes(targetUrl.protocol)) return null;
  } catch (_) {
    return null;
  }
  try {
    const res = await fetcher(targetUrl.href, {
      method: 'GET',
      credentials: 'omit',
      cache: 'no-store'
    });
    if (!res || !res.ok) return null;
    const buf = await res.arrayBuffer();
    return new Uint8Array(buf);
  } catch (_) {
    return null;
  }
}

export async function collectVixenSessionFiles({
  baseHref = (typeof window !== 'undefined' && window.location?.href) || 'http://127.0.0.1/encyclopedia/vix-cyb.html',
  fetcher = typeof fetch === 'function' ? fetch.bind(globalThis) : null,
  documentRef = typeof document !== 'undefined' ? document : null,
  synthesisState = {},
  sessionMeta = {},
  aiJourneyArchive = null,
  exportedAt = new Date().toISOString()
} = {}) {
  const baseUrl = new URL(baseHref);
  const nowDate = new Date(exportedAt);
  const entries = [];
  const omitted = [];

  async function tryInclude(fetchRelPath, zipPath, fallbackBytes = null) {
    const bytes = await fetchSameOriginBytes(fetcher, baseUrl, fetchRelPath);
    if (bytes && bytes.length > 0) {
      entries.push({ path: zipPath, data: bytes, mtime: nowDate });
      return true;
    }
    if (fallbackBytes !== null) {
      entries.push({ path: zipPath, data: fallbackBytes, mtime: nowDate });
      return true;
    }
    omitted.push(zipPath);
    return false;
  }

  // 1. Live HTML entry page (verbatim fetch keeps corpus digest identical)
  const htmlFallback = documentRef?.documentElement?.outerHTML
    ? '<!doctype html>\n' + documentRef.documentElement.outerHTML
    : null;
  await tryInclude('./vix-cyb.html', 'encyclopedia/vix-cyb.html', htmlFallback);

  // 2. Live in-memory Podium synthesis & rollback log state
  const liveSynthesisJson = JSON.stringify(synthesisState || {}, null, 2) + '\n';
  entries.push({
    path: 'encyclopedia/vixen-estate/podium-synthesis.json',
    data: liveSynthesisJson,
    mtime: nowDate
  });

  // 3. Operator UI session metadata (tray IDs, gate flags, clock slider)
  const sessionStatePayload = {
    schema: 'emstd613.vixen.session-state/v1',
    exported_at: exportedAt,
    active_entry_id: synthesisState?.active_entry_id || 'syn-0000-baseline',
    synthesis_seq: Number.isInteger(synthesisState?.synthesis_seq) ? synthesisState.synthesis_seq : 0,
    ...sessionMeta,
    empirical_replication_credit: 0,
    human_closure_required: true,
    release_authority: false
  };

  // Portable visitor journey is an optional, explicitly user-triggered
  // inclusion in this existing session ZIP. Never ingest source bodies or
  // write a journey into the canonical Vixen estate.
  const acceptedJourney=aiJourneyArchive?.schema==='vixen.ai.session-archive/v1' &&
   aiJourneyArchive.original_corpus_modified===false &&
   aiJourneyArchive.release_authority===false ? aiJourneyArchive:null;
  if(acceptedJourney){
   entries.push({
    path:'encyclopedia/vixen-estate/ai-research-journey.json',
    data:JSON.stringify(acceptedJourney,null,2)+'\n',
    mtime:nowDate
   });
   sessionStatePayload.optional_ai_journey_included=true;
  }
  // 4-7. Fetch LLM guides, site preflight, vixen-estate, assets/vixen, and reference files in bounded parallel batches
  const batchTargets = [
    ['./vix-cyb/podium.html', 'encyclopedia/vix-cyb/podium.html'],
    ['./vix-cyb/human-podium.html', 'encyclopedia/vix-cyb/human-podium.html'],
    ['./vix-cyb/llms.txt', 'encyclopedia/vix-cyb/llms.txt'],
    ['./llms.txt', 'encyclopedia/llms.txt'],
    ['../site-epoch-preflight.js', 'site-epoch-preflight.js'],
    ...VIXEN_ESTATE_ASSET_PATHS.map((name) => [`./vixen-estate/${name}`, `encyclopedia/vixen-estate/${name}`]),
    ...VIXEN_BRAND_ASSET_PATHS.map((name) => [`./assets/vixen/${name}`, `encyclopedia/assets/vixen/${name}`]),
    ...VIXEN_REFERENCE_CONTRACT_PATHS.map((name) => [`./reference/${name}`, `encyclopedia/reference/${name}`])
  ];
  const fetched = await Promise.all(
    batchTargets.map(async ([fetchRelPath, zipPath]) => ({
      zipPath,
      bytes: await fetchSameOriginBytes(fetcher, baseUrl, fetchRelPath)
    }))
  );
  for (const item of fetched) {
    if (item.bytes && item.bytes.length > 0) {
      entries.push({ path: item.zipPath, data: item.bytes, mtime: nowDate });
    } else {
      omitted.push(item.zipPath);
    }
  }

  sessionStatePayload.omitted_optional_paths = omitted;
  entries.push({
    path: 'encyclopedia/vixen-estate/session-state.json',
    data: JSON.stringify(sessionStatePayload, null, 2) + '\n',
    mtime: nowDate
  });

  // 8. Top-level human & AI orientation guide
  entries.push({
    path: 'SESSION_START_HERE.md',
    data: buildSessionStartHereMd({ synthesisState, sessionMeta: sessionStatePayload, exportedAt }),
    mtime: nowDate
  });

  const closure=await inspectVixenPortableFidelity({
    entries,omitted,baseHref,fetcher,exportedAt,
    cryptoProvider:globalThis.crypto
  });
  return {...closure,exportedAt};
}

export async function downloadVixenSessionZip(options = {}) {
  const exportedAt = options.exportedAt || new Date().toISOString();
  const dateTag = exportedAt.slice(0, 10);
  const filename = options.filename || `vixen-cybernetics-session-${dateTag}.zip`;
  const { entries, omitted, fidelity, manifest, requiredMissing } = await collectVixenSessionFiles({ ...options, exportedAt });
  // Refuse a broken boot-critical archive rather than offering a success-like ZIP.
  // An intact index with unbundled record bodies remains explicitly online dependent.
  if(fidelity==='EXPORT_PARTIAL_HELD')return {
    schema:SESSION_ZIP_SCHEMA,ok:false,fidelity,
    filename,file_count:entries.length,omitted_count:omitted.length,
    required_missing_paths:requiredMissing,manifest,
    triggered_download:false,exported_at:exportedAt
  };
  const zipBytes = buildVixenSessionZipBytes(entries);

  let triggered = false;
  const doc = options.documentRef || (typeof document !== 'undefined' ? document : null);
  if (doc && typeof Blob !== 'undefined' && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
    const blob = new Blob([zipBytes], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const link = doc.createElement('a');
    link.href = url;
    link.download = filename;
    link.rel = 'noopener';
    link.style.display = 'none';
    doc.body?.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => { try { URL.revokeObjectURL(url); } catch (_) {} }, 2500);
    triggered = true;
  }

  return {
    schema: SESSION_ZIP_SCHEMA,
    ok: fidelity==='FULL_OFFLINE_VERIFIED',
    fidelity,
    required_missing_paths:requiredMissing,
    online_reference_required:fidelity==='ONLINE_REFERENCE_REQUIRED',
    extracted_boot_verified:false,
    filename,
    file_count: entries.length,
    omitted_count: omitted.length,
    total_bytes: zipBytes.length,
    crc32_hex: crc32Bytes(zipBytes).toString(16).padStart(8, '0'),
    triggered_download: triggered,
    exported_at: exportedAt
  };
}
