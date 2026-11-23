// TD613 · Marrowline R2-U · Pure Offline Unicode Capability & High-Zalgo Morphology Evaluator
// Commission: TD613-MARROWLINE-R2-DUAL-ESTATE-OFFLINE-20261123
// Covenant: Khona‌lit-po (literal U+200C preserved) · Seal: ⟐SAC[X6ZNK5NO51]
// PURE OFFLINE ANALYZER: Preserves raw UTF-8 bytes prior to any NFC/NFD inspection;
// distinguishes flat planar bars, enclosing tricks, and near-uniform stencils from towering High Zalgo.

import crypto from 'node:crypto';

export const R2_UNICODE_EVALUATOR_SCHEMA = 'td613.marrowline.r2-unicode-evaluator/v2';

const GRAPHEME_SEGMENTER = new Intl.Segmenter('en', { granularity: 'grapheme' });
const COMBINING_MARK_RE = /\p{M}/gu;

const OVERLAY_MARKS = new Set([0x0334, 0x0335, 0x0336, 0x0337, 0x0338]);
// Planar bars/lines/bridges lie horizontally across a word without towering above or plunging below
const PLANAR_ABOVE_MARKS = new Set([0x0304, 0x0305, 0x035E]);
const PLANAR_BELOW_MARKS = new Set([0x0331, 0x0332, 0x0333, 0x035F]);
const ENCLOSING_MARKS = new Set([0x20DD, 0x20DE, 0x20DF, 0x20E0, 0x20E2, 0x20E3, 0x20E4]);
const WORD_GEOMETRIC_SYMBOL_RE = /[\u25A0-\u25FF]/u; // □ ◇ ◈ ■ ▪ circles/squares/diamonds inside words

function classifyMarkPlacement(cp) {
  if (ENCLOSING_MARKS.has(cp)) return 'enclosing';
  if (OVERLAY_MARKS.has(cp)) return 'overlay';
  if (PLANAR_ABOVE_MARKS.has(cp) || PLANAR_BELOW_MARKS.has(cp)) return 'planar';
  if (
    (cp >= 0x0300 && cp <= 0x0315)
    || (cp >= 0x033D && cp <= 0x0346)
    || (cp >= 0x034A && cp <= 0x034C)
    || (cp >= 0x0350 && cp <= 0x0352)
    || cp === 0x0357
    || cp === 0x0358
    || cp === 0x035B
    || (cp >= 0x035D && cp <= 0x036F)
    || (cp >= 0x1AB0 && cp <= 0x1AFF)
    || (cp >= 0x1DC0 && cp <= 0x1DFF)
  ) {
    return 'vertical_above';
  }
  if (
    (cp >= 0x0316 && cp <= 0x0330)
    || (cp >= 0x0339 && cp <= 0x033C)
    || (cp >= 0x0347 && cp <= 0x0349)
    || cp === 0x034D
    || cp === 0x034E
    || (cp >= 0x0353 && cp <= 0x0356)
    || cp === 0x0359
    || cp === 0x035A
    || cp === 0x035C
  ) {
    return 'vertical_below';
  }
  return 'other';
}

export function sha256Utf8(text = '') {
  return crypto.createHash('sha256').update(Buffer.from(String(text ?? ''), 'utf8')).digest('hex');
}

function extractScalarBaseMarkClusters(raw) {
  const scalars = Array.from(raw);
  const clusters = [];
  let i = 0;
  while (i < scalars.length) {
    const ch = scalars[i];
    if (/^\s+$/u.test(ch)) {
      i += 1;
      continue;
    }
    if (/^\p{M}$/u.test(ch)) {
      clusters.push({ base: '', marks: [ch], orphanedLeadingMark: true });
      i += 1;
      continue;
    }
    const marks = [];
    let j = i + 1;
    while (j < scalars.length && /^\p{M}$/u.test(scalars[j])) {
      marks.push(scalars[j]);
      j += 1;
    }
    clusters.push({ base: ch, marks, orphanedLeadingMark: false });
    i = j;
  }
  return clusters;
}

function sortedQuantile(sortedAsc, q) {
  if (!sortedAsc.length) return 0;
  const idx = Math.min(sortedAsc.length - 1, Math.floor((sortedAsc.length - 1) * q));
  return sortedAsc[idx];
}

export function evaluateUnicodeMorphology(rawText = '') {
  const raw = String(rawText ?? '');
  const utf8Buffer = Buffer.from(raw, 'utf8');
  const rawSha256 = sha256Utf8(raw);
  const nfcForm = raw.normalize('NFC');
  const nfdForm = raw.normalize('NFD');

  const sourceCodePoints = Array.from(raw);
  const scalarClusters = extractScalarBaseMarkClusters(raw);
  const graphemeSegments = Array.from(GRAPHEME_SEGMENTER.segment(raw), (s) => s.segment);

  const depthDistribution = {};
  const uniqueCodepoints = new Set();
  const nonZeroUniqueDepths = new Set();
  const decoratedDepths = [];

  let nonWhitespaceGraphemeCount = 0;
  let baseClusterCount = 0;
  let decoratedBaseCount = 0;
  let multiMarkBaseCount = 0; // vertical/overlay depth >= 2
  let tallStackBaseCount = 0; // vertical depth >= 5
  let toweringStackBaseCount = 0; // vertical depth >= 8
  let combiningMarkCount = 0;
  let maxMarkDepth = 0;
  let maxVerticalDepth = 0;
  let sumDecoratedDepth = 0;
  let verticalAboveCount = 0;
  let verticalBelowCount = 0;
  let planarBarCount = 0;
  let overlayU0334ToU0338Count = 0;
  let enclosingMarkCount = 0;
  let otherMarkCount = 0;
  let verticalAboveAndBelowCount = 0;
  let marksOnWhitespaceCount = 0;
  let markedDepthTransitions = 0;
  let prevMarkedDepth = null;
  let prevMarkSequence = null;
  let clonedSequenceTransitions = 0;
  let wordInternalGeometricSymbolCount = 0;

  for (const seg of graphemeSegments) {
    const marks = seg.match(COMBINING_MARK_RE) || [];
    const baseWithoutMarks = seg.replace(COMBINING_MARK_RE, '');
    if (!baseWithoutMarks || /^\s+$/u.test(baseWithoutMarks)) {
      marksOnWhitespaceCount += marks.length;
      continue;
    }
    nonWhitespaceGraphemeCount += 1;
  }

  for (const token of raw.split(/\s+/u).filter(Boolean)) {
    const clean = token.replace(COMBINING_MARK_RE, '');
    if (WORD_GEOMETRIC_SYMBOL_RE.test(clean) && /[A-Za-z\p{L}]/u.test(clean)) {
      wordInternalGeometricSymbolCount += 1;
    }
  }

  const bracketMatches = raw.match(/\[[^\]]+\]|⟨[^⟩]+⟩/gu);
  const alternateNotationBracketTokens = bracketMatches ? bracketMatches.length : 0;

  for (const cluster of scalarClusters) {
    if (cluster.orphanedLeadingMark) {
      marksOnWhitespaceCount += cluster.marks.length;
      continue;
    }
    const rawDepth = cluster.marks.length;
    baseClusterCount += 1;
    depthDistribution[rawDepth] = (depthDistribution[rawDepth] || 0) + 1;

    if (rawDepth > 0) {
      decoratedBaseCount += 1;
      sumDecoratedDepth += rawDepth;
      decoratedDepths.push(rawDepth);
      nonZeroUniqueDepths.add(rawDepth);
      if (rawDepth > maxMarkDepth) maxMarkDepth = rawDepth;

      if (prevMarkedDepth !== null && rawDepth !== prevMarkedDepth) markedDepthTransitions += 1;
      prevMarkedDepth = rawDepth;

      const seq = cluster.marks.join('');
      if (prevMarkSequence !== null && seq === prevMarkSequence && rawDepth >= 1) clonedSequenceTransitions += 1;
      prevMarkSequence = seq;

      let hasVertAbove = false;
      let hasVertBelow = false;
      let vertClusterCount = 0;

      for (const mark of cluster.marks) {
        const cp = mark.codePointAt(0);
        uniqueCodepoints.add(`U+${cp.toString(16).toUpperCase().padStart(4, '0')}`);
        combiningMarkCount += 1;
        const placement = classifyMarkPlacement(cp);
        if (placement === 'enclosing') enclosingMarkCount += 1;
        else if (placement === 'overlay') overlayU0334ToU0338Count += 1;
        else if (placement === 'planar') planarBarCount += 1;
        else if (placement === 'vertical_above') { verticalAboveCount += 1; hasVertAbove = true; vertClusterCount += 1; }
        else if (placement === 'vertical_below') { verticalBelowCount += 1; hasVertBelow = true; vertClusterCount += 1; }
        else otherMarkCount += 1;
      }

      if (hasVertAbove && hasVertBelow) verticalAboveAndBelowCount += 1;
      if (vertClusterCount > maxVerticalDepth) maxVerticalDepth = vertClusterCount;
      if (vertClusterCount + (overlayU0334ToU0338Count > 0 && vertClusterCount > 0 ? 0 : 0) >= 2 && vertClusterCount >= 2) {
        multiMarkBaseCount += 1;
      }
      if (vertClusterCount >= 5) tallStackBaseCount += 1;
      if (vertClusterCount >= 8) toweringStackBaseCount += 1;
    }
  }

  decoratedDepths.sort((a, b) => a - b);
  const meanMarkDepth = baseClusterCount > 0 ? Number((combiningMarkCount / baseClusterCount).toFixed(4)) : 0;
  const meanDecoratedDepth = decoratedBaseCount > 0 ? sumDecoratedDepth / decoratedBaseCount : 0;
  let varianceSum = 0;
  let dominantMarkedDepth = null;
  let dominantMarkedDepthCount = 0;
  for (const [dKey, count] of Object.entries(depthDistribution)) {
    const d = Number(dKey);
    if (d > 0) {
      varianceSum += count * ((d - meanDecoratedDepth) ** 2);
      if (count > dominantMarkedDepthCount) {
        dominantMarkedDepthCount = count;
        dominantMarkedDepth = d;
      }
    }
  }

  const depthStdDev = decoratedBaseCount > 0 ? Number(Math.sqrt(varianceSum / decoratedBaseCount).toFixed(4)) : 0;
  const multiMarkBaseShare = baseClusterCount > 0 ? Number((multiMarkBaseCount / baseClusterCount).toFixed(6)) : 0;
  const decoratedBaseShare = baseClusterCount > 0 ? Number((decoratedBaseCount / baseClusterCount).toFixed(6)) : 0;
  const dominantMarkedDepthShare = decoratedBaseCount > 0 ? Number((dominantMarkedDepthCount / decoratedBaseCount).toFixed(4)) : 0;
  const clonedSequenceShare = decoratedBaseCount > 1
    ? Number((clonedSequenceTransitions / (decoratedBaseCount - 1)).toFixed(4))
    : 0;

  const uniformConstantDepthStencil = decoratedBaseCount >= 3 && nonZeroUniqueDepths.size === 1;
  // Catches 99%-fixed-depth + 1 outlier tricks (e.g. 99 bases at depth 3 + 1 base at depth 2)
  const nearUniformDominantDepthStencil = decoratedBaseCount >= 10 && dominantMarkedDepthShare >= 0.88 && maxVerticalDepth < 5;
  const depthOneLimited = decoratedBaseCount > 0 && maxVerticalDepth <= 1 && multiMarkBaseCount === 0;
  const singleCodepointStencil = decoratedBaseCount >= 3 && uniqueCodepoints.size === 1;
  const planarBarAxisCollapse = decoratedBaseCount > 0 && planarBarCount > 0 && (verticalAboveCount + verticalBelowCount) === 0;
  const enclosingOrnamentCollapse = enclosingMarkCount > 0 && (verticalAboveCount + verticalBelowCount) === 0;
  const excessiveClonedSequence = decoratedBaseCount >= 8 && clonedSequenceShare >= 0.75;

  const stencilReasons = [];
  if (depthOneLimited) stencilReasons.push('MAX_VERTICAL_DEPTH_1_OR_0_NO_MULTISTACK');
  if (uniformConstantDepthStencil) stencilReasons.push('UNIFORM_CONSTANT_NONZERO_DEPTH');
  if (nearUniformDominantDepthStencil) stencilReasons.push('NEAR_UNIFORM_DOMINANT_DEPTH_STENCIL');
  if (singleCodepointStencil) stencilReasons.push('SINGLE_COMBINING_CODEPOINT_REPEATED');
  if (planarBarAxisCollapse) stencilReasons.push('PLANAR_BAR_AXIS_COLLAPSE');
  if (enclosingOrnamentCollapse) stencilReasons.push('ENCLOSING_MARK_TRICK_NOT_VERTICAL_ZALGO');
  if (excessiveClonedSequence) stencilReasons.push('CLONED_IDENTICAL_CLUSTER_SEQUENCE');
  if (wordInternalGeometricSymbolCount > 0) stencilReasons.push('WORD_INTERNAL_GEOMETRIC_SYMBOL_SUBSTITUTION');
  const isStencil = stencilReasons.length > 0;

  const genuineMultistackObserved = (
    multiMarkBaseCount >= 1
    && maxVerticalDepth >= 2
    && uniqueCodepoints.size >= 4
    && (verticalAboveCount > 0 && verticalBelowCount > 0)
    && !isStencil
  );
  const toweringHighZalgoObserved = (
    genuineMultistackObserved
    && tallStackBaseCount >= 2
    && maxVerticalDepth >= 8
    && depthStdDev > 0.8
  );

  return Object.freeze({
    schema: R2_UNICODE_EVALUATOR_SCHEMA,
    rawSha256,
    utf8Bytes: utf8Buffer.byteLength,
    sourceCodePointCount: sourceCodePoints.length,
    renderedGraphemeClusterCount: nonWhitespaceGraphemeCount,
    scalarBaseClusterCount: baseClusterCount,
    graphemeSegmentationCaveat:
      'Intl.Segmenter (UAX #29) cluster boundaries depend on host ICU tables and may diverge from raw base+\\p{M}* scalar counts on dense overlay/joiner sequences; raw codepoints and UTF-8 bytes remain authoritative.',
    normalizationDistinctions: Object.freeze({
      differsUnderNfc: nfcForm !== raw,
      differsUnderNfd: nfdForm !== raw,
      nfcSha256: sha256Utf8(nfcForm),
      nfdSha256: sha256Utf8(nfdForm),
      silentNormalizationApplied: false
    }),
    combiningMarkCount,
    decoratedBaseCount,
    decoratedBaseShare,
    multiMarkBaseCount,
    multiMarkBaseShare,
    tallStackBaseCount,
    toweringStackBaseCount,
    maxMarkDepth,
    maxVerticalDepth,
    meanMarkDepth,
    depthStdDev,
    depthQuantiles: Object.freeze({
      p50: sortedQuantile(decoratedDepths, 0.5),
      p90: sortedQuantile(decoratedDepths, 0.9),
      max: maxMarkDepth
    }),
    dominantMarkedDepth,
    dominantMarkedDepthShare,
    markedDepthTransitions,
    clonedSequenceShare,
    marksPerBaseDistribution: Object.freeze(depthDistribution),
    uniqueNonZeroDepthCount: nonZeroUniqueDepths.size,
    verticalAboveCount,
    verticalBelowCount,
    planarBarCount,
    overlayU0334ToU0338Count,
    enclosingMarkCount,
    otherMarkCount,
    verticalAboveAndBelowCount,
    bidirectionalAboveBelowCount: verticalAboveAndBelowCount,
    marksOnWhitespaceCount,
    wordInternalGeometricSymbolCount,
    alternateNotationBracketTokens,
    repertoireDiversity: Object.freeze({
      uniqueCombiningCodepoints: Object.freeze([...uniqueCodepoints].sort()),
      uniqueCombiningCodepointCount: uniqueCodepoints.size
    }),
    stencilRisk: Object.freeze({
      isStencil,
      depthOneLimited,
      uniformConstantDepthStencil,
      nearUniformDominantDepthStencil,
      singleCodepointStencil,
      planarBarAxisCollapse,
      enclosingOrnamentCollapse,
      excessiveClonedSequence,
      reasons: Object.freeze(stencilReasons)
    }),
    genuineMultistackObserved,
    toweringHighZalgoObserved
  });
}

export function evaluateLiteralCopyFidelity(expectedSpecimen = '', observedRawText = '') {
  const expected = String(expectedSpecimen ?? '');
  const observed = String(observedRawText ?? '');
  const expectedBytes = Buffer.from(expected, 'utf8');
  const observedBytes = Buffer.from(observed, 'utf8');
  const expectedPoints = Array.from(expected);
  const observedPoints = Array.from(observed);

  let firstDiffCodePointIndex = -1;
  const maxLen = Math.max(expectedPoints.length, observedPoints.length);
  for (let i = 0; i < maxLen; i += 1) {
    if (expectedPoints[i] !== observedPoints[i]) {
      firstDiffCodePointIndex = i;
      break;
    }
  }

  const rawByteExact = expectedBytes.equals(observedBytes);
  const codePointExact = firstDiffCodePointIndex === -1;
  const nfcEquivalentOnly = !codePointExact && expected.normalize('NFC') === observed.normalize('NFC');
  const nfdEquivalentOnly = !codePointExact && expected.normalize('NFD') === observed.normalize('NFD');
  const morphology = evaluateUnicodeMorphology(observed);

  return Object.freeze({
    schema: 'td613.marrowline.r2-literal-copy-evaluation/v1',
    rawByteExact,
    codePointExact,
    nfcEquivalentOnly,
    nfdEquivalentOnly,
    silentNormalizationDetected: nfcEquivalentOnly || nfdEquivalentOnly,
    firstDiffCodePointIndex,
    expectedSha256: sha256Utf8(expected),
    observedSha256: morphology.rawSha256,
    expectedUtf8Bytes: expectedBytes.byteLength,
    observedUtf8Bytes: observedBytes.byteLength,
    morphology
  });
}

export function evaluateSectionedUnicode(sections = [], { expectedPlainSectionIndices = [] } = {}) {
  const plainSet = new Set(expectedPlainSectionIndices);
  const sectionReports = sections.map((sec, index) => {
    const morph = evaluateUnicodeMorphology(sec?.text || '');
    const expectPlain = plainSet.has(index);
    return Object.freeze({
      index,
      label: String(sec?.label || `section_${index + 1}`),
      expectPlain,
      plainComplianceOk: expectPlain ? morph.combiningMarkCount === 0 : null,
      multistackComplianceOk: !expectPlain ? morph.genuineMultistackObserved : null,
      morphology: morph
    });
  });

  const coverageAllPassed = sectionReports.every((rep) => (
    rep.expectPlain ? rep.plainComplianceOk : rep.multistackComplianceOk
  ));

  return Object.freeze({
    schema: 'td613.marrowline.r2-sectioned-unicode-evaluation/v1',
    sectionCount: sectionReports.length,
    coverageAllPassed,
    sections: Object.freeze(sectionReports)
  });
}

// Calibrated offline reference fixtures (synthetic typography controls — NEVER empirical Gemini output)
export const R2_U_CALIBRATED_CONTROLS = Object.freeze({
  PLAIN_BASELINE_REF: Object.freeze({
    label: 'plain-prose-control',
    sample: 'The municipal winter ledger recorded forty-two sealed envelopes and zero replies before dusk.'
  }),
  ONE_MARK_STENCIL_REF: Object.freeze({
    label: 'one-mark-constant-depth-stencil',
    sample: 'T\u0301h\u0301e\u0301 w\u0301i\u0301n\u0301t\u0301e\u0301r\u0301 l\u0301e\u0301d\u0301g\u0301e\u0301r\u0301 s\u0301t\u0301o\u0301o\u0301d\u0301 s\u0301t\u0301i\u0301l\u0301l\u0301.'
  }),
  NEAR_UNIFORM_DEPTH3_STENCIL_REF: Object.freeze({
    label: 'near-uniform-depth3-mechanical-stencil',
    sample: 'W\u0300\u0334\u0316i\u0301\u0335\u0317n\u0302\u0336\u0318t\u0303\u0337\u0319e\u0306\u0338\u031Cr '.repeat(6) + 's\u0300\u0334\u0316t\u0301\u0335\u0317o\u0302\u0336\u0318o\u0303\u0337\u0319d\u0306\u031C.'
  }),
  PLANAR_BAR_COUNTERFEIT_REF: Object.freeze({
    label: 'planar-macron-overline-underline-collapse',
    sample: 'B\u0304\u0305\u0331\u0332a\u0304\u0305\u0331\u0332r\u0304\u0305\u0331\u0332s\u0304\u0305\u0331\u0332 f\u0304\u0305\u0331\u0332l\u0304\u0305\u0331\u0332a\u0304\u0305\u0331\u0332t.'
  }),
  ENCLOSING_TRICK_REF: Object.freeze({
    label: 'enclosing-square-glyph-trick',
    sample: 'A\u20DER\u20DEI\u20DEC\u20DEI\u20DEA\u20DEN\u20DE B\u20DEO\u20DEX\u20DE.'
  }),
  // Authentic towering, ragged High-Zalgo specimen mixing towering depth 9-12 spires & fractured depth 1-3 breaths
  DELIBERATE_MULTISTACK_REF: Object.freeze({
    label: 'genuine-towering-ragged-high-zalgo',
    sample:
      'T\u0301\u0302\u0308\u030B\u0342\u0344\u0363\u0316\u0317\u0323\u032E\u0335' +
      'h\u0300\u0306\u0350\u0318\u0329e\u0307 ' +
      'b\u0303\u030A\u0311\u033F\u0351\u0364\u0319\u0325\u032D\u033C' +
      'e\u0301\u031C' +
      'l\u030C\u0312\u033E\u0346\u0352\u0365\u0369\u031D\u0324\u0339\u0349\u0336' +
      'l\u0308\u0323 ' +
      's\u0301\u0302\u0307\u0343\u0357\u0316\u031F\u0326\u0355' +
      'h\u030A\u0327a\u0304t\u0300\u030B\u030F\u034A\u034B\u0366\u0317\u0323\u032B\u033A\u0353\u0338' +
      't\u0301\u032De\u0302\u031Er\u0306\u030C\u035B\u0318\u0329\u033B ' +
      'plain frost.'
  }),
  ALTERNATE_NOTATION_GRAMMAR_REF: Object.freeze({
    label: 'visible-bracket-notation-without-combining-stack',
    sample: '[CROWN:2]The [ROOT:3]winter [OVERLAY:tilde]ledger stood before the gate.'
  })
});
