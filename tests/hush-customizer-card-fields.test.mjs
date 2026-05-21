import assert from 'assert';
import { JSDOM } from 'jsdom';
import { ensureCustomizerCardFields, readCustomizerCardFields, applyCustomizerCardFieldsToMask, enhanceSavedCustomMask } from '../app/hush-customizer-card-fields.js';

const dom = new JSDOM('<section><label><input id="hushCustomMaskName" /></label><textarea id="hushCustomMaskSampleInput"></textarea><button id="hushSaveCustomMaskBtn"></button></section>');
const { document } = dom.window;
assert.equal(ensureCustomizerCardFields(document), true);
assert(document.getElementById('hushCustomMaskFamily'));
assert(document.getElementById('hushCustomMaskDescription'));
assert(document.getElementById('hushCustomMaskRiskTell'));
assert(document.getElementById('hushCustomMaskWarnings'));

document.getElementById('hushCustomMaskFamily').value = 'field test';
document.getElementById('hushCustomMaskDescription').value = 'This persona moves like a careful lantern in a strange hallway.';
document.getElementById('hushCustomMaskIntendedUse').value = 'Use for careful local review.';
document.getElementById('hushCustomMaskRiskTell').value = 'Too much glow can become signature.';
document.getElementById('hushCustomMaskSentence').value = 'mid';
document.getElementById('hushCustomMaskWarnings').value = 'review glow, preserve facts';
document.getElementById('hushCustomMaskSampleInput').value = 'sample text';
const fields = readCustomizerCardFields(document);
assert.equal(fields.family, 'field test');
assert.equal(fields.transformHints.sentence, 'mid');
assert.deepEqual(fields.pressureWarnings, ['review glow', 'preserve facts']);

const enhanced = applyCustomizerCardFieldsToMask({ id: 'custom-a', label: 'Custom A' }, fields);
assert.equal(enhanced.family, 'field test');
assert.equal(enhanced.riskTell, 'Too much glow can become signature.');
assert.equal(enhanced.sampleSeed, 'sample text');

const state = { customMasks: [{ id: 'custom-a', label: 'Custom A' }], selectedHushMaskId: 'custom-a' };
const bench = { benchState: state, renderHushMaskOptions() { state.rendered = true; }, selectHushMask(id) { state.selected = id; } };
const saved = enhanceSavedCustomMask(bench, document);
assert.equal(saved.description.includes('lantern'), true);
assert.equal(state.rendered, true);
assert.equal(state.selected, 'custom-a');
console.log('hush-customizer-card-fields tests passed');
