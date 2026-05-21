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
assert(html.includes('14dvh'));
assert(html.includes('max-height: 16dvh'));
assert(!html.includes('Loading TD613 Flight'));
assert(!html.includes('td613-flight-legacy.html'));
assert(!html.includes('<iframe'));
assert(html.includes('TD613 Flight direct mobile layout fix'));
console.log('td613-flight-mobile-layout tests passed');
