import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const researchPath = path.join(root, 'app/dome-world/ash-research-demo-hydration.js');
const premiumProbePath = path.join(root, 'scripts/ash-premium-ui-browser-probe.mjs');
const researchSource = fs.readFileSync(researchPath, 'utf8');
const premiumProbe = fs.readFileSync(premiumProbePath, 'utf8');

const waitForAsh = researchSource.match(/async function waitForAsh\(\) \{[\s\S]*?\n\}/)?.[0] || '';
assert(waitForAsh, 'Research core readiness function is missing.');
assert.match(waitForAsh, /__td613AshKeep\?\.refresh/);
assert.match(waitForAsh, /__td613AshPremiumUI\?\.refresh/);
assert.match(waitForAsh, /workspace-home/);
assert.match(waitForAsh, /workspace-work/);
assert.match(waitForAsh, /Research project core hydration readiness timed out/);
assert.doesNotMatch(waitForAsh, /__td613AshAia3Composition/);
assert.doesNotMatch(waitForAsh, /&& byId\('workspace-custody'\)/);
assert.match(waitForAsh, /ashResearchCustodyPosture/);
assert.match(waitForAsh, /PRESENT_AT_CORE_HYDRATION/);
assert.match(waitForAsh, /AUDIT_AFTER_CASE_HYDRATION/);

assert.match(researchSource, /async function waitForOpenComposition\(caseId\)/);
assert.match(researchSource, /composition\?\.lifecycle_state/);
assert.match(researchSource, /composition\?\.route_count >= 4/);
assert.match(researchSource, /composition\?\.task_count >= 4/);
assert.match(researchSource, /const surfaceReport = auditResearchSurfaces\(\)/);
assert.match(researchSource, /renderSurfaceLedger\(surfaceReport\)/);

assert.match(premiumProbe, /td613\.ash\.premium-ui-browser-flight\/v0\.3-entry-converged-destinations/);
assert.match(premiumProbe, /async function waitVisibleWorkspace\(page, name\)/);
assert.match(premiumProbe, /async function hydrateProfile\(page, profile, expectedTitle, entryWorkspace\)/);
assert.match(premiumProbe, /async function flightProfile\(context, profile, title, entryWorkspace\)/);
assert.match(premiumProbe, /hydrateProfile\(page, profile, title, entryWorkspace\)/);
assert.match(premiumProbe, /dataset\.ashDemoEntryReady === `\$\{value\}:\$\{entry\}`/);
assert.match(premiumProbe, /convergence\?\.posture === 'READY'/);
assert.match(premiumProbe, /convergence\?\.phase === 'VISIBLE'/);
assert.match(premiumProbe, /waitVisibleWorkspace\(page, 'home'\)/);
assert.match(premiumProbe, /waitVisibleWorkspace\(page, 'work'\)/);
assert.match(premiumProbe, /waitVisibleWorkspace\(page, 'choir'\)/);
assert.match(premiumProbe, /waitVisibleWorkspace\(page, 'capsule'\)/);
assert.match(premiumProbe, /waitVisibleWorkspace\(page, 'draft'\)/);
assert.match(premiumProbe, /flightProfile\(context, 'political_campaign', 'Harbor City Mayoral Campaign', 'map'\)/);
assert.match(premiumProbe, /flightProfile\(context, 'fundraiser', 'Northstar Arts Benefit', 'work'\)/);

assert.equal(fs.existsSync(path.join(root, '.github/workflows/ash-final-rehydration-patch.yml')), false, 'One-use patch workflow survived cleanup.');
assert.equal(fs.existsSync(path.join(root, 'tests/.ash-final-rehydration-trigger')), false, 'One-use patch trigger survived cleanup.');

console.log('ash-final-rehydration-boundaries.test.mjs passed');
