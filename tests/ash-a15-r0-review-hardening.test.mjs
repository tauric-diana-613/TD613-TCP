import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const PARENT_988_RECEIPT='4474b65c5ecd6dfc8c19cbaf0146bfdeea078a4d';
const PARENT_988_HARDENING_BLOB='22a142ab4a85cf29e366ec2961e3cf4d2e41b708';
const PARENT_COOBSERVATION_BLOB='5a6a0f6bc7503212115ee40cb77d69341e609d55';
function resolveScientificHead(){const parents=execFileSync('git',['show','-s','--format=%P','HEAD'],{encoding:'utf8'}).trim().split(/\s+/).filter(Boolean);if(parents.length===2){const candidate=parents[1];try{execFileSync('git',['merge-base','--is-ancestor',PARENT_988_RECEIPT,candidate],{stdio:'pipe'});return candidate;}catch{}}return 'HEAD';}
const SCIENCE_HEAD=resolveScientificHead();
execFileSync('git',['cat-file','-e',`${PARENT_988_RECEIPT}^{commit}`],{stdio:'pipe'});
execFileSync('git',['merge-base','--is-ancestor',PARENT_988_RECEIPT,SCIENCE_HEAD],{stdio:'pipe'});
const ahead=Number(execFileSync('git',['rev-list','--count',`${PARENT_988_RECEIPT}..${SCIENCE_HEAD}`],{encoding:'utf8'}).trim());
assert.equal(ahead,1,'Golden Egg evidence-closure no-go chamber must remain one atomic science commit above earned #988');

const changed=execFileSync('git',['diff','--name-only',`${PARENT_988_RECEIPT}..${SCIENCE_HEAD}`,'--','app/dome-world/docs/ash/experiments/a15-r0','app/dome-world/previews/a15-r0','tests'],{encoding:'utf8'}).trim().split('\n').filter(Boolean).filter(p=>p.startsWith('app/dome-world/docs/ash/experiments/a15-r0/')||p.startsWith('app/dome-world/previews/a15-r0/')||p.startsWith('tests/ash-a15-r0-'));
const allowed=new Set([
  'app/dome-world/docs/ash/experiments/a15-r0/GOLDEN_EGG_EVIDENCE_CLOSURE_NOGO_PREREGISTRATION_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/GOLDEN_EGG_EVIDENCE_CLOSURE_NOGO_EXPECTATIONS_V0_1.json',
  'app/dome-world/docs/ash/experiments/a15-r0/GOLDEN_EGG_EVIDENCE_CLOSURE_NOGO_BURDEN_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/GOLDEN_EGG_EVIDENCE_CLOSURE_NOGO_FREEZE_V0_1.md',
  'app/dome-world/previews/a15-r0/golden-egg-evidence-closure-nogo.js',
  'tests/ash-a15-r0-golden-egg-evidence-closure-nogo.test.mjs',
  'tests/ash-a15-r0-golden-egg-evidence-closure-nogo-hostile.test.mjs',
  'tests/ash-a15-r0-review-hardening.test.mjs'
]);
assert.equal(changed.length,8,'Golden Egg evidence-closure no-go chamber must remain exactly eight registered paths');
for(const p of allowed)assert.equal(changed.includes(p),true,`missing frozen no-go path: ${p}`);
assert.deepEqual(changed.filter(p=>!allowed.has(p)),[],'Golden Egg evidence-closure no-go chamber mutated unregistered A15-R0 paths');

const inherited=execFileSync('git',['rev-parse',`${PARENT_988_RECEIPT}:tests/ash-a15-r0-review-hardening.test.mjs`],{encoding:'utf8'}).trim();
assert.equal(inherited,PARENT_988_HARDENING_BLOB,'earned #988 hardening blob changed or cannot be verified exactly');
const coobs=execFileSync('git',['rev-parse',`${PARENT_988_RECEIPT}:app/dome-world/previews/a15-r0/golden-egg-coobservation-admissibility.js`],{encoding:'utf8'}).trim();
assert.equal(coobs,PARENT_COOBSERVATION_BLOB,'earned #988 co-observation certificate source moved');

await import('./ash-a15-r0-golden-egg-evidence-closure-nogo.test.mjs');
await import('./ash-a15-r0-golden-egg-evidence-closure-nogo-hostile.test.mjs');
console.log('Ash A15-R0 Golden Egg evidence-closure no-go hardening tests passed.');
