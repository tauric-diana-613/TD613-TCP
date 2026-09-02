import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const PARENT_976_RECEIPT='5cdbbd3713ccf5798523ff96d6db75df0367fadd';
const PARENT_976_HARDENING_BLOB='bf5a4c95aae6e4a9690085377187425d43536610';
function resolveScientificHead(){
  const parents=execFileSync('git',['show','-s','--format=%P','HEAD'],{encoding:'utf8'}).trim().split(/\s+/).filter(Boolean);
  if(parents.length===2){const candidate=parents[1];try{execFileSync('git',['merge-base','--is-ancestor',PARENT_976_RECEIPT,candidate],{stdio:'pipe'});return candidate;}catch{}}
  return 'HEAD';
}
const SCIENCE_HEAD=resolveScientificHead();
execFileSync('git',['cat-file','-e',`${PARENT_976_RECEIPT}^{commit}`],{stdio:'pipe'});
execFileSync('git',['merge-base','--is-ancestor',PARENT_976_RECEIPT,SCIENCE_HEAD],{stdio:'pipe'});
const ahead=Number(execFileSync('git',['rev-list','--count',`${PARENT_976_RECEIPT}..${SCIENCE_HEAD}`],{encoding:'utf8'}).trim());
assert.ok(ahead===7||ahead===8,'Atlas reciprocity cyclic-sieving chamber must be at hardened prefreeze or frozen successor depth');

const changed=execFileSync('git',['diff','--name-only',`${PARENT_976_RECEIPT}..${SCIENCE_HEAD}`,'--','app/dome-world/docs/ash/experiments/a15-r0','app/dome-world/previews/a15-r0','tests'],{encoding:'utf8'}).trim().split('\n').filter(Boolean).filter(p=>p.startsWith('app/dome-world/docs/ash/experiments/a15-r0/')||p.startsWith('app/dome-world/previews/a15-r0/')||p.startsWith('tests/ash-a15-r0-'));
const freezePath='app/dome-world/docs/ash/experiments/a15-r0/ATLAS_SCHUBERT_RECIPROCITY_CYCLIC_SIEVING_FREEZE_V0_1.md';
const allowed=new Set([
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_SCHUBERT_RECIPROCITY_CYCLIC_SIEVING_PREREGISTRATION_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_SCHUBERT_RECIPROCITY_CYCLIC_SIEVING_EXPECTATIONS_V0_1.json',
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_SCHUBERT_RECIPROCITY_CYCLIC_SIEVING_BURDEN_V0_1.md',
  freezePath,
  'app/dome-world/previews/a15-r0/atlas-schubert-reciprocity-cyclic-sieving.js',
  'tests/ash-a15-r0-aperture-pedagogue-atlas-schubert-reciprocity-cyclic-sieving.test.mjs',
  'tests/ash-a15-r0-aperture-pedagogue-atlas-schubert-reciprocity-cyclic-sieving-hostile.test.mjs',
  'tests/ash-a15-r0-review-hardening.test.mjs',
]);
const historicalMutations=changed.filter(p=>!allowed.has(p));
assert.deepEqual(historicalMutations,[],`post-#976 cyclic-sieving chamber mutated inherited A15-R0 paths: ${historicalMutations.join(', ')}`);
if(ahead===7){assert.equal(changed.includes(freezePath),false);assert.equal(changed.length,7);for(const p of allowed)if(p!==freezePath)assert.equal(changed.includes(p),true,`missing prefreeze CSP path: ${p}`);}else{assert.equal(changed.length,8);for(const p of allowed)assert.equal(changed.includes(p),true,`missing frozen CSP path: ${p}`);}

const inheritedHardeningBlob=execFileSync('git',['rev-parse',`${PARENT_976_RECEIPT}:tests/ash-a15-r0-review-hardening.test.mjs`],{encoding:'utf8'}).trim();
assert.equal(inheritedHardeningBlob,PARENT_976_HARDENING_BLOB,'earned #976 hardening blob changed or cannot be verified exactly');

await import('./ash-a15-r0-aperture-pedagogue-atlas-schubert-reciprocity-cyclic-sieving.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-atlas-schubert-reciprocity-cyclic-sieving-hostile.test.mjs');
console.log('Ash A15-R0 Atlas Schubert reciprocity C2 cyclic-sieving hardening tests passed.');
