#!/usr/bin/env node
/** 𝌋 Execute real five-role /dollhouse-audit on an EXPLICIT SYNTHETIC NEGATIVE CONTROL.
 * This proves engine execution and refusal behavior, not actual source compliance
 * or any independent real-world empirical result. Do not promote green CI to science.
 */
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve,dirname} from 'node:path';
import {runDollhouseSkillAudit} from '../app/engine/dollhouse-skill-dispatcher.js';
const root=resolve(dirname(new URL(import.meta.url).pathname),'..');
const path=resolve(root,'artifacts/vixen-dual-estate/podium-dollhouse-negative-control.json');
const out=process.env.RUNNER_TEMP?
 resolve(process.env.RUNNER_TEMP,'ci-podium-native-dollhouse-receipt.json'):
 resolve(root,'artifacts/vixen-dual-estate/ci-podium-native-dollhouse-receipt.json');
const input=JSON.parse(await readFile(path,'utf8'));
input.source_revision=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const result=await runDollhouseSkillAudit(input),m=result.machine_receipt;
assert.equal(m.roles_executed.length,5,'All five real specialist engines must execute');
assert.equal(m.orchestrator.decision,'HELD','Deliberate authority/cadence counterworlds must be rejected');
assert.equal(m.orchestrator.release_authority,false);
assert.equal(m.orchestrator.deployment_authority,false);
assert.equal(m.empirical_replication_count,0);
for(const infraction of [
 'HUMAN_CONSEQUENCE_BROKEN_RETURN_PROMISE',
 'ILLEGAL_ACTION_GRANT_UNDER_ERASED_CONDITIONING',
 'UNREFERENCED_RETRY_CHRONOLOGICAL_OBLIVION'
]) assert(m.orchestrator.detected_infractions.includes(infraction),'Missing expected negative-control hold: '+infraction);
await mkdir(dirname(out),{recursive:true});
await writeFile(out,JSON.stringify({
 schema:'td613.vixen.podium.native-dollhouse-ci-receipt/v1',
 audit:m,control_designation:'SYNTHETIC_NEGATIVE_CONTROL_NOT_A_SOURCE_OR_SCIENCE_PASS',
 full_source_review_complete:false,
 operator_scientific_closure:'RESERVED',
 future_experiment_b:'HELD',
 emitted_at:new Date().toISOString()
},null,2)+'\n');
console.log(JSON.stringify({
 result:'FIVE_NATIVE_SPECIALISTS_EXECUTED_EXPECTED_HELD',
 audit_source_revision:input.source_revision,
 exact_source_match:m.is_exact_checkout_match,
 roles:m.roles_executed,
 disposition:m.orchestrator.decision,
 artifact:'artifacts/vixen-dual-estate/ci-podium-native-dollhouse-receipt.json',
 empirical_replication_credit:0
},null,2));
