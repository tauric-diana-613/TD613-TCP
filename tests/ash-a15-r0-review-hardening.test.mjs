import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PARENT_938_RECEIPT='656f2093760f5812f8a4a9d1497a6dd5acf4e5a0';
function resolveScientificHead(){
  const parents=execFileSync('git',['show','-s','--format=%P','HEAD'],{encoding:'utf8'}).trim().split(/\s+/).filter(Boolean);
  if(parents.length===2){const candidate=parents[1];try{execFileSync('git',['merge-base','--is-ancestor',PARENT_938_RECEIPT,candidate],{stdio:'pipe'});return candidate;}catch{}}
  return 'HEAD';
}
const SCIENCE_HEAD=resolveScientificHead();
execFileSync('git',['cat-file','-e',`${PARENT_938_RECEIPT}^{commit}`],{stdio:'pipe'});
execFileSync('git',['merge-base','--is-ancestor',PARENT_938_RECEIPT,SCIENCE_HEAD],{stdio:'pipe'});
const ahead=Number(execFileSync('git',['rev-list','--count',`${PARENT_938_RECEIPT}..${SCIENCE_HEAD}`],{encoding:'utf8'}).trim());
assert.ok(ahead>=8,'Atlas marked 2-section reconstruction chamber must retain the eight preregistered/frozen successor commits');

const changed=execFileSync('git',['diff','--name-only',`${PARENT_938_RECEIPT}..${SCIENCE_HEAD}`,'--','app/dome-world/docs/ash/experiments/a15-r0','app/dome-world/previews/a15-r0','tests'],{encoding:'utf8'}).trim().split('\n').filter(Boolean).filter(p=>p.startsWith('app/dome-world/docs/ash/experiments/a15-r0/')||p.startsWith('app/dome-world/previews/a15-r0/')||p.startsWith('tests/ash-a15-r0-'));
const allowed=new Set([
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_MARKED_2SECTION_RECONSTRUCTION_EXACTNESS_PREREGISTRATION_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_MARKED_2SECTION_RECONSTRUCTION_EXACTNESS_EXPECTATIONS_V0_1.json',
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_MARKED_2SECTION_RECONSTRUCTION_EXACTNESS_BURDEN_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_MARKED_2SECTION_RECONSTRUCTION_EXACTNESS_FREEZE_V0_1.md',
  'app/dome-world/previews/a15-r0/atlas-marked-2section-reconstruction-exactness.js',
  'tests/ash-a15-r0-aperture-pedagogue-atlas-marked-2section-reconstruction-exactness.test.mjs',
  'tests/ash-a15-r0-aperture-pedagogue-atlas-marked-2section-reconstruction-exactness-hostile.test.mjs',
  'tests/ash-a15-r0-review-hardening.test.mjs',
]);
const historicalMutations=changed.filter(p=>!allowed.has(p));
assert.deepEqual(historicalMutations,[],`post-#938 marked 2-section reconstruction chamber mutated inherited A15-R0 paths: ${historicalMutations.join(', ')}`);
assert.equal(changed.length,allowed.size);
for(const p of allowed)assert.equal(changed.includes(p),true,`missing marked 2-section reconstruction path: ${p}`);

// Mechanically replay the exact earned #938 hardening theorem tail while replacing only #938's ancestor-specific path audit.
const parentHardening=execFileSync('git',['show',`${PARENT_938_RECEIPT}:tests/ash-a15-r0-review-hardening.test.mjs`],{encoding:'utf8'});
const parentMarker="// Mechanically replay the exact earned #936 hardening theorem tail while replacing only #936's ancestor-specific path audit.";
const replayStart=parentHardening.indexOf(parentMarker);
assert.ok(replayStart>=0,'earned #938 hardening theorem tail must remain discoverable for descendant replay');
const parentTail=parentHardening.slice(replayStart);
const testsDir=path.dirname(fileURLToPath(import.meta.url));
const tempPath=path.join(testsDir,`.ash-a15-r0-parent-938-hardening-tail-${process.pid}.mjs`);
const tempSource=`import assert from 'node:assert/strict';\nimport fs from 'node:fs/promises';\nimport path from 'node:path';\nimport { execFileSync } from 'node:child_process';\nimport { fileURLToPath, pathToFileURL } from 'node:url';\nconst PARENT_936_RECEIPT='c22a588897aa27f55970480218f952697967df80';\n${parentTail}`;
await fs.writeFile(tempPath,tempSource,'utf8');
try{await import(`${pathToFileURL(tempPath).href}?parent938=${Date.now()}`);}finally{await fs.rm(tempPath,{force:true});}

await import('./ash-a15-r0-aperture-pedagogue-atlas-marked-2section-reconstruction-exactness.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-atlas-marked-2section-reconstruction-exactness-hostile.test.mjs');
console.log('Ash A15-R0 Atlas marked 2-section reconstruction exactness hardening tests passed.');
