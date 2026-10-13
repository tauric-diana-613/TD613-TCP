import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const controls = fs.readFileSync(path.join(root, 'app/giving/history/giving-search-controls.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'app/giving/history/giving-search-controls.css'), 'utf8');

assert.match(controls, /run\.textContent = 'SEARCH'/);
assert.match(controls, /form\.addEventListener\('submit', scrollSearchToTop\)/);
assert.match(controls, /window\.scrollTo\(\{ top: 0, left: 0, behavior \}\)/);
assert.match(css, /#runSearchButton\[data-primary-search="true"\]/);
assert.match(css, /drop-shadow\(0 0 3px rgba\(118, 234, 212, \.42\)\)/, 'primary SEARCH halo uses the requested cyan glow');
assert.match(css, /clip-path.*clips ordinary outer box-shadows|drop-shadow is applied after clipping/s, 'halo contract documents why filter is required for the clipped button');

console.log('giving-search-action.test.mjs passed');