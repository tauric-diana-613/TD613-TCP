// TD613 · Marrowline R2-U · Pure Offline Unicode Capability & Morphology Evaluator
// Commission: TD613-MARROWLINE-R2-DUAL-ESTATE-OFFLINE-20261123
// Covenant: Khona‌lit-po (literal U+200C preserved) · Seal: ⟐SAC[X6ZNK5NO51]
// PURE OFFLINE ANALYZER: Preserves raw UTF-8 bytes prior to any NFC/NFD inspection.

import crypto from 'node:crypto';

export const R2_UNICODE_EVALUATOR_SCHEMA = 'td613.marrowline.r2-unicode-evaluator/v1';

const GRAPHEME_SEGMENTER = new Intl.Segmenter('en', { granularity: 'grapheme' });
const COMBINING_MARK_RE = /\p{M}/gu;
const OVERLAY_RANGES = new Set([0x0334, 0x0335, 0x0336, 0x0337, 0x0338]);

function classifyMarkPlacement(cp) {
  if (OVERLAY_RANGES.has(cp)) return 'overlay';
  if (
    (cp >= 0x0300 && cp <= 0x0315)
    || (cp >= 0x033D && cp <= 0x0346)
    || (cp >= 0x034A && cp <= 0x034C)
    || (cp >= 0x0350 && cp <= 0x0352)
    || cp === 0x0357
    || cp === 0x0358
    || cp === 0x035B
    || (cp >= 0x035D && cp <= 0x036F)
  ) {
    return 'above';
  }
  if (
    (cp >= 0x0316 && cp <= 0x0333)
    || (cp >= 0x0339 && cp <= 0x033C)
    || (cp >= 0x0347 && cp <= 0x0349)
    || cp === 0x034D
    || cp === 0x034E
    || (cp >= 0x0353 && cp <= 0x0356)
    || cp === 0x0359
    || cp === 0x035A
    || cp === 0x035C
  ) {
    return 'below';
  }
  return 'other';
}

export function sha256Utf8(text = '') {
  return crypto.createHash('sha256').update(Buffer.from(String(text ?? ''), 'utf8')).digest('hex');
}

/**
 * Computes scalar base+combining clusters independently of UAX #29 locale segmenter,
 * allowing callers to see both ICU grapheme segmentation and raw base+mark runs.
 */
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

  let nonWhitespaceGraphemeCount = 0;
  let baseClusterCount = 0;
  let multiMarkBaseCount = 0;
  let decoratedBaseCount = 0;
  let combiningMarkCount = 0;
  let maxMarkDepth = 0;
  let sumDecoratedDepth = 0;
  let aboveCount = 0;
  let belowCount = 0;
  let overlayU0334ToU0338Count = 0;
  let otherMarkCount = 0;
  let bidirectionalAboveBelowCount = 0;
  let marksOnWhitespaceCount = 0;
  let alternateNotationBracketTokens = 0;

  for (const seg of graphemeSegments) {
    const marks = seg.match(COMBINING_MARK_RE) || [];
    const baseWithoutMarks = seg.replace(COMBINING_MARK_RE, '');
    if (!baseWithoutMarks || /^\s+$/u.test(baseWithoutMarks)) {
      marksOnWhitespaceCount += marks.length;
      continue;
    }
    nonWhitespaceGraphemeCount += 1;
  }

  // Alternate inline notation heuristic (e.g., [x^2], ⟨above/below⟩, diacritic-free markup tokens)
  const bracketMatches = raw.match(/\[[^\]]+\]|⟨[^⟩]+⟩/gu);
  alternateNotationBracketTokens = bracketMatches ? bracketMatches.length : 0;

  for (const cluster of scalarClusters) {
    const depth = cluster.marks.length;
    if (cluster.orphanedLeadingMark) {
      marksOnWhitespaceCount += depth;
      continue;
    }
    baseClusterCount += 1;
    depthDistribution[depth] = (depthDistribution[depth] || 0) + 1;

    if (depth > 0) {
      decoratedBaseCount += 1;
      sumDecoratedDepth += depth;
      nonZeroUniqueDepths.add(depth);
      if (depth >= 2) multiMarkBaseCount += 1;
      if (depth > maxMarkDepth) maxMarkDepth = depth;

      let hasAbove = false;
      let hasBelow = false;
      for (const mark of cluster.marks) {
        const cp = mark.codePointAt(0);
        uniqueCodepoints.add(`U+${cp.toString(16).toUpperCase().padStart(4, '0')}`);
        combiningMarkCount += 1;
        const placement = classifyMarkPlacement(cp);
        if (placement === 'overlay') overlayU0334ToU0338Count += 1;
        else if (placement === 'above') { aboveCount += 1; hasAbove = true; }
        else if (placement === 'below') { belowCount += 1; hasBelow = true; }
        else otherMarkCount += 1;
      }
      if (hasAbove && hasBelow) bidirectionalAboveBelowCount += 1;
    }
  }

  const meanMarkDepth = baseClusterCount > 0 ? Number((combiningMarkCount / baseClusterCount).toFixed(4)) : 0;
  const meanDecoratedDepth = decoratedBaseCount > 0 ? sumDecoratedDepth / decoratedBaseCount : 0;
  let varianceSum = 0;
  if (decoratedBaseCount > 0) {
    for (const [dKey, count] of Object.entries(depthDistribution)) {
      const d = Number(dKey);
      if (d > 0) varianceSum += count * ((d - meanDecoratedDepth) ** 2);
    }
  }
  const depthStdDev = decoratedBaseCount > 0 ? Number(Math.sqrt(varianceSum / decoratedBaseCount).toFixed(4)) : 0;
  const multiMarkBaseShare = baseClusterCount > 0 ? Number((multiMarkBaseCount / baseClusterCount).toFixed(6)) : 0;
  const decoratedBaseShare = baseClusterCount > 0 ? Number((decoratedBaseCount / baseClusterCount).toFixed(6)) : 0;

  const uniformConstantDepthStencil = decoratedBaseCount >= 3 && nonZeroUniqueDepths.size === 1;
  const depthOneLimited = decoratedBaseCount > 0 && maxMarkDepth === 1 && multiMarkBaseCount === 0;
  const singleCodepointStencil = decoratedBaseCount >= 3 && uniqueCodepoints.size === 1;
  const stencilReasons = [];
  if (depthOneLimited) stencilReasons.push('MAX_MARK_DEPTH_1_NO_MULTISTACK');
  if (uniformConstantDepthStencil) stencilReasons.push('UNIFORM_CONSTANT_NONZERO_DEPTH');
  if (singleCodepointStencil) stencilReasons.push('SINGLE_COMBINING_CODEPOINT_REPEATED');
  const isStencil = stencilReasons.length > 0;

  const genuineMultistackObserved = (
    multiMarkBaseCount >= 1
    && maxMarkDepth >= 2
    && uniqueCodepoints.size >= 2
    && !isStencil
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
    maxMarkDepth,
    meanMarkDepth,
    depthStdDev,
    marksPerBaseDistribution: Object.freeze(depthDistribution),
    uniqueNonZeroDepthCount: nonZeroUniqueDepths.size,
    aboveCount,
    belowCount,
    overlayU0334ToU0338Count,
    otherMarkCount,
    bidirectionalAboveBelowCount,
    marksOnWhitespaceCount,
    alternateNotationBracketTokens,
    repertoireDiversity: Object.freeze({
      uniqueCombiningCodepoints: Object.freeze([...uniqueCodepoints].sort()),
      uniqueCombiningCodepointCount: uniqueCodepoints.size
    }),
    stencilRisk: Object.freeze({
      isStencil,
      depthOneLimited,
      uniformConstantDepthStencil,
      singleCodepointStencil,
      reasons: Object.freeze(stencilReasons)
    }),
    genuineMultistackObserved
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
  DELIBERATE_MULTISTACK_REF: Object.freeze({
    label: 'genuine-heterogeneous-multistack',
    sample:
      'T\u0301\u0323\u0335h\u0302\u0327\u0304e\u0308 ' +
      'w\u030C\u0329i\u0301\u0316\u0338n\u030A\u0325t\u0300\u0323\u030B\u032De\u0304\u032Er ' +
      'l\u0303\u0317\u0336e\u0307\u0329d\u0302\u0323\u030Cg\u0304e\u0301\u0331r ' +
      'b\u0308\u0325\u0335u\u0301\u032Er\u0300\u0327n\u030A\u0323\u0304s.'
  }),
  ALTERNATE_NOTATION_GRAMMAR_REF: Object.freeze({
    label: 'visible-bracket-notation-without-combining-stack',
    sample: '[CROWN:2]The [ROOT:3]winter [OVERLAY:tilde]ledger stood before the gate.'
  })
});
