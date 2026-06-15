import assert from 'assert';
import fs from 'fs';

const html = fs.readFileSync('app/safe-harbor/td613-flight.html', 'utf8');

assert(html.includes('TD613 Flight'));
assert(html.includes('Seal payload to begin Flight'));
assert(html.includes('mobile-prompt-rail'));
assert(html.includes('mobile-prompt-rail-top'));
assert(html.includes('mobile-flight-switcher'));
assert(html.includes('mobile-lane-tab'));
assert(html.includes('data-flight-lane-target="prompt"'));
assert(html.includes('data-flight-lane-target="output"'));
assert(html.includes('Your Prompt'));
assert(html.includes('Sealed Output'));
assert(html.includes('Prompt Output'));
assert(html.includes('Copy Seal'));
assert(html.includes('Append lozenge'));
assert(html.includes('Append lozenge + SAC'));
assert(html.includes('PR168_SENTINEL definitive Seal spacing panel repair'));
assert(html.includes('grid-template-areas: "target zwnj" !important'));
assert(html.includes('.flight-lane-output .seal-card .seal-target-panel'));
assert(html.includes('.flight-lane-output .seal-card .seal-zwnj-panel'));
assert(html.indexOf('PR90_SENTINEL TD613 Flight seal side-by-side target/zwnj repair') < html.indexOf('PR168_SENTINEL definitive Seal spacing panel repair'));
assert(html.indexOf('PR91_SENTINEL TD613 Flight mobile tile controls restoration') < html.indexOf('PR168_SENTINEL definitive Seal spacing panel repair'));
assert(/authorship wrap/i.test(html));
assert(/payload #/i.test(html));

assert(html.indexOf('<div class="card output-card">') < html.indexOf('<div class="card seal-card">'));
assert(html.indexOf('<div class="seal-target-panel">') < html.indexOf('<div class="seal-zwnj-panel">'));
assert(html.indexOf('mobile-prompt-rail') < html.indexOf('devSettingsDrawer'));
assert(html.includes('>Copy</button>'));
assert(html.includes('>Clear</button>'));
assert(!html.includes('Copy from output'));
assert(!html.includes('Clear output'));
assert(!html.includes('Loading TD613 Flight'));
assert(!html.includes('td613-flight-legacy.html'));
assert(!html.includes('<iframe'));

assert(!html.includes('grid.scrollIntoView'));

console.log('td613-flight-mobile-layout tests passed');
