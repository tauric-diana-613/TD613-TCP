import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');

const browserMainSource = fs.readFileSync(path.join(repoRoot, 'app', 'browser-main.js'), 'utf8');
const legacyMainSource = fs.readFileSync(path.join(repoRoot, 'app', 'main.js'), 'utf8');
const trainerBrowserSource = fs.readFileSync(path.join(repoRoot, 'app', 'toys', 'persona-trainer', 'browser.js'), 'utf8');
const indexHtml = fs.readFileSync(path.join(repoRoot, 'app', 'index.html'), 'utf8');
const trainerHtml = fs.readFileSync(path.join(repoRoot, 'app', 'trainer.html'), 'utf8');
const homebaseHtml = fs.readFileSync(path.join(repoRoot, 'app', 'homebase.html'), 'utf8');

const forbiddenStorageMutations = [
  /window\.localStorage\.setItem\s*\(/g,
  /window\.localStorage\.removeItem\s*\(/g
];

for (const pattern of forbiddenStorageMutations) {
  assert.equal((browserMainSource.match(pattern) || []).length, 0, `browser-main should not mutate localStorage: ${pattern}`);
  assert.equal((legacyMainSource.match(pattern) || []).length, 0, `main should not mutate localStorage: ${pattern}`);
}

assert.ok(browserMainSource.includes("mode: 'session-storage'"), 'browser-main prefers a session-storage runtime store');
assert.ok(legacyMainSource.includes("mode: 'session-storage'"), 'legacy main prefers a session-storage runtime store');
assert.ok(browserMainSource.includes('SESSION_FLIGHT_STATE_KEY'), 'browser-main persists a cross-page flight snapshot');
assert.ok(browserMainSource.includes('persistSessionFlightState'), 'browser-main persists session state before page changes');
assert.ok(indexHtml.includes('data-page-kind="gateway"'), 'gateway page exposes page-kind identity');
assert.ok(trainerHtml.includes('trainerReleaseGateBtn'), 'trainer page exposes an explicit release gate control');
assert.ok(homebaseHtml.includes('session archive'), 'Homebase copy still exposes session archive wording');
assert.ok(trainerBrowserSource.includes('state.releaseGateArmed'), 'trainer browser controller tracks release-gate state');
assert.ok(trainerBrowserSource.includes('Arm the one-session release gate'), 'trainer browser controller blocks export until the release gate is armed');

console.log('runtime-retention.test.mjs passed');
