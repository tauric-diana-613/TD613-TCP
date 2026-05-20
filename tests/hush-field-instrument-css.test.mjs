import assert from 'assert';
import fs from 'fs';

const css = fs.readFileSync('app/hush-field-instrument.css', 'utf8');
const bootstrap = fs.readFileSync('app/chamber-bootstrap.js', 'utf8');
const versions = fs.readFileSync('app/asset-versions.js', 'utf8');

for (const required of [
  'Phase 20.1',
  '.hush-alien-console::before',
  '.hush-alien-console::after',
  '.hush-route-card::before',
  '.hush-route-card::after',
  '.hush-transform-gate::before',
  '.hush-output-chamber textarea#protectedOutputInput',
  '.hush-heat-tile',
  '.hush-drawer-console[open]',
  '@media(max-width:760px)',
  '@media(max-width:430px)',
  '100svh',
  'scroll-snap-type:x mandatory',
  'position:sticky',
  'prefers-reduced-motion'
]) {
  assert(css.includes(required), `field instrument css missing ${required}`);
}

assert(css.indexOf('@media(max-width:760px)') < css.indexOf('@media(max-width:430px)'), 'narrow-phone overrides should follow phone overrides');
assert(!/@import\s+url|https?:\/\//i.test(css), 'field instrument css must not import remote assets');
assert(bootstrap.includes('hush-field-instrument.css'), 'bootstrap should load field instrument css');
assert(bootstrap.indexOf('hush-alien-console.css') < bootstrap.indexOf('hush-field-instrument.css'), 'field instrument css should load after alien console css');
assert(versions.includes('hushFieldInstrument'), 'asset versions should include hushFieldInstrument cache key');

console.log('hush-field-instrument-css tests passed');
