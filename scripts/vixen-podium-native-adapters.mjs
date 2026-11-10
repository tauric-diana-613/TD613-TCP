/**
 * 𝌋 Podium native source-only engine conduit.
 *
 * No module is fabricated when unavailable. This adapter is created only
 * by a human-directed host that explicitly selects the native-read-tools
 * lane. The CLI's flag is NOT cryptographic human authorization.
 * Engine results remain research proposals / audit receipts, not science.
 */
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
const allowedRoles=Object.freeze(['PEDAGOGUE','APERTURE','ATLAS','FADT','TEMPORAL_CUSTODIAN']);
const evidenceRefs=Object.freeze([
 'app/encyclopedia/reference/vixen-podium.mjs',
 'app/encyclopedia/reference/podium/manifest.json',
 'app/encyclopedia/reference/vixen-operator-encounter.mjs',
 'app/encyclopedia/reference/vixen-read-gateway.mjs',
 'tests/vixen-podium.test.mjs'
]);
const head=()=>{try{return execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim()}
 catch(_){return 'UNVERIFIED_LOCAL_REPO'}};
export async function createPodiumNativeReadAdapters(){
 const adapters={};
 try{
  const api=await import('../app/engine/aperture-v32-typed-epistemic-deficit.js');
  if(typeof api.auditTypedEpistemicDeficit==='function')
   adapters.APERTURE=async ({operation,payload})=>{
    if(operation!=='audit_epistemic_deficit')throw Error('HELD_APERTURE_OPERATION');
    return api.auditTypedEpistemicDeficit(payload);
   };
 }catch(_){/* absent native module: the caller receives HELD_ENGINE_NOT_CONNECTED */}
 try{
  const atlas=await import('../app/engine/dollhouse-atlas-relational-custody.js');
  if(typeof atlas.auditAtlasHolonomyHistoryParity==='function'&&
     typeof atlas.classifyAtlasRelationIdentity==='function')
   adapters.ATLAS=async ({operation,payload})=>{
    if(operation==='compare_routes')
     return atlas.auditAtlasHolonomyHistoryParity(payload.trajectoryA||{},payload.trajectoryB||{});
    if(operation==='trace_relations')
     return atlas.classifyAtlasRelationIdentity(payload.left||{},payload.right||{});
    throw Error('HELD_ATLAS_OPERATION');
   };
 }catch(_){/* unavailable: explicit hold */}
 try{
  const dollhouse=await import('../app/engine/dollhouse-skill-dispatcher.js');
  if(typeof dollhouse.runDollhouseSkillAudit==='function')
   adapters.DOLLHOUSE=async ({operation,payload})=>{
    if(operation!=='audit')throw Error('HELD_DOLLHOUSE_OPERATION');
    if(!payload||!payload.domain_inputs||typeof payload.domain_inputs!=='object'||
       Array.isArray(payload.domain_inputs))throw Error('HELD_DOLLHOUSE_INPUTS_REQUIRED');
    // Compose the exact declared five-role specimen rather than forwarding
    // arbitrary file paths, overwrite flags or unverified release authority.
    const spec={
     task_scope:'VIXEN_PODIUM_NATIVE_FIVE_ROLE_AUDIT',
     evidence_class:'SYNTHETIC_TEST_FIXTURE',
     source_revision:head(),roles:[...allowedRoles],
     include_orchestrator:true,evidence_references:[...evidenceRefs],
     domain_inputs:payload.domain_inputs
    };
    const run=await dollhouse.runDollhouseSkillAudit(spec);
    const m=run.machine_receipt;
    return {schema:m.schema,source_revision:m.source_revision,
     source_revision_verified:m.source_revision_verified,
     roles_attempted:m.roles_attempted,roles_executed:m.roles_executed,
     missing_inputs:m.missing_inputs,specialist_findings:m.specialist_findings,
     orchestrator:m.orchestrator,empirical_replication_count:0,
     claimant:'SYNTHETIC_NATIVE_AUDIT_NOT_HUMAN_ADJUDICATION'};
   };
 }catch(_){/* absent native source engine */}
 // RULEFIELD and Universal Atelier receiver may be attached by a separately
 // reviewed host. A ZIP manifest or source citation cannot install those engines.
 return Object.freeze(adapters);
}
