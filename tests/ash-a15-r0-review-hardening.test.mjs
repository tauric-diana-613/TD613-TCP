import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PARENT_908_RECEIPT='34d55447a798c24599bc84402ceef2ce29849247';
function resolveScientificHead(){
  const parents=execFileSync('git',['show','-s','--format=%P','HEAD'],{encoding:'utf8'}).trim().split(/\s+/).filter(Boolean);
  if(parents.length===2){
    const candidate=parents[1];
    try { execFileSync('git',['merge-base','--is-ancestor',PARENT_908_RECEIPT,candidate],{stdio:'pipe'}); return candidate; } catch {}
  }
  return 'HEAD';
}
const SCIENCE_HEAD=resolveScientificHead();
execFileSync('git',['cat-file','-e',`${PARENT_908_RECEIPT}^{commit}`],{stdio:'pipe'});
execFileSync('git',['merge-base','--is-ancestor',PARENT_908_RECEIPT,SCIENCE_HEAD],{stdio:'pipe'});
const ahead=Number(execFileSync('git',['rev-list','--count',`${PARENT_908_RECEIPT}..${SCIENCE_HEAD}`],{encoding:'utf8'}).trim());
assert.ok(ahead>=8,'Atlas nonabelian two-loop history chamber must retain the eight preregistered/frozen successor commits');

const changed=execFileSync('git',['diff','--name-only',`${PARENT_908_RECEIPT}..${SCIENCE_HEAD}`,'--','app/dome-world/docs/ash/experiments/a15-r0','app/dome-world/previews/a15-r0','tests'],{encoding:'utf8'}).trim().split('\n').filter(Boolean).filter(pathName=>pathName.startsWith('app/dome-world/docs/ash/experiments/a15-r0/')||pathName.startsWith('app/dome-world/previews/a15-r0/')||pathName.startsWith('tests/ash-a15-r0-'));
const allowed=new Set([
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_NONABELIAN_TWO_LOOP_HISTORY_DESCENT_PREREGISTRATION_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_NONABELIAN_TWO_LOOP_HISTORY_DESCENT_EXPECTATIONS_V0_1.json',
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_NONABELIAN_TWO_LOOP_HISTORY_DESCENT_BURDEN_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_NONABELIAN_TWO_LOOP_HISTORY_DESCENT_FREEZE_V0_1.md',
  'app/dome-world/previews/a15-r0/atlas-nonabelian-two-loop-history-descent.js',
  'tests/ash-a15-r0-aperture-pedagogue-atlas-nonabelian-two-loop-history-descent.test.mjs',
  'tests/ash-a15-r0-aperture-pedagogue-atlas-nonabelian-two-loop-history-descent-hostile.test.mjs',
  'tests/ash-a15-r0-review-hardening.test.mjs',
]);
const historicalMutations=changed.filter(pathName=>!allowed.has(pathName));
assert.deepEqual(historicalMutations,[],`post-#908 Atlas nonabelian two-loop chamber mutated inherited A15-R0 paths: ${historicalMutations.join(', ')}`);
assert.equal(changed.length,allowed.size,`Atlas nonabelian two-loop chamber must contain exactly ${allowed.size} live paths; observed ${changed.length}`);
for(const pathName of allowed) assert.equal(changed.includes(pathName),true,`missing Atlas nonabelian two-loop path: ${pathName}`);

// Mechanically replay the exact earned #908 hardening theorem tail while replacing only #908's ancestor-specific path audit.
const parentHardening=execFileSync('git',['show',`${PARENT_908_RECEIPT}:tests/ash-a15-r0-review-hardening.test.mjs`],{encoding:'utf8'});
const parentMarker='// Mechanically replay the exact earned #906 hardening theorem tail while replacing only #906\'s ancestor-specific path audit.';
const replayStart=parentHardening.indexOf(parentMarker);
assert.ok(replayStart>=0,'earned #908 hardening theorem tail must remain discoverable for descendant replay');
const parentTail=parentHardening.slice(replayStart);
const testsDir=path.dirname(fileURLToPath(import.meta.url));
const tempPath=path.join(testsDir,`.ash-a15-r0-parent-908-hardening-tail-${process.pid}.mjs`);
const tempSource=`import assert from 'node:assert/strict';\nimport fs from 'node:fs/promises';\nimport path from 'node:path';\nimport { execFileSync } from 'node:child_process';\nimport { fileURLToPath, pathToFileURL } from 'node:url';\nconst PARENT_906_RECEIPT='6df04aebd040fd16c8f67188a61dd6380956c46e';\n${parentTail}`;
await fs.writeFile(tempPath,tempSource,'utf8');
try {
  await import(`${pathToFileURL(tempPath).href}?parent908=${Date.now()}`);
} finally {
  await fs.rm(tempPath,{force:true});
}

await import('./ash-a15-r0-aperture-pedagogue-atlas-nonabelian-two-loop-history-descent.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-atlas-nonabelian-two-loop-history-descent-hostile.test.mjs');

console.log('Ash A15-R0 Atlas nonabelian two-loop history descent hardening tests passed.');
