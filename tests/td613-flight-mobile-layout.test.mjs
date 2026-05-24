import assert from 'assert';
import { execFileSync } from 'child_process';
import fs from 'fs';

execFileSync('node', ['scripts/patch-td613-flight-mobile.mjs'], { stdio: 'inherit' });
const html = fs.readFileSync('app/safe-harbor/td613-flight.html', 'utf8');

assert(html.includes('Seal payload to begin Flight'));
assert(html.indexOf('mobile-prompt-rail') < html.indexOf('devSettingsDrawer'));
assert(html.includes('>Copy</button>'));
assert(html.includes('>Clear</button>'));
assert(!html.includes('Copy from output'));
assert(!html.includes('Clear output'));
assert(!html.includes('Loading TD613 Flight'));
assert(!html.includes('td613-flight-legacy.html'));
assert(!html.includes('<iframe'));

assert(html.includes('TD613 Flight PR78 absolute mobile lanes'));
assert(html.includes('td613-flight-pr78-absolute-mobile-lane-script'));
assert(html.includes('position: absolute !important'));
assert(html.includes('translate3d(100%, 0, 0)'));
assert(html.includes('translate3d(-100%, 0, 0)'));
assert(html.includes('function setTransforms(promptX, outputX)'));
assert(html.includes('function syncTabs(target)'));
assert(html.includes('event.stopImmediatePropagation()'));
assert(html.includes('touchstart'));
assert(html.includes('touchmove'));
assert(html.includes('touchend'));
assert(html.includes('flight-output-active'));
assert(html.includes('max-width: 100% !important'));
assert(html.includes('overflow-x: hidden !important'));
assert(html.includes('box-sizing: border-box !important'));
assert(html.includes('mobile-prompt-rail mobile-prompt-rail-top'));
assert(html.includes('width: max-content !important'));
assert(html.includes('margin: .64rem 0 .64rem auto !important'));
assert(html.includes('font-size: 16px !important'));
assert(html.includes('input[type="checkbox"]'));
assert(html.includes('input[type="radio"]'));
assert(html.includes('width: .48rem !important'));
assert(html.includes('justify-content: flex-start !important'));

assert(!html.includes('TD613 Flight direct mobile layout fix'));
assert(!html.includes('TD613 Flight PR71 mobile polish'));
assert(!html.includes('TD613 Flight PR73 mobile finale'));
assert(!html.includes('TD613 Flight PR74 mobile lane rescue'));
assert(!html.includes('TD613 Flight PR75 mobile lane recovery'));
assert(!html.includes('TD613 Flight PR76 native mobile lane repair'));
assert(!html.includes('TD613 Flight PR77 final mobile lane stabilization'));
assert(!html.includes('td613-flight-pr71-mobile-polish-script'));
assert(!html.includes('td613-flight-pr73-mobile-finale-script'));
assert(!html.includes('td613-flight-pr74-mobile-lane-rescue-script'));
assert(!html.includes('td613-flight-pr75-mobile-lane-recovery-script'));
assert(!html.includes('td613-flight-pr76-native-mobile-lane-script'));
assert(!html.includes('td613-flight-pr77-final-mobile-lane-script'));
assert(!html.includes('grid.scrollIntoView'));

console.log('td613-flight-mobile-layout tests passed');