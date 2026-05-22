import assert from 'assert';
import fs from 'fs';

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
assert(css.includes('hush-phase31-modal'));
assert(css.includes('textarea,input,select{font-size:16px!important}'));
assert(css.includes('#hushVoiceReferenceSamplesSaved'));

assert(js.includes('MIN_SAMPLE_CHARS = 1200'));
assert(js.includes('hushPhase31CustomizerPanel'));
assert(js.includes('hushVoiceReferenceSamplesSaved'));
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

console.log('hush-phase31-1-customizer-forge tests passed');
