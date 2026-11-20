import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,realpathSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {runDollhouseSkillAudit} from '../app/engine/dollhouse-skill-dispatcher.js';
import {runNativeWendbineAssay} from '../scripts/wendbine-proscenium-assay.mjs';
import {runNativeVixenWendbineTransfer} from '../scripts/vixen-wendbine-method-transfer.mjs';
const repo=realpathSync(resolve(dirname(fileURLToPath(import.meta.url)),'..'));
const head=execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim();
const path=resolve(repo,'artifacts/vixen-dual-estate/wendbine-proscenium-dollhouse-negative-control.json');
test('actual five independent specialist ENGINE executions face a source-role/authority negative control',async()=>{
 const fixture=JSON.parse(readFileSync(path,'utf8'));
 fixture.source_revision=head;
 const result=await runDollhouseSkillAudit(fixture);
 const m=result.machine_receipt;
 assert.equal(m.roles_executed.length,5);
 assert.deepEqual([...m.roles_executed].sort(),
  ['PEDAGOGUE','APERTURE','ATLAS','FADT','TEMPORAL_CUSTODIAN'].sort());
 assert.equal(m.orchestrator.decision,'HELD');
 assert.equal(m.orchestrator.release_authority,false);
 assert.equal(m.orchestrator.deployment_authority,false);
 assert.equal(m.empirical_replication_count,0);
 assert.ok(m.orchestrator.detected_infractions.includes('ILLEGAL_ACTION_GRANT_UNDER_ERASED_CONDITIONING'));
 assert.ok(m.orchestrator.detected_infractions.includes('UNREFERENCED_RETRY_CHRONOLOGICAL_OBLIVION'));
 assert.equal(fixture.evidence_class,'SYNTHETIC_TEST_FIXTURE');
 assert.equal(fixture.control_designation,'DELIBERATE_NEGATIVE_CONTROL_NOT_REPOSITORY_OR_EMPIRICAL_VIOLATION');
});
test('actual native compiler and two verified Vixen subject bodies refuse promotion after five-role review',async()=>{
 const source=await runNativeWendbineAssay({mode:'sweep'});
 const transfer=await runNativeVixenWendbineTransfer({repoRoot:repo,
  work_ids:['emwork_dd9a66eba0e2dde8e29f00f6','emwork_f2c89864337f162e88991e28'],
  query:'quantum entanglement'});
 assert.equal(source.state,'HELD_EXPLORATORY_SWEEP_NOT_PREREGISTERED');
 assert.equal(source.scientific_credit,0);
 assert.equal(source.original_compiler_receipt.original_compiler_executed,true);
 assert.equal(transfer.source_estate,'ORIGINAL_PUBLIC_WENDBINE_REGISTRY_SEPARATE');
 assert.equal(transfer.subject_estate,'VIXEN_EXPERIMENT_A_VERIFIED_WORKS_ONLY');
 assert.equal(transfer.public_source_bodies_admitted,0);
 assert.equal(transfer.native_algorithm_equivalence,'HELD_UNPROVEN');
 assert.equal(transfer.source_admission_authority,false);
 assert.equal(transfer.human_closure_required,true);
});
