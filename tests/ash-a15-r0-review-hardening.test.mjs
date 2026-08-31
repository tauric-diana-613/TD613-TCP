import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PARENT_910_RECEIPT='6343ced7cf274b5f3981cfcb68e3a255447ffcd6';
function resolveScientificHead(){
  const parents=execFileSync('git',['show','-s','--format=%P','HEAD'],{encoding:'utf8'}).trim().split(/\s+/).filter(Boolean);
  if(parents.length===2){
    const candidate=parents[1];
    try { execFileSync('git',['merge-base','--is-ancestor',PARENT_910_RECEIPT,candidate],{stdio:'pipe'}); return candidate; } catch {}
  }
  return 'HEAD';
}
const SCIENCE_HEAD=resolveScientificHead();
execFileSync('git',['cat-file','-e',`${PARENT_910_RECEIPT}^{commit}`],{stdio:'pipe'});
execFileSync('git',['merge-base','--is-ancestor',PARENT_910_RECEIPT,SCIENCE_HEAD],{stdio:'pipe'});
const ahead=Number(execFileSync('git',['rev-list','--count',`${PARENT_910_RECEIPT}..${SCIENCE_HEAD}`],{encoding:'utf8'}).trim());
assert.ok(ahead>=8,'Atlas central-commutator depth chamber must retain the eight preregistered/frozen successor commits');

const changed=execFileSync('git',['diff','--name-only',`${PARENT_910_RECEIPT}..${SCIENCE_HEAD}`,'--','app/dome-world/docs/ash/experiments/a15-r0','app/dome-world/previews/a15-r0','tests'],{encoding:'utf8'}).trim().split('\n').filter(Boolean).filter(pathName=>pathName.startsWith('app/dome-world/docs/ash/experiments/a15-r0/')||pathName.startsWith('app/dome-world/previews/a15-r0/')||pathName.startsWith('tests/ash-a15-r0-'));
const allowed=new Set([
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_CENTRAL_COMMUTATOR_DEPTH_COLLAPSE_PREREGISTRATION_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_CENTRAL_COMMUTATOR_DEPTH_COLLAPSE_EXPECTATIONS_V0_1.json',
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_CENTRAL_COMMUTATOR_DEPTH_COLLAPSE_BURDEN_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_CENTRAL_COMMUTATOR_DEPTH_COLLAPSE_FREEZE_V0_1.md',
  'app/dome-world/previews/a15-r0/atlas-central-commutator-depth-collapse.js',
  'tests/ash-a15-r0-aperture-pedagogue-atlas-central-commutator-depth-collapse.test.mjs',
  'tests/ash-a15-r0-aperture-pedagogue-atlas-central-commutator-depth-collapse-hostile.test.mjs',
  'tests/ash-a15-r0-review-hardening.test.mjs',
]);
const historicalMutations=changed.filter(pathName=>!allowed.has(pathName));
assert.deepEqual(historicalMutations,[],`post-#910 Atlas central-commutator chamber mutated inherited A15-R0 paths: ${historicalMutations.join(', ')}`);
assert.equal(changed.length,allowed.size,`Atlas central-commutator chamber must contain exactly ${allowed.size} live paths; observed ${changed.length}`);
for(const pathName of allowed) assert.equal(changed.includes(pathName),true,`missing Atlas central-commutator path: ${pathName}`);

// Mechanically replay the exact earned #910 hardening theorem tail while replacing only #910's ancestor-specific path audit.
const parentHardening=execFileSync('git',['show',`${PARENT_910_RECEIPT}:tests/ash-a15-r0-review-hardening.test.mjs`],{encoding:'utf8'});
const parentMarker='// Mechanically replay the exact earned #908 hardening theorem tail while replacing only #908\'s ancestor-specific path audit.';
const replayStart=parentHardening.indexOf(parentMarker);
assert.ok(replayStart>=0,'earned #910 hardening theorem tail must remain discoverable for descendant replay');
const parentTail=parentHardening.slice(replayStart);
const testsDir=path.dirname(fileURLToPath(import.meta.url));
const tempPath=path.join(testsDir,`.ash-a15-r0-parent-910-hardening-tail-${process.pid}.mjs`);
const tempSource=`import assert from 'node:assert/strict';\nimport fs from 'node:fs/promises';\nimport path from 'node:path';\nimport { execFileSync } from 'node:child_process';\nimport { fileURLToPath, pathToFileURL } from 'node:url';\nconst PARENT_908_RECEIPT='34d55447a798c24599bc84402ceef2ce29849247';\n${parentTail}`;
await fs.writeFile(tempPath,tempSource,'utf8');
try {
  await import(`${pathToFileURL(tempPath).href}?parent910=${Date.now()}`);
} finally {
  await fs.rm(tempPath,{force:true});
}

await import('./ash-a15-r0-aperture-pedagogue-atlas-central-commutator-depth-collapse.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-atlas-central-commutator-depth-collapse-hostile.test.mjs');

console.log('Ash A15-R0 Atlas central commutator depth collapse hardening tests passed.');
