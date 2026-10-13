import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('app/adversarial-bench.html', 'utf8');
const manifest = fs.readFileSync('app/asset-versions.js', 'utf8');
const css = fs.readFileSync('app/hush-phase39.css', 'utf8');
const ui = fs.readFileSync('app/hush-phase39-ui.js', 'utf8');
const engine = fs.readFileSync('app/hush-phase39-engine.js', 'utf8');

assert.ok(manifest.includes('hushPhase39'), 'asset manifest should include Phase 39 version');
assert.ok(manifest.includes('hush-phase39.css'), 'asset manifest should load Phase 39 CSS');
assert.ok(manifest.includes('hush-phase39-ui.js'), 'asset manifest should load Phase 39 UI module on Hush page');
assert.ok(!html.includes('asset-versions.js'), 'Hush page should not use synchronous asset manifest boot');
assert.ok(html.includes('hush-phase39.css'), 'Hush page should load Phase 39 CSS directly');
assert.ok(html.includes('adversarial-bench-light.js'), 'Hush page should lazy-load Phase 39 UI from the light controller');

for (const selector of ['.hush-phase39-panel', '.hush-phase39-grid', '.hush-phase39-chip', '.hush-phase39-meter']) {
  assert.ok(css.includes(selector), `Phase 39 CSS should include ${selector}`);
}

for (const token of ['hushPhase39Panel', 'Meaning Survives the Mask', 'Audience mode', 'Protected meaning lockbox', 'Clean Receipt']) {
  assert.ok(ui.includes(token), `Phase 39 UI should include ${token}`);
}

for (const fn of ['detectEpistemicide', 'protectedMeaningResults', 'registerDrift', 'phase39Receipt', 'runPhase39']) {
  assert.ok(engine.includes(`export function ${fn}`), `Phase 39 engine should export ${fn}`);
}

assert.ok(engine.includes('privateTextExcluded: true'), 'Phase 39 receipt should exclude private text');
assert.ok(engine.includes('schema: \'td613-hush-phase39-receipt/v1\''), 'Phase 39 receipt schema should be explicit');

console.log('Hush Phase 39 UI wiring passes: assets, panel, controls, and receipt custody present.');
