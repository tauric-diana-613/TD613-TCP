import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const PARENT_973_RECEIPT='235770c9984c74e0b518fe69577bf1ceb1404fd3';
const PARENT_973_HARDENING_BLOB='62427d8daece2de921290d28b9e899c4a91f65f2';
function resolveScientificHead(){
  const parents=execFileSync('git',['show','-s','--format=%P','HEAD'],{encoding:'utf8'}).trim().split(/\s+/).filter(Boolean);
  if(parents.length===2){const candidate=parents[1];try{execFileSync('git',['merge-base','--is-ancestor',PARENT_973_RECEIPT,candidate],{stdio:'pipe'});return candidate;}catch{}}
  return 'HEAD';
}
const SCIENCE_HEAD=resolveScientificHead();
execFileSync('git',['cat-file','-e',`${PARENT_973_RECEIPT}^{commit}`],{stdio:'pipe'});
execFileSync('git',['merge-base','--is-ancestor',PARENT_973_RECEIPT,SCIENCE_HEAD],{stdio:'pipe'});
const ahead=Number(execFileSync('git',['rev-list','--count',`${PARENT_973_RECEIPT}..${SCIENCE_HEAD}`],{encoding:'utf8'}).trim());
assert.ok(ahead===10||ahead===11,'Atlas reciprocity chamber must be at hardened prefreeze or frozen successor depth');

const changed=execFileSync('git',['diff','--name-only',`${PARENT_973_RECEIPT}..${SCIENCE_HEAD}`,'--','app/dome-world/docs/ash/experiments/a15-r0','app/dome-world/previews/a15-r0','tests'],{encoding:'utf8'}).trim().split('\n').filter(Boolean).filter(p=>p.startsWith('app/dome-world/docs/ash/experiments/a15-r0/')||p.startsWith('app/dome-world/previews/a15-r0/')||p.startsWith('tests/ash-a15-r0-'));
const freezePath='app/dome-world/docs/ash/experiments/a15-r0/ATLAS_SCHUBERT_GAUSSIAN_DELANNOY_RECIPROCITY_FREEZE_V0_1.md';
const allowed=new Set([
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_SCHUBERT_GAUSSIAN_DELANNOY_RECIPROCITY_PREREGISTRATION_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_SCHUBERT_GAUSSIAN_DELANNOY_RECIPROCITY_EXPECTATIONS_V0_1.json',
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_SCHUBERT_GAUSSIAN_DELANNOY_RECIPROCITY_PREREGISTRATION_V0_2.md',
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_SCHUBERT_GAUSSIAN_DELANNOY_RECIPROCITY_EXPECTATIONS_V0_2.json',
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_SCHUBERT_GAUSSIAN_DELANNOY_RECIPROCITY_BURDEN_V0_1.md',
  freezePath,
  'app/dome-world/previews/a15-r0/atlas-schubert-gaussian-delannoy-reciprocity.js',
  'tests/ash-a15-r0-aperture-pedagogue-atlas-schubert-gaussian-delannoy-reciprocity.test.mjs',
  'tests/ash-a15-r0-aperture-pedagogue-atlas-schubert-gaussian-delannoy-reciprocity-hostile.test.mjs',
  'tests/ash-a15-r0-review-hardening.test.mjs',
]);
const historicalMutations=changed.filter(p=>!allowed.has(p));
assert.deepEqual(historicalMutations,[],`post-#973 reciprocity chamber mutated inherited A15-R0 paths: ${historicalMutations.join(', ')}`);
if(ahead===10){
  assert.equal(changed.includes(freezePath),false,'freeze path must not exist before terminal freeze commit');
  assert.equal(changed.length,9);
  for(const p of allowed)if(p!==freezePath)assert.equal(changed.includes(p),true,`missing prefreeze reciprocity path: ${p}`);
}else{
  assert.equal(changed.length,10);
  for(const p of allowed)assert.equal(changed.includes(p),true,`missing frozen reciprocity path: ${p}`);
}

const inheritedHardeningBlob=execFileSync('git',['rev-parse',`${PARENT_973_RECEIPT}:tests/ash-a15-r0-review-hardening.test.mjs`],{encoding:'utf8'}).trim();
assert.equal(inheritedHardeningBlob,PARENT_973_HARDENING_BLOB,'earned #973 hardening blob changed or cannot be verified exactly');

await import('./ash-a15-r0-aperture-pedagogue-atlas-schubert-gaussian-delannoy-reciprocity.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-atlas-schubert-gaussian-delannoy-reciprocity-hostile.test.mjs');
console.log('Ash A15-R0 Atlas Schubert Gaussian-Delannoy reciprocity hardening tests passed.');
