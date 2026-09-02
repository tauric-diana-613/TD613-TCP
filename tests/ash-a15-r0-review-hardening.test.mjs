import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const PARENT_990_RECEIPT='28ba14628326db37282d3d78335d6ee707b087b4';
const PARENT_990_HARDENING_BLOB='39a7b9f1f6e837c80dc021214dd089752ab25144';
const PARENT_990_SOURCE_BLOB='8f12e24b4a0a7598449a6c732a90bd4b875e630c';
const LOOM_MAIN_COMMIT='d652c5e151471be7e40ff6a08936ba26c0cef1ad';
const LOOM_MAIN_PATH='app/dome-world/index.html';
const LOOM_MAIN_BLOB='695d22ec77339bc54512fe6a6a7c0203240ff135';

function resolveScientificHead(){
  const parents=execFileSync('git',['show','-s','--format=%P','HEAD'],{encoding:'utf8'}).trim().split(/\s+/).filter(Boolean);
  if(parents.length===2){
    const candidate=parents[1];
    try{execFileSync('git',['merge-base','--is-ancestor',PARENT_990_RECEIPT,candidate],{stdio:'pipe'});return candidate;}catch{}
  }
  return 'HEAD';
}
const SCIENCE_HEAD=resolveScientificHead();

execFileSync('git',['cat-file','-e',`${PARENT_990_RECEIPT}^{commit}`],{stdio:'pipe'});
execFileSync('git',['merge-base','--is-ancestor',PARENT_990_RECEIPT,SCIENCE_HEAD],{stdio:'pipe'});
const ahead=Number(execFileSync('git',['rev-list','--count',`${PARENT_990_RECEIPT}..${SCIENCE_HEAD}`],{encoding:'utf8'}).trim());
assert.equal(ahead,1,'Loom-compatible Golden Egg acquisition chamber must remain one atomic science commit above earned #990');

const changed=execFileSync('git',['diff','--name-only',`${PARENT_990_RECEIPT}..${SCIENCE_HEAD}`,'--','app/dome-world/docs/ash/experiments/a15-r0','app/dome-world/previews/a15-r0','tests'],{encoding:'utf8'}).trim().split('\n').filter(Boolean).filter(p=>p.startsWith('app/dome-world/docs/ash/experiments/a15-r0/')||p.startsWith('app/dome-world/previews/a15-r0/')||p.startsWith('tests/ash-a15-r0-'));
const allowed=new Set([
  'app/dome-world/docs/ash/experiments/a15-r0/LOOM_GOLDEN_EGG_SAME_EPISODE_ACQUISITION_PREREGISTRATION_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/LOOM_GOLDEN_EGG_SAME_EPISODE_ACQUISITION_EXPECTATIONS_V0_1.json',
  'app/dome-world/docs/ash/experiments/a15-r0/LOOM_GOLDEN_EGG_SAME_EPISODE_ACQUISITION_BURDEN_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/LOOM_GOLDEN_EGG_SAME_EPISODE_ACQUISITION_FREEZE_V0_1.md',
  'app/dome-world/previews/a15-r0/loom-golden-egg-same-episode-acquisition.js',
  'tests/ash-a15-r0-loom-golden-egg-same-episode-acquisition.test.mjs',
  'tests/ash-a15-r0-loom-golden-egg-same-episode-acquisition-hostile.test.mjs',
  'tests/ash-a15-r0-review-hardening.test.mjs'
]);
assert.equal(changed.length,8,'Loom-compatible Golden Egg acquisition chamber must remain exactly eight registered A15-R0 paths');
for(const p of allowed)assert.equal(changed.includes(p),true,`missing frozen Loom acquisition path: ${p}`);
assert.deepEqual(changed.filter(p=>!allowed.has(p)),[],'Loom-compatible Golden Egg acquisition chamber mutated unregistered A15-R0 paths');

const inheritedHardening=execFileSync('git',['rev-parse',`${PARENT_990_RECEIPT}:tests/ash-a15-r0-review-hardening.test.mjs`],{encoding:'utf8'}).trim();
assert.equal(inheritedHardening,PARENT_990_HARDENING_BLOB,'earned #990 hardening blob changed or cannot be verified exactly');
const parentSource=execFileSync('git',['rev-parse',`${PARENT_990_RECEIPT}:app/dome-world/previews/a15-r0/golden-egg-evidence-closure-nogo.js`],{encoding:'utf8'}).trim();
assert.equal(parentSource,PARENT_990_SOURCE_BLOB,'earned #990 no-go source blob moved');

execFileSync('git',['cat-file','-e',`${LOOM_MAIN_COMMIT}^{commit}`],{stdio:'pipe'});
const liveLoomBlob=execFileSync('git',['rev-parse',`${LOOM_MAIN_COMMIT}:${LOOM_MAIN_PATH}`],{encoding:'utf8'}).trim();
assert.equal(liveLoomBlob,LOOM_MAIN_BLOB,'live Loom source custody changed from frozen main receipt');

const changedAll=execFileSync('git',['diff','--name-only',`${PARENT_990_RECEIPT}..${SCIENCE_HEAD}`],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
assert.equal(changedAll.includes(LOOM_MAIN_PATH),false,'convergence contract must not mutate live Loom runtime');

await import('./ash-a15-r0-loom-golden-egg-same-episode-acquisition.test.mjs');
await import('./ash-a15-r0-loom-golden-egg-same-episode-acquisition-hostile.test.mjs');
console.log('Ash A15-R0 Loom-compatible Golden Egg same-episode acquisition hardening tests passed.');
