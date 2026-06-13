import assert from 'assert';
import hushMasks from '../app/data/hush-masks.js';
import phase22HushMasks from '../app/data/hush-phase22-masks.js';
import phase24HushMasks from '../app/data/hush-phase24-masks.js';
import phase27HushMasks from '../app/data/hush-phase27-masks.js';
import phase28HushMasks from '../app/data/hush-phase28-masks.js';

const allMasks = [...hushMasks, ...phase22HushMasks, ...phase24HushMasks, ...phase27HushMasks, ...phase28HushMasks];
assert(allMasks.length >= 20, `expected maintained Hush mask registry, found ${allMasks.length}`);
const personaLabel = (label = '') => /^\p{Lu}[\p{L}'-]+(?:\s+(?:of|the|\p{Lu}[\p{L}'-]+))+$/u.test(label);

for (const mask of allMasks) {
  assert(mask.id, 'mask missing id');
  assert(mask.label, `${mask.id} missing label`);
  assert(!/^Phase\s+\d+/i.test(mask.label), `${mask.id} still has repo-phase label`);
  assert(personaLabel(mask.label), `${mask.id} label should be a human persona name`);
  assert(mask.family, `${mask.id} missing family`);
  assert(mask.description, `${mask.id} missing description`);
  const words = mask.description.split(/\s+/).filter(Boolean).length;
  assert(words >= 16, `${mask.id} description too thin`);
  assert(words <= 60, `${mask.id} description too long for card frame`);
  assert(mask.intendedUse, `${mask.id} missing intendedUse`);
  assert(mask.riskTell, `${mask.id} missing riskTell`);
  assert(mask.transformHints, `${mask.id} missing transformHints`);
  assert(Array.isArray(mask.pressureWarnings), `${mask.id} missing pressureWarnings`);
}

console.log('hush-phase30-1-mask-personas tests passed');
