import assert from 'assert';
import fs from 'fs';
import { JSDOM } from 'jsdom';

function installDom() {
  const html = fs.readFileSync('app/adversarial-bench.html', 'utf8');
  const dom = new JSDOM(html, { url: 'http://localhost/adversarial-bench.html', pretendToBeVisual: true });
  global.window = dom.window;
  global.document = dom.window.document;
  global.HTMLElement = dom.window.HTMLElement;
  global.Event = dom.window.Event;
  Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
  return dom;
}

function setValue(id, text) {
  const el = document.getElementById(id);
  assert(el, `missing ${id}`);
  el.value = text;
  return el;
}

function getValue(id) {
  return document.getElementById(id)?.value || '';
}

function literalsFrom(text = '') {
  return text.match(/\b(?:EXHIBIT|DOC|CASE|ID|REF|TD613|SHI|SAC)[A-Z0-9:_#\[\]\/-]*\b|\b\d{1,4}[/-]\d{1,2}(?:[/-]\d{1,4})?\b/g) || [];
}

function mean(values = []) {
  const nums = values.filter((value) => Number.isFinite(value));
  return nums.length ? Number((nums.reduce((sum, value) => sum + value, 0) / nums.length).toFixed(4)) : 0;
}

function max(values = []) {
  const nums = values.filter((value) => Number.isFinite(value));
  return nums.length ? Number(Math.max(...nums).toFixed(4)) : 0;
}

function min(values = []) {
  const nums = values.filter((value) => Number.isFinite(value));
  return nums.length ? Number(Math.min(...nums).toFixed(4)) : 0;
}

installDom();
const bench = await import(`../app/adversarial-bench.js?matrix=${Date.now()}`);
bench.initAdversarialBench(document);

const cases = [
  'Keep CASE-17 with the note from 6/13. I did not change the attachment.',
  'Please keep DOC-91 in the update. I cannot confirm who changed the file on 2026-05-18.',
  'I did not edit EXHIBIT-42. The 6/13 timestamp matters because the label changed later.',
  'For reference, ID-204 stayed attached after 05/18 and I may need the original label preserved.',
  'The packet marked REF-77 should remain with the 2026-05-19 note, but I am not naming the sender.',
  'I saved DOC-613 before the meeting on 6/13. Please do not separate the date from the message.',
  'This is a small update: EXHIBIT-9 is still visible and I cannot verify the later copy.',
  'I need the note to say CASE-404 stayed in the folder on 05/19 without sounding like my usual writing.',
  'The attached ID-51 record appears to show the label changed after 2026-05-18.',
  'Please keep SAC[X6ZNK5NO51] and TD613 visible, but make the sentence softer for a group chat.',
  'I am keeping this narrow: DOC-12 was saved on 6/13, and I did not alter the contents.',
  'The message should preserve EXHIBIT-88 and the 2026-05-19 date while sounding less like a formal complaint.'
];

const maskIds = bench.benchState.hushMasks.slice(0, 20).map((mask) => mask.id);
assert.equal(cases.length, 12);
assert(maskIds.length >= 20);

const rows = [];
const statusCounts = {};
const warningCounts = {};
const hardBlockCounts = {};
const missingLiteralExamples = [];
const unchangedExamples = [];

for (const message of cases) {
  for (const maskId of maskIds) {
    bench.resetBench();
    const mask = bench.selectHushMask(maskId);
    assert(mask, `mask not found: ${maskId}`);
    setValue('protectedBaselineInput', '');
    setValue('messageDraftInput', message);
    document.getElementById('generateMaskedOutputBtn').click();

    const result = bench.benchState.hushSwapResult;
    const output = getValue('protectedOutputInput');
    assert(result, `no result for ${maskId}`);
    assert.equal(result.version, 'phase-19');

    const selected = result.candidates.find((candidate) => candidate.id === result.selectedCandidateId) || result.candidates[0] || {};
    const status = result.releasePolicy?.releaseStatus || 'missing';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
    for (const warning of result.releasePolicy?.reviewWarnings || []) warningCounts[warning] = (warningCounts[warning] || 0) + 1;
    for (const reason of result.releasePolicy?.hardBlockReasons || []) hardBlockCounts[reason] = (hardBlockCounts[reason] || 0) + 1;

    const literals = literalsFrom(message);
    const keptLiterals = literals.filter((literal) => output.includes(literal)).length;
    const missingLiterals = literals.filter((literal) => !output.includes(literal));
    const emitted = output.trim().length > 0;
    const transformed = emitted && output.trim() !== message.trim();
    const syntaxWarnings = selected.syntaxShift?.warnings || [];
    const cleanroomOps = result.writer?.cleanroom?.operations || [];
    const cleanroomWarnings = result.writer?.cleanroom?.warnings || [];
    const claimFailures = selected.claimIntegrity?.hardFailures || [];
    if (missingLiterals.length && missingLiteralExamples.length < 12) {
      missingLiteralExamples.push({ maskId, missingLiterals, output, message });
    }
    if (emitted && !transformed && unchangedExamples.length < 12) {
      unchangedExamples.push({ maskId, output, message, hardBlockReasons: result.releasePolicy?.hardBlockReasons || [], sourceResidue: selected.sourceResidueSummary || selected.sourceResidue || null });
    }
    rows.push({
      maskId,
      status,
      emitted,
      transformed,
      candidateCount: result.candidates.length,
      selectedCandidateId: result.selectedCandidateId,
      finalScore: selected.finalScore ?? null,
      semanticFidelity: selected.scoreBreakdown?.semanticFidelity ?? null,
      naturalness: selected.naturalness?.naturalnessScore ?? null,
      sourceResidual: selected.escapeVector?.scores?.sourceResidualRisk ?? null,
      sourceResidueScore: selected.sourceResidueScore?.sourceResidueScore ?? selected.scoreBreakdown?.sourceResidueScore ?? null,
      sourceResidueRisk: selected.sourceResidueScore?.sourceResidueRisk ?? selected.scoreBreakdown?.sourceResidueRisk ?? null,
      sourceBodyRisk: selected.sourceResidue?.metrics?.cadenceBodyRisk ?? null,
      longestCopiedRun: selected.sourceResidue?.metrics?.longestCopiedRun ?? null,
      nonLiteralTokenRetention: selected.sourceResidue?.metrics?.nonLiteralTokenRetention ?? null,
      maskMatch: selected.match?.matchScore ?? null,
      syntaxShiftScore: selected.syntaxShift?.metrics?.syntaxShiftScore ?? selected.scoreBreakdown?.syntaxShiftScore ?? null,
      clauseOrderShift: selected.syntaxShift?.metrics?.clauseOrderShift ?? null,
      openingShapeShift: selected.syntaxShift?.metrics?.openingShapeShift ?? null,
      closingShapeShift: selected.syntaxShift?.metrics?.closingShapeShift ?? null,
      punctuationSkeletonShift: selected.syntaxShift?.metrics?.punctuationSkeletonShift ?? null,
      functionFrameShift: selected.syntaxShift?.metrics?.functionFrameShift ?? null,
      literalPlacementShift: selected.syntaxShift?.metrics?.literalPlacementShift ?? null,
      wrapperOnly: syntaxWarnings.includes('wrapper-only-transform'),
      claimIntegrityFailed: selected.claimIntegrity?.passed === false,
      claimIntegrityFailures: claimFailures.length,
      literalPlacementRepairs: cleanroomOps.filter((op) => /literal-placement|literal-tail-stuff-repaired|in-unit-literal-placement/.test(op)).length,
      literalTailStuffed: cleanroomWarnings.includes('literal-tail-stuffed'),
      literalScore: literals.length ? keptLiterals / literals.length : 1,
      literalsRequired: literals.length,
      literalsKept: keptLiterals,
      hardBlocked: Boolean(result.releasePolicy?.hardBlocked),
      reviewWarningCount: result.releasePolicy?.reviewWarnings?.length || 0
    });
  }
}

const emitted = rows.filter((row) => row.emitted).length;
const transformed = rows.filter((row) => row.transformed).length;
const unchangedEmits = rows.filter((row) => row.emitted && !row.transformed).length;
const hardBlocked = rows.filter((row) => row.hardBlocked).length;
const literalPerfect = rows.filter((row) => row.literalScore === 1).length;
const belowSemantic82 = rows.filter((row) => Number.isFinite(row.semanticFidelity) && row.semanticFidelity < 0.82).length;
const belowNatural34 = rows.filter((row) => Number.isFinite(row.naturalness) && row.naturalness < 0.34).length;
const highResidual = rows.filter((row) => Number.isFinite(row.sourceResidual) && row.sourceResidual > 0.65).length;
const severeSourceBody = rows.filter((row) => Number.isFinite(row.sourceBodyRisk) && row.sourceBodyRisk > 0.82).length;
const wrapperOnlyTransforms = rows.filter((row) => row.emitted && row.wrapperOnly).length;
const claimIntegrityFailures = rows.filter((row) => row.emitted && row.claimIntegrityFailed).length;
const literalPlacementRepairs = rows.reduce((sum, row) => sum + row.literalPlacementRepairs, 0);
const literalTailStuffed = rows.filter((row) => row.literalTailStuffed).length;
const summary = {
  attempts: rows.length,
  caseCount: cases.length,
  maskCount: maskIds.length,
  emitted,
  transformed,
  unchangedEmits,
  blankOutputs: rows.length - emitted,
  hardBlocked,
  statusCounts,
  hardBlockCounts,
  warningCounts,
  literalPerfect,
  literalPerfectRate: Number((literalPerfect / rows.length).toFixed(4)),
  belowSemantic82,
  belowNatural34,
  highResidual,
  severeSourceBody,
  wrapperOnlyTransforms,
  claimIntegrityFailures,
  literalPlacementRepairs,
  literalTailStuffed,
  avgCandidateCount: mean(rows.map((row) => row.candidateCount)),
  avgFinalScore: mean(rows.map((row) => row.finalScore)),
  minFinalScore: min(rows.map((row) => row.finalScore)),
  maxFinalScore: max(rows.map((row) => row.finalScore)),
  avgSemanticFidelity: mean(rows.map((row) => row.semanticFidelity)),
  avgNaturalness: mean(rows.map((row) => row.naturalness)),
  avgSourceResidual: mean(rows.map((row) => row.sourceResidual)),
  avgSourceResidueScore: mean(rows.map((row) => row.sourceResidueScore)),
  avgSourceResidueRisk: mean(rows.map((row) => row.sourceResidueRisk)),
  avgSourceBodyRisk: mean(rows.map((row) => row.sourceBodyRisk)),
  avgLongestCopiedRun: mean(rows.map((row) => row.longestCopiedRun)),
  maxLongestCopiedRun: max(rows.map((row) => row.longestCopiedRun)),
  avgNonLiteralTokenRetention: mean(rows.map((row) => row.nonLiteralTokenRetention)),
  avgMaskMatch: mean(rows.map((row) => row.maskMatch)),
  avgSyntaxShiftScore: mean(rows.map((row) => row.syntaxShiftScore)),
  avgClauseOrderShift: mean(rows.map((row) => row.clauseOrderShift)),
  avgOpeningShapeShift: mean(rows.map((row) => row.openingShapeShift)),
  avgClosingShapeShift: mean(rows.map((row) => row.closingShapeShift)),
  avgPunctuationSkeletonShift: mean(rows.map((row) => row.punctuationSkeletonShift)),
  avgFunctionFrameShift: mean(rows.map((row) => row.functionFrameShift)),
  avgLiteralPlacementShift: mean(rows.map((row) => row.literalPlacementShift)),
  missingLiteralExamples,
  unchangedExamples,
  sampleRows: rows.slice(0, 5)
};

console.log('HUSH_APP_FLIGHT_MATRIX_SUMMARY ' + JSON.stringify(summary));
assert.equal(summary.attempts, 240);
assert(emitted > 0, 'matrix flight emitted zero outputs');
assert(transformed > 0, 'matrix flight transformed zero outputs');
assert.equal(unchangedEmits, 0, 'matrix flight emitted unchanged outputs');
assert.equal(wrapperOnlyTransforms, 0, 'matrix flight emitted wrapper-only transforms');
assert.equal(claimIntegrityFailures, 0, 'matrix flight emitted claim-integrity failures');
assert(summary.avgLongestCopiedRun < 12, 'matrix average copied run should drop below Phase 18 severe band');
console.log('hush-app-flight-matrix tests passed');
