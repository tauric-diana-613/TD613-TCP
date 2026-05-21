import assert from 'assert';
import { createCustomMask, addCustomMaskSample } from '../app/engine/hush-custom-mask.js';
import { getHushMask } from '../app/engine/hush-mask-studio.js';
import { buildPhase25HushSwap } from '../app/engine/hush-phase25-swap.js';
import { assessHardMaskReadiness } from '../app/engine/hush-hard-mask-proof.js';
import { phase25AuthorshipSpectrum, phase25HardMaskSamples, phase25CoherentInputs, phase25JaggedInputs } from './fixtures/hush-phase25-authorship-spectrum.mjs';

const avg = (values) => {
  const nums = values.filter((value) => Number.isFinite(value));
  return nums.length ? Number((nums.reduce((sum, value) => sum + value, 0) / nums.length).toFixed(4)) : 0;
};

const ids = (text = '') => ['DOC-31', 'DOC-77', '04/21', 'INV-440', '2:18', 'ROSTER-8', '05/20', 'FILE-72', 'FORM-19', '17:06'].filter((item) => text.includes(item));
const caseDrift = (text = '') => /\biNV-440\b|\brOSTER-8\b|\bfILE-72\b|\bdOC-31\b|\bdOC-77\b/.test(text);

function selected(result = {}) {
  return (result.candidates || []).find((candidate) => candidate.id === result.selectedCandidateId) || result.candidates?.[0] || {};
}

function runFlight(name, mask, input, direction, extra = {}) {
  const result = buildPhase25HushSwap({
    sourceText: input,
    mask,
    maskProfile: mask.profile,
    maskReferenceText: mask.sampleSeed || '',
    contextType: 'group-chat',
    direction,
    options: { candidateCount: 30 },
    ...extra
  });
  const candidate = selected(result);
  const output = result.selectedOutput || result.reviewOutput || '';
  const required = ids(input);
  return {
    name,
    maskId: mask.id || mask.label || 'custom-mask',
    direction: result.direction?.direction || direction,
    input,
    output,
    emitted: Boolean(output.trim()),
    selectedCandidateId: result.selectedCandidateId,
    selectedSource: candidate.source || '',
    phase25Score: candidate.phase25Score ?? result.phase25?.score ?? null,
    phase24Score: candidate.phase24Score ?? null,
    coherence: candidate.witnessCoherence?.score ?? result.witnessCoherence?.score ?? null,
    garbleScore: candidate.garble?.garbleScore ?? result.garble?.garbleScore ?? null,
    garbled: Boolean((candidate.garble?.hardFailures || result.garble?.hardFailures || []).length),
    eventScore: candidate.eventShape?.score ?? result.eventShape?.score ?? null,
    eventFailed: Boolean((candidate.eventShape?.hardFailures || result.eventShape?.hardFailures || []).length),
    flatFailed: Boolean((candidate.flattening?.hardFailures || result.flattening?.hardFailures || []).length),
    caseFailed: Boolean(candidate.caseStability?.failed || result.caseStability?.failed),
    caseDrift: caseDrift(output),
    missing: required.filter((item) => output && !output.includes(item)),
    phase25Ready: Boolean(result.phase25?.ready)
  };
}

function summarize(rows = []) {
  return {
    attempts: rows.length,
    emitted: rows.filter((row) => row.emitted).length,
    missingRows: rows.filter((row) => row.missing.length).length,
    caseDriftRows: rows.filter((row) => row.caseDrift).length,
    caseFailedRows: rows.filter((row) => row.caseFailed).length,
    flattenedRows: rows.filter((row) => row.flatFailed).length,
    garbledRows: rows.filter((row) => row.garbled).length,
    eventShapeFailureRows: rows.filter((row) => row.eventFailed).length,
    readyRows: rows.filter((row) => row.phase25Ready).length,
    avgPhase25Score: avg(rows.map((row) => row.phase25Score)),
    avgCoherence: avg(rows.map((row) => row.coherence)),
    avgGarbleScore: avg(rows.map((row) => row.garbleScore)),
    avgEventShapeRetention: avg(rows.map((row) => row.eventScore)),
    rows
  };
}

function ready(sum, options = {}) {
  const minScore = options.minScore ?? 0.78;
  const minCoherence = options.minCoherence ?? 0.72;
  const minEvent = options.minEvent ?? 0.75;
  return sum.emitted === sum.attempts
    && sum.missingRows === 0
    && sum.caseDriftRows === 0
    && sum.caseFailedRows === 0
    && sum.flattenedRows === 0
    && sum.garbledRows === 0
    && sum.eventShapeFailureRows === 0
    && sum.avgPhase25Score >= minScore
    && sum.avgCoherence >= minCoherence
    && sum.avgEventShapeRetention >= minEvent;
}

const jagged = getHushMask('phase22-jagged-record');
const clear = getHushMask('phase24-clear-record');
assert(jagged, 'phase22-jagged-record mask missing');
assert(clear, 'phase24-clear-record mask missing');

let hardMask = createCustomMask({ label: 'Phase 25 Hard Authorship Mask' });
for (const sample of phase25HardMaskSamples) hardMask = addCustomMaskSample(hardMask, sample, { includePrivateText: true });

const hardMaskReadiness = assessHardMaskReadiness(hardMask, { minSamples: 16, minWords: 700, minPunctuation: 0.07, minRecurrence: 0.12 });

const coherentToJaggedRows = phase25CoherentInputs.map((input, index) => runFlight(`coherent-to-jagged-${index + 1}`, jagged, input, 'coherent-to-jagged'));
const jaggedToCoherentRows = phase25JaggedInputs.map((input, index) => runFlight(`jagged-to-coherent-${index + 1}`, clear, input, 'jagged-to-coherent'));
const hardInputs = [...phase25CoherentInputs, ...phase25JaggedInputs];
const hardCustomizerRows = hardInputs.map((input, index) => runFlight(`hard-customizer-${index + 1}`, hardMask, input, 'mask-to-mask', { assessHardMask: true, hardMaskOptions: { minSamples: 16, minWords: 700, minPunctuation: 0.07, minRecurrence: 0.12 } }));

const coherentToJagged = summarize(coherentToJaggedRows);
const jaggedToCoherent = summarize(jaggedToCoherentRows);
const hardCustomizer = summarize(hardCustomizerRows);

const readiness = {
  coherentToJagged: ready(coherentToJagged, { minScore: 0.78, minCoherence: 0.70, minEvent: 0.75 }),
  jaggedToCoherent: ready(jaggedToCoherent, { minScore: 0.78, minCoherence: 0.78, minEvent: 0.75 }),
  hardCustomizer: hardMaskReadiness.passed && ready(hardCustomizer, { minScore: 0.76, minCoherence: 0.70, minEvent: 0.75 })
};
readiness.overall = readiness.coherentToJagged && readiness.jaggedToCoherent && readiness.hardCustomizer;

const report = {
  version: 'phase-25-whistleblower-readiness-report',
  authorshipSpectrum: {
    profiles: phase25AuthorshipSpectrum.length,
    samples: phase25HardMaskSamples.length,
    wordCount: hardMask.profileSummary?.wordCount,
    profileStatus: hardMask.profileStatus,
    punctuationDensity: hardMask.profileSummary?.punctuationDensity,
    recurrencePressure: hardMask.profileSummary?.recurrencePressure
  },
  hardMaskReadiness,
  coherentToJagged,
  jaggedToCoherent,
  hardCustomizer,
  readiness
};

console.log('HUSH_PHASE25_WHISTLEBLOWER_READINESS_REPORT ' + JSON.stringify(report));
assert(coherentToJagged.emitted > 0);
assert(jaggedToCoherent.emitted > 0);
assert(hardCustomizer.emitted > 0);
console.log('hush-phase25-whistleblower-readiness-report tests passed');
