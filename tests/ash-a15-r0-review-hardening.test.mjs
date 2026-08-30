import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PARENT_900_RECEIPT='fa1c369abe3e628a92405aef03aeb6f9e2f76087';
function resolveScientificHead(){
  const parents=execFileSync('git',['show','-s','--format=%P','HEAD'],{encoding:'utf8'}).trim().split(/\s+/).filter(Boolean);
  if(parents.length===2){
    const candidate=parents[1];
    try { execFileSync('git',['merge-base','--is-ancestor',PARENT_900_RECEIPT,candidate],{stdio:'pipe'}); return candidate; } catch {}
  }
  return 'HEAD';
}
const SCIENCE_HEAD=resolveScientificHead();
execFileSync('git',['cat-file','-e',`${PARENT_900_RECEIPT}^{commit}`],{stdio:'pipe'});
execFileSync('git',['merge-base','--is-ancestor',PARENT_900_RECEIPT,SCIENCE_HEAD],{stdio:'pipe'});
const ahead=Number(execFileSync('git',['rev-list','--count',`${PARENT_900_RECEIPT}..${SCIENCE_HEAD}`],{encoding:'utf8'}).trim());
assert.ok(ahead>=8,'continuation/syntactic recovery chamber must retain the eight preregistered/frozen successor commits');

const changed=execFileSync('git',['diff','--name-only',`${PARENT_900_RECEIPT}..${SCIENCE_HEAD}`,'--','app/dome-world/docs/ash/experiments/a15-r0','app/dome-world/previews/a15-r0','tests'],{encoding:'utf8'}).trim().split('\n').filter(Boolean).filter(pathName=>pathName.startsWith('app/dome-world/docs/ash/experiments/a15-r0/')||pathName.startsWith('app/dome-world/previews/a15-r0/')||pathName.startsWith('tests/ash-a15-r0-'));
const allowed=new Set([
  'app/dome-world/docs/ash/experiments/a15-r0/ONE_SIDED_CONTINUATION_TWO_SIDED_SYNTACTIC_RECOVERY_PREREGISTRATION_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/ONE_SIDED_CONTINUATION_TWO_SIDED_SYNTACTIC_RECOVERY_EXPECTATIONS_V0_1.json',
  'app/dome-world/docs/ash/experiments/a15-r0/ONE_SIDED_CONTINUATION_TWO_SIDED_SYNTACTIC_RECOVERY_BURDEN_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/ONE_SIDED_CONTINUATION_TWO_SIDED_SYNTACTIC_RECOVERY_FREEZE_V0_1.md',
  'app/dome-world/previews/a15-r0/one-sided-continuation-two-sided-syntactic-recovery.js',
  'tests/ash-a15-r0-aperture-pedagogue-one-sided-continuation-two-sided-syntactic-recovery.test.mjs',
  'tests/ash-a15-r0-aperture-pedagogue-one-sided-continuation-two-sided-syntactic-recovery-hostile.test.mjs',
  'tests/ash-a15-r0-review-hardening.test.mjs',
]);
const historicalMutations=changed.filter(pathName=>!allowed.has(pathName));
assert.deepEqual(historicalMutations,[],`post-#900 continuation/syntactic chamber mutated inherited A15-R0 paths: ${historicalMutations.join(', ')}`);
assert.equal(changed.length,allowed.size,`continuation/syntactic chamber must contain exactly ${allowed.size} live paths; observed ${changed.length}`);
for(const pathName of allowed) assert.equal(changed.includes(pathName),true,`missing continuation/syntactic path: ${pathName}`);

// Mechanically replay the exact earned #900 hardening theorem tail while replacing only #900's ancestor-specific path audit.
// The earned #900 tail itself mechanically replays #898 before running #900's canonical and hostile contracts.
const parentHardening=execFileSync('git',['show',`${PARENT_900_RECEIPT}:tests/ash-a15-r0-review-hardening.test.mjs`],{encoding:'utf8'});
const parentMarker='// Replay the exact earned #898 hardening test body while replacing only its ancestor-specific path audit.';
const replayStart=parentHardening.indexOf(parentMarker);
assert.ok(replayStart>=0,'earned #900 hardening theorem tail must remain discoverable for descendant replay');
const parentTail=parentHardening.slice(replayStart);
const testsDir=path.dirname(fileURLToPath(import.meta.url));
const tempPath=path.join(testsDir,`.ash-a15-r0-parent-900-hardening-tail-${process.pid}.mjs`);
const tempSource=`import assert from 'node:assert/strict';\nimport fs from 'node:fs/promises';\nimport path from 'node:path';\nimport { execFileSync } from 'node:child_process';\nimport { fileURLToPath, pathToFileURL } from 'node:url';\nconst PARENT_898_RECEIPT='ec837736399e2b5e65c281c1fc88f18cc99709ad';\n${parentTail}`;
await fs.writeFile(tempPath,tempSource,'utf8');
try {
  await import(`${pathToFileURL(tempPath).href}?parent900=${Date.now()}`);
} finally {
  await fs.rm(tempPath,{force:true});
}

await import('./ash-a15-r0-aperture-pedagogue-one-sided-continuation-two-sided-syntactic-recovery.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-one-sided-continuation-two-sided-syntactic-recovery-hostile.test.mjs');

console.log('Ash A15-R0 one-sided continuation / two-sided syntactic recovery hardening tests passed.');
