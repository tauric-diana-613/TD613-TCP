#!/usr/bin/env node
/**
 * 𝌋 Build Experiment-A Companion Corpus & Semantic-Semiotic Search Index
 *
 * Reads the static baseline manifest (#vixen-corpus-bundle in app/encyclopedia/vix-cyb.html),
 * brand assets contract (assets/vixen/asset-contract.json), and EMSTD613 estate files to emit:
 *   1. app/encyclopedia/vixen-estate/corpus-experiment-a-part1.json
 *   2. app/encyclopedia/vixen-estate/corpus-experiment-a-part2.json
 *   3. app/encyclopedia/vixen-estate/semantic-semiotic-index.v1.json
 *
 * Enforced Temporal, FADT, Atlas & Aperture invariants:
 *   - Never alters a single byte of #vixen-corpus-bundle in vix-cyb.html
 *   - Quarantines 33 AppleDouble c4 (._*) sidecars & Archive.zip (unextracted container)
 *   - Processes only the declared active corpus; held-out hydration sources never enter baseline index
 *   - Keeps paired .md and .pdf manifestations separate under Gates 1..8 ([32, 40])
 *   - Keeps motif tags capped strictly below mechanism promotion
 *   - Zero empirical replication credit; human closure remains reserved
 */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scrubBase64BlobsForDisplay } from '../app/encyclopedia/vixen-estate/corpus-experiment-a.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..');
const ESTATE_DIR = resolve(REPO_ROOT, 'app/encyclopedia/vixen-estate');
const DEFAULT_EM_ROOT = resolve(
  REPO_ROOT,
  '../em-e00-1a-comparator-wiring/packages/dome_world_exact/fixtures/a15-r0/EMSTD613'
);
const ALT_EM_ROOT = 'C:/td613-worktrees/em-e00-1a-comparator-wiring/packages/dome_world_exact/fixtures/a15-r0/EMSTD613';

const M_DIM = 256;
const K_DIM = 48;
const CHUNK_LEN = 2600;
const CHUNK_STRIDE = 2400;
const MAX_TERMS_PER_DOC_PACK = 480;

const UNIT_KINDS = [
  'source_passage',
  'work_route',
  'instrument_record',
  'instrument_passage',
  'synthesis_folio',
  'giveback_track',
  'prospective_batch_b',
  'image_asset',
  'archive_container'
];
const RUNG_NAMES = [
  'MOTIF_MATCH',
  'STRUCTURAL_ANALOGY_CANDIDATE',
  'MECHANISM_CANDIDATE'
];

const PLANE_KEYS = ['S-PLANE', 'W-PLANE', 'A-PLANE', 'P-MEMBRANE'];
const SEMIOTIC_RULES = [
  { tag: 'algedonic_bypass', re: /\b(?:algedonic|bypass|viability|viable\s+system|system[\s-]*[1-5])\b/i, defaultRung: 'MOTIF_MATCH', mechCues: ['clock', 'hostile', 'battery', 'setpoint', 'interrupt', 'ring'] },
  { tag: 'lock_free_audio_spsc', re: /\b(?:spsc|lock[\s-]*free|memory\s+barrier|48\s*khz|underrun|ring\s+buffer|atomic)\b/i, defaultRung: 'STRUCTURAL_ANALOGY_CANDIDATE', mechCues: ['barrier', 'memory', 'acquire', 'release', 'sample', 'audio'] },
  { tag: 'capacitive_e_textile_glove', re: /\b(?:theremin|capacitive|e[\s-]*textile|glove|electrode|impedance|haptic|quorum)\b/i, defaultRung: 'STRUCTURAL_ANALOGY_CANDIDATE', mechCues: ['node', 'parity', 'sensor', 'electrode', 'emi', 'tau'] },
  { tag: 'visibility_svd_conditioning', re: /\b(?:visibility|jacobian|jacobi|singular|condition\s+number|kappa|orthogonal\s+probe)\b/i, defaultRung: 'STRUCTURAL_ANALOGY_CANDIDATE', mechCues: ['svd', 'rank', 'probe', 'eigen', 'matrix', 'hessian'] },
  { tag: 'modular_ossl_finite_field', re: /\b(?:ossl|stylometry|finite\s+field|f_p|modular|remainder|galois)\b/i, defaultRung: 'MOTIF_MATCH', mechCues: ['mod', 'prime', 'rank', 'quotient'] },
  { tag: 'quotient_room_surplus', re: /\b(?:1\s*\+\s*1\s*=\s*3|surplus|occupant|quotient|fiber|fadt|descent|gluing)\b/i, defaultRung: 'STRUCTURAL_ANALOGY_CANDIDATE', mechCues: ['fiber', 'union', 'intersection', 'partition', 'gap'] },
  { tag: 'epistemic_control_plane', re: /\b(?:semantic\s+steering|witness\s+verification|actuator|control[\s-]*plane|setpoint|custody|cistern)\b/i, defaultRung: 'MECHANISM_CANDIDATE', mechCues: ['s_semantic', 'w_witness', 'a_actuator', 'non-collapse', 'authority', 'protocol'] },
  { tag: 'clock_holonomy_vernier', re: /\b(?:holonomy|clock|vernier|non[\s-]*commutat|lag\s+tick|k_layer|tau_cont|t_wall)\b/i, defaultRung: 'STRUCTURAL_ANALOGY_CANDIDATE', mechCues: ['inversion', 'tick', 'order', 'hysteresis', 'trajectory'] }
];

function sha256Hex(bufOrStr) {
  return createHash('sha256').update(bufOrStr).digest('hex');
}

function parseJsonl(raw) {
  return String(raw || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

function clampCharBoundary(str, idx, forward = false) {
  if (idx <= 0) return 0;
  if (idx >= str.length) return str.length;
  const code = str.charCodeAt(idx);
  // If index lands inside a UTF-16 low surrogate or ZWNJ/combining mark chain, adjust cleanly
  if (code >= 0xdc00 && code <= 0xdfff) {
    return forward ? Math.min(str.length, idx + 1) : Math.max(0, idx - 1);
  }
  return idx;
}

function normalizeTextNfc(s) {
  return String(s || '').normalize('NFC');
}

const UTF8_FATAL_DECODER = new TextDecoder('utf-8', { fatal: true });

function scrubForIndexing(s) {
  return normalizeTextNfc(s)
    .replace(/\[embedded figure reference\]/gi, ' inline_image ')
    .replace(/\[[^\]]*inline diagram rendered in full body\]/gi, ' inline_image ')
    .replace(/\[inline image data omitted\]/gi, ' inline_image ')
    .replace(/data:image\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=\s]{16,}/gi, ' inline_image ')
    .replace(/[A-Za-z0-9+/]{36,}={0,2}/g, ' ');
}

function makeProseSnippet(cleanText, maxLen = 114) {
  let collapsed = String(cleanText || '')
    .replace(/\[(?:embedded figure reference|inline image data omitted)\]/gi, ' ')
    .replace(/\[[^\]]*—\s*inline diagram rendered in full body\]/gi, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!collapsed) return '';
  if (collapsed.length <= maxLen) return collapsed;
  const cutIdx = clampCharBoundary(collapsed, maxLen - 1, false);
  const sub = collapsed.slice(0, cutIdx);
  const lastSpace = sub.lastIndexOf(' ');
  const trimmed = lastSpace > Math.floor(maxLen * 0.55) ? sub.slice(0, lastSpace) : sub;
  return `${trimmed.trim()}…`;
}

function tokenizeField(str, { includeShort = false, filterRawHex = true } = {}) {
  const clean = scrubForIndexing(str).toLowerCase();
  const matches = clean.match(/[\p{L}\p{N}_-]+/gu) || [];
  const out = [];
  for (const raw of matches) {
    const parts = raw.split(/[_-]+/).filter(Boolean);
    const candidates = parts.length > 1 ? (raw.length <= 24 ? [raw, ...parts] : parts) : [raw];
    for (const tok of candidates) {
      if (!tok) continue;
      if (!includeShort && tok.length < 2) continue;
      if (filterRawHex && (/^[a-f0-9]{12,}$/i.test(tok) || (tok.length >= 20 && /\d/.test(tok) && !/[_-]/.test(tok)))) continue;
      out.push(tok);
    }
  }
  return out;
}

function extractMarkdownHeadings(mdText) {
  const lines = normalizeTextNfc(mdText).split(/\r?\n/);
  const headings = [];
  for (const line of lines) {
    const m = /^\s*#{1,3}\s+(.+?)\s*$/.exec(line);
    if (m) headings.push(m[1].replace(/[*`#]+/g, '').trim());
  }
  return headings.join(' · ');
}

function estimatePageSpan(startChar, endChar, totalChars, pageCount) {
  if (!pageCount || pageCount <= 0 || totalChars <= 0) return null;
  const pStart = Math.max(1, Math.min(pageCount, Math.floor((startChar / totalChars) * pageCount) + 1));
  const pEnd = Math.max(pStart, Math.min(pageCount, Math.ceil((endChar / totalChars) * pageCount)));
  return [pStart, pEnd];
}

function applyRegexWithRawMap(str, sMap, eMap, regex, buildReplacement) {
  const flags = regex.flags.includes('g') ? regex.flags : `${regex.flags}g`;
  const re = new RegExp(regex.source, flags);
  let outStr = '';
  const outS = [];
  const outE = [];
  let last = 0;
  let m;
  while ((m = re.exec(str)) !== null) {
    const mStart = m.index;
    const mEnd = mStart + m[0].length;
    if (mEnd === mStart) {
      re.lastIndex++;
      continue;
    }
    if (mStart > last) {
      outStr += str.slice(last, mStart);
      for (let i = last; i < mStart; i++) {
        outS.push(sMap[i]);
        outE.push(eMap[i]);
      }
    }
    const rawS = sMap[mStart];
    const rawE = eMap[mEnd - 1];
    const parts = buildReplacement(m, rawS, rawE, sMap, eMap);
    for (const seg of parts) {
      if (!seg.text) continue;
      outStr += seg.text;
      if (seg.copyFrom != null) {
        for (let j = 0; j < seg.text.length; j++) {
          outS.push(sMap[seg.copyFrom + j]);
          outE.push(eMap[seg.copyFrom + j]);
        }
      } else {
        for (let j = 0; j < seg.text.length; j++) {
          outS.push(seg.rawS);
          outE.push(seg.rawE);
        }
      }
    }
    last = mEnd;
  }
  if (last < str.length) {
    outStr += str.slice(last);
    for (let i = last; i < str.length; i++) {
      outS.push(sMap[i]);
      outE.push(eMap[i]);
    }
  }
  return {
    str: outStr,
    sMap: Int32Array.from(outS),
    eMap: Int32Array.from(outE)
  };
}

function scrubWithOffsetMap(normRaw) {
  const n = normRaw.length;
  let state = {
    str: normRaw,
    sMap: new Int32Array(n),
    eMap: new Int32Array(n)
  };
  for (let i = 0; i < n; i++) {
    state.sMap[i] = i;
    state.eMap[i] = i + 1;
  }
  state = applyRegexWithRawMap(
    state.str,
    state.sMap,
    state.eMap,
    /\[[^\]]+\]:\s*<?data:image\/[a-z0-9.+-]+;base64,[^>\s)]+>?/gi,
    (_m, rawS, rawE) => [{ text: '[embedded figure reference]', rawS, rawE }]
  );
  state = applyRegexWithRawMap(
    state.str,
    state.sMap,
    state.eMap,
    /!\[([^\]]*)\]\(data:image\/[a-z0-9.+-]+;base64,[^)]+\)/gi,
    (m, rawS, rawE) => [
      { text: '[', rawS, rawE },
      { text: m[1], copyFrom: m.index + 2 },
      { text: ' — inline diagram rendered in full body]', rawS, rawE }
    ]
  );
  state = applyRegexWithRawMap(
    state.str,
    state.sMap,
    state.eMap,
    /data:image\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=\s]{16,}/gi,
    (_m, rawS, rawE) => [{ text: '[inline image data omitted]', rawS, rawE }]
  );
  state = applyRegexWithRawMap(
    state.str,
    state.sMap,
    state.eMap,
    /[A-Za-z0-9+/]{64,}={0,2}/g,
    () => []
  );
  if (state.str !== scrubBase64BlobsForDisplay(normRaw)) {
    throw new Error('SCRUB_OFFSET_MAP_DIVERGENCE');
  }
  return state;
}

function buildUtf8BytePrefixMap(str) {
  const bytePos = new Int32Array(str.length + 1);
  let b = 0;
  for (let i = 0; i < str.length; i++) {
    bytePos[i] = b;
    const code = str.charCodeAt(i);
    if (code <= 0x7f) {
      b += 1;
    } else if (code <= 0x7ff) {
      b += 2;
    } else if (code >= 0xd800 && code <= 0xdbff && i + 1 < str.length) {
      const next = str.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        bytePos[i + 1] = b;
        b += 4;
        i++;
        continue;
      }
      b += 3;
    } else {
      b += 3;
    }
  }
  bytePos[str.length] = b;
  if (b !== Buffer.byteLength(str, 'utf8')) {
    throw new Error(`UTF8_PREFIX_MAP_MISMATCH: expected=${Buffer.byteLength(str, 'utf8')} got=${b}`);
  }
  return bytePos;
}

function chunkTextSafe(text, pageCount = null) {
  const normRaw = normalizeTextNfc(text);
  const { str: cleanProse, sMap, eMap } = scrubWithOffsetMap(normRaw);
  if (!cleanProse.length) return [];
  const rawBytePos = buildUtf8BytePrefixMap(normRaw);
  const chunks = [];
  let pos = 0;
  while (pos < cleanProse.length) {
    const start = clampCharBoundary(cleanProse, pos, false);
    const rawEndLimit = Math.min(cleanProse.length, start + CHUNK_LEN);
    const end = clampCharBoundary(cleanProse, rawEndLimit, true);
    const slice = cleanProse.slice(start, end);
    const cleanText = scrubForIndexing(slice);
    const meaningfulLen = cleanText.replace(/\binline_image\b/g, '').trim().length;
    if (meaningfulLen >= 20 || (chunks.length === 0 && slice.trim().length > 0)) {
      const projStart = clampCharBoundary(normRaw, sMap[start], false);
      const projEnd = clampCharBoundary(normRaw, Math.max(projStart, eMap[end - 1]), true);
      const rawByteOff = rawBytePos[projStart];
      const rawByteLen = rawBytePos[projEnd] - rawByteOff;
      const sliceUtf8 = Buffer.from(slice, 'utf8');
      chunks.push({
        char_offset: projStart,
        char_length: projEnd - projStart,
        clean_char_offset: start,
        clean_char_length: slice.length,
        byte_offset: rawByteOff,
        byte_length: rawByteLen,
        chunk_sha256_bytes: createHash('sha256').update(sliceUtf8).digest(),
        offset_unit: 'UTF16_RAW',
        page_span: estimatePageSpan(projStart, projEnd, normRaw.length, pageCount),
        snippet: makeProseSnippet(slice, 96),
        text: cleanText
      });
    }
    if (end >= cleanProse.length) break;
    const nextPos = start + CHUNK_STRIDE;
    pos = nextPos > start ? nextPos : end;
  }
  return chunks;
}

function inferPlaneVec(planes = [], cluster = '', textHint = '') {
  const pSet = new Set(Array.isArray(planes) ? planes : []);
  if (pSet.size === 0) {
    if (/C1/i.test(cluster)) { pSet.add('S-PLANE'); pSet.add('A-PLANE'); }
    if (/C2/i.test(cluster)) { pSet.add('A-PLANE'); pSet.add('W-PLANE'); }
    if (/C3/i.test(cluster)) { pSet.add('W-PLANE'); pSet.add('A-PLANE'); }
    if (/C4/i.test(cluster)) { pSet.add('S-PLANE'); pSet.add('P-MEMBRANE'); }
    if (/C5/i.test(cluster)) { pSet.add('S-PLANE'); pSet.add('P-MEMBRANE'); }
    if (/\b(?:witness|physical|sensor|capacitive|hardware|probe)\b/i.test(textHint)) pSet.add('W-PLANE');
    if (/\b(?:semantic|prompt|llm|latent|symbol|discourse)\b/i.test(textHint)) pSet.add('S-PLANE');
    if (/\b(?:audio|dsp|actuator|interrupt|scheduler|runtime|spsc)\b/i.test(textHint)) pSet.add('A-PLANE');
    if (/\b(?:membrane|privacy|custody|cistern|personal|secret|operator)\b/i.test(textHint)) pSet.add('P-MEMBRANE');
  }
  const vec = PLANE_KEYS.map((k) => (pSet.has(k) ? 1 : 0));
  const norm = Math.hypot(...vec) || 1;
  return vec.map((v) => +(v / norm).toFixed(4));
}

function detectSemioticTags(text) {
  const tags = [];
  const low = normalizeTextNfc(text).toLowerCase();
  for (const rule of SEMIOTIC_RULES) {
    if (rule.re.test(low)) {
      const cueHits = rule.mechCues.filter((c) => low.includes(c)).length;
      let rung = rule.defaultRung;
      // Strict non-inflation: never upgrade above MECHANISM_CANDIDATE; require >=2 cue hits to move from MOTIF_MATCH to STRUCTURAL_ANALOGY_CANDIDATE
      if (rung === 'MOTIF_MATCH' && cueHits >= 2) rung = 'STRUCTURAL_ANALOGY_CANDIDATE';
      tags.push({ tag: rule.tag, rung });
    }
  }
  return tags;
}

function fnv1a32(str, seed = 0x811c9dc5) {
  let h = seed >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function buildFeatureVector(vocabToks, idfByDim) {
  const raw = new Float64Array(M_DIM);
  const words = vocabToks.filter((t) => /^[a-z0-9_-]{2,}$/i.test(t) && !/^\d+$/.test(t));
  const emitFeature = (feat, weight) => {
    const h1 = fnv1a32(feat, 0x811c9dc5);
    const h2 = fnv1a32(feat, 0x9e3779b1);
    const bucket = h1 & (M_DIM - 1);
    const sign = (h2 & 1) === 0 ? 1 : -1;
    raw[bucket] += sign * weight;
  };
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    emitFeature('w:' + w, 1.0);
    if (i + 1 < words.length) {
      emitFeature('b:' + w + '_' + words[i + 1], 0.75);
    }
    if (w.length >= 4 && w.length <= 18) {
      const limit = Math.min(w.length - 3, 6);
      for (let c = 0; c < limit; c++) {
        emitFeature('c:' + w.slice(c, c + 4), 0.25);
      }
    }
  }
  // Sublinear TF + IDF scaling & unit L2 normalization
  let normSq = 0;
  for (let j = 0; j < M_DIM; j++) {
    const v = raw[j];
    if (v !== 0) {
      const scaled = Math.sign(v) * (1 + Math.log(1 + Math.abs(v))) * (idfByDim ? idfByDim[j] : 1);
      raw[j] = scaled;
      normSq += scaled * scaled;
    }
  }
  const norm = Math.sqrt(normSq);
  if (norm > 1e-12) {
    for (let j = 0; j < M_DIM; j++) raw[j] /= norm;
  }
  return raw;
}

/**
 * Symmetric cyclic Jacobi eigensolver on real symmetric d x d Gram matrix G = Hc^T Hc.
 * Produces descending eigenvalues + orthonormal eigenvector columns V (top K).
 */
function symmetricJacobiEigen(gram, d, kOut, maxSweeps = 18, tol = 1e-10) {
  const A = new Float64Array(gram);
  const V = new Float64Array(d * d);
  for (let i = 0; i < d; i++) V[i * d + i] = 1;

  let sweeps = 0;
  let offMax = 0;
  for (let sw = 0; sw < maxSweeps; sw++) {
    sweeps = sw + 1;
    offMax = 0;
    for (let p = 0; p < d - 1; p++) {
      for (let q = p + 1; q < d; q++) {
        const apq = A[p * d + q];
        const absApq = Math.abs(apq);
        if (absApq > offMax) offMax = absApq;
        if (absApq < tol) continue;

        const app = A[p * d + p];
        const aqq = A[q * d + q];
        const tau = (aqq - app) / (2 * apq);
        const t = tau >= 0
          ? 1 / (tau + Math.sqrt(1 + tau * tau))
          : -1 / (-tau + Math.sqrt(1 + tau * tau));
        const c = 1 / Math.sqrt(1 + t * t);
        const s = t * c;

        A[p * d + p] = app - t * apq;
        A[q * d + q] = aqq + t * apq;
        A[p * d + q] = 0;
        A[q * d + p] = 0;

        for (let r = 0; r < d; r++) {
          if (r === p || r === q) continue;
          const arp = A[r * d + p];
          const arq = A[r * d + q];
          const nrp = c * arp - s * arq;
          const nrq = s * arp + c * arq;
          A[r * d + p] = nrp;
          A[p * d + r] = nrp;
          A[r * d + q] = nrq;
          A[q * d + r] = nrq;
        }
        for (let r = 0; r < d; r++) {
          const vrp = V[r * d + p];
          const vrq = V[r * d + q];
          V[r * d + p] = c * vrp - s * vrq;
          V[r * d + q] = s * vrp + c * vrq;
        }
      }
    }
    if (offMax < tol) break;
  }

  const pairs = Array.from({ length: d }, (_, idx) => ({
    idx,
    lambda: Math.max(0, A[idx * d + idx])
  })).sort((a, b) => b.lambda - a.lambda);

  const totalVar = pairs.reduce((s, p) => s + p.lambda, 0);
  const topPairs = pairs.slice(0, kOut);
  const topVar = topPairs.reduce((s, p) => s + p.lambda, 0);

  const basisVk = new Float32Array(d * kOut);
  const singularValues = new Float32Array(kOut);
  for (let k = 0; k < kOut; k++) {
    const colIdx = topPairs[k].idx;
    singularValues[k] = Math.sqrt(topPairs[k].lambda);
    for (let j = 0; j < d; j++) {
      basisVk[j * kOut + k] = V[j * d + colIdx];
    }
  }

  return {
    sweeps,
    offMax,
    explainedRatio: totalVar > 1e-12 ? +(topVar / totalVar).toFixed(4) : 0,
    basisVk,
    singularValues
  };
}

function encodeVarint(num, outBytes) {
  let n = num >>> 0;
  while (n >= 0x80) {
    outBytes.push((n & 0x7f) | 0x80);
    n >>>= 7;
  }
  outBytes.push(n);
}

function typedToBase64(typedArray) {
  return Buffer.from(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength).toString('base64');
}

async function resolveEmRoot(cliRoot) {
  if (cliRoot && existsSync(cliRoot)) return resolve(cliRoot);
  if (existsSync(DEFAULT_EM_ROOT)) return DEFAULT_EM_ROOT;
  if (existsSync(ALT_EM_ROOT)) return ALT_EM_ROOT;
  throw new Error('EMSTD613_FIXTURE_ROOT_NOT_FOUND');
}

async function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes('--check');
  const emFlagIdx = args.indexOf('--em-root');
  const cliEmRoot = emFlagIdx >= 0 ? args[emFlagIdx + 1] : null;

  if (checkOnly) {
    for (const rel of [
      'corpus-experiment-a-part1.json',
      'corpus-experiment-a-part2.json',
      'semantic-semiotic-index.v1.json'
    ]) {
      const p = resolve(ESTATE_DIR, rel);
      const raw = await readFile(p, 'utf8');
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') throw new Error('INVALID_JSON:' + rel);
    }
    console.log(JSON.stringify({ status: 'CHECK_OK', files: 3 }));
    return;
  }

  const emRoot = await resolveEmRoot(cliEmRoot);
  const html = await readFile(resolve(REPO_ROOT, 'app/encyclopedia/vix-cyb.html'), 'utf8');
  const bundleMatch = html.match(/<script[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/);
  if (!bundleMatch) throw new Error('VIXEN_CORPUS_BUNDLE_NOT_FOUND');
  const corpusBundleRaw = bundleMatch[1];
  const corpusBundleSha = sha256Hex(corpusBundleRaw);
  const corpus = JSON.parse(corpusBundleRaw);

  const assetContractRaw = await readFile(resolve(REPO_ROOT, 'app/encyclopedia/assets/vixen/asset-contract.json'), 'utf8');
  const assetContract = JSON.parse(assetContractRaw);

  const sourceFiles = parseJsonl(await readFile(resolve(emRoot, '01-MANIFESTS/source-files.jsonl'), 'utf8'));
  const derivativeIndex = parseJsonl(await readFile(resolve(emRoot, '03-DERIVATIVES/derivative-index.jsonl'), 'utf8'));
  const sourceById = new Map(sourceFiles.map((s) => [s.source_file_id, s]));
  const derivById = new Map(derivativeIndex.map((d) => [d.source_file_id, d]));

  const quarantinedAppleDouble = sourceFiles.filter(
    (s) => s.extension === '._*' || String(s.original_filename || '').startsWith('._') || String(s.relative_path || '').includes('__MACOSX')
  );
  const archiveStub = sourceFiles.find((s) => s.source_file_id === 'emsrc_db43deb1f616beed44e042c4');

  // Map works to Experiment-A readable records & shards (Works 0..15 -> part1, 16..31 -> part2)
  const sourcesPart1 = {};
  const sourcesPart2 = {};
  const instrumentBodies = {};
  const docsForIndex = [];
  const graphLinks = new Map();
  const addGraphEdge = (a, b) => {
    if (!a || !b || a === b) return;
    if (!graphLinks.has(a)) graphLinks.set(a, new Set());
    if (!graphLinks.has(b)) graphLinks.set(b, new Set());
    graphLinks.get(a).add(b);
    graphLinks.get(b).add(a);
  };

  for (let wIdx = 0; wIdx < corpus.works.length; wIdx++) {
    const work = corpus.works[wIdx];
    const shardMap = wIdx < 16 ? sourcesPart1 : sourcesPart2;
    const shardId = wIdx < 16 ? 1 : 2;
    const workTitle = work.display_title || work.declared_title || work.work_id;
    const variantsStr = (work.title_variants || []).join(' · ');
    const planes = Array.isArray(work.planes) ? work.planes : [];
    const planeVec = inferPlaneVec(planes, work.cluster, workTitle);
    const protIds = Array.isArray(work.protocols) ? work.protocols : [];

    for (const ls of work.linked_sources) addGraphEdge(work.work_id, ls.source_file_id);
    for (const pid of protIds) addGraphEdge(work.work_id, pid);

    // Also add 1 high-level work summary doc so Work-level title/variant/claim searches always rank crisply
    const workSummaryText = [
      workTitle,
      variantsStr,
      work.cluster,
      work.identity_status,
      (work.identity_basis || []).join(' '),
      (work.substantive_differences_if_any || []).join(' '),
      (work.unresolved_questions || []).join(' '),
      protIds.join(' '),
      planes.join(' ')
    ].join(' ');
    const workSummaryUtf8 = Buffer.from(workSummaryText, 'utf8');
    docsForIndex.push({
      id: work.work_id,
      unit_kind: 'work_route',
      work_id: work.work_id,
      source_file_id: work.linked_sources?.[0]?.source_file_id || null,
      instrument_id: null,
      title: workTitle,
      cluster: work.cluster || null,
      identity_status: work.identity_status,
      gate_num: work.human_gate_required ? work.gate_num : null,
      format: work.linked_sources.map((ls) => (ls.media_type === 'application/pdf' ? 'pdf' : 'md')).join('+'),
      media_type: work.linked_sources.map((ls) => ls.media_type).join(', '),
      custody_status: 'EXPERIMENT_A_PREVIEW_AUTHORIZED',
      source_clock: null,
      filesystem_clock_status: 'CHRONOLOGY_UNRESOLVED',
      shard: shardId,
      char_offset: 0,
      char_length: 0,
      byte_offset: 0,
      byte_length: 0,
      source_byte_length: work.linked_sources.reduce((s, x) => s + Number(x.byte_length || 0), 0),
      sha256: work.linked_sources?.[0]?.sha256 || null,
      chunk_sha256_bytes: createHash('sha256').update(workSummaryUtf8).digest(),
      snippet: makeProseSnippet(`${work.cluster || ''} · ${(work.identity_basis || []).join('; ') || workSummaryText}`, 104),
      page_span: null,
      plane_vec: planeVec,
      protocol_ids: protIds,
      semiotic_tags: detectSemioticTags(workSummaryText),
      _fields: {
        f0: `${workTitle} ${variantsStr}`,
        f1: `${(work.identity_basis || []).join(' ')} ${(work.substantive_differences_if_any || []).join(' ')}`,
        f2: `${(work.unresolved_questions || []).join(' ')} ${planes.join(' ')} ${protIds.join(' ')}`,
        f3: `${work.work_id} ${work.cluster} ${work.gate_num ? 'gate-' + work.gate_num : ''} ${work.linked_sources.map((ls) => ls.source_file_id).join(' ')}`
      }
    });

    for (const ls of work.linked_sources) {
      const sId = ls.source_file_id;
      const sf = sourceById.get(sId) || {};
      const dv = derivById.get(sId) || {};
      const relTxt = dv.derivative_relative_path || `03-DERIVATIVES/text/${sId}.txt`;
      const absTxt = resolve(emRoot, relTxt);
      if (!existsSync(absTxt)) {
        throw new Error(`MISSING_DERIVATIVE_TEXT: ${absTxt}`);
      }
      const rawBuf = await readFile(absTxt);
      const rawText = normalizeTextNfc(UTF8_FATAL_DECODER.decode(rawBuf));
      const derivSha = sha256Hex(rawBuf);
      const isPdf = ls.media_type === 'application/pdf' || String(ls.original_filename || '').toLowerCase().endsWith('.pdf');
      const format = isPdf ? 'pdf' : 'md';
      const pageCount = dv.page_count || ls.page_count || null;

      shardMap[sId] = {
        schema: 'td613.vixen.experiment-a-source/v1',
        source_file_id: sId,
        work_id: work.work_id,
        recorded_title: workTitle,
        original_filename: ls.original_filename,
        format,
        media_type: ls.media_type,
        cluster: work.cluster,
        identity_status: work.identity_status,
        human_gate_required: Boolean(work.human_gate_required),
        gate_num: work.human_gate_required ? work.gate_num : null,
        duplicate_of_source_file_id: sf.duplicate_of_source_file_id || null,
        declared_source_sha256: ls.sha256,
        declared_source_byte_length: ls.byte_length,
        derivative_sha256: derivSha,
        derivative_byte_length: rawBuf.length,
        binary_pdf_sha256_verified: false,
        native_text_sha256_exact_match: !isPdf && derivSha === ls.sha256,
        body_representation: isPdf ? 'EXTRACTED_NATIVE_PDF_TEXT' : 'NATIVE_MARKDOWN_TEXT',
        custody_status: 'EXPERIMENT_A_PREVIEW_AUTHORIZED',
        source_clock: sf.source_clock_if_known || null,
        filesystem_clock_status: sf.filesystem_clock_status || 'CHRONOLOGY_UNRESOLVED',
        page_count: pageCount,
        pdf_metadata: dv.pdf_metadata && Object.keys(dv.pdf_metadata).length ? dv.pdf_metadata : null,
        shard: shardId,
        text_body: rawText
      };

      const headings = isPdf ? '' : extractMarkdownHeadings(rawText);
      const chunks = chunkTextSafe(rawText, pageCount);
      for (const ch of chunks) {
        const chunkHeadings = isPdf ? '' : extractMarkdownHeadings(ch.text);
        const chunkTags = detectSemioticTags(`${workTitle} ${chunkHeadings} ${ch.text}`);
        docsForIndex.push({
          id: `${sId}#${ch.char_offset}`,
          unit_kind: 'source_passage',
          work_id: work.work_id,
          source_file_id: sId,
          instrument_id: null,
          title: workTitle,
          original_filename: ls.original_filename,
          cluster: work.cluster || null,
          identity_status: work.identity_status,
          gate_num: work.human_gate_required ? work.gate_num : null,
          format,
          media_type: ls.media_type,
          custody_status: 'EXPERIMENT_A_PREVIEW_AUTHORIZED',
          body_representation: shardMap[sId].body_representation,
          native_text_sha256_exact_match: shardMap[sId].native_text_sha256_exact_match,
          binary_pdf_sha256_verified: false,
          source_clock: shardMap[sId].source_clock,
          filesystem_clock_status: shardMap[sId].filesystem_clock_status,
          shard: shardId,
          char_offset: ch.char_offset,
          char_length: ch.char_length,
          byte_offset: ch.byte_offset,
          byte_length: ch.byte_length,
          source_byte_length: ls.byte_length,
          sha256: ls.sha256,
          derivative_sha256: derivSha,
          chunk_sha256_bytes: ch.chunk_sha256_bytes,
          snippet: ch.snippet,
          page_span: ch.page_span,
          duplicate_of_source_file_id: sf.duplicate_of_source_file_id || null,
          plane_vec: inferPlaneVec(planes, work.cluster, ch.text),
          protocol_ids: protIds,
          semiotic_tags: chunkTags,
          _fields: {
            f0: `${workTitle} ${ls.original_filename}`,
            f1: `${chunkHeadings || headings.slice(0, 120)} ${planes.join(' ')}`,
            f2: ch.text,
            f3: `${work.work_id} ${sId} ${format} ${work.cluster} ${protIds.join(' ')}`
          }
        });
      }
    }
  }

  // 21 06-INSTRUMENTS/*.md -> part2
  for (const inst of corpus.instruments) {
    const absInst = resolve(emRoot, inst.relative_path || `06-INSTRUMENTS/${inst.filename}`);
    if (!existsSync(absInst)) throw new Error(`MISSING_INSTRUMENT: ${absInst}`);
    const rawBuf = await readFile(absInst);
    const rawText = normalizeTextNfc(UTF8_FATAL_DECODER.decode(rawBuf));
    const bodySha = sha256Hex(rawBuf);
    const cleanInst = scrubBase64BlobsForDisplay(rawText);
    instrumentBodies[inst.instrument_id] = {
      schema: 'td613.vixen.experiment-a-instrument/v1',
      instrument_id: inst.instrument_id,
      filename: inst.filename,
      relative_path: inst.relative_path,
      family: inst.family,
      format: 'md',
      media_type: 'text/markdown; charset=utf-8',
      declared_sha256: inst.sha256,
      body_sha256: bodySha,
      sha256_verified_match: bodySha === inst.sha256,
      byte_length: rawBuf.length,
      historical_execution_classification: inst.historical_execution_classification,
      standalone_executors_in_lineage: 0,
      custody_status: 'EXPERIMENT_A_PREVIEW_AUTHORIZED',
      body_representation: 'NATIVE_MARKDOWN_PROTOCOL_SCRIPT',
      source_clock: null,
      filesystem_clock_status: 'CHRONOLOGY_UNRESOLVED',
      shard: 2,
      text_body: rawText
    };

    const headings = extractMarkdownHeadings(cleanInst);
    const instPlaneVec = inferPlaneVec([], '', `${inst.scope} ${headings}`);
    docsForIndex.push({
      id: inst.instrument_id,
      unit_kind: 'instrument_record',
      work_id: null,
      source_file_id: inst.instrument_id,
      instrument_id: inst.instrument_id,
      title: inst.filename.replace(/\.md$/i, '').replace(/_/g, ' '),
      original_filename: inst.filename,
      cluster: null,
      identity_status: 'DOCUMENTARY_PROTOCOL',
      gate_num: null,
      format: 'md',
      media_type: 'text/markdown; charset=utf-8',
      custody_status: 'EXPERIMENT_A_PREVIEW_AUTHORIZED',
      body_representation: 'NATIVE_MARKDOWN_PROTOCOL_SCRIPT',
      source_clock: null,
      filesystem_clock_status: 'CHRONOLOGY_UNRESOLVED',
      shard: 2,
      char_offset: 0,
      char_length: cleanInst.length,
      byte_offset: 0,
      byte_length: rawBuf.length,
      source_byte_length: rawBuf.length,
      sha256: inst.sha256,
      derivative_sha256: bodySha,
      chunk_sha256_bytes: createHash('sha256').update(rawBuf).digest(),
      snippet: makeProseSnippet(`${inst.scope || ''} ${cleanInst}`, 104),
      page_span: null,
      plane_vec: instPlaneVec,
      protocol_ids: [inst.instrument_id],
      semiotic_tags: detectSemioticTags(`${inst.scope} ${cleanInst.slice(0, 800)}`),
      _fields: {
        f0: `${inst.instrument_id} ${inst.filename}`,
        f1: `${inst.scope} ${inst.family} ${headings}`,
        f2: scrubForIndexing(cleanInst.slice(0, 1400)),
        f3: `${inst.instrument_id} ${inst.family} protocol`
      }
    });

    const chunks = chunkTextSafe(rawText, null);
    for (const ch of chunks) {
      const chHead = extractMarkdownHeadings(ch.text);
      docsForIndex.push({
        id: `${inst.instrument_id}#${ch.char_offset}`,
        unit_kind: 'instrument_passage',
        work_id: null,
        source_file_id: inst.instrument_id,
        instrument_id: inst.instrument_id,
        title: inst.filename.replace(/\.md$/i, '').replace(/_/g, ' '),
        original_filename: inst.filename,
        cluster: null,
        identity_status: 'DOCUMENTARY_PROTOCOL',
        gate_num: null,
        format: 'md',
        media_type: 'text/markdown; charset=utf-8',
        custody_status: 'EXPERIMENT_A_PREVIEW_AUTHORIZED',
        body_representation: 'NATIVE_MARKDOWN_PROTOCOL_SCRIPT',
        source_clock: null,
        filesystem_clock_status: 'CHRONOLOGY_UNRESOLVED',
        shard: 2,
        char_offset: ch.char_offset,
        char_length: ch.char_length,
        byte_offset: ch.byte_offset,
        byte_length: ch.byte_length,
        source_byte_length: rawBuf.length,
        sha256: inst.sha256,
        derivative_sha256: bodySha,
        chunk_sha256_bytes: ch.chunk_sha256_bytes,
        snippet: ch.snippet,
        page_span: null,
        plane_vec: inferPlaneVec([], '', ch.text),
        protocol_ids: [inst.instrument_id],
        semiotic_tags: detectSemioticTags(`${inst.scope} ${ch.text}`),
        _fields: {
          f0: `${inst.instrument_id} ${inst.filename}`,
          f1: `${inst.scope} ${chHead || headings.slice(0, 120)}`,
          f2: ch.text,
          f3: `${inst.instrument_id} ${inst.family} protocol`
        }
      });
    }
  }

  // Formula folios, prospective tracks, declared active sources, image metadata and archive stub
  for (const folio of corpus.formula_folios) {
    for (const lnk of (folio.links || [])) addGraphEdge(folio.id, lnk);
    const folioUtf8 = Buffer.from(`${folio.title || ''}\n${folio.summary || ''}\n${folio.fallback || ''}`, 'utf8');
    docsForIndex.push({
      id: folio.id,
      unit_kind: 'synthesis_folio',
      work_id: (folio.links || []).find((l) => l.startsWith('emwork_')) || null,
      source_file_id: folio.id,
      instrument_id: (folio.links || []).find((l) => !l.startsWith('emwork_')) || null,
      title: folio.title,
      cluster: null,
      identity_status: folio.status,
      gate_num: null,
      format: 'folio',
      media_type: 'application/json',
      custody_status: 'EXPERIMENT_A_PREVIEW_AUTHORIZED',
      body_representation: 'SYNTHESIS_FOLIO_SUMMARY',
      source_clock: null,
      filesystem_clock_status: 'CHRONOLOGY_UNRESOLVED',
      shard: null,
      char_offset: 0,
      char_length: 0,
      byte_offset: 0,
      byte_length: folioUtf8.length,
      source_byte_length: folioUtf8.length,
      sha256: null,
      chunk_sha256_bytes: createHash('sha256').update(folioUtf8).digest(),
      snippet: makeProseSnippet(folio.summary || folio.fallback || folio.title, 104),
      page_span: null,
      plane_vec: inferPlaneVec([], '', `${folio.summary} ${folio.fallback}`),
      protocol_ids: (folio.links || []).filter((l) => !l.startsWith('emwork_')),
      semiotic_tags: detectSemioticTags(`${folio.title} ${folio.summary} ${folio.fallback}`),
      _fields: {
        f0: folio.title,
        f1: `${folio.fallback || ''} ${folio.ceiling || ''}`,
        f2: folio.summary || '',
        f3: `${folio.id} ${folio.group} ${(folio.links || []).join(' ')}`
      }
    });
  }

  for (const tr of corpus.giveback_tracks) {
    for (const p of (tr.protocols || [])) addGraphEdge(tr.id, p);
    const trUtf8 = Buffer.from(`${tr.title || ''}\n${tr.summary || ''}`, 'utf8');
    docsForIndex.push({
      id: tr.id,
      unit_kind: 'giveback_track',
      work_id: null,
      source_file_id: tr.id,
      instrument_id: tr.protocols?.[0] || null,
      title: tr.title,
      cluster: null,
      identity_status: tr.status,
      gate_num: null,
      format: 'track',
      media_type: 'application/json',
      custody_status: 'EXPERIMENT_A_PREVIEW_AUTHORIZED',
      body_representation: 'GIVEBACK_TRACK_SPECIFICATION',
      source_clock: null,
      filesystem_clock_status: 'CHRONOLOGY_UNRESOLVED',
      shard: null,
      char_offset: 0,
      char_length: 0,
      byte_offset: 0,
      byte_length: trUtf8.length,
      source_byte_length: trUtf8.length,
      sha256: null,
      chunk_sha256_bytes: createHash('sha256').update(trUtf8).digest(),
      snippet: makeProseSnippet(tr.summary || tr.title, 104),
      page_span: null,
      plane_vec: inferPlaneVec([], '', `${tr.title} ${tr.summary}`),
      protocol_ids: tr.protocols || [],
      semiotic_tags: detectSemioticTags(`${tr.title} ${tr.summary}`),
      _fields: {
        f0: tr.title,
        f1: (tr.protocols || []).join(' '),
        f2: tr.summary || '',
        f3: `${tr.id} ${tr.status}`
      }
    });
  }

  const batchBEntries = corpus.batch_b_files.map((bf) => ({
    ...bf,
    custody_status: 'EXPERIMENT_A_METADATA_ONLY_BINARY_PENDING_UPLOAD',
    body_representation: 'BINARY_PENDING_UPLOAD_NO_TEXT',
    filesystem_clock_status: bf.filesystem_clock_status || 'CHRONOLOGY_UNRESOLVED',
    source_clock: bf.source_clock || 'UNRESOLVED',
    text_body: null,
    binary_present: false
  }));

  for (const bf of batchBEntries) {
    const bfMetaUtf8 = Buffer.from(`${bf.source_file_id}|${bf.original_filename}|${bf.sha256}`, 'utf8');
    docsForIndex.push({
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
      source_clock: bf.source_clock,
      filesystem_clock_status: bf.filesystem_clock_status,
      shard: 1,
      char_offset: 0,
      char_length: 0,
      byte_offset: 0,
      byte_length: 0,
      source_byte_length: bf.byte_length,
      page_count: bf.page_count,
      sha256: bf.sha256,
      chunk_sha256_bytes: createHash('sha256').update(bfMetaUtf8).digest(),
      snippet: makeProseSnippet(`Batch-B pending upload (${bf.original_filename}; ${bf.page_count || '?'}p; clock: ${bf.source_clock})`, 104),
      page_span: [1, bf.page_count || 1],
      plane_vec: inferPlaneVec([], '', bf.original_filename),
      protocol_ids: [],
      semiotic_tags: detectSemioticTags(bf.original_filename),
      _fields: {
        f0: bf.original_filename,
        f1: `${bf.provenance_basis} ${bf.source_clock}`,
        f2: `${bf.original_filename} prospective batch b binary pending upload pdf ${bf.page_count} pages`,
        f3: `${bf.source_file_id} ${bf.batch_id}`
      }
    });
  }

  // Brand Images (metadata + SVG alt text, zero fabricated OCR)
  const imageAssets = [
    {
      id: 'asset-frontispiece-desktop',
      title: 'Vixen Cybernetics Sculptural Frontispiece (Desktop)',
      filename: 'frontispiece-desktop.png',
      mime: 'image/png',
      dimensions: assetContract.frontispiece?.desktop?.dimensions || [3040, 1616],
      sha256: assetContract.frontispiece?.desktop?.sha256 || null,
      alt_text: assetContract.frontispiece?.alt_text || 'Sculptural chrome cybernetic astrolabe frontispiece for Vixen Cybernetics'
    },
    {
      id: 'asset-frontispiece-mobile',
      title: 'Vixen Cybernetics Sculptural Frontispiece (Mobile)',
      filename: 'frontispiece-mobile.png',
      mime: 'image/png',
      dimensions: assetContract.frontispiece?.mobile?.dimensions || [941, 1671],
      sha256: assetContract.frontispiece?.mobile?.sha256 || null,
      alt_text: assetContract.frontispiece?.alt_text || 'Sculptural chrome cybernetic astrolabe frontispiece for Vixen Cybernetics'
    },
    {
      id: 'asset-fox-arcflash-svg',
      title: 'Arc-Flash Fox Emblem SVG',
      filename: 'fox-arcflash.svg',
      mime: 'image/svg+xml',
      dimensions: [256, 256],
      sha256: assetContract.logo?.sha256 || null,
      alt_text: assetContract.logo?.alt_text || 'Arc-flash chrome geometric fox brand crest emblem'
    }
  ];
  for (const img of imageAssets) {
    const imgMetaUtf8 = Buffer.from(`${img.id}|${img.filename}|${img.alt_text}`, 'utf8');
    docsForIndex.push({
      id: img.id,
      unit_kind: 'image_asset',
      work_id: null,
      source_file_id: img.filename,
      instrument_id: null,
      title: img.title,
      original_filename: img.filename,
      cluster: null,
      identity_status: 'BRAND_VISUAL_ASSET_METADATA',
      gate_num: null,
      format: img.filename.endsWith('.svg') ? 'svg' : 'png',
      media_type: img.mime,
      custody_status: 'EXPERIMENT_A_PREVIEW_AUTHORIZED',
      body_representation: 'IMAGE_METADATA_ONLY_NO_OCR',
      source_clock: null,
      filesystem_clock_status: 'CHRONOLOGY_UNRESOLVED',
      shard: 1,
      char_offset: 0,
      char_length: 0,
      byte_offset: 0,
      byte_length: 0,
      source_byte_length: 0,
      dimensions: img.dimensions,
      sha256: img.sha256,
      chunk_sha256_bytes: createHash('sha256').update(imgMetaUtf8).digest(),
      snippet: makeProseSnippet(`${img.alt_text} [${img.dimensions.join('x')}; no fabricated OCR]`, 104),
      page_span: null,
      plane_vec: [0.5, 0.5, 0.5, 0],
      protocol_ids: [],
      semiotic_tags: [],
      _fields: {
        f0: `${img.title} ${img.filename}`,
        f1: `${img.alt_text} ${img.dimensions.join('x')}`,
        f2: `${img.alt_text} image metadata no ocr`,
        f3: `${img.id} ${img.filename}`
      }
    });
  }

  // Unextracted Archive.zip container stub (never unpacked)
  if (archiveStub) {
    const archUtf8 = Buffer.from(`${archiveStub.source_file_id}|Archive.zip|UNEXTRACTED`, 'utf8');
    docsForIndex.push({
      id: archiveStub.source_file_id,
      unit_kind: 'archive_container',
      work_id: null,
      source_file_id: archiveStub.source_file_id,
      instrument_id: null,
      title: `${archiveStub.original_filename} (Unextracted Container Stub)`,
      original_filename: archiveStub.original_filename,
      cluster: null,
      identity_status: 'UNEXTRACTED_CONTAINER_QUARANTINED',
      gate_num: null,
      format: 'zip',
      media_type: archiveStub.media_type,
      custody_status: 'ARCHIVE_CONTAINER_UNEXTRACTED',
      body_representation: 'ARCHIVE_CONTAINER_UNEXTRACTED',
      source_clock: null,
      filesystem_clock_status: 'CHRONOLOGY_UNRESOLVED',
      shard: 1,
      char_offset: 0,
      char_length: 0,
      byte_offset: 0,
      byte_length: 0,
      source_byte_length: archiveStub.byte_length,
      sha256: archiveStub.sha256,
      chunk_sha256_bytes: createHash('sha256').update(archUtf8).digest(),
      snippet: 'Unextracted Archive.zip container stub (AppleDouble C4 sidecars quarantined).',
      page_span: null,
      plane_vec: [0, 0, 0, 1],
      protocol_ids: [],
      semiotic_tags: [],
      _fields: {
        f0: archiveStub.original_filename,
        f1: 'archive container unextracted appledouble c4 quarantine',
        f2: 'unextracted zip archive stub containing quarantined resource forks',
        f3: `${archiveStub.source_file_id} Archive.zip`
      }
    });
  }

  // Build lossless BM25F inverted index + Hash Feature matrix over all N docs
  const N = docsForIndex.length;
  const vocabMap = new Map();
  const vocabList = [];
  const termDf = [];
  const docTokensAll = new Array(N);
  const docFieldLens = new Array(N);
  const sumFieldLens = [0, 0, 0, 0];
  const featureDimDf = new Int32Array(M_DIM);

  const getTermId = (tok) => {
    let tid = vocabMap.get(tok);
    if (tid === undefined) {
      tid = vocabList.length;
      vocabList.push(tok);
      vocabMap.set(tok, tid);
      termDf.push(0);
    }
    return tid;
  };

  for (let dIdx = 0; dIdx < N; dIdx++) {
    const d = docsForIndex[dIdx];
    const t0 = tokenizeField(d._fields.f0, { includeShort: false });
    const t1 = tokenizeField(d._fields.f1, { includeShort: false });
    const t2 = tokenizeField(d._fields.f2, { includeShort: false });
    const t3 = tokenizeField(d._fields.f3, { includeShort: true, filterRawHex: false });
    docFieldLens[dIdx] = [t0.length, t1.length, t2.length, t3.length];
    sumFieldLens[0] += t0.length;
    sumFieldLens[1] += t1.length;
    sumFieldLens[2] += t2.length;
    sumFieldLens[3] += t3.length;

    const perTerm = new Map();
    const recordField = (arr, fIdx) => {
      for (const tok of arr) {
        const tid = getTermId(tok);
        let counts = perTerm.get(tid);
        if (!counts) {
          counts = [0, 0, 0, 0];
          perTerm.set(tid, counts);
        }
        if (counts[fIdx] < 255) counts[fIdx]++;
      }
    };
    recordField(t0, 0);
    recordField(t1, 1);
    recordField(t2, 2);
    recordField(t3, 3);
    for (const tid of perTerm.keys()) termDf[tid]++;
    docTokensAll[dIdx] = {
      perTerm,
      allWords: [...t0, ...t1, ...t2]
    };

    // Track hashed feature doc frequency for IDF scaling
    const seenBins = new Set();
    for (const w of docTokensAll[dIdx].allWords) {
      if (/^[a-z0-9_-]{2,}$/i.test(w) && !/^\d+$/.test(w)) {
        seenBins.add(fnv1a32('w:' + w, 0x811c9dc5) & (M_DIM - 1));
      }
    }
    for (const b of seenBins) featureDimDf[b]++;
  }

  const avgFieldLengths = sumFieldLens.map((s) => +(s / Math.max(1, N)).toFixed(3));
  const idfDim = new Float32Array(M_DIM);
  for (let j = 0; j < M_DIM; j++) {
    idfDim[j] = Math.log(1 + (N - featureDimDf[j] + 0.5) / (featureDimDf[j] + 0.5));
  }

  // Build normalized hashed matrix H_unit [N x M_DIM], compute centroid mu, Hc = H_unit - 1*mu^T
  const H = new Float64Array(N * M_DIM);
  const mu = new Float64Array(M_DIM);
  for (let i = 0; i < N; i++) {
    const v = buildFeatureVector(docTokensAll[i].allWords, idfDim);
    for (let j = 0; j < M_DIM; j++) {
      H[i * M_DIM + j] = v[j];
      mu[j] += v[j];
    }
  }
  for (let j = 0; j < M_DIM; j++) mu[j] /= N;

  const gram = new Float64Array(M_DIM * M_DIM);
  for (let i = 0; i < N; i++) {
    const row = H.subarray(i * M_DIM, (i + 1) * M_DIM);
    for (let p = 0; p < M_DIM; p++) {
      const vp = row[p] - mu[p];
      if (Math.abs(vp) < 1e-12) continue;
      for (let q = p; q < M_DIM; q++) {
        gram[p * M_DIM + q] += vp * (row[q] - mu[q]);
      }
    }
  }
  for (let p = 0; p < M_DIM; p++) {
    for (let q = 0; q < p; q++) {
      gram[p * M_DIM + q] = gram[q * M_DIM + p];
    }
  }

  const eigen = symmetricJacobiEigen(gram, M_DIM, K_DIM, 20, 1e-10);

  // Project all N docs into K_DIM & quantize to Int8 + Float32 scale
  const docVecsI8 = new Int8Array(N * K_DIM);
  const docScalesF32 = new Float32Array(N);
  const projTmp = new Float64Array(K_DIM);

  for (let i = 0; i < N; i++) {
    const row = H.subarray(i * M_DIM, (i + 1) * M_DIM);
    let normSq = 0;
    for (let k = 0; k < K_DIM; k++) {
      let dot = 0;
      for (let j = 0; j < M_DIM; j++) {
        dot += (row[j] - mu[j]) * eigen.basisVk[j * K_DIM + k];
      }
      projTmp[k] = dot;
      normSq += dot * dot;
    }
    const norm = Math.sqrt(normSq) || 1;
    let maxAbs = 0;
    for (let k = 0; k < K_DIM; k++) {
      projTmp[k] /= norm;
      if (Math.abs(projTmp[k]) > maxAbs) maxAbs = Math.abs(projTmp[k]);
    }
    const scale = maxAbs > 1e-12 ? maxAbs / 127 : 1 / 127;
    docScalesF32[i] = scale;
    for (let k = 0; k < K_DIM; k++) {
      docVecsI8[i * K_DIM + k] = Math.max(-127, Math.min(127, Math.round(projTmp[k] / scale)));
    }
  }

  // Empirical background distribution calibration using deterministic probe directions
  const bgEven = [];
  const bgOdd = [];
  const bgCosines = [];
  for (let probe = 0; probe < 12; probe++) {
    const dir = new Float64Array(K_DIM);
    let dNorm = 0;
    for (let k = 0; k < K_DIM; k++) {
      const val = eigen.basisVk[((probe * 17 + k) % M_DIM) * K_DIM + k];
      dir[k] = val;
      dNorm += val * val;
    }
    const dn = Math.sqrt(dNorm) || 1;
    for (let k = 0; k < K_DIM; k++) dir[k] /= dn;
    for (let i = 0; i < N; i += 5) {
      let c = 0;
      const sc = docScalesF32[i];
      for (let k = 0; k < K_DIM; k++) c += dir[k] * docVecsI8[i * K_DIM + k] * sc;
      bgCosines.push(c);
      if (probe % 2 === 0) bgEven.push(c);
      else bgOdd.push(c);
    }
  }
  const bgMu = +(bgCosines.reduce((a, b) => a + b, 0) / bgCosines.length).toFixed(6);
  const bgVar = bgCosines.reduce((a, b) => a + (b - bgMu) ** 2, 0) / bgCosines.length;
  const bgSigmaRaw = Math.sqrt(bgVar);
  if (!Number.isFinite(bgSigmaRaw) || bgSigmaRaw <= 1e-12) {
    throw new Error(`APERTURE_INVALID_BG_SIGMA: var=${bgVar}`);
  }
  const bgSigma = +bgSigmaRaw.toFixed(6);

  const pairCount = Math.min(bgEven.length, bgOdd.length);
  if (pairCount < 2) {
    throw new Error('APERTURE_INSUFFICIENT_BG_SAMPLES');
  }
  let meanX = 0;
  let meanY = 0;
  for (let s = 0; s < pairCount; s++) {
    meanX += bgEven[s];
    meanY += bgOdd[s];
  }
  meanX /= pairCount;
  meanY /= pairCount;
  let varX = 0;
  let varY = 0;
  let covXY = 0;
  for (let s = 0; s < pairCount; s++) {
    const dx = bgEven[s] - meanX;
    const dy = bgOdd[s] - meanY;
    varX += dx * dx;
    varY += dy * dy;
    covXY += dx * dy;
  }
  varX /= pairCount;
  varY /= pairCount;
  covXY /= pairCount;
  const covDet = varX * varY - covXY * covXY;
  if (!(varX > 1e-12 && varY > 1e-12 && covDet > 1e-12)) {
    throw new Error(`APERTURE_NON_SPD_COVARIANCE: varX=${varX} varY=${varY} det=${covDet}`);
  }

  // Build Delta-Varint Inverted Postings for lossless BM25F
  const termBuckets = vocabList.map(() => []);
  for (let dIdx = 0; dIdx < N; dIdx++) {
    for (const [tid, counts] of docTokensAll[dIdx].perTerm.entries()) {
      termBuckets[tid].push([dIdx, counts[0], counts[1], counts[2], counts[3]]);
    }
  }

  const dfArr = new Uint16Array(vocabList.length);
  const postLengths = new Uint16Array(vocabList.length);
  const postBytes = [];
  for (let tid = 0; tid < vocabList.length; tid++) {
    const entries = termBuckets[tid];
    dfArr[tid] = entries.length;
    const startOff = postBytes.length;
    let prevDoc = 0;
    for (const [dIdx, tf0, tf1, tf2, tf3] of entries) {
      encodeVarint(dIdx - prevDoc, postBytes);
      prevDoc = dIdx;
      const mask = (tf0 > 0 ? 1 : 0) | (tf1 > 0 ? 2 : 0) | (tf2 > 0 ? 4 : 0) | (tf3 > 0 ? 8 : 0);
      postBytes.push(mask);
      if (tf0 > 0) encodeVarint(tf0, postBytes);
      if (tf1 > 0) encodeVarint(tf1, postBytes);
      if (tf2 > 0) encodeVarint(tf2, postBytes);
      if (tf3 > 0) encodeVarint(tf3, postBytes);
    }
    const len = postBytes.length - startOff;
    if (len > 65535) throw new Error(`POSTING_LEN_OVERFLOW: tid=${tid} len=${len}`);
    postLengths[tid] = len;
  }

  // Normalize repeated source-level metadata into sources_meta[] and emit compact docs[]
  const tagNameList = SEMIOTIC_RULES.map((r) => r.tag);
  const tagNameToIdx = new Map(tagNameList.map((t, i) => [t, i]));
  const rungToIdx = new Map(RUNG_NAMES.map((r, i) => [r, i]));
  const ukToIdx = new Map(UNIT_KINDS.map((u, i) => [u, i]));

  const catalogKeyToIdx = new Map();
  const sourcesMeta = [];
  const compactMetaEntry = (d) => {
    const m = {
      cust: d.custody_status || 'EXPERIMENT_A_PREVIEW_AUTHORIZED'
    };
    if (d.work_id) m.work_id = d.work_id;
    if (d.source_file_id) m.source_file_id = d.source_file_id;
    if (d.instrument_id) m.instrument_id = d.instrument_id;
    if (d.title) m.title = d.title;
    if (d.original_filename) m.original_filename = d.original_filename;
    if (d.cluster) m.cluster = d.cluster;
    if (d.identity_status) m.identity_status = d.identity_status;
    if (d.gate_num != null) m.gate_num = d.gate_num;
    if (d.format) m.format = d.format;
    if (d.media_type) m.media_type = d.media_type;
    if (d.body_representation) m.body_representation = d.body_representation;
    if (d.native_text_sha256_exact_match != null) m.native_text_sha256_exact_match = Boolean(d.native_text_sha256_exact_match);
    if (d.binary_pdf_sha256_verified != null) m.binary_pdf_sha256_verified = Boolean(d.binary_pdf_sha256_verified);
    if (d.shard != null) m.shard = d.shard;
    if (d.source_byte_length != null || d.byte_length != null) m.byte_length = d.source_byte_length ?? d.byte_length;
    if (d.sha256) m.sha256 = d.sha256;
    if (d.derivative_sha256) m.derivative_sha256 = d.derivative_sha256;
    if (d.duplicate_of_source_file_id) m.duplicate_of_source_file_id = d.duplicate_of_source_file_id;
    if ('source_clock' in d) m.source_clock = d.source_clock;
    if (d.filesystem_clock_status) m.filesystem_clock_status = d.filesystem_clock_status;
    if (d.page_count != null) m.page_count = d.page_count;
    if (d.dimensions) m.dimensions = d.dimensions;
    if (d.protocol_ids && d.protocol_ids.length) m.protocol_ids = d.protocol_ids;
    return m;
  };
  const getCatalogIdx = (d) => {
    const key = [
      d.source_file_id || '',
      d.instrument_id || '',
      d.work_id || '',
      d.format || '',
      d.unit_kind === 'work_route' ? d.id : ''
    ].join('|');
    let ci = catalogKeyToIdx.get(key);
    if (ci === undefined) {
      ci = sourcesMeta.length;
      catalogKeyToIdx.set(key, ci);
      sourcesMeta.push(compactMetaEntry(d));
    }
    return ci;
  };

  const chunkShaPacked = new Uint8Array(N * 32);
  const compactDocs = docsForIndex.map((d, idx) => {
    if (!(d.chunk_sha256_bytes instanceof Uint8Array) || d.chunk_sha256_bytes.length !== 32) {
      throw new Error(`MISSING_CHUNK_SHA256: doc=${d.id}`);
    }
    chunkShaPacked.set(d.chunk_sha256_bytes, idx * 32);
    const out = {
      id: d.id,
      ci: getCatalogIdx(d),
      uk: ukToIdx.has(d.unit_kind) ? ukToIdx.get(d.unit_kind) : d.unit_kind,
      off: d.char_offset || 0,
      len: d.char_length || 0,
      boff: d.byte_offset || 0,
      blen: d.byte_length || 0,
      pv: d.plane_vec,
      fl: docFieldLens[idx]
    };
    if (d.snippet) out.sn = d.snippet;
    if (d.page_span) out.pg = d.page_span;
    if (d.semiotic_tags && d.semiotic_tags.length) {
      out.tg = d.semiotic_tags.map((x) => [
        tagNameToIdx.has(x.tag) ? tagNameToIdx.get(x.tag) : x.tag,
        rungToIdx.has(x.rung) ? rungToIdx.get(x.rung) : 0
      ]);
    }
    return out;
  });

  // Explicit typed adjacency graph with NO_RELATION_PROMOTION & verified TEXT_CROSS_REF spans
  const EDGE_REL_TYPES = ['work_source', 'work_protocol', 'folio_link', 'track_protocol', 'dup_source', 'TEXT_CROSS_REF'];
  const edgeSeen = new Set();
  const compactEdges = [];
  const pushTypedEdge = (from, to, relType, off = null, span = null, sha = null) => {
    if (!from || !to || from === to) return;
    const rIdx = EDGE_REL_TYPES.indexOf(relType);
    if (rIdx < 0) return;
    const dedupKey = `${from}\t${to}\t${rIdx}`;
    if (edgeSeen.has(dedupKey)) return;
    edgeSeen.add(dedupKey);
    if (relType === 'TEXT_CROSS_REF') {
      compactEdges.push([from, to, rIdx, off, span, sha]);
    } else {
      compactEdges.push([from, to, rIdx]);
    }
  };
  for (const work of corpus.works) {
    for (const ls of work.linked_sources) {
      pushTypedEdge(work.work_id, ls.source_file_id, 'work_source');
    }
    for (const pid of (work.protocols || [])) {
      pushTypedEdge(work.work_id, pid, 'work_protocol');
    }
  }
  for (const folio of corpus.formula_folios) {
    for (const lnk of (folio.links || [])) {
      pushTypedEdge(folio.id, lnk, 'folio_link');
    }
  }
  for (const tr of corpus.giveback_tracks) {
    for (const p of (tr.protocols || [])) {
      pushTypedEdge(tr.id, p, 'track_protocol');
    }
  }
  const allShardSources = [
    ...Object.values(sourcesPart1),
    ...Object.values(sourcesPart2),
  ];
  for (const srcRec of allShardSources) {
    if (srcRec.duplicate_of_source_file_id) {
      pushTypedEdge(srcRec.source_file_id, srcRec.duplicate_of_source_file_id, 'dup_source');
    }
  }
  const validNodeIds = new Set([
    ...corpus.works.map((w) => w.work_id),
    ...allShardSources.map((s) => s.source_file_id),
    ...Object.keys(instrumentBodies)
  ]);
  const crossRefCandidates = [
    ...allShardSources.map((s) => ({ id: s.source_file_id, text: s.text_body })),
    ...Object.values(instrumentBodies).map((inst) => ({ id: inst.instrument_id, text: inst.text_body }))
  ];
  const workByVCode = new Map();
  corpus.works.forEach((w, idx) => {
    workByVCode.set(`V-${String(idx + 1).padStart(2, '0')}`, w.work_id);
  });
  const instAlternation = Object.keys(instrumentBodies).map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const XREF_RE = new RegExp(`\\b(emwork_[a-f0-9]{16,}|emsrc_[a-f0-9]{16,}|V-(?:0[1-9]|[12]\\d|3[0-2])${instAlternation ? '|' + instAlternation : ''})\\b`, 'g');
  for (const item of crossRefCandidates) {
    if (typeof item.text !== 'string' || !item.text) continue;
    let xm;
    XREF_RE.lastIndex = 0;
    while ((xm = XREF_RE.exec(item.text)) !== null) {
      let target = xm[1];
      if (target.startsWith('V-') && workByVCode.has(target)) {
        target = workByVCode.get(target);
      }
      if (!validNodeIds.has(target) || target === item.id) continue;
      const wStart = clampCharBoundary(item.text, Math.max(0, xm.index - 24), false);
      const wEnd = clampCharBoundary(item.text, Math.min(item.text.length, xm.index + xm[0].length + 36), true);
      const rawWindow = item.text.slice(wStart, wEnd);
      const spanSha = sha256Hex(Buffer.from(rawWindow, 'utf8'));
      const cleanSpan = makeProseSnippet(scrubBase64BlobsForDisplay(rawWindow), 76);
      const offUtf8 = Buffer.byteLength(item.text.slice(0, xm.index), 'utf8');
      pushTypedEdge(item.id, target, 'TEXT_CROSS_REF', offUtf8, cleanSpan, spanSha);
    }
  }

  const part1Obj = {
    schema: 'td613.vixen.experiment-a-corpus-shard/v1',
    shard: 1,
    custody_policy: {
      preview_status: 'EXPERIMENT_A_PREVIEW_AUTHORIZED',
      preview_notice: 'Authorized by Em for Experiment-A Vercel Preview deployments and developer / volunteer-client Em testing.',
      experiment_c_main_gate: 'FUTURE_SERVER_ENFORCED_GIVING_STYLE_OPERATOR_SECRET_NOT_YET_IMPLEMENTED',
      hydration_holdout_admission: 'NOT_ADMITTED_TO_A0_ACTIVE_CORPUS',
      appledouble_quarantined_c4: quarantinedAppleDouble.length,
      archive_container_unextracted: archiveStub ? [archiveStub.source_file_id] : [],
      empirical_replication_credit: 0,
      human_closure_required: true,
      release_authority: false
    },
    works_range: [0, 15],
    sources: sourcesPart1,
    batch_b_files: batchBEntries,
    image_assets: imageAssets,
    archive_container: archiveStub || null
  };

  const part2Obj = {
    schema: 'td613.vixen.experiment-a-corpus-shard/v1',
    shard: 2,
    custody_policy: part1Obj.custody_policy,
    works_range: [16, 31],
    sources: sourcesPart2,
    instruments: instrumentBodies
  };

  const p1Raw = JSON.stringify(part1Obj);
  const p2Raw = JSON.stringify(part2Obj);
  const p1Buf = Buffer.from(p1Raw, 'utf8');
  const p2Buf = Buffer.from(p2Raw, 'utf8');
  const shardSeals = {
    part1: {
      filename: 'corpus-experiment-a-part1.json',
      schema: part1Obj.schema,
      sha256: sha256Hex(p1Buf),
      byte_length: p1Buf.length
    },
    part2: {
      filename: 'corpus-experiment-a-part2.json',
      schema: part2Obj.schema,
      sha256: sha256Hex(p2Buf),
      byte_length: p2Buf.length
    }
  };

  const muF32 = Float32Array.from(mu);
  const indexObj = {
    schema: 'td613.vixen.semantic-semiotic-index/v1',
    built_at: new Date().toISOString(),
    corpus_custody: {
      vixen_corpus_bundle_sha256: corpusBundleSha,
      appledouble_quarantined_c4: quarantinedAppleDouble.length,
      substantive_derivatives: 53,
      instruments_count: 21,
      batch_b_pending_count: batchBEntries.length,
      work_sensitivity_interval: [32, 40],
      preview_status: 'EXPERIMENT_A_PREVIEW_AUTHORIZED',
      experiment_c_main_gate: 'FUTURE_SERVER_ENFORCED_GIVING_STYLE_OPERATOR_SECRET_NOT_YET_IMPLEMENTED',
      retrieval_class: 'LOCAL_SEMANTIC_SEMIOTIC_CANDIDATE_NO_RELATION_PROMOTION',
      shard_seals: shardSeals,
      empirical_replication_credit: 0,
      human_closure_required: true
    },
    bm25f: {
      N,
      k1: 1.2,
      field_weights: [3.0, 2.0, 1.0, 0.75],
      field_b: [0.40, 0.55, 0.75, 0.20],
      avg_field_lengths: avgFieldLengths,
      vocab_lines: vocabList.join('\n'),
      df_u16_b64: typedToBase64(dfArr),
      post_lengths_u16_b64: typedToBase64(postLengths),
      postings_varint_b64: Buffer.from(postBytes).toString('base64')
    },
    svd_subspace: {
      M: M_DIM,
      K: K_DIM,
      hash_seeds: ['0x811c9dc5', '0x9e3779b1'],
      jacobi_sweeps: eigen.sweeps,
      jacobi_off_diag_residual: +eigen.offMax.toExponential(3),
      centered_explained_variance_ratio: eigen.explainedRatio,
      background_null: {
        mu: bgMu,
        sigma: bgSigma,
        covariance_2x2: [
          [+varX.toFixed(6), +covXY.toFixed(6)],
          [+covXY.toFixed(6), +varY.toFixed(6)]
        ]
      },
      idf_f32_b64: typedToBase64(idfDim),
      mean_f32_b64: typedToBase64(muF32),
      basis_vk_f32_b64: typedToBase64(eigen.basisVk),
      singular_values_f32_b64: typedToBase64(eigen.singularValues),
      doc_vecs_i8_b64: typedToBase64(docVecsI8),
      doc_scales_f32_b64: typedToBase64(docScalesF32)
    },
    chunk_sha256_b64: Buffer.from(chunkShaPacked).toString('base64'),
    graph: {
      relation_promotion_allowed: false,
      causal_relation_inferred: false,
      rel_types: EDGE_REL_TYPES,
      edges: compactEdges
    },
    semiotic_taxonomy: {
      planes: PLANE_KEYS,
      clusters: ['C1', 'C2', 'C3', 'C4', 'C5'],
      unit_kinds: UNIT_KINDS,
      tag_names: tagNameList,
      rung_names: RUNG_NAMES,
      rungs: {
        MOTIF_MATCH: 0.55,
        STRUCTURAL_ANALOGY_CANDIDATE: 0.80,
        MECHANISM_CANDIDATE: 1.00
      }
    },
    sources_meta: sourcesMeta,
    docs: compactDocs
  };

  const idxRaw = JSON.stringify(indexObj);

  await writeFile(resolve(ESTATE_DIR, 'corpus-experiment-a-part1.json'), p1Raw, 'utf8');
  await writeFile(resolve(ESTATE_DIR, 'corpus-experiment-a-part2.json'), p2Raw, 'utf8');
  await writeFile(resolve(ESTATE_DIR, 'semantic-semiotic-index.v1.json'), idxRaw, 'utf8');

  console.log(JSON.stringify({
    status: 'BUILT_EXPERIMENT_A_CORPUS_AND_INDEX',
    vixen_corpus_bundle_sha256: corpusBundleSha,
    total_indexed_units: N,
    vocab_size: vocabList.length,
    graph_edges_count: compactEdges.length,
    bg_sigma: bgSigma,
    bg_covariance_2x2: indexObj.svd_subspace.background_null.covariance_2x2,
    jacobi_sweeps: eigen.sweeps,
    jacobi_off_diag_residual: +eigen.offMax.toExponential(3),
    centered_explained_variance_ratio: eigen.explainedRatio,
    part1_bytes: p1Buf.length,
    part2_bytes: p2Buf.length,
    index_bytes: Buffer.byteLength(idxRaw, 'utf8'),
    appledouble_quarantined_c4: quarantinedAppleDouble.length,
    batch_b_pending: batchBEntries.length
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
