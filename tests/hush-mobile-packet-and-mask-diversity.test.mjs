import assert from 'node:assert/strict';
import hushMasks from '../app/data/hush-masks.js';
import { generateMaskWriterCandidates, styleStrategiesForMask } from '../app/engine/hush-mask-writer.js';

const sourceText = 'Keep DOC-17 with the 3:45 timestamp; the later copy changed the label.';
const protectedLiterals = ['DOC-17', '3:45'];
const masksById = new Map(hushMasks.map((mask) => [mask.id, mask]));
const lanes = new Map([
  ['burner-minimal', 'low-signature'],
  ['group-chat-soft', 'small-circle'],
  ['forum-regular', 'forum-slowdown'],
  ['phase28-transform-to-chatspeak', 'chat-shorthand'],
  ['clipboard', 'indexed'],
  ['library-ghost', 'archive-ghost']
]);

for (const [id, lane] of lanes.entries()) {
  const mask = masksById.get(id);
  assert.ok(mask);
  assert.equal(styleStrategiesForMask(mask)[0], lane);
  const bundle = generateMaskWriterCandidates({ sourceText, protectedLiterals, mask, candidateCount: 6 });
  assert.ok(bundle.candidates.length >= 1);
  assert.equal(bundle.candidates[0].catchphraseQuarantine?.passed, true);
}

console.log('hush-mobile-packet-and-mask-diversity: ok');
