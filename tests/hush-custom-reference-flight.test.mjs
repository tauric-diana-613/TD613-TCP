import assert from 'assert';
import { extractCadenceProfile } from '../app/engine/stylometry.js';
import { buildMaskDistribution } from '../app/engine/hush-mask-studio.js';
import { buildHushSwap } from '../app/engine/hush-swap.js';

const sourceText = 'Please keep DOC-204 with the intake note from 2026-05-20. I did not edit the attachment, and I cannot confirm who changed the later copy.';
const protectedLiterals = ['DOC-204', '2026-05-20'];
const customReferenceText = `Quick field note from the hallway: keep the record narrow, keep the receipts together, and do not make it sound bigger than it is. I would rather say the thing plainly, with a little warmth, than turn a small custody note into a courtroom thunderclap. If a date matters, put it near the file. If a caveat matters, leave the caveat breathing. No drama, no fog, no extra theory—just enough signal for the next person to understand what stayed attached and what still needs checking.`;

const maskProfile = extractCadenceProfile(customReferenceText);
const customMask = {
  id: 'custom-hallway-field-note',
  label: 'Custom Hallway Field Note',
  source: 'custom-flight',
  family: 'custom-soft-record',
  description: 'Warm, narrow, practical field-note voice with low drama and clear custody language.',
  intendedUse: 'soft custody update / group thread / intake clarification',
  riskTell: 'Can sound too careful if the caveats stack up.',
  sampleSeed: customReferenceText,
  profile: maskProfile,
  distribution: buildMaskDistribution(maskProfile, { sampleCount: 1 }),
  writingTraits: {
    diction: 'plain-warm',
    clauseShape: 'short-to-medium',
    punctuationStyle: 'light-em-dash',
    posture: 'narrow-custody-note'
  },
  transitionBank: ['quick field note', 'just enough signal', 'keeping this narrow'],
  dictionHints: ['plainly', 'attached', 'checking', 'narrow', 'record'],
  avoidList: ['courtroom thunderclap', 'extra theory']
};

const result = buildHushSwap({
  sourceText,
  mask: customMask,
  maskProfile,
  maskReferenceText: customReferenceText,
  protectedLiterals,
  contextType: 'group-chat',
  operatorMode: 'neutralize',
  options: { candidateCount: 30 }
});

const selected = result.candidates.find((candidate) => candidate.id === result.selectedCandidateId) || result.candidates[0] || {};
const summary = {
  version: result.version,
  releaseStatus: result.releasePolicy?.releaseStatus,
  mayPopulateOutput: result.releasePolicy?.mayPopulateOutput,
  selectedCandidateId: result.selectedCandidateId,
  finalScore: selected.finalScore,
  syntaxShiftScore: selected.syntaxShift?.metrics?.syntaxShiftScore,
  sourceBodyRisk: selected.sourceResidue?.metrics?.cadenceBodyRisk,
  longestCopiedRun: selected.sourceResidue?.metrics?.longestCopiedRun,
  nonLiteralTokenRetention: selected.sourceResidue?.metrics?.nonLiteralTokenRetention,
  maskMatch: selected.match?.matchScore,
  claimIntegrity: selected.claimIntegrity?.passed,
  protectedLiteralScore: selected.lockboxVerification?.preservationScore,
  output: result.selectedOutput,
  hardBlockReasons: result.releasePolicy?.hardBlockReasons || [],
  reviewWarnings: result.releasePolicy?.reviewWarnings || []
};

console.log('HUSH_CUSTOM_REFERENCE_FLIGHT ' + JSON.stringify(summary, null, 2));

assert.equal(result.version, 'phase-19');
assert(result.releasePolicy, 'custom flight should return a release policy');
assert.equal(result.releasePolicy.hardBlocked, false, `custom flight hard-blocked: ${(result.releasePolicy.hardBlockReasons || []).join(', ')}`);
assert(result.selectedOutput.trim().length > 0, 'custom flight should populate output');
assert.notEqual(result.selectedOutput.trim(), sourceText.trim(), 'custom flight should not emit unchanged source text');
for (const literal of protectedLiterals) assert(result.selectedOutput.includes(literal), `custom flight missing ${literal}`);
assert.equal(selected.claimIntegrity?.passed, true, 'claim integrity should hold');
assert((selected.syntaxShift?.metrics?.syntaxShiftScore || 0) >= 0.35, 'syntax shift should be useful');
assert(!selected.syntaxShift?.warnings?.includes('wrapper-only-transform'), 'custom flight should not be wrapper-only');
assert((selected.sourceResidue?.metrics?.cadenceBodyRisk ?? 1) < 0.85, 'source body risk should stay below severe band');

console.log('hush-custom-reference-flight tests passed');
