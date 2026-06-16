import assert from 'assert';
import fs from 'fs';

const html = fs.readFileSync('app/adversarial-bench.html', 'utf8');
const css = fs.readFileSync('app/hush-phase31-1.css', 'utf8');
const js = fs.readFileSync('app/hush-phase31-1.js', 'utf8');
const originalJs = fs.readFileSync('app/hush-phase31-1-original.js', 'utf8');

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
assert(css.includes('hush-phase31-meter-fill'));
assert(css.includes('hush-phase31-sample-tools'));
assert(css.includes('hush-phase31-stat-grid'));
assert(css.includes('hush-phase31-modal'));
assert(css.includes('#hushVoiceReferenceSamplesSaved'));
assert(css.includes('#hushPhase31SampleCategory'));

assert(js.includes('dropdownPagedEditor: true'));
assert(js.includes('externalEditOwner: true'));
assert(originalJs.includes('MIN_SAMPLE_WORDS'));
assert(originalJs.includes('HUSH_CUSTOM_MASK_CORPUS_POLICY'));
assert(originalJs.includes('hushPhase31CustomizerPanel'));
assert(originalJs.includes('hushVoiceReferenceSamplesSaved'));
assert(originalJs.includes('hushPhase31CorpusFill'));
assert(originalJs.includes('hushPhase31SampleCategory'));
assert(originalJs.includes('hushPhase31ContextLabel'));
assert(originalJs.includes('hushPhase31AcceptedCount'));
assert(originalJs.includes('hushPhase31CategoryCount'));
assert(originalJs.includes('hushPhase31SaveMaskBtn'));
assert(originalJs.includes('hushPhase31LogSampleBtn'));
assert(originalJs.includes('hushPhase31SampleCount'));
assert(originalJs.includes('hushPhase31Undo'));
assert(originalJs.includes('hushPhase31SaveModal'));
assert(originalJs.includes('hushPhase31AddToStudio'));
assert(originalJs.includes('hushSwapWarningsPanel'));
assert(originalJs.includes('hushProfileMatchPanel'));
assert(originalJs.includes('parent.insertBefore(panel, match)'));
assert(originalJs.includes('createCustomMask'));
assert(originalJs.includes('addCustomMaskSample'));
assert(originalJs.includes('rebuildCustomMaskProfile'));
assert(originalJs.includes('state.customMasks = [saved,'));
assert(originalJs.includes('renderHushMaskOptions'));
assert(originalJs.includes('selectHushMask'));
assert(originalJs.includes('setInterval'));
assert(originalJs.includes("['.', '..', '...']"));
assert(!originalJs.includes('MIN_SAMPLE_CHARS = 1200'));

console.log('hush-phase31-1-customizer-forge tests passed');
