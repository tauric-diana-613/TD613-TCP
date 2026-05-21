import assert from 'assert';
import { listHushMasks } from '../app/engine/hush-mask-studio.js';
import { buildHushPersonaGallery, summarizeHushPersonaGallery } from '../app/hush-persona-gallery.js';

const gallery = buildHushPersonaGallery(listHushMasks());
assert.equal(gallery.version, 'phase-31');
assert.equal(gallery.maskCount, 29);
assert.equal(gallery.ready, true);
assert(gallery.cards.every((card) => card.label));
assert(gallery.cards.every((card) => card.story));
assert(gallery.cards.every((card) => card.riskTell));
assert(gallery.cards.some((card) => card.cardClass === 'target-register-card'));

const summary = summarizeHushPersonaGallery(gallery);
assert.equal(summary.cardsBuilt, 29);
assert.equal(summary.storiesVisible, true);
assert.equal(summary.riskTellsVisible, true);
console.log('hush-persona-gallery tests passed');
