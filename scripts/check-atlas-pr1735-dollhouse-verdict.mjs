/** Verify exact-head native Dollhouse audit completion without equating HOLD to CI failure. */
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const path=process.argv[2]||'audit-artifacts/pr1735_native_dollhouse_receipt.json';
const r=JSON.parse(readFileSync(path,'utf8'));
const roles=['PEDAGOGUE','APERTURE','ATLAS','FADT','TEMPORAL_CUSTODIAN'];
const expected=process.env.EXPECTED_AUDIT_SHA;
assert.match(expected||'',/^[a-f0-9]{40}$/,'PR head SHA required');
assert.equal(execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),expected,'checkout must be PR head, never the synthetic pull_request merge commit');
assert.equal(r.source_revision,expected,'actual PR head revision required');
assert.equal(r.source_revision_verified,true,'verified actual git SHA required');
assert.deepEqual([...r.roles_executed].sort(),roles.sort(),'all five native specialists must run');
assert.ok(r.evidence_manifest?.length>=8,'source-bound evidence verification required');
assert.ok(r.evidence_manifest.every(e=>e.verified===true),'every cited code/custody item must exist and be verified');
assert.equal(r.empirical_replication_count,0,'shared synthetic experiment earns zero empirical replication');
assert.equal(r.orchestrator?.human_closure_required,true,'human science closure is reserved');
assert.equal(r.orchestrator?.release_authority,false,'cannot grant release');
assert.equal(r.orchestrator?.deployment_authority,false,'cannot grant deployment');
assert.ok(r.orchestrator?.decision?.startsWith('HELD'),'deliberately adversarial counterworlds must not be rubber-stamped');
assert.ok(r.specialist_findings?.length===5,'all five specialist receipts retained');
assert.ok(r.specialist_findings.some(x=>x.verdict==='HELD'),'a real specialist veto must survive');
const specialists=new Map(r.specialist_findings.map(x=>[x.role,x]));
const infractions=role=>specialists.get(role)?.infractions??[];
assert.ok(infractions('PEDAGOGUE').includes('CADENCE_VIOLATION'),'adversarial Pedagogue cadence objection must survive');
assert.ok(infractions('PEDAGOGUE').includes('HUMAN_CONSEQUENCE_BROKEN_RETURN_PROMISE'),'unrepaired synthetic notice/return deficiency must remain explicit');
assert.equal(specialists.get('APERTURE')?.extensions?.epistemic_deficit?.deficit_class,'STRUCTURAL_RANK_DEFICIT','procedural SUPPORTED cannot erase a typed Aperture structural deficit');
assert.ok(infractions('ATLAS').includes('PREDECESSOR_CHAIN_UNVERIFIED_CUSTODY_FORK'),'synthetic route custody fork must survive separately from verified predecessor blobs');
assert.ok(infractions('ATLAS').includes('HOLD_HOLONOMY_HISTORY_PARITY_FAILED'),'holonomy parity hold must not be silently cleared');
assert.ok(infractions('FADT').includes('ILLEGAL_ACTION_GRANT_UNDER_ERASED_CONDITIONING'),'terminal projection cannot grant unconditioned adoption');
assert.ok(infractions('TEMPORAL_CUSTODIAN').includes('UNREFERENCED_RETRY_CHRONOLOGICAL_OBLIVION'),'the held relock must remain held');


const positivePath=process.argv[3];
assert.ok(positivePath,'independent healthy synthetic audit receipt required');
const good=JSON.parse(readFileSync(positivePath,'utf8'));
const goodSpec=JSON.parse(readFileSync('artifacts/atlas-after-hours/pr1735_dollhouse_positive_control.json','utf8'));
const adverseSpec=JSON.parse(readFileSync('artifacts/atlas-after-hours/pr1735_dollhouse_adversarial_input.json','utf8'));
assert.equal(goodSpec.control_designation,'BENIGN_POSITIVE_CONTROL_NOT_A_REAL_HUMAN_AUTHORIZATION');
assert.equal(adverseSpec.control_designation,'DELIBERATE_NEGATIVE_CONTROL_SOURCE_LINKED_NOT_REPOSITORY_DEFECT');
assert.match(goodSpec.task_scope,/SYNTHETIC_POSITIVE_CONTROL/);
assert.equal(goodSpec.domain_inputs.TEMPORAL_CUSTODIAN.phases.RELOCK.entry_id,'SYNTHETIC_CONTROL_RELOCK_NOT_REAL_APPROVAL');
for(const x of [r,good]){
  assert.equal(x.schema,'td613.dollhouse.skill-audit-receipt/v1.0');
  assert.equal(x.evidence_class,'SYNTHETIC_TEST_FIXTURE','synthetic role observations must not masquerade as actual source-code defects');
  assert.equal(x.source_revision,expected);
  assert.equal(x.source_revision_verified,true);
  assert.equal(x.git_commit_verified,true,'real executing Git commit required');
  assert.equal(x.exact_checkout_verified,true,'must execute exact source HEAD, not synthetic merge commit');
  assert.deepEqual([...x.roles_executed].sort(),['PEDAGOGUE','APERTURE','ATLAS','FADT','TEMPORAL_CUSTODIAN'].sort());
  assert.ok(x.evidence_manifest?.length>=8 && x.evidence_manifest.every(e=>e.verified && /^[a-f0-9]{64}$/.test(e.sha256)));
  assert.equal(x.empirical_replication_count,0);
  assert.equal(x.synthetic_vs_empirical,'SYNTHETIC');
  assert.equal(x.orchestrator?.human_closure_required,true);
  assert.equal(x.orchestrator?.release_authority,false);
  assert.equal(x.orchestrator?.deployment_authority,false);
}
assert.equal(good.orchestrator?.decision,'SUPPORTED','healthy five-specialist scenario must pass');
assert.deepEqual(good.detected_infractions,[],'healthy fixture must produce zero infractions');
assert.ok(good.specialist_findings.length===5 && good.specialist_findings.every(x=>x.verdict==='SUPPORTED' && (x.infractions??[]).length===0));
assert.equal(good.specialist_findings.find(x=>x.role==='APERTURE')?.extensions?.epistemic_deficit?.deficit_class,'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT','full-rank positive probe must not retain injected deficit');
console.log(JSON.stringify({contrastiveDollhouseEngineeringGate:'PASS',negative:'HELD_EXPECTED',positive:'SUPPORTED_EXPECTED',sourceSHA:expected,scientificClosure:'RESERVED',replication:0,releaseAuthority:false},null,2));

console.log(JSON.stringify({nativeAudit:true,sourceSHA:r.source_revision,decision:r.orchestrator.decision,roles:r.roles_executed,specialists:r.specialist_findings.map(x=>({role:x.role,verdict:x.verdict,status:x.status,infractions:x.infractions,extension_error:x.extensions?.extension_error??null,deficit:x.extensions?.epistemic_deficit?.deficit_class??null})),infractions:r.detected_infractions,replication:r.empirical_replication_count,release:r.orchestrator.release_authority},null,2));
