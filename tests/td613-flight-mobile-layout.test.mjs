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
assert(/authorship wrap/i.test(html));
assert(/payload #/i.test(html));

assert(html.indexOf('<div class="card output-card">') < html.indexOf('<div class="card seal-card">'));
assert(html.indexOf('mobile-prompt-rail') < html.indexOf('devSettingsDrawer'));
assert(html.includes('>Copy</button>'));
assert(html.includes('>Clear</button>'));
assert(!html.includes('Copy from output'));
assert(!html.includes('Clear output'));
assert(!html.includes('Loading TD613 Flight'));
assert(!html.includes('td613-flight-legacy.html'));
assert(!html.includes('<iframe'));

assert(!html.includes('grid.scrollIntoView'));
assert(html.includes('PR168_SENTINEL TD613 Flight iOS output lane scroll stabilizer'));
assert(html.includes('td613-flight-pr168-ios-output-scroll-stabilizer'));
assert(html.includes('data-flight-pr168-lane-stack="stable"'));
assert(html.includes('window.TD613FlightIOSOutputScrollStabilizer'));
assert(html.includes('--td613-flight-grid-height'));
assert(html.includes('laneHeight(prompt), laneHeight(output), viewportHeight() * 0.62'));

console.log('td613-flight-mobile-layout tests passed');
