import assert from 'assert';
import fs from 'fs';

const css = fs.readFileSync('app/hush-mobile-field-deck.css', 'utf8');
assert(css.includes('@media (max-width: 760px)'));
assert(css.includes('grid-template-columns:1fr'));
assert(css.includes('min-height:44px'));
assert(css.includes('overflow-x:hidden'));
assert(css.includes('hush-mobile-sticky-action'));
assert(css.includes('-webkit-line-clamp:2'));
console.log('hush-mobile-field-deck tests passed');
