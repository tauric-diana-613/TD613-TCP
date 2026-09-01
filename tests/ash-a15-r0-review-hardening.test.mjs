import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PARENT_952_RECEIPT='4b731c16721b43e5319843da84955b3b80210cec';
function resolveScientificHead(){
  const parents=execFileSync('git',['show','-s','--format=%P','HEAD'],{encoding:'utf8'}).trim().split(/\s+/).filter(Boolean);
  if(parents.length===2){const candidate=parents[1];try{execFileSync('git',['merge-base','--is-ancestor',PARENT_952_RECEIPT,candidate],{stdio:'pipe'});return candidate;}catch{}}
  return 'HEAD';
}
const SCIENCE_HEAD=resolveScientificHead();
execFileSync('git',['cat-file','-e',`${PARENT_952_RECEIPT}^{commit}`],{stdio:'pipe'});
execFileSync('git',['merge-base','--is-ancestor',PARENT_952_RECEIPT,SCIENCE_HEAD],{stdio:'pipe'});
const ahead=Number(execFileSync('git',['rev-list','--count',`${PARENT_952_RECEIPT}..${SCIENCE_HEAD}`],{encoding:'utf8'}).trim());
assert.ok(ahead>=8,'Atlas HNF output-basis classification chamber must retain the eight preregistered/frozen successor commits');

const changed=execFileSync('git',['diff','--name-only',`${PARENT_952_RECEIPT}..${SCIENCE_HEAD}`,'--','app/dome-world/docs/ash/experiments/a15-r0','app/dome-world/previews/a15-r0','tests'],{encoding:'utf8'}).trim().split('\n').filter(Boolean).filter(p=>p.startsWith('app/dome-world/docs/ash/experiments/a15-r0/')||p.startsWith('app/dome-world/previews/a15-r0/')||p.startsWith('tests/ash-a15-r0-'));
const allowed=new Set([
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_HNF_OUTPUT_BASIS_CLASSIFICATION_PREREGISTRATION_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_HNF_OUTPUT_BASIS_CLASSIFICATION_EXPECTATIONS_V0_1.json',
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_HNF_OUTPUT_BASIS_CLASSIFICATION_BURDEN_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_HNF_OUTPUT_BASIS_CLASSIFICATION_FREEZE_V0_1.md',
  'app/dome-world/previews/a15-r0/atlas-hnf-output-basis-classification.js',
  'tests/ash-a15-r0-aperture-pedagogue-atlas-hnf-output-basis-classification.test.mjs',
  'tests/ash-a15-r0-aperture-pedagogue-atlas-hnf-output-basis-classification-hostile.test.mjs',
  'tests/ash-a15-r0-review-hardening.test.mjs',
]);
const historicalMutations=changed.filter(p=>!allowed.has(p));
assert.deepEqual(historicalMutations,[],`post-#952 HNF output-basis classification chamber mutated inherited A15-R0 paths: ${historicalMutations.join(', ')}`);
assert.equal(changed.length,allowed.size);
for(const p of allowed)assert.equal(changed.includes(p),true,`missing HNF output-basis classification path: ${p}`);

// Mechanically replay the exact earned #952 hardening theorem tail while replacing only #952's ancestor-specific path audit.
const parentHardening=execFileSync('git',['show',`${PARENT_952_RECEIPT}:tests/ash-a15-r0-review-hardening.test.mjs`],{encoding:'utf8'});
const parentMarker="// Mechanically replay the exact earned #950 hardening theorem tail while replacing only #950's ancestor-specific path audit.";
const replayStart=parentHardening.indexOf(parentMarker);
assert.ok(replayStart>=0,'earned #952 hardening theorem tail must remain discoverable for descendant replay');
const parentTail=parentHardening.slice(replayStart);
const testsDir=path.dirname(fileURLToPath(import.meta.url));
const tempPath=path.join(testsDir,`.ash-a15-r0-parent-952-hardening-tail-${process.pid}.mjs`);
const tempSource=`import assert from 'node:assert/strict';\nimport fs from 'node:fs/promises';\nimport path from 'node:path';\nimport { execFileSync } from 'node:child_process';\nimport { fileURLToPath, pathToFileURL } from 'node:url';\nconst PARENT_950_RECEIPT='c20ee814c02f5779b80560b229078b89e703dfae';\n${parentTail}`;
await fs.writeFile(tempPath,tempSource,'utf8');
try{await import(`${pathToFileURL(tempPath).href}?parent952=${Date.now()}`);}finally{await fs.rm(tempPath,{force:true});}

await import('./ash-a15-r0-aperture-pedagogue-atlas-hnf-output-basis-classification.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-atlas-hnf-output-basis-classification-hostile.test.mjs');
console.log('Ash A15-R0 Atlas HNF output-basis classification hardening tests passed.');
