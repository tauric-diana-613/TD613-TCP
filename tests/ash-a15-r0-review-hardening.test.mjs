import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PARENT_898_RECEIPT='ec837736399e2b5e65c281c1fc88f18cc99709ad';
function resolveScientificHead(){
  const parents=execFileSync('git',['show','-s','--format=%P','HEAD'],{encoding:'utf8'}).trim().split(/\s+/).filter(Boolean);
  if(parents.length===2){
    const candidate=parents[1];
    try { execFileSync('git',['merge-base','--is-ancestor',PARENT_898_RECEIPT,candidate],{stdio:'pipe'}); return candidate; } catch {}
  }
  return 'HEAD';
}
const SCIENCE_HEAD=resolveScientificHead();
execFileSync('git',['cat-file','-e',`${PARENT_898_RECEIPT}^{commit}`],{stdio:'pipe'});
execFileSync('git',['merge-base','--is-ancestor',PARENT_898_RECEIPT,SCIENCE_HEAD],{stdio:'pipe'});
const ahead=Number(execFileSync('git',['rev-list','--count',`${PARENT_898_RECEIPT}..${SCIENCE_HEAD}`],{encoding:'utf8'}).trim());
assert.ok(ahead>=8,'action-evaluation Boolean fiber chamber must retain the eight preregistered/frozen successor commits');

const changed=execFileSync('git',['diff','--name-only',`${PARENT_898_RECEIPT}..${SCIENCE_HEAD}`,'--','app/dome-world/docs/ash/experiments/a15-r0','app/dome-world/previews/a15-r0','tests'],{encoding:'utf8'}).trim().split('\n').filter(Boolean).filter(pathName=>pathName.startsWith('app/dome-world/docs/ash/experiments/a15-r0/')||pathName.startsWith('app/dome-world/previews/a15-r0/')||pathName.startsWith('tests/ash-a15-r0-'));
const allowed=new Set([
  'app/dome-world/docs/ash/experiments/a15-r0/FINITE_ACTION_EVALUATION_BOOLEAN_FIBER_DESCENT_PREREGISTRATION_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/FINITE_ACTION_EVALUATION_BOOLEAN_FIBER_DESCENT_EXPECTATIONS_V0_1.json',
  'app/dome-world/docs/ash/experiments/a15-r0/FINITE_ACTION_EVALUATION_BOOLEAN_FIBER_DESCENT_BURDEN_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/FINITE_ACTION_EVALUATION_BOOLEAN_FIBER_DESCENT_FREEZE_V0_1.md',
  'app/dome-world/previews/a15-r0/finite-action-evaluation-boolean-fiber-descent.js',
  'tests/ash-a15-r0-aperture-pedagogue-finite-action-evaluation-boolean-fiber-descent.test.mjs',
  'tests/ash-a15-r0-aperture-pedagogue-finite-action-evaluation-boolean-fiber-descent-hostile.test.mjs',
  'tests/ash-a15-r0-review-hardening.test.mjs',
]);
const historicalMutations=changed.filter(pathName=>!allowed.has(pathName));
assert.deepEqual(historicalMutations,[],`post-#898 action-evaluation Boolean fiber chamber mutated inherited A15-R0 paths: ${historicalMutations.join(', ')}`);
assert.equal(changed.length,allowed.size,`action-evaluation Boolean fiber chamber must contain exactly ${allowed.size} live paths; observed ${changed.length}`);
for(const pathName of allowed) assert.equal(changed.includes(pathName),true,`missing action-evaluation Boolean fiber path: ${pathName}`);

// Replay the exact earned #898 hardening test body while replacing only its ancestor-specific path audit.
// This prevents hand-copied inherited import drift while keeping descendant path custody local to this chamber.
const parentHardening=execFileSync('git',['show',`${PARENT_898_RECEIPT}:tests/ash-a15-r0-review-hardening.test.mjs`],{encoding:'utf8'});
const replayMarker="execFileSync(process.execPath,['tests/ash-a15-r0-review-hardening-sharded.test.mjs']";
const replayStart=parentHardening.indexOf(replayMarker);
assert.ok(replayStart>=0,'earned #898 hardening tail must remain discoverable for descendant replay');
const parentTail=parentHardening.slice(replayStart);
const testsDir=path.dirname(fileURLToPath(import.meta.url));
const tempPath=path.join(testsDir,`.ash-a15-r0-parent-898-hardening-tail-${process.pid}.mjs`);
await fs.writeFile(tempPath,`import { execFileSync } from 'node:child_process';\n${parentTail}`,'utf8');
try {
  await import(`${pathToFileURL(tempPath).href}?parent898=${Date.now()}`);
} finally {
  await fs.rm(tempPath,{force:true});
}

await import('./ash-a15-r0-aperture-pedagogue-finite-action-evaluation-boolean-fiber-descent.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-finite-action-evaluation-boolean-fiber-descent-hostile.test.mjs');

console.log('Ash A15-R0 finite action-evaluation Boolean fiber descent hardening tests passed.');
