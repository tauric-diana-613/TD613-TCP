/**
 * 𝌋 Vixen Semantic-Semiotic Retrieval Engine & Multi-Format Local Adapter
 *
 * Pure isomorphic ESM (Browser + Node) synthesized under Dollhouse governance:
 *   - Atlas: 3-channel Fielded BM25F + Centered 256->48D Hashed-Jacobi SVD
 *            + Semiotic Plane/Cluster/Rung-Capped scorer
 *   - Aperture: Alphabetic OOV Negative-Canary Firewall, Support-Alpha Gate,
 *               SPD background null Z-score, Hestenes one-sided Jacobi SVD telemetry
 *   - FADT: Conditioned Experiment-A vs Batch-B vs Production-Secret statuses
 *   - Temporal Custodian: Unicode NFC + ZWNJ preservation, [32, 40] manifestation
 *                         non-collapse, zero empirical_replication_credit
 *
 * Exposes browser/Node client adapters for .md, .txt, .docx (PKZIP + OOXML XML),
 * image (.png/.svg/.jpg metadata, zero fake OCR), and .pdf header inspection.
 */

import {
  loadJsonSibling,
  registerExperimentAShardSeals,
  resolveDeploymentEnvironment,
  resolveExperimentACustody,
  exactSearchInExperimentAShards,
  verifyExperimentAShards,
  scrubBase64BlobsForDisplay
} from './corpus-experiment-a.mjs';

import {
  normalizeFusionControls,scoreFusionChannels,FUSION_PROFILE_IDS
} from './fusion-controls.mjs';
export {normalizeFusionControls,FUSION_PROFILE_IDS} from './fusion-controls.mjs';

import {
  deriveSrcQueryConditionedWeights,
  scoreSrcUntypicalDocument
} from './src-atelier-engines.mjs';

export const SEARCH_ENGINE_VERSION = 'v1.2.0-experiment-a-src-wendbine';
export const MAX_QUERY_CHARS = 500;
export const SUPPORTED_SEARCH_MODES = Object.freeze(['hybrid', 'lexical', 'phrase', 'exact', 'src_projective']);

const M_DIM = 256;
const K_DIM = 48;
const PLANE_KEYS = ['S-PLANE', 'W-PLANE', 'A-PLANE', 'P-MEMBRANE'];
const RUNG_CEILINGS = Object.freeze({
  MOTIF_MATCH: 0.55,
  STRUCTURAL_ANALOGY_CANDIDATE: 0.80,
  MECHANISM_CANDIDATE: 1.00
});

const SEMIOTIC_QUERY_RULES = [
  { tag: 'algedonic_bypass', re: /\b(?:algedonic|bypass|viability|viable\s+system|system[\s-]*[1-5])\b/i },
  { tag: 'lock_free_audio_spsc', re: /\b(?:spsc|lock[\s-]*free|memory\s+barrier|48\s*khz|underrun|ring\s+buffer|atomic)\b/i },
  { tag: 'capacitive_e_textile_glove', re: /\b(?:theremin|capacitive|e[\s-]*textile|glove|electrode|impedance|haptic|quorum)\b/i },
  { tag: 'visibility_svd_conditioning', re: /\b(?:visibility|jacobian|jacobi|singular|condition\s+number|kappa|orthogonal\s+probe)\b/i },
  { tag: 'modular_ossl_finite_field', re: /\b(?:ossl|stylometry|finite\s+field|f_p|modular|remainder|galois)\b/i },
  { tag: 'quotient_room_surplus', re: /\b(?:1\s*\+\s*1\s*=\s*3|surplus|occupant|quotient|fiber|fadt|descent|gluing)\b/i },
  { tag: 'epistemic_control_plane', re: /\b(?:semantic\s+steering|witness\s+verification|actuator|control[\s-]*plane|setpoint|custody|cistern|\u{1D30B}|\u{10D613})\b/iu },
  { tag: 'clock_holonomy_vernier', re: /\b(?:holonomy|clock|vernier|non[\s-]*commutat|lag\s+tick|k_layer|tau_cont|t_wall)\b/i }
];

const CROSS_OPERA_QUARANTINE_RE = /(?:eclipse[-–—\s]*omega|\b(?:astraea|tauricdiana|wendbine|palace|src-[a-z0-9-]+|g-\d{3}|apt-\d{3})\b)/i;

function fnv1a32(str, seed = 0x811c9dc5) {
  let h = seed >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function stableBindingHash(payloadObj) {
  const s = JSON.stringify(payloadObj);
  const h1 = fnv1a32(s, 0x811c9dc5).toString(16).padStart(8, '0');
  const h2 = fnv1a32(s, 0x9e3779b1).toString(16).padStart(8, '0');
  return `vixp_${h1}${h2}`;
}

function clampQueryBounds(raw) {
  const nfc = String(raw || '').normalize('NFC').trim();
  if (nfc.length <= MAX_QUERY_CHARS) return nfc;
  let cut = MAX_QUERY_CHARS;
  const c = nfc.charCodeAt(cut);
  if (c >= 0xdc00 && c <= 0xdfff) cut = Math.max(0, cut - 1);
  return nfc.slice(0, cut);
}

function decodeBase64Bytes(b64) {
  if (typeof Buffer !== 'undefined') {
    const buf = Buffer.from(String(b64 || ''), 'base64');
    return Uint8Array.from(buf);
  }
  const bin = atob(String(b64 || ''));
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

function b64ToTypedArray(b64, TypedCtor) {
  const bytes = decodeBase64Bytes(b64);
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new TypedCtor(copy.buffer);
}

function readVarint(bytes, state) {
  let result = 0;
  let shift = 0;
  while (state.pos < bytes.length) {
    const b = bytes[state.pos++];
    result |= (b & 0x7f) << shift;
    if ((b & 0x80) === 0) break;
    shift += 7;
  }
  return result >>> 0;
}

export function tokenizeQuery(query) {
  const nfc = clampQueryBounds(query);
  const low = nfc.toLowerCase();
  const rawMatches = low.match(/[\p{L}\p{N}_-]+/gu) || [];
  const tokens = [];
  const compounds = [];
  for (const raw of rawMatches) {
    if (!raw) continue;
    if (raw.includes('_') || raw.includes('-')) {
      const parts = raw.split(/[_-]+/).filter(Boolean);
      compounds.push({ raw, parts });
      if (raw.length >= 2 && raw.length <= 24) tokens.push(raw);
      for (const p of parts) {
        if (p.length >= 2) tokens.push(p);
      }
    } else if (raw.length >= 2) {
      tokens.push(raw);
    }
  }
  return { nfc, low, tokens: [...new Set(tokens)], rawTokens: tokens, compounds };
}

export function parseStructuredQuery(query, mode = 'hybrid') {
  const rawNfc = clampQueryBounds(query);
  const normMode = SUPPORTED_SEARCH_MODES.includes(String(mode || '').toLowerCase())
    ? String(mode).toLowerCase()
    : 'hybrid';

  const excludePhrases = [];
  const phrases = [];
  let stripped = rawNfc.replace(/(?:^|\s)-"([^"]+)"/g, (_, phr) => {
    const clean = String(phr || '').normalize('NFC').trim().toLowerCase();
    if (clean.length >= 2) excludePhrases.push(clean);
    return ' ';
  });
  stripped = stripped.replace(/"([^"]+)"/g, (_, phr) => {
    const clean = String(phr || '').normalize('NFC').trim().toLowerCase();
    if (clean.length >= 2) phrases.push(clean);
    return ' ';
  });

  const excludes = [];
  const positiveUnquoted = stripped.replace(/(?:^|\s)-([^\s"]{2,})/g, (_, ex) => {
    const clean = String(ex || '').normalize('NFC').trim().toLowerCase();
    if (clean) excludes.push(clean);
    return ' ';
  });

  const positiveParts = [positiveUnquoted.trim(), ...phrases].filter(Boolean);
  const positiveRaw = positiveParts.join(' ').trim();
  const qPos = tokenizeQuery(positiveRaw);

  const requiredPhrases = [...phrases];
  if ((normMode === 'phrase' || normMode === 'exact') && requiredPhrases.length === 0 && positiveRaw.length >= 2) {
    requiredPhrases.push(positiveRaw.toLowerCase());
  }
  const phraseTokenLists = requiredPhrases.map((p) => tokenizeQuery(p).tokens);

  return {
    rawNfc,
    rawLow: rawNfc.toLowerCase(),
    mode: normMode,
    positiveRaw,
    positiveNfc: qPos.nfc,
    positiveLow: qPos.low,
    tokens: qPos.tokens,
    rawTokens: qPos.rawTokens,
    compounds: qPos.compounds,
    phrases: requiredPhrases,
    phraseTokenLists,
    excludes: [...new Set(excludes)],
    excludePhrases: [...new Set(excludePhrases)]
  };
}

function escapeRegExpChars(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hayMatchesTerm(hayLow, termLow) {
  if (!hayLow || !termLow) return false;
  if (termLow.includes(' ') || termLow.includes('"') || termLow.length >= 4) {
    if (hayLow.includes(termLow)) {
      if (/^[a-z0-9_-]{2,}$/i.test(termLow)) {
        return new RegExp(`(?:^|[^\\p{L}\\p{N}_-])${escapeRegExpChars(termLow)}(?:$|[^\\p{L}\\p{N}_-])`, 'iu').test(hayLow)
          || hayLow.includes(termLow);
      }
      return true;
    }
    return false;
  }
  return new RegExp(`(?:^|[^\\p{L}\\p{N}_-])${escapeRegExpChars(termLow)}(?:$|[^\\p{L}\\p{N}_-])`, 'iu').test(hayLow);
}

function makeCenteredSnippetFromBody(rawBody, termOrPhrase, fallbackSnippet = '') {
  const scrubbed = scrubBase64BlobsForDisplay(String(rawBody || '').normalize('NFC'));
  if (!scrubbed) return fallbackSnippet;
  const low = scrubbed.toLowerCase();
  const idx = low.indexOf(String(termOrPhrase || '').toLowerCase());
  if (idx < 0) return fallbackSnippet;
  const start = Math.max(0, idx - 50);
  const end = Math.min(scrubbed.length, idx + String(termOrPhrase).length + 90);
  const slice = scrubbed.slice(start, end).replace(/\s+/g, ' ').trim();
  return `${start > 0 ? '…' : ''}${slice}${end < scrubbed.length ? '…' : ''}`;
}

export function hestenesJacobiSvd(matrixRows, nCols, maxSweeps = 12, tol = 1e-10) {
  const nRows = matrixRows.length;
  if (nRows === 0 || nCols === 0) {
    return {
      singularValues: [],
      sweeps: 0,
      condition_number_kappa: 1,
      effective_rank: 0,
      top_mode_energy_e1: 0,
      residual: 0
    };
  }
  // Build column-major copy B (nRows x rCols) where rCols = min(nRows, nCols) via Gram on smaller dim or direct columns
  const cols = [];
  for (let j = 0; j < nCols; j++) {
    const col = new Float64Array(nRows);
    for (let i = 0; i < nRows; i++) col[i] = matrixRows[i][j] || 0;
    cols.push(col);
  }

  let sweeps = 0;
  let offMax = 0;
  for (let sw = 0; sw < maxSweeps; sw++) {
    sweeps = sw + 1;
    offMax = 0;
    let rotated = false;
    for (let p = 0; p < nCols - 1; p++) {
      for (let q = p + 1; q < nCols; q++) {
        let app = 0;
        let aqq = 0;
        let apq = 0;
        const cp = cols[p];
        const cq = cols[q];
        for (let i = 0; i < nRows; i++) {
          app += cp[i] * cp[i];
          aqq += cq[i] * cq[i];
          apq += cp[i] * cq[i];
        }
        if (app <= 1e-14 || aqq <= 1e-14 || Math.abs(apq) <= 1e-14) continue;
        const denom = Math.sqrt(app * aqq);
        const rel = Math.abs(apq) / denom;
        if (rel > offMax) offMax = rel;
        if (rel <= tol) continue;

        rotated = true;
        const tau = (aqq - app) / (2 * apq);
        const t = tau >= 0
          ? 1 / (tau + Math.sqrt(1 + tau * tau))
          : -1 / (-tau + Math.sqrt(1 + tau * tau));
        const c = 1 / Math.sqrt(1 + t * t);
        const s = t * c;
        for (let i = 0; i < nRows; i++) {
          const vp = cp[i];
          const vq = cq[i];
          cp[i] = c * vp - s * vq;
          cq[i] = s * vp + c * vq;
        }
      }
    }
    if (!rotated || offMax <= tol) break;
  }

  const sVals = [];
  for (let j = 0; j < nCols; j++) {
    let normSq = 0;
    const col = cols[j];
    for (let i = 0; i < nRows; i++) normSq += col[i] * col[i];
    const sv = Math.sqrt(normSq);
    if (sv > 1e-10) sVals.push(sv);
  }
  sVals.sort((a, b) => b - a);

  const nonZero = sVals.length ? sVals : [0];
  const sMax = nonZero[0];
  const sMin = nonZero[Math.min(nonZero.length - 1, Math.min(nRows, nCols) - 1)] || 0;
  const sumS = nonZero.reduce((a, b) => a + b, 0);
  const sumSq = nonZero.reduce((a, b) => a + b * b, 0);
  const kappa = sMin > 1e-9 ? +(sMax / sMin).toFixed(4) : Infinity;
  const rEff = sumSq > 1e-12 ? +((sumS * sumS) / sumSq).toFixed(4) : 0;
  const e1 = sumSq > 1e-12 ? +((sMax * sMax) / sumSq).toFixed(4) : 0;

  return {
    singularValues: nonZero.slice(0, 8).map((v) => +v.toFixed(6)),
    sweeps,
    condition_number_kappa: kappa,
    effective_rank: rEff,
    top_mode_energy_e1: e1,
    residual: +offMax.toExponential(3)
  };
}

function validateSpd2x2(cov) {
  if (!Array.isArray(cov) || cov.length !== 2) return false;
  const a = Number(cov[0]?.[0]);
  const b = Number(cov[0]?.[1]);
  const c = Number(cov[1]?.[0]);
  const d = Number(cov[1]?.[1]);
  if (![a, b, c, d].every(Number.isFinite)) return false;
  if (Math.abs(b - c) > 1e-10) return false;
  const trace = a + d;
  const det = a * d - b * c;
  const disc = Math.sqrt(Math.max(0, (a - d) * (a - d) + 4 * b * c));
  const lambdaMin = 0.5 * (trace - disc);
  return trace > 0 && det > 1e-12 && lambdaMin > 1e-12;
}

function inferQuerySemioticProfile(nfcQuery, lowQuery, tokens) {
  const planes = new Set();
  if (/\bs-plane\b|semantic|discourse|meaning|prompt|conceptual|\u{1D30B}/iu.test(nfcQuery)) planes.add('S-PLANE');
  if (/\bw-plane\b|witness|physical|capacitive|sensor|hardware|electrode|theremin/i.test(lowQuery)) planes.add('W-PLANE');
  if (/\ba-plane\b|actuator|audio|dsp|spsc|interrupt|scheduler|clock|latency/i.test(lowQuery)) planes.add('A-PLANE');
  if (/\bp-membrane\b|membrane|privacy|custody|cistern|personal|secret|operator|\u{10D613}/iu.test(nfcQuery)) planes.add('P-MEMBRANE');

  const pVec = PLANE_KEYS.map((k) => (planes.has(k) ? 1 : 0));
  const pNorm = Math.hypot(...pVec);
  const normPVec = pNorm > 0 ? pVec.map((v) => v / pNorm) : null;

  const clusters = new Set();
  for (const m of lowQuery.matchAll(/\bc([1-5])\b/g)) clusters.add(`C${m[1]}`);

  const workMatches = new Set();
  for (const m of lowQuery.matchAll(/\b(?:v|w|e|d|p)-\d{2}\b|emwork_[a-f0-9]+/g)) workMatches.add(m[0].toLowerCase());

  const protoMatches = new Set();
  for (const m of lowQuery.matchAll(/\b(?:emsrc_[a-f0-9]+|[a-z0-9_]+_protocol|epistemic_control_plane[a-z0-9_]*)\b/g)) {
    protoMatches.add(m[0].toLowerCase());
  }

  const tags = [];
  for (const r of SEMIOTIC_QUERY_RULES) {
    if (r.re.test(nfcQuery)) tags.push(r.tag);
  }

  return {
    planeVec: normPVec,
    clusters,
    workMatches,
    protoMatches,
    tags,
    hasPuaOperatorMarker: /\u{10D613}|\uDBF5\uDE13/u.test(nfcQuery),
    hasOrchestratorGlyph: /\u{1D30B}/u.test(nfcQuery),
    hasZwnj: nfcQuery.includes('\u200C')
  };
}

export class SemanticSemioticSearchEngine {
  constructor(rawIndex) {
    this.index = rawIndex;
    this.N = Number(rawIndex.bm25f.N || 0);
    this.k1 = Number(rawIndex.bm25f.k1 || 1.2);
    this.fieldWeights = rawIndex.bm25f.field_weights || [3.0, 2.0, 1.0, 0.75];
    this.fieldB = rawIndex.bm25f.field_b || [0.40, 0.55, 0.75, 0.20];
    this.avgFl = rawIndex.bm25f.avg_field_lengths || [1, 1, 1, 1];

    this.vocab = String(rawIndex.bm25f.vocab_lines || '').split('\n');
    this.vocabMap = new Map();
    for (let i = 0; i < this.vocab.length; i++) {
      if (this.vocab[i]) this.vocabMap.set(this.vocab[i], i);
    }

    this.dfArr = b64ToTypedArray(rawIndex.bm25f.df_u16_b64, Uint16Array);
    this.postLengths = rawIndex.bm25f.post_lengths_u16_b64
      ? b64ToTypedArray(rawIndex.bm25f.post_lengths_u16_b64, Uint16Array)
      : b64ToTypedArray(rawIndex.bm25f.post_lengths_u32_b64, Uint32Array);

    this.postOffsets = new Uint32Array(this.postLengths.length);
    let off = 0;
    for (let i = 0; i < this.postLengths.length; i++) {
      this.postOffsets[i] = off;
      off += this.postLengths[i];
    }
    this.postBytes = decodeBase64Bytes(rawIndex.bm25f.postings_varint_b64);

    // SVD matrices
    const svd = rawIndex.svd_subspace;
    this.M = Number(svd.M || M_DIM);
    this.K = Number(svd.K || K_DIM);
    this.idfDim = b64ToTypedArray(svd.idf_f32_b64, Float32Array);
    this.meanVec = b64ToTypedArray(svd.mean_f32_b64, Float32Array);
    this.basisVk = b64ToTypedArray(svd.basis_vk_f32_b64, Float32Array);
    this.singularValues = b64ToTypedArray(svd.singular_values_f32_b64, Float32Array);
    this.docVecsI8 = b64ToTypedArray(svd.doc_vecs_i8_b64, Int8Array);
    this.docScalesF32 = b64ToTypedArray(svd.doc_scales_f32_b64, Float32Array);

    const rawMu = Number(svd.background_null?.mu);
    const rawSigma = Number(svd.background_null?.sigma);
    this.bgMu = Number.isFinite(rawMu) ? rawMu : 0;
    this.bgSigma = Number.isFinite(rawSigma) && rawSigma > 1e-12 ? rawSigma : 0;
    this.spdCovValid = validateSpd2x2(svd.background_null?.covariance_2x2) && this.bgSigma > 1e-12;

    this.tax = rawIndex.semiotic_taxonomy || {};
    this.unitKinds = this.tax.unit_kinds || [];
    this.tagNames = this.tax.tag_names || [];
    this.rungNames = this.tax.rung_names || [];
    this.sourcesMeta = rawIndex.sources_meta || [];
    this.docs = rawIndex.docs || [];

    this.chunkShaBytes = rawIndex.chunk_sha256_b64
      ? decodeBase64Bytes(rawIndex.chunk_sha256_b64)
      : null;

    this.shardSeals = rawIndex.corpus_custody?.shard_seals || null;
    if (this.shardSeals) {
      registerExperimentAShardSeals(this.shardSeals);
    }

    this.indexBindingFingerprint = stableBindingHash({
      bundle: rawIndex.corpus_custody?.vixen_corpus_bundle_sha256 || null,
      built: rawIndex.built_at || null,
      n: this.N,
      vocab: this.vocab.length,
      seals: this.shardSeals
    });

    this.shardTexts = new Map();
    this.graphRelationPromotionAllowed = false;
    this.graphCausalRelationInferred = false;
    this.graphRelTypes = rawIndex.graph?.rel_types || [
      'work_source',
      'work_protocol',
      'folio_link',
      'track_protocol',
      'dup_source',
      'TEXT_CROSS_REF'
    ];
    this.graphAdjacency = new Map();
    this.nodeInfo = new Map();
    this._initNodesAndGraph(rawIndex.graph?.edges || []);
  }

  _initNodesAndGraph(rawEdges) {
    for (const m of this.sourcesMeta) {
      const ids = [m.work_id, m.source_file_id, m.instrument_id].filter(Boolean);
      for (const nid of ids) {
        if (!this.nodeInfo.has(nid)) {
          this.nodeInfo.set(nid, {
            id: nid,
            title: m.title || m.original_filename || nid,
            work_id: m.work_id || null,
            source_file_id: m.source_file_id || null,
            instrument_id: m.instrument_id || null,
            cluster: m.cluster || null,
            format: m.format || null,
            gate_num: m.gate_num ?? null,
            custody_status: m.cust || 'EXPERIMENT_A_PREVIEW_AUTHORIZED'
          });
        }
      }
    }
    const pushAdj = (key, entry) => {
      let arr = this.graphAdjacency.get(key);
      if (!arr) {
        arr = [];
        this.graphAdjacency.set(key, arr);
      }
      arr.push(entry);
    };
    for (const edge of rawEdges) {
      if (!Array.isArray(edge) || edge.length < 3) continue;
      const [from, to, rIdx, off = null, span = null, sha = null] = edge;
      const rel = typeof rIdx === 'number' ? (this.graphRelTypes[rIdx] || 'linked_ref') : String(rIdx);
      const base = {
        from,
        to,
        rel,
        offset_utf8: off,
        evidence_span: span,
        span_sha256: sha,
        causal_relation_inferred: false,
        relation_promotion_allowed: false
      };
      pushAdj(from, { ...base, neighbor: to, direction: 'OUT' });
      pushAdj(to, { ...base, neighbor: from, direction: 'IN' });
    }
  }

  attachShardTexts(part1 = null, part2 = null) {
    const ingest = (mapObj) => {
      if (!mapObj || typeof mapObj !== 'object') return;
      for (const rec of Object.values(mapObj)) {
        if (!rec || typeof rec !== 'object' || typeof rec.text_body !== 'string') continue;
        const id = rec.source_file_id || rec.instrument_id;
        if (!id) continue;
        this.shardTexts.set(id, rec.text_body);
      }
    };
    ingest(part1?.sources);
    ingest(part2?.sources);
    ingest(part2?.instruments);
    return this.shardTexts.size;
  }

  _getChunkSha256(docIdx) {
    if (!this.chunkShaBytes || (docIdx + 1) * 32 > this.chunkShaBytes.length) return null;
    let hex = '';
    const start = docIdx * 32;
    for (let j = 0; j < 32; j++) {
      hex += this.chunkShaBytes[start + j].toString(16).padStart(2, '0');
    }
    return hex;
  }

  _checkCustodyGate({
    deployment_env = resolveDeploymentEnvironment(),
    operator_secret_verified = false
  } = {}) {
    const env = resolveDeploymentEnvironment({ override: deployment_env });
    return {
      env,
      ...resolveExperimentACustody({
        cohort: 'EXPERIMENT_A',
        deployment_env: env,
        custody_layer: 'DERIVATIVE_OR_MD',
        operator_secret_verified: Boolean(operator_secret_verified)
      })
    };
  }

  verifyIndexIntegrity() {
    const issues = [];
    if (this.N !== this.docs.length) issues.push(`DOC_COUNT_MISMATCH: N=${this.N} docs=${this.docs.length}`);
    if (!this.spdCovValid) issues.push('INVALID_SPD_COVARIANCE_OR_BG_SIGMA');
    if (!this.chunkShaBytes || this.chunkShaBytes.length !== this.N * 32) {
      issues.push('MISSING_OR_TRUNCATED_CHUNK_SHA256_PACK');
    }
    if (!this.shardSeals?.part1?.sha256 || !this.shardSeals?.part2?.sha256) {
      issues.push('MISSING_SHARD_SEALS');
    }
    return {
      valid: issues.length === 0,
      issues,
      N: this.N,
      vocab_size: this.vocab.length,
      spd_covariance_valid: this.spdCovValid,
      bg_sigma: this.bgSigma,
      has_chunk_sha256: Boolean(this.chunkShaBytes),
      chunk_sha256_count: this.chunkShaBytes ? Math.floor(this.chunkShaBytes.length / 32) : 0,
      graph_edges_count: this.index.graph?.edges?.length || 0,
      shard_seals: this.shardSeals,
      empirical_replication_credit: 0,
      human_closure_required: true,
      release_authority: false
    };
  }

  _hasStemMatch(tok) {
    if (tok.length < 5) return false;
    const prefix = tok.slice(0, 5);
    for (const v of this.vocab) {
      if (v.length >= 5 && v.startsWith(prefix) && Math.abs(v.length - tok.length) <= 4) return true;
    }
    return false;
  }

  _buildQuerySvdVector(words) {
    const raw = new Float64Array(this.M);
    const emitFeature = (feat, weight) => {
      const h1 = fnv1a32(feat, 0x811c9dc5);
      const h2 = fnv1a32(feat, 0x9e3779b1);
      const bucket = h1 & (this.M - 1);
      const sign = (h2 & 1) === 0 ? 1 : -1;
      raw[bucket] += sign * weight;
    };
    const filtered = words.filter((w) => /^[a-z0-9_-]{2,}$/i.test(w) && !/^\d+$/.test(w));
    for (let i = 0; i < filtered.length; i++) {
      const w = filtered[i];
      emitFeature('w:' + w, 1.0);
      if (i + 1 < filtered.length) emitFeature('b:' + w + '_' + filtered[i + 1], 0.75);
      if (w.length >= 4 && w.length <= 18) {
        const limit = Math.min(w.length - 3, 6);
        for (let c = 0; c < limit; c++) {
          emitFeature('c:' + w.slice(c, c + 4), 0.25);
        }
      }
    }
    let normSq = 0;
    for (let j = 0; j < this.M; j++) {
      const v = raw[j];
      if (v !== 0) {
        const scaled = Math.sign(v) * (1 + Math.log(1 + Math.abs(v))) * this.idfDim[j];
        raw[j] = scaled;
        normSq += scaled * scaled;
      }
    }
    const norm = Math.sqrt(normSq);
    if (norm > 1e-12) {
      for (let j = 0; j < this.M; j++) raw[j] /= norm;
    }

    const qProj = new Float64Array(this.K);
    let pNormSq = 0;
    for (let k = 0; k < this.K; k++) {
      let dot = 0;
      for (let j = 0; j < this.M; j++) {
        dot += (raw[j] - this.meanVec[j]) * this.basisVk[j * this.K + k];
      }
      qProj[k] = dot;
      pNormSq += dot * dot;
    }
    const pNorm = Math.sqrt(pNormSq) || 1;
    for (let k = 0; k < this.K; k++) qProj[k] /= pNorm;
    return qProj;
  }

  _expandMeta(doc) {
    const m = this.sourcesMeta[doc.ci] || {};
    const uk = typeof doc.uk === 'number' ? (this.unitKinds[doc.uk] || 'source_passage') : doc.uk;
    const tags = Array.isArray(doc.tg)
      ? doc.tg.map(([ti, ri]) => ({
        tag: typeof ti === 'number' ? this.tagNames[ti] : ti,
        rung: typeof ri === 'number' ? this.rungNames[ri] : ri
      }))
      : [];
    return { m, uk, tags };
  }

  neighbors(nodeId, {
    direction = 'ALL',
    rel = null,
    limit = 40,
    deployment_env = resolveDeploymentEnvironment(),
    operator_secret_verified = false
  } = {}) {
    const custGate = this._checkCustodyGate({ deployment_env, operator_secret_verified });
    if (!custGate.readable) {
      return {
        status: custGate.status,
        node_id: nodeId,
        edges: [],
        total_edges: 0,
        relation_promotion_allowed: false,
        causal_relation_inferred: false,
        empirical_replication_credit: 0,
        human_closure_required: true,
        release_authority: false
      };
    }
    const key = String(nodeId || '').trim();
    const rawList = this.graphAdjacency.get(key) || [];
    const dirNorm = String(direction || 'ALL').toUpperCase();
    const filtered = rawList.filter((e) => {
      if (dirNorm === 'OUT' && e.direction !== 'OUT') return false;
      if (dirNorm === 'IN' && e.direction !== 'IN') return false;
      if (rel && e.rel !== rel) return false;
      return true;
    }).map((e) => ({
      ...e,
      neighbor_meta: this.nodeInfo.get(e.neighbor) || null
    }));

    return {
      status: filtered.length ? 'NEIGHBORS_OK' : 'NODE_OR_EDGES_NOT_FOUND',
      node_id: key,
      node: this.nodeInfo.get(key) || null,
      total_edges: filtered.length,
      edges: filtered.slice(0, Math.max(1, Math.min(200, Number(limit) || 40))),
      relation_promotion_allowed: false,
      causal_relation_inferred: false,
      empirical_replication_credit: 0,
      human_closure_required: true,
      release_authority: false
    };
  }

  route(fromId, toId, {
    maxDepth = 6,
    rel = null,
    deployment_env = resolveDeploymentEnvironment(),
    operator_secret_verified = false
  } = {}) {
    const custGate = this._checkCustodyGate({ deployment_env, operator_secret_verified });
    if (!custGate.readable) {
      return {
        status: custGate.status,
        from: fromId,
        to: toId,
        found: false,
        nodes: [],
        edges: [],
        relation_promotion_allowed: false,
        causal_relation_inferred: false,
        empirical_replication_credit: 0,
        human_closure_required: true,
        release_authority: false
      };
    }
    const start = String(fromId || '').trim();
    const target = String(toId || '').trim();
    const capDepth = Math.max(1, Math.min(8, Number(maxDepth) || 6));
    if (!start || !target) {
      return { status: 'INVALID_ROUTE_ENDPOINTS', found: false, nodes: [], edges: [], relation_promotion_allowed: false, causal_relation_inferred: false, empirical_replication_credit: 0, human_closure_required: true, release_authority: false };
    }
    if (start === target) {
      return { status: 'ROUTE_TRIVIAL_SELF', found: true, hop_count: 0, nodes: [start], edges: [], relation_promotion_allowed: false, causal_relation_inferred: false, empirical_replication_credit: 0, human_closure_required: true, release_authority: false };
    }

    const queue = [{ id: start, depth: 0 }];
    const visited = new Set([start]);
    const parent = new Map();

    while (queue.length > 0) {
      const cur = queue.shift();
      if (cur.depth >= capDepth) continue;
      const adj = this.graphAdjacency.get(cur.id) || [];
      for (const e of adj) {
        if (rel && e.rel !== rel) continue;
        if (visited.has(e.neighbor)) continue;
        visited.add(e.neighbor);
        parent.set(e.neighbor, { prev: cur.id, edge: e });
        if (e.neighbor === target) {
          const nodes = [];
          const edges = [];
          let trace = target;
          while (trace !== start) {
            nodes.push(trace);
            const p = parent.get(trace);
            edges.push(p.edge);
            trace = p.prev;
          }
          nodes.push(start);
          nodes.reverse();
          edges.reverse();
          return {
            status: 'ROUTE_FOUND',
            from: start,
            to: target,
            found: true,
            hop_count: edges.length,
            max_depth: capDepth,
            nodes,
            edges,
            relation_promotion_allowed: false,
            causal_relation_inferred: false,
            empirical_replication_credit: 0,
            human_closure_required: true,
            release_authority: false
          };
        }
        queue.push({ id: e.neighbor, depth: cur.depth + 1 });
      }
    }

    return {
      status: 'ROUTE_NOT_FOUND_WITHIN_DEPTH',
      from: start,
      to: toId,
      found: false,
      hop_count: null,
      max_depth: capDepth,
      nodes: [],
      edges: [],
      relation_promotion_allowed: false,
      causal_relation_inferred: false,
      empirical_replication_credit: 0,
      human_closure_required: true,
      release_authority: false
    };
  }

  context(nodeId, {
    radius = 1,
    maxNeighbors = 25,
    deployment_env = resolveDeploymentEnvironment(),
    operator_secret_verified = false
  } = {}) {
    const custGate = this._checkCustodyGate({ deployment_env, operator_secret_verified });
    if (!custGate.readable) {
      return {
        status: custGate.status,
        node_id: nodeId,
        nodes: [],
        edges: [],
        relation_promotion_allowed: false,
        causal_relation_inferred: false,
        empirical_replication_credit: 0,
        human_closure_required: true,
        release_authority: false
      };
    }
    const root = String(nodeId || '').trim();
    const capRadius = Math.max(1, Math.min(3, Number(radius) || 1));
    const capEdges = Math.max(1, Math.min(100, Number(maxNeighbors) || 25));
    const seenNodes = new Set([root]);
    const collectedEdges = [];
    let frontier = [root];

    for (let r = 0; r < capRadius && collectedEdges.length < capEdges; r++) {
      const nextFrontier = [];
      for (const cur of frontier) {
        for (const e of (this.graphAdjacency.get(cur) || [])) {
          if (collectedEdges.length >= capEdges) break;
          collectedEdges.push(e);
          if (!seenNodes.has(e.neighbor)) {
            seenNodes.add(e.neighbor);
            nextFrontier.push(e.neighbor);
          }
        }
      }
      frontier = nextFrontier;
    }

    const matchingDocs = [];
    for (let i = 0; i < this.docs.length && matchingDocs.length < 12; i++) {
      const d = this.docs[i];
      const m = this.sourcesMeta[d.ci] || {};
      if (d.id === root || m.work_id === root || m.source_file_id === root || m.instrument_id === root) {
        matchingDocs.push({
          id: d.id,
          unit_kind: typeof d.uk === 'number' ? this.unitKinds[d.uk] : d.uk,
          char_offset: d.off || 0,
          char_length: d.len || 0,
          byte_offset: d.boff ?? null,
          byte_length: d.blen ?? null,
          chunk_sha256: this._getChunkSha256(i),
          snippet: d.sn || ''
        });
      }
    }

    return {
      status: collectedEdges.length || matchingDocs.length ? 'CONTEXT_OK' : 'NODE_NOT_FOUND',
      node_id: root,
      node: this.nodeInfo.get(root) || null,
      radius: capRadius,
      neighbors: [...seenNodes].filter((id) => id !== root).map((id) => this.nodeInfo.get(id) || { id }),
      edges: collectedEdges,
      indexed_units_sample: matchingDocs,
      relation_promotion_allowed: false,
      causal_relation_inferred: false,
      empirical_replication_credit: 0,
      human_closure_required: true,
      release_authority: false
    };
  }

  facets({
    deployment_env = resolveDeploymentEnvironment(),
    operator_secret_verified = false
  } = {}) {
    const custGate = this._checkCustodyGate({ deployment_env, operator_secret_verified });
    if (!custGate.readable) {
      return {
        status: custGate.status,
        unit_kinds: {},
        formats: {},
        clusters: {},
        custody_statuses: {},
        empirical_replication_credit: 0,
        human_closure_required: true,
        release_authority: false
      };
    }
    const countMap = (fn) => {
      const counts = {};
      for (const d of this.docs) {
        const key = fn(d);
        if (!key) continue;
        counts[key] = (counts[key] || 0) + 1;
      }
      return counts;
    };
    return {
      status: 'FACETS_OK',
      total_indexed_units: this.N,
      unit_kinds: countMap((d) => (typeof d.uk === 'number' ? this.unitKinds[d.uk] : d.uk)),
      formats: countMap((d) => (this.sourcesMeta[d.ci]?.format || 'unknown')),
      clusters: countMap((d) => (this.sourcesMeta[d.ci]?.cluster || 'UNCLUSTERED')),
      custody_statuses: countMap((d) => (this.sourcesMeta[d.ci]?.cust || 'UNKNOWN')),
      appledouble_quarantined_c4: this.index.corpus_custody?.appledouble_quarantined_c4 || 33,
      batch_b_pending_count: this.index.corpus_custody?.batch_b_pending_count || 7,
      manifestation_count_invariant: [32, 40],
      empirical_replication_credit: 0,
      human_closure_required: true,
      release_authority: false
    };
  }

  async exactSearch(query, opts = {}) {
    const custGate = this._checkCustodyGate(opts);
    if (!custGate.readable) {
      return {
        status: custGate.status,
        mode: 'exact_utf8_bytes',
        query: clampQueryBounds(query),
        total_hits: 0,
        returned_hits: 0,
        hits: [],
        empirical_replication_credit: 0,
        human_closure_required: true,
        release_authority: false
      };
    }
    return exactSearchInExperimentAShards(query, {
      ...opts,
      deployment_env: custGate.env,
      operator_secret_verified: Boolean(opts.operator_secret_verified)
    });
  }

  async searchAsync(query, opts = {}) {
    const mode = SUPPORTED_SEARCH_MODES.includes(String(opts.mode || '').toLowerCase())
      ? String(opts.mode).toLowerCase()
      : 'hybrid';
    const custGate = this._checkCustodyGate(opts);
    if (!custGate.readable) {
      return {
        status: custGate.status,
        engine_version: SEARCH_ENGINE_VERSION,
        mode,
        query: clampQueryBounds(query),
        total_hits: 0,
        returned_hits: 0,
        hits: [],
        empirical_replication_credit: 0,
        human_closure_required: true,
        release_authority: false
      };
    }
    if (mode === 'exact') {
      return this.exactSearch(query, opts);
    }
    const parsed = parseStructuredQuery(query, mode);
    const needsBodyVerification = mode === 'phrase' || mode === 'src_projective' || parsed.phrases.length > 0 || parsed.excludes.length > 0 || parsed.excludePhrases.length > 0;
    if (needsBodyVerification && this.shardTexts.size === 0 && opts.loadShards !== false) {
      try {
        const { loadExperimentAShard } = await import('./corpus-experiment-a.mjs');
        const [p1, p2] = await Promise.all([
          loadExperimentAShard(1, { baseUrl: opts.baseUrl || '' }),
          loadExperimentAShard(2, { baseUrl: opts.baseUrl || '' })
        ]);
        this.attachShardTexts(p1, p2);
      } catch {
        // Offline / mock single-file engine test without shards still functions synchronously
      }
    }
    return this.search(query, { ...opts, mode });
  }

  search(query, {
    mode = 'hybrid',
    offset = 0,
    limit = 20,
    maxPerSource = 2,
    unitKindFilter = null,
    formatFilter = null,
    clusterFilter = null,
    includeBatchB = true,
    includeImages = true,
    collapseManifestations = false, // [32, 40] invariant: default false (keep .md and .pdf manifestations distinct!)
    uniqueSources = false,
    cursorToken = null,
    deployment_env = resolveDeploymentEnvironment(),
    operator_secret_verified = false,
    fusion = null
  } = {}) {
    const safeOffset = Math.max(0, Number(offset) || 0);
    const safeLimit = Math.max(1, Math.min(200, Number(limit) || 20));
    const parsed = parseStructuredQuery(query, mode);
    const fusionControls=normalizeFusionControls(fusion);

    const custGate = this._checkCustodyGate({ deployment_env, operator_secret_verified });
    if (!custGate.readable) {
      return {
        status: custGate.status,
        engine_version: SEARCH_ENGINE_VERSION,
        mode: parsed.mode,
        query: parsed.rawNfc,
        total_hits: 0,
        returned_hits: 0,
        hits: [],
        pagination: { offset: safeOffset, limit: safeLimit, total_hits: 0, has_more: false, next_offset: null, cursor_token: null },
        empirical_replication_credit: 0,
        manifestation_count_invariant: [32, 40],
        human_closure_required: true,
        release_authority: false,
        aperture_observability: { abstain: true, reason: custGate.status, condition_number_kappa: Infinity, spd_covariance_valid: this.spdCovValid }
      };
    }

    if (!parsed.rawNfc) {
      return {
        status: 'EMPTY_QUERY',
        engine_version: SEARCH_ENGINE_VERSION,
        mode: parsed.mode,
        query: '',
        total_hits: 0,
        returned_hits: 0,
        hits: [],
        pagination: { offset: 0, limit: safeLimit, total_hits: 0, has_more: false, next_offset: null, cursor_token: null },
        empirical_replication_credit: 0,
        manifestation_count_invariant: [32, 40],
        human_closure_required: true,
        release_authority: false,
        aperture_observability: { abstain: true, reason: 'Empty query', condition_number_kappa: 1, spd_covariance_valid: this.spdCovValid }
      };
    }

    // Tightened Cross-Opera Quarantine Firewall (NO bypass on mixed queries like "vixen G-001")
    if (CROSS_OPERA_QUARANTINE_RE.test(parsed.rawNfc)) {
      return {
        status: 'CROSS_OPERA_QUARANTINED',
        engine_version: SEARCH_ENGINE_VERSION,
        mode: parsed.mode,
        query: parsed.rawNfc,
        total_hits: 0,
        returned_hits: 0,
        hits: [],
        pagination: { offset: safeOffset, limit: safeLimit, total_hits: 0, has_more: false, next_offset: null, cursor_token: null },
        empirical_replication_credit: 0,
        manifestation_count_invariant: [32, 40],
        human_closure_required: true,
        release_authority: false,
        aperture_observability: {
          abstain: true,
          quarantine_reason: 'CROSS_OPERA_TOKEN_QUARANTINED',
          condition_number_kappa: Infinity,
          spd_covariance_valid: this.spdCovValid
        }
      };
    }

    if (!parsed.positiveRaw) {
      return {
        status: 'EMPTY_POSITIVE_QUERY',
        engine_version: SEARCH_ENGINE_VERSION,
        mode: parsed.mode,
        query: parsed.rawNfc,
        total_hits: 0,
        returned_hits: 0,
        hits: [],
        pagination: { offset: safeOffset, limit: safeLimit, total_hits: 0, has_more: false, next_offset: null, cursor_token: null },
        empirical_replication_credit: 0,
        manifestation_count_invariant: [32, 40],
        human_closure_required: true,
        release_authority: false,
        aperture_observability: { abstain: true, reason: 'No positive terms after negative filters', condition_number_kappa: 1, spd_covariance_valid: this.spdCovValid }
      };
    }

    const expectedCursorToken = stableBindingHash({
      query: parsed.rawNfc,
      mode: parsed.mode,
      unitKindFilter: unitKindFilter || null,
      formatFilter: formatFilter || null,
      clusterFilter: clusterFilter || null,
      includeBatchB: Boolean(includeBatchB),
      includeImages: Boolean(includeImages),
      collapseManifestations: Boolean(collapseManifestations),
      uniqueSources: Boolean(uniqueSources),
      fusion_controls:fusionControls,
      deployment_env: custGate.env,
      operator_secret_verified: Boolean(operator_secret_verified),
      index_sha256: this.indexBindingFingerprint
    });

    if (cursorToken && cursorToken !== expectedCursorToken) {
      return {
        status: 'CURSOR_MISMATCH',
        engine_version: SEARCH_ENGINE_VERSION,
        mode: parsed.mode,
        query: parsed.rawNfc,
        total_hits: 0,
        returned_hits: 0,
        hits: [],
        pagination: {
          offset: safeOffset,
          limit: safeLimit,
          total_hits: 0,
          has_more: false,
          next_offset: null,
          cursor_token: expectedCursorToken
        },
        empirical_replication_credit: 0,
        manifestation_count_invariant: [32, 40],
        human_closure_required: true,
        release_authority: false,
        aperture_observability: { abstain: true, reason: 'CURSOR_BINDING_MISMATCH', condition_number_kappa: Infinity, spd_covariance_valid: this.spdCovValid }
      };
    }

    const semioticProfile = inferQuerySemioticProfile(parsed.positiveNfc, parsed.positiveLow, parsed.tokens);
    const srcCond = deriveSrcQueryConditionedWeights(
      parsed.positiveNfc || parsed.rawNfc,
      parsed.mode,
      { semiotic: semioticProfile }
    );
    const srcWeights = srcCond.weights;

    // Evaluate vocabulary hits and alphabetic support strictly on POSITIVE terms BEFORE -exclude
    const alphaTokens = parsed.tokens.filter((t) => /[a-z\p{L}]{2,}/u.test(t));
    const longAlphaTokens = alphaTokens.filter((t) => t.replace(/[^a-z\p{L}]/giu, '').length >= 3);

    const matchedTids = [];
    let knownAlphaCount = 0;
    let stemMatchedAlphaCount = 0;

    for (const tok of parsed.tokens) {
      const tid = this.vocabMap.get(tok);
      if (tid !== undefined) {
        matchedTids.push({ tok, tid });
        if (/[a-z\p{L}]{2,}/u.test(tok)) knownAlphaCount++;
      } else if (/[a-z\p{L}]{4,}/u.test(tok) && this._hasStemMatch(tok)) {
        stemMatchedAlphaCount++;
      }
    }

    const hasOovCompound = parsed.compounds.some(({ parts }) => {
      const aParts = parts.filter((p) => /[a-z\p{L}]{3,}/u.test(p));
      return aParts.length > 0 && aParts.every((p) => !this.vocabMap.has(p) && !this._hasStemMatch(p));
    });

    if (!srcCond.analysis.hasSrcUntypicalCue
        && ((longAlphaTokens.length > 0 && knownAlphaCount === 0 && stemMatchedAlphaCount === 0 && semioticProfile.tags.length === 0)
        || (hasOovCompound && knownAlphaCount === 0 && semioticProfile.tags.length === 0))) {
      return {
        status: 'OOV_ALPHABETIC_CANARY_ABSTENTION',
        engine_version: SEARCH_ENGINE_VERSION,
        mode: parsed.mode,
        query: parsed.rawNfc,
        total_hits: 0,
        returned_hits: 0,
        hits: [],
        pagination: {
          offset: safeOffset,
          limit: safeLimit,
          total_hits: 0,
          has_more: false,
          next_offset: null,
          cursor_token: expectedCursorToken
        },
        empirical_replication_credit: 0,
        manifestation_count_invariant: [32, 40],
        human_closure_required: true,
        release_authority: false,
        aperture_observability: {
          abstain: true,
          firewall: 'APERTURE_NEGATIVE_CANARY_ZERO_GUARD',
          known_alpha_tokens: 0,
          condition_number_kappa: Infinity,
          spd_covariance_valid: this.spdCovValid
        }
      };
    }

    const alphaDenom = Math.max(1, alphaTokens.length);
    const alphaSupport = +Math.min(1, (knownAlphaCount + 0.55 * stemMatchedAlphaCount + 0.35 * semioticProfile.tags.length) / alphaDenom).toFixed(4);
    const supportGate = alphaSupport >= 0.45 ? 1 : (alphaSupport > 0 ? alphaSupport / 0.45 : 0);

    // Channel 1: Exact Fielded BM25F over delta-varint postings + matched token provenance
    const lexRawScores = new Float64Array(this.N);
    const matchedTermsByDoc = new Map();
    let maxLexRaw = 0;
    const state = { pos: 0 };

    for (const { tok, tid } of matchedTids) {
      const df = this.dfArr[tid];
      if (!df) continue;
      const idf = Math.log(1 + (this.N - df + 0.5) / (df + 0.5));
      const startOff = this.postOffsets[tid];
      const endOff = startOff + this.postLengths[tid];
      state.pos = startOff;
      let docIdx = 0;

      while (state.pos < endOff) {
        const delta = readVarint(this.postBytes, state);
        docIdx += delta;
        const mask = this.postBytes[state.pos++];
        const fl = this.docs[docIdx]?.fl || [1, 1, 1, 1];
        let pseudoTf = 0;
        for (let f = 0; f < 4; f++) {
          if (mask & (1 << f)) {
            const tf = readVarint(this.postBytes, state);
            const normLen = 1 - this.fieldB[f] + this.fieldB[f] * (fl[f] / Math.max(0.1, this.avgFl[f]));
            pseudoTf += this.fieldWeights[f] * (tf / Math.max(0.25, normLen));
          }
        }
        const termScore = idf * ((pseudoTf * (this.k1 + 1)) / (pseudoTf + this.k1));
        const nextVal = lexRawScores[docIdx] + termScore;
        lexRawScores[docIdx] = nextVal;
        if (nextVal > maxLexRaw) maxLexRaw = nextVal;

        let tSet = matchedTermsByDoc.get(docIdx);
        if (!tSet) {
          tSet = new Set();
          matchedTermsByDoc.set(docIdx, tSet);
        }
        tSet.add(tok);
      }
    }

    // Channel 2: Centered 256->48D Hashed-Jacobi SVD Semantic Similarity (Hybrid mode)
    const useSvdChannel = parsed.mode === 'hybrid';
    const qSvd = useSvdChannel && supportGate > 0 && this.spdCovValid
      ? this._buildQuerySvdVector(parsed.rawTokens)
      : null;
    const semScores = new Float64Array(this.N);
    const semZScores = new Float64Array(this.N);
    let bgZMax = 0;

    if (qSvd) {
      for (let i = 0; i < this.N; i++) {
        const sc = this.docScalesF32[i];
        let dot = 0;
        const base = i * this.K;
        for (let k = 0; k < this.K; k++) {
          dot += qSvd[k] * (this.docVecsI8[base + k] * sc);
        }
        const z = (dot - this.bgMu) / this.bgSigma;
        semZScores[i] = z;
        if (z > bgZMax) bgZMax = z;
        if (z > 1.25) {
          const sig = 1 / (1 + Math.exp(-0.85 * (z - 1.6)));
          semScores[i] = +(supportGate * sig).toFixed(4);
        }
      }
    }

    const candidates = [];
    let excludedByNegativeCount = 0;
    const hasNegatives = parsed.excludes.length > 0 || parsed.excludePhrases.length > 0;

    for (let i = 0; i < this.N; i++) {
      const sLex = maxLexRaw > 0 ? Math.min(1, lexRawScores[i] / Math.max(2.5, maxLexRaw * 0.92)) : 0;
      const sSem = semScores[i];

      const doc = this.docs[i];
      const { m, uk, tags } = this._expandMeta(doc);

      if (unitKindFilter && uk !== unitKindFilter) continue;
      if (formatFilter && m.format !== formatFilter) continue;
      if (clusterFilter && m.cluster !== clusterFilter) continue;
      if (!includeBatchB && uk === 'prospective_batch_b') continue;
      if (!includeImages && uk === 'image_asset') continue;

      const docMatchedTerms = matchedTermsByDoc.get(i);
      const rawBody = this.shardTexts.get(m.source_file_id || m.instrument_id || '') || null;
      const rawChunkSlice = rawBody && (doc.len || 0) > 0
        ? scrubBase64BlobsForDisplay(rawBody.slice(doc.off || 0, (doc.off || 0) + (doc.len || 0)).normalize('NFC'))
        : null;
      const metaHayLow = [
        doc.id,
        m.title,
        m.original_filename,
        m.work_id,
        m.source_file_id,
        m.instrument_id,
        m.cluster,
        doc.sn,
        tags.map((t) => t.tag).join(' '),
        (m.protocol_ids || []).join(' ')
      ].filter(Boolean).join(' ').toLowerCase();
      const fullHayLow = rawChunkSlice ? `${metaHayLow} ${rawChunkSlice.toLowerCase()}` : metaHayLow;

      // Mandatory -exclude VETO BEFORE SVD/dedup/pagination
      if (hasNegatives) {
        const vetoTerm = parsed.excludes.some((ex) => hayMatchesTerm(fullHayLow, ex))
          || parsed.excludePhrases.some((ep) => fullHayLow.includes(ep));
        if (vetoTerm) {
          excludedByNegativeCount++;
          continue;
        }
      }

      // Required phrase verification (quoted "..." or mode === 'phrase')
      let phraseMatchBoost = 0;
      let matchedPhraseLabel = null;
      if (parsed.phrases.length > 0) {
        let allPhrasesSatisfied = true;
        for (let pIdx = 0; pIdx < parsed.phrases.length; pIdx++) {
          const phr = parsed.phrases[pIdx];
          const pToks = parsed.phraseTokenLists[pIdx] || [];
          if (fullHayLow.includes(phr)) {
            matchedPhraseLabel = phr;
            continue;
          }
          if (rawChunkSlice) {
            // Chunk body is attached and exact phrase does NOT appear anywhere in this chunk!
            allPhrasesSatisfied = false;
            break;
          }
          // When running synchronously without attached shard bodies, require ALL phrase tokens in BM25F postings
          const tokensPresent = pToks.length > 0 && pToks.every((pt) => docMatchedTerms?.has(pt));
          if (!tokensPresent) {
            allPhrasesSatisfied = false;
            break;
          }
          matchedPhraseLabel = `${phr} [all-tokens]`;
        }
        if (!allPhrasesSatisfied) continue;
        phraseMatchBoost = 0.22;
      }

      // Channel 3: Semiotic Plane/Cluster/Protocol/Tag Affinity + Rung Cap
      let sSemi = 0;
      let highestRung = 'MOTIF_MATCH';
      const why = [];

      if (fusionControls.channels.lexical && docMatchedTerms && docMatchedTerms.size > 0) {
        why.push(`bm25f terms: ${[...docMatchedTerms].slice(0, 6).join(', ')}`);
      }
      if (fusionControls.channels.lexical && matchedPhraseLabel) {
        why.push(`phrase match: "${matchedPhraseLabel}"`);
      }

      if (fusionControls.channels.semiotic && semioticProfile.planeVec && Array.isArray(doc.pv)) {
        let pDot = 0;
        for (let p = 0; p < 4; p++) pDot += semioticProfile.planeVec[p] * (doc.pv[p] || 0);
        if (pDot > 0) {
          sSemi += 0.35 * pDot;
          why.push(`plane affinity (${pDot.toFixed(2)})`);
        }
      }
      if (fusionControls.channels.semiotic && semioticProfile.clusters.size && m.cluster && semioticProfile.clusters.has(m.cluster)) {
        sSemi += 0.25;
        highestRung = 'STRUCTURAL_ANALOGY_CANDIDATE';
        why.push(`cluster match: ${m.cluster}`);
      }
      if (fusionControls.channels.semiotic && semioticProfile.workMatches.size && m.work_id && semioticProfile.workMatches.has(m.work_id.toLowerCase())) {
        sSemi += 0.30;
        highestRung = 'MECHANISM_CANDIDATE';
        why.push(`work id: ${m.work_id}`);
      }
      if (fusionControls.channels.semiotic && semioticProfile.protoMatches.size) {
        const hitProto = (m.protocol_ids || []).some((p) => semioticProfile.protoMatches.has(String(p).toLowerCase()))
          || (m.source_file_id && semioticProfile.protoMatches.has(m.source_file_id.toLowerCase()));
        if (hitProto) {
          sSemi += 0.30;
          highestRung = 'MECHANISM_CANDIDATE';
          why.push('protocol/source id match');
        }
      }
      if (fusionControls.channels.semiotic && semioticProfile.tags.length && tags.length) {
        let tagHits = 0;
        const matchedTags = [];
        for (const tObj of tags) {
          if (semioticProfile.tags.includes(tObj.tag)) {
            tagHits++;
            matchedTags.push(`${tObj.tag}[${tObj.rung}]`);
            if (RUNG_CEILINGS[tObj.rung] > RUNG_CEILINGS[highestRung]) {
              highestRung = tObj.rung;
            }
          }
        }
        if (tagHits > 0) {
          sSemi += Math.min(0.45, 0.25 * tagHits);
          why.push(`semiotic: ${matchedTags.join(', ')}`);
        }
      }

      const ceiling = RUNG_CEILINGS[highestRung] ?? 0.55;
      sSemi = Math.min(ceiling, Math.min(1, sSemi));

      if (fusionControls.channels.semantic && useSvdChannel && sSem >= 0.42 && alphaSupport >= 0.5) {
        why.push(`svd z=${semZScores[i].toFixed(2)}`);
      }

      const srcTextHint = (m.source_file_id && this.shardTexts.get(m.source_file_id))
        || (m.instrument_id && this.shardTexts.get(m.instrument_id))
        || doc.sn
        || '';
      const useSrcScoring = fusionControls.channels.src && ((parsed.mode === 'hybrid' && srcCond.analysis.hasSrcUntypicalCue) || parsed.mode === 'src_projective');
      const srcEval = useSrcScoring
        ? scoreSrcUntypicalDocument(srcCond.analysis, m, srcTextHint)
        : { s_src_proj: 0, s_src_sig: 0, s_src_combined: 0, matched_tokens: [], matched_signatures: [], explore_match_type: null };

      if (srcEval.matched_signatures.length > 0) {
        why.push(`SRC signature [${srcCond.regimeId}]: ${srcEval.matched_signatures.join(', ')}`);
        if ((RUNG_CEILINGS.STRUCTURAL_ANALOGY_CANDIDATE || 0.55) > (RUNG_CEILINGS[highestRung] || 0)) {
          highestRung = 'STRUCTURAL_ANALOGY_CANDIDATE';
        }
      }
      if (srcEval.explore_match_type) {
        why.push(`SRC Explore target (${srcEval.explore_match_type})`);
      }
      if (srcEval.matched_tokens.length > 0) {
        why.push(`SRC coordinates: ${srcEval.matched_tokens.slice(0, 5).join(', ')}`);
      }

      // Feature controls are a bounded *ablation* of actual retrieval channels.
      // Compute raw diagnostics unchanged; disabled channels cannot authorize
      // eligibility, add score, or manufacture an evidence rung.
      const active=fusionControls.channels;
      const evidLex=active.lexical&&(sLex>=0.08||(parsed.phrases.length>0&&phraseMatchBoost>0));
      const evidSem=active.semantic&&sSem>=0.42&&alphaSupport>=0.5;
      const evidSemi=active.semiotic&&sSemi>=(parsed.mode==='src_projective'?0.25:0.30);
      const evidSrc=active.src&&(parsed.mode==='src_projective'
        ?srcEval.s_src_combined>=0.14
        :(srcCond.analysis.hasSrcUntypicalCue&&srcEval.s_src_combined>=0.16));
      // Preserve the previous admission thresholds for an unmodified full
      // fusion request. A deliberate ablation uses only its active channels.
      const unmodifiedFusion=active.lexical&&active.semantic&&active.semiotic&&active.src;
      const originalEvidence=parsed.mode==='lexical'
        ?(sLex>=0.08||(parsed.phrases.length>0&&phraseMatchBoost>0))
        :(parsed.mode==='phrase'||parsed.mode==='exact')
          ?(phraseMatchBoost>0||sLex>=0.08)
          :parsed.mode==='src_projective'
            ?(srcEval.s_src_combined>=0.14||sLex>=0.08||sSemi>=0.25||phraseMatchBoost>0)
            :(sLex>=0.08||(sSem>=0.42&&alphaSupport>=0.5)||sSemi>=0.30||
              phraseMatchBoost>0||(srcCond.analysis.hasSrcUntypicalCue&&srcEval.s_src_combined>=0.16));
      if(!(unmodifiedFusion?originalEvidence:(evidLex||evidSem||evidSemi||evidSrc)))continue;

      const titleLow=String(m.title||'').toLowerCase();
      const titlePhraseBonus=active.lexical&&parsed.positiveLow.length>=4&&titleLow.includes(parsed.positiveLow)?0.14:0;
      const kindPrior=uk==='work_route'||uk==='instrument_record'?0.04:0;
      const fusionScore=scoreFusionChannels({
        lexical:sLex,semantic:sSem,semiotic:sSemi,
        src_proj:srcEval.s_src_proj,src_sig:srcEval.s_src_sig
      },fusionControls,parsed.mode,srcCond.analysis.hasSrcUntypicalCue,srcWeights);
      const total=Math.min(1,fusionScore.active_score+
        (active.lexical?phraseMatchBoost:0)+titlePhraseBonus+kindPrior);
      if(total<0.09)continue;

      let displaySnippet = doc.sn || '';
      if (rawChunkSlice && parsed.phrases.length > 0 && rawChunkSlice.toLowerCase().includes(parsed.phrases[0])) {
        displaySnippet = makeCenteredSnippetFromBody(rawChunkSlice, parsed.phrases[0], displaySnippet);
      } else if (rawChunkSlice && parsed.tokens.length > 0 && !displaySnippet) {
        displaySnippet = makeCenteredSnippetFromBody(rawChunkSlice, parsed.tokens[0], '');
      }

      const chunkSha = this._getChunkSha256(i);
      const isDuplicate = Boolean(m.duplicate_of_source_file_id);
      const sortScore = isDuplicate ? Math.max(0, total - 0.03) : total;
      if (isDuplicate) why.push(`duplicate_of:${m.duplicate_of_source_file_id}`);

      const deltaChan = +(sLex - sSem).toFixed(4);
      const docCustodyStatus = m.cust === 'EXPERIMENT_A_METADATA_ONLY_BINARY_PENDING_UPLOAD'
        ? 'EXPERIMENT_A_METADATA_ONLY_BINARY_PENDING_UPLOAD'
        : (m.cust || 'EXPERIMENT_A_PREVIEW_AUTHORIZED');

      candidates.push({
        docIdx: i,
        _sortScore: sortScore,
        id: doc.id,
        unit_kind: uk,
        work_id: m.work_id || null,
        source_file_id: m.source_file_id || null,
        instrument_id: m.instrument_id || null,
        title: m.title || m.original_filename || doc.id,
        original_filename: m.original_filename || null,
        cluster: m.cluster || null,
        identity_status: m.identity_status || null,
        gate_num: m.gate_num ?? null,
        format: m.format || null,
        media_type: m.media_type || null,
        custody_status: docCustodyStatus,
        body_representation: m.body_representation || null,
        shard: m.shard ?? null,
        offset_unit: 'UTF16_RAW',
        char_offset: doc.off || 0,
        char_length: doc.len || 0,
        byte_offset: doc.boff ?? null,
        byte_length: doc.blen ?? null,
        chunk_sha256: chunkSha,
        snippet: displaySnippet,
        why,
        page_span: doc.pg || null,
        page_count: m.page_count ?? null,
        sha256: m.sha256 || null,
        derivative_sha256: m.derivative_sha256 || null,
        duplicate_of_source_file_id: m.duplicate_of_source_file_id || null,
        source_clock: m.source_clock !== undefined ? m.source_clock : null,
        filesystem_clock_status: m.filesystem_clock_status || 'CHRONOLOGY_UNRESOLVED',
        dimensions: m.dimensions || null,
        plane_vec: doc.pv || [0, 0, 0, 0],
        protocol_ids: m.protocol_ids || [],
        semiotic_tags: tags,
        highest_rung: highestRung,
        score_total: +total.toFixed(4),
        fusion_controls:fusionControls,
        fusion_contributions:fusionScore.effective_contributions,
        fusion_normalization_factor:fusionScore.normalization_factor,
        fusion_active_weight_sum:fusionScore.active_weight_sum,
        s_lex: +sLex.toFixed(4),
        s_sem: +sSem.toFixed(4),
        s_semi: +sSemi.toFixed(4),
        s_src: srcEval.s_src_combined,
        s_src_proj: srcEval.s_src_proj,
        s_src_sig: srcEval.s_src_sig,
        src_regime: srcCond.regimeId,
        delta_chan: deltaChan,
        z_background: +semZScores[i].toFixed(3),
        citation: {
          id: doc.id,
          work_id: m.work_id || null,
          source_file_id: m.source_file_id || null,
          title: m.title || m.original_filename || doc.id,
          format: m.format || null,
          sha256: m.sha256 || null,
          chunk_sha256: chunkSha,
          char_offset: doc.off || 0,
          char_length: doc.len || 0,
          byte_offset: doc.boff ?? null,
          byte_length: doc.blen ?? null,
          claim_ceiling: highestRung
        },
        empirical_replication_credit: 0,
        paired_manifestation_preserved: true
      });
    }

    candidates.sort((a, b) => b._sortScore - a._sortScore || b.score_total - a.score_total || a.id.localeCompare(b.id));

    // FADT [32, 40] Non-Collapse + Equitable 2-Pass Work-Stratified Diversity
    let collapseVetoedForProtectedPairs = false;
    const perSourceMax = uniqueSources ? 1 : Math.max(1, Number(maxPerSource) || 2);
    const selectedIndices = new Set();
    const pass1Keys = new Set();
    const sourceUnitCounts = new Map();
    const collapsedWorkGroups = new Set();
    const diversified = [];

    // Pass 1: Equitable work/format diversity (1 top hit per (group, format) so all works & paired .md/.pdf rise fairly)
    for (let idx = 0; idx < candidates.length; idx++) {
      const h = candidates[idx];
      const isProtectedManifestation = h.gate_num !== null || h.format === 'md' || h.format === 'pdf';
      if (collapseManifestations && isProtectedManifestation && (h.gate_num !== null || h.format === 'md' || h.format === 'pdf')) {
        collapseVetoedForProtectedPairs = true;
      }
      if (collapseManifestations && !isProtectedManifestation) {
        const wKey = h.work_id || h.instrument_id || h.source_file_id || h.id;
        if (collapsedWorkGroups.has(wKey)) continue;
        collapsedWorkGroups.add(wKey);
      }

      const eqKey = `${h.work_id || h.instrument_id || h.source_file_id || h.id}:${h.format || ''}`;
      if (pass1Keys.has(eqKey)) continue;
      pass1Keys.add(eqKey);
      selectedIndices.add(idx);
      const srcKey = h.source_file_id ? `${h.source_file_id}:${h.unit_kind}` : h.id;
      sourceUnitCounts.set(srcKey, (sourceUnitCounts.get(srcKey) || 0) + 1);
      diversified.push(h);
    }

    // Pass 2: Remaining deeper passages up to perSourceMax per (source_file_id, unit_kind)
    for (let idx = 0; idx < candidates.length; idx++) {
      if (selectedIndices.has(idx)) continue;
      const h = candidates[idx];
      const isProtectedManifestation = h.gate_num !== null || h.format === 'md' || h.format === 'pdf';
      if (collapseManifestations && !isProtectedManifestation) continue;
      const srcKey = h.source_file_id ? `${h.source_file_id}:${h.unit_kind}` : h.id;
      const count = sourceUnitCounts.get(srcKey) || 0;
      if (count >= perSourceMax) continue;
      sourceUnitCounts.set(srcKey, count + 1);
      diversified.push(h);
    }

    const totalHits = diversified.length;
    const pageHits = diversified.slice(safeOffset, safeOffset + safeLimit);
    const hasMore = safeOffset + pageHits.length < totalHits;

    // Aperture full-K=48 Hestenes Jacobi SVD over top-12 retrieved vectors (NEVER clamped to svdSampleRows.length!)
    const svdSampleRows = [];
    for (const h of pageHits.slice(0, 12)) {
      const dIdx = h.docIdx;
      const sc = this.docScalesF32[dIdx];
      const row = new Float64Array(this.K);
      const base = dIdx * this.K;
      for (let k = 0; k < this.K; k++) row[k] = this.docVecsI8[base + k] * sc;
      svdSampleRows.push(row);
    }
    const qSvdAudit = hestenesJacobiSvd(svdSampleRows, this.K, 10, 1e-8);

    const sanitizedHits = pageHits.map(({ docIdx, _sortScore, ...rest }) => rest);

    const status = sanitizedHits.length > 0
      ? 'SEARCH_OK'
      : (totalHits > 0
        ? 'PAGE_OUT_OF_RANGE'
        : (excludedByNegativeCount > 0 ? 'EXCLUDED_BY_NEGATIVE_FILTER' : 'NO_MATCHING_WITNESSES'));

    return {
      status,
      engine_version: SEARCH_ENGINE_VERSION,
      mode: parsed.mode,
      query: parsed.rawNfc,
      tokens: parsed.tokens,
      phrases: parsed.phrases,
      excludes: parsed.excludes,
      excluded_by_negative_count: excludedByNegativeCount,
      all_candidate_chunks: candidates.length,
      fusion_controls:fusionControls,
      fusion_state:'FULL_INDEX_FUSION',
      src_conditioning: {
        regime_id: srcCond.regimeId,
        has_untypical_cue: srcCond.analysis.hasSrcUntypicalCue,
        weights: srcWeights,
        matched_signatures: srcCond.analysis.matchedSignatures,
        explore_cue: srcCond.analysis.exploreCue,
        active_strata: srcCond.analysis.activeStrata
      },
      total_hits: totalHits,
      returned_hits: sanitizedHits.length,
      pagination: {
        offset: safeOffset,
        limit: safeLimit,
        total_hits: totalHits,
        has_more: hasMore,
        next_offset: hasMore ? safeOffset + sanitizedHits.length : null,
        cursor_token: expectedCursorToken
      },
      collapse_vetoed_for_protected_pairs: collapseVetoedForProtectedPairs,
      hits: sanitizedHits,
      semiotic_markers_detected: {
        has_orchestrator_glyph: semioticProfile.hasOrchestratorGlyph,
        has_pua_operator_marker: semioticProfile.hasPuaOperatorMarker,
        has_zwnj: semioticProfile.hasZwnj,
        planes: PLANE_KEYS.filter((_, i) => (semioticProfile.planeVec?.[i] || 0) > 0),
        clusters: [...semioticProfile.clusters],
        tags: semioticProfile.tags
      },
      manifestation_count_invariant: [32, 40],
      empirical_replication_credit: 0,
      human_closure_required: true,
      release_authority: false,
      aperture_observability: {
        abstain: sanitizedHits.length === 0,
        alpha_support: alphaSupport,
        spd_covariance_valid: this.spdCovValid,
        background_z_max: +bgZMax.toFixed(3),
        condition_number_kappa: qSvdAudit.condition_number_kappa,
        effective_rank: qSvdAudit.effective_rank,
        top_mode_energy_e1: qSvdAudit.top_mode_energy_e1,
        jacobi_sweeps: qSvdAudit.sweeps,
        jacobi_residual: qSvdAudit.residual
      }
    };
  }
}

let SHARED_ENGINE_PROMISE = null;

export async function loadSemanticSemioticEngine(opts = {}) {
  if (!opts.forceReload && SHARED_ENGINE_PROMISE) return SHARED_ENGINE_PROMISE;
  SHARED_ENGINE_PROMISE = loadJsonSibling('semantic-semiotic-index.v1.json', {
    maxBytes: 2_000_000,
    ...opts
  })
    .then((raw) => new SemanticSemioticSearchEngine(raw))
    .catch((err) => {
      SHARED_ENGINE_PROMISE = null;
      throw err;
    });
  return SHARED_ENGINE_PROMISE;
}

/**
 * Synchronous lightweight fallback over #vixen-corpus-bundle metadata before the
 * deep index shard hydrates over HTTP. Uses the same OOV negative-canary firewall.
 */
export function createInlineFallbackEngine(corpusBundle = {}) {
  const works = Array.isArray(corpusBundle.works) ? corpusBundle.works : [];
  const instruments = Array.isArray(corpusBundle.instruments) ? corpusBundle.instruments : [];
  const folios = Array.isArray(corpusBundle.formula_folios) ? corpusBundle.formula_folios : [];
  const tracks = Array.isArray(corpusBundle.giveback_tracks) ? corpusBundle.giveback_tracks : [];
  const batchB = Array.isArray(corpusBundle.batch_b_files) ? corpusBundle.batch_b_files : [];

  const records = [];
  for (const w of works) {
    const lsList = Array.isArray(w.linked_sources) ? w.linked_sources : [];
    for (const ls of lsList) {
      records.push({
        id: ls.source_file_id,
        unit_kind: 'source_passage',
        work_id: w.work_id,
        source_file_id: ls.source_file_id,
        instrument_id: null,
        title: w.display_title || w.declared_title || w.work_id,
        original_filename: ls.original_filename,
        cluster: w.cluster || null,
        identity_status: w.identity_status,
        gate_num: w.human_gate_required ? w.gate_num : null,
        format: ls.media_type === 'application/pdf' ? 'pdf' : 'md',
        media_type: ls.media_type,
        custody_status: 'EXPERIMENT_A_PREVIEW_AUTHORIZED',
        body_representation: ls.media_type === 'application/pdf' ? 'EXTRACTED_NATIVE_PDF_TEXT' : 'NATIVE_MARKDOWN_TEXT',
        shard: works.indexOf(w) >= 16 ? 2 : 1,
        char_offset: 0,
        char_length: 0,
        page_count: ls.page_count || null,
        sha256: ls.sha256,
        protocol_ids: w.protocols || [],
        haystack: [
          w.work_id,
          w.display_title,
          w.declared_title,
          ...(w.title_variants || []),
          ls.source_file_id,
          ls.original_filename,
          w.cluster,
          ...(w.planes || []),
          ...(w.protocols || []),
          ...(w.identity_basis || []),
          ...(w.substantive_differences_if_any || []),
          ...(w.unresolved_questions || [])
        ].filter(Boolean).join(' ').normalize('NFC').toLowerCase()
      });
    }
  }
  for (const inst of instruments) {
    records.push({
      id: inst.instrument_id,
      unit_kind: 'instrument_record',
      work_id: null,
      source_file_id: inst.instrument_id,
      instrument_id: inst.instrument_id,
      title: inst.filename,
      original_filename: inst.filename,
      cluster: null,
      identity_status: 'DOCUMENTARY_PROTOCOL',
      gate_num: null,
      format: 'md',
      media_type: 'text/markdown; charset=utf-8',
      custody_status: 'EXPERIMENT_A_PREVIEW_AUTHORIZED',
      shard: 2,
      char_offset: 0,
      char_length: 0,
      sha256: inst.sha256,
      protocol_ids: [inst.instrument_id],
      haystack: [inst.instrument_id, inst.filename, inst.family, inst.scope, inst.historical_execution_classification].filter(Boolean).join(' ').toLowerCase()
    });
  }
  for (const f of folios) {
    records.push({
      id: f.id,
      unit_kind: 'synthesis_folio',
      work_id: (f.links || []).find((x) => x.startsWith('emwork_')) || null,
      source_file_id: f.id,
      title: f.title,
      identity_status: f.status,
      format: 'folio',
      custody_status: 'EXPERIMENT_A_PREVIEW_AUTHORIZED',
      char_offset: 0,
      char_length: 0,
      protocol_ids: (f.links || []).filter((x) => !x.startsWith('emwork_')),
      haystack: [f.id, f.group, f.title, f.summary, f.fallback, f.ceiling, ...(f.links || [])].filter(Boolean).join(' ').toLowerCase()
    });
  }
  for (const t of tracks) {
    records.push({
      id: t.id,
      unit_kind: 'giveback_track',
      work_id: null,
      source_file_id: t.id,
      title: t.title,
      identity_status: t.status,
      format: 'track',
      custody_status: 'EXPERIMENT_A_PREVIEW_AUTHORIZED',
      char_offset: 0,
      char_length: 0,
      protocol_ids: t.protocols || [],
      haystack: [t.id, t.title, t.summary, t.status, ...(t.protocols || [])].filter(Boolean).join(' ').toLowerCase()
    });
  }
  for (const b of batchB) {
    records.push({
      id: b.source_file_id,
      unit_kind: 'prospective_batch_b',
      work_id: null,
      source_file_id: b.source_file_id,
      title: b.original_filename,
      original_filename: b.original_filename,
      identity_status: 'PROSPECTIVE_BATCH_B_UNPAIRED',
      format: 'pdf',
      media_type: b.media_type,
      custody_status: 'EXPERIMENT_A_METADATA_ONLY_BINARY_PENDING_UPLOAD',
      body_representation: 'BINARY_PENDING_UPLOAD_NO_TEXT',
      page_count: b.page_count,
      source_clock: b.source_clock,
      sha256: b.sha256,
      char_offset: 0,
      char_length: 0,
      protocol_ids: [],
      haystack: [b.source_file_id, b.original_filename, b.provenance_basis, b.batch_id, b.source_clock].filter(Boolean).join(' ').toLowerCase()
    });
  }

  const fallbackBinding = stableBindingHash({ kind: 'inline_fallback', records: records.length });

  return {
    search(query, {
      mode = 'hybrid',
      offset = 0,
      limit = 20,
      unitKindFilter = null,
      formatFilter = null,
      clusterFilter = null,
      includeBatchB = true,
      collapseManifestations = false,
      uniqueSources = false,
      cursorToken = null,
      deployment_env = resolveDeploymentEnvironment(),
      operator_secret_verified = false
    } = {}) {
      const safeOffset = Math.max(0, Number(offset) || 0);
      const safeLimit = Math.max(1, Math.min(200, Number(limit) || 20));
      const parsed = parseStructuredQuery(query, mode);
      const env = resolveDeploymentEnvironment({ override: deployment_env });
      const custGate = resolveExperimentACustody({
        cohort: 'EXPERIMENT_A',
        deployment_env: env,
        custody_layer: 'DERIVATIVE_OR_MD',
        operator_secret_verified: Boolean(operator_secret_verified)
      });

      if (!custGate.readable) {
        return {
          status: custGate.status,
          engine_version: `${SEARCH_ENGINE_VERSION}-inline-fallback`,
          mode: parsed.mode,
          query: parsed.rawNfc,
          total_hits: 0,
          returned_hits: 0,
          hits: [],
          pagination: { offset: safeOffset, limit: safeLimit, total_hits: 0, has_more: false, next_offset: null, cursor_token: null },
          manifestation_count_invariant: [32, 40],
          empirical_replication_credit: 0,
          human_closure_required: true,
          release_authority: false
        };
      }

      if (!parsed.rawNfc) {
        return {
          status: 'EMPTY_QUERY',
          engine_version: `${SEARCH_ENGINE_VERSION}-inline-fallback`,
          mode: parsed.mode,
          query: '',
          total_hits: 0,
          returned_hits: 0,
          hits: [],
          pagination: { offset: 0, limit: safeLimit, total_hits: 0, has_more: false, next_offset: null, cursor_token: null },
          manifestation_count_invariant: [32, 40],
          empirical_replication_credit: 0,
          human_closure_required: true,
          release_authority: false
        };
      }

      if (CROSS_OPERA_QUARANTINE_RE.test(parsed.rawNfc)) {
        return {
          status: 'CROSS_OPERA_QUARANTINED',
          engine_version: `${SEARCH_ENGINE_VERSION}-inline-fallback`,
          mode: parsed.mode,
          query: parsed.rawNfc,
          total_hits: 0,
          returned_hits: 0,
          hits: [],
          pagination: { offset: safeOffset, limit: safeLimit, total_hits: 0, has_more: false, next_offset: null, cursor_token: null },
          manifestation_count_invariant: [32, 40],
          empirical_replication_credit: 0,
          human_closure_required: true,
          release_authority: false
        };
      }

      if (!parsed.positiveRaw) {
        return {
          status: 'EMPTY_POSITIVE_QUERY',
          engine_version: `${SEARCH_ENGINE_VERSION}-inline-fallback`,
          mode: parsed.mode,
          query: parsed.rawNfc,
          total_hits: 0,
          returned_hits: 0,
          hits: [],
          pagination: { offset: safeOffset, limit: safeLimit, total_hits: 0, has_more: false, next_offset: null, cursor_token: null },
          manifestation_count_invariant: [32, 40],
          empirical_replication_credit: 0,
          human_closure_required: true,
          release_authority: false
        };
      }

      const expectedCursorToken = stableBindingHash({
        fallbackBinding,
        query: parsed.rawNfc,
        mode: parsed.mode,
        unitKindFilter: unitKindFilter || null,
        formatFilter: formatFilter || null,
        clusterFilter: clusterFilter || null,
        includeBatchB: Boolean(includeBatchB),
        collapseManifestations: Boolean(collapseManifestations),
        uniqueSources: Boolean(uniqueSources),
        env,
        operator_secret_verified: Boolean(operator_secret_verified)
      });
      if (cursorToken && cursorToken !== expectedCursorToken) {
        return {
          status: 'CURSOR_MISMATCH',
          engine_version: `${SEARCH_ENGINE_VERSION}-inline-fallback`,
          mode: parsed.mode,
          query: parsed.rawNfc,
          total_hits: 0,
          returned_hits: 0,
          hits: [],
          pagination: { offset: safeOffset, limit: safeLimit, total_hits: 0, has_more: false, next_offset: null, cursor_token: expectedCursorToken },
          manifestation_count_invariant: [32, 40],
          empirical_replication_credit: 0,
          human_closure_required: true,
          release_authority: false
        };
      }

      // Word-boundary positive match check BEFORE -exclude
      const alphaToks = parsed.tokens.filter((t) => /[a-z\p{L}]{2,}/u.test(t));
      const srcCond = deriveSrcQueryConditionedWeights(parsed.positiveNfc || parsed.rawNfc, parsed.mode, null);
      const srcWeights = srcCond.weights;
      const scored = [];
      let excludedCount = 0;

      for (const r of records) {
        if (unitKindFilter && r.unit_kind !== unitKindFilter) continue;
        if (formatFilter && r.format !== formatFilter) continue;
        if (clusterFilter && r.cluster !== clusterFilter) continue;
        if (!includeBatchB && r.unit_kind === 'prospective_batch_b') continue;

        const cleanHay = r.haystack.replace(/\b[a-f0-9]{24,}\b/g, ' ');
        const hayTokens = new Set((cleanHay.match(/[\p{L}\p{N}_-]+/gu) || []));
        let hitsCount = 0;
        let alphaHits = 0;
        const matchedToks = [];
        for (const t of parsed.tokens) {
          if (hayTokens.has(t) || (t.length >= 4 && cleanHay.includes(t))) {
            hitsCount++;
            matchedToks.push(t);
            if (/[a-z\p{L}]{2,}/u.test(t)) alphaHits++;
          }
        }
        const useSrcFallback = (parsed.mode === 'hybrid' || parsed.mode === 'src_projective') && srcCond.analysis.hasSrcUntypicalCue;
        const srcEval = useSrcFallback
          ? scoreSrcUntypicalDocument(srcCond.analysis, r, r.haystack || r.title || '')
          : { s_src_proj: 0, s_src_sig: 0, s_src_combined: 0, matched_tokens: [], matched_signatures: [], explore_match_type: null };

        if (useSrcFallback) {
          if (hitsCount === 0 && srcEval.s_src_combined < 0.16) continue;
        } else {
          if (alphaToks.length > 0 && alphaHits === 0) continue;
          if (hitsCount === 0) continue;
        }

        const hasNeg = parsed.excludes.some((ex) => hayMatchesTerm(cleanHay, ex))
          || parsed.excludePhrases.some((ep) => cleanHay.includes(ep));
        if (hasNeg) {
          excludedCount++;
          continue;
        }

        if (parsed.phrases.length > 0) {
          const allPhr = parsed.phrases.every((phr) => cleanHay.includes(phr));
          if (!allPhr) continue;
        }

        const sLex = +(hitsCount / Math.max(1, parsed.tokens.length)).toFixed(4);
        const totalScore = useSrcFallback
          ? +(Math.min(1, srcWeights.lex * sLex + srcWeights.src_proj * srcEval.s_src_proj + srcWeights.src_sig * srcEval.s_src_sig + (srcEval.explore_match_type ? 0.15 : 0) + (hitsCount > 0 ? 0.08 : 0))).toFixed(4)
          : sLex;
        const whyList = matchedToks.length > 0 ? [`fallback terms: ${matchedToks.slice(0, 5).join(', ')}`] : [];
        if (srcEval.matched_signatures.length > 0) whyList.push(`SRC signature [${srcCond.regimeId}]: ${srcEval.matched_signatures.join(', ')}`);
        if (srcEval.explore_match_type) whyList.push(`SRC Explore target (${srcEval.explore_match_type})`);
        if (srcEval.matched_tokens.length > 0) whyList.push(`SRC coordinates: ${srcEval.matched_tokens.slice(0, 5).join(', ')}`);
        const { haystack, ...rest } = r;
        const snippet = r.original_filename
          ? `${r.title} · ${r.original_filename} (${r.cluster || r.identity_status || 'Experiment-A'})`
          : `${r.title} (${r.identity_status || 'Experiment-A'})`;
        scored.push({
          ...rest,
          snippet,
          why: whyList,
          score_total: totalScore,
          s_lex: sLex,
          s_sem: 0,
          s_semi: 0,
          s_src: srcEval.s_src_combined,
          s_src_proj: srcEval.s_src_proj,
          s_src_sig: srcEval.s_src_sig,
          src_regime: srcCond.regimeId,
          delta_chan: +(sLex - srcEval.s_src_combined).toFixed(4),
          highest_rung: 'MOTIF_MATCH',
          empirical_replication_credit: 0,
          paired_manifestation_preserved: true
        });
      }

      scored.sort((a, b) => b.score_total - a.score_total || a.id.localeCompare(b.id));
      const finalList = uniqueSources
        ? scored.filter((item, idx, arr) => arr.findIndex((x) => (x.source_file_id || x.id) === (item.source_file_id || item.id)) === idx)
        : scored;
      const pageHits = finalList.slice(safeOffset, safeOffset + safeLimit);
      const hasMore = safeOffset + pageHits.length < finalList.length;

      return {
        status: pageHits.length
          ? 'INLINE_FALLBACK_OK'
          : (excludedCount > 0 ? 'EXCLUDED_BY_NEGATIVE_FILTER' : 'OOV_ALPHABETIC_CANARY_ABSTENTION'),
        engine_version: `${SEARCH_ENGINE_VERSION}-inline-fallback`,
        mode: parsed.mode,
        query: parsed.rawNfc,
        src_conditioning: {
          regime_id: srcCond.regimeId,
          has_untypical_cue: srcCond.analysis.hasSrcUntypicalCue,
          weights: srcWeights,
          matched_signatures: srcCond.analysis.matchedSignatures
        },
        excluded_by_negative_count: excludedCount,
        total_hits: finalList.length,
        returned_hits: pageHits.length,
        pagination: {
          offset: safeOffset,
          limit: safeLimit,
          total_hits: finalList.length,
          has_more: hasMore,
          next_offset: hasMore ? safeOffset + pageHits.length : null,
          cursor_token: expectedCursorToken
        },
        hits: pageHits,
        manifestation_count_invariant: [32, 40],
        empirical_replication_credit: 0,
        human_closure_required: true,
        release_authority: false
      };
    }
  };
}

/**
 * Pure isomorphic multi-format local document adapter (.md, .txt, .docx, .png/.svg/.jpg, .pdf)
 * Supports drag-and-drop / FileReader Uint8Array inspection in Experiment-A reader without fake OCR.
 */
async function inflateRawBytes(compressedBytes) {
  if (typeof DecompressionStream === 'function') {
    const ds = new DecompressionStream('deflate-raw');
    const writer = ds.writable.getWriter();
    await writer.write(compressedBytes);
    await writer.close();
    const outBuf = await new Response(ds.readable).arrayBuffer();
    return new Uint8Array(outBuf);
  }
  if (typeof process !== 'undefined' && process.versions?.node) {
    const { inflateRawSync } = await import('node:zlib');
    return Uint8Array.from(inflateRawSync(compressedBytes));
  }
  throw new Error('NO_DEFLATE_RAW_SUPPORT');
}

function unescapeXmlEntities(str) {
  return String(str || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)));
}

async function parseDocxBytes(u8) {
  // Walk PKZIP Local File Headers (0x04034b50) cleanly, handling Central Directory sizes if data descriptor set
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const decoder = new TextDecoder('utf-8', { fatal: true });

  // Prefer End of Central Directory (0x06054b50) so streaming data-descriptor DOCX zips work accurately
  let eocdPos = -1;
  for (let i = Math.max(0, u8.length - 65558); i <= u8.length - 22; i++) {
    if (dv.getUint32(i, true) === 0x06054b50) {
      eocdPos = i;
      break;
    }
  }
  if (eocdPos < 0) throw new Error('INVALID_DOCX_ZIP_NO_EOCD');

  const cdOffset = dv.getUint32(eocdPos + 16, true);
  const cdEntries = dv.getUint16(eocdPos + 10, true);
  let pos = cdOffset;
  let docXmlBytes = null;

  for (let idx = 0; idx < cdEntries && pos + 46 <= u8.length; idx++) {
    if (dv.getUint32(pos, true) !== 0x02014b50) break;
    const compMethod = dv.getUint16(pos + 10, true);
    const compSize = dv.getUint32(pos + 20, true);
    const fnameLen = dv.getUint16(pos + 28, true);
    const extraLen = dv.getUint16(pos + 30, true);
    const commentLen = dv.getUint16(pos + 32, true);
    const localOff = dv.getUint32(pos + 42, true);
    const fname = decoder.decode(u8.subarray(pos + 46, pos + 46 + fnameLen));
    pos += 46 + fnameLen + extraLen + commentLen;

    if (fname === 'word/document.xml' && localOff + 30 <= u8.length && dv.getUint32(localOff, true) === 0x04034b50) {
      const lFnameLen = dv.getUint16(localOff + 26, true);
      const lExtraLen = dv.getUint16(localOff + 28, true);
      const dataStart = localOff + 30 + lFnameLen + lExtraLen;
      if (compSize > 16_000_000 || dataStart + compSize > u8.length) {
        throw new Error('INVALID_DOCX_ENTRY_BOUNDS');
      }
      const compSlice = u8.subarray(dataStart, dataStart + compSize);
      docXmlBytes = compMethod === 0 ? compSlice : (compMethod === 8 ? await inflateRawBytes(compSlice) : null);
      break;
    }
  }

  if (!docXmlBytes) throw new Error('DOCX_MISSING_WORD_DOCUMENT_XML');
  const xml = decoder.decode(docXmlBytes);
  const text = unescapeXmlEntities(
    xml
      .replace(/<w:br[^>]*\/>/g, '\n')
      .replace(/<\/w:p>/g, '\n')
      .replace(/<\/w:tr>/g, '\n')
      .replace(/<\/w:tc>/g, '\t')
      .replace(/<[^>]+>/g, '')
  )
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .normalize('NFC');

  return {
    format: 'docx',
    body_representation: 'CLIENT_OOXML_DOCUMENT_XML_EXTRACTED',
    custody_status: 'EXPERIMENT_A_LOCAL_INSPECTOR_ONLY_NON_AUTHORITATIVE',
    text_body: text,
    byte_length: u8.length
  };
}

function parseImageBytesMetadata(u8, ext) {
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  let dimensions = null;
  let metaText = '';

  if (ext === 'png' && u8.length >= 24 && u8[0] === 0x89 && u8[1] === 0x50 && u8[2] === 0x4e && u8[3] === 0x47) {
    dimensions = [dv.getUint32(16, false), dv.getUint32(20, false)];
    metaText = `PNG IHDR ${dimensions[0]}x${dimensions[1]}`;
  } else if (ext === 'svg') {
    const svg = new TextDecoder('utf-8', { fatal: true }).decode(u8);
    const titleMatch = svg.match(/<title>([\s\S]*?)<\/title>/i);
    const descMatch = svg.match(/<desc>([\s\S]*?)<\/desc>/i);
    const vbMatch = svg.match(/viewBox=["']([^"']+)["']/i);
    metaText = [
      titleMatch ? titleMatch[1].trim() : '',
      descMatch ? descMatch[1].trim() : '',
      vbMatch ? `viewBox ${vbMatch[1]}` : ''
    ].filter(Boolean).join(' · ').normalize('NFC');
  }

  return {
    format: ext,
    body_representation: 'IMAGE_METADATA_ONLY_NO_OCR',
    custody_status: 'EXPERIMENT_A_LOCAL_INSPECTOR_ONLY_NON_AUTHORITATIVE',
    dimensions,
    text_body: null,
    metadata_summary: metaText || `${ext.toUpperCase()} image (${u8.length} bytes; zero fabricated OCR)`,
    byte_length: u8.length
  };
}

export async function parseLocalDocument(bytesOrText, filename = 'document.txt') {
  const name = String(filename || 'document.txt').trim();
  const extMatch = /\.([a-z0-9]+)$/i.exec(name);
  const ext = extMatch ? extMatch[1].toLowerCase() : 'txt';
  const u8 = typeof bytesOrText === 'string'
    ? new TextEncoder().encode(bytesOrText)
    : (bytesOrText instanceof Uint8Array ? bytesOrText : new Uint8Array(bytesOrText));

  if (ext === 'md' || ext === 'markdown' || ext === 'txt' || ext === 'json' || ext === 'csv') {
    const text = (typeof bytesOrText === 'string'
      ? bytesOrText
      : new TextDecoder('utf-8', { fatal: true }).decode(u8)).normalize('NFC');
    return {
      filename: name,
      format: ext,
      body_representation: 'LOCAL_TEXT_UTF8_NFC',
      custody_status: 'EXPERIMENT_A_LOCAL_INSPECTOR_ONLY_NON_AUTHORITATIVE',
      text_body: text,
      byte_length: u8.length
    };
  }

  if (ext === 'docx') {
    const res = await parseDocxBytes(u8);
    return { filename: name, ...res };
  }

  if (ext === 'png' || ext === 'svg' || ext === 'jpg' || ext === 'jpeg' || ext === 'webp' || ext === 'gif') {
    return { filename: name, ...parseImageBytesMetadata(u8, ext) };
  }

  if (ext === 'pdf') {
    const latin = new TextDecoder('latin1').decode(u8.subarray(0, Math.min(u8.length, 262144)));
    const pageMatches = latin.match(/\/Type\s*\/Page\b(?!s)/g);
    const titleMatch = latin.match(/\/Title\s*\(([^()]{1,160})\)/);
    return {
      filename: name,
      format: 'pdf',
      body_representation: 'LOCAL_PDF_METADATA_EXTRACTED_NO_FABRICATED_OCR',
      custody_status: 'EXPERIMENT_A_LOCAL_INSPECTOR_ONLY_NON_AUTHORITATIVE',
      page_count_estimate: pageMatches ? pageMatches.length : null,
      declared_title: titleMatch ? titleMatch[1].normalize('NFC') : null,
      text_body: null,
      metadata_summary: `Local PDF (${u8.length} bytes${pageMatches ? `, ~${pageMatches.length} pages scanned in header` : ''}); pre-extracted Experiment-A PDF bodies live in the companion corpus shards.`,
      byte_length: u8.length
    };
  }

  return {
    filename: name,
    format: ext,
    body_representation: 'UNSUPPORTED_BINARY_FORMAT_NO_FABRICATED_TEXT',
    custody_status: 'EXPERIMENT_A_LOCAL_INSPECTOR_ONLY_NON_AUTHORITATIVE',
    text_body: null,
    byte_length: u8.length
  };
}

export { exactSearchInExperimentAShards, verifyExperimentAShards };
