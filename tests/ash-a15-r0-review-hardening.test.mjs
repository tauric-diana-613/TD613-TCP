import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const PARENT_984_RECEIPT='c0ef84c5c48af37a8f79d89c80d2e055da707836';
const PARENT_984_HARDENING_BLOB='c408861854ce74e81765c0fc88ad167a86caa4c7';
const CONNECTION_BLOB='94564c0ee712115de348b249fa9e775a04475103';
const HOLONOMY_ACTION_BLOB='6319d6118dbe4eca24124979daa34582f3de49c7';
const GOLDEN_EGG_REST_BLOB='bf02a8ff157d9f275536d7b161fa93b223ba2d55';
function resolveScientificHead(){const parents=execFileSync('git',['show','-s','--format=%P','HEAD'],{encoding:'utf8'}).trim().split(/\s+/).filter(Boolean);if(parents.length===2){const candidate=parents[1];try{execFileSync('git',['merge-base','--is-ancestor',PARENT_984_RECEIPT,candidate],{stdio:'pipe'});return candidate;}catch{}}return 'HEAD';}
const SCIENCE_HEAD=resolveScientificHead();
execFileSync('git',['cat-file','-e',`${PARENT_984_RECEIPT}^{commit}`],{stdio:'pipe'});
execFileSync('git',['merge-base','--is-ancestor',PARENT_984_RECEIPT,SCIENCE_HEAD],{stdio:'pipe'});
const ahead=Number(execFileSync('git',['rev-list','--count',`${PARENT_984_RECEIPT}..${SCIENCE_HEAD}`],{encoding:'utf8'}).trim());
assert.ok(ahead===7||ahead===8,'Golden Egg metric-connection reopening chamber must be at hardened or frozen depth');

const changed=execFileSync('git',['diff','--name-only',`${PARENT_984_RECEIPT}..${SCIENCE_HEAD}`,'--','app/dome-world/docs/ash/experiments/a15-r0','app/dome-world/previews/a15-r0','tests'],{encoding:'utf8'}).trim().split('\n').filter(Boolean).filter(p=>p.startsWith('app/dome-world/docs/ash/experiments/a15-r0/')||p.startsWith('app/dome-world/previews/a15-r0/')||p.startsWith('tests/ash-a15-r0-'));
const freezePath='app/dome-world/docs/ash/experiments/a15-r0/GOLDEN_EGG_METRIC_CONNECTION_REOPENING_FREEZE_V0_1.md';
const allowed=new Set([
  'app/dome-world/docs/ash/experiments/a15-r0/GOLDEN_EGG_METRIC_CONNECTION_REOPENING_PREREGISTRATION_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/GOLDEN_EGG_METRIC_CONNECTION_REOPENING_EXPECTATIONS_V0_1.json',
  'app/dome-world/docs/ash/experiments/a15-r0/GOLDEN_EGG_METRIC_CONNECTION_REOPENING_BURDEN_V0_1.md',
  freezePath,
  'app/dome-world/previews/a15-r0/golden-egg-metric-connection-reopening.js',
  'tests/ash-a15-r0-golden-egg-metric-connection-reopening.test.mjs',
  'tests/ash-a15-r0-golden-egg-metric-connection-reopening-hostile.test.mjs',
  'tests/ash-a15-r0-review-hardening.test.mjs'
]);
assert.deepEqual(changed.filter(p=>!allowed.has(p)),[],'Golden Egg reopening chamber mutated unregistered A15-R0 paths');
if(ahead===7){assert.equal(changed.includes(freezePath),false);assert.equal(changed.length,7);for(const p of allowed)if(p!==freezePath)assert.equal(changed.includes(p),true,`missing prefreeze Golden Egg reopening path: ${p}`);}else{assert.equal(changed.length,8);for(const p of allowed)assert.equal(changed.includes(p),true,`missing frozen Golden Egg reopening path: ${p}`);}

const inheritedHardening=execFileSync('git',['rev-parse',`${PARENT_984_RECEIPT}:tests/ash-a15-r0-review-hardening.test.mjs`],{encoding:'utf8'}).trim();
assert.equal(inheritedHardening,PARENT_984_HARDENING_BLOB,'earned #984 hardening blob changed or cannot be verified exactly');
const connectionBlob=execFileSync('git',['rev-parse',`${PARENT_984_RECEIPT}:app/dome-world/previews/a15-r0/bidirectional-discrete-connection-candidate.js`],{encoding:'utf8'}).trim();
const actionBlob=execFileSync('git',['rev-parse',`${PARENT_984_RECEIPT}:app/dome-world/previews/a15-r0/holonomy-action-on-observability-partitions.js`],{encoding:'utf8'}).trim();
const restBlob=execFileSync('git',['rev-parse',`${PARENT_984_RECEIPT}:app/dome-world/docs/ash/experiments/a15-r0/ASH_KEEP_A15_R0_OPEN_RESEARCH_FIELD_RECEIPT_V0_4.md`],{encoding:'utf8'}).trim();
assert.equal(connectionBlob,CONNECTION_BLOB,'inherited bidirectional connection source moved');
assert.equal(actionBlob,HOLONOMY_ACTION_BLOB,'inherited holonomy-observability source moved');
assert.equal(restBlob,GOLDEN_EGG_REST_BLOB,'historical Golden Egg rest receipt moved');

await import('./ash-a15-r0-golden-egg-metric-connection-reopening.test.mjs');
await import('./ash-a15-r0-golden-egg-metric-connection-reopening-hostile.test.mjs');
console.log('Ash A15-R0 Golden Egg metric-connection reopening hardening tests passed.');
