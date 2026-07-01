import assert from 'node:assert/strict';
import fs from 'fs';
import hushMasks from '../app/data/hush-masks.js';
import {
  HUSH_MASK_WRITER_VERSION,
  generateMaskWriterCandidates,
  styleStrategiesForMask
} from '../app/engine/hush-mask-writer.js';

const html = fs.readFileSync('app/adversarial-bench.html', 'utf8');
const css = fs.readFileSync('app/hush-packet-entrypoint.css', 'utf8');
const runtime = fs.readFileSync('app/hush-current-runtime-coherence.js', 'utf8');

assert.match(html, /id="packetDrawerLink"/);
assert.match(html, /id="packetDrawerFloatingLink"/);
assert.match(html, /href="\.\/hush-packet-dashboard\.html"/);
assert.match(html, /hush-packet-entrypoint\.css\?v=202607010930/);
assert.match(html, /hush-current-runtime-coherence\.js\?v=202607010930/);
assert.match(html, /adversarial-bench-light\.js\?v=202607010930/);
assert.match(css, /position:\s*fixed/);
assert.match(css, /env\(safe-area-inset-bottom\)/);
assert.match(runtime, /current-hush-light\/20260701/);
assert.match(runtime, /current-hush-heavy\/20260701/);

assert.equal(HUSH_MASK_WRITER_VERSION, 'phase-16.1-mask-distinctness');

const sourceText = 'Please keep DOC-17 with the 3:45 timestamp because the later copy changed the label.';
const protectedLiterals = ['DOC-17', '3:45'];
const masksById = new Map(hushMasks.map((mask) => [mask.id, mask]));
const expectedFirstStrategies = new Map([
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
for (const [id, firstStrategy] of expectedFirstStrategies.entries()) {
  const mask = masksById.get(id);
  assert.ok(mask, `missing mask fixture: ${id}`);
  assert.equal(styleStrategiesForMask(mask)[0], firstStrategy, `${id} should start with its own style lane`);
  const bundle = generateMaskWriterCandidates({ sourceText, protectedLiterals, mask, candidateCount: 6 });
  assert.ok(bundle.candidates.length >= 3, `${id} should produce a candidate pool`);
  assert.equal(bundle.candidates[0].strategy, firstStrategy, `${id} first writer candidate should use the mask-specific strategy`);
  assert.ok(bundle.candidates[0].text.includes('DOC-17'), `${id} must preserve DOC-17`);
  assert.ok(bundle.candidates[0].text.includes('3:45'), `${id} must preserve 3:45`);
  firstOutputs.push(bundle.candidates[0].text.replace(/\s+/g, ' ').trim().toLowerCase());
}

assert.equal(new Set(firstOutputs).size, firstOutputs.length, 'first candidate outputs should remain distinct across masks');
assert.ok(firstOutputs.some((text) => text.includes('boring part')));
assert.ok(firstOutputs.some((text) => text.includes('small circle version')));
assert.ok(firstOutputs.some((text) => text.includes('1.')));
assert.ok(firstOutputs.some((text) => text.includes('the record remains legible')));

console.log('hush-mobile-packet-and-mask-diversity: ok');
