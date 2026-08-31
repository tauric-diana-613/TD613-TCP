import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PARENT_928_RECEIPT='62722caea3f35bd520a2a1bfa5163f8cd2e14c26';
function resolveScientificHead(){
  const parents=execFileSync('git',['show','-s','--format=%P','HEAD'],{encoding:'utf8'}).trim().split(/\s+/).filter(Boolean);
  if(parents.length===2){
    const candidate=parents[1];
    try { execFileSync('git',['merge-base','--is-ancestor',PARENT_928_RECEIPT,candidate],{stdio:'pipe'}); return candidate; } catch {}
  }
  return 'HEAD';
}
const SCIENCE_HEAD=resolveScientificHead();
execFileSync('git',['cat-file','-e',`${PARENT_928_RECEIPT}^{commit}`],{stdio:'pipe'});
execFileSync('git',['merge-base','--is-ancestor',PARENT_928_RECEIPT,SCIENCE_HEAD],{stdio:'pipe'});
const ahead=Number(execFileSync('git',['rev-list','--count',`${PARENT_928_RECEIPT}..${SCIENCE_HEAD}`],{encoding:'utf8'}).trim());
assert.ok(ahead>=8,'Atlas Tutte compression chamber must retain the eight preregistered/frozen successor commits');

const changed=execFileSync('git',['diff','--name-only',`${PARENT_928_RECEIPT}..${SCIENCE_HEAD}`,'--','app/dome-world/docs/ash/experiments/a15-r0','app/dome-world/previews/a15-r0','tests'],{encoding:'utf8'}).trim().split('\n').filter(Boolean).filter(pathName=>pathName.startsWith('app/dome-world/docs/ash/experiments/a15-r0/')||pathName.startsWith('app/dome-world/previews/a15-r0/')||pathName.startsWith('tests/ash-a15-r0-'));
const allowed=new Set([
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_TUTTE_RANK_GENERATING_COMPRESSION_PREREGISTRATION_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_TUTTE_RANK_GENERATING_COMPRESSION_EXPECTATIONS_V0_1.json',
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_TUTTE_RANK_GENERATING_COMPRESSION_BURDEN_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_TUTTE_RANK_GENERATING_COMPRESSION_FREEZE_V0_1.md',
  'app/dome-world/previews/a15-r0/atlas-tutte-rank-generating-compression.js',
  'tests/ash-a15-r0-aperture-pedagogue-atlas-tutte-rank-generating-compression.test.mjs',
  'tests/ash-a15-r0-aperture-pedagogue-atlas-tutte-rank-generating-compression-hostile.test.mjs',
  'tests/ash-a15-r0-review-hardening.test.mjs',
]);
const historicalMutations=changed.filter(pathName=>!allowed.has(pathName));
assert.deepEqual(historicalMutations,[],`post-#928 Atlas Tutte compression chamber mutated inherited A15-R0 paths: ${historicalMutations.join(', ')}`);
assert.equal(changed.length,allowed.size,`Atlas Tutte compression chamber must contain exactly ${allowed.size} live paths; observed ${changed.length}`);
for(const pathName of allowed) assert.equal(changed.includes(pathName),true,`missing Atlas Tutte compression path: ${pathName}`);

// Mechanically replay the exact earned #928 hardening theorem tail while replacing only #928's ancestor-specific path audit.
const parentHardening=execFileSync('git',['show',`${PARENT_928_RECEIPT}:tests/ash-a15-r0-review-hardening.test.mjs`],{encoding:'utf8'});
const parentMarker="// Mechanically replay the exact earned #926 hardening theorem tail while replacing only #926's ancestor-specific path audit.";
const replayStart=parentHardening.indexOf(parentMarker);
assert.ok(replayStart>=0,'earned #928 hardening theorem tail must remain discoverable for descendant replay');
const parentTail=parentHardening.slice(replayStart);
const testsDir=path.dirname(fileURLToPath(import.meta.url));
const tempPath=path.join(testsDir,`.ash-a15-r0-parent-928-hardening-tail-${process.pid}.mjs`);
const tempSource=`import assert from 'node:assert/strict';\nimport fs from 'node:fs/promises';\nimport path from 'node:path';\nimport { execFileSync } from 'node:child_process';\nimport { fileURLToPath, pathToFileURL } from 'node:url';\nconst PARENT_926_RECEIPT='431898a8bc7f14c466f401d71dfe20feaaf7c447';\n${parentTail}`;
await fs.writeFile(tempPath,tempSource,'utf8');
try {
  await import(`${pathToFileURL(tempPath).href}?parent928=${Date.now()}`);
} finally {
  await fs.rm(tempPath,{force:true});
}

await import('./ash-a15-r0-aperture-pedagogue-atlas-tutte-rank-generating-compression.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-atlas-tutte-rank-generating-compression-hostile.test.mjs');

console.log('Ash A15-R0 Atlas Tutte rank-generating compression hardening tests passed.');
