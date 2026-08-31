import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PARENT_930_RECEIPT='b34d04f078791bada782bdb88d2d22307c891595';
function resolveScientificHead(){
  const parents=execFileSync('git',['show','-s','--format=%P','HEAD'],{encoding:'utf8'}).trim().split(/\s+/).filter(Boolean);
  if(parents.length===2){
    const candidate=parents[1];
    try { execFileSync('git',['merge-base','--is-ancestor',PARENT_930_RECEIPT,candidate],{stdio:'pipe'}); return candidate; } catch {}
  }
  return 'HEAD';
}
const SCIENCE_HEAD=resolveScientificHead();
execFileSync('git',['cat-file','-e',`${PARENT_930_RECEIPT}^{commit}`],{stdio:'pipe'});
execFileSync('git',['merge-base','--is-ancestor',PARENT_930_RECEIPT,SCIENCE_HEAD],{stdio:'pipe'});
const ahead=Number(execFileSync('git',['rev-list','--count',`${PARENT_930_RECEIPT}..${SCIENCE_HEAD}`],{encoding:'utf8'}).trim());
assert.ok(ahead>=8,'Atlas Tutte-collision chamber must retain the eight preregistered/frozen successor commits');

const changed=execFileSync('git',['diff','--name-only',`${PARENT_930_RECEIPT}..${SCIENCE_HEAD}`,'--','app/dome-world/docs/ash/experiments/a15-r0','app/dome-world/previews/a15-r0','tests'],{encoding:'utf8'}).trim().split('\n').filter(Boolean).filter(pathName=>pathName.startsWith('app/dome-world/docs/ash/experiments/a15-r0/')||pathName.startsWith('app/dome-world/previews/a15-r0/')||pathName.startsWith('tests/ash-a15-r0-'));
const allowed=new Set([
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_TUTTE_COLLISION_NONISOMORPHISM_PREREGISTRATION_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_TUTTE_COLLISION_NONISOMORPHISM_EXPECTATIONS_V0_1.json',
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_TUTTE_COLLISION_NONISOMORPHISM_BURDEN_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_TUTTE_COLLISION_NONISOMORPHISM_FREEZE_V0_1.md',
  'app/dome-world/previews/a15-r0/atlas-tutte-collision-nonisomorphism.js',
  'tests/ash-a15-r0-aperture-pedagogue-atlas-tutte-collision-nonisomorphism.test.mjs',
  'tests/ash-a15-r0-aperture-pedagogue-atlas-tutte-collision-nonisomorphism-hostile.test.mjs',
  'tests/ash-a15-r0-review-hardening.test.mjs',
]);
const historicalMutations=changed.filter(pathName=>!allowed.has(pathName));
assert.deepEqual(historicalMutations,[],`post-#930 Atlas Tutte-collision chamber mutated inherited A15-R0 paths: ${historicalMutations.join(', ')}`);
assert.equal(changed.length,allowed.size,`Atlas Tutte-collision chamber must contain exactly ${allowed.size} live paths; observed ${changed.length}`);
for(const pathName of allowed) assert.equal(changed.includes(pathName),true,`missing Atlas Tutte-collision path: ${pathName}`);

// Mechanically replay the exact earned #930 hardening theorem tail while replacing only #930's ancestor-specific path audit.
const parentHardening=execFileSync('git',['show',`${PARENT_930_RECEIPT}:tests/ash-a15-r0-review-hardening.test.mjs`],{encoding:'utf8'});
const parentMarker="// Mechanically replay the exact earned #928 hardening theorem tail while replacing only #928's ancestor-specific path audit.";
const replayStart=parentHardening.indexOf(parentMarker);
assert.ok(replayStart>=0,'earned #930 hardening theorem tail must remain discoverable for descendant replay');
const parentTail=parentHardening.slice(replayStart);
const testsDir=path.dirname(fileURLToPath(import.meta.url));
const tempPath=path.join(testsDir,`.ash-a15-r0-parent-930-hardening-tail-${process.pid}.mjs`);
const tempSource=`import assert from 'node:assert/strict';\nimport fs from 'node:fs/promises';\nimport path from 'node:path';\nimport { execFileSync } from 'node:child_process';\nimport { fileURLToPath, pathToFileURL } from 'node:url';\nconst PARENT_928_RECEIPT='62722caea3f35bd520a2a1bfa5163f8cd2e14c26';\n${parentTail}`;
await fs.writeFile(tempPath,tempSource,'utf8');
try {
  await import(`${pathToFileURL(tempPath).href}?parent930=${Date.now()}`);
} finally {
  await fs.rm(tempPath,{force:true});
}

await import('./ash-a15-r0-aperture-pedagogue-atlas-tutte-collision-nonisomorphism.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-atlas-tutte-collision-nonisomorphism-hostile.test.mjs');

console.log('Ash A15-R0 Atlas Tutte collision nonisomorphism hardening tests passed.');
