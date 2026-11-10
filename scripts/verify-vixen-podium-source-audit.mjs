#!/usr/bin/env node
/**
 * 𝌋 Podium source audit at exact checkout, with native five-role probes.
 * SOURCE CONTRACT inspection and SYNTHETIC engine negative controls are
 * independently labeled. Neither yields human/scientific closure.
 */
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {runDollhouseSkillAudit} from '../app/engine/dollhouse-skill-dispatcher.js';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const relative=[
 'app/encyclopedia/reference/vixen-podium.mjs',
 'app/encyclopedia/reference/vixen-stage-boundary.mjs',
 'app/encyclopedia/reference/vixen-operator-encounter.mjs',
 'app/encyclopedia/reference/vixen-read-gateway.mjs',
 'app/encyclopedia/reference/vixen-operator-encounter.css',
 'app/encyclopedia/reference/podium/manifest.json',
 'scripts/vixen-podium.mjs',
 'scripts/vixen-podium-native-adapters.mjs',
 'tests/vixen-podium.test.mjs'
];
const head=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const evidence={};
for(const path of relative){
 const bytes=await readFile(resolve(root,path));
 evidence[path]={
  sha256:createHash('sha256').update(bytes).digest('hex'),
  byte_count:bytes.length,
  evidence_class:'CURRENT_CHECKOUT_SOURCE_BYTES'
 };
}
const get=async path=>(await readFile(resolve(root,path),'utf8'));
const code=await get(relative[0]);
const stage=await get(relative[1]);
const room=await get(relative[2]);
const gateway=await get(relative[3]);
const css=await get(relative[4]);
const manifest=JSON.parse(await get(relative[5]));
const cli=await get(relative[6]);
const tests=await get(relative[8]);
const constraints=[
 ['TEN_TYPED_ROUTES',manifest.routes.length===10&&code.includes("PODIUM_ROUTES")],
 ['NO_MACHINE_AUTO_IMPORT',!code.includes('.admitRecord(')&&!code.includes('.prepareImport(')],
 ['NO_TASK_JSON_SELF_AUTHORITY',code.includes('operatorAuthorized!==true')&&
  cli.includes("process.env.TD613_PODIUM_OPERATOR_DIRECT==='1'")],
 ['INDEPENDENT_VERIFIED_REFERENCE',code.includes('state.seen.set(id,witness)')&&
  room.includes('WITNESSED_UNLINKED_PAIR')],
 ['FATAL_RAW_UTF8',gateway.includes("new TextDecoder('utf-8',{fatal:true})")&&
  gateway.includes('response.arrayBuffer()')],
 ['EXCLUSIVE_PERFORMANCE',stage.includes('vixen.hidden=entering')&&
  stage.includes('operahouse.hidden=!entering')],
 ['ACTIVE_MASTHEAD',css.includes('data-active-research-stage="OPERAHOUSE"')&&
  stage.includes('operahouseStageReturn')],
 ['NO_HUMAN_CLOSURE',manifest.human_closure==='RESERVED'&&
  manifest.release_authority===false&&manifest.deployment_authority===false],
 ['NATIVE_ENGINE_CALLS_EXPLICIT',cli.includes('--native-read-tools')&&
  tests.includes('HELD_OPERATOR_DIRECT_NATIVE_LANE_NOT_ATTESTED')],
 ['UNCERTAIN_REPLICATION',manifest.scientific_claims.empirical_replication_credit===0]
];
for(const [id,passed] of constraints)assert(passed,'SOURCE_CONTRACT_FAILURE: '+id);

const prereg=JSON.parse(await get('artifacts/vixen-dual-estate/podium-dollhouse-negative-control.json'));
const roles=['PEDAGOGUE','APERTURE','ATLAS','FADT','TEMPORAL_CUSTODIAN'];
const native=await runDollhouseSkillAudit({
 task_scope:'PODIUM_SOURCE_BOUND_FIVE_ROLE_REVIEW_WITH_DECLARED_NEGATIVE_CONTROLS',
 evidence_class:'SOURCE_CODE_AUDIT',
 source_revision:head,roles,include_orchestrator:true,
 evidence_references:relative.slice(0,4).concat('tests/vixen-podium.test.mjs'),
 domain_inputs:prereg.domain_inputs
});
const m=native.machine_receipt;
assert.equal(m.roles_executed.length,5,'All five native roles must have actually executed');
assert.equal(m.orchestrator.release_authority,false);
assert.equal(m.orchestrator.deployment_authority,false);
assert.equal(m.empirical_replication_count,0);
const disposition={
 schema:'td613.vixen.podium.source-bound-native-audit/v1',
 source_revision:head,
 source_contracts:constraints.map(([id,passed])=>({id,passed})),
 source_bytes:evidence,
 native_dollhouse:{
  provenance:'REAL_NATIVE_FIVE_ROLE_ENGINE_EXECUTED_ON_SYNTHETIC_DOMAIN_PROBES',
  source_specific_full_domain_proof:false,
  roles_executed:m.roles_executed,
  orchestrator:m.orchestrator,
  receipt_schema:m.schema||null,
  detected_infractions:m.orchestrator.detected_infractions||[]
 },
 review_state:'SOURCE_CONTRACTS_PASS_AND_NATIVE_PROBES_RETAIN_HELD',
 independent_empirical_witness:false,
 human_scientific_closure:'RESERVED',
 merge_authority:false,release_authority:false,deployment_authority:false,
 protected_experiment_b:'HELD'
};
const dest=process.env.RUNNER_TEMP?
 resolve(process.env.RUNNER_TEMP,'ci-podium-source-audit.json'):
 resolve(root,'artifacts/vixen-dual-estate/ci-podium-source-audit.json');
await mkdir(dirname(dest),{recursive:true});
await writeFile(dest,JSON.stringify(disposition,null,2)+'\n');
console.log(JSON.stringify({head,source_checks:constraints.length,
 native_roles:m.roles_executed,orchestrator_decision:m.orchestrator.decision,
 classification:disposition.review_state,
 scientific_closure:'RESERVED',artifact:'artifacts/vixen-dual-estate/ci-podium-source-audit.json'}));
