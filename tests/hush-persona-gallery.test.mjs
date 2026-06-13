import assert from 'assert';
import { listHushMasks } from '../app/engine/hush-mask-studio.js';
import { buildHushPersonaGallery, summarizeHushPersonaGallery } from '../app/hush-persona-gallery.js';

const gallery = buildHushPersonaGallery(listHushMasks({ includeRetiredMasks: true }));
assert.equal(gallery.version, 'phase-31');
assert(gallery.maskCount >= 18, `expected maintained Hush persona gallery, found ${gallery.maskCount}`);
assert.equal(gallery.ready, true);
assert(gallery.cards.every((card) => card.label));
assert(gallery.cards.every((card) => card.story));
assert(gallery.cards.every((card) => card.riskTell));
assert(gallery.cards.some((card) => card.cardClass === 'target-register-card'));

const summary = summarizeHushPersonaGallery(gallery);
assert.equal(summary.cardsBuilt, gallery.maskCount);
assert.equal(summary.storiesVisible, true);
assert.equal(summary.riskTellsVisible, true);
console.log('hush-persona-gallery tests passed');
