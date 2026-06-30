import assert from 'assert';
import fs from 'fs';

const html = fs.readFileSync('app/adversarial-bench.html', 'utf8');
const bootstrap = fs.readFileSync('app/chamber-bootstrap.js', 'utf8');
const light = fs.readFileSync('app/adversarial-bench-light.js', 'utf8');
const phase31 = fs.readFileSync('app/hush-phase31-1.js', 'utf8');
const phase31Original = fs.readFileSync('app/hush-phase31-1-original.js', 'utf8');
const housekeepingRelayout = fs.readFileSync('app/hush-housekeeping-relayout.js', 'utf8');
const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

assert(html.includes('adversarial-bench-light.js'), 'Hush page should boot through the light controller');
assert(!html.includes('asset-versions.js'), 'Hush page should not use asset-versions document.write boot');
assert(!html.includes('hush-phase39-ui.js'), 'Phase 39 UI should lazy-load after idle or interaction');
assert(!html.includes('browser-engine.js'), 'Hush page should not directly load the generic browser engine');
assert(!html.includes('browser-main.js'), 'Hush page should not directly load generic browser main');

const hushBranch = bootstrap.slice(bootstrap.indexOf("if (pageKind === 'adversarial-bench')"), bootstrap.indexOf("if (pageKind === 'trainer')"));
assert(hushBranch.includes('installHushPhase31BindGuard();'), 'Hush bootstrap should preserve Phase31 bind guard');
assert(hushBranch.includes('return;'), 'Hush bootstrap should exit before generic chamber payload');
for (const heavy of ['browser-engine.js', 'browser-main.js', 'browser-diagnostics.js', 'hush-patch38.js', 'hush-pr75-rescue.js']) {
  assert(!hushBranch.includes(heavy), `Hush bootstrap should not append ${heavy}`);
}

assert(!/^import .*adversarial-bench\.mjs/m.test(light), 'light controller should not statically import heavy bench');
assert(light.includes("import('./adversarial-bench.mjs')"), 'light controller should dynamically import heavy bench on demand');
assert(!/^import .*hush-custom-mask\.js/m.test(phase31), 'Phase31 should not statically import custom-mask/stylometry engine');
assert(phase31Original.includes("import('./engine/hush-custom-mask.js')"), 'Phase31 implementation should lazy-load custom-mask engine');
assert(!html.includes('hush-edit-corpus-open-fallback.js'), 'Hush page should not load fallback edit owner scripts');
assert(!housekeepingRelayout.includes('hush-phase39-ui.js'), 'housekeeping relayout should not eagerly append Phase 39 UI');
const headerValue = (source) => vercel.headers
  .find((entry) => entry.source === source)
  ?.headers?.find((header) => header.key.toLowerCase() === 'cache-control')
  ?.value || '';
for (const source of ['/hush-(.*)', '/app/hush-(.*)']) {
  assert(!headerValue(source).includes('no-store'), `${source} static assets should not force no-store`);
}
for (const source of ['/engine/(.*)', '/app/engine/(.*)']) {
  assert(!headerValue(source).includes('no-store'), `${source} static assets should not force no-store`);
}

console.log('hush-load-budget tests passed');
