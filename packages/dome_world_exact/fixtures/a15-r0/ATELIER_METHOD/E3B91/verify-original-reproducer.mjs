/** Run the frozen B9 script unchanged, in disposable synthetic state. No protected inputs. */
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import {fileURLToPath} from 'node:url';import {spawnSync} from 'node:child_process';import {createHash} from 'node:crypto';import assert from 'node:assert/strict';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(process.argv[2]??path.resolve(here,'../../../../../..'));
const script=fs.readFileSync(path.join(here,'evidence/minimal-reproducer.mjs')),sha256=createHash('sha256').update(script).digest('hex');
assert.equal(sha256,'16282510387a92fdc0b24030a311321537233431a65b9136970222ea2cfa4a66');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'b91-review-repro-'));
try{
 const p=path.join(temp,'minimal-reproducer.mjs');fs.writeFileSync(p,script);
 const r=spawnSync(process.execPath,[p,root],{encoding:'utf8',timeout:20000});
 const f=JSON.parse(r.stdout);assert.equal(f.actual_product,f.expected_product);assert.equal(f.actual_receipt,f.expected_receipt);assert.equal(f.real_source_authority,false);assert.equal(f.scientific_authority,false);
 assert.equal(r.status,1);assert.match(r.stderr,/B91_ACCESSOR_REFUSED/);
 console.log(JSON.stringify({schema:'td613.b91-unchanged-reproducer-check/v1',script_sha256:sha256,source_root:root,original_exit:r.status,stdout:r.stdout,stderr:r.stderr,assertions:'PASS_EXPECTED_TYPED_REFUSAL',getter_zero_witness:'Separate request-conformance F02 test; unchanged script has no F02 catch.',evidence_class:'SYNTHETIC_REPLAY_ONLY',independent_empirical_replications:0}));
}finally{fs.rmSync(temp,{recursive:true,force:true})}
