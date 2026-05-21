import assert from 'assert';
import { JSDOM } from 'jsdom';
import { ensureCustomizerCardFields } from '../app/hush-customizer-card-fields.js';
import { buildCustomizerForgeState, renderCustomizerForge, validateCustomizerForgeFields } from '../app/hush-customizer-forge.js';

const dom = new JSDOM('<section><label><input id="hushCustomMaskName" value="Forged Nova" /></label><textarea id="hushCustomMaskSampleInput">sample text for the forge</textarea></section>');
const { document } = dom.window;
ensureCustomizerCardFields(document);
document.getElementById('hushCustomMaskFamily').value = 'forge test';
document.getElementById('hushCustomMaskDescription').value = 'Nova lights the workbench and keeps the route visible.';
document.getElementById('hushCustomMaskIntendedUse').value = 'Use for custom mask preview.';
document.getElementById('hushCustomMaskRiskTell').value = 'Over-polished glow may become signature.';
document.getElementById('hushCustomMaskSentence').value = 'mid';

const state = buildCustomizerForgeState(document);
assert.equal(state.version, 'phase-31');
assert.equal(state.privateTextStored, false);
assert.equal(state.validation.passed, true);
assert.equal(state.preview.label, 'Forged Nova');

const rendered = renderCustomizerForge(document);
assert.equal(rendered.version, 'phase-31');
assert(document.getElementById('hushCustomizerForgePreview'));

const missing = validateCustomizerForgeFields({});
assert.equal(missing.passed, false);
assert(missing.missing.includes('persona-story-missing'));
console.log('hush-customizer-forge tests passed');
