import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PARENT_963_RECEIPT='d19d4f8d48c10df624f9c0574aeee9c687cfb4af';
function resolveScientificHead(){
  const parents=execFileSync('git',['show','-s','--format=%P','HEAD'],{encoding:'utf8'}).trim().split(/\s+/).filter(Boolean);
  if(parents.length===2){const candidate=parents[1];try{execFileSync('git',['merge-base','--is-ancestor',PARENT_963_RECEIPT,candidate],{stdio:'pipe'});return candidate;}catch{}}
  return 'HEAD';
}
const SCIENCE_HEAD=resolveScientificHead();
execFileSync('git',['cat-file','-e',`${PARENT_963_RECEIPT}^{commit}`],{stdio:'pipe'});
execFileSync('git',['merge-base','--is-ancestor',PARENT_963_RECEIPT,SCIENCE_HEAD],{stdio:'pipe'});
const ahead=Number(execFileSync('git',['rev-list','--count',`${PARENT_963_RECEIPT}..${SCIENCE_HEAD}`],{encoding:'utf8'}).trim());
assert.ok(ahead>=8,'Atlas Schubert closure-poset chamber must retain the eight preregistered/frozen successor commits');

const changed=execFileSync('git',['diff','--name-only',`${PARENT_963_RECEIPT}..${SCIENCE_HEAD}`,'--','app/dome-world/docs/ash/experiments/a15-r0','app/dome-world/previews/a15-r0','tests'],{encoding:'utf8'}).trim().split('\n').filter(Boolean).filter(p=>p.startsWith('app/dome-world/docs/ash/experiments/a15-r0/')||p.startsWith('app/dome-world/previews/a15-r0/')||p.startsWith('tests/ash-a15-r0-'));
const allowed=new Set([
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_SCHUBERT_CLOSURE_POSET_PREREGISTRATION_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_SCHUBERT_CLOSURE_POSET_EXPECTATIONS_V0_1.json',
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_SCHUBERT_CLOSURE_POSET_BURDEN_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_SCHUBERT_CLOSURE_POSET_FREEZE_V0_1.md',
  'app/dome-world/previews/a15-r0/atlas-schubert-closure-poset.js',
  'tests/ash-a15-r0-aperture-pedagogue-atlas-schubert-closure-poset.test.mjs',
  'tests/ash-a15-r0-aperture-pedagogue-atlas-schubert-closure-poset-hostile.test.mjs',
  'tests/ash-a15-r0-review-hardening.test.mjs',
]);
const historicalMutations=changed.filter(p=>!allowed.has(p));
assert.deepEqual(historicalMutations,[],`post-#963 Schubert closure-poset chamber mutated inherited A15-R0 paths: ${historicalMutations.join(', ')}`);
assert.equal(changed.length,allowed.size);
for(const p of allowed)assert.equal(changed.includes(p),true,`missing Schubert closure-poset path: ${p}`);

// Mechanically replay the exact earned #963 hardening theorem tail while replacing only #963's ancestor-specific path audit.
const parentHardening=execFileSync('git',['show',`${PARENT_963_RECEIPT}:tests/ash-a15-r0-review-hardening.test.mjs`],{encoding:'utf8'});
const parentMarker="// Mechanically replay the exact earned #960 hardening theorem tail while replacing only #960's ancestor-specific path audit.";
const replayStart=parentHardening.indexOf(parentMarker);
assert.ok(replayStart>=0,'earned #963 hardening theorem tail must remain discoverable for descendant replay');
const parentTail=parentHardening.slice(replayStart);
const testsDir=path.dirname(fileURLToPath(import.meta.url));
const tempPath=path.join(testsDir,`.ash-a15-r0-parent-963-hardening-tail-${process.pid}.mjs`);
const tempSource=`import assert from 'node:assert/strict';\nimport fs from 'node:fs/promises';\nimport path from 'node:path';\nimport { execFileSync } from 'node:child_process';\nimport { fileURLToPath, pathToFileURL } from 'node:url';\nconst PARENT_960_RECEIPT='0372405b055bcdff990f715cc65eed9354b2a4a0';\n${parentTail}`;
await fs.writeFile(tempPath,tempSource,'utf8');
try{await import(`${pathToFileURL(tempPath).href}?parent963=${Date.now()}`);}finally{await fs.rm(tempPath,{force:true});}

await import('./ash-a15-r0-aperture-pedagogue-atlas-schubert-closure-poset.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-atlas-schubert-closure-poset-hostile.test.mjs');
console.log('Ash A15-R0 Atlas Schubert closure-poset correspondence hardening tests passed.');
