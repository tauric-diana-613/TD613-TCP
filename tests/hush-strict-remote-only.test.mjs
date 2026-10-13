import assert from 'assert';
import { buildHushSwap } from '../app/engine/hush-swap-patch38.js';

const sourceText = 'Can this stay framed as a question?';
const mask = { id: 'plain-witness', label: 'Steady Mabel', family: 'low heat record', sampleSeed: 'I saw the notice on Monday. I saved the file.' };

const noRemote = buildHushSwap({
  sourceText,
  mask,
  generatorMode: 'remote-llm-proxy',
  providerReports: [],
  options: { strictRemoteOnly: true, candidateCount: 4, includePrivateText: false }
});

assert.equal(noRemote.selectedOutput, '');
assert.equal(noRemote.patch38Diagnostics.strictRemoteOnly, true);
assert.equal(noRemote.patch38Diagnostics.fallbackReleased, false);
assert.equal(noRemote.patch38Diagnostics.maskSurfaceCandidateCount, 0);
assert.equal(noRemote.patch38Diagnostics.warning, 'strict-remote-only-no-approved-remote-candidate');

const withRemote = buildHushSwap({
  sourceText,
  mask,
  generatorMode: 'remote-llm-proxy',
  providerReports: [{ provider: 'test-provider', model: 'test-model', candidates: [{ id: 'remote-llm-candidate-test', source: 'remote-llm-candidate', text: 'Could the question stay open in this version?', style_operation: 'question_preservation', preserved_propositions: ['p1'], dropped_propositions: [], changed_questions: [], new_claims: [], mask_surface_notes: { rhythm: 'plain', diction: 'clean', structure: 'question kept' } }] }],
  options: { strictRemoteOnly: true, candidateCount: 4, includePrivateText: false }
});

assert(withRemote.selectedOutput.includes('?'));
assert.equal(withRemote.patch38Diagnostics.selectedRemoteCandidate, true);
assert.equal(withRemote.patch38Diagnostics.selectedMaskSurfaceFlight, false);
console.log('hush-strict-remote-only.test.mjs passed');
