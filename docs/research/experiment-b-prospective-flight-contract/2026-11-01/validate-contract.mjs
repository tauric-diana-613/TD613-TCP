// Static contract/capacity validation only. No process execution, network, inference or archive I/O.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {calculate} from './capacity-model.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const json=p=>JSON.parse(read(p));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(path.join(d,x.name)):[path.join(d,x.name)]);
const checks=[];
assert(read('DOSSIER.md').includes('Khona\u200clit-po'));
assert(read('README.md').includes('Khona\u200clit-po'));
const source=json('source-manifest.json');assert.equal(source.length,21);
for(const s of source){
 assert(!path.isAbsolute(s.snapshot)&&!s.snapshot.split('/').includes('..'));
 const b=fs.readFileSync(path.join(root,s.snapshot));
 assert.equal(b.length,s.bytes);assert.equal(sha(b),s.sha256);
 assert.equal(crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex'),s.git_blob_sha1);
 assert(s.url.includes(s.revision));
}
checks.push('21 exact-ref snapshots match SHA-256, byte lengths and Git blob SHA-1');
const review=json('sources/emergence-hq-review-5728990012.json');
assert.equal(review.id,5728990012);assert.equal(review.commit_id,'2d98d519535870bdf01b8cc9bd6b0328ad3ae70c');assert.equal(review.state,'COMMENTED');
checks.push('Independent filed review ID, exact qualification HEAD and COMMENTED scope preserved');
const assumptions=json('capacity-assumptions.json'),result=calculate(assumptions);
assert.deepEqual(result,json('capacity-results.json'));
assert.deepEqual(result.observed_qualification_totals,{a:72206,b:74144,review:13163});
const historical=result.rows.find(x=>x.id==='HISTORICAL_PLANNER_24x3');assert.deepEqual(historical.base_generation_calls,{a:144,b:72});
const full=result.rows.find(x=>x.id==='FULL_24');assert.deepEqual(full.base_generation_calls,{a:1800,b:1800});
assert.equal(full.hypothetical_replay_fits_input_cap,false);
for(const r of result.rows.filter(x=>x.schedule==='matched')){
 const count=(2*r.documents+2)*r.orders*r.factorial_cells*r.replications;
 assert.equal(r.base_generation_calls.a,count);assert.equal(r.base_generation_calls.b,count);
 assert.equal(r.authorized,false);
}
const m=assumptions.minimal_alternative_conditional_envelope;
assert.equal(m.maximum_attempts_including_transient_failures_per_arm*(m.maximum_total_input_per_attempt+m.maximum_total_output_per_attempt),m.maximum_generation_tokens_per_arm);
assert.equal(m.maximum_generation_tokens_per_arm+m.evaluation_tokens_allocated_per_arm,712960);
assert(m.maximum_total_tokens_per_arm<=720000);assert.equal(m.enforcement_demonstrated,false);
assert.equal(result.overall_full_flight_feasible_under_current_ceiling,false);
checks.push('Capacity arithmetic regenerated; historical 144/72, matched 1800/1800, replay overflow and conditional 712960 envelope agree');
const observed=json('sources/qualification/docs/research/experiment-b-codex-qualification/2026-11-01/receipts/reasoning-summary.json');
assert.equal(observed.ARM_2A_MODULAR.usage.input_tokens,assumptions.observations.arm_2a_input);
assert.equal(observed.ARM_2B_MATCHED_UNION.usage.output_tokens,assumptions.observations.arm_2b_output);
const matrix=json('gate-f-matrix.json'),contract=json('execution-contract.json');
assert.equal(matrix.current_token_ceiling_per_arm,720000);assert.equal(matrix.earlier_token_ceiling_per_arm,180000);
assert.equal(matrix.requirements.length,12);assert(matrix.requirements.every(x=>x.status==='HELD'&&!x.independently_verified));
assert.equal(matrix.gate_f,'HELD');assert.equal(matrix.gate_e,'HELD');assert.equal(matrix.human_closure,'RESERVED');
assert.equal(matrix.new_inference_calls,0);assert.equal(matrix.protected_archive_operations,0);assert.equal(matrix.execution_authorized,false);assert.equal(matrix.adopted_amendment,false);
assert.equal(contract.selected_effort,null);assert.equal(contract.operator_approvals.length,0);assert.equal(contract.execution_authorized,false);
const docket=read('OPERATOR_DECISIONS.md');
for(const r of matrix.requirements)for(const id of r.operator_decision_ids)assert(docket.includes('| '+id+' |'));
for(const arm of ['ARM_0_TRANSPORT','ARM_1_ARCHIVAL','ARM_2A_MODULAR','ARM_2B_MATCHED_UNION'])assert(contract.arm_ids.includes(arm));
checks.push('Historical usage, four arms, unresolved decision references and zero-authority Gate F/E states preserved');
const setting=json('operator-setting-and-budget-record.json');assert.equal(setting.outer_chat.effort,'High');assert.equal(setting.qualification_child_calls.reasoning_effort_requested,'medium');assert.equal(setting.qualification_child_calls.effective_served_effort_independently_attested,false);assert.equal(setting.budget.current_prospective,720000);assert.equal(setting.budget.retroactive_application,false);
checks.push('Operator outer-chat High, child Medium requests and corrected prospective budget remain distinct');
for(const f of walk(root)){
 const rel=path.relative(root,f).replaceAll('\\','/'),text=fs.readFileSync(f,'utf8');
 if(!rel.startsWith('sources/')){
  assert(!/[A-Z]:[\\/]+Users[\\/]+[^\s"']+/i.test(text),'Sensitive local path '+rel);
  assert(!/Bearer\s+[A-Za-z0-9._-]{20,}|sk-[A-Za-z0-9]{20,}/.test(text),'Credential-like value '+rel);
 }
 if(rel.endsWith('.mjs')&&!rel.startsWith('sources/'))assert(!/(?:from\s*['"](?:node:)?child_process|\bfetch\s*\(|\bspawn(?:Sync)?\s*\()/m.test(text),'Authored script might execute inference/network '+rel);
}
checks.push('Authored scripts use no process/network API; public artifact path/credential scan passed');
const manifestPath=path.join(root,'reproducibility-manifest.json');
if(fs.existsSync(manifestPath)){
 const manifest=json('reproducibility-manifest.json');
 for(const f of manifest.artifacts){assert(!path.isAbsolute(f.path)&&!f.path.split('/').includes('..'));assert.equal(sha(fs.readFileSync(path.join(root,f.path))),f.sha256);}
 const actual=walk(root).map(f=>path.relative(root,f).replaceAll('\\','/')).filter(p=>p!=='reproducibility-manifest.json').sort();
 assert.deepEqual(manifest.artifacts.map(f=>f.path).sort(),actual);
 checks.push('Reproducibility manifest matches all package artifact hashes and inventory');
}else assert(process.argv.includes('--bootstrap'),'Missing reproducibility manifest');
const output={status:'PASS',kind:'STATIC_CONTRACT_VALIDATION_NOT_FLIGHT_QUALIFICATION',checks,new_inference_calls:0,protected_archive_operations:0,current_prospective_token_ceiling_per_arm:720000,gate_f:'HELD',gate_e:'HELD',human_closure:'RESERVED',platform_enforcement_verified:false,independent_authority_self_certified:false};
if(process.argv.includes('--write'))fs.writeFileSync(path.join(root,'validation-result.json'),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(output,null,2));
