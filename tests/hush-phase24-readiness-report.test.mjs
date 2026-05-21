import assert from 'assert';
import { createCustomMask, addCustomMaskSample } from '../app/engine/hush-custom-mask.js';
import { getHushMask } from '../app/engine/hush-mask-studio.js';
import { buildPhase24HushSwap } from '../app/engine/hush-phase24-swap.js';

const avg = (values) => {
  const nums = values.filter((value) => Number.isFinite(value));
  return nums.length ? Number((nums.reduce((sum, value) => sum + value, 0) / nums.length).toFixed(4)) : 0;
};

const ids = (text = '') => ['DOC-31', 'DOC-77', '04/21', 'INV-440', '2:18', 'ROSTER-8', '05/20', 'FILE-72', 'FORM-19', '17:06'].filter((item) => text.includes(item));
const hasCaseDrift = (text = '') => /\biNV-440\b|\brOSTER-8\b|\bfILE-72\b|\bdOC-31\b|\bdOC-77\b/.test(text);

function selected(result = {}) {
  return (result.candidates || []).find((candidate) => candidate.id === result.selectedCandidateId) || result.candidates?.[0] || {};
}

function flight(name, mask, input, direction) {
  const result = buildPhase24HushSwap({ sourceText: input, mask, maskProfile: mask.profile, maskReferenceText: mask.sampleSeed || '', contextType: 'group-chat', direction, options: { candidateCount: 30 } });
  const candidate = selected(result);
  const output = result.selectedOutput || result.reviewOutput || '';
  const needed = ids(input);
  return {
    name,
    maskId: mask.id,
    direction: result.direction?.direction || direction,
    input,
    output,
    emitted: Boolean(output.trim()),
    selectedCandidateId: result.selectedCandidateId,
    selectedSource: candidate.source || '',
    phase24Score: candidate.phase24Score ?? result.phase24?.score ?? null,
    baseScore: candidate.finalScore ?? null,
    coherence: candidate.witnessCoherence?.score ?? result.witnessCoherence?.score ?? null,
    caseChanged: Boolean(candidate.caseStability?.changed || result.caseStability?.changed),
    caseFailed: Boolean(candidate.caseStability?.failed || result.caseStability?.failed),
    caseDrift: hasCaseDrift(output),
    flatFailed: Boolean((candidate.flattening?.hardFailures || result.flattening?.hardFailures || []).length),
    flatWarnings: candidate.flattening?.reviewWarnings || result.flattening?.reviewWarnings || [],
    missing: needed.filter((item) => output && !output.includes(item))
  };
}

function summary(rows = []) {
  const attempts = rows.length;
  return {
    attempts,
    emitted: rows.filter((row) => row.emitted).length,
    missingRows: rows.filter((row) => row.missing.length).length,
    caseDriftRows: rows.filter((row) => row.caseDrift).length,
    caseFailedRows: rows.filter((row) => row.caseFailed).length,
    flattenedRows: rows.filter((row) => row.flatFailed).length,
    avgPhase24Score: avg(rows.map((row) => row.phase24Score)),
    avgCoherence: avg(rows.map((row) => row.coherence)),
    rows
  };
}

function ready(sum, minScore = 0.72, minCoherence = 0.70) {
  return sum.emitted === sum.attempts && sum.missingRows === 0 && sum.caseDriftRows === 0 && sum.caseFailedRows === 0 && sum.flattenedRows === 0 && sum.avgPhase24Score >= minScore && sum.avgCoherence >= minCoherence;
}

const jagged = getHushMask('phase22-jagged-record');
const clear = getHushMask('phase24-clear-record');
assert(jagged, 'phase22-jagged-record mask missing');
assert(clear, 'phase24-clear-record mask missing');

const coherentInputs = [
  'FILE-72 exported at the same minute, but one copy has the footer and one copy does not.',
  'INV-440 was logged at 2:18. Jordan should hold the resend until finance confirms the version.',
  'ROSTER-8 changed after 4:30 on 05/20. The timing should remain attached to the roster note.',
  'DOC-31 had the missing-call note when opened. The later version did not.'
];

const jaggedInputs = [
  'not polished: FILE-72 same export minute / one copy footer there, one copy no footer. maybe template maybe nothing. mismatch is the thing.',
  'quick note: INV-440 at 2:18, Jordan hold resend until finance knows version. do not split those apart.',
  'ROSTER-8 after 4:30 on 05/20. maybe normal, maybe not, timing still belongs with the roster.',
  'DOC-31 had missing-call line when opened. later one did not. not accusation, sequence.'
];

let hardMask = createCustomMask({ label: 'Phase 24 Hard Authorship Mask' });
for (const sample of [
  'not polished bc phone note. item was there then later it looked tidy. maybe normal / maybe tired eyes / still writing it down before sequence gets mushy. keep the order, not the mood.',
  'same minute, different footer. old copy had one bottom line, later copy had another. maybe template. maybe batch. not a grand theory, just copy shape and timing.',
  'time, person, hold, version. if the rewrite drops one, the note loses its spine. small anchors are why the record stands upright.',
  'DOC line had one wording, later line softened. those are cousins, not twins. write it flat because nice makes it blurry.',
  'ROSTER note after 4:30, date stays attached. if it is fine, fine. the clean version still needs the timing hook.',
  'FORM-19 with 17:06, queue marked closed by five. could be batch upload, could be nothing. note visible thing, not meaning.',
  'before, later, version, footer, copy. keep those little rails. do not turn the gap into attitude or the mismatch into decoration.',
  'quick-before-i-forget style, rushed but exact. same minute different copy, same row different label, same note different temperature.'
]) hardMask = addCustomMaskSample(hardMask, sample, { includePrivateText: true });

const coherentToJaggedRows = coherentInputs.map((input, index) => flight(`coherent-to-jagged-${index + 1}`, jagged, input, 'coherent-to-jagged'));
const jaggedToCoherentRows = jaggedInputs.map((input, index) => flight(`jagged-to-coherent-${index + 1}`, clear, input, 'jagged-to-coherent'));
const hardCustomizerRows = coherentInputs.concat(jaggedInputs).map((input, index) => flight(`hard-customizer-${index + 1}`, hardMask, input, 'mask-to-mask'));

const coherentToJagged = summary(coherentToJaggedRows);
const jaggedToCoherent = summary(jaggedToCoherentRows);
const hardCustomizer = summary(hardCustomizerRows);
const readiness = {
  coherentToJagged: ready(coherentToJagged),
  jaggedToCoherent: ready(jaggedToCoherent, 0.70, 0.72),
  hardCustomizer: hardMask.profileStatus === 'strong' && hardMask.profileSummary?.wordCount >= 120 && ready(hardCustomizer, 0.70, 0.70)
};
readiness.overall = readiness.coherentToJagged && readiness.jaggedToCoherent && readiness.hardCustomizer;

const report = {
  version: 'phase-24-readiness-report',
  hardCustomizerMask: { sampleCount: hardMask.sampleCount, profileStatus: hardMask.profileStatus, wordCount: hardMask.profileSummary?.wordCount, punctuationDensity: hardMask.profileSummary?.punctuationDensity, recurrencePressure: hardMask.profileSummary?.recurrencePressure },
  coherentToJagged,
  jaggedToCoherent,
  hardCustomizer,
  readiness
};

console.log('HUSH_PHASE24_READINESS_REPORT ' + JSON.stringify(report));
assert(coherentToJagged.emitted > 0);
assert(jaggedToCoherent.emitted > 0);
assert(hardCustomizer.emitted > 0);
console.log('hush-phase24-readiness-report tests passed');
