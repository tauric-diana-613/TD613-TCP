import assert from 'assert';
import fs from 'fs';

const js = fs.readFileSync('app/hush.js', 'utf8');
const css = fs.readFileSync('app/hush-product-spine.css', 'utf8');
const html = fs.readFileSync('app/hush.html', 'utf8');

assert(js.includes('buildHushEvidenceCockpit'));
assert(js.includes('hushEvidenceCockpit'));
assert(js.includes('__TD613_HUSH_EVIDENCE_COCKPIT__'));
assert(css.includes('cockpit-grid'));
assert(css.includes('instrument-panel'));
assert(css.includes('loss-track'));
assert(html.includes('hushReadinessDashboard'));
console.log('hush-phase30-ui tests passed');
