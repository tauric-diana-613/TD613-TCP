/** PR1734 native Dollhouse receipt checker. Exact HEAD and HELD remain distinct from CI success. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const receipt=JSON.parse(readFileSync(process.argv[2]||'audit-artifacts/pr1734_native_dollhouse_receipt.json','utf8'));
const head=process.env.EXPECTED_AUDIT_SHA;
assert.match(head||'',/^[a-f0-9]{40}$/);
assert.equal(execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),head,'checkout must be real PR head');
assert.equal(receipt.source_revision,head,'audit source mismatch');
assert.equal(receipt.source_revision_verified,true);
assert.deepEqual([...receipt.roles_executed].sort(),['PEDAGOGUE','APERTURE','ATLAS','FADT','TEMPORAL_CUSTODIAN'].sort());
assert.ok(receipt.evidence_manifest?.length>=12);
assert.ok(receipt.evidence_manifest.every(x=>x.verified===true));
assert.equal(receipt.empirical_replication_count,0,'synthetic fixtures carry zero independent replication credit');
assert.equal(receipt.orchestrator?.human_closure_required,true);
assert.equal(receipt.orchestrator?.release_authority,false);
assert.equal(receipt.orchestrator?.deployment_authority,false);
assert.ok(receipt.orchestrator?.decision?.startsWith('HELD'),'adversarial synthetic negative controls require preserved dissent');
assert.equal(receipt.specialist_findings?.length,5);
assert.ok(receipt.specialist_findings.some(x=>x.verdict==='HELD'));

const positivePath=process.argv[3];
assert.ok(positivePath,'independent synthetic positive-control receipt is mandatory');
const good=JSON.parse(readFileSync(positivePath,'utf8'));
const goodSpec=JSON.parse(readFileSync('packages/rulefield/rulefields/research/PR1734_DOLLHOUSE_POSITIVE_CONTROL.json','utf8'));
const negativeSpec=JSON.parse(readFileSync('packages/rulefield/rulefields/research/PR1734_DOLLHOUSE_ADVERSARIAL_INPUT.json','utf8'));
assert.equal(goodSpec.evidence_class,'SYNTHETIC_TEST_FIXTURE');
assert.equal(negativeSpec.evidence_class,'SYNTHETIC_TEST_FIXTURE');
assert.equal(negativeSpec.control_designation,'DELIBERATE_NEGATIVE_CONTROL_SOURCE_LINKED_NOT_REPOSITORY_DEFECT');
assert.equal(goodSpec.control_designation,'BENIGN_POSITIVE_CONTROL_NOT_A_REAL_HUMAN_AUTHORIZATION');
assert.match(goodSpec.task_scope,/SYNTHETIC_POSITIVE_CONTROL/);
assert.equal(goodSpec.domain_inputs.TEMPORAL_CUSTODIAN.phases.RELOCK.entry_id,'SYNTHETIC_CONTROL_RELOCK_NOT_REAL_APPROVAL');
for(const r of [receipt,good]){
  assert.equal(r.schema,'td613.dollhouse.skill-audit-receipt/v1.0');
  assert.equal(r.evidence_class,'SYNTHETIC_TEST_FIXTURE');
  assert.equal(r.source_revision,head);
  assert.equal(r.git_commit_verified,true,'actual Git commit must be witnessed');
  assert.equal(r.exact_checkout_verified,true,'audit cannot be executed on a synthetic merge ref');
  assert.equal(r.source_revision_verified,true);
  assert.deepEqual([...r.roles_executed].sort(),['PEDAGOGUE','APERTURE','ATLAS','FADT','TEMPORAL_CUSTODIAN'].sort());
  assert.ok(r.evidence_manifest?.length>=12 && r.evidence_manifest.every(x=>x.verified && /^[a-f0-9]{64}$/.test(x.sha256)));
  assert.equal(r.empirical_replication_count,0);
  assert.equal(r.synthetic_vs_empirical,'SYNTHETIC');
  assert.equal(r.orchestrator?.release_authority,false);
  assert.equal(r.orchestrator?.deployment_authority,false);
  assert.equal(r.orchestrator?.human_closure_required,true);
}
assert.equal(good.orchestrator.decision,'SUPPORTED','positive control must demonstrate native full five-role discrimination');
assert.deepEqual(good.detected_infractions,[],'healthy fixture must generate zero infractions');
assert.ok(good.specialist_findings.length===5 && good.specialist_findings.every(f=>f.verdict==='SUPPORTED' && (f.infractions??[]).length===0));
assert.equal(good.specialist_findings.find(f=>f.role==='APERTURE')?.extensions?.epistemic_deficit?.deficit_class,'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT');
const adverse=new Map(receipt.specialist_findings.map(f=>[f.role,f]));
const has=(role,code)=>(adverse.get(role)?.infractions??[]).includes(code);
for(const [role,code] of [
 ['PEDAGOGUE','CADENCE_VIOLATION'],
 ['PEDAGOGUE','HUMAN_CONSEQUENCE_BROKEN_RETURN_PROMISE'],
 ['ATLAS','PREDECESSOR_CHAIN_UNVERIFIED_CUSTODY_FORK'],
 ['ATLAS','HOLD_HOLONOMY_HISTORY_PARITY_FAILED'],
 ['FADT','ILLEGAL_ACTION_GRANT_UNDER_ERASED_CONDITIONING'],
 ['TEMPORAL_CUSTODIAN','UNREFERENCED_RETRY_CHRONOLOGICAL_OBLIVION']
])assert.ok(has(role,code),'negative-control objection disappeared: '+role+' / '+code);
assert.equal(adverse.get('APERTURE')?.extensions?.epistemic_deficit?.deficit_class,'STRUCTURAL_RANK_DEFICIT');
console.log(JSON.stringify({contrastiveDollhouseEngineeringGate:'PASS',adverseControl:'HELD_EXPECTED',healthyControl:'SUPPORTED_EXPECTED',sourceSHA:head,scientificClosure:'RESERVED',empiricalReplication:0,releaseAuthority:false},null,2));

console.log(JSON.stringify({head,nativeDollhouseExecuted:true,scientificDisposition:receipt.orchestrator.decision,roles:receipt.roles_executed,findings:receipt.specialist_findings.map(x=>({role:x.role,verdict:x.verdict,status:x.status,infractions:x.infractions,apertureDeficit:x.extensions?.epistemic_deficit?.deficit_class??null,extensionError:x.extensions?.extension_error??null})),noEmpiricalReplication:true,releaseAuthority:false},null,2));
