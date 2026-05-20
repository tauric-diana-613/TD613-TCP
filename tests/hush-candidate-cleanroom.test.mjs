import assert from 'assert';
import {
  HUSH_CANDIDATE_CLEANROOM_VERSION,
  cleanHushCandidate,
  cleanHushCandidates,
  summarizeCleanroom
} from '../app/engine/hush-candidate-cleanroom.js';

assert.equal(HUSH_CANDIDATE_CLEANROOM_VERSION, 'phase-19');

const meaningPlan = {
  protectedLiterals: ['DOC-42', '6/13'],
  units: [
    { text: 'I did not move DOC-42 on 6/13.', hasNegation: true },
    { text: 'It may need review.', hasNegation: false }
  ]
};

const cleaned = cleanHushCandidate({
  candidate: { id: 'c1', strategy: 'formal', text: 'For reference, For reference, Item 1: I moved DOC-42 on 6/13. DOC-42 6/13 6/13.' },
  meaningPlan,
  protectedLiterals: ['DOC-42', '6/13'],
  realizationPlan: { traits: { diction: 'plain', clauseShape: 'simple' } }
});

assert(cleaned.cleanroom.changed);
assert.equal(cleaned.cleanroom.version, 'phase-19');
assert(cleaned.text.includes('DOC-42'));
assert(cleaned.text.includes('6/13'));
assert(cleaned.text.toLowerCase().includes('not'));
assert(!cleaned.text.includes('Item 1:'));

const procedural = cleanHushCandidate({
  candidate: { id: 'c2', strategy: 'procedural', text: 'Item 1: Keep DOC-42. Item 2: Keep 6/13.' },
  meaningPlan,
  protectedLiterals: ['DOC-42', '6/13'],
  realizationPlan: { traits: { diction: 'procedural', clauseShape: 'list-driven' } }
});
assert(procedural.text.includes('Item 1:'));
assert.equal(procedural.cleanroom.version, 'phase-19');

const batch = cleanHushCandidates({ candidates: [cleaned, procedural], meaningPlan, protectedLiterals: ['DOC-42', '6/13'] });
assert.equal(batch.version, 'phase-19');
assert.equal(batch.candidates.length, 2);
const summary = summarizeCleanroom(batch);
assert.equal(summary.version, 'phase-19');
assert(summary.changedCount >= 0);

console.log('hush-candidate-cleanroom tests passed');
