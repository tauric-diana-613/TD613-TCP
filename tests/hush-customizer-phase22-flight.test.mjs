import assert from 'assert';
import { createCustomMask, addCustomMaskSample } from '../app/engine/hush-custom-mask.js';
import { buildHushSwap } from '../app/engine/hush-swap.js';

function literalsFrom(text = '') {
  return text.match(/\b(?:ROSTER|INV|DOC|CASE|REF|ID|EXHIBIT|TD613|SHI|SAC)[A-Z0-9:_#\[\]\/-]*\b|\b\d{1,4}[/-]\d{1,2}(?:[/-]\d{1,4})?\b|\b\d{1,2}:\d{2}\b/g) || [];
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
  'i am keeping this plain because the sequence matters more than tone. the paper copy was on the cart before lunch, then the later packet had a cleaner cover sheet. maybe normal, maybe not. i am writing it down so the record does not depend on memory later.',
  'quick note before i forget: Mara said the intake was handled, then asked whether the family had another last name on the church list. that pause bothered me more than the duplicate flag. i am not making an accusation. i am preserving the order.',
  'the timestamp is the part i want held together. ticket 441-B was open when i left, closed when i came back, and nobody in the room named who touched it. a normal explanation may exist. the gap still belongs in the log.',
  'for the record, i moved the chair, not the box. the box blocked the hall camera, the label was still facing out, and the tape looked intact. that sounds small, but the distinction matters if anyone reviews the hallway later.',
  'not urgent maybe, but please do not turn this into a personality issue. the question is why the Thursday spreadsheet keeps changing after signoff. two weeks in a row is enough to log as a pattern.',
  'i heard Priya say we can clean that later, and i know that can mean a normal cleanup pass. the before version had the missing-call note and the after version did not. i am writing this flat so it stays about sequence.',
  'small thing, maybe big thing: the policy tab was open on Sam’s machine, but the exported pdf did not carry the policy footer. could be a template issue. could be manual. the client copy and archive copy are not twins.',
  'this is rough because i am tired: CASE-209 stayed in the blue folder until lunch. after lunch it was in the gray tray with a newer cover sheet. nobody has to be the villain for that to be a problem.',
  'please keep my name out of the forward chain if this moves upward. i can answer dates, where i was standing, and what i saw on the screen. i do not want the thread to become an HR issue.',
  'one more receipt: the note was not corrected, it was softened. old line said resident denied access. new line says access was unavailable. those are not the same claim wearing different shoes.'
];

let mask = createCustomMask({ label: 'Phase 22 Field Clerk Stress Mask' });
for (const sample of customSamples) mask = addCustomMaskSample(mask, sample, { includePrivateText: true });

assert.equal(mask.sampleCount, 10);
assert.equal(mask.profileStatus, 'strong');
assert(mask.profileSummary?.wordCount >= 500, 'custom mask should carry a strong stress corpus');

const flights = [
  'The supervisor changed the roster after 4:30. Please keep ROSTER-8 and the 05/20 timestamp together, but make the note read less like a formal complaint.',
  'The vendor called twice after lunch. I logged INV-440 at 2:18 and told Jordan not to resend the spreadsheet until we know which version finance kept.',
  'Please say that DOC-31 still had the missing-call note when I opened it. I do not want this to sound like an accusation, just a sequence I can stand behind.',
  'The roster changed after the afternoon call. I need the note to preserve the sequence without sounding like a formal complaint.',
  'The file was in the red tray before lunch. Later it had a clean cover sheet, and I do not know who made that version.',
  'The missing-call line was still present when I opened the note. I want this written as sequence, not accusation.',
  'I am nervous putting this in writing, but the screenshot from 05/20 still shows REF-88 in the shared drive before the folder name changed. Please keep the timing clear and keep the tone non-escalating.',
  'I cannot prove who moved the paper file. What I can say is that CASE-311 was on the intake cart when I signed out, and it was in the supervisor tray when I came back from break.',
  'The sentence changed from “client refused the callback” to “callback could not be completed.” That may sound minor, but those are not the same claim. I need this to read careful, not dramatic.',
  'I might be mixing up the exact order of the meeting, so please keep this narrow: I heard Jonah say the archive copy was already cleaned, and then Priya asked whether the old note was still visible.',
  'Please do not forward this with my name attached. I can answer where I was standing and what I saw on the screen, but I do not want another hallway conversation turning into an HR issue.'
];

const rows = flights.map((message, index) => {
  const result = buildHushSwap({
    sourceText: message,
    mask,
    maskProfile: mask.profile,
    maskReferenceText: customSamples.join('\n\n'),
    contextType: 'group-chat',
    operatorMode: 'neutralize',
    options: { candidateCount: 24 }
  });
  const output = result.selectedOutput || '';
  const literals = literalsFrom(message);
  const missingLiterals = literals.filter((literal) => !output.includes(literal));
  const emitted = output.trim().length > 0;
  const selected = result.candidates.find((candidate) => candidate.id === result.selectedCandidateId) || result.candidates[0] || {};
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
    sampleCount: mask.sampleCount,
    wordCount: mask.profileSummary?.wordCount,
    profileStatus: mask.profileStatus,
    avgSentenceLength: mask.profileSummary?.avgSentenceLength,
    punctuationDensity: mask.profileSummary?.punctuationDensity,
    recurrencePressure: mask.profileSummary?.recurrencePressure
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
assert(rows.some((row) => row.selectedSource === 'literal-safe-fallback'), 'Phase 22 customizer flight never selected the literal-safe fallback');
assert(rows.every((row) => row.emitted || row.hardBlockReasons.length > 0), 'blank Phase 22 customizer rows must expose hard-block reasons');
console.log('HUSH_CUSTOMIZER_PHASE22_FLIGHT_SUMMARY ' + JSON.stringify(summary));
console.log('hush-customizer-phase22-flight tests passed');
