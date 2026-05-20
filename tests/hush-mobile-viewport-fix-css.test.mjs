import assert from 'assert';
import fs from 'fs';

const css = fs.readFileSync('app/hush-mobile-viewport-fix.css', 'utf8');
const bootstrap = fs.readFileSync('app/chamber-bootstrap.js', 'utf8');
const versions = fs.readFileSync('app/asset-versions.js', 'utf8');

for (const required of [
  'Phase 20.2',
  'box-sizing:border-box',
  'overflow-x:hidden',
  'overflow-x:clip',
  '.hush-mask-tabs',
  '.hush-route-grid',
  '.hush-pressure-ribbon',
  '.hush-heat-grid',
  '.hush-action-row > *',
  'scrollbar-width:none',
  'overscroll-behavior-x:contain',
  'inline-size:100%',
  '@media(max-width:760px)',
  '@media(max-width:430px)'
]) {
  assert(css.includes(required), `mobile viewport fix css missing ${required}`);
}

assert(css.includes('min-width:0!important'), 'viewport fix should neutralize min-width overflow');
assert(css.includes('max-width:100%!important'), 'viewport fix should cap wide descendants');
assert(!/@import\s+url|https?:\/\//i.test(css), 'viewport fix css must not import remote assets');
assert(bootstrap.includes('hush-mobile-viewport-fix.css'), 'bootstrap should load viewport fix css');
assert(bootstrap.indexOf('hush-field-instrument.css') < bootstrap.indexOf('hush-mobile-viewport-fix.css'), 'viewport fix css should load after field instrument css');
assert(versions.includes('hushMobileViewportFix'), 'asset versions should include hushMobileViewportFix cache key');

console.log('hush-mobile-viewport-fix-css tests passed');
