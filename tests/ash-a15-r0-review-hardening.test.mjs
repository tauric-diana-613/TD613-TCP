import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PARENT_902_RECEIPT='c0bdb1b0f19d94f987837a6cb2465e5933b623c2';
function resolveScientificHead(){
  const parents=execFileSync('git',['show','-s','--format=%P','HEAD'],{encoding:'utf8'}).trim().split(/\s+/).filter(Boolean);
  if(parents.length===2){
    const candidate=parents[1];
    try { execFileSync('git',['merge-base','--is-ancestor',PARENT_902_RECEIPT,candidate],{stdio:'pipe'}); return candidate; } catch {}
  }
  return 'HEAD';
}
const SCIENCE_HEAD=resolveScientificHead();
execFileSync('git',['cat-file','-e',`${PARENT_902_RECEIPT}^{commit}`],{stdio:'pipe'});
execFileSync('git',['merge-base','--is-ancestor',PARENT_902_RECEIPT,SCIENCE_HEAD],{stdio:'pipe'});
const ahead=Number(execFileSync('git',['rev-list','--count',`${PARENT_902_RECEIPT}..${SCIENCE_HEAD}`],{encoding:'utf8'}).trim());
assert.ok(ahead>=8,'Moss Lantern procedural-memory chamber must retain the eight preregistered/frozen successor commits');

const changed=execFileSync('git',['diff','--name-only',`${PARENT_902_RECEIPT}..${SCIENCE_HEAD}`,'--','app/dome-world/docs/ash/experiments/a15-r0','app/dome-world/previews/a15-r0','tests'],{encoding:'utf8'}).trim().split('\n').filter(Boolean).filter(pathName=>pathName.startsWith('app/dome-world/docs/ash/experiments/a15-r0/')||pathName.startsWith('app/dome-world/previews/a15-r0/')||pathName.startsWith('tests/ash-a15-r0-'));
const allowed=new Set([
  'app/dome-world/docs/ash/experiments/a15-r0/MOSS_LANTERN_PROCEDURAL_MEMORY_ORDER_DEFECT_PREREGISTRATION_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/MOSS_LANTERN_PROCEDURAL_MEMORY_ORDER_DEFECT_EXPECTATIONS_V0_1.json',
  'app/dome-world/docs/ash/experiments/a15-r0/MOSS_LANTERN_PROCEDURAL_MEMORY_ORDER_DEFECT_BURDEN_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/MOSS_LANTERN_PROCEDURAL_MEMORY_ORDER_DEFECT_FREEZE_V0_1.md',
  'app/dome-world/previews/a15-r0/moss-lantern-procedural-memory-order-defect.js',
  'tests/ash-a15-r0-aperture-pedagogue-moss-lantern-procedural-memory-order-defect.test.mjs',
  'tests/ash-a15-r0-aperture-pedagogue-moss-lantern-procedural-memory-order-defect-hostile.test.mjs',
  'tests/ash-a15-r0-review-hardening.test.mjs',
]);
const historicalMutations=changed.filter(pathName=>!allowed.has(pathName));
assert.deepEqual(historicalMutations,[],`post-#902 Moss Lantern procedural-memory chamber mutated inherited A15-R0 paths: ${historicalMutations.join(', ')}`);
assert.equal(changed.length,allowed.size,`Moss Lantern procedural-memory chamber must contain exactly ${allowed.size} live paths; observed ${changed.length}`);
for(const pathName of allowed) assert.equal(changed.includes(pathName),true,`missing Moss Lantern procedural-memory path: ${pathName}`);

// Mechanically replay the exact earned #902 hardening theorem tail while replacing only #902's ancestor-specific path audit.
// The earned #902 tail itself mechanically replays #900, and #900 replays #898.
const parentHardening=execFileSync('git',['show',`${PARENT_902_RECEIPT}:tests/ash-a15-r0-review-hardening.test.mjs`],{encoding:'utf8'});
const parentMarker='// Mechanically replay the exact earned #900 hardening theorem tail while replacing only #900\'s ancestor-specific path audit.';
const replayStart=parentHardening.indexOf(parentMarker);
assert.ok(replayStart>=0,'earned #902 hardening theorem tail must remain discoverable for descendant replay');
const parentTail=parentHardening.slice(replayStart);
const testsDir=path.dirname(fileURLToPath(import.meta.url));
const tempPath=path.join(testsDir,`.ash-a15-r0-parent-902-hardening-tail-${process.pid}.mjs`);
const tempSource=`import assert from 'node:assert/strict';\nimport fs from 'node:fs/promises';\nimport path from 'node:path';\nimport { execFileSync } from 'node:child_process';\nimport { fileURLToPath, pathToFileURL } from 'node:url';\nconst PARENT_900_RECEIPT='fa1c369abe3e628a92405aef03aeb6f9e2f76087';\n${parentTail}`;
await fs.writeFile(tempPath,tempSource,'utf8');
try {
  await import(`${pathToFileURL(tempPath).href}?parent902=${Date.now()}`);
} finally {
  await fs.rm(tempPath,{force:true});
}

await import('./ash-a15-r0-aperture-pedagogue-moss-lantern-procedural-memory-order-defect.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-moss-lantern-procedural-memory-order-defect-hostile.test.mjs');

console.log('Ash A15-R0 Moss Lantern procedural-memory order-defect hardening tests passed.');
