import assert from 'assert';
import { getHushMask } from '../app/engine/hush-mask-studio.js';
import { buildHushSwap } from '../app/engine/hush-swap.js';

function literalsFrom(text = '') {
  return text.match(/\b(?:ROSTER|INV|DOC|CASE|REF|ID|EXHIBIT|TICKET|REQ|FORM|FILE)[A-Z0-9:_#\/-]*\b|\b\d{1,4}[/-]\d{1,2}(?:[/-]\d{1,4})?\b|\b\d{1,2}:\d{2}\b/g) || [];
}

function mean(values = []) {
  const nums = values.filter((value) => Number.isFinite(value));
  return nums.length ? Number((nums.reduce((sum, value) => sum + value, 0) / nums.length).toFixed(4)) : 0;
}

function increment(map, key) {
  if (!key) return;
  map[key] = (map[key] || 0) + 1;
}

const mask = getHushMask('phase22-jagged-record');
assert(mask, 'Phase 22 jagged record mask should be registered');
assert.equal(mask.id, 'phase22-jagged-record');
assert(['usable', 'strong'].includes(mask.profileStatus), `unexpected Phase 22 mask profile status: ${mask.profileStatus}`);
assert(mask.profileSummary?.wordCount >= 70, 'Phase 22 jagged mask should carry a non-trivial seed');
assert((mask.profileSummary?.punctuationDensity ?? 0) >= 0.04, 'Phase 22 jagged mask should retain punctuation pressure');

const flights = [
  'supervisor changed the roster after 4:30 / maybe legit maybe not. keep ROSTER-8 and 05/20 together, but make it read less formal and more like a rushed work note.',
  'vendor called twice after lunch and I logged INV-440 at 2:18. Jordan was told not to resend spreadsheet until finance knew which version they kept.',
  'DOC-31 still had missing-call note when i opened it — not accusation, sequence. make it careful but not polished.',
  'screenshot from 05/20 still shows REF-88 in shared drive before folder name changed. timing clear, tone careful.',
  'FORM-19 came back with initials, scan says 17:06, queue was marked closed by 5. might be batch upload. keep FORM-19 and 17:06 together.',
  'TICKET-441-B was open when i left, closed when i came back, and nobody named who touched it. normal explanation maybe, but gap belongs in log.',
  'client copy and archive copy are not twins: FILE-72 exported same timestamp but one has policy footer and one does not. preserve mismatch without adding motive.'
];

const rows = flights.map((message, index) => {
  const result = buildHushSwap({
    sourceText: message,
    mask,
    maskProfile: mask.profile,
    maskReferenceText: mask.sampleSeed,
    contextType: 'group-chat',
    operatorMode: 'neutralize',
    options: { candidateCount: 30 }
  });
  const output = result.selectedOutput || '';
  const literals = literalsFrom(message);
  const missingLiterals = literals.filter((literal) => !output.includes(literal));
  const emitted = output.trim().length > 0;
  const selected = result.candidates.find((candidate) => candidate.id === result.selectedCandidateId) || result.candidates[0] || {};
  const fallbackCandidatePresent = result.candidates.some((candidate) => candidate.source === 'literal-safe-fallback');
  if (emitted) {
    assert.notEqual(output.trim(), message.trim(), `Phase 22 jagged mask emitted unchanged output for flight ${index + 1}`);
    assert.equal(missingLiterals.length, 0, `Phase 22 jagged mask emitted output missing literals for flight ${index + 1}: ${missingLiterals.join(', ')}`);
    assert.equal(result.releasePolicy?.hardBlocked, false, `Phase 22 jagged mask emitted while hard-blocked for flight ${index + 1}`);
  }
  return {
    index: index + 1,
    emitted,
    hardBlocked: Boolean(result.releasePolicy?.hardBlocked),
    status: result.releasePolicy?.releaseStatus,
    hardBlockReasons: result.releasePolicy?.hardBlockReasons || [],
    selectedCandidateId: result.selectedCandidateId,
    selectedSource: selected.source || '',
    fallbackCandidatePresent,
    finalScore: selected.finalScore ?? null,
    semanticFidelity: selected.scoreBreakdown?.semanticFidelity ?? null,
    syntaxShiftScore: selected.syntaxShift?.metrics?.syntaxShiftScore ?? null,
    sourceBodyRisk: selected.sourceResidue?.metrics?.cadenceBodyRisk ?? null,
    literalCount: literals.length,
    missingLiteralCount: missingLiterals.length,
    outputPreview: output.slice(0, 180)
  };
});

const statusCounts = {};
const hardBlockCounts = {};
for (const row of rows) {
  increment(statusCounts, row.status);
  for (const reason of row.hardBlockReasons) increment(hardBlockCounts, reason);
}

const emitted = rows.filter((row) => row.emitted).length;
const blocked = rows.filter((row) => row.hardBlocked).length;
const summary = {
  mask: {
    id: mask.id,
    label: mask.label,
    wordCount: mask.profileSummary?.wordCount,
    profileStatus: mask.profileStatus,
    avgSentenceLength: mask.profileSummary?.avgSentenceLength,
    punctuationDensity: mask.profileSummary?.punctuationDensity,
    recurrencePressure: mask.profileSummary?.recurrencePressure,
    lexicalEntropy: mask.profileSummary?.lexicalEntropy
  },
  attempts: rows.length,
  emitted,
  blocked,
  statusCounts,
  hardBlockCounts,
  avgFinalScore: mean(rows.map((row) => row.finalScore)),
  avgSemanticFidelity: mean(rows.map((row) => row.semanticFidelity)),
  avgSyntaxShiftScore: mean(rows.map((row) => row.syntaxShiftScore)),
  avgSourceBodyRisk: mean(rows.map((row) => row.sourceBodyRisk)),
  rows
};

assert(emitted > 0, 'Phase 22 jagged mask flight emitted zero outputs');
assert(rows.every((row) => row.fallbackCandidatePresent), 'Phase 22 jagged mask flight failed to generate literal-safe fallback candidates');
assert(rows.every((row) => row.emitted || row.hardBlockReasons.length > 0), 'blank Phase 22 jagged rows must expose hard-block reasons');
console.log('HUSH_PHASE22_JAGGED_MASK_FLIGHT_SUMMARY ' + JSON.stringify(summary));
console.log('hush-phase22-jagged-mask-flight tests passed');
