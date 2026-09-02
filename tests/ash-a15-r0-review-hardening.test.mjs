import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PARENT_969_RECEIPT='776c6ef78011157d3458daf924bbb7cda7566785';
function resolveScientificHead(){
  const parents=execFileSync('git',['show','-s','--format=%P','HEAD'],{encoding:'utf8'}).trim().split(/\s+/).filter(Boolean);
  if(parents.length===2){const candidate=parents[1];try{execFileSync('git',['merge-base','--is-ancestor',PARENT_969_RECEIPT,candidate],{stdio:'pipe'});return candidate;}catch{}}
  return 'HEAD';
}
const SCIENCE_HEAD=resolveScientificHead();
execFileSync('git',['cat-file','-e',`${PARENT_969_RECEIPT}^{commit}`],{stdio:'pipe'});
execFileSync('git',['merge-base','--is-ancestor',PARENT_969_RECEIPT,SCIENCE_HEAD],{stdio:'pipe'});
const ahead=Number(execFileSync('git',['rev-list','--count',`${PARENT_969_RECEIPT}..${SCIENCE_HEAD}`],{encoding:'utf8'}).trim());
assert.ok(ahead===8||ahead===9,'Atlas Schubert Möbius-Delannoy chamber must be at hardening or exact frozen successor depth');

const changed=execFileSync('git',['diff','--name-only',`${PARENT_969_RECEIPT}..${SCIENCE_HEAD}`,'--','app/dome-world/docs/ash/experiments/a15-r0','app/dome-world/previews/a15-r0','tests'],{encoding:'utf8'}).trim().split('\n').filter(Boolean).filter(p=>p.startsWith('app/dome-world/docs/ash/experiments/a15-r0/')||p.startsWith('app/dome-world/previews/a15-r0/')||p.startsWith('tests/ash-a15-r0-'));
const freezePath='app/dome-world/docs/ash/experiments/a15-r0/ATLAS_SCHUBERT_MOBIUS_DELANNOY_FREEZE_V0_1.md';
const allowed=new Set([
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_SCHUBERT_MOBIUS_DELANNOY_PREREGISTRATION_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_SCHUBERT_MOBIUS_DELANNOY_EXPECTATIONS_V0_1.json',
  'app/dome-world/docs/ash/experiments/a15-r0/ATLAS_SCHUBERT_MOBIUS_DELANNOY_BURDEN_V0_1.md',
  freezePath,
  'app/dome-world/previews/a15-r0/atlas-schubert-mobius-delannoy.js',
  'tests/ash-a15-r0-aperture-pedagogue-atlas-schubert-mobius-delannoy.test.mjs',
  'tests/ash-a15-r0-aperture-pedagogue-atlas-schubert-mobius-delannoy-hostile.test.mjs',
  'tests/ash-a15-r0-review-hardening.test.mjs',
]);
const historicalMutations=changed.filter(p=>!allowed.has(p));
assert.deepEqual(historicalMutations,[],`post-#969 Möbius-Delannoy chamber mutated inherited A15-R0 paths: ${historicalMutations.join(', ')}`);
if(ahead===8){
  assert.equal(changed.includes(freezePath),false,'freeze path must not exist before terminal freeze commit');
  assert.equal(changed.length,7);
  for(const p of allowed)if(p!==freezePath)assert.equal(changed.includes(p),true,`missing prefreeze Möbius-Delannoy path: ${p}`);
}else{
  assert.equal(changed.length,allowed.size);
  for(const p of allowed)assert.equal(changed.includes(p),true,`missing frozen Möbius-Delannoy path: ${p}`);
}

// Mechanically replay the exact earned #969 hardening theorem tail while replacing only #969's ancestor-specific path audit.
const parentHardening=execFileSync('git',['show',`${PARENT_969_RECEIPT}:tests/ash-a15-r0-review-hardening.test.mjs`],{encoding:'utf8'});
const parentMarker="// Mechanically replay the exact earned #966 hardening theorem tail while replacing only #966's ancestor-specific path audit.";
const replayStart=parentHardening.indexOf(parentMarker);
assert.ok(replayStart>=0,'earned #969 hardening theorem tail must remain discoverable for descendant replay');
const parentTail=parentHardening.slice(replayStart);
const testsDir=path.dirname(fileURLToPath(import.meta.url));
const tempPath=path.join(testsDir,`.ash-a15-r0-parent-969-hardening-tail-${process.pid}.mjs`);
const tempSource=`import assert from 'node:assert/strict';\nimport fs from 'node:fs/promises';\nimport path from 'node:path';\nimport { execFileSync } from 'node:child_process';\nimport { fileURLToPath, pathToFileURL } from 'node:url';\nconst PARENT_966_RECEIPT='f083e506f2a16f1d98b3af9a9b963d65694efc47';\n${parentTail}`;
await fs.writeFile(tempPath,tempSource,'utf8');
try{await import(`${pathToFileURL(tempPath).href}?parent969=${Date.now()}`);}finally{await fs.rm(tempPath,{force:true});}

await import('./ash-a15-r0-aperture-pedagogue-atlas-schubert-mobius-delannoy.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-atlas-schubert-mobius-delannoy-hostile.test.mjs');
console.log('Ash A15-R0 Atlas Schubert Möbius-Delannoy path correspondence hardening tests passed.');
