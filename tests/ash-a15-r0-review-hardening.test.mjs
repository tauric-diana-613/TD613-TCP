import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const PARENT_978_RECEIPT='3c3a3dac296a819fad7c896fc2042510a6709ea9';
const PARENT_978_HARDENING_BLOB='0afd2d220bf812e88157b00ce4641feea99c5633';
function resolveScientificHead(){
  const parents=execFileSync('git',['show','-s','--format=%P','HEAD'],{encoding:'utf8'}).trim().split(/\s+/).filter(Boolean);
  if(parents.length===2){const candidate=parents[1];try{execFileSync('git',['merge-base','--is-ancestor',PARENT_978_RECEIPT,candidate],{stdio:'pipe'});return candidate;}catch{}}
  return 'HEAD';
}
const SCIENCE_HEAD=resolveScientificHead();
execFileSync('git',['cat-file','-e',`${PARENT_978_RECEIPT}^{commit}`],{stdio:'pipe'});
execFileSync('git',['merge-base','--is-ancestor',PARENT_978_RECEIPT,SCIENCE_HEAD],{stdio:'pipe'});
const ahead=Number(execFileSync('git',['rev-list','--count',`${PARENT_978_RECEIPT}..${SCIENCE_HEAD}`],{encoding:'utf8'}).trim());
assert.ok(ahead===7||ahead===8,'Atlas C2 palindromic-folding chamber must be at hardened prefreeze or frozen successor depth');

const changed=execFileSync('git',['diff','--name-only',`${PARENT_978_RECEIPT}..${SCIENCE_HEAD}`,'--','app/dome-world/docs/ash/experiments/a15-r0','app/dome-world/previews/a15-r0','tests'],{encoding:'utf8'}).trim().split('\n').filter(Boolean).filter(p=>p.startsWith('app/dome-world/docs/ash/experiments/a15-r0/')||p.startsWith('app/dome-world/previews/a15-r0/')||p.startsWith('tests/ash-a15-r0-'));
const freezePath='app/dome-world/docs/ash/experiments/a15-r0/ATLAS_SCHUBERT_C2_PALINDROMIC_FOLDING_FREEZE_V0_1.md';
const allowed=new Set([
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_SCHUBERT_C2_PALINDROMIC_FOLDING_PREREGISTRATION_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_SCHUBERT_C2_PALINDROMIC_FOLDING_EXPECTATIONS_V0_1.json',
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_SCHUBERT_C2_PALINDROMIC_FOLDING_BURDEN_V0_1.md',
  freezePath,
  'app/dome-world/previews/a15-r0/atlas-schubert-c2-palindromic-folding.js',
  'tests/ash-a15-r0-aperture-pedagogue-atlas-schubert-c2-palindromic-folding.test.mjs',
  'tests/ash-a15-r0-aperture-pedagogue-atlas-schubert-c2-palindromic-folding-hostile.test.mjs',
  'tests/ash-a15-r0-review-hardening.test.mjs',
]);
const historicalMutations=changed.filter(p=>!allowed.has(p));
assert.deepEqual(historicalMutations,[],`post-#978 palindromic-folding chamber mutated inherited A15-R0 paths: ${historicalMutations.join(', ')}`);
if(ahead===7){assert.equal(changed.includes(freezePath),false);assert.equal(changed.length,7);for(const p of allowed)if(p!==freezePath)assert.equal(changed.includes(p),true,`missing prefreeze palindromic-folding path: ${p}`);}else{assert.equal(changed.length,8);for(const p of allowed)assert.equal(changed.includes(p),true,`missing frozen palindromic-folding path: ${p}`);}

const inheritedHardeningBlob=execFileSync('git',['rev-parse',`${PARENT_978_RECEIPT}:tests/ash-a15-r0-review-hardening.test.mjs`],{encoding:'utf8'}).trim();
assert.equal(inheritedHardeningBlob,PARENT_978_HARDENING_BLOB,'earned #978 hardening blob changed or cannot be verified exactly');

await import('./ash-a15-r0-aperture-pedagogue-atlas-schubert-c2-palindromic-folding.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-atlas-schubert-c2-palindromic-folding-hostile.test.mjs');
console.log('Ash A15-R0 Atlas Schubert C2 palindromic-folding hardening tests passed.');
