import assert from 'assert';
import { createCustomMask, addCustomMaskSample } from '../app/engine/hush-custom-mask.js';
import { getHushMask } from '../app/engine/hush-mask-studio.js';
import { buildHushSwap } from '../app/engine/hush-swap.js';
import { buildPhase23HushSwap } from '../app/engine/hush-phase23-swap.js';

const avg = (values) => {
  const nums = values.filter((value) => Number.isFinite(value));
  return nums.length ? Number((nums.reduce((sum, value) => sum + value, 0) / nums.length).toFixed(4)) : 0;
};

function ids(text = '') {
  return ['DOC-77', '04/21', 'INV-440', '2:18', 'ROSTER-8', '05/20', 'FILE-72'].filter((item) => text.includes(item));
}

function selected(result = {}) {
  return (result.candidates || []).find((candidate) => candidate.id === result.selectedCandidateId) || result.candidates?.[0] || {};
}

function flight(name, mask, input) {
  const phase22 = buildHushSwap({ sourceText: input, mask, maskProfile: mask.profile, maskReferenceText: mask.sampleSeed || '', contextType: 'group-chat', options: { candidateCount: 30 } });
  const phase23 = buildPhase23HushSwap({ sourceText: input, mask, maskProfile: mask.profile, maskReferenceText: mask.sampleSeed || '', contextType: 'group-chat', options: { candidateCount: 30 } });
  const c22 = selected(phase22);
  const c23 = selected(phase23);
  const out22 = phase22.selectedOutput || '';
  const out23 = phase23.selectedOutput || phase23.reviewOutput || '';
  const needed = ids(input);
  return {
    name,
    maskId: mask.id,
    input,
    before: { output: out22, emitted: Boolean(out22.trim()), score: c22.finalScore ?? null, source: c22.source || '', missing: needed.filter((item) => out22 && !out22.includes(item)) },
    after: { output: out23, emitted: Boolean(out23.trim()), score: c23.phase23Score ?? null, baseScore: c23.finalScore ?? null, coherence: c23.witnessCoherence?.score ?? null, polishChanged: Boolean(c23.outputPolish?.changed), polishOps: c23.outputPolish?.operations || [], source: c23.source || '', missing: needed.filter((item) => out23 && !out23.includes(item)) }
  };
}

function summary(rows) {
  return { attempts: rows.length, beforeEmitted: rows.filter((row) => row.before.emitted).length, afterEmitted: rows.filter((row) => row.after.emitted).length, beforeMissingRows: rows.filter((row) => row.before.missing.length).length, afterMissingRows: rows.filter((row) => row.after.missing.length).length, polishChangedRows: rows.filter((row) => row.after.polishChanged).length, avgBeforeScore: avg(rows.map((row) => row.before.score)), avgAfterScore: avg(rows.map((row) => row.after.score)), avgAfterCoherence: avg(rows.map((row) => row.after.coherence)) };
}

const inputs = [
  'Keep DOC-77 with 04/21. The file was visible before noon, and the date is the anchor.',
  'INV-440 was logged at 2:18. Keep the version context with the invoice note.',
  'ROSTER-8 changed after 4:30 on 05/20. Keep the timing attached.',
  'FILE-72 exported at the same minute, but one copy has the footer and one copy does not.'
];

let custom = createCustomMask({ label: 'Phase 23 Flight Mask' });
for (const sample of [
  'not polished. item was there, then later the cover looked too tidy. maybe normal / maybe tired eyes / still writing it down.',
  'keep the order, not the mood. old line had one wording. new line had softer wording. tiny but not nothing.',
  'time, person, hold, version. if the rewrite drops one of those, the note loses its spine.',
  'quick note from phone: same export minute, different footer. could be template, could be batch, could be nothing.'
]) custom = addCustomMaskSample(custom, sample, { includePrivateText: true });

const jagged = getHushMask('phase22-jagged-record');
const plain = getHushMask('plain-witness');
const soft = getHushMask('group-chat-soft');
assert(custom && jagged && plain && soft);

const customizerRows = inputs.map((input, index) => flight(`customizer-${index + 1}`, custom, input));
const maskRows = [plain, soft, jagged].flatMap((mask) => inputs.map((input, index) => flight(`${mask.id}-${index + 1}`, mask, input)));
const jaggedRows = inputs.map((input, index) => flight(`jagged-${index + 1}`, jagged, input));

const report = { version: 'phase-23-flight-report', customizer: { mask: { sampleCount: custom.sampleCount, profileStatus: custom.profileStatus, wordCount: custom.profileSummary?.wordCount }, summary: summary(customizerRows), rows: customizerRows }, masks: { summary: summary(maskRows), rows: maskRows }, jaggedMask: { mask: { id: jagged.id, profileStatus: jagged.profileStatus, wordCount: jagged.profileSummary?.wordCount }, summary: summary(jaggedRows), rows: jaggedRows } };

console.log('HUSH_PHASE23_FLIGHT_REPORT ' + JSON.stringify(report));
assert(report.customizer.summary.afterEmitted > 0);
assert(report.masks.summary.afterEmitted > 0);
assert(report.jaggedMask.summary.afterEmitted > 0);
console.log('hush-phase23-flight-report tests passed');
