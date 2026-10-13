import assert from 'assert';
import {
  scoreNaturalness,
  detectAwkwardness,
  summarizeNaturalness
} from '../app/engine/hush-naturalness.js';

const repeated = detectAwkwardness({ text: 'The file matters because the file matters and the file matters.' });
assert(repeated.awkwardnessFlags.includes('repeated-phrase'));

const overlong = detectAwkwardness({ text: 'This sentence keeps adding clauses and context and more context and more words and more subordinate phrasing until the entire message becomes too long to review without losing the simple claim that the file was saved on 6/13.' });
assert(overlong.awkwardnessFlags.includes('overlong-sentence'));

const choppy = detectAwkwardness({ text: 'File saved. Date visible. Label same. Keep together. Review later.' });
assert(choppy.awkwardnessFlags.includes('choppy-sentence-pileup'));

const filler = detectAwkwardness({ text: 'We should leverage a robust stakeholder synergy and circle back about the document.' });
assert(filler.awkwardnessFlags.includes('empty-corporate-filler'));

const natural = scoreNaturalness({ text: 'For reference, I saved the file on 6/13 and kept the original label attached to the note.' });
const awkward = scoreNaturalness({ text: 'Regarding regarding the file file file, we should leverage robust synergy; ; ; because because.' });
assert(natural.naturalnessScore > awkward.naturalnessScore);
assert(summarizeNaturalness(natural).status !== 'awkward');
assert(summarizeNaturalness(awkward).awkwardnessFlags.length > 0);

const avoidContractions = scoreNaturalness({
  text: "I'm keeping the file because it doesn't match the later note.",
  realizationPlan: { traits: { contractionPosture: 'avoid' } }
});
const noContractions = scoreNaturalness({
  text: 'I am keeping the file because it does not match the later note.',
  realizationPlan: { traits: { contractionPosture: 'avoid' } }
});
assert(noContractions.naturalnessScore >= avoidContractions.naturalnessScore);

console.log('hush-naturalness tests passed');
