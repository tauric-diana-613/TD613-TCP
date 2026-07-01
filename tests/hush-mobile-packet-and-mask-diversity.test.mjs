import assert from 'node:assert/strict';
import hushMasks from '../app/data/hush-masks.js';
import { HUSH_MASK_WRITER_VERSION, generateMaskWriterCandidates, styleStrategiesForMask } from '../app/engine/hush-mask-writer.js';

assert.equal(HUSH_MASK_WRITER_VERSION, 'phase-16.2-living-key-detox');

const sourceText = 'Please keep DOC-17 with the 3:45 timestamp because the later copy changed the label.';
const protectedLiterals = ['DOC-17', '3:45'];
const masksById = new Map(hushMasks.map((mask) => [mask.id, mask]));
const lanes = new Map([
  ['burner-minimal', 'low-signature'],
  ['group-chat-soft', 'small-circle'],
  ['forum-regular', 'forum-slowdown'],
  ['phase28-transform-to-chatspeak', 'chat-shorthand'],
  ['clipboard', 'indexed'],
  ['library-ghost', 'archive-ghost'],
  ['grandma-receipts', 'receipt-warm'],
  ['soft-snark', 'snark-pin']
]);

const firstOutputs = [];
for (const [id, firstStrategy] of lanes.entries()) {
  const mask = masksById.get(id);
  assert.ok(mask, `missing mask fixture: ${id}`);
  assert.equal(styleStrategiesForMask(mask)[0], firstStrategy);
  const bundle = generateMaskWriterCandidates({ sourceText, protectedLiterals, mask, candidateCount: 6 });
  assert.ok(bundle.candidates.length >= 3);
  assert.equal(bundle.candidates[0].strategy, firstStrategy);
  assert.ok(bundle.candidates[0].text.includes('DOC-17'));
  assert.ok(bundle.candidates[0].text.includes('3:45'));
  assert.equal(bundle.candidates[0].catchphraseQuarantine?.passed, true);
  firstOutputs.push(bundle.candidates[0].text.replace(/\s+/g, ' ').trim().toLowerCase());
}

assert.ok(new Set(firstOutputs).size >= 4);
console.log('hush-mobile-packet-and-mask-diversity: ok');
