import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';

const PARENT_888_RECEIPT='633cd75baaaebcc5f357bd503024aefbbcf11057';
function resolveScientificHead(){
  const parents=execFileSync('git',['show','-s','--format=%P','HEAD'],{encoding:'utf8'}).trim().split(/\s+/).filter(Boolean);
  if(parents.length===2){ const candidate=parents[1]; try { execFileSync('git',['merge-base','--is-ancestor',PARENT_888_RECEIPT,candidate],{stdio:'pipe'}); return candidate; } catch {} }
  return 'HEAD';
}
const SCIENCE_HEAD=resolveScientificHead();
execFileSync('git',['cat-file','-e',`${PARENT_888_RECEIPT}^{commit}`],{stdio:'pipe'});
execFileSync('git',['merge-base','--is-ancestor',PARENT_888_RECEIPT,SCIENCE_HEAD],{stdio:'pipe'});
const ahead=Number(execFileSync('git',['rev-list','--count',`${PARENT_888_RECEIPT}..${SCIENCE_HEAD}`],{encoding:'utf8'}).trim());
assert.ok(ahead>=7,'transport-signature quotient chamber must retain at least the seven preregistered scientific successor commits');
const changed=execFileSync('git',['diff','--name-only',`${PARENT_888_RECEIPT}..${SCIENCE_HEAD}`,'--','app/dome-world/docs/ash/experiments/a15-r0','app/dome-world/previews/a15-r0','tests'],{encoding:'utf8'}).trim().split('\n').filter(Boolean).filter(path=>path.startsWith('app/dome-world/docs/ash/experiments/a15-r0/')||path.startsWith('app/dome-world/previews/a15-r0/')||path.startsWith('tests/ash-a15-r0-'));
const allowed=new Set([
  'app/dome-world/docs/ash/experiments/a15-r0/FINITE_TRANSPORT_SIGNATURE_QUOTIENT_ROBUSTNESS_PRESERVING_WITNESS_COMPRESSION_PREREGISTRATION_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/FINITE_TRANSPORT_SIGNATURE_QUOTIENT_ROBUSTNESS_PRESERVING_WITNESS_COMPRESSION_EXPECTATIONS_V0_1.json',
  'app/dome-world/docs/ash/experiments/a15-r0/FINITE_TRANSPORT_SIGNATURE_QUOTIENT_ROBUSTNESS_PRESERVING_WITNESS_COMPRESSION_EXECUTION_BURDEN_V0_1.md',
  'app/dome-world/previews/a15-r0/finite-transport-signature-quotient-robustness-preserving-witness-compression.js',
  'tests/ash-a15-r0-aperture-pedagogue-finite-transport-signature-quotient-robustness-preserving-witness-compression.test.mjs',
  'tests/ash-a15-r0-aperture-pedagogue-finite-transport-signature-quotient-robustness-preserving-witness-compression-hostile.test.mjs',
  'tests/ash-a15-r0-review-hardening.test.mjs',
]);
const historicalMutations=changed.filter(path=>!allowed.has(path));
assert.deepEqual(historicalMutations,[],`post-#888 transport-signature quotient chamber mutated inherited A15-R0 paths: ${historicalMutations.join(', ')}`);
assert.equal(changed.length,allowed.size,`transport-signature quotient chamber must contain exactly ${allowed.size} live paths; observed ${changed.length}`);
for(const path of allowed) assert.equal(changed.includes(path),true,`missing transport-signature quotient path: ${path}`);

// Preserve the inherited sharded review contract, then dynamically execute every A15-R0
// aperture-pedagogue scientific contract currently present. This keeps the successor
// hardening closed under future inherited test additions without hand-maintained omission.
execFileSync(process.execPath,['tests/ash-a15-r0-review-hardening-sharded.test.mjs'],{stdio:'inherit'});
const scientificTests=readdirSync(new URL('.',import.meta.url)).filter(file=>file.startsWith('ash-a15-r0-aperture-pedagogue-')&&file.endsWith('.test.mjs')).sort();
assert.ok(scientificTests.includes('ash-a15-r0-aperture-pedagogue-finite-transport-signature-quotient-robustness-preserving-witness-compression.test.mjs'));
assert.ok(scientificTests.includes('ash-a15-r0-aperture-pedagogue-finite-transport-signature-quotient-robustness-preserving-witness-compression-hostile.test.mjs'));
for(const file of scientificTests) await import(new URL(`./${file}`,import.meta.url));
await import('./ash-a15-r0-wedding-identifiability.test.mjs');
console.log(`Ash A15-R0 transport-signature quotient hardening passed across ${scientificTests.length} aperture-pedagogue contracts.`);
