import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const repoRoot=fileURLToPath(new URL('../',import.meta.url));
const sha256=s=>createHash('sha256').update(s).digest('hex');

test('standard portable artifact runs exact canonical mathematical companion without acquisition credit',async t=>{
  const root=await mkdtemp(join(tmpdir(),'loom-math-'));
  t.after(()=>rm(root,{recursive:true,force:true}));
  const destination=join(root,'export-'+randomUUID());
  const run=JSON.parse(execFileSync(process.execPath,
    [join(repoRoot,'scripts/export-standard-portable-loom.mjs'),destination],
    {cwd:repoRoot,encoding:'utf8',maxBuffer:8*1024*1024}));
  assert.equal(run.status,'EXPORTED_AWAITING_ARTIFACT_ASSAY');
  const artifact=JSON.parse(await readFile(join(destination,'portable-loom-standard.json'),'utf8'));
  const manifest=JSON.parse(await readFile(join(destination,'portable-loom-standard-manifest.json'),'utf8'));
  const contract=JSON.parse(await readFile(join(destination,'portable-loom-math-contract.json'),'utf8'));
  assert.equal(artifact.portable_tomography.schema,contract.schema);
  assert.equal(artifact.portable_tomography.execution,'LOCAL_COMPANION_REQUIRED');
  assert.equal(artifact.portable_tomography.observer_capture_present,false);
  assert.equal(manifest.mathematical_companion.status,'CANONICAL_FINITE_MATH_RECOMPUTED');
  assert.equal(contract.qualified_same_episode,false);
  assert.equal(artifact.portable_task.documents.length,0);
  assert.equal(artifact.loom_gate_reports.length,0);
  assert.equal(artifact.session.work_units.length,0);
  assert.equal(contract.mathematical_source_files.length,10);
  for(const entry of manifest.files){
    const bytes=await readFile(join(destination,entry.name));
    assert.equal(bytes.byteLength,entry.bytes,entry.name);
    assert.equal(sha256(bytes),entry.sha256,entry.name);
  }
  for(const entry of contract.mathematical_source_files){
    const bytes=await readFile(join(destination,'tomography',entry.path));
    assert.equal(sha256(bytes),entry.sha256,entry.path);
  }
  const script=join(destination,'portable-loom-tomography-audit.mjs');
  const math=JSON.parse(execFileSync(process.execPath,[script,'--self-check'],{encoding:'utf8'}));
  assert.equal(math.transport.valid_finite_fixture,true);
  assert.equal(math.transport.hardened_nullspace_control_pass,true);
  assert.equal(math.face_holonomy.valid_finite_fixture,true);
  assert.equal(math.face_holonomy.wrong_order_rejected,true);
  assert.equal(math.feasible_region.joint_realizability,'UNMEASURED');
  assert.equal(math.feasible_region.source_status,'SIMULATED_FACTORIZED_PRODUCT_SPACE');
  assert.equal(math.empirical_golden_egg_earned,false);
  assert.equal(math.observed_real_routes,'NOT_RUN');
  const episodeFile=join(root,'missing-episode.json');
  await writeFile(episodeFile,'{}\n');
  const evaluation=JSON.parse(execFileSync(process.execPath,[script,'--episode',episodeFile],{encoding:'utf8'}));
  assert.equal(evaluation.empirical_promotion_authority,false);
  assert.equal(evaluation.evaluation.empirical_candidate_qualified,false);
  assert.ok(['HELD','INADMISSIBLE'].includes(evaluation.evaluation.status));
  const markdown=await readFile(join(destination,'portable-loom-standard.md'),'utf8');
  assert.match(markdown,/Executable mathematics \(local companion\)/);
  assert.match(markdown,/NOT_RUN/);
  assert.doesNotMatch(JSON.stringify(artifact.portable_task.documents),/Fictional|candidate|tomography/i);
});
