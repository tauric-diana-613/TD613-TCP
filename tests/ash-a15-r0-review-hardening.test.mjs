import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const PARENT_971_RECEIPT='00b3772c46181747dbb5f7101a5a11f7bf4ba6b9';
const PARENT_971_HARDENING_BLOB='809ebe12aa4c26ab0b151fa0fe07689e2a4d73af';
function resolveScientificHead(){
  const parents=execFileSync('git',['show','-s','--format=%P','HEAD'],{encoding:'utf8'}).trim().split(/\s+/).filter(Boolean);
  if(parents.length===2){const candidate=parents[1];try{execFileSync('git',['merge-base','--is-ancestor',PARENT_971_RECEIPT,candidate],{stdio:'pipe'});return candidate;}catch{}}
  return 'HEAD';
}
const SCIENCE_HEAD=resolveScientificHead();
execFileSync('git',['cat-file','-e',`${PARENT_971_RECEIPT}^{commit}`],{stdio:'pipe'});
execFileSync('git',['merge-base','--is-ancestor',PARENT_971_RECEIPT,SCIENCE_HEAD],{stdio:'pipe'});
const ahead=Number(execFileSync('git',['rev-list','--count',`${PARENT_971_RECEIPT}..${SCIENCE_HEAD}`],{encoding:'utf8'}).trim());
assert.ok(ahead===7||ahead===8||ahead===9||ahead===10,'Atlas Schubert Gaussian-Delannoy chamber must be at hardening, frozen, or documented post-RED repair successor depth');

const changed=execFileSync('git',['diff','--name-only',`${PARENT_971_RECEIPT}..${SCIENCE_HEAD}`,'--','app/dome-world/docs/ash/experiments/a15-r0','app/dome-world/previews/a15-r0','tests'],{encoding:'utf8'}).trim().split('\n').filter(Boolean).filter(p=>p.startsWith('app/dome-world/docs/ash/experiments/a15-r0/')||p.startsWith('app/dome-world/previews/a15-r0/')||p.startsWith('tests/ash-a15-r0-'));
const freezePath='app/dome-world/docs/ash/experiments/a15-r0/ATLAS_SCHUBERT_GAUSSIAN_DELANNOY_FREEZE_V0_1.md';
const allowed=new Set([
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_SCHUBERT_GAUSSIAN_DELANNOY_PREREGISTRATION_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_SCHUBERT_GAUSSIAN_DELANNOY_EXPECTATIONS_V0_1.json',
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_SCHUBERT_GAUSSIAN_DELANNOY_BURDEN_V0_1.md',
  freezePath,
  'app/dome-world/previews/a15-r0/atlas-schubert-gaussian-delannoy.js',
  'tests/ash-a15-r0-aperture-pedagogue-atlas-schubert-gaussian-delannoy.test.mjs',
  'tests/ash-a15-r0-aperture-pedagogue-atlas-schubert-gaussian-delannoy-hostile.test.mjs',
  'tests/ash-a15-r0-review-hardening.test.mjs',
]);
const historicalMutations=changed.filter(p=>!allowed.has(p));
assert.deepEqual(historicalMutations,[],`post-#971 Gaussian-Delannoy chamber mutated inherited A15-R0 paths: ${historicalMutations.join(', ')}`);
if(ahead===7){
  assert.equal(changed.includes(freezePath),false,'freeze path must not exist before terminal freeze commit');
  assert.equal(changed.length,7);
  for(const p of allowed)if(p!==freezePath)assert.equal(changed.includes(p),true,`missing prefreeze Gaussian-Delannoy path: ${p}`);
}else{
  assert.equal(changed.length,allowed.size);
  for(const p of allowed)assert.equal(changed.includes(p),true,`missing frozen/repaired Gaussian-Delannoy path: ${p}`);
}

// Pin inherited hardening by exact earned blob instead of recursively executing ancestral hardening tails.
// INHERITED_CUSTODY != REQUIRED_REEXECUTION_OF_FULL_ANCESTRY
const inheritedHardeningBlob=execFileSync('git',['rev-parse',`${PARENT_971_RECEIPT}:tests/ash-a15-r0-review-hardening.test.mjs`],{encoding:'utf8'}).trim();
assert.equal(inheritedHardeningBlob,PARENT_971_HARDENING_BLOB,'earned #971 hardening blob changed or cannot be verified exactly');

// Post-RED repair commits are transparent successors on the same eight-path chamber surface.
// TRANSPARENT_REPAIR_COMMIT != ANCESTRY_LAUNDERING
if(ahead>=9)assert.equal(changed.length,allowed.size,'post-RED repair must not widen the eight-path chamber surface');

await import('./ash-a15-r0-aperture-pedagogue-atlas-schubert-gaussian-delannoy.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-atlas-schubert-gaussian-delannoy-hostile.test.mjs');
console.log('Ash A15-R0 Atlas Schubert Gaussian-Delannoy deformation hardening tests passed.');
