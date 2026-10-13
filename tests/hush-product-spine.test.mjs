import assert from 'assert';
import fs from 'fs';

const hushHtml = fs.readFileSync('app/hush.html', 'utf8');
const hushJs = fs.readFileSync('app/hush.js', 'utf8');
const hushCss = fs.readFileSync('app/hush-product-spine.css', 'utf8');
const visualCss = fs.readFileSync('app/hush-visual-system.css', 'utf8');
const legacyHtml = fs.readFileSync('app/adversarial-bench.html', 'utf8');

assert(hushHtml.includes('<title>TD613 Hush</title>'));
assert(hushHtml.includes('data-page-kind="hush-visual-system"'));
assert(hushHtml.includes('hushPersonaGallery'));
assert(hushHtml.includes('hushReadinessDashboard'));
assert(hushHtml.includes('./adversarial-bench.html'));
assert(hushJs.includes('renderHushPersonaGallery'));
assert(hushJs.includes('__TD613_HUSH_PRODUCT_STATE__'));
assert(hushCss.includes('hush-product-shell'));
assert(visualCss.includes('persona-gallery'));
assert(legacyHtml.includes('TD613 Hush'));

console.log('hush-product-spine tests passed');
