// TD613 · Marrowline R2 · Additive Exploratory Unicode Morphology & Semiography Diagnostics
// Commission: TD613-MARROWLINE-R2-POST-ACQ-RECOVERY-20261123
// Predecessor: a48d2556ed946e01d4925dee93c463c73712d590 (PR #1783, R2-U pilot r2_r2u_036ef18ebc2e)
// Covenant: Khona‌lit-po (literal U+200C preserved) · Seal: ⟐SAC[X6ZNK5NO51]
// STRICT SEPARATION: Additive exploratory diagnostics ONLY. NEVER modifies frozen r2-unicode-evaluator.mjs v2
// verdicts, NEVER rewrites historical R2-U pilot status, and NEVER evaluates artistic merit automatically.

import crypto from 'node:crypto';
import zlib from 'node:zlib';

export const R2_EXPLORATORY_MORPHOLOGY_SCHEMA = 'td613.marrowline.r2-exploratory-morphology/v1';

const COMBINING_MARK_SCALAR_RE = /^\p{M}$/u;
const WHITESPACE_SCALAR_RE = /^\s$/u;
const LETTER_SCALAR_RE = /^\p{L}$/u;
const PUNCT_SCALAR_RE = /^\p{P}$/u;
const DIGIT_SCALAR_RE = /^\p{N}$/u;

function round4(n) {
  return Number(Number(n || 0).toFixed(4));
}

function sortedQuantile(sortedAsc, q) {
  if (!sortedAsc.length) return 0;
  const pos = (sortedAsc.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sortedAsc[lo];
  const frac = pos - lo;
  return sortedAsc[lo] * (1 - frac) + sortedAsc[hi] * frac;
}

function summarizeNumericSeries(values = []) {
  if (!values.length) {
    return {
      count: 0,
      mean: 0,
      trimmedMean10: 0,
      median: 0,
      q25: 0,
      q75: 0,
      iqr: 0,
      p90: 0,
      p99: 0,
      min: 0,
      max: 0,
      stdDev: 0,
      cv: 0,
      robustDispersion: 0
    };
  }
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const mean = sum / n;
  const variance = sorted.reduce((acc, v) => acc + ((v - mean) ** 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  const trim = Math.floor(n * 0.1);
  const trimmedSlice = trim > 0 && n - (2 * trim) >= 1 ? sorted.slice(trim, n - trim) : sorted;
  const trimmedMean10 = trimmedSlice.reduce((acc, v) => acc + v, 0) / trimmedSlice.length;

  const q25 = sortedQuantile(sorted, 0.25);
  const median = sortedQuantile(sorted, 0.5);
  const q75 = sortedQuantile(sorted, 0.75);
  const iqr = q75 - q25;
  const p90 = sortedQuantile(sorted, 0.9);
  const p99 = sortedQuantile(sorted, 0.99);

  return {
    count: n,
    mean: round4(mean),
    trimmedMean10: round4(trimmedMean10),
    median: round4(median),
    q25: round4(q25),
    q75: round4(q75),
    iqr: round4(iqr),
    p90: round4(p90),
    p99: round4(p99),
    min: sorted[0],
    max: sorted[n - 1],
    stdDev: round4(stdDev),
    cv: mean > 0 ? round4(stdDev / mean) : 0,
    robustDispersion: round4(iqr / Math.max(median, 1))
  };
}

function computeGini(values = []) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  if (sum <= 0) return 0;
  let weightedSum = 0;
  for (let i = 0; i < n; i += 1) {
    weightedSum += (2 * (i + 1) - n - 1) * sorted[i];
  }
  return round4(weightedSum / (n * sum));
}

function computeSpearmanPositionRho(values = []) {
  const n = values.length;
  if (n < 3) return 0;
  const indexed = values.map((v, idx) => ({ v, idx }));
  indexed.sort((a, b) => a.v - b.v);
  const ranks = new Array(n);
  let i = 0;
  while (i < n) {
    let j = i + 1;
    while (j < n && indexed[j].v === indexed[i].v) j += 1;
    const avgRank = ((i + 1) + j) / 2;
    for (let k = i; k < j; k += 1) {
      ranks[indexed[k].idx] = avgRank;
    }
    i = j;
  }
  const meanX = (n + 1) / 2;
  const meanY = meanX;
  let num = 0;
  let denX = 0;
  let denY = 0;
  for (let idx = 0; idx < n; idx += 1) {
    const dx = (idx + 1) - meanX;
    const dy = ranks[idx] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  if (denX === 0 || denY === 0) return 0;
  return round4(num / Math.sqrt(denX * denY));
}

function computeLagAutocorrelation(seqIds = [], maxLagCap = 64) {
  const n = seqIds.length;
  if (n < 2) {
    return {
      clusterCount: n,
      maxLagMatchRate: 0,
      dominantLag: null,
      lag1AdjacentCloneRate: 0,
      topLags: []
    };
  }
  const upperLag = Math.min(maxLagCap, Math.floor(n / 2));
  const candidates = [];
  for (let lag = 1; lag <= upperLag; lag += 1) {
    let matches = 0;
    const denom = n - lag;
    for (let i = 0; i < denom; i += 1) {
      if (seqIds[i] === seqIds[i + lag]) matches += 1;
    }
    candidates.push({ lag, matches, denom, matchRate: round4(matches / denom) });
  }
  const lag1 = candidates.find((c) => c.lag === 1)?.matchRate ?? 0;
  candidates.sort((a, b) => (b.matchRate - a.matchRate) || (a.lag - b.lag));
  const best = candidates[0] || { lag: null, matchRate: 0 };
  return {
    clusterCount: n,
    maxLagMatchRate: best.matchRate,
    dominantLag: best.matchRate > 0 ? best.lag : null,
    lag1AdjacentCloneRate: lag1,
    topLags: candidates.slice(0, 3).map((c) => Object.freeze({ lag: c.lag, matchRate: c.matchRate }))
  };
}

function classifyBaseScalar(ch) {
  if (WHITESPACE_SCALAR_RE.test(ch)) return 'whitespace';
  if (LETTER_SCALAR_RE.test(ch)) return 'letter';
  if (PUNCT_SCALAR_RE.test(ch)) return 'punctuation';
  if (DIGIT_SCALAR_RE.test(ch)) return 'digit';
  return 'other';
}

/**
 * Evaluates additive, non-authoritative exploratory Unicode morphology & semiotic structure
 * in a single canonical pre-NFC/NFD UTF-8 scalar pass. Never modifies frozen v2 verdicts.
 */
export function evaluateExploratoryMorphology(rawText = '') {
  const raw = String(rawText ?? '');
  const rawBuf = Buffer.from(raw, 'utf8');
  const rawSha256 = crypto.createHash('sha256').update(rawBuf).digest('hex');
  const strippedText = raw.replace(/\p{M}/gu, '');
  const scalars = Array.from(raw);

  const classStats = {
    letter: { count: 0, decoratedCount: 0, markCount: 0 },
    whitespace: { count: 0, decoratedCount: 0, markCount: 0 },
    punctuation: { count: 0, decoratedCount: 0, markCount: 0 },
    digit: { count: 0, decoratedCount: 0, markCount: 0 },
    other: { count: 0, decoratedCount: 0, markCount: 0 }
  };

  let orphanedLeadingMarks = 0;
  let totalMarks = 0;
  const allNonWsDepths = [];
  const decoratedNonWsDepths = [];

  const allDecoratedSeqIds = [];
  const nonWsDecoratedSeqIds = [];
  const seqTable = new Map();
  const markCpCounts = new Map();
  const bigramCounts = new Map();
  let withinClusterDupSum = 0;
  let clustersWithDupSum = 0;
  let maxSameCpRun = 0;

  const lineBuckets = [];
  let currentLineNonWsDepths = [];

  let i = 0;
  while (i < scalars.length) {
    const ch = scalars[i];
    if (COMBINING_MARK_SCALAR_RE.test(ch)) {
      orphanedLeadingMarks += 1;
      totalMarks += 1;
      const cpHex = `U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`;
      markCpCounts.set(cpHex, (markCpCounts.get(cpHex) || 0) + 1);
      i += 1;
      continue;
    }

    const marks = [];
    let j = i + 1;
    while (j < scalars.length && COMBINING_MARK_SCALAR_RE.test(scalars[j])) {
      marks.push(scalars[j]);
      j += 1;
    }

    const d = marks.length;
    const baseClass = classifyBaseScalar(ch);
    classStats[baseClass].count += 1;
    if (d > 0) {
      classStats[baseClass].decoratedCount += 1;
      classStats[baseClass].markCount += d;
    }

    if (baseClass === 'whitespace') {
      if (ch === '\n') {
        lineBuckets.push(currentLineNonWsDepths);
        currentLineNonWsDepths = [];
      }
    } else {
      allNonWsDepths.push(d);
      currentLineNonWsDepths.push(d);
      if (d > 0) decoratedNonWsDepths.push(d);
    }

    if (d > 0) {
      totalMarks += d;
      const seqSig = marks.map((m) => m.codePointAt(0).toString(16)).join(',');
      if (!seqTable.has(seqSig)) seqTable.set(seqSig, seqTable.size);
      const seqId = seqTable.get(seqSig);
      allDecoratedSeqIds.push(seqId);
      if (baseClass !== 'whitespace') nonWsDecoratedSeqIds.push(seqId);

      const seenInCluster = new Set();
      let dupInCluster = 0;
      let prevCp = null;
      let runLen = 0;
      for (let mIdx = 0; mIdx < d; mIdx += 1) {
        const cpHex = `U+${marks[mIdx].codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`;
        markCpCounts.set(cpHex, (markCpCounts.get(cpHex) || 0) + 1);
        if (seenInCluster.has(cpHex)) dupInCluster += 1;
        else seenInCluster.add(cpHex);

        if (cpHex === prevCp) {
          runLen += 1;
          if (runLen > maxSameCpRun) maxSameCpRun = runLen;
        } else {
          prevCp = cpHex;
          runLen = 1;
        }

        if (mIdx > 0) {
          const prevHex = `U+${marks[mIdx - 1].codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`;
          const bg = `${prevHex}->${cpHex}`;
          bigramCounts.set(bg, (bigramCounts.get(bg) || 0) + 1);
        }
      }
      withinClusterDupSum += dupInCluster;
      if (dupInCluster > 0) clustersWithDupSum += 1;
    }

    i = j;
  }
  if (currentLineNonWsDepths.length > 0 || lineBuckets.length === 0) {
    lineBuckets.push(currentLineNonWsDepths);
  }

  const formatClassEntry = (st) => Object.freeze({
    count: st.count,
    decoratedCount: st.decoratedCount,
    undecoratedCount: st.count - st.decoratedCount,
    decoratedRatio: st.count > 0 ? round4(st.decoratedCount / st.count) : 0,
    undecoratedRatio: st.count > 0 ? round4((st.count - st.decoratedCount) / st.count) : 0,
    markCount: st.markCount
  });

  const baseClassDecoration = Object.freeze({
    letter: formatClassEntry(classStats.letter),
    whitespace: formatClassEntry(classStats.whitespace),
    punctuation: formatClassEntry(classStats.punctuation),
    digit: formatClassEntry(classStats.digit),
    other: formatClassEntry(classStats.other),
    orphanedLeadingMarks
  });

  const decoratedStats = summarizeNumericSeries(decoratedNonWsDepths);
  const allNonWsStats = summarizeNumericSeries(allNonWsDepths);

  const scaleInvariantDispersion = Object.freeze({
    totalNonWsCount: allNonWsDepths.length,
    decoratedNonWsCount: decoratedNonWsDepths.length,
    plainNonWsCount: allNonWsDepths.length - decoratedNonWsDepths.length,
    plainNonWsRatio: allNonWsDepths.length > 0 ? round4((allNonWsDepths.length - decoratedNonWsDepths.length) / allNonWsDepths.length) : 0,
    decorated: Object.freeze(decoratedStats),
    allNonWhitespace: Object.freeze(allNonWsStats)
  });

  const lagAll = computeLagAutocorrelation(allDecoratedSeqIds);
  const lagNonWs = computeLagAutocorrelation(nonWsDecoratedSeqIds);
  const deflatedBytes = rawBuf.byteLength > 0 ? zlib.deflateRawSync(rawBuf).byteLength : 0;
  const periodicRepetition = Object.freeze({
    decoratedClusterCount: allDecoratedSeqIds.length,
    uniqueSequenceCount: seqTable.size,
    uniqueSequenceRatio: allDecoratedSeqIds.length > 0 ? round4(seqTable.size / allDecoratedSeqIds.length) : 0,
    maxLagMatchRate: lagAll.maxLagMatchRate,
    dominantLag: lagAll.dominantLag,
    lag1AdjacentCloneRate: lagAll.lag1AdjacentCloneRate,
    topLags: Object.freeze(lagAll.topLags),
    nonWsMaxLagMatchRate: lagNonWs.maxLagMatchRate,
    nonWsDominantLag: lagNonWs.dominantLag,
    deflateCompressionRatio: rawBuf.byteLength > 0 ? round4(deflatedBytes / rawBuf.byteLength) : 1
  });

  const runawaySpikeGeometry = Object.freeze({
    maxDepth: decoratedStats.max,
    p90Depth: decoratedStats.p90,
    p99Depth: decoratedStats.p99,
    maxToMedianRatio: round4(decoratedStats.max / Math.max(decoratedStats.median, 1)),
    top1MarkShare: totalMarks > 0 ? round4(decoratedStats.max / totalMarks) : 0,
    depthGini: computeGini(decoratedNonWsDepths)
  });

  let entropyBits = 0;
  if (totalMarks > 0) {
    for (const cnt of markCpCounts.values()) {
      const p = cnt / totalMarks;
      entropyBits -= p * Math.log2(p);
    }
  }
  const maxEntropyBits = markCpCounts.size > 1 ? Math.log2(markCpCounts.size) : 0;
  const totalBigrams = Math.max(0, totalMarks - allDecoratedSeqIds.length);
  const sortedBigrams = [...bigramCounts.entries()].sort((a, b) => b[1] - a[1]);
  const topBigramShare = totalBigrams > 0 && sortedBigrams.length > 0
    ? round4(sortedBigrams[0][1] / totalBigrams)
    : 0;

  const intraClusterDiversity = Object.freeze({
    totalMarks,
    uniqueMarkCodepoints: markCpCounts.size,
    markEntropyBits: round4(entropyBits),
    normalizedEntropy: maxEntropyBits > 0 ? round4(entropyBits / maxEntropyBits) : 0,
    withinClusterDuplicateMarkCount: withinClusterDupSum,
    withinClusterDuplicateMarkShare: totalMarks > 0 ? round4(withinClusterDupSum / totalMarks) : 0,
    clustersWithInternalDuplicateShare: allDecoratedSeqIds.length > 0 ? round4(clustersWithDupSum / allDecoratedSeqIds.length) : 0,
    maxSameCodepointRunInCluster: maxSameCpRun,
    topBigramShare,
    topBigrams: Object.freeze(sortedBigrams.slice(0, 5).map(([pair, count]) => Object.freeze({ pair, count })))
  });

  // Sectional progression across non-whitespace base clusters and lines
  const qSize = Math.floor(allNonWsDepths.length / 4);
  const quartiles = [0, 1, 2, 3].map((q) => {
    const start = q * qSize;
    const end = q === 3 ? allNonWsDepths.length : (q + 1) * qSize;
    const slice = qSize > 0 ? allNonWsDepths.slice(start, end) : (q === 0 ? allNonWsDepths : []);
    const st = summarizeNumericSeries(slice);
    const zeroShare = slice.length > 0 ? round4(slice.filter((d) => d === 0).length / slice.length) : 0;
    return Object.freeze({
      quartile: q + 1,
      count: slice.length,
      mean: st.mean,
      median: st.median,
      min: st.min,
      max: st.max,
      zeroShare
    });
  });

  const nonEmptyQuartiles = quartiles.filter((q) => q.count > 0);
  const qMeans = nonEmptyQuartiles.map((q) => q.mean);
  const qMedians = nonEmptyQuartiles.map((q) => q.median);
  const quartileMeanRange = qMeans.length ? round4(Math.max(...qMeans) - Math.min(...qMeans)) : 0;
  const quartileMedianRange = qMedians.length ? round4(Math.max(...qMedians) - Math.min(...qMedians)) : 0;
  const quartileNormalizedRange = nonEmptyQuartiles.length >= 2
    ? round4(quartileMeanRange / Math.max(allNonWsStats.mean, 1))
    : 0;

  let plain0 = 0;
  let restrained1To4 = 0;
  let medium5To7 = 0;
  let towering8Plus = 0;
  for (const d of allNonWsDepths) {
    if (d === 0) plain0 += 1;
    else if (d <= 4) restrained1To4 += 1;
    else if (d <= 7) medium5To7 += 1;
    else towering8Plus += 1;
  }
  const nonWsTotal = Math.max(allNonWsDepths.length, 1);

  const nonEmptyLines = lineBuckets.filter((arr) => arr.length > 0);
  const lineSummaries = nonEmptyLines.map((arr, idx) => {
    const st = summarizeNumericSeries(arr);
    const zeroCount = arr.filter((d) => d === 0).length;
    return Object.freeze({
      line: idx + 1,
      baseCount: arr.length,
      median: st.median,
      mean: st.mean,
      max: st.max,
      plainShare: round4(zeroCount / arr.length)
    });
  });

  const sectionalProgression = Object.freeze({
    quartiles: Object.freeze(quartiles),
    quartileMeanRange,
    quartileMedianRange,
    quartileNormalizedRange,
    spearmanPositionDepthRho: computeSpearmanPositionRho(allNonWsDepths),
    lineCount: lineSummaries.length,
    lineSummaries: Object.freeze(lineSummaries),
    regimeOccupancy: Object.freeze({
      plain_0: round4(plain0 / nonWsTotal),
      restrained_1_4: round4(restrained1To4 / nonWsTotal),
      medium_5_7: round4(medium5To7 / nonWsTotal),
      towering_8_plus: round4(towering8Plus / nonWsTotal)
    })
  });

  // Orthogonal exploratory diagnostic flags (never collapsed into a scalar crown)
  const periodicTapeLoopStencil = periodicRepetition.decoratedClusterCount >= 20
    && periodicRepetition.maxLagMatchRate >= 0.45;
  const extremeUniformDepthBlizzard = decoratedNonWsDepths.length >= 20
    && decoratedStats.mean >= 8
    && decoratedStats.cv < 0.15
    && baseClassDecoration.letter.undecoratedRatio < 0.05;
  const runawaySingleClusterSpike = runawaySpikeGeometry.maxDepth >= 100
    && runawaySpikeGeometry.top1MarkShare >= 0.5;
  const indiscriminateWhitespaceDecoration = baseClassDecoration.whitespace.count >= 10
    && baseClassDecoration.whitespace.decoratedRatio >= 0.5;
  const indiscriminatePunctuationDecoration = baseClassDecoration.punctuation.count >= 3
    && baseClassDecoration.punctuation.decoratedRatio >= 0.5;
  const excessiveIntraClusterDuplication = totalMarks >= 50
    && intraClusterDiversity.withinClusterDuplicateMarkShare >= 0.35;
  const flatUnmodulatedProgression = decoratedNonWsDepths.length >= 20
    && baseClassDecoration.letter.undecoratedRatio < 0.05
    && quartileNormalizedRange < 0.10;

  const flags = [];
  if (periodicTapeLoopStencil) flags.push('PERIODIC_TAPE_LOOP_STENCIL');
  if (extremeUniformDepthBlizzard) flags.push('EXTREME_UNIFORM_DEPTH_BLIZZARD');
  if (runawaySingleClusterSpike) flags.push('RUNAWAY_SINGLE_CLUSTER_SPIKE');
  if (indiscriminateWhitespaceDecoration) flags.push('INDISCRIMINATE_WHITESPACE_DECORATION');
  if (indiscriminatePunctuationDecoration) flags.push('INDISCRIMINATE_PUNCTUATION_DECORATION');
  if (excessiveIntraClusterDuplication) flags.push('EXCESSIVE_INTRA_CLUSTER_DUPLICATION');
  if (flatUnmodulatedProgression) flags.push('FLAT_UNMODULATED_PROGRESSION');

  const technicalUnicodeCapabilityObserved = (
    totalMarks > 0
    && markCpCounts.size >= 4
    && decoratedStats.max >= 8
  );
  const controlledChoreographicVariationObserved = (
    technicalUnicodeCapabilityObserved
    && baseClassDecoration.letter.undecoratedRatio >= 0.10
    && baseClassDecoration.whitespace.decoratedRatio < 0.15
    && baseClassDecoration.punctuation.decoratedRatio < 0.25
    && flags.length === 0
  );

  return Object.freeze({
    schema: R2_EXPLORATORY_MORPHOLOGY_SCHEMA,
    exploratoryOnly: true,
    doesNotModifyFrozenV2Verdict: true,
    noScalarCrown: true,
    artisticQualityVerdict: 'UNIDENTIFIABLE_AUTOMATICALLY_RESERVED_HUMAN_ONLY',
    rawSha256,
    utf8Bytes: rawBuf.byteLength,
    strippedProseStats: Object.freeze({
      strippedCharCount: Array.from(strippedText).length,
      strippedWordCount: strippedText.trim() ? strippedText.trim().split(/\s+/u).length : 0,
      strippedSha256: crypto.createHash('sha256').update(Buffer.from(strippedText, 'utf8')).digest('hex')
    }),
    baseClassDecoration,
    scaleInvariantDispersion,
    periodicRepetition,
    runawaySpikeGeometry,
    intraClusterDiversity,
    sectionalProgression,
    exploratoryDiagnosticFlags: Object.freeze({
      periodicTapeLoopStencil,
      extremeUniformDepthBlizzard,
      runawaySingleClusterSpike,
      indiscriminateWhitespaceDecoration,
      indiscriminatePunctuationDecoration,
      excessiveIntraClusterDuplication,
      flatUnmodulatedProgression,
      flags: Object.freeze(flags),
      technicalUnicodeCapabilityObserved,
      controlledChoreographicVariationObserved,
      structuralIndicatorAuthority: 'EXPLORATORY_DIAGNOSTIC_ONLY_NOT_ARTISTIC_JUDGMENT'
    })
  });
}
