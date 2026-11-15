#!/usr/bin/env node
/** 𝌋 Execute real five-role /dollhouse-audit on an EXPLICIT SYNTHETIC NEGATIVE CONTROL.
 * This proves engine execution and refusal behavior, not actual source compliance
 * or any independent real-world empirical result. Do not promote green CI to science.
 */
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {runDollhouseSkillAudit} from '../app/engine/dollhouse-skill-dispatcher.js';
import {createPodiumNativeReadAdapters} from './vixen-podium-native-adapters.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
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
const adapters=await createPodiumNativeReadAdapters({repoRoot:root});
assert.equal(typeof adapters.RULEFIELD,'function','Native RULEFIELD adapter must be wired');
assert.equal(typeof adapters.ATLAS,'function','Native ATLAS adapter must be wired');
const scoredCandidates=await adapters.RULEFIELD({operation:'score_unified_candidates',payload:{lag_ticks:36}});
assert.ok(scoredCandidates.top_candidate&&scoredCandidates.candidates.length>=4,'RULEFIELD scoring must emit ranked candidates');
assert.equal(/\bTHE\s+ARCHITECTURE\s+OF\b/i.test(scoredCandidates.top_candidate.patternSubtitle),false,'Scored candidate must never contain boilerplate subtitle');
assert.ok(scoredCandidates.fadt_profile?.exact_descent_clusters?.includes('C3'),'Native corpus FADT profile must detect exact descent C3');
assert.equal(scoredCandidates.empirical_replication_credit,0);
const fadtBoundsCheck=await adapters.ATLAS({
 operation:'fadt_fiber_audit',
 payload:{
  fibers:[
   {id:'c3_a',support:['A-PLANE','W-PLANE']},
   {id:'c3_b',support:['A-PLANE','W-PLANE']}
  ]
 }
});
assert.equal(fadtBoundsCheck.exact_descent_exists,true);
await mkdir(dirname(out),{recursive:true});
await writeFile(out,JSON.stringify({
 schema:'td613.vixen.podium.native-dollhouse-ci-receipt/v1',
 audit:m,control_designation:'SYNTHETIC_NEGATIVE_CONTROL_NOT_A_SOURCE_OR_SCIENCE_PASS',
 rulefield_candidate_scoring:{
  top_candidate_id:scoredCandidates.top_candidate.id,
  top_score:scoredCandidates.top_candidate.score,
  fadt_exact_clusters:scoredCandidates.fadt_profile.exact_descent_clusters,
  aperture_svd_top:scoredCandidates.native_cross_checks?.aperture_svd_top||null,
  empirical_replication_credit:0
 },
 fadt_native_fiber_check:{
  disposition:fadtBoundsCheck.disposition,
  exact_descent_exists:fadtBoundsCheck.exact_descent_exists
 },
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
