import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createVixenAiSession} from '../app/encyclopedia/vixen-estate/vixen-ai-session.mjs';
import {
  auditTypedEpistemicDeficit,validateCovarianceMatrix
} from '../app/engine/aperture-v32-typed-epistemic-deficit.js';
import {runDollhouseSkillAudit} from '../app/engine/dollhouse-skill-dispatcher.js';

// G1 synthetic negative controls: same source/role APIs as the saved Work-mode
// witnesses, not human input and not an independent empirical replication.
const html=readFileSync(fileURLToPath(new URL('../app/encyclopedia/vix-cyb.html',import.meta.url)),'utf8');
const raw=html.match(/<script[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/);
assert(raw,'Original Vixen corpus must be present for G1 tests');
const corpus=JSON.parse(raw[1]);
assert.equal(corpus.works.length,32);
assert.equal(corpus.instruments.length,21);
const deferred=()=>{
  let resolve,reject;
  const promise=new Promise((yes,no)=>{resolve=yes;reject=no});
  return {promise,resolve,reject};
};
const reason=result=>result.result?.reason;

test('AUTH-A: pending consent for ended A never grants successor B',async()=>{
  const verify=deferred(),entered=deferred();
  const session=createVixenAiSession({corpus,verifyProgramNotesConsent:args=>{
    assert.equal(args.session_id,'vixen-ai-session-0001');
    entered.resolve();return verify.promise;
  }});
  await session.start({role:'MAESTRO'});
  await session.permission({phase:'request'});
  const a=session.permission({phase:'grant',proof:'A_ONLY'});
  await entered.promise;
  const prior=session.finish();
  assert.equal(prior.result.archive.role,'MAESTRO');
  const b=await session.start({role:'COMPOSER'});
  assert.equal(b.status,'SUPPORTED');
  verify.resolve(true);
  const late=await a;
  assert.equal(late.status,'HELD');
  assert.equal(reason(late),'STALE_OPERATION');
  assert.equal(session.status().result.program_notes_permission,'NOT_REQUESTED');
  assert.equal(session.status().result.note_count,0);
});

test('AUTH-B: pending grant cannot overtake a revoke, and a fresh request may grant',async()=>{
  const gate=deferred(),entered=deferred();
  let pending=true;
  const session=createVixenAiSession({corpus,verifyProgramNotesConsent:()=>{
    if(pending){entered.resolve();return gate.promise}
    return true;
  }});
  await session.start({role:'MAESTRO'});
  await session.permission({phase:'request'});
  const late=session.permission({phase:'grant'});
  await entered.promise;
  assert.equal((await session.permission({phase:'revoke'})).status,'SUPPORTED');
  gate.resolve(true);
  assert.equal(reason(await late),'CONSENT_REVOKED');
  assert.equal(session.status().result.program_notes_permission,'REVOKED');
  await session.permission({phase:'request'});
  pending=false;
  assert.equal((await session.permission({phase:'grant'})).status,'SUPPORTED');
  assert.equal(session.status().result.program_notes_permission,'GRANTED');
});

test('AUTH-C: a delayed note after revoke commits neither note nor route',async()=>{
  const note=deferred(),entered=deferred();
  const session=createVixenAiSession({corpus,
    verifyProgramNotesConsent:()=>true,
    authorProgramNote:()=>{entered.resolve();return note.promise}
  });
  await session.start({role:'MAESTRO'});
  await session.permission({phase:'request'});
  await session.permission({phase:'grant'});
  const before=session.status().result.history_length;
  const choice=session.choose({choice_id:'compare'});
  await entered.promise;
  await session.permission({phase:'revoke'});
  note.resolve('This note finished after revocation.');
  assert.equal(reason(await choice),'CONSENT_REVOKED');
  assert.equal(session.status().result.note_count,0);
  assert.equal(session.status().result.history_length,before);
  const fresh=await session.choose({choice_id:'compare'});
  assert.equal(fresh.status,'SUPPORTED');
  assert.equal(session.status().result.note_count,0);
});

test('AUTH-D/PED-02: late MAESTRO narration cannot append to successor COMPOSER',async()=>{
  const host=deferred(),entered=deferred();
  let arm=false;
  const session=createVixenAiSession({corpus,hostNarrate:()=>{
    if(arm){entered.resolve();return host.promise}
    return null;
  }});
  await session.start({role:'MAESTRO'});
  arm=true;
  const old=session.choose({choice_id:'compare',question:'OLD_MAESTRO_QUESTION'});
  await entered.promise;
  session.finish();
  arm=false;
  const b=await session.start({role:'COMPOSER'});
  assert.equal(b.status,'SUPPORTED');
  host.resolve(null);
  assert.equal(reason(await old),'STALE_OPERATION');
  assert.equal(session.status().result.history_length,0);
  assert.equal(session.status().result.role,'COMPOSER');
  assert.equal(session.archive().result.role,'COMPOSER');
});

test('AUTH-E: orderly human permission and role flows remain available',async()=>{
  const key=Symbol('human-consent');
  const session=createVixenAiSession({corpus,verifyProgramNotesConsent:({proof})=>proof===key});
  const a=await session.start({role:'MAESTRO'});
  assert.equal(a.status,'SUPPORTED');
  const pre=await session.choose({choice_id:'compare'});
  assert.equal(pre.status,'SUPPORTED');
  await session.permission({phase:'request'});
  assert.equal((await session.permission({phase:'grant',proof:key})).status,'SUPPORTED');
  const choice=await session.choose({choice_id:'source'});
  assert.equal(choice.status,'SUPPORTED');
  assert.equal(session.status().result.note_count,1);
  const old=session.finish();
  assert.equal(old.result.archive.role,'MAESTRO');
  assert.equal((await session.start({role:'COMPOSER'})).status,'SUPPORTED');
  assert.equal(session.status().result.program_notes_permission,'NOT_REQUESTED');
});

const bad=[[1,2],[2,1]];
const identity=[[1,0],[0,1]];
const matrixInput={current_operator:identity,noise_covariance:bad};

test('MATH-A/AP-01: indefinite covariance is rejected without candidate',()=>{
  const geometry=validateCovarianceMatrix(bad,2);
  assert.equal(geometry.valid,false);
  assert.equal(geometry.code,'INDEFINITE_NOISE_COVARIANCE');
  const response=auditTypedEpistemicDeficit(matrixInput);
  assert.equal(response.disposition,'REJECT');
  assert.equal(response.deficit_class,'INVALID_NOISE_GEOMETRY');
  assert.equal(response.noise_geometry_error_code,'INDEFINITE_NOISE_COVARIANCE');
});

test('MATH-B/AP-04: candidate and parent mathematical veto agree; valid PSD survives',()=>{
  const response=auditTypedEpistemicDeficit({...matrixInput,candidate_probes:[[1,1]]});
  assert.equal(response.disposition,'REJECT');
  assert.equal(response.candidate_probe_evaluation.disposition,'REJECT');
  assert.equal(response.noise_geometry_error_code,'INDEFINITE_NOISE_COVARIANCE');
  assert.equal(validateCovarianceMatrix(identity,2).valid,true);
  assert.equal(validateCovarianceMatrix([[1,1],[1,1]],2).valid,true);
  assert.equal(auditTypedEpistemicDeficit({...matrixInput,noise_covariance:identity})
    .noise_geometry_error_code,null);
  assert.equal(validateCovarianceMatrix([[1,0],[0]],2).code,
    'INVALID_NOISE_COVARIANCE_DIMENSIONS');
});

test('MATH-C: native Dollhouse specialist preserves typed covariance veto',async()=>{
  const run=await runDollhouseSkillAudit({
    source_revision:'WORKING_TREE_UNCOMMITTED',
    task_scope:'G1_APERTURE_INVALID_COVARIANCE_SYNTHETIC',
    evidence_class:'SYNTHETIC_TEST_FIXTURE',
    roles:['APERTURE'],include_orchestrator:false,
    domain_inputs:{APERTURE:matrixInput}
  });
  const finding=run.machine_receipt.specialist_findings.find(x=>x.role==='APERTURE');
  assert(finding);
  assert.equal(finding.verdict,'HELD');
  assert.equal(finding.extensions.epistemic_deficit.deficit_class,'INVALID_NOISE_GEOMETRY');
  assert(finding.infractions.includes('INDEFINITE_NOISE_COVARIANCE'));
  assert(!finding.infractions.includes('URL_HASH_DOES_NOT_EQUAL_WORKSPACE_ADMITTED'));
  assert.equal(run.machine_receipt.overall_decision?.startsWith('HELD')||
    run.machine_receipt.overall_decision==='HELD',true);
});
