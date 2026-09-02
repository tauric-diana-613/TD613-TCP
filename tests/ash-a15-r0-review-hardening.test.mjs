import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const PARENT_986_RECEIPT='783fdf0c6fa0a75607e23845700c0963bca6e575';
const PARENT_986_HARDENING_BLOB='5f4b7d9d2b038771d323c96296617f8ca4754341';
const FEASIBLE_REGION_BLOB='0b349933fa4b4b073ad6239435f6c46f8e5f29d4';
const GEOMETRY_986_BLOB='10da68f064a49f658a534a37a72fd716a8638429';
const HUSH_RECEIPT_BLOB='e0f1464cf2d18071e97fe17ecd2abb0e6d3672c9';
const HUSH_TRIALS_BLOB='48d01568a87064249512279a6eda86d9a4cc1c0b';
const SUEZ_DERIVATIVE_BLOB='1f1e6391cd706cdc46e9c954af70abbbc5bf061b';
function resolveScientificHead(){const parents=execFileSync('git',['show','-s','--format=%P','HEAD'],{encoding:'utf8'}).trim().split(/\s+/).filter(Boolean);if(parents.length===2){const candidate=parents[1];try{execFileSync('git',['merge-base','--is-ancestor',PARENT_986_RECEIPT,candidate],{stdio:'pipe'});return candidate;}catch{}}return 'HEAD';}
const SCIENCE_HEAD=resolveScientificHead();
execFileSync('git',['cat-file','-e',`${PARENT_986_RECEIPT}^{commit}`],{stdio:'pipe'});
execFileSync('git',['merge-base','--is-ancestor',PARENT_986_RECEIPT,SCIENCE_HEAD],{stdio:'pipe'});
const ahead=Number(execFileSync('git',['rev-list','--count',`${PARENT_986_RECEIPT}..${SCIENCE_HEAD}`],{encoding:'utf8'}).trim());
assert.ok(ahead===8||ahead===9,'Golden Egg co-observation chamber must be at hardened or frozen depth');

const changed=execFileSync('git',['diff','--name-only',`${PARENT_986_RECEIPT}..${SCIENCE_HEAD}`,'--','app/dome-world/docs/ash/experiments/a15-r0','app/dome-world/previews/a15-r0','tests'],{encoding:'utf8'}).trim().split('\n').filter(Boolean).filter(p=>p.startsWith('app/dome-world/docs/ash/experiments/a15-r0/')||p.startsWith('app/dome-world/previews/a15-r0/')||p.startsWith('tests/ash-a15-r0-'));
const freezePath='app/dome-world/docs/ash/experiments/a15-r0/GOLDEN_EGG_COOBSERVATION_ADMISSIBILITY_FREEZE_V0_1.md';
const allowed=new Set([
  'app/dome-world/docs/ash/experiments/a15-r0/GOLDEN_EGG_COOBSERVATION_ADMISSIBILITY_PREREGISTRATION_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/GOLDEN_EGG_COOBSERVATION_ADMISSIBILITY_EXPECTATIONS_V0_1.json',
  'app/dome-world/docs/ash/experiments/a15-r0/GOLDEN_EGG_COOBSERVATION_ADMISSIBILITY_BURDEN_V0_1.md',
  freezePath,
  'app/dome-world/previews/a15-r0/golden-egg-coobservation-admissibility.js',
  'tests/ash-a15-r0-golden-egg-coobservation-admissibility.test.mjs',
  'tests/ash-a15-r0-golden-egg-coobservation-admissibility-hostile.test.mjs',
  'tests/ash-a15-r0-review-hardening.test.mjs'
]);
assert.deepEqual(changed.filter(p=>!allowed.has(p)),[],'Golden Egg co-observation chamber mutated unregistered A15-R0 paths');
if(ahead===8){assert.equal(changed.includes(freezePath),false);assert.equal(changed.length,7);for(const p of allowed)if(p!==freezePath)assert.equal(changed.includes(p),true,`missing prefreeze co-observation path: ${p}`);}else{assert.equal(changed.length,8);for(const p of allowed)assert.equal(changed.includes(p),true,`missing frozen co-observation path: ${p}`);}

const inherited=execFileSync('git',['rev-parse',`${PARENT_986_RECEIPT}:tests/ash-a15-r0-review-hardening.test.mjs`],{encoding:'utf8'}).trim();
assert.equal(inherited,PARENT_986_HARDENING_BLOB,'earned #986 hardening blob changed or cannot be verified exactly');
const sourceBlobs=[
  ['app/dome-world/previews/a15-r0/golden-egg-feasible-region.js',FEASIBLE_REGION_BLOB],
  ['app/dome-world/previews/a15-r0/golden-egg-metric-connection-reopening.js',GEOMETRY_986_BLOB],
  ['docs/ASH_KEEP_HUSH_INTERVENTION_RECEIPT.md',HUSH_RECEIPT_BLOB],
  ['app/engine/hush-intervention-trials.js',HUSH_TRIALS_BLOB],
  ['packages/dome_world_exact/fixtures/a15-r0/SRC/03-DERIVATIVES/text/zenodo/zenodo-22019413-file-0.md',SUEZ_DERIVATIVE_BLOB]
];
for(const [path,expected] of sourceBlobs){const actual=execFileSync('git',['rev-parse',`${PARENT_986_RECEIPT}:${path}`],{encoding:'utf8'}).trim();assert.equal(actual,expected,`inherited source blob moved: ${path}`);}

await import('./ash-a15-r0-golden-egg-coobservation-admissibility.test.mjs');
await import('./ash-a15-r0-golden-egg-coobservation-admissibility-hostile.test.mjs');
console.log('Ash A15-R0 Golden Egg co-observation admissibility hardening tests passed.');
