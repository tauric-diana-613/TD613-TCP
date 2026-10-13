import assert from 'assert';
import fs from 'fs';

const css = fs.readFileSync('app/hush-compact.css', 'utf8');
const html = fs.readFileSync('app/adversarial-bench.html', 'utf8');

assert(css.includes('Phase 13'), 'compact stylesheet declares Phase 13');
assert(css.includes('body[data-page-kind="adversarial-bench"]'), 'compact stylesheet is scoped to Hush');
assert(css.includes('@media(max-width:720px)'), 'compact stylesheet includes mobile breakpoint');
assert(css.includes('@media(max-width:420px)'), 'compact stylesheet includes narrow-phone breakpoint');
assert(css.includes('#messageDraftInput'), 'compact stylesheet targets message draft field');
assert(css.includes('#protectedOutputInput'), 'compact stylesheet targets protected output field');
assert(css.includes('#protectedBaselineInput'), 'compact stylesheet reduces baseline field');
assert(css.includes('#maskReferenceInput'), 'compact stylesheet reduces mask reference field');
assert(css.includes('position:sticky'), 'compact stylesheet keeps output controls reachable on mobile');
assert(css.includes('max-height:32vh') || css.includes('max-height:26vh'), 'compact stylesheet caps mobile textarea height');

assert(html.includes('./hush-compact.css'), 'Hush page loads compact stylesheet directly');
assert(html.includes('data-page-kind="adversarial-bench"'), 'Hush page exposes page-kind hook for compact stylesheet');
assert(html.includes('TD613 Hush'), 'Hush page identity remains intact');

console.log('hush-compact-mobile tests passed');
