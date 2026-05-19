import assert from 'assert';
import { generateMaskWriterCandidates } from '../app/engine/hush-mask-writer.js';

const sourceText = 'I saved EXHIBIT-42 on 6/13 because the file name changed later. I do not want the date or label separated from the note.';

const dryMask = {
  id: 'dry-bureaucratic-test',
  label: 'Dry Bureaucratic Test',
  family: 'flat compliance',
  writingTraits: {
    sentenceLength: 'medium',
    clauseShape: 'procedural',
    verbosity: 'compressed',
    diction: 'bureaucratic',
    directness: 'balanced',
    hedgeLevel: 'low',
    contractionPosture: 'avoid',
    punctuationStyle: 'minimal',
    paragraphShape: 'memo',
    transitionStyle: 'formal',
    emotionalTemperature: 'low',
    repairPriority: 'facts-first'
  },
  dictionHints: [['file name', 'file label'], ['changed', 'was altered']],
  avoidList: ['lol']
};

const casualMask = {
  id: 'casual-group-chat-test',
  label: 'Casual Group Chat Test',
  family: 'small circle',
  writingTraits: {
    sentenceLength: 'short',
    clauseShape: 'simple',
    verbosity: 'balanced',
    diction: 'casual',
    directness: 'balanced',
    hedgeLevel: 'medium',
    contractionPosture: 'frequent',
    punctuationStyle: 'minimal',
    paragraphShape: 'short-lines',
    transitionStyle: 'conversational',
    emotionalTemperature: 'medium',
    repairPriority: 'balance'
  }
};

const warmMask = {
  id: 'warm-organizer-test',
  label: 'Warm Organizer Test',
  family: 'care logistics',
  writingTraits: { diction: 'warm', emotionalTemperature: 'high', contractionPosture: 'mixed', transitionStyle: 'practical' }
};

const dry = generateMaskWriterCandidates({ sourceText, mask: dryMask, protectedLiterals: ['EXHIBIT-42', '6/13'], candidateCount: 18 });
assert.equal(dry.version, 'phase-16');
assert(dry.candidates.length > 10, 'writer should generate a broad candidate pool');
assert(dry.candidates.every((candidate) => candidate.text.includes('EXHIBIT-42') && candidate.text.includes('6/13')), 'candidates preserve protected literals');
assert(new Set(dry.candidates.map((candidate) => candidate.text)).size > 8, 'candidates are not all identical');
assert(dry.candidates.some((candidate) => candidate.operations.some((op) => op.includes('sentence:'))), 'candidates carry sentence-rhythm operations');
assert(dry.candidates.some((candidate) => candidate.operations.some((op) => op.includes('diction:'))), 'candidates carry diction operations');
assert(dry.candidates.some((candidate) => candidate.operations.some((op) => op.includes('verbosity:'))), 'candidates carry verbosity operations');
assert(dry.candidates.every((candidate) => !/\b(?:I'm|don't|doesn't|can't|won't)\b/i.test(candidate.text)), 'dry bureaucratic mask avoids contractions');

const casual = generateMaskWriterCandidates({ sourceText: 'I am saving the note because I do not want the date lost.', mask: casualMask, protectedLiterals: ['date'], candidateCount: 12 });
assert(casual.candidates.some((candidate) => /\b(?:I'm|don't)\b/i.test(candidate.text)), 'casual mask may use contractions');

const warm = generateMaskWriterCandidates({ sourceText, mask: warmMask, protectedLiterals: ['EXHIBIT-42', '6/13'], candidateCount: 12 });
assert(warm.candidates.some((candidate) => /\b(?:Just to keep this clear|helpful|make sure|Also)\b/i.test(candidate.text)), 'warm organizer adds connective language');

const legal = generateMaskWriterCandidates({ sourceText: 'I did not alter EXHIBIT-42 and I cannot confirm who changed the file on 6/13.', mask: { family: 'facts first', writingTraits: { diction: 'legal', contractionPosture: 'avoid', hedgeLevel: 'high', repairPriority: 'facts-first' } }, protectedLiterals: ['EXHIBIT-42', '6/13'], candidateCount: 12 });
assert(legal.candidates.every((candidate) => /\b(?:not|cannot|can not|did not)\b/i.test(candidate.text)), 'legal measured candidates preserve caveats and negations');

console.log('hush-mask-writer tests passed');
