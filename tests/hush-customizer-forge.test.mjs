import assert from 'assert';
import fs from 'fs';
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

const html = fs.readFileSync('app/adversarial-bench.html', 'utf8');
const css = fs.readFileSync('app/hush-phase31-1.css', 'utf8');
const js = fs.readFileSync('app/hush-phase31-1.js', 'utf8');

assert(html.includes('<title>TD613 Hush</title>'));
assert(!html.includes('<title>TCP / Homebase / Personas</title>'));
assert(html.includes('maximum-scale=1'));
assert(html.includes('user-scalable=no'));
assert(html.includes('id="td613HushLoading"'));
assert(html.includes('TD613 Hush is loading'));
assert(html.includes('td613HushLoadingDots'));
assert(html.includes('./hush-phase31-1.css'));
assert(html.includes('./hush-phase31-1.js'));

assert(css.includes('td613-hush-loading-dots'));
assert(css.includes('hush-phase31-customizer'));
assert(css.includes('hush-phase31-corpus-meter'));
assert(css.includes('hush-phase31-modal'));
assert(css.includes('#hushVoiceReferenceSamplesSaved'));
assert(css.includes('#hushPhase31SampleCategory'));
assert(css.includes('#messageDraftInput,#protectedOutputInput'));
assert(!css.includes('#hushVoiceReferenceSamplesSaved{font-size:16px!important'));

assert(js.includes('MIN_SAMPLE_WORDS'));
assert(js.includes('phase-31.1-corpus'));
assert(js.includes('HUSH_CUSTOM_MASK_CORPUS_POLICY'));
assert(js.includes('hushPhase31CustomizerPanel'));
assert(js.includes('hushVoiceReferenceSamplesSaved'));
assert(js.includes('hushPhase31CorpusFill'));
assert(js.includes('hushPhase31SampleCategory'));
assert(js.includes('hushPhase31ContextLabel'));
assert(js.includes('hushPhase31SaveMaskBtn'));
assert(js.includes('hushPhase31LogSampleBtn'));
assert(js.includes('hushPhase31SampleCount'));
assert(js.includes('hushPhase31Undo'));
assert(js.includes('hushPhase31SaveModal'));
assert(js.includes('hushPhase31AddToStudio'));
assert(js.includes('hushSwapWarningsPanel'));
assert(js.includes('hushProfileMatchPanel'));
assert(js.includes('parent.insertBefore(panel, match)'));
assert(js.includes('createCustomMask'));
assert(js.includes('addCustomMaskSample'));
assert(js.includes('rebuildCustomMaskProfile'));
assert(js.includes('state.customMasks = [saved,'));
assert(js.includes('renderHushMaskOptions'));
assert(js.includes('selectHushMask'));
assert(js.includes('setInterval'));
assert(js.includes("['.', '..', '...']"));
assert(js.includes('loaderArmed'));
assert(!js.includes('MIN_SAMPLE_CHARS = 1200'));

console.log('hush-customizer-forge tests passed');
