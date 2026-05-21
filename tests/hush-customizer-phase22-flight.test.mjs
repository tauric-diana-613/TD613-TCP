import assert from 'assert';
import { createCustomMask, addCustomMaskSample } from '../app/engine/hush-custom-mask.js';
import { buildHushSwap } from '../app/engine/hush-swap.js';

function literalsFrom(text = '') {
  return text.match(/\b(?:ROSTER|INV|DOC|CASE|REF|ID|EXHIBIT|TD613|SHI|SAC|TICKET|REQ|FORM|FILE)[A-Z0-9:_#\[\]\/-]*\b|\b\d{1,4}[/-]\d{1,2}(?:[/-]\d{1,4})?\b|\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}:\d{2}\b/g) || [];
}

function mean(values = []) {
  const nums = values.filter((value) => Number.isFinite(value));
  return nums.length ? Number((nums.reduce((sum, value) => sum + value, 0) / nums.length).toFixed(4)) : 0;
}

function increment(map, key) {
  if (!key) return;
  map[key] = (map[key] || 0) + 1;
}

const customSamples = [
  'not polished bc this is a rushed record note. packet was on the cart at 8:41, blue clip still on it, then later it had the clean cover and the timing looked too tidy. maybe normal / maybe tired eyes / still writing it down before the sequence gets mushy.',
  'quick-before-i-forget: the spreadsheet did not just update, it got prettier. old tab had the missing-call line, new tab had service unavailable, which is not the same sentence in a different coat. keep the order, not the mood.',
  'tiny thing maybe not tiny: same export time, two copies, different footer. client copy has no policy footer. archive copy has the footer. could be a template issue, could be a save issue, but same timestamp plus different bottom line is the part to hold.',
  'rough phone note: CASE-209 stayed in blue folder until lunch. after lunch it was gray tray, new cover sheet, no band. nobody has to be villain for that to matter. the gap is the thing. gap belongs in the log.',
  'i am writing flat because nice makes it blurry. old line said resident denied access. new line says access unavailable. those are cousins, not twins. if this was cleanup, fine, but cleanup should not change claim temperature.',
  'battery low, so short: REF-88 showed in shared drive before folder rename. screenshot has 05/20 in corner. after rename the preview looked softer. not naming intent. pinning timing.',
  'meeting order maybe fuzzy by two minutes, keep caveat. Jonah said archive copy already cleaned; Priya asked if old note still visible. both happened before the later export, which is the only reason i care.',
  'Thursday signoff done, spreadsheet changed, then duplicate correction got said out loud, then everyone moved on too fast. two weeks in a row is not a vibe. dates need to stay tied to rows.',
  'invoice note is the anchor: vendor called twice after lunch, INV-440 logged at 2:18, Jordan told to wait before resend until finance knew version. Jordan + resend + version + 2:18 belong together.',
  'DOC-31 had missing-call note when opened. later doc did not. not a grand theory, just sequence. unsafe part is the gap. do not turn gap into attitude.',
  'ROSTER-8 still had after-4:30 change when clean export was requested. if legit, ok, but clean export should still show timing. 05/20 is not decoration. after 4:30 is not decoration.',
  'FORM-19 came back with initials and scan time 17:06, even though the scanner queue was marked closed by 5. could be batch upload. could be timezone. note says what was visible, not what it means.',
  'another note, same jagged lane: REQ-12 was marked complete, then the attachment count changed from 3 to 2, then the line item got renamed. i am not saying why. i am saying count, name, order. count/name/order is enough for the test.',
  'last sample for pressure: FILE-72 has the same export minute on both copies, but one footer is gone and one footer is there. maybe harmless, yes. still, same minute different footer should not get rewritten into nothing happened.'
];

let mask = createCustomMask({ label: 'Phase 22 Jagged Record Witness Mask' });
for (const sample of customSamples) mask = addCustomMaskSample(mask, sample, { includePrivateText: true });

assert.equal(mask.sampleCount, 14);
assert.equal(mask.profileStatus, 'strong');
assert(mask.profileSummary?.wordCount >= 600, 'jagged custom mask should carry a deep authorship corpus');
assert((mask.profileSummary?.punctuationDensity ?? 0) >= 0.06, 'jagged custom mask should retain punctuation-heavy rushed authorship');
assert((mask.profileSummary?.recurrencePressure ?? 0) >= 0.10, 'jagged custom mask should retain repeated self-correction pressure');

const flights = [
  'supervisor changed the roster after 4:30 / maybe legit maybe not. keep ROSTER-8 and 05/20 together, but make it read less formal and more like a rushed work note.',
  'vendor called twice after lunch and I logged INV-440 at 2:18. Jordan was told not to resend spreadsheet until finance knew which version they kept.',
  'DOC-31 still had missing-call note when i opened it — not accusation, sequence. make it careful but not polished.',
  'file was red tray before lunch, later clean cover sheet showed up, i do not know who made that version. keep narrow.',
  'screenshot from 05/20 still shows REF-88 in shared drive before folder name changed. timing clear, tone careful.',
  'cannot prove who moved paper file. CASE-311 was on intake cart when i signed out and supervisor tray when i came back from break.',
  'sentence changed from “client refused the callback” to “callback could not be completed.” tiny maybe, but not same claim. keep quote exact.',
  'meeting order maybe fuzzy: Jonah said archive copy already cleaned, then Priya asked if old note still visible. keep caveat.',
  'FORM-19 came back with initials, scan says 17:06, scanner queue was marked closed by 5. might be batch upload. keep FORM-19 and 17:06 together.',
  'TICKET-441-B was open when i left, closed when i came back, and nobody named who touched it. normal explanation maybe, but gap belongs in log.',
  'client copy and archive copy are not twins: FILE-72 exported same timestamp but one has policy footer and one does not. preserve mismatch without adding motive.'
];

const rows = flights.map((message, index) => {
  const result = buildHushSwap({
    sourceText: message,
    mask,
    maskProfile: mask.profile,
    maskReferenceText: customSamples.join('\n\n'),
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
    assert.notEqual(output.trim(), message.trim(), `Phase 22 customizer emitted unchanged output for flight ${index + 1}`);
    assert.equal(missingLiterals.length, 0, `Phase 22 customizer emitted output missing literals for flight ${index + 1}: ${missingLiterals.join(', ')}`);
    assert.equal(result.releasePolicy?.hardBlocked, false, `Phase 22 customizer emitted while hard-blocked for flight ${index + 1}`);
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
    label: mask.label,
    sampleCount: mask.sampleCount,
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

assert(emitted > 0, 'Phase 22 customizer flight emitted zero outputs');
assert(rows.every((row) => row.fallbackCandidatePresent), 'Phase 22 customizer flight failed to generate literal-safe fallback candidates');
assert(rows.every((row) => row.emitted || row.hardBlockReasons.length > 0), 'blank Phase 22 customizer rows must expose hard-block reasons');
console.log('HUSH_CUSTOMIZER_PHASE22_FLIGHT_SUMMARY ' + JSON.stringify(summary));
console.log('hush-customizer-phase22-flight tests passed');
