/**
 * 𝌋 Experiment-A Companion Corpus Loader & FADT Conditioned Custody Boundary
 *
 * Isomorphic ESM module (Browser ES module + Node >= 20) serving:
 *   1. FADT 3-coordinate custody projection:
 *      (cohort, deployment_env, custody_layer, operator_secret_verified)
 *      preserving exact non-collapse between:
 *      - EXPERIMENT_A_PREVIEW_AUTHORIZED
 *      - Prospective supplemental sources remain outside A0 active material
 *      - APPLEDOUBLE_C4_QUARANTINED (33 ._* files)
 *      - ARCHIVE_CONTAINER_UNEXTRACTED (Archive.zip)
 *      - No body suppression in Experiment A; server-side operator access is a future Experiment C main-release prerequisite
 *   2. Cached loaders for corpus-experiment-a-part1.json & corpus-experiment-a-part2.json
 *   3. UTF-16 surrogate-safe passage slicer & WebCrypto SHA-256 verifier
 */

export const EXPERIMENT_A_CUSTODY_POLICY = Object.freeze({
  cohort: 'EXPERIMENT_A',
  preview_status: 'EXPERIMENT_A_PREVIEW_AUTHORIZED',
  batch_b_status: 'EXPERIMENT_A_METADATA_ONLY_BINARY_PENDING_UPLOAD',
  experiment_c_main_release_gate: 'SERVER_SIDE_GIVING_STYLE_SECRET_NOT_YET_IMPLEMENTED',
  authority_basis: 'Em blank authorization for Experiment-A Vercel Preview deployments & volunteer-client/dev verification; closure of Experiment A pending Em acceptance',
  experiment_c_release_condition: 'Implement server-enforced TD613 Giving-style operator access before any main-branch client release; never treat this experimental client-side corpus as secret.',
  empirical_replication_credit: 0,
  human_closure_required: true,
  release_authority: false
});

export const MAX_EXPERIMENT_A_JSON_BYTES = 4_000_000;
export const MAX_EXACT_SEARCH_QUERY_BYTES = 500;
export const MIN_EXACT_SEARCH_QUERY_BYTES = 2;

const SHARD_CACHE = new Map();
const SHARD_META_CACHE = new Map();
const SHARD_INFLIGHT = new Map();
const REGISTERED_SHARD_SEALS = new Map();
const UTF8_ENCODER = new TextEncoder();

function decodeUtf8Fatal(bytes, label = 'payload') {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch (err) {
    throw new Error(`INVALID_UTF8_FATAL_${label}: ${err?.message || String(err)}`);
  }
}

export function registerExperimentAShardSeals(shardSeals = {}) {
  if (!shardSeals || typeof shardSeals !== 'object') return getRegisteredShardSeals();
  for (const [key, spec] of Object.entries(shardSeals)) {
    if (!spec || typeof spec !== 'object' || !spec.sha256) continue;
    const filename = spec.filename || (key === 'part1'
      ? 'corpus-experiment-a-part1.json'
      : key === 'part2'
        ? 'corpus-experiment-a-part2.json'
        : key);
    REGISTERED_SHARD_SEALS.set(filename, {
      sha256: String(spec.sha256).toLowerCase(),
      byte_length: spec.byte_length != null ? Number(spec.byte_length) : null,
      schema: spec.schema || 'td613.vixen.experiment-a-corpus-shard/v1'
    });
  }
  return getRegisteredShardSeals();
}

export function getRegisteredShardSeals() {
  const out = {};
  for (const [k, v] of REGISTERED_SHARD_SEALS.entries()) out[k] = { ...v };
  return out;
}

export function resolveDeploymentEnvironment({ hostname = '', vercelEnv = '', override = '' } = {}) {
  const ov = String(override || '').trim().toUpperCase();
  if (ov === 'PRODUCTION' || ov === 'VERCEL_PREVIEW' || ov === 'EXPERIMENT_A_LOCAL') return ov;

  const envFromProcess = typeof process !== 'undefined' && process?.env ? String(process.env.VERCEL_ENV || '') : '';
  const ve = String(vercelEnv || envFromProcess || '').trim().toLowerCase();
  if (ve === 'production') return 'PRODUCTION';
  if (ve === 'preview') return 'VERCEL_PREVIEW';

  const host = String(
    hostname || (typeof window !== 'undefined' ? window.location?.hostname : '') || ''
  ).toLowerCase();

  if (!host || host === 'localhost' || host === '127.0.0.1' || host === '::1') {
    return 'EXPERIMENT_A_LOCAL';
  }
  if (host.endsWith('.vercel.app') || host.includes('-git-')) {
    return 'VERCEL_PREVIEW';
  }
  return 'PRODUCTION';
}

export function resolveExperimentACustody({
  cohort = 'EXPERIMENT_A',
  deployment_env = resolveDeploymentEnvironment(),
  custody_layer = 'DERIVATIVE_OR_MD'
} = {}) {
  const layer = String(custody_layer || 'DERIVATIVE_OR_MD').toUpperCase();
  const env = String(deployment_env || 'EXPERIMENT_A_LOCAL').toUpperCase();

  if (layer === 'APPLEDOUBLE_C4') {
    return {
      status: 'APPLEDOUBLE_C4_QUARANTINED',
      authorized: false,
      readable: false,
      metadata_searchable: false,
      reason: 'macOS ._ resource-fork AppleDouble sidecar quarantined as c4.'
    };
  }

  if (layer === 'ARCHIVE_CONTAINER') {
    return {
      status: 'ARCHIVE_CONTAINER_UNEXTRACTED',
      authorized: true,
      readable: false,
      metadata_searchable: true,
      reason: 'Archive container remains unextracted; stub metadata only.'
    };
  }

  if (layer === 'BATCH_B_PENDING_PDF') {
    return {
      status: 'EXPERIMENT_A_METADATA_ONLY_BINARY_PENDING_UPLOAD',
      authorized: true,
      readable: false,
      metadata_searchable: true,
      binary_present: false,
      reason: 'Prospective Batch-B PDF registered from directory inventory; binary awaits git upload (no fabricated body).'
    };
  }

  if (layer === 'IMAGE_METADATA') {
    return {
      status: 'EXPERIMENT_A_PREVIEW_AUTHORIZED',
      authorized: true,
      readable: true,
      metadata_searchable: true,
      metadata_only_no_ocr: true,
      reason: 'Brand image metadata & geometric bounds authorized for preview; zero fabricated OCR.'
    };
  }

  // Experiment A is a readable research preview, including Vercel builds.
  // Future main-branch client release is a separate Experiment C admission,
  // requiring a real server-side secret gate before publishing the corpus.
  if (cohort === 'EXPERIMENT_A') {
    return {
      status: 'EXPERIMENT_A_PREVIEW_AUTHORIZED',
      authorized: true,
      readable: true,
      metadata_searchable: true,
      cohort: 'EXPERIMENT_A',
      deployment_env: env,
      empirical_replication_credit: 0,
      human_closure_required: true,
      reason: EXPERIMENT_A_CUSTODY_POLICY.authority_basis
    };
  }

  return {
    status: 'OUTSIDE_EXPERIMENT_A_COHORT',
    authorized: false,
    readable: false,
    metadata_searchable: false,
    reason: 'The requested record is outside the authorized Experiment-A cohort.'
  };
}

async function readFetchResponseBounded(res, maxBytes, filename) {
  const clHeader = res.headers?.get?.('content-length');
  if (clHeader != null && clHeader !== '') {
    const declaredLen = Number(clHeader);
    if (Number.isFinite(declaredLen) && declaredLen > maxBytes) {
      throw new Error(`EXPERIMENT_A_PAYLOAD_TOO_LARGE_${filename}: content-length=${declaredLen} > ${maxBytes}`);
    }
  }
  if (res.body && typeof res.body.getReader === 'function') {
    const reader = res.body.getReader();
    const chunks = [];
    let total = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = value instanceof Uint8Array ? value : new Uint8Array(value);
        total += chunk.byteLength;
        if (total > maxBytes) {
          await reader.cancel().catch(() => {});
          throw new Error(`EXPERIMENT_A_PAYLOAD_TOO_LARGE_${filename}: streamed=${total} > ${maxBytes}`);
        }
        chunks.push(chunk);
      }
    } finally {
      try { reader.releaseLock(); } catch (_) {}
    }
    const merged = new Uint8Array(total);
    let offset = 0;
    for (const c of chunks) {
      merged.set(c, offset);
      offset += c.byteLength;
    }
    return merged;
  }
  const buf = await res.arrayBuffer();
  const u8 = new Uint8Array(buf);
  if (u8.byteLength > maxBytes) {
    throw new Error(`EXPERIMENT_A_PAYLOAD_TOO_LARGE_${filename}: bytes=${u8.byteLength} > ${maxBytes}`);
  }
  return u8;
}

export async function loadJsonSibling(filename, {
  baseUrl = '',
  forceReload = false,
  maxBytes = MAX_EXPERIMENT_A_JSON_BYTES,
  expectedSha256 = null,
  expectedBytes = null,
  expectedSchema = null
} = {}) {
  const seal = REGISTERED_SHARD_SEALS.get(filename) || null;
  const reqSha = expectedSha256 ? String(expectedSha256).toLowerCase() : (seal?.sha256 || null);
  const reqBytes = expectedBytes != null ? Number(expectedBytes) : (seal?.byte_length ?? null);
  const reqSchema = expectedSchema || seal?.schema || null;
  const key = `${baseUrl || 'relative'}::${filename}`;
  // Deduplicate identical sealed loads too, but never share across differing custody expectations.
  const inFlightKey=JSON.stringify([key,reqSha,reqBytes,reqSchema]);

  if (!forceReload && SHARD_CACHE.has(key)) {
    const meta = SHARD_META_CACHE.get(key);
    const shaOk = !reqSha || meta?.sha256 === reqSha;
    const lenOk = reqBytes == null || meta?.byte_length === reqBytes;
    const schemaOk = !reqSchema || meta?.schema === reqSchema;
    if (shaOk && lenOk && schemaOk) return SHARD_CACHE.get(key);
    SHARD_CACHE.delete(key);
    SHARD_META_CACHE.delete(key);
  }
  if (!forceReload && SHARD_INFLIGHT.has(inFlightKey)) return SHARD_INFLIGHT.get(inFlightKey);

  const p = (async () => {
    const isNode = typeof process !== 'undefined' && Boolean(process.versions?.node);
    const urlObj = baseUrl
      ? new URL(filename, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`)
      : new URL(`./${filename}`, import.meta.url);

    let rawBytes;
    if (isNode && urlObj.protocol === 'file:') {
      const [{ readFile }, { fileURLToPath }] = await Promise.all([
        import('node:fs/promises'),
        import('node:url')
      ]);
      const buf = await readFile(fileURLToPath(urlObj));
      rawBytes = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    } else if (typeof fetch === 'function') {
      if (typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null'
          && urlObj.origin !== 'null' && urlObj.origin !== window.location.origin) {
        throw new Error(`CROSS_ORIGIN_FETCH_BLOCKED_${filename}: ${urlObj.origin}`);
      }
      const fetchOpts = (urlObj.protocol === 'http:' || urlObj.protocol === 'https:')
        ? { credentials: 'omit', redirect: 'error', mode: 'same-origin' }
        : { credentials: 'omit', redirect: 'error' };
      const res = await fetch(urlObj.href, fetchOpts);
      if (!res.ok) throw new Error(`HTTP_${res.status}_LOADING_${filename}`);
      rawBytes = await readFetchResponseBounded(res, maxBytes, filename);
    } else {
      throw new Error(`NO_LOADER_FOR_${filename}`);
    }

    if (rawBytes.byteLength > maxBytes) {
      throw new Error(`EXPERIMENT_A_PAYLOAD_TOO_LARGE_${filename}: bytes=${rawBytes.byteLength} > ${maxBytes}`);
    }
    if (reqBytes != null && rawBytes.byteLength !== reqBytes) {
      throw new Error(`EXPERIMENT_A_BYTE_LENGTH_MISMATCH_${filename}: actual=${rawBytes.byteLength} expected=${reqBytes}`);
    }
    const actualSha = await computeSha256HexAsync(rawBytes);
    if (reqSha && actualSha !== reqSha) {
      throw new Error(`EXPERIMENT_A_SHA256_MISMATCH_${filename}: actual=${actualSha} expected=${reqSha}`);
    }

    const rawText = decodeUtf8Fatal(rawBytes, filename);
    const data = JSON.parse(rawText);
    if (reqSchema && data?.schema !== reqSchema) {
      throw new Error(`EXPERIMENT_A_SCHEMA_MISMATCH_${filename}: actual=${data?.schema || 'null'} expected=${reqSchema}`);
    }

    if (data?.schema === 'td613.vixen.semantic-semiotic-index/v1' && data?.corpus_custody?.shard_seals) {
      registerExperimentAShardSeals(data.corpus_custody.shard_seals);
    }

    SHARD_CACHE.set(key, data);
    SHARD_META_CACHE.set(key, {
      sha256: actualSha,
      byte_length: rawBytes.byteLength,
      schema: data?.schema || null
    });
    return data;
  })();

  SHARD_INFLIGHT.set(inFlightKey,p);
  const clearInFlight=()=>{
    if(SHARD_INFLIGHT.get(inFlightKey)===p)SHARD_INFLIGHT.delete(inFlightKey);
  };
  p.then(clearInFlight,clearInFlight);
  return p;
}

export async function loadExperimentAShard(shardNum, opts = {}) {
  const s = String(shardNum ?? '').trim().toLowerCase();
  const n = (Number(shardNum) === 2 || s === '2' || s === 'part2') ? 2 : 1;
  return loadJsonSibling(`corpus-experiment-a-part${n}.json`, {
    expectedSchema: 'td613.vixen.experiment-a-corpus-shard/v1',
    ...opts
  });
}

export function shardForWorkIndex(workIndex) {
  return Number(workIndex) >= 16 ? 2 : 1;
}

function projectExperimentACustodyForBody(record, opts = {}) {
  if (!record) return null;
  const deployment_env = resolveDeploymentEnvironment({
    override: opts.deployment_env || ''
  });
  const custody_layer = record.custody_status === 'EXPERIMENT_A_METADATA_ONLY_BINARY_PENDING_UPLOAD'
    ? 'BATCH_B_PENDING_PDF'
    : 'DERIVATIVE_OR_MD';
  const gate = resolveExperimentACustody({
    cohort: 'EXPERIMENT_A',
    deployment_env,
    custody_layer
  });
  if (!gate.readable) {
    return {
      ...record,
      custody_status: gate.status,
      authorized: gate.authorized,
      readable: false,
      text_body: null,
      gate_reason: gate.reason
    };
  }
  return record;
}

async function verifyBodyRecordIntegrity(record) {
  if (!record || typeof record.text_body !== 'string') return record;
  const expected = record.derivative_sha256 || record.body_sha256 || null;
  if (expected) {
    const actual = await computeSha256HexAsync(record.text_body);
    if (actual !== expected) {
      throw new Error(`EXPERIMENT_A_BODY_SHA256_MISMATCH_${record.source_file_id || record.instrument_id || 'record'}: actual=${actual} expected=${expected}`);
    }
    return { ...record, body_sha256_verified: true, verified_sha256: actual };
  }
  return record;
}

export async function loadExperimentABodyBySourceId(sourceFileId, { hintShard = null, ...opts } = {}) {
  if (!sourceFileId) return null;
  const order = Number(hintShard) === 2 ? [2, 1] : [1, 2];
  for (const sNum of order) {
    const shard = await loadExperimentAShard(sNum, opts);
    if (shard?.sources && shard.sources[sourceFileId]) {
      const rec = await verifyBodyRecordIntegrity(shard.sources[sourceFileId]);
      return projectExperimentACustodyForBody(rec, opts);
    }
    if (sNum === 1 && Array.isArray(shard?.batch_b_files)) {
      const bf = shard.batch_b_files.find((x) => x.source_file_id === sourceFileId);
      if (bf) return projectExperimentACustodyForBody(bf, opts);
    }
    if (sNum === 1 && Array.isArray(shard?.image_assets)) {
      const im = shard.image_assets.find((x) => x.id === sourceFileId || x.filename === sourceFileId);
      if (im) return im;
    }
    if (sNum === 1 && shard?.archive_container?.source_file_id === sourceFileId) {
      return shard.archive_container;
    }
  }
  return null;
}

export async function loadInstrumentBodyById(instrumentId, opts = {}) {
  if (!instrumentId) return null;
  const shard2 = await loadExperimentAShard(2, opts);
  const inst = shard2?.instruments?.[instrumentId] || null;
  if (!inst) return null;
  const verified = await verifyBodyRecordIntegrity(inst);
  return projectExperimentACustodyForBody(verified, opts);
}

function snapLeftSafe(str, idx) {
  if (idx <= 0) return 0;
  if (idx >= str.length) return str.length;
  const c = str.charCodeAt(idx);
  if (c >= 0xdc00 && c <= 0xdfff) return Math.max(0, idx - 1);
  return idx;
}

function snapRightSafe(str, idx) {
  if (idx <= 0) return 0;
  if (idx >= str.length) return str.length;
  const c = str.charCodeAt(idx);
  if (c >= 0xdc00 && c <= 0xdfff) return Math.min(str.length, idx + 1);
  return idx;
}

function alignUtf8Start(u8, idx) {
  let i = Math.max(0, Math.min(u8.length, idx));
  while (i > 0 && (u8[i] & 0xc0) === 0x80) i--;
  return i;
}

function alignUtf8End(u8, idx) {
  let i = Math.max(0, Math.min(u8.length, idx));
  while (i < u8.length && (u8[i] & 0xc0) === 0x80) i++;
  return i;
}

export function scrubBase64BlobsForDisplay(str) {
  return String(str || '')
    .replace(/\[[^\]]+\]:\s*<?data:image\/[a-z0-9.+-]+;base64,[^>\s)]+>?/gi, '[embedded figure reference]')
    .replace(/!\[([^\]]*)\]\(data:image\/[a-z0-9.+-]+;base64,[^)]+\)/gi, '[$1 — inline diagram rendered in full body]')
    .replace(/data:image\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=\s]{16,}/gi, '[inline image data omitted]')
    .replace(/[A-Za-z0-9+/]{64,}={0,2}/g, '');
}

export function slicePassageUtf8Safe(text, charOffset = 0, charLength = 800, contextChars = 220, { offsetUnit = 'UTF16_CHAR' } = {}) {
  if (String(offsetUnit || 'UTF16_CHAR').toUpperCase() === 'UTF8_BYTE') {
    const startUtf8 = Number(charOffset) || 0;
    const lenUtf8 = Number(charLength) || 0;
    return sliceByUtf8ByteOffset(text, startUtf8, startUtf8 + lenUtf8, contextChars);
  }
  const s = String(text || '').normalize('NFC');
  if (!s.length) {
    return {
      offset_unit: 'UTF16_CHAR',
      excerpt: '',
      readableExcerpt: '',
      matchStart: 0,
      matchEnd: 0,
      windowStart: 0,
      windowEnd: 0,
      truncatedHead: false,
      truncatedTail: false
    };
  }
  const mStart = snapLeftSafe(s, Math.max(0, Math.min(s.length, Number(charOffset) || 0)));
  const mEnd = snapRightSafe(s, Math.max(mStart, Math.min(s.length, mStart + (Number(charLength) || 0))));
  const wStart = snapLeftSafe(s, Math.max(0, mStart - Math.max(0, Number(contextChars) || 0)));
  const wEnd = snapRightSafe(s, Math.min(s.length, mEnd + Math.max(0, Number(contextChars) || 0)));
  const excerpt = s.slice(wStart, wEnd);

  return {
    offset_unit: 'UTF16_CHAR',
    excerpt,
    readableExcerpt: scrubBase64BlobsForDisplay(excerpt).trim(),
    matchStart: mStart - wStart,
    matchEnd: mEnd - wStart,
    windowStart: wStart,
    windowEnd: wEnd,
    truncatedHead: wStart > 0,
    truncatedTail: wEnd < s.length
  };
}

export function sliceByUtf8ByteOffset(text, startUtf8 = 0, endUtf8 = null, contextBytes = 220) {
  const s = String(text || '');
  const u8 = UTF8_ENCODER.encode(s);
  if (!u8.length) {
    return {
      offset_unit: 'UTF8_BYTE',
      start_utf8: 0,
      end_utf8: 0,
      window_start_utf8: 0,
      window_end_utf8: 0,
      char_offset: 0,
      char_length: 0,
      excerpt: '',
      readableExcerpt: '',
      truncatedHead: false,
      truncatedTail: false
    };
  }
  const rawStart = Number(startUtf8);
  const rawEnd = endUtf8 == null ? rawStart : Number(endUtf8);
  if (!Number.isFinite(rawStart) || !Number.isFinite(rawEnd) || rawStart < 0 || rawEnd < rawStart || rawEnd > u8.length) {
    throw new Error(`INVALID_UTF8_BYTE_RANGE: [${rawStart}, ${rawEnd}) for byte_length=${u8.length}`);
  }
  if ((rawStart < u8.length && (u8[rawStart] & 0xc0) === 0x80) || (rawEnd < u8.length && (u8[rawEnd] & 0xc0) === 0x80)) {
    throw new Error(`NON_UTF8_BOUNDARY_SLICE: [${rawStart}, ${rawEnd})`);
  }
  const wStart = alignUtf8Start(u8, rawStart - Math.max(0, Number(contextBytes) || 0));
  const wEnd = alignUtf8End(u8, rawEnd + Math.max(0, Number(contextBytes) || 0));
  const windowStr = decodeUtf8Fatal(u8.subarray(wStart, wEnd), 'window_slice');
  const headStr = rawStart > 0 ? decodeUtf8Fatal(u8.subarray(0, rawStart), 'head_slice') : '';
  const exactStr = decodeUtf8Fatal(u8.subarray(rawStart, rawEnd), 'exact_slice');

  return {
    offset_unit: 'UTF8_BYTE',
    start_utf8: rawStart,
    end_utf8: rawEnd,
    byte_length: rawEnd - rawStart,
    window_start_utf8: wStart,
    window_end_utf8: wEnd,
    char_offset: headStr.length,
    char_length: exactStr.length,
    exact_quote: exactStr,
    excerpt: windowStr,
    readableExcerpt: scrubBase64BlobsForDisplay(windowStr).trim(),
    truncatedHead: wStart > 0,
    truncatedTail: wEnd < u8.length
  };
}

function findNextByteMatch(haystackU8, needleU8, fromIndex) {
  const nLen = needleU8.length;
  const maxStart = haystackU8.length - nLen;
  const first = needleU8[0];
  for (let i = fromIndex; i <= maxStart; i++) {
    if (haystackU8[i] !== first) continue;
    let matched = true;
    for (let j = 1; j < nLen; j++) {
      if (haystackU8[i + j] !== needleU8[j]) {
        matched = false;
        break;
      }
    }
    if (matched) return i;
  }
  return -1;
}

export async function exactSearchInExperimentAShards(query, {
  baseUrl = '',
  offset = 0,
  limit = 20,
  maxPerSource = 3,
  formatFilter = null,
  clusterFilter = null,
  unitKindFilter = null,
  includeBatchB = true,
  deployment_env = resolveDeploymentEnvironment(),
  operator_secret_verified = false
} = {}) {
  const gate = resolveExperimentACustody({
    cohort: 'EXPERIMENT_A',
    deployment_env,
    custody_layer: 'DERIVATIVE_OR_MD',
    operator_secret_verified
  });
  if (!gate.readable) {
    return {
      status: gate.status,
      mode: 'exact_utf8_bytes',
      query: String(query || '').normalize('NFC').trim(),
      total_hits: 0,
      returned_hits: 0,
      hits: [],
      metadata_only_pending_count: 0,
      empirical_replication_credit: 0,
      human_closure_required: true,
      release_authority: false
    };
  }

  const rawQuery = String(query || '').normalize('NFC').trim();
  if (/(?:eclipse[-–—\s]*omega|\b(?:astraea|tauricdiana|wendbine|palace|src-[a-z0-9-]+|g-\d{3}|apt-\d{3})\b)/i.test(rawQuery)) {
    return {
      status: 'CROSS_OPERA_QUARANTINED',
      mode: 'exact_utf8_bytes',
      query: rawQuery,
      total_hits: 0,
      returned_hits: 0,
      hits: [],
      empirical_replication_credit: 0,
      human_closure_required: true,
      release_authority: false
    };
  }
  const qBytes = UTF8_ENCODER.encode(rawQuery);
  if (qBytes.byteLength < MIN_EXACT_SEARCH_QUERY_BYTES) {
    return {
      status: 'EXACT_QUERY_TOO_SHORT',
      mode: 'exact_utf8_bytes',
      query: rawQuery,
      utf8_byte_length: qBytes.byteLength,
      total_hits: 0,
      returned_hits: 0,
      hits: [],
      empirical_replication_credit: 0,
      human_closure_required: true,
      release_authority: false
    };
  }
  if (qBytes.byteLength > MAX_EXACT_SEARCH_QUERY_BYTES) {
    return {
      status: 'EXACT_QUERY_TOO_LONG',
      mode: 'exact_utf8_bytes',
      query: rawQuery.slice(0, 120),
      utf8_byte_length: qBytes.byteLength,
      total_hits: 0,
      returned_hits: 0,
      hits: [],
      empirical_replication_credit: 0,
      human_closure_required: true,
      release_authority: false
    };
  }

  const [part1, part2] = await Promise.all([
    loadExperimentAShard(1, { baseUrl }),
    loadExperimentAShard(2, { baseUrl })
  ]);

  const querySha = await computeSha256HexAsync(qBytes);
  const allMatches = [];
  const candidates = [
    ...Object.values(part1?.sources || {}),
    ...Object.values(part2?.sources || {}),
    ...Object.values(part2?.instruments || {}).map((inst) => ({
      ...inst,
      source_file_id: inst.instrument_id,
      title: inst.filename.replace(/\.md$/i, '').replace(/_/g, ' '),
      unit_kind: 'instrument_record'
    }))
  ];

  for (const rawRec of candidates) {
    const uk = rawRec.unit_kind || 'source_passage';
    if (unitKindFilter && uk !== unitKindFilter) continue;
    if (formatFilter && rawRec.format !== formatFilter) continue;
    if (clusterFilter && rawRec.cluster !== clusterFilter) continue;
    if (typeof rawRec.text_body !== 'string' || !rawRec.text_body.length) continue;

    const rec = await verifyBodyRecordIntegrity(rawRec);
    const bodyU8 = UTF8_ENCODER.encode(rec.text_body);
    let from = 0;
    let countForSource = 0;
    let emittedForSource = 0;
    let firstMatch = null;
    while (from <= bodyU8.length - qBytes.length) {
      const idx = findNextByteMatch(bodyU8, qBytes, from);
      if (idx < 0) break;
      countForSource++;
      const endUtf8 = idx + qBytes.length;
      if (emittedForSource < maxPerSource) {
        emittedForSource++;
        const sliced = sliceByUtf8ByteOffset(rec.text_body, idx, endUtf8, 140);
        const matchSha = await computeSha256HexAsync(bodyU8.subarray(idx, endUtf8));
        if (matchSha !== querySha) {
          throw new Error(`EXACT_UTF8_SLICE_SHA_MISMATCH: ${rec.source_file_id}`);
        }
        const entry = {
          id: `${rec.source_file_id || rec.instrument_id}#b${idx}`,
          unit_kind: uk,
          work_id: rec.work_id || null,
          source_file_id: rec.source_file_id || null,
          instrument_id: rec.instrument_id || null,
          title: rec.recorded_title || rec.title || rec.original_filename || rec.source_file_id,
          original_filename: rec.original_filename || rec.filename || null,
          cluster: rec.cluster || null,
          identity_status: rec.identity_status || (rec.instrument_id ? 'DOCUMENTARY_PROTOCOL' : null),
          gate_num: rec.gate_num ?? null,
          format: rec.format || 'md',
          media_type: rec.media_type || null,
          custody_status: rec.custody_status || 'EXPERIMENT_A_PREVIEW_AUTHORIZED',
          body_representation: rec.body_representation || null,
          shard: rec.shard ?? null,
          offset_unit: 'UTF8_BYTE',
          start_utf8: idx,
          end_utf8: endUtf8,
          byte_length: qBytes.length,
          char_offset: sliced.char_offset,
          char_length: sliced.char_length,
          exact_utf8_sha256: matchSha,
          observed_quote: sliced.exact_quote,
          snippet: sliced.readableExcerpt,
          sha256: rec.declared_source_sha256 || rec.declared_sha256 || null,
          derivative_sha256: rec.derivative_sha256 || rec.body_sha256 || null,
          why: [`exact UTF-8 byte match [${idx}, ${endUtf8})`],
          score_total: 1.0,
          highest_rung: 'MECHANISM_CANDIDATE',
          empirical_replication_credit: 0,
          paired_manifestation_preserved: true
        };
        if (!firstMatch) firstMatch = entry;
        allMatches.push(entry);
      }
      from = idx + 1;
    }
    if (firstMatch) firstMatch.source_match_count = countForSource;
  }

  let metadataOnlyPendingCount = 0;
  if (includeBatchB && !clusterFilter && (!unitKindFilter || unitKindFilter === 'prospective_batch_b') && (!formatFilter || formatFilter === 'pdf')) {
    const lowQ = rawQuery.toLowerCase();
    for (const bf of (part1?.batch_b_files || [])) {
      metadataOnlyPendingCount++;
      const metaHay = `${bf.source_file_id} ${bf.original_filename} ${bf.provenance_basis || ''}`.toLowerCase();
      if (metaHay.includes(lowQ)) {
        allMatches.push({
          id: bf.source_file_id,
          unit_kind: 'prospective_batch_b',
          work_id: null,
          source_file_id: bf.source_file_id,
          instrument_id: null,
          title: bf.original_filename.replace(/\.pdf$/i, ''),
          original_filename: bf.original_filename,
          cluster: null,
          identity_status: 'PROSPECTIVE_BATCH_B_UNPAIRED',
          gate_num: null,
          format: 'pdf',
          media_type: bf.media_type,
          custody_status: 'EXPERIMENT_A_METADATA_ONLY_BINARY_PENDING_UPLOAD',
          body_representation: 'BINARY_PENDING_UPLOAD_NO_TEXT',
          shard: 1,
          offset_unit: 'METADATA_ONLY',
          start_utf8: null,
          end_utf8: null,
          char_offset: 0,
          char_length: 0,
          sha256: bf.sha256,
          source_clock: bf.source_clock || 'UNRESOLVED',
          filesystem_clock_status: bf.filesystem_clock_status || 'CHRONOLOGY_UNRESOLVED',
          snippet: `Metadata-only Batch-B entry (${bf.original_filename}; binary awaiting upload, exact body unsearchable).`,
          why: ['metadata filename match (Batch-B binary pending upload)'],
          score_total: 0.72,
          highest_rung: 'MOTIF_MATCH',
          empirical_replication_credit: 0,
          paired_manifestation_preserved: true
        });
      }
    }
  }

  allMatches.sort((a, b) => b.score_total - a.score_total || a.id.localeCompare(b.id));
  const safeOffset = Math.max(0, Number(offset) || 0);
  const safeLimit = Math.max(1, Math.min(200, Number(limit) || 20));
  const pageHits = allMatches.slice(safeOffset, safeOffset + safeLimit);
  const hasMore = safeOffset + pageHits.length < allMatches.length;

  return {
    status: pageHits.length > 0
      ? (metadataOnlyPendingCount > 0 ? 'EXECUTED_MATCHES_WITH_BATCH_B_RIGHTS_GAPS' : 'EXECUTED_MATCHES')
      : (metadataOnlyPendingCount > 0 ? 'EXECUTED_ZERO_WITH_BATCH_B_RIGHTS_GAPS' : 'EXECUTED_ZERO'),
    mode: 'exact_utf8_bytes',
    query: rawQuery,
    utf8_byte_length: qBytes.byteLength,
    exact_utf8_sha256: querySha,
    total_hits: allMatches.length,
    returned_hits: pageHits.length,
    pagination: {
      offset: safeOffset,
      limit: safeLimit,
      total_hits: allMatches.length,
      has_more: hasMore,
      next_offset: hasMore ? safeOffset + pageHits.length : null
    },
    hits: pageHits,
    metadata_only_pending_count: metadataOnlyPendingCount,
    manifestation_count_invariant: [32, 40],
    empirical_replication_credit: 0,
    human_closure_required: true,
    release_authority: false
  };
}

export async function verifyExperimentAShards({ baseUrl = '', seals = null } = {}) {
  const index = await loadJsonSibling('semantic-semiotic-index.v1.json', {
    baseUrl,
    expectedSchema: 'td613.vixen.semantic-semiotic-index/v1'
  });
  const effectiveSeals = seals || index?.corpus_custody?.shard_seals || null;
  if (effectiveSeals) registerExperimentAShardSeals(effectiveSeals);

  const [part1, part2] = await Promise.all([
    loadExperimentAShard(1, { baseUrl }),
    loadExperimentAShard(2, { baseUrl })
  ]);

  const sources = [...Object.values(part1?.sources || {}), ...Object.values(part2?.sources || {})];
  const instruments = Object.values(part2?.instruments || {});
  const batchB = Array.isArray(part1?.batch_b_files) ? part1.batch_b_files : [];

  for (const s of sources) await verifyBodyRecordIntegrity(s);
  for (const inst of instruments) await verifyBodyRecordIntegrity(inst);

  const allAppleDoubleClean = !sources.some((s) => String(s.original_filename || '').startsWith('._'))
    && !batchB.some((b) => String(b.original_filename || '').startsWith('._'));
  const allBatchBNullBody = batchB.every((b) => b.text_body === null && b.custody_status === 'EXPERIMENT_A_METADATA_ONLY_BINARY_PENDING_UPLOAD');

  const verified = sources.length === 53 && instruments.length === 21 && batchB.length === 0 && allAppleDoubleClean && allBatchBNullBody;
  return {
    schema: 'td613.vixen.experiment-a-shard-verification/v1',
    status: verified ? 'SHARD_SEALS_VERIFIED' : 'SHARD_SEALS_UNVERIFIED',
    verified,
    sources_verified: sources.length,
    instruments_verified: instruments.length,
    batch_b_pending_count: batchB.length,
    all_batch_b_null_body: allBatchBNullBody,
    appledouble_c4_excluded: allAppleDoubleClean,
    shard_seals: getRegisteredShardSeals(),
    index_total_units: index?.bm25f?.N ?? index?.docs?.length ?? 0,
    empirical_replication_credit: 0,
    human_closure_required: true,
    release_authority: false
  };
}

export async function computeSha256HexAsync(input) {
  const bytes = typeof input === 'string'
    ? UTF8_ENCODER.encode(input)
    : (input instanceof Uint8Array ? input : new Uint8Array(input));

  if (globalThis.crypto?.subtle?.digest) {
    const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  if (typeof process !== 'undefined' && process.versions?.node) {
    const { createHash } = await import('node:crypto');
    return createHash('sha256').update(bytes).digest('hex');
  }
  throw new Error('NO_SHA256_BACKEND_AVAILABLE');
}

export function clearExperimentACache({ clearSeals = false } = {}) {
  SHARD_CACHE.clear();
  SHARD_META_CACHE.clear();
  SHARD_INFLIGHT.clear();
  if (clearSeals) REGISTERED_SHARD_SEALS.clear();
}
