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
  const receiptBytes = await readFile(join(destination,'portable-loom-tomography-receipt.json'));
  const executionReceipt = JSON.parse(receiptBytes.toString('utf8'));
  assert.equal(executionReceipt.execution_origin,'EXPORTER_LOCAL_NODE_PROCESS');
  assert.equal(executionReceipt.canonical_source_hashes_checked,true);
  assert.equal(executionReceipt.real_route_acquisition,'NOT_RUN');
  assert.equal(executionReceipt.empirical_promotion_authority,false);
  assert.deepEqual(executionReceipt.self_check_audit, math);
  assert.equal(artifact.portable_tomography.calculated_fixture_receipt.receipt_sha256,sha256(receiptBytes));
  assert.deepEqual(artifact.portable_tomography.calculated_fixture_receipt.mathematical_result,math);
  assert.equal(manifest.mathematical_companion.receipt_sha256,sha256(receiptBytes));
  const activationText=await readFile(join(destination,'portable-loom-standard.md'),'utf8');
  assert.match(activationText,/A locally executed source-checked tomography report is included/);
  assert.match(activationText,/export-time locally computed synthetic fixtures/);
  // A receiver can read a real export-time result, but it cannot promote its
  // own paraphrase into a fresh empirical computation.
  assert.equal(artifact.portable_tomography.calculated_fixture_receipt.observer_measurement,'NOT_RUN');
  const episodeFile=join(root,'missing-episode.json');
  await writeFile(episodeFile,'{}\n');
  const evaluation=JSON.parse(execFileSync(process.execPath,[script,'--episode',episodeFile],{encoding:'utf8'}));
  assert.equal(evaluation.empirical_promotion_authority,false);
  assert.equal(evaluation.evaluation.empirical_candidate_qualified,false);
  assert.ok(['HELD','INADMISSIBLE'].includes(evaluation.evaluation.status));
  // Tampering with the execution receipt must fail before any result is read.
  const receiptPath=join(destination,'portable-loom-tomography-receipt.json');
  const originalReceipt=await readFile(receiptPath);
  try {
    await writeFile(receiptPath,Buffer.concat([originalReceipt,Buffer.from(' ')]));
    assert.throws(
      ()=>execFileSync(process.execPath,[script,'--self-check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}),
      error=>String(error.stderr).includes('PORTABLE_TOMOGRAPHY_EXECUTION_RECEIPT_HASH_MISMATCH')
    );
  } finally {
    await writeFile(receiptPath,originalReceipt);
  }
  // A manifest entry alone never executes or authenticates mathematics.
  // The companion must reject tampered source bytes before module import,
  // including when asked to evaluate a supplied episode.
  const mathPath=join(destination,'tomography',contract.mathematical_source_files[0].path);
  const pristine=await readFile(mathPath);
  try{
    await writeFile(mathPath,Buffer.concat([pristine,Buffer.from('\\n// tampered after export\\n')]));
    for(const args of [['--self-check'],['--episode',episodeFile]]){
      assert.throws(
        ()=>execFileSync(process.execPath,[script,...args],{encoding:'utf8',stdio:['ignore','pipe','pipe']}),
        error=>String(error.stderr).includes('PORTABLE_TOMOGRAPHY_SOURCE_HASH_MISMATCH'),
        'tampered mathematical source must fail before either evaluation route'
      );
    }
  }finally{
    await writeFile(mathPath,pristine);
  }
  const alteredContract={...contract,mathematical_source_files:contract.mathematical_source_files.map((entry,index)=>
    index===0?{...entry,path:'../unexpected.js'}:entry)};
  await writeFile(join(destination,'portable-loom-math-contract.json'),JSON.stringify(alteredContract));
  try{
    assert.throws(
      ()=>execFileSync(process.execPath,[script,'--self-check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}),
      error=>String(error.stderr).includes('PORTABLE_TOMOGRAPHY_SOURCE_MANIFEST_INVALID'),
      'source substitution must fail independently of the manifest contents'
    );
  }finally{
    await writeFile(join(destination,'portable-loom-math-contract.json'),JSON.stringify(contract));
  }
  const markdown=await readFile(join(destination,'portable-loom-standard.md'),'utf8');
  assert.match(markdown,/Executable mathematics \(local companion\)/);
  assert.match(markdown,/NOT_RUN/);
  assert.doesNotMatch(JSON.stringify(artifact.portable_task.documents),/Fictional|candidate|tomography/i);
});
